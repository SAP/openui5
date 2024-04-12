/*global QUnit */
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/CustomTreeItem",
	"sap/m/Tree",
	"sap/m/Image",
	"sap/m/Text",
	"sap/ui/model/json/JSONModel",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(Element, createAndAppendDiv, CustomTreeItem, Tree, Image, Text, JSONModel, nextUIUpdate) {
	"use strict";

	createAndAppendDiv("content").style.height = "100%";

	var IMAGE_PATH = "test-resources/sap/m/images/";

	var oData = [
		{
			text: "Node1",
			ref: IMAGE_PATH + "action.png",
			nodes: [
				{
					text: "Node1-1",
					ref: IMAGE_PATH + "action.png"
				}, {
					text: "Node1-2",
					ref: IMAGE_PATH + "action.png",
					nodes: [
						{
							text: "Node1-2-1",
							ref: IMAGE_PATH + "action.png",
							nodes: [
								{
									text: "Node1-2-1-1",
									ref: IMAGE_PATH + "action.png"
								}
							]
						}, {
							text: "Node1-2-2",
							ref: IMAGE_PATH + "action.png"
						}
					]
				}
			]
		}, {
			text: "Node2",
			ref: IMAGE_PATH + "grass.jpg"
		}
	];

	async function createMTree() {
		var oCustomTreeItem = new CustomTreeItem({
			content: [
				new Image({
					src: "{ref}",
					decorative: false,
					width: "5rem",
					height: "5rem",
					densityAware: false
				}), new Text({
					text: "{text}"
				})
			]
		});
		this.oTree = new Tree();

		var oModel = new JSONModel();
		this.oTree.setModel(oModel);
		// set the data to the model
		oModel.setData(oData);
		this.oTree.bindItems("/", oCustomTreeItem);

		this.oTree.placeAt("content");
		await nextUIUpdate();
	}

	async function destroyMTree() {
		this.oTree.destroy();
		await nextUIUpdate();
	}

	/*
	 // ================================================================================
	 // qunit checks
	 // ================================================================================
	 */
	QUnit.module("Initial Check", {
		beforeEach: createMTree,
		afterEach: destroyMTree
	});

	QUnit.test("CustomTreeItem rendered", function(assert) {
		var $CustomTreeItem0 = Element.getElementById("__item0-__tree0-0").$();
		var $CustomTreeItem1 = Element.getElementById("__item0-__tree0-1").$();
		assert.ok($CustomTreeItem0.hasClass("sapMCTI"), "First CustomTreeItem rendered correctly.");
		assert.ok($CustomTreeItem0.find(".sapMImg"), "Image control rendered correctly.");
		assert.ok($CustomTreeItem0.find(".sapMText"), "Text control rendered correctly.");
		assert.ok($CustomTreeItem1.hasClass("sapMCTI"), "Second CustomTreeItem rendered correctly.");
		assert.ok($CustomTreeItem1.find(".sapMImg"), "Image control rendered correctly.");
		assert.ok($CustomTreeItem1.find(".sapMImg"), "Image control rendered correctly.");
	});

});