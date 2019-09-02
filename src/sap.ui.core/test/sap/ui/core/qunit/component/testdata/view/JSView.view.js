sap.ui.define(["sap/m/Button"], function (Button) {
	"use strict";
	sap.ui.jsview("error.test.JSView", {
		createContent: function (oController) {
			return new Button({
						text: "click me"
			});
		}
	});
});