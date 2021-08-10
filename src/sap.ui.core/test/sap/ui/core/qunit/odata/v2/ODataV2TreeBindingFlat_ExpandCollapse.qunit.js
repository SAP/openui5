/*global QUnit */
sap.ui.define([
	"sap/ui/core/util/MockServer",
	"sap/ui/model/odata/v2/ODataModel",
	"test-resources/sap/ui/core/qunit/odata/v2/data/ODataTreeBindingFakeService"
], function (
	MockServer,
	ODataModel,
	ODataTreeBindingFakeService
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

	QUnit.module("ODataTreeBindingFlat - AutoExpand", {
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

	QUnit.test("Manually expand a node", function (assert) {

		var done = assert.async();
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		function handler1 (oEvent) {
			oBinding.detachChange(handler1);
			assert.ok(!oBinding.isExpanded(3), "The node which is going to be expanded is currently collapsed");

			oBinding.attachChange(handler2);
			oBinding.expand(3, true);
		}

		function handler2 (oEvent) {
			oBinding.detachChange(handler2);

			var oParent = oBinding.findNode(3),
				oChild, i;
			for (i = 4; i < 10; i++) {
				oChild = oBinding.findNode(i);
				assert.ok(oBinding._isInSubtree(oParent, oChild), "Children are loaded");
			}

			oBinding.attachChange(handler3);
			oBinding.getContexts(65, 10);
		}

		function handler3 (oEvent) {
			oBinding.detachChange(handler3);
			var oParent = oBinding.findNode(3),
				oChild;

			oChild = oBinding.findNode(65);
			assert.ok(oBinding._isInSubtree(oParent, oChild), "Child is loaded");
			oChild = oBinding.findNode(66);
			assert.ok(oBinding._isInSubtree(oParent, oChild), "Child is loaded");

			done();
		}

		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 10, 10);
	});

	QUnit.test("Manually expand and collapse a node multiple times", function (assert) {

		var done = assert.async();
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		function handler1 (oEvent) {
			oBinding.detachChange(handler1);
			assert.ok(!oBinding.isExpanded(3), "The node which is going to be expanded is currently collapsed");

			assert.equal(oBinding.getLength(), 626, "Correct binding length");
			oBinding.attachChange(handler2);
			oBinding.expand(4, true);
		}

		function handler2 (oEvent) {
			oBinding.detachChange(handler2);

			oBinding.collapse(4, true);
			oBinding.collapse(4, true);
			oBinding.collapse(4, true);
			oBinding.expand(4, true);
			oBinding.expand(4, true);
			oBinding.expand(4, true);
			oBinding.expand(4, true);
			oBinding.expand(4, true);

			// idx 4 node expanded
			assert.equal(oBinding.getLength(), 634, "Correct binding length (no duplicate nodes)");

			oBinding.collapse(4, true);
			// idx 4 node collapsed again
			assert.equal(oBinding.getLength(), 626, "Correct binding length (no duplicate nodes)");

			done();
		}

		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 10, 10);
	});

	QUnit.test("Manually expand two levels and collapse the parent", function(assert){

		var done = assert.async();
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		function handler1 (oEvent) {
			oBinding.detachChange(handler1);
			assert.ok(!oBinding.isExpanded(4), "The node which is going to be expanded is currently collapsed");

			oBinding.attachChange(handler2);
			oBinding.expand(4, true);
		}

		function handler2 (oEvent) {
			oBinding.detachChange(handler2);

			var oParent = oBinding.findNode(4),
				oChild, i;
			for (i = 5; i < 10; i++) {
				oChild = oBinding.findNode(i);
				assert.ok(oBinding._isInSubtree(oParent, oChild), "Children are loaded");
			}

			oBinding.attachChange(handler3);
			oBinding.expand(5, true);
		}

		function handler3 (oEvent) {
			oBinding.detachChange(handler3);
			var oParent = oBinding.findNode(5),
				oChild, i;

			for (i = 6; i < 9; i++) {
				oChild = oBinding.findNode(i);
				assert.ok(oBinding._isInSubtree(oParent, oChild), "Children are loaded");
			}

			oBinding.collapse(4);
			assert.ok(oBinding.findNode(9).key.indexOf("1010") !== -1, "The index shifting is done correctly");
			done();
		}

		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 10);
	});

	QUnit.test("Collapse all nodes at level 0", function(assert){

		var done = assert.async();
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
			assert.equal(aContexts.length, 9, "There are only 9 nodes on level 0");
			done();
		}

		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 10, 700);
	});

	QUnit.test("Bug fix: when deepnode is collapsed, its parents' magnitude needs to be updated", function(assert) {

		var done = assert.async();
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		// check what happens when total number of available nodes is less than a page size
		function handler1(oEvent) {
			oBinding.detachChange(handler1);

			oBinding.attachChange(handler2);
			// expand 1005
			oBinding.expand(4, true);
		}

		function handler2(oEvent) {
			oBinding.detachChange(handler2);
			assert.ok(oBinding.findNode(5).key.indexOf("1630") !== -1, "The first child in 1005 is 1630");

			oBinding.attachChange(handler3);
			// expand 1630
			oBinding.expand(5, true);
		}

		function handler3(oEvent) {
			oBinding.detachChange(handler3);

			assert.ok(oBinding.findNode(6).key.indexOf("1638") !== -1, "The first child in 1630 is 1638");

			oBinding.collapse(5);
			assert.ok(oBinding.findNode(13).key.indexOf("1006") !== -1, "The sibling of 1005 is 1006");

			// expand and collapse again
			oBinding.expand(5);
			oBinding.collapse(5);
			assert.ok(oBinding.findNode(12).key.indexOf("1637") !== -1, "The last child of 1005 is 1637");
			done();
		}

		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 10, 10);
	});

	QUnit.test("expandToLevel: Expand one level", function(assert) {

		var done = assert.async();
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 0
		});

		function handler1(oEvent) {
			oBinding.detachChange(handler1);
			oBinding.getContexts(0, 10, 10);
			oBinding.attachChange(handler2);
			oBinding.expandToLevel(1);
		}

		function handler2(oEvent) {
			oBinding.detachChange(handler2);
			oBinding.attachChange(handler3);
			// Rebuild tree after expandToLevel
			oBinding.getContexts(0, 10, 10);
		}

		function handler3(oEvent) {
			oBinding.detachChange(handler3);
			oBinding.getContexts(0, 10, 10);
			assert.ok(oBinding.findNode(6).key.indexOf("1029") !== -1, "Node 1029 (level 0) is found at correct index");
			assert.ok(oBinding.findNode(7).key.indexOf("1030") !== -1, "Node 1030 (level 1, child of 1029) is found at correct index");
			done();
		}

		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 10, 10);
	});

	QUnit.test("expandToLevel: Expand to same level fires change event", function(assert) {
		// Apparently can't test the real scenario (expandToLevel(2) => manual collapse => expandToLevel(2) again) due to static test data
		var done = assert.async();
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 1
		});

		function handler1(oEvent) {
			oBinding.detachChange(handler1);
			oBinding.getContexts(0, 10, 10);
			oBinding.attachChange(handler2);
			oBinding.expandToLevel(1);
		}

		function handler2(oEvent) {
			oBinding.detachChange(handler2);
			oBinding.attachChange(handler3);
			// Rebuild tree after expandToLevel
			oBinding.getContexts(0, 10, 10);
		}

		function handler3(oEvent) {
			oBinding.detachChange(handler3);
			oBinding.getContexts(0, 10, 10);
			assert.ok(oBinding.findNode(6).key.indexOf("1029") !== -1, "Node 1029 (level 0) is found at correct index");
			assert.ok(oBinding.findNode(7).key.indexOf("1030") !== -1, "Node 1030 (level 1, child of 1029) is found at correct index");
			done();
		}

		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 10, 10);
	});

	QUnit.test("collapseToLevel: Collapse two levels", function(assert) {

		var done = assert.async();
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		function handler1(oEvent) {
			oBinding.detachChange(handler1);
			oBinding.getContexts(0, 10, 10);
			oBinding.attachChange(handler2);
			oBinding.collapseToLevel(0);
		}

		function handler2(oEvent) {
			oBinding.detachChange(handler2);
			oBinding.attachChange(handler3);
			// Rebuild tree after expandToLevel
			oBinding.getContexts(0, 10, 10);
		}

		function handler3(oEvent) {
			oBinding.detachChange(handler3);
			oBinding.getContexts(0, 10, 10);
			assert.ok(oBinding.findNode(6).key.indexOf("1387") !== -1, "Node 1387 (level 0) is found at correct index");
			done();
		}

		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 10, 10);
	});

	QUnit.test("collapseToLevel: Collapse to same level fires change event", function(assert) {
		// Apparently can't test the real scenario (collapseToLevel(0) => manual expand => collapseToLevel(0) again) due to static test data
		var done = assert.async();
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 0
		}, [

		]);

		function handler1(oEvent) {
			oBinding.detachChange(handler1);
			oBinding.getContexts(0, 10, 10);
			oBinding.attachChange(handler2);
			oBinding.collapseToLevel(0);
		}

		function handler2(oEvent) {
			oBinding.detachChange(handler2);
			oBinding.attachChange(handler3);
			// Rebuild tree after expandToLevel
			oBinding.getContexts(0, 10, 10);
		}

		function handler3(oEvent) {
			oBinding.detachChange(handler3);
			oBinding.getContexts(0, 10, 10);
			assert.ok(oBinding.findNode(6).key.indexOf("1387") !== -1, "Node 1387 (level 0) is found at correct index");
			done();
		}

		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 10, 10);
	});
});