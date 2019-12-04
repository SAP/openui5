/*!
 * ${copyright}
 */

// Provides the base implementation for all model implementations
sap.ui.define(['sap/ui/model/SimpleType', 'sap/ui/model/FormatException', 'sap/ui/model/ParseException'],
	function(SimpleType, FormatException, ParseException) {
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
	 * @public
	 * @param {object} [oFormatOptions]
	 *   Format options as defined in the interface of {@link sap.ui.model.SimpleType}; this
	 *   type ignores them, since it does not support any format options
	 * @param {object} [oConstraints]
	 *   Constraints as defined in the interface of {@link sap.ui.model.SimpleType}; this
	 *   type ignores them, since it does not support any constraints
	 * @alias sap.ui.model.type.Boolean
	 */
	var BooleanType = SimpleType.extend("sap.ui.model.type.Boolean", /** @lends sap.ui.model.type.Boolean.prototype */ {

		constructor : function () {
			SimpleType.apply(this, arguments);
			this.sName = "Boolean";
		}

	});

	BooleanType.prototype.formatValue = function(bValue, sInternalType) {
		if (bValue == undefined || bValue == null) {
			return null;
		}
		switch (this.getPrimitiveType(sInternalType)) {
			case "any":
			case "boolean":
				return bValue;
			case "string":
				return bValue.toString();
			default:
				throw new FormatException("Don't know how to format Boolean to " + sInternalType);
		}
	};

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
				throw new ParseException(oBundle.getText("Boolean.Invalid"));
			default:
				throw new ParseException("Don't know how to parse Boolean from " + sInternalType);
		}
	};

	BooleanType.prototype.validateValue = function() {};

	return BooleanType;
});
