/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/format/DateFormat",
	"sap/ui/model/FormatException",
	"sap/ui/model/odata/type/ODataType",
	"sap/ui/model/ParseException",
	"sap/ui/model/ValidateException"
], function (jQuery, DateFormat, FormatException, ODataType, ParseException, ValidateException) {
	"use strict";

	var oDemoDate = new Date(2014, 10, 27, 13, 47, 26);

	/*
	 * Returns true if the type uses only the date.
	 *
	 * @param {sap.ui.model.odata.type.DateTimeBase} oType
	 *   The type
	 */
	function isDateOnly(oType) {
		return oType.oConstraints && oType.oConstraints.isDateOnly;
	}

	/*
	 * Returns the matching locale-dependent error message for the type based on the constraints.
	 *
	 * @param {sap.ui.model.odata.type.DateTimeBase} oType
	 *   The type
	 * @returns {string}
	 *   The locale-dependent error message
	 */
	function getErrorMessage(oType) {
		return sap.ui.getCore().getLibraryResourceBundle().getText(
			isDateOnly(oType) ? "EnterDate" : "EnterDateTime",
				[oType.formatValue(oDemoDate, "string")]);
	}

	/*
	 * Returns the formatter. Creates it lazily.
	 *
	 * @param {sap.ui.model.odata.type.DateTimeBase} oType
	 *   The type instance
	 * @returns {sap.ui.core.format.DateFormat}
	 *   The formatter
	 */
	function getFormatter(oType) {
		var oFormatOptions;

		if (!oType.oFormat) {
			oFormatOptions = jQuery.extend({strictParsing : true}, oType.oFormatOptions);
			if (isDateOnly(oType)) {
				oFormatOptions.UTC = true;
				oType.oFormat = DateFormat.getDateInstance(oFormatOptions);
			} else {
				oType.oFormat = DateFormat.getDateTimeInstance(oFormatOptions);
			}
		}
		return oType.oFormat;
	}

	/*
	 * Sets the constraints.
	 *
	 * @param {sap.ui.model.odata.type.DateTimeBase} oType
	 *   The type instance
	 * @param {object} [oConstraints]
	 *   Constraints, see {@link #constructor}
	 */
	function setConstraints(oType, oConstraints) {
		var vNullable,
			iPrecision;

		oType.oConstraints = undefined;
		if (oConstraints) {
			vNullable = oConstraints.nullable;
			if (vNullable === false || vNullable === "false") {
				oType.oConstraints = {nullable : false};
			} else if (vNullable !== undefined && vNullable !== true && vNullable !== "true") {
				jQuery.sap.log.warning("Illegal nullable: " + vNullable, null, oType.getName());
			}

			if (oConstraints.isDateOnly === true) {
				oType.oConstraints = oType.oConstraints || {};
				oType.oConstraints.isDateOnly = true;
			}

			iPrecision = oConstraints.precision;
			if (iPrecision !== undefined) {
				if (iPrecision === Math.floor(iPrecision) && iPrecision >= 1 && iPrecision <= 12) {
					oType.oConstraints = oType.oConstraints || {};
					oType.oConstraints.precision = iPrecision;
				} else if (iPrecision !== 0) {
					jQuery.sap.log.warning("Illegal precision: " + iPrecision, null,
						oType.getName());
				} // else: 0 is the default!
			}
		}
		oType._handleLocalizationChange();
	}

	/**
	 * Base constructor for the primitive types <code>Edm.DateTime</code> and
	 * <code>Edm.DateTimeOffset</code>.
	 *
	 * @param {object} [oFormatOptions]
	 *   Type-specific format options; see subtypes
	 * @param {object} [oConstraints]
	 *   Constraints; {@link #validateValue validateValue} throws an error if any constraint is
	 *   violated
	 * @param {boolean} [oConstraints.isDateOnly=false]
	 *   If <code>true</code>, only the date part is used, the time part is always 00:00:00 and
	 *   the time zone is UTC to avoid time-zone-related problems
	 * @param {boolean|string} [oConstraints.nullable=true]
	 *   If <code>true</code>, the value <code>null</code> is accepted
	 * @param {boolean} [oConstraints.precision=0]
	 *   The number of decimal places allowed in the seconds portion of a valid string value
	 *   (OData V4 only); only integer values between 0 and 12 are valid (since 1.37.0)
	 *
	 * @abstract
	 * @alias sap.ui.model.odata.type.DateTimeBase
	 * @author SAP SE
	 * @class This is an abstract base class for the OData primitive types
	 *   <code>Edm.DateTime</code> and <code>Edm.DateTimeOffset</code>.
	 * @extends sap.ui.model.odata.type.ODataType
	 * @public
	 * @since 1.27.0
	 * @version ${version}
	 */
	var DateTimeBase = ODataType.extend("sap.ui.model.odata.type.DateTimeBase", {
			constructor : function (oFormatOptions, oConstraints) {
				ODataType.apply(this, arguments);
				setConstraints(this, oConstraints);
				this.oFormat = null;
				this.oFormatOptions = oFormatOptions;
			},
			metadata : {
				"abstract" : true
			}
		});

	/**
	 * Formats the given value to the given target type.
	 *
	 * @param {Date} oValue
	 *   The value to be formatted, which is represented in the model as a <code>Date</code>
	 *   instance (OData V2)
	 * @param {string} sTargetType
	 *   The target type, may be "any", "string", or a type with one of these types as its
	 *   {@link sap.ui.base.DataType#getPrimitiveType primitive type}.
	 *   See {@link sap.ui.model.odata.type} for more information.
	 * @returns {Date|string}
	 *   The formatted output value in the target type; <code>undefined</code> or <code>null</code>
	 *   are formatted to <code>null</code>
	 * @throws {sap.ui.model.FormatException}
	 *   If <code>sTargetType</code> is not supported or <code>oValue</code> is not a model value
	 *   for this type.
	 *
	 * @public
	 * @since 1.27.0
	 */
	DateTimeBase.prototype.formatValue = function (oValue, sTargetType) {
		if (oValue === null || oValue === undefined) {
			return null;
		}
		switch (this.getPrimitiveType(sTargetType)) {
		case "any":
			return oValue;
		case "string":
			if (!(oValue instanceof Date)) {
				throw new FormatException("Illegal " + this.getName() + " value: " + oValue);
			}
			return getFormatter(this).format(oValue);
		default:
			throw new FormatException("Don't know how to format " + this.getName() + " to "
				+ sTargetType);
		}
	};

	/**
	 * Parses the given value to a <code>Date</code> instance (OData V2).
	 *
	 * @param {string} sValue
	 *   The value to be parsed; the empty string and <code>null</code> are parsed to
	 *   <code>null</code>
	 * @param {string} sSourceType
	 *   The source type (the expected type of <code>sValue</code>), must be "string", or a type
	 *   with "string" as its {@link sap.ui.base.DataType#getPrimitiveType primitive type}.
	 *   See {@link sap.ui.model.odata.type} for more information.
	 * @returns {Date}
	 *   The parsed value
	 * @throws {sap.ui.model.ParseException}
	 *   If <code>sSourceType</code> is not supported or if the given string cannot be parsed to a
	 *   Date
	 *
	 * @public
	 * @since 1.27.0
	 */
	DateTimeBase.prototype.parseValue = function (sValue, sSourceType) {
		var oResult;

		if (sValue === null || sValue === "") {
			return null;
		}
		switch (this.getPrimitiveType(sSourceType)) {
		case "string":
			oResult = getFormatter(this).parse(sValue);
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
	 * Called by the framework when any localization setting is changed.
	 *
	 * @private
	 */
	DateTimeBase.prototype._handleLocalizationChange = function () {
		this.oFormat = null;
	};

	/**
	 * Validates whether the given value in model representation is valid and meets the
	 * defined constraints.
	 *
	 * @param {Date} oValue
	 *   The value to be validated
	 * @returns {void}
	 * @throws {sap.ui.model.ValidateException}
	 *   If the value is not valid
	 *
	 * @public
	 * @since 1.27.0
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
	 * Returns the type's name.
	 *
	 * @abstract
	 * @alias sap.ui.model.odata.type.DateTimeBase#getName
	 * @protected
	 * @see sap.ui.model.Type#getName
	 */

	return DateTimeBase;
});
