sap.ui.define([
	"sap/m/Image",
	"sap/ui/dt/enablement/elementDesigntimeTest",
	"sap/ui/rta/enablement/elementActionTest"
], function(
	Image,
	elementDesigntimeTest,
	elementActionTest
) {
	"use strict";

	return Promise.resolve()
	.then(function () {
		return elementDesigntimeTest({
			type: "sap.m.Image",
			create: function () {
				return new Image();
			}
		});
	})
	.then(function() {
		// Remove and reveal actions
		var fnConfirmImageIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("myImage").getVisible(), false, "then the Image element is invisible");
		};

		var fnConfirmImageIsVisible = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("myImage").getVisible(), true, "then the Image element is visible");
		};

		elementActionTest("Checking the remove action for Image", {
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

		elementActionTest("Checking the reveal action for a Image", {
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
});