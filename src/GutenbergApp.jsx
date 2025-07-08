import React, { useEffect } from 'react';
import { GutenbergLayout } from './components/GutenbergLayout';
import { useBlockStore } from './storage/store';

export function GutenbergApp(props = {}) {
  // Extract props using kebab-case names (as passed by r2wc)
  const {
    'user-role': userRole = 'guest',
    'site-url': siteUrl = window.location.origin,
    'user-id': userId = 0,
    'settings': settings = {},
    'api-nonce': apiNonce = '',
    'plugin-version': pluginVersion = '1.0.0',
    'is-admin': isAdmin = false,
    'theme': theme = 'dark',
    'tailwind-css': tailwindCSS = ''
  } = props;

  // Decode the base64 CSS content (same as ShadowApp)
  const decodedCSS = tailwindCSS ? atob(tailwindCSS) : '';

  // Initialize block store and window.block API
  useEffect(() => {
    // Ensure window.block API is available
    if (typeof window !== 'undefined' && !window.block) {
      window.block = {
        // Get current selected block
        getSelected: () => useBlockStore.getState().lastSelectedBlock,
        
        // Clear selection
        clearSelection: () => useBlockStore.getState().clearSelection(),
        
        // Add a new block
        add: (blockMarkup) => useBlockStore.getState().addBlock(blockMarkup),
        
        // Remove a block
        remove: (blockMarkup) => useBlockStore.getState().removeBlock(blockMarkup),
        
        // Update a block
        update: (currentBlock, blockMarkup) => useBlockStore.getState().updateBlock(currentBlock, blockMarkup),
        
        // Swap/replace current block with new markup
        swap: (currentBlock, blockMarkup) => useBlockStore.getState().swapBlock(currentBlock, blockMarkup),
        
        // Get block by ID
        get: (blockId) => useBlockStore.getState().getBlockById(blockId),
        
        // Get blocks by type
        getByType: (type) => useBlockStore.getState().getBlocksByType(type),
        
        // Get all blocks
        getAll: () => useBlockStore.getState().blocks,
        
        // Direct access to store
        store: useBlockStore
      };
      
      console.log('🔧 window.block API initialized', window.block);
    }

    // Observer for Gutenberg block selection
    const observeGutenbergSelection = () => {
      if (typeof window !== 'undefined' && window.wp && window.wp.data) {
        const { select, subscribe } = window.wp.data;
        
        console.log('🔍 Setting up Gutenberg selection observer');
        
        let previousSelectedBlockId = null;
        
        const unsubscribe = subscribe(() => {
          try {
            const selectedBlockId = select('core/block-editor').getSelectedBlockClientId();
            
            // Only update if selection actually changed
            if (selectedBlockId !== previousSelectedBlockId) {
              previousSelectedBlockId = selectedBlockId;
              
              if (selectedBlockId) {
                // Get the selected block data
                const blockData = select('core/block-editor').getBlock(selectedBlockId);
                const blockType = select('core/blocks').getBlockType(blockData.name);
                
                const selectedBlock = {
                  id: selectedBlockId,
                  type: blockData.name,
                  content: blockData.originalContent || '',
                  attributes: blockData.attributes || {},
                  blockData: blockData,
                  blockType: blockType,
                  markup: {
                    id: selectedBlockId,
                    type: blockData.name,
                    content: blockData.originalContent || '',
                    attributes: blockData.attributes || {}
                  }
                };
                
                console.log('📍 Block selected:', selectedBlock);
                useBlockStore.getState().setLastSelectedBlock(selectedBlock);
              } else {
                console.log('📍 Block deselected');
                useBlockStore.getState().clearSelection();
              }
            }
          } catch (error) {
            console.warn('⚠️ Error observing Gutenberg selection:', error);
          }
        });
        
        return unsubscribe;
      }
      return null;
    };

    // Set up observer when wp.data is available
    const setupObserver = () => {
      if (window.wp && window.wp.data) {
        return observeGutenbergSelection();
      } else {
        console.log('⏳ Waiting for wp.data to be available...');
        return null;
      }
    };

    // Try to set up observer immediately
    let unsubscribe = setupObserver();
    
    // If wp.data isn't ready, try again periodically
    let retryInterval;
    if (!unsubscribe) {
      retryInterval = setInterval(() => {
        unsubscribe = setupObserver();
        if (unsubscribe) {
          clearInterval(retryInterval);
        }
      }, 1000);
      
      // Stop trying after 30 seconds
      setTimeout(() => {
        if (retryInterval) {
          clearInterval(retryInterval);
          console.log('⏰ Stopped trying to set up Gutenberg observer after timeout');
        }
      }, 30000);
    }

    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      if (retryInterval) {
        clearInterval(retryInterval);
      }
    };
  }, []);

  return (
    <>
      {/* Inject Tailwind CSS directly as a style tag (same as ShadowApp) */}
      {decodedCSS && (
        <style dangerouslySetInnerHTML={{ __html: decodedCSS }} />
      )}
      
      {/* Gutenberg Layout with normalized props */}
      <GutenbergLayout userRole={userRole} siteUrl={siteUrl} userId={userId} settings={settings} apiNonce={apiNonce} pluginVersion={pluginVersion} isAdmin={isAdmin} theme={theme} />
    </>
  );
}