sap.ui.define(['sap/ui/core/mvc/Controller','sap/ui/model/json/JSONModel'],
	function(Controller, JSONModel) {
	"use strict";

	var VController = Controller.extend("sap.m.sample.TitleWrapping.V", {

		onInit: function (oEvent) {
			this.getView();
		},
		onSliderMoved: function (event) {
			var value = event.getParameter("value");
			value = value - 30;
			this.byId("containerLayout").setWidth(value + "%");
		},
		onWrappingChange: function(oEvent) {

			var title = sap.ui.getCore().byId("__xmlview0--WrappingTitle");
			title.setWrapping(!title.getWrapping());
		}
	});

	return VController;

});

