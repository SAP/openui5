sap.ui.define([
	'sap/ui/test/Opa5',
	'sap/ui/test/matchers/AggregationLengthEquals',
	'sap/ui/test/matchers/AggregationFilled',
	'sap/ui/test/matchers/Properties',
	'sap/ui/test/actions/EnterText',
	'sap/ui/test/actions/Press'
], function (Opa5, AggregationLengthEquals, AggregationFilled, Properties, EnterText, Press) {
	"use strict";

	Opa5.createPageObjects({
		onTheApiMasterPage: {
			viewName: "ApiMaster",
			actions: {

				iSearchFor: function(sValue) {
				   return this.waitFor({
					   controlType: "sap.m.SearchField",
					   actions: new EnterText({ clearTextFirst: true, text: sValue }),
					   errorMessage: "Cannot find SearchField."
					});
				},

				iSelectATreeNode: function(sNode) {
					return this.waitFor({
						id: "tree",
						success: function() {
							this.waitFor({
								controlType: "sap.ui.documentation.sdk.controls.DemokitTreeItem",
								matchers: new Properties({title: sNode}),
								actions: new Press(),
								errorMessage: "Cannot select " + sNode + " node."
							});
						}
					});
				}

			},

			assertions: {

				iShouldSeeTheApiMasterPage: function () {
					return this.waitFor({
						success: function () {
							Opa5.assert.ok(true, "The API Reference page was successfully displayed");
						},
						errorMessage: "The API Reference page was not displayed"
					});
				},

				iShouldSeeTheTreeFilled: function () {
					return this.waitFor({
						id: "tree",
						matchers: new AggregationFilled({name: "items"}),
						success: function () {
							Opa5.assert.ok(true, "The tree is displayed");
						},
						errorMessage: "The tree was not found."
					});
				},

				iShouldSeeTheseItems: function (aItems) {
					return this.waitFor({
						id: "tree",
						matchers: new AggregationLengthEquals({name: "items", length: aItems.length}),
						success: function (oTree) {
							oTree.getItems().forEach( function(oItem, i) {
								Opa5.assert.strictEqual(oItem.getTitle(), aItems[i], "Checks the title of item #" + i);
							});
							Opa5.assert.ok(true, "The tree has " + aItems.length + " items");
						},
						errorMessage: "The tree was not found."
					});
				}

			}
		}
	});

});
