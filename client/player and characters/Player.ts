import {Entity} from "../EntityInterface"
class Player{
    private _currAP:number
    private _maxAP:number
    private _coins:number
    private items:string[]//temp

    constructor(){
        this._currAP=3
        this._maxAP=3
        this._coins=50
        this.items=[]
    }

    public set AP(amount:number){
        if (this._currAP-amount<0){
            throw new Error("Energy reached negative")
        }
        this._currAP=Math.min(this._currAP+amount,this._maxAP)
    }

    public get AP(){
        return this._currAP
    }

    public get MaxAP(){
        return this._maxAP
    }

    public set MaxAP(amount:number){
        if (this._maxAP+amount<0){
            throw new Error("Max energy reached negative")
        }
        this._maxAP+=amount
    }

    public get coins(){
        return this._coins
    }

    public set coins(amount:number){//allow negative
        this._coins+=amount
    }

    //do items later

}


type pl={
    currAP:number
    maxAP:number
    coins:number
    items:string[]//temp
    team:Entity[]
}