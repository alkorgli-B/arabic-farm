'use client';
import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import useStore from '../store/useStore';

export default function CinematicCamera() {
  const cameraRef = useRef();
  const controlsRef = useRef();
  const cameraTarget = useStore((s) => s.cameraTarget);
  const selectedAnimal = useStore((s) => s.selectedAnimal);
  const prevTarget = useRef(null);

  const { gl } = useThree();

  // Default overview position
  const defaultPos = { x: 0, y: 10, z: 20 };
  const defaultLookAt = { x: 0, y: 0, z: 0 };

  useEffect(() => {
    if (!cameraRef.current || !controlsRef.current) return;

    const camera = cameraRef.current;
    const controls = controlsRef.current;

    if (cameraTarget && selectedAnimal) {
      // Compute position offset (above and in front of animal)
      const targetPos = {
        x: cameraTarget[0] + 3,
        y: cameraTarget[1] + 5,
        z: cameraTarget[2] + 8,
      };
      const lookAtPos = {
        x: cameraTarget[0],
        y: cameraTarget[1] + 1,
        z: cameraTarget[2],
      };

      // Animate camera position
      gsap.to(camera.position, {
        x: targetPos.x,
        y: targetPos.y,
        z: targetPos.z,
        duration: 1.8,
        ease: 'power3.inOut',
      });

      // Animate orbit controls target
      gsap.to(controls.target, {
        x: lookAtPos.x,
        y: lookAtPos.y,
        z: lookAtPos.z,
        duration: 1.8,
        ease: 'power3.inOut',
        onUpdate: () => controls.update(),
      });

      prevTarget.current = cameraTarget;
    } else if (!selectedAnimal && prevTarget.current) {
      // Return to overview
      gsap.to(camera.position, {
        ...defaultPos,
        duration: 2.0,
        ease: 'power3.inOut',
      });

      gsap.to(controls.target, {
        ...defaultLookAt,
        duration: 2.0,
        ease: 'power3.inOut',
        onUpdate: () => controls.update(),
      });

      prevTarget.current = null;
    }
  }, [cameraTarget, selectedAnimal]);

  return (
    <>
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        position={[defaultPos.x, defaultPos.y, defaultPos.z]}
        fov={50}
        near={0.1}
        far={200}
      />
      <OrbitControls
        ref={controlsRef}
        args={[cameraRef.current, gl.domElement]}
        enablePan={false}
        maxPolarAngle={Math.PI / 2.1}
        minDistance={4}
        maxDistance={35}
        enableDamping
        dampingFactor={0.05}
        rotateSpeed={0.5}
      />
    </>
  );
}
