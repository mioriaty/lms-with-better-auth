import { envConfig } from '@/config';
import { requireAdmin } from '@/data-access/admin/require-admin';
import { fileUploadSchema } from '@/data-access/schemas/file-upload.schema';
import arcjet, { detectBot, fixedWindow } from '@/libs/utils/arcjet';
import { S3 } from '@/libs/utils/s3-client';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
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

    const validation = fileUploadSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { contentType, fileName, size } = validation.data;

    const uniqueKey = `${uuidv4()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: envConfig.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES,
      ContentType: contentType,
      ContentLength: size,
      Key: uniqueKey
    });

    const expiresIn6mins = 6 * 60; // 6 minutes

    const presignedUrl = await getSignedUrl(S3, command, { expiresIn: expiresIn6mins });

    const response = {
      presignedUrl,
      key: uniqueKey
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('S3 upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
