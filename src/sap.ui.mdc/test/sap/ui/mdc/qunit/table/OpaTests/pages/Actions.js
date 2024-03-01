/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"test-resources/sap/ui/mdc/testutils/opa/table/waitForTable",
	"test-resources/sap/ui/mdc/testutils/opa/table/Actions",
	"test-resources/sap/ui/mdc/qunit/table/OpaTests/pages/Util",
	"sap/ui/test/actions/Drag",
	"sap/ui/test/actions/Drop",
	"sap/ui/mdc/enums/TableType"
], function(
	Library,
	/** @type sap.ui.test.Opa5 */ Opa5,
	/** @type sap.ui.test.actions.Press */ Press,
	/** @type sap.ui.test.matchers.PropertyStrictEquals */ PropertyStrictEquals,
	/** @type sap.ui.test.Opa5 */ waitForTable,
	/** @type sap.ui.test.Opa5 */ TableActions,
	/** @type sap.ui.mdc.qunit.table.OpaTests.pages.Util */ Util,
	/** @type sap.ui.test.actions.Drag */ Drag,
	/** @type sap.ui.test.actions.Drop */ Drop,
	/** @type sap.ui.mdc.enums.TableType */ TableType) {
	"use strict";

	/**
	 * This Actions are for the internal testing of the MDCTable only!
	 * The public Actions can be found in src/sap/ui/mdc/test/sap/ui/mdc/testutils/opa/table/Actions.js .
	 *
	 * @class Actions
	 * @extends sap.ui.test.Opa5
	 * @private
	 * @alias sap.ui.mdc.qunit.table.OpaTests.pages.Actions
	 */
	return {
		/**
		 * Emulates a click action on the 'Select all' check box to select / deselect all visible rows.
		 * Succeeds only if {@link sap.ui.mdc.Table#multiSelectMode} is set to <code>Default</code>
		 * when using a ResponsiveTable or if {@link sap.ui.table.plugins.MultiSelectionPlugin#limit} is set
		 * to <code>0</code> when using a GridTable.
		 *
		 * @param {string | sap.ui.mdc.Table} vTable Id or instance of the table
		 * @returns {Promise} OPA waitFor
		 * @private
		 */
		iClickOnSelectAllCheckBox: function(vTable) {
			return waitForTable.call(this, vTable, {
				success: function(oTable) {
					if (oTable._isOfType(TableType.ResponsiveTable)) {
						this.waitFor({
							id: oTable.getId() + "-innerTable-sa",
							controlType: "sap.m.CheckBox",
							actions: new Press(),
							errorMessage: "Did not find the 'Select all' checkbox"
						});
					} else {
						this.waitFor({
							check: function() {
								return oTable.getDomRef("innerTable-selall");
							},
							success: function() {
								new Press({idSuffix: "innerTable-selall"}).executeOn(oTable);
							},
							errorMessage: "Did not find the 'Select all' checkbox"
						});
					}
				}
			});
		},

		/**
		 * Emulates a click action on the 'Deselect all' icon to remove the selection on all visible rows.
		 * Succeeds only if {@link sap.ui.mdc.Table#multiSelectMode} is set to <code>ClearAll</code>
		 * when using a ResponsiveTable or if {@link sap.ui.table.plugins.MultiSelectionPlugin#limit} is set
		 * to greater <code>0</code> when using a GridTable.
		 *
		 * @function
		 * @name iClickOnClearAllIcon
		 * @param {String|sap.ui.mdc.Table} oControl Id or control instance of the MDCTable
		 * @returns {Promise} OPA waitFor
		 * @private
		 */
		iClickOnClearAllIcon: function(oControl) {
			const sTableId = typeof oControl === "string" ? oControl : oControl.getId();

			return waitForTable.call(this, oControl, {
				success: function(oTable) {
					if (oTable._isOfType(TableType.ResponsiveTable)) {
						return this.waitFor({
							id: sTableId + "-innerTable-clearSelection",
							controlType: "sap.ui.core.Icon",
							actions: new Press(),
							errorMessage: "Did not find the 'Deselect all' icon"
						});
					} else {
						return this.waitFor({
							check: function() {
								return Opa5.getJQuery()("#" + sTableId + "-innerTable-selall").length === 1;
							},
							success: function() {
								new Press({idSuffix: "innerTable-selall"}).executeOn(oTable);
							},
							errorMessage: "Did not find the 'Deselect all' icon"
						});
					}
				}
			});
		},

		/**
		 * Emulates a click action on the check box of one or multiple rows to select them.
		 *
		 * @param {string | sap.ui.mdc.Table} vTable Id or instance of the table
		 * @param {Number} iStartIndex Index from which the selection starts
		 * @param {Number} iEndIndex Index up to the selection ends
		 * @returns {Promise} OPA waitFor
		 */
		iClickOnRowSelectCheckBox: function(vTable, iStartIndex, iEndIndex) {
			for (let iIndex = iStartIndex; iIndex <= iEndIndex; iIndex++) {
				Util.waitForRow.call(this, vTable, {
					index: iIndex,
					success: function(oTable, oRow) {
						if (oTable._isOfType(TableType.Table, true)) {
							new Press({idSuffix: "innerTable-rowsel" + iIndex}).executeOn(oTable);
						} else {
							new Press({idSuffix: "selectMulti"}).executeOn(oRow);
						}
						Opa5.assert.ok(true, "Pressed selection checkbox on row with index " + iIndex);
					}
				});
			}

			return this;
		},

		/**
		 * Emulates a click action on the expand all rows button.
		 *
		 * @function
		 * @name iClickOnExpandAllRowsButton
		 * @param {String|sap.ui.mdc.Table} vControl Id or control instance of the MDCTable
		 * @returns {Promise} OPA waitFor
		 * @private
		 */
		iClickOnExpandAllRowsButton: function(vControl) {
			return waitForTable.call(this, vControl, {
				success: function(oTable) {
					return this.waitFor({
						id: oTable.getId() + "-expandAll",
						controlType: "sap.m.Button",
						actions: new Press(),
						success: function() {
							Opa5.assert.ok(true, "Pressed Expand All Rows button");
						},
						errorMessage: "Could not press Expand Button"
					});
				}
			});
		},

		/**
		 * Emulates a click action on the collapse all rows button.
		 *
		 * @function
		 * @name iClickOnCollapseAllRowsButton
		 * @param {String|sap.ui.mdc.Table} vControl Id or control instance of the MDCTable
		 * @returns {Promise} OPA waitFor
		 * @private
		 */
		iClickOnCollapseAllRowsButton: function(vControl) {
			return waitForTable.call(this, vControl, {
				success: function(oTable) {
					return this.waitFor({
						id: oTable.getId() + "-collapseAll",
						controlType: "sap.m.Button",
						actions: new Press(),
						success: function() {
							Opa5.assert.ok(true, "Pressed Collapse All Rows button");
						},
						errorMessage: "Could not press Collapse Button"
					});
				}
			});
		},

		/**
		 * Emulates a press action on the element in a row that expands the row.
		 *
		 * @param {string | sap.ui.mdc.Table} vTable Id or instance of the table
		 * @param {object} mConfig Used to find the row to expand
		 * @param {int} mConfig.index Index of the row in the aggregation of the inner table
		 * @param {object} mConfig.data Information about the data, where the key is the path in the rows binding context
		 * @returns {Promise} OPA waitFor
		 * @private
		 */
		iPressExpandRowButton: function(vTable, mConfig) {
			return Util.waitForRow.call(this, vTable, {
				index: mConfig.index,
				data: mConfig.data,
				success: function(oTable, oRow) {
					if (oTable._isOfType(TableType.Table, true)) {
						if (oRow.isExpanded()) {
							throw new Error("The row is already expanded");
						}
						const sIdSuffix = oTable._isOfType(TableType.Table) ? "groupHeader" : "treeicon";
						new Press({idSuffix: sIdSuffix}).executeOn(oRow);
						Opa5.assert.ok(true, "Pressed Expand Row button for " + JSON.stringify(mConfig));
					} else {
						throw new Error("The current table type does not support expanding rows");
					}
				}
			});
		},

		/**
		 * Emulates a press action on the element in a row that collapses the row.
		 *
		 * @param {string | sap.ui.mdc.Table} vTable Id or instance of the table
		 * @param {object} mConfig Used to find the row to expand
		 * @param {int} mConfig.index Index of the row in the aggregation of the inner table
		 * @param {object} mConfig.data Information about the data, where the key is the path in the rows binding context
		 * @returns {Promise} OPA waitFor
		 * @private
		 */
		iPressCollapseRowButton: function(vTable, mConfig) {
			return Util.waitForRow.call(this, vTable, {
				index: mConfig.index,
				data: mConfig.data,
				success: function(oTable, oRow) {
					if (oTable._isOfType(TableType.Table, true)) {
						if (!oRow.isExpanded()) {
							throw new Error("The row is already collapsed");
						}
						const sIdSuffix = oTable._isOfType(TableType.Table) ? "groupHeader" : "treeicon";
						new Press({idSuffix: sIdSuffix}).executeOn(oRow);
						Opa5.assert.ok(true, "Pressed Collapse Row button for " + JSON.stringify(mConfig));
					} else {
						throw new Error("The current table type does not support collapsing rows");
					}
				}
			});
		},

		/**
		 * Emulates a drag action on a column to move it.
		 *
		 * @function
		 * @name iDragColumn
		 * @param {String|sap.ui.mdc.Table} vControl Id or control instance of the MDCTable
		 * @param {Number} iColumnIndex Index of Column to drag
		 * @returns {Promise} OPA waitFor
		 * @private
		 */
		iDragColumn: function(vControl, iColumnIndex) {
			return waitForTable.call(this, vControl, {
				success: function(oTable) {
					return this.waitFor({
						id: oTable.getColumns()[iColumnIndex].getId() + "-innerColumn",
						controlType: "sap.ui.table.Column",
						actions: new Drag(),
						errorMessage: "Could not drag Column"
					});
				}
			});
		},

		/**
		 * Emulates a drop action on a column to drop it after a defined column.
		 *
		 * @function
		 * @name iDropColumnAfter
		 * @param {String|sap.ui.mdc.Table} vControl Id or control instance of the MDCTable
		 * @param {Number} iColumnIndex Index of Column on which Drop should be executed
		 * @returns {Promise} OPA waitFor
		 * @private
		 */
		iDropColumnAfter: function(vControl, iColumnIndex) {
			return waitForTable.call(this, vControl, {
				success: function(oTable) {
					return this.waitFor({
						id: oTable.getColumns()[iColumnIndex].getId() + "-innerColumn",
						controlType: "sap.ui.table.Column",
						actions: new Drop({after: true}),
						errorMessage: "Could not drop Column"
					});
				}
			});
		},

		/**
		 * Performs a Press action on {@link sap.m.SegmentedButtonItem}
		 * 'showDetails' to display hidden columns in the pop-in area.
		 *
		 * @function
		 * @name iPressShowMoreButton
		 * @param {String|sap.ui.mdc.Table} oControl Id or control instance of the MDCTable
		 * @returns {Promise} OPA waitFor
		 * @private
		 */
		iPressShowMoreButton: TableActions.iExpandTableData,

		/**
		 * Performs a Press action on {@link sap.m.SegmentedButtonItem}
		 * 'hideDetails' to hide hidden columns from the pop-in area.
		 *
		 * @function
		 * @name iPressShowLessButton
		 * @param {String|sap.ui.mdc.Table} oControl Id or control instance of the MDCTable
		 * @returns {Promise} OPA waitFor
		 * @private
		 */
		iPressShowLessButton: TableActions.iCollapseTableData,

		/**
		 * Performs a Press action on {@link sap.m.Button}
		 * 'export-internalSplitBtn-textButton' to start the Excel export.
		 *
		 * @function
		 * @name iPressQuickExportButton
		 * @param {String|sap.ui.mdc.Table} oControl Id or control instance of the MDCTable
		 * @returns {Promise} OPA waitFor
		 * @private
		 */
		iPressQuickExportButton: function(oControl) {
			const sTableId = typeof oControl === "string" ? oControl : oControl.getId();

			return this.waitFor({
				id: sTableId + "-export-internalSplitBtn-textButton",
				controlType: "sap.m.Button",
				actions: new Press(),
				errorMessage: "Did not find the 'Export' button"
			});
		},

		/**
		 * Performs a Press action on {@link sap.m.Button}
		 * 'export-internalSplitBtn-arrowButton' that shows up the
		 * additional {@link sap.ui.unified.Menu} with the items
		 * <ul>
		 *     <li>Export</li>
		 *     <li>Export as...</li>
		 * </ul>.
		 *
		 * @function
		 * @name iPressExportMenuButton
		 * @param {String|sap.ui.mdc.Table} oControl Id or control instance of the MDCTable
		 * @returns {Promise} OPA waitFor
		 * @private
		 */
		iPressExportMenuButton: function(oControl) {
			const sTableId = typeof oControl === "string" ? oControl : oControl.getId();

			return this.waitFor({
				id: sTableId + "-export-internalSplitBtn-arrowButton",
				controlType: "sap.m.Button",
				actions: new Press(),
				errorMessage: "Did not find the 'Export menu' button"
			});
		},

		/**
		 * Performs a Press action on {@link sap.ui.unified.MenuItem} 'Export'
		 * that is shown up from {@link #iPressExportMenuButton}.
		 *
		 * @function
		 * @name iPressExportButtonInMenu
		 * @returns {Promise} OPA waitFor
		 * @private
		 */
		iPressExportButtonInMenu: function() {
			const oResourceBundle = Library.getResourceBundleFor("sap.ui.mdc");

			return this.waitFor({
				controlType: "sap.ui.unified.MenuItem",
				matchers: new PropertyStrictEquals({
					name: "text",
					value: oResourceBundle.getText("table.QUICK_EXPORT")
				}),
				success: function(aMenuItems) {
					new Press().executeOn(aMenuItems[0]);
				},
				errorMessage: "Did not find 'Export' button in menu"
			});
		},

		/**
		 * Performs a Press action on {@link sap.ui.unified.MenuItem} 'Export as...'
		 * that is shown up from {@link #iPressExportMenuButton}.
		 *
		 * @function
		 * @name iPressExportAsButtonInMenu
		 * @returns {Promise} OPA waitFor
		 * @private
		 */
		iPressExportAsButtonInMenu: function() {
			const oResourceBundle = Library.getResourceBundleFor("sap.ui.mdc");

			return this.waitFor({
				controlType: "sap.ui.unified.MenuItem",
				matchers: new PropertyStrictEquals({
					name: "text",
					value: oResourceBundle.getText("table.EXPORT_WITH_SETTINGS")
				}),
				success: function(aMenuItems) {
					new Press().executeOn(aMenuItems[0]);
				},
				errorMessage: "Did not find 'Export as...' menu button"
			});
		},

		/**
		 * Fills in the data in the {@link sap.m.Dialog} 'exportSettingsDialog'
		 * that is shown up from {@link #iPressExportAsButtonInMenu} and triggers the excel export.
		 *
		 * @function
		 * @name iFillInExportSettingsDialog
		 * @param {String|sap.ui.mdc.Table} oControl Id or control instance of the MDCTable
		 * @param {Object} [mSettings] Excel export settings
		 * @param {String} [mSettings.fileName] Optional name for the exported file
		 * @param {String} [mSettings.fileType] Optional type the file should be exported tp XLSX/PDF
		 * @param {Boolean} [mSettings.includeFilterSettings] Optional flag whether to include the filter settings in the exported file
		 * @param {Boolean} [mSettings.splitCells] Optional flag whether to split columns with multiple values
		 * @returns {Promise} OPA waitFor
		 * @private
		 */
		iFillInExportSettingsDialog: TableActions.iExportToExcel,

		/**
		 * Changes the {@link sap.ui.mdc.Table#type} aggregation.
		 *
		 * @param {string | sap.ui.mdc.Table} vTable Id or instance of the table
		 * @param {sap.ui.mdc.enums.TableType} sType The new table type
		 * @param {object} [mTypeSettings] If settings are given, a type instance with these settings is set instead of an enum value
		 * @returns {Promise} OPA waitFor
		 * @private
		 */
		iChangeType: function(vTable, sType, mTypeSettings) {
			return waitForTable.call(this, vTable, {
				success: function(oTable) {
					if (mTypeSettings) {
						this.iWaitForPromise(new Promise((resolve) => {
							Opa5.getWindow().sap.ui.require([`sap/ui/mdc/table/${sType}Type`], function(Type) {
								oTable.setType(new Type(mTypeSettings));
								oTable.initialized().then(resolve);
							});
						}));
					} else {
						oTable.setType(sType);
						this.iWaitForPromise(oTable.initialized());
					}
				},
				errorMessage: "No table found"
			});
		},

		/**
		 * Changes the selection limit.
		 * Succeeds only if {@link sap.ui.mdc.Table#type} is set to <code>Table</code>.
		 *
		 * @param {string | sap.ui.mdc.Table} vTable Id or instance of the table
		 * @param {Number} iLimit The new limit
		 * @returns {Promise} OPA waitFor
		 * @private
		 */
		iChangeSelectionLimit: function(oControl, iLimit) {
			return waitForTable.call(this, oControl, {
				success: function(oTable) {
					return this.waitFor({
						controlType: "sap.ui.mdc.table.GridTableType",
						visible: false,
						matchers: [{
							ancestor: oTable
						}],
						success: function (aGridTableTypes) {
							if (aGridTableTypes.length > 1) {
								throw new Error("Found too many instances of GridTableType");
							}
							aGridTableTypes[0].setSelectionLimit(iLimit);
						},
						errorMessage: "GridTableType not found"
					});
				},
				errorMessage: "No table found"
			});
		},

		/**
		 * Emulates a press action on a column header to open the column menu.
		 *
		 * @function
		 * @name iPressOnColumnHeader
		 * @param {String|sap.ui.mdc.Table} oControl Id or control instance of the MDCTable
		 * @param {String|sap.ui.mdc.table.Column} vColumn Header name or control instance of the column
		 * @returns {Promise} OPA waitFor
		 * @private
		 */
		iPressOnColumnHeader: function(oControl, vColumn) {
			return waitForTable.call(this, oControl, {
				success: function() {
					let oColumnSelectable;
					return this.waitFor({
						controlType: "sap.ui.mdc.table.Column",
						check : function (aColumns) {
							for (let i = 0; i < aColumns.length; i++) {
								if (aColumns[i].getHeader() === vColumn || ( typeof vColumn === 'object' && aColumns[i].getHeader() === vColumn.getHeader())) {
									oColumnSelectable = aColumns[i];
									return true;
								}
							}
							return false;
						},
						success: function () {
							new Press().executeOn(oColumnSelectable);
						},
						errorMessage: "The column " + vColumn + " is not available"
					});
				}
			});
		},

		iCloseTheColumnMenu: function() {
			return Util.waitForColumnMenu.call(this, {
				success: function(oColumnMenu) {
					oColumnMenu.close();
				}
			});
		},

		iUseColumnMenuQuickSort: function(mConfig) {
			return Util.waitForColumnMenu.call(this, {
				success: function(oColumnMenu) {
					this.waitFor({
						controlType: "sap.m.table.columnmenu.QuickSortItem",
						visible: false,
						matchers: [{
							ancestor: oColumnMenu,
							properties: {
								key: mConfig.key
							}
						}],
						success: function(aQuickSortItems) {
							this.waitFor({
								controlType: "sap.m.ToggleButton",
								matchers: [{
									ancestor: aQuickSortItems[0]
								}],
								success: function(aToggleButtons) {
									function pressButton(oButton, bShouldBePressed) {
										if (mConfig.sortOrder === "None" && oButton.getPressed() || bShouldBePressed && !oButton.getPressed()) {
											new Press().executeOn(oButton);
										}
									}

									pressButton(aToggleButtons[0], mConfig.sortOrder === "Ascending");
									pressButton(aToggleButtons[1], mConfig.sortOrder === "Descending");
								},
								errorMessage: "QuickSortItem content is not visible"
							});
						},
						errorMessage: "Column menu QuickSortItem not found"
					});
				}
			});
		},

		iUseColumnMenuQuickGroup: function(mConfig) {
			return Util.waitForColumnMenu.call(this, {
				success: function(oColumnMenu) {
					this.waitFor({
						controlType: "sap.m.table.columnmenu.QuickGroupItem",
						visible: false,
						matchers: [{
							ancestor: oColumnMenu,
							properties: {
								key: mConfig.key
							}
						}],
						success: function(aQuickGroupItems) {
							this.waitFor({
								controlType: "sap.m.ToggleButton",
								matchers: [{
									ancestor: aQuickGroupItems[0].getParent(),
									properties: {
										text: aQuickGroupItems[0].getLabel()
									}
								}],
								success: function(aToggleButtons) {
									if (mConfig.grouped && !aToggleButtons[0].getPressed() || !mConfig.grouped && aToggleButtons[0].getPressed()) {
										new Press().executeOn(aToggleButtons[0]);
									}
								},
								errorMessage: "QuickSortItem content is not visible"
							});
						},
						errorMessage: "Column menu QuickSortItem not found"
					});
				}
			});
		},

		iUseColumnMenuQuickTotal: function(mConfig) {
			return Util.waitForColumnMenu.call(this, {
				success: function(oColumnMenu) {
					this.waitFor({
						controlType: "sap.m.table.columnmenu.QuickTotalItem",
						visible: false,
						matchers: [{
							ancestor: oColumnMenu,
							properties: {
								key: mConfig.key
							}
						}],
						success: function(aQuickTotalItems) {
							this.waitFor({
								controlType: "sap.m.ToggleButton",
								matchers: [{
									ancestor: aQuickTotalItems[0].getParent(),
									properties: {
										text: aQuickTotalItems[0].getLabel()
									}
								}],
								success: function(aToggleButtons) {
									if (mConfig.totaled && !aToggleButtons[0].getPressed() || !mConfig.totaled && aToggleButtons[0].getPressed()) {
										new Press().executeOn(aToggleButtons[0]);
									}
								},
								errorMessage: "QuickTotalItem content is not visible"
							});
						},
						errorMessage: "Column menu QuickTotalItem not found"
					});
				}
			});
		},

		iPressOnColumnMenuItem: function(sLabel) {
			return Util.waitForColumnMenu.call(this, {
				success: function(oColumnMenu) {
					this.waitFor({
						controlType: "sap.m.StandardListItem",
						matchers: [{
							ancestor: oColumnMenu,
							properties: {
								title: sLabel
							}
						}],
						actions: new Press(),
						errorMessage: "Column menu item '" + sLabel + "' not found"
					});
				}
			});
		},

		iNavigateBackFromColumnMenuItemContent: function() {
			return Util.waitForColumnMenu.call(this, {
				success: function(oColumnMenu) {
					this.waitFor({
						controlType: "sap.m.Button",
						matchers: [{
							ancestor: oColumnMenu,
							properties: {
								type: "Back"
							}
						}],
						actions: new Press(),
						errorMessage: "Could not navigate back from column menu item content"
					});
				}
			});
		},

		iPressResetInColumnMenuItemContent: function() {
			return Util.waitForColumnMenu.call(this, {
				success: function(oColumnMenu) {
					this.waitFor({
						controlType: "sap.m.Button",
						matchers: [{
							ancestor: oColumnMenu,
							properties: {
								text: Util.getTextFromResourceBundle("sap.m", "table.COLUMNMENU_RESET")
							}
						}],
						actions: new Press(),
						errorMessage: "Colum menu item content could not be reset"
					});
				}
			});
		},

		/**
		 * Chooses the specified column in the combobox of the sort menu inside the column menu.
		 *
		 * @function
		 * @name iSortByColumnInColumnMenuItemContent
		 * @param {String} sColumn Header title of a column
		 * @returns {Promise} OPA waitFor
		 * @private
		 */
		iSortByColumnInColumnMenuItemContent: function(sColumn) {
			return Util.waitForColumnMenu.call(this, {
				success: function(oColumnMenu) {
					this.waitFor({
						controlType: "sap.m.ComboBox",
						matchers: [{
							ancestor: oColumnMenu
						}],
						success: function(aComboBox) {
							new Press().executeOn(aComboBox[0]);

							this.waitFor({
								controlType: "sap.m.StandardListItem",
								matchers: [{
									ancestor: oColumnMenu,
									properties: {
										title: sColumn
									}
								}],
								actions: new Press(),
								errorMessage: "Specified column was not found"
							});
						},
						errorMessage: "Colum menu item content could not be confirmed"
					});
				}
			});
		},

		iPressConfirmInColumnMenuItemContent: function() {
			return Util.waitForColumnMenu.call(this, {
				success: function(oColumnMenu) {
					this.waitFor({
						controlType: "sap.m.Button",
						matchers: [{
							ancestor: oColumnMenu,
							properties: {
								text: Util.getTextFromResourceBundle("sap.m", "table.COLUMNMENU_CONFIRM")
							}
						}],
						actions: new Press(),
						errorMessage: "Colum menu item content could not be confirmed"
					});
				}
			});
		},

		iPressCancelInColumnMenuItemContent: function() {
			return Util.waitForColumnMenu.call(this, {
				success: function(oColumnMenu) {
					this.waitFor({
						controlType: "sap.m.Button",
						matchers: [{
							ancestor: oColumnMenu,
							properties: {
								text: Util.getTextFromResourceBundle("sap.m", "table.COLUMNMENU_CANCEL")
							}
						}],
						actions: new Press(),
						errorMessage: "Colum menu item content could not be canceled"
					});
				}
			});
		},

		/**
		 * Presses the filter info bar on a given control.
		 *
		 * @param {string|sap.ui.core.Control} oControl control instance or control ID
		 * @returns {Promise} OPA waitFor
		 */
		iPressFilterInfoBar: function(vControl) {
			const sTableId = typeof vControl === "string" ? vControl : vControl.getId();
			return this.waitFor({
				id: sTableId + "-filterInfoBar",
				controlType: "sap.m.OverflowToolbar",
				actions: new Press(),
				errorMessage: "Filter Info Bar could not be found"
			});
		},

		iRemoveAllFiltersViaInfoFilterBar: function(oControl) {
			const sTableId = typeof oControl === "string" ? oControl : oControl.getId();

			return this.waitFor({
				id: sTableId + "-filterInfoBar",
				controlType: "sap.m.OverflowToolbar",
				success: function(oFilterBar) {
					this.waitFor({
						controlType: "sap.m.Button",
						matchers: [
							new PropertyStrictEquals({
								name: "icon",
								value: "sap-icon://decline"
							}
						)],
						actions: new Press(),
						errorMessage: "Could not find 'Remove All Filters' Button in info toolbar"
					});
				},
				errorMessage: "No visible filter bar was found"
			});
		},

		/**
		 * Press the confirm button on column menu.
		 *
		 * @returns {Promise} OPA waitFor
		 */
		iConfirmColumnMenuItemContent: function() {
			return this.waitFor({
				controlType: "sap.m.table.columnmenu.Menu",
				success: function(oColumnMenu) {
					this.waitFor({
						controlType: "sap.m.Button",
						matchers: [{
							ancestor: oColumnMenu,
							properties: {
								text: Util.getTextFromResourceBundle("sap.m", "table.COLUMNMENU_CONFIRM")
							}
						}],
						actions: new Press(),
						errorMessage: "Colum menu item content could not be confirmed"
					});
				}
			});
		},

		/**
		 * Opens the P13nDialog.
		 *
		 * @returns {Promise} OPA waitFor
		 */
		iOpenP13nDialog: function () {
			return this.waitFor({
				controlType: "sap.m.Button",
				matchers: new PropertyStrictEquals({
					name: "icon",
					value: Util.P13nDialogInfo.Settings.Icon
				}),
				actions: new Press()
			});
		}
	};
});