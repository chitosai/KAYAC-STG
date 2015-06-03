// global variables
GAME_OVER = true;

// call this method only one time after the page loads completely
// it caches elements which always has only one instance to var
function init() {
	stage = $('#stage');
	game = $('#game');
	earth = $('#earth');
	warship = $('#warship');
	hp = $('#hpbar');
	blink = $('#gameover-blink');
	board = $('#gameover');
}

// start a game for user
function start() {
	// move warship to initial position
	warship.css('left', '190px');
	// init hp bar
	for(var i = 0; i < 3; i++ ) {
		$('<span>').addClass('h').appendTo(hp);
	}
	// hide score board
	board.removeClass('active');
	// display everything, game go!
	game.addClass('active');

	// start the main loop
	GAME_OVER = false;
	loop();
}

// every frame update game process
function loop() {
	// if GAME_OVER then break the loop
	if( GAME_OVER ) {
		return;
	}

	console.log('loop');
	requestAnimationFrame(loop);
}

function show_score() {
	// blink animation

	// show score board
	board.addClass('active');
}

// ends the game and clear the stage
function end() {
	// set GAMEOVER = true
	GAME_OVER = true;
	// show the score board
	show_score();
	// hide stage
	game.removeClass('active');
	// remove elements
	$('.ufo, .bullet, .bom').remove();
	// clear hpbar
	hp.empty();
}

window.onload = init;