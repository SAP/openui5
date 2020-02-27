/*global QUnit*/

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"cp/opa/test/env/integration/actions/Setup",
	"jquery.sap.keycodes"
], function (Opa5, opaTest, Setup /*, jquerySapKeyCodes */) {
	"use strict";

	QUnit.module("Setup");

	var COMPONENT_VIEW_PREFFIX = "__component0---myHomeView--",
		TABLE_CONTAINER_ID = "samplesTable",
		COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_OPENER_ID = "open-complex-control-defaults-sample",
		COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_ID = "Complex_ControlDefaults-colorPalettePopover-popover",
		COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_DEFAULTCOLOR_ID = "Complex_ControlDefaults-palette-btnDefaultColor";

	QUnit.module("Complex scenario", function () {

		QUnit.module("Control defaults", function () {

			QUnit.module("ColorPalettePopover", function () {
				/* THIS MODULE CONTAINS TEST DEPENDENCIES ON TEST ENVIRONMENT STATE */

				opaTest("Control Defaults", function (Given, When, Then) {
					//Initiate component
					Given.iStartMyComponent("cp.opa.test.app");
					When.iOpenComplexControlDefaultsColorPalettePopover();
					Then.complexControlDefaultsColorPalettePopoverShouldBeOpen();
				});

				//Assume opened ColorPalettePopover from previous test
				opaTest("Cancel new color selection by clicking with [MOUSE_LEFT] button outside the popover area", function (Given, When, Then) {
					//Click on the first table item
					var sFirstTableItemId = sap.ui.getCore().byId(COMPONENT_VIEW_PREFFIX + TABLE_CONTAINER_ID).getAggregation("items")[0].getId();
					When.iClickOnATargetId(sFirstTableItemId);
					Then.complexControlDefaultsColorPalettePopoverShouldBeClosedAndFocusShouldBeOn(sFirstTableItemId);
				});

				//Assume closed ColorPalettePopover from previous test
				opaTest("Cancel new color selection using [ESCAPE] key", function (Given, When, Then) {
					When.iOpenComplexControlDefaultsColorPalettePopover();
					Then.complexControlDefaultsColorPalettePopoverShouldBeOpen();
					When.iPressKeyOnATargetId(COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_ID, jQuery.sap.KeyCodes.ESCAPE);
					//Adding COMPONENT_VIEW_SUFFIX is required here because of the nature of UI5 component to add ids
					Then.complexControlDefaultsColorPalettePopoverShouldBeClosedAndFocusShouldBeOn(COMPONENT_VIEW_PREFFIX + COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_OPENER_ID);
					//Destroy component
					Given.iTeardownMyUIComponent();
				});
			});

			QUnit.module("Default button", function () {
				/* THIS MODULE CONTAINS TEST DEPENDENCIES ON TEST ENVIRONMENT STATE */

				opaTest("Select the default color by clicking on 'Default colors' button with the [MOUSE_LEFT] key", function (Given, When, Then) {
					//Initiate component
					Given.iStartMyComponent("cp.opa.test.app");
					When.iOpenComplexControlDefaultsColorPalettePopover();
					Then.complexControlDefaultsColorPalettePopoverShouldBeOpen();
					When.iClickOnATargetId(COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_DEFAULTCOLOR_ID);
					Then.colorSelectEventParamsShouldMatch({
						defaultAction: true,
						value: "green"
					});
					Then.complexControlDefaultsColorPalettePopoverShouldBeClosedAndFocusShouldBeOn(COMPONENT_VIEW_PREFFIX + COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_OPENER_ID);
				});

				//Assume closed ColorPalettePopover from previous test
				opaTest("Select the default color using the [SPACE] key", function (Given, When, Then) {
					When.iOpenComplexControlDefaultsColorPalettePopover();
					Then.complexControlDefaultsColorPalettePopoverShouldBeOpen();
					When.iPressKeyOnATargetId(COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_DEFAULTCOLOR_ID, jQuery.sap.KeyCodes.SPACE);
					Then.colorSelectEventParamsShouldMatch({
						defaultAction: true,
						value: "green"
					});
					Then.complexControlDefaultsColorPalettePopoverShouldBeClosedAndFocusShouldBeOn(COMPONENT_VIEW_PREFFIX + COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_OPENER_ID);
				});

				//Assume closed ColorPalettePopover from previous test
				opaTest("Select the default color using the [ENTER] key", function (Given, When, Then) {
					When.iOpenComplexControlDefaultsColorPalettePopover();
					Then.complexControlDefaultsColorPalettePopoverShouldBeOpen();
					When.iPressKeyOnATargetId(COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_DEFAULTCOLOR_ID, jQuery.sap.KeyCodes.ENTER);
					Then.colorSelectEventParamsShouldMatch({
						defaultAction: true,
						value: "green"
					});
					Then.complexControlDefaultsColorPalettePopoverShouldBeClosedAndFocusShouldBeOn(COMPONENT_VIEW_PREFFIX + COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_OPENER_ID);
				});

				//Assume closed ColorPalettePopover from previous test
				opaTest("Select the default color using the [TAB] key", function (Given, When, Then) {
					When.iOpenComplexControlDefaultsColorPalettePopover();
					Then.complexControlDefaultsColorPalettePopoverShouldBeOpen();
					When.iPressKeyOnATargetId(COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_DEFAULTCOLOR_ID, jQuery.sap.KeyCodes.TAB);
					Then.colorSelectEventParamsShouldMatch({
						defaultAction: true,
						value: "green"
					});
					Then.complexControlDefaultsColorPalettePopoverShouldBeClosedAndFocusShouldBeOn(COMPONENT_VIEW_PREFFIX + COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_OPENER_ID);
					//Destroy component
					Given.iTeardownMyUIComponent();
				});
			});

			QUnit.module("Swatch Container", function () {
				/* THIS MODULE CONTAINS TEST DEPENDENCIES ON TEST ENVIRONMENT STATE */

				opaTest("Select a predefined color by clicking on it with the [MOUSE_LEFT] key", function (Given, When, Then) {
					Given.iStartMyComponent("cp.opa.test.app");
					When.iOpenComplexControlDefaultsColorPalettePopover();
					Then.complexControlDefaultsColorPalettePopoverShouldBeOpen();
					When.iClickOnAColorSwatch("gold");
					Then.complexControlDefaultsColorPalettePopoverShouldBeClosedAndFocusShouldBeOn(COMPONENT_VIEW_PREFFIX + COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_OPENER_ID);
				});

				//Assume closed ColorPalettePopover from previous test
				opaTest("Select a predefined color using the [SPACE] key", function (Given, When, Then) {
					When.iOpenComplexControlDefaultsColorPalettePopover();
					Then.complexControlDefaultsColorPalettePopoverShouldBeOpen();
					When.iPressKeyOnAColorSwatch("darkorange", jQuery.sap.KeyCodes.SPACE);
					Then.colorSelectEventParamsShouldMatch({
						defaultAction: false,
						value: "darkorange"
					});
					Then.complexControlDefaultsColorPalettePopoverShouldBeClosedAndFocusShouldBeOn(COMPONENT_VIEW_PREFFIX + COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_OPENER_ID);
				});

				//Assume closed ColorPalettePopover from previous test
				opaTest("Select a predefined color using the [ENTER] key", function (Given, When, Then) {
					When.iOpenComplexControlDefaultsColorPalettePopover();
					Then.complexControlDefaultsColorPalettePopoverShouldBeOpen();
					When.iPressKeyOnAColorSwatch("indianred", jQuery.sap.KeyCodes.ENTER);
					Then.colorSelectEventParamsShouldMatch({
						defaultAction: false,
						value: "indianred"
					});
					Then.complexControlDefaultsColorPalettePopoverShouldBeClosedAndFocusShouldBeOn(COMPONENT_VIEW_PREFFIX + COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_OPENER_ID);
				});

				//Assume closed ColorPalettePopover from previous test
				opaTest("Select a predefined color using the [TAB] key", function (Given, When, Then) {
					When.iOpenComplexControlDefaultsColorPalettePopover();
					Then.complexControlDefaultsColorPalettePopoverShouldBeOpen();
					When.iPressKeyOnAColorSwatch("darkmagenta", jQuery.sap.KeyCodes.TAB);
					Then.colorSelectEventParamsShouldMatch({
						defaultAction: false,
						value: "darkmagenta"
					});
					Then.complexControlDefaultsColorPalettePopoverShouldBeClosedAndFocusShouldBeOn(COMPONENT_VIEW_PREFFIX + COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_OPENER_ID);
					Given.iTeardownMyUIComponent();
				});
			});

			opaTest("Fake test to have a root module with at least one test, otherwise qunit-2 will fail", function () {
				Opa5.assert.ok(true, "assert ok");
			});
		});
		opaTest("Fake test to have a root module with at least one test, otherwise qunit-2 will fail", function () {
			Opa5.assert.ok(true, "assert ok");
		});
	});

	//Start test execution when all tests are loaded
	QUnit.start();

});