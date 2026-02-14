'use client';
import React, { useRef, useMemo, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import useStore from '../store/useStore';

/* ─── Custom Shader: "Being of Light" ─── */
const luminousVertexShader = `
  uniform float uTime;
  uniform float uLuminance;
  uniform float uPulse;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDisplacement;

  // Simplex-like noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;

    float noise = snoise(position * 1.5 + uTime * 0.5) * 0.15 * uLuminance;
    float pulse = sin(uTime * 3.0) * 0.03 * uPulse;
    vDisplacement = noise + pulse;

    vec3 newPos = position + normal * (noise + pulse);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
  }
`;

const luminousFragmentShader = `
  uniform vec3 uColor;
  uniform vec3 uEmissive;
  uniform float uTime;
  uniform float uLuminance;
  uniform float uPulse;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDisplacement;

  void main() {
    // Fresnel rim lighting
    vec3 viewDir = normalize(cameraPosition - vPosition);
    float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 2.5);

    // Core glow
    vec3 core = uColor * uLuminance * 0.6;
    // Rim glow
    vec3 rim = uEmissive * fresnel * uLuminance * 1.8;
    // Pulse flash
    vec3 pulseGlow = uColor * uPulse * 0.5 * (0.5 + 0.5 * sin(uTime * 8.0));

    // Displacement-based color variation
    vec3 dispColor = mix(uColor, uEmissive, vDisplacement * 3.0 + 0.5);

    vec3 finalColor = core + rim + pulseGlow + dispColor * 0.3;

    // Soft alpha based on fresnel for ethereal look
    float alpha = 0.65 + fresnel * 0.35;

    gl_FragColor = vec4(finalColor, alpha);
  }
`;

/* ─── Motion Trail (for Al-Sakb horse) ─── */
function MotionTrail({ color, count = 5, parentRef }) {
  const trailsRef = useRef([]);

  useFrame(() => {
    if (!parentRef.current) return;
    const pos = parentRef.current.position;
    trailsRef.current.forEach((mesh, i) => {
      if (!mesh) return;
      const delay = (i + 1) * 0.12;
      mesh.position.x = pos.x - Math.sin(Date.now() * 0.002 + i) * delay * 2;
      mesh.position.y = pos.y + Math.sin(Date.now() * 0.003 + i) * 0.1;
      mesh.position.z = pos.z - delay * 1.5;
      mesh.material.opacity = 0.15 - i * 0.025;
      mesh.scale.setScalar(1 - i * 0.12);
    });
  });

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i} ref={(el) => (trailsRef.current[i] = el)}>
          <sphereGeometry args={[0.5, 12, 12]} />
          <meshBasicMaterial color={color} transparent opacity={0.1} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </>
  );
}

/* ─── Individual Animal Entity ─── */
function AnimalEntity({ animal }) {
  const meshRef = useRef();
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [pulseAmount, setPulseAmount] = useState(0);
  const nurture = useStore((s) => s.nurture);
  const selectAnimal = useStore((s) => s.selectAnimal);
  const luminance = useStore(
    (s) => s.animals.find((a) => a.id === animal.id)?.luminance ?? 1
  );

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(animal.color) },
      uEmissive: { value: new THREE.Color(animal.emissive) },
      uLuminance: { value: luminance },
      uPulse: { value: 0 },
    }),
    [animal.color, animal.emissive]
  );

  useFrame((state) => {
    if (!meshRef.current) return;
    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uLuminance.value = THREE.MathUtils.lerp(
      uniforms.uLuminance.value,
      luminance,
      0.05
    );
    uniforms.uPulse.value = THREE.MathUtils.lerp(uniforms.uPulse.value, pulseAmount, 0.08);
    if (pulseAmount > 0) setPulseAmount((p) => Math.max(p - 0.008, 0));

    // Gentle hover scale
    const targetScale = hovered ? 1.12 : 1;
    meshRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.1
    );
  });

  const handleClick = useCallback(
    (e) => {
      e.stopPropagation();
      nurture(animal.id);
      selectAnimal(animal.id);
      setPulseAmount(1.5);

      // GSAP glow pulse on the group
      if (groupRef.current) {
        gsap.fromTo(
          groupRef.current.scale,
          { x: 1.15, y: 1.15, z: 1.15 },
          { x: 1, y: 1, z: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)' }
        );
      }
    },
    [animal.id, nurture, selectAnimal]
  );

  // Choose geometry based on animal type
  const AnimalGeometry = useMemo(() => {
    switch (animal.id) {
      case 'qaswa': // Camel — tall, elongated icosahedron
        return <icosahedronGeometry args={[1.1, 3]} />;
      case 'duldul': // Mule — solid dodecahedron
        return <dodecahedronGeometry args={[0.95, 2]} />;
      case 'sakb': // Horse — sleek octahedron
        return <octahedronGeometry args={[1.0, 3]} />;
      case 'ufayr': // Donkey — humble sphere
        return <sphereGeometry args={[0.85, 32, 32]} />;
      default:
        return <icosahedronGeometry args={[1, 2]} />;
    }
  }, [animal.id]);

  // Scale multipliers per animal
  const scaleMap = {
    qaswa: [1.2, 1.6, 1.2],
    duldul: [1.1, 1.1, 1.3],
    sakb: [0.9, 1.1, 1.4],
    ufayr: [1.0, 0.9, 1.0],
  };
  const baseScale = scaleMap[animal.id] || [1, 1, 1];

  // Float speed per animal
  const floatSpeed = animal.id === 'sakb' ? 4 : animal.id === 'qaswa' ? 1.2 : 2;

  return (
    <group ref={groupRef} position={animal.position}>
      <Float speed={floatSpeed} rotationIntensity={0.4} floatIntensity={0.6}>
        <mesh
          ref={meshRef}
          scale={baseScale}
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
        >
          {AnimalGeometry}
          <shaderMaterial
            vertexShader={luminousVertexShader}
            fragmentShader={luminousFragmentShader}
            uniforms={uniforms}
            transparent
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>

        {/* Inner core glow sphere */}
        <mesh scale={[baseScale[0] * 0.6, baseScale[1] * 0.6, baseScale[2] * 0.6]}>
          <sphereGeometry args={[0.8, 16, 16]} />
          <meshBasicMaterial
            color={animal.color}
            transparent
            opacity={0.15 * luminance}
          />
        </mesh>

        {/* Outer aura */}
        <mesh scale={[baseScale[0] * 1.6, baseScale[1] * 1.6, baseScale[2] * 1.6]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial
            color={animal.emissive}
            transparent
            opacity={0.04 * luminance}
            side={THREE.BackSide}
          />
        </mesh>

        {/* Point light emanating from entity */}
        <pointLight
          color={animal.color}
          intensity={luminance * 2}
          distance={8}
          decay={2}
        />
      </Float>

      {/* Motion trail only for Al-Sakb (horse) */}
      {animal.id === 'sakb' && (
        <MotionTrail color={animal.color} parentRef={groupRef} />
      )}
    </group>
  );
}

/* ─── Master AnimalFactory ─── */
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
