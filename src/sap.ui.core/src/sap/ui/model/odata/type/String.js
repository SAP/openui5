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
	 * @returns {string|number|boolean}
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
	 * @param {string|number|boolean} vValue
	 *   the value to be parsed, maps <code>""</code> to <code>null</code>
	 * @param {string} sSourceType
	 *   the source type (the expected type of <code>sValue</code>)
	 * @returns {string}
	 *   the parsed value
	 * @throws sap.ui.model.ParseException
	 *   if <code>sSourceType</code> is unsupported
	 * @public
	 */
	EdmString.prototype.parseValue = function (vValue, sSourceType) {
		return vValue === "" ? null : StringType.prototype.parseValue.apply(this, arguments);
	};

	/**
	 * Validate whether the given value in model representation is valid and meets the
	 * defined constraints (if any).
	 *
	 * @param {string} sValue
	 *   the value to be validated
	 * @throws sap.ui.model.ValidateException if the value is not valid
	 * @public
	 */
	EdmString.prototype.validateValue = function (sValue) {
		var oConstraints = this.oConstraints || {},
			iMaxLength = oConstraints.maxLength;

		if (sValue === null) {
			if (oConstraints.nullable !== false) {
				return;
			}
		} else if (typeof sValue !== "string") {
			throw new ValidateException("Illegal " + this.getName() + " value: " + sValue);
		} else if (!iMaxLength || sValue.length <= iMaxLength) {
			return;
		}
		throw new ValidateException(sap.ui.getCore().getLibraryResourceBundle().getText(
			iMaxLength ? "EnterTextMaxLength" : "EnterText", [iMaxLength]));
	};

	/**
	 * Set format options.
	 *
	 * @param {object} oFormatOptions
	 *   the format options (none so far)
	 * @public
	 */
	EdmString.prototype.setFormatOptions = function(oFormatOptions) {
		// no format options supported yet
	};

	/**
	 * Set the constraints.
	 *
	 * @param {object} [oConstraints]
	 *   constraints
	 * @param {int|string} [oConstraints.maxLength]
	 *   the maximal allowed length of the string; unlimited if not defined
	 * @param {boolean|string} [oConstraints.nullable=true]
	 *   if <code>true</code>, the value <code>null</code> will be accepted; note that
	 *   {@link #parseValue} maps <code>""</code> to <code>null</code>
	 * @public
	 */
	EdmString.prototype.setConstraints = function(oConstraints) {
		var vMaxLength, vNullable;

		this.oConstraints = undefined;
		if (oConstraints) {
			vMaxLength = oConstraints.maxLength;
			if (typeof vMaxLength === "string") {
				vMaxLength = parseInt(vMaxLength, 10);
			}
			if (typeof vMaxLength === "number" && !isNaN(vMaxLength) && vMaxLength > 0) {
				this.oConstraints = {maxLength: vMaxLength};
			} else if (vMaxLength !== undefined) {
				jQuery.sap.log.warning("Illegal maxLength: " + oConstraints.maxLength,
					null, this.getName());
			}

			vNullable = oConstraints.nullable;
			if (vNullable === false || vNullable === "false") {
				this.oConstraints = this.oConstraints || {};
				this.oConstraints.nullable = false;
			} else if (vNullable !== undefined && vNullable !== true && vNullable !== "true") {
				jQuery.sap.log.warning("Illegal nullable: " + vNullable, null, this.getName());
			}
		}
	};

	/**
	 * Returns the type's name.
	 *
	 * @returns {string}
	 *   the type's name
	 */
	EdmString.prototype.getName = function () {
		return "sap.ui.model.odata.type.String";
	};

	return EdmString;
});
