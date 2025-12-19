import { envConfig } from '@/config';
import { requireAdmin } from '@/data-access/admin/require-admin';
import { multipartInitSchema } from '@/data-access/schemas/multipart-upload.schema';
import arcjet, { detectBot, fixedWindow } from '@/libs/utils/arcjet';
import { S3 } from '@/libs/utils/s3-client';
import { CreateMultipartUploadCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

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
    const validation = multipartInitSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const { fileName, contentType, fileSize } = validation.data;
    const key = `${uuidv4()}-${fileName}`;

    const command = new CreateMultipartUploadCommand({
      Bucket: envConfig.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES,
      Key: key,
      ContentType: contentType
    });

    const response = await S3.send(command);

    if (!response.UploadId) {
      return NextResponse.json({ error: 'Failed to initiate upload' }, { status: 500 });
    }

    return NextResponse.json({
      uploadId: response.UploadId,
      key,
      fileSize
    });
  } catch (error) {
    console.error('Multipart init error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate upload', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
