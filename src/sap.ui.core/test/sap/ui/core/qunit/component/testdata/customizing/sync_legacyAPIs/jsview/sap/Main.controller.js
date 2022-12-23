sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/mvc/Controller"
], function(Log, Controller) {
	"use strict";

	var MainController = Controller.extend("testdata.customizing.sync_legacyAPIs.jsview.sap.Main", {

		onInit : function () {
			Log.info("testdata.customizing.sync_legacyAPIs.jsview.sap.Main - onInit");
		}

	});

	return MainController;

});
