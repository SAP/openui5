/*global QUnit */
sap.ui.define([
	"sap/ui/core/util/MockServer",
	"sap/ui/model/odata/v2/ODataModel"
], function(
	MockServer,
	ODataModel
) {
	"use strict";

	var oModel, oBinding, oMockServer;
	var sServiceUrl = "/odataFake/";

	/**
	* Creates a new Mock-Server, this makes sure that after deleting nodes the original data-set is restored.
	* Called in the setup step of each test-module.
	*/
	var fnSetupNewMockServer = function () {
		// clean up previous mock server
		if (oMockServer) {
			oMockServer.stop();
			oMockServer.destroy();
		}

		//Initialize mock servers
		oMockServer = new MockServer({
			rootUri: sServiceUrl
		});
		oMockServer.simulate("test-resources/sap/ui/core/qunit/model/metadata_orgHierarchy.xml", "test-resources/sap/ui/core/qunit/model/orgHierarchy/");
		oMockServer.start();
	};

	// create binding
	function createTreeBinding(sPath, oContext, aFilters, mParameters, aSorters){
		oBinding = oModel.bindTree(sPath, oContext, aFilters, mParameters, aSorters).initialize();
		oModel.addBinding(oBinding);
	}

	// request data
	function requestData(oBinding, iStartIndex, iLength, iThreshold) {
		// refresh indicates that the adapter code has been loaded and the binding has been
		// successfully initialized
		oBinding.attachEventOnce("refresh", function () {
			oBinding.getContexts(iStartIndex, iLength, iThreshold);
		});
	}

	QUnit.module("Remove and reinsert", {
		beforeEach: function() {
			fnSetupNewMockServer();
			oModel = new ODataModel(sServiceUrl, {useBatch:false});
			return oModel.metadataLoaded();
		},
		afterEach: function() {
			oMockServer.stop();
			oModel.destroy();
		}
	});

	QUnit.test("Move serverIndex node and collapse old parent", function(assert){

		var done = assert.async();
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		function handler1 (oEvent) {
			oBinding.detachChange(handler1);
			var oNode = oBinding.findNode(1);
			var oNewParent = oBinding.findNode(28);
			var oHandle = oBinding.removeContext(oNode.context);

			oBinding.attachChange(handler2);
			oBinding.addContexts(oNewParent.context, oHandle);
		}

		function handler2 (oEvent) {
			oBinding.detachChange(handler2);

			assert.equal(oBinding.getLength(), 626, "The length of binding is correct");
			oBinding.collapse(0, true);
			assert.equal(oBinding.getLength(), 606, "The length of binding is correct after collapse the old parent");

			done();
		}

		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 40, 0);
	});

	QUnit.test("Move manually expanded nodes", function(assert){

		var done = assert.async();
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		var oN1030, oN1630, oN1639, oN1004, oN1005, oN2000;

		function handler1 (oEvent) {
			oBinding.detachChange(handler1);
			assert.equal(oBinding.getLength(), 626, "The length of binding is correct");

			oBinding.attachChange(handler2);

			oN1005 = oBinding.findNode(4);
			oN1004 = oBinding.findNode(3);
			oN1030 = oBinding.findNode(29);

			oBinding.expand(oN1005, true);
		}

		function handler2 (oEvent) {
			oBinding.detachChange(handler2);

			assert.equal(oBinding.getLength(), 634, "The length of binding is correct after expand a node");

			oN1630 = oBinding.findNode(5);
			var oHandle = oBinding.removeContext(oN1030.context);
			oBinding.addContexts(oN1630.context, oHandle);
			assert.equal(oBinding.getLength(), 627, "The length of binding is correct after move a node to a collapsed parent");

			oBinding.attachChange(handler3);
			oBinding.expand(oN1630, true);
		}

		function handler3 (oEvent) {
			oBinding.detachChange(handler3);

			assert.equal(oBinding.getLength(), 637, "The length of binding is correct after expand the parent");
			oN1639 = oN1630.children[1];

			oBinding.attachChange(handler4);
			oBinding.expand(oN1004, true);
		}

		function handler4 (oEvent) {
			oBinding.detachChange(handler4);
			assert.equal(oBinding.getLength(), 700, "The length of binding is correct after expand a node");

			oN2000 = oN1004.children[3];
			var oHandle = oBinding.removeContext(oN2000.context);
			oBinding.addContexts(oN1639.context, oHandle);
			assert.equal(oBinding.getLength(), 699, "The length of binding is correct after move a deep node (to collapsed subtree)");

			oBinding.expand(oN1639, true);
			assert.equal(oBinding.getLength(), 700, "The length of binding is correct after expanding subtree");

			oBinding.collapse(oN1004);
			assert.equal(oBinding.getLength(), 638, "The length of binding is correct after the old parent is collapsed");

			oBinding.collapse(oN1005);
			assert.equal(oBinding.getLength(), 619, "The length of binding is correct after the new parent is collapsed");

			done();
		}

		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 40, 0);
	});

	QUnit.test("Length calculation - remove/reinsert - Simple 1", function(assert){

		var done = assert.async();
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		function handler1 (oEvent) {
			oBinding.detachChange(handler1);

			assert.equal(oBinding.getLength(), 626, "Initial length is correct");

			// remove
			var oNode = oBinding.findNode(0);
			var oHandle = oBinding.removeContext(oNode.context);

			assert.equal(oBinding.getLength(), 598, "Length after removal(0) is correct");

			// re-insert
			var oNewParent = oBinding.findNode(0);
			oBinding.addContexts(oNewParent.context, oHandle);

			assert.equal(oBinding.getLength(), 626, "Length after re-insert(0) is correct");

			// collapse re-inserted node
			oBinding.collapse(1);
			assert.equal(oBinding.getLength(), 599, "Length after collapse(1) is correct");

			done();
		}

		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 100, 0);
	});

	QUnit.test("Length calculation - remove/reinsert - Simple 2", function(assert){

		var done = assert.async();
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		function handler1 (oEvent) {
			oBinding.detachChange(handler1);

			assert.equal(oBinding.getLength(), 626, "Initial length is correct");

			oBinding.collapse(1);

			assert.equal(oBinding.getLength(), 620, "Length after collapse(1) is correct");

			// remove
			var oNode = oBinding.findNode(0);
			var oHandle = oBinding.removeContext(oNode.context);

			assert.equal(oBinding.getLength(), 598, "Length after removal(0) is correct");

			// re-insert
			var oNewParent = oBinding.findNode(0);
			oBinding.addContexts(oNewParent.context, oHandle);

			assert.equal(oBinding.getLength(), 620, "Length after re-insert(0) is correct");

			// collapse re-inserted node
			oBinding.collapse(1);
			assert.equal(oBinding.getLength(), 599, "Length after collapse(1) is correct");

			done();
		}

		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 100, 0);
	});

	QUnit.test("Length calculation - remove/reinsert - Simple 3", function(assert){

		var done = assert.async();
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		var oN1001, oN1004, oN1029;

		function handler1 (oEvent) {
			oBinding.detachChange(handler1);

			assert.equal(oBinding.getLength(), 626, "Initial length is correct");

			//collect some nodes, which are alreay loaded
			oN1001 = oBinding.findNode(0);
			oN1004 = oBinding.findNode(3);
			oN1029 = oBinding.findNode(28);

			// expand(1004) --> data has to be loaded --> change
			oBinding.attachChange(handler2);
			oBinding.expand(oN1004, true);
		}

		function handler2 (oEvent) {
			oBinding.detachChange(handler2);

			assert.equal(oBinding.getLength(), 689, "Length after expand(3) is correct");

			var oHandle = oBinding.removeContext(oN1001.context);

			assert.equal(oBinding.getLength(), 598, "Length after remove(0) is correct");

			oBinding.addContexts(oN1029.context, oHandle);

			assert.equal(oBinding.getLength(), 689, "Length after remove(0) is correct");

			done();
		}

		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 100, 0);
	});

	QUnit.test("Length calculation - remove deep node @ original position AND add in server-indexed parent node", function(assert){

		var done = assert.async();
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		var oN1001, oN1005, oN1630;

		function handler1 (oEvent) {
			oBinding.detachChange(handler1);

			assert.equal(oBinding.getLength(), 626, "Initial length is correct");

			//collect some nodes, which are alreay loaded
			oN1001 = oBinding.findNode(0);
			oN1005 = oBinding.findNode(4);

			// expand(1004) --> data has to be loaded --> change
			oBinding.attachChange(handler2);
			oBinding.expand(oN1005, true);
		}

		function handler2 (oEvent) {
			oBinding.detachChange(handler2);

			assert.equal(oBinding.getLength(), 634, "Length after expand(1005) is correct");

			oBinding.attachChange(handler3);

			oN1630 = oBinding.findNode(5);

			oBinding.expand(oN1630, true);

		}

		function handler3 (oEvent) {
			oBinding.detachChange(handler3);

			assert.equal(oBinding.getLength(), 637, "Length after expand(1630) is correct");

			oBinding.collapse(oN1630, true);

			assert.equal(oBinding.getLength(), 634, "Length after collapse(1630) is correct");

			var oHandle = oBinding.removeContext(oN1630.context);

			assert.equal(oBinding.getLength(), 633, "Length after remove(1630) is correct");

			// re-insert
			oBinding.attachChange(handler4);
			oBinding.addContexts(oN1001.context, oHandle);
		}

		function handler4 (oEvent) {
			oBinding.detachChange(handler4);
			assert.equal(oBinding.getLength(), 634, "Length after add(1001, [1630]) is correct");

			// collapse old parent
			oBinding.collapse(oN1005);
			assert.equal(oBinding.getLength(), 627, "Length after collapse(1005) is correct");

			// expand the re-inserted node again
			oBinding.expand(oN1630, true);
			assert.equal(oBinding.getLength(), 630, "Length after expand(1630) is correct");

			done();
		}

		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 100, 0);
	});

	QUnit.test("Length calculation - remove initially collapsed node, re-insert @ server-indexed parent - magnitude propagation", function(assert){

		var done = assert.async();
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		var oN1004, oN1029, oN1051;
		var oN1004Subtree, oNextAfter1029;

		function handler1 (oEvent) {
			oBinding.detachChange(handler1);

			//collect some nodes, which are already loaded
			oN1004 = oBinding.findNode(3);
			oN1029 = oBinding.findNode(28);
			oN1051 = oBinding.findNode(50);
			// oN1114 = */oBinding.findNode(113);

			// remove(1004)
			oN1004Subtree = oBinding.removeContext(oN1004.context);
			assert.equal(oBinding.getLength(), 625, "Length after remove(1004) is correct");

			// re-insert 1004 @ 1029
			oBinding.addContexts(oN1029.context, oN1004Subtree);
			assert.equal(oBinding.getLength(), 626, "Length after re-insert(1004) is correct");

			oBinding.attachChange(handler2);
			oBinding.expand(oN1004, true);

		}

		function handler2 (oEvent) {
			oBinding.detachChange(handler2);

			assert.equal(oBinding.getLength(), 689, "Length after expand of moved node 1004 is correct");

			oBinding.collapse(oN1004, true);

			assert.equal(oBinding.getLength(), 626, "Length after collapse of moved node 1004 is correct");

			oBinding.collapse(oN1029, true);

			assert.equal(oBinding.getLength(), 604, "Length after collapse(1029) is correct");

			assert.equal(oN1029.magnitude, 21, "Magnitude for initially collapsed node was not changed!");

			// check if the collapse of 1
			oNextAfter1029 = oBinding.findNode(28);

			assert.equal(oNextAfter1029.key, oN1051.key, "Follow-Up node after 1029 is correct (key = 1051 expected)");

			done();
		}

		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 200, 0);
	});

	QUnit.test("Length calculation - cut/paste complex operations", function(assert){

		var done = assert.async();
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		var oN1001, oN1002, oN1004, oN1029, oN1030;
		var oN1001Subtree, oN1004Subtree;

		function handler1 (oEvent) {
			oBinding.detachChange(handler1);

			//collect some nodes, which are alreay loaded
			oN1001 = oBinding.findNode(0);
			oN1002 = oBinding.findNode(1);
			oN1004 = oBinding.findNode(3);
			oN1029 = oBinding.findNode(28);
			oN1030 = oBinding.findNode(29);

			// remove(1001)
			oN1001Subtree = oBinding.removeContext(oN1001.context);
			assert.equal(oBinding.getLength(), 598, "Length after remove(1001) is correct");

			// re-insert 1001 @ 1030
			oBinding.addContexts(oN1030.context, oN1001Subtree);
			assert.equal(oBinding.getLength(), 626, "Length after re-insert(1001) @ 1030 is correct");

			// collapse 1001
			oBinding.collapse(oN1001, true);
			assert.equal(oBinding.getLength(), 599, "Length after collapse(1001) is correct");

			// expand 1001
			oBinding.expand(oN1001, true);
			assert.equal(oBinding.getLength(), 626, "Length after re-expand(1001) is correct");

			// remove 1004
			oN1004Subtree = oBinding.removeContext(oN1004.context);
			assert.equal(oBinding.getLength(), 625, "Length after remove(1004) is correct");

			// re-insert 1004 @ 1029 (index 0)
			oN1004Subtree = oBinding.addContexts(oN1029.context, oN1004Subtree);
			assert.equal(oBinding.getLength(), 626, "Length after re-insert(1001) @ 1029 is correct");

			// collapse (1002) --> 1004 should not be counted when collapsing 1002, since it is re-inserted in a different sub-tree
			oBinding.collapse(oN1002, true);
			assert.equal(oBinding.getLength(), 621, "Length after collapse(1002) is correct = 626 - 6 + 1");

			// expand (1002)
			oBinding.expand(oN1002, true);
			assert.equal(oBinding.getLength(), 626, "Length after expand(1002) is correct = 626 again");

			// collapse (1001) --> 1004 should not be counted when collapsing 1001, since it is re-inserted in a different sub-tree
			// so the length should be 600 instead of 599 (see first assertion of this test)
			oBinding.collapse(oN1001, true);
			assert.equal(oBinding.getLength(), 600, "Length after collapse(1001) is correct = 600");

			// expand(1004) --> load children
			oBinding.attachChange(handler2);
			oBinding.expand(oN1004, true);
		}

		function handler2 (oEvent) {
			oBinding.detachChange(handler2);

			assert.equal(oBinding.getLength(), 663, "Length after expand(1004) & loading children is correct");

			// collapse (1004) again
			oBinding.collapse(oN1004, true);
			assert.equal(oBinding.getLength(), 600, "Length after collapse(1004) is correct (600 again)");

			// collapse (1029) again
			// new length = 626 - mag(1001) - mag(1029) - 1*
			// *1 = 1001 is removed
			// mag(1001) = 27; mag(1029) = 21;
			oBinding.collapse(oN1029, true);
			assert.equal(oBinding.getLength(), 577, "Length after collapse(1029) is correct (577)");

			done();
		}

		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 200, 0);
	});

	QUnit.test("Length calculation - expand & remove initially collapsed node - no re-insert", function(assert){

		var done = assert.async();
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		var oN1004;

		function handler1 (oEvent) {
			oBinding.detachChange(handler1);

			oN1004 = oBinding.findNode(3);

			// expand
			oBinding.attachChange(handler2);
			oBinding.expand(oN1004, true);
		}

		function handler2 () {
			oBinding.detachChange(handler2);

			assert.equal(oBinding.getLength(), 689, "Length after expand(1004) is correct.");

			// collapse
			oBinding.collapse(oN1004, true);
			assert.equal(oBinding.getLength(), 626, "Length after collapse(1004) is correct.");

			// re-expand
			oBinding.expand(oN1004, true);
			assert.equal(oBinding.getLength(), 689, "Length after expand(1004) is correct.");

			// remove context
			/*oN1004Subtree = */oBinding.removeContext(oN1004.context);
			assert.equal(oBinding.getLength(), 625);

			done();
		}

		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 200, 0);
	});

	QUnit.test("Length calculation - remove collapsed node - remove old parent - insert in initially collapsed node", function(assert){

		var done = assert.async();
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		var oN1001, oN1002, oN1004, oN1031;
		var oN1001Subtree;
		var oN1004Subtree;

		function handler1 (oEvent) {
			oBinding.detachChange(handler1);

			oN1001 = oBinding.findNode(0);
			oN1002 = oBinding.findNode(1);
			oN1004 = oBinding.findNode(3);
			oN1031 = oBinding.findNode(30);

			// remove 1004
			oN1004Subtree = oBinding.removeContext(oN1004.context);
			assert.equal(oBinding.getLength(), 625, "Length after remove(1004) is correct");

			// remove 1001
			oN1001Subtree = oBinding.removeContext(oN1001.context);
			assert.equal(oBinding.getLength(), 598, "Length after remove(1001) is correct");

			// add 1004 in 1031
			oBinding.addContexts(oN1031.context, oN1004Subtree);
			assert.equal(oBinding.getLength(), 598, "Length after add(1031, 1004) did not change, 1031 is still collapsed");

			// expand
			oBinding.attachChange(handler2);
			oBinding.expand(oN1031, true);
		}

		function handler2 () {
			oBinding.detachChange(handler2);

			assert.equal(oBinding.getLength(), 599, "Length after expand(1031) is correct -> 598 + 1 for node 1004");

			// expand
			oBinding.attachChange(handler3);
			oBinding.expand(oN1004, true);
		}

		function handler3 () {
			oBinding.detachChange(handler3);

			assert.equal(oBinding.getLength(), 662, "Length after expand(1004) is correct");

			// collapse (1004)
			oBinding.collapse(oN1004, true);
			assert.equal(oBinding.getLength(), 599, "Length after collapse(1004) is correct.");

			// add 1001 in 1004
			oBinding.addContexts(oN1004.context, oN1001Subtree);
			assert.equal(oBinding.getLength(), 599, "Length after add(1004, 1001) did not change -> 1004 is still collapsed");

			// expand 1004
			oBinding.expand(oN1004, true);
			assert.equal(oBinding.getLength(), 689, "Length after expand(1004) is correct -> 1001 is fully contained inside");

			// collapse 1002
			oBinding.collapse(oN1002, true);
			assert.equal(oBinding.getLength(), 684, "Length after collapse(1002) -> 1002 is the old parent of 1004 -> 1002 is now a child of 1004");

			done();
		}

		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 200, 0);
	});

	QUnit.test("Length calculation - remove node A - insert in initially collapsed node B - remove node C - insert in first node A - remove node B", function(assert){

		var done = assert.async();
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		var oN1001, oN1004, oN1005, oN1630;
		var oN1004Subtree;
		var oN1630Subtree;

		function handler1 (oEvent) {
			oBinding.detachChange(handler1);

			oN1001 = oBinding.findNode(0);
			oN1004 = oBinding.findNode(3);
			oN1005 = oBinding.findNode(4);

			// remove 1004
			oN1004Subtree = oBinding.removeContext(oN1004.context);
			assert.equal(oBinding.getLength(), 625, "Length after remove(1004) is correct");

			// add 1004 in 1031
			oBinding.addContexts(oN1005.context, oN1004Subtree);
			assert.equal(oBinding.getLength(), 625, "Length after add(1005, 1004) did not change, 1005 is still collapsed");

			// expand 1005
			oBinding.attachChange(handler2);
			oBinding.expand(oN1005, true);
		}

		function handler2 () {
			oBinding.detachChange(handler2);

			assert.equal(oBinding.getLength(), 634, "Length after expand(1005) is correct -> 625 + 9 (8 children + node 1004)");

			oN1630 = oBinding.findNode(5);

			// remove 1630
			oN1630Subtree = oBinding.removeContext(oN1630.context);
			assert.equal(oBinding.getLength(), 633, "Length after remove(1630) is correct, -1 than before the remove");

			// collapse 1005
			oBinding.collapse(oN1005, true);
			assert.equal(oBinding.getLength(), 625, "Length after collapse(1005) is correct -> subtree modifications are not counted");

			//expand 1005
			oBinding.expand(oN1005, true);
			assert.equal(oBinding.getLength(), 633, "Length after expand(1005) is correct");

			// add 1630 in 1004
			oBinding.addContexts(oN1004.context, oN1630Subtree);
			assert.equal(oBinding.getLength(), 633, "Length after add(1004, 1630) did not change -> 1004 still collapsed");

			// expand
			oBinding.attachChange(handler3);
			oBinding.expand(oN1004, true);
		}

		function handler3 () {
			oBinding.detachChange(handler3);

			assert.equal(oBinding.getLength(), 697, "Length after expand(1004) is correct -> start(633) + children_1004(63) + node_1630(1) = 697");

			// collapse 1004
			oBinding.collapse(oN1004, true);
			assert.equal(oBinding.getLength(), 633, "Length after collapse(1004) is 633 again");

			// expand 1004 again
			oBinding.expand(oN1004, true);
			assert.equal(oBinding.getLength(), 697, "Length after re-expand(1004) is correct");

			// expand 1630 (inside 1004)
			oBinding.attachChange(handler4);
			oBinding.expand(oN1630, true);

		}

		function handler4 () {
			oBinding.detachChange(handler4);

			assert.equal(oBinding.getLength(), 700, "Length after expand(1630) is correct -> 697 + 3");

			// collapse 1004
			oBinding.collapse(oN1004, true);
			assert.equal(oBinding.getLength(), 633, "Length after collapse (1004) is correct -> 700 - children_nod1630(3 - node_1630(1) - children_1004(63)");

			// expand 1004 again
			oBinding.expand(oN1004, true);
			assert.equal(oBinding.getLength(), 700, "Length after re-expand(1004) is correct");

			// re-remove 1004 again
			oN1004Subtree = oBinding.removeContext(oN1004.context);
			assert.equal(oBinding.getLength(), 632, "Length after re-remove (1004) is correct -> 633 - 1");

			// collapse 1001
			oBinding.collapse(oN1001, true);
			assert.equal(oBinding.getLength(), 599, "Length is correct after collapse (1001) -> all previous subtree modifications are ignored");

			// re-expand 1001
			oBinding.expand(oN1001, true);
			assert.equal(oBinding.getLength(), 632, "Length after re-expand(1001) is correct");

			// re-insert 1004 in 1001
			oBinding.addContexts(oN1001.context, oN1004Subtree);
			assert.equal(oBinding.getLength(), 700, "Length after re-insert 1004 in 1001 is correct -> 632 + 68 = 700 again");

			done();
		}

		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 200, 0);
	});

	QUnit.test("Length calculation - Move Node from upper Subtree to a lower Subtree (index-wise) - remove old parent of moved node", function(assert){

		var done = assert.async();
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		var oN1001, oN1002, oN1004, oN1012;
		var oN1004Subtree;

		function handler1 (oEvent) {
			oBinding.detachChange(handler1);

			oN1001 = oBinding.findNode(0);
			oN1002 = oBinding.findNode(1);
			oN1004 = oBinding.findNode(3);
			oN1012 = oBinding.findNode(11);

			// remove 1004
			oN1004Subtree = oBinding.removeContext(oN1004.context);
			assert.equal(oBinding.getLength(), 625, "Length after remove(1004) is correct");

			// add 1004 in 1001
			oBinding.addContexts(oN1001.context, oN1004Subtree);
			assert.equal(oBinding.getLength(), 626, "Length after add(1001, 1004) is correct --> initial length 626 again");

			// expand 1004
			oBinding.attachChange(handler2);
			oBinding.expand(oN1004, true);
		}

		function handler2 () {
			oBinding.detachChange(handler2);

			assert.equal(oBinding.getLength(), 689, "Length after expand(1004) is correct");

			// re-remove 1004
			oN1004Subtree = oBinding.removeContext(oN1004.context);
			assert.equal(oBinding.getLength(), 625, "Length after re-remove is correct");

			// re-add 1004 in 1012
			oBinding.addContexts(oN1012.context, oN1004Subtree);
			assert.equal(oBinding.getLength(), 689, "Length after re-add of 1004 in 1012 is correct");

			// remove 1002
			// why 683?
			// previous value 689, - mag(1002) - 1002; mag(1002) = 6, initially 7 but -1 for
			oN1004Subtree = oBinding.removeContext(oN1002.context);
			assert.equal(oBinding.getLength(), 683, "Length after remove 1002 is correct -> 689 - 6");

			// collapse 1001
			oBinding.collapse(oN1001, true);
			assert.equal(oBinding.getLength(), 599, "Length after collapse 1001 is correct, 1001 is the outer parent of 1002 and 1004");

			done();
		}

		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 200, 0);
	});

	QUnit.module("create new node", {
		beforeEach: function() {
			fnSetupNewMockServer();
			oModel = new ODataModel(sServiceUrl, {useBatch:false});
			return oModel.metadataLoaded();
		},
		afterEach: function() {
			oMockServer.stop();
			oModel.destroy();
		}
	});

	function createContext(iNodeId) {
		var oContext = oModel.createEntry("orgHierarchy");
		oModel.setProperty("DESCRIPTION", "New Node - " + iNodeId, oContext);
		oModel.setProperty("DRILLDOWN_STATE", "leaf", oContext);
		oModel.setProperty("HIERARCHY_NODE", "" + iNodeId, oContext);
		oModel.setProperty("MAGNITUDE", 0, oContext);

		return oContext;
	}

	QUnit.test("Create new node and added to a node which already has children", function(assert) {

		var done = assert.async();
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		var oN1001;

		function handler1() {
			oBinding.detachChange(handler1);
			assert.equal(oBinding.getLength(), 626, "There are 626 items in total");

			oN1001 = oBinding.findNode(0);
			var oContext = createContext(3000);
			oBinding.addContexts(oN1001.context, [oContext]);
			assert.equal(oN1001.addedSubtrees.length, 1, "Node 1001 has an added node");
			assert.strictEqual(oN1001.addedSubtrees[0]._getSubtree()[0].context, oContext, "The node is correctly added");
			assert.equal(oBinding.getLength(), 627, "The length is increased by 1 after added a new node");

			done();
		}

		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 10, 10);
	});

	QUnit.test("Create new node and added to a leaf node", function(assert) {

		var done = assert.async();
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		//leaf node
		var oN1017;

		function handler1() {
			oBinding.detachChange(handler1);
			assert.equal(oBinding.getLength(), 626, "There are 626 items in total");

			oN1017 = oBinding.findNode(16);
			assert.equal(oModel.getProperty("DRILLDOWN_STATE", oN1017.context), "leaf", "Node 1017 is a leaf node");

			var oContext = createContext(3000);
			oBinding.addContexts(oN1017.context, [oContext]);
			assert.equal(oN1017.addedSubtrees.length, 1, "Node 1001 has an added node");
			assert.strictEqual(oN1017.addedSubtrees[0]._getSubtree()[0].context, oContext, "The node is correctly added");
			assert.equal(oBinding.getLength(), 626, "The length is not yet increased by 1 after added a new node");
			assert.equal(oBinding.hasChildren(oN1017.context), true, "Node 1017 is not a leaf node anymore but collapsed");
			assert.ok(!oN1017.nodeState.isLeaf, "Node 1017 isn't a leaf anymore");
			assert.ok(oN1017.nodeState.collapsed, "Node 1017 is collapsed");

			oBinding.expand(oN1017);
			assert.equal(oBinding.getLength(), 627, "The length is increased by 1 after the parent of added new node is expanded");

			done();
		}

		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 20, 10);
	});

	QUnit.test("Create a new node under a parent and move to another parent", function(assert) {

		var done = assert.async();
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		var oN1002, oN1003, oN1004;

		function handler1() {
			oBinding.detachChange(handler1);
			assert.equal(oBinding.getLength(), 626, "There are 626 items in total");

			oN1002 = oBinding.findNode(1);
			oN1003 = oBinding.findNode(2);
			oN1004 = oBinding.findNode(3);

			var oContext = createContext(3000);
			oBinding.addContexts(oN1004.context, [oContext]);
			assert.equal(oBinding.getLength(), 626, "The length is not yet increased because the parent is still collapsed");

			oBinding.expand(oN1004);
			assert.equal(oBinding.getLength(), 627, "The length is increased by 1 after the parent of added new node is expanded");

			var oHandle = oBinding.removeContext(oContext);
			assert.equal(oBinding.getLength(), 626, "The length is 626 after the newly added node is removed");

			oBinding.addContexts(oN1003.context, oHandle);
			assert.equal(oBinding.getLength(), 626, "The length is not yet increased because the parent is still collapsed");

			oBinding.expand(oN1003);
			assert.equal(oBinding.getLength(), 627, "The length is increased by 1 after the parent of added new node is expanded");

			oBinding.collapse(oN1002);
			assert.equal(oBinding.getLength(), 620, "The length is correct after collapse the parent");

			done();
		}

		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 20);
	});

	QUnit.test("Create a new node, add to a parent, move some node to the new node, and finally collapse the top parent", function(assert) {

		var done = assert.async();
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		var oN1001, oN1002, oN1010;

		function handler1() {
			oBinding.detachChange(handler1);
			assert.equal(oBinding.getLength(), 626, "There are 626 items in total");

			oN1001 = oBinding.findNode(0);
			oN1002 = oBinding.findNode(1);
			oN1010 = oBinding.findNode(9);

			var oContext = createContext(3000);
			oBinding.addContexts(oN1010.context, [oContext]);
			oBinding.expand(oN1010);
			var oHandle = oBinding.removeContext(oN1002.context);
			oBinding.addContexts(oContext, oHandle);

			var oNode = oBinding._findNodeByContext(oContext);
			oBinding.expand(oNode.node);
			assert.equal(oBinding.getLength(), 627, "There are now 627 items in total");

			oBinding.collapse(oN1001);
			assert.equal(oBinding.getLength(), 599, "There are now 599 items after collapse the top parent");

			done();
		}

		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 20);
	});

	QUnit.test("Nested newly created nodes", function(assert) {

		var done = assert.async();
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		var oN1001;

		function handler1() {
			oBinding.detachChange(handler1);
			assert.equal(oBinding.getLength(), 626, "There are 626 items in total");

			oN1001 = oBinding.findNode(0);

			var oContext1 = createContext(3000),
				oContext2 = createContext(3001);
			oBinding.addContexts(oN1001.context, [oContext1]);
			oBinding.addContexts(oContext1, [oContext2]);
			assert.equal(oBinding.getLength(), 627, "There are now 627 items before expanding the second new node");


			var oNode = oBinding._findNodeByContext(oContext1);
			oBinding.expand(oNode.node);
			assert.equal(oBinding.getLength(), 628, "There are now 628 items in total");

			done();
		}

		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 20);
	});

	QUnit.test("Remove & Selection Index Calculation", function(assert) {

		var done = assert.async();
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		var oN1002, oN1004;

		function handler1() {
			oBinding.detachChange(handler1);

			oN1002 = oBinding.findNode(1);
			oN1004 = oBinding.findNode(3);

			oBinding.setSelectedIndex(3);

			assert.equal(oBinding.getSelectedIndex(), 3, "Lead selection index is correct");

			var oN1004Subtree = oBinding.removeContext(oN1004.context);

			assert.equal(oBinding.getSelectedIndex(), -1, "Lead selection after remove of lead context is correct");

			//oN1004Subtree
			oBinding.addContexts(oN1002.context, oN1004Subtree);

			oBinding.setSelectedIndex(2);

			assert.equal(oBinding.getSelectedIndex(), 2, "Selecting re-inserted node works");

			done();
		}

		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 20);
	});
});