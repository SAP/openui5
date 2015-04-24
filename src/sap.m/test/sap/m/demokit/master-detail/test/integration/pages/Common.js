sap.ui.define([
		"sap/ui/test/Opa5"
	],
	function(Opa5) {
		"use strict";

		return Opa5.extend("sap.ui.demo.masterdetail.test.integration.pages.Common", {

			_getFrameUrl: function (sHash, sUrlParameters) {
				sHash = sHash || "";
				var sUrl = jQuery.sap.getResourcePath("sap/ui/demo/app/test", ".html");

				sUrlParameters = "?" + (sUrlParameters ? sUrlParameters + "&" : "");

				// if the tests are run inside the FLP sandbox we need to add the
				// FLP has delimiter "&" in front of our application hash
				if (sap.ui.demo.masterdetail.test.integration.isFLP) {
					sHash = "&" + sHash;
				}

				return sUrl + sUrlParameters + sHash;
			},

			iStartTheApp : function (oOptions) {
				this.iStartMyAppInAFrame(this._getFrameUrl(oOptions));
			},

			iStartTheAppWithDelay : function (sHash, iDelay) {
				this.iStartMyAppInAFrame(this._getFrameUrl(sHash, "serverDelay=" + iDelay));
			},

			iLookAtTheScreen : function () {
				return this;
			},

			iStartMyAppOnADesktopToTestErrorHandler : function (sParam) {
				this.iStartMyAppInAFrame(this._getFrameUrl("", sParam));
			},

			createAWaitForAnEntitySet : function  (oOptions) {
				return {
					success: function () {
						var bMockServerAvailable = false,
							aEntitySet;

						this.getMockServer().then(function (oMockServer) {
							aEntitySet = oMockServer.getEntitySetData(oOptions.entitySet);
							bMockServerAvailable = true;
						});


						return this.waitFor({
							check: function () {
								return bMockServerAvailable;
							},
							success : function () {
								oOptions.success.call(this, aEntitySet);
							}
						});
					}
				};
			},

			getMockServer : function () {
				return new Promise(function (success) {

					Opa5.getWindow().sap.ui.require(["sap/ui/demo/masterdetail/service/server"], function (server) {
						success(server.getMockServer());
					});

				});
			}

		});
	});

