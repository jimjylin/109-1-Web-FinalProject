
class Player{
    constructor(client, name, seatNum){
        this.client = client
        this.name = name
        this.seatNum = seatNum
        this.hand = []
        this.live = true
        this.invisible = false
    }
    play(n){
        if(this.hand[0] === n){
            this.hand.splice(0,1)
        }
        else if(this.hand[1] === n){
            this.hand.splice(1)
        }
        else{
            console.error('aAA');
        }
    }
    draw(n){
        this.hand.push(n)
    }
    setHand(n){
        this.hand = [n]
        this.client.send(JSON.stringify(['setHand', n]))
    }
    discard(){
        this.hand.pop()
        this.client.send(JSON.stringify(['discard']))
        console.log(this.hand)
    }
    
    
}
module.exports = Player