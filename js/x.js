// global variables
GAME_OVER = true;
GAME_SCORE = 0;
STAGE_WIDTH = 465;
STAGE_HEIGHT = 465;

// quick method
$.fn.active = function() {
	$(this).addClass('active');
}
$.fn.deactive = function() {
	$(this).removeClass('active');
}
// add remove method for array
Array.prototype.remove = function(el) {
	var index = this.indexOf(el);
	if( index == -1 ) return false;
	this.splice(index, 1);
	return this;
}
// return the elapsed time from the last call
function TIMER() {
	var now = new Date().getTime(),
		elapsed = now - TIMER.last;
	TIMER.last = now;
	return elapsed;
}
TIMER.last = new Date().getTime();

//////////////////////////////////////////////////////////////////////////////////////////////////////

// define warship
function WARSHIP() {
	var self = this;
	self.x = 240;
	self.dom = $('<div>').attr('id', 'warship').css('x', self.x - WARSHIP.width).appendTo(stage);
	// bind keydown event
	$(window).on('keydown', function(e) {
		WARSHIP.key[e.keyCode] = true;
		// fire
		if( e.keyCode == 90 ) self.fire();
	}).on('keyup', function(e) {
		WARSHIP.key[e.keyCode] = false;
	});
}
// move warship on keydown
WARSHIP.prototype.loop = function() {
	// map key
	if( WARSHIP.key[37] ) {
		this.x -= WARSHIP.speed; 
		this.x = this.x > 0 ? this.x : 0;
	}
	if( WARSHIP.key[39] ) {
		this.x += WARSHIP.speed; 
		this.x = this.x < STAGE_WIDTH ? this.x : STAGE_WIDTH;
	}
	// move the ship
	this.dom.css('left', this.x - WARSHIP.width);
}
// fire!
WARSHIP.prototype.fire = function() {
	var bullet = new BULLET(this.x);
	BULLET.list.push(bullet);
}
// put the warship to its initial position
WARSHIP.prototype.init = function() {
	this.x = 240;
	this.dom.css('x', this.x);
}
// static var
WARSHIP.width = 96/2;
WARSHIP.speed = 8;
WARSHIP.key   = {37: false, 39: false, 90: false}; // save currently pressed key

//////////////////////////////////////////////////////////////////////////////////////////////////

// define UFO
function UFO(x) {
	// private var
	this.x = x;
	this.y = -80;
	// cache the left & right border of this ufo
	this.left = this.x - UFO.width;
	this.right = this.x + UFO.width;
	this.dom = $('<div>').addClass('ufo').css({'left': this.x - UFO.width, 'top': this.y}).appendTo(stage);
}
// instance methods
// main loop
UFO.prototype.loop = function() {
	this.y += UFO.speed;
	// check if current ufo has hit the earth
	if( this.y < (STAGE_HEIGHT-120) )
		this.dom.css('top', this.y);
	else 
		this.destroy();
}
// destroy
UFO.prototype.destroy = function() {
	this.dom.remove();
	UFO.list.remove(this);
	delete this;
}
// static vars
UFO.width = 100/2;  // pixel width
UFO.height= 80;
UFO.speed = 2;    // speed
UFO.list  = [];   // array which contains all current ufos
UFO.cd    = 1000;  // cooldown for new ufo
UFO.rate  = .6;   // new ufo generate rate
UFO.loop  = null; // the new ufo generating interval
// static methods
UFO.g     = function() { // generate new ufo
	if( Math.random() > UFO.rate ) return;
	var x = Math.floor( Math.random() * (STAGE_WIDTH-100) ) + 50 ;
	UFO.list.push(new UFO(x));
}

/////////////////////////////////////////////////////////////////////////////////////////////////

// define bullet
function BULLET(x) {
	// the x should be where warship is
	this.x = x;
	this.y = 385;
	// cache the left & right border of this bullet
	this.left = this.x - BULLET.width;
	this.right = this.x + BULLET.width;
	this.dom = $('<div>').addClass('bullet').css({'left': this.x - BULLET.width, 'top': this.y}).appendTo(stage);
}
// move
BULLET.prototype.loop = function() {
	this.y -= BULLET.speed;
	this.dom.css('top', this.y);
	// over border check
	if( this.y < -BULLET.height ) 
		this.destroy();
	// hit check
	for( var i = 0; i < UFO.list.length; i++ ) {
		var ufo = UFO.list[i];
		// this condition may lose 6px, but it's much simpler & faster than precise condition
		if( this.x > ufo.left && this.x < ufo.right && this.y < ufo.y + UFO.height ) {
			ufo.destroy();
			// boooom
			new BOOM(this.x, this.y);
		}
	}
}
// destroy
BULLET.prototype.destroy = function() {
	this.dom.remove();
	BULLET.list.shift(); // this bullet is always the first one in list
	delete this;
}
// static vars
BULLET.speed = 3;
BULLET.width = 24/2;
BULLET.height= 12;
BULLET.list  = [];

//////////////////////////////////////////////////////////////////////////////////////////////////

// define bom
function BOOM(x, y) {
	var self = this;
	self.dom = $('<div>').addClass('boom').css({'left': x - BOOM.width, 'top': y - BOOM.height}).appendTo(stage);
	// run self-destroy function
	setTimeout(function() {
		self.dom.remove();
		delete self;
	}, 1000);
}
// static
BOOM.width = 120/2;
BOOM.height = 120/2;

//////////////////////////////////////////////////////////////////////////////////////////////////

// main logical

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
	// 
	start();
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
	// clear ufos
	UFO.list = [];
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
	var i;
	// never cache UFO.list.length here! because ufo.loop will modify the array async
	for( i = 0; i < UFO.list.length; i++ ) {
		UFO.list[i].loop();
	}
	// warship move loop
	warship.loop();
	// move bullets
	for( i = 0; i < BULLET.list.length; i++ ) {
		BULLET.list[i].loop();
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