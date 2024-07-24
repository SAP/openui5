/*!
 * ${copyright}
 */

// Provides control sap.m.DateRangeSelection.
sap.ui.define([
	"sap/base/i18n/Formatting",
	'sap/ui/Device',
	'./DatePicker',
	'./library',
	"sap/ui/core/Lib",
	"sap/ui/core/Locale",
	'sap/ui/core/LocaleData',
	'sap/ui/core/format/DateFormat',
	'sap/ui/core/date/UniversalDate',
	'./DateRangeSelectionRenderer',
	"sap/ui/unified/calendar/CustomMonthPicker",
	"sap/ui/unified/calendar/CustomYearPicker",
	"sap/base/util/deepEqual",
	"sap/base/Log",
	"sap/base/assert",
	"sap/ui/core/date/UI5Date",
	// jQuery Plugin "cursorPos"
	"sap/ui/dom/jquery/cursorPos"
],
	function(
		Formatting,
		Device,
		DatePicker,
		library,
		Library,
		Locale,
		LocaleData,
		DateFormat,
		UniversalDate,
		DateRangeSelectionRenderer,
		CustomMonthPicker,
		CustomYearPicker,
		deepEqual,
		Log,
		assert,
		UI5Date
	) {
		"use strict";

		/**
		 * Constructor for a new <code>DateRangeSelection</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * A single-field input control that enables the users to enter a localized date range (between 0001-01-01 and 9999-12-31).
		 *
		 * <h3>Overview</h3>
		 *
		 * The <code>DateRangeSelection</code> enables the users to enter a localized
		 * date range using touch, mouse, keyboard input, or by selecting a date range in
		 * the calendar. They can also navigate directly from one month or year to another.
		 *
		 * <b>Note:</b>
		 * The control is not UTC aware and the selected date range starts from 00:00:00:000 of the first date and ends in 23:59:59:999 on the second date.
		 *
		 * The application developer should add dependency to <code>sap.ui.unified</code> library
		 * on application level to ensure that the library is loaded before the module dependencies will be required.
		 * The {@link sap.ui.unified.Calendar} is used internally only if the
		 * <code>DateRangeSelection</code> is opened (not used for the initial rendering).
		 * If the <code>sap.ui.unified</code> library is not loaded before the
		 * <code>DateRangeSelection</code> is opened, it will be loaded upon opening.
		 * This could lead to CSP compliance issues and adds an additional waiting time when the <code>DateRangeSelection</code> is
		 * opened for the first time. To prevent this, apps using the
		 * <code>DateRangeSelection</code> should also load the <code>sap.ui.unified</code>
		 * library in advance.
		 *
		 * <h3>Usage</h3>
		 *
		 * <i>When to use?</i>
		 *
		 * If you need a date range and know that your user is a power user who has to
		 * input lots of data. If the keyboard is the primary device used for navigating
		 * the app, use two input fields. This allows the user to quickly jump from field
		 * to field. By selecting a date in one of the fields, the other field should
		 * recognize the information and jump to the same selection.
		 *
		 * <i>When not to use?</i>
		 *
		 * If the user's primary goal is not to select ranges or if you just want to enter
		 * a date and a time. For such cases, use the {@link sap.m.DatePicker} or
		 * {@link sap.m.TimePicker}.
		 *
		 * The user can enter a date by:
		 * <ul><li>Using the calendar that opens in a popup</li>
		 * <li>Typing it directly in the input field</li></ul>
		 *
		 * On app level, there are two options to provide a date for the
		 * <code>DateRangeSelection</code> - date range as a string to the
		 * <code>value</code> property or UI5Date/JavaScript Date objects to the
		 * <code>dateValue</code> and <code>secondDateValue</code> properties (only one of
		 * these options should be used at a time):
		 *
		 * <ul><li>Use the <code>value</code> property if the date range is already provided as
		 * a formatted string</li>
		 * <caption> binding the <code>value</code> property by using types </caption>
		 * <pre>
		 * new sap.ui.model.json.JSONModel({start:'2022-11-10', end:'2022-11-15'});
		 *
		 * new sap.m.DateRangeSelection({
		 *     value: {
		 *         type: "sap.ui.model.type.DateInterval",
		 *         parts: [{
		 *             type: "sap.ui.model.type.Date",
		 *             path: "/start",
		 *             formatOptions: {
		 *                 source: {
		 *                     pattern: "yyyy-MM-dd"
		 *                 }
		 *             }
		 *         },
		 *         {
		 *             type: "sap.ui.model.type.Date",
		 *             path:"/end",
		 *             formatOptions: {
		 *             source: {
		 *                 pattern: "yyyy-MM-dd"
		 *             }
		 *         }}]
		 *     }
		 * });
		 * </pre>
		 * <b>Note:</b> There are multiple binding type choices, such as:
		 * sap.ui.model.type.Date
		 * sap.ui.model.odata.type.DateTime
		 * sap.ui.model.odata.type.DateTimeOffset
		 * See {@link sap.ui.model.type.Date}, {@link sap.ui.model.odata.type.DateTime} or {@link sap.ui.model.odata.type.DateTimeOffset}
		 *
		 * <li>Use the <code>dateValue</code> and <code>secondDateValue</code> properties
		 * if the date range is already provided as UI5Date or JavaScript Date objects or you want to
		 * work with UI5Date or JavaScript Date objects</li></ul>
		 *
		 * <h3>Formatting</h3>
		 *
		 * All formatting and parsing of dates from and to strings is done using the
		 * {@link sap.ui.core.format.DateFormat}. If a date is entered by typing it into
		 * the input field, it must fit to the used date format and locale.
		 *
		 * Supported format options are pattern-based on Unicode LDML Date Format notation.
		 * See {@link http://unicode.org/reports/tr35/#Date_Field_Symbol_Table}
		 *
		 * For example, if the <code>displayFormat</code> is "MMM d, y", delimiter is "-",
		 * and the used locale is English, a valid value string is "Jul 29, 2015 - Jul 31,
		 * 2015" and it is displayed in the same way in the input field.
		 *
		 * If no placeholder is set to the <code>DateRangeSelection</code>, the used
		 * <code>displayFormat</code> is displayed as a placeholder. If another placeholder
		 * is needed, it must be set.
		 *
		 * <b>Note:</b> If the string does NOT match the <code>displayFormat</code>
		 * (from user input) or the <code>valueFormat</code> (on app level), the
		 * {@link sap.ui.core.format.DateFormat} makes an attempt to parse it based on the
		 * locale settings. For more information, see the respective documentation in the
		 * API Reference.
		 *
		 * <h3>Responsive behavior</h3>
		 *
		 * The <code>DateRangeSelection</code> is fully responsive. It is smaller in
		 * compact mode and provides a touch-friendly size in cozy mode.
		 *
		 * @extends sap.m.DatePicker
		 * @version ${version}
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.22.0
		 * @alias sap.m.DateRangeSelection
		 */
		var DateRangeSelection = DatePicker.extend("sap.m.DateRangeSelection", /** @lends sap.m.DateRangeSelection.prototype */ {
			metadata : {

				library : "sap.m",
				properties : {
					/**
					 * Delimiter between start and end date. Default value is "-".
					 * If no delimiter is given, the one defined for the used locale is used.
					 */
					delimiter : {type : "string", group : "Misc", defaultValue : '-'},

					/**
					 * The end date of the range as UI5Date or JavaScript Date object. This is independent from any formatter.
					 *
					 * <b>Note:</b> If this property is used, the <code>value</code> property should not be changed from the caller.
					 */
					secondDateValue : {type : "object", group : "Data", defaultValue : null}
				},
				designtime: "sap/m/designtime/DateRangeSelection.designtime",
				dnd: { draggable: false, droppable: true }
			},

			renderer: DateRangeSelectionRenderer
		});

		var HYPHEN = String.fromCharCode(45),
			ENDASH = String.fromCharCode(8211),
			EMDASH = String.fromCharCode(8212);

		/* eslint-disable no-lonely-if */

		DateRangeSelection.prototype.init = function(){

			DatePicker.prototype.init.apply(this, arguments);

			this._bIntervalSelection = true;

		};

		/**
		 * Override DatePicker's '_createPopupContent' in order to add support for months and years range selection
		 * @override
		 */
		DateRangeSelection.prototype._createPopupContent = function() {
			DatePicker.prototype._createPopupContent.apply(this, arguments);

			var oCalendar = this._getCalendar();

			if (oCalendar instanceof CustomMonthPicker) {
				oCalendar._getMonthPicker().setIntervalSelection(true);
			}

			if (oCalendar instanceof CustomYearPicker) {
				oCalendar._getYearPicker().setIntervalSelection(true);
			}

			this._getCalendar().detachWeekNumberSelect(this._handleWeekSelect, this);
			this._getCalendar().attachWeekNumberSelect(this._handleWeekSelect, this);
			this._getCalendar().getSelectedDates()[0].setStartDate(this._oDateRange.getStartDate());
			this._getCalendar().getSelectedDates()[0].setEndDate(this._oDateRange.getEndDate());
		};

		DateRangeSelection.prototype.onkeypress = function(oEvent){

			// the keypress event should be fired only when a character key is pressed,
			// unfortunately some browsers fire the keypress event for control keys as well.
			if (!oEvent.charCode || oEvent.metaKey || oEvent.ctrlKey) {
				return;
			}

			var oFormatter = _getFormatter.call(this);
			var sDelimiter = _getDelimiter.call(this);
			var sAllowedCharacters = oFormatter.sAllowedCharacters + sDelimiter + " ";
			var sChar = String.fromCharCode(oEvent.charCode);

			if (sChar && oFormatter.sAllowedCharacters && sAllowedCharacters.indexOf(sChar) < 0) {
				oEvent.preventDefault();
			}
		};

		DateRangeSelection.prototype._getPlaceholder = function() {
			var sPlaceholder = this.getPlaceholder(),
				oBinding,
				oBindingType,
				oLocale,
				oLocaleData,
				oFormatOptions;

			if (!sPlaceholder) {
				oBinding = this.getBinding("value");
				oLocale = new Locale(Formatting.getLanguageTag());
				oLocaleData = LocaleData.getInstance(oLocale);

				if (oBinding && oBinding.getType() && oBinding.getType().isA("sap.ui.model.type.DateInterval")) {
					oBindingType = oBinding.getType();

					if (oBindingType.oFormatOptions && oBindingType.oFormatOptions.format) {
						sPlaceholder = oLocaleData.getCustomDateTimePattern(oBindingType.oFormatOptions.format);
					} else {
						oFormatOptions = Object.assign({ interval: true, singleIntervalValue: true }, oBindingType.oFormatOptions);
						return this._getDateFormatPlaceholderText(oFormatOptions);
					}
				} else {
					sPlaceholder = this.getDisplayFormat();

					if (!sPlaceholder) {
						sPlaceholder = "medium";
					}

					if (this._checkStyle(sPlaceholder)) {
						oFormatOptions = Object.assign({ interval: true, singleIntervalValue: true, intervalDelimiter: _getDelimiter.call(this) }, _getFormatter.call(this).oFormatOptions);
						return  this._getDateFormatPlaceholderText(oFormatOptions);
					}
				}

				var sDelimiter = _getDelimiter.call(this);
				if (sDelimiter && sDelimiter !== "") {
					sPlaceholder = sPlaceholder + " " + sDelimiter + " " + sPlaceholder;
				}
			}

			return sPlaceholder;
		};

		/**
		 * Returns the message bundle key of the invisible text for the accessible name of the popover.
		 * @private
		 * @returns {string} The message bundle key
		 */
		DateRangeSelection.prototype._getAccessibleNameLabel = function() {
			return "DATERANGESELECTION_POPOVER_ACCESSIBLE_NAME";
		};

		DateRangeSelection.prototype._getDateFormatPlaceholderText = function (oFormatOptions) {
			return  DateFormat.getDateInstance(oFormatOptions).getPlaceholderText();
		};

		// Overwrite DatePicker's setValue to support two date range processing
		/**
		 * Getter for property <code>value</code>.
		 *
		 * Returns a date as a string in the format defined in property <code>displayFormat</code>.
		 *
		 * <b>Note:</b> As the value string always used the <code>displayFormat</code>, it is both locale-dependent and calendar-type-dependent.
		 *
		 * If this property is used, the <code>dateValue</code> property should not be changed from the caller.
		 *
		 * @returns {string} the value of property <code>value</code>
		 * @public
		 * @name sap.m.DateRangeSelection#getValue
		 * @function
		 */

		/**
		 * Setter for property <code>value</code>.
		 *
		 * Expects a date as a string in the format defined in property <code>displayFormat</code>.
		 *
		 * <b>Note:</b> As the value string always used the <code>displayFormat</code>, it is both locale-dependent and calendar-type-dependent.
		 *
		 * If this property is used, the <code>dateValue</code> property should not be changed from the caller.
		 *
		 * @param {string} sValue The new value of the input.
		 * @returns {this} Reference to <code>this</code> for method chaining
		 * @public
		 */
		DateRangeSelection.prototype.setValue = function(sValue) {
			var aDates;

			sValue = this.validateProperty("value", sValue);

			if (sValue !== this.getValue()) {
				this.setLastValue(sValue);
			} else {
				return this;
			}

			aDates = this._parseAndValidateValue(sValue);
			this.setProperty("dateValue", this._normalizeDateValue(aDates[0]), this._bPreferUserInteraction);
			this.setProperty("secondDateValue", this._normalizeDateValue(aDates[1]), this._bPreferUserInteraction);

			this._formatValueAndUpdateOutput(aDates);
			this.setProperty("value", sValue, this._bPreferUserInteraction);

			return this;

		};

		DateRangeSelection.prototype._parseAndValidateValue = function(sValue) {
			this._bValid = true;

			// Convert to date object(s)
			var aDates = [undefined, undefined];

			if (sValue) {
				aDates = this._parseValue(sValue);
				if (!_dateRangeValidityCheck.call(this, aDates[0], aDates[1])[0]) {//aDates can be undefined if don't fit to the min/max range
					this._bValid = false;
					Log.warning("Value can not be converted to a valid dates", this);
				}
			}

			return aDates;
		};

		DateRangeSelection.prototype._formatValueAndUpdateOutput = function(aDates) {
			if (!this.getDomRef()) {
				return;
			}

			// Convert to output
			var sOutputValue = this._formatValue(aDates[0], aDates[1]);

			if (this._bPreferUserInteraction) {
				// Handle the value concurrency before setting the value property of the control,
				// in order to distinguish whether the user only focused the input field or typed in it
				this.handleInputValueConcurrency(sOutputValue);
			} else if (this._$input.val() !== sOutputValue) {
				// update the DOM value when necessary
				// otherwise cursor can go to the end of text unnecessarily
				this._$input.val(sOutputValue);
				this._curpos = this._$input.cursorPos();
			}
		};

		/**
		 * Converts the parameter to a UI5Date or JavaScript Date, if it is a timestamp integer.
		 * @param {Date|module:sap/ui/core/date/UI5Date|int} vBindingDate A timestamp or a date instance
		 * @returns {Date|module:sap/ui/core/date/UI5Date} A date instance
		 * @private
		 */
		DateRangeSelection.prototype._normalizeDateValue = function(vBindingDate) {
			switch (typeof vBindingDate) {
				case "number":
					return UI5Date.getInstance(vBindingDate);
				case "string":
					return _getFormatter.call(this).parse(vBindingDate);
				default:
					return vBindingDate;
			}
		};

		/**
		 * Converts the parameter to a timestamp integer, if it is a UI5Date or JavaScript Date.
		 * @param {Date|module:sap/ui/core/date/UI5Date|int} vBindingDate A timestamp or a date instance
		 * @returns {int} A timestamp integer
		 * @private
		 */
		DateRangeSelection.prototype._denormalizeDateValue = function(vBindingDate) {
			return (vBindingDate && vBindingDate.getTime) ? vBindingDate.getTime() : vBindingDate;
		};

		/**
		 * Getter for property <code>valueFormat</code>.
		 *
		 * <b>Note:</b> Property <code>valueFormat</code> is not supported in the <code>sap.m.DateRangeSelection</code> control.
		 *
		 * @returns {string} the value of property valueFormat
		 * @public
		 * @name sap.m.DateRangeSelection#getValueFormat
		 * @function
		 */

		/**
		 * Setter for property <code>valueFormat</code>.
		 *
		 * <b>Note:</b> Property <code>valueFormat</code> is not supported in the <code>sap.m.DateRangeSelection</code> control.
		 *
		 * @param {string} sValueFormat New value for property valueFormat
		 * @returns {this} Reference to <code>this</code> for method chaining
		 * @public
		 */
		DateRangeSelection.prototype.setValueFormat = function(sValueFormat) {

			// if valueFormat changes the value must be parsed again

			this.setProperty("valueFormat", sValueFormat, true); // no rerendering

			Log.warning("Property valueFormat is not supported in sap.m.DateRangeSelection control.", this);

			return this;

		};

		/**
		 * Sets the displayFormat of the DatePicker.
		 *
		 * @param {string} sDisplayFormat  new value for <code>displayFormat</code>
		 * @returns {this} Reference to <code>this</code> for method chaining
		 * @public
		 */
		DateRangeSelection.prototype.setDisplayFormat = function(sDisplayFormat) {

			// if displayFormat changes the value must be formatted again

			DatePicker.prototype.setDisplayFormat.apply(this, arguments);

			var sOutputValue = this._formatValue(this.getDateValue(), this.getSecondDateValue());

			// as value also used displayFormat update value too
			this.setProperty("value", sOutputValue, true); // no rerendering

			if (this.getDomRef() && (this._$input.val() !== sOutputValue)) {
				this._$input.val(sOutputValue);
				this._curpos = this._$input.cursorPos();
			}

			return this;

		};

		// Overwrite DatePicker's setDateValue to support two date range processing

		/**
		 * Getter for property <code>dateValue</code>.
		 *
		 * The start date of the range as UI5Date or JavaScript Date object. This is independent from any formatter.
		 *
		 * <b>Note:</b> If this property is used, the <code>value</code> property should not be changed from the caller.
		 *
		 * @returns {Date|module:sap/ui/core/date/UI5Date} the value of property <code>dateValue</code>
		 * @public
		 * @name sap.m.DateRangeSelection#getDateValue
		 * @function
		 */

		/**
		 * Setter for property <code>dateValue</code>.
		 *
		 * The start date of the range as UI5Date or JavaScript Date object. This is independent from any formatter.
		 *
		 * <b>Note:</b> If this property is used, the <code>value</code> property should not be changed from the caller.
		 *
		 * @param {Date|module:sap/ui/core/date/UI5Date} oDateValue New value for property <code>dateValue</code>
		 * @returns {this} Reference to <code>this</code> for method chaining
		 * @public
		 */
		DateRangeSelection.prototype.setDateValue = function(oDateValue) {

			if (!this._isValidDate(oDateValue)) {
				throw new Error("Date must be a JavaScript or UI5Date date object; " + this);
			}

			if (deepEqual(this.getDateValue(), oDateValue)) {
				return this;
			}

			DatePicker.prototype._dateValidation.call(this, oDateValue); //will handle everything related to set a dateValue
			this._syncDateObjectsToValue(oDateValue, this.getSecondDateValue());

			return this;

		};

		/**
		 * Getter for property <code>secondDateValue</code>.
		 *
		 * The end date of the range as UI5Date or JavaScript Date object. This is independent from any formatter.
		 *
		 * <b>Note:</b> If this property is used, the <code>value</code> property should not be changed from the caller.
		 *
		 * @returns {Date|module:sap/ui/core/date/UI5Date} the value of property <code>secondDateValue</code>
		 * @public
		 * @name sap.m.DateRangeSelection#getSecondDateValue
		 * @function
		 */

		/**
		 * Setter for property <code>secondDateValue</code>.
		 *
		 * The start date of the range as UI5Date or JavaScript Date object. This is independent from any formatter.
		 *
		 * <b>Note:</b> If this property is used, the <code>value</code> property should not be changed from the caller.
		 *
		 * @param {Date|module:sap/ui/core/date/UI5Date} oSecondDateValue New value for property <code>dateValue</code>
		 * @returns {this} Reference to <code>this</code> for method chaining
		 * @public
		 */
		DateRangeSelection.prototype.setSecondDateValue = function(oSecondDateValue) {

			if (!this._isValidDate(oSecondDateValue)) {
				throw new Error("Date must be a JavaScript or UI5Date date object; " + this);
			}

			if (deepEqual(this.getSecondDateValue(), oSecondDateValue)) {
				return this;
			}

			this._bValid = true;

			if (oSecondDateValue && (oSecondDateValue.getTime() < this._oMinDate.getTime() || oSecondDateValue.getTime() > this._oMaxDate.getTime())) {
				this._bValid = false;
				assert(this._bValid, "Date must be in valid range");
			}

			this.setProperty("secondDateValue", oSecondDateValue);
			this._syncDateObjectsToValue(this.getDateValue(), oSecondDateValue);

			return this;
		};

		/**
		 * Set minimum date that can be shown and selected in the <code>DatePicker</code>. This must be a UI5Date or JavaScript Date object.
		 * @param {Date|module:sap/ui/core/date/UI5Date} oDate A date instance
		 * @returns {this} Reference to <code>this</code> for method chaining
		 * @public
		 */
		DateRangeSelection.prototype.setMinDate = function(oDate) {

			DatePicker.prototype.setMinDate.apply(this, arguments);

			if (oDate) {
				var oSecondDateValue = this.getSecondDateValue();
				if (oSecondDateValue && oSecondDateValue.getTime() < this._oMinDate.getTime()) {
					Log.warning("SecondDateValue not in valid date range", this);
				}
			}

			return this;

		};

		/**
		 * Set maximum date that can be shown and selected in the <code>DatePicker</code>. This must be a UI5Date or JavaScript Date object.
		 * @param {Date|module:sap/ui/core/date/UI5Date} oDate A date instance
		 * @returns {this} Reference to <code>this</code> for method chaining
		 * @public
		 */
		DateRangeSelection.prototype.setMaxDate = function(oDate) {

			DatePicker.prototype.setMaxDate.apply(this, arguments);

			if (oDate) {
				var oSecondDateValue = this.getSecondDateValue();
				if (oSecondDateValue && oSecondDateValue.getTime() > this._oMaxDate.getTime()) {
					Log.warning("SecondDateValue not in valid date range", this);
				}
			}

			return this;

		};

		DateRangeSelection.prototype._checkMinMaxDate = function() {

			DatePicker.prototype._checkMinMaxDate.apply(this, arguments);

			var oSecondDate = this.getSecondDateValue();

			if (oSecondDate &&
				(oSecondDate.getTime() < this._oMinDate.getTime() || oSecondDate.getTime() > this._oMaxDate.getTime())) {
				Log.error("secondDateValue " + oSecondDate.toString() + "(value=" + this.getValue() + ") does not match " +
					"min/max date range(" + this._oMinDate.toString() + " - " + this._oMaxDate.toString() + "). App. " +
					"developers should take care to maintain secondDateValue/value accordingly.", this);
			}

		};

		//Support of two date range version added into original DatePicker's version
		DateRangeSelection.prototype._parseValue = function(sValue) {

			var oFormat;
			var aDates = [];
			var oDate1, oDate2;
			var oBinding = this.getBinding("value");

			if (oBinding && oBinding.getType() && oBinding.getType().isA("sap.ui.model.type.DateInterval")) {
				//The InputBase has it's own mechanism for handling parser exception that
				//uses sap.ui.core.message.MessageMixin and MessageManager. This mechanism
				//is triggered once the invalid value is set to the Input. In our case this
				//was done in onChange function after parsing the value (in Binding case).
				//When an invalid value is entered, it was causing an unhandled console error
				//in DateRangeSelection control.
				try {
					aDates = oBinding.getType().parseValue(sValue, "string");
				} catch (e) {
					//for consistency reasons (like in the onchange method) we now return
					//an array with two empty objects
					return [undefined, undefined];
				}
				/** DateRangeSelection control uses local dates for its properties, so make sure returned values from
				 * binding type formatter are restored to local dates if necessary.
				 **/
				if (oBinding.getType().oFormatOptions && oBinding.getType().oFormatOptions.UTC) {
					aDates = aDates.map(function (oUTCDate) {
						return UI5Date.getInstance(oUTCDate.getUTCFullYear(), oUTCDate.getUTCMonth(), oUTCDate.getUTCDate(),
							oUTCDate.getUTCHours(), oUTCDate.getUTCMinutes(), oUTCDate.getUTCSeconds());
					});
				}
				return aDates;
			}

			//If we have version of control with delimiter, then sValue should consist of two dates delimited with delimiter,
			//hence we have to split the value to these dates
			var sDelimiter = _getDelimiter.call(this);
			if (sDelimiter && sValue) {
				sValue = sValue.trim();
				sValue = _trim(sValue, [sDelimiter, " "]);

				aDates = this._splitValueByDelimiter(sValue, sDelimiter);

				if (aDates.length === 2) {
					// if delimiter only appears once in value (not part of date pattern) remove " " to be more flexible for input
					if (aDates[0].slice(aDates[0].length - 1,aDates[0].length) == " ") {
						aDates[0] = aDates[0].slice(0, aDates[0].length - 1);
					}
					if (aDates[1].slice(0,1) == " ") {
						aDates[1] = aDates[1].slice(1);
					}
				} else {
					aDates = sValue.split(" " + sDelimiter + " ");// Delimiter appears more than once -> try with separators
				}

				if (sValue.indexOf(sDelimiter) === -1) {
					// no delimiter found -> maybe only " " is used
					var aDates2 = sValue.split(" ");
					if (aDates2.length === 2) {
						aDates = aDates2;
					}
				}
			}

			if (sValue && aDates.length <= 2) {

				oFormat = _getFormatter.call(this);

				//Convert to date object(s)
				if ((!sDelimiter || sDelimiter === "") || aDates.length === 1) {
					oDate1 = oFormat.parse(sValue);
				} else if (aDates.length === 2) {
					oDate1 = oFormat.parse(aDates[0]);
					oDate2 = oFormat.parse(aDates[1]);
					if (!oDate1 || !oDate2) {
						// at least one date can not be parsed -> whole value is incorrect
						oDate1 = undefined;
						oDate2 = undefined;
					}
				}
			}

			return [oDate1, oDate2];

		};

		// Handles the splitting of the value into parts logic regarding a valid delimiter
		DateRangeSelection.prototype._splitValueByDelimiter = function (sValue, sDelimiter) {
			var aDelimiters = [HYPHEN, ENDASH, EMDASH],
				i;

			if (sDelimiter) { // if there is a passed delimiter - use it
				if (aDelimiters.indexOf(sDelimiter) === -1) { // if the passed delimiter is not a variety of a dash - split by it
					return sValue.split(sDelimiter);
				}
			}

			for (i = 0; i < aDelimiters.length; i++) {
				if (sValue.indexOf(aDelimiters[i]) > 0) { // there is no delimiter passed - split by dash
					return sValue.split(aDelimiters[i]);
				}
			}

			// only one date value is used
			return sValue ? sValue.split(" ") : [];

		};

		//Support of two date range version added into original DatePicker's version
		DateRangeSelection.prototype._formatValue = function(oDateValue, oSecondDateValue) {

			var sValue = "",
				sDelimiter = _getDelimiter.call(this),
				oFormat = _getFormatter.call(this),
				oBinding,
				oBindingType,
				oDate1, oDate2;

			oDate1 = oDateValue;
			oDate2 = oSecondDateValue;

			if (oDate1) {
				oBinding = this.getBinding("value");

				if (oBinding && oBinding.getType() && oBinding.getType().isA("sap.ui.model.type.DateInterval")) {
					if (oBinding.getType().oFormatOptions && oBinding.getType().oFormatOptions.source && oBinding.getType().oFormatOptions.source.pattern === "timestamp") {
						sValue = oBinding.getType().formatValue([this._denormalizeDateValue(oDateValue), this._denormalizeDateValue(oSecondDateValue)], "string");
					} else {
						/** DateRangeSelection control uses local dates for its properties, so make sure they are converted
						 * to UTC dates if the binding type formatter expects them in UTC
						 **/
						oBindingType = oBinding.getType();
						if (oBindingType.oFormatOptions && oBinding.getType().oFormatOptions.UTC) {
							oDate1 = UI5Date.getInstance(Date.UTC(oDateValue.getFullYear(), oDateValue.getMonth(), oDateValue.getDate(),
								oDateValue.getHours(), oDateValue.getMinutes(), oDateValue.getSeconds()));
							if (oSecondDateValue) {
								oDate2 = UI5Date.getInstance(Date.UTC(oSecondDateValue.getFullYear(), oSecondDateValue.getMonth(), oSecondDateValue.getDate(),
									oSecondDateValue.getHours(), oSecondDateValue.getMinutes(), oSecondDateValue.getSeconds()));
							}
						}

						if (oBindingType.oInputFormat && typeof oDate1 === "object") {
							oDate1 = oFormat.format(oDate1);
						}
						if (oBindingType.oInputFormat && typeof oDate2 === "object") {
							oDate2 = oFormat.format(oDate2);
						}
						sValue = oBinding.getType().formatValue([oDate1, oDate2], "string");
					}
				} else {
					if (sDelimiter && sDelimiter !== "" && oDate2) {
						sValue = oFormat.format(oDate1) + " " + sDelimiter + " " + oFormat.format(oDate2);
					} else {
						sValue = oFormat.format(oDate1);
					}
				}
			}

			return sValue;

		};

		DateRangeSelection.prototype.onChange = function() {

			// check the control is editable or not
			if (!this.getEditable() || !this.getEnabled()) {
				return;
			}

			var sInputValue = this._$input.val();
			var sValue = sInputValue;
			var aDates = [undefined, undefined];

			if (this.getShowFooter() && this._oPopup && !sValue) {
				this._oPopup.getBeginButton().setEnabled(false);
			}

			this._bValid = true;
			if (sValue != "") {
				aDates = this._parseValue(sValue);
				// normalize dates in order to always have UI5Date objects
				aDates[0] = this._normalizeDateValue(aDates[0]);
				aDates[1] = this._normalizeDateValue(aDates[1]);
				// the selected range includes all of the hours from the second date
				aDates[1] && aDates[1].setHours(23, 59, 59, 999);
				aDates = _dateRangeValidityCheck.call(this, aDates[0], aDates[1]); // aDates can be undefined if don't fit to the min/max range
				if (aDates[0]) {
					sValue = this._formatValue(aDates[0], aDates[1]); // to have the right output format if entered different
				} else {
					this._bValid = false;
				}
			}

			if (sValue !== this.getLastValue()) {
				if (this.getDomRef() && (this._$input.val() !== sValue)) {
					this._$input.val(sValue);
					this._curpos = this._$input.cursorPos();
				}
				this.setLastValue(sValue);
				this.setProperty("value", sValue, true);
				if (this._bValid) {
					this.setProperty("dateValue", this._normalizeDateValue(aDates[0]), true);
					this.setProperty("secondDateValue", this._normalizeDateValue(aDates[1]), true);
				}

				if (this._oPopup && this._oPopup.isOpen()) {

					var oStartDate = this.getDateValue();
					if (oStartDate) {
						if (!this._oDateRange.getStartDate() || this._oDateRange.getStartDate().getTime() !== oStartDate.getTime()) {
							this._oDateRange.setStartDate(UI5Date.getInstance(oStartDate.getTime()));
							this._getCalendar().focusDate(oStartDate);
						}
					} else {
						if (this._oDateRange.getStartDate()) {
							this._oDateRange.setStartDate(undefined);
						}
					}

					var oEndDate = this.getSecondDateValue();
					if (oEndDate) {
						if (!this._oDateRange.getEndDate() || this._oDateRange.getEndDate().getTime() !== oEndDate.getTime()) {
							this._oDateRange.setEndDate(UI5Date.getInstance(oEndDate.getTime()));
							this._getCalendar().focusDate(oEndDate);
						}
					} else {
						if (this._oDateRange.getEndDate()) {
							this._oDateRange.setEndDate(undefined);
						}
					}
				}

				_fireChange.call(this, this._bValid);

			} else if (sInputValue !== this.getLastValue() && sValue === this.getLastValue()) {
				if (this.getDomRef() && (this._$input.val() !== sValue)) {
					this._$input.val(sValue);
					this._curpos = this._$input.cursorPos();
				}
			}

		};

		DateRangeSelection.prototype.updateDomValue = function(sValue) {

			// dom value updated other than value property
			this._bCheckDomValue = true;

			sValue = (typeof sValue == "undefined") ? this._$input.val() : sValue.toString();
			this._curpos = this._$input.cursorPos();

			var aDates = this._parseValue(sValue);
			sValue = this._formatValue( aDates[0], aDates[1]);

			// if set to true, handle the user input and data
			// model updates concurrency in order to not overwrite
			// values coming from the user
			if (this._bPreferUserInteraction) {
				this.handleInputValueConcurrency(sValue);
			} else {
				// update the DOM value when necessary
				// otherwise cursor can goto end of text unnecessarily
				if (this.isActive() && (this._$input.val() !== sValue)) {
					this._$input.val(sValue);
					this._$input.cursorPos(this._curpos);
				}
			}

			return this;
		};

		/**
		 * Handle when escape is pressed. Escaping unsaved input will restore
		 * the last valid value. If the value cannot be parsed into a date
		 * range, the input will be cleared.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		DateRangeSelection.prototype.onsapescape = function(oEvent) {
			var sLastValue = this.getLastValue(),
				aDates = this._parseValue(this._getInputValue(), true),
				sValueFormatInputDate = this._formatValue(aDates[0], aDates[1], true);

			if (sValueFormatInputDate !== sLastValue) {
				oEvent.setMarked();
				oEvent.preventDefault();

				this.updateDomValue(sLastValue);
				this.onValueRevertedByEscape(sLastValue, sValueFormatInputDate);
			}
		};

		//Support of two date range version of Calendar added into original DatePicker's version
		DateRangeSelection.prototype._fillDateRange = function(){

			DatePicker.prototype._fillDateRange.apply(this, arguments);

			var oEndDate = this.getSecondDateValue();

			if (oEndDate &&
				oEndDate.getTime() >= this._oMinDate.getTime() &&
				oEndDate.getTime() <= this._oMaxDate.getTime()) {
				if (!this._oDateRange.getEndDate() || this._oDateRange.getEndDate().getTime() !== oEndDate.getTime()) {

					this._oDateRange.setEndDate(UI5Date.getInstance(oEndDate.getTime()));
				}
			} else {
				if (this._oDateRange.getEndDate()) {
					this._oDateRange.setEndDate(undefined);
				}
			}

		};

		DateRangeSelection.prototype._selectDate = function () {
			var aSelectedDates = this._getCalendar().getSelectedDates();

			if (aSelectedDates.length > 0) {
				var oDate1 = aSelectedDates[0].getStartDate();
				var oDate2 = aSelectedDates[0].getEndDate();

				if (oDate1 && oDate2) {
					var oDate1Old = this.getDateValue();
					var oDate2Old = this.getSecondDateValue();

					// the selected range includes all of the hours from the second date
					oDate2.setHours(23, 59, 59, 999);

					var sValue;
					if (!deepEqual(oDate1, oDate1Old) || !deepEqual(oDate2, oDate2Old)) {
						// compare Dates because value can be the same if only 2 digits for year
						if (deepEqual(oDate2, oDate2Old)) {
							this.setDateValue(oDate1);
						} else {
							this.setProperty("dateValue", oDate1, true); // no rerendering
							this.setSecondDateValue(oDate2);
						}

						sValue = this.getValue();
						_fireChange.call(this, true);
						if (Device.system.desktop || !Device.support.touch) {
							this._curpos = sValue.length;
							this._$input.cursorPos(this._curpos);
						}
					} else if (!this._bValid){
						// wrong input before open calendar
						sValue = this._formatValue( oDate1, oDate2 );
						if (sValue != this._$input.val()) {
							this._bValid = true;
							if (this.getDomRef()) { // as control could be destroyed during update binding
								this._$input.val(sValue);
							}
							_fireChange.call(this, true);
						}
					}

					this._oDateRange.setStartDate(this._getCalendar().getSelectedDates()[0].getStartDate());
					this._oDateRange.setEndDate(this._getCalendar().getSelectedDates()[0].getEndDate());

					// close popup and focus input after change event to allow application to reset value state or similar things
					this._oPopup.close();
				}
			}
		};

		DateRangeSelection.prototype._handleCalendarSelect = function(){
			var oSelectedDates = this._getCalendar().getSelectedDates(),
				oSelectedStartDate = oSelectedDates[0].getStartDate(),
				oSelectedEndDate = oSelectedDates[0].getEndDate();

			if (this.getShowFooter()) {
				this._oPopup.getBeginButton().setEnabled(!!(oSelectedStartDate && oSelectedEndDate));
				return;
			}

			this._selectDate();
		};

		DateRangeSelection.prototype._handleWeekSelect = function(oEvent){
			var oSelectedDates = oEvent.getParameter("weekDays"),
				oSelectedStartDate = oSelectedDates.getStartDate(),
				oSelectedEndDate = oSelectedDates.getEndDate();

			if (!oSelectedDates) {
				return;
			}

			if (this.getShowFooter()) {
				this._oPopup.getBeginButton().setEnabled(!!(oSelectedStartDate && oSelectedEndDate));
				return;
			}

			this._getCalendar().getSelectedDates()[0].setStartDate(oSelectedStartDate);
			this._getCalendar().getSelectedDates()[0].setEndDate(oSelectedEndDate);
			this._oDateRange.setStartDate(oSelectedStartDate);
			this._oDateRange.setEndDate(oSelectedEndDate);

			this._selectDate();
		};

		/**
		 * @see sap.ui.core.Control#getAccessibilityInfo
		 * @returns {sap.ui.core.AccessibilityInfo} Current accessibility state of the control
		 * @protected
		 */
		DateRangeSelection.prototype.getAccessibilityInfo = function() {
			var oRenderer = this.getRenderer();
			var oInfo = DatePicker.prototype.getAccessibilityInfo.apply(this, arguments);
			var sValue = this.getValue() || "";
			var sRequired = this.getRequired() ? Library.getResourceBundleFor("sap.m").getText("ELEMENT_REQUIRED") : '';

			if (this._bValid) {
				var oDate = this.getDateValue();
				if (oDate) {
					sValue = this._formatValue(oDate, this.getSecondDateValue());
				}
			}
			oInfo.type = Library.getResourceBundleFor("sap.m").getText("ACC_CTR_TYPE_DATERANGEINPUT");
			oInfo.description = [sValue || this._getPlaceholder(), oRenderer.getLabelledByAnnouncement(this), oRenderer.getDescribedByAnnouncement(this), sRequired].join(" ").trim();
			return oInfo;
		};


		/**
		 * Convert date object(s) to value and sets it to property <value>, rrespectively updates the DOM
		 */
		DateRangeSelection.prototype._syncDateObjectsToValue = function (oDateValue, oSecondDateValue){
			var sValue = this._formatValue(oDateValue, oSecondDateValue);

			if (sValue !== this.getValue()) {
				this.setLastValue(sValue);
			}
			// Set the property in any case but check validity on output
			this.setProperty("value", sValue);

			if (this.getDomRef()) {
				// convert to output
				var sOutputValue = this._formatValue(oDateValue, oSecondDateValue);

				if (this._$input.val() !== sOutputValue) {
					this._$input.val(sOutputValue);
					this._curpos = this._$input.cursorPos();
				}
			}
		};

		function _fireChange(bValid) {

			this.fireChangeEvent(this.getValue(), {
				from: this.getDateValue(),
				to: this.getSecondDateValue(),
				valid: bValid
			});

		}

		function _dateRangeValidityCheck(oDate, oSecondDate) {
			var iFirstTimestamp,
				iSecondTimestamp;

			if (oDate && oDate.getTime) {
				iFirstTimestamp = oDate.getTime();
			} else if (typeof oDate === 'number') {
				iFirstTimestamp = oDate;
			}

			if (oSecondDate && oSecondDate.getTime) {
				iSecondTimestamp = oSecondDate.getTime();
			} else if (typeof oSecondDate === 'number') {
				iSecondTimestamp = oSecondDate;
			}

			if (oDate && oSecondDate && iFirstTimestamp > iSecondTimestamp) {
				// dates are in wrong oder -> just switch
				var oTmpDate = oDate;
				oDate = oSecondDate;
				oSecondDate = oTmpDate;
			}

			if ((oDate && ( iFirstTimestamp < this._oMinDate.getTime() || iFirstTimestamp > this._oMaxDate.getTime())) ||
					(oSecondDate && ( iSecondTimestamp < this._oMinDate.getTime() || iSecondTimestamp > this._oMaxDate.getTime()))) {
				return [undefined, undefined];
			} else  {
				return [oDate, oSecondDate];
			}

		}

		/**
		 * Override DatePicker.protototype._increaseDate method
		 * @override
		 *
		 * @param {int} iNumber to use for increasing the dateValue
		 * @param {string} sUnit for day, month or year
		 */
		DateRangeSelection.prototype._increaseDate = function (iNumber, sUnit) {
			var sValue = this._$input.val(),
				aDates = this._parseValue(sValue),
				oFirstOldDate = aDates[0] || null,
				oSecondOldDate = aDates[1] || null,
				iCurPos,
				iFirstDateValueLen,
				iSecondDateValueLen,
				iValueLen,
				bFirstDate,
				bSecondDate,
				oDate;

			if (!oFirstOldDate || !this.getEditable() || !this.getEnabled()) {
				return;
			}

			//aDates can be undefined if they don't fit to the min/max range
			if (!_dateRangeValidityCheck.call(this, oFirstOldDate, oSecondOldDate)[0]) {
				Log.warning("Value can not be converted to a valid dates or dates are outside of the min/max range", this);
				this._bValid = false;
				_fireChange.call(this, this._bValid);
				return;
			}

			var oFormatOptions = { interval: true, singleIntervalValue: true, intervalDelimiter: _getDelimiter.call(this) };
			oFormatOptions = this.getBinding("value")
				? Object.assign(oFormatOptions, this.getBinding("value").getType().oFormatOptions)
				: Object.assign(oFormatOptions, _getFormatter.call(this).oFormatOptions);

			var oFormat = DateFormat.getDateInstance(oFormatOptions);

			sValue = oFormat.format([oFirstOldDate, oSecondOldDate]);
			iCurPos = this._$input.cursorPos();

			iFirstDateValueLen = oFirstOldDate ? oFormat.format([oFirstOldDate, null]).length : 0;
			iSecondDateValueLen = oSecondOldDate ? oFormat.format([oSecondOldDate, null]).length : 0;

			iValueLen = sValue.length;
			bFirstDate = iCurPos <= iFirstDateValueLen + 1;
			bSecondDate = iCurPos >= iValueLen - iSecondDateValueLen - 1 && iCurPos <= iValueLen;

			if (bFirstDate && oFirstOldDate) {
				oDate = _getIncrementedDate.call(this, oFirstOldDate, iNumber, sUnit);

				if (!deepEqual(this.getDateValue(), oDate.getJSDate())) {
					this.setDateValue(UI5Date.getInstance(oDate.getTime()));
					this._curpos = iCurPos;
					this._$input.cursorPos(this._curpos);

					this.fireChangeEvent(this.getValue(), {valid: this._bValid});
				}
			} else if (bSecondDate && oSecondOldDate) {
				oDate = _getIncrementedDate.call(this, oSecondOldDate, iNumber, sUnit);

				if (!deepEqual(this.getSecondDateValue(), oDate.getJSDate())) {
					this.setSecondDateValue(UI5Date.getInstance(oDate.getTime()));
					this._curpos = iCurPos;
					this._$input.cursorPos(this._curpos);

					this.fireChangeEvent(this.getValue(), {valid: this._bValid});
				}
			}
		};

		function _getIncrementedDate(oOldDate, iNumber, sUnit) {
			// use UniversalDate to calculate new date based on used calendar
			var oBinding = this.getBinding("value"),
				sCalendarType,
				iMonth,
				oUTCDate,
				iOldDateMonth;

			if (oBinding && oBinding.oType && oBinding.oType.oOutputFormat) {
				sCalendarType = oBinding.oType.oOutputFormat.oFormatOptions.calendarType;
			} else if (oBinding && oBinding.oType && oBinding.oType.oFormat) {
				sCalendarType = oBinding.oType.oFormat.oFormatOptions.calendarType;
			}

			if (!sCalendarType) {
				sCalendarType = this.getDisplayFormatType();
			}

			oUTCDate = UniversalDate.getInstance(UI5Date.getInstance(oOldDate.getTime()), sCalendarType);
			iOldDateMonth = oUTCDate.getMonth();

			switch (sUnit) {
				case "day":
					oUTCDate.setDate(oUTCDate.getDate() + iNumber);
					break;
				case "month":
					oUTCDate.setMonth(oUTCDate.getMonth() + iNumber);
					iMonth = (iOldDateMonth + iNumber) % 12;
					if (iMonth < 0) {
						iMonth = 12 + iMonth;
					}
					while (oUTCDate.getMonth() != iMonth) {
						// day don't exist in this month (e.g. 31th in February)
						oUTCDate.setDate(oUTCDate.getDate() - 1);
					}
					break;
				case "year":
				oUTCDate.setFullYear(oUTCDate.getFullYear() + iNumber);
					while (oUTCDate.getMonth() != iOldDateMonth) {
						// In case the the old date was in leep year February 29th don't exist in incremented year
						oUTCDate.setDate(oUTCDate.getDate() - 1);
					}
					break;
				default:
					break;
			}

			if (oUTCDate.getTime() < this._oMinDate.getTime()) {
				oUTCDate = new UniversalDate(this._oMinDate.getTime());
			} else if (oUTCDate.getTime() > this._oMaxDate.getTime()) {
				oUTCDate = new UniversalDate(this._oMaxDate.getTime());
			}

			return oUTCDate;
		}

		function _getDelimiter() {

			var sDelimiter = this.getDelimiter();

			if (!sDelimiter) {
				if (!this._sLocaleDelimiter) {
					var oLocale = new Locale(Formatting.getLanguageTag());
					var oLocaleData = LocaleData.getInstance(oLocale);
					var sPattern = oLocaleData.getIntervalPattern();
					var iIndex1 = sPattern.indexOf("{0}") + 3;
					var iIndex2 = sPattern.indexOf("{1}");
					sDelimiter = sPattern.slice(iIndex1, iIndex2);
					if (sDelimiter.length > 1) {
						if (sDelimiter.slice(0,1) == " ") {
							sDelimiter = sDelimiter.slice(1);
						}
						if (sDelimiter.slice(sDelimiter.length - 1,sDelimiter.length) == " ") {
							sDelimiter = sDelimiter.slice(0, sDelimiter.length - 1);
						}
					}
					this._sLocaleDelimiter = sDelimiter;
				} else {
					sDelimiter = this._sLocaleDelimiter;
				}
			}

			return sDelimiter;

		}

		function _getFormatter() {

			var sPattern = ( this.getDisplayFormat() || "medium" );
			var oFormat;
			var sCalendarType = this.getDisplayFormatType();

			if (sPattern == this._sUsedDisplayPattern && sCalendarType == this._sUsedDisplayCalendarType) {
				oFormat = this._oDisplayFormat;
			} else {
				if (this._checkStyle(sPattern)) {
					oFormat = DateFormat.getInstance({style: sPattern, strictParsing: true, calendarType: sCalendarType});
				} else {
					oFormat = DateFormat.getInstance({pattern: sPattern, strictParsing: true, calendarType: sCalendarType});
				}
				this._sUsedDisplayPattern = sPattern;
				this._sUsedDisplayCalendarType = sCalendarType;
				this._oDisplayFormat = oFormat;
			}

			return oFormat;

		}

		function _endsWith(sValue, sEndStr) {
			return sValue && sEndStr && sValue.lastIndexOf(sEndStr) === sValue.length - sEndStr.length;
		}

		function _startsWith(sValue, sStartStr) {
			return sValue && sStartStr && sValue.indexOf(sStartStr) === 0;
		}

		/**
		 * Trims all occurrences of the given string values from both ends of the specified string.
		 * @param {string} sValue The value to be trimmed
		 * @param {string[]} aParams All values to be removed
		 * @returns {string} The trimmed value
		 * @private
		 */
		function _trim(sValue, aParams) {
			var i = 0,
				aTrims = aParams;

			if (!aTrims) {
				aTrims = [" "];
			}

			while (i < aTrims.length) {
				if (_endsWith(sValue, aTrims[i])) {
					sValue = sValue.substring(0, sValue.length - aTrims[i].length);
					i = 0;
					continue;
				}
				i++;
			}

			i = 0;
			while (i < aTrims.length) {
				if (_startsWith(sValue, aTrims[i])) {
					sValue = sValue.substring(aTrims[i].length);
					i = 0;
					continue;
				}
				i++;
			}

			return sValue;
		}

		//	to overwrite JS doc

		/**
		 * On change of date range event.
		 *
		 * @name sap.m.DateRangeSelection#change
		 * @event
		 * @param {sap.ui.base.Event} oControlEvent
		 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
		 * @param {object} oControlEvent.getParameters
		 * @param {string} oControlEvent.getParameters.value The new value of the <code>sap.m.DateRangeSelection</code>.
		 * @param {boolean} oControlEvent.getParameters.valid Indicator for a valid date.
		 * @param {object} oControlEvent.getParameters.from Current start date after change.
		 * @param {object} oControlEvent.getParameters.to Current end date after change.
		 * @public
		 */

		/**
		* Fire event change to attached listeners.
		*
		* Expects following event parameters:
		* <ul>
		* <li>'value' of type <code>string</code> The new value of the <code>sap.m.DateRangeSelection</code>.</li>
		* <li>'valid' of type <code>boolean</code> Indicator for a valid date.</li>
		* <li>'from' of type <code>object</code> Current start date after change.</li>
		* <li>'to' of type <code>object</code> Current end date after change.</li>
		* </ul>
		*
		* @param {object} [mArguments] The arguments to pass along with the event.
		* @returns {this} Reference to <code>this</code> for method chaining
		* @protected
		* @name sap.m.DateRangeSelection#fireChange
		* @function
		*/

		return DateRangeSelection;
	});