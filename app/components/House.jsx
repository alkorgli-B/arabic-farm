export default function House({ position, color }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[4, 4, 4]} />
      <meshBasicMaterial color={color} wireframe transparent opacity={0.3} />
    </mesh>
  );
}
