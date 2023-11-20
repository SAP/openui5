sap.ui.require(["sap/ui/core/Element", 'sap/ui/core/mvc/Controller', 'sap/ui/core/hyphenation/Hyphenation'],
	function(Element, Controller, HyphenationDelegate) {
	"use strict";

	var CController = Controller.extend("sap.ui.core.sample.HyphenationAPI.C", {

		onInit: function () {
			var hyph = HyphenationDelegate.getInstance();

			var text = "A hyphenation algorithm is a set of rules that decides at which points a word can be broken over two lines with a hyphen.";
			var textDE = "Die Worttrennung, auch Silbentrennung genannt, bezeichnet in der Orthographie die Art und Weise, wie die Wörter insbesondere am Zeilenende getrennt werden können.";
			var textRU = "Пример текста, который будет служить для проверки перевода";

			var textId = this.getView().byId("hyphenatedText").getId();
			var textIdDE = this.getView().byId("hyphenatedTextDE").getId();
			var textIdRU = this.getView().byId("hyphenatedTextRU").getId();

			var changeText  = function (id, text, lng) {
				var hyphenatedText = hyph.hyphenate(text, lng);
				var content = "<div style='font-size: 14px;'>" + hyphenatedText + "</div>";
				Element.getElementById(id).setContent(content);
			};

			hyph.initialize().then(function () {
				changeText(textId, text);
			});
			hyph.initialize("de").then(function () {
				changeText(textIdDE, textDE, "de");
			});
			hyph.initialize("ru").then(function () {
				changeText(textIdRU, textRU, "ru");
			});
		},

		onSliderMoved: function (event) {
			var value = event.getParameter("value");
			this.byId("containerLayout").setWidth(value + "%");
			this.byId("containerLayoutDE").setWidth(value + "%");
			this.byId("containerLayoutRU").setWidth(value + "%");
		}
	});

	return CController;

});
