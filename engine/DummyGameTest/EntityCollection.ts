import {Entity, makeEntity2} from "../types/EntityInterface"

const entityCollection = {
    rabidDog: makeEntity2(991, 1, 0, 4, 5, 100, 25, 0, 20, 20, "Rabid Dog"),
    wanderer: makeEntity2(992, 1, 0, 4, 5, 150, 50, 0, 15, 15, "Wanderer"),
    fourLegStalker: makeEntity2(993, 1, 0, 4, 5, 100, 45, 0, 20, 20,"Four-Legged Stalker"),
    enlightenedNoble: makeEntity2(994, 1, 0, 4, 5, 75, 0, 40, 20, 40,"Enlightened Noble"),
    mangledMass: makeEntity2(995, 1, 0, 4, 5, 400, 60, 0, 40, 40,"Mangled Mass"),
}

type EntityCollectionName = keyof typeof entityCollection

function copyEntityWithAssignedId(entityName: EntityCollectionName): Entity {
    return {
        ...entityCollection[entityName],
    }
}

export {entityCollection, copyEntityWithAssignedId}

