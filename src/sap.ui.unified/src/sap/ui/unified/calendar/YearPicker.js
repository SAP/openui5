/*!
 * ${copyright}
 */

//Provides control sap.ui.unified.Calendar.
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Control', 'sap/ui/core/delegate/ItemNavigation',
               'sap/ui/model/type/Date', 'sap/ui/unified/calendar/CalendarUtils', 'sap/ui/core/date/UniversalDate', 'sap/ui/unified/library'],
               function(jQuery, Control, ItemNavigation, Date1, CalendarUtils, UniversalDate, library) {
	"use strict";

	/**
	 * Constructor for a new YearPicker.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * renders a YearPicker with ItemNavigation
	 * This is used inside the calendar. Not for stand alone usage
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
			 * @deprecated Since version 1.34.0 Use <code>date</code> instead
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
		this._oYearFormat = sap.ui.core.format.DateFormat.getDateInstance({format: "y", calendarType: sCalendarType});
		this._oFormatYyyymmdd = sap.ui.core.format.DateFormat.getInstance({pattern: "yyyyMMdd", calendarType: sap.ui.core.CalendarType.Gregorian});

		this._oMinDate = this._newUniversalDate(new Date(Date.UTC(1, 0, 1)));
		this._oMinDate.getJSDate().setUTCFullYear(1); // otherwise year 1 will be converted to year 1901
		this._oMaxDate = this._newUniversalDate(new Date(Date.UTC(9999, 11, 31)));

	};

	YearPicker.prototype.onAfterRendering = function(){

		_initItemNavigation.call(this);

	};

	YearPicker.prototype.setYear = function(iYear){

		// no rerendering needed, just select new year or update years
		this.setProperty("year", iYear, true);
		iYear = this.getProperty("year"); // to have type conversion, validation....

		var oDate = this._newUniversalDate(new Date());
		oDate.setDate(1);
		oDate.setMonth(0);
		oDate.setFullYear(iYear);

		this.setDate(oDate.getJSDate());

		return this;

	};

	YearPicker.prototype.setDate = function(oDate){

		if (oDate && !(oDate instanceof Date)) {
			throw new Error("Date must be a JavaScript date object; " + this);
		}

		var iYear = oDate.getFullYear();
		if (iYear < 1 || iYear > 9999) {
			throw new Error("Date must not be in valid range (between 0001-01-01 and 9999-12-31); " + this);
		}

		var oUTCDate = CalendarUtils._createUniversalUTCDate(oDate, this.getPrimaryCalendarType());
		oUTCDate.setUTCMonth(0, 1); // start of year
		// no rerendering needed, just select new year or update years
		this.setProperty("date", oDate, true);
		this.setProperty("year", oUTCDate.getUTCFullYear(), true);
		this._oUTCDate = oUTCDate;

		if (this.getDomRef()) {
			var iYears = this.getYears();
			var oFirstDate = this._newUniversalDate(this._oUTCDate);
			oFirstDate.setUTCFullYear(oFirstDate.getUTCFullYear() - Math.floor(iYears / 2));
			_updateYears.call(this, oFirstDate, Math.floor(iYears / 2));
		}

		return this;

	};

	YearPicker.prototype._getDate = function(){

		if (!this._oUTCDate) {
			var iYear = this.getYear();
			this._oUTCDate = this._newUniversalDate(new Date(Date.UTC(iYear, 0, 1)));
			if (iYear < 100) {
				this._oUTCDate.setUTCFullYear(iYear);
			}
		}

		return this._oUTCDate;

	};

	YearPicker.prototype.setPrimaryCalendarType = function(sCalendarType){

		this.setProperty("primaryCalendarType", sCalendarType);

		this._oYearFormat = sap.ui.core.format.DateFormat.getDateInstance({format: "y", calendarType: sCalendarType});

		if (this._oUTCDate) {
			this._oUTCDate = UniversalDate.getInstance(this._oUTCDate.getJSDate(), sCalendarType);
			this._oUTCDate.setUTCMonth(0, 1); // start of year
		}
		this._oMinDate = UniversalDate.getInstance(this._oMinDate.getJSDate(), sCalendarType);
		this._oMaxDate = UniversalDate.getInstance(this._oMaxDate.getJSDate(), sCalendarType);

		return this;

	};

	YearPicker.prototype._newUniversalDate = function(oDate){

		var oJSDate;

		if ((oDate instanceof UniversalDate)) {
			oJSDate = new Date(oDate.getJSDate().getTime()); // use getTime() because IE and FF can not parse dates < 0100.01.01
		} else {
			oJSDate = new Date(oDate.getTime());
		}

		return UniversalDate.getInstance(oJSDate, this.getPrimaryCalendarType());

	};

	/**
	 * displays the next page
	 *
	 * @returns {sap.ui.unified.calendar.YearPicker} <code>this</code> to allow method chaining
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	YearPicker.prototype.nextPage = function(){

		_updatePage.call(this, true, this._oItemNavigation.getFocusedIndex());

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

		_updatePage.call(this, false, this._oItemNavigation.getFocusedIndex());

		return this;

	};

	YearPicker.prototype.onsapselect = function(oEvent){

		// focused item must be selected
		var iIndex = this._oItemNavigation.getFocusedIndex();

		var bSelected = _selectYear.call(this, iIndex);
		if (bSelected) {
			this.fireSelect();
		}

	};

	YearPicker.prototype.onmouseup = function(oEvent){

		// fire select event on mouseup to prevent closing MonthPicker during click

		if (this._bMousedownChange) {
			this._bMousedownChange = false;
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
			oFirstDate =  this._oFormatYyyymmdd.parse(jQuery(aDomRefs[0]).attr("data-sap-year-start"), true);
		}

		return oFirstDate;

	};

	YearPicker.prototype._checkFirstDate = function(oDate){

		// check if first date is outside of min and max date
		var iYears = this.getYears();
		var oMaxStartYear = this._newUniversalDate(this._oMaxDate);
		oMaxStartYear.setUTCFullYear(oMaxStartYear.getUTCFullYear() - iYears + 1);
		if (oDate.getTime() > oMaxStartYear.getTime() && oDate.getFullYear() != oMaxStartYear.getUTCFullYear()) {
			oDate = this._newUniversalDate(oMaxStartYear);
			oDate.setUTCMonth(0,1);
		} else if (oDate.getTime() < this._oMinDate.getTime() && oDate.getFullYear() != this._oMinDate.getUTCFullYear()) {
			oDate = this._newUniversalDate(this._oMinDate);
			oDate.setUTCMonth(0,1);
		}

		return oDate;

	};

	YearPicker.prototype._checkDateEnabled = function(oDate){

		var bEnabled = true;

		if ((oDate.getTime() > this._oMaxDate.getTime() && oDate.getFullYear() != this._oMaxDate.getUTCFullYear()) ||
				(oDate.getTime() < this._oMinDate.getTime() && oDate.getFullYear() != this._oMinDate.getUTCFullYear())) {
			bEnabled = false;
		}

		return bEnabled;

	};

	function _initItemNavigation(){

		var iYears = this.getYears();
		var iYear = this._getDate().getUTCFullYear();
		var iMinYear = this._oMinDate.getUTCFullYear();
		var iMaxYear = this._oMaxDate.getUTCFullYear();
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

		if (oEvent.button) {
			// only use left mouse button
			return;
		}

		var bSelected = _selectYear.call(this, iIndex);
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
				if (oEvent.keyCode == jQuery.sap.KeyCodes.ARROW_DOWN && iColumns < iYears) {
					//same column in first row of next group (only if more than one row)
					_updatePage.call(this, true, this._oItemNavigation.getFocusedIndex() - iYears + iColumns, true);
				} else {
					// first year in next group
					_updatePage.call(this, true, 0, true);
				}
				break;

			case "sapprevious":
			case "sappreviousmodifiers":
				if (oEvent.keyCode == jQuery.sap.KeyCodes.ARROW_UP && iColumns < iYears) {
					//same column in last row of previous group (only if more than one row)
					_updatePage.call(this, false, iYears - iColumns + this._oItemNavigation.getFocusedIndex(), true);
				} else {
					// last year in previous group
					_updatePage.call(this, false, iYears - 1, true);
				}
				break;

			case "sappagedown":
				// same index in next group
				_updatePage.call(this, true, this._oItemNavigation.getFocusedIndex(), true);
				break;

			case "sappageup":
				// same index in previous group
				_updatePage.call(this, false, this._oItemNavigation.getFocusedIndex(), true);
				break;

			default:
				break;
			}
		}

	}

	function _selectYear(iIndex){

		var aDomRefs = this._oItemNavigation.getItemDomRefs();
		var $DomRef = jQuery(aDomRefs[iIndex]);

		if ($DomRef.hasClass("sapUiCalItemDsbl")) {
			return false; // don't select disabled items
		}

		var sYyyymmdd = $DomRef.attr("data-sap-year-start");
		var oDate =  this._newUniversalDate(this._oFormatYyyymmdd.parse(sYyyymmdd, true));
		var sId = this.getId() + "-y" + sYyyymmdd;
		for ( var i = 0; i < aDomRefs.length; i++) {
			$DomRef = jQuery(aDomRefs[i]);
			if ($DomRef.attr("id") == sId) {
				$DomRef.addClass("sapUiCalItemSel");
				$DomRef.attr("aria-selected", "true");
			}else {
				$DomRef.removeClass("sapUiCalItemSel");
				$DomRef.attr("aria-selected", "false");
			}
		}

		var oLocalDate = CalendarUtils._createLocalDate(oDate);
		this.setProperty("date", oLocalDate, true);
		this.setProperty("year", oDate.getUTCFullYear(), true);

		return true;

	}

	function _updatePage(bForward, iSelectedIndex, bFireEvent){

		var aDomRefs = this._oItemNavigation.getItemDomRefs();
		var oFirstDate =  this._newUniversalDate(this._oFormatYyyymmdd.parse(jQuery(aDomRefs[0]).attr("data-sap-year-start"), true));
		var iYears = this.getYears();

		if (bForward) {
			var oMaxDate = this._newUniversalDate(this._oMaxDate);
			oMaxDate.setUTCFullYear(oMaxDate.getUTCFullYear() - iYears + 1);
			if (oFirstDate.getTime() < oMaxDate.getTime()){
				oFirstDate.setUTCFullYear(oFirstDate.getUTCFullYear() + iYears);
				if (oFirstDate.getTime() > oMaxDate.getTime()){
					iSelectedIndex = iSelectedIndex + (oFirstDate.getUTCFullYear() - oMaxDate.getUTCFullYear());
					if (iSelectedIndex > iYears - 1) {
						iSelectedIndex = iYears - 1;
					}
					oFirstDate = this._oMaxDate;
					oFirstDate.setUTCMonth(0, 1);
				}
			} else {
				return;
			}
		} else {
			if (oFirstDate.getTime() > this._oMinDate.getTime()) {
				oFirstDate.setUTCFullYear(oFirstDate.getUTCFullYear() - iYears);
				if (oFirstDate.getTime() < this._oMinDate.getTime()) {
					iSelectedIndex = iSelectedIndex - (this._oMinDate.getUTCFullYear() - oFirstDate.getUTCFullYear());
					if (iSelectedIndex < 0) {
						iSelectedIndex = 0;
					}
					oFirstDate = this._newUniversalDate(this._oMinDate);
				}
			} else {
				return;
			}
		}

		_updateYears.call(this, oFirstDate, iSelectedIndex);

		if (bFireEvent) {
			this.firePageChange();
		}

	}

	function _updateYears(oFirstDate, iSelectedIndex){

		var sCurrentYyyymmdd = this._oFormatYyyymmdd.format(this._getDate().getJSDate(), true);
		var bEnabledCheck = false; // check for disabled years only needed if borders touched
		var oFirstDate2 = this._checkFirstDate(oFirstDate);
		var oSelectedDate;
		if (oFirstDate2.getTime() != oFirstDate.getTime()) {
			oSelectedDate = this._newUniversalDate(oFirstDate);
			oSelectedDate.setUTCFullYear(oSelectedDate.getUTCFullYear() + iSelectedIndex);
			oFirstDate = oFirstDate2;
			bEnabledCheck = true;
		}

		var aDomRefs = this._oItemNavigation.getItemDomRefs();
		var oDate = this._newUniversalDate(oFirstDate);
		for ( var i = 0; i < aDomRefs.length; i++) {
			var sYyyymmdd = this._oFormatYyyymmdd.format(oDate.getJSDate(), true);
			var $DomRef = jQuery(aDomRefs[i]);
			$DomRef.attr("id", this.getId() + "-y" + sYyyymmdd);
			$DomRef.text(this._oYearFormat.format(oDate, true)); // to render era in Japanese
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
				if (oDate.getTime() == oSelectedDate.getTime()) {
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

			oDate.setUTCFullYear(oDate.getUTCFullYear() + 1);
		}

		this._oItemNavigation.focusItem(iSelectedIndex);

	}

	return YearPicker;

}, /* bExport= */ true);
