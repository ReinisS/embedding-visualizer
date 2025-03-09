"use client";

import React, { useState, useEffect, useCallback } from "react";
import { SignInButton, useAuth } from "@clerk/nextjs";
import { presetExamples } from "@/lib/presets";
import { VisualizationResponse } from "@/lib/types";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

interface TextInputFormProps {
  onSubmit: (texts: string[]) => void;
  onPresetSelect: (presetId: string, visualizationData: VisualizationResponse) => void;
  isLoading: boolean;
}

export default function TextInputForm({ onSubmit, onPresetSelect, isLoading }: TextInputFormProps) {
  const { isSignedIn } = useAuth();
  const [texts, setTexts] = useState<string[]>(["", "", ""]);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [isCustomInput, setIsCustomInput] = useState(false);

  const handlePresetSelect = useCallback(
    (presetId: string) => {
      const preset = presetExamples.find((p) => p.id === presetId);
      if (preset) {
        setTexts(preset.texts);
        setActivePreset(presetId);
        setIsCustomInput(false);

        // If preset has visualization data, notify parent component
        if (preset.visualizationData) {
          onPresetSelect(presetId, preset.visualizationData);
        }
      }
    },
    [onPresetSelect]
  );

  // Select the first preset by default when component mounts
  useEffect(() => {
    if (presetExamples.length > 0 && !activePreset) {
      handlePresetSelect(presetExamples[0].id);
    }
  }, [activePreset, handlePresetSelect]);

  const handleTextChange = (index: number, value: string) => {
    const newTexts = [...texts];
    newTexts[index] = value;
    setTexts(newTexts);
    setActivePreset(null);
    setIsCustomInput(true);
  };

  const handleAddText = () => {
    setTexts([...texts, ""]);
    setIsCustomInput(true);
  };

  const handleRemoveText = (index: number) => {
    if (texts.length <= 3) {
      return; // Maintain minimum of 3 text inputs
    }
    const newTexts = [...texts];
    newTexts.splice(index, 1);
    setTexts(newTexts);
    setActivePreset(null);
    setIsCustomInput(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filteredTexts = texts.filter((text) => text.trim() !== "");
    if (filteredTexts.length < 3) {
      alert("Please enter at least 3 text samples");
      return;
    }
    onSubmit(filteredTexts);
  };

  return (
    <div className="mb-8">
      <h2 className="mb-4 text-xl font-semibold">Text Samples</h2>
      <div className="mb-6">
        <div className="mb-4 flex flex-wrap gap-2">
          {presetExamples.map((preset) => (
            <Button
              key={preset.id}
              onClick={() => handlePresetSelect(preset.id)}
              variant={activePreset === preset.id ? "default" : "outline"}
            >
              {preset.name}
            </Button>
          ))}
        </div>
      </div>
      <Accordion type="single" collapsible>
        <AccordionItem
          value="text-samples"
          className="rounded-lg border border-white/10 bg-white/5 px-4"
        >
          <AccordionTrigger className="cursor-pointer pt-2 text-xl font-semibold">
            View & Edit Text Samples
          </AccordionTrigger>
          <AccordionContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {texts.map((text, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-grow">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <textarea
                            value={text}
                            onChange={(e) => handleTextChange(index, e.target.value)}
                            placeholder={`Text sample ${index + 1}`}
                            className="w-full rounded-md border border-white/10 bg-white/5 p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                            rows={2}
                            maxLength={100}
                            disabled={!isSignedIn}
                          />
                        </TooltipTrigger>
                        {!isSignedIn && (
                          <TooltipContent>Sign in to edit text inputs</TooltipContent>
                        )}
                      </Tooltip>
                      <div className="mt-1 text-right text-xs text-gray-400">
                        {text.length}/100 characters
                      </div>
                    </div>
                    {texts.length > 3 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveText(index)}
                        className="self-start p-2 text-gray-400 hover:text-white"
                        aria-label="Remove text input"
                        disabled={!isSignedIn}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <Tooltip>
                  <TooltipTrigger>
                    <Button variant="secondary" onClick={handleAddText} disabled={!isSignedIn}>
                      + Add Another Text
                    </Button>
                  </TooltipTrigger>
                  {!isSignedIn && <TooltipContent>Sign in to add text inputs</TooltipContent>}
                </Tooltip>

                {isSignedIn ? (
                  <Button variant="default" disabled={isLoading || !isCustomInput}>
                    {isLoading
                      ? "Processing..."
                      : !isCustomInput
                        ? "Using Preset Data"
                        : "Visualize Custom Input"}
                  </Button>
                ) : (
                  <SignInButton mode="modal">
                    <Button variant="default">Sign In to Visualize Your Custom Inputs</Button>
                  </SignInButton>
                )}
              </div>
            </form>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
