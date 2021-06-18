/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/m/DynamicDateUtil',
	'sap/ui/model/SimpleType',
	'sap/ui/model/FormatException',
	'sap/ui/model/ParseException'
],
	function(
		DynamicDateUtil,
		SimpleType,
		FormatException,
		ParseException
	) {
		"use strict";

		/**
		 * Constructor for a dynamic date range type.
		 *
		 * @class
		 * This class represents the dynamic date range type.
		 *
		 * @extends sap.ui.model.SimpleType
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @param {object} [oFormatOptions] Formatting options.
		 * @param {object} [oFormatOptions.date] Format options controlling the options that contain dates in their display values.
		 * @param {object} [oFormatOptions.month] Format options controlling the options that contain months in their display values.
		 * @param {object} [oFormatOptions.int] Format options controlling the options that contain numbers in their display values.
		 * @since 1.92
		 * @alias sap.m.DynamicDate
		 * @experimental Since 1.92. This class is experimental and provides only limited functionality. Also the API might be changed in future.
		 */
		var DynamicDate = SimpleType.extend("sap.m.DynamicDate", /** @lends sap.m.DynamicDate.prototype  */ {

			constructor: function() {
				this.sName = "DynamicDate";

				SimpleType.apply(this, arguments);
			}

		});

		/**
		 * Formats the given object value to a similar object.
		 * The whole value is in the following format { operator: "KEY", values: [...array with dates or numbers to be formatted]}.
		 * Only formats the 'values' part of the given object. The dates are expected as 'timestamp' numbers
		 * and are converted to Javascript Date objects. The numbers and strings are left untouched.
		 *
		 * @param {object} oValue The value to be formatted
		 * @return {object} A value object in a similar form
		 *
		 * @public
		 */
		DynamicDate.prototype.formatValue = function(oValue) {
			var oResult = {};

			if (!oValue) {
				return;
			}

			oResult.operator = oValue.operator;
			oResult.values = oValue.values.slice(0);

			var aValueTypes = DynamicDateUtil.getOption(oValue.operator).getValueTypes();

			oResult.values = oResult.values.map(function(oValue, index) {
				if (aValueTypes[index] === "date") {
					return oTimestampInputFormat.parse(oValue);
				}

				return oValue;
			}, this);

			return oResult;
		};

		/**
		 * Parses the given object value to a similar object.
		 * The whole value is in the following format { operator: "KEY", values: [...array with JS dates or numbers to be parsed]}.
		 * Only parses the 'values' part of the given object. The dates are expected as Javascript Dates
		 * and are converted to timestamps. The numbers and strings are left untouched.
		 *
		 * @param {object} oValue The value to be parsed
		 * @return {object} A value object in a similar form
		 *
		 * @public
		 */
		DynamicDate.prototype.parseValue = function(oValue) {
			var oResult = {},
				aValueTypes;

			if (!oValue) {
				return;
			}

			if (oValue.operator === "PARSEERROR") {
				throw new ParseException(oValue.values[0]);
			}

			oResult.operator = oValue.operator;
			oResult.values = oValue.values.slice(0);

			aValueTypes = DynamicDateUtil.getOption(oValue.operator).getValueTypes();

			oResult.values = oResult.values.map(function(oValue, index) {
				if (aValueTypes[index] === "date") {
					return oTimestampInputFormat.format(oValue);
				}

				return oValue;
			}, this);

			return oResult;
		};

		/**
		 * Validates whether a given raw value meets the defined constraints.
		 * <strong>Note: No support for constraints for now.</strong>
		 */
		DynamicDate.prototype.validateValue = function() {};

		var oTimestampInputFormat = {
			format: function(oValue) {
				if (oValue instanceof Date) {
					return oValue.getTime();
				}
				return null;
			},
			parse: function(oValue) {
				if (isNaN(oValue)) {
					throw new FormatException("Cannot format date: " + oValue + " is not a valid Timestamp");
				} else if (typeof (oValue) !== "number") {
					oValue = parseInt(oValue);
				}

				oValue = new Date(oValue);
				return oValue;
			}
		};

		return DynamicDate;

	});