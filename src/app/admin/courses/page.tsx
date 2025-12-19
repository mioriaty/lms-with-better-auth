import { getCourses } from '@/data-access/admin/get-courses';
import { buttonVariants } from '@/libs/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/libs/components/ui/empty';
import { Folder, PlusIcon } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

import { AdminCourseCard, AdminCourseCardSkeleton } from '@/app/admin/courses/_components/admin-course-card';

export default function CoursePage() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Courses</h1>

        <Link href={'/admin/courses/create'} className={buttonVariants()}>
          Create Course
        </Link>
      </div>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <AdminCourseCardSkeleton key={index} />
            ))}
          </div>
        }
      >
        <RenderCourses />
      </Suspense>
    </>
  );
}

async function RenderCourses() {
  const courses = await getCourses();

  const renderEmptyState = () => {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Folder />
          </EmptyMedia>
          <EmptyTitle>No Courses Yet</EmptyTitle>
          <EmptyDescription>
            You haven&apos;t created any courses yet. Get started by creating your first course.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Link href={'/admin/courses/create'} className={buttonVariants()}>
            <PlusIcon className="size-4" />
            Create Course
          </Link>
        </EmptyContent>
      </Empty>
    );
  };

  if (courses.length === 0) {
    return renderEmptyState();
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {courses.map((course) => (
        <AdminCourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
