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
	"test-resources/sap/ui/mdc/testutils/opa/p13n/waitForP13nDialog"
], function(Opa5, PropertyStrictEquals, Ancestor, Descendant, Sibling, Press, EnterText, TriggerEvent, Library, waitForTable, waitForP13nDialog) {
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
				iChangeTheSliderValueInTheFilterField: function(iValue, bInShowValues) {
					function fnChangeSliderValue() {
						return this.waitFor({
							searchOpenDialogs: !!bInShowValues,
							controlType: "sap.m.Slider",
							success: function(aControl){
								const oSlider = aControl[0];
								this.waitFor({
									controlType: "sap.ui.mdc.FilterField",
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
						success: function() {
							Opa5.assert.ok(true, "I see the table");
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
				 * @returns {Promise} OPA waitFor
				 */
				iShouldSeeRows(vTable, iRowCount) {
					return waitForTable.call(this, vTable, {
						success(oTable) {
							const aItems = oTable.getAggregation("_content").getItems();
							Opa5.assert.equal(aItems.length, iRowCount, "I see correct amount of context-based adaptations");
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
				}
			}
		}
	});
});