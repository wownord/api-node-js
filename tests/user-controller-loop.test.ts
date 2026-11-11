import { test, expect } from '@playwright/test';
import { StatusCodes } from 'http-status-codes';
let baseURL: string = 'http://localhost:3000/users';

test.describe('User management API with loop', () => {

    test.beforeEach(async ({ request }) => {
        // get all users
        const response = await request.get(`${baseURL}`);
        const responseBody = await response.json()
        // get the number of objects in the array returned
        const numberOfObjects = responseBody.length;

        // create an empty array to store all user ID
        let userIDs = [];

        // loop through all users and store their ID in an array
        for (let i = 0; i < numberOfObjects; i++) {
            // get user ID from the response
            let userID = responseBody[i].id;
            // push is used to add elements to the end of an array
            userIDs.push(userID);
        }

        // delete all users in a loop using previously created array
        for (let i = 0; i < numberOfObjects; i++) {
            // delete user by id
            let response = await request.delete(`${baseURL}/${userIDs[i]}`);
            // validate the response status code
            expect.soft(response.status()).toBe(StatusCodes.OK);
        }

        // verify that all users are deleted
        const responseAfterDelete = await request.get(`${baseURL}`);
        expect(responseAfterDelete.status()).toBe(StatusCodes.OK);
        const responseBodyEmpty = await responseAfterDelete.text()
        // validate that the response is an empty array
        expect(responseBodyEmpty).toBe('[]');
    })


    // clean up after the whole file, so other test files start with no users
    test.afterAll(async ({ request }) => {
        const response = await request.get(`${baseURL}`);
        const users = await response.json();
        for (const user of users) {
            await request.delete(`${baseURL}/${user.id}`);
        }
    });

    test('GET / - should return empty when no users', async ({ request }) => {
        const response = await request.get(`${baseURL}`);
        expect(response.status()).toBe(StatusCodes.OK);
        const responseBody = await response.text()
        expect(responseBody).toBe('[]');
    });

    test('Should create N users and return exactly N users when retrieving all users', async ({ request }) => {
        await request.post(`${baseURL}`);
        await request.post(`${baseURL}`);
        const responseAllUsers = await request.get(`${baseURL}`);
        const responseBodyAllUsers = await responseAllUsers.json()
        console.log(responseBodyAllUsers);
        const userCount = responseBodyAllUsers.length;
        console.log(`Number of users: ${userCount}`);
        expect(userCount).toBe(2);
        const firstUser = responseBodyAllUsers[0];
        console.log('First user:', firstUser);
        const secondUser = responseBodyAllUsers[1];
        console.log('Second user:', secondUser);
    });

    test('Delete all users and verify empty response', async ({ request }) => {
        // create 3 users
        for (let i = 0; i < 3; i++) {
            await request.post(`${baseURL}`);
        }
        const responseAllUsers = await request.get(`${baseURL}`);
        const allUsers = await responseAllUsers.json();
        expect(allUsers.length).toBe(3);

        // delete all users in a loop
        for (const user of allUsers) {
            const response = await request.delete(`${baseURL}/${user.id}`);
            expect.soft(response.status()).toBe(StatusCodes.OK);
        }

        const responseAfterDelete = await request.get(`${baseURL}`);
        expect(responseAfterDelete.status()).toBe(StatusCodes.OK);
        expect(await responseAfterDelete.text()).toBe('[]');
    });

    // deleting one user does not affect the other users
    test('Delete one user and verify other users', async ({ request }) => {
        // create 3 users
        const createdUsers = [];
        for (let i = 0; i < 3; i++) {
            const response = await request.post(`${baseURL}`);
            createdUsers.push(await response.json());
        }

        // delete the first user
        const deleteResponse = await request.delete(`${baseURL}/${createdUsers[0].id}`);
        expect(deleteResponse.status()).toBe(StatusCodes.OK);

        // other 2 users are still there
        const responseAllUsers = await request.get(`${baseURL}`);
        const allUsers = await responseAllUsers.json();
        expect(allUsers.length).toBe(2);
        expect(allUsers).toContainEqual(createdUsers[1]);
        expect(allUsers).toContainEqual(createdUsers[2]);
    });

});
