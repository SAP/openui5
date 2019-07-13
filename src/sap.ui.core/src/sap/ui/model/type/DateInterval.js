/*!
 * ${copyright}
 */


sap.ui.define([
	'sap/ui/core/format/DateFormat',
	'sap/ui/model/CompositeType',
	'sap/ui/model/FormatException',
	'sap/ui/model/ParseException',
	'sap/ui/model/ValidateException',
	"sap/base/util/isEmptyObject"
],
	function(
		DateFormat,
		CompositeType,
		FormatException,
		ParseException,
		ValidateException,
		isEmptyObject
	) {
	"use strict";


	/**
	 * Constructor for a Date interval type.
	 *
	 * @class
	 * This class represents the Date interval composite type.
	 *
	 * @extends sap.ui.model.CompositeType
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @param {object} [oFormatOptions] Formatting options. For a list of all available options, see {@link sap.ui.core.format.DateFormat.getDateInstance DateFormat}.
	 * @param {object} [oFormatOptions.source] Additional set of options used to create a second <code>DateFormat</code> object for conversions between string values
	 *           in the data source (e.g. model) and <code>Date</code>. This second format object is used to convert both of the interval parts from a model
	 *           <code>string</code> to <code>Date</code> before converting both of the <code>Date</code>(s) to <code>string</code> with the primary format object.
	 *           Vice versa, this 'source' format is also used to format the already parsed external value (e.g. user input) into the string format that is expected
	 *           by the data source.
	 *           For a list of all available options, see {@link sap.ui.core.format.DateFormat.getDateInstance DateFormat}.
	 *           In case an empty object is given, the default is the ISO date notation (yyyy-MM-dd).
	 * @param {object} [oConstraints] Value constraints
	 * @param {Date|String} [oConstraints.minimum] Smallest value allowed for this type. Values for constraints must use the same type as configured via <code>oFormatOptions.source</code>.
	 * @param {Date|String} [oConstraints.maximum] Largest value allowed for this type. Values for constraints must use the same type as configured via <code>oFormatOptions.source</code>.
	 * @alias sap.ui.model.type.DateInterval
	 */
	var DateInterval = CompositeType.extend("sap.ui.model.type.DateInterval", /** @lends sap.ui.model.type.DateInterval.prototype  */ {

		constructor : function () {
			CompositeType.apply(this, arguments);
			this.sName = "DateInterval";
			this.bUseInternalValues = true;
		}

	});

	/**
	 * Format the given array containing two values to an output value of type string.
	 * Other internal types than 'string' and 'any' are not supported by the date interval type.
	 * If a source format has been defined for this type, the formatValue does also accept
	 * an array with string values as input. This will be parsed into an array of Dates using
	 * the source format.
	 *
	 * If <code>aValues</code> isn't an array, a format exception is thrown.
	 * If one of the elements in <code>aValues</code> is not defined or null, empty string will be returned.
	 *
	 * @function
	 * @name sap.ui.model.type.DateInterval.prototype.formatValue
	 * @param {array} aValues The array of values
	 * @param {string} sInternalType The target type
	 * @return {any} The formatted output value
	 *
	 * @public
	 */
	DateInterval.prototype.formatValue = function(aValues, sInternalType) {
		if (!Array.isArray(aValues)) {
			throw new FormatException("Cannot format date interval: " + aValues + " is expected as an Array but given the wrong format");
		}

		switch (this.getPrimitiveType(sInternalType)) {
			case "string":
			case "any":
				if (!aValues[0] || (!aValues[1] && !this.oFormatOptions.singleIntervalValue)) {
					return "";
				}
				if (this.oInputFormat) {
					aValues = aValues.slice(0, 2);
					aValues.forEach(function(oValue, index) {
						if (this.oFormatOptions.source.pattern == "timestamp") {
							if (typeof (oValue) != "number") {
								if (isNaN(oValue)) {
									throw new FormatException("Cannot format date: " + oValue + " is not a valid Timestamp");
								} else {
									oValue = parseInt(oValue);
								}
							}
							oValue = new Date(oValue);
						} else {
							oValue = this.oInputFormat.parse(oValue);
							if (oValue == null) {
								throw new FormatException("Cannot format date: " + oValue + " has the wrong format");
							}
						}
						aValues[index] = oValue;
					}.bind(this));
				}
				return this.oOutputFormat.format(aValues);
			default:
				throw new FormatException("Don't know how to format Date to " + sInternalType);
		}
	};

	/**
	 * Parse a string value to an array containing two values. Parsing of other
	 * internal types than 'string' is not supported by the DateInterval type.
	 * In case a source format has been defined, the two values are formatted
	 * using the source format after parsing the inteval string and an array
	 * which contains two string values is returned.
	 *
	 * @function
	 * @name sap.ui.model.type.DateInterval.prototype.parseValue
	 * @param {any} sValue The value to be parsed
	 * @param {string} sInternalType The source type
	 * @param {array} aCurrentValues The current values of all binding parts
	 * @return {array} The parsed result array
	 *
	 * @public
	 */
	DateInterval.prototype.parseValue = function(sValue, sInternalType) {
		var aDates;

		function throwParseException(sName) {
			var oBundle = sap.ui.getCore().getLibraryResourceBundle();
			throw new ParseException(oBundle.getText(sName + ".Invalid"));
		}

		switch (this.getPrimitiveType(sInternalType)) {
			case "string":
				if (sValue === "") {
					return [null, null];
				}

				aDates = this.oOutputFormat.parse(sValue);

				if (!aDates[0] || (!aDates[1] && !this.oFormatOptions.singleIntervalValue)) {
					// at least one single date should be returned
					throwParseException(this.sName);
				}

				if (this.oInputFormat) {
					aDates.forEach(function(oDate, index) {
						if (this.oFormatOptions.source.pattern == "timestamp") {
							oDate = oDate.getTime();
						} else {
							oDate = this.oInputFormat.format(oDate);
						}

						aDates[index] = oDate;
					}.bind(this));
				}
				return aDates;
			default:
				throw new ParseException("Don't know how to parse Date from " + sInternalType);
		}
	};

	DateInterval.prototype.validateValue = function(aValues) {
		if (this.oConstraints) {
			var oBundle = sap.ui.getCore().getLibraryResourceBundle(),
				aViolatedConstraints = [],
				aMessages = [];

			// convert date into date object to compare
			if (this.oInputFormat && this.oFormatOptions.source.pattern != "timestamp") {
				aValues = aValues.slice(0, 2);
				aValues.forEach(function(oValue, index) {
					oValue = this.oInputFormat.parse(oValue);
					aValues[index] = oValue;
				}.bind(this));
			}

			Object.keys(this.oConstraints).forEach(function(sKey) {
				var oCompareValue = this.oConstraints[sKey];
				var bValid = true;

				switch (sKey) {
					case "minimum":
						if (this.oFormatOptions.singleIntervalValue && aValues[1] === null) {
							if (aValues[0] < oCompareValue) {
								bValid = false;
							}
						} else if (aValues[0] < oCompareValue || aValues[1] < oCompareValue) {
							bValid = false;
						}

						if (bValid === false) {
							aViolatedConstraints.push("minimum");
							aMessages.push(oBundle.getText("Date.Minimum", [oCompareValue]));
						}
						break;
					case "maximum":
						if (this.oFormatOptions.singleIntervalValue && aValues[1] === null) {
							if (aValues[0] > oCompareValue) {
								bValid = false;
							}
						} else if (aValues[0] > oCompareValue || aValues[1] > oCompareValue) {
							bValid = false;
						}

						if (bValid === false) {
							aViolatedConstraints.push("maximum");
							aMessages.push(oBundle.getText("Date.Maximum", [oCompareValue]));
						}
				}
			}.bind(this));

			if (aViolatedConstraints.length > 0) {
				throw new ValidateException(this.combineMessages(aMessages), aViolatedConstraints);
			}
		}
	};

	DateInterval.prototype.setFormatOptions = function(oFormatOptions) {
		this.oFormatOptions = oFormatOptions;
		this._createFormats();
	};

	/**
	 * Called by the framework when any localization setting has changed
	 * @private
	 */
	DateInterval.prototype._handleLocalizationChange = function() {
		this._createFormats();
	};

	/**
	 * Create formatters used by this type
	 * @private
	 */
	DateInterval.prototype._createFormats = function() {
		var oSourceOptions = this.oFormatOptions.source;

		// mark the 'interval' flag
		this.oFormatOptions.interval = true;
		this.oOutputFormat = DateFormat.getDateInstance(this.oFormatOptions);
		if (oSourceOptions) {
			if (isEmptyObject(oSourceOptions)) {
				// set the default pattern if oSourceOptions is given as an empty object
				oSourceOptions = {pattern: "yyyy-MM-dd"};
			}
			this.oInputFormat = DateFormat.getDateInstance(oSourceOptions);
		}
	};

	return DateInterval;

});