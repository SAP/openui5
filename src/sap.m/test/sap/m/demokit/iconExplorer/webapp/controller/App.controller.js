sap.ui.define([
		"sap/ui/demo/iconexplorer/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/base/Log"
	], function (BaseController, JSONModel, Log) {
		"use strict";

		return BaseController.extend("sap.ui.demo.iconexplorer.controller.App", {

			/**
			 * Called when the app is started.
			 */
			onInit : function () {
				var oViewModel,
					fnSetAppNotBusy,
					iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

				oViewModel = new JSONModel({
					busy : true,
					delay : 0
				});
				this.setModel(oViewModel, "view");

				// reduce the log level to speed up the app performance
				Log.setLevel(Log.Level.WARNING);

				fnSetAppNotBusy = function() {
					oViewModel.setProperty("/busy", false);
					oViewModel.setProperty("/delay", iOriginalBusyDelay);
				};

				// ensure that the app is busy until the icon meta data is loaded
				this.getOwnerComponent().iconsLoaded().then(fnSetAppNotBusy);

				// apply content density mode to root view
				this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			}
		});

	}
);