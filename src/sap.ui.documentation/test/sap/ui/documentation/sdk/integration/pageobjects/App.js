sap.ui.define([
	'sap/ui/test/Opa5',
	'sap/ui/test/actions/Press'
], function (Opa5, Press) {
	"use strict";

	Opa5.createPageObjects({
		onTheAppPage: {
			viewName: "App",
			actions: {

				iPressTheWelcomeTabButton : function() {
					return this.waitFor({
						id: "sap_logo",
						actions: new Press(),
						errorMessage: "No welcomeTab button found"
					});
				},

				iPressTheTopicMasterTabButton : function() {
					return this.waitFor({
						id: "topicMasterTab",
						actions: new Press(),
						errorMessage: "No topicMasterTab button found"
					});
				},

				iPressTheApiMasterTabButton : function() {
					return this.waitFor({
						id: "apiMasterTab",
						actions: new Press(),
						errorMessage: "No apiMasterTab button found"
					});
				},

				iPressTheControlsMasterTabButton : function() {
					return this.waitFor({
						id: "controlsMasterTab",
						actions: new Press(),
						errorMessage: "No controlsMasterTab button found"
					});
				},

				iPressTheDemoAppsTabButton : function() {
					return this.waitFor({
						id: "demoAppsTab",
						actions: new Press(),
						errorMessage: "No demoAppsTab button found"
					});
				},

				iPressTheToolsTabButton : function() {
					return this.waitFor({
						id: "toolsTab",
						actions: new Press(),
						errorMessage: "No toolsTab button found"
					});
				}

			},

			assertions: {

				iShouldSeeTheAppPage: function () {
					return this.waitFor({
						success: function () {
							Opa5.assert.ok(true, "The App page was successfully displayed");
						},
						errorMessage: "The App page was not displayed"
					});
				}
			}
		}
	});

});
