sap.ui.define([
	"sap/m/Slider",
	"sap/m/ResponsiveScale",
	"sap/ui/dt/enablement/elementDesigntimeTest",
	"sap/ui/rta/enablement/elementActionTest"
], function (
	Slider,
	ResponsiveScale,
	elementDesigntimeTest,
	elementActionTest
) {
	"use strict";

	return Promise.resolve()
	.then(function () {
		return elementDesigntimeTest({
			type: "sap.m.Slider",
			create: function () {
				return new Slider({
					enableTickmarks: true,
					scale: new ResponsiveScale({tickmarksBetweenLabels: 20})
				});
			}
		});
	})
	.then(function() {
		var fnConfirmSliderIsInvisible = function (oAppComponent, oViewAfterAction, assert) {
			assert.ok(oViewAfterAction.byId("slider").getVisible() === false, "then the Slider is invisible");
		};

		var fnConfirmSliderIsVisible = function (oAppComponent, oViewAfterAction, assert) {
			assert.ok(oViewAfterAction.byId("slider").getVisible() === true, "then the Slider is visible");
		};

		elementActionTest("Checking the remove action for Slider", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">' +
			'<Slider id="slider" />' +
			'</mvc:View>'
			,
			action: {
				name: "remove",
				controlId: "slider",
				parameter: function (oView) {
					return {
						removedElement: oView.byId("slider")
					};
				}
			},
			afterAction: fnConfirmSliderIsInvisible,
			afterUndo: fnConfirmSliderIsVisible,
			afterRedo: fnConfirmSliderIsInvisible
		});

		elementActionTest("Checking the reveal action for a Slider", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">' +
			'<Slider id="slider" visible="false"/>' +
			'</mvc:View>'
			,
			action: {
				name: "reveal",
				controlId: "slider"
			},
			afterAction: fnConfirmSliderIsVisible,
			afterUndo: fnConfirmSliderIsInvisible,
			afterRedo: fnConfirmSliderIsVisible
		});
	});
});