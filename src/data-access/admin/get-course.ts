'use server';

import { requireAdmin } from '@/data-access/admin/require-admin';
import { prisma } from '@/libs/utils/db';
import { notFound } from 'next/navigation';

export async function getCourse(courseId: string) {
  await requireAdmin();

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      id: true,
      title: true,
      description: true,
      excerpt: true,
      category: true,
      slug: true,
      fileKey: true,
      price: true,
      duration: true,
      level: true,
      status: true,
      chapters: {
        select: {
          id: true,
          title: true,
          position: true,
          lessons: {
            select: {
              id: true,
              title: true,
              description: true,
              thumbnailUrl: true,
              videoUrl: true,
              position: true
            }
          }
        }
      }
    }
  });

  if (!course) {
    return notFound();
  }

  return course;
}

export type AdminDetailCourse = Awaited<ReturnType<typeof getCourse>>;
