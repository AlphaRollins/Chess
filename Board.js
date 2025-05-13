const gameBoard = document.getElementById("gameBoard")
const width = 8

const startingPieces = [
    rook,knight,bishop,queen,king,bishop,knight,rook,
    pawn,pawn,pawn,pawn,pawn,pawn,pawn,pawn,
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
    pawn,pawn,pawn,pawn,pawn,pawn,pawn,pawn,
    rook,knight,bishop,queen,king,bishop,knight,rook
]

function createBoard() {
    startingPieces.forEach((startPiece, i) => {
        const square = document.createElement('div')
        square.classList.add('square')
        square.innerHTML = startPiece
        square.firstChild?.setAttribute('draggable', true)
        square.setAttribute('squareID',i)

        const row = Math.floor( (63 - i) / 8) + 1
        if (row % 2 === 0){
            square.classList.add(i % 2 === 0 ? "beige" : "brown")
        }else {
            square.classList.add(i % 2 === 0 ? "brown" : "beige")
        }
        
        if(i <= 15){
            square.firstChild.classList.add('black')
        }
        if(i >= 48){
            square.firstChild.classList.add('white')
        }

        gameBoard.append(square)
    })
}
createBoard()