import { useState } from 'react';

/**
 * Animated refresh button with spin-on-click effect.
 * 
 * @param {Function} onRefresh - Async function to call on click
 * @param {string} className - Additional CSS classes
 */
export default function RefreshButton({ onRefresh, className = '' }) {
  const [spinning, setSpinning] = useState(false);

  const handleClick = async () => {
    if (spinning) return;
    setSpinning(true);
    try {
      await onRefresh();
    } catch (e) {
      console.error('Refresh failed:', e);
    }
    // Keep spinning for at least 600ms for visual feedback
    setTimeout(() => setSpinning(false), 600);
  };

  return (
    <button
      onClick={handleClick}
      disabled={spinning}
      title="Refresh data"
      className={`group relative p-2 rounded-lg bg-gray-800 border border-gray-700 
        hover:border-gray-500 hover:bg-gray-700/80 active:scale-95
        transition-all duration-200 cursor-pointer disabled:cursor-wait ${className}`}
    >
      <svg
        className={`w-4.5 h-4.5 text-gray-400 group-hover:text-blue-400 transition-colors duration-200
          ${spinning ? 'animate-[spin_0.6s_linear_infinite]' : ''}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
    </button>
  );
}
