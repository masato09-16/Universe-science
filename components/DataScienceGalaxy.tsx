'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
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
  onBackgroundClick?: () => void;
  searchQuery?: string;
  selectedNodeId?: string | null;
}

export default function DataScienceGalaxy({
  nodes,
  links,
  onNodeClick,
  onBackgroundClick,
  searchQuery = '',
  selectedNodeId = null,
}: DataScienceGalaxyProps) {
  const [globalScale, setGlobalScale] = useState(1);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const graphRef = useRef<any>(null);

  // Initialize node positions in a hierarchical circular layout
  const [nodesWithPositions, setNodesWithPositions] = useState<any[]>([]);
  useEffect(() => {
    const centerX = 0;
    const centerY = 0;
    const tier1Radius = 150;
    const tier2Radius = 500;
    const tier3Radius = 1000;
    
    const tier1Nodes = nodes.filter(n => n.tier === 1);
    const tier2Nodes = nodes.filter(n => n.tier === 2);
    const tier3Nodes = nodes.filter(n => n.tier === 3);
    
    const positionedNodes = nodes.map((node) => {
      let x = 0, y = 0;
      
      if (node.tier === 1) {
        // Tier 1: Center area, spread out in a small circle
        const tier1Index = tier1Nodes.findIndex(n => n.id === node.id);
        const angle = (tier1Index * 2 * Math.PI) / tier1Nodes.length;
        const radius = tier1Radius + (tier1Index % 3) * 120;
        x = centerX + radius * Math.cos(angle);
        y = centerY + radius * Math.sin(angle);
      } else if (node.tier === 2) {
        // Tier 2: Middle ring with more spacing
        const tier2Index = tier2Nodes.findIndex(n => n.id === node.id);
        const angle = (tier2Index * 2 * Math.PI) / tier2Nodes.length;
        const radius = tier2Radius + (tier2Index % 5) * 80;
        x = centerX + radius * Math.cos(angle);
        y = centerY + radius * Math.sin(angle);
      } else {
        // Tier 3: Outer ring with more spacing
        const tier3Index = tier3Nodes.findIndex(n => n.id === node.id);
        const angle = (tier3Index * 2 * Math.PI) / tier3Nodes.length;
        const radius = tier3Radius + (tier3Index % 7) * 60;
        x = centerX + radius * Math.cos(angle);
        y = centerY + radius * Math.sin(angle);
      }
      
      return { ...node, x, y, vx: 0, vy: 0, fx: x, fy: y };
    });
    
    setNodesWithPositions(positionedNodes);
  }, [nodes]);

  // Calculate node opacity based on zoom level
  // Nodes are always visible (minimum opacity), but opacity increases with zoom
  const getNodeOpacity = useCallback(
    (node: Node, scale: number) => {
      const minOpacity = 0.25; // Increased minimum opacity for better visibility
      const maxOpacity = 1.0;

      if (scale >= 2.0) {
        // Fully zoomed in - all nodes at full opacity
        return maxOpacity;
      } else if (scale >= 1.2) {
        // Medium zoom - tier-based opacity
        if (node.tier === 1) return maxOpacity;
        if (node.tier === 2) {
          return Math.max(minOpacity, minOpacity + (scale - 1.2) * 0.94);
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
        return Math.max(minOpacity * 0.8, minOpacity * 0.8 * (scale / 1.2));
      }
    },
    []
  );

  // Check if label should be visible based on zoom level (more lenient for better visibility)
  const isLabelVisible = useCallback(
    (node: Node, scale: number) => {
      if (scale >= 1.2) return true; // Show all labels when zoomed in
      if (scale >= 0.8 && node.tier <= 2) return true; // Show tier 1-2 labels at medium zoom
      return node.tier === 1; // Show only tier 1 labels when zoomed out
    },
    []
  );

  // Calculate node size based on tier (larger for better visibility)
  const getNodeSize = useCallback((node: Node) => {
    switch (node.tier) {
      case 1:
        return 16;
      case 2:
        return 12;
      case 3:
        return 8;
      default:
        return 10;
    }
  }, []);

  // Get node color (highlight if matches search)
  const getNodeColor = useCallback((node: Node) => {
    const baseColor = node.color || '#00ffff';
    if (searchQuery && node.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return '#ffff00'; // Highlight matching nodes in bright yellow
    }
    return baseColor;
  }, [searchQuery]);

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

  // Filter nodes and links based on selected node
  // If a Tier 2/3 node is selected, show only that node and its connections
  // If a Tier 1 is selected or nothing is selected, show all relevant nodes
  const { visibleNodes, visibleLinks } = useMemo(() => {
    // Always exclude Tier 1 nodes from the graph view
    const nodesWithoutTier1 = nodesWithPositions.filter(n => {
      const nodeData = nodeMap.current.get(n.id);
      return nodeData && nodeData.tier !== 1;
    });

    // Create a set of visible node IDs for link filtering
    const visibleNodeIds = new Set(nodesWithoutTier1.map(n => n.id));

    if (!selectedNodeId) {
      // Filter links to only include those between visible nodes (no Tier 1)
      // Convert links to use node objects instead of IDs
      const filteredLinks: any[] = [];
      links.forEach(link => {
        const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
        const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;
        
        // Check if both nodes are in nodesWithoutTier1 (exclude Tier 1)
        const sourceNode = nodesWithoutTier1.find(n => n.id === sourceId);
        const targetNode = nodesWithoutTier1.find(n => n.id === targetId);
        
        // Only include links between visible nodes (no Tier 1)
        if (sourceNode && targetNode && visibleNodeIds.has(sourceId) && visibleNodeIds.has(targetId)) {
          filteredLinks.push({ source: sourceNode, target: targetNode });
        }
      });
      return { visibleNodes: nodesWithoutTier1, visibleLinks: filteredLinks };
    }

    // Find selected node
    const selectedNode = nodesWithPositions.find(n => n.id === selectedNodeId);
    if (!selectedNode) {
      // Convert links to use node objects instead of IDs
      const filteredLinks: any[] = [];
      links.forEach(link => {
        const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
        const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;
        
        // Check if both nodes are in nodesWithoutTier1 (exclude Tier 1)
        const sourceNode = nodesWithoutTier1.find(n => n.id === sourceId);
        const targetNode = nodesWithoutTier1.find(n => n.id === targetId);
        
        // Only include links between visible nodes (no Tier 1)
        if (sourceNode && targetNode && visibleNodeIds.has(sourceId) && visibleNodeIds.has(targetId)) {
          filteredLinks.push({ source: sourceNode, target: targetNode });
        }
      });
      return { visibleNodes: nodesWithoutTier1, visibleLinks: filteredLinks };
    }

    const selectedNodeData = nodeMap.current.get(selectedNodeId);
    
    // If Tier 1 is selected, show all its children (Tier 2 and Tier 3)
    if (selectedNodeData && selectedNodeData.tier === 1) {
      const connectedNodeIds = new Set<string>();
      
      // Get all Tier 2 nodes connected to this Tier 1
      links.forEach(link => {
        const source = typeof link.source === 'string' ? link.source : (link.source as any).id;
        const target = typeof link.target === 'string' ? link.target : (link.target as any).id;
        
        if (source === selectedNodeId) {
          connectedNodeIds.add(target);
        }
      });

      // Get all Tier 3 nodes connected to those Tier 2 nodes
      links.forEach(link => {
        const source = typeof link.source === 'string' ? link.source : (link.source as any).id;
        const target = typeof link.target === 'string' ? link.target : (link.target as any).id;
        
        if (connectedNodeIds.has(source)) {
          connectedNodeIds.add(target);
        }
      });

      // Filter nodes and links (only include visible nodes, no Tier 1)
      const filteredNodes = nodesWithoutTier1.filter(n => connectedNodeIds.has(n.id));
      const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
      
      // Convert links to use node objects instead of IDs
      // Only include links where both source and target are in filteredNodes (no Tier 1)
      const filteredLinks: any[] = [];
      links.forEach(link => {
        const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
        const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;
        
        // Check if both nodes are in filteredNodes (exclude Tier 1)
        const sourceNode = filteredNodes.find(n => n.id === sourceId);
        const targetNode = filteredNodes.find(n => n.id === targetId);
        
        // Only include links between visible nodes (no Tier 1)
        if (sourceNode && targetNode && filteredNodeIds.has(sourceId) && filteredNodeIds.has(targetId)) {
          filteredLinks.push({ source: sourceNode, target: targetNode });
        }
      });

      return { visibleNodes: filteredNodes, visibleLinks: filteredLinks };
    }

    // For Tier 2 and Tier 3, show all nodes in the same Tier 1 group, not just direct connections
    // This allows users to see other nodes when clicking background
    const tier1ParentId = (() => {
      // Find the Tier 1 parent of the selected node
      for (const link of links) {
        const source = typeof link.source === 'string' ? link.source : (link.source as any).id;
        const target = typeof link.target === 'string' ? link.target : (link.target as any).id;
        const sourceNode = nodeMap.current.get(source);
        
        if (sourceNode && sourceNode.tier === 1 && target === selectedNodeId) {
          return source;
        }
      }
      return null;
    })();

    if (tier1ParentId) {
      // Show all nodes under the same Tier 1 parent
      const connectedNodeIds = new Set<string>();
      
      // Get all Tier 2 nodes connected to the Tier 1 parent
      links.forEach(link => {
        const source = typeof link.source === 'string' ? link.source : (link.source as any).id;
        const target = typeof link.target === 'string' ? link.target : (link.target as any).id;
        
        if (source === tier1ParentId) {
          connectedNodeIds.add(target);
        }
      });

      // Get all Tier 3 nodes connected to those Tier 2 nodes
      links.forEach(link => {
        const source = typeof link.source === 'string' ? link.source : (link.source as any).id;
        const target = typeof link.target === 'string' ? link.target : (link.target as any).id;
        
        if (connectedNodeIds.has(source)) {
          connectedNodeIds.add(target);
        }
      });

      // Filter nodes and links (only include visible nodes, no Tier 1)
      const filteredNodes = nodesWithoutTier1.filter(n => connectedNodeIds.has(n.id));
      const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
      
      // Convert links to use node objects instead of IDs
      // Only include links where both source and target are in filteredNodes (no Tier 1)
      const filteredLinks: any[] = [];
      links.forEach(link => {
        const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
        const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;
        
        // Check if both nodes are in filteredNodes (exclude Tier 1)
        const sourceNode = filteredNodes.find(n => n.id === sourceId);
        const targetNode = filteredNodes.find(n => n.id === targetId);
        
        // Only include links between visible nodes (no Tier 1)
        if (sourceNode && targetNode && filteredNodeIds.has(sourceId) && filteredNodeIds.has(targetId)) {
          filteredLinks.push({ source: sourceNode, target: targetNode });
        }
      });

      return { visibleNodes: filteredNodes, visibleLinks: filteredLinks };
    }

    // Fallback: show selected node and its direct connections
    const connectedNodeIds = new Set<string>([selectedNodeId]);
    links.forEach(link => {
      const source = typeof link.source === 'string' ? link.source : (link.source as any).id;
      const target = typeof link.target === 'string' ? link.target : (link.target as any).id;
      
      if (source === selectedNodeId) {
        connectedNodeIds.add(target);
      }
      if (target === selectedNodeId) {
        connectedNodeIds.add(source);
      }
    });

    // Filter nodes and links (only include visible nodes, no Tier 1)
    const filteredNodes = nodesWithoutTier1.filter(n => connectedNodeIds.has(n.id));
    const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
    
    // Convert links to use node objects instead of IDs
    // Only include links where both source and target are in filteredNodes (no Tier 1)
    const filteredLinks: any[] = [];
    links.forEach(link => {
      const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
      const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;
      
      // Check if both nodes are in filteredNodes (exclude Tier 1)
      const sourceNode = filteredNodes.find(n => n.id === sourceId);
      const targetNode = filteredNodes.find(n => n.id === targetId);
      
      // Only include links between visible nodes (no Tier 1)
      if (sourceNode && targetNode && filteredNodeIds.has(sourceId) && filteredNodeIds.has(targetId)) {
        filteredLinks.push({ source: sourceNode, target: targetNode });
      }
    });

    return { visibleNodes: filteredNodes, visibleLinks: filteredLinks };
  }, [nodesWithPositions, links, selectedNodeId]);

  // Don't render until nodes are positioned
  if (nodesWithPositions.length === 0) {
    return <div className="w-full h-screen bg-black" />;
  }

  return (
    <div className="w-full h-screen bg-black relative">
      <ForceGraph2D
        ref={graphRef}
        graphData={{ nodes: visibleNodes, links: visibleLinks }}
        nodeLabel={(node: any) => {
          const nodeData = nodeMap.current.get(node.id);
          return nodeData ? nodeData.title : '';
        }}
        nodeColor={(node: any) => {
          const nodeData = nodeMap.current.get(node.id);
          if (!nodeData) return '#00ffff';
          if (node.id === selectedNodeId) {
            return '#ffffff'; // Selected node in white
          }
          return getNodeColor(nodeData);
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
          const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
          const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;
          const linkKey = `${sourceId}-${targetId}`;
          const isConnectedToSelected = selectedNodeId && (sourceId === selectedNodeId || targetId === selectedNodeId);
          
          if (hoveredLink === linkKey) {
            return 'rgba(0, 255, 255, 1.0)';
          }
          if (isConnectedToSelected) {
            return 'rgba(0, 255, 255, 0.6)';
          }
          return 'rgba(255, 255, 255, 0.2)';
        }}
        linkWidth={(link: any) => {
          const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
          const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;
          const linkKey = `${sourceId}-${targetId}`;
          const isConnectedToSelected = selectedNodeId && (sourceId === selectedNodeId || targetId === selectedNodeId);
          
          if (hoveredLink === linkKey) {
            return 3;
          }
          if (isConnectedToSelected) {
            return 2.5;
          }
          return 1.5;
        }}
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={2}
        linkDirectionalParticleColor={() => 'rgba(0, 255, 255, 0.6)'}
        onLinkHover={(link: any) => {
          if (link) {
            const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
            const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;
            const linkKey = `${sourceId}-${targetId}`;
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
            if (selectedNodeId) {
              // Center on selected node
              const selectedNode = visibleNodes.find((n: any) => n.id === selectedNodeId);
              if (selectedNode && selectedNode.x !== undefined && selectedNode.y !== undefined) {
                graphRef.current.centerAt(selectedNode.x, selectedNode.y, 1000);
                graphRef.current.zoom(2, 1000);
              }
            } else {
              graphRef.current.zoomToFit(400, 20);
            }
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
          const isSelected = node.id === selectedNodeId;
          const isHighlighted = searchQuery && nodeData.title.toLowerCase().includes(searchQuery.toLowerCase());
          
          // Get color based on selection and search
          let color = getNodeColor(nodeData);
          if (isSelected) {
            color = '#ffffff';
          } else if (isHighlighted) {
            color = '#ffff00';
          }

          // Draw node as a clean circle (no glow for better visibility)
          ctx.fillStyle = color;
          ctx.globalAlpha = opacity;
          ctx.beginPath();
          ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
          ctx.fill();
          
          // Add border for better visibility
          ctx.strokeStyle = isSelected ? '#00ffff' : (isHighlighted ? '#ffffff' : color);
          ctx.lineWidth = isSelected ? 3 : (isHighlighted ? 2 : 1.5);
          ctx.globalAlpha = opacity;
          ctx.stroke();
          ctx.globalAlpha = 1;

          // Always show labels for better visibility
          const label = nodeData.title;
          const baseFontSize = 12;
          const fontSize = Math.max(10, Math.min(20, baseFontSize * scale));
          
          // Draw label background for better readability
          ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const metrics = ctx.measureText(label);
          const textWidth = metrics.width;
          const textHeight = fontSize;
          const padding = Math.max(4, fontSize * 0.25);
          const borderRadius = 3;
          
          const labelY = node.y + size + fontSize / 2 + padding;
          const labelX = node.x;
          
          // Background rectangle with rounded corners
          if (isSelected) {
            ctx.fillStyle = 'rgba(0, 255, 255, 0.95)';
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
          } else if (isHighlighted) {
            ctx.fillStyle = 'rgba(255, 255, 0, 0.95)';
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
          } else {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 1;
          }
          
          // Draw rounded rectangle background
          const rectX = labelX - textWidth / 2 - padding;
          const rectY = labelY - textHeight / 2 - padding;
          const rectW = textWidth + padding * 2;
          const rectH = textHeight + padding * 2;
          
          ctx.beginPath();
          ctx.moveTo(rectX + borderRadius, rectY);
          ctx.lineTo(rectX + rectW - borderRadius, rectY);
          ctx.quadraticCurveTo(rectX + rectW, rectY, rectX + rectW, rectY + borderRadius);
          ctx.lineTo(rectX + rectW, rectY + rectH - borderRadius);
          ctx.quadraticCurveTo(rectX + rectW, rectY + rectH, rectX + rectW - borderRadius, rectY + rectH);
          ctx.lineTo(rectX + borderRadius, rectY + rectH);
          ctx.quadraticCurveTo(rectX, rectY + rectH, rectX, rectY + rectH - borderRadius);
          ctx.lineTo(rectX, rectY + borderRadius);
          ctx.quadraticCurveTo(rectX, rectY, rectX + borderRadius, rectY);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          
          // Label text
          ctx.fillStyle = isSelected || isHighlighted
            ? 'rgba(0, 0, 0, 1)'
            : 'rgba(255, 255, 255, 1)';
          
          ctx.fillText(label, labelX, labelY);
        }}
      />
    </div>
  );
}

