/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/util/isEmptyObject",
	"sap/ui/core/date/UI5Date",
	"sap/ui/core/format/DateFormat",
	"sap/ui/model/CompositeType",
	"sap/ui/model/FormatException",
	"sap/ui/model/ParseException",
	"sap/ui/model/ValidateException"
], function (isEmptyObject, UI5Date, DateFormat, CompositeType, FormatException, ParseException,
		ValidateException) {
	"use strict";

	/**
	 * Constructor for a date interval type.
	 *
	 * @class
	 * This class represents the date interval composite type.
	 *
	 * @extends sap.ui.model.CompositeType
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @alias sap.ui.model.type.DateInterval
	 * @param {object} [oFormatOptions]
	 *   Format options as defined in {@link sap.ui.core.format.DateFormat.getDateInstance}
	 * @param {boolean} [oFormatOptions.interval=true]
	 *   This format option cannot be overwritten and is always <code>true</code>
	 * @param {boolean} [oFormatOptions.singleIntervalValue=false]
	 *   Whether the end value of the interval can be omitted
	 * @param {object} [oFormatOptions.source]
	 *   Additional set of options used to create a second <code>DateFormat</code> object for
	 *   conversions between string values in the data source (e.g. model) and <code>Date</code>.
	 *   This second format object is used to convert both interval parts from a model
	 *   <code>string</code> to <code>Date</code> before converting both of the <code>Date</code>(s)
	 *   to <code>string</code> with the primary format object. Vice versa, this 'source' format is
	 *   also used to format the already parsed external value (e.g. user input) into the string
	 *   format that is expected by the data source. For a list of all available options, see
	 *   {@link sap.ui.core.format.DateFormat.getDateInstance}. If an empty object is given, the
	 *   default is the ISO date notation (yyyy-MM-dd).
	 * @param {string} [oFormatOptions.source.pattern]
	 *   A data pattern in LDML format; additionally, <code>"timestamp"</code> is supported, which
	 *   means that the source values are timestamps in milliseconds based on the UNIX epoch.
	 * @param {boolean} [oFormatOptions.UTC=false]
	 *   Whether the date is formatted and parsed as UTC instead of the configured time zone
	 * @param {object} [oConstraints]
	 *   Value constraints; {@link #validateValue validateValue} throws an error if any constraint
	 *   is violated
	 * @param {Date|module:sap/ui/core/date/UI5Date|string} [oConstraints.minimum]
	 *   Smallest value allowed for this type; values for constraints must use the same type as
	 *   configured via <code>oFormatOptions.source</code>. Use
	 *   {@link module:sap/ui/core/date/UI5Date.getInstance} to create new date instances
	 * @param {Date|module:sap/ui/core/date/UI5Date|string} [oConstraints.maximum]
	 *   Largest value allowed for this type; values for constraints must use the same type as
	 *   configured via <code>oFormatOptions.source</code>. Use
	 *   {@link module:sap/ui/core/date/UI5Date.getInstance} to create new date instances
	 * @public
	 */
	var DateInterval = CompositeType.extend("sap.ui.model.type.DateInterval",
			/** @lends sap.ui.model.type.DateInterval.prototype  */
			{
				constructor : function () {
					CompositeType.apply(this, arguments);
					this.sName = "DateInterval";
					this.bUseInternalValues = true;
				}
			}
		);

	/**
	 * Formats the given array containing the start and the end date of the interval to a string.
	 * If a source format has been defined, an array with string values as input is also accepted.
	 * These strings are parsed into an array of <code>Date</code>s using the source format.
	 *
	 * @param {Array<Date|module:sap/ui/core/date/UI5Date|int|string|null>} aValues
	 *   The start and the end date of the interval. It contains:
	 *   <ul>
	 *     <li>Two <code>Date</code> or <code>module:sap/ui/core/date/UI5Date</code> objects, or</li>
	 *     <li>Two strings as formatted start and end dates based on the <code>source</code> format
	 *       option, or</li>
	 *     <li>Two numbers, representing the milliseconds of the timestamps based on the UNIX epoch
	 *       if the <code>source</code> format option is used and <code>source.pattern</code> is
	 *       <code>"timestamp"</code>.</li>
	 *   </ul>
	 *   If the <code>singleIntervalValue</code> format option is used, either an array with only
	 *   one entry or an array with two entries, the second of which is <code>null</code>, are allowed.
	 * @param {string} sTargetType
	 *   The target type; may be "any" or "string", or a type with one of
	 *   these types as its {@link sap.ui.base.DataType#getPrimitiveType primitive type}; see
	 *   {@link sap.ui.model.odata.type} for more information.
	 * @returns {string}
	 *   The formatted date interval, or an empty string if the start date is falsy or if the end
	 *   date is falsy and <code>singleIntervalValue</code> is not set to <code>false</code>
	 * @throws {sap.ui.model.FormatException}
	 *   If <code>aValues</code> isn't an array, or <code>sTargetType</code> is unsupported
	 *
	 * @public
	 */
	DateInterval.prototype.formatValue = function (aValues, sTargetType) {
		var that = this;

		if (!Array.isArray(aValues)) {
			throw new FormatException("Cannot format date interval: " + aValues
				+ " is expected as an Array but given the wrong format");
		}

		switch (this.getPrimitiveType(sTargetType)) {
			case "string":
			case "any":
				if (!aValues[0] || (!aValues[1] && !this.oFormatOptions.singleIntervalValue)) {
					return "";
				}
				if (this.oInputFormat) {
					aValues = aValues.map(function (oValue) {
						if (that.oFormatOptions.source.pattern === "timestamp") {
							if (typeof (oValue) !== "number") {
								if (isNaN(oValue)) {
									throw new FormatException("Cannot format date: " + oValue
										+ " is not a valid Timestamp");
								} else {
									oValue = parseInt(oValue);
								}
							}
							oValue = UI5Date.getInstance(oValue);
						} else {
							oValue = that.oInputFormat.parse(oValue);
							if (oValue == null) {
								throw new FormatException("Cannot format date: " + oValue
									+ " has the wrong format");
							}
						}

						return oValue;
					});
				}
				return this.oOutputFormat.format(aValues);
			default:
				throw new FormatException("Don't know how to format Date to " + sTargetType);
		}
	};

	/**
	 * Parses the given value to an array of two values representing the start date and the end date
	 * of the interval, where the time part of the start date is 0 and the time part of end date is
	 * the end of day (23:59:59). If the <code>singleIntervalValue</code> format option is used,
	 * the second entry is <code>null</code> if no end date is given.
	 *
	 * @param {string} sValue
	 *   The value to be parsed; the empty string is parsed to <code>[null, null]</code>
	 * @param {string} sSourceType
	 *   The source type (the expected type of <code>sValue</code>); it must be either "string" or a
	 *   type with "string" as its {@link sap.ui.base.DataType#getPrimitiveType primitive type}.
	 *   See {@link sap.ui.model.odata.type} for more information.
	 * @returns {Array<Date|module:sap/ui/core/date/UI5Date|int|string|null>}
	 *   The start and the end date of the interval. The resulting values in the array are:
	 *   <ul>
	 *     <li>Two <code>Date</code> or <code>module:sap/ui/core/date/UI5Date</code> objects, or</li>
	 *     <li>Two strings as formatted start and end dates based on the <code>source</code> format
	 *       option, or</li>
	 *     <li>Two numbers, representing the milliseconds of the timestamps based on the UNIX epoch
	 *       if the <code>source</code> format option is used and <code>source.pattern</code> is
	 *       <code>"timestamp"</code>.</li>
	 *   </ul>
	 * @throws {sap.ui.model.ParseException}
	 *   If <code>sSourceType</code> is not supported or if the given string cannot be parsed
	 *
	 * @public
	 */
	DateInterval.prototype.parseValue = function (sValue, sSourceType) {
		var oBundle, aDates,
			that = this;

		switch (this.getPrimitiveType(sSourceType)) {
			case "string":
				if (sValue === "") {
					return [null, null];
				}

				aDates = this.oOutputFormat.parse(sValue);

				if (!aDates[0] || (!aDates[1] && !this.oFormatOptions.singleIntervalValue)) {
					// at least one single date should be returned
					oBundle = sap.ui.getCore().getLibraryResourceBundle();
					throw new ParseException(oBundle.getText(this.sName + ".Invalid"));
				}

				// for client side filtering, ensure to set the end of day for the second value;
				// don't do it for subclasses like DateTimeInterval as they consider the time part
				if (aDates[1] && this.sName === "DateInterval") {
					// to avoid rounding issues with some back-ends keep the milliseconds empty
					if (this.oFormatOptions.UTC) {
						aDates[1].setUTCHours(23, 59, 59, 0);
					} else {
						aDates[1].setHours(23, 59, 59, 0);
					}
				}

				if (this.oInputFormat) {
					aDates = aDates.map(function (oDate) {
						return that.oFormatOptions.source.pattern === "timestamp"
							? oDate.getTime()
							: that.oInputFormat.format(oDate);
					});
				}

				return aDates;
			default:
				throw new ParseException("Don't know how to parse a date interval from " + sSourceType);
		}
	};

	/**
	 * Validates whether the given date interval values are valid and meet the given constraints.
	 *
	 * @param {Array<Date|module:sap/ui/core/date/UI5Date|int|string|null>} aValues
	 *   The start and the end date of the interval to be validated as retrieved by {@link #parseValue}
	 * @throws {sap.ui.model.ValidateException}
	 *   If at least one value does not meet the given constraints
	 * @public
	 */
	DateInterval.prototype.validateValue = function (aValues) {
		var bCheckSecondValue, oCompareValue,
			oBundle = sap.ui.getCore().getLibraryResourceBundle(),
			aViolatedConstraints = [],
			aMessages = [],
			that = this;

		// convert date strings into Date objects to compare; timestamps can be compared with Date
		// objects, because the primitive number value is used for comparison
		if (this.oInputFormat && this.oFormatOptions.source.pattern != "timestamp") {
			aValues = aValues.map(function (oValue) {
				return that.oInputFormat.parse(oValue);
			});
		}
		bCheckSecondValue = !this.oFormatOptions.singleIntervalValue || aValues[1] !== null;
		if (this.oConstraints.minimum) {
			oCompareValue = this.oConstraints.minimum;
			if (aValues[0] < oCompareValue || bCheckSecondValue && aValues[1] < oCompareValue) {
				aViolatedConstraints.push("minimum");
				aMessages.push(oBundle.getText("Date.Minimum", [oCompareValue]));
			}
		}
		if (this.oConstraints.maximum) {
			oCompareValue = this.oConstraints.maximum;
			if (aValues[0] > oCompareValue || bCheckSecondValue && aValues[1] > oCompareValue) {
				aViolatedConstraints.push("maximum");
				aMessages.push(oBundle.getText("Date.Maximum", [oCompareValue]));
			}
		}
		if (aViolatedConstraints.length > 0) {
			throw new ValidateException(this.combineMessages(aMessages), aViolatedConstraints);
		}
	};

	/**
	 * Sets the new format options and recreates the formatters.
	 *
	 * @param {object} oFormatOptions The new format options
	 *
	 * @private
	 */
	DateInterval.prototype.setFormatOptions = function (oFormatOptions) {
		this.oFormatOptions = oFormatOptions;
		this._createFormats();
	};

	/**
	 * Recreates the formatters. Called by the framework when any localization setting has changed.
	 *
	 * @private
	 */
	DateInterval.prototype._handleLocalizationChange = function () {
		this._createFormats();
	};

	/**
	 * Creates the formatters used by this type.
	 *
	 * @private
	 */
	DateInterval.prototype._createFormats = function () {
		var oSourceOptions = this.oFormatOptions.source;

		this.oFormatOptions.interval = true; // always use intervals
		this.oOutputFormat = DateFormat.getDateInstance(this.oFormatOptions);
		if (oSourceOptions) {
			if (isEmptyObject(oSourceOptions)) {
				// set the default pattern if oSourceOptions is given as an empty object
				oSourceOptions = {pattern: "yyyy-MM-dd"};
			}
			this.oInputFormat = DateFormat.getDateInstance(oSourceOptions);
		}
	};

	/**
	 * Returns a language-dependent placeholder text such as "e.g. <sample value>" where <sample value> is formatted
	 * using this type.
	 *
	 * @returns {string|undefined}
	 *   The language-dependent placeholder text or <code>undefined</code> if the type does not offer a placeholder
	 *
	 * @experimental As of version 1.114.0
	 * @public
	 */
	DateInterval.prototype.getPlaceholderText = function () {
		return this.oOutputFormat.getPlaceholderText();
	};

	return DateInterval;
});
