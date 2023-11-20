/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/commons/Tree",
	"sap/ui/commons/TreeNode",
	"sap/ui/thirdparty/jquery",
	"sap/ui/model/json/JSONModel"
], function(createAndAppendDiv, Tree, TreeNode, jQuery, JSONModel) {
	"use strict";

	// prepare DOM
	createAndAppendDiv("target1");



	function createStandardTree() {
		var oTree = new Tree("tree", {title : "Tree with Header", width : "90%", height : "500px", showHearderIcons : true, showHorizontalScrollbar : false});
		var oRootNode = new TreeNode("rootnode", {text : "Root"});
		oTree.addNode(oRootNode);
		var oNode1 = new TreeNode("node1", {text : "Node 1"});
		oRootNode.addNode(oNode1);
		var oNode11 = new TreeNode("node11", {text : "Node 1.1"});
		oNode1.addNode(oNode11);
		var oNode111 = new TreeNode("node111", {text : "Node 1.1.1"});
		oNode11.addNode(oNode111);
		var oNode112 = new TreeNode("node112", {text : "Node 1.1.2"});
		oNode11.addNode(oNode112);
		var oNode113 = new TreeNode("node113", {text : "Node 1.1.3"});
		oNode11.addNode(oNode113);
		var oNode12 = new TreeNode("node12", {text : "Node 1.2"});
		oNode1.addNode(oNode12);
		var oNode121 = new TreeNode("node121", {text : "Node 1.2.1"});
		oNode12.addNode(oNode121);
		var oNode13 = new TreeNode("node13", {text : "Node 1.3", expanded : false});
		oNode1.addNode(oNode13);
		var oNode131 = new TreeNode("node131", {text : "Node 1.3.1"});
		oNode13.addNode(oNode131);
		var oNode132 = new TreeNode("node132", {text : "Node 1.3.2"});
		oNode13.addNode(oNode132);
		var oNode2 = new TreeNode("node2", {text : "Node 2"});
		oRootNode.addNode(oNode2);
		var oNode21 = new TreeNode("node21", {text : "Node 2.1"});
		oNode2.addNode(oNode21);
		var oNode211 = new TreeNode("node211", {text : "Node 2.1.1"});
		oNode21.addNode(oNode211);
		var oNode212 = new TreeNode("node212", {text : "Node 2.1.2"});
		oNode21.addNode(oNode212);
		var oNode22 = new TreeNode("node22", {text : "Node 2.2", expanded : false});
		oNode2.addNode(oNode22);
		var oNode221 = new TreeNode("node221", {text : "Node 2.2.1"});
		oNode22.addNode(oNode221);
		var oNode222 = new TreeNode("node222", {text : "Node 2.2.2"});
		oNode22.addNode(oNode222);
		var oNode223 = new TreeNode("node223", {text : "Node 2.2.3"});
		oNode22.addNode(oNode223);
		var oNode23 = new TreeNode("node23", {text : "Node 2.3"});
		oNode2.addNode(oNode23);
		var oNode231 = new TreeNode("node231", {text : "Node 2.3.1"});
		oNode23.addNode(oNode231);
		var oNode232 = new TreeNode("node232", {text : "Node 2.3.2"});
		oNode23.addNode(oNode232);
		return oTree;
	}

	var oStandardTree;


	QUnit.module("Rendering", {
		beforeEach: function() {
			oStandardTree = createStandardTree();
			oStandardTree.placeAt("target1");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			oStandardTree.destroy();
			oStandardTree = null;
		}
	});

	QUnit.test("Rendering of Standard tree", function(assert) {
		assert.notEqual(document.getElementById("tree"), null,	"Tree is rendered.");
		assert.notEqual(document.getElementById("tree" + "-Header"), null,	"Tree header is there.");
		assert.notEqual(document.getElementById("tree" + "-TreeCont"),	null, "Tree content is there");
	});

	QUnit.module("Selection Mode 'Single'", {
		beforeEach: function() {
			oStandardTree = createStandardTree();
			oStandardTree.placeAt("target1");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			oStandardTree.destroy();
			oStandardTree = null;
		}
	});

	QUnit.test("Node selection", function(assert) {
		var firstSelection = sap.ui.getCore().getControl("node1");
		firstSelection.select();
		assert.ok(firstSelection.getIsSelected(), "Node 1 is selected");
		var secondSelection = sap.ui.getCore().getControl("node2");
		secondSelection.select();
		assert.ok(secondSelection.getIsSelected(), "Node 2 is now selected");
		assert.ok(!firstSelection.getIsSelected(), "Node 1 is not selected anymore");
	});

	QUnit.test("Node selection and collapsing (old)", function(assert) {
		var tree = sap.ui.getCore().getControl("tree");
		assert.equal(tree.getSelectionMode(), "Legacy", "SelectionMode should be 'Legacy' by default");
		var node1 = sap.ui.getCore().getControl("node1");
		assert.ok(node1.getExpanded(), "Node 1 is expanded");
		var node11 = sap.ui.getCore().getControl("node11");
		node11.select();
		assert.ok(node11.getIsSelected(), "Node 1.1 is selected");
		node1.collapse();
		assert.ok(!node1.getExpanded(), "Node 1 is now collapsed");
		assert.ok(node11.getIsSelected(), "Node 1.1 selected");
		node1.expand();
		assert.ok(node1.getExpanded(), "Node 1 is expanded");
		assert.ok(node11.getIsSelected(), "Node 1.1 is selected");
	});

	QUnit.module("Selection Mode 'Multi'", {
		beforeEach: function() {
			oStandardTree = createStandardTree();
			oStandardTree.placeAt("target1");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			oStandardTree.destroy();
			oStandardTree = null;
		}
	});

	QUnit.test("SelectionType Single", function(assert) {
		var tree = sap.ui.getCore().getControl("tree");
		tree.setSelectionMode("Multi");
		assert.equal(tree.getSelectionMode(), "Multi", "SelectionMode is set to 'Multi' now");
		var node1 = sap.ui.getCore().getControl("node1");
		node1.select();
		assert.ok(node1.getIsSelected(), "Node 1 is selected");
		var node2 = sap.ui.getCore().getControl("node2");
		node2.select();
		assert.ok(node2.getIsSelected(), "Node 2 is selected");
		assert.ok(!node1.getIsSelected(), "Node 1 is not selected");
	});

	QUnit.test("Node selection and collapsing (new)", function(assert) {
		var tree = sap.ui.getCore().getControl("tree");
		tree.setSelectionMode("Multi");
		assert.equal(tree.getSelectionMode(), "Multi", "SelectionMode is set to 'Multi' now");
		var node1 = sap.ui.getCore().getControl("node1");
		assert.ok(node1.getExpanded(), "Node 1 is expanded");
		var node11 = sap.ui.getCore().getControl("node11");
		node11.select();
		assert.ok(node11.getIsSelected(), "Node 1.1 is selected");
		node1.collapse();
		assert.ok(!node1.getExpanded(), "Node 1 is now collapsed");
		node1.expand();
		assert.ok(node1.getExpanded(), "Node 1 is expanded");
		assert.ok(node11.getIsSelected(), "Node 1.1 is selected");
	});

	QUnit.module("Multiselect interactions", {
		beforeEach: function () {
			var oData = {
				"children": [
					{"NAME": "A"},
					{"NAME": "B"},
					{"NAME": "C"},
					{"NAME": "D"},
					{"NAME": "E"},
					{"NAME": "F"},
					{"NAME": "G"},
					{"NAME": "H"},
					{"NAME": "I"},
					{"NAME": "J"},
					{"NAME": "K"},
					{"NAME": "L"},
					{"NAME": "M"},
					{"NAME": "N"},
					{"NAME": "O"},
					{"NAME": "P"},
					{"NAME": "Q"},
					{"NAME": "R"},
					{"NAME": "S"},
					{"NAME": "T"},
					{"NAME": "U"},
					{"NAME": "V"},
					{"NAME": "W"},
					{"NAME": "X"},
					{"NAME": "Y"},
					{"NAME": "Z"}
				]
			};

			oStandardTree = new Tree({
				id: "tree",
				title: "Tree",
				width: "300px",
				height: "300px",
				selectionMode: "Multi",
				nodes: {
					path: "/hierarchy",
					template: new TreeNode({
						text: {
							path: "NAME"
						}
					}),
					parameters: {
						arrayNames: ["children"]
					}
				}
			}).setModel(new JSONModel({hierarchy: oData}));

			oStandardTree.placeAt("target1");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			oStandardTree.destroy();
			oStandardTree = null;
		}
	});

	QUnit.test("animate only last selection", function (assert) {
		var oTree = oStandardTree,
			aNodes = oTree.getNodes(),
			$TreeCont = oTree.$().find(".sapUiTreeCont");

		aNodes.forEach(function (oNode) {
			oTree.setSelection(oNode, true, Tree.SelectionType.Range);
		});


		assert.strictEqual($TreeCont.queue().length, 1, "Only the last selection to be animated");
	});
});