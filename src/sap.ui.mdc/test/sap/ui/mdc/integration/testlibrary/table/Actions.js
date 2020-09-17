/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/matchers/Ancestor",
	"sap/ui/test/matchers/Properties",
	"sap/ui/test/actions/Press",
	"sap/ui/mdc/integration/testlibrary/Util",
	"./Util",
	"./waitForTable",
	"sap/ui/mdc/integration/testlibrary/p13n/waitForP13nDialog",
	"./waitForColumnHeader",
	"sap/ui/mdc/integration/testlibrary/p13n/waitForP13nButtonWithParentAndIcon",
	"sap/ui/mdc/integration/testlibrary/p13n/waitForListItemInDialogWithLabel"
], function(
	Ancestor,
	Properties,
	Press,
	TestUtil,
	TableUtil,
	waitForTable,
	waitForP13nDialog,
	waitForColumnHeader,
	waitForP13nButtonWithParentAndIcon,
	waitForListItemInDialogWithLabel
) {
	"use strict";

	var clickOnTheReorderButtonOfDialog = function(sDialogTitle) {
		waitForP13nDialog.call(this, {
			dialogTitle: sDialogTitle,
			liveMode: false,
			success: function(oDialog) {
				this.waitFor({
					controlType: "sap.m.Button",
					matchers: [
						new Properties({
							text: TestUtil.getTextFromResourceBundle("sap.ui.mdc", "p13nDialog.REORDER")
						}),
						new Ancestor(oDialog)
					],
					actions: new Press()
				});
			}
		});
	};

	var moveColumnListItemInDialogToTop = function(sColumnName, sDialogTitle) {
		waitForP13nDialog.call(this, {
			dialogTitle: sDialogTitle,
			liveMode: false,
			success: function(oColumnDialog) {
				waitForListItemInDialogWithLabel.call(this, {
					dialog: oColumnDialog,
					label: sColumnName,
					success: function(oColumnListItem) {
						oColumnListItem.$().trigger("tap");
						this.waitFor({
							controlType: "sap.m.OverflowToolbarButton",
							matchers: [
								new Ancestor(oColumnDialog),
								new Properties({
									icon: TableUtil.MoveToTopIcon
								})
							],
							actions: new Press()
						});
					}
				});
			}
		});
	};

	var changeColumnListItemSelectedState = function(sColumnName, bSelected, sDialogTitle) {
		waitForP13nDialog.call(this, {
			dialogTitle: sDialogTitle,
			liveMode: false,
			success: function(oSortDialog) {
				waitForListItemInDialogWithLabel.call(this, {
					dialog: oSortDialog,
					label: sColumnName,
					success: function(oColumnListItem) {
						var oCheckBox = oColumnListItem.getMultiSelectControl();
						if (oCheckBox.getSelected() !== bSelected) {
							oCheckBox.$().trigger("tap");
						}
					}
				});
			}
		});
	};

	return {
		// Sort dialog actions
		iClickOnTheSortButton: function() {
			return waitForTable.call(this, {
				success: function(oTable) {
					waitForP13nButtonWithParentAndIcon.call(this, {
						parent: oTable,
						icon: TableUtil.SortButtonIcon,
						actions: new Press(),
						errorMessage: "The Table has no P13n sort button"
					});
				}
			});
		},
		iChangeColumnSortedState: function(sColumnName, bSelected) {
			return changeColumnListItemSelectedState.call(this, sColumnName, bSelected, TableUtil.SortDialogTitle);
		},
		iChangeASelectedColumnSortDirection: function(sColumnName, bDescending) {
			waitForP13nDialog.call(this, {
				dialogTitle: TableUtil.SortDialogTitle,
				liveMode: false,
				success: function(oSortDialog) {
					waitForListItemInDialogWithLabel.call(this, {
						dialog: oSortDialog,
						label: sColumnName,
						success: function(oColumnListItem) {
							this.waitFor({
								controlType: "sap.m.Select",
								matchers: new Ancestor(oColumnListItem),
								actions: new Press(),
								success: function(aSelect) {
									if (bDescending) {
										aSelect[0].getItems()[1].$().trigger("tap");
									} else {
										aSelect[0].getItems()[0].$().trigger("tap");
									}
								}
							});
						}
					});
				}
			});
		},
		iClickOnTheSortReorderButton: function() {
			return clickOnTheReorderButtonOfDialog.call(this, TableUtil.SortDialogTitle);
		},
		iMoveSortOrderOfColumnToTheTop: function(sColumnName) {
			return moveColumnListItemInDialogToTop.call(this, sColumnName, TableUtil.SortDialogTitle);
		},
		// Column setting dialog actions
		iClickOnTheColumnSettingsButton: function() {
			return waitForTable.call(this, {
				success: function(oTable) {
					waitForP13nButtonWithParentAndIcon.call(this, {
						parent: oTable,
						icon: TableUtil.ColumnButtonIcon,
						actions: new Press(),
						errorMessage: "The Table has no P13n settings button"
					});
				}
			});
		},
		iChangeColumnSelectedState: function(sColumnName, bSelected) {
			return changeColumnListItemSelectedState.call(this, sColumnName, bSelected, TableUtil.ColumnDialogTitle);
		},
		iClickOnTheColumnReorderButton: function() {
			return clickOnTheReorderButtonOfDialog.call(this, TableUtil.ColumnDialogTitle);
		},
		iMoveAColumnToTheTop: function(sColumnName) {
			return moveColumnListItemInDialogToTop.call(this, sColumnName, TableUtil.ColumnDialogTitle);
		},
		// Column header actions
		iClickOnColumnHeader: function(sColumn) {
			return waitForTable.call(this, {
				success: function(oTable) {
					waitForColumnHeader.call(this, {
						table: oTable,
						columnName: sColumn,
						actions: new Press(),
						errorMessage: "The column " + sColumn + "is not available"
					});
				}
			});
		},
		iClickOnAColumnHeaderMenuButtonWithIcon: function(sColumn, sIcon) {
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
									waitForP13nButtonWithParentAndIcon.call(this, {
										parent: aPopovers[0],
										icon: sIcon,
										actions: new Press(),
										errorMessage: "The column header menu button " + sIcon + " is not available"
									});
								},
								errorMessage: "The column header toolbar popup is not available"
							});
						}
					});
				}
			});
		}
	};
});
