sap.ui.define(['sap/ui/core/mvc/Controller'],
	function(Controller) {
	"use strict";

	var CController = Controller.extend("sap.m.sample.TitleWrapping.C", {

		onInit: function () {
			this.getView();
		},
		onSliderMoved: function (event) {
			var value = event.getParameter("value");
			this.byId("containerLayout").setWidth(value + "%");
		},
		onWrappingChange: function() {

			var title = sap.ui.getCore().byId("__xmlview0--WrappingTitle");
			title.setWrapping(!title.getWrapping());
		}
	});

	return CController;

});

