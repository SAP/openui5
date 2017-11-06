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
		onWrappingPressed: function(oEvent) {
			var text = this.byId("textSample");
			text.setWrapping(!text.getWrapping());
			this.byId("btn1").setText(text.getWrapping() ? "Turn Off Wrapping" : "Turn On Wrapping");
		},
		onWhiteSpacePressed: function(oEvent) {
			var text = this.byId("textSample");
			text.setRenderWhitespace(!text.getRenderWhitespace());
			this.byId("btn2").setText(text.getRenderWhitespace() ? "Turn Off RenderWhitespace" : "Turn On RenderWhitespace");
		}
	});

	return CController;

});
