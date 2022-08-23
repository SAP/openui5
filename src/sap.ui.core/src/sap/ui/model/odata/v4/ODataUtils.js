/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.ODataUtils
sap.ui.define([
	"sap/ui/core/CalendarType",
	"sap/ui/core/format/DateFormat",
	"sap/ui/model/odata/ODataUtils",
	"sap/ui/model/odata/v4/lib/_Batch",
	"sap/ui/model/odata/v4/lib/_Helper"
], function (CalendarType, DateFormat, BaseODataUtils, _Batch, _Helper) {
	"use strict";

	// see http://docs.oasis-open.org/odata/odata/v4.0/errata02/os/complete/abnf/odata-abnf-construction-rules.txt
	var oDateFormatter,
		oDateTimeOffsetFormatter,
		sDateValue = "\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])",
		oTimeFormatter,
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
			 * Sets the static date and time formatter instances.
			 *
			 * @private
			 */
			_setDateTimeFormatter : function () {
				oDateFormatter = DateFormat.getDateInstance({
					calendarType : CalendarType.Gregorian,
					pattern : "yyyy-MM-dd",
					strictParsing : true,
					UTC : true
				});
				oDateTimeOffsetFormatter = DateFormat.getDateTimeInstance({
					calendarType : CalendarType.Gregorian,
					pattern : "yyyy-MM-dd'T'HH:mm:ss.SSSXXX",
					strictParsing : true
				});
				oTimeFormatter = DateFormat.getTimeInstance({
					calendarType : CalendarType.Gregorian,
					pattern : "HH:mm:ss.SSS",
					strictParsing : true,
					UTC : true
				});
			},

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
			 * Deserializes a batch response body using the batch boundary from the given value of
			 * the "Content-Type" header.
			 *
			 * @param {string} sContentType
			 *   The value of the "Content-Type" header from the batch response, for example
			 *  "multipart/mixed; boundary=batch_123456"
			 * @param {string} sResponseBody
			 *   A batch response body
			 * @returns {object[]}
			 *   An array containing responses from the batch response body, each with the following
			 *   structure:
			 *   <ul>
			 *     <li> <code>status</code>: {number} HTTP status code
			 *     <li> <code>statusText</code>: {string} (optional) HTTP status text
			 *     <li> <code>headers</code>: {object} Map of response headers
			 *     <li> <code>responseText</code>: {string} Response body
			 *   </ul>
			 *   If the specified <code>sResponseBody</code> contains responses for change sets,
			 *   then the corresponding response objects will be returned in a nested array.
			 * @throws {Error} If
			 *   <ul>
			 *     <li> the <code>sContentType</code> parameter does not represent a
			 *       "multipart/mixed" media type with "boundary" parameter
			 *     <li> the "charset" parameter of the "Content-Type" header of a nested response
			 *       has a value other than "UTF-8"
			 *     <li> there is no "Content-ID" header for a change set response or its value is
			 *       not a number
			 *   </ul>
			 *
			 * @private
			 * @since 1.90.0
			 * @ui5-restricted sap.ui.integration
			 */
			deserializeBatchResponse : function (sContentType, sResponseBody) {
				return _Batch.deserializeBatchResponse(sContentType, sResponseBody);
			},

			/**
			 * Formats the given OData value into a literal suitable for usage in data binding paths
			 * and URLs.
			 *
			 * @param {any} vValue
			 *   The value according to <a href=
			 *   "https://docs.oasis-open.org/odata/odata-json-format/v4.0/os/odata-json-format-v4.0-os.html#_Primitive_Value"
			 *   >"OData JSON Format Version 4.0" section "7.1 Primitive Value"</a>
			 * @param {string} sType
			 *   The OData primitive type, for example "Edm.String"
			 * @returns {string}
			 *   The literal according to <a href=
			 *   "https://docs.oasis-open.org/odata/odata/v4.0/odata-v4.0-part2-url-conventions.html"
			 *   >"OData Version 4.0 Part 2: URL Conventions"</a> section
			 *   "5.1.1.11.1 Primitive Literals"
			 * @throws {Error}
			 *   If the value is undefined or the type is not supported
			 *
			 * @example <caption>Use <code>formatLiteral</code> together with
			 *   <code>encodeURIComponent</code> to create a properly encoded data binding path for
			 *   {@link sap.ui.model.odata.v4.ODataModel}.</caption>
			 *   var sSalesOrderId = ODataUtils.formatLiteral("A/B&C", "Edm.String"),
			 *           // expected result: "'A/B&C'"
			 *       sPath = "/" + encodeURIComponent("SalesOrderList(" + sSalesOrderId + ")");
			 *           // expected result: "/SalesOrderList('A%2FB%26C')"
			 *
			 * @public
			 * @since 1.64.0
			 */
			formatLiteral : function (vValue, sType) {
				return _Helper.formatLiteral(vValue, sType);
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
				var oDate = rDate.test(sDate) && oDateFormatter.parse(sDate);

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
					oDateTimeOffset = oDateTimeOffsetFormatter.parse(sDateTimeOffset.toUpperCase());
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
					oTimeOfDay = oTimeFormatter.parse(sTimeOfDay);
				}
				if (!oTimeOfDay) {
					throw new Error("Not a valid Edm.TimeOfDay value: " + sTimeOfDay);
				}
				return oTimeOfDay;
			},

			/**
			 * Serializes an array of requests to an object containing the batch request body and
			 * mandatory headers for the batch request.
			 *
			 * @param {object[]} aRequests
			 *   An array consisting of request objects or arrays of request objects, in case
			 *   requests need to be sent in scope of a change set. See example below. Change set
			 *   requests are annotated with a property <code>$ContentID</code> containing the
			 *   corresponding "Content-ID" header from the serialized batch request body.
			 * @param {string} [sEpilogue]
			 *   A string that will be included in the epilogue (which acts like a comment)
			 * @param {string} oRequest.method
			 *   The HTTP method; only "GET", "POST", "PUT", "PATCH", or "DELETE" are allowed
			 * @param {string} oRequest.url
			 *   An absolute or relative URL. If the URL contains a "Content-ID" reference, then the
			 *   reference has to be specified as the zero-based index of the referenced request
			 *   inside the change set. See example below.
			 * @param {object} oRequest.headers
			 *   A map of request headers. RFC-2047 encoding rules are not supported. Nevertheless
			 *   non-US-ASCII values can be used. If the value of an "If-Match" header is an object,
			 *   that object's ETag ("@odata.etag") is used instead.
			 * @param {object} [oRequest.body]
			 *   The request body. If specified, the <code>oRequest.headers</code> map must contain
			 *   a "Content-Type" header either without "charset" parameter or with "charset"
			 *   parameter having value "UTF-8".
			 * @returns {object}
			 *   An object containing the following properties:
			 *   <ul>
			 *     <li> <code>body</code>: {string} Batch request body
			 *     <li> <code>headers</code>: {object} Map of batch-specific request headers:
			 *       <ul>
			 *         <li> <code>Content-Type</code>: Value for the "Content-Type" header
			 *         <li> <code>MIME-Version</code>: Value for the "MIME-Version" header
			 *       </ul>
			 *   </ul>
			 * @throws {Error}
			 *   If change sets are nested or an invalid HTTP method is used
			 *
			 * @example
			 *   var oBatchRequest = ODataUtils.serializeBatchRequest([
			 *       {
			 *           method : "GET",
			 *           url : "/sap/opu/odata4/IWBEP/TEA_BUSI/0001/Employees('1')",
			 *           headers : {
			 *               Accept : "application/json"
			 *           }
			 *       },
			 *       [{
			 *           method : "POST",
			 *           url : "TEAMS",
			 *           headers : {
			 *               "Content-Type" : "application/json"
			 *           },
			 *           body : {"TEAM_ID" : "TEAM_03"}
			 *       }, {
			 *           method : "POST",
			 *           url : "$0/TEAM_2_Employees",
			 *           headers : {
			 *               "Content-Type" : "application/json",
			 *               "If-Match" : "etag0"
			 *           },
			 *           body : {"Name" : "John Smith"}
			 *       }],
			 *       {
			 *           method : "PATCH",
			 *           url : "/sap/opu/odata4/IWBEP/TEA_BUSI/0001/Employees('3')",
			 *           headers : {
			 *               "Content-Type" : "application/json",
			 *               "If-Match" : {
			 *                   "@odata.etag" : "etag1"
			 *               }
			 *           },
			 *           body : {"TEAM_ID" : "TEAM_01"}
			 *       }
			 *   ]);
			 *
			 * @private
			 * @since 1.90.0
			 * @ui5-restricted sap.ui.integration
			 */
			serializeBatchRequest : function (aRequests, sEpilogue) {
				return _Batch.serializeBatchRequest(aRequests, sEpilogue);
			}
		};

	ODataUtils._setDateTimeFormatter();

	return ODataUtils;
}, /* bExport= */ true);
