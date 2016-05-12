/*!
 * ${copyright}
 */

/**
 * OverflowToolbar / OverflowToolbarAssociativePopover helper
 * This class handles the changes done to controls with respect to the associative popover
 * For each control that must have a special handling before entering/leaving the popover, there must be 2 functions:
 * _preProcessCONTROL (called before moving the control to the popover)
 * _postProcessCONTROL (called before returning the control to the toolbar)
 * where CONTROL is a camel-cased version of the getMetadata().getName() value, f.e. "sap.m.Button" becomes "sapMButton"
 */

sap.ui.define(['jquery.sap.global', 'sap/ui/base/Metadata', './OverflowToolbarButton', './ToggleButton', './Button'],
	function(jQuery, Metadata, OverflowToolbarButton, ToggleButton, Button) {
		"use strict";

		var OverflowToolbarAssociativePopoverControls = Metadata.createClass("sap.m._overflowToolbarHelpers.OverflowToolbarAssociativePopoverControls", {
			/**
			 * @private
			 */
			constructor: function() {
				this._mControlsCache = {};
			}
		});

		// Button - modifications similar to action sheet
		OverflowToolbarAssociativePopoverControls.prototype._preProcessSapMButton = function(oControl) {
			var oButtonType = oControl.getType();

			this._mControlsCache[oControl.getId()] = {
				buttonType: oButtonType
			};

			if (oButtonType === sap.m.ButtonType.Default) {
				oControl.setProperty("type", sap.m.ButtonType.Transparent, true);
			}

			// Set some css classes to apply the proper paddings in cases of buttons with/without icons
			if (oControl.getIcon()) {
				oControl.addStyleClass("sapMOTAPButtonWithIcon");
			} else {
				oControl.addStyleClass("sapMOTAPButtonNoIcon");
			}

			oControl.attachEvent("_change", this._onSapMButtonUpdated, this);
		};

		OverflowToolbarAssociativePopoverControls.prototype._postProcessSapMButton = function(oControl) {
			var oPrevState = this._mControlsCache[oControl.getId()];

			if (oControl.getType() !== oPrevState.buttonType) {
				oControl.setProperty("type", oPrevState.buttonType, true);
			}

			oControl.removeStyleClass("sapMOTAPButtonNoIcon");
			oControl.removeStyleClass("sapMOTAPButtonWithIcon");

			oControl.detachEvent("_change", this._onSapMButtonUpdated, this);
		};

		OverflowToolbarAssociativePopoverControls.prototype._onSapMButtonUpdated = function(oEvent) {
			var sParameterName = oEvent.getParameter("name"),
				oButton = oEvent.getSource(),
				sButtonId = oButton.getId();

			if (typeof this._mControlsCache[sButtonId] === "undefined") {
				return;
			}

			if (sParameterName === "type") {
				this._mControlsCache[sButtonId]["buttonType"] = oButton.getType();
			}
		};


		// OverflowToolbarButton - same as Button, but also must add the _bInOverflow trigger
		OverflowToolbarAssociativePopoverControls.prototype._preProcessSapMOverflowToolbarButton = function(oControl) {
			this._preProcessSapMButton(oControl);
			oControl._bInOverflow = true;
		};

		OverflowToolbarAssociativePopoverControls.prototype._postProcessSapMOverflowToolbarButton = function(oControl) {
			delete oControl._bInOverflow;
			this._postProcessSapMButton(oControl);
		};


		// ToggleButton - same as button
		OverflowToolbarAssociativePopoverControls.prototype._preProcessSapMToggleButton = function(oControl) {
			this._preProcessSapMButton(oControl);
		};

		OverflowToolbarAssociativePopoverControls.prototype._postProcessSapMToggleButton = function(oControl) {
			this._postProcessSapMButton(oControl);
		};


		// SegmentedButton - switch to/from select mode
		OverflowToolbarAssociativePopoverControls.prototype._preProcessSapMSegmentedButton = function(oControl) {
			oControl._toSelectMode();
		};

		OverflowToolbarAssociativePopoverControls.prototype._postProcessSapMSegmentedButton = function(oControl) {
			oControl._toNormalMode();
		};

		// Select - turn off icon only mode while in the popover
		OverflowToolbarAssociativePopoverControls.prototype._preProcessSapMSelect = function(oControl) {
			this._mControlsCache[oControl.getId()] = {
				selectType: oControl.getType()
			};

			if (oControl.getType() !== sap.m.SelectType.Default) {
				oControl.setProperty("type", sap.m.SelectType.Default, true);
			}
		};

		OverflowToolbarAssociativePopoverControls.prototype._postProcessSapMSelect = function(oControl) {
			var oPrevState = this._mControlsCache[oControl.getId()];

			if (oControl.getType() !== oPrevState.selectType) {
				oControl.setProperty("type", oPrevState.selectType, true);
			}
		};

		/******************************   STATIC properties and methods   ****************************/

		/**
		 * A map of all controls that are commonly found in an overflow toolbar
		 * canOverflow - tells if the control can go to the popover or is forced to always stay in the toolbar (f.e. labels, radio buttons can never overflow)
		 * listenForEvents - all events that, when fired, suggest that the interaction with the control is over and the popup must be closed (f.e. button click, select change)
		 * noInvalidationProps - all properties of a control that, when changed, do not affect the size of the control, thus don't require a re-rendering of the toolbar (f.e. input value)
		 * @private
		 */
		OverflowToolbarAssociativePopoverControls._mSupportedControls = {
			"sap.m.Button": {
				canOverflow: true,
				listenForEvents: ["press"],
				noInvalidationProps: ["enabled", "type"]
			},
			"sap.m.OverflowToolbarButton": {
				canOverflow: true,
				listenForEvents: ["press"],
				noInvalidationProps: ["enabled", "type"]
			},
			"sap.m.CheckBox": {
				canOverflow: true,
				listenForEvents: ["select"],
				noInvalidationProps: ["enabled", "selected"]
			},
			"sap.m.ToggleButton": {
				canOverflow: true,
				listenForEvents: ["press"],
				noInvalidationProps: ["enabled", "pressed"]
			},
			"sap.m.Select": {
				canOverflow: true,
				listenForEvents: ["change"],
				noInvalidationProps: ["enabled", "selectedItemId", "selectedKey"]
			},
			"sap.m.ComboBox": {
				canOverflow: true,
				listenForEvents: [],
				noInvalidationProps: ["enabled", "value", "selectedItemId", "selectedKey"]
			},
			"sap.m.SearchField": {
				canOverflow: true,
				listenForEvents: ["search"],
				noInvalidationProps: ["enabled", "value", "selectOnFocus"]
			},
			"sap.m.SegmentedButton": {
				canOverflow: true,
				listenForEvents: ["select"],
				noInvalidationProps: ["enabled", "selectedKey"]
			},
			"sap.m.Input": {
				canOverflow: true,
				listenForEvents: [],
				noInvalidationProps: ["enabled", "value"]
			},
			"sap.m.DateTimeInput": {
				canOverflow: true,
				listenForEvents: ["change"],
				noInvalidationProps: ["enabled", "value", "dateValue"]
			},
			"sap.m.DatePicker": {
				canOverflow: true,
				listenForEvents: ["change"],
				noInvalidationProps: ["enabled", "value", "dateValue", "displayFormat", "valueFormat", "displayFormatType", "secondaryCalendarType", "minDate", "maxDate"]
			},
			"sap.m.DateTimePicker": {
				canOverflow: true,
				listenForEvents: ["change"],
				noInvalidationProps: ["enabled", "value", "dateValue", "displayFormat", "valueFormat", "displayFormatType", "secondaryCalendarType", "minDate", "maxDate"]
			},
			"sap.m.TimePicker": {
				canOverflow: true,
				listenForEvents: ["change"],
				noInvalidationProps: ["enabled", "value", "dateValue", "displayFormat", "valueFormat"]
			},
			"sap.m.RadioButton": {
				canOverflow: false,
				listenForEvents: [],
				noInvalidationProps: ["enabled", "selected"]
			},
			"sap.m.Slider": {
				canOverflow: false,
				listenForEvents: [],
				noInvalidationProps: ["enabled", "value"]
			}
		};

		/**
		 * Returns the control configuration for a given control
		 * @param oControl - control instance object
		 * @returns {*}
		 */
		OverflowToolbarAssociativePopoverControls.getControlConfig = function(oControl) {
			var sClassName = OverflowToolbarAssociativePopoverControls.getControlClass(oControl);
			return OverflowToolbarAssociativePopoverControls._mSupportedControls[sClassName];
		};

		/**
		 * Tells if a control is supported by the associative popover (i.e. can overflow to it)
		 * @param oControl - control instance object
		 * @returns {boolean}
		 */
		OverflowToolbarAssociativePopoverControls.supportsControl = function(oControl) {
			var sClassName = OverflowToolbarAssociativePopoverControls.getControlClass(oControl);
			var oCtrlConfig = OverflowToolbarAssociativePopoverControls._mSupportedControls[sClassName];
			return typeof oCtrlConfig !== "undefined" && oCtrlConfig.canOverflow;
		};


		/**
		 * Returns the class of a control in terms of overflow behavior
		 * This is needed so that for example a custom button, extending sap.m.Button, can overflow too
		 * @param oControl
		 */
		OverflowToolbarAssociativePopoverControls.getControlClass = function(oControl) {

			// For now only custom classes, extending the sap.m.Button and its derivatives, are supported for overflow
			if (oControl instanceof OverflowToolbarButton) {
				return "sap.m.OverflowToolbarButton";
			} else if (oControl instanceof ToggleButton) {
				return "sap.m.ToggleButton";
			} else if (oControl instanceof Button) {
				return "sap.m.Button";
			}

			// All other controls must be the standard sap.m class in order to overflow
			return oControl.getMetadata().getName();
		};

		return OverflowToolbarAssociativePopoverControls;

}, /* bExport= */ false);