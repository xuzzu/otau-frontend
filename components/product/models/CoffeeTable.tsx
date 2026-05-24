"use client";

import { RoundedBox } from "@react-three/drei";

export function CoffeeTable({ color = "#C9A57E" }: { color?: string }) {
  return (
    <group position={[0, -0.35, 0]}>
      {/* Top */}
      <RoundedBox args={[1.6, 0.08, 0.9]} radius={0.04} smoothness={4} position={[0, 0.42, 0]} castShadow>
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.05} />
      </RoundedBox>

      {/* Legs */}
      {[
        [-0.72, -0.38],
        [0.72, -0.38],
        [-0.72, 0.38],
        [0.72, 0.38],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.18, z]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.42, 14]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}
