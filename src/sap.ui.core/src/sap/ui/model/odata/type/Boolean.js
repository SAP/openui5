/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/Core', 'sap/ui/model/FormatException', 'sap/ui/model/ParseException',
		'sap/ui/model/SimpleType', 'sap/ui/model/ValidateException'],
	function(Core, FormatException, ParseException, SimpleType, ValidateException) {
	"use strict";

	/**
	 * Returns the error message for the type.
	 *
	 * @returns {string}
	 *   the message
	 */
	function getErrorMessage() {
		return getMessage("EnterYesOrNo", [getText(true), getText(false)]);
	}

	/**
	 * Returns the locale-dependent text for the given key. Fetches the resource bundle
	 * and stores it in the type if necessary.
	 *
	 * @param {string} sKey
	 *   the key
	 * @param {any[]} aParameters
	 *   the parameters
	 * @returns {string}
	 *   the locale-dependent text for the key
	 */
	function getMessage(sKey, aParameters) {
		return sap.ui.getCore().getLibraryResourceBundle().getText(sKey, aParameters);
	}

	/**
	 * Returns the locale-dependent text for the given boolean value. Fetches the resource bundle
	 * and stores it in the type if necessary.
	 *
	 * @param {boolean} bValue
	 *   the value
	 * @returns {string}
	 *   the locale-dependent text for the value
	 */
	function getText(bValue) {
		return getMessage(bValue ? "YES" : "NO");
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
	 * 	 constraints, see {@link #setConstraints}
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
	 * @returns {boolean|string}
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
			return getText(bValue);
		default:
			throw new FormatException("Don't know how to format " + this.sName + " to "
				+ sTargetType);
		}
	};

	/**
	 * Parse the given value from the given type to a boolean.
	 *
	 * @param {boolean|string} vValue
	 *   the value to be parsed; the empty string and <code>null</code> will be parsed to
	 *   <code>null</code>
	 * @param {string}
	 *   sSourceType the source type (the expected type of <code>sValue</code>)
	 * @returns {boolean}
	 *   the parsed value
	 * @throws sap.ui.model.ParseException
	 *   if <code>sSourceType</code> is unsupported or if the given string cannot be parsed to a
	 *   Boolean
	 * @public
	 */
	EdmBoolean.prototype.parseValue = function(vValue, sSourceType) {
		if (vValue === null || vValue === "") {
			return null;
		}
		switch (sSourceType) {
			case "boolean":
				return vValue;
			case "string":
				if (getText(true).toLowerCase() === vValue.toLowerCase()) {
					return true;
				}
				if (getText(false).toLowerCase() === vValue.toLowerCase()) {
					return false;
				}
				throw new ParseException(getErrorMessage());
			default:
				throw new ParseException("Don't know how to parse " + this.sName + " from "
					+ sSourceType);
		}
	};

	/**
	 * Called by the framework when any localization setting changed.
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
		if (bValue === null) {
			if (this.oConstraints.nullable !== false) {
				return;
			}
			throw new ValidateException(getErrorMessage());
		}
		if (typeof bValue !== "boolean") {
			// This is a "technical" error by calling validate w/o parse
			throw new ValidateException("Illegal " + this.sName + " value: " + bValue);
		}
	};

	/**
	 * Set the constraints.
	 *
	 * @param {object} [oConstraints]
	 * 	 constraints
	 * @param {boolean|string} [oConstraints.nullable=true]
	 *   if <code>true</code>, the value <code>null</code> will be accepted
	 * @public
	 */
	EdmBoolean.prototype.setConstraints = function(oConstraints) {
		var vNullable = oConstraints && oConstraints.nullable;

		this.oConstraints = {};
		if (vNullable === false || vNullable === "false") {
			this.oConstraints.nullable = false;
		} else if (vNullable !== undefined && vNullable !== true && vNullable !== "true") {
			// Note: setConstraints is called by the super constructor w/ wrong this.sName
			jQuery.sap.log.warning("Illegal nullable: " + vNullable, null,
				"sap.ui.model.odata.type.Boolean");
		}
	};

	return EdmBoolean;
});
