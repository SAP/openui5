/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/model/FormatException', 'sap/ui/model/ParseException',
		'sap/ui/model/SimpleType', 'sap/ui/model/ValidateException'],
	function(FormatException, ParseException, SimpleType, ValidateException) {
	"use strict";

	var rGuid = /^[A-F0-9]{8}-([A-F0-9]{4}-){3}[A-F0-9]{12}$/i;

	/**
	 * Returns the locale-dependent error message.
	 *
	 * @returns {string}
	 *   the locale-dependent error message.
	 * @private
	 */
	function getErrorMessage() {
		return sap.ui.getCore().getLibraryResourceBundle().getText("EnterGuid");
	}

	/**
	 * Constructor for an OData primitive type <code>Edm.Guid</code>.
	 *
	 * @class This class represents the OData primitive type <a
	 * href="http://www.odata.org/documentation/odata-version-2-0/overview#AbstractTypeSystem">
	 * <code>Edm.Guid</code></a>.
	 *
	 * @extends sap.ui.model.SimpleType
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @alias sap.ui.model.odata.type.Guid
	 * @param {object} [oFormatOptions]
	 *   format options; this type does not support any format options
	 * @param {object} [oConstraints]
	 *   constraints
	 * @param {boolean|string} [oConstraints.nullable=true]
	 *   if <code>true</code>, the value <code>null</code> is accepted
	 * @public
	 * @since 1.27.0
	 */
	var EdmGuid = SimpleType.extend("sap.ui.model.odata.type.Guid",
			/** @lends sap.ui.model.odata.type.Guid.prototype */
			{
				constructor : function (oFormatOptions, oConstraints) {
					this.setConstraints(oConstraints);
				}
			}
		);

	/**
	 * Formats the given value to the given target type
	 *
	 * @param {string} sValue
	 *   the value to be formatted
	 * @param {string} sTargetType
	 *   the target type
	 * @returns {string}
	 *   the formatted output value in the target type; <code>undefined</code> or <code>null</code>
	 *   is formatted to <code>null</code>
	 * @throws sap.ui.model.FormatException
	 *   if <code>sTargetType</code> is unsupported
	 * @public
	 */
	EdmGuid.prototype.formatValue = function(sValue, sTargetType) {
		if (sValue === undefined || sValue === null) {
			return null;
		}
		if (sTargetType === "string" || sTargetType === "any") {
			return sValue;
		}
		throw new FormatException("Don't know how to format " + this.getName() + " to "
			+ sTargetType);
	};

	/**
	 * Returns the type's name.
	 *
	 * @returns {string}
	 *   the type's name
	 * @public
	 */
	EdmGuid.prototype.getName = function () {
		return "sap.ui.model.odata.type.Guid";
	};

	/**
	 * Parses the given value, which is expected to be of the given type, to a GUID.
	 *
	 * @param {string} sValue
	 *   the value to be parsed, maps <code>""</code> to <code>null</code>
	 * @param {string} sSourceType
	 *   the source type (the expected type of <code>sValue</code>)
	 * @returns {string}
	 *   the parsed value
	 * @throws sap.ui.model.ParseException
	 *   if <code>sSourceType</code> is unsupported
	 * @public
	 */
	EdmGuid.prototype.parseValue = function (sValue, sSourceType) {
		var sResult;
		if (sValue === "" || sValue === null) {
			return null;
		}
		if (sSourceType !== "string") {
			throw new ParseException("Don't know how to parse " + this.getName() + " from "
				+ sSourceType);
		}
		// remove all whitespaces and separators
		sResult = sValue.replace(/[-\s]/g, '');
		if (sResult.length != 32) {
			// don't try to add separators to invalid value
			return sValue;
		}
		sResult = sResult.slice(0, 8) + '-' + sResult.slice(8, 12) + '-' + sResult.slice(12, 16)
			+ '-' + sResult.slice(16, 20) + '-' + sResult.slice(20);
		return sResult.toUpperCase();
	};

	/**
	 * Sets the constraints.
	 *
	 * @param {object} [oConstraints]
	 *   constraints, see {@link #constructor}
	 * @private
	 */
	EdmGuid.prototype.setConstraints = function(oConstraints) {
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
	 * @param {string} sValue
	 *   the value to be validated
	 * @throws sap.ui.model.ValidateException if the value is not valid
	 * @public
	 */
	EdmGuid.prototype.validateValue = function (sValue) {
		if (sValue === null) {
			if (this.oConstraints && this.oConstraints.nullable === false) {
				throw new ValidateException(getErrorMessage());
			}
			return;
		}
		if (typeof sValue !== "string") {
			// This is a "technical" error by calling validate w/o parse
			throw new ValidateException("Illegal " + this.getName() + " value: " + sValue);
		}
		if (!rGuid.test(sValue)) {
			throw new ValidateException(getErrorMessage());
		}
	};

	return EdmGuid;
});
