// Initialize element blocks when Gutenberg app loads
import { initializeElementBlocks } from './elementBlockGenerator.js';

// Note: Auto-initialization is handled by the React hook useElementInsertion
// This file is imported to ensure the module is available but doesn't auto-run

// Export for manual initialization
export { initializeElementBlocks };