var game;
// gameOption variable holds all the specific game data variables such as tilesize and boardsize
var gameOptions = {
  tileSize: 200,
  tileSpacing:20,
  boardSize: {
    rows: 4,
    cols: 4
  },
  tweenSpeed: 150,
  //touch movement variables
  swipeMaxTime: 1000,
  swipeMinDistance: 20,
  swipeMinNormal: 0.85
}

//constants for direction
const LEFT = 0;
const RIGHT = 1;
const UP = 2;
const DOWN = 3;

//create the window for the game to run in. Create the gameboard and set scenes.
window.onload = function() {
  var gameConfig = {
    width: gameOptions.boardSize.cols * (gameOptions.tileSize + gameOptions.tileSpacing) + gameOptions.tileSpacing,
    height: gameOptions.boardSize.rows * (gameOptions.tileSize + gameOptions.tileSpacing) + gameOptions.tileSpacing,
    backgroundColor: 0xecf0f1,
    scene:[bootGame,playGame]
  }
    //create a new game object using the phaser framework. Refocus the window and automatically run the resizeGame function
    game = new Phaser.Game(gameConfig);
    window.focus();
    resizeGame();
    window.addEventListener("resize", resizeGame);
}

//The resizeGame function resizes the game to best fit the window avaialable.
function resizeGame() {
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

//preload  images and other assets for the game.
class bootGame extends Phaser.Scene {
  constructor() {
  super("BootGame");
  }
  preload() {
    this.load.image("emptytile", "assets/sprites/emptytile.png");
    this.load.spritesheet("tiles", "assets/sprites/tiles.png",{
      frameWidth: gameOptions.tileSize,
      frameHeight: gameOptions.tileSize
      });
  }
  create() {
    this.scene.start("PlayGame");
  }
}

//Our main function and gameloop stuff.
class playGame extends Phaser.Scene {
  constructor() {
    super("PlayGame");
  }
  create() {
    this.canMove = false;
    //initialize an empty array
    this.boardArray = [];
    //create the grid using a nested for loop.
    for(var i = 0; i < gameOptions.boardSize.rows; i++) {
      this.boardArray[i] = [];
      for(var j = 0; j < gameOptions.boardSize.cols; j++) {
            var tilePosition = this.getTilePosition(i, j);
            //set 'emptytile as the background board image'
            this.add.image(tilePosition.x, tilePosition.y, "emptytile");
            //load the tiles spritesheet
            var tile = this.add.sprite(tilePosition.x, tilePosition.y, "tiles", 0);
            //set visibility to false
            tile.visible = false;
            //store the board/tile coordinates into our array
            this.boardArray[i][j] = {
              tileValue:0,
              tileSprite: tile
            }
        }
      }
      //add a couple of random tiles to the board
      this.addTile();
      this.addTile();

      //check for input on the keyboard or with a swipe
      this.input.keyboard.on("keydown", this.handleKey, this);
      this.input.on("pointerup", this.handleSwipe, this);
    }

      //get tile position, do some math, return it as a phaser object
      getTilePosition(row, col) {
        var posX = gameOptions.tileSpacing * (col + 1) + gameOptions.tileSize * (col + 0.5);
        var posY = gameOptions.tileSpacing * (row + 1) + gameOptions.tileSize * (row + 0.5);
        return new Phaser.Geom.Point(posX, posY);
      }

      //handle keyboard input
      handleKey(e) {
        if(this.canMove) {
          switch(e.code) {
            case "KeyA":
            case "ArrowLeft":
                this.makeMove(LEFT);
                break;
            case "KeyD":
            case "ArrowRight":
                this.makeMove(RIGHT);
                break;
            case "keyW":
            case "ArrowUp":
                this.makeMove(UP);
                break;
            case "KeyS":
            case "ArrowDown":
                this.makeMove(DOWN);
                break
          }
        }
      }

      //handle swipe events
      handleSwipe(e){
        if(this.canMove){
                  //swipeTime is the time(in ms) for the total touch event from when the finger goes down to when it comes up.
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

      //make a tile move
      makeMove(d){
        var dRow = (d == LEFT || d == RIGHT) ? 0 : d == UP ? -1 : 1;
        var dCol = (d == UP || d == DOWN) ? 0 : d == LEFT ? -1 : 1;
        this.canMove = false;
        for(var i = 0; i < gameOptions.boardSize.rows; i++){
          for(var j = 0; j < gameOptions.boardSize.cols; j++){
            var curRow = dRow == 1 ? (gameOptions.boardSize.rows - 1) - i : i;
            var curCol = dCol == 1 ? (gameOptions.boardSize.cols - 1) - j : j;
            var tileValue = this.boardArray[curRow][curCol].tileValue;            if(tileValue != 0){
              

              var newPos = this.getTilePosition(curRow + dRow, curCol + dCol);
               this.boardArray[curRow][curCol].tileSprite.x = newPos.x;                this.boardArray[curRow][curCol].tileSprite.y = newPos.y;            }
             }
           }
         }
      // addTiles function. Pretty self explanatory
      addTile() {
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
         if(emptyTiles.length > 0) {
           var chosenTile = Phaser.Utils.Array.GetRandom(emptyTiles);        this.boardArray[chosenTile.row][chosenTile.col].tileValue = 1;        this.boardArray[chosenTile.row][chosenTile.col].tileSprite.visible = true;        this.boardArray[chosenTile.row][chosenTile.col].tileSprite.setFrame(0);
           this.boardArray[chosenTile.row][chosenTile.col].tileSprite.alpha = 0;
           this.tweens.add({
             targets: [this.boardArray[chosenTile.row][chosenTile.col].tileSprite],
             alpha: 1,
             duration: gameOptions.tweenSpeed,
             callbackScope: this,
             onComplete: function(){
               console.log("animation DONE!");
               this.canMove = true;
             }
           });
         }
      }
}
