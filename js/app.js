'use strict'

const WALL = 'WALL'
const FLOOR = 'FLOOR'
const BALL = 'BALL'
const GAMER = 'GAMER'

const GAMER_IMG = '<img src="img/gamer.png">'
const BALL_IMG = '<img src="img/ball.png">'

// Model:
var gBoard
var gGamerPos
var gBallsOnBoardCount
var gCountCollectedBalls
var gBallInterval

function onInitGame() {
  gGamerPos = { i: 2, j: 9 }
  gBoard = buildBoard()
  // console.table(gBoard)
  renderBoard(gBoard)
  gBallInterval = setInterval(createBalls, 3000)
  gCountCollectedBalls = 0
  gBallsOnBoardCount = 2
}

function buildBoard() {
  // Create the Matrix 10 * 12
  const board = createMat(10, 12)
  // Put FLOOR everywhere and WALL at edges
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      board[i][j] = { type: FLOOR, gameElement: null }
      if (
        i === 0 ||
        i === board.length - 1 ||
        j === 0 ||
        j === board[0].length - 1
      ) {
        board[i][j].type = WALL
      }
    }
  }

  addPassages(board)
  // Place the gamer and two balls
  board[gGamerPos.i][gGamerPos.j].gameElement = GAMER

  board[3][6].gameElement = BALL
  board[7][2].gameElement = BALL

  //   console.log(board);
  return board
}

function addPassages(board) {
  const middleRowIdx = Math.floor(board.length / 2)
  const middleColIdx = Math.floor(board[0].length / 2)
  board[0][middleColIdx].type = FLOOR
  board[board.length - 1][middleColIdx].type = FLOOR
  board[middleRowIdx][0].type = FLOOR
  board[middleRowIdx][board[0].length - 1].type = FLOOR
}

// Render the board to an HTML table
function renderBoard(board) {
  var strHTML = ''
  for (var i = 0; i < board.length; i++) {
    strHTML += '<tr>\n'
    for (var j = 0; j < board[0].length; j++) {
      const currCell = board[i][j]

      var cellClass = getClassName({ i: i, j: j }) // 'cell-3-4'

      if (currCell.type === FLOOR) cellClass += ' floor'
      else if (currCell.type === WALL) cellClass += ' wall'

      strHTML += `\t<td class="cell ${cellClass}" 
							  onclick="moveTo(${i},${j})">`

      if (currCell.gameElement === GAMER) {
        strHTML += GAMER_IMG
      } else if (currCell.gameElement === BALL) {
        strHTML += BALL_IMG
      }

      strHTML += '</td>\n'
    }
    strHTML += '</tr>\n'
  }
  // console.log('strHTML is:')
  // console.log(strHTML)
  const elBoard = document.querySelector('.board')
  elBoard.innerHTML = strHTML
}

// Move the player to a specific location
function moveTo(i, j) {
  // console.log('i', i)
  // console.log('j', j)

  const targetCell = gBoard[i][j]
  if (targetCell.type === WALL) return

  // Calculate distance to make sure we are moving to a neighbor cell
  const iAbsDiff = Math.abs(i - gGamerPos.i) // 0 / 1
  const jAbsDiff = Math.abs(j - gGamerPos.j) // 1 / 0

  // If the clicked Cell is one of the four allowed
  if (
    (iAbsDiff === 1 && jAbsDiff === 0) ||
    (jAbsDiff === 1 && iAbsDiff === 0) ||
    iAbsDiff === gBoard.length - 1 ||
    jAbsDiff === gBoard[0].length - 1
  ) {
    if (targetCell.gameElement === BALL) handaleBall()

    // Move the gamer
    // Moving from current position
    // Model:
    gBoard[gGamerPos.i][gGamerPos.j].gameElement = null // {i:2,j:9}
    // Dom:
    renderCell(gGamerPos, '')

    // Moving to selected position
    // Model:
    gGamerPos.i = i
    gGamerPos.j = j
    gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER

    // Dom:
    renderCell(gGamerPos, GAMER_IMG)
  } else console.log('TOO FAR', iAbsDiff, jAbsDiff)
}
function handaleBall() {
  gCountCollectedBalls++
  gBallsOnBoardCount--
  const elCollectedBallSpn = document.querySelector('.collected-balls span')
  elCollectedBallSpn.innerText = gCountCollectedBalls
  isVictory()
}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
  const cellSelector = '.' + getClassName(location) // '.cell-2-7'
  const elCell = document.querySelector(cellSelector)
  elCell.innerHTML = value
}

// Move the player by keyboard arrows
function onHandleKey(event) {
  const i = gGamerPos.i
  const j = gGamerPos.j

  switch (event.key) {
    case 'ArrowLeft':
      if (j === 0) moveTo(i, gBoard[0].length - 1)
      else moveTo(i, j - 1)
      break
    case 'ArrowRight':
      if (j === gBoard[0].length - 1) moveTo(i, 0)
      else moveTo(i, j + 1)
      break
    case 'ArrowUp':
      if (i === 0) moveTo(gBoard.length - 1, j)
      else moveTo(i - 1, j)
      break
    case 'ArrowDown':
      if (i === gBoard.length - 1) moveTo(0, j)
      else moveTo(i + 1, j)
      break
  }
}
function isVictory() {
  if (gBallsOnBoardCount === 0) {
    console.log('victroy')
    gameOver()
  }
}
function gameOver() {
  clearInterval(gBallInterval)
  console.log('game over')
  return
}

// Returns the class name for a specific cell
function getClassName(position) {
  // {i:2 , j:5}
  const cellClass = `cell-${position.i}-${position.j}` // 'cell-2-5'
  return cellClass
}

function createBalls() {
  var emptyPoss = findEmptyPos()
  if (!emptyPoss) return
  gBoard[emptyPoss.i][emptyPoss.j].gameElement = BALL
  renderCell(emptyPoss, BALL_IMG)
  gBallsOnBoardCount++
}

function findEmptyPos() {
  const emptyPoss = []
  // { type: FLOOR, gameElement: null }
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard.length; j++) {
      var cell = gBoard[i][j]
      if (cell.type !== WALL && !cell.gameElement) {
        var pos = { i, j }
        emptyPoss.push(pos)
      }
    }
  }
  var randIdx = getRandomInt(0, emptyPoss.length)
  var randPos = emptyPoss[randIdx]

  return randPos
}

function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min) + min) // The maximum is exclusive and the minimum is inclusive
}
