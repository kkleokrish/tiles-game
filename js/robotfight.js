var size=7;
var win=4;
var game=new com.kkleokrish.tiles.Game(size,win);
/*
* This code is licensed under MIT open source license.
*/
function startGame() {
	game.reset();
	game.dump();
	renderBoard();
	document.getElementById("scoreboard-player0").className=document.getElementById("scoreboard-player0").className.replace(/\bwinner\b/,'');
	document.getElementById("scoreboard-player1").className=document.getElementById("scoreboard-player1").className.replace(/\bwinner\b/,'');
	
	document.getElementById("result").innerHTML="Game in progress...";
	game.onTilePlaced=function (row,column,player) {
		document.getElementById("tile-" + row+ "-" + column).className += ' player' + player;	
		if (game.complete) {
			if (game.won) {
				document.getElementById("result").innerHTML="... and the winner is " + document.getElementById("scoreboard-player" + game.currentPlayer).innerHTML;
				document.getElementById("scoreboard-player" + game.currentPlayer).className+=" winner"
			} else {
				document.getElementById("result").innerHTML="... and it's a draw.";
			}
			game.dump();
		}
	}
	game.autoplay();
}
function renderBoard() {
	var boardHtml="";
	for (var i=0;i<size; i++) {
		boardHtml+="<div class='newrow'>";
		for (var j=0;j<size; j++) {
			boardHtml+="<div id='tile-" + i+ "-" + j + "' class='tile currentrow player" + game.board[i][j]+ "'>&nbsp;</div>";			
		}
		boardHtml+="</div>";
	}
	document.getElementById("theboard").innerHTML=boardHtml;
}
