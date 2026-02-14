'use client';
import React, { useRef, useState, useCallback, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import useStore from '../store/useStore';

/* ═══════════════════════════════════════════
   Shared PBR material helper
   ═══════════════════════════════════════════ */
function AnimalMaterial({ color, roughness = 0.85, metalness = 0.02 }) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={roughness}
      metalness={metalness}
      flatShading
    />
  );
}

/* ═══════════════════════════════════════════
   AL-QASWA — Arabian Camel
   Detailed procedural model with hump, long neck, legs
   ═══════════════════════════════════════════ */
function CamelModel({ bodyColor, furColor, happiness }) {
  const groupRef = useRef();
  const headRef = useRef();
  const tailRef = useRef();
  const legRefs = useRef([null, null, null, null]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // Head bob — slow, stately
    if (headRef.current) {
      headRef.current.rotation.x = Math.sin(t * 0.6) * 0.08 * happiness;
      headRef.current.rotation.z = Math.sin(t * 0.3) * 0.03;
    }
    // Tail swish
    if (tailRef.current) {
      tailRef.current.rotation.z = Math.sin(t * 1.2) * 0.15;
    }
    // Breathing — body scale
    if (groupRef.current) {
      const breathe = 1 + Math.sin(t * 1.0) * 0.008;
      groupRef.current.scale.y = breathe;
    }
    // Subtle leg shift
    legRefs.current.forEach((leg, i) => {
      if (leg) {
        leg.rotation.x = Math.sin(t * 0.8 + i * Math.PI * 0.5) * 0.03;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {/* Body — elongated barrel */}
      <mesh position={[0, 1.6, 0]} castShadow>
        <capsuleGeometry args={[0.6, 1.8, 8, 16]} />
        <AnimalMaterial color={bodyColor} roughness={0.92} />
      </mesh>

      {/* Hump */}
      <mesh position={[0, 2.5, -0.2]} castShadow>
        <sphereGeometry args={[0.5, 10, 8]} />
        <AnimalMaterial color={furColor} roughness={0.95} />
      </mesh>

      {/* Neck — angled cylinder */}
      <mesh position={[0, 2.3, 1.1]} rotation={[0.6, 0, 0]} castShadow>
        <capsuleGeometry args={[0.2, 1.4, 6, 12]} />
        <AnimalMaterial color={bodyColor} roughness={0.9} />
      </mesh>

      {/* Head */}
      <group ref={headRef} position={[0, 3.2, 1.8]}>
        <mesh castShadow>
          <boxGeometry args={[0.35, 0.3, 0.6]} />
          <AnimalMaterial color={bodyColor} roughness={0.88} />
        </mesh>
        {/* Snout */}
        <mesh position={[0, -0.1, 0.35]} castShadow>
          <boxGeometry args={[0.25, 0.2, 0.3]} />
          <AnimalMaterial color={furColor} roughness={0.9} />
        </mesh>
        {/* Eyes */}
        <mesh position={[0.18, 0.05, 0.15]}>
          <sphereGeometry args={[0.04, 6, 6]} />
          <meshStandardMaterial color="#1a1005" roughness={0.3} metalness={0.4} />
        </mesh>
        <mesh position={[-0.18, 0.05, 0.15]}>
          <sphereGeometry args={[0.04, 6, 6]} />
          <meshStandardMaterial color="#1a1005" roughness={0.3} metalness={0.4} />
        </mesh>
        {/* Ears */}
        <mesh position={[0.15, 0.18, -0.05]} rotation={[0, 0, 0.3]}>
          <coneGeometry args={[0.06, 0.15, 4]} />
          <AnimalMaterial color={furColor} />
        </mesh>
        <mesh position={[-0.15, 0.18, -0.05]} rotation={[0, 0, -0.3]}>
          <coneGeometry args={[0.06, 0.15, 4]} />
          <AnimalMaterial color={furColor} />
        </mesh>
      </group>

      {/* Legs (4) */}
      {[
        [0.35, 0, 0.6],
        [-0.35, 0, 0.6],
        [0.35, 0, -0.6],
        [-0.35, 0, -0.6],
      ].map((pos, i) => (
        <group key={i} ref={(el) => (legRefs.current[i] = el)} position={pos}>
          {/* Upper leg */}
          <mesh position={[0, 0.9, 0]} castShadow>
            <capsuleGeometry args={[0.12, 0.7, 6, 8]} />
            <AnimalMaterial color={bodyColor} roughness={0.9} />
          </mesh>
          {/* Lower leg */}
          <mesh position={[0, 0.25, 0]} castShadow>
            <capsuleGeometry args={[0.08, 0.5, 6, 8]} />
            <AnimalMaterial color={furColor} roughness={0.9} />
          </mesh>
          {/* Hoof */}
          <mesh position={[0, -0.05, 0]}>
            <cylinderGeometry args={[0.09, 0.1, 0.08, 6]} />
            <meshStandardMaterial color="#3A2A15" roughness={0.95} />
          </mesh>
        </group>
      ))}

      {/* Tail */}
      <group ref={tailRef} position={[0, 1.8, -1.2]}>
        <mesh rotation={[0.3, 0, 0]} castShadow>
          <capsuleGeometry args={[0.04, 0.5, 4, 6]} />
          <AnimalMaterial color={furColor} />
        </mesh>
        {/* Tail tuft */}
        <mesh position={[0, -0.3, -0.15]}>
          <sphereGeometry args={[0.08, 6, 4]} />
          <AnimalMaterial color={furColor} roughness={0.95} />
        </mesh>
      </group>
    </group>
  );
}

/* ═══════════════════════════════════════════
   AL-SAKB — Arabian Horse
   Majestic bay/black horse with flowing mane
   ═══════════════════════════════════════════ */
function HorseModel({ bodyColor, furColor, happiness }) {
  const groupRef = useRef();
  const headRef = useRef();
  const tailRef = useRef();
  const maneRefs = useRef([]);
  const legRefs = useRef([null, null, null, null]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // Head toss
    if (headRef.current) {
      headRef.current.rotation.x = Math.sin(t * 0.9) * 0.12 * happiness;
      headRef.current.position.y = 2.6 + Math.sin(t * 0.9) * 0.05;
    }
    // Tail flow
    if (tailRef.current) {
      tailRef.current.rotation.x = 0.4 + Math.sin(t * 1.5) * 0.2;
      tailRef.current.rotation.z = Math.sin(t * 1.0) * 0.12;
    }
    // Mane flow
    maneRefs.current.forEach((m, i) => {
      if (m) m.rotation.z = Math.sin(t * 1.2 + i * 0.3) * 0.1;
    });
    // Breathing
    if (groupRef.current) {
      groupRef.current.scale.y = 1 + Math.sin(t * 1.2) * 0.01;
    }
    // Pawing — front leg
    if (legRefs.current[0]) {
      legRefs.current[0].rotation.x = Math.sin(t * 1.5) * 0.06 * Math.max(happiness - 2, 0);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Body — sleek barrel */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <capsuleGeometry args={[0.55, 1.4, 8, 16]} />
        <AnimalMaterial color={bodyColor} roughness={0.7} />
      </mesh>

      {/* Chest */}
      <mesh position={[0, 1.55, 0.7]} castShadow>
        <sphereGeometry args={[0.5, 10, 8]} />
        <AnimalMaterial color={bodyColor} roughness={0.7} />
      </mesh>

      {/* Neck — arched */}
      <mesh position={[0, 2.15, 0.9]} rotation={[0.5, 0, 0]} castShadow>
        <capsuleGeometry args={[0.22, 1.0, 6, 12]} />
        <AnimalMaterial color={bodyColor} roughness={0.7} />
      </mesh>

      {/* Head */}
      <group ref={headRef} position={[0, 2.6, 1.5]}>
        <mesh castShadow>
          <boxGeometry args={[0.3, 0.35, 0.55]} />
          <AnimalMaterial color={bodyColor} roughness={0.7} />
        </mesh>
        {/* Muzzle */}
        <mesh position={[0, -0.12, 0.32]}>
          <boxGeometry args={[0.22, 0.18, 0.2]} />
          <AnimalMaterial color={bodyColor} roughness={0.75} />
        </mesh>
        {/* Nostrils */}
        <mesh position={[0.06, -0.15, 0.42]}>
          <sphereGeometry args={[0.025, 4, 4]} />
          <meshStandardMaterial color="#2a1a0a" roughness={0.5} />
        </mesh>
        <mesh position={[-0.06, -0.15, 0.42]}>
          <sphereGeometry args={[0.025, 4, 4]} />
          <meshStandardMaterial color="#2a1a0a" roughness={0.5} />
        </mesh>
        {/* Eyes */}
        <mesh position={[0.16, 0.05, 0.12]}>
          <sphereGeometry args={[0.04, 6, 6]} />
          <meshStandardMaterial color="#1a0800" roughness={0.2} metalness={0.5} />
        </mesh>
        <mesh position={[-0.16, 0.05, 0.12]}>
          <sphereGeometry args={[0.04, 6, 6]} />
          <meshStandardMaterial color="#1a0800" roughness={0.2} metalness={0.5} />
        </mesh>
        {/* Ears — pointed */}
        <mesh position={[0.1, 0.25, 0]} rotation={[0.2, 0, 0.15]}>
          <coneGeometry args={[0.04, 0.18, 4]} />
          <AnimalMaterial color={bodyColor} />
        </mesh>
        <mesh position={[-0.1, 0.25, 0]} rotation={[0.2, 0, -0.15]}>
          <coneGeometry args={[0.04, 0.18, 4]} />
          <AnimalMaterial color={bodyColor} />
        </mesh>
      </group>

      {/* Mane — flowing strips */}
      {[0, 0.2, 0.4, 0.6, 0.8].map((offset, i) => (
        <mesh
          key={i}
          ref={(el) => (maneRefs.current[i] = el)}
          position={[0, 2.5 - offset * 0.5, 0.9 + offset * 0.3]}
          rotation={[0.3, 0, 0]}
          castShadow
        >
          <boxGeometry args={[0.03, 0.25, 0.1]} />
          <AnimalMaterial color={furColor} roughness={0.6} />
        </mesh>
      ))}

      {/* Legs (4) — slender, muscular */}
      {[
        [0.25, 0, 0.55],
        [-0.25, 0, 0.55],
        [0.25, 0, -0.55],
        [-0.25, 0, -0.55],
      ].map((pos, i) => (
        <group key={i} ref={(el) => (legRefs.current[i] = el)} position={pos}>
          <mesh position={[0, 0.85, 0]} castShadow>
            <capsuleGeometry args={[0.1, 0.6, 6, 8]} />
            <AnimalMaterial color={bodyColor} roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.3, 0]} castShadow>
            <capsuleGeometry args={[0.065, 0.55, 6, 8]} />
            <AnimalMaterial color={bodyColor} roughness={0.7} />
          </mesh>
          {/* Hoof */}
          <mesh position={[0, -0.02, 0]}>
            <cylinderGeometry args={[0.07, 0.08, 0.1, 6]} />
            <meshStandardMaterial color="#1A0F05" roughness={0.9} />
          </mesh>
        </group>
      ))}

      {/* Tail — long flowing */}
      <group ref={tailRef} position={[0, 1.6, -1.0]}>
        <mesh castShadow>
          <capsuleGeometry args={[0.03, 0.8, 4, 6]} />
          <AnimalMaterial color={furColor} roughness={0.6} />
        </mesh>
        {/* Flowing hair */}
        {[0, 0.15, 0.3].map((d, i) => (
          <mesh key={i} position={[0, -0.5 - d, -0.05 * i]}>
            <capsuleGeometry args={[0.02, 0.2, 4, 4]} />
            <AnimalMaterial color={furColor} roughness={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* ═══════════════════════════════════════════
   DULDUL — Mule (sturdy build)
   ═══════════════════════════════════════════ */
function MuleModel({ bodyColor, furColor, happiness }) {
  const groupRef = useRef();
  const headRef = useRef();
  const tailRef = useRef();
  const earRefs = useRef([null, null]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (headRef.current) {
      headRef.current.rotation.x = Math.sin(t * 0.5) * 0.06 * happiness;
    }
    if (tailRef.current) {
      tailRef.current.rotation.z = Math.sin(t * 2.0) * 0.2;
    }
    // Ear flick
    earRefs.current.forEach((ear, i) => {
      if (ear) {
        ear.rotation.z = (i === 0 ? 0.3 : -0.3) + Math.sin(t * 2.5 + i * 2) * 0.15;
      }
    });
    if (groupRef.current) {
      groupRef.current.scale.y = 1 + Math.sin(t * 0.9) * 0.008;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Body — stocky barrel */}
      <mesh position={[0, 1.35, 0]} castShadow>
        <capsuleGeometry args={[0.5, 1.3, 8, 14]} />
        <AnimalMaterial color={bodyColor} roughness={0.88} />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 1.9, 0.75]} rotation={[0.55, 0, 0]} castShadow>
        <capsuleGeometry args={[0.2, 0.8, 6, 10]} />
        <AnimalMaterial color={bodyColor} roughness={0.85} />
      </mesh>

      {/* Head */}
      <group ref={headRef} position={[0, 2.3, 1.2]}>
        <mesh castShadow>
          <boxGeometry args={[0.32, 0.3, 0.5]} />
          <AnimalMaterial color={bodyColor} roughness={0.85} />
        </mesh>
        <mesh position={[0, -0.08, 0.3]}>
          <boxGeometry args={[0.24, 0.2, 0.22]} />
          <AnimalMaterial color={furColor} roughness={0.88} />
        </mesh>
        {/* Eyes */}
        <mesh position={[0.17, 0.04, 0.12]}>
          <sphereGeometry args={[0.035, 6, 6]} />
          <meshStandardMaterial color="#1a0800" roughness={0.3} metalness={0.3} />
        </mesh>
        <mesh position={[-0.17, 0.04, 0.12]}>
          <sphereGeometry args={[0.035, 6, 6]} />
          <meshStandardMaterial color="#1a0800" roughness={0.3} metalness={0.3} />
        </mesh>
        {/* Large mule ears */}
        <mesh ref={(el) => (earRefs.current[0] = el)} position={[0.12, 0.28, -0.02]} rotation={[0.15, 0, 0.3]}>
          <coneGeometry args={[0.05, 0.3, 4]} />
          <AnimalMaterial color={furColor} />
        </mesh>
        <mesh ref={(el) => (earRefs.current[1] = el)} position={[-0.12, 0.28, -0.02]} rotation={[0.15, 0, -0.3]}>
          <coneGeometry args={[0.05, 0.3, 4]} />
          <AnimalMaterial color={furColor} />
        </mesh>
      </group>

      {/* Legs — sturdy */}
      {[
        [0.3, 0, 0.45],
        [-0.3, 0, 0.45],
        [0.3, 0, -0.45],
        [-0.3, 0, -0.45],
      ].map((pos, i) => (
        <group key={i} position={pos}>
          <mesh position={[0, 0.75, 0]} castShadow>
            <capsuleGeometry args={[0.1, 0.55, 6, 8]} />
            <AnimalMaterial color={bodyColor} roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.25, 0]} castShadow>
            <capsuleGeometry args={[0.07, 0.45, 6, 8]} />
            <AnimalMaterial color={furColor} roughness={0.88} />
          </mesh>
          <mesh position={[0, -0.02, 0]}>
            <cylinderGeometry args={[0.075, 0.085, 0.08, 6]} />
            <meshStandardMaterial color="#2A1A0A" roughness={0.95} />
          </mesh>
        </group>
      ))}

      {/* Short mane strip */}
      <mesh position={[0, 2.1, 0.5]} rotation={[0.4, 0, 0]} castShadow>
        <boxGeometry args={[0.04, 0.35, 0.5]} />
        <AnimalMaterial color={furColor} roughness={0.7} />
      </mesh>

      {/* Tail — short with tuft */}
      <group ref={tailRef} position={[0, 1.5, -0.9]}>
        <mesh rotation={[0.3, 0, 0]} castShadow>
          <capsuleGeometry args={[0.035, 0.35, 4, 6]} />
          <AnimalMaterial color={furColor} />
        </mesh>
        <mesh position={[0, -0.25, -0.05]}>
          <sphereGeometry args={[0.07, 6, 4]} />
          <AnimalMaterial color={furColor} roughness={0.95} />
        </mesh>
      </group>
    </group>
  );
}

/* ═══════════════════════════════════════════
   UFAYR — Donkey (smaller, humble)
   ═══════════════════════════════════════════ */
function DonkeyModel({ bodyColor, furColor, happiness }) {
  const groupRef = useRef();
  const headRef = useRef();
  const tailRef = useRef();
  const earRefs = useRef([null, null]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (headRef.current) {
      headRef.current.rotation.x = Math.sin(t * 0.7) * 0.08 * happiness;
      headRef.current.rotation.y = Math.sin(t * 0.4) * 0.04;
    }
    if (tailRef.current) {
      tailRef.current.rotation.z = Math.sin(t * 2.5) * 0.25;
    }
    earRefs.current.forEach((ear, i) => {
      if (ear) {
        ear.rotation.x = Math.sin(t * 1.8 + i * 3) * 0.2;
      }
    });
    if (groupRef.current) {
      groupRef.current.scale.y = 1 + Math.sin(t * 1.1) * 0.006;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Body — compact */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <capsuleGeometry args={[0.42, 1.0, 8, 14]} />
        <AnimalMaterial color={bodyColor} roughness={0.9} />
      </mesh>

      {/* Light belly */}
      <mesh position={[0, 0.95, 0]} castShadow>
        <capsuleGeometry args={[0.38, 0.6, 6, 10]} />
        <meshStandardMaterial color="#B0B0B0" roughness={0.9} flatShading />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 1.55, 0.55]} rotation={[0.5, 0, 0]} castShadow>
        <capsuleGeometry args={[0.16, 0.6, 6, 10]} />
        <AnimalMaterial color={bodyColor} roughness={0.88} />
      </mesh>

      {/* Head */}
      <group ref={headRef} position={[0, 1.85, 0.9]}>
        <mesh castShadow>
          <boxGeometry args={[0.26, 0.25, 0.42]} />
          <AnimalMaterial color={bodyColor} roughness={0.88} />
        </mesh>
        <mesh position={[0, -0.06, 0.25]}>
          <boxGeometry args={[0.2, 0.16, 0.18]} />
          <meshStandardMaterial color="#A0A0A0" roughness={0.9} flatShading />
        </mesh>
        {/* Eyes */}
        <mesh position={[0.14, 0.04, 0.1]}>
          <sphereGeometry args={[0.03, 6, 6]} />
          <meshStandardMaterial color="#1a0800" roughness={0.3} metalness={0.3} />
        </mesh>
        <mesh position={[-0.14, 0.04, 0.1]}>
          <sphereGeometry args={[0.03, 6, 6]} />
          <meshStandardMaterial color="#1a0800" roughness={0.3} metalness={0.3} />
        </mesh>
        {/* Very long ears — trademark */}
        <mesh ref={(el) => (earRefs.current[0] = el)} position={[0.09, 0.3, -0.02]} rotation={[0.1, 0, 0.2]}>
          <coneGeometry args={[0.04, 0.35, 4]} />
          <AnimalMaterial color={bodyColor} />
        </mesh>
        <mesh ref={(el) => (earRefs.current[1] = el)} position={[-0.09, 0.3, -0.02]} rotation={[0.1, 0, -0.2]}>
          <coneGeometry args={[0.04, 0.35, 4]} />
          <AnimalMaterial color={bodyColor} />
        </mesh>
      </group>

      {/* Legs — shorter */}
      {[
        [0.22, 0, 0.35],
        [-0.22, 0, 0.35],
        [0.22, 0, -0.35],
        [-0.22, 0, -0.35],
      ].map((pos, i) => (
        <group key={i} position={pos}>
          <mesh position={[0, 0.6, 0]} castShadow>
            <capsuleGeometry args={[0.08, 0.45, 6, 8]} />
            <AnimalMaterial color={bodyColor} roughness={0.88} />
          </mesh>
          <mesh position={[0, 0.2, 0]} castShadow>
            <capsuleGeometry args={[0.06, 0.35, 6, 8]} />
            <AnimalMaterial color={furColor} roughness={0.9} />
          </mesh>
          <mesh position={[0, -0.01, 0]}>
            <cylinderGeometry args={[0.06, 0.07, 0.07, 6]} />
            <meshStandardMaterial color="#333" roughness={0.95} />
          </mesh>
        </group>
      ))}

      {/* Dorsal stripe */}
      <mesh position={[0, 1.53, 0]} castShadow>
        <boxGeometry args={[0.03, 0.02, 1.2]} />
        <meshStandardMaterial color="#555" roughness={0.9} />
      </mesh>

      {/* Tail */}
      <group ref={tailRef} position={[0, 1.2, -0.7]}>
        <mesh rotation={[0.4, 0, 0]} castShadow>
          <capsuleGeometry args={[0.025, 0.4, 4, 6]} />
          <AnimalMaterial color={furColor} />
        </mesh>
        <mesh position={[0, -0.28, -0.05]}>
          <sphereGeometry args={[0.06, 6, 4]} />
          <AnimalMaterial color={furColor} roughness={0.95} />
        </mesh>
      </group>
    </group>
  );
}

/* ═══════════════════════════════════════════
   Individual Animal Entity wrapper
   ═══════════════════════════════════════════ */
function AnimalEntity({ animal }) {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);
  const nurture = useStore((s) => s.nurture);
  const selectAnimal = useStore((s) => s.selectAnimal);
  const happiness = useStore(
    (s) => s.animals.find((a) => a.id === animal.id)?.happiness ?? 1
  );

  const handleClick = useCallback(
    (e) => {
      e.stopPropagation();
      nurture(animal.id);
      selectAnimal(animal.id);

      // Gentle joy bounce
      if (groupRef.current) {
        gsap.to(groupRef.current.position, {
          y: animal.position[1] + 0.3,
          duration: 0.25,
          ease: 'power2.out',
          yoyo: true,
          repeat: 1,
        });
      }
    },
    [animal.id, animal.position, nurture, selectAnimal]
  );

  const ModelComponent = useMemo(() => {
    switch (animal.id) {
      case 'qaswa': return CamelModel;
      case 'sakb': return HorseModel;
      case 'duldul': return MuleModel;
      case 'ufayr': return DonkeyModel;
      default: return CamelModel;
    }
  }, [animal.id]);

  // Invisible click box sized per animal
  const clickBoxSize = animal.id === 'qaswa' ? [2.5, 3.5, 3] :
    animal.id === 'sakb' ? [2, 3, 3] :
    animal.id === 'duldul' ? [2, 2.8, 2.5] : [1.8, 2.5, 2];

  return (
    <group
      ref={groupRef}
      position={animal.position}
    >
      <ModelComponent
        bodyColor={animal.bodyColor}
        furColor={animal.furColor}
        happiness={happiness}
      />

      {/* Invisible clickable hitbox */}
      <mesh
        position={[0, clickBoxSize[1] / 2, 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
        onClick={handleClick}
        visible={false}
      >
        <boxGeometry args={clickBoxSize} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Shadow catcher */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1.5, 16]} />
        <shadowMaterial transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════
   Master AnimalFactory
   ═══════════════════════════════════════════ */
export default function AnimalFactory() {
  const animals = useStore((s) => s.animals);

  return (
    <group>
      {animals.map((animal) => (
        <AnimalEntity key={animal.id} animal={animal} />
      ))}
    </group>
  );
}
