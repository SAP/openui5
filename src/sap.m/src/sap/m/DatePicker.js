/*!
 * ${copyright}
 */

// Provides control sap.m.DatePicker.
sap.ui.define(['jquery.sap.global', 'sap/ui/Device', './InputBase', 'sap/ui/model/type/Date', 'sap/ui/core/date/UniversalDate', './library'],
	function(jQuery, Device, InputBase, Date1, UniversalDate, library) {
	"use strict";


	/**
	 * Constructor for a new <code>DatePicker</code>.
	 *
	 * @param {string} [sId] Id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Enables the users to select a localized date.
	 *
	 * <h3>Overview</h3>
	 *
	 * The <code>DatePicker</code> lets the users select a localized date using touch,
	 * mouse, or keyboard input. It consists of two parts: the date input field and the
	 * date picker.
	 *
	 * <b>Note:</b> The {@link sap.ui.unified.Calendar} is used internally only if the
	 * <code>DatePicker</code> is opened (not used for the initial rendering). If the
	 * <code>sap.ui.unified</code> library is not loaded before the
	 * <code>DatePicker</code> is opened, it will be loaded upon opening. This could
	 * lead to a waiting time when the <code>DatePicker</code> is opened for the
	 * first time. To prevent this, apps using the <code>DatePicker</code> should also
	 * load the <code>sap.ui.unified</code> library.
	 *
	 * <h3>Usage</h3>
	 *
	 * The user can enter a date by:
	 * <ul><li>Using the calendar that opens in a popup</li>
	 * <li>Typing it in directly in the input field (not available for mobile devices)</li></ul>
	 *
	 * On app level, there are two options to provide a date for the
	 * <code>DatePicker</code> - as a string to the <code>value</code> property or as
	 * a JavaScript Date object to the <code>dateValue</code> property (only one of
	 * these properties should be used at a time):
	 *
	 * <ul><li>Use the <code>value</code> property if you want to bind the
	 * <code>DatePicker</code> to a model using the <code>sap.ui.model.type.Date</code></li>
	 * <li>Use the <code>value</code> property if the date is provided as a string from
	 * the backend or inside the app (for example, as ABAP type DATS field)</li>
	 * <li>Use the <code>dateValue</code> property if the date is already provided as a
	 * JavaScript Date object or you want to work with a JavaScript Date object</li></ul>
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
	 * For example, if the <code>valueFormat</code> is "yyyy-MM-dd",
	 * the <code>displayFormat</code> is "MMM d, y", and the used locale is English, a
	 * valid value string is "2015-07-30", which leads to an output of "Jul 30, 2015".
	 *
	 * If no placeholder is set to the <code>DatePicker</code>, the used
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
	 * The <code>DatePicker</code> is smaller in compact mode and provides a
	 * touch-friendly size in cozy mode.
	 *
	 * On mobile devices, one tap on the input field opens the <code>DatePicker</code>
	 * in full screen. To close the window, the user can select a date (which triggers
	 * the close event), or select Cancel.
	 *
	 * @extends sap.m.InputBase
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.22.0
	 * @alias sap.m.DatePicker
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var DatePicker = InputBase.extend("sap.m.DatePicker", /** @lends sap.m.DatePicker.prototype */ { metadata : {

		library : "sap.m",
		properties : {

			/**
			 * The date is displayed in the input field using this format. By default, the medium format of the used locale is used.
			 *
			 * Supported format options are pattern-based on Unicode LDML Date Format notation. {@link http://unicode.org/reports/tr35/#Date_Field_Symbol_Table}
			 * <b>Note:</b> If you use data binding on the <code>value</code> property with type <code>sap.ui.model.type.Date</code> this property will be ignored.
			 * The format defined in the binding will be used.
			 */
			displayFormat : {type : "string", group : "Appearance", defaultValue : null},

			/**
			 * The date string expected and returned in the <code>value</code> property uses this format. By default the short format of the used locale is used.
			 *
			 *
			 * Supported format options are pattern-based on Unicode LDML Date Format notation. {@link http://unicode.org/reports/tr35/#Date_Field_Symbol_Table}
			 *
			 * For example, if the date string represents an ABAP DATS type, the format should be "yyyyMMdd".
			 *
			 * <b>Note:</b> If data binding on <code>value</code> property with type <code>sap.ui.model.type.Date</code> is used, this property will be ignored.
			 * The format defined in the binding will be used.
			 */
			valueFormat : {type : "string", group : "Data", defaultValue : null},

			/**
			 * The date as JavaScript Date object. This is independent from any formatter.
			 *
			 * <b>Note:</b> If this property is used, the <code>value</code> property should not be changed from the caller.
			 */
			dateValue : {type : "object", group : "Data", defaultValue : null},

			/**
			 * Displays date in this given type in input field. Default value is taken from locale settings.
			 * Accepted are values of <code>sap.ui.core.CalendarType</code> or an empty string. If no type is set, the default type of the
			 * configuration is used.
			 * <b>Note:</b> If data binding on <code>value</code> property with type <code>sap.ui.model.type.Date</code> is used, this property will be ignored.
			 * @since 1.28.6
			 */
			displayFormatType : {type : "string", group : "Appearance", defaultValue : ""},

			/**
			 * If set, the days in the calendar popup are also displayed in this calendar type
			 * If not set, the dates are only displayed in the primary calendar type
			 * @since 1.34.1
			 */
			secondaryCalendarType : {type : "sap.ui.core.CalendarType", group : "Appearance", defaultValue : null},

			/**
			 * Minimum date that can be shown and selected in the <code>DatePicker</code>. This must be a JavaScript date object.
			 *
			 * <b>Note:</b> If the <code>minDate</code> is set to be after the <code>maxDate</code>,
			 * the <code>maxDate</code> and the <code>minDate</code> are switched before rendering.
			 * @since 1.38.0
			 */
			minDate : {type : "object", group : "Misc", defaultValue : null},

			/**
			 * Maximum date that can be shown and selected in the <code>DatePicker</code>. This must be a JavaScript date object.
			 *
			 * <b>Note:</b> If the <code>maxDate</code> is set to be before the <code>minDate</code>,
			 * the <code>maxDate</code> and the <code>minDate</code> are switched before rendering.
			 * @since 1.38.0
			 */
			maxDate : {type : "object", group : "Misc", defaultValue : null}

		},

		aggregations : {

			/**
			 * Date Range with type to visualize special days in the Calendar.
			 * If one day is assigned to more than one Type, only the first one will be used.
			 *
			 * To set a single date (instead of a range), set only the startDate property of the sap.ui.unified.DateRange class.
			 *
			 * <b>Note:</b> Since 1.48 you could set a non-working day via the sap.ui.unified.CalendarDayType.NonWorking
			 * enum type just as any other special date type using sap.ui.unified.DateRangeType.
			 *
			 * @since 1.38.5
			 */
			specialDates : {type : "sap.ui.core.Element", multiple : true, singularName : "specialDate"}
		},

		associations: {

			/**
			 * Association to the <code>CalendarLegend</code> explaining the colors of the <code>specialDates</code>.
			 *
			 * <b>Note</b> The legend does not have to be rendered but must exist, and all required types must be assigned.
			 * @since 1.38.5
			 */
			legend: { type: "sap.ui.core.Control", multiple: false}
		},
		events : {

			/**
			 * Fired when navigating in <code>Calendar</code> popup.
			 * @since 1.46.0
			 */
			navigate : {
				parameters : {

					/**
					 * Date range containing the start and end date displayed in the <code>Calendar</code> popup.
					 */
					dateRange : {type : "sap.ui.unified.DateRange"}

				}
			}
		},
		designTime : true
	}});

	DatePicker.prototype.init = function() {

		InputBase.prototype.init.apply(this, arguments);

		this._bIntervalSelection = false;
		this._bOnlyCalendar = true;

		this._bValid = true;

		this._oMinDate = new Date(1, 0, 1);
		this._oMinDate.setFullYear(1); // otherwise year 1 will be converted to year 1901
		this._oMaxDate = new Date(9999, 11, 31, 23, 59, 59, 99);

	};

	DatePicker.prototype.exit = function() {

		InputBase.prototype.exit.apply(this, arguments);

		if (this._oPopup) {
			if (this._oPopup.isOpen()) {
				this._oPopup.close();
			}
			delete this._oPopup;
		}

		if (this._oCalendar) {
			this._oCalendar.destroy();
			delete this._oCalendar;
		}

		if (this._iInvalidateCalendar) {
			jQuery.sap.clearDelayedCall(this._iInvalidateCalendar);
		}

		this._sUsedDisplayPattern = undefined;
		this._sUsedDisplayCalendarType = undefined;
		this._oDisplayFormat = undefined;
		this._sUsedValuePattern = undefined;
		this._sUsedValueCalendarType = undefined;
		this._oValueFormat = undefined;

	};

	DatePicker.prototype.invalidate = function(oOrigin) {

		if (!oOrigin || oOrigin != this._oCalendar) {
			// Calendar is only invalidated by DatePicker itself -> so don't invalidate DatePicker
			sap.ui.core.Control.prototype.invalidate.apply(this, arguments);
			// Invalidate calendar with a delayed call so it could have updated specialDates aggregation from DatePicker
			this._iInvalidateCalendar = jQuery.sap.delayedCall(0, this, _invalidateCalendar);
		}

	};

	DatePicker.prototype.onBeforeRendering = function() {

		InputBase.prototype.onBeforeRendering.apply(this, arguments);

		this._checkMinMaxDate();

	};

	/**
	 * Defines the width of the DatePicker. Default value is 100%
	 *
	 * @param {string} sWidth  new value for <code>width</code>
	 * @returns {sap.m.DatePicker} <code>this</code> to allow method chaining
	 * @public
	 */
	DatePicker.prototype.setWidth = function(sWidth) {

		return InputBase.prototype.setWidth.call(this, sWidth || "100%");

	};

	DatePicker.prototype.getWidth = function(sWidth) {

		return this.getProperty("width") || "100%";

	};

	DatePicker.prototype.applyFocusInfo = function(oFocusInfo) {

		this._bFocusNoPopup = true;
		InputBase.prototype.applyFocusInfo.apply(this, arguments);

	};

	DatePicker.prototype.onfocusin = function(oEvent) {

		if (!jQuery(oEvent.target).hasClass("sapUiIcon")) {
			InputBase.prototype.onfocusin.apply(this, arguments);
		}

		this._bFocusNoPopup = undefined;

	};

	DatePicker.prototype.onsapshow = function(oEvent) {

		_toggleOpen.call(this);

		oEvent.preventDefault(); // otherwise IE opens the address bar history

	};

	// ALT-UP and ALT-DOWN should behave the same
	DatePicker.prototype.onsaphide = DatePicker.prototype.onsapshow;

	DatePicker.prototype.onsappageup = function(oEvent){

		//increase by one day
		_increaseDate.call(this, 1, "day");

		oEvent.preventDefault(); // do not move cursor

	};

	DatePicker.prototype.onsappageupmodifiers = function(oEvent){

		if (!oEvent.ctrlKey && oEvent.shiftKey) {
			// increase by one month
			_increaseDate.call(this, 1, "month");
		} else {
			// increase by one year
			_increaseDate.call(this, 1, "year");
		}

		oEvent.preventDefault(); // do not move cursor

	};

	DatePicker.prototype.onsappagedown = function(oEvent){

		//decrease by one day
		_increaseDate.call(this, -1, "day");

		oEvent.preventDefault(); // do not move cursor

	};

	DatePicker.prototype.onsappagedownmodifiers = function(oEvent){

		if (!oEvent.ctrlKey && oEvent.shiftKey) {
			// decrease by one month
			_increaseDate.call(this, -1, "month");
		} else {
			// decrease by one year
			_increaseDate.call(this, -1, "year");
		}

		oEvent.preventDefault(); // do not move cursor

	};

	DatePicker.prototype.onkeypress = function(oEvent){

		// the keypress event should be fired only when a character key is pressed,
		// unfortunately some browsers fire the keypress event for control keys as well.
		if (!oEvent.charCode || oEvent.metaKey || oEvent.ctrlKey) {
			return;
		}

		var oFormatter = _getFormatter.call(this, true);
		var sChar = String.fromCharCode(oEvent.charCode);

		if (sChar && oFormatter.sAllowedCharacters && oFormatter.sAllowedCharacters.indexOf(sChar) < 0) {
			oEvent.preventDefault();
		}
	};

	DatePicker.prototype.onclick = function(oEvent) {

		if (jQuery(oEvent.target).hasClass("sapUiIcon")) {
			_toggleOpen.call(this);
		}

	};

	/**
	 * Getter for property <code>value</code>.
	 *
	 * Returns a date as a string in the format defined in property <code>valueFormat</code>.
	 *
	 * <b>Note:</b> The value is always expected and updated in Gregorian calendar format. (If data binding is used the format of the binding is used.)
	 *
	 * If this property is used, the <code>dateValue</code> property should not be changed from the caller.
	 *
	 * @returns {string} the value of property <code>value</code>
	 * @public
	 * @name sap.m.DatePicker#getValue
	 * @function
	 */

	/**
	 * Setter for property <code>value</code>.
	 *
	 * Expects a date as a string in the format defined in property <code>valueFormat</code>.
	 *
	 * <b>Note:</b> The value is always expected and updated in Gregorian calendar format. (If data binding is used the format of the binding is used.)
	 *
	 * If this property is used, the <code>dateValue</code> property should not be changed from the caller.
	 *
	 * If Data binding using a <code>sap.ui.model.type.Date</code> is used, please set the <code>formatOption</code> <code>stricktParsing</code> to <code>true</code>.
	 * This prevents unwanted automatic corrections of wrong input.
	 *
	 * @param {string} sValue The new value of the input.
	 * @return {sap.m.DatePicker} <code>this</code> to allow method chaining
	 * @public
	 * @name sap.m.DatePicker#setValue
	 * @function
	 */
	DatePicker.prototype.setValue = function(sValue) {

		sValue = this.validateProperty("value", sValue); // to convert null and undefined to ""

		var sOldValue = this.getValue();
		if (sValue == sOldValue) {
			return this;
		} else {
			this._lastValue = sValue;
		}

		// set the property in any case but check validity on output
		this.setProperty("value", sValue, true); // no rerendering
		this._bValid = true;

		// convert to date object
		var oDate;
		if (sValue) {
			oDate = this._parseValue(sValue);
			if (!oDate || oDate.getTime() < this._oMinDate.getTime() || oDate.getTime() > this._oMaxDate.getTime()) {
				this._bValid = false;
				jQuery.sap.log.warning("Value can not be converted to a valid date", this);
				this._oWantedDate = oDate;
			}
		}
		if (this._bValid) {
			this.setProperty("dateValue", oDate, true); // no rerendering
			this._oWantedDate = undefined;
		}

		// do not call InputBase.setValue because the displayed value and the output value might have different pattern
		if (this.getDomRef()) {
			// convert to output
			var sOutputValue;
			if (oDate) {
				sOutputValue = this._formatValue(oDate);
			} else {
				sOutputValue = sValue;
			}

			if (this._$input.val() !== sOutputValue) {
				this._$input.val(sOutputValue);
				this._setLabelVisibility();
				this._curpos = this._$input.cursorPos();
			}
		}

		return this;

	};

	DatePicker.prototype.setDateValue = function(oDate) {

		if (oDate && !(oDate instanceof Date)) {
			throw new Error("Date must be a JavaScript date object; " + this);
		}

		if (jQuery.sap.equal(this.getDateValue(), oDate)) {
			return this;
		}

		if (oDate && (oDate.getTime() < this._oMinDate.getTime() || oDate.getTime() > this._oMaxDate.getTime())) {
			this._bValid = false;
			jQuery.sap.assert(this._bValid, "Date must be in valid range");
			this._oWantedDate = oDate;
			oDate = undefined; // don't use wrong date to determine sValue
		}else {
			this._bValid = true;
			this.setProperty("dateValue", oDate, true); // no rerendering
			this._oWantedDate = undefined;
		}

		// convert date object to value
		var sValue = this._formatValue(oDate, true);

		if (sValue !== this.getValue()) {
			this._lastValue = sValue;
		}
		// set the property in any case but check validity on output
		this.setProperty("value", sValue, true); // no rerendering

		if (this.getDomRef()) {
			// convert to output
			var sOutputValue = this._formatValue(oDate);

			if (this._$input.val() !== sOutputValue) {
				this._$input.val(sOutputValue);
				this._setLabelVisibility();
				this._curpos = this._$input.cursorPos();
			}
		}

		return this;

	};

	DatePicker.prototype.setMinDate = function(oDate) {

		if (oDate && !(oDate instanceof Date)) {
			throw new Error("Date must be a JavaScript date object; " + this);
		}

		if (jQuery.sap.equal(this.getMinDate(), oDate)) {
			return this;
		}

		if (oDate) {
			var iYear = oDate.getFullYear();
			if (iYear < 1 || iYear > 9999) {
				throw new Error("Date must be between 0001-01-01 and 9999-12-31; " + this);
			}

			this._oMinDate = new Date(oDate.getTime());
			var oDateValue = this.getDateValue();
			if (oDateValue && oDateValue.getTime() < oDate.getTime()) {
				jQuery.sap.log.warning("DateValue not in valid date -> changed to minDate", this);
				this.setDateValue(new Date(oDate.getTime()));
			}
		} else {
			this._oMinDate = new Date(1, 0, 1);
			this._oMinDate.setFullYear(1); // otherwise year 1 will be converted to year 1901
		}

		// re-render because order of parameter changes not clear -> check onBeforeRendering
		this.setProperty("minDate", oDate, false);

		if (this._oCalendar) {
			this._oCalendar.setMinDate(oDate);
		}

		return this;

	};

	DatePicker.prototype.setMaxDate = function(oDate) {

		if (oDate && !(oDate instanceof Date)) {
			throw new Error("Date must be a JavaScript date object; " + this);
		}

		if (jQuery.sap.equal(this.getMaxDate(), oDate)) {
			return this;
		}

		if (oDate) {
			var iYear = oDate.getFullYear();
			if (iYear < 1 || iYear > 9999) {
				throw new Error("Date must be between 0001-01-01 and 9999-12-31; " + this);
			}

			this._oMaxDate = new Date(oDate.getTime());
			var oDateValue = this.getDateValue();
			if (oDateValue && oDateValue.getTime() > oDate.getTime()) {
				jQuery.sap.log.warning("DateValue not in valid date -> changed to maxDate", this);
				this.setDateValue(new Date(oDate.getTime()));
			}
		} else {
			this._oMaxDate = new Date(9999, 11, 31, 23, 59, 59, 99);
		}

		// re-render because order of parameter changes not clear -> check onBeforeRendering
		this.setProperty("maxDate", oDate, false);

		if (this._oCalendar) {
			this._oCalendar.setMaxDate(oDate);
		}

		return this;

	};

	DatePicker.prototype._checkMinMaxDate = function() {

		if (this._oMinDate.getTime() > this._oMaxDate.getTime()) {
			jQuery.sap.log.warning("minDate > MaxDate -> dates switched", this);
			var oMaxDate = new Date(this._oMinDate.getTime());
			var oMinDate = new Date(this._oMaxDate.getTime());
			this._oMinDate = new Date(oMinDate.getTime());
			this._oMaxDate = new Date(oMaxDate.getTime());
			this.setProperty("minDate", oMinDate, true);
			this.setProperty("maxDate", oMaxDate, true);
			if (this._oCalendar) {
				this._oCalendar.setMinDate(oMinDate);
				this._oCalendar.setMaxDate(oMaxDate);
			}
		}

		// check if wanted date now in range
		if (this._oWantedDate && this._oWantedDate.getTime() >= this._oMinDate.getTime() && this._oWantedDate.getTime() <= this._oMaxDate.getTime()) {
			this.setDateValue(this._oWantedDate);
		}
	};

	DatePicker.prototype.setValueFormat = function(sValueFormat) {

		// if valueFormat changes the value must be parsed again

		this.setProperty("valueFormat", sValueFormat, true); // no rerendering
		var sValue = this.getValue();

		if (sValue) {
			var oDate = this._parseValue(sValue);
			if (!oDate || oDate.getTime() < this._oMinDate.getTime() || oDate.getTime() > this._oMaxDate.getTime()) {
				this._bValid = false;
				jQuery.sap.log.warning("Value can not be converted to a valid date", this);
			}else {
				this._bValid = true;
				this.setProperty("dateValue", oDate, true); // no rerendering
			}
		}

		return this;

	};

	DatePicker.prototype.setDisplayFormat = function(sDisplayFormat) {

		// if displayFormat changes the value must be formatted again

		this.setProperty("displayFormat", sDisplayFormat, true); // no rerendering
		var sOutputValue = this._formatValue(this.getDateValue());

		if (this.getDomRef() && (this._$input.val() !== sOutputValue)) {
			this._$input.val(sOutputValue);
			this._curpos = this._$input.cursorPos();
		}

		return this;

	};

	DatePicker.prototype.setDisplayFormatType = function(sDisplayFormatType) {

		if (sDisplayFormatType) {
			var bFound = false;
			for ( var sType in sap.ui.core.CalendarType) {
				if (sType == sDisplayFormatType) {
					bFound = true;
					break;
				}
			}
			if (!bFound) {
				throw new Error(sDisplayFormatType + " is not a valid calendar type" + this);
			}
		}

		this.setProperty("displayFormatType", sDisplayFormatType, true); // no rerendering

		// reuse update from format function
		this.setDisplayFormat(this.getDisplayFormat());

		return this;

	};

	DatePicker.prototype.setSecondaryCalendarType = function(sCalendarType){

		this._bSecondaryCalendarTypeSet = true; // as property can not be empty but we use it only if set
		this.setProperty("secondaryCalendarType", sCalendarType, true);

		if (this._oCalendar) {
			this._oCalendar.setSecondaryCalendarType(sCalendarType);
		}

		return this;

	};

	/**
	 * Adds some <code>specialDate</code> to the aggregation <code>specialDates</code>.
	 *
	 * @since 1.38.5
	 * @param {sap.ui.unified.DateTypeRange} oSpecialDate the specialDate to add; if empty, nothing is added
	 * @return {sap.m.DatePicker} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	DatePicker.prototype.addSpecialDate = function(oSpecialDate){

		_checkSpecialDate.call(this, oSpecialDate);

		this.addAggregation("specialDates", oSpecialDate, true);

		_invalidateCalendar.call(this);

		return this;

	};

	/**
	 * Inserts a <code>specialDate</code> to the aggregation <code>specialDates</code>.
	 *
	 * @since 1.38.5
	 * @param {sap.ui.unified.DateTypeRange} oSpecialDate the specialDate to insert; if empty, nothing is inserted
	 * @param {int} iIndex the 0-based index the <code>specialDate</code> should be inserted at;
	 *              for a negative value of <code>iIndex</code>, the <code>specialDate</code> is inserted at position 0;
	 *              for a value greater than the current size of the aggregation, the <code>specialDate</code> is inserted at the last position
	 * @return {sap.m.DatePicker} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	DatePicker.prototype.insertSpecialDate = function(oSpecialDate, iIndex){

		_checkSpecialDate.call(this, oSpecialDate);

		this.insertAggregation("specialDates", oSpecialDate, iIndex, true);

		_invalidateCalendar.call(this);

		return this;

	};

	/**
	 * Removes a <code>specialDate</code> from the aggregation <code>specialDates</code>.
	 *
	 * @since 1.38.5
	 * @param {sap.ui.unified.DateTypeRange} oSpecialDate The <code>specialDate</code> to remove or its index or id
	 * @return {sap.ui.unified.DateTypeRange} The removed <code>specialDate</code> or null
	 * @public
	 */
	DatePicker.prototype.removeSpecialDate = function(oSpecialDate){

		var oRemoved = this.removeAggregation("specialDates", oSpecialDate, true);

		_invalidateCalendar.call(this);

		return oRemoved;

	};

	DatePicker.prototype.removeAllSpecialDates = function(){

		var aRemoved = this.removeAllAggregation("specialDates", true);

		_invalidateCalendar.call(this);

		return aRemoved;

	};

	DatePicker.prototype.destroySpecialDates = function(){

		this.destroyAggregation("specialDates", true);

		_invalidateCalendar.call(this);

		return this;

	};

	/**
	 * Sets the associated legend.
	 *
	 * @since 1.38.5
	 * @param {sap.ui.core.ID | sap.ui.unified.CalendarLegend} oLegend ID of an element which becomes the new target of this <code>legend</code> association;
	 *                                                         alternatively, an element instance may be given
	 * @return {sap.m.DatePicker} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	DatePicker.prototype.setLegend = function(oLegend){

		this.setAssociation("legend", oLegend, true);

		var sId = this.getLegend();
		if (sId) {
			if (!sap.ui.unified.CalendarLegend) {
				sap.ui.getCore().loadLibrary("sap.ui.unified");
				jQuery.sap.require("sap.ui.unified.library");
			}
			oLegend = sap.ui.getCore().byId(sId);
			if (oLegend && !(oLegend instanceof sap.ui.unified.CalendarLegend)) {
				throw new Error(oLegend + " is not an sap.ui.unified.CalendarLegend. " + this);
			}
		}

		if (this._oCalendar) {
			this._oCalendar.setLegend(sId);
		}

		return this;

	};

	DatePicker.prototype.onChange = function(oEvent) {
		// don't call InputBase onChange because this calls setValue what would trigger a new formatting

		// check the control is editable or not
		if (!this.getEditable() || !this.getEnabled()) {
			return;
		}

		// set date before fire change event
		var sValue = this._$input.val();
		var sOldValue = this._formatValue(this.getDateValue());

		if (sValue == sOldValue && this._bValid) {
			// only needed if value really changed
			return;
		}

		var oDate;
		this._oWantedDate = undefined;
		this._bValid = true;
		if (sValue != "") {
			oDate = this._parseValue(sValue, true);
			if (!oDate || oDate.getTime() < this._oMinDate.getTime() || oDate.getTime() > this._oMaxDate.getTime()) {
				this._bValid = false;
				oDate = undefined;
			}else {
				// check if Formatter changed the value (it correct some wrong inputs or known patterns)
				sValue = this._formatValue(oDate);
			}
		}

		if (this.getDomRef() && (this._$input.val() !== sValue)) {
			this._$input.val(sValue);
			this._curpos = this._$input.cursorPos();
			if (this.bShowLabelAsPlaceholder) {
				// because value property might not be updated between typing
				this.$("placeholder").css("display", sValue ? "none" : "inline");
			}
		}

		if (oDate) {
			// get the value in valueFormat
			sValue = this._formatValue(oDate, true);
		}

		// compare with the old known value
		if (this._lastValue !== sValue
			|| (oDate && this.getDateValue() && oDate.getFullYear() !== this.getDateValue().getFullYear())) {
			// remember the last value on change
			this._lastValue = sValue;

			this.setProperty("value", sValue, true); // no rerendering
			var sNewValue = this.getValue(); // in databinding a formatter could change the value (including dateValue) directly

			if (this._bValid && sValue == sNewValue) {
				this.setProperty("dateValue", oDate, true); // no rerendering
			}

			sValue = sNewValue;

			if (this._oPopup && this._oPopup.isOpen()) {
				if (this._bValid) {
					oDate = this.getDateValue(); // as in databinding a formatter could change the date
				}
				this._oCalendar.focusDate(oDate);
				var oStartDate = this._oDateRange.getStartDate();
				if ((!oStartDate && oDate) || (oStartDate && oDate && oStartDate.getTime() != oDate.getTime())) {
					this._oDateRange.setStartDate(new Date(oDate.getTime()));
				} else if (oStartDate && !oDate) {
					this._oDateRange.setStartDate(undefined);
				}
			}

			this.fireChangeEvent(sValue, {valid: this._bValid});
		}

	};

	// overwrite _getInputValue to do the conversion there
	DatePicker.prototype._getInputValue = function(sValue) {

		sValue = (typeof sValue == "undefined") ? this._$input.val() : sValue.toString();

		var oDate = this._parseValue(sValue, true);
		sValue = this._formatValue(oDate, true);

		return sValue;

	};

	// overwrite _getInputValue to do the output conversion
	DatePicker.prototype.updateDomValue = function(sValue) {

		// dom value updated other than value property
		this._bCheckDomValue = true;

		sValue = (typeof sValue == "undefined") ? this._$input.val() : sValue.toString();
		this._curpos = this._$input.cursorPos();

		var oDate = this._parseValue(sValue, true);
		sValue = this._formatValue(oDate);

		// update the DOM value when necessary
		// otherwise cursor can goto end of text unnecessarily
		if (this.isActive() && (this._$input.val() !== sValue)) {
			this._$input.val(sValue);
			this._$input.cursorPos(this._curpos);
		}

		// update synthetic placeholder visibility
		this._setLabelVisibility();

		return this;
	};

	DatePicker.prototype._parseValue = function(sValue, bDisplayFormat) {

		var oFormat = _getFormatter.call(this, bDisplayFormat);

		// convert to date object
		var oDate = oFormat.parse(sValue);
		return oDate;

	};

	// converts the date to the output format, but if bValueFormat set it converts it to the input format
	DatePicker.prototype._formatValue = function(oDate, bValueFormat) {

		var sValue = "";

		if (oDate) {
			var oFormat = _getFormatter.call(this, !bValueFormat);
			// convert to date object
			sValue = oFormat.format(oDate);
		}

		return sValue;

	};

	DatePicker.prototype._getPlaceholder = function() {

		var sPlaceholder = this.getPlaceholder();

		if (!sPlaceholder) {
			var oBinding = this.getBinding("value");

			if (oBinding && oBinding.oType && (oBinding.oType instanceof Date1)) {
				sPlaceholder = oBinding.oType.getOutputPattern();
			} else {
				sPlaceholder = this.getDisplayFormat();
			}

			if (!sPlaceholder) {
				sPlaceholder = "medium";
			}

			if (this._checkStyle(sPlaceholder)) {
				var oLocale = sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale();
				var oLocaleData = sap.ui.core.LocaleData.getInstance(oLocale);
				sPlaceholder = this._getPlaceholderPattern(oLocaleData, sPlaceholder);
			}
		}

		return sPlaceholder;

	};

	DatePicker.prototype._getPlaceholderPattern = function(oLocaleData, sPlaceholder) {

		return oLocaleData.getDatePattern(sPlaceholder);

	};

	function _open(){

		this._createPopup();

		this._createPopupContent();

		// set displayFormatType as PrimaryCalendarType
		// not only one because it depends on DataBinding
		var sCalendarType;
		var oBinding = this.getBinding("value");

		if (oBinding && oBinding.oType && (oBinding.oType instanceof Date1)) {
			sCalendarType = oBinding.oType.oOutputFormat.oFormatOptions.calendarType;
		}

		if (!sCalendarType) {
			sCalendarType = this.getDisplayFormatType();
		}

		if (sCalendarType) {
			this._oCalendar.setPrimaryCalendarType(sCalendarType);
		}

		var sValue = this._bValid ? this._formatValue(this.getDateValue()) : this.getValue();
		if (sValue != this._$input.val()) {
			this.onChange(); // to check manually typed in text
		}

		this._fillDateRange();

		this._openPopup();

		// Fire navigate event when the calendar popup opens
		this.fireNavigate({
			dateRange: this._getVisibleDatesRange(this._oCalendar)
		});

	}

	// to be overwritten by DateTimePicker
	DatePicker.prototype._createPopup = function(){

		if (!this._oPopup) {
			jQuery.sap.require("sap.ui.core.Popup");
			this._oPopup = new sap.ui.core.Popup();
			this._oPopup.setAutoClose(true);
			this._oPopup.setDurations(0, 0); // no animations
			this._oPopup.attachOpened(_handleOpened, this);
			this._oPopup.attachClosed(_handleClosed, this);
		}

	};

	// to be overwritten by DateTimePicker
	DatePicker.prototype._openPopup = function(){

		if (!this._oPopup) {
			return;
		}

		this._oPopup.setAutoCloseAreas([this.getDomRef()]);

		var eDock = sap.ui.core.Popup.Dock;
		var sAt;
		if (this.getTextAlign() == sap.ui.core.TextAlign.End) {
			sAt = eDock.EndBottom + "-4"; // as m.Input has some padding around
			this._oPopup.open(0, eDock.EndTop, sAt, this, null, "fit", true);
		}else {
			sAt = eDock.BeginBottom + "-4"; // as m.Input has some padding around
			this._oPopup.open(0, eDock.BeginTop, sAt, this, null, "fit", true);
		}

	};

	/**
	 * Creates a DateRange with the first and the last visible days in the calendar popup
	 * @param {sap.ui.unified.Calendar} oCalendar
	 * @returns {sap.ui.unified.DateRange}
	 * @private
	 */
	DatePicker.prototype._getVisibleDatesRange = function (oCalendar) {
		var aVisibleDays = oCalendar._getVisibleDays();

		// Convert to local JavaScript Date
		return new sap.ui.unified.DateRange({
			startDate: aVisibleDays[0].toLocalJSDate(), // First visible date
			endDate: aVisibleDays[aVisibleDays.length - 1].toLocalJSDate() // Last visible date
		});
	};

	// to be overwritten by DateTimePicker
	DatePicker.prototype._createPopupContent = function(){

		if (!this._oCalendar) {
			sap.ui.getCore().loadLibrary("sap.ui.unified");
			jQuery.sap.require("sap.ui.unified.library");
			this._oCalendar = new sap.ui.unified.Calendar(this.getId() + "-cal", {
				intervalSelection: this._bIntervalSelection,
				minDate: this.getMinDate(),
				maxDate: this.getMaxDate(),
				legend: this.getLegend(),
				startDateChange: function () {
						this.fireNavigate({
							dateRange: this._getVisibleDatesRange(this._oCalendar)
						});
					}.bind(this)
				});
			this._oDateRange = new sap.ui.unified.DateRange();
			this._oCalendar.addSelectedDate(this._oDateRange);
			if (this.$().closest(".sapUiSizeCompact").length > 0) {
				this._oCalendar.addStyleClass("sapUiSizeCompact");
			}
			if (this._bSecondaryCalendarTypeSet) {
				this._oCalendar.setSecondaryCalendarType(this.getSecondaryCalendarType());
			}
			if (this._bOnlyCalendar) {
				this._oCalendar.attachSelect(this._selectDate, this);
				this._oCalendar.attachCancel(_cancel, this);
				this._oCalendar.attachEvent("_renderMonth", _resizeCalendar, this);
				this._oCalendar.setPopupMode(true);
				this._oCalendar.setParent(this, undefined, true); // don't invalidate DatePicker
				this._oPopup.setContent(this._oCalendar);
			}
		}

	};

	DatePicker.prototype._fillDateRange = function(){

		var oDate = this.getDateValue();

		if (oDate) {
			this._oCalendar.focusDate(new Date(oDate.getTime()));
			if (!this._oDateRange.getStartDate() || this._oDateRange.getStartDate().getTime() != oDate.getTime()) {
				this._oDateRange.setStartDate(new Date(oDate.getTime()));
			}
		} else {
			var oFocusDate = new Date();
			var iMaxTimeMillis = this._oMaxDate.getTime() + 86400000 /* one day in milliseconds */;

			if (oFocusDate.getTime() < this._oMinDate.getTime() || oFocusDate.getTime() > iMaxTimeMillis) {
				oFocusDate = this._oMinDate;
			}
			this._oCalendar.focusDate(oFocusDate);

			if (this._oDateRange.getStartDate()) {
				this._oDateRange.setStartDate(undefined);
			}
		}

	};

	DatePicker.prototype._getFormatInstance = function(oArguments, bDisplayFormat){

		return sap.ui.core.format.DateFormat.getInstance(oArguments);

	};

	DatePicker.prototype._checkStyle = function(sPattern){

		if (sPattern == "short" || sPattern == "medium" || sPattern == "long" || sPattern == "full") {
			return true;
		} else {
			return false;
		}

	};

	/**
	 * @see sap.ui.core.Control#getAccessibilityInfo
	 * @protected
	 */
	DatePicker.prototype.getAccessibilityInfo = function() {
		var oRenderer = this.getRenderer();
		var oInfo = InputBase.prototype.getAccessibilityInfo.apply(this, arguments);
		var sValue = this.getValue() || "";
		if (this._bValid) {
			var oDate = this.getDateValue();
			if (oDate) {
				sValue = this._formatValue(oDate);
			}
		}
		oInfo.type = sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("ACC_CTR_TYPE_DATEINPUT");
		oInfo.description = [sValue, oRenderer.getLabelledByAnnouncement(this), oRenderer.getDescribedByAnnouncement(this)].join(" ").trim();
		return oInfo;
	};

	function _toggleOpen(){

		if (this.getEditable() && this.getEnabled()) {
			if (!this._oPopup || !this._oPopup.isOpen()) {
				_open.call(this);
			} else {
				_cancel.call(this);
			}
		}

	}

	DatePicker.prototype._selectDate = function(oEvent){

		var oDateOld = this.getDateValue();
		var oDate = this._getSelectedDate();
		var sValue = "";

		// do not use this.onChange() because output pattern will change date (e.g. only last 2 number of year -> 1966 -> 2066 )
		if (!jQuery.sap.equal(oDate, oDateOld)) {
			this.setDateValue(new Date(oDate.getTime()));
			// compare Dates because value can be the same if only 2 digits for year
			sValue = this.getValue();
			this.fireChangeEvent(sValue, {valid: true});
			if (this.getDomRef() && (Device.system.desktop || !Device.support.touch) && !jQuery.sap.simulateMobileOnDesktop) { // as control could be destroyed during update binding
				this._curpos = this._$input.val().length;
				this._$input.cursorPos(this._curpos);
			}
		}else if (!this._bValid){
			// wrong input before open calendar
			sValue = this._formatValue(oDate);
			if (sValue != this._$input.val()) {
				this._bValid = true;
				if (this.getDomRef()) { // as control could be destroyed during update binding
					this._$input.val(sValue);
					this._lastValue = sValue;
				}
				this.setProperty("value", sValue, true); // no rerendering
				this.fireChangeEvent(sValue, {valid: true});
			}
		}

		// close popup and focus input after change event to allow application to reset value state or similar things
		this._oPopup.close();

	};

	DatePicker.prototype._getSelectedDate = function(){

		var aSelectedDates = this._oCalendar.getSelectedDates();
		var oDate;

		if (aSelectedDates.length > 0) {
			oDate = aSelectedDates[0].getStartDate();
		}

		return oDate;

	};

	function _cancel(oEvent) {

		if (this._oPopup && this._oPopup.isOpen()) {
			this._oPopup.close();
			if ((Device.system.desktop || !Device.support.touch) && !jQuery.sap.simulateMobileOnDesktop) {
				this.focus();
			}
		}

	}

	function _increaseDate(iNumber, sUnit) {

		var oOldDate = this.getDateValue();
		var iCurpos = this._$input.cursorPos();

		if (oOldDate && this.getEditable() && this.getEnabled()) {
			// use UniversalDate to calculate new date based on used calendar
			var sCalendarType;
			var oBinding = this.getBinding("value");

			if (oBinding && oBinding.oType && (oBinding.oType instanceof Date1)) {
				sCalendarType = oBinding.oType.oOutputFormat.oFormatOptions.calendarType;
			}
			if (!sCalendarType) {
				sCalendarType = this.getDisplayFormatType();
			}

			var oDate = UniversalDate.getInstance(new Date(oOldDate.getTime()), sCalendarType);
			oOldDate = UniversalDate.getInstance(new Date(oOldDate.getTime()), sCalendarType);

			switch (sUnit) {
			case "day":
				oDate.setDate(oDate.getDate() + iNumber);
				break;
			case "month":
				oDate.setMonth(oDate.getMonth() + iNumber);
				var iMonth = (oOldDate.getMonth() + iNumber) % 12;
				if (iMonth < 0) {
					iMonth = 12 + iMonth;
				}
				while (oDate.getMonth() != iMonth) {
					// day don't exist in this month (e.g. 31th)
					oDate.setDate(oDate.getDate() - 1);
				}
				break;
			case "year":
				oDate.setFullYear(oDate.getFullYear() + iNumber);
				while (oDate.getMonth() != oOldDate.getMonth()) {
					// day don't exist in this month (February 29th)
					oDate.setDate(oDate.getDate() - 1);
				}
				break;

			default:
				break;
			}

			if (oDate.getTime() < this._oMinDate.getTime()) {
				oDate = new UniversalDate(this._oMinDate.getTime());
			}else if (oDate.getTime() > this._oMaxDate.getTime()){
				oDate = new UniversalDate(this._oMaxDate.getTime());
			}

			if (!jQuery.sap.equal(this.getDateValue(), oDate.getJSDate())) {
				this.setDateValue(new Date(oDate.getTime()));

				this._curpos = iCurpos;
				this._$input.cursorPos(this._curpos);

				var sValue = this.getValue();
				this.fireChangeEvent(sValue, {valid: true});
			}
		}

	}

	function _handleOpened(oEvent) {

		this._renderedDays = this._oCalendar.$("-Month0-days").find(".sapUiCalItem").length;

		this.$("inner").attr("aria-owns", this.getId() + "-cal");
		this.$("inner").attr("aria-expanded", true);

	}

	function _handleClosed(oEvent) {
		this.$("inner").attr("aria-expanded", false);
	}

	function _resizeCalendar(oEvent){

		var iDays = oEvent.getParameter("days");

		if (iDays > this._renderedDays) {
			// calendar gets larger, so it could move out of the page -> reposition
			this._renderedDays = iDays;
			this._oPopup._applyPosition(this._oPopup._oLastPosition);
		}

	}

	function _getFormatter(bDisplayFormat) {

		var sPattern = "";
		var bRelative = false; // if true strings like "Tomorrow" are parsed fine
		var oFormat;
		var oBinding = this.getBinding("value");
		var sCalendarType;

		if (oBinding && oBinding.oType && (oBinding.oType instanceof Date1)) {
			sPattern = oBinding.oType.getOutputPattern();
			bRelative = !!oBinding.oType.oOutputFormat.oFormatOptions.relative;
			sCalendarType = oBinding.oType.oOutputFormat.oFormatOptions.calendarType;
		}

		/* eslint-disable no-lonely-if */
		if (!sPattern) {
			// not databinding is used -> use given format
			if (bDisplayFormat) {
				sPattern = ( this.getDisplayFormat() || "medium" );
				sCalendarType = this.getDisplayFormatType();
			} else {
				sPattern = ( this.getValueFormat() || "short" );
				sCalendarType = sap.ui.core.CalendarType.Gregorian;
			}
		}

		if (!sCalendarType) {
			sCalendarType = sap.ui.getCore().getConfiguration().getCalendarType();
		}

		if (bDisplayFormat) {
			if (sPattern == this._sUsedDisplayPattern && sCalendarType == this._sUsedDisplayCalendarType) {
				oFormat = this._oDisplayFormat;
			}
		} else {
			if (sPattern == this._sUsedValuePattern && sCalendarType == this._sUsedValueCalendarType) {
				oFormat = this._oValueFormat;
			}
		}

		if (!oFormat) {
			if (this._checkStyle(sPattern)) {
				oFormat = this._getFormatInstance({style: sPattern, strictParsing: true, relative: bRelative, calendarType: sCalendarType}, bDisplayFormat);
			} else {
				oFormat = this._getFormatInstance({pattern: sPattern, strictParsing: true, relative: bRelative, calendarType: sCalendarType}, bDisplayFormat);
			}
			if (bDisplayFormat) {
				this._sUsedDisplayPattern = sPattern;
				this._sUsedDisplayCalendarType = sCalendarType;
				this._oDisplayFormat = oFormat;
			} else {
				this._sUsedValuePattern = sPattern;
				this._sUsedValueCalendarType = sCalendarType;
				this._oValueFormat = oFormat;
			}
		}

		return oFormat;

	}

	function _checkSpecialDate(oSpecialDate) {

		if (!sap.ui.unified.DateTypeRange) {
			sap.ui.getCore().loadLibrary("sap.ui.unified");
			jQuery.sap.require("sap.ui.unified.library");
		}

		if (oSpecialDate && !(oSpecialDate instanceof sap.ui.unified.DateTypeRange)) {
			throw new Error(oSpecialDate + "is not valid for aggregation \"specialDates\" of " + this);
		}

	}

	function _invalidateCalendar() {

		if (this._oPopup && this._oPopup.isOpen()) {
			// calendar is displayed -> update it immediately
			this._oCalendar._bDateRangeChanged = true;
			this._oCalendar.invalidate();
		}

	}

	/**
	 * This event gets fired when the input operation has finished and the value has changed.
	 *
	 * @name sap.m.DatePicker#change
	 * @event
	 * @param {sap.ui.base.Event} oControlEvent
	 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
	 * @param {object} oControlEvent.getParameters
	 * @param {string} oControlEvent.getParameters.value The new value of the <code>sap.m.DatePicker</code> as specified by <code>valueFormat</code>.
	 * @param {boolean} oControlEvent.getParameters.valid Indicator for a valid date.
	 * @public
	 */

	 /**
	 * Fire event change to attached listeners.
	 *
	 * Expects following event parameters:
	 * <ul>
	 * <li>'value' of type <code>string</code> The new value of the <code>sap.m.DatePicker</code>.</li>
	 * <li>'valid' of type <code>boolean</code> Indicator for a valid date.</li>
	 * </ul>
	 *
	 * @param {Map} [mArguments] the arguments to pass along with the event.
	 * @return {sap.m.DatePicker} <code>this</code> to allow method chaining
	 * @protected
	 * @name sap.m.DatePicker#fireChange
	 * @function
	 */

	return DatePicker;

}, /* bExport= */ true);
