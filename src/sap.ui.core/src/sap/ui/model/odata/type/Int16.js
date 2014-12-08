/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/model/odata/type/Int'],
	function(Int) {
	"use strict";

	/**
	 * Constructor for a primitive type <code>Edm.Int16</code>.
	 *
	 * @class This class represents the OData primitive type <a
	 * href="http://www.odata.org/documentation/odata-version-2-0/overview#AbstractTypeSystem">
	 * <code>Edm.Int16</code></a>.
	 *
	 * @extends sap.ui.model.odata.type.Int
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @alias sap.ui.model.odata.type.Int16
	 * @param {object} [oFormatOptions]
	 *   format options, see {@link sap.ui.model.odata.type.Int#setFormatOptions}
	 * @param {object} [oConstraints]
	 *   constraints, see {@link sap.ui.model.odata.type.Int#setConstraints}
	 * @public
	 * @since 1.27.0
	 */
	var Int16 = Int.extend("sap.ui.model.odata.type.Int16",
		/** @lends sap.ui.model.odata.type.Int16.prototype */
		{
			constructor : function () {
				this.oConstraints = {minimum: -32768, maximum: 32767};
				Int.apply(this, arguments);
				this.sName = "sap.ui.model.odata.type.Int16";
			}
		});

	return Int16;
});
