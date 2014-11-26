/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/model/FormatException',
		'sap/ui/model/ParseException', 'sap/ui/model/SimpleType',
		'sap/ui/model/ValidateException', 'sap/ui/model/type/String'],
	function(FormatException, ParseException, SimpleType, ValidateException, StringType) {
	"use strict";

	/**
	 * Constructor for an OData primitive type <code>Edm.String</code>.
	 *
	 * @class This class represents the OData primitive type <a
	 * href="http://www.odata.org/documentation/odata-version-2-0/overview#AbstractTypeSystem">
	 * <code>Edm.String</code></a>.
	 *
	 * @extends sap.ui.model.SimpleType
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @alias sap.ui.model.odata.type.String
	 * @param {object} [oFormatOptions]
	 * 	 format options, none so far
	 * @param {object} [oConstraints]
	 * 	 constraints, see {@link #setConstraints}
	 * @public
	 * @since 1.27.0
	 */
	var EdmString = SimpleType.extend("sap.ui.model.odata.type.String",
			/** @lends sap.ui.model.odata.type.String.prototype */
			{
				constructor : function () {
					SimpleType.apply(this, arguments);
					this.sName = "sap.ui.model.odata.type.String";
			}
		});

	/**
	 * Format the given value to the given target type. When formatting to <code>string</code>
	 * the formatting options will be taken into account.
	 *
	 * @function
	 * @param {string} sValue
	 *   the value to be formatted
	 * @param {string} sTargetType
	 *   the target type
	 * @return {string|number|boolean}
	 *   the formatted output value in the target type; <code>undefined</code> or <code>null</code>
	 *   will be formatted to <code>null</code>
	 * @throws sap.ui.model.FormatException
	 *   if <code>sTargetType</code> is unsupported or the string cannot be formatted to the target
	 *   type
	 * @public
	 */
	EdmString.prototype.formatValue = StringType.prototype.formatValue;

	/**
	 * Parse the given value which is expected to be of the given type to a string.
	 *
	 * @function
	 * @param {string|number|boolean} vValue
	 *   the value to be parsed
	 * @param {string} sSourceType
	 *   the source type (the expected type of <code>sValue</code>)
	 * @return {string}
	 *   the parsed value
	 * @throws sap.ui.model.ParseException
	 *   if <code>sSourceType</code> is unsupported
	 * @public
	 */
	EdmString.prototype.parseValue = StringType.prototype.parseValue;

	/**
	 * Validate whether the given value in model representation is valid and meets the
	 * defined constraints (if any).
	 *
	 * @function
	 * @param {string} sValue
	 *   the value to be validated
	 * @throws sap.ui.model.ValidateException if the value is not valid
	 * @public
	 */
	EdmString.prototype.validateValue = StringType.prototype.validateValue;

	/**
	 * Set the constraints.
	 *
	 * @param {object} [oConstraints]
	 * 	 constraints
	 * @param {int} [oConstraints.maxLength]
	 *   the maximal allowed length of the string; unlimited if not defined
	 * @public
	 */
	EdmString.prototype.setConstraints = function(oConstraints) {
		var iMaxLength;

		this.oConstraints = {};
		if (oConstraints && oConstraints.hasOwnProperty("maxLength")) {
			iMaxLength = oConstraints.maxLength;
			if (typeof iMaxLength === "number" && iMaxLength > 0) {
				this.oConstraints.maxLength = iMaxLength;
			} else {
				jQuery.sap.log.warning("Illegal maxLength: " + iMaxLength,
					null, "sap.ui.model.odata.type.String");
			}
		}
	};

	return EdmString;
});
