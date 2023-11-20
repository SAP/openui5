/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/odata/ODataTreeBindingAdapter",
	"sap/ui/core/util/MockServer",
	"sap/ui/model/Sorter"
], function(ODataModel, ODataTreeBindingAdapter, MockServer, Sorter) {
	"use strict";

	var sURLPrefix = sap.ui.require.toUrl("sap/ui/core/qunit");

	//Initialize mock servers
	//Mock server for use with navigation properties
	var oNavPropMockServer = new MockServer({
		rootUri: "/navprop/"
	});
	oNavPropMockServer.simulate(sURLPrefix + "/model/metadata_odtb.xml", sURLPrefix + "/model/odtb/");

	//MockServer for use with annotated tree
	var oAnnotationMockServer = new MockServer({
		rootUri: "/metadata/"
	});
	oAnnotationMockServer.simulate(sURLPrefix + "/model/metadata_odtbmd.xml", sURLPrefix + "/model/odtbmd/");

	/**
	 * Clean-Up Hierarchy Annotation Mockdata/Metadata
	 * This is necessary because, the V1 ODataTreeBinding implements routines not conform to the Hierarchy Annotation Spec.
	 */
	var aAnnotationsMockdata = oAnnotationMockServer._oMockdata.GLAccountHierarchyInChartOfAccountsLiSet;
	for (var i = 0; i < aAnnotationsMockdata.length; i++) {
		//convert string based level properties (NUMC fields) to real numbers
		aAnnotationsMockdata[i].FinStatementHierarchyLevelVal = parseInt(aAnnotationsMockdata[i].FinStatementHierarchyLevelVal);
	}

	var oModel, oBinding;

	function createTreeBindingAdapter(sPath, oContext, aFilters, mParameters) {
		// create binding
		oBinding = oModel.bindTree(sPath, oContext, aFilters, mParameters).initialize();
		//applying the odata tree binding adapter to the binding
		ODataTreeBindingAdapter.apply(oBinding);
	}

	QUnit.module("ODataTreeBindingAdapter with navigation properties", {
		beforeEach: function() {
			oNavPropMockServer.start();
			oModel = new ODataModel("/navprop/", {useBatch: true});
		},
		afterEach: function() {
			oNavPropMockServer.stop();
		}
	});

	QUnit.test("Properties", function(assert) {
		createTreeBindingAdapter("/Employees(2)", null, [], {
			navigation: {}
		});
		assert.equal(oBinding.getPath(), "/Employees(2)", "TreeBinding path");
		assert.equal(oBinding.getModel(), oModel, "TreeBinding model");
		assert.ok(oBinding.isA("sap.ui.model.odata.v2.ODataTreeBinding"), "treeBinding class check");
	});

	QUnit.test("getRootContexts getNodeContexts", function(assert) {
		var done = assert.async();
		oModel.metadataLoaded().then(function() {
			createTreeBindingAdapter("/Employees(2)", null, [], {
				navigation: {
					Employees: "Employees1",
					Employees1: "Employees1"
				},
				displayRootNode: false
			});

			var oContext;

			var handler1 = function(oEvent) {
				// contexts should be now loaded
				var aContexts = oBinding.getContexts(0, 5);

				assert.equal(aContexts.length, 5, "TreeBinding rootContexts length");

				oContext = aContexts[0];
				assert.equal(oModel.getProperty("FirstName", oContext), "Nancy", "TreeBinding root content");
				assert.equal(oModel.getProperty("LastName", oContext), "Davolio", "TreeBinding root content");

				oContext = aContexts[1];
				assert.equal(oModel.getProperty("FirstName", oContext), "Janet", "TreeBinding root content");
				assert.equal(oModel.getProperty("LastName", oContext), "Leverling", "TreeBinding root content");

				oContext = aContexts[2];
				assert.equal(oModel.getProperty("FirstName", oContext), "Margaret", "TreeBinding root content");
				assert.equal(oModel.getProperty("LastName", oContext), "Peacock", "TreeBinding root content");

				oContext = aContexts[3];
				assert.equal(oModel.getProperty("FirstName", oContext), "Steven", "TreeBinding root content");
				assert.equal(oModel.getProperty("LastName", oContext), "Buchanan", "TreeBinding root content");

				oContext = aContexts[4];
				assert.equal(oModel.getProperty("FirstName", oContext), "Laura", "TreeBinding root content");
				assert.equal(oModel.getProperty("LastName", oContext), "Callahan", "TreeBinding root content");

				oBinding.detachChange(handler1);

				var expandHandler = function() {
					oBinding.detachChange(expandHandler);
					oBinding.attachChange(handler2);
					oBinding.getContexts(0, 10);
				};
				oBinding.attachChange(expandHandler);
				oBinding.expand(3);

			};

			var handler2 = function(oEvent) {
				oBinding.detachChange(handler2);
				// contexts should be now loaded
				var aContexts = oBinding.getContexts(0, 10);

				var oContext = oBinding.getContextByIndex(3);
				assert.equal(aContexts.length, 8, "TreeBinding nodeContexts length is 8");
				assert.equal(oBinding.getChildCount(oContext), 3, "TreeBinding childcount");

				oContext = oBinding.getContextByIndex(4);
				assert.equal(oModel.getProperty("FirstName", oContext), "Michael", "TreeBinding node content");
				assert.equal(oModel.getProperty("LastName", oContext), "Suyama", "TreeBinding node content");

				oContext = oBinding.getContextByIndex(5);
				assert.equal(oModel.getProperty("FirstName", oContext), "Robert", "TreeBinding node content");
				assert.equal(oModel.getProperty("LastName", oContext), "King", "TreeBinding node content");

				oContext = oBinding.getContextByIndex(6);
				assert.equal(oModel.getProperty("FirstName", oContext), "Anne", "TreeBinding node content");
				assert.equal(oModel.getProperty("LastName", oContext), "Dodsworth", "TreeBinding node content");

				done();
			};

			oBinding.attachChange(handler1);
			oBinding.getContexts(0, 10);
		});
	});

	QUnit.test("Display root node", function(assert) {
		var done = assert.async();
		oModel.metadataLoaded().then(function() {
			createTreeBindingAdapter("/Employees(2)", null, [], {
				navigation: {
					Employees: "Employees1",
					Employees1: "Employees1"
				},
				displayRootNode: true
			});

			var oContext;

			var handler1 = function(oEvent) {
				oBinding.detachChange(handler1);

				// contexts should be now loaded
				var aContexts = oBinding.getContexts(0, 10);

				assert.equal(aContexts.length, 1, "# of root contexts = 1");

				oContext = aContexts[0];
				assert.equal(oModel.getProperty("FirstName", oContext), "Andrew", "Root context values are correct");
				assert.equal(oModel.getProperty("LastName", oContext), "Fuller", "Root context values are correct");

				function fnExpandHandler() {
					oBinding.detachChange(fnExpandHandler);

					//rebuild tree
					oBinding.attachChange(fnChangeHandlerAfterExpand);
					oBinding.getContexts(0, 10);
				}

				function fnChangeHandlerAfterExpand() {
					aContexts = oBinding.getContexts(0, 10);

					assert.equal(aContexts.length, 6, "Length of returned contexts should be 6");

					oContext = aContexts[0];
					assert.equal(oModel.getProperty("FirstName", oContext), "Andrew", "Root context values are correct");

					oContext = aContexts[1];
					assert.equal(oModel.getProperty("FirstName", oContext), "Nancy", "[1] is correct");

					oContext = aContexts[2];
					assert.equal(oModel.getProperty("FirstName", oContext), "Janet", "[2] is correct");

					oContext = aContexts[3];
					assert.equal(oModel.getProperty("FirstName", oContext), "Margaret", "[3] is correct");

					oContext = aContexts[4];
					assert.equal(oModel.getProperty("FirstName", oContext), "Steven", "[4] is correct");

					oContext = aContexts[5];
					assert.equal(oModel.getProperty("FirstName", oContext), "Laura", "[5] is correct");

					done();
				}

				oBinding.attachChange(fnExpandHandler);
				oBinding.expand(0);

			};

			oBinding.attachChange(handler1);
			oBinding.getContexts(0, 10);
		});
	});

	QUnit.test("Number of expanded levels", function(assert) {
		var done = assert.async();
		oModel.metadataLoaded().then(function() {
			createTreeBindingAdapter("/Employees(2)", null, [], {
				navigation: {
					Employees: "Employees1",
					Employees1: "Employees1"
				},
				displayRootNode: true,
				numberOfExpandedLevels: 2
			});

			function fnChangeHandler1(oEvent) {
				oBinding.detachChange(fnChangeHandler1);
				oBinding.attachChange(fnChangeHandler2);
				oBinding.getContexts(0, 10);
			}

			function fnChangeHandler2() {
				oBinding.detachChange(fnChangeHandler2);
				oBinding.attachChange(fnChangeHandler3);
				oBinding.getContexts(0, 10);
			}

			function fnChangeHandler3() {
				oBinding.detachChange(fnChangeHandler3);

				var aContexts = oBinding.getContexts(0, 10);

				var oContext;

				assert.equal(aContexts.length, 9, "# of contexts after autoExpand = 2 should be 9");

				oContext = aContexts[0];
				assert.equal(oModel.getProperty("FirstName", oContext), "Andrew", "First node is correct");

				//Steven should be there and expanded
				oContext = oBinding.getContextByIndex(4);
				assert.equal(oModel.getProperty("FirstName", oContext), "Steven", "Hello Steven");
				assert.equal(oBinding.isExpanded(4), true, "Steven is expanded");
				assert.equal(oBinding.getChildCount(oContext), 3, "Steven has 3 children");

				// children of steven check
				oContext = oBinding.getContextByIndex(7);
				var oNode = oBinding.findNode(7);
				assert.equal(oModel.getProperty("FirstName", oContext), "Anne", "Hello Anne");
				assert.equal(oNode.level, 2, "Anne sits on level 2");

				// children of laura check
				oContext = oBinding.getContextByIndex(8);
				oNode = oBinding.findNode(8);
				assert.equal(oModel.getProperty("FirstName", oContext), "Laura", "Hello Laura");
				assert.equal(oNode.level, 1, "Laura sits on level 1");

				done();
			}

			oBinding.attachChange(fnChangeHandler1);
			oBinding.getContexts(0, 10);
		});
	});

	QUnit.test("Bind to Collection", function(assert) {
		var done = assert.async();
		oModel.metadataLoaded().then(function() {
			createTreeBindingAdapter("/Employees", null, [], {
				navigation: {
					Employees: "Employees1",
					Employees1: "Employees1"
				},
				displayRootNode: true
			});

			var oContext;

			var handler1 = function(oEvent) {
				oBinding.detachChange(handler1);
				// contexts should be now loaded
				var aContexts = oBinding.getContexts(0, 10);

				assert.equal(aContexts.length, 9, "TreeBinding rootContexts length");

				oContext = aContexts[0];
				assert.equal(oModel.getProperty("FirstName", oContext), "Nancy", "Nancy");

				oContext = aContexts[5];
				assert.equal(oModel.getProperty("FirstName", oContext), "Michael", "Michael");

				oContext = aContexts[8];
				assert.equal(oModel.getProperty("FirstName", oContext), "Anne", "Anne");

				//oContext = oBinding.getContextByIndex(1);

				//expand andrew
				oBinding.attachChange(handler2);
				oBinding.expand(1);
			};

			function handler2() {
				oBinding.detachChange(handler2);
				oBinding.attachChange(handler3);
				oBinding.getContexts(0, 10);
			}

			function handler3() {
				oBinding.detachChange(handler3);

				var aContexts = oBinding.getContexts(0, 10);

				assert.equal(aContexts.length, 10, "Requested 10 results, even though more data is there");
				assert.equal(oBinding.getLength(), 14, "Expected Binding length of 14 is correct");

				//check if Janet is now "visible"
				var oContextJanet1 = oBinding.getContextByIndex(3);
				assert.equal(oModel.getProperty("FirstName", oContextJanet1), "Janet", "Janet is at position 3");

				//duplicate node, also Janet
				var oContextJanet2 = oBinding.getContextByIndex(7);
				assert.equal(oModel.getProperty("FirstName", oContextJanet2), "Janet", "Janet is also at position 7");

				//check if the contexts are the same
				assert.deepEqual(oContextJanet1, oContextJanet2, "Janets contexts are the same");

				//nodes however should have different node ids
				assert.notEqual(oBinding.findNode(3).groupID, oBinding.findNode(7).groupID, "Janets groupIDs are different");

				done();
			}

			oBinding.attachChange(handler1);
			oBinding.getContexts(0, 10);
		});
	});

	QUnit.test("Refresh", function(assert) {
		var done = assert.async();
		oModel.metadataLoaded().then(function() {
			createTreeBindingAdapter("/Employees(2)", null, [], {
				navigation: {
					Employees: "Employees1",
					Employees1: "Employees1"
				},

				displayRootNode: true
			});

			function handler1(oEvent) {
				oBinding.detachChange(handler1);

				// contexts should be now loaded
				var aContexts = oBinding.getContexts(0, 10);

				assert.equal(aContexts.length, 1, "10 requested, only 1 returned");

				oBinding.attachChange(handler2);
				oBinding.expand(0); //andrew
			}

			function handler2(oEvent) {
				oBinding.detachChange(handler2);

				oBinding.attachChange(handler3);
				oBinding.getContexts(0, 10); //rebuild tree
			}

			function handler3() {
				oBinding.detachChange(handler3);

				oBinding.getContexts(0, 10); //rebuild tree

				assert.equal(oBinding.oFinalLengths["/Employees(2)/Employees1"], true, "Length is final");

				oBinding.attachChange(handler4);
				oBinding.setSelectedIndex(4); //select steven
				oBinding.expand(4); //expand steven
			}

			function handler4(oEvent) {
				oBinding.detachChange(handler4);

				oBinding.attachChange(handler5);
				oBinding.getContexts(0, 10);
			}

			function handler5() {
				oBinding.detachChange(handler5);

				oBinding.getContexts(0, 10); //rebuild tree

				//collapse steven again
				oBinding.collapse(4);
				oBinding.getContexts(0, 10); //rebuild tree

				assert.ok(oBinding._mTreeState.expanded["/Employees(2)/"], "Andrew is expanded in Expanded Map");
				assert.ok(oBinding._mTreeState.collapsed["/Employees(2)/Employees(5)/"], "Steven is collapsed in Collapsed Map");
				assert.ok(oBinding._mTreeState.selected["/Employees(2)/Employees(5)/"], "Steven is selected in Selected Map");

				assert.equal(oBinding._iPageSize, 10, "Default page size should be 10");

				oBinding.attachRefresh(refreshHandler);
				oBinding.refresh();
			}

			var refreshHandler = function() {
				assert.deepEqual(oBinding._mTreeState.expanded, {}, "Expanded Map is empty");
				assert.deepEqual(oBinding._mTreeState.collapsed, {}, "Collapsed Map is empty");
				assert.deepEqual(oBinding._mTreeState.selected, {}, "Selected Map is empty");

				assert.equal(oBinding._iPageSize, 0, "Default page size reseted");
				assert.equal(oBinding._oRootNode, undefined, "Root node is lost");

				assert.deepEqual(oBinding.oKeys, {}, "Keys object has been reset");
				assert.deepEqual(oBinding.oLengths, {}, "Lengths object has value for root");
				assert.deepEqual(oBinding.oFinalLengths, {}, "FinalLengths object has value for root");
				done();
			};

			oBinding.attachChange(handler1);
			oBinding.getContexts(0, 10);
		});
	});

	/**
	 * Adapter tests with annotations!
	 */
	QUnit.module("ODataTreeBindingAdapter with annotations", {
		beforeEach: function() {
			oAnnotationMockServer.start();
			oModel = new ODataModel("/metadata/", {useBatch: true});
			return oModel.metadataLoaded();
		},
		afterEach: function() {
			oAnnotationMockServer.stop();
		}
	});

	/**
	 * Expands a mock tree to level 3
	 */
	var prebuildTree = function(fnTreeBuiltCallback) {
		createTreeBindingAdapter("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", [], null, {
			displayRootNode: true,
			numberOfExpandedLevels: 2,
			rootLevel: 1
		});
		var handler1 = function(oEvent) {
			oBinding.detachChange(handler1);
			// contexts should be loaded now
			oBinding.attachChange(handler2);
			oBinding.getContexts(0, 100);
		};

		var handler2 = function(oEvent) {
			oBinding.detachChange(handler2);
			oBinding.attachChange(handler3);
			oBinding.getContexts(0, 100);
		};

		var handler3 = function(oEvent) {
			oBinding.detachChange(handler3);
			oBinding.getContexts(0, 100);
			fnTreeBuiltCallback();
		};

		oBinding.attachChange(handler1);
		oBinding.getContexts(0, 100);
	};

	QUnit.test("Properties", function(assert) {
		createTreeBindingAdapter("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", null, [], {
			navigation: {}
		});
		assert.ok(oBinding.findNode, "Check if ODataTreeBinding was enhanced by the Adapter.");
		assert.equal(oBinding.bHasTreeAnnotations, true, "TreeBinding Metadata should be available");
		assert.equal(oBinding.iRootLevel, 0, "Root Level should be 0 by default");
		assert.equal(oBinding.iNumberOfExpandedLevels, 0, "number of expanded levels should be 0 by default");
	});

	QUnit.test("TreeBinding getContexts() calls, facading getRootContexts and getNodeContexts on the TreeBinding", function(assert) {
		var done = assert.async();
		createTreeBindingAdapter("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", null, [], {
			rootLevel: 2
		});

		var oContext;

		var handler1 = function(oEvent) {
			// contexts should be now loaded
			var aContexts = oBinding.getContexts(0, 9);
			assert.equal(aContexts.length, 9, "TreeBinding rootContexts length");

			oContext = aContexts[0];
			assert.strictEqual(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), 2, "Level of 1st child should be 2");
			assert.equal(oModel.getProperty("HierarchyNode", oContext), "000002", "HierarchyNode ID of 1st child should be set correctly");
			assert.equal(oModel.getProperty("ParentNode", oContext), "000001", "ParentNode ID of 1st child should be correct node");

			oContext = aContexts[1];
			assert.equal(oModel.getProperty("HierarchyNode", oContext), "000362", "HierarchyNode ID of 2nd child should be set correctly");

			oContext = aContexts[8];
			assert.equal(oModel.getProperty("HierarchyNode", oContext), "001180", "HierarchyNode ID of last child should be set correctly");

			oBinding.detachChange(handler1);

			done();
		};

		oBinding.attachChange(handler1);
		oBinding.getContexts(0, 9);
	});

	QUnit.test("Display root node, node on level 1 should be there", function(assert) {
		var done = assert.async();
		createTreeBindingAdapter("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", [], null, {
			displayRootNode: true,
			rootLevel: 1
		});

		var oContext;

		var handler1 = function(oEvent) {
			// contexts should be now loaded
			var aContexts = oBinding.getContexts(0, 1);

			assert.equal(aContexts.length, 1, "TreeBinding rootContexts length");

			oContext = aContexts[0];
			assert.strictEqual(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), 1, "1st root child level check");
			assert.equal(oModel.getProperty("HierarchyNode", oContext), "000001", "1st root child HierarchyNode check");

			oBinding.detachChange(handler1);

			var fnExpandChangeHandler = function() {
				oBinding.detachChange(fnExpandChangeHandler);
				oBinding.attachChange(handler2);
				oBinding.getContexts(0, 10);
			};

			oBinding.attachChange(fnExpandChangeHandler);
			oBinding.expand(0);

		};

		var handler2 = function(oEvent) {
			// contexts should be now loaded
			var aContexts = oBinding.getContexts(1, 9);

			assert.equal(aContexts.length, 9, "Check if getContexts returned the expected length for expanded 1st node");
			assert.equal(oBinding.getChildCount(oContext), 9, "ChildCount of expanded 1st node");

			oContext = aContexts[0];
			assert.strictEqual(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), 2, "Level check on 1st child (0.0)");
			assert.equal(oModel.getProperty("HierarchyNode", oContext), "000002", "HierarchyNode check on 1st child (0.0)");
			assert.equal(oModel.getProperty("ParentNode", oContext), "000001", "ParentNode check on 1st child (0.0)");

			oContext = aContexts[1];
			assert.equal(oModel.getProperty("HierarchyNode", oContext), "000362", "HierarchyNode check on 2nd child (0.1)");

			oContext = aContexts[8];
			assert.equal(oModel.getProperty("HierarchyNode", oContext), "001180", "HierarchyNode check on last child (0.8)");

			oBinding.detachChange(handler2);
			done();
		};

		oBinding.attachChange(handler1);
		oBinding.getContexts(0, 1);
	});

	QUnit.test("Pagesize increasing", function(assert) {
		var done = assert.async();
		createTreeBindingAdapter("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", [], null, {
			displayRootNode: true,
			rootLevel: 1
		});

		var oContext;

		var handler1 = function(oEvent) {
			// contexts should be now loaded
			var aContexts = oBinding.getContexts(0, 10);

			assert.equal(aContexts.length, 1, "TreeBinding rootContexts length, 10 requested, only 1 node present");

			assert.equal(oBinding._iPageSize, 10, "PageSize must be 10, since 10 requested by getContexts");

			oContext = aContexts[0];
			assert.strictEqual(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), 1, "1st root child level check");
			assert.equal(oModel.getProperty("HierarchyNode", oContext), "000001", "1st root child HierarchyNode check");

			oBinding.detachChange(handler1);

			var fnExpandChangeHandler = function() {
				oBinding.detachChange(fnExpandChangeHandler);
				oBinding.attachChange(handler2);
				oBinding.getContexts(1, 3);
			};

			oBinding.attachChange(fnExpandChangeHandler);
			oBinding.expand(0);

		};

		var handler2 = function(oEvent) {
			// contexts should be now loaded
			var aContexts = oBinding.getContexts(1, 3);

			assert.equal(oBinding._iPageSize, 10, "PageSize must still be 10, since 10 was requested by getContexts earlier");

			assert.equal(aContexts.length, 3, "Check if getContexts returned the expected length for expanded 1st node");
			assert.equal(oBinding.getChildCount(oContext), 9, "ChildCount of expanded 1st node");

			// row index 4 must be present due to higher page size (10) although not requested by latest getContexts call
			oContext = oBinding.getContextByIndex(4);
			assert.strictEqual(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), 2, "Level check on 1st child (0.0)");
			assert.equal(oModel.getProperty("HierarchyNode", oContext), "001073", "HierarchyNode check on 1st child (0.0)");
			assert.equal(oModel.getProperty("ParentNode", oContext), "000001", "ParentNode check on 1st child (0.0)");

			oBinding.detachChange(handler2);
			done();
		};

		oBinding.attachChange(handler1);
		oBinding.getContexts(0, 10);
	});

	QUnit.test("Pagesize not decreasing", function(assert) {
		var done = assert.async();
		createTreeBindingAdapter("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", [], null, {
			displayRootNode: true,
			rootLevel: 1
		});

		var oContext;

		var handler1 = function(oEvent) {
			// contexts should be now loaded
			var aContexts = oBinding.getContexts(0, 1);

			assert.equal(aContexts.length, 1, "TreeBinding rootContexts length, 10 requested, only 1 node present");

			assert.equal(oBinding._iPageSize, 1, "PageSize must be 1, since 1 requested by getContexts");

			oContext = aContexts[0];
			assert.strictEqual(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), 1, "1st root child level check");
			assert.equal(oModel.getProperty("HierarchyNode", oContext), "000001", "1st root child HierarchyNode check");

			oBinding.detachChange(handler1);

			var fnExpandChangeHandler = function() {
				oBinding.detachChange(fnExpandChangeHandler);
				oBinding.attachChange(handler2);
				oBinding.getContexts(1, 5);
			};

			oBinding.attachChange(fnExpandChangeHandler);
			oBinding.expand(0);

		};

		var handler2 = function(oEvent) {
			// contexts should be now loaded
			var aContexts = oBinding.getContexts(1, 5);

			assert.equal(oBinding._iPageSize, 5,
				"PageSize must now be 5, since 5 was requested by latest getContexts call and is higher than the first getContexts call");

			assert.equal(aContexts.length, 5, "Check if getContexts returned the expected length for expanded 1st node");
			assert.equal(oBinding.getChildCount(oContext), 9, "ChildCount of expanded 1st node");

			oContext = oBinding.getContextByIndex(4);
			assert.strictEqual(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), 2, "Level check on 1st child (0.0)");
			assert.equal(oModel.getProperty("HierarchyNode", oContext), "001073", "HierarchyNode check on 1st child (0.0)");
			assert.equal(oModel.getProperty("ParentNode", oContext), "000001", "ParentNode check on 1st child (0.0)");

			oContext = oBinding.getContextByIndex(6);
			assert.equal(oContext, null, "Context at row index 6 still missing.");

			oBinding.detachChange(handler2);
			done();
		};

		oBinding.attachChange(handler1);
		oBinding.getContexts(0, 1);
	});

	QUnit.test("Sequential expand over 3 levels", function(assert) {
		var done = assert.async();

		createTreeBindingAdapter("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", [], null, {
			displayRootNode: true,
			numberOfExpandedLevels: 2,
			rootLevel: 1
		});

		var handler1 = function(oEvent) {
			oBinding.detachChange(handler1);
			oBinding.attachChange(handler2);

			var aContexts = oBinding.getContexts(0, 1);
			assert.equal(aContexts.length, 1, "TreeBinding rootContexts length is 1, only 1 root loaded");

			//Level 0
			var oContext = aContexts[0];
			assert.strictEqual(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), 1, "Level of root node (0)");
			assert.equal(oModel.getProperty("HierarchyNode", oContext), "000001", "HierarchyNode of root node");
			assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "INT", "Content-Item of root node");
		};

		var handler2 = function(oEvent) {
			oBinding.detachChange(handler2);
			oBinding.attachChange(handler3);

			var aContexts = oBinding.getContexts(1, 9);
			assert.equal(aContexts.length, 9, "TreeBinding nodeContexts length is 9, 9 children of first root node");

			var oContext = aContexts[0];
			assert.strictEqual(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), 2, "Level of first child of root (0.0)");
			assert.equal(oModel.getProperty("HierarchyNode", oContext), "000002", "HierarchyNode of first child of root (0.0)");
			assert.equal(oModel.getProperty("ParentNode", oContext), "000001",
				"ParentNode of first child of root (0.0), should be the root node id");
		};

		var handler3 = function(oEvent) {
			oBinding.detachChange(handler3);

			var aSubContexts = oBinding.getContexts(2, 7);
			assert.equal(aSubContexts.length, 7, "TreeBinding nodeContexts length is 7, 7 children of the first root child");

			var oContext = aSubContexts[0];
			assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), 3, "Grandchild of root (0.0.0)");
			assert.equal(oModel.getProperty("HierarchyNode", oContext), "000003", "HierarchyNode of Grandchild (0.0.0)");
			assert.equal(oModel.getProperty("ParentNode", oContext), "000002", "ParentNode of GrandChild, should be first child of root node");

			// check if the next collected node is a sibling of the first
			// otherwise we would have expanded too far
			oContext = aSubContexts[1];
			assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), 3, "2nd Grandchild of root (0.0.0)");
			assert.equal(oModel.getProperty("HierarchyNode", oContext), "000008", "HierarchyNode of 2nd Grandchild (0.0.1)");
			assert.equal(oModel.getProperty("ParentNode", oContext), "000002",
				"ParentNode of 2nd GrandChild, should be first child of root node");

			done();
		};

		oBinding.attachChange(handler1);
		oBinding.getContexts(0, 20);
	});

	QUnit.test("Manual expand", function(assert) {
		var done = assert.async();

		var oContext;
		createTreeBindingAdapter("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", [], null, {
			rootLevel: 1,
			collapseRecursive: false
		});

		// self (de)registering handler helper
		// used to circumvent double change handlers due to expand/collapse calls
		var createChangeHandler = function(fnCallback) {
			var fn = function() {
				oBinding.detachChange(fn);
				oBinding.attachChange(fnCallback);

				oBinding.getContexts(0, 100);
			};
			return fn;
		};

		//nothing expanded
		var fnChangeHandler1 = function() {
			oBinding.detachChange(fnChangeHandler1);
			oBinding.getContexts(0, 100);
			oBinding.attachChange(createChangeHandler(fnChangeHandler2));

			//expand root node
			oBinding.expand(0);
		};

		// expanded root 0
		var fnChangeHandler2 = function() {
			oBinding.detachChange(fnChangeHandler2);
			oBinding.getContexts(0, 100);

			oContext = oBinding.getContextByIndex(9);
			assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), 2, "Level check for (0.9)");
			assert.equal(oModel.getProperty("HierarchyNode", oContext), "001180", "HierarchyNode check for (0.9)");
			assert.equal(oModel.getProperty("ParentNode", oContext), "000001", "ParentNode check for (0.9)");

			oBinding.attachChange(createChangeHandler(fnChangeHandler3));
			oBinding.expand(9);
		};

		//expanded 0.9
		var fnChangeHandler3 = function() {
			oBinding.detachChange(fnChangeHandler3);
			oBinding.getContexts(0, 100);

			oContext = oBinding.getContextByIndex(10);
			assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), 3, "Level check (0.9.0)");
			assert.equal(oModel.getProperty("HierarchyNode", oContext), "001181", "HierarchyNode check (0.9.0)");
			assert.equal(oModel.getProperty("ParentNode", oContext), "001180", "ParentNode check (0.9.0)");

			oBinding.attachChange(createChangeHandler(fnChangeHandler4));
			oBinding.expand(10);
		};

		//expanded 0.9.1
		var fnChangeHandler4 = function() {
			oBinding.detachChange(fnChangeHandler4);
			oBinding.getContexts(0, 100);

			oContext = oBinding.getContextByIndex(12);
			assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), 4, "Level check (0.9.0.1)");
			assert.equal(oModel.getProperty("HierarchyNode", oContext), "001193", "HierarchyNode check (0.9.0.1)");
			assert.equal(oModel.getProperty("ParentNode", oContext), "001181", "ParentNode check (0.9.0.1)");

			assert.ok(oBinding._mTreeState.expanded["/"], "Artificial Root node should be expanded");
			assert.ok(oBinding._mTreeState.expanded["/000001/"], "1st Level node should be expanded");
			assert.ok(oBinding._mTreeState.expanded["/000001/001180/"], "2nd Level node should be expanded");
			assert.ok(oBinding._mTreeState.expanded["/000001/001180/001181/"], "3rd Level node should be expanded");

			assert.deepEqual(oBinding._mTreeState.collapsed, {}, "No nodes should be collapsed");

			//collapsing to level 2 (no change handler, because we do not load data anymore)
			oBinding.collapseToLevel(2);

			oBinding.getContexts(0, 100); //rebuild the tree, as usual

			assert.ok(oBinding._mTreeState.expanded["/"], "Artificial Root node should be expanded");
			assert.ok(oBinding._mTreeState.expanded["/000001/"], "1st Level node should be expanded");
			assert.ok(oBinding._mTreeState.expanded["/000001/001180/"], "2nd Level node should be expanded");
			assert.ok(!oBinding._mTreeState.expanded["/000001/001180/001181/"], "3rd Level node is NOT in the expanded map");

			assert.ok(oBinding._mTreeState.collapsed["/000001/001180/001181/"], "3rd Level node is now in the collapsed map");

			//finally collapse the whole tree
			oBinding.collapseToLevel(0);
			oBinding.getContexts(0, 100); //rebuild the tree, as usual

			oContext = oBinding.getContextByIndex(0);
			assert.equal(oModel.getProperty("HierarchyNode", oContext), "000001", "HierarchyNode check for root node, everything is still there");
			assert.equal(oBinding.isExpanded(0), false, "Root node is also collapsed now");

			assert.ok(oBinding._mTreeState.expanded["/"], "Artificial Root node should still be expanded");
			assert.ok(!oBinding._mTreeState.expanded["/000001/"], "1st Level node should NOT be expanded");
			//this node is still expanded, because collapseRecursive is set to false
			assert.ok(oBinding._mTreeState.expanded["/000001/001180/"], "2nd Level node should still be expanded (collapseRecursive = false)");

			assert.ok(oBinding._mTreeState.collapsed["/000001/"], "Root node is now in the collapsed map");
			assert.ok(oBinding._mTreeState.collapsed["/000001/001180/001181/"], "3rd Level node is still in the collapsed map");

			// switch on collapseRecursive mode
			oBinding.setCollapseRecursive(true);

			// re-expand the root node and check if the expanded states are still correct
			oBinding.expandToLevel(1);
			assert.deepEqual(oBinding._mTreeState.collapsed, {}, "No nodes should be collapsed now, just before expanding to level X");
			oBinding.getContexts(0, 100); //rebuild the tree, as usual

			assert.equal(oBinding.isExpanded(0), true, "root is expanded again");
			assert.equal(oBinding.isExpanded(8), false, "sibling of the 2nd level node is not expanded");
			assert.equal(oBinding.isExpanded(9), true, "2nd level node is still expanded");
			assert.equal(oBinding.isExpanded(10), false, "3nd level node is not expanded");

			//collapse all again, this time recursive
			oBinding.collapseToLevel(0);

			//expand again
			oBinding.expandToLevel(1);

			oBinding.getContexts(0, 100); //rebuild the tree, as usual

			assert.ok(oBinding._mTreeState.expanded["/"], "Artificial Root node should still be expanded");
			assert.ok(oBinding._mTreeState.expanded["/000001/"], "1st Level node should be expanded again");
			//this node is still expanded, because collapseRecursive is set to false
			assert.ok(!oBinding._mTreeState.expanded["/000001/001180/"], "2nd Level node should NOT be expanded (collapseRecursive = true)");

			oBinding.attachChange(fnChangeHandler5);
			oBinding.expand(1);
		};

		// check for correct change reasons in event
		var fnChangeHandler5 = function(oEvent) {
			oBinding.detachChange(fnChangeHandler5);
			assert.equal(oEvent.getParameter("reason"), "expand", "Change Reason expand is set");
			oBinding.attachChange(fnChangeHandler6);
			oBinding.collapse(1);
		};

		var fnChangeHandler6 = function(oEvent) {
			oBinding.detachChange(fnChangeHandler6);
			assert.equal(oEvent.getParameter("reason"), "collapse", "Change Reason expand is set");
			done();
		};

		oBinding.attachChange(fnChangeHandler1);
		oBinding.getContexts(0, 100);

	});

	/**
	 * To keep this test simple, we omit the change handler called after each collapse() or expand() call
	 * Data should already be present, since prebuildTree already requested a big set
	 */
	QUnit.test("Collapse in auto expand", function(assert) {
		var done = assert.async();
		prebuildTree(function() {
			var oContext;

			var changeHandlerSpy = sinon.spy(oBinding, "_fireChange");

			//activate the recursive collapsing
			oBinding.setCollapseRecursive(true);

			// 2nd row
			oContext = oBinding.getContextByIndex(2);
			assert.equal(oContext.getProperty("HierarchyNode"), "000003", "2nd row is correct");

			//3rd row
			oContext = oBinding.getContextByIndex(3);
			assert.equal(oContext.getProperty("HierarchyNode"), "000008", "3rdd row is correct");

			//nothing should happen, node is already collapsed
			oBinding.collapse(2);

			//retrigger tree building after collapse
			oBinding.getContexts(0, 100);

			//recheck 2nd row
			oContext = oBinding.getContextByIndex(2);
			assert.equal(oContext.getProperty("HierarchyNode"), "000003", "2nd row did not change");

			//recheck 3rd row
			oContext = oBinding.getContextByIndex(3);
			assert.equal(oContext.getProperty("HierarchyNode"), "000008", "3rdd row did not change");

			//collapse 2nd row
			oBinding.collapse(1);

			//rebuild the tree
			oBinding.getContexts(0, 100);

			//check 1st row, should now be a collapsed node
			oContext = oBinding.getContextByIndex(1);
			assert.equal(oContext.getProperty("HierarchyNode"), "000002", "1st row is still correct");
			assert.equal(oBinding.isExpanded(1), false, "1st row is collapsed");

			//recheck 2nd row, should now have changed
			oContext = oBinding.getContextByIndex(2);
			assert.equal(oContext.getProperty("HierarchyNode"), "000362", "2nd row changed after collapsing");
			assert.equal(oBinding.isExpanded(2), true, "node on 2nd row is still expanded");

			//collapse top level node
			oBinding.collapse(0);
			oBinding.getContexts(0, 100);

			//check top level node
			oContext = oBinding.getContextByIndex(0);
			assert.equal(oContext.getProperty("HierarchyNode"), "000001", "0th row did not changed after collapsing");
			assert.equal(oBinding.isExpanded(0), false, "node on 0th row is now collapsed");

			//1st row should now be missing (only one root node)
			oContext = oBinding.getContextByIndex(1);
			assert.equal(oContext, null, "1st row does not exist anymore");

			//expand top level node again
			oBinding.expand(0);
			oBinding.getContexts(0, 100);

			//top level root node should be expanded
			oBinding.getContextByIndex(0);
			assert.equal(oBinding.isExpanded(0), true, "node on 0th row is now expanded (again)");

			//check for recursive collapsing
			oContext = oBinding.getContextByIndex(1);
			assert.equal(oBinding.isExpanded(1), false, "2nd row/first root child is still collapsed");
			assert.equal(oContext.getProperty("HierarchyNode"), "000002", "1st row is still the correct node");

			oContext = oBinding.getContextByIndex(2);
			assert.equal(oBinding.isExpanded(2), false, "3nd row/second root child is now also collapsed");
			assert.equal(oContext.getProperty("HierarchyNode"), "000362", "2nd row is still the correct node");

			//check for shifted nodes, the 3rd row should be on level 2, since the 2nd row is not collapsed anymore
			oContext = oBinding.getContextByIndex(3);
			assert.equal(oContext.getProperty("HierarchyNode"), "000682", "3nd row is still the correct node");

			assert.equal(changeHandlerSpy.callCount, 4, "Change event fired correctly");

			done();
		});
	});

	QUnit.test("Top-Level Paging", function(assert) {
		var done = assert.async();
		var oContext;
		createTreeBindingAdapter("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", null, null, {
			rootLevel: 2
		});

		var handler1 = function(oEvent) {
			// contexts should be now loaded
			var aContexts = oBinding.getContexts(1, 4);

			assert.equal(aContexts.length, 4, "getContexts(1, 4) returned 4 contexts");

			oContext = oBinding.getContextByIndex(0);
			assert.equal(oContext, null, "Context for row index 0 must be null, it was not loaded yet.");

			oContext = oBinding.getContextByIndex(1);
			assert.strictEqual(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), 2, "Level Check for 1st returned context");
			assert.equal(oModel.getProperty("HierarchyNode", oContext), "000362", "HierarchyNode Check for 1st returned context");
			assert.equal(oModel.getProperty("ParentNode", oContext), "000001", "ParentNode Check for 1st returned context");

			assert.deepEqual(oContext, aContexts[0], "First returned context is the same as the one returned by getContextByIndex(1)");

			oContext = oBinding.getContextByIndex(2);
			assert.equal(oModel.getProperty("HierarchyNode", oContext), "000682", "TreeBinding node content");

			oContext = oBinding.getContextByIndex(3);
			assert.equal(oModel.getProperty("HierarchyNode", oContext), "001073", "TreeBinding node content");

			oContext = oBinding.getContextByIndex(4);
			assert.equal(oModel.getProperty("HierarchyNode", oContext), "001131", "TreeBinding node content");

			oBinding.detachChange(handler1);

			oBinding.attachChange(handler2);
			oBinding.getContexts(5, 3);
		};

		var handler2 = function(oEvent) {
			// contexts should be now loaded
			var aContexts = oBinding.getContexts(5, 3);

			assert.equal(aContexts.length, 3, "getContexts(5, 3) returned 3 contexts");

			oContext = oBinding.getContextByIndex(1);
			assert.equal(oModel.getProperty("HierarchyNode", oContext), "000362", "Context for index 1 should still be the same after paging");

			assert.notDeepEqual(oContext, aContexts[0], "getContextByIndex(1) returns a different context than getContexts(5, 3)[0]");

			//first context
			oContext = oBinding.getContextByIndex(5);
			assert.deepEqual(oContext, aContexts[0], "getContextByIndex(1) returns the same context as getContexts(5, 3)[0]");
			assert.strictEqual(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), 2, "TreeBinding node content");
			assert.equal(oModel.getProperty("HierarchyNode", oContext), "001136", "TreeBinding node content");
			assert.equal(oModel.getProperty("ParentNode", oContext), "000001", "TreeBinding node content");

			//second context
			oContext = oBinding.getContextByIndex(6);
			assert.deepEqual(oContext, aContexts[1], "getContextByIndex(6) returns the same context as getContexts(5, 3)[1]");
			assert.equal(oModel.getProperty("HierarchyNode", oContext), "001153", "TreeBinding node content");

			//last context
			oContext = oBinding.getContextByIndex(7);
			assert.deepEqual(oContext, aContexts[2], "getContextByIndex(7) returns the same context as getContexts(5, 3)[3]");
			assert.equal(oModel.getProperty("HierarchyNode", oContext), "001179", "TreeBinding node content");

			// gap at the beginning should still be there
			oContext = oBinding.getContextByIndex(0);
			assert.equal(oContext, null, "Context at row index 0 still missing.");

			// gap at the end should still be there
			oContext = oBinding.getContextByIndex(8);
			assert.equal(oContext, null, "Context at row index 8 still missing.");

			oBinding.detachChange(handler2);
			done();
		};

		oBinding.attachChange(handler1);
		oBinding.getContexts(1, 4);
	});

	/**
	 * To keep this test simple, we omit the change handler called after each collapse() or expand() call
	 * Data should already be present, since prebuildTree already requested a big set
	 */
	QUnit.test("SelectAll, Deselect All", function(assert) {
		var done = assert.async();
		prebuildTree(function() {
			// all selection deeper than level 1 should be deselected
			oBinding.collapseToLevel(1);
			oBinding.getContexts(0, 100);

			var fnSelectionChangeHandler1 = function(oEvent) {
				oBinding.detachSelectionChanged(fnSelectionChangeHandler1);
				assert.equal(oEvent.mParameters.leadIndex, oBinding.getLength() - 1, "Event: leadIndex should be Binding length - 1");
				assert.equal(oEvent.mParameters.oldIndex, -1, "Event: oldIndex should be -1");
				assert.equal(oEvent.mParameters.rowIndices.length, 10, "Event: length of changedIndices should be 10");
			};

			var fnSelectionChangeHandler2 = function(oEvent) {
				oBinding.detachSelectionChanged(fnSelectionChangeHandler2);
				assert.equal(oEvent.mParameters.leadIndex, -1, "Event: leadIndex should be - 1");
				assert.equal(oEvent.mParameters.oldIndex, oBinding.getLength() - 1, "Event: oldIndex should be Binding length -1");
				assert.equal(oEvent.mParameters.rowIndices.length, 10, "Event: length of changedIndices should be 10");
			};

			oBinding.attachSelectionChanged(fnSelectionChangeHandler1);
			oBinding.selectAll();

			var aSelectedIndices = oBinding.getSelectedIndices();
			// number of nodes on Level 1 and 2 --> 10
			assert.equal(aSelectedIndices.length, 10, "Number of selected Nodes after collapsing to level 1 must be 10");

			// check that selectAllMode is removed
			assert.equal(oBinding._oRootNode.nodeState.selectAllMode, true, "After selectAll, selectAllMode of root node is true");

			var aSelectedContexts = oBinding.getSelectedContexts();
			assert.equal(aSelectedIndices.length, aSelectedContexts.length, "Number of selected contexts and indeces must be the same");

			var oContext = aSelectedContexts[1];
			assert.equal(oContext.getProperty("HierarchyNode"), "000002", "Number of selected contexts and indeces must be the same");

			var iLeadIndex = oBinding.getSelectedIndex();
			assert.equal(iLeadIndex, oBinding.getLength() - 1, "LeadIndex must be last node/context of the known/paged tree in SelectAll case");

			oBinding.attachSelectionChanged(fnSelectionChangeHandler2);
			oBinding.clearSelection();
			aSelectedIndices = oBinding.getSelectedIndices();
			assert.equal(aSelectedIndices.length, 0, "There should be no selection after clearSelection");

			// check that selectAllMode is removed
			assert.equal(oBinding._oRootNode.nodeState.selectAllMode, false, "After clearSelection, selectAllMode of root node is false");

			iLeadIndex = oBinding.getSelectedIndex();
			assert.equal(iLeadIndex, -1, "LeadIndex must be -1 if there is no selection");

			done();
		});
	});

	QUnit.test("Deselect All after SelectAll with specific isNodeSelectable implementation", function(assert) {
		var done = assert.async();

		prebuildTree(function() {
			sinon.stub(oBinding, "_isNodeSelectable", function(oNode) {
				if (!oNode) {
					return false;
				}
				return oNode.isLeaf && !oNode.isArtificial;
			});

			oBinding.selectAll();
			oBinding.clearSelection();

			var i, iLength = oBinding.getLength();
			// after selection is cleared, all node should leave the selectAllMode
			for (i = 0; i < iLength; i++) {
				assert.ok(!oBinding.getNodeByIndex(i).nodeState.selectAllMode);
			}

			done();
		});
	});

	/**
	 * To keep this test simple, we omit the change handler called after each collapse() or expand() call
	 * Data should already be present, since prebuildTree already requested a big set
	 */
	QUnit.test("getSelectedNodesCount with recursive collapse", function(assert) {
		var done = assert.async();
		prebuildTree(function() {
			oBinding.selectAll();
			assert.equal(oBinding.getSelectedNodesCount(), 56, "Correct selected nodes count after selectAll call");

			oBinding.collapse(1);
			oBinding._buildTree(0, 1);
			assert.equal(oBinding.getSelectedNodesCount(), 49, "Correct selected nodes count after collapse of first first-level node");

			oBinding.expand(1);
			oBinding._buildTree(0, 1);
			assert.equal(oBinding.getSelectedNodesCount(), 49, "Correct selected nodes count after expanding of first first-level node again");
			assert.equal(oBinding.getLength(), 56, "Correct binding length");

			oBinding.removeSelectionInterval(1, 1);
			assert.equal(oBinding.getSelectedNodesCount(), 48,
				"Correct selected nodes count after explicitly deselecting node under a selectAllMode parent");

			done();
		});
	});

	/**
	 * To keep this test simple, we omit the change handler called after each collapse() or expand() call
	 * Data should already be present, since prebuildTree already requested a big set
	 */
	QUnit.test("getSelectedNodesCount without recursive collapse", function(assert) {
		var done = assert.async();
		prebuildTree(function() {
			oBinding.setCollapseRecursive(false);
			oBinding.selectAll();
			assert.equal(oBinding.getSelectedNodesCount(), 56, "Correct selected nodes count after selectAll call");

			oBinding.collapse(1);
			oBinding._buildTree(0, 1);
			assert.equal(oBinding.getSelectedNodesCount(), 49, "Correct selected nodes count after collapse of first first-level node");

			oBinding.expand(1);
			oBinding._buildTree(0, 1);
			assert.equal(oBinding.getSelectedNodesCount(), 56, "Correct selected nodes count after expanding of first first-level node again");
			assert.equal(oBinding.getLength(), 56, "Correct binding length");

			oBinding.removeSelectionInterval(1, 1);
			assert.equal(oBinding.getSelectedNodesCount(), 55,
				"Correct selected nodes count after explicitly deselecting node under a selectAllMode parent");

			done();
		});
	});

	QUnit.test("getSelectedNodesCount expand", function(assert) {
		var done = assert.async();
		createTreeBindingAdapter("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", [], null, {
			displayRootNode: true,
			numberOfExpandedLevels: 0,
			rootLevel: 1
		});

		var handler1 = function() {
			oBinding.detachChange(handler1);
			oBinding.getContexts(0, 100);

			oBinding.selectAll();
			assert.equal(oBinding.getSelectedNodesCount(), 1, "After select all, exactly one node (the only one) is selected");
			assert.equal(oBinding.getLength(), 1, "Correct binding length");

			oBinding.attachChange(handler2);
			oBinding.expand(0);

		};

		var handler2 = function() {
			oBinding.detachChange(handler2);
			oBinding.attachChange(handler3);
			oBinding.getContexts(0, 100);
		};

		var handler3 = function() {
			oBinding.detachChange(handler3);
			oBinding.getContexts(0, 100);
			assert.equal(oBinding.getSelectedNodesCount(), 1, "After expand, no additional nodes get selected");
			assert.equal(oBinding.getLength(), 10, "Correct binding length");

			done();
		};

		oBinding.attachChange(handler1);
		oBinding.getContexts(0, 100);
	});

	QUnit.test("getSelectedNodesCount expand to level", function(assert) {
		var done = assert.async();
		createTreeBindingAdapter("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", [], null, {
			displayRootNode: true,
			numberOfExpandedLevels: 0,
			rootLevel: 1
		});

		var handler1 = function() {
			oBinding.detachChange(handler1);
			oBinding.getContexts(0, 100);

			oBinding.selectAll();
			assert.equal(oBinding.getSelectedNodesCount(), 1, "After select all, exactly one node (the only one) is selected");
			assert.equal(oBinding.getLength(), 1, "Correct binding length");

			oBinding.attachChange(handler2);
			oBinding.setNumberOfExpandedLevels(1);
		};

		var handler2 = function() {
			oBinding.detachChange(handler2);
			oBinding.attachChange(handler3);
			oBinding.getContexts(0, 100);
		};

		var handler3 = function() {
			oBinding.detachChange(handler3);
			oBinding.getContexts(0, 100);
			assert.equal(oBinding.getSelectedNodesCount(), 1, "After expand, no additional nodes get selected");
			assert.equal(oBinding.getLength(), 10, "Correct binding length");

			done();
		};

		oBinding.attachChange(handler1);
		oBinding.getContexts(0, 100);
	});

	QUnit.test("getSelectedNodesCount with paging", function(assert) {
		var done = assert.async();
		createTreeBindingAdapter("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", [], null, {
			displayRootNode: true,
			rootLevel: 4
		});

		var handler1 = function() {
			oBinding.detachChange(handler1);
			oBinding.getContexts(0, 2);

			oBinding.selectAll();
			assert.equal(oBinding.getSelectedNodesCount(), 61, "Correct selected nodes count after selectAll call");
			assert.equal(oBinding.getLength(), 61, "Correct binding length");

			done();
		};

		oBinding.attachChange(handler1);
		oBinding.getContexts(0, 2);
	});
	/**
	 * To keep this test simple, we omit the change handler called after each collapse() or expand() call
	 * Data should already be present, since prebuildTree already requested a big set
	 */
	QUnit.test("Select single nodes", function(assert) {
		var done = assert.async();
		prebuildTree(function() {
			var oContext;
			var aSelectedContexts;

			oBinding.collapseToLevel(1);
			oBinding.getContexts(0, 100);

			var fnSelectionChangeHandler1 = function(oEvent) {
				oBinding.detachSelectionChanged(fnSelectionChangeHandler1);
				assert.equal(oEvent.mParameters.leadIndex, 1, "Event: leadIndex should be 1");
				assert.equal(oEvent.mParameters.oldIndex, -1, "Event: oldIndex should be -1");
				assert.equal(oEvent.mParameters.rowIndices.length, 1, "Event: length of changedIndices should be 1");
				assert.equal(oEvent.mParameters.rowIndices[0], 1, "Event: changedIndices[0] should be 1");
			};

			var fnSelectionChangeHandler2 = function(oEvent) {
				oBinding.detachSelectionChanged(fnSelectionChangeHandler2);
				assert.equal(oEvent.mParameters.leadIndex, 9, "Event: leadIndex should be 9");
				assert.equal(oEvent.mParameters.oldIndex, 1, "Event: oldIndex should be 1");
				assert.equal(oEvent.mParameters.rowIndices.length, 2, "Event: changedIndices should be 2");
				assert.equal(oEvent.mParameters.rowIndices[0], 1, "Event: changedIndices[0] should be 1");
				assert.equal(oEvent.mParameters.rowIndices[0], 1, "Event: changedIndices[1] should be 9");
			};

			var fnSelectionChangeHandler3 = function(oEvent) {
				oBinding.detachSelectionChanged(fnSelectionChangeHandler3);
				assert.equal(oEvent.mParameters.leadIndex, 9, "Event: leadIndex should be 9");
				assert.equal(oEvent.mParameters.oldIndex, 9, "Event: oldIndex should be 9");
				assert.equal(oEvent.mParameters.rowIndices.length, 0, "Event: changedIndices should be undefined");
			};

			oBinding.attachSelectionChanged(fnSelectionChangeHandler1);
			oBinding.setSelectedIndex(1);
			oContext = oBinding.getContextByIndex(oBinding.getSelectedIndex());
			aSelectedContexts = oBinding.getSelectedContexts();
			assert.equal(aSelectedContexts.length, 1, "One node should be selected");
			assert.deepEqual(oContext, aSelectedContexts[0], "Contexts should equal");
			assert.equal(oContext.getProperty("HierarchyNode"), "000002", "Second Node should be selected");

			oBinding.attachSelectionChanged(fnSelectionChangeHandler2);
			oBinding.setSelectedIndex(9);
			oContext = oBinding.getContextByIndex(oBinding.getSelectedIndex());
			aSelectedContexts = oBinding.getSelectedContexts();
			assert.equal(aSelectedContexts.length, 1, "Still only one node should be selected");
			assert.deepEqual(oContext, aSelectedContexts[0], "Contexts should still equal");
			assert.equal(oContext.getProperty("HierarchyNode"), "001180", "Last Node should be selected");

			oBinding.attachSelectionChanged(fnSelectionChangeHandler3);
			oBinding.setSelectedIndex(9);
			oContext = oBinding.getContextByIndex(oBinding.getSelectedIndex());
			aSelectedContexts = oBinding.getSelectedContexts();
			assert.equal(aSelectedContexts.length, 1, "Still only one node should be selected");
			assert.deepEqual(oContext, aSelectedContexts[0], "Contexts should still equal");
			assert.equal(oContext.getProperty("HierarchyNode"), "001180", "Last Node should be selected");

			//select index out of range
			oBinding.setSelectedIndex(300);
			assert.equal(oBinding.getSelectedIndex(), 9, "Selected index is still 9.");

			assert.equal(oBinding._isNodeSelectable(0), false, "Illegal nodes are not selectable.");
			assert.equal(oBinding._isNodeSelectable(null), false, "Illegal nodes are not selectable.");
			assert.equal(oBinding._isNodeSelectable(undefined), false, "Illegal nodes are not selectable.");
			assert.equal(oBinding._isNodeSelectable(""), false, "Illegal nodes are not selectable.");

			done();
		});
	});

	/**
	 * To keep this test simple, we omit the change handler called after each collapse() or expand() call
	 * Data should already be present, since prebuildTree already requested a big set
	 */
	QUnit.test("getSelectedIndex w/ recursive collapse", function(assert) {
		var done = assert.async();
		prebuildTree(function() {
			oBinding.setSelectedIndex(2);
			assert.equal(oBinding.getSelectedIndex(), 2, "Selected index is 2");

			oBinding.collapse(1);
			oBinding._buildTree(0, 1);
			assert.equal(oBinding.getSelectedIndex(), -1, "Selected index could not be found (-1)");

			oBinding.expand(1);
			oBinding._buildTree(0, 1);
			assert.equal(oBinding.getSelectedIndex(), -1,
				"Selected index has not been restored because of recursive collapse mode");
			done();
		});
	});

	/**
	 * To keep this test simple, we omit the change handler called after each collapse() or expand() call
	 * Data should already be present, since prebuildTree already requested a big set
	 */
	QUnit.test("getSelectedIndex w/o recursive collapse", function(assert) {
		var done = assert.async();
		prebuildTree(function() {
			oBinding.setCollapseRecursive(false);
			oBinding.setSelectedIndex(2);
			assert.equal(oBinding.getSelectedIndex(), 2, "Selected index is 2");

			oBinding.collapse(1);
			oBinding._buildTree(0, 1);
			assert.equal(oBinding.getSelectedIndex(), -1, "Selected index could not be found (-1)");

			oBinding.expand(1);
			oBinding._buildTree(0, 1);
			assert.equal(oBinding.getSelectedIndex(), 2, "Selected index 2 has been restored");

			done();
		});
	});

	QUnit.test("Add Selection Interval", function(assert) {
		var done = assert.async();
		prebuildTree(function() {
			oBinding.collapseToLevel(1);
			oBinding.expand(1);
			oBinding.expand(2);
			oBinding.expand(3);
			oBinding.getContexts(0, 100);

			var fnSelectionChangeHandler1 = function(oEvent) {
				oBinding.detachSelectionChanged(fnSelectionChangeHandler1);
				assert.equal(oEvent.mParameters.leadIndex, 10, "Event: leadIndex should be 10");
				assert.equal(oEvent.mParameters.oldIndex, -1, "Event: oldIndex should be -1");
				assert.equal(oEvent.mParameters.rowIndices.length, 8, "Event: length of changedIndices should be 8");
				assert.equal(oEvent.mParameters.rowIndices[0], 3, "Event: first changedIndices[0] should be 3");
				assert.equal(oEvent.mParameters.rowIndices[7], 10, "Event: last changedIndices[7] should be 10");
			};

			var fnSelectionChangeHandler2 = function(oEvent) {
				oBinding.detachSelectionChanged(fnSelectionChangeHandler2);
				assert.equal(oEvent.mParameters.leadIndex, 16, "Event: leadIndex should be 16");
				assert.equal(oEvent.mParameters.oldIndex, 10, "Event: oldIndex should be 10");
				assert.equal(oEvent.mParameters.rowIndices.length, 3, "Event: length of changedIndices should be 3");
				assert.equal(oEvent.mParameters.rowIndices[0], 14, "Event: first changedIndices[0] should be 14");
				assert.equal(oEvent.mParameters.rowIndices[2], 16, "Event: last changedIndices[2] should be 16");
			};

			var fnSelectionChangeHandler3 = function(oEvent) {
				oBinding.detachSelectionChanged(fnSelectionChangeHandler3);
				assert.equal(oEvent.mParameters.leadIndex, 15, "Event: leadIndex should be 15");
				assert.equal(oEvent.mParameters.oldIndex, 16, "Event: oldIndex should be 16");
				assert.equal(oEvent.mParameters.rowIndices.length, 3, "Event: length of changedIndices should be 3");
				assert.equal(oEvent.mParameters.rowIndices[0], 11, "Event: first changedIndices[0] should be 11");
				assert.equal(oEvent.mParameters.rowIndices[2], 13, "Event: last changedIndices[2] should be 13");
			};

			oBinding.attachSelectionChanged(fnSelectionChangeHandler1);
			oBinding.addSelectionInterval(3, 10);

			oBinding.attachSelectionChanged(fnSelectionChangeHandler2);
			oBinding.addSelectionInterval(14, 16);

			var aSelectedIndices = oBinding.getSelectedIndices();
			assert.deepEqual(aSelectedIndices, [3, 4, 5, 6, 7, 8, 9, 10, 14, 15, 16], "Selected indices array is correct");

			oBinding.attachSelectionChanged(fnSelectionChangeHandler3);
			oBinding.addSelectionInterval(9, 15);

			aSelectedIndices = oBinding.getSelectedIndices();
			assert.deepEqual(aSelectedIndices, [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
				"Selected indices array is correct, after selecting additional indices");

			done();
		});
	});

	QUnit.test("Set Selection Interval", function(assert) {
		var done = assert.async();
		prebuildTree(function() {
			oBinding.collapseToLevel(1);
			oBinding.getContexts(0, 100);
			oBinding.expand(3);
			oBinding.expand(2);
			oBinding.expand(1);
			oBinding.getContexts(0, 100);

			var fnSelectionChangeHandler1 = function(oEvent) {
				oBinding.detachSelectionChanged(fnSelectionChangeHandler1);
				assert.equal(oEvent.mParameters.leadIndex, 15, "Event: leadIndex should be 15");
				assert.equal(oEvent.mParameters.oldIndex, 17, "Event: oldIndex should be 17");
				assert.equal(oEvent.mParameters.rowIndices.length, 9, "Event: length of changedIndices should be 9");

				assert.deepEqual(oEvent.mParameters.rowIndices, [3, 4, 8, 9, 10, 11, 12, 16, 17],
					"Changed indices after setSelectionInterval is correct");
			};

			var fnSelectionChangeHandler2 = function(oEvent) {
				oBinding.detachSelectionChanged(fnSelectionChangeHandler2);
				assert.equal(oEvent.mParameters.leadIndex, 0, "Event: leadIndex should be 0");
				assert.equal(oEvent.mParameters.oldIndex, 15, "Event: oldIndex should be 15");
				assert.equal(oEvent.mParameters.rowIndices.length, 12, "Event: length of changedIndices should be 12");

				assert.deepEqual(oEvent.mParameters.rowIndices, [0, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
					"Changed indices after setSelectedIndex is correct");
			};

			oBinding.addSelectionInterval(3, 7);
			oBinding.addSelectionInterval(13, 17);

			var aSelectedIndices = oBinding.getSelectedIndices();
			assert.deepEqual(aSelectedIndices, [3, 4, 5, 6, 7, /*8, 9, 10, 11, 12,*/ 13, 14, 15, 16, 17],
				"Selected indices array is correct, after selecting additional indices");

			oBinding.attachSelectionChanged(fnSelectionChangeHandler1);
			oBinding.setSelectionInterval(5, 15);

			aSelectedIndices = oBinding.getSelectedIndices();
			assert.deepEqual(aSelectedIndices, [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
				"Selected indices array is correct, after setting the selection");

			oBinding.attachSelectionChanged(fnSelectionChangeHandler2);
			oBinding.setSelectedIndex(0);

			assert.equal(oBinding.getSelectedIndex(), 0, "Lead Index is 0");
			aSelectedIndices = oBinding.getSelectedIndices();
			assert.deepEqual(aSelectedIndices, [0], "Selected indices array is correct, only one entry (0)");

			assert.equal(oBinding.findNode(5).selected, undefined, "Index 1 should not be selected anymore.");

			done();
		});
	});

	/**
	 * To keep this test simple, we omit the change handler called after each collapse() or expand() call
	 * Data should already be present, since prebuildTree already requested a big set
	 */
	QUnit.test("selectionChanged event with selectAll", function(assert) {
		assert.expect(3);
		var done = assert.async();
		prebuildTree(function() {
			var fnSelectionChangeHandler1 = function(oEvent) {
				oBinding.detachChange(fnSelectionChangeHandler1);
				assert.equal(oEvent.mParameters.leadIndex, 55, "Event: leadIndex should be 55");
				assert.equal(oEvent.mParameters.oldIndex, -1, "Event: oldIndex should be -1");
				assert.equal(oEvent.mParameters.rowIndices.length, 56, "Event: length of changedIndices should be 56");
				done();
			};

			oBinding.attachSelectionChanged(fnSelectionChangeHandler1);
			oBinding.selectAll();
		});
	});

	/**
	 * To keep this test simple, we omit the change handler called after each collapse() or expand() call
	 * Data should already be present, since prebuildTree already requested a big set
	 */
	QUnit.test("selectionChanged event with collapse", function(assert) {
		assert.expect(4);
		var done = assert.async();
		prebuildTree(function() {
			oBinding.selectAll();

			var fnSelectionChangeHandler1 = function(oEvent) {
				oBinding.detachChange(fnSelectionChangeHandler1);
				assert.equal(oEvent.mParameters.leadIndex, 55, "Event: leadIndex should still be 55");
				assert.equal(oEvent.mParameters.oldIndex, 55, "Event: oldIndex should still be 55");
				assert.equal(oEvent.mParameters.rowIndices.length, 7, "Event: length of changedIndices should be 7");

				assert.deepEqual(oEvent.mParameters.rowIndices, [2, 3, 4, 5, 6, 7, 8], "Changed indices after collapse is correct");
				done();
			};

			oBinding.attachSelectionChanged(fnSelectionChangeHandler1);
			oBinding.collapse(1);
		});
	});

	/**
	 * To keep this test simple, we omit the change handler called after each collapse() or expand() call
	 * Data should already be present, since prebuildTree already requested a big set
	 */
	QUnit.test("selectionChanged event with collapse: deselect of lead selection", function(assert) {
		assert.expect(4);
		var done = assert.async();
		prebuildTree(function() {
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
			oBinding.collapse(1);
		});
	});

	QUnit.test("SelectAll with Paging and Expand", function(assert) {
		var done = assert.async();
		createTreeBindingAdapter("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", null, null, {
			rootLevel: 2
		});

		var fnChangeHandler1 = function(oEvent) {
			oBinding.detachChange(fnChangeHandler1);
			oBinding.getContexts(0, 2);
			oBinding.selectAll();

			oBinding.attachChange(fnChangeHandler2);
			oBinding.getContexts(2, 2); // perform paging
		};

		var fnChangeHandler2 = function(oEvent) {
			oBinding.detachChange(fnChangeHandler2);
			oBinding.getContexts(0, 4);

			var aSelectedIndices = oBinding.getSelectedIndices();
			assert.deepEqual(aSelectedIndices, [0, 1, 2, 3], "Selected indices after paging ok");

			// now expand first node
			oBinding.attachChange(fnChangeHandler3);
			oBinding.expand(0);
		};

		var fnChangeHandler3 = function(oEvent) {
			oBinding.detachChange(fnChangeHandler3);
			oBinding.attachChange(fnChangeHandler4);
			oBinding.getContexts(0, 4);
		};

		var fnChangeHandler4 = function(oEvent) {
			oBinding.detachChange(fnChangeHandler4);
			oBinding.getContexts(0, 4);

			var aSelectedIndices = oBinding.getSelectedIndices();
			assert.deepEqual(aSelectedIndices, [0, 8, 9, 10], "Selected indices after expand ok");

			done();
		};

		oBinding.attachChange(fnChangeHandler1);
		oBinding.getContexts(0, 2);
	});

	QUnit.test("Sorting with stable expand states", function(assert) {
		var done = assert.async();
		createTreeBindingAdapter("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", null, null, {
			rootLevel: 2,
			displayRootNode: false
		});

		//initial load
		function fnChangeHandler1() {
			oBinding.detachChange(fnChangeHandler1);
			oBinding.getContexts(0, 100);

			oBinding.attachChange(fnChangeHandler2);
			oBinding.expand(2);
			oBinding.expand(0);

			//trigger reload
			oBinding.getContexts(0, 100);
		}

		//change after expand
		function fnChangeHandler2(oEvent) {

			if (oEvent.getParameter("reason") === "expand") {
				return;
			}

			oBinding.detachChange(fnChangeHandler2);
			oBinding.getContexts(0, 100);

			oBinding.attachRefresh(fnRefreshHandler);
			//sort descending
			oBinding.sort(new Sorter("HierarchyNode", true));
		}

		//refresh after sort()
		function fnRefreshHandler() {
			oBinding.detachRefresh(fnRefreshHandler);

			assert.ok(oBinding._mTreeState.expanded["/000682/"], "NodeState for 000682 still there.");
			assert.ok(oBinding._mTreeState.expanded["/000002/"], "NodeState for 000002 still there.");
			assert.equal(oBinding._mTreeState.expanded["/000682/"].expanded, true, "Node 000682 is still expanded after sorting.");
			assert.equal(oBinding._mTreeState.expanded["/000002/"].expanded, true, "Node 000002 is still expanded after sorting.");

			done();
		}

		oBinding.attachChange(fnChangeHandler1);
		oBinding.getContexts(0, 100);

	});

	QUnit.test("toggleIndex after multiple getContexts calls (which happens when table has a fixed row)", function(assert) {
		var done = assert.async();
		createTreeBindingAdapter("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", [], null, {
			rootLevel: 1,
			collapseRecursive: false
		});

		var fnChangeHandler1 = function() {
			oBinding.getContexts(0, 10);
			assert.ok(!oBinding.findNode(0).nodeState.expanded, "node is initially collapsed");
			oBinding.detachChange(fnChangeHandler1);

			// clear the _aRowIndexMap internally
			oBinding.getContexts(10, 20);

			oBinding.toggleIndex(0);
			assert.ok(oBinding.findNode(0).nodeState.expanded, "node is now expanded");
			done();
		};

		oBinding.attachChange(fnChangeHandler1);
		oBinding.getContexts(0, 10);
	});

	QUnit.test("Check Tree State Reset", function(assert) {
		var done = assert.async();

		var oTreeState;

		function assertations() {
			oBinding.getContexts(0, 100);
			assert.equal(oBinding.isExpanded(0), true, "Index 0 is expanded");
			assert.equal(oBinding.isExpanded(1), true, "Index 1 is expanded");
			assert.equal(oBinding.isExpanded(2), false, "Index 2 is collapsed");

			oBinding.collapse(9);

			oBinding.getContexts(0, 100);

			assert.equal(oBinding.isExpanded(9), false, "Index 9 is expanded");
			assert.equal(oBinding.isExpanded(10), true, "Index 10 is expanded");

			oTreeState = oBinding.getCurrentTreeState();

			assert.equal(oTreeState._getExpandedList(),
				"/;/000001/;/000001/000002/;/000001/000682/;/000001/001073/;/000001/001131/;/000001/001136/;/000001/001153/;/000001/001179/;/000001/001180/",
				"Expanded List is correct");
			assert.equal(oTreeState._getCollapsedList(), "/000001/000362/", "Collapsed List is correct");

			assert.equal(oTreeState._isExpanded("/000001/000002/"), true, "_isExpanded function works");
			assert.equal(oTreeState._isCollapsed("/000001/000362/"), true, "_isCollapsed function works");
		}

		prebuildTree(function() {
			assertations();

			createTreeBindingAdapter("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", [], null, {
				operationMode: "Client",
				rootLevel: 1,
				numberOfExpandedLevels: 2,
				treeState: oTreeState
			});

			oBinding.attachChange(changeHandler);
			oBinding.getContexts(0, 100);

			function changeHandler() {
				oBinding.detachChange(changeHandler);

				// after resetting the tree state the previous assertations should still evaluate to true
				assertations();

				done();
			}

		});

	});

	/** @deprecated As of version 1.102.0, reason sap.ui.model.odata.OperationMode.Auto */
	QUnit.test("Check correct initial tree-build in OperationMode.Auto", function(assert) {
		var done = assert.async();
		createTreeBindingAdapter("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", [], null, {
			operationMode: "Auto",
			rootLevel: 2,
			numberOfExpandedLevels: 1,
			threshold: 300
		});

		// change handler called after the $count returns
		function countChangeHandler() {
			oBinding.detachChange(countChangeHandler);
			assert.ok(oBinding.bClientOperation, "Binding is internally running in Client-Mode");

			// trigger data request
			oBinding.attachChange(dataChangeHandler);
			oBinding.getContexts(1, 10);
		}

		// change handler called after the data returned
		function dataChangeHandler() {
			oBinding.detachChange(dataChangeHandler);

			// retrieve the data and check it
			var aContexts = oBinding.getContexts(1, 10);

			// check return value of getContexts call
			assert.equal(aContexts[0].getProperty("HierarchyNode"), "000003", "Node 1 is 000003");
			assert.equal(aContexts[0].getProperty("FinancialStatementItemText"), "Ausstehende Kapital-Einlagen",
				"Node 1 is 'Ausstehende Kapital-Einlagen'");
			assert.equal(aContexts[0].getProperty("FinStatementHierarchyLevelVal"), 3, "Node 1 is a 1st level node");

			assert.equal(aContexts[7].getProperty("HierarchyNode"), "000362", "Node 8 is 'P A S S I V A'");
			assert.equal(aContexts[7].getProperty("FinancialStatementItemText"), "P A S S I V A", "Node 8 is 'P A S S I V A'");
			assert.equal(aContexts[7].getProperty("FinStatementHierarchyLevelVal"), 2, "Node 8 is a top-level node");

			// check internal tree state
			var oN000002 = oBinding.findNode(0);
			var oN000003 = oBinding.findNode(1);

			assert.equal(oN000002.groupID, "/000002/", "Correct node for index 0 found.");
			assert.equal(oN000003.groupID, "/000002/000003/", "Correct node for index 1 found.");

			var oN000002_test2 = oBinding.getNodeByIndex(0);
			var oN000003_test2 = oBinding.getNodeByIndex(1);

			assert.deepEqual(oN000002, oN000002_test2, "Correct node for index 0 found via getNodeByIndex.");
			assert.deepEqual(oN000003, oN000003_test2, "Correct node for index 1 found via getNodeByIndex.");

			// check if contexts are correctly returned via getContextByIndex vs getContexts
			// Beware: Indices are shifted by 1, as the context array starts with 0
			var oContext000003 = oBinding.getContextByIndex(1);
			var oContext000008 = oBinding.getContextByIndex(2);

			assert.equal(oContext000003.getProperty("HierarchyNode"), aContexts[0].getProperty("HierarchyNode"),
				"Context 000003 via different API calls is identical.");
			assert.equal(oContext000008.getProperty("HierarchyNode"), aContexts[1].getProperty("HierarchyNode"),
				"Context 000008 via different API calls is identical.");

			done();
		}

		// trigger $count in op mode auto
		oBinding.attachChange(countChangeHandler);
		oBinding.getContexts(1, 10);
	});

	QUnit.test("Check correct initial tree-build in OperationMode.Client", function(assert) {
		var done = assert.async();
		createTreeBindingAdapter("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", [], null, {
			operationMode: "Client",
			rootLevel: 2,
			numberOfExpandedLevels: 1,
			threshold: 300
		});

		// change handler called after the data returned
		function fnChangeHandler() {
			oBinding.detachChange(fnChangeHandler);

			// retrieve the data and check it
			var aContexts = oBinding.getContexts(1, 10);

			// check return value of getContexts call
			assert.equal(aContexts[0].getProperty("HierarchyNode"), "000003", "Node 1 is 000003");
			assert.equal(aContexts[0].getProperty("FinancialStatementItemText"), "Ausstehende Kapital-Einlagen",
				"Node 1 is 'Ausstehende Kapital-Einlagen'");
			assert.equal(aContexts[0].getProperty("FinStatementHierarchyLevelVal"), 3, "Node 1 is a 1st level node");

			assert.equal(aContexts[7].getProperty("HierarchyNode"), "000362", "Node 8 is 'P A S S I V A'");
			assert.equal(aContexts[7].getProperty("FinancialStatementItemText"), "P A S S I V A", "Node 8 is 'P A S S I V A'");
			assert.equal(aContexts[7].getProperty("FinStatementHierarchyLevelVal"), 2, "Node 8 is a top-level node");

			// check internal tree state
			var oN000002 = oBinding.findNode(0);
			var oN000003 = oBinding.findNode(1);

			assert.equal(oN000002.groupID, "/000002/", "Correct node for index 0 found.");
			assert.equal(oN000003.groupID, "/000002/000003/", "Correct node for index 1 found.");

			var oN000002_test2 = oBinding.getNodeByIndex(0);
			var oN000003_test2 = oBinding.getNodeByIndex(1);

			assert.deepEqual(oN000002, oN000002_test2, "Correct node for index 0 found via getNodeByIndex.");
			assert.deepEqual(oN000003, oN000003_test2, "Correct node for index 1 found via getNodeByIndex.");

			// check if contexts are correctly returned via getContextByIndex vs getContexts
			// Beware: Indices are shifted by 1, as the context array starts with 0
			var oContext000003 = oBinding.getContextByIndex(1);
			var oContext000008 = oBinding.getContextByIndex(2);

			assert.equal(oContext000003.getProperty("HierarchyNode"), aContexts[0].getProperty("HierarchyNode"),
				"Context 000003 via different API calls is identical.");
			assert.equal(oContext000008.getProperty("HierarchyNode"), aContexts[1].getProperty("HierarchyNode"),
				"Context 000008 via different API calls is identical.");

			done();
		}

		// trigger $count in op mode auto
		oBinding.attachChange(fnChangeHandler);
		oBinding.getContexts(1, 10);
	});

	QUnit.test("Empty binding should not cause exceptions", function(assert) {
		createTreeBindingAdapter("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", [], null, {
			displayRootNode: true,
			numberOfExpandedLevels: 2,
			rootLevel: 1
		});

		// Keep the binding empty, so that the adapter can't find any nodes

		// The following function calls should fail but not throw an exception
		oBinding.expand(999);
		oBinding.collapse(999);
		oBinding.toggleIndex(999);
		oBinding.setNodeSelection({});

		assert.ok(true, "No exceptions thrown");
	});

	QUnit.test("Group ID calculation should not add forward slashes from property values", function(assert) {
		createTreeBindingAdapter("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", [], null, {
			displayRootNode: true,
			numberOfExpandedLevels: 2,
			rootLevel: 1
		});

		var oFakeNode = {
			context: {
				getProperty: function(/* property name will be "GLAccount"*/) {
					return "something/containing/forward/slashes";
				}
			},
			parent: null // no parent -> no nesting with existing group IDs
		};

		var sResultGroupId = oBinding._calculateGroupID(oFakeNode);
		assert.equal(sResultGroupId.match(/\//g).length, 2, "Group ID contains exactly two forward slashes");
		// Group ID should contain exactly two forward slashes. One at the beginning and one at the end.
		//	Level is then calculated with (slash count)-1

		// Current implementation encodes the slashes, so let's also explicitly check for that:
		assert.equal(sResultGroupId, "/something%2Fcontaining%2Fforward%2Fslashes/", "Slashes got encoded");
	});

	QUnit.test("Group ID calculation should also be able to handle integer property values", function(assert) {
		createTreeBindingAdapter("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", [], null, {
			displayRootNode: true,
			numberOfExpandedLevels: 2,
			rootLevel: 1
		});

		var oFakeNode = {
			context: {
				getProperty: function(/* property name will be "GLAccount"*/) {
					return 1;
				}
			},
			parent: null // no parent -> no nesting with existing group IDs
		};

		try {
			var sResultGroupId = oBinding._calculateGroupID(oFakeNode);
			assert.ok(true, "No exceptions thrown");
			assert.equal(sResultGroupId, "/1/", "Integer got handled correctly");
		} catch (e) {
			assert.ok(false, "Threw exception: " + e);
		}
	});

	QUnit.test("Expand with bSuppressChange flag should suppress the change event", function(assert) {
		var done = assert.async();
		createTreeBindingAdapter("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", [], null, {
			rootLevel: 2,
			numberOfExpandedLevels: 2
		});

		oBinding.attachChange(changeHandler);
		oBinding.getContexts(0, 10);

		function changeHandler() {
			oBinding.detachChange(changeHandler);
			oBinding.getContexts(0, 10);
			assert.ok(oBinding.findNode(1), "Node can be found"); // If the binding does not find a node, it also does not fire a change event

			var oSpy = sinon.spy(oBinding, "_fireChange");
			oBinding.expand(1, true);
			assert.ok(oSpy.notCalled, "No change event fired");
			done();
		}
	});

	QUnit.test("Collapse with bSuppressChange flag should suppress the change event", function(assert) {
		var done = assert.async();
		createTreeBindingAdapter("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", [], null, {
			rootLevel: 2,
			numberOfExpandedLevels: 2
		});

		oBinding.attachChange(changeHandler);
		oBinding.getContexts(0, 10);

		function changeHandler() {
			oBinding.detachChange(changeHandler);
			oBinding.getContexts(0, 10);
			assert.ok(oBinding.findNode(0), "Node can be found"); // If the binding does not find a node, it also does not fire a change event

			var oSpy = sinon.spy(oBinding, "_fireChange");
			oBinding.collapse(0, true);
			assert.ok(oSpy.notCalled, "No change event fired");
			done();
		}
	});

	QUnit.test("expandNodeToLevel: Correct filter creation", function(assert) {
		var done = assert.async();
		createTreeBindingAdapter("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", null, null, {
			rootLevel: 2,
			displayRootNode: false
		});

		function fnChangeHandler() {
			oBinding.getContexts(0, 100);
			oBinding.sCustomParams = "SOME_CUST_PARAMS";

			var aExpectedParams = [
				"$filter=HierarchyNode%20eq%20%27000002%27%20and%20FinStatementHierarchyLevelVal%20le%202",
				"SOME_CUST_PARAMS"
			];
			var oExpectedNode = oBinding.findNode(0);

			oBinding._expandSubTree = function(oNode, aResults) {
				assert.deepEqual(oNode, oExpectedNode, "Passed correct node object to _expandSubTree()");
				assert.deepEqual(aResults[0].pony, true, "Passed correct data array");
			};

			oBinding._fireChange = function(oEvent) {
				assert.deepEqual(oEvent.reason, "expand", "Change event fired with correct reason");
				done();
			};

			oBinding._loadSubTree = function(oNode, aParams) {
				assert.deepEqual(aParams, aExpectedParams, "Generated correct parameters");
				assert.deepEqual(oNode, oExpectedNode, "Passed correct node object to _loadSubTree()");
				return Promise.resolve({
					results: [{ "FinStatementHierarchyLevelVal": 0, pony: true }]
				});
			};


			oBinding.expandNodeToLevel(0, 2);
		}

		oBinding.attachChange(fnChangeHandler);
		oBinding.getContexts(0, 100);

	});

	QUnit.test("expandNodeToLevel: Expand correct nodes", function(assert) {
		var done = assert.async();
		createTreeBindingAdapter("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", null, null, {
			rootLevel: 2,
			displayRootNode: false
		});

		function fnChangeHandler() {
			oBinding.getContexts(0, 100);

			oBinding._expandSubTree = function(oNode, aResults) {
				assert.equal(aResults.length,  1, "Only one node should be expanded");
				assert.equal(aResults[0]["FinStatementHierarchyLevelVal"],  0, "Only node on level 0 should be expanded");
			};

			oBinding._fireChange = function(oEvent) {
				assert.deepEqual(oEvent.reason, "expand", "Change event fired with correct reason");
				done();
			};

			oBinding._loadSubTree = function(oNode, aParams) {
				return Promise.resolve({
					results: [
						{ "FinStatementHierarchyLevelVal": 0 },
						{ "FinStatementHierarchyLevelVal": 1 }
					]
				});
			};


			oBinding.expandNodeToLevel(0, 1);
		}

		oBinding.attachChange(fnChangeHandler);
		oBinding.getContexts(0, 100);

	});

	QUnit.test("_expandSubTree: Expands correctly", function(assert) {
		var done = assert.async();
		var aExpectedGroupIDs = ["/123", "/123/FinancialStatementItem:001",
			"/123/FinancialStatementItem:003", "/123/FinancialStatementItem:001 3",
			"/123/FinancialStatementItem:001 5", "/123/FinancialStatementItem:001 6"];


		sap.ui.require([
			"sap/ui/model/odata/v2/ODataTreeBinding", "sap/ui/model/odata/ODataTreeBindingAdapter"],
			function(ODataTreeBinding, ODataTreeBindingAdapter) {
				var oBinding = new ODataTreeBinding({
					checkFilter: function() { }
				}, "/");
				ODataTreeBindingAdapter.apply(oBinding);

				oBinding.oTreeProperties = {
					"hierarchy-node-for": "GLAccount_NodeID",
					"hierarchy-parent-node-for": "GLAccount_ParentID",
					"hierarchy-drill-state-for": "GLAccount_Drillstate"
				};

				oBinding.oModel.getContext = function(sInput) {
					return sInput;
				};

				oBinding.oModel._getKey = function(oNode) {
					return oNode["GLAccount_NodeID"];
				};

				oBinding._calculateGroupID = function(oArgs) {
					return oArgs.parent.groupID + oArgs.context;
				};

				var oReq = new XMLHttpRequest();
				oReq.addEventListener("load", fnDataLoaded);
				oReq.open("GET", "test-resources/sap/ui/core/qunit/testdata/odata/sfin.json");
				oReq.send();

				function fnDataLoaded() {
					var oData, aExpandedTreeState;
					oData = JSON.parse(this.responseText);

					oBinding._expandSubTree({
						groupID: "/123",
						context: {
							getProperty: function() {
								return oData.results[0]["GLAccount_NodeID"];
							}
						}
					}, oData.results);

					aExpandedTreeState = oBinding._mTreeState["expanded"];

					aExpectedGroupIDs.forEach(function(sGroupId) {
						assert.ok(aExpandedTreeState[sGroupId], "group id: " + sGroupId + " is expanded");
					});

					assert.equal(Object.keys(aExpandedTreeState).length, aExpectedGroupIDs.length,
						"Only expected group ids have been expanded");
					done();
				}
		});
	});

	QUnit.test("Binding length available before first getContexts call", function(assert) {
		var done = assert.async();
		createTreeBindingAdapter("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", [], null, {
			displayRootNode: true,
			rootLevel: 1
		});
		oBinding.attachDataReceived(function() {
			assert.equal(oBinding.getLength(),  1, "Binding length can be retrieved");
			done();
		});
		oBinding.getContexts(0, 100);
	});

});
