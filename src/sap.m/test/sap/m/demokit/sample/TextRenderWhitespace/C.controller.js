sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.m.sample.TextRenderWhitespace.C", {

		onInit: function () {
			var oModel = new JSONModel({ data: {} });
			this.getView().setModel(oModel);
		},

		onSliderMoved: function (oEvent) {
			var fValue = oEvent.getParameter("value");
			this.byId("containerLayout").setWidth(fValue + "%");
		},

		onWrappingChange: function () {
			var oText = this.byId("text");
			oText.setWrapping(!oText.getWrapping());
		},

		onRenderWhitespaceChange: function () {
			var oText = this.byId("text");
			oText.setRenderWhitespace(!oText.getRenderWhitespace());
		}

	});
});