'use client';
import React, { useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import gsap from 'gsap';
import useStore from '../store/useStore';

export default function CinematicCamera() {
  const cameraRef = useRef();
  const controlsRef = useRef();
  const cameraTarget = useStore((s) => s.cameraTarget);
  const selectedAnimal = useStore((s) => s.selectedAnimal);
  const prevTarget = useRef(null);

  const { gl } = useThree();

  // Default overview — higher and further for farm panorama
  const defaultPos = { x: 0, y: 12, z: 22 };
  const defaultLookAt = { x: 0, y: 1, z: 0 };

  useEffect(() => {
    if (!cameraRef.current || !controlsRef.current) return;

    const camera = cameraRef.current;
    const controls = controlsRef.current;

    if (cameraTarget && selectedAnimal) {
      // Close zoom-in on animal — slightly above and in front
      const targetPos = {
        x: cameraTarget[0] + 2.5,
        y: cameraTarget[1] + 3,
        z: cameraTarget[2] + 5,
      };
      const lookAtPos = {
        x: cameraTarget[0],
        y: cameraTarget[1] + 1.5,
        z: cameraTarget[2],
      };

      gsap.to(camera.position, {
        x: targetPos.x,
        y: targetPos.y,
        z: targetPos.z,
        duration: 2.0,
        ease: 'power2.inOut',
      });

      gsap.to(controls.target, {
        x: lookAtPos.x,
        y: lookAtPos.y,
        z: lookAtPos.z,
        duration: 2.0,
        ease: 'power2.inOut',
        onUpdate: () => controls.update(),
      });

      prevTarget.current = cameraTarget;
    } else if (!selectedAnimal && prevTarget.current) {
      // Return to panoramic overview
      gsap.to(camera.position, {
        ...defaultPos,
        duration: 2.2,
        ease: 'power2.inOut',
      });

      gsap.to(controls.target, {
        ...defaultLookAt,
        duration: 2.2,
        ease: 'power2.inOut',
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
        fov={45}
        near={0.1}
        far={500}
      />
      <OrbitControls
        ref={controlsRef}
        args={[cameraRef.current, gl.domElement]}
        enablePan={false}
        maxPolarAngle={Math.PI / 2.2}
        minPolarAngle={0.2}
        minDistance={3}
        maxDistance={40}
        enableDamping
        dampingFactor={0.06}
        rotateSpeed={0.4}
        target={[defaultLookAt.x, defaultLookAt.y, defaultLookAt.z]}
      />
    </>
  );
}
