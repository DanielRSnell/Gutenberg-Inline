import React from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { SafeButton } from './SafeButton.jsx';
import { getDisplayText, getClickValue } from '../../utils/PlainClasses/objectHelpers.js';

/**
 * Color panel with 4-step selection process
 */
export function ColorPanel({
  panelStep,
  categoryItems,
  itemOptions,
  onCategorySelect,
  onItemSelect,
  onUsageSelect,
  onAddClass,
  onToggleClass,
  tokenValues = [],
  breakpointPrefix = ''
}) {

  return (
    <div>
      {/* Step 1: Color Bases */}
      {panelStep === 1 && (
        <div>
          <div className="text-sm font-medium mb-2">Choose Color:</div>
          <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
            {categoryItems.map((colorBase, index) => (
              <SafeButton
                key={index}
                item={colorBase}
                index={index}
                onClick={onCategorySelect}
                className="px-3 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 text-left capitalize"
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Step 2: Color Shades */}
      {panelStep === 2 && (
        <div>
          <div className="text-sm font-medium mb-2">Choose Shade:</div>
          <Tooltip.Provider>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
              {itemOptions.map((shadeObj, index) => {
                const shadeDisplay = getDisplayText(shadeObj, 'Unknown');
                const shadeColor = typeof shadeObj === 'object' ? shadeObj.color : null;
                const shadeValue = typeof shadeObj === 'object' ? shadeObj.value : shadeObj;
                
                return (
                  <Tooltip.Root key={index}>
                    <Tooltip.Trigger asChild>
                      <button
                        onClick={() => onItemSelect(shadeObj)}
                        className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-400 transition-all duration-200 flex items-center justify-center relative group flex-shrink-0"
                        style={{
                          backgroundColor: shadeColor || '#ccc'
                        }}
                      >
                        <span className="text-xs font-mono text-white text-shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {shadeDisplay === 'base' ? 'B' : shadeDisplay}
                        </span>
                      </button>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content
                        className="bg-gray-900 text-white px-2 py-1 rounded text-xs font-mono max-w-xs shadow-lg"
                        sideOffset={5}
                      >
                        <div className="text-center">
                          <div className="font-medium">{shadeValue || 'Unknown'}</div>
                          {shadeColor && <div className="text-gray-300 text-xs">{shadeColor}</div>}
                        </div>
                        <Tooltip.Arrow className="fill-gray-900" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                );
              })}
            </div>
          </Tooltip.Provider>
        </div>
      )}
      
      {/* Step 3: Usage Categories */}
      {panelStep === 3 && (
        <div>
          <div className="text-sm font-medium mb-2">Choose Usage:</div>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
            {itemOptions.map((usage, index) => (
              <SafeButton
                key={index}
                item={usage}
                index={index}
                onClick={onUsageSelect}
                className="px-3 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 text-center"
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Step 4: Transparency Options */}
      {panelStep === 4 && (
        <div>
          <div className="text-sm font-medium mb-2">Choose Transparency:</div>
          <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
            {itemOptions.map((option, index) => (
              <SafeButton
                key={index}
                item={option}
                index={index}
                onClick={(clickValue, item, index, isActive) => {
                  if (onToggleClass && isActive) {
                    onToggleClass(clickValue);
                  } else {
                    onAddClass(clickValue, item, index);
                  }
                }}
                className="px-3 py-2 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 text-center font-mono"
                tokenValues={tokenValues}
                breakpointPrefix={breakpointPrefix}
              >
                {typeof option === 'object' ? option.opacity : '100%'}
              </SafeButton>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}