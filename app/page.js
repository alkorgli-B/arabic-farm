'use client';
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import AnimalFactory from '../components/AnimalFactory';
import Sanctuary from '../components/Sanctuary';
import CinematicCamera from '../components/CinematicCamera';
import HUD from '../components/HUD';

/* ─── Loading Screen ─── */
function LoadingScreen() {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#1a140e]">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent animate-spin"
            style={{
              borderTopColor: '#D4A76A',
              borderRightColor: '#6B9F3B',
              animationDuration: '2s',
            }}
          />
          <div
            className="absolute inset-3 rounded-full border-2 border-transparent animate-spin"
            style={{
              borderBottomColor: '#8B7355',
              borderLeftColor: '#5C3A1E',
              animationDuration: '2.5s',
              animationDirection: 'reverse',
            }}
          />
        </div>
        <p className="text-[#A08060] text-sm">جارٍ تحميل المزرعة المباركة...</p>
      </div>
    </div>
  );
}

/* ─── 3D Scene ─── */
function Scene() {
  return (
    <>
      {/* Sanctuary: sky, terrain, vegetation, stables, lighting */}
      <Sanctuary />

      {/* The 4 realistic animals */}
      <AnimalFactory />

      {/* Cinematic camera with zoom transitions */}
      <CinematicCamera />
    </>
  );
}

/* ─── Main Page ─── */
export default function GamePage() {
  return (
    <main className="w-full h-screen bg-[#1a140e] relative overflow-hidden">
      {/* HUD Overlay */}
      <HUD />

      {/* 3D Canvas */}
      <Suspense fallback={<LoadingScreen />}>
        <Canvas
          shadows
          gl={{
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.0,
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
