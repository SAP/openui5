/*!
 * ${copyright}
 */

// Provides object sap.ui.core.util.ODataHelper
sap.ui.define(['jquery.sap.global', 'sap/ui/base/BindingParser', 'sap/ui/core/Core',
               'sap/ui/core/format/DateFormat', 'sap/ui/core/format/NumberFormat'],
	function(jQuery, BindingParser, Core, DateFormat, NumberFormat) {
		'use strict';

		var oCore = sap.ui.getCore(),
			fnEscape = BindingParser.complexParser.escape,
			oIntegerOptions = {groupingEnabled: true},
			rISODate = /^\d{4}-\d{2}-\d{2}$/,
			// Note: oISODate*Format always contains fallback formats!
			oISODateFormat = DateFormat.getDateInstance({
				pattern: "yyyy-MM-dd",
				strictParsing: true
			}),
			rISODateTime = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[-+]\d{2}:\d{2})$/,
			oISODateTimeFormat = DateFormat.getDateTimeInstance({
				pattern: "yyyy-MM-dd'T'HH:mm:ss.SSSX",
				strictParsing: true
			}),
			rISOTime = /^\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/,
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
		 * Returns the given integer value properly formatted and escaped.
		 *
		 * @param {int} iValue
		 *   integer value
		 * @returns {string}
		 *  integer value properly formatted and escaped
		 */
		function formatInteger(iValue) {
			return fnEscape(NumberFormat.getIntegerInstance(oIntegerOptions).format(iValue));
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
				var oDate;

				switch (typeof vRawValue) {
				case "boolean": // 14.4.2 Expression edm:Bool
					return oLibraryResourceBundle.getText(vRawValue ? "YES" : "NO");

				case "number": // 14.4.10 Expression edm:Int
					return formatInteger(vRawValue);

				case "string": // 14.4.11 Expression edm:String
					return fnEscape(vRawValue);

				case "object":
					if (vRawValue) {
						switch (vRawValue["@odata.type"]) {
						case "Edm.Date": // 14.4.3 Expression edm:Date
							if (rISODate.test(vRawValue.value)) {
								oDate = oISODateFormat.parse(vRawValue.value);
								if (oDate) {
									return fnEscape(DateFormat.getDateInstance().format(oDate));
								}
							}
							jQuery.sap.log.warning("Illegal value for Edm.Date: "
									+ vRawValue.value, null, "sap.ui.core.util.ODataHelper");
							return escapedString(vRawValue.value);

						case "Edm.DateTimeOffset": // 14.4.4 Expression edm:DateTimeOffset
							if (rISODateTime.test(vRawValue.value)) {
								oDate = oISODateTimeFormat.parse(vRawValue.value);
								if (oDate) {
									return fnEscape(
										DateFormat.getDateTimeInstance().format(oDate));
								}
							}
							jQuery.sap.log.warning("Illegal value for Edm.DateTimeOffset: "
									+ vRawValue.value, null, "sap.ui.core.util.ODataHelper");
							return escapedString(vRawValue.value);

						case "Edm.Int64": // 14.4.10 Expression edm:Int
							return formatInteger(vRawValue.value);

						case "Edm.Path": // 14.5.12 Expression edm:Path
							if (typeof vRawValue.value === "string") {
								return "{path: " + JSON.stringify(vRawValue.value) + "}";
							}
							jQuery.sap.log.warning("Illegal value for Edm.Path: "
								+ vRawValue.value, null, "sap.ui.core.util.ODataHelper");
							break;

						case "Edm.TimeOfDay": // 14.4.12 Expression edm:TimeOfDay
							if (rISOTime.test(vRawValue.value)) {
								oDate = oISOTimeFormat.parse(vRawValue.value);
								if (oDate) {
									return fnEscape(DateFormat.getTimeInstance().format(oDate));
								}
							}
							jQuery.sap.log.warning("Illegal value for Edm.TimeOfDay: "
									+ vRawValue.value, null, "sap.ui.core.util.ODataHelper");
							return escapedString(vRawValue.value);

						// no default
						}
					}
					// anything else: convert to string, prefer JSON
					try {
						return fnEscape(JSON.stringify(vRawValue));
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
