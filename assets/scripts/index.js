var apiAddress = "http://localhost:8080/ScaleAPI"
var scale;

$(document).ready(function(){
	var progress = new Progress($(".scale-panel"));
	scale = new Scale(apiAddress, 
		progress.showProgress, 
		progress.hideProgress);

	setTimeout(playEntryBots, 1000);
	setEvents();
});

function playMusic() {
	var music = $("#bg-music")[0];
	if(music.paused) {
		music.play();
	}

	$(".dv-sound").addClass("playing");
};

function pauseMusic() {
	var music = $("#bg-music")[0];
	if(!music.paused) {
		music.pause();
	}

	$(".dv-sound").removeClass("playing");
};

function playEntryBots() {
	var imgs = $(".menu-slide-entry-bot");
	var len = imgs.length;

	var current = imgs.filter(":visible");
	var next = current.next();

	if(next.length == 0) {
		next = imgs.first();
	}

	current.hide(500, function(){
		next.fadeIn(500, function(){
			setTimeout(playEntryBots, 1000);
		});
	});	
}

function setEvents() {
	$("#btnStart").click(function(e) {
		scale.showScaleList();
		e.stopPropagation();
	});

	$(".dv-sound").click(function(){
		if($(this).hasClass("playing")) {
			pauseMusic();
		} else {
			playMusic();
		}
	});
};



