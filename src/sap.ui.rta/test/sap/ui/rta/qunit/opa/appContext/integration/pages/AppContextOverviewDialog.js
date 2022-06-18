sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"sap/ui/test/actions/Drag",
	"sap/ui/test/actions/Drop",
	"sap/ui/test/matchers/Ancestor"
], function (
	Opa5,
	Press,
	Drag,
	Drop,
	Ancestor
) {
	"use strict";
	Opa5.createPageObjects({
		onTheAppContextOverviewDialogPage: {
			actions: {
				iSelectAppContext: function (sAppContextTitle) {
					return this.waitFor({
						controlType: "sap.m.ColumnListItem",
						viewId: "sap.ui.rta.appContexts---ManageContexts",
						searchOpenDialogs: true,
						descendant: {
							controlType: "sap.m.StandardListItem",
							properties: {
								title: sAppContextTitle
							}
						},
						actions: new Press()
					});
				},
				iMoveAppContextUp: function () {
					return this.waitFor({
						id: "sap.ui.rta.appContexts---ManageContexts--moveUpButton-img",
						searchOpenDialogs: true,
						actions: new Press()
					});
				},
				iMoveAppContextDown: function () {
					return this.waitFor({
						id: "sap.ui.rta.appContexts---ManageContexts--moveDownButton-img",
						searchOpenDialogs: true,
						actions: new Press()
					});
				},
				iDragAndDropAppContext: function (sDragAppContextTitle, sDropAppContextTitle, oDropOption) {
					this.waitFor({
						controlType: "sap.m.ColumnListItem",
						viewId: "sap.ui.rta.appContexts---ManageContexts",
						searchOpenDialogs: true,
						descendant: {
							controlType: "sap.m.StandardListItem",
							properties: {
								title: sDragAppContextTitle
							}
						},
						actions: new Drag()
					});

					this.waitFor({
						controlType: "sap.m.ColumnListItem",
						viewId: "sap.ui.rta.appContexts---ManageContexts",
						searchOpenDialogs: true,
						descendant: {
							controlType: "sap.m.StandardListItem",
							properties: {
								title: sDropAppContextTitle
							}
						},
						actions: new Drop(oDropOption)
					});
				},
				iClickOnActionMenuOfAppContextWithTitle: function (sTitle) {
					return this.waitFor({
						controlType: "sap.m.ColumnListItem",
						viewId: "sap.ui.rta.appContexts---ManageContexts",
						searchOpenDialogs: true,
						descendant: {
							controlType: "sap.m.StandardListItem",
							properties: {
								title: sTitle
							},
							searchOpenDialogs: true
						},
						success: function (aAncestors) {
							var oAncestor = aAncestors[0];
							return this.waitFor({
								controlType: "sap.m.MenuButton",
								matchers: new Ancestor(oAncestor),
								success: function () {
									Opa5.assert.ok(true, "Action button found and visible");
								},
								actions: new Press()
							});
						}
					});
				},
				iClickOnEditActionButton: function () {
					return this.waitFor({
						controlType: "sap.ui.unified.MenuItem",
						viewId: "sap.ui.rta.appContexts---ManageContexts",
						properties: {
							icon: "sap-icon://edit"
						},
						searchOpenDialogs: true,
						actions: new Press()
					});
				},
				iClickOnSaveActionButton: function () {
					return this.waitFor({
						controlType: "sap.ui.unified.MenuItem",
						viewId: "sap.ui.rta.appContexts---ManageContexts",
						properties: {
							icon: "sap-icon://save"
						},
						searchOpenDialogs: true,
						actions: new Press()
					});
				},
				iClickOnDeleteActionButton: function () {
					return this.waitFor({
						controlType: "sap.ui.unified.MenuItem",
						viewId: "sap.ui.rta.appContexts---ManageContexts",
						properties: {
							icon: "sap-icon://delete"
						},
						searchOpenDialogs: true,
						actions: new Press()
					});
				},
				iClickOnNewContextButton: function () {
					return this.waitFor({
						id: "sap.ui.rta.appContexts---ManageContexts--manageContexts-newContextButton",
						searchOpenDialogs: true,
						actions: new Press({
							idSuffix: "BDI-content"
						})
					});
				},
				iClickOnCloseButton: function () {
					return this.waitFor({
						controlType: "sap.m.Button",
						properties: {
							text: "Close"
						},
						searchOpenDialogs: true,
						actions: new Press({
							idSuffix: "BDI-content"
						})
					});
				}
			},
			assertions: {
				iShouldSeeAppContextDialogIsOpend: function () {
					return this.waitFor({
						controlType: "sap.ui.rta.appContexts.AppVariantOverviewDialog",
						properties: {
							title: "Overview of App Contexts"
						},
						searchOpenDialogs: true,
						success: function (vControls) {
							var oControl = vControls[0] || vControls;
							Opa5.assert.ok(oControl.getVisible(), "I see app context dialog is opened");
						}
					});
				},
				iShouldSeeRows: function (iRowCount) {
					return this.waitFor({
						id: "sap.ui.rta.appContexts---ManageContexts--manageContexts",
						searchOpenDialogs: true,
						success: function (oTable) {
							var aItems = oTable.getItems();
							Opa5.assert.equal(aItems.length, iRowCount, "I see correct amount of app contexts");
						}
					});
				},
				iShouldSeeAppContextAtPosition: function (iPosition, sExpectedTitle, iRoleCount) {
					return this.waitFor({
						id: "sap.ui.rta.appContexts---ManageContexts--manageContexts",
						searchOpenDialogs: true,
						success: function (oTable) {
							var aItems = oTable.getItems();
							var aCells = aItems[iPosition].getCells();
							var sRank = aCells[0].getText();
							var sTitle = aCells[1].getTitle();
							Opa5.assert.equal(sRank, iPosition + 1, "I see correct app context rank");
							Opa5.assert.equal(sTitle, sExpectedTitle, "I see correct app context title");
							if (iRoleCount) {
								var sRoleAndCountryDescription = aCells[2].getText();
								var sExpectedSubstring = iRoleCount === 1 ? iRoleCount + " Role" : iRoleCount + " Roles";
								Opa5.assert.equal(true, sRoleAndCountryDescription.includes(sExpectedSubstring), "I see correct assigned role count");
							}
						}
					});
				}
			}
		}
	});
});

