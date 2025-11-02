export const dlcs = [
    {
        "code": "FF",
        "name": "Fatal Falls",
        "key": "FatalFalls",
        "color": "#FFBE32"
    },
    {
        "code": "RotG",
        "name": "Rise of the Giant",
        "key": "RiseOfTheGiant",
        "color": "#52f1f4"
    },
    {
        "code": "RtC",
        "name": "Return to Castlevania",
        "key": "ReturnToCastlevania",
        "color": "#f02934"
    },
    {
        "code": "TBS",
        "name": "The Bad Seed",
        "key": "TheBadSeed",
        "color": "#82C936"
    },
    {
        "code": "TQatS",
        "name": "The Queen and the Sea",
        "key": "TheQueenAndTheSea",
        "color": "#B573E3"
    }
] as const;

export const DLC = Object.fromEntries(
    dlcs.map(dlc => [dlc.key, dlc.code])
) as Record<typeof dlcs[number]['key'], typeof dlcs[number]['code']>;

export type DLC = typeof dlcs[number]['code'] | null;