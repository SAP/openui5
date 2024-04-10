/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"sap/ui/test/matchers/Ancestor",
	"sap/ui/test/matchers/Descendant",
	"sap/ui/test/matchers/Sibling",
	"sap/ui/test/actions/Press",
	"sap/ui/test/actions/EnterText",
	"test-resources/sap/ui/mdc/testutils/opa/actions/TriggerEvent",
	"sap/ui/core/Lib",
	"test-resources/sap/ui/mdc/testutils/opa/table/waitForTable",
	"test-resources/sap/ui/mdc/testutils/opa/p13n/waitForP13nDialog",
	"sap/ui/events/KeyCodes"
], function(Opa5, PropertyStrictEquals, Ancestor, Descendant, Sibling, Press, EnterText, TriggerEvent, Library, waitForTable, waitForP13nDialog, KeyCodes) {
	"use strict";


	const oMDCBundle = Library.getResourceBundleFor("sap.ui.mdc");

	function waitForOpenShowValues(oSettings) {
		const fnCallSuccess = function() {
            if (typeof oSettings.success === "function") {
                oSettings.success.call(this);
            }
        };

		return this.waitFor({
			controlType: "sap.m.Dialog",
			matchers: {
				ancestor: {
					controlType: "sap.ui.mdc.FilterBar",
					visible: false
				}
			},
			success:function(aAdaptFiltersPanel) {
				Opa5.assert.equal(aAdaptFiltersPanel.length, 1, "Adapt Filters Panel found");
				const sAdaptFiltersResourceBundleButtonText = oMDCBundle.getText("filterbar.ADAPT_HIDE_VALUE");
				return this.waitFor({
					controlType: "sap.m.Button",
					properties: {
						text: sAdaptFiltersResourceBundleButtonText
					},
					matchers: new Ancestor(aAdaptFiltersPanel[0]),
					success : function(aBtn) {
						Opa5.assert.equal(aBtn.length, 1, "Found an active 'Show Values' mode");
						fnCallSuccess.call(this);
					}
				});
			}
		});
	}

	return Opa5.createPageObjects({
		onTheApp: {
			actions: {
				iChangeTheSliderValueInTheField: function(iValue, bIsFilterField, bInShowValues) {
					function fnChangeSliderValue() {
						return this.waitFor({
							searchOpenDialogs: !!bInShowValues,
							controlType: "sap.m.Slider",
							success: function(aControl){
								const oSlider = aControl[0];
								this.waitFor({
									controlType: bIsFilterField ? "sap.ui.mdc.FilterField" : "sap.ui.mdc.Field",
									matchers: new Descendant(oSlider),
									actions: function() {
										oSlider.setValue(iValue);
									}
								});
							},
							errorMessage: "The action could not be performed."
						});
					}

					if (bInShowValues) {
						return waitForOpenShowValues.call(this, {
							success: function () {
								fnChangeSliderValue.call(this);
							}
						});
					}

					return fnChangeSliderValue.call(this);
				},
				iChangeTheSegementedButtonValueInTheFilterField: function(sValue, bInShowValues) {
					function fnChangeSegmentedButtonValue() {
						return this.waitFor({
							searchOpenDialogs: !!bInShowValues,
							controlType: "sap.m.SegmentedButton",
							success: function(aControl){
								const oSegmentedButton = bInShowValues && aControl.length > 1 ? aControl[1] : aControl[0];
								this.waitFor({
									controlType: "sap.ui.mdc.FilterField",
									matchers: new Descendant(oSegmentedButton),
									success: function() {
										this.waitFor({
											controlType: "sap.m.Button",
											matchers: [
												new Ancestor(oSegmentedButton),
												new PropertyStrictEquals({
													name: "text",
													value: sValue
												})
											],
											actions: new Press()
										});
									}
								});
							},
							errorMessage: "The action could not be performed."
						});
					}

					if (bInShowValues) {
						return waitForOpenShowValues.call(this, {
							success: function () {
								fnChangeSegmentedButtonValue.call(this);
							}
						});
					}

					return fnChangeSegmentedButtonValue.call(this);
				},
				iEnterTextOnTheMultiInputFilterField: function(sValue, bInShowValues) {
					function fnChangeMultiInputValue() {
						return this.waitFor({
							searchOpenDialogs: !!bInShowValues,
							controlType: "sap.m.MultiInput",
							success: function(aControl){
								const oMultiInput = aControl[0];
								this.waitFor({
									controlType: "sap.ui.mdc.FilterField",
									matchers: new Descendant(oMultiInput),
									actions: new EnterText({ text: sValue })
								});
							},
							errorMessage: "The action could not be performed."
						});
					}

					if (bInShowValues) {
						return waitForOpenShowValues.call(this, {
							success: function () {
								fnChangeMultiInputValue.call(this);
							}
						});
					}

					return fnChangeMultiInputValue.call(this);

				},
				iPressKeyOnTheMultiInputFilterField: function(oKeyCode, bInShowValues) {
					function fnPressKeyOnMultiInput() {
						return this.waitFor({
							searchOpenDialogs: !!bInShowValues,
							controlType: "sap.m.MultiInput",
							success: function(aControl){
								const oMultiInput = aControl[0];
								this.waitFor({
									controlType: "sap.ui.mdc.FilterField",
									matchers: new Descendant(oMultiInput),
									actions: () => {
										oMultiInput.focus();
										new TriggerEvent({event: "keydown", payload: {which: oKeyCode, keyCode: oKeyCode}}).executeOn(oMultiInput); // doesnt work with focusdomref
										Opa5.assert.ok(oMultiInput, "Key '" + oKeyCode + "' pressed on MultiInput '" + oMultiInput.getId() + "'");
									}
								});
							},
							errorMessage: "The action could not be performed."
						});
					}

					if (bInShowValues) {
						return waitForOpenShowValues.call(this, {
							success: function () {
								fnPressKeyOnMultiInput.call(this);
							}
						});
					}

					return fnPressKeyOnMultiInput.call(this);
				},
				iChangeTheCheckBoxValueInTheField: function(bValue) {
					return this.waitFor({
						searchOpenDialogs: false,
						controlType: "sap.m.CheckBox",
						success: function(aControl){
							const oCheckBox = aControl[0];
							this.waitFor({
								controlType:  "sap.ui.mdc.Field",
								matchers: new Descendant(oCheckBox),
								actions: function() {
									oCheckBox.setSelected(bValue);
								}
							});
						},
						errorMessage: "The action could not be performed."
					});
				},
				iChangeTheMaskInputValueInTheField: function(sValue) {
					return this.waitFor({
						searchOpenDialogs: false,
						controlType: "sap.m.MaskInput",
						success: function(aControl){
							const oMaskInput = aControl[0];
							this.waitFor({
								controlType:  "sap.ui.mdc.Field",
								matchers: new Descendant(oMaskInput),
								actions: function() {
									oMaskInput.setValue(sValue);
								}
							});
						},
						errorMessage: "The action could not be performed."
					});
				},
				/**
				 * Retrieves the table instance by ID and forwards it to the provided callback function
				 *
				 * @function
				 * @name iGetTheTableInstance
				 * @param {String} sTableId Id of the table
				 * @param {function(): sap.ui.mdc.Table} fnCallback Callback function with table instance
				 * @returns {Promise} OPA waitFor
				 * @private
				 */
				iGetTheTableInstance: function (sTableId, fnCallback) {
					return waitForTable.call(this, sTableId, {
						success: function(oTable) {
							fnCallback(oTable);
						}
					});
				},
				iPressTheSettingsButtonOnTheTable: function (sTableId) {
					return waitForTable.call(this, sTableId, {
						success: function(oTable) {
							return this.waitFor({
								controlType: "sap.m.OverflowToolbarButton",
								matchers: new Ancestor(oTable),
								actions: new Press(),
								errorMessage: "Did not find the settings button on the table"
							});
						}
					});
				},
				iCloseTheP13nDialogWithOk: function() {
					const sOkButton = oMDCBundle.getText("p13nDialog.OK");
					return waitForP13nDialog.call(this, {
						success: function(oP13nDialog) {
							return this.waitFor({
								controlType: "sap.m.Button",
								matchers: [
									new Ancestor(oP13nDialog),
									new PropertyStrictEquals({
										name: "text",
										value: sOkButton
									})
								],
								actions: new Press()
								// success: function(aButtons) {
								// 	Opa5.assert.ok(aButtons.length == 1, "Exactly one ok button was found");
								// }
							});
						}
					});
				},
				iToggleColumnWithLabel: function(sLabel) {
					return waitForP13nDialog.call(this, {
						success: function(oP13nDialog) {
							return this.waitFor({
								controlType: "sap.m.Label",
								searchOpenDialogs: true,
								matchers: new PropertyStrictEquals({
									name: "text",
									value: sLabel
								}),
								success: function(aLabels) {
									Opa5.assert.ok(aLabels.length == 1, "Exactly one 'OK' button was found");
									return this.waitFor({
										controlType: "sap.m.ColumnListItem",
										searchOpenDialogs: true,
										matchers: [
											new Descendant(aLabels[0])
										],
										success: function(aColumnListItem) {
											Opa5.assert.ok(aColumnListItem.length == 1, "Exactly one ColumnListItem was found");
											return this.waitFor({
												controlType: "sap.m.CheckBox",
												searchOpenDialogs: true,
												matchers: [
													new Ancestor(aColumnListItem[0])
												],
												success: function(aCheckBox) {
													Opa5.assert.ok(aCheckBox.length == 1, "Exactly one CheckBox was found");
												},
												actions: new Press()
											});
										}
									});
								}
							});
						}
					});
				},
				/**
				 * Presses "Show Filters" button on ValueHelp dialog
				 * @param {string} sValueHelpId ID of <code>sap.ui.mdc.ValueHelp</code> control
				 * @param {string} sKey Key of mdc messagebundle for the text of the button
				 * @returns {Promise} OPA waitFor
				 */
				iPressButtonOnValueHelpDialogWithText: function(sValueHelpId, sKey) {
					const sButtonText = oMDCBundle.getText(sKey);
					return this.waitFor({
						id: sValueHelpId,
						controlType: "sap.ui.mdc.ValueHelp",
						success: function (oValueHelp) {
							Opa5.assert.ok(oValueHelp, "ValueHelp found");
							return this.waitFor({
								controlType: "sap.ui.mdc.valuehelp.Dialog",
								matchers: new Ancestor(oValueHelp),
								success: function (aValueHelpDialog) {
									Opa5.assert.ok(aValueHelpDialog.length, "Dialog on ValueHelp found");
									return this.waitFor({
										controlType: "sap.m.Button",
										matchers: [
											new Ancestor(aValueHelpDialog[0]),
											new PropertyStrictEquals({
												name: "text",
												value: sButtonText
											})
										],
										success: function (aButton) {
											Opa5.assert.ok(aButton.length, `Button with text ${sButtonText} on Dialog found`);
										},
										actions: new Press(),
										errorMessage: `No Button with text ${sButtonText} on Dialog was found`
									});
								},
								errorMessage: `No Dialog on ValueHelp was found`
							});
						},
						errorMessage: `No ValueHelp with ID "${sValueHelpId}" was found`
					});
				},
				/**
				 * Presses "Show Filters" button on ValueHelp dialog
				 * @param {string} sFilterBarId ID of <code>sap.ui.mdc.FilterBar</code> control
				 * @returns {Promise} OPA waitFor
				 */
				iPressGoButtonOnFilterBar: function(sFilterBarId) {
					const sButtonText = oMDCBundle.getText("filterbar.GO");
					return this.waitFor({
						id: sFilterBarId,
						controlType: "sap.ui.mdc.FilterBar",
						success: function (oFilterBar) {
							Opa5.assert.ok(oFilterBar, "FilterBar found");
							return this.waitFor({
								controlType: "sap.m.Button",
								matchers: [
									new Ancestor(oFilterBar),
									new PropertyStrictEquals({
										name: "text",
										value: sButtonText
									})
								],
								success: function (aButton) {
									Opa5.assert.ok(aButton.length, `Button with text ${sButtonText} on FilterBar found`);
								},
								actions: new Press(),
								errorMessage: `No Button with text ${sButtonText} on FilterBar was found`
							});
						},
						errorMessage: `No FilterBar with ID "${sFilterBarId}" was found`
					});
				},
				/**
				 * Enters text on a FilterField
				 * @param {string} sFilterFieldId ID of <code>sap.ui.mdc.FilterField</code> control
				 * @param {string} sValue Value that should be entered into <code>sap.ui.mdc.FilterField</code> control
				 * @returns {Promise} OPA waitFor
				 */
				iEnterTextOnFilterField: function(sFilterFieldId, sValue) {
					return this.waitFor({
						id: sFilterFieldId,
						controlType: "sap.ui.mdc.FilterField",
						success: function (oFilterField) {
							Opa5.assert.ok(oFilterField, `FilterField was found`);
						},
						actions: new EnterText({ text: sValue }),
						errorMessage: `No FilterField control was found`
					});
				},
				/**
				 * Enters text on a FilterField
				 * @param {string} sFilterFieldId ID of <code>sap.ui.mdc.FilterField</code> control
				 * @param {string} sValue Value that should be entered into <code>sap.ui.mdc.FilterField</code> control
				 * @returns {Promise} OPA waitFor
				 */
				iPressEnter: function(sFilterFieldId, sValue) {
					return this.waitFor({
						id: sFilterFieldId,
						controlType: "sap.ui.mdc.FilterField",
						success: function (oFilterField) {
							Opa5.assert.ok(oFilterField, `FilterField was found`);
						},
						actions: new TriggerEvent({event: "keydown", payload: {which: KeyCodes.ENTER, keyCode: KeyCodes.ENTER}}),
						errorMessage: `No FilterField control was found`
					});
				},
				/**
				 * Opens the ValueHelp dialog for a Field
				 * @param {string} sFieldId ID of <code>sap.ui.mdc.Field</code> control
				 * @returns {Promise} OPA waitFor
				 */
				iOpenTheValueHelpForField: function (sFieldId) {
					return this.waitFor({
						id: sFieldId,
						controlType: "sap.ui.mdc.Field",
						success: function (oField) {
							Opa5.assert.ok(oField, `Found Field with ID ${sFieldId}`);
							oField.focus();
							new TriggerEvent({event: "keydown", payload: {which: 115, keyCode: 115}}).executeOn(oField.getCurrentContent()[0]); // doesnt work with focusdomref
						},
						errorMessage: `No Field with ID ${sFieldId} was found`
					});
				},
				/**
				 * Closes the ValueHelp dialog
				 * @returns {Promise} OPA waitFor
				 */
				iCloseTheValueHelpDialog: function () {
					const sCancelButtonText = oMDCBundle.getText("valuehelp.CANCEL");

					return this.waitFor({
						controlType: "sap.ui.mdc.valuehelp.Dialog",
						success: function (aValueHelpDialog) {
							Opa5.assert.ok(aValueHelpDialog.length, `Found ValueHelp dialog`);
							const oDialog = aValueHelpDialog[0];
							this.waitFor({
								controlType: "sap.m.Button",
								matchers: [
									new Ancestor(oDialog),
									new PropertyStrictEquals({
										name: "text",
										value: sCancelButtonText
									})
								],
								actions: new Press()
							});
						},
						errorMessage: `No ValueHelp dialog was found`
					});
				},
				/**
				 * Click on a row in Table
				 * @param {string|sap.ui.core.Control} vTable ID of Table or control instance
				 * @param {number} iRowIndex Index of the row to click
				 * @param {boolean} bResponsiveTable Whether the table is a responsive table or a grid table
				 * @returns {Promise} OPA waitFor
				 */
				iClickOnRow(vTable, iRowIndex, bResponsiveTable = true) {

					return waitForTable.call(this, vTable, {
						success(oTable) {
							this.waitFor({
								controlType: bResponsiveTable ? "sap.m.Table" : "sap.ui.table.Table",
								matchers: new Ancestor(oTable),
								success: function(aInnerTable) {
									Opa5.assert.ok(aInnerTable.length, `Found Control sap.m.Table in sap.ui.mdc.Table`);
									let oRow;
									this.waitFor({
										controlType: bResponsiveTable ? "sap.m.ColumnListItem" : "sap.ui.table.Row",
										matchers: new Ancestor(aInnerTable[0]),
										success: function(aRows) {
											oRow = aRows[iRowIndex];
											Opa5.assert.ok(true, `Clicked on row ${iRowIndex}`);
											this.waitFor({
												controlType: "sap.m.Text",
												matchers: new Ancestor(oRow),
												actions: new Press()
											});
										}
									});
								}
							});
						}
					});
				}
			},
			assertions: {
				iShouldSeeACodeEditorWithContent: function(sContent, sIdentifier) {
					return this.waitFor({
						controlType: "sap.ui.codeeditor.CodeEditor",
						id: sIdentifier,
						success: function (aControl) {
							const oCodeEditor = Array.isArray(aControl) ? aControl[0] : aControl;
							Opa5.assert.ok(true, "Found the code editor");
							const sValue = oCodeEditor.getValue();
							Opa5.assert.ok(sValue == sContent, "Code editor content is correct");
						},
						errorMessage: "The code editor was not found."
					});
				},
				iShouldSeeAFilterFieldWithCustomControl: function(sControl) {
					return this.waitFor({
						searchOpenDialogs: false,
						controlType: sControl,
						success: function(aControl){
							this.waitFor({
								controlType: "sap.ui.mdc.FilterField",
								matchers: new Descendant(aControl[0]),
								success: function(aFilterFields) {
									Opa5.assert.ok(aFilterFields.length, `Found Control ${sControl} in FilterField`);
								}
							});
						},
						errorMessage: "The slider was not found."
					});
				},
				/**
				 * Checks if a table is visible on the screen.
				 *
				 * @function
				 * @name iShouldSeeATable
				 * @param {String | sap.ui.mdc.Table} vTable Id or instance of the table
				 * @returns {Promise} OPA waitFor
				 * @private
				 */
				iShouldSeeATable: function(vTable) {
					return waitForTable.call(this, vTable, {
						success: function(oTable) {
							Opa5.assert.ok(oTable, "I see the table");
						}
					});
				},
				iShouldSeeAP13nDialog() {
					return waitForP13nDialog.call(this, {});
				},
				/**
				 * Checks whether the MDC Table has a specific number of rows
				 * @param {string|sap.ui.core.Control} vTable ID of Table or control instance
				 * @param {number} iRowCount Count of rows
				 * @param {boolean} bResponsiveTable Whether the table is a responsive table or a grid table
				 * @returns {Promise} OPA waitFor
				 */
				iShouldSeeRows(vTable, iRowCount, bResponsiveTable = true) {
					const fnFilterEmptyRows = function(aItems) {
						return aItems.filter(function(oItem) {
							return oItem.getCells().some(function(oCell) {
								return oCell.getText();
							});
						});
					};

					return waitForTable.call(this, vTable, {
						success(oTable) {
							this.waitFor({
								controlType: bResponsiveTable ? "sap.m.Table" : "sap.ui.table.Table",
								matchers: new Ancestor(oTable),
								success: function(aInnerTable) {
									Opa5.assert.ok(aInnerTable.length, `Found Control sap.m.Table in sap.ui.mdc.Table`);
									const aRows = bResponsiveTable ? aInnerTable[0].getItems() : aInnerTable[0].getRows();
									const aFilteredRows = fnFilterEmptyRows(aRows);
									Opa5.assert.equal(aFilteredRows.length, iRowCount, "I see correct amount of rows");
								}
							});
						}
					});
				},
				/**
				 * Checks whether the MDC Table has the 'More' button
				 * @param {string} sTableId ID of Table
				 * @returns {Promise} OPA waitFor
				 */
				iShouldSeeTheMoreButton: function(sTableId) {
					return this.waitFor({
						id: sTableId + "-innerTable-trigger",
						controlType: "sap.m.CustomListItem",
						success: function (oItem) {
							Opa5.assert.ok(oItem, "'More' button is visible on the screen");
						},
						errorMessage: "No 'More' button found"
					});
				},
				/**
				 * Checks for an Input control with a specific vlaue
				 * @param {string} sInputId ID of <code>sap.m.Input</code> control
				 * @param {string} sValue Value of <code>sap.m.Input</code> control
				 * @returns {Promise} OPA waitFor
				 */
				iShouldSeeTheInputWithValue: function(sInputId, sValue) {
					return this.waitFor({
						id: sInputId,
						controlType: "sap.m.Input",
						matchers: new PropertyStrictEquals({
							name: "value",
							value: sValue
						}),
						success: function (oItem) {
							Opa5.assert.ok(oItem, `Input control with value "${sValue}" was found`);
						},
						errorMessage: `No Input control with value "${sValue}" was found`
					});
				},
				/**
				 * Checks whether a FilterField is visible
				 * @param {string} sFilterFieldId ID of <code>sap.ui.mdc.FilterField</code> control
				 * @returns {Promise} OPA waitFor
				 */
				iShouldSeeFilterField: function(sFilterFieldId) {
					return this.waitFor({
						id: sFilterFieldId,
						controlType: "sap.ui.mdc.FilterField",
						success: function (oFilterField) {
							Opa5.assert.ok(oFilterField, `FilterField was found`);
						},
						errorMessage: `No FilterField control was found`
					});
				}
			}
		}
	});
});