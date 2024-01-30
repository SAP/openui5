/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"sap/ui/test/Opa5",
	"test-resources/sap/ui/mdc/testutils/opa/table/waitForTable",
	"test-resources/sap/ui/mdc/qunit/table/OpaTests/pages/Util",
	"sap/ui/test/matchers/Ancestor",
	"sap/ui/test/matchers/Properties",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"sap/ui/mdc/enums/TableType"
], function(
	/** @type sap.ui.core.Core */ Library,
	/** @type sap.ui.core.library */ CoreLibrary,
	/** @type sap.ui.test.Opa5 */ Opa5,
	/** @type sap.ui.test.Opa5 */ waitForTable,
	/** @type sap.ui.mdc.qunit.table.OpaTests.pages.Util */ Util,
	/** @type sap.ui.test.matchers.Ancestor */ Ancestor,
	/** @type sap.ui.test.matchers.Properties */ Properties,
	/** @type sap.ui.test.matchers.PropertyStrictEquals */ PropertyStrictEquals,
	/** @type sap.ui.mdc.enums.TableType */ TableType) {
	"use strict";

	/**
	 * @class Assertions
	 * @extends sap.ui.test.Opa5
	 * @private
	 * @alias sap.ui.mdc.qunit.table.OpaTests.pages.Assertions
	 */
	return {
		/**
		 * Checks if the 'Select all' check box is visible on the MDCTable.
		 * Succeeds only if {@link sap.ui.mdc.Table#multiSelectMode} is set to 'Default'
		 * when using a ResponsiveTable or if {@link sap.ui.table.plugins.MultiSelectionPlugin#limit} is set
		 * to '0' when using a GridTable.
		 *
		 * @param {string | sap.ui.mdc.Table} vTable Id or instance of the table
		 * @returns {Promise} OPA waitFor
		 * @private
		 */
		iShouldSeeTheSelectAllCheckBox: function(vTable) {
			return waitForTable.call(this, vTable, {
				success: function(oTable) {
					if (oTable._isOfType(TableType.ResponsiveTable)) {
						this.waitFor({
							id: oTable.getId() + "-innerTable-sa",
							controlType: "sap.m.CheckBox",
							success: function(oCheckBox) {
								Opa5.assert.ok(oCheckBox, "Table has 'Select All' check box");
							},
							errorMessage: "Did not find the 'Select all' checkbox"
						});
					} else {
						this.waitFor({
							check: function() {
								return oTable.getDomRef("innerTable-selall")
									?.querySelector(".sapUiTableSelAllVisible > .sapUiTableSelectAllCheckBox");
							},
							success: function() {
								Opa5.assert.ok(true, "Table has 'Select All' check box");
							},
							errorMessage: "Did not find the 'Select all' checkbox"
						});
					}
				}
			});
		},

		/**
		 * Checks if the 'Deselect all' icon is visible on the MDCTable.
		 * Succeeds only if {@link sap.ui.mdc.Table#multiSelectMode} is set to 'ClearAll'
		 * when using a ResponsiveTable or if {@link sap.ui.table.plugins.MultiSelectionPlugin#limit} is set
		 * to greater '0' when using a GridTable.
		 *
		 * @param {string | sap.ui.mdc.Table} vTable Id or instance of the table
		 * @returns {Promise} OPA waitFor
		 * @private
		 */
		iShouldSeeTheDeselectAllIcon: function(vTable) {
			return waitForTable.call(this, vTable, {
				success: function(oTable) {
					if (oTable._isOfType(TableType.ResponsiveTable)) {
						this.waitFor({
							id: oTable.getId() + "-innerTable-clearSelection",
							controlType: "sap.ui.core.Icon",
							success: function(oIcon) {
								Opa5.assert.ok(oIcon, "Table has 'Deselect all' icon");
							},
							errorMessage: "Did not find the 'Deselect all' icon"
						});
					} else {
						this.waitFor({
							controlType: "sap.ui.core.Icon",
							matchers: [{
								propertyStrictEquals: {
									name: "src",
									value: "sap-icon://clear-all"
								},
								ancestor: oTable
							}],
							check: function(aIcons) {
								return oTable.getDomRef("innerTable-selall").contains(aIcons[0].getDomRef());
							},
							success: function() {
								Opa5.assert.ok(true, "Table has 'Deselect all' icon");
							},
							errorMessage: "Did not find the 'Deselect all' icon"
						});
					}
				}
			});
		},

		/**
		 * Checks if the table header with the give text is visible on the MDCTable.
		 * Succeeds only if {@link sap.ui.mdc.Table#headerVisible} is set to <code>true</code>.
		 *
		 * @function
		 * @name iShouldSeeTheHeaderText
		 * @param {String|sap.ui.mdc.Table} oControl Id or control instance of the MDCTable
		 * @param {String} sHeaderText The text that the MDCTable header should contains
		 * @returns {Promise} OPA waitFor
		 * @private
		 */
		iShouldSeeTheHeaderText: function(oControl, sHeaderText) {
			const sTableId = typeof oControl === "string" ? oControl : oControl.getId();

			return waitForTable.call(this, oControl, {
				success: function(oTable) {
					return this.waitFor({
						id: sTableId + "-title",
						controlType: "sap.m.Title",
						check: function(oTitle) {
							return oTable.getHeaderVisible() && oTitle.getText().indexOf(sHeaderText) !== -1;
						},
						success: function() {
							Opa5.assert.ok(true, "Table header with text '" + sHeaderText + "' is visible");
						},
						errorMessage: "No table header found"
					});
				}
			});
		},

		/**
		 * Checks if the table count is visible on the MDCTable as part of the header text.
		 * Succeeds only if {@link sap.ui.mdc.Table#headerVisible} and {@link sap.ui.mdc.Table#showRowCount}
		 * are set to <code>true</code>.
		 *
		 * @function
		 * @name iShouldSeeTheCount
		 * @param {String|sap.ui.mdc.Table} oControl Id or control instance of the MDCTable
		 * @returns {Promise} OPA waitFor
		 * @private
		 */
		iShouldSeeTheCount: function(oControl) {
			const sTableId = typeof oControl === "string" ? oControl : oControl.getId();

			return waitForTable.call(this, oControl, {
				success: function(oTable) {
					return this.waitFor({
						id: sTableId + "-title",
						controlType: "sap.m.Title",
						check: function() {
							return oTable.getHeaderVisible() && oTable.getShowRowCount();
						},
						success: function(oTitle) {
							const aMatches = oTitle.getText().match(/.*\([0-9]*\)/);
							Opa5.assert.ok(aMatches.length === 1, "Table title contains item count");
						},
						errorMessage: "No table item count found"
					});
				}
			});
		},

		/**
		 * Checks if the variant management is visible on the MDCTable.
		 *
		 * @function
		 * @name iShouldSeeTheVariantManagement
		 * @param {String|sap.ui.mdc.Table} oControl Id or control instance of the MDCTable
		 * @returns {Promise} OPA waitFor
		 * @private
		 */
		iShouldSeeTheVariantManagement: function(oControl) {
			const sTableId = typeof oControl === "string" ? oControl : oControl.getId();

			return this.waitFor({
				id: sTableId + "-vm",
				controlType: "sap.ui.fl.variants.VariantManagement",
				success: function(oVariantManagement) {
					Opa5.assert.ok(oVariantManagement, "Table variant management is visible");
				},
				errorMessage: "No table variant management found"
			});
		},

		/**
		 * Checks if the Show/Hide Details button is visible on the MDCTable.
		 *
		 * @function
		 * @name iShouldSeeTheShowHideDetailsButton
		 * @param {String|sap.ui.mdc.Table} oControl Id or control instance of the MDCTable
		 * @param {Boolean} sKey The selected key
		 * @param {Boolean} bValue Button visibility
		 * @returns {Promise} OPA waitFor
		 * @private
		 */
		iShouldSeeTheShowHideDetailsButton: function(oControl, sKey, bValue) {
			const sTableId = typeof oControl === "string" ? oControl : oControl.getId();

			return this.waitFor({
				id: sTableId + "-showHideDetails",
				controlType: "sap.m.SegmentedButton",
				visible: bValue,
				success: function(oSegmentedButton) {
					if (bValue) {
						Opa5.assert.ok(oSegmentedButton, "Show/Hide Details button is visible");
						Opa5.assert.equal(oSegmentedButton.getItems()[0].getTooltip(), 'Show More per Row', "ShowDetails button created");
						Opa5.assert.equal(oSegmentedButton.getSelectedKey(), sKey);
					} else {
						Opa5.assert.ok(true, "The show details button is not visible");
					}
				},
				errorMessage: "No Show/Hide Details button found"
			});
		},

		/**
		 * Checks if the Paste button is visible on the MDCTable.
		 *
		 * @function
		 * @name iShouldSeeThePasteButton
		 * @param {String|sap.ui.mdc.Table} oControl Id or control instance of the MDCTable
		 * @returns {Promise} OPA waitFor
		 * @private
		 */
		iShouldSeeThePasteButton: function(oControl) {
			const sTableId = typeof oControl === "string" ? oControl : oControl.getId();

			return this.waitFor({
				id: sTableId + "-paste",
				controlType: "sap.m.Button",
				success: function(oButton) {
					Opa5.assert.ok(oButton, "Paste button is visible");
				},
				errorMessage: "No Paste button found"
			});
		},

		/**
		 * Checks if the P13n button is visible/not visible on the MDCTable.
		 *
		 * @param {string | sap.ui.mdc.Table} vTable Id or instance of the table
		 * @param {boolean} [bVisible=true] Flag if P13n button should be visible
		 * @returns {Promise} OPA waitFor
		 * @private
		 */
		iShouldSeeTheP13nButton: function(vTable, bVisible = true) {
			const sTableId = typeof vTable === "string" ? vTable : vTable.getId();

			this.waitFor({
				id: sTableId + "-settings",
				controlType: "sap.m.Button",
				visible: false,
				success: function(oButton) {
					Opa5.assert.strictEqual(oButton.getVisible(), bVisible, "The P13n button is " + (bVisible ? "visible" : "not visible"));
				},
				errorMessage: "P13n button was not found."
			});
		},

		/**
		 * Checks if the Export button is visible on the MDCTable.
		 *
		 * @function
		 * @name iShouldSeeTheExportMenuButton
		 * @param {String|sap.ui.mdc.Table} oControl Id or control instance of the MDCTable
		 * @returns {Promise} OPA waitFor
		 * @private
		 */
		iShouldSeeTheExportMenuButton: function(oControl) {
			const sTableId = typeof oControl === "string" ? oControl : oControl.getId();

			return this.waitFor({
				id: sTableId + "-export",
				controlType: "sap.m.MenuButton",
				success: function(oMenuButton) {
					Opa5.assert.ok(oMenuButton, "Export button is visible");
				},
				errorMessage: "No Export button found"
			});
		},

		/**
		 * Checks if there should be visible columns in the pop-in area or not.
		 *
		 * @function
		 * @name iShouldSeePopins
		 * @param {String|sap.ui.mdc.Table} oControl Id or control instance of the MDCTable
		 * @param {Boolean} bHasPopins Rather there should be visible columns in the pop-in area or not
		 * @returns {Promise} OPA waitFor
		 * @private
		 */
		iShouldSeePopins: function(oControl, bHasPopins) {
			return waitForTable.call(this, oControl, {
				success: function(oTable) {
					const oInnerTale = oTable._oTable;

					if (bHasPopins) {
						Opa5.assert.ok(oInnerTale._getVisiblePopin().length, "Table has visible pop-ins");
					} else {
						Opa5.assert.notOk(oInnerTale._getVisiblePopin().length, "Table has no visible pop-ins");
					}
				},
				errorMessage: "No table found"
			});
		},

		/**
		 * Checks if all visible rows should be selected or deselected.
		 *
		 * @function
		 * @name iShouldSeeAllVisibleRowsSelected
		 * @param {String|sap.ui.mdc.Table} oControl Id or control instance of the MDCTable
		 * @param {Boolean} bSelectAll Flag to selected or deselected all
		 * @returns {Promise} OPA waitFor
		 * @private
		 */
		iShouldSeeAllVisibleRowsSelected: function(oControl, bSelectAll) {
			return waitForTable.call(this, oControl, {
				success: function(oTable) {
					const oInnerTable = oTable._oTable;

					if (oTable._isOfType(TableType.ResponsiveTable)) {
						if (bSelectAll) {
							Opa5.assert.equal(oInnerTable.getItems().filter(function(oItem) {
								return oItem.getSelected() && Opa5.getJQuery()('#' + oItem.getId()).hasClass('sapMLIBSelected');
							}).length, oInnerTable.getItems().length, "All visible rows are selected");
						} else {
							Opa5.assert.equal(oInnerTable.getItems().filter(function(oItem) {
								return !oItem.getSelected() && !Opa5.getJQuery()('#' + oItem.getId()).hasClass('sapMLIBSelected');
							}).length, oInnerTable.getItems().length, "All visible rows are de-selected");
						}
					} else if (bSelectAll) {
						Opa5.assert.equal(oTable.getSelectedContexts().length, oTable.getRowBinding().getAllCurrentContexts().length,
							"All visible rows are selected");
					} else {
						Opa5.assert.equal(oTable.getSelectedContexts().length, 0, "All visible rows are de-selected");
					}
				},
				errorMessage: "No table found"
			});
		},

		/**
		 * Checks if the given rows are selected.
		 *
		 * @function
		 * @name iShouldSeeSomeRowsSelected
		 * @param {String|sap.ui.mdc.Table} oControl Id or control instance of the MDCTable
		 * @param {Number} iStartIndex Index from which the selection starts
		 * @param {Number} iEndIndex Index up to the selection ends
		 * @returns {Promise} OPA waitFor
		 * @private
		 */
		iShouldSeeSomeRowsSelected: function(oControl, iStartIndex, iEndIndex) {
			return waitForTable.call(this, oControl, {
				success: function(oTable) {
					let iIndex = iStartIndex;
					const oInnerTable = oTable._oTable;

					if (oTable._isOfType(TableType.ResponsiveTable)) {
						let oItem;
						for (iIndex; iIndex <= iEndIndex; iIndex++) {
							oItem = oInnerTable.getItems()[iIndex];
							Opa5.assert.ok(oItem.getSelected() && Opa5.getJQuery()('#' + oItem.getId()).hasClass('sapMLIBSelected'), "Row at index " + iIndex + " is selected");
						}
					} else {
						let oRow;
						for (iIndex; iIndex <= iEndIndex; iIndex++) {
							oRow = oInnerTable.getRows()[iIndex];
							Opa5.assert.ok(Opa5.getJQuery()('#' + oRow.getId()).hasClass('sapUiTableRowSel'), "Row at index " + iIndex + " is selected");
						}
					}
				},
				errorMessage: "No table found"
			});
		},

		/**
		 * Checks if row count is correct.
		 *
		 * @function
		 * @name iCheckBindingLength
		 * @param {String|sap.ui.mdc.Table} vControl Id or control instance of the MDCTable
		 * @param {Number} iLength Number of expected visible rows
		 * @returns {Promise} OPA waitFor
		 * @private
		 */
		iCheckBindingLength: function(vControl, iLength) {
			return waitForTable.call(this, vControl, {
				success: function(oTable) {
					return this.waitFor({
						check: function() {
							return oTable.getRowBinding().getLength() === iLength;
						},
						success: function() {
							Opa5.assert.ok(true, `Binding length is ${iLength}`);
						},
						errorMessage: `Binding length (expected: ${iLength}, actual: ${oTable.getRowBinding().getLength()})`
					});
				}
			});
		},

		/**
		 * Checks if column is at a certain index.
		 *
		 * @param {string | sap.ui.mdc.Table} vTable Id or instance of the table
		 * @param {string} sColumnId Column id
		 * @param {number} iColumnIndex The expected index of the column
		 * @returns {Promise} OPA waitFor
		 * @private
		 */
		iCheckColumnPosition: function(vTable, sColumnId, iColumnIndex) {
			return waitForTable.call(this, vTable, {
				success: function(oTable) {
					this.waitFor({
						id: sColumnId,
						matchers: [{
							ancestor: oTable
						}],
						success: function(oColumn) {
							Opa5.assert.equal(oTable.indexOfColumn(oColumn), iColumnIndex, `Column ${oColumn.getId()} is at index ${iColumnIndex}`);
						},
						errorMessage: "Column not found"
					});
				}
			});
		},

		/**
		 * Checks if the dialog, showing the actual process status of the export,
		 * is visible on the screen.
		 *
		 * @function
		 * @name iShouldSeeExportProcessDialog
		 * @returns {Promise} OPA waitFor
		 * @private
		 */
		iShouldSeeExportProcessDialog: function() {
			return this.waitFor({
				controlType: "sap.m.Dialog",
				success: function(aDialogs) {
					const oDialog = aDialogs[0];
					const oResourceBundle = Library.getResourceBundleFor("sap.ui.export");
					return this.waitFor({
						controlType: "sap.m.Title",
						searchOpenDialogs: true,
						matchers: new PropertyStrictEquals({
							name: "text",
							value: oResourceBundle.getText("PROGRESS_TITLE")
						}),
						success: function() {
							Opa5.assert.ok(oDialog, "Export process dialog is visible");
						},
						errorMessage: "No dialog title found"
					});
				},
				errorMessage: "No Export process dialog found"
			});
		},

		/**
		 * Checks if the {@link sap.ui.unified.Menu} shows up after
		 * pressing on the arrow button performed in {@link #iPressExportArrowButton}.
		 *
		 * @function
		 * @name iShouldSeeExportMenu
		 * @returns {Promise} OPA waitFor
		 * @private
		 */
		iShouldSeeExportMenu: function() {
			return this.waitFor({
				controlType: "sap.ui.unified.Menu",
				success: function(oMenu) {
					Opa5.assert.ok(oMenu.length, "Export menu is visible");
				},
				errorMessage: "No Export menu found"
			});
		},

		/**
		 * Checks if the {@link sap.m.Dialog} 'exportSettingsDialog' is visible on the screen after
		 * pressing on the 'Export as...' button performed in {@link #iPressExportAsButtonInMenu}.
		 *
		 * @function
		 * @name iShouldSeeExportSettingsDialog
		 * @returns {Promise} OPA waitFor
		 * @private
		 */
		iShouldSeeExportSettingsDialog: function() {
			return this.waitFor({
				id: "exportSettingsDialog",
				controlType: "sap.m.Dialog",
				success: function(oDialog) {
					Opa5.assert.ok(oDialog, "'Export settings' dialog is visible");
				},
				errorMessage: "No 'Export settings' dialog found"
			});
		},

		iShouldSeeTheColumnMenu: function() {
			return Util.waitForColumnMenu.call(this, {
				success: function(oColumnMenu) {
					Opa5.getContext().columnMenu = oColumnMenu;
					Opa5.assert.ok(true, "The column menu is open");
				}
			});
		},

		iShouldNotSeeTheColumnMenu: function() {
			return this.waitFor({
				check: function() {
					return !Opa5.getContext().columnMenu.isOpen();
				},
				success: function() {
					Opa5.assert.ok(true, "The column menu is closed");
				},
				errorMessage: "The column menu is open"
			});
		},

		iShouldSeeNumberOfColumnMenuQuickActions: function(iCount) {
			if (iCount === 0) {
				return this.iShouldNotSeeColumnMenuQuickActions();
			}

			return Util.waitForColumnMenu.call(this, {
				success: function(oColumnMenu) {
					this.waitFor({
						controlType: "sap.m.Label", // QuickActions themselves are not rendered. We expect there's one label for every QuickAction.
						matchers: [{
							ancestor: oColumnMenu
						}],
						success: function(aLabels) {
							Opa5.assert.equal(aLabels.length, iCount, "Number of visible column menu quick actions");
						},
						errorMessage: "No column menu quick actions found"
					});
				}
			});
		},

		iShouldNotSeeColumnMenuQuickActions: function() {
			return Util.waitForColumnMenu.call(this, {
				success: function(oColumnMenu) {
					this.waitFor({
						success: function() {
							Opa5.assert.notOk(oColumnMenu.$().find(".sapMTCMenuQAList").is(":visible"), "No visible column menu quick actions");
						}
					});
				}
			});
		},

		iShouldSeeColumnMenuQuickSort: function(mSortItemInfo) {
			return Util.waitForColumnMenu.call(this, {
				success: function(oColumnMenu) {
					this.waitFor({
						controlType: "sap.m.table.columnmenu.QuickSortItem",
						visible: false,
						matchers: [{
							ancestor: oColumnMenu,
							properties: {
								key: mSortItemInfo.key,
								label: mSortItemInfo.label,
								sortOrder: mSortItemInfo.sortOrder
							}
						}],
						success: function(aQuickSortItems) {
							Opa5.assert.equal(aQuickSortItems.length, 1, "Found column menu QuickSortItem");
							this.waitFor({
								controlType: "sap.m.ToggleButton",
								matchers: [{
									ancestor: aQuickSortItems[0]
								}],
								success: function(aToggleButtons) {
									Opa5.assert.equal(aToggleButtons.length, 2, "QuickSortItem content is visible");
									Opa5.assert.equal(aToggleButtons[0].getPressed(), mSortItemInfo.sortOrder === CoreLibrary.SortOrder.Ascending,
										"Ascending button pressed state");
									Opa5.assert.equal(aToggleButtons[1].getPressed(), mSortItemInfo.sortOrder === CoreLibrary.SortOrder.Descending,
										"Descending button pressed state");
								},
								errorMessage: "QuickSortItem content is not visible"
							});
						},
						errorMessage: "Column menu QuickSortItem not found"
					});
				}
			});
		},

		iShouldSeeColumnMenuQuickGroup: function(mGroupItemInfo) {
			return Util.waitForColumnMenu.call(this, {
				success: function(oColumnMenu) {
					this.waitFor({
						controlType: "sap.m.table.columnmenu.QuickGroupItem",
						visible: false,
						matchers: [{
							ancestor: oColumnMenu,
							properties: {
								key: mGroupItemInfo.key,
								label: mGroupItemInfo.label,
								grouped: mGroupItemInfo.grouped
							}
						}],
						success: function(aQuickGroupItems) {
							Opa5.assert.equal(aQuickGroupItems.length, 1, "Found column menu QuickGroupItem");
							this.waitFor({
								controlType: "sap.m.ToggleButton",
								matchers: [{
									ancestor: aQuickGroupItems[0].getParent(),
									properties: {
										text: mGroupItemInfo.label,
										pressed: mGroupItemInfo.grouped
									}
								}],
								success: function(aToggleButton) {
									Opa5.assert.equal(aToggleButton.length, 1, "QuickGroupItem content is visible");
								},
								errorMessage: "QuickGroupItem content is not visible"
							});
						},
						errorMessage: "Column menu QuickGroupItem not found"
					});
				}
			});
		},

		iShouldSeeColumnMenuQuickTotal: function(mTotalItemInfo) {
			return Util.waitForColumnMenu.call(this, {
				success: function(oColumnMenu) {
					this.waitFor({
						controlType: "sap.m.table.columnmenu.QuickTotalItem",
						visible: false,
						matchers: [{
							ancestor: oColumnMenu,
							properties: {
								key: mTotalItemInfo.key,
								label: mTotalItemInfo.label,
								totaled: mTotalItemInfo.totaled
							}
						}],
						success: function(aQuickTotalItems) {
							Opa5.assert.equal(aQuickTotalItems.length, 1, "Found column menu QuickTotalItem");
							this.waitFor({
								controlType: "sap.m.ToggleButton",
								matchers: [{
									ancestor: aQuickTotalItems[0].getParent(),
									properties: {
										text: mTotalItemInfo.label,
										pressed: mTotalItemInfo.totaled
									}
								}],
								success: function(aToggleButton) {
									Opa5.assert.equal(aToggleButton.length, 1, "QuickTotalItem content is visible");
								},
								errorMessage: "QuickTotalItem content is not visible"
							});
						},
						errorMessage: "Column menu QuickTotalItem not found"
					});
				}
			});
		},

		iShouldSeeNumberOfColumnMenuItems: function(iCount) {
			if (iCount === 0) {
				return this.iShouldNotSeeColumnMenuItems();
			}

			return Util.waitForColumnMenu.call(this, {
				success: function(oColumnMenu) {
					this.waitFor({
						controlType: "sap.m.StandardListItem", // Items themselves are not rendered. We expect there's one list item for every Item.
						matchers: [{
							ancestor: oColumnMenu
						}],
						success: function(aLabels) {
							Opa5.assert.equal(aLabels.length, iCount, "Number of visible column menu items");
						},
						errorMessage: "No column menu items found"
					});
				}
			});
		},

		/**
		 * Checks if there are no QuickActions available in the column menu.
		 *
		 * @function
		 * @name iShouldNotSeeColumnMenuItems
		 * @returns {Promise} OPA waitFor
		 */
		iShouldNotSeeColumnMenuItems: function() {
			return Util.waitForColumnMenu.call(this, {
				success: function(oColumnMenu) {
					this.waitFor({
						success: function() {
							Opa5.assert.notOk(oColumnMenu.$().find(".sapMTCMenuContainerWrapper").is(":visible"), "No visible column menu items");
						}
					});
				}
			});
		},

		iShouldSeeColumnMenuItems: function(aLabels) {
			aLabels.forEach(this.iShouldSeeColumnMenuItem, this);
			return this;
		},

		iShouldSeeColumnMenuItem: function(sLabel) {
			return Util.waitForColumnMenu.call(this, {
				success: function(oColumnMenu) {
					this.waitFor({
						controlType: "sap.m.StandardListItem", // Items themselves are not rendered. We expect there's one list item for every Item.
						matchers: [{
							ancestor: oColumnMenu,
							properties: {
								title: sLabel
							}
						}],
						success: function(aStandardListItems) {
							Opa5.assert.equal(aStandardListItems.length, 1, "Column menu item '" + sLabel + "' found");
						},
						errorMessage: "No column menu items found"
					});
				}
			});
		},

		iShouldSeeColumnMenuItemContent: function(sTitle) {
			return Util.waitForColumnMenu.call(this, {
				success: function(oColumnMenu) {
					this.waitFor({
						controlType: "sap.m.Title",
						matchers: [{
							ancestor: oColumnMenu,
							properties: {
								text: sTitle
							}
						}],
						success: function(aButtons) {
							Opa5.assert.ok(true, "Colum menu item content '" + sTitle + "' is visible");
						},
						errorMessage: "Colum menu item content '" + sTitle + "' is not visible"
					});
				}
			});
		},

		/**
		 * Checks if sorting configuration of the column matches the specified sorting settings.
		 *
		 * @function
		 * @name iShouldSeeColumnSorted
		 * @param {String|sap.ui.mdc.Table} vTable Id or instance of the table
		 * @param {String|sap.ui.mdc.table.Column} vColumn Header name or instance of the column
		 * @param {Boolean} bDescending Sorting direction is descending
		 */
		iShouldSeeColumnSorted: function(vTable, vColumn, bDescending) {
			return waitForTable.call(this, vTable, {
				success: function(oTable) {
					const aSortConditions = oTable.getSortConditions().sorters;

					for (let i = 0; i < aSortConditions.length; i++) {
						if (typeof vColumn === 'object' && aSortConditions[i].name === vColumn.getHeader() && aSortConditions[i].descending === bDescending) {
							Opa5.assert.equal(aSortConditions[i].name, vColumn.getHeader(), "Column " + vColumn + " has sorting condition");
							Opa5.assert.equal(aSortConditions[i].descending, bDescending, "Column " + vColumn + " is sorted " + ((bDescending) ? "descending" : "ascending"));
							return;
						} else if (aSortConditions[i].descending === bDescending && aSortConditions[i].name === vColumn){
							Opa5.assert.equal(aSortConditions[i].name, vColumn, "Column " + vColumn + "has sorting condition");
							Opa5.assert.equal(aSortConditions[i].descending, bDescending, "Column " + vColumn + "is sorted " + ((bDescending) ? "descending" : "ascending"));
							return;
						}
					}
					Opa5.assert.notOk(true, "Either no sorting conditions were found or no conditions are matching the function parameters");
				}
			});
		},

		/**
		 * Checks if the selected column of the sorting combobox matches the specified column in the parameter.
		 *
		 * @function
		 * @name iShouldSeeSortedByColumnInColumnMenuItem
		 * @param {String} sColumn Header of the column
		 * @returns {Promise} OPA waitFor
		 */
		iShouldSeeSortedByColumnInColumnMenuItem: function(sColumn) {
			return Util.waitForColumnMenu.call(this, {
				success: function(oColumnMenu) {
					this.waitFor({
						controlType: "sap.m.ComboBox",
						matchers: [{
							ancestor: oColumnMenu
						}],
						success: function(aComboBox) {
							Opa5.assert.equal(aComboBox[0].getValue(), sColumn, "Selected item in combobox is " + aComboBox[0].getValue());
						},
						errorMessage: "Colum menu item content could not be confirmed"
					});
				}
			});
		},

		/**
		 * Checks if sorting direction inside the column menu matches the specified sorting direction.
		 *
		 * @function
		 * @name iShouldSeeSortDirectionInColumnMenuItem
		 * @param {Boolean} bDescending Sorting direction is descending
		 * @returns {Promise} OPA waitFor
		 */
		iShouldSeeSortDirectionInColumnMenuItem: function(bDescending) {
			return Util.waitForColumnMenu.call(this, {
				success: function(oColumnMenu) {
					this.waitFor({
						controlType: "sap.m.SegmentedButton",
						matchers: [{
							ancestor: oColumnMenu
						}],
						success: function(aSegmentedButton) {
							const sButton = aSegmentedButton[0].getSelectedItem();
							const aButtons = aSegmentedButton[0].getItems();

							for (let i = 0; i < aButtons.length; i++) {
								if (aButtons[i].getId() === sButton) {
									Opa5.assert.equal(aButtons[i].getProperty("key"), ((bDescending) ? "desc" : "asc"), ((bDescending) ? "Descending" : "Ascending") + " is selected");
								}
							}
						},
						errorMessage: "Colum menu item content could not be confirmed"
					});
				}
			});
		},

		/**
		 * Checks if the filter info bar contains all the filtered columns.
		 *
		 * @param {sap.ui.core.Control|string} vControl control instance or control ID
		 * @param {string[]} aFilteredColumns array of column names that should be visible
		 * @returns {Promise} OPA waitFor
		 */
		iShouldSeeInfoFilterBarWithFilters: function(vControl, aFilteredColumns) {
			const sTableId = typeof vControl === "string" ? vControl : vControl.getId();

			return this.waitFor({
				id: sTableId + "-filterInfoBar",
				controlType: "sap.m.OverflowToolbar",
				success: function(oToolbar) {
					aFilteredColumns.forEach(function(sFilteredColumns) {
						Opa5.assert.ok(oToolbar.getContent()[0].getText().includes(sFilteredColumns), "Info filterbar is visible and contains expected columns.");
					});
				}
			});
		},

		/**
		 * Checks if the filter info bar is not visible.
		 *
		 * @param {sap.ui.core.Control|string} vControl control instance or control ID
		 * @returns {Promise} OPA waitFor
		 */
		iShouldNotSeeInfoFilterBar: function(vControl) {
			const sTableId = typeof vControl === "string" ? vControl : vControl.getId();

			return this.waitFor({
				id: sTableId + "-filterInfoBar",
				controlType: "sap.m.OverflowToolbar",
				visible: false,
				success: function(oFilterBar) {
					Opa5.assert.notOk(oFilterBar.getVisible(), "Info Filterbar is not visible");
				}
			});
		},

		/**
		 * Checks if the specified values in the filter dialog can be seen for the column.
		 * @param {string} sColumn column name
		 * @param {string} sValue filter value
		 * @returns {Promise} OPA waitFor
		 */
		iShouldSeeValuesInFilterDialog: function(sColumn, sValue) {
			return Util.waitForP13nDialog.call(this, {
				success: function(oDialog) {
					this.waitFor({
						controlType: "sap.ui.mdc.FilterField",
						matchers: [{
							properties: {
								label: sColumn
							}
						}],
						success: function(aFilterFields) {
							Opa5.assert.equal(aFilterFields.length, 1, "Only 1 field rendered");
							const bContainsValue = aFilterFields[0].getConditions().some(function(oCondition) {
								return oCondition.values.indexOf(sValue) > -1;
							});
							Opa5.assert.ok(bContainsValue, "Value is contained in filter field");
						}
					});
				}
			});
		},

		/**
		 * Checks if the focus is on the given control
		 *
		 * @param {sap.ui.core.Control|string} vControl control instance or control ID
		 * @returns {Promsie} OPA waitFor
		 */
		iShouldSeeFocusOnControl: function(vControl) {
			const sControlId = typeof vControl === "string" ? vControl : vControl.getId();

			return this.waitFor({
				id: sControlId,
				success: function(oControl) {
					Opa5.assert.ok(oControl.getDomRef().contains(Opa5.getWindow().document.activeElement), "Focus is on expected element");
				}
			});
		},

		/**
		 * Checks if the variant is selected
		 *
		 * @param {String} sVariantName Selected variant name
		 * @returns {Promise} OPA waitFor
		 */
		iShouldSeeSelectedVariant: function(sVariantName) {
			return this.waitFor({
				controlType: "sap.ui.fl.variants.VariantManagement",
				matchers: {
					ancestor: {
						controlType: "sap.ui.mdc.ActionToolbar"
					}
				},
				check: function (aVariantManagements) {
					return !!aVariantManagements.length;
				},
				success: function (aVariantManagements) {
					Opa5.assert.equal(aVariantManagements.length, 1, "VariantManagement found");
					this.waitFor({
						controlType: "sap.m.Title",
						matchers: [
							new Ancestor(aVariantManagements[0]), new Properties({
								text: sVariantName
							})
						],
						success: function (aItems) {
							Opa5.assert.equal(aItems.length, 1, "Variant '" + sVariantName + "' found");
						},
						errorMessage: "Could not find core item with text " + sVariantName
					});
				},
				errorMessage: "Could not find VariantManagement"
			});
		},

		/**
		 * Checks if a row has no binding context.
		 *
		 * @param {string | sap.ui.mdc.Table} vTable Id or instance of the table
		 * @param {object} mConfig Config
		 * @param {int} mConfig.index Index of the row in the aggregation of the inner table
		 * @returns {Promise} OPA waitFor
		 */
		iCheckRowIsEmpty: function(vTable, mConfig) {
			return Util.waitForRow.call(this, vTable, {
				index: mConfig.index,
				check: function(oRow, oBindingContext) {
					return !oBindingContext;
				},
				success: function(oTable, oRow) {
					Opa5.assert.ok(true, `The row at index ${mConfig.index} is empty`);
				},
				errorMessage: `No empty row at index ${mConfig.index} found`
			});
		},

		/**
		 * Checks the content of a row.
		 *
		 * @param {string | sap.ui.mdc.Table} vTable Id or instance of the table
		 * @param {object} mConfig Config
		 * @param {int} mConfig.index Index of the row in the aggregation of the inner table
		 * @param {object} mConfig.data Information about the data, where the key is the path in the rows binding context
		 * @returns {Promise} OPA waitFor
		 */
		iCheckRowData: function(vTable, mConfig) {
			return Util.waitForRow.call(this, vTable, {
				index: mConfig.index,
				data: mConfig.data || {},
				success: function(oTable, oRow) {
					Opa5.assert.ok(true, `The row at index ${mConfig.index} has the expected data`);
				}
			});
		},

		/**
		 * Checks the title of a group header row.
		 *
		 * @param {string | sap.ui.mdc.Table} vTable Id or instance of the table
		 * @param {object} mConfig Config
		 * @param {int} mConfig.index Index of the row in the aggregation of the inner table
		 * @param {int} mConfig.title Group header title
		 * @returns {Promise} OPA waitFor
		 */
		iCheckGroupHeaderRowTitle: function(vTable, mConfig) {
			let oFoundRow;

			return Util.waitForRow.call(this, vTable, {
				index: mConfig.index,
				check: function(oRow, oBindingContext) {
					oFoundRow = oRow;
					return typeof oRow.getTitle === "function" && oRow.getTitle() === mConfig.title;
				},
				success: function(oTable, oRow) {
					Opa5.assert.ok(true, `The group header row at index ${mConfig.index} has the expected title`);
				},
				error: function(mError) {
					mError.errorMessage = mError.errorMessage.replace("$title", oFoundRow?.getTitle?.());
				},
				errorMessage: `The group header row at index ${mConfig.index} has title "$title", expected "${mConfig.title}"`
			});
		}
	};
});