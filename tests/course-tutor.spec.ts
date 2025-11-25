// tests/course-tutors.spec.ts
import { test, expect } from '@playwright/test';

const COURSE_ID = 'cmidrxwow0001ccme7rhgezxc';
test('Course tutors API requires login', async ({ request }) => {
  const res = await request.get(`/api/courses/${COURSE_ID}/tutors`);

  expect(res.status()).toBe(401);

  const json = await res.json();
  expect(json.error).toBe('Unauthorized');
});
