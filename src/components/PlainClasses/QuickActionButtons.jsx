import React from 'react';
import { QUICK_ACTIONS } from '../../utils/PlainClasses/constants.js';

/**
 * Quick action buttons for opening different panels
 */
export function QuickActionButtons({ activeQuickPanel, onQuickPanelClick }) {
  return (
    <div className="mt-4">
      <div className="text-xs text-gray-500 mb-2">Quick Actions:</div>
      <div className="flex flex-wrap gap-2 mb-3">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.id}
            onClick={() => onQuickPanelClick(action.id)}
            className={`px-3 py-2 text-sm rounded-md border transition-all duration-200 flex items-center gap-2 ${
              activeQuickPanel === action.id
                ? 'bg-blue-100 border-blue-300 text-blue-700'
                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span>{action.icon}</span>
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}