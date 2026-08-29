import { useEffect, useState } from "react"
import { ref, set, get, onValue, runTransaction } from "firebase/database";
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
const playerRef = ref(database, "game/players")
const xRef = ref(database, "game/players/x")
const oRef = ref(database, "game/players/o")

// set(playerRef, { x: false, o: false })



function App() {



  const [boardActive, setBoardActive] = useState(true)
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

        console.log(xResult.committed)
        setMySymbol("x")
        localStorage.setItem("mySymbol", "x")

      } else {

        const oResult = await runTransaction(oRef, (currentValue) => {
          if (!currentValue) {
            return true
          }
        })

        if (oResult.committed) {

          setMySymbol("o")
          localStorage.setItem("mySymbol", "o")

        } else {

          if (localStorage.getItem("mySymbol")) {
            setMySymbol(localStorage.getItem("mySymbol"))
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

  function handleRestart() {
    setBoardActive(true)
    setBoardData(prev => prev.map(item => item = ""))
    setTurn("x")
    setWinner("")
  }



  return (
    <div className=" w-dvw h-dvh overflow-hidden bg-blue-200 flex justify-center items-center ">
      <div>
        <p>
          you are {mySymbol}
        </p>
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