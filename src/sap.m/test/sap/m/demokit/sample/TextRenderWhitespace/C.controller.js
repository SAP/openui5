sap.ui.define(['sap/ui/core/mvc/Controller','sap/ui/model/json/JSONModel'],
	function(Controller, JSONModel) {
	"use strict";

	var CController = Controller.extend("sap.m.sample.TextRenderWhitespace.C", {

		onInit: function () {
			var oModel = new JSONModel({data: {}});
			this.getView().setModel(oModel);
		},
		onSliderMoved: function (event) {
			var value = event.getParameter("value");
			this.byId("containerLayout").setWidth(value + "%");
		},
		onWrappingChange: function(oEvent) {
			var text = this.byId("text");
			text.setWrapping(!text.getWrapping());
		},
		onRenderWhitespaceChange: function(oEvent) {
			var text = this.byId("text");
			text.setRenderWhitespace(!text.getRenderWhitespace());
		}
	});

	return CController;

});
