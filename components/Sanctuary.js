'use client';
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sky, Cloud, ContactShadows, Environment } from '@react-three/drei';
import * as THREE from 'three';
import useStore from '../store/useStore';

/* ═══════════════════════════════════════════
   Procedural Terrain — grass + dirt paths
   ═══════════════════════════════════════════ */
function Terrain() {
  const materialRef = useRef();

  const terrainShader = useMemo(
    () => ({
      uniforms: {
        uTime: { value: 0 },
        uGrassColor1: { value: new THREE.Color('#4A7C2E') },
        uGrassColor2: { value: new THREE.Color('#6B9F3B') },
        uDirtColor: { value: new THREE.Color('#8B7355') },
        uPathColor: { value: new THREE.Color('#A09070') },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldPos;
        void main() {
          vUv = uv;
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPos = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uGrassColor1;
        uniform vec3 uGrassColor2;
        uniform vec3 uDirtColor;
        uniform vec3 uPathColor;
        varying vec2 vUv;
        varying vec3 vWorldPos;

        // Hash-based noise
        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }

        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));
          return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }

        float fbm(vec2 p) {
          float v = 0.0;
          float a = 0.5;
          for (int i = 0; i < 4; i++) {
            v += a * noise(p);
            p *= 2.0;
            a *= 0.5;
          }
          return v;
        }

        void main() {
          vec2 worldUv = vWorldPos.xz * 0.08;

          // Grass variation
          float grassNoise = fbm(worldUv * 8.0);
          vec3 grass = mix(uGrassColor1, uGrassColor2, grassNoise);

          // Dirt patches
          float dirtNoise = fbm(worldUv * 3.0 + 10.0);
          float dirtMask = smoothstep(0.55, 0.7, dirtNoise);

          // Paths between animal areas (radial from center)
          float pathDist = abs(vWorldPos.x) * 0.08;
          float pathMask = smoothstep(0.8, 0.6, pathDist) * 0.3;
          // Cross paths
          float crossPath = smoothstep(0.15, 0.05, abs(fract(vWorldPos.z * 0.05) - 0.5));
          pathMask += crossPath * 0.15;

          vec3 ground = mix(grass, uDirtColor, dirtMask * 0.4);
          ground = mix(ground, uPathColor, pathMask);

          // Subtle wind shimmer
          float wind = sin(vWorldPos.x * 2.0 + uTime * 0.8) * sin(vWorldPos.z * 1.5 + uTime * 0.6) * 0.03;
          ground += vec3(wind * 0.5, wind, wind * 0.2);

          gl_FragColor = vec4(ground, 1.0);
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
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[80, 80, 1, 1]} />
      <shaderMaterial ref={materialRef} args={[terrainShader]} />
    </mesh>
  );
}

/* ═══════════════════════════════════════════
   Procedural Tree
   ═══════════════════════════════════════════ */
function Tree({ position, scale = 1, type = 'oak' }) {
  const treeRef = useRef();
  const initialY = useRef(Math.random() * Math.PI * 2);

  useFrame((state) => {
    if (!treeRef.current) return;
    // Gentle wind sway
    const t = state.clock.elapsedTime;
    treeRef.current.rotation.z = Math.sin(t * 0.5 + initialY.current) * 0.02 * scale;
  });

  if (type === 'palm') {
    return (
      <group ref={treeRef} position={position} scale={scale}>
        {/* Palm trunk — slightly curved */}
        <mesh position={[0, 2, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.18, 4, 8]} />
          <meshStandardMaterial color="#6B4E2F" roughness={0.9} />
        </mesh>
        {/* Palm fronds */}
        {[0, 60, 120, 180, 240, 300].map((angle, i) => (
          <mesh
            key={i}
            position={[
              Math.cos((angle * Math.PI) / 180) * 0.8,
              4.1,
              Math.sin((angle * Math.PI) / 180) * 0.8,
            ]}
            rotation={[
              0.7,
              (angle * Math.PI) / 180,
              0.3,
            ]}
            castShadow
          >
            <coneGeometry args={[0.15, 2.2, 4]} />
            <meshStandardMaterial color="#3B6B1E" roughness={0.7} side={THREE.DoubleSide} />
          </mesh>
        ))}
        {/* Date clusters */}
        <mesh position={[0.2, 3.8, 0.1]}>
          <sphereGeometry args={[0.12, 6, 6]} />
          <meshStandardMaterial color="#8B4513" roughness={0.8} />
        </mesh>
      </group>
    );
  }

  // Default: broad-leaf tree
  return (
    <group ref={treeRef} position={position} scale={scale}>
      {/* Trunk */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.25, 2.4, 7]} />
        <meshStandardMaterial color="#5C3A1E" roughness={0.95} />
      </mesh>
      {/* Canopy layers */}
      <mesh position={[0, 3, 0]} castShadow>
        <dodecahedronGeometry args={[1.4, 1]} />
        <meshStandardMaterial color="#3D6B1A" roughness={0.75} flatShading />
      </mesh>
      <mesh position={[0.4, 3.5, 0.3]} castShadow>
        <dodecahedronGeometry args={[0.9, 1]} />
        <meshStandardMaterial color="#4A7C2E" roughness={0.7} flatShading />
      </mesh>
      <mesh position={[-0.3, 2.8, -0.2]} castShadow>
        <dodecahedronGeometry args={[1.0, 1]} />
        <meshStandardMaterial color="#2F5515" roughness={0.8} flatShading />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════
   Shrub
   ═══════════════════════════════════════════ */
function Shrub({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.3, 0]} castShadow>
        <dodecahedronGeometry args={[0.45, 1]} />
        <meshStandardMaterial color="#4A7025" roughness={0.8} flatShading />
      </mesh>
      <mesh position={[0.25, 0.2, 0.15]}>
        <dodecahedronGeometry args={[0.3, 1]} />
        <meshStandardMaterial color="#3B6020" roughness={0.85} flatShading />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════
   Rock
   ═══════════════════════════════════════════ */
function Rock({ position, scale = 1 }) {
  return (
    <mesh position={position} scale={scale} castShadow rotation={[0, Math.random() * Math.PI, 0]}>
      <dodecahedronGeometry args={[0.35, 0]} />
      <meshStandardMaterial
        color="#7A7062"
        roughness={0.95}
        metalness={0.05}
        flatShading
      />
    </mesh>
  );
}

/* ═══════════════════════════════════════════
   Mud-Brick Stable / House
   ═══════════════════════════════════════════ */
function MudBrickStable({ position, rotation = 0, size = 'medium' }) {
  const w = size === 'large' ? 5 : size === 'medium' ? 4 : 3.5;
  const d = size === 'large' ? 4 : 3;
  const wallH = 2.2;

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Back wall */}
      <mesh position={[0, wallH / 2, -d / 2]} castShadow receiveShadow>
        <boxGeometry args={[w, wallH, 0.3]} />
        <meshStandardMaterial color="#B8956B" roughness={0.95} metalness={0.02} />
      </mesh>
      {/* Left wall */}
      <mesh position={[-w / 2, wallH / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.3, wallH, d]} />
        <meshStandardMaterial color="#A8855B" roughness={0.95} metalness={0.02} />
      </mesh>
      {/* Right wall */}
      <mesh position={[w / 2, wallH / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.3, wallH, d]} />
        <meshStandardMaterial color="#A8855B" roughness={0.95} metalness={0.02} />
      </mesh>
      {/* Half front walls (open entrance) */}
      <mesh position={[-w / 2 + 0.5, wallH / 2, d / 2]} castShadow receiveShadow>
        <boxGeometry args={[1, wallH, 0.3]} />
        <meshStandardMaterial color="#B8956B" roughness={0.95} />
      </mesh>
      <mesh position={[w / 2 - 0.5, wallH / 2, d / 2]} castShadow receiveShadow>
        <boxGeometry args={[1, wallH, 0.3]} />
        <meshStandardMaterial color="#B8956B" roughness={0.95} />
      </mesh>

      {/* Wooden beam lintel */}
      <mesh position={[0, wallH - 0.05, d / 2]} castShadow>
        <boxGeometry args={[w - 1.7, 0.2, 0.35]} />
        <meshStandardMaterial color="#5C3A1E" roughness={0.9} />
      </mesh>

      {/* Wooden support beams (roof) */}
      {[-1.2, 0, 1.2].map((x, i) => (
        <mesh key={i} position={[x, wallH + 0.1, 0]} castShadow>
          <boxGeometry args={[0.12, 0.12, d + 0.6]} />
          <meshStandardMaterial color="#4A2C12" roughness={0.85} />
        </mesh>
      ))}

      {/* Palm-frond roof */}
      <mesh position={[0, wallH + 0.25, 0]} castShadow>
        <boxGeometry args={[w + 0.8, 0.15, d + 0.8]} />
        <meshStandardMaterial color="#6B7F3B" roughness={0.9} metalness={0.0} />
      </mesh>
      {/* Roof detail layer */}
      <mesh position={[0, wallH + 0.35, 0]}>
        <boxGeometry args={[w + 0.4, 0.08, d + 0.4]} />
        <meshStandardMaterial color="#5A6E30" roughness={0.95} />
      </mesh>

      {/* Ground — packed earth floor */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[w - 0.3, d - 0.3]} />
        <meshStandardMaterial color="#9B8060" roughness={1.0} />
      </mesh>

      {/* Feed trough */}
      <mesh position={[-w / 2 + 0.5, 0.4, -d / 2 + 0.6]} castShadow>
        <boxGeometry args={[0.6, 0.4, 0.4]} />
        <meshStandardMaterial color="#5C3A1E" roughness={0.9} />
      </mesh>
      {/* Hay inside trough */}
      <mesh position={[-w / 2 + 0.5, 0.65, -d / 2 + 0.6]}>
        <sphereGeometry args={[0.2, 6, 4]} />
        <meshStandardMaterial color="#C4A035" roughness={0.95} flatShading />
      </mesh>

      {/* Water bowl */}
      <mesh position={[w / 2 - 0.5, 0.15, -d / 2 + 0.6]} castShadow>
        <cylinderGeometry args={[0.25, 0.2, 0.3, 8]} />
        <meshStandardMaterial color="#6B4E2F" roughness={0.85} />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════
   Fence Segments
   ═══════════════════════════════════════════ */
function Fence({ start, end }) {
  const dx = end[0] - start[0];
  const dz = end[2] - start[2];
  const length = Math.sqrt(dx * dx + dz * dz);
  const angle = Math.atan2(dx, dz);
  const midX = (start[0] + end[0]) / 2;
  const midZ = (start[2] + end[2]) / 2;
  const postCount = Math.max(2, Math.floor(length / 1.5));

  return (
    <group>
      {/* Horizontal rails */}
      <mesh position={[midX, 0.5, midZ]} rotation={[0, angle, 0]} castShadow>
        <boxGeometry args={[0.06, 0.06, length]} />
        <meshStandardMaterial color="#5C3A1E" roughness={0.9} />
      </mesh>
      <mesh position={[midX, 0.9, midZ]} rotation={[0, angle, 0]} castShadow>
        <boxGeometry args={[0.06, 0.06, length]} />
        <meshStandardMaterial color="#5C3A1E" roughness={0.9} />
      </mesh>
      {/* Posts */}
      {Array.from({ length: postCount }).map((_, i) => {
        const t = i / (postCount - 1);
        const px = start[0] + dx * t;
        const pz = start[2] + dz * t;
        return (
          <mesh key={i} position={[px, 0.55, pz]} castShadow>
            <cylinderGeometry args={[0.04, 0.05, 1.1, 6]} />
            <meshStandardMaterial color="#4A2C12" roughness={0.92} />
          </mesh>
        );
      })}
    </group>
  );
}

/* ═══════════════════════════════════════════
   Dust Motes (floating particles in golden light)
   ═══════════════════════════════════════════ */
function DustMotes({ count = 200 }) {
  const pointsRef = useRef();

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = Math.random() * 8 + 0.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30;
      vel[i] = 0.002 + Math.random() * 0.008;
    }
    return { positions: pos, velocities: vel };
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const posArr = pointsRef.current.geometry.attributes.position.array;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      posArr[i * 3] += Math.sin(t * 0.3 + i * 0.5) * 0.003;
      posArr[i * 3 + 1] += Math.sin(t * 0.2 + i) * 0.001;
      posArr[i * 3 + 2] += Math.cos(t * 0.25 + i * 0.3) * 0.003;
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
        size={0.04}
        color="#FFE4A0"
        transparent
        opacity={0.35}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

/* ═══════════════════════════════════════════
   Scattered Vegetation Generator
   ═══════════════════════════════════════════ */
function VegetationLayer() {
  const items = useMemo(() => {
    const result = [];
    const rng = (seed) => {
      let s = seed;
      return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
    };
    const rand = rng(42);

    // Trees
    const treePositions = [
      [-18, 0, -8], [-15, 0, 6], [-20, 0, 2], [18, 0, -6], [16, 0, 8],
      [20, 0, 0], [-12, 0, 12], [12, 0, -12], [0, 0, -14], [0, 0, 14],
      [-22, 0, -14], [22, 0, 14], [-8, 0, -15], [8, 0, 15],
    ];
    treePositions.forEach((pos, i) => {
      result.push({
        type: i % 3 === 0 ? 'palm' : 'tree',
        position: pos,
        scale: 0.8 + rand() * 0.6,
        key: `tree-${i}`,
      });
    });

    // Shrubs
    for (let i = 0; i < 25; i++) {
      result.push({
        type: 'shrub',
        position: [(rand() - 0.5) * 40, 0, (rand() - 0.5) * 40],
        scale: 0.5 + rand() * 0.8,
        key: `shrub-${i}`,
      });
    }

    // Rocks
    for (let i = 0; i < 15; i++) {
      result.push({
        type: 'rock',
        position: [(rand() - 0.5) * 35, 0, (rand() - 0.5) * 35],
        scale: 0.4 + rand() * 0.8,
        key: `rock-${i}`,
      });
    }

    return result;
  }, []);

  return (
    <group>
      {items.map((item) => {
        switch (item.type) {
          case 'palm':
            return <Tree key={item.key} position={item.position} scale={item.scale} type="palm" />;
          case 'tree':
            return <Tree key={item.key} position={item.position} scale={item.scale} type="oak" />;
          case 'shrub':
            return <Shrub key={item.key} position={item.position} scale={item.scale} />;
          case 'rock':
            return <Rock key={item.key} position={item.position} scale={item.scale} />;
          default:
            return null;
        }
      })}
    </group>
  );
}

/* ═══════════════════════════════════════════
   Master Sanctuary Component
   ═══════════════════════════════════════════ */
export default function Sanctuary() {
  const animals = useStore((s) => s.animals);

  return (
    <group>
      {/* ── Realistic Sky — Golden Hour ── */}
      <Sky
        distance={450000}
        sunPosition={[80, 20, -50]}
        inclination={0.52}
        azimuth={0.25}
        turbidity={4}
        rayleigh={1.5}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
      />

      {/* Soft clouds */}
      <Cloud position={[-20, 18, -15]} speed={0.15} opacity={0.4} width={12} depth={4} segments={20} />
      <Cloud position={[15, 22, -20]} speed={0.1} opacity={0.3} width={16} depth={5} segments={25} />
      <Cloud position={[0, 20, 15]} speed={0.12} opacity={0.25} width={10} depth={3} segments={15} />

      {/* ── Terrain ── */}
      <Terrain />

      {/* ── Vegetation ── */}
      <VegetationLayer />

      {/* ── Dust Motes in golden light ── */}
      <DustMotes count={150} />

      {/* ── Mud-Brick Stables for each animal ── */}
      <MudBrickStable position={[-10, 0, -7]} rotation={0} size="large" />
      <MudBrickStable position={[-3.5, 0, 2]} rotation={Math.PI} size="medium" />
      <MudBrickStable position={[3.5, 0, 2]} rotation={Math.PI} size="medium" />
      <MudBrickStable position={[10, 0, -7]} rotation={0} size="large" />

      {/* ── Fences ── */}
      <Fence start={[-14, 0, -10]} end={[-6, 0, -10]} />
      <Fence start={[-14, 0, -10]} end={[-14, 0, -1]} />
      <Fence start={[-6, 0, -10]} end={[-6, 0, -1]} />

      <Fence start={[6, 0, -10]} end={[14, 0, -10]} />
      <Fence start={[6, 0, -10]} end={[6, 0, -1]} />
      <Fence start={[14, 0, -10]} end={[14, 0, -1]} />

      <Fence start={[-6.5, 0, 0]} end={[-0.5, 0, 0]} />
      <Fence start={[-6.5, 0, 0]} end={[-6.5, 0, 8]} />
      <Fence start={[-0.5, 0, 8]} end={[-6.5, 0, 8]} />

      <Fence start={[0.5, 0, 0]} end={[6.5, 0, 0]} />
      <Fence start={[6.5, 0, 0]} end={[6.5, 0, 8]} />
      <Fence start={[0.5, 0, 8]} end={[6.5, 0, 8]} />

      {/* ── Lighting — Physical Sun ── */}
      <directionalLight
        position={[30, 25, -20]}
        intensity={2.5}
        color="#FFF0D0"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={80}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-bias={-0.0005}
      />
      <ambientLight intensity={0.4} color="#B8C4D0" />
      <hemisphereLight skyColor="#87CEEB" groundColor="#5C4033" intensity={0.5} />

      {/* Warm fill light */}
      <pointLight position={[0, 6, 0]} intensity={0.8} color="#FFD090" distance={30} decay={2} />

      {/* ── Contact shadows for grounding ── */}
      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={0.5}
        scale={60}
        blur={2.5}
        far={12}
        resolution={512}
        color="#3A2A1A"
      />

      {/* ── HDRI Environment (desert/farm) ── */}
      <Environment preset="park" background={false} />
    </group>
  );
}
