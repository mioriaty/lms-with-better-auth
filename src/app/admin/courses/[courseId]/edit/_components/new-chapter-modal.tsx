'use client';

import { ChapterSchemaType, chapterSchema } from '@/data-access/schemas/course.schema';
import { Button } from '@/libs/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/libs/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/libs/components/ui/form';
import { Input } from '@/libs/components/ui/input';
import { tryCatch } from '@/libs/utils/try-catch';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, PlusIcon } from 'lucide-react';
import { FC, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { createChapterAction } from '@/app/admin/courses/[courseId]/edit/actions';

interface NewChapterModalProps {
  courseId: string;
}

export const NewChapterModal: FC<NewChapterModalProps> = ({ courseId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<ChapterSchemaType>({
    resolver: zodResolver(chapterSchema),
    defaultValues: {
      name: '',
      courseId
    }
  });

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
    }
    setIsOpen(open);
  };

  const onSubmit = (values: ChapterSchemaType) => {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(createChapterAction(values));

      if (error) {
        toast.error(error.message || 'An unexpected error occurred');
        return;
      }

      if (result.status === 'success') {
        toast.success(result.message);
        form.reset();
        setIsOpen(false);
      } else if (result.status === 'error') {
        toast.error(result.message);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <PlusIcon className="size-4" />
          New Chapter
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Chapter</DialogTitle>
          <DialogDescription>Create a new chapter for the course.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. 'Chapter 1'" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button disabled={isPending} type="submit">
                {isPending ? <Loader2 className="size-4 animate-spin" /> : <PlusIcon className="size-4" />} Create
                Chapter
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
