QUnit.module("ODataTreeBinding - AutoExpand", {
	beforeEach: function() {
		fnSetupNewMockServer();
		oModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl, {useBatch:false});
	},
	afterEach: function() {
		oMockServer.stop();
		delete oModel;
	}
});

QUnit.test("Selection", function(assert){

	var done = assert.async();
	oModel.attachMetadataLoaded(function() {
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		function handler1 (oEvent) {
			oBinding.detachChange(handler1);

			// contexts should be now loaded
			oBinding.setSelectedIndex(1);
			equal(oBinding.getSelectedIndex(), 1, "Selected index should be 1");

			ok(bSelectionChanged, "selectionChanged event fired");
			ok(!bSelectAll, "selectionChanged event don't sets selectAll");
			bSelectionChanged= false;
			bSelectAll = false;

			oBinding.setSelectionInterval(2, 4);
			equal(oBinding.getSelectedIndex(), 4, "Selected index should be the biggest index in the selection interval");
			deepEqual(oBinding.getSelectedIndices(), [2,3,4], "Selected indices are [2,3,4]");

			oBinding.addSelectionInterval(5, 0);
			equal(oBinding.getSelectedIndex(), 5, "Selected index should be the biggest index in the selection interval");
			deepEqual(oBinding.getSelectedIndices(), [0,1,2,3,4,5], "Selected indices are [0,1,2,3,4,5]");

			oBinding.removeSelectionInterval(1,1);
			equal(oBinding.getSelectedIndex(), 5, "Selected index should be the biggest index in the selection interval");
			deepEqual(oBinding.getSelectedIndices(), [0,2,3,4,5], "Selected indices are [0,2,3,4,5]");

			// 1. select a parent and two of its children
			// 2. collapse parent and expand it again
			// 3. check whether the two children are deselected
			oBinding.setSelectionInterval(1, 3);
			equal(oBinding.getSelectedIndex(), 3, "Selected index should be the biggest index in the selection interval");
			deepEqual(oBinding.getSelectedIndices(), [1,2,3], "Selected indices are [1,2,3]");
			oBinding.collapse(1);
			equal(oBinding.getSelectedIndex(), -1, "The lead selection index is cleared");
			oBinding.expand(1);
			equal(oBinding.getSelectedIndex(), -1, "The lead selection index is cleared");
			deepEqual(oBinding.getSelectedIndices(), [1], "Only the parent should be selected");

			// 1. select a parent's children on different level
			// 2. collapse parent and expand it again
			// 3. check whether the children are deselected
			oBinding.setSelectionInterval(2,3);
			oBinding.addSelectionInterval(8,9);
			equal(oBinding.getSelectedIndex(), 9, "Selected index should be the biggest index in the selection interval");
			deepEqual(oBinding.getSelectedIndices(), [2,3,8,9], "Selected indices are [2,3,8,9]");
			oBinding.collapse(0);
			oBinding.expand(0);
			equal(oBinding.getSelectedIndex(), -1, "The lead selection index should be cleared");
			deepEqual(oBinding.getSelectedIndices(), [], "No node is selected");

			// 1. manually expand a node
			// 2. select manually loaded nodes and nodes on other level
			// 3. collapse their parent and expand it again
			// 4. check whether nodes are correctly deselected
			oBinding.attachChange(handler2);
			oBinding.expand(4, true);
		}

		function handler2 (oEvent) {
			oBinding.detachChange(handler2);
			oBinding.setSelectedIndex(2);
			oBinding.addSelectionInterval(4, 6);
			equal(oBinding.getSelectedIndex(), 6, "Selected index should be the biggest index in the selection interval");
			deepEqual(oBinding.getSelectedIndices(), [2,4,5,6], "Selected indices are [2,4,6]");
			oBinding.collapse(1);
			oBinding.expand(1);
			equal(oBinding.getSelectedIndex(), -1, "The lead selection index should be cleared");
			deepEqual(oBinding.getSelectedIndices(), [], "No node is selected");

			// 1. select a node which is after the node that will be expanded in the next step
			// 2. expand a node before the selected node
			// 3. select some of the manually expanded node
			// 4. collapse the expaned node
			// 5. check whether the first selected node is still selected
			oBinding.setSelectedIndex(4);
			oBinding.attachChange(handler3);
			oBinding.expand(3, true);
		}

		function handler3 (oEvent) {
			oBinding.detachChange(handler3);

			oBinding.addSelectionInterval(4, 6);
			equal(oBinding.getSelectedIndex(), 6, "Selected index should be the biggest index in the selection interval");
			deepEqual(oBinding.getSelectedIndices(), [4,5,6,67], "Selected indices are [4,5,6,67]");
			oBinding.collapse(3);
			equal(oBinding.getSelectedIndex(), -1, "The lead selection index is cleared");
			deepEqual(oBinding.getSelectedIndices(), [4], "Selected indices are [4]");

			done();
		}

		var bSelectionChanged = false;
		var bSelectAll = false;
		function handlerSelectionChanged (oEvent) {
			bSelectionChanged = true;
			bSelectAll = oEvent.getParameter("selectAll");
		}

		oBinding.attachChange(handler1);
		oBinding.attachSelectionChanged(handlerSelectionChanged);
		oBinding.getContexts(0, 10);
	});
});

QUnit.test("Select All", function(assert) {

	var done = assert.async();
	oModel.attachMetadataLoaded(function() {
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		function handler1 (oEvent) {
			oBinding.detachChange(handler1);
			oBinding.selectAll();
			equal(oBinding.getSelectedIndex(), 9, "The last selected node sets the selected index");
			equal(oBinding.getSelectedIndices().length, 10, "All loaded nodes are now selected");

			ok(bSelectionChanged, "selectionChanged event fired");
			ok(bSelectAll, "selectionChanged event sets selectAll");
			bSelectionChanged= false;
			bSelectAll = false;

			// 1. Collapse a node and expand it again
			// 2. Its children aren't selected anymore
			oBinding.collapse(1);
			oBinding.expand(1);
			ok(!oBinding.isIndexSelected(2), "Child isn't selected anymore");
			ok(!oBinding.isIndexSelected(7), "Child isn't selected anymore");

			// 1. Select all nodes
			// 2. Manually expand a node
			// 3. Newly loaded nodes are not selected
			oBinding.selectAll();
			ok(oBinding.isIndexSelected(3), "The node that is going to be expanded is selected");
			oBinding.attachChange(handler2);
			oBinding.expand(3, true);
		}

		function handler2 (oEvent) {
			oBinding.detachChange(handler2);
			ok(!oBinding.isIndexSelected(4), "The newly loaded node isn't selected");
			ok(!oBinding.isIndexSelected(66), "The newly loaded node isn't selected");

			oBinding.getContexts(100, 10);
			oBinding.attachChange(handler3);
		}

		function handler3 (oEvent) {
			oBinding.detachChange(handler3);
			ok(oBinding.isIndexSelected(100), "The newly paged node should still be selected");
			ok(oBinding.isIndexSelected(109), "The newly paged node should still be selected");
			done();
		}

		var bSelectionChanged = false;
		var bSelectAll = false;
		function handlerSelectionChanged (oEvent) {
			bSelectionChanged = true;
			bSelectAll = oEvent.getParameter("selectAll");
		}

		oBinding.attachChange(handler1);
		oBinding.attachSelectionChanged(handlerSelectionChanged);
		oBinding.getContexts(0, 10);
	});
});

/*
	Select all: Read only
*/
QUnit.test("getSelectedNodesCount with recursive collapse - read only", function(assert){
	var done = assert.async();
	oModel.attachMetadataLoaded(function() {
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		var handler1 = function () {
			oBinding.detachChange(handler1);

			oBinding.selectAll();
			equal(oBinding.getSelectedNodesCount(), 626, "Correct selected nodes count after selectAll call");

			oBinding.collapse(1);
			equal(oBinding.getSelectedNodesCount(), 620, "Correct selected nodes count after collapse of first first-level node");

			oBinding.expand(1);
			equal(oBinding.getSelectedNodesCount(), 620, "Correct selected nodes count after expanding of first first-level node again");
			equal(oBinding.getLength(), 626, "Correct binding length");

			oBinding.removeSelectionInterval(1, 1);
			equal(oBinding.getSelectedNodesCount(), 619, "Correct selected nodes count after explicitly deselecting node under a selectAllMode parent");

			done();
		};

		oBinding.attachChange(handler1);
		oBinding.getContexts(0, 100);
	});
});

QUnit.test("getSelectedNodesCount without recursive collapse - read only", function(assert){

	var done = assert.async();
	oModel.attachMetadataLoaded(function() {
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		var handler1 = function () {
			oBinding.detachChange(handler1);

			oBinding.setCollapseRecursive(false);
			oBinding.selectAll();
			equal(oBinding.getSelectedNodesCount(), 626, "Correct selected nodes count after selectAll call");

			oBinding.collapse(1);
			equal(oBinding.getSelectedNodesCount(), 620, "Correct selected nodes count after collapse of first first-level node");

			oBinding.expand(1);
			equal(oBinding.getSelectedNodesCount(), 626, "Correct selected nodes count after expanding of first first-level node again");
			equal(oBinding.getLength(), 626, "Correct binding length");

			oBinding.removeSelectionInterval(1, 1);
			equal(oBinding.getSelectedNodesCount(), 625, "Correct selected nodes count after explicitly deselecting node under a selectAllMode parent");

			done();
		};

		oBinding.attachChange(handler1);
		oBinding.getContexts(0, 100);
	});
});

QUnit.test("getSelectedNodesCount with expand - read only", function(assert){

	var done = assert.async();
	oModel.attachMetadataLoaded(function() {
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		var handler1 = function () {
			oBinding.detachChange(handler1);

			oBinding.selectAll();
			equal(oBinding.getSelectedNodesCount(), 626, "Correct selected nodes count after selectAll call");
			equal(oBinding.getLength(), 626, "Correct binding length");

			oBinding.attachChange(handler2);
			oBinding.expand(3, true);

		};

		var handler2 = function() {
			oBinding.detachChange(handler2);
			equal(oBinding.getSelectedNodesCount(), 626, "After expand, no additional nodes get selected");
			equal(oBinding.getLength(), 689, "Correct binding length");

			done();
		};

		oBinding.attachChange(handler1);
		oBinding.getContexts(0, 100);
	});
});

QUnit.test("getSelectedNodesCount with expand to level", function(assert){

	var done = assert.async();
	oModel.attachMetadataLoaded(function() {
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 1
		});

		var handler1 = function () {
			oBinding.detachChange(handler1);

			oBinding.selectAll();
			equal(oBinding.getSelectedNodesCount(), 104, "Correct selected nodes count after selectAll call");
			equal(oBinding.getLength(), 104, "Correct binding length");

			oBinding.attachChange(handler2);
			oBinding.setNumberOfExpandedLevels(2);

		};

		var handler2 = function() {
			oBinding.detachChange(handler2);
			oBinding.attachChange(handler3);
				oBinding.getContexts(0, 100);
		};
		var handler3 = function() {
			oBinding.detachChange(handler2);
			equal(oBinding.getSelectedNodesCount(), 0, "After expand, nothing is selected (apparently)");	// TODO currently Flat binding looses all selections
																											// when changing number of expanded levels
																											// ODataTreeBinding is capable of this
			equal(oBinding.getLength(), 626, "Correct binding length");

			done();
		};

		oBinding.attachChange(handler1);
		oBinding.getContexts(0, 100);
	});
});

QUnit.test("getSelectedNodesCount with paging - read only", function(assert){

	var done = assert.async();
	oModel.attachMetadataLoaded(function() {
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		var handler1 = function () {
			oBinding.detachChange(handler1);

			oBinding.selectAll();
			equal(oBinding.getSelectedNodesCount(), 626, "Correct selected nodes count after selectAll call");
			equal(oBinding.getLength(), 626, "Correct binding length");

			done();
		};

		oBinding.attachChange(handler1);
		oBinding.getContexts(128, 64);
	});
});

/*
	Select all: Write
*/
QUnit.test("getSelectedNodesCount with recursive collapse - write", function(assert){
	var done = assert.async();
	oModel.attachMetadataLoaded(function() {
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		var handler1 = function () {
			oBinding.detachChange(handler1);
			oBinding.removeContext(oBinding.getContextByIndex(2)); // force write-mode

			oBinding.selectAll();
			equal(oBinding.getSelectedNodesCount(), 625, "Correct selected nodes count after selectAll call");

			oBinding.collapse(1);
			equal(oBinding.getSelectedNodesCount(), 620, "Correct selected nodes count after collapse of first first-level node");

			oBinding.expand(1);
			equal(oBinding.getSelectedNodesCount(), 620, "Correct selected nodes count after expanding of first first-level node again");
			equal(oBinding.getLength(), 625, "Correct binding length");

			oBinding.removeSelectionInterval(1, 1);
			equal(oBinding.getSelectedNodesCount(), 619, "Correct selected nodes count after explicitly deselecting node under a selectAllMode parent");

			done();
		};

		oBinding.attachChange(handler1);
		oBinding.getContexts(0, 100);
	});
});

QUnit.test("getSelectedNodesCount without recursive collapse - write", function(assert){

	var done = assert.async();
	oModel.attachMetadataLoaded(function() {
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		var handler1 = function () {
			oBinding.detachChange(handler1);
			oBinding.removeContext(oBinding.getContextByIndex(2)); // force write-mode

			oBinding.setCollapseRecursive(false);
			oBinding.selectAll();
			equal(oBinding.getSelectedNodesCount(), 625, "Correct selected nodes count after selectAll call");

			oBinding.collapse(1);
			equal(oBinding.getSelectedNodesCount(), 620, "Correct selected nodes count after collapse of first first-level node");

			oBinding.expand(1);
			equal(oBinding.getSelectedNodesCount(), 625, "Correct selected nodes count after expanding of first first-level node again");
			equal(oBinding.getLength(), 625, "Correct binding length");

			oBinding.removeSelectionInterval(1, 1);
			equal(oBinding.getSelectedNodesCount(), 624, "Correct selected nodes count after explicitly deselecting node under a selectAllMode parent");

			done();
		};

		oBinding.attachChange(handler1);
		oBinding.getContexts(0, 100);
	});
});

QUnit.test("getSelectedNodesCount with paging - write", function(assert){

	var done = assert.async();
	oModel.attachMetadataLoaded(function() {
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		var handler1 = function () {
			oBinding.detachChange(handler1);
			oBinding.removeContext(oBinding.getContextByIndex(130)); // force write-mode

			oBinding.selectAll();
			equal(oBinding.getSelectedNodesCount(), 625, "Correct selected nodes count after selectAll call");
			equal(oBinding.getLength(), 625, "Correct binding length");

			done();
		};

		oBinding.attachChange(handler1);
		oBinding.getContexts(128, 64);
	});
});

QUnit.test("getSelectedIndices with initially collapsed (expanded) node and deep node (selected)", function(assert){

	var done = assert.async();
	oModel.attachMetadataLoaded(function() {
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		var oN1005;

		var handler1 = function () {
			oBinding.detachChange(handler1);

			oN1005 = oBinding.findNode(4);
			oBinding.expand(oN1005);

			oBinding.attachChange(handler2);
		};

		var handler2 = function () {
			oBinding.detachChange(handler2);

			oBinding.setSelectedIndex(8);

			deepEqual(oBinding.getSelectedIndices(), [8], "Selected indices are correct after expand of initially collapsed node.");

			oBinding.expand(5);

			oBinding.attachChange(handler3);
		};

		var handler3 = function () {
			oBinding.detachChange(handler3);

			deepEqual(oBinding.getSelectedIndices(), [11], "Selected indices are correct after expand of deep node.");

			done();
		};

		oBinding.attachChange(handler1);
		oBinding.getContexts(0, 128);
	});
});

QUnit.test("getSelectedIndices with deep node (expanded) node and deep node (selected)", function(assert){

	var done = assert.async();
	oModel.attachMetadataLoaded(function() {
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		var oN1005;

		var handler1 = function () {
			oBinding.detachChange(handler1);

			oN1005 = oBinding.findNode(4);
			oBinding.expand(oN1005);

			oBinding.attachChange(handler2);
		};

		var handler2 = function () {
			oBinding.detachChange(handler2);

			// 1632
			oBinding.expand(7);

			oBinding.attachChange(handler3);
		};

		var handler3 = function () {
			oBinding.detachChange(handler3);

			// 1642
			oBinding.setSelectedIndex(9);

			deepEqual(oBinding.getSelectedIndices(), [9], "Selected indices of deep node is correct initially.");

			// 1630
			oBinding.expand(5);

			oBinding.attachChange(handler4);
		};

		var handler4 = function () {
			oBinding.detachChange(handler4);

			deepEqual(oBinding.getSelectedIndices(), [12], "Selected indices of deep node is correct after expanding a previous deep node.");

			// 1630
			oBinding.collapse(5);
			deepEqual(oBinding.getSelectedIndices(), [9], "Selected indices of deep node is correct after collapse a previous expanded deep node.");

			done();
		};

		oBinding.attachChange(handler1);
		oBinding.getContexts(0, 128);
	});
});
