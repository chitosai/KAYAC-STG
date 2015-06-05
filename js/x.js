// global variables
GAME_OVER = true;
GAME_SCORE = 0;
GAME_LIFE = 4;
STAGE_WIDTH = 465;
STAGE_HEIGHT = 465;
TWITTER_API = 'https://twitter.com/intent/tweet?text=';
TWITTER_TEXT = 'Just now when you were asleep I have protected the earth by shooting {$score} ufo down!';

/////////////////////////////////////////////////////////////////////////////////////////////////// utilities
// create dom element
function el(tagName) {
	return document.createElement(tagName);
}
// extends DOM methods
// class control
Element.prototype.addClass = function(className) {
	this.classList.add(className);
	return this;
}
Element.prototype.removeClass = function(className) {
	this.classList.remove(className);
	return this;
}
Element.prototype.hasClass = function(className) {
	return this.classList.contains(className);
}
// set id
Element.prototype.setId = function(id) {
	this.id = id;
	return this;
}
// set element coordinate
Element.prototype.x = function(x) {
	x = typeof x == 'number' ? x + 'px' : x;
	this.style.left = x;
	return this;
}
Element.prototype.y = function(y) {
	y = typeof y == 'number' ? y + 'px' : y;
	this.style.top = y;
	return this;
}
// force the element to reflow by setting element's width
Element.prototype.reflow = function() {
	this.style.width = '100%';
	return this;
}
// put the element onto the stage
Element.prototype.debut = function() {
	document.getElementById('stage').appendChild(this);
	return this;
}
// remove an element's all child nodes
Element.prototype.empty = function() {
	while(this.lastChild) {
		this.removeChind(this.lastChild);
	}
	return this;
}
// quick method
Element.prototype.active = function() {
	this.addClass('active');
	return this;
}
Element.prototype.deactive = function() {
	this.removeClass('active');
	return this;
}
// extens Array
// add remove method for array
Array.prototype.remove = function(el) {
	var index = this.indexOf(el);
	if( index == -1 ) return false;
	this.splice(index, 1);
	return this;
}
// empty a array, removing its all children and the children's dom
Array.prototype.destroy = function() {
	var tmp = null;
	while( tmp = this.pop() ) {
		// remove its dom
		if( typeof tmp.dom != 'undefined' && typeof tmp.dom.remove == 'function' )
			tmp.dom.remove();
		// delete itself
		delete tmp;
	}
}
// bind events in jQuery style
Object.prototype.on = function(event, callback) {
	this.addEventListener(event, callback);
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

////////////////////////////////////////////////////////////////////////////////////////////////////// WARSHIP

function WARSHIP() {
	var self = this;
	self.x = 240;
	self.dom = el('div').setId('warship').x(self.x - WARSHIP.width).debut();
	// bind keydown event
	window.on('keydown', function(e) {
		WARSHIP.key[e.keyCode] = true;
		// fire
		if( e.keyCode == 90 ) self.fire();
	}).on('keyup', function(e) {
		WARSHIP.key[e.keyCode] = false;
	});
}
// move warship on keydown
WARSHIP.prototype.loop = function() {
	// dispatch
	if( WARSHIP.key[37] ) {
		this.x -= WARSHIP.speed; 
		this.x = this.x > 0 ? this.x : 0;
	}
	if( WARSHIP.key[39] ) {
		this.x += WARSHIP.speed; 
		this.x = this.x < STAGE_WIDTH ? this.x : STAGE_WIDTH;
	}
	// move the ship
	this.dom.x(this.x - WARSHIP.width);
}
// fire!
WARSHIP.prototype.fire = function() {
	var bullet = new BULLET(this.x);
	BULLET.list.push(bullet);
}
// put the warship to its initial position
WARSHIP.prototype.init = function() {
	this.x = 240;
	this.dom.x(this.x);
}
// static var
WARSHIP.width = 96/2;
WARSHIP.speed = 8;
WARSHIP.key   = {37: false, 39: false, 90: false}; // save currently pressed key

////////////////////////////////////////////////////////////////////////////////////////////////// UFO

function UFO(x) {
	// private var
	this.x = x;
	this.y = -80;
	// cache the left & right border of this ufo
	this.left = this.x - UFO.width;
	this.right = this.x + UFO.width;
	this.dom = el('div').addClass('ufo').x(this.x-UFO.width).y(this.y).debut();
}
// instance methods
// main loop
UFO.prototype.loop = function() {
	this.y += UFO.speed;
	// check if current ufo has hit the earth
	if( this.y < STAGE_HEIGHT-120 ) 
		this.dom.y(this.y);
	else {
		// hit the earth!
		this.destroy();
		// blink the earth
		EARTH.hit();
	}
}
// hit by player
UFO.prototype.hit = function() {
	// incr score
	GAME_SCORE++;
	// call self-destroy
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
UFO.g = function() { // generate new ufo
	if( Math.random() > UFO.rate ) return;
	var x = Math.floor( Math.random() * STAGE_WIDTH-100 ) + 50;
	UFO.list.push(new UFO(x));
}

///////////////////////////////////////////////////////////////////////////////////////////////// BULLET

function BULLET(x) {
	// the x should be where warship is
	this.x = x;
	this.y = 385;
	// cache the left & right border of this bullet
	this.left = this.x - BULLET.width;
	this.right = this.x + BULLET.width;
	this.dom = el('div').addClass('bullet').x(this.x-BULLET.width).y(this.y).debut();
}
// move
BULLET.prototype.loop = function() {
	this.y -= BULLET.speed;
	this.dom.y(this.y);
	// over border check
	if( this.y < -BULLET.height ) 
		this.destroy();
	// hit check
	for( var i = 0; i < UFO.list.length; i++ ) {
		var ufo = UFO.list[i];
		// this condition may lose 6px, but it's much simpler & faster than precise condition
		if( this.x > ufo.left && this.x < ufo.right && this.y < ufo.y + UFO.height ) {
			ufo.hit();
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

////////////////////////////////////////////////////////////////////////////////////////////////// BOOM

function BOOM(x, y) {
	var self = this;
	self.dom = el('div').addClass('boom').x(x-BOOM.width).y(y-BOOM.height).debut();
	// run self-destroy function
	setTimeout(function() {
		self.dom.remove();
		delete self;
	}, 1000);
}
// static
BOOM.width = 120/2;
BOOM.height = 120/2;

////////////////////////////////////////////////////////////////////////////////////////////////// EARTH

EARTH = new Object();
EARTH.dom = null;
EARTH.tick = null; // timeout to remove the 'hit' class
EARTH.hit = function() {
	// decrease hp
	HP.decr();
	// reflow the element to force replay hit animation every time
	if( EARTH.dom.hasClass('hit') ) {
		EARTH.dom.removeClass('hit').reflow();
		clearTimeout(EARTH.tick);
	}
	EARTH.dom.addClass('hit');
	EARTH.tick = setTimeout(function() {
		EARTH.dom.removeClass('hit');
	}, 1500);
}

////////////////////////////////////////////////////////////////////////////////////////////////// HP BAR

HP = function(type) {
	if( type != 'h' && type != 'd' ) return;
	this.dom = el('span').addClass(type);
	HP.bar.appendChild(this.dom);
	HP.list.push(this);
}
HP.hp = GAME_LIFE;
HP.bar = null;
HP.list = [];
// initialize the hp bar: put 3 healthy heart inside
HP.init = function() {
	// reset hp
	HP.hp = GAME_LIFE;
	// clear former hp bar
	HP.bar = document.getElementById('hpbar').empty();
	HP.list = [];
	// put new
	for( var i = 0; i < 3; i++ ) {
		var hp = new HP('h');
	}
}
// when earth is hit...
HP.decr = function() {
	// remove the first blood in hp bar
	var h = HP.list.shift();
	h.dom.remove();
	delete h;
	// push a new one in
	new HP('d');
	// decr hp
	HP.hp--;
	// check gameover?
	if( HP.hp == 0 )
		end();
}

////////////////////////////////////////////////////////////////////////////////////////////////// MAIN 

// main logical

// call this method only one time after the page loads completely
// it caches elements which always has only one instance
function init() {
	game  = document.getElementById('game');
	stage = document.getElementById('stage');
	blink = document.getElementById('blink');
	board = document.getElementById('gameover');
	score = document.getElementById('score');
	twitter = document.getElementById('tsubuyaku');
	EARTH.dom = document.getElementById('earth');
	warship = new WARSHIP();
	// 
	start();
}

// start a game for user
function start() {
	// set GAME_OVER to false
	GAME_OVER = false;
	// init the score
	GAME_SCORE = 0;
	// move warship to initial position
	warship.init();
	// initialize hp bar
	HP.init();
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
	// clear current elements
	UFO.list.destroy();
	BULLET.list.destroy();
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
	setTimeout(function() { blink.deactive(); }, 1000);
	// fill the score
	score.textContent = GAME_SCORE;
	// prepare the twitter share link
	twitter.href = TWITTER_API + TWITTER_TEXT.replace('{$score}', GAME_SCORE);
	// show score board
	board.active();
}

window.onload = init;