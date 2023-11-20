/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/util/MockServer",
	"sap/ui/model/Filter",
	"sap/ui/model/odata/v2/ODataModel"
], function(
	MockServer,
	Filter,
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

	// request data
	function loadData(oBinding, iSkip, iTop, iThreshold) {
		// refresh indicates that the adapter code has been loaded and the binding has been
		// successfully initialized
		oBinding.attachEventOnce("refresh", function () {
			oBinding._loadData(iSkip, iTop, iThreshold);
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

	QUnit.test("Initialize & Adapter check", function(assert){
		var done = assert.async();
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			select: "LEVEL,DRILLDOWN_STATE", //incomplete annotation set in $select
			numberOfExpandedLevels: 2
		});
		oBinding.attachEventOnce("refresh", function () {
			// API Check
			assert.ok(oBinding.getContexts, "getContexts function is present");
			assert.ok(oBinding.getNodes, "getNodes function is present");
			assert.ok(oBinding.getLength, "getLength function is present");
			assert.ok(oBinding.expand, "expand function is present");
			assert.ok(oBinding.collapse, "collapse function is present");

			// $select validation
			assert.equal(oBinding.mParameters.select, "LEVEL,DRILLDOWN_STATE,PARENT_NODE,"
				+ "HIERARCHY_NODE,MAGNITUDE", "$select is complete incl. Magnitude");
			done();
		});
	});

	QUnit.test("Initial getContexts and Thresholding", function(assert){
		var done = assert.async();
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		var oDataRequestedSpy = sinon.spy();

		function handler1 (oEvent) {
			oBinding.detachChange(handler1);
			oBinding.detachDataRequested(oDataRequestedSpy);

			assert.equal(oDataRequestedSpy.callCount, 1, "data requested event is fired");

			// contexts should be now loaded
			var aContexts = oBinding.getContexts(0, 10, 10);
			assert.equal(aContexts.length, 10, "initially loaded context length is ok");

			var oContext = aContexts[0];
			assert.equal(oContext.getProperty("LEVEL"), 0, "First node on LEVEL = 0");
			assert.equal(oContext.getProperty("HIERARCHY_NODE"), "1001", "First Hierarchy Node is ok");

			oContext = aContexts[4];
			assert.equal(oContext.getProperty("LEVEL"), 2, "5th node on LEVEL = 2");
			assert.equal(oContext.getProperty("HIERARCHY_NODE"), "1005", "5th Hierarchy Node is ok");

			oContext = aContexts[8];
			assert.equal(oContext.getProperty("LEVEL"), 1, "8th node on LEVEL = 1");
			assert.equal(oContext.getProperty("HIERARCHY_NODE"), "1009", "8th Hierarchy Node is ok");

			aContexts = oBinding.getContexts(10, 10, 0);
			assert.equal(aContexts.length, 10, "second page is loaded via thresholding");
		}

		function dataReceived() {
			oBinding.detachDataReceived(dataReceived);

			assert.ok(true, "dataReceived event is fired");
			done();
		}

		oBinding.attachChange(handler1);
		oBinding.attachDataRequested(oDataRequestedSpy);
		oBinding.attachDataReceived(dataReceived);
		requestData(oBinding, 0, 10, 20);
	});

	QUnit.test("Simple Paging", function(assert){

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
			var aContexts = oBinding.getContexts(0, 10, 0);
			assert.equal(aContexts.length, 10, "initially loaded context length is ok");

			oBinding.attachChange(handler2);
			aContexts = oBinding.getContexts(60, 10, 0);
		}

		function handler2 (oEvent) {
			oBinding.detachChange(handler2);

			var aContexts = oBinding.getContexts(60, 10, 0);
			assert.equal(aContexts.length, 10, "Second page starting at 60 is loaded");

			done();
		}

		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 10, 20);
	});

	QUnit.test("Succeeding _loadData() calls for same section only trigger one request", function(assert){

		var done = assert.async();
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		function handler1 (oEvent) {
			oBinding.detachChange(handler1);

			var spy = sinon.spy(oModel, "read");
			oBinding.attachChange(handler2);
			oBinding._loadData(10, 60, 0);
			oBinding._loadData(10, 55, 0);
			oBinding._loadData(10, 50, 0);
			assert.equal(spy.callCount, 1, "Three _loadData() calls trigger only one request");
		}

		function handler2 (oEvent) {
			oBinding.detachChange(handler2);
			done();
		}

		oBinding.attachChange(handler1);
		loadData(oBinding, 0, 10, 0);
	});

	QUnit.test("Succeeding _loadData() calls for partially equal sections trigger delta requests", function(assert){

		var done = assert.async();
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		function getSkipFromCall(args) {
			return parseInt(args[1].urlParameters[0].replace("$skip=", ""));
		}

		function getTopFromCall(args) {
			return parseInt(args[1].urlParameters[1].replace("$top=", ""));
		}

		function handler1 (oEvent) {
			oBinding.detachChange(handler1);

			var spy = sinon.spy(oModel, "read");
			oBinding.attachChange(handler2);
			oBinding._loadData(10, 50, 0);
			oBinding._loadData(10, 55, 0);
			oBinding._loadData(10, 61, 0);

			assert.equal(spy.callCount, 3, "Three _loadData() calls trigger three requests");

			// First call
			assert.equal(getSkipFromCall(spy.args[0]), 10, "First call: Skip equals 10");
			assert.equal(getTopFromCall(spy.args[0]), 50, "First call: Top equals 50");

			// Second call
			assert.equal(getSkipFromCall(spy.args[1]), 60, "Second call: Skip equals 50");
			assert.equal(getTopFromCall(spy.args[1]), 5, "Second call: Top equals 5");

			// Third call
			assert.equal(getSkipFromCall(spy.args[2]), 65, "Third call: Skip equals 55");
			assert.equal(getTopFromCall(spy.args[2]), 6, "Third call: Top equals 6");
		}

		var callCount = 0;
		function handler2 (oEvent) {
			if (++callCount === 3) {
				oBinding.detachChange(handler2);
				done();
			}
		}

		oBinding.attachChange(handler1);
		loadData(oBinding, 0, 10, 0);
	});

	QUnit.test("Succeeding _loadData() calls for partially equal threshold-sections trigger threshold requests", function(assert){

		var done = assert.async();
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		function getSkipFromCall(args) {
			return parseInt(args[1].urlParameters[0].replace("$skip=", ""));
		}

		function getTopFromCall(args) {
			return parseInt(args[1].urlParameters[1].replace("$top=", ""));
		}

		function handler1 (oEvent) {
			oBinding.detachChange(handler1);

			var spy = sinon.spy(oModel, "read");
			oBinding.attachChange(handler2);
			oBinding._loadData(10, 50, 100); // $skip=10 $top=150 -> end-idx=160
			oBinding._loadData(80, 50, 100); // $skip=80 $top=150 -> end-idx=330 -> partially covered by pending request -> threshold gets added again to end-idx

			oBinding._loadData(200, 10, 0); // $skip=200 $top=10 -> end-idx=210 -> inside threshold of preceding request
			oBinding._loadData(300, 10, 20); // $skip=300 $top=30 -> end-idx=330 -> inside threshold of preceding request

			assert.equal(spy.callCount, 2, "Two _loadData() calls trigger two requests");

			// First call
			assert.equal(getSkipFromCall(spy.args[0]), 10, "First call: Skip equals 10");
			assert.equal(getTopFromCall(spy.args[0]), 150, "First call: Top (including threshold) equals 150");

			// Second call
			assert.equal(getSkipFromCall(spy.args[1]), 160, "Second call: Skip equals 160");
			assert.equal(getTopFromCall(spy.args[1]), 170, "Second call: Top (delta of requested section + threshold) equals 170");
		}

		var callCount = 0;
		function handler2 (oEvent) {
			if (++callCount === 2) {
				oBinding.detachChange(handler2);
				done();
			}
		}

		oBinding.attachChange(handler1);
		loadData(oBinding, 0, 10, 0);
	});

	QUnit.test("Succeeding _loadData() calls within threshold of each other trigger exactly one request", function(assert){

		var done = assert.async();
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});


		function handler1 (oEvent) {
			oBinding.detachChange(handler1);

			var spy = sinon.spy(oModel, "read");
			oBinding.attachChange(handler2);
			oBinding._loadData(10, 60, 100);
			oBinding._loadData(10, 70, 0);
			oBinding._loadData(10, 150, 0);
			assert.equal(spy.callCount, 1, "Three _loadData() calls trigger only one request");
		}

		function handler2 (oEvent) {
			oBinding.detachChange(handler2);
			done();
		}

		oBinding.attachChange(handler1);
		loadData(oBinding, 0, 10, 0);
	});

	QUnit.test("Succeeding _loadChildren() calls for same section only trigger one request", function(assert){

		var done = assert.async();
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});


		function handler1 (oEvent) {
			oBinding.detachChange(handler1);

			var spy = sinon.spy(oModel, "read");
			oBinding.attachChange(handler2);
			oBinding._loadChildren(oBinding.getNodeByIndex(0), 10, 60);
			oBinding._loadChildren(oBinding.getNodeByIndex(0), 10, 55);
			oBinding._loadChildren(oBinding.getNodeByIndex(0), 10, 50);
			assert.equal(spy.callCount, 1, "Three _loadChildren() calls trigger only one request");
		}

		function handler2 (oEvent) {
			oBinding.detachChange(handler2);
			done();
		}

		oBinding.attachChange(handler1);
		loadData(oBinding, 0, 10, 0);
	});

	QUnit.test("Succeeding _loadChildren() calls for partially equal sections trigger delta requests", function(assert){

		var done = assert.async();
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		function getSkipFromCall(args) {
			return parseInt(args[1].urlParameters[0].replace("$skip=", ""));
		}

		function getTopFromCall(args) {
			return parseInt(args[1].urlParameters[1].replace("$top=", ""));
		}

		function handler1 (oEvent) {
			oBinding.detachChange(handler1);

			var spy = sinon.spy(oModel, "read");
			oBinding.attachChange(handler2);
			oBinding._loadChildren(oBinding.getNodeByIndex(1), 10, 50);
			oBinding._loadChildren(oBinding.getNodeByIndex(1), 10, 55);
			oBinding._loadChildren(oBinding.getNodeByIndex(1), 10, 61);

			assert.equal(spy.callCount, 3, "Three _loadChildren() calls trigger three requests");

			// First call
			assert.equal(getSkipFromCall(spy.args[0]), 10, "First call: Skip equals 10");
			assert.equal(getTopFromCall(spy.args[0]), 50, "First call: Top equals 50");

			// Second call
			assert.equal(getSkipFromCall(spy.args[1]), 60, "Second call: Skip equals 60");
			assert.equal(getTopFromCall(spy.args[1]), 5, "Second call: Top equals 5");

			// Third call
			assert.equal(getSkipFromCall(spy.args[2]), 65, "Third call: Skip equals 65");
			assert.equal(getTopFromCall(spy.args[2]), 6, "Third call: Top equals 6");
		}

		var callCount = 0;
		function handler2 (oEvent) {
			if (++callCount === 3) {
				oBinding.detachChange(handler2);
				done();
			}
		}

		oBinding.attachChange(handler1);
		loadData(oBinding, 0, 10, 0);
	});

	QUnit.test("Succeeding _loadChildren() calls for separate parents trigger separate requests", function(assert){

		var done = assert.async();
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		function getSkipFromCall(args) {
			return parseInt(args[1].urlParameters[0].replace("$skip=", ""));
		}

		function getTopFromCall(args) {
			return parseInt(args[1].urlParameters[1].replace("$top=", ""));
		}

		function handler1 (oEvent) {
			oBinding.detachChange(handler1);

			var spy = sinon.spy(oModel, "read");
			oBinding.attachChange(handler2);
			oBinding._loadChildren(oBinding.getNodeByIndex(1), 10, 50);
			oBinding._loadChildren(oBinding.getNodeByIndex(8), 10, 50);

			assert.equal(spy.callCount, 2, "Two _loadChildren() calls for different parents trigger Two requests");

			// First call
			assert.equal(getSkipFromCall(spy.args[0]), 10, "First call: Skip equals 10");
			assert.equal(getTopFromCall(spy.args[0]), 50, "First call: Top equals 50");

			// Second call
			assert.equal(getSkipFromCall(spy.args[1]), 10, "Second call: Skip equals 10");
			assert.equal(getTopFromCall(spy.args[1]), 50, "Second call: Top equals 50");
		}

		var callCount = 0;
		function handler2 (oEvent) {
			if (++callCount === 2) {
				oBinding.detachChange(handler2);
				done();
			}
		}

		oBinding.attachChange(handler1);
		loadData(oBinding, 0, 10, 0);
	});

	QUnit.test("Advanced Paging", function(assert){

		var done = assert.async();
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 0,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		function handler1 (oEvent) {
			oBinding.detachChange(handler1);

			// contexts should be now loaded
			var aContexts = oBinding.getContexts(0, 10, 0);
			assert.equal(aContexts.length, 10, "initially loaded context length is ok");

			// load second page (60 - 70)
			oBinding.attachChange(handler2);
			aContexts = oBinding.getContexts(60, 10, 0);
		}

		function handler2 (oEvent) {
			oBinding.detachChange(handler2);

			var aContexts = oBinding.getContexts(60, 10, 0);
			assert.equal(aContexts.length, 10, "Second page starting at 60 is loaded");

			var oContext = oBinding.getContextByIndex(6);
			assert.equal(oContext.getProperty("HIERARCHY_NODE"), "1007", "Entries of first page are loaded");

			oContext = oBinding.getContextByIndex(63);
			assert.equal(oContext.getProperty("HIERARCHY_NODE"), "1064", "Entries of second page are loaded");

			oContext = oBinding.getContextByIndex(33);
			assert.equal(oContext, undefined, "Entries in between pages are missing.");

			// fill gap overlapping the first page (0 - 10) --> (5 - 35)
			oBinding.attachChange(handler3);
			oBinding.getContexts(5, 20, 10);
		}

		function handler3 () {
			oBinding.detachChange(handler3);

			var oContext = oBinding.getContextByIndex(33);
			assert.equal(oContext.getProperty("HIERARCHY_NODE"), "1034", "Previously missing entry is now loaded");

			// check for last available entry in threshold
			oContext = oBinding.getContextByIndex(34);
			assert.equal(oContext.getProperty("HIERARCHY_NODE"), "1035", "Last entry before threshold end is loaded.");

			// end of threshold
			oContext = oBinding.getContextByIndex(35);
			assert.equal(oContext, undefined, "End of threshold reached.");

			// try to fill gaps at the top of the second page (60 - 70)
			oBinding.attachChange(handler4);
			oBinding.getContexts(45, 20, 0);
		}

		function handler4 () {
			oBinding.detachChange(handler4);

			// first entry of
			var oContext = oBinding.getContextByIndex(45);
			assert.equal(oContext.getProperty("HIERARCHY_NODE"), "1046", "Previously missing entry is now loaded");

			// Pages should now overlap
			oContext = oBinding.getContextByIndex(63);
			assert.equal(oContext.getProperty("HIERARCHY_NODE"), "1064", "End of threshold reached.");

			// missing entries after second page (60 - 70)
			oContext = oBinding.getContextByIndex(72);
			assert.equal(oContext, undefined, "End of threshold reached.");

			// close final gap between page one and two
			oBinding.attachChange(handler5);
			oBinding.getContexts(30, 20, 0);
		}

		function handler5 () {
			oBinding.detachChange(handler5);

			// check if every gap is filled and the other change handler is not triggered
			oBinding.attachChange(notCalledHandler);
			var aContexts = oBinding.getContexts(0, 70, 0);

			assert.equal(aContexts.length, 70, "Everything from 0 to 70 is loaded");

			done();
		}

		function notCalledHandler () {
			throw "Change-Handler should not be called!";
		}

		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 10, 0);
	});

	QUnit.test("Paging when collapsing nodes", function(assert){

		var done = assert.async();
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 0,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		// initial expand to level 2
		function handler1 (oEvent) {
			oBinding.detachChange(handler1);

			// contexts should be now loaded
			var aContexts = oBinding.getContexts(0, 10, 100);
			assert.equal(aContexts.length, 10, "initially loaded context length is ok");

			// collapse nodes 0, 1, 2, 3
			oBinding.collapse(0, true);
			oBinding.collapse(1, true);
			oBinding.collapse(2, true);

			oBinding.attachChange(handler2);
			oBinding.collapse(3);
		}

		function handler2 (oEvent) {
			oBinding.detachChange(handler2);

			// missing page should now be found and requested
			oBinding.attachChange(handler3);
			var aContexts = oBinding.getContexts(0, 10, 10);
			assert.equal(aContexts.length, 10, "Second page starting at 60 is loaded");

			assert.equal(oBinding.getLength(), 482, "Binding length is correct");

			// some data is already available
			var oContext = oBinding.getContextByIndex(0);
			assert.equal(oContext.getProperty("HIERARCHY_NODE"), "1001", "Collapsed Entry (0) is correct");
			assert.equal(oBinding.isExpanded(0), false, "Node (0) is collapsed");

			oContext = oBinding.getContextByIndex(3);
			assert.equal(oContext.getProperty("HIERARCHY_NODE"), "1062", "Collapsed Entry (3) is correct");
			assert.equal(oBinding.isExpanded(3), false, "Node (0) is collapsed");

			oContext = oBinding.getContextByIndex(4);
			assert.equal(oContext, undefined, "Node (4) not loaded yet");
		}

		function handler3 (oEvent) {
			oBinding.detachChange(handler3);

			var aContexts = oBinding.getContexts(0, 10, 10);

			assert.equal(aContexts[0].getProperty("HIERARCHY_NODE"), "1001", "First node is correct");
			assert.equal(aContexts[4].getProperty("HIERARCHY_NODE"), "1149", "5th node is correct");
			assert.equal(aContexts[6].getProperty("HIERARCHY_NODE"), "1151", "7th node is correct");

			// expand node 2 again
			oBinding.attachChange(handler4);
			oBinding.expand(2);
		}

		function handler4 () {
			oBinding.detachChange(handler4);

			var aContexts = oBinding.getContexts(0, 10, 10);

			assert.equal(aContexts[2].getProperty("HIERARCHY_NODE"), "1051", "3rd node is correct");
			assert.equal(aContexts[3].getProperty("HIERARCHY_NODE"), "1052", "4th node is correct");
			assert.equal(aContexts[6].getProperty("HIERARCHY_NODE"), "1055", "5th node is correct");

			// now scroll down to an unknown block
			oBinding.attachChange(handler5);
			oBinding.getContexts(117, 10, 10);
		}

		function handler5 () {
			oBinding.detachChange(handler5);

			var aContexts = oBinding.getContexts(117, 10, 10);

			assert.equal(aContexts[0].getProperty("HIERARCHY_NODE"), "1252", "First node is correct");
			assert.equal(aContexts[2].getProperty("HIERARCHY_NODE"), "1254", "3rd node is correct");
			assert.equal(aContexts[8].getProperty("HIERARCHY_NODE"), "1260", "7th node is correct");

			// now scroll down to an unknown block
			oBinding.getContexts(117, 10, 10);

			//oBinding.collapse()

			done();
		}

		oBinding.attachChange(handler1);
		requestData(oBinding, 0, 10, 100);
	});

	QUnit.test("Application Filters are sent", function(assert){

		var done = assert.async();
		createTreeBinding("/orgHierarchy", null,
			[new Filter("DESCRIPTION", "Contains", "x")],
			{
				threshold: 10,
				countMode: "Inline",
				operationMode: "Server",
				numberOfExpandedLevels: 2
			}
		);

		function changeHandler1 (oEvent) {
			oBinding.detachChange(changeHandler1);

			// contexts should be now loaded
			var aContexts = oBinding.getContexts(0, 20, 0);

			assert.equal(oBinding.getLength(), 345, "Length is ok -> filtered tree 1st time");

			assert.equal(aContexts[2].getProperty("HIERARCHY_NODE"), "1005", "Node Test is ok");
			assert.equal(aContexts[5].getProperty("HIERARCHY_NODE"), "1010", "Node Test is ok");

			// expand node 1005
			oBinding.expand(2);

			oBinding.attachChange(changeHandler2);
			oBinding.getContexts(0, 20, 0);
		}

		function changeHandler2 () {
			oBinding.detachChange(changeHandler2);

			var aContexts = oBinding.getContexts(0, 20, 0);

			assert.equal(oBinding.getLength(), 350, "Length after expand is ok -> filtered tree 1nd time");

			assert.equal(aContexts[5].getProperty("HIERARCHY_NODE"), "1634", "Expanded child node is correct (1634)");
			assert.equal(aContexts[7].getProperty("HIERARCHY_NODE"), "1636", "Expanded child node is correct (1636)");

			// refilter the tree binding --> leads to a refresh
			oBinding.attachRefresh(refreshHandler);
			oBinding.filter(new Filter("DESCRIPTION", "Contains", "w"), "Application");
		}

		function refreshHandler (oEvent) {
			// refresh event --> trigger data loading
			oBinding.detachRefresh(refreshHandler);
			oBinding.attachChange(changeHandler3);
			oBinding.getContexts(0, 20, 0);
		}

		function changeHandler3 () {
			oBinding.detachChange(changeHandler3);
			// newly filtered tree should be reloaded
			var aContexts = oBinding.getContexts(0, 20, 0);

			assert.equal(oBinding.getLength(), 331, "Length is ok -> filtered tree 2nd time");

			assert.equal(aContexts[2].getProperty("HIERARCHY_NODE"), "1004", "Node Test is ok - 2nd time filtered");
			assert.equal(aContexts[5].getProperty("HIERARCHY_NODE"), "1009", "Node Test is ok - 2nd time filtered");

			// after filtering index 2 should be a different node
			oBinding.expand(2);

			oBinding.attachChange(changeHandler4);
			oBinding.getContexts(0, 20, 10);
		}

		function changeHandler4 () {
			oBinding.detachChange(changeHandler4);

			var aContexts = oBinding.getContexts(0, 20, 0);

			assert.equal(oBinding.getLength(), 393, "Length after expand is ok -> filtered tree 2nd time");

			// data on index 5 and 7 should be different now
			assert.equal(aContexts[5].getProperty("HIERARCHY_NODE"), "2000", "Node Test is ok - 2nd time filtered");
			assert.equal(aContexts[7].getProperty("HIERARCHY_NODE"), "2002", "Node Test is ok - 2nd time filtered");

			done();
		}

		oBinding.attachChange(changeHandler1);
		requestData(oBinding, 0, 20, 10);
	});

	QUnit.test("getContexts: length falls back to model size limit", function(assert){

		var done = assert.async();
		oModel.setSizeLimit(9);
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 0,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		function handler1 (oEvent) {
			oBinding.detachChange(handler1);

			// contexts should be now loaded
			var aContexts = oBinding.getContexts(0);
			assert.equal(aContexts.length, 9, "initially loaded context length equals model size limit");
			done();
		}

		oBinding.attachChange(handler1);
		requestData(oBinding, 0);
	});
});

