import { envConfig } from '@/config';
import { requireAdmin } from '@/data-access/admin/require-admin';
import { multipartAbortSchema } from '@/data-access/schemas/multipart-upload.schema';
import arcjet, { detectBot, fixedWindow } from '@/libs/utils/arcjet';
import { S3 } from '@/libs/utils/s3-client';
import { AbortMultipartUploadCommand } from '@aws-sdk/client-s3';
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
      max: 10
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
    const validation = multipartAbortSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const { key, uploadId } = validation.data;

    const command = new AbortMultipartUploadCommand({
      Bucket: envConfig.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES,
      Key: key,
      UploadId: uploadId
    });

    await S3.send(command);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Multipart abort error:', error);
    return NextResponse.json(
      { error: 'Failed to abort upload', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
