/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      boxShadow: {
        md: '0 4px 6px -1px rgb(0 0 0 / 0.2), 0 2px 4px -2px rgb(0 0 0 / 0.2)',
      },
    },
  },
  daisyui: {
    themes: [
      {
        light: {
          primary: '#057AFF',
          secondary: '#afafb6',
          accent: '#B4E9D6',
          neutral: '#23282F',
          'base-100': '#FAF7F5',
          info: '#3ABFF8',
          success: '#36D399',
          warning: '#FBBD23',
          error: '#F87272',
        },
        dark: {
          primary: '#1961b3',
          secondary: '#3F3F46',
          accent: '#1FB2A6',
          neutral: '#191D24',
          'base-100': '#212121',
          info: '#3ABFF8',
          success: '#36D399',
          warning: '#FBBD23',
          error: '#F87272',
        },
      },
    ],
  },
  plugins: [require('daisyui')],
};
