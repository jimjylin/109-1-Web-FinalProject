import './App.css'
import React, { useEffect, useRef, useState } from 'react'
//import useChat from './useChat'
import { Button, Input, message, Tag ,Select } from 'antd'
import {
  CheckCircleOutlined,
  SyncOutlined,
  // CloseCircleOutlined,
  // ExclamationCircleOutlined,
  // ClockCircleOutlined,
  // MinusCircleOutlined,
} from '@ant-design/icons';
import cards from "./images";
const client = new WebSocket('ws://localhost:4000')
const { Option } = Select;
function App() {
  const [board, setBoard] = useState([[],[],[],[]])
  const [invisible, setInvisible] = useState([])
  const [alive, setAlive] = useState([])             //array, true if that player is alive
  const [guessNum,setGuessNum] = useState('')        //string, the number guessed when you played 1
  const [guess,setGuess] = useState(false)           //bool, true if need something to type guessNum
  const [choose,setChoose] = useState('')            //string, the player's number you want to cast card
  const [extraInput,setExtraInput] = useState(false) //bool, true if need something to type choose
  const [status, setStatus] = useState({})           //JSON{type, msg}, msg you want to present above the page
  const [state, setState] = useState('lobby')        //string, the state of you right now
  const [playerNames, setPlayerNames] = useState([]) //array, the name of all players on this table
  const [hand, setHand] = useState([])               //array, the card you have
  const [username, setUsername] = useState('')       //string, your name
  const [body, setBody] = useState('')               
  const [seatNo, setseatNo] = useState(-1)
  const [turn, setTurn] = useState(-1)
  const [deckNum, setDeckNum] = useState(16)
  const bodyRef = useRef(null)
  // useEffect(()=>{
    
  // })
  window.onunload = ()=>{
    sendData(['bye'])
    return "bye"
  }

  let opened = true
  const sendData = (data) => {
    client.send(JSON.stringify(data))
  }
  const sendMessage = ({ name, body })=>{
    
    if(body === 'start'){
      sendData(['start'])
    }
    else if(state !== "lobby"){
      if(body === '')
        displayStatus({type: 'error', msg: 'please choose a card to play'})
      else if(!isNaN(Number(body)) && turn === seatNo)
        playcard(Number(body))
    }
    else{
      sendData(['sitDown', [Number(body), name]])
    }
      
  }
  const clearMessages = ()=>{
    if(body === '')
      displayStatus({type: 'error', msg: 'please choose a card to play'})

    else if(!isNaN(Number(body)) && turn === seatNo)
      playcard(Number(body))

  }
  const canChoose = (n)=>{
    console.log(invisible, 'aaa')
    if(n === '') return false
    n = Number(n)
    if(n > 4 || n < 0) return false
    if(!Number.isInteger(n)) return false
    if(!alive[n] || n === seatNo) return false
    if(invisible[n]){
      let i = (n + 1)%4
      while(i !== n){
        if(alive[i] && i !== seatNo && !invisible[i]){
          return false
        }
        i = (i+1)%4
      }
    }
    return true
  }
  
  const playcard = (i)=>{

    if(i === 0 || i === 1){
      if(hand[i] === 1){
        if(!canChoose(choose)){
          displayStatus({type: 'error', msg: 'Can\'t choose that player'})
        }
        else if(!Number.isInteger(Number(guessNum))){
          displayStatus({type: 'error', msg: 'Please input an valid card number'})
        }
        else if(Number(guessNum) > 8 || Number(guessNum) < 1){
          displayStatus({type: 'error', msg: 'Please input an valid card number'})
        }
        else if(Number(guessNum) === 1){
          displayStatus({type: 'error', msg: 'Sorry, you can\'t guess card 1'})
        }
        else{
          sendData(['play', [hand[i], choose, guessNum]])
          setBody('')
          setChoose('')
          setGuessNum('')
          setHand((prev)=>{
            if(i === 0) return [prev[1]]
            else return [prev[0]]
          })
        }
      }
      else if(hand[i] === 2){
        
        if(!canChoose(choose)){
          displayStatus({type: 'error', msg: 'Can\'t choose that player'})
        }
        else{
          sendData(['play', [hand[i], choose]])
          setBody('')
          setChoose('')
          setHand((prev)=>{
            if(i === 0) return [prev[1]]
            else return [prev[0]]
          })
          
        }
      }
      else if(hand[i] === 3){
        if(!canChoose(choose)){
          displayStatus({type: 'error', msg: 'Can\'t choose that player'})
        }
        
        else{
          sendData(['play', [hand[i], Number(choose), Number(hand[1-i])]])
          setBody('')
          setChoose('')
          setHand((prev)=>{
            if(i === 0) return [prev[1]]
            else return [prev[0]]
          })
        }
      }
      else if(hand[i] === 4){
        sendData(['play', [hand[i]]])
        setBody('')
        setHand((prev)=>{
          if(i === 0) return [prev[1]]
          else return [prev[0]]
        })
      }
      else if(hand[i] === 5){
        if(hand[1-i] === 7){
          displayStatus({type: 'error', msg: 'You have to play card 7'})
        
        }
        else if(!canChoose(choose)){
          displayStatus({type: 'error', msg: 'Can\'t choose that player'})
        }
        else{
          sendData(['play', [hand[i], Number(choose)]])
          setBody('')
          setChoose('')
          setHand((prev)=>{
            if(i === 0) return [prev[1]]
            else return [prev[0]]
          })
        }
      }
      else if(hand[i] === 6){
        if(hand[1-i] === 7){
          displayStatus({type: 'error', msg: 'You have to play card 7'})
        
        }
        else if(!canChoose(choose)){
          displayStatus({type: 'error', msg: 'Can\'t choose that player'})
        }
        else{
          sendData(['play', [hand[i], Number(choose), hand[1-i]]])
          setBody('')
          setChoose('')
          setHand((prev)=>{
            if(i === 0) return [prev[1]]
            else return [prev[0]]
          })
        }
      }
      else if(hand[i] === 7){
        
        sendData(['play', [hand[i]]])
        setBody('')
        setHand((prev)=>{
          if(i === 0) return [prev[1]]
          else return [prev[0]]
        })
        
      }
      else if(hand[i] === 8){
        setBody('')
        displayStatus({type: 'error', msg: 'AAAAAAAAAA'})
      }
      
    }
    else{
      setStatus({type:'error', msg:'AAAAA'})
    }
  }
  
  
  client.onopen = ()=>{
    sendData(['init'])
  }
  client.onmessage = (message) => {
    const { data } = message
    const [task, payload] = JSON.parse(data)
    //console.log(payload)
    switch (task) {
      case 'status':{
        setStatus(payload)
        break
      }
      case 'seat':{
        setPlayerNames(payload.map((v) =>{return (v === '')?0:v}))
        setAlive(payload.map((v) =>{return (v === '')?false:true}))
        setInvisible(()=>payload.map(() =>{return false}))
        break
      }
      case 'deckNum':{
        setDeckNum(payload)
        break
      }
      case 'sitSuccess':{
        
        setseatNo(payload)
        setState('waiting for start...')
        break
      }
      case 'turn':{
        console.log(state)
        if(payload === seatNo) setState('Your turn!!')
        else if(alive[seatNo]) setState('wait')
        setInvisible((prev)=>
          //console.log(prev,'aaaaaa')
          prev.map((v, i)=>{
          return ((i !== payload) && v)
        }))
        setTurn(payload)
        break
      }
      case 'draw':{
        setHand(() => [...hand, payload])
        break
      }
      case 'win':{
        
        if(payload === seatNo){
          //console.log('aaaaa')
          setState('Your Win!')
        }
        else{
          setState('Player'+String(payload)+' Won!!')
        }
        break
      }
      case 'lose':{
        
        if(payload === seatNo){
          //console.log('aaaaa')
          setState('Your lost!')
        }
        let newArr = [...alive]
        newArr[payload] = false
        setAlive(newArr)
        
        displayStatus({type:"info", msg:"player"+String(payload)+" has been eliminated"})
        
        break
      }
      case 'invisible':{
        setInvisible((prev)=>prev.map((v, i)=>{
          return ((i === payload) || v)
        }))
        break
      }
      case 'discard':{
        setHand(()=>[])
        break
      }
      case 'setHand':{
        setHand(()=>[payload])
        break
      }
      case 'boardUpdate':{
        console.log('in')
        let temp = [...board]
        temp[payload[0]].push(payload[1])
        setBoard(()=>temp)
        break
      }
      default:
        break
    }
  }
  const disPlayer = (n) => {
    if(state === "lobby" || state === "waiting for start..." || !alive[n] ){
      return false;
    }
    return true;
  }
  const displayStatus = (s) => {
    if (s.msg) {
      const { type, msg } = s
      const content = {
        content: msg,
        duration: 2
      }

      switch (type) {
        case 'success':
          message.success(content)
          break
        case 'info':
          message.info(content)
          break
        case 'danger':
        default:
          message.error(content)
          break
      }
    }
  }

  useEffect(()=>{
    if(turn === seatNo && body!==''&&(Number(body) === 1 ||Number(body) === 0)){
      if(hand[Number(body)]===1||hand[Number(body)]===2||hand[Number(body)]===3||
      hand[Number(body)]===5||hand[Number(body)]===6){
        if(hand[Number(body)]===1){
          setGuess(true)
        }
        else setGuess(false)
        setExtraInput(true)
      }
      else{
        setGuess(false)
        setExtraInput(false)
      }
    }
    else{
      setGuess(false)
      setExtraInput(false)
    }
    //console.log(alive)
    
      
  }, [body,turn,seatNo,hand])
  useEffect(() => {
    displayStatus(status)
  }, [status])

  return (
    <div className="App">
      <div className="App-title">
        <h1>{state}</h1>
      </div>
      <div className="App-main">
        <div className="playertableA" >
          <div className="playertablename" 
          style={{
            "textDecoration":(alive[seatNo]) || state === "lobby" || state === "waiting for start..."?"":("line-through"),
            "backgroundImage": `url(${cards[9]})`
          }}>
            {playerNames[(seatNo+4)%4] !== 0 ? playerNames[(seatNo+4)%4] :   (state === "lobby" || state === "waiting for start...") ? "(waiting for player...)":""}
          </div>
          <div>
            <div 
              id="playertableA1" 
              className="playercardA" 
              onClick={state === "Your turn!!"?() =>{setBody(0)}:""} 
              style={{"backgroundImage" :  state === "lobby" || state === "waiting for start..." || !alive[seatNo]?"none":`url(${cards[hand[0]]})`, border: body === 0 ? "3px groove white":"" }}>
            </div>
            <div 
              id="playertableA2" 
              className="playercardA" 
              onClick={state === "Your turn!!"?() =>{setBody(1)}:""} 
              style={{"backgroundImage" :  state === "lobby" || state === "waiting for start..." || turn !== seatNo ? "none":`url(${cards[hand[1]]})`,  border: body === 1 ? "3px groove white":"" }}>
            </div>
          </div>
        </div>
        <div className="playertableB" >
          <div 
            className="playertablename"  
            style={{
              "textDecoration":(alive[(seatNo+1)%4]) || state === "lobby" || state === "waiting for start..."?"":"line-through", 
              "backgroundImage": state === "lobby" || state === "waiting for start..." || playerNames[(seatNo+1)%4] !== 0 ? `url(${cards[9]})` : ""
            }}>
            {playerNames[(seatNo+1)%4] !== 0 ? playerNames[(seatNo+1)%4] :   (state === "lobby" || state === "waiting for start...") ? "(waiting for player...)":""}
          </div>
          <div>
            <div 
              id="playertableB1" 
              className="playercard" 
              style={{"backgroundImage" : state === "lobby" || state === "waiting for start..." || !alive[(seatNo+1)%4] ? "none" : `url(${cards[0]})`}}>
            </div>
            <div 
              id="playertableB2" 
              className="playercard" 
              style={{"backgroundImage" :  state === "lobby" || state === "waiting for start..." || turn !== (seatNo+1)%4 || !alive[(seatNo+1)%4] ? "none" : `url(${cards[0]})` }}>
            </div>
          </div>
        </div>
        <div className="playertableC" >
          <div 
            className="playertablename"  
            style={{
              "textDecoration":(alive[(seatNo+2)%4]) || state === "lobby" || state === "waiting for start..."?"":"line-through", 
              "backgroundImage": state === "lobby" || state === "waiting for start..." || playerNames[(seatNo+2)%4] !== 0 ? `url(${cards[9]})` : ""
          }}>
            {playerNames[(seatNo+2)%4] !== 0 ? playerNames[(seatNo+2)%4] : (state === "lobby" || state === "waiting for start...") ? "(waiting for player...)":""}
          </div>
          <div>
            <div 
              id="playertableC1" 
              className="playercard" 
              style={{"backgroundImage" : state === "lobby" || state === "waiting for start..." || !alive[(seatNo+2)%4] ? "none" : `url(${cards[0]})`}}>
            </div>
            <div 
              id="playertableC2" 
              className="playercard" 
              style={{"backgroundImage" :  state === "lobby" || state === "waiting for start..." || turn !== (seatNo+2)%4 || !alive[(seatNo+2)%4] ? "none" : `url(${cards[0]})` }}>
            </div>
          </div>
        </div>
        <div className="playertableD" >
          <div 
            className="playertablename"  
            style={{
              "textDecoration":(alive[(seatNo+3)%4]) || state === "lobby" || state === "waiting for start..."?"":"line-through", 
              "backgroundImage": state === "lobby" || state === "waiting for start..." || playerNames[(seatNo+3)%4] !== 0 ? `url(${cards[9]})` : ""
          }}>
            {playerNames[(seatNo+3)%4] !== 0 ? playerNames[(seatNo+3)%4] :  ((state === "lobby" || state === "waiting for start...") ? "(waiting for player...)" : "")}
          </div>
          <div>
            <div id="playertableD1" 
              className="playercard" 
              style={{"backgroundImage" : state === "lobby" || state === "waiting for start..." || !alive[(seatNo+3)%4] ? "none" : `url(${cards[0]})`}}>
            </div>
            <div id="playertableD2" 
              className="playercard" 
              style={{"backgroundImage" :  state === "lobby" || state === "waiting for start..." || turn !== (seatNo+3)%4 || !alive[(seatNo+3)%4] ? "none" : `url(${cards[0]})` }}>
            </div>
          </div>
        </div>

        <div className="tablecenter" style={state === "wait" || state === "Your turn!!"?{}:{display:"none"}}>
          <div className="discardpile">
            <div className="lastplayed">Last played</div>
            <div className="cardlastplayed">

            </div>
          </div>
          <div className="deck">
            <div className="cardremaining">{"Deck(x"+String(deckNum)+")"}</div>
            <div className="deckcard">
            </div>
          </div>
        </div>
      </div>
      
      
      <div style={state === "lobby" || state === "waiting for start..." ?{}:{display:"none"}}>
        <Input
        className="input"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ marginBottom: 10}}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              bodyRef.current.focus()
            }
          }}
          disabled={state !== "lobby"}
        ></Input>
        <Input.Search
          className="input"
          rows={4}
          value={body}
          ref={bodyRef}
          style={{ marginBottom: 10 }}
          enterButton="Send"
          onChange={(e) => setBody(e.target.value)}
          placeholder="Type a message here..."
          onSearch={(msg) => {
            if (!msg || !username) {
              displayStatus({
                type: 'error',
                msg: 'Please enter a username and a message body.'
              })
              return
            }

            sendMessage({ name: username, body: msg })
            setBody('')
          }}
        ></Input.Search>
      </div>
      <div>
        <Select 
          className="select"
          placeholder="Select a player" 
          style={extraInput?{ width: 180 }:{ display:"none" }}
          onChange={(e) => {
            setChoose(playerNames.indexOf(e))
          }}>
          {playerNames.filter((player)=>{return (player !== 0 && player !== username)}).map((player, i) =>(
            <Option className="option" value={player}>
              {player}
            </Option>
          ))}
        </Select>
        <Select
          className="select"
          placeholder="Select a card number" 
          style={guess?{width: 180}:{display:"none"}}
          onChange={(e) => setGuessNum(e)}  
        >
            <Option className="option" value="2"> 2 </Option>
            <Option className="option" value="3"> 3 </Option>
            <Option className="option" value="4"> 4 </Option>
            <Option className="option" value="5"> 5 </Option>
            <Option className="option" value="6"> 6 </Option>
            <Option className="option" value="7"> 7 </Option>
            <Option className="option" value="8"> 8 </Option>
        </Select>
      </div> 
      <div>
        <button className="button" onClick={()=>console.log(choose, guessNum, alive)}>
          aaa
        </button>

        <Button className="button" type="primary" onClick={() => {sendData(['start'])}} style={state === "waiting for start..."?{}:{display:"none"}}>
          Start
        </Button>
        <Button className="button" type="primary" danger onClick={clearMessages} style={state === "Your turn!!" ?{}:{display:"none"}}>
          Play
        </Button>
            
              
      </div>
    </div>
  )
}

export default App
