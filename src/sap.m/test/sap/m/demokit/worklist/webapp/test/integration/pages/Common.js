sap.ui.define([
	"sap/ui/test/Opa5"
], function(Opa5) {
	"use strict";

	return Opa5.extend("sap.ui.demo.worklist.test.integration.pages.Common", {

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
		},

		getMockServer : function () {
			return new Promise(function (success) {
				Opa5.getWindow().sap.ui.require(["sap/ui/demo/worklist/localService/mockserver"], function (mockserver) {
					success(mockserver.getMockServer());
				});
			});
		}

	});

});
