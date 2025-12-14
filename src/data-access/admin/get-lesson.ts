import { requireAdmin } from '@/data-access/admin/require-admin';
import { prisma } from '@/libs/utils/db';
import { notFound } from 'next/navigation';

export const getLesson = async (lessonId: string) => {
  await requireAdmin();

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: {
      id: true,
      title: true,
      description: true,
      thumbnailUrl: true,
      videoUrl: true,
      position: true
    }
  });

  if (!lesson) {
    return notFound();
  }

  return lesson;
};

export type AdminDetailLesson = Awaited<ReturnType<typeof getLesson>>;
