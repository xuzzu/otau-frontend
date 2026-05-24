"use client";

import { RoundedBox } from "@react-three/drei";

export function Shelf({ color = "#C9A57E" }: { color?: string }) {
  return (
    <group position={[0, -1, 0]}>
      {/* Five horizontal shelves */}
      {[0, 0.45, 0.9, 1.35, 1.8].map((y, i) => (
        <RoundedBox
          key={i}
          args={[1.8, 0.05, 0.4]}
          radius={0.02}
          smoothness={4}
          position={[0, y, 0]}
          castShadow
        >
          <meshStandardMaterial color={color} roughness={0.55} />
        </RoundedBox>
      ))}
      {/* Vertical uprights */}
      {[-0.88, 0, 0.88].map((x, i) => (
        <mesh key={i} position={[x, 0.9, 0.18]} castShadow>
          <boxGeometry args={[0.04, 1.85, 0.04]} />
          <meshStandardMaterial color="#1A1612" roughness={0.4} metalness={0.4} />
        </mesh>
      ))}
      {[-0.88, 0, 0.88].map((x, i) => (
        <mesh key={`b${i}`} position={[x, 0.9, -0.18]} castShadow>
          <boxGeometry args={[0.04, 1.85, 0.04]} />
          <meshStandardMaterial color="#1A1612" roughness={0.4} metalness={0.4} />
        </mesh>
      ))}
    </group>
  );
}
