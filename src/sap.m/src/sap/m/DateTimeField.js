/*!
 * ${copyright}
 */

// Provides control sap.m.DateTimeField.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/model/type/Date',
	'sap/ui/model/odata/type/ODataType',
	'./InputBase'
], function (jQuery, SimpleDateType, ODataType, InputBase) {
	"use strict";

	/**
	 * Constructor for a new <code>sap.m.DateTimeField</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The <code>sap.m.DateTimeField</code> control provides a basic functionality for date/time input controls.
	 * @abstract
	 * To be extended by date and time picker controls. For internal use only.
	 *
	 * @extends sap.m.InputBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.50.0
	 * @alias sap.m.DateTimeField
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var DateTimeField = InputBase.extend("sap.m.DateTimeField", /** @lends sap.m.DateTimeField.prototype */ {
		metadata: {
			"abstract" : true,
			library: "sap.m",
			properties: {
				/**
				 * Determines the format, displayed in the input field.
				 */
				displayFormat: {type: "string", group: "Appearance", defaultValue: null},

				/**
				 * Determines the format of the value property.
				 */
				valueFormat: {type: "string", group: "Data", defaultValue: null},

				/**
				 * Holds a reference to a JavaScript Date Object. The <code>value</code> (string)
				 * property will be set according to it. Alternatively, if the <code>value</code>
				 * and <code>valueFormat</code> pair properties are supplied instead,
				 * the <code>dateValue</code> will be instantiated according to the parsed
				 * <code>value</code>.
				 */
				dateValue: {type: "object", group: "Data", defaultValue: null}
			}
		}
	});

	DateTimeField.prototype.setValue = function (sValue) {

		sValue = this.validateProperty("value", sValue); // to convert null and undefined to ""

		var sOldValue = this.getValue();
		if (sValue === sOldValue) {
			return this;
		} else {
			this._lastValue = sValue;
		}

		// set the property in any case but check validity on output
		this.setProperty("value", sValue, true); // no rerendering
		this._bValid = true;

		// convert to date object
		var oDate;
		if (sValue) {
			oDate = this._parseValue(sValue);
			if (!oDate || oDate.getTime() < this._oMinDate.getTime() || oDate.getTime() > this._oMaxDate.getTime()) {
				this._bValid = false;
				jQuery.sap.log.warning("Value can not be converted to a valid date", this);
				this._oWantedDate = oDate;
			}
		}
		if (this._bValid) {
			this.setProperty("dateValue", oDate, true); // no rerendering
			this._oWantedDate = undefined;
		}

		// do not call InputBase.setValue because the displayed value and the output value might have different pattern
		if (this.getDomRef()) {
			// convert to output
			var sOutputValue;
			if (oDate) {
				sOutputValue = this._formatValue(oDate);
			} else {
				sOutputValue = sValue;
			}

			if (this._$input.val() !== sOutputValue) {
				this._$input.val(sOutputValue);
				this._curpos = this._$input.cursorPos();
			}
		}

		return this;
	};

	DateTimeField.prototype.setDateValue = function (oDate) {

		if (oDate && !(oDate instanceof Date)) {
			throw new Error("Date must be a JavaScript date object; " + this);
		}

		if (jQuery.sap.equal(this.getDateValue(), oDate)) {
			return this;
		}

		oDate = this._dateValidation(oDate);

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

	DateTimeField.prototype.setValueFormat = function (sValueFormat) {
		// if valueFormat changes the value must be parsed again
		this.setProperty("valueFormat", sValueFormat, true); // no rerendering

		var sValue = this.getValue();

		if (sValue) {
			this._handleDateValidation(this._parseValue(sValue));
		}

		return this;
	};

	DateTimeField.prototype.setDisplayFormat = function (sDisplayFormat) {

		this.setProperty("displayFormat", sDisplayFormat, true); // no rerendering

		this.updateDomValue(this._formatValue(this.getDateValue()));

		return this;
	};

	DateTimeField.prototype.getDisplayFormatType = function () {
		return null;
	};

	DateTimeField.prototype._dateValidation = function (oDate) {
		this._bValid = true;
		this.setProperty("dateValue", oDate, true); // no rerendering

		return oDate;
	};

	DateTimeField.prototype._handleDateValidation = function (oDate) {
		this._bValid = true;
		this.setProperty("dateValue", oDate, true); // no rerendering
	};

	DateTimeField.prototype._getPlaceholder = function() {

		var sPlaceholder = this.getPlaceholder();

		if (!sPlaceholder) {
			sPlaceholder = this._getDisplayFormatPattern();

			if (!sPlaceholder) {
				sPlaceholder = this._getDefaultDisplayStyle();
			}

			if (this._checkStyle(sPlaceholder)) {
				var oLocale = sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale();
				var oLocaleData = sap.ui.core.LocaleData.getInstance(oLocale);
				sPlaceholder = this._getPlaceholderPattern(oLocaleData, sPlaceholder);
			}
		}

		return sPlaceholder;

	};

	DateTimeField.prototype._getPlaceholderPattern = function (oLocaleData, sPlaceholder) {
		return oLocaleData.getDatePattern(sPlaceholder);
	};


	DateTimeField.prototype._parseValue = function (sValue, bDisplayFormat) {
		return this._getFormatter(bDisplayFormat).parse(sValue);
	};

	DateTimeField.prototype._formatValue = function (oDate, bValueFormat) {
		if (oDate) {
			return this._getFormatter(!bValueFormat).format(oDate);
		}

		return "";
	};

	DateTimeField.prototype._getDefaultDisplayStyle = function () {
		return "medium";
	};

	DateTimeField.prototype._getDefaultValueStyle = function () {
		return "short";
	};

	DateTimeField.prototype._getFormatter = function (bDisplayFormat) {
		var sPattern = this._getBoundValueTypePattern(),
			bRelative = false, // if true strings like "Tomorrow" are parsed fine
			oFormat,
			oBinding = this.getBinding("value"),
			sCalendarType;

		if (oBinding && oBinding.oType && oBinding.oType.oOutputFormat) {
			bRelative = !!oBinding.oType.oOutputFormat.oFormatOptions.relative;
			sCalendarType = oBinding.oType.oOutputFormat.oFormatOptions.calendarType;
		}

		/* eslint-disable no-lonely-if */
		if (!sPattern) {
			// not databinding is used -> use given format
			if (bDisplayFormat) {
				sPattern = ( this.getDisplayFormat() || this._getDefaultDisplayStyle() );
				sCalendarType = this.getDisplayFormatType();
			} else {
				sPattern = ( this.getValueFormat() || this._getDefaultValueStyle() );
				sCalendarType = sap.ui.core.CalendarType.Gregorian;
			}
		}

		if (!sCalendarType) {
			sCalendarType = sap.ui.getCore().getConfiguration().getCalendarType();
		}

		if (bDisplayFormat) {
			if (sPattern === this._sUsedDisplayPattern && sCalendarType === this._sUsedDisplayCalendarType) {
				oFormat = this._oDisplayFormat;
			}
		} else {
			if (sPattern === this._sUsedValuePattern && sCalendarType === this._sUsedValueCalendarType) {
				oFormat = this._oValueFormat;
			}
		}

		if (oFormat) {
			return oFormat;
		}

		return this._getFormatterInstance(oFormat, sPattern, bRelative, sCalendarType, bDisplayFormat);
	};

	DateTimeField.prototype._getFormatterInstance = function (oFormat, sPattern, bRelative, sCalendarType, bDisplayFormat) {

		if (this._checkStyle(sPattern)) {
			oFormat = this._getFormatInstance({style: sPattern, strictParsing: true, relative: bRelative, calendarType: sCalendarType}, bDisplayFormat);
		} else {
			oFormat = this._getFormatInstance({pattern: sPattern, strictParsing: true, relative: bRelative, calendarType: sCalendarType}, bDisplayFormat);
		}

		if (bDisplayFormat) {
			this._sUsedDisplayPattern = sPattern;
			this._sUsedDisplayCalendarType = sCalendarType;
			this._oDisplayFormat = oFormat;
		} else {
			this._sUsedValuePattern = sPattern;
			this._sUsedValueCalendarType = sCalendarType;
			this._oValueFormat = oFormat;
		}

		return oFormat;
	};

	DateTimeField.prototype._getFormatInstance = function (oArguments, bDisplayFormat) {
		return sap.ui.core.format.DateFormat.getInstance(oArguments);
	};

	DateTimeField.prototype._checkStyle = function (sPattern) {
		return (sPattern === "short" || sPattern === "medium" || sPattern === "long" || sPattern === "full");
	};

	DateTimeField.prototype._getDisplayFormatPattern = function () {
		return this._getBoundValueTypePattern() || this.getDisplayFormat();
	};

	DateTimeField.prototype._getBoundValueTypePattern = function () {
		var oBinding = this.getBinding("value"),
			oBindingType = oBinding && oBinding.getType && oBinding.getType();

		if (oBindingType instanceof SimpleDateType) {
			return oBindingType.getOutputPattern();
		}

		if (oBindingType instanceof ODataType && oBindingType.oFormat) {
			return oBindingType.oFormat.oFormatOptions.pattern;
		}

		return undefined;
	};


	return DateTimeField;

}, /* bExport= */ true);
