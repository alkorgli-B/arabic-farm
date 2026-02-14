/** @type {import('next').NextConfig} */
const nextConfig = {
  // هذا السطر يحل مشاكل المكتبات ثلاثية الأبعاد مع Next.js
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
};

export default nextConfig;
