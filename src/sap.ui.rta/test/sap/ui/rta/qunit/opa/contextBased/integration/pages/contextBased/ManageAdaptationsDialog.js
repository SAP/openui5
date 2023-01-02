sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"sap/ui/test/actions/Drag",
	"sap/ui/test/actions/Drop",
	"sap/ui/test/matchers/Ancestor"
], function(
	Opa5,
	Press,
	Drag,
	Drop,
	Ancestor
) {
	"use strict";
	Opa5.createPageObjects({
		onTheManageAdaptationsDialogPage: {
			actions: {
				iSelectAdaptation: function(sAdaptationTitle) {
					return this.waitFor({
						controlType: "sap.m.Text",
						properties: {
							text: sAdaptationTitle
						},
						searchOpenDialogs: true,
						actions: new Press()
					});
				},
				iMoveAdaptationViaUpButton: function() {
					return this.waitFor({
						controlType: "sap.m.Button",
						properties: {
							icon: "sap-icon://navigation-up-arrow"
						},
						searchOpenDialogs: true,
						actions: new Press()
					});
				},
				iMoveAdaptationViaDownButton: function() {
					return this.waitFor({
						controlType: "sap.m.Button",
						properties: {
							icon: "sap-icon://navigation-down-arrow"
						},
						searchOpenDialogs: true,
						actions: new Press()
					});
				},
				iDragAndDropAdaptation: function(sDragAdaptationTitle, sDropAdaptationTitle, oDropOption) {
					this.waitFor({
						controlType: "sap.m.ColumnListItem",
						searchOpenDialogs: true,
						descendant: {
							controlType: "sap.m.CustomListItem",
							descendant: {
								controlType: "sap.m.HBox",
								descendant: {
									controlType: "sap.m.VBox",
									descendant: {
										controlType: "sap.m.Text",
										properties: {
											text: sDragAdaptationTitle
										}
									}
								}
							}
						},
						actions: new Drag()
					});

					this.waitFor({
						controlType: "sap.m.ColumnListItem",
						viewId: "sap.ui.rta.contextBased---ManageContexts",
						searchOpenDialogs: true,
						descendant: {
							controlType: "sap.m.CustomListItem",
							descendant: {
								controlType: "sap.m.HBox",
								descendant: {
									controlType: "sap.m.VBox",
									descendant: {
										controlType: "sap.m.Text",
										properties: {
											text: sDropAdaptationTitle
										}
									}
								}
							}
						},
						actions: new Drop(oDropOption)
					});
				},
				iClickOnActionMenuOfAdaptationWithTitle: function(sTitle) {
					return this.waitFor({
						controlType: "sap.m.ColumnListItem",
						viewId: "sap.ui.rta.contextBased---ManageContexts",
						searchOpenDialogs: true,
						descendant: {
							controlType: "sap.m.StandardListItem",
							properties: {
								title: sTitle
							},
							searchOpenDialogs: true
						},
						success: function(aAncestors) {
							var oAncestor = aAncestors[0];
							return this.waitFor({
								controlType: "sap.m.MenuButton",
								matchers: new Ancestor(oAncestor),
								success: function() {
									Opa5.assert.ok(true, "Action button found and visible");
								},
								actions: new Press()
							});
						}
					});
				},
				iClickOnEditActionButton: function() {
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
				iClickOnSaveActionButton: function() {
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
				iClickOnDeleteActionButton: function() {
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
				iClickOnNewContextButton: function() {
					return this.waitFor({
						id: "sap.ui.rta.contextBased---ManageContexts--manageContexts-newContextButton",
						searchOpenDialogs: true,
						actions: new Press({
							idSuffix: "BDI-content"
						})
					});
				},
				iClickOnCloseButton: function() {
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
				iClickOnSaveButton: function() {
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
				}
			},
			assertions: {
				iShouldSeeManageContextBasedAdaptationDialogIsOpend: function() {
					return this.waitFor({
						controlType: "sap.m.Dialog",
						i18NText: {
							propertyName: "title",
							key: "MANAGE_ADAPTATIONS_DIALOG_HEADER"
						},
						searchOpenDialogs: true,
						success: function(vControls) {
							var oControl = vControls[0] || vControls;
							Opa5.assert.ok(oControl.getVisible(), "I see manage adaptations dialog is opened");
						}
					});
				},
				iShouldSeeRows: function(iRowCount) {
					return this.waitFor({
						controlType: "sap.m.Table",
						bindingPath: {
							path: "",
							propertyPath: "/adaptations",
							modelName: "contextBased"
						},
						searchOpenDialogs: true,
						success: function(aTables) {
							var aItems = aTables[0].getItems();
							Opa5.assert.equal(aItems.length, iRowCount, "I see correct amount of context-based adaptations");
						}
					});
				},
				iShouldSeeAdaptationAtPosition: function(iPosition, sExpectedTitle, iRoleCount) {
					return this.waitFor({
						controlType: "sap.m.Table",
						bindingPath: {
							path: "",
							propertyPath: "/adaptations",
							modelName: "contextBased"
						},
						searchOpenDialogs: true,
						success: function(aTables) {
							var aItems = aTables[0].getItems();
							var aCells = aItems[iPosition].getCells();
							var sRank = aCells[0].getText();
							var sTitle = aCells[1].getContent()[0].getItems()[0].getItems()[0].getText();
							Opa5.assert.equal(sRank, iPosition + 1, "I see correct context-based adaptation rank");
							Opa5.assert.equal(sTitle, sExpectedTitle, "I see correct context-based adaptation title");
							if (iRoleCount) {
								var sRoleAndCountryDescription = aCells[2].getText();
								var sExpectedSubstring = iRoleCount === 1 ? iRoleCount + " Role" : iRoleCount + " Roles";
								Opa5.assert.equal(true, sRoleAndCountryDescription.includes(sExpectedSubstring), "I see correct assigned role count");
							}
						}
					});
				},
				iShouldSeeSaveButtonEnabled: function(bIsEnabled) {
					return this.waitFor({
						controlType: "sap.m.Button",
						i18NText: {
							propertyName: "text",
							key: "APP_CTX_DIALOG_SAVE"
						},
						enabled: false,
						searchOpenDialogs: true,
						success: function(vControl) {
							var oControl = vControl[0] || vControl;
							Opa5.assert.strictEqual(oControl.getProperty("enabled"), bIsEnabled, "I see save button with enabled status: " + bIsEnabled);
							if (bIsEnabled) {
								Opa5.assert.strictEqual(oControl.getAggregation("tooltip"), null, "I see the save button with no tooltip");
							} else {
								Opa5.assert.strictEqual(oControl.getAggregation("tooltip").length > 0, true, "I see the save button with tooltip");
							}
						}
					});
				}
			}
		}
	});
});

