module("Remove and reinsert", {
	setup: function() {
		fnSetupNewMockServer();
		oMockServer.start();
		oModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl, {
			useBatch:true,
			defaultUpdateMethod: "PUT"
		});
	},
	teardown: function() {
		oMockServer.stop();
		delete oModel;
	}
});

/**
 * Creates a simple spy for the OData.request function of the datajs library.
 * Used to check the internals of an OData.request.
 */
var fnSpyRequestsInDatajs = function (fnCallback) {
	// spy original function
	var fnDatajsRequest = OData.request;
	OData.request = function (oRequest, mParameters) {
		// ignore actual request sending if necessary
		// most of the time, we only care for the validity of the parameters
		if (!mParameters.suppressRequest) {
			fnDatajsRequest.apply(this, arguments);
		}

		// restore the original function
		OData.request = fnDatajsRequest;

		// get request information for spy
		var aRequests = oRequest.data.__batchRequests[0].__changeRequests;

		fnCallback(aRequests);
	};
};



/**
 * Counts the number of PUT, POST, etc. requests in the change-set.
 */
var fnCountRequestType = function (aRequests, sMethod) {
	var iTypeCount = 0;
	aRequests.forEach(function (oRequest) {
		if (oRequest.method == sMethod) {
			iTypeCount++;
		}
	});
	return iTypeCount;
};

asyncTest("Request Creation - CREATE & UPDATE", function(){
	oModel.attachMetadataLoaded(function() {
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		var oN1002, oN1029, oN1031;

		var aNewNodeIds = [],
			mMovedNodes = {};

		function handler1 (oEvent) {
			oBinding.detachChange(handler1);

			oN1002 = oBinding.findNode(1);
			oN1029 = oBinding.findNode(28);
			oN1031 = oBinding.findNode(30);

			var oNewContextA = oBinding.createEntry();

			oBinding.addContexts(oN1002.context, [oNewContextA]);
			aNewNodeIds.push(oNewContextA.getProperty("HIERARCHY_NODE"));

			var oNA = oBinding.findNode(2);

			var oNewContextB = oBinding.createEntry();
			var oNewContextC = oBinding.createEntry();

			oBinding.addContexts(oNA.context, [oNewContextB, oNewContextC]);
			aNewNodeIds.push(oNewContextB.getProperty("HIERARCHY_NODE"));
			aNewNodeIds.push(oNewContextC.getProperty("HIERARCHY_NODE"));

			oBinding.expand(2);

			var oHandleN1031 = oBinding.removeContext(oN1031.context);

			oBinding.addContexts(oNewContextC, oHandleN1031);
			mMovedNodes[oN1031.context.getProperty("HIERARCHY_NODE")] = oNewContextC.getProperty("HIERARCHY_NODE");

			oBinding.expand(4); // expand new node C

			var oNewContextD = oBinding.createEntry();

			oBinding.addContexts(oN1031.context, [oNewContextD]);
			aNewNodeIds.push(oNewContextD.getProperty("HIERARCHY_NODE"));

			oBinding.expand(5);

			oHandleN0129 = oBinding.removeContext(oN1029.context);

			oBinding.addContexts(oNewContextD, oHandleN0129);
			mMovedNodes[oN1029.context.getProperty("HIERARCHY_NODE")] = oNewContextD.getProperty("HIERARCHY_NODE");

			oBinding.expand(6);

			/*oModel.attachBatchRequestSent(function (o) {
				debugger;
			});*/

			fnSpyRequestsInDatajs(function (aRequests) {
				equals(aRequests.length, 6, "Number of Change Requests is correct.");
				equals(fnCountRequestType(aRequests, "POST"), 4, "Exactly 4 POST requests for CREATEs");
				equals(fnCountRequestType(aRequests, "PUT"), 2, "Exactly 2 PUT requests for UPDATEs");

				// check content
				equals(aRequests[0].method, "POST", "1st CREATE");
				equals(aRequests[1].method, "POST", "2nd CREATE");
				equals(aRequests[2].method, "POST", "3rd CREATE");
				equals(aRequests[3].method, "POST", "4th CREATE");
				equals(aRequests[4].method, "PUT", "1st UPDATE");
				equals(aRequests[5].method, "PUT", "2nd UPDATE");

				// check the correct ordering of created nodes
				// check the validity of the annotated HIERARCHY_NODE properties in the request
				equals(aRequests[0].data["HIERARCHY_NODE"], aNewNodeIds[0], "1st CREATED key is correct");
				equals(aRequests[1].data["HIERARCHY_NODE"], aNewNodeIds[1], "2nd CREATED key is correct");
				equals(aRequests[2].data["HIERARCHY_NODE"], aNewNodeIds[2], "3rd CREATED key is correct");
				equals(aRequests[3].data["HIERARCHY_NODE"], aNewNodeIds[3], "4th CREATED key is correct");

				// check the parents of the created nodes
				equals(aRequests[0].data["PARENT_NODE"], "1002", "1st CREATED parent is correct"); // child of 1031
				equals(aRequests[1].data["PARENT_NODE"], aNewNodeIds[0], "2nd CREATED parent is correct"); // child of 1st new created node
				equals(aRequests[2].data["PARENT_NODE"], aNewNodeIds[0], "3rd CREATED parent is correct"); // also a child of 1st new created node
				equals(aRequests[3].data["PARENT_NODE"], "1031", "4th CREATED parent is correct"); //child of 1031

				// check if the correct nodes have been updated in the correct order
				equals(aRequests[4].requestUri, "orgHierarchy('1031')", "1st UPDATE is on correct node");
				equals(aRequests[5].requestUri, "orgHierarchy('1029')", "2nd UPDATE is on correct node");

				// check if the parent nodes are correctly updated to the newly created nodes
				equals(aRequests[4].data["PARENT_NODE"], aNewNodeIds[2], "1st UPDATED node parent is correct"); //child of 3rd newly created node
				equals(aRequests[5].data["PARENT_NODE"], aNewNodeIds[3], "1st UPDATED node parent is correct"); //child of 4th newly created node

				start();
			}, {suppressRequest: true});

			oBinding.submitChanges();
		}

		oBinding.attachChange(handler1);
		oBinding.getContexts(0, 100, 0);
	});
});

asyncTest("Request Creation - CREATE & UPDATE & DELETE", function(){
	oModel.attachMetadataLoaded(function() {
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		var oN1002, oN1029, oN1031;

		function handler1 (oEvent) {
			oBinding.detachChange(handler1);

			oN1002 = oBinding.findNode(1);
			oN1029 = oBinding.findNode(28);
			oN1031 = oBinding.findNode(30);

			var oNewContextA = oBinding.createEntry();

			oBinding.addContexts(oN1002.context, [oNewContextA]);

			var oNA = oBinding.findNode(2);

			var oNewContextB = oBinding.createEntry();
			var oNewContextC = oBinding.createEntry();

			oBinding.addContexts(oNA.context, [oNewContextB, oNewContextC]);

			oBinding.expand(2);

			var oHandleN1031 = oBinding.removeContext(oN1031.context);

			oBinding.addContexts(oNewContextC, oHandleN1031);

			oBinding.expand(4); // expand node C

			var oNewContextD = oBinding.createEntry();

			oBinding.addContexts(oN1031.context, [oNewContextD]);

			oBinding.expand(5);

			oHandleN0129 = oBinding.removeContext(oN1029.context);

			oBinding.addContexts(oNewContextD, oHandleN0129);

			oBinding.expand(6);

			oBinding.removeContext(oN1002.context);

			// Check Requests
			fnSpyRequestsInDatajs(function (aRequests) {
				equals(aRequests.length, 2, "Number of Change Requests is correct.");
				equals(fnCountRequestType(aRequests, "DELETE"), 2, "Exactly 2 DELETE requests.");

				// Note: the order of the delete requests is important. This should always be ensured in tests!
				equals(aRequests[0].requestUri, "orgHierarchy('1002')", "First deleted node is 1002.");
				equals(aRequests[1].requestUri, "orgHierarchy('1029')", "Second deleted node is 1029.");

				start();
			}, {suppressRequest: true});

			oBinding.submitChanges();
		}

		oBinding.attachChange(handler1);
		oBinding.getContexts(0, 100, 0);
	});
});

asyncTest("Request Creation - DELETE - 1", function(){
	oModel.attachMetadataLoaded(function() {
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		var oN1001, oN1005, oN1630, oN1636;

		function handler1 (oEvent) {
			oBinding.detachChange(handler1);

			oBinding.attachChange(handler2);

			oN1001 = oBinding.findNode(0);
			oN1005 = oBinding.findNode(4);
			oBinding.expand(oN1005);
		}

		function handler2 () {
			oBinding.detachChange(handler2);

			oN1630 = oBinding.findNode(5);
			oN1636 = oBinding.findNode(11);

			oBinding.removeContext(oN1630.context);
			oBinding.removeContext(oN1001.context);

			// Check Requests
			fnSpyRequestsInDatajs(function (aRequests) {
				equals(aRequests.length, 1, "Number of Change Requests is correct.");
				equals(fnCountRequestType(aRequests, "DELETE"), 1, "Exactly 1 DELETE requests.");

				// Note: the order of the delete requests is important. This should always be ensured in tests!
				equals(aRequests[0].requestUri, "orgHierarchy('1001')", "First deleted node is 1001.");

				start();
			}, {suppressRequest: true});

			oBinding.submitChanges();
		}

		oBinding.attachChange(handler1);
		oBinding.getContexts(0, 100, 0);
	});
});

asyncTest("Request Creation - DELETE - 2", function(){
	oModel.attachMetadataLoaded(function() {
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		var oN1001, oN1005, oN1630, oN1638;

		function handler1 (oEvent) {
			oBinding.detachChange(handler1);

			oN1005 = oBinding.findNode(4);
			oBinding.expand(oN1005);

			// register change event for loading the expanded children
			oBinding.attachChange(handler2);
		}

		function handler2 () {
			oBinding.detachChange(handler2);

			oN1630 = oBinding.findNode(5);
			oBinding.expand(oN1630);

			// register change event for loading the expanded children
			oBinding.attachChange(handler3);
		}

		function handler3 () {
			oBinding.detachChange(handler3);

			oN1638 = oBinding.findNode(6);

			oBinding.removeContext(oN1638.context);
			oBinding.removeContext(oN1630.context);

			// Check Requests
			fnSpyRequestsInDatajs(function (aRequests) {
				equals(aRequests.length, 1, "Number of Change Requests is correct.");
				equals(fnCountRequestType(aRequests, "DELETE"), 1, "Exactly 1 DELETE requests.");

				// Note: the order of the delete requests is important. This should always be ensured in tests!
				equals(aRequests[0].requestUri, "orgHierarchy('1630')", "First deleted node is 1630.");

				start();
			}, {suppressRequest: true});

			oBinding.submitChanges();
		}

		oBinding.attachChange(handler1);
		oBinding.getContexts(0, 100, 0);
	});
});

asyncTest("Request Creation - Refresh after Success - Event-Timing", function(){
	oModel.attachMetadataLoaded(function() {
		createTreeBinding("/orgHierarchy", null, [], {
			threshold: 10,
			countMode: "Inline",
			operationMode: "Server",
			numberOfExpandedLevels: 2
		});

		var oN1001, oN1005, oN1630, oN1638;

		function handler1 (oEvent) {
			oBinding.detachChange(handler1);

			oN1005 = oBinding.findNode(4);
			oBinding.expand(oN1005);

			// register change event for loading the expanded children
			oBinding.attachChange(handler2);
		}

		function handler2 () {
			oBinding.detachChange(handler2);

			oN1630 = oBinding.findNode(5);
			oBinding.expand(oN1630);

			// register change event for loading the expanded children
			oBinding.attachChange(handler3);
		}

		function handler3 () {
			oBinding.detachChange(handler3);

			oN1638 = oBinding.findNode(6);

			oBinding.removeContext(oN1638.context);
			oBinding.removeContext(oN1630.context);

			// check if requests were sent
			fnSpyRequestsInDatajs(function (aRequests) {
				equals(aRequests.length, 1, "Number of Change Requests is correct.");
				equals(fnCountRequestType(aRequests, "DELETE"), 1, "Exactly 1 DELETE requests.");

				// Note: the order of the delete requests is important. This should always be ensured in tests!
				equals(aRequests[0].requestUri, "orgHierarchy('1630')", "First deleted node is 1630.");
			}, {suppressRequest: false});

			var bSuccessBeforeRefresh = false;

			// check if refresh was fired after the success handler of the application
			oBinding.attachRefresh(function () {
				ok(bSuccessBeforeRefresh, "Refresh fired after successful submitChanges.");
				start();
			});

			// check the application's success handler call
			oBinding.submitChanges({
				success: function (oBatchResponse) {
					ok("Application success handler called for submitted change-request");
					equals(oBatchResponse.__batchResponses[0].__changeResponses[0].statusCode, "204", "Status-Code 204: Successful change request.");

					bSuccessBeforeRefresh = true;
				}
			});
		}

		oBinding.attachChange(handler1);
		oBinding.getContexts(0, 100, 0);
	});
});

