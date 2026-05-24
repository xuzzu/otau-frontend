"use client";

import { RoundedBox } from "@react-three/drei";

export function Console({ color = "#8B5E3C" }: { color?: string }) {
  return (
    <group position={[0, -0.6, 0]}>
      {/* Body */}
      <RoundedBox args={[1.8, 0.55, 0.42]} radius={0.04} smoothness={4} position={[0, 0.55, 0]} castShadow>
        <meshStandardMaterial color={color} roughness={0.45} />
      </RoundedBox>

      {/* Door split line */}
      <mesh position={[0, 0.55, 0.21]}>
        <boxGeometry args={[0.005, 0.55, 0.005]} />
        <meshStandardMaterial color="#1A1612" />
      </mesh>

      {/* Brass pulls */}
      {[-0.3, 0.3].map((x, i) => (
        <mesh key={i} position={[x, 0.55, 0.22]}>
          <cylinderGeometry args={[0.02, 0.02, 0.08, 14]} />
          <meshStandardMaterial color="#D8A05B" metalness={0.85} roughness={0.25} />
        </mesh>
      ))}

      {/* Legs */}
      {[
        [-0.8, -0.16],
        [0.8, -0.16],
        [-0.8, 0.16],
        [0.8, 0.16],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.13, z]} castShadow>
          <cylinderGeometry args={[0.025, 0.025, 0.3, 12]} />
          <meshStandardMaterial color="#3D2817" roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}
