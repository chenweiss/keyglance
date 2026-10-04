/** Available keys that can be assigned to thumb positions in matrix mode. */
export const THUMB_KEY_OPTIONS = [
  { id: 'Backspace', label: '⌫ Backspace' },
  { id: 'Meta', label: '⌘ Command' },
  { id: 'Enter', label: '⏎ Enter' },
  { id: ' ', label: '␣ Space' },
  { id: 'Tab', label: '⇥ Tab' },
  { id: 'Escape', label: '⎋ Escape' },
  { id: 'Delete', label: '⌦ Delete' },
  { id: 'Alt', label: '⌥ Option' },
  { id: 'Control', label: '⌃ Control' },
  { id: 'Shift', label: '⇧ Shift' },
] as const;

/** Display character for each thumb key id. */
export const THUMB_DISPLAY: Record<string, string> = {
  'Backspace': '⌫',
  'Meta': '⌘',
  'Enter': '⏎',
  ' ': '␣',
  'Tab': '⇥',
  'Escape': '⎋',
  'Delete': '⌦',
  'Alt': '⌥',
  'Control': '⌃',
  'Shift': '⇧',
};

export interface ThumbConfig {
  left: [string, string];
  right: [string, string];
}

/** Default thumb key configuration (matches the original hardcoded layout). */
export const DEFAULT_THUMBS: ThumbConfig = {
  left: ['Backspace', 'Meta'],
  right: ['Enter', ' '],
};

export const THUMBS_STORAGE_KEY = 'keyglance-thumbs';
