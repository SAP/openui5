/*global QUnit */
sap.ui.define([
	"test-resources/sap/ui/core/qunit/odata/v2/data/ODataTreeBindingFakeService",
	"sap/ui/model/odata/v2/ODataModel"
], function(
	ODataTreeBindingFakeService,
	ODataModel
) {
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

	QUnit.module("ODataTreeBindingFlat - Expand node to level", {
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

	QUnit.test("_loadSubTree: Request correct server index sections", function(assert) {
		var done = assert.async();
		createTreeBinding("/ZTJ_G4_C_GLHIER(P_CHARTOFACCOUNTS='CACN',P_FINANCIALSTATEMENTVARIANT='ENtL_UNIT_TEST')/Results", null, [], {
			threshold : 10,
			countMode : "Inline",
			operationMode : "Server",
			numberOfExpandedLevels : 0
		});

		oBinding._aNodes = [];
		oBinding._aNodes[0] = true;
		oBinding._aNodes[1] = true; // parent node
		// -- Section 1 --
		oBinding._aNodes[5] = true; // child node of 1
		oBinding._aNodes[6] = true; // child node of 1
		oBinding._aNodes[7] = true; // child node of 1
		// -- Section 2 --
		oBinding._aNodes[10] = true; // child node of 1
		oBinding._aNodes[11] = true; // child node of 1
		// -- Section 3 --
		oBinding._aNodes[13] = true; // child node of 1
		// -- Section 4 -- (only one node, 14 is the last node below 1)

		var oFakeParentNode = {
			serverIndex : 1,
			magnitude : 13
		};

		// refresh indicates that the adapter code has been loaded and the binding has been
		// successfully initialized
		oBinding.attachRefresh(function () {
			var aLoadDataCalls = [];
			oBinding._loadData = function(iSkip, iTop) {
				aLoadDataCalls.push({
					iSkip : iSkip,
					iTop : iTop
				});
			};

			oBinding._requestSubTree = function () {
				return Promise.reject(new Error("Dummy reject to stop further processing"));
			};


			oBinding._loadSubTree(oFakeParentNode, 4).then(function () {
				assert.deepEqual(aLoadDataCalls, [{
					iSkip : 2,
					iTop : 3
				}, {
					iSkip : 8,
					iTop : 2
				}, {
					iSkip : 12,
					iTop : 1
				}, {
					iSkip : 14,
					iTop : 1
				}], "Correct sections requested");
				done();
			});
		});
	});

	QUnit.test("Expand root node (initial expansion level 0) to level 4 (ENtL01)", function(assert) {
		var done = assert.async();
		createTreeBinding("/ZTJ_G4_C_GLHIER(P_CHARTOFACCOUNTS='CACN',P_FINANCIALSTATEMENTVARIANT='ENtL01')/Results", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 0
		});

		function handler1() {
			oBinding.detachChange(handler1);
			oBinding.getContexts(0, 20, 100);
			oBinding.expandNodeToLevel(0, 4).then(handler2);
		}

		function handler2() {
			oBinding.getContexts(0, 20, 100);
			assert.ok(!!oBinding.findNode(6), "Found a node at index 6");
			assert.deepEqual(oBinding.findNode(6).key,
				"ZTJ_G4_C_GLHIERResults('V2.36.34.32_1.2.4.0.1.2.3.0.1.2.1.1%3A0.16.0.0.X.0_IEQCACNIEQ00100000%3ACACNY0000000000_06Q88TZJOAW65DRWR6OHRU9QAX2H39PM')",
				"Correct node at index 6 (level 2)");
			assert.ok(!!oBinding.findNode(16), "Found a node at index 16");
			assert.deepEqual(oBinding.findNode(16).key,
				"ZTJ_G4_C_GLHIERResults('V2.36.34.32_1.2.4.0.1.2.3.0.1.2.1.1%3A0.16.0.0.X.0_IEQCACNIEQ00100000%3ACACN%200000000010_06Q88TZJOAW65DRWR6OHRU9QAX2H39PM')",
				"Correct node at index 16 (level 4)");
			done();
		}
		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 20, 100);
	});

	QUnit.test("Expand root node (initial expansion level 2) to level 4 (ENtL02)", function(assert) {
		var done = assert.async();
		createTreeBinding("/ZTJ_G4_C_GLHIER(P_CHARTOFACCOUNTS='CACN',P_FINANCIALSTATEMENTVARIANT='ENtL02')/Results", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		function handler1() {
			oBinding.detachChange(handler1);
			oBinding.getContexts(0, 5);
			oBinding.expandNodeToLevel(0, 4).then(handler2);
		}

		function handler2() {
			oBinding.getContexts(0, 20);
			assert.ok(!!oBinding.findNode(5), "Found a node at index 5");
			assert.deepEqual(oBinding.findNode(5).key,
				"ZTJ_G4_C_GLHIERResults('V2.36.29.32_1.2.4.0.1.2.3.0.1.2.1.1%3A0.11.0.0.X.0_IEQCACNIEQ0010000052372%3A001%202_0SUTU1Z8RLLDHJYDDY9JI1C15PXF8WA1')",
				"Correct node at index 5 (level 2)");
			assert.ok(!!oBinding.findNode(16), "Found a node at index 16");
			assert.deepEqual(oBinding.findNode(16).key,
				"ZTJ_G4_C_GLHIERResults('V2.36.34.32_1.2.4.0.1.2.3.0.1.2.1.1%3A0.16.0.0.X.0_IEQCACNIEQ00100000%3ACACN%200000000010_06Q88TZJOAW65DRWR6OHRU9QAX2H39PM')",
				"Correct node at index 16 (level 4)");

			// TODO: add checks for no additional requests that might have been created by expand operations
			done();
		}
		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 5);
	});

	QUnit.test("Expand root node (initial expansion level 0 + first child and childrens child manually expanded) to level 4 (ENtL03)", function(assert) {
		var done = assert.async();
		createTreeBinding("/ZTJ_G4_C_GLHIER(P_CHARTOFACCOUNTS='CACN',P_FINANCIALSTATEMENTVARIANT='ENtL03')/Results", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 0
		});

		function handler1() {
			oBinding.detachChange(handler1);
			oBinding.getContexts(0, 20, 100);
			oBinding.attachChange(handler2);
			oBinding.expand(0, true);
		}

		function handler2() {
			oBinding.detachChange(handler2);
			oBinding.getContexts(0, 20, 100);
			oBinding.attachChange(handler3);
			oBinding.expand(1, true);
		}

		function handler3() {
			oBinding.detachChange(handler3);
			oBinding.getContexts(0, 20, 100);
			oBinding.expandNodeToLevel(0, 4).then(handler4);
		}

		function handler4() {
			oBinding.getContexts(0, 20, 100);
			assert.ok(!!oBinding.findNode(6), "Found a node at index 6");
			assert.deepEqual(oBinding.findNode(6).key,
				"ZTJ_G4_C_GLHIERResults('V2.36.34.32_1.2.4.0.1.2.3.0.1.2.1.1%3A0.16.0.0.X.0_IEQCACNIEQ00100000%3ACACNY0000000000_06Q88TZJOAW65DRWR6OHRU9QAX2H39PM')",
				"Correct node at index 6 (level 2)");
			assert.ok(!!oBinding.findNode(16), "Found a node at index 16");
			assert.deepEqual(oBinding.findNode(16).key,
				"ZTJ_G4_C_GLHIERResults('V2.36.34.32_1.2.4.0.1.2.3.0.1.2.1.1%3A0.16.0.0.X.0_IEQCACNIEQ00100000%3ACACN%200000000010_06Q88TZJOAW65DRWR6OHRU9QAX2H39PM')",
				"Correct node at index 16 (level 4)");
			done();
		}
		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 20, 100);
	});

	QUnit.test("Expand deep node to level 4 (ENtL04)", function(assert) {
		var done = assert.async();
		createTreeBinding("/ZTJ_G4_C_GLHIER(P_CHARTOFACCOUNTS='CACN',P_FINANCIALSTATEMENTVARIANT='ENtL04')/Results", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 0
		});

		function handler1() {
			oBinding.detachChange(handler1);
			oBinding.getContexts(0, 20, 100);
			oBinding.attachChange(handler2);
			oBinding.expand(0, true);
		}

		function handler2() {
			oBinding.detachChange(handler2);
			oBinding.getContexts(0, 20, 100);
			oBinding.expandNodeToLevel(7, 4).then(handler3);
		}

		function handler3() {
			oBinding.getContexts(0, 20, 100);
			assert.ok(!!oBinding.findNode(10), "Found a node at index 10");
			assert.deepEqual(oBinding.findNode(10).key,
				"ZTJ_G4_C_GLHIERResults('V2.36.34.32_1.2.4.0.1.2.3.0.1.2.1.1%3A0.16.0.0.X.0_IEQCACNIEQ00100000%3ACACN%200000000010_0JF3PI8EYUQWUJJDOOYJV5DO616YD7AY')",
				"Correct node at index 10 (level 4)");
			done();
		}
		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 20, 100);
	});

	QUnit.test("Expand root node (initial expansion level 0 + child and childrens childs manually expanded, some loaded only partially (paged)) to level 4 (ENtL05)", function(assert) {
		var done = assert.async();
		createTreeBinding("/ZTJ_G4_C_GLHIER(P_CHARTOFACCOUNTS='CACN',P_FINANCIALSTATEMENTVARIANT='ENtL05')/Results", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 0
		});

		function handler1() {
			oBinding.detachChange(handler1);
			oBinding.getContexts(0, 20, 100);
			oBinding.attachChange(handler2);
			oBinding.expand(0, true);
		}

		function handler2() {
			oBinding.detachChange(handler2);
			oBinding.getContexts(0, 20, 100);
			oBinding.attachChange(handler3);
			oBinding.expand(7, true);
		}

		function handler3() {
			oBinding.detachChange(handler3);
			oBinding.getContexts(0, 20, 100);
			oBinding.attachChange(handler4);
			oBinding.expand(8, true);
		}

		function handler4() {
			oBinding.detachChange(handler4);
			oBinding.getContexts(0, 20, 100);
			oBinding.attachChange(handler5);
			oBinding.expand(9, true);
		}

		function handler5() {
			oBinding.detachChange(handler5);
			oBinding.getContexts(0, 20, 100);
			oBinding.expandNodeToLevel(0, 4).then(handler6);
		}

		function handler6() {
			oBinding._bReadOnly = false; // Simulate hierarchy maintenance just for the thrill of it

			oBinding.getContexts(10, 30, 100);
			assert.ok(!!oBinding.findNode(16), "Found a node at index 16");
			assert.deepEqual(oBinding.findNode(16).key,
				"ZTJ_G4_C_GLHIERResults('V2.36.34.32_1.2.4.0.1.2.3.0.1.2.1.1%3A0.16.0.0.X.0_IEQCACNIEQ00100000%3ACACN%200000000010_0PVDB7PKY37IR1DZDNSLRY7R0GI6OIBV')",
				"Correct node at index 16 (level 4)");
			assert.ok(!!oBinding.findNode(32), "Found a node at index 32");
			assert.deepEqual(oBinding.findNode(32).key,
				"ZTJ_G4_C_GLHIERResults('V2.36.34.32_1.2.4.0.1.2.3.0.1.2.1.1%3A0.16.0.0.X.0_IEQCACNIEQ00100000%3ACACN%200000000082_0PVDB7PKY37IR1DZDNSLRY7R0GI6OIBV')",
				"Correct node at index 32 (level 4)");
			done();
		}
		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 20, 100);
	});

	QUnit.test("Manual expand root node, expand root node (initial expansion level 0) to level 4, manual collapse some nodes (ENtL06)", function(assert) {
		var done = assert.async();
		createTreeBinding("/ZTJ_G4_C_GLHIER(P_CHARTOFACCOUNTS='CACN',P_FINANCIALSTATEMENTVARIANT='ENtL06')/Results", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 0
		});

		function handler1() {
			oBinding.detachChange(handler1);
			oBinding.getContexts(0, 20, 100);
			oBinding.attachChange(handler2);
			oBinding.expand(0, true);
		}

		function handler2() {
			oBinding.detachChange(handler2);
			oBinding.getContexts(0, 20, 100);
			oBinding.expandNodeToLevel(0, 4).then(handler3);
		}

		function handler3() {
			oBinding.detachChange(handler3);
			oBinding.getContexts(0, 20, 100);
			oBinding.attachChange(handler4);
			oBinding.collapse(13);
		}

		function handler4() {
			oBinding.detachChange(handler4);
			oBinding.getContexts(0, 20, 100);
			oBinding.attachChange(handler5);
			oBinding.collapse(14);
		}

		function handler5() {
			oBinding.detachChange(handler5);
			oBinding.getContexts(0, 20, 100);
			assert.ok(!!oBinding.findNode(14), "Found a node at index 14");
			assert.deepEqual(oBinding.findNode(14).key,
				"ZTJ_G4_C_GLHIERResults('V2.36.29.32_1.2.4.0.1.2.3.0.1.2.1.1%3A0.11.0.0.X.0_IEQCACNIEQ0010000052372%3A001%207_0OJCITXAIZ2D0WHVA468ROFWBKT4YWA6')",
				"Correct node at index 14 (level 2)");
			assert.ok(!!oBinding.findNode(15), "Found a node at index 15");
			assert.deepEqual(oBinding.findNode(15).key,
				"ZTJ_G4_C_GLHIERResults('V2.36.35.32_1.2.4.0.1.2.3.0.1.2.1.1%3A0.17.0.0.X.0_IEQCACNIEQ001000002000000502%3AREST_H_0FJGH0WOQW9T6CER4KYVCNV8EKS4JOWL')",
				"Correct node at index 15 (level 1)");
			done();
		}
		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 20, 100);
	});

	QUnit.test("Correct binding length after expand node to level (ENtL07)", function(assert) {
		var done = assert.async();
		createTreeBinding("/ZTJ_G4_C_GLHIER(P_CHARTOFACCOUNTS='CACN',P_FINANCIALSTATEMENTVARIANT='ENtL07')/Results", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 0
		});

		function handler1() {
			oBinding.detachChange(handler1);
			oBinding.getContexts(0, 20, 100);
			oBinding.expandNodeToLevel(0, 4).then(handler2);
		}

		function handler2() {
			oBinding.getContexts(0, 20, 100);
			assert.deepEqual(oBinding.getLength(), 37, "Correct binding length");
			done();
		}
		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 20, 100);
	});

	QUnit.test("Expand root node (initial expansion level 0) to level 4 *twice* (ENtL08)", function(assert) {
		var done = assert.async();
		createTreeBinding("/ZTJ_G4_C_GLHIER(P_CHARTOFACCOUNTS='CACN',P_FINANCIALSTATEMENTVARIANT='ENtL08')/Results", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 0
		});

		function handler1() {
			oBinding.detachChange(handler1);
			oBinding.getContexts(0, 20, 100);
			oBinding.expandNodeToLevel(0, 4).then(handler2);
		}

		function handler2() {
			oBinding.getContexts(0, 20, 100);
			oBinding.expandNodeToLevel(0, 4).then(handler3); // Must not throw
		}

		function handler3() {
			oBinding.getContexts(0, 20, 100);
			assert.ok(!!oBinding.findNode(6), "Found a node at index 6");
			assert.deepEqual(oBinding.findNode(6).key,
				"ZTJ_G4_C_GLHIERResults('V2.36.34.32_1.2.4.0.1.2.3.0.1.2.1.1%3A0.16.0.0.X.0_IEQCACNIEQ00100000%3ACACNY0000000000_06Q88TZJOAW65DRWR6OHRU9QAX2H39PM')",
				"Correct node at index 6 (level 2)");
			assert.ok(!!oBinding.findNode(16), "Found a node at index 16");
			assert.deepEqual(oBinding.findNode(16).key,
				"ZTJ_G4_C_GLHIERResults('V2.36.34.32_1.2.4.0.1.2.3.0.1.2.1.1%3A0.16.0.0.X.0_IEQCACNIEQ00100000%3ACACN%200000000010_06Q88TZJOAW65DRWR6OHRU9QAX2H39PM')",
				"Correct node at index 16 (level 4)");
			done();
		}
		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 20, 100);
	});

	QUnit.test("Expand root node (initial expansion level 2) to level 4 after it has been manually collapsed (ENtL09)", function(assert) {
		var done = assert.async();
		createTreeBinding("/ZTJ_G4_C_GLHIER(P_CHARTOFACCOUNTS='CACN',P_FINANCIALSTATEMENTVARIANT='ENtL09')/Results", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		function handler1() {
			oBinding.detachChange(handler1);
			oBinding.getContexts(0, 20, 100);
			oBinding.attachChange(handler2);
			oBinding.collapse(0);
		}

		function handler2() {
			oBinding.detachChange(handler2);
			oBinding.getContexts(0, 20, 100);
			oBinding.expandNodeToLevel(0, 4).then(handler3);
		}

		function handler3() {
			oBinding.getContexts(0, 20, 100);
			assert.deepEqual(oBinding.findNode(0).nodeState.expanded, true, "Root node is expanded");
			assert.ok(!!oBinding.findNode(6), "Found a node at index 6");
			assert.deepEqual(oBinding.findNode(6).key,
				"ZTJ_G4_C_GLHIERResults('V2.36.34.32_1.2.4.0.1.2.3.0.1.2.1.1%3A0.16.0.0.X.0_IEQCACNIEQ00100000%3ACACNY0000000000_0SUTU1Z8RLLDHJYDDY9JI1C15PXF8WA1')",
				"Correct node at index 6 (level 2)");
			assert.ok(!!oBinding.findNode(16), "Found a node at index 16");
			assert.deepEqual(oBinding.findNode(16).key,
				"ZTJ_G4_C_GLHIERResults('V2.36.34.32_1.2.4.0.1.2.3.0.1.2.1.1%3A0.16.0.0.X.0_IEQCACNIEQ00100000%3ACACN%200000000010_06Q88TZJOAW65DRWR6OHRU9QAX2H39PM')",
				"Correct node at index 16 (level 4)");
			done();
		}
		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 20, 100);
	});

	QUnit.test("Expand deep node to level 4 after it has been manually expanded (ENtL10)", function(assert) {
		var done = assert.async();
		createTreeBinding("/ZTJ_G4_C_GLHIER(P_CHARTOFACCOUNTS='CACN',P_FINANCIALSTATEMENTVARIANT='ENtL10')/Results", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 0
		});

		function handler1() {
			oBinding.detachChange(handler1);
			oBinding.getContexts(0, 20, 100);
			oBinding.attachChange(handler2);
			oBinding.expand(0, true);
		}

		function handler2() {
			oBinding.detachChange(handler2);
			oBinding.getContexts(0, 20, 100);
			oBinding.attachChange(handler3);
			oBinding.expand(7, true);
		}

		function handler3() {
			oBinding.detachChange(handler3);
			oBinding.getContexts(0, 20, 100);
			oBinding.expandNodeToLevel(7, 4).then(handler4);
		}

		function handler4() {
			oBinding.getContexts(30, 20, 100); // Page to end of subtree
			assert.ok(!!oBinding.findNode(47), "Found a node at index 47");
			assert.deepEqual(oBinding.findNode(47).key,
				"ZTJ_G4_C_GLHIERResults('V2.36.34.32_1.2.4.0.1.2.3.0.1.2.1.1%3A0.16.0.0.X.0_IEQCACNIEQ00100000%3ACACNY0000000000_0JF3PI8EYUQWUJJDOOYJV5DO616YD7AY')",
				"Correct node at index 47 (level 3)");
			assert.ok(!!oBinding.findNode(48), "Found a node at index 48");
			assert.deepEqual(oBinding.findNode(48).key,
				"ZTJ_G4_C_GLHIERResults('V2.36.29.32_1.2.4.0.1.2.3.0.1.2.1.1%3A0.11.0.0.X.0_IEQCACNIEQ0010000052372%3A001%207_0OJCITXAIZ2D0WHVA468ROFWBKT4YWA6')",
				"Correct node at index 48 (level 1)");
			done();
		}
		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 20, 100);
	});

	QUnit.test("Expand level two node (initial expansion level 2) to level 4, expand root ndoe to level 4 (ENtL11)", function(assert) {
		var done = assert.async();
		createTreeBinding("/ZTJ_G4_C_GLHIER(P_CHARTOFACCOUNTS='CACN',P_FINANCIALSTATEMENTVARIANT='ENtL11')/Results", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		function handler1() {
			oBinding.detachChange(handler1);
			oBinding.getContexts(0, 20, 100);
			oBinding.expandNodeToLevel(7, 4).then(handler2);
		}

		function handler2() {
			oBinding.getContexts(0, 20, 100);
			oBinding.expandNodeToLevel(0, 4).then(handler3);
		}

		function handler3() {
			oBinding.getContexts(30, 20, 100); // Page to end of subtree
			assert.ok(!!oBinding.findNode(59), "Found a node at index 59");
			assert.deepEqual(oBinding.findNode(59).parent.key,
				"ZTJ_G4_C_GLHIERResults('V2.36.30.32_1.2.4.0.1.2.3.0.1.2.1.1%3A0.12.0.0.X.0_IEQCACNIEQ0010000052372%3A001%20A5_06Q88TZJOAW65DRWR6OHRU9QAX2H39PM')",
				"Correct node at index 59 (level 4)");
			assert.ok(!!oBinding.findNode(62), "Found a node at index 62");
			assert.deepEqual(oBinding.findNode(62).key,
				"ZTJ_G4_C_GLHIERResults('V2.36.35.32_1.2.4.0.1.2.3.0.1.2.1.1%3A0.17.0.0.X.0_IEQCACNIEQ001000002000000502%3AREST_H_0SUTU1Z8RLLDHJYDDY9JI1C15PXF8WA1')",
				"Correct node at index 62 (level 0)");
			done();
		}
		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 20, 100);
	});

	QUnit.test("Expand root node (initial expansion level 0) to level 4, collapse deep node and expand deep node to level 4 (ENtL12)", function(assert) {
		var done = assert.async();
		createTreeBinding("/ZTJ_G4_C_GLHIER(P_CHARTOFACCOUNTS='CACN',P_FINANCIALSTATEMENTVARIANT='ENtL12')/Results", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 0
		});

		function handler1() {
			oBinding.detachChange(handler1);
			oBinding.getContexts(0, 20, 100);
			oBinding.expandNodeToLevel(0, 4).then(handler2);
		}

		function handler2() {
			oBinding.getContexts(0, 20, 100);
			oBinding.attachChange(handler3);
			oBinding.collapse(15);
		}

		function handler3() {
			oBinding.detachChange(handler3);
			oBinding.getContexts(0, 20, 100);
			oBinding.expandNodeToLevel(15, 4).then(handler4);
		}

		function handler4() {
			oBinding.getContexts(0, 20, 100);
			assert.ok(!!oBinding.findNode(16), "Found a node at index 16");
			assert.deepEqual(oBinding.findNode(16).key,
				"ZTJ_G4_C_GLHIERResults('V2.36.34.32_1.2.4.0.1.2.3.0.1.2.1.1%3A0.16.0.0.X.0_IEQCACNIEQ00100000%3ACACN%200000000010_06Q88TZJOAW65DRWR6OHRU9QAX2H39PM')",
				"Correct node at index 16 on level 4");
			done();
		}
		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 20, 100);
	});

	QUnit.test("Expand root node (initial expansion level 0) to level 4, collapse deep node and expand deep node to level 4 (ENtL13)", function(assert) {
		var done = assert.async();
		createTreeBinding("/ZTJ_G4_C_GLHIER(P_CHARTOFACCOUNTS='CACN',P_FINANCIALSTATEMENTVARIANT='ENtL13')/Results", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 0
		});

		function handler1() {
			oBinding.detachChange(handler1);
			oBinding.getContexts(0, 20, 100);
			oBinding.attachChange(handler2);
			oBinding.expand(0, true);
		}

		function handler2() {
			oBinding.detachChange(handler2);
			oBinding.getContexts(0, 20, 100);
			oBinding.attachChange(handler3);
			oBinding.collapse(0);
		}

		function handler3() {
			oBinding.detachChange(handler3);
			oBinding.getContexts(0, 20, 100);
			oBinding.expandNodeToLevel(0, 4).then(handler4);
		}

		function handler4() {
			oBinding.detachChange(handler4);
			oBinding.getContexts(0, 20, 100);
			oBinding.setSelectedIndex(0);
			assert.deepEqual(oBinding.getSelectedIndex(), 0, "Correct selected index for root node");
			done();
		}

		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 20, 100);
	});

});