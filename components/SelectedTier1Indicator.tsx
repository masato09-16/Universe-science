'use client';

import { Node } from '@/data';

interface SelectedTier1IndicatorProps {
  selectedTier1Node: Node | null;
  onClearSelection: () => void;
}

export default function SelectedTier1Indicator({
  selectedTier1Node,
  onClearSelection,
}: SelectedTier1IndicatorProps) {
  if (!selectedTier1Node) {
    return null;
  }

  return (
    <div className="absolute top-4 left-4 z-50 bg-gray-900/95 border border-cyan-500/30 rounded-lg px-4 py-2 backdrop-blur-md shadow-lg">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-cyan-400" />
          <span className="text-sm font-semibold text-cyan-300">
            {selectedTier1Node.title}
          </span>
        </div>
        <button
          onClick={onClearSelection}
          className="text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 hover:bg-gray-800 rounded"
        >
          クリア
        </button>
      </div>
    </div>
  );
}

