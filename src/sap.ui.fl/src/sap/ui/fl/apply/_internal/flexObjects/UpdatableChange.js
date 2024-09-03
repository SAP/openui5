/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexObjects/UIChange"
], function(
	UIChange
) {
	"use strict";

	/**
	 * Flexibility change class. Stores change content and related information.
	 * This class also be updated as well as reverted.
	 *
	 * @class sap.ui.fl.apply._internal.flexObjects.UpdatableChange
	 * @extends sap.ui.fl.apply._internal.flexObjects.UIChange
	 * @alias sap.ui.fl.apply._internal.flexObjects.UpdatableChange
	 * @private
	 * @since 1.90.0
	 * @ui5-restricted
	 */
	var UpdatableChange = UIChange.extend("sap.ui.fl.apply._internal.flexObjects.UpdatableChange", /** @lends sap.ui.fl.apply._internal.flexObjects.UpdatableChange.prototype */ {
		metadata: {
			aggregations: {
				revertInfo: {
					type: "sap.ui.base.ManagedObject", // "sap.ui.fl.apply._internal.flexObjects.RevertData"
					multiple: true,
					singularName: "revertInfo"
				}
			}
		}
	});

	/**
	 * Returns the mapping between flex object properties and file content properties in the back-end response.
	 * @returns {object} Mapping information
	 * @static
	 */
	UpdatableChange.getMappingInfo = function() {
		return { ...UIChange.getMappingInfo() };
	};

	UpdatableChange.prototype.popLatestRevertInfo = function() {
		var oLatestRevertInfo = this.getRevertInfo().pop();
		this.removeRevertInfo(oLatestRevertInfo);
		return oLatestRevertInfo;
	};

	return UpdatableChange;
});
