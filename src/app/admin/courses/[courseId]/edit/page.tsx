import { getCourse } from '@/data-access/admin/get-course';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/libs/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/libs/components/ui/tabs';

import { CourseStructure } from '@/app/admin/courses/[courseId]/edit/_components/course-structure';
import { EditCourseForm } from '@/app/admin/courses/[courseId]/edit/_components/edit-course-form';

interface EditCoursePageProps {
  params: Promise<{ courseId: string }>;
}

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const { courseId } = await params;

  const course = await getCourse(courseId);

  return (
    <div>
      <h1 className="text-3xl font-bold">
        Edit Course: <span className="text-primary underline">{course.title}</span>
      </h1>

      <Tabs defaultValue="basic-info" className="w-full mt-6">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
          <TabsTrigger value="course-structure">Course Structure</TabsTrigger>
        </TabsList>

        <TabsContent value="basic-info">
          <Card>
            <CardHeader>
              <CardTitle>Basic Info</CardTitle>
              <CardDescription>Provide the necessary information to create a new course.</CardDescription>
            </CardHeader>

            <CardContent>
              <EditCourseForm course={course} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="course-structure">
          <Card>
            <CardHeader>
              <CardTitle>Course Structure</CardTitle>
              <CardDescription>Provide the necessary information to create a new course.</CardDescription>
            </CardHeader>

            <CardContent>
              <CourseStructure data={course} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
