sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/testrecorder/qunit/integration/pages/Common"
], function(Opa5, Common) {
	"use strict";

	Opa5.createPageObjects({
		onTheTreePage: {
			baseClass: Common,
			actions: {
				iSearchFor: function (sText) {
					this.waitFor({
						matchers: function () {
							return Opa5.getJQuery()("[search]");
						},
						actions: function ($search) {
							$search.val(sText);
						},
						errorMessage: "Cannot enter control type in search field"
					});
				},
				iSelectItem: function (sText) {
					this.waitFor({
						matchers: function () {
							var treeItemWithText = Opa5.getJQuery()("tag:contains(" + sText + ")");
							Opa5.assert.ok(treeItemWithText.is(":visible"), "Tree.iSelectItem - Tree item is visible. text = " + sText);
							return treeItemWithText;
						},
						actions: function ($item) {
							$item.click();
						},
						errorMessage: "Cannot find tree item"
					});
				},
				iSelectActionWithItem: function (sText, sAction) {
					this.waitFor({
						matchers: [
							function () {
								return Opa5.getJQuery()("tag:contains(" + sText + ")");
							},
							function ($item) {
								// workaround for limitations for right click in iframe
								Opa5.getWindow().sap.ui.testrecorder.interaction.ContextMenu.show({
									domElementId: $item.parent().attr("data-id"),
									location: {
										x: $item.offset().left,
										y: $item.offset().top
									},
									withEvents: true,
									items: {
										highlight: false
									}
								});
								return true;
							},
							function () {
								return Opa5.getJQuery()("div:contains(" + sAction + "):last");
							}
						],
						actions: function ($item) {
							$item.click();
						},
						errorMessage: "Cannot find context menu item"
					});
				}
			},

			assertions: {
				iShouldSeeTheHighlightedItem: function (sText) {
					this.waitFor({
						matchers: function () {
							var treeItemWithText = Opa5.getJQuery()("tag:contains(" + sText + ")");
							var isSelected = treeItemWithText.parent().attr("selected");
							return isSelected;
						},
						success: function (bSelected) {
							Opa5.assert.ok(bSelected, "Item should be highlighted");
						},
						errorMessage: "Cannot find tree item"
					});
				},
				iShouldSeeMatchingItems: function (aText) {
					this.waitFor({
						matchers: function () {
							var bMatch;
							aText.forEach(function (sText) {
								if (!bMatch) {
									var oTag = Opa5.getJQuery()("tag:contains(" + sText + ")");
									bMatch = oTag && oTag.parent().attr("matching");
								}
							});
							return bMatch;
						},
						success: function (oElement) {
							Opa5.assert.ok(oElement.parent().attr("selected"), "Item should be highlighted");
						},
						errorMessage: "Cannot find tree item from search"
					});
				},
				iShouldSeeTheRecorder: function () {
					this.waitFor({
						check: function () {
							var oTree = Opa5.getJQuery()("tree");
							return oTree.length && oTree.is(":visible") && oTree.css("visibility") !== "hidden";
						},
						success: function () {
							Opa5.assert.ok(true, "The recorder is loaded");
						},
						errorMessage: "Test recorder did not load"
					});
				}
			}
		}
	});
});
