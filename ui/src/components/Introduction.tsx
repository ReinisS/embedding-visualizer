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
              Text embeddings are numbers that represent words and sentences. These numbers
              represent the meaning of the text in a way that computers can understand and compare
              with other text embeddings. Texts with similar meanings will have similar embeddings,
              and texts with different meanings will have different embeddings.
            </p>
            <p>
              When we convert text to embeddings, we are essentially translating human language into
              a high-dimensional mathematical space where:
            </p>
            <ul className="my-4 list-disc space-y-2 pl-6">
              <li>Similar concepts are positioned near each other</li>
              <li>Related ideas form clusters</li>
              <li>Opposite concepts are placed far apart</li>
            </ul>
            <p className="mb-4">
              For example, the embeddings for &quot;dog&quot; and &quot;cat&quot; will be closer
              together than the embeddings for &quot;dog&quot; and &quot;car&quot;.
            </p>
            <div className="mx-auto my-6 max-w-md">
              <svg
                viewBox="0 0 500 300"
                className="h-auto w-full rounded-lg border border-white/10 bg-black p-2"
              >
                {/* Coordinate system */}
                <line x1="50" y1="250" x2="450" y2="250" stroke="gray" strokeWidth="1" />
                <line x1="50" y1="50" x2="50" y2="250" stroke="gray" strokeWidth="1" />

                {/* X and Y axis labels */}
                <text x="250" y="280" className="text-[12px]" fill="gray" textAnchor="middle">
                  x axis
                </text>
                <text
                  x="20"
                  y="150"
                  className="text-[12px]"
                  fill="gray"
                  textAnchor="middle"
                  transform="rotate(-90, 20, 150)"
                >
                  y axis
                </text>

                {/* Word clusters */}
                {/* Animals cluster */}
                <circle
                  cx="150"
                  cy="100"
                  r="40"
                  fill="rgba(59, 130, 246, 0.1)"
                  stroke="rgba(59, 130, 246, 0.5)"
                />
                <text x="150" y="50" fill="white" textAnchor="middle" fontSize="12">
                  Animals
                </text>
                <g>
                  <circle cx="130" cy="90" r="5" fill="#3b82f6" />
                  <text x="130" y="80" fill="white" textAnchor="middle" fontSize="10">
                    Cat
                  </text>
                </g>
                <g>
                  <circle cx="160" cy="100" r="5" fill="#3b82f6" />
                  <text x="160" y="90" fill="white" textAnchor="middle" fontSize="10">
                    Dog
                  </text>
                </g>
                <g>
                  <circle cx="130" cy="120" r="5" fill="#3b82f6" />
                  <text x="130" y="110" fill="white" textAnchor="middle" fontSize="10">
                    Bird
                  </text>
                </g>

                {/* Vehicles cluster */}
                <circle
                  cx="350"
                  cy="180"
                  r="40"
                  fill="rgba(239, 68, 68, 0.1)"
                  stroke="rgba(239, 68, 68, 0.5)"
                />
                <text x="350" y="130" fill="white" textAnchor="middle" fontSize="12">
                  Vehicles
                </text>
                <g>
                  <circle cx="330" cy="170" r="5" fill="#ef4444" />
                  <text x="330" y="160" fill="white" textAnchor="middle" fontSize="10">
                    Car
                  </text>
                </g>
                <g>
                  <circle cx="360" cy="190" r="5" fill="#ef4444" />
                  <text x="360" y="180" fill="white" textAnchor="middle" fontSize="10">
                    Bus
                  </text>
                </g>
                <g>
                  <circle cx="380" cy="170" r="5" fill="#ef4444" />
                  <text x="380" y="160" fill="white" textAnchor="middle" fontSize="10">
                    Train
                  </text>
                </g>

                {/* Distance indicator */}
                <line
                  x1="160"
                  y1="100"
                  x2="330"
                  y2="170"
                  stroke="white"
                  strokeWidth="1"
                  strokeDasharray="5,5"
                />
                <text
                  x="260"
                  y="120"
                  fill="white"
                  textAnchor="middle"
                  fontSize="10"
                  fontStyle="italic"
                >
                  Different meaning
                </text>

                {/* Similar words distance */}
                <text
                  x="145"
                  y="155"
                  fill="white"
                  textAnchor="middle"
                  fontSize="10"
                  fontStyle="italic"
                >
                  Similar meaning
                </text>
              </svg>
              <p className="mt-2 text-center text-sm text-gray-400">
                Text embeddings in a 2D space: similar concepts are closer together
              </p>
            </div>

            <p>
              There are different ways how to create these text embeddings, but usually it involves
              training a model on a large dataset of text to learn the relationships between words
              and sentences. One such example is the Word2Vec model, which you can learn more about{" "}
              {/* [here](https://en.wikipedia.org/wiki/Word2vec). */}
              <a
                href="https://en.wikipedia.org/wiki/Word2vec"
                className="underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                here
              </a>
              .
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="ai" className="rounded-lg border border-white/10 bg-white/5">
          <AccordionTrigger className="cursor-pointer px-4 pt-2 text-xl font-semibold">
            How This Relates to Modern AI
          </AccordionTrigger>
          <AccordionContent className="px-4">
            <p className="mb-4">
              Text embeddings are used more and more in the modern days to help computers understand
              and deal with human language. For example, instead of using text directly, Large
              Language Models (LLMs) like OpenAI&apos;s GPT, Anthropic&apos;s Claude, and others use
              text embeddings as a fundamental building block.
            </p>
            <div className="mx-auto my-6 max-w-md">
              <svg
                viewBox="0 0 500 300"
                className="h-auto w-full rounded-lg border border-white/10 bg-black p-2"
              >
                {/* Input text */}
                <rect
                  x="40"
                  y="50"
                  width="120"
                  height="60"
                  rx="5"
                  fill="rgba(59, 130, 246, 0.2)"
                  stroke="#3b82f6"
                />
                <text
                  x="100"
                  y="35"
                  fill="white"
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="bold"
                >
                  Input Text
                </text>
                <text x="100" y="80" fill="white" textAnchor="middle" fontSize="12">
                  &quot;I need to deposit
                </text>
                <text x="100" y="100" fill="white" textAnchor="middle" fontSize="12">
                  money at the bank&quot;
                </text>

                {/* Arrow */}
                <line
                  x1="160"
                  y1="80"
                  x2="200"
                  y2="80"
                  stroke="white"
                  strokeWidth="1.5"
                  markerEnd="url(#arrow)"
                />

                {/* Embeddings */}
                <rect
                  x="200"
                  y="50"
                  width="120"
                  height="60"
                  rx="5"
                  fill="rgba(139, 92, 246, 0.2)"
                  stroke="#8b5cf6"
                />
                <text
                  x="260"
                  y="35"
                  fill="white"
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="bold"
                >
                  Embeddings
                </text>
                <text x="260" y="75" fill="white" textAnchor="middle" fontSize="10">
                  [0.42, -0.61, 0.23,
                </text>
                <text x="260" y="90" fill="white" textAnchor="middle" fontSize="10">
                  0.71, -0.08, ...]
                </text>
                <text x="260" y="105" fill="white" textAnchor="middle" fontSize="10">
                  (384 numbers)
                </text>

                {/* Arrow */}
                <line
                  x1="320"
                  y1="80"
                  x2="360"
                  y2="80"
                  stroke="white"
                  strokeWidth="1.5"
                  markerEnd="url(#arrow)"
                />

                {/* LLM */}
                <rect
                  x="360"
                  y="40"
                  width="100"
                  height="80"
                  rx="5"
                  fill="rgba(236, 72, 153, 0.2)"
                  stroke="#ec4899"
                />
                <text
                  x="410"
                  y="35"
                  fill="white"
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="bold"
                >
                  LLM
                </text>
                <text x="410" y="70" fill="white" textAnchor="middle" fontSize="11">
                  GPT,
                </text>
                <text x="410" y="85" fill="white" textAnchor="middle" fontSize="11">
                  Claude,
                </text>
                <text x="410" y="100" fill="white" textAnchor="middle" fontSize="11">
                  etc.
                </text>

                {/* Arrow */}
                <line
                  x1="410"
                  y1="120"
                  x2="410"
                  y2="160"
                  stroke="white"
                  strokeWidth="1.5"
                  markerEnd="url(#arrow)"
                />

                {/* Output */}
                <rect
                  x="350"
                  y="160"
                  width="120"
                  height="60"
                  rx="5"
                  fill="rgba(16, 185, 129, 0.2)"
                  stroke="#10b981"
                />
                <text
                  x="440"
                  y="145"
                  fill="white"
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="bold"
                >
                  Output
                </text>
                <text x="410" y="185" fill="white" textAnchor="middle" fontSize="12">
                  &quot;Your financial
                </text>
                <text x="410" y="205" fill="white" textAnchor="middle" fontSize="12">
                  transaction is ready&quot;
                </text>

                {/* Context understanding - Bank example */}
                <rect
                  x="40"
                  y="160"
                  width="240"
                  height="90"
                  rx="5"
                  fill="rgba(245, 158, 11, 0.1)"
                  stroke="rgba(245, 158, 11, 0.5)"
                />
                <text
                  x="160"
                  y="145"
                  fill="white"
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="bold"
                >
                  Context Understanding
                </text>

                <text x="70" y="180" fill="white" textAnchor="start" fontSize="11">
                  • &quot;bank&quot; + &quot;deposit&quot; + &quot;money&quot;
                </text>
                <text x="90" y="200" fill="#10b981" textAnchor="start" fontSize="11">
                  → Financial institution
                </text>

                <text x="70" y="225" fill="white" textAnchor="start" fontSize="11">
                  • &quot;bank&quot; + &quot;river&quot; + &quot;fishing&quot;
                </text>
                <text x="90" y="245" fill="#10b981" textAnchor="start" fontSize="11">
                  → Edge of a river
                </text>

                {/* Arrow connecting context to LLM */}
                <line
                  x1="280"
                  y1="200"
                  x2="360"
                  y2="80"
                  stroke="white"
                  strokeWidth="1"
                  strokeDasharray="5,3"
                  markerEnd="url(#arrow)"
                />
                <text
                  x="290"
                  y="150"
                  fill="white"
                  textAnchor="middle"
                  fontSize="10"
                  fontStyle="italic"
                >
                  Informs
                </text>

                {/* Arrow definition */}
                <defs>
                  <marker
                    id="arrow"
                    markerWidth="10"
                    markerHeight="7"
                    refX="10"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3.5, 0 7" fill="white" />
                  </marker>
                </defs>
              </svg>
              <p className="mt-2 text-center text-sm text-gray-400">
                How LLMs use embeddings to process and understand language
              </p>
            </div>

            <p>
              Text embeddings are important both to understand the user&apos;s input text, and to
              generate some output. For example, the word &quot;bank&quot; could mean a financial
              institution, or the side of a river. The embedding helps the model understand the
              right meaning based on surrounding words and context.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="visualization"
          className="rounded-lg border border-white/10 bg-white/5"
        >
          <AccordionTrigger className="cursor-pointer px-4 pt-2 text-xl font-semibold">
            About This Tool
          </AccordionTrigger>
          <AccordionContent className="px-4">
            <p className="mb-4">
              This is the Text Embedding Visualizer tool. In this tool, you can enter different
              pieces of text, see what embeddings are generated, and see how the embeddings relate
              to each other in embedding space.
            </p>
            <p className="mb-4">
              This tool uses the{" "}
              <a
                href="https://huggingface.co/Xenova/all-MiniLM-L6-v2"
                className="underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Xenova/all-MiniLM-L6-v2
              </a>{" "}
              model to generate text embeddings. Since real text embeddings usually have hundreds of
              dimensions (384 dimensions in our case), it&apos;s not trivial to visualize and see
              them in a nice way. So, in this tool, we use a few{" "}
              <a
                href="https://en.wikipedia.org/wiki/Dimensionality_reduction"
                className="underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                dimensionality reduction
              </a>{" "}
              methods to reduce the embeddings to 2D and 3D for visualization:
            </p>
            <ul className="mb-4 list-disc space-y-2 pl-6">
              <li>
                <strong>PCA</strong> (
                <a
                  href="https://en.wikipedia.org/wiki/Principal_component_analysis"
                  className="underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Principal Component Analysis
                </a>
                )
              </li>
              <li>
                <strong>t-SNE</strong> (
                <a
                  href="https://en.wikipedia.org/wiki/T-distributed_stochastic_neighbor_embedding"
                  className="underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  t-Distributed Stochastic Neighbor Embedding
                </a>
                )
              </li>
              <li>
                <strong>UMAP</strong> (
                <a
                  href="https://pair-code.github.io/understanding-umap/"
                  className="underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Uniform Manifold Approximation and Projection
                </a>
                )
              </li>
            </ul>
            <div className="mx-auto my-6 max-w-md">
              <svg
                viewBox="0 0 500 380"
                className="h-auto w-full rounded-lg border border-white/10 bg-black p-2"
              >
                {/* Title */}
                <text
                  x="250"
                  y="30"
                  fill="white"
                  textAnchor="middle"
                  fontSize="14"
                  fontWeight="bold"
                >
                  Dimensionality Reduction for Visualization
                </text>

                {/* Original high dimensional data */}
                <rect
                  x="40"
                  y="60"
                  width="420"
                  height="60"
                  rx="5"
                  fill="rgba(59, 130, 246, 0.2)"
                  stroke="#3b82f6"
                />
                <text x="250" y="90" fill="white" textAnchor="middle" fontSize="12">
                  Original 384-dimensional Embeddings
                </text>
                <text x="250" y="110" fill="white" textAnchor="middle" fontSize="10">
                  [0.23, -0.41, 0.76, 0.12, -0.54, 0.67, 0.01, -0.89, 0.34, 0.45, ...]
                </text>

                {/* Arrow down */}
                <line
                  x1="250"
                  y1="120"
                  x2="250"
                  y2="150"
                  stroke="white"
                  strokeWidth="1.5"
                  markerEnd="url(#dim-arrow)"
                />

                {/* Single box for all reduction algorithms */}
                <rect
                  x="115"
                  y="150"
                  width="270"
                  height="60"
                  rx="5"
                  fill="rgba(139, 92, 246, 0.2)"
                  stroke="#8b5cf6"
                />
                <text
                  x="250"
                  y="175"
                  fill="white"
                  textAnchor="middle"
                  fontSize="14"
                  fontWeight="bold"
                >
                  PCA / t-SNE / UMAP
                </text>
                <text x="250" y="195" fill="white" textAnchor="middle" fontSize="10">
                  Methods to reduce dimensions while preserving patterns
                </text>

                {/* Arrow down */}
                <line
                  x1="250"
                  y1="210"
                  x2="250"
                  y2="240"
                  stroke="white"
                  strokeWidth="1.5"
                  markerEnd="url(#dim-arrow)"
                />

                {/* 2D visualization box */}
                <rect
                  x="90"
                  y="240"
                  width="320"
                  height="130"
                  rx="5"
                  fill="rgba(245, 158, 11, 0.2)"
                  stroke="#f59e0b"
                />

                {/* 2D plot simplified */}
                <text x="250" y="260" fill="white" textAnchor="middle" fontSize="12">
                  2D Visualization (simplified example)
                </text>

                {/* Simplified 2D plot - more square shaped */}
                <g transform="translate(125, 330)">
                  {/* Coordinate system */}
                  <line
                    x1="0"
                    y1="20"
                    x2="250"
                    y2="20"
                    stroke="white"
                    strokeWidth="1"
                    opacity="0.7"
                  />
                  <line
                    x1="0"
                    y1="20"
                    x2="0"
                    y2="-60"
                    stroke="white"
                    strokeWidth="1"
                    opacity="0.7"
                  />

                  {/* Axis labels */}
                  <text x="125" y="35" fill="white" textAnchor="middle" fontSize="10">
                    x axis
                  </text>
                  <text
                    x="-15"
                    y="-30"
                    fill="white"
                    textAnchor="middle"
                    fontSize="10"
                    transform="rotate(-90, -15, -30)"
                  >
                    y axis
                  </text>

                  {/* Points - Group 1 (blue) */}
                  <circle cx="50" cy="-20" r="4" fill="#60a5fa" stroke="#3b82f6" strokeWidth="1" />
                  <circle cx="65" cy="-25" r="4" fill="#60a5fa" stroke="#3b82f6" strokeWidth="1" />
                  <circle cx="45" cy="-15" r="4" fill="#60a5fa" stroke="#3b82f6" strokeWidth="1" />

                  {/* Points - Group 2 (pink) */}
                  <circle cx="160" cy="-40" r="4" fill="#f472b6" stroke="#ec4899" strokeWidth="1" />
                  <circle cx="175" cy="-35" r="4" fill="#f472b6" stroke="#ec4899" strokeWidth="1" />
                  <circle cx="150" cy="-45" r="4" fill="#f472b6" stroke="#ec4899" strokeWidth="1" />

                  {/* Points - Group 3 (green) */}
                  <circle cx="230" cy="-15" r="4" fill="#34d399" stroke="#10b981" strokeWidth="1" />
                  <circle cx="220" cy="-20" r="4" fill="#34d399" stroke="#10b981" strokeWidth="1" />
                  <circle cx="235" cy="-10" r="4" fill="#34d399" stroke="#10b981" strokeWidth="1" />
                </g>

                {/* Arrow marker */}
                <defs>
                  <marker
                    id="dim-arrow"
                    markerWidth="10"
                    markerHeight="7"
                    refX="10"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3.5, 0 7" fill="white" />
                  </marker>
                </defs>
              </svg>
              <p className="mt-2 text-center text-sm text-gray-400">
                How 384-dimensional embeddings are reduced to 2D for visualization
              </p>
            </div>

            <p>
              Each of these methods has its own strengths and weaknesses, and can provide different
              insights into the data. You can switch between these methods below to see how the
              embeddings are positioned in the 2D and 3D space using these different techniques.
              Different datasets may also require different methods to visualize effectively.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="usage" className="rounded-lg border border-white/10 bg-white/5">
          <AccordionTrigger className="cursor-pointer px-4 pt-2 text-xl font-semibold">
            How to Use This Tool
          </AccordionTrigger>
          <AccordionContent className="px-4">
            <ol className="list-decimal space-y-2 pl-6">
              <li>Explore the preset text sample datasets</li>
              <li>
                Enter your own text samples if you&apos;d like (requires you to Sign In - it&apos;s
                free!). At least 3 different text samples are required
              </li>
              <li>Explore the raw generated embedding values</li>
              <li>
                View the 2D and 3D visualizations to see how your text samples relate to each other.
                You can hover over the points to see more information about each point. You can also
                click and drag to rotate the 3D visualization
              </li>
              <li>Try different text samples to see how the relationships change</li>
            </ol>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
