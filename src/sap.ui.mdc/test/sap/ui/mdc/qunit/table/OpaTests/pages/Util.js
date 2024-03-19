/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/mdc/enums/TableType",
	"sap/ui/core/Lib",
	"test-resources/sap/ui/mdc/testutils/opa/table/waitForTable",
	"test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Arrangement"
], function(
	TableType,
	Library,
	waitForTable,
	P13nArrangement
) {
	"use strict";

	/**
	 * Static collection of utility functions related to OPA tests with a table.
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @namespace
	 * @alias sap.ui.mdc.qunit.table.OpaTests.pages.Util
	 * @private
	 */
	const Util = {};

	/**
	 * Wait for the column menu.
	 *
	 * @param {object} mConfig Config object
	 * @param {function(sap.m.table.columnmenu.Menu)} mConfig.success Callback that is called with the found column menu instance
	 * @returns {Promise} OPA waitFor
	 */
	Util.waitForColumnMenu = function(mConfig) {
		return this.waitFor({
			timeout: 5,
			searchOpenDialogs: true,
			controlType: "sap.m.table.columnmenu.Menu",
			success: function(aColumnMenu) {
				mConfig?.success?.call(this, aColumnMenu[0]);
			},
			errorMessage: "No column menu is open"
		});
	};

	/**
	 * Wait for the P13n dialog.
	 *
	 * @param {object} mConfig config object
	 * @param {function} mConfig.success callback function for waitFor success
	 * @returns {Promise} OPA waitFor
	 */
	Util.waitForP13nDialog = function(mConfig) {
		return this.waitFor({
			controlType: "sap.m.Dialog",
			success: function (aDialogs) {
				mConfig?.success?.call(this, aDialogs[0]);
			},
			errorMessage: "No dialog was found"
		});
	};

	/**
	 * Finds a table row.
	 *
	 * @param {string | sap.ui.mdc.Table} vTable Id or instance of the table
	 * @param {object} mConfig Used to find the row to expand
	 * @param {int} mConfig.index Index of the row in the aggregation of the inner table
	 * @param {string} mConfig.path Path of the property relative to the binding context of the row
	 * @param {string} mConfig.value Value of the property
	 * @param {function(sap.ui.table.Row | sap.m.ColumnListItem, sap.ui.model.Context)} [mConfig.check]
	 *     If a custom check function is provided, <code>path</code> and <code>value</code> are obsolete
	 * @param {function(sap.ui.mdc.Table, sap.ui.table.Row | sap.m.ColumnListItem)} mConfig.success Called when the row is found
	 * @returns {Promise} OPA waitFor
	 * @private
	 */
	Util.waitForRow = function(vTable, mConfig) {
		return waitForTable.call(this, vTable, {
			success: (oTable) => {
				let oRow;

				return this.waitFor({
					check: function() {
						const sAggregationName = oTable._isOfType(TableType.Table, true) ? "rows" : "items";

						oRow = oTable._oTable?.getAggregation(sAggregationName).find((oRow, iIndex) => {
							const sModelName = oTable._oTable.getBindingInfo(sAggregationName).model;
							const oBindingContext = oRow.getBindingContext(sModelName);

							if (iIndex !== mConfig.index) {
								return false;
							} else if (mConfig.check) {
								return mConfig.check(oRow, oBindingContext);
							} else {
								return oBindingContext.getProperty(mConfig.path) === mConfig.value;
							}
						});

						return !!oRow;
					},
					success: function() {
						mConfig.success(oTable, oRow);
					},
					errorMessage: "No row found for " + JSON.stringify(mConfig)
				});
			}
		});
	};

	Util.getTextFromResourceBundle = function(sLibraryName, sTextKey, aValues) {
		return Library.getResourceBundleFor(sLibraryName).getText(sTextKey, aValues);
	};

	Util.P13nDialogInfo = P13nArrangement.P13nDialog;

	return Util;
});
