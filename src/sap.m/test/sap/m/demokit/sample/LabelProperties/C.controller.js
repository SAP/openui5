sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("sap.m.sample.LabelProperties.C", {

		onDisplayOnlyChange: function (oEvent) {
			var bState = oEvent.getParameter("state");

			this.byId("label").setDisplayOnly(bState);
			this.byId("labelInForm").setDisplayOnly(bState);
		},

		onWrappingChange: function (oEvent) {
			var bState = oEvent.getParameter("state");

			this.byId("label").setWrapping(bState);
			this.byId("labelInForm").setWrapping(bState);
		},

		onHyphenationChange: function(oEvent) {
			var sWrappingType = oEvent.getParameter("state") ? "Hyphenated" : "Normal";

			this.byId("label").setWrappingType(sWrappingType);
			this.byId("labelInForm").setWrappingType(sWrappingType);
		},

		onWidthChange: function (oEvent) {
			var sValue = oEvent.getParameter("value") + "%";

			this.byId("containerForm").setWidth(sValue);
			this.byId("containerLayout").setWidth(sValue);
		}

	});
});