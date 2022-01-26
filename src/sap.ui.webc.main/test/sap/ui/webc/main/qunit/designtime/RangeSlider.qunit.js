sap.ui.define([
	"sap/ui/rta/enablement/elementActionTest"
], function (
	elementActionTest
) {
	"use strict";

	var fnConfirmSliderIsInvisible = function (oAppComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("rangeSlider").getVisible(), false, "then the RangeSlider is invisible");
	};

	var fnConfirmSliderIsVisible = function (oAppComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("rangeSlider").getVisible(), true, "then the RangeSlider is visible");
	};

	elementActionTest("Checking the remove action for RangeSlider", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.ui.webc.main">' +
		'<RangeSlider id="rangeSlider" />' +
		'</mvc:View>'
		,
		action: {
			name: "remove",
			controlId: "rangeSlider",
			parameter: function (oView) {
				return {
					removedElement: oView.byId("rangeSlider")
				};
			}
		},
		afterAction: fnConfirmSliderIsInvisible,
		afterUndo: fnConfirmSliderIsVisible,
		afterRedo: fnConfirmSliderIsInvisible
	});

	elementActionTest("Checking the reveal action for a RangeSlider", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.ui.webc.main">' +
		'<RangeSlider id="rangeSlider" visible="false"/>' +
		'</mvc:View>'
		,
		action: {
			name: "reveal",
			controlId: "rangeSlider"
		},
		afterAction: fnConfirmSliderIsVisible,
		afterUndo: fnConfirmSliderIsInvisible,
		afterRedo: fnConfirmSliderIsVisible
	});
});