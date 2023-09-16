/*!
 * ${copyright}
 */

// Provides helper sap.ui.unified.ColorPickerHelper.
sap.ui.define([
	'sap/ui/core/Lib'
], function(
	Library
) {
	"use strict";
	var ColorPickerHelper;

	var oMLibraryLoad = {
		isResponsive: function () {
			return true;
		},
		factory: {
			createLabel: function (mConfig) {
				return new sap.m.Label(mConfig);
			},
			createInput: function (sId, mConfig) {
				return new sap.m.InputBase(sId, mConfig);
			},
			createSlider: function (sId, mConfig) {
				return new sap.m.Slider(sId, mConfig);
			},
			createRadioButtonGroup: function (mConfig) {
				return new sap.m.RadioButtonGroup(mConfig);
			},
			createRadioButtonItem: function (mConfig) {
				return new sap.m.RadioButton(mConfig);
			},
			createButton: function (sId, mConfig) {
				return new sap.m.Button(sId, mConfig);
			}
		}
	};

	var oCommonsLibraryLoad = {
		isResponsive: function () {
			return false;
		},
		factory: {
			createLabel: function (mConfig) {
				return new sap.ui.commons.Label(mConfig);
			},
			createInput: function (sId, mConfig) {
				return new sap.ui.commons.TextField(sId, mConfig);
			},
			createSlider: function (sId, mConfig) {
				if (mConfig && mConfig.step) {
					mConfig.smallStepWidth = mConfig.step;
					delete mConfig.step;
				}
				return new sap.ui.commons.Slider(sId, mConfig);
			},
			createRadioButtonGroup: function (mConfig) {
				if (mConfig && mConfig.buttons) {
					mConfig.items = mConfig.buttons;
					delete mConfig.buttons;
				}
				return new sap.ui.commons.RadioButtonGroup(mConfig);
			},
			createRadioButtonItem: function (mConfig) {
				return new sap.ui.core.Item(mConfig);
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