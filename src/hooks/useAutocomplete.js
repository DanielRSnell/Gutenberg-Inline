import { useState } from 'react';

/**
 * Hook for managing WindPress autocomplete functionality
 */
export const useAutocomplete = () => {
  const [autocompleteResults, setAutocompleteResults] = useState([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);

  /**
   * Get autocomplete results for a specific pattern
   * @param {string} pattern - Search pattern
   * @returns {Promise<Array>} Autocomplete results
   */
  const getAutocompleteForPattern = async (pattern) => {
    if (!window.windpress?.module?.autocomplete?.query) {
      return [];
    }
    
    try {
      const results = await window.windpress.module.autocomplete.query(pattern);
      
      if (Array.isArray(results)) {
        return results;
      } else if (results && typeof results === 'object') {
        const possibleResults = results.results || results.data || results.items || results.suggestions || [];
        return Array.isArray(possibleResults) ? possibleResults : [];
      }
      
      return [];
    } catch (error) {
      return [];
    }
  };

  /**
   * Handle autocomplete search with UI updates
   * @param {string} inputValue - Input value to search for
   * @returns {Promise<Array>} Processed autocomplete results
   */
  const handleAutocomplete = async (inputValue) => {
    if (!inputValue || inputValue.length < 2) {
      setAutocompleteResults([]);
      setShowAutocomplete(false);
      return [];
    }
    
    // Check if WindPress autocomplete is available
    if (window.windpress?.module?.autocomplete?.query) {
      try {
        const results = await window.windpress.module.autocomplete.query(inputValue);
        
        // Check if results exist and have data
        if (results && typeof results === 'object') {
          if (Array.isArray(results)) {
            // Limit to 30 results as requested
            const limitedResults = results.slice(0, 30);
            
            setAutocompleteResults(limitedResults);
            setShowAutocomplete(limitedResults.length > 0);
            return limitedResults.map(result => result.value || result);
          } else {
            // Try common property names for results
            const possibleResults = results.results || results.data || results.items || results.suggestions || [];
            
            if (Array.isArray(possibleResults) && possibleResults.length > 0) {
              const limitedResults = possibleResults.slice(0, 30);
              setAutocompleteResults(limitedResults);
              setShowAutocomplete(true);
              return limitedResults.map(result => result.value || result);
            } else {
              setShowAutocomplete(false);
              return [];
            }
          }
        } else {
          setShowAutocomplete(false);
          return [];
        }
      } catch (error) {
        setShowAutocomplete(false);
        return [];
      }
    } else {
      setShowAutocomplete(false);
      return [];
    }
  };

  /**
   * Hide autocomplete dropdown
   */
  const hideAutocomplete = () => {
    setShowAutocomplete(false);
    setAutocompleteResults([]);
  };

  return {
    autocompleteResults,
    showAutocomplete,
    getAutocompleteForPattern,
    handleAutocomplete,
    hideAutocomplete,
    setAutocompleteResults,
    setShowAutocomplete
  };
};