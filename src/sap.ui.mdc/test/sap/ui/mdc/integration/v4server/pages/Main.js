sap.ui.define([
		'sap/ui/test/Opa5',
		'sap/ui/test/matchers/AggregationLengthEquals',
		'sap/ui/test/actions/Press'
	],
	function (Opa5,
			  AggregationLengthEquals,
			  Press) {
		"use strict";

		var sViewName = "Main",
			sTableId = "table";

		Opa5.createPageObjects({
			onTheMainPage: {
				actions: {
					iPressOnMoreData: function () {
						// Press action hits the "more" trigger on a table
						return this.waitFor({
							id: sTableId,
							viewName: sViewName,
							actions: new Press(),
							errorMessage: "The table does not have a trigger"
						});
					}
				},
				assertions: {
					theTableShouldHavePagination: function () {
						return this.waitFor({
							id: sTableId,
							viewName: sViewName,
							matchers: new AggregationLengthEquals({
								name: "items",
								length: 20
							}),
							success: function () {
								Opa5.assert.ok(true, "The table has 20 items on the first page");
							},
							errorMessage: "The table does not contain all books."
						});
					},

					theTableShouldHaveMoreEntries: function () {
						return this.waitFor({
							id: sTableId,
							viewName: sViewName,
							matchers: new AggregationLengthEquals({
								name: "items",
								length: 40
							}),
							success: function () {
								Opa5.assert.ok(true, "The table has 40 books");
							},
							errorMessage: "The table does not contain more books."
						});
					}

				}
			}
		});

	});
