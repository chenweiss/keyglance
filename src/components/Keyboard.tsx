import React from 'react';
import {
  KeyboardLayout,
  FINGERS,
  HOMING_COLUMNS,
  HOME_ROW_INDEX,
} from '../layouts';
import { FINGER_COLORS, SHIFT_MAP } from '../constants';
import { THUMB_DISPLAY, type ThumbConfig } from '../thumbKeys';
import { cn } from '../lib/utils';

interface KeyboardProps {
  layout: KeyboardLayout;
  activeKey?: string;
  isShiftPressed?: boolean;
  compact?: boolean;
  matrix?: boolean;
  thumbKeys?: ThumbConfig;
}

export const Keyboard: React.FC<KeyboardProps> = ({
  layout,
  activeKey,
  isShiftPressed,
  compact,
  matrix = true,
  thumbKeys,
}) => {
  const keySize = compact ? 'w-7 h-7 text-xs' : 'w-11 h-11 text-base';
  const gap = compact ? 'gap-1' : 'gap-1.5';

  // Character produced by the pressed key (a US ANSI key name such as "A" or
  // "'") given the Shift state, e.g. Shift + "-" → "_".
  const activeChar = activeKey && (isShiftPressed
    ? SHIFT_MAP[activeKey] ?? activeKey.toUpperCase()
    : activeKey.toLowerCase());

  const renderKey = (key: string | null, rowIndex: number, colIndex: number, side: 'left' | 'right') => {
    const id = `${side}-${rowIndex}-${colIndex}`;
    if (key === null) return <div key={id} className={keySize} />;

    const isActive = activeChar === key;
    const isHomeRow = rowIndex === HOME_ROW_INDEX;
    const isHomingKey = isHomeRow && HOMING_COLUMNS[side].includes(colIndex);

    const finger = FINGERS[side][colIndex];
    const fingerColorClass = FINGER_COLORS[finger] || '';

    return (
      <div
        key={id}
        className={cn(
          'key-cap relative',
          keySize,
          !isActive && fingerColorClass,
          isActive && 'active',
          isHomeRow && 'home-row',
        )}
      >
        {key.toUpperCase()}
        {isHomingKey && (
          <div
            className={cn(
              'absolute rounded-full bg-current opacity-30',
              compact ? 'bottom-1 w-3 h-0.5' : 'bottom-1.5 w-4 h-0.5',
            )}
          />
        )}
      </div>
    );
  };

  const getRows = (side: 'left' | 'right') =>
    isShiftPressed
      ? (side === 'left' ? layout.shiftedLeft : layout.shiftedRight)
      : layout[side];

  // --- Flat (non-matrix) layout: single block, no split gap, no thumb keys ---
  if (!matrix) {
    const leftRows = getRows('left');
    const rightRows = getRows('right');

    return (
      <div className={cn('flex flex-col items-center select-none', gap, compact ? 'p-1' : 'p-2')}>
        {leftRows.map((leftRow, rowIndex) => {
          const rightRow = rightRows[rowIndex];
          return (
            <div key={rowIndex} className={cn('flex', gap)}>
              {leftRow.map((key, ci) => renderKey(key, rowIndex, ci, 'left'))}
              {rightRow.map((key, ci) => renderKey(key, rowIndex, ci, 'right'))}
            </div>
          );
        })}
      </div>
    );
  }

  // --- Matrix (split) layout: two halves with gap + thumb keys ---
  const renderHalf = (side: 'left' | 'right') => {
    const rows = getRows(side);
    return (
      <div className={cn('flex flex-col', gap)}>
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className={cn('flex', gap)}>
            {row.map((key, ci) => renderKey(key, rowIndex, ci, side))}
          </div>
        ))}
      </div>
    );
  };

  const thumbKeyClass = compact
    ? 'key-cap w-8 h-8 rounded-lg text-sm'
    : 'key-cap w-12 h-12 rounded-xl text-base';
  const thumbKeyWide = compact
    ? 'key-cap w-10 h-10 rounded-lg text-sm'
    : 'key-cap w-14 h-14 rounded-xl text-base';

  const renderThumb = (keyId: string, wide: boolean) => (
    <div
      key={keyId}
      className={cn(
        wide ? thumbKeyWide : thumbKeyClass,
        FINGER_COLORS['thumb'],
        activeKey === keyId && 'active',
      )}
    >
      {THUMB_DISPLAY[keyId] ?? keyId}
    </div>
  );

  const leftThumbs = thumbKeys?.left ?? ['Backspace', 'Meta'];
  const rightThumbs = thumbKeys?.right ?? ['Enter', ' '];

  return (
    <div className={cn('flex flex-col items-center select-none', compact ? 'gap-3 p-1' : 'gap-6 p-2')}>
      <div className={cn('flex items-start', compact ? 'gap-6' : 'gap-12')}>
        {/* Left Half */}
        <div className={cn('flex flex-col', compact ? 'gap-2' : 'gap-4')}>
          {renderHalf('left')}
          <div className={cn('flex justify-end', compact ? 'gap-1 pr-1' : 'gap-1.5 pr-2')}>
            {renderThumb(leftThumbs[0], false)}
            {renderThumb(leftThumbs[1], true)}
          </div>
        </div>

        {/* Right Half */}
        <div className={cn('flex flex-col', compact ? 'gap-2' : 'gap-4')}>
          {renderHalf('right')}
          <div className={cn('flex justify-start', compact ? 'gap-1 pl-1' : 'gap-1.5 pl-2')}>
            {renderThumb(rightThumbs[0], true)}
            {renderThumb(rightThumbs[1], false)}
          </div>
        </div>
      </div>
    </div>
  );
};
