"use client";

import React, { useState } from "react";
import { ItemResult } from "@/lib/types";
import TwoDimensional from "./visualization/TwoDimensional";
import ThreeDimensional from "./visualization/ThreeDimensional";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface VisualizationTabsProps {
  results: ItemResult[];
}

type AlgorithmType = "pca" | "tsne" | "umap";
type DimensionType = "2d" | "3d";

export default function VisualizationTabs({ results }: VisualizationTabsProps) {
  const [activeAlgorithm, setActiveAlgorithm] = useState<AlgorithmType>("pca");
  const [activeDimension, setActiveDimension] = useState<DimensionType>("2d");

  if (!results || results.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <h2 className="mb-6 text-xl font-semibold">Visualizations</h2>

      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <Tabs
            defaultValue="2d"
            value={activeDimension}
            onValueChange={(value) => setActiveDimension(value as DimensionType)}
            className="inline-flex"
          >
            <TabsList>
              <TabsTrigger value="2d" className="cursor-pointer">
                2D View
              </TabsTrigger>
              <TabsTrigger value="3d" className="cursor-pointer">
                3D View
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Tabs
            defaultValue="pca"
            value={activeAlgorithm}
            onValueChange={(value) => setActiveAlgorithm(value as AlgorithmType)}
            className="inline-flex"
          >
            <TabsList>
              <TabsTrigger value="pca" className="cursor-pointer">
                PCA
              </TabsTrigger>
              <TabsTrigger value="tsne" className="cursor-pointer">
                t-SNE
              </TabsTrigger>
              <TabsTrigger value="umap" className="cursor-pointer">
                UMAP
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/5 p-6">
          {activeDimension === "2d" ? (
            <TwoDimensional results={results} algorithm={activeAlgorithm} />
          ) : (
            <ThreeDimensional results={results} algorithm={activeAlgorithm} />
          )}
        </div>
      </div>
    </div>
  );
}
