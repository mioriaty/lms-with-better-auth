import { envConfig } from '@/config';
import { requireAdmin } from '@/data-access/admin/require-admin';
import arcjet, { detectBot, fixedWindow } from '@/libs/utils/arcjet';
import { S3 } from '@/libs/utils/s3-client';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
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

export async function DELETE(req: Request) {
  const session = await requireAdmin();

  try {
    const decision = await aj.protect(req, {
      fingerprint: session?.user.id as string
    });

    if (decision.isDenied()) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await req.json();

    const { key } = body;

    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 });
    }

    const command = new DeleteObjectCommand({
      Bucket: envConfig.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES,
      Key: key
    });

    await S3.send(command);

    return NextResponse.json({ message: 'File deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('S3 delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
