sap.ui.define([
		"sap/ui/test/Opa5"
	],
	function(Opa5) {
		"use strict";

		function getFrameUrl (sHash, bAddPhone, sUrlParameters) {
			sHash = sHash || "";
			var sUrl = jQuery.sap.getResourcePath("sap/ui/demo/app/test", ".html");

			sUrlParameters = "?" + (sUrlParameters ? sUrlParameters + "&" : "");

			if (bAddPhone) {
				sUrlParameters += "sap-ui-xx-fakeOS=ios";
			}

			return sUrl + sUrlParameters + sHash;
		}

		return Opa5.extend("sap.ui.demo.masterdetail.test.integration.pages.Common", {

			iStartTheAppOnADesktopDevice : function (sHash) {
				this.iStartMyAppInAFrame(getFrameUrl(sHash));
			},

			iStartTheAppOnAPhone : function (sHash) {
				this.iStartMyAppInAFrame(getFrameUrl(sHash, true));
			},

			iStartTheAppOnADesktopDeviceWithDelay : function (sHash, iDelay) {
				this.iStartMyAppInAFrame(getFrameUrl(sHash, false, "serverDelay=" + iDelay));
			},

			iStartTheAppOnAPhoneWithDelay : function (sHash, iDelay) {
				this.iStartMyAppInAFrame(getFrameUrl(sHash, true, "serverDelay=" + iDelay));
			},

			iLookAtTheScreen : function () {
				return this;
			},
			iStartMyAppOnADesktopToTestErrorHandler : function (sParam) {
				this.iStartMyAppInAFrame(getFrameUrl("", false, sParam));
			}

		});
	});

