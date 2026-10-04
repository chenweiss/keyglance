// Standard US ANSI shift mapping for the non-alpha keys
export const SHIFT_MAP: Record<string, string> = {
  '`': '~',
  '1': '!', '2': '@', '3': '#', '4': '$', '5': '%',
  '6': '^', '7': '&', '8': '*', '9': '(', '0': ')',
  '-': '_', '=': '+',
  '[': '{', ']': '}', '\\': '|',
  ';': ':', "'": '"',
  ',': '<', '.': '>', '/': '?',
};

export const FINGER_COLORS: Record<string, string> = {
  'left-pinky': 'bg-pink-100 border-pink-200 text-pink-700',
  'left-ring': 'bg-orange-100 border-orange-200 text-orange-700',
  'left-middle': 'bg-yellow-100 border-yellow-200 text-yellow-700',
  'left-index': 'bg-green-100 border-green-200 text-green-700',
  'right-index': 'bg-teal-100 border-teal-200 text-teal-700',
  'right-middle': 'bg-blue-100 border-blue-200 text-blue-700',
  'right-ring': 'bg-indigo-100 border-indigo-200 text-indigo-700',
  'right-pinky': 'bg-purple-100 border-purple-200 text-purple-700',
  'thumb': 'bg-slate-100 border-slate-200 text-slate-700',
};


export const PRACTICE_TEXTS = [
  "The quick brown fox jumps over the lazy dog.",
  "Colemak-DH is a highly optimized keyboard layout for touch typing.",
  "Focus on accuracy first, speed will come naturally with time.",
  "Keep your fingers on the home row for maximum efficiency.",
  "Matrix keyboards provide a more ergonomic typing experience.",
  "Rhythm and consistency are key to mastering a new layout.",
  "Touch typing allows you to focus on your thoughts rather than the keys.",
  "Practice makes perfect, especially when learning something new.",
];
