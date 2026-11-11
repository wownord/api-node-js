// tests/api.spec.ts
import { test, expect } from '@playwright/test';
let baseURL: string = 'http://localhost:3000/users';

test.describe('User management API', () => {

    test('all users: should return empty array when no users', async ({ request }) => {
        const response = await request.get(`${baseURL}`);
        expect(response.status()).toBe(200);
        const responseBody = await response.text()
        expect(responseBody).toBe('[]');
    });

    test('find user: should return a user by ID', async ({ request }) => {
        // create a user and take its id
        const createResponse = await request.post(`${baseURL}`);
        const createdUser = await createResponse.json();

        const response = await request.get(`${baseURL}/${createdUser.id}`);
        expect(response.status()).toBe(200);
        const responseBody = await response.json();
        expect(responseBody.id).toBe(createdUser.id);
    });

    test('find user: should return 404 if user not found', async ({ request }) => {
        // ids are generated in range 0..100, so 1000 never exists
        const response = await request.get(`${baseURL}/1000`);
        expect(response.status()).toBe(404);
    });

    test('create user: should add a new user', async ({ request }) => {
        const response = await request.post(`${baseURL}`);
        expect(response.status()).toBe(201);
        const responseBody = await response.json();
        expect.soft(responseBody.id).toBeDefined();
        expect.soft(responseBody.name).toBeDefined();
        expect.soft(responseBody.email).toBeDefined();
        expect.soft(responseBody.phone).toBeDefined();
    });

    test('delete user: should delete a user by ID', async ({ request }) => {
        const createResponse = await request.post(`${baseURL}`);
        const createdUser = await createResponse.json();

        const response = await request.delete(`${baseURL}/${createdUser.id}`);
        expect(response.status()).toBe(200);
        // deleted user should not be found anymore
        const getResponse = await request.get(`${baseURL}/${createdUser.id}`);
        expect(getResponse.status()).toBe(404);
    });

    test('delete user: should return 404 if user not found', async ({ request }) => {
        const response = await request.delete(`${baseURL}/1000`);
        expect(response.status()).toBe(404);
    });

});
