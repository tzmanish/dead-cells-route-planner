// DLC codes as enum for better type safety
export enum DLC {
    FatalFalls = "FF",
    RiseOfTheGiant = "RotG", 
    ReturnToCastlevania = "RtC",
    TheBadSeed = "TBS",
    TheQueenAndTheSea = "TQatS"
}

export type DLCType = DLC | null;