/*!
 * ${copyright}
 */

/**
 * Namespace for
 * <a href="http://www.odata.org/documentation/odata-version-2-0/overview#AbstractTypeSystem">
 * OData primitive types</a>.
 *
 * @namespace
 * @name sap.ui.model.odata.type
 * @public
 */

sap.ui.define(['sap/ui/model/SimpleType'],
	function(SimpleType) {
	"use strict";

	/**
	 * Constructor for a new <code>ODataType</code>.
	 *
	 * @class This class is an abstract base class for all OData primitive types (see <a
	 * href="http://www.odata.org/documentation/odata-version-2-0/overview#AbstractTypeSystem">
	 * Edm Types</a>). All sub-types implement the interface of
	 * {@link sap.ui.model.SimpleType}. That means they implement next to the constructor:
	 * <ul>
	 * <li>{@link sap.ui.model.SimpleType#getName getName}</li>
	 * <li>{@link sap.ui.model.SimpleType#formatValue formatValue}</li>
	 * <li>{@link sap.ui.model.SimpleType#parseValue parseValue}</li>
	 * <li>{@link sap.ui.model.SimpleType#validateValue validateValue}</li>
	 * </ul>
	 * @extends sap.ui.model.SimpleType
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @alias sap.ui.model.odata.type.ODataType
	 * @param {object} [oFormatOptions]
	 *   format options; for OData types the support of format options has been removed. Parameter
	 *   has not been removed to be consistent with other SimpleTypes.
	 * @param {object} [oConstraints]
	 *   constraints for this data type (e.g. <code>oConstraints.nullable</code>, see sub-types)
	 * @public
	 * @since 1.27.0
	 */
	var ODataType = SimpleType.extend("sap.ui.model.odata.type.ODataType",
			/** @lends sap.ui.model.odata.type.ODataType.prototype */
			{
				constructor : function (oFormatOptions, oConstraints) {
					// do not call super constructor to avoid generation of unused objects
				},
				metadata : {
					"abstract" : true
				}
			}
		);


	/**
	 * ODataTypes are immutable and do not allow modifying the type's constraints.
	 * This function overwrites the <code>setConstraints</code> of
	 * <code>sap.ui.model.SimpleType</code> and does nothing.
	 *
	 * @param {object} [oConstraints]
	 *   constraints, see {@link #constructor}.
	 * @private
	 */
	ODataType.prototype.setConstraints = function(oConstraints) {
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
	ODataType.prototype.setFormatOptions = function(oFormatOptions) {
		// do nothing!
	};

	return ODataType;
});
