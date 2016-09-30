sap.ui.require([
		'sap/ui/test/Opa5',
		'sap/ui/test/matchers/AggregationLengthEquals',
		'sap/ui/test/matchers/PropertyStrictEquals',
		'sap/ui/test/matchers/BindingPath',
		'sap/ui/demo/bulletinboard/test/integration/pages/Common',
		'sap/ui/test/actions/Press',
		'sap/ui/test/actions/EnterText'
	],
	function (Opa5,
			  AggregationLengthEquals,
			  PropertyStrictEquals,
			  BindingPath,
			  Common,
			  Press,
			  EnterText) {
		"use strict";

		var sViewName = "Worklist",
			sTableId = "table";

		Opa5.createPageObjects({
			onTheWorklistPage: {
				baseClass: Common,
				actions: {
					iPressOnMoreData: function () {
						return this.waitFor({
							id: sTableId,
							viewName: sViewName,
							actions: new Press(),
							errorMessage: "The Table does not have a trigger"
						});
					},

					iPressOnTheItemWithTheID: function (sId) {
						return this.waitFor({
							controlType: "sap.m.ColumnListItem",
							viewName: sViewName,
							matchers:  new BindingPath({
								path: "/Posts('" + sId + "')"
							}),
							actions: new Press(),
							errorMessage: "No list item with the id " + sId + " was found."
						});
					},

					iSearchFor: function (sSearchString) {
						return this.waitFor({
							id: "searchField",
							viewName: sViewName,
							actions: new EnterText({
								text: sSearchString
							}),
							errorMessage: "SearchField was not found."
						});
					}
				},
				assertions: {
					theTableHasOneItem: function () {
						return this.waitFor({
							id: sTableId,
							viewName: sViewName,
							matchers:  new AggregationLengthEquals({
								name: "items",
								length: 1
							}),
							success: function () {
								Opa5.assert.ok(true, "The table contains one corresponding item.");
							},
							errorMessage: "The table does not contain one item."
						});
					},

					theTableShouldHaveAllEntries: function () {
						return this.waitFor({
							id: sTableId,
							viewName: sViewName,
							matchers:  new AggregationLengthEquals({
								name: "items",
								length: 23
							}),
							success: function () {
								Opa5.assert.ok(true, "The table has 23 items");
							},
							errorMessage: "Table does not have all entries."
						});
					},

					theTitleShouldDisplayTheTotalAmountOfItems: function () {
						return this.waitFor({
							id: "tableHeader",
							viewName: sViewName,
							matchers: function (oPage) {
								var sExpectedText = oPage.getModel("i18n").getResourceBundle().getText("worklistTableTitleCount", [23]);
								return new PropertyStrictEquals({
									name: "text",
									value: sExpectedText
								}).isMatching(oPage);
							},
							success: function () {
								Opa5.assert.ok(true, "The table header has 23 items");
							},
							errorMessage: "The Table's header does not container the number of items: 23"
						});
					},

					iShouldSeeTheTable: function () {
						return this.waitFor({
							id: sTableId,
							viewName: sViewName,
							success: function () {
								Opa5.assert.ok(true, "The table is visible");
							},
							errorMessage: "Was not able to see the table."
						});
					}
				}
			}
		});

	});
