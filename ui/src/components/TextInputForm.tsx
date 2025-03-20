"use client";

import React, { useState, useEffect, memo } from "react";
import { useDebouncedCallback } from "use-debounce";
import { SignInButton, useAuth } from "@clerk/nextjs";
import { presetExamples } from "@/lib/presets";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LoaderCircle } from "lucide-react";

const DebouncedTextInput = memo(
  ({
    initialValue,
    onChangeCommitted,
    placeholder,
    disabled,
  }: {
    initialValue: string;
    onChangeCommitted: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
  }) => {
    const [localValue, setLocalValue] = useState(initialValue);

    // Update local value when initialValue changes (e.g., when preset is selected)
    useEffect(() => {
      setLocalValue(initialValue);
    }, [initialValue]);

    // Update only local state while typing for immediate feedback
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setLocalValue(e.target.value);
    };

    // Commit changes to parent only when user pauses typing
    const debouncedCommit = useDebouncedCallback(() => {
      if (localValue !== initialValue) {
        onChangeCommitted(localValue);
      }
    }, 100);

    // Trigger the debounced commit when local value changes
    useEffect(() => {
      debouncedCommit();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [localValue]);

    return (
      <Textarea
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={2}
        maxLength={100}
        className="w-full resize-none overflow-hidden"
        style={{ wordBreak: "break-word" }}
      />
    );
  }
);

DebouncedTextInput.displayName = "DebouncedTextInput";

interface TextInputFormProps {
  texts: string[];
  activePresetId: string | null;
  isCustomInput: boolean;
  isLoading: boolean;
  onTextChange: (index: number, value: string) => void;
  onAddText: () => void;
  onRemoveText: (index: number) => void;
  onPresetSelect: (presetId: string) => void;
  onSubmit: (texts: string[]) => void;
  onClearData: () => void;
}

const TextInputForm = memo(function TextInputForm({
  texts,
  activePresetId,
  isCustomInput,
  isLoading,
  onTextChange,
  onAddText,
  onRemoveText,
  onPresetSelect,
  onSubmit,
  onClearData,
}: TextInputFormProps) {
  const { isSignedIn } = useAuth();

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
              onClick={() => onPresetSelect(preset.id)}
              variant={activePresetId === preset.id ? "default" : "outline"}
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
                          <DebouncedTextInput
                            initialValue={text}
                            onChangeCommitted={(value) => onTextChange(index, value)}
                            placeholder={`Text sample ${index + 1}`}
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
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onRemoveText(index);
                        }}
                        aria-label="Remove text input"
                        disabled={!isSignedIn}
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4">
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      variant="secondary"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onAddText();
                      }}
                      disabled={!isSignedIn}
                    >
                      + Add Another Text
                    </Button>
                  </TooltipTrigger>
                  {!isSignedIn && <TooltipContent>Sign in to add text inputs</TooltipContent>}
                </Tooltip>

                {isSignedIn && (
                  <Button type="button" variant="outline" onClick={onClearData}>
                    Clear Data
                  </Button>
                )}

                {isSignedIn ? (
                  <Button
                    type="submit"
                    variant="default"
                    disabled={isLoading}
                    onClick={(e) => {
                      if (!isCustomInput && !activePresetId) {
                        e.preventDefault();
                      }
                    }}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <LoaderCircle className="scale-125 animate-spin" />
                        <span>Processing...</span>
                      </div>
                    ) : (
                      "Visualize Input"
                    )}
                  </Button>
                ) : (
                  <SignInButton mode="modal">
                    <Button type="button" variant="default">
                      Sign In to visualize your custom inputs
                    </Button>
                  </SignInButton>
                )}
              </div>
            </form>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
});

TextInputForm.displayName = "TextInputForm";

export default TextInputForm;
