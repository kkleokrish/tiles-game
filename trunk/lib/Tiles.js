/*
* This code is licensed under MIT open source license.
*/
if (!console) {
	console = {
		info: function () {},
		trace:function () {},
		debug:function () {},
		error: function () {}
	};
}
var com = {};
com.kkleokrish = {};
com.kkleokrish.tiles = {};
com.kkleokrish.tiles.Util = {
	positionToNumber: function (row, column) {
		var cellNumber=row*size + column; //row and column numbering start with 0
		return cellNumber;		
	}
};

com.kkleokrish.tiles.Position = function (row, column) {
	this.row = row;
	this.column=column;
}
com.kkleokrish.tiles.TilePlayerRobot = function (player, game) {
	this.playerId = player;
	if (player === 0) {
		this.opponent=1;
	} else {
		this.opponent=0;
	}
	this.game = game;
	this.firstMoveCompleted=false;
}

com.kkleokrish.tiles.TilePlayerRobot.prototype.playNextMove = function () {
	if (this.game.complete) {
		console.error("Could not play. Game is complete.");
		return;
	}
	
	var firstMoveAlgo=this.prioritizedAlgoList;
	var restMoveAlgo=this.prioritizedAlgoList;
	var tilePlaced = false;
	if (!this.firstMoveCompleted) {
		tilePlaced=firstMoveAlgo.apply(this);
		this.firstMoveCompleted=true;
	} else {
		tilePlaced=restMoveAlgo.apply(this);
		if (tilePlaced) return;
	}
}
com.kkleokrish.tiles.TilePlayerRobot.prototype.prioritizedAlgoList=function () {
	var algos=[this.historyBasedMove,this.tryOneToWin,this.blockOneToWin,this.tryTwoToWin,this.blockTwoToWin,this.tryThreeToWin,this.randomMove];
	for (var i=0; i<algos.length; i++) {
		var algo=algos[i];
		tilePlaced=algo.apply(this);
		if (tilePlaced) return true;
	}
	return false;
}
com.kkleokrish.tiles.TilePlayerRobot.prototype.randomMove = function () {
	var tilePlaced =false;
	var maxRowOrColumn = this.game.size - 1;
	var min = 0;
	var max = maxRowOrColumn;	
	while (!tilePlaced) {
		var row = Math.floor(Math.random() * (max - min) + min);
		var column = Math.floor(Math.random() * (max - min) + min);
		tilePlaced = game.placeTile(row, column);
	}
	return tilePlaced;
}
com.kkleokrish.tiles.TilePlayerRobot.prototype.historyBasedMove = function () {

	var position=com.kkleokrish.tiles.MoveMap[this.game.boardState+":"+ this.game.playerPosition];
	if (position) {
		console.debug("Robot " + this.playerId + " - Offending. L0");
		this.game.placeTile(position.row,position.column);
		return true;			
	}
	return false;
}

com.kkleokrish.tiles.TilePlayerRobot.prototype.tryOneToWin = function () {
	console.debug("Robot " + this.playerId + " - Offending. L1");
	for (var i = 0; i < this.game.size; i++) {
		for (var j = 0; j < this.game.size; j++) {
			if (this.winIfPossible(i, j,this.game.winningCount - 1)) {
				return true;
			} 
		}
	}
	return false;
}

com.kkleokrish.tiles.TilePlayerRobot.prototype.tryTwoToWin = function () {
	console.debug("Robot " + this.playerId + " - Offending. L2");
	for (var i = 0; i < this.game.size; i++) {
		for (var j = 0; j < this.game.size; j++) {
			if (this.winIfPossible(i, j,this.game.winningCount - 2)) {
				return true;
			} 
		}
	}
	return false;
}

com.kkleokrish.tiles.TilePlayerRobot.prototype.tryThreeToWin = function () {
	console.debug("Robot " + this.playerId + " - Offending. L3");
	for (var i = 0; i < this.game.size; i++) {
		for (var j = 0; j < this.game.size; j++) {
			if (this.winIfPossible(i, j,this.game.winningCount - 3)) {
				return true;
			} 
		}
	}
	return false;
}

com.kkleokrish.tiles.TilePlayerRobot.prototype.blockOneToWin = function () {
	console.debug("Robot " + this.playerId + " - Defending. L0");
	for (var i = 0; i < this.game.size; i++) {
		for (var j = 0; j < this.game.size; j++) {
			if (this.blockIfNeeded(i, j,this.game.winningCount - 1)) {
				return true;
			} 
		}
	}
	return false;
}
com.kkleokrish.tiles.TilePlayerRobot.prototype.blockTwoToWin = function () {	
	console.debug("Robot " + this.playerId + " - Defending. L1");
	for (var i = 0; i < this.game.size; i++) {
		for (var j = 0; j < this.game.size; j++) {
			if (this.blockIfNeeded(i, j,this.game.winningCount - 2)) {
				return true;
			} 
		}
	}
	
	return false;
}

com.kkleokrish.tiles.TilePlayerRobot.prototype.winIfPossible = function (row, column,targetCount) {
	return this.placeTileBasedOnCount(row, column,targetCount,this.playerId);
}

com.kkleokrish.tiles.TilePlayerRobot.prototype.blockIfNeeded = function (row, column,targetCount) {
	return this.placeTileBasedOnCount(row, column,targetCount,this.opponent);
}

com.kkleokrish.tiles.TilePlayerRobot.prototype.placeTileBasedOnCount = function (row, column,targetCount,player) {
	var validTileCount = 0;
	//Horizontal
	var unoccupied=-1;
	for (var j = column; j < this.game.size; j++) {
		if (this.game.board[row][j] === player) {
			validTileCount++;
			if (validTileCount >= targetCount) {
				console.debug("Found opponent could win - Horizontal " + row);
				var tilePlaced=false;
				if ((j<this.game.size -1) &&  (this.game.board[row][j+1] === unoccupied) ) {
						this.game.placeTile(row,j+1);
						tilePlaced=true;	
				} else if (column > 0 && (this.game.board[row][column - 1] === unoccupied)) {
						this.game.placeTile(row,column - 1);
						tilePlaced=true;					
				}
				
				if (tilePlaced) {
					return true;
				}
			}
		} else {
			break;
		}
	}
	validTileCount = 0;
	//Vertical
	for (var j = row; j < this.game.size; j++) {
		if (this.game.board[j][column] === player) {
			validTileCount++;
			if (validTileCount >= targetCount) {
				console.debug("Found opponent could win - Vertical " + column);
				var tilePlaced=false;
				if ((j<this.game.size -1) &&  (this.game.board[j+1][column] === unoccupied) ) {
						this.game.placeTile(j+1,column);
						tilePlaced=true;	
				} else if (row > 0 && (this.game.board[row - 1][column] === unoccupied)) {
						this.game.placeTile(row - 1,column);
						tilePlaced=true;					
				}
				
				if (tilePlaced) {
					return true;
				}
			}
		} else {
			break;
		}
	}
	validTileCount = 0;
	//Forward Diagonal
	for (var i = row, j = column; i < this.game.size && j < this.game.size; i++, j++) {
		if (this.game.board[i][j] === player) {
			validTileCount++;
			if (validTileCount >= targetCount) {
				console.debug("Found opponent could win - FD - " + column);
				
				if ((i<this.game.size -1 && j<this.game.size -1) &&  (this.game.board[i+1][j+1] === unoccupied) ) {
						this.game.placeTile(i+1,j+1);
						tilePlaced=true;	
				} else if ((row > 0  && column > 0)&& (this.game.board[row - 1][column - 1] === unoccupied)) {
						this.game.placeTile(row - 1,column - 1);
						tilePlaced=true;					
				}				
				if (tilePlaced) {
					return true;
				}
			}
		} else {
			break;
		}
	}
	validTileCount = 0;
	//Backward Diagonal
	for (var i = row, j = column; i < this.game.size && j >= 0; i++, j--) {
		if (this.game.board[i][j] === player) {
			validTileCount++;
			if (validTileCount >= targetCount) {
				console.debug("Found opponent could win - BD - " + column);
				
				if ((i<this.game.size -1 && j>0) &&  (this.game.board[i+1][j-1] === unoccupied) ) {
						this.game.placeTile(i+1,j-1);
						tilePlaced=true;	
				} else if ((row > 0  && column < this.game.size - 1)&& (this.game.board[row - 1][column + 1] === unoccupied)) {
						this.game.placeTile(row - 1,column + 1);
						tilePlaced=true;					
				}				
				if (tilePlaced) {
					return true;
				}
			}
		} else {
			break;
		}
	}

	return false;
}
com.kkleokrish.tiles.Game = function (size, winningCount) {
	if (!size) {
		console.error("Size of the board must be provided.");
	}
	if (size % 2 === 0) {
		console.error("Size must be odd to build a board.")
	}

	if (size < 1) {
		console.error("Size must be greater.")
	}

	this.size = size;

	if (!winningCount) {
		winningCount = 3;
	}
	this.winningCount = winningCount;
	this.onTilePlaced=function () {};
	this.reset();
}

com.kkleokrish.tiles.Game.prototype.reset = function () {
	this.currentPlayer = 0;
	this.movesPlayed = 0;
	this.won = false;
	this.complete = false;
	this.board = [];
	this.initializeBoard();
	this.moveHistory=[];
	this.boardState=0;
	this.playerPosition=0;
	this.moveMap=[];
	this.moveMap[0]={};
	this.moveMap[1]={};
	this.moveMap[0].userMoves={};
	this.moveMap[1].userMoves={};
}
com.kkleokrish.tiles.Game.prototype.initializeBoard = function () {
	var size = this.size;
	for (var i = 0; i < size; i++) {
		this.board[i]=[];
		for (var j = 0; j < size; j++) {
			this.board[i][j] = -1;
		}
	}
}

com.kkleokrish.tiles.Game.prototype.placeTile = function (row, column) {
	if (this.complete) {
		console.error("Game complete. Cannot place tile.")
		return false;
	}

	if (this.board[row][column] !== -1) {
		console.error("Tile is occupied.");
		return false;
	}

	this.board[row][column] = this.currentPlayer;

	if (this.isGameWon()) {
		this.won = true;
		this.complete = true;
	} 
	
	if (this.onTilePlaced) {
		this.onTilePlaced(row,column,this.currentPlayer);
	}
	
	this.makeHistoryEntry(row,column);
	this.advance();

	return true;
}
com.kkleokrish.tiles.Game.prototype.makeHistoryEntry=function (row,column) {
	this.moveHistory.push([row,column]);
	var positionNumber=com.kkleokrish.tiles.Util.positionToNumber(row,column);
	var position=new com.kkleokrish.tiles.Position(row, column);
	
	this.moveMap[this.currentPlayer].userMoves[this.boardState+":"+ this.playerPosition]=position;
	this.boardState|=Math.pow(2,positionNumber);
	this.playerPosition|=(Math.pow(2,positionNumber) * this.currentPlayer);	
	if (this.won) {
		this.storeWinningMoveMap();
	}
}

com.kkleokrish.tiles.Game.prototype.storeWinningMoveMap=function () {
	var winningMoveMap=this.moveMap[this.currentPlayer].userMoves;
	for (var key in winningMoveMap) { //Technically not keys. But, clearer in this context
		com.kkleokrish.tiles.MoveMap[key]=winningMoveMap[key];
	}
	console.debug(JSON.stringify(com.kkleokrish.tiles.MoveMap));
}

com.kkleokrish.tiles.Game.prototype.advance = function () {
	if (!this.complete) {
		this.movesPlayed++;
		if (this.currentPlayer === 0) {
			this.currentPlayer = 1;
		} else {
			this.currentPlayer = 0;
		}
		if (this.movesPlayed === this.size * this.size) {
			this.complete = true;
		}
	}
}

com.kkleokrish.tiles.Game.prototype.isGameWon = function () {
	for (var i = 0; i < this.size; i++) {
		for (var j = 0; j < this.size; j++) {
			if (this.check(i, j)) {
				return true;
			}
		}
	}
	return false;
}
com.kkleokrish.tiles.Game.prototype.check = function (row, column) {
	var validTileCount = 0;
	//Horizontal
	for (var j = column; j < this.size; j++) {
		if (this.board[row][j] === this.currentPlayer) {
			validTileCount++;
			if (validTileCount === this.winningCount) {
				console.debug("Succeeded in horizontal - row - " + row);
				return true;
			}
		} else {
			break;
		}
	}
	validTileCount = 0;
	//Vertical
	for (var j = row; j < this.size; j++) {
		if (this.board[j][column] === this.currentPlayer) {
			validTileCount++;
			if (validTileCount === this.winningCount) {
				console.debug("Succeeded in vertical - column " + column);
				return true;
			}
		} else {
			break;
		}
	}
	validTileCount = 0;
	//Forward Diagonal
	for (var i = row, j = column; i < this.size && j < this.size; i++, j++) {
		if (this.board[i][j] === this.currentPlayer) {
			validTileCount++;
			if (validTileCount === this.winningCount) {
				console.debug("Succeeded in FD - starting (" + row + ", " + column + ")" );
				return true;
			}
		} else {
			break;
		}
	}
	validTileCount = 0;
	//Backward Diagonal
	for (var i = row, j = column; i < this.size && j >= 0; i++, j--) {
		if (this.board[i][j] === this.currentPlayer) {
			validTileCount++;
			if (validTileCount === this.winningCount) {
				console.debug("Succeeded in BD - starting (" + row + ", " + column + ")" );
				return true;
			}
		} else {
			break;
		}
	}

	return false;
}
com.kkleokrish.tiles.Game.prototype.autoplay = function () {
	var player0 = new com.kkleokrish.tiles.TilePlayerRobot(0, this);
	var player1 = new com.kkleokrish.tiles.TilePlayerRobot(1, this);

	var player = player0;
	var _this=this;
	(function nextMove() { 
		if (!_this.complete) {
			player.playNextMove();
			if (player === player0) {
				player = player1;
			} else {
				player = player0;
			}
			setTimeout(nextMove,500); //To slow down the move to see the move
		} else {
			if (_this.won) {
				console.info("Player " + _this.currentPlayer + " won.");
			} else {
				console.info("It is a draw.");
			}
		}
	}
	) ();
}

com.kkleokrish.tiles.Game.prototype.dump = function () {
	for (var i=0; i< this.size; i++) {
		console.debug(this.board[i]);
	}
}

com.kkleokrish.tiles.MoveMap={} ;