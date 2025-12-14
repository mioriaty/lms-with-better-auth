import { getLesson } from '@/data-access/admin/get-lesson';

import { LessonForm } from '@/app/admin/courses/[courseId]/[chapterId]/[lessonId]/_components/lesson-form';

interface LessonPageProps {
  params: Promise<{ courseId: string; chapterId: string; lessonId: string }>;
}

export default async function LessonDetailPage({ params }: LessonPageProps) {
  const { lessonId, chapterId, courseId } = await params;

  const lesson = await getLesson(lessonId);

  return <LessonForm data={lesson} chapterId={chapterId} courseId={courseId} />;
}
