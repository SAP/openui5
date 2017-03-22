sap.ui.define([
		"sap/ui/test/Opa5"
	], function(Opa5) {
		"use strict";

		function getFrameUrl (sHash, sUrlParameters) {
			var sUrl = jQuery.sap.getResourcePath("sap/ui/demo/worklist/app", ".html");
			sUrlParameters = sUrlParameters ? "?" + sUrlParameters : "";

			if (sHash) {
				sHash = "#" + (sHash.indexOf("/") === 0 ? sHash.substring(1) : sHash);
			} else {
				sHash = "";
			}

			return sUrl + sUrlParameters + sHash;
		}

		return Opa5.extend("sap.ui.demo.worklist.test.integration.pages.Common", {

			iStartMyApp : function (oOptions) {
				var sUrlParameters;
				oOptions = oOptions || {};

				// Start the app with a minimal delay to make tests run fast but still async to discover basic timing issues
				var iDelay = oOptions.delay || 50;

				sUrlParameters = "serverDelay=" + iDelay;

				this.iStartMyAppInAFrame(getFrameUrl(oOptions.hash, sUrlParameters));
			},

			iLookAtTheScreen : function () {
				return this;
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
							},
							errorMessage: "was not able to retireve the entity set " + oOptions.entitySet
						});
					}
				};
			},

			getMockServer : function () {
				return new Promise(function (success) {
					Opa5.getWindow().sap.ui.require(["sap/ui/demo/worklist/localService/mockserver"], function (mockserver) {
						success(mockserver.getMockServer());
					});
				});
			},

			iStartMyAppOnADesktopToTestErrorHandler : function (sParam) {
				this.iStartMyAppInAFrame(getFrameUrl("", sParam));
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