//Main javascript function to encapsulate the game logic
var main = (function () {

    //Boolean variable that indicates who's turn it is
    //false indicates it is Circle's turn
    //true indicates it is X's turn
    var turn = false;

    //The number of moves made so far
    var moveCount = 0;

    //The current position o the board
    var position = [
        [undefined, undefined, undefined],
        [undefined, undefined, undefined],
        [undefined, undefined, undefined]
    ];

    //The number of rows and columns on the board
    var n = 3;

    //Function to handle a human move
    function move(element) {

        //Sets X and Y coordinates based on the id of the element clicked
        var x = Number(element.id[0]);
        var y = Number(element.id[1]);

        //Checks if the position is empty before making a move
        if (position[x][y] === undefined) {

            //Updates the current position
            position[x][y] = turn;

            //Draw the image on the board acordingly
            if (turn) {
                drawX(element.firstElementChild);
            } else {
                drawO(element.firstElementChild);
            }

            //Increments the move counter
            moveCount++;

            //Checks if the game is over with this last move
            if (!alertEnd(checkEnd(x, y, turn, position, moveCount))) {
                //Changes the turn to the other player
                turn = !turn;

                if (turn) {
                    //Initiates the computed move
                    computerMove();
                }
            }
        }

    }

    //Generates the Computer Move
    function computerMove() {

        //The best move is determined by a recursive function
        //that checks all of the possibilites determining the best move at each level
        //all the way up to the current level
        var decision = computePositions(position, turn, moveCount);


        //Sets the coordinates acording to the decision made
        var x = decision.x;
        var y = decision.y;

        //Retrieves the respective position in the DOM
        var element = document.getElementById(x.toString() + y.toString());

        //Makes the decided move
        move(element);

    }


    //Recursive function to check all of the possible moves
    //pPosition - The position to serve as the starting point
    //pTurn - Determines who's turn it is
    //pLevel - Indicates the level of the caller. Needed to check if it is a draw at the last level
    function computePositions(pPosition, pTurn, pLevel) {

        //Increments the level before generates the next moves
        pLevel++;

        //Variable that will hold the best move at the level
        var bestMove = {};

        //Runs throug all slots in the board
        for (let x = 0; x < pPosition.length; x++) {
            for (let y = 0; y < pPosition[x].length; y++) {

                //If the slot in the position is already set
                //skips to the next iteration
                if (pPosition[x][y] === undefined) {

                    //Defines a possible move that can be returned as the best one
                    //If it passes the check later
                    let possibleMove = { x: x, y: y };

                    //Creates a possible position with the possible move in it
                    //The possible position must be a clone of the actual position
                    //in order not to modify the original position
                    let possiblePosition = clonePosition(pPosition);
                    possiblePosition[x][y] = pTurn;

                    //Check if the move generated ends the game in some sort of way
                    //and if so, retrieves the value that can be one of four possible values
                    //"undefined" = the move does not end the game
                    //"0" = the move ends the game in a draw
                    //"-1" = the move ends the game and O wins
                    //"1" = the move ends the game and X wins
                    possibleMove.value = checkEnd(x, y, pTurn, possiblePosition, pLevel);

                    //If the move does not end the game this generating function is called again
                    //This time passing the generated possible position to evalute its possible moves and check
                    //if one of them ends the game
                    if (possibleMove.value === undefined) {

                        //For the next generation the turn must be inverted so that is the other player's turn
                        let possibleTurn = !pTurn;

                        //At the end of the recursive call a best move will be returned and the value of the current move
                        //Is set to the value of the best move that can be found from the position that derive from the current one
                        possibleMove.value = computePositions(possiblePosition, possibleTurn, pLevel).value;
                    }

                    //If at this point the best move does not have a value yet
                    //it means that this is the first move evaluated in the current level, and since at this point
                    //there is no other moves to compare it to, the current move is set as the best move.
                    if (bestMove.value === undefined) {

                        //Sets the best move as the current possible move
                        bestMove = possibleMove;

                        //Otherwise, a comparison is need to check if the current generated possible move
                        //is better than the best move found so far in this level
                    } else {

                        //The concept of a best move will change depending on who's turn it is to move
                        //For example, if it is X's turn the best move is the move with the maximum value possible
                        //and if it is O's turn, the best move is the move with the minimum value possible
                        //So this "if" statement chekcs who's turn it is and select the best value accordingly
                        if ((pTurn && possibleMove.value >= bestMove.value)
                            || (!pTurn && possibleMove.value <= bestMove.value)) {

                            //If the possible move is better than the best move so far in this level
                            //The possible move is selected as the best move
                            bestMove = possibleMove;
                        }
                    }
                }
            }//End Y for loop
        }//End X for loop

        //After all iterations in the level returns the best move selected
        return bestMove;
    }

    //Make a clone of the position array without modifying the original one
    function clonePosition(oldPosition) {

        //Declares an empty position
        var newPosition = [[], [], []];

        //runs throug all spots in the oldPosition matrix copying the values
        for (let x = 0; x < oldPosition.length; x++) {
            for (let y = 0; y < oldPosition[x].length; y++) {
                newPosition[x][y] = oldPosition[x][y];
            }
        }

        //Returns the copy
        return newPosition;
    }

    //Informs the player if the game has ended
    function alertEnd(end) {

        //Checks if the game has actually ended
        //If the value of the "end" argument is undefined
        //it means that the game has not ended
        if (end !== undefined) {

            //Initializes the message to the user
            var msg = "O jogo acabou!\n";

            //Completes the message considering how the game ended
            switch (end) {

                //Means X won
                case 1:
                    msg += "O \"X\" ganhou!";
                    break;

                //Means O won
                case -1:
                    msg += "O \"O\" ganhou!";
                    break;

                //Means it's a draw
                case 0:
                    msg += "Empatou!";
                    break;

                //Otherwise somthing weird happened
                default:
                    msg += "Something unexpected happened";
            }

            //Shows the message to the user
            setTimeout(() => {
                alert(msg);
                clear();
                if (turn) {
                    //Initiates the computed move
                    computerMove();
                }
            }, 100);

            //returns true meaning the game has indeed ended
            return true;
        }

        //Returns false meaning that the game has not eded
        return false;
    }

    //Function to clear the game
    function clear() {

        //Gets a list of all the canvas in the DOM
        var canvasList = document.getElementsByTagName("CANVAS");

        //Runs throug all of the canvas
        for (let i = 0; i < canvasList.length; i++) {

            //Gets the context of the current canvas
            let context = canvasList[i].getContext("2d");

            //Clears the current canvas
            context.clearRect(0, 0, canvasList[i].width, canvasList[i].height);
        }

        //sets the position to the initial position
        position = [
            [undefined, undefined, undefined],
            [undefined, undefined, undefined],
            [undefined, undefined, undefined]
        ];

        //Sets the move count to 0 (Zero)
        moveCount = 0;

    }

    //Function to check if the game is over
    //Returns 1 if X wins, -1 if Circle wins and 0 if it is a draw
    function checkEnd(x, y, turn, position, count) {

        //check end conditions

        //check col
        for (let i = 0; i < n; i++) {
            if (position[x][i] !== turn)
                break;
            if (i === n - 1) {
                return turn ? 1 : -1;
            }
        }

        //check row
        for (let i = 0; i < n; i++) {
            if (position[i][y] !== turn)
                break;
            if (i === n - 1) {
                return turn ? 1 : -1;
            }
        }

        //check diag
        if (x == y) {
            //we're on a diagonal
            for (let i = 0; i < n; i++) {
                if (position[i][i] !== turn)
                    break;
                if (i === n - 1) {
                    return turn ? 1 : -1;
                }
            }
        }

        //check anti diag
        for (let i = 0; i < n; i++) {
            if (position[i][(n - 1) - i] !== turn)
                break;
            if (i === n - 1) {
                return turn ? 1 : -1;
            }
        }

        //check draw
        if (count == Math.pow(n, 2)) {
            return 0;
        }

        //If no ending condition is met returns undefined meaning the game is not over yet
        return undefined;
    }

    //Function to Draw an X in a canvas
    function drawX(canvas) {

        //Gets the context in the cavans
        var context = canvas.getContext("2d");

        //Sets x and y coordinates at the center of the canvas
        var x = canvas.width / 2;
        var y = canvas.height / 2;

        //Sets the color as black
        context.strokeStyle = '#000000';

        //
        context.beginPath();
        context.lineWidth = 20;

        context.moveTo(x - 50, y - 50);
        context.lineTo(x + 50, y + 50);
        context.stroke();

        context.moveTo(x + 50, y - 50);
        context.lineTo(x - 50, y + 50);
        context.stroke();
    }

    //Function to draw a circle in a canvas
    function drawO(canvas) {
        var context = canvas.getContext("2d");
        var x = canvas.width / 2;
        var y = canvas.height / 2;

        var radius = 60;

        context.beginPath();
        context.arc(x, y, radius, 0, 2 * Math.PI, false);
        context.lineWidth = 20;
        context.strokeStyle = '#ff0000';
        context.stroke();
    }

    //Public properties to accessed from the DOM
    return {

        //Handle for the click event
        click: function (element, event) {
            event.preventDefault();
            move(element);
        },

        clear: clear
    }

})()