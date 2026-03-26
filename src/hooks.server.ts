import { initCron } from '$lib/services/cronManager';

// Force bypass SSL globally for production environments like SquareCloud
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

let cronInitialized = false;

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
    if (!cronInitialized) {
        initCron();
        cronInitialized = true;
    }
    return resolve(event);
}
