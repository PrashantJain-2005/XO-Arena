import { useEffect, useState } from "react"

const winCombos = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
]

function App() {

  const [boardActive, setBoardActive] = useState(true)
  const [turn, setTurn] = useState("o")
  const [winner, setWinner] = useState("")
  const [boardData, setBoardData] = useState([
    "", "", "",
    "", "", "",
    "", "", ""
  ])

  function handleCell(index) {

    if (!boardActive) return
    if (boardData[index] !== "") return
    setBoardData(items => items.map((cell, index2) =>
      index2 === index ? turn : cell
    ))
  }

  useEffect(() => {

    if (boardData.every(cell => cell === "")) {     // to stop initial rendering
      return
    }

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

    setTurn(prev => prev === "x" ? "o" : "x")

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
    setTurn("o")
    setWinner("")
  }



  return (
    <div className=" w-dvw h-dvh overflow-hidden bg-blue-200 flex justify-center items-center ">
      <div>

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
        style = {{ backgroundColor : boardActive ? "#51a2ff"  : "#6a7282" }}
        >

          {
            boardData.map((cell, index) =>
              <div
                className="  aspect-square flex justify-center items-center  cursor-pointer text-5xl leading-none  "
                style = {
                  boardActive 
                  ? { backgroundColor : "#8ec5ff", color: "#155dfc"} 
                  : { backgroundColor : "#99a1af", color: "#d1d5dc"}    
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