sap.ui.require([
		'sap/ui/test/Opa5',
		'sap/ui/test/matchers/AggregationLengthEquals',
		'sap/ui/test/matchers/AggregationFilled',
		'sap/ui/test/matchers/PropertyStrictEquals',
		'sap/ui/demo/bulletinboard/test/integration/pages/Common'
	],
	function (Opa5, AggregationLengthEquals, AggregationFilled, PropertyStrictEquals, Common) {
		"use strict";

		var sViewName = "Worklist",
			sTableId = "table";


		function createWaitForItemAtPosition(oOptions) {
			var iPosition = oOptions.position;
			return {
				id: sTableId,
				viewName: sViewName,
				matchers: function (oTable) {
					return oTable.getItems()[iPosition];
				},
				success: oOptions.success,
				errorMessage: "Table in view '" + sViewName + "' does not contain an Item at position '" + iPosition + "'"
			};
		}

		Opa5.createPageObjects({
			onTheWorklistPage: {
				baseClass: Common,
				actions: {
					iWaitUntilTheTableIsLoaded: function () {
						return this.waitFor({
							id: sTableId,
							viewName: sViewName,
							matchers: [new AggregationFilled({name: "items"})],
							errorMessage: "The Table has not been loaded"
						});
					},

					iPressATableItemAtPosition: function (iPosition) {
						return this.waitFor(createWaitForItemAtPosition({
							position: iPosition,
							success: function (oTableItem) {
								oTableItem.$().trigger("tap");
							}
						}));
					},

					iRememberTheItemAtPosition: function (iPosition) {
						return this.waitFor(createWaitForItemAtPosition({
							position: iPosition,
							success: function (oTableItem) {
								this.getContext().currentItem = oTableItem;
							}
						}));
					},

					iPressOnMoreData: function () {
						return this.waitFor({
							id: sTableId,
							viewName: sViewName,
							matchers: function (oTable) {
								return !!oTable.$("trigger").length;
							},
							success: function (oTable) {
								oTable.$("trigger").trigger("tap");
							},
							errorMessage: "The Table does not have a trigger"
						});
					}
				},
				assertions: {

					iShouldSeeTheTable: function () {
						return this.waitFor({
							id: sTableId,
							viewName: sViewName,
							success: function (oTable) {
								Opa5.assert.ok(oTable, "Found the object Table");
							},
							errorMessage: "Can't see the master Table."
						});
					},

					theTableShouldHaveAllEntries: function () {
						return this.waitFor({
							id: sTableId,
							viewName: sViewName,
							matchers: function (oTable) {
								var bGrowing = oTable.getGrowing(),
									iExpectedItems = (bGrowing ? oTable.getGrowingThreshold() : oTable.getItems().length);

								return new AggregationLengthEquals({
									name: "items",
									length: iExpectedItems
								}).isMatching(oTable);
							},
							success: function (oTable) {
								var bGrowing = oTable.getGrowing(),
									iExpectedItems = (bGrowing ? oTable.getGrowingThreshold() : oTable.getItems().length);

								Opa5.assert.strictEqual(oTable.getItems().length, iExpectedItems, "The table has " + iExpectedItems + " items");
							},
							errorMessage: "Table does not have all entries."
						});
					},

					theTitleShouldDisplayTheTotalAmountOfItems: function () {
						return this.waitFor({
							id: sTableId,
							viewName: sViewName,
							matchers: new AggregationFilled({name: "items"}),
							success: function (oTable) {
								var iObjectCount = oTable.getBinding("items").getLength();
								this.waitFor({
									id: "tableHeader",
									viewName: sViewName,
									matchers: function (oPage) {
										var sExpectedText = oPage.getModel("i18n").getResourceBundle().getText("worklistTableTitleCount", [iObjectCount]);
										return new PropertyStrictEquals({
											name: "text",
											value: sExpectedText
										}).isMatching(oPage);
									},
									success: function () {
										Opa5.assert.ok(true, "The Page has a title containing the number " + iObjectCount);
									},
									errorMessage: "The Page's header does not container the number of items " + iObjectCount
								});
							},
							errorMessage: "The table has no items."
						});
					},

					theTableShouldHaveTheDoubleAmountOfInitialEntries: function () {
						var iExpectedNumberOfItems;

						return this.waitFor({
							id: sTableId,
							viewName: sViewName,
							matchers: function (oTable) {
								iExpectedNumberOfItems = oTable.getGrowingThreshold() * 2;
								return new AggregationLengthEquals({
									name: "items",
									length: iExpectedNumberOfItems
								}).isMatching(oTable);
							},
							success: function () {
								Opa5.assert.ok(true, "The growing Table had the double amount: " + iExpectedNumberOfItems + " of entries");
							},
							errorMessage: "Table does not have the double amount of entries."
						});
					}

				}
			}
		});

	});
