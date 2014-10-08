/*!
 * ${copyright}
 */

// Provides the base implementation for all model implementations
sap.ui.define(['jquery.sap.global', './FormatException', './ParseException', './Type', './ValidateException'],
	function(jQuery, FormatException, ParseException, Type, ValidateException) {
	"use strict";


	
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
	 * @constructor
	 * @param {object} [oFormatOptions] options as provided by concrete subclasses
	 * @param {object} [oConstraints] constraints as supported by concrete subclasses
	 * @public
	 * @name sap.ui.model.SimpleType
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
	 * Creates a new subclass of class sap.ui.model.SimpleType with name <code>sClassName</code> 
	 * and enriches it with the information contained in <code>oClassInfo</code>.
	 * 
	 * For a detailed description of <code>oClassInfo</code> or <code>FNMetaImpl</code> 
	 * see {@link sap.ui.base.Object.extend Object.extend}.
	 *   
	 * @param {string} sClassName name of the class to be created
	 * @param {object} [oClassInfo] object literal with informations about the class  
	 * @param {function} [FNMetaImpl] alternative constructor for a metadata object
	 * @return {function} the created class / constructor function
	 * @public
	 * @static
	 * @name sap.ui.model.SimpleType.extend
	 * @function
	 */
	
	
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
	 * Sets constraints for this type. This is meta information used when validating the
	 * value, to ensure it meets certain criteria, e.g. maximum length, minimal amount
	 *
	 * @param {object} oConstraints the constraints to set for this type
	 * @name sap.ui.model.SimpleType#setConstraints
	 * @function
	 */
	SimpleType.prototype.setConstraints = function(oConstraints) {
		this.oConstraints = oConstraints;
	};
	
	/**
	 * Set format options for this type. This is meta information used when formatting and
	 * parsing values, such as patterns for number and date formatting or maximum length
	 *
	 * @param {object} oFormatOptions the options to set for this type
	 * @name sap.ui.model.SimpleType#setFormatOptions
	 * @function
	 */
	SimpleType.prototype.setFormatOptions = function(oFormatOptions) {
		this.oFormatOptions = oFormatOptions;
	};

	return SimpleType;

}, /* bExport= */ true);
