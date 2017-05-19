(function () {
	"use strict";

	sap.ui.require([
		"sap/ui/dt/test/report/QUnit",
		"sap/ui/dt/test/ElementEnablementTest",
		"sap/m/Image",
		"sap/ui/rta/test/controlEnablingCheck"
	], function (QUnitReport, ElementEnablementTest, Image, rtaControlEnablingCheck) {

		var oElementEnablementTest = new ElementEnablementTest({
			type: "sap.m.Image",
			create: function () {
				return new Image();
			}
		});
		oElementEnablementTest.run().then(function (oData) {
			new QUnitReport({
				data: oData
			});
		});

		// Remove and reveal actions
		var fnConfirmImageIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("myImage").getVisible(), false, "then the Image element is invisible");
		};

		var fnConfirmImageIsVisible = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("myImage").getVisible(), true, "then the Image element is visible");
		};

		rtaControlEnablingCheck("Checking the remove action for Image", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">"' +
			'<Image id="myImage" src="../../images/SAPUI5.png" width="100px"/>' +
			'</mvc:View>'
			,
			action: {
				name: "remove",
				controlId: "myImage"
			},
			afterAction: fnConfirmImageIsInvisible,
			afterUndo: fnConfirmImageIsVisible,
			afterRedo: fnConfirmImageIsInvisible
		});

		rtaControlEnablingCheck("Checking the reveal action for a Image", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">"' +
			'<Image id="myImage" src="../../images/SAPUI5.png" width="100px" visible="false"/>' +
			'</mvc:View>'
			,
			action: {
				name: "reveal",
				controlId: "myImage"
			},
			afterAction: fnConfirmImageIsVisible,
			afterUndo: fnConfirmImageIsInvisible,
			afterRedo: fnConfirmImageIsVisible
		});
	});
})();