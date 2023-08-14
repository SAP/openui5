sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"sap/ui/test/actions/EnterText"
], function(
	Opa5,
	Press
) {
	"use strict";
	Opa5.createPageObjects({
		onTheContextSharingVisibilityFragmentPage: {
			actions: {
				iClickOnAddRoleButton() {
					return this.waitFor({
						id: "contextSharing---ContextVisibility--addContextsButton",
						searchOpenDialogs: true,
						actions: new Press({
							idSuffix: "BDI-content"
						})
					});
				},
				iClickOnRemoveRoleButton(sRoleTitle) {
					return this.waitFor({
						controlType: "sap.m.Button",
						viewId: "contextSharing---ContextVisibility",
						properties: {
							type: "Transparent"
						},
						searchOpenDialogs: true,
						actions: new Press(),
						ancestor: {
							controlType: "sap.m.StandardListItem",
							viewId: "contextSharing---ContextVisibility",
							properties: {
								title: sRoleTitle
							},
							ancestor: {
								id: "contextSharing---ContextVisibility--selectedContextsList",
								searchOpenDialogs: true
							}
						}
					});
				},
				iClickOnRemoveAllRolesButton() {
					return this.waitFor({
						id: "contextSharing---ContextVisibility--removeAllButton",
						searchOpenDialogs: true,
						actions: new Press({
							idSuffix: "inner"
						})
					});
				}
			},
			assertions: {
				iShouldNotSeeMessageStrip() {
					return this.waitFor({
						success() {
							var bExists = (Opa5.getJQuery()("#contextSharing---ContextVisibility--visibilityMessageStrip-content").length > 0);
							Opa5.assert.ok(!bExists, "Control does not exist");
						}
					});
				},
				iShouldNotSeeSelectedRolesSection() {
					return this.waitFor({
						success() {
							var bExists = (Opa5.getJQuery()("#contextSharing---ContextVisibility--selectedContextsList").length > 0);
							Opa5.assert.ok(!bExists, "Control does not exist");
						}
					});
				},
				iShouldSeeSelectedRolesSection() {
					return this.waitFor({
						id: "contextSharing---ContextVisibility--selectedContextsList",
						searchOpenDialogs: true,
						success(vControls) {
							var oControl = vControls[0] || vControls;
							Opa5.assert.ok(oControl.getVisible(), "I see correct role radio selection button selected");
						}
					});
				},
				iShouldSeeSelectedRole(sRoleTitle) {
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
				},
				iShouldSelectedRoleCount(iExpectedRoleLength) {
					return this.waitFor({
						controlType: "sap.m.StandardListItem",
						viewId: "contextSharing---ContextVisibility",
						ancestor: {
							id: "contextSharing---ContextVisibility--restrictedToolbar"
						},
						success(aControls) {
							Opa5.assert.equal(aControls.length, iExpectedRoleLength, `I see expected assigned context role count of ${iExpectedRoleLength}`);
						}
					});
				}
			}
		}
	});
});