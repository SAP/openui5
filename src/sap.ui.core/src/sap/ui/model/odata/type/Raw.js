/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/model/FormatException",
	"sap/ui/model/ParseException",
	"sap/ui/model/ValidateException",
	"sap/ui/model/odata/type/ODataType"
], function (FormatException, ParseException, ValidateException, ODataType) {
	"use strict";

	/**
	 * Constructor for a placeholder for all unsupported OData primitive types.
	 *
	 * @param {object} [oFormatOptions]
	 *   Must be <code>undefined</code>
	 * @param {object} [oConstraints]
	 *   Must be <code>undefined</code>
	 * @throws {Error}
	 *   In case any arguments are given
	 *
	 * @alias sap.ui.model.odata.type.Raw
	 * @author SAP SE
	 * @class This class represents a placeholder for all unsupported OData primitive types. It can
	 *   only be used to retrieve raw values "as is" (i.e. <code>formatValue(vValue, "any")</code>),
	 *   but not to actually convert to or from any other representation or to validate.
	 * @extends sap.ui.model.odata.type.ODataType
	 * @public
	 * @since 1.37.0
	 * @version ${version}
	 */
	var Raw = ODataType.extend("sap.ui.model.odata.type.Raw", {
			constructor : function (oFormatOptions, oConstraints) {
				ODataType.apply(this, arguments);
				if (oFormatOptions !== undefined || oConstraints !== undefined
						|| arguments.length > 2) {
					throw new Error("Unsupported arguments");
				}
			}
		});

	/**
	 * Formats the given value to the given target type.
	 *
	 * @param {any} vValue
	 *   The raw value to be retrieved "as is"
	 * @param {string} sTargetType
	 *   The target type; must be "any"
	 * @returns {any}
	 *   The raw value "as is"
	 * @throws {sap.ui.model.FormatException}
	 *   If <code>sTargetType</code> is not "any"
	 *
	 * @public
	 * @see sap.ui.model.SimpleType#formatValue
	 * @since 1.37.0
	 */
	Raw.prototype.formatValue = function (vValue, sTargetType) {
		if (sTargetType === "any") {
			return vValue;
		}
		throw new FormatException("Type 'sap.ui.model.odata.type.Raw' does not support formatting");
	};

	/**
	 * Returns the type's name.
	 *
	 * @returns {string}
	 *   The type's name
	 *
	 * @public
	 * @see sap.ui.model.Type#getName
	 * @since 1.37.0
	 */
	Raw.prototype.getName = function () {
		return "sap.ui.model.odata.type.Raw";
	};

	/**
	 * Method not supported
	 *
	 * @throws {sap.ui.model.ParseException}
	 *
	 * @public
	 * @see sap.ui.model.SimpleType#parseValue
	 * @since 1.37.0
	 */
	Raw.prototype.parseValue = function () {
		throw new ParseException("Type 'sap.ui.model.odata.type.Raw' does not support parsing");
	};

	/**
	 * Method not supported
	 *
	 * @throws {sap.ui.model.ValidateException}
	 *
	 * @public
	 * @see sap.ui.model.SimpleType#validateValue
	 * @since 1.37.0
	 */
	Raw.prototype.validateValue = function () {
		throw new ValidateException(
			"Type 'sap.ui.model.odata.type.Raw' does not support validating");
	};

	return Raw;
});
