/*!
 * ${copyright}
 */

// Provides control sap.ui.unified.Calendar.
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Control', 'sap/ui/core/LocaleData', 'sap/ui/core/delegate/ItemNavigation', 'sap/ui/model/type/Date', './library'],
	function(jQuery, Control, LocaleData, ItemNavigation, Date1, library) {
	"use strict";

	/**
	 * Constructor for a new Calendar.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Basic Calendar.
	 * This calendar ist used for DatePickers
	 * @extends sap.ui.core.Control
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.22.0
	 * @alias sap.ui.unified.Calendar
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Calendar = Control.extend("sap.ui.unified.Calendar", /** @lends sap.ui.unified.Calendar.prototype */ { metadata : {

		library : "sap.ui.unified",
		properties : {

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
			 * @since 1.24.0
			 */
			specialDates : {type : "sap.ui.unified.DateTypeRange", multiple : true, singularName : "specialDate"}
		},
		events : {

			/**
			 * Date selection changed
			 */
			select : {}, 

			/**
			 * Date selection was cancelled
			 */
			cancel : {}
		}
	}});

	/*
	 * There are different modes (stored in this._iMode)
	 * The standard is 0, that means a calendar showing a calendar with the days of one month.
	 * If 1 a month picker is shown.
	 * if 2 a year picker is shown.
	 */

	(function() {

		Calendar.prototype.init = function(){

			this._mouseMoveProxy = jQuery.proxy(this._handleMouseMove, this);

			this._iMode = 0; // days are shown

			this._oFormatYyyymmdd = sap.ui.core.format.DateFormat.getInstance({pattern: "yyyyMMdd"});

			this.data("sap-ui-fastnavgroup", "true", true); // Define group for F6 handling

			this._oMinDate = new Date(Date.UTC(1, 0, 1));
			this._oMinDate.setUTCFullYear(1); // otherwise year 1 will be converted to year 1901
			this._oMaxDate = new Date(Date.UTC(9999, 11, 31));

		};

		Calendar.prototype.exit = function(){

			if (this._sRenderMonth) {
				jQuery.sap.clearDelayedCall(this._sRenderMonth);
			}

		};

		//	sap.ui.unified.Calendar.prototype.onBeforeRendering = function(){
		//	};

		Calendar.prototype.onAfterRendering = function(){

			var that = this;

			_initItemNavigation(that);

			// check if day names and month names are too big -> use smaller ones
			_checkNamesLength(that);

			_togglePrevNext(that, this._getFocusedDate(), true);

		};

		// overwrite invalidate to recognize changes on selectedDates
		Calendar.prototype.invalidate = function(oOrigin) {

			if (!oOrigin || !(oOrigin instanceof sap.ui.unified.DateRange)) {
				Control.prototype.invalidate.apply(this, arguments);
			} else if (this.getDomRef() && this._iMode == 0 && !this._sRenderMonth) {
				// DateRange changed -> only rerender days
				// do this only once if more DateRanges / Special days are changed
				var that = this;
				this._sRenderMonth = jQuery.sap.delayedCall(0, this, _renderMonth, [that]);
			}

		};

		/**
		 * sets the locale for the DatePicker
		 * only for internal use
		 * @param {string} sLocale  new value for <code>locale</code>
		 * @returns {sap.ui.unified.Calendar} <code>this</code> to allow method chaining
		 * @private
		 */
		Calendar.prototype.setLocale = function(sLocale){

			if (this._sLocale != sLocale) {
				this._sLocale = sLocale;
				this._oLocaleData = undefined;
				this.invalidate();
			}

			return this;

		};

		/**
		 * gets the used locale for the DatePicker
		 * only for internal use
		 * @return {string} sLocale
		 * @private
		 */
		Calendar.prototype.getLocale = function(){

			if (!this._sLocale) {
				this._sLocale = sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale().toString();
			}

			return this._sLocale;

		};

		Calendar.prototype._getFocusedDate = function(){

			if (!this._oFocusedDate) {
				var that = this;
				_determineFocusedDate(that);
			}

			return this._oFocusedDate;

		};

		Calendar.prototype._setFocusedDate = function(oDate){

			this._oFocusedDate = new Date(oDate);

		};

		/**
		 * Sets the focused date of the calendar.
		 *
		 * @param {object} oDate
		 *         JavaScript date object for focused date.
		 * @returns {sap.ui.unified.Calendar} <code>this</code> to allow method chaining
		 * @public
		 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
		 */
		Calendar.prototype.focusDate = function(oDate){

			if (oDate && (!this._oFocusedDate || this._oFocusedDate.getTime() != oDate.getTime())) {
				if (!(oDate instanceof Date)) {
					throw new Error("Date must be a JavaScript date object; " + this);
				}

				var iYear = oDate.getFullYear();
				if (iYear < 1 || iYear > 9999) {
					throw new Error("Date must not be in valid range (between 0001-01-01 and 9999-12-31); " + this);
				}

				this._setFocusedDate(_createUTCDate(oDate));

				if (this.getDomRef() && this._iMode == 0) {
					var that = this;
					_renderMonth(that);
				}
			}

			return this;

		};

		/**
		 * sets the Popup mode
		 * e.G. Tab-chain should not leave calendar
		 * only for internal use
		 * @param {boolean} bPoupupMode <code>PopupMode</code>
		 * @private
		 */
		Calendar.prototype.setPopupMode = function(bPoupupMode){

			this._bPoupupMode = bPoupupMode;

		};

		/*
		 * gets localeData for used locale
		 * if no locale is given use rendered one
		 */
		Calendar.prototype._getLocaleData = function(){

			if (!this._oLocaleData) {
				var sLocale = this.getLocale();
				var oLocale = new sap.ui.core.Locale(sLocale);
				this._oLocaleData = LocaleData.getInstance(oLocale);
			}

			return this._oLocaleData;

		};

		Calendar.prototype.onclick = function(oEvent){

			if (oEvent.isMarked("delayedMouseEvent") ) {
				return;
			}

			var that = this;
			var oFocusedDate = this._getFocusedDate();

			if (jQuery.sap.containsOrEquals(this.getDomRef("next"), oEvent.target) && !this.$("next").attr("disabled")) {
					switch (this._iMode) {
					case 0: // day picker
						oFocusedDate.setUTCMonth(oFocusedDate.getUTCMonth() + 1, 1);
						_renderMonth(that);
						break;

					case 1: // month picker
						oFocusedDate.setUTCFullYear(oFocusedDate.getUTCFullYear() + 1);
						this.$("year").text(oFocusedDate.getUTCFullYear());
						_togglePrevNext(that, oFocusedDate);
						break;

					case 2: // year picker
						_updateYears(that, true, this._oItemNavigation.getFocusedIndex());
						break;
						// no default
					}
			} else if (jQuery.sap.containsOrEquals(this.getDomRef("prev"), oEvent.target) && !this.$("prev").attr("disabled")) {
				switch (this._iMode) {
				case 0: // day picker
					oFocusedDate.setUTCDate(1);
					oFocusedDate.setUTCDate(oFocusedDate.getUTCDate() - 1);
					_renderMonth(that);
					break;

				case 1: // month picker
					oFocusedDate.setUTCFullYear(oFocusedDate.getUTCFullYear() - 1);
					this.$("year").text(oFocusedDate.getUTCFullYear());
					_togglePrevNext(that, oFocusedDate);
					break;

				case 2: // year picker
					_updateYears(that, false, this._oItemNavigation.getFocusedIndex());
					break;
					// no default
				}
			} else if (oEvent.target.id == this.getId() + "-month") {
				if (this._iMode != 1) {
					_showMonthPicker(that);
				} else {
					_hideMonthPicker(that);
				}
				// add ItemNavigation again (might be removed by Tab)
				this.addDelegate(this._oItemNavigation);
			} else if (oEvent.target.id == this.getId() + "-year") {
				if (this._iMode != 2) {
					_showYearPicker(that);
				} else {
					_hideYearPicker(that);
				}
				// add ItemNavigation again (might be removed by Tab)
				this.addDelegate(this._oItemNavigation);
			} else if (oEvent.target.id == this.getId() + "-cancel") {
				this.onsapescape(oEvent);
			}

		};

		Calendar.prototype._handleMouseMove = function(oEvent){

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
				var oFocusedDate = this._getFocusedDate();
				var oOldFocusedDate = oFocusedDate;
				oFocusedDate = this._oFormatYyyymmdd.parse($Target.attr("data-sap-day"), true);
				this._setFocusedDate(oFocusedDate);

				if (oFocusedDate.getTime() != oOldFocusedDate.getTime()) {
					var that = this;
					if ($Target.hasClass("sapUiCalDayOtherMonth")) {
						// in other month -> change month
						_renderMonth(that);
					} else {
						_selectDay(that, oFocusedDate, false, true);
						this._bMoveChange = true;
					}

				}
			}

		};

		Calendar.prototype.onmouseup = function(oEvent){

			if (this._bMouseMove) {
				jQuery(window.document).unbind('mousemove', this._mouseMoveProxy);
				this._bMouseMove = undefined;

				// focus now selected day
				var oFocusedDate = this._getFocusedDate();
				var aDomRefs = this.$("days").children(".sapUiCalDay");

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
					var that = this;
					_selectDay(that, oFocusedDate);
					this._bMoveChange = false;
					_fireSelect(that);
				}
			}

		};
		/*
		sap.ui.unified.Calendar.prototype.onswipeleft = function(oEvent) {

			var that = this;
			var oFocusedDate = this._getFocusedDate();

			oFocusedDate.setUTCMonth(oFocusedDate.getUTCMonth()+1, 1);
			_renderMonth(that);

		};

		sap.ui.unified.Calendar.prototype.onswiperight = function(oEvent) {

			var that = this;
			var oFocusedDate = this._getFocusedDate();

			oFocusedDate.setUTCDate(1);
			oFocusedDate.setUTCDate(oFocusedDate.getUTCDate()-1);
			_renderMonth(that);

		};
		*/
		Calendar.prototype.onsapselect = function(oEvent){

			// focused item must be selected
			var that = this;
			var iIndex = 0;

			switch (this._iMode) {
			case 0: // day picker
				if (jQuery.sap.containsOrEquals(this.getDomRef("days"), oEvent.target)) {
					_selectDay(that, that._getFocusedDate());
					_fireSelect(that);

					//to prevent bubbling into input field if in DatePicker
					oEvent.stopPropagation();
					oEvent.preventDefault();
				}
				break;

			case 1: // month picker
				if (jQuery.sap.containsOrEquals(this.getDomRef("months"), oEvent.target)) {
					iIndex = this._oItemNavigation.getFocusedIndex();
					_selectMonth(that, iIndex);
				}
				break;

			case 2: // year picker
				if (jQuery.sap.containsOrEquals(this.getDomRef("years"), oEvent.target)) {
					iIndex = this._oItemNavigation.getFocusedIndex();
					_selectYear(that, iIndex);
				}
				break;
				// no default
			}

		};

		Calendar.prototype.onsapselectmodifiers = function(oEvent){

			this.onsapselect(oEvent);

		};

		Calendar.prototype.onsapescape = function(oEvent){

			var that = this;

			switch (this._iMode) {
			case 0: // day picker
				this.fireCancel();
				break;

			case 1: // month picker
				_hideMonthPicker(that);
				break;

			case 2: // year picker
				_hideYearPicker(that);
				break;
				// no default
			}

		};

		Calendar.prototype.onsapshow = function(oEvent){

			if (this._bPoupupMode) {
				var that = this;
				switch (this._iMode) {
				case 1: // month picker
					_hideMonthPicker(that);
					break;

				case 2: // year picker
					_hideYearPicker(that);
					break;
					// no default
				}
				this.fireCancel();

				oEvent.preventDefault(); // otherwise IE opens the address bar history

			}

		};

		Calendar.prototype.onsaphide = Calendar.prototype.onsapshow;

		Calendar.prototype.onsappageupmodifiers = function(oEvent){

			// not handled by ItemNavigation
			if (jQuery.sap.containsOrEquals(this.getDomRef("days"), oEvent.target)) {
				// go one year back
				var oFocusedDate = this._getFocusedDate();
				var that = this;
				var iYear = oFocusedDate.getUTCFullYear();

				if (oEvent.metaKey || oEvent.ctrlKey) {
					oFocusedDate.setUTCFullYear(iYear - 10);
				} else {
					oFocusedDate.setUTCFullYear(iYear - 1);
				}

				if (oFocusedDate.getTime() < this._oMinDate.getTime()){
					this._setFocusedDate(this._oMinDate);
				}
				_renderMonth(that);
			}

			// cancel the event otherwise the browser select some text
			oEvent.preventDefault();

		};

		Calendar.prototype.onsappagedownmodifiers = function(oEvent){

			// not handled by ItemNavigation
			if (jQuery.sap.containsOrEquals(this.getDomRef("days"), oEvent.target)) {
				// go one year forward
				var oFocusedDate = this._getFocusedDate();
				var that = this;
				var iYear = oFocusedDate.getUTCFullYear();

				if (oEvent.metaKey || oEvent.ctrlKey) {
					oFocusedDate.setUTCFullYear(iYear + 10);
				} else {
					oFocusedDate.setUTCFullYear(iYear + 1);
				}

				if (oFocusedDate.getTime() > this._oMaxDate.getTime()){
					this._setFocusedDate(this._oMaxDate);
				}
				_renderMonth(that);
			}

			// cancel the event otherwise the browser select some text
			oEvent.preventDefault();

		};

		Calendar.prototype.onsappageup = function(oEvent){

			if (oEvent.target.id == this.getId() + "-month" || oEvent.target.id == this.getId() + "-year") {
				//prevent browser scrolling
				oEvent.preventDefault();
			}

		};

		Calendar.prototype.onsappagedown = Calendar.prototype.onsappageup;

		Calendar.prototype.onsaptabnext = function(oEvent){

			// if tab was pressed on a day it should jump to the month and then to the year button

			if (jQuery.sap.containsOrEquals(this.getDomRef("days"), oEvent.target) ||
					jQuery.sap.containsOrEquals(this.getDomRef("months"), oEvent.target) ||
					jQuery.sap.containsOrEquals(this.getDomRef("years"), oEvent.target)) {
				// tab from a day
				jQuery.sap.focus(this.getDomRef("month"));

				if (!this._bPoupupMode) {
					// remove Tabindex from day - to break cycle
					jQuery(this._oItemNavigation.getItemDomRefs()[this._oItemNavigation.getFocusedIndex()]).attr("tabindex", "-1");
				}

				// remove ItemNavigation to prevent arrow navigation on buttons
				this.removeDelegate(this._oItemNavigation);

				oEvent.preventDefault();
			} else if (oEvent.target.id == this.getId() + "-month") {
				jQuery.sap.focus(this.getDomRef("year"));

				// remove ItemNavigation to prevent arrow navigation on buttons
				this.removeDelegate(this._oItemNavigation);

				oEvent.preventDefault();
			} else if (oEvent.target.id == this.getId() + "-year") {
				// add ItemNavigation again
				this.addDelegate(this._oItemNavigation);
			}

		};

		Calendar.prototype.onsaptabprevious = function(oEvent){

			if (jQuery.sap.containsOrEquals(this.getDomRef("days"), oEvent.target) ||
					jQuery.sap.containsOrEquals(this.getDomRef("months"), oEvent.target) ||
					jQuery.sap.containsOrEquals(this.getDomRef("years"), oEvent.target)) {
				// tab from a day
				if (this._bPoupupMode) {
					jQuery.sap.focus(this.getDomRef("year"));

					// remove ItemNavigation to prevent arrow navigation on buttons
					this.removeDelegate(this._oItemNavigation);

					oEvent.preventDefault();
				}
			} else if (oEvent.target.id == this.getId() + "-month") {
				// add ItemNavigation again
				this.addDelegate(this._oItemNavigation);
				this._oItemNavigation.focusItem(this._oItemNavigation.getFocusedIndex());

				oEvent.preventDefault();
			} else if (oEvent.target.id == this.getId() + "-year") {
				jQuery.sap.focus(this.getDomRef("month"));

				oEvent.preventDefault();
			}

		};

		Calendar.prototype.onsapnext = function(oEvent){

			if (oEvent.target.id == this.getId() + "-month" || oEvent.target.id == this.getId() + "-year") {
				//prevent browser scrolling
				oEvent.preventDefault();
			}

		};

		Calendar.prototype.onsapprevious = Calendar.prototype.onsapnext;

		Calendar.prototype.onfocusin = function(oEvent){

			if (oEvent.target.id == this.getId() + "-end") {
				// focus via tab+shift (otherwise not possible to go to this element)
				jQuery.sap.focus(this.getDomRef("year"));

				// remove Tabindex from day - to break cycle
				jQuery(this._oItemNavigation.getItemDomRefs()[this._oItemNavigation.getFocusedIndex()]).attr("tabindex", "-1");

				// remove ItemNavigation to prevent arrow navigation on buttons
				this.removeDelegate(this._oItemNavigation);
			}

			// remove tabindex of dummy element if focus is inside calendar
			jQuery.sap.byId(this.getId() + "-end").attr("tabindex", "-1");

		};

		Calendar.prototype.onsapfocusleave = function(oEvent){

			if (!oEvent.relatedControlId || !jQuery.sap.containsOrEquals(this.getDomRef(), sap.ui.getCore().byId(oEvent.relatedControlId).getFocusDomRef())) {
				// put dummy element back to tab-chain
				jQuery.sap.byId(this.getId() + "-end").attr("tabindex", "0");
				// add ItemNavigation again
				this.addDelegate(this._oItemNavigation);
			}

		};

		/*
		 * Checks if a date is selected and what kind of selected
		 * @return {int} iSelected 0: not selected; 1: single day selected, 2: interval start, 3: interval end, 4: interval between
		 * @private
		 */
		Calendar.prototype._checkDateSelected = function(oDate){

			if (!(oDate instanceof Date)) {
				throw new Error("Date must be a JavaScript date object; " + this);
			}

			var iSelected = 0;
			var aSelectedDates = this.getSelectedDates();
			var oTimeStamp = oDate.getTime();

			for ( var i = 0; i < aSelectedDates.length; i++) {
				// initalize the time part of the start and end time
				var oRange = aSelectedDates[i];
				var oTmpDate = _createUTCDate(oRange.getStartDate());
				var oStartDate;
				var oStartTimeStamp = 0;
				if (oTmpDate) {
					oStartDate = oTmpDate;
					oStartTimeStamp = oStartDate.getTime();
				}
				var oEndDate;
				var oEndTimeStamp = 0;
				if (this.getIntervalSelection()) {
					oTmpDate = _createUTCDate(oRange.getEndDate());
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
		Calendar.prototype._getDateType = function(oDate){

			if (!(oDate instanceof Date)) {
				throw new Error("Date must be a JavaScript date object; " + this);
			}

			var oType;
			var aSpecialDates = this.getSpecialDates();
			var oTimeStamp = oDate.getTime();

			for ( var i = 0; i < aSpecialDates.length; i++) {
				// initialize the time part of the start and end time
				var oRange = aSpecialDates[i];
				var oTmpDate = _createUTCDate(oRange.getStartDate());
				var oStartDate;
				var oStartTimeStamp = 0;
				if (oTmpDate) {
					oStartDate = oTmpDate;
					oStartTimeStamp = oStartDate.getTime();
				}
				var oEndDate;
				var oEndTimeStamp = 0;
				oTmpDate = _createUTCDate(oRange.getEndDate());
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

		function _handleAfterFocus(oControlEvent){

			var iIndex = oControlEvent.getParameter("index");
			var oEvent = oControlEvent.getParameter("event");

			if (!oEvent) {
				return; // happens if focus is set via ItemNavigation.focusItem directly
			}

			var that = this;
			var oFocusedDate = this._getFocusedDate();

			if (this._iMode == 0) {
				// day picker

				var aDomRefs = this.$("days").children(".sapUiCalDay");
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
								this._setFocusedDate(oFocusedDate);
								break;
							}
						}
						if (oFocusedDate.getTime() >= this._oMinDate.getTime() && oFocusedDate.getTime() <= this._oMaxDate.getTime()) {
								this._oItemNavigation.focusItem(i);
						}else {
							_focusDate(that, oFocusedDate);
						}
					} else {
						// switch to the requested month and focus the chosen day
						oFocusedDate = this._oFormatYyyymmdd.parse($DomRef.attr("data-sap-day"), true);
						if (!oFocusedDate) {
							oFocusedDate = this._getFocusedDate(); // e.g. year > 9999
						}

						if (oFocusedDate.getTime() >= this._oMinDate.getTime() && oFocusedDate.getTime() <= this._oMaxDate.getTime()) {
							this._setFocusedDate(oFocusedDate);
							_renderMonth(that);
						}else {
							_focusDate(that, oFocusedDate);
						}
					}
				} else {
					// day in current month focused
					if (!jQuery(oEvent.target).hasClass("sapUiCalWeekNum")) {
						// not if clicked on week number
						oFocusedDate = this._oFormatYyyymmdd.parse($DomRef.attr("data-sap-day"), true);
						if (oFocusedDate.getTime() >= this._oMinDate.getTime() && oFocusedDate.getTime() <= this._oMaxDate.getTime()) {
							this._setFocusedDate(oFocusedDate);
						}else {
							_focusDate(that, oFocusedDate);
						}
					}
				}
			}

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
				var oFocusedDate = this._getFocusedDate();
				_handleMousedown(that, oEvent, oFocusedDate, iIndex);
			}

		}

		function _handleMousedown(oThis, oEvent, oFocusedDate, iIndex){

			switch (oThis._iMode) {
			case 0: // day picker
				_selectDay(oThis, oFocusedDate, oEvent.shiftKey);
				_fireSelect(oThis);
				if (oThis.getIntervalSelection() && oThis.$().is(":visible")) {
					// if calendar was closed in select event, do not add mousemove handler
					jQuery(window.document).bind('mousemove', oThis._mouseMoveProxy);
					oThis._bMouseMove = true;
				}
				break;

			case 1: // month picker
				_selectMonth(oThis, iIndex);
				break;

			case 2: // year picker
				_selectYear(oThis, iIndex);
				break;
				// no default
			}
			oEvent.preventDefault(); // to prevent focus set outside of DatePicker
			oEvent.setMark("cancelAutoClose");

		}

		function _handleBorderReached(oControlEvent){

			var oEvent = oControlEvent.getParameter("event");
			var iMonth = 0;
			var oFocusedDate = this._getFocusedDate();

			if (oEvent.type) {
				var that = this;

				switch (this._iMode) {
				case 0: // day picker
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

					if (oFocusedDate.getTime() > this._oMaxDate.getTime()) {
						oFocusedDate.setUTCFullYear(this._oMaxDate.getUTCFullYear());
						oFocusedDate.setUTCMonth(this._oMaxDate.getUTCMonth());
						oFocusedDate.setUTCDate(this._oMaxDate.getUTCDate());
					}
					if (oFocusedDate.getTime() < this._oMinDate.getTime()) {
						oFocusedDate.setUTCFullYear(this._oMinDate.getUTCFullYear());
						oFocusedDate.setUTCMonth(this._oMinDate.getUTCMonth());
						oFocusedDate.setUTCDate(this._oMinDate.getUTCDate());
					}

					_renderMonth(that);
					break;

				case 1: // month picker
					break;

				case 2: // year picker
					switch (oEvent.type) {
					case "sapnext":
					case "sapnextmodifiers":
						if (oEvent.keyCode == jQuery.sap.KeyCodes.ARROW_DOWN) {
							//same column in first row of next group
							_updateYears(that, true, this._oItemNavigation.getFocusedIndex() - 16);
						} else {
							// first year in next group
							_updateYears(that, true, 0);
						}
						break;

					case "sapprevious":
					case "sappreviousmodifiers":
						if (oEvent.keyCode == jQuery.sap.KeyCodes.ARROW_UP) {
							//same column in last row of previous group
							_updateYears(that, false, 16 + this._oItemNavigation.getFocusedIndex());
						} else {
							// last year in previous group
							_updateYears(that, false, 19);
						}
						break;

					case "sappagedown":
						// same index in next group
						_updateYears(that, true, this._oItemNavigation.getFocusedIndex());
						break;

					case "sappageup":
						// same index in previous group
						_updateYears(that, false, this._oItemNavigation.getFocusedIndex());
						break;

					default:
						break;
					}
					break;
					// no default
				}
			}

		}

		function _initItemNavigation(oThis){

			var oDate = oThis._getFocusedDate();
			var sYyyymmdd = oThis._oFormatYyyymmdd.format(oDate, true);
			var aDomRefs = [];
			var oRootDomRef;
			var iIndex = 0;
			var iColumns = 0;
			var bNoColumnChange = false;
			var bCycling = true;

			switch (oThis._iMode) {
			case 0: // day picker
				oRootDomRef = oThis.$("days").get(0);
				aDomRefs = oThis.$("days").children(".sapUiCalDay");

				for ( var i = 0; i < aDomRefs.length; i++) {
					var $DomRef = jQuery(aDomRefs[i]);
					if ($DomRef.attr("data-sap-day") === sYyyymmdd) {
						iIndex = i;
					}
				}

				iColumns = 7;
				bNoColumnChange = true;
				bCycling = false;

				break;

			case 1: // month picker
				oRootDomRef = oThis.$("months").get(0);
				aDomRefs = oThis.$("months").children(".sapUiCalMonth");
				iIndex = oDate.getUTCMonth();

				iColumns = 3;

				break;

			case 2: // year picker
				oRootDomRef = oThis.$("years").get(0);
				aDomRefs = oThis.$("years").children(".sapUiCalYear");
				iIndex = 10;

				iColumns = 4;
				bNoColumnChange = true;
				bCycling = false;

				break;
				// no default
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
			oThis._oItemNavigation.setCycling(bCycling);
			oThis._oItemNavigation.setColumns(iColumns, bNoColumnChange);
			oThis._oItemNavigation.setFocusedIndex(iIndex);
			oThis._oItemNavigation.setPageSize(aDomRefs.length); // to make sure that pageup/down goes out of month

		}

		function _renderMonth(oThis){

			oThis._sRenderMonth = undefined; // initialize delayed call

			var oDate = oThis._getFocusedDate();
			var $Container = oThis.$("days");

			if ($Container.length > 0) {
				var oRm = sap.ui.getCore().createRenderManager();
				oThis.getRenderer().renderDays(oRm, oThis, oDate);
				oRm.flush($Container[0]);
				oRm.destroy();
			}

			// fire internal event for DatePicker for with number of rendered days. If Calendar becomes larger maybe popup must change position
			oThis.fireEvent("_renderMonth", {days: $Container.children(".sapUiCalDay").length});

			// change month and year
			var aMonthNames = [];
			if (oThis._bLongMonth || !oThis._bNamesLengthChecked) {
				aMonthNames = oThis._getLocaleData().getMonthsStandAlone("wide");
			} else {
				aMonthNames = oThis._getLocaleData().getMonthsStandAlone("abbreviated");
			}
			oThis.$("month").text(aMonthNames[oDate.getUTCMonth()]);
			oThis.$("year").text(oDate.getUTCFullYear());

			_initItemNavigation(oThis);
			oThis._oItemNavigation.focusItem(oThis._oItemNavigation.getFocusedIndex());

			_togglePrevNext(oThis, oDate, true);

		}

		/**
		 * Creates a Date in local timezone from UTC timezone
		 * @param {Date} oDate in UTC timezone
		 * @return {Date} in local timezone
		 * @private
		 */
		function _createLocalDate(oDate) {
			if (oDate) {
				return new Date(oDate.getTime() + oDate.getTimezoneOffset() * 60000);
			}
		}

		/**
		 * Creates a Date in UTC timezone from local timezone
		 * @param {Date} oDate in local timezone
		 * @return {Date} in UTC timezone
		 * @private
		 */
		function _createUTCDate(oDate) {
			if (oDate) {
				var oUTCDate = new Date(Date.UTC(oDate.getFullYear(),oDate.getMonth(),oDate.getDate()));
				if (oDate.getFullYear() < 1000) {
					oUTCDate.setUTCFullYear(oDate.getFullYear());
				}
				return oUTCDate;
			}

		}

		function _selectDay(oThis, oDate, bIntervalEnd, bMove){

			var aSelectedDates = oThis.getSelectedDates();
			var oDateRange;
			var aDomRefs = oThis.$("days").children(".sapUiCalDay");
			var $DomRef;
			var sYyyymmdd;
			var i = 0;
			if (oThis.getSingleSelection()) {
				var oStartDate;

				if (aSelectedDates.length > 0) {
					oDateRange = aSelectedDates[0];
					oStartDate = _createUTCDate(oDateRange.getStartDate());
				} else {
					oDateRange = new sap.ui.unified.DateRange();
					oThis.addAggregation("selectedDates", oDateRange, true); // no re-rendering
				}

				if (oThis.getIntervalSelection()/* && bIntervalEnd*/ && (!oDateRange.getEndDate() || bMove) && oStartDate) {
					// single interval selection
					var oEndDate;
					if (oDate.getTime() < oStartDate.getTime()) {
						oEndDate = oStartDate;
						oStartDate = oDate;
						if (!bMove) {
							// in move mode do not set date. this bring broblems if on backward move the start date would be cahnged
							oDateRange.setProperty("startDate", _createLocalDate(oStartDate), true); // no-rerendering
							oDateRange.setProperty("endDate", _createLocalDate(oEndDate), true); // no-rerendering
						}
					} else if (oDate.getTime() >= oStartDate.getTime()) {
						// single day ranges are allowed
						oEndDate = oDate;
						if (!bMove) {
							oDateRange.setProperty("endDate", _createLocalDate(oEndDate), true); // no-rerendering
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
					oDateRange.setProperty("startDate", _createLocalDate(oDate), true); // no-rerendering
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
							if (aSelectedDates[i].getStartDate() && oDate.getTime() == _createUTCDate(aSelectedDates[i].getStartDate()).getTime()) {
								oThis.removeAggregation("selectedDates", i, true); // no re-rendering
								break;
							}
						}
					} else {
						// not selected -> select
						oDateRange = new sap.ui.unified.DateRange({startDate: _createLocalDate(oDate)});
						oThis.addAggregation("selectedDates", oDateRange, true); // no re-rendering
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

		function _determineFocusedDate(oThis){

			var aSelectedDates = oThis.getSelectedDates();
			if (aSelectedDates && aSelectedDates[0] && aSelectedDates[0].getStartDate()) {
				// selected dates are provided -> use first one to focus
				oThis._oFocusedDate = _createUTCDate(aSelectedDates[0].getStartDate());
			} else {
				// use current date
				var newDate = new Date();
				oThis._oFocusedDate = _createUTCDate(newDate);
			}

		}

		function _showMonthPicker(oThis){

			if (oThis._iMode == 2) {
				_hideYearPicker(oThis);
			}

			var oDate = oThis._getFocusedDate();
			var oRm = sap.ui.getCore().createRenderManager();
			var $Container = oThis.$();

			oThis.getRenderer().renderMonthPicker(oRm, oThis, oDate);
			oRm.flush($Container[0], false, true); // insert it
			oRm.destroy();

			oThis._iMode = 1;

			// remove tabindex from focused day
			jQuery(oThis._oItemNavigation.getItemDomRefs()[oThis._oItemNavigation.getFocusedIndex()]).attr("tabindex", "-1");

			_initItemNavigation(oThis);
			jQuery.sap.focus(oThis._oItemNavigation.getItemDomRefs()[oThis._oItemNavigation.getFocusedIndex()]);

			_togglePrevNext(oThis, oDate, false);

		}

		function _hideMonthPicker(oThis){

			oThis.$("months").remove();
			oThis._iMode = 0;
			_initItemNavigation(oThis);
			jQuery.sap.focus(oThis._oItemNavigation.getItemDomRefs()[oThis._oItemNavigation.getFocusedIndex()]);

			var oFocusedDate = oThis._getFocusedDate();
			oThis.$("year").text(oFocusedDate.getUTCFullYear());
			_togglePrevNext(oThis, oFocusedDate, true);

		}

		function _selectMonth(oThis, iMonth){

			var oFocusedDate = oThis._getFocusedDate();

			oFocusedDate.setUTCMonth(iMonth);

			if (iMonth != oFocusedDate.getUTCMonth() ) {
				// day did not exist in this month (e.g. 31) -> go to last day of month
				oFocusedDate.setUTCDate(0);
			}

			if (oFocusedDate.getTime() < oThis._oMinDate.getTime()) {
				oThis._setFocusedDate(oThis._oMinDate);
			}else if (oFocusedDate.getTime() > oThis._oMaxDate.getTime()){
				oThis._setFocusedDate(oThis._oMaxDate);
			}

			_renderMonth(oThis);

			_hideMonthPicker(oThis);

		}

		function _showYearPicker(oThis){

			if (oThis._iMode == 1) {
				_hideMonthPicker(oThis);
			}

			var oDate = oThis._getFocusedDate();
			var oRm = sap.ui.getCore().createRenderManager();
			var $Container = oThis.$();
			var iYearMax = oThis._oMaxDate.getUTCFullYear();
			var iYearMin = oThis._oMinDate.getUTCFullYear();

			if (iYearMax - iYearMin <= 20) {
				return;
			}

			if (oDate.getUTCFullYear() > ( iYearMax - 10 )) {
				oDate.setUTCFullYear(iYearMax - 9);
				oThis.$("next").toggleClass("sapUiCalDsbl", true).attr("disabled", "disabled");
			} else {
				oThis.$("next").toggleClass("sapUiCalDsbl", false).removeAttr("disabled");
			}
			if (oDate.getUTCFullYear() < ( iYearMin + 9 )) {
				oDate.setUTCFullYear(iYearMin + 10);
				oThis.$("prev").toggleClass("sapUiCalDsbl", true).attr("disabled", "disabled");
			} else {
				oThis.$("prev").toggleClass("sapUiCalDsbl", false).removeAttr("disabled");
			}

			oThis.getRenderer().renderYearPicker(oRm, oThis, oDate);
			oRm.flush($Container[0], false, true); // insert it
			oRm.destroy();

			// check special case if only 4 weeks are displayed (e.g. February 2021) -> top padding must be removed
			var aDomRefs = oThis.$("days").children(".sapUiCalDay");
			if (aDomRefs.length == 28) {
				oThis.$("years").addClass("sapUiCalYearNoTop");
			}

			oThis._iMode = 2;

			// remove tabindex from focused day
			jQuery(oThis._oItemNavigation.getItemDomRefs()[oThis._oItemNavigation.getFocusedIndex()]).attr("tabindex", "-1");

			_initItemNavigation(oThis);
			jQuery.sap.focus(oThis._oItemNavigation.getItemDomRefs()[oThis._oItemNavigation.getFocusedIndex()]);

		}

		function _hideYearPicker(oThis){

			oThis.$("years").remove();
			oThis._iMode = 0;
			_initItemNavigation(oThis);
			jQuery.sap.focus(oThis._oItemNavigation.getItemDomRefs()[oThis._oItemNavigation.getFocusedIndex()]);

			var oFocusedDate = oThis._getFocusedDate();
			_togglePrevNext(oThis, oFocusedDate, true);

		}

		function _selectYear(oThis, iIndex){

			var oFocusedDate = oThis._getFocusedDate();
			var aDomRefs = oThis.$("years").children(".sapUiCalYear");
			var sYear = jQuery(aDomRefs[iIndex]).text();

			oFocusedDate.setUTCFullYear(sYear);

			if (oFocusedDate.getTime() < oThis._oMinDate.getTime()) {
				oThis._setFocusedDate(oThis._oMinDate);
			}else if (oFocusedDate.getTime() > oThis._oMaxDate.getTime()){
				oThis._setFocusedDate(oThis._oMaxDate);
			}

			_renderMonth(oThis);

			_hideYearPicker(oThis);

		}

		function _updateYears(oThis, bForward, iSelectedIndex){

			var aDomRefs = oThis.$("years").children(".sapUiCalYear");
			var iFirstYear = parseInt(jQuery(aDomRefs[0]).text(), 10);
			var oFocusedDate = oThis._getFocusedDate();
			var sCurrentYear = oFocusedDate.getUTCFullYear().toString();
			var iYearMax = oThis._oMaxDate.getUTCFullYear();
			var iYearMin = oThis._oMinDate.getUTCFullYear();

			if (bForward) {
				iFirstYear = iFirstYear + 20;
			} else {
				iFirstYear = iFirstYear - 20;
			}

			if (iFirstYear >= iYearMax - 19) {
				iFirstYear = iYearMax - 19;
				oThis.$("next").toggleClass("sapUiCalDsbl", true).attr("disabled", "disabled");
			}else {
				oThis.$("next").toggleClass("sapUiCalDsbl", false).removeAttr("disabled");
			}
			if (iFirstYear <= iYearMin) {
				iFirstYear = iYearMin;
				oThis.$("prev").toggleClass("sapUiCalDsbl", true).attr("disabled", "disabled");
			} else {
				oThis.$("prev").toggleClass("sapUiCalDsbl", false).removeAttr("disabled");
			}

			var iYear = iFirstYear;
			for ( var i = 0; i < aDomRefs.length; i++) {
				var $DomRef = jQuery(aDomRefs[i]);
				$DomRef.attr("id", oThis.getId() + "-y" + iYear);
				$DomRef.text(iYear);
				if ($DomRef.hasClass("sapUiCalYearSel") && $DomRef.text() != sCurrentYear) {
					$DomRef.removeClass("sapUiCalYearSel");
				} else if (!$DomRef.hasClass("sapUiCalYearSel") && $DomRef.text() == sCurrentYear) {
					$DomRef.addClass("sapUiCalYearSel");
				}
				iYear++;
			}

			oThis._oItemNavigation.focusItem(iSelectedIndex);

		}

		function _checkNamesLength(oThis){

			if (!oThis._bNamesLengthChecked) {
				// only once - cannot change by rerendering - only by theme change
				var i = 0;
				var oWeekDay;
				var oLocaleData;

				// check day names
				var aWeekHeaders = oThis.$().children(".sapUiCalWH");
				var bTooLong = false;

				for ( i = 0; i < aWeekHeaders.length; i++) {
					oWeekDay = aWeekHeaders[i];
					if (oWeekDay.clientWidth < oWeekDay.scrollWidth) {
						bTooLong = true;
						break;
					}
				}

				if (bTooLong) {
					oThis._bLongWeekDays = false;
					oLocaleData = oThis._getLocaleData();
					var iFirstDayOfWeek = oLocaleData.getFirstDayOfWeek();
					var aDayNames = oLocaleData.getDaysStandAlone("narrow");
					for ( i = 0; i < aDayNames.length; i++) {
						oWeekDay = aWeekHeaders[i];
						jQuery(oWeekDay).text(aDayNames[(i + iFirstDayOfWeek) % 7]);
					}
				} else {
					oThis._bLongWeekDays = true;
				}

				// check month names
				_showMonthPicker(oThis);

				var aMonths = oThis.$("months").children();
				bTooLong = false;
				for ( i = 0; i < aMonths.length; i++) {
					var oMonth = aMonths[i];
					if (oMonth.clientWidth < oMonth.scrollWidth) {
						bTooLong = true;
						break;
					}
				}
				if (bTooLong) {
					oThis._bLongMonth = false;
					if (!oLocaleData) {
						oLocaleData = oThis._getLocaleData();
					}
					// change month name on button but not chnage month picker, becuase it is hided again
					var aMonthNames = oLocaleData.getMonthsStandAlone("abbreviated");
					var oDate = oThis._getFocusedDate();
					oThis.$("month").text(aMonthNames[oDate.getUTCMonth()]);
				} else {
					oThis._bLongMonth = true;
				}

				_hideMonthPicker(oThis);

				oThis._bNamesLengthChecked = true;
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

		function _togglePrevNext (oThis, oDate, bCheckMonth){

			var iYear = oDate.getUTCFullYear();
			var iYearMax = oThis._oMaxDate.getUTCFullYear();
			var iYearMin = oThis._oMinDate.getUTCFullYear();
			var iMonth = oDate.getUTCMonth();
			var iMonthMax = oThis._oMaxDate.getUTCMonth();
			var iMonthMin = oThis._oMinDate.getUTCMonth();

			if (iYear > iYearMax || (iYear == iYearMax && ( !bCheckMonth || iMonth >= iMonthMax ))) {
				oThis.$("next").toggleClass("sapUiCalDsbl", true).attr("disabled", "disabled");
			}else {
				oThis.$("next").toggleClass("sapUiCalDsbl", false).removeAttr("disabled");
			}

			if (iYear < iYearMin || (iYear == iYearMin && ( !bCheckMonth || iMonth <= iMonthMin ))) {
				oThis.$("prev").toggleClass("sapUiCalDsbl", true).attr("disabled", "disabled");
			}else {
				oThis.$("prev").toggleClass("sapUiCalDsbl", false).removeAttr("disabled");
			}

		}

		function _focusDate (oThis, oDate){

			// if a date should be focused thats out of the borders -> focus the border
			var oFocusedDate;
			if (oDate.getTime() < oThis._oMinDate.getTime()) {
				oFocusedDate = oThis._oMinDate;
			}else if (oDate.getTime() > oThis._oMaxDate.getTime()){
				oFocusedDate = oThis._oMaxDate;
			}else {
				oFocusedDate = oDate;
			}

			oThis._setFocusedDate(oFocusedDate);

			var sYyyymmdd = oThis._oFormatYyyymmdd.format(oFocusedDate, true);
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

	}());

	return Calendar;

}, /* bExport= */ true);
