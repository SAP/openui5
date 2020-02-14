sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/BindingPath",
	"sap/ui/test/actions/Press"
], function (Opa5, BindingPath, Press) {
	"use strict";

	var sViewName1 = "MasterSettings";
	var sViewName2 = "DetailSettings";
	Opa5.createPageObjects({

		onTheSettingsPage: {

			actions: {

				iPressTheOrderSettingsItem: function() {
					return this.waitFor({
						controlType: "sap.m.StandardListItem",
						viewNamespace: "sap.ui.demo.toolpageapp.view.settings",
						viewName: sViewName1,
						matchers: new BindingPath({
							modelName: "side",
							path: "/masterSettings/1"
						}),
						actions: new Press(),
						errorMessage: "Did not find the order settings item on the master settings page"
					});
				},

				iPressTheSaveButton: function() {
					return this.waitFor({
						id: "save",
						viewNamespace: "sap.ui.demo.toolpageapp.view.settings",
						viewName: sViewName2,
						actions: new Press(),
						errorMessage: "Did not find the save button on the detail settings page"
					});
				},

				iPressTheCancelButton: function() {
					return this.waitFor({
						id: "cancel",
						visible: false,
						viewNamespace: "sap.ui.demo.toolpageapp.view.settings",
						viewName: sViewName2,
						actions: new Press(),
						errorMessage: "Did not find the cancel button on the detail settings page"
					});
				}
			},

			assertions: {
				iShouldSeeMasterSettingsView: function () {
					return this.waitFor({
						viewNamespace: "sap.ui.demo.toolpageapp.view.settings",
						viewName: sViewName1,
						success: function () {
							Opa5.assert.ok(sViewName1,"The master settings view was displayed");
						},
						errorMessage: "The master settings view was not displayed"
					});
				},

				iShouldSeeDetailSettingsView: function () {
					return this.waitFor({
						viewNamespace: "sap.ui.demo.toolpageapp.view.settings",
						viewName: sViewName2,
						success: function () {
							Opa5.assert.ok(sViewName2,"The detail Settings view was displayed");
						},
						errorMessage: "The detail settings view was not displayed"
					});
				},

				iShouldSeeMessageToast: function() {
					return this.waitFor({
						//increase opa's polling because the message toast is only shown for a brief moment
						pollingInterval: 100,
						check: function() {
							return !!Opa5.getJQuery()(".sapMMessageToast").length;
						},
						success: function() {
							Opa5.assert.ok( "The message toast was displayed");
						},
						errorMessage: "The message toast was not displayed"
					});
				}
			}
		}
	});
});