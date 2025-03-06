import React, { useState } from "react";
import { ItemResult } from "@/lib/types";
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer } from "recharts";

interface TwoDimensionalProps {
  results: ItemResult[];
  algorithm: "pca" | "tsne" | "umap";
}

interface TooltipPayloadItem {
  payload: {
    label: string;
    x: number;
    y: number;
    z: number;
    index: number;
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-md border border-white/10 bg-black/80 p-3 shadow-lg">
        <p className="font-medium">{payload[0].payload.label}</p>
      </div>
    );
  }
  return null;
};

export default function TwoDimensional({ results, algorithm }: TwoDimensionalProps) {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  if (!results || results.length === 0) {
    return null;
  }

  // Transform the data for the scatter chart
  const chartData = results
    .map((item, index) => {
      const reduction = item.reductions.find((r) => r.algorithm === algorithm);
      if (!reduction) return null;

      return {
        x: reduction.coordinates_2d.x,
        y: reduction.coordinates_2d.y,
        z: 1, // For consistent point size
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
    pca: "PCA preserves the global structure of the data, showing the directions of maximum variance.",
    tsne: "t-SNE emphasizes local similarities, creating clear clusters of similar items.",
    umap: "UMAP balances local and global structure, often providing a good compromise between PCA and t-SNE.",
  };

  return (
    <div className="mb-8">
      <h3 className="mb-2 text-lg font-medium">{algorithmNames[algorithm]}</h3>
      <p className="mb-4 text-gray-300">{algorithmDescriptions[algorithm]}</p>

      <div className="h-[400px] w-full rounded-lg border border-white/10 bg-white/5 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <XAxis
              type="number"
              dataKey="x"
              name="X"
              tick={{ fill: "#9ca3af" }}
              axisLine={{ stroke: "#4b5563" }}
              tickLine={{ stroke: "#4b5563" }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Y"
              tick={{ fill: "#9ca3af" }}
              axisLine={{ stroke: "#4b5563" }}
              tickLine={{ stroke: "#4b5563" }}
            />
            <ZAxis type="number" dataKey="z" range={[60, 60]} />
            <Tooltip content={<CustomTooltip />} />
            <Scatter
              name="Embeddings"
              data={chartData}
              fill="#3b82f6"
              onMouseOver={(data) => setHoveredPoint(data.index)}
              onMouseOut={() => setHoveredPoint(null)}
            />
          </ScatterChart>
        </ResponsiveContainer>
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
