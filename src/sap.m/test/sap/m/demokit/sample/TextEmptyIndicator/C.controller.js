sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("sap.m.sample.TextEmptyIndicator.C", {

		onCssClassChange: function () {
			this.byId("containerAuto").toggleStyleClass("sapMShowEmpty-CTX");
		}

	});
});
