import React, { useState, useEffect } from 'react';
import { useBlockStore } from '../storage/store';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tooltip from '@radix-ui/react-tooltip';
import * as Collapsible from '@radix-ui/react-collapsible';
import AceEditor from 'react-ace';

// Import Ace Editor modes and themes
import 'ace-builds/src-noconflict/mode-html';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/theme-one_dark';
import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/ext-emmet';

// Initialize Emmet for Ace Editor
import ace from 'ace-builds/src-noconflict/ace';
ace.require("ace/ext/emmet");

/**
 * Block Metadata Manager Component
 * Focuses on managing block metadata, primarily the block name
 * Also handles HTML-to-block conversion via Umbral AI API
 */
export function BlockMetadataManager() {
  const { lastSelectedBlock, updateBlock } = useBlockStore();
  const [blockName, setBlockName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');
  const [generatedBlockMarkup, setGeneratedBlockMarkup] = useState('');
  const [originalBlockMarkup, setOriginalBlockMarkup] = useState('');
  const [isLoadingHtml, setIsLoadingHtml] = useState(false);
  const [isLoadingConversion, setIsLoadingConversion] = useState(false);
  const [showGeneratedAccordion, setShowGeneratedAccordion] = useState(false);
  const [showOriginalAccordion, setShowOriginalAccordion] = useState(false);
  const [showLargeEditor, setShowLargeEditor] = useState(false);
  const [apiError, setApiError] = useState('');
  const [conversionProvider, setConversionProvider] = useState('greenshift');
  const [showSettings, setShowSettings] = useState(false);

  // Debug state changes
  useEffect(() => {
    console.log('🎛️ originalBlockMarkup state changed:', originalBlockMarkup ? originalBlockMarkup.length : 0, 'chars');
    console.log('🎛️ showOriginalAccordion state:', showOriginalAccordion);
  }, [originalBlockMarkup, showOriginalAccordion]);

  // Extract metadata from block and load HTML
  useEffect(() => {
    if (lastSelectedBlock?.attributes?.metadata?.name) {
      setBlockName(lastSelectedBlock.attributes.metadata.name);
    } else {
      setBlockName('');
    }
    setIsEditing(false);
    
    // Load original markup when block is selected
    if (lastSelectedBlock) {
      // Console log the entire block object for inspection
      console.log('🔍 Selected Block Object (COMPLETE):', lastSelectedBlock);
      console.log('🔍 Block Type:', lastSelectedBlock.type);
      console.log('🔍 Block ID:', lastSelectedBlock.id);
      console.log('🔍 Block ClientID:', lastSelectedBlock.clientId);
      console.log('🔍 Block Attributes:', lastSelectedBlock.attributes);
      console.log('🔍 Block Data:', lastSelectedBlock.blockData);
      console.log('🔍 Block Markup:', lastSelectedBlock.markup);
      console.log('🔍 Block Content:', lastSelectedBlock.content);
      console.log('🔍 Block Inner Blocks:', lastSelectedBlock.innerBlocks);
      
      // Check WordPress APIs availability
      console.log('🔍 WordPress APIs Available:');
      console.log('  - window.wp:', !!window.wp);
      console.log('  - window.wp.data:', !!window.wp?.data);
      console.log('  - window.wp.blocks:', !!window.wp?.blocks);
      console.log('  - window.wp.blocks.serialize:', !!window.wp?.blocks?.serialize);
      console.log('  - core/block-editor selector:', !!window.wp?.data?.select('core/block-editor'));
      
      loadOriginalBlockMarkup();
      // Clear HTML content - user needs to click Convert to get HTML
      setHtmlContent('');
      setGeneratedBlockMarkup('');
      setApiError('');
    }
  }, [lastSelectedBlock]);

  // Also check for selected block when component mounts (tab becomes active)
  useEffect(() => {
    console.log('🎯 BlockMetadataManager component mounted/tab activated');
    
    // Get current selected block from WordPress when tab becomes active
    if (window.wp?.data) {
      try {
        const { select } = window.wp.data;
        const currentSelectedBlock = select('core/block-editor').getSelectedBlock();
        console.log('🎯 Current selected block on tab activation:', currentSelectedBlock);
        
        if (currentSelectedBlock) {
          // If we have a selected block but no lastSelectedBlock, or they're different
          if (!lastSelectedBlock || lastSelectedBlock.clientId !== currentSelectedBlock.clientId) {
            console.log('🎯 Found different selected block, loading markup...');
            loadOriginalBlockMarkupFromBlock(currentSelectedBlock);
            
            // Also update block name if available
            if (currentSelectedBlock.attributes?.metadata?.name) {
              setBlockName(currentSelectedBlock.attributes.metadata.name);
            } else {
              setBlockName('');
            }
          }
        } else {
          console.log('🎯 No block currently selected');
          setOriginalBlockMarkup('<!-- No block selected -->');
        }
      } catch (error) {
        console.error('❌ Error getting selected block on mount:', error);
      }
    }
  }, []); // Empty dependency array - runs only on mount

  // Convert block markup to HTML using Umbral AI API
  const convertBlockToHtml = async () => {
    if (!originalBlockMarkup) {
      console.log('❌ No originalBlockMarkup available for conversion');
      return;
    }
    
    setIsLoadingHtml(true);
    setApiError('');
    console.log('🔄 Converting block markup to HTML...');
    console.log('📤 Sending to API:', originalBlockMarkup.substring(0, 200) + '...');
    
    try {
      const blockMarkup = originalBlockMarkup;
      
      if (!blockMarkup || blockMarkup.includes('No block markup')) {
        setHtmlContent('<!-- No block markup available for conversion -->');
        setIsLoadingHtml(false);
        return;
      }
      
      // Call Umbral AI API to convert block markup to HTML
      const response = await fetch('https://blocks.umbral.ai/api/blocks-to-html', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blockMarkup: blockMarkup
        })
      });
      
      console.log('📡 API Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }
      
      const convertedHtml = await response.text();
      console.log('📥 API Response (HTML):', convertedHtml);
      
      setHtmlContent(convertedHtml);
      console.log('✅ HTML conversion successful:', convertedHtml.length, 'chars');
      console.log('📋 Converted HTML preview:', convertedHtml.substring(0, 200) + '...');
      
    } catch (error) {
      console.error('❌ Error converting block to HTML:', error);
      setApiError(`Failed to convert: ${error.message}`);
      setHtmlContent(`<!-- Error during conversion: ${error.message} -->`);
    } finally {
      setIsLoadingHtml(false);
    }
  };

  // Load original block markup from a specific block object
  const loadOriginalBlockMarkupFromBlock = (block) => {
    if (!block) {
      console.log('❌ No block provided to loadOriginalBlockMarkupFromBlock');
      setOriginalBlockMarkup('');
      return;
    }
    
    console.log('🔧 Loading markup from specific block:', block.clientId);
    
    try {
      let blockMarkup = '';
      let source = 'none';
      
      if (window.wp?.blocks?.serialize) {
        // Use WordPress serialize to get the actual markup
        blockMarkup = window.wp.blocks.serialize(block);
        source = 'wp-serialize';
        console.log('✅ Serialized block markup:', blockMarkup.length, 'chars');
        console.log('📋 Serialized markup preview:', blockMarkup.substring(0, 200) + '...');
      } else {
        // Fallback to JSON if serialize not available
        blockMarkup = JSON.stringify(block, null, 2);
        source = 'json-fallback';
        console.log('⚠️ wp.blocks.serialize not available, using JSON fallback');
      }
      
      console.log('📋 Markup source:', source);
      console.log('📋 Markup length:', blockMarkup.length);
      
      const finalMarkup = blockMarkup || '<!-- No block markup available -->';
      setOriginalBlockMarkup(finalMarkup);
      console.log('📋 Setting originalBlockMarkup to:', finalMarkup.length, 'chars');
      
      // Auto-expand accordion when markup is loaded
      if (finalMarkup && !finalMarkup.includes('No block markup available')) {
        setShowOriginalAccordion(true);
        console.log('📋 Auto-expanding Original Block Markup accordion');
        
        // Auto-convert to HTML
        setTimeout(() => {
          console.log('🚀 Auto-converting block markup to HTML...');
          convertBlockToHtml();
        }, 100); // Small delay to ensure state is set
      }
      
    } catch (error) {
      console.error('❌ Error loading block markup:', error);
      const errorMarkup = `<!-- Error loading block markup: ${error.message} -->`;
      setOriginalBlockMarkup(errorMarkup);
    }
  };

  // Load original block markup including inner blocks
  const loadOriginalBlockMarkup = () => {
    console.log('🔧 Loading original block markup...');
    
    // First try to get current selected block from WordPress
    if (window.wp?.data) {
      try {
        const { select } = window.wp.data;
        const selectedBlock = select('core/block-editor').getSelectedBlock();
        if (selectedBlock) {
          console.log('🔧 Using current selected block from WordPress');
          loadOriginalBlockMarkupFromBlock(selectedBlock);
          return;
        }
      } catch (error) {
        console.warn('❌ Could not get selected block from WordPress:', error);
      }
    }
    
    // Fallback to using lastSelectedBlock data
    if (!lastSelectedBlock) {
      console.log('❌ No lastSelectedBlock available');
      setOriginalBlockMarkup('<!-- No block selected -->');
      return;
    }
    
    console.log('🔧 Using lastSelectedBlock as fallback');
    
    try {
      // Try different sources for block content from lastSelectedBlock
      let blockMarkup = '';
      let source = 'none';
      
      if (lastSelectedBlock.blockData?.outerHTML) {
        blockMarkup = lastSelectedBlock.blockData.outerHTML;
        source = 'blockData.outerHTML';
        console.log('✅ Found markup in blockData.outerHTML:', blockMarkup.length, 'chars');
      } else if (lastSelectedBlock.markup?.content) {
        blockMarkup = lastSelectedBlock.markup.content;
        source = 'markup.content';
        console.log('✅ Found markup in markup.content:', blockMarkup.length, 'chars');
      } else if (lastSelectedBlock.content) {
        blockMarkup = lastSelectedBlock.content;
        source = 'content';
        console.log('✅ Found markup in content:', blockMarkup.length, 'chars');
      } else {
        // Create a representation from available data
        console.log('🔧 Creating fallback markup from lastSelectedBlock data');
        blockMarkup = JSON.stringify({
          type: lastSelectedBlock.type,
          id: lastSelectedBlock.id,
          clientId: lastSelectedBlock.clientId,
          attributes: lastSelectedBlock.attributes,
          innerBlocks: lastSelectedBlock.innerBlocks || [],
          blockData: lastSelectedBlock.blockData
        }, null, 2);
        source = 'fallback-json';
        console.log('✅ Generated fallback markup:', blockMarkup.length, 'chars');
      }
      
      console.log('📋 Final markup source:', source);
      const finalMarkup = blockMarkup || '<!-- No block markup available -->';
      setOriginalBlockMarkup(finalMarkup);
      console.log('📋 Setting originalBlockMarkup to:', finalMarkup.length, 'chars');
      
      // Auto-expand accordion when markup is loaded
      if (finalMarkup && !finalMarkup.includes('No block markup available')) {
        setShowOriginalAccordion(true);
        console.log('📋 Auto-expanding Original Block Markup accordion');
        
        // Auto-convert to HTML
        setTimeout(() => {
          console.log('🚀 Auto-converting block markup to HTML...');
          convertBlockToHtml();
        }, 100); // Small delay to ensure state is set
      }
      
    } catch (error) {
      console.error('❌ Error loading original block markup:', error);
      const errorMarkup = `<!-- Error loading block markup: ${error.message} -->`;
      setOriginalBlockMarkup(errorMarkup);
    }
  };

  // Convert HTML to block markup using Umbral AI API
  const convertHtmlToBlocks = async (htmlToConvert) => {
    if (!htmlToConvert.trim()) return;
    
    setIsLoadingConversion(true);
    setApiError('');
    console.log('🔄 Converting HTML to blocks...');
    console.log('📤 Sending HTML to API:', htmlToConvert.substring(0, 200) + '...');
    console.log('🎯 Using provider:', conversionProvider);
    
    try {
      const response = await fetch('https://blocks.umbral.ai/api/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html: htmlToConvert,
          provider: conversionProvider,
          options: {
            preserveClasses: true,
            preserveIds: true,
            generateUniqueIds: false
          }
        })
      });
      
      console.log('📡 API Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }
      
      const blockMarkup = await response.text();
      console.log('📥 API Response (Block Markup):', blockMarkup);
      
      setGeneratedBlockMarkup(blockMarkup);
      setShowGeneratedAccordion(true);
      console.log('✅ Block conversion successful:', blockMarkup.length, 'chars');
      
    } catch (error) {
      console.error('❌ Error converting HTML to blocks:', error);
      setApiError(`Failed to convert HTML: ${error.message}`);
      setGeneratedBlockMarkup('');
    } finally {
      setIsLoadingConversion(false);
    }
  };

  // Convert and update block in WordPress
  const convertAndUpdateBlock = async () => {
    if (!htmlContent.trim()) {
      setApiError('No HTML content to convert');
      return;
    }

    setIsLoadingConversion(true);
    setApiError('');
    console.log('🔄 Converting and updating block...');

    try {
      const response = await fetch('https://blocks.umbral.ai/api/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html: htmlContent,
          provider: conversionProvider,
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
      console.log('✅ Block converted, updating WordPress block...');

      // Use the blockAPI utility to swap the block
      if (blockMarkup && window.gbStyleSwapBlock) {
        const success = window.gbStyleSwapBlock(blockMarkup);
        if (success) {
          setGeneratedBlockMarkup(blockMarkup);
          setShowGeneratedAccordion(true);
          console.log('✅ WordPress block swapped successfully using blockAPI');
          
          // Unselect and reselect the block to fully refresh the editor data
          setTimeout(() => {
            if (window.wp?.data) {
              try {
                const { select, dispatch } = window.wp.data;
                const selectedBlock = select('core/block-editor').getSelectedBlock();
                
                if (selectedBlock) {
                  console.log('🔄 Unselecting and reselecting block for complete refresh...');
                  
                  // First, clear the selection
                  dispatch('core/block-editor').clearSelectedBlock();
                  
                  // Then reselect the block after a short delay
                  setTimeout(() => {
                    dispatch('core/block-editor').selectBlock(selectedBlock.clientId);
                    
                    // Finally refresh the block data
                    setTimeout(() => {
                      const refreshedBlock = select('core/block-editor').getSelectedBlock();
                      if (refreshedBlock) {
                        console.log('🔄 Loading refreshed block data...');
                        loadOriginalBlockMarkupFromBlock(refreshedBlock);
                      }
                    }, 50);
                  }, 50);
                }
              } catch (error) {
                console.warn('Could not refresh block data:', error);
              }
            }
          }, 100); // Small delay to ensure block update is processed
        } else {
          console.warn('⚠️ gbStyleSwapBlock failed, falling back to manual update');
          // Fallback to manual update
          updateBlockWithNewMarkup(blockMarkup);
          setGeneratedBlockMarkup(blockMarkup);
          setShowGeneratedAccordion(true);
        }
      } else if (blockMarkup) {
        console.warn('⚠️ gbStyleSwapBlock not available, using manual update');
        // Fallback to manual update
        updateBlockWithNewMarkup(blockMarkup);
        setGeneratedBlockMarkup(blockMarkup);
        setShowGeneratedAccordion(true);
      }

    } catch (error) {
      console.error('❌ Error converting and updating block:', error);
      setApiError(`Failed to convert and update: ${error.message}`);
    } finally {
      setIsLoadingConversion(false);
    }
  };

  // Update block with new markup
  const updateBlockWithNewMarkup = (newMarkup) => {
    if (!lastSelectedBlock) return;
    
    const updatedMarkup = {
      ...lastSelectedBlock.markup,
      content: newMarkup
    };
    
    updateBlock(lastSelectedBlock, updatedMarkup);
    updateGutenbergBlock({ content: newMarkup });
  };

  // Handle HTML content change
  const handleHtmlChange = (newHtml) => {
    setHtmlContent(newHtml);
    // Manual conversion via buttons only - no auto-conversion
  };

  // Update block name in metadata
  const updateBlockName = () => {
    if (!lastSelectedBlock) return;

    const updatedMetadata = {
      ...lastSelectedBlock.attributes?.metadata,
      name: blockName.trim() || 'Unnamed Block'
    };

    const updatedAttributes = {
      ...lastSelectedBlock.attributes,
      metadata: updatedMetadata
    };
    
    const updatedMarkup = {
      ...lastSelectedBlock.markup,
      attributes: updatedAttributes
    };

    updateBlock(lastSelectedBlock, updatedMarkup);
    updateGutenbergBlock(updatedAttributes);
    setIsEditing(false);
  };

  // Cancel editing
  const cancelEditing = () => {
    if (lastSelectedBlock?.attributes?.metadata?.name) {
      setBlockName(lastSelectedBlock.attributes.metadata.name);
    } else {
      setBlockName('');
    }
    setIsEditing(false);
  };

  // Update Gutenberg block
  const updateGutenbergBlock = (updatedAttributes) => {
    if (window.wp?.data && lastSelectedBlock?.id) {
      try {
        const { dispatch } = window.wp.data;
        dispatch('core/block-editor').updateBlockAttributes(lastSelectedBlock.id, updatedAttributes);
      } catch (error) {
        console.warn('Could not update Gutenberg block:', error);
      }
    }
  };

  // Get current block name or default
  const getCurrentBlockName = () => {
    return lastSelectedBlock?.attributes?.metadata?.name;
  };

  // Get block type display name
  const getBlockTypeDisplay = () => {
    if (!lastSelectedBlock?.type) return 'Unknown';
    
    // Convert block type to readable format
    const type = lastSelectedBlock.type;
    if (type.startsWith('core/')) {
      return type.replace('core/', '').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    return type;
  };

  // Generate automatic name suggestions
  const getNameSuggestions = () => {
    const blockType = getBlockTypeDisplay();
    const suggestions = [
      `${blockType} Section`,
      `Main ${blockType}`,
      `Hero ${blockType}`,
      `Feature ${blockType}`,
      `Call to Action`,
      `Content Block`
    ];
    
    const currentName = getCurrentBlockName();
    return suggestions.filter(suggestion => 
      suggestion.toLowerCase() !== (currentName || '').toLowerCase()
    ).slice(0, 4);
  };

  if (!lastSelectedBlock) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>No block selected</p>
        <p className="text-xs mt-1">Select a block to manage its metadata</p>
      </div>
    );
  }

  const nameSuggestions = getNameSuggestions();

  return (
    <Tooltip.Provider>
      <div className="flex flex-col h-full bg-background">
        {/* Header Section */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <h2 className="text-sm font-medium text-foreground">
                {getCurrentBlockName() || 'Unnamed'}
              </h2>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content className="bg-gray-900 text-white px-2 py-1 rounded text-xs shadow-md" sideOffset={5}>
                  Rename Block
                  <Tooltip.Arrow className="fill-gray-900" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>

            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  onClick={() => setShowSettings(true)}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content className="bg-gray-900 text-white px-2 py-1 rounded text-xs shadow-md" sideOffset={5}>
                  Settings
                  <Tooltip.Arrow className="fill-gray-900" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>

            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  onClick={() => setShowLargeEditor(true)}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content className="bg-gray-900 text-white px-2 py-1 rounded text-xs shadow-md" sideOffset={5}>
                  Expand Editor
                  <Tooltip.Arrow className="fill-gray-900" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>

            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  onClick={() => convertBlockToHtml()}
                  disabled={isLoadingHtml || !originalBlockMarkup}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingHtml ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  )}
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content className="bg-gray-900 text-white px-2 py-1 rounded text-xs shadow-md" sideOffset={5}>
                  Convert to HTML
                  <Tooltip.Arrow className="fill-gray-900" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>

            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  onClick={() => convertHtmlToBlocks(htmlContent)}
                  disabled={isLoadingConversion || !htmlContent.trim()}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingConversion ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  )}
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content className="bg-gray-900 text-white px-2 py-1 rounded text-xs shadow-md" sideOffset={5}>
                  Convert to Blocks
                  <Tooltip.Arrow className="fill-gray-900" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>

            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  onClick={() => convertAndUpdateBlock()}
                  disabled={isLoadingConversion || !htmlContent.trim()}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-input bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingConversion ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  )}
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content className="bg-gray-900 text-white px-2 py-1 rounded text-xs shadow-md" sideOffset={5}>
                  Convert & Update Block
                  <Tooltip.Arrow className="fill-gray-900" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </div>
        </div>

        {/* Block Name Editing */}
        {isEditing && (
          <div className="p-4 border-b border-border bg-muted/30">
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Block Name</label>
              <input
                type="text"
                value={blockName}
                onChange={(e) => setBlockName(e.target.value)}
                placeholder="Enter a descriptive name"
                className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={cancelEditing}
                  className="px-3 py-1.5 text-sm border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={updateBlockName}
                  className="px-3 py-1.5 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded-md"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* API Error */}
        {apiError && (
          <div className="m-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <div className="text-sm text-destructive">{apiError}</div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Original Block Markup Collapsible */}
          {lastSelectedBlock && (
            <Collapsible.Root open={showOriginalAccordion} onOpenChange={setShowOriginalAccordion}>
              <div className="border-b border-border">
                <Collapsible.Trigger className="flex items-center justify-between w-full p-4 text-left hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-foreground">Block Markup</div>
                    <div className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-md">
                      {originalBlockMarkup ? originalBlockMarkup.length : 0} chars
                    </div>
                    <div className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md">
                      Read-only
                    </div>
                  </div>
                  <svg 
                    className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${showOriginalAccordion ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Collapsible.Trigger>
                <Collapsible.Content>
                  <div className="pb-4">
                    <div className="bg-gray-900 border border-gray-700 rounded-md overflow-hidden">
                      <AceEditor
                        mode="javascript"
                        theme="one_dark"
                        value={originalBlockMarkup || '<!-- Loading block markup... -->'}
                        name="block-markup-readonly"
                        editorProps={{ $blockScrolling: true }}
                        width="100%"
                        height="200px"
                        fontSize={12}
                        showPrintMargin={false}
                        showGutter={true}
                        highlightActiveLine={false}
                        readOnly={true}
                        setOptions={{
                          showLineNumbers: true,
                          tabSize: 2,
                          useWorker: false,
                          highlightActiveLine: false,
                          highlightGutterLine: false
                        }}
                      />
                    </div>
                  </div>
                </Collapsible.Content>
              </div>
            </Collapsible.Root>
          )}

          {/* HTML Editor */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* HTML Editor Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="text-sm font-medium text-foreground">HTML Editor</div>
                <div className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-md">
                  {htmlContent ? htmlContent.length : 0} chars
                </div>
              </div>
              
              {/* HTML Editor Actions */}
              <div className="flex items-center gap-1">
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <button
                      onClick={() => setShowLargeEditor(true)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content className="bg-gray-900 text-white px-2 py-1 rounded text-xs shadow-md" sideOffset={5}>
                      Expand Editor
                      <Tooltip.Arrow className="fill-gray-900" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>

                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <button
                      onClick={() => convertHtmlToBlocks(htmlContent)}
                      disabled={isLoadingConversion || !htmlContent.trim()}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoadingConversion ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                      )}
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content className="bg-gray-900 text-white px-2 py-1 rounded text-xs shadow-md" sideOffset={5}>
                      Convert to Blocks
                      <Tooltip.Arrow className="fill-gray-900" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>

                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <button
                      onClick={() => convertAndUpdateBlock()}
                      disabled={isLoadingConversion || !htmlContent.trim()}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-input bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoadingConversion ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                      )}
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content className="bg-gray-900 text-white px-2 py-1 rounded text-xs shadow-md" sideOffset={5}>
                      Convert & Update Block
                      <Tooltip.Arrow className="fill-gray-900" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </div>
            </div>
            
            <div className="flex-1 bg-gray-900">
              <AceEditor
                mode="html"
                theme="one_dark"
                value={htmlContent || '<!-- HTML will appear here after conversion -->'}
                onChange={handleHtmlChange}
                name="html-editor"
                editorProps={{ $blockScrolling: true }}
                width="100%"
                height="100%"
                fontSize={14}
                showPrintMargin={false}
                showGutter={true}
                highlightActiveLine={true}
                onLoad={(editor) => {
                  editor.setOption("enableEmmet", true);
                  console.log("✅ Emmet enabled for BlockMetadataManager HTML editor");
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

          {/* Generated Block Markup Collapsible */}
          {generatedBlockMarkup && (
            <Collapsible.Root open={showGeneratedAccordion} onOpenChange={setShowGeneratedAccordion}>
              <div className="border-t border-border">
                <Collapsible.Trigger className="flex items-center justify-between w-full p-4 text-left hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-foreground">Generated Markup</div>
                    <div className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
                      {generatedBlockMarkup.length} chars
                    </div>
                    <div className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
                      From HTML
                    </div>
                  </div>
                  <svg 
                    className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${showGeneratedAccordion ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Collapsible.Trigger>
                <Collapsible.Content>
                  <div className="px-4 pb-4">
                    <div className="bg-gray-900 border border-gray-700 rounded-md overflow-hidden">
                      <AceEditor
                        mode="javascript"
                        theme="one_dark"
                        value={generatedBlockMarkup}
                        name="generated-markup-readonly"
                        editorProps={{ $blockScrolling: true }}
                        width="100%"
                        height="200px"
                        fontSize={12}
                        showPrintMargin={false}
                        showGutter={true}
                        highlightActiveLine={false}
                        readOnly={true}
                        setOptions={{
                          showLineNumbers: true,
                          tabSize: 2,
                          useWorker: false,
                          highlightActiveLine: false,
                          highlightGutterLine: false
                        }}
                      />
                    </div>
                  </div>
                </Collapsible.Content>
              </div>
            </Collapsible.Root>
          )}
        </div>

        {/* Settings Dialog */}
        <Dialog.Root open={showSettings} onOpenChange={setShowSettings}>
          <Dialog.Portal>
            <Dialog.Overlay className="bg-black/50 fixed inset-0 z-50" />
            <Dialog.Content className="fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-background border border-border shadow-lg z-50">
              <div className="p-6">
                <Dialog.Title className="text-lg font-semibold text-foreground mb-4">
                  Conversion Settings
                </Dialog.Title>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Block Provider
                    </label>
                    <p className="text-xs text-muted-foreground mb-3">
                      Choose which block library to use when converting HTML to WordPress blocks
                    </p>
                    
                    <div className="space-y-2">
                      {[
                        { value: 'greenshift', label: 'Greenshift', description: 'Advanced block library with custom styling' },
                        { value: 'gutenberg', label: 'Gutenberg Core', description: 'WordPress native blocks' },
                        { value: 'generateblocks', label: 'GenerateBlocks', description: 'Lightweight, flexible blocks' },
                        { value: 'generate-pro', label: 'GenerateBlocks Pro', description: 'Premium block features' }
                      ].map((provider) => (
                        <label
                          key={provider.value}
                          className="flex items-start gap-3 p-3 border border-input rounded-md hover:bg-accent/50 cursor-pointer transition-colors"
                        >
                          <input
                            type="radio"
                            name="provider"
                            value={provider.value}
                            checked={conversionProvider === provider.value}
                            onChange={(e) => setConversionProvider(e.target.value)}
                            className="mt-1"
                          />
                          <div>
                            <div className="text-sm font-medium text-foreground">
                              {provider.label}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {provider.description}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-border">
                    <div className="text-xs text-muted-foreground">
                      <strong>Current provider:</strong> {conversionProvider}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-6">
                  <Dialog.Close asChild>
                    <button className="px-4 py-2 text-sm border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md">
                      Cancel
                    </button>
                  </Dialog.Close>
                  <Dialog.Close asChild>
                    <button className="px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded-md">
                      Save Settings
                    </button>
                  </Dialog.Close>
                </div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

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
                  <h2 className="text-lg font-semibold text-foreground">HTML Editor</h2>
                  <div className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-md">
                    {htmlContent ? htmlContent.length : 0} chars
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <button
                        onClick={() => convertBlockToHtml()}
                        disabled={isLoadingHtml || !originalBlockMarkup}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoadingHtml ? (
                          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                        )}
                      </button>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content className="bg-gray-900 text-white px-2 py-1 rounded text-xs shadow-md" sideOffset={5}>
                        Convert to HTML
                        <Tooltip.Arrow className="fill-gray-900" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>

                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <button
                        onClick={() => convertHtmlToBlocks(htmlContent)}
                        disabled={isLoadingConversion || !htmlContent.trim()}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoadingConversion ? (
                          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                        )}
                      </button>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content className="bg-gray-900 text-white px-2 py-1 rounded text-xs shadow-md" sideOffset={5}>
                        Convert to Blocks
                        <Tooltip.Arrow className="fill-gray-900" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>

                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <button
                        onClick={() => convertAndUpdateBlock()}
                        disabled={isLoadingConversion || !htmlContent.trim()}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-input bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoadingConversion ? (
                          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                        )}
                      </button>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content className="bg-gray-900 text-white px-2 py-1 rounded text-xs shadow-md" sideOffset={5}>
                        Convert & Update Block
                        <Tooltip.Arrow className="fill-gray-900" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                  
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
              
              {/* Editor Content */}
              <div className="flex-1 bg-gray-900">
                <AceEditor
                  mode="html"
                  theme="one_dark"
                  value={htmlContent || '<!-- HTML will appear here after conversion -->'}
                  onChange={handleHtmlChange}
                  name="html-editor-large"
                  editorProps={{ $blockScrolling: true }}
                  width="100%"
                  height="100%"
                  fontSize={16}
                  showPrintMargin={false}
                  showGutter={true}
                  highlightActiveLine={true}
                  onLoad={(editor) => {
                    editor.setOption("enableEmmet", true);
                    console.log("✅ Emmet enabled for BlockMetadataManager large HTML editor");
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
    </Tooltip.Provider>
  );
}