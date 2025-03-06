"use client";

import React, { useState, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { ItemResult } from "@/lib/types";
import * as THREE from "three";

interface ThreeDimensionalProps {
  results: ItemResult[];
  algorithm: "pca" | "tsne" | "umap";
}

interface Point3DProps {
  position: [number, number, number];
  color: string;
  label: string;
  index: number;
  isHovered: boolean;
  onHover: (index: number | null) => void;
}

function Point3D({ position, color, label, index, isHovered, onHover }: Point3DProps) {
  const meshRef = useRef<THREE.Mesh | null>(null);

  useFrame(() => {
    if (meshRef.current && isHovered) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group>
      <mesh
        ref={meshRef}
        position={position}
        onPointerOver={() => onHover(index)}
        onPointerOut={() => onHover(null)}
      >
        <sphereGeometry args={[isHovered ? 0.15 : 0.1, 16, 16]} />
        <meshStandardMaterial color={color} emissive={isHovered ? color : undefined} />
        {isHovered && (
          <Html distanceFactor={10}>
            <div className="rounded-md bg-black/80 p-2 text-xs text-white shadow-lg">{label}</div>
          </Html>
        )}
      </mesh>
    </group>
  );
}

export default function ThreeDimensional({ results, algorithm }: ThreeDimensionalProps) {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [rotationEnabled, setRotationEnabled] = useState(true);

  if (!results || results.length === 0) {
    return null;
  }

  // Transform the data for the 3D visualization
  const points = results
    .map((item, index) => {
      const reduction = item.reductions.find((r) => r.algorithm === algorithm);
      if (!reduction) return null;

      return {
        position: [
          reduction.coordinates_3d.x,
          reduction.coordinates_3d.y,
          reduction.coordinates_3d.z,
        ] as [number, number, number],
        label: item.label,
        index,
      };
    })
    .filter(Boolean);

  // Get algorithm display name
  const algorithmNames = {
    pca: "Principal Component Analysis (PCA)",
    tsne: "t-SNE",
    umap: "UMAP",
  };

  // Get algorithm description
  const algorithmDescriptions = {
    pca: "PCA in 3D shows the three principal directions of variance in the data.",
    tsne: "t-SNE in 3D creates clusters that preserve local similarities between points.",
    umap: "UMAP in 3D balances preserving both local and global structure of the data.",
  };

  return (
    <div className="mb-8">
      <h3 className="mb-2 text-lg font-medium">{algorithmNames[algorithm]} (3D)</h3>
      <p className="mb-4 text-gray-300">{algorithmDescriptions[algorithm]}</p>

      <div className="relative h-[500px] w-full rounded-lg border border-white/10 bg-white/5">
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <OrbitControls enableRotate={rotationEnabled} />

          {points.map((point, i) =>
            point ? (
              <Point3D
                key={i}
                position={point.position}
                color="#3b82f6"
                label={point.label}
                index={point.index}
                isHovered={hoveredPoint === point.index}
                onHover={setHoveredPoint}
              />
            ) : null
          )}
        </Canvas>

        <div className="absolute bottom-4 left-4 flex gap-2">
          <button
            onClick={() => setRotationEnabled(!rotationEnabled)}
            className="rounded-md bg-white/10 px-3 py-1.5 text-sm hover:bg-white/20"
          >
            {rotationEnabled ? "Lock Camera" : "Unlock Camera"}
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
        {results.map((item, index) => (
          <div
            key={index}
            className={`flex items-center rounded-md p-2 ${
              hoveredPoint === index ? "bg-blue-500/20" : "bg-white/5"
            }`}
            onMouseOver={() => setHoveredPoint(index)}
            onMouseOut={() => setHoveredPoint(null)}
          >
            <span
              className="mr-2 inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: "#3b82f6" }}
            ></span>
            <span className="truncate text-sm">
              {item.label.length > 40 ? `${item.label.substring(0, 40)}...` : item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
