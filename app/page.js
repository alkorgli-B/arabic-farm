"use client";
import React, { Suspense, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  Stars, 
  Float, 
  Text, 
  MeshDistortMaterial, 
  ContactShadows, 
  Environment,
  PerspectiveCamera
} from '@react-three/drei';

// مكون الحيوان التفاعلي مع نظام الرعاية
function AnimalEntity({ label, position, color, scale, speed, story }) {
  const [hovered, setHover] = useState(false);
  const [energy, setEnergy] = useState(1);
  const meshRef = useRef();

  // حركة تموجية بسيطة تزداد عند الرعاية
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01 * energy;
    }
  });

  return (
    <group position={position}>
      <Float speed={speed} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh 
          ref={meshRef}
          scale={hovered ? scale * 1.1 : scale}
          onPointerOver={() => setHover(true)}
          onPointerOut={() => setHover(false)}
          onClick={() => setEnergy(prev => Math.min(prev + 0.5, 5))} // نظام "الفزعة" أو الرعاية
        >
          {/* تمثيل هندسي نيون للحيوان */}
          <boxGeometry args={[1, 1, 1]} />
          <MeshDistortMaterial 
            color={color} 
            speed={speed} 
            distort={0.4} 
            radius={1} 
            emissive={color}
            emissiveIntensity={hovered ? 2 : 0.6 * energy}
          />
        </mesh>

        {/* تسمية الحيوان بالعربية */}
        <Text
          position={[0, 1.8, 0]}
          fontSize={0.4}
          color="white"
          font="/fonts/font.ttf" // اختياري إذا كان لديك خط مخصص
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      </Float>

      {/* منطقة السكن (House) - إطار نيون حول الحيوان */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[4, 4, 4]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.1} />
      </mesh>
    </group>
  );
}

// الواجهة الأمامية (Overlay)
function Overlay({ onReset }) {
  return (
    <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-10">
      <header className="flex justify-between items-start pointer-events-auto">
        <div>
          <h1 className="text-5xl font-black text-neonCyan tracking-tighter italic">
            SENKU FARM
          </h1>
          <p className="text-white/50 font-mono text-sm mt-1">VIBE CODING // SYSTEM ACTIVE</p>
        </div>
        <div className="text-right">
          <div className="text-neonBlue font-bold text-xl">مزرعة السكينة</div>
          <div className="text-white/40 text-xs">Project: Zen-Earth</div>
        </div>
      </header>

      <footer className="flex justify-center pointer-events-auto">
        <div className="bg-black/80 border border-white/10 backdrop-blur-md p-4 rounded-full flex gap-8 px-10">
          <button className="text-white hover:text-neonCyan transition-colors">إطعام</button>
          <button className="text-white hover:text-neonCyan transition-colors">رعاية</button>
          <button className="text-white hover:text-neonCyan transition-colors" onClick={onReset}>إعادة ضبط</button>
        </div>
      </footer>
    </div>
  );
}

export default function GamePage() {
  const [key, setKey] = useState(0);

  return (
    <main className="w-full h-screen bg-[#020202] relative">
      <Overlay onReset={() => setKey(prev => prev + 1)} />
      
      <Canvas shadows key={key}>
        <PerspectiveCamera makeDefault position={[0, 8, 18]} />
        <color attach="background" args={['#020202']} />
        
        {/* نظام النجوم والسديم */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#00ffcc" />

        <Suspense fallback={null}>
          <group position={[0, 0, 0]}>
            {/* الحيوانات الأربعة بتوزيع متناسق */}
            <AnimalEntity 
              label="القصواء (ناقة)" 
              position={[-7, 0, -2]} 
              color="#FFD700" 
              scale={1.5} 
              speed={1.5} 
            />
            <AnimalEntity 
              label="دُلدُل (بغلة)" 
              position={[-2.5, 0, 2]} 
              color="#00ffcc" 
              scale={1.2} 
              speed={2} 
            />
            <AnimalEntity 
              label="السكب (فرس)" 
              position={[2.5, 0, 2]} 
              color="#ff0055" 
              scale={1.3} 
              speed={4} 
            />
            <AnimalEntity 
              label="عُفير (حمار)" 
              position={[7, 0, -2]} 
              color="#0088ff" 
              scale={1} 
              speed={1.2} 
            />

            {/* الأرضية النيون التفاعلية */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
              <planeGeometry args={[50, 50]} />
              <meshStandardMaterial color="#050505" roughness={0.1} metalness={0.8} />
            </mesh>
            <gridHelper args={[50, 50, '#111', '#0a0a0a']} position={[0, -0.49, 0]} />
          </group>

          <ContactShadows position={[0, -0.4, 0]} opacity={0.4} scale={40} blur={2} far={10} />
          <Environment preset="city" />
        </Suspense>

        <OrbitControls 
          enablePan={false} 
          maxPolarAngle={Math.PI / 2.2} 
          minDistance={5} 
          maxDistance={30} 
        />
      </Canvas>
    </main>
  );
}
