import './globals.css';

export const metadata = {
  title: 'المزرعة المقدسة | Luminous Sanctuary',
  description: 'محمية الأنوار - حيوانات مقدسة من التاريخ الإسلامي في بيئة ثلاثية الأبعاد',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="font-['Noto_Kufi_Arabic',sans-serif] bg-black text-white antialiased"
        style={{ margin: 0, overflow: 'hidden' }}
      >
        {children}
      </body>
    </html>
  );
}
