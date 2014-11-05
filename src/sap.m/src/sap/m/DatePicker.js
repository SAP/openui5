/*!
 * ${copyright}
 */

// Provides control sap.m.DatePicker.
sap.ui.define(['jquery.sap.global', './InputBase', './library', 'sap/ui/model/type/Date'],
	function(jQuery, InputBase, library, Date1) {
	"use strict";


	
	/**
	 * Constructor for a new DatePicker.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * This is an date input control with a calendar DatePicker.
	 * It internal uses the sap.ui.unified.Calendar. So the sap.ui.unified library should be loaded from applications using this control. (Otherwise it will be loaded by opening the DatePicker.)
	 * @extends sap.m.InputBase
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.22.0
	 * @name sap.m.DatePicker
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var DatePicker = InputBase.extend("sap.m.DatePicker", /** @lends sap.m.DatePicker.prototype */ { metadata : {
	
		library : "sap.m",
		properties : {
	
			/**
			 * Displays date value in this given format in text field. Default value is taken from locale settings.
			 * If you use data-binding on value property with type sap.ui.model.type.Date then you can ignore this property or latter wins.
			 */
			displayFormat : {type : "string", group : "Appearance", defaultValue : null},
	
			/**
			 * Given value property should match with valueFormat to parse date. Default value is taken from locale settings.
			 * You can set and get value in this format.
			 * If you use data-binding on value property with type sap.ui.model.type.Date you can ignore this property or latter wins.
			 */
			valueFormat : {type : "string", group : "Data", defaultValue : null},
	
			/**
			 * This property as JavaScript Date Object can be used to assign a new value which is independent from valueFormat.
			 * If this property is used, the value property should not be changed from the caller.
			 */
			dateValue : {type : "object", group : "Data", defaultValue : null}
		}
	}});
	
	///**
	// * This file defines behavior for the control,
	// */
	//sap.m.DatePicker.prototype.init = function(){
	//   // do something for initialization...
	//};
	
	
	(function() {
	
		DatePicker.prototype.init = function() {
	
			InputBase.prototype.init.apply(this, arguments);
	
			this._inputProxy = jQuery.proxy(_onInput, this);
	
			this._bIntervalSelection = false;
	
		};
	
		DatePicker.prototype.exit = function() {
	
			InputBase.prototype.exit.apply(this, arguments);
	
			if (this._oPopup) {
				if (this._oPopup.isOpen()) {
					this._oPopup.close();
				}
				delete this._oPopup;
			}
	
			if (this._oCalendar) {
				this._oCalendar.destroy();
				delete this._oCalendar;
			}
	
			this._sUsedDisplayPattern = undefined;
			this._sDisplayFormat = undefined;
			this._sUsedValuePattern = undefined;
			this._sValueFormat = undefined;
	
		};
	
		DatePicker.prototype.onAfterRendering = function() {
	
			InputBase.prototype.onAfterRendering.apply(this, arguments);
			this.bindToInputEvent(this._inputProxy);
	
		};
	
		DatePicker.prototype.invalidate = function(oOrigin) {
	
			if (!oOrigin || oOrigin != this._oCalendar) {
				// Calendar is only invalidated by DatePicker itself -> so don't invalidate DatePicker
				sap.ui.core.Control.prototype.invalidate.apply(this, arguments);
			}
	
		};
	
		/**
		 * Defines the width of the DatePicker. Default value is 100%
		 *
		 * @param {string} sWidth  new value for <code>width</code>
		 * @returns {sap.m.DatePicker} <code>this</code> to allow method chaining
		 * @public
		 */
		DatePicker.prototype.setWidth = function(sWidth) {
	
			return InputBase.prototype.setWidth.call(this, sWidth || "100%");
	
		};
	
		DatePicker.prototype.getWidth = function(sWidth) {
	
			return this.getProperty("width") || "100%";
	
		};
	
		DatePicker.prototype.onfocusin = function(oEvent) {
			InputBase.prototype.onfocusin.apply(this, arguments);
			if (sap.ui.Device.browser.mobile && !jQuery(oEvent.target).hasClass("sapUiIcon") && !this._bFocusNoPopup) {
				// on mobile devices open calendar
				var that = this;
	
				if (!this._oPopup || !this._oPopup.isOpen()) {
					_open(that);
				}
			}
	
			this._bFocusNoPopup = undefined;
	
		};
	
		DatePicker.prototype.onsapshow = function(oEvent) {
	
			var that = this;
	
			_toggleOpen(that);
	
			oEvent.preventDefault(); // otherwise IE opens the address bar history
	
		};
	
		// ALT-UP and ALT-DOWN should behave the same
		DatePicker.prototype.onsaphide = DatePicker.prototype.onsapshow;
	
		DatePicker.prototype.onsappageup = function(oEvent){
	
			//increase by one day
			var that = this;
			_incraseDate(that, 1, "day");
	
			oEvent.preventDefault(); // do not move cursor
	
		};
	
		DatePicker.prototype.onsappageupmodifiers = function(oEvent){
	
			var that = this;
			if (!oEvent.ctrlKey && oEvent.shiftKey) {
				// increase by one month
				_incraseDate(that, 1, "month");
			} else {
				// increase by one year
				_incraseDate(that, 1, "year");
			}
	
			oEvent.preventDefault(); // do not move cursor
	
		};
	
		DatePicker.prototype.onsappagedown = function(oEvent){
	
			//decrease by one day
			var that = this;
			_incraseDate(that, -1, "day");
	
			oEvent.preventDefault(); // do not move cursor
	
		};
	
		DatePicker.prototype.onsappagedownmodifiers = function(oEvent){
	
			var that = this;
			if (!oEvent.ctrlKey && oEvent.shiftKey) {
				// decrease by one month
				_incraseDate(that, -1, "month");
			} else {
				// decrease by one year
				_incraseDate(that, -1, "year");
			}
	
			oEvent.preventDefault(); // do not move cursor
	
		};
	
		DatePicker.prototype.onkeypress = function(oEvent){
	
			if (oEvent.charCode) {
				var that = this;
				var oFormatter = _getFormatter(that, true);
				var sChar = String.fromCharCode(oEvent.charCode);
	
				if (sChar && oFormatter.sAllowedCharacters && oFormatter.sAllowedCharacters.indexOf(sChar) < 0) {
					oEvent.preventDefault();
				}
			}
	
		};
	
		DatePicker.prototype.onclick = function(oEvent) {
	
			var that = this;
			if (jQuery(oEvent.target).hasClass("sapUiIcon")) {
				_toggleOpen(that);
			} else	if (sap.ui.Device.browser.mobile && (!this._oPopup || !this._oPopup.isOpen())) {
				_open(that);
			}
	
		};
	
		DatePicker.prototype.setValue = function(sValue) {
	
			var sOldValue = this.getValue();
			if (sValue == sOldValue) {
				return this;
			} else {
				this._lastValue = sValue;
			}
	
			// set the property in any case but check validity on output
			this.setProperty("value", sValue, true); // no rerendering
	
			// convert to date object
			var oDate = this._parseValue(sValue);
			this.setProperty("dateValue", oDate, true); // no rerendering
	
			// do not call InputBase.setValue because the displayed value and the output value might have different pattern
			if (this.getDomRef()) {
				// convert to output
				var sOutputValue = this._formatValue(oDate);
	
				if (this._$input.val() !== sOutputValue) {
					this._$input.val(sOutputValue);
					this._setLabelVisibility();
					this._curpos = this._$input.cursorPos();
				}
			}
	
			return this;
	
		};
	
		DatePicker.prototype.setDateValue = function(oDate) {
	
			if (jQuery.sap.equal(this.getDateValue(), oDate)) {
				return this;
			}
	
			this.setProperty("dateValue", oDate, true); // no rerendering
	
			// convert date object to value
			var sValue = this._formatValue(oDate, true);
	
			if (sValue !== this.getValue()) {
				this._lastValue = sValue;
			}
			// set the property in any case but check validity on output
			this.setProperty("value", sValue, true); // no rerendering
	
			if (this.getDomRef()) {
				// convert to output
				var sOutputValue = this._formatValue(oDate);
	
				if (this._$input.val() !== sOutputValue) {
					this._$input.val(sOutputValue);
					this._setLabelVisibility();
					this._curpos = this._$input.cursorPos();
				}
			}
	
			return this;
	
		};
	
		DatePicker.prototype.setValueFormat = function(sValueFormat) {
	
			// if valueFormat changes the value must be parsed again
	
			this.setProperty("valueFormat", sValueFormat, true); // no rerendering
			var sValue = this.getValue();
	
			if (sValue) {
				var oDate = this._parseValue(sValue);
				this.setProperty("dateValue", oDate, true); // no rerendering
			}
	
			return this;
	
		};
	
		DatePicker.prototype.setDisplayFormat = function(sDisplayFormat) {
	
			// if displayFormat changes the value must be formatted again
	
			this.setProperty("displayFormat", sDisplayFormat, true); // no rerendering
			var sOutputValue = this._formatValue(this.getDateValue());
	
			if (this.getDomRef() && (this._$input.val() !== sOutputValue)) {
				this._$input.val(sOutputValue);
				this._curpos = this._$input.cursorPos();
			}
	
			return this;
	
		};
	
		DatePicker.prototype.onChange = function(oEvent) {
			// don't call InputBase onChange because this calls setValue what would trigger a new formatting
	
			// check the control is editable or not
			if (!this.getEditable() || !this.getEnabled()) {
				return;
			}
	
			// set date before fire change event
			var sValue = this._$input.val();
			var oDate;
			var bValid = true;
			if (sValue != "") {
				oDate = this._parseValue(sValue, true);
				if (oDate) {
					// check if Formatter changed the value (it correct some wrong inputs or known patterns)
					sValue = this._formatValue(oDate);
				} else {
					bValid = false;
	//				sValue = "";
				}
			}
	
			if (this.getDomRef() && (this._$input.val() !== sValue)) {
				this._$input.val(sValue);
				this._curpos = this._$input.cursorPos();
				if (this._$label) {
					// because value property might not be updated between typing
					this._$label.css("display", sValue ? "none" : "inline");
				}
			}
	
			if (oDate) {
				// get the value in valueFormat
				sValue = this._formatValue(oDate, true);
			}
	
			// compare with the old known value
			if (sValue !== this._lastValue) {
				this.setProperty("value", sValue, true); // no rerendering
				if (bValid) {
					this.setProperty("dateValue", oDate, true); // no rerendering
				}
	
				// remember the last value on change
				this._lastValue = sValue;
	
				this.fireChangeEvent(sValue, {valid: bValid});
	
				if (this._oPopup && this._oPopup.isOpen()) {
					this._oCalendar.focusDate(oDate);
					var oStartDate = this._oDateRange.getStartDate();
					if ((!oStartDate && oDate) || (oStartDate && oDate && oStartDate.getTime() != oDate.getTime())) {
						this._oDateRange.setStartDate(new Date(oDate.getTime()));
					} else if (oStartDate && !oDate) {
						this._oDateRange.setStartDate(undefined);
					}
				}
			}
	
		};
	
		// overwrite _getInputValue to do the conversion there
		DatePicker.prototype._getInputValue = function(sValue) {
	
			sValue = (typeof sValue == "undefined") ? this._$input.val() : sValue.toString();
	
			var oDate = this._parseValue(sValue, true);
			sValue = this._formatValue(oDate, true);
	
			return sValue;
	
		};
	
		// overwrite _getInputValue to do the output conversion
		DatePicker.prototype.updateDomValue = function(sValue) {
	
			// dom value updated other than value property
			this._bCheckDomValue = true;
	
			sValue = (typeof sValue == "undefined") ? this._$input.val() : sValue.toString();
			this._curpos = this._$input.cursorPos();
	
			var oDate = this._parseValue(sValue, true);
			sValue = this._formatValue(oDate);
	
			// update the DOM value when necessary
			// otherwise cursor can goto end of text unnecessarily
			if (this.isActive() && (this._$input.val() !== sValue)) {
				this._$input.val(sValue);
				this._$input.cursorPos(this._curpos);
			}
	
			// update synthetic placeholder visibility
			this._setLabelVisibility();
	
			return this;
		};
	
		DatePicker.prototype._parseValue = function(sValue, bDisplayFormat) {
	
			var oFormat;
			var that = this;
	
			oFormat = _getFormatter(that, bDisplayFormat);
	
			// convert to date object
			var oDate = oFormat.parse(sValue);
			return oDate;
	
		};
	
		// converts the date to the output format, but if bValueFormat set it converts it to the input format
		DatePicker.prototype._formatValue = function(oDate, bValueFormat) {
	
			var sValue = "";
	
			if (oDate) {
				var oFormat;
				var that = this;
	
				oFormat = _getFormatter(that, !bValueFormat);
				// convert to date object
				sValue = oFormat.format(oDate);
			}
	
			return sValue;
	
		};
	
		DatePicker.prototype._getPlaceholder = function() {
	
			var sPlaceholder = this.getPlaceholder();
	
			if (!sPlaceholder) {
				var oBinding = this.getBinding("value");
	
				if (oBinding && oBinding.oType && (oBinding.oType instanceof Date1)) {
					sPlaceholder = oBinding.oType.getOutputPattern();
				} else {
					sPlaceholder = this.getDisplayFormat();
				}
	
				if (!sPlaceholder) {
					sPlaceholder = "medium";
				}
	
				if (sPlaceholder == "short" || sPlaceholder == "medium" || sPlaceholder == "long") {
					var oLocale = sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale();
					var oLocaleData = sap.ui.core.LocaleData.getInstance(oLocale);
					sPlaceholder = oLocaleData.getDatePattern(sPlaceholder);
				}
			}
	
			return sPlaceholder;
	
		};
	
		function _open(oThis){
	
			if (!oThis._oPopup) {
				jQuery.sap.require("sap.ui.core.Popup");
				oThis._oPopup = new sap.ui.core.Popup();
				oThis._oPopup.setAutoClose(true);
				oThis._oPopup.setDurations(0, 0); // no animations
				oThis._oPopup.attachOpened(_handleOpened, oThis);
	//			oThis._oPopup.attachClosed(_handleClosed, oThis);
			}
	
			if (!oThis._oCalendar) {
				sap.ui.getCore().loadLibrary("sap.ui.unified");
				jQuery.sap.require("sap.ui.unified.library");
				oThis._oCalendar = new sap.ui.unified.Calendar(oThis.getId() + "-cal", {intervalSelection: oThis._bIntervalSelection});
				oThis._oDateRange = new sap.ui.unified.DateRange();
				oThis._oCalendar.addSelectedDate(oThis._oDateRange);
				oThis._oCalendar.attachSelect(oThis._selectDate, oThis);
				oThis._oCalendar.attachCancel(_cancel, oThis);
				oThis._oCalendar.attachEvent("_renderMonth", _resizeCalendar, oThis);
				oThis._oPopup.setContent(oThis._oCalendar);
				if (oThis.$().closest(".sapUiSizeCompact").length > 0) {
					oThis._oCalendar.addStyleClass("sapUiSizeCompact");
				}
				oThis._oCalendar.setPopupMode(true);
				oThis._oCalendar.setParent(oThis, undefined, true); // don't invalidate DatePicker
			}
	
			oThis.onChange(); // to check manually typed in text
	
			oThis._fillDateRange();
	
			oThis._oPopup.setAutoCloseAreas([oThis.getDomRef()]);
	
			var eDock = sap.ui.core.Popup.Dock;
			var sAt;
			if (oThis.getTextAlign() == sap.ui.core.TextAlign.End) {
				sAt = eDock.EndBottom + "-4"; // as m.Input has some padding around
				oThis._oPopup.open(0, eDock.EndTop, sAt, oThis, null, "fit", true);
			}else {
				sAt = eDock.BeginBottom + "-4"; // as m.Input has some padding around
				oThis._oPopup.open(0, eDock.BeginTop, sAt, oThis, null, "fit", true);
			}
	
		}
	
		DatePicker.prototype._fillDateRange = function(){
	
			var oDate = this.getDateValue();
	
			if (oDate) {
				this._oCalendar.focusDate(new Date(oDate.getTime()));
				if (!this._oDateRange.getStartDate() || this._oDateRange.getStartDate().getTime() != oDate.getTime()) {
					this._oDateRange.setStartDate(new Date(oDate.getTime()));
				}
			} else if (this._oDateRange.getStartDate()) {
				this._oDateRange.setStartDate(undefined);
			}
	
		};
	
		function _toggleOpen(oThis){
	
			if (oThis.getEditable() && oThis.getEnabled()) {
				if (!oThis._oPopup || !oThis._oPopup.isOpen()) {
					_open(oThis);
				} else {
					oThis._oPopup.close();
				}
			}
	
		}
	
		DatePicker.prototype._selectDate = function(oEvent){
	
			var aSelectedDates = this._oCalendar.getSelectedDates();
			var oDateOld = this.getDateValue();
			var oDate;
	
			this._oPopup.close();
			this._bFocusNoPopup = true;
			this.focus();

			if (aSelectedDates.length > 0) {
				oDate = aSelectedDates[0].getStartDate();
			}
			this.setDateValue(oDate);
		
			// do not use this.onChange() because output pattern will change date (e.g. only last 2 number of year -> 1966 -> 2066 )
			if (!jQuery.sap.equal(oDate, oDateOld)) {
				// compare Dates because value can be the same if only 2 digits for year 
				var sValue = this.getValue();
				this.fireChangeEvent(sValue, {valid: true});
				this._curpos = this._$input.val().length;
				this._$input.cursorPos(this._curpos);
			}
	
		};
	
		function _cancel(oEvent) {
	
			if (this._oPopup && this._oPopup.isOpen()) {
				this._oPopup.close();
				this._bFocusNoPopup = true;
				this.focus();
			}
	
		}
	/*
		function _handleClosed(oEvent) {
	
	
		};
	*/
		function _incraseDate(oThis, iNumber, sUnit) {
	
			var oOldDate = oThis.getDateValue();
			var iCurpos = oThis._$input.cursorPos();
	
			if (oOldDate && oThis.getEditable() && oThis.getEnabled()) {
				// use a new date object to have a real updated property
				var oDate = new Date(oOldDate.getTime());
	
				switch (sUnit) {
				case "day":
					oDate.setDate(oDate.getDate() + iNumber);
					break;
				case "month":
					oDate.setMonth(oDate.getMonth() + iNumber);
					break;
				case "year":
					oDate.setFullYear(oDate.getFullYear() + iNumber);
					break;
	
				default:
					break;
				}
	
				oThis.setDateValue(oDate);
	
				oThis._curpos = iCurpos;
				oThis._$input.cursorPos(oThis._curpos);
	
				var sValue = oThis._getInputValue();
				oThis.fireChangeEvent(sValue, {valid: true});
			}
	
		}
	
		function _onInput(oEvent){
	
			// do not use sap.m.InputBase.prototype._setLabelVisibility because value is not updated during typing
			if (this.getDomRef() && this._$label) {
				var sValue = this._$input.val();
				this._$label.css("display", sValue ? "none" : "inline");
			}
	
		}
	
		function _handleOpened(oEvent) {
	
			this._renderedDays = this._oCalendar.$("days").children(".sapUiCalDay").length;
	
		}
	
		function _resizeCalendar(oEvent){
	
			var iDays = oEvent.getParameter("days");
	
			if (iDays > this._renderedDays) {
				// calendar gets larger, so it could move out of the page -> reposition
				this._renderedDays = iDays;
				this._oPopup._applyPosition(this._oPopup._oLastPosition);
			}
	
		}
	
	
		function _getFormatter(oThis, bDisplayFormat) {
	
			var sPattern = "";
			var bRelative = false;
			var oFormat;
			var oBinding = oThis.getBinding("value");
	
			if (oBinding && oBinding.oType && (oBinding.oType instanceof Date1)) {
				sPattern = oBinding.oType.getOutputPattern();
				bRelative = !!oBinding.oType.oOutputFormat.oFormatOptions.relative;
			}
	
			if (!sPattern) {
				// not databinding is used -> use given format
				if (bDisplayFormat) {
					sPattern = ( oThis.getDisplayFormat() || "medium" );
				} else {
					sPattern = ( oThis.getValueFormat() || "short" );
				}
			}
	
			if (bDisplayFormat) {
				if (sPattern == oThis._sUsedDisplayPattern) {
					oFormat = oThis._sDisplayFormat;
				}
			} else {
				if (sPattern == oThis._sUsedValuePattern) {
					oFormat = oThis._sValueFormat;
				}
			}
	
			if (!oFormat) {
				if (sPattern == "short" || sPattern == "medium" || sPattern == "long") {
					oFormat = sap.ui.core.format.DateFormat.getInstance({style: sPattern, strictParsing: true, relative: bRelative});
				} else {
					oFormat = sap.ui.core.format.DateFormat.getInstance({pattern: sPattern, strictParsing: true, relative: bRelative});
				}
				if (bDisplayFormat) {
					oThis._sUsedDisplayPattern = sPattern;
					oThis._sDisplayFormat = oFormat;
				} else {
					oThis._sUsedValuePattern = sPattern;
					oThis._sValueFormat = oFormat;
				}
			}
	
			return oFormat;
	
		}
	
	}());
	
	/**
	 * This event gets fired when the input operation has finished and the value has changed.
	 *
	 * @name sap.m.DatePicker#change
	 * @event
	 * @param {sap.ui.base.Event} oControlEvent
	 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
	 * @param {object} oControlEvent.getParameters
	 * @param {string} oControlEvent.getParameters.value The new value of the input.
	 * @param {boolean} oControlEvent.getParameters.valid Indicator for a valid date.
	 * @public
	 */
	
	 /**
	 * Fire event change to attached listeners.
	 *
	 * Expects following event parameters:
	 * <ul>
	 * <li>'value' of type <code>string</code> The new value of the input.</li>
	 * <li>'valid' of type <code>boolean</code> Indicator for a valid date.</li>
	 * </ul>
	 *
	 * @param {Map} [mArguments] the arguments to pass along with the event.
	 * @return {sap.m.DatePicker} <code>this</code> to allow method chaining
	 * @protected
	 * @name sap.m.DatePicker#fireChange
	 * @function
	 */
	

	return DatePicker;

}, /* bExport= */ true);
