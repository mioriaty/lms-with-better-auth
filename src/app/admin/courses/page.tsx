import { getCourses } from '@/data-access/admin/get-courses';
import { buttonVariants } from '@/libs/components/ui/button';
import Link from 'next/link';

import { AdminCourseCard } from '@/app/admin/courses/_components/admin-course-card';

export default async function CoursePage() {
  const courses = await getCourses();

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Courses</h1>

        <Link href={'/admin/courses/create'} className={buttonVariants()}>
          Create Course
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => (
          <AdminCourseCard key={course.id} course={course} />
        ))}
      </div>
    </>
  );
}
