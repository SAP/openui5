/*!
 * ${copyright}
 */

// Provides the base implementation for all model implementations
sap.ui.define(['jquery.sap.global', 'sap/ui/core/format/DateFormat', 'sap/ui/model/SimpleType', 'sap/ui/model/FormatException', 'sap/ui/model/ParseException', 'sap/ui/model/ValidateException'],
	function(jQuery, DateFormat, SimpleType, FormatException, ParseException, ValidateException) {
	"use strict";


	/**
	 * Constructor for a Date type.
	 *
	 * @class
	 * This class represents date simple types.
	 *
	 * @extends sap.ui.model.SimpleType
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @param {object} [oFormatOptions] Formatting options. For a list of all available options, see {@link sap.ui.core.format.DateFormat.getDateInstance DateFormat}.
	 * @param {object} [oFormatOptions.source] Additional set of options used to create a second <code>DateFormat</code> object for conversions between
	 *           string values in the data source (e.g. model) and <code>Date</code>. This second format object is used to convert from a model <code>string</code> to <code>Date</code> before
	 *           converting the <code>Date</code> to <code>string</code> with the primary format object. Vice versa, this 'source' format is also used to format an already parsed
	 *           external value (e.g. user input) into the string format that is expected by the data source.
	 *           For a list of all available options, see {@link sap.ui.core.format.DateFormat.getDateInstance DateFormat}.
	 *           In case an empty object is given, the default is the ISO date notation (yyyy-MM-dd).
	 * @param {object} [oConstraints] Value constraints
	 * @param {Date|string} [oConstraints.minimum] Smallest value allowed for this type. Values for constraints must use the same type as configured via <code>oFormatOptions.source</code>.
	 * @param {Date|string} [oConstraints.maximum] Largest value allowed for this type. Values for constraints must use the same type as configured via <code>oFormatOptions.source</code>.
	 * @alias sap.ui.model.type.Date
	 */
	var Date1 = SimpleType.extend("sap.ui.model.type.Date", /** @lends sap.ui.model.type.Date.prototype */ {

		constructor : function () {
			SimpleType.apply(this, arguments);
			this.sName = "Date";
		}

	});

	Date1.prototype.formatValue = function(oValue, sInternalType) {
		switch (this.getPrimitiveType(sInternalType)) {
			case "string":
			case "any":
				if (oValue == null) {
					return "";
				}
				if (this.oInputFormat) {
					if (this.oFormatOptions.source.pattern == "timestamp") {
						if (typeof (oValue) != "number") {
							if (isNaN(oValue)) {
								throw new FormatException("Cannot format date: " + oValue + " is not a valid Timestamp");
							} else {
								oValue = parseInt(oValue, 10);
							}
						}
						oValue = new Date(oValue);
					} else {
						if (oValue == "") {
							return "";
						}
						oValue = this.oInputFormat.parse(oValue);
						if (oValue == null) {
							throw new FormatException("Cannot format date: " + oValue + " has the wrong format");
						}
					}
				}
				return this.oOutputFormat.format(oValue);
			default:
				throw new FormatException("Don't know how to format Date to " + sInternalType);
		}
	};

	Date1.prototype.parseValue = function(oValue, sInternalType) {
		var oResult, oBundle;
		switch (this.getPrimitiveType(sInternalType)) {
			case "string":
				if (oValue === "") {
					return null;
				}
				var oResult = this.oOutputFormat.parse(oValue);
				if (!oResult) {
					oBundle = sap.ui.getCore().getLibraryResourceBundle();
					throw new ParseException(oBundle.getText(this.sName + ".Invalid"));
				}
				if (this.oInputFormat) {
					if (this.oFormatOptions.source.pattern == "timestamp") {
						oResult = oResult.getTime();
					} else {
						oResult = this.oInputFormat.format(oResult);
					}
				}
				return oResult;
			default:
				throw new ParseException("Don't know how to parse Date from " + sInternalType);
		}
	};

	Date1.prototype.validateValue = function(oValue) {
		if (this.oConstraints) {
			var oBundle = sap.ui.getCore().getLibraryResourceBundle(),
				aViolatedConstraints = [],
				aMessages = [],
				oInputFormat = this.oInputFormat,
				that = this;

			// convert date into date object to compare
			if (oInputFormat && this.oFormatOptions.source.pattern != "timestamp") {
				oValue = oInputFormat.parse(oValue);
			}

			jQuery.each(this.oConstraints, function(sName, oContent) {
				if (oInputFormat) {
					oContent = oInputFormat.parse(oContent);
				}
				switch (sName) {
					case "minimum":
						if (oValue < oContent) {
							aViolatedConstraints.push("minimum");
							aMessages.push(oBundle.getText(that.sName + ".Minimum", [oContent]));
						}
						break;
					case "maximum":
						if (oValue > oContent) {
							aViolatedConstraints.push("maximum");
							aMessages.push(oBundle.getText(that.sName + ".Maximum", [oContent]));
						}
				}
			});
			if (aViolatedConstraints.length > 0) {
				throw new ValidateException(aMessages.join(" "), aViolatedConstraints);
			}
		}
	};

	Date1.prototype.setFormatOptions = function(oFormatOptions) {
		this.oFormatOptions = oFormatOptions;
		this._createFormats();
	};

	/**
	 * @protected
	 */
	Date1.prototype.getOutputPattern = function() {

		return this.oOutputFormat.oFormatOptions.pattern;

	};

	/**
	 * Called by the framework when any localization setting changed
	 * @private
	 */
	Date1.prototype._handleLocalizationChange = function() {
		// recreate formatters
		this._createFormats();
	};

	/**
	 * Create formatters used by this type
	 * @private
	 */
	Date1.prototype._createFormats = function() {
		var oSourceOptions = this.oFormatOptions.source;
		this.oOutputFormat = DateFormat.getInstance(this.oFormatOptions);
		if (oSourceOptions) {
			if (jQuery.isEmptyObject(oSourceOptions)) {
				oSourceOptions = {pattern: "yyyy-MM-dd"};
			}
			this.oInputFormat = DateFormat.getInstance(oSourceOptions);
		}
	};

	return Date1;

});
