import uid from "sap/base/util/uid";
import MockServer from "sap/ui/core/util/MockServer";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
var oModel, oBinding, oMockServer;
var sServiceUrl = "/odataFake/";
var fnSetupNewMockServer = function () {
    if (oMockServer) {
        oMockServer.stop();
        oMockServer.destroy();
    }
    oMockServer = new MockServer({
        rootUri: sServiceUrl
    });
    oMockServer.simulate("test-resources/sap/ui/core/qunit/model/metadata_orgHierarchy.xml", "test-resources/sap/ui/core/qunit/model/orgHierarchy/");
    oMockServer.start();
};
function createTreeBinding(sPath, oContext, aFilters, mParameters, aSorters) {
    oBinding = oModel.bindTree(sPath, oContext, aFilters, mParameters, aSorters).initialize();
    oModel.addBinding(oBinding);
}
function requestData(oBinding, iStartIndex, iLength, iThreshold) {
    oBinding.attachEventOnce("refresh", function () {
        oBinding.getContexts(iStartIndex, iLength, iThreshold);
    });
}
QUnit.module("Remove and reinsert", {
    beforeEach: function () {
        fnSetupNewMockServer();
        oMockServer.start();
        oModel = new ODataModel(sServiceUrl, {
            useBatch: true,
            defaultUpdateMethod: "PUT"
        });
        return oModel.metadataLoaded();
    },
    afterEach: function () {
        oMockServer.stop();
        oModel.destroy();
    }
});
var fnSpyRequestsInDatajs = function (fnCallback) {
    var fnDatajsRequest = OData.request;
    OData.request = function (oRequest, mParameters) {
        OData.request = fnDatajsRequest;
        var aChangeRequests = oRequest.data.__batchRequests[0].__changeRequests;
        var aAllRequests = oRequest.data.__batchRequests;
        fnCallback(aChangeRequests, aAllRequests);
        if (!mParameters.suppressRequest) {
            fnDatajsRequest.apply(this, arguments);
        }
    };
};
var ensureCorrectChangeGroup = function () {
    var sTreeChangeGroup = "sapTreeHM-" + uid();
    var mChangeGroups = oModel.getChangeGroups();
    var sEntityType = "orgHierarchyType";
    if (!mChangeGroups[sEntityType]) {
        mChangeGroups[sEntityType] = {
            groupId: sTreeChangeGroup,
            single: false
        };
        oModel.setChangeGroups(mChangeGroups);
        oModel.setDeferredGroups([sTreeChangeGroup]);
    }
};
var fnCountRequestType = function (aRequests, sMethod) {
    var iTypeCount = 0;
    aRequests.forEach(function (oRequest) {
        if (oRequest.method == sMethod) {
            iTypeCount++;
        }
    });
    return iTypeCount;
};
QUnit.test("Request Creation - CREATE & UPDATE", function (assert) {
    var done = assert.async();
    createTreeBinding("/orgHierarchy", null, [], {
        threshold: 10,
        countMode: "Inline",
        operationMode: "Server",
        numberOfExpandedLevels: 2
    });
    var oN1002, oN1029, oN1031;
    var aNewNodeIds = [];
    function handler1(oEvent) {
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
        oBinding.expand(4);
        var oNewContextD = oBinding.createEntry();
        oBinding.addContexts(oN1031.context, [oNewContextD]);
        aNewNodeIds.push(oNewContextD.getProperty("HIERARCHY_NODE"));
        oBinding.expand(5);
        var oHandleN0129 = oBinding.removeContext(oN1029.context);
        oBinding.addContexts(oNewContextD, oHandleN0129);
        oBinding.expand(6);
        fnSpyRequestsInDatajs(function (aRequests) {
            assert.equal(aRequests.length, 6, "Number of Change Requests is correct.");
            assert.equal(fnCountRequestType(aRequests, "POST"), 4, "Exactly 4 POST requests for CREATEs");
            assert.equal(fnCountRequestType(aRequests, "PUT"), 2, "Exactly 2 PUT requests for UPDATEs");
            assert.equal(aRequests[0].method, "POST", "1st CREATE");
            assert.equal(aRequests[1].method, "POST", "2nd CREATE");
            assert.equal(aRequests[2].method, "POST", "3rd CREATE");
            assert.equal(aRequests[3].method, "POST", "4th CREATE");
            assert.equal(aRequests[4].method, "PUT", "1st UPDATE");
            assert.equal(aRequests[5].method, "PUT", "2nd UPDATE");
            assert.equal(aRequests[0].data["HIERARCHY_NODE"], aNewNodeIds[0], "1st CREATED key is correct");
            assert.equal(aRequests[1].data["HIERARCHY_NODE"], aNewNodeIds[1], "2nd CREATED key is correct");
            assert.equal(aRequests[2].data["HIERARCHY_NODE"], aNewNodeIds[2], "3rd CREATED key is correct");
            assert.equal(aRequests[3].data["HIERARCHY_NODE"], aNewNodeIds[3], "4th CREATED key is correct");
            assert.equal(aRequests[0].data["PARENT_NODE"], "1002", "1st CREATED parent is correct");
            assert.equal(aRequests[1].data["PARENT_NODE"], aNewNodeIds[0], "2nd CREATED parent is correct");
            assert.equal(aRequests[2].data["PARENT_NODE"], aNewNodeIds[0], "3rd CREATED parent is correct");
            assert.equal(aRequests[3].data["PARENT_NODE"], "1031", "4th CREATED parent is correct");
            assert.equal(aRequests[4].requestUri, "orgHierarchy('1031')", "1st UPDATE is on correct node");
            assert.equal(aRequests[5].requestUri, "orgHierarchy('1029')", "2nd UPDATE is on correct node");
            assert.equal(aRequests[4].data["PARENT_NODE"], aNewNodeIds[2], "1st UPDATED node parent is correct");
            assert.equal(aRequests[5].data["PARENT_NODE"], aNewNodeIds[3], "1st UPDATED node parent is correct");
            done();
        }, { suppressRequest: true });
        oBinding.submitChanges();
    }
    oBinding.attachChange(handler1);
    requestData(oBinding, 0, 100, 0);
});
QUnit.test("Request Creation - CREATE & UPDATE & DELETE", function (assert) {
    var done = assert.async();
    createTreeBinding("/orgHierarchy", null, [], {
        threshold: 10,
        countMode: "Inline",
        operationMode: "Server",
        numberOfExpandedLevels: 2
    });
    var oN1002, oN1029, oN1031;
    function handler1(oEvent) {
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
        oBinding.expand(4);
        var oNewContextD = oBinding.createEntry();
        oBinding.addContexts(oN1031.context, [oNewContextD]);
        oBinding.expand(5);
        var oHandleN0129 = oBinding.removeContext(oN1029.context);
        oBinding.addContexts(oNewContextD, oHandleN0129);
        oBinding.expand(6);
        oBinding.removeContext(oN1002.context);
        fnSpyRequestsInDatajs(function (aRequests) {
            assert.equal(aRequests.length, 2, "Number of Change Requests is correct.");
            assert.equal(fnCountRequestType(aRequests, "DELETE"), 2, "Exactly 2 DELETE requests.");
            assert.equal(aRequests[0].requestUri, "orgHierarchy('1002')", "First deleted node is 1002.");
            assert.equal(aRequests[1].requestUri, "orgHierarchy('1029')", "Second deleted node is 1029.");
            done();
        }, { suppressRequest: true });
        oBinding.submitChanges();
    }
    oBinding.attachChange(handler1);
    requestData(oBinding, 0, 100, 0);
});
QUnit.test("Request Creation - DELETE - 1", function (assert) {
    var done = assert.async();
    createTreeBinding("/orgHierarchy", null, [], {
        threshold: 10,
        countMode: "Inline",
        operationMode: "Server",
        numberOfExpandedLevels: 2
    });
    var oN1001, oN1005, oN1630;
    function handler1(oEvent) {
        oBinding.detachChange(handler1);
        oBinding.attachChange(handler2);
        oN1001 = oBinding.findNode(0);
        oN1005 = oBinding.findNode(4);
        oBinding.expand(oN1005);
    }
    function handler2() {
        oBinding.detachChange(handler2);
        oN1630 = oBinding.findNode(5);
        oBinding.findNode(11);
        oBinding.removeContext(oN1630.context);
        oBinding.removeContext(oN1001.context);
        fnSpyRequestsInDatajs(function (aRequests) {
            assert.equal(aRequests.length, 1, "Number of Change Requests is correct.");
            assert.equal(fnCountRequestType(aRequests, "DELETE"), 1, "Exactly 1 DELETE requests.");
            assert.equal(aRequests[0].requestUri, "orgHierarchy('1001')", "First deleted node is 1001.");
            done();
        }, { suppressRequest: true });
        oBinding.submitChanges();
    }
    oBinding.attachChange(handler1);
    requestData(oBinding, 0, 100, 0);
});
QUnit.test("Request Creation - DELETE - 2", function (assert) {
    var done = assert.async();
    createTreeBinding("/orgHierarchy", null, [], {
        threshold: 10,
        countMode: "Inline",
        operationMode: "Server",
        numberOfExpandedLevels: 2
    });
    var oN1005, oN1630, oN1638;
    function handler1(oEvent) {
        oBinding.detachChange(handler1);
        oN1005 = oBinding.findNode(4);
        oBinding.expand(oN1005);
        oBinding.attachChange(handler2);
    }
    function handler2() {
        oBinding.detachChange(handler2);
        oN1630 = oBinding.findNode(5);
        oBinding.expand(oN1630);
        oBinding.attachChange(handler3);
    }
    function handler3() {
        oBinding.detachChange(handler3);
        oN1638 = oBinding.findNode(6);
        oBinding.removeContext(oN1638.context);
        oBinding.removeContext(oN1630.context);
        fnSpyRequestsInDatajs(function (aRequests) {
            assert.equal(aRequests.length, 1, "Number of Change Requests is correct.");
            assert.equal(fnCountRequestType(aRequests, "DELETE"), 1, "Exactly 1 DELETE requests.");
            assert.equal(aRequests[0].requestUri, "orgHierarchy('1630')", "First deleted node is 1630.");
            done();
        }, { suppressRequest: true });
        oBinding.submitChanges();
    }
    oBinding.attachChange(handler1);
    requestData(oBinding, 0, 100, 0);
});
QUnit.test("Request Creation - DELETE - 3 - deep to initially collapsed", function (assert) {
    var done = assert.async();
    createTreeBinding("/orgHierarchy", null, [], {
        threshold: 10,
        countMode: "Inline",
        operationMode: "Server",
        numberOfExpandedLevels: 2
    });
    var oN1005, oN1630, oN1633;
    function handler1(oEvent) {
        oBinding.detachChange(handler1);
        oN1005 = oBinding.findNode(4);
        oBinding.expand(oN1005);
        oBinding.attachChange(handler2);
    }
    function handler2() {
        oBinding.detachChange(handler2);
        oN1630 = oBinding.findNode(5);
        oN1633 = oBinding.findNode(8);
        oBinding.removeContext(oN1633.context);
        oBinding.addContexts(oN1630.context, oN1633.context);
        oBinding.removeContext(oN1630.context);
        fnSpyRequestsInDatajs(function (aRequests) {
            assert.equal(aRequests.length, 2, "Number of Change Requests is correct.");
            assert.equal(fnCountRequestType(aRequests, "DELETE"), 2, "Exactly 1 DELETE requests.");
            assert.equal(aRequests[0].requestUri, "orgHierarchy('1633')", "First deleted node is 1633.");
            assert.equal(aRequests[1].requestUri, "orgHierarchy('1630')", "First deleted node is 1630.");
            done();
        }, { suppressRequest: true });
        oBinding.submitChanges();
    }
    oBinding.attachChange(handler1);
    requestData(oBinding, 0, 100, 0);
});
QUnit.test("Request Creation - DELETE - 3 - in to deep", function (assert) {
    var done = assert.async();
    createTreeBinding("/orgHierarchy", null, [], {
        threshold: 10,
        countMode: "Inline",
        operationMode: "Server",
        numberOfExpandedLevels: 2
    });
    var oN1005, oN1630, oN1632, oN1642;
    function handler1(oEvent) {
        oBinding.detachChange(handler1);
        oN1005 = oBinding.findNode(4);
        oBinding.expand(oN1005);
        oBinding.attachChange(handler2);
    }
    function handler2() {
        oBinding.detachChange(handler2);
        oN1632 = oBinding.findNode(7);
        oBinding.expand(oN1632);
        oBinding.attachChange(handler3);
    }
    function handler3() {
        oBinding.detachChange(handler3);
        oN1630 = oBinding.findNode(5);
        oN1642 = oBinding.findNode(9);
        oBinding.removeContext(oN1642.context);
        oBinding.addContexts(oN1630.context, oN1642.context);
        oBinding.removeContext(oN1630.context);
        fnSpyRequestsInDatajs(function (aRequests) {
            assert.equal(aRequests.length, 2, "Number of Change Requests is correct.");
            assert.equal(fnCountRequestType(aRequests, "DELETE"), 2, "Exactly 1 DELETE requests.");
            assert.equal(aRequests[0].requestUri, "orgHierarchy('1630')", "First deleted node is 1630.");
            assert.equal(aRequests[1].requestUri, "orgHierarchy('1642')", "First deleted node is 1642.");
            done();
        }, { suppressRequest: true });
        oBinding.submitChanges();
    }
    oBinding.attachChange(handler1);
    requestData(oBinding, 0, 100, 0);
});
QUnit.test("Request Creation - Refresh after Success - Event-Timing", function (assert) {
    var done = assert.async();
    createTreeBinding("/orgHierarchy", null, [], {
        threshold: 10,
        countMode: "Inline",
        operationMode: "Server",
        numberOfExpandedLevels: 2
    });
    ensureCorrectChangeGroup();
    var oN1005, oN1630, oN1638;
    function handler1(oEvent) {
        oBinding.detachChange(handler1);
        oN1005 = oBinding.findNode(4);
        oBinding.expand(oN1005);
        oBinding.attachChange(handler2);
    }
    function handler2() {
        oBinding.detachChange(handler2);
        oN1630 = oBinding.findNode(5);
        oBinding.expand(oN1630);
        oBinding.attachChange(handler3);
    }
    function handler3() {
        oBinding.detachChange(handler3);
        oN1638 = oBinding.findNode(6);
        oBinding.removeContext(oN1638.context);
        oBinding.removeContext(oN1630.context);
        var oNewContext = oBinding.createEntry();
        oBinding.addContexts(oN1005.context, [oNewContext]);
        fnSpyRequestsInDatajs(function (aChangeRequests, aOtherRequests) {
            assert.equal(aChangeRequests.length, 2, "Number of Change Requests is correct.");
            assert.equal(fnCountRequestType(aChangeRequests, "DELETE"), 1, "Exactly 1 DELETE requests.");
            assert.equal(fnCountRequestType(aChangeRequests, "POST"), 1, "Exactly 1 CREATE/POST requests.");
            assert.equal(aChangeRequests[0].requestUri, "orgHierarchy", "Newly created node is POSTed against the collection.");
            assert.equal(aChangeRequests[0].data.PARENT_NODE, "1005", "Newly created node has correct parent node value.");
            assert.equal(aChangeRequests[1].requestUri, "orgHierarchy('1630')", "First deleted node is 1630.");
        }, { suppressRequest: false });
        var bSuccessBeforeRefresh = false;
        oBinding.attachRefresh(function () {
            assert.ok(bSuccessBeforeRefresh, "Refresh fired after successful submitChanges.");
            done();
        });
        oBinding.submitChanges({
            success: function (oBatchResponse) {
                assert.ok("Application success handler called for submitted change-request");
                assert.equal(oBatchResponse.__batchResponses[0].__changeResponses[0].statusCode, "201", "Status-Code 201: Successful CREATE/POST request.");
                assert.equal(oBatchResponse.__batchResponses[0].__changeResponses[1].statusCode, "204", "Status-Code 204: Successful DELETE request.");
                bSuccessBeforeRefresh = true;
            }
        });
    }
    oBinding.attachChange(handler1);
    requestData(oBinding, 0, 100, 0);
});
QUnit.test("Request Creation - No Refresh after Error - Event-Timing", function (assert) {
    var done = assert.async();
    createTreeBinding("/orgHierarchy", null, [], {
        threshold: 10,
        countMode: "Inline",
        operationMode: "Server",
        numberOfExpandedLevels: 2
    });
    ensureCorrectChangeGroup();
    var oN1005, oN1630, oN1638;
    function handler1(oEvent) {
        oBinding.detachChange(handler1);
        oN1005 = oBinding.findNode(4);
        oBinding.expand(oN1005);
        oBinding.attachChange(handler2);
    }
    function handler2() {
        oBinding.detachChange(handler2);
        oN1630 = oBinding.findNode(5);
        oBinding.expand(oN1630);
        oBinding.attachChange(handler3);
    }
    function handler3() {
        oBinding.detachChange(handler3);
        oN1638 = oBinding.findNode(6);
        oBinding.removeContext(oN1638.context);
        oBinding.removeContext(oN1630.context);
        var oNewContext = oBinding.createEntry();
        oBinding.addContexts(oN1005.context, [oNewContext]);
        fnSpyRequestsInDatajs(function (aChangeRequests, aOtherRequests) {
            aChangeRequests[0].requestUri = "foo";
        }, { suppressRequest: false });
        var bNoRefresh = true;
        oBinding.attachRefresh(function () {
            bNoRefresh = false;
        });
        oBinding.submitChanges({
            success: function (oBatchResponse) {
                assert.ok("Application success handler called for submitted change-request");
                assert.equal(oBatchResponse.__batchResponses[0].response.statusCode, "404", "Error returned by the MockServer");
                assert.ok(bNoRefresh, "No Refresh was fired after a broken change-request");
                done();
            }
        });
    }
    oBinding.attachChange(handler1);
    requestData(oBinding, 0, 100, 0);
});
QUnit.test("addContexts() & removeContext() API - Array Arguments and Requests", function (assert) {
    var done = assert.async();
    createTreeBinding("/orgHierarchy", null, [], {
        threshold: 10,
        countMode: "Inline",
        operationMode: "Server",
        numberOfExpandedLevels: 2
    });
    var oN1004, oN1009, oN1011;
    function handler1(oEvent) {
        oBinding.detachChange(handler1);
        oN1004 = oBinding.findNode(3);
        oN1009 = oBinding.findNode(8);
        oN1011 = oBinding.findNode(10);
        var oCtx1004 = oBinding.removeContext(oN1004.context);
        var oCtx1009 = oBinding.removeContext(oN1009.context);
        var oCtxA = oBinding.createEntry();
        var oCtxB = oBinding.createEntry();
        oBinding.addContexts(oN1011.context, [oCtxA, oCtx1004, oCtxB, oCtx1009]);
        oBinding.expand(7);
        assert.equal(oBinding.getContextByIndex(8), oCtxA, "1st added context is correct.");
        assert.equal(oBinding.getContextByIndex(9), oN1004.context, "2nd added context is correct.");
        assert.equal(oBinding.getContextByIndex(10), oCtxB, "3rd added context is correct.");
        assert.equal(oBinding.getContextByIndex(11), oN1009.context, "4th added context is correct.");
        done();
    }
    oBinding.attachChange(handler1);
    requestData(oBinding, 0, 100, 0);
});
QUnit.test("abortPendingRequest - Aborts all pending requests", function (assert) {
    var done = assert.async();
    createTreeBinding("/orgHierarchy", null, [], {
        threshold: 10,
        countMode: "Inline",
        operationMode: "Server",
        numberOfExpandedLevels: 2
    });
    var iAbortCalled = 0;
    var oFakeRequest = {
        oRequestHandle: {
            abort: function () {
                iAbortCalled++;
            }
        }
    };
    oBinding.attachEventOnce("refresh", function () {
        oBinding._aPendingRequests = [oFakeRequest, oFakeRequest];
        oBinding._aPendingChildrenRequests = [oFakeRequest, oFakeRequest];
        oBinding._abortPendingRequest();
        assert.equal(iAbortCalled, 4, "All four fake requests got aborted");
        assert.equal(oBinding._aPendingRequests.length, 0, "There are no more pending requests");
        assert.equal(oBinding._aPendingChildrenRequests.length, 0, "There are no more pending children requests");
        done();
    });
});
QUnit.test("Reset followed by Request - Should fire a single pair of data* events", function (assert) {
    var done = assert.async();
    createTreeBinding("/orgHierarchy", null, [], {
        threshold: 10,
        countMode: "Inline",
        operationMode: "Server",
        numberOfExpandedLevels: 2
    });
    var fireDataRequestedSpy = sinon.spy(oBinding, "fireDataRequested");
    var fireDataReceivedSpy = sinon.spy(oBinding, "fireDataReceived");
    function handler1(oEvent) {
        oBinding.detachChange(handler1);
        var aContexts = oBinding.getContexts(0, 10, 20);
        assert.equal(aContexts.length, 10, "Correct context is loaded");
        window.setTimeout(function () {
            assert.equal(fireDataRequestedSpy.callCount, 1, "fireDataRequested fired once");
            assert.equal(fireDataReceivedSpy.callCount, 1, "fireDataReceivedSpy fired once");
            done();
        }, 100);
    }
    oBinding.attachChange(handler1);
    oBinding.attachEventOnce("refresh", function () {
        oBinding.getContexts(0, 10, 20);
        oBinding.resetData();
        oBinding.getContexts(0, 10, 20);
    });
});