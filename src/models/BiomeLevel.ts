export const BiomeLevel = {
    L1: 1,
    L2: 2,
    O1: 2.5,
    L3: 3,
    B1: 3.5,
    L4: 4,
    L5: 5,
    B2: 5.5,
    L6: 6,
    B3: 6.5,
    L7: 7,
    B4: 8
} as const;
export type BiomeLevel = typeof BiomeLevel[keyof typeof BiomeLevel];
export const biomeLevelNameMap = Object.fromEntries(
  Object.entries(BiomeLevel).map(([k, v]) => {
    let tag = "";
    switch(k.charAt(0)) {
        case "L": tag = "Level";    break; 
        case "O": tag = "Optional"; break;
        case "B": tag = "Boss";     break;
    }
    return [v, `${tag} ${k.slice(1)}`];
})
) as Record<BiomeLevel, string>;