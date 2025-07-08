import React, { useState, useEffect, useRef } from 'react';
import { useBlockStore } from '../../storage/store.js';
import { BreakpointSelector } from './BreakpointSelector.jsx';
import { TokenInputSection } from './TokenInputSection.jsx';
import { QuickActionButtons } from './QuickActionButtons.jsx';
import { QuickPanelContent } from './QuickPanelContent.jsx';
import { useAutocomplete } from '../../hooks/useAutocomplete.js';
import { useColorData } from '../../hooks/useColorData.js';
import { useLayoutData } from '../../hooks/useLayoutData.js';
import { useQuickPanel } from '../../hooks/useQuickPanel.js';
import { 
  getCurrentClasses, 
  addClassWithBreakpoint, 
  classArrayToString,
  toggleClass
} from '../../utils/PlainClasses/classHelpers.js';
import AceEditor from 'react-ace';

// Import Ace Editor modes and themes
import 'ace-builds/src-noconflict/mode-html';
import 'ace-builds/src-noconflict/theme-one_dark';
import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/ext-emmet';

// Initialize Emmet for Ace Editor
import ace from 'ace-builds/src-noconflict/ace';
ace.require("ace/ext/emmet");

/**
 * Refactored PlainClasses component with improved structure
 */
export function PlainClasses() {
  const { lastSelectedBlock, updateBlock } = useBlockStore();
  const [tokenValues, setTokenValues] = useState([]);
  const [selectedBreakpoint, setSelectedBreakpoint] = useState('');
  const autocompleteRef = useRef(null);

  // Custom hooks
  const {
    autocompleteResults,
    showAutocomplete,
    getAutocompleteForPattern,
    handleAutocomplete,
    hideAutocomplete
  } = useAutocomplete();

  const {
    getColorBases,
    getColorShades,
    getColorUsageCategories,
    getColorTransparencyOptions
  } = useColorData(getAutocompleteForPattern);

  const {
    getLayoutCategories,
    getSpacingCategories,
    getTypographyCategories,
    getBorderCategories,
    getShadowCategories,
    getSubcategories,
    getLayoutItems
  } = useLayoutData(getAutocompleteForPattern);

  const {
    activeQuickPanel,
    panelStep,
    selectedCategory,
    categoryItems,
    selectedItem,
    itemOptions,
    selectedUsage,
    handleQuickPanelClick,
    handleCategorySelect,
    handleItemSelect,
    handleUsageSelect,
    navigateToStep,
    getItemDisplayText
  } = useQuickPanel();

  // Sort classes using windpress class sorter
  const sortClasses = (classes) => {
    if (!Array.isArray(classes)) {
      console.warn('❌ sortClasses received non-array:', classes);
      return [];
    }
    
    if (window.windpress?.module?.classSorter?.sort) {
      try {
        // Convert array to string for windpress, then back to array
        const classString = classes.join(' ');
        const sortedResult = window.windpress.module.classSorter.sort(classString);
        
        // Handle different return types from windpress
        let sortedClasses;
        if (typeof sortedResult === 'string') {
          sortedClasses = sortedResult.split(' ').filter(Boolean);
        } else if (Array.isArray(sortedResult)) {
          sortedClasses = sortedResult;
        } else {
          console.warn('❌ Windpress returned unexpected type:', typeof sortedResult, sortedResult);
          sortedClasses = classes;
        }
        
        console.log('✅ Classes sorted using windpress:', sortedClasses);
        return sortedClasses;
      } catch (error) {
        console.warn('❌ Error sorting classes with windpress:', error);
        return classes;
      }
    }
    return classes;
  };

  // Handle manual sort button click
  const handleSortClasses = () => {
    const sortedTokens = sortClasses([...tokenValues]);
    setTokenValues(sortedTokens);
    
    // Apply sorted classes
    const classString = classArrayToString(sortedTokens);
    applyClasses(classString);
  };

  // Update token values when block selection changes (with automatic sorting)
  useEffect(() => {
    const currentClasses = getCurrentClasses(lastSelectedBlock?.attributes);
    const sortedClasses = sortClasses(currentClasses);
    setTokenValues(sortedClasses);
  }, [lastSelectedBlock]);

  // Handle token values change
  const handleTokenValuesChange = (newTokenValues) => {
    setTokenValues(newTokenValues);
    
    // Apply classes in real-time
    const classString = classArrayToString(newTokenValues);
    applyClasses(classString);
  };

  // Add class with breakpoint prefix
  const handleAddClassWithBreakpoint = (className) => {
    const newTokens = addClassWithBreakpoint(className, selectedBreakpoint, tokenValues);
    setTokenValues(newTokens);
    applyClasses(classArrayToString(newTokens));
  };

  // Toggle class with breakpoint prefix
  const handleToggleClassWithBreakpoint = (className) => {
    const newTokens = toggleClass(className, selectedBreakpoint, tokenValues);
    setTokenValues(newTokens);
    applyClasses(classArrayToString(newTokens));
  };

  // Handle autocomplete selection
  const handleAutocompleteSelect = (className) => {
    handleAddClassWithBreakpoint(className);
    hideAutocomplete();
  };

  // Apply classes to the selected block (real-time)
  const applyClasses = (classString) => {
    if (!lastSelectedBlock) return;

    const trimmedClasses = classString.trim();
    
    // Update the block with new classes
    const updatedMarkup = {
      ...lastSelectedBlock.markup,
      attributes: {
        ...lastSelectedBlock.attributes,
        className: trimmedClasses
      }
    };

    updateBlock(lastSelectedBlock, updatedMarkup);
    
    // Also try to update the actual Gutenberg block if possible
    if (window.wp?.data && lastSelectedBlock.id) {
      try {
        const { dispatch } = window.wp.data;
        dispatch('core/block-editor').updateBlockAttributes(lastSelectedBlock.id, {
          className: trimmedClasses
        });
      } catch (error) {
        console.warn('Could not update Gutenberg block:', error);
      }
    }
  };

  // Load step one data for panels
  const loadStepOneData = async (panelId) => {
    if (panelId === 'colors') {
      return await getColorBases();
    } else if (panelId === 'layout') {
      return getLayoutCategories();
    } else if (panelId === 'spacing') {
      return getSpacingCategories();
    } else if (panelId === 'typography') {
      return getTypographyCategories();
    } else if (panelId === 'border') {
      return getBorderCategories();
    } else if (panelId === 'shadow') {
      return getShadowCategories();
    }
    return [];
  };

  // Load step two data for panels
  const loadStepTwoData = async (panelType, category) => {
    if (panelType === 'colors') {
      return await getColorShades(category);
    } else if (['layout', 'spacing', 'typography', 'border', 'shadow'].includes(panelType)) {
      const subcategories = getSubcategories(category, panelType);
      return Object.keys(subcategories);
    }
    return [];
  };

  // Load step three data for panels
  const loadStepThreeData = async (panelType, category, item) => {
    if (panelType === 'colors') {
      // For colors, item is now a shade object with {shade, color, value}
      const shadeValue = typeof item === 'object' ? item.shade : item;
      return await getColorUsageCategories(category, shadeValue);
    } else if (['layout', 'spacing', 'typography', 'border', 'shadow'].includes(panelType)) {
      // Get the search term for this subcategory
      const subcategories = getSubcategories(category, panelType);
      const searchTerm = subcategories[item];
      return await getLayoutItems(searchTerm);
    }
    return [];
  };

  // Load step four data (colors only)
  const loadStepFourData = async (category, item, usage) => {
    const shadeValue = typeof item === 'object' ? item.shade : item;
    return getColorTransparencyOptions(category, shadeValue, usage);
  };

  // Enhanced panel click handler
  const handleQuickPanelClickEnhanced = async (panelId) => {
    await handleQuickPanelClick(panelId, loadStepOneData);
  };

  // Enhanced category select handler
  const handleCategorySelectEnhanced = async (category) => {
    await handleCategorySelect(category, loadStepTwoData);
  };

  // Enhanced item select handler
  const handleItemSelectEnhanced = async (item) => {
    await handleItemSelect(item, loadStepThreeData);
  };

  // Enhanced usage select handler
  const handleUsageSelectEnhanced = async (usage) => {
    await handleUsageSelect(usage, loadStepFourData);
  };

  if (!lastSelectedBlock) {
    return <BlockInserterInterface />;
  }

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            CSS Classes
          </label>
          <button
            onClick={handleSortClasses}
            className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-700 border border-gray-300 rounded hover:bg-gray-200 transition-colors"
            title="Sort CSS classes using windpress class sorter"
          >
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
            Sort
          </button>
        </div>
        
        {/* Breakpoint Selector */}
        <BreakpointSelector
          selectedBreakpoint={selectedBreakpoint}
          onBreakpointChange={setSelectedBreakpoint}
        />
        
        {/* Token Input Section */}
        <TokenInputSection
          tokenValues={tokenValues}
          onTokenValuesChange={handleTokenValuesChange}
          selectedBreakpoint={selectedBreakpoint}
          autocompleteResults={autocompleteResults}
          showAutocomplete={showAutocomplete}
          onInputValueChange={handleAutocomplete}
          onAutocompleteSelect={handleAutocompleteSelect}
          onAutocompleteHide={hideAutocomplete}
          autocompleteRef={autocompleteRef}
        />
        
        <div className="text-xs text-gray-500">
          Type CSS classes and press space or enter to create tokens. Classes update in real-time.
        </div>
        
        {/* Quick Actions */}
        <QuickActionButtons
          activeQuickPanel={activeQuickPanel}
          onQuickPanelClick={handleQuickPanelClickEnhanced}
        />
        
        {/* Quick Panel Content */}
        <QuickPanelContent
          activeQuickPanel={activeQuickPanel}
          panelStep={panelStep}
          selectedCategory={selectedCategory}
          selectedItem={selectedItem}
          selectedUsage={selectedUsage}
          categoryItems={categoryItems}
          itemOptions={itemOptions}
          onNavigateToStep={navigateToStep}
          onCategorySelect={handleCategorySelectEnhanced}
          onItemSelect={handleItemSelectEnhanced}
          onUsageSelect={handleUsageSelectEnhanced}
          onAddClass={handleAddClassWithBreakpoint}
          onToggleClass={handleToggleClassWithBreakpoint}
          tokenValues={tokenValues}
          breakpointPrefix={selectedBreakpoint}
        />
      </div>
    </div>
  );
}

/**
 * Block Inserter Interface - Shown when no block is selected
 * Allows users to write HTML and convert it to blocks
 */
function BlockInserterInterface() {
  const [htmlContent, setHtmlContent] = useState('<div class="p-4 bg-gray-100 rounded-lg">\n  <h2 class="text-xl font-bold mb-2">Hello World</h2>\n  <p class="text-gray-600">Your content here...</p>\n</div>');
  const [isConverting, setIsConverting] = useState(false);
  const [conversionError, setConversionError] = useState('');
  const [showLargeEditor, setShowLargeEditor] = useState(false);

  const convertAndInsertBlock = async () => {
    if (!htmlContent.trim()) {
      setConversionError('Please enter HTML content to convert');
      return;
    }

    setIsConverting(true);
    setConversionError('');
    console.log('🔄 Converting HTML to blocks and inserting...');

    try {
      // Convert HTML to block markup using Umbral AI API (greenshift provider)
      const response = await fetch('https://blocks.umbral.ai/api/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html: htmlContent,
          provider: 'greenshift',
          options: {
            preserveClasses: true,
            preserveIds: true,
            generateUniqueIds: false
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }

      const blockMarkup = await response.text();
      console.log('✅ Block conversion successful:', blockMarkup.length, 'chars');

      // Insert the block using WordPress API
      if (window.wp?.data && window.wp?.blocks) {
        const { dispatch, select } = window.wp.data;
        const { insertBlocks } = dispatch('core/block-editor');
        const { getBlockInsertionPoint } = select('core/block-editor');

        // Parse the block markup
        const blocks = window.wp.blocks.parse(blockMarkup);
        
        if (blocks && blocks.length > 0) {
          // Get insertion point (at the end)
          const insertionPoint = getBlockInsertionPoint();
          
          // Insert the blocks
          insertBlocks(blocks, insertionPoint.index, insertionPoint.rootClientId);
          console.log('✅ Blocks inserted successfully');

          // Select the first inserted block after a short delay
          setTimeout(() => {
            if (blocks[0]?.clientId) {
              dispatch('core/block-editor').selectBlock(blocks[0].clientId);
              console.log('✅ Block selected:', blocks[0].clientId);
            }
          }, 100);

          // Clear the HTML content for next use
          setHtmlContent('<div class="p-4 bg-gray-100 rounded-lg">\n  <h2 class="text-xl font-bold mb-2">Hello World</h2>\n  <p class="text-gray-600">Your content here...</p>\n</div>');
        } else {
          throw new Error('No valid blocks were generated from the HTML');
        }
      } else {
        throw new Error('WordPress block editor API not available');
      }

    } catch (error) {
      console.error('❌ Error converting and inserting block:', error);
      setConversionError(`Failed to convert and insert: ${error.message}`);
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-foreground">Create New Block</h3>
          <div className="flex items-center gap-2">
            <div className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-md">
              {htmlContent ? htmlContent.length : 0} chars
            </div>
            <button
              onClick={() => setShowLargeEditor(true)}
              className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
              title="Expand Editor"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Write HTML below and convert it to a WordPress block
        </p>
      </div>

      {/* Error Display */}
      {conversionError && (
        <div className="m-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <div className="text-sm text-destructive">{conversionError}</div>
        </div>
      )}

      {/* HTML Editor */}
      <div className="flex-1 bg-gray-900 min-h-0">
        <AceEditor
          mode="html"
          theme="one_dark"
          value={htmlContent}
          onChange={setHtmlContent}
          name="html-block-inserter"
          editorProps={{ $blockScrolling: true }}
          width="100%"
          height="100%"
          fontSize={14}
          showPrintMargin={false}
          showGutter={true}
          highlightActiveLine={true}
          onLoad={(editor) => {
            editor.setOption("enableEmmet", true);
            console.log("✅ Emmet enabled for small HTML editor");
          }}
          setOptions={{
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            enableSnippets: true,
            showLineNumbers: true,
            tabSize: 2,
            useWorker: false
          }}
        />
      </div>

      {/* Action Button */}
      <div className="p-4 border-t border-border">
        <button
          onClick={convertAndInsertBlock}
          disabled={isConverting || !htmlContent.trim()}
          className="w-full px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors flex items-center justify-center gap-2"
        >
          {isConverting ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Converting & Inserting...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Convert & Insert Block
            </>
          )}
        </button>
      </div>

      {/* Large Editor - Fixed Left Panel */}
      {showLargeEditor && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowLargeEditor(false)}
          />
          
          {/* Fixed Left Panel */}
          <div className={`fixed top-0 left-0 h-screen w-[800px] bg-background border-r border-border shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-out ${
            showLargeEditor ? 'translate-x-0' : '-translate-x-full'
          }`}>
            {/* Panel Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <h2 className="text-lg font-semibold text-foreground">HTML Block Creator</h2>
                <div className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-md">
                  {htmlContent ? htmlContent.length : 0} chars
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={convertAndInsertBlock}
                  disabled={isConverting || !htmlContent.trim()}
                  className="inline-flex items-center justify-center px-3 py-1.5 text-sm bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors gap-2"
                >
                  {isConverting ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Converting...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Convert & Insert
                    </>
                  )}
                </button>
                
                <button 
                  onClick={() => setShowLargeEditor(false)}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Error Display in Panel */}
            {conversionError && (
              <div className="m-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <div className="text-sm text-destructive">{conversionError}</div>
              </div>
            )}
            
            {/* Editor Content */}
            <div className="flex-1 bg-gray-900">
              <AceEditor
                mode="html"
                theme="one_dark"
                value={htmlContent}
                onChange={setHtmlContent}
                name="html-block-inserter-large"
                editorProps={{ $blockScrolling: true }}
                width="100%"
                height="100%"
                fontSize={16}
                showPrintMargin={false}
                showGutter={true}
                highlightActiveLine={true}
                onLoad={(editor) => {
                  editor.setOption("enableEmmet", true);
                  console.log("✅ Emmet enabled for large HTML editor");
                }}
                setOptions={{
                  enableBasicAutocompletion: true,
                  enableLiveAutocompletion: true,
                  enableSnippets: true,
                  showLineNumbers: true,
                  tabSize: 2,
                  useWorker: false
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}