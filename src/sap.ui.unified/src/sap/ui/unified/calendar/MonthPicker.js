/*!
 * ${copyright}
 */

// Provides control sap.ui.unified.Calendar.
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Control', 'sap/ui/core/LocaleData', 'sap/ui/core/delegate/ItemNavigation', 'sap/ui/unified/library'],
	function(jQuery, Control, LocaleData, ItemNavigation, library) {
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
			month : {type : "int", group : "Misc", defaultValue : 0}

		},
		events : {

			/**
			 * Month selection changed
			 */
			select : {}

		}
	}});

	(function() {

		MonthPicker.prototype.init = function(){

			this._iColumns = 3;

		};

		MonthPicker.prototype.onAfterRendering = function(){

			var that = this;

			_initItemNavigation(that);

			// check if day names are too big -> use smaller ones
			_checkNamesLength(that);

		};

		MonthPicker.prototype.setMonth = function(iMonth){

			// no rerendering needed, just select new month
			this.setProperty("month", iMonth, true);
			iMonth = this.getProperty("month"); // to have type conversion, validation....

			if (iMonth < 0 || iMonth > 11) {
				throw new Error("Property month must be between 0 and 11; " + this);
			}

			if (this.getDomRef()) {
				var that = this;
				_selectMonth(that, iMonth);
				this._oItemNavigation.focusItem(iMonth);
			}


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
				var oLocale = new sap.ui.core.Locale(sLocale);
				this._oLocaleData = LocaleData.getInstance(oLocale);
			}

			return this._oLocaleData;

		};

		MonthPicker.prototype.onsapselect = function(oEvent){

			// focused item must be selected
			var that = this;
			var iIndex = this._oItemNavigation.getFocusedIndex();

			_selectMonth(that, iIndex);
			this.fireSelect();

		};

		MonthPicker.prototype.onThemeChanged = function(){

			if (this._bNoThemeChange) {
				// already called from Calendar
				return;
			}

			this._bNamesLengthChecked = undefined;
			var aMonths = this._oItemNavigation.getItemDomRefs();
			this._bLongMonth = false;
			var oLocaleData = this._getLocaleData();
			// change month name on button but not change month picker, because it is hided again
			var aMonthNames = oLocaleData.getMonthsStandAlone("wide");
			for (var i = 0; i < aMonths.length; i++) {
				var $Month = jQuery(aMonths[i]);
				$Month.text(aMonthNames[i]);
			}

			var that = this;
			_checkNamesLength(that);

		};

		function _initItemNavigation(oThis){

			var oRootDomRef = oThis.getDomRef();
			var aDomRefs = oThis.$().find(".sapUiCalMonth");
			var iIndex = oThis.getMonth();

			if (!oThis._oItemNavigation) {
				oThis._oItemNavigation = new ItemNavigation();
				oThis._oItemNavigation.attachEvent(ItemNavigation.Events.AfterFocus, _handleAfterFocus, oThis);
				oThis._oItemNavigation.attachEvent(ItemNavigation.Events.FocusAgain, _handleFocusAgain, oThis);
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
			oThis._oItemNavigation.setCycling(true);
			oThis._oItemNavigation.setColumns(oThis._iColumns, false);
			oThis._oItemNavigation.setFocusedIndex(iIndex);
			oThis._oItemNavigation.setPageSize(aDomRefs.length); // to make sure that pageup/down goes out of month

		}

		function _handleAfterFocus(oControlEvent){

			var iIndex = oControlEvent.getParameter("index");
			var oEvent = oControlEvent.getParameter("event");

			if (!oEvent) {
				return; // happens if focus is set via ItemNavigation.focusItem directly
			}

			if (oEvent.type == "mousedown") {
				// as no click event is fired in some cases
				var that = this;
				_handleMousedown(that, oEvent, iIndex);
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
				var that = this;
				_handleMousedown(that, oEvent, iIndex);
			}

		}

		function _handleMousedown(oThis, oEvent, iIndex){

			if (oEvent.button) {
				// only use left mouse button
				return;
			}

			_selectMonth(oThis, iIndex);
			oThis.fireSelect();

			oEvent.preventDefault(); // to prevent focus set outside of DatePicker
			oEvent.setMark("cancelAutoClose");

		}

		function _selectMonth(oThis, iMonth, bNoSetDate){

			var aDomRefs = oThis._oItemNavigation.getItemDomRefs();
			var $DomRef;
			var sId = oThis.getId() + "-m" + iMonth;
			for ( var i = 0; i < aDomRefs.length; i++) {
				$DomRef = jQuery(aDomRefs[i]);
				if ($DomRef.attr("id") == sId) {
					$DomRef.addClass("sapUiCalMonthSel");
				}else {
					$DomRef.removeClass("sapUiCalMonthSel");
				}
			}

			if (!bNoSetDate) {
				oThis.setProperty("month", iMonth, true);
			}

		}

		function _checkNamesLength(oThis){

			if (!oThis._bNamesLengthChecked) {
				var i = 0;
				// only once - cannot change by rerendering - only by theme change
				var aMonths = oThis._oItemNavigation.getItemDomRefs();
				var bTooLong = false;
				for (i = 0; i < aMonths.length; i++) {
					var oMonth = aMonths[i];
					if (Math.abs(oMonth.clientWidth - oMonth.scrollWidth) > 1) {
						bTooLong = true;
						break;
					}
				}
				if (bTooLong) {
					oThis._bLongMonth = false;
					var oLocaleData = oThis._getLocaleData();
					// change month name on button but not change month picker, because it is hided again
					var aMonthNames = oLocaleData.getMonthsStandAlone("abbreviated");
					var aMonthNamesWide = oLocaleData.getMonthsStandAlone("wide");
					for (i = 0; i < aMonths.length; i++) {
						var $Month = jQuery(aMonths[i]);
						$Month.text(aMonthNames[i]);
						$Month.attr("aria-label", aMonthNamesWide[i]);
					}
				} else {
					oThis._bLongMonth = true;
				}

				oThis._bNamesLengthChecked = true;
			}

		}

	}());

	return MonthPicker;

}, /* bExport= */ true);
