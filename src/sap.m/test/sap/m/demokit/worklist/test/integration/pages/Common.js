sap.ui.define([
		"sap/ui/test/Opa5"
	],
	function(Opa5) {
	"use strict";

	function getFrameUrl (sHash, sUrlParameters) {
		sHash = sHash || "";
		var sUrl = jQuery.sap.getResourcePath("sap/ui/demo/app/test", ".html");

		if (sUrlParameters) {
			sUrlParameters = "?" + sUrlParameters;
		}

		return sUrl + sUrlParameters + sHash;
	}

	return Opa5.extend("sap.ui.demo.worklist.test.integration.pages.Common", {

		iStartMyApp : function (oOptions) {
			var sUrlParameters = "";
			oOptions = oOptions || {};

			if (oOptions.delay) {
				sUrlParameters = "serverDelay=" + oOptions.delay;
			}

			this.iStartMyAppInAFrame(getFrameUrl(oOptions.hash, sUrlParameters));
		},

		iLookAtTheScreen : function () {
			return this;
		}

	});
});
