import { useState, useEffect, useRef, useMemo } from "react";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow, currentMonitor } from "@tauri-apps/api/window";
import { LogicalPosition, LogicalSize } from "@tauri-apps/api/dpi";
import { Keyboard } from "./components/Keyboard";
import { motion } from "framer-motion";
import { Minimize2, Maximize2 } from "lucide-react";
import { GRAPHITE, getLayoutKeys } from "./layouts";
import { DEFAULT_THUMBS, THUMBS_STORAGE_KEY, type ThumbConfig } from "./thumbKeys";

type Size = { width: number; height: number };

// Space between the keyboard card and the window edges
const WINDOW_MARGIN = 16;

/**
 * Move the window to (x, y), keeping it inside the work area (the screen
 * minus the menu bar and Dock) of the monitor it ends up on.
 */
async function placeWindow(x: number, y: number, size: Size) {
  const win = getCurrentWindow();
  await win.setPosition(new LogicalPosition(Math.round(x), Math.round(y)));
  const monitor = await currentMonitor();
  if (!monitor) return;
  const scale = monitor.scaleFactor;
  const areaX = monitor.workArea.position.x / scale;
  const areaY = monitor.workArea.position.y / scale;
  const areaWidth = monitor.workArea.size.width / scale;
  const areaHeight = monitor.workArea.size.height / scale;
  const clampedX = Math.max(areaX, Math.min(x, areaX + areaWidth - size.width));
  const clampedY = Math.max(areaY, Math.min(y, areaY + areaHeight - size.height));
  if (clampedX !== x || clampedY !== y) {
    await win.setPosition(new LogicalPosition(Math.round(clampedX), Math.round(clampedY)));
  }
}

async function resizeWindow(size: Size) {
  const win = getCurrentWindow();
  await win.setSize(new LogicalSize(size.width, size.height));
  const scale = await win.scaleFactor();
  const position = await win.outerPosition();
  await placeWindow(position.x / scale, position.y / scale, size);
}

const IDLE_TIMEOUT = 2000;

const STORAGE_KEY = 'keyglance-compact';
const MATRIX_STORAGE_KEY = 'keyglance-matrix';

export default function App() {
  const [activeKey, setActiveKey] = useState<string | undefined>();
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [compact, setCompact] = useState(() => localStorage.getItem(STORAGE_KEY) === 'true');
  const [matrix, setMatrix] = useState(() => {
    const saved = localStorage.getItem(MATRIX_STORAGE_KEY);
    return saved === null ? true : saved === 'true';
  });
  const [thumbKeys, setThumbKeys] = useState<ThumbConfig>(() => {
    try {
      const saved = localStorage.getItem(THUMBS_STORAGE_KEY);
      if (saved) return JSON.parse(saved) as ThumbConfig;
    } catch { /* use default */ }
    return DEFAULT_THUMBS;
  });
  const [idle, setIdle] = useState(false);
  const [accessibilityMissing, setAccessibilityMissing] = useState(false);
  const idleRef = useRef(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const layoutKeys = useMemo(() => getLayoutKeys(GRAPHITE), []);

  const resetIdleTimer = () => {
    setIdle(false);
    idleRef.current = false;
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      setIdle(true);
      idleRef.current = true;
    }, IDLE_TIMEOUT);
  };

  // Start idle timer on mount so keyboard goes transparent after 2s
  useEffect(() => {
    idleTimer.current = setTimeout(() => {
      setIdle(true);
      idleRef.current = true;
    }, IDLE_TIMEOUT);
    return () => clearTimeout(idleTimer.current);
  }, []);

  // Fit the window to the card whenever its size changes (on mount, compact
  // toggle, matrix toggle, accessibility notice)
  const cardRef = useRef<HTMLDivElement>(null);
  const windowSize = useRef<Size>({ width: 0, height: 0 });

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const observer = new ResizeObserver(() => {
      const size = {
        width: card.offsetWidth + WINDOW_MARGIN * 2,
        height: card.offsetHeight + WINDOW_MARGIN * 2,
      };
      if (size.width === windowSize.current.width && size.height === windowSize.current.height) return;
      windowSize.current = size;
      resizeWindow(size);
    });
    observer.observe(card, { box: "border-box" });
    return () => observer.disconnect();
  }, []);

  // Track focused text input and move window above it
  useEffect(() => {
    const unlistenInput = listen<{ x: number; y: number; width: number; height: number }>(
      "focused-input",
      async (event) => {
        const { x, y, width, height } = event.payload;
        const size = windowSize.current;

        // Center the keyboard above the input field, with a gap
        const gap = 40;
        const newX = x + width / 2 - size.width / 2;

        // Place above the input, but if not enough room, go below it
        let newY = y - size.height - gap;
        if (newY < 25) {
          newY = y + height + gap;
        }

        await placeWindow(newX, newY, size);
      },
    );

    return () => {
      unlistenInput.then((f) => f());
    };
  }, []);

  const thumbKeySet = useMemo(
    () => new Set([...thumbKeys.left, ...thumbKeys.right]),
    [thumbKeys],
  );

  useEffect(() => {
    const isLayoutKey = (key: string) => layoutKeys.has(key);

    const unlistenDown = listen("global-keydown", (event) => {
      const rawKey = event.payload as string;
      const key = rawKey.replace("Key", "");
      if (key.includes("Shift")) setIsShiftPressed(true);
      if (isLayoutKey(key)) {
        setActiveKey(key);
        resetIdleTimer();
      } else if (thumbKeySet.has(key) && !idleRef.current) {
        setActiveKey(key);
      }
    });

    const unlistenUp = listen("global-keyup", (event) => {
      const rawKey = event.payload as string;
      const key = rawKey.replace("Key", "");
      if (key === "Shift") {
        setIsShiftPressed(false);
      }
      if (isLayoutKey(key) || thumbKeySet.has(key)) {
        setActiveKey(undefined);
      }
    });

    return () => {
      unlistenDown.then((f) => f());
      unlistenUp.then((f) => f());
      clearTimeout(idleTimer.current);
    };
  }, [layoutKeys, thumbKeySet]);

  // Listen for tray menu events (matrix toggle)
  useEffect(() => {
    const unlistenMatrix = listen<boolean>("tray-toggle-matrix", (event) => {
      const newVal = event.payload;
      setMatrix(newVal);
      localStorage.setItem(MATRIX_STORAGE_KEY, String(newVal));
    });

    const unlistenThumbs = listen<ThumbConfig>("settings-update-thumbs", (event) => {
      const config = event.payload;
      setThumbKeys(config);
      localStorage.setItem(THUMBS_STORAGE_KEY, JSON.stringify(config));
    });

    const unlistenAccessMissing = listen("accessibility-missing", () => {
      setAccessibilityMissing(true);
    });

    const unlistenAccessGranted = listen("accessibility-granted", () => {
      setAccessibilityMissing(false);
    });

    return () => {
      unlistenMatrix.then((f) => f());
      unlistenThumbs.then((f) => f());
      unlistenAccessMissing.then((f) => f());
      unlistenAccessGranted.then((f) => f());
    };
  }, []);

  const toggleCompact = () => {
    const next = !compact;
    setCompact(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  };

  return (
    <main className="h-screen w-screen flex items-center justify-center bg-transparent">
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`glass rounded-3xl relative shrink-0 ${
          idle ? "idle" : ""
        } ${
          compact ? "p-4" : "p-8"
        }`}
      >
        {/* Drag region — fills the top of the card for window dragging */}
        <div
          data-tauri-drag-region
          className="absolute inset-0 h-10 rounded-t-3xl cursor-grab active:cursor-grabbing"
        />

        {/* Size toggle */}
        <button
          onClick={toggleCompact}
          className="absolute top-2.5 right-3 p-1 rounded-md text-black/20 hover:text-black/50 hover:bg-black/5 transition-colors z-10"
          title={compact ? "Normal size" : "Compact size"}
        >
          {compact ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
        </button>

        <div
          data-tauri-drag-region
          className={`font-black uppercase tracking-[0.2em] text-black/20 text-center ${
            compact ? "text-[8px] mb-3" : "text-[10px] mb-6"
          }`}
        >
          {GRAPHITE.name}
        </div>

        <Keyboard layout={GRAPHITE} activeKey={activeKey} isShiftPressed={isShiftPressed} compact={compact} matrix={matrix} thumbKeys={thumbKeys} />

        {accessibilityMissing && (
          <div className={`text-center text-red-500/70 font-semibold ${compact ? "text-[8px] mt-2" : "text-[10px] mt-3"}`}>
            Enable Keyglance in System Settings &gt; Privacy &amp; Security &gt; Accessibility
          </div>
        )}
      </motion.div>
    </main>
  );
}