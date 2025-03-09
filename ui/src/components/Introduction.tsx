import React, { useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

export default function Introduction() {
  const accordionItems = ["embeddings", "ai", "visualization", "usage"];
  const [openItems, setOpenItems] = useState<string[]>(accordionItems);

  const expandAll = () => {
    setOpenItems(accordionItems);
  };

  const collapseAll = () => {
    setOpenItems([]);
  };

  return (
    <div className="mb-12">
      <h1 className="mb-6 text-3xl font-bold">Understanding Text Embeddings</h1>

      <div className="mb-4 flex gap-2">
        <Button variant="outline" size="sm" onClick={expandAll}>
          Expand All
        </Button>
        <Button variant="outline" size="sm" onClick={collapseAll}>
          Collapse All
        </Button>
      </div>

      <Accordion
        type="multiple"
        value={openItems}
        onValueChange={setOpenItems}
        className="space-y-6"
      >
        <AccordionItem value="embeddings" className="rounded-lg border border-white/10 bg-white/5">
          <AccordionTrigger className="cursor-pointer px-4 pt-2 text-xl font-semibold">
            What are Text Embeddings?
          </AccordionTrigger>
          <AccordionContent className="px-4">
            <p className="mb-4">
              Text embeddings are a way to convert words and sentences into numbers that computers
              can understand. Think of them as placing each piece of text at specific coordinates on
              a map, where similar texts appear closer together.
            </p>
            <p>
              When we convert text to embeddings, we are essentially translating human language into
              a mathematical space where:
            </p>
            <ul className="my-4 list-disc space-y-2 pl-6">
              <li>Similar concepts are positioned near each other</li>
              <li>Related ideas form clusters</li>
              <li>Opposite concepts are placed far apart</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="ai" className="rounded-lg border border-white/10 bg-white/5">
          <AccordionTrigger className="cursor-pointer px-4 pt-2 text-xl font-semibold">
            How This Relates to Modern AI
          </AccordionTrigger>
          <AccordionContent className="px-4">
            <p className="mb-4">
              Large Language Models (LLMs) like ChatGPT, Claude, and others use embeddings as a
              fundamental building block. These models convert text into high-dimensional vectors
              (embeddings) to understand meaning and context.
            </p>
            <p>
              By visualizing embeddings, you can get a glimpse into how AI &quot;thinks&quot; about
              text similarity and relationships between concepts.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="visualization"
          className="rounded-lg border border-white/10 bg-white/5"
        >
          <AccordionTrigger className="cursor-pointer px-4 pt-2 text-xl font-semibold">
            About This Visualization
          </AccordionTrigger>
          <AccordionContent className="px-4">
            <p className="mb-4">
              In this interactive tool, you can enter different pieces of text and see how they
              relate to each other in embedding space.
            </p>
            <p className="mb-4">
              Since real embeddings have hundreds of dimensions, we use different techniques to
              reduce them to 2D and 3D for visualization:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>PCA</strong> (Principal Component Analysis): Preserves global structure and
                overall variance
              </li>
              <li>
                <strong>t-SNE</strong> (t-Distributed Stochastic Neighbor Embedding): Emphasizes
                local similarities and clusters
              </li>
              <li>
                <strong>UMAP</strong> (Uniform Manifold Approximation and Projection): Balances
                local and global structure
              </li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="usage" className="rounded-lg border border-white/10 bg-white/5">
          <AccordionTrigger className="cursor-pointer px-4 pt-2 text-xl font-semibold">
            How to Use This Tool
          </AccordionTrigger>
          <AccordionContent className="px-4">
            <ol className="list-decimal space-y-2 pl-6">
              <li>
                Enter at least 3 different texts in the input boxes below (or select a preset)
              </li>
              <li>Submit to generate embeddings</li>
              <li>Explore the raw embedding values</li>
              <li>View the 2D and 3D visualizations to see how your texts relate to each other</li>
              <li>Try different texts to see how the relationships change</li>
            </ol>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
