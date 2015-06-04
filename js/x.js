// global variables
GAME_OVER = true;
TIMESTAMP = 0;
STAGE_WIDTH = 465;
STAGE_HEIGHT = 465;

// quick method
$.fn.active = function() {
	$(this).addClass('active');
}
$.fn.deactive = function() {
	$(this).removeClass('active');
}
// return the elapsed time from the last call
function TIMER() {
	var now = new Date().getTime(),
		elapsed = now - TIMER.last;
	TIMER.last = now;
	return elapsed;
}
TIMER.last = new Date().getTime();

//////////////////////////////////////////////////////////////////////////////////////////////////

// define UFO
function UFO(x) {
	// private var
	this.x = x;
	this.y = -80;
	this.dom = $('<div>').addClass('ufo').css({'left': this.x, 'top': this.y}).appendTo(stage);
}
// instance methods
UFO.prototype.loop = function() {
	this.y += UFO.speed;
	// check if current ufo is out of border
	if( this.y < STAGE_HEIGHT )
		this.dom.css('top', this.y);
	else {
		this.dom.remove();
		UFO.list.shift(); // current ufo is always the first one in list
		delete this;
	}
}
// static vars
UFO.speed = 5;    // speed
UFO.list  = [];   // array which contains all current ufos
UFO.cd    = 500;  // cooldown for new ufo
UFO.rate  = .7;   // new ufo generate rate
UFO.loop  = null; // the new ufo generating interval
// static methods
UFO.g     = function() { // generate new ufo
	if( Math.random() > UFO.rate ) return;
	var x = Math.floor( Math.random() * (STAGE_WIDTH-100) ) + 50 ;
	UFO.list.push(new UFO(x));
}

/////////////////////////////////////////////////////////////////////////////////////////////////

// define warship
function WARSHIP() {
	this.x = 190;
	this.dom = $('<div>').attr('id', 'warship').css('x', this.x).appendTo(stage);
}
// move warship on keydown
WARSHIP.prototype.move = function(e) {
	console.log(e);
	// map key
}
WARSHIP.prototype.init = function() {
	this.x = 190;
	this.dom.css('x', this.x);
}

//////////////////////////////////////////////////////////////////////////////////////////////////

// call this method only one time after the page loads completely
// it caches elements which always has only one instance
function init() {
	game  = $('#game');
	stage = $('#stage');
	earth = $('#earth');
	hp    = $('#hpbar');
	blink = $('#blink');
	board = $('#gameover');
	warship = new WARSHIP();
}

// start a game for user
function start() {
	// set GAME_OVER to false
	GAME_OVER = false;
	// show the game stage
	active_stage();
	// start generating new ufo
	UFO.loop = setInterval(UFO.g, UFO.cd);
	// start the main loop
	loop();
}

// ends the game and clear the stage
function end() {
	// set GAMEOVER to true
	GAME_OVER = true;
	// stop the generate loop
	clearInterval(UFO.loop);
	// show the score board
	deactive_stage();
}

// every frame update game process
function loop() {
	// if GAME_OVER then break the loop
	if( GAME_OVER ) {
		return;
	}
	// move forward current elements
	// never cache UFO.list.length here! because ufo.loop will modify the array async
	for( var i = 0; i < UFO.list.length; i++ ) {
		UFO.list[i].loop();
	}
	// do loop
	requestAnimationFrame(loop);
}

// put all the elements to their inital position and show the stage
function active_stage() {
	// move warship to initial position
	warship.init();
	// initialize hp bar
	for(var i = 0; i < 3; i++ ) $('<span>').addClass('h').appendTo(hp);
	// hide score board
	board.deactive();
	// show game stage, rock!
	stage.active();
}

// hide the stage and remove dynamic elements
function deactive_stage() {
	// hide stage
	stage.deactive();
	// blink animation
	blink.active();
	// show score board
	board.active();
	// remove elements
	$('.ufo, .bullet, .bom').remove();
	// clear hpbar
	hp.empty();
}

window.onload = init;