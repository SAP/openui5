/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/CalendarType",
	"sap/ui/core/format/DateFormat",
	"sap/ui/model/FormatException",
	"sap/ui/model/ParseException",
	"sap/ui/model/ValidateException",
	"sap/ui/model/odata/type/ODataType",
	"sap/ui/thirdparty/jquery"
], function (Log, CalendarType, DateFormat, FormatException, ParseException, ValidateException,
		ODataType, jQuery) {
	"use strict";

	var rDate = /\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])/,
		oDemoDate = new Date().getFullYear() + "-12-31",
		oModelFormatter;

	/**
	 * Returns the matching locale-dependent error message for the type based on the constraints.
	 *
	 * @param {sap.ui.model.odata.type.Date} oType
	 *   the type
	 * @returns {string}
	 *   the locale-dependent error message
	 */
	function getErrorMessage(oType) {
		return sap.ui.getCore().getLibraryResourceBundle().getText("EnterDate",
			[oType.formatValue(oDemoDate, "string")]);
	}

	/**
	 * Returns the formatter. Creates it lazily.
	 * @param {sap.ui.model.odata.type.Date} oType
	 *   the type instance
	 * @returns {sap.ui.core.format.DateFormat}
	 *   the formatter
	 */
	function getFormatter(oType) {
		var oFormatOptions;

		if (!oType.oFormat) {
			oFormatOptions = jQuery.extend({strictParsing : true}, oType.oFormatOptions);
			oFormatOptions.UTC = true;
			oType.oFormat = DateFormat.getDateInstance(oFormatOptions);
		}
		return oType.oFormat;
	}

	/**
	 * Returns a formatter that formats the date into yyyy-MM-dd. Creates it lazily.
	 *
	 * @returns {sap.ui.core.format.DateFormat}
	 *   the formatter
	 */
	function getModelFormatter() {
		if (!oModelFormatter) {
			oModelFormatter = DateFormat.getDateInstance({
				calendarType : CalendarType.Gregorian,
				pattern : 'yyyy-MM-dd',
				strictParsing : true,
				UTC : true
			});
		}
		return oModelFormatter;
	}

	/**
	 * Sets the constraints.
	 *
	 * @param {sap.ui.model.odata.type.Date} oType
	 *   the type instance
	 * @param {object} [oConstraints]
	 *   constraints, see {@link #constructor}
	 */
	function setConstraints(oType, oConstraints) {
		var vNullable;

		oType.oConstraints = undefined;
		if (oConstraints) {
			vNullable = oConstraints.nullable;
			if (vNullable === false || vNullable === "false") {
				oType.oConstraints = {nullable : false};
			} else if (vNullable !== undefined && vNullable !== true && vNullable !== "true") {
				Log.warning("Illegal nullable: " + vNullable, null, oType.getName());
			}
		}
	}

	/**
	 * Constructor for an OData primitive type <code>Edm.Date</code>.
	 *
	 * @class This class represents the OData V4 primitive type <code>Edm.Date</code>.
	 *
	 * In {@link sap.ui.model.odata.v4.ODataModel} this type is represented as a
	 * <code>string</code> in the format "yyyy-MM-dd".
	 *
	 * <b>Note: For an OData V2 service use {@link sap.ui.model.odata.type.DateTime} with the
	 * constraint <code>displayFormat: "Date"</code> to display only a date.</b>
	 *
	 * @extends sap.ui.model.odata.type.ODataType
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @alias sap.ui.model.odata.type.Date
	 * @param {object} [oFormatOptions]
	 *   format options as defined in {@link sap.ui.core.format.DateFormat}
	 * @param {object} [oConstraints]
	 *   constraints; {@link #validateValue validateValue} throws an error if any constraint is
	 *   violated
	 * @param {boolean|string} [oConstraints.nullable=true]
	 *   if <code>true</code>, the value <code>null</code> is accepted
	 * @public
	 * @since 1.37.0
	 * @see http://docs.oasis-open.org/odata/odata/v4.0/odata-v4.0-part3-csdl.html
	 */
	var EdmDate = ODataType.extend("sap.ui.model.odata.type.Date",
			/** @lends sap.ui.model.odata.type.Date.prototype */
			{
				constructor : function (oFormatOptions, oConstraints) {
					ODataType.apply(this, arguments);
					this.oFormatOptions = oFormatOptions;
					setConstraints(this, oConstraints);
				}
			}
		);

	/**
	 * Called by the framework if localization settings have changed.
	 * @private
	 */
	EdmDate.prototype._handleLocalizationChange = function () {
		this.oFormat = null;
	};

	/**
	 * Formats the given value to the given target type.
	 *
	 * @param {string|Date} vValue
	 *   the value to be formatted; <code>string</code> values are expected in the format
	 *   "yyyy-MM-dd" used by OData V4; <code>Date</code> objects are expected to represent UTC as
	 *   used by OData V2
	 * @param {string} sTargetType
	 *   the target type; may be "any", "object" (since 1.69.0), "string", or a type with one of
	 *   these types as its {@link sap.ui.base.DataType#getPrimitiveType primitive type}; see
	 *   {@link sap.ui.model.odata.type} for more information.
	 * @returns {string|Date}
	 *   the formatted output value in the target type; <code>undefined</code> or <code>null</code>
	 *   are formatted to <code>null</code>; <code>Date</code> objects are returned for target type
	 *   "object" and represent the given date with time "00:00:00" in local time
	 * @throws {sap.ui.model.FormatException}
	 *   if <code>sTargetType</code> is unsupported
	 * @public
	 */
	EdmDate.prototype.formatValue = function (vValue, sTargetType) {
		var oDate;

		if (vValue === undefined || vValue === null) {
			return null;
		}
		switch (this.getPrimitiveType(sTargetType)) {
		case "any":
			return vValue;
		case "object":
			return vValue instanceof Date
				? new Date(vValue.getUTCFullYear(), vValue.getUTCMonth(), vValue.getUTCDate())
				: getModelFormatter().parse(vValue, false);
		case "string":
			oDate = vValue instanceof Date ? vValue : getModelFormatter().parse(vValue);
			return oDate ? getFormatter(this).format(oDate) : vValue;
		default:
			throw new FormatException("Don't know how to format " + this.getName() + " to "
				+ sTargetType);
		}
	};

	/**
	 * Returns a formatter that converts between the model format and a Javascript Date. It has two
	 * methods: <code>format</code> takes a Date and returns a date as a String in the format
	 * expected by the model, <code>parse</code> converts from the String to a Date.
	 *
	 * @returns {sap.ui.core.format.DateFormat}
	 *   the formatter
	 *
	 * @override
	 * @protected
	 */
	EdmDate.prototype.getModelFormat = function () {
		return getModelFormatter();
	};

	/**
	 * Returns the type's name.
	 *
	 * @returns {string}
	 *   the type's name
	 * @public
	 */
	EdmDate.prototype.getName = function () {
		return "sap.ui.model.odata.type.Date";
	};

	/**
	 * Parses the given value to a date.
	 *
	 * @param {string|Date} vValue
	 *   the value to be parsed, maps <code>""</code> to <code>null</code>; <code>Date</code>
	 *   objects are expected to represent local time and are supported if and only if source type
	 *   is "object"
	 * @param {string} sSourceType
	 *   the source type (the expected type of <code>vValue</code>); must be "object" (since
	 *   1.69.0), "string", or a type with one of these types as its
	 *   {@link sap.ui.base.DataType#getPrimitiveType primitive type}; see
	 *   {@link sap.ui.model.odata.type} for more information.
	 * @returns {string}
	 *   the parsed value in the format "yyyy-MM-dd" used by OData V4
	 * @throws {sap.ui.model.ParseException}
	 *   if <code>sSourceType</code> is unsupported
	 * @public
	 */
	EdmDate.prototype.parseValue = function (vValue, sSourceType) {
		var oResult;
		if (vValue === "" || vValue === null) {
			return null;
		}
		switch (this.getPrimitiveType(sSourceType)) {
		case "object":
			return getModelFormatter().format(vValue, false);
		case "string":
			oResult = getFormatter(this).parse(vValue);
			if (!oResult) {
				throw new ParseException(getErrorMessage(this));
			}
			return getModelFormatter().format(oResult);
		default:
			throw new ParseException("Don't know how to parse " + this.getName() + " from "
				+ sSourceType);
		}
	};

	/**
	 * Validates whether the given value in model representation is valid and meets the
	 * given constraints.
	 *
	 * @param {string} sValue
	 *   the value to be validated
	 * @throws {sap.ui.model.ValidateException}
	 *   if the value is not valid
	 * @public
	 */
	EdmDate.prototype.validateValue = function (sValue) {
		if (sValue === null) {
			if (this.oConstraints && this.oConstraints.nullable === false) {
				throw new ValidateException(getErrorMessage(this));
			}
		} else if (typeof sValue !== "string" || !rDate.test(sValue)) {
			throw new ValidateException("Illegal " + this.getName() + " value: " + sValue);
		}
	};

	//*********************************************************************************************
	// "static" functions
	//*********************************************************************************************

	/**
	 * Resets the static model formatter instance which is recreated on demand, for example via
	 * {@link #getModelFormat}, and cached.
	 *
	 * @private
	 */
	EdmDate._resetModelFormatter = function () {
		oModelFormatter = undefined;
	};

	return EdmDate;
});