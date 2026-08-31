import { useEffect, useState } from "react"
import { ref, set, get, onValue, runTransaction, onDisconnect, update } from "firebase/database";
import { database } from "./firebase.js";

const winCombos = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
]

const gameRef = ref(database, "game/board")
const turnRef = ref(database, "game/turn")
const winnerRef = ref(database, "game/winner")
const boardActiveRef = ref(database, "game/boardActive")
const xRef = ref(database, "game/players/x")
const oRef = ref(database, "game/players/o")
const restartRef = ref(database, "game/restart")


function App() {

  const [boardActive, setBoardActive] = useState(true)
  const [restart, setRestart] = useState({ x: false, o: false })
  const [turn, setTurn] = useState("x")
  const [winner, setWinner] = useState("")
  const [mySymbol, setMySymbol] = useState("")
  const [boardData, setBoardData] = useState([
    "", "", "",
    "", "", "",
    "", "", ""
  ])

  useEffect(() => {

    async function abc() {

      const xResult = await runTransaction(xRef, (currentValue) => {
        if (!currentValue) {
          return true
        }
      })

      if (xResult.committed) {

        setMySymbol("x")
        localStorage.setItem("mySymbol", "x")
        onDisconnect(xRef).set(false)


      } else {

        const oResult = await runTransaction(oRef, (currentValue) => {
          if (!currentValue) {
            return true
          }
        })

        if (oResult.committed) {

          setMySymbol("o")
          localStorage.setItem("mySymbol", "o")
          onDisconnect(oRef).set(false)


        } else {

          const symbol = localStorage.getItem("mySymbol")
          if (symbol) {
            setMySymbol(symbol)
          } else {
            console.log("game fulll")
          }
        }
      }
    }
    abc()

  }, [])


  useEffect(() => {
    set(gameRef, boardData)
  }, [boardData]);

  useEffect(() => {
    set(turnRef, turn)
  }, [turn]);

  useEffect(() => {
    set(winnerRef, winner)
  }, [winner]);

  useEffect(() => {
    set(boardActiveRef, boardActive)
  }, [boardActive]);


  useEffect(() => {
    onValue(gameRef, (snapshot) =>
      setBoardData(snapshot.val())
    )
    onValue(turnRef, (snapshot) =>
      setTurn(snapshot.val())
    )
    onValue(winnerRef, (snapshot) =>
      setWinner(snapshot.val())
    )
    onValue(boardActiveRef, (snapshot) =>
      setBoardActive(snapshot.val())
    )

    onValue(restartRef, (snapshot) => {
      setRestart(snapshot.val())
      if (snapshot.val().x === true && snapshot.val().o === true)
        restartGame()
    })
  }, [])

  function handleCell(index) {

    if (!boardActive) return
    if (boardData[index] !== "") return
    if (mySymbol !== turn) return
    setBoardData(items => items.map((cell, index2) =>
      index2 === index ? turn : cell
    ))
    setTurn(prev => prev === "x" ? "o" : "x")

  }

  useEffect(() => {

    const winningCombo = checkWinner()
    if (winningCombo) {
      setWinner(boardData[winningCombo[0]])
      setBoardActive(false)
      return
    }

    const isFull = boardData.every(cell => cell !== "")
    if (isFull) {
      setWinner("draw")
      setBoardActive(false)
      return
    }

  }, [boardData])


  function checkWinner() {
    const winningCombo = winCombos.find(combo =>   // some return true if any one combo is true
      combo.map(i => boardData[i])
        .every((item, _, arr) =>
          item && (item === arr[0])                 // item && ensure not check "",null or undefine
        ))
    return winningCombo
  }

  async function handleRestart() {

    await update(restartRef, {
      ["/" + mySymbol]: true
    })

  }

  function restartGame() {
    setBoardActive(true)
    setBoardData(prev => prev.map(item => item = ""))
    setTurn("x")
    setWinner("")
    set(restartRef, { x: false, o: false })
  }



  return (
    <div className=" w-dvw h-dvh overflow-hidden bg-blue-200 flex justify-center items-center ">
      <div className="border p-6 border-gray-500/20 rounded-lg bg-blue-300/20">
        <div className="flex justify-between items-center ">
          <p className="font-semibold text-blue-900 capitalize ">
            you are {mySymbol}
          </p>
          <div className="italic">

            {
              restart.x === true && mySymbol === "o" && <p> x wants to restart</p>
            }
            {
              restart.o === true && mySymbol === "x" &&  <p> o wants to restart</p>
            }
          </div>
          
        </div>
        <div className="flex items-center justify-between mx-1 ">

          <p className="text-xl font-medium text-blue-900 capitalize ">
            {turn}'s turn
          </p>

          <button
            className="bg-blue-400 py-1 px-2 mb-2 text-lg rounded-lg text-blue-50 active:bg-blue-800 hover:bg-blue-500"
            onClick={handleRestart}
          > Restart </button>
        </div>

        {

          <div
            className=" w-60 grid grid-cols-3 gap-0.5 mx-auto rounded-lg overflow-hidden "
            style={{ backgroundColor: boardActive ? "#51a2ff" : "#6a7282" }}
          >

            {
              boardData.map((cell, index) =>
                <div
                  className="  aspect-square flex justify-center items-center  cursor-pointer text-5xl leading-none  "
                  style={
                    boardActive
                      ? { backgroundColor: "#8ec5ff", color: "#155dfc" }
                      : { backgroundColor: "#99a1af", color: "#d1d5dc" }
                  }
                  onClick={() => handleCell(index)}
                  key={index}
                >
                  <span className="-translate-y-1">
                    {cell}
                  </span>
                </div>
              )
            }
          </div>
        }
        <div
          className="flex gap-1 justify-center items-center text-lg text-blue-900 font-medium capitalize my-2"
        >

          {
            (winner !== "")
              ?
              (winner === "draw")
                ?
                <p>  it's a draw </p>
                :
                <p> {winner} won !!</p>
              :
              <p> result will show here</p>
          }
        </div>

      </div>
    </div>

  )
}
export default App