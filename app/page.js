'use client';
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import AnimalFactory from '../components/AnimalFactory';
import Sanctuary from '../components/Sanctuary';
import CinematicCamera from '../components/CinematicCamera';
import HUD from '../components/HUD';

/* ─── Loading Fallback ─── */
function LoadingScreen() {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#020206]">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent animate-spin"
            style={{
              borderTopColor: '#FFD700',
              borderRightColor: '#00FFCC',
              animationDuration: '1.5s',
            }}
          />
          <div
            className="absolute inset-2 rounded-full border-2 border-transparent animate-spin"
            style={{
              borderBottomColor: '#0088FF',
              borderLeftColor: '#FF2255',
              animationDuration: '2s',
              animationDirection: 'reverse',
            }}
          />
        </div>
        <p className="text-white/40 text-sm">جارٍ تحميل محمية الأنوار...</p>
      </div>
    </div>
  );
}

/* ─── 3D Scene Content ─── */
function Scene() {
  return (
    <>
      <color attach="background" args={['#020206']} />

      {/* Environment */}
      <Sanctuary />

      {/* The 4 Luminous Entities */}
      <AnimalFactory />

      {/* Cinematic Camera with smooth transitions */}
      <CinematicCamera />
    </>
  );
}

/* ─── Main Page ─── */
export default function GamePage() {
  return (
    <main className="w-full h-screen bg-[#020206] relative overflow-hidden">
      {/* HUD Overlay */}
      <HUD />

      {/* 3D Canvas */}
      <Suspense fallback={<LoadingScreen />}>
        <Canvas
          shadows
          gl={{
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.2,
            alpha: false,
          }}
          dpr={[1, 2]}
        >
          <Scene />
        </Canvas>
      </Suspense>
    </main>
  );
}
