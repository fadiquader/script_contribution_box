// export const MENTION_REGEX = /\B@[a-z0-9_-]*/gi;
export const MENTION_REGEX = /\B^@\S*$/;
// export const MENTION_REGEX2 = /\B\([a-z0-9_-]*/gi;
export const MENTION_REGEX2 = /\B^\(\S*$/;
export const MENTION_REGEX3 = /(\(|\))/;

export const MENTION_PATTERN = new RegExp(MENTION_REGEX);
export const MENTION_PATTERN2 = new RegExp(MENTION_REGEX2);
export const MENTION_PATTERN3 = new RegExp(MENTION_REGEX3);