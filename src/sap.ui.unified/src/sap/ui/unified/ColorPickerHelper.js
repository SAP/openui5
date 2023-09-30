/*!
 * ${copyright}
 */

// Provides helper sap.ui.unified.ColorPickerHelper.
sap.ui.define([
	'sap/m/Button',
	'sap/m/Label',
	'sap/m/InputBase',
	'sap/m/Slider',
	'sap/m/RadioButton',
	'sap/m/RadioButtonGroup'
], function(
	Button,
	Label,
	InputBase,
	Slider,
	RadioButton,
	RadioButtonGroup
) {
	"use strict";
	var ColorPickerHelper;

	ColorPickerHelper = {
		getHelper: function () {
			return {
				isResponsive: function () {
					return true;
				},
				factory: {
					createLabel: function (mConfig) {
						return new Label(mConfig);
					},
					createInput: function (sId, mConfig) {
						return new InputBase(sId, mConfig);
					},
					createSlider: function (sId, mConfig) {
						return new Slider(sId, mConfig);
					},
					createRadioButtonGroup: function (mConfig) {
						return new RadioButtonGroup(mConfig);
					},
					createRadioButtonItem: function (mConfig) {
						return new RadioButton(mConfig);
					},
					createButton: function (sId, mConfig) {
						return new Button(sId, mConfig);
					}
				}
			};
		}
	};

	return ColorPickerHelper;
});