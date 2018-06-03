function ZyAlert() {

	this.mask = null;
	this.panel = null;

	this.content = null;
	this.btnOK = null;
	this.btnCancel = null;

	var _ = this;

	this.show = function(text, okCallback, cancelCallback) {
		if (_.mask == null) {
			_.mask = $("<div></div>")
				.addClass("zy-alert-mask")
				.appendTo($("body"));

			_.panel = $("<div></div>")
				.addClass("zy-alert-panel")
				.appendTo($("body"));

			var container = $("<div></div>")
				.addClass("zy-alert-container")
				.appendTo(_.panel);

			_.content = $("<p></p>")
				.addClass("zy-alert-content")
				.appendTo(container);

			var tools = $("<div></div>")
				.addClass("zy-alert-tools")
				.appendTo(_.panel);

			var btnContainer = $("<div></div>")
				.addClass("zy-alert-btncontainer")
				.appendTo(tools);

			_.btnOK = $("<div></div>")
				.addClass("zy-alert-button zy-alert-ok")
				.text("确定")
				.appendTo(btnContainer);

			_.btnCancel = $("<div></div>")
				.addClass("zy-alert-button zy-alert-ok hidden")
				.text("取消")
				.appendTo(btnContainer);
		}

		_.content.text(text);

		_.btnOK.click(function(){
			close(okCallback);
		});

		if (cancelCallback != null) {
			_.btnCancel.removeClass("hidden")
				.click(function() {
					close(cancelCallback);
				})
		}

		_.mask.slideDown(300, function(){
			_.panel.slideDown(500);
		});

	};

	function close(callback) {
		_.panel.slideUp(500, function(){
				_.mask.slideUp(300, function(){
					if (typeof callback != "undefined" && callback != null) {
						callback();
					}
				})
			})
	};
};