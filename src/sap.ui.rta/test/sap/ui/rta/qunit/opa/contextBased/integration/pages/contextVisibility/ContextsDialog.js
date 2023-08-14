sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"sap/ui/test/actions/EnterText"
], function(
	Opa5,
	Press,
	EnterText
) {
	"use strict";
	Opa5.createPageObjects({
		onTheSelectRoleDialogPage: {
			actions: {
				iEnterRoleTitle(sRoleTitle) {
					this.waitFor({
						id: "contextSharing---ContextVisibility--selectContexts-searchField",
						searchOpenDialogs: true,
						actions: new EnterText({
							clearTextFirst: true,
							idSuffix: "I",
							text: sRoleTitle
						})
					});
					this.waitFor({
						id: "contextSharing---ContextVisibility--selectContexts-searchField",
						searchOpenDialogs: true,
						actions: new Press({
							idSuffix: "search"
						})
					});
				},
				iSelectRoleByName(sRoleTitle) {
					return this.waitFor({
						controlType: "sap.m.CheckBox",
						viewId: "contextSharing---ContextVisibility",
						properties: {
							editable: true
						},
						searchOpenDialogs: true,
						actions: new Press({
							idSuffix: "CbBg"
						}),
						ancestor: {
							controlType: "sap.m.StandardListItem",
							viewId: "contextSharing---ContextVisibility",
							properties: {
								title: sRoleTitle
							},
							searchOpenDialogs: true
						}
					});
				},
				iSelectRoles() {
					return this.waitFor({
						id: "contextSharing---ContextVisibility--selectContexts-ok",
						searchOpenDialogs: true,
						actions: new Press({
							idSuffix: "BDI-content"
						})
					});
				}
			},
			assertions: {
				iShouldSeeSelectRoleDialog() {
					return this.waitFor({
						id: "contextSharing---ContextVisibility--selectContexts-dialog-title",
						searchOpenDialogs: true,
						success(vControls) {
							var oControl = vControls[0] || vControls;
							Opa5.assert.strictEqual(oControl.getText(), "Select Roles", "I see role dialog");
						}
					});
				},
				iShouldSeeRoleTitle(sRoleTitle) {
					return this.waitFor({
						controlType: "sap.m.StandardListItem",
						viewId: "contextSharing---ContextVisibility",
						properties: {
							title: sRoleTitle
						},
						searchOpenDialogs: true,
						success() {
							Opa5.assert.ok(true, `I see role title: ${sRoleTitle}`);
						}
					});
				}
			}
		}
	});
});