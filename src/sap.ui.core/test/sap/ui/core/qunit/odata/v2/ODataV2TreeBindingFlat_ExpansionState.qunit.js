/*global QUnit, sinon */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/odata/UpdateMethod",
	"sap/ui/model/odata/v2/ODataModel",
	"test-resources/sap/ui/core/qunit/odata/v2/data/ODataTreeBindingFakeService"
], function(Log, UpdateMethod, ODataModel, ODataTreeBindingFakeService) {
	"use strict";
	var oModel, oBinding;

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

	QUnit.module("ODataTreeBindingFlat - Tree State: Expand", {
		beforeEach: function() {
			ODataTreeBindingFakeService.setup();
			oModel = new ODataModel("ZTJ_SFIN_HIERARCHY_02_SRV");
			return oModel.metadataLoaded(); // Wait for metadata loaded promise
		},
		afterEach: function() {
			ODataTreeBindingFakeService.teardown();
			oModel.destroy();
		}
	});

	function getLogCallsFromSpy(oSpy, sText) {
		return oSpy.args.reduce(function(iCount, args) {
			return iCount + (args[0].indexOf(sText) !== -1);
		}, 0);
	}

	QUnit.test("Restore tree state: Expand server index node", function(assert){
		var done = assert.async();
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
			for (i = 1; i < 7; i++) {
				oChild = oBinding.findNode(i);
				assert.ok(oBinding._isInSubtree(oParent, oChild), "Children are loaded");
			}

			oFirstChild = oBinding.findNode(1);

			oBinding.attachChange(handler3);
			var oLogSpy = sinon.spy(Log, "error");
			oBinding._restoreTreeState().then(function(aResponseData) {
				// Success: Promise resolved
				assert.ok(Array.isArray(aResponseData), "Promise should be resolved");
				assert.equal(getLogCallsFromSpy(oLogSpy, "ODataTreeBindingFlat - Tree state restoration request failed."), 0, "No error logged");
				oLogSpy.restore();
				done();
			}, function (err) {
				assert.notOk(true, "Promise should not reject with error " + err.message);
				done();
			});
		}
		function handler3 (oEvent) {
			oBinding.detachChange(handler3);

			var oParent = oBinding.findNode(0),
				oChild, i;
			for (i = 1; i < 7; i++) {
				oChild = oBinding.findNode(i);
				assert.ok(oBinding._isInSubtree(oParent, oChild), "Children are re-loaded after change event");
			}

			assert.ok(oFirstChild !== oBinding.findNode(1), "Instance of first child object changed");
		}

		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 120, 0);
	});

	QUnit.test("Restore tree state: Expand deep node", function(assert){
		var done = assert.async();
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

			oBinding.attachChange(handler4);
			var oLogSpy = sinon.spy(Log, "error");
			oBinding._restoreTreeState().then(function(aResponseData) {
				// Success: Promise resolved
				assert.ok(Array.isArray(aResponseData), "Promise should be resolved");
				assert.equal(getLogCallsFromSpy(oLogSpy, "ODataTreeBindingFlat - Tree state restoration request failed."), 0, "No error logged");
				oLogSpy.restore();
				done();
			}, function (err) {
				assert.notOk(true, "Promise should not reject with error " + err.message);
				done();
			});
		}
		function handler4 (oEvent) {
			oBinding.detachChange(handler4);

			var oParent = oBinding.findNode(1),
				oChild;

			oChild = oBinding.findNode(2);
			assert.ok(oBinding._isInSubtree(oParent, oChild), "Children are re-loaded after change event");

			var oSecondRootNode = oBinding.findNode(3);
			assert.ok(oSecondRootNode, "Successfully found a node outside the first root nodes magnitude range");
			assert.ok(!oBinding._isInSubtree(oParent, oSecondRootNode), "That node is also not below the first root node");

			assert.ok(oFirstChild !== oBinding.findNode(2), "Instance of first child object changed");
		}

		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 120, 0);
	});

	QUnit.test("Restore tree state: Expand error handling, the whole batch request fails", function(assert){
		var done = assert.async();
		createTreeBinding("/ZTJ_G4_C_GLHIER(P_CHARTOFACCOUNTS='CACN',P_FINANCIALSTATEMENTVARIANT='9999')/Results", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 0
		});

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
			for (i = 1; i < 7; i++) {
				oChild = oBinding.findNode(i);
				assert.ok(oBinding._isInSubtree(oParent, oChild), "Children are loaded");
			}

			oBinding.findNode(1);

			oBinding.attachChange(handler3);
			ODataTreeBindingFakeService.setServiceStatus({ batch: 500 });
			oBinding._restoreTreeState().catch(function(err) {
				assert.ok(true, "Promise got rejected");
				ODataTreeBindingFakeService.resetServiceStatus();
				done();
			});
		}
		function handler3 (oEvent) {
			oBinding.detachChange(handler3);

			var oParent = oBinding.findNode(0);
			assert.notOk(oParent, "There is no node available.");
		}

		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 120, 0);
	});

	QUnit.test("Restore tree state: Expand error handling, the whole batch request is aborted", function(assert){
		var done = assert.async();
		createTreeBinding("/ZTJ_G4_C_GLHIER(P_CHARTOFACCOUNTS='CACN',P_FINANCIALSTATEMENTVARIANT='9999')/Results", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 0
		});

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
			for (i = 1; i < 7; i++) {
				oChild = oBinding.findNode(i);
				assert.ok(oBinding._isInSubtree(oParent, oChild), "Children are loaded");
			}

			oBinding.findNode(1);

			oBinding.attachChange(oChangeSpy);
			ODataTreeBindingFakeService.setServiceStatus({ batch: "abort" });
			oBinding._restoreTreeState().then(function() {
				ODataTreeBindingFakeService.resetServiceStatus();
				assert.deepEqual(oChangeSpy.callCount, 0, "No Change event fired");
				oBinding.detachChange(oChangeSpy);
				done();
			}, function (err) {
				assert.notOk(true, "Promise should not reject with error " + err.message);
				done();
			});
		}

		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 120, 0);
	});

	QUnit.test("Restore tree state: Expand error handling, restore of deep nodes fails", function(assert){
		var done = assert.async();
		createTreeBinding("/ZTJ_G4_C_GLHIER(P_CHARTOFACCOUNTS='CACN',P_FINANCIALSTATEMENTVARIANT='9999')/Results", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 0
		});

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
			for (i = 1; i < 7; i++) {
				oChild = oBinding.findNode(i);
				assert.ok(oBinding._isInSubtree(oParent, oChild), "Children are loaded");
			}

			oBinding.findNode(1);

			oBinding.attachChange(handler3);

			// let the loading of deep nodes fail
			ODataTreeBindingFakeService.setServiceStatus({
				url: {
					500: [
						/\$filter=GLAccount_ParentID%20eq%20%27FinancialStatementItem%3a99991%27/
					]
				}
			});

			oBinding._restoreTreeState().catch(function(err) {
				assert.ok(true, "Promise got rejected");
				ODataTreeBindingFakeService.resetServiceStatus();
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
		requestData(oBinding, 0, 120, 0);
	});

	QUnit.test("Restore tree state: Expand error handling, restore of server index nodes fails", function(assert){
		var done = assert.async();
		createTreeBinding("/ZTJ_G4_C_GLHIER(P_CHARTOFACCOUNTS='CACN',P_FINANCIALSTATEMENTVARIANT='9999')/Results", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 0
		});

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
			for (i = 1; i < 7; i++) {
				oChild = oBinding.findNode(i);
				assert.ok(oBinding._isInSubtree(oParent, oChild), "Children are loaded");
			}

			oBinding.findNode(1);

			oBinding.attachChange(handler3);

			// let the loading of deep nodes fail
			ODataTreeBindingFakeService.setServiceStatus({
				url: {
					500: [
						/\$filter=GLAccount_Level%20le%200/
					]
				}
			});

			oBinding._restoreTreeState().catch(function(err) {
				assert.ok(true, "Promise got rejected");
				ODataTreeBindingFakeService.resetServiceStatus();
				done();
			});
		}
		function handler3 (oEvent) {
			oBinding.detachChange(handler3);

			var oParent = oBinding.findNode(0);
			assert.notOk(oParent, "Nothing is restored in binding");
		}

		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 120, 0);
	});

	QUnit.test("Restore tree state: Expand error handling, all sub requests fail", function(assert){
		var done = assert.async();
		createTreeBinding("/ZTJ_G4_C_GLHIER(P_CHARTOFACCOUNTS='CACN',P_FINANCIALSTATEMENTVARIANT='9999')/Results", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 0
		});

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
			for (i = 1; i < 7; i++) {
				oChild = oBinding.findNode(i);
				assert.ok(oBinding._isInSubtree(oParent, oChild), "Children are loaded");
			}

			oBinding.findNode(1);

			oBinding.attachChange(handler3);

			// let the loading of deep nodes fail
			ODataTreeBindingFakeService.setServiceStatus({
				url: {
					500: [
						/\$filter=GLAccount_Level%20le%200/,
						/\$filter=GLAccount_ParentID%20eq%20%27FinancialStatementItem%3a99991%27/
					]
				}
			});

			oBinding._restoreTreeState().catch(function(err) {
				assert.ok(true, "Promise got rejected");
				ODataTreeBindingFakeService.resetServiceStatus();
				done();
			});
		}
		function handler3 (oEvent) {
			oBinding.detachChange(handler3);

			var oParent = oBinding.findNode(0);
			assert.notOk(oParent, "Nothing is restored in binding");
		}

		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 120, 0);
	});

	QUnit.module("ODataTreeBindingFlat - Tree State: Collapse", {
		beforeEach: function() {
			ODataTreeBindingFakeService.setup();
			oModel = new ODataModel("ZTJ_SFIN_HIERARCHY_02_SRV");
			return oModel.metadataLoaded(); // Wait for metadata loaded promise
		},
		afterEach: function() {
			ODataTreeBindingFakeService.teardown();
			oModel.destroy();
		}
	});

	QUnit.test("Restore tree state: Collapse server index node", function(assert){
		var done = assert.async();
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

			oBinding.attachChange(handler2);
			var oLogSpy = sinon.spy(Log, "error");
			oBinding._restoreTreeState().then(function(aResponseData) {
				assert.ok(Array.isArray(aResponseData), "The promise should be resolved");
				assert.equal(getLogCallsFromSpy(oLogSpy, "ODataTreeBindingFlat - Tree state restoration request failed."), 0, "No error got logged");
				oLogSpy.restore();
				done();
			}, function (err) {
				assert.notOk(true, "Promise should not reject with error " + err.message);
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
		requestData(oBinding, 0, 120, 0);
	});

	QUnit.test("Restore tree state: Collapse deep node", function(assert){
		var done = assert.async();
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
			var oLogSpy = sinon.spy(Log, "error");
			oBinding._restoreTreeState().then(function(aResponseData) {
				assert.ok(Array.isArray(aResponseData), "The promise should be resolved");
				assert.equal(getLogCallsFromSpy(oLogSpy, "ODataTreeBindingFlat - Tree state restoration request failed."), 0, "No error got logged");
				oLogSpy.restore();
				done();
			}, function (err) {
				assert.notOk(true, "Promise should not reject with error " + err.message);
				done();
			});
		}

		function handler4(oEvent) {
			oBinding.detachChange(handler4);

			var oParent = oBinding.findNode(0),
				oChild, i;
			for (i = 1; i < 7; i++) {
				oChild = oBinding.findNode(i);
				assert.ok(oBinding._isInSubtree(oParent, oChild), "Children are re-loaded after change event");
			}

			var oFirstChildNode = oBinding.findNode(1);
			assert.ok(oFirstChild !== oFirstChildNode, "Instance of first child object changed");
			assert.notOk(oBinding.isExpanded(oFirstChildNode), "First child node is collapsed");
			assert.equal(oFirstChildNode.children.length, 0, "No request sent for collapsed deep node");
		}

		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 120, 0);
	});

	QUnit.test("Restore tree state: Collapse error handling, whole batch fails", function(assert){
		var done = assert.async();
		createTreeBinding("/ZTJ_G4_C_GLHIER(P_CHARTOFACCOUNTS='CACN',P_FINANCIALSTATEMENTVARIANT='9999')/Results", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 1
		});

		function handler1 (oEvent) {
			oBinding.detachChange(handler1);

			assert.ok(oBinding.isExpanded(0), "To be collapsed node is expanded");
			oBinding.collapse(0, true); // Collapse
			assert.ok(!oBinding.isExpanded(0), "Collapsed node is collapsed");

			oBinding.attachChange(handler2);

			// let the loading of deep nodes fail
			ODataTreeBindingFakeService.setServiceStatus({
				url: {
					500: [
						/\$filter=GLAccount_Level%20le%201/
					]
				}
			});

			oBinding._restoreTreeState().catch(function(err) {
				assert.ok(true, "Promise got rejected");
				ODataTreeBindingFakeService.resetServiceStatus();
				done();
			});
		}
		function handler2 (oEvent) {
			oBinding.detachChange(handler2);
			assert.ok(!oBinding.findNode(0), "No node available");
		}

		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 120, 0);
	});

	QUnit.module("ODataTreeBindingFlat - Tree State: Remove", {
		beforeEach: function() {
			ODataTreeBindingFakeService.setup();
			oModel = new ODataModel("ZTJ_SFIN_HIERARCHY_02_SRV");
			return oModel.metadataLoaded(); // Wait for metadata loaded promise
		},
		afterEach: function() {
			ODataTreeBindingFakeService.teardown();
			oModel.destroy();
		}
	});

	QUnit.test("Restore tree state: adapt server node sections - remove", function(assert) {
		var done = assert.async();
		createTreeBinding("/ZTJ_G4_C_GLHIER(P_CHARTOFACCOUNTS='CACN',P_FINANCIALSTATEMENTVARIANT='9999')/Results", null, [], {
			threshold : 10,
			countMode : "Inline",
			operationMode : "Server",
			numberOfExpandedLevels : 0,
			restoreTreeStateAfterChange : true
		});

		// refresh indicates that the adapter code has been loaded and the binding has been
		// successfully initialized
		oBinding.attachEventOnce("refresh", function () {

			var aSections = [
				{ iSkip : 0, iTop : 20 },
				{ iSkip : 80, iTop : 20 },
				{ iSkip : 120, iTop : 40 },
				{ iSkip : 200, iTop : 40 }
			];

			var aRemovedNodes = [
				{ serverIndex : 10, magnitude : 5 },
				{ serverIndex : 17, magnitude : 2 },
				{ serverIndex : 90, magnitude : 15 },
				{ serverIndex : 120, magnitude : 50 },
				{ serverIndex : 200, magnitude : 10 }
			];

			oBinding._adaptSections(aSections, {
				removed : aRemovedNodes,
				added : []
			});

			var aExpectedSections = [
				{ iSkip :0, iTop :13 },
				{ iSkip :71, iTop :13 },
				{ iSkip :124, iTop :34 }
			];

			assert.deepEqual(aSections, aExpectedSections, "The server sections are correctly adapted");
			done();
		});
	});

	QUnit.test("Restore tree state: adapt deep node sections - remove", function(assert) {
		var done = assert.async();
		createTreeBinding("/ZTJ_G4_C_GLHIER(P_CHARTOFACCOUNTS='CACN',P_FINANCIALSTATEMENTVARIANT='9999')/Results", null, [], {
			threshold : 10,
			countMode : "Inline",
			operationMode : "Server",
			numberOfExpandedLevels : 0,
			restoreTreeStateAfterChange : true
		});

		// refresh indicates that the adapter code has been loaded and the binding has been
		// successfully initialized
		oBinding.attachEventOnce("refresh", function () {
			var aSections = [
				{ iSkip : 0, iTop : 20 },
				{ iSkip : 80, iTop : 20 },
				{ iSkip : 120, iTop : 40 },
				{ iSkip : 200, iTop : 40 }
			];

			var aRemovedNodes = [
				{ positionInParent : 0, magnitude : 0 }, // magnitude properties should be ignored
				{ positionInParent : 1, magnitude : 3 },
				{ positionInParent : 2, magnitude : 0 },
				{ positionInParent : 5, magnitude : 2 },
				{ positionInParent : 19, magnitude : 0 },
				{ positionInParent : 85, magnitude : 15 },
				{ positionInParent : 200, magnitude : 0 },
				{ positionInParent : 205, magnitude : 0 },
				{ positionInParent : 239, magnitude : 0 }
			];

			oBinding._adaptSections(aSections, {
				removed : aRemovedNodes,
				added : []
			}, {
				indexName : "positionInParent",
				ignoreMagnitude : true
			});

			var aExpectedSections = [
				{ iSkip : 0, iTop : 15 },
				{ iSkip : 75, iTop : 19 },
				{ iSkip : 114, iTop : 40 },
				{ iSkip : 194, iTop : 37 }
			];

			assert.deepEqual(aSections, aExpectedSections, "The deep sections are correctly adapted");
			done();
		});
	});

	QUnit.test("Restore tree state: after delete server index nodes (UC5)", function(assert) {
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
			oModel.submitChanges();
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
		requestData(oBinding, 0, 20, 100);
	});

	QUnit.test("Restore tree state: Delete server index node w/ generated server index node (UCx2)", function(assert) {
		var done = assert.async();
		var iOldLength, sOldLastNodeKey;
		createTreeBinding("/ZTJ_G4_C_GLHIER(P_CHARTOFACCOUNTS='CACN',P_FINANCIALSTATEMENTVARIANT='0x2')/Results", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 3,
			restoreTreeStateAfterChange: true
		});

		function handler1() {
			oBinding.detachChange(handler1);
			iOldLength = oBinding.getLength();
			sOldLastNodeKey = oBinding.findNode(iOldLength - 1).key;

			var oNode = oBinding.findNode(17);
			oBinding.removeContext(oNode.context);

			oBinding.attachChange(handler2);
			oModel.submitChanges();
		}

		function handler2() {
			oBinding.detachChange(handler2);

			var iNewLength = oBinding.getLength();
			assert.equal(iNewLength, iOldLength, "New binding length is equal to old length (a generated node replaced the removed node)");

			if (iNewLength === 0) {
				assert.notOk(true, "No data loaded");
			}  else {
				var sNewLastNodeKey = oBinding.findNode(iNewLength - 1).key;
				assert.equal(sNewLastNodeKey, sOldLastNodeKey, "Last node in binding is still the same");
			}
			done();
		}
		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 20, 100);
	});

	QUnit.module("ODataTreeBindingFlat - Tree State: Insert", {
		beforeEach: function() {
			ODataTreeBindingFakeService.setup();
			oModel = new ODataModel("ZTJ_SFIN_HIERARCHY_02_SRV");
			return oModel.metadataLoaded(); // Wait for metadata loaded promise
		},
		afterEach: function() {
			ODataTreeBindingFakeService.teardown();
			oModel.destroy();
		}
	});

	function createAddedNode(oConfig) {
		var oNode = {
			context: {
				getProperty: function(sName) {
					if (sName === "GLAccount_SiblingsPosition") {
						return oConfig.siblingsPosition;
					} else if (sName === "GLAccount_PreorderPosition") {
						return oConfig.preorderPosition;
					} else if (sName === "GLAccount_Nodecount") {
						return oConfig.magnitude;
					}
				}
			},
			isDeepOne: oConfig.isDeepOne
		};
		return oNode;
	}

	QUnit.test("Restore tree state: adapt server node sections - add nodes", function(assert) {
		var done = assert.async();
		createTreeBinding("/ZTJ_G4_C_GLHIER(P_CHARTOFACCOUNTS='CACN',P_FINANCIALSTATEMENTVARIANT='9999')/Results", null, [], {
			threshold : 10,
			countMode : "Inline",
			operationMode : "Server",
			numberOfExpandedLevels : 0,
			restoreTreeStateAfterChange : true
		});

		var aAdded = [];

		var aSections = [
			{ iSkip : 0, iTop : 20 },
			{ iSkip : 80, iTop : 20 },
			{ iSkip : 120, iTop : 40 },
			{ iSkip : 200, iTop : 40 }
		];

		var aAddedNodesConfig = [
			{preorderPosition : 1},
			{preorderPosition : 40},
			{preorderPosition : 41},
			{preorderPosition : 300}
		];

		aAddedNodesConfig.forEach(function(oConfig) {
			aAdded.push(createAddedNode(oConfig));
		});

		// refresh indicates that the adapter code has been loaded and the binding has been
		// successfully initialized
		oBinding.attachEventOnce("refresh", function () {
			oBinding._adaptSections(aSections, {
				added : aAdded
			});

			var aExpectedSections = [
				{ iSkip : 0, iTop : 21 },
				{ iSkip : 40, iTop : 2 },
				{ iSkip : 83, iTop : 20 },
				{ iSkip : 123, iTop : 40 },
				{ iSkip : 203, iTop : 40 },
				{ iSkip : 300, iTop : 1 }
			];

			assert.deepEqual(aSections, aExpectedSections, "The server sections are correctly adapted");
			done();
		});
	});

	QUnit.test("Restore tree state: adapt server node sections - add nodes with magnitudes", function(assert) {
		var done = assert.async();
		createTreeBinding("/ZTJ_G4_C_GLHIER(P_CHARTOFACCOUNTS='CACN',P_FINANCIALSTATEMENTVARIANT='9999')/Results", null, [], {
			threshold : 10,
			countMode : "Inline",
			operationMode : "Server",
			numberOfExpandedLevels : 0,
			restoreTreeStateAfterChange : true
		});

		var aAdded = [];

		var aSections = [
			{ iSkip : 0, iTop : 20 },
			{ iSkip : 80, iTop : 10 }
		];

		var aAddedNodesConfig = [
			{preorderPosition : 1, magnitude : 9}
			// {preorderPosition : 2, magnitude : 1} //  // Never happens: optimizeOptimizedChanges ignores adds inside added parents
		];

		aAddedNodesConfig.forEach(function(oConfig) {
			aAdded.push(createAddedNode(oConfig));
		});

		// refresh indicates that the adapter code has been loaded and the binding has been
		// successfully initialized
		oBinding.attachEventOnce("refresh", function () {
			oBinding._adaptSections(aSections, {
				added : aAdded
			});

			var aExpectedSections = [
				{ iSkip : 0, iTop : 30 },
				{ iSkip : 90, iTop : 10 }
			];

			assert.deepEqual(aSections, aExpectedSections, "The server sections are correctly adapted");
			done();
		});
	});

	QUnit.test("Restore tree state: adapt deep node sections - add nodes", function(assert) {
		var done = assert.async();
		createTreeBinding("/ZTJ_G4_C_GLHIER(P_CHARTOFACCOUNTS='CACN',P_FINANCIALSTATEMENTVARIANT='9999')/Results", null, [], {
			threshold : 10,
			countMode : "Inline",
			operationMode : "Server",
			numberOfExpandedLevels : 0,
			restoreTreeStateAfterChange : true
		});

		var aSections = [
			{ iSkip : 0, iTop : 20 },
			{ iSkip : 80, iTop : 20 },
			{ iSkip : 120, iTop : 40 },
			{ iSkip : 200, iTop : 40 }
		];

		var aAddedNodesConfig = [
			{siblingsPosition : 1, isDeepOne : true}, // New node at actual position 1
			{siblingsPosition : 40, isDeepOne : true}, // New node at actual position 40 (abap starts at 1)
			{siblingsPosition : 41, isDeepOne : true},
			{siblingsPosition : 300, isDeepOne : true}
		];

		var aAdded = [];
		aAddedNodesConfig.forEach(function(oConfig) {
			aAdded.push(createAddedNode(oConfig));
		});
		// refresh indicates that the adapter code has been loaded and the binding has been
		// successfully initialized
		oBinding.attachEventOnce("refresh", function () {
			oBinding._adaptSections(aSections, {
				added : aAdded
			}, {
				indexName : "positionInParent",
				ignoreMagnitude : true
			});

			var aExpectedSections = [
				{ iSkip : 0, iTop : 21 },
				{ iSkip : 40, iTop : 2 },
				{ iSkip : 83, iTop : 20 },
				{ iSkip : 123, iTop : 40 },
				{ iSkip : 203, iTop : 40 },
				{ iSkip : 300, iTop : 1 }
			];

			assert.deepEqual(aSections, aExpectedSections, "The server sections are correctly adapted");
			done();
		});
	});

	QUnit.test("Restore tree state: insert server index node (UC1)", function(assert) {
		var done = assert.async();
		var iOldLength, sOldLastNodeKey;
		createTreeBinding("/ZTJ_G4_C_GLHIER(P_CHARTOFACCOUNTS='CACN',P_FINANCIALSTATEMENTVARIANT='001')/Results", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 4,
			restoreTreeStateAfterChange: true
		});

		function handler1() {
			oBinding.detachChange(handler1);
			iOldLength = oBinding.getLength();
			sOldLastNodeKey = oBinding.findNode(iOldLength - 1).key;

			var oParent = oBinding.findNode(5);
			var oContext = oBinding.createEntry({
				urlParameters: {
					"hierarchy_fake_node_id": "NODE111114"
				}
			});
			oBinding.addContexts(oParent.context, [oContext]);
			oBinding.attachChange(handler2);
			oModel.submitChanges();
		}

		function handler2() {
			oBinding.detachChange(handler2);
			var iNewLength = oBinding.getLength();
			assert.equal(iNewLength, iOldLength + 1, "New binding length is old length plus one");

			if (iNewLength === 0) {
				assert.notOk(true, "No data loaded");
			}  else {
				var sNewLastNodeKey = oBinding.findNode(iNewLength - 1).key;
				assert.equal(sNewLastNodeKey, sOldLastNodeKey, "Last node in binding is still the same");
			}
			done();
		}

		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 20, 100);
	});

	QUnit.test("Restore tree state: insert deep node (UC2)", function(assert) {
		var done = assert.async();
		var iOldLength, sOldLastNodeKey, oParent;
		createTreeBinding("/ZTJ_G4_C_GLHIER(P_CHARTOFACCOUNTS='CACN',P_FINANCIALSTATEMENTVARIANT='002')/Results", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 3,
			restoreTreeStateAfterChange: true
		});

		function handler1() {
			oBinding.detachChange(handler1);
			iOldLength = oBinding.getLength();
			sOldLastNodeKey = oBinding.findNode(iOldLength - 1).key;

			oParent = oBinding.findNode(4);

			oBinding.attachChange(handler2);
			oBinding.expand(oParent, true);
		}

		function handler2() {
			oBinding.detachChange(handler2);

			// update the length after expand which is used for comparing after the save
			iOldLength = oBinding.getLength();

			var oContext = oBinding.createEntry({
				urlParameters: {
					"hierarchy_fake_node_id": "NODE113334"
				}
			});

			oBinding.addContexts(oParent.context, [oContext]);

			oBinding.attachChange(handler3);
			oModel.submitChanges();
		}

		function handler3() {
			oBinding.detachChange(handler3);
			var iNewLength = oBinding.getLength();
			assert.equal(iNewLength, iOldLength + 1, "New binding length is old length plus one");

			// TODO test for still expanded node

			if (iNewLength === 0) {
				assert.notOk(true, "No data loaded");
			}  else {
				var sNewLastNodeKey = oBinding.findNode(iNewLength - 1).key;
				assert.equal(sNewLastNodeKey, sOldLastNodeKey, "Last node in binding is still the same");
			}
			done();
		}
		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 20, 100);
	});

	QUnit.test("Restore tree state: insert deep nodes (UC3)", function(assert) {
		var done = assert.async();
		var iOldLength, sOldLastNodeKey, oParent;
		var oContext1;
		createTreeBinding("/ZTJ_G4_C_GLHIER(P_CHARTOFACCOUNTS='CACN',P_FINANCIALSTATEMENTVARIANT='003')/Results", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 3,
			restoreTreeStateAfterChange: true
		});

		function handler1() {
			oBinding.detachChange(handler1);
			iOldLength = oBinding.getLength();
			sOldLastNodeKey = oBinding.findNode(iOldLength - 1).key;

			oParent = oBinding.findNode(7);

			oBinding.attachChange(handler2);
			oBinding.expand(oParent, true);
		}

		function handler2() {
			oBinding.detachChange(handler2);

			// update the length after expand which is used for comparing after the save
			iOldLength = oBinding.getLength();

			assert.equal(iOldLength, 47, "Length is correct after expand");

			oContext1 = oBinding.createEntry({
				urlParameters: {
					"hierarchy_fake_node_id": "NODE333444"
				}
			});
			oBinding.addContexts(oParent.context, [oContext1]);

			var oContext2 = oBinding.createEntry({
				urlParameters: {
					"hierarchy_fake_node_id": "RANGE333444"
				}
			});
			oBinding.addContexts(oContext1, [oContext2]);

			oBinding.attachChange(handler3);
			oModel.submitChanges();
		}

		function handler3() {
			oBinding.detachChange(handler3);
			var iNewLength = oBinding.getLength();
			assert.equal(iNewLength, iOldLength + 1, "New binding length is old length plus one");

			// TODO test for still expanded node

			if (iNewLength === 0) {
				assert.notOk(true, "No data loaded");
			}  else {
				var sNewLastNodeKey = oBinding.findNode(iNewLength - 1).key;
				assert.equal(sNewLastNodeKey, sOldLastNodeKey, "Last node in binding is still the same");
			}
			done();
		}
		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 20, 100);
	});

	QUnit.test("Restore tree state: insert server index- and deep nodes (UC4)", function(assert) {
		var done = assert.async();
		var iOldLength, sOldLastNodeKey, oParent;

		createTreeBinding("/ZTJ_G4_C_GLHIER(P_CHARTOFACCOUNTS='CACN',P_FINANCIALSTATEMENTVARIANT='004')/Results", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 3,
			restoreTreeStateAfterChange: true
		});

		function handler1() {
			oBinding.detachChange(handler1);
			iOldLength = oBinding.getLength();
			sOldLastNodeKey = oBinding.findNode(iOldLength - 1).key;

			oParent = oBinding.findNode(5);
			var oContext1 = oBinding.createEntry({
				urlParameters: {
					"hierarchy_fake_node_id": "NODE500000"
				}
			});
			oBinding.addContexts(oParent.context, [oContext1]);

			var oContext2 = oBinding.createEntry({
				urlParameters: {
					"hierarchy_fake_node_id": "NODE500001"
				}
			});
			oBinding.addContexts(oContext1, [oContext2]);

			oBinding.expand(6, true);

			var oContext3 = oBinding.createEntry({
				urlParameters: {
					"hierarchy_fake_node_id": "RANGE500001"
				}
			});
			var oContext4 = oBinding.createEntry({
				urlParameters: {
					"hierarchy_fake_node_id": "RANGE500002"
				}
			});
			oBinding.addContexts(oContext2, [oContext3, oContext4]);

			oBinding.expand(7, true);

			assert.equal(oBinding.getLength(), iOldLength + 4, "length is correct after adding 4 new nodes");
			iOldLength = oBinding.getLength();

			oBinding.attachChange(handler2);
			oModel.submitChanges();
		}

		function handler2() {
			oBinding.detachChange(handler2);

			var iNewLength = oBinding.getLength();
			assert.equal(iNewLength, iOldLength, "New binding length should stay the same after new nodes are saved");

			// TODO test for still expanded node

			if (iNewLength === 0) {
				assert.notOk(true, "No data loaded");
			}  else {
				var sNewLastNodeKey = oBinding.findNode(iNewLength - 1).key;
				assert.equal(sNewLastNodeKey, sOldLastNodeKey, "Last node in binding is still the same");
			}
			done();
		}
		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 20, 100);
	});

	QUnit.test("Restore tree state: insert server index- and deep nodes (UC4b)", function(assert) {
		var done = assert.async();
		var iOldLength, sOldLastNodeKey, oParent;
		createTreeBinding("/ZTJ_G4_C_GLHIER(P_CHARTOFACCOUNTS='CACN',P_FINANCIALSTATEMENTVARIANT='004b')/Results", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 3,
			restoreTreeStateAfterChange: true
		});

		function handler1() {
			oBinding.detachChange(handler1);
			iOldLength = oBinding.getLength();
			sOldLastNodeKey = oBinding.findNode(iOldLength - 1).key;

			oParent = oBinding.findNode(11);

			// Add node E (server index node)
			var oContext1 = oBinding.createEntry({
				urlParameters: {
					"hierarchy_fake_node_id": "NODE40090"
				}
			});
			oBinding.addContexts(oParent.context, [oContext1]);


			// Add node E1 (server index node)
			var oContext2 = oBinding.createEntry({
				urlParameters: {
					"hierarchy_fake_node_id": "NODE40091"
				}
			});

			oBinding.addContexts(oContext1, [oContext2]);

			// Expanding E
			oBinding.expand(12, true);

			// Add node E1.1 (deep node)
			var oContext3 = oBinding.createEntry({
				urlParameters: {
					"hierarchy_fake_node_id": "RANGE400090"
				}
			});
			// Add node E1.2 (deep node)
			var oContext4 = oBinding.createEntry({
				urlParameters: {
					"hierarchy_fake_node_id": "RANGE400092"
				}
			});
			oBinding.addContexts(oContext2, [oContext3, oContext4]);

			// Exapnding E1
			oBinding.expand(13, true);

			assert.equal(oBinding.getLength(), iOldLength + 4, "length is correct after adding 4 new nodes");
			iOldLength = oBinding.getLength();

			oBinding.attachChange(handler2);
			oModel.submitChanges();
		}

		function handler2() {
			oBinding.detachChange(handler2);

			var iNewLength = oBinding.getLength();
			assert.equal(iNewLength, iOldLength, "New binding length should stay the same after new nodes are saved");

			// TODO test for still expanded node

			if (iNewLength === 0) {
				assert.notOk(true, "No data loaded");
			}  else {
				var sNewLastNodeKey = oBinding.findNode(iNewLength - 1).key;
				assert.equal(sNewLastNodeKey, sOldLastNodeKey, "Last node in binding is still the same");
			}
			done();
		}
		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 20, 100);
	});


	QUnit.test("Restore tree state: insert server index node w/ generated deep node (UCx3)", function(assert) {
		var done = assert.async();
		var iOldLength, sOldLastNodeKey;

		createTreeBinding("/ZTJ_G4_C_GLHIER(P_CHARTOFACCOUNTS='CACN',P_FINANCIALSTATEMENTVARIANT='0x3')/Results", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2,
			restoreTreeStateAfterChange: true
		});

		function handler1() {
			oBinding.detachChange(handler1);
			iOldLength = oBinding.getLength();
			sOldLastNodeKey = oBinding.findNode(iOldLength - 1).key;

			var oParent = oBinding.findNode(1);
			var oContext1 = oBinding.createEntry({
				urlParameters: {
					"hierarchy_fake_node_id": "NODE123456"
				}
			});
			oBinding.addContexts(oParent.context, [oContext1]);

			oBinding.attachChange(handler2);
			oModel.submitChanges();
		}

		function handler2() {
			oBinding.detachChange(handler2);

			var iNewLength = oBinding.getLength();
			assert.equal(iNewLength, iOldLength + 1, "New binding length is old length plus 1 (server side generated node is a deep node)");

			// TODO check for generated node

			if (iNewLength === 0) {
				assert.notOk(true, "No data loaded");
			}  else {
				var sNewLastNodeKey = oBinding.findNode(iNewLength - 1).key;
				assert.equal(sNewLastNodeKey, sOldLastNodeKey, "Last node in binding is still the same");
			}
			done();
		}
		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 20, 100);
	});

	QUnit.test("Restore tree state: insert server index node w/ generated server index node (UCx4)", function(assert) {
		var done = assert.async();
		var iOldLength, sOldLastNodeKey;

		createTreeBinding("/ZTJ_G4_C_GLHIER(P_CHARTOFACCOUNTS='CACN',P_FINANCIALSTATEMENTVARIANT='0x4')/Results", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 3,
			restoreTreeStateAfterChange: true
		});

		function handler1() {
			oBinding.detachChange(handler1);
			iOldLength = oBinding.getLength();
			sOldLastNodeKey = oBinding.findNode(iOldLength - 1).key;

			var oParent = oBinding.findNode(1);
			var oContext1 = oBinding.createEntry({
				urlParameters: {
					"hierarchy_fake_node_id": "NODE000001"
				}
			});
			oBinding.addContexts(oParent.context, [oContext1]);

			oBinding.attachChange(handler2);
			oModel.submitChanges();
		}

		function handler2() {
			oBinding.detachChange(handler2);

			var iNewLength = oBinding.getLength();
			assert.equal(iNewLength, iOldLength + 2, "New binding length is old length plus two (server side generated node)");

			// TODO check for generated node

			if (iNewLength === 0) {
				assert.notOk(true, "No data loaded");
			}  else {
				var sNewLastNodeKey = oBinding.findNode(iNewLength - 1).key;
				assert.equal(sNewLastNodeKey, sOldLastNodeKey, "Last node in binding is still the same");
			}
			done();
		}
		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 20, 100);
	});

	QUnit.module("ODataTreeBindingFlat - Tree State: Move", {
		beforeEach: function() {
			ODataTreeBindingFakeService.setup();
			oModel = new ODataModel("ZTJ_SFIN_HIERARCHY_02_SRV", {
				defaultUpdateMethod: UpdateMethod.Put
			});
			return oModel.metadataLoaded(); // Wait for metadata loaded promise
		},
		afterEach: function() {
			ODataTreeBindingFakeService.teardown();
			oModel.destroy();
		}
	});

	QUnit.test("Restore tree state: adapt server node sections - move nodes", function(assert) {
		var done = assert.async();
		createTreeBinding("/ZTJ_G4_C_GLHIER(P_CHARTOFACCOUNTS='CACN',P_FINANCIALSTATEMENTVARIANT='9999')/Results", null, [], {
			threshold : 10,
			countMode : "Inline",
			operationMode : "Server",
			numberOfExpandedLevels : 0,
			restoreTreeStateAfterChange : true
		});

		var aSections = [
			{ iSkip : 0, iTop : 20 },
			{ iSkip : 80, iTop : 20 },
			{ iSkip : 120, iTop : 40 },
			{ iSkip : 180, iTop : 2 },
			{ iSkip : 200, iTop : 40 }
		];

		var aAddedNodesConfig = [
			{preorderPosition : 1}, // New node at actual position 1
			{preorderPosition : 40}, // New node at actual position 40 (abap starts at 1)
			{preorderPosition : 41},
			{preorderPosition : 100},
			{preorderPosition : 129},
			{preorderPosition : 300}
		];

		var aAdded = [];
		aAddedNodesConfig.forEach(function(oConfig) {
			aAdded.push(createAddedNode(oConfig));
		});

		var aRemovedNodes = [
			{ serverIndex : 10, magnitude : 1 },
			{ serverIndex : 17, magnitude : 2 },
			{ serverIndex : 90, magnitude : 90 }, // removes end of section 80, full 120 and start of 180
			// { serverIndex : 91, magnitude : 1 }, // Never happens: optimizeChanges ignores removes inside removed parents
			{ serverIndex : 239, magnitude : 0 }
		];

		oBinding.attachEventOnce("refresh", function () {
			oBinding._adaptSections(aSections, {
				added : aAdded,
				removed : aRemovedNodes
			});

			var aExpectedSections = [
				{ iSkip : 0, iTop : 18 },
				{ iSkip : 40, iTop : 2 }, // New section does not need to calculate in potentially generated server index nodes. Position is already provided by service
				{ iSkip : 78, iTop : 13 },
				{ iSkip : 87, iTop : 4 },
				{ iSkip : 100, iTop : 1 },
				{ iSkip : 108, iTop : 44 }, // Was section { iSkip : 200, iTop : 40 }
				{ iSkip : 300, iTop : 1 }
			];

			assert.deepEqual(aSections, aExpectedSections, "The server sections are correctly adapted");
			done();
		});
	});

	QUnit.test("Restore tree state: adapt deep node sections - move nodes", function(assert) {
		var done = assert.async();
		createTreeBinding("/ZTJ_G4_C_GLHIER(P_CHARTOFACCOUNTS='CACN',P_FINANCIALSTATEMENTVARIANT='9999')/Results", null, [], {
			threshold : 10,
			countMode : "Inline",
			operationMode : "Server",
			numberOfExpandedLevels : 0,
			restoreTreeStateAfterChange : true
		});

		var aSections = [
			{ iSkip : 0, iTop : 20 },
			{ iSkip : 80, iTop : 20 },
			{ iSkip : 120, iTop : 40 },
			{ iSkip : 200, iTop : 40 }
		];

		var aAddedNodesConfig = [
			{siblingsPosition : 1, isDeepOne : true}, // New node at actual position 1
			{siblingsPosition : 40, isDeepOne : true}, // New node at actual position 40 (abap starts at 1)
			{siblingsPosition : 41, isDeepOne : true},
			{siblingsPosition : 300, isDeepOne : true}
		];

		var aAdded = [];
		aAddedNodesConfig.forEach(function(oConfig) {
			aAdded.push(createAddedNode(oConfig));
		});

		var aRemovedNodes = [
			{ positionInParent : 10, magnitude : 5 }, // magnitude properties should be ignored
			{ positionInParent : 17, magnitude : 2 },
			{ positionInParent : 90, magnitude : 15 },
			{ positionInParent : 120, magnitude : 50 },
			{ positionInParent : 239, magnitude : 10 }
		];

		oBinding.attachEventOnce("refresh", function () {
			oBinding._adaptSections(aSections, {
				added : aAdded,
				removed : aRemovedNodes
			}, {
				indexName : "positionInParent",
				ignoreMagnitude : true
			});

			var aExpectedSections = [
				{ iSkip : 0, iTop : 19 },
				{ iSkip : 40, iTop : 2 },
				{ iSkip : 81, iTop : 19 },
				{ iSkip : 120, iTop : 39 },
				{ iSkip : 199, iTop : 39 },
				{ iSkip : 300, iTop : 1 }
			];

			assert.deepEqual(aSections, aExpectedSections, "The server sections are correctly adapted");
			done();
		});
	});

	QUnit.test("Restore tree state: move server index node to deep nodes (UC8)", function(assert) {
		var done = assert.async();
		var iOldLength, sOldLastNodeKey;

		createTreeBinding("/ZTJ_G4_C_GLHIER(P_CHARTOFACCOUNTS='CACN',P_FINANCIALSTATEMENTVARIANT='008')/Results", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 3,
			restoreTreeStateAfterChange: true
		});

		function handler1() {
			oBinding.attachEventOnce("change", handler2);
			oBinding.expand(6, true);
		}

		function handler2() {
			iOldLength = oBinding.getLength();
			sOldLastNodeKey = oBinding.findNode(iOldLength - 1).key;

			var oNode = oBinding.findNode(12);
			oBinding.removeContext(oNode.context);

			var oNewParent = oBinding.findNode(6);
			oBinding.addContexts(oNewParent.context, [oNode.context]);

			oModel.submitChanges({
				success : function () {
					oBinding.attachEventOnce("change", handler3);
				}
			});
		}

		function handler3() {
			var iNewLength = oBinding.getLength();
			assert.equal(iNewLength, iOldLength - 4, "New binding length is equal to old length minus four (child nodes of moved node)");

			if (iNewLength === 0) {
				assert.notOk(true, "No data loaded");
			}  else {
				var sNewLastNodeKey = oBinding.findNode(iNewLength - 1).key;
				assert.equal(sNewLastNodeKey, sOldLastNodeKey, "Last node in binding is still the same");
			}
			done();
		}
		oBinding.attachEventOnce("change", handler1);
		requestData(oBinding, 0, 20, 100);
	});

	QUnit.test("Restore tree state: Move one level down - server-index child nodes become deep nodes (UC10)", function(assert) {
		var done = assert.async();
		var iOldLength, sOldLastNodeKey;

		createTreeBinding("/ZTJ_G4_C_GLHIER(P_CHARTOFACCOUNTS='CACN',P_FINANCIALSTATEMENTVARIANT='010')/Results", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 3,
			restoreTreeStateAfterChange: true
		});

		function handler1() {
			iOldLength = oBinding.getLength();
			sOldLastNodeKey = oBinding.findNode(iOldLength - 1).key;

			var oNode = oBinding.findNode(4);
			oBinding.removeContext(oNode.context);

			var oNewParent = oBinding.findNode(13);
			oBinding.addContexts(oNewParent.context, [oNode.context]);

			oModel.submitChanges({
				success : function () {
					oBinding.attachEventOnce("change", handler2);
				}
			});
		}

		function handler2() {
			var iNewLength = oBinding.getLength();
			assert.equal(iNewLength, iOldLength - 1, "New binding length is equal to old length minus one (child node of moved node)");

			if (iNewLength === 0) {
				assert.notOk(true, "No data loaded");
			}  else {
				var sNewLastNodeKey = oBinding.findNode(iNewLength - 1).key;
				assert.equal(sNewLastNodeKey, sOldLastNodeKey, "Last node in binding is still the same");
			}
			done();
		}
		oBinding.attachEventOnce("change", handler1);
		requestData(oBinding, 0, 20, 100);
	});


	QUnit.test("Restore tree state: move deep nodes to server index (UC17)", function(assert) {
		var done = assert.async();
		var iOldLength, sOldLastNodeKey;

		createTreeBinding("/ZTJ_G4_C_GLHIER(P_CHARTOFACCOUNTS='CACN',P_FINANCIALSTATEMENTVARIANT='017')/Results", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 3,
			restoreTreeStateAfterChange: true
		});

		function handler1() {
			oBinding.attachEventOnce("change", handler2);
			oBinding.expand(3, true);
		}

		function handler2() {
			oBinding.attachEventOnce("change", handler3);
			oBinding.expand(5, true);
		}

		function handler3() {
			oBinding.attachEventOnce("change", handler4);
			oBinding.expand(6, true);
		}

		function handler4() {
			oBinding.attachEventOnce("change", handler5);
			oBinding.expand(7, true);
		}

		function handler5() {
			iOldLength = oBinding.getLength();
			sOldLastNodeKey = oBinding.findNode(iOldLength - 1).key;

			var oNode = oBinding.findNode(5);
			oBinding.removeContext(oNode.context);

			var oNewParent = oBinding.findNode(1);
			oBinding.addContexts(oNewParent.context, [oNode.context]);

			oModel.submitChanges({
				success : function () {
					oBinding.attachEventOnce("change", handler6);
				}
			});
		}

		function handler6() {
			var iNewLength = oBinding.getLength();
			assert.equal(iNewLength, iOldLength, "New binding length is equal to old length");

			if (iNewLength === 0) {
				assert.notOk(true, "No data loaded");
			}  else {
				var sNewLastNodeKey = oBinding.findNode(iNewLength - 1).key;
				assert.equal(sNewLastNodeKey, sOldLastNodeKey, "Last node in binding is still the same");
			}
			done();
		}
		oBinding.attachEventOnce("change", handler1);
		requestData(oBinding, 0, 20, 100);
	});
});