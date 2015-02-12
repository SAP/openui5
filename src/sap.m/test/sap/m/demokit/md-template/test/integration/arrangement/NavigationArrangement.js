sap.ui.define(['sap/ui/test/Opa5'],
	function(Opa5) {
		"use strict";

		return Opa5.extend("sap.ui.demo.mdtemplate.test.integration.arrangement.NavigationArrangement", {
			_getFrameUrl : function (sHash, bAddPhone) {
				sHash = sHash || "";
				var sUrl = jQuery.sap.getResourcePath("sap/ui/demo/app/index", ".html"),
					sUrlParameters = "?responderOn=true";

				if (bAddPhone) {
					sUrlParameters = sUrlParameters + "&sap-ui-xx-fakeOS=ios";
				}

				sUrl = sUrl + sUrlParameters + sHash;

				return sUrl;
			},

			GivenIStartTheAppOnADesktopDevice : function (sHash) {
				this.iStartMyAppInAFrame(this._getFrameUrl(sHash));
			},

			GivenIStartTheAppOnAPhone : function (sHash) {
				this.iStartMyAppInAFrame(this._getFrameUrl(sHash, true));
			}
		});
	});
