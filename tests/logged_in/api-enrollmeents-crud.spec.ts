// tests/api-enrollments-crud.spec.ts
import { test, expect } from '@playwright/test';

const TEST_COURSE_ID = 'cmiew380k0006ffme8e76ljmf';

test.describe('Enrollment CRUD Flow', () => {
  test('create -> update -> duplicate -> delete -> recreate', async ({ request }) => {
    const courseId = TEST_COURSE_ID;

    // 1. create enrollment
    const createRes = await request.post('/api/enrollments', {
      data: {
        courseId,
        grade: 'A',
        canTutor: true,
        showAsTutor: true,
        showGrade: true,
      },
    });

    expect(createRes.status(), 'POST should return 201').toBe(201);
    const createdBody = await createRes.json();
    const enrollment = createdBody.enrollment;

    expect(enrollment.courseId).toBe(courseId);
    expect(enrollment.grade).toBe('A');
    expect(enrollment.showAsTutor).toBe(true); // allowed: canTutor=true & showGrade=true
    expect(enrollment.id).toBeTruthy();

    const enrollmentId = enrollment.id;


    // 2. update enrollment
    // Test grade trimming, showGrade logic, showAsTutor invariants
    const patchRes = await request.patch(`/api/enrollments/${enrollmentId}`, {
      data: {
        grade: ' A+ ',
        showGrade: false,
        showAsTutor: true, // SHOULD BE FORCED FALSE because showGrade=false
      },
    });

    expect(patchRes.status()).toBe(200);
    const patched = (await patchRes.json()).enrollment;

    expect(patched.grade).toBe('A+');
    expect(patched.showGrade).toBe(false);
    expect(patched.showAsTutor).toBe(false); // forced false because showGrade=false


    // 3. duplicate enrollment should fail (userId + courseId unique)
    const dupRes = await request.post('/api/enrollments', {
      data: { courseId, grade: 'B' },
    });

    expect(dupRes.status(), 'Duplicate enrollment must return 409').toBe(409);

    // 4. delete enrollment
    const deleteRes = await request.delete(`/api/enrollments/${enrollmentId}`);
    expect(deleteRes.status()).toBe(200);

    // 5. recreate enrollment after deletion -> allowed again
    const recreateRes = await request.post('/api/enrollments', {
      data: { courseId, grade: 'A' },
    });

    expect(recreateRes.status()).toBe(201);
    const recreated = (await recreateRes.json()).enrollment;

    expect(recreated.courseId).toBe(courseId);
    expect(recreated.grade).toBe('A');

    // Cleanup: delete recreated enrollment
    await request.delete(`/api/enrollments/${recreated.id}`);

  });
});
