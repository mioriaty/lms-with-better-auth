import { getAllCourses } from '@/data-access/public/course/get-all-courses';
import { Suspense } from 'react';

import { PublicCourseCard } from '@/app/(public)/_components/public-course-card';

export default function PublicCoursesPage() {
  return (
    <div className="mt-5">
      <div className="flex flex-col gap-2 mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tighter">Explore Our Courses</h1>
        <p className="text-muted-foreground">
          Discover a wide range of courses designed to help you learn new skills and advance your career.
        </p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <RenderCourses />
      </Suspense>
    </div>
  );
}

async function RenderCourses() {
  'use cache';
  const courses = await getAllCourses();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {courses.map((course) => (
        <PublicCourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
