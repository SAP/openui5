sap.ui.require([
		"sap/ui/test/Opa5",
		"sap/ui/test/matchers/AggregationLengthEquals",
		"sap/ui/test/matchers/AggregationFilled",
		"sap/ui/test/matchers/PropertyStrictEquals",
		"sap/ui/demo/worklist/test/integration/pages/Common",
		"sap/ui/demo/worklist/test/integration/pages/shareOptions"
	],
	function(Opa5, AggregationLengthEquals, AggregationFilled, PropertyStrictEquals, Common, shareOptions) {
		"use strict";

		var sViewName = "Worklist",
			sTableId = "table";

		Opa5.createPageObjects({
			onTheWorklistPage : {
				baseClass: Common,
				actions: jQuery.extend({
					iPressATableItem : function (sName) {

						return this.waitFor({
							id : sTableId,
							viewName : sViewName,
							matchers: function (oTable) {
								var vTableItem = false;

								oTable.getItems().some(function (oItem) {
									if (oItem.getCells()[0].getTitle() === sName) {
										vTableItem = oItem;
										return true;
									}
									return false;
								});

								return vTableItem;
							},
							success : function (oTableItem) {
								oTableItem.$().trigger("tap");
							},
							errorMessage : "The Table does not contain an Item with the name '" + sName + "'"
						});
					},

					iPressOnTheObject01InTheTable : function (){
						return this.iPressATableItem("Object 01");
					},

					iPressOnMoreData : function (){

						return this.waitFor({
							id : sTableId,
							viewName : sViewName,
							matchers: function (oTable) {
								return !!oTable.$("trigger").length;
							},
							success : function (oTable) {
								oTable.$("trigger").trigger("tap");
							},
							errorMessage : "The Table does not have a trigger"
						});
					},

					iWaitUntilTheTableIsLoaded : function () {
						return this.waitFor({
							id : sTableId,
							viewName : sViewName,
							matchers : [ new AggregationFilled({name : "items"}) ],
							errorMessage : "The Table has not been loaded"
						});
					}

				}, shareOptions.createActions(sViewName)),
				assertions: jQuery.extend({

					iShouldSeeTheTable : function () {
						return this.waitFor({
							id : sTableId,
							viewName : sViewName,
							success : function (oTable) {
								ok(oTable, "Found the object Table");
							},
							errorMessage : "Can't see the master Table."
						});
					},

					theTableShouldHaveAllEntries : function () {
						return this.waitFor({
							id : sTableId,
							viewName : sViewName,
							matchers : function (oTable) {
								var iThreshold = oTable.getGrowingThreshold();
								return new AggregationLengthEquals({name : "items", length : iThreshold}).isMatching(oTable);
							},
							success : function (oTable) {
								var iGrowingThreshold = oTable.getGrowingThreshold();
								strictEqual(oTable.getItems().length, iGrowingThreshold, "The growing Table has " + iGrowingThreshold + " items");
							},
							errorMessage : "Table does not have all entries."
						});
					},

					theTitleShouldDisplayTheTotalAmountOfItems : function () {
						var bRequestCompleted = false,
							iObjectCount = 0,
							sUrl = jQuery.sap.getResourcePath("sap/ui/demo/worklist/test/service/Objects", ".json");

						jQuery.getJSON(sUrl, function( aObjects ) {
							bRequestCompleted = true;
							iObjectCount = aObjects.length;
						}).fail(function () {
							throw "No object found at the url " + sUrl;
						});

						return this.waitFor({
							id : "tableHeader",
							viewName : sViewName,
							matchers : function (oPage) {
								// wait until we know the number of items
								if (!bRequestCompleted) {
									return false;
								}

								var sExpectedText = oPage.getModel("i18n").getResourceBundle().getText("worklistTableTitleCount", [iObjectCount]);
								return new PropertyStrictEquals({name : "text", value: sExpectedText}).isMatching(oPage);
							},
							success : function () {
								ok(true, "The Page has a title containing the number " + iObjectCount);
							},
							errorMessage : "The Page's header does not container the number of items " + iObjectCount
						});
					},

					theTableShouldHaveTheDoubleAmountOfInitialEntries : function () {
						var iExpectedNumberOfItems;

						return this.waitFor({
							id : sTableId,
							viewName : sViewName,
							matchers : function (oTable) {
								iExpectedNumberOfItems = oTable.getGrowingThreshold() * 2;
								return new AggregationLengthEquals({name : "items", length : iExpectedNumberOfItems}).isMatching(oTable);
							},
							success : function () {
								ok(true, "The growing Table had the double amount: " + iExpectedNumberOfItems + " of entries");
							},
							errorMessage : "Table does not have the double amount of entries."
						});
					},

					iShouldSeeTheWorklistViewsBusyIndicator : function () {
						return this.waitFor({
							id : "page",
							viewName : sViewName,
							success : function (oPage) {
								ok(oPage.getParent().getBusy(), "The worklist view is busy");
							},
							errorMessage : "The worklist view is not busy"
						});
					},

					iShouldSeeTheWorklistTableBusyIndicator : function () {
						return this.waitFor({
							id : "table",
							viewName : sViewName,
							matchers : function (oTable) {
								return new PropertyStrictEquals({name : "busy", value: true}).isMatching(oTable);
							},
							success : function () {
								ok(true, "The worklist table is busy");
							},
							errorMessage : "The worklist table is not busy"
						});
					}

				}, shareOptions.createAssertions(sViewName))
			}
		});

	});
