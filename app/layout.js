export const metadata = {
  title: 'Senku Arabic Farm',
  description: 'مزرعة حيوانات السيرة النبوية بتقنية النيون',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  )
}
