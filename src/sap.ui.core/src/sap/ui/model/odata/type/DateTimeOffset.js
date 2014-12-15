/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/model/odata/type/DateTimeBase'],
	function(DateTimeBase) {
	"use strict";

	/**
	 * Constructor for a primitive type <code>Edm.DateTimeOffset</code>.
	 *
	 * @class This class represents the OData primitive type <a
	 * href="http://www.odata.org/documentation/odata-version-2-0/overview#AbstractTypeSystem">
	 * <code>Edm.DateTimeOffset</code></a>.
	 *
	 * @extends sap.ui.model.odata.type.DateTimeBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @alias sap.ui.model.odata.type.DateTimeOffset
	 * @param {object} [oFormatOptions]
	 * 	 format options, see {@link sap.ui.model.odata.type.DateTimeBase#setFormatOptions}
	 * @param {object} [oConstraints]
	 * 	 constraints, see {@link #setConstraints}
	 * @public
	 * @since 1.27.0
	 */
	var DateTimeOffset = DateTimeBase.extend("sap.ui.model.odata.type.DateTimeOffset",
			/** @lends sap.ui.model.odata.type.DateTimeOffset.prototype */
			{
				constructor : function () {
					DateTimeBase.apply(this, arguments);
			}
		});

	/**
	 * Set the constraints.
	 *
	 * @param {object} [oConstraints]
	 * 	 constraints
	 * @param {boolean|string} [oConstraints.nullable=true]
	 *   if <code>true</code>, the value <code>null</code> will be accepted
	 * @public
	 */
	DateTimeOffset.prototype.setConstraints = function(oConstraints) {
		var oBaseConstraints = {};
		if (oConstraints) {
			oBaseConstraints.nullable = oConstraints.nullable;
		}
		DateTimeBase.prototype.setConstraints.call(this, oBaseConstraints);
	};

	/**
	 * Returns the type's name.
	 *
	 * @returns {string}
	 *   the type's name
	 */
	DateTimeOffset.prototype.getName = function () {
		return "sap.ui.model.odata.type.DateTimeOffset";
	};

	return DateTimeOffset;
});
