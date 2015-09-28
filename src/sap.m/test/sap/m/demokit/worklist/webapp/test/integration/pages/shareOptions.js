sap.ui.define([
		"sap/ui/test/Opa5",
		"sap/ui/test/matchers/PropertyStrictEquals"
	], function(Opa5, PropertyStrictEquals) {
		"use strict";

		return {

			createActions : function (sViewName) {
				return {
					iPressOnTheShareButton : function () {
						return this.waitFor({
							controlType : "sap.m.Button",
							viewName : sViewName,
							matchers : new PropertyStrictEquals({
								name : "icon",
								value : "sap-icon://action"
							}),
							success : function (aButtons) {
								aButtons[0].$().trigger("tap");
							},
							errorMessage : "Did not find the share button"
						});
					}
				};
			},

			createAssertions : function (sViewName) {
				return {

					iShouldSeeTheShareEmailButton : function () {
						return this.waitFor({
							viewName : sViewName,
							controlType : "sap.m.Button",
							matchers : new PropertyStrictEquals({
								name : "icon",
								value : "sap-icon://email"
							}),
							success : function () {
								Opa5.assert.ok(true, "The E-Mail button is visible");
							},
							errorMessage : "The E-Mail button was not found"
						});
					}

				};

			}

		};

	}
);