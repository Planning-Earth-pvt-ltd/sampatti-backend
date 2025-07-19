"use strict";
export const generateCustomId = (name: string): string => {
  const prefix = name.trim().substring(0, 4).toUpperCase().padEnd(4, 'X');

  const numbers = Array.from({ length: 4 }, () =>
    Math.floor(Math.random() * 10)
  ).join('');

  return prefix + numbers; // e.g., "RAVI1234" or "RA 1234"
};
