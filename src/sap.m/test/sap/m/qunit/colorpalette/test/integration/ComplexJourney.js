/*global QUnit*/

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"sap/ui/test/actions/Press",
	"sap/ui/test/actions/EnterText",
	"cp/opa/test/env/integration/actions/SwatchColorPress",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"sap/ui/test/matchers/AggregationContainsPropertyEqual",
	"sap/ui/test/matchers/AggregationLengthEquals",
	"cp/opa/test/env/integration/matchers/SwatchColor",
	"jquery.sap.keycodes"
], function (Opa5, opaTest, Press, EnterText, SwatchColorPress, PropertyStrictEquals, AggregationContainsPropertyEqual, AggregationLengthEquals, SwatchColor /*, jquerySapKeyCodes */) {
	"use strict";

	var COMPONENT_VIEW_PREFFIX = "__component0---myHomeView--",
		TABLE_CONTAINER_ID = "samplesTable",
		COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_OPENER_ID = "open-complex-control-defaults-sample",
		COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_ID = "Complex_ControlDefaults-colorPalettePopover-popover",
		COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_DEFAULTCOLOR_ID = "Complex_ControlDefaults-palette-btnDefaultColor",
		COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_MORECOLORS_ID = "Complex_ControlDefaults-palette-btnMoreColors",
		COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_COLORPICKER_ID = "Complex_ControlDefaults-palette-moreColorsDialog",
		COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_COLORPICKER_OKBUTTON_ID = "__button0",
		COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_COLORPICKER_CANCELBUTTON_ID = "__button1",
		COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_COLORPICKER_SLIDERHANDLE_ID =  "__picker0-hSLD",
		COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_COLORPICKER_HEXADECIMALINPUT_ID = "__picker0-hxF";

	var colorSelectEventParamsShouldMatch = function (oExpected) {
		var tryJsonParse = function (sString) {
			try {
				return JSON.parse(sString);
			} catch (e) {
				throw e.message = sString + " was passed to JSON.parse() " + e.message;
			}
		};
		return this.waitFor({
			id: COMPONENT_VIEW_PREFFIX + "colorSelectEventInput",
			success: function (oInput) {
				var vColorSelectEventParameters = oInput.getValue(),
					sExpectedParams = JSON.stringify(oExpected),
					bExpectationMet = !!vColorSelectEventParameters.length;

				if (bExpectationMet) {
					vColorSelectEventParameters = tryJsonParse(vColorSelectEventParameters);
					bExpectationMet = Object.keys(oExpected).every(function (sKey) {
						return vColorSelectEventParameters[sKey] === oExpected[sKey];
					});
				}
				Opa5.assert.ok(bExpectationMet, "colorSelect event was fired with correct parameters\n" + sExpectedParams);
			}
		});
	};

	Opa5.extendConfig({
		autoWait: true,
		viewNamespace: "cp.opa.test.app.views.",
		arrangements: new Opa5({
			iStartMyComponent: function (sComponentName) {
				return this.iStartMyUIComponent({
					componentConfig: {
						name: sComponentName,
						id: "__component0",
						manifest:true
					},
					// testing deep links is possible by setting a hash
					hash: ""
				});
			}
		}),
		actions: new Opa5({
			iOpenComplexControlDefaultsColorPalettePopover: function () {
				return this.waitFor({
					viewName: "Home",
					id: COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_OPENER_ID,
					actions: [
						/*
						 * ToDo: Currently, the OPA build-in sap.ui.test.action.Press() action doesn't focus the target before firing the corresponding events (on IE only).
						 * ToDo: Adding an additional action (function) which focuses it works around this problem and should be removed when a fix is provided.
						 */
						function (oElement) {
						if (document.activeElement.id !== oElement.getId()) {
							oElement.focus();
						}
					}, new Press()],
					success: function () {
						Opa5.assert.ok(true, COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_OPENER_ID + " opener is successfully activated.");
					},
					errorMessage: COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_OPENER_ID + " opener was not found"
				});
			},
			iClickOnATargetId: function (sTargetId) {
				return this.waitFor({
					id: sTargetId,
					actions: [
						/*
						 * ToDo: Currently, the OPA build-in sap.ui.test.action.Press() action doesn't focus the target before firing the corresponding events (on IE only).
						 * ToDo: Adding an additional action (function) which focuses it works around this problem and should be removed when a fix is provided.
						 */
						function (oElement) {
							if (document.activeElement.id !== oElement.getId()) {
								oElement.focus();
							}
						}, new Press()],
					success: function () {
						Opa5.assert.ok(true, sTargetId + " is clicked successfully");
					},
					errorMessage: "Target with id: " + sTargetId + " was not found"
				});
			},
			iPressKeyOnATargetId: function(sTarget, iKey, bShiftKey, bAltKey, bCtrlKey) {
				return this.waitFor({
					id: sTarget,
					actions: function (oTarget) {
						Opa5.getUtils().triggerKeydown(oTarget.getId(), iKey, bShiftKey, bAltKey, bCtrlKey);
						Opa5.getUtils().triggerKeyup(oTarget.getId(), iKey, bShiftKey, bAltKey, bCtrlKey);
					},
					success: function (oTarget) {
						Opa5.assert.ok(true, "A [keydown] with iKey code " + iKey + " was triggered on " + oTarget.getId());
					},
					errorMessage: "Target with id " + sTarget + " was NOT found."
				});
			},
			iClickOnAColorSwatch: function (sColor) {
				return this.waitFor({
					searchOpenDialogs: true,
					actions: new SwatchColorPress(),
					matchers: new SwatchColor({
						color: sColor
					}),
					success: function () {
						Opa5.assert.ok(true, "Swatch color with value " + sColor + " was clicked");
						this.colorSelectEventParamsShouldMatch({
							defaultAction: false,
							value: sColor
						});
					},
					errorMessage: "ColorPalettePopover opener was not found"
				});
			},
			iPressKeyOnAColorSwatch: function (sColor, iKey) {
				return this.waitFor({
					searchOpenDialogs: true,
					controlType: "sap.m.ColorPalette",
					actions: function (oColor) {
						Opa5.getUtils().triggerKeydown(oColor, iKey);
						Opa5.getUtils().triggerKeyup(oColor, iKey);
					},
					matchers: new SwatchColor({
						color: sColor
					}),
					success: function () {
						Opa5.assert.ok(true, "A keydown with iKey code " + iKey + " was triggered on a " + sColor + " swatch");
					},
					errorMessage: "ColorPalettePopover opener was not found"
				});
			},
			iChangeTheColorPickerColor: function (sColor) {
				return this.waitFor({
					id: COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_COLORPICKER_HEXADECIMALINPUT_ID,
					actions: new EnterText({
						text: sColor
					}),
					success: function (oControl) {
						Opa5.assert.ok(true, sColor + " was entered in the hexadecimal input of ColorPalettePopover with id: " + oControl.getId());
					},
					errorMessage: "Element with id " + COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_COLORPICKER_HEXADECIMALINPUT_ID + " was not was NOT found"
				});
			},
			iConfirmNewColorSelection: function () {
				return this.waitFor({
					id: COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_COLORPICKER_OKBUTTON_ID,
					actions: [
						/*
						 * ToDo: Currently, the OPA build-in sap.ui.test.action.Press() action doesn't focus the target before firing the corresponding events (on IE only).
						 * ToDo: Adding an additional action (function) which focuses it works around this problem and should be removed when a fix is provided.
						 */
						function (oElement) {
							if (document.activeElement.id !== oElement.getId()) {
								oElement.focus();
							}
						}, new Press()],
					success: function () {
						Opa5.assert.ok(true, COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_COLORPICKER_OKBUTTON_ID + " was clicked");
					},
					errorMessage: "The 'OK' button of 'ColorPicker' was NOT found"
				});
			},
			//This is a repeated assertion block
			colorSelectEventParamsShouldMatch: colorSelectEventParamsShouldMatch
		}),
		assertions: new Opa5({
			complexControlDefaultsColorPalettePopoverShouldBeOpen: function () {
				var oComplexControlDefaultsColorPalettePopover = null;
				return this.waitFor({
					autoWait: false,
					viewName: "Home",
					check: function () {
						oComplexControlDefaultsColorPalettePopover = sap.ui.getCore().byId(COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_ID);
						//ComplexControlDefaultsColorPopoverPalette is rendered in UI area and visible
						return oComplexControlDefaultsColorPalettePopover.$().length === 1 && oComplexControlDefaultsColorPalettePopover.$().is(":visible");
					},
					success: function () {
						Opa5.assert.ok(true, "The ColorPalettePopover is opened");
						this.complexControlDefaultsColorPalettePopoverShouldRenderAllChildControls();
						this.documentActiveElementShouldBe(oComplexControlDefaultsColorPalettePopover.getAggregation("content")[0].getAggregation("_defaultColorButton").getId());
					},
					errorMessage: "ColorPalettePopover was NOT successfully opened."
				});
			},
			complexControlDefaultsColorPalettePopoverColorPickerShouldBeOpen: function () {
				var oComplexControlDefaultsColorPalettePopoverColorPicker = null;
				return this.waitFor({
					autoWait: false,
					viewName: "Home",
					check: function () {
						oComplexControlDefaultsColorPalettePopoverColorPicker = sap.ui.getCore().byId(COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_COLORPICKER_ID);
						//ComplexControlDefaultsColorPalettePopoverColorPicker is rendered in UI area and visible
						return oComplexControlDefaultsColorPalettePopoverColorPicker.$().length === 1 && oComplexControlDefaultsColorPalettePopoverColorPicker.$().is(":visible");
					},
					success: function () {
						Opa5.assert.ok(true, "The ColorPicker of the ColorPalettePopover is opened");
						this.complexControlDefaultsColorPalettePopoverShouldRenderAllChildControls();
						this.documentActiveElementShouldBe(COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_COLORPICKER_SLIDERHANDLE_ID + "-handle");
					},
					errorMessage: "ColorPalettePopover couldn't open its ColorPicker."
				});
			},
			complexControlDefaultsColorPalettePopoverShouldBeClosedAndFocusShouldBeOn: function (sExpectedIdToBeDocumentActiveElement) {
				var oComplexControlDefaultsColorPalettePopover = null;
				return this.waitFor({
					autoWait: false,
					check: function () {
						oComplexControlDefaultsColorPalettePopover = sap.ui.getCore().byId(COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_ID);
						//ComplexControlDefaultsColorPopoverPalette is rendered in UI area and hidden
						return oComplexControlDefaultsColorPalettePopover.$().length === 1 && oComplexControlDefaultsColorPalettePopover.$().is(":hidden");
					},
					success: function () {
						Opa5.assert.ok(true, "The ColorPalettePopover is closed");
						this.documentActiveElementShouldBe(sExpectedIdToBeDocumentActiveElement);
					},
					errorMessage: "ColorPalettePopover was NOT successfully closed."
				});
			},
			firstTwoColorsOfRecentColorsBlockShouldBe: function (aRecentColors){
				return this.waitFor({
					searchOpenDialogs: true,
					controlType: "sap.m.ColorPalette",
					check: function (aElements){
						if (JSON.stringify(aRecentColors) === JSON.stringify(aElements[0]._getRecentColors())){
							return true;
						} else {
							return false;
						}
					},
					success: function () {
						Opa5.assert.ok(true, "ColorPalette Recent colors section contains the right colors");
					},
					errorMessage: "ColorPalette doesn't contains the right colors"
				});
			},
			complexControlDefaultsColorPalettePopoverShouldRenderAllChildControls: function () {
				//Assuming that Complex ControlDefaults ColorPalettePopover is already opened
				return this.waitFor({
					searchOpenDialogs: true,
					controlType: "sap.m.Button",
					success: function (aButtons) {
						var oDefaultButton = aButtons[0],
							oMoreColorsButton = aButtons[1];

						Opa5.assert.ok(oDefaultButton && oMoreColorsButton, "ColorPalettePopover contains 'default color' and 'more colors' buttons");
						Opa5.assert.strictEqual(oDefaultButton.$().length, 1, '"Default Colors" button is rendered');
						Opa5.assert.strictEqual(oMoreColorsButton.$().length, 1, '"More Colors..." button is rendered');
					},
					errorMessage: "ColorPalettePopover opener was not found"
				});
			},
			colorSelectEventParamsShouldMatch: colorSelectEventParamsShouldMatch,
			documentActiveElementShouldBe: function (sTarget) {
				return this.waitFor({
					success: function () {
						Opa5.assert.strictEqual(document.activeElement.id, sTarget, "Element with id: " + sTarget + " was focused");
					},
					errorMessage: "Element with id='" + sTarget + "' was NOT found."
				});
			},
			documentActiveSwatchShouldBe: function (sColorName) {
				return this.waitFor({
					success: function () {
						var oComplexControlDefaultsColorPalettePopover = sap.ui.getCore().byId(COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_ID),
							oColor = oComplexControlDefaultsColorPalettePopover.$().find('[data-sap-ui-color="' + sColorName + '"]').get(0);

						Opa5.assert.strictEqual(document.activeElement, oColor, "Swatch with color: " + sColorName + " was focused");
					},
					errorMessage: "Swatch with color='" + sColorName + "' was NOT found."
				});
			}
		})
	});

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
});