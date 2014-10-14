/*
* This code is licensed under MIT open source license.
*/
var size=7;
var win=4;
var game=new com.kkleokrish.tiles.Game(size,win);
var robot;
var withRobot=false;
function startGame(isWithRobot, robotFirst,autoplay) {
	game.reset();
	game.dump();
	document.getElementById("scoreboard-player0").innerHTML="Tile Player 1";
	 document.getElementById("scoreboard-player0").className=document.getElementById("scoreboard-player0").className.replace(/\bwinner\b/,'');
	document.getElementById("scoreboard-player1").innerHTML="Tile Player 2";
	document.getElementById("scoreboard-player1").className=document.getElementById("scoreboard-player1").className.replace(/\bwinner\b/,'');
	renderBoard();
	document.getElementById("result").innerHTML="Game in progress...";
	game.onTilePlaced=function (row,column,player) {
		document.getElementById("tile-" + row+ "-" + column).className += ' player' + player;	
		if (game.complete) {
			if (game.won) {
				document.getElementById("result").innerHTML="... and the winner is " + document.getElementById("scoreboard-player" + game.currentPlayer).innerHTML;
				document.getElementById("scoreboard-player" + game.currentPlayer).className+=" winner"
			}
			game.dump();
		} 
	}
	if (autoplay) {
		game.autoplay();
	} else {
		withRobot=isWithRobot;
		if (withRobot) {
			if (robotFirst) {
				robot=new com.kkleokrish.tiles.TilePlayerRobot(0,game)
				document.getElementById("scoreboard-player0").innerHTML="Tiles Robot";
				robot.playNextMove();
			} else {
				robot=new com.kkleokrish.tiles.TilePlayerRobot(1,game)
				document.getElementById("scoreboard-player1").innerHTML="Tiles Robot";
			}
		}
	}
}

function play(row, column) {
	var tilePlaced=game.placeTile(row,column);
	if (tilePlaced && withRobot) {
		robot.playNextMove();
	}
}

function renderBoard() {
	var boardHtml="";
	for (var i=0;i<size; i++) {
		boardHtml+="<div class='newrow'>";
		for (var j=0;j<size; j++) {
			boardHtml+="<div onclick='play("+ i +"," + j+")' id='tile-" + i+ "-" + j + "' class='tile currentrow player" + game.board[i][j]+ "'>&nbsp;</div>";			
		}
		boardHtml+="</div>";
	}
	document.getElementById("theboard").innerHTML=boardHtml;
}