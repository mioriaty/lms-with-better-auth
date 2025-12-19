import z from 'zod';

export const fileUploadSchema = z.object({
  contentType: z.string().min(1, { message: 'Content type is required' }),
  fileName: z.string().min(1, { message: 'File name is required' }),
  size: z
    .number()
    .min(1, { message: 'Size is required' })
    .max(1000 * 1024 * 1024, { message: 'File size must be less than 1000MB' }),
  isImage: z.boolean()
});

export type FileUploadSchemaType = z.infer<typeof fileUploadSchema>;
