/*!
 * ${copyright}
 */

// Provides element sap.m.DynamicDateOption.
sap.ui.define([
	"sap/ui/core/Lib",
	'sap/ui/core/date/UI5Date',
	'sap/ui/core/Element',
	'./Label',
	'./StepInput',
	'./DateTimePicker',
	'sap/ui/unified/Calendar',
	'sap/ui/unified/DateRange',
	'sap/ui/unified/calendar/MonthPicker',
	'sap/ui/unified/calendar/CustomMonthPicker',
	'sap/ui/core/format/TimezoneUtil'
],
	function(
		Library,
		UI5Date,
		Element,
		Label,
		StepInput,
		DateTimePicker,
		Calendar,
		DateRange,
		MonthPicker,
		CustomMonthPicker,
		TimezoneUtil
	) {
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
					valueTypes: { type: "string[]" }
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
		 * Defines the UI types of the option. They are used to create predefined UI for
		 * the DynamicDateRange's value help dialog corresponding to this option.
		 * The types are DynamicDateValueHelpUIType instances. Their possible values are "date",
		 * "datetime", "daterange", "month", "int". The created UI consists of Calendar or Input controls.
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
		 * getValueHelpUITypes is not enough to define the UI. In custom options, you can
		 * create different controls that are used by the user to input data via interaction.
		 *
		 * @param {sap.m.DynamicDateRange} oControl The control instance
		 * @param {function(sap.ui.base.Event)} fnControlsUpdated A callback invoked when any of the created controls updates its value
		 * @returns {sap.ui.core.Control[]} An array with the option's value help UI controls
		 * @public
		 */
		DynamicDateOption.prototype.createValueHelpUI = function(oControl, fnControlsUpdated) {
			var oValue = oControl.getValue() && Object.assign({}, oControl.getValue()),
				aParams = this.getValueHelpUITypes(oControl),
				valueHelpUiTypesCount = aParams.length,
				aControls = [],
				oInputControl;

			if (!oControl.aControlsByParameters) {
				oControl.aControlsByParameters = {};
			}
			oControl.aControlsByParameters[this.getKey()] = [];

			if (oValue && oValue.values) {
				oValue.values = oValue.values.map(function(val) {
					return val;
				});
			}

			for (var i = 0; i < aParams.length; i++) {
				if (aParams[i].getText()) {
					aControls.push(
						new Label({
							text: aParams[i].getText(),
							width: "100%"
						})
					);
				}

				oInputControl = this._createControl(i, aParams[i].getType(), oValue, fnControlsUpdated, valueHelpUiTypesCount);

				aControls.push(oInputControl);
				oControl.aControlsByParameters[this.getKey()].push(oInputControl);
			}

			return aControls;
		};

		/**
		 * Validates all input controls in the value help UI related to the current option.
		 * If one of the input controls contains invalid value, then validation will return <code>false</code>.
		 * If all input controls contain valid value, then the validation will return <code>true</code>.
		 *
		 * @public
		 * @param {sap.m.DynamicDateRange} oControl The control instance
		 * @returns {boolean} value help UI validity indicator
		 */
		DynamicDateOption.prototype.validateValueHelpUI = function(oControl) {
			var aParams = this.getValueHelpUITypes();

			for (var i = 0; i < aParams.length; i++) {
				var oInputControl = oControl.aControlsByParameters[this.getKey()][i];

				switch (aParams[i].getType()) {
					case "int":
						if (oInputControl._isLessThanMin(oInputControl.getValue()) ||
							oInputControl._isMoreThanMax(oInputControl.getValue())) {
							return false;
						}
						break;
					case "month":
					case "custommonth":
					case "date":
					case "daterange":
						if (!oInputControl.getSelectedDates() || oInputControl.getSelectedDates().length == 0) {
							return false;
						}
						break;
					case "datetime":
						if (!oInputControl.getDateValue()) {
							return false;
						}
						break;
				}
			}

			return true;
		};

		/**
		 * Gets the value help controls' output values and
		 * converts them to a <code>sap.m.DynamicDateRangeValue</code>.
		 *
		 * @param {sap.m.DynamicDateRange} oControl The control instance
		 * @returns {sap.m.DynamicDateRangeValue} A <code>sap.m.DynamicDateRangeValue</code>
		 * @public
		 */
		DynamicDateOption.prototype.getValueHelpOutput = function(oControl) {
			var aParams = this.getValueHelpUITypes(),
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
					case "custommonth":
						if (!oInputControl.getSelectedDates() || !oInputControl.getSelectedDates().length) {
							return null;
						}

						vOutput = [oInputControl.getSelectedDates()[0].getStartDate().getMonth(), oInputControl.getSelectedDates()[0].getStartDate().getFullYear()];
						break;
					case "datetime":
						if (!oInputControl.getDateValue()) {
							return null;
						}

						vOutput = oInputControl.getDateValue();
						break;
					case "daterange":
						if (!oInputControl.getSelectedDates().length) {
							return null;
						}

						var oEndDate = oInputControl.getSelectedDates()[0].getEndDate() || oInputControl.getSelectedDates()[0].getStartDate();
						vOutput = [oInputControl.getSelectedDates()[0].getStartDate(), oEndDate];
						break;
					default:
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
		 * 1 - Single Dates
		 * 2 - Date Ranges
		 * 3 - Weeks
		 * 4 - Months
		 * 5 - Quarters
		 * 6 - Years
		 *
		 * @returns { int | string} A group key from {@link sap.m.DynamicDateRangeGroups}
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
			var iGroup = (this.getGroup() > -1 && this.getGroup() < 7) ? this.getGroup() : 0;
			return Library.getResourceBundleFor("sap.m").getText("DDR_OPTIONS_GROUP_" + iGroup);
		};

		/**
		 * Formats the option's value to a string.
		 *
		 * @param {sap.m.DynamicDateRangeValue} oValue A <code>sap.m.DynamicDateRangeValue</code>
		 * @returns {string} A string representing this option's value
		 * @public
		 */
		DynamicDateOption.prototype.format = function(oValue) {
			throw new Error("Need implementation for method format. Option: " + this.getKey());
		};

		/**
		 * Parses a string to a <code>sap.m.DynamicDateRangeValue</code>.
		 *
		 * @param {string} sValue An input string
		 * @returns {sap.m.DynamicDateRangeValue} This parsed value
		 * @public
		 */
		DynamicDateOption.prototype.parse = function(sValue) {
			throw new Error("Need implementation for method parse. Option: " + this.getKey());
		};

		/**
		 * Calculates an absolute date range from the options relative value.
		 *
		 * @param {sap.m.DynamicDateRangeValue} oValue A <code>sap.m.DynamicDateRangeValue</code>
	 	 * @param {string} sCalendarWeekNumbering The type of calendar week numbering
		 * @returns {sap.ui.core.date.UniversalDate[]} A couple of dates marking the start and the end of the range
		 * @public
		 */
		DynamicDateOption.prototype.toDates = function(oValue, sCalendarWeekNumbering) {
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

		DynamicDateOption.prototype._createControl = function(iIndex, sUIType, oValue, fnControlsUpdated, valueHelpUiTypesCount) {
			var oInputControl;

			switch (sUIType) {
				case "int":
					oInputControl = this._createIntegerControl(oValue, iIndex, fnControlsUpdated);
					break;
				case "date":
					oInputControl = this._createDateControl(oValue, iIndex, fnControlsUpdated);
					break;
				case "datetime":
					if (valueHelpUiTypesCount === 1) {
						// Returns DateTimePicker PopupContent control (single "datetime" option)
						oInputControl = this._createDateTimeInnerControl(oValue, iIndex, fnControlsUpdated);
					} else if (valueHelpUiTypesCount === 2) {
						oInputControl = this._createDateTimeControl(oValue, iIndex, fnControlsUpdated);
					}
					break;
				case "daterange":
					oInputControl = this._createDateRangeControl(oValue, iIndex, fnControlsUpdated);
					break;
				case "month":
					oInputControl = this._createMonthControl(oValue, iIndex, fnControlsUpdated);
					break;
				case "custommonth":
					oInputControl = this._createCustomMonthControl(oValue, iIndex, fnControlsUpdated);
					break;
				default:
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
				oControl.attachChange(function() {
					fnControlsUpdated(this);
				}, this);
			}

			return oControl;
		};

		DynamicDateOption.prototype._createDateTimeControl = function(oValue, iIndex, fnControlsUpdated, bUTC, sCalendarWeekNumbering) {
			var oControl = new DateTimePicker({
				timezone: TimezoneUtil.getLocalTimezone(),
				calendarWeekNumbering: sCalendarWeekNumbering
			});

			if (oValue && this.getKey() === oValue.operator) {
				oControl.setDateValue(oValue.values[iIndex]);
			}

			if (fnControlsUpdated instanceof Function) {
				oControl.attachChange(function() {
					fnControlsUpdated(this);
				}, this);
			}

			return oControl;
		};

		DynamicDateOption.prototype._createDateControl = function(oValue, iIndex, fnControlsUpdated, sCalendarWeekNumbering) {
			var oControl = new Calendar({
				width: "100%",
				calendarWeekNumbering: sCalendarWeekNumbering
			});
			var oInputControlValue;

			if (oValue && this.getKey() === oValue.operator) {
				oInputControlValue = UI5Date.getInstance(oValue.values[iIndex].getTime());

				oControl.addSelectedDate(new DateRange({
					startDate: oInputControlValue
				}));
			}

			if (fnControlsUpdated instanceof Function) {
				oControl.attachSelect(function() {
					fnControlsUpdated(this);
				}, this);
			}

			return oControl;
		};

		/**
		 * Returns DateTimePicker PopupContent control (single "datetime" option)
		 */
		DynamicDateOption.prototype._createDateTimeInnerControl = function(oValue, iIndex, fnControlsUpdated, sCalendarWeekNumbering) {
			var oControl = new DateTimePicker({
					width: "100%",
					calendarWeekNumbering: sCalendarWeekNumbering
				}),
				oPopupContent;

			// DateTimePicker is created, but only its internal PopupContent control is used
			oControl._createPopup();
			oControl._createPopupContent();
			oPopupContent = oControl._oPopupContent;
			oPopupContent.setForcePhoneView(true);
			oPopupContent.getCalendar().removeAllSelectedDates();

			if (oValue && this.getKey() === oValue.operator) {
				var oValueCopy = UI5Date.getInstance(oValue.values[iIndex]); // a copy is used to prevent time setting on pressing Cancel button

				oPopupContent.getCalendar().addSelectedDate(new DateRange({
					startDate: oValueCopy
				}));
				oPopupContent.getClocks()._setTimeValues(oValueCopy);
			}

			if (fnControlsUpdated instanceof Function) {
				// capture live clock changes and update the value
				oPopupContent.getClocks().getAggregation("_clocks").forEach(function(oClock) {
					oClock.attachChange(function(oEvent) {
						fnControlsUpdated(this);
					}.bind(this));
				}.bind(this));

				// capture live AM/PM changes and update the value
				if (oPopupContent.getClocks().getAggregation("_buttonAmPm")) {
					oPopupContent.getClocks().getAggregation("_buttonAmPm").attachSelectionChange(function(oEvent) {
						fnControlsUpdated(this);
					}.bind(this));
				}

				oPopupContent.getCalendar().attachSelect(function() {
					fnControlsUpdated(this);
				}, this);
			}

			return oPopupContent;
		};

		DynamicDateOption.prototype._createDateRangeControl = function(oValue, iIndex, fnControlsUpdated, sCalendarWeekNumbering) {
			var oControl = new Calendar({
				intervalSelection: true,
				width: "100%",
				calendarWeekNumbering: sCalendarWeekNumbering
			});
			if (oValue && this.getKey() === oValue.operator) {
				// a date range UI type maps to 2 consecutive date parameters from the value
				// they also should be the last 2 parameters
				var oInputControlStartValue = UI5Date.getInstance(oValue.values[iIndex].getTime());
				var oInputControlEndValue = UI5Date.getInstance(oValue.values[iIndex + 1].getTime());

				oControl.addSelectedDate(new DateRange({
					startDate: oInputControlStartValue,
					endDate: oInputControlEndValue
				}));
			}

			if (fnControlsUpdated instanceof Function) {
				oControl.attachSelect(function() {
					fnControlsUpdated(this);
				}, this);
			}

			return oControl;
		};

		DynamicDateOption.prototype._createMonthControl = function(oValue, iIndex, fnControlsUpdated) {
			var oControl = new MonthPicker(),
				oDate = UI5Date.getInstance(),
				iMonth = (oValue && this.getKey() === oValue.operator) ? oValue.values[iIndex] : oDate.getMonth();

			oControl.setMonth(iMonth);
			oControl.addSelectedDate(new DateRange({
				startDate: oDate
			}));

			if (fnControlsUpdated instanceof Function) {
				oControl.attachSelect(function() {
					fnControlsUpdated(this);
				}, this);
			}

			return oControl;
		};

		DynamicDateOption.prototype._createCustomMonthControl = function(oValue, iIndex, fnControlsUpdated) {
			var oControl = new CustomMonthPicker(),
				oDate = UI5Date.getInstance(),
				iMonth = (oValue && iIndex >= 0 && this.getKey() === oValue.operator) ? oValue.values[iIndex] : oDate.getMonth(),
				iYear = (oValue  && iIndex >= 0 && this.getKey() === oValue.operator) ? oValue.values[iIndex + 1] : oDate.getFullYear();

			oDate.setDate(1);
			oDate.setMonth(iMonth);
			oDate.setFullYear(iYear);
			oControl.addSelectedDate(new DateRange({
				startDate: oDate
			}));

			if (fnControlsUpdated instanceof Function) {
				oControl.attachSelect(function() {
					fnControlsUpdated(this);
				}, this);
			}

			return oControl;
		};

		return DynamicDateOption;
	});
