sap.ui.define([
		"sap/ui/demo/iconexplorer/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/base/Log",
		"sap/ui/documentation/sdk/controller/util/ThemePicker",
		"sap/ui/thirdparty/URI"
	], function (BaseController, JSONModel, Log, ThemePicker, URI) {
		"use strict";

		return BaseController.extend("sap.ui.demo.iconexplorer.controller.App", {

			/**
			 * Called when the app is started.
			 */
			onInit : function () {
				var oViewModel,
					fnSetAppNotBusy,
					iOriginalBusyDelay = this.getView().getBusyIndicatorDelay(),
					oComponent = this.getOwnerComponent(),
					oUri = new URI(window.location.href);

				oViewModel = new JSONModel({
					busy : true,
					delay : 0,
					bShowTAConsent: false
				});
				this.setModel(oViewModel, "view");

				if (oUri.hasQuery("sap-ui-xx-tracking") && oUri.query(true)["sap-ui-xx-tracking"] === "aa") {
					oViewModel.setProperty("/bShowTAConsent", true);
				}

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

				var bExternalCookiesManager = oViewModel.getProperty("/bShowTAConsent");

				if (!bExternalCookiesManager) {
					oComponent.getCookiesManagement().then(function(oCookieMgmtComponent) {
						oCookieMgmtComponent.enable(oComponent.getRootControl());
					});
				}

				this._initThemePicker();
			},

			_initThemePicker : function() {
				ThemePicker.init(this);
			}
		});

	}
);