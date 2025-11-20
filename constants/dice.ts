export type DieFace = {
  label: string;
  value: string;
  color?: string;
};

export const STANCE_DIE: DieFace[] = [
  { label: 'REGULAR', value: 'Regular' },
  { label: 'FAKIE', value: 'Fakie' },
  { label: 'SWITCH', value: 'Switch' },
  { label: 'NOLLIE', value: 'Nollie' },
];

export const ROTATION_DIE: DieFace[] = [
  { label: 'BACK\nSIDE', value: 'Backside' },
  { label: 'FRONT\nSIDE', value: 'Frontside' },
  { label: 'X', value: '' }, // Empty/No rotation
  { label: 'X', value: '' },
];

export const DEGREE_DIE: DieFace[] = [
  { label: '180', value: '180' },
  { label: '360', value: '360' },
  { label: 'X', value: '' },
  { label: 'X', value: '' },
];

export const TRICK_DIE: DieFace[] = [
  { label: 'KICK\nFLIP', value: 'Kickflip' },
  { label: 'HEEL\nFLIP', value: 'Heelflip' },
  { label: 'X', value: '' }, // Option for no flip (just rotation/shuv)
  { label: 'X', value: '' },
];

export const GRIND_DIE: DieFace[] = [
  { label: '50-50', value: '50-50' },
  { label: '5-0', value: '5-0' },
  { label: 'NOSE\nGRIND', value: 'Nosegrind' },
  { label: 'CROOKED', value: 'Crooked Grind' },
  { label: 'SMITH', value: 'Smith Grind' },
  { label: 'FEEBLE', value: 'Feeble Grind' },
  { label: 'TAIL\nSLIDE', value: 'Tailslide' },
  { label: 'NOSE\nSLIDE', value: 'Noseslide' },
  { label: 'BOARD\nSLIDE', value: 'Boardslide' },
  { label: 'LIP\nSLIDE', value: 'Lipslide' },
];

export const TRIES_DIE: DieFace[] = [
  { label: '1 TRY', value: '1 Try' },
  { label: '3 TRIES', value: '3 Tries' },
  { label: '5 TRIES', value: '5 Tries' },
  { label: 'UNTIL\nLANDED', value: 'Until Landed' },
];

export const FLATGROUND_SLOTS = [
  STANCE_DIE,
  ROTATION_DIE,
  DEGREE_DIE,
  TRICK_DIE,
];

export const LEDGE_SLOTS = [
  STANCE_DIE,
  GRIND_DIE,
  ROTATION_DIE,
  TRIES_DIE,
];

// Default export for backward compatibility if needed, but we'll switch to named exports
export const DICE_SLOTS = FLATGROUND_SLOTS;
