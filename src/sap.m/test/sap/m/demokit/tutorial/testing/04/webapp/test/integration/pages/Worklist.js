sap.ui.define([
		'sap/ui/test/Opa5',
		'sap/ui/test/matchers/AggregationLengthEquals',
		'sap/ui/test/matchers/I18NText'
	],
	function (Opa5,
			  AggregationLengthEquals,
			  I18NText) {
		"use strict";

		var sViewName = "Worklist",
			sTableId = "table";

		Opa5.createPageObjects({
			onTheWorklistPage: {
				actions: {},
				assertions: {
					theTableShouldHaveAllEntries: function () {
						return this.waitFor({
							id: sTableId,
							viewName: sViewName,
							matchers: new AggregationLengthEquals({
								name: "items",
								length: 23
							}),
							success: function () {
								Opa5.assert.ok(true, "The table has 23 items");
							},
							errorMessage: "The table does not contain all items."
						});
					},

					theTitleShouldDisplayTheTotalAmountOfItems: function () {
						return this.waitFor({
							id: "tableHeader",
							viewName: sViewName,
							matchers: new I18NText({
								key: "worklistTableTitleCount",
								propertyName: "text",
								parameters: [23]
							}),
							success: function () {
								Opa5.assert.ok(true, "The table header has 23 items");
							},
							errorMessage: "The table header does not contain the number of items: 23"
						});
					}

				}
			}
		});

	});
