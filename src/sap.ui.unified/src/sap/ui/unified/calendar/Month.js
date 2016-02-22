/*!
 * ${copyright}
 */

//Provides control sap.ui.unified.Calendar.
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Control', 'sap/ui/core/LocaleData', 'sap/ui/core/delegate/ItemNavigation',
               'sap/ui/model/type/Date', 'sap/ui/unified/calendar/CalendarUtils', 'sap/ui/core/date/UniversalDate', 'sap/ui/unified/library'],
               function(jQuery, Control, LocaleData, ItemNavigation, Date1, CalendarUtils, UniversalDate, library) {
	"use strict";

	/*
	 * Inside the Month UniversalDate objects are used. But in the API JS dates are used.
	 * So conversion must be done on API functions.
	 */

	/**
	 * Constructor for a new calendar/Month.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * renders a month with ItemNavigation
	 * This is used inside the calendar. Not for stand alone usage
	 * If used inside the calendar the properties and aggregation are directly taken from the parent
	 * (To not duplicate and sync DateRanges and so on...)
	 * @extends sap.ui.core.Control
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.28.0
	 * @alias sap.ui.unified.calendar.Month
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Month = Control.extend("sap.ui.unified.calendar.Month", /** @lends sap.ui.unified.calendar.Month.prototype */ { metadata : {

		library : "sap.ui.unified",
		properties : {
			/**
			 * the month including this date is rendered and this date is initial focused (if no other focus set)
			 */
			date : {type : "object", group : "Data"},

			/**
			 * If set, interval selection is allowed
			 */
			intervalSelection : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * If set, only a single date or interval, if intervalSelection is enabled, can be selected
			 */
			singleSelection : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * If set, a header with the month name is shown
			 */
			showHeader : {type : "boolean", group : "Appearance", defaultValue : false},

			/**
			 * If set, the first day of the displayed week is this day. Valid values are 0 to 6.
			 * If not a valid value is set, the default of the used locale is used.
			 * @since 1.28.9
			 */
			firstDayOfWeek : {type : "int", group : "Appearance", defaultValue : -1},

			/**
			 * If set, the provided weekdays are displayed as non-working days.
			 * Valid values inside the array are 0 to 6.
			 * If not set, the weekend defined in the locale settings is displayed as non-working days.
			 * @since 1.28.9
			 */
			nonWorkingDays : {type : "int[]", group : "Appearance", defaultValue : null},

			/**
			 * If set, the calendar type is used for display.
			 * If not set, the calendar type of the global configuration is used.
			 * @since 1.34.0
			 */
			primaryCalendarType : {type : "sap.ui.core.CalendarType", group : "Appearance"},

			/**
			 * If set, the days are also displayed in this calendar type
			 * If not set, the dates are only displayed in the primary calendar type
			 * @since 1.34.0
			 */
			secondaryCalendarType : {type : "sap.ui.core.CalendarType", group : "Appearance"},

			/**
			 * Width of Month
			 * @since 1.38.0
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null}
		},
		aggregations : {

			/**
			 * Date Ranges for selected dates of the DatePicker
			 */
			selectedDates : {type : "sap.ui.unified.DateRange", multiple : true, singularName : "selectedDate"},

			/**
			 * Date Range with type to visualize special days in the Calendar.
			 * If one day is assigned to more than one Type, only the first one will be used.
			 */
			specialDates : {type : "sap.ui.unified.DateTypeRange", multiple : true, singularName : "specialDate"},

			/**
			 * Date Ranges for disabled dates
			 * @since 1.38.0
			 */
			disabledDates : {type : "sap.ui.unified.DateRange", multiple : true, singularName : "disabledDate"}
		},
		associations: {

			/**
			 * Association to controls / ids which label this control (see WAI-ARIA attribute aria-labelledby).
			 */
			ariaLabelledBy: { type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy" }
		},
		events : {

			/**
			 * Date selection changed
			 */
			select : {},

			/**
			 * Date focus changed
			 */
			focus : {
				parameters : {
					/**
					 * focused date
					 */
					date : {type : "object"},
					/**
					 * focused date is in an other month that the displayed one
					 */
					otherMonth : {type : "boolean"},
					/**
					 * focused date is set to the same as before (date in other month clicked)
					 */
					restoreOldDate : {type : "boolean"}
				}
			}
		}
	}});

	Month.prototype.init = function(){

		// set default calendar type from configuration
		var sCalendarType = sap.ui.getCore().getConfiguration().getCalendarType();
		this.setProperty("primaryCalendarType", sCalendarType);
		this.setProperty("secondaryCalendarType", sCalendarType);

		this._oFormatYyyymmdd = sap.ui.core.format.DateFormat.getInstance({pattern: "yyyyMMdd", calendarType: sap.ui.core.CalendarType.Gregorian});
		this._oFormatLong = sap.ui.core.format.DateFormat.getInstance({style: "long", calendarType: sCalendarType});

		this._mouseMoveProxy = jQuery.proxy(this._handleMouseMove, this);

		this._iColumns = 7;
	};

	Month.prototype.exit = function(){

		if (this._oItemNavigation) {
			this.removeDelegate(this._oItemNavigation);
			this._oItemNavigation.destroy();
			delete this._oItemNavigation;
		}

		if (this._sInvalidateMonth) {
			jQuery.sap.clearDelayedCall(this._sInvalidateMonth);
		}

	};

	Month.prototype.onAfterRendering = function(){

		_initItemNavigation.call(this);

		// check if day names are too big -> use smaller ones
		_checkNamesLength.call(this);

	};

	Month.prototype.onsapfocusleave = function(oEvent){

		if (!oEvent.relatedControlId || !jQuery.sap.containsOrEquals(this.getDomRef(), sap.ui.getCore().byId(oEvent.relatedControlId).getFocusDomRef())) {
			if (this._bMouseMove) {
				this._unbindMousemove(true);

				var bSelected = _selectDay.call(this, this._getDate());
				if (!bSelected && this._oMoveSelectedDate) {
					_selectDay.call(this, this._oMoveSelectedDate);
				}
				this._bMoveChange = false;
				this._bMousedownChange = false;
				this._oMoveSelectedDate = undefined;
				_fireSelect.call(this);
			}

			if (this._bMousedownChange) {
				// mouseup somewhere outside of control -> if focus left finish selection
				this._bMousedownChange = false;
				_fireSelect.call(this);
			}
		}

	};

	// overwrite invalidate to recognize changes on selectedDates
	Month.prototype.invalidate = function(oOrigin) {

		if (!this._bDateRangeChanged && (!oOrigin || !(oOrigin instanceof sap.ui.unified.DateRange))) {
			Control.prototype.invalidate.apply(this, arguments);
		} else if (this.getDomRef() && !this._sInvalidateMonth) {
			// DateRange changed -> only rerender days
			// do this only once if more DateRanges / Special days are changed
			if (this._bInvalidateSync) { // set if calendar already invalidates in delayed call
				_invalidateMonth.call(this);
			} else {
				this._sInvalidateMonth = jQuery.sap.delayedCall(0, this, _invalidateMonth, [this]);
			}
		}

	};

	// overwrite removing of date ranged because invalidate don't get information about it
	Month.prototype.removeAllSelectedDates = function() {

		this._bDateRangeChanged = true;
		var aRemoved = this.removeAllAggregation("selectedDates");
		return aRemoved;

	};

	Month.prototype.destroySelectedDates = function() {

		this._bDateRangeChanged = true;
		var oDestroyed = this.destroyAggregation("selectedDates");
		return oDestroyed;

	};

	Month.prototype.removeAllSpecialDates = function() {

		this._bDateRangeChanged = true;
		var aRemoved = this.removeAllAggregation("specialDates");
		return aRemoved;

	};

	Month.prototype.destroySpecialDates = function() {

		this._bDateRangeChanged = true;
		var oDestroyed = this.destroyAggregation("specialDates");
		return oDestroyed;

	};

	Month.prototype.removeAllDisabledDates = function() {

		this._bDateRangeChanged = true;
		var aRemoved = this.removeAllAggregation("disabledDates");
		return aRemoved;

	};

	Month.prototype.destroyDisabledDates = function() {

		this._bDateRangeChanged = true;
		var oDestroyed = this.destroyAggregation("disabledDates");
		return oDestroyed;

	};

	Month.prototype.setDate = function(oDate){

		_changeDate.call(this, oDate, false);

		return this;

	};

	Month.prototype._setDate = function(oDate){

		var oLocaleDate = CalendarUtils._createLocalDate(oDate);
		this.setProperty("date", oLocaleDate, true);
		this._oUTCDate = oDate;

	};

	Month.prototype._getDate = function(){

		if (!this._oUTCDate) {
			this._oUTCDate = CalendarUtils._createUniversalUTCDate(new Date(), this.getPrimaryCalendarType());
		}

		return this._oUTCDate;

	};

	/**
	 * displays the month of a given date without setting the focus
	 *
	 * @param {object} oDate JavaScript date object for focused date.
	 * @returns {sap.ui.unified.calendar.Month} <code>this</code> to allow method chaining
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Month.prototype.displayDate = function(oDate){

		_changeDate.call(this, oDate, true);

		return this;

	};

	Month.prototype.setPrimaryCalendarType = function(sCalendarType){

		this.setProperty("primaryCalendarType", sCalendarType); // rerender as month can change completely (week numbers can be hidden...)

		this._oFormatLong = sap.ui.core.format.DateFormat.getInstance({style: "long", calendarType: sCalendarType});

		if (this._oUTCDate) {
			this._oUTCDate = UniversalDate.getInstance(this._oUTCDate.getJSDate(), sCalendarType);
		}

		return this;

	};

	Month.prototype._newUniversalDate = function(oDate){

		var oJSDate;

		if ((oDate instanceof UniversalDate)) {
			oJSDate = new Date(oDate.getJSDate().getTime()); // use getTime() because IE and FF can not parse dates < 0100.01.01
		} else {
			oJSDate = new Date(oDate.getTime());
		}

		return UniversalDate.getInstance(oJSDate, this.getPrimaryCalendarType());

	};

	Month.prototype.setSecondaryCalendarType = function(sCalendarType){

		this._bSecondaryCalendarTypeSet = true; // as property can not be empty but we use it only if set
		this.setProperty("secondaryCalendarType", sCalendarType); // rerender as month can change completely (class changes on root DOM)
		this.invalidate(); // Invalidate in every case even if the type was set to the default one.

		this._oFormatSecondaryLong = sap.ui.core.format.DateFormat.getInstance({style: "long", calendarType: sCalendarType});

		return this;

	};

	Month.prototype._getSecondaryCalendarType = function(){

		var sSecondaryCalendarType;

		if (this._bSecondaryCalendarTypeSet) {
			sSecondaryCalendarType = this.getSecondaryCalendarType();
			var sPrimaryCalendarType = this.getPrimaryCalendarType();
			if (sSecondaryCalendarType == sPrimaryCalendarType) {
				sSecondaryCalendarType = undefined;
			}
		}

		return sSecondaryCalendarType;

	};

	/*
	 * Use rendered locale for stand alone control
	 * But as Calendar can have an own locale, use this one if used inside Calendar
	 */
	Month.prototype._getLocale = function(){

		var oParent = this.getParent();

		if (oParent && oParent.getLocale) {
			return oParent.getLocale();
		} else if (!this._sLocale) {
			this._sLocale = sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale().toString();
		}

		return this._sLocale;

	};

	/*
	 * gets localeData for used locale
	 * Use rendered locale for stand alone control
	 * But as Calendar can have an own locale, use this one if used inside Calendar
	 */
	Month.prototype._getLocaleData = function(){

		var oParent = this.getParent();

		if (oParent && oParent._getLocaleData) {
			return oParent._getLocaleData();
		} else if (!this._oLocaleData) {
			var sLocale = this._getLocale();
			var oLocale = new sap.ui.core.Locale(sLocale);
			this._oLocaleData = LocaleData.getInstance(oLocale);
		}

		return this._oLocaleData;

	};

	/*
	 * get format for long date output depending on used locale
	 */
	Month.prototype._getFormatLong = function(){

		var sLocale = this._getLocale();

		if (this._oFormatLong.oLocale.toString() != sLocale) {
			var oLocale = new sap.ui.core.Locale(sLocale);
			this._oFormatLong = sap.ui.core.format.DateFormat.getInstance({style: "long", calendarType: this.getPrimaryCalendarType()} , oLocale);
			if (this._oFormatSecondaryLong) {
				this._oFormatSecondaryLong = sap.ui.core.format.DateFormat.getInstance({style: "long", calendarType: this._getSecondaryCalendarType()} , oLocale);
			}
		}

		return this._oFormatLong;

	};

	/*
	 * if used inside Calendar get the value from the parent
	 * To don't have sync issues...
	 */
	Month.prototype.getIntervalSelection = function(){

		var oParent = this.getParent();

		if (oParent && oParent.getIntervalSelection) {
			return oParent.getIntervalSelection();
		} else {
			return this.getProperty("intervalSelection");
		}

	};

	/*
	 * if used inside Calendar get the value from the parent
	 * To don't have sync issues...
	 */
	Month.prototype.getSingleSelection = function(){

		var oParent = this.getParent();

		if (oParent && oParent.getSingleSelection) {
			return oParent.getSingleSelection();
		} else {
			return this.getProperty("singleSelection");
		}

	};

	/*
	 * if used inside Calendar get the value from the parent
	 * To don't have sync issues...
	 */
	Month.prototype.getSelectedDates = function(){

		var oParent = this.getParent();

		if (oParent && oParent.getSelectedDates) {
			return oParent.getSelectedDates();
		} else {
			return this.getAggregation("selectedDates", []);
		}

	};

	/*
	 * if used inside Calendar get the value from the parent
	 * To don't have sync issues...
	 */
	Month.prototype.getSpecialDates = function(){

		var oParent = this.getParent();

		if (oParent && oParent.getSpecialDates) {
			return oParent.getSpecialDates();
		} else {
			return this.getAggregation("specialDates", []);
		}

	};

	/*
	 * if used inside Calendar get the value from the parent
	 * To don't have sync issues...
	 */
	Month.prototype.getDisabledDates = function(){

		var oParent = this.getParent();

		if (oParent && oParent.getDisabledDates) {
			return oParent.getDisabledDates();
		} else {
			return this.getAggregation("disabledDates", []);
		}

	};

	/*
	 * if used inside Calendar get the value from the parent
	 * To don't have sync issues...
	 */
	Month.prototype._getShowHeader = function(){

		var oParent = this.getParent();

		if (oParent && oParent._getShowMonthHeader) {
			return oParent._getShowMonthHeader();
		} else {
			return this.getProperty("showHeader");
		}

	};

	/*
	 * if used inside Calendar get the value from the parent
	 * To don't have sync issues...
	 */
	Month.prototype.getAriaLabelledBy = function(){

		var oParent = this.getParent();

		if (oParent && oParent.getAriaLabelledBy) {
			return oParent.getAriaLabelledBy();
		} else {
			return this.getAssociation("ariaLabelledBy", []);
		}

	};

	/*
	 * if used inside Calendar get the value from the parent
	 * To don't have sync issues...
	 * If not a valid day, use LocaleData
	 */
	Month.prototype._getFirstDayOfWeek = function(){

		var oParent = this.getParent();
		var iFirstDayOfWeek = 0;

		if (oParent && oParent.getFirstDayOfWeek) {
			iFirstDayOfWeek = oParent.getFirstDayOfWeek();
		} else {
			iFirstDayOfWeek = this.getProperty("firstDayOfWeek");
		}

		if (iFirstDayOfWeek < 0 || iFirstDayOfWeek > 6) {
			var oLocaleData = this._getLocaleData();
			iFirstDayOfWeek = oLocaleData.getFirstDayOfWeek();
		}

		return iFirstDayOfWeek;

	};

	/*
	 * if used inside Calendar get the value from the parent
	 * To don't have sync issues...
	 * If not a valid day, use LocaleData
	 */
	Month.prototype._getNonWorkingDays = function(){

		var oParent = this.getParent();
		var aNonWorkingDays;

		if (oParent && oParent.getNonWorkingDays) {
			aNonWorkingDays = oParent.getNonWorkingDays();
		} else {
			aNonWorkingDays = this.getProperty("nonWorkingDays");
		}

		if (aNonWorkingDays && !jQuery.isArray(aNonWorkingDays)) {
			aNonWorkingDays = [];
		}

		return aNonWorkingDays;

	};

	/*
	 * Checks if a date is selected and what kind of selected
	 * @return {int} iSelected 0: not selected; 1: single day selected, 2: interval start, 3: interval end, 4: interval between, 5: one day interval (start = end)
	 * @private
	 */
	Month.prototype._checkDateSelected = function(oDate){

		if (!(oDate instanceof UniversalDate)) {
			throw new Error("Date must be a UniversalDate object " + this);
		}

		var iSelected = 0;
		var aSelectedDates = this.getSelectedDates();
		var oTimeStamp = oDate.getTime();
		var sCalendarType = this.getPrimaryCalendarType();

		for ( var i = 0; i < aSelectedDates.length; i++) {
			// initalize the time part of the start and end time
			var oRange = aSelectedDates[i];
			var oStartDate = oRange.getStartDate();
			var oStartTimeStamp = 0;
			if (oStartDate) {
				oStartDate = CalendarUtils._createUniversalUTCDate(oStartDate, sCalendarType);
				oStartTimeStamp = oStartDate.getTime();
			}
			var oEndDate = oRange.getEndDate();
			var oEndTimeStamp = 0;
			if (oEndDate) {
				oEndDate = CalendarUtils._createUniversalUTCDate(oEndDate, sCalendarType);
				oEndTimeStamp = oEndDate.getTime();
			}

			if (oTimeStamp == oStartTimeStamp && !oEndDate ) {
				iSelected = 1; // single day selected
				break;
			} else if (oTimeStamp == oStartTimeStamp && oEndDate ) {
				iSelected = 2; // interval start
				if (oEndDate && oTimeStamp == oEndTimeStamp) {
					// one day interval
					iSelected = 5;
				}
				break;
			} else if (oEndDate && oTimeStamp == oEndTimeStamp) {
				iSelected = 3; // interval end
				break;
			} else if (oEndDate && oTimeStamp > oStartTimeStamp && oTimeStamp < oEndTimeStamp) {
				iSelected = 4; // interval between
				break;
			}

			if (this.getSingleSelection()) {
				// if single selection only check the first range
				break;
			}
		}

		return iSelected;

	};

	/*
	 * gets the type of a single date checking the specialDates aggregation
	 * the first hit is used
	 * @return {object} date type and tooltip defined in CalendarDayType
	 * @private
	 */
	Month.prototype._getDateType = function(oDate){

		if (!(oDate instanceof UniversalDate)) {
			throw new Error("Date must be a UniversalDate object " + this);
		}

		var oType;
		var aSpecialDates = this.getSpecialDates();
		var oTimeStamp = oDate.getTime();
		var sCalendarType = this.getPrimaryCalendarType();

		for ( var i = 0; i < aSpecialDates.length; i++) {
			// initialize the time part of the start and end time
			var oRange = aSpecialDates[i];
			var oStartDate = oRange.getStartDate();
			var oStartTimeStamp = 0;
			if (oStartDate) {
				oStartDate = CalendarUtils._createUniversalUTCDate(oStartDate, sCalendarType);
				oStartTimeStamp = oStartDate.getTime();
			}
			var oEndDate = oRange.getEndDate();
			var oEndTimeStamp = 0;
			if (oEndDate) {
				oEndDate = CalendarUtils._createUniversalUTCDate(oEndDate, sCalendarType);
				oEndTimeStamp = oEndDate.getTime();
			}

			if ((oTimeStamp == oStartTimeStamp && !oEndDate) || (oTimeStamp >= oStartTimeStamp && oTimeStamp <= oEndTimeStamp)) {
				oType = {type: oRange.getType(), tooltip: oRange.getTooltip_AsString()};
				break;
			}
		}

		return oType;

	};

	/*
	 * Checks if a date is enabled
	 * beside the disabledDates aggregation the min. and max. date of the Calendar are used
	 * @return {boolean} Flag if enabled
	 * @private
	 */
	Month.prototype._checkDateEnabled = function(oDate){

		if (!(oDate instanceof UniversalDate)) {
			throw new Error("Date must be a UniversalDate object " + this);
		}

		var bEnabled = true;
		var aDisabledDates = this.getDisabledDates();
		var oTimeStamp = oDate.getTime();
		var sCalendarType = this.getPrimaryCalendarType();
		var oParent = this.getParent();

		if (oParent && oParent._oMinDate && oParent._oMaxDate) {
			if (oTimeStamp < oParent._oMinDate.getTime() || oTimeStamp > oParent._oMaxDate.getTime()) {
				return false;
			}
		}

		for ( var i = 0; i < aDisabledDates.length; i++) {
			// initalize the time part of the start and end time
			var oRange = aDisabledDates[i];
			var oStartDate = oRange.getStartDate();
			var oStartTimeStamp = 0;
			if (oStartDate) {
				oStartDate = CalendarUtils._createUniversalUTCDate(oStartDate, sCalendarType);
				oStartTimeStamp = oStartDate.getTime();
			}
			var oEndDate = oRange.getEndDate();
			var oEndTimeStamp = 0;
			if (oEndDate) {
				oEndDate = CalendarUtils._createUniversalUTCDate(oEndDate, sCalendarType);
				oEndTimeStamp = oEndDate.getTime();
			}

			if (oEndDate) {
				// range disabled
				if (oTimeStamp > oStartTimeStamp && oTimeStamp < oEndTimeStamp) {
					bEnabled = false;
					break;
				}
			} else if (oTimeStamp == oStartTimeStamp) {
				// single day disabled
				bEnabled = false;
				break;
			}
		}

		return bEnabled;

	};

	Month.prototype.setWidth = function(sWidth){

		this.setProperty("width", sWidth, true);

		if (this.getDomRef()) {
			sWidth = this.getWidth(); // to get in right type
			this.$().css("width", sWidth);
		}

		return this;

	};

	Month.prototype._handleMouseMove = function(oEvent){

		if (!this.$().is(":visible")) {
			// calendar was closed -> remove mousemove handler
			this._unbindMousemove(true);
		}

		var $Target = jQuery(oEvent.target);

		if ($Target.hasClass("sapUiCalItemText")) {
			$Target = $Target.parent();
		}

		if (this._sLastTargetId && this._sLastTargetId == $Target.attr("id")) {
			// mouse move at same day -> do nothing
			return;
		}
		this._sLastTargetId = $Target.attr("id");

		if ($Target.hasClass("sapUiCalItem")) {
			var oOldFocusedDate = this._getDate();
			if (!jQuery.sap.containsOrEquals(this.getDomRef(), oEvent.target)) {
				// in multi month mode day can be in other month
				var aSelectedDates = this.getSelectedDates();

				if (aSelectedDates.length > 0 && this.getSingleSelection()) {
					var oStartDate = aSelectedDates[0].getStartDate();
					if (oStartDate) {
						oStartDate = CalendarUtils._createUniversalUTCDate(oStartDate, this.getPrimaryCalendarType());
					}
					var oEndDate = this._newUniversalDate(this._oFormatYyyymmdd.parse($Target.attr("data-sap-day"), true));
					if (oEndDate.getTime() >= oStartDate.getTime()) {
						_updateSelection.call(this, oStartDate, oEndDate);
					}else {
						_updateSelection.call(this, oEndDate, oStartDate);
					}
				}
			}else {
				var oFocusedDate = this._newUniversalDate(this._oFormatYyyymmdd.parse($Target.attr("data-sap-day"), true));

				if (oFocusedDate.getTime() != oOldFocusedDate.getTime()) {
					if ($Target.hasClass("sapUiCalItemOtherMonth")) {
						// in other month -> change month
						this.fireFocus({date: CalendarUtils._createLocalDate(oFocusedDate), otherMonth: true});
					} else {
						this._setDate(oFocusedDate);
						var bSelected = _selectDay.call(this, oFocusedDate, true);
						if (bSelected) {
							// remember last selected enabled date
							this._oMoveSelectedDate = this._newUniversalDate(oFocusedDate);
						}
						this._bMoveChange = true;
					}
				}
			}
		}

	};

	Month.prototype.onmouseup = function(oEvent){

		// fire select event on mouseup to prevent closing calendar during click

		if (this._bMouseMove) {
			this._unbindMousemove(true);

			// focus now selected day
			var oFocusedDate = this._getDate();
			var aDomRefs = this._oItemNavigation.getItemDomRefs();

			for ( var i = 0; i < aDomRefs.length; i++) {
				var $DomRef = jQuery(aDomRefs[i]);
				if (!$DomRef.hasClass("sapUiCalItemOtherMonth")) {
					if ($DomRef.attr("data-sap-day") == this._oFormatYyyymmdd.format(oFocusedDate.getJSDate(), true)) {
						$DomRef.focus();
						break;
					}
				}
			}

			if (this._bMoveChange) {
				// selection was changed -> make it final
				var bSelected = _selectDay.call(this, oFocusedDate);
				if (!bSelected && this._oMoveSelectedDate) {
					_selectDay.call(this, this._oMoveSelectedDate);
				}
				this._bMoveChange = false;
				this._bMousedownChange = false;
				this._oMoveSelectedDate = undefined;
				_fireSelect.call(this);
			}
		}

		if (this._bMousedownChange) {
			this._bMousedownChange = false;
			_fireSelect.call(this);
		}

	};

	Month.prototype.onsapselect = function(oEvent){

		// focused item must be selected
		var bSelected = _selectDay.call(this, this._getDate());
		if (bSelected) {
			_fireSelect.call(this);
		}

		//to prevent bubbling into input field if in DatePicker
		oEvent.stopPropagation();
		oEvent.preventDefault();

	};

	Month.prototype.onsapselectmodifiers = function(oEvent){

		this.onsapselect(oEvent);

	};

	Month.prototype.onsappageupmodifiers = function(oEvent){

		// not handled by ItemNavigation
		// go one or 10 years back
		var oFocusedDate = this._newUniversalDate(this._getDate());
		var iYear = oFocusedDate.getUTCFullYear();

		if (oEvent.metaKey || oEvent.ctrlKey) {
			oFocusedDate.setUTCFullYear(iYear - 10);
		} else {
			oFocusedDate.setUTCFullYear(iYear - 1);
		}

		this.fireFocus({date: CalendarUtils._createLocalDate(oFocusedDate), otherMonth: true});

		// cancel the event otherwise the browser select some text
		oEvent.preventDefault();

	};

	Month.prototype.onsappagedownmodifiers = function(oEvent){

		// not handled by ItemNavigation
		// go one or 10 years forward
		var oFocusedDate = this._newUniversalDate(this._getDate());
		var iYear = oFocusedDate.getUTCFullYear();

		if (oEvent.metaKey || oEvent.ctrlKey) {
			oFocusedDate.setUTCFullYear(iYear + 10);
		} else {
			oFocusedDate.setUTCFullYear(iYear + 1);
		}

		this.fireFocus({date: CalendarUtils._createLocalDate(oFocusedDate), otherMonth: true});

		// cancel the event otherwise the browser select some text
		oEvent.preventDefault();

	};

	/*
	 * called from the calendar in multi-month case to update the interval visualization
	 * for all months.
	 */
	Month.prototype._updateSelection = function(){

		var aSelectedDates = this.getSelectedDates();

		if (aSelectedDates.length > 0 && this.getSingleSelection()) {
			var sCalendarType = this.getPrimaryCalendarType();
			var oStartDate = aSelectedDates[0].getStartDate();
			if (oStartDate) {
				oStartDate = CalendarUtils._createUniversalUTCDate(oStartDate, sCalendarType);
			}
			var oEndDate = aSelectedDates[0].getEndDate();
			if (oEndDate) {
				oEndDate = CalendarUtils._createUniversalUTCDate(oEndDate, sCalendarType);
			}
			_updateSelection.call(this, oStartDate, oEndDate);
		}

	};

	/*
	 * in Calendar with more than one months, other months must handle mousemove too
	 */
	Month.prototype._bindMousemove = function( bFireEvent ){

		jQuery(window.document).bind('mousemove', this._mouseMoveProxy);
		this._bMouseMove = true;

		if (bFireEvent) {
			// fire internal event for Calendar. In MultiMonth case all months must react on mousemove
			this.fireEvent("_bindMousemove");
		}

	};

	Month.prototype._unbindMousemove = function( bFireEvent ){

		jQuery(window.document).unbind('mousemove', this._mouseMoveProxy);
		this._bMouseMove = undefined;
		this._sLastTargetId = undefined;

		if (bFireEvent) {
			// fire internal event for Calendar. In MultiMonth case all months must react on mousemove
			this.fireEvent("_unbindMousemove");
		}

	};

	Month.prototype.onThemeChanged = function(){

		if (this._bNoThemeChange) {
			// already called from Calendar
			return;
		}

		this._bNamesLengthChecked = undefined;
		this._bLongWeekDays = undefined;
		var aWeekHeaders = this.$().find(".sapUiCalWH");
		var oLocaleData = this._getLocaleData();
		var iStartDay = this._getFirstWeekDay();
		var aDayNames = oLocaleData.getDaysStandAlone("abbreviated", this.getPrimaryCalendarType());
		for (var i = 0; i < aWeekHeaders.length; i++) {
			var oWeekDay = aWeekHeaders[i];
			jQuery(oWeekDay).text(aDayNames[(i + iStartDay) % 7]);
		}

		_checkNamesLength.call(this);

	};

	Month.prototype._handleBorderReached = function(oControlEvent){

		var oEvent = oControlEvent.getParameter("event");
		var iMonth = 0;
		var oOldDate = this._getDate();
		var oFocusedDate = this._newUniversalDate(oOldDate);

		if (oEvent.type) {
			switch (oEvent.type) {
			case "sapnext":
			case "sapnextmodifiers":
				// last day in month reached
				if (oEvent.keyCode == jQuery.sap.KeyCodes.ARROW_DOWN) {
					//goto same day next week
					oFocusedDate.setUTCDate(oFocusedDate.getUTCDate() + 7);
				} else {
					//go to next day
					oFocusedDate.setUTCDate(oFocusedDate.getUTCDate() + 1);
				}
				break;

			case "sapprevious":
			case "sappreviousmodifiers":
				// first day in month reached
				if (oEvent.keyCode == jQuery.sap.KeyCodes.ARROW_UP) {
					//goto same day previous week
					oFocusedDate.setUTCDate(oFocusedDate.getUTCDate() - 7);
				} else {
					//go to previous day
					oFocusedDate.setUTCDate(oFocusedDate.getUTCDate() - 1);
				}
				break;

			case "sappagedown":
				// go to same day next month
				iMonth = oFocusedDate.getUTCMonth() + 1;
				oFocusedDate.setUTCMonth(iMonth);
				// but if the day doesn't exist in this month, go to last day of the month
				if (iMonth % 12 != oFocusedDate.getUTCMonth()) {
					while (iMonth != oFocusedDate.getUTCMonth()) {
						oFocusedDate.setUTCDate(oFocusedDate.getUTCDate() - 1);
					}
				}
				break;

			case "sappageup":
				// go to same day previous month
				iMonth = oFocusedDate.getUTCMonth() - 1;
				oFocusedDate.setUTCMonth(iMonth);
				if (iMonth < 0) {
					iMonth = 11;
				}
				// but if the day doesn't exist in this month, go to last day of the month
				if (iMonth != oFocusedDate.getUTCMonth()) {
					while (iMonth != oFocusedDate.getUTCMonth()) {
						oFocusedDate.setUTCDate(oFocusedDate.getUTCDate() - 1);
					}
				}
				break;

			default:
				break;
			}

			this.fireFocus({date: CalendarUtils._createLocalDate(oFocusedDate), otherMonth: true});

		}

	};

	/**
	 * checks if a date is focusable in the current rendered output.
	 * So if not rendered or in other month it is not focusable.
	 *
	 * @param {object} oDate JavaScript date object for focused date.
	 * @returns {boolean} flag if focusable
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Month.prototype.checkDateFocusable = function(oDate){

		if (!(oDate instanceof Date)) {
			throw new Error("Date must be a JavaScript date object; " + this);
		}

		var oMonthDate = this._getDate();
		var oUTCDate = CalendarUtils._createUniversalUTCDate(oDate, this.getPrimaryCalendarType());

		if (oUTCDate.getUTCFullYear() == oMonthDate.getUTCFullYear() && oUTCDate.getUTCMonth() == oMonthDate.getUTCMonth()) {
			return true;
		} else {
			return false;
		}

	};

	Month.prototype._renderHeader = function(){

		if (this._getShowHeader()) {
			var oDate = this._getDate();
			var oLocaleData = this._getLocaleData();
			var aMonthNames = oLocaleData.getMonthsStandAlone("wide", this.getPrimaryCalendarType());
			this.$("Head").text(aMonthNames[oDate.getUTCMonth()]);
		}

	};

	/*
	 * returns the first displayed week day. Needed to change week days if too long
	 */
	Month.prototype._getFirstWeekDay = function(){

		return this._getFirstDayOfWeek();

	};

	function _initItemNavigation(){

		var oDate = this._getDate();
		var sYyyymmdd = this._oFormatYyyymmdd.format(oDate.getJSDate(), true);
		var iIndex = 0;

		var oRootDomRef = this.$("days").get(0);
		var aDomRefs = this.$("days").find(".sapUiCalItem");

		for ( var i = 0; i < aDomRefs.length; i++) {
			var $DomRef = jQuery(aDomRefs[i]);
			if ($DomRef.attr("data-sap-day") === sYyyymmdd) {
				iIndex = i;
				break;
			}
		}

		if (!this._oItemNavigation) {
			this._oItemNavigation = new ItemNavigation();
			this._oItemNavigation.attachEvent(ItemNavigation.Events.AfterFocus, _handleAfterFocus, this);
			this._oItemNavigation.attachEvent(ItemNavigation.Events.FocusAgain, _handleFocusAgain, this);
			this._oItemNavigation.attachEvent(ItemNavigation.Events.BorderReached, this._handleBorderReached, this);
			this.addDelegate(this._oItemNavigation);
			if (this._iColumns > 1) {
				this._oItemNavigation.setHomeEndColumnMode(true, true);
			}
			this._oItemNavigation.setDisabledModifiers({
				sapnext : ["alt"],
				sapprevious : ["alt"],
				saphome : ["alt"],
				sapend : ["alt"]
			});
			this._oItemNavigation.setCycling(false);
			this._oItemNavigation.setColumns(this._iColumns, true);
		}
		this._oItemNavigation.setRootDomRef(oRootDomRef);
		this._oItemNavigation.setItemDomRefs(aDomRefs);
		this._oItemNavigation.setFocusedIndex(iIndex);
		this._oItemNavigation.setPageSize(aDomRefs.length); // to make sure that pageup/down goes out of month

	}

	function _handleAfterFocus(oControlEvent){

		var iIndex = oControlEvent.getParameter("index");
		var oEvent = oControlEvent.getParameter("event");

		if (!oEvent) {
			return; // happens if focus is set via ItemNavigation.focusItem directly
		}

		var oOldDate = this._getDate();
		var oFocusedDate = this._newUniversalDate(oOldDate);
		var bOtherMonth = false;
		var bFireFocus = true;

		var aDomRefs = this._oItemNavigation.getItemDomRefs();
		var i = 0;

		// find out what day was focused
		var $DomRef = jQuery(aDomRefs[iIndex]);
		var $DomRefDay;
		/* eslint-disable no-lonely-if */
		if ($DomRef.hasClass("sapUiCalItemOtherMonth")) {
			if (oEvent.type == "saphomemodifiers" && (oEvent.metaKey || oEvent.ctrlKey)) {
				// on ctrl+home key focus first day of month
				oFocusedDate.setUTCDate(1);
				_focusDate.call(this, oFocusedDate);
			} else if (oEvent.type == "sapendmodifiers" && (oEvent.metaKey || oEvent.ctrlKey)) {
				// on ctrl+end key focus last day of month
				for ( i = aDomRefs.length - 1; i > 0; i--) {
					$DomRefDay = jQuery(aDomRefs[i]);
					if (!$DomRefDay.hasClass("sapUiCalItemOtherMonth")) {
						oFocusedDate = this._newUniversalDate(this._oFormatYyyymmdd.parse($DomRefDay.attr("data-sap-day"), true));
						break;
					}
				}
				_focusDate.call(this, oFocusedDate);
			} else {
				// focus old date again, but tell parent about the new date
				bOtherMonth = true;
				oFocusedDate = this._newUniversalDate(this._oFormatYyyymmdd.parse($DomRef.attr("data-sap-day"), true));
				if (!oFocusedDate) {
					oFocusedDate = this._newUniversalDate(oOldDate); // e.g. year > 9999
				}
				_focusDate.call(this, oOldDate);

				if (oEvent.type == "mousedown" ||
						(this._sTouchstartYyyyMMdd && oEvent.type == "focusin" && this._sTouchstartYyyyMMdd == $DomRef.attr("data-sap-day"))) {
					// don't focus date in other month via mouse -> don't switch month in calendar while selecting day
					bFireFocus = false;
					this.fireFocus({date: CalendarUtils._createLocalDate(oOldDate), otherMonth: false, restoreOldDate: true});
				}

				// on touch devices a focusin is fired asyncrounously after the touch/mouse handling on DOM element if the focus was changed in the meantime
				// focus old date again and do not fire focus event
				if (oEvent.originalEvent && oEvent.originalEvent.type == "touchstart") {
					this._sTouchstartYyyyMMdd = $DomRef.attr("data-sap-day");
				} else {
					this._sTouchstartYyyyMMdd = undefined;
				}
			}
		} else {
			// day in current month focused
			if (jQuery(oEvent.target).hasClass("sapUiCalWeekNum")) {
				// click on week number - focus old date
				_focusDate.call(this, oFocusedDate);
			}else {
				// not if clicked on week number
				oFocusedDate = this._newUniversalDate(this._oFormatYyyymmdd.parse($DomRef.attr("data-sap-day"), true));
				this._setDate(oFocusedDate);
			}
			this._sTouchstartYyyyMMdd = undefined;
		}

		if (oEvent.type == "mousedown" && this.getIntervalSelection()) {
			// as in the focus event the month can be changed, store the last target here
			this._sLastTargetId = $DomRef.attr("id");
		}

		if (bFireFocus) {
			this.fireFocus({date: CalendarUtils._createLocalDate(oFocusedDate), otherMonth: bOtherMonth});
		}

		if (oEvent.type == "mousedown") {
			// as no click event is fired in some cases, e.g. if month is changed (because of changing DOM) select the day on mousedown
			_handleMousedown.call(this, oEvent, oFocusedDate, iIndex);
		}

	}

	function _handleFocusAgain(oControlEvent){

		var iIndex = oControlEvent.getParameter("index");
		var oEvent = oControlEvent.getParameter("event");

		if (!oEvent) {
			return; // happens if focus is set via ItemNavigation.focusItem directly
		}

		if (oEvent.type == "mousedown") {
			// as no click event is fired in some cases, e.g. if month is changed (because of changing DOM) select the day on mousedown
			var oFocusedDate = this._getDate();
			if (this.getIntervalSelection()) {
				var aDomRefs = this._oItemNavigation.getItemDomRefs();
				this._sLastTargetId = aDomRefs[iIndex].id;
			}
			_handleMousedown.call(this, oEvent, oFocusedDate, iIndex);
		}

	}

	function _handleMousedown(oEvent, oFocusedDate, iIndex){

		if (oEvent.button) {
			// only use left mouse button
			return;
		}

		var bSelected = _selectDay.call(this, oFocusedDate);
		if (bSelected) {
			this._bMousedownChange = true;
		}

		if (this._bMouseMove) {
			// a mouseup must be happened outside of control -> just end move
			this._unbindMousemove(true);
			this._bMoveChange = false;
			this._oMoveSelectedDate = undefined;
		}else if (bSelected && this.getIntervalSelection() && this.$().is(":visible")) {
			// if calendar was closed in select event, do not add mousemove handler
			this._bindMousemove(true);
			this._oMoveSelectedDate = this._newUniversalDate(oFocusedDate);
		}

		oEvent.preventDefault(); // to prevent focus set outside of DatePicker
		oEvent.setMark("cancelAutoClose");

	}

	function _changeDate (oDate, bNoFocus){

		if (!(oDate instanceof Date)) {
			throw new Error("Date must be a JavaScript date object; " + this);
		}

		var iYear = oDate.getFullYear();
		if (iYear < 1 || iYear > 9999) {
			throw new Error("Date must not be in valid range (between 0001-01-01 and 9999-12-31); " + this);
		}

		var bFocusable = true; // if date not changed it is still focusable
		if (!jQuery.sap.equal(this.getDate(), oDate)) {
			var oUTCDate = CalendarUtils._createUniversalUTCDate(oDate, this.getPrimaryCalendarType());
			bFocusable = this.checkDateFocusable(oDate);
			this.setProperty("date", oDate, true);
			this._oUTCDate = oUTCDate;
		}

		if (this.getDomRef()) {
			if (bFocusable) {
				_focusDate.call(this, this._oUTCDate, true, bNoFocus);
			} else {
				_renderMonth.call(this, bNoFocus);
			}
		}

	}

	function _focusDate (oDate, bNoSetDate, bNoFocus){

		if (!bNoSetDate) {
			// use JS date as public function is called
			this.setDate(CalendarUtils._createLocalDate(new Date(oDate.getTime())));
		}

		var sYyyymmdd = this._oFormatYyyymmdd.format(oDate.getJSDate(), true);
		var aDomRefs = this._oItemNavigation.getItemDomRefs();
		var $DomRefDay;
		for ( var i = 0; i < aDomRefs.length; i++) {
			$DomRefDay = jQuery(aDomRefs[i]);
			if ($DomRefDay.attr("data-sap-day") == sYyyymmdd) {
				if (document.activeElement != aDomRefs[i]) {
					if (bNoFocus) {
						this._oItemNavigation.setFocusedIndex(i);
					} else {
						this._oItemNavigation.focusItem(i);
					}
				}
				break;
			}
		}

	}

	function _renderMonth(bNoFocus){

		var oDate = this.getRenderer().getStartDate(this);
		var $Container = this.$("days");
		var aDomRefs;
		var $DomRef;
		var i = 0;
		var iLastIndex = 0;

		if (this._sLastTargetId) {
			// new month during mousemove -> get index of last moving taget to ignore move on same area
			aDomRefs = this._oItemNavigation.getItemDomRefs();
			for ( i = 0; i < aDomRefs.length; i++) {
				$DomRef = jQuery(aDomRefs[i]);
				if ($DomRef.attr("id") == this._sLastTargetId) {
					iLastIndex = i;
					break;
				}
			}
		}

		if ($Container.length > 0) {
			var oRm = sap.ui.getCore().createRenderManager();
			this.getRenderer().renderDays(oRm, this, oDate);
			oRm.flush($Container[0]);
			oRm.destroy();
		}

		this._renderHeader();

		// fire internal event for DatePicker for with number of rendered days. If Calendar becomes larger maybe popup must change position
		this.fireEvent("_renderMonth", {days: $Container.find(".sapUiCalItem").length});

		_initItemNavigation.call(this);
		if (!bNoFocus) {
			this._oItemNavigation.focusItem(this._oItemNavigation.getFocusedIndex());
		}

		if (this._sLastTargetId) {
			// new month during mousemove -> get index of last moving taget to ignore move on same area
			aDomRefs = this._oItemNavigation.getItemDomRefs();
			if (iLastIndex <= aDomRefs.length - 1) {
				$DomRef = jQuery(aDomRefs[iLastIndex]);
				this._sLastTargetId = $DomRef.attr("id");
			}
		}

	}

	function _selectDay(oDate, bMove){

		if (!this._checkDateEnabled(oDate)) {
			// date is disabled -> do not select it
			return false;
		}

		var aSelectedDates = this.getSelectedDates();
		var oDateRange;
		var aDomRefs = this._oItemNavigation.getItemDomRefs();
		var $DomRef;
		var sYyyymmdd;
		var i = 0;
		var oParent = this.getParent();
		var oAggOwner = this;
		var oStartDate;
		var sCalendarType = this.getPrimaryCalendarType();

		if (oParent && oParent.getSelectedDates) {
			// if used in Calendar use the aggregation of this one
			oAggOwner = oParent;
		}

		/* eslint-disable no-lonely-if */
		if (this.getSingleSelection()) {

			if (aSelectedDates.length > 0) {
				oDateRange = aSelectedDates[0];
				oStartDate = oDateRange.getStartDate();
				if (oStartDate) {
					oStartDate = CalendarUtils._createUniversalUTCDate(oStartDate, sCalendarType);
				}
			} else {
				oDateRange = new sap.ui.unified.DateRange();
				oAggOwner.addAggregation("selectedDates", oDateRange, true); // no re-rendering
			}

			if (this.getIntervalSelection() && (!oDateRange.getEndDate() || bMove) && oStartDate) {
				// single interval selection
				var oEndDate;
				if (oDate.getTime() < oStartDate.getTime()) {
					oEndDate = oStartDate;
					oStartDate = oDate;
					if (!bMove) {
						// in move mode do not set date. this bring broblems if on backward move the start date would be cahnged
						oDateRange.setProperty("startDate", CalendarUtils._createLocalDate(new Date(oStartDate.getTime())), true); // no-rerendering
						oDateRange.setProperty("endDate", CalendarUtils._createLocalDate(new Date(oEndDate.getTime())), true); // no-rerendering
					}
				} else if (oDate.getTime() >= oStartDate.getTime()) {
					// single day ranges are allowed
					oEndDate = oDate;
					if (!bMove) {
						oDateRange.setProperty("endDate", CalendarUtils._createLocalDate(new Date(oEndDate.getTime())), true); // no-rerendering
					}
				}
				_updateSelection.call(this, oStartDate, oEndDate);
			} else {
				// single day selection or start a new interval
				_updateSelection.call(this, oDate);

				oDateRange.setProperty("startDate", CalendarUtils._createLocalDate(new Date(oDate.getTime())), true); // no-rerendering
				oDateRange.setProperty("endDate", undefined, true); // no-rerendering
			}
		} else {
			// multiple selection
			if (this.getIntervalSelection()) {
				throw new Error("Calender don't support multiple interval selection");

			} else {
				var iSelected = this._checkDateSelected(oDate);
				if (iSelected > 0) {
					// already selected - deselect
					for ( i = 0; i < aSelectedDates.length; i++) {
						oStartDate = aSelectedDates[i].getStartDate();
						if (oStartDate && oDate.getTime() == CalendarUtils._createUniversalUTCDate(oStartDate, sCalendarType).getTime()) {
							oAggOwner.removeAggregation("selectedDates", i, true); // no re-rendering
							break;
						}
					}
				} else {
					// not selected -> select
					oDateRange = new sap.ui.unified.DateRange({startDate: CalendarUtils._createLocalDate(new Date(oDate.getTime()))});
					oAggOwner.addAggregation("selectedDates", oDateRange, true); // no re-rendering
				}
				sYyyymmdd = this._oFormatYyyymmdd.format(oDate.getJSDate(), true);
				for ( i = 0; i < aDomRefs.length; i++) {
					$DomRef = jQuery(aDomRefs[i]);
					if ($DomRef.attr("data-sap-day") == sYyyymmdd) {
						if (iSelected > 0) {
							$DomRef.removeClass("sapUiCalItemSel");
							$DomRef.attr("aria-selected", "false");
						} else {
							$DomRef.addClass("sapUiCalItemSel");
							$DomRef.attr("aria-selected", "true");
						}
					}
				}
			}
		}

		return true;

	}

	function _updateSelection(oStartDate, oEndDate){

		var aDomRefs = this._oItemNavigation.getItemDomRefs();
		var $DomRef;
		var i = 0;
		var bStart = false;
		var bEnd = false;

		if (!oEndDate) {
			// start of interval or single date
			var sYyyymmdd = this._oFormatYyyymmdd.format(oStartDate.getJSDate(), true);
			for ( i = 0; i < aDomRefs.length; i++) {
				$DomRef = jQuery(aDomRefs[i]);
				bStart = false;
				bEnd = false;
				if ($DomRef.attr("data-sap-day") == sYyyymmdd) {
					$DomRef.addClass("sapUiCalItemSel");
					$DomRef.attr("aria-selected", "true");
					bStart = true;
				} else if ($DomRef.hasClass("sapUiCalItemSel")) {
					$DomRef.removeClass("sapUiCalItemSel");
					$DomRef.attr("aria-selected", "false");
				}
				if ($DomRef.hasClass("sapUiCalItemSelStart")) {
					$DomRef.removeClass("sapUiCalItemSelStart");
				} else if ($DomRef.hasClass("sapUiCalItemSelBetween")) {
					$DomRef.removeClass("sapUiCalItemSelBetween");
				} else if ($DomRef.hasClass("sapUiCalItemSelEnd")) {
					$DomRef.removeClass("sapUiCalItemSelEnd");
				}
				_updateARIADesrcibedby.call(this, $DomRef, bStart, bEnd);
			}
		} else {
			var oDay;
			for ( i = 0; i < aDomRefs.length; i++) {
				$DomRef = jQuery(aDomRefs[i]);
				bStart = false;
				bEnd = false;
				oDay = this._newUniversalDate(this._oFormatYyyymmdd.parse($DomRef.attr("data-sap-day"), true));
				if (oDay.getTime() == oStartDate.getTime()) {
					$DomRef.addClass("sapUiCalItemSelStart");
					bStart = true;
					$DomRef.addClass("sapUiCalItemSel");
					$DomRef.attr("aria-selected", "true");
					if (oEndDate && oDay.getTime() == oEndDate.getTime()) {
						// start day and end day are the same
						$DomRef.addClass("sapUiCalItemSelEnd");
						bEnd = true;
					}
					$DomRef.removeClass("sapUiCalItemSelBetween");
				} else if (oEndDate && oDay.getTime() > oStartDate.getTime() && oDay.getTime() < oEndDate.getTime()) {
					$DomRef.addClass("sapUiCalItemSel");
					$DomRef.attr("aria-selected", "true");
					$DomRef.addClass("sapUiCalItemSelBetween");
					$DomRef.removeClass("sapUiCalItemSelStart");
					$DomRef.removeClass("sapUiCalItemSelEnd");
				} else if (oEndDate && oDay.getTime() == oEndDate.getTime()) {
					$DomRef.addClass("sapUiCalItemSelEnd");
					bEnd = true;
					$DomRef.addClass("sapUiCalItemSel");
					$DomRef.attr("aria-selected", "true");
					$DomRef.removeClass("sapUiCalItemSelStart");
					$DomRef.removeClass("sapUiCalItemSelBetween");
				} else {
					if ($DomRef.hasClass("sapUiCalItemSel")) {
						$DomRef.removeClass("sapUiCalItemSel");
						$DomRef.attr("aria-selected", "false");
					}
					if ($DomRef.hasClass("sapUiCalItemSelStart")) {
						$DomRef.removeClass("sapUiCalItemSelStart");
					} else if ($DomRef.hasClass("sapUiCalItemSelBetween")) {
						$DomRef.removeClass("sapUiCalItemSelBetween");
					} else if ($DomRef.hasClass("sapUiCalItemSelEnd")) {
						$DomRef.removeClass("sapUiCalItemSelEnd");
					}
				}
				_updateARIADesrcibedby.call(this, $DomRef, bStart, bEnd);
			}
		}

	}

	function _updateARIADesrcibedby($DomRef, bStart, bEnd){

		if (!this.getIntervalSelection()) {
			return;
		}

		var sDescribedBy = "";
		var aDescribedBy = [];
		var sId = this.getId();
		var bChanged = false;

		sDescribedBy = $DomRef.attr("aria-describedby");
		if (sDescribedBy) {
			aDescribedBy = sDescribedBy.split(" ");
		}

		var iStartIndex = -1;
		var iEndIndex = -1;
		for (var i = 0; i < aDescribedBy.length; i++) {
			var sDescrId = aDescribedBy[i];
			if (sDescrId == (sId + "-Start")) {
				iStartIndex = i;
			}
			if (sDescrId == (sId + "-End")) {
				iEndIndex = i;
			}
		}

		if (iStartIndex >= 0 && !bStart) {
			aDescribedBy.splice(iStartIndex, 1);
			bChanged = true;
			if (iEndIndex > iStartIndex) {
				iEndIndex--;
			}
		}
		if (iEndIndex >= 0 && !bEnd) {
			aDescribedBy.splice(iEndIndex, 1);
			bChanged = true;
		}

		if (iStartIndex < 0 && bStart) {
			aDescribedBy.push(sId + "-Start");
			bChanged = true;
		}
		if (iEndIndex < 0 && bEnd) {
			aDescribedBy.push(sId + "-End");
			bChanged = true;
		}

		if (bChanged) {
			sDescribedBy = aDescribedBy.join(" ");
			$DomRef.attr("aria-describedby", sDescribedBy);
		}

	}

	function _fireSelect(){

		if (this._bMouseMove) {
			// detach mouse move handler because calendar might be losed in select event handler
			this._unbindMousemove(true);
		}

		this.fireSelect();

	}

	function _checkNamesLength(){

		if (!this._bNamesLengthChecked) {
			// only once - cannot change by rerendering - only by theme change
			var oWeekDay;

			// check day names
			var aWeekHeaders = this.$().find(".sapUiCalWH");
			var bTooLong = false;
			var i = 0;

			for (i = 0; i < aWeekHeaders.length; i++) {
				oWeekDay = aWeekHeaders[i];
				if (Math.abs(oWeekDay.clientWidth - oWeekDay.scrollWidth) > 1) {
					bTooLong = true;
					break;
				}
			}

			if (bTooLong) {
				this._bLongWeekDays = false;
				var oLocaleData = this._getLocaleData();
				var iStartDay = this._getFirstWeekDay();
				var aDayNames = oLocaleData.getDaysStandAlone("narrow", this.getPrimaryCalendarType());
				for ( i = 0; i < aWeekHeaders.length; i++) {
					oWeekDay = aWeekHeaders[i];
					jQuery(oWeekDay).text(aDayNames[(i + iStartDay) % 7]);
				}
			} else {
				this._bLongWeekDays = true;
			}

			this._bNamesLengthChecked = true;
		}

	}

	function _invalidateMonth(){

		this._sInvalidateMonth = undefined;

		_renderMonth.call(this, this._bNoFocus);
		this._bDateRangeChanged = undefined;
		this._bNoFocus = undefined; // set in Calendar to prevent focus flickering for multiple months

	}

	return Month;

}, /* bExport= */ true);
