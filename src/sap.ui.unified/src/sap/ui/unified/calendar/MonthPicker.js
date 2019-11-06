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
	"sap/ui/events/KeyCodes"
], function(
	Control,
	Device,
	LocaleData,
	ItemNavigation,
	library,
	Locale,
	MonthPickerRenderer,
	jQuery,
	KeyCodes
) {
	"use strict";


	var MONTHS_IN_YEAR = 12,
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
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
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
			primaryCalendarType : {type : "sap.ui.core.CalendarType", group : "Appearance"}
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
	}});

	MonthPicker.prototype.init = function(){

		// set default calendar type from configuration
		var sCalendarType = sap.ui.getCore().getConfiguration().getCalendarType();
		this.setProperty("primaryCalendarType", sCalendarType);

		this._iMinMonth = 0;
		this._iMaxMonth = 11;

	};

	MonthPicker.prototype.onAfterRendering = function(){

		_initItemNavigation.call(this);

		// check if day names are too big -> use smaller ones
		_checkNamesLength.call(this);

	};

	MonthPicker.prototype.setMonth = function(iMonth){

		// no rerendering needed, just select new month
		this.setProperty("month", iMonth, true);
		iMonth = this.getProperty("month"); // to have type conversion, validation....

		if (iMonth < 0 || iMonth > 11) {
			throw new Error("Property month must be between 0 and 11; " + this);
		}

		if (this.getDomRef()) {
			if (this.getMonths() < 12) {
				var iStartMonth = this.getStartMonth();
				if (iMonth >= iStartMonth && iMonth <= iStartMonth + this.getMonths() - 1) {
					_selectMonth.call(this, iMonth, true);
					this._oItemNavigation.focusItem(iMonth - iStartMonth);
				}else {
					_updateMonths.call(this, iMonth);
				}
			} else {
				_selectMonth.call(this, iMonth, true);
				this._oItemNavigation.focusItem(iMonth);
			}
		}

		return this;

	};

	/*
	 * Use rendered locale for stand alone control
	 * But as Calendar can have an own locale, use this one if used inside Calendar
	 */
	MonthPicker.prototype._getLocale = function(){

		var oParent = this.getParent();

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

		var oParent = this.getParent();

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
			_selectMonth.call(this, iMonth);
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

		// fire select event on mouseup to prevent closing MonthPicker during click
		if (this._bMousedownChange) {
			this._bMousedownChange = false;
			this.fireSelect();
		} else if (Device.support.touch
			&& this._isValueInThreshold(this._oMousedownPosition.clientX, oEvent.clientX, 10)
			&& this._isValueInThreshold(this._oMousedownPosition.clientY, oEvent.clientY, 10)
		) {
			var iIndex = this._oItemNavigation.getFocusedIndex();
			var iMonth = iIndex + this.getStartMonth();
			_selectMonth.call(this, iMonth);
			this.fireSelect();
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
	 * @returns {sap.ui.unified.calendar.MonthPicker} <code>this</code> to allow method chaining
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
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

		return this;

	};

	/**
	 * displays the previous page
	 *
	 * @returns {sap.ui.unified.calendar.MonthPicker} <code>this</code> to allow method chaining
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
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
		return this;

	};

	/**
	 * sets a minimum and maximum month
	 *
	 * @param {int} [iMin] minimum month as integer (starting with 0)
	 * @param {int} [iMax] maximum month as integer (starting with 0)
	 * @returns {sap.ui.unified.calendar.MonthPicker} <code>this</code> to allow method chaining
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	MonthPicker.prototype.setMinMax = function(iMin, iMax){

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
			var aMonths = this._oItemNavigation.getItemDomRefs();
			var iIDLength = this.getId().length + 2;

			for (var i = 0; i < aMonths.length; i++) {
				var $DomRef = jQuery(aMonths[i]);
				var iMonth = parseInt( $DomRef.attr("id").slice( iIDLength));
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

		if (this.getMonths() < MONTHS_IN_YEAR) {
			var oFirstMonth = this._oItemNavigation.getItemDomRefs()[0];
			return parseInt( oFirstMonth.id.slice( this.getId().length + 2));
		} else {
			return 0;
		}

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

	MonthPicker.prototype.ontouchstart = function (oEvent){
		if (!Device.system.desktop && oEvent.target.classList.contains("sapUiCalItem")){
			oEvent.target.classList.add("sapUiCalItemSel");
		}
	};

	function _initItemNavigation(){

		var oRootDomRef = this.getDomRef(),
			aDomRefs = this.$().find(".sapUiCalItem"),
			iColumns = this.getColumns();

		if (!this._oItemNavigation) {
			this._oItemNavigation = new ItemNavigation();
			this._oItemNavigation.attachEvent(ItemNavigation.Events.AfterFocus, _handleAfterFocus, this);
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

	function _handleAfterFocus(oControlEvent){

		var iIndex = oControlEvent.getParameter("index"),
			oEvent = oControlEvent.getParameter("event");

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

		var iMonth = iIndex + this.getStartMonth();

		if (iMonth >= this._iMinMonth && iMonth <= this._iMaxMonth) {
			_selectMonth.call(this, iMonth);
			this._bMousedownChange = true;
		}

		oEvent.preventDefault(); // to prevent focus set outside of DatePicker
		oEvent.setMark("cancelAutoClose");

	}

	function _handleBorderReached(oControlEvent){
		var oEvent = oControlEvent.getParameter("event");

		if (oEvent.type) {
			var iMonth = this._oItemNavigation.getFocusedIndex() + this.getStartMonth(),
				iMonths = this.getMonths(),
				iColumns = this.getColumns();

			switch (oEvent.type) {
				case "sapnext":
				case "sapnextmodifiers":
					if (oEvent.keyCode === KeyCodes.ARROW_DOWN && iColumns <= iMonths) {
						if (iMonth < MONTHS_IN_YEAR - iMonths) {
							// We dont need to fire "pageChange" event as we only render the next block of months in the same year
							_updateMonths.call(this, iMonth + iColumns, false, OFFSET.OneYearForward);
						} else if (iMonths === MONTHS_IN_YEAR) {
							this.firePageChange({ offset: OFFSET.OneYearForward });
							this._oItemNavigation.focusItem(iMonth % iColumns);
						} else {
							_updateMonths.call(this, iMonth % iColumns, true, OFFSET.OneYearForward);
						}
					} else {
						if (iMonth < MONTHS_IN_YEAR - iMonths) {
							// We dont need to fire "pageChange" event as we only render the next block of months in the same year
							_updateMonths.call(this, iMonth + 1, false, OFFSET.OneYearForward);
						} else if (iMonths === MONTHS_IN_YEAR) {
							this.firePageChange({ offset: OFFSET.OneYearForward });
							this._oItemNavigation.focusItem(0);
						} else {
							_updateMonths.call(this, 0, true, OFFSET.OneYearForward);
						}
					}
					break;

				case "sapprevious":
				case "sappreviousmodifiers":
					if (oEvent.keyCode === KeyCodes.ARROW_UP && iColumns <= iMonths) {
						if (iMonth >= iMonths) {
							// We dont need to fire "pageChange" event as we only render the next block of months in the same year
							_updateMonths.call(this, iMonth - iColumns, false, OFFSET.OneYearBackward);
						} else if (iMonths === MONTHS_IN_YEAR) {
							this.firePageChange({ offset: OFFSET.OneYearBackward });
							this._oItemNavigation.focusItem(iMonths - iColumns + iMonth);
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

	function _selectMonth(iMonth, bNoSetDate){

		var aDomRefs = this._oItemNavigation.getItemDomRefs(),
			$DomRef,
			sId = this.getId() + "-m" + iMonth,
			i;

		for (i = 0; i < aDomRefs.length; i++) {
			$DomRef = jQuery(aDomRefs[i]);
			if ($DomRef.attr("id") == sId) {
				$DomRef.addClass("sapUiCalItemSel");
				$DomRef.attr("aria-selected", "true");
			} else {
				$DomRef.removeClass("sapUiCalItemSel");
				$DomRef.attr("aria-selected", "false");
			}
		}

		if (!bNoSetDate) {
			this.setProperty("month", iMonth, true);
		}

	}

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

		var aMonths = this._oItemNavigation.getItemDomRefs(),
			iMonths = aMonths.length,
			iStartMonth = Math.floor(iMonth / iMonths) * iMonths;

		// Month blocks should start with multiple number of displayed months
		if (iStartMonth + iMonths > MONTHS_IN_YEAR) {
			iStartMonth = MONTHS_IN_YEAR - iMonths;
		}

		var oLocaleData = this._getLocaleData(),
			aMonthNames = [],
			aMonthNamesWide = [],
			sCalendarType = this.getPrimaryCalendarType();

		if (this._bLongMonth || !this._bNamesLengthChecked) {
			aMonthNames = oLocaleData.getMonthsStandAlone("wide", sCalendarType);
		} else {
			aMonthNames = oLocaleData.getMonthsStandAlone("abbreviated", sCalendarType);
			aMonthNamesWide = oLocaleData.getMonthsStandAlone("wide", sCalendarType);
		}

		for (var i = 0; i < aMonths.length; i++) {
			var iCurrentMonth = i + iStartMonth,
				$DomRef = jQuery(aMonths[i]);

			$DomRef.text(aMonthNames[i + iStartMonth]);
			$DomRef.attr("id", this.getId() + "-m" + (i + iStartMonth));

			if (!this._bLongMonth) {
				$DomRef.attr("aria-label", aMonthNamesWide[i + iStartMonth]);
			}

			if (iCurrentMonth === this.getMonth()) {
				$DomRef.addClass("sapUiCalItemSel");
				$DomRef.attr("aria-selected", "true");
			} else {
				$DomRef.removeClass("sapUiCalItemSel");
				$DomRef.attr("aria-selected", "false");
			}

			if (iCurrentMonth < this._iMinMonth || iCurrentMonth > this._iMaxMonth) {
				$DomRef.addClass("sapUiCalItemDsbl");
				$DomRef.attr("aria-disabled", true);
			} else {
				$DomRef.removeClass("sapUiCalItemDsbl");
				$DomRef.removeAttr("aria-disabled");
			}
		}

		this._oItemNavigation.focusItem(iMonth - iStartMonth);

		if (bFireEvent) {
			this.firePageChange({
				offset: iOffset
			});
		}

	}

	return MonthPicker;

});