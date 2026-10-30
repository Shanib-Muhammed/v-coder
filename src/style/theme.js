// ═══════════════════════════════════════════════════════════════
//  VCODER THEME ENGINE — Blood Red Terminal Palette
// ═══════════════════════════════════════════════════════════════

import chalk from 'chalk';

export const THEMES = {
  bloodred: {
    name: 'Blood Red',
    primary: chalk.hex('#DC143C'),       // Crimson
    secondary: chalk.hex('#8B0000'),     // Dark red
    accent: chalk.hex('#FF1744'),        // Bright red
    success: chalk.hex('#4CAF50'),       // Green
    warning: chalk.hex('#FF9800'),       // Orange
    error: chalk.hex('#FF1744'),         // Red
    info: chalk.hex('#DC143C'),          // Crimson
    muted: chalk.hex('#4A4A4A'),         // Medium gray
    text: chalk.hex('#E8E8E8'),          // Light gray
    dim: chalk.hex('#666666'),           // Dim gray
    highlight: chalk.hex('#FF1744').bold, // Bold red
    gradient: ['#8B0000', '#DC143C', '#FF1744'],
    border: '═',
    corner: { tl: '╔', tr: '╗', bl: '╚', br: '╝' },
    separator: '─',
    bullet: '▸',
    prompt: '❯',
    petColor: chalk.hex('#DC143C'),
  },
};

let currentTheme = 'bloodred';

export function setTheme(name) {
  if (THEMES[name]) {
    currentTheme = name;
  }
}

export function getTheme() {
  return THEMES[currentTheme];
}

export function getThemeName() {
  return currentTheme;
}

export default { THEMES, setTheme, getTheme, getThemeName };
