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
	 * Finds the first table row matching the search criteria.
	 *
	 * @param {string | sap.ui.mdc.Table} vTable Id or instance of the table
	 * @param {object} mConfig Config
	 * @param {int} [mConfig.index] Index of the row in the aggregation of the inner table
	 * @param {object} [mConfig.data] Information about the data, where the key is the path in the rows binding context
	 * @param {function(sap.ui.table.Row | sap.m.ColumnListItem, sap.ui.model.Context)} [mConfig.check]
	 *     If a custom check function is provided, <code>data</code> is obsolete
	 * @param {function(sap.ui.mdc.Table, sap.ui.table.Row | sap.m.ColumnListItem)} mConfig.success Called when the row is found
	 * @param {function(object)} [mConfig.error] Called when no row was found
	 * @param {string} [mConfig.errorMessage] Message to be displayed if no row is found
	 * @returns {Promise} OPA waitFor
	 * @private
	 */
	Util.waitForRow = function(vTable, mConfig) {
		return waitForTable.call(this, vTable, {
			success: (oTable) => {
				const bMatchAtIndex = mConfig.index != null;
				let oRow;
				let mModelValues;

				return this.waitFor({
					check: function() {
						const sAggregationName = oTable._isOfType(TableType.Table, true) ? "rows" : "items";

						oRow = oTable._oTable?.getAggregation(sAggregationName).find((oRow, iIndex) => {
							const sModelName = oTable._oTable.getBindingInfo(sAggregationName).model;
							const oBindingContext = oRow.getBindingContext(sModelName);

							if (bMatchAtIndex && iIndex !== mConfig.index) {
								return false;
							} else if (bMatchAtIndex && !mConfig.check && !mConfig.data) {
								return iIndex === mConfig.index;
							} else if (mConfig.check) {
								return mConfig.check(oRow, oBindingContext);
							} else {
								const aPaths = Object.keys(mConfig.data);

								mModelValues = aPaths.reduce((mModelValues, sPath) => {
									mModelValues[sPath] = oBindingContext.getProperty(sPath);
									return mModelValues;
								}, {});

								return aPaths.length > 0 && aPaths.every((sPath) => {
									return mModelValues[sPath] == mConfig.data[sPath];
								});
							}
						});

						return !!oRow;
					},
					success: function() {
						mConfig.success(oTable, oRow);
					},
					error: function(mError) {
						if (mConfig.errorMessage == null) {
							let sAdditionalInfo = "";

							if (bMatchAtIndex && mModelValues) {
								sAdditionalInfo = `\nData of row at index ${mConfig.index}: ${JSON.stringify(mModelValues, null, 2)}`;
							}

							mError.errorMessage = mError.errorMessage.replace("$additionalInfo", sAdditionalInfo);
						}

						mConfig.error?.(mError);
					},
					errorMessage: mConfig.errorMessage ?? `No row found for ${JSON.stringify(mConfig, null, 2)}$additionalInfo`
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
