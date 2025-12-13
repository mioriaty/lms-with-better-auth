'use client';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/libs/components/ui/alert-dialog';
import { Button } from '@/libs/components/ui/button';
import { tryCatch } from '@/libs/utils/try-catch';
import { Loader2, TrashIcon } from 'lucide-react';
import { FC, useState, useTransition } from 'react';
import { toast } from 'sonner';

import { deleteChapterAction } from '@/app/admin/courses/[courseId]/edit/actions';

interface DeleteChapterProps {
  chapterId: string;
  courseId: string;
}

export const DeleteChapter: FC<DeleteChapterProps> = ({ chapterId, courseId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(deleteChapterAction({ chapterId, courseId }));

      if (error) {
        toast.error(error.message || 'An unexpected error occurred');
        return;
      }

      if (result.status === 'success') {
        toast.success(result.message);
        setIsOpen(false);
      } else if (result.status === 'error') {
        toast.error(result.message);
      }
    });
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size={'icon'}>
          <TrashIcon className="size-4" />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Chapter</AlertDialogTitle>
          <AlertDialogDescription>Are you sure you want to delete this chapter?</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button variant="destructive" disabled={isPending} onClick={handleDelete}>
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <TrashIcon className="size-4" />} Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
