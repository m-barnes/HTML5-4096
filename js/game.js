var game;

//create the window for the game to run in.
window.onload = function() {
  var gameConfig = {
    width:480,
    height:640,
    backgroundColor: 0xff0000,
    scene:[bootGame, playGame]
  }
//create a new game object using the phaser framework
game = new Phaser.Game(gameConfig);
window.focus();
resizeGame();
window.addEventListener("resize", resizeGame);
}

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

class bootGame extends Phaser.Scene {
  constructor() {
    super("BootGame");
  }
  create() {
    console.log("game is booting....");
    this.scene.start("PlayGame");
  }
}

class playGame extends Phaser.Scene {
  constructor() {
    super("PlayGame");
  }
  create() {
    console.log("This is my awesome game!");
  }
}
