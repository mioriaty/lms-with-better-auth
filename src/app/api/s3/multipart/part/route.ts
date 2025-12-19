import { envConfig } from '@/config';
import { requireAdmin } from '@/data-access/admin/require-admin';
import { multipartPartSchema } from '@/data-access/schemas/multipart-upload.schema';
import arcjet, { detectBot, fixedWindow } from '@/libs/utils/arcjet';
import { S3 } from '@/libs/utils/s3-client';
import { UploadPartCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
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
      max: 20
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
    const validation = multipartPartSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const { key, uploadId, partNumber } = validation.data;

    const command = new UploadPartCommand({
      Bucket: envConfig.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES,
      Key: key,
      UploadId: uploadId,
      PartNumber: partNumber
    });

    const presignedUrl = await getSignedUrl(S3, command, {
      expiresIn: 60 * 60 // 1 hour for each part
    });

    return NextResponse.json({ presignedUrl, partNumber });
  } catch (error) {
    console.error('Multipart part error:', error);
    return NextResponse.json(
      { error: 'Failed to get part URL', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
