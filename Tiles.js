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
	var algos=[this.tryOneToWin,this.blockOneToWin,this.tryTwoToWin,this.blockTwoToWin,this.tryThreeToWin,this.historyBasedMove,this.randomMove];
	var firstMoveAlgo=this.randomMove;
	var tilePlaced = false;
	if (!this.firstMoveCompleted) {
		tilePlaced=firstMoveAlgo.apply(this);
		this.firstMoveCompleted=true;
	} else {
		for (var i=0; i<algos.length; i++) {
			var algo=algos[i];
			tilePlaced=algo.apply(this);
			if (tilePlaced) break;
		}
	}
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
	this.moveMap={};
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
	
	this.moveMap[this.boardState+":"+ this.playerPosition]=position;
	this.boardState|=Math.pow(2,positionNumber);
	this.playerPosition|=(Math.pow(2,positionNumber) * this.currentPlayer);	
	if (this.won) {
		this.storeMoveMap();
	}
}

com.kkleokrish.tiles.Game.prototype.storeMoveMap=function () {
	for (var key in this.moveMap) { //Technically not keys. But, clearer in this context
		com.kkleokrish.tiles.MoveMap[key]=this.moveMap[key];
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

com.kkleokrish.tiles.MoveMap={"0:0":{"row":3,"column":3},"1024:0":{"row":3,"column":1},"1536:512":{"row":2,"column":3},"132608:512":{"row":3,"column":3},"16909824:16777728":{"row":2,"column":4},"17171968:16777728":{"row":0,"column":3},"17171976:16777736":{"row":2,"column":2},"17237512:16777736":{"row":3,"column":5},"84346376:83886600":{"row":2,"column":1},"8:8":{"row":1,"column":3},"1032:1032":{"row":2,"column":3},"132104:1032":{"row":2,"column":2},"197640:66568":{"row":3,"column":1},"4391944:66568":{"row":3,"column":2},"12780552:8455176":{"row":0,"column":4},"12780568:8455176":{"row":3,"column":3},"29557784:25232392":{"row":4,"column":2},"1103299608:25232392":{"row":1,"column":2},"1103300120:25232392":{"row":1,"column":1},"256:0":{"row":2,"column":2},"65792:0":{"row":3,"column":3},"16843008:16777216":{"row":3,"column":2},"25231616:16777216":{"row":0,"column":0},"25231617:16777217":{"row":1,"column":2},"25232129:16777217":{"row":1,"column":3},"25233153:16778241":{"row":4,"column":2},"536870912:0":{"row":1,"column":2},"536871424:512":{"row":1,"column":1},"536871680:512":{"row":2,"column":3},"537002752:131584":{"row":3,"column":4},"570557184:131584":{"row":3,"column":3},"587334400:16908800":{"row":0,"column":1},"587334402:16908800":{"row":4,"column":3},"-1560149246:-2130574848":{"row":1,"column":3},"-1560148222:-2130574848":{"row":3,"column":2},"-1551759614:-2122186240":{"row":4,"column":2},"-478017790:-1048444416":{"row":1,"column":4},"-478015742:-1048444416":{"row":2,"column":4},"-477753598:-1048182272":{"row":2,"column":5},"-477229310:-1048182272":{"row":1,"column":5},"-2147483648:0":{"row":0,"column":0},"-2147483647:1":{"row":2,"column":4},"-2147221503:1":{"row":2,"column":1},"-2147188735:32769":{"row":2,"column":5},"-2146664447:32769":{"row":1,"column":1},"-2146664191:33025":{"row":2,"column":2},"-2146598655:33025":{"row":4,"column":1},"-1609727743:536903937":{"row":3,"column":1},"-1605533439:536903937":{"row":3,"column":2},"-1597144831:545292545":{"row":0,"column":1},"-1597144829:545292545":{"row":3,"column":3},"-1580367613:562069761":{"row":1,"column":0},"-1580367485:562069761":{"row":3,"column":4},"-1546813053:595624193":{"row":3,"column":5},"-1479704189:595624193":{"row":4,"column":2},"-405962365:1669366017":{"row":2,"column":3},"64:0":{"row":0,"column":3},"72:0":{"row":1,"column":4},"2120:0":{"row":2,"column":5},"526408:524288":{"row":2,"column":3},"657480:524288":{"row":3,"column":2},"9046088:8912896":{"row":2,"column":2},"9111624:8912896":{"row":0,"column":5},"9111656:8912928":{"row":1,"column":1},"9111912:8912928":{"row":3,"column":3},"25889128:25690144":{"row":0,"column":2},"25889132:25690144":{"row":0,"column":4},"25889148:25690160":{"row":1,"column":3},"25890172:25690160":{"row":0,"column":1},"25890174:25690162":{"row":1,"column":2},"4194304:4194304":{"row":2,"column":5},"4718592:4194304":{"row":2,"column":3},"4849664:4325376":{"row":0,"column":0},"4849665:4325377":{"row":2,"column":1},"4882433:4325377":{"row":2,"column":2},"4947969:4390913":{"row":2,"column":4},"5210113:4390913":{"row":3,"column":2},"13598721:12779521":{"row":4,"column":2},"1087340545:12779521":{"row":3,"column":3},"1104117761:29556737":{"row":1,"column":2},"1104118273:29556737":{"row":3,"column":4},"8:0":{"row":2,"column":0},"16392:16384":{"row":1,"column":4},"18440:16384":{"row":1,"column":3},"19464:17408":{"row":2,"column":1},"52232:17408":{"row":0,"column":1},"52234:17410":{"row":3,"column":4},"33606666:17410":{"row":3,"column":2},"41995274:8406018":{"row":2,"column":2},"42060810:8406018":{"row":2,"column":3},"42191882:8537090":{"row":3,"column":3},"58969098:8537090":{"row":4,"column":1},"595840010:545408002":{"row":4,"column":3},"-1551643638:-1602075646":{"row":4,"column":2},"2097152:0":{"row":2,"column":3},"2097153:1":{"row":1,"column":4},"2099201:1":{"row":0,"column":6},"2099265:65":{"row":4,"column":2},"1075841089:65":{"row":0,"column":1},"1075841091:65":{"row":1,"column":2},"1075841603:577":{"row":2,"column":1},"1075874371:33345":{"row":0,"column":3},"1075874379:33345":{"row":2,"column":2},"1075939915:98881":{"row":3,"column":2},"1084328523:98881":{"row":2,"column":5},"1084852811:623169":{"row":0,"column":2},"1084852815:623169":{"row":0,"column":4},"1084852831:623185":{"row":2,"column":3},"1084983903:623185":{"row":4,"column":1},"1621854815:537494097":{"row":2,"column":0},"1621871199:537494097":{"row":4,"column":0},"1890306655:805929553":{"row":3,"column":4},"1923861087:805929553":{"row":3,"column":1},"1928055391:810123857":{"row":1,"column":1},"1928055647:810123857":{"row":1,"column":3},"1:0":{"row":2,"column":3},"513:512":{"row":2,"column":1},"-2147483135:512":{"row":3,"column":2},"-2139094527:8389120":{"row":2,"column":4},"-2138832383:8389120":{"row":0,"column":3},"-2138832375:8389128":{"row":3,"column":4},"-2105277943:8389128":{"row":2,"column":1},"-2105245175:8389128":{"row":1,"column":4},"-2105243127:8391176":{"row":2,"column":5},"-2104718839:8915464":{"row":6,"column":1},"132096:0":{"row":3,"column":3},"16909312:16777216":{"row":2,"column":4},"17171456:16777216":{"row":0,"column":3},"17171464:16777224":{"row":2,"column":2},"17237000:16777224":{"row":3,"column":5},"84345864:83886088":{"row":2,"column":5},"524288:0":{"row":0,"column":0},"524289:1":{"row":1,"column":0},"524417:129":{"row":2,"column":0},"540801:129":{"row":1,"column":1},"541057:385":{"row":2,"column":2},"606593:385":{"row":1,"column":2},"607105:897":{"row":1,"column":3},"608129:897":{"row":2,"column":1},"640897:33665":{"row":3,"column":2},"9029505:33665":{"row":3,"column":1},"13223809:4227969":{"row":0,"column":1},"13223811:4227969":{"row":4,"column":1},"16:0":{"row":3,"column":1},"4194320:4194304":{"row":1,"column":3},"4195344:4194304":{"row":2,"column":2},"4260880:4259840":{"row":2,"column":3},"4391952:4259840":{"row":3,"column":3},"21169168:21037056":{"row":2,"column":4},"21431312:21037056":{"row":0,"column":3},"21431320:21037064":{"row":3,"column":5},"88540184:21037064":{"row":0,"column":2},"88540188:21037068":{"row":4,"column":6},"4:0":{"row":0,"column":0},"5:1":{"row":1,"column":2},"517:513":{"row":2,"column":1},"33285:33281":{"row":3,"column":0},"2130437:33281":{"row":0,"column":3},"2130445:33281":{"row":0,"column":4},"2130461:33297":{"row":4,"column":1},"539001373:33297":{"row":3,"column":1},"543195677:4227601":{"row":1,"column":1},"543195933:4227601":{"row":3,"column":2},"551584541:12616209":{"row":4,"column":3},"-1595899107:12616209":{"row":2,"column":2},"-1595833571:12681745":{"row":4,"column":2},"-522091747:12681745":{"row":2,"column":3},"-521960675:12681745":{"row":4,"column":0},"-253525219:281117201":{"row":2,"column":0},"-253508835:281117201":{"row":3,"column":3},"-236731619:297894417":{"row":1,"column":0},"-236731491:297894417":{"row":5,"column":5},"512:0":{"row":1,"column":3},"2560:2048":{"row":2,"column":2},"68096:2048":{"row":3,"column":2},"8456704:8390656":{"row":2,"column":3},"8587776:8390656":{"row":0,"column":2},"8587780:8390660":{"row":2,"column":4},"8849924:8390660":{"row":3,"column":4},"42404356:41945092":{"row":2,"column":5},"16777728:16777216":{"row":2,"column":2},"16843264:16842752":{"row":4,"column":3},"-2130640384:-2130640896":{"row":1,"column":1},"-2130640128:-2130640896":{"row":2,"column":3},"-2130509056:-2130509824":{"row":2,"column":4},"-2130246912:-2130509824":{"row":1,"column":3},"16843264:16777216":{"row":3,"column":2},"25231872:25165824":{"row":2,"column":3},"25362944:25165824":{"row":0,"column":2},"25362948:25165828":{"row":2,"column":4},"25625092:25165828":{"row":3,"column":4},"59179524:58720260":{"row":2,"column":1},"262656:262144":{"row":2,"column":3},"393728:262144":{"row":3,"column":4},"33948160:33816576":{"row":3,"column":5},"101057024:100925440":{"row":1,"column":4},"101059072:100925440":{"row":3,"column":3},"117836288:117702656":{"row":3,"column":2},"1536:1024":{"row":0,"column":1},"1538:1024":{"row":2,"column":3},"132610:132096":{"row":3,"column":3},"16909826:132096":{"row":3,"column":2},"25298434:8520704":{"row":0,"column":3},"25298442:8520704":{"row":4,"column":1},"562169354:545391616":{"row":1,"column":4},"562171402:545391616":{"row":4,"column":2},"1635913226:1619133440":{"row":4,"column":3},"-511570422:-528350208":{"row":4,"column":4},"4096:0":{"row":0,"column":3},"4104:8":{"row":2,"column":4},"266248:8":{"row":3,"column":3},"17043464:16777224":{"row":3,"column":4},"50597896:16777224":{"row":0,"column":6},"50597960:16777288":{"row":2,"column":5},"51122248:16777288":{"row":3,"column":5},"118231112:83886152":{"row":0,"column":5},"118231144:83886184":{"row":5,"column":4},"33281:512":{"row":1,"column":4},"35329:2560":{"row":4,"column":2},"1073777153:2560":{"row":0,"column":3},"1073777161:2568":{"row":3,"column":3},"1090554377:2568":{"row":3,"column":4},"1124108809:2568":{"row":3,"column":5},"1191217673:67111432":{"row":3,"column":2},"1199606281:67111432":{"row":4,"column":3},"-947877367:-2080372216":{"row":3,"column":1},"131073:131072":{"row":3,"column":3},"16908289:16908288":{"row":4,"column":3},"-2130575359:16908288":{"row":1,"column":3},"-2130574335:16909312":{"row":0,"column":3},"-2130574327:16909312":{"row":1,"column":4},"-2130572279:16911360":{"row":1,"column":5},"-2130568183:16911360":{"row":1,"column":2},"-2130567671:16911872":{"row":1,"column":1},"-2130567415:16911872":{"row":2,"column":4},"-2130305271:17174016":{"row":3,"column":4},"-2096750839:17174016":{"row":2,"column":2},"-2096685303:17239552":{"row":3,"column":2},"-2088296695:17239552":{"row":2,"column":1},"4195328:4194304":{"row":2,"column":3},"4326400:4194304":{"row":4,"column":1},"541197312:541065216":{"row":3,"column":3},"557974528:541065216":{"row":4,"column":3},"-1589509120:-1606418432":{"row":0,"column":3},"2228224:131072":{"row":4,"column":0},"270663680:131072":{"row":1,"column":3},"270664704:132096":{"row":3,"column":3},"287441920:132096":{"row":3,"column":1},"291636224:132096":{"row":3,"column":2},"300024832:8520704":{"row":4,"column":1},"836895744:8520704":{"row":1,"column":4},"836897792:8522752":{"row":0,"column":5},"836897824:8522752":{"row":2,"column":4},"837159968:8784896":{"row":4,"column":2},"1910901792:8784896":{"row":4,"column":3},"-236581856:-2138698752":{"row":2,"column":1},"128:0":{"row":1,"column":4},"2176:2048":{"row":2,"column":0},"18560:2048":{"row":2,"column":4},"280704:264192":{"row":3,"column":4},"33835136:264192":{"row":3,"column":0},"35932288:2361344":{"row":3,"column":3},"52709504:2361344":{"row":2,"column":3},"52840576:2492416":{"row":3,"column":2},"61229184:2492416":{"row":3,"column":1},"65423488:6686720":{"row":3,"column":5},"16777216:16777216":{"row":1,"column":1},"16777472:16777216":{"row":4,"column":3},"-2130706176:-2130706432":{"row":2,"column":1},"-2130673408:-2130706432":{"row":2,"column":3},"-2130542336:-2130575360":{"row":1,"column":3},"-2130541312:-2130575360":{"row":5,"column":3},"16777216:0":{"row":1,"column":4},"17039360:262144":{"row":1,"column":2},"17039872:262144":{"row":3,"column":4},"50594304:33816576":{"row":2,"column":5},"51118592:34340864":{"row":2,"column":3},"51249664:34471936":{"row":6,"column":6},"16779264:2048":{"row":2,"column":1},"16812032:2048":{"row":2,"column":4},"17074176:264192":{"row":3,"column":4},"50628608:264192":{"row":3,"column":5},"50629632:265216":{"row":3,"column":5},"117738496:265216":{"row":2,"column":3},"117869568:396288":{"row":3,"column":6},"16778240:1024":{"row":2,"column":3},"16909312:132096":{"row":0,"column":3},"16909320:132096":{"row":1,"column":4},"16911368:134144":{"row":1,"column":5},"16915464:134144":{"row":1,"column":2},"16915976:134656":{"row":1,"column":1},"16916232:134656":{"row":2,"column":2},"16981768:200192":{"row":3,"column":2},"25370376:200192":{"row":3,"column":1},"29564680:4394496":{"row":4,"column":0},"298000136:4394496":{"row":0,"column":4},"117737472:67373056":{"row":3,"column":2},"126126080:67373056":{"row":3,"column":1}} ;