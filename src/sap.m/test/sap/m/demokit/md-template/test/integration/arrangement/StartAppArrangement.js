sap.ui.define(['sap/ui/test/Opa5'],
		function(Opa5) {
			"use strict";

			return Opa5.extend("sap.ui.demo.mdtemplate.test.integration.arrangement.StartAppArrangement", {
				_getFrameUrl : function (sHash, bAddPhone, sUrlParameters) {
					sHash = sHash || "";
					var sUrl = jQuery.sap.getResourcePath("sap/ui/demo/app/test", ".html");

					sUrlParameters = "?" + (sUrlParameters ? sUrlParameters + "&" : "");

					if (bAddPhone) {
						sUrlParameters += "sap-ui-xx-fakeOS=ios";
					}

					return sUrl + sUrlParameters + sHash;
				},

				iStartTheAppOnADesktopDevice : function (sHash) {
					this.iStartMyAppInAFrame(this._getFrameUrl(sHash));
				},

				iStartTheAppOnAPhone : function (sHash) {
					this.iStartMyAppInAFrame(this._getFrameUrl(sHash, true));
				},
				
				iStartTheAppOnADesktopDeviceWithDelay : function (sHash, iDelay) {
					this.iStartMyAppInAFrame(this._getFrameUrl(sHash, false, "serverDelay=" + iDelay));
				},

				iStartTheAppOnAPhoneWithDelay : function (sHash, iDelay) {
					this.iStartMyAppInAFrame(this._getFrameUrl(sHash, true, "serverDelay=" + iDelay));
				}
			});
		});

