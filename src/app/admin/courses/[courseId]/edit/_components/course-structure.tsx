'use client';

import { AdminDetailCourse } from '@/data-access/admin/get-course';
import { Button } from '@/libs/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/libs/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/libs/components/ui/collapsible';
import { cn } from '@/libs/utils/string';
import {
  DndContext,
  DragEndEvent,
  DraggableSyntheticListeners,
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
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronDownIcon, ChevronRightIcon, FileText, GripVerticalIcon, PlusIcon, TrashIcon } from 'lucide-react';
import Link from 'next/link';
import { ReactNode, useState } from 'react';

interface CourseStructureProps {
  data: AdminDetailCourse;
}

interface SortableItemProps {
  id: string;
  children: (listeners: DraggableSyntheticListeners) => ReactNode;
  className?: string;
  data?: {
    type: 'chapter' | 'lesson';
    chapterId?: string; // only relevant for lessons
  };
}

function SortableItem({ children, id, className, data }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, data });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn('touch-none', className, isDragging ? 'z-10' : '')}
    >
      {children(listeners)}
    </div>
  );
}

export function CourseStructure({ data }: CourseStructureProps) {
  const initialItems =
    data.chapters.map((chapter) => ({
      id: chapter.id,
      title: chapter.title,
      order: chapter.position,
      isOpen: true, // default chapters are open
      lessons: chapter.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        order: lesson.position,
        isOpen: true // default lessons are open
      }))
    })) || [];

  const [items, setItems] = useState(initialItems);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active && over && active.id !== over.id) {
      setItems((prevItems) => {
        const oldIndex = prevItems.indexOf(active.id);
        const newIndex = prevItems.indexOf(over.id);
        return arrayMove(prevItems, oldIndex, newIndex);
      });
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
}
