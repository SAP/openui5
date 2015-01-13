/*!
 * ${copyright}
 */

// Provides control sap.ui.unified.Calendar.
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Control', 'sap/ui/core/LocaleData', 'sap/ui/core/delegate/ItemNavigation', 'sap/ui/model/type/Date', 'sap/ui/unified/calendar/CalendarUtils', 'sap/ui/unified/library'],
	function(jQuery, Control, LocaleData, ItemNavigation, Date1, CalendarUtils, library) {
	"use strict";

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
			date : {type : "object", group : "Misc"},

			/**
			 * If set, interval selection is allowed
			 */
			intervalSelection : {type : "boolean", group : "Misc", defaultValue : false},

			/**
			 * If set, only a single date or interval, if intervalSelection is enabled, can be selected
			 */
			singleSelection : {type : "boolean", group : "Misc", defaultValue : true}
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
			specialDates : {type : "sap.ui.unified.DateTypeRange", multiple : true, singularName : "specialDate"}
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
					otherMonth : {type : "boolean"}
				}
			}
		}
	}});

	(function() {

		Month.prototype.init = function(){

			this._oFormatYyyymmdd = sap.ui.core.format.DateFormat.getInstance({pattern: "yyyyMMdd"});

			this._mouseMoveProxy = jQuery.proxy(this._handleMouseMove, this);

		};

		Month.prototype.exit = function(){

			if (this._oItemNavigation) {
				this.removeDelegate(this._oItemNavigation);
				this._oItemNavigation.destroy();
				delete this._oItemNavigation;
			}

			if (this._sRenderMonth) {
				jQuery.sap.clearDelayedCall(this._sRenderMonth);
			}

		};

		Month.prototype.onAfterRendering = function(){

			var that = this;

			_initItemNavigation(that);

			// check if day names are too big -> use smaller ones
			_checkNamesLength(that);

		};

		// overwrite invalidate to recognize changes on selectedDates
		Month.prototype.invalidate = function(oOrigin) {

			if (!oOrigin || !(oOrigin instanceof sap.ui.unified.DateRange)) {
				Control.prototype.invalidate.apply(this, arguments);
			} else if (this.getDomRef() && !this._sRenderMonth) {
				// DateRange changed -> only rerender days
				// do this only once if more DateRanges / Special days are changed
				var that = this;
				this._sRenderMonth = jQuery.sap.delayedCall(0, this, _renderMonth, [that]);
			}

		};

		Month.prototype.setDate = function(oDate){

			var that = this;
			_changeDate(that, oDate, false);

			return this;

		};

		Month.prototype._setDate = function(oDate){

			var oLocaleDate = CalendarUtils._createLocalDate(oDate);
			this.setProperty("date", oLocaleDate, true);
			this._oUTCDate = oDate;

		};

		Month.prototype._getDate = function(){

			if (!this._oUTCDate) {
				this._oUTCDate = CalendarUtils._createUTCDate(new Date());
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

			var that = this;
			_changeDate(that, oDate, true);

			return this;

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
		 * Checks if a date is selected and what kind of selected
		 * @return {int} iSelected 0: not selected; 1: single day selected, 2: interval start, 3: interval end, 4: interval between
		 * @private
		 */
		Month.prototype._checkDateSelected = function(oDate){

			if (!(oDate instanceof Date)) {
				throw new Error("Date must be a JavaScript date object " + this);
			}

			var iSelected = 0;
			var aSelectedDates = this.getSelectedDates();
			var oTimeStamp = oDate.getTime();

			for ( var i = 0; i < aSelectedDates.length; i++) {
				// initalize the time part of the start and end time
				var oRange = aSelectedDates[i];
				var oTmpDate = CalendarUtils._createUTCDate(oRange.getStartDate());
				var oStartDate;
				var oStartTimeStamp = 0;
				if (oTmpDate) {
					oStartDate = oTmpDate;
					oStartTimeStamp = oStartDate.getTime();
				}
				var oEndDate;
				var oEndTimeStamp = 0;
				if (this.getIntervalSelection()) {
					oTmpDate = CalendarUtils._createUTCDate(oRange.getEndDate());
					if (oTmpDate) {
						oEndDate = oTmpDate;
						oEndTimeStamp = oEndDate.getTime();
					}
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

			if (!(oDate instanceof Date)) {
				throw new Error("Date must be a JavaScript date object " + this);
			}

			var oType;
			var aSpecialDates = this.getSpecialDates();
			var oTimeStamp = oDate.getTime();

			for ( var i = 0; i < aSpecialDates.length; i++) {
				// initialize the time part of the start and end time
				var oRange = aSpecialDates[i];
				var oTmpDate = CalendarUtils._createUTCDate(oRange.getStartDate());
				var oStartDate;
				var oStartTimeStamp = 0;
				if (oTmpDate) {
					oStartDate = oTmpDate;
					oStartTimeStamp = oStartDate.getTime();
				}
				var oEndDate;
				var oEndTimeStamp = 0;
				oTmpDate = CalendarUtils._createUTCDate(oRange.getEndDate());
				if (oTmpDate) {
					oEndDate = oTmpDate;
					oEndTimeStamp = oEndDate.getTime();
				}

				if ((oTimeStamp == oStartTimeStamp && !oEndDate) || (oTimeStamp >= oStartTimeStamp && oTimeStamp <= oEndTimeStamp)) {
					oType = {type: oRange.getType(), tooltip: oRange.getTooltip_AsString()};
					break;
				}
			}

			return oType;

		};

		Month.prototype._handleMouseMove = function(oEvent){

			if (!this.$().is(":visible")) {
				// calendar was closed -> remove mousemove handler
				jQuery(window.document).unbind('mousemove', this._mouseMoveProxy);
				this._bMouseMove = undefined;
			}

			var $Target = jQuery(oEvent.target);

			if ($Target.hasClass("sapUiCalDayNum")) {
				$Target = $Target.parent();
			}

			if ($Target.hasClass("sapUiCalDay")) {
				var oOldFocusedDate = this._getDate();
				var oFocusedDate = this._oFormatYyyymmdd.parse($Target.attr("data-sap-day"), true);

				if (oFocusedDate.getTime() != oOldFocusedDate.getTime()) {
					var that = this;
					if ($Target.hasClass("sapUiCalDayOtherMonth")) {
						// in other month -> change month
						this.fireFocus({date: oFocusedDate, otherMonth: true});
					} else {
						this._setDate(oFocusedDate);
						_selectDay(that, oFocusedDate, false, true);
						this._bMoveChange = true;
					}

				}
			}

		};

		Month.prototype.onmouseup = function(oEvent){

			if (this._bMouseMove) {
				jQuery(window.document).unbind('mousemove', this._mouseMoveProxy);
				this._bMouseMove = undefined;

				// focus now selected day
				var oFocusedDate = this._getDate();
				var aDomRefs = this._oItemNavigation.getItemDomRefs();

				for ( var i = 0; i < aDomRefs.length; i++) {
					var $DomRef = jQuery(aDomRefs[i]);
					if (!$DomRef.hasClass("sapUiCalDayOtherMonth")) {
						if ($DomRef.attr("data-sap-day") == this._oFormatYyyymmdd.format(oFocusedDate, true)) {
							$DomRef.focus();
							break;
						}
					}
				}

				if (this._bMoveChange) {
					// selection was changed -> make it final
					var $Target = jQuery(oEvent.target);

					if ($Target.hasClass("sapUiCalDayNum")) {
						$Target = $Target.parent();
					}

					if ($Target.hasClass("sapUiCalDay")) {
						oFocusedDate = this._oFormatYyyymmdd.parse($Target.attr("data-sap-day"), true);
					}

					var that = this;
					_selectDay(that, oFocusedDate);
					this._bMoveChange = false;
					_fireSelect(that);
				}
			}

		};

		Month.prototype.onsapselect = function(oEvent){

			// focused item must be selected
			var that = this;

			_selectDay(that, that._getDate());
			_fireSelect(that);

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
			var oFocusedDate = new Date(this._getDate().getTime());
			var iYear = oFocusedDate.getUTCFullYear();

			if (oEvent.metaKey || oEvent.ctrlKey) {
				oFocusedDate.setUTCFullYear(iYear - 10);
			} else {
				oFocusedDate.setUTCFullYear(iYear - 1);
			}

			this.fireFocus({date: oFocusedDate, otherMonth: true});

			// cancel the event otherwise the browser select some text
			oEvent.preventDefault();

		};

		Month.prototype.onsappagedownmodifiers = function(oEvent){

			// not handled by ItemNavigation
			// go one or 10 years forward
			var oFocusedDate = new Date(this._getDate().getTime());
			var iYear = oFocusedDate.getUTCFullYear();

			if (oEvent.metaKey || oEvent.ctrlKey) {
				oFocusedDate.setUTCFullYear(iYear + 10);
			} else {
				oFocusedDate.setUTCFullYear(iYear + 1);
			}

			this.fireFocus({date: oFocusedDate, otherMonth: true});

			// cancel the event otherwise the browser select some text
			oEvent.preventDefault();

		};

		function _initItemNavigation(oThis){

			var oDate = oThis._getDate();
			var sYyyymmdd = oThis._oFormatYyyymmdd.format(oDate, true);
			var iIndex = 0;

			var oRootDomRef = oThis.$("days").get(0);
			var aDomRefs = oThis.$("days").children(".sapUiCalDay");

			for ( var i = 0; i < aDomRefs.length; i++) {
				var $DomRef = jQuery(aDomRefs[i]);
				if ($DomRef.attr("data-sap-day") === sYyyymmdd) {
					iIndex = i;
					break;
				}
			}

			if (!oThis._oItemNavigation) {
				oThis._oItemNavigation = new ItemNavigation();
				oThis._oItemNavigation.attachEvent(ItemNavigation.Events.AfterFocus, _handleAfterFocus, oThis);
				oThis._oItemNavigation.attachEvent(ItemNavigation.Events.FocusAgain, _handleFocusAgain, oThis);
				oThis._oItemNavigation.attachEvent(ItemNavigation.Events.BorderReached, _handleBorderReached, oThis);
				oThis.addDelegate(oThis._oItemNavigation);
				oThis._oItemNavigation.setHomeEndColumnMode(true, true);
				oThis._oItemNavigation.setDisabledModifiers({
					sapnext : ["alt"],
					sapprevious : ["alt"],
					saphome : ["alt"],
					sapend : ["alt"]
				});
			}
			oThis._oItemNavigation.setRootDomRef(oRootDomRef);
			oThis._oItemNavigation.setItemDomRefs(aDomRefs);
			oThis._oItemNavigation.setCycling(false);
			oThis._oItemNavigation.setColumns(7, true);
			oThis._oItemNavigation.setFocusedIndex(iIndex);
			oThis._oItemNavigation.setPageSize(aDomRefs.length); // to make sure that pageup/down goes out of month

		}

		function _handleAfterFocus(oControlEvent){

			var iIndex = oControlEvent.getParameter("index");
			var oEvent = oControlEvent.getParameter("event");

			if (!oEvent) {
				return; // happens if focus is set via ItemNavigation.focusItem directly
			}

			var that = this;
			var oOldDate = this._getDate();
			var oFocusedDate = new Date(oOldDate.getTime());
			var bOtherMonth = false;

			var aDomRefs = this._oItemNavigation.getItemDomRefs();
			var i = 0;

			// find out what day was focused
			var $DomRef = jQuery(aDomRefs[iIndex]);
			var $DomRefDay;
			if ($DomRef.hasClass("sapUiCalDayOtherMonth")) {
				if (oEvent.type == "saphomemodifiers" && (oEvent.metaKey || oEvent.ctrlKey)) {
					// on ctrl+home key focus first day of month
					oFocusedDate.setUTCDate(1);
					_focusDate(that, oFocusedDate);
				} else if (oEvent.type == "sapendmodifiers" && (oEvent.metaKey || oEvent.ctrlKey)) {
					// on ctrl+end key focus last day of month
					for ( i = aDomRefs.length - 1; i > 0 ; i--) {
						$DomRefDay = jQuery(aDomRefs[i]);
						if (!$DomRefDay.hasClass("sapUiCalDayOtherMonth")) {
							oFocusedDate = this._oFormatYyyymmdd.parse($DomRefDay.attr("data-sap-day"), true);
							break;
						}
					}
					_focusDate(that, oFocusedDate);
				} else {
					// focus old date again, but tell parent about the new date
					bOtherMonth = true;
					oFocusedDate = this._oFormatYyyymmdd.parse($DomRef.attr("data-sap-day"), true);
					if (!oFocusedDate) {
						oFocusedDate = new Date(oOldDate.getTime()); // e.g. year > 9999
					}
					_focusDate(that, oOldDate);

				}
			} else {
				// day in current month focused
				if (jQuery(oEvent.target).hasClass("sapUiCalWeekNum")) {
					// click on week number - focus old date
					_focusDate(that, oFocusedDate);
				}else {
					// not if clicked on week number
					oFocusedDate = this._oFormatYyyymmdd.parse($DomRef.attr("data-sap-day"), true);
					this._setDate(oFocusedDate);
				}
			}

			this.fireFocus({date: oFocusedDate, otherMonth: bOtherMonth});

			if (oEvent.type == "mousedown") {
				// as no click event is fired in some cases, e.g. if month is changed (because of changing DOM) select the day on mousedown
				_handleMousedown(that, oEvent, oFocusedDate, iIndex);
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
				var that = this;
				var oFocusedDate = this._getDate();
				_handleMousedown(that, oEvent, oFocusedDate, iIndex);
			}

		}

		function _handleBorderReached(oControlEvent){

			var oEvent = oControlEvent.getParameter("event");
			var iMonth = 0;
			var oOldDate = this._getDate();
			var oFocusedDate = new Date(oOldDate.getTime());

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

				this.fireFocus({date: oFocusedDate, otherMonth: true});

			}

		}

		function _handleMousedown(oThis, oEvent, oFocusedDate, iIndex){

			_selectDay(oThis, oFocusedDate, oEvent.shiftKey);
			_fireSelect(oThis);
			if (oThis.getIntervalSelection() && oThis.$().is(":visible")) {
				// if calendar was closed in select event, do not add mousemove handler
				jQuery(window.document).bind('mousemove', oThis._mouseMoveProxy);
				oThis._bMouseMove = true;
			}

			oEvent.preventDefault(); // to prevent focus set outside of DatePicker
			oEvent.setMark("cancelAutoClose");

		}

		function _changeDate (oThis, oDate, bNoFocus){

			if (!(oDate instanceof Date)) {
				throw new Error("Date must be a JavaScript date object; " + oThis);
			}

			var iYear = oDate.getFullYear();
			if (iYear < 1 || iYear > 9999) {
				throw new Error("Date must not be in valid range (between 0001-01-01 and 9999-12-31); " + oThis);
			}

			var oOldDate = oThis._getDate();
			oThis.setProperty("date", oDate, true);
			oThis._oUTCDate = CalendarUtils._createUTCDate(oDate);

			if (oThis.getDomRef()) {
				oDate = CalendarUtils._createUTCDate(oDate);
				if (oThis._oUTCDate.getUTCFullYear() == oOldDate.getUTCFullYear() && oThis._oUTCDate.getUTCMonth() == oOldDate.getUTCMonth()) {
					if (!bNoFocus) {
					_focusDate(oThis, oThis._oUTCDate, true);
					}
				} else {
					_renderMonth(oThis, bNoFocus);
				}
			}

		}

		function _focusDate (oThis, oDate, bNoSetDate){

			if (!bNoSetDate) {
				oThis.setDate(oDate);
			}

			var sYyyymmdd = oThis._oFormatYyyymmdd.format(oDate, true);
			var aDomRefs = oThis._oItemNavigation.getItemDomRefs();
			var $DomRefDay;
			for ( var i = 0; i < aDomRefs.length; i++) {
				$DomRefDay = jQuery(aDomRefs[i]);
				if ($DomRefDay.attr("data-sap-day") == sYyyymmdd) {
					oThis._oItemNavigation.focusItem(i);
					break;
				}
			}

		}

		function _renderMonth(oThis, bNoFocus){

			oThis._sRenderMonth = undefined; // initialize delayed call

			var oDate = oThis._getDate();
			var $Container = oThis.$("days");

			if ($Container.length > 0) {
				var oRm = sap.ui.getCore().createRenderManager();
				oThis.getRenderer().renderDays(oRm, oThis, oDate);
				oRm.flush($Container[0]);
				oRm.destroy();
			}

			// fire internal event for DatePicker for with number of rendered days. If Calendar becomes larger maybe popup must change position
			oThis.fireEvent("_renderMonth", {days: $Container.children(".sapUiCalDay").length});

			_initItemNavigation(oThis);
			if (!bNoFocus) {
				oThis._oItemNavigation.focusItem(oThis._oItemNavigation.getFocusedIndex());
			}

		}

		function _selectDay(oThis, oDate, bIntervalEnd, bMove){

			var aSelectedDates = oThis.getSelectedDates();
			var oDateRange;
			var aDomRefs = oThis._oItemNavigation.getItemDomRefs();
			var $DomRef;
			var sYyyymmdd;
			var i = 0;
			var oParent = oThis.getParent();
			var oAggOwner = oThis;

			if (oParent && oParent.getSelectedDates) {
				// if used in Calendar use the aggregation of this one
				oAggOwner = oParent;
			}

			if (oThis.getSingleSelection()) {
				var oStartDate;

				if (aSelectedDates.length > 0) {
					oDateRange = aSelectedDates[0];
					oStartDate = CalendarUtils._createUTCDate(oDateRange.getStartDate());
				} else {
					oDateRange = new sap.ui.unified.DateRange();
					oAggOwner.addAggregation("selectedDates", oDateRange, true); // no re-rendering
				}

				if (oThis.getIntervalSelection()/* && bIntervalEnd*/ && (!oDateRange.getEndDate() || bMove) && oStartDate) {
					// single interval selection
					var oEndDate;
					if (oDate.getTime() < oStartDate.getTime()) {
						oEndDate = oStartDate;
						oStartDate = oDate;
						if (!bMove) {
							// in move mode do not set date. this bring broblems if on backward move the start date would be cahnged
							oDateRange.setProperty("startDate", CalendarUtils._createLocalDate(oStartDate), true); // no-rerendering
							oDateRange.setProperty("endDate", CalendarUtils._createLocalDate(oEndDate), true); // no-rerendering
						}
					} else if (oDate.getTime() >= oStartDate.getTime()) {
						// single day ranges are allowed
						oEndDate = oDate;
						if (!bMove) {
							oDateRange.setProperty("endDate", CalendarUtils._createLocalDate(oEndDate), true); // no-rerendering
						}
					}

					var oDay;
					for ( i = 0; i < aDomRefs.length; i++) {
						$DomRef = jQuery(aDomRefs[i]);
						oDay = oThis._oFormatYyyymmdd.parse($DomRef.attr("data-sap-day"), true);

						if (oDay.getTime() == oStartDate.getTime()) {
							$DomRef.addClass("sapUiCalDaySelStart");
							$DomRef.addClass("sapUiCalDaySel");
							if (oEndDate && oDay.getTime() == oEndDate.getTime()) {
								// start day and end day are the same
								$DomRef.addClass("sapUiCalDaySelEnd");
							}
						} else if (oEndDate && oDay.getTime() > oStartDate.getTime() && oDay.getTime() < oEndDate.getTime()) {
							$DomRef.addClass("sapUiCalDaySel");
							$DomRef.addClass("sapUiCalDaySelBetween");
						} else if (oEndDate && oDay.getTime() == oEndDate.getTime()) {
							$DomRef.addClass("sapUiCalDaySelEnd");
							$DomRef.addClass("sapUiCalDaySel");
							$DomRef.removeClass("sapUiCalDaySelBetween");
						} else {
							if ($DomRef.hasClass("sapUiCalDaySel")) {
								$DomRef.removeClass("sapUiCalDaySel");
							}
							if ($DomRef.hasClass("sapUiCalDaySelStart")) {
								$DomRef.removeClass("sapUiCalDaySelStart");
							} else if ($DomRef.hasClass("sapUiCalDaySelBetween")) {
								$DomRef.removeClass("sapUiCalDaySelBetween");
							} else if ($DomRef.hasClass("sapUiCalDaySelEnd")) {
								$DomRef.removeClass("sapUiCalDaySelEnd");
							}
						}
					}
				} else {
					// single day selection or start a new interval
					sYyyymmdd = oThis._oFormatYyyymmdd.format(oDate, true);
					for ( i = 0; i < aDomRefs.length; i++) {
						$DomRef = jQuery(aDomRefs[i]);
						if (!$DomRef.hasClass("sapUiCalDayOtherMonth") && $DomRef.attr("data-sap-day") == sYyyymmdd) {
							$DomRef.addClass("sapUiCalDaySel");
						} else if ($DomRef.hasClass("sapUiCalDaySel")/*oOldDate && parseInt($DomRef.attr("data-sap-day")) == oOldDate.getUTCDate()*/) {
							$DomRef.removeClass("sapUiCalDaySel");
						}
						if ($DomRef.hasClass("sapUiCalDaySelStart")) {
							$DomRef.removeClass("sapUiCalDaySelStart");
						} else if ($DomRef.hasClass("sapUiCalDaySelBetween")) {
							$DomRef.removeClass("sapUiCalDaySelBetween");
						} else if ($DomRef.hasClass("sapUiCalDaySelEnd")) {
							$DomRef.removeClass("sapUiCalDaySelEnd");
						}
					}
					oDateRange.setProperty("startDate", CalendarUtils._createLocalDate(oDate), true); // no-rerendering
					oDateRange.setProperty("endDate", undefined, true); // no-rerendering
				}
			} else {
				// multiple selection
				if (oThis.getIntervalSelection()) {
					throw new Error("Calender don't support multiple interval selection");

				} else {
					var iSelected = oThis._checkDateSelected(oDate);
					if (iSelected > 0) {
						// already selected - deselect
						for ( i = 0; i < aSelectedDates.length; i++) {
							if (aSelectedDates[i].getStartDate() && oDate.getTime() == CalendarUtils._createUTCDate(aSelectedDates[i].getStartDate()).getTime()) {
								oAggOwner.removeAggregation("selectedDates", i, true); // no re-rendering
								break;
							}
						}
					} else {
						// not selected -> select
						oDateRange = new sap.ui.unified.DateRange({startDate: CalendarUtils._createLocalDate(oDate)});
						oAggOwner.addAggregation("selectedDates", oDateRange, true); // no re-rendering
					}
					sYyyymmdd = oThis._oFormatYyyymmdd.format(oDate, true);
					for ( i = 0; i < aDomRefs.length; i++) {
						$DomRef = jQuery(aDomRefs[i]);
						if (!$DomRef.hasClass("sapUiCalDayOtherMonth") && $DomRef.attr("data-sap-day") == sYyyymmdd) {
							if (iSelected > 0) {
								$DomRef.removeClass("sapUiCalDaySel");
							} else {
								$DomRef.addClass("sapUiCalDaySel");
							}
						}
					}
				}
			}

		}

		function _fireSelect(oThis){

			if (oThis._bMouseMove) {
				// detach mouse move handler because calendar might be losed in select event handler
				jQuery(window.document).unbind('mousemove', oThis._mouseMoveProxy);
				oThis._bMouseMove = undefined;
			}

			oThis.fireSelect();

		}

		function _checkNamesLength(oThis){

			if (!oThis._bNamesLengthChecked) {
				// only once - cannot change by rerendering - only by theme change
				var oWeekDay;

				// check day names
				var aWeekHeaders = oThis.$().children(".sapUiCalWH");
				var bTooLong = false;
				var i = 0;

				for (i = 0; i < aWeekHeaders.length; i++) {
					oWeekDay = aWeekHeaders[i];
					if (oWeekDay.clientWidth < oWeekDay.scrollWidth) {
						bTooLong = true;
						break;
					}
				}

				if (bTooLong) {
					oThis._bLongWeekDays = false;
					var oLocaleData = oThis._getLocaleData();
					var iFirstDayOfWeek = oLocaleData.getFirstDayOfWeek();
					var aDayNames = oLocaleData.getDaysStandAlone("narrow");
					for ( i = 0; i < aDayNames.length; i++) {
						oWeekDay = aWeekHeaders[i];
						jQuery(oWeekDay).text(aDayNames[(i + iFirstDayOfWeek) % 7]);
					}
				} else {
					oThis._bLongWeekDays = true;
				}

				oThis._bNamesLengthChecked = true;
			}

		}

	}());

	return Month;

}, /* bExport= */ true);
