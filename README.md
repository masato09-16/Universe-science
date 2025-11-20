# Universe-science

An interactive knowledge navigation app that visualizes Data Science topics as a galaxy of interconnected nodes.

## Features

- **Interactive Galaxy Visualization**: Explore Data Science topics in a beautiful space-themed interface
- **Semantic Zoom (LOD)**: Different levels of detail based on zoom level
  - Tier 1 nodes (major categories) visible at all zoom levels
  - Tier 2 nodes (sub-categories) appear at medium zoom
  - Tier 3 nodes (specific tools/concepts) appear at deep zoom
- **Node Interactions**: Click nodes to view detailed information and learning resources
- **Hover Effects**: Highlight connections when hovering over links
- **Modern UI**: Dark space theme with neon-colored glowing nodes

## Tech Stack

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **react-force-graph-2d**: Force-directed graph visualization
- **Lucide React**: Beautiful icon library

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

- `app/`: Next.js app directory
  - `page.tsx`: Main page component
  - `layout.tsx`: Root layout
  - `globals.css`: Global styles
- `components/`: React components
  - `DataScienceGalaxy.tsx`: Main galaxy visualization component
  - `SidePanel.tsx`: Side panel for displaying node details
- `data.ts`: Data structure and mock data for nodes and links

## Data Structure

Nodes have three tiers:
- **Tier 1**: Major categories (e.g., "Machine Learning", "Python", "Statistics")
- **Tier 2**: Sub-categories (e.g., "Supervised Learning", "Pandas")
- **Tier 3**: Specific tools/concepts (e.g., "LightGBM", "Optuna")

Each node contains:
- `id`: Unique identifier
- `title`: Display name
- `description`: Detailed description
- `tier`: Level in the hierarchy (1-3)
- `resources`: Array of learning resources with title, URL, and type
- `color`: Optional color override

## License

MIT
