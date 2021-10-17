import Log from "sap/base/Log";
import SyncPromise from "sap/ui/base/SyncPromise";
import Element from "sap/ui/core/Element";
import Message from "sap/ui/core/message/Message";
import Binding from "sap/ui/model/Binding";
import BindingMode from "sap/ui/model/BindingMode";
import BaseContext from "sap/ui/model/Context";
import Model from "sap/ui/model/Model";
import OperationMode from "sap/ui/model/odata/OperationMode";
import TypeString from "sap/ui/model/odata/type/String";
import Context from "sap/ui/model/odata/v4/Context";
import ODataMetaModel from "sap/ui/model/odata/v4/ODataMetaModel";
import ODataModel from "sap/ui/model/odata/v4/ODataModel";
import SubmitMode from "sap/ui/model/odata/v4/SubmitMode";
import _Helper from "sap/ui/model/odata/v4/lib/_Helper";
import _MetadataRequestor from "sap/ui/model/odata/v4/lib/_MetadataRequestor";
import _Parser from "sap/ui/model/odata/v4/lib/_Parser";
import _Requestor from "sap/ui/model/odata/v4/lib/_Requestor";
import TestUtils from "sap/ui/test/TestUtils";
import library from "sap/ui/core/library";
var MessageType = library.MessageType;
var sClassName = "sap.ui.model.odata.v4.ODataModel", mFixture = {
    "TEAMS('TEAM_01')/Name": { "message": { "value": "Business Suite" } },
    "TEAMS('UNKNOWN')": { code: 404, source: "TEAMS('UNKNOWN').json" }
}, sServiceUrl = "/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/", TestControl = Element.extend("test.sap.ui.model.odata.v4.ODataModel", {
    metadata: {
        properties: {
            text: "string"
        }
    }
});
function getServiceUrl(sPath) {
    return sServiceUrl + (sPath && sPath.slice(1) || "");
}
QUnit.module("sap.ui.model.odata.v4.ODataModel", {
    beforeEach: function () {
        TestUtils.setupODataV4Server(this._oSandbox, mFixture, undefined, sServiceUrl);
        this.oLogMock = this.mock(Log);
        this.oLogMock.expects("warning").never();
        this.oLogMock.expects("error").never();
        this.mock(sap.ui.getCore().getConfiguration()).expects("getLanguageTag").atLeast(0).returns("ab-CD");
    },
    afterEach: function () {
        return TestUtils.awaitRendering();
    },
    createModel: function (sQuery, mParameters, bAllowPrerenderingTasks) {
        var oModel = new ODataModel(Object.assign({}, mParameters, {
            serviceUrl: getServiceUrl() + (sQuery || ""),
            synchronizationMode: "None"
        }));
        if (!bAllowPrerenderingTasks) {
            this.stub(oModel, "addPrerenderingTask");
        }
        return oModel;
    }
});
QUnit.test("basics", function (assert) {
    var oModel;
    assert.throws(function () {
        return new ODataModel();
    }, new Error("Synchronization mode must be 'None'"));
    assert.throws(function () {
        return new ODataModel({ synchronizationMode: "None" });
    }, new Error("Missing service root URL"));
    assert.throws(function () {
        return new ODataModel({ serviceUrl: "/foo", synchronizationMode: "None" });
    }, new Error("Service root URL must end with '/'"));
    assert.throws(function () {
        return new ODataModel({ synchronizationMode: "None", useBatch: true });
    }, new Error("Unsupported parameter: useBatch"));
    assert.throws(function () {
        return new ODataModel({ operationMode: OperationMode.Auto, serviceUrl: "/foo/", synchronizationMode: "None" });
    }, new Error("Unsupported operation mode: Auto"), "Unsupported OperationMode");
    this.mock(ODataModel.prototype).expects("initializeSecurityToken").never();
    oModel = this.createModel("", { operationMode: OperationMode.Server, serviceUrl: "/foo/", synchronizationMode: "None" });
    assert.strictEqual(oModel.sOperationMode, OperationMode.Server);
});
[false, true].forEach(function (bStatistics) {
    QUnit.test("c'tor, sap-statistics=" + bStatistics, function (assert) {
        var oMetadataRequestor = {}, oMetaModel, oModel;
        this.mock(ODataModel.prototype).expects("buildQueryOptions").withExactArgs({}, false, true).returns({ "sap-client": "279" });
        this.mock(sap.ui.getCore().getConfiguration()).expects("getStatistics").withExactArgs().returns(bStatistics);
        this.mock(_MetadataRequestor).expects("create").withExactArgs({ "Accept-Language": "ab-CD" }, "4.0", bStatistics ? { "sap-client": "279", "sap-statistics": true } : { "sap-client": "279" }).returns(oMetadataRequestor);
        this.mock(ODataMetaModel.prototype).expects("fetchEntityContainer").withExactArgs(true);
        this.mock(ODataModel.prototype).expects("initializeSecurityToken").withExactArgs();
        oModel = this.createModel("", { earlyRequests: true, annotationURI: ["my/annotations.xml"] });
        assert.strictEqual(oModel.sServiceUrl, getServiceUrl());
        assert.strictEqual(oModel.toString(), sClassName + ": " + getServiceUrl());
        assert.deepEqual(oModel.mUriParameters, { "sap-client": "279" });
        assert.strictEqual(oModel.getDefaultBindingMode(), BindingMode.TwoWay);
        assert.strictEqual(oModel.isBindingModeSupported(BindingMode.OneTime), true);
        assert.strictEqual(oModel.isBindingModeSupported(BindingMode.OneWay), true);
        assert.strictEqual(oModel.isBindingModeSupported(BindingMode.TwoWay), true);
        assert.strictEqual(oModel.bSharedRequests, false);
        assert.deepEqual(oModel.aAllBindings, []);
        assert.strictEqual(oModel.aPrerenderingTasks, null);
        oMetaModel = oModel.getMetaModel();
        assert.ok(oMetaModel instanceof ODataMetaModel);
        assert.strictEqual(oMetaModel.oRequestor, oMetadataRequestor);
        assert.strictEqual(oMetaModel.sUrl, getServiceUrl() + "$metadata");
        assert.deepEqual(oMetaModel.aAnnotationUris, ["my/annotations.xml"]);
    });
});
QUnit.test("metadataUrlParams", function () {
    var mUriParameters = {
        "sap-client": "279",
        "sap-context-token": "n/a"
    };
    this.mock(ODataModel.prototype).expects("buildQueryOptions").withExactArgs({}, false, true).returns(mUriParameters);
    this.mock(_MetadataRequestor).expects("create").withExactArgs({ "Accept-Language": "ab-CD" }, "4.0", {
        "sap-client": "279",
        "sap-context-token": "20200716120000",
        "sap-language": "en"
    });
    this.mock(_Requestor).expects("create").withExactArgs(getServiceUrl(), sinon.match.object, { "Accept-Language": "ab-CD" }, { "sap-client": "279", "sap-context-token": "n/a" }, "4.0").callThrough();
    this.createModel("", {
        metadataUrlParams: {
            "sap-context-token": "20200716120000",
            "sap-language": "en"
        }
    });
});
QUnit.test("sharedRequests", function (assert) {
    var oModel;
    oModel = this.createModel("", { sharedRequests: true });
    assert.strictEqual(oModel.getDefaultBindingMode(), BindingMode.OneWay);
    assert.strictEqual(oModel.isBindingModeSupported(BindingMode.OneTime), true);
    assert.strictEqual(oModel.isBindingModeSupported(BindingMode.OneWay), true);
    assert.strictEqual(oModel.isBindingModeSupported(BindingMode.TwoWay), false);
    assert.strictEqual(oModel.bSharedRequests, true);
    [false, 0, "", undefined, 1, "X"].forEach(function (vSharedRequests) {
        assert.throws(function () {
            this.createModel("", { sharedRequests: vSharedRequests });
        }, new Error("Value for sharedRequests must be true"));
    });
});
QUnit.test("Early requests: $metadata and annotations", function (assert) {
    var oFetchEntityContainerExpectation = this.mock(ODataMetaModel.prototype).expects("fetchEntityContainer").withExactArgs(true), oModel;
    oModel = this.createModel("", { earlyRequests: true });
    assert.ok(oFetchEntityContainerExpectation.alwaysCalledOn(oModel.getMetaModel()));
});
QUnit.test("supportReferences", function () {
    this.createModel("", { supportReferences: false });
});
QUnit.test("unsupported OData version", function (assert) {
    assert.throws(function () {
        this.createModel("", { odataVersion: "foo" });
    }, new Error("Unsupported value for parameter odataVersion: foo"));
});
["2.0", "4.0"].forEach(function (sODataVersion) {
    QUnit.test("create requestors for odataVersion: " + sODataVersion, function (assert) {
        var fnMetadataRequestorCreateSpy, oModel, fnRequestorCreateSpy;
        fnRequestorCreateSpy = this.mock(_Requestor).expects("create").withExactArgs(getServiceUrl(), sinon.match.object, { "Accept-Language": "ab-CD" }, sinon.match.object, sODataVersion).returns({
            checkForOpenRequests: function () { },
            checkHeaderNames: function () { }
        });
        fnMetadataRequestorCreateSpy = this.mock(_MetadataRequestor).expects("create").withExactArgs({ "Accept-Language": "ab-CD" }, sODataVersion, sinon.match.object).returns({});
        oModel = this.createModel("", { odataVersion: sODataVersion });
        assert.strictEqual(oModel.getODataVersion(), sODataVersion);
        assert.notStrictEqual(fnRequestorCreateSpy.args[0][2], fnMetadataRequestorCreateSpy.args[0][0]);
        assert.strictEqual(fnRequestorCreateSpy.args[0][2], oModel.mHeaders);
        assert.strictEqual(fnMetadataRequestorCreateSpy.args[0][0], oModel.mMetadataHeaders);
    });
});
QUnit.test("with serviceUrl params", function (assert) {
    var oModel, mUriParameters = {};
    this.mock(ODataModel.prototype).expects("buildQueryOptions").withExactArgs({ "sap-client": "111" }, false, true).returns(mUriParameters);
    oModel = this.createModel("?sap-client=111");
    assert.strictEqual(oModel.sServiceUrl, getServiceUrl());
    assert.strictEqual(oModel.mUriParameters, mUriParameters);
});
QUnit.test("Model construction with group ID", function (assert) {
    var oModel;
    oModel = this.createModel();
    assert.strictEqual(oModel.getGroupId(), "$auto");
    oModel = this.createModel("", { groupId: "$direct" });
    assert.strictEqual(oModel.getGroupId(), "$direct");
    oModel = this.createModel("", { groupId: "$auto" });
    assert.strictEqual(oModel.getGroupId(), "$auto");
    assert.throws(function () {
        oModel = this.createModel("", { groupId: "foo" });
    }, new Error("Group ID must be '$auto' or '$direct'"));
});
QUnit.test("Model construction with update group ID", function (assert) {
    var oModel;
    oModel = this.createModel();
    assert.strictEqual(oModel.getUpdateGroupId(), "$auto");
    oModel = this.createModel("", { groupId: "$direct" });
    assert.strictEqual(oModel.getUpdateGroupId(), "$direct");
    oModel = this.createModel("", { updateGroupId: "$direct" });
    assert.strictEqual(oModel.getUpdateGroupId(), "$direct");
    oModel = this.createModel("", { groupId: "$direct", updateGroupId: "applicationId" });
    assert.strictEqual(oModel.getUpdateGroupId(), "applicationId");
    assert.throws(function () {
        oModel = this.createModel("", { updateGroupId: "$foo" });
    }, new Error("Invalid update group ID: $foo"));
});
QUnit.test("Model construction with groupProperties, getGroupProperty", function (assert) {
    var oDefaultGroupProperties = {
        "$auto": { submit: SubmitMode.Auto },
        "$direct": { submit: SubmitMode.Direct }
    }, oGroupProperties = {
        "myGroup0": { submit: SubmitMode.API },
        "myGroup1": { submit: SubmitMode.Auto },
        "myGroup2": { submit: SubmitMode.Direct }
    }, oModel;
    oModel = this.createModel("");
    assert.deepEqual(oModel.mGroupProperties, oDefaultGroupProperties);
    oModel = this.createModel("", { groupProperties: oGroupProperties });
    assert.deepEqual(oModel.mGroupProperties, Object.assign(oDefaultGroupProperties, oGroupProperties));
    assert.strictEqual(oModel.getGroupProperty("$auto", "submit"), SubmitMode.Auto);
    assert.strictEqual(oModel.getGroupProperty("$auto.foo", "submit"), SubmitMode.Auto);
    assert.strictEqual(oModel.getGroupProperty("$direct", "submit"), SubmitMode.Direct);
    assert.strictEqual(oModel.getGroupProperty("myGroup0", "submit"), SubmitMode.API);
    assert.strictEqual(oModel.getGroupProperty("myGroup1", "submit"), SubmitMode.Auto);
    assert.strictEqual(oModel.getGroupProperty("myGroup2", "submit"), SubmitMode.Direct);
    assert.strictEqual(oModel.getGroupProperty("unknown", "submit"), SubmitMode.API);
    assert.throws(function () {
        oModel.getGroupProperty("myGroup0", "unknown");
    }, new Error("Unsupported group property: 'unknown'"));
});
[{
        groupProperties: { "$foo": null },
        error: "Invalid group ID: $foo"
    }, {
        groupProperties: { "myGroup": "Foo" },
        error: "Group 'myGroup' has invalid properties: 'Foo'"
    }, {
        groupProperties: { "myGroup": undefined },
        error: "Group 'myGroup' has invalid properties: 'undefined'"
    }, {
        groupProperties: { "myGroup": { submit: SubmitMode.Auto, foo: "bar" } },
        error: "Group 'myGroup' has invalid properties: '[object Object]'"
    }, {
        groupProperties: { "myGroup": { submit: "foo" } },
        error: "Group 'myGroup' has invalid properties: '[object Object]'"
    }].forEach(function (oFixture) {
    QUnit.test("Model construction with groupProperties, error: " + oFixture.error, function (assert) {
        assert.throws(function () {
            this.createModel("", { groupProperties: oFixture.groupProperties });
        }, new Error(oFixture.error));
    });
});
QUnit.test("isAutoGroup", function (assert) {
    var oModel = this.createModel("", {
        groupProperties: {
            "myAPIGroup": { submit: SubmitMode.API },
            "myAutoGroup": { submit: SubmitMode.Auto },
            "myDirectGroup": { submit: SubmitMode.Direct }
        }
    });
    assert.ok(oModel.isAutoGroup("$auto"));
    assert.ok(oModel.isAutoGroup("$auto.foo"));
    assert.notOk(oModel.isAutoGroup("Unknown"));
    assert.ok(oModel.isAutoGroup("myAutoGroup"));
    assert.notOk(oModel.isAutoGroup("myAPIGroup"));
    assert.notOk(oModel.isAutoGroup("myDirectGroup"));
});
QUnit.test("isDirectGroup", function (assert) {
    var oModel = this.createModel("", {
        groupProperties: {
            "myAPIGroup": { submit: SubmitMode.API },
            "myAutoGroup": { submit: SubmitMode.Auto },
            "myDirectGroup": { submit: SubmitMode.Direct }
        }
    });
    assert.ok(oModel.isDirectGroup("$direct"));
    assert.notOk(oModel.isDirectGroup("Unknown"));
    assert.ok(oModel.isDirectGroup("myDirectGroup"));
    assert.notOk(oModel.isDirectGroup("myAPIGroup"));
    assert.notOk(oModel.isDirectGroup("myAutoGroup"));
});
QUnit.test("Model construction with autoExpandSelect", function (assert) {
    var oModel;
    oModel = this.createModel();
    assert.strictEqual(oModel.bAutoExpandSelect, false);
    oModel = this.createModel("", { autoExpandSelect: true });
    assert.strictEqual(oModel.bAutoExpandSelect, true);
    oModel = this.createModel("", { autoExpandSelect: false });
    assert.strictEqual(oModel.bAutoExpandSelect, false);
    assert.throws(function () {
        this.createModel("", { autoExpandSelect: "" });
    }, new Error("Value for autoExpandSelect must be true or false"));
    assert.throws(function () {
        this.createModel("", { autoExpandSelect: "X" });
    }, new Error("Value for autoExpandSelect must be true or false"));
});
QUnit.test("Model construction with headers", function (assert) {
    var mHeaders = { "abc": "123", "accept-language": "wx-YZ" }, oModel;
    this.mock(ODataModel.prototype).expects("changeHttpHeaders").withExactArgs(mHeaders).callThrough();
    oModel = this.createModel("", { httpHeaders: mHeaders });
    assert.deepEqual(oModel.mHeaders, mHeaders);
    assert.deepEqual(oModel.mMetadataHeaders, mHeaders);
});
[false, true].forEach(function (bStatistics) {
    QUnit.test("Model creates _Requestor, sap-statistics=" + bStatistics, function (assert) {
        var oExpectedBind0, oExpectedBind1, oExpectedBind2, oExpectedBind3, oExpectedBind4, oExpectedCreate = this.mock(_Requestor).expects("create"), fnFetchEntityContainer = {}, fnFetchMetadata = {}, fnGetGroupProperty = {}, oModel, oModelInterface, fnreportStateMessages = {}, fnreportTransitionMessages = {}, oRequestor = {
            checkForOpenRequests: function () { },
            checkHeaderNames: function () { }
        }, fnSubmitAuto = function () { };
        this.mock(sap.ui.getCore().getConfiguration()).expects("getStatistics").withExactArgs().returns(bStatistics);
        oExpectedCreate.withExactArgs(getServiceUrl(), {
            fetchEntityContainer: sinon.match.same(fnFetchEntityContainer),
            fetchMetadata: sinon.match.same(fnFetchMetadata),
            fireSessionTimeout: sinon.match.func,
            getGroupProperty: sinon.match.same(fnGetGroupProperty),
            onCreateGroup: sinon.match.func,
            reportStateMessages: sinon.match.same(fnreportStateMessages),
            reportTransitionMessages: sinon.match.same(fnreportTransitionMessages)
        }, { "Accept-Language": "ab-CD" }, bStatistics ? { "sap-client": "123", "sap-statistics": true } : { "sap-client": "123" }, "4.0").returns(oRequestor);
        oExpectedBind0 = this.mock(ODataMetaModel.prototype.fetchEntityContainer).expects("bind").returns(fnFetchEntityContainer);
        oExpectedBind1 = this.mock(ODataMetaModel.prototype.fetchObject).expects("bind").returns(fnFetchMetadata);
        oExpectedBind2 = this.mock(ODataModel.prototype.getGroupProperty).expects("bind").returns(fnGetGroupProperty);
        oExpectedBind3 = this.mock(ODataModel.prototype.reportTransitionMessages).expects("bind").returns(fnreportTransitionMessages);
        oExpectedBind4 = this.mock(ODataModel.prototype.reportStateMessages).expects("bind").returns(fnreportStateMessages);
        oModel = this.createModel("?sap-client=123", {}, true);
        assert.ok(oModel instanceof Model);
        assert.strictEqual(oModel.oRequestor, oRequestor);
        assert.strictEqual(oExpectedBind0.firstCall.args[0], oModel.oMetaModel);
        assert.strictEqual(oExpectedBind1.firstCall.args[0], oModel.oMetaModel);
        assert.strictEqual(oExpectedBind2.firstCall.args[0], oModel);
        assert.strictEqual(oExpectedBind3.firstCall.args[0], oModel);
        assert.strictEqual(oExpectedBind4.firstCall.args[0], oModel);
        assert.strictEqual(oExpectedCreate.firstCall.args[1], oModel.oInterface);
        this.mock(oModel._submitBatch).expects("bind").withExactArgs(sinon.match.same(oModel), "$auto", true).returns(fnSubmitAuto);
        this.mock(oModel).expects("addPrerenderingTask").withExactArgs(fnSubmitAuto);
        oModelInterface = oExpectedCreate.firstCall.args[1];
        oModelInterface.onCreateGroup("$auto");
        oModelInterface.onCreateGroup("foo");
        this.mock(oModel).expects("fireEvent").withExactArgs("sessionTimeout");
        oModelInterface.fireSessionTimeout();
    });
});
QUnit.test("Property access from ManagedObject w/o context binding", function (assert) {
    var oModel = this.createModel("", {}, true), oControl = new TestControl({ models: oModel }), done = assert.async();
    oControl.bindProperty("text", {
        path: "/TEAMS('TEAM_01')/Name",
        type: new TypeString()
    });
    oControl.getBinding("text").attachChange(function () {
        assert.strictEqual(oControl.getText(), "Business Suite", "property value");
        done();
    });
});
QUnit.skip("Property access from ManagedObject w/ context binding", function (assert) {
    var oModel = this.createModel(), oControl = new TestControl({ models: oModel }), done = assert.async();
    oControl.bindObject("/TEAMS('TEAM_01')");
    oControl.bindProperty("text", {
        path: "Name",
        type: new TypeString()
    });
    oControl.getBinding("text").attachChange(function () {
        assert.strictEqual(oControl.getText(), "Business Suite", "property value");
        done();
    });
});
QUnit.test("requestCanonicalPath", function (assert) {
    var oModel = this.createModel(), oEntityContext = Context.create(oModel, null, "/EMPLOYEES/42");
    this.mock(oEntityContext).expects("requestCanonicalPath").withExactArgs().returns(Promise.resolve("/EMPLOYEES(ID='1')"));
    return oModel.requestCanonicalPath(oEntityContext).then(function (sCanonicalPath) {
        assert.strictEqual(sCanonicalPath, "/EMPLOYEES(ID='1')");
    });
});
QUnit.test("refresh", function (assert) {
    var oError = new Error(), oModel = this.createModel(), oModelMock = this.mock(oModel), oBaseContext = oModel.createBindingContext("/TEAMS('42')"), oContext = Context.create(oModel, undefined, "/TEAMS('43')"), oListBinding = oModel.bindList("/TEAMS"), oListBindingMock = this.mock(oListBinding), oListBinding2 = oModel.bindList("/TEAMS"), oListBinding3 = oModel.bindList("TEAM_2_EMPLOYEES"), oListBinding3Mock = this.mock(oListBinding3), oRelativeContextBinding = oModel.bindContext("TEAM_2_MANAGER", oContext, {}), oPropertyBinding = oModel.bindProperty("Name"), oPropertyBinding2 = oModel.bindProperty("Team_Id"), oPropertyBinding2Mock = this.mock(oPropertyBinding2);
    oListBinding3.setContext(oBaseContext);
    this.mock(oPropertyBinding2).expects("fetchCache");
    this.mock(oPropertyBinding2).expects("checkUpdateInternal");
    oPropertyBinding2.setContext(oBaseContext);
    oListBinding.attachChange(function () { });
    oListBinding3.attachChange(function () { });
    oPropertyBinding.attachChange(function () { });
    oPropertyBinding2.attachChange(function () { });
    oRelativeContextBinding.attachChange(function () { });
    oListBindingMock.expects("refresh").withExactArgs("myGroup");
    oListBinding3Mock.expects("refresh").withExactArgs("myGroup");
    oPropertyBinding2Mock.expects("refresh").withExactArgs("myGroup");
    this.mock(oListBinding2).expects("refresh").never();
    this.mock(oRelativeContextBinding).expects("refresh").never();
    this.mock(oPropertyBinding).expects("refresh").never();
    oModelMock.expects("checkGroupId").withExactArgs("myGroup");
    oModel.refresh("myGroup");
    oModelMock.expects("checkGroupId").never();
    oModelMock.expects("getBindings").never();
    assert.throws(function () {
        oModel.refresh(true);
    }, new Error("Unsupported parameter bForceUpdate"));
    oModelMock.expects("checkGroupId").withExactArgs("$Invalid").throws(oError);
    assert.throws(function () {
        oModel.refresh("$Invalid");
    }, oError);
    oModelMock.expects("checkGroupId").withExactArgs("myGroup2");
    oModelMock.expects("getBindings").withExactArgs().returns([oListBinding, oListBinding3, oPropertyBinding, oPropertyBinding2, oRelativeContextBinding]);
    oPropertyBinding2Mock.expects("refresh").withExactArgs("myGroup2");
    oListBinding.suspend();
    oListBinding2.suspend();
    oListBinding3.suspend();
    oListBindingMock.expects("refresh").withExactArgs(undefined);
    oListBinding3Mock.expects("refresh").withExactArgs(undefined);
    oModel.refresh("myGroup2");
});
QUnit.test("oModel.aBindings modified during refresh", function (assert) {
    var iCallCount = 0, oModel = this.createModel(), oListBinding = oModel.bindList("/TEAMS"), oListBinding2 = oModel.bindList("/TEAMS");
    function change() { }
    function detach() {
        this.detachChange(change);
        iCallCount += 1;
    }
    oListBinding.attachChange(change);
    oListBinding2.attachChange(change);
    oListBinding.attachRefresh(detach);
    oListBinding2.attachRefresh(detach);
    oModel.refresh();
    assert.strictEqual(iCallCount, 2, "refresh called for both bindings");
});
QUnit.test("_submitBatch: success", function (assert) {
    var oBatchResult = {}, sGroupId = {}, oModel = this.createModel();
    this.mock(oModel.oRequestor).expects("submitBatch").withExactArgs(sinon.match.same(sGroupId)).returns(SyncPromise.resolve(Promise.resolve(oBatchResult)));
    return oModel._submitBatch(sGroupId).then(function (oResult) {
        assert.strictEqual(oResult, oBatchResult);
    });
});
[undefined, false, true].forEach(function (bCatch) {
    QUnit.test("_submitBatch, failure, bCatch: " + bCatch, function (assert) {
        var oExpectedError = new Error("deliberate failure"), oModel = this.createModel(), oPromise;
        this.mock(oModel.oRequestor).expects("submitBatch").withExactArgs("groupId").returns(SyncPromise.resolve(Promise.reject(oExpectedError)));
        this.mock(oModel).expects("reportError").withExactArgs("$batch failed", sClassName, oExpectedError);
        oPromise = oModel._submitBatch("groupId", bCatch).then(function (vResult) {
            assert.ok(bCatch);
            assert.strictEqual(vResult, undefined);
        }, function (oError) {
            assert.notOk(bCatch);
            assert.strictEqual(oError, oExpectedError);
        });
        assert.ok(oPromise instanceof SyncPromise);
        return oPromise;
    });
});
QUnit.test("submitBatch", function (assert) {
    var oModel = this.createModel("", {}, true), oModelMock = this.mock(oModel), oSubmitPromise = {};
    oModelMock.expects("checkBatchGroupId").withExactArgs("groupId");
    oModelMock.expects("isAutoGroup").withExactArgs("groupId").returns(false);
    this.mock(oModel.oRequestor).expects("addChangeSet").withExactArgs("groupId");
    oModelMock.expects("_submitBatch").never();
    oModelMock.expects("addPrerenderingTask").callsFake(function (fnCallback) {
        setTimeout(function () {
            oModelMock.expects("_submitBatch").withExactArgs("groupId").returns(oSubmitPromise);
            fnCallback();
        }, 0);
    });
    return oModel.submitBatch("groupId").then(function (oResult) {
        assert.strictEqual(oResult, oSubmitPromise);
    });
});
QUnit.test("submitBatch, invalid group ID", function (assert) {
    var oError = new Error(), oModel = this.createModel(), oModelMock = this.mock(oModel);
    oModelMock.expects("_submitBatch").never();
    oModelMock.expects("checkBatchGroupId").withExactArgs("$direct").throws(oError);
    assert.throws(function () {
        oModel.submitBatch("$direct");
    }, oError);
});
QUnit.test("submitBatch: $auto", function (assert) {
    var oModel = this.createModel("", {}, true), oModelMock = this.mock(oModel), oSubmitPromise = {};
    oModelMock.expects("checkBatchGroupId").withExactArgs("groupId");
    oModelMock.expects("isAutoGroup").withExactArgs("groupId").returns(true);
    this.mock(oModel.oRequestor).expects("relocateAll").withExactArgs("$parked.groupId", "groupId");
    this.mock(oModel.oRequestor).expects("addChangeSet").never();
    oModelMock.expects("_submitBatch").never();
    oModelMock.expects("addPrerenderingTask").callsFake(function (fnCallback) {
        setTimeout(function () {
            oModelMock.expects("_submitBatch").withExactArgs("groupId").returns(oSubmitPromise);
            fnCallback();
        }, 0);
    });
    return oModel.submitBatch("groupId").then(function (oResult) {
        assert.strictEqual(oResult, oSubmitPromise);
    });
});
QUnit.test("resetChanges with group ID", function () {
    var oModel = this.createModel();
    this.mock(oModel).expects("checkBatchGroupId").withExactArgs("groupId");
    this.mock(oModel).expects("isAutoGroup").withExactArgs("groupId").returns(false);
    this.mock(oModel.oRequestor).expects("cancelChanges").withExactArgs("groupId");
    oModel.resetChanges("groupId");
});
QUnit.test("resetChanges with $auto group", function () {
    var oModel = this.createModel("", { updateGroupId: "$auto" }), oBinding1 = oModel.bindList("/EMPLOYEES"), oBinding2 = oModel.bindProperty("/EMPLOYEES('1')/AGE"), oBinding3 = oModel.bindContext("/EMPLOYEES('1')", undefined, {
        $$updateGroupId: "anotherGroup"
    }), oRequestorMock = this.mock(oModel.oRequestor);
    this.mock(oModel).expects("checkBatchGroupId").withExactArgs("$auto");
    this.mock(oModel).expects("isAutoGroup").withExactArgs("$auto").returns(true);
    oRequestorMock.expects("cancelChanges").withExactArgs("$parked.$auto");
    oRequestorMock.expects("cancelChanges").withExactArgs("$auto");
    this.mock(oBinding1).expects("resetInvalidDataState").withExactArgs();
    this.mock(oBinding2).expects("resetInvalidDataState").withExactArgs();
    this.mock(oBinding3).expects("resetInvalidDataState").never();
    oModel.resetChanges("$auto");
});
QUnit.test("resetChanges w/o group ID", function () {
    var oModel = this.createModel("", { updateGroupId: "updateGroupId" }), oBinding1 = oModel.bindList("/EMPLOYEES"), oBinding2 = oModel.bindProperty("/EMPLOYEES('1')/AGE"), oBinding3 = oModel.bindContext("/EMPLOYEES('1')", undefined, {
        $$updateGroupId: "anotherGroup"
    });
    this.mock(oModel).expects("checkBatchGroupId").withExactArgs("updateGroupId");
    this.mock(oModel).expects("isAutoGroup").withExactArgs("updateGroupId").returns(false);
    this.mock(oModel.oRequestor).expects("cancelChanges").withExactArgs("updateGroupId");
    this.mock(oBinding1).expects("resetInvalidDataState").withExactArgs();
    this.mock(oBinding2).expects("resetInvalidDataState").withExactArgs();
    this.mock(oBinding3).expects("resetInvalidDataState").never();
    oModel.resetChanges();
});
QUnit.test("resetChanges, invalid group ID", function (assert) {
    var oError = new Error(), oModel = this.createModel();
    this.mock(oModel).expects("checkBatchGroupId").withExactArgs("$auto").throws(oError);
    this.mock(oModel.oRequestor).expects("cancelChanges").never();
    assert.throws(function () {
        oModel.resetChanges();
    }, oError);
});
QUnit.test("forbidden", function (assert) {
    var oModel = this.createModel();
    assert.throws(function () {
        oModel.bindTree();
    }, new Error("Unsupported operation: v4.ODataModel#bindTree"));
    assert.throws(function () {
        oModel.destroyBindingContext();
    }, new Error("Unsupported operation: v4.ODataModel#destroyBindingContext"));
    assert.throws(function () {
        oModel.getContext();
    }, new Error("Unsupported operation: v4.ODataModel#getContext"));
    assert.throws(function () {
        oModel.getObject();
    }, new Error("Unsupported operation: v4.ODataModel#getObject"));
    assert.throws(function () {
        oModel.getOriginalProperty();
    }, new Error("Unsupported operation: v4.ODataModel#getOriginalProperty"));
    assert.throws(function () {
        oModel.getProperty();
    }, new Error("Unsupported operation: v4.ODataModel#getProperty"));
    assert.throws(function () {
        oModel.isList();
    }, new Error("Unsupported operation: v4.ODataModel#isList"));
    assert.throws(function () {
        oModel.setLegacySyntax();
    }, new Error("Unsupported operation: v4.ODataModel#setLegacySyntax"));
});
QUnit.test("events", function (assert) {
    var oModel = this.createModel();
    assert.throws(function () {
        oModel.attachParseError();
    }, new Error("Unsupported event 'parseError': v4.ODataModel#attachEvent"));
    assert.throws(function () {
        oModel.attachRequestCompleted();
    }, new Error("Unsupported event 'requestCompleted': v4.ODataModel#attachEvent"));
    assert.throws(function () {
        oModel.attachRequestFailed();
    }, new Error("Unsupported event 'requestFailed': v4.ODataModel#attachEvent"));
    assert.throws(function () {
        oModel.attachRequestSent();
    }, new Error("Unsupported event 'requestSent': v4.ODataModel#attachEvent"));
});
QUnit.test("event: sessionTimeout", function (assert) {
    var oModel = this.createModel(), oModelMock = this.mock(oModel), fnFunction = {}, oListener = {};
    oModelMock.expects("attachEvent").withExactArgs("sessionTimeout", sinon.match.same(fnFunction), sinon.match.same(oListener)).returns(oModel);
    assert.strictEqual(oModel.attachSessionTimeout(fnFunction, oListener), oModel);
    oModelMock.expects("detachEvent").withExactArgs("sessionTimeout", sinon.match.same(fnFunction), sinon.match.same(oListener)).returns(oModel);
    assert.strictEqual(oModel.detachSessionTimeout(fnFunction, oListener), oModel);
});
[{
        stack: "Failure\n    at _Helper.createError",
        message: "Failure\n    at _Helper.createError"
    }, {
        stack: "_Helper.createError@_Helper.js",
        message: "Failure\n_Helper.createError@_Helper.js"
    }].forEach(function (oFixture, i) {
    QUnit.test("reportError, i:" + i, function () {
        var sClassName = "sap.ui.model.odata.v4.ODataPropertyBinding", oError = new Error("Failure"), oHelperMock = this.mock(_Helper), sLogMessage = "Failed to read path /Product('1')/Unknown", oModel = this.createModel(), oModelMock = this.mock(oModel);
        oError.stack = oFixture.stack;
        oError.resourcePath = "resource/path";
        oHelperMock.expects("extractMessages").withExactArgs(sinon.match.same(oError)).returns("~extractedMessages~");
        this.oLogMock.expects("error").withExactArgs(sLogMessage, oFixture.message, sClassName).twice();
        oModelMock.expects("reportStateMessages").never();
        oModelMock.expects("reportTransitionMessages").once().withExactArgs("~extractedMessages~", "resource/path");
        oModel.reportError(sLogMessage, sClassName, oError);
        oModel.reportError(sLogMessage, sClassName, oError);
    });
});
QUnit.test("reportError on canceled error", function () {
    var oError = { canceled: true, message: "Canceled", stack: "Canceled\n    at foo.bar" }, oModel = this.createModel();
    this.oLogMock.expects("debug").withExactArgs("Failure", "Canceled\n    at foo.bar", "class");
    this.mock(_Helper).expects("extractMessages").never();
    this.mock(oModel).expects("reportStateMessages").never();
    this.mock(oModel).expects("reportTransitionMessages").never();
    oModel.reportError("Failure", "class", oError);
});
QUnit.test("reportError on canceled error, no debug log", function () {
    var oError = { canceled: "noDebugLog" }, oModel = this.createModel();
    this.oLogMock.expects("debug").never();
    this.mock(_Helper).expects("extractMessages").never();
    this.mock(oModel).expects("reportStateMessages").never();
    this.mock(oModel).expects("reportTransitionMessages").never();
    oModel.reportError("Failure", "class", oError);
});
QUnit.test("destroy", function (assert) {
    var oModel = this.createModel(), oModelPrototypeMock = this.mock(Model.prototype);
    this.mock(oModel.oRequestor).expects("destroy").withExactArgs();
    oModelPrototypeMock.expects("destroy").on(oModel).withExactArgs(1, 2, 3).returns("foo");
    oModelPrototypeMock.expects("destroy").on(oModel.getMetaModel()).withExactArgs();
    assert.strictEqual(oModel.destroy(1, 2, 3), "foo");
    assert.strictEqual(oModel.mHeaders, undefined);
    assert.strictEqual(oModel.mMetadataHeaders, undefined);
});
QUnit.test("hasPendingChanges", function (assert) {
    var oModel = this.createModel(), oModelMock = this.mock(oModel), oRequestorMock = this.mock(oModel.oRequestor), oResult = {};
    oModelMock.expects("checkBatchGroupId").never();
    oRequestorMock.expects("hasPendingChanges").withExactArgs(undefined).returns(oResult);
    assert.strictEqual(oModel.hasPendingChanges(), oResult);
    oModelMock.expects("checkBatchGroupId").withExactArgs("update");
    oModelMock.expects("isAutoGroup").withExactArgs("update").returns(false);
    oRequestorMock.expects("hasPendingChanges").withExactArgs("update").returns(oResult);
    assert.strictEqual(oModel.hasPendingChanges("update"), oResult);
    oModelMock.expects("checkBatchGroupId").withExactArgs("$auto");
    oModelMock.expects("isAutoGroup").withExactArgs("$auto").returns(true);
    oRequestorMock.expects("hasPendingChanges").withExactArgs("$parked.$auto").returns(true);
    assert.strictEqual(oModel.hasPendingChanges("$auto"), true);
    oModelMock.expects("checkBatchGroupId").withExactArgs("$auto");
    oModelMock.expects("isAutoGroup").withExactArgs("$auto").returns(true);
    oRequestorMock.expects("hasPendingChanges").withExactArgs("$parked.$auto").returns(false);
    oRequestorMock.expects("hasPendingChanges").withExactArgs("$auto").returns(oResult);
    assert.strictEqual(oModel.hasPendingChanges("$auto"), oResult);
});
QUnit.test("hasPendingChanges, invalid groupId", function (assert) {
    var oError = new Error("Invalid batch group"), oModel = this.createModel(), oModelMock = this.mock(oModel);
    oModelMock.expects("checkBatchGroupId").withExactArgs("").throws(oError);
    assert.throws(function () {
        oModel.hasPendingChanges("");
    }, oError);
});
QUnit.test("getDependentBindings: binding", function (assert) {
    var oModel = this.createModel(), oParentBinding = {}, oContext = Context.create(oModel, oParentBinding, "/absolute"), oBinding = new Binding(oModel, "relative", oContext);
    assert.deepEqual(oModel.getDependentBindings(oParentBinding), []);
    oModel.bindingCreated(oBinding);
    oModel.bindingCreated(new Binding(oModel, "/somewhere/else", oContext));
    oModel.bindingCreated(new Binding(oModel, "unrelated", Context.create(oModel, {}, "/absolute")));
    oModel.bindingCreated(new Binding(oModel, "relative"));
    assert.deepEqual(oModel.getDependentBindings(oParentBinding), [oBinding]);
    oModel.bindingDestroyed(oBinding);
    assert.deepEqual(oModel.getDependentBindings(oParentBinding), []);
    assert.throws(function () {
        oModel.bindingDestroyed(oBinding);
    }, new Error("Unknown " + oBinding));
});
QUnit.test("getDependentBindings: base context", function (assert) {
    var oModel = this.createModel(), oParentBinding = {}, oContext = new BaseContext(oModel, "/foo"), oBinding = new Binding(oModel, "relative", oContext);
    oModel.bindingCreated(oBinding);
    oModel.bindingCreated(new Binding(oModel, "unrelated", Context.create(oModel, {}, "/absolute")));
    oModel.bindingCreated(new Binding(oModel, "relative"));
    assert.deepEqual(oModel.getDependentBindings(oParentBinding), []);
});
QUnit.test("getDependentBindings: context", function (assert) {
    var oModel = this.createModel(), oParentContext = Context.create(oModel, null, "/absolute"), oBinding = new Binding(oModel, "relative", oParentContext);
    assert.deepEqual(oModel.getDependentBindings(oParentContext), []);
    oModel.bindingCreated(oBinding);
    assert.deepEqual(oModel.getDependentBindings(oParentContext), [oBinding]);
    oModel.bindingDestroyed(oBinding);
    assert.deepEqual(oModel.getDependentBindings(oParentContext), []);
});
[
    "/foo",
    "/EMPLOYEES('4711')/#com.sap.foo.bar.AcFoo",
    "/EMPLOYEES('4711')/#com.sap.foo.bar.AcFoo/Title"
].forEach(function (sPath) {
    QUnit.test("createBindingContext - absolute path, no context " + sPath, function (assert) {
        var oBindingContext, oModel = this.createModel();
        oBindingContext = oModel.createBindingContext(sPath);
        assert.deepEqual(oBindingContext, new BaseContext(oModel, sPath));
        assert.ok(oBindingContext instanceof BaseContext);
    });
});
[{
        entityPath: "/foo",
        propertyPath: "bar"
    }, {
        entityPath: "/foo",
        propertyPath: "foo_2_bar/#com.sap.foo.bar.AcBar"
    }, {
        entityPath: "/foo",
        propertyPath: "#com.sap.foo.bar.AcBar/Title"
    }].forEach(function (oFixture) {
    var sResolvedPath = oFixture.entityPath + "/" + oFixture.propertyPath, sTitle = "createBindingContext - relative path and context " + sResolvedPath;
    QUnit.test(sTitle, function (assert) {
        var oBindingContext, oModel = this.createModel(), oModelMock = this.mock(oModel), oContext = new BaseContext(oModel, oFixture.entityPath);
        oModelMock.expects("resolve").withExactArgs(oFixture.propertyPath, sinon.match.same(oContext)).returns(sResolvedPath);
        oBindingContext = oModel.createBindingContext(oFixture.propertyPath, oContext);
        assert.deepEqual(oBindingContext, new BaseContext(oModel, sResolvedPath));
        assert.ok(oBindingContext instanceof BaseContext);
    });
});
[false, true].forEach(function (bDoubleHash) {
    [{
            dataPath: "/BusinessPartnerList('42')",
            metaPath: ""
        }, {
            dataPath: "/BusinessPartnerList('42')",
            metaPath: "@com.sap.vocabularies.UI.v1.LineItem"
        }, {
            dataPath: "/BusinessPartnerList('42')/",
            metaPath: "/com.sap.foo.bar.AcFoo",
            relativeMetaPath: "./com.sap.foo.bar.AcFoo"
        }, {
            dataPath: "/BusinessPartnerList('42')/",
            doubleHash: true,
            metaPath: "com.sap.foo.bar.AcFoo"
        }, {
            dataPath: "/",
            metaPath: "com.sap.foo.bar.AcFoo"
        }, {
            dataPath: "/",
            metaPath: "BusinessPartnerList/@com.sap.vocabularies.UI.v1.LineItem"
        }, {
            dataPath: "/BusinessPartnerList",
            metaPath: "/",
            relativeMetaPath: "./"
        }, {
            dataPath: "/BusinessPartnerList",
            metaPath: "Name"
        }, {
            dataPath: "/BusinessPartnerList",
            metaPath: "/Name",
            relativeMetaPath: "./Name"
        }].forEach(function (oFixture) {
        var sPath = oFixture.dataPath + (bDoubleHash ? "##" : "#") + oFixture.metaPath;
        if ("doubleHash" in oFixture && oFixture.doubleHash !== bDoubleHash) {
            return;
        }
        QUnit.test("createBindingContext - go to metadata " + sPath, function (assert) {
            var oContext = {}, oModel = this.createModel(), oMetaContext = {}, oMetaModel = oModel.getMetaModel(), oMetaModelMock = this.mock(oMetaModel), sMetaPath = oFixture.relativeMetaPath || oFixture.metaPath;
            oMetaModelMock.expects("getMetaContext").withExactArgs(oFixture.dataPath).returns(oMetaContext);
            oMetaModelMock.expects("createBindingContext").withExactArgs(sMetaPath, sinon.match.same(oMetaContext)).returns(oContext);
            assert.strictEqual(oModel.createBindingContext(sPath), oContext);
        });
    });
});
QUnit.test("createBindingContext - error cases", function (assert) {
    var oModel = this.createModel(), oEntityContext = Context.create(oModel, null, "/EMPLOYEES/42");
    assert.throws(function () {
        oModel.createBindingContext("bar");
    }, new Error("Cannot create binding context from relative path 'bar' without context"), "relative path, no context");
    assert.throws(function () {
        oModel.createBindingContext("/foo", undefined, { "param": "bar" });
    }, new Error("Only the parameters sPath and oContext are supported"), "more than two parameters not allowed");
    assert.throws(function () {
        oModel.createBindingContext("foo", oEntityContext);
    }, new Error("Unsupported type: oContext must be of type sap.ui.model.Context, but was " + "sap.ui.model.odata.v4.Context"), "sap.ui.model.odata.v4.Context not allowed");
});
QUnit.test("checkGroupId", function (assert) {
    var oModel = this.createModel();
    oModel.checkGroupId("myGroup");
    oModel.checkGroupId("$auto");
    oModel.checkGroupId("$auto.foo");
    oModel.checkGroupId("$auto.1");
    oModel.checkGroupId("$direct");
    oModel.checkGroupId(undefined);
    oModel.checkGroupId("myGroup", true);
    ["", "$invalid", 42].forEach(function (vGroupId) {
        assert.throws(function () {
            oModel.checkGroupId(vGroupId);
        }, new Error("Invalid group ID: " + vGroupId));
    });
    ["", "$invalid", 42, "$auto", "$direct", undefined].forEach(function (vGroupId) {
        assert.throws(function () {
            oModel.checkGroupId(vGroupId, true);
        }, new Error("Invalid group ID: " + vGroupId));
    });
    assert.throws(function () {
        oModel.checkGroupId("$invalid", false, "Custom error message: ");
    }, new Error("Custom error message: $invalid"));
});
QUnit.test("checkBatchGroupId: success", function () {
    var sGroupId = {}, oModel = this.createModel();
    this.mock(oModel).expects("checkGroupId").withExactArgs(sinon.match.same(sGroupId));
    this.mock(oModel).expects("isDirectGroup").withExactArgs(sinon.match.same(sGroupId)).returns(false);
    oModel.checkBatchGroupId(sGroupId);
});
QUnit.test("checkBatchGroupId: checkGroupId fails", function (assert) {
    var oError = new Error(), sGroupId = {}, oModel = this.createModel();
    this.mock(oModel).expects("checkGroupId").withExactArgs(sinon.match.same(sGroupId)).throws(oError);
    this.mock(oModel).expects("isDirectGroup").never();
    assert.throws(function () {
        oModel.checkBatchGroupId(sGroupId);
    }, oError);
});
QUnit.test("checkBatchGroupId: fails due to isDirectGroup", function (assert) {
    var oModel = this.createModel();
    this.mock(oModel).expects("checkGroupId").withExactArgs("foo");
    this.mock(oModel).expects("isDirectGroup").withExactArgs("foo").returns(true);
    assert.throws(function () {
        oModel.checkBatchGroupId("foo");
    }, new Error("Group ID does not use batch requests: foo"));
});
[{
        mParameters: {
            "$expand": {
                "foo": {
                    "$count": true,
                    "$expand": { "bar": {} },
                    "$filter": "baz eq 0",
                    "$levels": "max",
                    "$orderby": "qux",
                    "$search": "key",
                    "$select": ["*"]
                }
            },
            "$select": ["bar"],
            "custom": "baz"
        },
        bSystemQueryOptionsAllowed: true
    }, {
        mParameters: {
            "$apply": "apply",
            "$count": true,
            "$filter": "foo eq 42",
            "$orderby": "bar",
            "$search": "\"foo bar\" AND NOT foobar"
        },
        bSystemQueryOptionsAllowed: true
    }, {
        mParameters: { "custom": "foo" }
    }, {
        mParameters: undefined
    }, {
        mParameters: { "sap-client": "111" },
        bSapAllowed: true
    }, {
        mParameters: {
            "sap-valid-": "now",
            "sap-valid-foo": "bar",
            "sap-valid-*": "n/a"
        },
        bSapAllowed: false
    }, {
        mParameters: {
            $expand: { "TEAM_2_MANAGER": {} },
            $select: "bar"
        },
        bSystemQueryOptionsAllowed: true,
        expected: {
            $expand: { "TEAM_2_MANAGER": {} },
            $select: ["bar"]
        }
    }, {
        mParameters: {
            $expand: { "TEAM_2_MANAGER": {
                    $expand: "TEAM_2_EMPLOYEES($select=Name)",
                    $select: "Team_Id"
                } }
        },
        bSystemQueryOptionsAllowed: true,
        expected: {
            $expand: { "TEAM_2_MANAGER": {
                    $expand: {
                        TEAM_2_EMPLOYEES: {
                            $select: ["Name"]
                        }
                    },
                    $select: ["Team_Id"]
                } }
        }
    }, {
        mParameters: {
            $expand: {
                "TEAM_2_MANAGER": true,
                "TEAM_2_EMPLOYEES": null,
                "FOO1": 42,
                "FOO2": false,
                "FOO4": {
                    $count: false
                }
            }
        },
        bSystemQueryOptionsAllowed: true,
        expected: {
            $expand: {
                "TEAM_2_MANAGER": {},
                "TEAM_2_EMPLOYEES": {},
                "FOO1": {},
                "FOO2": {},
                "FOO4": {}
            }
        }
    }, {
        bSystemQueryOptionsAllowed: true,
        mParameters: {
            $count: "true"
        },
        expected: {
            $count: true
        }
    }, {
        bSystemQueryOptionsAllowed: true,
        mParameters: {
            $count: "false"
        },
        expected: {}
    }, {
        bSystemQueryOptionsAllowed: true,
        mParameters: {
            $count: "TrUe"
        },
        expected: {
            $count: true
        }
    }, {
        bSystemQueryOptionsAllowed: true,
        mParameters: {
            $count: false
        },
        expected: {}
    }].forEach(function (oFixture) {
    QUnit.test("buildQueryOptions success " + JSON.stringify(oFixture), function (assert) {
        var mOptions, sOriginalParameters = JSON.stringify(oFixture.mParameters);
        mOptions = ODataModel.prototype.buildQueryOptions(oFixture.mParameters, oFixture.bSystemQueryOptionsAllowed, oFixture.bSapAllowed);
        assert.deepEqual(mOptions, oFixture.expected || oFixture.mParameters || {});
        assert.strictEqual(JSON.stringify(oFixture.mParameters), sOriginalParameters);
    });
});
QUnit.test("buildQueryOptions with $$ options", function (assert) {
    assert.deepEqual(ODataModel.prototype.buildQueryOptions({ $$groupId: "$direct" }), {});
});
QUnit.test("buildQueryOptions: parse system query options", function (assert) {
    var oExpand = { "foo": null }, oParserMock = this.mock(_Parser), aSelect = ["bar"];
    oParserMock.expects("parseSystemQueryOption").withExactArgs("$expand=foo").returns({ "$expand": oExpand });
    oParserMock.expects("parseSystemQueryOption").withExactArgs("$select=bar").returns({ "$select": aSelect });
    assert.deepEqual(ODataModel.prototype.buildQueryOptions({
        $expand: "foo",
        $select: "bar"
    }, true), {
        $expand: oExpand,
        $select: aSelect
    });
});
[{
        mOptions: { "$foo": "foo" },
        bSystemQueryOptionsAllowed: true,
        error: "System query option $foo is not supported"
    }, {
        mOptions: { "@alias": "alias" },
        bSystemQueryOptionsAllowed: true,
        error: "Parameter @alias is not supported"
    }, {
        mOptions: { "$expand": { "foo": true } },
        error: "System query option $expand is not supported"
    }, {
        mOptions: { "$expand": { "foo": { "$unknown": "bar" } } },
        bSystemQueryOptionsAllowed: true,
        error: "System query option $unknown is not supported"
    }, {
        mOptions: { "$expand": { "foo": { "select": "bar" } } },
        bSystemQueryOptionsAllowed: true,
        error: "System query option select is not supported"
    }, {
        mOptions: { "$levels": 2 },
        bSystemQueryOptionsAllowed: true,
        error: "System query option $levels is not supported"
    }, {
        mOptions: { "$expand": { "foo": { "$apply": "bar" } } },
        bSystemQueryOptionsAllowed: true,
        error: "System query option $apply is not supported"
    }, {
        mOptions: { "$expand": { "foo": { "$skip": "10" } } },
        bSystemQueryOptionsAllowed: true,
        error: "System query option $skip is not supported"
    }, {
        mOptions: { "$expand": { "foo": { "$top": "10" } } },
        bSystemQueryOptionsAllowed: true,
        error: "System query option $top is not supported"
    }, {
        mOptions: { "sap-foo": "300" },
        error: "Custom query option sap-foo is not supported"
    }, {
        mOptions: { "$count": "foo" },
        bSystemQueryOptionsAllowed: true,
        error: "Invalid value for $count: foo"
    }, {
        mOptions: { "$count": {} },
        bSystemQueryOptionsAllowed: true,
        error: "Invalid value for $count: [object Object]"
    }, {
        mOptions: { "$count": undefined },
        bSystemQueryOptionsAllowed: true,
        error: "Invalid value for $count: undefined"
    }].forEach(function (o) {
    QUnit.test("buildQueryOptions error " + JSON.stringify(o), function (assert) {
        assert.throws(function () {
            ODataModel.prototype.buildQueryOptions(o.mOptions, o.bSystemQueryOptionsAllowed);
        }, new Error(o.error));
    });
});
QUnit.test("resolve", function (assert) {
    var oModel = this.createModel();
    assert.strictEqual(oModel.resolve("Name"), undefined);
    assert.strictEqual(oModel.resolve("/"), "/");
    assert.strictEqual(oModel.resolve("", new BaseContext(oModel, "/")), "/");
    assert.strictEqual(oModel.resolve("/", new BaseContext(oModel, "/BusinessPartnerList#")), "/", "resolve does not handle # specially");
    assert.strictEqual(oModel.resolve("/BusinessPartnerList"), "/BusinessPartnerList");
    assert.strictEqual(oModel.resolve("/BusinessPartnerList/"), "/BusinessPartnerList");
    assert.strictEqual(oModel.resolve("/BusinessPartnerList", {}), "/BusinessPartnerList");
    assert.strictEqual(oModel.resolve("BusinessPartnerList", new BaseContext(oModel, "/")), "/BusinessPartnerList");
    assert.strictEqual(oModel.resolve("BusinessPartnerList/", new BaseContext(oModel, "/")), "/BusinessPartnerList");
    assert.strictEqual(oModel.resolve("", new BaseContext(oModel, "/BusinessPartnerList")), "/BusinessPartnerList");
    assert.strictEqual(oModel.resolve("", new BaseContext(oModel, "/BusinessPartnerList/")), "/BusinessPartnerList");
    assert.strictEqual(oModel.resolve("Name/", new BaseContext(oModel, "/BusinessPartnerList")), "/BusinessPartnerList/Name");
    assert.strictEqual(oModel.resolve("/BusinessPartnerList#/"), "/BusinessPartnerList#/");
    assert.strictEqual(oModel.resolve("BusinessPartnerList#/", new BaseContext(oModel, "/")), "/BusinessPartnerList#/");
    assert.strictEqual(oModel.resolve("#/", new BaseContext(oModel, "/BusinessPartnerList")), "/BusinessPartnerList/#/", "there is a / added before the relative path");
    assert.strictEqual(oModel.resolve("#/", new BaseContext(oModel, "/BusinessPartnerList/")), "/BusinessPartnerList/#/");
    assert.strictEqual(oModel.resolve("", new BaseContext(oModel, "/BusinessPartnerList#/")), "/BusinessPartnerList#/");
    assert.strictEqual(oModel.resolve(42, new BaseContext(oModel, "/")), "/42");
    assert.throws(function () {
        Model.prototype.resolve(42, new BaseContext(oModel, "/"));
    });
    assert.strictEqual(oModel.resolve(0, new BaseContext(oModel, "/")), Model.prototype.resolve(0, new BaseContext(oModel, "/")), "/");
    assert.strictEqual(oModel.resolve(undefined, new BaseContext(oModel, "/")), "/");
    assert.strictEqual(Model.prototype.resolve(null), null);
});
QUnit.test("initializeSecurityToken", function () {
    var oModel = this.createModel("");
    this.mock(oModel.oRequestor).expects("refreshSecurityToken").withExactArgs().rejects(new Error());
    oModel.initializeSecurityToken();
});
QUnit.test("reportTransitionMessages", function () {
    var oModel = this.createModel(), oModelMock = this.mock(oModel), aMessages = [{}, {}], sResourcePath = "~res~";
    oModelMock.expects("createUI5Message").withExactArgs(sinon.match(function (oMessage) {
        return oMessage === aMessages[0] && oMessage.transition === true;
    }), sResourcePath).returns("~UI5msg0~");
    oModelMock.expects("createUI5Message").withExactArgs(sinon.match(function (oMessage) {
        return oMessage === aMessages[1] && oMessage.transition === true;
    }), sResourcePath).returns("~UI5msg1~");
    oModelMock.expects("fireMessageChange").withExactArgs(sinon.match({ newMessages: ["~UI5msg0~", "~UI5msg1~"] }));
    oModel.reportTransitionMessages(aMessages, sResourcePath);
    oModel.reportTransitionMessages([], sResourcePath);
    oModel.reportTransitionMessages(null, sResourcePath);
});
QUnit.test("reportStateMessages", function () {
    var aBarMessages = ["~rawMessage0~", "~rawMessage1~"], aBazMessages = ["~rawMessage2~"], oModel = this.createModel(), oModelMock = this.mock(oModel);
    oModelMock.expects("createUI5Message").withExactArgs(aBarMessages[0], "Team('42')", "foo/bar").returns("~UI5msg0~");
    oModelMock.expects("createUI5Message").withExactArgs(aBarMessages[1], "Team('42')", "foo/bar").returns("~UI5msg1~");
    oModelMock.expects("createUI5Message").withExactArgs(aBazMessages[0], "Team('42')", "foo/baz").returns("~UI5msg2~");
    oModelMock.expects("fireMessageChange").withExactArgs(sinon.match({ newMessages: ["~UI5msg0~", "~UI5msg1~", "~UI5msg2~"], oldMessages: [] }));
    oModel.reportStateMessages("Team('42')", { "foo/bar": aBarMessages, "foo/baz": aBazMessages });
    oModelMock.expects("fireMessageChange").never();
    oModel.reportStateMessages("Team('42')", {});
});
QUnit.test("reportStateMessages: remove old messages w/o key predicates", function (assert) {
    var mMessages = {
        "/FOO('1')": [{}, {}],
        "/FOO('1')/bar": [{ persistent: true }, {}, { persistent: true }, {}],
        "/FOO('2')": [{}],
        "/FOO('3')/NavSingle": [{}],
        "/FOO('3')/NavSingle/Name": [{}, {}],
        "/FOO('3')/NavSingleBar/Name": [{}]
    }, oModel = this.createModel(), oModelMock = this.mock(oModel);
    oModel.mMessages = mMessages;
    oModelMock.expects("fireMessageChange").withExactArgs(sinon.match.object).callsFake(function (mArguments) {
        var aNewMessages = mArguments.newMessages, aOldMessages = mArguments.oldMessages;
        assert.ok(aOldMessages.indexOf(mMessages["/FOO('1')"][0]) >= 0);
        assert.ok(aOldMessages.indexOf(mMessages["/FOO('1')"][1]) >= 0);
        assert.ok(aOldMessages.indexOf(mMessages["/FOO('1')/bar"][0]) < 0);
        assert.ok(aOldMessages.indexOf(mMessages["/FOO('1')/bar"][1]) >= 0);
        assert.ok(aOldMessages.indexOf(mMessages["/FOO('1')/bar"][2]) < 0);
        assert.ok(aOldMessages.indexOf(mMessages["/FOO('1')/bar"][3]) >= 0);
        assert.strictEqual(aNewMessages.length, 0);
        assert.strictEqual(aOldMessages.length, 4);
    });
    oModel.reportStateMessages("FOO('1')", {});
    oModelMock.expects("fireMessageChange").withExactArgs(sinon.match.object).callsFake(function (mArguments) {
        var aNewMessages = mArguments.newMessages, aOldMessages = mArguments.oldMessages;
        assert.ok(aOldMessages.indexOf(mMessages["/FOO('3')/NavSingle"][0]) >= 0);
        assert.ok(aOldMessages.indexOf(mMessages["/FOO('3')/NavSingle/Name"][0]) >= 0);
        assert.ok(aOldMessages.indexOf(mMessages["/FOO('3')/NavSingle/Name"][1]) >= 0);
        assert.ok(aOldMessages.indexOf(mMessages["/FOO('3')/NavSingleBar/Name"][0]) < 0);
        assert.strictEqual(aNewMessages.length, 0);
        assert.strictEqual(aOldMessages.length, 3);
    });
    oModel.reportStateMessages("FOO('3')/NavSingle", {});
});
QUnit.test("reportStateMessages: remove old messages with key predicates", function (assert) {
    var oHelperMock = this.mock(_Helper), mMessages = {
        "/FOO('1')": [{}, {}],
        "/FOO('1')/bar": [{}],
        "/FOO('2')": [{ persistent: true }, {}, { persistent: true }, {}],
        "/FOO('3')/NavSingle": [{}],
        "/FOO('3')/NavSingle/Name": [{}, {}],
        "/FOO('3')/NavSingleBar/Name": [{}]
    }, oModel = this.createModel(), oModelMock = this.mock(oModel);
    oModel.mMessages = mMessages;
    oHelperMock.expects("buildPath").withExactArgs("/FOO", "('1')").returns("/FOO('1')");
    oHelperMock.expects("buildPath").withExactArgs("/FOO", "('2')").returns("/FOO('2')");
    oModelMock.expects("fireMessageChange").withExactArgs(sinon.match.object).callsFake(function (mArguments) {
        var aNewMessages = mArguments.newMessages, aOldMessages = mArguments.oldMessages;
        assert.ok(aOldMessages.indexOf(mMessages["/FOO('1')"][0]) >= 0);
        assert.ok(aOldMessages.indexOf(mMessages["/FOO('1')"][1]) >= 0);
        assert.ok(aOldMessages.indexOf(mMessages["/FOO('1')/bar"][0]) >= 0);
        assert.ok(aOldMessages.indexOf(mMessages["/FOO('2')"][0]) < 0);
        assert.ok(aOldMessages.indexOf(mMessages["/FOO('2')"][1]) >= 0);
        assert.ok(aOldMessages.indexOf(mMessages["/FOO('2')"][2]) < 0);
        assert.ok(aOldMessages.indexOf(mMessages["/FOO('2')"][3]) >= 0);
        assert.ok(aOldMessages.indexOf(mMessages["/FOO('3')/NavSingleBar/Name"][0]) < 0);
        assert.strictEqual(aNewMessages.length, 0);
        assert.strictEqual(aOldMessages.length, 5);
    });
    oModel.reportStateMessages("FOO", {}, ["('1')", "('2')"]);
});
QUnit.test("reportStateMessages: remove old messages - complete collection", function (assert) {
    var mMessages = {
        "/FOO('1')": [{}, {}],
        "/FOO('1')/bar": [{}],
        "/FOO('2')": [{ persistent: true }, {}, { persistent: true }, {}],
        "/FOO('3')/NavSingle": [{}],
        "/FOO('3')/NavSingle/Name": [{}, {}],
        "/FOO('3')/NavSingleBar/Name": [{}]
    }, oModel = this.createModel(), oModelMock = this.mock(oModel);
    oModel.mMessages = mMessages;
    oModelMock.expects("fireMessageChange").withExactArgs(sinon.match.object).callsFake(function (mArguments) {
        var aNewMessages = mArguments.newMessages, aOldMessages = mArguments.oldMessages;
        assert.ok(aOldMessages.indexOf(mMessages["/FOO('1')"][0]) >= 0);
        assert.ok(aOldMessages.indexOf(mMessages["/FOO('1')"][1]) >= 0);
        assert.ok(aOldMessages.indexOf(mMessages["/FOO('1')/bar"][0]) >= 0);
        assert.ok(aOldMessages.indexOf(mMessages["/FOO('2')"][0]) < 0);
        assert.ok(aOldMessages.indexOf(mMessages["/FOO('2')"][1]) >= 0);
        assert.ok(aOldMessages.indexOf(mMessages["/FOO('2')"][2]) < 0);
        assert.ok(aOldMessages.indexOf(mMessages["/FOO('2')"][3]) >= 0);
        assert.ok(aOldMessages.indexOf(mMessages["/FOO('3')/NavSingle"][0]) >= 0);
        assert.ok(aOldMessages.indexOf(mMessages["/FOO('3')/NavSingle/Name"][0]) >= 0);
        assert.ok(aOldMessages.indexOf(mMessages["/FOO('3')/NavSingle/Name"][1]) >= 0);
        assert.ok(aOldMessages.indexOf(mMessages["/FOO('3')/NavSingleBar/Name"][0]) >= 0);
        assert.strictEqual(aNewMessages.length, 0);
        assert.strictEqual(aOldMessages.length, 9);
    });
    oModel.reportStateMessages("FOO", {});
});
QUnit.test("getAllBindings", function (assert) {
    var oModel = this.createModel(), oBinding1 = new Binding(oModel, "relative"), oBinding2 = new Binding(oModel, "/absolute");
    assert.deepEqual(oModel.aAllBindings, []);
    assert.deepEqual(oModel.getAllBindings(), oModel.aAllBindings);
    assert.notStrictEqual(oModel.getAllBindings(), oModel.aAllBindings);
    oModel.bindingCreated(oBinding1);
    oModel.bindingCreated(oBinding2);
    assert.deepEqual(oModel.aAllBindings, [oBinding1, oBinding2]);
    assert.deepEqual(oModel.getAllBindings(), oModel.aAllBindings);
    assert.notStrictEqual(oModel.getAllBindings(), oModel.aAllBindings);
});
QUnit.test("withUnresolvedBindings", function (assert) {
    var oAbsoluteBinding = {
        isResolved: function () { }
    }, oModel = this.createModel(), vParameter = {}, oResolvedBinding = {
        isResolved: function () { }
    }, oUnresolvedBinding0 = {
        anyCallback: function () { },
        isResolved: function () { }
    }, oUnresolvedBinding0Mock = this.mock(oUnresolvedBinding0), oUnresolvedBinding1 = {
        anyCallback: function () { },
        isResolved: function () { }
    }, oUnresolvedBinding2 = {
        anyCallback: function () { },
        isResolved: function () { }
    }, oUnresolvedBinding2Mock = this.mock(oUnresolvedBinding2);
    this.mock(oModel).expects("getAllBindings").never();
    oModel.aAllBindings = [];
    assert.strictEqual(oModel.withUnresolvedBindings(), false);
    oModel.aAllBindings = [oResolvedBinding, oUnresolvedBinding0, oAbsoluteBinding, oUnresolvedBinding1, oUnresolvedBinding2];
    this.mock(oResolvedBinding).expects("isResolved").withExactArgs().returns(true);
    oUnresolvedBinding0Mock.expects("isResolved").withExactArgs().returns(false);
    oUnresolvedBinding0Mock.expects("anyCallback").withExactArgs(sinon.match.same(vParameter)).returns(false);
    this.mock(oAbsoluteBinding).expects("isResolved").withExactArgs().returns(true);
    this.mock(oUnresolvedBinding1).expects("isResolved").withExactArgs().returns(false);
    this.mock(oUnresolvedBinding1).expects("anyCallback").withExactArgs(sinon.match.same(vParameter)).returns(true);
    oUnresolvedBinding2Mock.expects("isResolved").withExactArgs().returns(false);
    oUnresolvedBinding2Mock.expects("anyCallback").never();
    assert.strictEqual(oModel.withUnresolvedBindings("anyCallback", vParameter), true);
    oModel.aAllBindings = [oUnresolvedBinding0, oUnresolvedBinding2];
    oUnresolvedBinding0Mock.expects("isResolved").withExactArgs().returns(false);
    oUnresolvedBinding0Mock.expects("anyCallback").withExactArgs(sinon.match.same(vParameter)).returns(false);
    oUnresolvedBinding2Mock.expects("isResolved").withExactArgs().returns(false);
    oUnresolvedBinding2Mock.expects("anyCallback").withExactArgs(sinon.match.same(vParameter)).returns();
    assert.strictEqual(oModel.withUnresolvedBindings("anyCallback", vParameter), false);
});
QUnit.test("lockGroup", function (assert) {
    var fnCancel = {}, sGroupId = {}, oGroupLock = {}, bLocked = {}, oModel = this.createModel(), bModifying = {}, oOwner = {};
    this.mock(oModel.oRequestor).expects("lockGroup").withExactArgs(sinon.match.same(sGroupId), sinon.match.same(oOwner), sinon.match.same(bLocked), sinon.match.same(bModifying), sinon.match.same(fnCancel)).returns(oGroupLock);
    assert.strictEqual(oModel.lockGroup(sGroupId, oOwner, bLocked, bModifying, fnCancel), oGroupLock);
});
QUnit.test("changeHttpHeaders", function (assert) {
    var oModel = this.createModel(), mHeaders = oModel.mHeaders, mMetadataHeaders = oModel.mMetadataHeaders, mMyHeaders = { abc: undefined, def: undefined, "x-CsRf-ToKeN": "abc123" }, oRequestorMock = this.mock(oModel.oRequestor);
    assert.deepEqual(mHeaders, { "Accept-Language": "ab-CD" });
    oRequestorMock.expects("checkHeaderNames").withExactArgs(sinon.match.object);
    oRequestorMock.expects("checkForOpenRequests").withExactArgs().exactly(5);
    oModel.changeHttpHeaders({ aBc: "xyz" });
    assert.strictEqual(oModel.mHeaders, mHeaders);
    assert.strictEqual(oModel.mMetadataHeaders, mMetadataHeaders);
    assert.deepEqual(mHeaders, { "Accept-Language": "ab-CD", aBc: "xyz" });
    assert.deepEqual(mMetadataHeaders, { "Accept-Language": "ab-CD", aBc: "xyz" });
    oRequestorMock.expects("checkHeaderNames").withExactArgs(sinon.match.object);
    oModel.changeHttpHeaders({ AbC: "12 [3] $4: ~" });
    assert.deepEqual(mMetadataHeaders, { AbC: "12 [3] $4: ~", "Accept-Language": "ab-CD" });
    assert.deepEqual(mHeaders, { AbC: "12 [3] $4: ~", "Accept-Language": "ab-CD" });
    oRequestorMock.expects("checkHeaderNames").withExactArgs(sinon.match.same(mMyHeaders));
    oModel.changeHttpHeaders(mMyHeaders);
    assert.deepEqual(mMetadataHeaders, { "Accept-Language": "ab-CD" });
    assert.deepEqual(mHeaders, { "Accept-Language": "ab-CD", "X-CSRF-Token": "abc123" });
    assert.deepEqual(mMyHeaders, { abc: undefined, def: undefined, "x-CsRf-ToKeN": "abc123" });
    oRequestorMock.expects("checkHeaderNames").withExactArgs(undefined);
    oModel.changeHttpHeaders();
    assert.deepEqual(mMetadataHeaders, { "Accept-Language": "ab-CD" });
    assert.deepEqual(mHeaders, { "Accept-Language": "ab-CD", "X-CSRF-Token": "abc123" });
    oRequestorMock.expects("checkHeaderNames").withExactArgs(null);
    oModel.changeHttpHeaders(null);
    assert.deepEqual(mMetadataHeaders, { "Accept-Language": "ab-CD" });
    assert.deepEqual(mHeaders, { "Accept-Language": "ab-CD", "X-CSRF-Token": "abc123" });
});
[true, 42, NaN, {}, null, function () { }, "", "Mot\u00F6rhead", "a\r\nb: c"].forEach(function (vValue) {
    QUnit.test("changeHttpHeaders: unsupported header value: " + vValue, function (assert) {
        var oModel = this.createModel();
        oModel.changeHttpHeaders({ def: "123" });
        assert.throws(function () {
            oModel.changeHttpHeaders({ def: undefined, abc: vValue });
        }, new Error("Unsupported value for header 'abc': " + vValue));
        assert.deepEqual(oModel.mHeaders, { "Accept-Language": "ab-CD", def: "123" });
        assert.deepEqual(oModel.mMetadataHeaders, { "Accept-Language": "ab-CD", def: "123" });
    });
});
["123", undefined].forEach(function (sValue) {
    QUnit.test("changeHttpHeaders: duplicate header name, value: " + sValue, function (assert) {
        var oModel = this.createModel();
        assert.throws(function () {
            oModel.changeHttpHeaders({ aBc: sValue, AbC: "456" });
        }, new Error("Duplicate header AbC"));
        assert.deepEqual(oModel.mHeaders, { "Accept-Language": "ab-CD" });
        assert.deepEqual(oModel.mMetadataHeaders, { "Accept-Language": "ab-CD" });
    });
});
QUnit.test("changeHttpHeaders: error on open requests", function (assert) {
    var oError = new Error("message"), oModel = this.createModel();
    this.mock(oModel.oRequestor).expects("checkForOpenRequests").withExactArgs().throws(oError);
    assert.throws(function () {
        oModel.changeHttpHeaders({ abc: "123" });
    }, oError);
    assert.deepEqual(oModel.mHeaders, { "Accept-Language": "ab-CD" });
    assert.deepEqual(oModel.mMetadataHeaders, { "Accept-Language": "ab-CD" });
});
QUnit.test("getHttpHeaders", function (assert) {
    var oModel = this.createModel();
    assert.deepEqual(oModel.getHttpHeaders(), { "Accept-Language": "ab-CD" });
    assert.deepEqual(oModel.getHttpHeaders(true), { "Accept-Language": "ab-CD" });
    assert.notStrictEqual(oModel.getHttpHeaders(), oModel.getHttpHeaders(), "no copy on write");
    assert.deepEqual(oModel.mHeaders, { "Accept-Language": "ab-CD" }, "model's headers unchanged");
    oModel.mHeaders["SAP-ContextId"] = "123";
    oModel.mHeaders["X-CSRF-Token"] = null;
    assert.deepEqual(oModel.getHttpHeaders(), { "Accept-Language": "ab-CD" });
    assert.deepEqual(oModel.getHttpHeaders(true), { "Accept-Language": "ab-CD", "SAP-ContextId": "123" });
    assert.deepEqual(oModel.mHeaders, {
        "Accept-Language": "ab-CD",
        "SAP-ContextId": "123",
        "X-CSRF-Token": null
    }, "model's headers unchanged");
    oModel.mHeaders["X-CSRF-Token"] = "xyz";
    assert.deepEqual(oModel.getHttpHeaders(), { "Accept-Language": "ab-CD", "X-CSRF-Token": "xyz" });
    assert.deepEqual(oModel.getHttpHeaders(true), { "Accept-Language": "ab-CD", "SAP-ContextId": "123", "X-CSRF-Token": "xyz" });
    assert.deepEqual(oModel.mHeaders, {
        "Accept-Language": "ab-CD",
        "SAP-ContextId": "123",
        "X-CSRF-Token": "xyz"
    }, "model's headers unchanged");
});
QUnit.test("getMessages", function (assert) {
    var oContext = {
        getPath: function () { return "~path~"; }
    }, aMessagesByPath = [], oModel = this.createModel();
    this.mock(oModel).expects("getMessagesByPath").withExactArgs("~path~", true).returns(aMessagesByPath);
    this.mock(aMessagesByPath).expects("sort").withExactArgs(Message.compare).returns("~messagesByPathSorted~");
    assert.strictEqual(oModel.getMessages(oContext), "~messagesByPathSorted~");
});
QUnit.test("addPrerenderingTask: queue", function (assert) {
    var oExpectation = this.mock(sap.ui.getCore()).expects("addPrerenderingTask").withExactArgs(sinon.match.func), fnFirstPrerenderingTask = "first", fnPrerenderingTask0 = "0", fnPrerenderingTask1 = "1", oModel = this.createModel("", {}, true);
    this.mock(window).expects("setTimeout");
    assert.strictEqual(oModel.aPrerenderingTasks, null);
    oModel.addPrerenderingTask(fnPrerenderingTask0);
    oExpectation.verify();
    assert.deepEqual(oModel.aPrerenderingTasks, [fnPrerenderingTask0]);
    oModel.addPrerenderingTask(fnPrerenderingTask1);
    assert.deepEqual(oModel.aPrerenderingTasks, [fnPrerenderingTask0, fnPrerenderingTask1]);
    oModel.addPrerenderingTask(fnFirstPrerenderingTask, true);
    assert.deepEqual(oModel.aPrerenderingTasks, [fnFirstPrerenderingTask, fnPrerenderingTask0, fnPrerenderingTask1]);
});
QUnit.test("addPrerenderingTask: rendering before 1st setTimeout", function (assert) {
    var oAddTaskMock, fnFirstTask = this.spy(), fnLastTask = this.spy(), oModel = this.createModel("", {}, true), fnPrerenderingTask0 = this.spy(function () {
        assert.notStrictEqual(oModel.aPrerenderingTasks, null);
        oModel.addPrerenderingTask(fnFirstTask, true);
    }), fnPrerenderingTask1 = this.spy(function () {
        oModel.addPrerenderingTask(fnLastTask);
    });
    oAddTaskMock = this.mock(sap.ui.getCore()).expects("addPrerenderingTask").withExactArgs(sinon.match.func);
    this.mock(window).expects("setTimeout").withExactArgs(sinon.match.func, 0).returns(42);
    oModel.addPrerenderingTask(fnPrerenderingTask0);
    oModel.addPrerenderingTask(fnPrerenderingTask1);
    this.mock(window).expects("clearTimeout").withExactArgs(42);
    oAddTaskMock.firstCall.args[0]();
    assert.ok(fnPrerenderingTask0.calledOnce);
    assert.ok(fnPrerenderingTask0.calledOn());
    assert.ok(fnPrerenderingTask0.calledWithExactly());
    assert.ok(fnFirstTask.calledOnce);
    assert.ok(fnFirstTask.calledOn());
    assert.ok(fnFirstTask.calledWithExactly());
    assert.ok(fnFirstTask.calledAfter(fnPrerenderingTask0));
    assert.ok(fnPrerenderingTask1.calledOnce);
    assert.ok(fnPrerenderingTask1.calledOn());
    assert.ok(fnPrerenderingTask1.calledWithExactly());
    assert.ok(fnPrerenderingTask1.calledAfter(fnFirstTask));
    assert.ok(fnLastTask.calledOnce);
    assert.ok(fnLastTask.calledOn());
    assert.ok(fnLastTask.calledWithExactly());
    assert.ok(fnLastTask.calledAfter(fnPrerenderingTask1));
    assert.strictEqual(oModel.aPrerenderingTasks, null);
});
QUnit.test("addPrerenderingTask: rendering before 2nd setTimeout", function (assert) {
    var oAddTaskExpectation, oModel = this.createModel("", {}, true), oSetTimeoutExpectation, fnTask = this.spy(), oWindowMock = this.mock(window);
    oAddTaskExpectation = this.mock(sap.ui.getCore()).expects("addPrerenderingTask").withExactArgs(sinon.match.func);
    oSetTimeoutExpectation = oWindowMock.expects("setTimeout").withExactArgs(sinon.match.func, 0);
    oModel.addPrerenderingTask(fnTask);
    assert.ok(fnTask.notCalled);
    oWindowMock.expects("setTimeout").withExactArgs(sinon.match.func, 0).returns(42);
    oSetTimeoutExpectation.args[0][0]();
    assert.ok(fnTask.notCalled);
    oWindowMock.expects("clearTimeout").withExactArgs(42);
    oAddTaskExpectation.firstCall.args[0]();
    assert.ok(fnTask.calledOnce);
});
QUnit.test("addPrerenderingTask: via setTimeout", function (assert) {
    var oAddTaskExpectation, oModel = this.createModel("", {}, true), oSetTimeoutExpectation, fnTask1 = this.spy(), fnTask2 = "~task~2~";
    oAddTaskExpectation = this.mock(sap.ui.getCore()).expects("addPrerenderingTask").twice().withExactArgs(sinon.match.func);
    oSetTimeoutExpectation = this.mock(window).expects("setTimeout").thrice().withExactArgs(sinon.match.func, 0);
    oModel.addPrerenderingTask(fnTask1);
    assert.ok(fnTask1.notCalled);
    oSetTimeoutExpectation.args[0][0]();
    assert.ok(fnTask1.notCalled);
    oSetTimeoutExpectation.args[1][0]();
    assert.ok(fnTask1.calledOnce);
    oModel.addPrerenderingTask(fnTask2);
    oAddTaskExpectation.firstCall.args[0]();
    assert.deepEqual(oModel.aPrerenderingTasks, [fnTask2]);
});
QUnit.test("requestSideEffects", function (assert) {
    var oBinding1 = {
        isRoot: function () { return true; },
        requestAbsoluteSideEffects: function () { }
    }, oBinding2 = {
        isRoot: function () { return false; },
        requestAbsoluteSideEffects: function () { }
    }, oBinding3 = {
        isRoot: function () { return true; },
        requestAbsoluteSideEffects: function () { }
    }, oModel = this.createModel(), aPaths = ["/foo", "/bar/baz"], oPromise;
    oModel.aAllBindings = [oBinding1, oBinding2, oBinding3];
    this.mock(oBinding1).expects("requestAbsoluteSideEffects").withExactArgs("group", sinon.match.same(aPaths)).resolves("~1");
    this.mock(oBinding2).expects("requestAbsoluteSideEffects").never();
    this.mock(oBinding3).expects("requestAbsoluteSideEffects").withExactArgs("group", sinon.match.same(aPaths)).resolves("~3");
    oPromise = oModel.requestSideEffects("group", aPaths);
    assert.notOk(oPromise.isFulfilled());
    return oPromise.then(function (aResults) {
        assert.deepEqual(aResults, ["~1", "~3"]);
    });
});
QUnit.test("requestSideEffects: nothing to do", function (assert) {
    var oBinding = {
        isRoot: function () { return true; },
        requestAbsoluteSideEffects: function () { }
    }, oModel = this.createModel();
    oModel.aAllBindings = [oBinding];
    this.mock(oBinding).expects("requestAbsoluteSideEffects").never();
    assert.strictEqual(oModel.requestSideEffects("group", []), undefined);
});
QUnit.test("filterMatchingMessages: no match", function (assert) {
    var oModel = this.createModel();
    this.mock(_Helper).expects("hasPathPrefix").withExactArgs("/target", "/prefix").returns(false);
    assert.deepEqual(oModel.filterMatchingMessages("/target", "/prefix"), []);
});
QUnit.test("filterMatchingMessages: match", function (assert) {
    var aMessages = [], oModel = this.createModel();
    oModel.mMessages = {
        "/target": aMessages
    };
    this.mock(_Helper).expects("hasPathPrefix").withExactArgs("/target", "/prefix").returns(true);
    assert.strictEqual(oModel.filterMatchingMessages("/target", "/prefix"), aMessages);
});
[Promise, SyncPromise].forEach(function (oThenable) {
    QUnit.test("getReporter " + oThenable, function () {
        var oError1 = new Error("failed intentionally"), oError2 = new Error("already reported"), oModel = this.createModel(), oPromise1 = oThenable.reject(oError1), oPromise2 = oThenable.reject(oError2);
        this.mock(oModel).expects("reportError").withExactArgs(oError1.message, sClassName, sinon.match.same(oError1));
        oPromise1.catch(oModel.getReporter());
        oError2.$reported = true;
        oPromise2.catch(oModel.getReporter());
        return Promise.all([oPromise1, oPromise2]).catch(function () { });
    });
});
QUnit.test("createUI5Message: basic tests", function (assert) {
    var oModel = this.createModel(), oRawMessage = {
        code: "CODE",
        longtextUrl: "longtextUrl",
        message: "message",
        technical: "technical",
        transition: false
    }, oUI5Message;
    this.mock(_Helper).expects("createTechnicalDetails").withExactArgs(sinon.match.same(oRawMessage)).returns("~technicalDetails~");
    oUI5Message = oModel.createUI5Message(oRawMessage);
    assert.ok(oUI5Message instanceof Message);
    assert.strictEqual(oUI5Message.getCode(), "CODE");
    assert.strictEqual(oUI5Message.getDescriptionUrl(), "longtextUrl");
    assert.strictEqual(oUI5Message.getMessage(), "message");
    assert.strictEqual(oUI5Message.getTechnical(), "technical");
    assert.strictEqual(oUI5Message.processor, oModel);
    assert.strictEqual(oUI5Message.getPersistent(), true);
    assert.strictEqual(oUI5Message.getTarget(), "");
    assert.strictEqual(oUI5Message.getTechnicalDetails(), "~technicalDetails~");
});
[
    { numericSeverity: undefined, type: MessageType.None },
    { numericSeverity: null, type: MessageType.None },
    { numericSeverity: 1, type: MessageType.Success },
    { numericSeverity: 2, type: MessageType.Information },
    { numericSeverity: 3, type: MessageType.Warning },
    { numericSeverity: 4, type: MessageType.Error },
    { numericSeverity: 5, type: MessageType.None }
].forEach(function (oFixture) {
    var sTitle = "createUI5Message: numeric severities: " + oFixture.numericSeverity;
    QUnit.test(sTitle, function (assert) {
        this.mock(_Helper).expects("createTechnicalDetails");
        assert.strictEqual(this.createModel().createUI5Message({ numericSeverity: oFixture.numericSeverity }).type, oFixture.type);
    });
});
[undefined, "target"].forEach(function (sTarget) {
    QUnit.test("createUI5Message: longtextUrl, target: " + sTarget, function (assert) {
        var oRawMessage = {
            longtextUrl: "longtextUrl",
            target: sTarget
        };
        this.mock(_Helper).expects("createTechnicalDetails");
        this.mock(_Helper).expects("makeAbsolute").withExactArgs("longtextUrl", sServiceUrl + "~path~").returns("~absoluteLongtextUrl~");
        assert.strictEqual(this.createModel().createUI5Message(oRawMessage, "~path~").getDescriptionUrl(), "~absoluteLongtextUrl~");
    });
});
QUnit.test("createUI5Message: makeAbsolute for empty longtextUrl", function (assert) {
    this.mock(_Helper).expects("createTechnicalDetails");
    assert.strictEqual(this.createModel().createUI5Message({ longtextUrl: "" }).getDescriptionUrl(), undefined);
});
[{
        target: "",
        expectedTargets: ["/res/cache/"]
    }, {
        target: "target",
        expectedTargets: ["/res/cache/target"]
    }, {
        target: "/target",
        additionalTargets: ["/add0", "/add1"],
        transition: true,
        expectedTargets: ["/target", "/add0", "/add1"],
        expectedPersistent: true
    }, {
        target: "target",
        additionalTargets: ["add0", "add1"],
        expectedTargets: [
            "/res/cache/target",
            "/res/cache/add0",
            "/res/cache/add1"
        ]
    }, {
        target: "target",
        additionalTargets: ["/alreadyResolvedAdd0", "add1"],
        expectedTargets: [
            "/res/cache/target",
            "/alreadyResolvedAdd0",
            "/res/cache/add1"
        ]
    }].forEach(function (oFixture, i) {
    QUnit.test("createUI5Message: bound: " + i, function (assert) {
        var oHelperMock = this.mock(_Helper), oModel = this.createModel(), oRawMessage = {
            target: oFixture.target,
            additionalTargets: oFixture.additionalTargets,
            transition: oFixture.transition
        }, oUI5Message;
        oHelperMock.expects("createTechnicalDetails");
        oHelperMock.expects("buildPath").never();
        [oFixture.target].concat(oFixture.additionalTargets || []).forEach(function (sTarget) {
            if (sTarget[0] !== "/") {
                oHelperMock.expects("buildPath").withExactArgs("/" + "~resourcePath~", "~cachePath~", sTarget).returns("/res/cache/" + sTarget);
            }
        });
        oUI5Message = oModel.createUI5Message(oRawMessage, "~resourcePath~", "~cachePath~");
        assert.deepEqual(oUI5Message.getTargets(), oFixture.expectedTargets);
        assert.strictEqual(oUI5Message.getPersistent(), oFixture.expectedPersistent || false);
    });
});
QUnit.test("createUI5Message: no resourcePath", function (assert) {
    var oHelperMock = this.mock(_Helper), oModel = this.createModel(), oRawMessage = {
        target: "/foo"
    }, oUI5Message;
    oHelperMock.expects("createTechnicalDetails");
    oUI5Message = oModel.createUI5Message(oRawMessage);
    assert.deepEqual(oUI5Message.getTargets(), ["/foo"]);
});
QUnit.test("createUI5Message: resource path w/ query string", function (assert) {
    var oHelperMock = this.mock(_Helper), oModel = this.createModel(), oRawMessage = {
        target: "foo",
        additionalTargets: ["bar", "baz"]
    }, oUI5Message;
    oHelperMock.expects("createTechnicalDetails");
    oUI5Message = oModel.createUI5Message(oRawMessage, "~resourcePath~?foo=bar", "~cachePath~");
    assert.deepEqual(oUI5Message.getTargets(), [
        "/~resourcePath~/~cachePath~/foo",
        "/~resourcePath~/~cachePath~/bar",
        "/~resourcePath~/~cachePath~/baz"
    ]);
});