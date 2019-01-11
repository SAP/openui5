sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/dt/test/report/QUnit",
	"sap/ui/dt/test/ElementEnablementTest",
	"sap/m/Slider",
	"sap/m/ResponsiveScale",
	"sap/ui/rta/test/controlEnablingCheck"
], function(createAndAppendDiv, QUnitReport, ElementEnablementTest, Slider, ResponsiveScale, rtaControlEnablingCheck) {
	"use strict";
	createAndAppendDiv("content");


	var oElementEnablementTest = new ElementEnablementTest({
		type: "sap.m.Slider",
		create: function () {
			return new Slider({
				enableTickmarks: true,
				scale: new ResponsiveScale({tickmarksBetweenLabels: 20})
			});
		}
	});

	return oElementEnablementTest.run()

	.then(function (oData) {
		new QUnitReport({
			data: oData
		});
	})

	.then(function() {
		var fnConfirmSliderIsInvisible = function (oAppComponent, oViewAfterAction, assert) {
			assert.ok(oViewAfterAction.byId("slider").getVisible() === false, "then the Slider is invisible");
		};

		var fnConfirmSliderIsVisible = function (oAppComponent, oViewAfterAction, assert) {
			assert.ok(oViewAfterAction.byId("slider").getVisible() === true, "then the Slider is visible");
		};

		rtaControlEnablingCheck("Checking the remove action for Slider", {
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

		rtaControlEnablingCheck("Checking the reveal action for a Slider", {
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