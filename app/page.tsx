'use client';

import { useState } from 'react';
import DataScienceGalaxy from '@/components/DataScienceGalaxy';
import SidePanel from '@/components/SidePanel';
import { nodes, links, Node } from '@/data';

export default function Home() {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const handleNodeClick = (node: Node) => {
    setSelectedNode(node);
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
  };

  return (
    <main className="relative w-full h-screen overflow-hidden">
      <DataScienceGalaxy
        nodes={nodes}
        links={links}
        onNodeClick={handleNodeClick}
      />
      <SidePanel
        node={selectedNode}
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
      />
    </main>
  );
}

