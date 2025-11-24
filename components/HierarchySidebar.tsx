'use client';

import { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, Circle } from 'lucide-react';
import { Node, Link } from '@/data';

interface HierarchySidebarProps {
  nodes: Node[];
  links: Link[];
  selectedNodeId: string | null;
  onNodeSelect: (nodeId: string) => void;
}

export default function HierarchySidebar({
  nodes,
  links,
  selectedNodeId,
  onNodeSelect,
}: HierarchySidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['math-stats', 'engineering', 'data-prep', 'ml', 'deep-learning', 'business-mlops']));

  const toggleSection = (nodeId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedSections(newExpanded);
  };

  // Build hierarchy from links
  const hierarchy = useMemo(() => {
    const tier1Nodes = nodes.filter((n) => n.tier === 1);
    const tier2Nodes = nodes.filter((n) => n.tier === 2);
    const tier3Nodes = nodes.filter((n) => n.tier === 3);

    // Build parent-child relationships from links
    const childrenMap = new Map<string, string[]>();
    links.forEach((link) => {
      const source = typeof link.source === 'string' ? link.source : (link.source as any).id;
      const target = typeof link.target === 'string' ? link.target : (link.target as any).id;
      
      const sourceNode = nodes.find(n => n.id === source);
      const targetNode = nodes.find(n => n.id === target);
      
      // Only consider links from lower tier to higher tier (parent to child)
      if (sourceNode && targetNode && sourceNode.tier < targetNode.tier) {
        if (!childrenMap.has(source)) {
          childrenMap.set(source, []);
        }
        childrenMap.get(source)!.push(target);
      }
    });

    // Organize by tier
    const result: { [key: string]: { node: Node; children: { [key: string]: { node: Node; children: Node[] } } } } = {};
    
    tier1Nodes.forEach((tier1) => {
      const tier2Children: { [key: string]: { node: Node; children: Node[] } } = {};
      const tier2Ids = childrenMap.get(tier1.id) || [];
      
      tier2Ids.forEach((tier2Id) => {
        const tier2Node = tier2Nodes.find(n => n.id === tier2Id);
        if (tier2Node) {
          const tier3Ids = childrenMap.get(tier2Id) || [];
          const tier3Children = tier3Ids
            .map(id => tier3Nodes.find(n => n.id === id))
            .filter((n): n is Node => n !== undefined);
          
          tier2Children[tier2Id] = { node: tier2Node, children: tier3Children };
        }
      });
      
      result[tier1.id] = { node: tier1, children: tier2Children };
    });

    return result;
  }, [nodes, links]);

  const getNodeColor = (tier: number) => {
    switch (tier) {
      case 1:
        return 'text-cyan-400';
      case 2:
        return 'text-magenta-400';
      case 3:
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  const getNodeBgColor = (tier: number, isSelected: boolean) => {
    if (isSelected) return 'bg-cyan-500/20 border-cyan-500';
    switch (tier) {
      case 1:
        return 'bg-cyan-500/10 border-cyan-500/30';
      case 2:
        return 'bg-magenta-500/10 border-magenta-500/30';
      case 3:
        return 'bg-yellow-500/10 border-yellow-500/30';
      default:
        return 'bg-gray-500/10 border-gray-500/30';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-2">
        {Object.entries(hierarchy).map(([tier1Id, tier1Data]) => {
          const isExpanded = expandedSections.has(tier1Id);
          const isSelected = selectedNodeId === tier1Id;

          return (
            <div key={tier1Id} className="mb-1">
              {/* Tier 1 Node - Now just a header */}
              <div
                className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${getNodeBgColor(
                  1,
                  isSelected
                )} ${isSelected ? 'ring-2 ring-cyan-500' : ''}`}
              >
                <button
                  onClick={() => toggleSection(tier1Id)}
                  className="p-0.5 hover:bg-gray-800 rounded"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                <Circle className={`w-3 h-3 ${getNodeColor(1)}`} fill="currentColor" />
                <span className={`flex-1 text-sm font-medium ${isSelected ? 'text-cyan-300' : 'text-white'}`}>
                  {tier1Data.node.title}
                </span>
              </div>

              {/* Tier 2 Children */}
              {isExpanded && (
                <div className="ml-6 mt-1 space-y-1">
                  {Object.entries(tier1Data.children).map(([tier2Id, tier2Data]) => {
                    const isTier2Expanded = expandedSections.has(tier2Id);
                    const isTier2Selected = selectedNodeId === tier2Id;

                    return (
                      <div key={tier2Id} className="mb-1">
                        <div
                          className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${getNodeBgColor(
                            2,
                            isTier2Selected
                          )} ${isTier2Selected ? 'ring-2 ring-magenta-500' : ''}`}
                          onClick={() => onNodeSelect(tier2Id)}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSection(tier2Id);
                            }}
                            className="p-0.5 hover:bg-gray-800 rounded"
                          >
                            {isTier2Expanded ? (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                          <Circle className={`w-2.5 h-2.5 ${getNodeColor(2)}`} fill="currentColor" />
                          <span className={`flex-1 text-xs ${isTier2Selected ? 'text-magenta-300' : 'text-gray-300'}`}>
                            {tier2Data.node.title}
                          </span>
                        </div>

                        {/* Tier 3 Children */}
                        {isTier2Expanded && (
                          <div className="ml-6 mt-1 space-y-1">
                            {tier2Data.children.map((tier3Node) => {
                              const isTier3Selected = selectedNodeId === tier3Node.id;
                              return (
                                <div
                                  key={tier3Node.id}
                                  className={`flex items-center gap-2 p-1.5 rounded border cursor-pointer transition-all ${getNodeBgColor(
                                    3,
                                    isTier3Selected
                                  )} ${isTier3Selected ? 'ring-2 ring-yellow-500' : ''}`}
                                  onClick={() => onNodeSelect(tier3Node.id)}
                                >
                                  <Circle className={`w-2 h-2 ${getNodeColor(3)}`} fill="currentColor" />
                                  <span className={`flex-1 text-xs ${isTier3Selected ? 'text-yellow-300' : 'text-gray-400'}`}>
                                    {tier3Node.title}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

