QUnit.module("ODataTreeBindingFlat - Tree State: Expand", {
	beforeEach: function() {
		var that = this;
		sServiceUrl = "ZTJ_SFIN_HIERARCHY_02_SRV"
		return new Promise(function(resolve, reject) {
			sap.ui.require(["ODataTreeBindingFakeService"], function(ODataTreeBindingFakeService) {
				that.fakeService = ODataTreeBindingFakeService;
				that.fakeService.setup();
				oModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl);
				resolve();
			});
		});
	},
	afterEach: function() {
		this.fakeService.teardown();
		sServiceUrl = "/odataFake/";
		delete oModel;
	}
});

QUnit.test("Restore tree state: Expand server index node", function(assert){

	var done = assert.async();
	oModel.metadataLoaded().then(function() {
		createTreeBinding("/ZTJ_G4_C_GLHIER(P_CHARTOFACCOUNTS='CACN',P_FINANCIALSTATEMENTVARIANT='9999')/Results", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 0
		});

		var oFirstChild;

		function handler1 (oEvent) {
			oBinding.detachChange(handler1);
			assert.ok(!oBinding.isExpanded(0), "The node which is going to be expanded is currently collapsed");

			oBinding.attachChange(handler2);
			oBinding.expand(0, true);
		}

		function handler2 (oEvent) {
			oBinding.detachChange(handler2);

			var oParent = oBinding.findNode(0),
				oChild, i;
			for (i = 1 ; i < 7 ; i++) {
				oChild = oBinding.findNode(i);
				assert.ok(oBinding._isInSubtree(oParent, oChild), "Children are loaded");
			}

			oFirstChild = oBinding.findNode(1);

			oBinding.attachRefresh(function() {
				assert.ok(oBinding.findNode(1) === undefined, "All children removed");
			});
			oBinding.attachChange(handler3);
			oBinding._restoreTreeState().then(function(aResponseData) {
				// Success: Promise resolved
				assert.ok(Array.isArray(aResponseData), "Promise should be resolved");
				done();
			}, function(oError) {
				assert.ok(false, "Promise should be resolved");
			});
		}
		function handler3 (oEvent) {
			oBinding.detachChange(handler3);

			var oParent = oBinding.findNode(0),
				oChild, i;
			for (i = 1 ; i < 7 ; i++) {
				oChild = oBinding.findNode(i);
				assert.ok(oBinding._isInSubtree(oParent, oChild), "Children are re-loaded after refresh");
			}

			assert.ok(oFirstChild !== oBinding.findNode(1), "Instance of first child object changed");
		}

		oBinding.attachChange(handler1);
		oBinding.getContexts(0, 120, 0);
	});
});

QUnit.test("Restore tree state: Expand deep node", function(assert){

	var done = assert.async();
	oModel.metadataLoaded().then(function() {
		createTreeBinding("/ZTJ_G4_C_GLHIER(P_CHARTOFACCOUNTS='CACN',P_FINANCIALSTATEMENTVARIANT='9999')/Results", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 0
		});

		var oFirstChild;

		function handler1 (oEvent) {
			oBinding.detachChange(handler1);
			assert.ok(!oBinding.isExpanded(0), "The node which is going to be expanded is currently collapsed");

			oBinding.attachChange(handler2);
			oBinding.expand(0, true);
		}

		function handler2 (oEvent) {
			oBinding.detachChange(handler2);
			assert.ok(!oBinding.isExpanded(1), "The node which is going to be expanded is currently collapsed");

			oBinding.attachChange(handler3);
			oBinding.expand(1, true);
		}

		function handler3 (oEvent) {
			oBinding.detachChange(handler3);

			var oParent = oBinding.findNode(1),
				oChild;

			oChild = oBinding.findNode(2);
			assert.ok(oBinding._isInSubtree(oParent, oChild), "Children are loaded");

			oFirstChild = oBinding.findNode(2);

			oBinding.attachRefresh(function() {
				assert.ok(oBinding.findNode(2) === undefined, "All children removed")
			});
			oBinding.attachChange(handler4);
			oBinding._restoreTreeState().then(function(aResponseData) {
				// Success: Promise resolved
				assert.ok(Array.isArray(aResponseData), "Promise should be resolved");
				done();
			}, function(oError) {
				assert.ok(false, "Promise should be resolved");
			});
		}
		function handler4 (oEvent) {
			oBinding.detachChange(handler4);

			var oParent = oBinding.findNode(1),
				oChild;

			oChild = oBinding.findNode(2);
			assert.ok(oBinding._isInSubtree(oParent, oChild), "Children are re-loaded after refresh");

			var oSecondRootNode = oBinding.findNode(3);
			assert.ok(oSecondRootNode, "Successfully found a node outside the first root nodes magnitude range");
			assert.ok(!oBinding._isInSubtree(oParent, oSecondRootNode), "That node is also not below the first root node");

			assert.ok(oFirstChild !== oBinding.findNode(2), "Instance of first child object changed");
		}

		oBinding.attachChange(handler1);
		oBinding.getContexts(0, 120, 0);
	});
});

QUnit.test("Restore tree state: Expand error handling, the whole batch request fails", function(assert){

	var done = assert.async();
	var that = this;
	oModel.metadataLoaded().then(function() {
		createTreeBinding("/ZTJ_G4_C_GLHIER(P_CHARTOFACCOUNTS='CACN',P_FINANCIALSTATEMENTVARIANT='9999')/Results", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 0
		});

		var oFirstChild;

		function handler1 (oEvent) {
			oBinding.detachChange(handler1);
			assert.ok(!oBinding.isExpanded(0), "The node which is going to be expanded is currently collapsed");

			oBinding.attachChange(handler2);
			oBinding.expand(0, true);
		}

		function handler2 (oEvent) {
			oBinding.detachChange(handler2);

			var oParent = oBinding.findNode(0),
				oChild, i;
			for (i = 1 ; i < 7 ; i++) {
				oChild = oBinding.findNode(i);
				assert.ok(oBinding._isInSubtree(oParent, oChild), "Children are loaded");
			}

			oFirstChild = oBinding.findNode(1);

			oBinding.attachRefresh(function() {
				assert.ok(oBinding.findNode(1) === undefined, "All children removed");
			});
			oBinding.attachChange(handler3);

			that.fakeService.setServiceStatus({ batch: 500 });
			oBinding._restoreTreeState().then(function() {
				assert.ok(false, "Shouldn't be called.");
			}, function(aResponseData) {
				assert.ok(Array.isArray(aResponseData), "Promise should be rejected");
				that.fakeService.resetServiceStatus();
				done();
			});
		}
		function handler3 (oEvent) {
			oBinding.detachChange(handler3);

			var oParent = oBinding.findNode(0);
			assert.notOk(oParent, "There is no node available.");
		}

		oBinding.attachChange(handler1);
		oBinding.getContexts(0, 120, 0);
	});
});

QUnit.test("Restore tree state: Expand error handling, the whole batch request is aborted", function(assert){

	var done = assert.async();
	var that = this;
	oModel.metadataLoaded().then(function() {
		createTreeBinding("/ZTJ_G4_C_GLHIER(P_CHARTOFACCOUNTS='CACN',P_FINANCIALSTATEMENTVARIANT='9999')/Results", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 0
		});

		var oFirstChild;

		function handler1 (oEvent) {
			oBinding.detachChange(handler1);
			assert.ok(!oBinding.isExpanded(0), "The node which is going to be expanded is currently collapsed");

			oBinding.attachChange(handler2);
			oBinding.expand(0, true);
		}

		function handler2 (oEvent) {
			oBinding.detachChange(handler2);

			var oParent = oBinding.findNode(0),
				oChild, i;

			var oChangeSpy = sinon.spy();
			for (i = 1 ; i < 7 ; i++) {
				oChild = oBinding.findNode(i);
				assert.ok(oBinding._isInSubtree(oParent, oChild), "Children are loaded");
			}

			oFirstChild = oBinding.findNode(1);

			oBinding.attachRefresh(function() {
				assert.ok(oBinding.findNode(1) === undefined, "All children removed");
			});
			oBinding.attachChange(oChangeSpy);

			that.fakeService.setServiceStatus({ batch: "abort" });
			oBinding._restoreTreeState().then(function() {
				assert.ok(false, "Shouldn't be called.");
			}, function(aResponseData) {
				assert.ok(Array.isArray(aResponseData), "Promise should be rejected");
				assert.ok(oChangeSpy.notCalled, "no change event is fired");
				that.fakeService.resetServiceStatus();
				done();
			});
		}

		oBinding.attachChange(handler1);
		oBinding.getContexts(0, 120, 0);
	});
});

QUnit.test("Restore tree state: Expand error handling, restore of deep nodes fails", function(assert){

	var done = assert.async();
	var that = this;
	oModel.metadataLoaded().then(function() {
		createTreeBinding("/ZTJ_G4_C_GLHIER(P_CHARTOFACCOUNTS='CACN',P_FINANCIALSTATEMENTVARIANT='9999')/Results", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 0
		});

		var oFirstChild;

		function handler1 (oEvent) {
			oBinding.detachChange(handler1);
			assert.ok(!oBinding.isExpanded(0), "The node which is going to be expanded is currently collapsed");

			oBinding.attachChange(handler2);
			oBinding.expand(0, true);
		}

		function handler2 (oEvent) {
			oBinding.detachChange(handler2);

			var oParent = oBinding.findNode(0),
				oChild, i;
			for (i = 1 ; i < 7 ; i++) {
				oChild = oBinding.findNode(i);
				assert.ok(oBinding._isInSubtree(oParent, oChild), "Children are loaded");
			}

			oFirstChild = oBinding.findNode(1);

			oBinding.attachRefresh(function() {
				assert.ok(oBinding.findNode(1) === undefined, "All children removed");
			});
			oBinding.attachChange(handler3);

			// let the loading of deep nodes fail
			that.fakeService.setServiceStatus({
				url: {
					500: [
						/\$filter=\(GLAccount_ParentID%20eq%20%27FinancialStatementItem%3a99991%27\)/
					]
				}
			});

			oBinding._restoreTreeState().then(function() {
				// Success: Promise resolved
				assert.ok(false, "Promise should be rejected");
			}, function(aResponseData) {
				assert.ok(Array.isArray(aResponseData), "Promise should be rejected");
				that.fakeService.resetServiceStatus();
				done();
			});
		}
		function handler3 (oEvent) {
			oBinding.detachChange(handler3);

			var oParent = oBinding.findNode(0);
			var oNextNode = oBinding.findNode(1);

			assert.equal(oParent.level, oNextNode.level, "Only server index nodes are loaded");
		}

		oBinding.attachChange(handler1);
		oBinding.getContexts(0, 120, 0);
	});
});

QUnit.test("Restore tree state: Expand error handling, restore of server index nodes fails", function(assert){

	var done = assert.async();
	var that = this;
	oModel.metadataLoaded().then(function() {
		createTreeBinding("/ZTJ_G4_C_GLHIER(P_CHARTOFACCOUNTS='CACN',P_FINANCIALSTATEMENTVARIANT='9999')/Results", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 0
		});

		var oFirstChild;

		function handler1 (oEvent) {
			oBinding.detachChange(handler1);
			assert.ok(!oBinding.isExpanded(0), "The node which is going to be expanded is currently collapsed");

			oBinding.attachChange(handler2);
			oBinding.expand(0, true);
		}

		function handler2 (oEvent) {
			oBinding.detachChange(handler2);

			var oParent = oBinding.findNode(0),
				oChild, i;
			for (i = 1 ; i < 7 ; i++) {
				oChild = oBinding.findNode(i);
				assert.ok(oBinding._isInSubtree(oParent, oChild), "Children are loaded");
			}

			oFirstChild = oBinding.findNode(1);

			oBinding.attachRefresh(function() {
				assert.ok(oBinding.findNode(1) === undefined, "All children removed");
			});
			oBinding.attachChange(handler3);

			// let the loading of deep nodes fail
			that.fakeService.setServiceStatus({
				url: {
					500: [
						/\$filter=\(GLAccount_Level%20le%200\)/
					]
				}
			});

			oBinding._restoreTreeState().then(function() {
				// Success: Promise resolved
				assert.ok(false, "Promise should be rejected");
			}, function(aResponseData) {
				assert.ok(Array.isArray(aResponseData), "Promise should be rejected");
				that.fakeService.resetServiceStatus();
				done();
			});
		}
		function handler3 (oEvent) {
			oBinding.detachChange(handler3);

			var oParent = oBinding.findNode(0);
			assert.notOk(oParent, "Nothing is restored in binding");
		}

		oBinding.attachChange(handler1);
		oBinding.getContexts(0, 120, 0);
	});
});

QUnit.test("Restore tree state: Expand error handling, all sub requests fail", function(assert){

	var done = assert.async();
	var that = this;
	oModel.metadataLoaded().then(function() {
		createTreeBinding("/ZTJ_G4_C_GLHIER(P_CHARTOFACCOUNTS='CACN',P_FINANCIALSTATEMENTVARIANT='9999')/Results", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 0
		});

		var oFirstChild;

		function handler1 (oEvent) {
			oBinding.detachChange(handler1);
			assert.ok(!oBinding.isExpanded(0), "The node which is going to be expanded is currently collapsed");

			oBinding.attachChange(handler2);
			oBinding.expand(0, true);
		}

		function handler2 (oEvent) {
			oBinding.detachChange(handler2);

			var oParent = oBinding.findNode(0),
				oChild, i;
			for (i = 1 ; i < 7 ; i++) {
				oChild = oBinding.findNode(i);
				assert.ok(oBinding._isInSubtree(oParent, oChild), "Children are loaded");
			}

			oFirstChild = oBinding.findNode(1);

			oBinding.attachRefresh(function() {
				assert.ok(oBinding.findNode(1) === undefined, "All children removed");
			});
			oBinding.attachChange(handler3);

			// let the loading of deep nodes fail
			that.fakeService.setServiceStatus({
				url: {
					500: [
						/\$filter=\(GLAccount_Level%20le%200\)/,
						/\$filter=\(GLAccount_ParentID%20eq%20%27FinancialStatementItem%3a99991%27\)/
					]
				}
			});

			oBinding._restoreTreeState().then(function() {
				// Success: Promise resolved
				assert.ok(false, "Promise should be rejected");
			}, function(aResponseData) {
				assert.ok(Array.isArray(aResponseData), "Promise should be rejected");
				that.fakeService.resetServiceStatus();
				done();
			});
		}
		function handler3 (oEvent) {
			oBinding.detachChange(handler3);

			var oParent = oBinding.findNode(0);
			assert.notOk(oParent, "Nothing is restored in binding");
		}

		oBinding.attachChange(handler1);
		oBinding.getContexts(0, 120, 0);
	});
});

QUnit.module("ODataTreeBindingFlat - Tree State: Collapse", {
	beforeEach: function() {
		var that = this;
		sServiceUrl = "ZTJ_SFIN_HIERARCHY_02_SRV"
		return new Promise(function(resolve, reject) {
			sap.ui.require(["ODataTreeBindingFakeService"], function(ODataTreeBindingFakeService) {
				that.fakeService = ODataTreeBindingFakeService;
				that.fakeService.setup();
				oModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl);
				resolve();
			});
		});
	},
	afterEach: function() {
		this.fakeService.teardown();
		sServiceUrl = "/odataFake/";
		delete oModel;
	}
});

QUnit.test("Restore tree state: Collapse server index node", function(assert){

	var done = assert.async();
	oModel.metadataLoaded().then(function() {
		createTreeBinding("/ZTJ_G4_C_GLHIER(P_CHARTOFACCOUNTS='CACN',P_FINANCIALSTATEMENTVARIANT='9999')/Results", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 1
		});

		var oFirstChild;

		function handler1 (oEvent) {
			oBinding.detachChange(handler1);

			assert.ok(oBinding.isExpanded(0), "To be collapsed node is expanded");
			oBinding.collapse(0, true); // Collapse
			assert.ok(!oBinding.isExpanded(0), "Collapsed node is collapsed");

			oFirstChild = oBinding._aNodes[1];
			oBinding.attachRefresh(function() {
				assert.ok(oBinding.findNode(0) === undefined, "All nodes are removed");
			});
			oBinding.attachChange(handler2);
			oBinding._restoreTreeState().then(function(aResponseData) {
				assert.ok(Array.isArray(aResponseData), "The promise should be resolved");
				done();
			}, function() {
				assert.ok(false, "Promise should be resolved");
			});
		}
		function handler2 (oEvent) {
			oBinding.detachChange(handler2);

			assert.ok(!oBinding.isExpanded(0), "Collapsed node is still collapsed after restore");

			var oParent = oBinding._aNodes[0]; // Do not use findNode in order to definitely get the server index node
			var oServerIndexChildNode = oBinding._aNodes[1];
			assert.ok(oServerIndexChildNode, "Child of collapsed node is loaded");
			assert.ok(oParent.level < oServerIndexChildNode.level, "Node is child of collapsed node");

			assert.ok(oFirstChild !== oServerIndexChildNode, "Instance of first child object changed");
		}

		oBinding.attachChange(handler1);
		oBinding.getContexts(0, 120, 0);
	});
});

QUnit.test("Restore tree state: Collapse deep node", function(assert){

	var done = assert.async();
	oModel.metadataLoaded().then(function() {
		createTreeBinding("/ZTJ_G4_C_GLHIER(P_CHARTOFACCOUNTS='CACN',P_FINANCIALSTATEMENTVARIANT='9999')/Results", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 0
		});

		var oFirstChild;

		function handler1 (oEvent) {
			oBinding.detachChange(handler1);

			assert.notOk(oBinding.isExpanded(0), "To be expanded node is collapsed");

			oBinding.attachChange(handler2);
			oBinding.expand(0, true); // Expand
		}

		function handler2(oEvent) {
			oBinding.detachChange(handler2);

			assert.ok(oBinding.isExpanded(0), "Collapsed node is expanded");

			oFirstChild = oBinding.findNode(1);
			oBinding.attachChange(handler3);
			oBinding.expand(1, true);
		}

		function handler3 (oEvent) {
			oBinding.detachChange(handler3);

			assert.ok(oBinding.isExpanded(1), "First child node is expanded");

			oBinding.collapse(1, true);
			assert.notOk(oBinding.isExpanded(1), "First child node is collapsed");

			oBinding.attachChange(handler4);
			oBinding._restoreTreeState().then(function() {
				done();
			}, function() {
				assert.ok(false, "Promise should be resolved");
			});
		}

		function handler4(oEvent) {
			oBinding.detachChange(handler4);

			var oParent = oBinding.findNode(0),
				oChild, i;
			for (i = 1 ; i < 7 ; i++) {
				oChild = oBinding.findNode(i);
				assert.ok(oBinding._isInSubtree(oParent, oChild), "Children are re-loaded after refresh");
			}

			var oFirstChildNode = oBinding.findNode(1);
			assert.ok(oFirstChild !== oFirstChildNode, "Instance of first child object changed");
			assert.notOk(oBinding.isExpanded(oFirstChildNode), "First child node is collapsed");
			assert.equal(oFirstChildNode.children.length, 0, "No request sent for collapsed deep node");
		}

		oBinding.attachChange(handler1);
		oBinding.getContexts(0, 120, 0);
	});
});

QUnit.test("Restore tree state: Collapse error handling, whole batch fails", function(assert){

	var done = assert.async();
	var that = this;
	oModel.metadataLoaded().then(function() {
		createTreeBinding("/ZTJ_G4_C_GLHIER(P_CHARTOFACCOUNTS='CACN',P_FINANCIALSTATEMENTVARIANT='9999')/Results", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 1
		});

		var oFirstChild;

		function handler1 (oEvent) {
			oBinding.detachChange(handler1);

			assert.ok(oBinding.isExpanded(0), "To be collapsed node is expanded");
			oBinding.collapse(0, true); // Collapse
			assert.ok(!oBinding.isExpanded(0), "Collapsed node is collapsed");

			oFirstChild = oBinding._aNodes[1];
			oBinding.attachRefresh(function() {
				assert.ok(oBinding.findNode(0) === undefined, "All nodes are removed");
			});
			oBinding.attachChange(handler2);

			// let the loading of deep nodes fail
			that.fakeService.setServiceStatus({
				url: {
					500: [
						/\$filter=\(GLAccount_Level%20le%201\)/
					]
				}
			});

			oBinding._restoreTreeState().then(function() {
				assert.ok(false, "Promise shouldn't be resolved");
			}, function(aResponseData) {
				assert.ok(Array.isArray(aResponseData), "Promise should be rejected with an array");
				that.fakeService.resetServiceStatus();
				done();
			});
		}
		function handler2 (oEvent) {
			oBinding.detachChange(handler2);
			assert.ok(!oBinding.findNode(0), "No node available");
		}

		oBinding.attachChange(handler1);
		oBinding.getContexts(0, 120, 0);
	});
});
