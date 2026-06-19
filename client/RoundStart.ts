import {Entity} from "./EntityInterface.ts"
class RoundStart{


    constructor(){

    }

    compareSpeed(a:Entity,b:Entity):number{
        const diff=b.rolledSpeed-a.rolledSpeed
        return diff==0? b.id-a.id : diff
    }

    rollSpeed(state,seed){
        // const length=this.state.entities.length
        //for entity in entities, roll speed based on min, max speed
        // store in data
        // sort based on speed using compareSpeed
        // return 
        
    }


    draw(state,seed){
        // check if HANDSIZE-DRAWLIMIT is greater than draw amount
        // then reshuffle discard pile into draw pile
        //fisher yates shuffle and draw min(HANDSIZE-DRAWLIMIT, 5) cards
        //
    }
}