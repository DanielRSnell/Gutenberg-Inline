// Hook for handling element insertion from sidebar
import { useEffect, useState } from 'react';
import { 
  initializeElementBlocks, 
  insertElementBlock,
  generateAllElementBlocks,
  areBlocksCached,
  debugElementInsertion
} from '../utils/elementBlockGenerator.js';

export function useElementInsertion() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState(null);

  // Initialize element blocks on mount
  useEffect(() => {
    const initBlocks = async () => {
      try {
        setIsGenerating(true);
        setGenerationError(null);
        
        await initializeElementBlocks();
        setIsInitialized(true);
        
        console.log('🎉 Element insertion system initialized');
      } catch (error) {
        console.error('❌ Failed to initialize element blocks:', error);
        setGenerationError(error.message);
      } finally {
        setIsGenerating(false);
      }
    };

    initBlocks();
  }, []);

  // Attach click handlers to sidebar buttons
  useEffect(() => {
    if (!isInitialized) return;

    const handleElementClick = (event) => {
      console.log('🎯 Click detected on sidebar!', event.target);
      
      const button = event.target.closest('button[id^="gbi-add-"]');
      console.log('🔍 Found button:', button);
      
      if (!button) {
        console.log('❌ No button found with gbi-add- prefix');
        return;
      }

      const elementId = button.id;
      const elementType = elementId.replace('gbi-add-', '');
      
      console.log(`🎯 Sidebar button clicked: ${elementType}`);
      console.log(`🔍 Checking blockAPI availability:`, {
        gbStyleInsertBlock: !!window.gbStyleInsertBlock,
        gbStyleBlockUtils: !!window.gbStyleBlockUtils,
        gbStyleInsertAsInnerBlock: !!window.gbStyleInsertAsInnerBlock,
        gbStyleAppendBlock: !!window.gbStyleAppendBlock,
        wp: !!window.wp,
        wpData: !!window.wp?.data,
        wpBlocks: !!window.wp?.blocks
      });
      
      // Insert the element
      const success = insertElementBlock(elementType);
      
      if (success) {
        console.log(`✅ Successfully inserted ${elementType}`);
        // Visual feedback
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
          button.style.transform = '';
        }, 150);
      } else {
        console.error(`❌ Failed to insert ${elementType}`);
        // Error feedback
        button.style.backgroundColor = '#ef4444';
        setTimeout(() => {
          button.style.backgroundColor = '';
        }, 500);
      }
    };

    const attachHandlers = () => {
      // Try multiple approaches to find the sidebar
      let sidebar = document.getElementById('gbi-actions');
      
      // If not found in main document, try comprehensive React-aware search
      if (!sidebar) {
        console.log('🔍 Sidebar not found in main document, searching React containers...');
        
        // First, specifically target the gutenberg-inline-manager shadow DOM
        const gutenbergManager = document.querySelector('gutenberg-inline-manager');
        if (gutenbergManager && gutenbergManager.shadowRoot) {
          console.log('🎯 Found gutenberg-inline-manager with shadow DOM:', gutenbergManager);
          sidebar = gutenbergManager.shadowRoot.querySelector('#gbi-actions');
          if (sidebar) {
            console.log('🎯 Found sidebar in gutenberg-inline-manager shadow DOM!', sidebar);
          }
        }
        
        // If not found in the specific gutenberg manager, search all containers
        if (!sidebar) {
          const searchContainers = [
            document,
            // Shadow DOM containers (prioritize gutenberg and plugin elements)
            ...Array.from(document.querySelectorAll('gutenberg-inline-manager')),
            ...Array.from(document.querySelectorAll('plugin-boilerplate')),
            ...Array.from(document.querySelectorAll('*')).filter(el => el.shadowRoot),
            // React root containers
            ...Array.from(document.querySelectorAll('[data-reactroot]')),
            ...Array.from(document.querySelectorAll('[id*="react"]')),
            ...Array.from(document.querySelectorAll('[class*="react"]')),
            // WordPress editor containers
            ...Array.from(document.querySelectorAll('.edit-post-layout')),
            ...Array.from(document.querySelectorAll('.block-editor')),
            ...Array.from(document.querySelectorAll('[class*="gutenberg"]')),
            // Generic React component containers
            ...Array.from(document.querySelectorAll('[data-component]')),
            ...Array.from(document.querySelectorAll('[class*="component"]'))
          ];
        
          console.log(`🔍 Searching ${searchContainers.length} containers for React components...`);
          
          // Also log what we're actually searching for debugging
          console.log('🔍 Current document elements with plugin-boilerplate:', document.querySelectorAll('plugin-boilerplate'));
          console.log('🔍 Current document elements with gbi:', document.querySelectorAll('[id*="gbi"]'));
          console.log('🔍 Current document body children:', document.body.children);
          
          for (const container of searchContainers) {
          try {
            // Try both the container itself and its shadow root
            const searchRoots = [container];
            if (container.shadowRoot) {
              searchRoots.push(container.shadowRoot);
            }
            
            for (const root of searchRoots) {
              // Search for the sidebar element
              sidebar = root.querySelector('#gbi-actions');
              if (sidebar) {
                console.log('🎯 Found sidebar in container:', container);
                console.log('🎯 Sidebar element:', sidebar);
                console.log('🎯 Parent container type:', container.tagName);
                break;
              }
              
              // Also search for any elements with gbi- ids as debugging info
              const gbiElements = root.querySelectorAll('[id*="gbi"]');
              if (gbiElements.length > 0) {
                console.log(`🔍 Found ${gbiElements.length} GBI elements in`, container, ':', Array.from(gbiElements).map(el => el.id));
              }
            }
            
            if (sidebar) break;
          } catch (error) {
            // Ignore access errors for cross-origin or restricted content
            console.log('🚫 Access denied to container:', container);
          }
          }
        }
      }
      
      console.log('🔍 Looking for sidebar element:', sidebar);
      
      if (sidebar) {
        return attachClickHandlers(sidebar);
      } else {
        console.log('🔍 Sidebar still not found, setting up MutationObserver...');
        
        // Create observer to watch for the sidebar element being added
        const observer = new MutationObserver((mutations) => {
          for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
              if (node.nodeType === Node.ELEMENT_NODE) {
                // Check if the added node is the sidebar
                if (node.id === 'gbi-actions') {
                  console.log('🎯 Found sidebar via MutationObserver!', node);
                  attachClickHandlers(node);
                  observer.disconnect();
                  return;
                }
                
                // Check if the added node is gutenberg-inline-manager
                if (node.tagName === 'GUTENBERG-INLINE-MANAGER') {
                  console.log('🎯 Found gutenberg-inline-manager via MutationObserver!', node);
                  
                  // Wait a bit for shadow DOM to be ready, then search within it
                  setTimeout(() => {
                    if (node.shadowRoot) {
                      const foundSidebar = node.shadowRoot.querySelector('#gbi-actions');
                      if (foundSidebar) {
                        console.log('🎯 Found sidebar in gutenberg-inline-manager shadow DOM via MutationObserver!', foundSidebar);
                        attachClickHandlers(foundSidebar);
                        observer.disconnect();
                        return;
                      }
                    }
                  }, 100);
                }
                
                // Check if the added node contains the sidebar (regular DOM)
                const foundSidebar = node.querySelector && node.querySelector('#gbi-actions');
                if (foundSidebar) {
                  console.log('🎯 Found sidebar in added node via MutationObserver!', foundSidebar);
                  attachClickHandlers(foundSidebar);
                  observer.disconnect();
                  return;
                }
                
                // Check if the added node contains gutenberg-inline-manager
                const foundManager = node.querySelector && node.querySelector('gutenberg-inline-manager');
                if (foundManager && foundManager.shadowRoot) {
                  const managerSidebar = foundManager.shadowRoot.querySelector('#gbi-actions');
                  if (managerSidebar) {
                    console.log('🎯 Found sidebar in nested gutenberg-inline-manager via MutationObserver!', managerSidebar);
                    attachClickHandlers(managerSidebar);
                    observer.disconnect();
                    return;
                  }
                }
              }
            }
          }
        });
        
        // Observe the entire document for changes
        observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: false
        });
        
        // Stop observing after 10 seconds
        setTimeout(() => {
          observer.disconnect();
          console.log('🔍 MutationObserver timeout - stopped watching for sidebar');
        }, 10000);
        
        // Try alternative selectors as fallback
        const alternativeSidebar = document.querySelector('[id*="gbi"]');
        console.log('🔍 Alternative sidebar found:', alternativeSidebar);
        
        // List all elements with gbi- ids
        const gbiElements = document.querySelectorAll('[id*="gbi"]');
        console.log('🔍 All GBI elements:', gbiElements);
        return null;
      }
    };

    // Separate function to attach click handlers to a sidebar element
    const attachClickHandlers = (sidebar) => {
      if (!sidebar) return null;
      
      sidebar.addEventListener('click', handleElementClick);
      console.log('🔗 Sidebar click handlers attached to:', sidebar);
      
      // Also attach to individual buttons as backup
      const buttons = sidebar.querySelectorAll('button[id^="gbi-add-"]');
      console.log('🔍 Found buttons:', buttons.length, buttons);
      
      buttons.forEach(button => {
        button.addEventListener('click', (event) => {
          console.log('🎯 Direct button click:', button.id);
          handleElementClick(event);
        });
      });
      
      // Expose debug functions for testing
      debugElementInsertion();
      return sidebar;
    };

    // Try immediately and also with a delay
    const sidebar = attachHandlers();
    const timeoutId = setTimeout(() => {
      if (!sidebar) {
        console.log('🔄 Retrying to attach handlers after delay...');
        attachHandlers();
      }
    }, 1000);

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      
      // Find and cleanup any attached handlers
      const currentSidebar = document.getElementById('gbi-actions') || 
                           document.querySelector('#gbi-actions');
      
      if (currentSidebar) {
        currentSidebar.removeEventListener('click', handleElementClick);
        const buttons = currentSidebar.querySelectorAll('button[id^="gbi-add-"]');
        buttons.forEach(button => {
          button.removeEventListener('click', handleElementClick);
        });
        console.log('🧹 Cleaned up sidebar click handlers');
      }
    };
  }, [isInitialized]);

  // Function to manually regenerate blocks
  const regenerateBlocks = async () => {
    try {
      setIsGenerating(true);
      setGenerationError(null);
      
      await generateAllElementBlocks();
      console.log('🔄 Blocks regenerated successfully');
    } catch (error) {
      console.error('❌ Failed to regenerate blocks:', error);
      setGenerationError(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isInitialized,
    isGenerating,
    generationError,
    regenerateBlocks,
    insertElement: insertElementBlock,
    isCacheValid: areBlocksCached()
  };
}