/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Sorter",
	"sap/m/StandardTreeItem",
	"sap/m/StandardListItem",
	"sap/m/Tree",
	"sap/m/library",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(Element, Library, createAndAppendDiv, qutils, KeyCodes, JSONModel, Sorter, StandardTreeItem, StandardListItem, Tree, library, nextUIUpdate) {
	"use strict";
	createAndAppendDiv("content").style.height = "100%";

	const IMAGE_PATH = "test-resources/sap/m/images/";
	const oData = [
		{
			text: "Node1",
			ref: IMAGE_PATH + "action.png",
			nodes: [
				{
					text: "Node1-1",
					ref: IMAGE_PATH + "action.png"
				},
				{
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
							}]
						},
						{
							text: "Node1-2-2",
							ref: IMAGE_PATH + "action.png"
						}
					]
				}
			]
		},
		{
			text: "Node2",
			ref: IMAGE_PATH + "action.png",
			nodes: [
				{
					text: "Node2-1",
					ref: IMAGE_PATH + "action.png",
					nodes: [
							{
								text: "Node2-1-1",
								ref: IMAGE_PATH + "action.png",
								nodes: [
										{
											text: "Node2-1-1-1",
											ref: IMAGE_PATH + "action.png",
											nodes: [
													{
														text: "Node2-1-1-1-1",
														ref: IMAGE_PATH + "action.png",
														nodes: [
																{
																	text: "Node2-1-1-1-1-1",
																	ref: IMAGE_PATH + "action.png",
																	nodes: [
																		{
																			text: "Node2-1-1-1-1-1-1",
																			ref: IMAGE_PATH + "action.png",
																			nodes: [
																				{
																					text: "Node2-1-1-1-1-1-1-1",
																					ref: IMAGE_PATH + "action.png",
																					nodes: [
																						{
																							text: "Node2-1-1-1-1-1-1-1-1",
																							ref: IMAGE_PATH + "action.png"
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

	const oData2 = [
		{
			text: "Node1",
			ref: IMAGE_PATH + "action.png"
		},
		{
			text: "Node2",
			ref: IMAGE_PATH + "action.png"
		},
		{
			text: "Node3",
			ref: IMAGE_PATH + "action.png"
		},
		{
			text: "Node4",
			ref: IMAGE_PATH + "action.png"
		},
		{
			text: "Node5",
			ref: IMAGE_PATH + "action.png"
		},
		{
			text: "Node6",
			ref: IMAGE_PATH + "action.png"
		},
		{
			text: "Node7",
			ref: IMAGE_PATH + "action.png"
		},
		{
			text: "Node8",
			ref: IMAGE_PATH + "action.png"
		},
		{
			text: "Node9",
			ref: IMAGE_PATH + "action.png"
		},
		{
			text: "Node10",
			ref: IMAGE_PATH + "action.png"
		}
	];

	async function createTree() {
		const oTreeItem = new StandardTreeItem({title: "{text}", icon: "{ref}"});
		const oTree = new Tree();
		const oModel = new JSONModel();

		oTree.setModel(oModel);
		//set the data to the model
		oModel.setData(oData);
		oTree.bindItems("/", oTreeItem);
		oTree.placeAt("content");
		await nextUIUpdate();

		return oTree;
	}

	function assertToggleOpenStateParameters(assert, oTree, iIndex, bExpanded, mActualParameters) {
		assert.deepEqual(mActualParameters, {
			id: oTree.getId(),
			itemIndex: iIndex,
			itemContext: oTree.getItems()[iIndex].getBindingContext(oTree.getBindingInfo("items").model),
			expanded: bExpanded
		}, "The toggleOpenState event was called with the correct parameters");
	}

	/*
	//================================================================================
	//qunit checks
	//================================================================================
	*/

	QUnit.module("Rendering", {
		beforeEach: async function () {
			this.oTree = await createTree();
		},
		afterEach: function () {
			this.oTree.destroy();
			this.oTree = null;
		}
	});

	QUnit.test("Tree items rendering", function(assert) {
		const oTree = this.oTree;
		assert.ok(document.getElementById(oTree.getItems()[0].getId()), "initial render of first node");
		assert.ok(document.getElementById(oTree.getItems()[1].getId()), "initial render of second node");
		assert.ok(document.getElementById(oTree.getItems()[0].getId() + "-icon"), "icon is rendered");

		const oImage = Element.getElementById(oTree.getItems()[0].getId() + "-icon");
		assert.strictEqual(oImage.getSrc(), IMAGE_PATH + "action.png", "icon source is correct");
	});

	QUnit.module("Indentation", {
		beforeEach: async function () {
			this.oTree = await createTree();
		},
		afterEach: function () {
			this.oTree.destroy();
			this.oTree = null;
		}
	});

	QUnit.test("Indentation of tree nodes", async function(assert) {
		const oTree = this.oTree;
		assert.equal(oTree.getDeepestLevel(), 0, "deepestLevel");

		let oArrow = Element.getElementById(oTree.getItems()[1].getId() + "-expander");
		oArrow.firePress();
		await nextUIUpdate();

		assert.equal(oTree.getDeepestLevel(), 1, "deepestLevel");
		assert.equal(oTree.getItems()[1].$().css("padding-left"), "0px", "padding");
		assert.equal(oTree.getItems()[2].$().css("padding-left"), "24px", "padding");

		oArrow = Element.getElementById(oTree.getItems()[2].getId() + "-expander");
		oArrow.firePress();
		await nextUIUpdate();

		assert.equal(oTree.getDeepestLevel(), 2, "deepestLevel");
		assert.equal(oTree.getItems()[1].$().css("padding-left"), "0px", "padding");
		assert.equal(oTree.getItems()[2].$().css("padding-left"), "16px", "padding");
		assert.equal(oTree.getItems()[3].$().css("padding-left"), "32px", "padding");

		oArrow = Element.getElementById(oTree.getItems()[3].getId() + "-expander");
		oArrow.firePress();
		await nextUIUpdate();

		assert.equal(oTree.getDeepestLevel(), 3, "deepestLevel");
		assert.equal(oTree.getItems()[1].$().css("padding-left"), "0px", "padding");
		assert.equal(oTree.getItems()[2].$().css("padding-left"), "8px", "padding");
		assert.equal(oTree.getItems()[3].$().css("padding-left"), "16px", "padding");
		assert.equal(oTree.getItems()[4].$().css("padding-left"), "24px", "padding");

		oArrow = Element.getElementById(oTree.getItems()[4].getId() + "-expander");
		oArrow.firePress();
		await nextUIUpdate();

		oArrow = Element.getElementById(oTree.getItems()[5].getId() + "-expander");
		oArrow.firePress();
		await nextUIUpdate();

		oArrow = Element.getElementById(oTree.getItems()[6].getId() + "-expander");
		oArrow.firePress();
		await nextUIUpdate();

		assert.equal(oTree.getDeepestLevel(), 6, "deepestLevel");
		assert.equal(oTree.getItems()[1].$().css("padding-left"), "0px", "padding");
		assert.equal(oTree.getItems()[2].$().css("padding-left"), "4px", "padding");
		assert.equal(oTree.getItems()[3].$().css("padding-left"), "8px", "padding");
		assert.equal(oTree.getItems()[4].$().css("padding-left"), "12px", "padding");
		assert.equal(oTree.getItems()[5].$().css("padding-left"), "16px", "padding");
		assert.equal(oTree.getItems()[6].$().css("padding-left"), "20px", "padding");

		// collapse
		const oArrowDomRef = oTree.getItems()[2].$().find(".sapMTreeItemBaseExpander");
		oArrowDomRef.trigger("click");
		await nextUIUpdate();

		//expand
		oArrow = Element.getElementById(oTree.getItems()[2].getId() + "-expander");
		oArrow.firePress();
		await nextUIUpdate();

		assert.equal(oTree.getItems()[2].$().css("padding-left"), "4px", "padding");

		oTree.collapseAll();
	});

	QUnit.module("Selection", {
		beforeEach: async function () {
			this.oTree = await createTree();
		},
		afterEach: function () {
			this.oTree.destroy();
			this.oTree = null;
		}
	});

	QUnit.test("Single selection", function(assert) {
		const oTree = this.oTree;
		oTree.setMode(library.ListMode.SingleSelect);
		oTree.getItems()[0].setSelected(true);
		assert.ok(oTree.getItems()[0].getSelected(),"tree item is selected.");
		assert.ok(oTree.getItems()[0].getItemNodeContext().nodeState.selected, "item context is selected");
	});

	QUnit.test("Multi selection", function(assert) {
		const oTree = this.oTree;
		oTree.setMode(library.ListMode.MultiSelect);
		oTree.getItems()[0].setSelected(true);
		oTree.getItems()[1].setSelected(true);
		assert.ok(oTree.getItems()[0].getSelected(),"tree item is selected.");
		assert.ok(oTree.getItems()[0].getItemNodeContext().nodeState.selected, "item context is selected");
		assert.ok(oTree.getItems()[1].getSelected(),"tree item is selected.");
		assert.ok(oTree.getItems()[1].getItemNodeContext().nodeState.selected, "item context is selected");

		oTree.removeSelections(true);
		assert.notOk(oTree.getItems()[0].getSelected(),"tree item is not selected.");
		assert.notOk(oTree.getItems()[0].getItemNodeContext().nodeState.selected, "item context is not selected");
		assert.notOk(oTree.getItems()[1].getSelected(),"tree item is not selected.");
		assert.notOk(oTree.getItems()[1].getItemNodeContext().nodeState.selected, "item context is not selected");
	});

	QUnit.module("Accessibility", {
		beforeEach: async function () {
			this.oTree = await createTree();
		},
		afterEach: function () {
			this.oTree.destroy();
			this.oTree = null;
		}
	});

	QUnit.test("Custom announcement on focus", function(assert) {
		const oTreeItem = this.oTree.getItems()[1];
		oTreeItem.focus();
		assert.equal(oTreeItem.getAccessibilityInfo().description, "Node2", "Custom announcement is added without selected state");
	});

	QUnit.test("applyAriaRole should not have effect on Tree control", async function(assert) {
		const oMyTree = new Tree(),
			oTemplate = new StandardTreeItem({
				title: "{title}"
			}),
			aTreeData = [{
				"title": "C",
				"titles": [
					{"title": "Subtitle C"}
				]
			}, {
				"title": "B",
				"titles": [
					{"title": "SubTitle B"}
				]
			}, {
				"title": "A"
			}];

		const oModel = new JSONModel();
		oModel.setData(aTreeData);
		oMyTree.setModel(oModel);

		oMyTree.bindItems({
			path: "/",
			template: oTemplate
		});

		assert.strictEqual(oMyTree.getAriaRole(), "tree", "role='tree' returned");

		oMyTree.placeAt("qunit-fixture");
		await nextUIUpdate();
		assert.strictEqual(oMyTree.getDomRef("listUl").getAttribute("role"), oMyTree.getAriaRole(), "role='tree' not affected in DOM");
		assert.strictEqual(oMyTree.getItems()[0].getDomRef().getAttribute("role"), "treeitem", "role='treeitem', tree item is also not affected in DOM");
		oMyTree.destroy();
	});

	QUnit.module("Expanded state", {
		beforeEach: async function () {
			this.oTree = await createTree();
		},
		afterEach: function () {
			this.oTree.destroy();
			this.oTree = null;
		}
	});

	QUnit.test("Expand/Collapse", async function(assert) {
		const oTree = this.oTree;
		const oToggleOpenStateEventSpy = sinon.spy(function(oEvent) {
			oToggleOpenStateEventSpy._mEventParameters = oEvent.mParameters;
		});
		oTree.attachToggleOpenState(oToggleOpenStateEventSpy);

		//initial state
		assert.strictEqual(oTree.getItems().length, 2, "two nodes displayed before tree expanding");

		oTree.focus();
		assert.strictEqual(oTree.getItems()[0].$().attr("aria-expanded"), "false", "aria-expanded is false");

		let oArrow = Element.getElementById(oTree.getItems()[0].getId() + "-expander");
		oArrow.firePress();
		await nextUIUpdate();

		assert.strictEqual(oTree.getItems().length, 4, "four nodes displayed after tree expanding");

		assert.equal(oTree.getItems()[0].getLevel(), 0, "first level node is in level 0");
		assert.equal(oTree.getItems()[1].getLevel(), 1, "second node is in level 1");
		assert.strictEqual(oTree.getItems()[0].$().attr("aria-expanded"), "true", "aria-expanded is true");

		assert.ok(oToggleOpenStateEventSpy.calledOnce, "The toggleOpenState event was called once");
		assertToggleOpenStateParameters(assert, oTree, 0, true, oToggleOpenStateEventSpy._mEventParameters);

		let oArrowDomRef = oTree.getItems()[1].$().find(".sapMTreeItemBaseExpander");
		oArrowDomRef.trigger("click");
		assert.ok(oToggleOpenStateEventSpy.calledOnce, "Clicked a leaf: The toggleOpenState event was not called");

		oToggleOpenStateEventSpy.reset();
		oArrowDomRef = oTree.getItems()[1].$().find(".sapMTreeItemBaseExpander");
		oArrowDomRef.trigger("click");
		assert.ok(oToggleOpenStateEventSpy.notCalled, "Clicked a leaf: The toggleOpenState event was not called");

		//back to initial state
		assert.strictEqual(oTree.getItems().length, 4, "four nodes before tree expanding");

		oTree.focus();
		oArrow = Element.getElementById(oTree.getItems()[0].getId() + "-expander");
		oArrow.firePress();
		await nextUIUpdate();

		assert.strictEqual(oTree.getItems().length, 2, "two nodes displayed after tree collapsing");

		assert.ok(oToggleOpenStateEventSpy.calledOnce, "The toggleOpenState event was called once");
		assertToggleOpenStateParameters(assert, oTree, 0, false, oToggleOpenStateEventSpy._mEventParameters);

		oTree.detachToggleOpenState(oToggleOpenStateEventSpy);
	});

	QUnit.test("Expand to level and tree item expander tooltip test", async function(assert) {
		const oTree = this.oTree;
		const oBundle = Library.getResourceBundleFor("sap.m");
		assert.strictEqual(oTree.getItems()[0]._oExpanderControl.getTooltip(), oBundle.getText("TREE_ITEM_EXPAND_NODE"), "Tooltip is correctly set to the Expander control");
		oTree.expandToLevel(3);
		await nextUIUpdate();
		assert.ok(oTree.getItems()[0].getExpanded(),"node is expanded");
		assert.strictEqual(oTree.getItems()[0]._oExpanderControl.getTooltip(), oBundle.getText("TREE_ITEM_COLLAPSE_NODE"), "Tooltip for the Expander control updated correctly");
		assert.equal(oTree.getItems()[4].getLevel(), 3, "expand to level 3");
	});

	QUnit.test("Collapse all", function(assert) {
		const oTree = this.oTree;
		oTree.collapseAll();
		assert.ok(!oTree.getItems()[0].getExpanded(),"node is expanded");
		assert.equal(oTree.getItems().length, 2, "node is collapsed");
	});

	QUnit.test("Expand/collapse multiple nodes", async function(assert) {
		const oTree = this.oTree;
		oTree.expand([0,1]);
		await nextUIUpdate();

		assert.equal(oTree.getItems().length, 5, "multiple expanding success.");

		oTree.collapse([0,3]);
		await nextUIUpdate();

		assert.equal(oTree.getItems().length, 2, "multiple collapsing success.");
	});

	QUnit.module("API", {
		beforeEach: async function () {
			this.oTree = await createTree();
		},
		afterEach: function () {
			this.oTree.destroy();
			this.oTree = null;
		}
	});

	QUnit.test("isLeaf/isTopLevel/getExpanded", function(assert) {
		const oTree = this.oTree;
		oTree.focus();
		let oArrow = Element.getElementById(oTree.getItems()[0].getId() + "-expander");
		oArrow.firePress();
		assert.ok(oTree.getItems()[1].getParentNode().getId(), oTree.getItems()[0].getId(), "parent node is found.");

		assert.ok(!oTree.getItems()[0].isLeaf(), "first node is not leaf.");
		assert.ok(oTree.getItems()[1].isLeaf(), "second node is leaf.");

		assert.ok(oTree.getItems()[0].isTopLevel(), "first node is root.");
		assert.ok(!oTree.getItems()[1].isTopLevel(), "second node is not root.");

		oTree.focus();
		oArrow = Element.getElementById(oTree.getItems()[0].getId() + "-expander");
		oArrow.firePress();
		assert.ok(!oTree.getItems()[0].getExpanded(), "first node is not expanded");
		assert.ok(!oTree.getItems()[1].getExpanded(), "second node is not expanded");
	});

	QUnit.module("Keyboard Handling", {
		beforeEach: async function () {
			this.oTree = await createTree();
		},
		afterEach: function () {
			this.oTree.destroy();
			this.oTree = null;
		}
	});

	QUnit.test("Right + Left key", function(assert) {
		const oTree = this.oTree;
		const oToggleOpenStateEventSpy = sinon.spy(function(oEvent) {
			oToggleOpenStateEventSpy._mEventParameters = oEvent.mParameters;
		});
		oTree.attachToggleOpenState(oToggleOpenStateEventSpy);

		assert.ok(!oTree.getItems()[0].getExpanded(), "first node is not expanded");
		oTree.focus();
		const oArrowDomRef = oTree.getItems()[0].$();

		qutils.triggerKeydown(oArrowDomRef, KeyCodes.ARROW_RIGHT);
		assert.ok(oTree.getItems()[0].getExpanded(), "first node is expanded");
		assert.ok(oToggleOpenStateEventSpy.calledOnce, "The toggleOpenState event was called once");
		assertToggleOpenStateParameters(assert, oTree, 0, true, oToggleOpenStateEventSpy._mEventParameters);

		qutils.triggerKeydown(oArrowDomRef, KeyCodes.ARROW_RIGHT);
		assert.ok(oToggleOpenStateEventSpy.calledOnce, "The toggleOpenState event was not called as the node already was expanded");

		qutils.triggerKeydown(oArrowDomRef, KeyCodes.ARROW_LEFT);
		assert.ok(!oTree.getItems()[0].getExpanded(), "first node is not expanded");
		assert.ok(oToggleOpenStateEventSpy.calledTwice, "The toggleOpenState event was called twice");
		assertToggleOpenStateParameters(assert, oTree, 0, false, oToggleOpenStateEventSpy._mEventParameters);

		oTree.detachToggleOpenState(oToggleOpenStateEventSpy);
	});

	QUnit.module("Aggregation");

	QUnit.test("Validate aggregation", function(assert) {
		assert.throws(function () {
			const oTreeItem = new StandardListItem();
			const oTree = new Tree();
			oTree.addItem(oTreeItem);
		}, "Wrong aggregation object.");
	});

	QUnit.module("NoData", {
		beforeEach: async function () {
			this.oTree = new Tree();
			this.oTree.placeAt("content");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oTree.destroy();
			this.oTree = null;
		}
	});

	QUnit.test("Nodata should have the role treeitem", function(assert) {
		assert.equal(this.oTree.getDomRef("nodata").getAttribute("role"), "treeitem");
	});

	QUnit.module("Binding", {
		beforeEach: async function() {
			this.oTree = await createTree();
		},
		afterEach: function() {
			this.oTree.destroy();
			this.oTree = null;
		}
	});

	QUnit.test("data binding update", async function(assert) {
		const oTree = this.oTree;
		assert.ok(oTree.getItems()[0].$().find(".sapMTreeItemBaseExpander")[0].hasAttribute("data-sap-ui-icon-content"), "initial binding context.");

		oTree.getModel().setProperty("/", oData2);
		await nextUIUpdate();

		assert.ok(oTree.getItems()[0].$().hasClass("sapMTreeItemBaseLeaf"), "data changed");
		assert.ok(oTree.getItems()[0].$().find(".sapMTreeItemBaseExpander")[0].hasAttribute("data-sap-ui-icon-content"), "icon has correct source.");
	});

	QUnit.test("context length", function(assert) {
		const oTree = this.oTree;
		oTree.expandToLevel(3);
		assert.strictEqual(oTree.getItems().length, 10, "initial length is 10.");

		oTree.getModel().setSizeLimit(6);
		oTree.getModel().refresh();

		assert.strictEqual(oTree.getItems().length, 6, "new length is 6.");
	});

	QUnit.test("Sorting scenario", async function(assert) {
		const aTreeData = [{
			"title": "C",
			"titles": [
				{"title": "Subtitle C"}
			]
		}, {
			"title": "B",
			"titles": [
				{"title": "SubTitle B"}
			]
		}, {
			"title": "A"
		}];
		const oTree = this.oTree;

		oTree.getModel().setData(aTreeData);
		oTree.expandToLevel(1);
		await nextUIUpdate();

		// 2nd tree item is a leaf node
		const oSecondItem = oTree.getItems()[1];
		const oSecondItemDomRef = oSecondItem.getDomRef();
		assert.ok(!oSecondItem.isTopLevel(), "2nd item is not a top level node");
		assert.ok(oSecondItem.isLeaf(), "2nd item is a leaf node");
		assert.ok(oSecondItemDomRef.classList.contains("sapMTreeItemBaseChildren"), "Second item is a child node");
		assert.ok(oSecondItemDomRef.getAttribute("aria-level"), "2", "aria-level = 2");

		// sort tree items in ascending order
		const oBinding = oTree.getBinding("items");
		const oSorter = new Sorter("title", false);
		oBinding.sort(oSorter);
		await nextUIUpdate();

		// 2nd tree item becomes a top level node after sorting is applied
		assert.ok(oSecondItem.isTopLevel(), "2nd item is a top level node");
		assert.ok(!oSecondItem.isLeaf(), "2nd item is not a leaf node");
		assert.ok(!oSecondItemDomRef.classList.contains("sapMTreeItemBaseChildren"), "Second item is a top level node");
		assert.ok(oSecondItemDomRef.getAttribute("aria-level"), "1", "aria-level = 1");
	});

});