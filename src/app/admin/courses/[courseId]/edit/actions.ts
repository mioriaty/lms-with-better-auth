'use server';

import { requireAdmin } from '@/data-access/admin/require-admin';
import { ApiResponse } from '@/data-access/models/api-response';
import {
  ChapterSchemaType,
  CourseSchemaType,
  LessonSchemaType,
  chapterSchema,
  courseSchema,
  lessonSchema
} from '@/data-access/schemas/course.schema';
import arcjet, { detectBot, fixedWindow } from '@/libs/utils/arcjet';
import { prisma } from '@/libs/utils/db';
import { request } from '@arcjet/next';
import { revalidatePath } from 'next/cache';

const aj = arcjet
  .withRule(
    detectBot({
      mode: 'LIVE',
      allow: []
    })
  )
  .withRule(
    fixedWindow({
      mode: 'LIVE',
      window: '1m',
      max: 5
    })
  );

export async function editCourseAction(courseId: string, values: CourseSchemaType): Promise<ApiResponse> {
  const session = await requireAdmin();

  try {
    const req = await request();

    const decision = await aj.protect(req, {
      fingerprint: session.user.id
    });

    if (decision.isDenied()) {
      return {
        status: 'error',
        message: 'Too many requests'
      };
    }

    const validation = courseSchema.safeParse(values);

    if (!validation.success) {
      return {
        status: 'error',
        message: 'Invalid form data'
      };
    }

    await prisma.course.update({
      where: { id: courseId, userId: session.user.id },
      data: {
        title: values.title,
        description: values.description,
        excerpt: values.excerpt,
        category: values.category,
        slug: values.slug,
        fileKey: values.fileKey,
        price: values.price,
        duration: values.duration,
        level: values.level,
        status: values.status
      }
    });

    return {
      status: 'success',
      message: 'Course edited successfully'
    };
  } catch (error) {
    console.error(error);
    return {
      status: 'error',
      message: 'Failed to edit course'
    };
  }
}

export async function reorderLessons(
  chapterId: string,
  lessons: Array<{ id: string; position: number }>,
  courseId: string
): Promise<ApiResponse> {
  await requireAdmin();

  try {
    if (!lessons || lessons.length === 0) {
      return {
        status: 'error',
        message: 'No lessons to reorder'
      };
    }

    const updates = lessons.map((lesson) =>
      prisma.lesson.update({
        where: { id: lesson.id, chapterId: chapterId },
        data: {
          position: lesson.position
        }
      })
    );

    await prisma.$transaction(updates);

    revalidatePath(`/admin/courses/${courseId}/edit`);

    return {
      status: 'success',
      message: 'Lessons reordered successfully'
    };
  } catch (error) {
    console.error(error);
    return {
      status: 'error',
      message: 'Failed to reorder lessons'
    };
  }
}

export async function reorderChapters(
  courseId: string,
  chapters: Array<{ id: string; position: number }>
): Promise<ApiResponse> {
  await requireAdmin();

  try {
    if (!chapters || chapters.length === 0) {
      return {
        status: 'error',
        message: 'No chapters to reorder'
      };
    }

    const updates = chapters.map((chapter) =>
      prisma.chapter.update({
        where: { id: chapter.id, courseId: courseId },
        data: {
          position: chapter.position
        }
      })
    );

    await prisma.$transaction(updates);

    revalidatePath(`/admin/courses/${courseId}/edit`);

    return {
      status: 'success',
      message: 'Chapters reordered successfully'
    };
  } catch (error) {
    console.error(error);
    return {
      status: 'error',
      message: 'Failed to reorder chapters'
    };
  }
}

export async function createChapterAction(values: ChapterSchemaType): Promise<ApiResponse> {
  await requireAdmin();

  try {
    const validation = chapterSchema.safeParse(values);

    if (!validation.success) {
      return {
        status: 'error',
        message: 'Invalid form data'
      };
    }

    // why use transaction?
    // because we need to ensure that the chapter is created with the correct position
    await prisma.$transaction(async (tx) => {
      const maxPos = await tx.chapter.findFirst({
        where: {
          courseId: validation.data.courseId
        },
        select: {
          position: true
        },
        orderBy: {
          position: 'desc'
        }
      });

      await tx.chapter.create({
        data: {
          title: validation.data.name,
          courseId: validation.data.courseId,
          position: maxPos ? maxPos.position + 1 : 1
        }
      });
    });

    revalidatePath(`/admin/courses/${validation.data.courseId}/edit`);

    return {
      status: 'success',
      message: 'Chapter created successfully'
    };
  } catch (error) {
    console.error(error);
    return {
      status: 'error',
      message: 'Failed to create chapter'
    };
  }
}

export async function createLessonAction(values: LessonSchemaType): Promise<ApiResponse> {
  await requireAdmin();

  try {
    const validation = lessonSchema.safeParse(values);

    if (!validation.success) {
      return {
        status: 'error',
        message: 'Invalid form data'
      };
    }

    // why use transaction?
    // because we need to ensure that the chapter is created with the correct position
    await prisma.$transaction(async (tx) => {
      const maxPos = await tx.lesson.findFirst({
        where: {
          chapterId: validation.data.chapterId
        },
        select: {
          position: true
        },
        orderBy: {
          position: 'desc'
        }
      });

      await tx.lesson.create({
        data: {
          title: validation.data.name,
          chapterId: validation.data.chapterId,
          position: maxPos ? maxPos.position + 1 : 1,
          description: validation.data.description,
          thumbnailUrl: validation.data.thumbnailUrl,
          videoUrl: validation.data.videoUrl
        }
      });
    });

    revalidatePath(`/admin/courses/${validation.data.courseId}/edit`);

    return {
      status: 'success',
      message: 'Lesson created successfully'
    };
  } catch (error) {
    console.error(error);
    return {
      status: 'error',
      message: 'Failed to create lesson'
    };
  }
}

export async function deleteLessonAction({
  chapterId,
  courseId,
  lessonId
}: {
  lessonId: string;
  courseId: string;
  chapterId: string;
}): Promise<ApiResponse> {
  await requireAdmin();

  try {
    const chapterWithLessons = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: {
        lessons: {
          orderBy: {
            position: 'asc'
          },
          select: {
            id: true,
            position: true
          }
        }
      }
    });

    if (!chapterWithLessons) {
      return {
        status: 'error',
        message: 'Chapter not found'
      };
    }

    const lessons = chapterWithLessons.lessons;

    const lessonToDelete = lessons.find((lesson) => lesson.id === lessonId);

    if (!lessonToDelete) {
      return {
        status: 'error',
        message: 'Lesson not found'
      };
    }

    const remainingLessons = lessons.filter((lesson) => lesson.id !== lessonId);

    const updatedLessons = remainingLessons.map((lesson, index) => {
      return prisma.lesson.update({
        where: { id: lesson.id },
        data: {
          position: index + 1
        }
      });
    });

    // why use transaction?
    // because we need to ensure that the lesson is deleted with the correct position
    await prisma.$transaction([
      ...updatedLessons,
      prisma.lesson.delete({
        where: {
          id: lessonId,
          chapterId: chapterId
        }
      })
    ]);

    revalidatePath(`/admin/courses/${courseId}/edit`);

    return {
      status: 'success',
      message: 'Lesson deleted successfully'
    };
  } catch (error) {
    console.error(error);
    return {
      status: 'error',
      message: 'Failed to delete lesson'
    };
  }
}

export async function deleteChapterAction({
  courseId,
  chapterId
}: {
  courseId: string;
  chapterId: string;
}): Promise<ApiResponse> {
  await requireAdmin();

  try {
    const courseWithChapters = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        chapters: {
          orderBy: {
            position: 'asc'
          },
          select: {
            id: true,
            position: true
          }
        }
      }
    });

    if (!courseWithChapters) {
      return {
        status: 'error',
        message: 'Course not found'
      };
    }

    const chapters = courseWithChapters.chapters;
    const chapterToDelete = chapters.find((chapter) => chapter.id === chapterId);

    if (!chapterToDelete) {
      return {
        status: 'error',
        message: 'Chapter not found'
      };
    }

    const remainingChapters = chapters.filter((chapter) => chapter.id !== chapterId);

    const updates = remainingChapters.map((chapter, index) => {
      return prisma.chapter.update({
        where: { id: chapter.id },
        data: { position: index + 1 }
      });
    });

    await prisma.$transaction([
      ...updates,
      prisma.chapter.delete({
        where: {
          id: chapterId
        }
      })
    ]);

    revalidatePath(`/admin/courses/${courseId}/edit`);

    return {
      status: 'success',
      message: 'Chapter deleted successfully'
    };
  } catch (error) {
    console.error(error);
    return {
      status: 'error',
      message: 'Failed to delete chapter'
    };
  }
}
