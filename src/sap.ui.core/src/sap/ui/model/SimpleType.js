/*!
 * ${copyright}
 */

// Provides the base implementation for all simple type implementations that are able to format,
// parse and validate values
sap.ui.define([
	'sap/ui/base/DataType',
	'./Type',
	'./FormatException',
	'./ParseException',
	'./ValidateException'
], function (DataType, Type /*, kept for compatibility with existing referrers: FormatException, ParseException, ValidateException*/) {
	"use strict";

	// A formatter that returns the given value in <code>format</code> and <code>parse</code>
	var oModelFormat = {
			format: function (oValue) {
				return oValue;
			},
			parse: function (oValue) {
				return oValue;
			}
		};

	/**
	 * Constructor for a new SimpleType.
	 *
	 * @param {object} [oFormatOptions] Format options as defined by concrete subclasses
	 * @param {object} [oConstraints] Constraints as defined by concrete subclasses
	 *
	 * @abstract
	 * @alias sap.ui.model.SimpleType
	 * @author SAP SE
	 * @class
	 *   This is an abstract base class for simple types. A simple type can format a raw model value
	 *   based on the given format options, parse an external value based on the given format
	 *   options and validate the raw model value based on the given constraints. An implementation
	 *   of a simple type needs to implement {@link #formatValue}, {@link #parseValue} and
	 *   {@link #validateValue}. If the raw value, which is the value in model representation, isn't
	 *   already a JavaScript primitive type, subclasses must override {@link #getModelFormat}.
	 *
	 * @extends sap.ui.model.Type
	 * @public
	 * @version ${version}
	 */
	var SimpleType = Type.extend("sap.ui.model.SimpleType", /** @lends sap.ui.model.SimpleType.prototype */ {

		constructor : function (oFormatOptions, oConstraints) {
			Type.apply(this, arguments);
			this.setFormatOptions(oFormatOptions || {});
			this.setConstraints(oConstraints || {});
			this.sName = "SimpleType";
		},

		metadata : {
			"abstract" : true
		}
	});

	/**
	 * Formats the given raw value to an output value of the given target type. This happens
	 * according to the format options if the target type is <code>string</code>. If
	 * <code>vValue</code> is not defined or <code>null</code>, <code>null</code> is returned.
	 *
	 * @param {any} vValue
	 *   The value to be formatted
	 * @param {string} sTargetType
	 *   The target type; see {@link topic:ac56d92162ed47ff858fdf1ce26c18c4 Allowed Property Types}
	 * @return {any|Promise}
	 *   The formatted output value or a <code>Promise</code> resolving with the formatted value
	 * @throws {sap.ui.model.FormatException}
	 *   If formatting to the target type is not possible
	 *
	 * @abstract
	 * @function
	 * @name sap.ui.model.SimpleType.prototype.formatValue
	 * @public
	 */

	/**
	 * Parses an external value of the given source type to the corresponding value in model
	 * representation.
	 *
	 * @param {any} vValue
	 *   The value to be parsed
	 * @param {string} sSourceType
	 *   The type of the given value; see
	 *   {@link topic:ac56d92162ed47ff858fdf1ce26c18c4 Allowed Property Types}
	 * @return {any|Promise}
	 *   The raw value or a <code>Promise</code> resolving with the raw value
	 * @throws {sap.ui.model.ParseException}
	 *   If parsing to the model type is not possible; the message of the exception is language
	 *   dependent as it may be displayed on the UI
	 *
	 * @abstract
	 * @function
	 * @name sap.ui.model.SimpleType.prototype.parseValue
	 * @public
	 */

	/**
	 * Validates whether a given raw value meets the defined constraints. This method does nothing
	 * if no constraints are defined.
	 *
	 * @param {any} vValue
	 *   The value to be validated
	 * @return {Promise}
	 *   <code>undefined</code> or a <code>Promise</code> resolving with an undefined value
	 * @throws {sap.ui.model.ValidateException}
	 *   If at least one of the type constraints are not met; the message of the exception is
	 *   language dependent as it may be displayed on the UI
	 *
	 * @abstract
	 * @function
	 * @name sap.ui.model.SimpleType.prototype.validateValue
	 * @public
	 */

	/**
	 * Returns an object with <code>format</code> and <code>parse</code> methods.
	 * <code>format</code> converts the internal value which has a JavaScript primitive type or is a
	 * built-in object such as Date which can be used by a control to the raw value, and
	 * <code>parse</code> converts the raw value to the internal value.
	 *
	 * You may return an instance of {@link sap.ui.core.format.DateFormat#constructor DateFormat} or
	 * {@link sap.ui.core.format.NumberFormat#constructor NumberFormat}.
	 *
	 * The default implementation of the <code>format</code> and <code>parse</code> methods simply
	 * returns the given parameter. Subclasses of
	 * {@link sap.ui.model.SimpleType#constructor SimpleType} should override this method if the raw
	 * value isn't already a JavaScript primitive type. The overwritten method must return an object
	 * which has the <code>format</code> and <code>parse</code> methods implemented.
	 *
	 * Example:<br>
	 * If the type is related to a JavaScript <code>Date</code> object, but the raw value isn't,
	 * this method should return an instance of
	 * {@link sap.ui.core.format.DateFormat#constructor DateFormat}, which is able to convert
	 * between the raw value and a JavaScript <code>Date</code> object.
	 *
	 * @return {object}
	 *   A conversion object
	 *
	 * @protected
	 */
	SimpleType.prototype.getModelFormat = function () {
		if (this.oInputFormat) {
			return this.oInputFormat;
		}
		return oModelFormat;
	};

	/**
	 * Sets constraints for this type, which are used to validate the value.
	 *
	 * @param {object} oConstraints The constraints as defined by concrete subclasses
	 *
	 * @private
	 */
	SimpleType.prototype.setConstraints = function (oConstraints) {
		this.oConstraints = oConstraints;
	};

	/**
	 * Sets format options for this type, which are used for formatting and parsing values.
	 *
	 * @param {object} oFormatOptions The format options as defined by concrete subclasses
	 *
	 * @private
	 */
	SimpleType.prototype.setFormatOptions = function (oFormatOptions) {
		this.oFormatOptions = oFormatOptions;
	};

	/**
	 * Returns the primitive type name for the given internal data type name.
	 *
	 * @param {string} sInternalType The internal data type name
	 * @return {string} The primitive type name; see
	 *   {@link topic:ac56d92162ed47ff858fdf1ce26c18c4 Allowed Property Types}
	 *
	 * @see sap.ui.base.DataType#getPrimitiveType
	 * @see sap.ui.base.DataType#getType
	 */
	SimpleType.prototype.getPrimitiveType = function (sInternalType) {
		// Avoid dealing with type objects, unless really necessary
		switch (sInternalType) {
			case "any":
			case "boolean":
			case "int":
			case "float":
			case "string":
			case "object":
				return sInternalType;
			default:
				var oInternalType = DataType.getType(sInternalType);
				return oInternalType && oInternalType.getPrimitiveType().getName();
		}
	};

	/**
	 * Combines the given message texts by concatenating them, separated by a '.'.
	 *
	 * @param {string[]} aMessages
	 *   An array of message strings
	 * @return {string}
	 *   The combined message text
	 */
	SimpleType.prototype.combineMessages = function (aMessages) {
		if (aMessages.length === 1) {
			return aMessages[0];
		} else {
			return aMessages.join(". ") + ".";
		}
	};

	return SimpleType;
});