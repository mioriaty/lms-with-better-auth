'use client';

import { Button, buttonVariants } from '@/libs/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/libs/components/ui/card';
import { tryCatch } from '@/libs/utils/try-catch';
import { Loader2, TrashIcon } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'sonner';

import { deleteCourseAction } from '@/app/admin/courses/[courseId]/delete/actions';

export default function DeleteCoursePage() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { courseId } = useParams<{ courseId: string }>();

  const handleDelete = () => {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(deleteCourseAction(courseId));

      if (error) {
        toast.error(error.message || 'An unexpected error occurred');
        return;
      }

      if (result.status === 'success') {
        toast.success(result.message);
        router.push(`/admin/courses`);
      } else if (result.status === 'error') {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="max-w-xl mx-auto w-full">
      <Card>
        <CardHeader>
          <CardTitle>Are you sure you want to delete this course?</CardTitle>
          <CardDescription>This action cannot be undone.</CardDescription>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-muted-foreground">
            This will delete the course and all of its chapters and lessons.
          </p>
        </CardContent>

        <CardFooter className="flex justify-end gap-2">
          <Link
            href={`/admin/courses`}
            className={buttonVariants({
              variant: 'outline'
            })}
          >
            Cancel
          </Link>

          <Button variant="destructive" disabled={isPending} onClick={handleDelete}>
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <TrashIcon className="size-4" />} Delete Course
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
