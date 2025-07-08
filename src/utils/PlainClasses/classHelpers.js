/**
 * CSS class manipulation utilities for PlainClasses component
 */

/**
 * Adds a CSS class with breakpoint prefix if not already present
 * @param {string} className - The base class name
 * @param {string} breakpointPrefix - The breakpoint prefix (e.g., 'md:')
 * @param {string[]} existingClasses - Array of existing classes
 * @returns {string[]} Updated classes array
 */
export const addClassWithBreakpoint = (className, breakpointPrefix = '', existingClasses = []) => {
  const prefixedClass = breakpointPrefix + className;
  
  if (!existingClasses.includes(prefixedClass)) {
    return [...existingClasses, prefixedClass];
  }
  
  return existingClasses;
};

/**
 * Removes a CSS class from the classes array
 * @param {string} className - The class name to remove
 * @param {string[]} existingClasses - Array of existing classes
 * @returns {string[]} Updated classes array
 */
export const removeClass = (className, existingClasses = []) => {
  return existingClasses.filter(cls => cls !== className);
};

/**
 * Converts a space-separated class string to an array
 * @param {string} classString - Space-separated class string
 * @returns {string[]} Array of class names
 */
export const classStringToArray = (classString = '') => {
  return classString.trim() ? classString.split(/\s+/) : [];
};

/**
 * Converts an array of class names to a space-separated string
 * @param {string[]} classArray - Array of class names
 * @returns {string} Space-separated class string
 */
export const classArrayToString = (classArray = []) => {
  return classArray.filter(cls => cls && cls.trim()).join(' ');
};

/**
 * Validates a CSS class name
 * @param {string} className - The class name to validate
 * @returns {string|null} Error message or null if valid
 */
export const validateClassName = (className) => {
  if (!className || className.length < 1) {
    return 'Class name too short';
  }
  
  if (!/^[a-zA-Z_-]/.test(className)) {
    return 'Class name must start with a letter, underscore, or hyphen';
  }
  
  // Allow colons for Tailwind responsive prefixes like md:, lg:, hover:, etc.
  if (!/^[a-zA-Z0-9_:-]+$/.test(className)) {
    return 'Class name contains invalid characters';
  }
  
  return null;
};

/**
 * Checks if a class name has a breakpoint prefix
 * @param {string} className - The class name to check
 * @returns {boolean} True if class has breakpoint prefix
 */
export const hasBreakpointPrefix = (className) => {
  const breakpointPrefixes = ['sm:', 'md:', 'lg:', 'xl:', '2xl:'];
  return breakpointPrefixes.some(prefix => className.startsWith(prefix));
};

/**
 * Extracts the base class name without breakpoint prefix
 * @param {string} className - The class name
 * @returns {string} Base class name without prefix
 */
export const getBaseClassName = (className) => {
  const colonIndex = className.indexOf(':');
  return colonIndex !== -1 ? className.substring(colonIndex + 1) : className;
};

/**
 * Gets current classes from block attributes
 * @param {object} blockAttributes - Block attributes object
 * @returns {string[]} Array of current class names
 */
export const getCurrentClasses = (blockAttributes = {}) => {
  const classString = blockAttributes.className || 
                     blockAttributes.class || 
                     blockAttributes.cssClassName || 
                     '';
  return classStringToArray(classString);
};

/**
 * Checks if a class (with current breakpoint) is active in the token list
 * @param {string} className - The base class name (e.g., 'border-2')
 * @param {string} breakpointPrefix - Current breakpoint prefix (e.g., 'md:')
 * @param {string[]} tokenValues - Array of current class tokens
 * @returns {boolean} True if the class is currently active
 */
export const isClassActive = (className, breakpointPrefix = '', tokenValues = []) => {
  const fullClass = breakpointPrefix + className;
  return tokenValues.includes(fullClass);
};

/**
 * Toggles a class in the token values array
 * @param {string} className - The base class name to toggle
 * @param {string} breakpointPrefix - Current breakpoint prefix
 * @param {string[]} currentTokens - Current token values
 * @returns {string[]} Updated token values array
 */
export const toggleClass = (className, breakpointPrefix = '', currentTokens = []) => {
  const fullClass = breakpointPrefix + className;
  
  if (currentTokens.includes(fullClass)) {
    // Remove the class
    return currentTokens.filter(token => token !== fullClass);
  } else {
    // Add the class
    return [...currentTokens, fullClass];
  }
};

/**
 * Removes a specific class from token values
 * @param {string} className - The class name to remove
 * @param {string[]} currentTokens - Current token values
 * @returns {string[]} Updated token values array
 */
export const removeClassFromTokens = (className, currentTokens = []) => {
  return currentTokens.filter(token => token !== className);
};