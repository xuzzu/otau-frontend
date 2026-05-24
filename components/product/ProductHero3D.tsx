"use client";

/**
 * ProductHero3D — R3F-backed 360° viewer with procedural models.
 *
 * Future: to swap a procedural model for a real GLB, drop the file into
 *   web/public/models/<id>.glb
 * and replace <ProductModel /> with something like:
 *
 *   import { useGLTF } from "@react-three/drei";
 *   const { scene } = useGLTF(`/models/${product.id}.glb`);
 *   return <primitive object={scene} />;
 *
 * Free CC0 sources: Poly Pizza (poly.pizza), Sketchfab CC0 filter,
 * KhronosGroup/glTF-Sample-Models on GitHub.
 */

import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  ContactShadows,
  Environment,
  Bounds,
  PerspectiveCamera,
} from "@react-three/drei";
import { AnimatePresence, motion } from "framer-motion";
import { ProductModel } from "./models";
import { useT } from "@/lib/i18n";
import type { ModelKey } from "@/lib/products";

export function ProductHero3D({
  kind,
  color,
}: {
  kind: ModelKey;
  color: string;
}) {
  const { t } = useT();
  const [hint, setHint] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setHint(false), 3800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background:
          "radial-gradient(ellipse at 50% 60%, #FBF8F2 0%, #F4EFE6 70%, #E8DFD0 100%)",
        overflow: "hidden",
      }}
      className="grain"
    >
      <Canvas
        shadows
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        style={{ width: "100%", height: "100%" }}
      >
        <PerspectiveCamera makeDefault position={[3.2, 1.8, 4.4]} fov={32} />

        {/* Soft lighting */}
        <ambientLight intensity={0.45} />
        <directionalLight
          position={[5, 7, 4]}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-left={-4}
          shadow-camera-right={4}
          shadow-camera-top={4}
          shadow-camera-bottom={-4}
        />
        <directionalLight position={[-4, 3, -2]} intensity={0.4} />

        <Suspense fallback={null}>
          <Environment preset="apartment" />
          <Bounds fit clip observe margin={1.4}>
            <ProductModel kind={kind} color={color} />
          </Bounds>
        </Suspense>

        <ContactShadows
          position={[0, -1.05, 0]}
          opacity={0.45}
          scale={8}
          blur={2.6}
          far={2.5}
        />

        <OrbitControls
          autoRotate
          autoRotateSpeed={0.9}
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI * 0.22}
          maxPolarAngle={Math.PI * 0.52}
        />
      </Canvas>

      {/* 360° chip */}
      <div
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          display: "flex",
          gap: 8,
          zIndex: 2,
        }}
      >
        <span
          className="chip"
          style={{ background: "rgba(251,248,242,.94)" }}
        >
          {t("product.three_60")}
        </span>
      </div>

      {/* Scale ruler */}
      <div
        style={{
          position: "absolute",
          left: 24,
          bottom: 24,
          display: "flex",
          alignItems: "flex-end",
          gap: 8,
          color: "var(--color-ink)",
          opacity: 0.55,
          zIndex: 2,
        }}
      >
        <svg width="20" height="64" viewBox="0 0 20 64">
          <path
            d="M10 0 V64 M4 0 H16 M4 64 H16"
            stroke="currentColor"
            strokeWidth="1.2"
            fill="none"
          />
        </svg>
        <div
          className="mono"
          style={{
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          {t("product.viewer.scale")}
        </div>
      </div>

      {/* Hint label */}
      <AnimatePresence>
        {hint && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "absolute",
              left: "50%",
              bottom: 28,
              transform: "translateX(-50%)",
              padding: "8px 14px",
              background: "rgba(26,22,18,.78)",
              color: "#FBF8F2",
              backdropFilter: "blur(8px)",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              zIndex: 2,
            }}
          >
            {t("product.viewer.hint")}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
