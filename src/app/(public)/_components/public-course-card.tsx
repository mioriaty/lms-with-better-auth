import { PublicCourse } from '@/data-access/public/course/get-all-courses';
import { Badge } from '@/libs/components/ui/badge';
import { Card, CardContent, CardDescription } from '@/libs/components/ui/card';
import { constructUrl } from '@/libs/hooks/use-construct-url';
import Image from 'next/image';
import Link from 'next/link';

interface PublicCourseCardProps {
  course: PublicCourse;
}

export function PublicCourseCard({ course }: PublicCourseCardProps) {
  const thumbnailUrl = constructUrl(course.fileKey);
  return (
    <Card className="group relative gap-0 py-0 border border-border border-solid">
      <Badge className="absolute top-2 right-2 z-10">{course.level}</Badge>

      <Image
        src={thumbnailUrl}
        alt={course.title}
        width={600}
        height={400}
        className="rounded-t-xl w-full object-cover aspect-video"
      />

      <CardContent className="p-4 space-y-2">
        <Link
          className="font-medium text-lg line-clamp-2 group-hover:text-primary transition-colors"
          href={`/courses/${course.slug}`}
        >
          {course.title}
        </Link>

        <CardDescription className="text-muted-foreground">{course.excerpt}</CardDescription>
      </CardContent>
    </Card>
  );
}
