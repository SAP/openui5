/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/m/DynamicDateUtil',
	'sap/ui/core/date/UI5Date',
	'sap/ui/model/SimpleType',
	'sap/ui/model/FormatException',
	'sap/ui/model/ParseException',
	'sap/ui/model/ValidateException',
	'sap/base/util/each'
],
	function(
		DynamicDateUtil,
		UI5Date,
		SimpleType,
		FormatException,
		ParseException,
		ValidateException,
		each
	) {
		"use strict";

		/**
		 * Constructor for a dynamic date range type.
		 *
		 * @class
		 * This class represents the dynamic date range type. Model values should be in
		 * the following format: { operator: "KEY", values: [param1, param2] }. Where the
		 * supported parameters are timestamps, month indexes and numbers (all three are numbers).
		 * Their type is defined by the corresponding DynamicDateOption instance identified by
		 * the same "KEY". This class is capable of formatting only the value parameters expected
		 * by the DynamicDateRange control. A display format may be provided via the format options.
		 *
		 * @extends sap.ui.model.SimpleType
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @param {object} [oFormatOptions] Format options. There are format options for each of the supported types of value parameters.
		 * @param {object} [oFormatOptions.date] Display format options for the values that contain dates. For a list of all available options,
		 * see {@link sap.ui.core.format.DateFormat.getDateInstance DateFormat}.
		 * @param {object} [oFormatOptions.month] Display format options for the values that contain month names. The only
		 * supported option is the <code>pattern</code> using the respective symbols for displaying months "MM", "MMM" or "MMMM".
		 * @param {object} [oFormatOptions.int] Display format options for the values that contain numbers. For a list of all available options,
		 * see {@link sap.ui.core.format.NumberFormat.getInstance NumberFormat}.
		 * @param {object} [oConstraints] Value constraints
		 * @param {int} [oConstraints.minimum] Smallest resulting date allowed for this type. Must be provided as a timestamps.
		 * @param {int} [oConstraints.maximum] Greatest resulting date allowed for this type. Must be provided as a timestamps.
		 * @since 1.92
		 * @alias sap.m.DynamicDate
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
		 * @param {{operator: string, values: Array<number|string>}} oValue The value to be formatted
		 * @return {{operator: string, values: Array<Date|number|string>}} A value object in a similar form
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
				if (aValueTypes[index] === "date" || aValueTypes[index] === "datetime") {
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
		 * Special values with operator: "PARSEERROR" generate a parse exception.
		 *
		 * @param {{operator: string, values: Array<Date|number|string>}} oValue The value to be parsed
		 * @return {{operator: string, values: Array<number|string|null>}} A value object in a similar form
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
				if (aValueTypes[index] === "date" || aValueTypes[index] === "datetime") {
					return oTimestampInputFormat.format(oValue);
				}

				return oValue;
			}, this);

			return oResult;
		};

		DynamicDate.prototype.validateValue = function(oValue) {
			if (this.oConstraints) {
				var oBundle = sap.ui.getCore().getLibraryResourceBundle(),
					oMBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m"),
					aViolatedConstraints = [],
					aMessages = [],
					oOption = DynamicDateUtil.getOption(oValue.operator),
					aDates = oOption.toDates(this.formatValue(oValue)).map(function(oUDate) {
							return oUDate.getTime();
					});

				if (aDates[0] === aDates[1]) {
					aDates.length = 1;
				}

				aDates.forEach(function(iTimestamp, index) {
					var sErrorGenericTextKey = "DynamicDate.Invalid" + (index === 0 ? "Start" : "End");

					each(this.oConstraints, function (sConstraintName, iConstraintValue) {
						switch (sConstraintName) {
							case "minimum":
								if (iTimestamp < iConstraintValue) {
									aViolatedConstraints.push("minimum");
									aMessages.push(oMBundle.getText(sErrorGenericTextKey, [UI5Date.getInstance(iTimestamp).toDateString()]));
									aMessages.push(oBundle.getText("Date.Minimum", [UI5Date.getInstance(iConstraintValue).toDateString()]));
								}
								break;
							case "maximum":
								if (iTimestamp > iConstraintValue) {
									aViolatedConstraints.push("maximum");
									aMessages.push(oMBundle.getText(sErrorGenericTextKey, [UI5Date.getInstance(iTimestamp).toDateString()]));
									aMessages.push(oBundle.getText("Date.Maximum", [UI5Date.getInstance(iConstraintValue).toDateString()]));
								}
								break;
						}
					});
				}, this);

				if (aViolatedConstraints.length > 0) {
					throw new ValidateException(this.combineMessages(aMessages), aViolatedConstraints);
				}
			}
		};

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

				oValue = UI5Date.getInstance(oValue);
				return oValue;
			}
		};

		return DynamicDate;

	});