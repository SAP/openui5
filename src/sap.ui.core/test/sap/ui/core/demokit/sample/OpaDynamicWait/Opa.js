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
							controlType : "sap.ui.commons.TreeNode",
							matchers : new PropertyStrictEquals({
								name : "expanded",
								value : false
							}),
							actions : function (oTreeNode) {
								if (oTreeNode.getNodes().length){
									oTreeNode.expand();
									this.iExpandRecursively();
								}
							}.bind(this),
							errorMessage : "Didn't find collapsed tree nodes"
						});
					}
				}),
				assertions : new Opa5({

					iSeeAllNodesExpanded : function() {
						return this.waitFor({
							controlType : "sap.ui.commons.TreeNode",
							matchers : new PropertyStrictEquals({
								name : "expanded",
								value : true
							}),
							success : function (aTreeNodes) {
								Opa5.assert.strictEqual(aTreeNodes.length, 4, "All nodes with childrean are expanded");
							},
							errorMessage : "Didn't find expanded tree nodes"
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

		Then.iSeeAllNodesExpanded();
		Then.iTeardownMyAppFrame();
	});

	QUnit.start();
});
