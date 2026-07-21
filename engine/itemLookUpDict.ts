import {Item} from "./types/Items"
import { buffType } from "./types/enums"


const ironExlixir:Item={
    name:"Exlixir of Iron",
    uniqueId:-1,
    id:1,
    buff:{type:buffType.PHYS_DEF_ADD, amount:100, expiryRound:2},
    flavorText:"makes my pp hard"
}



const itemDictionary:Record<number,Item>={
    1:ironExlixir
}

function getItemById(id:number):Item{
    return itemDictionary[id]
}

export {getItemById}