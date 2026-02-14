'use client';
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import useStore from '../store/useStore';

/* ─── Neon Pulsing Grid Floor ─── */
function NeonGrid() {
  const gridRef = useRef();
  const materialRef = useRef();

  const gridShader = useMemo(
    () => ({
      uniforms: {
        uTime: { value: 0 },
        uColor1: { value: new THREE.Color('#0a0a0a') },
        uColor2: { value: new THREE.Color('#FFD700') },
        uColor3: { value: new THREE.Color('#0088FF') },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform vec3 uColor3;
        varying vec2 vUv;

        void main() {
          vec2 grid = abs(fract(vUv * 40.0 - 0.5) - 0.5) / fwidth(vUv * 40.0);
          float line = min(grid.x, grid.y);
          float gridMask = 1.0 - min(line, 1.0);

          // Radial pulse from center
          float dist = length(vUv - 0.5) * 2.0;
          float pulse = sin(dist * 10.0 - uTime * 2.0) * 0.5 + 0.5;
          pulse *= smoothstep(1.0, 0.0, dist);

          // Mix golden and blue based on position
          vec3 gridColor = mix(uColor2, uColor3, sin(uTime * 0.5) * 0.5 + 0.5);
          vec3 finalColor = mix(uColor1, gridColor, gridMask * (0.3 + pulse * 0.5));

          float alpha = gridMask * 0.6 + 0.05;
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
    }),
    []
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh ref={gridRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
      <planeGeometry args={[60, 60, 1, 1]} />
      <shaderMaterial
        ref={materialRef}
        args={[gridShader]}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

/* ─── Snowing Light Particles ─── */
function SnowingLight({ count = 800 }) {
  const pointsRef = useRef();

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 1] = Math.random() * 30;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 50;
      vel[i] = 0.01 + Math.random() * 0.03;
    }
    return { positions: pos, velocities: vel };
  }, [count]);

  useFrame(() => {
    if (!pointsRef.current) return;
    const posArray = pointsRef.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      posArray[i * 3 + 1] -= velocities[i]; // Fall down
      posArray[i * 3] += Math.sin(Date.now() * 0.0005 + i) * 0.003; // Gentle sway

      // Reset when below floor
      if (posArray[i * 3 + 1] < -1) {
        posArray[i * 3 + 1] = 25 + Math.random() * 10;
        posArray[i * 3] = (Math.random() - 0.5) * 50;
        posArray[i * 3 + 2] = (Math.random() - 0.5) * 50;
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color="#fffbe6"
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ─── Sanctuary Cell (Housing for each animal) ─── */
function SanctuaryCell({ position, color }) {
  const cellRef = useRef();
  const edgesRef = useRef();

  useFrame((state) => {
    if (!cellRef.current) return;
    const time = state.clock.elapsedTime;
    // Subtle breathing animation
    const breathe = 1 + Math.sin(time * 1.5) * 0.02;
    cellRef.current.scale.set(breathe, breathe, breathe);

    if (edgesRef.current) {
      edgesRef.current.material.opacity = 0.1 + Math.sin(time * 2) * 0.05;
    }
  });

  // Create wireframe edges
  const edgesGeometry = useMemo(() => {
    const box = new THREE.BoxGeometry(5, 4, 5);
    return new THREE.EdgesGeometry(box);
  }, []);

  return (
    <group ref={cellRef} position={[position[0], position[1] + 1.5, position[2]]}>
      {/* Main wireframe structure */}
      <lineSegments ref={edgesRef} geometry={edgesGeometry}>
        <lineBasicMaterial color={color} transparent opacity={0.12} />
      </lineSegments>

      {/* Semi-transparent panels */}
      <mesh>
        <boxGeometry args={[5, 4, 5]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.02}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Top accent ring */}
      <mesh position={[0, 2.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.5, 0.02, 8, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} />
      </mesh>

      {/* Bottom accent ring */}
      <mesh position={[0, -1.9, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.5, 0.02, 8, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} />
      </mesh>

      {/* Corner pillars */}
      {[
        [-2.4, 0, -2.4],
        [-2.4, 0, 2.4],
        [2.4, 0, -2.4],
        [2.4, 0, 2.4],
      ].map((p, i) => (
        <mesh key={i} position={p}>
          <cylinderGeometry args={[0.02, 0.02, 4, 8]} />
          <meshBasicMaterial color={color} transparent opacity={0.25} />
        </mesh>
      ))}
    </group>
  );
}

/* ─── Ambient Floating Orbs ─── */
function AmbientOrbs({ count = 20 }) {
  const orbsRef = useRef([]);

  const orbData = useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      position: [
        (Math.random() - 0.5) * 40,
        Math.random() * 15 + 2,
        (Math.random() - 0.5) * 40,
      ],
      scale: 0.05 + Math.random() * 0.12,
      speed: 0.3 + Math.random() * 0.7,
      color: ['#FFD700', '#00FFCC', '#0088FF', '#FF2255'][
        Math.floor(Math.random() * 4)
      ],
    }));
  }, [count]);

  useFrame((state) => {
    orbsRef.current.forEach((mesh, i) => {
      if (!mesh) return;
      const t = state.clock.elapsedTime * orbData[i].speed;
      mesh.position.y = orbData[i].position[1] + Math.sin(t) * 1.5;
      mesh.position.x = orbData[i].position[0] + Math.sin(t * 0.5) * 0.5;
    });
  });

  return (
    <>
      {orbData.map((orb, i) => (
        <mesh
          key={i}
          ref={(el) => (orbsRef.current[i] = el)}
          position={orb.position}
          scale={orb.scale}
        >
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial
            color={orb.color}
            transparent
            opacity={0.4}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </>
  );
}

/* ─── Master Sanctuary Component ─── */
export default function Sanctuary() {
  const animals = useStore((s) => s.animals);

  return (
    <group>
      {/* Deep space starfield — golden/blue */}
      <Stars
        radius={120}
        depth={80}
        count={6000}
        factor={5}
        saturation={0.4}
        fade
        speed={0.8}
      />

      {/* Secondary smaller stars layer */}
      <Stars
        radius={60}
        depth={40}
        count={2000}
        factor={2}
        saturation={0.1}
        fade
        speed={0.3}
      />

      {/* Neon pulsing grid floor */}
      <NeonGrid />

      {/* Snowing light particles */}
      <SnowingLight count={600} />

      {/* Floating ambient orbs */}
      <AmbientOrbs count={25} />

      {/* Sanctuary cells for each animal */}
      {animals.map((animal) => (
        <SanctuaryCell
          key={animal.id}
          position={animal.position}
          color={animal.color}
        />
      ))}

      {/* Global ambient lighting */}
      <ambientLight intensity={0.08} />

      {/* Key lights */}
      <pointLight position={[0, 15, 0]} intensity={0.8} color="#FFD700" distance={40} decay={2} />
      <pointLight position={[-15, 8, -10]} intensity={0.5} color="#0088FF" distance={30} decay={2} />
      <pointLight position={[15, 8, 10]} intensity={0.5} color="#00FFCC" distance={30} decay={2} />

      {/* Fog for depth */}
      <fog attach="fog" args={['#020206', 20, 60]} />
    </group>
  );
}
