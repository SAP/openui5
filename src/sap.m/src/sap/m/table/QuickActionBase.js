/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/table/ColumnMenuEntry"
], function(
	ColumnMenuEntry
) {
	"use strict";

	/**
	 * Constructor for a new QuickActionBase.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * This control serves as a base class for quick actions.
	 * This base class is faceless and should be inherited by controls, which intend to
	 * serve as quick actions for the sap.m.table.ColumnMenu.
	 *
	 * @extends sap.m.table.ColumnMenuEntry
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @experimental
	 *
	 * @alias sap.m.table.QuickActionBase
	 */
	var QuickActionBase = ColumnMenuEntry.extend("sap.m.table.QuickActionBase", {
		metadata: {
			"abstract": true,
			library: "sap.m"
		}
	});

	/**
	 * This method can be used to retrieve the effective quick actions.
	 *
	 * Sublasses can implement this method, if there are compositions of other quick actions.
	 * @returns {Array<sap.m.table.QuickActionBase>} The effective quick actions
	 *
	 * @public
	 */
	QuickActionBase.prototype.getEffectiveQuickActions = function() {
		return [this];
	};
	return QuickActionBase;
});