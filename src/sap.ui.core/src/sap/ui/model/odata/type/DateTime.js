/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/format/DateFormat', 'sap/ui/model/FormatException',
		'sap/ui/model/ParseException', 'sap/ui/model/SimpleType',
		'sap/ui/model/ValidateException'],
	function(DateFormat, FormatException, ParseException, SimpleType, ValidateException) {
	"use strict";

	var oDemoDate = new Date(2014, 10, 27, 13, 47, 26);

	/**
	 * Returns the matching error message for the type based on the constraints.
	 *
	 * @param {sap.ui.model.odata.type.DateTime} oType
	 *   the type
	 * @returns {string}
	 *   the message
	 */
	function getErrorMessage(oType) {
		return sap.ui.getCore().getLibraryResourceBundle().getText(
			oType.oConstraints.displayFormat ? "EnterDate" : "EnterDateTime",
				[oType.formatValue(oDemoDate, "string")]);
	}

	/**
	 * Constructor for a primitive type <code>Edm.DateTime</code>.
	 *
	 * @class This class represents the OData primitive type <a
	 * href="http://www.odata.org/documentation/odata-version-2-0/overview#AbstractTypeSystem">
	 * <code>Edm.DateTime</code></a>. This type is only relevant for OData v2. In version 4 it has
	 * been replaced by types which cover the various aspects of date and time better, namely
	 * <code>Edm.Date</code> and <code>Edm.DateTimeOffset</code>. (The latter one has apparently
	 * been added to v2 later.)
	 * <p>
	 * SAP has a specific annotation <code>display-format=Date</code> for <code>Edm.DateTime</code>
	 * which this type supports, too.
	 *
	 * @extends sap.ui.model.SimpleType
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @alias sap.ui.model.odata.type.DateTime
	 * @param {object} [oFormatOptions]
	 * 	 format options, see {@link #setFormatOptions}
	 * @param {object} [oConstraints]
	 * 	 constraints, see {@link #setConstraints}
	 * @public
	 * @since 1.27.0
	 */
	var DateTime = SimpleType.extend("sap.ui.model.odata.type.DateTime",
			/** @lends sap.ui.model.odata.type.DateTime.prototype */
			{
				constructor : function () {
					SimpleType.apply(this, arguments);
			}
		});

	/**
	 * Format the given value to the given target type.
	 *
	 * @param {Date} oValue
	 *   the value to be formatted, which is represented as a JavaScript Date in the model
	 * @param {string} sTargetType
	 *   the target type
	 * @return {string}
	 *   the formatted output value in the target type; <code>undefined</code> or <code>null</code>
	 *   will be formatted to <code>null</code>
	 * @throws sap.ui.model.FormatException
	 *   if <code>sTargetType</code> is unsupported
	 * @public
	 */
	DateTime.prototype.formatValue = function(oValue, sTargetType) {
		if (oValue === null || oValue === undefined) {
			return null;
		}
		switch (sTargetType) {
		case "any":
			return oValue;
		case "string":
			return this._getFormatter().format(oValue);
		default:
			throw new FormatException("Don't know how to format " + this.getName() + " to "
				+ sTargetType);
		}
	};

	/**
	 * Parse the given value to JavaScript Date.
	 *
	 * @param {string} sValue
	 *   the value to be parsed; the empty string and <code>null</code> will be parsed to
	 *   <code>null</code>
	 * @param {string} sSourceType
	 *   the source type (the expected type of <code>oValue</code>)
	 * @return {Date}
	 *   the parsed value
	 * @throws sap.ui.model.ParseException
	 *   if <code>sSourceType</code> is unsupported or if the given string cannot be parsed to a
	 *   Date
	 * @public
	 */
	DateTime.prototype.parseValue = function(sValue, sSourceType) {
		var oResult;

		if (sValue === null || sValue === "") {
			return null;
		}
		switch (sSourceType) {
		case "string":
			oResult = this._getFormatter().parse(sValue);
			if (!oResult) {
				throw new ParseException(getErrorMessage(this));
			}
			return oResult;
		default:
			throw new ParseException("Don't know how to parse " + this.getName() + " from "
				+ sSourceType);
		}
	};

	/**
	 * Called by the framework when any localization setting changed.
	 * @private
	 */
	DateTime.prototype._handleLocalizationChange = function () {
		this.oFormat = null;
	};

	/**
	 * Returns the formatter. Creates it lazily.
	 * @return {sap.ui.core.format.NumberFormat}
	 *   the formatter
	 * @private
	 */
	DateTime.prototype._getFormatter = function () {
		if (!this.oFormat){
			if (this.oConstraints.displayFormat) {
				this.oFormat = DateFormat.getDateInstance({strictParsing: true, UTC: true});
			} else {
				this.oFormat = DateFormat.getDateTimeInstance({strictParsing: true});
			}
		}
		return this.oFormat;
	};

	/**
	 * Validate whether the given value in model representation is valid and meets the
	 * defined constraints (if any).
	 *
	 * @param {string} oValue
	 *   the value to be validated
	 * @throws sap.ui.model.ValidateException if the value is not valid
	 * @public
	 */
	DateTime.prototype.validateValue = function (oValue) {
		if (oValue === null) {
			if (this.oConstraints.nullable !== false) {
				return;
			}
			throw new ValidateException(getErrorMessage(this));
		} else if (oValue instanceof Date) {
			return;
		}
		throw new ValidateException("Illegal " + this.getName() + " value: " + oValue);
	};

	/**
	 * Set format options.
	 *
	 * @param {object} oFormatOptions
	 *   the format options (none so far)
	 * @public
	 */
	DateTime.prototype.setFormatOptions = function(oFormatOptions) {
		// no format options supported yet
	};

	/**
	 * Set the constraints.
	 *
	 * @param {object} [oConstraints]
	 * 	 constraints
	 * @param {boolean|string} [oConstraints.nullable=true]
	 *   if <code>true</code>, the value <code>null</code> will be accepted
	 * @param {string} [oConstraints.displayFormat=undefined]
	 *   may be "Date", in this case only the date part will be used, the time part will always be
	 *   00:00:00, the timezone will be UTC to avoid timezone-related problems
	 * @public
	 */
	DateTime.prototype.setConstraints = function(oConstraints) {
		this.oConstraints = {};
		if (oConstraints) {
			switch (oConstraints.nullable) {
				case undefined:
				case true:
				case "true":
					break;
				case false:
				case "false":
					this.oConstraints.nullable = false;
					break;
				default:
					jQuery.sap.log.warning("Illegal nullable: " + oConstraints.nullable, null,
							this.getName());
			}

			switch (oConstraints.displayFormat) {
				case "Date":
					this.oConstraints.displayFormat = "Date";
					break;
				case undefined:
					break;
				default:
					jQuery.sap.log.warning("Illegal displayFormat: " + oConstraints.displayFormat,
							null, this.getName());
			}
		}
		this._handleLocalizationChange();
	};

	/**
	 * Returns the type's name.
	 *
	 * @returns {string}
	 *   the type's name
	 */
	DateTime.prototype.getName = function () {
		return "sap.ui.model.odata.type.DateTime";
	};

	return DateTime;
});
