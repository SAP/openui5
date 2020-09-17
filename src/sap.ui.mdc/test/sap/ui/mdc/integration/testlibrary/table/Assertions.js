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
	"sap/ui/mdc/integration/testlibrary/p13n/waitForP13nDialog",
	"./waitForColumnHeader",
	"sap/ui/mdc/integration/testlibrary/p13n/waitForP13nButtonWithParentAndIcon"
], function(
	Ancestor,
	Properties,
	AggregationContainsPropertyEqual,
	TableUtil,
	waitForTable,
	waitForP13nDialog,
	waitForColumnHeader,
	waitForP13nButtonWithParentAndIcon
) {
	"use strict";

	return {
		// Toolbar Assertions
		iShouldSeeTheTableHeader: function(sName) {
			return waitForTable.call(this, {
				success: function(oTable) {
					return this.waitFor({
						controlType: "sap.m.Title",
						matchers: [
							new Ancestor(oTable, false),
							new Properties({
								text: sName
							})
						],
						success: function() {
							QUnit.assert.ok(true, "The table has the header '" + sName + "'");
						},
						errorMessage: "Table header is not displayed"
					});
				}
			});
		},
		iShouldSeeASortButtonForTheTable: function() {
			return waitForTable.call(this, {
				success: function(oTable) {
					waitForP13nButtonWithParentAndIcon.call(this, {
						parent: oTable,
						icon: TableUtil.SortButtonIcon,
						success: function(oButton) {
							QUnit.assert.ok(oButton, "The Table has a sort button.");
						},
						errorMessage: "The Table has no sort button"
					});
				}
			});
		},
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
		iShouldSeeRowsWithData: function(iAmountOfRows) {
			return waitForTable.call(this, {
				success: function(oTable) {
					return this.waitFor({
						controlType: "sap.m.ColumnListItem",
						matchers: [
							new Ancestor(oTable, false)
						],
						success: function(oRows) {
							QUnit.assert.equal(oRows.length, iAmountOfRows, "The Table has " + iAmountOfRows + " rows");
						},
						errorMessage: "The Table has an incorrect amount of rows"
					});
				}
			});
		},
		iShouldSeeARowWithData: function(iIndexOfRow, aExpectedData) {
			return waitForTable.call(this, {
				success: function(oTable) {
					var aMatchers = [];
					aMatchers.push(new AggregationContainsPropertyEqual({
						aggregationName: "cells",
						propertyName: "value",
						propertyValue: aExpectedData[0]
					}));
					aMatchers.push(new Ancestor(oTable, false));
					return this.waitFor({
						controlType: "sap.m.ColumnListItem",
						matchers: aMatchers,
						success: function(aRows) {
							var oRow = aRows[0];
							QUnit.assert.equal(iIndexOfRow, oRow.getParent().indexOfItem(oRow), "Row found in correct index");
							var aData = oRow.getCells().map(function(oCell) {
								return oCell.getValue();
							});
							QUnit.assert.deepEqual(aData, aExpectedData, "The row with index " + iIndexOfRow + " contains the right data");
						},
						errorMessage: "The Table has wrong data in the row with index " + iIndexOfRow
					});
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
								controlType: "sap.m.Popover",
								matchers: [
									new Ancestor(oColumn, false)
								],
								success: function(aPopovers) {
									QUnit.assert.equal(aPopovers.length, 1, "The column header dialog popover has opened");
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
		}
	};
});
