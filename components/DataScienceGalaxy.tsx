'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Node, Link } from '@/data';

// Dynamically import react-force-graph-2d with SSR disabled
const ForceGraph2D = dynamic(
  () => import('react-force-graph-2d'),
  { ssr: false }
);

interface DataScienceGalaxyProps {
  nodes: Node[];
  links: Link[];
  onNodeClick: (node: Node) => void;
}

export default function DataScienceGalaxy({
  nodes,
  links,
  onNodeClick,
}: DataScienceGalaxyProps) {
  const [globalScale, setGlobalScale] = useState(1);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const graphRef = useRef<any>(null);

  // Calculate node opacity based on zoom level
  // Nodes are always visible (minimum opacity), but opacity increases with zoom
  const getNodeOpacity = useCallback(
    (node: Node, scale: number) => {
      const minOpacity = 0.15; // Minimum opacity to keep nodes visible when zoomed out
      const maxOpacity = 1.0;

      if (scale >= 2.0) {
        // Fully zoomed in - all nodes at full opacity
        return maxOpacity;
      } else if (scale >= 1.2) {
        // Medium zoom - tier-based opacity
        if (node.tier === 1) return maxOpacity;
        if (node.tier === 2) {
          return Math.max(minOpacity, minOpacity + (scale - 1.2) * 1.06);
        }
        // Tier 3
        return Math.max(minOpacity, minOpacity + (scale - 1.2) * 0.5);
      } else {
        // Zoomed out - tier-based minimum opacity
        if (node.tier === 1) return maxOpacity;
        if (node.tier === 2) {
          return Math.max(minOpacity, minOpacity * (scale / 1.2));
        }
        // Tier 3 - smaller minimum opacity when zoomed out
        return Math.max(minOpacity * 0.7, minOpacity * 0.7 * (scale / 1.2));
      }
    },
    []
  );

  // Check if label should be visible based on zoom level
  const isLabelVisible = useCallback(
    (node: Node, scale: number) => {
      if (scale >= 1.5) return true; // Show all labels when zoomed in
      if (scale >= 1.0 && node.tier <= 2) return true; // Show tier 1-2 labels at medium zoom
      return node.tier === 1; // Show only tier 1 labels when zoomed out
    },
    []
  );

  // Calculate node size based on tier
  const getNodeSize = useCallback((node: Node) => {
    switch (node.tier) {
      case 1:
        return 12;
      case 2:
        return 8;
      case 3:
        return 5;
      default:
        return 6;
    }
  }, []);

  // Get node color
  const getNodeColor = useCallback((node: Node) => {
    return node.color || '#00ffff';
  }, []);

  // Create node lookup map
  const nodeMap = useRef(new Map<string, Node>());
  useEffect(() => {
    nodeMap.current = new Map(nodes.map((node) => [node.id, node]));
  }, [nodes]);

  // Create link lookup map
  const linkMap = useRef(new Map<string, Link>());
  useEffect(() => {
    linkMap.current = new Map(
      links.map((link) => [`${link.source}-${link.target}`, link])
    );
  }, [links]);

  // All links are visible (nodes are always visible)
  const visibleLinks = links;

  return (
    <div className="w-full h-screen bg-black">
      <ForceGraph2D
        ref={graphRef}
        graphData={{ nodes, links: visibleLinks }}
        nodeLabel={(node: any) => {
          const nodeData = nodeMap.current.get(node.id);
          return nodeData ? nodeData.title : '';
        }}
        nodeColor={(node: any) => {
          const nodeData = nodeMap.current.get(node.id);
          return nodeData ? getNodeColor(nodeData) : '#00ffff';
        }}
        nodeVal={(node: any) => {
          const nodeData = nodeMap.current.get(node.id);
          return nodeData ? getNodeSize(nodeData) : 6;
        }}
        nodeOpacity={(node: any) => {
          const nodeData = nodeMap.current.get(node.id);
          return nodeData ? getNodeOpacity(nodeData, globalScale) : 1;
        }}
        linkColor={(link: any) => {
          const linkKey = `${link.source.id || link.source}-${link.target.id || link.target}`;
          return hoveredLink === linkKey
            ? 'rgba(0, 255, 255, 0.8)'
            : 'rgba(255, 255, 255, 0.2)';
        }}
        linkWidth={(link: any) => {
          const linkKey = `${link.source.id || link.source}-${link.target.id || link.target}`;
          return hoveredLink === linkKey ? 2 : 1;
        }}
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={2}
        linkDirectionalParticleColor={() => 'rgba(0, 255, 255, 0.6)'}
        onLinkHover={(link: any) => {
          if (link) {
            const linkKey = `${link.source.id || link.source}-${link.target.id || link.target}`;
            setHoveredLink(linkKey);
          } else {
            setHoveredLink(null);
          }
        }}
        onNodeClick={(node: any) => {
          const nodeData = nodeMap.current.get(node.id);
          if (nodeData) {
            onNodeClick(nodeData);
          }
        }}
        cooldownTicks={0}
        d3Force={(d3: any) => {
          // Disable all forces to keep nodes static
          d3.force('link', null);
          d3.force('charge', null);
          d3.force('center', null);
          d3.force('collision', null);
        }}
        onEngineStop={() => {
          if (graphRef.current) {
            graphRef.current.zoomToFit(400, 20);
          }
        }}
        nodeCanvasObjectMode={() => 'replace'}
        nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, scale: number) => {
          const nodeData = nodeMap.current.get(node.id);
          if (!nodeData) return;

          // Check if node position is valid
          if (
            typeof node.x !== 'number' ||
            typeof node.y !== 'number' ||
            !isFinite(node.x) ||
            !isFinite(node.y)
          ) {
            return;
          }

          // Update global scale for visibility calculations
          if (Math.abs(scale - globalScale) > 0.1) {
            setGlobalScale(scale);
          }

          const opacity = getNodeOpacity(nodeData, scale);
          if (opacity === 0) return;

          const size = getNodeSize(nodeData);
          const color = getNodeColor(nodeData);

          // Create glow effect
          const gradient = ctx.createRadialGradient(
            node.x,
            node.y,
            0,
            node.x,
            node.y,
            size * 3
          );
          gradient.addColorStop(0, color);
          gradient.addColorStop(0.5, color + '80');
          gradient.addColorStop(1, color + '00');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(node.x, node.y, size * 3, 0, 2 * Math.PI);
          ctx.fill();

          // Draw node
          ctx.fillStyle = color;
          ctx.globalAlpha = opacity;
          ctx.beginPath();
          ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
          ctx.fill();
          ctx.globalAlpha = 1;

          // Draw label (only when zoom level is appropriate)
          if (isLabelVisible(nodeData, scale)) {
            const label = nodeData.title;
            const fontSize = Math.max(8, 12 / scale);
            ctx.font = `${fontSize}px Sans-Serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            // Label opacity also scales with zoom
            const labelOpacity = scale >= 1.5 ? 0.8 : Math.max(0.3, (scale - 0.8) * 0.5);
            ctx.fillStyle = `rgba(255, 255, 255, ${labelOpacity})`;
            ctx.fillText(label, node.x, node.y + size + fontSize + 2);
          }
        }}
      />
    </div>
  );
}

