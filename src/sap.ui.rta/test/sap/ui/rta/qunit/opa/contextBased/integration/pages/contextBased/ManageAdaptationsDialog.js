sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"sap/ui/test/actions/Drag",
	"sap/ui/test/actions/Drop",
	"sap/ui/test/matchers/Ancestor",
	"sap/ui/test/actions/EnterText"
], function(
	Opa5,
	Press,
	Drag,
	Drop,
	Ancestor,
	EnterText
) {
	"use strict";
	Opa5.createPageObjects({
		onTheManageAdaptationsDialogPage: {
			actions: {
				iSelectAdaptation(sAdaptationTitle) {
					return this.waitFor({
						controlType: "sap.m.Text",
						properties: {
							text: sAdaptationTitle
						},
						searchOpenDialogs: true,
						actions: new Press()
					});
				},
				iMoveAdaptationViaUpButton() {
					return this.waitFor({
						controlType: "sap.m.Button",
						properties: {
							icon: "sap-icon://navigation-up-arrow"
						},
						searchOpenDialogs: true,
						actions: new Press()
					});
				},
				iMoveAdaptationViaDownButton() {
					return this.waitFor({
						controlType: "sap.m.Button",
						properties: {
							icon: "sap-icon://navigation-down-arrow"
						},
						searchOpenDialogs: true,
						actions: new Press()
					});
				},
				iDragAndDropAdaptation(sDragAdaptationTitle, sDropAdaptationTitle, oDropOption) {
					this.waitFor({
						controlType: "sap.m.ColumnListItem",
						searchOpenDialogs: true,
						descendant: {
							controlType: "sap.m.Text",
							properties: {
								text: sDragAdaptationTitle
							}
						},
						actions: new Drag()
					});

					this.waitFor({
						controlType: "sap.m.ColumnListItem",
						viewId: "sap.ui.rta.contextBased---ManageContexts",
						searchOpenDialogs: true,
						descendant: {
							controlType: "sap.m.Text",
							properties: {
								text: sDropAdaptationTitle
							}
						},
						actions: new Drop(oDropOption)
					});
				},
				iClickOnActionMenuOfAdaptationWithPriority(iPriority) {
					return this.waitFor({
						controlType: "sap.m.MenuButton",
						i18NText: {
							propertyName: "text",
							key: "CLM_HEADER_ADAPTATIONS_ACTIONS"
						},
						searchOpenDialogs: true,
						ancestor: {
							controlType: "sap.m.ColumnListItem",
							bindingPath: {
								modelName: "contextBased",
								path: `/adaptations/${parseInt(iPriority - 1)}`
							},
							ancestor: {
								controlType: "sap.m.Table",
								bindingPath: {
									path: "",
									propertyPath: "/adaptations",
									modelName: "contextBased"
								},
								searchOpenDialogs: true
							}
						},
						actions: new Press()
					});
				},
				iClickOnEditActionButton() {
					return this.waitFor({
						controlType: "sap.ui.unified.MenuItem",
						viewId: "sap.ui.rta.contextBased---ManageContexts",
						properties: {
							icon: "sap-icon://edit"
						},
						searchOpenDialogs: true,
						actions: new Press()
					});
				},
				iClickOnSaveActionButton() {
					return this.waitFor({
						controlType: "sap.ui.unified.MenuItem",
						viewId: "sap.ui.rta.contextBased---ManageContexts",
						properties: {
							icon: "sap-icon://save"
						},
						searchOpenDialogs: true,
						actions: new Press()
					});
				},
				iClickOnDeleteActionButton() {
					return this.waitFor({
						controlType: "sap.ui.unified.MenuItem",
						viewId: "sap.ui.rta.contextBased---ManageContexts",
						properties: {
							icon: "sap-icon://delete"
						},
						searchOpenDialogs: true,
						actions: new Press()
					});
				},
				iClickOnNewContextButton() {
					return this.waitFor({
						id: "sap.ui.rta.contextBased---ManageContexts--manageContexts-newContextButton",
						searchOpenDialogs: true,
						actions: new Press({
							idSuffix: "BDI-content"
						})
					});
				},
				iClickOnCloseButton() {
					return this.waitFor({
						controlType: "sap.m.Button",
						i18NText: {
							propertyName: "text",
							key: "SAVE_AS_APP_VARIANT_DIALOG_CANCEL"
						},
						searchOpenDialogs: true,
						actions: new Press({
							idSuffix: "BDI-content"
						})
					});
				},
				iClickOnSaveButton() {
					return this.waitFor({
						controlType: "sap.m.Button",
						i18NText: {
							propertyName: "text",
							key: "APP_CTX_DIALOG_SAVE"
						},
						enabled: false,
						searchOpenDialogs: true,
						actions: new Press({
							idSuffix: "BDI-content"
						})
					});
				},
				iSearchFor(sSearchString) {
					return this.waitFor({
						controlType: "sap.m.SearchField",
						searchOpenDialogs: true,
						actions: new EnterText({
							text: sSearchString
						}),
						success(vControls) {
							var oControl = vControls[0] || vControls;
							Opa5.assert.equal(oControl.getValue(), sSearchString);
						},
						errorMessage: "SearchField was not found"
					});
				},
				iClearTheSearchField() {
					return this.waitFor({
						controlType: "sap.m.SearchField",
						searchOpenDialogs: true,
						actions: new EnterText({
							text: ""
						}),
						success(vControls) {
							var oControl = vControls[0] || vControls;
							Opa5.assert.equal(oControl.getValue(), "", "SearchField is cleared");
						},
						errorMessage: "SearchField is not cleared"
					});
				}
			},
			assertions: {
				iShouldSeeManageContextBasedAdaptationDialogIsOpend() {
					return this.waitFor({
						controlType: "sap.m.Dialog",
						i18NText: {
							propertyName: "title",
							key: "MANAGE_ADAPTATIONS_DIALOG_HEADER"
						},
						searchOpenDialogs: true,
						success(vControls) {
							var oControl = vControls[0] || vControls;
							Opa5.assert.ok(oControl.getVisible(), "I see manage adaptations dialog is opened");
						}
					});
				},
				iShouldSeeRows(iRowCount) {
					return this.waitFor({
						controlType: "sap.m.Table",
						bindingPath: {
							path: "",
							propertyPath: "/adaptations",
							modelName: "contextBased"
						},
						searchOpenDialogs: true,
						success(aTables) {
							var aItems = aTables[0].getItems();
							Opa5.assert.equal(aItems.length, iRowCount, "I see correct amount of context-based adaptations");
						}
					});
				},
				iShouldSeeAdaptationAtPosition(iPosition, sExpectedTitle, iRoleCount) {
					return this.waitFor({
						controlType: "sap.m.Table",
						bindingPath: {
							path: "",
							propertyPath: "/adaptations",
							modelName: "contextBased"
						},
						searchOpenDialogs: true,
						success(aTables) {
							var aItems = aTables[0].getItems();
							var aCells = aItems[iPosition].getCells();
							var sRank = aCells[0].getText();
							var sTitle = aCells[1].getText();
							Opa5.assert.equal(sRank, iPosition + 1, "I see correct context-based adaptation rank");
							Opa5.assert.equal(sTitle, sExpectedTitle, "I see correct context-based adaptation title");
							if (iRoleCount) {
								var sRoleAndCountryDescription = aCells[2].getText();
								var sExpectedSubstring = iRoleCount === 1 ? `${iRoleCount} Role` : `${iRoleCount} Roles`;
								Opa5.assert.equal(true, sRoleAndCountryDescription.includes(sExpectedSubstring), "I see correct assigned role count");
							}
						}
					});
				},
				iShouldSeeSaveButtonEnabled(bIsEnabled) {
					return this.waitFor({
						controlType: "sap.m.Button",
						i18NText: {
							propertyName: "text",
							key: "APP_CTX_DIALOG_SAVE"
						},
						enabled: false,
						searchOpenDialogs: true,
						success(vControl) {
							var oControl = vControl[0] || vControl;
							Opa5.assert.strictEqual(oControl.getProperty("enabled"), bIsEnabled, `I see save button with enabled status: ${bIsEnabled}`);
							if (bIsEnabled) {
								Opa5.assert.strictEqual(oControl.getAggregation("tooltip"), null, "I see the save button with no tooltip");
							} else {
								Opa5.assert.strictEqual(oControl.getAggregation("tooltip").length > 0, true, "I see the save button with tooltip");
							}
						}
					});
				},
				iShouldSeeAllExpectedColumnHeaders(iExpectedColumnCount) {
					return this.waitFor({
						controlType: "sap.m.Table",
						bindingPath: {
							path: "",
							propertyPath: "/adaptations",
							modelName: "contextBased"
						},
						searchOpenDialogs: true,
						success(vControls) {
							var oControl = vControls[0] || vControls;
							Opa5.assert.ok(oControl, "Manage Adaptations Table exist");
							Opa5.assert.strictEqual(oControl.getColumns().length, iExpectedColumnCount, "Column size is as expected");
						}
					});
				},
				iShouldSeeCorrectDateFormat(sDate, iColumnRow, sPropertyPath) {
					return this.waitFor({
						controlType: "sap.m.Text",
						bindingPath: {
							path: `/adaptations/${iColumnRow}`,
							propertyPath: sPropertyPath,
							modelName: "contextBased"
						},
						searchOpenDialogs: true,
						success(vControls) {
							var oControl = vControls[0] || vControls;
							Opa5.assert.strictEqual(oControl.getText().endsWith(sDate), true, "Contains the correct DateFormat");
						}
					});
				},
				iShouldSeeTheDefaultContextTable(bIsVisible) {
					return this.waitFor({
						controlType: "sap.m.Dialog",
						i18NText: {
							propertyName: "title",
							key: "MANAGE_ADAPTATIONS_DIALOG_HEADER"
						},
						searchOpenDialogs: true,
						success(vDialogControl) {
							var oDialogControl = vDialogControl[0] || vDialogControl;
							var aTables = oDialogControl.getAggregation("content");
							Opa5.assert.equal(aTables.length, 2, "Dialog should have 2 tables");
							var oDefaultTable = aTables.find(function(oTable) { return oTable.getId().endsWith("defaultContext"); });
							Opa5.assert.ok(oDefaultTable, "Default context table with id='defaultContext' exists");
							Opa5.assert.equal(oDefaultTable.getVisible(), bIsVisible, `The visibility of default context table should be:${bIsVisible}`);
						}
					});
				},
				iShouldSeeTheEnablementOfMoveUpButton(bIsEnabled) {
					return this.waitFor({
						controlType: "sap.m.Button",
						enabled: false,
						properties: {
							icon: "sap-icon://navigation-up-arrow"
						},
						searchOpenDialogs: true,
						success(vControls) {
							var oControl = vControls[0] || vControls;
							Opa5.assert.equal(oControl.getEnabled(), bIsEnabled, `The enablement of the move up button should be: ${bIsEnabled}`);
						}
					});
				},
				iShouldSeeTheEnablementOfMoveDownButton(bIsEnabled) {
					return this.waitFor({
						controlType: "sap.m.Button",
						enabled: false,
						properties: {
							icon: "sap-icon://navigation-down-arrow"
						},
						searchOpenDialogs: true,
						success(vControls) {
							var oControl = vControls[0] || vControls;
							Opa5.assert.equal(oControl.getEnabled(), bIsEnabled, `The enablement of the move Down button should be: ${bIsEnabled}`);
						}
					});
				},
				iShouldSeeTheEnablementOfDragAndDrop(bIsEnabled) {
					return this.waitFor({
						controlType: "sap.m.Table",
						bindingPath: {
							path: "",
							propertyPath: "/adaptations",
							modelName: "contextBased"
						},
						searchOpenDialogs: true,
						success(vControls) {
							var oManageAdaptationsTable = vControls[0] || vControls;
							var oDragAndDropConfig = oManageAdaptationsTable.getDragDropConfig()[0];
							Opa5.assert.ok(oDragAndDropConfig, "Drag&Drop config for table with id='manageAdaptationsTable' exists");
							Opa5.assert.equal(oDragAndDropConfig.getEnabled(), bIsEnabled, `The enablement of the drag&drop should be: ${bIsEnabled}`);
						}
					});
				},
				iShouldSeeEmptySearchField() {
					return this.waitFor({
						controlType: "sap.m.SearchField",
						searchOpenDialogs: true,
						success(vControls) {
							var oControl = vControls[0] || vControls;
							Opa5.assert.equal(oControl.getValue(), "", "Search field is empty");
						}
					});
				},
				iShouldSeeDefaultApplicationTitle(sExpectedTitle) {
					return this.waitFor({
						controlType: "sap.m.Text",
						i18NText: {
							propertyName: "text",
							key: "TXT_DEFAULT_APP"
						},
						searchOpenDialogs: true,
						success(vControls) {
							var oControl = vControls[0] || vControls;
							Opa5.assert.strictEqual(oControl.getText(), sExpectedTitle);
						}
					});
				},
				iShouldSeeTheSelectionOfAdaptation(sTitle) {
					return this.waitFor({
						controlType: "sap.m.Table",
						bindingPath: {
							path: "",
							propertyPath: "/adaptations",
							modelName: "contextBased"
						},
						searchOpenDialogs: true,
						success(vControls) {
							var oManageAdaptationsTable = vControls[0] || vControls;
							var sSelectedContextPath = oManageAdaptationsTable.getSelectedContextPaths()[0];
							var iIndexOfAdaptation = sSelectedContextPath.split("/")[sSelectedContextPath.split("/").length - 1];
							var sTitleOfSelectedAdaptation = oManageAdaptationsTable.getModel("contextBased").getData().adaptations[iIndexOfAdaptation].title;
							Opa5.assert.equal(sTitleOfSelectedAdaptation, sTitle, `The selected adaptation should be: ${sTitleOfSelectedAdaptation}`);
						}
					});
				},
				iShouldSeeNoSelections() {
					return this.waitFor({
						controlType: "sap.m.Table",
						bindingPath: {
							path: "",
							propertyPath: "/adaptations",
							modelName: "contextBased"
						},
						searchOpenDialogs: true,
						success(vControls) {
							var oManageAdaptationsTable = vControls[0] || vControls;
							Opa5.assert.equal(oManageAdaptationsTable.getSelectedContextPaths().length, 0, "No table selection was made");
						}
					});
				}
			}
		}
	});
});

