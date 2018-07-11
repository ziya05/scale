
$(document).ready(function(){
	var apiAddress = getProtocalHost() + "/ScaleAPI";

	var zyAlert = new ZyAlert();
	var progress = new Progress($(".scale-panel"));

	var scale = new Scale({
		apiAddress: apiAddress,
		showProgress: progress.showProgress, 
		hideProgress: progress.hideProgress,
		endCallback: function(text, noShowAlert) {
			if (noShowAlert) {
				scale.close(function(){
					toggleMove(true);
				});
			} else {
				zyAlert.show(text, function() {
					scale.close(function(){
						toggleMove(true);
					});
				});
			}
		},
		alertCallback: function(text, callback){
			zyAlert.show(text, callback)
		},
	});

	$("#btnStart").click(function(e) {
		scale.showScaleList(function(){
			toggleMove(false);
		});
		e.stopPropagation();
	});
});

function toggleMove(isMove) {

	if (isMove) {
		$(".zy-ui-foreground-earth")
			.addClass("move");

		$(".zy-ui-foreground-satellite")
			.addClass("move");
	} else {
		$(".zy-ui-foreground-earth")
			.removeClass("move");

		$(".zy-ui-foreground-satellite")
			.removeClass("move");
	}
	
};
