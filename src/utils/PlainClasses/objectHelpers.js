/**
 * Safe object/string handling utilities for PlainClasses component
 * Prevents React "Objects are not valid as a React child" errors
 */

/**
 * Safely extracts display text from mixed object/string values
 * @param {object|string} item - The item to extract text from
 * @param {string} fallback - Fallback text if extraction fails
 * @returns {string} Safe display text
 */
export const getDisplayText = (item, fallback = 'Unknown') => {
  if (typeof item === 'string') {
    return item;
  }
  
  if (typeof item === 'object' && item !== null) {
    // Try common properties in order of preference
    if (item.label && typeof item.label === 'string') return item.label;
    if (item.shade && typeof item.shade === 'string') return item.shade;
    if (item.value && typeof item.value === 'string') return item.value;
    if (item.name && typeof item.name === 'string') return item.name;
    if (item.title && typeof item.title === 'string') return item.title;
    
    // Handle special cases
    if (item.shade === 'base') return 'base';
    if (item.opacity && typeof item.opacity === 'string') return item.opacity;
  }
  
  return fallback;
};

/**
 * Safely extracts click value from mixed object/string values
 * @param {object|string} item - The item to extract value from
 * @param {string} fallback - Fallback value if extraction fails
 * @returns {string} Safe click value
 */
export const getClickValue = (item, fallback = '') => {
  if (typeof item === 'string') {
    return item;
  }
  
  if (typeof item === 'object' && item !== null) {
    // Try common properties in order of preference
    if (item.value && typeof item.value === 'string') return item.value;
    if (item.shade && typeof item.shade === 'string') return item.shade;
    if (item.label && typeof item.label === 'string') return item.label;
    if (item.name && typeof item.name === 'string') return item.name;
  }
  
  return fallback;
};

/**
 * Safely extracts React key from mixed object/string values
 * @param {object|string} item - The item to extract key from
 * @param {number} index - Fallback index if extraction fails
 * @returns {string|number} Safe React key
 */
export const getReactKey = (item, index) => {
  if (typeof item === 'string') {
    return item;
  }
  
  if (typeof item === 'object' && item !== null) {
    // Try common properties in order of preference
    if (item.value && typeof item.value === 'string') return item.value;
    if (item.shade && typeof item.shade === 'string') return `${item.shade}-${index}`;
    if (item.label && typeof item.label === 'string') return item.label;
    if (item.name && typeof item.name === 'string') return item.name;
    if (item.id) return item.id;
  }
  
  return index;
};

/**
 * Safely checks if an item is an object (and not null or array)
 * @param {any} item - The item to check
 * @returns {boolean} True if item is a plain object
 */
export const isPlainObject = (item) => {
  return typeof item === 'object' && item !== null && !Array.isArray(item);
};

/**
 * Safely extracts a specific property from an object with type checking
 * @param {object|string} item - The item to extract from
 * @param {string} property - The property name to extract
 * @param {any} fallback - Fallback value if property doesn't exist or wrong type
 * @returns {any} The property value or fallback
 */
export const safeGetProperty = (item, property, fallback = null) => {
  if (!isPlainObject(item)) {
    return fallback;
  }
  
  const value = item[property];
  return value !== undefined ? value : fallback;
};

/**
 * Creates a safe render function for map operations
 * @param {function} renderFn - The render function to wrap
 * @returns {function} Safe render function that handles objects
 */
export const createSafeRenderer = (renderFn) => {
  return (item, index) => {
    try {
      return renderFn(item, index);
    } catch (error) {
      console.warn('Safe renderer caught error:', error, 'for item:', item);
      return null;
    }
  };
};

/**
 * Safely converts any value to a string for React rendering
 * @param {any} value - The value to convert
 * @returns {string} Safe string representation
 */
export const toSafeString = (value) => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return String(value);
  if (value === null || value === undefined) return '';
  
  // For objects, try to extract meaningful text
  if (isPlainObject(value)) {
    return getDisplayText(value, 'Object');
  }
  
  // For arrays, join them
  if (Array.isArray(value)) {
    return value.map(toSafeString).join(', ');
  }
  
  // Last resort
  return String(value);
};