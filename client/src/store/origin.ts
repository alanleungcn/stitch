import { writable } from 'svelte/store';
import { browser, dev } from '$app/env';

let tmpOrigin: string = '';

if (browser) {
  const location = window.location;
  if (dev) {
    tmpOrigin = location.protocol + '//' + location.hostname + ':8000';
  } else {
    tmpOrigin = window.location.origin;
  }
}

export const origin = writable(tmpOrigin);
