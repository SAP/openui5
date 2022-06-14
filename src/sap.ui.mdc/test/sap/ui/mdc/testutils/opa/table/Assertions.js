/*!
 * ${copyright}
 */

/* global QUnit */

sap.ui.define([
	"sap/ui/test/matchers/Ancestor",
	"sap/ui/test/matchers/Properties",
	"sap/ui/test/matchers/AggregationContainsPropertyEqual",
	"./Util",
	"./waitForTable",
	"./waitForColumnHeader",
	"../p13n/waitForP13nDialog",
	"./waitForP13nButtonWithParentAndIcon"
], function(
	Ancestor,
	Properties,
	AggregationContainsPropertyEqual,
	TableUtil,
	waitForTable,
	waitForColumnHeader,
	waitForP13nDialog,
	waitForP13nButtonWithParentAndIcon
) {
	"use strict";

	return {
		// Toolbar Assertions
		iShouldSeeAP13nButtonForTheTable: function() {
			return waitForTable.call(this, {
				success: function(oTable) {
					waitForP13nButtonWithParentAndIcon.call(this, {
						parent: oTable,
						icon: TableUtil.ColumnButtonIcon,
						success: function(oButton) {
							QUnit.assert.ok(oButton, "The Table has a P13n button.");
						},
						errorMessage: "The Table has no P13n button"
					});
				}
			});
		},
		iShouldSeeAButtonWithTextForTheTable: function(sText) {
			return waitForTable.call(this, {
				success: function(oTable) {
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers: [
							new Ancestor(oTable, false),
							new Properties({
								text: sText
							})
						],
						success: function(aButtons) {
							QUnit.assert.equal(aButtons.length, 1, "The Table has a '" + sText + "' button.");
						},
						errorMessage: "The Table has no '" + sText + "' button"
					});
				}
			});
		},
		// Data Assertions
		iShouldSeeGivenColumnsWithHeader: function(aColumnHeaders) {
			return waitForTable.call(this, {
				success: function(oTable) {
					var aColumns = oTable.getColumns();
					QUnit.assert.equal(aColumns.length, aColumnHeaders.length, "The Table has " + aColumnHeaders.length + " Columns");
					var aDisplayedColumns = [];
					aColumns.forEach(function(oColumn) {
						aDisplayedColumns.push(oColumn.getHeader());
					});
					QUnit.assert.deepEqual(aDisplayedColumns, aColumnHeaders, "The Table has the correct column headers");
				}
			});
		},
		// Sort Dialog Assertions
		iShouldSeeTheSortDialog: function() {
			waitForP13nDialog.call(this, {
				dialoTitle: TableUtil.SortDialogTitle,
				liveMode: false
			});
		},
		iShouldSeeASortedColumn: function(sColumn, sSortDirection) {
			return waitForTable.call(this, {
				success: function(oTable) {
					waitForColumnHeader.call(this, {
						table: oTable,
						columnName: sColumn,
						success: function(oColumn) {
							QUnit.assert.equal(oColumn.$()[0].attributes["aria-sort"].value, sSortDirection, "The column " + sColumn + " has the correct sort direction.");
						},
						errorMessage: "The column '" + sColumn + "' does not exist"
					});
				}
			});
		},
		// Column header dialog Assertions
		iShouldSeeAColumnHeaderMenu: function(sColumn) {
			return waitForTable.call(this, {
				success: function(oTable) {
					waitForColumnHeader.call(this, {
						table: oTable,
						columnName: sColumn,
						success: function(oColumn) {
							this.waitFor({
								searchOpenDialogs: true,
								controlType: "sap.m.table.columnmenu.Menu",
								success: function(aMenus) {
									QUnit.assert.ok(aMenus.length === 1 && aMenus[0].isOpen(), "The column header menu has opened");
								},
								errorMessage: "The column header dialog for column '" + sColumn + "' did not open"
							});
						},
						errorMessage: "The column '" + sColumn + "' does not exist"
					});
				}
			});
		},
		// Column Dialog Assertions
		iShouldSeeTheColumnSettingsDialog: function() {
			return waitForTable.call(this, {
				success: function(oTable) {
					waitForP13nDialog.call(this, {
						dialogParent: oTable,
						dialoTitle: TableUtil.ColumnDialogTitle,
						liveMode: false
					});
				}
			});
		},

		/**
		  * Checks whether the MDC Table has an active overlay
		  * @returns {Promise} OPA waitFor
		  */
		iShouldSeeAnOverlay: function() {
			return waitForTable.call(this, {
				success: function(oTable) {
					QUnit.assert.equal(oTable.$().find(".sapUiOverlay").length, 1, "Overlay was found on MDC Table");
				}
			});
		},

		/**
		  * Checks whether the MDC Table has no active overlay
		  * @returns {Promise} OPA waitFor
		  */
		iShouldSeeNoOverlay: function() {
			return waitForTable.call(this, {
				success: function(oTable) {
					QUnit.assert.equal(oTable.$().find(".sapUiOverlay").length, 0, "No overlay was found on MDC Table");
				}
			});
		}
	};
});
