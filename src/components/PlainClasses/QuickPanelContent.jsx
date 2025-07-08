import React from 'react';
import { BreadcrumbNavigation } from './BreadcrumbNavigation.jsx';
import { ColorPanel } from './ColorPanel.jsx';
import { ControlPanel } from './ControlPanel.jsx';

/**
 * Main quick panel content that routes to appropriate panels
 */
export function QuickPanelContent({
  activeQuickPanel,
  panelStep,
  selectedCategory,
  selectedItem,
  selectedUsage,
  categoryItems,
  itemOptions,
  onNavigateToStep,
  onCategorySelect,
  onItemSelect,
  onUsageSelect,
  onAddClass,
  onToggleClass,
  tokenValues = [],
  breakpointPrefix = ''
}) {

  if (!activeQuickPanel) {
    return null;
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
      {/* Breadcrumb Navigation */}
      <BreadcrumbNavigation
        activeQuickPanel={activeQuickPanel}
        selectedCategory={selectedCategory}
        selectedItem={selectedItem}
        selectedUsage={selectedUsage}
        onNavigateToStep={onNavigateToStep}
      />

      {/* Panel Content */}
      {activeQuickPanel === 'colors' && (
        <ColorPanel
          panelStep={panelStep}
          categoryItems={categoryItems}
          itemOptions={itemOptions}
          onCategorySelect={onCategorySelect}
          onItemSelect={onItemSelect}
          onUsageSelect={onUsageSelect}
          onAddClass={onAddClass}
          onToggleClass={onToggleClass}
          tokenValues={tokenValues}
          breakpointPrefix={breakpointPrefix}
        />
      )}

      {(activeQuickPanel === 'layout' || activeQuickPanel === 'spacing' || activeQuickPanel === 'typography' || activeQuickPanel === 'border' || activeQuickPanel === 'shadow') && (
        <ControlPanel
          panelType={activeQuickPanel}
          panelStep={panelStep}
          categoryItems={categoryItems}
          itemOptions={itemOptions}
          selectedCategory={selectedCategory}
          selectedItem={selectedItem}
          onCategorySelect={onCategorySelect}
          onItemSelect={onItemSelect}
          onAddClass={onAddClass}
          onToggleClass={onToggleClass}
          tokenValues={tokenValues}
          breakpointPrefix={breakpointPrefix}
        />
      )}
      
      {/* Other panels coming soon */}
      {!['colors', 'layout', 'spacing', 'typography', 'border', 'shadow'].includes(activeQuickPanel) && (
        <div className="text-sm text-gray-500">
          {activeQuickPanel.charAt(0).toUpperCase() + activeQuickPanel.slice(1)} panel coming soon...
        </div>
      )}
    </div>
  );
}