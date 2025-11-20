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

export const DICE_SLOTS = [
  STANCE_DIE,
  ROTATION_DIE,
  DEGREE_DIE,
  TRICK_DIE,
];
