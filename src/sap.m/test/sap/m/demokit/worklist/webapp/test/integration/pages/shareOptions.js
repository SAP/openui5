sap.ui.define([
		"sap/ui/test/Opa5",
		"sap/ui/test/actions/Press",
		"sap/ui/test/matchers/PropertyStrictEquals"
	], function(Opa5, Press, PropertyStrictEquals) {
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
							actions : new Press(),
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
							id : "shareEmail-button",
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