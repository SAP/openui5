/*!
 * ${copyright}
 */

// Provides element sap.m.DynamicDateOption.
sap.ui.define([
	'sap/ui/core/Element',
	'./Label',
	'./StepInput',
	'sap/ui/unified/Calendar',
	'sap/ui/unified/DateRange',
	'sap/ui/unified/calendar/MonthPicker'],
	function(
		Element,
		Label,
		StepInput,
		Calendar,
		DateRange,
		MonthPicker) {
		"use strict";

		/**
		 * Constructor for a new DynamicDateOption.
		 *
		 * @param {string} [sId] id for the new control, generated automatically if no id is given
		 * @param {object} [mSettings] initial settings for the new control
		 *
		 * @class
		 * A base type for the options used by the DynamicDateRange control.
		 * @extends sap.ui.core.Element
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @public
		 * @since 1.92
		 * @alias sap.m.DynamicDateOption
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 * @experimental Since 1.92. This class is experimental and provides only limited functionality. Also the API might be changed in future.
		 */
		var DynamicDateOption = Element.extend("sap.m.DynamicDateOption", /** @lends sap.m.DynamicDateOption.prototype */ {
			metadata: {
				library: "sap.m",
				properties: {
					/**
					 * A key which identifies the option. The option produces
					 * DynamicDateRange values with operator same as the option key.
					 */
					key: { type: "string" },

					/**
					 * Defines the types of the option's parameters. Possible values for
					 * the array items are "date" and "int". A date range is usually represented
					 * with two consecutive "date" values.
					 */
					valueTypes: { type: "string[]", multiple: true }
				}
			}
		});

		/**
		 * Defines the option's label for the DynamicDateRange's list of options.
		 *
		 * @param {sap.m.DynamicDateRange} oControl The control instance
		 * which the label may depend on
		 * @returns {string} The option's label
		 * @public
		 */
		DynamicDateOption.prototype.getText = function(oControl) {
			return this.getKey();
		};

		/**
		 * Defines the UI types of the option. They are used to create predefined
		 * UI for the DynamicDateRange's value help dialog corresponding to this option.
		 * The types are DynamicDateValueHelpUIType instances. Their possible values are "date",
		 * "daterange", "month", "int". The created UI consists of Calendar or Input controls.
		 *
		 * @param {sap.m.DynamicDateRange} oControl The control instance
		 * @returns {sap.m.DynamicDateValueHelpUIType[]} An array with the option's UI types
		 * @public
		 */
		DynamicDateOption.prototype.getValueHelpUITypes = function(oControl) {
			throw new Error("Need implementation for method getValueHelpUITypes. Option: " + this.getKey());
		};

		/**
		 * Creates the option's value help UI. Mainly used for custom scenarios where
		 * getValueHelpUITypes is not enough to define the UI.
		 *
		 * @param {sap.m.DynamicDateRange} oControl The control instance
		 * @param {function} fnControlsUpdated A callback invoked when any of the created controls updates its value
		 * @returns {sap.ui.core.Control[]} An array with the option's value help UI controls
		 * @public
		 */
		DynamicDateOption.prototype.createValueHelpUI = function(oControl, fnControlsUpdated) {
			var oValue = oControl.getValue();
			var aParams = this.getValueHelpUITypes(oControl);
			var aControls = [];
			var oInputControl;

			if (!oControl.aControlsByParameters) {
				oControl.aControlsByParameters = {};
			}
			oControl.aControlsByParameters[this.getKey()] = [];

			for (var i = 0; i < aParams.length; i++) {
				if (aParams[i].getText()) {
					aControls.push(
						new Label({
							text: aParams[i].getText(),
							width: "100%"
						})
					);
				}

				oInputControl = this._createControl(i, aParams[i].getType(), oValue, fnControlsUpdated);

				aControls.push(oInputControl);
				oControl.aControlsByParameters[this.getKey()].push(oInputControl);
			}

			return aControls;
		};

		/**
		 * Gets the value help controls' output values and
		 * converts them to a DynamicDateRange value.
		 *
		 * @param {sap.m.DynamicDateRange} oControl The control instance
		 * @returns {object} A DynamicDateRange value
		 * @public
		 */
		DynamicDateOption.prototype.getValueHelpOutput = function(oControl) {
			var aParams = this.getValueHelpUITypes(oControl),
				aResult = {},
				vOutput;

			aResult.operator = this.getKey();

			aResult.values = [];

			for (var i = 0; i < aParams.length; i++) {
				var oInputControl = oControl.aControlsByParameters[this.getKey()][i];

				switch (aParams[i].getType()) {
					case "int":
						vOutput = oInputControl.getValue();
						break;
					case "month":
					case "date":
						if (!oInputControl.getSelectedDates().length) {
							return null;
						}

						vOutput = oInputControl.getSelectedDates()[0].getStartDate();
						break;
					case "daterange":
						if (!oInputControl.getSelectedDates().length) {
							return null;
						}

						var oEndDate = oInputControl.getSelectedDates()[0].getEndDate() || oInputControl.getSelectedDates()[0].getStartDate();
						vOutput = [oInputControl.getSelectedDates()[0].getStartDate(), oEndDate];
						break;
				}

				if (Array.isArray(vOutput)) {
					aResult.values = Array.prototype.concat.apply(aResult.values, vOutput);
				} else {
					vOutput && aResult.values.push(vOutput);
				}
			}

			return aResult;
		};

		/**
		 * Provides the order index of the option's group.
		 * Used for grouping within the options list inside a DynamicDateRange's popup.
		 * Standard options are arranged in 6 groups - from 1 to 6.
		 *
		 * @returns {int} A group index
		 * @public
		 */
		DynamicDateOption.prototype.getGroup = function() {
			return 0;
		};

		/**
		 * Provides the option's group header text.
		 *
		 * @returns {string} A group header
		 * @public
		 */
		DynamicDateOption.prototype.getGroupHeader = function() {
			return sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("DDR_OPTIONS_GROUP_0");
		};

		/**
		 * Formats the option's value to a string.
		 *
		 * @param {object} oValue A DynamicDateRange value
		 * @returns {string} A string representing this option's value
		 * @public
		 */
		DynamicDateOption.prototype.format = function(oValue) {
			throw new Error("Need implementation for method format. Option: " + this.getKey());
		};

		/**
		 * Parses a string to a DynamicDateRange value.
		 *
		 * @param {string} sValue An input string
		 * @returns {object} This option's DynamicDateRange value
		 * @public
		 */
		DynamicDateOption.prototype.parse = function(sValue) {
			throw new Error("Need implementation for method parse. Option: " + this.getKey());
		};

		/**
		 * Calculates an absolute date range from the options relative value.
		 *
		 * @param {object} oValue A DynamicDateRange value
		 * @returns {sap.ui.core.date.UniversalDate[]} A couple of dates marking the start and the end of the range
		 * @public
		 */
		DynamicDateOption.prototype.toDates = function(oValue) {
			throw new Error("Need implementation for method toDates. Option: " + this.getKey());
		};

		/**
		 * Controls whether the formatted date range should be concatenated to the
		 * formatted value when displayed.
		 *
		 * @returns {boolean} True if the formatted value should be enhanced
		 * @public
		 */
		DynamicDateOption.prototype.enhanceFormattedValue = function() {
			return false;
		};

		// PRIVATE

		DynamicDateOption.prototype._createControl = function(iIndex, sUIType, oValue, fnControlsUpdated) {
			var oInputControl;

			switch (sUIType) {
				case "int":
					oInputControl = this._createIntegerControl(oValue, iIndex, fnControlsUpdated);
					break;
				case "date":
					oInputControl = this._createDateControl(oValue, iIndex, fnControlsUpdated);
					break;
				case "daterange":
					oInputControl = this._createDateRangeControl(oValue, iIndex, fnControlsUpdated);
					break;
				case "month":
					oInputControl = this._createMonthControl(oValue, iIndex, fnControlsUpdated);
					break;
			}

			return oInputControl;
		};

		DynamicDateOption.prototype._createIntegerControl = function(oValue, iIndex, fnControlsUpdated) {
			var oControl = new StepInput({
				width: "120px"
			});

			if (oValue && this.getKey() === oValue.operator) {
				oControl.setValue(oValue.values[iIndex]);
			}

			if (fnControlsUpdated instanceof Function) {
				oControl.attachChange(fnControlsUpdated);
			}

			return oControl;
		};

		DynamicDateOption.prototype._createDateControl = function(oValue, iIndex, fnControlsUpdated) {
			var oControl = new Calendar({
				width: "100%"
			});

			if (oValue && this.getKey() === oValue.operator) {
				oControl.addSelectedDate(new DateRange({
					startDate: oValue.values[iIndex]
				}));
			}

			if (fnControlsUpdated instanceof Function) {
				oControl.attachSelect(fnControlsUpdated);
			}

			return oControl;
		};

		DynamicDateOption.prototype._createDateRangeControl = function(oValue, iIndex, fnControlsUpdated) {
			var oControl = new Calendar({
				intervalSelection: true,
				width: "100%"
			});
			if (oValue && this.getKey() === oValue.operator) {
				// a date range UI type maps to 2 consecutive date parameters from the value
				// they also should be the last 2 parameters
				oControl.addSelectedDate(new DateRange({
					startDate: oValue.values[iIndex],
					endDate: oValue.values[iIndex + 1]
				}));
			}

			if (fnControlsUpdated instanceof Function) {
				oControl.attachSelect(fnControlsUpdated);
			}

			return oControl;
		};

		DynamicDateOption.prototype._createMonthControl = function(oValue, iIndex, fnControlsUpdated) {
			var oControl = new MonthPicker(),
				oDate = new Date(),
				iMonth = (oValue && this.getKey() === oValue.operator) ? oValue.values[iIndex] : oDate.getMonth();

			oControl.setMonth(iMonth);
			oControl.addSelectedDate(new DateRange({
				startDate: oDate
			}));

			if (fnControlsUpdated instanceof Function) {
				oControl.attachSelect(fnControlsUpdated);
			}

			return oControl;
		};

		return DynamicDateOption;
	});