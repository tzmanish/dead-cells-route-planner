export const dlcs = [
    {
        "code": "FF",
        "name": "Fatal Falls",
        "key": "FatalFalls"
    },
    {
        "code": "RotG",
        "name": "Rise of the Giant",
        "key": "RiseOfTheGiant"
    },
    {
        "code": "RtC",
        "name": "Return to Castlevania",
        "key": "ReturnToCastlevania"
    },
    {
        "code": "TBS",
        "name": "The Bad Seed",
        "key": "TheBadSeed"
    },
    {
        "code": "TQatS",
        "name": "The Queen and the Sea",
        "key": "TheQueenAndTheSea"
    }
] as const;

export const DLC = Object.fromEntries(
    dlcs.map(dlc => [dlc.key, dlc.code])
) as Record<typeof dlcs[number]['key'], typeof dlcs[number]['code']>;

export type DLC = typeof dlcs[number]['code'] | null;