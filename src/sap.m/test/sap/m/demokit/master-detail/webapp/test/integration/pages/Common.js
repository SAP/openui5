sap.ui.define([
		"sap/ui/test/Opa5"
	], function(Opa5) {
		"use strict";

		function getFrameUrl (sHash, sUrlParameters) {
			var sUrl = jQuery.sap.getResourcePath("sap/ui/demo/masterdetail/app", ".html");
			sHash = sHash || "";
			sUrlParameters = sUrlParameters ? "?" + sUrlParameters : "";

			if (sHash) {
				sHash = "#" + (sHash.indexOf("/") === 0 ? sHash.substring(1) : sHash);
			} else {
				sHash = "";
			}

			return sUrl + sUrlParameters + sHash;
		}

		return Opa5.extend("sap.ui.demo.masterdetail.test.integration.pages.Common", {

			iStartTheApp : function (oOptions) {
				oOptions = oOptions || {};
				// Start the app with a minimal delay to make tests run fast but still async to discover basic timing issues
				this.iStartMyAppInAFrame(getFrameUrl(oOptions.hash, "serverDelay=50"));
			},

			iStartTheAppWithDelay : function (sHash, iDelay) {
				this.iStartMyAppInAFrame(getFrameUrl(sHash, "serverDelay=" + iDelay));
			},

			iLookAtTheScreen : function () {
				return this;
			},

			iStartMyAppOnADesktopToTestErrorHandler : function (sParam) {
				this.iStartMyAppInAFrame(getFrameUrl("", sParam));
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
					Opa5.getWindow().sap.ui.require(["sap/ui/demo/masterdetail/localService/mockserver"], function (mockserver) {
						success(mockserver.getMockServer());
					});
				});
			},

			theUnitNumbersShouldHaveTwoDecimals : function (sControlType, sViewName, sSuccessMsg, sErrMsg) {
				var rTwoDecimalPlaces =  /^-?\d+\.\d{2}$/;

				return this.waitFor({
					controlType : sControlType,
					viewName : sViewName,
					success : function (aNumberControls) {
						Opa5.assert.ok(aNumberControls.every(function(oNumberControl){
								return rTwoDecimalPlaces.test(oNumberControl.getNumber());
							}),
							sSuccessMsg);
					},
					errorMessage : sErrMsg
				});
			}

		});

	}
);