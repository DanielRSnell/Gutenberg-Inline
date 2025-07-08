import React from 'react';
import { SafeButton } from './SafeButton.jsx';
import { getDisplayText } from '../../utils/PlainClasses/objectHelpers.js';

/**
 * Generic control panel for layout, spacing, and typography
 */
export function ControlPanel({
  panelType,
  panelStep,
  categoryItems,
  itemOptions,
  selectedCategory,
  selectedItem,
  onCategorySelect,
  onItemSelect,
  onAddClass,
  onToggleClass,
  tokenValues = [],
  breakpointPrefix = ''
}) {

  const getPanelTitle = () => {
    switch (panelType) {
      case 'layout': return 'Layout';
      case 'spacing': return 'Spacing';
      case 'typography': return 'Typography';
      default: return 'Control';
    }
  };

  const getStepTitle = () => {
    const title = getPanelTitle();
    if (panelStep === 1) return `Choose ${title} Type:`;
    if (panelStep === 2) return `Choose ${getDisplayText(selectedCategory, 'Category')} Type:`;
    if (panelStep === 3) return `Choose ${getDisplayText(selectedItem, 'Item')} Value:`;
    return 'Choose Option:';
  };

  const getGridColumns = () => {
    if (panelStep === 1) return 'grid-cols-2';
    if (panelStep === 2) return 'grid-cols-1';
    if (panelStep === 3) {
      return panelType === 'spacing' ? 'grid-cols-4' : 'grid-cols-3';
    }
    return 'grid-cols-3';
  };

  return (
    <div>
      {/* Step 1: Categories */}
      {panelStep === 1 && (
        <div>
          <div className="text-sm font-medium mb-2">{getStepTitle()}</div>
          <div className={`grid ${getGridColumns()} gap-2 max-h-40 overflow-y-auto`}>
            {categoryItems.map((category, index) => (
              <SafeButton
                key={index}
                item={category}
                index={index}
                onClick={onCategorySelect}
                className="px-3 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 text-left"
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Step 2: Subcategories */}
      {panelStep === 2 && (
        <div>
          <div className="text-sm font-medium mb-2">{getStepTitle()}</div>
          <div className={`grid ${getGridColumns()} gap-2 max-h-40 overflow-y-auto`}>
            {itemOptions.map((item, index) => (
              <SafeButton
                key={index}
                item={item}
                index={index}
                onClick={onItemSelect}
                className="px-3 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 text-left"
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Step 3: Final Classes */}
      {panelStep === 3 && (
        <div>
          <div className="text-sm font-medium mb-2">{getStepTitle()}</div>
          <div className={`grid ${getGridColumns()} gap-2 max-h-40 overflow-y-auto`}>
            {itemOptions.map((item, index) => (
              <SafeButton
                key={index}
                item={item}
                index={index}
                onClick={(clickValue, item, index, isActive) => {
                  if (onToggleClass && isActive) {
                    onToggleClass(clickValue);
                  } else {
                    onAddClass(clickValue, item, index);
                  }
                }}
                className="px-2 py-2 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 text-center font-mono"
                tokenValues={tokenValues}
                breakpointPrefix={breakpointPrefix}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}