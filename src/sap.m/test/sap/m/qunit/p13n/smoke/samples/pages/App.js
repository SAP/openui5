/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"sap/ui/test/matchers/Ancestor",
	"sap/ui/test/matchers/Descendant",
	"sap/ui/test/matchers/Sibling",
	"sap/ui/test/matchers/Properties",
	"sap/ui/test/actions/Press",
	"test-resources/sap/ui/mdc/testutils/opa/p13n/Actions",
	"test-resources/sap/ui/mdc/testutils/opa/p13n/Util",
	"test-resources/sap/ui/mdc/testutils/opa/p13n/waitForP13nButtonWithMatchers",
	"test-resources/sap/ui/mdc/testutils/opa/p13n/waitForP13nDialog"
], function (Opa5, PropertyStrictEquals, Ancestor, Descendant, Sibling, Properties, Press, P13nActions, Util, waitForP13nButtonWithMatchers, waitForP13nDialog) {
	"use strict";

	function fnFilterEmptyRows(aItems) {
		return aItems.filter(function (oItem) {
			if (oItem.isA("sap.m.GroupHeaderListItem")) {
				return false;
			}
			return oItem.getCells().some(function (oCell) {
				return oCell.getText();
			});
		});
	}

	function iOpenThePersonalizationDialogOnGridList(oControl, oSettings) {
		const sControlId = typeof oControl === "string" ? oControl : oControl.getId();
		const aDialogMatchers = [];
		const aButtonMatchers = [];
		return this.waitFor({
			id: sControlId,
			success: function(oControlInstance) {
				Opa5.assert.ok(oControlInstance);
				// aButtonMatchers.push(new Ancestor(oControlInstance));
				// aDialogMatchers.push(new Ancestor(oControlInstance, false));

				// Add matcher for p13n button icon
				aButtonMatchers.push(new Properties({
					icon: Util.icons.settings
				}));
				aDialogMatchers.push(new Properties({
					title: Util.texts.fields
				}));

				waitForP13nButtonWithMatchers.call(this, {
					actions: new Press(),
					matchers: aButtonMatchers,
					success: function() {
						waitForP13nDialog.call(this, {
							matchers: aDialogMatchers,
							success:  function(oP13nDialog) {
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

	return Opa5.createPageObjects({
		onTheApp: {
			actions: {
				/**
				 * Presses Button with ID
				 * @param {string} sControl ID of <code>sap.m.Button</code> control
				 * @returns {Promise} OPA waitFor
				 */
				iPressTheButton: function (sControl) {
					return this.waitFor({
						id: sControl,
						controlType: "sap.m.Button",
						success: function (oButton) {
							Opa5.assert.ok(oButton, `Button was found`);
						},
						actions: new Press(),
						errorMessage: `No Button control was found`
					});
				},
				/**
				 * Presses Button with ID
				 * @param {string} sControl ID of <code>sap.m.Button</code> control
				 * @returns {Promise} OPA waitFor
				 */
				iSelectValueInRadioButtonGroup: function (sRadioButtonGroup, iIndex) {
					return this.waitFor({
						id: sRadioButtonGroup,
						controlType: "sap.m.RadioButtonGroup",
						success: function (oRBGroup) {
							Opa5.assert.ok(oRBGroup, `RadioButtonGroup was found`);
							this.waitFor({
								controlType: "sap.m.RadioButton",
								matchers: new Ancestor(oRBGroup),
								success: function (aRadioButton) {
									Opa5.assert.ok(aRadioButton.length, `RadioButtons found`);
									const sText = aRadioButton[iIndex].getText();
									this.waitFor({
										controlType: "sap.m.RadioButton",
										matchers: [new Ancestor(oRBGroup), new PropertyStrictEquals({
											name: "text",
											value: sText
										})],
										success: function (aRB) {
											Opa5.assert.ok(aRB.length === 1, `Found exactly one RadioButton`);
										},
										actions: new Press()
									});
								}
							});
						},
						actions: new Press(),
						errorMessage: `No RadioButtonGroup control was found`
					});
				},
				iPersonalizeFieldsOnGridList: function (sGridList, oSettings) {
					return iOpenThePersonalizationDialogOnGridList.call(this, sGridList, {
						success:  function(oP13nDialog) {
							P13nActions.iPersonalizeListViewItems.call(this, oP13nDialog, oSettings);
						}
					});
				}
			},
			assertions: {
				/**
				 * Checks whether a Download button is visible
				 * @param {string} sTableId ID of <code>sap.m.Table</code> control
				 * @param {string[]} aLabels Labels of columns in order of appearance
				 * @returns {Promise} OPA waitFor
				 */
				iShouldSeeColumnsInOrder: function (sTableId, aLabels, bResponsiveTable = true) {
					return this.waitFor({
						id: sTableId,
						controlType: bResponsiveTable ? "sap.m.Table" : "sap.ui.table.Table",
						success: function (oTable) {
							Opa5.assert.ok(oTable, "Table is visible");
							this.waitFor({
								controlType: bResponsiveTable ? "sap.m.Column" : "sap.ui.table.Column",
								matchers: [new Ancestor(oTable)],
								success: function (aColumnControls) {
									Opa5.assert.ok(aColumnControls.length == aLabels.length, "Number of labels and columns match");
									const aColumnsTexts = bResponsiveTable
										? aColumnControls.map((oCol) => oCol.getHeader().getText())
										: aColumnControls.map((oCol) => oCol.getLabel().getText());
									Opa5.assert.deepEqual(aColumnsTexts, aLabels, "The Table has the correct column headers");
								},
								errorMessage: "Number of columns does not match"
							});
						},
						errorMessage: "No Table found"
					});
				},
				/**
				 * Checks whether a Download button is visible
				 * @param {string} sGridListId ID of <code>sap.m.Table</code> control
				 * @param {string[]} aNames FirstNames of ColumnListItems in order of appearance
				 * @returns {Promise} OPA waitFor
				 */
				iShouldGridItemsInOrder: function (sGridListId, aNames) {
					return this.waitFor({
						id: sGridListId,
						controlType: "sap.f.GridList",
						success: function (oGridList) {
							Opa5.assert.ok(oGridList, "GridList is visible");
							this.waitFor({
								controlType: "sap.m.CustomListItem",
								matchers: [new Ancestor(oGridList)],
								success: function (aColumnControls) {
									Opa5.assert.ok(aColumnControls.length == aNames.length, "Number of ids and items match");
									const aFirsNames = aColumnControls.map((oCol) => oCol.getContent()[0].getItems()[0].getItems()[0].getItems()[1].getText());
									Opa5.assert.deepEqual(aFirsNames, aNames, "The GridList has the correct items");
								},
								errorMessage: "Number of items does not match"
							});
						},
						errorMessage: "No Table found"
					});
				},
				iShouldSeeGroupWithTitle: function (sTitle) {
					return this.waitFor({
						controlType: "sap.m.GroupHeaderListItem",
						matchers: new PropertyStrictEquals({ name: "title", value: sTitle }),
						success: function (oGroupHeader) {
							Opa5.assert.ok(oGroupHeader, "Group header with title: '" + sTitle + "' was found.");
						},
						errorMessage: "Group header with title: '" + sTitle + "' was NOT found."
					});
				},
				/**
				 * Checks whether the MDC Table has a specific number of rows
				 * @param {string} sTableId ID of Table
				 * @param {number} iRowCount Count of rows
				 * @param {boolean} bResponsiveTable Whether the table is a responsive table or a grid table
				 * @returns {Promise} OPA waitFor
				 */
				iShouldSeeRows(sTableId, iRowCount, bResponsiveTable = true) {
					return this.waitFor({
						controlType: bResponsiveTable ? "sap.m.Table" : "sap.ui.table.Table",
						id: sTableId,
						success(oTable) {
							const aRows = bResponsiveTable ? oTable.getItems() : oTable.getRows();
							const aFilteredRows = fnFilterEmptyRows(aRows);
							Opa5.assert.equal(aFilteredRows.length, iRowCount, "I see correct amount of rows");
						}

					});
				},
				iShouldSeeRowsInOrder: function (sTableId, aLabels, bResponsiveTable = true) {
					return this.waitFor({
						id: sTableId,
						controlType: bResponsiveTable ? "sap.m.Table" : "sap.ui.table.Table",
						success: function (oTable) {
							Opa5.assert.ok(oTable, "Table is visible");
							this.waitFor({
								controlType: bResponsiveTable ? "sap.m.ColumnListItem" : "sap.ui.table.Row",
								matchers: [new Ancestor(oTable)],
								success: function (aRowControls) {
									const aFilteredRows = fnFilterEmptyRows(aRowControls);
									Opa5.assert.ok(aFilteredRows.length == aLabels.length, "Number of rows match");
									const aRowTexts = aFilteredRows.map((oRow) => oRow.getCells()[0].getText());
									Opa5.assert.deepEqual(aRowTexts, aLabels, "The Table has the correct row order");
								},
								errorMessage: "Number of rows does not match"
							});
						}
					});
				}
			}
		}
	});
});
