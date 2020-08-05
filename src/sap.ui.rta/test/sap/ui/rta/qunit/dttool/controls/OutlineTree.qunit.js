/* global QUnit */

sap.ui.define([
	"sap/m/StandardTreeItem",
	"sap/ui/model/json/JSONModel",
	"sap/ui/rta/dttool/controls/OutlineTree",
	"sap/m/library"
], function (
	StandardTreeItem,
	JSONModel,
	OutlineTree,
	mobileLibrary
) {
	"use strict";

	// shortcut for sap.m.ListMode
	var ListMode = mobileLibrary.ListMode;

	QUnit.module("OutlineTree API", function () {
		QUnit.test("Selection by Path", function(assert) {
			var oData = [{
				text: "Node1",
				ref: "../images/action.png",
				nodes: [{
					text: "Node1-1",
					ref: "../images/action.png"
				},
					{
						text: "Node1-2",
						ref: "../images/action.png",
						nodes: [{
							text: "Node1-2-1",
							ref: "../images/action.png",
							nodes: [{
								text: "Node1-2-1-1",
								ref: "../images/action.png"
							}]
						},
							{
								text: "Node1-2-2",
								ref: "../images/action.png"
							}
							]
					}
					]
			},
				{
					text: "Node2",
					ref: "../images/action.png",
					nodes: [{
						text: "Node2-1",
						ref: "../images/action.png",
						nodes: [{
							text: "Node2-1-1",
							ref: "../images/action.png",
							nodes: [{
								text: "Node2-1-1-1",
								ref: "../images/action.png",
								nodes: [{
									text: "Node2-1-1-1-1",
									ref: "../images/action.png",
									nodes: [{
										text: "Node2-1-1-1-1-1",
										ref: "../images/action.png",
										nodes: [{
											text: "Node2-1-1-1-1-1-1",
											ref: "../images/action.png",
											nodes: [{
												text: "Node2-1-1-1-1-1-1-1",
												ref: "../images/action.png",
												nodes: [{
													text: "Node2-1-1-1-1-1-1-1-1",
													ref: "../images/action.png"
												}]
											}]
										}]
									}]
								}]
							}]
						}]
					}]
				}
			];

			var oTreeItem = new StandardTreeItem({title: "{text}", icon: "{ref}"});
			var oTree = new OutlineTree();

			var oModel = new JSONModel();
			oTree.setModel(oModel);
			// set the data to the model
			oModel.setData(oData);
			oTree.bindItems("/", oTreeItem);
			oTree.placeAt("qunit-fixture");

			sap.ui.getCore().applyChanges();

			var sPath = "/1/nodes/0/nodes/0/nodes/0/nodes/0";
			var sText = oTree.getModel().getProperty(sPath).text;
			oTree.setMode(ListMode.SingleSelect);

			oTree.setSelectedItemByPath(sPath);
			assert.ok(oTree.getItems()[5].getSelected(), "tree item is selected.");
			assert.ok(oTree.getItems()[5].getItemNodeContext().nodeState.selected, "item context is selected");
			assert.strictEqual(oTree.getItems()[5].getTitle(), sText, "correct item is selected");

			oTree.setSelectedItemByPath(sPath, false);
			assert.ok(oTree.getItems()[5].getSelected() === false, "tree item is not selected.");

			oTree.collapseAll();
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});