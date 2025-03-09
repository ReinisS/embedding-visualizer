import React from "react";
import { ItemResult } from "@/lib/types";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, LabelList } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";

interface TwoDimensionalProps {
  results: ItemResult[];
  algorithm: "pca" | "tsne" | "umap";
}

export default function TwoDimensional({ results, algorithm }: TwoDimensionalProps) {
  if (!results || results.length === 0) {
    return null;
  }

  // Transform and normalize the data for the scatter chart
  const chartData = (() => {
    // First collect all coordinates
    const coordinates = results
      .map((item) => {
        const reduction = item.reductions.find((r) => r.algorithm === algorithm);
        if (!reduction) return null;
        return reduction.coordinates_2d;
      })
      .filter(Boolean);

    // Find min and max values for normalization
    // TypeScript non-null assertion is safe here because we've already filtered out null values
    const minX = Math.min(...coordinates.map((coord) => coord!.x));
    const maxX = Math.max(...coordinates.map((coord) => coord!.x));
    const minY = Math.min(...coordinates.map((coord) => coord!.y));
    const maxY = Math.max(...coordinates.map((coord) => coord!.y));

    // Normalize function
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

        return {
          x: normalize(reduction.coordinates_2d.x, minX, maxX),
          y: normalize(reduction.coordinates_2d.y, minY, maxY),
          label: item.label,
          index,
          // Keep original values for reference
          originalX: reduction.coordinates_2d.x,
          originalY: reduction.coordinates_2d.y,
        };
      })
      .filter(Boolean);
  })();

  // Get algorithm display name
  const algorithmNames = {
    pca: "Principal Component Analysis (PCA)",
    tsne: "t-SNE",
    umap: "UMAP",
  };

  // Get algorithm description
  const algorithmDescriptions = {
    pca: "PCA preserves the global structure of the data, showing the directions of maximum variance.",
    tsne: "t-SNE emphasizes local similarities, creating clear clusters of similar items.",
    umap: "UMAP balances local and global structure, often providing a good compromise between PCA and t-SNE.",
  };

  // Chart configuration
  const chartConfig: ChartConfig = {
    embeddings: {
      label: "Embedding Visualizations",
      color: `var(--accent-foreground)`,
    },
  };

  return (
    <div>
      <h3 className="mb-2 text-lg font-medium">{algorithmNames[algorithm]}</h3>
      <p className="mb-4 text-gray-300">{algorithmDescriptions[algorithm]}</p>

      <div className="w-full rounded-lg border border-white/10 bg-white/5 p-4">
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <ScatterChart>
            <XAxis
              type="number"
              domain={["dataMin - 0.2", "dataMax + 0.2"]}
              dataKey="x"
              name="X"
              tick={{ fill: "#9ca3af" }}
              axisLine={{ stroke: "#4b5563" }}
              tickLine={{ stroke: "#4b5563" }}
            />
            <YAxis
              type="number"
              domain={["dataMin - 0.2", "dataMax + 0.2"]}
              dataKey="y"
              name="Y"
              tick={{ fill: "#9ca3af" }}
              axisLine={{ stroke: "#4b5563" }}
              tickLine={{ stroke: "#4b5563" }}
            />
            <CartesianGrid />
            <ChartTooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) => payload[0]?.payload?.label || ""}
                />
              }
            />
            <Scatter name="embeddings" data={chartData} fill={`var(--accent-foreground)`}>
              <LabelList dataKey="label" position="top" />
            </Scatter>
          </ScatterChart>
        </ChartContainer>
      </div>
    </div>
  );
}
