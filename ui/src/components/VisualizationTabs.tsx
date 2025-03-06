"use client";

import React, { useState } from "react";
import { ItemResult } from "@/lib/types";
import TwoDimensional from "./visualization/TwoDimensional";
import ThreeDimensional from "./visualization/ThreeDimensional";

interface VisualizationTabsProps {
  results: ItemResult[];
}

type DimensionType = "2d" | "3d";
type AlgorithmType = "pca" | "tsne" | "umap";

export default function VisualizationTabs({ results }: VisualizationTabsProps) {
  const [activeDimension, setActiveDimension] = useState<DimensionType>("2d");
  const [activeAlgorithm, setActiveAlgorithm] = useState<AlgorithmType>("pca");

  if (!results || results.length === 0) {
    return null;
  }

  const handleDimensionChange = (dimension: DimensionType) => {
    setActiveDimension(dimension);
  };

  const handleAlgorithmChange = (algorithm: AlgorithmType) => {
    setActiveAlgorithm(algorithm);
  };

  return (
    <div className="mb-12">
      <h2 className="mb-6 text-xl font-semibold">Visualizations</h2>

      <div className="mb-6 flex flex-wrap gap-2">
        <div className="rounded-lg border border-white/10 bg-white/5 p-1">
          <button
            onClick={() => handleDimensionChange("2d")}
            className={`rounded-md px-4 py-2 ${
              activeDimension === "2d" ? "bg-blue-600 text-white" : "hover:bg-white/10"
            }`}
          >
            2D View
          </button>
          <button
            onClick={() => handleDimensionChange("3d")}
            className={`rounded-md px-4 py-2 ${
              activeDimension === "3d" ? "bg-blue-600 text-white" : "hover:bg-white/10"
            }`}
          >
            3D View
          </button>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/5 p-1">
          <button
            onClick={() => handleAlgorithmChange("pca")}
            className={`rounded-md px-4 py-2 ${
              activeAlgorithm === "pca" ? "bg-blue-600 text-white" : "hover:bg-white/10"
            }`}
          >
            PCA
          </button>
          <button
            onClick={() => handleAlgorithmChange("tsne")}
            className={`rounded-md px-4 py-2 ${
              activeAlgorithm === "tsne" ? "bg-blue-600 text-white" : "hover:bg-white/10"
            }`}
          >
            t-SNE
          </button>
          <button
            onClick={() => handleAlgorithmChange("umap")}
            className={`rounded-md px-4 py-2 ${
              activeAlgorithm === "umap" ? "bg-blue-600 text-white" : "hover:bg-white/10"
            }`}
          >
            UMAP
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/5 p-6">
        {activeDimension === "2d" ? (
          <TwoDimensional results={results} algorithm={activeAlgorithm} />
        ) : (
          <ThreeDimensional results={results} algorithm={activeAlgorithm} />
        )}
      </div>
    </div>
  );
}
