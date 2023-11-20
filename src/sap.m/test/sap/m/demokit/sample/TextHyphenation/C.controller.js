sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("sap.m.sample.TextHyphenation.C", {

		onSliderMoved: function (oEvent) {
			var fValue = oEvent.getParameter("value");
			this.byId("containerLayout").setWidth(fValue + "%");
		},

		onHyphenationChange: function (oEvent) {
			var sWrappingType = oEvent.getParameter("state") ? "Hyphenated" : "Normal";
			for (var i = 0; i < 5; i++) {
				this.byId("text" + i).setWrappingType(sWrappingType);
			}
		}

	});
});