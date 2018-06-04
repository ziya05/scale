function Progress(container) {

	this.container = container;

	this.isInit = false;
	this.panel = null;
	this.bg = null;
	this.fg = null;
	this.content = null;

	this.t = null;

	var _ = this;

	this.showProgress = function(text) {
		if (_.isInit == false) {
			_.panel = $("<div></div>")
				.addClass("ziya-progress-panel")
				.appendTo(container);

			_.bg = $("<div></div>")
				.addClass("ziya-progress-bg")
				.appendTo(_.panel);

			_.content = $("<p></p>")
				.addClass("ziya-progress-content")
				.appendTo(_.panel);

			_.fg = $("<div></div>")
				.addClass("ziya-progress-fg")
				.appendTo(_.bg);

			_.isInit = true;
		}

		_.content.text("");
		if (typeof text != "undefined"
			&& text != null) {
			_.content.text(text);
		}

		_.panel.show();

		_.t = setInterval(go, 10);
	};

	this.hideProgress = function(){
		if (_.isInit == true) {
			clearInterval(_.t);
			_.fg.css("left", "0px");
			_.panel.hide();
		}
	};

	function go() {
		var bgLen = _.bg.width();
		var fgLen = _.fg.width();
		var fgLeft = parseFloat( _.fg.css("left"));
		
		var newLeft = fgLeft + 10;
		if (newLeft >= bgLen) {
			newLeft = fgLen * -1;
		}

		_.fg.css("left", newLeft + "px");
	}
}