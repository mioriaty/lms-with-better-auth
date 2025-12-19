import { envConfig } from '@/config';
import { requireAdmin } from '@/data-access/admin/require-admin';
import arcjet, { detectBot, fixedWindow } from '@/libs/utils/arcjet';
import { S3 } from '@/libs/utils/s3-client';
import { UploadPartCommand } from '@aws-sdk/client-s3';
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
      max: 50
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

    const formData = await req.formData();
    const key = formData.get('key') as string;
    const uploadId = formData.get('uploadId') as string;
    const partNumber = parseInt(formData.get('partNumber') as string);
    const part = formData.get('part') as File;

    if (!key || !uploadId || !partNumber || !part) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const arrayBuffer = await part.arrayBuffer();
    const command = new UploadPartCommand({
      Bucket: envConfig.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES,
      Key: key,
      UploadId: uploadId,
      PartNumber: partNumber,
      Body: new Uint8Array(arrayBuffer)
    });

    const response = await S3.send(command);

    if (!response.ETag) {
      return NextResponse.json({ error: 'No ETag returned from S3' }, { status: 500 });
    }

    return NextResponse.json({
      PartNumber: partNumber,
      ETag: response.ETag.replace(/"/g, '')
    });
  } catch (error) {
    console.error('Multipart upload part error:', error);
    return NextResponse.json(
      { error: 'Failed to upload part', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
