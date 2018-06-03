var apiAddress = "http://localhost:8080/ScaleAPI"
var scale;

$(document).ready(function(){
	var zyAlert = new ZyAlert();
	var progress = new Progress($(".scale-panel"));
	scale = new Scale(apiAddress, 
		progress.showProgress, 
		progress.hideProgress,
		function(text) {
			zyAlert.show(text);
		});

	setEvents();
});

function setEvents() {
	$("#btnStart").click(function(e) {
		scale.showScaleList();
		e.stopPropagation();
	});
};



