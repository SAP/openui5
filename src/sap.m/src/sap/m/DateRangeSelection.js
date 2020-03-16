/*!
 * ${copyright}
 */

// Provides control sap.m.DateRangeSelection.
sap.ui.define([
	'sap/ui/Device',
	'./DatePicker',
	'./library',
	'sap/ui/core/LocaleData',
	'sap/ui/core/format/DateFormat',
	'sap/ui/core/date/UniversalDate',
	'./DateRangeSelectionRenderer',
	"sap/base/util/deepEqual",
	"sap/base/Log",
	"sap/base/assert",
	"sap/ui/dom/jquery/cursorPos" // jQuery Plugin "cursorPos"
],
	function(
		Device,
		DatePicker,
		library,
		LocaleData,
		DateFormat,
		UniversalDate,
		DateRangeSelectionRenderer,
		deepEqual,
		Log,
		assert
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
	 * The {@link sap.ui.unified.Calendar} is used internally only if the
	 * <code>DateRangeSelection</code> is opened (not used for the initial rendering).
	 * If the <code>sap.ui.unified</code> library is not loaded before the
	 * <code>DateRangeSelection</code> is opened, it will be loaded upon opening.
	 * This could lead to a waiting time when the <code>DateRangeSelection</code> is
	 * opened for the first time. To prevent this, apps using the
	 * <code>DateRangeSelection</code> should also load the <code>sap.ui.unified</code>
	 * library.
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
	 * <li>Typing it in directly in the input field (not available for mobile devices)</li></ul>
	 *
	 * On app level, there are two options to provide a date for the
	 * <code>DateRangeSelection</code> - date range as a string to the
	 * <code>value</code> property or JavaScript Date objects to the
	 * <code>dateValue</code> and <code>secondDateValue</code> properties (only one of
	 * these options should be used at a time):
	 *
	 * <ul><li>Use the <code>value</code> property if the date range is already provided as
	 * a formatted string</li>
	 * <li>Use the <code>dateValue</code> and <code>secondDateValue</code> properties
	 * if the date range is already provided as JavaScript Date objects or you want to
	 * work with JavaScript Date objects</li></ul>
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
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var DateRangeSelection = DatePicker.extend("sap.m.DateRangeSelection", /** @lends sap.m.DateRangeSelection.prototype */ { metadata : {

		library : "sap.m",
		properties : {

			/**
			 * Delimiter between start and end date. Default value is "-".
			 * If no delimiter is given, the one defined for the used locale is used.
			 */
			delimiter : {type : "string", group : "Misc", defaultValue : '-'},

			/**
			 * The end date of the range as JavaScript Date object. This is independent from any formatter.
			 *
			 * <b>Note:</b> If this property is used, the <code>value</code> property should not be changed from the caller.
			 */
			secondDateValue : {type : "object", group : "Data", defaultValue : null},

			/**
			 * Start date of the range.
			 * @deprecated since version 1.22.0, replaced by <code>dateValue</code> property of the {@link sap.m.DateTimeField}
			 */
			from : {type : "object", group : "Misc", defaultValue : null, deprecated: true},

			/**
			 * End date of the range.
			 * @deprecated since version 1.22.0, replaced by <code>secondDateValue</code> property
			 */
			to : {type : "object", group : "Misc", defaultValue : null, deprecated: true}
		},
		designtime: "sap/m/designtime/DateRangeSelection.designtime",
		dnd: { draggable: false, droppable: true }
	}});

	var HYPHEN = String.fromCharCode(45),
		ENDASH = String.fromCharCode(8211),
		EMDASH = String.fromCharCode(8212);

	/**
	 * This file defines behavior for the control
	 * @public
	 */

	/* eslint-disable no-lonely-if */

	DateRangeSelection.prototype.init = function(){

		DatePicker.prototype.init.apply(this, arguments);

		this._bIntervalSelection = true;

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
			oLocaleData;

		if (!sPlaceholder) {
			oBinding = this.getBinding("value");
			oLocale = sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale();
			oLocaleData = LocaleData.getInstance(oLocale);

			if (oBinding && oBinding.getType() instanceof sap.ui.model.type.DateInterval) {
				oBindingType = oBinding.getType();

				if (oBindingType.oFormatOptions && oBindingType.oFormatOptions.format) {
					sPlaceholder = oLocaleData.getCustomDateTimePattern(oBindingType.oFormatOptions.format);
				} else {
					sPlaceholder = oLocaleData.getDatePattern("medium");
				}
			} else {
				sPlaceholder = this.getDisplayFormat();

				if (!sPlaceholder) {
					sPlaceholder = "medium";
				}

				if (this._checkStyle(sPlaceholder)) {
					sPlaceholder = oLocaleData.getDatePattern(sPlaceholder);
				}
			}

			var sDelimiter = _getDelimiter.call(this);
			if (sDelimiter && sDelimiter !== "") {
				sPlaceholder = sPlaceholder + " " + sDelimiter + " " + sPlaceholder;
			}
		}

		return sPlaceholder;
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
	 * @return {sap.m.DateRangeSelection} <code>this</code> to allow method chaining.
	 * @public
	 */
	DateRangeSelection.prototype.setValue = function(sValue) {

		if (sValue !== this.getValue()) {
			this._lastValue = sValue;
		} else {
			return this;
		}
		// Set the property in any case but check validity on output
		this.setProperty("value", sValue);
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

		this.setProperty("dateValue", _normalizeDateValue(aDates[0]));
		this.setProperty("secondDateValue", _normalizeDateValue(aDates[1]));

		// Do not call InputBase.setValue because the displayed value and the output value might have different pattern
		if (this.getDomRef()) {
			// Convert to output
			var sOutputValue = this._formatValue(aDates[0], aDates[1]);

			if (this._$input.val() !== sOutputValue) {
				this._$input.val(sOutputValue);
				this._curpos = this._$input.cursorPos();
			}
		}

		return this;

	};

	/**
	 * Converts the parameter to a Javascript Date, if it is a timestamp integer.
	 * @param {object|int} vBindingDate A timestamp or a Javascript Date
	 * @returns {object} A Javascript Date object
	 * @private
	 */
	function _normalizeDateValue(vBindingDate) {
		return (typeof vBindingDate === 'number') ? new Date(vBindingDate) : vBindingDate;
	}

	/**
	 * Converts the parameter to a timestamp integer, if it is a Javascript Date.
	 * @param {object|int} vBindingDate A timestamp or a Javascript Date
	 * @returns {object} A timestamp integer
	 * @private
	 */
	function _denormalizeDateValue(vBindingDate) {
		return (vBindingDate && vBindingDate.getTime) ? vBindingDate.getTime() : vBindingDate;
	}

	/**
	 * Getter for property <code>valueFormat</code>.
	 *
	 * <b>Note:</b> Property <code>valueFormat</code> is not supported in the <code>sap.m.DateRangeSelection</code> control.
	 *
	 * @return {string} the value of property valueFormat
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
	 * @return {sap.m.DateRangeSelection} <code>this</code> to allow method chaining
	 * @public
	 */
	DateRangeSelection.prototype.setValueFormat = function(sValueFormat) {

		// if valueFormat changes the value must be parsed again

		this.setProperty("valueFormat", sValueFormat, true); // no rerendering

		Log.warning("Property valueFormat is not supported in sap.m.DateRangeSelection control.", this);

		return this;

	};

	DateRangeSelection.prototype.setDisplayFormat = function(sDisplayFormat) {

		// if displayFormat changes the value must be formatted again

		this.setProperty("displayFormat", sDisplayFormat, true); // no rerendering
		var sOutputValue = this._formatValue(this.getDateValue(), this.getSecondDateValue());

		// as value also used displayFormat update value too
		this.setProperty("value", sOutputValue, true); // no rerendering

		if (this.getDomRef() && (this._$input.val() !== sOutputValue)) {
			this._$input.val(sOutputValue);
			this._curpos = this._$input.cursorPos();
		}

		return this;

	};

	//Following setters/getters are due to backward compatibility with original primary version of composite sap.m.DateRangeSelection,
	//that consisted of original primary sap.m.DateRangeSelection
	DateRangeSelection.prototype.setFrom = function(oFrom) {
		this.setDateValue(oFrom);
		return this;
	};

	DateRangeSelection.prototype.getFrom = function() {
		return this.getDateValue();
	};

	DateRangeSelection.prototype.setTo = function(oTo) {
		this.setSecondDateValue(oTo);
		return this;
	};

	DateRangeSelection.prototype.getTo = function() {
		return this.getSecondDateValue();
	};

	// Overwrite DatePicker's setDateValue to support two date range processing

	/**
	 * Getter for property <code>dateValue</code>.
	 *
	 * The start date of the range as JavaScript Date object. This is independent from any formatter.
	 *
	 * <b>Note:</b> If this property is used, the <code>value</code> property should not be changed from the caller.
	 *
	 * @returns {object} the value of property <code>dateValue</code>
	 * @public
	 * @name sap.m.DateRangeSelection#getDateValue
	 * @function
	 */

	/**
	 * Setter for property <code>dateValue</code>.
	 *
	 * The start date of the range as JavaScript Date object. This is independent from any formatter.
	 *
	 * <b>Note:</b> If this property is used, the <code>value</code> property should not be changed from the caller.
	 *
	 * @param {object} oDateValue New value for property <code>dateValue</code>
	 * @return {sap.m.DateRangeSelection} <code>this</code> to allow method chaining.
	 * @public
	 */
	DateRangeSelection.prototype.setDateValue = function(oDateValue) {

		if (this._isValidDate(oDateValue)) {
			throw new Error("Date must be a JavaScript date object; " + this);
		}

		if (deepEqual(this.getDateValue(), oDateValue)) {
			return this;
		}

		DatePicker.prototype._dateValidation.call(this, oDateValue); //will handle everything related to set a dateValue
		this._syncDateObjectsToValue(oDateValue, this.getSecondDateValue());

		return this;

	};

	DateRangeSelection.prototype.setSecondDateValue = function(oSecondDateValue) {

		if (this._isValidDate(oSecondDateValue)) {
			throw new Error("Date must be a JavaScript date object; " + this);
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

		if (oBinding && oBinding.getType() instanceof sap.ui.model.type.DateInterval) {
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
					return new Date(oUTCDate.getUTCFullYear(), oUTCDate.getUTCMonth(), oUTCDate.getUTCDate(),
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
			oFormat,
			oBinding,
			oDate1, oDate2;

		oDate1 = oDateValue;
		oDate2 = oSecondDateValue;

		if (oDate1) {
			oBinding = this.getBinding("value");

			if (oBinding && oBinding.getType() instanceof sap.ui.model.type.DateInterval) {
				if (oBinding.getType().oFormatOptions && oBinding.getType().oFormatOptions.source && oBinding.getType().oFormatOptions.source.pattern === "timestamp") {
					sValue = oBinding.getType().formatValue([_denormalizeDateValue(oDateValue), _denormalizeDateValue(oSecondDateValue)], "string");
				} else {
					/** DateRangeSelection control uses local dates for its properties, so make sure they are converted
					 * to UTC dates if the binding type formatter expects them in UTC
					 **/
					if (oBinding.getType().oFormatOptions && oBinding.getType().oFormatOptions.UTC) {
						oDate1 = new Date(Date.UTC(oDateValue.getFullYear(), oDateValue.getMonth(), oDateValue.getDate(),
							oDateValue.getHours(), oDateValue.getMinutes(), oDateValue.getSeconds()));
						if (oSecondDateValue) {
							oDate2 = new Date(Date.UTC(oSecondDateValue.getFullYear(), oSecondDateValue.getMonth(), oSecondDateValue.getDate(),
								oSecondDateValue.getHours(), oSecondDateValue.getMinutes(), oSecondDateValue.getSeconds()));
						}
					}
					sValue = oBinding.getType().formatValue([oDate1, oDate2], "string");
				}
			} else {
				oFormat = _getFormatter.call(this);

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

		var sValue = this._$input.val();
		var aDates = [undefined, undefined];

		if (this.getShowFooter() && this._oPopup && !sValue) {
			this._oPopup.getBeginButton().setEnabled(false);
		}

		this._bValid = true;
		if (sValue != "") {
			aDates = this._parseValue(sValue);
			// the selected range includes all of the hours from the second date
			aDates[1] && aDates[1].setHours(23, 59, 59, 999);
			aDates = _dateRangeValidityCheck.call(this, aDates[0], aDates[1]);//aDates can be undefined if don't fit to the min/max range
			if (aDates[0]) {
				sValue = this._formatValue( aDates[0], aDates[1] ); // to have the right output format if entered different
			} else {
				this._bValid = false;
			}
		}

		if (sValue !== this._lastValue) {
			if (this.getDomRef() && (this._$input.val() !== sValue)) {
				this._$input.val(sValue);
				this._curpos = this._$input.cursorPos();
			}
			this._lastValue = sValue;
			this.setProperty("value", sValue, true);
			if (this._bValid) {
				this.setProperty("dateValue", _normalizeDateValue(aDates[0]), true);
				this.setProperty("secondDateValue", _normalizeDateValue(aDates[1]), true);
			}

			if (this._oPopup && this._oPopup.isOpen()) {

				var oStartDate = this.getDateValue();
				if (oStartDate) {
					if (!this._oDateRange.getStartDate() || this._oDateRange.getStartDate().getTime() !== oStartDate.getTime()) {
						this._oDateRange.setStartDate(new Date(oStartDate.getTime()));
						this._oCalendar.focusDate(oStartDate);
					}
				} else {
					if (this._oDateRange.getStartDate()) {
						this._oDateRange.setStartDate(undefined);
					}
				}

				var oEndDate = this.getSecondDateValue();
				if (oEndDate) {
					if (!this._oDateRange.getEndDate() || this._oDateRange.getEndDate().getTime() !== oEndDate.getTime()) {
						this._oDateRange.setEndDate(new Date(oEndDate.getTime()));
						this._oCalendar.focusDate(oEndDate);
					}
				} else {
					if (this._oDateRange.getEndDate()) {
						this._oDateRange.setEndDate(undefined);
					}
				}
			}

			_fireChange.call(this, this._bValid);

		}

	};

	// Overwrite DatePicker's _getInputValue  to support two date range processing
	DateRangeSelection.prototype._getInputValue = function(sValue) {

		sValue = (typeof sValue == "undefined") ? this._$input.val() : sValue.toString();

		if (!sValue) {
			return "";
		}

		var aDates = this._parseValue(sValue);
		sValue = this._formatValue( aDates[0], aDates[1]);

		return sValue;

	};

	// overwrite _getInputValue to do the output conversion
	DateRangeSelection.prototype.updateDomValue = function(sValue) {

		// dom value updated other than value property
		this._bCheckDomValue = true;

		sValue = (typeof sValue == "undefined") ? this._$input.val() : sValue.toString();
		this._curpos = this._$input.cursorPos();

		var aDates = this._parseValue(sValue);
		sValue = this._formatValue( aDates[0], aDates[1]);

		// update the DOM value when necessary
		// otherwise cursor can goto end of text unnecessarily
		if (this.isActive() && (this._$input.val() !== sValue)) {
			this._$input.val(sValue);
			this._$input.cursorPos(this._curpos);
		}

		return this;
	};

	DateRangeSelection.prototype.onsappageup = function(oEvent){
		// increase by one day
		this._increaseDateRange(1, "day");

		// prevent scrolling
		oEvent.preventDefault();
	};

	DateRangeSelection.prototype.onsappageupmodifiers = function(oEvent){

		if (oEvent.shiftKey && !oEvent.ctrlKey) {
			// increase by one month
			this._increaseDateRange(1, "month");
		} else if (oEvent.shiftKey && oEvent.ctrlKey) {
			// increase by one year
			this._increaseDateRange(1, "year");
		}
		// prevent scrolling
		oEvent.preventDefault();
	};

	DateRangeSelection.prototype.onsappagedown = function(oEvent){
		//decrease by one day
		this._increaseDateRange(-1, "day");

		// prevent scrolling
		oEvent.preventDefault();
	};
	DateRangeSelection.prototype.onsappagedownmodifiers = function(oEvent){

		if (oEvent.shiftKey && !oEvent.ctrlKey) {
			// increase by one month
			this._increaseDateRange(-1, "month");
		} else if (oEvent.shiftKey && oEvent.ctrlKey) {
			// increase by one year
			this._increaseDateRange(-1, "year");
		}
		// prevent scrolling
		oEvent.preventDefault();
	};

	//Support of two date range version of Calendar added into original DatePicker's version
	DateRangeSelection.prototype._fillDateRange = function(){

		DatePicker.prototype._fillDateRange.apply(this, arguments);

		var oEndDate = this.getSecondDateValue();

		if (oEndDate &&
			oEndDate.getTime() >= this._oMinDate.getTime() &&
			oEndDate.getTime() <= this._oMaxDate.getTime()) {
			if (!this._oDateRange.getEndDate() || this._oDateRange.getEndDate().getTime() !== oEndDate.getTime()) {
				this._oDateRange.setEndDate(new Date(oEndDate.getTime()));
			}
		} else {
			if (this._oDateRange.getEndDate()) {
				this._oDateRange.setEndDate(undefined);
			}
		}

	};

	DateRangeSelection.prototype._selectDate = function () {
		var aSelectedDates = this._oCalendar.getSelectedDates();

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
				}else if (!this._bValid){
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

				// close popup and focus input after change event to allow application to reset value state or similar things
				this._oPopup.close();
			}
		}
	};

	/**
	 * @see sap.ui.core.Control#getAccessibilityInfo
	 * @returns {Object} Current accessibility state of the control
	 * @protected
	 */
	DateRangeSelection.prototype.getAccessibilityInfo = function() {
		var oRenderer = this.getRenderer();
		var oInfo = DatePicker.prototype.getAccessibilityInfo.apply(this, arguments);
		var sValue = this.getValue() || "";
		if (this._bValid) {
			var oDate = this.getDateValue();
			if (oDate) {
				sValue = this._formatValue(oDate, this.getSecondDateValue());
			}
		}
		oInfo.description = [sValue, oRenderer.getLabelledByAnnouncement(this), oRenderer.getDescribedByAnnouncement(this)].join(" ").trim();
		return oInfo;
	};


	/**
	 * Convert date object(s) to value and sets it to property <value>, rrespectively updates the DOM
	 */
	DateRangeSelection.prototype._syncDateObjectsToValue = function (oDateValue, oSecondDateValue){
		var sValue = this._formatValue(oDateValue, oSecondDateValue);

		if (sValue !== this.getValue()) {
			this._lastValue = sValue;
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
		}else {
			return [oDate, oSecondDate];
		}

	}

	DateRangeSelection.prototype._increaseDateRange = function (iNumber, sUnit) {
		var sValue = this._$input.val(),
			aDates = this._parseValue(sValue),
			oFirstOldDate = aDates[0],
			oSecondOldDate = aDates[1],
			oFormat = _getFormatter.call(this),
			sDelimiter = _getDelimiter.call(this),
			iCurPos,
			iFirstDateValueLen,
			iSecondDateValueLen,
			iValueLen,
			bFirstDate,
			bSecondDate,
			oDate;

		if (!this.getEditable() || !this.getEnabled()) {
			return;
		}

		//aDates can be undefined if they don't fit to the min/max range
		if (!_dateRangeValidityCheck.call(this, oFirstOldDate, oSecondOldDate)[0]) {
			Log.warning("Value can not be converted to a valid dates or dates are outside of the min/max range", this);
			this._bValid = false;
			_fireChange.call(this, this._bValid);
			return;
		}

		// Clear all spaces and delimiter characters at the beggining and at the end of the value string
		// as they don't make the input to be considered invalid, but make the cursor position calculations wrong
		sValue = _trim(sValue, [sDelimiter, " "]);
		iCurPos = this._$input.cursorPos();
		iFirstDateValueLen = oFormat.format(oFirstOldDate).length;
		iSecondDateValueLen = oFormat.format(oSecondOldDate).length;

		iValueLen = sValue.length;
		bFirstDate = iCurPos <= iFirstDateValueLen + 1;
		bSecondDate = iCurPos >= iValueLen - iSecondDateValueLen - 1 && iCurPos <= iValueLen;

		if (bFirstDate && oFirstOldDate) {
			oDate = _getIncrementedDate.call(this, oFirstOldDate, iNumber, sUnit);

			if (!deepEqual(this.getDateValue(), oDate.getJSDate())) {
				this.setDateValue(new Date(oDate.getTime()));
				this._curpos = iCurPos;
				this._$input.cursorPos(this._curpos);

				this.fireChangeEvent(this.getValue(), {valid: this._bValid});
			}
		} else if (bSecondDate && oSecondOldDate) {
			oDate = _getIncrementedDate.call(this, oSecondOldDate, iNumber, sUnit);

			if (!deepEqual(this.getSecondDateValue(), oDate.getJSDate())) {
				this.setSecondDateValue(new Date(oDate.getTime()));
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

		oUTCDate = UniversalDate.getInstance(new Date(oOldDate.getTime()), sCalendarType);
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
				var oLocale = sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale();
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
	 * @param {Map} [mArguments] The arguments to pass along with the event.
	 * @return {sap.m.DateRangeSelection} <code>this</code> to allow method chaining
	 * @protected
	 * @name sap.m.DateRangeSelection#fireChange
	 * @function
	 */

	return DateRangeSelection;

});