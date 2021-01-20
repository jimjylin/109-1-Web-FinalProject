const Deck = require('./deck')
const Player = require('./player')

class Table{
    constructor(tableID){
        this.turn = -1
        this.players = []
        this.tableID = tableID
        this.deck = new Deck(true)
        this.seat = ["","","",""]
    }
    get Num(){
        return this.players.filter((p)=>{return p.alive}).length
    }
    sitDown(client, name, seatNum){
        if(this.seat[seatNum] === ""){
            this.seat[seatNum] = name
            this.addPlayer(client, name, seatNum)
            this.broadcast(['seat', this.seat])
            client.send(JSON.stringify(['sitSuccess', seatNum]))
        }
        else{
            client.send(JSON.stringify(['error']))
        }
    }

    play(payload){
        this.playerByNum(this.turn).invisible = false
        if(payload[0] === 1){
            if(this.playerHand(Number(payload[1])) === Number(payload[2])){
                this.lose(Number(payload[1]))
            }
        }
        else if(payload[0] === 2){
            
            this.sendByNum(this.turn, ['status', {type:'info', msg:('Player'+payload[1]+'\'s hand is '+String(this.playerHand(Number(payload[1]))))}])
        }
        else if(payload[0] === 3){
            if(this.playerHand(payload[1]) > payload[2]){
                this.lose(this.turn)
            }
            else if(this.playerHand(payload[1]) < payload[2]){
                this.lose(payload[1])
            }
            else{
                this.sendByNum(this.turn, ['status', {type:'info', msg:"Nothing happen..."}])
            }
        }
        else if(payload[0] === 4){
            this.playerByNum(this.turn).invisible = true
            this.broadcast(['invisible', this.turn])
        }
        else if(payload[0] === 5){
            if(this.playerHand(payload[1]) === 8){
                this.lose(payload[1])
            }
            else{
                this.playerByNum(payload[1]).discard()
                this.drawByNum(payload[1])
            }
        }
        else if(payload[0] === 6){
            this.playerByNum(this.turn).setHand(this.playerHand(payload[1]))
            this.playerByNum(payload[1]).setHand(payload[2])
        }
        else if(payload[0] === 7){

        }
        else if(payload[0] === 8){
            this.lose(this.turn)
            return
        }
        this.playerByNum(this.turn).play(payload[0])
        this.broadcast(['boardUpdate', [this.turn, payload[0]]])
    }
    lose(n){
        this.playerByNum(n).alive = false
        this.broadcast(['lose',n])
    }
    win(n){
        this.broadcast(['win',n])
    }
    broadcast(msg){
        for(let i = 0;i<this.players.length;i++){
            this.players[i].client.send(JSON.stringify(msg))
        }
    }
    playerHand(n){
        return this.playerByNum(n).hand[0]
    }
    playerByNum(n){
        for(let i = 0;i<this.players.length;i++){
            if(this.players[i].seatNum === n) return this.players[i]
        }
    }
    get draw(){

        return this.deck.draw
    }
    get clients(){
        let out = []
        for(let i = 0;i<this.players.length;i++){
            out.push(this.players[i].client)
        }
        return out
    }
    sendByNum(n, msg){
        this.playerByNum(n).client.send(JSON.stringify(msg))
    }
    drawByNum(n){
        const card = this.draw
        this.sendByNum(n, ['draw', card])
        this.playerByNum(n).draw(card)
    }
    
    init(){
        const start = Math.floor(Math.random() * this.players.length)
        for (let i=0; i<this.players.length; i++) {
            this.drawByNum(this.players[i].seatNum) 
            //this.sendByNum(this.players[i].seatNum,['start', start])
        }
        this.turn = this.players[start].seatNum
        //this.sendByNum(this.players[start].seatNum, ['yourTurn'])
        this.drawByNum(this.players[start].seatNum)
        this.broadcast(['turn', this.turn])
        //this.showHand()
    }
    showHand(){
        for (let i=0; i<this.players.length; i++) {
            console.log(this.players[i].name, this.players[i].hand)
        }
    }
    nextRound(){
        //console.log(this.players.filter(i=>i.alive))
        //console.log(this.players[0].alive,this.players[1].alive)
        if(this.players.filter((i)=>i.alive).length === 1){
            console.log('aaa')
            this.win(this.players.filter((i)=>i.alive)[0].seatNum)
        }
        else if(this.deck.cur === 15){
            this.battle()
        }
        else{
            this.turn = (this.turn + 1)%4
            while(this.playerByNum(this.turn) === undefined || !this.playerByNum(this.turn).alive){
                this.turn = (this.turn + 1)%4
            }

            this.drawByNum(this.turn)
            this.broadcast(['turn', this.turn])
        }
        this.broadcast(['deckNum', this.deck.num])
        
    }
    showAlive(){
        for (let i=0; i<this.players.length; i++) {
            console.log(this.players[i].name, this.players[i].alive)
        }
    }
    addPlayer(client, name, seatNum){
        this.players.push(new Player(client, name, seatNum))
    }
    
}
module.exports = Table
