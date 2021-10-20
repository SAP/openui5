/* global QUnit */

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"sap/ui/test/matchers/PropertyStrictEquals"
], function (Opa5, opaTest, PropertyStrictEquals) {
	"use strict";

	QUnit.module("Nested waitFors", {
		beforeEach : function () {

			Opa5.extendConfig({
				viewName : "appUnderTest.view.Main",
				autoWait : true,

				actions : new Opa5({

					iExpandRecursively : function() {
						return this.waitFor({
							controlType : "sap.m.StandardTreeItem",
							matchers : new PropertyStrictEquals({
								name : "expanded",
								value : false
							}),
							actions : function (oTreeItem) {
								if (!oTreeItem.isLeaf()) {
									var oTree = oTreeItem.getTree();
									var iPos = oTree.indexOfItem(oTreeItem);
									oTree.expand(iPos);
									this.iExpandRecursively();
								}
							}.bind(this),
							errorMessage : "Didn't find collapsed tree items"
						});
					}
				}),
				assertions : new Opa5({

					iSeeAllItemsExpanded : function() {
						return this.waitFor({
							controlType : "sap.m.StandardTreeItem",
							matchers : new PropertyStrictEquals({
								name : "expanded",
								value : true
							}),
							success : function (aTreeItems) {
								Opa5.assert.strictEqual(aTreeItems.length, 4, "All nodes with children are expanded");
							},
							errorMessage : "Didn't find expanded tree items"
						});
					}
				})
			});

		}
	});
	opaTest("Should expand all items in the tree", function(Given, When, Then) {

		// Act
		Given.iStartMyAppInAFrame("applicationUnderTest/index.html");

		When.iExpandRecursively();

		Then.iSeeAllItemsExpanded();
		Then.iTeardownMyAppFrame();
	});

	QUnit.start();
});
