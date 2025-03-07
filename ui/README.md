# Embedding Visualizer UI

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Overview

This UI application provides an interactive visualization interface for text embeddings. It connects to the FastAPI backend to:

1. Submit text inputs for embedding generation
2. Visualize embeddings using multiple dimensionality reduction techniques:
   - PCA (Principal Component Analysis)
   - t-SNE (t-Distributed Stochastic Neighbor Embedding)
   - UMAP (Uniform Manifold Approximation and Projection)
3. Toggle between 2D and 3D visualization modes
4. View and explore the generated embeddings

## Prerequisites

- Node.js (20.x or later should work)
- A running instance of the FastAPI backend (if you want to be able to compute new embeddings)
- A Clerk account for authentication

## Configuration

Create a `.env` file in the UI directory with the following variables:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/embedding-visualizer/api
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

## Getting Started

First, ensure the FastAPI backend is running. Then, start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
ui/
├── public/               # Static assets
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # React components
│   │   └── visualization/ # Visualization-specific components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions and types
│   └── middleware.ts     # Clerk authentication middleware
└── ...config files
```

## Features

- Interactive text input form for submitting texts to analyze
- 2D visualization using Recharts
- 3D visualization using Three.js
- Authentication with Clerk
- Sample presets for quick demonstration

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
