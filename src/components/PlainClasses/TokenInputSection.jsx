import React from 'react';
import TokenInput from 'react-customize-token-input';
import { validateClassName } from '../../utils/PlainClasses/classHelpers.js';
import { TAILWIND_COLOR_MAP } from '../../utils/PlainClasses/constants.js';

/**
 * Token input section with autocomplete dropdown
 */
export function TokenInputSection({
  tokenValues,
  onTokenValuesChange,
  selectedBreakpoint,
  autocompleteResults,
  showAutocomplete,
  onInputValueChange,
  onAutocompleteSelect,
  onAutocompleteHide,
  autocompleteRef
}) {
  // Ensure tokenValues is always an array
  const safeTokenValues = Array.isArray(tokenValues) ? tokenValues : [];
  const safeAutocompleteResults = Array.isArray(autocompleteResults) ? autocompleteResults : [];

  /**
   * Get color from Tailwind class name for swatch display
   */
  const getColorFromClass = (className) => {
    if (!className || !className.startsWith('bg-')) return null;
    return TAILWIND_COLOR_MAP[className] || null;
  };

  return (
    <div className="relative">
      <TokenInput
        tokenValues={safeTokenValues}
        onTokenValuesChange={onTokenValuesChange}
        separators={[' ', '\n', '\t']}
        placeholder="Enter CSS classes..."
        onPreprocess={(inputValues) => {
          // Ensure inputValues is an array
          const safeInputValues = Array.isArray(inputValues) ? inputValues : [];
          return safeInputValues
            .map(value => typeof value === 'string' ? value.trim() : String(value).trim())
            .filter(value => value.length > 0)
            .map(value => {
              // Apply breakpoint prefix if not already present and breakpoint is selected
              if (selectedBreakpoint && !value.includes(':')) {
                return selectedBreakpoint + value;
              }
              return value;
            });
        }}
        onTokenValueValidate={validateClassName}
        onInputValueChange={(inputValue) => {
          // Handle autocomplete when user types
          if (inputValue && inputValue.length >= 2) {
            onInputValueChange(inputValue);
          } else {
            onAutocompleteHide();
          }
        }}
      />
      
      {/* Autocomplete Dropdown */}
      {showAutocomplete && safeAutocompleteResults.length > 0 && (
        <div 
          ref={autocompleteRef}
          className="absolute z-50 w-full -mt-1 bg-white border-2 border-gray-300 ring-1 ring-gray-200 rounded-md shadow-lg max-h-72 overflow-auto backdrop-blur-sm"
        >
          {safeAutocompleteResults.map((result, index) => {
            const swatchColor = getColorFromClass(result.value);
            
            return (
              <div
                key={index}
                className={`relative px-3 py-2 cursor-pointer text-sm bg-neutral/20 hover:bg-neutral/40 transition-all duration-200 ${index < autocompleteResults.length - 1 ? 'border-b border-neutral/50' : ''}`}
                onClick={() => onAutocompleteSelect(result.value || result)}
              >
                {/* Color swatch */}
                {swatchColor && (
                  <div 
                    className="absolute left-0 top-0 w-1 h-full"
                    style={{
                      backgroundColor: swatchColor
                    }}
                  />
                )}
                <div className="font-mono font-medium">{result.value || result}</div>
                {result.color && (
                  <div className="text-xs text-gray-500 mt-1">
                    Color: {result.color}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}