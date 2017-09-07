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

function getLogCallsFromSpy(oSpy, sText) {
	return oSpy.args.reduce(function(iCount, args) {
		return iCount + (args[0].indexOf(sText) !== -1);
	}, 0);
}

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
			var oLogSpy = sinon.spy(jQuery.sap.log, "error");
			oBinding._restoreTreeState().then(function(aResponseData) {
				// Success: Promise resolved
				assert.ok(Array.isArray(aResponseData), "Promise should be resolved");
				assert.equal(getLogCallsFromSpy(oLogSpy, "ODataTreeBindingFlat - Tree state restoration request failed."), 0, "No error logged");
				oLogSpy.restore();
				done();
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
			var oLogSpy = sinon.spy(jQuery.sap.log, "error");
			oBinding._restoreTreeState().then(function(aResponseData) {
				// Success: Promise resolved
				assert.ok(Array.isArray(aResponseData), "Promise should be resolved");
				assert.equal(getLogCallsFromSpy(oLogSpy, "ODataTreeBindingFlat - Tree state restoration request failed."), 0, "No error logged");
				oLogSpy.restore();
				done();
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
			var oLogSpy = sinon.spy(jQuery.sap.log, "error");
			oBinding._restoreTreeState().then(function() {
				assert.equal(getLogCallsFromSpy(oLogSpy, "ODataTreeBindingFlat - Tree state restoration request failed."), 2, "Two errors got logged");
				that.fakeService.resetServiceStatus();
				oLogSpy.restore();
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
			var oLogSpy = sinon.spy(jQuery.sap.log, "error");
			oBinding._restoreTreeState().then(function() {
				assert.equal(getLogCallsFromSpy(oLogSpy, "ODataTreeBindingFlat - Tree state restoration request failed."), 0, "No error got logged");
				that.fakeService.resetServiceStatus();
				oLogSpy.restore();
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

			var oLogSpy = sinon.spy(jQuery.sap.log, "error");
			oBinding._restoreTreeState().then(function() {
				assert.equal(getLogCallsFromSpy(oLogSpy, "ODataTreeBindingFlat - Tree state restoration request failed."), 1, "One error got logged");
				that.fakeService.resetServiceStatus();
				oLogSpy.restore();
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

			var oLogSpy = sinon.spy(jQuery.sap.log, "error");
			oBinding._restoreTreeState().then(function() {
				assert.equal(getLogCallsFromSpy(oLogSpy, "ODataTreeBindingFlat - Tree state restoration request failed."), 1, "One error got logged");
				that.fakeService.resetServiceStatus();
				oLogSpy.restore();
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

			var oLogSpy = sinon.spy(jQuery.sap.log, "error");
			oBinding._restoreTreeState().then(function() {
				assert.equal(getLogCallsFromSpy(oLogSpy, "ODataTreeBindingFlat - Tree state restoration request failed."), 2, "Two error got logged");
				that.fakeService.resetServiceStatus();
				oLogSpy.restore();
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

			var oLogSpy = sinon.spy(jQuery.sap.log, "error");
			oBinding._restoreTreeState().then(function(aResponseData) {
				assert.ok(Array.isArray(aResponseData), "The promise should be resolved");
				assert.equal(getLogCallsFromSpy(oLogSpy, "ODataTreeBindingFlat - Tree state restoration request failed."), 0, "No error got logged");
				oLogSpy.restore();
				done();
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
			var oLogSpy = sinon.spy(jQuery.sap.log, "error");
			oBinding._restoreTreeState().then(function(aResponseData) {
				assert.ok(Array.isArray(aResponseData), "The promise should be resolved");
				assert.equal(getLogCallsFromSpy(oLogSpy, "ODataTreeBindingFlat - Tree state restoration request failed."), 0, "No error got logged");
				oLogSpy.restore();
				done();
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

			var oLogSpy = sinon.spy(jQuery.sap.log, "error");
			oBinding._restoreTreeState().then(function() {
				assert.equal(getLogCallsFromSpy(oLogSpy, "ODataTreeBindingFlat - Tree state restoration request failed."), 1, "One error got logged");
				that.fakeService.resetServiceStatus();
				oLogSpy.restore();
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

QUnit.test("Restore tree state: adapt server node sections", function(assert) {
	createTreeBinding("/ZTJ_G4_C_GLHIER(P_CHARTOFACCOUNTS='CACN',P_FINANCIALSTATEMENTVARIANT='9999')/Results", null, [], {
		threshold: 10,
		countMode: "Inline",
		operationMode: "Server",
		numberOfExpandedLevels: 0,
		restoreTreeStateAfterChange: true
	});

	var aSections = [
		{ iSkip: 0, iTop: 20 },
		{ iSkip: 80, iTop: 20 },
		{ iSkip: 120, iTop: 40 },
		{ iSkip: 200, iTop: 40 }
	];

	var aRemovedNodes = [
		{ serverIndex: 10, magnitude: 5 },
		{ serverIndex: 17, magnitude: 2 },
		{ serverIndex: 90, magnitude: 15 },
		{ serverIndex: 120, magnitude: 50 },
		{ serverIndex: 200, magnitude: 10 }
	];

	oBinding._adaptSections(aSections, {
		removed: aRemovedNodes
	});

	var aExpectedSections = [
		{ iSkip:0, iTop:11 },
		{ iSkip:71, iTop:10 },
		{ iSkip:124, iTop:29 }
	];

	assert.deepEqual(aSections, aExpectedSections, "The server sections are correctly adapted");
});

QUnit.test("Restore tree state: adapt deep node sections", function(assert) {
	createTreeBinding("/ZTJ_G4_C_GLHIER(P_CHARTOFACCOUNTS='CACN',P_FINANCIALSTATEMENTVARIANT='9999')/Results", null, [], {
		threshold: 10,
		countMode: "Inline",
		operationMode: "Server",
		numberOfExpandedLevels: 0,
		restoreTreeStateAfterChange: true
	});

	var aSections = [
		{ iSkip: 0, iTop: 20 },
		{ iSkip: 80, iTop: 20 },
		{ iSkip: 120, iTop: 40 },
		{ iSkip: 200, iTop: 40 }
	];

	var aRemovedNodes = [
		{ positionInParent: 0, magnitude: 0 },
		{ positionInParent: 1, magnitude: 3 },
		{ positionInParent: 2, magnitude: 0 },
		{ positionInParent: 5, magnitude: 2 },
		{ positionInParent: 19, magnitude: 0 },
		{ positionInParent: 85, magnitude: 15 },
		{ positionInParent: 200, magnitude: 0 },
		{ positionInParent: 205, magnitude: 0 },
		{ positionInParent: 239, magnitude: 0 },
	];

	oBinding._adaptSections(aSections, {
		removed: aRemovedNodes
	}, {
		indexName: "positionInParent",
		ignoreMagnitude: true
	});

	var aExpectedSections = [
		{ iSkip: 0, iTop: 15 },
		{ iSkip: 75, iTop: 19 },
		{ iSkip: 114, iTop: 40 },
		{ iSkip: 194, iTop: 37 }
	];

	assert.deepEqual(aSections, aExpectedSections, "The deep sections are correctly adapted");
});

QUnit.test("Restore tree state: after delete server index nodes", function(assert) {
	var done = assert.async();

	createTreeBinding("/ZTJ_G4_C_GLHIER(P_CHARTOFACCOUNTS='CACN',P_FINANCIALSTATEMENTVARIANT='9999')/Results", null, [], {
		threshold: 10,
		countMode: "Inline",
		operationMode: "Server",
		numberOfExpandedLevels: 4,
		restoreTreeStateAfterChange: true
	});

	var sDeletedKey = "ZTJ_G4_C_GLHIERResults('1.2.4.0.1.2.4.0%3A0.14.0.0_IEQCACNIEQ999952372%3A99993101')";
	var oDeleteNode;
	var sCollapsedKey;

	function handler1() {
		oBinding.detachChange(handler1);

		oDeleteNode = oBinding.findNode(53);

		assert.equal(oDeleteNode.key, sDeletedKey, "The node which is going to be deleted exists in the loaded section");

		oBinding.attachChange(handler2);
		oBinding.getContexts(167, 20, 100);
	}

	function handler2() {
		oBinding.detachChange(handler2);

		var oNode = oBinding.findNode(167);

		assert.ok(oNode, "The node which is going to be collapsed exists");
		oBinding.collapse(oNode, true);
		sCollapsedKey = oNode.key;

		oBinding.removeContext(oDeleteNode.context);

		oBinding.attachChange(handler3);
		oBinding.submitChanges();
	}

	function handler3() {
		oBinding.detachChange(handler3);

		assert.ok(oBinding.findNode(116), "The loaded section is adapted");
		assert.ok(!oBinding.findNode(117), "The loaded section is adapted with the deleted node's magnitude");

		var oCollapsedNode;
		oBinding._map(function(oNode, oRecursionBreaker) {
			if (oNode && (oNode.key === sCollapsedKey)) {
				oCollapsedNode = oNode;
				oRecursionBreaker.broken = true;
			}
		});

		assert.ok(oCollapsedNode && oCollapsedNode.nodeState.collapsed, "the collapsed node before save is loaded and collapsed again");

		done();
	}

	oBinding.attachChange(handler1);
	oBinding.getContexts(0, 20, 100);
});