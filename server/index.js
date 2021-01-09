require('dotenv-defaults').config()
const { useState } = require('react')
const http = require('http')
const express = require('express')
const mongoose = require('mongoose')
const WebSocket = require('ws')
const Table = require('./table')
const Message = require('./models/message')

const app = express()
const server = http.createServer(app)
const wss = new WebSocket.Server({ server })
if (!process.env.MONGO_URL) {
  console.error('Missing MONGO_URL!!!')
  process.exit(1)
}

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const db = mongoose.connection




db.on('error', (error) => {
  console.error(error)
})
let cur = -1
const table = new Table(0)
console.log(table.deck)
let seat = ["","","",""]
console.log(seat)
let CLIENTS = []
let val = 1

wss.on('connection', ws => {
  
  const sendData = (data) => {
    ws.send(JSON.stringify(data))
    
  }

  const sendStatus = (s) => {
    sendData(['status', s])
  }

  //console.log(CLIENTS[0] == CLIENTS[1])
  ws.onmessage = (message) => {
    
    const { data } = message
    
    const [task, payload] = JSON.parse(data)
    switch (task) {
      case 'init': {
        CLIENTS.push(ws)
        sendData(['seat', seat])
        break
      }
      case 'curSeat': {
        //broadcast(JSON.stringify(['seat', seat]))
        //CLIENTS[0].send(JSON.stringify(['seat', seat]))
        sendData(['seat', seat])
        // TODO
        break
      }
      case 'sitDown': {
        //console.log(payload)
        if(seat[payload[0]] === ""){
          seat[payload[0]] = payload[1]
          table.addPlayer(ws, payload[1], payload[0])
          broadcast(['seat', seat])
          sendData(['sitSuccess', payload[0]])
        }
        else{
          sendData(['error'])
        }
        
        break
      }
      case 'start':{
        console.log(table.Num)
        table.init()
        
        break
      }
      case 'play':{
        table.play(payload)
        //console.log('aaa')
        // if(payload[0] === 1){
          
        //   if(table.playerHand(Number(payload[1])) === Number(payload[2])){
        //     table.lose(Number(payload[1]))
        //   }
        //   table.play(1)
        // }
        // else if(payload[0] === 1){
        //   table.play(2)
        // }
        table.nextRound()
        break
      }
      default:
        break
    }
    table.showHand()
  }
})

const broadcast = (msg) => {
  console.log(msg)
  for (let i=0; i<CLIENTS.length; i++) {

    CLIENTS[i].send(JSON.stringify(msg));
  } 
}
const PORT = process.env.port || 4000

server.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`)
})

