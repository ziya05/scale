function Scale(apiAddress, showProgress, hideProgress) {

	this.mask = null;
	this.panel = null;

	this.scaleLstPanel = null;
	this.scaleLstContainer = null;
	this.scaleLstPanelClose = null;

	this.scalePanelScale = null;
	this.scalePanelScaleTitle = null;
	this.scalePanelScaleDescription = null;
	this.scalePanelScaleReselect = null;
	this.scalePanelScalePersonal = null;
	this.scalePanelScaleLoad = null;

	this.scalePanelPersonal = null;
	this.scalePanelPersonalExtra = null;
	this.scalePanelScaleGo = null;

	this.scalePanelRun = null;

	this.scalePanelResult = null;
	this.scalePanelResultInfo = null;
	this.scalePanelResultClose = null;

	this.apiAddress = apiAddress;
	this.getScalesUrl = getApi("/ScaleService/scales");
	this.getPersonalInfoByScaleId = getApi("/ScaleService/personalInfo/");
	this.getScaleById = getApi("/ScaleService/scale/");
	this.getResult = getApi("/ScaleService/scale/result/");


	init(this);

	var _ = this

	this.showScaleList = function() {

		_.mask.show(500, function(){
			 _.panel.slideDown(500, function(){

				_.updateScaleList(function(s, e){
					_.scalePanelScaleTitle.text(s.name);
					_.scalePanelScaleDescription.text(s.description);

					_.scaleLstPanel.hide(300, function(){
						_.scalePanelScale
							.data("scale-id", s.id)
							.slideDown(500);
					});
				});
			 });
		});
	}

	this.updateScaleList = function(rowClickCallback, enforce) {
		if (typeof enforce == "undefined" 
			|| enforce == null
			|| enforce == false) {
			var loaded = _.scaleLstContainer.data("loaded");
			if (loaded != null && loaded == "true") {
				_.scaleLstPanel.slideDown(300);
				return;
			}
		}

		_.showProgress("正在加载量表列表， 请稍等...");

		$.get(_.getScalesUrl, function(data, status){
			_.hideProgress();

				$.each(data, function(i, d) {
					var div = $("<div></div>")
						.addClass("scale-lst-item")
						.appendTo(_.scaleLstContainer)
						.click(function(e){
							rowClickCallback(d, e);
						});

					$("<p></p>")
						.addClass("scale-lst-item-name")
						.text(d.name)
						.appendTo(div);

					_.scaleLstContainer.data("loaded", "true");
				});

				_.scaleLstPanel.slideDown(300);
			}, 
		"json");
	};

	this.loadPersonalInfo = function(id) {
		_.showProgress("正在加载所需用户信息，请稍等...");
		var url = _.getPersonalInfoByScaleId + id;
		$.get(url, function(data, status) {
			$.each(data.items, function(i, item){
				var dvItem = $("<div></div>")
					.addClass("scale-personal-item")
					.appendTo(_.scalePanelPersonalExtra);

				$("<span></span>")
					.addClass("scale-personal-item-title")
					.text(item.title + ":")
					.appendTo(dvItem);

				$("<input type='text' />")
					.addClass("scale-personal-item-input")
					.data("scale-personal-item-name", item.name)
					.data("scale-personal-item-title", item.title)
					.appendTo(dvItem);
			});

			var items = $(".scale-personal-item-input");
			items
				.keyup(function() {

				if (!hasEmpty(items)
					&& _.scalePanelScaleGo.hasClass("disable")) {
					_.scalePanelScaleGo.removeClass("disable");

				} else if(hasEmpty(items)
					&& !_.scalePanelScaleGo.hasClass("disable")) {
					_.scalePanelScaleGo.addClass("disable");
				}
			});

			_.hideProgress();
			scale.scalePanelPersonal.slideDown(500);
		});
	};

	this.runScale = function(id) {
		_.showProgress("正在加载指定量表，请稍等...");
		var url = _.getScaleById + id;
		$.get(url, function(data, status){

			var totalItemCount = data.items.length;
			$.each(data.items, function(i, item) {

				var dv = $("<div></div>")
					.addClass("scale-item")
					.attr("data-item-id", item.id)
					.appendTo(_.scalePanelRun);

				$("<p></p>")
					.addClass("scale-item-title")
					.text("第" + item.id + "题 " + item.title)
					.appendTo(dv);

				var optionPanel = $("<div></div")
					.addClass("scale-item-option-panel")
					.appendTo(dv);

				$.each(item.items, function(i, option) {
					var radioBox = $("<div></div>")
						.addClass("scale-item-option-box")
						.appendTo(optionPanel)
						.click(function (){
							$(this).children(".scale-item-option").click();
						});

					var radio = $("<input type='radio' />")
					.attr("name", item.id)
					.addClass("scale-item-option")
					.val(option.id)
					.attr("data-scale-next", option.next)
					.data("item-score", option.score)
					.appendTo(radioBox);

					radio.click(function(e){

						var r = $(this);
						var nextId = r.data("scale-next");
						if (nextId == -1) {
							nextId = dv.data("item-id") + 1;
						}

						if (nextId > totalItemCount) {
							_.scalePanelRun.fadeOut(300, function() {
								_.showResult(id, totalItemCount);
							});
						} else {
							dv.fadeOut(300, function(){
								 _.scalePanelRun.find(".scale-item")
								 .filter("[data-item-id=" + nextId + "]")
								 .show(300);
							});
						}

						e.stopPropagation();
					});

					$("<span></span>")
						.addClass("scale-item-option-text")
						.text(option.content)
						.appendTo(radioBox);
				});
			});

			_.hideProgress();
			 _.scalePanelRun.find(".scale-item").filter("[data-item-id=1]")
			 .show(300);

		}, "json");

	};

	this.showResult = function(id, totalItemCount) {

		var dvItems = $(".scale-item");

		var data = [];
		for(var i = 1; i <= totalItemCount; i++) {
			
			var val = -1;
			var score = 0;

			var option = dvItems.filter("[data-item-id=" + i + "]")
				.find(".scale-item-option:checked");

			if (option.length == 1) {
				val = option.val();
				score = option.data("item-score");
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
			items: extraInfo
		};

		var historyData = {
			data: selectedData,
			info: info
		};

		_.showProgress("正在计算结果，请稍等...")

		$.ajax({
			type: "post",
			url: _.getResult + id,
			async: true,
			data: JSON.stringify(historyData),
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			success: function(data) {
				_.hideProgress();
			
				_.scalePanelResultInfo.empty();
				var items = data.items;
				$.each(items, function(i, item) {
					var factorContainer = $("<div></div")
						.addClass("scale-result-factor")
						.appendTo(_.scalePanelResultInfo);

					$("<p></p>")
						.addClass("scale-result-factor-name")
						.text(item.name)
						.appendTo(factorContainer);

					$("<p></p>")
						.addClass("scale-result-factor-description")
						.text(item.description)
						.appendTo(factorContainer);
				});

				_.scalePanelResult.show(300);
			}
		});
	};

	this.showProgress = function(text) {

		if (typeof showProgress != "undefined" 
		&& showProgress != null) {
			showProgress(text);
		}
	};

	this.hideProgress = function() {
		if (typeof hideProgress != "undefined"
			&& hideProgress != null) {
			hideProgress();
		}
	}

	function init(scale) {
		scale.mask = $(".scale-mask");
		scale.panel = $(".scale-panel");

		scale.scaleLstPanel = $(".scale-panel-lst");
		scale.scaleLstContainer = $(".scale-lst-container");
		scale.scaleLstPanelClose = $(".scale-panel-lst-close");

		scale.scalePanelScale = $(".scale-panel-scale");
		scale.scalePanelScaleTitle = $(".scale-panel-scale > .scale-panel-title");
		scale.scalePanelScaleDescription = $(".scale-panel-scale-description");
		scale.scalePanelScaleReselect = $(".scale-btn-reselect");
		scale.scalePanelScaleLoad = $(".scale-btn-load");

		scale.scalePanelPersonal = $(".scale-panel-personal");
		scale.scalePanelPersonalExtra = $(".scale-personal-extra");
		scale.scalePanelScaleGo = $(".scale-btn-go");

		scale.scalePanelRun = $(".scale-panel-run");


		scale.scalePanelResult = $(".scale-panel-result");
		scale.scalePanelResultInfo = $(".scale-panel-result-info");
		scale.scalePanelResultClose = $(".scale-btn-close");

		scale.scalePanelScaleReselect.click(function(){
			scale.scalePanelScale.hide(500, function() {
				scale.scaleLstPanel.show(500);
			})
		});

		scale.scalePanelScaleLoad.click(function(){
			scale.scalePanelPersonalExtra.empty();
			scale.scalePanelScale.slideUp(500, function() {
				var id = scale.scalePanelScale.data("scale-id");
				scale.loadPersonalInfo(id);
			})
		});

		scale.scalePanelScaleGo.click(function() {
			if(isEnable(scale.scalePanelScaleGo)) {
				scale.scalePanelRun.empty();
				scale.scalePanelPersonal.slideUp(500, function(){
					scale.scalePanelRun.slideDown(500, function() {
						var id = scale.scalePanelScale.data("scale-id");
						scale.runScale(id);
					})
				})
			}
		});

		scale.scaleLstPanelClose.click(function(){
			scale.hideProgress();

			scale.panel.slideUp(500, function(){
				scale.mask.hide(500);
			})
		});

		scale.scalePanelResultClose.click(function(){
			scale.panel.slideUp(500, function(){
				scale.scalePanelResult.hide();
				scale.mask.hide(500);
			});
		});
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

};