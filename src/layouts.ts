export interface KeyboardLayout {
  name: string;
  // Rows from the number/symbol row down to the bottom row; `null` marks a
  // position without a key so that columns stay aligned across rows.
  left: (string | null)[][];
  right: (string | null)[][];
  shiftedLeft: (string | null)[][];
  shiftedRight: (string | null)[][];
}

export const HOME_ROW_INDEX = 2;

// Finger assignment based on column position. The left half has an extra
// outer pinky column; the right half has three extra outer pinky columns.
export const FINGERS: Record<'left' | 'right', string[]> = {
  left: ['left-pinky', 'left-pinky', 'left-ring', 'left-middle', 'left-index', 'left-index'],
  right: [
    'right-index', 'right-index', 'right-middle', 'right-ring',
    'right-pinky', 'right-pinky', 'right-pinky', 'right-pinky',
  ],
};

// Columns of the home row that carry a homing bump (pinky→index / index→pinky)
export const HOMING_COLUMNS: Record<'left' | 'right', number[]> = {
  left: [1, 2, 3, 4],
  right: [1, 2, 3, 4],
};

// ---------------------------------------------------------------------------
// Layout definition
// ---------------------------------------------------------------------------

export const GRAPHITE: KeyboardLayout = {
  name: 'Graphite',
  left: [
    ['`', '1', '2', '3', '4', '5'],
    [null, 'b', 'l', 'd', 'w', 'z'],
    [null, 'n', 'r', 't', 's', 'g'],
    [null, 'q', 'x', 'm', 'c', 'v'],
  ],
  right: [
    ['6', '7', '8', '9', '0', '[', ']', null],
    ["'", 'f', 'o', 'u', 'j', ';', '=', '\\'],
    ['y', 'h', 'a', 'e', 'i', ',', null, null],
    ['k', 'p', '.', '-', '/', null, null, null],
  ],
  shiftedLeft: [
    ['~', '!', '@', '#', '$', '%'],
    [null, 'B', 'L', 'D', 'W', 'Z'],
    [null, 'N', 'R', 'T', 'S', 'G'],
    [null, 'Q', 'X', 'M', 'C', 'V'],
  ],
  shiftedRight: [
    ['^', '&', '*', '(', ')', '{', '}', null],
    ['_', 'F', 'O', 'U', 'J', ':', '+', '|'],
    ['Y', 'H', 'A', 'E', 'I', '?', null, null],
    ['K', 'P', '>', '"', '<', null, null, null],
  ],
};

/**
 * Get the key names (as sent by the native key listener, e.g. "A", "/")
 * present in a layout, for checking if a key event should activate the
 * keyboard overlay. Every unshifted character in the layout is the base
 * character of a US ANSI key, so it maps directly to a key name.
 */
export function getLayoutKeys(layout: KeyboardLayout): Set<string> {
  const keys = new Set<string>();
  for (const side of ['left', 'right'] as const) {
    for (const row of layout[side]) {
      for (const key of row) {
        if (key !== null) keys.add(key.toUpperCase());
      }
    }
  }
  return keys;
}
