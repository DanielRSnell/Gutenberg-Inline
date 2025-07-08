import React, { useEffect } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { useBlockStore } from '../storage/store';

export function BlockHeader() {
  const { lastSelectedBlock, clearSelection, removeBlock } = useBlockStore();

  useEffect(() => {
    console.log('🔧 BlockHeader: lastSelectedBlock changed:', lastSelectedBlock);
  }, [lastSelectedBlock]);

  const handleUnselect = () => {
    clearSelection();
  };

  const handleDelete = () => {
    if (lastSelectedBlock) {
      removeBlock(lastSelectedBlock);
    }
  };

  if (!lastSelectedBlock) {
    return (
      <div className="h-12 bg-white border-t border-gray-200 flex items-center justify-center">
        <p className="text-sm text-gray-500">No block selected</p>
      </div>
    );
  }

  // Get HTML tag and class count from block
  const getBlockTag = () => {
    if (!lastSelectedBlock?.blockData) return 'div';
    
    // Try to extract tag from block's inner HTML or content
    const content = lastSelectedBlock.content || lastSelectedBlock.blockData.originalContent || '';
    const tagMatch = content.match(/<(\w+)[^>]*>/);
    return tagMatch ? tagMatch[1] : 'div';
  };

  const getClassCount = () => {
    if (!lastSelectedBlock?.attributes) return 0;
    
    let classCount = 0;
    const attributes = lastSelectedBlock.attributes;
    
    // Count classes from className attribute
    if (attributes.className) {
      classCount += attributes.className.split(' ').filter(c => c.trim()).length;
    }
    
    // Count classes from other common class attributes
    ['class', 'cssClassName'].forEach(attr => {
      if (attributes[attr]) {
        classCount += attributes[attr].split(' ').filter(c => c.trim()).length;
      }
    });
    
    return classCount;
  };

  const blockTag = getBlockTag();
  const classCount = getClassCount();

  return (
    <div className="h-12 bg-white border-t border-gray-200 flex items-center justify-between px-3">
      {/* Block Info */}
      <div className="flex items-center space-x-2 min-w-0 flex-1">
        <div className="w-5 h-5 bg-blue-500 rounded-sm flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-medium text-white uppercase leading-none">
            {blockTag.charAt(0)}
          </span>
        </div>
        <div className="min-w-0 flex-1 flex items-center space-x-2">
          <span className="text-sm font-mono text-gray-900 font-medium">
            &lt;{blockTag}&gt;
          </span>
          {classCount > 0 && (
            <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
              {classCount} class{classCount !== 1 ? 'es' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center space-x-1 flex-shrink-0">
        {/* Unselect Button */}
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              onClick={handleUnselect}
              className="w-6 h-6 hover:bg-gray-100 rounded transition-colors flex items-center justify-center"
            >
              <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              className="bg-gray-900 text-white px-2 py-1 rounded text-xs shadow-lg"
              sideOffset={5}
            >
              Unselect
              <Tooltip.Arrow className="fill-gray-900" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>

        {/* Delete Button */}
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              onClick={handleDelete}
              className="w-6 h-6 hover:bg-red-50 rounded transition-colors flex items-center justify-center group"
            >
              <svg className="w-3 h-3 text-gray-500 group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              className="bg-gray-900 text-white px-2 py-1 rounded text-xs shadow-lg"
              sideOffset={5}
            >
              Delete Block
              <Tooltip.Arrow className="fill-gray-900" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </div>
    </div>
  );
}