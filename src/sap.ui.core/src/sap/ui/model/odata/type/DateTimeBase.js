/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/format/DateFormat', 'sap/ui/model/FormatException',
		'sap/ui/model/ParseException', 'sap/ui/model/SimpleType',
		'sap/ui/model/ValidateException'],
	function(DateFormat, FormatException, ParseException, SimpleType, ValidateException) {
	"use strict";

	var oDemoDate = new Date(2014, 10, 27, 13, 47, 26);

	/*
	 * Returns true if the type uses only the date.
	 */
	function isDateOnly(oType) {
		return oType.oConstraints && oType.oConstraints.isDateOnly;
	}

	/**
	 * Returns the matching error message for the type based on the constraints.
	 *
	 * @param {sap.ui.model.odata.type.DateTimeBase} oType
	 *   the type
	 * @returns {string}
	 *   the message
	 */
	function getErrorMessage(oType) {
		return sap.ui.getCore().getLibraryResourceBundle().getText(
			isDateOnly(oType) ? "EnterDate" : "EnterDateTime",
				[oType.formatValue(oDemoDate, "string")]);
	}

	/**
	 * Base constructor for the primitive types <code>Edm.DateTime</code> and
	 * <code>Edm.DateTimeOffset</code>.
	 *
	 * @class This is an abstract base class for the <a
	 * href="http://www.odata.org/documentation/odata-version-2-0/overview#AbstractTypeSystem">
	 * OData primitive types</a> <code>Edm.DateTime</code> and <code>Edm.DateTimeOffset</code>.
	 *
	 * @extends sap.ui.model.SimpleType
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @alias sap.ui.model.odata.type.DateTimeBase
	 * @param {object} [oFormatOptions]
	 * 	 format options, see {@link #setFormatOptions}
	 * @param {object} [oConstraints]
	 * 	 constraints, see {@link #setConstraints}
	 * @public
	 * @abstract
	 * @since 1.27.0
	 */
	var DateTimeBase = SimpleType.extend("sap.ui.model.odata.type.DateTimeBase",
			/** @lends sap.ui.model.odata.type.DateTimeBase.prototype */
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
	DateTimeBase.prototype.formatValue = function(oValue, sTargetType) {
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
	DateTimeBase.prototype.parseValue = function(sValue, sSourceType) {
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
	DateTimeBase.prototype._handleLocalizationChange = function () {
		this.oFormat = null;
	};

	/**
	 * Returns the formatter. Creates it lazily.
	 * @return {sap.ui.core.format.DateFormat}
	 *   the formatter
	 * @private
	 */
	DateTimeBase.prototype._getFormatter = function () {
		if (!this.oFormat){
			if (isDateOnly(this)) {
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
	DateTimeBase.prototype.validateValue = function (oValue) {
		if (oValue === null) {
			if (this.oConstraints && this.oConstraints.nullable === false) {
				throw new ValidateException(getErrorMessage(this));
			}
			return;
		} else if (oValue instanceof Date) {
			return;
		}
		throw new ValidateException("Illegal " + this.getName() + " value: " + oValue);
	};

	/**
	 * Set the format options.
	 *
	 * @param {object} oFormatOptions
	 *   the format options (none so far)
	 * @public
	 */
	DateTimeBase.prototype.setFormatOptions = function(oFormatOptions) {
		// no format options supported yet
	};

	/**
	 * Set the constraints.
	 *
	 * @param {object} [oConstraints]
	 * 	 constraints
	 * @param {boolean|string} [oConstraints.nullable=true]
	 *   if <code>true</code>, the value <code>null</code> will be accepted
	 * @param {boolean} [oConstraints.isDateOnly=false]
	 *   if <code>true</code>, only the date part will be used, the time part will always be
	 *   00:00:00, the timezone will be UTC to avoid timezone-related problems
	 * @public
	 */
	DateTimeBase.prototype.setConstraints = function(oConstraints) {
		this.oConstraints = undefined;
		if (oConstraints) {
			switch (oConstraints.nullable) {
			case undefined:
			case true:
			case "true":
				break;
			case false:
			case "false":
				this.oConstraints = this.oConstraints || {};
				this.oConstraints.nullable = false;
				break;
			default:
				jQuery.sap.log.warning("Illegal nullable: " + oConstraints.nullable, null,
					this.getName());
			}

			if (oConstraints.isDateOnly === true) {
				this.oConstraints = this.oConstraints || {};
				this.oConstraints.isDateOnly = true;
			}
		}
		this._handleLocalizationChange();
	};

	/**
	 * Returns the type's name.
	 *
	 * @name sap.ui.model.odata.type.DateTimeBase#getName
	 * @function
	 * @protected
	 * @abstract
	 */

	return DateTimeBase;
});
