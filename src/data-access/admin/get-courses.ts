import { requireAdmin } from '@/data-access/admin/require-admin';
import { prisma } from '@/libs/utils/db';

export async function getCourses() {
  await requireAdmin();

  const courses = await prisma.course.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    select: {
      id: true,
      title: true,
      excerpt: true,
      duration: true,
      level: true,
      price: true,
      status: true,
      fileKey: true,
      slug: true
    }
  });

  return courses;
}

export type AdminCourse = Awaited<ReturnType<typeof getCourses>>[number];
