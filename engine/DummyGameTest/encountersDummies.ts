import {EnemyPlayer} from "../types/Player"
import {makeEnemyPlayer} from "../types/Player"
import {copyEntityWithAssignedId} from "./EntityCollection"
import {getCardById} from "../cardLookUpDict"
import {Intent} from "../types/enums"

function enemyDeck(cardIds: number[]) {
    return { hand: cardIds.map(getCardById), drawPile: [], discardPile: [] }
}

const encounters: EnemyPlayer[][] = [
    [makeEnemyPlayer(101,"Rabid Dog",[copyEntityWithAssignedId("rabidDog")], enemyDeck([8]), Intent.Attack, 8),],

    [makeEnemyPlayer(201, "Rabid Dog",[copyEntityWithAssignedId("rabidDog")], enemyDeck([8]), Intent.Attack, 8),
    makeEnemyPlayer(202, "Rabid Dog",[copyEntityWithAssignedId("rabidDog")], enemyDeck([8]), Intent.Attack, 8),],

    [makeEnemyPlayer(301, "Wanderer",[copyEntityWithAssignedId("wanderer")], enemyDeck([8, 9]), Intent.Attack, 9),
    makeEnemyPlayer(302, "Rabid Dog",[copyEntityWithAssignedId("rabidDog")], enemyDeck([8]), Intent.Attack, 8),],

    [makeEnemyPlayer(401,"Four-Legged Stalker", [copyEntityWithAssignedId("fourLegStalker")], enemyDeck([10, 11]), Intent.Attack, 10),],

    [makeEnemyPlayer(501,"Four-Legged Stalker", [copyEntityWithAssignedId("fourLegStalker")], enemyDeck([10, 11]), Intent.Attack, 10),
makeEnemyPlayer(502, "Four-Legged Stalker",[copyEntityWithAssignedId("fourLegStalker")], enemyDeck([10, 11]), Intent.Attack, 10),
    ],
    [ makeEnemyPlayer(601, "Enlightened Noble",[copyEntityWithAssignedId("enlightenedNoble")], enemyDeck([12]), Intent.Attack, 12),
        makeEnemyPlayer(602,"Rabid Dog", [copyEntityWithAssignedId("rabidDog")], enemyDeck([8]), Intent.Attack, 8),
        makeEnemyPlayer(603, "Rabid Dog",[copyEntityWithAssignedId("rabidDog")], enemyDeck([8]), Intent.Attack, 8),
    ],

    [makeEnemyPlayer(701, "Enlightened Noble",[copyEntityWithAssignedId("enlightenedNoble")], enemyDeck([12]), Intent.Attack, 12),
 makeEnemyPlayer(702,"Four-Legged Stalker", [copyEntityWithAssignedId("fourLegStalker")], enemyDeck([10, 11]), Intent.Attack, 10),],

    [makeEnemyPlayer(801,"Mangled Mass", [copyEntityWithAssignedId("mangledMass"),copyEntityWithAssignedId("mangledMass"),], enemyDeck([13, 14]), Intent.Attack, 13),
        makeEnemyPlayer(802,"Wanderer", [copyEntityWithAssignedId("wanderer")], enemyDeck([8, 9]), Intent.Attack, 9),
    ],
]

export {encounters}