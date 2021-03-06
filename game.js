// TODO:


//  Variables
const PLAYER1 = 0;
const PLAYER2 = 1;
const OPEN_SPACE = -1;
const UNPLAYABLE = -2;
const PLAYER1_COLOR = "black";
const PLAYER2_COLOR = "white";
const PLAYER1_FILE = "img/pieceDark.png";
const PLAYER2_FILE = "img/pieceLight.png";
const PLAYER1_SHADE_FILE = "img/pieceDarkPossibleMove.png";
const PLAYER2_SHADE_FILE = "img/pieceLightPossibleMove.png";
const OPEN_FILE = "img/greenSquare.png";
const DK_SCORE = document.getElementById("dkScr");
const LT_SCORE = document.getElementById("ltScr");
const TXT_INPUT = document.querySelector("#input");

var board = [
  [],
  [],
  [],
  [],
  [],
  [],
  [],
  []
];

var player = PLAYER1; // 0 for player 1, 1 for player 2
var boxesTaken = 0;
var won = false;
var displayMessage = false;
var twoNoMovesInARow = 0;

function initializeBoard() {
  for (y = 0; y < 8; y++)
    for (x = 0; x < 8; x++) {
      board[y][x] = UNPLAYABLE;
      let strID = "i" + y + "" + x;
      document.getElementById(strID).src = OPEN_FILE;
    }
  board[3][3] = PLAYER1;
  document.getElementById("i33").src = PLAYER1_FILE;
  board[3][4] = PLAYER2;
  document.getElementById("i34").src = PLAYER2_FILE;
  board[4][3] = PLAYER2;
  document.getElementById("i43").src = PLAYER2_FILE;
  board[4][4] = PLAYER1;
  document.getElementById("i44").src = PLAYER1_FILE;
  boxesTaken = 4;
  shadeBoxes(player);
  winner();
}

jQuery(document).ready(function($) {

  initializeBoard();

  //  create the event handlers for each box of the game
  for (y = 0; y < 8; y++)
    for (x = 0; x < 8; x++) {
      let eleID = "#" + y + "" + x;
      let tempEle = $(eleID);
      $(eleID).on("click", function(event) {
        let y = this.id.substring(0, 1);
        let x = this.id.substring(1);
        let id = y + "" + x;

        makeMove(id);
        if (displayMessage)
          PopUpMessage(outputMessage);
        displayMessage = false;
      }); //  end of creating click function
    } //  end of for x
}); //  end document ready function

/*******************************************************************************
 **    Make Move
 *******************************************************************************/
function makeMove(strId) { //  get game ( remove first two charageters)
  console.log("makeMove(\"" + strId + "\");");
  let y = parseInt(strId.substring(0, 1));
  let x = parseInt(strId.substring(1));

  if (boxesTaken > 63) { // game over
    PopUpMessage("Please start another game");
    return;
  }

  //  if you are not clicking in an OPEN_SPACE square. exit function
  if (board[y][x] != OPEN_SPACE) {
    PopUpMessage("Please a valid move \n(Click one of the shaded squares)");
    return;
  }

  //  the square is OPEN_SPACE
  let colorFile = (player == PLAYER1) ? PLAYER1_FILE : PLAYER2_FILE;
  document.getElementById("i" + strId).src = colorFile; // paint it player one's color
  //document.getElementById(strId).style.backgroundColor = url(colorFile); // paint it player one's color
  board[y][x] = player; //  put this square's id in the array
  boxesTaken++;
  clearShadeBoxes();
  flipSquares(x, y, colorFile);

  if (winner()) {
    PopUpMessage("press reset to Play again");
    return;
  }

  player = (player ^ PLAYER1) ? PLAYER1 : PLAYER2; //  change player
  shadeBoxes(player); //  sahde the next player's available moves
  if (twoNoMovesInARow == 2) {
    PopUpMessage("Now More Valid moves");
    /*
    if (p1Count > p2Count)
      PopUpMessage("Dark Player won");
    if (p1Count < p2Count)
      PopUpMessage("Light Player won");
    if (p1Count == p2Count)
      PopUpMessage("It's a tie!");
      */
    return;
  }

  //  set next turn color
  let color = (player == PLAYER1) ? PLAYER1_COLOR : PLAYER2_COLOR;
  document.getElementById("turnbox").style.backgroundColor = color;

  //document.getElementById('Undo').disabled = false;
} //  end clicked function
/*******************************************************************************
 **    Do we have a winner ??
 *******************************************************************************/
function winner() {
  let p1Count = 0;
  let p2Count = 0;
  let retVal = false;

  for (y = 0; y < 8; y++)
    for (x = 0; x < 8; x++) {
      if (board[y][x] == PLAYER1)
        p1Count++;
      if (board[y][x] == PLAYER2)
        p2Count++;
    }

  DK_SCORE.value = p1Count;
  LT_SCORE.value = p2Count;

  if (boxesTaken > 63) {
    if (p1Count > p2Count)
      PopUpMessage("Dark Player won");
    if (p1Count < p2Count)
      PopUpMessage("Light Player won");
    if (p1Count == p2Count)
      PopUpMessage("It's a tie!");
    retVal = true;
  }

  return retVal;
}

/*******************************************************************************
 **     Clear the Shadeboxes
 *******************************************************************************/
function clearShadeBoxes() {
  //  change the available spaces to be just a green space
  for (y = 0; y < 8; y++)
    for (x = 0; x < 8; x++)
      if (board[y][x] == OPEN_SPACE) {
        board[y][x] = UNPLAYABLE;
        let tmpID = "i" + y + "" + x;
        document.getElementById(tmpID).src = OPEN_FILE;
      }
}

/*******************************************************************************
 **    Shadeboxes
 *******************************************************************************/
function shadeBoxes(player) {
  /*  Valid Moves
  Dark must place a piece with the dark side up on the board, in such a position
  that there exists at least one straight (horizontal, vertical, or diagonal)
  occupied line between the new piece and another dark piece, with one or more
  contiguous light pieces between them.
  */
  /*
  find a black,  move in a direction while the square is white.
  do this until the suare is free.  this is a valid move.
     - set teh array to -1,
     - increment blackValidMove
   do this for all black pieces in all directions
  */
  const otherPlayer = (player ^ PLAYER1) ? PLAYER1 : PLAYER2;
  const colorFile = (player == PLAYER1) ? PLAYER1_SHADE_FILE : PLAYER2_SHADE_FILE;
  let totShadedCount = 0; // the number of valid moves
  let count = 0;
  let x = 0;
  let y = 0;
  let i = 0;
  let j = 0;
  for (y = 0; y < 8; y++)
    for (x = 0; x < 8; x++) {
      if (board[y][x] == player) {
        //  check in each direction for other player and open spot
        // left
        if (x != 0) {
          i = x - 1;
          count = 0;
          while (i >= 0 && board[y][i] == otherPlayer) {
            i--;
            count++;
          }
          if (i >= 0 && count && board[y][i] == UNPLAYABLE) {
            let tmpID = "i" + y + "" + i;
            board[y][i] = OPEN_SPACE;
            document.getElementById(tmpID).src = colorFile;
            totShadedCount++;
          }
        }

        // right
        if (x != 7) {
          i = x + 1;
          count = 0;
          while (i < 8 && board[y][i] == otherPlayer) {
            i++;
            count++;
          }
          if (i < 8 && count && board[y][i] == UNPLAYABLE) {
            let tmpID = "i" + y + "" + i;
            board[y][i] = OPEN_SPACE;
            document.getElementById(tmpID).src = colorFile;
            totShadedCount++;
          }
        }

        // up
        if (y != 0) {
          j = y - 1;
          count = 0;
          while (j >= 0 && board[j][x] == otherPlayer) {
            j--;
            count++;
          }
          if (j >= 0 && count && board[j][x] == UNPLAYABLE) {
            let tmpID = "i" + j + "" + x;
            board[j][x] = OPEN_SPACE;
            document.getElementById(tmpID).src = colorFile;
            totShadedCount++;
          }
        }

        // down
        if (y != 7) {
          j = y + 1;
          count = 0;
          while (j < 8 && board[j][x] == otherPlayer) {
            j++;
            count++;
          }
          if (j < 8 && count && board[j][x] == UNPLAYABLE) {
            let tmpID = "i" + j + "" + x;
            board[j][x] = OPEN_SPACE;
            document.getElementById(tmpID).src = colorFile;
            totShadedCount++;
          }
        }

        // upper left
        if (x != 0 && y != 0) {
          i = x - 1;
          j = y - 1;
          count = 0;
          while (j >= 0 && i >= 0 && board[j][i] == otherPlayer) {
            j--;
            i--;
            count++;
          }
          if (j >= 0 && i >= 0 && count && board[j][i] == UNPLAYABLE) {
            let tmpID = "i" + j + "" + i;
            board[j][i] = OPEN_SPACE;
            document.getElementById(tmpID).src = colorFile;
            totShadedCount++;
          }
        }

        // upper right
        if (x != 7 && y != 0) {
          i = x + 1;
          j = y - 1;
          count = 0;
          while (j >= 0 && i < 8 && board[j][i] == otherPlayer) {
            j--;
            i++;
            count++;
          }
          if (j >= 0 && i < 8 && count && board[j][i] == UNPLAYABLE) {
            let tmpID = "i" + j + "" + i;
            board[j][i] = OPEN_SPACE;
            document.getElementById(tmpID).src = colorFile;
            totShadedCount++;
          }
        }

        // lower left
        if (x != 0 && y != 7) {
          i = x - 1;
          j = y + 1;
          count = 0;
          while (j < 8 && i >= 0 && board[j][i] == otherPlayer) {
            j++;
            i--;
            count++;
          }
          if (j < 8 && i >= 0 && count && board[j][i] == UNPLAYABLE) {
            let tmpID = "i" + j + "" + i;
            board[j][i] = OPEN_SPACE;
            document.getElementById(tmpID).src = colorFile;
            totShadedCount++;
          }
        }

        // lower right
        if (x != 7 && y != 7) {
          i = x + 1;
          j = y + 1;
          count = 0;
          while (j < 8 && i < 8 && board[j][i] == otherPlayer) {
            j++;
            i++;
            count++;
          }
          if (j < 8 && i < 8 && count && board[j][i] == UNPLAYABLE) {
            let tmpID = "i" + j + "" + i;
            board[j][i] = OPEN_SPACE;
            document.getElementById(tmpID).src = colorFile;
            totShadedCount++;
          }
        }
      } //  end if player
    }
  if (totShadedCount == 0) {
    twoNoMovesInARow++
    if (twoNoMovesInARow == 1) {
      PopUpMessage("Now More Valid moves for Player: " + (player+1));
      player = (player ^ PLAYER1) ? PLAYER1 : PLAYER2;
      shadeBoxes(player);
    }
  } else
    twoNoMovesInARow = 0;

} //end shade Boxes

/*******************************************************************************
 **    Reset
 *******************************************************************************/
function Reset() {
  boxesTaken = 0;
  won = false;
  displayMessage = false;
  twoNoMovesInARow = 0;
  initializeBoard();
}

/*******************************************************************************
 **    flipSquares
 *******************************************************************************/
function flipSquare(y, x, color) {
  board[y][x] = player;
  let tmpStrID = "i" + y + "" + x;
  document.getElementById(tmpStrID).src = color;
}

function flipSquares(x, y, color) {
  //  check to see if we need to switch colors
  //check left
  let i = x - 1; //  the test x variable
  let j = y; //  the test y variable
  let found = false;
  let opCount = 0; //  the number of oponent squares inbetween mine
  while (i >= 0 && !found) {
    if (board[j][i] == player)
      found = true;
    else if (board[j][i] == !player)
      opCount++;
    i--;
  }
  if (found) {
    i += 2; //  remove the decrement from above and move one more to the right
    if (x - i == opCount)
      for (i; i <= x; i++) {
        flipSquare(j, i, color);
        /*
        board[j][i] = player;
        let tmpStrID = "i" + j + "" + i;
        document.getElementById(tmpStrID).src = color;
        */
      }
  }

  //check right
  i = x + 1; //  the test x variable
  j = y; //  the test y variable
  found = false;
  opCount = 0;
  while (i < 8 && !found) {
    if (board[j][i] == player)
      found = true;
    else if (board[j][i] == !player)
      opCount++;
    i++;
  }
  if (found) {
    i -= 2; //  remove the increment from above and move one more to the left
    if (i - x == opCount)
      for (i; i > x; i--) {
        flipSquare(j, i, color);
      }
  }

  //check up
  i = x; //  the test x variable
  j = y - 1; //  the test y variable
  found = false;
  opCount = 0;
  while (j >= 0 && !found) {
    if (board[j][i] == player)
      found = true;
    else if (board[j][i] == !player)
      opCount++;
    j--;
  }
  if (found) {
    j += 2; //  remove the decrement from above and move one more down
    if (y - j == opCount)
      for (j; j < y; j++) {
        flipSquare(j, i, color);
      }
  }

  //check down
  i = x; //  the test x variable
  j = y + 1; //  the test y variable
  found = false;
  opCount = 0;
  while (j < 8 && !found) {
    if (board[j][i] == player)
      found = true;
    else if (board[j][i] == !player)
      opCount++;
    j++;
  }
  if (found) {
    j -= 2; //  remove the increment from above and move one more up
    if (j - y == opCount)
      for (j; j > y; j--) {
        flipSquare(j, i, color);
      }
  }

  //  check diagonal up / left - both minus
  i = x - 1;
  j = y - 1;
  found = false;
  opCount = 0; //  the number of oponent squares inbetween mine
  while (j >= 0 && i >= 0 && !found) {
    if (board[j][i] == player)
      found = true;
    else if (board[j][i] == !player)
      opCount++;
    j--;
    i--;
  }
  if (found) {
    i += 2; //  remove the decrement from above and move one more to the right
    j += 2; //  remove the decrement from above and move one more to the down
    if (y - j == opCount)
      for (j, i; j < y && i < x; j++, i++) {
        flipSquare(j, i, color);
      }
  }

  //  check diagonal up / right  -  y minus / x plus
  i = x + 1;
  j = y - 1;
  found = false;
  opCount = 0; //  the number of oponent squares inbetween mine
  while (j >= 0 && i < 8 && !found) {
    if (board[j][i] == player)
      found = true;
    else if (board[j][i] == !player)
      opCount++;
    j--;
    i++;
  }
  if (found) {
    i -= 2; //  remove the increment from above and move one more to the left
    j += 2; //  remove the decrement from above and move one more to the down
    if (y - j == opCount)
      for (j, i; j < y && i > x; j++, i--) {
        flipSquare(j, i, color);
      }
  }
  // check diagonal down / left  - y plus / x minus
  i = x - 1;
  j = y + 1;
  found = false;
  opCount = 0; //  the number of oponent squares inbetween mine
  while (j < 8 && i >= 0 && !found) {
    if (board[j][i] == player)
      found = true;
    else if (board[j][i] == !player)
      opCount++;
    j++;
    i--;
  }
  if (found) {
    i += 2; //  remove the increment from above and move one more to the right
    j -= 2; //  remove the decrement from above and move one more up
    if (j - y == opCount)
      for (j, i; j > y && i < x; j--, i++) {
        flipSquare(j, i, color);
      }
  }
  // check diagonal down / right  - both plus
  i = x + 1;
  j = y + 1;
  found = false;
  opCount = 0; //  the number of oponent squares inbetween mine
  while (j < 8 && i < 8 && !found) {
    if (board[j][i] == player)
      found = true;
    else if (board[j][i] == !player)
      opCount++;
    j++;
    i++;
  }
  if (found) {
    i -= 2; //  remove the increment from above and move one more to the left
    j -= 2; //  remove the decrement from above and move one more up
    if (j - y == opCount)
      for (j, i; j > y && i > x; j--, i--) {
        flipSquare(j, i, color);
      }
  }
}

/*******************************************************************************
 **    Undo
 *******************************************************************************/
function Undo() {
  var previousID = previousIDs.pop();
  var previousGame = previousID.substring(0, 1) - 1;
  var strP_Box = previousID.slice(2);
  var previousBox = parseFloat(strP_Box);
  var previousPlayer = (player ^ PLAYER1) ? PLAYER1 : PLAYER2;

  //  need to figure out if the sub gane was just won
  player1WinBox = playerScore[PLAYER1][OUTERGAME].indexOf(gameLocation[previousGame]);
  if (player1WinBox != -1) { //  if so, remove winning game from OUTERGAME
    playerScore[PLAYER1][OUTERGAME].splice(playerScore[player][previousGame].indexOf(previousBox), 1);
  }
  player2WinBox = playerScore[PLAYER2][OUTERGAME].indexOf(gameLocation[previousGame]);
  if (player2WinBox != -1) { //  if so, remove winning game from OUTERGAME
    playerScore[PLAYER2][OUTERGAME].splice(playerScore[PLAYER2][OUTERGAME].indexOf(gameLocation[previousGame]), 1);
  }

  //  clear the board
  for (g = 0; g < 9; g++) // game
    for (y = 1; y <= 3; y++)
      for (x = 1; x <= 3; x++) {
        myIndex = g + 1 + "." + y + "." + x;
        if ((document.getElementById(myIndex).style.backgroundColor == PLAYER2_SHADE) ||
          (document.getElementById(myIndex).style.backgroundColor == PLAYER1_SHADE))
          document.getElementById(myIndex).style.backgroundColor = ""
      } //  end for y
  //  remove the move from the array
  playerScore[previousPlayer][previousGame].splice(playerScore[player][previousGame].indexOf(previousBox), 1);

  //  put board back the way it was
  for (y = 1; y <= 3; y++)
    for (x = 1; x <= 3; x++) {
      myIndex = previousGame + 1 + "." + y + "." + x;
      thisBox = parseFloat(y + "." + x);;
      document.getElementById(myIndex).style.backgroundColor = "";
      inPlayer1Array = playerScore[PLAYER1][previousGame].indexOf(thisBox);
      inPlayer2Array = playerScore[PLAYER2][previousGame].indexOf(thisBox);
      if (inPlayer1Array != -1)
        document.getElementById(myIndex).style.backgroundColor = PLAYER1_COLOR
      if (inPlayer2Array != -1)
        document.getElementById(myIndex).style.backgroundColor = PLAYER2_COLOR
    }

  var lastshade = (player != PLAYER1) ? PLAYER1_SHADE : PLAYER2_SHADE;
  player = (player ^ PLAYER1) ? PLAYER1 : PLAYER2;
  var lastcolor = (player == PLAYER1) ? PLAYER1_COLOR : PLAYER2_COLOR;

  //  shade the game for posible moves
  if (1 != boxesTaken) {
    shadeBoxes(previousGame, lastshade);
  }

  document.getElementById("turnbox").style.backgroundColor = lastcolor;
  boxesTaken--;
  currentGameNumber = previousGame;
  playerScore[player][previousGame].indexOf(previousBox);
  document.getElementById('Undo').disabled = true;
}


// got the modal code form:
//  https://www.w3schools.com/howto/howto_css_modals.asp
function PopUpMessage(message) {
  alert(message);
}
