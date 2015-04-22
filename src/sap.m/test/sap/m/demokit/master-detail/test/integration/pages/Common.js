sap.ui.define([
		"sap/ui/test/Opa5"
	],
	function(Opa5) {
		"use strict";

		function getFrameUrl (sHash, sUrlParameters) {
			sHash = sHash || "";
			var sUrl = jQuery.sap.getResourcePath("sap/ui/demo/app/test", ".html");

			sUrlParameters = "?" + (sUrlParameters ? sUrlParameters + "&" : "");

			return sUrl + sUrlParameters + sHash;
		}

		return Opa5.extend("sap.ui.demo.masterdetail.test.integration.pages.Common", {

			iStartTheApp : function (sHash) {
				this.iStartMyAppInAFrame(getFrameUrl(sHash));
			},

			iStartTheAppWithDelay : function (sHash, iDelay) {
				this.iStartMyAppInAFrame(getFrameUrl(sHash, "serverDelay=" + iDelay));
			},

			iLookAtTheScreen : function () {
				return this;
			},
			iStartMyAppOnADesktopToTestErrorHandler : function (sParam) {
				this.iStartMyAppInAFrame(getFrameUrl("", sParam));
			}

		});
	});

