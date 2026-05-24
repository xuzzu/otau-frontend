"use client";

import { RoundedBox } from "@react-three/drei";

export function Armchair({ color = "#E8DFCC" }: { color?: string }) {
  return (
    <group position={[0, -0.35, 0]}>
      {/* Frame base */}
      <RoundedBox args={[1.0, 0.32, 0.95]} radius={0.06} smoothness={4} position={[0, 0.16, 0]} castShadow>
        <meshStandardMaterial color={"#8c6f4f"} roughness={0.6} />
      </RoundedBox>

      {/* Seat cushion */}
      <RoundedBox args={[0.92, 0.22, 0.85]} radius={0.1} smoothness={6} position={[0, 0.45, 0.04]} castShadow>
        <meshStandardMaterial color={color} roughness={0.85} />
      </RoundedBox>

      {/* Back */}
      <RoundedBox args={[0.92, 0.95, 0.22]} radius={0.12} smoothness={6} position={[0, 0.88, -0.4]} rotation={[0.1, 0, 0]} castShadow>
        <meshStandardMaterial color={color} roughness={0.85} />
      </RoundedBox>

      {/* Arms */}
      {[-0.5, 0.5].map((x, i) => (
        <RoundedBox key={i} args={[0.12, 0.55, 0.85]} radius={0.06} smoothness={6} position={[x, 0.46, 0]} castShadow>
          <meshStandardMaterial color={color} roughness={0.85} />
        </RoundedBox>
      ))}

      {/* Legs */}
      {[
        [-0.42, -0.4],
        [0.42, -0.4],
        [-0.42, 0.4],
        [0.42, 0.4],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, -0.05, z]} castShadow>
          <cylinderGeometry args={[0.035, 0.035, 0.2, 12]} />
          <meshStandardMaterial color="#3d2a1c" roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}
