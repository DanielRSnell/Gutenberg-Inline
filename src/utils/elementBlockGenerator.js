// Element Block Generator - Pre-generates block markup for sidebar elements
// Uses Umbral AI API with greenshift provider by default

/**
 * HTML templates for each element type
 */
const elementTemplates = {
  section: '<section class="wp-block-section"><div class="wp-block-container"><p>Section content goes here</p></div></section>',
  container: '<div class="wp-block-container"><p>Container content goes here</p></div>',
  header: '<h2 class="wp-block-heading">Your Heading Here</h2>',
  paragraph: '<p class="wp-block-paragraph">Your paragraph text goes here. Edit this text to add your content.</p>',
  span: '<span class="wp-inline-text">Inline text</span>',
  link: '<a href="#" class="wp-block-link">Link text</a>',
  button: '<div class="wp-block-button"><a class="wp-block-button__link" href="#">Button Text</a></div>',
  image: '<figure class="wp-block-image"><img src="https://via.placeholder.com/600x400" alt="Placeholder image" /></figure>',
  svg: '<div class="wp-block-svg"><svg width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="#f0f0f0" stroke="#ccc" stroke-width="2"/><text x="50" y="50" text-anchor="middle" dy=".3em">SVG</text></svg></div>',
  video: '<figure class="wp-block-video"><video controls><source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4">Your browser does not support the video tag.</video></figure>',
  form: '<form class="wp-block-form"><div class="form-field"><label>Name:</label><input type="text" name="name" required /></div><div class="form-field"><label>Email:</label><input type="email" name="email" required /></div><button type="submit">Submit</button></form>',
  input: '<div class="wp-block-input"><label>Input Label:</label><input type="text" placeholder="Enter text here" /></div>',
  submit: '<button type="submit" class="wp-block-submit">Submit</button>',
  upload: '<div class="wp-block-upload"><label>Choose file:</label><input type="file" /></div>'
};

/**
 * Cache for generated block markup
 */
let blockMarkupCache = {};

/**
 * Generate block markup for all elements using Umbral AI API
 */
export async function generateAllElementBlocks() {
  console.log('🚀 Starting block markup generation for all elements...');
  
  const results = {};
  const errors = {};
  
  for (const [elementType, html] of Object.entries(elementTemplates)) {
    try {
      console.log(`🔄 Generating block markup for: ${elementType}`);
      
      const response = await fetch('https://blocks.umbral.ai/api/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html: html,
          provider: 'greenshift', // Default to greenshift
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
      results[elementType] = blockMarkup;
      console.log(`✅ Generated ${elementType}: ${blockMarkup.length} chars`);
      
      // Small delay to be nice to the API
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (error) {
      console.error(`❌ Error generating ${elementType}:`, error);
      errors[elementType] = error.message;
      
      // Fallback: create a simple block structure
      results[elementType] = `<!-- wp:html -->\n${elementTemplates[elementType]}\n<!-- /wp:html -->`;
    }
  }
  
  // Cache the results
  blockMarkupCache = results;
  
  // Store in localStorage for persistence
  try {
    localStorage.setItem('umbral_element_blocks', JSON.stringify(results));
    localStorage.setItem('umbral_element_blocks_timestamp', Date.now().toString());
  } catch (error) {
    console.warn('Could not cache blocks in localStorage:', error);
  }
  
  console.log(`🎉 Block generation complete! Generated ${Object.keys(results).length} elements`);
  
  if (Object.keys(errors).length > 0) {
    console.warn('⚠️ Some elements had errors:', errors);
  }
  
  return { results, errors };
}

/**
 * Get cached block markup for an element
 */
export function getElementBlockMarkup(elementType) {
  console.log(`🔍 Getting block markup for: ${elementType}`);
  console.log(`🔍 Cache status:`, Object.keys(blockMarkupCache));
  
  // Try cache first
  if (blockMarkupCache[elementType]) {
    console.log(`✅ Found ${elementType} in memory cache`);
    return blockMarkupCache[elementType];
  }
  
  // Try localStorage
  try {
    const cached = localStorage.getItem('umbral_element_blocks');
    if (cached) {
      const cachedData = JSON.parse(cached);
      blockMarkupCache = cachedData; // Restore cache
      console.log(`✅ Restored cache from localStorage:`, Object.keys(cachedData));
      if (cachedData[elementType]) {
        console.log(`✅ Found ${elementType} in localStorage cache`);
        return cachedData[elementType];
      }
    }
  } catch (error) {
    console.warn('Could not read cached blocks:', error);
  }
  
  // Fallback to simple HTML block
  const fallback = `<!-- wp:html -->\n${elementTemplates[elementType] || '<p>Element</p>'}\n<!-- /wp:html -->`;
  console.warn(`⚠️ Using fallback block markup for ${elementType}`);
  console.log(`📋 Fallback markup:`, fallback);
  return fallback;
}

/**
 * Check if blocks are cached and still fresh (less than 1 hour old)
 */
export function areBlocksCached() {
  try {
    const cached = localStorage.getItem('umbral_element_blocks');
    const timestamp = localStorage.getItem('umbral_element_blocks_timestamp');
    
    if (!cached || !timestamp) return false;
    
    const age = Date.now() - parseInt(timestamp);
    const oneHour = 60 * 60 * 1000;
    
    return age < oneHour;
  } catch (error) {
    return false;
  }
}

/**
 * Initialize block cache - load from storage or generate fresh
 */
export async function initializeElementBlocks() {
  console.log('🔍 Initializing element blocks...');
  
  if (areBlocksCached()) {
    try {
      const cached = localStorage.getItem('umbral_element_blocks');
      blockMarkupCache = JSON.parse(cached);
      console.log('✅ Loaded cached element blocks');
      return blockMarkupCache;
    } catch (error) {
      console.warn('Error loading cached blocks, regenerating...', error);
    }
  }
  
  console.log('🔄 Cache miss or expired, generating fresh blocks...');
  const { results } = await generateAllElementBlocks();
  return results;
}

/**
 * Insert element block into WordPress editor using blockAPI.js
 */
export function insertElementBlock(elementType, options = {}) {
  const blockMarkup = getElementBlockMarkup(elementType);
  
  if (!blockMarkup) {
    console.error(`❌ No block markup found for element: ${elementType}`);
    return false;
  }
  
  console.log(`🔧 Inserting ${elementType} block...`);
  console.log(`📋 Block markup preview:`, blockMarkup.substring(0, 200) + '...');
  
  // Primary: Use blockAPI.js smart insertion
  if (window.gbStyleInsertBlock) {
    console.log(`🎯 Using gbStyleInsertBlock for ${elementType}`);
    const success = window.gbStyleInsertBlock(blockMarkup, {
      mode: 'auto',
      preferInner: true
    });
    
    if (success) {
      console.log(`✅ Successfully inserted ${elementType} block using gbStyleInsertBlock`);
      return true;
    } else {
      console.warn(`⚠️ gbStyleInsertBlock failed for ${elementType}`);
    }
  } else {
    console.warn(`⚠️ gbStyleInsertBlock not available`);
  }
  
  // Secondary: Try specific blockAPI.js functions
  if (window.gbStyleBlockUtils?.getSelectedBlockInfo) {
    try {
      const selectedBlockInfo = window.gbStyleBlockUtils.getSelectedBlockInfo();
      
      if (selectedBlockInfo?.supportsInnerBlocks && window.gbStyleInsertAsInnerBlock) {
        console.log(`🎯 Using gbStyleInsertAsInnerBlock for ${elementType}`);
        const success = window.gbStyleInsertAsInnerBlock(blockMarkup);
        if (success) {
          console.log(`✅ Successfully inserted ${elementType} as inner block`);
          return true;
        }
      } else if (window.gbStyleAppendBlock) {
        console.log(`🎯 Using gbStyleAppendBlock for ${elementType}`);
        const success = window.gbStyleAppendBlock(blockMarkup);
        if (success) {
          console.log(`✅ Successfully appended ${elementType} block`);
          return true;
        }
      }
    } catch (error) {
      console.warn(`⚠️ blockAPI.js specific functions failed:`, error);
    }
  }
  
  // Fallback: Direct WordPress API
  if (window.wp?.data && window.wp?.blocks) {
    try {
      console.log(`🎯 Using direct WordPress API for ${elementType}`);
      const { dispatch, select } = window.wp.data;
      const { insertBlocks } = dispatch('core/block-editor');
      const { getSelectedBlockClientId, getBlockInsertionPoint } = select('core/block-editor');
      
      const blocks = window.wp.blocks.parse(blockMarkup);
      
      if (blocks && blocks.length > 0) {
        const selectedBlockId = getSelectedBlockClientId();
        
        if (selectedBlockId) {
          const insertionPoint = getBlockInsertionPoint();
          insertBlocks(blocks, insertionPoint.index + 1, insertionPoint.rootClientId);
          console.log(`✅ Inserted ${elementType} after selected block`);
        } else {
          insertBlocks(blocks);
          console.log(`✅ Inserted ${elementType} at end`);
        }
        
        return true;
      }
    } catch (error) {
      console.error(`❌ Direct WordPress API failed for ${elementType}:`, error);
    }
  }
  
  console.error(`❌ All insertion methods failed for ${elementType}`);
  return false;
}

/**
 * Clear cached blocks (for testing or when API changes)
 */
export function clearBlockCache() {
  blockMarkupCache = {};
  try {
    localStorage.removeItem('umbral_element_blocks');
    localStorage.removeItem('umbral_element_blocks_timestamp');
    console.log('🗑️ Block cache cleared');
  } catch (error) {
    console.warn('Could not clear localStorage cache:', error);
  }
}

/**
 * Debug function - expose to window for testing
 */
export function debugElementInsertion() {
  window.debugElementInsertion = {
    insertElementBlock,
    getElementBlockMarkup,
    generateAllElementBlocks,
    clearBlockCache,
    initializeElementBlocks,
    areBlocksCached,
    checkBlockAPIAvailability: () => ({
      gbStyleInsertBlock: !!window.gbStyleInsertBlock,
      gbStyleBlockUtils: !!window.gbStyleBlockUtils,
      gbStyleInsertAsInnerBlock: !!window.gbStyleInsertAsInnerBlock,
      gbStyleAppendBlock: !!window.gbStyleAppendBlock,
      wp: !!window.wp,
      wpData: !!window.wp?.data,
      wpBlocks: !!window.wp?.blocks
    }),
    testInsertElement: (elementType) => {
      console.log(`🧪 Testing insertion of ${elementType}`);
      return insertElementBlock(elementType);
    }
  };
  console.log('🧪 Debug functions exposed to window.debugElementInsertion');
}