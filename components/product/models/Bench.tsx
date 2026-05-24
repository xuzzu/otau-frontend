"use client";

import { RoundedBox } from "@react-three/drei";

export function Bench({ color = "#C9A57E" }: { color?: string }) {
  return (
    <group position={[0, -0.45, 0]}>
      {/* Top */}
      <RoundedBox args={[1.6, 0.08, 0.42]} radius={0.04} smoothness={4} position={[0, 0.42, 0]} castShadow>
        <meshStandardMaterial color={color} roughness={0.55} />
      </RoundedBox>
      {/* Legs */}
      {[
        [-0.7, -0.16],
        [0.7, -0.16],
        [-0.7, 0.16],
        [0.7, 0.16],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.18, z]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.4, 12]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}
