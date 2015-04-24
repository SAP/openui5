sap.ui.define([
		'sap/ui/test/Opa5'
	],
	function(Opa5) {
	"use strict";

		function getFrameUrl (sHash, oConfig, sUrlParameters) {
			sHash = sHash || "";
			var sUrl = jQuery.sap.getResourcePath("sap/ui/demo/app/test", ".html");

			if (sUrlParameters) {
				sUrlParameters = "?" + sUrlParameters;
			}

			// if the tests are run inside the FLP sandbox we need to add the
			// FLP has delimiter "&" in front of our application hash
			if (oConfig.isFLP) {
				sHash = "&" + sHash;
			}

			return sUrl + sUrlParameters + "#" + sHash;
		}

		return Opa5.extend("sap.ui.demo.worklist.test.integration.pages.Common", {

		constructor: function (oConfig) {
			Opa5.apply(this, arguments);

			this._oConfig = oConfig;
		},

		iStartMyApp : function (oOptions) {
			var sUrlParameters = "";
			oOptions = oOptions || {};

			if (oOptions.delay) {
				sUrlParameters = "serverDelay=" + oOptions.delay;
			}

			this.iStartMyAppInAFrame(getFrameUrl(oOptions.hash, this._oConfig, sUrlParameters));
		},

		iLookAtTheScreen : function () {
			return this;
		},

		iStartMyAppOnADesktopToTestErrorHandler : function (sParam) {
			this.iStartMyAppInAFrame(getFrameUrl("", this._oConfig, sParam));
		}

	});
});
