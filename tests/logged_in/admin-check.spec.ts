// tests/api-auth-protection.spec.ts
import { test, expect, APIRequestContext } from '@playwright/test';

// IDs for specific test records (fill in as needed)
const ADMIN_COURSE_ID = 'cmidrxwow0001ccme7rhgezxc';
const COURSE_ID = 'cmidrxwow0001ccme7rhgezxc';
const CONTACT_METHOD_ID = 'cmiduntd60007ccme8byancrt';
const ENROLLMENT_ID = 'cmids7p9u0003ccme103wk8u2';
const TUTOR_USER_ID = 'cmicqgukn00003lmewz8uc4iw';




// Helper to verify responses on protected routes
async function expectStatus(
  request: APIRequestContext,
  path: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
  status = 200
) {
  const fn = method.toLowerCase() as 'get' | 'post' | 'put' | 'patch' | 'delete';
  const res = await request[fn](path);

  expect(
    res.status(),
    `Expected ${status} for ${method} ${path}, got ${res.status()} instead`
  ).toBe(status);
}

// --------------------
// /api/admin/courses
// --------------------

test('GET /api/admin/courses (auth\'d)', async ({request}) => {
  await expectStatus(request, '/api/admin/courses', 'GET', 200);
});

// TODO: implement actual patch test.
// test('PATCH /api/admin/courses/[courseId] (auth\'d)', async ({request}) => {
//   await expectStatus(request, `/api/admin/courses/${ADMIN_COURSE_ID}`, 'PATCH', 401);
// });

// --------------------
// /api/contact-methods
// --------------------

test('GET /api/contact-methods (auth\'d)', async ({request}) => {
  await expectStatus(request, '/api/contact-methods', 'GET', 200);
});

// TODO: implement actual patch test.
// test('PATCH /api/contact-methods/[id] (auth\'d)', async ({request}) => {
//   await expectStatus(request, `/api/contact-methods/${CONTACT_METHOD_ID}`, 'PATCH', 200);
// });

// --------------------
// /api/courses
// --------------------

test('GET /api/courses (auth\'d)', async ({request}) => {
  await expectStatus(request, '/api/courses', 'GET', 200);
});

test('GET /api/courses/[courseId] (auth\'d)', async ({request}) => {
  await expectStatus(request, `/api/courses/${COURSE_ID}`, 'GET', 200);
});

test('GET /api/courses/[courseId]/tutors (auth\'d)', async ({request}) => {
  await expectStatus(request, `/api/courses/${COURSE_ID}/tutors`, 'GET', 200);
});

// --------------------
// /api/enrollments
// --------------------

// TODO: implement actual new enrollment post test.
// test('POST /api/enrollments (auth\'d)', async ({request}) => {
//   await expectStatus(request, '/api/enrollments', 'POST', 200);
// });

// TODO: implement actual new enrollment patch test.
// test('PATCH /api/enrollments/[id] (auth\'d)', async ({request}) => {
//   await expectStatus(request, `/api/enrollments/${ENROLLMENT_ID}`, 'PATCH', 200);
// });

// --------------------
// /api/tutors
// --------------------

test('GET /api/tutors/[userId] (auth\'d)', async ({request}) => {
  await expectStatus(request, `/api/tutors/${TUTOR_USER_ID}`, 'GET', 200);
});

// Note: auth routes (/api/auth/*) are intentionally skipped
