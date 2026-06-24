enum Intent{
    Attack,
    Defend,
    Unknown,
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

enum targetSide{
    ALL,
    ENEMY,
    ALLY
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

enum cardType{
    BUFF,
    DEBUFF,
    ATK,
    HEAL,
    GAIN_SHIELD
}

enum buffType{
    PHYS_DMG,
    MAG_DMG,
    PHYS_DEF,
    MAG_DEF
}


export{Intent,targetSide,targetType,cardType,statusEffect,buffType}