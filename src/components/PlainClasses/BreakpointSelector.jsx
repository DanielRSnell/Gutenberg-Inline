import React from 'react';
import { BREAKPOINTS } from '../../utils/PlainClasses/constants.js';

/**
 * Breakpoint selector component for responsive CSS classes
 */
export function BreakpointSelector({ selectedBreakpoint, onBreakpointChange }) {
  return (
    <div className="flex flex-wrap gap-1 mb-3">
      <span className="text-xs text-gray-500 mr-2 self-center">Breakpoint:</span>
      {BREAKPOINTS.map((breakpoint) => (
        <button
          key={breakpoint.value}
          onClick={() => onBreakpointChange(breakpoint.value)}
          className={`px-2 py-1 text-xs rounded border transition-all duration-200 ${
            selectedBreakpoint === breakpoint.value
              ? 'bg-blue-100 border-blue-300 text-blue-700'
              : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
          title={breakpoint.description}
        >
          {breakpoint.label}
        </button>
      ))}
    </div>
  );
}