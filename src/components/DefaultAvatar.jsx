import React from 'react';

export default function DefaultAvatar({ className = '', size = 24 }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="50" cy="50" r="50" fill="#e5e7eb" />
      <circle cx="50" cy="38" r="16" fill="#9ca3af" />
      <ellipse cx="50" cy="75" rx="26" ry="20" fill="#9ca3af" />
    </svg>
  );
}
