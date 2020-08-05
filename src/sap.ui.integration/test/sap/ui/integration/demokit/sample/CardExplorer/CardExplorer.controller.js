sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("sap.ui.integration.sample.CardExplorer.CardExplorer", {

		onImagePress: function () {
			window.open("test-resources/sap/ui/integration/demokit/cardExplorer/index.html", "_blank");
		}

	});
});