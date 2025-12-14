'use server';

import { requireAdmin } from '@/data-access/admin/require-admin';
import { ApiResponse } from '@/data-access/models/api-response';
import { LessonSchemaType, lessonSchema } from '@/data-access/schemas/course.schema';
import { prisma } from '@/libs/utils/db';

export async function updateLessonAction(lessonId: string, values: LessonSchemaType): Promise<ApiResponse> {
  await requireAdmin();

  try {
    const validation = lessonSchema.safeParse(values);

    if (!validation.success) {
      return {
        status: 'error',
        message: 'Invalid form data'
      };
    }

    await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        title: validation.data.name,
        description: validation.data.description,
        thumbnailUrl: validation.data.thumbnailUrl,
        videoUrl: validation.data.videoUrl
      }
    });

    return {
      status: 'success',
      message: 'Lesson updated successfully'
    };
  } catch (error) {
    console.error(error);
    return {
      status: 'error',
      message: 'Failed to update lesson'
    };
  }
}
