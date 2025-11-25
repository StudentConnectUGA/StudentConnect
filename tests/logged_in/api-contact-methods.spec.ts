import { test, expect } from '@playwright/test';

test.describe('/api/contact-methods crud', () => {
  test('create -> list -> update -> delete', async ({ request }) => {
    // create a unique identifier
    const platform = 'test-platform';
    const identifier = `student#${Math.floor(Math.random() * 100000)}`;

    // create
    const createRes = await request.post('/api/contact-methods', {
      data: {
        platform: `  ${platform}  `,
        identifier: `  ${identifier}  `,
        isPreferred: true,
        visible: true,
      },
    });

    expect(createRes.status()).toBe(201);
    const created = (await createRes.json()).method;

    expect(created.platform).toBe(platform);
    expect(created.identifier).toBe(identifier);
    expect(created.isPreferred).toBe(true);
    expect(created.visible).toBe(true);

    const id = created.id;

    // list
    const listRes = await request.get('/api/contact-methods');
    expect(listRes.status()).toBe(200);

    const list = (await listRes.json()).methods;
    expect(list.some((m) => m.id === id)).toBe(true);
    expect(list.filter((m) => m.isPreferred).length).toBe(1);

    // update
    const patchRes = await request.patch(`/api/contact-methods/${id}`, {
      data: {
        visible: false,
        isPreferred: false,
        identifier: '  updated#id  ',
      },
    });

    expect(patchRes.status()).toBe(200);
    const updated = (await patchRes.json()).method;

    expect(updated.visible).toBe(false);
    expect(updated.isPreferred).toBe(false);
    expect(updated.identifier).toBe('updated#id');

    // delete
    const deleteRes = await request.delete(`/api/contact-methods/${id}`);
    expect(deleteRes.status()).toBe(200);

    const finalListRes = await request.get('/api/contact-methods');
    expect(finalListRes.status()).toBe(200);

    const finalList = (await finalListRes.json()).methods;
    expect(finalList.some((m) => m.id === id)).toBe(false);
  });

  test('rejects invalid and incomplete bodies', async ({ request }) => {
    // missing platform
    const noPlatform = await request.post('/api/contact-methods', {
      data: { identifier: 'x' },
    });
    expect(noPlatform.status()).toBe(400);

    // missing identifier
    const noIdentifier = await request.post('/api/contact-methods', {
      data: { platform: 'discord' },
    });
    expect(noIdentifier.status()).toBe(400);

    // empty body
    const empty = await request.post('/api/contact-methods', {
      data: {},
    });
    expect(empty.status()).toBe(400);

    // invalid patch body
    const patchInvalid = await request.patch('/api/contact-methods/bad-id', {
      data: {},
    });
    // should be 404, because method not found or not owned
    expect([400, 404]).toContain(patchInvalid.status());
  });
});
