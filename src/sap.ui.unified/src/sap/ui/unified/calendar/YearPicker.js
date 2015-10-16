/*!
 * ${copyright}
 */

// Provides control sap.ui.unified.Calendar.
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
			year : {type : "int", group : "Misc", defaultValue : 2000},

			/**
			 * number of displayed years
			 * @since 1.30.0
			 */
			years : {type : "int", group : "Misc", defaultValue : 20},

			/**
			 * number of years in each row
			 * 0 means just to have all years in one row, independent of the number
			 * @since 1.30.0
			 */
			columns : {type : "int", group : "Misc", defaultValue : 4},

			/**
			 * Date as JavaScript Date object. For this date a <code>YearPicker</code> is rendered. If a Year is selected the
			 * date is updated with the start date of the selected year (depending on the calendar type).
			 * @since 1.34.0
			 */
			date : {type : "object", group : "Misc"}

		},
		events : {

			/**
			 * Month selection changed
			 */
			select : {}

		}
	}});

	(function() {

		YearPicker.prototype.init = function(){

			// to format year with era in Japanese
			this._oYearFormat = sap.ui.core.format.DateFormat.getDateInstance({format: "y"});
			this._oFormatYyyymmdd = sap.ui.core.format.DateFormat.getInstance({pattern: "yyyyMMdd", calendarType: sap.ui.core.CalendarType.Gregorian});

			this._oMinDate = new UniversalDate(new Date(Date.UTC(1, 0, 1)));
			this._oMinDate.getJSDate().setUTCFullYear(1); // otherwise year 1 will be converted to year 1901
			this._oMaxDate = new UniversalDate(new Date(Date.UTC(9999, 11, 31)));

		};

		YearPicker.prototype.onAfterRendering = function(){

			_initItemNavigation.call(this);

		};

		YearPicker.prototype.setYear = function(iYear){

			// no rerendering needed, just select new year or update years
			this.setProperty("year", iYear, true);
			iYear = this.getProperty("year"); // to have type conversion, validation....

			var oDate = new UniversalDate(iYear, 0, 1);
			if (iYear < 100) {
				oDate.setFullYear(iYear);
			}

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

			var oUTCDate = CalendarUtils._createUniversalUTCDate(oDate);
			oUTCDate.setUTCMonth(0, 1); // start of year
			// no rerendering needed, just select new year or update years
			this.setProperty("date", oDate, true);
			this.setProperty("year", oUTCDate.getUTCFullYear(), true);
			this._oUTCDate = oUTCDate;

			if (this.getDomRef()) {
				var iYears = this.getYears();
				var oFirstDate = new UniversalDate(this._oUTCDate);
				oFirstDate.setUTCFullYear(oFirstDate.getUTCFullYear() - Math.floor(iYears / 2));
				_updateYears.call(this, oFirstDate, Math.floor(iYears / 2));
			}

			return this;

		};

		YearPicker.prototype._getDate = function(){

			if (!this._oUTCDate) {
				var iYear = this.getYear();
				this._oUTCDate = new UniversalDate(UniversalDate.UTC(iYear, 0, 1));
				if (iYear < 100) {
					this._oUTCDate.setUTCFullYear(iYear);
				}
			}

			return this._oUTCDate;

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

			_selectYear.call(this, iIndex);
			this.fireSelect();

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

			_selectYear.call(this, iIndex);
			this.fireSelect();

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
						_updatePage.call(this, true, this._oItemNavigation.getFocusedIndex() - iYears + iColumns);
					} else {
						// first year in next group
						_updatePage.call(this, true, 0);
					}
					break;

				case "sapprevious":
				case "sappreviousmodifiers":
					if (oEvent.keyCode == jQuery.sap.KeyCodes.ARROW_UP && iColumns < iYears) {
						//same column in last row of previous group (only if more than one row)
						_updatePage.call(this, false, iYears - iColumns + this._oItemNavigation.getFocusedIndex());
					} else {
						// last year in previous group
						_updatePage.call(this, false, iYears - 1);
					}
					break;

				case "sappagedown":
					// same index in next group
					_updatePage.call(this, true, this._oItemNavigation.getFocusedIndex());
					break;

				case "sappageup":
					// same index in previous group
					_updatePage.call(this, false, this._oItemNavigation.getFocusedIndex());
					break;

				default:
					break;
				}
			}

		}

		function _selectYear(iIndex){

			var aDomRefs = this._oItemNavigation.getItemDomRefs();
			var sYyyymmdd = jQuery(aDomRefs[iIndex]).attr("data-sap-year-start");
			var oDate =  new UniversalDate(this._oFormatYyyymmdd.parse(sYyyymmdd, true));
			var $DomRef;
			var sId = this.getId() + "-y" + sYyyymmdd;
			for ( var i = 0; i < aDomRefs.length; i++) {
				$DomRef = jQuery(aDomRefs[i]);
				if ($DomRef.attr("id") == sId) {
					$DomRef.addClass("sapUiCalItemSel");
				}else {
					$DomRef.removeClass("sapUiCalItemSel");
				}
			}

			var oLocalDate = CalendarUtils._createLocalDate(oDate);
			this.setProperty("date", oLocalDate, true);
			this.setProperty("year", oDate.getUTCFullYear(), true);

		}

		function _updatePage(bForward, iSelectedIndex){

			var aDomRefs = this._oItemNavigation.getItemDomRefs();
			var oFirstDate =  new UniversalDate(this._oFormatYyyymmdd.parse(jQuery(aDomRefs[0]).attr("data-sap-year-start"), true));

			if (bForward) {
				oFirstDate.setUTCFullYear(oFirstDate.getUTCFullYear() + this.getYears());
			} else {
				oFirstDate.setUTCFullYear(oFirstDate.getUTCFullYear() - this.getYears());
			}

			_updateYears.call(this, oFirstDate, iSelectedIndex);

		}

		function _updateYears(oFirstDate, iSelectedIndex){

			var sCurrentYyyymmdd = this._oFormatYyyymmdd.format(this._getDate().getJSDate(), true);
			var iYears = this.getYears();
			var iFirstYear = oFirstDate.getUTCFullYear();
			var iMinYear = this._oMinDate.getUTCFullYear();
			var iMaxYear = this._oMaxDate.getUTCFullYear();

			if (iFirstYear >= iMaxYear - iYears) {
				iSelectedIndex = iSelectedIndex + iFirstYear - iMaxYear + iYears;
				iFirstYear = iMaxYear - iYears + 1;
				oFirstDate.setUTCFullYear(iFirstYear);
			}else if (iFirstYear < iMinYear) {
				iSelectedIndex = iSelectedIndex + iFirstYear - iMinYear;
				iFirstYear = iMinYear;
				oFirstDate.setUTCFullYear(iFirstYear);
			}

			var aDomRefs = this._oItemNavigation.getItemDomRefs();
			var oDate = new UniversalDate(oFirstDate);
			for ( var i = 0; i < aDomRefs.length; i++) {
				var sYyyymmdd = this._oFormatYyyymmdd.format(oDate.getJSDate(), true);
				var $DomRef = jQuery(aDomRefs[i]);
				$DomRef.attr("id", this.getId() + "-y" + sYyyymmdd);
				$DomRef.text(this._oYearFormat.format(oDate, true)); // to render era in Japanese
				$DomRef.attr("data-sap-year-start", sYyyymmdd);
				if ($DomRef.hasClass("sapUiCalItemSel") && sYyyymmdd != sCurrentYyyymmdd) {
					$DomRef.removeClass("sapUiCalItemSel");
				} else if (!$DomRef.hasClass("sapUiCalItemSel") && sYyyymmdd == sCurrentYyyymmdd) {
					$DomRef.addClass("sapUiCalItemSel");
				}
				oDate.setUTCFullYear(oDate.getUTCFullYear() + 1);
			}

			this._oItemNavigation.focusItem(iSelectedIndex);

		}


	}());

	return YearPicker;

}, /* bExport= */ true);
