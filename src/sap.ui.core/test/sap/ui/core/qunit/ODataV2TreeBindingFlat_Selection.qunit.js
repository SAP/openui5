module("ODataTreeBinding - AutoExpand", {
	setup: function() {
		oMockServer.start();
		oModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl, {useBatch:false});
	},
	teardown: function() {
		oMockServer.stop();
		delete oModel;
	}
});

asyncTest("Selection", function(){
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

			start();
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

asyncTest("Select All", function() {
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
			start();
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
