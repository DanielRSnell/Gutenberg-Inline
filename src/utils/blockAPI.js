// Enhanced block insertion utilities
window.gbStyleBlockUtils = {
    // Check if a block supports inner blocks
    supportsInnerBlocks(blockName) {
        if (typeof wp === 'undefined' || !wp.blocks) return false;
        
        try {
            const blockType = wp.blocks.getBlockType(blockName);
            return !!(blockType && (
                blockType.allowedBlocks || // Explicitly allows specific blocks
                blockType.supports?.inserter !== false || // General inserter support
                blockName.includes('group') || // Common container blocks
                blockName.includes('column') ||
                blockName.includes('container') ||
                blockName.includes('section')
            ));
        } catch (error) {
            return false;
        }
    },

    // Get selected block information
    getSelectedBlockInfo() {
        if (typeof wp === 'undefined' || !wp.data) return null;
        
        try {
            const { select } = wp.data;
            const { getSelectedBlockClientId, getSelectedBlock, getBlock } = select('core/block-editor');
            
            const selectedBlockId = getSelectedBlockClientId();
            if (!selectedBlockId) return null;
            
            const selectedBlock = getSelectedBlock();
            const supportsInner = this.supportsInnerBlocks(selectedBlock.name);
            
            return {
                clientId: selectedBlockId,
                block: selectedBlock,
                supportsInnerBlocks: supportsInner,
                hasInnerBlocks: selectedBlock.innerBlocks && selectedBlock.innerBlocks.length > 0
            };
        } catch (error) {
            return null;
        }
    }
};

// Smart block insertion - automatically chooses best insertion method
window.gbStyleInsertBlock = function(blockMarkup, options = {}) {
    // Check if we're in the block editor
    if (typeof wp === 'undefined' || !wp.data || !wp.blocks) {
        return false;
    }

    try {
        // Parse the block markup string into block objects
        const blocks = wp.blocks.parse(blockMarkup);
        
        if (!blocks || blocks.length === 0) {
            return false;
        }

        // Get selected block information
        const selectedBlockInfo = window.gbStyleBlockUtils.getSelectedBlockInfo();
        
        // Determine insertion method based on context and options
        if (options.mode === 'swap' && selectedBlockInfo) {
            return window.gbStyleSwapBlock(blockMarkup);
        } else if (options.mode === 'inner' && selectedBlockInfo?.supportsInnerBlocks) {
            return window.gbStyleInsertAsInnerBlock(blockMarkup);
        } else if (selectedBlockInfo?.supportsInnerBlocks && options.preferInner !== false) {
            // Auto-insert as inner block if possible (unless explicitly disabled)
            return window.gbStyleInsertAsInnerBlock(blockMarkup);
        } else {
            // Default: insert after selected block or at end
            const { select, dispatch } = wp.data;
            const { getSelectedBlockClientId, getBlockInsertionPoint } = select('core/block-editor');
            const { insertBlocks } = dispatch('core/block-editor');

            const selectedBlockId = getSelectedBlockClientId();
            const insertionPoint = getBlockInsertionPoint();
            
            if (selectedBlockId) {
                // Insert after the selected block
                insertBlocks(blocks, insertionPoint.index + 1, insertionPoint.rootClientId);
            } else {
                // Insert at the end if no block is selected
                insertBlocks(blocks);
            }
            
            return true;
        }

    } catch (error) {
        return false;
    }
};

// Helper function to insert at a specific position
window.gbStyleInsertBlockAt = function(blockMarkup, index = null, rootClientId = null) {
    if (typeof wp === 'undefined' || !wp.data || !wp.blocks) {
        return false;
    }

    try {
        const blocks = wp.blocks.parse(blockMarkup);
        
        if (!blocks || blocks.length === 0) {
            return false;
        }

        const { dispatch } = wp.data;
        const { insertBlocks } = dispatch('core/block-editor');

        // Insert at specific position
        insertBlocks(blocks, index, rootClientId);

        return true;

    } catch (error) {
        return false;
    }
};

// Helper function to replace the entire content
window.gbStyleReplaceContent = function(blockMarkup) {
    if (typeof wp === 'undefined' || !wp.data || !wp.blocks) {
        return false;
    }

    try {
        const blocks = wp.blocks.parse(blockMarkup);
        
        const { dispatch } = wp.data;
        const { resetBlocks } = dispatch('core/block-editor');

        // Replace all content
        resetBlocks(blocks);

        return true;

    } catch (error) {
        return false;
    }
};

// Insert blocks as inner children of selected block
window.gbStyleInsertAsInnerBlock = function(blockMarkup) {
    if (typeof wp === 'undefined' || !wp.data || !wp.blocks) {
        return false;
    }

    try {
        const blocks = wp.blocks.parse(blockMarkup);
        
        if (!blocks || blocks.length === 0) {
            return false;
        }

        const selectedBlockInfo = window.gbStyleBlockUtils.getSelectedBlockInfo();
        
        if (!selectedBlockInfo) {
            return false;
        }

        if (!selectedBlockInfo.supportsInnerBlocks) {
            return false;
        }

        const { dispatch } = wp.data;
        const { insertBlocks } = dispatch('core/block-editor');

        // Insert as inner blocks at the end of existing inner blocks
        const insertIndex = selectedBlockInfo.hasInnerBlocks ? 
            selectedBlockInfo.block.innerBlocks.length : 0;
            
        insertBlocks(blocks, insertIndex, selectedBlockInfo.clientId);

        return true;

    } catch (error) {
        return false;
    }
};

// Swap selected block with new block(s)
window.gbStyleSwapBlock = function(blockMarkup) {
    if (typeof wp === 'undefined' || !wp.data || !wp.blocks) {
        return false;
    }

    try {
        const blocks = wp.blocks.parse(blockMarkup);
        
        if (!blocks || blocks.length === 0) {
            return false;
        }

        const selectedBlockInfo = window.gbStyleBlockUtils.getSelectedBlockInfo();
        
        if (!selectedBlockInfo) {
            return false;
        }

        const { select, dispatch } = wp.data;
        const { getBlockIndex, getBlockRootClientId } = select('core/block-editor');
        const { replaceBlocks } = dispatch('core/block-editor');

        // Replace the selected block with new blocks
        replaceBlocks(selectedBlockInfo.clientId, blocks);

        return true;

    } catch (error) {
        return false;
    }
};

// Helper function to append to the end
window.gbStyleAppendBlock = function(blockMarkup) {
    if (typeof wp === 'undefined' || !wp.data || !wp.blocks) {
        return false;
    }

    try {
        const blocks = wp.blocks.parse(blockMarkup);
        
        if (!blocks || blocks.length === 0) {
            return false;
        }

        const { select, dispatch } = wp.data;
        const { getBlockCount } = select('core/block-editor');
        const { insertBlocks } = dispatch('core/block-editor');

        // Insert at the very end
        const blockCount = getBlockCount();
        insertBlocks(blocks, blockCount);

        return true;

    } catch (error) {
        return false;
    }
};

// Control gutenberg-inline-manager web component width
window.gbStyleControlManagerWidth = function(targetWidth) {
    try {
        const manager = document.querySelector('gutenberg-inline-manager');
        if (!manager) {
            console.warn('🚫 gutenberg-inline-manager not found');
            return false;
        }

        // Ensure smooth transition
        if (!manager.style.transition) {
            manager.style.transition = 'width 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)';
        }

        // Set the width
        manager.style.width = typeof targetWidth === 'number' ? `${targetWidth}px` : targetWidth;
        console.log(`🎯 Web component width set to: ${manager.style.width}`);

        return true;
    } catch (error) {
        console.error('❌ Error controlling manager width:', error);
        return false;
    }
};

// Convenience functions for common width changes
window.gbStyleCollapseManager = function() {
    return window.gbStyleControlManagerWidth('60px');
};

window.gbStyleExpandManager = function() {
    return window.gbStyleControlManagerWidth('435px');
};
