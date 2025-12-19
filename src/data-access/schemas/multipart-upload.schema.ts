import { z } from 'zod';

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
