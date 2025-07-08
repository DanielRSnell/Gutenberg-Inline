import React from 'react';
import { getDisplayText } from '../../utils/PlainClasses/objectHelpers.js';

/**
 * Breadcrumb navigation for panel steps
 */
export function BreadcrumbNavigation({
  activeQuickPanel,
  selectedCategory,
  selectedItem,
  selectedUsage,
  onNavigateToStep
}) {
  return (
    <div className="flex items-center gap-2 mb-3 text-xs text-gray-600">
      <span className="capitalize font-medium">{activeQuickPanel}</span>
      
      {selectedCategory && (
        <>
          <span>→</span>
          <button 
            onClick={() => onNavigateToStep(1)}
            className="hover:text-blue-600 capitalize"
          >
            {getDisplayText(selectedCategory, 'Category')}
          </button>
        </>
      )}
      
      {selectedItem && (
        <>
          <span>→</span>
          <button 
            onClick={() => onNavigateToStep(2)}
            className="hover:text-blue-600"
          >
            {getDisplayText(selectedItem, 'Item')}
          </button>
        </>
      )}
      
      {selectedUsage && (
        <>
          <span>→</span>
          <button 
            onClick={() => onNavigateToStep(3)}
            className="hover:text-blue-600"
          >
            {getDisplayText(selectedUsage, 'Usage')}
          </button>
        </>
      )}
    </div>
  );
}