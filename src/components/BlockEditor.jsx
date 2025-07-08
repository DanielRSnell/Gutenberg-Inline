import React, { useState } from 'react';
import { PlainClasses } from './PlainClasses';
import { DynamicAttributesManager } from './DynamicAttributesManager';
import { BlockMarkup } from './BlockMarkup';
import { useBlockStore } from '../storage/store';

export function BlockEditor() {
  const [activeTab, setActiveTab] = useState('classes');
  const { lastSelectedBlock } = useBlockStore();

  const tabs = [
    { id: 'classes', label: 'Plain Classes', component: PlainClasses },
    { id: 'attributes', label: 'Attributes', component: DynamicAttributesManager },
    { id: 'markup', label: 'Markup', component: BlockMarkup }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="flex flex-col h-full">
      {/* Tab Navigation - Only show when block is selected */}
      {lastSelectedBlock && (
        <div id="gbi-view-tabs" className="flex border-b border-gray-200 bg-gray-50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
}