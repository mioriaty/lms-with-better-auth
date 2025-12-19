'use server';

import { requireAdmin } from '@/data-access/admin/require-admin';
import { ApiResponse } from '@/data-access/models/api-response';
import { prisma } from '@/libs/utils/db';

export async function deleteCourseAction(courseId: string): Promise<ApiResponse> {
  await requireAdmin();

  try {
    await prisma.course.delete({
      where: { id: courseId }
    });

    return {
      status: 'success',
      message: 'Course deleted successfully'
    };
  } catch (error) {
    console.error(error);
    return {
      status: 'error',
      message: 'Failed to delete course'
    };
  }
}
