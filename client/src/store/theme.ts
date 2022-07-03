import { browser } from '$app/env';
import { writable } from 'svelte/store';

let storedTheme = 'dark';

if (browser) {
  if (localStorage.getItem('theme') !== null) {
    // @ts-ignore
    storedTheme = localStorage.getItem('theme');
    document.documentElement.setAttribute('data-theme', storedTheme);
  }
}

export const theme = writable(storedTheme);
