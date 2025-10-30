export const Difficulty = {
    BC0: 0,
    BC1: 1,
    BC2: 2,
    BC3: 3,
    BC4: 4
} as const;
export type Difficulty = typeof Difficulty[keyof typeof Difficulty];