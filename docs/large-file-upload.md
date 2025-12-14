# Large File Upload Implementation Guide

## Overview

Hướng dẫn chi tiết để nâng cấp hệ thống upload file hiện tại để hỗ trợ upload file lớn (>100MB) một cách hiệu quả sử dụng AWS S3 Multipart Upload.

## Current Implementation Analysis

### Ưu điểm của implementation hiện tại:
- ✅ Presigned URL - client upload trực tiếp lên S3
- ✅ Progress tracking với XMLHttpRequest
- ✅ Security với Arcjet rate limiting
- ✅ Clean separation: client → presigned URL → S3

### Vấn đề cần fix:
1. **Schema mismatch**: `file-upload.schema.ts` giới hạn 5MB nhưng frontend cho phép 100MB
2. **No resume capability**: Nếu mất kết nối phải upload lại từ đầu
3. **Timeout risk**: Presigned URL chỉ valid 6 phút
4. **Memory inefficient**: Load toàn bộ file vào memory

---

## Solution: AWS S3 Multipart Upload

### Khi nào cần dùng Multipart Upload?

| File Size | Method | Reason |
|-----------|--------|--------|
| < 50MB | Single upload (current) | Đơn giản, hiệu quả |
| 50-500MB | Multipart upload | Resumable, parallel |
| > 500MB | Multipart + streaming | Memory efficient |

### Multipart Upload Workflow

```
┌─────────┐     1. Initiate      ┌─────────┐
│ Client  │ ──────────────────> │ Server  │
└─────────┘                      └─────────┘
     │                                │
     │                           2. CreateMultipartUpload
     │                                │
     │         uploadId + key         │
     │ <──────────────────────────────┘
     │
     │    3. Upload parts (parallel)
     │    ┌─────────────────────┐
     ├───>│ Part 1 (5MB)        │───> S3
     ├───>│ Part 2 (5MB)        │───> S3
     ├───>│ Part 3 (remaining)  │───> S3
     └────┴─────────────────────┘
     │
     │    4. Complete upload
     └──────────────────────────────> Server
                                       │
                                  5. CompleteMultipartUpload
                                       │
                                       ↓
                                      S3
```

---

## Implementation Steps

### Step 1: Quick Fix (Immediate)

Fix schema mismatch trước:

```typescript
// src/data-access/schemas/file-upload.schema.ts
export const fileUploadSchema = z.object({
  contentType: z.string().min(1),
  fileName: z.string().min(1),
  size: z
    .number()
    .min(1)
    .max(100 * 1024 * 1024), // ← Tăng lên 100MB
  isImage: z.boolean()
});
```

Tăng presigned URL timeout:

```typescript
// src/app/api/s3/upload/route.ts
const expiresIn = validation.data.size > 50 * 1024 * 1024
  ? 30 * 60  // 30 mins for large files
  : 6 * 60;  // 6 mins for small files
```

### Step 2: Create Multipart Upload Schema

```typescript
// src/data-access/schemas/multipart-upload.schema.ts
import z from 'zod';

export const multipartInitSchema = z.object({
  fileName: z.string().min(1),
  contentType: z.string().min(1),
  fileSize: z.number().min(1)
});

export const multipartPartSchema = z.object({
  key: z.string().min(1),
  uploadId: z.string().min(1),
  partNumber: z.number().min(1).max(10000)
});

export const multipartCompleteSchema = z.object({
  key: z.string().min(1),
  uploadId: z.string().min(1),
  parts: z.array(
    z.object({
      PartNumber: z.number(),
      ETag: z.string()
    })
  )
});

export const multipartAbortSchema = z.object({
  key: z.string().min(1),
  uploadId: z.string().min(1)
});
```

### Step 3: Create Server API Routes

#### 3.1 Initialize Multipart Upload

```typescript
// src/app/api/s3/multipart/init/route.ts
import { envConfig } from '@/config';
import { requireAdmin } from '@/data-access/admin/require-admin';
import { multipartInitSchema } from '@/data-access/schemas/multipart-upload.schema';
import { S3 } from '@/libs/utils/s3-client';
import { CreateMultipartUploadCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  await requireAdmin();

  try {
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

    return NextResponse.json({
      uploadId: response.UploadId,
      key,
      fileSize
    });
  } catch (error) {
    console.error('Multipart init error:', error);
    return NextResponse.json({ error: 'Failed to initiate upload' }, { status: 500 });
  }
}
```

#### 3.2 Get Presigned URL for Part Upload

```typescript
// src/app/api/s3/multipart/part/route.ts
import { envConfig } from '@/config';
import { requireAdmin } from '@/data-access/admin/require-admin';
import { multipartPartSchema } from '@/data-access/schemas/multipart-upload.schema';
import { S3 } from '@/libs/utils/s3-client';
import { UploadPartCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  await requireAdmin();

  try {
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
    return NextResponse.json({ error: 'Failed to get part URL' }, { status: 500 });
  }
}
```

#### 3.3 Complete Multipart Upload

```typescript
// src/app/api/s3/multipart/complete/route.ts
import { envConfig } from '@/config';
import { requireAdmin } from '@/data-access/admin/require-admin';
import { multipartCompleteSchema } from '@/data-access/schemas/multipart-upload.schema';
import { S3 } from '@/libs/utils/s3-client';
import { CompleteMultipartUploadCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  await requireAdmin();

  try {
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
    return NextResponse.json({ error: 'Failed to complete upload' }, { status: 500 });
  }
}
```

#### 3.4 Abort Multipart Upload (Cleanup)

```typescript
// src/app/api/s3/multipart/abort/route.ts
import { envConfig } from '@/config';
import { requireAdmin } from '@/data-access/admin/require-admin';
import { multipartAbortSchema } from '@/data-access/schemas/multipart-upload.schema';
import { S3 } from '@/libs/utils/s3-client';
import { AbortMultipartUploadCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  await requireAdmin();

  try {
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
    return NextResponse.json({ error: 'Failed to abort upload' }, { status: 500 });
  }
}
```

### Step 4: Update Client-side Upload Logic

```typescript
// src/libs/components/file-uploader/multipart-upload.ts
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB per part
const PARALLEL_UPLOADS = 3; // Upload 3 parts simultaneously

interface UploadPartResult {
  PartNumber: number;
  ETag: string;
}

export async function uploadLargeFile(
  file: File,
  onProgress: (progress: number) => void
): Promise<string> {
  // 1. Initialize multipart upload
  const initResponse = await fetch('/api/s3/multipart/init', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type,
      fileSize: file.size
    })
  });

  if (!initResponse.ok) {
    throw new Error('Failed to initialize upload');
  }

  const { uploadId, key } = await initResponse.json();

  try {
    // 2. Calculate chunks
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const uploadedParts: UploadPartResult[] = [];
    let uploadedBytes = 0;

    // 3. Upload parts in batches
    for (let i = 0; i < totalChunks; i += PARALLEL_UPLOADS) {
      const batch = [];

      for (let j = 0; j < PARALLEL_UPLOADS && i + j < totalChunks; j++) {
        const partNumber = i + j + 1;
        const start = (partNumber - 1) * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        batch.push(uploadPart(key, uploadId, partNumber, chunk));
      }

      // Upload batch in parallel
      const results = await Promise.all(batch);
      uploadedParts.push(...results);

      // Update progress
      uploadedBytes += results.reduce((sum, _) => sum + CHUNK_SIZE, 0);
      const progress = Math.min((uploadedBytes / file.size) * 100, 100);
      onProgress(progress);
    }

    // 4. Complete multipart upload
    const completeResponse = await fetch('/api/s3/multipart/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key,
        uploadId,
        parts: uploadedParts.sort((a, b) => a.PartNumber - b.PartNumber)
      })
    });

    if (!completeResponse.ok) {
      throw new Error('Failed to complete upload');
    }

    return key;
  } catch (error) {
    // Abort upload on error
    await fetch('/api/s3/multipart/abort', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, uploadId })
    }).catch(console.error);

    throw error;
  }
}

async function uploadPart(
  key: string,
  uploadId: string,
  partNumber: number,
  chunk: Blob
): Promise<UploadPartResult> {
  // Get presigned URL for this part
  const partResponse = await fetch('/api/s3/multipart/part', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, uploadId, partNumber })
  });

  if (!partResponse.ok) {
    throw new Error(`Failed to get URL for part ${partNumber}`);
  }

  const { presignedUrl } = await partResponse.json();

  // Upload the part
  const uploadResponse = await fetch(presignedUrl, {
    method: 'PUT',
    body: chunk
  });

  if (!uploadResponse.ok) {
    throw new Error(`Failed to upload part ${partNumber}`);
  }

  const etag = uploadResponse.headers.get('ETag');
  if (!etag) {
    throw new Error(`No ETag returned for part ${partNumber}`);
  }

  return {
    PartNumber: partNumber,
    ETag: etag.replace(/"/g, '') // Remove quotes from ETag
  };
}
```

### Step 5: Update FileUploader Component

```typescript
// src/libs/components/file-uploader/file-uploader.tsx
import { uploadLargeFile } from './multipart-upload';

// Trong uploadFile callback:
const uploadFile = useCallback(
  async (file: File) => {
    setFileState((prev) => ({ ...prev, uploading: true, progress: 0 }));

    try {
      const LARGE_FILE_THRESHOLD = 50 * 1024 * 1024; // 50MB
      let key: string;

      if (file.size >= LARGE_FILE_THRESHOLD) {
        // Use multipart upload for large files
        key = await uploadLargeFile(file, (progress) => {
          setFileState((prev) => ({ ...prev, progress }));
        });
      } else {
        // Use existing single upload for small files
        key = await uploadSmallFile(file);
      }

      setFileState((prev) => ({
        ...prev,
        progress: 100,
        uploading: false,
        key
      }));

      onChange?.(key);
      toast.success('File uploaded successfully.');
    } catch (error) {
      toast.error('Upload failed');
      setFileState((prev) => ({
        ...prev,
        uploading: false,
        progress: 0,
        error: true
      }));
    }
  },
  [fileTypeAccepted, onChange]
);
```

---

## Testing Checklist

- [ ] Upload file < 5MB (single upload)
- [ ] Upload file 50-100MB (multipart upload)
- [ ] Upload file > 100MB (multipart upload)
- [ ] Test progress tracking accuracy
- [ ] Test network interruption handling
- [ ] Test concurrent uploads (multiple files)
- [ ] Test abort/cancel upload
- [ ] Verify S3 cleanup (no orphaned multipart uploads)
- [ ] Load test with 10+ concurrent large uploads

---

## Performance Optimization

### 1. Parallel Part Uploads
- Current: 3 parts simultaneously
- Increase to 5-10 for faster upload (cân nhắc bandwidth)

### 2. Chunk Size Optimization
```typescript
// Điều chỉnh chunk size theo file size
const getChunkSize = (fileSize: number) => {
  if (fileSize < 50 * 1024 * 1024) return 5 * 1024 * 1024;    // 5MB
  if (fileSize < 500 * 1024 * 1024) return 10 * 1024 * 1024;  // 10MB
  return 20 * 1024 * 1024;                                      // 20MB
};
```

### 3. Resume Upload (Advanced)
Store upload state trong IndexedDB để resume sau khi refresh page:

```typescript
interface UploadState {
  uploadId: string;
  key: string;
  uploadedParts: UploadPartResult[];
  totalParts: number;
}

// Save state
await saveUploadState(file.name, state);

// Resume on retry
const savedState = await getUploadState(file.name);
if (savedState) {
  // Continue from last uploaded part
  startPartNumber = savedState.uploadedParts.length + 1;
}
```

---

## S3 Bucket Configuration

Đảm bảo S3 bucket có CORS config đúng:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
    "ExposeHeaders": ["ETag"]
  }
]
```

**Note**: `ExposeHeaders: ["ETag"]` rất quan trọng cho multipart upload!

---

## Monitoring & Cleanup

### S3 Lifecycle Rule
Tạo lifecycle rule để auto-delete incomplete multipart uploads:

```
Rule name: cleanup-incomplete-uploads
Scope: All objects
Lifecycle rule actions:
  - Delete expired delete markers or incomplete multipart uploads
Days after initiation: 7
```

### CloudWatch Metrics
Monitor:
- Upload success rate
- Average upload time by file size
- Failed multipart uploads count
- S3 request costs

---

## Cost Estimation

**Multipart Upload Costs:**
- Initiate: $0.005 per 1,000 requests
- Upload Part: $0.005 per 1,000 requests
- Complete: $0.005 per 1,000 requests

**Example:** 100MB file = 20 parts
- Cost: ~$0.00011 per upload (negligible)

**Storage:**
- S3 Standard: $0.023 per GB/month
- 100GB video storage: ~$2.30/month

---

## Migration Path

### Phase 1: Quick Fix (1 day)
- [ ] Fix schema mismatch
- [ ] Increase presigned URL timeout
- [ ] Deploy and test

### Phase 2: Multipart Upload (1 week)
- [ ] Create schemas
- [ ] Implement API routes
- [ ] Add client-side logic
- [ ] Testing

### Phase 3: Optimization (1 week)
- [ ] Add resume capability
- [ ] Parallel upload tuning
- [ ] Add monitoring
- [ ] Performance testing

---

## Alternative Solutions

### Option A: AWS SDK for JavaScript v3 (Recommended)
Dùng `@aws-sdk/lib-storage` - handles multipart automatically:

```typescript
import { Upload } from "@aws-sdk/lib-storage";
import { S3Client } from "@aws-sdk/client-s3";

const upload = new Upload({
  client: new S3Client({}),
  params: {
    Bucket: "bucket",
    Key: "key",
    Body: file
  }
});

upload.on("httpUploadProgress", (progress) => {
  console.log(progress);
});

await upload.done();
```

**Pros:** Tự động handle multipart, retry, progress
**Cons:** Cần AWS credentials trên client (không secure)

### Option B: Uppy.io
Full-featured upload library:

```typescript
import Uppy from '@uppy/core';
import AwsS3Multipart from '@uppy/aws-s3-multipart';

const uppy = new Uppy()
  .use(AwsS3Multipart, {
    companionUrl: '/api/s3/multipart'
  });
```

**Pros:** UI included, resumable, nhiều features
**Cons:** Bundle size lớn, learning curve

---

## References

- [AWS S3 Multipart Upload](https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
- [Uppy File Uploader](https://uppy.io/docs/aws-s3-multipart/)
- [Best Practices for Multipart Upload](https://aws.amazon.com/premiumsupport/knowledge-center/s3-multipart-upload-cli/)

---

## Contact & Support

Khi implement, lưu ý:
1. Test kỹ với nhiều file sizes khác nhau
2. Monitor S3 costs trong giai đoạn đầu
3. Setup CloudWatch alarms cho failed uploads
4. Document API endpoints cho team

**Last Updated:** 2025-01-13
