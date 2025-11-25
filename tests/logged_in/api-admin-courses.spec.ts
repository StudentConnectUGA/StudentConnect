// tests/api-admin-courses-crud.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Admin courses CRUD', () => {
  test('create -> duplicate -> patch -> delete -> delete again', async ({ request }) => {
    // Make a unique course code for this test run
    const prefix = 'TST';
    const number = `9${Math.floor(Math.random() * 9000 + 1000)}`; // e.g. 9876


    // 1) create course
    const createRes = await request.post('/api/admin/courses', {
      data: {
        prefix: '  ' + prefix.toLowerCase(), // test trimming + uppercasing
        number: ` ${number} `,
        title: '  Playwright Test Course  ',
        description: '  This is a test-only course.  ',
      },
    });

    expect(createRes.status(), 'POST /api/admin/courses should return 201').toBe(201);
    const createBody = await createRes.json();
    const course = createBody.course;

    expect(course).toBeTruthy();
    expect(course.prefix).toBe(prefix);         // uppercased & trimmed
    expect(course.number).toBe(number);         // trimmed
    expect(course.title).toBe('Playwright Test Course'); // trimmed
    expect(course.description).toBe('This is a test-only course.');
    expect(course.id).toBeTruthy();

    const courseId = course.id as string;

    // 2) duplicate create should fail with 409 (unique prefix+number)
    const dupRes = await request.post('/api/admin/courses', {
      data: {
        prefix,
        number,
        title: 'Another title',
        description: 'Another desc',
      },
    });

    expect(
      dupRes.status(),
      'Duplicate course (same prefix+number) should return 409',
    ).toBe(409);

    // 3) update course – update title and description, and test trimming/null
    const patchRes = await request.patch(`/api/admin/courses/${courseId}`, {
      data: {
        title: '  Updated Title ',
        description: '   ', // should become null
      },
    });

    expect(patchRes.status(), 'PATCH /api/admin/courses/:id should return 200').toBe(200);
    const patchBody = await patchRes.json();
    const updated = patchBody.course;

    expect(updated.id).toBe(courseId);
    expect(updated.title).toBe('Updated Title');
    expect(updated.description).toBeNull(); // description?.trim() || null

    // 4) delete course
    const deleteRes = await request.delete(`/api/admin/courses/${courseId}`);
    expect(deleteRes.status(), 'DELETE /api/admin/courses/:id should return 200').toBe(200);

    // 5) delete again should hit P2025 and return 404
    const deleteAgainRes = await request.delete(`/api/admin/courses/${courseId}`);
    expect(
      deleteAgainRes.status(),
      'Second delete should return 404 (Course not found)',
    ).toBe(404);
  });
});
