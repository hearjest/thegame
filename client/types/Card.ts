import {CombatState,Phase} from "./CombatState"
enum targetSide{
    ALL,
    ENEMY,
    ALLY
}

enum statusEffect{
    POISON,
    BLEED,
    STUN,
    ATK_DOWN,
    DEF_DOWN,
    ATK_UP,
    DEF_UP,
    SPEED_UP,
    SPEED_DOWN
}

enum targetType{
    SINGLE_ALLY, 
    SINGLE_ALLY_CHOOSE, 
    SINGLE_ENEMY_CHOOSE, //maybe dont try this
    SINGLE_ENEMY,
    ALL_ALLIES, 
    ALL_ENEMIES, 
    FIRST_X_ENEMIES, 
    LAST_X_ENEMIES,
    SELF
}

enum effect{
    BUFF,
    DEBUFF,
    ATK,
    HEAL,
    GAIN_SHIELD
}

// enum conditionals

type Card={
    name:string
    APCost:number
    cardId:number
    cardSerialNumber:number
    description:string
    flavorText:string
    targetSide:targetSide
    numTargets:number
    canCherryPickIndividuals:boolean //assuming you can target multiple individuals, you can choose somebody in position 1 and then 3, instead of being forced to target neighbors 1 and 2 or 2 and 3
    damage:number
    inflicts:Record<statusEffect,number>|null
    targetType:targetType
}



export {Card,targetSide,statusEffect,targetType,effect}