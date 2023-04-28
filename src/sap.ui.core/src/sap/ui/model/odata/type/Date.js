/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/base/util/extend",
	"sap/ui/core/CalendarType",
	"sap/ui/core/date/UI5Date",
	"sap/ui/core/format/DateFormat",
	"sap/ui/model/FormatException",
	"sap/ui/model/ParseException",
	"sap/ui/model/ValidateException",
	"sap/ui/model/odata/type/ODataType"
], function (Log, extend, CalendarType, UI5Date, DateFormat, FormatException, ParseException,
		ValidateException, ODataType) {
	"use strict";

	var rDate = /\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])/,
		oModelFormatter;

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
	 *   Format options as defined in {@link sap.ui.core.format.DateFormat.getDateInstance}
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
	 * @returns {string|Date|module:sap/ui/core/date/UI5Date}
	 *   the formatted output value in the target type; <code>undefined</code> or <code>null</code>
	 *   are formatted to <code>null</code>; <code>Date</code> objects are returned for target type
	 *   "object" and represent the given date with time "00:00:00" in the configured time zone
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
					? UI5Date.getInstance(vValue.getUTCFullYear(), vValue.getUTCMonth(), vValue.getUTCDate())
					: getModelFormatter().parse(vValue, false);
			case "string":
				oDate = vValue instanceof Date ? vValue : getModelFormatter().parse(vValue);
				return oDate ? this.getFormat().format(oDate) : vValue;
			default:
				throw new FormatException("Don't know how to format " + this.getName() + " to "
					+ sTargetType);
		}
	};

	/**
	 * Returns the matching locale-dependent error message for the type based on the constraints.
	 *
	 * @returns {string}
	 *   The locale-dependent error message
	 *
	 * @private
	 */
	EdmDate.prototype._getErrorMessage = function () {
		var sDemoDate = UI5Date.getInstance().getFullYear() + "-12-31";

		return sap.ui.getCore().getLibraryResourceBundle().getText("EnterDate",
			[this.formatValue(sDemoDate, "string")]);
	};

	/**
	 * Returns a date object for a given model value.
	 *
	 * @param {string|null} sModelValue
	 *   The model value of this type. Can be retrieved via {@link sap.ui.model.odata.type.Date#getModelValue}.
	 * @returns {Date|module:sap/ui/core/date/UI5Date|null}
	 *   An instance of <code>Date</code> for which the local getters <code>getDate()</code>, <code>getMonth()</code>,
	 *   and <code>getFullYear()</code> can be used to get the corresponding day, month, and year of the given model
	 *   value
	 *
	 * @since 1.113.0
	 * @private
	 * @ui5-restricted sap.fe, sap.suite.ui.generic.template, sap.ui.comp, sap.ui.generic
	 */
	EdmDate.prototype.getDateValue = function (sModelValue) {
		return sModelValue ? UI5Date.getInstance(sModelValue + "T00:00") : null;
	};

	/**
	 * @override
	 */
	EdmDate.prototype.getFormat = function () {
		if (!this.oFormat) {
			var oFormatOptions = extend({strictParsing : true}, this.oFormatOptions);
			oFormatOptions.UTC = true;
			this.oFormat = DateFormat.getDateInstance(oFormatOptions);
		}

		return this.oFormat;
	};

	/**
	 * Returns the ISO string for the given model value.
	 *
	 * @param {string|null} sModelValue
	 *   The model value, as returned by {@link #getModelValue}
	 * @returns {string|null}
	 *   A date string according to ISO 8601, or <code>null</code> if the given model value is falsy
	 *
	 * @since 1.114.0
	 * @private
	 * @ui5-restricted sap.fe, sap.suite.ui.generic.template, sap.ui.comp, sap.ui.generic
	 */
	EdmDate.prototype.getISOStringFromModelValue = function (sModelValue) {
		return sModelValue ? sModelValue : null;
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
	 * Gets the model value according to this type's constraints and format options for the given
	 * date object representing a date. Validates the resulting value against the constraints of
	 * this type instance.
	 *
	 * @param {Date|module:sap/ui/core/date/UI5Date|null} oDate
	 *   The date object considering the configured time zone. Must be created via
	 *   {@link module:sap/ui/core/date/UI5Date.getInstance}
	 * @returns {string|null}
	 *   The model representation of the date
	 * @throws {Error}
	 *   If the given date object is not valid or does not consider the configured time zone
	 * @throws {sap.ui.model.ValidateException}
	 *   If the constraints of this type instance are violated
	 *
	 * @public
	 * @since 1.111.0
	 */
	EdmDate.prototype.getModelValue = function (oDate) {
		var vResult;

		if (oDate === null) {
			vResult = null;
		} else {
			UI5Date.checkDate(oDate);
			vResult = UI5Date.getInstance(0);
			vResult.setUTCFullYear(oDate.getFullYear(), oDate.getMonth(), oDate.getDate());
			vResult = this.getModelFormat().format(vResult);
		}
		this.validateValue(vResult);

		return vResult;
	};

	/**
	 * Returns the model value for the given ISO string.
	 *
	 * @param {string|null} sISOString
	 *   A string according to ISO 8601, as returned by {@link #getISOStringFromModelValue}
	 * @returns {string|null}
	 *   The model representation for the given ISO string for this type,
	 *   or <code>null</code> if the given ISO string is falsy
	 *
	 * @since 1.114.0
	 * @private
	 * @ui5-restricted sap.fe, sap.suite.ui.generic.template, sap.ui.comp, sap.ui.generic
	 */
	EdmDate.prototype.getModelValueFromISOString = function (sISOString) {
		return sISOString ? sISOString : null;
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
				oResult = this.getFormat().parse(vValue);
				if (!oResult) {
					throw new ParseException(this._getErrorMessage());
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
				throw new ValidateException(this._getErrorMessage());
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