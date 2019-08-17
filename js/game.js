var game;
//Game Options centralized in one section
var gameOptions = {
    tileSize: 200,
    tileSpacing: 20,
    boardSize: {
        rows: 4,
        cols: 4
    },
    tweenSpeed: 200,
    swipeMaxTime: 1000,
    swipeMinDistance: 20,
    swipeMinNormal: 0.85
}
//constants assigning number values to directions
const LEFT = 0;
const RIGHT = 1;
const UP = 2;
const DOWN = 3;

//load the window, load the canvas (width, height, and background color), and start scenes
window.onload = function() {
    var gameConfig = {
        width: gameOptions.boardSize.cols * (gameOptions.tileSize + gameOptions.tileSpacing) + gameOptions.tileSpacing,
        height: gameOptions.boardSize.rows * (gameOptions.tileSize + gameOptions.tileSpacing) + gameOptions.tileSpacing,
        backgroundColor: 0xecf0f1,
        scene: [bootGame, playGame]
    }
    game = new Phaser.Game(gameConfig);
    window.focus();
    resizeGame();
    window.addEventListener("resize", resizeGame);
}
//start the 'bootgame' scene. Preload the images and move to the 'playgame' scene
class bootGame extends Phaser.Scene{
    constructor(){
        super("BootGame");
    }
    preload(){
        this.load.image("emptytile", "assets/sprites/emptytile.png");
        this.load.spritesheet("tiles", "assets/sprites/tiles.png", {
            frameWidth: gameOptions.tileSize,
            frameHeight: gameOptions.tileSize
        });
    }
    create(){
        this.scene.start("PlayGame");
    }
}
//start 'playgame' scene. Create the board, load all the tiles and hide them.
class playGame extends Phaser.Scene{
    constructor(){
        super("PlayGame");
    }
    //creates board. Add sprites to board and hide them.
    create(){
        this.canMove = false;
        this.boardArray = [];
        for(var i = 0; i < gameOptions.boardSize.rows; i++){
            this.boardArray[i] = [];
            for(var j = 0; j < gameOptions.boardSize.cols; j++){
                var tilePosition = this.getTilePosition(i, j);
                this.add.image(tilePosition.x, tilePosition.y, "emptytile");
                var tile = this.add.sprite(tilePosition.x, tilePosition.y, "tiles", 0);
                tile.visible = false;
                this.boardArray[i][j] = {
                    tileValue: 0,
                    tileSprite: tile,
                    upgraded: false
                }
            }
        }
        //add two random tiles to the board.
        this.addTile();
        this.addTile();
        //collect the coordinates for empty tiles on the board.
        this.input.keyboard.on("keydown", this.handleKey, this);
        this.input.on("pointerup", this.handleSwipe, this);
    }
    //collect the coordinates for empty tiles on the board.
    addTile(){
        var emptyTiles = [];
        for(var i = 0; i < gameOptions.boardSize.rows; i++){
            for(var j = 0; j < gameOptions.boardSize.cols; j++){
                if(this.boardArray[i][j].tileValue == 0){
                    emptyTiles.push({
                        row: i,
                        col: j
                    })
                }
            }
        }
        //find a random tile from the emptyTiles array and change the opacity of the element from 0 to 1 to make it 'appear' on the board.
        if(emptyTiles.length > 0){
            var chosenTile = Phaser.Utils.Array.GetRandom(emptyTiles);
            this.boardArray[chosenTile.row][chosenTile.col].tileValue = 1;
            this.boardArray[chosenTile.row][chosenTile.col].tileSprite.visible = true;
            this.boardArray[chosenTile.row][chosenTile.col].tileSprite.setFrame(0);
            this.boardArray[chosenTile.row][chosenTile.col].tileSprite.alpha = 0;
            this.tweens.add({
                targets: [this.boardArray[chosenTile.row][chosenTile.col].tileSprite],
                alpha: 1,
                duration: gameOptions.tweenSpeed,
                callbackScope: this,
                onComplete: function(){
                    this.canMove = true;
                }
            });
        }
    }
    //find a tile position and return it as a Phaser 'point' object.
    getTilePosition(row, col){
        var posX = gameOptions.tileSpacing * (col + 1) + gameOptions.tileSize * (col + 0.5);
        var posY = gameOptions.tileSpacing * (row + 1) + gameOptions.tileSize * (row + 0.5);
        return new Phaser.Geom.Point(posX, posY);
    }
    //callback function to handle keyboard input.
    handleKey(e){
        if(this.canMove){
            switch(e.code){
                case "KeyA":
                case "ArrowLeft":
                    this.makeMove(LEFT);
                    break;
                case "KeyD":
                case "ArrowRight":
                    this.makeMove(RIGHT);
                    break;
                case "KeyW":
                case "ArrowUp":
                    this.makeMove(UP);
                    break;
                case "KeyS":
                case "ArrowDown":
                    this.makeMove(DOWN);
                    break;
            }
        }
    }
    //callback function to handle swipe gestures.
    handleSwipe(e){
        if(this.canMove){
            var swipeTime = e.upTime - e.downTime;
            var fastEnough = swipeTime < gameOptions.swipeMaxTime;
            var swipe = new Phaser.Geom.Point(e.upX - e.downX, e.upY - e.downY);
            var swipeMagnitude = Phaser.Geom.Point.GetMagnitude(swipe);
            var longEnough = swipeMagnitude > gameOptions.swipeMinDistance;
            if(longEnough && fastEnough){
                Phaser.Geom.Point.SetMagnitude(swipe, 1);
                if(swipe.x > gameOptions.swipeMinNormal){
                    this.makeMove(RIGHT);
                }
                if(swipe.x < -gameOptions.swipeMinNormal){
                    this.makeMove(LEFT);
                }
                if(swipe.y > gameOptions.swipeMinNormal){
                    this.makeMove(DOWN);
                }
                if(swipe.y < -gameOptions.swipeMinNormal){
                    this.makeMove(UP);
                }
            }
        }
    }
    //move the element according to direction selected.
    makeMove(d){
        this.movingTiles = 0;
        var dRow = (d == LEFT || d == RIGHT) ? 0 : d == UP ? -1 : 1;
        var dCol = (d == UP || d == DOWN) ? 0 : d == LEFT ? -1 : 1;
        this.canMove = false;
      //  var movedTiles = 0;
        var firstRow = (d == UP) ? 1 : 0;
        var lastRow = gameOptions.boardSize.rows - ((d == DOWN) ? 1 : 0);
        var firstCol = (d == LEFT) ? 1 : 0;
        var lastCol = gameOptions.boardSize.cols - ((d == RIGHT) ? 1 : 0);
        for(var i = firstRow; i < lastRow; i++){
      //  var movedSomething = false;
            for(var j = firstCol; j < lastCol; j++){
                var curRow = dRow == 1 ? (lastRow - 1) - i : i;
                var curCol = dCol == 1 ? (lastCol - 1) - j : j;
                var tileValue = this.boardArray[curRow][curCol].tileValue;
                if(tileValue != 0){
                    var newRow = curRow;
                    var newCol = curCol;
                    while(this.isLegalPosition(newRow + dRow, newCol + dCol, tileValue)){
                        newRow += dRow;
                        newCol += dCol;
                    }
                //    movedTiles ++;
                    if(newRow != curRow || newCol != curCol) {
                      // movedSomething = true;
                      // this.boardArray[curRow][curCol].tileSprite.depth = movedTiles;
                      var newPos = this.getTilePosition(newRow, newCol);
                      // this.boardArray[curRow][curCol].tileSprite.x = newPos.x;
                      // this.boardArray[curRow][curCol].tileSprite.y = newPos.y;
                      this.moveTile(this.boardArray[curRow][curCol].tileSprite, newPos);
                      this.boardArray[curRow][curCol].tileValue = 0;
                      if(this.boardArray[newRow][newCol].tileValue == tileValue) {
                        this.boardArray[newRow][newCol].tileValue ++;
                        this.boardArray[newRow][newCol].upgraded = true;
                        this.boardArray[curRow] [curCol].tileSprite.setFrame(tileValue);
                      }
                      else {
                        this.boardArray[newRow][newCol].tileValue = tileValue;
                      }
                    }
                }
            }
        }
      //   if(movedSomething) {
      //   this.refreshBoard();
      // }
      // else {
      //   this.canMove = true;
      // }
    }
    //the moveTile method will handle all tile movement, position, and depth.
    moveTile(tile, point) {
      this.movingTiles++;
      tile.depth = this.movingTiles;
      var distance = Math.abs(tile.x - point.x) + Math.abs(tile.y - point.y);
      this.tweens.add({
        targets: [tile],
        x: point.x,
        y: point.y,
        duration: gameOptions.tweenSpeed * distance / gameOptions.tileSize,
        callbackScope: this,
        onComplete: function () {
          this.movingTiles -- ;
          tile.depth = 0;
          if(this.movingTiles == 0) {
            this.refreshBoard();
          }
        }
      })
    }
    //check to see if the new position is a 'legal' position for a tile.
    isLegalPosition(row, col, value) {
        var rowInside = row >= 0 && row < gameOptions.boardSize.rows;
        var colInside = col >= 0 && col < gameOptions.boardSize.cols;
        if(!rowInside || !colInside) {
          return false;
        }
        var emptySpot = this.boardArray[row][col].tileValue == 0;
        var sameValue = this.boardArray[row][col].tileValue == value;
        var alreadyUpgraded = this.boardArray[row][col].upgraded;
        return emptySpot || (sameValue && !alreadyUpgraded);
    }
    //refresh the game board. Reset tile positions and reveal tiles based on board status
    refreshBoard() {
      for(var i = 0; i < gameOptions.boardSize.rows; i++) {
        for(var j = 0; j < gameOptions.boardSize.cols; j++) {
          var spritePosition = this.getTilePosition(i, j);
          this.boardArray[i][j].tileSprite.x = spritePosition.x;
          this.boardArray[i][j].tileSprite.y = spritePosition.y;
          var tileValue = this.boardArray[i][j].tileValue;
          if(tileValue > 0) {
            this.boardArray[i][j].tileSprite.visible = true;
            this.boardArray[i][j].tileSprite.setFrame(tileValue - 1);
            this.boardArray[i][j].upgraded = false;
          }
          else {
            this.boardArray[i][j].tileSprite.visible = false;
          }
        }
      }
      this.addTile();
    }
}

//on a window/screen resize gracefully resize the canvas element.
function resizeGame(){
    var canvas = document.querySelector("canvas");
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;
    var windowRatio = windowWidth / windowHeight;
    var gameRatio = game.config.width / game.config.height;
    if(windowRatio < gameRatio){
        canvas.style.width = windowWidth + "px";
        canvas.style.height = (windowWidth / gameRatio) + "px";
    }
    else{
        canvas.style.width = (windowHeight * gameRatio) + "px";
        canvas.style.height = windowHeight + "px";
    }
}
