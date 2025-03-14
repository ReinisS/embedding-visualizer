"use client";

import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { ItemResult } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
interface ThreeDimensionalProps {
  results: ItemResult[];
  algorithm: "pca" | "tsne" | "umap";
  showLabels: boolean;
}

interface Point3DProps {
  position: [number, number, number];
  color: string;
  label: string;
  index: number;
  isHovered: boolean;
  onHover: (index: number | null) => void;
  showLabels: boolean;
}

function Point3D({ position, color, label, index, isHovered, onHover, showLabels }: Point3DProps) {
  const labelKey = `label-${index}-${label}`;

  return (
    <group position={position}>
      <mesh onPointerOver={() => onHover(index)} onPointerOut={() => onHover(null)}>
        <sphereGeometry args={[isHovered ? 0.15 : 0.1, 16, 16]} />
        <meshStandardMaterial color={color} emissive={isHovered ? color : undefined} />
      </mesh>
      {(showLabels || isHovered) && (
        <Html position={[0, 0.3, 0]} center key={labelKey}>
          <Textarea
            className="pointer-events-none min-h-1 resize-none rounded-md bg-black/80 px-2 py-0.5 text-center text-white"
            key={labelKey}
          >
            {label.length > 30 ? `${label.substring(0, 30)}...` : label}
          </Textarea>
        </Html>
      )}
    </group>
  );
}

export default function ThreeDimensional({
  results,
  algorithm,
  showLabels,
}: ThreeDimensionalProps) {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [rotationEnabled, setRotationEnabled] = useState(true);

  if (!results || results.length === 0) {
    return null;
  }

  // Transform and normalize the data for the 3D visualization
  const points = (() => {
    // First collect all coordinates
    const coordinates = results
      .map((item) => {
        const reduction = item.reductions.find((r) => r.algorithm === algorithm);
        if (!reduction) return null;
        return reduction.coordinates_3d;
      })
      .filter(Boolean);

    // Find min and max values for normalization
    const minX = Math.min(...coordinates.map((coord) => coord!.x));
    const maxX = Math.max(...coordinates.map((coord) => coord!.x));
    const minY = Math.min(...coordinates.map((coord) => coord!.y));
    const maxY = Math.max(...coordinates.map((coord) => coord!.y));
    const minZ = Math.min(...coordinates.map((coord) => coord!.z));
    const maxZ = Math.max(...coordinates.map((coord) => coord!.z));

    const normalize = (value: number, min: number, max: number) => {
      // Handle edge case where min equals max
      if (min === max) return 0.5;
      return (value - min) / (max - min);
    };

    // Create normalized data
    return results
      .map((item, index) => {
        const reduction = item.reductions.find((r) => r.algorithm === algorithm);
        if (!reduction) return null;

        // Normalize to 0-1 range, then scale to -2 to 2 for better 3D visualization
        const normalizedX = normalize(reduction.coordinates_3d.x, minX, maxX);
        const normalizedY = normalize(reduction.coordinates_3d.y, minY, maxY);
        const normalizedZ = normalize(reduction.coordinates_3d.z, minZ, maxZ);

        // Scale from 0-1 to -2 to 2 for better 3D visualization
        const scaledX = normalizedX * 4 - 2;
        const scaledY = normalizedY * 4 - 2;
        const scaledZ = normalizedZ * 4 - 2;

        return {
          position: [scaledX, scaledY, scaledZ] as [number, number, number],
          normalizedPosition: [normalizedX, normalizedY, normalizedZ] as [number, number, number],
          originalPosition: [
            reduction.coordinates_3d.x,
            reduction.coordinates_3d.y,
            reduction.coordinates_3d.z,
          ] as [number, number, number],
          label: item.label,
          index,
        };
      })
      .filter(Boolean);
  })();

  const algorithmNames = {
    pca: "Principal Component Analysis (PCA)",
    tsne: "t-SNE",
    umap: "UMAP",
  };

  return (
    <div className="mb-8">
      <h3 className="mb-2 text-lg font-medium">{algorithmNames[algorithm]} (3D)</h3>

      <div className="relative h-[500px] w-full rounded-lg border border-white/10 bg-white/5">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          key={`canvas-${algorithm}-${JSON.stringify(results.map((r) => r.label))}`}
        >
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <OrbitControls enableRotate={rotationEnabled} />

          {points.map((point, i) =>
            point ? (
              <Point3D
                key={`point-${i}-${point.label}`}
                position={point.position}
                color={`var(--accent-foreground)`}
                label={point.label}
                index={point.index}
                isHovered={hoveredPoint === point.index}
                onHover={setHoveredPoint}
                showLabels={showLabels}
              />
            ) : null
          )}
        </Canvas>

        <div className="absolute bottom-4 left-4 flex gap-2">
          <Button onClick={() => setRotationEnabled(!rotationEnabled)}>
            {rotationEnabled ? "Lock Camera" : "Unlock Camera"}
          </Button>
        </div>
      </div>
    </div>
  );
}
