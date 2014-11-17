/*!
 * ${copyright}
 */

// Provides object sap.ui.core.util.ODataHelper
sap.ui.define(['jquery.sap.global', 'sap/ui/base/BindingParser', 'sap/ui/core/Core',
               'sap/ui/core/format/DateFormat', 'sap/ui/core/format/NumberFormat'],
	function(jQuery, BindingParser, Core, DateFormat, NumberFormat) {
		'use strict';

		var rBinary = /^[-\w]*={0,2}$/,
			oCore = sap.ui.getCore(),
			rDecimal = /^[-+]?\d+(\.\d+)?$/,
			fnEscape = BindingParser.complexParser.escape,
			rGuid = /^[A-F0-9]{8}-([A-F0-9]{4}-){3}[A-F0-9]{12}$/i,
			oIntegerOptions = {groupingEnabled: true},
			rInt64 = /^[-+]?\d{1,19}$/,
			rISODate = /^\d{4}-\d{2}-\d{2}$/,
			// Note: oISODate*Format always contains fallback formats!
			oISODateFormat = DateFormat.getDateInstance({
				pattern: "yyyy-MM-dd",
				strictParsing: true
			}),
			rISODateTime = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(\.\d{1,12})?(Z|[-+]\d{2}:\d{2})$/,
			oISODateTimeFormat = DateFormat.getDateTimeInstance({
				pattern: "yyyy-MM-dd'T'HH:mm:ss.SSSX",
				strictParsing: true
			}),
			rISOTime = /^\d{2}:\d{2}(:\d{2}(\.\d{1,12})?)?$/,
			oISOTimeFormat = DateFormat.getTimeInstance({
				pattern: "HH:mm:ss.SSS",
				strictParsing: true
			}),
			oLibraryResourceBundle = oCore.getLibraryResourceBundle("sap.ui.core",
				oCore.getConfiguration().getFormatSettings().getFormatLocale().toString());

		/**
		 * Returns the given value properly turned into a string and escaped.
		 *
		 * @param {any} vValue
		 *   any value
		 * @returns {string}
		 *   the given value properly turned into a string and escaped
		 */
		function escapedString(vValue) {
			return fnEscape(String(vValue));
		}

		/**
		 * Handles floating-point types according to the given regular expression.
		 *
		 * @param {any} vRawValue
		 *    the raw value from the meta model
		 * @param {RegExp} [rNumber]
		 *    regular expression defining the number syntax; if missing, string values are illegal
		 * @returns {string}
		 *    the resulting string value to write into the processed XML
		 */
		function floatingPoint(vRawValue, rNumber) {
			if (typeof vRawValue.value === "number" && isFinite(vRawValue.value)
				// IEEE754Compatible: decimal values sent as string
				|| rNumber && rNumber.test(vRawValue.value)) {
				return fnEscape(NumberFormat.getFloatInstance().format(vRawValue.value));
			}
			return illegalValue(vRawValue);
		}

		/**
		 * Returns the given integer value properly formatted and escaped.
		 *
		 * @param {number} fValue
		 *   some number value
		 * @returns {string}
		 *  integer value properly formatted and escaped
		 */
		function formatInteger(fValue) {
			return fnEscape(NumberFormat.getIntegerInstance(oIntegerOptions).format(fValue));
		}

		/**
		 * Warns about an illegal value for a type and returns an appropriate string representation
		 * of the value.
		 *
		 * @param {any} vRawValue
		 *    the raw value from the meta model
		 * @returns {string}
		 *    the resulting string value to write into the processed XML
		 */
		function illegalValue(vRawValue) {
			jQuery.sap.log.warning("Illegal value for " + vRawValue["@odata.type"] + ": "
					+ vRawValue.value, null, "sap.ui.core.util.ODataHelper");
			return escapedString(vRawValue.value);
		}

		/**
		 * @see http://wiki.ecmascript.org/doku.php?id=harmony:number.isinteger
		 * @param {any} vValue any value
		 * @returns {boolean} whether the given value represents an integer
		 */
		function isInteger(vValue) {
			return typeof vValue === 'number' && isFinite(vValue)
				&& vValue > -9007199254740992 && vValue < 9007199254740992
				&& Math.floor(vValue) === vValue;
		}

		/**
		 * The OData helper which can act as a formatter in XML template views.
		 *
		 * @name sap.ui.core.util.ODataHelper
		 * @private
		 */
		return {
			/**
			 * A formatter helping to interpret OData v4 annotations during template processing.
			 * <p>
			 * Knows about <a href="http://docs.oasis-open.org/odata/odata/v4.0/errata01/os/complete/part3-csdl/odata-v4.0-errata01-os-part3-csdl-complete.html#_Toc395268244">
			 * 14.4 Constant Expressions</a>.
			 *
			 * @param {any} vRawValue
			 *    the raw value from the meta model
			 * @returns {string}
			 *    the resulting string value to write into the processed XML
			 */
			format: function (vRawValue) {
				var oDate,
					aMatches,
					fNumber;

				switch (typeof vRawValue) {
				case "boolean": // 14.4.2 Expression edm:Bool
					return oLibraryResourceBundle.getText(vRawValue ? "YES" : "NO");

				case "number": // 14.4.10 Expression edm:Int
					return isInteger(vRawValue)
						? formatInteger(vRawValue)
						: illegalValue({"@odata.type": "Edm.Int64", value: vRawValue});

				case "string": // 14.4.11 Expression edm:String
					return fnEscape(vRawValue);

				case "object":
					if (vRawValue) {
						switch (vRawValue["@odata.type"]) {
						case "Edm.Binary": // 14.4.1 Expression edm:Binary
							return typeof vRawValue.value === "string"
									&& rBinary.test(vRawValue.value)
								//convert to base64 format for data URLs
								? vRawValue.value.replace(/-/g, "+").replace(/_/g, "/")
								: illegalValue(vRawValue);

						case "Edm.Date": // 14.4.3 Expression edm:Date
							if (rISODate.test(vRawValue.value)) {
								oDate = oISODateFormat.parse(vRawValue.value);
								if (oDate) {
									return fnEscape(DateFormat.getDateInstance().format(oDate));
								}
							}
							return illegalValue(vRawValue);

						case "Edm.DateTimeOffset": // 14.4.4 Expression edm:DateTimeOffset
							aMatches = rISODateTime.exec(vRawValue.value);
							if (aMatches) {
								if (aMatches[2] && aMatches[2].length > 4) {
									// "round" to millis, BEWARE of the dot!
									vRawValue.value
										= aMatches[1] + aMatches[2].slice(0, 4) + aMatches[3];
								}
								oDate = oISODateTimeFormat.parse(vRawValue.value);
								if (oDate) {
									return fnEscape(
										DateFormat.getDateTimeInstance().format(oDate));
								}
							}
							return illegalValue(vRawValue);

						case "Edm.Decimal": // 14.4.5 Expression edm:Decimal
							return floatingPoint(vRawValue, rDecimal);

						case "Edm.Double": // 14.4.8 Expression edm:Float
							switch (vRawValue.value) {
							//TODO special cases for numbers should be included in NumberFormat!
							//TODO mapping "INF" -> Infinity of course would remain here
							case "INF":
								return oLibraryResourceBundle.getText("INFINITY");
							case "-INF":
								return oLibraryResourceBundle.getText("MINUS_INFINITY");
							case "NaN":
								return oLibraryResourceBundle.getText("NAN");
							// no default
							}
							return floatingPoint(vRawValue);

						case "Edm.Guid": // 14.4.9 Expression edm:Guid
							return rGuid.test(vRawValue.value)
								? vRawValue.value
								: illegalValue(vRawValue);

						case "Edm.Int64": // 14.4.10 Expression edm:Int (IEEE754Compatible)
							if (typeof vRawValue.value === "string"
								&& rInt64.test(vRawValue.value)) {
								fNumber = parseInt(vRawValue.value, 10);
								if (isInteger(fNumber)) {
									return formatInteger(fNumber);
								}
							}
							return illegalValue(vRawValue);

						case "Edm.Path": // 14.5.12 Expression edm:Path
							if (typeof vRawValue.value === "string") {
								return "{path: " + JSON.stringify(vRawValue.value) + "}";
							}
							return illegalValue(vRawValue);

						case "Edm.TimeOfDay": // 14.4.12 Expression edm:TimeOfDay
							if (rISOTime.test(vRawValue.value)) {
								if (vRawValue.value.length > 12) {
									// "round" to millis: "HH:mm:ss.SSS"
									vRawValue.value = vRawValue.value.slice(0, 12);
								}
								oDate = oISOTimeFormat.parse(vRawValue.value);
								if (oDate) {
									return fnEscape(DateFormat.getTimeInstance().format(oDate));
								}
							}
							return illegalValue(vRawValue);

						// no default
						}
					}
					// anything else: convert to string, prefer JSON
					try {
						return fnEscape("Unsupported type: " + JSON.stringify(vRawValue));
					} catch (ex) {
						// "Converting circular structure to JSON"
					}
					return escapedString(vRawValue);

				default:
					return escapedString(vRawValue);
				}
			}
		};
	}, /* bExport= */ true);
