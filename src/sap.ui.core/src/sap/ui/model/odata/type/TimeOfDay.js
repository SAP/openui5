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

	/*
	 * Returns the locale-dependent error message.
	 *
	 * @param {sap.ui.model.odata.type.TimeOfDay} oType
	 *   The type
	 * @returns {string}
	 *   The locale-dependent error message
	 */
	function getErrorMessage(oType) {
		return sap.ui.getCore().getLibraryResourceBundle().getText("EnterTime",
			[oType.formatValue("23:59:58", "string")]);
	}

	/*
	 * Sets the constraints. Logs a warning and uses the constraint's default value, if an invalid
	 * value is given.
	 *
	 * @param {sap.ui.model.odata.type.TimeOfDay} oType
	 *   The type
	 * @param {object} [oConstraints]
	 *   The constraints
	 * @param {boolean} [oConstraints.nullable=true]
	 *   If <code>true</code>, the value <code>null</code> is valid for this type
	 * @param {number} [oConstraints.precision=0]
	 *   The number of decimal places allowed in the seconds portion of a valid value; only
	 *   integer values between 0 and 12 are valid.
	 */
	function setConstraints(oType, oConstraints) {
		var vNullable,
			vPrecision;

		oType.oConstraints = undefined;
		if (oConstraints) {
			vNullable = oConstraints.nullable;
			vPrecision = oConstraints.precision;
			// "true" and "false" not allowed here, because in V4 they are never sent as string
			if (vNullable === false) {
				oType.oConstraints = {nullable : false};
			} else if (vNullable !== undefined && vNullable !== true) {
				Log.warning("Illegal nullable: " + vNullable, null, oType.getName());
			}
			if (vPrecision === Math.floor(vPrecision) && vPrecision > 0 && vPrecision <= 12) {
				oType.oConstraints = oType.oConstraints || {};
				oType.oConstraints.precision = vPrecision;
			} else if (vPrecision !== undefined && vPrecision !== 0) {
				Log.warning("Illegal precision: " + vPrecision, null, oType.getName());
			}
		}
	}

	/**
	 * Constructor for an OData primitive type <code>Edm.TimeOfDay</code>.
	 *
	 * @param {object} [oFormatOptions]
	 *   Format options as defined in {@link sap.ui.core.format.DateFormat.getTimeInstance}
	 * @param {object} [oConstraints]
	 *   Constraints; {@link #validateValue validateValue} throws an error if any constraint is
	 *   violated
	 * @param {boolean} [oConstraints.nullable=true]
	 *   If <code>true</code>, the value <code>null</code> is accepted
	 * @param {number} [oConstraints.precision=0]
	 *   The number of decimal places allowed in the seconds portion of a valid value; must be an
	 *   integer between 0 and 12, otherwise the default value 0 is used.
	 *
	 * @alias sap.ui.model.odata.type.TimeOfDay
	 * @author SAP SE
	 * @class This class represents the OData V4 primitive type {@link
	 *   http://docs.oasis-open.org/odata/odata/v4.0/errata02/os/complete/part3-csdl/odata-v4.0-errata02-os-part3-csdl-complete.html#_The_edm:Documentation_Element
	 *   <code>Edm.TimeOfDay</code>}.
	 *   In {@link sap.ui.model.odata.v4.ODataModel} this type is represented as a
	 *   <code>string</code>.
	 * @extends sap.ui.model.odata.type.ODataType
	 * @public
	 * @since 1.37.0
	 * @version ${version}
	 */
	var TimeOfDay = ODataType.extend("sap.ui.model.odata.type.TimeOfDay", {
			constructor : function (oFormatOptions, oConstraints) {
				ODataType.apply(this, arguments);
				this.oModelFormat = undefined;
				this.rTimeOfDay = undefined;
				this.oFormat = undefined;
				setConstraints(this, oConstraints);
				this.oFormatOptions = oFormatOptions;
			}
		});

	/**
	 * Called by the framework when any localization setting is changed.
	 *
	 * @private
	 * @since 1.37.0
	 */
	TimeOfDay.prototype._handleLocalizationChange = function () {
		this.oFormat = null;
	};

	/**
	 * Resets the model formatter instance which is recreated on demand, for example via
	 * {@link #getModelFormat}, and cached.
	 *
	 * @private
	 */
	TimeOfDay.prototype._resetModelFormatter = function () {
		this.oModelFormat = undefined;
	};

	/**
	 * Formats the given value to the given target type.
	 *
	 * @param {string} sValue
	 *   The value to be formatted, which is represented as a string in the model
	 * @param {string} sTargetType
	 *   The target type, may be "any", "object" (since 1.69.0), "string", or a type with one of
	 *   these types as its {@link sap.ui.base.DataType#getPrimitiveType primitive type}.
	 *   See {@link sap.ui.model.odata.type} for more information
	 * @returns {Date|module:sap/ui/core/date/UI5Date|string}
	 *   The formatted output value in the target type; <code>undefined</code> or <code>null</code>
	 *   are formatted to <code>null</code>
	 * @throws {sap.ui.model.FormatException}
	 *   If <code>sValue</code> is not a valid OData V4 Edm.TimeOfDay value or if
	 *   <code>sTargetType</code> is not supported
	 *
	 * @public
	 * @since 1.37.0
	 */
	TimeOfDay.prototype.formatValue = function (sValue, sTargetType) {
		var oDate,
			iIndex,
			sPrimitiveType;

		if (sValue === undefined || sValue === null) {
			return null;
		}

		sPrimitiveType = this.getPrimitiveType(sTargetType);
		switch (sPrimitiveType) {
			case "any":
				return sValue;
			case "object":
			case "string":
				iIndex = sValue.indexOf(".");
				if (iIndex >= 0) {
					sValue = sValue.slice(0, iIndex + 4); // cut off after milliseconds
				}
				oDate = this.getModelFormat().parse(sValue);
				if (oDate) {
					if (sPrimitiveType === "object") {
						return UI5Date.getInstance(1970, 0, 1, oDate.getUTCHours(), oDate.getUTCMinutes(),
							oDate.getUTCSeconds());
					}
					return this.getFormat().format(oDate);
				}
				throw new FormatException("Illegal " + this.getName() + " value: " + sValue);
			default:
				throw new FormatException("Don't know how to format " + this.getName() + " to "
					+ sTargetType);
		}
	};

	/**
	 * Returns a date object for a given model value.
	 *
	 * @param {string|null} sModelValue
	 *   The model value of this type. Can be retrieved via {@link sap.ui.model.odata.type.TimeOfDay#getModelValue}.
	 * @returns {Date|module:sap/ui/core/date/UI5Date|null}
	 *   An instance of <code>Date</code> for which the local getters <code>getHours()</code>,
	 *   <code>getMinutes()</code>, <code>getSeconds()</code>, and <code>getMilliseconds()</code> can be used to get the
	 *   corresponding hours, minutes, seconds, and milliseconds of the given model value
	 *
	 * @since 1.113.0
	 * @private
	 * @ui5-restricted sap.fe, sap.suite.ui.generic.template, sap.ui.comp, sap.ui.generic
	 */
	TimeOfDay.prototype.getDateValue = function (sModelValue) {
		return sModelValue ? UI5Date.getInstance("1970-01-01T" + sModelValue) : null;
	};

	/**
	 * @override
	 */
	TimeOfDay.prototype.getFormat = function () {
		if (!this.oFormat) {
			var oFormatOptions = extend({strictParsing : true}, this.oFormatOptions);
			oFormatOptions.UTC = true; // value is always UTC; no overwrite via format options
			this.oFormat = DateFormat.getTimeInstance(oFormatOptions);
		}

		return this.oFormat;
	};

	/**
	 * Returns the ISO string for the given model value.
	 *
	 * @param {string|null} sModelValue
	 *   The model value, as returned by {@link #getModelValue}
	 * @returns {string|null}
	 *   The time as string in the extended format without the 'T' according to ISO 8601,
	 *   or <code>null</code> if the given model value is falsy
	 *
	 * @since 1.114.0
	 * @private
	 * @ui5-restricted sap.fe, sap.suite.ui.generic.template, sap.ui.comp, sap.ui.generic
	 */
	TimeOfDay.prototype.getISOStringFromModelValue = function (sModelValue) {
		return sModelValue ? sModelValue : null;
	};

	/**
	 * Returns a formatter that converts between the model format and a Javascript Date. It has two
	 * methods: <code>format</code> takes a Date and returns a date as a String in the format
	 * expected by the model, <code>parse</code> converts from the String to a Date.
	 *
	 * @returns {sap.ui.core.format.DateFormat}
	 *   The formatter
	 *
	 * @override
	 * @protected
	 */
	TimeOfDay.prototype.getModelFormat = function () {
		var sPattern = "HH:mm:ss",
			iPrecision;

		if (!this.oModelFormat) {
			iPrecision = this.oConstraints && this.oConstraints.precision;
			if (iPrecision) {
				sPattern += "." + "".padEnd(iPrecision, "S");
			}
			this.oModelFormat = DateFormat.getTimeInstance({
				calendarType : CalendarType.Gregorian,
				pattern : sPattern,
				strictParsing : true,
				UTC : true
			});
		}
		return this.oModelFormat;
	};

	/**
	 * Gets the model value according to this type's constraints and format options for the given
	 * date object representing a time. Validates the resulting value against the constraints of
	 * this type instance.
	 *
	 * @param {Date|module:sap/ui/core/date/UI5Date|null} oDate
	 *   The date object considering the configured time zone. Must be created via
	 *   {@link module:sap/ui/core/date/UI5Date.getInstance}
	 * @returns {string|null}
	 *   The model representation of the time
	 * @throws {Error}
	 *   If the given date object is not valid or does not consider the configured time zone
	 * @throws {sap.ui.model.ValidateException}
	 *   If the constraints of this type instance are violated
	 *
	 * @public
	 * @since 1.111.0
	 */
	TimeOfDay.prototype.getModelValue = function (oDate) {
		var vResult;

		if (oDate === null) {
			vResult = null;
		} else {
			UI5Date.checkDate(oDate);
			vResult = UI5Date.getInstance(0);
			vResult.setUTCHours(oDate.getHours(), oDate.getMinutes(), oDate.getSeconds(), oDate.getMilliseconds());
			vResult = this.getModelFormat().format(vResult);
		}
		this.validateValue(vResult);

		return vResult;
	};

	/**
	 * Returns the model value for the given ISO string.
	 * The milliseconds part of the string is either truncated or padded with <code>0</code>, so that its length
	 * fits the types precision constraint.
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
	TimeOfDay.prototype.getModelValueFromISOString = function (sISOString) {
		return sISOString
			? this.getModelFormat().format(UI5Date.getInstance("1970-01-01T" + sISOString + "Z"))
			: null;
	};

	/**
	 * Returns the type's name.
	 *
	 * @returns {string}
	 *   The type's name
	 *
	 * @public
	 * @since 1.37.0
	 */
	TimeOfDay.prototype.getName = function () {
		return "sap.ui.model.odata.type.TimeOfDay";
	};

	/**
	 * Parses the given value, which is expected to be of the given type, to a string with an
	 * OData V4 Edm.TimeOfDay value.
	 *
	 * @param {Date|string} vValue
	 *   The value to be parsed, maps <code>""</code> to <code>null</code>; <code>Date</code>
	 *   objects are expected to represent local time and are supported if and only if source type
	 *   is "object".
	 * @param {string} sSourceType
	 *   The source type (the expected type of <code>sValue</code>), must be "string",
	 *   "object" (since 1.69.0) or a type with one of these types as its
	 *   {@link sap.ui.base.DataType#getPrimitiveType primitive type}.
	 *   See {@link sap.ui.model.odata.type} for more information.
	 * @returns {string}
	 *   The parsed value
	 * @throws {sap.ui.model.ParseException}
	 *   If <code>sSourceType</code> is not supported or if the value is invalid and cannot be
	 *   parsed
	 *
	 * @public
	 * @since 1.37.0
	 */
	TimeOfDay.prototype.parseValue = function (vValue, sSourceType) {
		var oDate;

		if (vValue === "" || vValue === null) {
			return null;
		}

		switch (this.getPrimitiveType(sSourceType)) {
			case "object":
				return this.getModelFormat().format(vValue, false);
			case "string":
				oDate = this.getFormat().parse(vValue);
				if (!oDate) {
					throw new ParseException(getErrorMessage(this));
				}
				return this.getModelFormat().format(oDate);
			default:
				throw new ParseException("Don't know how to parse " + this.getName() + " from "
					+ sSourceType);
		}
	};

	/**
	 * Validates the given value in model representation and meets the type's constraints.
	 *
	 * @param {string} sValue
	 *   The value to be validated
	 * @throws {sap.ui.model.ValidateException}
	 *   If the value is not valid
	 *
	 * @public
	 * @since 1.37.0
	 */
	TimeOfDay.prototype.validateValue = function (sValue) {
		var iPrecision;

		if (sValue === null) {
			if (this.oConstraints && this.oConstraints.nullable === false) {
				throw new ValidateException(getErrorMessage(this));
			}
			return;
		}

		if (!this.rTimeOfDay) {
			iPrecision = this.oConstraints && this.oConstraints.precision;
			// @see sap.ui.model.odata._AnnotationHelperExpression
			this.rTimeOfDay = new RegExp("^(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d"
				+ (iPrecision ? "(\\.\\d{1," + iPrecision + "})?" : "")
				+ ")?$");
		}
		if (!this.rTimeOfDay.test(sValue)) {
			throw new ValidateException("Illegal sap.ui.model.odata.type.TimeOfDay value: "
				+ sValue);
		}
	};

	return TimeOfDay;
});