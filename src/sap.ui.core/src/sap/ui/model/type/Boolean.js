/*!
 * ${copyright}
 */

// Provides the base implementation for all model implementations
sap.ui.define(['jquery.sap.global', 'sap/ui/core/format/NumberFormat', 'sap/ui/model/SimpleType'],
	function(jQuery, NumberFormat, SimpleType) {
	"use strict";


	/**
	 * Constructor for a Boolean type.
	 *
	 * @class
	 * This class represents boolean simple types.
	 *
	 * @extends sap.ui.model.SimpleType
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @param {object} [oFormatOptions] formatting options. Boolean doesn't support any specific format options
	 * @param {object} [oConstraints] value constraints. Boolean doesn't support additional constraints
	 * @name sap.ui.model.type.Boolean
	 */
	var BooleanType = SimpleType.extend("sap.ui.model.type.Boolean", /** @lends sap.ui.model.type.Boolean.prototype */ {

		constructor : function () {
			SimpleType.apply(this, arguments);
			this.sName = "Boolean";
		}

	});

	/**
	 * Creates a new subclass of class sap.ui.model.type.Boolean with name <code>sClassName</code>
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
	 * @name sap.ui.model.type.Boolean.extend
	 * @function
	 */

	/**
	 * @see sap.ui.model.SimpleType.prototype.formatValue
	 * @name sap.ui.model.type.Boolean#formatValue
	 * @function
	 */
	BooleanType.prototype.formatValue = function(bValue, sInternalType) {
		if (bValue == undefined || bValue == null) {
			return null;
		}
		switch (sInternalType) {
			case "boolean":
			case "any":
				return bValue;
			case "string":
				return bValue.toString();
			case "int": // TODO return 1 for true?!
			case "float":
			default:
				throw new sap.ui.model.FormatException("Don't know how to format Boolean to " + sInternalType);
		}
	};

	/**
	 * @see sap.ui.model.SimpleType.prototype.parseValue
	 * @name sap.ui.model.type.Boolean#parseValue
	 * @function
	 */
	BooleanType.prototype.parseValue = function(oValue, sInternalType) {
		switch (sInternalType) {
			case "boolean":
				return oValue;
			case "string":
				if (oValue.toLowerCase() == "true" || oValue == "X") {
					return true;
				}
				if (oValue.toLowerCase() == "false" || oValue == "") {
					return false;
				}
				throw new sap.ui.model.ParseException("Don't know how to parse Boolean from " + sInternalType);
			case "int": // TODO return 1 for true?!
			case "float":
			default:
				throw new sap.ui.model.ParseException("Don't know how to parse Boolean from " + sInternalType);
		}
	};

	/**
	 * @see sap.ui.model.SimpleType.prototype.validateValue
	 * @name sap.ui.model.type.Boolean#validateValue
	 * @function
	 */
	BooleanType.prototype.validateValue = function(sValue) {

	};



	return BooleanType;

}, /* bExport= */ true);
