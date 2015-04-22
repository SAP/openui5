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
	 * @alias sap.ui.model.type.Boolean
	 */
	var BooleanType = SimpleType.extend("sap.ui.model.type.Boolean", /** @lends sap.ui.model.type.Boolean.prototype */ {

		constructor : function () {
			SimpleType.apply(this, arguments);
			this.sName = "Boolean";
		}

	});

	/**
	 * @see sap.ui.model.SimpleType.prototype.formatValue
	 */
	BooleanType.prototype.formatValue = function(bValue, sInternalType) {
		if (bValue == undefined || bValue == null) {
			return null;
		}
		switch (this.getPrimitiveType(sInternalType)) {
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
	 */
	BooleanType.prototype.parseValue = function(oValue, sInternalType) {
		var oBundle;
		switch (this.getPrimitiveType(sInternalType)) {
			case "boolean":
				return oValue;
			case "string":
				if (oValue.toLowerCase() == "true" || oValue == "X") {
					return true;
				}
				if (oValue.toLowerCase() == "false" || oValue == "" || oValue == " ") {
					return false;
				}
				oBundle = sap.ui.getCore().getLibraryResourceBundle();
				throw new sap.ui.model.ParseException(oBundle.getText("Boolean.Invalid"));
			case "int": // TODO return 1 for true?!
			case "float":
			default:
				throw new sap.ui.model.ParseException("Don't know how to parse Boolean from " + sInternalType);
		}
	};

	/**
	 * @see sap.ui.model.SimpleType.prototype.validateValue
	 */
	BooleanType.prototype.validateValue = function(sValue) {

	};



	return BooleanType;

}, /* bExport= */ true);
