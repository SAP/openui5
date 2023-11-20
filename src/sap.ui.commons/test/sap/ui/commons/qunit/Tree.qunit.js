/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/commons/Tree",
	"sap/ui/commons/TreeNode",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/jquery",
	"sap/ui/commons/library",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/events/KeyCodes"
], function(
	qutils,
	createAndAppendDiv,
	Tree,
	TreeNode,
	JSONModel,
	jQuery,
	commonsLibrary,
	Filter,
	FilterOperator,
	KeyCodes
) {
	"use strict";

	// shortcut for sap.ui.commons.TreeSelectionMode
	var TreeSelectionMode = commonsLibrary.TreeSelectionMode;


	// prepare DOM
	createAndAppendDiv(["target1", "target2", "target3", "target4", "target5"]);



	var sStandardTreeId 	= "tree1";
	var sTransparentTreeId 	= "tree2";

	function createStandardTree () {
		var oTree1 = new Tree(sStandardTreeId, {title:"Tree with Header", width:"90%",height:"300px",showHeader:true, showHorizontalScrollbar:false});

		var oNode11 = new TreeNode("node11", {text:"Root 1",icon:"test-resources/sap/ui/commons/images/tree/library.gif"});

		var oNode13 = new TreeNode("node13", {text:"Node 1.1", expanded:false, isSelected: true});

		var oNode15 = new TreeNode("node15", {text:"Node 1.1.1", hasExpander:true});
		oNode15.attachToggleOpenState(function addSubNodes(oEvent){

			var oNode15Child = new TreeNode({text:"Dyna Node"});
			oNode15.addNode(oNode15Child);

		});
		oNode13.addNode(oNode15);

		oNode11.addNode(oNode13);

		var oNode14 = new TreeNode("node14", {text:"Node 1.2",icon:"test-resources/sap/ui/commons/images/tree/Image.gif"});

		var oNode16 = new TreeNode("node16", {text:"Node 1.2.1"});

		var oNode17 = new TreeNode("node17", {text:"Really long text for Node 1.2.1.1"});
		oNode16.addNode(oNode17);

		oNode14.addNode(oNode16);

		oNode11.addNode(oNode14);

		oTree1.addNode(oNode11);

		var oNode12 = new TreeNode("node12", {text:"Root 2"});
		oTree1.addNode(oNode12);

	return oTree1;
	}

	function createTransparentTree () {
		var oTree2 = new Tree(sTransparentTreeId, {title:"Tree with Header", width:"200px",height:"300px", showHorizontalScrollbar:false, showHeader:false});

		var oNode21 = new TreeNode("node21", {text:"Root 1"});

		var oNode23 = new TreeNode("node23", {text:"Node 1.1", expanded:false});

		var oNode25 = new TreeNode("node25", {text:"Node 1.1.1"});
		oNode23.addNode(oNode25);

		oNode21.addNode(oNode23);

		var oNode24 = new TreeNode("node24", {text:"Node 1.2"});

		var oNode26 = new TreeNode("node26", {text:"Node 1.2.1"});

		var oNode27 = new TreeNode("node27", {text:"Really long text for Node 1.2.1.1"});
		oNode26.addNode(oNode27);

		oNode24.addNode(oNode26);

		oNode21.addNode(oNode24);

		oTree2.addNode(oNode21);

		var oNode22 = new TreeNode("node22", {text:"Root 2"});
		oTree2.addNode(oNode22);

	return oTree2;
	}

	function createBoundTree () {
		var oModel = new JSONModel({
			tree: {
				title: "Root",
				children: [
					{
						title: "Node 1",
						children: [
							{
								title: "Node 1.1"
							},
							{
								title: "Node 1.2"
							},
							{
								title: "Node 1.3"
							}
						]
					},
					{
						title: "Node 2"
					},
					{
						title: "Node 3"
					}
				]
			}
		});
		var oTree = new Tree("tree3", {
			title:"Tree with data binding",
			width:"200px",
			height:"300px",
			showHorizontalScrollbar:false,
			showHeader:false,
			nodes: {
				path: "/tree",
				template: new TreeNode({
					text: "{title}"
				}),
				parameters: {
					arrayNames: ["children"]
				}
			},
			models: oModel
		});
		return oTree;
	}

	function createBoundTreeNamedModel () {
		var oModel = new JSONModel({
			tree: {
				title: "Root",
				children: [
					{
						title: "Node 1",
						children: [
							{
								title: "Node 1.1"
							},
							{
								title: "Node 1.2"
							},
							{
								title: "Node 1.3"
							}
						]
					},
					{
						title: "Node 2"
					},
					{
						title: "Node 3"
					}
				]
			}
		});
		var oTree = new Tree("tree4", {
			title:"Tree with data binding",
			width:"200px",
			height:"300px",
			showHorizontalScrollbar:false,
			showHeader:false,
			nodes: {
				path: "model>/tree",
				template: new TreeNode({
					text: "{model>title}"
				}),
				parameters: {
					arrayNames: ["children"]
				}
			},
			models: {
				model: oModel
			}
		});
		return oTree;
	}


	var oStandardTree = createStandardTree();
	oStandardTree.placeAt("target1");

	var oTransparentTree = createTransparentTree();
	oTransparentTree.placeAt("target2");

	var oBoundTree = createBoundTree();
	oBoundTree.placeAt("target3");

	var oBoundTreeNamedModel = createBoundTreeNamedModel();
	oBoundTreeNamedModel.placeAt("target4");

	function checkSelectedNodes(aNodes, aExpectedIds) {
		var iIndex;
		if (aNodes.length != aExpectedIds.length) {
			return false;
		}
		for (var i = 0; i < aNodes.length; i++) {
			iIndex = aExpectedIds.indexOf(aNodes[i].getId());
			if (iIndex >= 0) {
				aExpectedIds.splice(iIndex, 1);
			} else {
				return false;
			}
		}
		return true;
	}

	/******* QUnit Tests *******/
	QUnit.module("Tree", {
	  beforeEach: function() {

		  oStandardTree.focus();

	  },
	  afterEach: function() {
		//this.oStandardTree = null;
	  }
	});


	QUnit.module("Rendering");

	QUnit.test("Rendering of Standard tree", function(assert) {

		assert.notEqual(oStandardTree.getDomRef(), null, "Tree is rendered.");

		assert.notEqual(oStandardTree.getDomRef("Header"), null, "Tree header is there.");

		assert.notEqual(oStandardTree.getDomRef("TreeCont"), null, "Tree content is there");

	});

	QUnit.test("Rendering of transparent tree", function(assert) {

		assert.notEqual(oTransparentTree.getDomRef(), null, "Tree is rendered.");

		assert.equal(oTransparentTree.getDomRef("Header"), null, "Tree header is not there.");

		assert.notEqual(oTransparentTree.getDomRef("TreeCont"), null, "Tree content is there");
	});

	QUnit.module("Nodes public methods");

	QUnit.test("Single Collapse and Expand", function(assert) {


		//Collapse
		var root1 = sap.ui.getCore().getControl("node11");

		assert.ok( root1.getExpanded(), "Root 1 is expanded at first");
		root1.collapse();
		assert.ok( !root1.getExpanded(), "Root 1 is now collapsed");

		//Expand
		var node13 = sap.ui.getCore().getControl("node13");
		assert.ok( !node13.getExpanded(), "Node 1.1 is collapsed at first");
		node13.expand();
		assert.ok( node13.getExpanded(), "Node 1.1 is now expanded");
	});

	QUnit.test("Node selection legacy", function(assert) {
		oStandardTree.expandAll();
		var initialSelection = sap.ui.getCore().getControl("node13");
		assert.ok( initialSelection.getIsSelected(), "Node 1.1 is selected");

		var newSelection = sap.ui.getCore().getControl("node14");
		newSelection.select();
		assert.ok( newSelection.getIsSelected(), "Node 1.3 is now selected");
		assert.ok( !initialSelection.getIsSelected(), "Node 1.1 is not selected anymore");

		initialSelection.setIsSelected(true);
		assert.ok( newSelection.getIsSelected(), "Node 1.3 is now selected");
		assert.ok( initialSelection.getIsSelected(), "Node 1.1 is selected as well");
	});

	QUnit.test("Node selection single", function(assert) {
		oStandardTree.expandAll();
		oStandardTree.setSelectionMode("Single");

		var initialSelection = sap.ui.getCore().getControl("node13");
		initialSelection.select();
		assert.ok( initialSelection.getIsSelected(), "Node 1.1 is selected");

		var newSelection = sap.ui.getCore().getControl("node14");
		newSelection.select();
		assert.ok( newSelection.getIsSelected(), "Node 1.3 is now selected");
		assert.ok( !initialSelection.getIsSelected(), "Node 1.1 is not selected anymore");

		initialSelection.setIsSelected(true);
		assert.ok( !newSelection.getIsSelected(), "Node 1.3 is not selected anymore");
		assert.ok( initialSelection.getIsSelected(), "Node 1.1 is selected again");
	});

	QUnit.test("Node selection multi", function(assert) {
		oStandardTree.expandAll();
		oStandardTree.setSelectionMode("Multi");
		var initialSelection = sap.ui.getCore().getControl("node13");
		initialSelection.select();
		assert.ok( initialSelection.getIsSelected(), "Node 1.1 is selected");

		var newSelection = sap.ui.getCore().getControl("node14");
		newSelection.select();
		assert.ok( newSelection.getIsSelected(), "Node 1.3 is now selected");
		assert.ok( !initialSelection.getIsSelected(), "Node 1.1 is not selected anymore");

		initialSelection.setIsSelected(true);
		assert.ok( newSelection.getIsSelected(), "Node 1.3 is now selected");
		assert.ok( initialSelection.getIsSelected(), "Node 1.1 is selected as well");
	});

	QUnit.test("Node selection legacy with context", function(assert) {
		var oModel = new JSONModel({}),
			oContext = oModel.createBindingContext("/");

		oStandardTree.setBindingContext(oContext);
		oStandardTree.expandAll();
		var initialSelection = sap.ui.getCore().getControl("node13");
		assert.ok( initialSelection.getIsSelected(), "Node 1.1 is selected");

		var newSelection = sap.ui.getCore().getControl("node14");
		newSelection.select();
		assert.ok( newSelection.getIsSelected(), "Node 1.3 is now selected");
		assert.ok( !initialSelection.getIsSelected(), "Node 1.1 is not selected anymore");

		initialSelection.setIsSelected(true);
		assert.ok( newSelection.getIsSelected(), "Node 1.3 is now selected");
		assert.ok( initialSelection.getIsSelected(), "Node 1.1 is selected as well");
		oStandardTree.setBindingContext(null);
	});

	QUnit.test("Node selection single with context", function(assert) {
		var oModel = new JSONModel({}),
			oContext = oModel.createBindingContext("/");

		oStandardTree.setBindingContext(oContext);
		oStandardTree.expandAll();
		oStandardTree.setSelectionMode("Single");

		var initialSelection = sap.ui.getCore().getControl("node13");
		initialSelection.select();
		assert.ok( initialSelection.getIsSelected(), "Node 1.1 is selected");

		var newSelection = sap.ui.getCore().getControl("node14");
		newSelection.select();
		assert.ok( newSelection.getIsSelected(), "Node 1.3 is now selected");
		assert.ok( !initialSelection.getIsSelected(), "Node 1.1 is not selected anymore");

		initialSelection.setIsSelected(true);
		assert.ok( !newSelection.getIsSelected(), "Node 1.3 is not selected anymore");
		assert.ok( initialSelection.getIsSelected(), "Node 1.1 is selected again");
		oStandardTree.setBindingContext(null);
	});

	QUnit.test("Node selection multi with context", function(assert) {
		var oModel = new JSONModel({}),
			oContext = oModel.createBindingContext("/");

		oStandardTree.setBindingContext(oContext);
		oStandardTree.expandAll();
		oStandardTree.setSelectionMode("Multi");
		var initialSelection = sap.ui.getCore().getControl("node13");
		initialSelection.select();
		assert.ok( initialSelection.getIsSelected(), "Node 1.1 is selected");

		var newSelection = sap.ui.getCore().getControl("node14");
		newSelection.select();
		assert.ok( newSelection.getIsSelected(), "Node 1.3 is now selected");
		assert.ok( !initialSelection.getIsSelected(), "Node 1.1 is not selected anymore");

		initialSelection.setIsSelected(true);
		assert.ok( newSelection.getIsSelected(), "Node 1.3 is now selected");
		assert.ok( initialSelection.getIsSelected(), "Node 1.1 is selected as well");
		oStandardTree.setBindingContext(null);
	});

	QUnit.test("Node selection single databinding", function(assert) {
		oBoundTree.expandAll();
		oBoundTree.setSelectionMode("Single");

		var initialSelection = oBoundTree.getNodes()[0];
		initialSelection.select();
		assert.ok( initialSelection.getIsSelected(), "Node 1 is selected");

		var newSelection = oBoundTree.getNodes()[1];
		newSelection.select();
		assert.ok( newSelection.getIsSelected(), "Node 2 is now selected");
		assert.ok( !initialSelection.getIsSelected(), "Node 1 is not selected anymore");

		initialSelection.setIsSelected(true);
		assert.ok( !newSelection.getIsSelected(), "Node 2 is not selected anymore");
		assert.ok( initialSelection.getIsSelected(), "Node 1 is selected again");

		oBoundTree.getBinding("nodes").refresh();
		initialSelection = oBoundTree.getNodes()[0];
		newSelection = oBoundTree.getNodes()[1];
		assert.ok( initialSelection.getIsSelected(), "Node 1 is selected after refresh");
		assert.ok( !newSelection.getIsSelected(), "Node 2 is not selected after refresh");

		oBoundTree.getBinding("nodes").refresh();
		initialSelection = oBoundTree.getNodes()[0];
		newSelection = oBoundTree.getNodes()[1];
		assert.ok( initialSelection.getIsSelected(), "Node 1 is selected after second refresh");
		assert.ok( !newSelection.getIsSelected(), "Node 2 is not selected after second refresh");
	});

	QUnit.test("Node selection multi databinding", function(assert) {
		oBoundTree.expandAll();
		oBoundTree.setSelectionMode("Multi");
		var initialSelection = oBoundTree.getNodes()[0];
		initialSelection.select();
		assert.ok( initialSelection.getIsSelected(), "Node 1 is selected");

		var newSelection = oBoundTree.getNodes()[1];
		newSelection.select();
		assert.ok( newSelection.getIsSelected(), "Node 2 is now selected");
		assert.ok( !initialSelection.getIsSelected(), "Node 1 is not selected anymore");

		initialSelection.setIsSelected(true);
		assert.ok( newSelection.getIsSelected(), "Node 1 is now selected");
		assert.ok( initialSelection.getIsSelected(), "Node 2 is selected as well");

		oBoundTree.getBinding("nodes").refresh();
		initialSelection = oBoundTree.getNodes()[0];
		newSelection = oBoundTree.getNodes()[1];
		assert.ok( initialSelection.getIsSelected(), "Node 1 is selected after refresh");
		assert.ok( newSelection.getIsSelected(), "Node 2 is selected after refresh");

		oBoundTree.getBinding("nodes").refresh();
		initialSelection = oBoundTree.getNodes()[0];
		newSelection = oBoundTree.getNodes()[1];
		assert.ok( initialSelection.getIsSelected(), "Node 1 is selected after second refresh");
		assert.ok( newSelection.getIsSelected(), "Node 2 is selected after second refresh");

	});

	QUnit.test("Node selection single databinding with named model", function(assert) {
		oBoundTreeNamedModel.expandAll();
		oBoundTreeNamedModel.setSelectionMode("Single");

		var initialSelection = oBoundTreeNamedModel.getNodes()[0];
		initialSelection.select();
		assert.ok( initialSelection.getIsSelected(), "Node 1 is selected");

		var newSelection = oBoundTreeNamedModel.getNodes()[1];
		newSelection.select();
		assert.ok( newSelection.getIsSelected(), "Node 2 is now selected");
		assert.ok( !initialSelection.getIsSelected(), "Node 1 is not selected anymore");

		initialSelection.setIsSelected(true);
		assert.ok( !newSelection.getIsSelected(), "Node 2 is not selected anymore");
		assert.ok( initialSelection.getIsSelected(), "Node 1 is selected again");

		oBoundTreeNamedModel.getBinding("nodes").refresh();
		initialSelection = oBoundTreeNamedModel.getNodes()[0];
		newSelection = oBoundTreeNamedModel.getNodes()[1];
		assert.ok( initialSelection.getIsSelected(), "Node 1 is selected after refresh");
		assert.ok( !newSelection.getIsSelected(), "Node 2 is not selected after refresh");

		oBoundTreeNamedModel.getBinding("nodes").refresh();
		initialSelection = oBoundTreeNamedModel.getNodes()[0];
		newSelection = oBoundTreeNamedModel.getNodes()[1];
		assert.ok( initialSelection.getIsSelected(), "Node 1 is selected after second refresh");
		assert.ok( !newSelection.getIsSelected(), "Node 2 is not selected after second refresh");
	});

	QUnit.test("Node selection multi databinding with named model", function(assert) {
		oBoundTreeNamedModel.expandAll();
		oBoundTreeNamedModel.setSelectionMode("Multi");
		var initialSelection = oBoundTreeNamedModel.getNodes()[0];
		initialSelection.select();
		assert.ok( initialSelection.getIsSelected(), "Node 1 is selected");

		var newSelection = oBoundTreeNamedModel.getNodes()[1];
		newSelection.select();
		assert.ok( newSelection.getIsSelected(), "Node 2 is now selected");
		assert.ok( !initialSelection.getIsSelected(), "Node 1 is not selected anymore");

		initialSelection.setIsSelected(true);
		assert.ok( newSelection.getIsSelected(), "Node 1 is now selected");
		assert.ok( initialSelection.getIsSelected(), "Node 2 is selected as well");

		oBoundTreeNamedModel.getBinding("nodes").refresh();
		initialSelection = oBoundTreeNamedModel.getNodes()[0];
		newSelection = oBoundTreeNamedModel.getNodes()[1];
		assert.ok( initialSelection.getIsSelected(), "Node 1 is selected after refresh");
		assert.ok( newSelection.getIsSelected(), "Node 2 is selected after refresh");

		oBoundTreeNamedModel.getBinding("nodes").refresh();
		initialSelection = oBoundTreeNamedModel.getNodes()[0];
		newSelection = oBoundTreeNamedModel.getNodes()[1];
		assert.ok( initialSelection.getIsSelected(), "Node 1 is selected after second refresh");
		assert.ok( newSelection.getIsSelected(), "Node 2 is selected after second refresh");

	});

	QUnit.test("Node selection events single", function(assert) {
		var handler,
			node12 = sap.ui.getCore().getControl("node12"),
			node16 = sap.ui.getCore().getControl("node16"),
			node17 = sap.ui.getCore().getControl("node17");
		oStandardTree.setSelectionMode("Single");
		node12.select();

		handler = function(oEvent) {
			assert.equal(oEvent.getParameter("node").getId(), "node16", "Event parameter contains Node 1.2.1");
		};
		oStandardTree.attachSelect(handler);
		qutils.triggerEvent("click", node16.getDomRef().firstChild, {button: 0});
		oStandardTree.detachSelect(handler);
		assert.ok( node16.getIsSelected(), "Node 1.2.1 is selected");
		assert.ok( !node17.getIsSelected(), "Node 1.2.1.1 is not selected");
		assert.ok( !node12.getIsSelected(), "Root 2 is not selected");

		handler = function(oEvent) {
			assert.equal(oEvent.getParameter("node").getId(), "node12", "Event parameter contains Root 2");
		};
		oStandardTree.attachSelect(handler);
		qutils.triggerEvent("click", node12.getDomRef().firstChild, {button: 0});
		oStandardTree.detachSelect(handler);
		assert.ok( !node16.getIsSelected(), "Node 1.2.1 is selected");
		assert.ok( !node17.getIsSelected(), "Node 1.2.1.1 is not selected");
		assert.ok( node12.getIsSelected(), "Root 2 is not selected");
	});

	QUnit.test("Node selection events multi", function(assert) {
		var handler,
			node12 = sap.ui.getCore().getControl("node12"),
			node16 = sap.ui.getCore().getControl("node16"),
			node17 = sap.ui.getCore().getControl("node17");
		oStandardTree.setSelectionMode("Multi");

		// Selection without modifiers
		node12.select();

		handler = function(oEvent) {
			assert.ok(checkSelectedNodes(oEvent.getParameter("nodes"), ["node16"]), "Selected nodes as expected");
		};
		oStandardTree.attachSelectionChange(handler);
		qutils.triggerEvent("click", node16.getDomRef().firstChild, {button: 0});
		oStandardTree.detachSelectionChange(handler);
		assert.ok( node16.getIsSelected(), "Node 1.2.1 is selected");
		assert.ok( !node17.getIsSelected(), "Node 1.2.1.1 is not selected");
		assert.ok( !node12.getIsSelected(), "Root 2 is not selected");

		handler = function(oEvent) {
			assert.ok(checkSelectedNodes(oEvent.getParameter("nodes"), ["node12"]), "Selected nodes as expected");
		};
		oStandardTree.attachSelectionChange(handler);
		qutils.triggerEvent("click", node12.getDomRef().firstChild, {button: 0});
		oStandardTree.detachSelectionChange(handler);
		assert.ok( !node16.getIsSelected(), "Node 1.2.1 is selected");
		assert.ok( !node17.getIsSelected(), "Node 1.2.1.1 is not selected");
		assert.ok( node12.getIsSelected(), "Root 2 is not selected");

		// Selection with Ctrl-Key
		node12.select();

		handler = function(oEvent) {
			assert.equal(oEvent.getParameter("nodes").length, 0, "Event parameter nodes contains 0 entries");
		};
		oStandardTree.attachSelectionChange(handler);
		qutils.triggerEvent("click", node12.getDomRef().firstChild, {button: 0, ctrlKey: true});
		oStandardTree.detachSelectionChange(handler);
		assert.ok( !node16.getIsSelected(), "Node 1.2.1 is not selected");
		assert.ok( !node17.getIsSelected(), "Node 1.2.1.1 is not selected");
		assert.ok( !node12.getIsSelected(), "Root 2 is not selected");

		handler = function(oEvent) {
			assert.ok(checkSelectedNodes(oEvent.getParameter("nodes"), ["node12"]), "Selected nodes as expected");
		};
		oStandardTree.attachSelectionChange(handler);
		qutils.triggerEvent("click", node12.getDomRef().firstChild, {button: 0, ctrlKey: true});
		oStandardTree.detachSelectionChange(handler);
		assert.ok( !node16.getIsSelected(), "Node 1.2.1 is not selected");
		assert.ok( !node17.getIsSelected(), "Node 1.2.1.1 is not selected");
		assert.ok( node12.getIsSelected(), "Root 2 is selected");

		handler = function(oEvent) {
			assert.ok(checkSelectedNodes(oEvent.getParameter("nodes"), ["node12", "node16"]), "Selected nodes as expected");
		};
		oStandardTree.attachSelectionChange(handler);
		qutils.triggerEvent("click", node16.getDomRef().firstChild, {button: 0, ctrlKey: true});
		oStandardTree.detachSelectionChange(handler);
		assert.ok( node16.getIsSelected(), "Node 1.2.1 is selected");
		assert.ok( !node17.getIsSelected(), "Node 1.2.1.1 is not selected");
		assert.ok( node12.getIsSelected(), "Root 2 is selected");

		// Selection with Shift-Key
		node16.select();

		handler = function(oEvent) {
			assert.ok(checkSelectedNodes(oEvent.getParameter("nodes"), ["node12","node16","node17"]), "Selected nodes as expected");
		};
		oStandardTree.attachSelectionChange(handler);
		qutils.triggerEvent("click", node12.getDomRef().firstChild, {button: 0, shiftKey: true});
		oStandardTree.detachSelectionChange(handler);
		assert.ok( node16.getIsSelected(), "Node 1.2.1 is selected");
		assert.ok( node17.getIsSelected(), "Node 1.2.1.1 is selected");
		assert.ok( node12.getIsSelected(), "Root 2 is selected");

		handler = function(oEvent) {
			assert.ok(checkSelectedNodes(oEvent.getParameter("nodes"), ["node12"]), "Selected nodes as expected");
		};
		oStandardTree.attachSelectionChange(handler);
		qutils.triggerEvent("click", node12.getDomRef().firstChild, {button: 0});
		oStandardTree.detachSelectionChange(handler);
		assert.ok( !node16.getIsSelected(), "Node 1.2.1 is not selected");
		assert.ok( !node17.getIsSelected(), "Node 1.2.1.1 is not selected");
		assert.ok( node12.getIsSelected(), "Root 2 is selected");

		handler = function(oEvent) {
			assert.ok(checkSelectedNodes(oEvent.getParameter("nodes"), ["node12","node16","node17"]), "Selected nodes as expected");
		};
		oStandardTree.attachSelectionChange(handler);
		qutils.triggerEvent("click", node16.getDomRef().firstChild, {button: 0, shiftKey: true});
		oStandardTree.detachSelectionChange(handler);
		assert.ok( node16.getIsSelected(), "Node 1.2.1 is selected");
		assert.ok( node17.getIsSelected(), "Node 1.2.1.1 is selected");
		assert.ok( node12.getIsSelected(), "Root 2 is selected");

	});


	QUnit.module("Tree public methods");

	QUnit.test("Collapse all", function(assert) {

		oStandardTree.collapseAll();

		var foundNodeExpanded = false;
		var aNodes = oStandardTree.getNodes();

		//TODO: check only 1st level
		for (var i = 0; i < aNodes.length; i++){
			if (aNodes[i].getExpanded()){
				foundNodeExpanded = true;
			}
		}
		assert.ok( !foundNodeExpanded, "All nodes are now collapsed");
	});

	QUnit.test("Expand all", function(assert) {

		oStandardTree.expandAll();

		var foundNodeCollapsed = false;
		var aNodes = oStandardTree.getNodes();

		//TODO: check only 1st level!
		for (var i = 0; i < aNodes.length; i++){
			if (!aNodes[i].getExpanded()){
				foundNodeCollapsed = true;
			}
		}
		assert.ok( !foundNodeCollapsed, "All nodes are now expanded");
	});

	QUnit.module("Keyboard support");

	QUnit.test("Space/Enter", function(assert) {
		oStandardTree.expandAll();

		qutils.triggerKeyboardEvent("node11", KeyCodes.ENTER, false, false, false);

		assert.equal( oStandardTree.getSelection().getId(), "node11",  "New selection is set");

	});

	QUnit.test("Arrow keys", function(assert) {
		var done = assert.async();
		sap.ui.getCore().getControl("node11").focus();

		setTimeout(function(){
			qutils.triggerKeyboardEvent(sStandardTreeId, KeyCodes.ARROW_DOWN, false, false, false);
			setTimeout(function(){
				assert.equal( jQuery(document.activeElement).first().attr("id"), "node13",  "Focus is down one node");
				qutils.triggerKeyboardEvent(sStandardTreeId, KeyCodes.ARROW_UP, false, false, false);
				setTimeout(function(){
					assert.equal( jQuery(document.activeElement).first().attr("id"), "node11",  "Focus is up one node");
					qutils.triggerKeyboardEvent("node11", KeyCodes.ARROW_LEFT, false, false, false);
					setTimeout(function(){
						assert.equal( sap.ui.getCore().getControl("node11").getExpanded(), false,  "Node is collapsed");
						qutils.triggerKeyboardEvent("node11", KeyCodes.ARROW_RIGHT, false, false, false);
						setTimeout(function(){
							assert.equal( sap.ui.getCore().getControl("node11").getExpanded(), true,  "Node is expanded");
							done();
						}, 100);
					}, 100);
				}, 100);
			}, 100);
		}, 100);
	});

	QUnit.test("Plus/Minus", function(assert) {

		qutils.triggerKeyboardEvent("node11", KeyCodes.NUMPAD_MINUS, false, false, false);

		assert.ok( !sap.ui.getCore().getControl("node11").getExpanded(), "Root is collapsed");

		qutils.triggerKeyboardEvent("node11", KeyCodes.NUMPAD_PLUS, false, false, false);

		assert.ok( sap.ui.getCore().getControl("node11").getExpanded(), "Root is expanded");

	});

	QUnit.test("Asterisk", function(assert) {

		qutils.triggerKeyboardEvent(sStandardTreeId, KeyCodes.NUMPAD_ASTERISK, false, false, false);

		var foundNodeExpanded = false;
		var aNodes = oStandardTree.getNodes();
		var i;

		//TODO: check only 1st level
		for (i = 0; i < aNodes.length; i++){
			if (aNodes[i].getExpanded()){
				foundNodeExpanded = true;
			}
		}
		assert.ok( !foundNodeExpanded, "All nodes are now collapsed");

		qutils.triggerKeyboardEvent(sStandardTreeId, KeyCodes.NUMPAD_ASTERISK, false, false, false);

		var foundNodeCollapsed = false;
		aNodes = oStandardTree.getNodes();

		//TODO: check only 1st level!
		for (i = 0; i < aNodes.length; i++){
			if (!aNodes[i].getExpanded()){
				foundNodeCollapsed = true;
			}
		}
		assert.ok( !foundNodeCollapsed, "All nodes are now expanded");

	});

	QUnit.test("Home/End", function(assert) {

		sap.ui.getCore().getControl("node13").focus();

		qutils.triggerKeyboardEvent("node13", KeyCodes.END, false, false, false);

		assert.equal( jQuery(document.activeElement).first().attr("id"), "node14",  "Focus moved to last sibling");

		qutils.triggerKeyboardEvent("node14", KeyCodes.HOME, false, false, false);

		assert.equal( jQuery(document.activeElement).first().attr("id"), "node13",  "Focus moved to first sibling");



	});

	QUnit.test("Ctrl+Home/Ctrl+End", function(assert) {

		sap.ui.getCore().getControl("node13").focus();

		qutils.triggerKeyboardEvent("node13", KeyCodes.END, false, false, true);

		assert.equal( jQuery(document.activeElement).first().attr("id"), "node12",  "Focus moved to last node");

		qutils.triggerKeyboardEvent("node12", KeyCodes.HOME, false, false, true);

		assert.equal( jQuery(document.activeElement).first().attr("id"), "node11",  "Focus moved to first node");



	});

	QUnit.module("Nodes expand and collapse", {
		beforeEach: function () {
			//system under test
			this.oTree = new Tree("trtree", {
				nodes: [
					new TreeNode("trnode1", {
						text: "n1",
						expanded: true,
						nodes: [
							new TreeNode("trnode11", {
								text: "n11",
								expanded: true,
								nodes: [
									new TreeNode("trnode111", {
										text: "n111",
										expanded: true
									}),
									new TreeNode("trnode112", {
										text: "n112",
										expanded: true
									})
								]
							}),
							new TreeNode("trnode12", {
								text: "n12",
								expanded: true
							})
						]
					}),
					new TreeNode("trnode2", {
						text: "n2",
						expanded: true,
						nodes: [
							new TreeNode("trnode21", {
								text: "n21",
								expanded: true,
								nodes: [
									new TreeNode("trnode211", {
										text: "n211",
										expanded: true
									}),
									new TreeNode("trnode212", {
										text: "n212",
										expanded: true
									})
								]
							}),
							new TreeNode("trnode22", {
								text: "n22",
								expanded: true
							})
						]
					})
				]
			});
			this.oTree.setTitle("Tree");
			this.oTree.setWidth("100%");
			this.oTree.setHeight("auto");
			this.oTree.setSelectionMode(TreeSelectionMode.Multi);

			//arrange
			this.oTree.placeAt("target4");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oTree.destroy();
			this.oTree = null;
		}
	});

	QUnit.test("Selection is adjusted only once for the real target node on collapse", function(assert) {
		var oAdjustSelectionSpy = this.spy(this.oTree, "_adjustSelectionOnCollapsing"),
			oTargetNode = sap.ui.getCore().byId("trnode1"),
			oSelectedChildNode = sap.ui.getCore().byId("trnode111");

		//Act
		oSelectedChildNode.setIsSelected(true);
		oTargetNode.collapse(true);

		//Assert
		assert.equal(oAdjustSelectionSpy.callCount, 1, "Selection is adjusted only once.");
		assert.ok(oAdjustSelectionSpy.calledWith(oTargetNode), "Selection is adjusted starting from collapsed target node.");

		oAdjustSelectionSpy.restore();
	});

	QUnit.test("Selection is adjusted only once for the real target node on expand", function(assert) {
		var oAdjustSelectionSpy = this.spy(Tree.prototype, "_adjustSelectionOnExpanding"),
				oTargetNode = sap.ui.getCore().byId("trnode1"),
				oSelectedChildNode = sap.ui.getCore().byId("trnode111");

		//Act
		oSelectedChildNode.setIsSelected(true);
		this.oTree.collapseAll();
		oTargetNode.expand(true);

		//Assert
		assert.equal(oAdjustSelectionSpy.callCount, 1, "Selection is adjusted only once.");
		assert.ok(oAdjustSelectionSpy.calledWith(oTargetNode), "Selection is adjusted starting from expanded target node.");
	});

	QUnit.test("Animating only when collapse is not propagated to children", function(assert) {
		var oJqueryShowSpy = this.spy(jQuery.fn, "hide"),
			oTargetNode = sap.ui.getCore().byId("trnode1");

		oTargetNode.collapse(true);
		assert.equal(oJqueryShowSpy.callCount, 2, "All nodes with children hide.");
		assert.equal(oJqueryShowSpy.args[0].length, 0, "Node1 hides without animation.");
		assert.equal(oJqueryShowSpy.args[1].length, 0, "Node11 hides without animation.");
	});

	QUnit.test("Store references to the selected hidden children", function(assert) {
		var done = assert.async();
		var oDeepTree = new Tree("tr2tree", {
			nodes: [
				new TreeNode("tr2node1", {
					text: "n1",
					expanded: true,
					nodes: [
						new TreeNode("tr2node11", {
							text: "n11",
							expanded: true,
							nodes: [
								new TreeNode("tr2node111", {
									text: "n111",
									expanded: true,
									nodes: [
										new TreeNode("tr2node1111", {
											text: "n1111",
											expanded: true
										})
									]
								})

							]
						})
					]
				})
			]
		});
		oDeepTree.setWidth("100%");
		oDeepTree.setHeight("auto");
		oDeepTree.placeAt("target4");
		sap.ui.getCore().applyChanges();

		var oNode1 = sap.ui.getCore().byId("tr2node1");
		var oNode11 = sap.ui.getCore().byId("tr2node11");
		var oNode111 = sap.ui.getCore().byId("tr2node111");
		var oNode1111 = sap.ui.getCore().byId("tr2node1111");

		oNode1111.select();
		oDeepTree.collapseAll();

		this.stub(TreeNode, "ANIMATION_DURATION").value(0);
		oNode1.expand();

		setTimeout(function() {
			assert.equal(oNode1.getSelectedForNodes().length, 0, "References of its selected hidden children removed when expanded.");
			assert.equal(oNode11.getSelectedForNodes().length, 1, "Node references propagated to the first collapsed parent of the selected hidden children.");
			assert.equal(oNode11.getSelectedForNodes()[0], "tr2node1111", "Node references propagated to the first collapsed parent of the selected hidden children.");
			assert.equal(oNode111.getSelectedForNodes().length, 0, "Node references not propagated to the other collapsed parents of the selected hidden children.");

			oDeepTree.destroy();
			done();
		}, 0);

	});

	QUnit.module("Helper methods", {
		beforeEach: function () {
			this.oTree = new Tree();
		},
		afterEach: function () {
			this.oTree.destroy();
			this.oTree = null;
		}
	});

	QUnit.test("_removeItemFromObject private method", function (assert) {
		// Arrange
		var oOriginal,
			oClone;

		oOriginal = {
			keyOne: "1",
			keyTwo: "2",
			keyThree: "3"
		};

		// Act
		oClone = this.oTree._removeItemFromObject(oOriginal, "keyOne");

		// Assert
		assert.notOk(oClone === oOriginal, "Clone object is not a reference to original object");
		assert.notDeepEqual(oOriginal, oClone, "Clone object is different from original object");
		assert.strictEqual(oClone.hasOwnProperty("keyOne"), false, "KeyOne does not exist in cloned object");
		assert.strictEqual(oClone.hasOwnProperty("keyTwo"), true, "keyTwo exist in cloned object");
		assert.strictEqual(oClone.hasOwnProperty("keyThree"), true, "keyThree exist in cloned object");

		// Act
		oClone = this.oTree._removeItemFromObject(oOriginal, "keyThatDontExistInObject");

		// Assert
		assert.deepEqual(oOriginal, oClone, "Clone object is the same as original object");
	});

	QUnit.module("Preserve selection", {
		beforeEach: function () {
			this.oTree = new Tree({
				showHeader: false,
				showHeaderIcons: false,
				showHorizontalScrollbar: true,
				selectionMode: TreeSelectionMode.Single,
				nodes: {
					path : "/",
					template : new TreeNode({
						text : {
							path : "text"
						}
					}),
					parameters : { arrayNames : [ "children" ] }
				}
			});

			// Remove tree node animation and preserve the default one to restore it after the test
			this.defaultAnimationDuration = TreeNode.ANIMATION_DURATION;
			sap.ui.commons.TreeNode.ANIMATION_DURATION = 0;

			this.oTree.setModel(new JSONModel({
				children : [
					{
						bShow : true,
						text : "root",
						children : [
							{
								bShow : true,
								text : "node1",
								children : [
									{
										bShow : true,
										text : "node11"
									},
									{
										bShow : true,
										text : "node12"
									},
									{
										bShow : true,
										text : "node13"
									}
								]
							},
							{
								bShow : false,
								text : "node2",
								children : [
									{
										bShow : true,
										text : "node21"
									},
									{
										bShow : true,
										text : "node22"
									},
									{
										bShow : true,
										text : "node23"
									}
								]
							},
							{
								bShow : true,
								text : "node3",
								children : [
									{
										bShow : true,
										text : "node31"
									},
									{
										bShow : false,
										text : "node32"
									},
									{
										bShow : false,
										text : "node33"
									}
								]
							}
						]
					}
				]
			}));

			this.oTree.placeAt("target5");
			sap.ui.getCore().applyChanges();

			this.createNodesFlatStructure();
		},
		afterEach: function () {
			// Restore tree node animation duration
			sap.ui.commons.TreeNode.ANIMATION_DURATION = this.defaultAnimationDuration;
			this.oTree.destroy();
		},
		applyFilter: function (sShowValue) {
			var aFiltersToApply = [];
			switch (sShowValue) {
				case "True":
					aFiltersToApply.push(new Filter('bShow', FilterOperator.EQ, true));
					break;
				case "False":
					aFiltersToApply.push(new Filter('bShow', FilterOperator.EQ, false));
					break;
				case "All":
					aFiltersToApply = [
						new Filter('bShow', FilterOperator.EQ, true),
						new Filter('bShow', FilterOperator.EQ, false)
					];
					break;
				default:
					break;
			}
			this.oTree.getBinding("nodes").filter(aFiltersToApply);

			// Recreate nodes flat structure when model is updated
			this.createNodesFlatStructure();
		},
		createNodesFlatStructure: function () {
			var that = this;
			this.oNodes = {};
			var loopNodes = function (aNodes) {
				var aSubNodes;
				for (var i = 0; i < aNodes.length; i++) {
					aSubNodes = aNodes[i].getNodes();
					that.oNodes[aNodes[i].getText()] = aNodes[i];
					if (aSubNodes.length > 0) {
						loopNodes(aSubNodes);
					}
				}
			};
			loopNodes(this.oTree.getNodes());
		}
	});

	QUnit.test("Selection is preserved on node collapse/expand in single selection mode", function (assert) {
		var that = this,
			oTestIfNodesSelectionIsPreservedOnExpand;

		oTestIfNodesSelectionIsPreservedOnExpand = function () {
			assert.ok(that.oNodes.node31.isVisible(), "Node 31 should be visible");
			assert.ok(that.oNodes.node32.isVisible(), "Node 32 should be visible");
			assert.ok(that.oNodes.node33.isVisible(), "Node 33 should be visible");
			assert.ok(that.oNodes.node33.getIsSelected(), "Node 33 should be selected");
		};

		// Mark node as selected
		this.oNodes.node33.setIsSelected(true);

		// Collapse and then expand node 3
		this.oNodes.node3.collapse();
		this.oNodes.node3.expand();

		// Assert
		oTestIfNodesSelectionIsPreservedOnExpand();

		// Collapse and then expand root node
		this.oNodes.root.collapse();
		this.oNodes.root.expand();

		// Assert
		oTestIfNodesSelectionIsPreservedOnExpand();

		// Collapse and then expand all nodes
		this.oTree.collapseAll();
		this.oTree.expandAll();

		// Assert
		oTestIfNodesSelectionIsPreservedOnExpand();

	});

	QUnit.test("Selection is preserved on node collapse/expand in multi selection mode", function (assert) {
		var that = this,
			oTestIfNodesSelectionIsPreservedOnExpand;

		// Set tree selection mode to Multi
		this.oTree.setSelectionMode(TreeSelectionMode.Multi);

		oTestIfNodesSelectionIsPreservedOnExpand = function () {
				assert.ok(that.oNodes.node31.isVisible(), "Node 31 should be visible");
				assert.ok(that.oNodes.node32.isVisible(), "Node 32 should be visible");
				assert.ok(that.oNodes.node33.isVisible(), "Node 33 should be visible");
				assert.ok(that.oNodes.node31.getIsSelected(), "Node 31 should be selected");
				assert.ok(!that.oNodes.node32.getIsSelected(), "Node 32 should not be selected");
				assert.ok(that.oNodes.node33.getIsSelected(), "Node 33 should be selected");
		};

		// Mark nodes as selected
		this.oNodes.node31.setIsSelected(true);
		this.oNodes.node33.setIsSelected(true);

		// Collapse and then expand node 3
		this.oNodes.node3.collapse();
		this.oNodes.node3.expand();

		// Assert
		oTestIfNodesSelectionIsPreservedOnExpand();

		// Collapse and then expand root node
		this.oNodes.root.collapse();
		this.oNodes.root.expand();

		// Assert
		oTestIfNodesSelectionIsPreservedOnExpand();

		// Collapse and then expand all nodes
		this.oTree.collapseAll();
		this.oTree.expandAll();

		// Assert
		oTestIfNodesSelectionIsPreservedOnExpand();
	});

	QUnit.test("Selection is preserved on oDate model filtering with single selection", function (assert) {
		// Mark node as selected
		this.oNodes.node33.setIsSelected(true);

		// Filter the model
		this.applyFilter("False");

		// Assert
		assert.ok(this.oNodes.node33.getIsSelected(), "Node 33 should remain selected");

		// Filter the model
		this.applyFilter("True");
		this.applyFilter("All");

		// Assert
		assert.ok(!this.oNodes.node33.getIsSelected(), "Node 33 should not be selected");
	});

	QUnit.test("Selection is preserved on oDate model filtering with multiple selection", function (assert) {
		var oNode31 = this.oNodes.node31;

		// Set tree selection mode to Multi
		this.oTree.setSelectionMode(TreeSelectionMode.Multi);

		// Mark node as selected
		this.oNodes.node31.setIsSelected(true);
		this.oNodes.node32.setIsSelected(true);
		this.oNodes.node33.setIsSelected(true);

		// Filter the model
		this.applyFilter("False");

		// Assert
		assert.strictEqual(oNode31.bIsDestroyed, true, "Initial Node 31 should be destroyed on updateNodes fired " +
				"with reason filter. We destroy all old nodes on filtering to prevent memory leak and unpredictable " +
				"selection behavior");

		assert.notOk(this.oNodes.hasOwnProperty("node31"), "Node 31 should be removed");
		assert.ok(this.oNodes.node32.getIsSelected(), "Node 32 should remain selected");
		assert.ok(this.oNodes.node33.getIsSelected(), "Node 33 should remain selected");

		// Deselect node 32
		this.oNodes.node32.setIsSelected(false);

		// Filter the model
		this.applyFilter("All");

		// Assert
		assert.notOk(this.oNodes.node31.getIsSelected(), "Node 31 should not be selected");
		assert.notOk(this.oNodes.node32.getIsSelected(), "Node 32 should not be selected");
		assert.ok(this.oNodes.node33.getIsSelected(), "Node 33 should be selected");

		// Cleanup
		oNode31 = null;
	});

	QUnit.test("Selection is preserved on oDate model filtering with multiple selection", function (assert) {
		// Set tree selection mode to Multi
		this.oTree.setSelectionMode(TreeSelectionMode.Multi);

		// Mark node as selected
		this.oNodes.node31.setIsSelected(true);
		this.oNodes.node32.setIsSelected(true);
		this.oNodes.node33.setIsSelected(true);

		// Filter the model
		this.applyFilter("True");

		// Assert
		assert.ok(this.oNodes.node31.getIsSelected(), "Node 31 should remain selected");
		assert.notOk(this.oNodes.hasOwnProperty("node32"), "Node 32 should be removed");
		assert.notOk(this.oNodes.hasOwnProperty("node33"), "Node 33 should be removed");

		// Filter the model
		this.applyFilter("All");

		// Assert
		assert.ok(this.oNodes.node31.getIsSelected(), "Node 31 should be selected");
		assert.notOk(this.oNodes.node32.getIsSelected(), "Node 32 should not be selected");
		assert.notOk(this.oNodes.node33.getIsSelected(), "Node 33 should not be selected");
	});

	QUnit.module("Model filtering", {
		beforeEach: function () {
			var oNodeTemplate;

			// Do not change the tree declaration with bindAggregation because the test wont fail if a regression
			// is introduced and the tree is bound differently
			this.oTree = new Tree();
			oNodeTemplate = new TreeNode();
			oNodeTemplate.bindProperty("text", "name");
			this.oTree.bindAggregation("nodes", "/root", oNodeTemplate);

			this.oTree.setModel(new JSONModel({
				root:{
					name: "root",
					0: {
						name: "JSON_item1",
						0: {
							name: "JSON_subitem1",
							0: {
								name: "JSON_subsubitem1"
							},
							1: {
								name: "JSON_subsubitem2"
							}
						},
						1: {
							name: "JSON_subitem2",
							0: {
								name: "JSON_subsubitem3"
							}
						}
					},
					1:{
						name: "JSON_item2",
						0: {
							name: "JSON_subitem3"
						}
					}
				}
			}));

			this.oTree.placeAt("target5");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			// Restore tree node animation duration
			this.oTree.destroy();
		}
	});

	QUnit.test("Filtering", function (assert) {
		// Arrange
		var oTreeBinding = this.oTree.getBinding("nodes"),
			oFilter = new Filter("name","StartsWith","JSON_i"),
			aNodes;

		// Act
		oTreeBinding.filter([oFilter]);
		aNodes = this.oTree.getNodes();

		// Assert
		assert.strictEqual(aNodes.length, 2, "There should be 2 items that survive the filtering");
		assert.strictEqual(aNodes[0].getText(), "JSON_item1", "Item 1 text should match");
		assert.strictEqual(aNodes[1].getText(), "JSON_item2", "Item 2 text should match");
	});
});
