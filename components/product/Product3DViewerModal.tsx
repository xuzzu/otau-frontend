"use client";

/**
 * Modal GLB viewer opened from the catalog/front/side thumbnail strip.
 * Lazy-mounts the Canvas only when `open=true` so the GLB isn't fetched until
 * the user actually clicks the 3D tile.
 */

import { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  ContactShadows,
  Environment,
  Bounds,
  PerspectiveCamera,
  useGLTF,
} from "@react-three/drei";
import { AnimatePresence, motion } from "framer-motion";

function GLBScene({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

export function Product3DViewerModal({
  open,
  onClose,
  url,
  label,
}: {
  open: boolean;
  onClose: () => void;
  url: string;
  label: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(26,22,18,0.84)",
            backdropFilter: "blur(6px)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 32,
          }}
          role="dialog"
          aria-modal="true"
          aria-label={`3D view of ${label}`}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              width: "min(1100px, 100%)",
              height: "min(80vh, 800px)",
              background:
                "radial-gradient(ellipse at 50% 60%, #FBF8F2 0%, #F4EFE6 70%, #E8DFD0 100%)",
              border: "1px solid var(--color-hair)",
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
              <PerspectiveCamera makeDefault position={[2.6, 1.6, 3.6]} fov={32} />
              <ambientLight intensity={0.45} />
              <directionalLight
                position={[5, 7, 4]}
                intensity={1.5}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
              />
              <directionalLight position={[-4, 3, -2]} intensity={0.4} />

              <Suspense fallback={null}>
                <Environment preset="apartment" />
                <Bounds fit clip observe margin={1.4}>
                  <GLBScene url={url} />
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
                enablePan={false}
                enableZoom
                minPolarAngle={Math.PI * 0.05}
                maxPolarAngle={Math.PI * 0.62}
              />
            </Canvas>

            <button
              onClick={onClose}
              aria-label="Close 3D viewer"
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                width: 36,
                height: 36,
                border: "1px solid var(--color-hair)",
                background: "rgba(251,248,242,0.94)",
                color: "var(--color-ink)",
                cursor: "pointer",
                fontFamily: "var(--font-mono)",
                fontSize: 14,
                lineHeight: 1,
              }}
            >
              ×
            </button>

            <div
              style={{
                position: "absolute",
                left: 20,
                bottom: 20,
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--color-ink)",
                opacity: 0.6,
              }}
            >
              {label} — 3D · drag to rotate, scroll to zoom
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
