/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/format/DateFormat', 'sap/ui/model/FormatException',
        'sap/ui/model/ParseException', 'sap/ui/model/SimpleType',
        'sap/ui/model/ValidateException'],
	function(DateFormat, FormatException, ParseException, SimpleType, ValidateException) {
	"use strict";

	var oDemoTime = {
			__edmType: "Edm.Time",
			ms: 49646000 // "13:47:26"
		};

	/**
	 * Returns the locale-dependent error message.
	 *
	 * @param {sap.ui.model.odata.type.Time} oType
	 *   the type
	 * @returns {string}
	 *   the locale-dependent error message.
	 * @private
	 */
	function getErrorMessage(oType) {
		return sap.ui.getCore().getLibraryResourceBundle().getText("EnterTime",
			[oType.formatValue(oDemoTime, "string")]);
	}

	/**
	 * Verifies that the given object is really a time object in the model format.
	 * @param {any} o
	 *   the object to test
	 * @returns {boolean}
	 *   <code>true</code> if it is a time object
	 */
	function isTime(o) {
		return typeof o === "object" && o.__edmType === "Edm.Time" && typeof o.ms === "number";
	}

	/**
	 * Converts the given time object to a Date.
	 * @param {object} oTime
	 *   the time object
	 * @returns {Date}
	 *   a Date with hour, minute, second and milliseconds set according to the time object.
	 * @throws FormatException if the time object's format does not match
	 */
	function toDate(oTime) {
		if (!isTime(oTime)) {
			throw new FormatException("Illegal sap.ui.model.odata.type.Time value: "
				+ toString(oTime));
		}
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
			__edmType: "Edm.Time",
			ms: ((oDate.getUTCHours() * 60 + oDate.getUTCMinutes()) * 60 + oDate.getUTCSeconds())
				* 1000 // TODO + oDate.getUTCMilliseconds()
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
	 * @class This class represents the OData primitive type <a
	 * href="http://www.odata.org/documentation/odata-version-2-0/overview#AbstractTypeSystem">
	 * <code>Edm.Time</code></a>.
	 *
	 * @extends sap.ui.model.SimpleType
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @alias sap.ui.model.odata.type.Time
	 * @param {object} [oFormatOptions]
	 *   format options; this type does not support any format options
	 * @param {object} [oConstraints]
	 *   constraints
	 * @param {boolean|string} [oConstraints.nullable=true]
	 *   if <code>true</code>, the value <code>null</code> is accepted
	 * @public
	 * @since 1.27.0
	 */
	var Time = SimpleType.extend("sap.ui.model.odata.type.Time",
			/** @lends sap.ui.model.odata.type.Time.prototype */
			{
				constructor : function (oFormatOptions, oConstraints) {
					this.setConstraints(oConstraints);
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
	 *   the target type
	 * @returns {string}
	 *   the formatted output value in the target type; <code>undefined</code> or <code>null</code>
	 *   is formatted to <code>null</code>
	 * @throws sap.ui.model.FormatException
	 *   if <code>sTargetType</code> is unsupported
	 * @public
	 */
	Time.prototype.formatValue = function(oValue, sTargetType) {
		if (oValue === undefined || oValue === null) {
			return null;
		}
		switch (sTargetType) {
		case "any":
			return oValue;
		case "string":
			return this._getFormatter().format(toDate(oValue));
		default:
			throw new FormatException("Don't know how to format " + this.getName() + " to "
				+ sTargetType);
		}
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
	 *   the source type (the expected type of <code>sValue</code>)
	 * @returns {object}
	 *   the parsed value as described in {@link #formatValue}
	 * @throws sap.ui.model.ParseException
	 *   if <code>sSourceType</code> is unsupported
	 * @public
	 */
	Time.prototype.parseValue = function (sValue, sSourceType) {
		var oDate;

		if (sValue === "" || sValue === null) {
			return null;
		}
		if (sSourceType !== "string") {
			throw new ParseException("Don't know how to parse " + this.getName() + " from "
				+ sSourceType);
		}
		oDate = this._getFormatter().parse(sValue);
		if (!oDate) {
			throw new ParseException(getErrorMessage(this));
		}
		return toModel(oDate);
	};

	/**
	 * Sets the constraints.
	 *
	 * @param {object} [oConstraints]
	 *   constraints
	 * @param {boolean|string} [oConstraints.nullable=true]
	 *   if <code>true</code>, the value <code>null</code> is accepted; note that
	 *   {@link #parseValue} maps <code>""</code> to <code>null</code>
	 * @private
	 */
	Time.prototype.setConstraints = function(oConstraints) {
		var vNullable = oConstraints && oConstraints.nullable;

		this.oConstraints = undefined;
		if (vNullable === false || vNullable === "false") {
			this.oConstraints = {nullable: false};
		} else if (vNullable !== undefined && vNullable !== true && vNullable !== "true") {
			jQuery.sap.log.warning("Illegal nullable: " + vNullable, null, this.getName());
		}
	};

	/**
	 * Validates whether the given value in model representation is valid and meets the
	 * defined constraints (if any).
	 *
	 * @param {object} oValue
	 *   the value to be validated
	 * @throws sap.ui.model.ValidateException if the value is not valid
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
	 * Returns the formatter. Creates it lazily.
	 * @return {sap.ui.core.format.DateFormat}
	 *   the formatter
	 * @private
	 */
	Time.prototype._getFormatter = function () {
		if (!this.oFormat) {
			this.oFormat = DateFormat.getTimeInstance({strictParsing: true, UTC: true});
		}
		return this.oFormat;
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
