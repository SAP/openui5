sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/AggregationLengthEquals",
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/actions/Press"
], function (Opa5, AggregationLengthEquals, EnterText, Press) {
	"use strict";

	// access properties set by the consumer test
	var sListView = Opa5.getTestLibConfig('sampleLibrary').listViewName;

	// simple example of a page object provided by a test library and registered to OPA5 when the library is loaded.
	// all methods defined here can be accessed on the page objects' Given, When and Then clauses (eg: Given.onTheListPage.iSetTheFilter())
	Opa5.createPageObjects({

		onTheListPage: {
			viewName: sListView,
			actions: {
				iSetTheFilter: function (sFilter) {
					return this.waitFor({
						controlType: "sap.m.SearchField",
						actions: new EnterText({text: sFilter}),
						errorMessage: "The SeachField was not found"
					});
				},
				iNavigateFromListItem: function (sColumnName, sItemName) {
					return this.waitFor({
						controlType: "sap.m.ColumnListItem",
						matchers: function (oColumnListItem) {
							var bFound = false;
							var oTableRow = oColumnListItem.getBindingContext("items").getObject();
							Object.keys(oTableRow).forEach(function (sName) {
								bFound = sName === sColumnName && oTableRow[sName] === sItemName;
							});
							return bFound;
						},
						actions: new Press(),
						errorMessage: "There are no rows with " + sColumnName + " value " + sItemName
					});
				}
			},

			assertions: {
				theResultListIsVisible: function (iListLength) {
					return this.waitFor({
						controlType: "sap.m.Table",
						matchers: new AggregationLengthEquals({name: "items", length: iListLength}),
						success: function () {
							Opa5.assert.ok(true, "The filtered list page item count is correct");
						},
						errorMessage: "The filtered list is not correct"
					});
				}
			}
		}

	});

});
