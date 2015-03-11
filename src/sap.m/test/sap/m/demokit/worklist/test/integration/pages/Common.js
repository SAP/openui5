sap.ui.define([
		"sap/ui/test/Opa5"
	],
	function(Opa5) {
	"use strict";

	return Opa5.extend("sap.ui.demo.worklist.test.integration.pages.Common", {

		constructor: function (oConfig) {
			Opa5.apply(this, arguments);

			this._oConfig = oConfig;
		},

		_getFrameUrl: function (sHash,  sUrlParameters) {
			sHash = sHash || "";
			var sUrl = jQuery.sap.getResourcePath("sap/ui/demo/app/test", ".html");

			if (sUrlParameters) {
				sUrlParameters = "?" + sUrlParameters;
			}

			// if the tests are run inside the FLP sandbox we need to add the
			// FLP has delimiter "&" in front of our application hash
			if (this._oConfig.isFLP) {
				sHash = "&" + sHash;
			}

			return sUrl + sUrlParameters + "#" + sHash;
		},

		iStartMyApp : function (oOptions) {
			var sUrlParameters = "";
			oOptions = oOptions || {};

			if (oOptions.delay) {
				sUrlParameters = "serverDelay=" + oOptions.delay;
			}

			this.iStartMyAppInAFrame(this._getFrameUrl(oOptions.hash, sUrlParameters));
		},

		iLookAtTheScreen : function () {
			return this;
		},

		iStartMyAppOnADesktopToTestErrorHandler : function (sUrlParameters) {
			this.iStartMyAppInAFrame(this._getFrameUrl("", sUrlParameters));
		}

	});
});
