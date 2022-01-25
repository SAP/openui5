sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"sap/ui/test/actions/EnterText"
], function (
	Opa5,
	Press
) {
	"use strict";
	Opa5.createPageObjects({
		onTheContextSharingVisibilityFragmentPage: {
			actions: {
				iSelectRadioButton: function (sRadioButtonTitle) {
					this.waitFor({
						controlType: "sap.m.RadioButton",
						properties: {
							text: sRadioButtonTitle
						},
						searchOpenDialogs: true,
						actions: new Press()
					});
				},
				iClickOnAddRoleButton: function () {
					return this.waitFor({
						id: "contextSharing---ContextVisibility--addContextsButton",
						searchOpenDialogs: true,
						actions: new Press({
							idSuffix: "BDI-content"
						})
					});
				},
				iClickOnRemoveRoleButton: function (sRoleTitle) {
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
				iClickOnRemoveAllRolesButton: function () {
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
				iShouldNotSeeSelectedRolesSection: function () {
					return this.waitFor({
						success: function () {
							var bExists = (Opa5.getJQuery()("#contextSharing---ContextVisibility--selectedContextsList").length > 0);
							Opa5.assert.ok(!bExists, "Control does not exist");
						}
					});
				},
				iShouldSeeSelectedRolesSection: function () {
					return this.waitFor({
						id: "contextSharing---ContextVisibility--selectedContextsList",
						searchOpenDialogs: true,
						success: function (vControls) {
							var oControl = vControls[0] || vControls;
							Opa5.assert.ok(oControl.getVisible());
						}
					});
				},
				iShouldSeeSelectedRoles: function (sRoleTitle) {
					return this.waitFor({
						controlType: "sap.m.StandardListItem",
						viewId: "contextSharing---ContextVisibility",
						properties: {
							title: sRoleTitle
						},
						searchOpenDialogs: true
					});
				},
				iShouldSelectedRoleCount: function (iExpectedRoleLength) {
					return this.waitFor({
						controlType: "sap.m.StandardListItem",
						viewId: "contextSharing---ContextVisibility",
						ancestor: {
							id: "contextSharing---ContextVisibility--restrictedToolbar"
						},
						success: function (aControls) {
							Opa5.assert.equal(aControls.length, iExpectedRoleLength);
						}
					});
				}
			}
		}
	});
});