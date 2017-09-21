/*!
 * ${copyright}
 */

// Provides the base implementation for all model implementations
sap.ui.define(['sap/ui/base/DataType', './Type', './FormatException', './ParseException', './ValidateException'],
	function(DataType, Type /*, kept for compatibility with existing referers: FormatException, ParseException, ValidateException*/) {
	"use strict";

	var oModelFormat = {
		format: function(oValue) {
			return oValue;
		},
		parse: function(oValue) {
			return oValue;
		}
	};

	/**
	 * Constructor for a new SimpleType.
	 *
	 * @class
	 * This is an abstract base class for simple types.
	 * @abstract
	 *
	 * @extends sap.ui.model.Type
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @param {object} [oFormatOptions] options as provided by concrete subclasses
	 * @param {object} [oConstraints] constraints as supported by concrete subclasses
	 * @public
	 * @alias sap.ui.model.SimpleType
	 */
	var SimpleType = Type.extend("sap.ui.model.SimpleType", /** @lends sap.ui.model.SimpleType.prototype */ {

		constructor : function(oFormatOptions, oConstraints) {
			Type.apply(this, arguments);
			this.setFormatOptions(oFormatOptions || {});
			this.setConstraints(oConstraints || {});
			this.sName = "SimpleType";
		},

		metadata : {
			"abstract" : true,
			publicMethods : [
				"setConstraints", "setFormatOptions", "formatValue", "parseValue", "validateValue"
			]
		}

	});

	/**
	 * Format the given value in model representation to an output value in the given
	 * internal type. This happens according to the format options, if target type is 'string'.
	 * If oValue is not defined or null, null will be returned.
	 *
	 * @function
	 * @name sap.ui.model.SimpleType.prototype.formatValue
	 * @param {any} oValue the value to be formatted
	 * @param {string} sInternalType the target type
	 * @return {any} the formatted output value
	 *
	 * @public
	 */

	/**
	 * Parse a value of an internal type to the expected value of the model type.
	 *
	 * @function
	 * @name sap.ui.model.SimpleType.prototype.parseValue
	 * @param {any} oValue the value to be parsed
	 * @param {string} sInternalType the source type
	 * @return {any} the parse result
	 *
	 * @public
	 */

	/**
	 * Validate whether a given value in model representation is valid and meets the
	 * defined constraints (if any).
	 *
	 * @function
	 * @name sap.ui.model.SimpleType.prototype.validateValue
	 * @param {any} oValue the value to be validated
	 *
	 * @public
	 */

	/**
	 * Returns an object which has <code>format</code> and <code>parse</code> method.
	 * These two methods are used for converting between the raw value which is stored in the model and
	 * the related primitive type in JavaScript.
	 *
	 * If a instance of {@link sap.ui.core.format.DateFormat#constructor DateFormat} or
	 * {@link sap.ui.core.format.NumberFormat#constructor NumberFormat} fits the needs, they could also be used as return value.
	 *
	 * The default implementation of the <code>format</code> and <code>parse</code> method simply returns
	 * the given parameter. The subclass of {@link sap.ui.model.SimpleType#constructor SimpleType} should override this method if the raw value
	 * isn't already a JavaScript primitive type. The overwritten method must return an object which has the
	 * <code>format</code> and <code>parse</code> method implemented.
	 *
	 * For example<br>
	 * If the type is related to a JavaScript Date object, but the raw value isn't, this method
	 * should return an instance of {@link sap.ui.core.format.DateFormat#constructor DateFormat}, which is able to convert between the raw value
	 * and a JavaScript Date object.
	 *
	 * @return {object} The format which converts between the raw value from the model and the related JavaScript primitive type
	 *
	 * @protected
	 */
	SimpleType.prototype.getModelFormat = function() {
		return oModelFormat;
	};

	/**
	 * Sets constraints for this type. This is meta information used when validating the
	 * value, to ensure it meets certain criteria, e.g. maximum length, minimal amount
	 *
	 * @param {object} oConstraints the constraints to set for this type
	 */
	SimpleType.prototype.setConstraints = function(oConstraints) {
		this.oConstraints = oConstraints;
	};

	/**
	 * Set format options for this type. This is meta information used when formatting and
	 * parsing values, such as patterns for number and date formatting or maximum length
	 *
	 * @param {object} oFormatOptions the options to set for this type
	 */
	SimpleType.prototype.setFormatOptions = function(oFormatOptions) {
		this.oFormatOptions = oFormatOptions;
	};

	/**
	 * Returns the primitive type name for the given internal type name
	 *
	 * @param {string} sInternalType the internal type name
	 * @return {string} the primitive type name
	 */
	SimpleType.prototype.getPrimitiveType = function(sInternalType) {
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
	 * Combine message texts.
	 * Join multiple messages into a combined message text
	 *
	 * @param {array} aMessages an array of message strings
	 * @return {string} the combined message text
	 */
	SimpleType.prototype.combineMessages = function(aMessages) {
		if (aMessages.length === 1) {
			return aMessages[0];
		} else {
			return aMessages.join(". ") + ".";
		}
	};

	return SimpleType;

});
