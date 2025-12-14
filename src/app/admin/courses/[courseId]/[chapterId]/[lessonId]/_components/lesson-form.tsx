'use client';

import { AdminDetailLesson } from '@/data-access/admin/get-lesson';
import { LessonSchemaType, lessonSchema } from '@/data-access/schemas/course.schema';
import { FileUploader } from '@/libs/components/file-uploader';
import { RichEditor } from '@/libs/components/rich-editor';
import { Button, buttonVariants } from '@/libs/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/libs/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/libs/components/ui/form';
import { Input } from '@/libs/components/ui/input';
import { tryCatch } from '@/libs/utils/try-catch';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeftIcon, ArrowRightIcon, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { FC, useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { updateLessonAction } from '@/app/admin/courses/[courseId]/[chapterId]/[lessonId]/actions';

interface LessonFormProps {
  data: AdminDetailLesson;
  chapterId: string;
  courseId: string;
}

export const LessonForm: FC<LessonFormProps> = ({ data, chapterId, courseId }) => {
  const [isPending, startTransition] = useTransition();
  const form = useForm<LessonSchemaType>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      name: data.title,
      description: data.description || '',
      chapterId,
      courseId,
      thumbnailUrl: data.thumbnailUrl || '',
      videoUrl: data.videoUrl || ''
    }
  });

  useEffect(() => {
    if (!data) return;
    form.reset({
      name: data.title,
      description: data.description || '',
      chapterId,
      courseId,
      thumbnailUrl: data.thumbnailUrl || '',
      videoUrl: data.videoUrl || ''
    });
  }, [data, chapterId, courseId]);

  const onSubmit = (values: LessonSchemaType) => {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(updateLessonAction(data.id, values));

      if (error) {
        toast.error(error.message || 'An unexpected error occurred');
        return;
      }

      if (result.status === 'success') {
        toast.success(result.message);
      } else if (result.status === 'error') {
        toast.error(result.message);
      }
    });
  };

  return (
    <div>
      <Link
        href={`/admin/courses/${courseId}/edit`}
        className={buttonVariants({ variant: 'outline', className: 'mb-6' })}
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to Lesson
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Lesson Information</CardTitle>
          <CardDescription>Provide the necessary information to create a new lesson.</CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder='e.g. "Introduction to React"' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <RichEditor onUpdate={field.onChange} content={field.value} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="thumbnailUrl"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Thumbnail</FormLabel>
                    <FormControl>
                      <FileUploader value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="videoUrl"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Video</FormLabel>
                    <FormControl>
                      <FileUploader fileTypeAccepted="video" value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isPending}>
                Update Lesson
                {isPending ? (
                  <Loader2 className="ml-1 size-4 animate-spin" />
                ) : (
                  <ArrowRightIcon className="ml-1 size-4" />
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
