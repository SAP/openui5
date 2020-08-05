sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/Ancestor",
	"sap/ui/test/matchers/Properties",
	"testLibrary/pageObjects/Common1",
	"testLibrary/pageObjects/Common2",
	// create page object when module is loaded
	"testLibrary/pageObjects/List"
], function (Opa5, Press, Ancestor, Properties, Common1, Common2) {
	"use strict";

	// all configuration modifications here will also become available in the test journey
	// when this page object is loaded
	Opa5.extendConfig({
		// define utility functions that can be used by user page objects
		testLibBase: {
			sampleLibrary: {
				actions: {
					iOpenTheSelectList: function () {
						return this.waitFor({
							controlType: "sap.m.Select",
							actions: new Press(),
							errorMessage: "The Select was not found"
						});
					},
					iSelectItem: function (sKey) {
						return this.waitFor({
							controlType: "sap.m.SelectList",
							success: function (aLists) {
								return this.waitFor({
									controlType: "sap.ui.core.Item",
									matchers: [
										new Ancestor(aLists[0]),
										new Properties({key: sKey})
									],
									actions: new Press(),
									errorMessage: "The item with key '" + sKey + "' was not found"
								});
							},
							errorMessage: "The Select list was not found"
						});
					}
				}
			}
		},
		// define functionality that can be used on the global Given, When, Then constructs
		arrangements: new Common1(),
		assertions: new Common2()
	});

});
