/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/format/DateFormat",
	"sap/ui/model/odata/ODataUtils",
	"sap/ui/model/odata/v4/lib/_Helper"
], function (DateFormat, BaseODataUtils, _Helper) {
	"use strict";

	// see http://docs.oasis-open.org/odata/odata/v4.0/errata02/os/complete/abnf/odata-abnf-construction-rules.txt
	var sDateValue = "\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])",
		sTimeOfDayValue = "(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(\\.\\d{1,12})?)?",
		rDate = new RegExp("^" + sDateValue + "$"),
		rDateTimeOffset = new RegExp("^" + sDateValue + "T" + sTimeOfDayValue
			+ "(?:Z|[-+](?:0\\d|1[0-3]):[0-5]\\d|[-+]14:00)$", "i"),
		rTimeOfDay = new RegExp("^" + sTimeOfDayValue + "$"),
		/**
		 * @classdesc
		 * A collection of methods which help to consume OData V4 services.
		 *
		 * @public
		 * @since 1.43.0
		 * @namespace
		 * @alias sap.ui.model.odata.v4.ODataUtils
		 */
		ODataUtils = {
			/**
			 * Compares the given OData values.
			 *
			 * @param {any} vValue1
			 *   The first value to compare
			 * @param {any} vValue2
			 *   The second value to compare
			 * @param {boolean|string} [vEdmType]
			 *   If <code>true</code> or "Decimal", the string values <code>vValue1</code> and
			 *   <code>vValue2</code> are assumed to be valid "Edm.Decimal" or "Edm.Int64" values
			 *   and are compared as a decimal number (only sign, integer and fraction digits; no
			 *   exponential format).
			 *   If "DateTime", the string values <code>vValue1</code> and <code>vValue2</code>
			 *   are assumed to be valid "Edm.DateTimeOffset" values and are compared based on the
			 *   corresponding number of milliseconds since 1 January, 1970 UTC.
			 *   Otherwise the values are compared with the JavaScript operators <code>===</code>
			 *   and <code>></code>.
			 * @return {number}
			 *   The result of the comparison: <code>0</code> if the values are equal,
			 *   <code>1</code> if the first value is larger, <code>-1</code> if the second value
			 *   is larger, <code>NaN</code> if they cannot be compared
			 *
			 * @public
			 * @since 1.43.0
			 */
			compare : function (vValue1, vValue2, vEdmType) {
				if (vEdmType === true || vEdmType === "Decimal") {
					return BaseODataUtils.compare(vValue1, vValue2, true);
				}
				if (vEdmType === "DateTime") {
					return BaseODataUtils.compare(
							ODataUtils.parseDateTimeOffset(vValue1),
							ODataUtils.parseDateTimeOffset(vValue2));
				}
				return BaseODataUtils.compare(vValue1, vValue2);
			},

			/**
			 * Parses an "Edm.Date" value and returns the corresponding JavaScript <code>Date</code>
			 * value (UTC with a time value of "00:00:00").
			 *
			 * @param {string} sDate
			 *   The "Edm.Date" value to parse
			 * @returns {Date}
			 *   The JavaScript <code>Date</code> value
			 * @throws {Error}
			 *   If the input cannot be parsed
			 *
			 * @public
			 * @since 1.43.0
			 */
			parseDate : function (sDate) {
				var oDate = rDate.test(sDate) && DateFormat.getDateInstance({
						pattern : "yyyy-MM-dd",
						strictParsing : true,
						UTC : true
					}).parse(sDate);

				if (!oDate) {
					throw new Error("Not a valid Edm.Date value: " + sDate);
				}
				return oDate;
			},

			/**
			 * Parses an "Edm.DateTimeOffset" value and returns the corresponding JavaScript
			 * <code>Date</code> value.
			 *
			 * @param {string} sDateTimeOffset
			 *   The "Edm.DateTimeOffset" value to parse
			 * @returns {Date}
			 *   The JavaScript <code>Date</code> value
			 * @throws {Error}
			 *   If the input cannot be parsed
			 *
			 * @public
			 * @since 1.43.0
			 */
			parseDateTimeOffset : function (sDateTimeOffset) {
				var oDateTimeOffset,
					aMatches = rDateTimeOffset.exec(sDateTimeOffset);

				if (aMatches) {
					if (aMatches[1] && aMatches[1].length > 4) {
						// "round" to millis, BEWARE of the dot!
						sDateTimeOffset
							= sDateTimeOffset.replace(aMatches[1], aMatches[1].slice(0, 4));
					}
					oDateTimeOffset = DateFormat.getDateTimeInstance({
						pattern : "yyyy-MM-dd'T'HH:mm:ss.SSSX",
						strictParsing : true
					}).parse(sDateTimeOffset.toUpperCase());
				}
				if (!oDateTimeOffset) {
					throw new Error("Not a valid Edm.DateTimeOffset value: " + sDateTimeOffset);
				}
				return oDateTimeOffset;
			},

			/**
			 * Parses an "Edm.TimeOfDay" value and returns the corresponding JavaScript
			 * <code>Date</code> value (UTC with a date value of "1970-01-01").
			 *
			 * @param {string} sTimeOfDay
			 *   The "Edm.TimeOfDay" value to parse
			 * @returns {Date}
			 *   The JavaScript <code>Date</code> value
			 * @throws {Error}
			 *   If the input cannot be parsed
			 *
			 * @public
			 * @since 1.43.0
			 */
			parseTimeOfDay : function (sTimeOfDay) {
				var oTimeOfDay;

				if (rTimeOfDay.test(sTimeOfDay)) {
					if (sTimeOfDay.length > 12) {
						// "round" to millis: "HH:mm:ss.SSS"
						sTimeOfDay = sTimeOfDay.slice(0, 12);
					}
					oTimeOfDay =  DateFormat.getTimeInstance({
						pattern : "HH:mm:ss.SSS",
						strictParsing : true,
						UTC : true
					}).parse(sTimeOfDay);
				}
				if (!oTimeOfDay) {
					throw new Error("Not a valid Edm.TimeOfDay value: " + sTimeOfDay);
				}
				return oTimeOfDay;
			},

			/**
			 * Formats the given OData value into a literal suitable for usage in URLs.
			 *
			 * @param {any} vValue
			 *   The value according to "OData JSON Format Version 4.0" section
			 *   "7.1 Primitive Value"
			 * @param {string} sType
			 *   The OData primitive type, e.g. "Edm.String"
			 * @returns {string}
			 *   The literal according to "OData Version 4.0 Part 2: URL Conventions" section
			 *   "5.1.1.6.1 Primitive Literals"
			 * @throws {Error}
			 *   If the value is undefined or the type is not supported
			 */
			formatLiteral : function (vValue, sType) {
				return _Helper.formatLiteral(vValue, sType);
			}
		};

	return ODataUtils;
}, /* bExport= */ true);
