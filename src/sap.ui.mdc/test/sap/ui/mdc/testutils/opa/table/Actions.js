/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/Properties",
	"sap/ui/test/matchers/Ancestor",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"sap/ui/test/actions/Press",
	"../p13n/waitForP13nButtonWithMatchers",
	"../p13n/waitForP13nDialog",
	"../p13n/Util",
	"../Utils",
	"./Util",
	"./waitForTable",
	"./waitForColumnHeader",
	"./waitForP13nButtonWithParentAndIcon",
	"./waitForListItemInDialogWithLabel",
	"sap/ui/mdc/library"
], function(
	Opa5,
	Properties,
	Ancestor,
	PropertyStrictEquals,
	Press,
	waitForP13nButtonWithMatchers,
	waitForP13nDialog,
	P13nUtil,
	TestUtils,
	TableUtil,
	waitForTable,
	waitForColumnHeader,
	waitForP13nButtonWithParentAndIcon,
	waitForListItemInDialogWithLabel,
	MdcLibrary
) {
	"use strict";

	var TableType = MdcLibrary.TableType;

	var clickOnTheReorderButtonOfDialog = function(sDialogTitle) {
		waitForP13nDialog.call(this, {
			dialogTitle: sDialogTitle,
			liveMode: false,
			success: function(oDialog) {
				this.waitFor({
					controlType: "sap.m.Button",
					matchers: [
						new Properties({
							text: TestUtils.getTextFromResourceBundle("sap.ui.mdc", "p13nDialog.REORDER")
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
		/**
		 * Selects all visible rows.
		 *
		 * Succeeds only if the following prerequisites are met:
		 * <ul>
		 *  <li>
		 *   {@link sap.ui.mdc.Table#getMultiSelectMode multiSelectMode} is set to <code>Default</code> when using the
		 *   {@link sap.ui.mdc.table.ResponsiveTableType}.
		 *  </li>
		 *  <li>
		 *   {@link sap.ui.mdc.table.GridTableType#getSelectionLimit selectionLimit} is set to <code>0</code> when using the
		 *   {@link sap.ui.mdc.table.GridTableType}.
		 *  </li>
		 * </ul>
		 *
		 * @function
		 * @name iSelectAllRows
		 * @param {String|sap.ui.mdc.Table} oControl Id or control instance of the MDCTable
		 * @returns {Promise} OPA waitFor
		 * @public
		 */
		iSelectAllRows: function(oControl) {
			return waitForTable.call(this, oControl, {
				success: function(oTable) {
					this.iWaitForPromise(oTable.initialized()).then(function() {
						var oInnerTable = oTable._oTable;

						if (oTable._isOfType(TableType.ResponsiveTable)) {
							new Press({idSuffix: "sa"}).executeOn(oInnerTable);
						} else {
							new Press({idSuffix: "selall"}).executeOn(oInnerTable);
						}
					});
				}.bind(this),
				errorMessage: "No table found"
			});
		},

		/**
		 * Removes all selections.
		 *
		 * @function
		 * @name iClearSelection
		 * @param {String|sap.ui.mdc.Table} oControl Id or control instance of the table
		 * @returns {Promise} OPA waitFor
		 * @public
		 */
		iClearSelection: function(oControl) {
			return waitForTable.call(this, oControl, {
				success: function(oTable) {
					oTable.clearSelection();
				},
				errorMessage: "No table found"
			});
		},

		/**
		 * Selects a visible row.
		 *
		 * @function
		 * @name iSelectRows
		 * @param {String|sap.ui.mdc.Table} oControl Id or control instance of the table
		 * @param {Number} iIndex The 0-based index of visible rows
		 * @returns {Promise} OPA waitFor
		 * @public
		 */
		iSelectRows: function(oControl, iIndex) {
			return waitForTable.call(this, oControl, {
				success: function(oTable) {
					this.iWaitForPromise(oTable.initialized()).then(function() {
						var oInnerTable = oTable._oTable;

						if (oTable._isOfType(TableType.ResponsiveTable)) {
							var oItem = oInnerTable.getItems()[iIndex];
							new Press().executeOn(oItem.getMultiSelectControl() || oItem.getSingleSelectControl());
						} else {
							new Press({idSuffix: "rowsel" + iIndex}).executeOn(oInnerTable);
						}
					});
				}.bind(this),
				errorMessage: "No table found"
			});
		},

		/**
		 * Expand the table data by displaying the hidden columns
		 * in the pop-ins area.
		 *
		 * @function
		 * @name iExpandTableData
		 * @param {String|sap.ui.mdc.Table} oControl Id or control instance of the MDCTable
		 * @returns {Promise} OPA waitFor
		 * @public
		 */
		iExpandTableData: function(oControl) {
			var sTableId = typeof oControl === "string" ? oControl : oControl.getId();

			return this.waitFor({
				id: sTableId + "-showDetails-button",
				controlType: "sap.m.Button",
				actions: new Press(),
				errorMessage: "Did not find SegmentedButtonItem 'Show more'"
			});
		},

		/**
		 * Collapse the table data by hiding the hidden columns
		 * from the pop-ins area.
		 *
		 * @function
		 * @name iCollapseTableData
		 * @param {String|sap.ui.mdc.Table} oControl Id or control instance of the MDCTable
		 * @returns {Promise} OPA waitFor
		 * @public
		 */
		iCollapseTableData: function(oControl) {
			var sTableId = typeof oControl === "string" ? oControl : oControl.getId();

			return this.waitFor({
				id: sTableId + "-hideDetails-button",
				controlType: "sap.m.Button",
				actions: new Press(),
				errorMessage: "Did not find SegmentedButtonItem 'Show less'"
			});
		},

		/**
		 * Starts the excel export.
		 *
		 * @function
		 * @name iExportToExcel
		 * @param {String|sap.ui.mdc.Table} oControl Id or control instance of the MDCTable
		 * @param {Object} [mSettings] Excel export settings
		 * @param {String} [mSettings.fileName] Optional name for the exported file
		 * @param {String} [mSettings.fileType] Optional type the file should be exported tp XLSX/PDF
		 * @param {Boolean} [mSettings.includeFilterSettings] Optional flag whether to include the filter settings in the exported file
		 * @param {Boolean} [mSettings.splitCells] Optional flag whether to split columns with multiple values
		 * @returns {Promise} OPA waitFor
		 * @public
		 */
		iExportToExcel: function(oControl, mSettings) {
			var sTableId = typeof oControl === "string" ? oControl : oControl.getId();

			if (!mSettings) {
				return this.waitFor({
					id: sTableId + "-export-internalSplitBtn-textButton",
					controlType: "sap.m.Button",
					actions: new Press(),
					errorMessage: "Did not find the 'Export' button"
				});
			} else {
				return Promise.all()
				// enter export file name
				.then(this.waitFor({
					id: "exportSettingsDialog-fileName",
					controlType: "sap.m.Input",
					searchOpenDialogs: true,
					success: function(oInput) {
						if (mSettings.fileName !== "") {
							oInput.setValue(mSettings.fileName);
						}
					},
					errorMessage: "Did not find the 'File name' input"
				}))
				// select export file type
				.then(this.waitFor({
					id: "exportSettingsDialog-fileType",
					controlType: "sap.m.Select",
					searchOpenDialogs: true,
					success: function(oSelect) {
						if (mSettings.fileType !== "") {
							oSelect.setSelectedKey(mSettings.fileType);
						}
					},
					errorMessage: "Did not find the 'File type' select"
				}))
				// mark include filter settings
				.then(this.waitFor({
					id: "exportSettingsDialog-includeFilterSettings",
					controlType: "sap.m.CheckBox",
					searchOpenDialogs: true,
					success: function(oCHeckBox) {
						oCHeckBox.setSelected(mSettings.includeFilterSettings);
					},
					errorMessage: "Did not find the 'Include filter settings' checkbox"
				}))
				// mark split cells
				.then( this.waitFor({
					id: "exportSettingsDialog-splitCells",
					controlType: "sap.m.CheckBox",
					searchOpenDialogs: true,
					success: function(oCheckBox) {
						oCheckBox.setSelected(mSettings.splitCells);
					},
					errorMessage: "Did not find the 'Split cells with multiple values' checkbox"
				}))
				// start export
				.then(this.waitFor({
					id: "exportSettingsDialog-exportButton",
					controlType: "sap.m.Button",
					searchOpenDialogs: true,
					actions: new Press(),
					errorMessage: "Did not find the 'Export' button"
				}));
			}
		},

		// Sort dialog actions
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
		iClickOnAColumnHeaderMenuButtonWithText: function(sColumn, sText) {
			return waitForTable.call(this, {
				success: function(oTable) {
					waitForColumnHeader.call(this, {
						table: oTable,
						columnName: sColumn,
						success: function() {
							this.waitFor({
								searchOpenDialogs: true,
								controlType: "sap.m.Button",
								matchers: [
									new PropertyStrictEquals({
										name: "text",
										value: sText
									})
								],
								actions: new Press(),
								errorMessage: "The column header menu button " + sText + " is not available"
							});
						}
					});
				}
			});
		},
		iOpenThePersonalizationDialog: function(oControl, oSettings) {
			var sControlId = typeof oControl === "string" ? oControl : oControl.getId();
			var aDialogMatchers = [];
			var aButtonMatchers = [];
			return this.waitFor({
				id: sControlId,
				success: function(oControlInstance) {
					Opa5.assert.ok(oControlInstance);

					aButtonMatchers.push(new Ancestor(oControlInstance));
					aDialogMatchers.push(new Ancestor(oControlInstance, false));

					// Add matcher for p13n button icon
					aButtonMatchers.push(new Properties({
						icon: P13nUtil.icons.settings
					}));
					aDialogMatchers.push(new Properties({
						title: TestUtils.getTextFromResourceBundle("sap.ui.mdc", "p13nDialog.VIEW_SETTINGS")
					}));

					waitForP13nButtonWithMatchers.call(this, {
						actions: new Press(),
						matchers: aButtonMatchers,
						success: function() {
							waitForP13nDialog.call(this, {
								matchers: aDialogMatchers,
								success: function(oP13nDialog) {
									if (oSettings && typeof oSettings.success === "function") {
										oSettings.success.call(this, oP13nDialog);
									}
								}
							});
						},
						errorMessage: "Control '" + sControlId + "' has no P13n button"
					});
				},
				errorMessage: "Control '" + sControlId + "' not found."
			});
		}

	};

});