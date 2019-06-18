sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	var CardsLayoutController = Controller.extend("sap.ui.integration.sample.CardExplorer.CardExplorer", {
		onImagePress: function() {
			window.open("test-resources/sap/ui/integration/demokit/cardExplorer/index.html", "_blank");
		}
	});

	return CardsLayoutController;

});
