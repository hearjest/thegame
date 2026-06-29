enum Intent{
    Attack,
    Defend,
    Unknown,
    Heal,
    Buff,
    Debuff

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
    PHYS_DMG_ADD,
    PHYS_DMG_MULT,
    MAG_DMG_ADD,
    MAG_DMG_MULT,
    PHYS_DEF_ADD,
    PHYS_DEF_MULT,
    MAG_DEF_ADD,
    MAG_DEF_MULT
}


export{Intent,targetSide,targetType,cardType,statusEffect,buffType}