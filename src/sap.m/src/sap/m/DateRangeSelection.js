/*!
 * ${copyright}
 */

// Provides control sap.m.DateRangeSelection.
sap.ui.define(['jquery.sap.global', './DatePicker', './library'],
	function(jQuery, DatePicker, library) {
	"use strict";

	/**
	 * Constructor for a new DateRangeSelection.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * This is a date range selection control. It internal uses the sap.ui.unified.Calendar. So the sap.ui.unified library should be loaded from applications using this control.
	 * @extends sap.m.DatePicker
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.DateRangeSelection
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var DateRangeSelection = DatePicker.extend("sap.m.DateRangeSelection", /** @lends sap.m.DateRangeSelection.prototype */ { metadata : {

		library : "sap.m",
		properties : {

			/**
			 * Delimiter of starting and ending date. Default value is "-".
			 * If no delimiter is given the one defined for the used locale is used.
			 */
			delimiter : {type : "string", group : "Misc", defaultValue : '-'},

			/**
			 * Ending date of the range.
			 */
			secondDateValue : {type : "object", group : "Data", defaultValue : null},

			/**
			 * Starting date of the range.
			 * @deprecated Since version 1.22. 
			 * Former property for starting date - since next release will be not supported. Use dateValue instead.
			 */
			from : {type : "object", group : "Misc", defaultValue : null, deprecated: true},

			/**
			 * Ending date of the range.
			 * @deprecated Since version 1.22. 
			 * Former property for ending date - since next release will be not supported. Use secondDateValue instead.
			 */
			to : {type : "object", group : "Misc", defaultValue : null, deprecated: true}
		},
		events : {

			/**
			 * Event thrown in case of change of date range.
			 */
			change : {
				parameters : {

					/**
					 * Current starting date after change.
					 */
					from : {type : "object"}, 

					/**
					 * Current ending date after change.
					 */
					to : {type : "object"}
				}
			}
		}
	}});

	/**
	 * This file defines behavior for the control
	 * @public
	 */

	(function() {
		/* eslint-disable no-lonely-if */

		DateRangeSelection.prototype.init = function(){

			DatePicker.prototype.init.apply(this, arguments);

			this._bIntervalSelection = true;

		};

		DateRangeSelection.prototype.onkeypress = function(oEvent){

			// the keypress event should be fired only when a character key is pressed,
			// unfortunately some browsers fire the keypress event for control keys as well.
			if (!oEvent.charCode || oEvent.metaKey || oEvent.ctrlKey) {
				return;
			}

			var that = this;
			var oFormatter = _getFormatter(that);
			var sDelimiter = _getDelimiter(that);
			var sAllowedCharacters = oFormatter.sAllowedCharacters + sDelimiter + " ";
			var sChar = String.fromCharCode(oEvent.charCode);

			if (sChar && oFormatter.sAllowedCharacters && sAllowedCharacters.indexOf(sChar) < 0) {
				oEvent.preventDefault();
			}
		};

		DateRangeSelection.prototype._getPlaceholder = function() {
			var sPlaceholder = this.getPlaceholder();

			if (!sPlaceholder) {
				sPlaceholder = this.getDisplayFormat();

				if (!sPlaceholder) {
					sPlaceholder = "medium";
				}

				if (sPlaceholder === "short" || sPlaceholder === "medium" || sPlaceholder === "long") {
					var oLocale = sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale();
					var oLocaleData = sap.ui.core.LocaleData.getInstance(oLocale);
					sPlaceholder = oLocaleData.getDatePattern(sPlaceholder);
				}

				var that = this;
				var sDelimiter = _getDelimiter(that);
				if (sDelimiter && sDelimiter !== "") {
					sPlaceholder = sPlaceholder + " " + sDelimiter + " " + sPlaceholder;
				}
			}

			return sPlaceholder;
		};

		// Overwrite DatePicker's setValue to support two date range processing
		DateRangeSelection.prototype.setValue = function(sValue) {

			if (sValue !== this.getValue()) {
				this._lastValue = sValue;
			} else {
				return this;
			}
			// Set the property in any case but check validity on output
			this.setProperty("value", sValue, true);
			this._bValid = true;

			// Convert to date object(s)
			var aDates = [undefined, undefined];

			if (sValue) {
				aDates = this._parseValue(sValue);
				aDates = _dateRangeValidityCheck(this, aDates[0], aDates[1]);
				if (!aDates[0]) {
					this._bValid = false;
					jQuery.sap.log.warning("Value can not be converted to a valid dates", this);
				}
			}
			if (this._bValid) {
				this.setProperty("dateValue", aDates[0], true);
				this.setProperty("secondDateValue", aDates[1], true);
			}

			// Do not call InputBase.setValue because the displayed value and the output value might have different pattern
			if (this.getDomRef()) {
				// Convert to output
				var sOutputValue = this._formatValue(aDates[0], aDates[1]);

				if (this._$input.val() !== sOutputValue) {
					this._$input.val(sOutputValue);
					this._setLabelVisibility();
					this._curpos = this._$input.cursorPos();
				}
			}

			return this;

		};

		//Following setters/getters are due to backward compatibility with original primary version of composite sap.m.DateRangeSelection,
		//that consisted of original primary sap.m.DateRangeSelection
		DateRangeSelection.prototype.setFrom = function(oFrom) {
			this.setDateValue(oFrom);
		};

		DateRangeSelection.prototype.getFrom = function() {
			return this.getDateValue();
		};

		DateRangeSelection.prototype.setTo = function(oTo) {
			this.setSecondDateValue(oTo);
		};

		DateRangeSelection.prototype.getTo = function() {
			return this.getSecondDateValue();
		};

		// Overwrite DatePicker's setDateValue to support two date range processing

		/**
		 * Setter for property <code>dateValue</code>.
		 *
		 * Starting date of the range.
		 * Default value is empty/undefined
		 *
		 * @param {object} oDateValue new value for property dateValue
		 * @returns {sap.m.DateRangeSelection} <code>this</code> to allow method chaining.
		 * @protected
		 */
		DateRangeSelection.prototype.setDateValue = function(oDateValue) {

			if (jQuery.sap.equal(this.getDateValue(), oDateValue)) {
				return this;
			}

			if (oDateValue && (oDateValue.getTime() < this._oMinDate.getTime() || oDateValue.getTime() > this._oMaxDate.getTime())) {
				this._bValid = false;
				jQuery.sap.assert(this._bValid, "Date must be in valid range");
			}else {
				this._bValid = true;
				this.setProperty("dateValue", oDateValue, true); // no rerendering
			}

			var oSecondDateValue = this.getSecondDateValue();
			// Convert date object(s) to value
			var sValue = this._formatValue(oDateValue, oSecondDateValue);

			if (sValue !== this.getValue()) {
				this._lastValue = sValue;
			}
			// Set the property in any case but check validity on output
			this.setProperty("value", sValue, true);

			if (this.getDomRef()) {
				// convert to output
				var sOutputValue = this._formatValue(oDateValue, oSecondDateValue);

				if (this._$input.val() !== sOutputValue) {
					this._$input.val(sOutputValue);
					this._setLabelVisibility();
					this._curpos = this._$input.cursorPos();
				}
			}

			return this;

		};

		DateRangeSelection.prototype.setSecondDateValue = function(oSecondDateValue) {

			if (jQuery.sap.equal(this.getSecondDateValue(), oSecondDateValue)) {
				return this;
			}

			if (oSecondDateValue && (oSecondDateValue.getTime() < this._oMinDate.getTime() || oSecondDateValue.getTime() > this._oMaxDate.getTime())) {
				this._bValid = false;
				jQuery.sap.assert(this._bValid, "Date must be in valid range");
			}else {
				this._bValid = true;
				this.setProperty("secondDateValue", oSecondDateValue, true); // no rerendering
			}

			var oDateValue = this.getDateValue();
			// Convert date object(s) to value
			var sValue = this._formatValue(oDateValue, oSecondDateValue);

			if (sValue !== this.getValue()) {
				this._lastValue = sValue;
			}
			// Set the property in any case but check validity on output
			this.setProperty("value", sValue, true);

			if (this.getDomRef()) {
				// convert to output
				var sOutputValue = this._formatValue(oDateValue, oSecondDateValue);

				if (this._$input.val() !== sOutputValue) {
					this._$input.val(sOutputValue);
					this._setLabelVisibility();
					this._curpos = this._$input.cursorPos();
				}
			}

			return this;
		};

		//Support of two date range version added into original DatePicker's version
		DateRangeSelection.prototype._parseValue = function(sValue) {

			var oFormat;
			var aDates = [];
			var oDate1, oDate2;

			//If we have version of control with delimiter, then sValue should consist of two dates delimited with delimiter,
			//hence we have to split the value to these dates
			var that = this;
			var sDelimiter = _getDelimiter(that);
			if ((sDelimiter && sDelimiter !== "") && sValue) {
				aDates = sValue.split(sDelimiter);
				if (aDates.length === 2) {
					// if delimiter only appears once in value (not part of date pattern) remove " " to be more flexible for input
					if (aDates[0].slice(aDates[0].length - 1,aDates[0].length) == " ") {
						aDates[0] = aDates[0].slice(0, aDates[0].length - 1);
					}
					if (aDates[1].slice(0,1) == " ") {
						aDates[1] = aDates[1].slice(1);
					}
				} else {
					aDates = sValue.split(" " + sDelimiter + " ");// Delimiter appears more than once -> try with separators
				}
				if (aDates.length < 2) {
					// no delimiter found -> maybe only " " is used
					var aDates2 = sValue.split(" ");
					if (aDates2.length === 2) {
						aDates = aDates2;
					}
				}
			}

			if (sValue && aDates.length <= 2) {

				oFormat = _getFormatter(that);

				//Convert to date object(s)
				if ((!sDelimiter || sDelimiter === "") || aDates.length === 1) {
					oDate1 = oFormat.parse(sValue);
				} else if (aDates.length === 2) {
					oDate1 = oFormat.parse(aDates[0]);
					oDate2 = oFormat.parse(aDates[1]);
					if (!oDate1 || !oDate2) {
						// at least one date can not be parsed -> whole value is incorrect
						oDate1 = undefined;
						oDate2 = undefined;
					}
				}
			}

			return [oDate1, oDate2];

		};

		//Support of two date range version added into original DatePicker's version
		DateRangeSelection.prototype._formatValue = function(oDateValue, oSecondDateValue) {

			var sValue = "";
			var that = this;
			var sDelimiter = _getDelimiter(that);

			if (oDateValue) {
				var oFormat;

				oFormat = _getFormatter(that);

				if (sDelimiter && sDelimiter !== "" && oSecondDateValue) {
					sValue = oFormat.format(oDateValue) + " " + sDelimiter + " " + oFormat.format(oSecondDateValue);
				} else {
					sValue = oFormat.format(oDateValue);
				}
			}

			return sValue;

		};

		DateRangeSelection.prototype.onChange = function() {

			// check the control is editable or not
			if (!this.getEditable() || !this.getEnabled()) {
				return;
			}

			var sValue = this._$input.val();
			var aDates = [undefined, undefined];
			this._bValid = true;
			if (sValue != "") {
				aDates = this._parseValue(sValue);
				aDates = _dateRangeValidityCheck(this, aDates[0], aDates[1]);
				if (aDates[0]) {
					sValue = this._formatValue( aDates[0], aDates[1] ); // to have the right output format if entered different
				} else {
					this._bValid = false;
				}
			}

			if (sValue !== this._lastValue) {
				if (this.getDomRef() && (this._$input.val() !== sValue)) {
					this._$input.val(sValue);
					this._curpos = this._$input.cursorPos();
				}
				this.setProperty("value", sValue, true);
				if (this._bValid) {
					this.setProperty("dateValue", aDates[0], true);
					this.setProperty("secondDateValue", aDates[1], true);
				}
				this._setLabelVisibility();
				this._lastValue = sValue;

				if (this._oPopup && this._oPopup.isOpen()) {

					var oStartDate = this.getDateValue();
					if (oStartDate) {
						if (!this._oDateRange.getStartDate() || this._oDateRange.getStartDate().getTime() !== oStartDate.getTime()) {
							this._oDateRange.setStartDate(new Date(oStartDate));
							this._oCalendar.focusDate(oStartDate);
						}
					} else {
						if (this._oDateRange.getStartDate()) {
							this._oDateRange.setStartDate(undefined);
						}
					}

					var oEndDate = this.getSecondDateValue();
					if (oEndDate) {
						if (!this._oDateRange.getEndDate() || this._oDateRange.getEndDate().getTime() !== oEndDate.getTime()) {
							this._oDateRange.setEndDate(new Date(oEndDate));
							this._oCalendar.focusDate(oEndDate);
						}
					} else {
						if (this._oDateRange.getEndDate()) {
							this._oDateRange.setEndDate(undefined);
						}
					}
				}

				var that = this;
				_fireChange(that, this._bValid);

			}

		};

		// Overwrite DatePicker's _getInputValue  to support two date range processing
		DateRangeSelection.prototype._getInputValue = function(sValue) {

			sValue = (typeof sValue == "undefined") ? this._$input.val() : sValue.toString();

			var aDates = this._parseValue(sValue);
			sValue = this._formatValue( aDates[0], aDates[1]);

			return sValue;

		};

		// overwrite _getInputValue to do the output conversion
		DateRangeSelection.prototype.updateDomValue = function(sValue) {

			// dom value updated other than value property
			this._bCheckDomValue = true;

			sValue = (typeof sValue == "undefined") ? this._$input.val() : sValue.toString();
			this._curpos = this._$input.cursorPos();

			var aDates = this._parseValue(sValue);
			sValue = this._formatValue( aDates[0], aDates[1]);

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

		// overwrite InputBase function because this calls _getInputValue what calls _parseValue what updates the properties
		// This should be redesigned at all, because parsing should not update the properties in every case
		DateRangeSelection.prototype._setLabelVisibility = function() {

			if (!this.bShowLabelAsPlaceholder || !this._$label || !this.isActive()) {
				return;
			}

			var sValue = this._$input.val();
			this._$label.css("display", sValue ? "none" : "inline");

		};

		//Do nothing in case of PageUp
		DateRangeSelection.prototype.onsappageup = function(){}; //EXC_JSLINT_021
		DateRangeSelection.prototype.onsappageupmodifiers = function(){}; //EXC_JSLINT_021

		//Do nothing in case of PageDown
		DateRangeSelection.prototype.onsappagedown = function(){}; //EXC_JSLINT_021
		DateRangeSelection.prototype.onsappagedownmodifiers = function(){}; //EXC_JSLINT_021

		//Support of two date range version of Calendar added into original DatePicker's version
		DateRangeSelection.prototype._fillDateRange = function(){

			DatePicker.prototype._fillDateRange.apply(this, arguments);

			var oEndDate = this.getSecondDateValue();

			if (oEndDate) {
				if (!this._oDateRange.getEndDate() || this._oDateRange.getEndDate().getTime() !== oEndDate.getTime()) {
					this._oDateRange.setEndDate(new Date(oEndDate));
				}
			} else {
				if (this._oDateRange.getEndDate()) {
					this._oDateRange.setEndDate(undefined);
				}
			}

		};

		DateRangeSelection.prototype._selectDate = function(oEvent){

			var aSelectedDates = this._oCalendar.getSelectedDates();

			if (aSelectedDates.length > 0) {
				var oDate1 = aSelectedDates[0].getStartDate();
				var oDate2 = aSelectedDates[0].getEndDate();

				if (oDate1 && oDate2) {
					var oDate1Old = this.getDateValue();
					var oDate2Old = this.getSecondDateValue();

					this._oPopup.close();
					this._bFocusNoPopup = true;
					this.focus();

					var sValue;
					var that = this;
					if (!jQuery.sap.equal(oDate1, oDate1Old) || !jQuery.sap.equal(oDate2, oDate2Old)) {
						// compare Dates because value can be the same if only 2 digits for year
						if (jQuery.sap.equal(oDate2, oDate2Old)) {
							this.setDateValue(oDate1);
						} else {
							this.setProperty("dateValue", oDate1, true); // no rerendering
							this.setSecondDateValue(oDate2);
						}

						sValue = this.getValue();
						_fireChange(that, true);
						this._curpos = sValue.length;
						this._$input.cursorPos(this._curpos);
					}else if (!this._bValid){
						// wrong input before open calendar
						sValue = this._formatValue( oDate1, oDate2 );
						if (sValue != this._$input.val()) {
							this._bValid = true;
							if (this.getDomRef()) { // as control could be destroyed during update binding
								this._$input.val(sValue);
							}
							_fireChange(that, true);
						}
					}

					//To prevent opening keyboard on mobile device after dates are selected
					if (sap.ui.Device.browser.mobile) {
						window.document.activeElement.blur();
					}
				}
			}
		};

		function _fireChange(oThis, bValid) {

			oThis.fireChangeEvent(oThis.getValue(), {
				from: oThis.getDateValue(),
				to: oThis.getSecondDateValue(),
				valid: bValid
			});

		}

		function _dateRangeValidityCheck(oThis, oDate, oSecondDate) {

			if (oDate && oSecondDate && oDate.getTime() > oSecondDate.getTime()) {
				// dates are in wrong oder -> just switch
				var oTmpDate = oDate;
				oDate = oSecondDate;
				oSecondDate = oTmpDate;
			}

			if ((oDate && ( oDate.getTime() < oThis._oMinDate.getTime() || oDate.getTime() > oThis._oMaxDate.getTime())) ||
					(oSecondDate && ( oSecondDate.getTime() < oThis._oMinDate.getTime() || oSecondDate.getTime() > oThis._oMaxDate.getTime()))) {
				return [undefined, undefined];
			}else {
				return [oDate, oSecondDate];
			}

		}

		function _getDelimiter(oThis) {

			var sDelimiter = oThis.getDelimiter();

			if (!sDelimiter) {
				if (!oThis._sLocaleDelimiter) {
					var oLocale = sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale();
					var oLocaleData = sap.ui.core.LocaleData.getInstance(oLocale);
					var sPattern = oLocaleData.getIntervalPattern();
					var iIndex1 = sPattern.indexOf("{0}") + 3;
					var iIndex2 = sPattern.indexOf("{1}");
					sDelimiter = sPattern.slice(iIndex1, iIndex2);
					if (sDelimiter.length > 1) {
						if (sDelimiter.slice(0,1) == " ") {
							sDelimiter = sDelimiter.slice(1);
						}
						if (sDelimiter.slice(sDelimiter.length - 1,sDelimiter.length) == " ") {
							sDelimiter = sDelimiter.slice(0, sDelimiter.length - 1);
						}
					}
					oThis._sLocaleDelimiter = sDelimiter;
				} else {
					sDelimiter = oThis._sLocaleDelimiter;
				}
			}

			return sDelimiter;

		}

		function _getFormatter(oThis) {

			var sPattern = ( oThis.getDisplayFormat() || "medium" );
			var oFormat;

			if (sPattern == oThis._sUsedDisplayPattern) {
				oFormat = oThis._sDisplayFormat;
			} else {
				if (sPattern === "short" || sPattern === "medium" || sPattern === "long") {
					oFormat = sap.ui.core.format.DateFormat.getInstance({style: sPattern, strictParsing: true});
				} else {
					oFormat = sap.ui.core.format.DateFormat.getInstance({pattern: sPattern, strictParsing: true});
				}
				oThis._sUsedDisplayPattern = sPattern;
				oThis._sDisplayFormat = oFormat;
			}

			return oFormat;

		}

		//	to overwrite JS doc

		/**
		 * Getter for property <code>dateValue</code>.
		 *
		 * Starting date of the range.
		 * Default value is empty/undefined
		 *
		 * @returns {object} the value of property secondDateValue
		 * @protected
		 * @name sap.m.DateRangeSelection#getDateValue
		 * @function
		 */

		/**
		 * Setter for property <code>valueFormat</code>.
		 *
		 * Property <code>valueFormat</code> is not supported in <code>sap.m.DateRangeSelection</code> control.
		 *
		 * @protected
		 * @name sap.m.DateRangeSelection#setValueFormat
		 * @function
		 */

		/**
		 * Getter for property <code>valueFormat</code>.
		 *
		 * Property <code>valueFormat</code> is not supported in <code>sap.m.DateRangeSelection</code> control.
		 *
		 * @protected
		 * @name sap.m.DateRangeSelection#getValueFormat
		 * @function
		 */

		/**
		 * On change of date range event.
		 *
		 * @name sap.m.DateRangeSelection#change
		 * @event
		 * @param {sap.ui.base.Event} oControlEvent
		 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
		 * @param {object} oControlEvent.getParameters
		 * @param {string} oControlEvent.getParameters.value The new value of the input.
		 * @param {boolean} oControlEvent.getParameters.valid Indicator for a valid date.
		 * @param {object} oControlEvent.getParameters.from Current starting date after change.
		 * @param {object} oControlEvent.getParameters.to Current ending date after change.
		 * @public
		 */

		 /**
		 * Fire event change to attached listeners.
		 *
		 * Expects following event parameters:
		 * <ul>
		 * <li>'value' of type <code>string</code> The new value of the input.</li>
		 * <li>'valid' of type <code>boolean</code> Indicator for a valid date.</li>
		 * <li>'from' of type <code>object</code> Current starting date after change-</li>
		 * <li>'to' of type <code>object</code> Current ending date after change.</li>
		 * </ul>
		 *
		 * @param {Map} [mArguments] the arguments to pass along with the event.
		 * @return {sap.m.DateRangeSelection} <code>this</code> to allow method chaining
		 * @protected
		 * @name sap.m.DateRangeSelection#fireChange
		 * @function
		 */
	}());

	return DateRangeSelection;

}, /* bExport= */ true);
