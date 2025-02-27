sap.ui.define([
	'sap/ui/test/Opa5',
	"sap/ui/test/matchers/I18NText",
	'sap/ui/test/actions/Press'
], function (Opa5, I18NText, Press) {
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

				iPressTheResourcesTabButton : function() {
					return this.waitFor({
						id: "resourcesTab",
						actions: new Press(),
						errorMessage: "No resourcesTab button found"
					});
				},

				iPressTheAcceptAllCookiesButton: function() {
					var oWindow = Opa5.getWindow();

					return this.waitFor({
						check: function () {
							return !!oWindow.document.getElementById("truste-consent-button");
						},
						success: function () {
							var oBtn = oWindow.document.getElementById("truste-consent-button");
							simulateClick(oBtn);
						},
						errorMessage: "Accept All button not found"
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
				},

				iShouldSeeTheCookiePreferencesBlackbar: function () {
					return this.waitFor({
						check: function () {
							var oWindow = Opa5.getWindow();
							return !!oWindow.document.getElementById("consent_blackbar");
						},
						success: function () {
							Opa5.assert.ok(true, "The Cookie Preferences blackbar was successfully displayed");
						},
						errorMessage: "The Cookie Preferences blackbar was not displayed"
					});
				}
			}
		}
	});

	// utils
	function simulateClick (element) {
		var event = new MouseEvent('click', {
			view: window,
			bubbles: true,
			cancelable: true
		});
		element.dispatchEvent(event);
	}

});
