import localFont from "next/font/local";

export const myLocalFont = localFont({
  src: [
    {
      path: './fonts/YekanBakh-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/YekanBakh-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: './fonts/YekanBakh-ExtraBold.ttf',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-local' // تعریف یک متغیر CSS برای استفاده در Tailwind
})