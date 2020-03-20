/*!
 * ${copyright}
 */

// Provides control sap.m.DateTimeField.
sap.ui.define([
	'sap/ui/model/type/Date',
	'sap/ui/model/odata/type/ODataType',
	'sap/ui/model/odata/type/DateTimeBase',
	'./InputBase',
	'sap/ui/core/LocaleData',
	'sap/ui/core/library',
	'sap/ui/core/format/DateFormat',
	'./DateTimeFieldRenderer',
	"sap/base/util/deepEqual",
	"sap/base/Log",
	"sap/ui/thirdparty/jquery",
	// jQuery Plugin "cursorPos"
	"sap/ui/dom/jquery/cursorPos"
], function(
	SimpleDateType,
	ODataType,
	DateTimeBase,
	InputBase,
	LocaleData,
	coreLibrary,
	DateFormat,
	DateTimeFieldRenderer,
	deepEqual,
	Log,
	jQuery
) {
	"use strict";

	// shortcut for sap.ui.core.CalendarType
	var CalendarType = coreLibrary.CalendarType;

	/**
	 * Constructor for a new <code>sap.m.DateTimeField</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The <code>sap.m.DateTimeField</code> control provides a basic functionality for date/time input controls.
	 *
	 * To be extended by date and time picker controls. For internal use only.
	 * @abstract
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
				 * Use <code>dateValue</code> as a helper property to easily obtain the day, month, year, hours, minutes
				 * and seconds of the chosen date and time. Although possible to bind it, the recommendation is not to do it.
				 * When binding is needed, use <code>value</code> property instead.
				 */
				dateValue: {type: "object", group: "Data", defaultValue: null},

				/**
				 * Holds a reference to a JavaScript Date Object to define the initially focused
				 * date/time when the picker popup is opened.
				 *
				 * <b>Notes:</b>
				 * <ul>
				 * <li>Setting this property does not change the <code>value</code> property.</li>
				 * <li>Depending on the context this property is used in ({@link sap.m.TimePicker},
				 * {@link sap.m.DatePicker} or {@link sap.m.DateTimePicker}), it takes into account only the time part, only
				 * the date part or both parts of the JavaScript Date Object.</li>
				 * </ul>
				 * @since 1.54
				 */
				initialFocusedDateValue: {type: "object", group: "Data", defaultValue: null}
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
		this.setProperty("value", sValue);
		this._bValid = true;

		// convert to date object
		var oDate;
		if (sValue) {
			oDate = this._parseValue(sValue);
			if (!oDate || oDate.getTime() < this._oMinDate.getTime() || oDate.getTime() > this._oMaxDate.getTime()) {
				this._bValid = false;
				Log.warning("Value can not be converted to a valid date", this);
			}
		}

		this.setProperty("dateValue", oDate);

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

		if (this._isValidDate(oDate)) {
			throw new Error("Date must be a JavaScript date object; " + this);
		}

		if (deepEqual(this.getDateValue(), oDate)) {
			return this;
		}

		oDate = this._dateValidation(oDate);

		// convert date object to value
		var sValue = this._formatValue(oDate, true);

		if (sValue !== this.getValue()) {
			this._lastValue = sValue;
		}
		// set the property in any case but check validity on output
		this.setProperty("value", sValue);

		if (this.getDomRef()) {
			// convert to output
			var sOutputValue = this._formatValue(oDate);

			if (this._$input.val() !== sOutputValue) {
				this._$input.val(sOutputValue);
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

		this._updateDomPlaceholder(this._getPlaceholder());

		return this;
	};

	DateTimeField.prototype.getDisplayFormatType = function () {
		return null;
	};

	DateTimeField.prototype._dateValidation = function (oDate) {
		this._bValid = true;
		this.setProperty("dateValue", oDate);

		return oDate;
	};

	DateTimeField.prototype._handleDateValidation = function (oDate) {
		this._bValid = true;
		this.setProperty("dateValue", oDate);
	};

	DateTimeField.prototype._getPlaceholder = function() {

		var sPlaceholder = this.getPlaceholder();

		if (!sPlaceholder) {
			sPlaceholder = this._getDisplayFormatPattern();

			if (!sPlaceholder) {
				sPlaceholder = this._getDefaultDisplayStyle();
			}

			if (this._checkStyle(sPlaceholder)) {
				sPlaceholder = this._getLocaleBasedPattern(sPlaceholder);
			}
		}

		return sPlaceholder;

	};

	DateTimeField.prototype._getLocaleBasedPattern = function (sPlaceholder) {
		return LocaleData.getInstance(
			sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale()
		).getDatePattern(sPlaceholder);
	};

	DateTimeField.prototype._parseValue = function (sValue, bDisplayFormat) {
		var oBinding = this.getBinding("value"),
			oBindingType = oBinding && oBinding.getType && oBinding.getType(),
			oFormatOptions,
			oDateLocal,
			oDate;

		if (oBindingType && this._isSupportedBindingType(oBindingType)) {
			try {
				oDate = oBindingType.parseValue(sValue, "string");

				if (typeof (oDate) === "string" && oBindingType instanceof DateTimeBase) {
					oDate = DateTimeBase.prototype.parseValue.call(oBindingType, sValue, "string");
				}

				oFormatOptions = oBindingType.oFormatOptions;
				if (oFormatOptions && oFormatOptions.source && oFormatOptions.source.pattern == "timestamp") {
					// convert timestamp back to Date
					oDate = new Date(oDate);
				} else if (oFormatOptions && oFormatOptions.source && typeof oFormatOptions.source.pattern === "string") {
					oDate = oBindingType.oInputFormat.parse(sValue);
				}
			} catch (e) {
				// ignore, ParseException to be handled in ManagedObject.updateModelProperty()
			}

			if (oDate && ((oBindingType.oFormatOptions && this._isFormatOptionsUTC(oBindingType.oFormatOptions)) || (oBindingType.oConstraints && oBindingType.oConstraints.isDateOnly))) {
				// convert to local date because it was parsed as UTC date
				oDateLocal = new Date(oDate.getUTCFullYear(), oDate.getUTCMonth(), oDate.getUTCDate(),
					oDate.getUTCHours(), oDate.getUTCMinutes(), oDate.getUTCSeconds(), oDate.getUTCMilliseconds());

				oDateLocal.setFullYear(oDate.getUTCFullYear());
				oDate = oDateLocal;
			}
			return oDate;
		}

		return this._getFormatter(bDisplayFormat).parse(sValue);
	};

	/* The bValueFormat variable defines whether the result is in valueFormat(true) or displayFormat(false) */
	DateTimeField.prototype._formatValue = function (oDate, bValueFormat) {
		if (!oDate) {
			return "";
		}

		var oBinding = this.getBinding("value"),
			oBindingType = oBinding && oBinding.getType && oBinding.getType(),
			oFormatOptions,
			oDateUTC;

		if (oBindingType && this._isSupportedBindingType(oBindingType)) {
			if ((oBindingType.oFormatOptions && oBindingType.oFormatOptions.UTC) || (oBindingType.oConstraints && oBindingType.oConstraints.isDateOnly)) {
				// convert to UTC date because it will be formatted as UTC date
				oDateUTC = new Date(Date.UTC(oDate.getFullYear(), oDate.getMonth(), oDate.getDate(),
					oDate.getHours(), oDate.getMinutes(), oDate.getSeconds(), oDate.getMilliseconds()));

				oDateUTC.setUTCFullYear(oDate.getFullYear());
				oDate = oDateUTC;
			}

			oFormatOptions = oBindingType.oFormatOptions;
			if (oFormatOptions && oFormatOptions.source && oFormatOptions.source.pattern == "timestamp") {
				// convert Date to timestamp
				oDate = oDate.getTime();
			} else if (oBindingType.oOutputFormat) {
				return oBindingType.oOutputFormat.format(oDate);
			}

			return oBindingType.formatValue(oDate, "string");
		}

		/* The logic of _getFormatter function expects the opposite boolean variable of bValueFormat */
		return this._getFormatter(!bValueFormat).format(oDate);
	};

	DateTimeField.prototype._isSupportedBindingType = function (oBindingType) {
		return oBindingType.isA([
			"sap.ui.model.type.Date",
			"sap.ui.model.odata.type.DateTime",
			"sap.ui.model.odata.type.DateTimeOffset"
		]);
	};

	DateTimeField.prototype._isFormatOptionsUTC = function (oBindingTypeFormatOptions) {
		// UTC can be set directly in oFormatOptions or inside the source along with the pattern
		return (oBindingTypeFormatOptions.UTC || (oBindingTypeFormatOptions.source && oBindingTypeFormatOptions.source.UTC));
	};

	DateTimeField.prototype._getDefaultDisplayStyle = function () {
		return "medium";
	};

	DateTimeField.prototype._getDefaultValueStyle = function () {
		return "short";
	};

	/* The bDisplayFormat variable defines whether the result is in displayFormat(true) or valueFormat(false) */
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
				sCalendarType = CalendarType.Gregorian;
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
		return DateFormat.getInstance(oArguments);
	};

	DateTimeField.prototype._checkStyle = function (sPattern) {
		return (sPattern === "short" || sPattern === "medium" || sPattern === "long" || sPattern === "full");
	};

	DateTimeField.prototype._getDisplayFormatPattern = function () {
		var sPattern = this._getBoundValueTypePattern();

		if (sPattern) {
			return sPattern;
		}

		sPattern = this.getDisplayFormat();

		if (this._checkStyle(sPattern)) {
			sPattern = this._getLocaleBasedPattern(sPattern);
		}

		return sPattern;
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

	// Cross frame check for a date should be performed here otherwise setDateValue would fail in OPA tests
	// because Date object in the test is different than the Date object in the application (due to the iframe).
	// We can use jQuery.type or this method:
	// function isValidDate (date) {
	//	return date && Object.prototype.toString.call(date) === "[object Date]" && !isNaN(date);
	//}
	DateTimeField.prototype._isValidDate = function (oDate) {
		return oDate && jQuery.type(oDate) !== "date";
	};


	/**
	 * Updates the placeholder of the input element with a given valye
	 * @param {string} sValue the new value
	 * @private
	 * @returns void
	 */
	DateTimeField.prototype._updateDomPlaceholder = function (sValue) {
		if (this.getDomRef()) {
			this._$input.attr("placeholder", sValue);
		}
	};

	return DateTimeField;

});