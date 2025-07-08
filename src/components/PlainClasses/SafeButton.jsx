import React from 'react';
import { getDisplayText, getClickValue, getReactKey } from '../../utils/PlainClasses/objectHelpers.js';
import { isClassActive } from '../../utils/PlainClasses/classHelpers.js';

/**
 * Safe button component that handles both object and string items
 * Prevents React "Objects are not valid as a React child" errors
 * Supports highlighting active classes and toggle behavior
 */
export function SafeButton({ 
  item, 
  index, 
  onClick, 
  className = "px-3 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 text-left",
  activeClassName = "bg-blue-100 border-blue-500 text-blue-700",
  hoverActiveClassName = "hover:bg-red-100 hover:border-red-500 hover:text-red-700",
  children,
  tokenValues = [],
  breakpointPrefix = '',
  showActiveState = true,
  ...props 
}) {
  const displayText = children || getDisplayText(item, 'Unknown');
  const clickValue = getClickValue(item, item);
  const keyValue = getReactKey(item, index);
  
  // Check if this class is currently active
  const isActive = showActiveState && isClassActive(clickValue, breakpointPrefix, tokenValues);
  
  // Build dynamic className
  const buttonClassName = isActive 
    ? `${className} ${activeClassName} ${hoverActiveClassName}`
    : className;

  const handleClick = () => {
    if (onClick) {
      onClick(clickValue, item, index, isActive);
    }
  };

  return (
    <button
      key={keyValue}
      onClick={handleClick}
      className={buttonClassName}
      title={isActive ? `Remove ${clickValue}` : `Add ${clickValue}`}
      {...props}
    >
      <div className="flex items-center justify-between w-full">
        <span>{displayText}</span>
        {isActive && showActiveState && (
          <span className="ml-2 text-xs opacity-70">✓</span>
        )}
      </div>
    </button>
  );
}