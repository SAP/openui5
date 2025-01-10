sap.ui.define([
	'sap/ui/test/Opa5',
	"sap/ui/test/matchers/I18NText"
], function (Opa5, I18NText) {
	"use strict";

	Opa5.createPageObjects({
		onTheWelcomePage: {
			viewName: "Welcome",
			assertions: {
				iShouldSeeTheWelcomePage: function () {
					return this.waitFor({
						success: function () {
							Opa5.assert.ok(true, "The Welcome page was successfully displayed");
						},
						errorMessage: "The Welcome page was not displayed"
					});
				},
				iSeeTheCookiePreferencesLink: function () {
					return this.waitFor({
						controlType : "sap.m.Link",
						matchers : new I18NText({propertyName : "text", key : "APP_SETTINGS_DIALOG_COOKIE_PREFERENCES"}),
						success: function () {
							Opa5.assert.ok(true, "The Cookie Preferences link was successfully displayed");
						},
						errorMessage: "The Cookie Preferences link was not displayed"
					});
				}
			}
		}
	});

});
