"use client";

import { RoundedBox } from "@react-three/drei";

export function DiningChair({ color = "#C9A57E" }: { color?: string }) {
  const wood = "#8c6f4f";
  return (
    <group position={[0, -0.6, 0]}>
      {/* Seat */}
      <RoundedBox args={[0.5, 0.06, 0.5]} radius={0.04} smoothness={4} position={[0, 0.55, 0]} castShadow>
        <meshStandardMaterial color={color} roughness={0.75} />
      </RoundedBox>

      {/* Back upper rail */}
      <RoundedBox args={[0.48, 0.06, 0.04]} radius={0.02} smoothness={4} position={[0, 1.05, -0.22]} castShadow>
        <meshStandardMaterial color={wood} roughness={0.5} />
      </RoundedBox>

      {/* Back vertical slats */}
      {[-0.18, -0.06, 0.06, 0.18].map((x, i) => (
        <mesh key={i} position={[x, 0.82, -0.22]} castShadow>
          <boxGeometry args={[0.03, 0.5, 0.03]} />
          <meshStandardMaterial color={wood} roughness={0.5} />
        </mesh>
      ))}

      {/* Legs */}
      {[
        [-0.22, -0.22],
        [0.22, -0.22],
        [-0.22, 0.22],
        [0.22, 0.22],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.27, z]} castShadow>
          <cylinderGeometry args={[0.025, 0.025, 0.55, 12]} />
          <meshStandardMaterial color={wood} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}
