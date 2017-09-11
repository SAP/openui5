/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/model/FormatException",
	"sap/ui/model/odata/type/ODataType",
	"sap/ui/model/ParseException",
	"sap/ui/model/ValidateException"
], function (FormatException, ODataType, ParseException, ValidateException) {
	"use strict";

	/**
	 * Sets the constraints.
	 *
	 * @param {sap.ui.model.odata.type.Stream} oType
	 *   the type instance
	 * @param {object} [oConstraints]
	 *   constraints, see {@link #constructor}
	 */
	function setConstraints(oType, oConstraints) {
		var vNullable;

		oType.oConstraints = undefined;
		if (oConstraints) {
			vNullable = oConstraints.nullable;
			if (vNullable === false) {
				oType.oConstraints = {nullable : false};
			} else if (vNullable !== undefined && vNullable !== true) {
				jQuery.sap.log.warning("Illegal nullable: " + vNullable, null, oType.getName());
			}
		}
	}

	/**
	 * Constructor for an OData primitive type <code>Edm.Stream</code>.
	 *
	 * @param {object} [oFormatOptions]
	 *   Must be <code>undefined</code>
	 * @param {object} [oConstraints]
	 *   constraints; they are only stored for documentation purpose, since no validation can occur
	 * @param {boolean} [oConstraints.nullable=true]
	 *   if <code>true</code>, the server accepts the value <code>null</code>
	 * @throws {Error}
	 *   If format options are given or if the constraints are invalid
	 *
	 * @alias sap.ui.model.odata.type.Stream
	 * @author SAP SE
	 * @class This class represents the OData V4 primitive type {@link
	 *   http://docs.oasis-open.org/odata/odata/v4.0/errata02/os/complete/part3-csdl/odata-v4.0-errata02-os-part3-csdl-complete.html#_The_edm:Documentation_Element
	 *   <code>Edm.Stream</code>}. The values for stream properties do not appear in the entity
	 *   payload. Instead, the values are read or written through URLs.
	 *
	 *   This type only supports reading streams. For this purpose bind the stream property to a
	 *   control property of type <code>sap.ui.core.URI</code>. {#formatValue} will then deliver the
	 *   correct URL to read the stream.
	 * @extends sap.ui.model.odata.type.ODataType
	 * @public
	 * @since 1.51.0
	 * @version ${version}
	 */
	var Stream = ODataType.extend("sap.ui.model.odata.type.Stream", {
			constructor : function (oFormatOptions, oConstraints) {
				ODataType.apply(this, arguments);
				if (oFormatOptions !== undefined) {
					throw new Error("Unsupported arguments");
				}
				setConstraints(this, oConstraints);
			}
		});

	/**
	 * Returns the input value unchanged.
	 *
	 * @param {string} sValue
	 *   the read URL
	 * @param {string} sTargetType
	 *   The target type; must be "any" or "string"
	 * @returns {string}
	 *   The property's read URL
	 * @throws {sap.ui.model.FormatException}
	 *   If <code>sTargetType</code> is not "any" or "string"
	 *
	 * @public
	 * @see sap.ui.model.SimpleType#formatValue
	 * @since 1.51.0
	 */
	Stream.prototype.formatValue = function (sValue, sTargetType) {
		switch (this.getPrimitiveType(sTargetType)) {
			case "any":
			case "string":
				return sValue;
			default:
				throw new FormatException("Don't know how to format " + this.getName() + " to "
					+ sTargetType);
		}
	};

	/**
	 * Returns the type's name.
	 *
	 * @returns {string}
	 *   The type's name
	 *
	 * @public
	 * @see sap.ui.model.Type#getName
	 * @since 1.51.0
	 */
	Stream.prototype.getName = function () {
		return "sap.ui.model.odata.type.Stream";
	};

	/**
	 * Method not supported
	 *
	 * @throws {sap.ui.model.ParseException}
	 *
	 * @public
	 * @see sap.ui.model.SimpleType#parseValue
	 * @since 1.51.0
	 */
	Stream.prototype.parseValue = function () {
		throw new ParseException("Type 'sap.ui.model.odata.type.Stream' does not support parsing");
	};

	/**
	 * Method not supported
	 *
	 * @throws {sap.ui.model.ValidateException}
	 *
	 * @public
	 * @see sap.ui.model.SimpleType#validateValue
	 * @since 1.51.0
	 */
	Stream.prototype.validateValue = function () {
		throw new ValidateException(
			"Type 'sap.ui.model.odata.type.Stream' does not support validating");
	};

	return Stream;
});
