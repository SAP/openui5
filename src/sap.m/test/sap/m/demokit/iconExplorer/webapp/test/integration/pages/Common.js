sap.ui.define([
	"jquery.sap.storage",
	"sap/ui/test/Opa5",
	"sap/ui/core/IconPool",
	"sap/ui/demo/iconexplorer/localService/mockserver"
], function($, Opa5, IconPool, mockserver) {
	"use strict";

	// store a local copy to the original function
	var _fnIconPoolGetIconNames = IconPool.getIconNames;

	return Opa5.extend("sap.ui.demo.iconexplorer.test.integration.pages.Common", {

		iStartMyApp: function (oOptions) {
			// reset local storage key to have stable testing environment
			var oStorage = $.sap.storage("local");
			oStorage.put("ICON_EXPLORER_FAVORITES", undefined);

			oOptions = oOptions || {};

			// Start the app with a minimal delay to make tests run fast but still async to discover basic timing issues
			var iDelay = oOptions.delay || 10;

			Opa5.extendConfig({
				appParams: {
					"serverDelay": iDelay
				}
			});

			// instruct mockserver directly to set a specific response delay
			mockserver.getMockServer().oServer.autoRespondAfter = iDelay;

			// override IconPool to only use 23 icons for faster tests
			IconPool.getIconNames = function (sFontName) {
				var aAllIcons = _fnIconPoolGetIconNames(sFontName),
					aTestIcons = [];

				if (!sFontName || sFontName === "SAP-icons") {
					// some special icons that are needed for the icon explorer
					aTestIcons.push("error");
					aTestIcons.push("activate");
					aTestIcons.push("copy");
				}

				// and the first 20 icons in the icon font
				aTestIcons = aTestIcons.concat(aAllIcons.slice(0,20));

				return aTestIcons;
			};

			this.iStartMyUIComponent({
				componentConfig: {
					name: "sap.ui.demo.iconexplorer",
					settings : {
						id : "iconexplorer"
					}
				},
				hash: oOptions.hash
			});
		},

		iStartMyAppOnTheDetailsTab: function (oOptions) {
			oOptions = oOptions || {};
			// legacy URL
			oOptions.hash = "?tab=details";
			this.iStartMyApp(oOptions);
		},

		iStartMyAppOnTheGridTab: function (oOptions) {
			oOptions = oOptions || {};
			oOptions.hash = "overview/SAP-icons?tab=grid";
			this.iStartMyApp(oOptions);
		},

		iStartMyAppOnTheVisualTab: function (oOptions) {
			oOptions = oOptions || {};
			oOptions.hash = "overview/SAP-icons?tab=visual";
			this.iStartMyApp(oOptions);
		},

		iStartMyAppOnTheFavoriteTab: function (oOptions) {
			oOptions = oOptions || {};
			oOptions.hash = "overview/SAP-icons?tab=favorite";
			this.iStartMyApp(oOptions);
		},

		iLookAtTheScreen: function () {
			return this;
		}

	});

});