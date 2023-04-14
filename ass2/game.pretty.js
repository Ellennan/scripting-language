var board = new Array();
for (var i = 0; i < 10; i++) {
   board[i] = new Array();
   for (var j = 0; j < 10; j++) {
      board[i][j] = 0;
   }
}

var stage = 0;
var numOfHero = 0;
var heroX;
var heroY;
var numOfKiller = 0;
var killerPosition = new Array();
var round = 1;
var numOfTreasure = 0;
var heroScore = 0;
var killerScore = 0;
var movableHero = false;
var movableRobot = true;

// convert input to the corresponding image
function convert(input) {
   if (input === 0) {
      return "";
   } else if (Number(input)) {
      // treasure image
      return '<img src="treasure.jpg" width="45" height="45" style="vertical-align:middle">';
   } else if (input === "h") {
      // hero image
      return '<img src="hero.jpg" width="45" height="45" style="vertical-align:middle">';
   } else if (input === "o") {
      // obstacle image
      return '<img src="obstacle.jpg" width="45" height="45" style="vertical-align:middle">';
   } else if (input === "k") {
      // killer image
      return '<img src="killer.jpg" width="45" height="45" style="vertical-align:middle">';
   }
}

function clearMessage() {
   m1 = document.getElementById("m1");
   m1.style.display = "none";
}

function showMessage(message, style) {
   m1 = document.getElementById("m1");
   m1.innerHTML = message;
   m1.style.display = "block";
   m1.className = style;
}

function validateInput(input) {
   clearMessage();
   console.log(input);
   if (input === null) {
      // the user click "cancel"
      return -1;
   } else {
      if (input === "h") {
         // enter h
         if (numOfHero === 0) {
            // no hero existed
            // valid input
            return 1;
         } else {
            // hero already existed
            alert("Only 1 hero is allowed");
            // invalid input
            return 0;
         }
      } else if (input.match(/^[1-9ok]$/)) {
         // valid input
         return 1;
      } else {
         // invalid input
         alert("Invalid input");
         return 0;
      }
   }
}

function setup(x, y, event) {
   if (stage === 0) {
      clearMessage();
      console.log("x = " + x + " y = " + y);
      console.log("b = " + board[y][x]);
      if (board[y][x] !== 0) {
         // grid already occupied
         showMessage("Grid position [" + x + "," + y + "] already occupied", "RedBG");
      } else {
         do {
            // request input until the input is valid or click "cancel"
            var input = prompt("Type number(1-9), letter o, h or k");
         } while (validateInput(input) === 0);
         // check input and update corresponding information
         if (Number(input)) {
            // type a number between 1 and 9
            board[y][x] = parseInt(input);
            numOfTreasure += 1;
            document.getElementById("treasure").innerHTML = numOfTreasure;
         } else {
            if (input === "o") {
               // type letter "o"
               board[y][x] = "o";
            } else if (input === "h") {
               // type letter "h"
               board[y][x] = "h";
               numOfHero = 1;
               // record the position of hero
               heroX = x;
               heroY = y;
            } else if (input === "k") {
               // type letter "k"
               board[y][x] = "k";
               numOfKiller += 1;
               // record position of killer
               killerPosition.push([x, y]);
            }
         }
         if (input !== null) {
            event = event || window.event;
            // place corresponding image on the cell
            event.target.innerHTML = convert(input);
         }
      }
   }
}

function init(table) {
   for (y = 0; y < board.length; y++) {
      var tr = document.createElement("tr");
      table.appendChild(tr);
      for (x = 0; x < board[y].length; x++) {
         var td = document.createElement("td");
         var txt = document.createTextNode(convert(board[y][x]));
         td.appendChild(txt);
         if (td.addEventListener) { // all good browers
            td.addEventListener("click", setup.bind(null, x, y), false);
         } else { // MS IE broswer
            td.attachEvent("onclick", setup.bind(null, x, y));
         }
         tr.appendChild(td);
      }
   }
}

table = document.getElementById('t1');
init(table);

function endSetup() {
   if (numOfHero === 0) {
      // without placing the hero
      alert("No hero!");
   } else {
      // play stage
      stage = 1;
      // change heading
      document.getElementById("h3").innerHTML = "Play stage";
      // change button
      play = document.getElementById("play");
      play.style.display = 'none';
      end = document.getElementById("end");
      end.style.display = 'block';
      end.style = "margin:0 auto";

      if (numOfTreasure === 0) {
         // no treasure, proceed to the end stage
         endGame();
         return;
      }

      // check whether hero is able to move
      if ((heroX - 1) >= 0 && board[heroY][heroX - 1] !== "o") {
         movableHero = true;
      } else if ((heroX + 1) < 10 && board[heroY][heroX + 1] !== "o") {
         movableHero = true;
      } else if ((heroY - 1) >= 0 && board[heroY - 1][heroX] !== "o") {
         movableHero = true;
      } else if ((heroY + 1) < 10 && board[heroY + 1][heroX] !== "o") {
         movableHero = true;
      }

      // add keydown event
      document.onkeydown = processKey;
   }
}

function processKey(e) {
   // process keydown if in the play stage
   if (stage === 1) {
      clearMessage();
      e = e || window.event;
      switch (e.keyCode) {
         // type "a"
         case 65:
            console.log("left");
            move("left");
            break;

         // type "d"
         case 68:
            console.log("right");
            move("right");
            break;

         // type "w"
         case 87:
            console.log("up");
            move("up");
            break;

         // type "s"
         case 83:
            console.log("down");
            move("down");
            break;

         // invalid typing
         default:
            showMessage("Invalid typing", "RedBG");
      }
   }
}

function moveHero(direction) {
   switch (direction) {
      case "left":
         // check the cell on the left
         if ((heroX - 1) >= 0) {
            if (board[heroY][heroX - 1] === "o") {
               // left cell occupied by an obstacle
               showMessage("Occupied by an obstacle", "RedBG");
            } else if (board[heroY][heroX - 1] === "k") {
               // left cell is a killer, the user dies
               die();
            } else {
               // move to left cell
               if (board[heroY][heroX - 1] > 0) {
                  // left cell is a treasure, decrease the number of treasure, add to user score
                  numOfTreasure -= 1;
                  heroScore += board[heroY][heroX - 1];
               }
               // update  information
               board[heroY][heroX] = 0;
               board[heroY][heroX - 1] = "h";
               table.rows[heroY].cells[heroX].innerHTML = convert(0);
               table.rows[heroY].cells[heroX - 1].innerHTML = convert("h");
               heroX -= 1;
            }
         } else {
            // no cell on the left
            showMessage("Outside the grid", "RedBG");
         }
         break;

      case "right":
         // check the cell on the right
         if ((heroX + 1) < 10) {
            if (board[heroY][heroX + 1] === "o") {
               // right cell occupied by an obstacle
               showMessage("Occupied by an obstacle", "RedBG");
            } else if (board[heroY][heroX + 1] === "k") {
               // right cell is a killer, the user dies
               die();
            } else {
               // move to right cell
               if (board[heroY][heroX + 1] > 0) {
                  // right cell is a treasure, decrease the number of treasure, add user score
                  numOfTreasure -= 1;
                  heroScore += board[heroY][heroX + 1];
               }
               // update information
               board[heroY][heroX] = 0;
               board[heroY][heroX + 1] = "h";
               table.rows[heroY].cells[heroX].innerHTML = convert(0);
               table.rows[heroY].cells[heroX + 1].innerHTML = convert("h");
               heroX += 1;
            }
         } else {
            // no cell on the right
            showMessage("Outside the grid", "RedBG");
         }
         break;

      case "up":
         // check the up cell
         if ((heroY - 1) >= 0) {
            if (board[heroY - 1][heroX] === "o") {
               // up cell occupied by an obstacle
               showMessage("Occupied by an obstacle", "RedBG");
            } else if (board[heroY - 1][heroX] === "k") {
               // up cell is a killer, the user dies
               die();
            } else {
               // move to up cell
               if (board[heroY - 1][heroX] > 0) {
                  // up cell is a treasure, decrease the number of treasure, add user score
                  numOfTreasure -= 1;
                  heroScore += board[heroY - 1][heroX];
               }
               // update information
               board[heroY][heroX] = 0;
               board[heroY - 1][heroX] = "h";
               table.rows[heroY].cells[heroX].innerHTML = convert(0);
               table.rows[heroY - 1].cells[heroX].innerHTML = convert("h");
               heroY -= 1;
            }
         } else {
            // no up cell
            showMessage("Outside the grid", "RedBG");
         }
         break;

      case "down":
         // check the down cell
         if ((heroY + 1) < 10) {
            if (board[heroY + 1][heroX] === "o") {
               // down cell occupied by an obstacle
               showMessage("Occupied by an obstacle", "RedBG");
            } else if (board[heroY + 1][heroX] === "k") {
               // down cell is a killer, the user dies
               die();
            } else {
               // move to down cell
               if (board[heroY + 1][heroX] > 0) {
                  // down cell is a treasure, decrease the number of treasure, add user score
                  numOfTreasure -= 1;
                  heroScore += board[heroY + 1][heroX];
               }
               // update information
               board[heroY][heroX] = 0;
               board[heroY + 1][heroX] = "h";
               table.rows[heroY].cells[heroX].innerHTML = convert(0);
               table.rows[heroY + 1].cells[heroX].innerHTML = convert("h");
               heroY += 1;
            }
         } else {
            // no down cell
            showMessage("Outside the grid", "RedBG");
         }
         break;
   }
}

function moveRobots() {
   // record the number of unmovable robots
   var numOfUnmovable = 0;

   // move each robot
   for (var i = 0; i < numOfKiller; i++) {
      // get the position of robot
      var x = killerPosition[i][0];
      var y = killerPosition[i][1];

      // find hero
      var diffX = heroX - x;
      var diffY = heroY - y;
      if (Math.abs(diffX) <= 1 && Math.abs(diffY) <= 1) {
         // hero is in the surrounding cell
         // hero dies
         die();
         return;
      }

      // no hero surrounding
      // find treasure in the surrounding cells
      // if find, move and update information
      if (y - 1 >= 0) {
         if (board[y - 1][x] > 0) {
            // upper cell
            numOfTreasure -= 1;
            killerScore += board[y - 1][x];
            board[y][x] = 0;
            board[y - 1][x] = "k";
            table.rows[y].cells[x].innerHTML = convert(0);
            table.rows[y - 1].cells[x].innerHTML = convert("k");
            killerPosition[i] = [x, y - 1];
            continue;
         } else if (x - 1 >= 0 && board[y - 1][x - 1] > 0) {
            // upper left cell
            numOfTreasure -= 1;
            killerScore += board[y - 1][x - 1];
            board[y][x] = 0;
            board[y - 1][x - 1] = "k";
            table.rows[y].cells[x].innerHTML = convert(0);
            table.rows[y - 1].cells[x - 1].innerHTML = convert("k");
            killerPosition[i] = [x - 1, y - 1];
            continue;
         } else if (x + 1 < 10 && board[y - 1][x + 1] > 0) {
            // upper right cell
            numOfTreasure -= 1;
            killerScore += board[y - 1][x + 1];
            board[y][x] = 0;
            board[y - 1][x + 1] = "k";
            table.rows[y].cells[x].innerHTML = convert(0);
            table.rows[y - 1].cells[x + 1].innerHTML = convert("k");
            killerPosition[i] = [x + 1, y - 1];
            continue;
         }
      }
      if (x - 1 >= 0 && board[y][x - 1] > 0) {
         // left cell
         numOfTreasure -= 1;
         killerScore += board[y][x - 1];
         board[y][x] = 0;
         board[y][x - 1] = "k";
         table.rows[y].cells[x].innerHTML = convert(0);
         table.rows[y].cells[x - 1].innerHTML = convert("k");
         killerPosition[i] = [x - 1, y]
         continue;
      } else if (x + 1 < 10 && board[y][x + 1] > 0) {
         // right cell
         numOfTreasure -= 1;
         killerScore += board[y][x + 1];
         board[y][x] = 0;
         board[y][x + 1] = "k";
         table.rows[y].cells[x].innerHTML = convert(0);
         table.rows[y].cells[x + 1].innerHTML = convert("k");
         killerPosition[i] = [x + 1, y];
         continue;
      }
      if (y + 1 < 10) {
         if (board[y + 1][x] > 0) {
            // lower cell
            numOfTreasure -= 1;
            killerScore += board[y + 1][x];
            board[y][x] = 0;
            board[y + 1][x] = "k";
            table.rows[y].cells[x].innerHTML = convert(0);
            table.rows[y + 1].cells[x].innerHTML = convert("k");
            killerPosition[i] = [x, y + 1];
            continue;
         } else if (x - 1 >= 0 && board[y + 1][x - 1] > 0) {
            // lower left cell
            numOfTreasure -= 1;
            killerScore += board[y + 1][x - 1];
            board[y][x] = 0;
            board[y + 1][x - 1] = "k";
            table.rows[y].cells[x].innerHTML = convert(0);
            table.rows[y + 1].cells[x - 1].innerHTML = convert("k");
            killerPosition[i] = [x - 1, y + 1];
            continue;
         } else if (x + 1 < 10 && board[y + 1][x + 1] > 0) {
            // lower right cell
            numOfTreasure -= 1;
            killerScore += board[y + 1][x + 1];
            board[y][x] = 0;
            board[y + 1][x + 1] = "k";
            table.rows[y].cells[x].innerHTML = convert(0);
            table.rows[y + 1].cells[x + 1].innerHTML = convert("k");
            killerPosition[i] = [x + 1, y + 1];
            continue;
         }
      }

      // no hero or treasure surrounding
      // move towards hero
      diffX = Math.sign(diffX);
      diffY = Math.sign(diffY);
      if (board[y + diffY][x + diffX] === 0) {
         // the cell in the direction of hero is not occupied
         // move and update information
         board[y][x] = 0;
         board[y + diffY][x + diffX] = "k";
         table.rows[y].cells[x].innerHTML = convert(0);
         table.rows[y + diffY].cells[x + diffX].innerHTML = convert("k");
         killerPosition[i] = [x + diffX, y + diffY];
         continue;
      }

      // no hero or treasure surrounding and the cell in the direction of hero is occupied
      // move to an arbitrary empty cell
      if (y - 1 >= 0) {
         if (board[y - 1][x] === 0) {
            // upper cell
            board[y][x] = 0;
            board[y - 1][x] = "k";
            table.rows[y].cells[x].innerHTML = convert(0);
            table.rows[y - 1].cells[x].innerHTML = convert("k");
            killerPosition[i] = [x, y - 1];
            continue;
         } else if (x - 1 >= 0 && board[y - 1][x - 1] === 0) {
            // upper left cell
            board[y][x] = 0;
            board[y - 1][x - 1] = "k";
            table.rows[y].cells[x].innerHTML = convert(0);
            table.rows[y - 1].cells[x - 1].innerHTML = convert("k");
            killerPosition[i] = [x - 1, y - 1];
            continue;
         } else if (x + 1 < 10 && board[y - 1][x + 1] === 0) {
            // upper right cell
            board[y][x] = 0;
            board[y - 1][x + 1] = "k";
            table.rows[y].cells[x].innerHTML = convert(0);
            table.rows[y - 1].cells[x + 1].innerHTML = convert("k");
            killerPosition[i] = [x + 1, y - 1];
            continue;
         }
      }
      if (x - 1 >= 0 && board[y][x - 1] === 0) {
         // left cell
         board[y][x] = 0;
         board[y][x - 1] = "k";
         table.rows[y].cells[x].innerHTML = convert(0);
         table.rows[y].cells[x - 1].innerHTML = convert("k");
         killerPosition[i] = [x - 1, y]
         continue;
      } else if (x + 1 < 10 && board[y][x + 1] === 0) {
         // right cell
         board[y][x] = 0;
         board[y][x + 1] = "k";
         table.rows[y].cells[x].innerHTML = convert(0);
         table.rows[y].cells[x + 1].innerHTML = convert("k");
         killerPosition[i] = [x + 1, y];
         continue;
      }
      if (y + 1 < 10) {
         if (board[y + 1][x] === 0) {
            // lower cell
            board[y][x] = 0;
            board[y + 1][x] = "k";
            table.rows[y].cells[x].innerHTML = convert(0);
            table.rows[y + 1].cells[x].innerHTML = convert("k");
            killerPosition[i] = [x, y + 1];
            continue;
         } else if (x - 1 >= 0 && board[y + 1][x - 1] === 0) {
            // lower left cell
            board[y][x] = 0;
            board[y + 1][x - 1] = "k";
            table.rows[y].cells[x].innerHTML = convert(0);
            table.rows[y + 1].cells[x - 1].innerHTML = convert("k");
            killerPosition[i] = [x - 1, y + 1];
            continue;
         } else if (x + 1 < 10 && board[y + 1][x + 1] === 0) {
            // lower right cell
            board[y][x] = 0;
            board[y + 1][x + 1] = "k";
            table.rows[y].cells[x].innerHTML = convert(0);
            table.rows[y + 1].cells[x + 1].innerHTML = convert("k");
            killerPosition[i] = [x + 1, y + 1];
            continue;
         }
      }

      // robot is not able to move
      numOfUnmovable += 1;
   }

   if (numOfUnmovable === numOfKiller) {
      // all robots are not able to move
      movableRobot = false;
   }
}

function move(direction) {
   // move hero according to user typing
   moveHero(direction);

   // move robots
   moveRobots();

   // update status information
   document.getElementById("treasure").innerHTML = numOfTreasure;
   document.getElementById("userscore").innerHTML = heroScore;
   document.getElementById("computerscore").innerHTML = killerScore;

   if (numOfTreasure === 0 || (movableHero === false && movableRobot === false)) {
      // neither the hero nor any of the killer robots is able to move
      endGame();
      return;
   }

   // increase the number of rounds by one
   round += 1;
   document.getElementById("round").innerHTML = round;
}

function die() {
   // user is dead
   // end stage
   stage = 2;
   // change heading
   document.getElementById("h3").innerHTML = "End stage";
   // change button
   end = document.getElementById("end");
   end.style.display = 'none';
   // diplay the outcome of the game
   showMessage("You Died!<br>Game Over, You Lose!", "font");
}

function endGame() {
   // user is alive
   // end stage
   stage = 2;
   // change heading
   document.getElementById("h3").innerHTML = "End stage";
   // change button
   end = document.getElementById("end");
   end.style.display = 'none';
   // determine and display the outcome of the game
   if (heroScore > killerScore) {
      showMessage("Game Over, You Win!", "font");
   } else if (heroScore < killerScore) {
      showMessage("Game Over, You Lose!", "font");
   } else {
      showMessage("Game Over, Draw!", "font");
   }
}