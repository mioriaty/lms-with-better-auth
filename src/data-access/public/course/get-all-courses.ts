import { CourseStatus } from '@/generated/prisma/client';
import { prisma } from '@/libs/utils/db';

export async function getAllCourses() {
  const courses = await prisma.course.findMany({
    where: {
      status: CourseStatus.PUBLISHED
    },
    orderBy: {
      createdAt: 'desc'
    },
    select: {
      title: true,
      price: true,
      excerpt: true,
      slug: true,
      fileKey: true,
      id: true,
      level: true,
      duration: true,
      category: true
    }
  });

  return courses;
}

export type PublicCourse = Awaited<ReturnType<typeof getAllCourses>>[number];
