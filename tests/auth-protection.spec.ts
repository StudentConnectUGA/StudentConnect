// tests/api-auth-protection.spec.ts
import { test, expect, APIRequestContext } from '@playwright/test';

// IDs for specific test records (fill in as needed)
const ADMIN_COURSE_ID = 'cmidrxwow0001ccme7rhgezxc';
const COURSE_ID = 'cmidrxwow0001ccme7rhgezxc';
const CONTACT_METHOD_ID = 'cmiduntd60007ccme8byancrt';
const ENROLLMENT_ID = 'cmids7p9u0003ccme103wk8u2';
const TUTOR_USER_ID = 'cmicqgukn00003lmewz8uc4iw';

let request: APIRequestContext;

// Create an unauthenticated API client
test.beforeAll(async ({ playwright }) => {
  request = await playwright.request.newContext({
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
  });
});

test.afterAll(async () => {
  await request.dispose();
});

// Helper to verify 401 responses on protected routes
async function expect401(
  path: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET'
) {
  const fn = method.toLowerCase() as 'get' | 'post' | 'put' | 'patch' | 'delete';
  const res = await request[fn](path);

  expect(
    res.status(),
    `Expected 401 for ${method} ${path}, got ${res.status()} instead`
  ).toBe(401);
}

// --------------------
// /api/admin/courses
// --------------------

test('GET /api/admin/courses (unauthenticated)', async () => {
  await expect401('/api/admin/courses', 'GET');
});

test('PATCH /api/admin/courses/[courseId] (unauthenticated)', async () => {
  await expect401(`/api/admin/courses/${ADMIN_COURSE_ID}`, 'PATCH');
});

// --------------------
// /api/contact-methods
// --------------------

test('GET /api/contact-methods (unauthenticated)', async () => {
  await expect401('/api/contact-methods', 'GET');
});

test('PATCH /api/contact-methods/[id] (unauthenticated)', async () => {
  await expect401(`/api/contact-methods/${CONTACT_METHOD_ID}`, 'PATCH');
});

// --------------------
// /api/courses
// --------------------

test('GET /api/courses (unauthenticated)', async () => {
  const res = await request.get('/api/courses');

  expect(
    res.status(),
    `Expected 200 for GET /api/courses, got ${res.status()} instead`
  ).toBe(200);
});

test('GET /api/courses/[courseId] (unauthenticated)', async () => {
  await expect401(`/api/courses/${COURSE_ID}`, 'GET');
});

test('GET /api/courses/[courseId]/tutors (unauthenticated)', async () => {
  await expect401(`/api/courses/${COURSE_ID}/tutors`, 'GET');
});

// --------------------
// /api/enrollments
// --------------------

test('POST /api/enrollments (unauthenticated)', async () => {
  await expect401('/api/enrollments', 'POST');
});

test('PATCH /api/enrollments/[id] (unauthenticated)', async () => {
  await expect401(`/api/enrollments/${ENROLLMENT_ID}`, 'PATCH');
});

// --------------------
// /api/tutors
// --------------------

test('GET /api/tutors/[userId] (unauthenticated)', async () => {
  await expect401(`/api/tutors/${TUTOR_USER_ID}`, 'GET');
});

// Note: auth routes (/api/auth/*) are intentionally skipped
