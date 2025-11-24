'use client';

import { Node } from '@/data';

interface Tier1TabsProps {
  tier1Nodes: Node[];
  selectedNodeId: string | null;
  onNodeSelect: (nodeId: string) => void;
  onClearSelection: () => void;
}

export default function Tier1Tabs({
  tier1Nodes,
  selectedNodeId,
  onNodeSelect,
  onClearSelection,
}: Tier1TabsProps) {
  return (
    <div className="w-full bg-gray-900 border-b border-gray-800 px-4 py-3">
      <div className="flex items-center gap-2">
        <button
          onClick={onClearSelection}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            selectedNodeId
              ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
              : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 cursor-default'
          }`}
          disabled={!selectedNodeId}
        >
          全体表示
        </button>
        <div className="h-6 w-px bg-gray-700" />
        <div className="flex items-center gap-2 flex-1 overflow-x-auto">
          {tier1Nodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            return (
              <button
                key={node.id}
                onClick={() => onNodeSelect(node.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                }`}
              >
                {node.title}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

