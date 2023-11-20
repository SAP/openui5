sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/mvc/Controller"
], function(Log, Controller) {
	"use strict";

	var MainController = Controller.extend("testdata.customizing.customer.Main", {

		onInit : function () {
			Log.info("testdata.customizing.customer.Main - onInit");
		}

	});

	return MainController;

});
