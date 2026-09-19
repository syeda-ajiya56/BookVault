"use client";

import { useRef, useState } from "react";
import { useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { MathUtils, type Group } from "three";

const coverOptions = [
  { name: "Burgundy", color: "#3f1827", spine: "#6f263d" },
  { name: "Navy", color: "#19324a", spine: "#274b68" },
  { name: "Forest", color: "#1f4035", spine: "#2d604d" },
] as const;

type CoverName = (typeof coverOptions)[number]["name"];
type MaterialName = "Matte" | "Glossy";
type NavigatorWithConnection = Navigator & { connection?: { saveData?: boolean } };

type BookProps = {
  coverColor: (typeof coverOptions)[number];
  roughness: number;
  isOpen: boolean;
  reducedMotion: boolean;
};

function Book({ coverColor, roughness, isOpen, reducedMotion }: BookProps) {
  const frontCover = useRef<Group>(null);

  useEffect(() => {
    if (reducedMotion && frontCover.current) {
      frontCover.current.rotation.y = isOpen ? -Math.PI * 0.82 : 0;
    }
  }, [isOpen, reducedMotion]);

  useFrame((_, delta) => {
    if (!reducedMotion && frontCover.current) {
      frontCover.current.rotation.y = MathUtils.damp(
        frontCover.current.rotation.y,
        isOpen ? -Math.PI * 0.82 : 0,
        5,
        delta,
      );
    }
  });

  return (
    <group position={[0, 2.45, 0]} rotation={[0, -0.28, 0]}>
      <group ref={frontCover} position={[-1.54, 0, 0.43]}>
        <mesh castShadow receiveShadow position={[1.6, 0, 0]}>
          <boxGeometry args={[3.2, 4.9, 0.12]} />
          <meshStandardMaterial color={coverColor.color} roughness={roughness} />
        </mesh>
        <mesh castShadow position={[1.6, 0.35, 0.08]}>
          <boxGeometry args={[1.05, 1.35, 0.04]} />
          <meshStandardMaterial color="#b58a50" roughness={0.34} />
        </mesh>
        <mesh position={[1.6, 0.35, 0.11]}>
          <boxGeometry args={[0.78, 1.08, 0.02]} />
          <meshStandardMaterial color={coverColor.color} roughness={roughness} />
        </mesh>
      </group>
      <mesh castShadow receiveShadow position={[0, 0, -0.43]}>
        <boxGeometry args={[3.2, 4.9, 0.12]} />
        <meshStandardMaterial color={coverColor.color} roughness={roughness} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[3, 4.72, 0.72]} />
        <meshStandardMaterial color="#eadcc4" roughness={0.8} />
      </mesh>
      <mesh castShadow receiveShadow position={[-1.59, 0, 0]}>
        <boxGeometry args={[0.12, 4.9, 0.82]} />
        <meshStandardMaterial color={coverColor.spine} roughness={roughness} />
      </mesh>
    </group>
  );
}

type SceneProps = Omit<BookProps, "coverColor"> & {
  coverColor: (typeof coverOptions)[number];
  autoRotate: boolean;
};

function Scene({ coverColor, roughness, isOpen, autoRotate, reducedMotion }: SceneProps) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[7, 5.5, 8]} fov={38} />
      <ambientLight intensity={1.6} />
      <directionalLight
        castShadow
        intensity={3.2}
        position={[4, 8, 5]}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={30}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />
      <directionalLight intensity={1.1} position={[-4, 3, -4]} color="#eadcc4" />
      <Book coverColor={coverColor} roughness={roughness} isOpen={isOpen} reducedMotion={reducedMotion} />
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]}>
        <planeGeometry args={[20, 20]} />
        <shadowMaterial opacity={0.22} />
      </mesh>
      <ContactShadows blur={2.5} far={8} opacity={0.35} scale={8} position={[0, 0, 0]} />
      <OrbitControls
        autoRotate={autoRotate && !reducedMotion}
        autoRotateSpeed={0.7}
        enablePan={false}
        minDistance={5.5}
        maxDistance={12}
        target={[0, 2.35, 0]}
      />
    </>
  );
}

function StaticBookFallback() {
  return (
    <div className="h-[min(72vw,620px)] min-h-[360px] w-full rounded-card border border-border bg-[#d9c8ae] p-6 shadow-sm">
      <div className="flex h-full flex-col items-center justify-center gap-4 rounded-md border border-accent/30 bg-card/30 p-5 text-center">
        <div aria-hidden="true" className="relative h-52 w-36 -rotate-3 rounded-r-md border-4 border-[#32121f] bg-[#3f1827] shadow-[10px_10px_0_#eadcc4]">
          <div className="absolute inset-5 border-2 border-accent bg-[#3f1827]" />
          <div className="absolute left-[-10px] top-0 h-full w-2 rounded-l-sm bg-[#6f263d]" />
        </div>
        <p className="max-w-xs text-sm font-semibold text-primary">3D preview is unavailable on this device.</p>
        <p className="max-w-sm text-sm text-muted">A lightweight cover preview is shown instead.</p>
      </div>
    </div>
  );
}

function CapabilityLoading() {
  return (
    <div className="h-[min(72vw,620px)] min-h-[360px] w-full rounded-card border border-border bg-[#d9c8ae] p-6 shadow-sm">
      <div className="flex h-full items-center justify-center rounded-md border border-accent/30 bg-card/30 text-sm font-semibold text-primary">
        Checking preview support...
      </div>
    </div>
  );
}

export default function BookVault3D() {
  const [selectedCover, setSelectedCover] = useState<CoverName>("Burgundy");
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialName>("Matte");
  const [isOpen, setIsOpen] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [canRender3D, setCanRender3D] = useState<boolean | null>(null);
  const coverColor = coverOptions.find((option) => option.name === selectedCover) ?? coverOptions[0];
  const roughness = selectedMaterial === "Matte" ? 0.78 : 0.2;

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as NavigatorWithConnection).connection;
    const testCanvas = document.createElement("canvas");
    const hasWebGL = Boolean(testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl"));

    const updateMotionPreference = () => {
      setReducedMotion(motionQuery.matches);
      if (motionQuery.matches) {
        setAutoRotate(false);
      }
    };

    updateMotionPreference();
    setCanRender3D(hasWebGL && !connection?.saveData);
    motionQuery.addEventListener("change", updateMotionPreference);

    return () => motionQuery.removeEventListener("change", updateMotionPreference);
  }, []);

  if (canRender3D === null) {
    return <CapabilityLoading />;
  }

  if (!canRender3D) {
    return <StaticBookFallback />;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 rounded-card border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-3">
        <fieldset className="min-w-0 space-y-2">
          <legend className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Cover color</legend>
          <div className="flex flex-wrap gap-2">
            {coverOptions.map((option) => {
              const isSelected = option.name === selectedCover;

              return (
                <button
                  key={option.name}
                  type="button"
                  aria-label={`Use ${option.name} cover`}
                  aria-pressed={isSelected}
                  onClick={() => setSelectedCover(option.name)}
                  className={`inline-flex min-h-10 items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition-colors ${isSelected ? "border-primary bg-primary text-primary-foreground" : "border-border text-primary hover:border-primary"}`}
                >
                  <span aria-hidden="true" className="size-3 rounded-full border border-white/70" style={{ backgroundColor: option.color }} />
                  {option.name}
                  {isSelected && <span className="text-xs uppercase tracking-[0.12em]">Selected</span>}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="min-w-0 space-y-2">
          <legend className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Material</legend>
          <div className="flex flex-wrap gap-2">
            {(["Matte", "Glossy"] as const).map((material) => {
              const isSelected = material === selectedMaterial;

              return (
                <button
                  key={material}
                  type="button"
                  aria-label={`Use ${material.toLowerCase()} cover material`}
                  aria-pressed={isSelected}
                  onClick={() => setSelectedMaterial(material)}
                  className={`min-h-10 rounded-md border px-3 py-2 text-sm font-semibold transition-colors ${isSelected ? "border-primary bg-primary text-primary-foreground" : "border-border text-primary hover:border-primary"}`}
                >
                  {material}
                  {isSelected && <span className="ml-2 text-xs uppercase tracking-[0.12em]">Selected</span>}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="flex flex-wrap items-end gap-2 sm:col-span-2 lg:col-span-1">
          <button
            type="button"
            aria-label={isOpen ? "Close book" : "Open book"}
            aria-pressed={isOpen}
            onClick={() => setIsOpen((current) => !current)}
            className="min-h-10 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {isOpen ? "Close Book" : "Open Book"}
          </button>
          <button
            type="button"
            aria-label={`${autoRotate ? "Disable" : "Enable"} automatic rotation`}
            aria-pressed={autoRotate}
            onClick={() => setAutoRotate((current) => !current)}
            className={`min-h-10 rounded-md border px-3 py-2 text-sm font-semibold transition-colors ${autoRotate ? "border-primary bg-primary text-primary-foreground" : "border-border text-primary hover:border-primary"}`}
          >
            Auto Rotate: {autoRotate ? "On" : "Off"}
          </button>
        </div>
      </div>

      <div className="h-[min(72vw,620px)] min-h-[360px] w-full overflow-hidden rounded-card border border-border bg-[#d9c8ae] shadow-sm">
        <Canvas
          frameloop={reducedMotion ? "demand" : "always"}
          shadows
          dpr={[1, 2]}
          camera={{ position: [7, 5.5, 8], fov: 38 }}
        >
          <Scene
            autoRotate={autoRotate}
            coverColor={coverColor}
            isOpen={isOpen}
            reducedMotion={reducedMotion}
            roughness={roughness}
          />
        </Canvas>
      </div>
    </div>
  );
}