sap.ui.define([
	"sap/ui/test/Opa5",
	"test-resources/sap/ui/mdc/qunit/table/OpaTests/pages/Actions",
	"test-resources/sap/ui/mdc/qunit/table/OpaTests/pages/Assertions",
	"test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Action",
	"test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Assertion",
	"test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Arrangement",
	"test-resources/sap/ui/mdc/testutils/opa/table/waitForTable"
], function(
	/** @type sap.ui.test.Opa5 */ Opa5,
	/** @type sap.ui.test.Opa5 */ AppActions,
	/** @type sap.ui.test.Opa5 */ AppAssertions,
	/** @type sap.ui.test.Opa5 */ P13nAction,
	/** @type sap.ui.test.Opa5 */ P13nAssertion,
	/** @type sap.ui.test.Opa5 */ P13nArrangement,
	waitForTable
) {
	"use strict";

	Opa5.createPageObjects({
		onTheApp: {
			actions: {
				/**
				 * Retrieves the table instance by ID and forwards it to the provided callback function
				 *
				 * @param {string} sTableId Id of the table
				 * @param {function(): sap.ui.mdc.Table} fnCallback Callback function with table instance
				 * @returns {Promise} OPA waitFor
				 * @private
				 */
				iGetTheTableInstance: function(sTableId, fnCallback) {
					return waitForTable.call(this, sTableId, {
						success: function(oTable) {
							fnCallback(oTable);
						}
					});
				}
			}
		},
		onTheAppMDCTable: {
			actions: AppActions,
			assertions: AppAssertions
		},
		P13nActions: {
			baseClass: P13nAction,
			actions: {
				/** Selects the column in Selection panel from p13n or column menu
				 *
				 * @param {Array} aColumnName list of column lanel that needs to be selected.
				 * @param {Boolean} [bModal] Indicates whether column menu or p13n dialog is used.
				 * @returns {Promise} OPA waitFor
				 */
				iSelectColumns: function(aColumnName, bModal) {
					return aColumnName.forEach((sColumnName) => {
						this.iSelectColumn(sColumnName, null, undefined, bModal);
					});
				}
			}
		},
		P13nAssertions: {
			baseClass: P13nAssertion,
			assertions: {
				/** Checks if the filter dialog is open.
				 *
				 * @returns {Promise} OPA waitFor
				 */
				iShouldSeeTheFilterDialog: function() {
					return this.iShouldSeeDialogTitle(P13nArrangement.P13nDialog.Titles.filter);
				}
			}
		}
	});
});