/*global QUnit*/

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"cp/opa/test/env/integration/actions/Setup",
	"jquery.sap.keycodes"
], function (Opa5, opaTest, Setup /*, jquerySapKeyCodes */) {
	"use strict";

	var COMPONENT_VIEW_PREFFIX = "__component0---myHomeView--",
		COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_OPENER_ID = "open-complex-control-defaults-sample",
		COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_DEFAULTCOLOR_ID = "Complex_ControlDefaults-palette-btnDefaultColor",
		COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_MORECOLORS_ID = "Complex_ControlDefaults-palette-btnMoreColors",
		COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_COLORPICKER_ID = "Complex_ControlDefaults-palette-moreColorsDialog",
		COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_COLORPICKER_CANCELBUTTON_ID = "__button1";

	QUnit.module("Complex scenario", function () {

		QUnit.module("Control defaults", function () {

			QUnit.module("More colors... + ColorPicker", function () {
				/* THIS MODULE CONTAINS TEST DEPENDENCIES ON TEST ENVIRONMENT STATE */

				opaTest("More colors...: Open the 'ColorPicker' using [MOUSE_LEFT] key", function (Given, When, Then) {
					Given.iStartMyComponent("cp.opa.test.app");
					When.iOpenComplexControlDefaultsColorPalettePopover();
					Then.complexControlDefaultsColorPalettePopoverShouldBeOpen();
					When.iClickOnATargetId(COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_MORECOLORS_ID);
					Then.complexControlDefaultsColorPalettePopoverColorPickerShouldBeOpen();
				});

				//Assume opened ColorPicker from previous test
				opaTest("ColorPicker: Cancel new color selection by clicking the popover 'Cancel' button", function (Given, When, Then) {
					When.iClickOnATargetId(COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_COLORPICKER_CANCELBUTTON_ID);
					Then.complexControlDefaultsColorPalettePopoverShouldBeClosedAndFocusShouldBeOn(COMPONENT_VIEW_PREFFIX + COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_OPENER_ID);
				});

				//Assume closed ColorPalettePopover from previous test
				opaTest("More colors...: Open the 'ColorPicker' using [ENTER] key", function (Given, When, Then) {
					When.iOpenComplexControlDefaultsColorPalettePopover();
					Then.complexControlDefaultsColorPalettePopoverShouldBeOpen();
					When.iPressKeyOnATargetId(COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_MORECOLORS_ID, jQuery.sap.KeyCodes.ENTER);
					Then.complexControlDefaultsColorPalettePopoverColorPickerShouldBeOpen();
				});

				//Assume opened ColorPicker from previous test
				opaTest("ColorPicker: Cancel new color selection using [ESCAPE] key", function (Given, When, Then) {
					When.iPressKeyOnATargetId(COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_COLORPICKER_ID, jQuery.sap.KeyCodes.ESCAPE);
					Then.complexControlDefaultsColorPalettePopoverShouldBeClosedAndFocusShouldBeOn(COMPONENT_VIEW_PREFFIX + COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_OPENER_ID);
				});

				//Assume closed ColorPalettePopover from previous test
				opaTest("More colors...:Open the 'ColorPicker' using [SPACE] key", function (Given, When, Then) {
					When.iOpenComplexControlDefaultsColorPalettePopover();
					Then.complexControlDefaultsColorPalettePopoverShouldBeOpen();
					When.iPressKeyOnATargetId(COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_MORECOLORS_ID, jQuery.sap.KeyCodes.SPACE);
					Then.complexControlDefaultsColorPalettePopoverColorPickerShouldBeOpen();
				});

				//Assume opened ColorPicker from previous test
				opaTest("ColorPicker: Select a valid custom color", function (Given, When, Then) {
					//Currently, sap.ui.unified.ColorPicker gives the possibility for its consumer to pick a color by using all color formats RGB, HSL or HSV (depending on its 'mode' property) and HEX as an input
					//The control also gives the consumer the possibility to configure the output format of the color only RGB or HSL (if mode is HSL set) in the 'change' event.
					//This is the actual reason of the test to select a color using the HEX format (#f2f2f2) as an input and expects the output of the same color in in RGB format rgb(242,242,242)
					When.iChangeTheColorPickerColor("f2f2f2").and.iConfirmNewColorSelection();
					Then.colorSelectEventParamsShouldMatch({
						defaultAction: false,
						value: "rgb(242,242,242)"
					});
					Then.complexControlDefaultsColorPalettePopoverShouldBeClosedAndFocusShouldBeOn(COMPONENT_VIEW_PREFFIX + COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_OPENER_ID);
				});

				//Assume closed ColorPalettePopover from previous test
				opaTest("More colors...: Open the 'ColorPicker' using [TAB] key", function (Given, When, Then) {
					When.iOpenComplexControlDefaultsColorPalettePopover();
					Then.complexControlDefaultsColorPalettePopoverShouldBeOpen();
					When.iPressKeyOnATargetId(COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_MORECOLORS_ID, jQuery.sap.KeyCodes.TAB);
					Then.complexControlDefaultsColorPalettePopoverShouldBeClosedAndFocusShouldBeOn(COMPONENT_VIEW_PREFFIX + COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_OPENER_ID);
				});

				//Assume closed ColorPalettePopover from previous test
				opaTest("ColorPicker: Select an invalid custom color", function (Given, When, Then) {
					//Currently, sap.ui.unified.ColorPicker gives the possibility for its consumer to pick a color by using all color formats RGB, HSL or HSV (depending on its 'mode' property) and HEX as an input
					//The control also gives the consumer the possibility to configure the output format of the color only RGB or HSL (if mode is HSL set) in the 'change' event.
					//This is the actual reason of the test to select a color using the HEX format (#f2f2f2) as an input and expects the output of the same color in in RGB format rgb(242,242,242)
					When.iOpenComplexControlDefaultsColorPalettePopover();
					Then.complexControlDefaultsColorPalettePopoverShouldBeOpen();
					When.iPressKeyOnATargetId(COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_MORECOLORS_ID, jQuery.sap.KeyCodes.ENTER);
					//Expect the old valid color to be preserved when confirm invalid value
					When.iChangeTheColorPickerColor("invalidcolor").and.iConfirmNewColorSelection();
					Then.colorSelectEventParamsShouldMatch({
						defaultAction: false,
						value: "rgb(242,242,242)"
					});
					Then.complexControlDefaultsColorPalettePopoverShouldBeClosedAndFocusShouldBeOn(COMPONENT_VIEW_PREFFIX + COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_OPENER_ID);
					Given.iTeardownMyUIComponent();
				});
			});

			opaTest("Fake test to have a root module with at least one test, otherwise qunit-2 will fail", function () {
				Opa5.assert.ok(true, "assert ok");
			});
		});

		QUnit.module("Keyboard navigation", function () {
			opaTest("Backward", function (Given, When, Then) {
				Given.iStartMyComponent("cp.opa.test.app");
				When.iOpenComplexControlDefaultsColorPalettePopover();
				Then.complexControlDefaultsColorPalettePopoverShouldBeOpen();

				When.iPressKeyOnATargetId(COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_DEFAULTCOLOR_ID, jQuery.sap.KeyCodes.ARROW_UP);
				Then.documentActiveElementShouldBe(COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_MORECOLORS_ID);

				When.iPressKeyOnATargetId(COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_MORECOLORS_ID, jQuery.sap.KeyCodes.ARROW_UP);
				Then.documentActiveSwatchShouldBe("white");

				When.iPressKeyOnAColorSwatch("white", jQuery.sap.KeyCodes.ARROW_LEFT);
				Then.documentActiveSwatchShouldBe("azure");

				When.iPressKeyOnAColorSwatch("azure", jQuery.sap.KeyCodes.ARROW_UP);
				Then.documentActiveSwatchShouldBe("cornflowerblue");

				When.iPressKeyOnAColorSwatch("cornflowerblue", jQuery.sap.KeyCodes.HOME);
				Then.documentActiveSwatchShouldBe("gold");

				When.iPressKeyOnAColorSwatch("gold", jQuery.sap.KeyCodes.ARROW_UP);
				Then.documentActiveElementShouldBe(COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_DEFAULTCOLOR_ID);

				// Cleanup
				Given.iTeardownMyUIComponent();
			});

			opaTest("Forward", function (Given, When, Then) {
				Given.iStartMyComponent("cp.opa.test.app");
				When.iOpenComplexControlDefaultsColorPalettePopover();
				Then.complexControlDefaultsColorPalettePopoverShouldBeOpen();

				When.iPressKeyOnATargetId(COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_DEFAULTCOLOR_ID, jQuery.sap.KeyCodes.ARROW_DOWN);
				Then.documentActiveSwatchShouldBe("gold");

				When.iPressKeyOnAColorSwatch("gold", jQuery.sap.KeyCodes.ARROW_DOWN);
				Then.documentActiveSwatchShouldBe("deepskyblue");

				When.iPressKeyOnAColorSwatch("deepskyblue", jQuery.sap.KeyCodes.ARROW_DOWN);
				Then.documentActiveSwatchShouldBe("white");

				When.iPressKeyOnAColorSwatch("white", jQuery.sap.KeyCodes.ARROW_DOWN);
				Then.documentActiveSwatchShouldBe("darkorange"); // goes to the next column

				When.iPressKeyOnAColorSwatch("darkorange", jQuery.sap.KeyCodes.ARROW_RIGHT);
				Then.documentActiveSwatchShouldBe("indianred"); // goes to the next column

				When.iPressKeyOnAColorSwatch("indianred", jQuery.sap.KeyCodes.END);
				Then.documentActiveSwatchShouldBe("cornflowerblue"); // last item in the first row

				When.iPressKeyOnAColorSwatch("cornflowerblue", jQuery.sap.KeyCodes.END);
				Then.documentActiveSwatchShouldBe("black"); // last item in the first row

				When.iPressKeyOnAColorSwatch("black", jQuery.sap.KeyCodes.END);
				Then.documentActiveElementShouldBe(COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_MORECOLORS_ID);

				// Cleanup
				Given.iTeardownMyUIComponent();
			});
		});

		opaTest("Fake test to have a root module with at least one test, otherwise qunit-2 will fail", function () {
			Opa5.assert.ok(true, "assert ok");
		});
	});

	QUnit.module("Recent Colors", function () {
		/* THIS MODULE CONTAINS TEST DEPENDENCIES ON TEST ENVIRONMENT STATE */

		opaTest("Selected colors should be in recent colors section", function (Given, When, Then) {
			Given.iStartMyComponent("cp.opa.test.app");
			When.iOpenComplexControlDefaultsColorPalettePopover();
			Then.complexControlDefaultsColorPalettePopoverShouldBeOpen();
			When.iClickOnAColorSwatch("gold");
			When.iOpenComplexControlDefaultsColorPalettePopover();
			When.iClickOnAColorSwatch("darkorange");
			When.iOpenComplexControlDefaultsColorPalettePopover();
			Then.firstTwoColorsOfRecentColorsBlockShouldBe(["darkorange", "gold"]);

			// Cleanup
			Given.iTeardownMyUIComponent();
		});
	});

	//Start test execution when all tests are loaded
	QUnit.start();

});