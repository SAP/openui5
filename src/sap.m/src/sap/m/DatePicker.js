/*!
 * ${copyright}
 */

// Provides control sap.m.DatePicker.
sap.ui.define([
	'sap/ui/thirdparty/jquery',
	'sap/ui/Device',
	'./InputBase',
	'./DateTimeField',
	'./Button',
	'./ResponsivePopover',
	'sap/ui/core/date/UniversalDate',
	'./library',
	'sap/ui/core/Control',
	'sap/ui/core/library',
	"./DatePickerRenderer",
	"sap/base/util/deepEqual",
	"sap/base/assert",
	"sap/base/Log",
	"sap/ui/core/IconPool",
	"./InstanceManager",
	// jQuery Plugin "cursorPos"
	"sap/ui/unified/Calendar",
	"sap/ui/unified/DateRange",
	"sap/ui/unified/calendar/CustomMonthPicker",
	"sap/ui/unified/calendar/CustomYearPicker",
	"sap/ui/dom/jquery/cursorPos"
],
	function(
		jQuery,
		Device,
		InputBase,
		DateTimeField,
		Button,
		ResponsivePopover,
		UniversalDate,
		library,
		Control,
		coreLibrary,
		DatePickerRenderer,
		deepEqual,
		assert,
		Log,
		IconPool,
		InstanceManager,
		Calendar,
		DateRange,
		CustomMonthPicker,
		CustomYearPicker
	) {
	"use strict";


	// shortcut for sap.ui.core.CalendarType
	var CalendarType = coreLibrary.CalendarType;

	var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");

	/**
	 * Constructor for a new <code>DatePicker</code>.
	 *
	 * @param {string} [sId] Id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Enables the users to select a localized date between 0001-01-01 and 9999-12-31.
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
	 * <li>Typing it in directly in the input field</li></ul>
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
	 * JavaScript Date object or you want to work with a JavaScript Date object.
	 * Use <code>dateValue</code> as a helper property to easily obtain the day, month and year
	 * of the chosen date. Although possible to bind it, the recommendation is not to do it.
	 * When binding is needed, use <code>value</code> property instead</li></ul>
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
	 * @extends sap.m.DateTimeField
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.22.0
	 * @alias sap.m.DatePicker
	 * @see {@link fiori:https://experience.sap.com/fiori-design-web/date-picker/ Date Picker}
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var DatePicker = DateTimeField.extend("sap.m.DatePicker", /** @lends sap.m.DatePicker.prototype */ { metadata : {

		library : "sap.m",
		properties : {

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
			maxDate : {type : "object", group : "Misc", defaultValue : null},

			/**
			 * Hides or shows the popover's footer.
			 *
			 * @since 1.70
			 */
			showFooter : {type : "boolean", group : "Misc", defaultValue : false}

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
			specialDates : {type : "sap.ui.core.Element", multiple : true, singularName : "specialDate"},

			/**
			 * Internal aggregation that contains the inner picker pop-up.
			 *
			 * @since 1.70
			 */
			_popup: { type: "sap.m.ResponsivePopover", multiple : false, visibility: "hidden" }
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
					dateRange : {type : "sap.ui.unified.DateRange"},

					/**
					 * Indicates if the event is fired, due to popup being opened.
					 */
					afterPopupOpened : {type : "boolean"}

				}
			}
		},
		designtime: "sap/m/designtime/DatePicker.designtime",
		dnd: { draggable: false, droppable: true }
	}});


	/**
	 * The date is displayed in the input field using this format. By default, the medium format of the used locale is used.
	 *
	 * Supported format options are pattern-based on Unicode LDML Date Format notation. {@link http://unicode.org/reports/tr35/#Date_Field_Symbol_Table}
	 * <b>Note:</b> If you use data binding on the <code>value</code> property with type <code>sap.ui.model.type.Date</code> this property will be ignored.
	 * The format defined in the binding will be used.
	 *
	 * @returns {string} the value of property <code>displayFormat</code>
	 * @public
	 * @name sap.m.DatePicker#getDisplayFormat
	 * @function
	 */

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
	 *
	 * @returns {string} the value of property <code>valueFormat</code>
	 * @public
	 * @name sap.m.DatePicker#getValueFormat
	 * @function
	 */

	/**
	 * The date as JavaScript Date object. This is independent from any formatter.
	 *
	 * <b>Note:</b> If this property is used, the <code>value</code> property should not be changed from the caller.
	 *
	 * @returns {object} the value of property <code>dateValue</code>
	 * @public
	 * @name sap.m.DatePicker#getDateValue
	 * @function
	 */

	DatePicker.prototype.init = function() {

		DateTimeField.prototype.init.apply(this, arguments);

		this._bIntervalSelection = false;
		this._bOnlyCalendar = true;

		this._bValid = true;

		this._oMinDate = new Date(1, 0, 1); // set the date to minimum possible for that day
		this._oMinDate.setFullYear(1); // otherwise year 1 will be converted to year 1901
		this._oMaxDate = new Date(9999, 11, 31, 23, 59, 59, 999); // set the date for the maximum possible for that day

		var oIcon = this.addEndIcon({
			id: this.getId() + "-icon",
			src: this.getIconSrc(),
			noTabStop: true,
			tooltip: oResourceBundle.getText("OPEN_PICKER_TEXT")
		});

		// idicates whether the picker is still open
		this._bShouldClosePicker = false;

		oIcon.addEventDelegate({
			onmousedown: function (oEvent) {
				// as the popup closes automatically on blur - we need to remember its state
				this._bShouldClosePicker = !!this.isOpen();
			}
		}, this);

		oIcon.attachPress(function () {
			this.toggleOpen(this._bShouldClosePicker);
		}, this);
	};

	/**
	 * Returns if the last entered value is valid.
	 *
	 * @returns {boolean}
	 * @public
	 * @since 1.64
	 */
	DatePicker.prototype.isValidValue = function() {
		return this._bValid;
	};

	/**
	 * Checks if the picker is open
	 * @returns {boolean}
	 * @protected
	 */
	DatePicker.prototype.isOpen = function () {
		return this._oPopup && this._oPopup.isOpen();
	};

	DatePicker.prototype.toggleOpen = function (bOpened) {
		if (this.getEditable() && this.getEnabled()) {
			if (bOpened) {
				_cancel.call(this);
			} else {
				_open.call(this);
			}
		}
	};

	DatePicker.prototype.getIconSrc = function () {
		return IconPool.getIconURI("appointment-2");
	};

	DatePicker.prototype.exit = function() {

		InputBase.prototype.exit.apply(this, arguments);

		if (this._oPopup) {
			if (this._oPopup.isOpen()) {
				this._oPopup.close();
			}
			delete this._oPopup;
		}

		if (this._getCalendar()) {
			this._getCalendar().destroy();
			delete this._getCalendar();
		}

		if (this._iInvalidateCalendar) {
			clearTimeout(this._iInvalidateCalendar);
		}

		this._sUsedDisplayPattern = undefined;
		this._sUsedDisplayCalendarType = undefined;
		this._oDisplayFormat = undefined;
		this._sUsedValuePattern = undefined;
		this._sUsedValueCalendarType = undefined;
		this._oValueFormat = undefined;
	};

	DatePicker.prototype.invalidate = function(oOrigin) {

		if (!oOrigin || oOrigin != this._getCalendar()) {
			// Calendar is only invalidated by DatePicker itself -> so don't invalidate DatePicker
			Control.prototype.invalidate.apply(this, arguments);
			// Invalidate calendar with a delayed call so it could have updated specialDates aggregation from DatePicker
			this._iInvalidateCalendar = setTimeout(_invalidateCalendar.bind(this), 0);
		}

	};

	DatePicker.prototype.onBeforeRendering = function() {

		DateTimeField.prototype.onBeforeRendering.apply(this, arguments);

		this._checkMinMaxDate();

		var oValueHelpIcon = this._getValueHelpIcon();

		if (oValueHelpIcon) {
			oValueHelpIcon.setProperty("visible", this.getEditable(), true);
		}

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

		if (!Device.support.touch || Device.system.desktop) {
			InputBase.prototype.applyFocusInfo.apply(this, arguments);
		}

	};

	DatePicker.prototype.onfocusin = function(oEvent) {

		if (!jQuery(oEvent.target).hasClass("sapUiIcon")) {
			InputBase.prototype.onfocusin.apply(this, arguments);
		}

		this._bFocusNoPopup = undefined;

	};

	DatePicker.prototype.onsapshow = function(oEvent) {

		this.toggleOpen(this.isOpen());
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

		var oFormatter = this._getFormatter(true);
		var sChar = String.fromCharCode(oEvent.charCode);

		if (sChar && oFormatter.sAllowedCharacters && oFormatter.sAllowedCharacters.indexOf(sChar) < 0) {
			oEvent.preventDefault();
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

	DatePicker.prototype._getValueHelpIcon = function () {
		var oValueHelpIcon = this.getAggregation("_endIcon");

		return oValueHelpIcon && oValueHelpIcon[0];
	};

	DatePicker.prototype._dateValidation = function (oDate) {
		this._bValid = true;

		if (oDate && (oDate.getTime() < this._oMinDate.getTime() || oDate.getTime() > this._oMaxDate.getTime())) {
			this._bValid = false;
			assert(this._bValid, "Date must be in valid range");
		}

		this.setProperty("dateValue", oDate);

		return oDate;
	};

	DatePicker.prototype.setMinDate = function(oDate) {

		if (this._isValidDate(oDate)) {
			throw new Error("Date must be a JavaScript date object; " + this);
		}

		if (deepEqual(this.getMinDate(), oDate)) {
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
				this._bValid = false;
				Log.warning("DateValue not in valid date range", this);
			}
		} else {
			this._oMinDate = new Date(1, 0, 1);
			this._oMinDate.setFullYear(1); // otherwise year 1 will be converted to year 1901
		}

		// re-render because order of parameter changes not clear -> check onBeforeRendering
		this.setProperty("minDate", oDate);

		if (this._getCalendar()) {
			this._getCalendar().setMinDate(oDate);
		}

		this._oMinDate.setHours(0, 0, 0, 0);//clear the time part

		return this;

	};

	DatePicker.prototype.setMaxDate = function(oDate) {

		if (this._isValidDate(oDate)) {
			throw new Error("Date must be a JavaScript date object; " + this);
		}

		if (deepEqual(this.getMaxDate(), oDate)) {
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
				this._bValid = false;
				Log.warning("DateValue not in valid date", this);
			}
		} else {
			this._oMaxDate = new Date(9999, 11, 31, 23, 59, 59, 999);
		}

		// re-render because order of parameter changes not clear -> check onBeforeRendering
		this.setProperty("maxDate", oDate);

		if (this._getCalendar()) {
			this._getCalendar().setMaxDate(oDate);
		}

		this._oMaxDate.setHours(23, 59, 59, 999);//set to max possible hours for this day

		return this;

	};

	DatePicker.prototype._checkMinMaxDate = function () {

		if (this._oMinDate.getTime() > this._oMaxDate.getTime()) {
			Log.warning("minDate > MaxDate -> dates switched", this);
			var oMaxDate = new Date(this._oMinDate.getTime());
			var oMinDate = new Date(this._oMaxDate.getTime());
			this._oMinDate = new Date(oMinDate.getTime());
			this._oMaxDate = new Date(oMaxDate.getTime());
			this.setProperty("minDate", oMinDate, true);
			this.setProperty("maxDate", oMaxDate, true);
			if (this._getCalendar()) {
				this._getCalendar().setMinDate(oMinDate);
				this._getCalendar().setMaxDate(oMaxDate);
			}
		}

		var oDateValue = this.getDateValue();

		if (oDateValue &&
			(oDateValue.getTime() < this._oMinDate.getTime() || oDateValue.getTime() > this._oMaxDate.getTime())) {
			this._bValid = false;
			Log.error("dateValue " + oDateValue.toString() + "(value=" + this.getValue() + ") does not match " +
				"min/max date range(" + this._oMinDate.toString() + " - " + this._oMaxDate.toString() + "). App. " +
				"developers should take care to maintain dateValue/value accordingly.", this);
		}
	};


	DatePicker.prototype.getDisplayFormatType = function () {
		return this.getProperty("displayFormatType");
	};

	DatePicker.prototype._handleDateValidation = function (oDate) {
		this._bValid = true;

		if (!oDate || oDate.getTime() < this._oMinDate.getTime() || oDate.getTime() > this._oMaxDate.getTime()) {
			this._bValid = false;
			Log.warning("Value can not be converted to a valid date", this);
		}

		this.setProperty("dateValue", oDate);
	};


	DatePicker.prototype.setDisplayFormatType = function(sDisplayFormatType) {

		if (sDisplayFormatType) {
			var bFound = false;
			for ( var sType in CalendarType) {
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

		if (this._getCalendar()) {
			this._getCalendar().setSecondaryCalendarType(sCalendarType);
		}

		return this;

	};

	/**
	 * Sets <code>showFooter</code> property to the given boolean value
	 *
	 * @since 1.70
	 * @param {} bFlag when true footer is displayed
	 * @public
	 */
	DatePicker.prototype.setShowFooter = function(bFlag) {
		var oPopup = this._oPopup,
			oCalendar = this._getCalendar();

		this.setProperty("showFooter", bFlag);

		if (!oPopup || !oCalendar) {
			return this;
		}

		oPopup._getButtonFooter().setVisible(bFlag);

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
			var CalendarLegend = sap.ui.require("sap/ui/unified/CalendarLegend");
			oLegend = sap.ui.getCore().byId(sId);
			if (oLegend && !(typeof CalendarLegend == "function" && oLegend instanceof CalendarLegend)) {
				throw new Error(oLegend + " is not an sap.ui.unified.CalendarLegend. " + this);
			}
		}

		if (this._getCalendar()) {
			this._getCalendar().setLegend(sId);
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
		var sValue = this._$input.val(),
			sOldValue = this._formatValue(this.getDateValue()),
			oDate;

		if (sValue == sOldValue && this._bValid) {
			// only needed if value really changed
			return;
		}

		if (this.getShowFooter() && this._oPopup && !sValue) {
			this._oPopup.getBeginButton().setEnabled(false);
		}

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
		}

		if (oDate) {//user input is parsed successfully and the date fits to the min/max range
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

			if (this.isOpen()) {
				if (this._bValid) {
					oDate = this.getDateValue(); // as in databinding a formatter could change the date
				}
				this._getCalendar().focusDate(oDate);
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

		if (this.isActive() && (this._$input.val() !== sValue)) {
			// dom value updated other than value property
			this._bCheckDomValue = true;

			sValue = (typeof sValue == "undefined") ? this._$input.val() : sValue.toString();
			this._curpos = this._$input.cursorPos();

			var oDate = this._parseValue(sValue, true);
			sValue = this._formatValue(oDate);

			// update the DOM value when necessary
			// otherwise cursor can goto end of text unnecessarily
			this._$input.val(sValue);
			if (document.activeElement === this._$input[0]) {
				this._$input.cursorPos(this._curpos);
			}
		}

		return this;
	};

	DatePicker.prototype._storeInputSelection = function (oInput) {
		if ((Device.browser.msie || Device.browser.edge) && !Device.support.touch) {
			//For IE & Edge, any selection of the underlying input must be removed before opening the picker popup,
			//otherwise the input will receive focus via TAB during the picker is opened. The selection is restored back
			//when the popup is closed
			this._oInputSelBeforePopupOpen = {
				iStart: oInput.selectionStart,
				iEnd: oInput.selectionEnd
			};
			oInput.selectionStart = 0;
			oInput.selectionEnd = 0;
		}
	};

	DatePicker.prototype._restoreInputSelection = function (oInput) {
		if ((Device.browser.msie || Device.browser.edge) && !Device.support.touch) {
			//The selection is restored back due to issue with IE & Edge. See _handleBeforeOpen
			oInput.selectionStart = this._oInputSelBeforePopupOpen.iStart;
			oInput.selectionEnd = this._oInputSelBeforePopupOpen.iEnd;
		}
	};


	function _open(){
		this._createPopup();

		this._createPopupContent();

		// set displayFormatType as PrimaryCalendarType
		// not only one because it depends on DataBinding
		var sCalendarType;
		var oBinding = this.getBinding("value");

		if (oBinding && oBinding.oType && oBinding.oType.oOutputFormat) {
			sCalendarType = oBinding.oType.oOutputFormat.oFormatOptions.calendarType;
		} else if (oBinding && oBinding.oType && oBinding.oType.oFormat) {
			sCalendarType = oBinding.oType.oFormat.oFormatOptions.calendarType;
		}

		if (!sCalendarType) {
			sCalendarType = this.getDisplayFormatType();
		}

		if (sCalendarType) {
			this._getCalendar().setPrimaryCalendarType(sCalendarType);
		}

		var sValue = this._bValid ? this._formatValue(this.getDateValue()) : this.getValue();
		if (sValue != this._$input.val()) {
			this.onChange(); // to check manually typed in text
		}

		this._fillDateRange();

		this._openPopup();

		// Fire navigate event when the calendar popup opens
		this.fireNavigate({
			dateRange: this._getVisibleDatesRange(this._getCalendar()),
			afterPopupOpened: true
		});

	}

	// to be overwritten by DateTimePicker
	DatePicker.prototype._createPopup = function(){
		var sArialabelledby,
			sLabel;

		if (!this._oPopup) {
			this._oPopup = new ResponsivePopover(this.getId() + "-RP", {
				showCloseButton: false,
				showArrow: false,
				showHeader: false,
				placement: library.PlacementType.VerticalPreferedBottom
			}).addStyleClass("sapMRPCalendar");

			this._oPopup._getPopup().setAutoClose(true);
			this._oPopup.attachAfterOpen(_handleOpen, this);
			this._oPopup.attachAfterClose(_handleClose, this);
			this._oPopup.setBeginButton(new Button({
					text: oResourceBundle.getText("DATEPICKER_SELECTION_CONFIRM"),
					press: this._handleOKButton.bind(this)
				})
			);

			if (Device.system.phone) {
				sArialabelledby = this.$("inner").attr("aria-labelledby");
				sLabel = sArialabelledby ? document.getElementById(sArialabelledby).getAttribute("aria-label") : "";
				this._oPopup.setTitle(sLabel);
				this._oPopup.setShowHeader(true);
				this._oPopup.setShowCloseButton(true);
			} else {
				// sap.m.Dialog used insed of the sap.m.ResponsivePopover doesen't display
				// correctly without an animation on mobile devices so we remove the animation
				// only for desktop when sap.m.Popover is used instead of sap.m.Dialog
				this._oPopup._getPopup().setDurations(0, 0);
				this._oPopup.getBeginButton().setType(library.ButtonType.Emphasized);
				this._oPopup.setEndButton(new Button({
						text: oResourceBundle.getText("DATEPICKER_SELECTION_CANCEL"),
						press: this._handleCancelButton.bind(this)
					})
				);
			}

			// define a parent-child relationship between the control's and the _picker pop-up
			this.setAggregation("_popup", this._oPopup, true);
		}
	};

	// to be overwritten by DateTimePicker
	DatePicker.prototype._openPopup = function(){
		if (!this._oPopup) {
			return;
		}
		this._storeInputSelection(this._$input.get(0));
		this._oPopup._getPopup().setAutoCloseAreas([this.getDomRef()]);
		this._oPopup.openBy(this);

	};

	/**
	 * Creates a DateRange with the first and the last visible days in the calendar popup.
	 * @param {sap.ui.unified.Calendar} oCalendar the calendar whose DatesRange is wanted
	 * @returns {sap.ui.unified.DateRange} the DateRange of the visible dates
	 * @private
	 */
	DatePicker.prototype._getVisibleDatesRange = function (oCalendar) {
		var aVisibleDays = oCalendar._getVisibleDays();

		// Convert to local JavaScript Date
		return new DateRange({
			startDate: aVisibleDays[0].toLocalJSDate(), // First visible date
			endDate: aVisibleDays[aVisibleDays.length - 1].toLocalJSDate() // Last visible date
		});
	};

	// to be overwritten by DateTimePicker
	DatePicker.prototype._createPopupContent = function(){

		var aPatternSymbolTypes = this._getFormatter(true)
			.aFormatArray
			.map(function(oPatternSymbolSettings) {
				return oPatternSymbolSettings.type.toLowerCase();
			}),
			bDay = aPatternSymbolTypes.indexOf("day") >= 0,
			bMonth = aPatternSymbolTypes.indexOf("month") >= 0,
			bYear =  aPatternSymbolTypes.indexOf("year") >= 0,
			CalendarConstructor;

		if (!this._getCalendar()) {

			if (bDay && bMonth && bYear) {
				CalendarConstructor = Calendar;
			} else if (bMonth && bYear) {
				CalendarConstructor = CustomMonthPicker;
			} else if (bYear) {
				CalendarConstructor = CustomYearPicker;
			} else {
				CalendarConstructor = Calendar;
				Log.warning("Not valid date pattern! Openning default Calendar", this);
			}

			this._oCalendar = new CalendarConstructor(this.getId() + "-cal", {
				intervalSelection: this._bIntervalSelection,
				minDate: this.getMinDate(),
				maxDate: this.getMaxDate(),
				legend: this.getLegend(),
				startDateChange: function () {
						this.fireNavigate({
							dateRange: this._getVisibleDatesRange(this._getCalendar())
						});
					}.bind(this)
				});

			this._oDateRange = new DateRange();
			this._getCalendar().addSelectedDate(this._oDateRange);
			this._getCalendar()._setSpecialDatesControlOrigin(this);

			if (this.$().closest(".sapUiSizeCompact").length > 0) {
				this._getCalendar().addStyleClass("sapUiSizeCompact");
			}
			if (this._bSecondaryCalendarTypeSet) {
				this._getCalendar().setSecondaryCalendarType(this.getSecondaryCalendarType());
			}
			if (this._bOnlyCalendar) {
				this._getCalendar().attachSelect(this._handleCalendarSelect, this);
				this._getCalendar().attachCancel(_cancel, this);
				this._getCalendar().attachEvent("_renderMonth", _resizeCalendar, this);
				this._oCalendar.setPopupMode(true);

				this._oPopup._getButtonFooter().setVisible(this.getShowFooter());
				this._getCalendar()._bSkipCancelButtonRendering = true;
				this._oPopup.addContent(this._getCalendar());

				if (!this.getDateValue()) {
					this._oPopup.getBeginButton().setEnabled(false);
				}
			}
		}
	};

	DatePicker.prototype._fillDateRange = function(){

		var oDate = this.getDateValue();

		if (oDate &&
			oDate.getTime() >= this._oMinDate.getTime() &&
			oDate.getTime() <= this._oMaxDate.getTime()) {

			this._getCalendar().focusDate(new Date(oDate.getTime()));
			if (!this._oDateRange.getStartDate() || this._oDateRange.getStartDate().getTime() != oDate.getTime()) {
				this._oDateRange.setStartDate(new Date(oDate.getTime()));
			}
		} else {
			var oInitialFocusedDateValue = this.getInitialFocusedDateValue();
			var oFocusDate = oInitialFocusedDateValue ? oInitialFocusedDateValue : new Date();
			var iMaxTimeMillis = this._oMaxDate.getTime();

			if (oFocusDate.getTime() < this._oMinDate.getTime() || oFocusDate.getTime() > iMaxTimeMillis) {
				oFocusDate = this._oMinDate;
			}
			this._getCalendar().focusDate(oFocusDate);

			if (this._oDateRange.getStartDate()) {
				this._oDateRange.setStartDate(undefined);
			}
		}

	};

	/**
	 * @see sap.ui.core.Control#getAccessibilityInfo
	 * @returns {Object} Current accessibility state of the control.
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
		oInfo.type = oResourceBundle.getText("ACC_CTR_TYPE_DATEINPUT");
		oInfo.description = [sValue, oRenderer.getLabelledByAnnouncement(this), oRenderer.getDescribedByAnnouncement(this)].join(" ").trim();
		return oInfo;
	};

	DatePicker.prototype._selectDate = function() {
		var oDateOld = this.getDateValue(),
			oDate = this._getSelectedDate(),
			sValue = "";

		// do not use this.onChange() because output pattern will change date (e.g. only last 2 number of year -> 1966 -> 2066 )
		if (!deepEqual(oDate, oDateOld)) {
			this.setDateValue(new Date(oDate.getTime()));
			// compare Dates because value can be the same if only 2 digits for year
			sValue = this.getValue();
			this.fireChangeEvent(sValue, {valid: true});
			this._focusInput();
		}else if (!this._bValid){
			// wrong input before open calendar
			sValue = this._formatValue(oDate);
			if (sValue != this._$input.val()) {
				this._bValid = true;
				if (this.getDomRef()) { // as control could be destroyed during update binding
					this._$input.val(sValue);
					this._lastValue = sValue;
				}
				// we have to format the value with the existing format
				// before setting it and firing the change event
				sValue = this._formatValue(oDate, true);
				this.setProperty("value", sValue, true); // no rerendering
				this.fireChangeEvent(sValue, {valid: true});
				this._focusInput();
			}
		} else if (Device.system.desktop || !Device.support.touch) {
			this.focus();
		}

		// close popup and focus input after change event to allow application to reset value state or similar things
		this._oPopup.close();
	};

	DatePicker.prototype._handleCalendarSelect = function(){
		if (this.getShowFooter()) {
			this._oPopup.getBeginButton().setEnabled(true);
			return;
		}

		this._selectDate();
	};

	/* sets cursor inside the input in order to focus it */
	DatePicker.prototype._focusInput = function(){

		if (this.getDomRef() && (Device.system.desktop || !Device.support.touch)) { // as control could be destroyed during update binding
			this._curpos = this._$input.val().length;
			this._$input.cursorPos(this._curpos);
		}
		return this;

	};

	/**
	 * Getter for DatePicker's Calendar instance.
	 * @returns {object} The _header object
	 * @private
	 */
	DatePicker.prototype._getCalendar = function () {
		return this._oCalendar;
	};

	DatePicker.prototype._getSelectedDate = function(){

		var aSelectedDates = this._getCalendar().getSelectedDates(),
			oDate;

		if (aSelectedDates.length > 0) {
			oDate = aSelectedDates[0].getStartDate();
		}

		return oDate;

	};

	//when OK is pressed, select a date and close the popover
	DatePicker.prototype._handleOKButton = function() {
		this._selectDate();
	};

	//when Cancel is pressed, close the popover
	DatePicker.prototype._handleCancelButton = function (){
		if (!this.getDateValue()) {
			this._oPopup.getBeginButton().setEnabled(false);
		}
		this._oPopup.close();
	};

	function _cancel(oEvent) {

		if (this.isOpen()) {
			this._oPopup.close();
			if ((Device.system.desktop || !Device.support.touch)) {
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

			if (oBinding && oBinding.oType && oBinding.oType.oOutputFormat) {
				sCalendarType = oBinding.oType.oOutputFormat.oFormatOptions.calendarType;
			} else if (oBinding && oBinding.oType && oBinding.oType.oFormat) {
				sCalendarType = oBinding.oType.oFormat.oFormatOptions.calendarType;
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

			if (!deepEqual(this.getDateValue(), oDate.getJSDate())) {
				this.setDateValue(new Date(oDate.getTime()));

				this._curpos = iCurpos;
				this._$input.cursorPos(this._curpos);

				var sValue = this.getValue();
				this.fireChangeEvent(sValue, {valid: true});
			}
		}

	}

	function _handleOpen() {
		this.addStyleClass(InputBase.ICON_PRESSED_CSS_CLASS);
		this._renderedDays = this._getCalendar().$("-Month0-days").find(".sapUiCalItem").length;

		this.$("inner").attr("aria-owns", this.getId() + "-cal");
		this.$("inner").attr("aria-expanded", true);

		InstanceManager.addPopoverInstance(this._oPopup);
		this._getCalendar().focus();
	}

	function _handleClose() {
		if (!this.getDateValue()) {
			this._oPopup.getBeginButton().setEnabled(false);
		}
		this.removeStyleClass(InputBase.ICON_PRESSED_CSS_CLASS);
		this.$("inner").attr("aria-expanded", false);

		this._restoreInputSelection(this._$input.get(0));
		this._getCalendar()._closedPickers();

		InstanceManager.removePopoverInstance(this._oPopup);
	}

	function _resizeCalendar(oEvent){

		var iDays = oEvent.getParameter("days"),
			oPopup = this._oPopup._getPopup();

		if (iDays > this._renderedDays) {
			// calendar gets larger, so it could move out of the page -> reposition
			this._renderedDays = iDays;
			oPopup._applyPosition(oPopup._oLastPosition);
		}

	}



	function _checkSpecialDate(oSpecialDate) {

		var DateTypeRange = sap.ui.require("sap/ui/unified/DateTypeRange");

		if (oSpecialDate && !(DateTypeRange && oSpecialDate instanceof DateTypeRange)) {
			throw new Error(oSpecialDate + "is not valid for aggregation \"specialDates\" of " + this);
		}

	}

	function _invalidateCalendar() {

		if (this.isOpen()) {
			// Calendar header and DateRanges are changed so we have to
			// invalidate the whole calendar and not only the Month
			this._getCalendar()._bDateRangeChanged = false;
			this._getCalendar().invalidate();
		}

	}

	/**
	 * Fired when the input operation has finished and the value has changed.
	 *
	 * <b>Note:</b> Fired only when a new date is selected. If you change the month or year from the picker but not
	 * select a new date from the newly selected month/year, the value of the <code>sap.m.DatePicker</code> won't be
	 * updated and no change event will be fired.
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

});