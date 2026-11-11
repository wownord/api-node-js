import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    // tests share one in-memory list of users, so run them one by one
    workers: 1,
    use: {
        baseURL: 'http://localhost:3000/users',  // Adjust to your actual API base URL
    },
});
