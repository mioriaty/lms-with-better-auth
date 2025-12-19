import { AdminCourse } from '@/data-access/admin/get-courses';
import { Button, buttonVariants } from '@/libs/components/ui/button';
import { Card, CardContent, CardDescription } from '@/libs/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/libs/components/ui/dropdown-menu';
import { Skeleton } from '@/libs/components/ui/skeleton';
import { constructUrl } from '@/libs/hooks/use-construct-url';
import { BookOpenIcon, ClockIcon, EllipsisVerticalIcon, EyeIcon, PencilIcon, TrashIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface AdminCourseCardProps {
  course: AdminCourse;
}

export function AdminCourseCard({ course }: AdminCourseCardProps) {
  const _constructUrl = constructUrl(course.fileKey);

  return (
    <Card className="group relative gap-0">
      {/* absolute dropdown */}
      <div className="absolute top-2 right-2 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon">
              <EllipsisVerticalIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <PencilIcon className="size-4 mr-2" />
              <Link href={`/admin/courses/${course.id}/edit`}>Edit Course</Link>
            </DropdownMenuItem>

            <DropdownMenuItem>
              <EyeIcon className="size-4 mr-2" />
              <Link href={`/courses/${course.slug}`}>Preview</Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link href={`/admin/courses/${course.id}/delete`}>
                <TrashIcon className="size-4 mr-2" />
                Delete Course
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Image
        src={_constructUrl}
        alt={course.title}
        width={600}
        height={400}
        className="w-full rounded aspect-video h-full object-cover"
      />

      <CardContent className="px-0 py-4">
        <Link
          href={`/admin/courses/${course.id}`}
          className="text-lg font-medium line-clamp-2 hover:underline group-hover:text-primary transition-colors"
        >
          {course.title}
        </Link>
        <CardDescription className="line-clamp-2">{course.excerpt}</CardDescription>

        <div className="mt-4 flex items-center gap-x-5">
          <div className="flex items-center gap-x-2">
            <ClockIcon className="size-6 p-1 rounded-md text-primary bg-primary/10" />
            <span>{course.duration} hours</span>
          </div>

          <div className="flex items-center gap-x-2">
            <BookOpenIcon className="size-6 p-1 rounded-md text-primary bg-primary/10" />
            <span>{course.level}</span>
          </div>
        </div>

        <Link
          href={`/admin/courses/${course.id}/edit`}
          className={buttonVariants({
            className: 'w-full mt-4'
          })}
        >
          Edit Course <PencilIcon className="size-4" />
        </Link>
      </CardContent>
    </Card>
  );
}

export function AdminCourseCardSkeleton() {
  return (
    <Card className="group relative gap-0 py-0">
      <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
        <Skeleton className="size-8 rounded-md" />
      </div>

      <div className="w-full relative h-fit">
        <Skeleton className="w-full rounded-t-lg aspect-video h-[400px] object-cover" />
      </div>

      <CardContent className="p-4 space-y-2">
        <Skeleton className="h-6 w-full rounded-md" />
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
      </CardContent>
    </Card>
  );
}
