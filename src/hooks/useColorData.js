import { 
  COLOR_USAGE_CATEGORIES, 
  COLOR_CATEGORY_TO_PREFIX, 
  COLOR_USAGE_PRIORITY, 
  COLOR_EXCLUDE_LIST,
  TRANSPARENCY_OPTIONS 
} from '../utils/PlainClasses/constants.js';

/**
 * Hook for managing color-related data and operations
 */
export const useColorData = (getAutocompleteForPattern) => {

  /**
   * Get unique color bases from all autocomplete results
   * @returns {Promise<Array<string>>} Array of color base names
   */
  const getColorBases = async () => {
    const results = await getAutocompleteForPattern('');
    const colorItems = [];
    
    results.forEach(item => {
      if (item.color) {
        colorItems.push(item);
      }
    });
    
    const baseTokens = [];
    
    colorItems.forEach(item => {
      if (item.value) {
        const base = item.value.split('-')[1];
        if (base && baseTokens.indexOf(base) === -1 && COLOR_EXCLUDE_LIST.indexOf(base) === -1) {
          baseTokens.push(base);
        }
      }
    });
    
    return baseTokens.sort();
  };

  /**
   * Get shades for a specific color with color information
   * @param {string} colorBase - The color base name (e.g., 'amber', 'blue')
   * @returns {Promise<Array<object>>} Array of shade objects with {shade, color, value}
   */
  const getColorShades = async (colorBase) => {
    const results = await getAutocompleteForPattern(''); // Get everything
    const shadesMap = new Map();
    let hasBase = false;
    
    results.forEach(item => {
      if (item.color && item.value) {
        const parts = item.value.split('-'); // bg-amber-500 -> ['bg', 'amber', '500']
        if (parts.length >= 2 && parts[1] === colorBase && parts[0] === 'bg') {
          if (parts.length === 2) {
            // This is a base color like bg-black, bg-white
            hasBase = true;
            shadesMap.set('base', {
              shade: 'base',
              color: item.color,
              value: item.value
            });
          } else if (parts.length >= 3) {
            const shade = parts[2];
            if (/^\d+$/.test(shade) && !shadesMap.has(shade)) {
              shadesMap.set(shade, {
                shade: shade,
                color: item.color,
                value: item.value
              });
            }
          }
        }
      }
    });
    
    // Convert map to array and sort
    const shadeObjects = Array.from(shadesMap.values());
    const numberedShades = shadeObjects
      .filter(s => s.shade !== 'base')
      .sort((a, b) => parseInt(a.shade) - parseInt(b.shade));
    
    const baseShade = shadeObjects.find(s => s.shade === 'base');
    const finalShades = baseShade ? [baseShade, ...numberedShades] : numberedShades;
    
    return finalShades;
  };

  /**
   * Get available usage categories for a color + shade
   * @param {string} colorBase - The color base name
   * @param {string} shade - The shade value ('base' or number string)
   * @returns {Promise<Array<string>>} Array of usage category names
   */
  const getColorUsageCategories = async (colorBase, shade) => {
    const results = await getAutocompleteForPattern(''); // Get everything
    const availableCategories = new Set();
    
    results.forEach(item => {
      if (item.color && item.value) {
        const parts = item.value.split('-'); // bg-amber-500 -> ['bg', 'amber', '500']
        
        let matches = false;
        if (shade === 'base') {
          // For base colors like black, white - match bg-black, text-white (only 2 parts)
          matches = parts.length === 2 && parts[1] === colorBase;
        } else {
          // For numbered shades - match bg-amber-500 (3+ parts)
          matches = parts.length >= 3 && parts[1] === colorBase && parts[2] === shade;
        }
        
        if (matches) {
          const prefix = parts[0]; // bg, text, border, etc.
          const categoryName = COLOR_USAGE_CATEGORIES[prefix] || prefix;
          availableCategories.add(categoryName);
        }
      }
    });
    
    // Convert to array and sort by priority
    const sortedCategories = Array.from(availableCategories).sort((a, b) => {
      const aIndex = COLOR_USAGE_PRIORITY.indexOf(a);
      const bIndex = COLOR_USAGE_PRIORITY.indexOf(b);
      
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      } else if (aIndex !== -1) {
        return -1;
      } else if (bIndex !== -1) {
        return 1;
      } else {
        return a.localeCompare(b);
      }
    });
    
    return sortedCategories;
  };

  /**
   * Get transparency options for a specific usage
   * @param {string} colorBase - The color base name
   * @param {string} shade - The shade value ('base' or number string)
   * @param {string} usageCategory - The usage category name (e.g., 'Background')
   * @returns {Array<object>} Array of transparency option objects
   */
  const getColorTransparencyOptions = (colorBase, shade, usageCategory) => {
    const prefix = COLOR_CATEGORY_TO_PREFIX[usageCategory] || usageCategory.toLowerCase();
    
    let baseClass;
    if (shade === 'base') {
      baseClass = `${prefix}-${colorBase}`;
    } else {
      baseClass = `${prefix}-${colorBase}-${shade}`;
    }
    
    // Return base class and transparency options
    return TRANSPARENCY_OPTIONS.map(option => ({
      value: baseClass + option.value,
      label: option.label,
      opacity: option.opacity
    }));
  };

  return {
    getColorBases,
    getColorShades,
    getColorUsageCategories,
    getColorTransparencyOptions
  };
};