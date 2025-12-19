'use client';

import {
  CourseSchemaType,
  courseCategories,
  courseLevels,
  courseSchema,
  courseStatuses
} from '@/data-access/schemas/course.schema';
import { CourseLevel, CourseStatus } from '@/generated/prisma/enums';
import { FileUploader } from '@/libs/components/file-uploader';
import { RichEditor } from '@/libs/components/rich-editor';
import { Button, buttonVariants } from '@/libs/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/libs/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/libs/components/ui/form';
import { Input } from '@/libs/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/libs/components/ui/select';
import { Textarea } from '@/libs/components/ui/textarea';
import { useConfetti } from '@/libs/hooks/use-confetti';
import { slugify } from '@/libs/utils/slugify';
import { tryCatch } from '@/libs/utils/try-catch';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeftIcon, ArrowRightIcon, Loader2, SparklesIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { CreateCourseAction } from '@/app/admin/courses/create/actions';

export default function CourseCreationPage() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { triggerConfetti } = useConfetti();

  const form = useForm<CourseSchemaType>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: '',
      description: '',
      excerpt: '',
      category: 'Programming',
      slug: '',
      fileKey: '',
      price: 0,
      duration: 0,
      level: CourseLevel.BEGINNER,
      status: CourseStatus.DRAFT
    }
  });

  const onSubmit = (values: CourseSchemaType) => {
    startTransition(async () => {
      const { data, error } = await tryCatch(CreateCourseAction(values));
      if (error) {
        toast.error(error.message || 'An unexpected error occurred');
        return;
      }
      if (data.status === 'success') {
        toast.success(data.message);
        triggerConfetti();
        form.reset();
        router.push('/admin/courses');
      } else if (data.status === 'error') {
        toast.error(data.message);
      }
    });
  };

  const generateSlug = () => {
    const slug = slugify(form.getValues('title'));
    form.setValue('slug', slug, { shouldValidate: true });
  };

  return (
    <>
      <div className="flex items-center gap-4">
        <Link href="/admin/courses" className={buttonVariants({ variant: 'outline', size: 'icon' })}>
          <ArrowLeftIcon className="size-4" />
        </Link>

        <h1 className="text-2xl font-bold">Create Course</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Information</CardTitle>
          <CardDescription>Provide the necessary information to create a new course.</CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder='e.g. "Introduction to React"' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-4 items-end">
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder='e.g. "introduction-to-react"' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="button" onClick={generateSlug}>
                  Generate Slug <SparklesIcon className="ml-1 size-4" />
                </Button>
              </div>

              <FormField
                control={form.control}
                name="excerpt"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Excerpt</FormLabel>
                    <FormControl>
                      <Textarea
                        cols={30}
                        rows={4}
                        placeholder='e.g. "This course is about the basics of React"'
                        className="min-h-[120px]"
                        {...field}
                      />
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
                name="fileKey"
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {courseCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Level</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {courseLevels.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Duration (hours)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder='e.g. "10"' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Price (USD)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder='e.g. "99.99"' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {courseStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isPending}>
                Create Course{' '}
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
    </>
  );
}
