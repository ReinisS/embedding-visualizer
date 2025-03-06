"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import Introduction from "@/components/Introduction";
import TextInputForm from "@/components/TextInputForm";
import RawEmbeddings from "@/components/RawEmbeddings";
import VisualizationTabs from "@/components/VisualizationTabs";
import useAuthenticatedFetch from "@/hooks/useAuthenticatedFetch";
import { fetchVisualization } from "@/lib/api";
import { VisualizationResponse } from "@/lib/types";
import { presetExamples } from "@/lib/presets";

export default function Home() {
  const { isLoaded, isSignedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<VisualizationResponse | null>(null);
  const setActivePresetId = useState<string | null>(null)[1];
  const authenticatedFetch = useAuthenticatedFetch();

  // Load the first preset visualization data by default
  useEffect(() => {
    if (isLoaded && isSignedIn && presetExamples.length > 0 && !results) {
      const firstPreset = presetExamples[0];
      if (firstPreset.visualizationData) {
        setResults(firstPreset.visualizationData);
        setActivePresetId(firstPreset.id);
      }
    }
  }, [isLoaded, isSignedIn, results, setActivePresetId]);

  // Handle preset selection
  const handlePresetSelect = (presetId: string, visualizationData: VisualizationResponse) => {
    setResults(visualizationData);
    setActivePresetId(presetId);
    setError(null);
  };

  // Handle custom text input submission
  const handleSubmit = async (texts: string[]) => {
    if (!isSignedIn) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setActivePresetId(null);

    try {
      const response = await fetchVisualization(authenticatedFetch, texts);
      setResults(response);
    } catch (err) {
      console.error("Error fetching visualization:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while fetching the visualization data."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading indicator while Clerk loads
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="mb-2 text-3xl font-bold">Text Embedding Visualizer</h1>
        <p className="text-lg text-gray-300">
          Explore how text embeddings work with interactive visualizations
        </p>

        <div className="mt-4 flex justify-center gap-4">
          <a
            className="flex h-10 items-center justify-center rounded-full border border-solid border-black/[.08] px-4 text-sm transition-colors hover:border-transparent hover:bg-[#f2f2f2] sm:h-12 sm:min-w-44 sm:px-5 sm:text-base dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
            href="https://github.com/ReinisS/embedding-visualizer"
            target="_blank"
            rel="noopener noreferrer"
          >
            View code of this project on GitHub
          </a>
        </div>
      </div>

      <Introduction />

      <TextInputForm
        onSubmit={handleSubmit}
        onPresetSelect={handlePresetSelect}
        isLoading={isLoading}
      />

      {error && (
        <div className="mb-8 rounded-md bg-red-500/20 p-4 text-red-200">
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
      )}

      {results && results.results.length > 0 && (
        <>
          <RawEmbeddings results={results.results} />
          <VisualizationTabs results={results.results} />
        </>
      )}

      <div className="mt-12 max-w-2xl rounded-lg border border-white/10 bg-white/5 p-6">
        <h2 className="mb-4 text-xl font-semibold">About This Project</h2>
        <p className="mb-4">
          This interactive tool helps you understand how text embeddings work by visualizing them in
          both 2D and 3D space. You can:
        </p>
        <ul className="list-inside list-disc space-y-2">
          <li>Enter your own text samples or use our presets</li>
          <li>See the raw embedding vectors</li>
          <li>Explore different dimensionality reduction techniques (PCA, t-SNE, UMAP)</li>
          <li>Interact with 2D and 3D visualizations</li>
        </ul>
      </div>

      <footer className="mt-12 flex flex-wrap items-center justify-center gap-6">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://github.com/ReinisS/embedding-visualizer"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image aria-hidden src="/file.svg" alt="File icon" width={16} height={16} />
          GitHub Repository
        </a>
      </footer>
    </div>
  );
}
