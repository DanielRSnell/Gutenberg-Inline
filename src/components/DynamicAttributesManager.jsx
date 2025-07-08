import React, { useState, useEffect } from 'react';
import { useBlockStore } from '../storage/store';
import * as Dialog from '@radix-ui/react-dialog';
import AceEditor from 'react-ace';

// Import Ace Editor modes and themes
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/mode-html';
import 'ace-builds/src-noconflict/mode-css';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/ext-language_tools';

/**
 * Dynamic Attributes Manager Component
 * Focuses on managing dynamicAttributes array with key/value pairs
 * Supports Ace Editor for complex values like Alpine.js expressions
 */
export function DynamicAttributesManager() {
  const { lastSelectedBlock, updateBlock } = useBlockStore();
  const [dynamicAttributes, setDynamicAttributes] = useState([]);
  const [newAttributeName, setNewAttributeName] = useState('');
  const [newAttributeValue, setNewAttributeValue] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [editorMode, setEditorMode] = useState('javascript');
  const [showModal, setShowModal] = useState(false);
  const [expandedPanels, setExpandedPanels] = useState(new Set());

  // Extract dynamicAttributes from block
  useEffect(() => {
    if (lastSelectedBlock?.attributes?.dynamicAttributes) {
      setDynamicAttributes(lastSelectedBlock.attributes.dynamicAttributes);
    } else {
      setDynamicAttributes([]);
    }
  }, [lastSelectedBlock]);

  // Add new dynamic attribute
  const addDynamicAttribute = () => {
    if (!newAttributeName.trim() || !lastSelectedBlock) return;

    const newAttribute = {
      name: newAttributeName.trim(),
      value: newAttributeValue.trim()
    };

    const updatedDynamicAttributes = [...dynamicAttributes, newAttribute];
    updateDynamicAttributes(updatedDynamicAttributes);
    
    // Clear form
    setNewAttributeName('');
    setNewAttributeValue('');
  };

  // Update dynamic attributes in block
  const updateDynamicAttributes = (updatedDynamicAttributes) => {
    setDynamicAttributes(updatedDynamicAttributes);

    const updatedAttributes = {
      ...lastSelectedBlock.attributes,
      dynamicAttributes: updatedDynamicAttributes
    };
    
    const updatedMarkup = {
      ...lastSelectedBlock.markup,
      attributes: updatedAttributes
    };

    updateBlock(lastSelectedBlock, updatedMarkup);
    updateGutenbergBlock(updatedAttributes);
  };

  // Remove dynamic attribute
  const removeDynamicAttribute = (index) => {
    const updatedDynamicAttributes = dynamicAttributes.filter((_, i) => i !== index);
    updateDynamicAttributes(updatedDynamicAttributes);
  };

  // Update existing dynamic attribute
  const updateDynamicAttribute = (index, name, value) => {
    const updatedDynamicAttributes = [...dynamicAttributes];
    updatedDynamicAttributes[index] = { name: name.trim(), value: value.trim() };
    updateDynamicAttributes(updatedDynamicAttributes);
  };

  // Open modal for editing value
  const openValueEditor = (index, currentValue) => {
    setEditingIndex(index);
    setEditingValue(currentValue);
    
    // Auto-detect mode based on content
    if (currentValue.includes('x-') || currentValue.includes('@')) {
      setEditorMode('javascript'); // Alpine.js
    } else if (currentValue.startsWith('{') || currentValue.startsWith('[')) {
      setEditorMode('json');
    } else if (currentValue.includes('<') && currentValue.includes('>')) {
      setEditorMode('html');
    } else {
      setEditorMode('javascript');
    }
    
    setShowModal(true);
  };

  // Save value from modal
  const saveValueFromModal = () => {
    if (editingIndex !== null) {
      const updatedDynamicAttributes = [...dynamicAttributes];
      updatedDynamicAttributes[editingIndex].value = editingValue;
      updateDynamicAttributes(updatedDynamicAttributes);
    }
    
    setShowModal(false);
    setEditingIndex(null);
    setEditingValue('');
  };

  // Update Gutenberg block
  const updateGutenbergBlock = (updatedAttributes) => {
    if (window.wp?.data && lastSelectedBlock?.id) {
      try {
        const { dispatch } = window.wp.data;
        dispatch('core/block-editor').updateBlockAttributes(lastSelectedBlock.id, updatedAttributes);
      } catch (error) {
        console.warn('Could not update Gutenberg block:', error);
      }
    }
  };

  // Toggle panel expansion
  const togglePanel = (index) => {
    const newExpanded = new Set(expandedPanels);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedPanels(newExpanded);
  };

  // Get preview of value (truncated)
  const getValuePreview = (value) => {
    if (value.length <= 40) return value;
    return value.substring(0, 37) + '...';
  };

  // Detect if value is complex enough to benefit from modal editor
  const isComplexValue = (value) => {
    return value.length > 50 || 
           value.includes('\n') || 
           value.includes('x-') || 
           value.includes('@') ||
           value.startsWith('{') ||
           value.startsWith('[');
  };

  // Get attribute type badge
  const getAttributeTypeBadge = (name) => {
    if (name.startsWith('x-')) return { label: 'Alpine', color: 'bg-green-100 text-green-800' };
    if (name.startsWith('@')) return { label: 'Event', color: 'bg-purple-100 text-purple-800' };
    if (name.startsWith('data-')) return { label: 'Data', color: 'bg-blue-100 text-blue-800' };
    if (name.startsWith('aria-')) return { label: 'Aria', color: 'bg-orange-100 text-orange-800' };
    return { label: 'HTML', color: 'bg-gray-100 text-gray-800' };
  };

  if (!lastSelectedBlock) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>No block selected</p>
        <p className="text-xs mt-1">Select a block to manage its dynamic attributes</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-medium text-gray-900">Dynamic Attributes</h3>
        <p className="text-sm text-gray-600 mt-1">
          Manage custom HTML attributes for this block. Perfect for Alpine.js directives, data attributes, and more.
        </p>
      </div>

      {/* Add New Attribute */}
      <div className="space-y-3 border border-gray-200 rounded-lg p-4 bg-gray-50">
        <h4 className="text-sm font-medium text-gray-700">Add Dynamic Attribute</h4>
        <div className="grid grid-cols-1 gap-3">
          <input
            type="text"
            value={newAttributeName}
            onChange={(e) => setNewAttributeName(e.target.value)}
            placeholder="Attribute name (e.g., x-data, @click, data-value)"
            className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="flex gap-2">
            <input
              type="text"
              value={newAttributeValue}
              onChange={(e) => setNewAttributeValue(e.target.value)}
              placeholder="Attribute value"
              className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={() => {
                setEditingIndex(-1);
                setEditingValue(newAttributeValue);
                setEditorMode('javascript');
                setShowModal(true);
              }}
              className="px-3 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
              title="Open in code editor"
            >
              📝
            </button>
          </div>
        </div>
        <button
          onClick={addDynamicAttribute}
          disabled={!newAttributeName.trim()}
          className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Add Dynamic Attribute
        </button>
      </div>

      {/* Existing Dynamic Attributes */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">
          Current Dynamic Attributes ({dynamicAttributes.length})
        </h4>
        
        {dynamicAttributes.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg">
            <p className="text-sm">No dynamic attributes found</p>
            <p className="text-xs mt-1">Add an attribute above to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            {dynamicAttributes.map((attr, index) => {
              const isExpanded = expandedPanels.has(index);
              const typeBadge = getAttributeTypeBadge(attr.name);
              
              return (
                <div key={index} className="border border-gray-200 rounded-lg bg-white">
                  {/* Panel Header - Always Visible */}
                  <div 
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => togglePanel(index)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Expand/Collapse Icon */}
                      <div className="text-gray-400 transition-transform duration-200">
                        {isExpanded ? '▼' : '▶'}
                      </div>
                      
                      {/* Attribute Name */}
                      <div className="font-mono text-sm font-medium text-gray-900 truncate">
                        {attr.name}
                      </div>
                      
                      {/* Type Badge */}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeBadge.color} flex-shrink-0`}>
                        {typeBadge.label}
                      </span>
                      
                      {/* Value Preview */}
                      <div className="text-sm text-gray-500 truncate flex-1 min-w-0">
                        {getValuePreview(attr.value)}
                      </div>
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="flex items-center gap-2 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openValueEditor(index, attr.value);
                        }}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        title="Open in code editor"
                      >
                        📝
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeDynamicAttribute(index);
                        }}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="Remove attribute"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  {/* Panel Content - Expandable */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 p-4 space-y-4 bg-gray-50">
                      {/* Attribute Name Editor */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Attribute Name:
                        </label>
                        <input
                          type="text"
                          value={attr.name}
                          onChange={(e) => updateDynamicAttribute(index, e.target.value, attr.value)}
                          placeholder="Attribute name"
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono bg-white"
                        />
                      </div>
                      
                      {/* Attribute Value Editor */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Attribute Value:
                        </label>
                        <div className="flex gap-2">
                          <textarea
                            value={attr.value}
                            onChange={(e) => updateDynamicAttribute(index, attr.name, e.target.value)}
                            placeholder="Attribute value"
                            rows={isComplexValue(attr.value) ? 4 : 2}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono bg-white"
                          />
                          <button
                            onClick={() => openValueEditor(index, attr.value)}
                            className="px-3 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors self-start"
                            title="Open in code editor"
                          >
                            📝
                          </button>
                        </div>
                        
                        {/* Alpine.js hint */}
                        {(attr.name.startsWith('x-') || attr.name.startsWith('@')) && (
                          <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                            💡 Alpine.js directive detected. Use the code editor for better syntax support.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Code Editor Modal */}
      <Dialog.Root open={showModal} onOpenChange={setShowModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="bg-black bg-opacity-50 fixed inset-0 z-50" />
          <Dialog.Content className="fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[900px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg z-50">
            <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
              Code Editor
              {editingIndex !== null && editingIndex >= 0 && (
                <span className="ml-2 text-sm text-gray-600">
                  ({dynamicAttributes[editingIndex]?.name})
                </span>
              )}
            </Dialog.Title>
            
            {/* Mode Selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language Mode:
              </label>
              <select
                value={editorMode}
                onChange={(e) => setEditorMode(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="javascript">JavaScript (Alpine.js)</option>
                <option value="json">JSON</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
              </select>
            </div>
            
            {/* Ace Editor */}
            <div className="border border-gray-300 rounded mb-4">
              <AceEditor
                mode={editorMode}
                theme="github"
                value={editingValue}
                onChange={setEditingValue}
                name="attribute-value-editor"
                editorProps={{ $blockScrolling: true }}
                width="100%"
                height="300px"
                fontSize={14}
                showPrintMargin={false}
                showGutter={true}
                highlightActiveLine={true}
                setOptions={{
                  enableBasicAutocompletion: true,
                  enableLiveAutocompletion: true,
                  enableSnippets: true,
                  showLineNumbers: true,
                  tabSize: 2,
                  useWorker: false
                }}
              />
            </div>
            
            {/* Modal Actions */}
            <div className="flex justify-end gap-3">
              <Dialog.Close asChild>
                <button className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
                  Cancel
                </button>
              </Dialog.Close>
              <button
                onClick={() => {
                  if (editingIndex === -1) {
                    // Adding new attribute from modal
                    setNewAttributeValue(editingValue);
                  } else {
                    // Saving existing attribute
                    saveValueFromModal();
                  }
                  setShowModal(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                {editingIndex === -1 ? 'Use Value' : 'Save Changes'}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}