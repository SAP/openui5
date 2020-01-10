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

sap.ui.define(['sap/ui/base/Metadata', './OverflowToolbarButton', './OverflowToolbarToggleButton', './ToggleButton', './Button', 'sap/m/library', "sap/base/Log"],
	function(Metadata, OverflowToolbarButton, OverflowToolbarToggleButton, ToggleButton, Button, library, Log) {
		"use strict";

		// shortcut for sap.m.ButtonType
		var ButtonType = library.ButtonType;

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

			if (oButtonType === ButtonType.Default) {
				oControl.setProperty("type", ButtonType.Transparent, true);
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


		// OverflowToolbarToggleButton - same as ToggleButton, but also must add the _bInOverflow trigger
		OverflowToolbarAssociativePopoverControls.prototype._preProcessSapMOverflowToolbarToggleButton = function(oControl) {
			this._preProcessSapMToggleButton(oControl);
			oControl._bInOverflow = true;
		};

		OverflowToolbarAssociativePopoverControls.prototype._postProcessSapMOverflowToolbarToggleButton = function(oControl) {
			delete oControl._bInOverflow;
			this._postProcessSapMToggleButton(oControl);
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
			"sap.m.MenuButton": {
				canOverflow: true,
				listenForEvents: ["defaultAction", "_menuItemSelected"],
				noInvalidationProps: ["enabled", "text", "icon"]
			},
			"sap.m.OverflowToolbarButton": {
				canOverflow: true,
				listenForEvents: ["press"],
				noInvalidationProps: ["enabled", "type"]
			},
			"sap.m.OverflowToolbarToggleButton": {
				canOverflow: true,
				listenForEvents: ["press"],
				noInvalidationProps: ["enabled", "type", "pressed"]
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
			},
			"sap.m.IconTabHeader": {
				canOverflow: false,
				listenForEvents: [],
				noInvalidationProps: ["selectedKey"]
			},
			"sap.ui.comp.smartfield.SmartField": {
				canOverflow: true,
				listenForEvents: ["change"],
				noInvalidationProps: ["enabled", "value", "valueState", "showValueHelp", "contextEditable",
					"clientSideMandatoryCheck", "mandatory", "name", "placeholder", "showSuggestion", "tooltipLabel"]
			},
			"sap.ui.comp.smartfield.SmartLabel": {
				canOverflow: true,
				listenForEvents: [],
				noInvalidationProps: ["enabled"]
			}
		};

		/**
		 * Returns the control configuration for a given control
		 * @param oControl - control instance object
		 * @returns {*}
		 */
		OverflowToolbarAssociativePopoverControls.getControlConfig = function(oControl) {
			var oConfig;

			// First check if the control's class implements the sap.m.IOverflowToolbarContent interface
			if (oControl.getMetadata().getInterfaces().indexOf("sap.m.IOverflowToolbarContent") !== -1) {
				if (typeof oControl.getOverflowToolbarConfig !== "function") {
					Log.error("Required method getOverflowToolbarConfig not implemented by: " + oControl.getMetadata().getName());
					return;
				}

				oConfig = oControl.getOverflowToolbarConfig();
				if (typeof oConfig !== "object") {
					Log.error("Method getOverflowToolbarConfig implemented, but does not return an object in: " + oControl.getMetadata().getName());
					return;
				}

				return {
					canOverflow: !!oConfig.canOverflow,
					listenForEvents: Array.isArray(oConfig.autoCloseEvents) ? oConfig.autoCloseEvents : [],
					noInvalidationProps: Array.isArray(oConfig.propsUnrelatedToSize) ? oConfig.propsUnrelatedToSize : [],
					preProcess: oConfig.onBeforeEnterOverflow,
					postProcess: oConfig.onAfterExitOverflow
				};
			}

			// The interface is not implemented - check the _mSupportedControls array (legacy scenario)
			var sClassName = OverflowToolbarAssociativePopoverControls.getControlClass(oControl);
			oConfig = OverflowToolbarAssociativePopoverControls._mSupportedControls[sClassName];

			if (oConfig === undefined) {
				return;
			}

			var sPreProcessFnName = "_preProcess" + sClassName.split(".").map(fnCapitalize).join("");
			if (typeof OverflowToolbarAssociativePopoverControls.prototype[sPreProcessFnName] === "function") {
				oConfig.preProcess = OverflowToolbarAssociativePopoverControls.prototype[sPreProcessFnName];
			}

			var sPostProcessFnName = "_postProcess" + sClassName.split(".").map(fnCapitalize).join("");
			if (typeof OverflowToolbarAssociativePopoverControls.prototype[sPostProcessFnName] === "function") {
				oConfig.postProcess = OverflowToolbarAssociativePopoverControls.prototype[sPostProcessFnName];
			}

			return oConfig;
		};

		/**
		 * Tells if a control is supported by the associative popover (i.e. can overflow to it)
		 * @param oControl - control instance object
		 * @returns {boolean}
		 */
		OverflowToolbarAssociativePopoverControls.supportsControl = function(oControl) {
			var oCtrlConfig = OverflowToolbarAssociativePopoverControls.getControlConfig(oControl);
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
			} else if (oControl instanceof OverflowToolbarToggleButton) {
				return "sap.m.OverflowToolbarToggleButton";
			} else if (oControl instanceof ToggleButton) {
				return "sap.m.ToggleButton";
			} else if (oControl instanceof Button) {
				return "sap.m.Button";
			}

			// All other controls must be the standard sap.m class in order to overflow
			return oControl.getMetadata().getName();
		};

		function fnCapitalize(sName) {
			return sName.substring(0, 1).toUpperCase() + sName.substr(1);
		}

		return OverflowToolbarAssociativePopoverControls;
	});