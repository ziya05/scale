
function Scale(_args) {

	var args = {
		apiAddress: null,
		showProgress: function(text){},
		hideProgress: function(){},
		endCallback: function(text, noShowAlert){},
		alertCallback: function(text, callback){
		},
	}

	$.extend(args, _args);

	var module = {
		mask : null,
		panel : null,

		scaleLstPanel : null,
		scaleLstContainer: null,
		scaleLstPanelClose: null,

		scalePanelPersonal: null,
		scalePanelPersonalExtra: null,
		scalePanelPersonalBack: null,
		scalePanelPersonalGo: null,

		scalePanelGuide: null,
		scalePanelGuideTitle: null,
		scalePanelGuideDescription: null,
		scalePanelGuideBack: null,
		scalePanelGuideGo: null,

		scalePanelRun: null,
	}

	var api = {
		address: args.apiAddress,
		getScaleLstUrl: args.apiAddress + "/ScaleService/scales",
		getPersonalInfoUrl: args.apiAddress + "/ScaleService/personalInfo/",
		getScaleUrl: args.apiAddress + "/ScaleService/scale/",
		postResultUrl: args.apiAddress + "/ScaleService/scale/result/",
	}

	var _ = this;

	// 当前量表id
	var scaleId;

	// 量表数据
	var scaleData;

	// 当前量表题目数量
	var totalItemCount = 0;

	// 全局跳转对象
	var globalJumpItems = null;

	// 存放每道题所得分数， 支持全局跳转， 只是前端判断， 并不发给后台
	// 其长度等于题目个数， 为了防止跳转因素的影响，
	// 每次都判断开始题目 及 当前题目和结束题目的最小项 之间的所有题目分数，
	// 为了性能考虑， 使用数组作为数据结构， 使用(题号-1)作为索引，因此要求
	// 题号从1开始， 并且为连续的正整数 
	var scoreArrForJump = null; 

	// 保存用户选择情况，用于返回给后端
	var userSelected = null;

	init();

	this.showScaleList = function(callback) {

		preparePage();
		module.mask.show(500, function(){
			 module.panel.slideDown(500, function(){

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
			var loaded = module.scaleLstContainer.data("loaded");
			if (loaded != null && loaded == "true") {
				module.scaleLstPanel.slideDown(300);
				return;
			}
		}

		args.showProgress("正在加载量表列表， 请稍等...");

		$.get(api.getScaleLstUrl, function(data, status){
			    args.hideProgress();
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
				.appendTo(module.scaleLstContainer)
				.click(function(e){
					hideLstPage(function() {
						paintDescription(d.id, d.name, d.description);

						module.scalePanelPersonalExtra.empty();
						loadPersonalInfo(d.id, function(data) {
							paintPersonal(data);
							showPersonalPage();
						});
					});

				});

			$("<p></p>")
				.addClass("scale-lst-item-name")
				.text(d.name)
				.attr("title", "题目数量：" + d.questionCount)
				.appendTo(div);

			module.scaleLstContainer.data("loaded", "true");
		});
	};

	function loadPersonalInfo(id, callback) {
		args.showProgress("正在加载所需用户信息，请稍等...");
		var url = api.getPersonalInfoUrl + id;
		$.get(url, function(data, status) {

			args.hideProgress();
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
					.appendTo(module.scalePanelPersonalExtra);

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
					&& module.scalePanelPersonalGo.hasClass("disable")) {
					module.scalePanelPersonalGo.removeClass("disable");

				} else if(hasEmpty(items)
					&& !module.scalePanelPersonalGo.hasClass("disable")) {
					module.scalePanelPersonalGo.addClass("disable");
				}
			};
	};

	function paintDescription(id, name, description) {
		module.scalePanelGuideTitle.text(name);
		module.scalePanelGuideDescription.text(description);
		module.scalePanelGuide.data("scale-id", id)
	};

	function loadScale(id, callback) {
		args.showProgress("正在加载指定量表，请稍等...");
		var url = api.getScaleUrl + id;
		$.get(url, function(data, status){
			args.hideProgress();
			 if (callback != null) {
			 	callback(data);
			 }

		}, "json")
		.fail(function(xhr, status, error){
			loadError("数据加载失败！", xhr, status, error);
		});

	};

	function initScale(data) {
		scaleId = data.id;
		scaleData = data;
		totalItemCount = data.items.length;

		if (scoreArrForJump != null) {
			scoreArrForJump = null;
		}

		globalJumpItems = data.jumpItems;
		if (typeof globalJumpItems === 'undefined'
			|| globalJumpItems == null
			|| globalJumpItems.length == 0) {
			globalJumpItems = null;
		}

		if (globalJumpItems != null) {
			
			scoreArrForJump = new Array(totalItemCount);
		}

		if (userSelected != null) {
			userSelected = null;
		}

		userSelected = new Array(totalItemCount);
		
	};

	// 由于getSelectedOption中是使用radio的checked状态获取选中的
	// 组件， 而本方法对于单选题是在radio的click事件中触发， 此时
	// 该radio还不是checked状态， 因此对于这种情况， 需传入选项及分数
	function globalJumpHandle(questionId, callback, optionId, score) {
		
		if (globalJumpItems != null) {
			if (typeof score === 'undefined') {
				var data = getSelectedOption(questionId);
				score = data.score;
			} 
			if (scoreArrForJump.length >= questionId) {
				scoreArrForJump[questionId - 1] = score;

				var isMatch = false;
				var nextId; 

				$.each(globalJumpItems, function(i, item) {

					var count = 0;
					var end = Math.min(item.end, questionId);
					for (var j = item.begin; j <= end; j++) {

						if (scoreArrForJump[j-1] == item.score) {
							count++;

							if(count >= item.questionCount) {
								isMatch = true;
								nextId = item.jumpNo;
								break;
							}

						} else if (typeof scoreArrForJump[j-1] !== 'undefined'  //排除跳转过去的
							&& item.continuous == 1) {  // 要求连续
							count = 0;
						}
					}

					if (isMatch) {
						return false;
					} 
				});

				// 匹配全局跳转
				if (isMatch) {
					jump(questionId, nextId, optionId);
				} else {
					callback();
				}

			} else {
				console.log("全局跳转出错！")
			}
		} else {
			callback();
		}
		
	};

	function paintQuestion(id) {
		module.scalePanelRun.children().remove();

		var item = scaleData.items[id - 1];

		// 1, 单选； 2， 多选； 3， 保留； 4， 描述信息
		var questionType = item.questionType;

		var dv = $("<div></div>")
			.addClass("scale-item")
			.attr("data-item-id", item.id)
			.attr("data-item-type", questionType)
			.appendTo(module.scalePanelRun);

		if (questionType == 1              // 单选
			|| questionType == 2           // 多选
			|| questionType == 11) {       // 单选 + 输入框


			$("<p></p>")
			.addClass("scale-item-title")
			.text("第" + item.id + "题 " + item.title)
			.appendTo(dv);

			var optionPanel = $("<div></div")
				.addClass("scale-item-option-panel")
				.appendTo(dv);

			if (questionType == 11) {
				var input = $("<textarea></textarea>")
				.addClass("scale-item-input")
				.appendTo(optionPanel);
			}
			
			$.each(item.items, function(i, option) {
				var optionBox = $("<div></div>")
					.addClass("scale-item-option-box")
					.appendTo(optionPanel)
					.click(function (){
						$(this).children(".scale-item-option").click();
					});

				if (questionType == 1
					|| questionType == 11) {              // 单选
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

						globalJumpHandle(item.id, function(){
							jump(item.id, nextId, option.optionId);
						}, 
						option.optionId,
						option.score);	

						e.stopPropagation();
					});
				} else if (questionType == 2) {       // 多选
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
		} else if (questionType == 4) {         // 描述
			$("<pre></pre>")
				.addClass("scale-panel-guide-description")
				.text(item.title)
				.appendTo(dv);
		}				

		if (questionType == 2 || questionType == 4) {   // 多选 + 描述
			var tools = $("<div></div>")
				.addClass("scale-item-tools")
				.appendTo(dv);

			$("<input type='button' value='下一题' />")
				.addClass("scale-item-tools-btn")
				.appendTo(tools)
				.click(function(){
					var nextId = dv.data("item-id") + 1;

					globalJumpHandle(item.id, function(){
						jump(item.id, nextId);
					});

				});
		}

		module.scalePanelRun.fadeIn(300);
	};

	// 对于单选题， 由于执行jump方法时， 
	// click时间可能没有完全完成， 因此通过getSelectedOption方法可能
	// 获取不到数据， 需要传入optionId
	function jump(currentId, nextId, optionId) {
		var option = getSelectedOption(currentId);
		if (optionId) {
			option.optionId = optionId;
		}

		userSelected[currentId - 1] = option;
		console.log(userSelected[currentId - 1])

		if (nextId == -10 
			|| nextId > totalItemCount) {

			hideScalePage(function() {
				postResult(scaleId);
			})
		} else {
			module.scalePanelRun.fadeOut(300, function(){
				 paintQuestion(nextId);
			});
		}
	};

	function postResult(id) {

		for (var i = 0; i < totalItemCount; i++) {
			var selected = userSelected[i];
			if (!selected
				|| selected == null) {
				userSelected[i] = {
					questionId: i + 1,
					optionId: -1 // 跳转
				}
			} else {
				delete selected.score; // 不回传分数， 无特别用意
			}
 		}

		var selectedData = {
			items: userSelected
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

		args.showProgress("正在保存数据，请稍等...")

		$.ajax({
			type: "post",
			url: api.postResultUrl + id,
			data: JSON.stringify(historyData),
			contentType: "application/json; charset=utf-8",
			dataType: "text",
			success: function(data) {
				args.hideProgress();
			
				if (data == "") {
					args.endCallback("数据保存成功！");
				} else {
					args.endCallback("数据保存失败！[" + data + "]")
				}
			},
			error: function(xhr, status, error) {
				args.hideProgress();
				loadError("数据保存失败！ ", xhr, status, error);
			},
		});

	};

	function getSelectedOption(questionId) {

		var data = {
			questionId: questionId,
			optionId: -1,
			score: 0
		}

		var dvItem = $(".scale-item[data-item-id=" + questionId + "]");
		var questionType = dvItem.data("item-type");
		var option = dvItem 
				.find(".scale-item-option:checked");

		if (questionType == 1
			|| questionType == 11) {
			if (option.length == 1) {
				var optionId = option.val();
				var score = option.data("item-score");

				data.optionId = optionId;
				data.score = score;

			}

			if (questionType == 11) {
				var input = dvItem.find(".scale-item-input");
				console.log("input: " + input.length);
				var inputText = input.val();
				data.text = inputText;

			}
		} else if (questionType == 2) {

			if (option.length >= 1) {
				optionId = "";
				score = 0;

				$.each(option, function(i, c) {
					optionId += $(c).val();
					score += parseInt($(c).data("item-score"));
				});

				data.optionId = optionId;
				data.score = score;
			}
		}

		return data;
	};

	this.close = function(callback) {
		module.panel.slideUp(500, function(){
			module.mask.hide(500, function() {
				if (typeof callback != "undefined" 
					&& callback != null) {
					callback();
				}
			});
		});
	};

	function init() {
		module.mask = $(".scale-mask");
		module.panel = $(".scale-panel");

		module.scaleLstPanel = $(".scale-panel-lst");
		module.scaleLstContainer = $(".scale-lst-container");
		module.scaleLstPanelClose = $(".scale-panel-lst-close");

		module.scalePanelPersonal = $(".scale-panel-personal");
		module.scalePanelPersonalExtra = $(".scale-personal-extra");
		module.scalePanelPersonalBack = $(".scale-btn-personal-back");
		module.scalePanelPersonalGo = $(".scale-btn-personal-go");

		module.scalePanelGuide = $(".scale-panel-guide");
		module.scalePanelGuideTitle = $(".scale-panel-guide > .scale-panel-title");
		module.scalePanelGuideDescription = $(".scale-panel-guide-description");
		module.scalePanelGuideBack = $(".scale-btn-guide-back");
		module.scalePanelGuideGo = $(".scale-btn-guide-go");

		module.scalePanelRun = $(".scale-panel-run");

		module.scalePanelPersonalBack.click(function(){
			hidePersonalPage(showLstPage);
		});

		module.scalePanelPersonalGo.click(function() {
			if(isEnable(module.scalePanelPersonalGo)) {
				hidePersonalPage(showDescPage);
			}
		});

		module.scalePanelGuideBack.click(function(){
			hideDescPage(showPersonalPage);
		});

		module.scalePanelGuideGo.click(function(){
			hideDescPage(function(){
				module.scalePanelRun.empty();
				var id = module.scalePanelGuide.data("scale-id");
				loadScale(id, function(data) {
					initScale(data);
					paintQuestion(1);
					//paintScale(data);
					showScalePage();
				});
			});			
		});

		module.scaleLstPanelClose.click(function(){
			args.endCallback(null, true);
		});

		$(".scale-for-search-text").keyup(function(){
			var text = $(this).val();
			var items = module.scaleLstContainer.find(".scale-lst-item");
			items.hide();

			items.find(".scale-lst-item-name:contains('" + text + "')")
				.parent()
				.show();
		});

	};

	function showLstPage(callback) {
		module.scaleLstPanel.show(300, function() {
			if (callback != null) {
				callback();
			}
		});
	};

	function hideLstPage(callback) {
		module.scaleLstPanel.hide(300, function() {
			if (callback != null) {
				callback();
			}
		});
	};

	function showPersonalPage(callback) {
		module.scalePanelPersonal.slideDown(500, function() {
			if (callback != null) {
				callback();
			}
		});
	};

	function hidePersonalPage(callback) {
		module.scalePanelPersonal.slideUp(500, function() {
			if (callback != null) {
				callback();
			}
		});
	};

	function showDescPage(callback) {
		module.scalePanelGuide.slideDown(500, function() {
			if (callback != null) {
				callback();
			}
		});
	};

	function hideDescPage(callback) {
		module.scalePanelGuide.slideUp(500, function() {
			if (callback != null) {
				callback();
			}
		});
	};

	function showScalePage(callback) {
		module.scalePanelRun.show();
		module.scalePanelRun.find(".scale-item").filter("[data-item-id=1]")
		.show(300, function() {
				if (callback != null) {
					callback();
				}
			});
	};

	function hideScalePage(callback) {
		module.scalePanelRun.hide(function() {
			if (callback != null) {
				callback();
			}
		});
	};

	function preparePage() {
		$(".scale-personal-item-input").val("");
		module.scalePanelPersonalGo.addClass("disable");
		args.hideProgress();
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

		args.endCallback(msg);
	};

};