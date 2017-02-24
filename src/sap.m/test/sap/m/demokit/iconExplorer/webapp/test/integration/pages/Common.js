sap.ui.define([
		"sap/ui/test/Opa5"
	], function(Opa5) {
		"use strict";

		function getFrameUrl (sHash, sUrlParameters) {
			var sUrl = jQuery.sap.getResourcePath("sap/ui/demo/iconexplorer/app", ".html");
			sUrlParameters = sUrlParameters ? "?" + sUrlParameters : "";

			if (sHash) {
				sHash = "#" + sHash;
			} else {
				sHash = "";
			}

			return sUrl + sUrlParameters + sHash;
		}

		return Opa5.extend("sap.ui.demo.iconexplorer.test.integration.pages.Common", {

			iStartMyApp: function (oOptions) {
				oOptions = oOptions || {};

				this.iStartMyAppInAFrame(getFrameUrl(oOptions.hash));
			},

			iStartMyAppOnTheDetailsTab: function (oOptions) {
				oOptions = oOptions || {};
				oOptions.hash = "/?tab=details";
				this.iStartMyApp(oOptions);
			},

			iStartMyAppOnTheGridTab: function (oOptions) {
				oOptions = oOptions || {};
				oOptions.hash = "/?tab=grid";
				this.iStartMyApp(oOptions);
			},

			iStartMyAppOnTheVisualTab: function (oOptions) {
				oOptions = oOptions || {};
				oOptions.hash = "/?tab=visual";
				this.iStartMyApp(oOptions);
			},

			iStartMyAppOnTheFavoriteTab: function (oOptions) {
				oOptions = oOptions || {};
				oOptions.hash = "/?tab=favorite";
				this.iStartMyApp(oOptions);
			},

			iLookAtTheScreen: function () {
				return this;
			}

		});

	}
);