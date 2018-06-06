var apiAddress;
var scale;

$(document).ready(function(){
	apiAddress = getProtocalHost() + "/ScaleAPI";

	var zyAlert = new ZyAlert();
	var progress = new Progress($(".scale-panel"));
	scale = new Scale(apiAddress, 
		progress.showProgress, 
		progress.hideProgress,
		function(text, noShowAlert) {
			if (noShowAlert) {
				scale.close(toggleMove);
			} else {
				zyAlert.show(text, function() {
					scale.close(toggleMove);
				});
			}
		});

	setEvents();
});

function setEvents() {
	$("#btnStart").click(function(e) {
		scale.showScaleList(toggleMove);
		e.stopPropagation();
	});
};


function toggleMove() {
	$(".zy-ui-foreground-earth")
		.toggleClass("move");

	$(".zy-ui-foreground-satellite")
		.toggleClass("move");
};
