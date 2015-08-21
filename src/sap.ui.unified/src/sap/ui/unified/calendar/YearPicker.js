/*!
 * ${copyright}
 */

// Provides control sap.ui.unified.Calendar.
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Control', 'sap/ui/core/delegate/ItemNavigation', 'sap/ui/unified/library'],
	function(jQuery, Control, ItemNavigation, library) {
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
			 */
			year : {type : "int", group : "Misc", defaultValue : 2000}

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

			this._iColumns = 4;

		};

		YearPicker.prototype.onAfterRendering = function(){

			var that = this;

			_initItemNavigation(that);

		};

		YearPicker.prototype.setYear = function(iYear){

			// no rerendering needed, just select new year or update years
			this.setProperty("year", iYear, true);
			iYear = this.getProperty("year"); // to have type conversion, validation....

			if (iYear < 1 || iYear > 9999) {
				throw new Error("Property year must be between 0 and 9999; " + this);
			}

			if (this.getDomRef()) {
				var that = this;
				var iFirstYear = iYear - 10;
				_updateYears(that, iFirstYear, 10);
			}


		};

		/**
		 * displays the next page
		 *
		 * @returns {sap.ui.unified.calendar.YearPicker} <code>this</code> to allow method chaining
		 * @public
		 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
		 */
		YearPicker.prototype.nextPage = function(){

			var that = this;
			_updatePage(that, true, this._oItemNavigation.getFocusedIndex());

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

			var that = this;
			_updatePage(that, false, this._oItemNavigation.getFocusedIndex());

			return this;

		};

		YearPicker.prototype.onsapselect = function(oEvent){

			// focused item must be selected
			var that = this;
			var iIndex = this._oItemNavigation.getFocusedIndex();

			_selectYear(that, iIndex);
			this.fireSelect();

		};


		function _initItemNavigation(oThis){

			var iYear = oThis.getYear();
			var oRootDomRef = oThis.getDomRef();
			var aDomRefs = oThis.$().find(".sapUiCalYear");
			var iIndex = 10;

			if (iYear > 9990) {
				iIndex = iIndex + iYear - 9990;
			} else if (iYear <= 10){
				iIndex = iIndex - 11 + iYear;
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
			oThis._oItemNavigation.setColumns(oThis._iColumns, true);
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

			_selectYear(oThis, iIndex);
			oThis.fireSelect();

			oEvent.preventDefault(); // to prevent focus set outside of DatePicker
			oEvent.setMark("cancelAutoClose");

		}

		function _handleBorderReached(oControlEvent){

			var oEvent = oControlEvent.getParameter("event");

			if (oEvent.type) {
				var that = this;

				switch (oEvent.type) {
				case "sapnext":
				case "sapnextmodifiers":
					if (oEvent.keyCode == jQuery.sap.KeyCodes.ARROW_DOWN) {
						//same column in first row of next group
						_updatePage(that, true, this._oItemNavigation.getFocusedIndex() - 16);
					} else {
						// first year in next group
						_updatePage(that, true, 0);
					}
					break;

				case "sapprevious":
				case "sappreviousmodifiers":
					if (oEvent.keyCode == jQuery.sap.KeyCodes.ARROW_UP) {
						//same column in last row of previous group
						_updatePage(that, false, 16 + this._oItemNavigation.getFocusedIndex());
					} else {
						// last year in previous group
						_updatePage(that, false, 19);
					}
					break;

				case "sappagedown":
					// same index in next group
					_updatePage(that, true, this._oItemNavigation.getFocusedIndex());
					break;

				case "sappageup":
					// same index in previous group
					_updatePage(that, false, this._oItemNavigation.getFocusedIndex());
					break;

				default:
					break;
				}
			}

		}

		function _selectYear(oThis, iIndex){

			var aDomRefs = oThis._oItemNavigation.getItemDomRefs();
			var sYear = jQuery(aDomRefs[iIndex]).text();
			var $DomRef;
			var sId = oThis.getId() + "-y" + sYear;
			for ( var i = 0; i < aDomRefs.length; i++) {
				$DomRef = jQuery(aDomRefs[i]);
				if ($DomRef.attr("id") == sId) {
					$DomRef.addClass("sapUiCalYearSel");
				}else {
					$DomRef.removeClass("sapUiCalYearSel");
				}
			}

			oThis.setProperty("year", parseInt(sYear, 10), true);

		}

		function _updatePage(oThis, bForward, iSelectedIndex){

			var aDomRefs = oThis._oItemNavigation.getItemDomRefs();
			var iFirstYear = parseInt(jQuery(aDomRefs[0]).text(), 10);

			if (bForward) {
				iFirstYear = iFirstYear + 20;
			} else {
				iFirstYear = iFirstYear - 20;
			}

			_updateYears(oThis, iFirstYear, iSelectedIndex);

		}

		function _updateYears(oThis, iFirstYear, iSelectedIndex){

			var sCurrentYear = oThis.getYear().toString();

			if (iFirstYear >= 9980) {
				iSelectedIndex = iSelectedIndex + iFirstYear - 9980;
				iFirstYear = 9980;
			}else if (iFirstYear < 1) {
				iSelectedIndex = iSelectedIndex + iFirstYear - 1;
				iFirstYear = 1;
			}

			var aDomRefs = oThis._oItemNavigation.getItemDomRefs();
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


	}());

	return YearPicker;

}, /* bExport= */ true);
