/**
 * Constants and configuration for PlainClasses component
 */

export const BREAKPOINTS = [
  { value: '', label: 'Base', description: 'No prefix' },
  { value: 'sm:', label: 'SM', description: '640px+' },
  { value: 'md:', label: 'MD', description: '768px+' },
  { value: 'lg:', label: 'LG', description: '1024px+' },
  { value: 'xl:', label: 'XL', description: '1280px+' },
  { value: '2xl:', label: '2XL', description: '1536px+' }
];

export const QUICK_ACTIONS = [
  { id: 'colors', label: 'Colors', icon: '🎨' },
  { id: 'layout', label: 'Layout', icon: '📐' },
  { id: 'spacing', label: 'Spacing', icon: '📏' },
  { id: 'typography', label: 'Typography', icon: '✍️' },
  { id: 'border', label: 'Border', icon: '🔲' },
  { id: 'shadow', label: 'Shadow', icon: '💭' }
];

// Layout control definitions - user-friendly labels with search terms
export const LAYOUT_CONTROLS = {
  'Flexbox': {
    'Flex Display': 'flex',
    'Flex Direction': 'flex-',
    'Justify Content': 'justify-',
    'Align Items': 'items-',
    'Align Self': 'self-',
    'Flex Wrap': 'flex-wrap',
    'Flex Grow/Shrink': 'flex-'
  },
  'Grid': {
    'Grid Display': 'grid',
    'Grid Template Columns': 'grid-cols-',
    'Grid Template Rows': 'grid-rows-',
    'Grid Column Span': 'col-span-',
    'Grid Row Span': 'row-span-',
    'Grid Gap': 'gap-',
    'Grid Column Gap': 'gap-x-',
    'Grid Row Gap': 'gap-y-'
  },
  'Display': {
    'Display Types': 'block'
  },
  'Position': {
    'Position Types': 'static'
  },
  'Overflow': {
    'Overflow': 'overflow-',
    'Overflow X': 'overflow-x-',
    'Overflow Y': 'overflow-y-'
  },
  'Z-Index': {
    'Z Index': 'z-'
  }
};

// Spacing control definitions
export const SPACING_CONTROLS = {
  'Padding': {
    'All Sides': 'p-',
    'Horizontal (Left & Right)': 'px-',
    'Vertical (Top & Bottom)': 'py-',
    'Top': 'pt-',
    'Bottom': 'pb-',
    'Left': 'pl-',
    'Right': 'pr-'
  },
  'Margin': {
    'All Sides': 'm-',
    'Horizontal (Left & Right)': 'mx-',
    'Vertical (Top & Bottom)': 'my-',
    'Top': 'mt-',
    'Bottom': 'mb-',
    'Left': 'ml-',
    'Right': 'mr-'
  },
  'Width': {
    'Width': 'w-',
    'Min Width': 'min-w-',
    'Max Width': 'max-w-'
  },
  'Height': {
    'Height': 'h-',
    'Min Height': 'min-h-',
    'Max Height': 'max-h-'
  },
  'Size': {
    'Size (Width & Height)': 'size-'
  },
  'Space Between': {
    'Space X (Horizontal)': 'space-x-',
    'Space Y (Vertical)': 'space-y-'
  },
  'Position Offsets': {
    'Top': 'top-',
    'Bottom': 'bottom-',
    'Left': 'left-',
    'Right': 'right-',
    'Inset (All Sides)': 'inset-',
    'Inset X (Left & Right)': 'inset-x-',
    'Inset Y (Top & Bottom)': 'inset-y-'
  }
};

// Typography control definitions
export const TYPOGRAPHY_CONTROLS = {
  'Font Family': {
    'Font Family': 'font-sans'
  },
  'Font Size': {
    'Font Size': 'text-xs'
  },
  'Font Weight': {
    'Font Weight': 'font-'
  },
  'Line Height': {
    'Line Height': 'leading-'
  },
  'Letter Spacing': {
    'Letter Spacing': 'tracking-'
  },
  'Text Alignment': {
    'Text Align': 'text-left'
  },
  'Text Transform': {
    'Text Transform': 'uppercase'
  },
  'Text Decoration': {
    'Text Decoration': 'underline'
  }
};

// Border control definitions
export const BORDER_CONTROLS = {
  'Border Width': {
    'All Sides': 'border-',
    'Top': 'border-t-',
    'Bottom': 'border-b-',
    'Left': 'border-l-',
    'Right': 'border-r-',
    'Horizontal (Left & Right)': 'border-x-',
    'Vertical (Top & Bottom)': 'border-y-'
  },
  'Border Style': {
    'Border Style': 'border-solid'
  },
  'Border Radius': {
    'All Corners': 'rounded-',
    'Top Left': 'rounded-tl-',
    'Top Right': 'rounded-tr-',
    'Bottom Left': 'rounded-bl-',
    'Bottom Right': 'rounded-br-',
    'Top (Left & Right)': 'rounded-t-',
    'Bottom (Left & Right)': 'rounded-b-',
    'Left (Top & Bottom)': 'rounded-l-',
    'Right (Top & Bottom)': 'rounded-r-'
  },
  'Divide': {
    'Divide Width X': 'divide-x-',
    'Divide Width Y': 'divide-y-',
    'Divide Style': 'divide-solid'
  },
  'Outline': {
    'Outline Width': 'outline-',
    'Outline Style': 'outline-solid',
    'Outline Offset': 'outline-offset-'
  }
};

// Shadow control definitions
export const SHADOW_CONTROLS = {
  'Box Shadow': {
    'Box Shadow': 'shadow-'
  },
  'Drop Shadow': {
    'Drop Shadow': 'drop-shadow-'
  },
  'Inner Shadow': {
    'Inner Shadow': 'shadow-inner'
  },
  'Ring': {
    'Ring Width': 'ring-',
    'Ring Opacity': 'ring-opacity-',
    'Ring Offset Width': 'ring-offset-'
  },
  'Backdrop Effects': {
    'Backdrop Blur': 'backdrop-blur-',
    'Backdrop Brightness': 'backdrop-brightness-',
    'Backdrop Contrast': 'backdrop-contrast-',
    'Backdrop Grayscale': 'backdrop-grayscale',
    'Backdrop Hue Rotate': 'backdrop-hue-rotate-',
    'Backdrop Invert': 'backdrop-invert',
    'Backdrop Opacity': 'backdrop-opacity-',
    'Backdrop Saturate': 'backdrop-saturate-',
    'Backdrop Sepia': 'backdrop-sepia'
  }
};

// Color usage categories mapping
export const COLOR_USAGE_CATEGORIES = {
  'bg': 'Background',
  'text': 'Text',
  'border': 'Border', 
  'ring': 'Ring',
  'shadow': 'Shadow',
  'outline': 'Outline',
  'accent': 'Accent',
  'caret': 'Caret',
  'decoration': 'Decoration',
  'divide': 'Divide',
  'from': 'Gradient From',
  'to': 'Gradient To',
  'via': 'Gradient Via'
};

// Reverse mapping for color usage
export const COLOR_CATEGORY_TO_PREFIX = {
  'Background': 'bg',
  'Text': 'text',
  'Border': 'border',
  'Ring': 'ring',
  'Shadow': 'shadow',
  'Outline': 'outline',
  'Accent': 'accent',
  'Caret': 'caret',
  'Decoration': 'decoration',
  'Divide': 'divide',
  'Gradient From': 'from',
  'Gradient To': 'to',
  'Gradient Via': 'via'
};

// Priority order for color usage categories
export const COLOR_USAGE_PRIORITY = [
  'Background', 'Text', 'Border', 'Ring', 'Shadow', 'Outline'
];

// Transparency options
export const TRANSPARENCY_OPTIONS = [
  { value: '', label: 'Normal', opacity: '100%' },
  { value: '/90', label: '90%', opacity: '90%' },
  { value: '/80', label: '80%', opacity: '80%' },
  { value: '/70', label: '70%', opacity: '70%' },
  { value: '/60', label: '60%', opacity: '60%' },
  { value: '/50', label: '50%', opacity: '50%' },
  { value: '/40', label: '40%', opacity: '40%' },
  { value: '/30', label: '30%', opacity: '30%' },
  { value: '/20', label: '20%', opacity: '20%' },
  { value: '/10', label: '10%', opacity: '10%' }
];

// Color exclude list for filtering
export const COLOR_EXCLUDE_LIST = [
  'b', 'e', 'l', 'r', 's', 't', 'x', 'y', 'shadow', 'color', 'ring', 
  'conic', 'linear', 'radial', 'offset', 'dark', 'light', 'normal', 'only', 'initial'
];

// Tailwind color mapping for swatches
export const TAILWIND_COLOR_MAP = {
  'bg-amber-50': '#fffbeb',
  'bg-amber-100': '#fef3c7',
  'bg-amber-200': '#fde68a',
  'bg-amber-300': '#fcd34d',
  'bg-amber-400': '#fbbf24',
  'bg-amber-500': '#f59e0b',
  'bg-amber-600': '#d97706',
  'bg-amber-700': '#b45309',
  'bg-amber-800': '#92400e',
  'bg-amber-900': '#78350f',
  'bg-amber-950': '#451a03',
  'bg-blue-50': '#eff6ff',
  'bg-blue-100': '#dbeafe',
  'bg-blue-200': '#bfdbfe',
  'bg-blue-300': '#93c5fd',
  'bg-blue-400': '#60a5fa',
  'bg-blue-500': '#3b82f6',
  'bg-blue-600': '#2563eb',
  'bg-blue-700': '#1d4ed8',
  'bg-blue-800': '#1e40af',
  'bg-blue-900': '#1e3a8a',
  'bg-blue-950': '#172554',
  'bg-red-50': '#fef2f2',
  'bg-red-100': '#fee2e2',
  'bg-red-200': '#fecaca',
  'bg-red-300': '#fca5a5',
  'bg-red-400': '#f87171',
  'bg-red-500': '#ef4444',
  'bg-red-600': '#dc2626',
  'bg-red-700': '#b91c1c',
  'bg-red-800': '#991b1b',
  'bg-red-900': '#7f1d1d',
  'bg-red-950': '#450a0a',
  'bg-green-50': '#f0fdf4',
  'bg-green-100': '#dcfce7',
  'bg-green-200': '#bbf7d0',
  'bg-green-300': '#86efac',
  'bg-green-400': '#4ade80',
  'bg-green-500': '#22c55e',
  'bg-green-600': '#16a34a',
  'bg-green-700': '#15803d',
  'bg-green-800': '#166534',
  'bg-green-900': '#14532d',
  'bg-green-950': '#052e16',
  'bg-black': '#000000',
  'bg-white': '#ffffff',
  'bg-gray-50': '#f9fafb',
  'bg-gray-100': '#f3f4f6',
  'bg-gray-200': '#e5e7eb',
  'bg-gray-300': '#d1d5db',
  'bg-gray-400': '#9ca3af',
  'bg-gray-500': '#6b7280',
  'bg-gray-600': '#4b5563',
  'bg-gray-700': '#374151',
  'bg-gray-800': '#1f2937',
  'bg-gray-900': '#111827',
  'bg-gray-950': '#030712'
};