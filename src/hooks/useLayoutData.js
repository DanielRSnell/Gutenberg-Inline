import { LAYOUT_CONTROLS, SPACING_CONTROLS, TYPOGRAPHY_CONTROLS, BORDER_CONTROLS, SHADOW_CONTROLS } from '../utils/PlainClasses/constants.js';

/**
 * Hook for managing layout, spacing, and typography data
 */
export const useLayoutData = (getAutocompleteForPattern) => {

  /**
   * Get layout categories
   * @returns {Array<string>} Array of layout category names
   */
  const getLayoutCategories = () => {
    return Object.keys(LAYOUT_CONTROLS);
  };

  /**
   * Get spacing categories  
   * @returns {Array<string>} Array of spacing category names
   */
  const getSpacingCategories = () => {
    return Object.keys(SPACING_CONTROLS);
  };

  /**
   * Get typography categories
   * @returns {Array<string>} Array of typography category names
   */
  const getTypographyCategories = () => {
    return Object.keys(TYPOGRAPHY_CONTROLS);
  };

  /**
   * Get border categories
   * @returns {Array<string>} Array of border category names
   */
  const getBorderCategories = () => {
    return Object.keys(BORDER_CONTROLS);
  };

  /**
   * Get shadow categories
   * @returns {Array<string>} Array of shadow category names
   */
  const getShadowCategories = () => {
    return Object.keys(SHADOW_CONTROLS);
  };

  /**
   * Get subcategories for a main category
   * @param {string} category - The main category name
   * @param {string} panelType - The panel type ('layout', 'spacing', 'typography', 'border', 'shadow')
   * @returns {object} Object with subcategory mappings
   */
  const getSubcategories = (category, panelType) => {
    if (panelType === 'layout') {
      return LAYOUT_CONTROLS[category] || {};
    } else if (panelType === 'spacing') {
      return SPACING_CONTROLS[category] || {};
    } else if (panelType === 'typography') {
      return TYPOGRAPHY_CONTROLS[category] || {};
    } else if (panelType === 'border') {
      return BORDER_CONTROLS[category] || {};
    } else if (panelType === 'shadow') {
      return SHADOW_CONTROLS[category] || {};
    }
    return {};
  };

  /**
   * Special handling for certain search terms that need broader searches
   * @param {string} searchTerm - The search term to process
   * @returns {Promise<Array<string>>} Array of filtered class names
   */
  const getLayoutItems = async (searchTerm) => {
    let actualSearchTerm = searchTerm;
    
    // Handle special cases where we want to search more broadly or filter results
    switch (searchTerm) {
      case 'block':
        // Search for display-related classes
        actualSearchTerm = 'block';
        break;
      case 'static':
        // Search for position-related classes  
        actualSearchTerm = 'static';
        break;
      case 'flex':
        // Search for flex-related classes
        actualSearchTerm = 'flex';
        break;
      case 'grid':
        // Search for grid-related classes
        actualSearchTerm = 'grid';
        break;
      case 'flex-wrap':
        // Search for flex-wrap related classes
        actualSearchTerm = 'flex-wrap';
        break;
      case 'font-sans':
        // Search for font-family classes
        actualSearchTerm = 'font-sans';
        break;
      case 'text-left':
        // Search for text-align classes
        actualSearchTerm = 'text-left';
        break;
      case 'uppercase':
        // Search for text-transform classes
        actualSearchTerm = 'uppercase';
        break;
      case 'underline':
        // Search for text-decoration classes
        actualSearchTerm = 'underline';
        break;
      case 'text-xs':
        // Search for font-size classes
        actualSearchTerm = 'text-xs';
        break;
      case 'border-solid':
        // Search for border-style classes
        actualSearchTerm = 'border-solid';
        break;
      case 'divide-solid':
        // Search for divide-style classes
        actualSearchTerm = 'divide-solid';
        break;
      case 'outline-solid':
        // Search for outline-style classes
        actualSearchTerm = 'outline-solid';
        break;
      case 'shadow-inner':
        // Search for inner shadow classes
        actualSearchTerm = 'shadow-inner';
        break;
      case 'backdrop-grayscale':
        // Search for backdrop-grayscale classes
        actualSearchTerm = 'backdrop-grayscale';
        break;
      case 'backdrop-invert':
        // Search for backdrop-invert classes
        actualSearchTerm = 'backdrop-invert';
        break;
      case 'backdrop-sepia':
        // Search for backdrop-sepia classes
        actualSearchTerm = 'backdrop-sepia';
        break;
      default:
        // For prefix searches like 'p-', 'justify-', 'text-', 'font-', etc., use as-is
        actualSearchTerm = searchTerm;
    }
    
    const results = await getAutocompleteForPattern(actualSearchTerm);
    
    // Special filtering for certain search terms
    let filteredResults = results;
    
    if (searchTerm === 'text-xs') {
      // For font size searches, we want size classes only
      filteredResults = results.filter(item => {
        const value = item.value || item;
        return value.match(/^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)$/);
      });
    } else if (searchTerm === 'text-left') {
      // For text align searches, we want alignment classes only
      filteredResults = results.filter(item => {
        const value = item.value || item;
        return value.match(/^text-(left|center|right|justify|start|end)$/);
      });
    } else if (searchTerm === 'font-') {
      // For font- searches, we want weight/family classes, not size classes
      filteredResults = results.filter(item => {
        const value = item.value || item;
        return value.match(/^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black|sans|serif|mono)$/);
      });
    }
    
    return filteredResults.map(item => item.value || item).sort();
  };

  return {
    getLayoutCategories,
    getSpacingCategories,
    getTypographyCategories,
    getBorderCategories,
    getShadowCategories,
    getSubcategories,
    getLayoutItems
  };
};