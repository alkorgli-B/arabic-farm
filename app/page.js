"use client";
import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Float, Text, MeshDistortMaterial, ContactShadows } from '@react-three/drei';

// مكون الحيوان التفاعلي
function Animal({ position, color, name, scale, speed, label }) {
  const [hovered, setHover] = useState(false);
  
  return (
    <Float speed={speed} rotationIntensity={1.5} floatIntensity={2}>
      <mesh 
        position={position} 
        scale={hovered ? scale * 1.2 : scale}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
      >
        <boxGeometry args={[1, 1, 1]} />
        <MeshDistortMaterial 
          color={color} 
          speed={2} 
          distort={0.3} 
          radius={1} 
          emissive={color}
          emissiveIntensity={hovered ? 2 : 0.5}
        />
        <Text
          position={[0, 1.2, 0]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      </mesh>
    </Float>
  );
}

export default function ArabicFarm() {
  const [uiColor, setUiColor] = useState('#00ffcc'); // لون النيون الأساسي

  return (
    <main className="w-full h-screen bg-[#050505] relative overflow-hidden">
      {/* واجهة التحكم (UI) */}
      <div className="absolute top-10 left-10 z-20 p-6 rounded-2xl border border-cyan-500/30 bg-black/60 backdrop-blur-xl">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
          مزرعة السكينة الرقمية
        </h1>
        <p className="text-gray-400 text-sm mb-6">إدارة حيوانات السيرة النبوية</p>
        
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs text-cyan-300 uppercase">تخصيص لون النور</label>
            <input 
              type="color" 
              value={uiColor} 
              onChange={(e) => setUiColor(e.target.value)}
              className="w-full h-8 bg-transparent cursor-pointer rounded"
            />
          </div>
          <button className="w-full py-2 bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500 text-cyan-300 rounded-lg transition-all">
            إطعام الجميع
          </button>
        </div>
      </div>

      {/* عالم الـ 3D */}
      <Canvas camera={{ position: [0, 5, 12], fov: 45 }}>
        <color attach="background" args={['#050505']} />
        <fog attach="fog" args={['#050505', 10, 25]} />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <ambientLight intensity={0.2} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} color={uiColor} />

        <Suspense fallback={null}>
          {/* الحيوانات الأربعة بأسمائها */}
          <Animal label="القصواء (ناقة)" position={[-4, 0, 0]} color="#FFD700" scale={1.2} speed={1} />
          <Animal label="دُلدُل (بغلة)" position={[-1.5, 0, 2]} color="#00FFCC" scale={1.0} speed={2} />
          <Animal label="السكب (فرس)" position={[1.5, 0, 2]} color="#FF0055" scale={1.1} speed={4} />
          <Animal label="عُفير (حمار)" position={[4, 0, 0]} color="#0088FF" scale={0.8} speed={1.5} />

          {/* الأرضية النيون */}
          <gridHelper args={[30, 30, uiColor, '#222']} position={[0, -1, 0]} />
          <ContactShadows position={[0, -1, 0]} opacity={0.5} scale={20} blur={2} far={4.5} />
        </Suspense>

        <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.1} />
      </Canvas>

      <div className="absolute bottom-10 right-10 text-cyan-900 font-mono text-xs uppercase tracking-widest">
        Project Senku Framework v1.0
      </div>
    </main>
  );
}
