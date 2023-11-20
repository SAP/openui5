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

	QUnit.module("ODataTreeBinding - AutoExpand", {
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

	QUnit.test("Selection", function(assert){

		var done = assert.async();
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
			assert.equal(oBinding.getSelectedIndex(), 1, "Selected index should be 1");

			assert.ok(bSelectionChanged, "selectionChanged event fired");
			assert.ok(!bSelectAll, "selectionChanged event don't sets selectAll");
			bSelectionChanged = false;
			bSelectAll = false;

			oBinding.setSelectionInterval(2, 4);
			assert.equal(oBinding.getSelectedIndex(), 4, "Selected index should be the biggest index in the selection interval");
			assert.deepEqual(oBinding.getSelectedIndices(), [2,3,4], "Selected indices are [2,3,4]");

			oBinding.addSelectionInterval(5, 0);
			assert.equal(oBinding.getSelectedIndex(), 5, "Selected index should be the biggest index in the selection interval");
			assert.deepEqual(oBinding.getSelectedIndices(), [0,1,2,3,4,5], "Selected indices are [0,1,2,3,4,5]");

			oBinding.removeSelectionInterval(1,1);
			assert.equal(oBinding.getSelectedIndex(), 5, "Selected index should be the biggest index in the selection interval");
			assert.deepEqual(oBinding.getSelectedIndices(), [0,2,3,4,5], "Selected indices are [0,2,3,4,5]");

			// 1. select a parent and two of its children
			// 2. collapse parent and expand it again
			// 3. check whether the two children are deselected
			oBinding.setSelectionInterval(1, 3);
			assert.equal(oBinding.getSelectedIndex(), 3, "Selected index should be the biggest index in the selection interval");
			assert.deepEqual(oBinding.getSelectedIndices(), [1,2,3], "Selected indices are [1,2,3]");
			oBinding.collapse(1);
			assert.equal(oBinding.getSelectedIndex(), -1, "The lead selection index is cleared");
			oBinding.expand(1);
			assert.equal(oBinding.getSelectedIndex(), -1, "The lead selection index is cleared");
			assert.deepEqual(oBinding.getSelectedIndices(), [1], "Only the parent should be selected");

			// 1. select a parent's children on different level
			// 2. collapse parent and expand it again
			// 3. check whether the children are deselected
			oBinding.setSelectionInterval(2,3);
			oBinding.addSelectionInterval(8,9);
			assert.equal(oBinding.getSelectedIndex(), 9, "Selected index should be the biggest index in the selection interval");
			assert.deepEqual(oBinding.getSelectedIndices(), [2,3,8,9], "Selected indices are [2,3,8,9]");
			oBinding.collapse(0);
			oBinding.expand(0);
			assert.equal(oBinding.getSelectedIndex(), -1, "The lead selection index should be cleared");
			assert.deepEqual(oBinding.getSelectedIndices(), [], "No node is selected");

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
			assert.equal(oBinding.getSelectedIndex(), 6, "Selected index should be the biggest index in the selection interval");
			assert.deepEqual(oBinding.getSelectedIndices(), [2,4,5,6], "Selected indices are [2,4,6]");
			oBinding.collapse(1);
			oBinding.expand(1);
			assert.equal(oBinding.getSelectedIndex(), -1, "The lead selection index should be cleared");
			assert.deepEqual(oBinding.getSelectedIndices(), [], "No node is selected");

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
			assert.equal(oBinding.getSelectedIndex(), 6, "Selected index should be the biggest index in the selection interval");
			assert.deepEqual(oBinding.getSelectedIndices(), [4,5,6,67], "Selected indices are [4,5,6,67]");
			oBinding.collapse(3);
			assert.equal(oBinding.getSelectedIndex(), -1, "The lead selection index is cleared");
			assert.deepEqual(oBinding.getSelectedIndices(), [4], "Selected indices are [4]");

			done();
		}

		var bSelectionChanged = false;
		var bSelectAll = false;
		function handlerSelectionChanged (oEvent) {
			bSelectionChanged = true;
			bSelectAll = oEvent.getParameter("selectAll");
		}

		oBinding.attachChange(handler1);
		// refresh indicates that the adapter code has been loaded and the binding has been
		// successfully initialized
		oBinding.attachEventOnce("refresh", function () {
			oBinding.attachSelectionChanged(handlerSelectionChanged);
			oBinding.getContexts(0, 10);
		});
	});

	QUnit.test("Select All", function(assert) {

		var done = assert.async();
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		function handler1 (oEvent) {
			oBinding.detachChange(handler1);
			oBinding.selectAll();
			assert.equal(oBinding.getSelectedIndex(), 9, "The last selected node sets the selected index");
			assert.equal(oBinding.getSelectedIndices().length, 10, "All loaded nodes are now selected");

			assert.ok(bSelectionChanged, "selectionChanged event fired");
			assert.ok(bSelectAll, "selectionChanged event sets selectAll");
			bSelectionChanged = false;
			bSelectAll = false;

			// 1. Collapse a node and expand it again
			// 2. Its children aren't selected anymore
			oBinding.collapse(1);
			oBinding.expand(1);
			assert.ok(!oBinding.isIndexSelected(2), "Child isn't selected anymore");
			assert.ok(!oBinding.isIndexSelected(7), "Child isn't selected anymore");

			// 1. Select all nodes
			// 2. Manually expand a node
			// 3. Newly loaded nodes are not selected
			oBinding.selectAll();
			assert.ok(oBinding.isIndexSelected(3), "The node that is going to be expanded is selected");
			oBinding.attachChange(handler2);
			oBinding.expand(3, true);
		}

		function handler2 (oEvent) {
			oBinding.detachChange(handler2);
			assert.ok(!oBinding.isIndexSelected(4), "The newly loaded node isn't selected");
			assert.ok(!oBinding.isIndexSelected(66), "The newly loaded node isn't selected");

			oBinding.getContexts(100, 10);
			oBinding.attachChange(handler3);
		}

		function handler3 (oEvent) {
			oBinding.detachChange(handler3);
			assert.ok(oBinding.isIndexSelected(100), "The newly paged node should still be selected");
			assert.ok(oBinding.isIndexSelected(109), "The newly paged node should still be selected");
			done();
		}

		var bSelectionChanged = false;
		var bSelectAll = false;
		function handlerSelectionChanged (oEvent) {
			bSelectionChanged = true;
			bSelectAll = oEvent.getParameter("selectAll");
		}

		oBinding.attachChange(handler1);
		// refresh indicates that the adapter code has been loaded and the binding has been
		// successfully initialized
		oBinding.attachEventOnce("refresh", function () {
			oBinding.attachSelectionChanged(handlerSelectionChanged);
			oBinding.getContexts(0, 10);
		});
	});

	/*
		Select all: Read only
	*/
	QUnit.test("getSelectedNodesCount with recursive collapse - read only", function(assert){
		var done = assert.async();
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		var handler1 = function () {
			oBinding.detachChange(handler1);

			oBinding.selectAll();
			assert.equal(oBinding.getSelectedNodesCount(), 626, "Correct selected nodes count after selectAll call");

			oBinding.collapse(1);
			assert.equal(oBinding.getSelectedNodesCount(), 620, "Correct selected nodes count after collapse of first first-level node");

			oBinding.expand(1);
			assert.equal(oBinding.getSelectedNodesCount(), 620, "Correct selected nodes count after expanding of first first-level node again");
			assert.equal(oBinding.getLength(), 626, "Correct binding length");

			oBinding.removeSelectionInterval(1, 1);
			assert.equal(oBinding.getSelectedNodesCount(), 619, "Correct selected nodes count after explicitly deselecting node under a selectAllMode parent");

			done();
		};

		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 100);
	});

	QUnit.test("getSelectedNodesCount without recursive collapse - read only", function(assert){

		var done = assert.async();
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
			assert.equal(oBinding.getSelectedNodesCount(), 626, "Correct selected nodes count after selectAll call");

			oBinding.collapse(1);
			assert.equal(oBinding.getSelectedNodesCount(), 620, "Correct selected nodes count after collapse of first first-level node");

			oBinding.expand(1);
			assert.equal(oBinding.getSelectedNodesCount(), 626, "Correct selected nodes count after expanding of first first-level node again");
			assert.equal(oBinding.getLength(), 626, "Correct binding length");

			oBinding.removeSelectionInterval(1, 1);
			assert.equal(oBinding.getSelectedNodesCount(), 625, "Correct selected nodes count after explicitly deselecting node under a selectAllMode parent");

			done();
		};

		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 100);
	});

	QUnit.test("getSelectedNodesCount with expand - read only", function(assert){

		var done = assert.async();
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		var handler1 = function () {
			oBinding.detachChange(handler1);

			oBinding.selectAll();
			assert.equal(oBinding.getSelectedNodesCount(), 626, "Correct selected nodes count after selectAll call");
			assert.equal(oBinding.getLength(), 626, "Correct binding length");

			oBinding.attachChange(handler2);
			oBinding.expand(3, true);

		};

		var handler2 = function() {
			oBinding.detachChange(handler2);
			assert.equal(oBinding.getSelectedNodesCount(), 626, "After expand, no additional nodes get selected");
			assert.equal(oBinding.getLength(), 689, "Correct binding length");

			done();
		};

		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 100);
	});

	QUnit.test("getSelectedNodesCount with expand to level", function(assert){

		var done = assert.async();
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 1
		});

		var handler1 = function () {
			oBinding.detachChange(handler1);

			oBinding.selectAll();
			assert.equal(oBinding.getSelectedNodesCount(), 104, "Correct selected nodes count after selectAll call");
			assert.equal(oBinding.getLength(), 104, "Correct binding length");

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
			assert.equal(oBinding.getSelectedNodesCount(), 0, "After expand, nothing is selected (apparently)");	// TODO currently Flat binding looses all selections
																											// when changing number of expanded levels
																											// ODataTreeBinding is capable of this
			assert.equal(oBinding.getLength(), 626, "Correct binding length");

			done();
		};

		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 100);
	});

	QUnit.test("getSelectedNodesCount with paging - read only", function(assert){

		var done = assert.async();
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		var handler1 = function () {
			oBinding.detachChange(handler1);

			oBinding.selectAll();
			assert.equal(oBinding.getSelectedNodesCount(), 626, "Correct selected nodes count after selectAll call");
			assert.equal(oBinding.getLength(), 626, "Correct binding length");

			done();
		};

		oBinding.attachChange(handler1);
		requestData(oBinding, 128, 64);
	});

	/*
		Select all: Write
	*/
	QUnit.test("getSelectedNodesCount with recursive collapse - write", function(assert){
		var done = assert.async();
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
			assert.equal(oBinding.getSelectedNodesCount(), 625, "Correct selected nodes count after selectAll call");

			oBinding.collapse(1);
			assert.equal(oBinding.getSelectedNodesCount(), 620, "Correct selected nodes count after collapse of first first-level node");

			oBinding.expand(1);
			assert.equal(oBinding.getSelectedNodesCount(), 620, "Correct selected nodes count after expanding of first first-level node again");
			assert.equal(oBinding.getLength(), 625, "Correct binding length");

			oBinding.removeSelectionInterval(1, 1);
			assert.equal(oBinding.getSelectedNodesCount(), 619, "Correct selected nodes count after explicitly deselecting node under a selectAllMode parent");

			done();
		};

		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 100);
	});

	QUnit.test("getSelectedNodesCount without recursive collapse - write", function(assert){

		var done = assert.async();
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
			assert.equal(oBinding.getSelectedNodesCount(), 625, "Correct selected nodes count after selectAll call");

			oBinding.collapse(1);
			assert.equal(oBinding.getSelectedNodesCount(), 620, "Correct selected nodes count after collapse of first first-level node");

			oBinding.expand(1);
			assert.equal(oBinding.getSelectedNodesCount(), 625, "Correct selected nodes count after expanding of first first-level node again");
			assert.equal(oBinding.getLength(), 625, "Correct binding length");

			oBinding.removeSelectionInterval(1, 1);
			assert.equal(oBinding.getSelectedNodesCount(), 624, "Correct selected nodes count after explicitly deselecting node under a selectAllMode parent");

			done();
		};

		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 100);
	});

	QUnit.test("getSelectedNodesCount with paging - write", function(assert){

		var done = assert.async();
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
			assert.equal(oBinding.getSelectedNodesCount(), 625, "Correct selected nodes count after selectAll call");
			assert.equal(oBinding.getLength(), 625, "Correct binding length");

			done();
		};

		oBinding.attachChange(handler1);
		requestData(oBinding, 128, 64);
	});

	QUnit.test("getSelectedIndices with initially collapsed (expanded) node and deep node (selected)", function(assert){

		var done = assert.async();
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

			assert.deepEqual(oBinding.getSelectedIndices(), [8], "Selected indices are correct after expand of initially collapsed node.");

			oBinding.expand(5);

			oBinding.attachChange(handler3);
		};

		var handler3 = function () {
			oBinding.detachChange(handler3);

			assert.deepEqual(oBinding.getSelectedIndices(), [11], "Selected indices are correct after expand of deep node.");

			done();
		};

		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 128);
	});

	QUnit.test("getSelectedIndices with deep node (expanded) node and deep node (selected)", function(assert){

		var done = assert.async();
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

			assert.deepEqual(oBinding.getSelectedIndices(), [9], "Selected indices of deep node is correct initially.");

			// 1630
			oBinding.expand(5);

			oBinding.attachChange(handler4);
		};

		var handler4 = function () {
			oBinding.detachChange(handler4);

			assert.deepEqual(oBinding.getSelectedIndices(), [12], "Selected indices of deep node is correct after expanding a previous deep node.");

			// 1630
			oBinding.collapse(5);
			assert.deepEqual(oBinding.getSelectedIndices(), [9], "Selected indices of deep node is correct after collapse a previous expanded deep node.");

			done();
		};

		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 128);
	});

	QUnit.test("selectionChanged event with collapse", function(assert) {
		assert.expect(4);
		var done = assert.async();

		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		var handler1 = function() {
			oBinding.detachChange(handler1);
			oBinding.selectAll();

			var fnSelectionChangeHandler1 = function(oEvent) {
				oBinding.detachChange(fnSelectionChangeHandler1);
				assert.equal(oEvent.mParameters.leadIndex, 121, "Event: leadIndex should still be 121");
				assert.equal(oEvent.mParameters.oldIndex, 121, "Event: oldIndex should still be 121");
				assert.equal(oEvent.mParameters.rowIndices.length, 0, "Event: length of changedIndices should be 0");
				assert.equal(oEvent.mParameters.indexChangesCouldNotBeDetermined, true, "Index changes could not be determined");
				done();
			};

			oBinding.attachSelectionChanged(fnSelectionChangeHandler1);
			oBinding.collapse(1);
		};

		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 128);
	});

	QUnit.test("selectionChanged event with collapse: deselect of lead selection", function(assert) {
		assert.expect(4);
		var done = assert.async();

		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		var handler1 = function() {
			oBinding.detachChange(handler1);
			oBinding.setSelectedIndex(2);

			var fnSelectionChangeHandler1 = function(oEvent) {
				oBinding.detachChange(fnSelectionChangeHandler1);
				assert.equal(oEvent.mParameters.leadIndex, -1, "Event: leadIndex should be -1 (no lead selection)");
				assert.equal(oEvent.mParameters.oldIndex, -1, "Event: oldIndex should be -1 (could not be determined)");
				assert.equal(oEvent.mParameters.rowIndices.length, 0, "Event: length of changedIndices should be 1");
				assert.equal(oEvent.mParameters.indexChangesCouldNotBeDetermined, true, "Index changes could not be determined");
				done();
			};

			oBinding.attachSelectionChanged(fnSelectionChangeHandler1);
			oBinding.collapse(1);
		};

		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 128);
	});

	QUnit.test("selectionChanged event with collapseToLevel", function(assert) {
		assert.expect(4);
		var done = assert.async();

		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		var handler1 = function() {
			oBinding.detachChange(handler1);
			oBinding.selectAll();

			var fnSelectionChangeHandler1 = function(oEvent) {
				oBinding.detachChange(fnSelectionChangeHandler1);
				assert.equal(oEvent.mParameters.leadIndex, -1, "Event: leadIndex should be -1 (no lead selection)");
				assert.equal(oEvent.mParameters.oldIndex, 127, "Event: oldIndex should still be 127");
				assert.equal(oEvent.mParameters.rowIndices.length, 99, "Event: length of changedIndices should be 0");

				assert.deepEqual(oEvent.mParameters.rowIndices,
					[2, 3, 4, 5, 6, 7, 9, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 27, 30, 31, 32, 33, 34, 35, 37, 38, 39, 40, 41, 42,
					43, 44, 45, 46, 47, 48, 49, 52, 54, 60, 63, 64, 65, 66, 67, 68, 69, 70, 72, 74, 75, 76, 77, 78, 79, 80, 81, 83, 84, 85, 86, 88, 89,
					90, 91, 92, 94, 95, 96, 97, 98, 99, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 114, 115, 116, 117, 118, 119, 120, 121,
					124, 125, 126, 127], "Changed indices after collapse is correct");
				done();
			};

			oBinding.attachSelectionChanged(fnSelectionChangeHandler1);
			oBinding.collapseToLevel(1);
		};

		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 128);
	});

	QUnit.test("selectionChanged event with collapseToLevel: deselect of lead selection", function(assert) {
		assert.expect(4);
		var done = assert.async();

		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		var handler1 = function() {
			oBinding.detachChange(handler1);
			oBinding.setSelectedIndex(2);

			var fnSelectionChangeHandler1 = function(oEvent) {
				oBinding.detachChange(fnSelectionChangeHandler1);
				assert.equal(oEvent.mParameters.leadIndex, -1, "Event: leadIndex should be -1 (no lead selection)");
				assert.equal(oEvent.mParameters.oldIndex, 2, "Event: oldIndex should be 2");
				assert.equal(oEvent.mParameters.rowIndices.length, 1, "Event: length of changedIndices should be 1");

				assert.deepEqual(oEvent.mParameters.rowIndices, [2], "Changed indices after collapse is correct");
				done();
			};

			oBinding.attachSelectionChanged(fnSelectionChangeHandler1);
			oBinding.collapseToLevel(1);
		};

		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 128);
	});
});