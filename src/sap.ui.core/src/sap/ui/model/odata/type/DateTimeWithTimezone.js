/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/format/DateFormat",
	"sap/ui/model/_Helper",
	"sap/ui/model/CompositeType",
	"sap/ui/model/FormatException",
	"sap/ui/model/ParseException"
], function (DateFormat, _Helper, CompositeType, FormatException, ParseException) {
	"use strict";

	var sDateOrTimeRequired = "For type 'object', at least one of the format options 'showDate' or"
			+ " 'showTime' must be enabled",
		oDemoDateTime = new Date(Date.UTC(new Date().getFullYear(), 11, 31, 23, 59, 58));

	/*
	 * Returns the formatter. Creates it lazily.
	 *
	 * @param {sap.ui.model.odata.type.DateTimeWithTimezone} oType
	 *   The type instance
	 * @returns {sap.ui.core.format.DateFormat}
	 *   The formatter
	 */
	function getFormatter(oType) {
		var oFormatOptions;

		if (!oType.oFormat) {
			oFormatOptions = _Helper.extend({strictParsing : true}, oType.oFormatOptions);
			oType.oFormat = DateFormat.getDateTimeWithTimezoneInstance(oFormatOptions);
		}
		return oType.oFormat;
	}

	/**
	 * Constructor for a <code>DateTimeWithTimezone</code> composite type.
	 *
	 * @param {object} [oFormatOptions]
	 *   Format options. For a list of all available options, see
	 *   {@link sap.ui.core.format.DateFormat.getDateTimeWithTimezoneInstance DateFormat}. The
	 *   <code>strictParsing</code> format option is set to <code>true</code> by default and can be
	 *   overwritten. Format options are immutable, that is, they can only be set once on
	 *   construction.
	 * @param {object} [oConstraints]
	 *   Constraints are not supported
	 * @throws {Error}
	 *   If constraints are given
	 *
	 * @alias sap.ui.model.odata.type.DateTimeWithTimezone
	 * @author SAP SE
	 * @class This class represents the <code>DateTimeWithTimezone</code> composite type which has
	 * the parts timestamp and time zone. The type formats the timestamp part using the time zone
	 * part. For this, the timestamp part has to be provided in the UTC time zone. When using this
	 * type with the {@link sap.ui.model.odata.v2.ODataModel}, you need to set the parameter
	 * <code>useUndefinedIfUnresolved</code> for both parts.
	 * @extends sap.ui.model.CompositeType
	 * @public
	 * @see {sap.ui.model.odata.v2.ODataModel#bindProperty}
	 * @since 1.99.0
	 * @version ${version}
	 */
	var DateTimeWithTimezone = CompositeType.extend("sap.ui.model.odata.type.DateTimeWithTimezone",
		{
			constructor : function (oFormatOptions, oConstraints) {
				if (oConstraints && Object.keys(oConstraints).length) {
					throw new Error("Type " + this.getName() + " does not support constraints");
				}
				oFormatOptions = Object.assign({}, oFormatOptions);
				CompositeType.call(this, oFormatOptions);
				this.oFormat = null;
				this.bParseWithValues = true;
				this.bUseInternalValues = true;
				this.vEmptyTimezoneValue = null;
				this.bShowDate = oFormatOptions.showDate === undefined || oFormatOptions.showDate;
				this.bShowTime = oFormatOptions.showTime === undefined || oFormatOptions.showTime;
				this.bShowTimezone = oFormatOptions.showTimezone === undefined
					|| oFormatOptions.showTimezone;

				// must not overwrite setConstraints and setFormatOptions on prototype as they are
				// called in SimpleType constructor
				this.setConstraints = function () {
					throw new Error("Constraints are immutable");
				};
				this.setFormatOptions = function () {
					throw new Error("Format options are immutable");
				};
			}
		});

	/*
	 * Returns the locale-dependent error message corresponding to the type's format option
	 * <code>showTimezone</code>.
	 *
	 * @returns {string}
	 *   The locale-dependent error message
	 *
	 * @private
	 */
	DateTimeWithTimezone.prototype._getErrorMessage = function () {
		var sMessageKey = !this.bShowDate && !this.bShowTime
				? "EnterDateTimeTimezone"
				: "EnterDateTime";

		return sap.ui.getCore().getLibraryResourceBundle()
			.getText(sMessageKey, [this.formatValue([oDemoDateTime, "America/New_York"],
				"string")]);
	};

	/**
	 * Formats the given values of the parts of the <code>DateTimeWithTimezone</code> composite type
	 * to the given target type.
	 *
	 * @param {array} aValues
	 *   The array of the part values to be formatted; the first entry has to be a <code>Date</code>
	 *   object for the timestamp, and the second entry has to be a string representing a time zone
	 *   ID
	 * @param {string} sTargetType
	 *   The target type, must be "object", "string", or a type with one of these types as its
	 *   {@link sap.ui.base.DataType#getPrimitiveType primitive type}; see
	 *   {@link sap.ui.model.odata.type} for more information
	 * @returns {any}
	 *   The formatted output value; <code>null</code>,
	 *   <ul>
	 *     <li>if <code>aValues</code> is not set, or</li>
	 *     <li>if the time zone or timestamp in <code>aValues</code> is <code>undefined</code>, or
	 *     </li>
	 *     <li>if the timestamp in <code>aValues</code> is not set and the <code>showTimezone</code>
	 *       format option is set to <code>false</code>
	 *     </li>
	 *   </ul>
	 * @throws {sap.ui.model.FormatException}
	 *   If
	 *   <ul>
	 *     <li><code>sTargetType</code> is unsupported,</li>
	 *     <li>a timestamp is given in <code>aValues</code> that is not an instance of
	 *       <code>Date</code>,</li>
	 *     <li>the <code>sTargetType</code> is "object" or an equivalent primitive type, and the
	 *       <code>showTimezone</code> format option is enabled, but <code>showDate</code> and
	 *       <code>showTime</code> are both <code>false</code></li>
	 *   </ul>
	 * @public
	 */
	DateTimeWithTimezone.prototype.formatValue = function (aValues, sTargetType) {
		var oTimestamp = aValues && aValues[0],
			sTimezone = aValues && aValues[1];

		if (!aValues
				|| sTimezone === undefined // data is not yet available
				|| oTimestamp === undefined // data is not yet available
				// if time zone is not shown falsy timestamps cannot be formatted -> return null
				|| (!oTimestamp && !this.bShowTimezone)) {
			return null;
		}

		if (oTimestamp && !(oTimestamp instanceof Date)) {
			throw new FormatException("Timestamp value for " + this.getName()
				+ " is not an instance of Date: " + oTimestamp);
		}

		switch (this.getPrimitiveType(sTargetType)) {
			case "object":
				if (!this.bShowDate && !this.bShowTime) {
					throw new FormatException(sDateOrTimeRequired);
				}

				return oTimestamp;
			case "string":
				return getFormatter(this).format(oTimestamp, sTimezone);
			default:
				throw new FormatException("Don't know how to format " + this.getName() + " to "
					+ sTargetType);
		}
	};

	/**
	 * Returns the type's name.
	 *
	 * @returns {string}
	 *   The type's name
	 *
	 * @public
	 */
	DateTimeWithTimezone.prototype.getName = function () {
		return "sap.ui.model.odata.type.DateTimeWithTimezone";
	};


	/**
	 * Gets an array of indices that determine which parts of this type shall not propagate their
	 * model messages to the attached control. Prerequisite is that the corresponding binding
	 * supports this feature, see {@link sap.ui.model.Binding#supportsIgnoreMessages}. If the
	 * <code>showTimezone</code> format option is set to <code>false</code>, the time zone is not
	 * shown in the control, and the part for the time zone shall not propagate model messages to
	 * the control.
	 * Analogously, if the format option <code>showDate</code> and <code>showTime</code> are both
	 * set to <code>false</code>, the date and time are not shown in the control, and the parts for
	 * the date and time shall not propagate model messages to the control.
	 *
	 * @return {number[]}
	 *   An array of indices that determine which parts of this type shall not propagate their
	 *   model messages to the attached control
	 *
	 * @public
	 * @see sap.ui.model.Binding#supportsIgnoreMessages
	 */
	// @override sap.ui.model.CompositeType#getPartsIgnoringMessages
	DateTimeWithTimezone.prototype.getPartsIgnoringMessages = function () {
		if (!this.bShowDate && !this.bShowTime) {
			return [0];
		} else if (!this.bShowTimezone) {
			return [1];
		}

		return [];
	};

	/**
	 * Parses the given value.
	 *
	 * @param {string|Date} vValue
	 *   The value to be parsed
	 * @param {string} sSourceType
	 *   The source type (the expected type of <code>vValue</code>); must be "object", "string", or
	 *   a type with one of these types as its
	 *   {@link sap.ui.base.DataType#getPrimitiveType primitive type}; see
	 *   {@link sap.ui.model.odata.type} for more information
	 * @param {any[]} [aCurrentValues]
	 *   The array of current part values; the first entry has to be a <code>Date</code> object for
	 *   the timestamp, and the second entry has to be a string representing a time zone ID;
	 *   <b>Note:</b> This parameter is required, see definition of this parameter in
	 *   {@link sap.ui.model.CompositeType#parseValue}
	 * @returns {any[]}
	 *   An array with two entries; the first one is a <code>Date</code> object for the timestamp
	 *   and the second one is a string representing a time zone ID; if a part is hidden via the
	 *   format option <code>showTimezone</code>, the corresponding entry in the array is set to
	 *   <code>undefined</code>
	 * @throws {sap.ui.model.ParseException}
	 *   If
	 *   <ul>
	 *     <li><code>sSourceType</code> is unsupported,</li>
	 *     <li>the value is not parsable,</li>
	 *     <li><code>aCurrentValues</code> is not given,</li>
	 *     <li>the <code>sSourceType</code> is "object" or an equivalent primitive type, and the
	 *       <code>showTimezone</code> format option is enabled, but <code>showDate</code> and
	 *       <code>showTime</code> are both <code>false</code>,</li>
	 *     <li>the <code>sSourceType</code> is "object" or an equivalent primitive type, and the
	 *       value is not an instance of <code>Date</code>,</li>
	 *     <li>the <code>sSourceType</code> is "string" or an equivalent primitive type, and either
	 *       <code>showDate</code> or <code>showTime</code> format option is <code>false</code></li>
	 *   </ul>
	 *
	 * @public
	 */
	DateTimeWithTimezone.prototype.parseValue = function (vValue, sSourceType, aCurrentValues) {
		var aDateWithTimezone;

		if (!aCurrentValues) {
			throw new ParseException("'aCurrentValues' is mandatory");
		}

		switch (this.getPrimitiveType(sSourceType)) {
			case "object":
				if (!this.bShowDate && !this.bShowTime) {
					throw new ParseException(sDateOrTimeRequired);
				}

				if (!vValue) {
					return [null, /*unchanged*/undefined];
				}

				if (!(vValue instanceof Date)) {
					throw new ParseException("Given value must be an instance of Date");
				}

				return [vValue, undefined];
			case "string":
				if (!vValue) {
					if (!this.bShowDate && !this.bShowTime) {
						return [/*unchanged*/undefined, this.vEmptyTimezoneValue];
					}

					return [null, /*unchanged*/undefined];
				}

				try {
					aDateWithTimezone = getFormatter(this).parse(vValue, aCurrentValues[1]);
				} catch (oError) { // wrap technical error to show the error at the control
					throw new ParseException(oError.message);
				}
				if (!aDateWithTimezone) {
					throw new ParseException(this._getErrorMessage());
				}

				return aDateWithTimezone;
			default:
				throw new ParseException("Don't know how to parse " + this.getName() + " from "
					+ sSourceType);
		}
	};

	/**
	 * Processes the types of the parts of this composite type. Sets the parse result for an
	 * empty time zone input to the empty string in case the string type of the time zone part
	 * requires this.
	 *
	 * @param {sap.ui.model.SimpleType[]} aPartTypes Types of the composite binding's parts
	 *
	 * @override sap.ui.model.CompositeType#processPartTypes
	 * @protected
	 * @since 1.100.0
	 */
	DateTimeWithTimezone.prototype.processPartTypes = function (aPartTypes) {
		var oTimezoneType = aPartTypes[1];

		if (oTimezoneType
				&& oTimezoneType.isA("sap.ui.model.odata.type.String")
				&& oTimezoneType.getFormatOptions().parseKeepsEmptyString === true) {
			this.vEmptyTimezoneValue = "";
		}
	};

	/**
	 * Validates whether the given raw values meet the defined constraints. This method does nothing
	 * as no constraints are supported.
	 *
	 * @param {any[]} aValues
	 *   The set of values to be validated
	 *
	 * @public
	 * @see sap.ui.model.SimpleType#validateValue
	 */
	DateTimeWithTimezone.prototype.validateValue = function (aValues) {
	};

	/**
	 * Called by the framework when any localization setting has changed.
	 *
	 * @private
	 */
	DateTimeWithTimezone.prototype._handleLocalizationChange = function () {
		this.oFormat = null;
	};

	return DateTimeWithTimezone;
});