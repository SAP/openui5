/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/CalendarType",
	"sap/ui/core/date/UI5Date",
	"sap/ui/core/format/DateFormat",
	"sap/ui/model/FormatException",
	"sap/ui/model/odata/type/DateTimeBase"
], function (Log, CalendarType, UI5Date, DateFormat, FormatException, DateTimeBase) {
	"use strict";

	/**
	 * Constructor for a primitive type <code>Edm.DateTimeOffset</code>.
	 *
	 * @class This class represents the OData primitive type <a
	 *   href="http://www.odata.org/documentation/odata-version-2-0/overview#AbstractTypeSystem">
	 *   <code>Edm.DateTimeOffset</code></a>.
	 *
	 *   In {@link sap.ui.model.odata.v2.ODataModel} this type is represented as a
	 *   <code>Date</code> instance in local time. In {@link sap.ui.model.odata.v4.ODataModel} this
	 *   type is represented as a <code>string</code> like "1970-12-31T23:59:58Z". See parameter
	 *   <code>oConstraints.V4</code> for more information.
	 *
	 * @extends sap.ui.model.odata.type.DateTimeBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @alias sap.ui.model.odata.type.DateTimeOffset
	 * @param {object} [oFormatOptions]
	 *   Format options as defined in {@link sap.ui.core.format.DateFormat.getDateTimeInstance}
	 * @param {object} [oConstraints]
	 *   Constraints; {@link sap.ui.model.odata.type.DateTimeBase#validateValue validateValue}
	 *   throws an error if any constraint is violated
	 * @param {boolean|string} [oConstraints.nullable=true]
	 *   If <code>true</code>, the value <code>null</code> is accepted
	 * @param {boolean} [oConstraints.precision=0]
	 *   The number of decimal places allowed in the seconds portion of a valid string value
	 *   (OData V4 only); only integer values between 0 and 12 are valid (since 1.37.0)
	 * @param {boolean} [oConstraints.V4=false]
	 *   Whether OData V4 semantics apply and the model representation is expected to be a
	 *   <code>string</code> like "1970-12-31T23:59:58Z" (see {@link #parseValue} and
	 *   {@link #validateValue}); this type automatically adapts itself whenever it is used within
	 *   an OData V4 model via {@link sap.ui.model.odata.v4.ODataPropertyBinding#setType}.
	 * @public
	 * @since 1.27.0
	 */
	var DateTimeOffset = DateTimeBase.extend("sap.ui.model.odata.type.DateTimeOffset", {
			constructor : function (oFormatOptions, oConstraints) {
				var bV4;

				DateTimeBase.call(this, oFormatOptions, {
					nullable : oConstraints ? oConstraints.nullable : undefined,
					precision : oConstraints ? oConstraints.precision : undefined
				});
				this.rDateTimeOffset = undefined; // @see #validateValue
				this.oModelFormat = undefined;
				this.bV4 = false; // @see #setV4
				if (oConstraints) {
					bV4 = oConstraints.V4;
					if (bV4 === true) {
						this.bV4 = true;
					} else if (bV4 !== undefined && bV4 !== false) {
						Log.warning("Illegal V4: " + bV4, null, this.getName());
					}
				}
			}
		});

	/*
	 * Returns a date format instance for the OData V4 model format.
	 * Creates it lazily.
	 *
	 * @param {sap.ui.model.odata.type.DateTimeOffset} oType
	 *   The type
	 * @returns {sap.ui.core.format.DateFormat}
	 *   The date format
	 */
	function getModelFormat(oType) {
		var sPattern = "yyyy-MM-dd'T'HH:mm:ss",
			iPrecision;

		if (!oType.oModelFormat) {
			iPrecision = oType.oConstraints && oType.oConstraints.precision;
			if (iPrecision) {
				sPattern += "." + "".padEnd(iPrecision, "S");
			}
			oType.oModelFormat = DateFormat.getDateInstance({
				calendarType : CalendarType.Gregorian,
				pattern : sPattern + "XXX",
				strictParsing : true,
				UTC : oType.oFormatOptions && oType.oFormatOptions.UTC
			});
		}
		return oType.oModelFormat;
	}

	/**
	 * Resets the model formatter instance which is recreated on demand, for example via
	 * {@link #getModelFormat}, and cached.
	 *
	 * @private
	 */
	DateTimeOffset.prototype._resetModelFormatter = function () {
		this.oModelFormat = undefined;
	};

	/**
	 * Formats the given value to the given target type.
	 *
	 * @param {Date|string} [vValue]
	 *   The value to be formatted, which is represented in the model as a <code>Date</code>
	 *   instance (OData V2) or as a string like "1970-12-31T23:59:58Z" (OData V4); both
	 *   representations are accepted independent of the model's OData version
	 * @param {string} sTargetType
	 *   The target type, may be "any", "object" (since 1.69.0), "string", or a type with one of
	 *   these types as its {@link sap.ui.base.DataType#getPrimitiveType primitive type}.
	 *   See {@link sap.ui.model.odata.type} for more information.
	 * @returns {Date|module:sap/ui/core/date/UI5Date|string}
	 *   The formatted output value in the target type; <code>undefined</code> or <code>null</code>
	 *   are formatted to <code>null</code>
	 * @throws {sap.ui.model.FormatException}
	 *   If <code>sTargetType</code> is not supported
	 *
	 * @public
	 * @since 1.27.0
	 */
	DateTimeOffset.prototype.formatValue = function (vValue, sTargetType) {
		var oDateValue;

		if (vValue === undefined || vValue === null) {
			return null;
		}
		if (this.getPrimitiveType(sTargetType) === "object") {
			if (vValue instanceof Date) {
				return UI5Date.getInstance(vValue.getUTCFullYear(), vValue.getUTCMonth(), vValue.getUTCDate(),
					vValue.getUTCHours(), vValue.getUTCMinutes(), vValue.getUTCSeconds());
			}
			return getModelFormat(this).parse(vValue);
		}
		if (typeof vValue === "string" && this.getPrimitiveType(sTargetType) === "string") {
			oDateValue = getModelFormat(this).parse(vValue);
			if (!oDateValue) {
				throw new FormatException("Illegal " + this.getName() + " value: " + vValue);
			}
			vValue = oDateValue;
		}
		return DateTimeBase.prototype.formatValue.call(this, vValue, sTargetType);
	};

	// @override
	// @see sap.ui.model.SimpleType#getConstraints
	DateTimeOffset.prototype.getConstraints = function () {
		var oConstraints = DateTimeBase.prototype.getConstraints.call(this);

		if (this.bV4) {
			oConstraints.V4 = true;
		}

		return oConstraints;
	};

	/**
	 * Returns the ISO string for the given model value.
	 *
	 * @param {string|Date|module:sap/ui/core/date/UI5Date|null} vModelValue
	 *   The model value, as returned by {@link #getModelValue}
	 * @returns {string|null}
	 *   A timestamp according to ISO 8601, or <code>null</code> if the given model value is falsy
	 *
	 * @since 1.114.0
	 * @private
	 * @ui5-restricted sap.fe, sap.suite.ui.generic.template, sap.ui.comp, sap.ui.generic
	 */
	DateTimeOffset.prototype.getISOStringFromModelValue = function (vModelValue) {
		if (!vModelValue) {
			return null;
		}

		return this.bV4 ? vModelValue : vModelValue.toISOString();
	};

	/**
	 * Returns a formatter that converts between the model format and a Javascript Date. It has two
	 * methods: <code>format</code> and <code>parse</code>.
	 *
	 * If the type is in V4 semantics, <code>format</code> takes a Date and returns a date as a
	 * String in the format expected by the model, <code>parse</code> converts from the String to a
	 * Date. Otherwise the methods simply pass through, since the model already contains a Date in
	 * V2.
	 *
	 * @returns {sap.ui.core.format.DateFormat}
	 *   The formatter
	 *
	 * @override
	 * @protected
	 */
	DateTimeOffset.prototype.getModelFormat = function () {
		if (this.bV4) {
			return getModelFormat(this);
		}
		return DateTimeBase.prototype.getModelFormat.call(this);
	};

	/**
	 * Gets the model value according to this type's constraints and format options for the given
	 * date object which represents a timestamp in the configured time zone. Validates the resulting
	 * value against the constraints of this type instance.
	 *
	 * @param {Date|module:sap/ui/core/date/UI5Date|null} oDate
	 *   The date object considering the configured time zone. Must be created via
	 *   {@link module:sap/ui/core/date/UI5Date.getInstance}
	 * @returns {Date|module:sap/ui/core/date/UI5Date|string|null}
	 *   The model representation for the given Date
	 * @throws {Error}
	 *   If the given date object is not valid or does not consider the configured time zone
	 * @throws {sap.ui.model.ValidateException}
	 *   If the constraints of this type instance are violated
	 *
	 * @public
	 * @since 1.111.0
	 */
	DateTimeOffset.prototype.getModelValue = function (oDate) {
		var oResult = this._getModelValue(oDate);

		if (this.bV4 && oResult !== null) {
			oResult = this.getModelFormat().format(oResult);
		}
		this.validateValue(oResult);

		return oResult;
	};

	/**
	 * Returns the model value for the given ISO string.
	 *
	 * In case the <code>V4</code> constraint is set to <code>true</code>, the milliseconds part of the string is
	 * either truncated or padded with <code>0</code>, so that its length fits the types precision constraint.
	 *
	 * @param {string|null} sISOString
	 *   A string according to ISO 8601, as returned by {@link #getISOStringFromModelValue}
	 * @returns {string|Date|module:sap/ui/core/date/UI5Date|null}
	 *   The model representation for the given ISO string for this type,
	 *   or <code>null</code> if the given ISO string is falsy
	 *
	 * @since 1.114.0
	 * @private
	 * @ui5-restricted sap.fe, sap.suite.ui.generic.template, sap.ui.comp, sap.ui.generic
	 */
	DateTimeOffset.prototype.getModelValueFromISOString = function (sISOString) {
		if (!sISOString) {
			return null;
		}

		return this.bV4
			? this.getModelFormat().format(UI5Date.getInstance(sISOString), true)
			: UI5Date.getInstance(sISOString);
	};

	/**
	 * Returns the type's name.
	 *
	 * @returns {string}
	 *   The type's name
	 * @public
	 */
	DateTimeOffset.prototype.getName = function () {
		return "sap.ui.model.odata.type.DateTimeOffset";
	};

	/**
	 * Parses the given value to a <code>Date</code> instance (OData V2) or a string like
	 * "1970-12-31T23:59:58Z" (OData V4), depending on the model's OData version.
	 *
	 * @param {Date|string} vValue
	 *   The value to be parsed; the empty string and <code>null</code> are parsed to
	 *   <code>null</code>; <code>Date</code> objects are expected to represent local time and are
	 *   supported if and only if source type is "object".
	 * @param {string} sSourceType
	 *   The source type (the expected type of <code>vValue</code>), must be "string",
	 *   "object" (since 1.69.0), or a type with one of these types as its
	 *   {@link sap.ui.base.DataType#getPrimitiveType primitive type}.
	 *   See {@link sap.ui.model.odata.type} for more information.
	 * @returns {Date|module:sap/ui/core/date/UI5Date|string}
	 *   The parsed value
	 * @throws {sap.ui.model.ParseException}
	 *   If <code>sSourceType</code> is not supported or if the given string cannot be parsed to a
	 *   Date
	 *
	 * @public
	 * @since 1.27.0
	 */
	DateTimeOffset.prototype.parseValue = function (vValue, sSourceType) {
		var oResult = DateTimeBase.prototype.parseValue.call(this, vValue, sSourceType);

		return this.bV4 && oResult !== null
			? getModelFormat(this).format(oResult)
			: oResult;
	};

	/**
	 * Sets OData V4 semantics for this type instance.
	 *
	 * @returns {this}
	 *   <code>this</code> to allow method chaining
	 *
	 * @private
	 */
	DateTimeOffset.prototype.setV4 = function () {
		this.bV4 = true;
		return this;
	};

	/**
	 * Validates whether the given value in model representation is valid and meets the
	 * defined constraints, depending on the model's OData version.
	 *
	 * @param {any} vValue
	 *   The value to be validated
	 * @throws {sap.ui.model.ValidateException}
	 *   If the value is not valid
	 *
	 * @public
	 * @since 1.27.0
	 */
	DateTimeOffset.prototype.validateValue = function (vValue) {
		var iPrecision;

		if (this.bV4) {
			if (typeof vValue === "string") {
				if (!this.rDateTimeOffset) {
					iPrecision = this.oConstraints && this.oConstraints.precision;
					// @see sap.ui.model.odata._AnnotationHelperExpression
					this.rDateTimeOffset = new RegExp("^"
						+ "\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])" // sDateValue
						+ "T"
						+ "(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d"
						+ (iPrecision ? "(\\.\\d{1," + iPrecision + "})?" : "")
						+ ")?" // sTimeOfDayValue
						+ "(?:Z|[-+](?:0\\d|1[0-3]):[0-5]\\d|[-+]14:00)$", "i");
				}
				if (this.rDateTimeOffset.test(vValue)) {
					return;
				} // else: DateTimeBase#validateValue throws
			} else if (vValue) {
				vValue = vValue.toString();
				// now DateTimeBase#validateValue throws, but message stays the same ;-)
			}
		}
		DateTimeBase.prototype.validateValue.call(this, vValue);
	};

	return DateTimeOffset;
});