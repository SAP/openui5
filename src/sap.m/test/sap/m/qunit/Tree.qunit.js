/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"jquery.sap.global",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Sorter",
	"sap/m/StandardTreeItem",
	"sap/m/StandardListItem",
	"sap/m/Tree",
	"sap/m/library"
], function(createAndAppendDiv, jQuery, qutils, KeyCodes, JSONModel, Sorter, StandardTreeItem, StandardListItem, Tree, library) {
	"use strict";
	createAndAppendDiv("content");
	var styleElement = document.createElement("style");
	styleElement.textContent =
		"#content {" +
		"	height: 100%;" +
		"}" +
		"#mSAPUI5SupportMessage {" +
		"	display: none !important;" +
		"}";
	document.head.appendChild(styleElement);


	var IMAGE_PATH = "test-resources/sap/m/images/";

	var oData = [
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

	var oData2 = [
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

	var oTreeItem = new StandardTreeItem({title: "{text}", icon: "{ref}"});
	var oTree = new Tree();

	var oModel = new JSONModel();
	oTree.setModel(oModel);
	//set the data to the model
	oModel.setData(oData);
	oTree.bindItems("/", oTreeItem);
	//oTree.expandToLevel(6);
	oTree.placeAt("content");

	function assertToggleOpenStateParameters(assert, iIndex, bExpanded, mActualParameters) {
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

	QUnit.module("Initial Check");

	QUnit.test("Overview rendered", function(assert){
		assert.ok(jQuery.sap.domById("__item0-__tree0-0"), "initial render of first node");
		assert.ok(jQuery.sap.domById("__item0-__tree0-1"), "initial render of second node");
	});

	QUnit.module("Indentation");

	QUnit.test("indentation1", function(assert){
		assert.equal(oTree.getDeepestLevel(), 0, "deepestLevel");

		var oArrow = sap.ui.getCore().byId("__item0-__tree0-1-expander");
		oArrow.firePress();
		sap.ui.getCore().applyChanges();

		assert.equal(oTree.getDeepestLevel(), 1, "deepestLevel");
		assert.equal(sap.ui.getCore().byId("__item0-__tree0-1").$().css("padding-left"), "0px", "padding");
		assert.equal(sap.ui.getCore().byId("__item0-__tree0-2").$().css("padding-left"), "24px", "padding");

		oArrow = sap.ui.getCore().byId("__item0-__tree0-2-expander");
		oArrow.firePress();
		sap.ui.getCore().applyChanges();

		assert.equal(oTree.getDeepestLevel(), 2, "deepestLevel");
		assert.equal(sap.ui.getCore().byId("__item0-__tree0-1").$().css("padding-left"), "0px", "padding");
		assert.equal(sap.ui.getCore().byId("__item0-__tree0-2").$().css("padding-left"), "16px", "padding");
		assert.equal(sap.ui.getCore().byId("__item0-__tree0-3").$().css("padding-left"), "32px", "padding");

		oArrow = sap.ui.getCore().byId("__item0-__tree0-3-expander");
		oArrow.firePress();
		sap.ui.getCore().applyChanges();

		assert.equal(oTree.getDeepestLevel(), 3, "deepestLevel");
		assert.equal(sap.ui.getCore().byId("__item0-__tree0-1").$().css("padding-left"), "0px", "padding");
		assert.equal(sap.ui.getCore().byId("__item0-__tree0-2").$().css("padding-left"), "8px", "padding");
		assert.equal(sap.ui.getCore().byId("__item0-__tree0-3").$().css("padding-left"), "16px", "padding");
		assert.equal(sap.ui.getCore().byId("__item0-__tree0-4").$().css("padding-left"), "24px", "padding");

		oArrow = sap.ui.getCore().byId("__item0-__tree0-4-expander");
		oArrow.firePress();
		sap.ui.getCore().applyChanges();

		oArrow = sap.ui.getCore().byId("__item0-__tree0-5-expander");
		oArrow.firePress();
		sap.ui.getCore().applyChanges();

		oArrow = sap.ui.getCore().byId("__item0-__tree0-6-expander");
		oArrow.firePress();
		sap.ui.getCore().applyChanges();

		assert.equal(oTree.getDeepestLevel(), 6, "deepestLevel");
		assert.equal(sap.ui.getCore().byId("__item0-__tree0-1").$().css("padding-left"), "0px", "padding");
		assert.equal(sap.ui.getCore().byId("__item0-__tree0-2").$().css("padding-left"), "4px", "padding");
		assert.equal(sap.ui.getCore().byId("__item0-__tree0-3").$().css("padding-left"), "8px", "padding");
		assert.equal(sap.ui.getCore().byId("__item0-__tree0-4").$().css("padding-left"), "12px", "padding");
		assert.equal(sap.ui.getCore().byId("__item0-__tree0-5").$().css("padding-left"), "16px", "padding");
		assert.equal(sap.ui.getCore().byId("__item0-__tree0-6").$().css("padding-left"), "20px", "padding");

		// collapse
		var oArrowDomRef = sap.ui.getCore().byId("__item0-__tree0-2").$().find(".sapMTreeItemBaseExpander");
		oArrowDomRef.trigger("click");
		sap.ui.getCore().applyChanges();

		//expand
		oArrow = sap.ui.getCore().byId("__item0-__tree0-2-expander");
		oArrow.firePress();
		sap.ui.getCore().applyChanges();

		assert.equal(sap.ui.getCore().byId("__item0-__tree0-2").$().css("padding-left"), "4px", "padding");

		oTree.collapseAll();
	});

	QUnit.module("Selection");

	QUnit.test("Single selection", function(assert){
		oTree.setMode(library.ListMode.SingleSelect);
		oTree.getItems()[0].setSelected(true);
		assert.ok(oTree.getItems()[0].getSelected(),"tree item is selected.");
		assert.ok(oTree.getItems()[0].getItemNodeContext().nodeState.selected, "item context is selected");
	});

	QUnit.test("Multi selection", function(assert){
		oTree.setMode(library.ListMode.MultiSelect);
		oTree.getItems()[0].setSelected(true);
		oTree.getItems()[1].setSelected(true);
		assert.ok(oTree.getItems()[0].getSelected(),"tree item is selected.");
		assert.ok(oTree.getItems()[0].getItemNodeContext().nodeState.selected, "item context is selected");
		assert.ok(oTree.getItems()[1].getSelected(),"tree item is selected.");
		assert.ok(oTree.getItems()[1].getItemNodeContext().nodeState.selected, "item context is selected");
	});

	QUnit.test("Accessibility - custom announcement", function(assert) {
		var oTreeItem = oTree.getItems()[1];
		var sSelected = sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("LIST_ITEM_SELECTED");
		oTreeItem.focus();
		assert.equal(oTreeItem.getAccessibilityInfo().description, sSelected + "  Node2", "Custom announcement is added with current state");
	});

	QUnit.module("Expand/Collapse");

	QUnit.test("Expand", function(assert){
		var oToggleOpenStateEventSpy = sinon.spy(function(oEvent) {
			oToggleOpenStateEventSpy._mEventParameters = oEvent.mParameters;
		});
		oTree.attachToggleOpenState(oToggleOpenStateEventSpy);

		//initial state
		assert.strictEqual(oTree.getItems().length, 2, "two nodes displayed before tree expanding");

		oTree.focus();
		assert.strictEqual(oTree.getItems()[0].$().attr("aria-expanded"), "false", "aria-expanded is false");

		var oArrow = sap.ui.getCore().byId("__item0-__tree0-0-expander");
		oArrow.firePress();
		sap.ui.getCore().applyChanges();

		assert.strictEqual(oTree.getItems().length, 4, "four nodes displayed after tree expanding");

		assert.equal(oTree.getItems()[0].getLevel(), 0, "first level node is in level 0");
		assert.equal(oTree.getItems()[1].getLevel(), 1, "second node is in level 1");
		assert.strictEqual(oTree.getItems()[0].$().attr("aria-expanded"), "true", "aria-expanded is true");

		assert.ok(oToggleOpenStateEventSpy.calledOnce, "The toggleOpenState event was called once");
		assertToggleOpenStateParameters(assert, 0, true, oToggleOpenStateEventSpy._mEventParameters);

		var oArrowDomRef = oTree.getItems()[1].$().find(".sapMTreeItemBaseExpander");
		oArrowDomRef.trigger("click");
		assert.ok(oToggleOpenStateEventSpy.calledOnce, "Clicked a leaf: The toggleOpenState event was not called");

		oTree.detachToggleOpenState(oToggleOpenStateEventSpy);
		});

		QUnit.test("Collapse", function(assert){
		var oToggleOpenStateEventSpy = sinon.spy(function(oEvent) {
			oToggleOpenStateEventSpy._mEventParameters = oEvent.mParameters;
		});
		oTree.attachToggleOpenState(oToggleOpenStateEventSpy);

		var oArrowDomRef = oTree.getItems()[1].$().find(".sapMTreeItemBaseExpander");
		oArrowDomRef.trigger("click");
		assert.ok(oToggleOpenStateEventSpy.notCalled, "Clicked a leaf: The toggleOpenState event was not called");

		//back to initial state
		assert.strictEqual(oTree.getItems().length, 4, "four nodes before tree expanding");

		oTree.focus();
		var oArrow = sap.ui.getCore().byId("__item0-__tree0-0-expander");
		oArrow.firePress();
		sap.ui.getCore().applyChanges();

		assert.strictEqual(oTree.getItems().length, 2, "two nodes displayed after tree collapsing");

		assert.ok(oToggleOpenStateEventSpy.calledOnce, "The toggleOpenState event was called once");
		assertToggleOpenStateParameters(assert, 0, false, oToggleOpenStateEventSpy._mEventParameters);

		oTree.detachToggleOpenState(oToggleOpenStateEventSpy);
	});

	QUnit.test("Expand to level and tree item expander tooltip test", function(assert){
		var oBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");
		assert.strictEqual(oTree.getItems()[0]._oExpanderControl.getTooltip(), oBundle.getText("TREE_ITEM_EXPAND_NODE"), "Tooltip is correctly set to the Expander control");
		oTree.expandToLevel(3);
		sap.ui.getCore().applyChanges();
		assert.ok(oTree.getItems()[0].getExpanded(),"node is expanded");
		assert.strictEqual(oTree.getItems()[0]._oExpanderControl.getTooltip(), oBundle.getText("TREE_ITEM_COLLAPSE_NODE"), "Tooltip for the Expander control updated correctly");
		assert.equal(oTree.getItems()[4].getLevel(), 3, "expand to level 3");
	});

	QUnit.test("Collapse all", function(assert){
		oTree.collapseAll();
		assert.ok(!oTree.getItems()[0].getExpanded(),"node is expanded");
		assert.equal(oTree.getItems().length, 2, "node is collapsed");
	});

	QUnit.test("Expand/collapse multiple nodes", function(assert){
		oTree.expand([0,1]);
		sap.ui.getCore().applyChanges();

		assert.equal(oTree.getItems().length, 5, "multiple expanding success.");

		oTree.collapse([0,3]);
		sap.ui.getCore().applyChanges();

		assert.equal(oTree.getItems().length, 2, "multiple collapsing success.");
	});

	QUnit.module("Node structure");

	QUnit.test("ParentNode", function(assert){
		oTree.focus();
		var oArrow = sap.ui.getCore().byId("__item0-__tree0-0-expander");
		oArrow.firePress();
		assert.ok(oTree.getItems()[1].getParentNode().getId(),"__item0-__tree0-0","parent node is found.");
	});

	QUnit.test("Is leaf", function(assert){
		assert.ok(!oTree.getItems()[0].isLeaf(), "first node is not leaf.");
		assert.ok(oTree.getItems()[1].isLeaf(), "second node is leaf.");
	});

	QUnit.test("Is top level", function(assert){
		assert.ok(oTree.getItems()[0].isTopLevel(), "first node is root.");
		assert.ok(!oTree.getItems()[1].isTopLevel(), "second node is not root.");
	});

	QUnit.test("Expanded", function(assert){
		oTree.focus();
		var oArrow = sap.ui.getCore().byId("__item0-__tree0-0-expander");
		oArrow.firePress();
		assert.ok(!oTree.getItems()[0].getExpanded(), "first node is not expanded");
		assert.ok(!oTree.getItems()[1].getExpanded(), "second node is not expanded");
	});

	QUnit.module("Keyboard Handling");

	QUnit.test("Right + Left key", function(assert){
		var oToggleOpenStateEventSpy = sinon.spy(function(oEvent) {
			oToggleOpenStateEventSpy._mEventParameters = oEvent.mParameters;
		});
		oTree.attachToggleOpenState(oToggleOpenStateEventSpy);

		assert.ok(!oTree.getItems()[0].getExpanded(), "first node is not expanded");
		oTree.focus();
		var oArrowDomRef = oTree.getItems()[0].$();

		qutils.triggerKeydown(oArrowDomRef, KeyCodes.ARROW_RIGHT);
		assert.ok(oTree.getItems()[0].getExpanded(), "first node is expanded");
		assert.ok(oToggleOpenStateEventSpy.calledOnce, "The toggleOpenState event was called once");
		assertToggleOpenStateParameters(assert, 0, true, oToggleOpenStateEventSpy._mEventParameters);

		qutils.triggerKeydown(oArrowDomRef, KeyCodes.ARROW_RIGHT);
		assert.ok(oToggleOpenStateEventSpy.calledOnce, "The toggleOpenState event was not called as the node already was expanded");

		qutils.triggerKeydown(oArrowDomRef, KeyCodes.ARROW_LEFT);
		assert.ok(!oTree.getItems()[0].getExpanded(), "first node is not expanded");
		assert.ok(oToggleOpenStateEventSpy.calledTwice, "The toggleOpenState event was called twice");
		assertToggleOpenStateParameters(assert, 0, false, oToggleOpenStateEventSpy._mEventParameters);

		oTree.detachToggleOpenState(oToggleOpenStateEventSpy);
		});

		QUnit.module("Icon");

		QUnit.test("tree item with icon", function(assert){
		assert.ok(jQuery.sap.domById("__item0-__tree0-0-icon"), "icon is rendered");

		var oImage = sap.ui.getCore().byId("__item0-__tree0-0-icon");
		assert.strictEqual(oImage.getSrc(), IMAGE_PATH + "action.png", "icon source is correct");
	});

	QUnit.module("Aggregation");

	QUnit.test("Validate aggregation", function(assert){
		assert.throws(function () {
			var oTreeItem = new StandardListItem();
			var oTree = new Tree();
			oTree.addItem(oTreeItem);
		}, "Wrong aggregation object.");
	});

	QUnit.module("Binding", {
		beforeEach: function() {
			var oTemplate = new StandardTreeItem({
				title: "{text}"
			});

			var oTree = new Tree();

			var oModel = new JSONModel();
			oTree.setModel(oModel, "odata");

			oTree.bindItems({
				path: "/",
				template: oTemplate
			});

			oTree.placeAt("content");
			sap.ui.getCore().applyChanges();

			this.oTree = oTree;
		},

		afterEach: function() {
			this.oTree.destroy();
		}
	});

	QUnit.test("data binding update", function(assert){
		assert.ok(oTree.getItems()[0].$().find(".sapMTreeItemBaseExpander")[0].hasAttribute("data-sap-ui-icon-content"), "initial binding context.");

		oModel.setProperty("/", oData2);
		sap.ui.getCore().applyChanges();

		assert.ok(oTree.getItems()[0].$().hasClass("sapMTreeItemBaseLeaf"), "data changed");
		assert.ok(oTree.getItems()[0].$().find(".sapMTreeItemBaseExpander")[0].hasAttribute("data-sap-ui-icon-content"), "icon has correct source.");
	});

	QUnit.test("context length", function(assert){
		assert.strictEqual(oTree.getItems().length, 10, "initial length is 10.");

		oTree.getModel().setSizeLimit(6);
		oTree.getModel().refresh();

		assert.strictEqual(oTree.getItems().length, 6, "new length is 6.");
	});

	QUnit.test("Sorting scenario", function(assert) {
		var aTreeData = [{
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

		var oModel = new JSONModel();
		oModel.setData(aTreeData);

		var oTree = new Tree();
		oTree.setModel(oModel);
		var oStandardTreeItem = new StandardTreeItem({
			title: "{title}"
		});

		oTree.bindItems({
			path: "/",
			template: oStandardTreeItem,
			parameters: {
				numberOfExpandedLevels: 1
			}
		});

		oTree.placeAt("content");
		sap.ui.getCore().applyChanges();

		// 2nd tree item is a leaf node
		var oSecondItem = oTree.getItems()[1];
		var oSecondItemDomRef = oSecondItem.getDomRef();
		assert.ok(!oSecondItem.isTopLevel(), "2nd item is not a top level node");
		assert.ok(oSecondItem.isLeaf(), "2nd item is a leaf node");
		assert.ok(oSecondItemDomRef.classList.contains("sapMTreeItemBaseChildren"), "Second item is a child node");
		assert.ok(oSecondItemDomRef.getAttribute("aria-level"), "2", "aria-level = 2");

		// sort tree items in ascending order
		var oBinding = oTree.getBinding("items");
		var oSorter = new Sorter("title", false);
		oBinding.sort(oSorter);
		sap.ui.getCore().applyChanges();

		// 2nd tree item becomes a top level node after sorting is applied
		assert.ok(oSecondItem.isTopLevel(), "2nd item is a top level node");
		assert.ok(!oSecondItem.isLeaf(), "2nd item is not a leaf node");
		assert.ok(!oSecondItemDomRef.classList.contains("sapMTreeItemBaseChildren"), "Second item is a top level node");
		assert.ok(oSecondItemDomRef.getAttribute("aria-level"), "1", "aria-level = 1");

		oTree.destroy();
	});

});