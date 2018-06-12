function Scale(apiAddress, showProgress, hideProgress, endCallback) {

	this.mask = null;
	this.panel = null;

	this.scaleLstPanel = null;
	this.scaleLstContainer = null;
	this.scaleLstPanelClose = null;

	this.scalePanelPersonal = null;
	this.scalePanelPersonalExtra = null;
	this.scalePanelPersonalBack = null;
	this.scalePanelPersonalGo = null;

	this.scalePanelGuide = null;
	this.scalePanelGuideTitle = null;
	this.scalePanelGuideDescription = null;
	this.scalePanelGuideBack = null;
	this.scalePanelGuideGo = null;

	this.scalePanelRun = null;

	this.apiAddress = apiAddress;
	this.getScalesUrl = getApi("/ScaleService/scales");
	this.getPersonalInfoByScaleId = getApi("/ScaleService/personalInfo/");
	this.getScaleById = getApi("/ScaleService/scale/");
	this.getResult = getApi("/ScaleService/scale/result/");

	this.endCallback = endCallback;

	var _ = this;

	init();

	this.showScaleList = function(callback) {
		preparePage();
		_.mask.show(500, function(){
			 _.panel.slideDown(500, function(){

				if (typeof callback != "undefined"
					&& callback != null) {
					callback();
				}

				loadScaleList(false, function(data) {
					paintLstPage(data);
					showLstPage();
				});
			 });
		});
	}

	function loadScaleList(enforce, callback) {
		if (typeof enforce == "undefined" 
			|| enforce == null
			|| enforce == false) {
			var loaded = _.scaleLstContainer.data("loaded");
			if (loaded != null && loaded == "true") {
				_.scaleLstPanel.slideDown(300);
				return;
			}
		}

		_showProgress("正在加载量表列表， 请稍等...");

		$.get(_.getScalesUrl, function(data, status){
			    _hideProgress();
				if (callback != null) {
					callback(data);
				}
			}, 
		"json")
		.fail(function(xhr, status, error){
			loadError("数据加载失败！", xhr, status, error);
		});
	};

	function paintLstPage(data) {
		$.each(data, function(i, d) {
			var div = $("<div></div>")
				.addClass("scale-lst-item")
				.appendTo(_.scaleLstContainer)
				.click(function(e){
					hideLstPage(function() {
						paintDescription(d.id, d.name, d.description);

						_.scalePanelPersonalExtra.empty();
						loadPersonalInfo(d.id, function(data) {
							paintPersonal(data);
							showPersonalPage();
						});
					});

				});

			$("<p></p>")
				.addClass("scale-lst-item-name")
				.text(d.name)
				.appendTo(div);

			_.scaleLstContainer.data("loaded", "true");
		});
	};

	function loadPersonalInfo(id, callback) {
		_showProgress("正在加载所需用户信息，请稍等...");
		var url = _.getPersonalInfoByScaleId + id;
		$.get(url, function(data, status) {

			_hideProgress();
			if (callback != null) {
				callback(data);
			}

		}, "json")
		.fail(function(xhr, status, error){
			loadError("数据加载失败！", xhr, status, error);
		});
	};

	function paintPersonal(data) {
		$.each(data.items, function(i, item){
				var itemType = item.infoType;

				var dvItem = $("<div></div>")
					.addClass("scale-personal-item")
					.appendTo(_.scalePanelPersonalExtra);

				$("<span></span>")
					.addClass("scale-personal-item-title")
					.text(item.title + ":")
					.appendTo(dvItem);

				var input = null;
				if (itemType == 1) {
					input = $("<input type='text' />");
						
				} else if (itemType == 2) {
					input = $("<select></select>");
					$("<option></option>")
						.appendTo(input);

					$.each(item.itemOptions, function(i, option) {
						$("<option></option>")
							.val(option.option)
							.text(option.option)
							.appendTo(input);
					});
				} 

				if (input != null) {
					input
					.addClass("scale-personal-item-input")
						.data("scale-personal-item-name", item.name)
						.data("scale-personal-item-title", item.title)
						.appendTo(dvItem);
				}
			});

			var items = $(".scale-personal-item-input");

			items.filter("input").keyup(checkEmpty);
			items.filter("select").change(checkEmpty);

			function checkEmpty() {
				if (!hasEmpty(items)
					&& _.scalePanelPersonalGo.hasClass("disable")) {
					_.scalePanelPersonalGo.removeClass("disable");

				} else if(hasEmpty(items)
					&& !_.scalePanelPersonalGo.hasClass("disable")) {
					_.scalePanelPersonalGo.addClass("disable");
				}
			};
	};

	function paintDescription(id, name, description) {
		_.scalePanelGuideTitle.text(name);
		_.scalePanelGuideDescription.text(description);
		_.scalePanelGuide.data("scale-id", id)
	};

	function loadScale(id, callback) {
		_showProgress("正在加载指定量表，请稍等...");
		var url = _.getScaleById + id;
		$.get(url, function(data, status){
			_hideProgress();
			 if (callback != null) {
			 	callback(data);
			 }

		}, "json")
		.fail(function(xhr, status, error){
			loadError("数据加载失败！", xhr, status, error);
		});

	};

	function paintScale(data) {
		var totalItemCount = data.items.length;
			$.each(data.items, function(i, item) {
				var questionType = item.questionType;

				var dv = $("<div></div>")
					.addClass("scale-item")
					.attr("data-item-id", item.id)
					.attr("data-item-type", questionType)
					.appendTo(_.scalePanelRun);

				$("<p></p>")
					.addClass("scale-item-title")
					.text("第" + item.id + "题 " + item.title)
					.appendTo(dv);

				var optionPanel = $("<div></div")
					.addClass("scale-item-option-panel")
					.appendTo(dv);

				$.each(item.items, function(i, option) {
					var optionBox = $("<div></div>")
						.addClass("scale-item-option-box")
						.appendTo(optionPanel)
						.click(function (){
							$(this).children(".scale-item-option").click();
						});

					if (questionType == 1) {
						var radio = $("<input type='radio' />")
						.attr("name", item.id)
						.addClass("scale-item-option")
						.val(option.optionId)
						.attr("data-scale-next", option.next)
						.data("item-score", option.score)
						.appendTo(optionBox);

						radio.click(function(e){

							var r = $(this);
							var nextId = r.data("scale-next");
							if (nextId == 0) {
								nextId = dv.data("item-id") + 1;
							}

							jump(dv, nextId, totalItemCount);

							e.stopPropagation();
						});
					} else if (questionType == 2) {
						var ck = $("<input type='checkbox' />")
							.attr("name", item.id)
							.addClass("scale-item-option")
							.val(option.optionId)
							.data("item-score", option.score)
							.appendTo(optionBox);
					}								

					$("<span></span>")
						.addClass("scale-item-option-text")
						.text(option.optionId + ". " + option.content)
						.appendTo(optionBox);
				});

				if (questionType == 2 || questionType == 4) {
					var tools = $("<div></div>")
						.addClass("scale-item-tools")
						.appendTo(dv);

					$("<input type='button' value='下一题' />")
						.addClass("scale-item-tools-btn")
						.appendTo(tools)
						.click(function(){
							var nextId = dv.data("item-id") + 1;
							jump(dv, nextId, totalItemCount);
						});
				}
			});

			function jump(dv, nextId, totalItemCount) {
				if (nextId > totalItemCount) {
					hideScalePage(function() {
						showResult(data.id, totalItemCount);
					})
				} else {
					dv.fadeOut(300, function(){
						 _.scalePanelRun.find(".scale-item")
						 .filter("[data-item-id=" + nextId + "]")
						 .show(300);
					});
				}
			};
	};

	function showResult(id, totalItemCount) {

		var dvItems = $(".scale-item");

		var data = [];
		for(var i = 1; i <= totalItemCount; i++) {

			var val = -1;
			var score = 0;

			var dvItem = dvItems.filter("[data-item-id=" + i + "]");
			var questionType = dvItem.data("item-type");
			var option = dvItem 
					.find(".scale-item-option:checked");

			if (questionType == 1) {
				if (option.length == 1) {
					val = option.val();
					score = option.data("item-score");
				}
			} else if (questionType == 2) {

				if (option.length >= 1) {
					val = "";
					score = 0;

					$.each(option, function(i, c) {
						val += $(c).val();
						score += parseInt($(c).data("item-score"));
					});
				}
			}

			var optionSelected = {
				questionId : i,
				optionId : val,
				score : score
			};

			data.push(optionSelected);
		}

		var selectedData = {
			items: data
		};

		var extraInfo = [];
		var inputs = $(".scale-personal-extra .scale-personal-item-input");
		$.each(inputs, function(i, input){
			var obj = $(input);
			var infoItem = {
				name: obj.data("scale-personal-item-name"),
				title: obj.data("scale-personal-item-title"),
				content: obj.val().trim()
			};

			extraInfo.push(infoItem);
		});

		var info = {
			name: $("#scale-personal-name").val().trim(),
			gender: $("#scale-personal-gender").val().trim(),
			age: $("#scale-personal-age").val().trim(),
			items: extraInfo
		};

		var historyData = {
			data: selectedData,
			info: info
		};

		_showProgress("正在保存数据，请稍等...")

		$.ajax({
			type: "post",
			url: _.getResult + id,
			data: JSON.stringify(historyData),
			contentType: "application/json; charset=utf-8",
			dataType: "text",
			success: function(data) {
				_hideProgress();
			
				if (data == "") {
					endCallback("数据保存成功！");
				} else {
					endCallback("数据保存失败！[" + data + "]")
				}
			},
			error: function(xhr, status, error) {
				_hideProgress();
				loadError("数据保存失败！ ", xhr, status, error);
			},
		});
	};

	this.close = function(callback) {
		_.panel.slideUp(500, function(){
			_.mask.hide(500, function() {
				if (typeof callback != "undefined" 
					&& callback != null) {
					callback();
				}
			});
		});
	};

	function _showProgress(text) {

		if (typeof showProgress != "undefined" 
		&& showProgress != null) {
			showProgress(text);
		}
	};

	function _hideProgress() {
		if (typeof hideProgress != "undefined"
			&& hideProgress != null) {
			hideProgress();
		}
	}

	function init() {
		_.mask = $(".scale-mask");
		_.panel = $(".scale-panel");

		_.scaleLstPanel = $(".scale-panel-lst");
		_.scaleLstContainer = $(".scale-lst-container");
		_.scaleLstPanelClose = $(".scale-panel-lst-close");

		_.scalePanelPersonal = $(".scale-panel-personal");
		_.scalePanelPersonalExtra = $(".scale-personal-extra");
		_.scalePanelPersonalBack = $(".scale-btn-personal-back");
		_.scalePanelPersonalGo = $(".scale-btn-personal-go");

		_.scalePanelGuide = $(".scale-panel-guide");
		_.scalePanelGuideTitle = $(".scale-panel-guide > .scale-panel-title");
		_.scalePanelGuideDescription = $(".scale-panel-guide-description");
		_.scalePanelGuideBack = $(".scale-btn-guide-back");
		_.scalePanelGuideGo = $(".scale-btn-guide-go");

		_.scalePanelRun = $(".scale-panel-run");

		_.scalePanelPersonalBack.click(function(){
			hidePersonalPage(showLstPage);
		});

		_.scalePanelPersonalGo.click(function() {
			if(isEnable(_.scalePanelPersonalGo)) {
				hidePersonalPage(showDescPage);
			}
		});

		_.scalePanelGuideBack.click(function(){
			hideDescPage(showPersonalPage);
		});

		_.scalePanelGuideGo.click(function(){
			hideDescPage(function(){
				_.scalePanelRun.empty();
				var id = _.scalePanelGuide.data("scale-id");
				loadScale(id, function(data) {
					paintScale(data);
					showScalePage();
				});
			});			
		});

		_.scaleLstPanelClose.click(function(){
			endCallback(null, true);
		});

	};

	function showLstPage(callback) {
		_.scaleLstPanel.show(300, function() {
			if (callback != null) {
				callback();
			}
		});
	};

	function hideLstPage(callback) {
		_.scaleLstPanel.hide(300, function() {
			if (callback != null) {
				callback();
			}
		});
	};

	function showPersonalPage(callback) {
		_.scalePanelPersonal.slideDown(500, function() {
			if (callback != null) {
				callback();
			}
		});
	};

	function hidePersonalPage(callback) {
		_.scalePanelPersonal.slideUp(500, function() {
			if (callback != null) {
				callback();
			}
		});
	};

	function showDescPage(callback) {
		_.scalePanelGuide.slideDown(500, function() {
			if (callback != null) {
				callback();
			}
		});
	};

	function hideDescPage(callback) {
		_.scalePanelGuide.slideUp(500, function() {
			if (callback != null) {
				callback();
			}
		});
	};

	function showScalePage(callback) {
		_.scalePanelRun.show();
		_.scalePanelRun.find(".scale-item").filter("[data-item-id=1]")
		.show(300, function() {
				if (callback != null) {
					callback();
				}
			});
	};

	function hideScalePage(callback) {
		_.scalePanelRun.hide(function() {
			if (callback != null) {
				callback();
			}
		});
	};

	function preparePage() {
		$(".scale-personal-item-input").val("");
		_.scalePanelPersonalGo.addClass("disable");
		_hideProgress();
	};

	function getApi(path) {
		return apiAddress + path;
	};

	function isEnable(obj) {
		return !obj.hasClass("disable");
	};

	function hasEmpty(data) {
		var hasEmpty = false;

		$.each(data, function(i, item){
			if ($(item).val().trim() == "") {
				hasEmpty = true;
			}
		});

		return hasEmpty;
	};

	function loadError(text, xhr, textStatus, errorThrown) {
		var msg = text;
		msg += "[" + xhr.status + "]";
		msg += "[" + textStatus + "]";

		_.endCallback(msg);
	};

};