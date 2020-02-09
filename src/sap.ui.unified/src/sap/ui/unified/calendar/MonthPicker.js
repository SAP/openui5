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
	"sap/ui/thirdparty/jquery"
], function(
	Control,
	Device,
	LocaleData,
	ItemNavigation,
	library,
	Locale,
	MonthPickerRenderer,
	jQuery
) {
	"use strict";

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

	MonthPicker.prototype.getFocusDomRef = function(){
		return this._oItemNavigation.getItemDomRefs()[this._oItemNavigation.getFocusedIndex()];
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

		this._bNamesLengthChecked = undefined;
		var aMonths = this._oItemNavigation.getItemDomRefs();
		this._bLongMonth = false;
		var oLocaleData = this._getLocaleData();
		// change month name on button but not change month picker, because it is hided again
		var aMonthNames = oLocaleData.getMonthsStandAlone("wide", this.getPrimaryCalendarType());
		for (var i = 0; i < aMonths.length; i++) {
			var $Month = jQuery(aMonths[i]);
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

		var iStartMonth = this.getStartMonth();
		var iIndex = this._oItemNavigation.getFocusedIndex();
		var iMonth = iIndex + iStartMonth;
		var iMonths = this.getMonths();

		iMonth = iMonth + iMonths;
		if (iMonth > 11) {
			iMonth = 11;
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

		var iStartMonth = this.getStartMonth();
		var iIndex = this._oItemNavigation.getFocusedIndex();
		var iMonth = iIndex + iStartMonth;
		var iMonths = this.getMonths();

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

		if (this.getMonths() < 12) {
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

		var oRootDomRef = this.getDomRef();
		var aDomRefs = this.$().find(".sapUiCalItem");
		var iColumns = this.getColumns();
		var iMonths = this.getMonths();
		var bCycling = true;

		if (iMonths < 12) {
			bCycling = false;
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
		this._oItemNavigation.setCycling(bCycling);
		this._oItemNavigation.setColumns(iColumns, true);
		var iIndex = this.getMonth() - this.getStartMonth();
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
			var iStartMonth = this.getStartMonth();
			var iIndex = this._oItemNavigation.getFocusedIndex();
			var iMonth = iIndex + iStartMonth;
			var iMonths = this.getMonths();

			switch (oEvent.type) {
			case "sapnext":
			case "sapnextmodifiers":
				if (iMonth < 11) {
					iMonth++;
					_updateMonths.call(this, iMonth, true);
				}
				break;

			case "sapprevious":
			case "sappreviousmodifiers":
				if (iMonth > 0) {
					iMonth--;
					_updateMonths.call(this, iMonth, true);
				}
				break;

			case "sappagedown":
				if (iMonth < 12 - iMonths) {
					iMonth = iMonth + iMonths;
					_updateMonths.call(this, iMonth, true);
				} else if (iMonths === 12) {
					this.firePageChange({ offset: 1 });
				}
				break;

			case "sappageup":
				if (iMonth > iMonths) {
					iMonth = iMonth - iMonths;
					_updateMonths.call(this, iMonth, true);
				} else if (iMonths === 12) {
					this.firePageChange({ offset: -1 });
				}
				break;

			default:
				break;
			}
		}

	}

	function _selectMonth(iMonth, bNoSetDate){

		var aDomRefs = this._oItemNavigation.getItemDomRefs();
		var $DomRef;
		var sId = this.getId() + "-m" + iMonth;
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

		if (!bNoSetDate) {
			this.setProperty("month", iMonth, true);
		}

	}

	function _checkNamesLength(){

		if (!this._bNamesLengthChecked) {
			var i = 0;
			// only once - cannot change by rerendering - only by theme change
			var aMonths = this._oItemNavigation.getItemDomRefs();
			var bTooLong = false;
			var iMonths = this.getMonths();
			var iBlocks = Math.ceil(12 / iMonths);
			var iMonth = iMonths - 1;
			for (var b = 0; b < iBlocks; b++) {
				if (iMonths < 12) {
					_updateMonths.call(this, iMonth);
					iMonth = iMonth + iMonths;
					if (iMonth > 11) {
						iMonth = 11;
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

			if (iMonths < 12) {
				// restore rendered block
				iMonth = this.getMonth();
				_updateMonths.call(this, iMonth);
			}

			if (bTooLong) {
				this._bLongMonth = false;
				var oLocaleData = this._getLocaleData();
				var sCalendarType = this.getPrimaryCalendarType();
				// change month name on button but not change month picker, because it is hided again
				var aMonthNames = oLocaleData.getMonthsStandAlone("abbreviated", sCalendarType);
				var aMonthNamesWide = oLocaleData.getMonthsStandAlone("wide", sCalendarType);
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

	function _updateMonths(iMonth, bFireEvent){

		var aMonths = this._oItemNavigation.getItemDomRefs();
		if (aMonths.length > 11) {
			return;
		}

		// Month blocks should start with multiple of number of displayed months
		var iMonths = aMonths.length;
		var iStartMonth = Math.floor( iMonth / iMonths) * iMonths;
		if (iStartMonth + iMonths > 12) {
			iStartMonth = 12 - iMonths;
		}

		var oLocaleData = this._getLocaleData();
		var aMonthNames = [];
		var aMonthNamesWide = [];
		var sCalendarType = this.getPrimaryCalendarType();
		if (this._bLongMonth || !this._bNamesLengthChecked) {
			aMonthNames = oLocaleData.getMonthsStandAlone("wide", sCalendarType);
		} else {
			aMonthNames = oLocaleData.getMonthsStandAlone("abbreviated", sCalendarType);
			aMonthNamesWide = oLocaleData.getMonthsStandAlone("wide", sCalendarType);
		}

		var iSelectedMonth = this.getMonth();

		for (var i = 0; i < aMonths.length; i++) {
			var iCurrentMonth = i + iStartMonth;
			var $DomRef = jQuery(aMonths[i]);
			$DomRef.text(aMonthNames[i + iStartMonth]);
			$DomRef.attr("id", this.getId() + "-m" + (i + iStartMonth));
			if (!this._bLongMonth) {
				$DomRef.attr("aria-label", aMonthNamesWide[i + iStartMonth]);
			}
			if (iCurrentMonth == iSelectedMonth) {
				$DomRef.addClass("sapUiCalItemSel");
				$DomRef.attr("aria-selected", "true");
			}else {
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
			this.firePageChange();
		}

	}

	return MonthPicker;

});