'use server';

import { requireAdmin } from '@/data-access/admin/require-admin';
import { ApiResponse } from '@/data-access/models/api-response';
import { CourseSchemaType, courseSchema } from '@/data-access/schemas/course.schema';
import arcjet, { detectBot, fixedWindow } from '@/libs/utils/arcjet';
import { prisma } from '@/libs/utils/db';
import { request } from '@arcjet/next';

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

export async function CreateCourseAction(values: CourseSchemaType): Promise<ApiResponse> {
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

    await prisma.course.create({
      data: {
        ...validation.data,
        userId: session.user.id
      }
    });

    return {
      status: 'success',
      message: 'Course created successfully'
    };
  } catch (error) {
    return {
      status: 'error',
      message: 'Failed to create course'
    };
  }
}
