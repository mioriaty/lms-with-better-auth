import { envConfig } from '@/config';
import { requireAdmin } from '@/data-access/admin/require-admin';
import { multipartCompleteSchema } from '@/data-access/schemas/multipart-upload.schema';
import arcjet, { detectBot, fixedWindow } from '@/libs/utils/arcjet';
import { S3 } from '@/libs/utils/s3-client';
import { CompleteMultipartUploadCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';

const aj = arcjet
  .withRule(
    detectBot({
      mode: 'LIVE',
      allow: []
    })
  )
  .withRule(
    fixedWindow({
      mode: 'LIVE',
      window: '1m',
      max: 5
    })
  );

export async function POST(req: Request) {
  const session = await requireAdmin();

  try {
    const decision = await aj.protect(req, {
      fingerprint: session?.user.id as string
    });

    if (decision.isDenied()) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await req.json();
    const validation = multipartCompleteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const { key, uploadId, parts } = validation.data;

    const command = new CompleteMultipartUploadCommand({
      Bucket: envConfig.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts
      }
    });

    await S3.send(command);

    return NextResponse.json({ success: true, key });
  } catch (error) {
    console.error('Multipart complete error:', error);
    return NextResponse.json(
      { error: 'Failed to complete upload', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
