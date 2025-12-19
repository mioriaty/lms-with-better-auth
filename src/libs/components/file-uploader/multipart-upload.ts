const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB per part
const PARALLEL_UPLOADS = 3; // Upload 3 parts simultaneously

interface UploadPartResult {
  PartNumber: number;
  ETag: string;
}

export async function uploadLargeFile(file: File, onProgress: (progress: number) => void): Promise<string> {
  const startTime = Date.now();
  const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);

  console.log('[Multipart Upload] Starting upload:', {
    fileName: file.name,
    fileSize: `${fileSizeMB} MB`,
    fileSizeBytes: file.size,
    contentType: file.type
  });

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
    const errorData = await initResponse.json().catch(() => ({}));
    console.error('[Multipart Upload] Init failed:', errorData);
    throw new Error(errorData.error || 'Failed to initialize upload');
  }

  const { uploadId, key } = await initResponse.json();

  if (!uploadId || !key) {
    throw new Error('Invalid response from server');
  }

  console.log('[Multipart Upload] Upload initialized:', {
    uploadId,
    key,
    fileName: file.name
  });

  try {
    // 2. Calculate chunks
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const uploadedParts: UploadPartResult[] = [];
    let uploadedBytes = 0;

    console.log('[Multipart Upload] Upload plan:', {
      totalChunks,
      chunkSize: `${(CHUNK_SIZE / (1024 * 1024)).toFixed(2)} MB`,
      parallelUploads: PARALLEL_UPLOADS,
      estimatedBatches: Math.ceil(totalChunks / PARALLEL_UPLOADS)
    });

    // 3. Upload parts in batches
    let batchNumber = 0;
    for (let i = 0; i < totalChunks; i += PARALLEL_UPLOADS) {
      batchNumber++;
      const batch = [];
      const partNumbers: number[] = [];

      for (let j = 0; j < PARALLEL_UPLOADS && i + j < totalChunks; j++) {
        const partNumber = i + j + 1;
        const start = (partNumber - 1) * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        partNumbers.push(partNumber);
        batch.push(uploadPart(key, uploadId, partNumber, chunk));
      }

      const batchStartTime = Date.now();
      console.log(
        `[Multipart Upload] Batch ${batchNumber}/${Math.ceil(totalChunks / PARALLEL_UPLOADS)}: Uploading parts`,
        {
          parts: partNumbers,
          partsCount: partNumbers.length
        }
      );

      // Upload batch in parallel
      const results = await Promise.all(batch);
      uploadedParts.push(...results);

      const batchDuration = ((Date.now() - batchStartTime) / 1000).toFixed(2);

      // Update progress
      uploadedBytes += results.reduce((sum) => sum + CHUNK_SIZE, 0);
      const progress = Math.min((uploadedBytes / file.size) * 100, 100);
      const uploadedMB = (uploadedBytes / (1024 * 1024)).toFixed(2);
      const remainingMB = ((file.size - uploadedBytes) / (1024 * 1024)).toFixed(2);

      console.log(`[Multipart Upload] Batch ${batchNumber} completed:`, {
        progress: `${progress.toFixed(2)}%`,
        uploadedBytes: `${uploadedMB} MB`,
        remainingBytes: `${remainingMB} MB`,
        duration: `${batchDuration}s`,
        partsCompleted: uploadedParts.length,
        totalParts: totalChunks
      });

      onProgress(progress);
    }

    // 4. Complete multipart upload
    console.log('[Multipart Upload] Completing upload:', {
      uploadId,
      key,
      totalParts: uploadedParts.length
    });

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
      const errorData = await completeResponse.json().catch(() => ({}));
      console.error('[Multipart Upload] Complete failed:', errorData);
      throw new Error(errorData.error || 'Failed to complete upload');
    }

    const completeData = await completeResponse.json();
    const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);
    const uploadSpeed = (parseFloat(fileSizeMB) / parseFloat(totalDuration)).toFixed(2);

    console.log('[Multipart Upload] Upload completed successfully:', {
      key: completeData.key || key,
      fileName: file.name,
      totalDuration: `${totalDuration}s`,
      uploadSpeed: `${uploadSpeed} MB/s`,
      totalParts: uploadedParts.length
    });

    return completeData.key || key;
  } catch (error) {
    const errorDuration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.error('[Multipart Upload] Upload failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      fileName: file.name,
      duration: `${errorDuration}s`,
      uploadId
    });

    // Abort upload on error
    console.log('[Multipart Upload] Aborting upload...');
    await fetch('/api/s3/multipart/abort', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, uploadId })
    })
      .then(() => {
        console.log('[Multipart Upload] Upload aborted successfully');
      })
      .catch((abortError) => {
        console.error('[Multipart Upload] Failed to abort upload:', abortError);
      });

    throw error;
  }
}

async function uploadPart(key: string, uploadId: string, partNumber: number, chunk: Blob): Promise<UploadPartResult> {
  const partStartTime = Date.now();
  const chunkSizeMB = (chunk.size / (1024 * 1024)).toFixed(2);

  // Upload part through server proxy to avoid CORS ETag header issues
  const formData = new FormData();
  formData.append('key', key);
  formData.append('uploadId', uploadId);
  formData.append('partNumber', partNumber.toString());
  formData.append('part', chunk);

  const uploadResponse = await fetch('/api/s3/multipart/upload-part', {
    method: 'POST',
    body: formData
  });

  if (!uploadResponse.ok) {
    const errorData = await uploadResponse.json().catch(() => ({}));
    console.error(`[Multipart Upload] Part ${partNumber} - Upload failed:`, errorData);
    throw new Error(errorData.error || `Failed to upload part ${partNumber}`);
  }

  const result = await uploadResponse.json();

  if (!result.ETag) {
    throw new Error(`No ETag returned for part ${partNumber}`);
  }

  const partDuration = ((Date.now() - partStartTime) / 1000).toFixed(2);
  const partSpeed = (parseFloat(chunkSizeMB) / parseFloat(partDuration)).toFixed(2);

  console.log(`[Multipart Upload] Part ${partNumber} completed:`, {
    size: `${chunkSizeMB} MB`,
    duration: `${partDuration}s`,
    speed: `${partSpeed} MB/s`,
    etag: result.ETag
  });

  return {
    PartNumber: result.PartNumber || partNumber,
    ETag: result.ETag
  };
}
