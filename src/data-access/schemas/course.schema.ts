import { CourseLevel, CourseStatus } from '@/generated/prisma/enums';
import z from 'zod';

export const courseCategories = [
  'Programming',
  'Design',
  'Marketing',
  'Business',
  'Personal Development',
  'Health and Fitness',
  'Music',
  'Art',
  'Photography',
  'Writing',
  'Language Learning',
  'Science and Technology',
  'History and Humanities',
  'Math and Logic',
  'Social Sciences',
  'Other'
] as const;

export const courseLevels = [CourseLevel.BEGINNER, CourseLevel.INTERMEDIATE, CourseLevel.ADVANCED] as const;

export const courseStatuses = [CourseStatus.DRAFT, CourseStatus.PUBLISHED, CourseStatus.ARCHIVED] as const;

export const courseSchema = z.object({
  title: z
    .string()
    .min(3, { error: 'Title must be at least 3 characters long' })
    .max(255, { error: 'Title must be less than 255 characters long' }),
  description: z.string().min(3, { error: 'Description must be at least 3 characters long' }),
  excerpt: z
    .string()
    .min(3, { error: 'Excerpt must be at least 3 characters long' })
    .max(255, { error: 'Excerpt must be less than 255 characters long' }),
  category: z.enum(courseCategories, { error: 'Category is required' }),
  slug: z
    .string()
    .min(3, { error: 'Slug must be at least 3 characters long' })
    .max(255, { error: 'Slug must be less than 255 characters long' }),
  fileKey: z.string().min(1, { error: 'File key is required' }),
  price: z.coerce.number<number>().min(1, { error: 'Price must be at least 1' }),
  duration: z.coerce
    .number<number>()
    .min(1, { error: 'Duration must be at least 1 hour' })
    .max(500, { error: 'Duration must be less than 500 hours' }),
  level: z.enum(courseLevels, { error: 'Level is required' }),
  status: z.enum(courseStatuses, { error: 'Status is required' })
});

export const chapterSchema = z.object({
  name: z.string().min(3, { error: 'Name must be at least 3 characters long' }),
  courseId: z.string().min(1, { message: 'Course ID is required' })
});

export const lessonSchema = z.object({
  name: z.string().min(3, { error: 'Name must be at least 3 characters long' }),
  chapterId: z.string().min(1, { message: 'Chapter ID is required' }),
  courseId: z.string().min(1, { message: 'Course ID is required' }),
  description: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  videoUrl: z.string().optional()
});

export type CourseSchemaType = z.infer<typeof courseSchema>;
export type ChapterSchemaType = z.infer<typeof chapterSchema>;
export type LessonSchemaType = z.infer<typeof lessonSchema>;
