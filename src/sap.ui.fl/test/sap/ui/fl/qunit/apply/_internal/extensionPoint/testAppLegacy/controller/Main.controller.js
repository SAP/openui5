sap.ui.define([
	"sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel"
], function(Controller, JSONModel) {
	"use strict";

	var MainController = Controller.extend("sap.ui.fl.qunit.extensionPoint.testAppLegacy.controller.Main", {
		onInit() {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/fl/qunit/extensionPoint/testAppLegacy/mock/products.json"));
			this.getView().setModel(oModel);
		}
	});
	return MainController;
});