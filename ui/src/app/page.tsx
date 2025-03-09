"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import Introduction from "@/components/Introduction";
import TextInputForm from "@/components/TextInputForm";
import RawEmbeddings from "@/components/RawEmbeddings";
import GitHubButton from "@/components/GitHubButton";
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

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-12 text-center">
        <h1 className="mb-2 text-3xl font-bold">Text Embedding Visualizer</h1>
        <p className="text-lg text-gray-400">
          Learn how computers understand the meaning behind text
        </p>

        <div className="mt-4 flex justify-center gap-4">
          <GitHubButton />
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
    </div>
  );
}
