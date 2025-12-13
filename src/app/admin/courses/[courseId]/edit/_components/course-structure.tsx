'use client';

import { AdminDetailCourse } from '@/data-access/admin/get-course';
import { Button } from '@/libs/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/libs/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/libs/components/ui/collapsible';
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  rectIntersection,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { ChevronDownIcon, ChevronRightIcon, FileText, GripVerticalIcon, PlusIcon, TrashIcon } from 'lucide-react';
import Link from 'next/link';
import { FC, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { SortableItem } from '@/app/admin/courses/[courseId]/edit/_components/sortable-item';
import { reorderChapters, reorderLessons } from '@/app/admin/courses/[courseId]/edit/actions';

interface CourseStructureProps {
  data: AdminDetailCourse;
}

export const CourseStructure: FC<CourseStructureProps> = ({ data }) => {
  const initialItems =
    data.chapters.map((chapter) => ({
      id: chapter.id,
      title: chapter.title,
      order: chapter.position,
      isOpen: true, // default chapters are open
      lessons: chapter.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        order: lesson.position
      }))
    })) || [];

  const [items, setItems] = useState(initialItems);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  useEffect(() => {
    setItems((prevItems) => {
      const updatedItems =
        data.chapters.map((chapter) => ({
          id: chapter.id,
          title: chapter.title,
          order: chapter.position,
          isOpen: prevItems.find((item) => item.id === chapter.id)?.isOpen ?? true,
          lessons: chapter.lessons.map((lesson) => ({
            id: lesson.id,
            title: lesson.title,
            order: lesson.position
          }))
        })) || [];
      return updatedItems;
    });
  }, [data]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const activeId = active.id.toString();
    const overId = over.id.toString();
    const activeType = active.data.current?.type as 'chapter' | 'lesson';
    const overType = over.data.current?.type as 'chapter' | 'lesson';
    const courseId = data.id;

    if (activeType === 'chapter') {
      let targetChapterId: string | null = null;

      if (overType === 'chapter') {
        targetChapterId = overId;
      } else if (overType === 'lesson') {
        targetChapterId = over.data.current?.chapterId ?? null;
      }

      if (!targetChapterId) {
        toast.error('Cannot move chapter to a different course');
        return;
      }

      const oldIndex = items.findIndex((chapter) => chapter.id === activeId);
      const newIndex = items.findIndex((chapter) => chapter.id === targetChapterId);

      if (oldIndex === -1 || newIndex === -1) {
        toast.error('Cannot move chapter to a different position');
        return;
      }

      const reorderedLocalChapters = arrayMove(items, oldIndex, newIndex);

      const updatedChaptersForState = reorderedLocalChapters.map((chapter, index) => ({
        ...chapter,
        order: index + 1
      }));

      const previousChapters = [...items];

      setItems(updatedChaptersForState);

      if (courseId) {
        const chaptersToUpdate = updatedChaptersForState.map((chapter) => ({
          id: chapter.id,
          position: chapter.order
        }));

        const reorderChaptersPromise = () => reorderChapters(courseId, chaptersToUpdate);

        toast.promise(reorderChaptersPromise, {
          loading: 'Reordering chapters...',
          success: (result) => {
            if (result.status === 'error') return result.message;
            throw new Error(result.message);
          },
          error: () => {
            setItems(previousChapters);
            return 'Failed to reorder chapters';
          }
        });
      }
      return;
    }

    if (activeType === 'lesson' && overType === 'lesson') {
      const chapterId = active.data.current?.chapterId;
      const overChapterId = over.data.current?.chapterId;

      if (!chapterId || chapterId !== overChapterId) {
        toast.error('Cannot move lesson to a different chapter');
        return;
      }

      const chapterIndex = items.findIndex((chapter) => chapter.id === chapterId);

      if (chapterIndex === -1) {
        toast.error('Cannot move lesson to a different chapter');
        return;
      }

      const chapterToUpdate = items[chapterIndex];
      const oldLessonIndex = chapterToUpdate.lessons.findIndex((lesson) => lesson.id === activeId);
      const newLessonIndex = chapterToUpdate.lessons.findIndex((lesson) => lesson.id === overId);

      if (oldLessonIndex === -1 || newLessonIndex === -1) {
        toast.error('Cannot move lesson to a different position');
        return;
      }

      const reorderedLocalLessons = arrayMove(chapterToUpdate.lessons, oldLessonIndex, newLessonIndex);

      const updatedLessonsForState = reorderedLocalLessons.map((lesson, index) => ({
        ...lesson,
        order: index + 1
      }));

      const newItems = [...items];
      newItems[chapterIndex] = {
        ...chapterToUpdate,
        lessons: updatedLessonsForState
      };

      const previousChapters = [...items];

      setItems(newItems);

      if (courseId) {
        const lessonsToUpdate = updatedLessonsForState.map((lesson) => ({
          id: lesson.id,
          position: lesson.order
        }));

        const reorderLessonsPromise = () => reorderLessons(chapterId, lessonsToUpdate, courseId);

        toast.promise(reorderLessonsPromise, {
          loading: 'Reordering lessons...',
          success: (result) => {
            if (result.status === 'error') return result.message;
            throw new Error(result.message);
          },
          error: () => {
            setItems(previousChapters);
            return 'Failed to reorder lessons';
          }
        });
      }
      return;
    }
  };

  const handleChapterToggle = (chapterId: string) => {
    setItems((prevItems) => {
      return prevItems.map((chapter) => {
        if (chapter.id === chapterId) {
          return { ...chapter, isOpen: !chapter.isOpen };
        }
        return chapter;
      });
    });
  };

  return (
    <DndContext collisionDetection={rectIntersection} sensors={sensors} onDragEnd={handleDragEnd}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-border">
          <CardTitle>Chapters</CardTitle>
        </CardHeader>

        <CardContent>
          <SortableContext strategy={verticalListSortingStrategy} items={items}>
            {items.map((chapter) => (
              <SortableItem key={chapter.id} data={{ type: 'chapter' }} id={chapter.id}>
                {(listeners) => (
                  <Card>
                    <Collapsible open={chapter.isOpen} onOpenChange={() => handleChapterToggle(chapter.id)}>
                      <div className="flex items-center justify-between p-3 border-b border-border">
                        <div className="flex items-center justify-between w-full gap-2">
                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="cursor-grab opacity-60 hover:opacity-100"
                              {...listeners}
                            >
                              <GripVerticalIcon className="size-4" />
                            </Button>

                            <p className="cursor-pointer hover:text-primary">{chapter.title}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button size="icon" variant="destructive">
                              <TrashIcon className="size-4" />
                            </Button>

                            <CollapsibleTrigger asChild>
                              <Button size="icon" variant="ghost">
                                {chapter.isOpen ? (
                                  <ChevronDownIcon className="size-4" />
                                ) : (
                                  <ChevronRightIcon className="size-4" />
                                )}
                              </Button>
                            </CollapsibleTrigger>
                          </div>
                        </div>
                      </div>

                      <CollapsibleContent>
                        <div className="p-1">
                          <SortableContext
                            strategy={verticalListSortingStrategy}
                            items={chapter.lessons.map((lesson) => lesson.id)}
                          >
                            {chapter.lessons.map((lesson) => (
                              <SortableItem
                                key={lesson.id}
                                data={{ type: 'lesson', chapterId: chapter.id }}
                                id={lesson.id}
                              >
                                {(lessonListeners) => (
                                  <div className="flex items-center justify-between w-full gap-2 hover:bg-accent rounded-sm p-2">
                                    <div className="flex items-center gap-2">
                                      <Button size="icon" variant="ghost" {...lessonListeners}>
                                        <GripVerticalIcon className="size-4" />
                                      </Button>
                                      <FileText />
                                      <Link href={`/admin/courses/${data.id}/${chapter.id}/${lesson.id}`}>
                                        {lesson.title}
                                      </Link>
                                    </div>

                                    <Button size="icon" variant={'outline'}>
                                      <TrashIcon className="size-4" />
                                    </Button>
                                  </div>
                                )}
                              </SortableItem>
                            ))}
                          </SortableContext>

                          <div className="p-2">
                            <Button size="icon" variant={'outline'} className="w-full">
                              <PlusIcon className="size-4" /> Add Lesson
                            </Button>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                )}
              </SortableItem>
            ))}
          </SortableContext>
        </CardContent>
      </Card>
    </DndContext>
  );
};
