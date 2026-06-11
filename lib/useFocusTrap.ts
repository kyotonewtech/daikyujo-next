"use client";

import { useCallback, useEffect, useRef } from "react";

// フォーカス可能な要素のセレクター
const FOCUSABLE_SELECTORS = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(", ");

/**
 * モーダル内でフォーカスをトラップするフック
 * @param isActive - フォーカストラップを有効にするか
 * @param onClose - ESC キーで呼び出されるクローズ処理（HistoryModal側で既に実装している場合は渡さなくてよい）
 */
export function useFocusTrap<T extends HTMLElement>(
  isActive: boolean,
  onClose?: () => void
): React.RefObject<T | null> {
  const containerRef = useRef<T | null>(null);
  // モーダルを開く直前にフォーカスがあった要素を保存
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // モーダルが開いたとき、フォーカスを最初の要素に移動
  useEffect(() => {
    if (!isActive) return;

    // 開く前のフォーカス要素を保存
    previousFocusRef.current = document.activeElement as HTMLElement;

    // 最初のフォーカス可能要素へフォーカスを移動
    const container = containerRef.current;
    if (container) {
      const firstFocusable = container.querySelector<HTMLElement>(FOCUSABLE_SELECTORS);
      firstFocusable?.focus();
    }

    // 閉じたら元の要素へフォーカスを戻す
    return () => {
      previousFocusRef.current?.focus();
    };
  }, [isActive]);

  // Tab / Shift+Tab をモーダル内で循環させる
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isActive) return;

      if (e.key === "Escape" && onClose) {
        onClose();
        return;
      }

      if (e.key !== "Tab") return;

      const container = containerRef.current;
      if (!container) return;

      const focusableElements = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
      );
      if (focusableElements.length === 0) return;

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift+Tab: 先頭にいれば末尾へ
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        // Tab: 末尾にいれば先頭へ
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [isActive, onClose]
  );

  useEffect(() => {
    if (!isActive) return;
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, handleKeyDown]);

  return containerRef;
}
