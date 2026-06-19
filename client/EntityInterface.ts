interface Entity{
    id:number
    position:number
    hp:number
    atk:number
    magAtk:number
    def:number
    magDef:number
    minSpeed:number
    maxSpeed:number
    rolledSpeed:number
    statuses:string[]
}

enum Intent{
    Attack,
    Defend,
    Unknown,
}

export {Entity}