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

asyncTest("Manually expand a node", function(){
	oModel.attachMetadataLoaded(function() {
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		function handler1 (oEvent) {
			oBinding.detachChange(handler1);
			ok(!oBinding.isExpanded(3), "The node which is going to be expanded is currently collapsed");

			oBinding.attachChange(handler2);
			oBinding.expand(3, true);
		}

		function handler2 (oEvent) {
			oBinding.detachChange(handler2);

			var oParent = oBinding.findNode(3),
				oChild, i;
			for (i = 4 ; i < 10 ; i++) {
				oChild = oBinding.findNode(i);
				ok(oBinding._isInSubtree(oParent, oChild), "Children are loaded");
			}

			oBinding.attachChange(handler3);
			oBinding.getContexts(65, 10);
		}

		function handler3 (oEvent) {
			oBinding.detachChange(handler3);
			var oParent = oBinding.findNode(3),
				oChild;

			oChild = oBinding.findNode(65);
			ok(oBinding._isInSubtree(oParent, oChild), "Child is loaded");
			oChild = oBinding.findNode(66);
			ok(oBinding._isInSubtree(oParent, oChild), "Child is loaded");

			start();
		}

		oBinding.attachChange(handler1);
		oBinding.getContexts(0, 10, 10);
	});
});

asyncTest("Manually expand two levels and collapse the parent", function(){
	oModel.attachMetadataLoaded(function() {
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		function handler1 (oEvent) {
			oBinding.detachChange(handler1);
			ok(!oBinding.isExpanded(4), "The node which is going to be expanded is currently collapsed");

			oBinding.attachChange(handler2);
			oBinding.expand(4, true);
		}

		function handler2 (oEvent) {
			oBinding.detachChange(handler2);

			var oParent = oBinding.findNode(4),
				oChild, i;
			for (i = 5 ; i < 10 ; i++) {
				oChild = oBinding.findNode(i);
				ok(oBinding._isInSubtree(oParent, oChild), "Children are loaded");
			}

			oBinding.attachChange(handler3);
			oBinding.expand(5, true);
		}

		function handler3 (oEvent) {
			oBinding.detachChange(handler3);
			var oParent = oBinding.findNode(5),
				oChild, i;

			for (i = 6 ; i < 9 ; i++) {
				oChild = oBinding.findNode(i);
				ok(oBinding._isInSubtree(oParent, oChild), "Children are loaded");
			}

			oBinding.collapse(4);
			ok(oBinding.findNode(9).key.indexOf("1010") !== -1, "The index shifting is done correctly");
			start();
		}

		oBinding.attachChange(handler1);
		oBinding.getContexts(0, 10);
	});
});

asyncTest("Collapse all nodes at level 0", function(){
	oModel.attachMetadataLoaded(function() {
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		// check what happens when total number of available nodes is less than a page size
		function handler1 (oEvent) {
			oBinding.detachChange(handler1);

			oBinding.collapse(0);
			oBinding.collapse(1);
			oBinding.collapse(2);
			oBinding.collapse(3);
			oBinding.collapse(4);
			oBinding.collapse(5);
			oBinding.collapse(6);
			oBinding.collapse(7);
			oBinding.collapse(8);

			var aContexts = oBinding.getContexts(0, 10);
			equal(aContexts.length, 9, "There are only 9 nodes on level 0");
			start();
		}

		oBinding.attachChange(handler1);
		oBinding.getContexts(0, 10, 700);
	});
});
