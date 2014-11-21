/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/model/odata/type/Int'],
	function(Int) {
	"use strict";

	/**
	 * Constructor for a primitive type <code>Edm.SByte</code>.
	 *
	 * @class This class represents the OData primitive type <a
	 * href="http://www.odata.org/documentation/odata-version-2-0/overview#AbstractTypeSystem">
	 * <code>Edm.SByte</code></a>.
	 *
	 * @extends sap.ui.model.odata.type.Int
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @alias sap.ui.model.odata.type.SByte
	 * @param {object} [oFormatOptions]
	 *   format options, see {@link sap.ui.model.odata.type.Int#setFormatOptions}
	 * @param {object} [oConstraints]
	 *   constraints, see {@link sap.ui.model.odata.type.Int#setConstraints}
	 * @public
	 * @since 1.27.0
	 */
	var SByte = Int.extend("sap.ui.model.odata.type.SByte",
		/** @lends sap.ui.model.odata.type.SByte.prototype */
		{
			constructor : function () {
				this.oConstraints = {minimum: -128, maximum: 127};
				Int.apply(this, arguments);
				this.sName = "sap.ui.model.odata.type.SByte";
			}
		});

	return SByte;
});
