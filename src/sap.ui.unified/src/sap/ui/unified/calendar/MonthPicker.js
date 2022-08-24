/*!
 * ${copyright}
 */

//Provides control sap.ui.unified.Calendar.
sap.ui.define([
	'sap/ui/core/Control',
	'sap/ui/Device',
	'sap/ui/core/LocaleData',
	'sap/ui/core/delegate/ItemNavigation',
	'sap/ui/unified/library',
	'sap/ui/core/Locale',
	"./MonthPickerRenderer",
	"sap/ui/thirdparty/jquery",
	"sap/ui/events/KeyCodes",
	"sap/ui/unified/DateRange",
	'sap/ui/unified/calendar/CalendarUtils',
	'sap/ui/unified/calendar/CalendarDate'
], function(
	Control,
	Device,
	LocaleData,
	ItemNavigation,
	library,
	Locale,
	MonthPickerRenderer,
	jQuery,
	KeyCodes,
	DateRange,
	CalendarUtils,
	CalendarDate
) {
	"use strict";

	var MONTHS_IN_YEAR = 12,
		MONTH_TEXT_LENGTH = 2,
		OFFSET = {
			OneYearBackward: -1,
			OneYearForward: 1
		};

	/**
	 * Constructor for a new MonthPicker.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * renders a MonthPicker with ItemNavigation
	 * This is used inside the calendar. Not for stand alone usage
	 * @extends sap.ui.core.Control
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.28.0
	 * @alias sap.ui.unified.calendar.MonthPicker
	 */
	var MonthPicker = Control.extend("sap.ui.unified.calendar.MonthPicker", /** @lends sap.ui.unified.calendar.MonthPicker.prototype */ { metadata : {

		library : "sap.ui.unified",
		properties : {

			/**
			 * The month is initial focused and selected
			 * The value must be between 0 and 11
			 */
			month : {type : "int", group : "Data", defaultValue : 0},

			/**
			 * number of displayed months
			 * The value must be between 1 and 12
			 * @since 1.30.0
			 */
			months : {type : "int", group : "Appearance", defaultValue : 12},

			/**
			 * If set, interval selection is allowed
			 * @since 1.74
			 */
			intervalSelection : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * number of months in each row
			 * The value must be between 0 and 12 (0 means just to have all months in one row, independent of the number)
			 * @since 1.30.0
			 */
			columns : {type : "int", group : "Appearance", defaultValue : 3},

			/**
			 * If set, the calendar type is used for display.
			 * If not set, the calendar type of the global configuration is used.
			 * @since 1.34.0
			 */
			primaryCalendarType : {type : "sap.ui.core.CalendarType", group : "Appearance"},

			/**
			 * If set, the months are also displayed in this calendar type
			 * If not set, the months are only displayed in the primary calendar type
			 * @since 1.104.0
			 */
			secondaryCalendarType : {type : "sap.ui.core.CalendarType", group : "Appearance"},

			/**
			 * The first displayed month. The value must be between 0 and 11
			 */
			_firstMonth : {type : "int", group : "Data", visibility: "hidden", defaultValue: 0},

			/**
			 * The focused month. The value must be between 0 and 11
			 */
			_focusedMonth : {type : "int", group : "Data", visibility: "hidden"}
		},
		aggregations : {

			/**
			 * Date Ranges for selected dates of the MonthPicker
			 * @since 1.74
			 */
			selectedDates : {type : "sap.ui.unified.DateRange", multiple : true, singularName : "selectedDate" }
		},
		associations: {
			/**
			 * Association to controls / IDs that label this control (see WAI-ARIA attribute aria-labelledby).
			 * @since 1.92
			 */
			ariaLabelledBy: { type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy" }

		},
		events : {

			/**
			 * Month selection changed
			 */
			select : {},

			/**
			 * If less than 12 months are displayed the <code>pageChange</code> event is fired
			 * if the displayed months are changed by user navigation.
			 * @since 1.38.0
			 */
			pageChange : {}

		}
	}, renderer: MonthPickerRenderer});

	MonthPicker.prototype.init = function(){

		// set default calendar type from configuration
		var sCalendarType = sap.ui.getCore().getConfiguration().getCalendarType();
		this.setProperty("primaryCalendarType", sCalendarType);

		this._iMinMonth = 0;
		this._iMaxMonth = 11;

	};

	MonthPicker.prototype.onAfterRendering = function(){

		var iFocusedMonthInYear,
			iMonth = this.getMonth(),
			iMonths = this.getMonths(),
			iFirstMonth = this.getProperty("_firstMonth"),
			iFocusedMonth = this.getProperty("_focusedMonth"),
			iRecentlyFousedMonth = this._oItemNavigation ? this._oItemNavigation.getFocusedIndex() : 0;

		_initItemNavigation.call(this);

		// check if day names are too big -> use smaller ones
		_checkNamesLength.call(this);

		if (this.getColumns() > 0) {
			// not a single-line month picker
			iFocusedMonthInYear = iFocusedMonth % iMonths;
			// iFocusedMonthInYear holds which is the focused month from the currently displayed on the screen ones (values starts from 0 to this.getMonths())
			var	iPropSeqMonths = parseInt(MONTHS_IN_YEAR / iMonths),
				// iPropSeqMonths holds how many proper sequences of months starting from january and shifting with this.getMonths() are held in a year (from 0 to 11)
				iLastDisplayedIndexFormPropSeqMonths = iPropSeqMonths * iMonths;
				// iLastDisplayedIndexFormPropSeqMonths holds the index of the last month in the last group of properly sequences displayed months in year

			if (iFocusedMonth >= iLastDisplayedIndexFormPropSeqMonths) {
				iFocusedMonthInYear = 12 - iLastDisplayedIndexFormPropSeqMonths + 1 + iFocusedMonthInYear;
			}
		} else if (iMonth < iFirstMonth || iMonth > iFirstMonth + iMonths - 1) {
			// focused month is out of displayed range, focus the same position as on previous page
			iFocusedMonthInYear = iRecentlyFousedMonth;
		} else {
			// focus the proper month
			iFocusedMonthInYear = iMonth - iFirstMonth;
		}

		this._oItemNavigation.focusItem(iFocusedMonthInYear);
	};

	MonthPicker.prototype.setMonth = function(iMonth){

		var iFirstDisplayedMonth = Math.floor(iMonth / this.getMonths()) * this.getMonths();

		if (iFirstDisplayedMonth + this.getMonths() > 12) {
			iFirstDisplayedMonth = 12 - this.getMonths();
		}

		this.setProperty("month", iMonth);
		this.setProperty("_focusedMonth", iMonth);
		this.setProperty("_firstMonth", iFirstDisplayedMonth);
		iMonth = this.getProperty("month"); // to have type conversion, validation....

		if (iMonth < 0 || iMonth > 11) {
			throw new Error("Property month must be between 0 and 11; " + this);
		}

		if (this.getIntervalSelection()) {
			this._oItemNavigation && this._oItemNavigation.focusItem(iMonth);
			return this;
		}
		if (this.getDomRef()) {
			if (this.getMonths() < 12) {
				var iStartMonth = this.getStartMonth();
				if (iMonth >= iStartMonth && iMonth <= iStartMonth + this.getMonths() - 1) {
					this._selectMonth(iMonth, true);
					this._oItemNavigation.focusItem(iMonth - iStartMonth);
				} else {
					_updateMonths.call(this, iMonth);
				}
			} else {
				this._selectMonth(iMonth, true);
				this._oItemNavigation.focusItem(iMonth);
			}
		}

		return this;

	};

	/*
	* Get selected dates from another control if set
	*/
	MonthPicker.prototype.getSelectedDates = function(){

		if (this._oSelectedDatesControlOrigin) {
			return this._oSelectedDatesControlOrigin.getSelectedDates();
		}

		return this.getAggregation("selectedDates");
	};

	MonthPicker.prototype._getSelectedDates = function() {
		var oSelectedDates = this.getSelectedDates(),
			oCurrentDate;

		if (oSelectedDates) {
			return oSelectedDates;
		} else if (!this._aMPSelectedDates || !this._aMPSelectedDates.length) {
			this._aMPSelectedDates = [new DateRange()];

			oCurrentDate = CalendarDate.fromLocalJSDate(new Date(), this.getPrimaryCalendarType());
			oCurrentDate.setMonth(this.getMonth(), 1);
			this._iYear && oCurrentDate.setYear(this._iYear);

			this._aMPSelectedDates[0].setStartDate(oCurrentDate.toLocalJSDate());

			return this._aMPSelectedDates;
		} else {
			return this._aMPSelectedDates;
		}
	};

	MonthPicker.prototype.exit = function () {
		if (this._aMPSelectedDates && this._aMPSelectedDates.length) {
			this._aMPSelectedDates.forEach(function(oDateRange) {
				oDateRange.destroy();
			});
			this._aMPSelectedDates = undefined;
		}
	};

	MonthPicker.prototype.getFocusDomRef = function(){
		return this.getDomRef() && this._oItemNavigation.getItemDomRefs()[this._oItemNavigation.getFocusedIndex()];
	};

	/**
	 * Sets the control instance which contains the selectedDates
	 * to the MonthPicker control instance
	 * @ui5-restricted sap.m.DateRangeSelection
	 * @private
	 * @param {*} oControl containing the selected dates
	 */
	MonthPicker.prototype._setSelectedDatesControlOrigin = function (oControl) {
		this._oSelectedDatesControlOrigin = oControl;
	};

	/**
	 * Sets year internally for the MonthPicker control
	 * @ui5-restricted sap.ui.unified.Calendar
	 * @private
	 * @param {int} iYear month picker year
	 */
	MonthPicker.prototype._setYear = function (iYear) {
		this._iYear = iYear;
	};

	/**
	 * Sets date internally for the MonthPicker control
	 * @ui5-restricted sap.ui.unified.Calendar
	 * @private
	 * @param {sap.ui.unified.calendar.CalendarDate} oDate month picker date
	 */
	MonthPicker.prototype._setDate = function (oDate) {
		this._oDate = oDate;
	};

	/*
	 * Use rendered locale for stand alone control
	 * But as Calendar can have an own locale, use this one if used inside Calendar
	 */
	MonthPicker.prototype._getLocale = function(){

		var oParent = this._oSelectedDatesControlOrigin;

		if (oParent && oParent._getLocale) {
			return oParent._getLocale();
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
	MonthPicker.prototype._getLocaleData = function(){

		var oParent = this._oSelectedDatesControlOrigin;

		if (oParent && oParent._getLocaleData) {
			return oParent._getLocaleData();
		} else if (!this._oLocaleData) {
			var sLocale = this._getLocale();
			var oLocale = new Locale(sLocale);
			this._oLocaleData = LocaleData.getInstance(oLocale);
		}

		return this._oLocaleData;

	};

	MonthPicker.prototype.onsapspace = function(oEvent) {
		oEvent.preventDefault();
	};

	MonthPicker.prototype.onsapselect = function(oEvent){

		// focused item must be selected
		var iIndex = this._oItemNavigation.getFocusedIndex();
		var iMonth = iIndex + this.getStartMonth();

		if (iMonth >= this._iMinMonth && iMonth <= this._iMaxMonth) {
			this._selectMonth(iMonth);
			this.fireSelect();
		}

	};

	MonthPicker.prototype.onmousedown = function (oEvent) {
		this._oMousedownPosition = {
			clientX: oEvent.clientX,
			clientY: oEvent.clientY
		};
	};

	MonthPicker.prototype.onmouseup = function(oEvent){

		var oTarget = oEvent.target,
			oSelectedDates = this._getSelectedDates()[0],
			oStartDate, oEndDate, iMonth;

		// fire select event on mouseup to prevent closing MonthPicker during click
		if (this._bMousedownChange) {
			this._bMousedownChange = false;

			if (this.getIntervalSelection() && oTarget.classList.contains("sapUiCalItem") && oSelectedDates) {
				oStartDate = CalendarDate.fromLocalJSDate(oSelectedDates.getStartDate(), this.getPrimaryCalendarType());
				oEndDate = oSelectedDates.getEndDate();
				iMonth = this._extractMonth(oTarget);
				if (iMonth !== oStartDate.getMonth() && !oEndDate && iMonth >= this._iMinMonth && iMonth <= this._iMaxMonth) {
					this._selectMonth(iMonth);
					this._oItemNavigation.focusItem(iMonth);
				}
			}

			this.fireSelect();
		} else if (Device.support.touch
			&& this._isValueInThreshold(this._oMousedownPosition.clientX, oEvent.clientX, 10)
			&& this._isValueInThreshold(this._oMousedownPosition.clientY, oEvent.clientY, 10)
		) {
			iMonth = this._oItemNavigation.getFocusedIndex() + this.getStartMonth();
			if (iMonth >= this._iMinMonth && iMonth <= this._iMaxMonth) {
				this._selectMonth(iMonth);
				this.fireSelect();
			}
		}
	};

	MonthPicker.prototype.onmouseover = function(oEvent) {
		var oTarget = oEvent.target,
			oSelectedDates = this._getSelectedDates()[0],
			oStartDate, oFocusedDate;

		if (!oSelectedDates) {
			return;
		}

		if (oSelectedDates.getStartDate()) {
			oStartDate = CalendarDate.fromLocalJSDate(oSelectedDates.getStartDate(), this.getPrimaryCalendarType());
			oStartDate.setDate(1);
		}

		if (oTarget.classList.contains("sapUiCalItem")) {
			oFocusedDate = CalendarDate.fromLocalJSDate(new Date(), this.getPrimaryCalendarType());
			oFocusedDate.setMonth(this._extractMonth(oTarget), 1);
			this._iYear && oFocusedDate.setYear(this._iYear);
			if (this._isSelectionInProgress()) {
				this._markInterval(oStartDate, oFocusedDate);
			}
		}
	};

	MonthPicker.prototype.onThemeChanged = function(){

		if (this._bNoThemeChange) {
			// already called from Calendar
			return;
		}

		if (!this.getDomRef()) {
			// if control is not rendered don't do any dom related calculation
			return;
		}

		var aMonths = this._oItemNavigation.getItemDomRefs(),
			oLocaleData = this._getLocaleData(),
			// change month name on button but not change month picker, because it is hidden again
			aMonthNames = oLocaleData.getMonthsStandAlone("wide", this.getPrimaryCalendarType()),
			i, $Month;

		this._bNamesLengthChecked = undefined;
		this._bLongMonth = false;

		for (i = 0; i < aMonths.length; i++) {
			$Month = jQuery(aMonths[i]);
			$Month.text(aMonthNames[i]);
		}

		_checkNamesLength.call(this);

	};

	/**
	 * displays the next page
	 *
	 * @returns {this} <code>this</code> to allow method chaining
	 * @public
	 */
	MonthPicker.prototype.nextPage = function(){

		var iStartMonth = this.getStartMonth(),
			iIndex = this._oItemNavigation.getFocusedIndex(),
			iMonth = iIndex + iStartMonth,
			iMonths = this.getMonths();

		iMonth = iMonth + iMonths;
		if (iMonth > MONTHS_IN_YEAR - 1) {
			iMonth = MONTHS_IN_YEAR - 1;
		}
		_updateMonths.call(this, iMonth);

		var iFirstDisplayedMonth = Math.floor(this.getStartMonth() + this.getMonths()) % MONTHS_IN_YEAR;

		if (iFirstDisplayedMonth + this.getMonths() > 12) {
			iFirstDisplayedMonth = 12 - this.getMonths();
		}

		this.setProperty("_firstMonth", iFirstDisplayedMonth);

		return this;

	};

	/**
	 * displays the previous page
	 *
	 * @returns {this} <code>this</code> to allow method chaining
	 * @public
	 */
	MonthPicker.prototype.previousPage = function(){

		var iStartMonth = this.getStartMonth(),
			iIndex = this._oItemNavigation.getFocusedIndex(),
			iMonth = iIndex + iStartMonth,
			iMonths = this.getMonths();

		iMonth = iMonth - iMonths;
		if (iMonth < 0) {
			iMonth = 0;
		}
		_updateMonths.call(this, iMonth);

		var iFirstDisplayedMonth = Math.floor(this.getStartMonth() - this.getMonths()) % MONTHS_IN_YEAR;

		if (iFirstDisplayedMonth < 0) {
			iFirstDisplayedMonth = 0;
		}

		this.setProperty("_firstMonth", iFirstDisplayedMonth);

		return this;

	};

	/**
	 * sets a minimum and maximum month
	 *
	 * @param {int} [iMin] minimum month as integer (starting with 0)
	 * @param {int} [iMax] maximum month as integer (starting with 0)
	 * @returns {this} <code>this</code> to allow method chaining
	 * @public
	 */
	MonthPicker.prototype.setMinMax = function(iMin, iMax){
		var aMonths, $DomRef, iMonth, i;

		if (iMin == this._iMinMonth && iMax == this._iMaxMonth) {
			return this;
		}

		iMin = parseInt(iMin);
		if (isNaN(iMin) || iMin < 0 || iMin > 11) {
			iMin = 0;
		}

		iMax = parseInt(iMax);
		if (isNaN(iMax) || iMax < 0 || iMax > 11) {
			iMax = 11;
		}

		if (iMin <= iMax) {
			this._iMinMonth = iMin;
			this._iMaxMonth = iMax;
		} else {
			this._iMaxMonth = iMin;
			this._iMinMonth = iMax;
		}

		if (this.getDomRef()) {
			aMonths = this._oItemNavigation.getItemDomRefs();

			for (i = 0; i < aMonths.length; i++) {
				$DomRef = jQuery(aMonths[i]);
				iMonth = this._extractMonth(aMonths[i]);
				if (iMonth < this._iMinMonth || iMonth > this._iMaxMonth) {
					$DomRef.addClass("sapUiCalItemDsbl");
					$DomRef.attr("aria-disabled", true);
				} else {
					$DomRef.removeClass("sapUiCalItemDsbl");
					$DomRef.removeAttr("aria-disabled");
				}
			}
		}

		return this;

	};

	MonthPicker.prototype.getStartMonth = function(){
		return this.getProperty("_firstMonth");
	};

	/**
	 * Returns if value is in predefined threshold.
	 *
	 * @private
	 */
	MonthPicker.prototype._isValueInThreshold = function (iReference, iValue, iThreshold) {
		var iLowerThreshold = iReference - iThreshold,
			iUpperThreshold = iReference + iThreshold;

		return iValue >= iLowerThreshold && iValue <= iUpperThreshold;
	};

	/**
	 * Returns if there is secondary calendar type set and if it is different from the primary one.
	 * @returns {boolean} if there is secondary calendar type set and if it is different from the primary one
	 */
	MonthPicker.prototype._getSecondaryCalendarType = function(){
		return this.getSecondaryCalendarType() === this.getPrimaryCalendarType() ? undefined : this.getSecondaryCalendarType();
	};

	/**
	 * Calculates the first and last displayed date about a given month.
	 * @param {integer} iCurrentMonth the month about which the dates are calculated
	 * @returns {object} two values - start and end date
	 */
	MonthPicker.prototype._getDisplayedSecondaryDates = function(iCurrentMonth){
		var sSecondaryCalendarType = this.getSecondaryCalendarType(),
			oDate = new CalendarDate(this._oDate ? this._oDate : CalendarDate.fromLocalJSDate(new Date()), this.getPrimaryCalendarType()),
			oFirstDate,
			oLastDate;

		oDate.setMonth(iCurrentMonth);
		oDate.setDate(1);
		oFirstDate = new CalendarDate(oDate, sSecondaryCalendarType);

		oDate.setDate(CalendarUtils._daysInMonth(oDate));
		oLastDate = new CalendarDate(oDate, sSecondaryCalendarType);

		return {start: oFirstDate, end: oLastDate};
	};

	function _initItemNavigation(){

		var oRootDomRef = this.getDomRef(),
			aDomRefs = this.$().find(".sapUiCalItem"),
			iColumns = this.getColumns();

		if (!this._oItemNavigation) {
			this._oItemNavigation = new ItemNavigation();
			this._oItemNavigation.attachEvent(ItemNavigation.Events.AfterFocus, this._handleAfterFocus, this);
			this._oItemNavigation.attachEvent(ItemNavigation.Events.FocusAgain, _handleFocusAgain, this);
			this._oItemNavigation.attachEvent(ItemNavigation.Events.BorderReached, _handleBorderReached, this);
			this.addDelegate(this._oItemNavigation);
			this._oItemNavigation.setHomeEndColumnMode(true, true);
			//this way we do not hijack the browser back/forward navigation
			this._oItemNavigation.setDisabledModifiers({
				sapnext: ["alt", "meta"],
				sapprevious: ["alt", "meta"],
				saphome : ["alt", "meta"],
				sapend : ["meta"]
			});
		}
		this._oItemNavigation.setRootDomRef(oRootDomRef);
		this._oItemNavigation.setItemDomRefs(aDomRefs);
		this._oItemNavigation.setCycling(false);
		this._oItemNavigation.setColumns(iColumns, true);
		var iIndex = this.getMonth() - this.getStartMonth();
		this._oItemNavigation.setFocusedIndex(iIndex);
		this._oItemNavigation.setPageSize(aDomRefs.length); // to make sure that pageup/down goes out of month

	}

	MonthPicker.prototype._handleAfterFocus = function(oControlEvent){

		var iIndex = oControlEvent.getParameter("index"),
			oEvent = oControlEvent.getParameter("event"),
			oTarget = this._oItemNavigation.aItemDomRefs[iIndex],
			oSelectedDates = this._getSelectedDates()[0],
			oStartDate, oFocusedDate;

		if (!oEvent) {
			return; // happens if focus is set via ItemNavigation.focusItem directly
		}

		if (oEvent.type === "mousedown") {
			// as no click event is fired in some cases
			this._handleMousedown(oEvent, iIndex);
		} else if (oEvent.type === "sapnext" || oEvent.type === "sapprevious") {
			if (!oSelectedDates) {
				return;
			}

			if (oSelectedDates.getStartDate()) {
				oStartDate = CalendarDate.fromLocalJSDate(oSelectedDates.getStartDate(), this.getPrimaryCalendarType());
				oStartDate.setDate(1);
			}

			oFocusedDate = CalendarDate.fromLocalJSDate(new Date(), this.getPrimaryCalendarType());
			oFocusedDate.setMonth(this._extractMonth(oTarget), 1);
			this._iYear && oFocusedDate.setYear(this._iYear);

			if (this._isSelectionInProgress()) {
				this._markInterval(oStartDate, oFocusedDate);
			}
		}
	};

	function _handleFocusAgain(oControlEvent){

		this._handleAfterFocus(oControlEvent);

	}

	MonthPicker.prototype._isSelectionInProgress = function() {
		var oSelectedDates = this._getSelectedDates()[0];
		if (!oSelectedDates) {
			return false;
		}
		return this.getIntervalSelection() && oSelectedDates.getStartDate() && !oSelectedDates.getEndDate();
	};

	MonthPicker.prototype._extractMonth = function(oCalItem) {
		var iIDLength = this.getId().length + MONTH_TEXT_LENGTH;
		return parseInt(oCalItem.id.slice(iIDLength));
	};

	MonthPicker.prototype._markInterval = function(oStartDate, oEndDate) {
		var aDomRefs = this._oItemNavigation.getItemDomRefs(),
			oCurrentDate = CalendarDate.fromLocalJSDate(new Date(), this.getPrimaryCalendarType()),
			i;

		//swap if necessary
		if (oStartDate.isAfter(oEndDate)) {
			oEndDate = [oStartDate, oStartDate = oEndDate][0];
		}

		if (this._bMousedownChange) {
			if (oEndDate.getMonth() > this._iMinMonth && oEndDate.getMonth() < this._iMaxMonth) {
				jQuery(aDomRefs[oEndDate.getMonth()]).addClass("sapUiCalItemSel");
			}
			if (oStartDate.getMonth() > this._iMinMonth && oStartDate.getMonth() < this._iMaxMonth) {
				jQuery(aDomRefs[oStartDate.getMonth()]).addClass("sapUiCalItemSel");
			}
		}

		for (i = 0; i < aDomRefs.length; ++i) {
			oCurrentDate.setMonth(this._extractMonth(aDomRefs[i]), 1);
			this._iYear && oCurrentDate.setYear(this._iYear);

			if (CalendarUtils._isBetween(oCurrentDate, oStartDate, oEndDate) && oCurrentDate.getMonth() > this._iMinMonth && oCurrentDate.getMonth() < this._iMaxMonth) {
				jQuery(aDomRefs[i]).addClass("sapUiCalItemSelBetween");
			} else {
				jQuery(aDomRefs[i]).removeClass("sapUiCalItemSelBetween");
			}

			if (this._bMousedownChange && !oCurrentDate.isSame(oStartDate) && !oCurrentDate.isSame(oEndDate)) {
				jQuery(aDomRefs[i]).removeClass("sapUiCalItemSel");
			}
		}

	};

	MonthPicker.prototype._handleMousedown = function(oEvent, iIndex){

		if (oEvent.button || Device.support.touch && !Device.system.combi) {
			// only use left mouse button or not touch
			return;
		}

		var iMonth = iIndex + this.getStartMonth();

		if (iMonth >= this._iMinMonth && iMonth <= this._iMaxMonth) {
			this._selectMonth(iMonth);
			this._bMousedownChange = true;
		}

		oEvent.preventDefault(); // to prevent focus set outside of DatePicker
		oEvent.setMark("cancelAutoClose");

	};

	function _handleBorderReached(oControlEvent){
		var oEvent = oControlEvent.getParameter("event"),
			iMonth = this._oItemNavigation.getFocusedIndex() + this.getStartMonth(),
			iMonths = this.getMonths(),
			iColumns = this.getColumns(),
			oSelectedDates = this._getSelectedDates()[0],
			oStartDate,
			oFocusedDate = CalendarDate.fromLocalJSDate(new Date(), this.getPrimaryCalendarType()),
			bOneRowMonths = iColumns === 0 && iMonths < MONTHS_IN_YEAR;

		this._iYear && oFocusedDate.setYear(this._iYear);

		if (oSelectedDates && oSelectedDates.getStartDate()) {
			oStartDate = CalendarDate.fromLocalJSDate(oSelectedDates.getStartDate(), this.getPrimaryCalendarType());
			oStartDate.setDate(1);
		}

		if (oEvent.type) {
			switch (oEvent.type) {
				case "sapnext":
				case "sapnextmodifiers":
					if (bOneRowMonths) {
						this._oneRowChangePage(iMonth, true);
					} else if (oEvent.keyCode === KeyCodes.ARROW_DOWN && iColumns <= iMonths) {
						if (iMonth < MONTHS_IN_YEAR - iMonths) {
							// We dont need to fire "pageChange" event as we only render the next block of months in the same year
							_updateMonths.call(this, iMonth + iColumns, false, OFFSET.OneYearForward);
						} else if (iMonths === MONTHS_IN_YEAR) {
							this.firePageChange({ offset: OFFSET.OneYearForward });
							this._oItemNavigation.focusItem(iMonth % iColumns);
							oFocusedDate.setMonth(iMonth % iColumns, 1);
							this.setProperty("_focusedMonth", iMonth % iColumns);
							this._isSelectionInProgress() && this._markInterval(oStartDate, oFocusedDate);
						} else {
							if (iColumns === 0) {
								iColumns = iMonths;
							}
							_updateMonths.call(this, iMonth % iColumns, true, OFFSET.OneYearForward);
						}
					} else {
						if (iMonth < MONTHS_IN_YEAR - iMonths) {
							// We dont need to fire "pageChange" event as we only render the next block of months in the same year
							_updateMonths.call(this, iMonth + 1, false, OFFSET.OneYearForward);
						} else if (iMonths === MONTHS_IN_YEAR) {
							this.firePageChange({ offset: OFFSET.OneYearForward });
							this._oItemNavigation.focusItem(0);
							oFocusedDate.setMonth(0, 1);
							this._isSelectionInProgress() && this._markInterval(oStartDate, oFocusedDate);
						} else {
							_updateMonths.call(this, 0, true, OFFSET.OneYearForward);
						}
					}
					break;

				case "sapprevious":
				case "sappreviousmodifiers":
					if (bOneRowMonths) {
						this._oneRowChangePage(iMonth);
					} else if (oEvent.keyCode === KeyCodes.ARROW_UP && iColumns <= iMonths) {
						if (iMonth >= iMonths) {
							// We dont need to fire "pageChange" event as we only render the next block of months in the same year
							_updateMonths.call(this, iMonth - iColumns, false, OFFSET.OneYearBackward);
						} else if (iMonths === MONTHS_IN_YEAR) {
							this.firePageChange({ offset: OFFSET.OneYearBackward });
							this._oItemNavigation.focusItem(iMonths - iColumns + iMonth);
							oFocusedDate.setMonth(iMonths - iColumns + iMonth, 1);
							this.setProperty("_focusedMonth", iMonths - iColumns + iMonth);
							this._isSelectionInProgress() && this._markInterval(oStartDate, oFocusedDate);
						} else {
							_updateMonths.call(this, MONTHS_IN_YEAR - iColumns + iMonth, true, OFFSET.OneYearBackward);
						}
					} else {
						if (iMonth >= iMonths) {
							// We dont need to fire "pageChange" event as we only render the next block of months in the same year
							_updateMonths.call(this, iMonth - 1, false, OFFSET.OneYearBackward);
						} else if (iMonths === MONTHS_IN_YEAR) {
							this.firePageChange({ offset: OFFSET.OneYearBackward });
							this._oItemNavigation.focusItem(iMonths - 1);
							oFocusedDate.setMonth(iMonths - 1, 1);
							this._isSelectionInProgress() && this._markInterval(oStartDate, oFocusedDate);
						} else {
							_updateMonths.call(this, MONTHS_IN_YEAR - 1, true, OFFSET.OneYearBackward);
						}
					}
					break;

				case "sappagedown":
					if (iMonth < MONTHS_IN_YEAR - iMonths) {
						// We dont need to fire "pageChange" event as we only render the next block of months in the same year
						_updateMonths.call(this, iMonth + iMonths, false, OFFSET.OneYearForward);
					} else if (iMonths === MONTHS_IN_YEAR) {
						this.firePageChange({ offset: OFFSET.OneYearForward });
					} else {
						_updateMonths.call(this, iMonth, true, OFFSET.OneYearForward);
					}
					break;

				case "sappageup":
					if (iMonth > iMonths) {
						// We dont need to fire "pageChange" event as we only render the next block of months in the same year
						_updateMonths.call(this, iMonth - iMonths, false, OFFSET.OneYearBackward);
					} else if (iMonths === MONTHS_IN_YEAR) {
						this.firePageChange({ offset: OFFSET.OneYearBackward });
					} else {
						_updateMonths.call(this, iMonth, true, OFFSET.OneYearBackward);
					}
					break;

				default:
					break;
			}
		}

	}

	MonthPicker.prototype._oneRowChangePage = function(iMonth, bNext) {
		var iFirstMonth = this.getProperty("_firstMonth"),
			iMonths = this.getMonths(),
			bShouldChangePage = bNext ? iFirstMonth + iMonths < MONTHS_IN_YEAR : iFirstMonth > 0,
			iDelta = bNext ? 1 : -1;

		if (bShouldChangePage) {
			bNext && this.nextPage() || this.previousPage();
			this.firePageChange({ offset: 0 });
			this.setMonth(iMonth + iDelta);
		}
	};

	MonthPicker.prototype._selectMonth = function(iMonth, bDontSetMonth) {
		var oSelectedDates = this._getSelectedDates()[0],
			oMonthPickerSelectedDates = this.getAggregation("selectedDates"),
			oStartDate, oFocusedDate;

		this.setProperty("_focusedMonth", iMonth);

		if (!oSelectedDates) {
			return;
		}

		!bDontSetMonth && this.setProperty("month", iMonth);

		oFocusedDate = CalendarDate.fromLocalJSDate(new Date(), this.getPrimaryCalendarType());
		oFocusedDate.setMonth(iMonth, 1);
		this._iYear && oFocusedDate.setYear(this._iYear);

		if (!this._oSelectedDatesControlOrigin) {
			if (!oMonthPickerSelectedDates || !oMonthPickerSelectedDates.length) {
				this.addAggregation("selectedDates", oSelectedDates, true);
			}
			!this.getIntervalSelection() && oSelectedDates.setStartDate(oFocusedDate.toLocalJSDate());
		}

		if (this.getIntervalSelection() && !bDontSetMonth) {
			if (!oSelectedDates.getStartDate()) {
				oSelectedDates.setStartDate(oFocusedDate.toLocalJSDate());
			} else if (!oSelectedDates.getEndDate()) {
				oStartDate = CalendarDate.fromLocalJSDate(oSelectedDates.getStartDate(), this.getPrimaryCalendarType());
				if (oFocusedDate.isBefore(oStartDate)) {
					oSelectedDates.setEndDate(oStartDate.toLocalJSDate());
					oSelectedDates.setStartDate(oFocusedDate.toLocalJSDate());
				} else {
					oSelectedDates.setEndDate(oFocusedDate.toLocalJSDate());
				}
			} else {
				oSelectedDates.setStartDate(oFocusedDate.toLocalJSDate());
				oSelectedDates.setEndDate(undefined);
			}
		}
	};

	function _checkNamesLength(){

		if (!this._bNamesLengthChecked) {
			var i = 0,
			// only once - cannot change by rerendering - only by theme change
				aMonths = this._oItemNavigation.getItemDomRefs(),
				bTooLong = false,
				iMonths = this.getMonths(),
				iBlocks = Math.ceil(MONTHS_IN_YEAR / iMonths),
				iMonth = iMonths - 1;

			for (var b = 0; b < iBlocks; b++) {
				if (iMonths < MONTHS_IN_YEAR) {
					_updateMonths.call(this, iMonth);
					iMonth = iMonth + iMonths;
					if (iMonth > MONTHS_IN_YEAR - 1) {
						iMonth = MONTHS_IN_YEAR - 1;
					}
				}

				for (i = 0; i < aMonths.length; i++) {
					var oMonth = aMonths[i];
					if (Math.abs(oMonth.clientWidth - oMonth.scrollWidth) > 1) {
						bTooLong = true;
						break;
					}
				}

				if (bTooLong) {
					break;
				}
			}

			if (iMonths < MONTHS_IN_YEAR) {
				// restore rendered block
				iMonth = this.getMonth();
				_updateMonths.call(this, iMonth);
			}

			if (bTooLong) {
				this._bLongMonth = false;
				var oLocaleData = this._getLocaleData(),
					sCalendarType = this.getPrimaryCalendarType(),
				// change month name on button but not change month picker, because it is hided again
					aMonthNames = oLocaleData.getMonthsStandAlone("abbreviated", sCalendarType),
					aMonthNamesWide = oLocaleData.getMonthsStandAlone("wide", sCalendarType);

				for (i = 0; i < aMonths.length; i++) {
					var $Month = jQuery(aMonths[i]);
					$Month.text(aMonthNames[i]);
					$Month.attr("aria-label", aMonthNamesWide[i]);
				}
			} else {
				this._bLongMonth = true;
			}

			this._bNamesLengthChecked = true;
		}

	}

	function _updateMonths(iMonth, bFireEvent, iOffset){

		var oSelectedDates = this._getSelectedDates()[0],
			oStartDate,
			oFocusedDate;

		this.setProperty("_focusedMonth", iMonth);

		if (oSelectedDates && oSelectedDates.getStartDate()) {
			oStartDate = CalendarDate.fromLocalJSDate(oSelectedDates.getStartDate(), this.getPrimaryCalendarType());
			oStartDate.setDate(1);
		}

		if (oSelectedDates && oSelectedDates.getEndDate()) {
			oFocusedDate = CalendarDate.fromLocalJSDate(oSelectedDates.getEndDate(), this.getPrimaryCalendarType());
			oFocusedDate.setDate(1);
		} else {
			oFocusedDate = CalendarDate.fromLocalJSDate(new Date(), this.getPrimaryCalendarType());
			this._iYear && oFocusedDate.setYear(this._iYear);
			oFocusedDate.setMonth(iMonth, 1);
		}

		this._isSelectionInProgress() && this._markInterval(oStartDate, oFocusedDate);

		if (bFireEvent) {
			this.firePageChange({
				offset: iOffset
			});
		}

	}

	/**
	 * Determines if a given date is the same as selected start or end date
	 *
	 * @private
	 * @param {sap.ui.unified.calendar.CalendarDate} oCurrentDate
	 */
	MonthPicker.prototype._fnShouldApplySelection = function(oCurrentDate) {
		var oSelectedDates = this._getSelectedDates()[0],
			oStartDate, oEndDate;

		if (!oSelectedDates) {
			return false;
		}

		oStartDate = oSelectedDates.getStartDate();
		oEndDate = oSelectedDates.getEndDate();

		if (oStartDate) {
			oStartDate = CalendarDate.fromLocalJSDate(oStartDate, this.getPrimaryCalendarType());
			oStartDate.setDate(1);
		}

		if (this.getIntervalSelection() && oStartDate && oEndDate) {
			oEndDate = CalendarDate.fromLocalJSDate(oEndDate, this.getPrimaryCalendarType());
			oEndDate.setDate(1);
			if (oCurrentDate.isSame(oStartDate) || oCurrentDate.isSame(oEndDate)) {
				return true;
			}
		} else if (oStartDate && oCurrentDate.isSame(oStartDate)) {
			return true;
		}
		return false;
	};

	/**
	 * Determines if a given date is between the selected start and end date
	 *
	 * @private
	 * @param {sap.ui.unified.calendar.CalendarDate} oCurrentDate
	 */
	MonthPicker.prototype._fnShouldApplySelectionBetween = function(oCurrentDate) {
		var oSelectedDates = this._getSelectedDates()[0],
			oStartDate, oEndDate;

		if (!oSelectedDates) {
			return false;
		}
		oStartDate = oSelectedDates.getStartDate();
		oEndDate = oSelectedDates.getEndDate();

		if (this.getIntervalSelection() && oStartDate && oEndDate) {
			oStartDate = CalendarDate.fromLocalJSDate(oStartDate, this.getPrimaryCalendarType());
			oStartDate.setDate(1);
			oEndDate = CalendarDate.fromLocalJSDate(oEndDate, this.getPrimaryCalendarType());
			oEndDate.setDate(1);
			if (CalendarUtils._isBetween(oCurrentDate, oStartDate, oEndDate)) {
				return true;
			}
		}

		return false;
	};

	return MonthPicker;

});