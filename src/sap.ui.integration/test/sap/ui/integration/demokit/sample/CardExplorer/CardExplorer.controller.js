sap.ui.define([
	"sap/m/library",
	"sap/ui/core/mvc/Controller"
], function (mLibrary, Controller) {
	"use strict";

	return Controller.extend("sap.ui.integration.sample.CardExplorer.CardExplorer", {

		onImagePress: function () {
			mLibrary.URLHelper.redirect("test-resources/sap/ui/integration/demokit/cardExplorer/index.html", true);
		}

	});
});