sap.ui.define(["sap/m/Button"], function (Button) {
	"use strict";

	sap.ui.jsview("error.test.JSView_legacyAPIs", {
		createContent: function (oController) {
			return new Button({
				text: "click me"
			});
		}
	});
});