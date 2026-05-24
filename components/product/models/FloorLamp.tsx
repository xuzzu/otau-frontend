"use client";

import { RoundedBox } from "@react-three/drei";

export function FloorLamp({ color = "#E8DFCC" }: { color?: string }) {
  return (
    <group position={[0, -0.9, 0]}>
      {/* Shade */}
      <mesh position={[0, 1.7, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.45, 0.42, 24, 1, true]} />
        <meshStandardMaterial color={color} roughness={0.9} side={2} emissive={color} emissiveIntensity={0.25} />
      </mesh>
      {/* Shade cap */}
      <mesh position={[0, 1.92, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.02, 24]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>

      {/* Stem */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.022, 0.022, 1.5, 14]} />
        <meshStandardMaterial color={"#D8A05B"} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Tripod legs */}
      {[0, 120, 240].map((deg, i) => (
        <group key={i} rotation={[0, (deg * Math.PI) / 180, 0]}>
          <mesh position={[0.32, 0.16, 0]} rotation={[0, 0, -0.38]} castShadow>
            <cylinderGeometry args={[0.022, 0.022, 0.7, 12]} />
            <meshStandardMaterial color={"#3d2a1c"} roughness={0.45} />
          </mesh>
        </group>
      ))}

      {/* Light at top — emissive sphere */}
      <mesh position={[0, 1.66, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial emissive="#FFD580" emissiveIntensity={1.4} color="#FFD580" />
      </mesh>
      <pointLight position={[0, 1.66, 0]} intensity={2} distance={3.5} decay={2} color="#FFE2B8" />
    </group>
  );
}
