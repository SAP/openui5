/*global QUnit*/
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/util/MockServer",
	"sap/ui/model/odata/ODataModel",
	"sap/ui/model/odata/ODataTreeBinding",
	"sap/ui/model/Filter"
], function(
	Log,
	MockServer,
	ODataModel,
	ODataTreeBinding,
	Filter
) {
	"use strict";

	//Initialize mock servers

	//Mock server for use with navigation properties
	var oNavPropMockServer = new MockServer({
		rootUri: '/navprop/'
	});
	oNavPropMockServer.simulate("test-resources/sap/ui/core/qunit/model/metadata_odtb.xml", "test-resources/sap/ui/core/qunit/model/odtb/");

	//MockServer for use with annotated tree
	var oAnnotationMockServer = new MockServer({
		rootUri: '/metadata/'
	});
	oAnnotationMockServer.simulate("test-resources/sap/ui/core/qunit/model/metadata_odtbmd.xml", "test-resources/sap/ui/core/qunit/model/odtbmd/");

	var oModel, oBinding;

	function createTreeBinding(sPath, oContext, aFilters, mParameters){
		// create binding
		oBinding = oModel.bindTree(sPath, oContext, aFilters, mParameters);
	}

	QUnit.module("ODataTreeBinding with navigation properties", {
		beforeEach: function() {
			oNavPropMockServer.start();
			oModel = new ODataModel('/navprop/', true);
		},
		afterEach: function() {
			oNavPropMockServer.stop();
			oModel.destroy();
		}
	});

	QUnit.test("Properties", function(assert){
		createTreeBinding("/Employees(2)", null, [], {
			navigation: {}
		});
		assert.equal(oBinding.getPath(), "/Employees(2)", "TreeBinding path");
		assert.equal(oBinding.getModel(), oModel, "TreeBinding model");
		assert.ok(oBinding instanceof ODataTreeBinding, "treeBinding class check");
	});

	QUnit.test("getRootContexts getNodeContexts", function(assert){
		var done = assert.async();
		createTreeBinding("/Employees(2)", null, [], {
			navigation: {
				Employees: "Employees1",
				Employees1: "Employees1"
			}
		});

		var oContext;

		var handler1 = function(oEvent) {

			// contexts should be now loaded
			var aContexts = oBinding.getRootContexts();

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

			oBinding.attachChange(handler2);
			oContext = aContexts[3];
			oBinding.getNodeContexts(oContext);
		};

		var handler2 = function(oEvent) {
			// contexts should be now loaded
			var aContexts = oBinding.getNodeContexts(oContext);

			assert.equal(aContexts.length, 3, "TreeBinding nodeContexts length");
			assert.equal(oBinding.getChildCount(oContext), 3, "TreeBinding childcount");

			oContext = aContexts[0];
			assert.equal(oModel.getProperty("FirstName", oContext), "Michael", "TreeBinding node content");
			assert.equal(oModel.getProperty("LastName", oContext), "Suyama", "TreeBinding node content");

			oContext = aContexts[1];
			assert.equal(oModel.getProperty("FirstName", oContext), "Robert", "TreeBinding node content");
			assert.equal(oModel.getProperty("LastName", oContext), "King", "TreeBinding node content");

			oContext = aContexts[2];
			assert.equal(oModel.getProperty("FirstName", oContext), "Anne", "TreeBinding node content");
			assert.equal(oModel.getProperty("LastName", oContext), "Dodsworth", "TreeBinding node content");

			oBinding.detachChange(handler2);
			done();
		};

		oBinding.attachChange(handler1);
		oBinding.getRootContexts();
	});

	QUnit.test("Display root node", function(assert){
		var done = assert.async();
		createTreeBinding("/Employees(2)", null, [], {
			navigation: {
				Employees: "Employees1",
				Employees1: "Employees1"
			},
			displayRootNode: true
		});

		var oContext;

		var handler1 = function(oEvent) {
			// contexts should be now loaded
			var aContexts = oBinding.getRootContexts();

			assert.equal(aContexts.length, 1, "TreeBinding rootContexts length");

			oContext = aContexts[0];
			assert.equal(oModel.getProperty("FirstName", oContext), "Andrew", "TreeBinding root content");
			assert.equal(oModel.getProperty("LastName", oContext), "Fuller", "TreeBinding root content");

			aContexts = oBinding.getNodeContexts(oContext);

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
			done();
		};

		oBinding.attachChange(handler1);
		oBinding.getRootContexts();
	});

	QUnit.test("Number of expanded levels", function(assert){
		var done = assert.async();
		createTreeBinding("/Employees(2)", null, [], {
			navigation: {
				Employees: "Employees1",
				Employees1: "Employees1"
			},
			displayRootNode: true,
			numberOfExpandedLevels: 2
		});

		var oContext;
		var handler1 = function(oEvent) {

			oBinding.detachChange(handler1);
			// contexts should be now loaded
			var aContexts = oBinding.getRootContexts();
			var aSubContexts;

			assert.equal(aContexts.length, 1, "TreeBinding rootContexts length");

			//Level 0
			oContext = aContexts[0];
			assert.equal(oModel.getProperty("FirstName", oContext), "Andrew", "TreeBinding root content");
			assert.equal(oModel.getProperty("LastName", oContext), "Fuller", "TreeBinding root content");

			//Level 0.0
			aContexts = oBinding.getNodeContexts(oContext);
			assert.equal(aContexts.length, 5, "TreeBinding nodeContexts length");

			oContext = aContexts[0];
			assert.equal(oModel.getProperty("FirstName", oContext), "Nancy", "TreeBinding root content");
			assert.equal(oModel.getProperty("LastName", oContext), "Davolio", "TreeBinding root content");

			//Level 0.0.0
			aSubContexts = oBinding.getNodeContexts(oContext);
			assert.equal(aSubContexts.length, 0, "TreeBinding nodeContexts length");

			//Level 0.1
			oContext = aContexts[3];
			assert.equal(oModel.getProperty("FirstName", oContext), "Steven", "TreeBinding root content");
			assert.equal(oModel.getProperty("LastName", oContext), "Buchanan", "TreeBinding root content");

			aSubContexts = oBinding.getNodeContexts(oContext);
			assert.equal(aSubContexts.length, 3, "TreeBinding nodeContexts length");

			oContext = aSubContexts[0];
			assert.equal(oModel.getProperty("FirstName", oContext), "Michael", "TreeBinding root content");
			assert.equal(oModel.getProperty("LastName", oContext), "Suyama", "TreeBinding root content");

			oContext = aSubContexts[2];
			assert.equal(oModel.getProperty("FirstName", oContext), "Anne", "TreeBinding root content");
			assert.equal(oModel.getProperty("LastName", oContext), "Dodsworth", "TreeBinding root content");

			done();
		};

		oBinding.attachChange(handler1);
		oBinding.getRootContexts();
	});

	QUnit.test("Has Children", function(assert){
		var done = assert.async();
		createTreeBinding("/Employees(2)", null, [], {
			navigation: {
				Employees: "Employees1",
				Employees1: "Employees1"
			},
			displayRootNode: true,
			numberOfExpandedLevels: 2
		});

		var handler1 = function(oEvent) {

			oBinding.detachChange(handler1);
			// contexts should be now loaded
			var aContexts = oBinding.getRootContexts();

			assert.ok(oBinding.hasChildren(aContexts[0]), " root context should have children");

			//Level 0.0
			aContexts = oBinding.getNodeContexts(aContexts[0]);
			assert.ok(!oBinding.hasChildren(aContexts[0]), " node context should not have children");
			assert.ok(oBinding.hasChildren(aContexts[3]), " node context should have children");

			oBinding.getNodeContexts(aContexts[3]);
			assert.ok(oBinding.hasChildren(aContexts[3]), " node context should have children");

			done();
		};

		oBinding.attachChange(handler1);
		oBinding.getRootContexts();
	});

	QUnit.test("Bind an aggregation", function(assert){
		var done = assert.async();
		createTreeBinding("/Employees", null, [], {
			navigation: {
				Employees: "Employees1",
				Employees1: "Employees1"
			}
		});

		var oContext;

		var handler1 = function(oEvent) {
			// contexts should be now loaded
			var aContexts = oBinding.getRootContexts();

			assert.equal(aContexts.length, 9, "TreeBinding rootContexts length");

			oContext = aContexts[0];
			assert.equal(oModel.getProperty("FirstName", oContext), "Nancy", "TreeBinding root content");
			assert.equal(oModel.getProperty("LastName", oContext), "Davolio", "TreeBinding root content");

			oContext = aContexts[1];
			assert.equal(oModel.getProperty("FirstName", oContext), "Andrew", "TreeBinding root content");
			assert.equal(oModel.getProperty("LastName", oContext), "Fuller", "TreeBinding root content");

			oContext = aContexts[2];
			assert.equal(oModel.getProperty("FirstName", oContext), "Janet", "TreeBinding root content");
			assert.equal(oModel.getProperty("LastName", oContext), "Leverling", "TreeBinding root content");

			oContext = aContexts[3];
			assert.equal(oModel.getProperty("FirstName", oContext), "Margaret", "TreeBinding root content");
			assert.equal(oModel.getProperty("LastName", oContext), "Peacock", "TreeBinding root content");

			oContext = aContexts[4];
			assert.equal(oModel.getProperty("FirstName", oContext), "Steven", "TreeBinding root content");
			assert.equal(oModel.getProperty("LastName", oContext), "Buchanan", "TreeBinding root content");

			oContext = aContexts[5];
			assert.equal(oModel.getProperty("FirstName", oContext), "Michael", "TreeBinding root content");
			assert.equal(oModel.getProperty("LastName", oContext), "Suyama", "TreeBinding root content");

			oContext = aContexts[6];
			assert.equal(oModel.getProperty("FirstName", oContext), "Robert", "TreeBinding root content");
			assert.equal(oModel.getProperty("LastName", oContext), "King", "TreeBinding root content");

			oContext = aContexts[7];
			assert.equal(oModel.getProperty("FirstName", oContext), "Laura", "TreeBinding root content");
			assert.equal(oModel.getProperty("LastName", oContext), "Callahan", "TreeBinding root content");

			oContext = aContexts[8];
			assert.equal(oModel.getProperty("FirstName", oContext), "Anne", "TreeBinding root content");
			assert.equal(oModel.getProperty("LastName", oContext), "Dodsworth", "TreeBinding root content");

			oContext = aContexts[1];

			aContexts = oBinding.getNodeContexts(oContext);

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
			done();
		};

		oBinding.attachChange(handler1);
		oBinding.getRootContexts();
	});

	QUnit.test("Refresh", function(assert){
		var done = assert.async();
		createTreeBinding("/Employees(2)", null, [], {
			navigation: {
				Employees: "Employees1",
				Employees1: "Employees1"
			}
		});

		var oContext;

		var handler1 = function(oEvent) {
			// contexts should be now loaded
			var aContexts = oBinding.getRootContexts();

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

			assert.deepEqual(oBinding.oKeys, {
				"/Employees(2)/Employees1": [
					"Employees(1)",
					"Employees(3)",
					"Employees(4)",
					"Employees(5)",
					"Employees(8)"
				]
			}, "Keys object has value for root");
			assert.deepEqual(oBinding.oLengths, {
				"/Employees(2)/Employees1": 5
			}, "Lengths object has value for root");
			assert.deepEqual(oBinding.oFinalLengths, {
				"/Employees(2)/Employees1": true
			}, "FinalLengths object has value for root");

			oBinding.detachChange(handler1);

			oBinding.attachChange(handler2);
			oBinding.refresh();
			assert.deepEqual(oBinding.oKeys, {}, "Keys object has been reset");
			assert.deepEqual(oBinding.oLengths, {}, "Lengths object has value for root");
			assert.deepEqual(oBinding.oFinalLengths, {}, "FinalLengths object has value for root");
		};

		var handler2 = function(oEvent) {
			// contexts should be now loaded
			var aContexts = oBinding.getRootContexts();

			assert.equal(aContexts.length, 0, "No contexts are available data has been reset");

			oBinding.detachChange(handler2);

			oBinding.attachChange(handler3);
		};

		var handler3 = function(oEvent) {
			// contexts should be now loaded
			var aContexts = oBinding.getRootContexts();

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

			assert.deepEqual(oBinding.oKeys, {
				"/Employees(2)/Employees1": [
					"Employees(1)",
					"Employees(3)",
					"Employees(4)",
					"Employees(5)",
					"Employees(8)"
				]
			}, "Keys object has value for root");
			assert.deepEqual(oBinding.oLengths, {
				"/Employees(2)/Employees1": 5
			}, "Lengths object has value for root");
			assert.deepEqual(oBinding.oFinalLengths, {
				"/Employees(2)/Employees1": true
			}, "FinalLengths object has value for root");

			oBinding.detachChange(handler3);
			done();
		};

		oBinding.attachChange(handler1);
		oBinding.getRootContexts();
	});

	QUnit.test("No navigation object specified", function(assert) {

		var iErrorCount = 0,
			sErrorMessage = "";

		this.stub(Log, "error", function(sMsg) {
			iErrorCount++;
			sErrorMessage = sMsg;
		});

		createTreeBinding("/Employees(2)");

		assert.equal(iErrorCount, 1, "TreeBinding one error should have occured");
		assert.equal(sErrorMessage, "A navigation paths parameter object has to be defined", "TreeBinding navigation error was thrown");
	});

	QUnit.test("Tried filtering", function(assert) {

		var iWarningCount = 0,
			sMessage = "";

		this.stub(Log, "warning", function(sMsg) {
			iWarningCount++;
			sMessage = sMsg;
		});

		createTreeBinding("/Employees(2)", null, [], {
			navigation: {}
		});

		oBinding.filter(new Filter("FirstName", "EQ", "Tom"));

		assert.equal(iWarningCount, 1, "One warning (that filtering is not enabled) should have fired");
		assert.equal(sMessage, "Filtering is currently not possible in the ODataTreeBinding", "Check warning message");
	});

	QUnit.test("Paging", function(assert) {
		var done = assert.async();
		createTreeBinding("/Employees", null, [], {
			navigation: {
				Employees: "Employees1",
				Employees1: "Employees1"
			},
			displayRootNode: true
		});

		var oContext;

		var handler1 = function(oEvent) {
			// contexts should be now loaded
			var aContexts = oBinding.getRootContexts(1, 4);

			assert.equal(aContexts.length, 4, "TreeBinding returned rootContexts length");
			//Wait for fix of Mock Server
			//assert.equal(oBinding.getChildCount(null), 9, "TreeBinding actual rootContexts length");

			oContext = aContexts[0];
			assert.equal(oModel.getProperty("FirstName", oContext), "Andrew", "TreeBinding root content");
			assert.equal(oModel.getProperty("LastName", oContext), "Fuller", "TreeBinding root content");

			oContext = aContexts[1];
			assert.equal(oModel.getProperty("FirstName", oContext), "Janet", "TreeBinding root content");
			assert.equal(oModel.getProperty("LastName", oContext), "Leverling", "TreeBinding root content");

			oContext = aContexts[2];
			assert.equal(oModel.getProperty("FirstName", oContext), "Margaret", "TreeBinding root content");
			assert.equal(oModel.getProperty("LastName", oContext), "Peacock", "TreeBinding root content");

			oContext = aContexts[3];
			assert.equal(oModel.getProperty("FirstName", oContext), "Steven", "TreeBinding root content");
			assert.equal(oModel.getProperty("LastName", oContext), "Buchanan", "TreeBinding root content");


			oContext = aContexts[0];
			aContexts = oBinding.getNodeContexts(oContext, 2, 3);

			assert.equal(aContexts.length, 3, "TreeBinding rootContexts length");
			//Wait for fix of Mock Server
			//assert.equal(oBinding.getChildCount(oContext), 5, "TreeBinding actual rootContexts length");

			oContext = aContexts[0];
			assert.equal(oModel.getProperty("FirstName", oContext), "Margaret", "TreeBinding root content");
			assert.equal(oModel.getProperty("LastName", oContext), "Peacock", "TreeBinding root content");

			oContext = aContexts[1];
			assert.equal(oModel.getProperty("FirstName", oContext), "Steven", "TreeBinding root content");
			assert.equal(oModel.getProperty("LastName", oContext), "Buchanan", "TreeBinding root content");

			oContext = aContexts[2];
			assert.equal(oModel.getProperty("FirstName", oContext), "Laura", "TreeBinding root content");
			assert.equal(oModel.getProperty("LastName", oContext), "Callahan", "TreeBinding root content");

			oBinding.detachChange(handler1);
			done();
		};

		oBinding.attachChange(handler1);
		oBinding.getRootContexts(1, 4);
	});

	QUnit.module("ODataTreeBinding with annotations", {
		beforeEach: function() {
			oAnnotationMockServer.start();
			oModel = new ODataModel('/metadata/', true);
		},
		afterEach: function() {
			oAnnotationMockServer.stop();
			oModel.destroy();
		}
	});

	QUnit.test("Properties", function(assert){
		createTreeBinding("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", null, [], {
			navigation: {}
		});
		assert.ok(oBinding instanceof ODataTreeBinding, "treeBinding class check");
		assert.equal(oBinding.getPath(), "/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", "TreeBinding path");
		assert.equal(oBinding.getModel(), oModel, "TreeBinding model");
		assert.equal(oBinding.bHasTreeAnnotations, true, "TreeBinding Metadata should be available");
	});

	QUnit.test("TreeBinding getRootContexts getNodeContexts", function(assert){
		var done = assert.async();
		createTreeBinding("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result");

		var oContext;
		var iHandleCounter = 0;

		var handler1 = function(oEvent) {
			iHandleCounter++;

			// contexts should be now loaded
			var aContexts = oBinding.getRootContexts();

			if (iHandleCounter == 2) {

				assert.equal(aContexts.length, 9, "TreeBinding rootContexts length");

				oContext = aContexts[0];
				assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "02", "TreeBinding node content");
				assert.equal(oModel.getProperty("HierarchyNode", oContext), "000002", "TreeBinding node content");
				assert.equal(oModel.getProperty("ParentNode", oContext), "000001", "TreeBinding node content");
				assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "1000000", "TreeBinding node content");

				oContext = aContexts[1];
				assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "02", "TreeBinding node content");
				assert.equal(oModel.getProperty("HierarchyNode", oContext), "000362", "TreeBinding node content");
				assert.equal(oModel.getProperty("ParentNode", oContext), "000001", "TreeBinding node content");
				assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "2000000", "TreeBinding node content");

				oContext = aContexts[8];
				assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "02", "TreeBinding node content");
				assert.equal(oModel.getProperty("HierarchyNode", oContext), "001180", "TreeBinding node content");
				assert.equal(oModel.getProperty("ParentNode", oContext), "000001", "TreeBinding node content");
				assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "1", "TreeBinding node content");

				oBinding.detachChange(handler1);

				done();
			}
		};

		oBinding.attachChange(handler1);
		oBinding.getRootContexts();
	});

	QUnit.test("Display root node", function(assert){
		var done = assert.async();
		createTreeBinding("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", [], null, {
			displayRootNode: true
		});

		var oContext;

		var handler1 = function(oEvent) {
			// contexts should be now loaded
			var aContexts = oBinding.getRootContexts();

			assert.equal(aContexts.length, 1, "TreeBinding rootContexts length");

			oContext = aContexts[0];
			assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "01", "TreeBinding root content");
			assert.equal(oModel.getProperty("HierarchyNode", oContext), "000001", "TreeBinding root content");
			assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "INT", "TreeBinding root content");

			oBinding.detachChange(handler1);

			oBinding.attachChange(handler2);
			oContext = aContexts[0];
			oBinding.getNodeContexts(oContext);
		};

		var handler2 = function(oEvent) {
			// contexts should be now loaded
			var aContexts = oBinding.getNodeContexts(oContext);

			assert.equal(aContexts.length, 9, "TreeBinding nodeContexts length");
			//Wait for fix of Mock Server
			//assert.equal(oBinding.getChildCount(oContext), 9, "TreeBinding childcount");

			oContext = aContexts[0];
			assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "02", "TreeBinding node content");
			assert.equal(oModel.getProperty("HierarchyNode", oContext), "000002", "TreeBinding node content");
			assert.equal(oModel.getProperty("ParentNode", oContext), "000001", "TreeBinding node content");
			assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "1000000", "TreeBinding node content");

			oContext = aContexts[1];
			assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "02", "TreeBinding node content");
			assert.equal(oModel.getProperty("HierarchyNode", oContext), "000362", "TreeBinding node content");
			assert.equal(oModel.getProperty("ParentNode", oContext), "000001", "TreeBinding node content");
			assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "2000000", "TreeBinding node content");

			oContext = aContexts[8];
			assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "02", "TreeBinding node content");
			assert.equal(oModel.getProperty("HierarchyNode", oContext), "001180", "TreeBinding node content");
			assert.equal(oModel.getProperty("ParentNode", oContext), "000001", "TreeBinding node content");
			assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "1", "TreeBinding node content");

			oBinding.detachChange(handler2);
			done();
		};

		oBinding.attachChange(handler1);
		oBinding.getRootContexts();
	});

	QUnit.test("Number of expanded levels", function(assert){
		var done = assert.async();
		createTreeBinding("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result", [], null, {
			displayRootNode: true,
			numberOfExpandedLevels: 2
		});

		var oContext;

		var handler1 = function(oEvent) {
			oBinding.detachChange(handler1);
			// contexts should be now loaded
			var aContexts = oBinding.getRootContexts();
			var aSubContexts;

			assert.equal(aContexts.length, 1, "TreeBinding rootContexts length");

			//Level 0
			oContext = aContexts[0];
			assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "01", "TreeBinding root content");
			assert.equal(oModel.getProperty("HierarchyNode", oContext), "000001", "TreeBinding root content");
			assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "INT", "TreeBinding root content");

			//Level 0.0
			aContexts = oBinding.getNodeContexts(oContext);
			assert.equal(aContexts.length, 9, "TreeBinding nodeContexts length");

			oContext = aContexts[0];
			assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "02", "TreeBinding node content");
			assert.equal(oModel.getProperty("HierarchyNode", oContext), "000002", "TreeBinding node content");
			assert.equal(oModel.getProperty("ParentNode", oContext), "000001", "TreeBinding node content");
			assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "1000000", "TreeBinding node content");

			//Level 0.0.0
			aSubContexts = oBinding.getNodeContexts(oContext);
			assert.equal(aSubContexts.length, 7, "TreeBinding nodeContexts length");

			oContext = aSubContexts[0];
			assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "03", "TreeBinding node content");
			assert.equal(oModel.getProperty("HierarchyNode", oContext), "000003", "TreeBinding node content");
			assert.equal(oModel.getProperty("ParentNode", oContext), "000002", "TreeBinding node content");
			assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "1010000", "TreeBinding node content");

			oContext = aSubContexts[6];
			assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "03", "TreeBinding node content");
			assert.equal(oModel.getProperty("HierarchyNode", oContext), "000360", "TreeBinding node content");
			assert.equal(oModel.getProperty("ParentNode", oContext), "000002", "TreeBinding node content");
			assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "1070000", "TreeBinding node content");

			//Level 0.1
			oContext = aContexts[7];
			assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "02", "TreeBinding node content");
			assert.equal(oModel.getProperty("HierarchyNode", oContext), "001179", "TreeBinding node content");
			assert.equal(oModel.getProperty("ParentNode", oContext), "000001", "TreeBinding node content");
			assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "8000000", "TreeBinding node content");

			aSubContexts = oBinding.getNodeContexts(oContext);
			assert.equal(aSubContexts.length, 0, "TreeBinding nodeContexts length - no children anymore");

			done();
		};

		oBinding.attachChange(handler1);
		oBinding.getRootContexts();
	});

	QUnit.test("Paging", function(assert) {
		var done = assert.async();
		createTreeBinding("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result");

		var oContext;
		var iHandleCounter = 0;

		var handler1 = function(oEvent) {
			iHandleCounter++;
			// contexts should be now loaded
			var aContexts = oBinding.getRootContexts(1, 4);

			if (iHandleCounter == 2) {
				assert.equal(aContexts.length, 4, "TreeBinding returned rootContexts length");
				//Wait for fix of Mock Server
				//assert.equal(oBinding.getChildCount(null), 9, "TreeBinding actual rootContexts length");

				oContext = aContexts[0];
				assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "02", "TreeBinding node content");
				assert.equal(oModel.getProperty("HierarchyNode", oContext), "000362", "TreeBinding node content");
				assert.equal(oModel.getProperty("ParentNode", oContext), "000001", "TreeBinding node content");
				assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "2000000", "TreeBinding node content");

				oContext = aContexts[1];
				assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "02", "TreeBinding node content");
				assert.equal(oModel.getProperty("HierarchyNode", oContext), "000682", "TreeBinding node content");
				assert.equal(oModel.getProperty("ParentNode", oContext), "000001", "TreeBinding node content");
				assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "3000000", "TreeBinding node content");

				oContext = aContexts[2];
				assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "02", "TreeBinding node content");
				assert.equal(oModel.getProperty("HierarchyNode", oContext), "001073", "TreeBinding node content");
				assert.equal(oModel.getProperty("ParentNode", oContext), "000001", "TreeBinding node content");
				assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "4000000", "TreeBinding node content");

				oContext = aContexts[3];
				assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "02", "TreeBinding node content");
				assert.equal(oModel.getProperty("HierarchyNode", oContext), "001131", "TreeBinding node content");
				assert.equal(oModel.getProperty("ParentNode", oContext), "000001", "TreeBinding node content");
				assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "5000000", "TreeBinding node content");

				oBinding.detachChange(handler1);

				oContext = aContexts[0];
				oBinding.attachChange(handler2);
				oBinding.getNodeContexts(oContext, 2, 3);
			}
		};

		var handler2 = function(oEvent) {
			// contexts should be now loaded
			var aContexts = oBinding.getNodeContexts(oContext, 2, 3);

			assert.equal(aContexts.length, 3, "TreeBinding rootContexts length");
			//Wait for fix of Mock Server
			//assert.equal(oBinding.getChildCount(oContext), 5, "TreeBinding actual rootContexts length");

			oContext = aContexts[0];
			assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "03", "TreeBinding node content");
			assert.equal(oModel.getProperty("HierarchyNode", oContext), "000413", "TreeBinding node content");
			assert.equal(oModel.getProperty("ParentNode", oContext), "000362", "TreeBinding node content");
			assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "2030000", "TreeBinding node content");

			oContext = aContexts[1];
			assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "03", "TreeBinding node content");
			assert.equal(oModel.getProperty("HierarchyNode", oContext), "000447", "TreeBinding node content");
			assert.equal(oModel.getProperty("ParentNode", oContext), "000362", "TreeBinding node content");
			assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "2040000", "TreeBinding node content");

			oContext = aContexts[2];
			assert.equal(oModel.getProperty("FinStatementHierarchyLevelVal", oContext), "03", "TreeBinding node content");
			assert.equal(oModel.getProperty("HierarchyNode", oContext), "000680", "TreeBinding node content");
			assert.equal(oModel.getProperty("ParentNode", oContext), "000362", "TreeBinding node content");
			assert.equal(oModel.getProperty("FinancialStatementItem", oContext), "2050000", "TreeBinding node content");

			oBinding.detachChange(handler2);
			done();
		};

		oBinding.attachChange(handler1);
		oBinding.getRootContexts(1, 4);
	});

	QUnit.test("Tried filtering", function(assert) {

		var iWarningCount = 0,
			sMessage = "";

		this.stub(Log, "warning", function(sMsg) {
			iWarningCount++;
			sMessage = sMsg;
		});

		createTreeBinding("/GLAccountHierarchyInChartOfAccountsSet(P_MANDT='902',P_VERSN='INT',P_KTOPL='INT')/Result");

		oBinding.filter(new Filter("ParentNode", "EQ", "000000"));

		assert.equal(iWarningCount, 2, "One warning (that filtering is not enabled) should have fired and one warning for hierarchy mode deprecation");
		assert.equal(sMessage, "Filtering is currently not possible in the ODataTreeBinding", "Check warning message");
	});
});