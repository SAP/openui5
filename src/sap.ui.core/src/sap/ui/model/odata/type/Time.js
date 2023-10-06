/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/base/util/extend",
	"sap/ui/core/date/UI5Date",
	"sap/ui/core/format/DateFormat",
	"sap/ui/model/FormatException",
	"sap/ui/model/ParseException",
	"sap/ui/model/ValidateException",
	"sap/ui/model/odata/type/ODataType"
], function (Log, extend, UI5Date, DateFormat, FormatException, ParseException, ValidateException,
		ODataType) {
	"use strict";

	var oDemoTime = {
			__edmType : "Edm.Time",
			ms : 86398000 // "23:59:58"
		},
		// a "formatter" like DateFormat, see getModelFormat
		oModelFormat = {
			format: toModel,
			parse: toDate
		};

	/**
	 * Returns the locale-dependent error message.
	 *
	 * @param {sap.ui.model.odata.type.Time} oType
	 *   the type
	 * @returns {string}
	 *   the locale-dependent error message
	 * @private
	 */
	function getErrorMessage(oType) {
		return sap.ui.getCore().getLibraryResourceBundle().getText("EnterTime",
			[oType.formatValue(oDemoTime, "string")]);
	}

	/**
	 * Verifies that the given object is really a <code>Time</code> object in the model format.
	 * @param {any} o
	 *   the object to test
	 * @returns {boolean}
	 *   <code>true</code>, if it is a time object
	 */
	function isTime(o) {
		return typeof o === "object" && o.__edmType === "Edm.Time" && typeof o.ms === "number";
	}

	/**
	 * Sets the constraints.
	 *
	 * @param {sap.ui.model.odata.type.Time} oType
	 *   the <code>Time</code> instance
	 * @param {object} [oConstraints]
	 *   constraints
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
	 * Converts the given time object to a Date.
	 * @param {object} oTime
	 *   the <code>Time</code> object
	 * @returns {Date}
	 *   a Date with hour, minute, second and milliseconds set according to the time object.
	 * @throws FormatException if the time object's format does not match
	 */
	function toDate(oTime) {
		if (!isTime(oTime)) {
			throw new FormatException("Illegal sap.ui.model.odata.type.Time value: "
				+ toString(oTime));
		}
		// no need to use UI5Date.getInstance as only the UTC timestamp is relevant
		return new Date(oTime.ms);
	}

	/**
	 * Converts the given Date to a time object.
	 * @param {Date} oDate
	 *   the date (day, month and year are ignored)
	 * @returns {object}
	 *   a time object with __edmType and ms
	 */
	function toModel(oDate) {
		return {
			__edmType : "Edm.Time",
			ms : ((oDate.getUTCHours() * 60 + oDate.getUTCMinutes()) * 60 + oDate.getUTCSeconds())
				* 1000 + oDate.getUTCMilliseconds()
		};
	}

	/**
	 * Converts the object to a string. Prefers JSON.stringify if possible.
	 * @param {any} v
	 *   the object
	 * @returns {string}
	 *   <code>v</code> converted to a string
	 */
	function toString(v) {
		try {
			return JSON.stringify(v);
		} catch (e) {
			return String(v);
		}
	}

	/**
	 * Constructor for an OData primitive type <code>Edm.Time</code>.
	 *
	 * @class This class represents the OData V2 primitive type <a
	 * href="http://www.odata.org/documentation/odata-version-2-0/overview#AbstractTypeSystem">
	 * <code>Edm.Time</code></a>.
	 *
	 * In {@link sap.ui.model.odata.v2.ODataModel ODataModel} this type is represented as an
	 * object with two properties:
	 * <ul>
	 * <li><code>__edmType</code> with the value "Edm.Time"
	 * <li><code>ms</code> with the number of milliseconds since midnight
	 * </ul>
	 *
	 * @extends sap.ui.model.odata.type.ODataType
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @alias sap.ui.model.odata.type.Time
	 * @param {object} [oFormatOptions]
	 *   Format options as defined in {@link sap.ui.core.format.DateFormat.getTimeInstance}
	 * @param {object} [oConstraints]
	 *   constraints; {@link #validateValue validateValue} throws an error if any constraint is
	 *   violated
	 * @param {boolean|string} [oConstraints.nullable=true]
	 *   if <code>true</code>, the value <code>null</code> is accepted; note that
	 *   {@link #parseValue} maps <code>""</code> to <code>null</code>
	 * @public
	 * @since 1.27.0
	 */
	var Time = ODataType.extend("sap.ui.model.odata.type.Time", {
				constructor : function (oFormatOptions, oConstraints) {
					ODataType.apply(this, arguments);
					setConstraints(this, oConstraints);
					this.oFormatOptions = oFormatOptions;
			}
		});

	/**
	 * Formats the given value to the given target type
	 *
	 * @param {object} oValue
	 *   the value in model representation to be formatted.
	 * @param {string} oValue.__edmType
	 *   the type has to be "Edm.Time"
	 * @param {number} oValue.ms
	 *   the time in milliseconds
	 * @param {string} sTargetType
	 *   the target type; may be "any", "string", or a type with one of these types as its
	 *   {@link sap.ui.base.DataType#getPrimitiveType primitive type}.
	 *   See {@link sap.ui.model.odata.type} for more information.
	 * @returns {string}
	 *   the formatted output value in the target type; <code>undefined</code> or <code>null</code>
	 *   are formatted to <code>null</code>
	 * @throws {sap.ui.model.FormatException}
	 *   if <code>sTargetType</code> is unsupported
	 * @public
	 */
	Time.prototype.formatValue = function (oValue, sTargetType) {
		if (oValue === undefined || oValue === null) {
			return null;
		}
		switch (this.getPrimitiveType(sTargetType)) {
			case "any":
				return oValue;
			case "string":
				return this.getFormat().format(toDate(oValue));
			default:
				throw new FormatException("Don't know how to format " + this.getName() + " to "
					+ sTargetType);
		}
	};

	/**
	 * Returns a date object for a given model value.
	 *
	 * @param {object|null} oModelValue
	 *   The model value of this type. Can be retrieved via {@link sap.ui.model.odata.type.Time#getModelValue}.
	 * @param {int} oModelValue.ms
	 *   The time in milliseconds, ranging from 0 (1970-01-01T00:00:00.000Z) to 86399999 (1970-01-01T23:59:59.999Z)
	 * @returns {Date|module:sap/ui/core/date/UI5Date|null}
	 *   An instance of <code>Date</code> for which the local getters <code>getHours()</code>,
	 *   <code>getMinutes()</code>, <code>getSeconds()</code>, and <code>getMilliseconds()</code> can be used to get the
	 *   corresponding hours, minutes, seconds, and milliseconds of the given model value
	 *
	 * @since 1.113.0
	 * @private
	 * @ui5-restricted sap.fe, sap.suite.ui.generic.template, sap.ui.comp, sap.ui.generic
	 */
	Time.prototype.getDateValue = function (oModelValue) {
		var oResult;

		if (!oModelValue) {
			return null;
		}

		oResult = UI5Date.getInstance(oModelValue.ms);
		oResult.setFullYear(1970, 0, 1);
		oResult.setHours(oResult.getUTCHours(), oResult.getUTCMinutes(), oResult.getUTCSeconds(),
			oResult.getUTCMilliseconds());

		return oResult;
	};

	/**
	 * @override
	 */
	Time.prototype.getFormat = function () {
		if (!this.oFormat) {
			var oFormatOptions = extend({strictParsing : true}, this.oFormatOptions);
			oFormatOptions.UTC = true;
			this.oFormat = DateFormat.getTimeInstance(oFormatOptions);
		}

		return this.oFormat;
	};

	/**
	 * Returns the ISO string for the given model value.
	 *
	 * @param {object|null} oModelValue
	 *   The model value, as returned by {@link #getModelValue}
	 * @param {int} oModelValue.ms
	 *   The time in milliseconds, ranging from 0 (1970-01-01T00:00:00.000Z) to 86399999 (1970-01-01T23:59:59.999Z)
	 * @returns {string|null}
	 *   The time as string in the extended format without the 'T' e.g. "23:58:59.123" according to ISO 8601,
	 *   or <code>null</code> if the given model value is falsy
	 *
	 * @since 1.114.0
	 * @private
	 * @ui5-restricted sap.fe, sap.suite.ui.generic.template, sap.ui.comp, sap.ui.generic
	 */
	Time.prototype.getISOStringFromModelValue = function (oModelValue) {
		if (!oModelValue) {
			return null;
		}

		return UI5Date.getInstance(oModelValue.ms).toISOString().slice(11, -1);
	};

	/**
	 * Returns a formatter that converts between the model format and a Javascript Date. It has two
	 * methods: <code>format</code> takes a Date and returns an object as described in
	 * {@link sap.ui.model.odata.type.Time}, <code>parse</code> converts from the object to a Date.
	 *
	 * @returns {sap.ui.core.format.DateFormat}
	 *   The formatter
	 *
	 * @override
	 * @protected
	 */
	Time.prototype.getModelFormat = function () {
		return oModelFormat;
	};

	/**
	 * Gets the model value according to this type's constraints and format options for the given
	 * date object representing a time. Validates the resulting value against the constraints of
	 * this type instance.
	 *
	 * @param {Date|module:sap/ui/core/date/UI5Date|null} oDate
	 *   The date object considering the configured time zone. Must be created via
	 *   {@link module:sap/ui/core/date/UI5Date.getInstance}
	 * @returns {{__edmType: string, ms: int}|null}
	 *   The model representation of the time
	 * @throws {Error}
	 *   If the given date object is not valid or does not consider the configured time zone
	 * @throws {sap.ui.model.ValidateException}
	 *   If the constraints of this type instance are violated
	 *
	 * @public
	 * @since 1.111.0
	 */
	Time.prototype.getModelValue = function (oDate) {
		var oResult;

		if (oDate === null) {
			oResult = null;
		} else {
			UI5Date.checkDate(oDate);
			oResult = UI5Date.getInstance(0);
			oResult.setUTCHours(oDate.getHours(), oDate.getMinutes(), oDate.getSeconds(), oDate.getMilliseconds());
			oResult = toModel(oResult);
		}
		this.validateValue(oResult);

		return oResult;
	};

	/**
	 * Returns the model value for the given ISO string.
	 *
	 * @param {string|null} sISOString
	 *   A string according to ISO 8601, as returned by {@link #getISOStringFromModelValue}
	 * @returns {{__edmType: string, ms: int}|null}
	 *   The model representation for the given ISO string for this type, or <code>null</code> if
	 *   the given ISO string is falsy
	 *
	 * @since 1.114.0
	 * @private
	 * @ui5-restricted sap.fe, sap.suite.ui.generic.template, sap.ui.comp, sap.ui.generic
	 */
	Time.prototype.getModelValueFromISOString = function (sISOString) {
		if (!sISOString) {
			return null;
		}

		return toModel(UI5Date.getInstance("1970-01-01T" + sISOString + "Z"));
	};

	/**
	 * Returns the type's name.
	 *
	 * @returns {string}
	 *   the type's name
	 * @public
	 */
	Time.prototype.getName = function () {
		return "sap.ui.model.odata.type.Time";
	};

	/**
	 * Parses the given value, which is expected to be of the given type, to a time object.
	 *
	 * @param {string} sValue
	 *   the value to be parsed, maps <code>""</code> to <code>null</code>
	 * @param {string} sSourceType
	 *   the source type (the expected type of <code>sValue</code>); must be "string", or a type
	 *   with "string" as its {@link sap.ui.base.DataType#getPrimitiveType primitive type}.
	 *   See {@link sap.ui.model.odata.type} for more information.
	 * @returns {object}
	 *   the parsed value as described in {@link #formatValue formatValue}
	 * @throws {sap.ui.model.ParseException}
	 *   if <code>sSourceType</code> is unsupported
	 * @public
	 */
	Time.prototype.parseValue = function (sValue, sSourceType) {
		var oDate;

		if (sValue === "" || sValue === null) {
			return null;
		}
		if (this.getPrimitiveType(sSourceType) !== "string") {
			throw new ParseException("Don't know how to parse " + this.getName() + " from "
				+ sSourceType);
		}
		oDate = this.getFormat().parse(sValue);
		if (!oDate) {
			throw new ParseException(getErrorMessage(this));
		}
		return toModel(oDate);
	};

	/**
	 * Validates whether the given value in model representation is valid and meets the
	 * defined constraints.
	 *
	 * @param {object} oValue
	 *   the value to be validated
	 * @throws {sap.ui.model.ValidateException} if the value is not valid
	 * @public
	 */
	Time.prototype.validateValue = function (oValue) {
		if (oValue === null) {
			if (this.oConstraints && this.oConstraints.nullable === false) {
				throw new ValidateException(getErrorMessage(this));
			}
			return;
		}
		if (!isTime(oValue)) {
			throw new ValidateException("Illegal " + this.getName() + " value: "
				+ toString(oValue));
		}
	};

	/**
	 * Called by the framework when any localization setting changed.
	 * @private
	 */
	Time.prototype._handleLocalizationChange = function () {
		this.oFormat = null;
	};

	return Time;
});