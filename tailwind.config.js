/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        primary: '#00000',
        secondary: '#FFFFFF',
        darkBlue: '#132759',
        lightBlue: '#D3DCF2',
        grey: '#F2F3F5',
      },
      fontFamily: {
        fontFam: ['Noto Naskh Arabic', 'serif'],
      },
      fontSize: {
        sm: '20px',
        md: '23px',
        lg: '36px',
      },
    },
    screens: {
      sm: '200px',
      md: '768px',
      lg: '1300px',
      xl: '1440px',
    },
  },
  plugins: [],
};
