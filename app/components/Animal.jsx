"use client";
import { useState } from 'react';
import { Float, Text, MeshDistortMaterial } from '@react-three/drei';

export default function Animal({ label, position, color, scale, info }) {
  const [health, setHealth] = useState(100);
  const [hovered, setHover] = useState(false);

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <mesh 
        position={position} 
        scale={hovered ? scale * 1.1 : scale}
        onClick={() => setHealth(h => Math.min(h + 10, 150))} // نظام الرعاية
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
      >
        <boxGeometry args={[1, 1, 1]} />
        <MeshDistortMaterial 
          color={color} 
          distort={0.4} 
          speed={3} 
          emissive={color}
          emissiveIntensity={health / 100} // يتوهج أكثر عند الرعاية
        />
        <Text position={[0, 1.5, 0]} fontSize={0.3} color="white">{label}</Text>
      </mesh>
    </Float>
  );
}
