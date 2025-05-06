/*!
 * ${copyright}
 */

// Provides helper sap.ui.unified.ColorPickerHelper.
sap.ui.define([
	'sap/ui/core/Lib',
	"sap/m/Label",
	"sap/m/InputBase",
	"sap/m/Slider",
	"sap/m/RadioButtonGroup",
	"sap/m/RadioButton",
	"sap/m/Button",
	"sap/ui/commons/Label",
	"sap/ui/commons/TextField",
	"sap/ui/commons/Slider",
	"sap/ui/commons/RadioButtonGroup",
	"sap/ui/core/Item"
], function(
	Library,
	Label,
	InputBase,
	Slider,
	RadioButtonGroup,
	RadioButton,
	Button,
	CommonsLabel,
	TextField,
	CommonsSlider,
	CommonsRadioButtonGroup,
	Item
) {
	"use strict";
	var ColorPickerHelper;

	var oMLibraryLoad = {
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

	var oCommonsLibraryLoad = {
		isResponsive: function () {
			return false;
		},
		factory: {
			createLabel: function (mConfig) {
				return new CommonsLabel(mConfig);
			},
			createInput: function (sId, mConfig) {
				return new TextField(sId, mConfig);
			},
			createSlider: function (sId, mConfig) {
				if (mConfig && mConfig.step) {
					mConfig.smallStepWidth = mConfig.step;
					delete mConfig.step;
				}
				return new CommonsSlider(sId, mConfig);
			},
			createRadioButtonGroup: function (mConfig) {
				if (mConfig && mConfig.buttons) {
					mConfig.items = mConfig.buttons;
					delete mConfig.buttons;
				}
				return new CommonsRadioButtonGroup(mConfig);
			},
			createRadioButtonItem: function (mConfig) {
				return new Item(mConfig);
			}
		}
	};

	var oErrorLibraryLoad = {
		isResponsive: function () { return false; },
			factory: {
				createLabel:  function () { throw new Error("no Label control available"); },
				createInput:  function () { throw new Error("no Input control available"); },
				createSlider: function () { throw new Error("no Slider control available"); },
				createRadioButtonGroup: function () { throw new Error("no RadioButtonGroup control available"); },
				createRadioButtonItem: function () { throw new Error("no RadioButtonItem control available"); }
			}
	};

	ColorPickerHelper = {
		getHelper: function () {
			if (Library.isLoaded("sap.m")) {
				return oMLibraryLoad;
			} else if (Library.isLoaded("sap.ui.unified")) {
				return  oCommonsLibraryLoad;
			}

			return oErrorLibraryLoad;
		}
	};

	return ColorPickerHelper;
});