import './globals.css';

export const metadata = {
  title: 'المزرعة المباركة | The Blessed Farm',
  description: 'مزرعة تفاعلية ثلاثية الأبعاد تضم حيوانات من التاريخ الإسلامي',
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
        className="font-['Noto_Kufi_Arabic',sans-serif] bg-[#1a140e] text-[#F5E6C8] antialiased"
        style={{ margin: 0, overflow: 'hidden' }}
      >
        {children}
      </body>
    </html>
  );
}
