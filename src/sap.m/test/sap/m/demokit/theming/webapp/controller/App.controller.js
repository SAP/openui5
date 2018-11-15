sap.ui.define([
	"sap/ui/demo/theming/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/base/Log"
], function (BaseController, JSONModel, Log) {
	"use strict";

	return BaseController.extend("sap.ui.demo.theming.controller.App", {

		/**
		 * Called when the app is started.
		 */
		onInit : function () {
			// reduce the log level to speed up the app performance
			Log.setLevel(Log.Level.WARNING);

			// apply content density mode to root view
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
		}
	});

});