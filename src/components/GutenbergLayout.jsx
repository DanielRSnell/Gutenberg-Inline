import React, { useState, useEffect, useRef } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import { BlockHeader } from './BlockHeader';
import { BlockEditor } from './BlockEditor';
import { useElementInsertion } from '../hooks/useElementInsertion.js';
import { useStore } from '../storage/store.js';

const sidebarItems = [
  { id: 'gbi-add-section', label: 'Section', icon: 'section' },
  { id: 'gbi-add-container', label: 'Container', icon: 'container' },
  { id: 'gbi-divider-1', type: 'divider' },
  { id: 'gbi-add-header', label: 'Header', icon: 'header' },
  { id: 'gbi-add-paragraph', label: 'Paragraph', icon: 'paragraph' },
  { id: 'gbi-add-span', label: 'Span', icon: 'span' },
  { id: 'gbi-add-link', label: 'Link', icon: 'link' },
  { id: 'gbi-add-button', label: 'Button', icon: 'button' },
  { id: 'gbi-divider-2', type: 'divider' },
  { id: 'gbi-add-image', label: 'Image', icon: 'image' },
  { id: 'gbi-add-svg', label: 'SVG', icon: 'svg' },
  { id: 'gbi-add-video', label: 'Video', icon: 'video' },
  { id: 'gbi-divider-3', type: 'divider' },
  { id: 'gbi-add-form', label: 'Form', icon: 'form' },
  { id: 'gbi-add-input', label: 'Input', icon: 'input' },
  { id: 'gbi-add-submit', label: 'Submit', icon: 'submit' },
  { id: 'gbi-add-upload', label: 'Upload', icon: 'upload' }
];

const getIcon = (iconType) => {
  const icons = {
    section: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />,
    container: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
    header: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />,
    paragraph: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />,
    span: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4" />,
    link: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />,
    button: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />,
    image: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />,
    svg: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 3H5a2 2 0 00-2 2v12a4 4 0 004 4h2a2 2 0 002-2V5a2 2 0 00-2-2z" />,
    video: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />,
    form: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
    input: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />,
    submit: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />,
    upload: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  };
  return icons[iconType] || icons.section;
};

export function GutenbergLayout({ children, ...props }) {
  const [isWindPressActive, setIsWindPressActive] = useState(false);
  const { isSidebarCollapsed, toggleSidebar } = useStore();
  const containerRef = useRef(null);
  
  // Initialize element insertion system
  const { 
    isInitialized, 
    isGenerating, 
    generationError, 
    regenerateBlocks,
    isCacheValid 
  } = useElementInsertion();

  useEffect(() => {
    // Check for WindPress after component mounts
    const checkWindPress = () => {
      const isActive = typeof window !== 'undefined' && !!window.windpress;
      setIsWindPressActive(isActive);
      
      // Stop checking once WindPress is found
      if (isActive) {
        console.log('🔍 WindPress detected and active');
        return true; // Signal to stop checking
      }
      return false;
    };
    
    // Initial check
    if (checkWindPress()) {
      return; // WindPress found immediately, no need for interval
    }
    
    // Check periodically in case WindPress loads later, but stop once found
    const interval = setInterval(() => {
      if (checkWindPress()) {
        clearInterval(interval);
      }
    }, 3000);
    
    // Cleanup interval after reasonable time (30 seconds)
    const timeout = setTimeout(() => {
      clearInterval(interval);
      console.log('🔍 WindPress check timeout - stopped checking');
    }, 30000);
    
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  // Control both internal container and parent web component width
  useEffect(() => {
    const container = containerRef.current;
    const targetWidth = isSidebarCollapsed ? 60 : 435;
    
    if (container) {
      // Control internal container
      container.style.transition = 'width 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)';
      container.style.width = `${targetWidth}px`;
      console.log(`🎯 Internal container width set to: ${targetWidth}px`);
    }
    
    // Control parent web component wrapper using global function
    if (window.gbStyleControlManagerWidth) {
      window.gbStyleControlManagerWidth(targetWidth);
    } else {
      console.warn('🚫 gbStyleControlManagerWidth function not available');
    }
  }, [isSidebarCollapsed]);

  return (
    <Tooltip.Provider>
      <motion.div 
        ref={containerRef}
        id="gbi-container"
        className="flex h-full min-h-screen bg-background"
        style={{ width: isSidebarCollapsed ? '60px' : '435px' }}
      >
        {/* Dark Sidebar - Always visible, slides in from left */}
        <motion.div 
          className="w-[60px] bg-dark flex flex-col items-center pt-2 pb-[100px] justify-between flex-shrink-0"
          initial={{ x: -60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.4, 0.0, 0.2, 1] }}
        >
          {/* Element Options */}
          <div id="gbi-actions" className="flex flex-col items-center space-y-2">
            {sidebarItems.map((item) => {
              if (item.type === 'divider') {
                return (
                  <div key={item.id} className="w-8 h-px bg-zinc-600/30 my-2 shadow-inner"></div>
                );
              }
              
              return (
                <Tooltip.Root key={item.id}>
                  <Tooltip.Trigger asChild>
                    <button
                      id={item.id}
                      disabled={isGenerating}
                      className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${
                        isGenerating 
                          ? 'bg-zinc-800 border-zinc-700 cursor-not-allowed opacity-50' 
                          : isInitialized
                            ? 'bg-zinc-700 border-zinc-600 hover:bg-zinc-600 cursor-pointer'
                            : 'bg-zinc-800 border-zinc-700 cursor-wait opacity-75'
                      }`}
                    >
                      {isGenerating ? (
                        <div className="w-3 h-3 border border-zinc-500 border-t-zinc-300 rounded-full animate-spin"></div>
                      ) : (
                        <svg className="w-3 h-3 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {getIcon(item.icon)}
                        </svg>
                      )}
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="bg-gray-900 text-white px-2 py-1 rounded text-sm shadow-lg"
                      sideOffset={5}
                      side="right"
                    >
                      {isGenerating 
                        ? 'Generating blocks...' 
                        : isInitialized 
                          ? `Add ${item.label}` 
                          : 'Initializing...'
                      }
                      <Tooltip.Arrow className="fill-gray-900" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              );
            })}
          </div>
          
          {/* Bottom Settings */}
          <div id="gbi-settings" className="flex flex-col items-center space-y-2">
            {/* Status Indicator */}
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <div className="w-6 h-6 bg-zinc-700 rounded border border-zinc-600 flex items-center justify-center relative">
                  <svg className="w-3 h-3 text-zinc-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.9996 4.85999C8.82628 4.85999 6.84294 6.44665 6.04961 9.61999C7.23961 8.03332 8.62794 7.43832 10.2146 7.83499C11.12 8.06109 11.7666 8.71757 12.4835 9.44545C13.6507 10.6295 15.0004 12 17.9496 12C21.1229 12 23.1063 10.4133 23.8996 7.23998C22.7096 8.82665 21.3213 9.42165 19.7346 9.02499C18.8292 8.79889 18.1827 8.1424 17.4657 7.41452C16.2995 6.23047 14.9498 4.85999 11.9996 4.85999ZM6.04961 12C2.87628 12 0.892943 13.5867 0.0996094 16.76C1.28961 15.1733 2.67794 14.5783 4.26461 14.975C5.17 15.2011 5.81657 15.8576 6.53354 16.5855C7.70073 17.7695 9.05039 19.14 11.9996 19.14C15.1729 19.14 17.1563 17.5533 17.9496 14.38C16.7596 15.9667 15.3713 16.5617 13.7846 16.165C12.8792 15.9389 12.2326 15.2824 11.5157 14.5545C10.3495 13.3705 8.99982 12 6.04961 12Z"></path>
                  </svg>
                  {/* Status ping indicator */}
                  <div className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${
                    isWindPressActive ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    <div className={`absolute inset-0 rounded-full animate-ping ${
                      isWindPressActive ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                  </div>
                </div>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className="bg-gray-900 text-white px-2 py-1 rounded text-sm shadow-lg"
                  sideOffset={5}
                  side="right"
                >
                  {isWindPressActive ? 'WindPress Active' : 'WindPress Inactive'}
                  <Tooltip.Arrow className="fill-gray-900" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
            
            {/* Collapse Button */}
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  id="gbi-collapse"
                  onClick={() => {
                    console.log('🔘 Collapse button clicked, current state:', isSidebarCollapsed);
                    toggleSidebar(); // Width control is handled in useEffect
                  }}
                  className="w-6 h-6 bg-zinc-700 rounded border border-zinc-600 flex items-center justify-center hover:bg-zinc-600 transition-colors cursor-pointer"
                >
                  <svg className="w-3 h-3 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isSidebarCollapsed ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M11 19l-7-7 7-7m8 14l-7-7 7-7"} />
                  </svg>
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className="bg-gray-900 text-white px-2 py-1 rounded text-sm shadow-lg"
                  sideOffset={5}
                  side="right"
                >
                  {isSidebarCollapsed ? 'Show Panel' : 'Hide Panel'}
                  <Tooltip.Arrow className="fill-gray-900" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </div>
        </motion.div>
        
        {/* White Content Area - Natural slide animation */}
        <motion.div 
          className="bg-white border-l border-border border-r-1 border-neutral flex flex-col pb-[80px] overflow-hidden"
          initial={{ width: isSidebarCollapsed ? 0 : 375, opacity: 0 }}
          animate={{ 
            width: isSidebarCollapsed ? 0 : 375,
            opacity: isSidebarCollapsed ? 0 : 1
          }}
          transition={{ 
            width: {
              duration: 0.5, 
              ease: [0.4, 0.0, 0.2, 1],
              delay: isSidebarCollapsed ? 0 : 0.3 // Delay entrance after sidebar
            },
            opacity: { 
              duration: 0.4, 
              delay: isSidebarCollapsed ? 0 : 0.4 
            }
          }}
        >
          {/* Content Area */}
          <div className="flex-1 overflow-hidden">
            <BlockEditor />
          </div>
          
          {/* Block Header with quick actions - moved to bottom */}
          <BlockHeader />
        </motion.div>
      </motion.div>
    </Tooltip.Provider>
  );
}