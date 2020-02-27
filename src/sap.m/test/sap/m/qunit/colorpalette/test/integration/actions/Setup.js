sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"sap/ui/test/actions/Press",
	"sap/ui/test/actions/EnterText",
	"cp/opa/test/env/integration/actions/SwatchColorPress",
	"cp/opa/test/env/integration/matchers/SwatchColor",
	"jquery.sap.keycodes"
], function (Opa5, opaTest, Press, EnterText, SwatchColorPress, SwatchColor /*, jquerySapKeyCodes */) {
	"use strict";

	var COMPONENT_VIEW_PREFFIX = "__component0---myHomeView--",
		COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_OPENER_ID = "open-complex-control-defaults-sample",
		COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_ID = "Complex_ControlDefaults-colorPalettePopover-popover",
		COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_COLORPICKER_ID = "Complex_ControlDefaults-palette-moreColorsDialog",
		COMPLEX_CONTROLDEFAULTS_COLORPALETTEPOPOVER_COLORPICKER_OKBUTTON_ID = "__button0",
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

	/* OPA tests Part #1 */

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

});