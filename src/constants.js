// export const MENTION_REGEX = /\B@[a-z0-9_-]*/gi;
export const MENTION_REGEX = /\B^@\S*$/;
// export const MENTION_REGEX2 = /\B\([a-z0-9_-]*/gi;
export const MENTION_REGEX2 = /\B^\(\S*$/;
export const MENTION_REGEX3 = /(\(|\))/;
export const MENTION_REGEX4 = /\B^\([\S]*/;

export const MENTION_PATTERN = new RegExp(MENTION_REGEX);
export const MENTION_PATTERN2 = new RegExp(MENTION_REGEX2);
export const MENTION_PATTERN3 = new RegExp(MENTION_REGEX3);
export const MENTION_PATTERN4 = new RegExp(MENTION_REGEX4);

// export const ACTION = '418c5509e2171d55b0aee5c2ea4442b5';
export const ACTION = 'action';
// export const CHARACTER = 'a956161a69928cd130a889b88082fb6e';
export const CHARACTER = 'character';
// export const DIALOGUE = '0456454f03a4d959eee78a4a13a23524';
export const DIALOGUE = 'dialogue';