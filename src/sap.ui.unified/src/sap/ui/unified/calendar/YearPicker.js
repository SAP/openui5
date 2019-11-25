/*!
 * ${copyright}
 */

//Provides control sap.ui.unified.Calendar.
sap.ui.define([
	'sap/ui/core/Control',
	'sap/ui/Device',
	'sap/ui/core/delegate/ItemNavigation',
	'sap/ui/unified/calendar/CalendarUtils',
	'sap/ui/unified/calendar/CalendarDate',
	'sap/ui/core/date/UniversalDate',
	'sap/ui/unified/library',
	'sap/ui/core/format/DateFormat',
	'sap/ui/core/library',
	"./YearPickerRenderer",
	"sap/ui/events/KeyCodes",
	"sap/ui/thirdparty/jquery"
], function(
	Control,
	Device,
	ItemNavigation,
	CalendarUtils,
	CalendarDate,
	UniversalDate,
	library,
	DateFormat,
	coreLibrary,
	YearPickerRenderer,
	KeyCodes,
	jQuery
) {
	"use strict";

	// shortcut for sap.ui.core.CalendarType
	var CalendarType = coreLibrary.CalendarType;

	/*
	* Inside the YearPicker CalendarDate objects are used. But in the API JS dates are used.
	* So conversion must be done on API functions.
	*/

	/**
	 * Constructor for a new YearPicker.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * renders a YearPicker with ItemNavigation
	 * This is used inside the calendar. Not for stand alone usage.
	 * As in all date-time controls, all pubic JS Date objects that are given (e.g. <code>setDate()</code>) or read
	 * (e.g. <code>getFirstRenderedDate</code>) with values which are considered as date objects in browser(local) timezone.
	 * @extends sap.ui.core.Control
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.28.0
	 * @alias sap.ui.unified.calendar.YearPicker
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var YearPicker = Control.extend("sap.ui.unified.calendar.YearPicker", /** @lends sap.ui.unified.calendar.YearPicker.prototype */ { metadata : {

		library : "sap.ui.unified",
		properties : {

			/**
			 * The year is initial focused and selected
			 * The value must be between 0 and 9999
			 * @deprecated as of version 1.34.0, replaced by <code>date</code> property
			 */
			year : {type : "int", group : "Data", defaultValue : 2000},

			/**
			 * number of displayed years
			 * @since 1.30.0
			 */
			years : {type : "int", group : "Appearance", defaultValue : 20},

			/**
			 * number of years in each row
			 * 0 means just to have all years in one row, independent of the number
			 * @since 1.30.0
			 */
			columns : {type : "int", group : "Appearance", defaultValue : 4},

			/**
			 * Date as JavaScript Date object. For this date a <code>YearPicker</code> is rendered. If a Year is selected the
			 * date is updated with the start date of the selected year (depending on the calendar type).
			 * @since 1.34.0
			 */
			date : {type : "object", group : "Data"},

			/**
			 * If set, the calendar type is used for display.
			 * If not set, the calendar type of the global configuration is used.
			 * @since 1.34.0
			 */
			primaryCalendarType : {type : "sap.ui.core.CalendarType", group : "Appearance"}
		},
		events : {

			/**
			 * Month selection changed
			 */
			select : {},

			/**
			 * The <code>pageChange</code> event is fired if the displayed years are changed by user navigation.
			 * @since 1.38.0
			 */
			pageChange : {}
		}
	}});

	/* eslint-disable no-lonely-if */

	YearPicker.prototype.init = function(){

		// set default calendar type from configuration
		var sCalendarType = sap.ui.getCore().getConfiguration().getCalendarType();
		this.setProperty("primaryCalendarType", sCalendarType);

		// to format year with era in Japanese
		this._oYearFormat = DateFormat.getDateInstance({format: "y", calendarType: sCalendarType});
		this._oFormatYyyymmdd = DateFormat.getInstance({pattern: "yyyyMMdd", calendarType: CalendarType.Gregorian});

		this._oMinDate = CalendarUtils._minDate(this.getPrimaryCalendarType());
		this._oMaxDate = CalendarUtils._maxDate(this.getPrimaryCalendarType());

	};

	YearPicker.prototype.onAfterRendering = function(){

		_initItemNavigation.call(this);
	};
	
	YearPicker.prototype.getFocusDomRef = function(){
		return this._oItemNavigation.getItemDomRefs()[this._oItemNavigation.getFocusedIndex()];
	};

	YearPicker.prototype.setYear = function(iYear){

		// no rerendering needed, just select new year or update years
		this.setProperty("year", iYear, true);
		iYear = this.getProperty("year"); // to have type conversion, validation....
		var oDate = new CalendarDate(iYear, 0, 1, this.getPrimaryCalendarType());

		this.setDate(oDate.toLocalJSDate());

		return this;

	};
	/*
	 * Sets a date.
	 * @param {Date} oDate a JavaScript date
	 * @return {sap.ui.unified.YearPicker} <code>this</code> for method chaining
	 */
	YearPicker.prototype.setDate = function(oDate){
		var oCalDate, iYear, iYears, oFirstDate;

		// check the given object if it's a JS Date object
		// null is a default value so it should not throw error but set it instead
		oDate && CalendarUtils._checkJSDateObject(oDate);

		iYear = oDate.getFullYear();
		CalendarUtils._checkYearInValidRange(iYear);

		oCalDate = CalendarDate.fromLocalJSDate(oDate, this.getPrimaryCalendarType());
		oCalDate.setMonth(0, 1);

		// no rerendering needed, just select new year or update years
		this.setProperty("date", oDate, true);
		this.setProperty("year", oCalDate.getYear(), true);
		this._oDate = oCalDate;

		if (this.getDomRef()) {
			iYears = this.getYears();
			oFirstDate = new CalendarDate(this._oDate, this.getPrimaryCalendarType());
			oFirstDate.setYear(oFirstDate.getYear() - Math.floor(iYears / 2));
			this._updateYears(oFirstDate, Math.floor(iYears / 2));
		}

		return this;

	};

	/**
	* @return {sap.ui.unified.calendar.CalendarDate} The date, representing the year
	* @private
	*/
	YearPicker.prototype._getDate = function(){

		if (!this._oDate) {
			var iYear = this.getYear();
			this._oDate = new CalendarDate(iYear, 0, 1, this.getPrimaryCalendarType());
		}

		return this._oDate;

	};

	YearPicker.prototype.setPrimaryCalendarType = function(sCalendarType){

		this.setProperty("primaryCalendarType", sCalendarType);

		this._oYearFormat = DateFormat.getDateInstance({format: "y", calendarType: sCalendarType});

		if (this._oDate) {
			this._oDate = new CalendarDate(this._oDate, sCalendarType);
			this._oDate.setMonth(0, 1);
		}
		//The min and max dates are given in gregorian values, but when getters are called they are calendar relevant -
		//i.e. maxdate date for islamic corresponds to 9666/3/30.
		//This is why we need to reinstantiate min/max date. If we don't we would again return the same dates for min/max
		this._oMinDate = new CalendarDate(this._oMinDate, sCalendarType);
		this._oMaxDate = new CalendarDate(this._oMaxDate, sCalendarType);

		return this;

	};

	/**
	 * displays the next page
	 *
	 * @returns {sap.ui.unified.calendar.YearPicker} <code>this</code> to allow method chaining
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	YearPicker.prototype.nextPage = function(){

		this._updatePage(true, this._oItemNavigation.getFocusedIndex());

		return this;

	};

	/**
	 * displays the previous page
	 *
	 * @returns {sap.ui.unified.calendar.YearPicker} <code>this</code> to allow method chaining
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	YearPicker.prototype.previousPage = function(){

		this._updatePage(false, this._oItemNavigation.getFocusedIndex());

		return this;

	};

	YearPicker.prototype.onsapspace = function(oEvent) {
		oEvent.preventDefault();
	};

	YearPicker.prototype.onsapselect = function(oEvent){

		// focused item must be selected
		var iIndex = this._oItemNavigation.getFocusedIndex();

		var bSelected = this._selectYear(iIndex);
		if (bSelected) {
			this.fireSelect();
		}

	};

	YearPicker.prototype.onmousedown = function (oEvent) {
		this._oMousedownPosition = {
			clientX: oEvent.clientX,
			clientY: oEvent.clientY
		};
	};

	YearPicker.prototype.onmouseup = function(oEvent){

		// fire select event on mouseup to prevent closing MonthPicker during click

		if (this._bMousedownChange) {
			this._bMousedownChange = false;
			this.fireSelect();
		} else if (Device.support.touch
			&& this._isValueInThreshold(this._oMousedownPosition.clientX, oEvent.clientX, 10)
			&& this._isValueInThreshold(this._oMousedownPosition.clientY, oEvent.clientY, 10)
		) {
			var iIndex = this._oItemNavigation.getFocusedIndex();
			this._selectYear(iIndex);
			this.fireSelect();
		}

	};

	/**
	 * return the first date of the first rendered year
	 * <b>Note:</b> If the YearPicker is not rendered no date is returned
	 *
	 * @returns {object} JavaScript Date Object
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 * @since 1.38.0
	 */
	YearPicker.prototype.getFirstRenderedDate = function(){

		var oFirstDate;

		if (this.getDomRef()) {
			var aDomRefs = this._oItemNavigation.getItemDomRefs();
			oFirstDate =  this._oFormatYyyymmdd.parse(jQuery(aDomRefs[0]).attr("data-sap-year-start"));
		}

		return oFirstDate;

	};

	/**
	 * Returns if value is in predefined threshold.
	 *
	 * @private
	 */
	YearPicker.prototype._isValueInThreshold = function (iReference, iValue, iThreshold) {
		var iLowerThreshold = iReference - iThreshold,
			iUpperThreshold = iReference + iThreshold;

		return iValue >= iLowerThreshold && iValue <= iUpperThreshold;
	};

	/**
	* @param {sap.ui.unified.calendar.CalendarDate} oDate The date to be checked whether it is outside min and max date
	* @return {sap.ui.unified.calendar.CalendarDate} The checked date or min or max date if the checked one is outside
	* @private
	*/
	YearPicker.prototype._checkFirstDate = function(oDate){

		// check if first date is outside of min and max date
		var iYears = this.getYears(),
			oMaxStartYear = new CalendarDate(this._oMaxDate, this.getPrimaryCalendarType());

		oMaxStartYear.setYear(oMaxStartYear.getYear() - iYears + 1);
		if (oDate.isAfter(oMaxStartYear) && oDate.getYear() != oMaxStartYear.getYear()) {
			oDate = new CalendarDate(oMaxStartYear, this.getPrimaryCalendarType());
			oDate.setMonth(0, 1);
		} else if (oDate.isBefore(this._oMinDate) && oDate.getYear() != this._oMinDate.getYear()) {
			oDate = new CalendarDate(this._oMinDate, this.getPrimaryCalendarType());
			oDate.setMonth(0, 1);
		}

		return oDate;

	};

	/**
	* @param {sap.ui.unified.calendar.CalendarDate} oDate The date do be checked
	* @returns {boolean} Whether the date is enabled
	* @private
	*/
	YearPicker.prototype._checkDateEnabled = function(oDate){

		var bEnabled = true;

		if ((oDate.isAfter(this._oMaxDate) && oDate.getYear() != this._oMaxDate.getYear()) ||
				(oDate.isBefore(this._oMinDate) && oDate.getYear() != this._oMinDate.getYear())) {
			bEnabled = false;
		}

		return bEnabled;

	};

	YearPicker.prototype._updatePage = function (bForward, iSelectedIndex, bFireEvent){

		var aDomRefs = this._oItemNavigation.getItemDomRefs();
		var oFirstDate =  CalendarDate.fromLocalJSDate(this._oFormatYyyymmdd.parse(jQuery(aDomRefs[0]).attr("data-sap-year-start")), this.getPrimaryCalendarType());
		var iYears = this.getYears();

		if (bForward) {
			var oMaxDate = new CalendarDate(this._oMaxDate, this.getPrimaryCalendarType());
			oMaxDate.setYear(oMaxDate.getYear() - iYears + 1);
			if (oFirstDate.isBefore(oMaxDate)) {
				oFirstDate.setYear(oFirstDate.getYear() + iYears);
				if (oFirstDate.isAfter(oMaxDate)){
					iSelectedIndex = iSelectedIndex + (oFirstDate.getYear() - oMaxDate.getYear());
					if (iSelectedIndex > iYears - 1) {
						iSelectedIndex = iYears - 1;
					}
					oFirstDate = this._oMaxDate;
					this._oDate.setMonth(0, 1);
				}
			} else {
				return;
			}
		} else {
			if (oFirstDate.isAfter(this._oMinDate)) {
				oFirstDate.setYear(oFirstDate.getYear() - iYears);
				if (oFirstDate.isBefore(this._oMinDate)) {
					iSelectedIndex = iSelectedIndex - (this._oMinDate.getYear() - oFirstDate.getYear());
					if (iSelectedIndex < 0) {
						iSelectedIndex = 0;
					}
					oFirstDate = new CalendarDate(this._oMinDate, this.getPrimaryCalendarType());
				}
			} else {
				return;
			}
		}

		this._updateYears(oFirstDate, iSelectedIndex);

		if (bFireEvent) {
			this.firePageChange();
		}

	};

	/**
	* @param {sap.ui.unified.calendar.CalendarDate} oFirstDate
	* @param {int} iSelectedIndex
	* @private
	*/
	YearPicker.prototype._updateYears = function(oFirstDate, iSelectedIndex){

		var sCurrentYyyymmdd = this._oFormatYyyymmdd.format(this._getDate().toUTCJSDate(), true);
		var bEnabledCheck = false; // check for disabled years only needed if borders touched
		var oFirstDate2 = this._checkFirstDate(oFirstDate);
		var oSelectedDate;
		if (!oFirstDate2.isSame(oFirstDate)) {
			oSelectedDate = new CalendarDate(oFirstDate, this.getPrimaryCalendarType());
			oSelectedDate.setYear(oSelectedDate.getYear() + iSelectedIndex);
			oFirstDate = oFirstDate2;
			bEnabledCheck = true;
		}

		var aDomRefs = this._oItemNavigation.getItemDomRefs();
		var oDate = new CalendarDate(oFirstDate, this.getPrimaryCalendarType());
		for ( var i = 0; i < aDomRefs.length; i++) {
			var sYyyymmdd = this._oFormatYyyymmdd.format(oDate.toUTCJSDate(), true);
			var $DomRef = jQuery(aDomRefs[i]);
			$DomRef.attr("id", this.getId() + "-y" + sYyyymmdd);
			// to render era in Japanese, UniversalDate is used, since CalendarDate.toUTCJSDate() will convert the date in Gregorian
			$DomRef.text(this._oYearFormat.format(UniversalDate.getInstance(oDate.toUTCJSDate(), oDate.getCalendarType()), true));
			$DomRef.attr("data-sap-year-start", sYyyymmdd);
			if ($DomRef.hasClass("sapUiCalItemSel") && sYyyymmdd != sCurrentYyyymmdd) {
				$DomRef.removeClass("sapUiCalItemSel");
				$DomRef.attr("aria-selected", "false");
			} else if (!$DomRef.hasClass("sapUiCalItemSel") && sYyyymmdd == sCurrentYyyymmdd) {
				$DomRef.addClass("sapUiCalItemSel");
				$DomRef.attr("aria-selected", "true");
			}

			var bEnabled = true;
			if (bEnabledCheck) {
				bEnabled = this._checkDateEnabled(oDate);
				if (oDate.isSame(oSelectedDate)) {
					iSelectedIndex = i;
				}
			}

			if (bEnabled) {
				$DomRef.removeClass("sapUiCalItemDsbl");
				$DomRef.removeAttr("aria-disabled");
			} else {
				$DomRef.addClass("sapUiCalItemDsbl");
				$DomRef.attr("aria-disabled", true);
			}

			oDate.setYear(oDate.getYear() + 1);
		}

		this._oItemNavigation.focusItem(iSelectedIndex);

	};

	YearPicker.prototype.ontouchstart = function (oEvent){
		if (!Device.system.desktop && oEvent.target.classList.contains("sapUiCalItem")){
			oEvent.target.classList.add("sapUiCalItemSel");
		}
	};

	YearPicker.prototype._selectYear = function (iIndex) {

		var aDomRefs = this._oItemNavigation.getItemDomRefs(),
			$DomRef = jQuery(aDomRefs[iIndex]),
			sYyyymmdd,
			oDate,
			sId;

		if ($DomRef.hasClass("sapUiCalItemDsbl")) {
			return false; // don't select disabled items
		}
		sYyyymmdd = $DomRef.attr("data-sap-year-start");
		oDate = CalendarDate.fromLocalJSDate(this._oFormatYyyymmdd.parse(sYyyymmdd), this.getPrimaryCalendarType());
		sId = this.getId() + "-y" + sYyyymmdd;

		for ( var i = 0; i < aDomRefs.length; i++) {
			$DomRef = jQuery(aDomRefs[i]);
			if ($DomRef.attr("id") == sId) {
				$DomRef.addClass("sapUiCalItemSel");
				$DomRef.attr("aria-selected", "true");
			} else {
				$DomRef.removeClass("sapUiCalItemSel");
				$DomRef.attr("aria-selected", "false");
			}
		}

		this.setProperty("date", oDate.toLocalJSDate(), true);
		this.setProperty("year", oDate.getYear(), true);

		return true;

	};

	function _initItemNavigation(){

		var iYears = this.getYears();
		var iYear = this._getDate().getYear();
		var iMinYear = this._oMinDate.getYear();
		var iMaxYear = this._oMaxDate.getYear();
		var oRootDomRef = this.getDomRef();
		var aDomRefs = this.$().find(".sapUiCalItem");
		var iIndex = Math.floor(iYears / 2);

		if (iYear > iMaxYear - Math.floor(iYears / 2)) {
			iIndex = iIndex + iYear - iMaxYear + Math.floor(iYears / 2);
		}else if (iYear <= iMinYear + Math.floor(iYears / 2)) {
			iIndex = iYear - iMinYear;
		}

		if (!this._oItemNavigation) {
			this._oItemNavigation = new ItemNavigation();
			this._oItemNavigation.attachEvent(ItemNavigation.Events.AfterFocus, _handleAfterFocus, this);
			this._oItemNavigation.attachEvent(ItemNavigation.Events.FocusAgain, _handleFocusAgain, this);
			this._oItemNavigation.attachEvent(ItemNavigation.Events.BorderReached, _handleBorderReached, this);
			this.addDelegate(this._oItemNavigation);
			this._oItemNavigation.setHomeEndColumnMode(true, true);
			this._oItemNavigation.setDisabledModifiers({
				sapnext : ["alt"],
				sapprevious : ["alt"],
				saphome : ["alt"],
				sapend : ["alt"]
			});
		}
		this._oItemNavigation.setRootDomRef(oRootDomRef);
		this._oItemNavigation.setItemDomRefs(aDomRefs);
		this._oItemNavigation.setCycling(false);
		this._oItemNavigation.setColumns(this.getColumns(), true);
		this._oItemNavigation.setFocusedIndex(iIndex);
		this._oItemNavigation.setPageSize(aDomRefs.length); // to make sure that pageup/down goes out of month

	}

	function _handleAfterFocus(oControlEvent){

		var iIndex = oControlEvent.getParameter("index");
		var oEvent = oControlEvent.getParameter("event");

		if (!oEvent) {
			return; // happens if focus is set via ItemNavigation.focusItem directly
		}

		if (oEvent.type == "mousedown") {
			// as no click event is fired in some cases
			_handleMousedown.call(this, oEvent, iIndex);
		}

	}

	function _handleFocusAgain(oControlEvent){

		var iIndex = oControlEvent.getParameter("index");
		var oEvent = oControlEvent.getParameter("event");

		if (!oEvent) {
			return; // happens if focus is set via ItemNavigation.focusItem directly
		}

		if (oEvent.type == "mousedown") {
			// as no click event is fired in some cases
			_handleMousedown.call(this, oEvent, iIndex);
		}

	}

	function _handleMousedown(oEvent, iIndex){

		if (oEvent.button || Device.support.touch) {
			// only use left mouse button or not touch
			return;
		}

		var bSelected = this._selectYear(iIndex);
		if (bSelected) {
			this._bMousedownChange = true;
		}

		oEvent.preventDefault(); // to prevent focus set outside of DatePicker
		oEvent.setMark("cancelAutoClose");

	}

	function _handleBorderReached(oControlEvent){

		var oEvent = oControlEvent.getParameter("event");

		if (oEvent.type) {
			var iYears = this.getYears();
			var iColumns = this.getColumns();
			if (iColumns == 0) {
				iColumns = iYears;
			}

			switch (oEvent.type) {
			case "sapnext":
			case "sapnextmodifiers":
				if (oEvent.keyCode == KeyCodes.ARROW_DOWN && iColumns < iYears) {
					//same column in first row of next group (only if more than one row)
					this._updatePage(true, this._oItemNavigation.getFocusedIndex() - iYears + iColumns, true);
				} else {
					// first year in next group
					this._updatePage(true, 0, true);
				}
				break;

			case "sapprevious":
			case "sappreviousmodifiers":
				if (oEvent.keyCode == KeyCodes.ARROW_UP && iColumns < iYears) {
					//same column in last row of previous group (only if more than one row)
					this._updatePage(false, iYears - iColumns + this._oItemNavigation.getFocusedIndex(), true);
				} else {
					// last year in previous group
					this._updatePage(false, iYears - 1, true);
				}
				break;

			case "sappagedown":
				// same index in next group
				this._updatePage(true, this._oItemNavigation.getFocusedIndex(), true);
				break;

			case "sappageup":
				// same index in previous group
				this._updatePage(false, this._oItemNavigation.getFocusedIndex(), true);
				break;

			default:
				break;
			}
		}

	}

	return YearPicker;

});