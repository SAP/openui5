/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/model/odata/type/Int'],
	function(Int) {
	"use strict";

	var oRange = {minimum: -2147483648, maximum: 2147483647};

	/**
	 * Constructor for a primitive type <code>Edm.Int32</code>.
	 *
	 * @class This class represents the OData primitive type <a
	 * href="http://www.odata.org/documentation/odata-version-2-0/overview#AbstractTypeSystem">
	 * <code>Edm.Int32</code></a>.
	 *
	 * @extends sap.ui.model.odata.type.Int
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @alias sap.ui.model.odata.type.Int32
	 * @param {object} [oFormatOptions]
	 *   format options, see {@link sap.ui.model.odata.type.Int#setFormatOptions}
	 * @param {object} [oConstraints]
	 *   constraints, see {@link sap.ui.model.odata.type.Int#setConstraints}
	 * @public
	 * @since 1.27.0
	 */
	var Int32 = Int.extend("sap.ui.model.odata.type.Int32",
		/** @lends sap.ui.model.odata.type.Int32.prototype */
		{
			constructor : function () {
				Int.apply(this, arguments);
			}
		});

	/**
	 * Returns the type's name.
	 *
	 * @returns {string}
	 *   the type's name
	 * @public
	 */
	Int32.prototype.getName = function () {
		return "sap.ui.model.odata.type.Int32";
	};

	/**
	 * Returns the type's supported range as object with properties <code>minimum</code> and
	 * <code>maximum</code>.
	 *
	 * @returns {object} the range
	 * @protected
	 */
	Int32.prototype.getRange = function () {
		return oRange;
	};

	return Int32;
});
