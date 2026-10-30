// ═══════════════════════════════════════════════════════════════
//  VCODER PET COMPANION — Animated Terminal Pet System
//  Inspired by Claude Code's interactive pet feature
// ═══════════════════════════════════════════════════════════════

import { getTheme } from '../style/theme.js';

const PET_FRAMES = {
  fox: {
    idle: [
      [
        '   /\\_/\\  ',
        '  ( o.o ) ',
        '   > ^ <  ',
        '  /|   |\\',
        ' (_|   |_)',
      ],
      [
        '   /\\_/\\  ',
        '  ( -.o ) ',
        '   > ^ <  ',
        '  /|   |\\',
        ' (_|   |_)',
      ],
      [
        '   /\\_/\\  ',
        '  ( o.- ) ',
        '   > ^ <  ',
        '  /|   |\\',
        ' (_|   |_)',
      ],
    ],
    thinking: [
      [
        '   /\\_/\\  ',
        '  ( ?.? ) ',
        '   > ~ <  ',
        '  /| . |\\',
        ' (_|   |_)',
      ],
      [
        '   /\\_/\\  ',
        '  ( o.? )  💭',
        '   > ~ <  ',
        '  /| . |\\',
        ' (_|   |_)',
      ],
    ],
    happy: [
      [
        '   /\\_/\\  ',
        '  ( ^.^ ) ',
        '   > w <  ',
        '  /|   |\\  ✨',
        ' (_|   |_)',
      ],
    ],
    typing: [
      [
        '   /\\_/\\  ',
        '  ( o.o ) ',
        '   > ^ <  ',
        '  /|⌨️ |\\',
        ' (_|   |_)',
      ],
      [
        '   /\\_/\\  ',
        '  ( -.- ) ',
        '   > ^ <  ',
        '  /| ⌨️|\\',
        ' (_|   |_)',
      ],
    ],
    error: [
      [
        '   /\\_/\\  ',
        '  ( x.x ) ',
        '   > n <  ',
        '  /|   |\\  💥',
        ' (_|   |_)',
      ],
    ],
    sleeping: [
      [
        '   /\\_/\\  ',
        '  ( -.- ) 💤',
        '   > ~ <  ',
        '  /|   |\\',
        ' (_|   |_)',
      ],
    ],
  },

  cat: {
    idle: [
      [
        '  /\\_/\\  ',
        ' ( o.o ) ',
        ' (> ^ <) ',
        '  |   |  ',
        '  (u u)  ',
      ],
      [
        '  /\\_/\\  ',
        ' ( -.o ) ',
        ' (> ^ <) ',
        '  |   |  ',
        '  (u u)  ',
      ],
    ],
    thinking: [
      [
        '  /\\_/\\  ',
        ' ( ?.? )  💭',
        ' (> ~ <) ',
        '  |   |  ',
        '  (u u)  ',
      ],
    ],
    happy: [
      [
        '  /\\_/\\  ',
        ' ( ^.^ )  ✨',
        ' (> w <) ',
        '  |   |  ',
        '  (u u)  ',
      ],
    ],
    typing: [
      [
        '  /\\_/\\  ',
        ' ( o.o ) ',
        ' (> ^ <) ',
        '  |⌨️ |  ',
        '  (u u)  ',
      ],
    ],
    error: [
      [
        '  /\\_/\\  ',
        ' ( x.x )  💥',
        ' (> n <) ',
        '  |   |  ',
        '  (u u)  ',
      ],
    ],
    sleeping: [
      [
        '  /\\_/\\  ',
        ' ( -.- ) 💤',
        ' (> ~ <) ',
        '  |   |  ',
        '  (u u)  ',
      ],
    ],
  },

  robot: {
    idle: [
      [
        ' ┌───┐  ',
        ' │ ◉ ◉│  ',
        ' │ ─── │  ',
        ' └─┬─┘  ',
        '   │▓│   ',
        '  ═╧═  ',
      ],
      [
        ' ┌───┐  ',
        ' │ ● ○│  ',
        ' │ ─── │  ',
        ' └─┬─┘  ',
        '   │▓│   ',
        '  ═╧═  ',
      ],
    ],
    thinking: [
      [
        ' ┌───┐  💭',
        ' │ ◎ ◎│  ',
        ' │ ~~~ │  ',
        ' └─┬─┘  ',
        '   │▓│   ',
        '  ═╧═  ',
      ],
    ],
    happy: [
      [
        ' ┌───┐  ✨',
        ' │ ◉ ◉│  ',
        ' │ ╰─╯ │  ',
        ' └─┬─┘  ',
        '   │▓│   ',
        '  ═╧═  ',
      ],
    ],
    typing: [
      [
        ' ┌───┐  ',
        ' │ ◉ ◉│  ',
        ' │ ─── │  ',
        ' └─┬─┘  ',
        '  ⌨│▓│   ',
        '  ═╧═  ',
      ],
    ],
    error: [
      [
        ' ┌───┐  💥',
        ' │ ✕ ✕│  ',
        ' │ ___ │  ',
        ' └─┬─┘  ',
        '   │▓│   ',
        '  ═╧═  ',
      ],
    ],
    sleeping: [
      [
        ' ┌───┐ 💤',
        ' │ ─ ─│  ',
        ' │ ─── │  ',
        ' └─┬─┘  ',
        '   │▓│   ',
        '  ═╧═  ',
      ],
    ],
  },
};

export class PetCompanion {
  constructor(type = 'fox', name = 'Pixel') {
    this.type = PET_FRAMES[type] ? type : 'fox';
    this.name = name;
    this.mood = 'idle';
    this.frameIndex = 0;
    this.animationInterval = null;
    this.frames = PET_FRAMES[this.type];
    this.interactionCount = 0;
  }

  setMood(mood) {
    if (this.frames[mood]) {
      this.mood = mood;
      this.frameIndex = 0;
    }
  }

  getFrame() {
    const moodFrames = this.frames[this.mood] || this.frames.idle;
    const frame = moodFrames[this.frameIndex % moodFrames.length];
    this.frameIndex++;
    return frame;
  }

  render() {
    const theme = getTheme();
    const frame = this.getFrame();
    const coloredFrame = frame.map(line => theme.petColor(line));
    const nameLabel = theme.petColor.bold(`  ${this.name}`);
    return [...coloredFrame, nameLabel].join('\n');
  }

  renderInline() {
    const theme = getTheme();
    const frame = this.getFrame();
    return frame.map(line => theme.petColor(line));
  }

  interact() {
    this.interactionCount++;
    if (this.interactionCount % 10 === 0) {
      this.setMood('happy');
      setTimeout(() => this.setMood('idle'), 3000);
    }
  }

  getStatusMessage() {
    const messages = {
      idle: [`${this.name} is watching you code...`, `${this.name} sits quietly beside your terminal.`, `${this.name} wags its tail.`],
      thinking: [`${this.name} is pondering...`, `${this.name} tilts its head curiously.`],
      happy: [`${this.name} bounces with joy! ✨`, `${this.name} is proud of you!`],
      typing: [`${this.name} is helping you type...`, `${this.name} paws at the keyboard.`],
      error: [`${this.name} looks worried...`, `${this.name} whimpers softly.`],
      sleeping: [`${this.name} is taking a nap... 💤`],
    };
    const moodMsgs = messages[this.mood] || messages.idle;
    return moodMsgs[Math.floor(Math.random() * moodMsgs.length)];
  }

  setType(type) {
    if (PET_FRAMES[type]) {
      this.type = type;
      this.frames = PET_FRAMES[type];
      this.frameIndex = 0;
    }
  }

  static getAvailableTypes() {
    return Object.keys(PET_FRAMES);
  }
}

export default PetCompanion;
