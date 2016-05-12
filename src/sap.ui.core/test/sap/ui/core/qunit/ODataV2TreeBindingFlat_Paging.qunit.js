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

asyncTest("Initialize & Adapter check", function(){
	oModel.attachMetadataLoaded(function() {
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			select: "LEVEL,DRILLDOWN_STATE", //incomplete annotation set in $select
			numberOfExpandedLevels: 2
		});

		// API Check
		ok(oBinding.getContexts, "getContexts function is present");
		ok(oBinding.getNodes, "getNodes function is present");
		ok(oBinding.getLength, "getLength function is present");
		ok(oBinding.expand, "expand function is present");
		ok(oBinding.collapse, "collapse function is present");

		// $select validation
		equal(oBinding.mParameters.select, "LEVEL,DRILLDOWN_STATE,PARENT_NODE,HIERARCHY_NODE,MAGNITUDE", "$select is complete incl. Magnitude");

		start();
	});
});

asyncTest("Initial getContexts and Thresholding", function(){
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
			var aContexts = oBinding.getContexts(0, 10, 10);
			equal(aContexts.length, 10, "initially loaded context length is ok");

			var oContext = aContexts[0];
			equal(oContext.getProperty("LEVEL"), 0, "First node on LEVEL = 0");
			equal(oContext.getProperty("HIERARCHY_NODE"), "1001", "First Hierarchy Node is ok");

			oContext = aContexts[4];
			equal(oContext.getProperty("LEVEL"), 2, "5th node on LEVEL = 2");
			equal(oContext.getProperty("HIERARCHY_NODE"), "1005", "5th Hierarchy Node is ok");

			oContext = aContexts[8];
			equal(oContext.getProperty("LEVEL"), 1, "8th node on LEVEL = 1");
			equal(oContext.getProperty("HIERARCHY_NODE"), "1009", "8th Hierarchy Node is ok");

			var aContexts = oBinding.getContexts(10, 10, 0);
			equal(aContexts.length, 10, "second page is loaded via thresholding");

			start();
		};

		oBinding.attachChange(handler1);
		oBinding.getContexts(0, 10, 20);
	});
});

asyncTest("Simple Paging", function(){
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
			var aContexts = oBinding.getContexts(0, 10, 0);
			equal(aContexts.length, 10, "initially loaded context length is ok");

			oBinding.attachChange(handler2);
			var aContexts = oBinding.getContexts(60, 10, 0);
		};

		function handler2 (oEvent) {
			oBinding.detachChange(handler2);

			var aContexts = oBinding.getContexts(60, 10, 0);
			equal(aContexts.length, 10, "Second page starting at 60 is loaded");

			start();
		}

		oBinding.attachChange(handler1);
		oBinding.getContexts(0, 10, 20);
	});
});

asyncTest("Advanced Paging", function(){
	oModel.attachMetadataLoaded(function() {
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
			equal(aContexts.length, 10, "initially loaded context length is ok");

			// load second page (60 - 70)
			oBinding.attachChange(handler2);
			var aContexts = oBinding.getContexts(60, 10, 0);
		};

		function handler2 (oEvent) {
			oBinding.detachChange(handler2);

			var aContexts = oBinding.getContexts(60, 10, 0);
			equal(aContexts.length, 10, "Second page starting at 60 is loaded");

			var oContext = oBinding.getContextByIndex(6);
			equal(oContext.getProperty("HIERARCHY_NODE"), "1007", "Entries of first page are loaded");

			oContext = oBinding.getContextByIndex(63);
			equal(oContext.getProperty("HIERARCHY_NODE"), "1064", "Entries of second page are loaded");

			oContext = oBinding.getContextByIndex(33);
			equal(oContext, undefined, "Entries in between pages are missing.");

			// fill gap overlapping the first page (0 - 10) --> (5 - 35)
			oBinding.attachChange(handler3);
			oBinding.getContexts(5, 20, 10);
		}

		function handler3 () {
			oBinding.detachChange(handler3);

			oContext = oBinding.getContextByIndex(33);
			equal(oContext.getProperty("HIERARCHY_NODE"), "1034", "Previously missing entry is now loaded");

			// check for last available entry in threshold
			oContext = oBinding.getContextByIndex(34);
			equal(oContext.getProperty("HIERARCHY_NODE"), "1035", "Last entry before threshold end is loaded.");

			// end of threshold
			oContext = oBinding.getContextByIndex(35);
			equal(oContext, undefined, "End of threshold reached.");

			// try to fill gaps at the top of the second page (60 - 70)
			oBinding.attachChange(handler4);
			oBinding.getContexts(45, 20, 0);
		}

		function handler4 () {
			oBinding.detachChange(handler4);

			// first entry of
			oContext = oBinding.getContextByIndex(45);
			equal(oContext.getProperty("HIERARCHY_NODE"), "1046", "Previously missing entry is now loaded");

			// Pages should now overlap
			oContext = oBinding.getContextByIndex(63);
			equal(oContext.getProperty("HIERARCHY_NODE"), "1064", "End of threshold reached.");

			// missing entries after second page (60 - 70)
			oContext = oBinding.getContextByIndex(72);
			equal(oContext, undefined, "End of threshold reached.");

			// close final gap between page one and two
			oBinding.attachChange(handler5);
			oBinding.getContexts(30, 20, 0);
		}

		function handler5 () {
			oBinding.detachChange(handler5);

			// check if every gap is filled and the other change handler is not triggered
			oBinding.attachChange(notCalledHandler);
			var aContexts = oBinding.getContexts(0, 70, 0);

			equal(aContexts.length, 70, "Everything from 0 to 70 is loaded");

			start();
		}

		function notCalledHandler () {
			throw "Change-Handler should not be called!";
		}

		oBinding.attachChange(handler1);
		oBinding.getContexts(0, 10, 0);
	});
});

asyncTest("Paging when collapsing nodes", function(){
	oModel.attachMetadataLoaded(function() {
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
			equal(aContexts.length, 10, "initially loaded context length is ok");

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
			equal(aContexts.length, 10, "Second page starting at 60 is loaded");

			equal(oBinding.getLength(), 482, "Binding length is correct");

			// some data is already available
			var oContext = oBinding.getContextByIndex(0);
			equal(oContext.getProperty("HIERARCHY_NODE"), "1001", "Collapsed Entry (0) is correct");
			equal(oBinding.isExpanded(0), false, "Node (0) is collapsed");

			oContext = oBinding.getContextByIndex(3);
			equal(oContext.getProperty("HIERARCHY_NODE"), "1062", "Collapsed Entry (3) is correct");
			equal(oBinding.isExpanded(3), false, "Node (0) is collapsed");

			oContext = oBinding.getContextByIndex(4);
			equal(oContext, undefined, "Node (4) not loaded yet");
		}

		function handler3 (oEvent) {
			oBinding.detachChange(handler3);

			var aContexts = oBinding.getContexts(0, 10, 10);

			equals(aContexts[0].getProperty("HIERARCHY_NODE"), "1001", "First node is correct");
			equals(aContexts[4].getProperty("HIERARCHY_NODE"), "1149", "5th node is correct");
			equals(aContexts[6].getProperty("HIERARCHY_NODE"), "1151", "7th node is correct");

			// expand node 2 again
			oBinding.attachChange(handler4);
			oBinding.expand(2);
		}

		function handler4 () {
			oBinding.detachChange(handler4);

			var aContexts = oBinding.getContexts(0, 10, 10);

			equals(aContexts[2].getProperty("HIERARCHY_NODE"), "1051", "3rd node is correct");
			equals(aContexts[3].getProperty("HIERARCHY_NODE"), "1052", "4th node is correct");
			equals(aContexts[6].getProperty("HIERARCHY_NODE"), "1055", "5th node is correct");

			// now scroll down to an unknown block
			oBinding.attachChange(handler5);
			oBinding.getContexts(117, 10, 10);
		}

		function handler5 () {
			oBinding.detachChange(handler5);

			var aContexts = oBinding.getContexts(117, 10, 10);

			equals(aContexts[0].getProperty("HIERARCHY_NODE"), "1252", "First node is correct");
			equals(aContexts[2].getProperty("HIERARCHY_NODE"), "1254", "3rd node is correct");
			equals(aContexts[8].getProperty("HIERARCHY_NODE"), "1260", "7th node is correct");

			// now scroll down to an unknown block
			oBinding.getContexts(117, 10, 10);

			//oBinding.collapse()

			start();
		}

		oBinding.attachChange(handler1);
		oBinding.getContexts(0, 10, 100);
	});
});