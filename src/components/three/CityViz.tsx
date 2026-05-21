"use client";

import { useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Group, Mesh } from "three";

interface Block {
  x: number;
  z: number;
  h: number;
  color: string;
  node?: boolean;
}

function useBlocks(): Block[] {
  return useMemo(() => {
    const blocks: Block[] = [];
    const colors = ["#1e3a5f", "#234b73", "#1b4d6b", "#2a5a7a"];
    for (let i = -4; i <= 4; i++) {
      for (let j = -4; j <= 4; j++) {
        const d = Math.sqrt(i * i + j * j);
        if (d > 4.6) continue;
        const h = Math.max(0.2, 2.4 - d * 0.4 + Math.sin(i * 1.7 + j) * 0.4);
        blocks.push({
          x: i * 1.15,
          z: j * 1.15,
          h,
          color: colors[(i + j + 8) % colors.length],
          node: (i + j) % 3 === 0 && d > 1,
        });
      }
    }
    return blocks;
  }, []);
}

function DataNode({ x, z, h }: { x: number; z: number; h: number }) {
  const ref = useRef<Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime;
      const s = 0.12 + Math.abs(Math.sin(t * 2 + x + z)) * 0.06;
      ref.current.scale.setScalar(s);
    }
  });
  return (
    <mesh ref={ref} position={[x, h + 0.5, z]}>
      <sphereGeometry args={[1, 12, 12]} />
      <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={2} toneMapped={false} />
    </mesh>
  );
}

function Scene() {
  const group = useRef<Group>(null);
  const blocks = useBlocks();
  useFrame((state, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.12;
  });

  return (
    <group ref={group} rotation={[0, 0.4, 0]}>
      {/* water plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[16, 16]} />
        <meshStandardMaterial color="#0b2a44" metalness={0.7} roughness={0.25} transparent opacity={0.85} />
      </mesh>
      {blocks.map((b, i) => (
        <group key={i}>
          <mesh position={[b.x, b.h / 2, b.z]} castShadow>
            <boxGeometry args={[0.85, b.h, 0.85]} />
            <meshStandardMaterial color={b.color} metalness={0.3} roughness={0.6} />
          </mesh>
          {b.node && <DataNode x={b.x} z={b.z} h={b.h} />}
        </group>
      ))}
      {/* central tower (stadhuis) */}
      <mesh position={[0, 1.8, 0]}>
        <boxGeometry args={[0.6, 3.6, 0.6]} />
        <meshStandardMaterial color="#3b6ea5" metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[0, 3.9, 0]}>
        <coneGeometry args={[0.5, 1, 4]} />
        <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={1.2} toneMapped={false} />
      </mesh>
    </group>
  );
}

export default function CityViz() {
  const [lost, setLost] = useState(false);
  const [renderKey, setRenderKey] = useState(0);

  return (
    <div className="relative h-full w-full">
      <Canvas
        key={renderKey}
        camera={{ position: [8, 7, 8], fov: 42 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ width: "100%", height: "100%" }}
        onCreated={({ gl }) => {
          const canvas = gl.domElement;
          // Handle GPU context loss (tab backgrounded, low VRAM) so the viewer
          // can recover instead of going permanently black.
          canvas.addEventListener(
            "webglcontextlost",
            (e) => {
              e.preventDefault();
              setLost(true);
            },
            false,
          );
          canvas.addEventListener("webglcontextrestored", () => setLost(false), false);
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[6, 10, 4]} intensity={1.1} />
        <pointLight position={[-6, 4, -6]} intensity={0.6} color="#0ea5e9" />
        <Scene />
        <fog attach="fog" args={["#0a0f1e", 14, 28]} />
      </Canvas>

      {lost && (
        <button
          onClick={() => {
            setLost(false);
            setRenderKey((k) => k + 1); // remount Canvas → fresh WebGL context
          }}
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-ink/80 text-xs text-muted-foreground backdrop-blur"
        >
          <span>3D-weergave onderbroken (WebGL-context verloren)</span>
          <span className="rounded-md border border-water/40 px-3 py-1.5 font-medium text-water">
            Klik om te herstellen
          </span>
        </button>
      )}
    </div>
  );
}
