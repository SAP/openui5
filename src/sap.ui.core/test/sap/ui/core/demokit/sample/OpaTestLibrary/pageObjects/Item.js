sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/PropertyStrictEquals"
], function (Opa5, PropertyStrictEquals) {
	"use strict";

	Opa5.createPageObjects({

		onTheItemPage: {
			viewName: "Main",
			actions: {
				iSelectItem: function (sKey) {
					// use test library utilities to create a more complex action
					this.sampleLibrary.iOpenTheSelectList();
					this.sampleLibrary.iSelectItem(sKey);
				}
			},
			assertions: {
				theTitleIsCorrect: function (sTitle) {
					return this.waitFor({
						controlType: "sap.m.Title",
						matchers: new PropertyStrictEquals({
							name: "text",
							value: sTitle
						}),
						success: function (oCandidate) {
							Opa5.assert.ok(true, "The Item page title is correct");
						},
						errorMessage: "The Item page title did not have the expected value"
					});
				}
			}
		}

	});

});
