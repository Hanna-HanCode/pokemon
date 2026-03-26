import { initCron } from '$lib/services/cronManager';

let cronInitialized = false;

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
    if (!cronInitialized) {
        initCron();
        cronInitialized = true;
    }
    return resolve(event);
}
