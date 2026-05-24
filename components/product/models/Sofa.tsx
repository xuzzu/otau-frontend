"use client";

import { RoundedBox } from "@react-three/drei";

const OAK = "#8c6f4f";

export function Sofa({ color = "#E8DFCC" }: { color?: string }) {
  return (
    <group position={[0, -0.35, 0]}>
      {/* Base / frame */}
      <RoundedBox args={[2.6, 0.35, 1.1]} radius={0.04} smoothness={4} position={[0, 0.05, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={OAK} roughness={0.6} metalness={0.05} />
      </RoundedBox>

      {/* Three seat cushions */}
      {[-0.85, 0, 0.85].map((x, i) => (
        <RoundedBox
          key={i}
          args={[0.78, 0.32, 0.92]}
          radius={0.12}
          smoothness={6}
          position={[x, 0.42, 0.05]}
          castShadow
        >
          <meshStandardMaterial color={color} roughness={0.85} />
        </RoundedBox>
      ))}

      {/* Three back cushions */}
      {[-0.85, 0, 0.85].map((x, i) => (
        <RoundedBox
          key={`b${i}`}
          args={[0.78, 0.62, 0.28]}
          radius={0.1}
          smoothness={6}
          position={[x, 0.78, -0.42]}
          rotation={[0.08, 0, 0]}
          castShadow
        >
          <meshStandardMaterial color={color} roughness={0.85} />
        </RoundedBox>
      ))}

      {/* Arms */}
      {[-1.4, 1.4].map((x, i) => (
        <RoundedBox
          key={`a${i}`}
          args={[0.22, 0.55, 1.05]}
          radius={0.1}
          smoothness={6}
          position={[x, 0.5, 0]}
          castShadow
        >
          <meshStandardMaterial color={color} roughness={0.85} />
        </RoundedBox>
      ))}

      {/* Legs */}
      {[
        [-1.2, -0.45],
        [1.2, -0.45],
        [-1.2, 0.45],
        [1.2, 0.45],
      ].map(([x, z], i) => (
        <mesh key={`l${i}`} position={[x, -0.18, z]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.18, 12]} />
          <meshStandardMaterial color="#3d2a1c" roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}
