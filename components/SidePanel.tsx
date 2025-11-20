'use client';

import { X, ExternalLink, BookOpen, Video, GraduationCap, FileText, FileCheck } from 'lucide-react';
import { Node, Resource } from '@/data';

interface SidePanelProps {
  node: Node | null;
  isOpen: boolean;
  onClose: () => void;
}

const resourceIcons = {
  article: BookOpen,
  video: Video,
  course: GraduationCap,
  documentation: FileText,
  paper: FileCheck,
};

const resourceColors = {
  article: 'text-cyan-400',
  video: 'text-magenta-400',
  course: 'text-yellow-400',
  documentation: 'text-cyan-300',
  paper: 'text-magenta-300',
};

export default function SidePanel({ node, isOpen, onClose }: SidePanelProps) {
  if (!node) return null;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-gray-900 border-l border-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800">
            <h2 className="text-2xl font-bold text-white">{node.title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Close panel"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Description */}
            <div className="mb-6">
              <p className="text-gray-300 leading-relaxed">{node.description}</p>
            </div>

            {/* Tier Badge */}
            <div className="mb-6">
              <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-gray-800 text-gray-300">
                Tier {node.tier}
              </span>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">
                Learning Resources
              </h3>
              {node.resources.length === 0 ? (
                <p className="text-gray-500">No resources available for this topic.</p>
              ) : (
                <div className="space-y-3">
                  {node.resources.map((resource: Resource, index: number) => {
                    const Icon = resourceIcons[resource.type];
                    const colorClass = resourceColors[resource.type];
                    return (
                      <a
                        key={index}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 hover:bg-gray-700 transition-all group"
                      >
                        <div className="flex items-start gap-3">
                          <Icon className={`w-5 h-5 ${colorClass} flex-shrink-0 mt-0.5`} />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-medium group-hover:text-cyan-400 transition-colors mb-1">
                              {resource.title}
                            </h4>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <span className="capitalize">{resource.type}</span>
                              <ExternalLink className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

