import { useState } from 'react';
import { getDisplayText } from '../utils/PlainClasses/objectHelpers.js';

/**
 * Hook for managing quick panel navigation state and logic
 */
export const useQuickPanel = () => {
  const [activeQuickPanel, setActiveQuickPanel] = useState(null);
  const [panelStep, setPanelStep] = useState(1); // 1: categories, 2: items, 3: usage, 4: transparency (colors only)
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryItems, setCategoryItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemOptions, setItemOptions] = useState([]);
  const [selectedUsage, setSelectedUsage] = useState(null);

  /**
   * Reset panel state to initial values
   */
  const resetPanelState = () => {
    setPanelStep(1);
    setSelectedCategory(null);
    setSelectedItem(null);
    setSelectedUsage(null);
    setCategoryItems([]);
    setItemOptions([]);
  };

  /**
   * Handle quick panel navigation
   * @param {string} panelId - Panel ID to open
   * @param {Function} loadStepOneData - Function to load step 1 data for the panel
   */
  const handleQuickPanelClick = async (panelId, loadStepOneData) => {
    if (activeQuickPanel === panelId) {
      // Close panel
      setActiveQuickPanel(null);
      resetPanelState();
    } else {
      // Open panel and load step 1 data
      setActiveQuickPanel(panelId);
      resetPanelState();
      
      if (loadStepOneData) {
        const stepOneData = await loadStepOneData(panelId);
        setCategoryItems(stepOneData || []);
      }
    }
  };

  /**
   * Handle category selection (step 2)
   * @param {string} category - Selected category
   * @param {Function} loadStepTwoData - Function to load step 2 data
   */
  const handleCategorySelect = async (category, loadStepTwoData) => {
    setSelectedCategory(category);
    setPanelStep(2);
    
    if (loadStepTwoData) {
      const stepTwoData = await loadStepTwoData(activeQuickPanel, category);
      setItemOptions(stepTwoData || []);
    }
  };

  /**
   * Handle item selection (step 3)
   * @param {string|object} item - Selected item
   * @param {Function} loadStepThreeData - Function to load step 3 data
   */
  const handleItemSelect = async (item, loadStepThreeData) => {
    setSelectedItem(item);
    setPanelStep(3);
    
    if (loadStepThreeData) {
      const stepThreeData = await loadStepThreeData(activeQuickPanel, selectedCategory, item);
      setItemOptions(stepThreeData || []);
    }
  };

  /**
   * Handle usage selection (step 4 for colors)
   * @param {string} usage - Selected usage
   * @param {Function} loadStepFourData - Function to load step 4 data
   */
  const handleUsageSelect = async (usage, loadStepFourData) => {
    setSelectedUsage(usage);
    setPanelStep(4);
    
    if (loadStepFourData) {
      const stepFourData = await loadStepFourData(selectedCategory, selectedItem, usage);
      setItemOptions(stepFourData || []);
    }
  };

  /**
   * Navigate back to a specific step
   * @param {number} step - Step number to navigate to
   */
  const navigateToStep = (step) => {
    if (step === 1) {
      setPanelStep(1);
      setSelectedCategory(null);
      setSelectedItem(null);
      setSelectedUsage(null);
    } else if (step === 2) {
      setPanelStep(2);
      setSelectedItem(null);
      setSelectedUsage(null);
    } else if (step === 3) {
      setPanelStep(3);
      setSelectedUsage(null);
    }
  };

  /**
   * Get display text for breadcrumb navigation
   * @param {any} item - Item to get display text for
   * @returns {string} Safe display text
   */
  const getItemDisplayText = (item) => {
    return getDisplayText(item, 'Item');
  };

  return {
    // State
    activeQuickPanel,
    panelStep,
    selectedCategory,
    categoryItems,
    selectedItem,
    itemOptions,
    selectedUsage,
    
    // Actions
    setActiveQuickPanel,
    setPanelStep,
    setCategoryItems,
    setItemOptions,
    resetPanelState,
    handleQuickPanelClick,
    handleCategorySelect,
    handleItemSelect,
    handleUsageSelect,
    navigateToStep,
    getItemDisplayText
  };
};