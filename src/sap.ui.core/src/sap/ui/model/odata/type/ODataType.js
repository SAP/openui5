/*!
 * ${copyright}
 */

/**
 * The types in this namespace are {@link sap.ui.model.SimpleType simple types} corresponding
 * to OData primitive types for both
 * {@link http://www.odata.org/documentation/odata-version-2-0/overview#AbstractTypeSystem OData V2}
 * and
 * {@link http://docs.oasis-open.org/odata/odata/v4.0/odata-v4.0-part3-csdl.html OData V4} (see
 * "4.4 Primitive Types").
 *
 * They can be used in any place where simple types are allowed (and the model representation
 * matches), but they are of course most valuable when used in bindings to a
 * {@link sap.ui.model.odata.v2.ODataModel} or {@link sap.ui.model.odata.v4.ODataModel}.
 *
 * <b>Example:</b>
 * <pre>
 *   &lt;Label text="ID"/>
 *   &lt;Input value="{path : 'id', type : 'sap.ui.model.odata.type.String',
 *       constraints : {nullable : false, maxLength : 10}}"/>
 *   &lt;Label text="valid through"/>
 *   &lt;Input value="{path : 'validThrough', type : 'sap.ui.model.odata.type.DateTime',
 *       constraints : {displayFormat : 'Date'}}"/>
 * </pre>
 *
 * All types support formatting from the representation used in ODataModel ("model format") to
 * various representations used by UI elements ("target type") and vice versa. Additionally they
 * support validating a given value against the type's constraints.
 *
 * The following target types may be supported:
 * <table>
 * <tr><th>Type</th><th>Description</th></tr>
 * <tr><td><code>string</code></td><td>The value is converted to a <code>string</code>, so that it
 * can be displayed in an input field. Supported by all types.</td></tr>
 * <tr><td><code>boolean</code></td><td>The value is converted to a <code>Boolean</code>, so that
 * it can be displayed in a checkbox. Only supported by
 * {@link sap.ui.model.odata.type.Boolean}.</td></tr>
 * <tr><td><code>int</code></td><td>The value is converted to an integer (as <code>number</code>).
 * May cause truncation of decimals and overruns. Supported by all numeric types.</td></tr>
 * <tr><td><code>float</code></td><td>The value is converted to a <code>number</code>. Supported by
 * all numeric types.</td></tr>
 * <tr><td><code>object</code></td><td>The value is converted to a <code>Date</code> so that it can
 * be displayed in a date or time picker. Supported by {@link sap.ui.model.odata.type.Date} and
 * {@link sap.ui.model.odata.type.DateTimeOffset} since 1.69.0.
 * </td></tr>
 * <tr><td><code>any</code></td><td>A technical format. The value is simply passed through. Only
 * supported by <code>format</code>, not by <code>parse</code>. Supported by all types.</td></tr>
 * </table>
 *
 * All constraints relevant for OData V2 may be given as strings besides their natural types (e.g.
 * <code>nullable : "false"</code> or <code>maxLength : "10"</code>). This makes the life of
 * template processors easier, but is not needed for OData V4.
 *
 * <b>Handling of <code>null</code></b>:
 *
 * All types handle <code>null</code> in the same way. When formatting to <code>string</code>, it
 * is simply passed through (and <code>undefined</code> becomes <code>null</code>, too). When
 * parsing from <code>string</code>, it is also passed through.  Additionally,
 * {@link sap.ui.model.odata.type.String String} and {@link sap.ui.model.odata.type.Guid Guid}
 * convert the empty string to <code>null</code> when parsing. <code>validate</code> decides based
 * on the constraint <code>nullable</code>: If <code>false</code>, <code>null</code> is not
 * accepted and leads to a (locale-dependent) <code>ParseException</code>.
 *
 * This ensures that the user cannot clear an input field bound to an attribute with non-nullable
 * type. However it does not ensure that the user really entered something if the field was empty
 * before.
 *
 * <b><code>Date</code> vs. <code>DateTime</code></b>:
 *
 * The type {@link sap.ui.model.odata.type.Date} is only valid for an OData V4 service. If you use
 * the type for an OData V2 service, displaying is possible but you get an error message from server
 * if you try to save changes.
 *
 * For an OData V2 service use {@link sap.ui.model.odata.type.DateTime} with the constraint
 * <code>displayFormat: "Date"</code> to display only a date.
 *
 * @namespace
 * @name sap.ui.model.odata.type
 * @public
 */

sap.ui.define([
	"sap/ui/model/SimpleType"
], function (SimpleType) {
	"use strict";

	/**
	 * Constructor for a new <code>ODataType</code>.
	 *
	 * @class This class is an abstract base class for all OData primitive types (see {@link
	 * http://docs.oasis-open.org/odata/odata/v4.0/errata02/os/complete/part3-csdl/odata-v4.0-errata02-os-part3-csdl-complete.html#_The_edm:Documentation_Element
	 * OData V4 Edm Types} and
	 * {@link http://www.odata.org/documentation/odata-version-2-0/overview#AbstractTypeSystem
	 * OData V2 Edm Types}). All subtypes implement the interface of
	 * {@link sap.ui.model.SimpleType}. That means they implement next to the constructor:
	 * <ul>
	 * <li>{@link sap.ui.model.SimpleType#getName getName}</li>
	 * <li>{@link sap.ui.model.SimpleType#formatValue formatValue}</li>
	 * <li>{@link sap.ui.model.SimpleType#parseValue parseValue}</li>
	 * <li>{@link sap.ui.model.SimpleType#validateValue validateValue}</li>
	 * </ul>
	 *
	 * All ODataTypes are immutable. All format options and constraints are given to the
	 * constructor, they cannot be modified later.
	 *
	 * All ODataTypes use a locale-specific message when throwing an error caused by invalid
	 * user input (e.g. if {@link sap.ui.model.odata.type.Double#parseValue Double.parseValue}
	 * cannot parse the given value to a number, or if any type's {@link #validateValue
	 * validateValue} gets a <code>null</code>, but the constraint <code>nullable</code> is
	 * <code>false</code>).
	 *
	 * @extends sap.ui.model.SimpleType
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @abstract
	 * @alias sap.ui.model.odata.type.ODataType
	 * @param {object} [oFormatOptions]
	 *   type-specific format options; see subtypes
	 * @param {object} [oConstraints]
	 *   type-specific constraints (e.g. <code>oConstraints.nullable</code>), see subtypes
	 * @public
	 * @since 1.27.0
	 */
	var ODataType = SimpleType.extend("sap.ui.model.odata.type.ODataType", {
				constructor : function (oFormatOptions, oConstraints) {
					// do not call super constructor to avoid generation of unused objects
				},
				metadata : {
					"abstract" : true
				}
			}
		);

	/**
	 * @see sap.ui.base.Object#getInterface
	 *
	 * @returns {object} this
	 * @public
	 */
	ODataType.prototype.getInterface = function () {
		return this;
	};

	/**
	 * ODataTypes are immutable and do not allow modifying the type's constraints.
	 * This function overwrites the <code>setConstraints</code> of
	 * <code>sap.ui.model.SimpleType</code> and does nothing.
	 *
	 * @param {object} [oConstraints]
	 *   constraints, see {@link #constructor}.
	 * @private
	 */
	ODataType.prototype.setConstraints = function (oConstraints) {
		// do nothing!
	};

	/**
	 * ODataTypes are immutable and do not allow modifying the type's format options.
	 * This function overwrites the <code>setFormatOptions</code> of
	 * <code>sap.ui.model.SimpleType</code> and does nothing.
	 *
	 * @param {object} [oFormatOptions]
	 *   format options, see {@link #constructor}.
	 * @private
	 */
	ODataType.prototype.setFormatOptions = function (oFormatOptions) {
		// do nothing!
	};

	return ODataType;
});
