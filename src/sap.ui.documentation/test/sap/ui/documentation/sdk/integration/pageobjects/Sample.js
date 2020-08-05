sap.ui.define([
	'sap/ui/test/Opa5',
	'sap/ui/test/matchers/PropertyStrictEquals'
], function (Opa5, PropertyStrictEquals) {
	"use strict";

	Opa5.createPageObjects({
		onTheSamplePage: {
			viewName: "Sample",
			actions: {
				iPressOnShowCode : function () {
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers : new PropertyStrictEquals({
							name: "icon",
							value: "sap-icon://syntax"
						}),
						success : function (aButtons) {
							aButtons[0].$().trigger("tap");
						},
						errorMessage: "Did not find the show code button"
					});
				}
			},

			assertions: {

			}
		}
	});

});
