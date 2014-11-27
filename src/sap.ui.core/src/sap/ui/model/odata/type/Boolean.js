/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/Core', 'sap/ui/model/FormatException', 'sap/ui/model/ParseException',
		'sap/ui/model/SimpleType', 'sap/ui/model/ValidateException'],
	function(Core, FormatException, ParseException, SimpleType, ValidateException) {
	"use strict";

	/**
	 * Returns the locale-dependent text for the given boolean value. Fetches the resource bundle
	 * and stores it in the type if necessary.
	 *
	 * @param {sap.ui.model.odata.type.Boolean} oType
	 *   the type
	 * @param {boolean} bValue
	 *   the value
	 * @return {string}
	 *   the locale-dependent text for the value
	 */
	function getText(oType, bValue) {
		var oCore;

		if (!oType.oResourceBundle) {
			oCore = sap.ui.getCore();
			oType.oResourceBundle = oCore.getLibraryResourceBundle("sap.ui.core",
				oCore.getConfiguration().getFormatSettings().getFormatLocale().toString());
		}
		return oType.oResourceBundle.getText(bValue ? "YES" : "NO");
	}

	/**
	 * Constructor for an OData primitive type <code>Edm.Boolean</code>.
	 *
	 * @class This class represents the OData primitive type <a
	 * href="http://www.odata.org/documentation/odata-version-2-0/overview#AbstractTypeSystem">
	 * <code>Edm.Boolean</code></a>.
	 *
	 * @extends sap.ui.model.SimpleType
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @alias sap.ui.model.odata.type.Boolean
	 * @param {object} [oFormatOptions]
	 * 	 possible format options, the type however does not support any
	 * @param {object} [oConstraints]
	 * 	 possible constraints, the type however does not support any
	 * @public
	 * @since 1.27.0
	 */
	var EdmBoolean = SimpleType.extend("sap.ui.model.odata.type.Boolean",
			/** @lends sap.ui.model.odata.type.Boolean.prototype */
			{
				constructor : function () {
					SimpleType.apply(this, arguments);
					this.sName = "sap.ui.model.odata.type.Boolean";
					this._handleLocalizationChange();
			}
		});

	/**
	 * Format the given boolean value to the given target type.
	 *
	 * @param {boolean} bValue
	 *   the value to be formatted
	 * @param {string} sTargetType
	 *   the target type
	 * @return {boolean|string}
	 *   the formatted output value in the target type; <code>undefined</code> or <code>null</code>
	 *   will be formatted to <code>null</code>
	 * @throws sap.ui.model.FormatException
	 *   if <code>sTargetType</code> is unsupported
	 * @public
	 */
	EdmBoolean.prototype.formatValue = function (bValue, sTargetType) {
		if (bValue === null || bValue === undefined) {
			return null;
		}
		switch (sTargetType) {
		case "any":
		case "boolean":
			return bValue;
		case "string":
			return getText(this, bValue);
		default:
			throw new FormatException("Don't know how to format " + this.sName + " to "
				+ sTargetType);
		}
	};

	/**
	 * Parse the given value from the given type to a boolean.
	 *
	 * @param {boolean|string} vValue
	 *   the value to be parsed
	 * @param {string}
	 *   sSourceType the source type (the expected type of <code>sValue</code>)
	 * @return {boolean}
	 *   the parsed value
	 * @throws sap.ui.model.ParseException
	 *   if <code>sSourceType</code> is unsupported or if the given string cannot be parsed to a
	 *   Boolean
	 * @public
	 */
	EdmBoolean.prototype.parseValue = function(vValue, sSourceType) {
		switch (sSourceType) {
			case "boolean":
				return vValue;
			case "string":
				if (getText(this, true).toLowerCase() === vValue.toLowerCase()) {
					return true;
				}
				if (getText(this, false).toLowerCase() === vValue.toLowerCase()) {
					return false;
				}
				// TODO localization
				throw new ParseException(vValue + " is not a valid " + this.sName + " value");
			default:
				throw new ParseException("Don't know how to parse " + this.sName + " from "
					+ sSourceType);
		}
	};

	/**
	 * Called by the framework when any localization setting changed
	 * @private
	 */
	EdmBoolean.prototype._handleLocalizationChange = function () {
		this.oResourceBundle = null;
	};

	/**
	 * Validate whether the given value in model representation is valid and meets the
	 * defined constraints (if any).
	 *
	 * @param {boolean} bValue
	 *   the value to be validated
	 * @throws sap.ui.model.ValidateException if the value is not valid
	 * @public
	 */
	EdmBoolean.prototype.validateValue = function (bValue) {
		if (typeof bValue !== "boolean") {
			throw new ValidateException("Illegal " + this.sName + " value: " + bValue);
		}
	};

	return EdmBoolean;
});
