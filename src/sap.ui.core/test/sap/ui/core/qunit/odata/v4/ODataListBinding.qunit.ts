import Log from "sap/base/Log";
import SyncPromise from "sap/ui/base/SyncPromise";
import Binding from "sap/ui/model/Binding";
import ChangeReason from "sap/ui/model/ChangeReason";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import FilterProcessor from "sap/ui/model/FilterProcessor";
import FilterType from "sap/ui/model/FilterType";
import ListBinding from "sap/ui/model/ListBinding";
import Sorter from "sap/ui/model/Sorter";
import OperationMode from "sap/ui/model/odata/OperationMode";
import Context from "sap/ui/model/odata/v4/Context";
import ODataListBinding from "sap/ui/model/odata/v4/ODataListBinding";
import ODataModel from "sap/ui/model/odata/v4/ODataModel";
import asODataParentBinding from "sap/ui/model/odata/v4/ODataParentBinding";
import _AggregationCache from "sap/ui/model/odata/v4/lib/_AggregationCache";
import _AggregationHelper from "sap/ui/model/odata/v4/lib/_AggregationHelper";
import _Cache from "sap/ui/model/odata/v4/lib/_Cache";
import _GroupLock from "sap/ui/model/odata/v4/lib/_GroupLock";
import _Helper from "sap/ui/model/odata/v4/lib/_Helper";
import _Parser from "sap/ui/model/odata/v4/lib/_Parser";
import TestUtils from "sap/ui/test/TestUtils";
var aAllowedBindingParameters = ["$$aggregation", "$$canonicalPath", "$$groupId", "$$operationMode", "$$ownRequest", "$$patchWithoutSideEffects", "$$sharedRequest", "$$updateGroupId"], sClassName = "sap.ui.model.odata.v4.ODataListBinding", oParentBinding = {
    getRootBinding: function () {
        return {
            isSuspended: function () { return false; }
        };
    }
}, rTransientPredicate = /^\(\$uid=.+\)$/;
function createData(iLength, iStart, bDrillDown, iCount, bKeyPredicates) {
    var oData = { value: [] }, i;
    if (iCount !== undefined) {
        oData.value.$count = iCount;
    }
    iStart = iStart || 0;
    for (i = 0; i < iLength; i += 1) {
        oData.value[i] = {
            Name: "Name " + (iStart + i),
            LOCATION: {
                COUNTRY: "COUNTRY " + (iStart + i)
            },
            NullValue: null
        };
        if (bKeyPredicates) {
            _Helper.setPrivateAnnotation(oData.value[i], "predicate", "('" + (iStart + i) + "')");
        }
    }
    return bDrillDown ? oData.value : oData;
}
QUnit.module("sap.ui.model.odata.v4.ODataListBinding", {
    beforeEach: function () {
        this.oLogMock = this.mock(Log);
        this.oLogMock.expects("error").never();
        this.oLogMock.expects("warning").never();
        this.oModel = new ODataModel({
            serviceUrl: "/service/?sap-client=111",
            synchronizationMode: "None"
        });
        this.oModel.setSizeLimit(3);
        this.mock(this.oModel.oRequestor).expects("request").never();
        this.mock(this.oModel.oRequestor.oModelInterface).expects("fetchMetadata").atLeast(0).returns(SyncPromise.resolve());
        this.mock(_Helper).expects("createError").never();
    },
    afterEach: function () {
        return TestUtils.awaitRendering();
    },
    bindList: function () {
        try {
            this.stub(this.oModel, "addPrerenderingTask");
            return this.oModel.bindList.apply(this.oModel, arguments);
        }
        finally {
            this.oModel.addPrerenderingTask.restore();
        }
    },
    getCacheMock: function () {
        var oCache = {
            read: function () { },
            requestSideEffects: function () { },
            toString: function () { return "/service/EMPLOYEES"; }
        };
        this.mock(_Cache).expects("create").returns(oCache);
        return this.mock(oCache);
    }
});
QUnit.test("mixin", function (assert) {
    var oBinding = this.bindList("EMPLOYEES"), oMixin = {}, aOverriddenFunctions = ["adjustPredicate", "destroy", "fetchCache", "getDependentBindings", "getGeneration", "hasPendingChangesForPath"];
    asODataParentBinding(oMixin);
    aOverriddenFunctions.forEach(function (sFunction) {
        assert.notStrictEqual(oBinding[sFunction], oMixin[sFunction], "overwrite " + sFunction);
    });
    Object.keys(oMixin).forEach(function (sKey) {
        if (aOverriddenFunctions.indexOf(sKey) < 0) {
            assert.strictEqual(oBinding[sKey], oMixin[sKey], sKey);
        }
    });
});
QUnit.test("bindingCreated", function () {
    var oBinding, oExpectation = this.mock(this.oModel).expects("bindingCreated").withExactArgs(sinon.match.object);
    this.mock(ODataListBinding.prototype).expects("getGroupId").returns("myGroup");
    this.mock(ODataListBinding.prototype).expects("createReadGroupLock").withExactArgs("myGroup", true);
    oBinding = this.bindList("/EMPLOYEES");
    sinon.assert.calledWithExactly(oExpectation, sinon.match.same(oBinding));
});
QUnit.test("constructor: lock when creating with base context", function () {
    var oContext = this.oModel.createBindingContext("/TEAMS('42')");
    this.mock(ODataListBinding.prototype).expects("getGroupId").returns("myGroup");
    this.mock(ODataListBinding.prototype).expects("createReadGroupLock").withExactArgs("myGroup", true);
    this.bindList("TEAM_2_EMPLOYEES", oContext);
});
QUnit.test("be V8-friendly", function (assert) {
    var oParentBindingSpy = this.spy(asODataParentBinding, "call"), oBinding = this.bindList("/EMPLOYEES");
    assert.ok(oBinding.hasOwnProperty("aApplicationFilters"));
    assert.ok(oBinding.hasOwnProperty("bCreatedAtEnd"));
    assert.ok(oBinding.hasOwnProperty("sChangeReason"));
    assert.ok(oBinding.hasOwnProperty("aContexts"));
    assert.ok(oBinding.hasOwnProperty("iCreatedContexts"));
    assert.ok(oBinding.hasOwnProperty("iCurrentBegin"));
    assert.ok(oBinding.hasOwnProperty("iCurrentEnd"));
    assert.ok(oBinding.hasOwnProperty("oDiff"));
    assert.ok(oBinding.hasOwnProperty("aFilters"));
    assert.ok(oBinding.hasOwnProperty("sGroupId"));
    assert.ok(oBinding.hasOwnProperty("bHasAnalyticalInfo"));
    assert.ok(oBinding.hasOwnProperty("oHeaderContext"));
    assert.ok(oBinding.hasOwnProperty("bLengthFinal"));
    assert.ok(oBinding.hasOwnProperty("iMaxLength"));
    assert.ok(oBinding.hasOwnProperty("sOperationMode"));
    assert.ok(oBinding.hasOwnProperty("mQueryOptions"));
    assert.ok(oBinding.hasOwnProperty("mParameters"));
    assert.ok(oBinding.hasOwnProperty("mPreviousContextsByPath"));
    assert.ok(oBinding.hasOwnProperty("aPreviousData"));
    assert.ok(oBinding.hasOwnProperty("aSorters"));
    assert.ok(oBinding.hasOwnProperty("sUpdateGroupId"));
    assert.ok(oParentBindingSpy.calledOnceWithExactly(oBinding));
});
[undefined, "AddVirtualContext"].forEach(function (sChangeReason) {
    var sTitle = "initialize: resolved, suspended; sChangeReason = " + sChangeReason;
    QUnit.test(sTitle, function (assert) {
        var oBinding = this.bindList("n/a"), oRootBinding = { isSuspended: function () { } };
        oBinding.sChangeReason = sChangeReason;
        this.mock(oBinding).expects("isResolved").withExactArgs().returns(true);
        this.mock(oBinding).expects("getRootBinding").withExactArgs().returns(oRootBinding);
        this.mock(oRootBinding).expects("isSuspended").withExactArgs().returns(true);
        this.mock(oBinding).expects("_fireChange").never();
        this.mock(oBinding).expects("_fireRefresh").never();
        oBinding.initialize();
        assert.strictEqual(oBinding.sChangeReason, sChangeReason);
        assert.strictEqual(oBinding.sResumeChangeReason, sChangeReason ? ChangeReason.Change : ChangeReason.Refresh);
    });
});
QUnit.test("initialize: resolved, refresh", function (assert) {
    var oBinding = this.bindList("n/a"), oRootBinding = { isSuspended: function () { } };
    oBinding.sChangeReason = undefined;
    this.mock(oBinding).expects("isResolved").withExactArgs().returns(true);
    this.mock(oBinding).expects("getRootBinding").withExactArgs().returns(oRootBinding);
    this.mock(oRootBinding).expects("isSuspended").withExactArgs().returns(false);
    this.mock(oBinding).expects("_fireRefresh").withExactArgs({ reason: ChangeReason.Refresh });
    oBinding.initialize();
    assert.strictEqual(oBinding.sChangeReason, ChangeReason.Refresh);
});
QUnit.test("initialize: resolved, with change reason", function (assert) {
    var oBinding = this.bindList("n/a"), oRootBinding = { isSuspended: function () { } };
    oBinding.sChangeReason = "AddVirtualContext";
    this.mock(oBinding).expects("isResolved").withExactArgs().returns(true);
    this.mock(oBinding).expects("getRootBinding").withExactArgs().returns(oRootBinding);
    this.mock(oRootBinding).expects("isSuspended").withExactArgs().returns(false);
    this.mock(oBinding).expects("_fireChange").withExactArgs({
        detailedReason: "AddVirtualContext",
        reason: ChangeReason.Change
    });
    oBinding.initialize();
    assert.strictEqual(oBinding.sChangeReason, "AddVirtualContext");
});
QUnit.test("initialize: unresolved", function (assert) {
    var oBinding = this.bindList("/n/a"), sChangeReason = {};
    oBinding.sChangeReason = sChangeReason;
    this.mock(oBinding).expects("isResolved").withExactArgs().returns(false);
    this.mock(oBinding).expects("_fireRefresh").never();
    oBinding.initialize();
    assert.strictEqual(oBinding.sChangeReason, sChangeReason);
});
QUnit.test("constructor", function (assert) {
    var oBinding, oContext = {}, oCreateMock, aFilters = [], vFilters = {}, oHeaderContext = {}, oHelperMock = this.mock(_Helper), oODataListBindingMock = this.mock(ODataListBinding.prototype), mParameters = {}, mParametersClone = {
        $$groupId: "group",
        $$operationMode: OperationMode.Server,
        $$sharedRequest: "sharedRequest",
        $$updateGroupId: "update group"
    }, aSorters = [], vSorters = {};
    oCreateMock = this.mock(Context).expects("createNewContext").withExactArgs(sinon.match.same(this.oModel), sinon.match.object, "/EMPLOYEES").returns(oHeaderContext);
    oHelperMock.expects("toArray").withExactArgs(sinon.match.same(vFilters)).returns(aFilters);
    oHelperMock.expects("toArray").withExactArgs(sinon.match.same(vSorters)).returns(aSorters);
    this.mock(_Helper).expects("clone").withExactArgs(sinon.match.same(mParameters)).returns(mParametersClone);
    oODataListBindingMock.expects("checkBindingParameters").withExactArgs(sinon.match.same(mParametersClone), aAllowedBindingParameters);
    oODataListBindingMock.expects("applyParameters").withExactArgs(sinon.match.same(mParametersClone));
    oODataListBindingMock.expects("setContext").withExactArgs(sinon.match.same(oContext));
    oBinding = new ODataListBinding(this.oModel, "/EMPLOYEES", oContext, vSorters, vFilters, mParameters);
    assert.strictEqual(oCreateMock.args[0][1], oBinding);
    assert.strictEqual(oBinding.aApplicationFilters, aFilters);
    assert.strictEqual(oBinding.sChangeReason, undefined);
    assert.strictEqual(oBinding.oDiff, undefined);
    assert.deepEqual(oBinding.aFilters, []);
    assert.strictEqual(oBinding.sGroupId, "group");
    assert.strictEqual(oBinding.bHasAnalyticalInfo, false);
    assert.deepEqual(oBinding.getHeaderContext(), oHeaderContext);
    assert.strictEqual(oBinding.sOperationMode, OperationMode.Server);
    assert.deepEqual(oBinding.mPreviousContextsByPath, {});
    assert.deepEqual(oBinding.aPreviousData, []);
    assert.strictEqual(oBinding.bSharedRequest, "sharedRequest");
    assert.strictEqual(oBinding.aSorters, aSorters);
    assert.strictEqual(oBinding.sUpdateGroupId, "update group");
});
QUnit.test("constructor: $$sharedRequest from model", function (assert) {
    var oBinding, bSharedRequests = {};
    this.oModel.bSharedRequests = bSharedRequests;
    oBinding = new ODataListBinding(this.oModel, "/EMPLOYEES");
    assert.strictEqual(oBinding.bSharedRequest, bSharedRequests);
});
[false, true].forEach(function (bAutoExpandSelect) {
    QUnit.test("c'tor: AddVirtualContext = " + bAutoExpandSelect, function (assert) {
        var oBinding;
        this.oModel.bAutoExpandSelect = bAutoExpandSelect;
        oBinding = this.bindList("/EMPLOYEES");
        assert.strictEqual(oBinding.sChangeReason, bAutoExpandSelect ? "AddVirtualContext" : undefined);
    });
});
QUnit.test("c'tor: no AddVirtualContext w/ $$aggregation", function (assert) {
    var oBinding;
    this.oModel.bAutoExpandSelect = true;
    oBinding = this.bindList("/EMPLOYEES", null, [], [], {
        $$aggregation: { aggregate: { "n/a": {} } }
    });
    assert.strictEqual(oBinding.sChangeReason, undefined);
});
QUnit.test("c'tor: error case", function (assert) {
    assert.throws(function () {
        this.bindList("/EMPLOYEES", undefined, new Sorter("ID"));
    }, new Error("Unsupported operation mode: undefined"));
});
QUnit.test("setAggregation: pending changes", function (assert) {
    var oBinding = this.bindList("/EMPLOYEES");
    this.mock(oBinding).expects("hasPendingChanges").withExactArgs().returns(true);
    assert.throws(function () {
        oBinding.setAggregation({});
    }, new Error("Cannot set $$aggregation due to pending changes"));
});
[null, { group: { dimension: {} } }].forEach(function (oAggregation, i) {
    QUnit.test("setAggregation, " + i, function () {
        var oBinding = this.bindList("/EMPLOYEES", undefined, undefined, undefined, {
            $$aggregation: { aggregate: { "n/a": {} } },
            $$groupId: "foo",
            $filter: "bar",
            custom: "baz"
        });
        this.mock(oBinding).expects("resetKeepAlive").withExactArgs();
        this.mock(oBinding).expects("applyParameters").withExactArgs({
            $$aggregation: oAggregation,
            $$groupId: "foo",
            $filter: "bar",
            custom: "baz"
        }, "");
        oBinding.setAggregation(oAggregation);
    });
});
QUnit.test("setAggregation: undefined", function () {
    var oBinding = this.bindList("/EMPLOYEES", undefined, undefined, undefined, {
        $$aggregation: { aggregate: { "n/a": {} } },
        $$groupId: "foo",
        $filter: "bar",
        custom: "baz"
    });
    this.mock(oBinding).expects("resetKeepAlive").never();
    this.mock(oBinding).expects("applyParameters").withExactArgs({
        $$groupId: "foo",
        $filter: "bar",
        custom: "baz"
    }, "");
    oBinding.setAggregation();
});
[undefined, { group: { dimension: {} } }].forEach(function (oAggregation) {
    QUnit.test("setAggregation: applyParameters fails", function (assert) {
        var oBinding = this.bindList("/EMPLOYEES", undefined, undefined, undefined, {
            $$aggregation: { aggregate: { "n/a": {} } },
            $$groupId: "foo",
            $filter: "bar",
            custom: "baz"
        }), oError = new Error("This call intentionally failed"), mExpectedParameters = {
            $$groupId: "foo",
            $filter: "bar",
            custom: "baz"
        }, sOldValue = JSON.stringify(oBinding.mParameters.$$aggregation);
        if (oAggregation) {
            mExpectedParameters.$$aggregation = oAggregation;
        }
        this.mock(oBinding).expects("applyParameters").withExactArgs(mExpectedParameters, "").throws(oError);
        assert.throws(function () {
            oBinding.setAggregation(oAggregation);
        }, oError);
        assert.strictEqual(JSON.stringify(oBinding.mParameters.$$aggregation), sOldValue, "old value unchanged");
    });
});
QUnit.test("applyParameters: simulate call from c'tor", function (assert) {
    var oAggregation = {}, sApply = "A.P.P.L.E.", oBinding = this.bindList("/EMPLOYEES"), oExpectation, oModelMock = this.mock(this.oModel), mParameters = {
        $$aggregation: oAggregation,
        $filter: "bar"
    };
    assert.strictEqual(oBinding.mParameters.$$aggregation, undefined, "initial value");
    oBinding.mCacheByResourcePath = {
        "/Products": {}
    };
    oBinding.oHeaderContext = undefined;
    this.mock(_AggregationHelper).expects("buildApply").withExactArgs(sinon.match.same(oAggregation)).returns({ $apply: sApply });
    oModelMock.expects("buildQueryOptions").withExactArgs(sinon.match.same(mParameters), true).returns({ $filter: "bar" });
    oExpectation = this.mock(oBinding).expects("removeCachesAndMessages").withExactArgs("");
    this.mock(oBinding).expects("fetchCache").callsFake(function () {
        assert.ok(oExpectation.called);
    });
    this.mock(oBinding).expects("reset").withExactArgs(undefined);
    oBinding.applyParameters(mParameters);
    assert.deepEqual(oBinding.mQueryOptions, {
        $apply: sApply,
        $filter: "bar"
    }, "mQueryOptions");
    assert.deepEqual(oBinding.mParameters, mParameters);
    assert.strictEqual(oBinding.mParameters.$$aggregation, oAggregation, "$$aggregation");
});
QUnit.test("applyParameters: $$aggregation & $apply", function (assert) {
    var oBinding = this.bindList("/EMPLOYEES");
    assert.throws(function () {
        oBinding.applyParameters({ $$aggregation: {}, $apply: "" });
    }, new Error("Cannot combine $$aggregation and $apply"));
    assert.notOk("$apply" in oBinding.mQueryOptions);
});
QUnit.test("applyParameters: buildApply fails", function (assert) {
    var oAggregation = {}, oBinding = this.bindList("/EMPLOYEES"), oError = new Error("This call intentionally failed");
    oBinding.mParameters.$$aggregation = oAggregation;
    oBinding.mQueryOptions = { $apply: "A.P.P.L.E." };
    this.mock(_AggregationHelper).expects("buildApply").throws(oError);
    assert.throws(function () {
        oBinding.applyParameters({ $$aggregation: {} });
    }, oError);
    assert.strictEqual(oBinding.mParameters.$$aggregation, oAggregation, "unchanged");
    assert.deepEqual(oBinding.mQueryOptions, { $apply: "A.P.P.L.E." }, "unchanged");
});
QUnit.test("applyParameters: buildQueryOptions fails", function (assert) {
    var oBinding = this.bindList("/EMPLOYEES"), oError = new Error("This call intentionally failed"), mParameters = { "sap-*": "not allowed" };
    this.mock(oBinding.oModel).expects("buildQueryOptions").withExactArgs(sinon.match.same(mParameters), true).throws(oError);
    assert.throws(function () {
        oBinding.applyParameters(mParameters);
    }, oError);
    assert.deepEqual(oBinding.mParameters, {}, "unchanged");
});
[false, true].forEach(function (bSuspended) {
    var iCallCount = bSuspended ? 0 : 1;
    QUnit.test("applyParameters: call from changeParameters, " + bSuspended, function (assert) {
        var oBinding = this.bindList("TEAM_2_EMPLOYEES", Context.create(this.oModel, oParentBinding, "/TEAMS")), oModelMock = this.mock(this.oModel), mParameters = {
            $$operationMode: OperationMode.Server,
            $filter: "bar"
        };
        this.mock(_AggregationHelper).expects("buildApply").never();
        oModelMock.expects("buildQueryOptions").withExactArgs(sinon.match.same(mParameters), true).returns({ $filter: "bar" });
        this.mock(oBinding).expects("isRootBindingSuspended").withExactArgs().returns(bSuspended);
        this.mock(oBinding).expects("setResumeChangeReason").exactly(bSuspended ? 1 : 0).withExactArgs(ChangeReason.Change);
        this.mock(oBinding).expects("removeCachesAndMessages").exactly(iCallCount).withExactArgs("");
        this.mock(oBinding).expects("fetchCache").exactly(iCallCount).withExactArgs(sinon.match.same(oBinding.oContext));
        this.mock(oBinding).expects("reset").exactly(iCallCount).withExactArgs(ChangeReason.Change);
        this.mock(oBinding.oHeaderContext).expects("checkUpdate").exactly(iCallCount).withExactArgs();
        oBinding.applyParameters(mParameters, ChangeReason.Change);
        assert.deepEqual(oBinding.mQueryOptions, { $filter: "bar" });
        assert.deepEqual(oBinding.mParameters, mParameters);
    });
    QUnit.test("applyParameters: with change in $apply, " + bSuspended, function (assert) {
        var oAggregation = {}, sApply = "A.P.P.L.E.", oBinding = this.bindList("/EMPLOYEES"), mParameters = {
            $$aggregation: oAggregation,
            $filter: "bar"
        };
        oBinding.mQueryOptions.$apply = "old $apply";
        this.mock(_AggregationHelper).expects("buildApply").withExactArgs(sinon.match.same(oAggregation)).returns({ $apply: sApply });
        this.mock(this.oModel).expects("buildQueryOptions").withExactArgs(sinon.match.same(mParameters), true).returns({ $filter: "bar" });
        this.mock(oBinding).expects("isRootBindingSuspended").withExactArgs().returns(bSuspended);
        this.mock(oBinding).expects("setResumeChangeReason").exactly(bSuspended ? 1 : 0).withExactArgs(ChangeReason.Filter);
        this.mock(oBinding).expects("removeCachesAndMessages").exactly(iCallCount).withExactArgs("");
        this.mock(oBinding).expects("fetchCache").exactly(iCallCount).withExactArgs(sinon.match.same(oBinding.oContext));
        this.mock(oBinding).expects("reset").exactly(iCallCount).withExactArgs(ChangeReason.Filter);
        oBinding.applyParameters(mParameters, "");
        assert.deepEqual(oBinding.mQueryOptions, {
            $apply: sApply,
            $filter: "bar"
        }, "mQueryOptions");
        assert.deepEqual(oBinding.mParameters, mParameters);
        assert.strictEqual(oBinding.mParameters.$$aggregation, oAggregation, "$$aggregation");
    });
    QUnit.test("applyParameters: $apply is dropped, " + bSuspended, function (assert) {
        var oBinding = this.bindList("/EMPLOYEES"), mParameters = {
            $filter: "bar"
        };
        oBinding.mQueryOptions.$apply = "old $apply";
        this.mock(_AggregationHelper).expects("buildApply").never();
        this.mock(this.oModel).expects("buildQueryOptions").withExactArgs(sinon.match.same(mParameters), true).returns({ $filter: "bar" });
        this.mock(oBinding).expects("isRootBindingSuspended").withExactArgs().returns(bSuspended);
        this.mock(oBinding).expects("setResumeChangeReason").exactly(bSuspended ? 1 : 0).withExactArgs(ChangeReason.Filter);
        this.mock(oBinding).expects("removeCachesAndMessages").exactly(iCallCount).withExactArgs("");
        this.mock(oBinding).expects("fetchCache").exactly(iCallCount).withExactArgs(sinon.match.same(oBinding.oContext));
        this.mock(oBinding).expects("reset").exactly(iCallCount).withExactArgs(ChangeReason.Filter);
        oBinding.applyParameters(mParameters, "");
        assert.deepEqual(oBinding.mQueryOptions, {
            $filter: "bar"
        }, "mQueryOptions");
        assert.deepEqual(oBinding.mParameters, mParameters);
    });
    QUnit.test("applyParameters: $$aggregation not deepEqual, " + bSuspended, function (assert) {
        var oAggregation = {}, sApply = "A.P.P.L.E.", oBinding = this.bindList("/EMPLOYEES"), mParameters = {
            $$aggregation: oAggregation,
            $filter: "bar"
        };
        oBinding.mQueryOptions.$apply = sApply;
        oBinding.mParameters.$$aggregation = {};
        this.mock(_AggregationHelper).expects("buildApply").withExactArgs(sinon.match.same(oAggregation)).returns({ $apply: sApply });
        this.mock(this.oModel).expects("buildQueryOptions").withExactArgs(sinon.match.same(mParameters), true).returns({ $filter: "bar" });
        this.mock(_Helper).expects("deepEqual").withExactArgs(sinon.match.same(oAggregation), sinon.match.same(oBinding.mParameters.$$aggregation)).returns(false);
        this.mock(oBinding).expects("isRootBindingSuspended").withExactArgs().returns(bSuspended);
        this.mock(oBinding).expects("setResumeChangeReason").exactly(bSuspended ? 1 : 0).withExactArgs(ChangeReason.Filter);
        this.mock(oBinding).expects("removeCachesAndMessages").exactly(iCallCount).withExactArgs("");
        this.mock(oBinding).expects("fetchCache").exactly(iCallCount).withExactArgs(sinon.match.same(oBinding.oContext));
        this.mock(oBinding).expects("reset").exactly(iCallCount).withExactArgs(ChangeReason.Filter);
        oBinding.applyParameters(mParameters, "");
        assert.deepEqual(oBinding.mQueryOptions, {
            $apply: sApply,
            $filter: "bar"
        }, "mQueryOptions");
        assert.deepEqual(oBinding.mParameters, mParameters);
        assert.strictEqual(oBinding.mParameters.$$aggregation, oAggregation, "$$aggregation");
    });
    QUnit.test("applyParameters: from updateAnalyticalInfo, " + bSuspended, function (assert) {
        var oAggregation = {}, sApply = "A.P.P.L.E.", oBinding = this.bindList("/EMPLOYEES"), mParameters = {
            $$aggregation: oAggregation
        };
        oBinding.bHasAnalyticalInfo = true;
        this.mock(_AggregationHelper).expects("buildApply").withExactArgs(sinon.match.same(oAggregation)).returns({ $apply: sApply });
        this.mock(this.oModel).expects("buildQueryOptions").withExactArgs(sinon.match.same(mParameters), true).returns({});
        this.mock(oBinding).expects("isRootBindingSuspended").withExactArgs().returns(bSuspended);
        this.mock(oBinding).expects("setResumeChangeReason").exactly(bSuspended ? 1 : 0).withExactArgs(ChangeReason.Change);
        this.mock(oBinding).expects("removeCachesAndMessages").exactly(iCallCount).withExactArgs("");
        this.mock(oBinding).expects("fetchCache").exactly(iCallCount).withExactArgs(sinon.match.same(oBinding.oContext));
        this.mock(oBinding).expects("reset").exactly(iCallCount).withExactArgs(ChangeReason.Change);
        oBinding.applyParameters(mParameters, "");
        assert.deepEqual(oBinding.mQueryOptions, {
            $apply: sApply
        }, "mQueryOptions");
        assert.deepEqual(oBinding.mParameters, mParameters);
        assert.strictEqual(oBinding.mParameters.$$aggregation, oAggregation, "$$aggregation");
    });
});
[{
        iDeepEqualCallCount: 1,
        oNewAggregation: {},
        oOldAggregation: {}
    }, {
        iDeepEqualCallCount: 0,
        oNewAggregation: undefined,
        oOldAggregation: {}
    }, {
        iDeepEqualCallCount: 0,
        oNewAggregation: {},
        oOldAggregation: undefined
    }, {
        iDeepEqualCallCount: 0,
        oNewAggregation: undefined,
        oOldAggregation: undefined
    }].forEach(function (oFixture, i) {
    QUnit.test("applyParameters: no change in $apply, " + i, function (assert) {
        var sApply = "A.P.P.L.E.", oBinding = this.bindList("/EMPLOYEES"), mParameters = {
            $$aggregation: oFixture.oNewAggregation,
            $filter: "bar"
        };
        oBinding.mParameters.$$aggregation = oFixture.oOldAggregation;
        oBinding.mQueryOptions.$apply = sApply;
        this.mock(_AggregationHelper).expects("buildApply").withExactArgs(sinon.match.same(oFixture.oNewAggregation)).returns({ $apply: sApply });
        this.mock(this.oModel).expects("buildQueryOptions").withExactArgs(sinon.match.same(mParameters), true).returns({ $filter: "bar" });
        this.mock(_Helper).expects("deepEqual").exactly(oFixture.iDeepEqualCallCount).withExactArgs(sinon.match.same(oFixture.oNewAggregation), sinon.match.same(oFixture.oOldAggregation)).returns(true);
        this.mock(oBinding).expects("isRootBindingSuspended").never();
        this.mock(oBinding).expects("setResumeChangeReason").never();
        this.mock(oBinding).expects("removeCachesAndMessages").never();
        this.mock(oBinding).expects("fetchCache").never();
        this.mock(oBinding).expects("reset").never();
        oBinding.applyParameters(mParameters, "");
        assert.deepEqual(oBinding.mQueryOptions, {
            $apply: sApply,
            $filter: "bar"
        }, "mQueryOptions");
        assert.deepEqual(oBinding.mParameters, mParameters);
        assert.strictEqual(oBinding.mParameters.$$aggregation, oFixture.oNewAggregation);
    });
});
QUnit.test("reset", function (assert) {
    var oBinding, oCreatedContext, aPreviousContexts;
    oBinding = this.bindList("/EMPLOYEES");
    oCreatedContext = Context.create(this.oModel, oBinding, "/EMPLOYEES($uid=id-1-23)", -1, SyncPromise.resolve(Promise.resolve()));
    oBinding.createContexts(0, [{}, {}]);
    oBinding.createContexts(3, [{}]);
    aPreviousContexts = oBinding.aContexts.slice();
    oBinding.aContexts.unshift(oCreatedContext);
    oBinding.iCurrentBegin = 10;
    oBinding.iCurrentEnd = 19;
    oBinding.bLengthFinal = true;
    oBinding.iMaxLength = 42;
    oBinding.iCreatedContexts = 1;
    this.mock(oBinding).expects("_fireRefresh").never();
    this.mock(oCreatedContext).expects("destroy").never();
    oBinding.reset();
    assert.strictEqual(Object.keys(oBinding.mPreviousContextsByPath).length, 4);
    assert.strictEqual(oBinding.mPreviousContextsByPath["/EMPLOYEES/0"], aPreviousContexts[0]);
    assert.strictEqual(oBinding.mPreviousContextsByPath["/EMPLOYEES/1"], aPreviousContexts[1]);
    assert.strictEqual(oBinding.mPreviousContextsByPath["/EMPLOYEES/3"], aPreviousContexts[3]);
    assert.strictEqual(oBinding.mPreviousContextsByPath["/EMPLOYEES($uid=id-1-23)"], oCreatedContext);
    assert.deepEqual(oBinding.aContexts, []);
    assert.strictEqual(oBinding.iCurrentBegin, 0);
    assert.strictEqual(oBinding.iCurrentEnd, 0);
    assert.strictEqual(oBinding.isLengthFinal(), false);
    assert.strictEqual(oBinding.iMaxLength, Infinity);
    assert.strictEqual(oBinding.iCreatedContexts, 0);
    assert.strictEqual(oBinding.bCreatedAtEnd, undefined);
    return oCreatedContext.created();
});
QUnit.test("reset with change reason", function (assert) {
    var oBinding = this.bindList("/EMPLOYEES"), sChangeReason = {};
    this.mock(oBinding).expects("_fireRefresh").withExactArgs({ reason: sinon.match.same(sChangeReason) });
    oBinding.reset(sChangeReason);
    assert.strictEqual(oBinding.sChangeReason, sChangeReason);
});
QUnit.test("reset on initial binding with change reason 'Change'", function (assert) {
    var oBinding = this.bindList("/EMPLOYEES");
    this.mock(oBinding).expects("_fireRefresh").never();
    oBinding.reset(ChangeReason.Change);
    assert.strictEqual(oBinding.sChangeReason, undefined);
});
QUnit.test("reset not initial binding with change reason 'Change'", function (assert) {
    var oBinding = this.bindList("/EMPLOYEES");
    oBinding.iCurrentEnd = 42;
    this.mock(oBinding).expects("_fireRefresh").withExactArgs({ reason: ChangeReason.Change });
    oBinding.reset(ChangeReason.Change);
    assert.strictEqual(oBinding.sChangeReason, ChangeReason.Change);
});
QUnit.test("bindList with OData query options", function (assert) {
    var oBaseContext = { getPath: function () { return "/"; } }, oBinding, oCacheMock = this.mock(_Cache), oError = new Error("Unsupported ..."), oModelMock = this.mock(this.oModel), mParameters = {
        "$apply": "filter(Amount gt 3)",
        "$expand": "foo",
        "$orderby": "bar",
        "$search": "\"foo bar\" AND NOT foobar",
        "$select": "bar",
        "custom": "baz"
    }, mQueryOptions = { "$orderby": "bar" }, oV4Context = { getBinding: function () { } };
    oModelMock.expects("buildQueryOptions").thrice().withExactArgs(mParameters, true).returns(mQueryOptions);
    this.mock(ODataListBinding.prototype).expects("getOrderby").twice().withExactArgs(mQueryOptions.$orderby).returns(mQueryOptions.$orderby);
    oCacheMock.expects("create").withExactArgs(sinon.match.same(this.oModel.oRequestor), "EMPLOYEES", { "$orderby": "bar", "sap-client": "111" }, false, undefined, false).returns({});
    this.spy(ODataListBinding.prototype, "reset");
    oBinding = this.bindList("/EMPLOYEES", oV4Context, undefined, undefined, mParameters);
    assert.ok(oBinding instanceof ODataListBinding);
    assert.strictEqual(oBinding.getModel(), this.oModel);
    assert.strictEqual(oBinding.getContext(), oV4Context);
    assert.strictEqual(oBinding.getPath(), "/EMPLOYEES");
    assert.deepEqual(oBinding.mParameters, mParameters);
    assert.strictEqual(oBinding.mQueryOptions, mQueryOptions);
    assert.ok(ODataListBinding.prototype.reset.calledWithExactly(undefined));
    assert.strictEqual(oBinding.hasOwnProperty("sChangeReason"), true);
    assert.strictEqual(oBinding.sChangeReason, undefined);
    assert.deepEqual(oBinding.oDiff, undefined);
    assert.deepEqual(oBinding.mPreviousContextsByPath, {});
    assert.deepEqual(oBinding.aPreviousData, []);
    oCacheMock.expects("create").withExactArgs(sinon.match.same(this.oModel.oRequestor), "EMPLOYEES", { "$orderby": "bar", "sap-client": "111" }, false, "EMPLOYEES", false).returns({});
    oBinding = this.bindList("EMPLOYEES", oBaseContext, undefined, undefined, mParameters);
    assert.ok(oBinding instanceof ODataListBinding);
    assert.strictEqual(oBinding.getModel(), this.oModel);
    assert.strictEqual(oBinding.getContext(), oBaseContext);
    assert.strictEqual(oBinding.getPath(), "EMPLOYEES");
    assert.deepEqual(oBinding.mParameters, mParameters);
    assert.strictEqual(oBinding.mQueryOptions, mQueryOptions);
    assert.ok(ODataListBinding.prototype.reset.calledWithExactly());
    assert.strictEqual(oBinding.hasOwnProperty("sChangeReason"), true);
    assert.strictEqual(oBinding.sChangeReason, undefined);
    assert.deepEqual(oBinding.oDiff, undefined);
    assert.deepEqual(oBinding.mPreviousContextsByPath, {});
    assert.deepEqual(oBinding.aPreviousData, []);
    oBinding = this.bindList("EMPLOYEE_2_TEAM", undefined, undefined, undefined, mParameters);
    assert.strictEqual(oBinding.oCachePromise.getResult(), null, "no cache");
    assert.strictEqual(oBinding.hasOwnProperty("sGroupId"), true);
    assert.strictEqual(oBinding.sGroupId, undefined);
    assert.deepEqual(oBinding.mParameters, mParameters);
    assert.strictEqual(oBinding.mQueryOptions, mQueryOptions);
    assert.ok(ODataListBinding.prototype.reset.calledWithExactly());
    assert.strictEqual(oBinding.hasOwnProperty("sChangeReason"), true);
    assert.strictEqual(oBinding.sChangeReason, undefined);
    oModelMock.expects("buildQueryOptions").throws(oError);
    assert.throws(function () {
        this.bindList("/EMPLOYEES", null, undefined, undefined, mParameters);
    }, oError);
});
QUnit.test("bindList with sorters - error cases", function (assert) {
    assert.throws(function () {
        this.bindList("/EMPLOYEES", undefined, new Sorter("ID"), undefined, {
            $$operationMode: OperationMode.Client
        });
    }, new Error("Unsupported operation mode: Client"));
    assert.throws(function () {
        this.bindList("/EMPLOYEES", undefined, new Sorter("ID"), undefined, {
            $$operationMode: OperationMode.Auto
        });
    }, new Error("Unsupported operation mode: Auto"));
    assert.throws(function () {
        this.bindList("/EMPLOYEES", undefined, new Sorter("ID"));
    }, new Error("Unsupported operation mode: undefined"));
});
QUnit.test("bindList with filters", function (assert) {
    var oBinding, oFilter = new Filter("Name", FilterOperator.Contains, "foo"), aFilters = [oFilter], oHelperMock = this.mock(_Helper), mQueryParameters = {
        $$operationMode: OperationMode.Server,
        $filter: "bar"
    };
    oHelperMock.expects("toArray").withExactArgs(sinon.match.same(oFilter)).returns(aFilters);
    oHelperMock.expects("toArray").withExactArgs(undefined).returns([]);
    this.mock(ODataListBinding.prototype).expects("fetchFilter").withExactArgs(undefined, mQueryParameters.$filter).returns(SyncPromise.resolve());
    oBinding = this.bindList("/EMPLOYEES", undefined, undefined, oFilter, mQueryParameters);
    assert.strictEqual(oBinding.aApplicationFilters, aFilters);
});
QUnit.test("bindList with filters - error cases", function (assert) {
    assert.throws(function () {
        this.bindList("/EMPLOYEES", undefined, undefined, new Filter("ID", "eq", 42), {
            $$operationMode: OperationMode.Client
        });
    }, new Error("Unsupported operation mode: Client"));
    assert.throws(function () {
        this.bindList("/EMPLOYEES", undefined, undefined, new Filter("ID", "eq", 42), {
            $$operationMode: OperationMode.Auto
        });
    }, new Error("Unsupported operation mode: Auto"));
    assert.throws(function () {
        this.bindList("/EMPLOYEES", undefined, undefined, new Filter("ID", "eq", 42));
    }, new Error("Unsupported operation mode: undefined"));
});
QUnit.test("fetchData: w/ cache", function (assert) {
    var oBinding, oCache = { read: function () { } }, oData = {}, fnDataRequested = {}, oGroupLock = {}, oPromise, that = this;
    this.mock(ODataListBinding.prototype).expects("fetchCache").callsFake(function () {
        this.oCachePromise = SyncPromise.resolve(Promise.resolve(oCache));
    });
    oBinding = this.bindList("/EMPLOYEES");
    this.mock(oCache).expects("read").withExactArgs(1, 2, 3, sinon.match.same(oGroupLock), sinon.match.same(fnDataRequested)).returns(SyncPromise.resolve(Promise.resolve().then(function () {
        that.mock(oBinding).expects("assertSameCache").withExactArgs(sinon.match.same(oCache));
        return oData;
    })));
    oPromise = oBinding.fetchData(1, 2, 3, oGroupLock, fnDataRequested);
    oBinding.sChangeReason = "sChangeReason";
    oBinding.bHasPathReductionToParent = true;
    this.oModel.bAutoExpandSelect = true;
    this.mock(oBinding).expects("checkSuspended").never();
    oBinding.setContext({});
    assert.strictEqual(oBinding.sChangeReason, "sChangeReason");
    return oPromise.then(function (oResult) {
        assert.strictEqual(oResult, oData);
    });
});
[false, true].forEach(function (bHasData) {
    QUnit.test("fetchData: w/o cache, data=" + bHasData, function (assert) {
        var oBinding = this.bindList("TEAM_2_EMPLOYEES"), oContext = Context.create({}, oParentBinding, "/TEAMS('1')"), aData = [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }], fnDataRequested = {}, oGroupLock = { unlock: function () { } };
        aData.$count = 42;
        this.mock(oBinding).expects("checkSuspended").withExactArgs(true);
        this.mock(oBinding).expects("fetchCache").callsFake(function () {
            this.oCache = undefined;
            this.oCachePromise = SyncPromise.resolve(Promise.resolve(null));
            this.sReducedPath = "/reduced/path";
        });
        oBinding.setContext(oContext);
        this.mock(oGroupLock).expects("unlock").withExactArgs();
        this.mock(oContext).expects("fetchValue").withExactArgs("/reduced/path").returns(SyncPromise.resolve(Promise.resolve(bHasData ? aData : undefined)));
        return oBinding.fetchData(3, 2, 99, oGroupLock, fnDataRequested).then(function (oResult) {
            assert.deepEqual(oResult, { value: bHasData ? [{ id: 3 }, { id: 4 }] : [] });
            if (bHasData) {
                assert.strictEqual(oResult.value.$count, 42);
            }
        });
    });
});
[false, true].forEach(function (bHasCache) {
    QUnit.test("fetchData: context lost, cache=" + bHasCache, function (assert) {
        var oBinding = this.bindList("TEAM_2_EMPLOYEES"), oBindingMock = this.mock(oBinding), oContext = Context.create({}, oParentBinding, "/TEAMS('1')"), oPromise;
        oBindingMock.expects("checkSuspended").withExactArgs(true);
        oBindingMock.expects("fetchCache").callsFake(function () {
            this.oCache = undefined;
            this.oCachePromise = SyncPromise.resolve(Promise.resolve(bHasCache ? {} : null));
            this.sReducedPath = "/reduced/path";
        });
        oBinding.setContext(oContext);
        this.mock(oContext).expects("fetchValue").never();
        oPromise = oBinding.fetchData(3, 2, 0);
        oBindingMock.expects("checkSuspended").withExactArgs(true);
        oBindingMock.expects("fetchCache").callsFake(function () {
            this.oCache = null;
            this.oCachePromise = SyncPromise.resolve(null);
            this.sReducedPath = undefined;
        });
        oBinding.setContext(null);
        return oPromise.then(function (oResult) {
            assert.deepEqual(oResult, undefined);
        });
    });
});
[false, true].forEach(function (bAsync) {
    [false, true].forEach(function (bGroupLock) {
        QUnit.test("fetchContexts: async=" + bAsync + ", groupLock=" + bGroupLock, function (assert) {
            var oBinding = this.bindList("/EMPLOYEES"), bChanged = {}, fnDataRequested = {}, oGroupLock = {}, bPending = true, oPromise, oResult = { value: {} };
            this.mock(oBinding).expects("lockGroup").exactly(bGroupLock ? 0 : 1).withExactArgs().returns(oGroupLock);
            this.mock(oBinding).expects("fetchData").withExactArgs(1, 2, 3, sinon.match.same(oGroupLock), sinon.match.same(fnDataRequested)).returns(SyncPromise.resolve(oResult));
            this.mock(oBinding).expects("createContexts").withExactArgs(1, sinon.match.same(oResult.value)).returns(SyncPromise.resolve(bChanged));
            oPromise = oBinding.fetchContexts(1, 2, 3, bGroupLock ? oGroupLock : undefined, bAsync, fnDataRequested).then(function (bResult) {
                assert.strictEqual(bResult, bChanged);
                bPending = false;
            });
            this.mock(oBinding).expects("checkSuspended").never();
            oBinding.setContext({});
            assert.strictEqual(bPending, bAsync);
            return oPromise;
        });
    });
});
[false, true].forEach(function (bCreatedAtEnd) {
    QUnit.test("fetchContexts: created, atEnd=" + bCreatedAtEnd, function () {
        var oBinding = this.bindList("/EMPLOYEES"), bChanged = {}, fnDataRequested = {}, oGroupLock = {}, iReadStart = bCreatedAtEnd ? 3 : 1, oResult = { value: {} };
        oBinding.bCreatedAtEnd = bCreatedAtEnd;
        oBinding.iCreatedContexts = 2;
        this.mock(oBinding).expects("fetchData").withExactArgs(iReadStart, 2, 3, sinon.match.same(oGroupLock), sinon.match.same(fnDataRequested)).returns(SyncPromise.resolve(oResult));
        this.mock(oBinding).expects("createContexts").withExactArgs(iReadStart, sinon.match.same(oResult.value)).returns(SyncPromise.resolve(bChanged));
        return oBinding.fetchContexts(1, 2, 3, oGroupLock, false, fnDataRequested);
    });
});
QUnit.test("fetchContexts: fetchData returns undefined", function (assert) {
    var oBinding = this.bindList("TEAM_2_EMPLOYEES", Context.create({}, oParentBinding, "/TEAMS('1')")), fnDataRequested = {}, oGroupLock = {}, oPromise;
    this.mock(oBinding).expects("fetchData").withExactArgs(1, 2, 3, sinon.match.same(oGroupLock), sinon.match.same(fnDataRequested)).returns(SyncPromise.resolve(Promise.resolve(undefined)));
    this.mock(oBinding).expects("createContexts").never();
    oPromise = oBinding.fetchContexts(1, 2, 3, oGroupLock, false, fnDataRequested);
    return oPromise.then(function (bChanged) {
        assert.notOk(bChanged);
    });
});
[false, true].forEach(function (bHasGroupLock) {
    QUnit.test("fetchContexts: read failure, groupLock=" + bHasGroupLock, function (assert) {
        var oBinding = this.bindList("/EMPLOYEES"), fnDataRequested = {}, oError = new Error(), oGroupLock = { unlock: function () { } };
        this.mock(oBinding).expects("lockGroup").exactly(bHasGroupLock ? 0 : 1).withExactArgs().returns(oGroupLock);
        this.mock(oBinding).expects("fetchData").withExactArgs(1, 2, 3, sinon.match.same(oGroupLock), sinon.match.same(fnDataRequested)).returns(SyncPromise.resolve(Promise.reject(oError)));
        this.mock(oBinding).expects("createContexts").never();
        this.mock(oGroupLock).expects("unlock").withExactArgs(true);
        return oBinding.fetchContexts(1, 2, 3, bHasGroupLock ? oGroupLock : undefined, false, fnDataRequested).then(function () {
            assert.ok(false);
        }, function (oResult) {
            assert.strictEqual(oResult, oError);
        });
    });
});
QUnit.test("fetchContexts: binding already destroyed", function (assert) {
    var oBinding = this.bindList("/EMPLOYEES"), oPromise;
    this.mock(oBinding).expects("fetchData").withExactArgs(1, 2, 3, "~oGroupLock~", "~fnDataRequested~").returns(SyncPromise.resolve({}));
    this.mock(oBinding).expects("createContexts").never();
    oPromise = oBinding.fetchContexts(1, 2, 3, "~oGroupLock~", true, "~fnDataRequested~");
    oBinding.destroy();
    return oPromise.then(function () {
        assert.ok(false, "Unexpected success");
    }, function (oError) {
        assert.strictEqual(oError.message, "Binding already destroyed");
        assert.strictEqual(oError.canceled, true);
    });
});
[false, true].forEach(function (bChanged) {
    QUnit.test("requestContexts: changed=" + bChanged, function (assert) {
        var oBinding = this.bindList("n/a"), aContexts = [], oGroupLock = {}, oPromise;
        this.mock(oBinding).expects("isResolved").withExactArgs().returns(true);
        this.mock(oBinding).expects("checkSuspended").withExactArgs();
        this.mock(this.oModel).expects("checkGroupId").withExactArgs("groupId");
        this.mock(oBinding).expects("lockGroup").withExactArgs("groupId", true).returns(oGroupLock);
        this.mock(oBinding).expects("fetchContexts").withExactArgs(1, 2, 0, sinon.match.same(oGroupLock)).returns(SyncPromise.resolve(Promise.resolve(bChanged)));
        this.mock(oBinding).expects("_fireChange").exactly(bChanged ? 1 : 0).withExactArgs({ reason: ChangeReason.Change });
        this.mock(oBinding).expects("getContextsInViewOrder").withExactArgs(1, 2).returns(aContexts);
        oPromise = oBinding.requestContexts(1, 2, "groupId").then(function (aResults) {
            assert.strictEqual(aResults, aContexts);
        });
        assert.ok(oPromise instanceof Promise);
        return oPromise;
    });
});
QUnit.test("requestContexts: parameter defaults", function (assert) {
    var oBinding = this.bindList("n/a"), aContexts = [], oGroupLock = {};
    this.mock(oBinding).expects("isResolved").withExactArgs().returns(true);
    this.mock(oBinding).expects("checkSuspended").withExactArgs();
    this.mock(this.oModel).expects("checkGroupId").withExactArgs(undefined);
    this.mock(oBinding).expects("lockGroup").withExactArgs(undefined, true).returns(oGroupLock);
    this.mock(oBinding).expects("fetchContexts").withExactArgs(0, this.oModel.iSizeLimit, 0, sinon.match.same(oGroupLock)).returns(SyncPromise.resolve(Promise.resolve(false)));
    this.mock(oBinding).expects("_fireChange").never();
    this.mock(oBinding).expects("getContextsInViewOrder").withExactArgs(0, this.oModel.iSizeLimit).returns(aContexts);
    return oBinding.requestContexts().then(function (aResults) {
        assert.strictEqual(aResults, aContexts);
    });
});
QUnit.test("requestContexts: error in fetchContexts", function (assert) {
    var oBinding = this.bindList("/EMPLOYEES"), oError = new Error(), oGroupLock = {};
    this.mock(oBinding).expects("isResolved").withExactArgs().returns(true);
    this.mock(oBinding).expects("checkSuspended").withExactArgs();
    this.mock(this.oModel).expects("checkGroupId").withExactArgs(undefined);
    this.mock(oBinding).expects("lockGroup").withExactArgs(undefined, true).returns(oGroupLock);
    this.mock(oBinding).expects("fetchContexts").withExactArgs(1, 2, 0, sinon.match.same(oGroupLock)).returns(SyncPromise.resolve(Promise.reject(oError)));
    this.mock(oBinding).expects("_fireChange").never();
    this.mock(oBinding).expects("getContextsInViewOrder").never();
    this.mock(oBinding).expects("getResolvedPath").withExactArgs().callThrough();
    this.mock(this.oModel).expects("reportError").withExactArgs("Failed to get contexts for /service/EMPLOYEES with start index 1 and length 2", sClassName, sinon.match.same(oError));
    return oBinding.requestContexts(1, 2).then(function () {
        assert.ok(false);
    }, function (oResult) {
        assert.strictEqual(oResult, oError);
    });
});
QUnit.test("requestContexts: unresolved", function (assert) {
    var oBinding = this.bindList("unresolved");
    this.mock(oBinding).expects("isResolved").withExactArgs().returns(false);
    this.mock(oBinding).expects("fetchContexts").never();
    assert.throws(function () {
        oBinding.requestContexts();
    }, new Error("Unresolved binding: unresolved"));
});
QUnit.test("requestContexts: suspended", function (assert) {
    var oBinding = this.bindList("n/a"), oError = new Error();
    this.mock(oBinding).expects("isResolved").withExactArgs().returns(true);
    this.mock(oBinding).expects("checkSuspended").withExactArgs().throws(oError);
    this.mock(oBinding).expects("fetchContexts").never();
    assert.throws(function () {
        oBinding.requestContexts();
    }, oError);
});
QUnit.test("requestContexts: invalid group ID", function (assert) {
    var oBinding = this.bindList("n/a"), oError = new Error();
    this.mock(oBinding).expects("isResolved").withExactArgs().returns(true);
    this.mock(oBinding).expects("checkSuspended").withExactArgs();
    this.mock(this.oModel).expects("checkGroupId").withExactArgs("$invalid").throws(oError);
    this.mock(oBinding).expects("fetchContexts").never();
    assert.throws(function () {
        oBinding.requestContexts(0, 10, "$invalid");
    }, oError);
});
[false, true].forEach(function (bAsync) {
    [false, true].forEach(function (bChanged) {
        [undefined, true].forEach(function (bKeepCurrent) {
            var sTitle = "getContexts: async=" + bAsync + ", changed=" + bChanged + ", bKeepCurrent=" + bKeepCurrent;
            QUnit.test(sTitle, function (assert) {
                var oBinding = this.bindList("n/a"), aContexts = [], oFetchContextsPromise = bAsync ? SyncPromise.resolve(Promise.resolve(bChanged)) : SyncPromise.resolve(bChanged), iMaximumPrefetchSize = bKeepCurrent ? 0 : 100, aResults;
                oBinding.oReadGroupLock = undefined;
                oBinding.iCurrentBegin = 2;
                oBinding.iCurrentEnd = 7;
                this.oLogMock.expects("debug").withExactArgs(oBinding + "#getContexts(5, 10, " + iMaximumPrefetchSize + ")", undefined, sClassName);
                this.mock(oBinding).expects("checkSuspended").withExactArgs();
                this.mock(oBinding).expects("isResolved").withExactArgs().returns(true);
                this.mock(oBinding).expects("getDiff").never();
                this.mock(oBinding).expects("fetchContexts").withExactArgs(5, 10, iMaximumPrefetchSize, undefined, false, sinon.match.func).returns(oFetchContextsPromise);
                this.mock(oBinding).expects("resolveRefreshPromise").withExactArgs(sinon.match.same(oFetchContextsPromise));
                this.mock(oBinding).expects("getContextsInViewOrder").withExactArgs(5, 10).returns(aContexts);
                this.mock(oBinding).expects("_fireChange").exactly(bAsync && bChanged ? 1 : 0).withExactArgs({ reason: ChangeReason.Change });
                aResults = oBinding.getContexts(5, 10, iMaximumPrefetchSize, bKeepCurrent);
                assert.strictEqual(aResults, aContexts);
                assert.strictEqual(oBinding.iCurrentBegin, bKeepCurrent ? 2 : 5);
                assert.strictEqual(oBinding.iCurrentEnd, bKeepCurrent ? 7 : 15);
                return oFetchContextsPromise;
            });
        });
    });
});
QUnit.test("getContexts: unresolved", function (assert) {
    var oBinding = this.bindList("n/a"), aContexts;
    oBinding.aPreviousData = [{}];
    oBinding.bUseExtendedChangeDetection = true;
    this.mock(oBinding).expects("checkSuspended").withExactArgs();
    this.mock(oBinding).expects("isResolved").withExactArgs().returns(false);
    this.mock(oBinding).expects("fetchContexts").never();
    aContexts = oBinding.getContexts();
    assert.deepEqual(aContexts, []);
    assert.deepEqual(oBinding.aPreviousData, []);
});
QUnit.test("getContexts: dataRequested/dataReceived", function () {
    var oBinding = this.bindList("/EMPLOYEES"), oBindingMock = this.mock(oBinding), oFetchContextsCall, oFetchContextsPromise = SyncPromise.resolve(Promise.resolve()).then(function () {
        oBindingMock.expects("fireDataReceived").withExactArgs({ data: {} });
        return false;
    });
    oFetchContextsCall = oBindingMock.expects("fetchContexts").withExactArgs(0, 10, 100, sinon.match.object, false, sinon.match.func).returns(oFetchContextsPromise);
    oBindingMock.expects("fireDataRequested").never();
    oBindingMock.expects("fireDataReceived").never();
    oBinding.getContexts(0, 10, 100);
    oBindingMock.expects("fireDataRequested").withExactArgs();
    oFetchContextsCall.args[0][5]();
    return oFetchContextsPromise;
});
QUnit.test("getContexts: default values", function () {
    var oBinding = this.bindList("n/a"), oBindingMock = this.mock(oBinding);
    oBindingMock.expects("checkSuspended").withExactArgs();
    oBindingMock.expects("isResolved").withExactArgs().returns(true);
    oBindingMock.expects("fetchContexts").withExactArgs(0, this.oModel.iSizeLimit, 0, undefined, false, sinon.match.func).returns(SyncPromise.resolve());
    oBinding.getContexts();
    oBindingMock.expects("checkSuspended").withExactArgs();
    oBindingMock.expects("isResolved").withExactArgs().returns(true);
    oBindingMock.expects("fetchContexts").withExactArgs(1, 2, 0, undefined, false, sinon.match.func).returns(SyncPromise.resolve());
    oBinding.getContexts(1, 2, -42);
});
QUnit.test("getContexts: after refresh", function (assert) {
    var oBinding = this.bindList("/EMPLOYEES"), oFetchContextsPromise = SyncPromise.resolve(Promise.resolve(true)), sChangeReason = {};
    oBinding.sChangeReason = sChangeReason;
    this.mock(oBinding).expects("fetchContexts").withExactArgs(0, 10, 100, sinon.match.object, true, sinon.match.func).returns(oFetchContextsPromise);
    this.mock(oBinding).expects("_fireChange").withExactArgs({ reason: sChangeReason });
    oBinding.getContexts(0, 10, 100);
    assert.strictEqual(oBinding.sChangeReason, undefined);
    return oFetchContextsPromise;
});
QUnit.test("getContexts: read group lock", function (assert) {
    var oBinding = this.bindList("/EMPLOYEES"), oFetchContextsPromise = SyncPromise.resolve(Promise.resolve(false)), oReadGroupLock = {};
    oBinding.oReadGroupLock = oReadGroupLock;
    this.mock(oBinding).expects("fetchContexts").withExactArgs(0, 10, 100, sinon.match.same(oReadGroupLock), false, sinon.match.func).returns(oFetchContextsPromise);
    oBinding.getContexts(0, 10, 100);
    assert.strictEqual(oBinding.oReadGroupLock, undefined);
    return oFetchContextsPromise;
});
[false, "true"].forEach(function (bUseExtendedChangeDetection) {
    [undefined, false, 0, true].forEach(function (bSuspend) {
        var sTitle = "getContexts: AddVirtualContext, suspend:" + bSuspend + ", use extended change detection:" + bUseExtendedChangeDetection;
        QUnit.test(sTitle, function (assert) {
            var oContext = Context.create({}, oParentBinding, "/TEAMS('1')"), oBinding = this.bindList("TEAM_2_EMPLOYEES", oContext), oBindingMock = this.mock(oBinding), aContexts, oModelMock = this.mock(this.oModel), oAddTask0, oAddTask1, oVirtualContext = { destroy: function () { } };
            oBinding.bUseExtendedChangeDetection = bUseExtendedChangeDetection;
            oBinding.sChangeReason = "AddVirtualContext";
            oBindingMock.expects("checkSuspended").withExactArgs();
            oBindingMock.expects("isResolved").withExactArgs().returns(true);
            oAddTask0 = oModelMock.expects("addPrerenderingTask").withExactArgs(sinon.match.func, true);
            this.mock(oBinding.oModel).expects("resolve").withExactArgs(oBinding.sPath, sinon.match.same(oContext)).returns("/~");
            this.mock(Context).expects("create").withExactArgs(sinon.match.same(oBinding.oModel), sinon.match.same(oBinding), "/~/" + Context.VIRTUAL, Context.VIRTUAL).returns(oVirtualContext);
            oBindingMock.expects("fetchContexts").never();
            oBindingMock.expects("_fireChange").never();
            if (bSuspend !== false) {
                oBindingMock.expects("reset").never();
            }
            aContexts = oBinding.getContexts(0, 10, bUseExtendedChangeDetection ? undefined : 100);
            assert.strictEqual(oBinding.sChangeReason, undefined);
            assert.strictEqual(aContexts.length, 1);
            assert.strictEqual(aContexts[0], oVirtualContext);
            if (bSuspend === undefined) {
                oBinding.destroy();
                this.mock(oVirtualContext).expects("destroy").withExactArgs();
            }
            else {
                oBindingMock.expects("isRootBindingSuspended").withExactArgs().returns(bSuspend);
                if (!bSuspend) {
                    oBindingMock.expects("getContexts").on(oBinding).withExactArgs(0, 10, bUseExtendedChangeDetection ? undefined : 100).callsFake(function () {
                        assert.strictEqual(this.bUseExtendedChangeDetection, false);
                    });
                }
                oAddTask1 = oModelMock.expects("addPrerenderingTask").withExactArgs(sinon.match.func);
            }
            oAddTask0.args[0][0]();
            assert.strictEqual(oBinding.bUseExtendedChangeDetection, bUseExtendedChangeDetection);
            if (oAddTask1) {
                if (bSuspend === 0) {
                    oBinding.destroy();
                }
                else {
                    oBindingMock.expects("isRootBindingSuspended").withExactArgs().returns(bSuspend);
                    if (!bSuspend) {
                        oBindingMock.expects("_fireChange").withExactArgs({
                            detailedReason: "RemoveVirtualContext",
                            reason: ChangeReason.Change
                        }).callsFake(function () {
                            assert.strictEqual(oBinding.sChangeReason, "RemoveVirtualContext");
                        });
                        oBindingMock.expects("reset").withExactArgs(ChangeReason.Refresh);
                    }
                }
                this.mock(oVirtualContext).expects("destroy").withExactArgs();
                oAddTask1.args[0][0]();
            }
        });
    });
});
QUnit.test("getContexts: below a virtual context", function (assert) {
    var oContext = Context.create({}, oParentBinding, "/TEAMS('1')/" + Context.VIRTUAL, Context.VIRTUAL), oBinding = this.bindList("TEAM_2_EMPLOYEES", oContext);
    this.mock(oBinding).expects("checkSuspended").withExactArgs();
    this.mock(oBinding).expects("isResolved").withExactArgs().returns(true);
    this.mock(oBinding).expects("fetchContexts").never();
    this.mock(oBinding).expects("_fireChange").never();
    assert.deepEqual(oBinding.getContexts(0, 10, 100), []);
});
QUnit.test("getContexts: RemoveVirtualContext", function (assert) {
    var oBinding = this.bindList("/EMPLOYEES"), oBindingMock = this.mock(oBinding), aContexts;
    oBinding.sChangeReason = "RemoveVirtualContext";
    oBindingMock.expects("checkSuspended").withExactArgs();
    oBindingMock.expects("isResolved").withExactArgs().returns(true);
    oBindingMock.expects("fetchContexts").never();
    oBindingMock.expects("_fireChange").never();
    aContexts = oBinding.getContexts(0, 10, 100);
    assert.strictEqual(oBinding.sChangeReason, undefined);
    assert.deepEqual(aContexts, []);
});
[
    { bCanceled: true, bDataRequested: true },
    { bCanceled: false, bDataRequested: false },
    { bCanceled: false, bDataRequested: true },
    { bCanceled: false, bDataRequested: true, bDestroyed: true }
].forEach(function (oFixture) {
    var sTitle = "getContexts: error in fetchContexts, " + JSON.stringify(oFixture);
    QUnit.test(sTitle, function () {
        var oContext = Context.create({}, oParentBinding, "/TEAMS('1')"), oBinding = this.bindList("TEAM_2_EMPLOYEES", oContext), oError = { canceled: oFixture.bCanceled }, oFetchContextsCall, oFetchContextsPromise = SyncPromise.resolve(Promise.resolve().then(function () {
            if (oFixture.bDestroyed) {
                oBinding.destroy();
            }
            throw oError;
        }));
        this.mock(oBinding).expects("checkSuspended").withExactArgs();
        this.mock(oBinding).expects("isResolved").withExactArgs().returns(true);
        this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("/~");
        oFetchContextsCall = this.mock(oBinding).expects("fetchContexts").withExactArgs(0, 10, 100, undefined, false, sinon.match.func).returns(oFetchContextsPromise);
        this.mock(oBinding.oModel).expects("reportError").withExactArgs("Failed to get contexts for /service/~ with start index 0 and length 10", sClassName, sinon.match.same(oError));
        oBinding.getContexts(0, 10, 100);
        this.mock(oBinding).expects("fireDataReceived").exactly(oFixture.bDataRequested ? 1 : 0).withExactArgs(oFixture.bCanceled ? { data: {} } : { error: sinon.match.same(oError) });
        if (oFixture.bDataRequested) {
            oFetchContextsCall.args[0][5]();
        }
        return oFetchContextsPromise.catch(function () { });
    });
});
QUnit.test("getContexts: error in dataRequested", function () {
    var oContext = Context.create({}, oParentBinding, "/TEAMS('1')"), oBinding = this.bindList("TEAM_2_EMPLOYEES", oContext), oBindingMock = this.mock(oBinding), oError = new Error(), oFetchContextsCall, oFetchContextsPromise = SyncPromise.resolve(Promise.resolve()).then(function () {
        oFetchContextsCall.args[0][5]();
        return false;
    });
    oBindingMock.expects("checkSuspended").withExactArgs();
    oBindingMock.expects("isResolved").withExactArgs().returns(true);
    oFetchContextsCall = oBindingMock.expects("fetchContexts").withExactArgs(0, 10, 100, undefined, false, sinon.match.func).returns(oFetchContextsPromise);
    this.mock(oBinding.oModel).expects("resolve").withExactArgs(oBinding.sPath, sinon.match.same(oContext)).returns("/~");
    oBindingMock.expects("fireDataRequested").withExactArgs().throws(oError);
    this.mock(oBinding.oModel).expects("reportError").withExactArgs("Failed to get contexts for /service/~ with start index 0 and length 10", sClassName, sinon.match.same(oError));
    oBinding.getContexts(0, 10, 100);
    return oFetchContextsPromise.catch(function () { });
});
QUnit.test("getContexts: error in dataReceived", function () {
    var oContext = Context.create({}, oParentBinding, "/TEAMS('1')"), oBinding = this.bindList("TEAM_2_EMPLOYEES", oContext), oBindingMock = this.mock(oBinding), oError = new Error(), oFetchContextsCall, oFetchContextsPromise = SyncPromise.resolve(Promise.resolve(false));
    oBindingMock.expects("checkSuspended").withExactArgs();
    oBindingMock.expects("isResolved").withExactArgs().returns(true);
    oFetchContextsCall = oBindingMock.expects("fetchContexts").withExactArgs(0, 10, 100, undefined, false, sinon.match.func).returns(oFetchContextsPromise);
    this.mock(oBinding.oModel).expects("resolve").withExactArgs(oBinding.sPath, sinon.match.same(oContext)).returns("/~");
    oBindingMock.expects("fireDataReceived").withExactArgs({ data: {} }).throws(oError);
    this.mock(oBinding.oModel).expects("reportError").withExactArgs("Failed to get contexts for /service/~ with start index 0 and length 10", sClassName, sinon.match.same(oError));
    oBinding.getContexts(0, 10, 100);
    oFetchContextsCall.args[0][5]();
    return oFetchContextsPromise;
});
[
    { bChanged: true, aDiff: [{}] },
    { bChanged: false, aDiff: [{}] },
    { bChanged: false, aDiff: [] }
].forEach(function (oFixture) {
    QUnit.test("getContexts: E.C.D, no diff yet, " + JSON.stringify(oFixture), function (assert) {
        var oBinding = this.bindList("TEAM_2_EMPLOYEES", Context.create({}, oParentBinding, "/TEAMS('1')")), oBindingMock = this.mock(oBinding), sChangeReason = {}, aContexts, oFetchContextsPromise = SyncPromise.resolve(Promise.resolve()).then(function () {
            oBindingMock.expects("getDiff").withExactArgs(10).returns(oFixture.aDiff);
            return oFixture.bChanged;
        });
        oBinding.enableExtendedChangeDetection();
        oBinding.sChangeReason = sChangeReason;
        oBindingMock.expects("getDiff").never();
        oBindingMock.expects("checkSuspended").withExactArgs();
        oBindingMock.expects("isResolved").withExactArgs().returns(true);
        oBindingMock.expects("fetchContexts").withExactArgs(0, 10, 0, undefined, true, sinon.match.func).returns(oFetchContextsPromise);
        this.mock(oBinding).expects("_fireChange").exactly(oFixture.bChanged || oFixture.aDiff.length ? 1 : 0).withExactArgs({ reason: sChangeReason });
        aContexts = oBinding.getContexts(0, 10);
        assert.strictEqual(aContexts.dataRequested, true);
        return oFetchContextsPromise.then(function () {
            if (oFixture.bChanged || oFixture.aDiff.length) {
                assert.deepEqual(oBinding.oDiff, {
                    aDiff: oFixture.aDiff,
                    iLength: 10
                });
                assert.strictEqual(oBinding.oDiff.aDiff, oFixture.aDiff);
            }
            else {
                assert.strictEqual(oBinding.oDiff, undefined);
            }
        });
    });
});
QUnit.test("getContexts: E.C.D, with diff", function (assert) {
    var oBinding = this.bindList("TEAM_2_EMPLOYEES", Context.create({}, oParentBinding, "/TEAMS('1')")), aContexts = [], aDiff = [], aResults;
    oBinding.enableExtendedChangeDetection();
    oBinding.oDiff = {
        aDiff: aDiff,
        iLength: 10
    };
    this.mock(oBinding).expects("checkSuspended").withExactArgs();
    this.mock(oBinding).expects("isResolved").withExactArgs().returns(true);
    this.mock(oBinding).expects("getDiff").never();
    this.mock(oBinding).expects("fetchContexts").never();
    this.mock(oBinding).expects("getContextsInViewOrder").withExactArgs(0, 10).returns(aContexts);
    aResults = oBinding.getContexts(0, 10);
    assert.strictEqual(aResults, aContexts);
    assert.strictEqual(aContexts.dataRequested, false);
    assert.strictEqual(aContexts.diff, aDiff);
    assert.strictEqual(oBinding.oDiff, undefined);
});
QUnit.test("getContexts: E.C.D, with diff, length mismatch", function (assert) {
    var oBinding = this.bindList("TEAM_2_EMPLOYEES", Context.create({}, oParentBinding, "/TEAMS('1')"));
    oBinding.enableExtendedChangeDetection();
    oBinding.oDiff = {
        aDiff: [],
        iLength: 10
    };
    this.mock(oBinding).expects("checkSuspended").withExactArgs();
    this.mock(oBinding).expects("isResolved").withExactArgs().returns(true);
    this.mock(oBinding).expects("getDiff").never();
    this.mock(oBinding).expects("fetchContexts").never();
    this.mock(oBinding).expects("getContextsInViewOrder").withExactArgs(0, 20);
    assert.throws(function () {
        oBinding.getContexts(0, 20);
    }, new Error("Extended change detection protocol violation: Expected " + "getContexts(0,10), but got getContexts(0,20)"));
});
QUnit.test("getContextsInViewOrder: create at start", function (assert) {
    var oBinding = this.bindList("/EMPLOYEES"), aContexts = [], aResults;
    this.mock(oBinding.aContexts).expects("slice").withExactArgs(2, 5).returns(aContexts);
    aResults = oBinding.getContextsInViewOrder(2, 3);
    assert.strictEqual(aResults, aContexts);
});
QUnit.test("getContextsInViewOrder: create at end", function (assert) {
    var oBinding = this.bindList("/EMPLOYEES"), oBindingMock = this.mock(oBinding), aResults;
    oBindingMock.expects("getLength").withExactArgs().returns(6);
    oBindingMock.expects("getModelIndex").withExactArgs(3).returns(0);
    oBindingMock.expects("getModelIndex").withExactArgs(4).returns(1);
    oBindingMock.expects("getModelIndex").withExactArgs(5).returns(2);
    oBinding.bCreatedAtEnd = true;
    oBinding.aContexts = [{}, {}, {}, {}, {}, {}];
    aResults = oBinding.getContextsInViewOrder(3, 10);
    assert.strictEqual(aResults.length, 3);
    assert.strictEqual(aResults[0], oBinding.aContexts[0]);
    assert.strictEqual(aResults[1], oBinding.aContexts[1]);
    assert.strictEqual(aResults[2], oBinding.aContexts[2]);
    oBindingMock.expects("getLength").withExactArgs().returns(6);
    oBindingMock.expects("getModelIndex").withExactArgs(1).returns(4);
    oBindingMock.expects("getModelIndex").withExactArgs(2).returns(3);
    aResults = oBinding.getContextsInViewOrder(1, 2);
    assert.strictEqual(aResults.length, 2);
    assert.strictEqual(aResults[0], oBinding.aContexts[4]);
    assert.strictEqual(aResults[1], oBinding.aContexts[3]);
});
QUnit.test("getLength", function (assert) {
    var oBinding = this.bindList("/EMPLOYEES");
    assert.strictEqual(oBinding.getLength(), 0);
    oBinding.aContexts = [{}, {}, {}, {}];
    assert.strictEqual(oBinding.getLength(), 14);
    oBinding.bLengthFinal = true;
    oBinding.iMaxLength = 20;
    assert.strictEqual(oBinding.getLength(), 20);
    oBinding.iCreatedContexts = 2;
    assert.strictEqual(oBinding.getLength(), 22);
});
["/", "foo/"].forEach(function (sPath) {
    QUnit.test("bindList: invalid path: " + sPath, function (assert) {
        assert.throws(function () {
            this.bindList(sPath);
        }, new Error("Invalid path: " + sPath));
    });
});
QUnit.test("bindList: empty path is valid for base context", function () {
    var oBaseContext = this.oModel.createBindingContext("/BusinessPartnerList");
    this.bindList("", oBaseContext);
});
QUnit.test("reset context for nested list binding with its own cache", function (assert) {
    var oBinding, oBindingMock = this.mock(ODataListBinding.prototype), oCache = {}, oContext = Context.create(this.oModel, oParentBinding, "/TEAMS", 1);
    oBindingMock.expects("checkSuspended").withExactArgs(true);
    oBindingMock.expects("fetchCache").withExactArgs(undefined).callsFake(function () {
        this.oCache = null;
        this.oCachePromise = SyncPromise.resolve(null);
    });
    oBindingMock.expects("fetchCache").withExactArgs(sinon.match.same(oContext)).atLeast(1).callsFake(function () {
        this.oCache = oCache;
        this.oCachePromise = SyncPromise.resolve(oCache);
    });
    oBinding = this.bindList("TEAM_2_EMPLOYEES", undefined, undefined, undefined, { $select: "ID" });
    oBinding.setContext(oContext);
    assert.strictEqual(oBinding.oCachePromise.getResult(), oCache);
});
[
    { aggregation: false, autoExpandSelect: true, backLink: true, newContext: true },
    { aggregation: false, autoExpandSelect: false, backLink: true, newContext: true },
    { aggregation: false, autoExpandSelect: true, backLink: false, newContext: true },
    { aggregation: false, autoExpandSelect: true, backLink: true, newContext: false },
    { aggregation: true, autoExpandSelect: true, backLink: true, newContext: true }
].forEach(function (oFixture, i) {
    QUnit.test("setContext: relative path, " + JSON.stringify(oFixture), function (assert) {
        var oBinding = this.bindList("Suppliers", Context.create(this.oModel, oParentBinding, "/foo")), oBindingMock = this.mock(oBinding), oContext = oFixture.newContext ? Context.create(this.oModel, oParentBinding, "/bar") : undefined, sExpectedChangeReason = i === 0 ? "AddVirtualContext" : "sChangeReason", oFetchCacheCall, oNewHeaderContext = Context.create(this.oModel, oBinding, "/bar/Suppliers"), oOldHeaderContext = oBinding.getHeaderContext(), oResetKeepAliveCall;
        this.oModel.bAutoExpandSelect = oFixture.autoExpandSelect;
        if (oFixture.aggregation) {
            oBinding.mParameters.$$aggregation = {};
        }
        oBinding.sChangeReason = "sChangeReason";
        oBinding.bHasPathReductionToParent = oFixture.backLink;
        oBinding.setContext(oBinding.oContext);
        assert.strictEqual(oBinding.sChangeReason, "sChangeReason");
        assert.deepEqual(oBinding.mPreviousContextsByPath, {});
        oBindingMock.expects("checkSuspended").withExactArgs(true);
        oBindingMock.expects("reset").withExactArgs();
        oResetKeepAliveCall = oBindingMock.expects("resetKeepAlive").withExactArgs();
        oFetchCacheCall = oBindingMock.expects("fetchCache").withExactArgs(sinon.match.same(oContext));
        this.mock(this.oModel).expects("resolve").exactly(oFixture.newContext ? 1 : 0).withExactArgs(oBinding.sPath, sinon.match.same(oContext)).returns("/bar/Suppliers");
        this.mock(Context).expects("create").exactly(oFixture.newContext ? 1 : 0).withExactArgs(sinon.match.same(this.oModel), sinon.match.same(oBinding), "/bar/Suppliers").returns(oNewHeaderContext);
        this.mock(Binding.prototype).expects("setContext").on(oBinding).withExactArgs(sinon.match.same(oContext), { detailedReason: sExpectedChangeReason });
        oBinding.setContext(oContext);
        assert.ok(oFetchCacheCall.calledAfter(oResetKeepAliveCall));
        assert.strictEqual(oBinding.sChangeReason, sExpectedChangeReason);
        if (oFixture.newContext) {
            assert.deepEqual(oBinding.mPreviousContextsByPath, {
                "/foo/Suppliers": oOldHeaderContext
            });
        }
        else {
            assert.deepEqual(oBinding.mPreviousContextsByPath, {});
        }
        oBindingMock.expects("isResolved").withExactArgs().returns(true);
        assert.strictEqual(oBinding.getHeaderContext(), oFixture.newContext ? oNewHeaderContext : oOldHeaderContext);
    });
});
QUnit.test("setContext: relative path with transient entities", function (assert) {
    var oBinding = this.bindList("Bar", Context.create(this.oModel, oParentBinding, "/Foo('42')")), oContext0 = Context.create(this.oModel, oBinding, "/Foo('42')/Bar($uid=id-1-23)", -1, SyncPromise.resolve(Promise.resolve())), oContext1 = Context.create(this.oModel, oBinding, "/Foo('42')/Bar($uid=id-1-24)", -2, SyncPromise.resolve(Promise.resolve())), oContext2 = Context.create(this.oModel, oBinding, "/Foo('42')/Bar($uid=id-1-25)", -3, SyncPromise.resolve(Promise.resolve()));
    oBinding.aContexts.unshift(oContext2, oContext1, oContext0);
    oBinding.iCreatedContexts = 3;
    oBinding.sChangeReason = "sChangeReason";
    oBinding.bHasPathReductionToParent = true;
    this.oModel.bAutoExpandSelect = true;
    this.mock(oBinding).expects("checkSuspended").withExactArgs(true);
    this.mock(oContext2).expects("isTransient").withExactArgs().returns(false);
    this.mock(oContext1).expects("isTransient").withExactArgs().returns(true);
    this.mock(oContext0).expects("isTransient").withExactArgs().never();
    assert.throws(function () {
        oBinding.setContext({});
    }, new Error("setContext on relative binding is forbidden if a transient entity " + "exists: sap.ui.model.odata.v4.ODataListBinding: /Foo('42')|Bar"));
    assert.strictEqual(oBinding.sChangeReason, "sChangeReason");
    return Promise.all([
        oContext0.created(),
        oContext1.created(),
        oContext2.created()
    ]);
});
QUnit.test("setContext: implicit suspend", function (assert) {
    var oBinding = this.bindList("Suppliers"), oContext = {
        getBinding: function () { }
    }, oParentBinding = {
        getRootBinding: function () { }
    }, oRootBinding = {
        isSuspended: function () { }
    };
    this.mock(oBinding).expects("checkSuspended").withExactArgs(true);
    this.mock(oBinding).expects("reset").withExactArgs();
    this.mock(oBinding).expects("resetKeepAlive").withExactArgs();
    this.mock(oBinding).expects("fetchCache").withExactArgs(sinon.match.same(oContext));
    this.mock(this.oModel).expects("resolve").withExactArgs(oBinding.sPath, sinon.match.same(oContext)).returns("/resolved/path");
    this.mock(Context).expects("create").withExactArgs(sinon.match.same(this.oModel), sinon.match.same(oBinding), "/resolved/path").returns("~headerContext~");
    this.mock(oContext).expects("getBinding").withExactArgs().returns(oParentBinding);
    this.mock(oParentBinding).expects("getRootBinding").withExactArgs().returns(oRootBinding);
    this.mock(oRootBinding).expects("isSuspended").withExactArgs().returns(true);
    this.mock(Binding.prototype).expects("setContext").never();
    this.mock(oBinding).expects("setResumeChangeReason").withExactArgs(ChangeReason.Context);
    oBinding.setContext(oContext);
    assert.strictEqual(oBinding.oContext, oContext);
});
QUnit.test("preserve headerContext when ManagedObject temporarily removes context", function (assert) {
    var oBinding = this.bindList("Suppliers"), oBindingMock = this.mock(oBinding), oContext = Context.create(this.oModel, oParentBinding, "/bar"), oHeaderContext = Context.create(this.oModel, oBinding, "/bar/Suppliers");
    oBindingMock.expects("checkSuspended").withExactArgs(true).thrice();
    this.mock(Context).expects("create").withExactArgs(sinon.match.same(this.oModel), sinon.match.same(oBinding), "/bar/Suppliers").returns(oHeaderContext);
    oBindingMock.expects("fetchCache").withExactArgs(null);
    oBindingMock.expects("fetchCache").twice().withExactArgs(sinon.match.same(oContext));
    oBinding.setContext(oContext);
    assert.strictEqual(oBinding.getHeaderContext(), oHeaderContext);
    this.mock(oBinding.getHeaderContext()).expects("destroy").never();
    oBinding.setContext(null);
    oBinding.setContext(oContext);
    assert.strictEqual(oBinding.getHeaderContext(), oHeaderContext);
});
QUnit.test("getCurrentContexts", function (assert) {
    var oBinding = this.bindList("/EMPLOYEES");
    oBinding.aContexts.unshift({});
    oBinding.iCreatedContexts += 1;
    oBinding.iCurrentBegin = 1;
    oBinding.iCurrentEnd = 11;
    oBinding.iMaxLength = 10;
    assert.strictEqual(oBinding.getCurrentContexts().length, 10);
});
QUnit.test("refreshInternal: relative binding with base context", function (assert) {
    var oBinding = this.bindList("TEAMS", this.oModel.createBindingContext("/"), undefined, undefined, { $$groupId: "group" });
    assert.strictEqual(oBinding.iCurrentEnd, 0);
    this.mock(oBinding).expects("isRootBindingSuspended").withExactArgs().returns(false);
    this.mock(oBinding).expects("createReadGroupLock").withExactArgs("myGroup", true);
    this.mock(oBinding).expects("removeCachesAndMessages").withExactArgs("");
    this.mock(oBinding).expects("createRefreshPromise").never();
    return oBinding.refreshInternal("", "myGroup", false);
});
[
    { onRemoveCalled: true, success: true },
    { onRemoveCalled: false, success: true },
    { onRemoveCalled: false, success: false }
].forEach(function (oFixture) {
    var sTitle = "refreshInternal: relative with own cache, success=" + oFixture.success + ", remove called = " + oFixture.onRemoveCalled;
    QUnit.test(sTitle, function (assert) {
        var oBinding, oBindingMock = this.mock(ODataListBinding.prototype), oContext = Context.create(this.oModel, oParentBinding, "/TEAMS('1')"), oError = new Error(), oHeaderContextCheckUpdatePromise = SyncPromise.resolve(Promise.resolve({})), oKeptContext = { resetKeepAlive: function () { } }, oNewCache = { refreshKeptElements: function () { } }, sPath = {}, oRefreshKeptElementsCall, oRefreshKeptElementsGroupLock = {}, oRefreshKeptElementsPromise = SyncPromise.resolve({}), oRefreshResult, that = this;
        oBindingMock.expects("fetchCache").withExactArgs(undefined).callsFake(function () {
            this.oCache = null;
            this.oCachePromise = SyncPromise.resolve(null);
        });
        oBindingMock.expects("fetchCache").withExactArgs(sinon.match.same(oContext)).callsFake(function () {
            this.oCache = { setActive: function () { } };
            this.oCachePromise = SyncPromise.resolve(this.oCache);
        });
        oBinding = this.bindList("TEAM_2_EMPLOYEES", oContext, undefined, undefined, { $$groupId: "group" });
        oBindingMock.verify();
        oBinding.iCurrentEnd = 1;
        oBinding.mPreviousContextsByPath = {
            "/resolved/path('42')": oKeptContext
        };
        this.mock(oBinding).expects("isRootBindingSuspended").withExactArgs().returns(false);
        this.mock(oBinding).expects("createReadGroupLock").withExactArgs("myGroup", false);
        this.mock(oBinding).expects("removeCachesAndMessages").withExactArgs(sinon.match.same(sPath));
        this.mock(oBinding).expects("fetchCache").withExactArgs(sinon.match.same(oContext), false, true).callsFake(function () {
            this.oCache = oNewCache;
            this.oCachePromise = SyncPromise.resolve(oNewCache);
        });
        this.mock(oBinding).expects("lockGroup").withExactArgs("myGroup").returns(oRefreshKeptElementsGroupLock);
        oRefreshKeptElementsCall = this.mock(oNewCache).expects("refreshKeptElements").withExactArgs(sinon.match.same(oRefreshKeptElementsGroupLock), sinon.match.func).returns(oRefreshKeptElementsPromise);
        this.mock(oBinding).expects("createRefreshPromise").withExactArgs().callThrough();
        this.mock(oBinding).expects("reset").withExactArgs(ChangeReason.Refresh);
        this.mock(oBinding.oHeaderContext).expects("checkUpdate").withExactArgs().returns(oHeaderContextCheckUpdatePromise);
        oRefreshResult = oBinding.refreshInternal(sPath, "myGroup", false);
        oBinding.resolveRefreshPromise(oFixture.success ? Promise.resolve() : Promise.reject(oError));
        return oRefreshResult.then(function (oResult) {
            if (oFixture.onRemoveCalled) {
                that.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("/resolved/path");
                that.mock(oKeptContext).expects("resetKeepAlive").withExactArgs();
                oRefreshKeptElementsCall.firstCall.args[1]("('42')");
            }
            assert.ok(oFixture.success);
            assert.strictEqual(oBinding.oCachePromise.getResult(), oNewCache);
            assert.strictEqual(oResult[1], oRefreshKeptElementsPromise.getResult());
            assert.strictEqual(oResult[2], oHeaderContextCheckUpdatePromise.getResult());
            assert.strictEqual(oBinding.mPreviousContextsByPath["/resolved/path('42')"], oKeptContext);
        }, function (oError0) {
            assert.strictEqual(oError0, oError);
        });
    });
});
[false, true].forEach(function (bAsync) {
    [false, true].forEach(function (bKeepCacheOnError) {
        [false, true].forEach(function (bRelative) {
            var sTitle = "refreshInternal: bAsync=" + bAsync + ", bKeepCacheOnError=" + bKeepCacheOnError + ", bRelative=" + bRelative;
            QUnit.test(sTitle, function (assert) {
                var oContext = bRelative ? Context.createNewContext(this.oModel, oParentBinding, "/TEAMS('42')") : undefined, oBinding = this.bindList(bRelative ? "TEAM_2_EMPLOYEES" : "/EMPLOYEES", oContext, null, null, { $$ownRequest: true }), oCache = oBinding.oCachePromise.getResult(), iNoOfCalls = bAsync ? 2 : 1, oDependentBinding = {
                    refreshInternal: function () { }
                }, oError = new Error(), aPromises = [], oReadPromise = Promise.reject(oError), that = this;
                oBinding.iCreatedContexts = 42;
                oBinding.iCurrentEnd = 1;
                this.mock(oBinding).expects("isRootBindingSuspended").exactly(iNoOfCalls).returns(false);
                this.mock(oBinding).expects("refreshSuspended").never();
                oReadPromise.catch(function () {
                    var iCallCount = bKeepCacheOnError ? 1 : 0, oResourcePathPromise = Promise.resolve(bRelative ? oCache.getResourcePath() : "n/a");
                    that.mock(oBinding).expects("fetchResourcePath").exactly(iCallCount).withExactArgs(sinon.match.same(oContext)).returns(SyncPromise.resolve(oResourcePathPromise));
                    oResourcePathPromise.then(function () {
                        that.mock(oCache).expects("setActive").exactly(iCallCount).withExactArgs(true);
                        that.mock(oBinding).expects("_fireChange").exactly(iCallCount).withExactArgs({ reason: ChangeReason.Change }).callsFake(function () {
                            if (bKeepCacheOnError) {
                                assert.strictEqual(oBinding.oCache, oCache);
                                assert.strictEqual(oBinding.iCreatedContexts, 42);
                                assert.strictEqual(oBinding.oCachePromise.getResult(), oCache);
                            }
                            else {
                                assert.strictEqual(oBinding.iCreatedContexts, 0);
                                assert.notStrictEqual(oBinding.oCachePromise.getResult(), oCache);
                            }
                        });
                    });
                });
                this.mock(oBinding).expects("reset").exactly(iNoOfCalls).callsFake(function () {
                    oBinding.iCreatedContexts = 0;
                    if (!bAsync) {
                        oBinding.resolveRefreshPromise(oReadPromise);
                    }
                });
                this.mock(oBinding).expects("getDependentBindings").exactly(iNoOfCalls).withExactArgs().returns([oDependentBinding]);
                this.mock(oDependentBinding).expects("refreshInternal").exactly(iNoOfCalls).withExactArgs("", "myGroup", false, bKeepCacheOnError).resolves();
                aPromises.push(oBinding.refreshInternal("", "myGroup", false, bKeepCacheOnError).then(function () {
                    assert.ok(false);
                }, function (oReturnedError) {
                    assert.strictEqual(oReturnedError, oError);
                }));
                if (bAsync) {
                    aPromises.push(oBinding.refreshInternal("", "myGroup", false, bKeepCacheOnError).then(function () {
                        assert.ok(false);
                    }, function (oReturnedError) {
                        assert.strictEqual(oReturnedError, oError);
                    }));
                    oBinding.oCachePromise.then(function () {
                        oBinding.resolveRefreshPromise(oReadPromise);
                    });
                }
                return Promise.all(aPromises);
            });
        });
    });
});
[false, true].forEach(function (bFetchResourcePathFails) {
    var sTitle = "refreshInternal: bAsync=false, bKeepCacheOnError=true, GET fails" + ", parent context has changed in the meantime, fetchResourcePath fails=" + bFetchResourcePathFails;
    QUnit.test(sTitle, function (assert) {
        var oContext = Context.createNewContext(this.oModel, oParentBinding, "/TEAMS('42')"), oBinding = this.bindList("TEAM_2_EMPLOYEES", oContext, null, null, { $$ownRequest: true }), oError = new Error(), bIsRoot = "false,true", oNewCache = { refreshKeptElements: function () { } }, oOldCache = oBinding.oCachePromise.getResult(), oRefreshPromise = Promise.reject(oError), oYetAnotherError = new Error(), that = this;
        oBinding.iCurrentEnd = 1;
        this.mock(oBinding).expects("isRootBindingSuspended").withExactArgs().returns(false);
        this.mock(oBinding).expects("refreshSuspended").never();
        this.mock(oBinding).expects("isRoot").withExactArgs().returns(bIsRoot);
        this.mock(oBinding).expects("createReadGroupLock").withExactArgs("myGroup", bIsRoot);
        this.mock(oBinding).expects("removeCachesAndMessages").withExactArgs("path");
        this.mock(oBinding).expects("fetchCache").withExactArgs(sinon.match.same(oContext), false, true).callsFake(function () {
            oBinding.oCache = oNewCache;
            oBinding.oCachePromise = SyncPromise.resolve(oNewCache);
        });
        this.mock(oBinding).expects("createRefreshPromise").withExactArgs().returns(oRefreshPromise);
        this.mock(oBinding).expects("reset").withExactArgs(ChangeReason.Refresh);
        this.mock(this.oModel).expects("getDependentBindings").withExactArgs(sinon.match.same(oBinding)).returns([]);
        this.mock(oBinding.oHeaderContext).expects("checkUpdate").withExactArgs();
        oRefreshPromise.catch(function () {
            var oResourcePathPromise = Promise.resolve("n/a");
            that.mock(oBinding).expects("fetchResourcePath").withExactArgs(sinon.match.same(oContext)).returns(bFetchResourcePathFails ? SyncPromise.reject(oYetAnotherError) : SyncPromise.resolve(oResourcePathPromise));
            oResourcePathPromise.then(function () {
                that.mock(oOldCache).expects("setActive").never();
                that.mock(oBinding).expects("_fireChange").never();
            });
        });
        return oBinding.refreshInternal("path", "myGroup", false, true).then(function () {
            assert.ok(false);
        }, function (oReturnedError) {
            assert.strictEqual(oReturnedError, bFetchResourcePathFails ? oYetAnotherError : oError);
            assert.strictEqual(oBinding.oCache, oNewCache);
            assert.strictEqual(oBinding.oCachePromise.getResult(), oNewCache);
        });
    });
});
QUnit.test("refreshInternal: bKeepCacheOnError & canceled", function (assert) {
    var oContext = Context.createNewContext(this.oModel, oParentBinding, "/TEAMS('42')"), oBinding = this.bindList("TEAM_2_EMPLOYEES", oContext, null, null, { $$ownRequest: true }), oError = new Error(), oNewCache = { refreshKeptElements: function () { } };
    oError.canceled = true;
    oBinding.iCurrentEnd = 1;
    this.mock(oBinding).expects("isRootBindingSuspended").withExactArgs().returns(false);
    this.mock(oBinding).expects("refreshSuspended").never();
    this.mock(oBinding).expects("isRoot").withExactArgs().returns("bIsRoot");
    this.mock(oBinding).expects("createReadGroupLock").withExactArgs("myGroup", "bIsRoot");
    this.mock(oBinding).expects("removeCachesAndMessages").withExactArgs("path");
    this.mock(oBinding).expects("fetchCache").withExactArgs(sinon.match.same(oContext), false, true).callsFake(function () {
        oBinding.oCache = oNewCache;
        oBinding.oCachePromise = SyncPromise.resolve(oNewCache);
    });
    this.mock(oBinding).expects("createRefreshPromise").withExactArgs().rejects(oError);
    this.mock(oBinding).expects("reset").withExactArgs(ChangeReason.Refresh);
    this.mock(this.oModel).expects("getDependentBindings").withExactArgs(sinon.match.same(oBinding)).returns([]);
    this.mock(oBinding).expects("fetchResourcePath").never();
    this.mock(oBinding.oHeaderContext).expects("checkUpdate").withExactArgs();
    return oBinding.refreshInternal("path", "myGroup", false, true).then(function () {
        assert.ok(false);
    }, function (oReturnedError) {
        assert.strictEqual(oReturnedError, oError);
        assert.strictEqual(oBinding.oCache, oNewCache);
        assert.strictEqual(oBinding.oCachePromise.getResult(), oNewCache);
    });
});
QUnit.test("refreshInternal: relative without own cache", function (assert) {
    var oBinding = this.bindList("TEAM_2_EMPLOYEES", Context.create(this.oModel, oParentBinding, "/TEAMS('1')"));
    this.mock(oBinding).expects("isRootBindingSuspended").withExactArgs().returns(false);
    this.mock(oBinding).expects("createReadGroupLock").withExactArgs("myGroup", false);
    this.mock(oBinding).expects("removeCachesAndMessages").never();
    this.mock(oBinding).expects("fetchCache").never();
    this.mock(oBinding).expects("createRefreshPromise").never();
    this.mock(oBinding).expects("reset").withExactArgs(ChangeReason.Refresh);
    assert.ok(oBinding.refreshInternal("", "myGroup").isFulfilled());
});
[false, true].forEach(function (bSuspended) {
    var sTitle = "refreshInternal: dependent bindings, suspended=" + bSuspended;
    QUnit.test(sTitle, function (assert) {
        var oBinding = this.bindList("/EMPLOYEES", undefined, undefined, undefined, { $$groupId: "myGroup" }), oChild0 = { refreshInternal: function () { } }, oChild0Refreshed = false, oChild1 = { refreshInternal: function () { } }, oChild1Refreshed = false, oChild2 = { refreshInternal: function () { } }, oChild2Refreshed = false, oChild3 = { refreshInternal: function () { } }, oChild3RefreshedIfSuspended = false, oRefreshResult, sResourcePathPrefix = "foo";
        this.mock(oBinding).expects("isRootBindingSuspended").withExactArgs().returns(bSuspended);
        this.mock(oBinding).expects("refreshSuspended").exactly(bSuspended ? 1 : 0).withExactArgs("myGroup");
        this.mock(oBinding).expects("createReadGroupLock").exactly(bSuspended ? 0 : 1).withExactArgs("myGroup", true);
        this.mock(oBinding).expects("reset").exactly(bSuspended ? 0 : 1).withExactArgs(ChangeReason.Refresh).callsFake(function () {
            oChild3.bIsBeingDestroyed = true;
        });
        this.mock(oBinding).expects("getDependentBindings").withExactArgs().returns([oChild0, oChild1, oChild2, oChild3]);
        this.mock(oChild0).expects("refreshInternal").withExactArgs(sResourcePathPrefix, "myGroup", false, undefined).returns(new Promise(function (resolve) {
            setTimeout(function () {
                oChild0Refreshed = true;
                resolve();
            });
        }));
        this.mock(oChild1).expects("refreshInternal").withExactArgs(sResourcePathPrefix, "myGroup", false, undefined).returns(new Promise(function (resolve) {
            setTimeout(function () {
                oChild1Refreshed = true;
                resolve();
            });
        }));
        this.mock(oChild2).expects("refreshInternal").withExactArgs(sResourcePathPrefix, "myGroup", false, undefined).returns(new Promise(function (resolve) {
            setTimeout(function () {
                oChild2Refreshed = true;
                resolve();
            });
        }));
        this.mock(oChild3).expects("refreshInternal").exactly(bSuspended ? 1 : 0).withExactArgs(sResourcePathPrefix, "myGroup", false, undefined).returns(new Promise(function (resolve) {
            setTimeout(function () {
                oChild3RefreshedIfSuspended = true;
                resolve();
            });
        }));
        oRefreshResult = oBinding.refreshInternal(sResourcePathPrefix, "myGroup", false);
        if (!bSuspended) {
            oBinding.resolveRefreshPromise(Promise.resolve());
        }
        assert.ok(oRefreshResult.isPending());
        return oRefreshResult.then(function () {
            assert.strictEqual(oChild0Refreshed, true);
            assert.strictEqual(oChild1Refreshed, true);
            assert.strictEqual(oChild2Refreshed, true);
            assert.strictEqual(oChild3RefreshedIfSuspended, bSuspended ? true : false);
        });
    });
});
[
    { bCached: false, oGroupLock: {} },
    { bCached: true, oGroupLock: _GroupLock.$cached }
].forEach(function (oFixture) {
    QUnit.test("fetchValue: absolute binding, bCached=" + oFixture.bCached, function (assert) {
        var oBinding = this.bindList("/EMPLOYEES"), oListener = {}, oPromise, oReadResult = {};
        this.mock(oBinding).expects("lockGroup").exactly(oFixture.bCached ? 0 : 1).withExactArgs().returns(oFixture.oGroupLock);
        this.mock(oBinding).expects("getRelativePath").withExactArgs("/EMPLOYEES/42/bar").returns("42/bar");
        this.mock(oBinding.oCachePromise.getResult()).expects("fetchValue").withExactArgs(sinon.match.same(oFixture.oGroupLock), "42/bar", undefined, sinon.match.same(oListener)).returns(SyncPromise.resolve(oReadResult));
        oPromise = oBinding.fetchValue("/EMPLOYEES/42/bar", oListener, oFixture.bCached);
        assert.ok(oPromise.isFulfilled());
        return oPromise.then(function (oResult) {
            assert.strictEqual(oResult, oReadResult);
        });
    });
});
[false, true].forEach(function (bCached) {
    QUnit.test("fetchValue: relative binding, bCached = " + bCached, function (assert) {
        var oContext = Context.create(this.oModel, oParentBinding, "/foo"), oListener = {}, sPath = "/foo/42/bar", oResult = {}, oBinding = this.bindList("TEAM_2_EMPLOYEES", oContext);
        if (bCached) {
            oBinding.oCachePromise = new SyncPromise(function () { });
        }
        this.mock(oContext).expects("fetchValue").withExactArgs(sPath, sinon.match.same(oListener), sinon.match.same(bCached)).returns(SyncPromise.resolve(oResult));
        assert.strictEqual(oBinding.fetchValue(sPath, oListener, bCached).getResult(), oResult);
    });
});
QUnit.test("fetchValue: relative binding, unresolved", function (assert) {
    this.bindList("TEAM_2_EMPLOYEES").fetchValue("bar", {}).then(function (oResult) {
        assert.strictEqual(oResult, undefined);
    });
});
QUnit.test("fetchValue: relative binding w/ cache, absolute path, mismatch", function (assert) {
    var oBinding, oBindingMock = this.mock(ODataListBinding.prototype), bCached = {}, oContext = Context.create(this.oModel, oParentBinding, "/SalesOrderList('1')"), oGroupLock = { unlock: function () { } }, oListener = {}, sPath = "/SalesOrderList('1')/ID", oResult = {};
    oBindingMock.expects("fetchCache").withExactArgs(undefined).callsFake(function () {
        this.oCache = null;
        this.oCachePromise = SyncPromise.resolve(null);
    });
    oBindingMock.expects("fetchCache").withExactArgs(sinon.match.same(oContext)).atLeast(1).callsFake(function () {
        this.oCache = {};
        this.oCachePromise = SyncPromise.resolve(this.oCache);
    });
    oBinding = this.bindList("SO_2_SOITEM", oContext, undefined, undefined, { $$groupId: "group" });
    this.mock(oBinding).expects("getRelativePath").withExactArgs(sPath).returns(undefined);
    this.mock(oGroupLock).expects("unlock").never();
    this.mock(oContext).expects("fetchValue").withExactArgs(sPath, sinon.match.same(oListener), sinon.match.same(bCached)).returns(oResult);
    assert.strictEqual(oBinding.fetchValue(sPath, oListener, bCached).getResult(), oResult);
});
QUnit.test("fetchValue: oCachePromise still pending", function (assert) {
    var oBinding = this.bindList("/EMPLOYEES"), oCache = oBinding.oCachePromise.getResult(), sPath = "/EMPLOYEES/42/bar", oReadResult = {};
    oBinding.oCache = undefined;
    oBinding.oCachePromise = SyncPromise.resolve(Promise.resolve(oCache));
    this.mock(oBinding).expects("getRelativePath").withExactArgs(sPath).returns("42/bar");
    this.mock(oCache).expects("fetchValue").withExactArgs(sinon.match.same(_GroupLock.$cached), "42/bar", undefined, null).returns(SyncPromise.resolve(oReadResult));
    return oBinding.fetchValue(sPath, null, true).then(function (oResult) {
        assert.strictEqual(oResult, oReadResult);
    });
});
QUnit.test("fetchValue: oCachePromise became pending again", function (assert) {
    var oBinding = this.bindList("/EMPLOYEES"), oCache = oBinding.oCachePromise.getResult(), sPath = "/EMPLOYEES/42/bar", oReadResult = {};
    oBinding.oCachePromise = new SyncPromise(function () { });
    this.mock(oBinding).expects("getRelativePath").withExactArgs(sPath).returns("42/bar");
    this.mock(oCache).expects("fetchValue").withExactArgs(sinon.match.same(_GroupLock.$cached), "42/bar", undefined, null).returns(SyncPromise.resolve(oReadResult));
    assert.strictEqual(oBinding.fetchValue(sPath, null, true).getResult(), oReadResult);
});
QUnit.test("fetchValue: !bCached, wait for oCachePromise again", function (assert) {
    var oBinding = this.bindList("/EMPLOYEES"), oCache = oBinding.oCachePromise.getResult(), oGroupLock = {}, sPath = "/EMPLOYEES/42/bar", oReadResult = {};
    oBinding.oCache = {};
    oBinding.oCachePromise = SyncPromise.resolve(Promise.resolve(oCache));
    oBinding.oReadGroupLock = undefined;
    this.mock(oBinding).expects("getRelativePath").withExactArgs(sPath).returns("42/bar");
    this.mock(oBinding).expects("lockGroup").withExactArgs().returns(oGroupLock);
    this.mock(oCache).expects("fetchValue").withExactArgs(sinon.match.same(oGroupLock), "42/bar", undefined, undefined).returns(SyncPromise.resolve(oReadResult));
    return oBinding.fetchValue(sPath).then(function (oResult) {
        assert.strictEqual(oResult, oReadResult);
    });
});
QUnit.test("forbidden", function (assert) {
    var oBinding = this.bindList("/EMPLOYEES");
    assert.throws(function () {
        oBinding.getDistinctValues();
    }, new Error("Unsupported operation: v4.ODataListBinding#getDistinctValues"));
    assert.throws(function () {
        oBinding.getContexts(0, 10, 100, true);
    }, new Error("Unsupported operation: v4.ODataListBinding#getContexts, must not use both" + " iMaximumPrefetchSize and bKeepCurrent"));
    oBinding.enableExtendedChangeDetection();
    assert.throws(function () {
        oBinding.getContexts(0, 42, 0);
    }, new Error("Unsupported operation: v4.ODataListBinding#getContexts, iMaximumPrefetchSize" + " must not be set if extended change detection is enabled"));
    assert.throws(function () {
        oBinding.getContexts(42);
    }, new Error("Unsupported operation: v4.ODataListBinding#getContexts, iStart must be 0" + " if extended change detection is enabled, but is 42"));
    assert.throws(function () {
        oBinding.getContexts(0, 10, undefined, true);
    }, new Error("Unsupported operation: v4.ODataListBinding#getContexts, must not use" + " bKeepCurrent if extended change detection is enabled"));
});
QUnit.test("events", function (assert) {
    var oBinding, oBindingMock = this.mock(ListBinding.prototype), mEventParameters = {}, oReturn = {};
    oBinding = this.bindList("/EMPLOYEES");
    [
        "AggregatedDataStateChange",
        "change",
        "createCompleted",
        "createSent",
        "dataReceived",
        "dataRequested",
        "DataStateChange",
        "patchCompleted",
        "patchSent",
        "refresh"
    ].forEach(function (sEvent) {
        oBindingMock.expects("attachEvent").withExactArgs(sEvent, sinon.match.same(mEventParameters)).returns(oReturn);
        assert.strictEqual(oBinding.attachEvent(sEvent, mEventParameters), oReturn);
    });
    ["filter", "sort", "unsupportedEvent"].forEach(function (sEvent) {
        assert.throws(function () {
            oBinding.attachEvent(sEvent);
        }, new Error("Unsupported event '" + sEvent + "': v4.ODataListBinding#attachEvent"));
    });
});
[
    {
        mParameters: { $$operationMode: OperationMode.Server },
        queryOptions: { "sap-client": "111" },
        vSorters: undefined
    },
    {
        mParameters: { $$operationMode: OperationMode.Server },
        queryOptions: { $orderby: "foo", "sap-client": "111" },
        vSorters: new Sorter("foo")
    },
    {
        mParameters: { $$operationMode: OperationMode.Server, $orderby: "bar" },
        queryOptions: { $orderby: "foo,bar", "sap-client": "111" },
        vSorters: [new Sorter("foo")]
    },
    {
        oModel: new ODataModel({
            operationMode: OperationMode.Server,
            serviceUrl: "/service/?sap-client=111",
            synchronizationMode: "None"
        }),
        mParameters: { $orderby: "bar" },
        queryOptions: { $orderby: "foo,bar", "sap-client": "111" },
        vSorters: [new Sorter("foo")]
    }
].forEach(function (oFixture) {
    [false, true].forEach(function (bSuspended) {
        var sTitle = "bSuspended=" + bSuspended + ", vSorters = " + JSON.stringify(oFixture.vSorters) + " and mParameters = " + JSON.stringify(oFixture.mParameters);
        QUnit.test("sort: " + sTitle, function (assert) {
            var oBinding, oModel = oFixture.oModel || this.oModel, oContext = Context.createNewContext(oModel, oParentBinding, "/TEAMS", 1), aSorters = [];
            oBinding = oModel.bindList("TEAM_2_EMPLOYEES", undefined, undefined, undefined, oFixture.mParameters);
            oBinding.setContext(oContext);
            this.mock(oBinding).expects("checkSuspended").never();
            this.mock(oBinding).expects("hasPendingChanges").returns(false);
            this.mock(_Helper).expects("toArray").withExactArgs(sinon.match.same(oFixture.vSorters)).returns(aSorters);
            this.mock(oBinding).expects("isRootBindingSuspended").returns(bSuspended);
            this.mock(oBinding).expects("setResumeChangeReason").exactly(bSuspended ? 1 : 0).withExactArgs(ChangeReason.Sort);
            this.mock(oBinding).expects("reset").exactly(bSuspended ? 0 : 1).withExactArgs(ChangeReason.Sort);
            this.mock(oBinding).expects("removeCachesAndMessages").exactly(bSuspended ? 0 : 1).withExactArgs("");
            this.mock(oBinding).expects("getGroupId").exactly(bSuspended ? 0 : 1).withExactArgs().returns("group");
            this.mock(oBinding).expects("createReadGroupLock").exactly(bSuspended ? 0 : 1).withExactArgs("group", true);
            this.mock(oBinding).expects("fetchCache").exactly(bSuspended ? 0 : 1).withExactArgs(sinon.match.same(oContext)).callsFake(function () {
                this.oCache = {};
                this.oCachePromise = SyncPromise.resolve(this.oCache);
            });
            this.mock(oBinding.oHeaderContext).expects("checkUpdate").exactly(bSuspended ? 0 : 1).withExactArgs();
            assert.strictEqual(oBinding.sort(oFixture.vSorters), oBinding, "chaining");
            assert.strictEqual(oBinding.aSorters, aSorters);
        });
    });
});
QUnit.test("sort: unresolved binding", function () {
    var oBinding = this.oModel.bindList("TEAM_2_EMPLOYEES", null, null, null, { $$operationMode: OperationMode.Server });
    oBinding.sort();
});
QUnit.test("sort: errors", function (assert) {
    var oBinding = this.bindList("/EMPLOYEES"), oContext;
    assert.throws(function () {
        oBinding.sort([]);
    }, new Error("Operation mode has to be sap.ui.model.odata.OperationMode.Server"));
    assert.throws(function () {
        oBinding.sort();
    }, new Error("Operation mode has to be sap.ui.model.odata.OperationMode.Server"));
    oBinding = this.bindList("/EMPLOYEES", null, null, null, { $$operationMode: OperationMode.Server });
    this.mock(oBinding).expects("hasPendingChanges").withExactArgs().returns(true);
    assert.throws(function () {
        oBinding.sort();
    }, new Error("Cannot sort due to pending changes"));
    this.mock(ODataListBinding.prototype).expects("fetchCache").atLeast(1).callsFake(function () {
        this.oCache = {};
        this.oCachePromise = SyncPromise.resolve(this.oCache);
    });
    oContext = Context.create(this.oModel, oParentBinding, "/TEAMS", 1);
    oBinding = this.bindList("TEAM_2_EMPLOYEES", oContext, undefined, undefined, { $$operationMode: OperationMode.Server });
    this.mock(oBinding).expects("hasPendingChanges").withExactArgs().returns(true);
    assert.throws(function () {
        oBinding.sort();
    }, new Error("Cannot sort due to pending changes"));
});
[undefined, FilterType.Application, FilterType.Control].forEach(function (sFilterType) {
    [false, true].forEach(function (bSuspended) {
        var sTitle = "filter: FilterType=" + sFilterType + ", suspended=" + bSuspended;
        QUnit.test(sTitle, function (assert) {
            var oBinding, oBindingMock = this.mock(ODataListBinding.prototype), oFilter = new Filter("Name", FilterOperator.Contains, "foo"), aFilters = [oFilter], sStaticFilter = "Age gt 18";
            oBindingMock.expects("checkSuspended").never();
            oBinding = this.bindList("/EMPLOYEES", undefined, undefined, undefined, {
                $filter: sStaticFilter,
                $$operationMode: OperationMode.Server
            });
            this.mock(_Helper).expects("toArray").withExactArgs(sinon.match.same(oFilter)).returns(aFilters);
            oBindingMock.expects("hasPendingChanges").withExactArgs().returns(false);
            oBindingMock.expects("isRootBindingSuspended").withExactArgs().returns(bSuspended);
            oBindingMock.expects("getGroupId").exactly(bSuspended ? 0 : 1).withExactArgs().returns("groupId");
            oBindingMock.expects("createReadGroupLock").exactly(bSuspended ? 0 : 1).withExactArgs("groupId", true);
            oBindingMock.expects("removeCachesAndMessages").exactly(bSuspended ? 0 : 1).withExactArgs("");
            oBindingMock.expects("fetchCache").exactly(bSuspended ? 0 : 1).withExactArgs(sinon.match.same(oBinding.oContext));
            oBindingMock.expects("reset").exactly(bSuspended ? 0 : 1).withExactArgs(ChangeReason.Filter);
            oBindingMock.expects("setResumeChangeReason").exactly(bSuspended ? 1 : 0).withExactArgs(ChangeReason.Filter);
            this.mock(oBinding.oHeaderContext).expects("checkUpdate").exactly(bSuspended ? 0 : 1).withExactArgs();
            assert.strictEqual(oBinding.filter(oFilter, sFilterType), oBinding, "chaining");
            if (sFilterType === FilterType.Control) {
                assert.strictEqual(oBinding.aFilters, aFilters);
                assert.deepEqual(oBinding.aApplicationFilters, []);
            }
            else {
                assert.strictEqual(oBinding.aApplicationFilters, aFilters);
                assert.deepEqual(oBinding.aFilters, []);
            }
        });
    });
});
QUnit.test("filter: removes caches and messages", function () {
    var oBinding = this.bindList("/EMPLOYEES", undefined, undefined, undefined, {
        $$operationMode: OperationMode.Server
    });
    this.mock(oBinding).expects("removeCachesAndMessages").withExactArgs("");
    this.mock(oBinding).expects("fetchCache").withExactArgs(undefined);
    oBinding.filter();
});
QUnit.test("filter: unresolved binding", function () {
    var oBinding = this.oModel.bindList("TEAM_2_EMPLOYEES", null, null, null, { $$operationMode: OperationMode.Server });
    oBinding.filter();
});
QUnit.test("filter: check errors", function (assert) {
    var oBinding = this.bindList("/EMPLOYEES");
    assert.throws(function () {
        oBinding.filter();
    }, new Error("Operation mode has to be sap.ui.model.odata.OperationMode.Server"));
    oBinding = this.bindList("/EMPLOYEES", undefined, undefined, undefined, { $$operationMode: OperationMode.Server });
    this.mock(oBinding).expects("hasPendingChanges").withExactArgs().returns(true);
    assert.throws(function () {
        oBinding.filter();
    }, new Error("Cannot filter due to pending changes"));
});
QUnit.test("destroy", function (assert) {
    var oBinding, oBindingContext = { destroy: function () { } }, oBindingContextMock = this.mock(oBindingContext), oBindingMock = this.mock(ListBinding.prototype), oModelMock = this.mock(this.oModel), oParentBindingPrototypeMock = this.mock(asODataParentBinding.prototype), oTransientBindingContext = { destroy: function () { } }, oTransientBindingContextMock = this.mock(oTransientBindingContext);
    oBinding = this.bindList("relative");
    this.mock(oBinding).expects("destroyPreviousContexts").withExactArgs();
    oModelMock.expects("bindingDestroyed").withExactArgs(sinon.match.same(oBinding));
    oBindingMock.expects("destroy").on(oBinding).withExactArgs();
    oParentBindingPrototypeMock.expects("destroy").on(oBinding).withExactArgs();
    oBinding.oDiff = [];
    oBinding.destroy();
    assert.strictEqual(oBinding.aApplicationFilters, undefined);
    assert.strictEqual(oBinding.aContexts, undefined);
    assert.strictEqual(oBinding.oDiff, undefined);
    assert.strictEqual(oBinding.aFilters, undefined);
    assert.strictEqual(oBinding.mPreviousContextsByPath, undefined);
    assert.strictEqual(oBinding.aPreviousData, undefined);
    assert.strictEqual(oBinding.mQueryOptions, undefined);
    assert.strictEqual(oBinding.aSorters, undefined);
    assert.throws(function () {
        oBinding.destroy();
    });
    oBinding = this.bindList("relative", Context.create(this.oModel, oParentBinding, "/foo"));
    oBinding.aContexts = [oBindingContext];
    oBinding.aContexts.unshift(oTransientBindingContext);
    oBindingContextMock.expects("destroy").withExactArgs();
    oTransientBindingContextMock.expects("destroy").withExactArgs();
    oModelMock.expects("bindingDestroyed").withExactArgs(sinon.match.same(oBinding));
    oBindingMock.expects("destroy").on(oBinding).withExactArgs();
    oParentBindingPrototypeMock.expects("destroy").on(oBinding).withExactArgs();
    this.mock(oBinding.getHeaderContext()).expects("destroy").withExactArgs();
    oBinding.destroy();
    assert.strictEqual(oBinding.oDiff, undefined);
    assert.strictEqual(oBinding.oHeaderContext, undefined);
});
QUnit.test("destroyPreviousContexts: all", function (assert) {
    var oBinding = this.bindList("relative"), oContext1 = {
        destroy: function () { }
    }, oContext2 = {
        destroy: function () { }
    }, oContext3 = {
        destroy: function () { }
    };
    oBinding.mPreviousContextsByPath = { p1: oContext1, p2: oContext2, p3: oContext3 };
    this.mock(oContext1).expects("destroy").withExactArgs();
    this.mock(oContext2).expects("destroy").withExactArgs();
    this.mock(oContext3).expects("destroy").withExactArgs();
    oBinding.destroyPreviousContexts();
    assert.deepEqual(oBinding.mPreviousContextsByPath, {});
});
QUnit.test("destroyPreviousContexts: selection", function (assert) {
    var oBinding = this.bindList("relative"), oContext1 = {
        destroy: function () { },
        isKeepAlive: function () { }
    }, oContext2 = {
        iIndex: 2,
        isKeepAlive: function () { }
    }, oContext3 = {};
    oBinding.mPreviousContextsByPath = { p1: oContext1, p2: oContext2, p3: oContext3 };
    this.mock(oContext1).expects("isKeepAlive").withExactArgs().returns(false);
    this.mock(oContext1).expects("destroy").withExactArgs();
    this.mock(oContext2).expects("isKeepAlive").withExactArgs().returns(true);
    oBinding.destroyPreviousContexts(["p1", "p2", "p4"]);
    assert.deepEqual(oBinding.mPreviousContextsByPath, { p2: oContext2, p3: oContext3 });
    assert.deepEqual(oContext2.iIndex, undefined);
});
QUnit.test("destroyPreviousContexts: binding already destroyed", function (assert) {
    var oBinding = this.bindList("relative");
    oBinding.destroy();
    oBinding.destroyPreviousContexts();
    assert.strictEqual(oBinding.mPreviousContextsByPath, undefined);
});
[
    { bDestroyLater: false, bHasRead: true },
    { bDestroyLater: true, bHasRead: false },
    { bDestroyLater: true, bHasRead: true }
].forEach(function (oFixture) {
    QUnit.test("destroyCreated: " + JSON.stringify(oFixture), function (assert) {
        var oBinding = this.bindList("/EMPLOYEES"), oContext0 = Context.create(this.oModel, oBinding, "/EMPLOYEES($uid=id-1-23)", -1, SyncPromise.resolve(Promise.resolve())), oContext0FromServer, oContext1 = Context.create(this.oModel, oBinding, "/EMPLOYEES($uid=id-1-24)", -2, SyncPromise.resolve(Promise.resolve())), oContext2 = Context.create(this.oModel, oBinding, "/EMPLOYEES($uid=id-1-25)", -3, SyncPromise.resolve(Promise.resolve())), oContext3 = Context.create(this.oModel, oBinding, "/EMPLOYEES($uid=id-1-26)", -4, SyncPromise.resolve(Promise.resolve())), aData = [{}];
        if (oFixture.bHasRead) {
            oBinding.createContexts(0, aData);
            oContext0FromServer = oBinding.aContexts[0];
            oBinding.iCurrentEnd = 1;
        }
        oBinding.aContexts.unshift(oContext3, oContext2, oContext1, oContext0);
        oBinding.iCreatedContexts = 4;
        if (oFixture.bHasRead) {
            assert.strictEqual(oBinding.aContexts[4], oContext0FromServer);
            assert.strictEqual(oContext0FromServer.getIndex(), 4);
            assert.strictEqual(oContext0FromServer.iIndex, 0, "Server index as expected");
        }
        assert.strictEqual(oBinding.getLength(), oFixture.bHasRead ? 15 : 14, "length");
        this.mock(oContext1).expects("destroy").exactly(oFixture.bDestroyLater && oFixture.bHasRead ? 0 : 1).withExactArgs();
        oBinding.destroyCreated(oContext1, oFixture.bDestroyLater);
        assert.strictEqual(oBinding.getLength(), oFixture.bHasRead ? 14 : 13);
        assert.strictEqual(oBinding.iCreatedContexts, 3);
        assert.strictEqual(oBinding.aContexts[0], oContext3);
        assert.strictEqual(oContext3.getIndex(), 0);
        assert.strictEqual(oBinding.aContexts[1], oContext2);
        assert.strictEqual(oContext2.getIndex(), 1);
        assert.strictEqual(oBinding.aContexts[2], oContext0);
        assert.strictEqual(oContext0.getIndex(), 2);
        assert.strictEqual(oBinding.aContexts[3], oContext0FromServer);
        if (oFixture.bHasRead) {
            assert.strictEqual(oContext0FromServer.getIndex(), 3);
        }
        assert.strictEqual(oBinding.mPreviousContextsByPath["/EMPLOYEES($uid=id-1-24)"], oFixture.bDestroyLater && oFixture.bHasRead ? oContext1 : undefined);
        return Promise.all([
            oContext0.created(),
            oContext1.created(),
            oContext2.created(),
            oContext3.created()
        ]);
    });
});
[{
        sInit: "base",
        sTarget: undefined
    }, {
        sInit: "base",
        sTarget: "base"
    }, {
        sInit: "base",
        sTarget: "v4"
    }, {
        sInit: "v4",
        sTarget: "base"
    }, {
        sInit: undefined,
        sTarget: "base"
    }].forEach(function (oFixture) {
    QUnit.test("change context:" + oFixture.sInit + "->" + oFixture.sTarget, function (assert) {
        var oModel = this.oModel, oInitialContext = createContext(oFixture.sInit, "/EMPLOYEES(ID='1')"), oBinding, oTargetCache = oFixture.sTarget ? {} : undefined, oTargetContext = createContext(oFixture.sTarget, "/EMPLOYEES(ID='2')");
        function createContext(sType, sPath) {
            if (sType === "base") {
                return oModel.createBindingContext(sPath);
            }
            if (sType === "v4") {
                return Context.create(oModel, oParentBinding, sPath);
            }
            return undefined;
        }
        this.mock(ODataListBinding.prototype).expects("fetchCache").atLeast(1).callsFake(function () {
            this.oCache = oTargetCache;
            this.oCachePromise = SyncPromise.resolve(oTargetCache);
        });
        oBinding = oModel.bindList("Equipments", oInitialContext);
        this.mock(oBinding).expects("checkSuspended").withExactArgs(true);
        oBinding.setContext(oTargetContext);
        assert.strictEqual(oBinding.oCachePromise.getResult(), oTargetCache);
    });
});
[false, true].forEach(function (bCreated) {
    [false, true].forEach(function (bUsePredicates) {
        var sTitle = "createContexts, bCreated = " + bCreated + ", bUsePredicates = " + bUsePredicates;
        QUnit.test(sTitle, function (assert) {
            var oBinding = this.bindList("/EMPLOYEES", {}), aContexts = [{}, {}, {}], oContextMock = this.mock(Context), i, sPath, aResults = [{}, {}, {}], iServerIndex, iStart = 2;
            if (bUsePredicates) {
                aResults.forEach(function (vValue, i) {
                    _Helper.setPrivateAnnotation(vValue, "predicate", "('" + i + "')");
                });
            }
            if (bCreated) {
                oBinding.aContexts.unshift({});
                oBinding.iCreatedContexts += 1;
            }
            this.mock(oBinding).expects("getResolvedPath").twice().withExactArgs().returns("~resolved~");
            for (i = iStart; i < iStart + aResults.length; i += 1) {
                iServerIndex = bCreated ? i - 1 : i;
                sPath = "~resolved~" + (bUsePredicates ? _Helper.getPrivateAnnotation(aResults[i - iStart], "predicate") : "/" + iServerIndex);
                oContextMock.expects("create").withExactArgs(sinon.match.same(this.oModel), sinon.match.same(oBinding), sPath, iServerIndex).returns(aContexts[i - iStart]);
            }
            assert.strictEqual(oBinding.createContexts(iStart, aResults), true);
            for (i = iStart; i < iStart + aResults.length; i += 1) {
                assert.strictEqual(oBinding.aContexts[i], aContexts[i - iStart]);
            }
            assert.strictEqual(oBinding.createContexts(iStart, aResults), false);
        });
    });
});
[false, true].forEach(function (bCreated) {
    var sTitle = "createContexts, paging: less data than requested; w/ created: " + bCreated;
    QUnit.test(sTitle, function (assert) {
        var oBinding = this.bindList("/EMPLOYEES", {}), iCreatedContexts = bCreated ? 1 : 0, i, aResults;
        function result(iLength, iCount) {
            iCount = iCount && iCount + (bCreated ? 1 : 0);
            return createData(iLength, 0, true, iCount);
        }
        assert.strictEqual(oBinding.isLengthFinal(), false);
        assert.strictEqual(oBinding.getLength(), 0, "Initial estimated length is 0");
        assert.strictEqual(oBinding.iMaxLength, Infinity);
        if (bCreated) {
            oBinding.aContexts.unshift({});
            oBinding.iCreatedContexts = 1;
        }
        assert.strictEqual(oBinding.createContexts(20 + iCreatedContexts, result(29, 20 + 29)), true);
        assert.strictEqual(oBinding.bLengthFinal, true, "some controls use bLengthFinal instead of isLengthFinal()");
        assert.strictEqual(oBinding.getLength(), 49 + iCreatedContexts);
        assert.strictEqual(oBinding.aContexts.length, 49 + iCreatedContexts);
        assert.strictEqual(oBinding.iMaxLength, 49);
        for (i = 37; i < 49; i += 1) {
            this.mock(oBinding.aContexts[i + iCreatedContexts]).expects("destroy").withExactArgs();
        }
        assert.strictEqual(oBinding.createContexts(20 + iCreatedContexts, result(17, 20 + 17)), true);
        assert.strictEqual(oBinding.isLengthFinal(), true);
        assert.strictEqual(oBinding.getLength(), 37 + iCreatedContexts);
        assert.strictEqual(oBinding.aContexts.length, 37 + iCreatedContexts);
        assert.strictEqual(oBinding.iMaxLength, 37);
        assert.strictEqual(oBinding.createContexts(20 + iCreatedContexts, result(17)), false, "do not modify upper boundary if same data is read (no short read)");
        assert.strictEqual(oBinding.isLengthFinal(), true);
        assert.strictEqual(oBinding.getLength(), 37 + iCreatedContexts);
        assert.strictEqual(oBinding.aContexts.length, 37 + iCreatedContexts);
        assert.strictEqual(oBinding.iMaxLength, 37);
        assert.strictEqual(oBinding.createContexts(20 + iCreatedContexts, result(30)), true);
        assert.strictEqual(oBinding.isLengthFinal(), false);
        assert.strictEqual(oBinding.getLength(), 60 + iCreatedContexts);
        assert.strictEqual(oBinding.aContexts.length, 50 + iCreatedContexts);
        assert.strictEqual(oBinding.iMaxLength, Infinity);
        assert.strictEqual(oBinding.createContexts(10000 + iCreatedContexts, result(0)), false);
        assert.strictEqual(oBinding.isLengthFinal(), false);
        assert.strictEqual(oBinding.getLength(), 60 + iCreatedContexts);
        assert.strictEqual(oBinding.aContexts.length, 50 + iCreatedContexts);
        assert.strictEqual(oBinding.iMaxLength, 10000);
        assert.strictEqual(oBinding.createContexts(50 + iCreatedContexts, result(0)), true);
        assert.strictEqual(oBinding.isLengthFinal(), true);
        assert.strictEqual(oBinding.getLength(), 50 + iCreatedContexts);
        assert.strictEqual(oBinding.aContexts.length, 50 + iCreatedContexts);
        assert.strictEqual(oBinding.iMaxLength, 50);
        assert.strictEqual(oBinding.createContexts(30 + iCreatedContexts, result(0)), true);
        assert.strictEqual(oBinding.isLengthFinal(), true);
        assert.strictEqual(oBinding.getLength(), 30 + iCreatedContexts);
        assert.strictEqual(oBinding.aContexts.length, 30 + iCreatedContexts);
        assert.strictEqual(oBinding.iMaxLength, 30);
        assert.strictEqual(oBinding.createContexts(100 + iCreatedContexts, result(20)), true);
        assert.strictEqual(oBinding.isLengthFinal(), false);
        assert.strictEqual(oBinding.getLength(), 120 + iCreatedContexts + 10);
        assert.strictEqual(oBinding.aContexts.length, 120 + iCreatedContexts);
        assert.strictEqual(oBinding.iMaxLength, Infinity);
        aResults = result(140);
        for (i = 50; i < 100; i += 1) {
            delete aResults[i];
        }
        assert.strictEqual(oBinding.createContexts(0 + iCreatedContexts, aResults), true);
        assert.strictEqual(oBinding.isLengthFinal(), false);
        assert.strictEqual(oBinding.getLength(), 140 + iCreatedContexts + 10);
        assert.strictEqual(oBinding.aContexts.length, 140 + iCreatedContexts);
        assert.strictEqual(oBinding.iMaxLength, Infinity);
    });
});
QUnit.test("createContexts, reuse previous contexts", function (assert) {
    var oBinding = this.bindList("/EMPLOYEES", {}), oContext1 = Context.create(this.oModel, oBinding, "/EMPLOYEES/1", 1), oContext2 = Context.create(this.oModel, oBinding, "/EMPLOYEES/2", 2), oContext3 = {}, oContextMock = this.mock(Context);
    oBinding.mPreviousContextsByPath = {
        "/EMPLOYEES/0": {},
        "/EMPLOYEES/1": oContext1,
        "/EMPLOYEES/2": oContext2
    };
    this.mock(oContext1).expects("checkUpdate").withExactArgs();
    this.mock(oContext2).expects("checkUpdate").withExactArgs();
    oContextMock.expects("create").withExactArgs(sinon.match.same(this.oModel), sinon.match.same(oBinding), "/EMPLOYEES/3", 3).returns(oContext3);
    this.mock(this.oModel).expects("addPrerenderingTask").withExactArgs(sinon.match.func).callsArg(0);
    this.mock(oBinding).expects("destroyPreviousContexts").withExactArgs(["/EMPLOYEES/0"]);
    oBinding.createContexts(1, [{}, {}, {}]);
    assert.strictEqual(oBinding.aContexts[1], oContext1);
    assert.strictEqual(oBinding.aContexts[2], oContext2);
    assert.strictEqual(oBinding.aContexts[3], oContext3);
});
QUnit.test("createContexts w/ keyPredicates, reuse previous contexts", function (assert) {
    var oBinding = this.bindList("/EMPLOYEES", {}), oBindingMock = this.mock(oBinding), oContext0 = {}, oContext1 = Context.create(this.oModel, oBinding, "/EMPLOYEES('B')", 99), oContext2 = Context.create(this.oModel, oBinding, "/EMPLOYEES('C')", 1), oContext3 = {}, oContextMinus1 = Context.create(this.oModel, oBinding, "/EMPLOYEES($uid=id-1-23)", -1, SyncPromise.resolve(Promise.resolve())), oContextMinus2 = Context.create(this.oModel, oBinding, "/EMPLOYEES($uid=id-1-42)", -2, SyncPromise.resolve(Promise.resolve())), oContextMock = this.mock(Context), oTaskMock;
    oBindingMock.expects("destroyPreviousContexts").never();
    assert.deepEqual(oBinding.aContexts, [], "binding is reset");
    assert.strictEqual(oBinding.iCreatedContexts, 0, "binding is reset");
    oBinding.mPreviousContextsByPath = {
        "/EMPLOYEES('A')": oContext0,
        "/EMPLOYEES('B')": oContext1,
        "/EMPLOYEES($uid=id-1-23)": oContextMinus1,
        "/EMPLOYEES($uid=id-1-42)": oContextMinus2,
        "/EMPLOYEES('D')": oContext3
    };
    this.mock(oContext1).expects("destroy").never();
    this.mock(oContext1).expects("checkUpdate").withExactArgs();
    this.mock(oContextMinus1).expects("destroy").never();
    this.mock(oContextMinus1).expects("checkUpdate").withExactArgs();
    this.mock(oContextMinus2).expects("destroy").never();
    this.mock(oContextMinus2).expects("checkUpdate").withExactArgs();
    oContextMock.expects("create").withExactArgs(sinon.match.same(this.oModel), sinon.match.same(oBinding), "/EMPLOYEES('C')", 1).returns(oContext2);
    oTaskMock = this.mock(this.oModel).expects("addPrerenderingTask").withExactArgs(sinon.match.func);
    oBinding.createContexts(0, [{
            "@$ui5._": { "transientPredicate": "($uid=id-1-42)" }
        }, {
            "@$ui5._": { "transientPredicate": "($uid=id-1-23)" }
        }, {
            "@$ui5._": { "predicate": "('B')" }
        }, {
            "@$ui5._": { "predicate": "('C')" }
        }]);
    assert.strictEqual(oBinding.aContexts[0], oContextMinus2);
    assert.strictEqual(oBinding.aContexts[1], oContextMinus1);
    assert.strictEqual(oBinding.aContexts[2], oContext1);
    assert.strictEqual(oBinding.aContexts[3], oContext2);
    assert.strictEqual(oBinding.iCreatedContexts, 2, "lost + found ;-)");
    assert.strictEqual(oContextMinus2.getModelIndex(), 0);
    assert.strictEqual(oContextMinus1.getModelIndex(), 1);
    assert.strictEqual(oContext1.getModelIndex(), 2);
    assert.strictEqual(oContext2.getModelIndex(), 3);
    assert.strictEqual(oContextMinus2.iIndex, -2);
    assert.strictEqual(oContextMinus1.iIndex, -1);
    assert.strictEqual(oContext1.iIndex, 0);
    assert.strictEqual(oContext2.iIndex, 1);
    assert.strictEqual(Object.keys(oBinding.mPreviousContextsByPath).length, 2);
    assert.strictEqual(oBinding.mPreviousContextsByPath["/EMPLOYEES('A')"], oContext0);
    assert.strictEqual(oBinding.mPreviousContextsByPath["/EMPLOYEES('D')"], oContext3);
    oBindingMock.expects("destroyPreviousContexts").withExactArgs(["/EMPLOYEES('A')", "/EMPLOYEES('D')"]);
    oTaskMock.firstCall.args[0]();
    return Promise.all([
        oContextMinus1.created(),
        oContextMinus2.created()
    ]);
});
QUnit.test("createContexts, no prerendering task if no previous contexts", function () {
    var oBinding = this.bindList("/EMPLOYEES", {});
    this.mock(this.oModel).expects("addPrerenderingTask").never();
    oBinding.createContexts(1, 0);
});
QUnit.test("createContexts: shrink contexts", function (assert) {
    var oBinding = this.bindList("/EMPLOYEES", {}), oContext = {
        destroy: function () { }
    }, aResults = [];
    aResults.$count = 1;
    oBinding.aContexts = [, , oContext];
    this.mock(oContext).expects("destroy").withExactArgs();
    oBinding.createContexts(1, aResults);
    assert.deepEqual(oBinding.aContexts, []);
    assert.strictEqual(oBinding.bLengthFinal, true);
    assert.strictEqual(oBinding.iMaxLength, 1);
});
QUnit.test("createContexts: do not reuse a created context", function (assert) {
    var oBinding = this.bindList("/EMPLOYEES"), oCreatedContext = Context.create(this.oModel, oBinding, "/EMPLOYEES('1')", -1, SyncPromise.resolve()), oNewContext = {};
    oBinding.mPreviousContextsByPath = {
        "/EMPLOYEES('1')": oCreatedContext
    };
    this.mock(Context).expects("create").withExactArgs(sinon.match.same(this.oModel), sinon.match.same(oBinding), "/EMPLOYEES('1')", 0).returns(oNewContext);
    this.mock(this.oModel).expects("addPrerenderingTask").withExactArgs(sinon.match.func).callsArg(0);
    this.mock(oCreatedContext).expects("destroy").withExactArgs();
    oBinding.createContexts(0, [{
            "@$ui5._": { "predicate": "('1')" }
        }]);
    assert.strictEqual(oBinding.aContexts[0], oNewContext);
});
[{
        keyPredicates: false
    }, {
        keyPredicates: true,
        keepAlive: false
    }, {
        keyPredicates: true,
        keepAlive: true
    }].forEach(function (oFixture) {
    QUnit.test("_delete: success, " + JSON.stringify(oFixture), function (assert) {
        var oBinding = this.bindList("/EMPLOYEES"), oCreatedContext = {
            destroy: function () { },
            getModelIndex: function () { return 0; }
        }, aData = createData(6, 0, true, undefined, oFixture.keyPredicates), aData2 = aData.slice(4, 6), oETagEntity = {}, aPreviousContexts, that = this;
        oBinding.createContexts(0, aData.slice(0, 3));
        aData2.$count = 6;
        oBinding.createContexts(4, aData2);
        oBinding.aContexts.unshift(oCreatedContext);
        oBinding.iCreatedContexts = 1;
        aPreviousContexts = oBinding.aContexts.slice();
        aData.unshift({});
        aData.splice(2, 1);
        assert.strictEqual(oBinding.getLength(), 7);
        this.mock(oBinding).expects("deleteFromCache").withExactArgs("myGroup", "EMPLOYEES('2')", "2", sinon.match.same(oETagEntity), sinon.match.func).callsArgWith(4, 2, aData).resolves();
        this.mock(oBinding).expects("getResolvedPath").withExactArgs().callThrough();
        oBinding.aContexts.forEach(function (oContext) {
            that.mock(oContext).expects("destroy").never();
        });
        if (!oFixture.keyPredicates) {
            this.mock(oBinding.aContexts[2]).expects("checkUpdate").withExactArgs();
            this.mock(oBinding.aContexts[5]).expects("checkUpdate").withExactArgs();
        }
        this.mock(oBinding.aContexts[3]).expects("isKeepAlive").withExactArgs().returns(oFixture.keepAlive);
        this.mock(oBinding.aContexts[3]).expects("resetKeepAlive").exactly(oFixture.keepAlive ? 1 : 0).withExactArgs();
        this.mock(oBinding).expects("_fireChange").withExactArgs({ reason: ChangeReason.Remove });
        return oBinding._delete("myGroup", "EMPLOYEES('2')", oBinding.aContexts[3], oETagEntity).then(function () {
            assert.strictEqual(oBinding.iCreatedContexts, 1);
            assert.strictEqual(oBinding.getLength(), 6);
            assert.strictEqual(oBinding.aContexts.length, 6);
            assert.strictEqual(oBinding.aContexts[0], aPreviousContexts[0]);
            assert.strictEqual(oBinding.aContexts[1], aPreviousContexts[1]);
            assert.notOk(3 in oBinding.aContexts);
            oBinding.aContexts.forEach(function (oContext, i) {
                assert.strictEqual(oContext.getModelIndex(), i);
            });
            if (oFixture.keyPredicates) {
                assert.strictEqual(oBinding.mPreviousContextsByPath[aPreviousContexts[2].getPath()], aPreviousContexts[2]);
                assert.strictEqual(oBinding.aContexts[2], aPreviousContexts[3]);
                assert.strictEqual(oBinding.aContexts[4], aPreviousContexts[5]);
                assert.strictEqual(oBinding.aContexts[5], aPreviousContexts[6]);
            }
            else {
                assert.strictEqual(oBinding.aContexts[2], aPreviousContexts[2]);
                assert.strictEqual(oBinding.mPreviousContextsByPath[aPreviousContexts[3].getPath()], aPreviousContexts[3]);
                assert.strictEqual(oBinding.aContexts[4].getPath(), "/EMPLOYEES/3");
                assert.strictEqual(oBinding.aContexts[5], aPreviousContexts[5]);
                assert.strictEqual(oBinding.mPreviousContextsByPath[aPreviousContexts[6].getPath()], aPreviousContexts[6]);
            }
        });
    });
});
QUnit.test("_delete: transient context that has been persisted", function (assert) {
    var oBinding = this.bindList("/EMPLOYEES"), oBindingMock = this.mock(oBinding), oContext0 = Context.create(this.oModel, oBinding, "/EMPLOYEES($uid=id-1-23)", -1, SyncPromise.resolve(Promise.resolve())), oContext1 = Context.create(this.oModel, oBinding, "/EMPLOYEES($uid=id-1-24)", -2, SyncPromise.resolve(Promise.resolve())), oETagEntity = {};
    oBinding.aContexts.unshift(oContext1, oContext0);
    oBinding.iCreatedContexts = 2;
    oBinding.iMaxLength = 42;
    oBindingMock.expects("deleteFromCache").withExactArgs("myGroup", "EMPLOYEES('1')", "-1", sinon.match.same(oETagEntity), sinon.match.func).callsArgWith(4).resolves();
    oBindingMock.expects("_fireChange").withExactArgs({ reason: ChangeReason.Remove });
    this.stub(oContext0, "toString");
    this.mock(oBinding).expects("destroyCreated").withExactArgs(sinon.match.same(oContext0), true);
    return oBinding._delete("myGroup", "EMPLOYEES('1')", oContext0, oETagEntity).then(function () {
        assert.strictEqual(oBinding.iMaxLength, 42, "iMaxLength has not been reduced");
    });
});
[
    { lengthFinal: false },
    { lengthFinal: true, newMaxLength: 42 },
    { lengthFinal: true, newMaxLength: 41 }
].forEach(function (oFixture) {
    var sTitle = "_delete: kept-alive context not in the collection: " + JSON.stringify(oFixture);
    QUnit.test(sTitle, function (assert) {
        var oBinding = this.bindList("/EMPLOYEES"), oBindingMock = this.mock(oBinding), aContexts = [{ iIndex: -2 }, { iIndex: -1 }, { iIndex: 0 }, { iIndex: 1 }], bFireChange = oFixture.newMaxLength === 41, oKeptAliveContext = {
            created: function () { return undefined; },
            destroy: function () { },
            getPath: function () { return "~contextPath~"; },
            isKeepAlive: function () { },
            resetKeepAlive: function () { }
        }, that = this;
        oBinding.aContexts = aContexts;
        oBinding.iCreatedContexts = 2;
        oBinding.bLengthFinal = oFixture.lengthFinal;
        oBinding.iMaxLength = oFixture.lengthFinal ? 42 : Infinity;
        oBinding.mPreviousContextsByPath = {
            "~contextPath~": oKeptAliveContext,
            "~otherContext~": {}
        };
        this.mock(_Helper).expects("getRelativePath").withExactArgs("~contextPath~", "/EMPLOYEES").returns("~predicate~");
        oBindingMock.expects("deleteFromCache").withExactArgs("myGroup", "EMPLOYEES('1')", "~predicate~", "oETagEntity", sinon.match.func).callsArgWith(4, undefined, []).returns(Promise.resolve().then(function () {
            that.mock(oBinding).expects("fetchValue").exactly(oFixture.lengthFinal ? 1 : 0).withExactArgs("$count", undefined, true).returns(SyncPromise.resolve(oFixture.newMaxLength + 2));
        }));
        this.mock(oKeptAliveContext).expects("isKeepAlive").returns(true);
        this.mock(oKeptAliveContext).expects("resetKeepAlive").withExactArgs();
        oBindingMock.expects("_fireChange").exactly(bFireChange ? 1 : 0).withExactArgs({ reason: ChangeReason.Remove });
        this.mock(oKeptAliveContext).expects("destroy").exactly(bFireChange ? 0 : 1).withExactArgs();
        return oBinding._delete("myGroup", "EMPLOYEES('1')", oKeptAliveContext, "oETagEntity").then(function () {
            assert.deepEqual(oBinding.mPreviousContextsByPath, bFireChange ? {
                "~contextPath~": oKeptAliveContext,
                "~otherContext~": {}
            } : {
                "~otherContext~": {}
            });
            assert.deepEqual(oBinding.aContexts, aContexts);
            assert.strictEqual(oBinding.iMaxLength, oFixture.lengthFinal ? oFixture.newMaxLength : Infinity);
        });
    });
});
QUnit.test("create: callbacks and eventing", function (assert) {
    var oBinding = this.bindList("/EMPLOYEES"), oBindingMock = this.mock(oBinding), oContext0, oContext1, oCreateInCacheExpectation, oCreateInCachePromise0 = Promise.resolve({}), oCreateInCachePromise1 = Promise.resolve({}), oCreatePathPromise = SyncPromise.resolve("~"), oError = {}, oInitialData0 = {}, oInitialData1 = {}, oGroupLock0 = {}, oGroupLock1 = {}, oLockGroupExpectation, oPromise, that = this;
    oLockGroupExpectation = oBindingMock.expects("lockGroup").withExactArgs(undefined, true, true, sinon.match.func).returns(oGroupLock0);
    oBindingMock.expects("fetchResourcePath").withExactArgs().returns(oCreatePathPromise);
    oBindingMock.expects("getResolvedPath").withExactArgs().callThrough();
    oCreateInCacheExpectation = oBindingMock.expects("createInCache").withExactArgs(sinon.match.same(oGroupLock0), sinon.match.same(oCreatePathPromise), "/EMPLOYEES", sinon.match(rTransientPredicate), sinon.match.same(oInitialData0), sinon.match.func, sinon.match.func).returns(SyncPromise.resolve(oCreateInCachePromise0));
    oCreateInCachePromise0.then(function () {
        that.mock(oContext0).expects("refreshDependentBindings").withExactArgs(sinon.match(/EMPLOYEES\(\$uid=.+\)/), "$auto", true);
    });
    oContext0 = oBinding.create(oInitialData0, true);
    assert.strictEqual(oBinding.iCreatedContexts, 1);
    assert.strictEqual(oBinding.aContexts[0], oContext0);
    assert.strictEqual(oContext0.getIndex(), 0);
    assert.strictEqual(oContext0.iIndex, -1);
    oBindingMock.expects("lockGroup").withExactArgs(undefined, true, true, sinon.match.func).returns(oGroupLock1);
    oBindingMock.expects("fetchResourcePath").withExactArgs().returns(oCreatePathPromise);
    oBindingMock.expects("getResolvedPath").withExactArgs().callThrough();
    oBindingMock.expects("createInCache").withExactArgs(sinon.match.same(oGroupLock1), sinon.match.same(oCreatePathPromise), "/EMPLOYEES", sinon.match(rTransientPredicate), sinon.match.same(oInitialData1), sinon.match.func, sinon.match.func).returns(SyncPromise.resolve(oCreateInCachePromise1));
    oCreateInCachePromise1.then(function () {
        that.mock(oContext1).expects("refreshDependentBindings").withExactArgs(sinon.match(/EMPLOYEES\(\$uid=.+\)/), "$auto", true);
    });
    oContext1 = oBinding.create(oInitialData1, true);
    assert.strictEqual(oBinding.iCreatedContexts, 2);
    assert.strictEqual(oBinding.aContexts[0], oContext1);
    assert.strictEqual(oContext1.getIndex(), 0);
    assert.strictEqual(oContext1.iIndex, -2);
    assert.strictEqual(oBinding.aContexts[1], oContext0);
    assert.strictEqual(oContext0.getIndex(), 1);
    assert.strictEqual(oContext0.iIndex, -1);
    oBindingMock.expects("fireEvent").on(oBinding).withExactArgs("createSent", { context: sinon.match.same(oContext0) });
    oCreateInCacheExpectation.args[0][6]();
    this.mock(oBinding.oModel).expects("reportError").withExactArgs("POST on '~' failed; will be repeated automatically", sClassName, sinon.match.same(oError));
    oBindingMock.expects("fireEvent").on(oBinding).withExactArgs("createCompleted", { context: sinon.match.same(oContext0), success: false });
    oCreateInCacheExpectation.args[0][5](oError);
    oBindingMock.expects("destroyCreated").withExactArgs(sinon.match.same(oContext0), true);
    oPromise = oLockGroupExpectation.args[0][3]();
    oBindingMock.expects("_fireChange").withExactArgs({ reason: ChangeReason.Remove });
    oBindingMock.expects("fireEvent").on(oBinding).withExactArgs("createCompleted", { context: sinon.match.same(oContext0), success: true });
    oBindingMock.expects("fireEvent").on(oBinding).withExactArgs("createCompleted", { context: sinon.match.same(oContext1), success: true });
    return SyncPromise.all([
        oPromise,
        oContext0.created(),
        oContext1.created()
    ]);
});
[{
        sGroupId: "$auto",
        sTitle: "create: absolute"
    }, {
        sGroupId: "$auto",
        oInitialData: {},
        sTitle: "create: absolute, with initial data"
    }, {
        sGroupId: "deferred",
        bRelative: true,
        sTitle: "create: relative with base context"
    }, {
        sGroupId: "$direct",
        sTitle: "create: absolute with groupId=$direct"
    }].forEach(function (oFixture) {
    QUnit.test(oFixture.sTitle, function (assert) {
        var oBinding, oBindingContext = this.oModel.createBindingContext("/"), oBindingMock, iChangeFired = 0, aContexts = [], iCreateNo = 0, oCreatePathPromise = {}, aCreatePromises = [
            SyncPromise.resolve(Promise.resolve({})),
            SyncPromise.resolve(Promise.resolve({}))
        ], oModelMock = this.mock(this.oModel), aRefreshSingleFinished = [false, false], aRefreshSinglePromises = [
            new Promise(function (resolve) {
                setTimeout(resolve.bind(null, {}), 0);
            }),
            new Promise(function (resolve) {
                setTimeout(resolve.bind(null, {}), 0);
            })
        ], that = this;
        function checkCreatedContext() {
            var oCreatedContext = aContexts[iCreateNo];
            assert.strictEqual(oCreatedContext.getModel(), that.oModel);
            assert.strictEqual(oCreatedContext.getBinding(), oBinding);
            assert.ok(/^\/EMPLOYEES\(\$uid=.+\)$/, "path with uid");
            assert.strictEqual(oCreatedContext.getModelIndex(), 0);
            assert.strictEqual(oCreatedContext.isTransient(), true);
            assert.strictEqual(oBinding.iMaxLength, 42, "transient contexts are not counted");
            assert.strictEqual(oBinding.aContexts[0], oCreatedContext, "Transient context");
            assert.strictEqual(iChangeFired, iCreateNo + 1, "Change event fired");
        }
        function expect() {
            var oGroupLock = {}, iCurrentCreateNo = iCreateNo;
            oBindingMock.expects("checkSuspended").withExactArgs();
            oBindingMock.expects("getGroupId").returns(oFixture.sGroupId || "$auto");
            oModelMock.expects("isDirectGroup").returns(oFixture.sGroupId === "$direct");
            oModelMock.expects("isAutoGroup").exactly(oFixture.sGroupId === "$direct" ? 0 : 1).returns(oFixture.sGroupId === "$auto");
            oBindingMock.expects("lockGroup").withExactArgs(undefined, true, true, sinon.match.func).returns(oGroupLock);
            oBindingMock.expects("fetchResourcePath").withExactArgs().returns(oCreatePathPromise);
            oBindingMock.expects("createInCache").withExactArgs(sinon.match.same(oGroupLock), sinon.match.same(oCreatePathPromise), "/EMPLOYEES", sinon.match(rTransientPredicate), sinon.match.same(oFixture.oInitialData), sinon.match.func, sinon.match.func).returns(aCreatePromises[iCurrentCreateNo]);
            aCreatePromises[iCurrentCreateNo].then(function () {
                oBindingMock.expects("lockGroup").withExactArgs(oFixture.sGroupId === "$direct" ? "$direct" : "$auto").returns(oGroupLock);
                oBindingMock.expects("fireEvent").withExactArgs("createCompleted", {
                    context: sinon.match.same(aContexts[iCurrentCreateNo]),
                    success: true
                });
                oBindingMock.expects("refreshSingle").withExactArgs(sinon.match.same(aContexts[iCurrentCreateNo]), sinon.match.same(oGroupLock)).returns(aRefreshSinglePromises[iCurrentCreateNo]);
            });
            aRefreshSinglePromises[iCurrentCreateNo].then(function () {
                aRefreshSingleFinished[iCurrentCreateNo] = true;
            });
        }
        if (oFixture.bRelative) {
            oBinding = this.bindList("EMPLOYEES", oBindingContext);
        }
        else {
            oBinding = this.bindList("/EMPLOYEES");
        }
        oBindingMock = this.mock(oBinding);
        expect();
        oBinding.attachEvent("change", function (oEvent) {
            assert.strictEqual(oEvent.getParameter("reason"), ChangeReason.Add);
            assert.strictEqual(oBinding.iCreatedContexts, iCreateNo + 1);
            assert.ok(oBinding.aContexts[0].isTransient(), "transient context exists");
            iChangeFired += 1;
        });
        oBinding.iMaxLength = 42;
        oBindingMock.expects("refreshSingle").never();
        aContexts.push(oBinding.create(oFixture.oInitialData));
        checkCreatedContext();
        oBinding.hasPendingChanges();
        iCreateNo += 1;
        expect();
        aContexts.push(oBinding.create(oFixture.oInitialData));
        checkCreatedContext();
        assert.strictEqual(aContexts[0].getIndex(), 1);
        if (oFixture.bRelative) {
            oBindingMock.expects("checkSuspended").withExactArgs(true);
            assert.throws(function () {
                oBinding.setContext({});
            }, new Error("setContext on relative binding is forbidden if a transient entity " + "exists: sap.ui.model.odata.v4.ODataListBinding: /|EMPLOYEES"));
        }
        return Promise.all([aContexts[0].created(), aContexts[1].created()]).then(function () {
            assert.strictEqual(aContexts[0].isTransient(), false);
            assert.ok(aRefreshSingleFinished[0]);
            assert.strictEqual(aContexts[1].isTransient(), false);
            assert.ok(aRefreshSingleFinished[1]);
            assert.strictEqual(oBinding.iCreatedContexts, 2);
            assert.strictEqual(oBinding.iMaxLength, 42, "persisted contexts are not counted");
        });
    });
});
[false, true].forEach(function (bSkipRefresh) {
    QUnit.test("create: bSkipRefresh " + bSkipRefresh, function () {
        var oBinding = this.bindList("/EMPLOYEES"), oBindingMock = this.mock(oBinding), oContext, oCreatedEntity = {}, oCreatePathPromise = {}, oCreatePromise = SyncPromise.resolve(Promise.resolve(oCreatedEntity)), oGroupLock0 = {}, oGroupLock1 = {}, oInitialData = {}, sPredicate = "(ID=42)", oRefreshedEntity = {}, that = this;
        oBindingMock.expects("lockGroup").withExactArgs(undefined, true, true, sinon.match.func).returns(oGroupLock0);
        oBindingMock.expects("fetchResourcePath").withExactArgs().returns(oCreatePathPromise);
        oBindingMock.expects("createInCache").withExactArgs(sinon.match.same(oGroupLock0), sinon.match.same(oCreatePathPromise), "/EMPLOYEES", sinon.match(rTransientPredicate), sinon.match.same(oInitialData), sinon.match.func, sinon.match.func).returns(oCreatePromise);
        oCreatePromise.then(function () {
            that.mock(_Helper).expects("getPrivateAnnotation").withExactArgs(sinon.match.same(oCreatedEntity), "predicate").returns(sPredicate);
            oBindingMock.expects("fireEvent").withExactArgs("createCompleted", {
                context: sinon.match.same(oContext),
                success: true
            });
            oBindingMock.expects("lockGroup").withExactArgs("$auto").exactly(bSkipRefresh ? 0 : 1).returns(oGroupLock1);
            oBindingMock.expects("refreshSingle").withExactArgs(sinon.match(function (oContext0) {
                return oContext0 === oContext && oContext0.getPath() === "/EMPLOYEES(ID=42)";
            }), sinon.match.same(oGroupLock1)).exactly(bSkipRefresh ? 0 : 1).returns(SyncPromise.resolve(oRefreshedEntity));
        });
        oContext = oBinding.create(oInitialData, bSkipRefresh);
        return oContext.created();
    });
});
[{
        sPredicate: "('bar')"
    }, {
        oInitialData: {},
        sPredicate: "('bar')"
    }, {
        oInitialData: {},
        bGetPredicate: true
    }, {
        oInitialData: { "@$ui5.keepTransientPath": true }
    }].forEach(function (oFixture) {
    var sTitle = "create: relative binding, initial data: " + JSON.stringify(oFixture.oInitialData) + ", predicate: " + oFixture.sPredicate;
    QUnit.test(sTitle, function (assert) {
        var oBinding = this.bindList("TEAM_2_EMPLOYEES", Context.create(this.oModel, oParentBinding, "/TEAMS/1", 1)), oBindingMock = this.mock(oBinding), aCacheResult = [{}, {}, { "@$ui5._": { "predicate": "('foo')" } }, {}], oContext, oContext2 = Context.create(this.oModel, oParentBinding, "/TEAMS/2", 2), aContexts, oCreatedEntity = {}, oCreateGroupLock = {}, oCreateInCachePromise = SyncPromise.resolve(Promise.resolve(oCreatedEntity)), oCreatePathPromise = {}, oFetchDataGroupLock = { unlock: function () { } }, oRefreshGroupLock = {}, oRefreshPromise = oCreateInCachePromise.then(function () {
            return SyncPromise.resolve(Promise.resolve());
        }), that = this;
        oBinding.enableExtendedChangeDetection();
        oBindingMock.expects("fetchResourcePath").withExactArgs().returns(oCreatePathPromise);
        oBindingMock.expects("checkSuspended").withExactArgs().twice();
        oBindingMock.expects("lockGroup").withExactArgs(undefined, true, true, sinon.match.func).returns(oCreateGroupLock);
        oBindingMock.expects("createInCache").withExactArgs(sinon.match.same(oCreateGroupLock), sinon.match.same(oCreatePathPromise), "/TEAMS/1/TEAM_2_EMPLOYEES", sinon.match(rTransientPredicate), sinon.match.same(oFixture.oInitialData), sinon.match.func, sinon.match.func).returns(oCreateInCachePromise);
        oCreateInCachePromise.then(function () {
            that.mock(_Helper).expects("getPrivateAnnotation").exactly(oFixture.sPredicate || oFixture.bGetPredicate ? 1 : 0).withExactArgs(sinon.match.same(oCreatedEntity), "predicate").returns(oFixture.sPredicate);
            oBindingMock.expects("adjustPredicate").exactly(oFixture.sPredicate ? 1 : 0).withExactArgs(sinon.match(rTransientPredicate), oFixture.sPredicate, sinon.match.same(oContext));
            that.mock(that.oModel).expects("checkMessages").exactly(oFixture.sPredicate ? 1 : 0).withExactArgs();
            oBindingMock.expects("getGroupId").withExactArgs().returns("$auto");
            oBindingMock.expects("lockGroup").withExactArgs("$auto").returns(oRefreshGroupLock);
            oBindingMock.expects("refreshSingle").withExactArgs(sinon.match.same(oContext), sinon.match.same(oRefreshGroupLock)).returns(oRefreshPromise);
        });
        oContext = oBinding.create(oFixture.oInitialData);
        aCacheResult.unshift({});
        oBindingMock.expects("lockGroup").withExactArgs().returns(oFetchDataGroupLock);
        this.mock(oFetchDataGroupLock).expects("unlock").withExactArgs();
        this.mock(oBinding.oContext).expects("fetchValue").withExactArgs("/TEAMS/1/TEAM_2_EMPLOYEES").returns(SyncPromise.resolve(aCacheResult));
        aContexts = oBinding.getContexts(0, 4);
        assert.strictEqual(aContexts.length, 4);
        assert.strictEqual(aContexts[0], oContext);
        assert.strictEqual(aContexts[1].getPath(), "/TEAMS/1/TEAM_2_EMPLOYEES/0");
        assert.strictEqual(aContexts[2].getPath(), "/TEAMS/1/TEAM_2_EMPLOYEES/1");
        assert.strictEqual(aContexts[3].getPath(), "/TEAMS/1/TEAM_2_EMPLOYEES('foo')");
        assert.strictEqual(oBinding.aPreviousData.length, 4);
        assert.ok(/\/TEAMS\/1\/TEAM_2_EMPLOYEES\(\$uid=id-[-0-9]+\)/.test(oBinding.aPreviousData[0]), oBinding.aPreviousData[0]);
        assert.strictEqual(oBinding.aPreviousData[1], "/TEAMS/1/TEAM_2_EMPLOYEES/0");
        assert.strictEqual(oBinding.aPreviousData[2], "/TEAMS/1/TEAM_2_EMPLOYEES/1");
        assert.strictEqual(oBinding.aPreviousData[3], "/TEAMS/1/TEAM_2_EMPLOYEES('foo')");
        assert.throws(function () {
            oBindingMock.expects("checkSuspended").withExactArgs(true);
            oBinding.setContext(oContext2);
        }, new Error("setContext on relative binding is forbidden if a transient entity " + "exists: sap.ui.model.odata.v4.ODataListBinding: /TEAMS/1[1]|TEAM_2_EMPLOYEES"));
        return oContext.created().then(function () {
            oBindingMock.expects("checkSuspended").withExactArgs(true);
            oBindingMock.expects("reset").withExactArgs();
            oBindingMock.expects("fetchCache").withExactArgs(sinon.match.same(oContext2));
            oBinding.setContext(oContext2);
        });
    });
});
QUnit.test("create: relative binding not yet resolved", function (assert) {
    var oBinding = this.bindList("TEAM_2_EMPLOYEES");
    assert.throws(function () {
        oBinding.create();
    }, new Error("Binding is unresolved: " + oBinding));
});
QUnit.test("create: bAtEnd & suspended", function (assert) {
    var oBinding = this.bindList("/TEAMS"), oError = new Error("suspended");
    this.mock(oBinding).expects("checkSuspended").withExactArgs().throws(oError);
    assert.throws(function () {
        oBinding.create();
    }, oError);
    assert.strictEqual(oBinding.bCreatedAtEnd, undefined);
});
QUnit.test("create: failure", function (assert) {
    var oBinding = this.bindList("/EMPLOYEES"), oBindingMock = this.mock(oBinding), oContext, oCreatePathPromise = {}, oError = new Error(), oCreatePromise = SyncPromise.resolve(Promise.reject(oError)), oGroupLock = { unlock: function () { } }, oInitialData = {};
    oBindingMock.expects("lockGroup").withExactArgs(undefined, true, true, sinon.match.func).returns(oGroupLock);
    oBindingMock.expects("fetchResourcePath").withExactArgs().returns(oCreatePathPromise);
    oBindingMock.expects("createInCache").withExactArgs(sinon.match.same(oGroupLock), sinon.match.same(oCreatePathPromise), "/EMPLOYEES", sinon.match(rTransientPredicate), sinon.match.same(oInitialData), sinon.match.func, sinon.match.func).returns(oCreatePromise);
    oBindingMock.expects("refreshSingle").never();
    this.mock(oGroupLock).expects("unlock").withExactArgs(true);
    oContext = oBinding.create(oInitialData);
    return oContext.created().then(function () {
        assert.ok(false);
    }, function (oError0) {
        assert.strictEqual(oError0, oError);
    });
});
[
    [false, true],
    [true, false],
    [undefined, true],
    [true, undefined]
].forEach(function (aAtEnd, i) {
    QUnit.test("create: bAtEnd #" + i, function (assert) {
        var oBinding = this.bindList("/EMPLOYEES"), oContext, oGroupLock = {};
        oBinding.bLengthFinal = true;
        oBinding.iMaxLength = 0;
        this.mock(oBinding).expects("lockGroup").withExactArgs(undefined, true, true, sinon.match.func).returns(oGroupLock);
        this.mock(oBinding.oCachePromise.getResult()).expects("create").withExactArgs(sinon.match.same(oGroupLock), sinon.match(function (oPromise) {
            return oPromise.getResult() === "EMPLOYEES";
        }), "", sinon.match(rTransientPredicate), undefined, sinon.match.func, sinon.match.func).returns(SyncPromise.resolve(Promise.resolve({})));
        oContext = oBinding.create(undefined, true, aAtEnd[0]);
        assert.strictEqual(oBinding.bCreatedAtEnd, !!aAtEnd[0]);
        assert.throws(function () {
            oBinding.create(undefined, true, aAtEnd[1]);
        }, new Error("Creating entities at the start and at the end is not supported."));
        return oContext.created();
    });
});
QUnit.test("create: bAtEnd without $count", function (assert) {
    var oBinding = this.bindList("/EMPLOYEES"), oContext, sError = "Must know the final length to create at the end. Consider setting $count";
    this.mock(oBinding).expects("checkSuspended").thrice().withExactArgs();
    assert.throws(function () {
        oBinding.create(undefined, true, true);
    }, new Error(sError));
    oBinding.createContexts(3, createData(3, 0, true));
    assert.throws(function () {
        oBinding.create(undefined, true, true);
    }, new Error(sError));
    oBinding.createContexts(6, createData(1, 3, true, 1));
    this.mock(oBinding).expects("createInCache").returns(SyncPromise.resolve(Promise.resolve({})));
    oContext = oBinding.create(undefined, true, true);
    oBinding = this.bindList("TEAM_2_EMPLOYEES", Context.create(this.oModel, oParentBinding, "/TEAMS('42')"));
    this.mock(oBinding).expects("checkSuspended").withExactArgs();
    assert.throws(function () {
        oBinding.create(undefined, true, true);
    }, new Error(sError));
    oBinding = this.bindList("TEAM_2_EMPLOYEES", this.oModel.createBindingContext("/TEAMS('42')"));
    this.mock(oBinding).expects("checkSuspended").withExactArgs();
    assert.throws(function () {
        oBinding.create(undefined, true, true);
    }, new Error(sError));
    return oContext.created();
});
QUnit.test("create: bAtEnd with $count, but before read", function (assert) {
    var oBinding = this.bindList("/EMPLOYEES", null, null, null, { $count: true }), oContext0, oContext1, oContext2;
    this.mock(oBinding).expects("checkSuspended").thrice().withExactArgs();
    this.mock(oBinding).expects("createInCache").thrice().returns(SyncPromise.resolve(Promise.resolve({})));
    oContext0 = oBinding.create(undefined, true, true);
    oContext1 = oBinding.create(undefined, true, true);
    oContext2 = oBinding.create(undefined, true, true);
    assert.strictEqual(oBinding.getModelIndex(0), 2);
    assert.strictEqual(oBinding.getModelIndex(1), 1);
    assert.strictEqual(oBinding.getModelIndex(2), 0);
    return Promise.all([
        oContext0.created(),
        oContext1.created(),
        oContext2.created()
    ]);
});
QUnit.test("create and delete with bAtEnd varying", function (assert) {
    var oBinding = this.bindList("/EMPLOYEES"), oBindingMock = this.mock(oBinding), oContext1, oContext2, oExpectation;
    oBinding.bLengthFinal = true;
    oBinding.iMaxLength = 0;
    oExpectation = oBindingMock.expects("lockGroup").atLeast(1).returns({});
    oBindingMock.expects("createInCache").returns(SyncPromise.resolve({}));
    oBindingMock.expects("refreshSingle").atLeast(1).returns(SyncPromise.resolve());
    oBinding.create(undefined, false, true);
    oExpectation.args[0][3]();
    oBindingMock.expects("createInCache").returns(SyncPromise.resolve({}));
    oContext1 = oBinding.create(undefined, false, false);
    oBindingMock.expects("createInCache").returns(SyncPromise.resolve({}));
    oContext2 = oBinding.create(undefined);
    oBindingMock.expects("deleteFromCache").callsArgWith(4, 0).returns(SyncPromise.resolve());
    oBinding._delete({}, "~", oContext1);
    assert.throws(function () {
        oBinding.create(undefined, false, true);
    }, new Error("Creating entities at the start and at the end is not supported."));
    oBindingMock.expects("deleteFromCache").callsArgWith(4, 0).returns(SyncPromise.resolve());
    oBinding._delete({}, "~", oContext2);
    oBindingMock.expects("createInCache").returns(SyncPromise.resolve({}));
    oBinding.create(undefined, false, true);
    oBinding.reset();
    oBindingMock.expects("createInCache").returns(SyncPromise.resolve({}));
    oBinding.create(undefined);
});
QUnit.test("delete transient entity", function (assert) {
    var oBinding = this.bindList("/EMPLOYEES"), oBindingMock = this.mock(oBinding), fnDeleteFromCache = oBinding.deleteFromCache, oContext;
    oBinding.createContexts(0, createData(3, 0, true, 3));
    oBinding.oCachePromise.getResult().oRequestor.request.restore();
    oBindingMock.expects("_fireChange").withExactArgs({ reason: ChangeReason.Add });
    oBindingMock.expects("getUpdateGroupId").returns("update");
    oContext = oBinding.create();
    assert.strictEqual(oBinding.iCreatedContexts, 1);
    assert.strictEqual(oBinding.getLength(), 4);
    oContext.created().catch(function (oError) {
        assert.ok(oError.canceled, "create promise rejected with 'canceled'");
    });
    this.mock(oBinding).expects("destroyCreated").withExactArgs(sinon.match.same(oContext), true).callThrough();
    oBindingMock.expects("deleteFromCache").callsFake(function () {
        return fnDeleteFromCache.apply(this, arguments).then(function () {
            oBindingMock.expects("_fireChange").withExactArgs({ reason: ChangeReason.Remove }).callsFake(function () {
                assert.strictEqual(oBinding.iCreatedContexts, 0, "No transient context");
                assert.strictEqual(oBinding.getLength(), 3);
            });
        });
    });
    return oContext.delete("$direct");
});
QUnit.test("getEntryKey", function (assert) {
    var oContext = {
        getPath: function () {
            return "/some/path";
        }
    };
    assert.strictEqual(ODataListBinding.prototype.getEntryKey(oContext), "/some/path");
});
QUnit.test("getEntryData", function (assert) {
    var oValue = {}, oContext = {
        getValue: function () {
            return oValue;
        }
    };
    this.mock(JSON).expects("stringify").withExactArgs(sinon.match.same(oValue)).returns("~json~");
    assert.strictEqual(ODataListBinding.prototype.getEntryData(oContext), "~json~");
});
QUnit.test("getDiff", function (assert) {
    var oBinding = this.bindList("EMPLOYEE_2_EQUIPMENTS", Context.create(this.oModel, oParentBinding, "/EMPLOYEES/0")), oBindingMock = this.mock(oBinding), aContexts = [{}, {}], aDiff = [], aPreviousData = [];
    oBinding.aPreviousData = aPreviousData;
    oBindingMock.expects("getContextsInViewOrder").withExactArgs(0, 50).returns(aContexts);
    oBindingMock.expects("getContextData").withExactArgs(sinon.match.same(aContexts[0])).returns("~data~0");
    oBindingMock.expects("getContextData").withExactArgs(sinon.match.same(aContexts[1])).returns("~data~1");
    oBindingMock.expects("diffData").withExactArgs(sinon.match.same(aPreviousData), ["~data~0", "~data~1"]).returns(aDiff);
    assert.strictEqual(oBinding.getDiff(50), aDiff);
    assert.deepEqual(oBinding.aPreviousData, ["~data~0", "~data~1"]);
});
[
    { op: FilterOperator.BT, result: "SupplierName ge 'SAP' and SupplierName le 'XYZ'" },
    { op: FilterOperator.NB, result: "SupplierName lt 'SAP' or SupplierName gt 'XYZ'" },
    { op: FilterOperator.EQ, result: "SupplierName eq 'SAP'" },
    { op: FilterOperator.GE, result: "SupplierName ge 'SAP'" },
    { op: FilterOperator.GT, result: "SupplierName gt 'SAP'" },
    { op: FilterOperator.LE, result: "SupplierName le 'SAP'" },
    { op: FilterOperator.LT, result: "SupplierName lt 'SAP'" },
    { op: FilterOperator.NE, result: "SupplierName ne 'SAP'" },
    { op: FilterOperator.Contains, result: "contains(SupplierName,'SAP')" },
    { op: FilterOperator.NotContains, result: "not contains(SupplierName,'SAP')" },
    { op: FilterOperator.EndsWith, result: "endswith(SupplierName,'SAP')" },
    { op: FilterOperator.NotEndsWith, result: "not endswith(SupplierName,'SAP')" },
    { op: FilterOperator.StartsWith, result: "startswith(SupplierName,'SAP')" },
    { op: FilterOperator.NotStartsWith, result: "not startswith(SupplierName,'SAP')" },
    { caseSensitive: false, op: FilterOperator.BT, result: "tolower(SupplierName) ge tolower('SAP') and " + "tolower(SupplierName) le tolower('XYZ')" },
    { caseSensitive: false, op: FilterOperator.NB, result: "tolower(SupplierName) lt tolower('SAP') or " + "tolower(SupplierName) gt tolower('XYZ')" },
    { caseSensitive: false, op: FilterOperator.EQ, result: "tolower(SupplierName) eq tolower('SAP')" },
    { caseSensitive: false, op: FilterOperator.GE, result: "tolower(SupplierName) ge tolower('SAP')" },
    { caseSensitive: false, op: FilterOperator.GT, result: "tolower(SupplierName) gt tolower('SAP')" },
    { caseSensitive: false, op: FilterOperator.LE, result: "tolower(SupplierName) le tolower('SAP')" },
    { caseSensitive: false, op: FilterOperator.LT, result: "tolower(SupplierName) lt tolower('SAP')" },
    { caseSensitive: false, op: FilterOperator.NE, result: "tolower(SupplierName) ne tolower('SAP')" },
    { caseSensitive: false, op: FilterOperator.Contains, result: "contains(tolower(SupplierName),tolower('SAP'))" },
    { caseSensitive: false, op: FilterOperator.NotContains, result: "not contains(tolower(SupplierName),tolower('SAP'))" },
    { caseSensitive: false, op: FilterOperator.EndsWith, result: "endswith(tolower(SupplierName),tolower('SAP'))" },
    { caseSensitive: false, op: FilterOperator.NotEndsWith, result: "not endswith(tolower(SupplierName),tolower('SAP'))" },
    { caseSensitive: false, op: FilterOperator.StartsWith, result: "startswith(tolower(SupplierName),tolower('SAP'))" },
    { caseSensitive: false, op: FilterOperator.NotStartsWith, result: "not startswith(tolower(SupplierName),tolower('SAP'))" },
    { caseSensitive: true, op: FilterOperator.EQ, result: "SupplierName eq 'SAP'" },
    { caseSensitive: false, op: FilterOperator.EQ, result: "SupplierName eq 'SAP'", type: "Edm.Foo" }
].forEach(function (oFixture) {
    QUnit.test("fetchFilter: " + oFixture.op + " --> " + oFixture.result, function (assert) {
        var oBinding = this.bindList("/SalesOrderList('4711')/SO_2_ITEMS"), oHelperMock = this.mock(_Helper), oMetaContext = {}, oMetaModelMock = this.mock(this.oModel.oMetaModel), sType = oFixture.type || "Edm.String", oPropertyMetadata = { $Type: sType };
        this.mock(this.oModel).expects("resolve").withExactArgs(oBinding.sPath, undefined).returns(oBinding.sPath);
        oMetaModelMock.expects("resolve").withExactArgs("SupplierName", sinon.match.same(oMetaContext)).returns("/resolved/path");
        oMetaModelMock.expects("getMetaContext").withExactArgs(oBinding.sPath).returns(oMetaContext);
        oMetaModelMock.expects("fetchObject").withExactArgs("/resolved/path").returns(SyncPromise.resolve(oPropertyMetadata));
        oHelperMock.expects("formatLiteral").withExactArgs("SAP", sType).returns("'SAP'");
        if (oFixture.op === FilterOperator.BT || oFixture.op === FilterOperator.NB) {
            oHelperMock.expects("formatLiteral").withExactArgs("XYZ", sType).returns("'XYZ'");
        }
        oBinding.aApplicationFilters = [new Filter({
                caseSensitive: oFixture.caseSensitive !== undefined ? oFixture.caseSensitive : true,
                operator: oFixture.op,
                path: "SupplierName",
                value1: "SAP",
                value2: "XYZ"
            })];
        assert.deepEqual(oBinding.fetchFilter().getResult(), [oFixture.result, undefined]);
    });
});
[false, true].forEach(function (bRelative) {
    [false, true].forEach(function (bAnd) {
        QUnit.test("fetchFilter: dynamic '" + (bAnd ? "and" : "or") + "' and static filters, " + (bRelative ? "relative" : "absolute") + " binding", function (assert) {
            var oBinding = this.bindList(bRelative ? "BP_2_SO" : "/SalesOrderList"), oContext = Context.create(this.oModel, {}, "/BusinessPartnerList"), oHelperMock = this.mock(_Helper), oMetaModelMock = this.mock(this.oModel.oMetaModel), sResolvedPath = bRelative ? "/BusinessPartnerList('42')/BP_2_SO" : "/SalesOrderList";
            this.mock(this.oModel).expects("resolve").withExactArgs(oBinding.sPath, sinon.match.same(oContext)).returns(sResolvedPath);
            oMetaModelMock.expects("getMetaContext").withExactArgs(sResolvedPath).returns("~");
            oMetaModelMock.expects("resolve").withExactArgs("SO_2_BP/CompanyName", "~").returns("/resolved/path1");
            oMetaModelMock.expects("fetchObject").withExactArgs("/resolved/path1").returns(SyncPromise.resolve({ $Type: "Edm.String" }));
            oMetaModelMock.expects("resolve").withExactArgs("GrossAmount", "~").returns("/resolved/path2");
            oMetaModelMock.expects("fetchObject").withExactArgs("/resolved/path2").returns(SyncPromise.resolve({ $Type: "Edm.Decimal" }));
            oHelperMock.expects("formatLiteral").withExactArgs("SAP", "Edm.String").returns("'SAP'");
            oHelperMock.expects("formatLiteral").withExactArgs(12345, "Edm.Decimal").returns(12345);
            oBinding.aApplicationFilters = [
                new Filter({
                    filters: [
                        new Filter("SO_2_BP/CompanyName", FilterOperator.EQ, "SAP"),
                        new Filter("GrossAmount", FilterOperator.LE, 12345)
                    ],
                    and: bAnd
                })
            ];
            assert.deepEqual(oBinding.fetchFilter(oContext, "GrossAmount ge 1000").getResult(), [(bAnd ? "SO_2_BP/CompanyName eq 'SAP' and GrossAmount le 12345" : "(SO_2_BP/CompanyName eq 'SAP' or GrossAmount le 12345)") + " and (GrossAmount ge 1000)", undefined]);
        });
    });
});
QUnit.test("fetchFilter: static filter only", function (assert) {
    var oBinding = this.bindList("/SalesOrderList");
    assert.deepEqual(oBinding.fetchFilter(undefined, "GrossAmount ge 1000").getResult(), ["GrossAmount ge 1000"]);
});
QUnit.test("fetchFilter: error invalid operator", function (assert) {
    var oBinding = this.bindList("/SalesOrderList"), oPropertyMetadata = { $Type: "Edm.String" };
    this.mock(this.oModel).expects("resolve").withExactArgs(oBinding.sPath, undefined).returns(oBinding.sPath);
    this.mock(this.oModel.oMetaModel).expects("getMetaContext").withExactArgs(oBinding.sPath).returns("~");
    this.mock(this.oModel.oMetaModel).expects("resolve").withExactArgs("SO_2_BP/CompanyName", "~").returns("/resolved/path");
    this.mock(this.oModel.oMetaModel).expects("fetchObject").withExactArgs("/resolved/path").returns(SyncPromise.resolve(oPropertyMetadata));
    this.mock(_Helper).expects("formatLiteral").withExactArgs("SAP", "Edm.String").returns("'SAP'");
    oBinding.aApplicationFilters = [new Filter("SO_2_BP/CompanyName", "invalid", "SAP")];
    return oBinding.fetchFilter().then(function () {
        assert.ok(false);
    }, function (oError) {
        assert.strictEqual(oError.message, "Unsupported operator: invalid");
    });
});
QUnit.test("fetchFilter: error no metadata for filter path", function (assert) {
    var oBinding = this.bindList("/SalesOrderList"), sPath = "/SalesOrderList/SO_2_BP/CompanyName", oMetaContext = {
        getPath: function () { return sPath; }
    };
    this.mock(this.oModel.oMetaModel).expects("getMetaContext").withExactArgs(oBinding.sPath).returns(oMetaContext);
    this.mock(this.oModel.oMetaModel).expects("resolve").withExactArgs("SO_2_BP/CompanyName", sinon.match.same(oMetaContext)).returns("/resolved/path");
    this.mock(this.oModel.oMetaModel).expects("fetchObject").withExactArgs("/resolved/path").returns(SyncPromise.resolve());
    oBinding.aApplicationFilters = [new Filter("SO_2_BP/CompanyName", FilterOperator.EQ, "SAP")];
    return oBinding.fetchFilter().then(function () {
        assert.ok(false);
    }, function (oError) {
        assert.strictEqual(oError.message, "Type cannot be determined, no metadata for path: " + "/resolved/path");
    });
});
[
    { filters: [], result: undefined },
    { filters: ["path0", "path1"], result: "path0 eq path0Value and path1 eq path1Value" },
    {
        filters: [{ p: "path0", v: "foo" }, "path1", { p: "path0", v: "bar" }],
        result: "(path0 eq foo or path0 eq bar) and path1 eq path1Value"
    }
].forEach(function (oFixture) {
    QUnit.test("fetchFilter: flat filter '" + oFixture.result + "'", function (assert) {
        var oBinding = this.bindList("/SalesOrderList"), aFilters = [], oHelperMock = this.mock(_Helper), oMetaModelMock = this.mock(this.oModel.oMetaModel), oPropertyMetadata = { $Type: "Edm.Type" };
        oMetaModelMock.expects("getMetaContext").exactly(oFixture.filters.length ? 1 : 0).withExactArgs(oBinding.sPath).returns("~");
        oFixture.filters.forEach(function (vFilter) {
            var sPath, sValue;
            if (typeof vFilter === "string") {
                sPath = vFilter;
                sValue = sPath + "Value";
            }
            else {
                sPath = vFilter.p;
                sValue = vFilter.v;
            }
            aFilters.push(new Filter(sPath, FilterOperator.EQ, sValue));
            oMetaModelMock.expects("resolve").withExactArgs(sPath, "~").returns("/resolved/path");
            oMetaModelMock.expects("fetchObject").withExactArgs("/resolved/path").returns(SyncPromise.resolve(oPropertyMetadata));
            oHelperMock.expects("formatLiteral").withExactArgs(sValue, "Edm.Type").returns(sValue);
        });
        oBinding.aApplicationFilters = aFilters;
        return oBinding.fetchFilter().then(function (aFilterValues) {
            assert.strictEqual(aFilterValues[0], oFixture.result);
            assert.strictEqual(aFilterValues[1], undefined);
        });
    });
});
QUnit.test("fetchFilter: hierarchical filter", function (assert) {
    var oBinding = this.bindList("/Set"), oFilterPromise, aFilters = [
        new Filter("p0.0", FilterOperator.EQ, "v0.0"),
        new Filter({
            filters: [
                new Filter("p1.0", FilterOperator.EQ, "v1.0"),
                new Filter("p1.1", FilterOperator.EQ, "v1.1")
            ]
        }),
        new Filter({
            filters: [
                new Filter("p2.0", FilterOperator.EQ, "v2.0"),
                new Filter("p2.1", FilterOperator.EQ, "v2.1"),
                new Filter("p2.2", FilterOperator.EQ, "v2.2")
            ],
            and: true
        }),
        new Filter("p3.0", FilterOperator.EQ, "v3.0"),
        new Filter("p3.1", FilterOperator.NB, "v3.1", "v3.1")
    ], oMetaModelMock = this.mock(this.oModel.oMetaModel), oPropertyMetadata = { $Type: "Edm.String" }, oPromise = Promise.resolve(oPropertyMetadata);
    oMetaModelMock.expects("getMetaContext").withExactArgs(oBinding.sPath).returns("~");
    oMetaModelMock.expects("resolve").withExactArgs("p0.0", "~").returns("/resolved/p0.0");
    oMetaModelMock.expects("fetchObject").withExactArgs("/resolved/p0.0").returns(oPromise);
    oMetaModelMock.expects("resolve").withExactArgs("p1.0", "~").returns("/resolved/p1.0");
    oMetaModelMock.expects("fetchObject").withExactArgs("/resolved/p1.0").returns(oPromise);
    oMetaModelMock.expects("resolve").withExactArgs("p1.1", "~").returns("/resolved/p1.1");
    oMetaModelMock.expects("fetchObject").withExactArgs("/resolved/p1.1").returns(oPromise);
    oMetaModelMock.expects("resolve").withExactArgs("p2.0", "~").returns("/resolved/p2.0");
    oMetaModelMock.expects("fetchObject").withExactArgs("/resolved/p2.0").returns(oPromise);
    oMetaModelMock.expects("resolve").withExactArgs("p2.1", "~").returns("/resolved/p2.1");
    oMetaModelMock.expects("fetchObject").withExactArgs("/resolved/p2.1").returns(oPromise);
    oMetaModelMock.expects("resolve").withExactArgs("p2.2", "~").returns("/resolved/p2.2");
    oMetaModelMock.expects("fetchObject").withExactArgs("/resolved/p2.2").returns(oPromise);
    oMetaModelMock.expects("resolve").withExactArgs("p3.0", "~").returns("/resolved/p3.0");
    oMetaModelMock.expects("fetchObject").withExactArgs("/resolved/p3.0").returns(oPromise);
    oMetaModelMock.expects("resolve").withExactArgs("p3.1", "~").returns("/resolved/p3.1");
    oMetaModelMock.expects("fetchObject").withExactArgs("/resolved/p3.1").returns(oPromise);
    oBinding.aApplicationFilters = aFilters;
    oFilterPromise = oBinding.fetchFilter();
    assert.strictEqual(oFilterPromise.isFulfilled(), false);
    return oFilterPromise.then(function (sFilterValue) {
        assert.deepEqual(sFilterValue, ["p0.0 eq 'v0.0'" + " and (p1.0 eq 'v1.0' or p1.1 eq 'v1.1')" + " and p2.0 eq 'v2.0' and p2.1 eq 'v2.1' and p2.2 eq 'v2.2'" + " and p3.0 eq 'v3.0'" + " and (p3.1 lt 'v3.1' or p3.1 gt 'v3.1')", undefined]);
    });
});
[FilterOperator.All, FilterOperator.Any].forEach(function (sFilterOperator) {
    [{
            description: "no nesting",
            expectedResult: "p0/" + sFilterOperator.toLowerCase() + "(v0:v0/p1 eq 'value1')",
            fetchObjects: {
                "p0": "Type0",
                "p0/p1": "Edm.String"
            },
            filter: new Filter({
                condition: new Filter("v0/p1", FilterOperator.EQ, "value1"),
                operator: sFilterOperator,
                path: "p0",
                variable: "v0"
            })
        }, {
            description: "nested any/all filters",
            expectedResult: "p0/" + sFilterOperator.toLowerCase() + "(v0:" + "v0/p1/" + sFilterOperator.toLowerCase() + "(v1:v1/p2 eq 'value2'))",
            fetchObjects: {
                "p0": "Type0",
                "p0/p1": "Type1",
                "p0/p1/p2": "Edm.String"
            },
            filter: new Filter({
                condition: new Filter({
                    condition: new Filter("v1/p2", FilterOperator.EQ, "value2"),
                    operator: sFilterOperator,
                    path: "v0/p1",
                    variable: "v1"
                }),
                operator: sFilterOperator,
                path: "p0",
                variable: "v0"
            })
        }, {
            description: "nested multi-filter",
            expectedResult: "p0/" + sFilterOperator.toLowerCase() + "(v0:v0/p1 eq 'value1' and v0/p2 eq 'value2')",
            fetchObjects: {
                "p0": "Type0",
                "p0/p1": "Edm.String",
                "p0/p2": "Edm.String"
            },
            filter: new Filter({
                condition: new Filter({
                    filters: [
                        new Filter("v0/p1", FilterOperator.EQ, "value1"),
                        new Filter("v0/p2", FilterOperator.EQ, "value2")
                    ],
                    and: true
                }),
                operator: sFilterOperator,
                path: "p0",
                variable: "v0"
            })
        }, {
            description: "nested multi-filter containing an 'any' filter",
            expectedResult: "p0/" + sFilterOperator.toLowerCase() + "(v0:v0/p1/any(v1:v1/p2 lt 'value1') or v0/p3 eq 'value2')",
            fetchObjects: {
                "p0": "Type0",
                "p0/p1": "Type1",
                "p0/p1/p2": "Edm.String",
                "p0/p3": "Edm.String"
            },
            filter: new Filter({
                condition: new Filter({
                    filters: [
                        new Filter({
                            condition: new Filter("v1/p2", FilterOperator.LT, "value1"),
                            operator: FilterOperator.Any,
                            path: "v0/p1",
                            variable: "v1"
                        }),
                        new Filter("v0/p3", FilterOperator.EQ, "value2")
                    ]
                }),
                operator: sFilterOperator,
                path: "p0",
                variable: "v0"
            })
        }, {
            description: "multi filters using same lambda variable",
            expectedResult: "p0/" + sFilterOperator.toLowerCase() + "(v0:v0/p1/any(v1:v1/p3 lt 'value1') or v0/p2/any(v1:v1/p4 gt 'value2'))",
            fetchObjects: {
                "p0": "Type0",
                "p0/p1": "Type1",
                "p0/p1/p3": "Edm.String",
                "p0/p2": "Type2",
                "p0/p2/p4": "Edm.String"
            },
            filter: new Filter({
                condition: new Filter({
                    filters: [
                        new Filter({
                            condition: new Filter("v1/p3", FilterOperator.LT, "value1"),
                            operator: FilterOperator.Any,
                            path: "v0/p1",
                            variable: "v1"
                        }),
                        new Filter({
                            condition: new Filter("v1/p4", FilterOperator.GT, "value2"),
                            operator: FilterOperator.Any,
                            path: "v0/p2",
                            variable: "v1"
                        })
                    ]
                }),
                operator: sFilterOperator,
                path: "p0",
                variable: "v0"
            })
        }, {
            description: "nested filter overwrites outer lambda variable",
            expectedResult: "p0/" + sFilterOperator.toLowerCase() + "(v0:v0/p1/" + sFilterOperator.toLowerCase() + "(v0:v0/p2 lt 'value1'))",
            fetchObjects: {
                "p0": "Type0",
                "p0/p1": "Type1",
                "p0/p1/p2": "Edm.String"
            },
            filter: new Filter({
                condition: new Filter({
                    condition: new Filter("v0/p2", FilterOperator.LT, "value1"),
                    operator: sFilterOperator,
                    path: "v0/p1",
                    variable: "v0"
                }),
                operator: sFilterOperator,
                path: "p0",
                variable: "v0"
            })
        }].forEach(function (oFixture) {
        QUnit.test("fetchFilter: " + sFilterOperator + " - " + oFixture.description, function (assert) {
            var oBinding = this.bindList("/Set"), aFetchObjectKeys = Object.keys(oFixture.fetchObjects), oMetaModelMock = this.mock(this.oModel.oMetaModel);
            oBinding.aApplicationFilters = [oFixture.filter];
            oMetaModelMock.expects("getMetaContext").withExactArgs(oBinding.sPath).returns("~");
            aFetchObjectKeys.forEach(function (sObjectPath) {
                oMetaModelMock.expects("resolve").withExactArgs(sObjectPath, "~").returns("/resolved/path");
                oMetaModelMock.expects("fetchObject").withExactArgs("/resolved/path").returns(SyncPromise.resolve({
                    $Type: oFixture.fetchObjects[sObjectPath]
                }));
            });
            return oBinding.fetchFilter().then(function (aFilterValues) {
                assert.deepEqual(aFilterValues, [oFixture.expectedResult, undefined]);
            });
        });
    });
});
QUnit.test("fetchFilter: any - without predicate", function (assert) {
    var oBinding = this.bindList("/Set"), oFilter = new Filter({
        operator: FilterOperator.Any,
        path: "p0"
    }), oMetaModelMock = this.mock(this.oModel.oMetaModel);
    oBinding.aApplicationFilters = [oFilter];
    oMetaModelMock.expects("getMetaContext").withExactArgs(oBinding.sPath).returns("~");
    oMetaModelMock.expects("resolve").withExactArgs("p0", "~").returns("/resolved/path");
    oMetaModelMock.expects("fetchObject").withExactArgs("/resolved/path").returns(SyncPromise.resolve({
        $Type: "Type0"
    }));
    return oBinding.fetchFilter().then(function (aFilterValues) {
        assert.deepEqual(aFilterValues, ["p0/any()", undefined]);
    });
});
QUnit.test("fetchFilter: application and control filter", function (assert) {
    var oBinding = this.bindList("/Set"), oMetaModelMock = this.mock(this.oModel.oMetaModel), oPropertyMetadata = { $Type: "Edm.String" }, oPromise = Promise.resolve(oPropertyMetadata);
    oMetaModelMock.expects("getMetaContext").withExactArgs(oBinding.sPath).returns("~");
    oMetaModelMock.expects("resolve").withExactArgs("p0.0", "~").returns("/resolved/p0.0");
    oMetaModelMock.expects("fetchObject").withExactArgs("/resolved/p0.0").returns(oPromise);
    oMetaModelMock.expects("resolve").withExactArgs("p1.0", "~").returns("/resolved/p1.0");
    oMetaModelMock.expects("fetchObject").withExactArgs("/resolved/p1.0").returns(oPromise);
    oBinding.aFilters = [new Filter("p0.0", FilterOperator.EQ, "v0.0")];
    oBinding.aApplicationFilters = [new Filter("p1.0", FilterOperator.EQ, "v1.0")];
    return oBinding.fetchFilter(undefined, "p2.0 eq 'v2.0'").then(function (sFilterValue) {
        assert.deepEqual(sFilterValue, ["p0.0 eq 'v0.0' and p1.0 eq 'v1.0' and (p2.0 eq 'v2.0')", undefined]);
    });
});
QUnit.skip("fetchFilter: filter with encoded path", function (assert) {
    var oBinding = this.bindList("/Set"), oMetaModelMock = this.mock(this.oModel.oMetaModel), oPropertyMetadata = { $Type: "Edm.Decimal" }, oPromise = Promise.resolve(oPropertyMetadata);
    oMetaModelMock.expects("getMetaContext").withExactArgs(oBinding.sPath).returns("~");
    oMetaModelMock.expects("resolve").withExactArgs("AmountIn\u20AC", "~").returns("/resolved/path");
    oMetaModelMock.expects("fetchObject").withExactArgs("/resolved/path").returns(oPromise);
    oBinding.aApplicationFilters = [new Filter("AmountIn%E2%82%AC", FilterOperator.GT, "1000")];
    return oBinding.fetchFilter().then(function (aFilterValues) {
        assert.deepEqual(aFilterValues, ["AmountIn\u20AC gt 1000", undefined]);
    });
});
[{
        filters: ["p1=v1"],
        result: "p1 eq 'v1'"
    }, {
        filters: ["p1=v1", "p1=v2"],
        result: "p1 eq 'v1' or p1 eq 'v2'"
    }, {
        filters: ["p1=v1", "p2=v2"],
        result: "p1 eq 'v1' and p2 eq 'v2'"
    }, {
        filters: ["p1=v1", "p2=v2", "p1=v3"],
        result: "(p1 eq 'v1' or p1 eq 'v3') and p2 eq 'v2'"
    }, {
        filters: [{ or: ["p1=v1", "p1=v2"] }],
        result: "p1 eq 'v1' or p1 eq 'v2'"
    }, {
        filters: [{ and: ["p1=v1", "p1=v2"] }],
        result: "p1 eq 'v1' and p1 eq 'v2'"
    }, {
        filters: [{ or: ["p1=v1", "p1=v2", "p2=v3"] }],
        result: "p1 eq 'v1' or p1 eq 'v2' or p2 eq 'v3'"
    }, {
        filters: [{ and: ["p1=v1", "p1=v2", "p2=v3"] }],
        result: "p1 eq 'v1' and p1 eq 'v2' and p2 eq 'v3'"
    }, {
        filters: ["p1=v1", { or: ["p1=v2", "p1=v3"] }],
        result: "p1 eq 'v1' and (p1 eq 'v2' or p1 eq 'v3')"
    }, {
        filters: ["p1=v1", { and: ["p1=v2", "p1=v3"] }],
        result: "p1 eq 'v1' and p1 eq 'v2' and p1 eq 'v3'"
    }, {
        filters: ["p1=v1", { or: ["p1=v2", "p2=v3"] }],
        result: "p1 eq 'v1' and (p1 eq 'v2' or p2 eq 'v3')"
    }, {
        filters: ["p1=v1", { and: ["p1=v2"] }],
        result: "p1 eq 'v1' and p1 eq 'v2'"
    }].forEach(function (oFixture, i) {
    QUnit.test("filter #" + i + ": " + JSON.stringify(oFixture.filters), function (assert) {
        var oBinding = this.bindList("/Set"), oMetaModelMock = this.mock(this.oModel.oMetaModel), oPropertyMetadata = { $Type: "Edm.String" }, oPromise = Promise.resolve(oPropertyMetadata);
        function buildFilters(aNodes) {
            return aNodes.map(function (vNode) {
                var aParts;
                if (typeof vNode === "string") {
                    aParts = vNode.split("=");
                    return new Filter(aParts[0], FilterOperator.EQ, aParts[1]);
                }
                if (vNode.and) {
                    return new Filter({ filters: buildFilters(vNode.and), and: true });
                }
                return new Filter({ filters: buildFilters(vNode.or) });
            });
        }
        oMetaModelMock.expects("fetchObject").atLeast(0).returns(oPromise);
        oBinding.aApplicationFilters = buildFilters(oFixture.filters);
        return oBinding.fetchFilter().then(function (aFilterValues) {
            assert.deepEqual(aFilterValues, [oFixture.result, undefined]);
        });
    });
});
[{
        split: [new Filter("a", FilterOperator.GT, 42), undefined],
        result: ["a gt 42", undefined]
    }, {
        split: [undefined, new Filter("b", FilterOperator.EQ, "before")],
        result: [undefined, "b eq 'before'"]
    }, {
        split: [undefined, new Filter("b", FilterOperator.EQ, "before")],
        staticFilter: "c eq 47",
        result: ["c eq 47", "b eq 'before'"]
    }, {
        split: [
            new Filter([new Filter("a", FilterOperator.EQ, 1), new Filter("a", FilterOperator.EQ, 2)], false),
            new Filter("b", FilterOperator.EQ, "before")
        ],
        staticFilter: "c eq 47",
        result: ["(a eq 1 or a eq 2) and (c eq 47)", "b eq 'before'"]
    }, {
        split: [new Filter("a", FilterOperator.GT, 42), new Filter("b", FilterOperator.EQ, "before")],
        result: ["a gt 42", "b eq 'before'"]
    }].forEach(function (oFixture, i) {
    QUnit.test("fetchFilter:  list binding aggregates data " + i, function (assert) {
        var oAggregation = {}, oBinding = this.bindList("Set"), oContext = {}, oFilter = {}, oMetaModelMock = this.mock(this.oModel.oMetaModel);
        oBinding.mParameters.$$aggregation = oAggregation;
        this.mock(FilterProcessor).expects("combineFilters").returns(oFilter);
        this.mock(_AggregationHelper).expects("splitFilter").withExactArgs(sinon.match.same(oFilter), sinon.match.same(oAggregation)).returns(oFixture.split);
        this.mock(this.oModel).expects("resolve").withExactArgs("Set", sinon.match.same(oContext)).returns("~");
        oMetaModelMock.expects("getMetaContext").withExactArgs("~").returns("oMetaContext");
        oMetaModelMock.expects("resolve").withExactArgs("a", "oMetaContext").atLeast(0).returns("/resolved/a");
        oMetaModelMock.expects("fetchObject").withExactArgs("/resolved/a").atLeast(0).returns(Promise.resolve({ $Type: "Edm.Decimal" }));
        oMetaModelMock.expects("resolve").withExactArgs("b", "oMetaContext").atLeast(0).returns("/resolved/b");
        oMetaModelMock.expects("fetchObject").withExactArgs("/resolved/b").atLeast(0).returns(Promise.resolve({ $Type: "Edm.String" }));
        return oBinding.fetchFilter(oContext, oFixture.staticFilter).then(function (aFilterValues) {
            assert.deepEqual(aFilterValues, oFixture.result);
        });
    });
});
QUnit.test("getOrderby", function (assert) {
    var oBinding = this.bindList("/EMPLOYEES"), sOrderby = "bar desc";
    assert.strictEqual(oBinding.getOrderby(), "", "empty sorters");
    assert.strictEqual(oBinding.getOrderby(sOrderby), sOrderby);
    oBinding.aSorters = [new Sorter("foo")];
    assert.strictEqual(oBinding.getOrderby(), "foo", "array of sorters");
    assert.strictEqual(oBinding.getOrderby(sOrderby), "foo," + sOrderby);
    oBinding.aSorters = [new Sorter("foo"), new Sorter("bar", true)];
    assert.strictEqual(oBinding.getOrderby(), "foo,bar desc");
    assert.strictEqual(oBinding.getOrderby(sOrderby), "foo,bar desc," + sOrderby);
    oBinding.aSorters = ["foo"];
    assert.throws(function () {
        oBinding.getOrderby();
    }, new Error("Unsupported sorter: foo - " + "sap.ui.model.odata.v4.ODataListBinding: /EMPLOYEES"));
});
QUnit.test("doFetchQueryOptions", function (assert) {
    var oBinding = this.bindList("TEAM_2_EMPLOYEES"), oContext = {}, mMergedQueryOptions = {}, mResolvedQueryOptions = { "$filter": "staticFilter", "$orderby": "staticSorter" };
    this.mock(oBinding).expects("fetchResolvedQueryOptions").withExactArgs(sinon.match.same(oContext)).returns(SyncPromise.resolve(mResolvedQueryOptions));
    this.mock(oBinding).expects("fetchFilter").withExactArgs(sinon.match.same(oContext), "staticFilter").returns(SyncPromise.resolve("resolvedFilter"));
    this.mock(oBinding).expects("getOrderby").withExactArgs("staticSorter").returns("resolvedOrderby");
    this.mock(_Helper).expects("mergeQueryOptions").withExactArgs(sinon.match.same(mResolvedQueryOptions), "resolvedOrderby", "resolvedFilter").returns(mMergedQueryOptions);
    assert.strictEqual(oBinding.doFetchQueryOptions(oContext).getResult(), mMergedQueryOptions);
});
QUnit.test("doCreateCache", function (assert) {
    var oBinding = this.bindList("TEAM_2_EMPLOYEES", null, null, null, {
        $$aggregation: {}
    }), oCache = {};
    this.oModel.bAutoExpandSelect = "~autoExpandSelect~";
    oBinding.bSharedRequest = "~sharedRequest~";
    this.mock(oBinding).expects("inheritQueryOptions").withExactArgs("~queryOptions~", "~context~").returns("~mergedQueryOptions~");
    this.mock(_AggregationCache).expects("create").withExactArgs(sinon.match.same(this.oModel.oRequestor), "resource/path", "deep/resource/path", sinon.match.same(oBinding.mParameters.$$aggregation), "~mergedQueryOptions~", "~autoExpandSelect~", "~sharedRequest~").returns(oCache);
    assert.strictEqual(oBinding.doCreateCache("resource/path", "~queryOptions~", "~context~", "deep/resource/path"), oCache);
});
QUnit.test("getQueryOptionsFromParameters", function (assert) {
    var oBinding = this.bindList("/EMPLOYEES");
    assert.strictEqual(oBinding.getQueryOptionsFromParameters(), oBinding.mQueryOptions);
});
QUnit.test("inheritQueryOptions - binding with parameters", function (assert) {
    var oBinding = this.bindList("/EMPLOYEES", undefined, undefined, undefined, { $$operationMode: OperationMode.Server }), mQueryOptions = {};
    this.mock(oBinding).expects("getQueryOptionsForPath").never();
    assert.strictEqual(oBinding.inheritQueryOptions(mQueryOptions), mQueryOptions);
});
[{
        mDynamicQueryOptionsWithModelOptions: {
            $filter: "Age lt 60",
            $orderby: "Name asc"
        },
        mInheritedQueryOptions: {},
        mExpectedQueryOptions: {
            $filter: "Age lt 60",
            $orderby: "Name asc"
        }
    }, {
        mDynamicQueryOptionsWithModelOptions: {},
        mInheritedQueryOptions: {
            $filter: "Age lt 60",
            $orderby: "Name asc"
        },
        mExpectedQueryOptions: {}
    }, {
        mDynamicQueryOptionsWithModelOptions: {
            $filter: "Age lt 60",
            $orderby: "Name asc"
        },
        mInheritedQueryOptions: {
            $filter: "Age gt 20",
            $orderby: "Name desc"
        },
        mExpectedQueryOptions: {
            $filter: "(Age lt 60) and (Age gt 20)",
            $orderby: "Name asc,Name desc"
        }
    }].forEach(function (oFixture, i) {
    QUnit.test("inheritQueryOptions: Test " + i, function (assert) {
        var oBinding = this.bindList("TEAM_2_EMPLOYEES"), oContext = {}, mQueryOptions = {};
        this.mock(oBinding).expects("getQueryOptionsForPath").withExactArgs("", sinon.match.same(oContext)).returns(oFixture.mInheritedQueryOptions);
        this.mock(Object).expects("assign").withExactArgs({}, sinon.match.same(oFixture.mInheritedQueryOptions), oFixture.mExpectedQueryOptions).returns(mQueryOptions);
        assert.strictEqual(oBinding.inheritQueryOptions(oFixture.mDynamicQueryOptionsWithModelOptions, oContext), mQueryOptions);
    });
});
QUnit.test("getHeaderContext: created in c'tor", function (assert) {
    var oBinding = this.bindList("/EMPLOYEES"), oBindingMock = this.mock(oBinding);
    oBindingMock.expects("isResolved").withExactArgs().returns(true);
    assert.ok(oBinding.getHeaderContext());
    oBindingMock.expects("isResolved").withExactArgs().returns(false);
    assert.strictEqual(oBinding.getHeaderContext(), null);
});
QUnit.test("getHeaderContext: setContext", function (assert) {
    var oBinding = this.bindList("EMPLOYEES"), oContext = Context.create(this.oModel, oParentBinding, "/TEAMS", 0);
    assert.strictEqual(oBinding.getHeaderContext(), null);
    this.mock(oBinding).expects("checkSuspended").withExactArgs(true);
    oBinding.setContext(oContext);
    assert.deepEqual(oBinding.getHeaderContext(), Context.create(this.oModel, oBinding, "/TEAMS/EMPLOYEES"));
});
QUnit.test("BCP: 1770275040 Error occurs in table growing", function (assert) {
    var done = assert.async(), oBinding, bChangeFired = false, aContexts, oData = createData(50);
    oBinding = this.bindList("/EMPLOYEES");
    this.oModel.oRequestor.request.restore();
    this.mock(this.oModel.oRequestor).expects("request").withArgs("GET", "EMPLOYEES?sap-client=111&$skip=0&$top=50").resolves(oData);
    oBinding.bUseExtendedChangeDetection = true;
    oBinding.attachEvent("change", function (oEvent) {
        assert.strictEqual(bChangeFired, false);
        bChangeFired = true;
        assert.strictEqual(oEvent.getParameter("reason"), ChangeReason.Change);
        setTimeout(function () {
            assert.strictEqual(oBinding.oDiff, undefined, "no 2nd change event, no diff!");
            done();
        }, 0);
    });
    aContexts = oBinding.getContexts(0, 50);
    assert.strictEqual(aContexts.length, 0);
    assert.strictEqual(aContexts.dataRequested, true);
    assert.deepEqual(aContexts.diff, []);
    aContexts = oBinding.getContexts(0, 50);
    assert.strictEqual(aContexts.length, 0);
    assert.strictEqual(aContexts.dataRequested, true);
    assert.deepEqual(aContexts.diff, []);
});
QUnit.test("updateAnalyticalInfo: invalid input", function (assert) {
    var aAggregation = [{
            grouped: false,
            name: "BothDimensionAndMeasure",
            total: false
        }], oBinding = this.bindList("/EMPLOYEES");
    this.mock(_AggregationHelper).expects("buildApply").never();
    this.mock(oBinding).expects("changeParameters").never();
    assert.throws(function () {
        oBinding.updateAnalyticalInfo(aAggregation);
    }, new Error("Both dimension and measure: BothDimensionAndMeasure"));
});
QUnit.test("updateAnalyticalInfo: inResult and visible; destroy twice", function (assert) {
    var aAggregation = [{
            grouped: false,
            inResult: true,
            name: "BillToParty"
        }, {
            name: "UnitProperty"
        }, {
            name: "GrossAmountInTransactionCurrency",
            total: false
        }, {
            grouped: false,
            name: "TransactionCurrency",
            visible: true
        }, {
            grouped: false,
            inResult: false,
            name: "IgnoreThisDimension",
            visible: false
        }], sAggregation = JSON.stringify(aAggregation), oBinding = this.bindList("/EMPLOYEES"), oTransformedAggregation = {
        aggregate: {
            GrossAmountInTransactionCurrency: {}
        },
        group: {
            BillToParty: {},
            TransactionCurrency: {},
            UnitProperty: {}
        },
        search: "covfefe"
    };
    oBinding.mParameters.$$aggregation = { search: "covfefe" };
    this.mock(oBinding).expects("setAggregation").withExactArgs(oTransformedAggregation);
    assert.strictEqual(oBinding.updateAnalyticalInfo(aAggregation), undefined);
    assert.strictEqual(JSON.stringify(aAggregation), sAggregation, "unchanged");
    this.mock(this.oModel).expects("bindingDestroyed").withExactArgs(sinon.match.same(oBinding));
    this.mock(ListBinding.prototype).expects("destroy").on(oBinding).withExactArgs();
    oBinding.destroy();
    oBinding.destroy();
});
[{
        aAggregation: [{
                min: true,
                name: "GrossAmount",
                total: false
            }, {
                grouped: false,
                name: "Currency",
                visible: true
            }],
        oTransformedAggregation: {
            aggregate: {
                GrossAmount: { min: true }
            },
            group: {
                Currency: {}
            },
            search: undefined
        }
    }, {
        aAggregation: [{
                max: true,
                name: "GrossAmount",
                total: false
            }, {
                grouped: false,
                name: "Currency",
                visible: true
            }],
        oTransformedAggregation: {
            aggregate: {
                GrossAmount: { max: true }
            },
            group: {
                Currency: {}
            },
            search: undefined
        }
    }, {
        aAggregation: [{
                as: "AvgSalesAmount",
                max: true,
                min: true,
                name: "SalesAmount",
                total: false,
                "with": "average"
            }],
        oTransformedAggregation: {
            aggregate: {
                AvgSalesAmount: {
                    max: true,
                    min: true,
                    name: "SalesAmount",
                    "with": "average"
                }
            },
            group: {},
            search: undefined
        }
    }].forEach(function (oFixture, i) {
    [false, true].forEach(function (bHasMeasureRangePromiseAfterResume) {
        var sTitle = "updateAnalyticalInfo: min/max: " + i + ", has measure range promise after resume: " + bHasMeasureRangePromiseAfterResume;
        QUnit.test(sTitle, function (assert) {
            var sAggregation = JSON.stringify(oFixture.aAggregation), oBinding = this.bindList("/EMPLOYEES"), mMeasureRange = {}, oNewCache = { getMeasureRangePromise: function () { } }, oResult, oSetAggregationExpectation;
            oSetAggregationExpectation = this.mock(oBinding).expects("setAggregation").withExactArgs(oFixture.oTransformedAggregation).callsFake(function () {
                assert.strictEqual(oBinding.bHasAnalyticalInfo, true);
            });
            this.mock(oBinding).expects("getRootBindingResumePromise").withExactArgs().callsFake(function () {
                assert.ok(oSetAggregationExpectation.called, "setAggregation called before");
                oBinding.oCache = oNewCache;
                oBinding.oCachePromise = SyncPromise.resolve(oNewCache);
                return SyncPromise.resolve();
            });
            this.mock(oNewCache).expects("getMeasureRangePromise").withExactArgs().returns(bHasMeasureRangePromiseAfterResume ? Promise.resolve(mMeasureRange) : undefined);
            oResult = oBinding.updateAnalyticalInfo(oFixture.aAggregation);
            assert.strictEqual(JSON.stringify(oFixture.aAggregation), sAggregation, "unchanged");
            assert.ok(oResult.measureRangePromise instanceof Promise);
            return oResult.measureRangePromise.then(function (mMeasureRange0) {
                assert.strictEqual(mMeasureRange0, bHasMeasureRangePromiseAfterResume ? mMeasureRange : undefined);
            });
        });
    });
});
[false, true].forEach(function (bSameCache) {
    QUnit.test("refreshSingle: bSameCache=" + bSameCache, function (assert) {
        var oBinding = this.bindList("/EMPLOYEES"), oCache = {
            refreshSingle: function () { }
        }, bContextUpdated = false, oContext, bDependentsRefreshed = false, oGroupLock = {
            getGroupId: function () { },
            unlock: function () { }
        }, oPromise, oRefreshDependentsPromise = new SyncPromise(function (resolve) {
            setTimeout(function () {
                bDependentsRefreshed = true;
                resolve();
            });
        }), oRefreshSingleExpectation, oRefreshSinglePromise = SyncPromise.resolve(Promise.resolve({})), oRootBinding = {
            assertSameCache: function () { },
            getGroupId: function () { }
        }, that = this;
        oBinding.createContexts(0, createData(3, 0, true, 3));
        oContext = oBinding.aContexts[2];
        oBinding.oCache = oCache;
        oBinding.oCachePromise = SyncPromise.resolve(oCache);
        this.mock(oBinding).expects("withCache").withExactArgs(sinon.match.func).callsArgWith(0, oCache, "path/in/cache", oRootBinding);
        this.mock(oContext).expects("getPath").withExactArgs().returns("/EMPLOYEES('2')");
        this.mock(oContext).expects("isKeepAlive").withExactArgs().returns("~keep~alive~");
        this.mock(oBinding.oHeaderContext).expects("getPath").withExactArgs().returns("/EMPLOYEES");
        this.mock(_Helper).expects("getRelativePath").withExactArgs("/EMPLOYEES('2')", "/EMPLOYEES").returns("~key~predicate~");
        this.mock(oContext).expects("getModelIndex").withExactArgs().returns(42);
        oRefreshSingleExpectation = this.mock(oCache).expects("refreshSingle").withExactArgs(sinon.match.same(oGroupLock), "path/in/cache", 42, "~key~predicate~", "~keep~alive~", sinon.match.func).returns(oRefreshSinglePromise);
        this.mock(oGroupLock).expects("getGroupId").withExactArgs().returns("groupId");
        this.mock(oContext).expects("refreshDependentBindings").withExactArgs("EMPLOYEES('2')", "groupId").returns(oRefreshDependentsPromise);
        oRefreshSinglePromise.then(function () {
            var oCanceledError = new Error();
            that.mock(oBinding).expects("fireDataReceived").withExactArgs({ data: {} });
            that.mock(oRootBinding).expects("assertSameCache").withExactArgs(sinon.match.same(oCache)).callsFake(function () {
                if (!bSameCache) {
                    oCanceledError.canceled = true;
                    throw oCanceledError;
                }
            });
            that.mock(oContext).expects("checkUpdate").exactly(bSameCache ? 1 : 0).withExactArgs().returns(new SyncPromise(function (resolve) {
                setTimeout(function () {
                    bContextUpdated = true;
                    resolve();
                });
            }));
            that.mock(oGroupLock).expects("unlock").exactly(bSameCache ? 0 : 1).withExactArgs(true);
            that.mock(oBinding.oModel).expects("reportError").exactly(bSameCache ? 0 : 1).withExactArgs("Failed to refresh entity: " + oContext, sClassName, sinon.match.same(oCanceledError));
        });
        oPromise = oBinding.refreshSingle(oContext, oGroupLock);
        assert.strictEqual(oPromise.isFulfilled(), false);
        this.mock(oBinding).expects("fireDataRequested").withExactArgs();
        oRefreshSingleExpectation.firstCall.args[5]();
        return oPromise.then(function () {
            assert.strictEqual(bContextUpdated, bSameCache);
            assert.strictEqual(bDependentsRefreshed, true);
        });
    });
});
[true, false].forEach(function (bOnRemoveCalled) {
    [true, false].forEach(function (bCreated) {
        var sTitle = "refreshSingle with allow remove: " + bOnRemoveCalled + ", created: " + bCreated;
        QUnit.test(sTitle, function (assert) {
            var oBinding = this.bindList("/EMPLOYEES"), oCache = {
                refreshSingleWithRemove: function () { }
            }, oCacheRequestPromise, oContext, oContextMock, bContextUpdated = false, bDependentsRefreshed = false, oExpectation, oGroupLock = { getGroupId: function () { } }, iIndex = bCreated ? 1 : 3, oRefreshDependentsPromise = new SyncPromise(function (resolve) {
                setTimeout(function () {
                    bDependentsRefreshed = true;
                    resolve();
                });
            }), oRootBinding = {
                assertSameCache: function () { },
                getGroupId: function () { }
            }, that = this;
            oBinding.createContexts(0, createData(3, 0, true, 3, true));
            oBinding.createContexts(4, createData(2, 4, true, 6, true));
            assert.strictEqual(oBinding.iMaxLength, 6);
            oBinding.aContexts.unshift(Context.create(this.oModel, oBinding, "/EMPLOYEES($uid=id-1-24)", -2, SyncPromise.resolve(Promise.resolve())), Context.create(this.oModel, oBinding, "/EMPLOYEES($uid=id-1-23)", -1, SyncPromise.resolve(Promise.resolve())));
            oBinding.iCreatedContexts = 2;
            oContext = oBinding.aContexts[iIndex];
            oContextMock = this.mock(oContext);
            oBinding.oCache = oCache;
            oBinding.oCachePromise = SyncPromise.resolve(oCache);
            oCacheRequestPromise = SyncPromise.resolve(Promise.resolve().then(function () {
                if (bOnRemoveCalled) {
                    oContextMock.expects("getModelIndex").withExactArgs().callThrough();
                    that.mock(oBinding).expects("destroyCreated").exactly(bCreated ? 1 : 0).withExactArgs(sinon.match.same(oContext));
                    oContextMock.expects("destroy").exactly(bCreated ? 0 : 1).withExactArgs();
                    that.mock(oBinding).expects("_fireChange").withExactArgs({ reason: ChangeReason.Remove });
                    that.mock(that.oModel).expects("getDependentBindings").never();
                    oExpectation.firstCall.args[6](false);
                    if (!bCreated) {
                        assert.strictEqual(oBinding.aContexts.length, 7);
                        assert.notOk(4 in oBinding.aContexts);
                        assert.strictEqual(oBinding.aContexts[0].iIndex, -2);
                        assert.strictEqual(oBinding.aContexts[1].iIndex, -1);
                        assert.strictEqual(oBinding.aContexts[2].iIndex, 0);
                        assert.strictEqual(oBinding.aContexts[3].iIndex, 1);
                        assert.strictEqual(oBinding.aContexts[5].iIndex, 3);
                        assert.strictEqual(oBinding.aContexts[6].iIndex, 4);
                        assert.strictEqual(oBinding.iCreatedContexts, 2);
                        assert.strictEqual(oBinding.iMaxLength, 5);
                    }
                }
                else {
                    that.mock(oGroupLock).expects("getGroupId").returns("resultingGroupId");
                    oContextMock.expects("refreshDependentBindings").withExactArgs("EMPLOYEES('2')", "resultingGroupId").returns(oRefreshDependentsPromise);
                }
            }));
            oContextMock.expects("getPath").returns("/EMPLOYEES('2')");
            this.mock(oBinding).expects("withCache").withExactArgs(sinon.match.func).callsArgWith(0, oCache, "path/in/cache", oRootBinding);
            oContextMock.expects("getModelIndex").withExactArgs().returns(42);
            this.mock(oBinding.oHeaderContext).expects("getPath").withExactArgs().returns("/EMPLOYEES");
            this.mock(_Helper).expects("getRelativePath").withExactArgs("/EMPLOYEES('2')", "/EMPLOYEES").returns("~key~predicate~");
            oExpectation = this.mock(oCache).expects("refreshSingleWithRemove").withExactArgs(sinon.match.same(oGroupLock), "path/in/cache", 42, "~key~predicate~", false, sinon.match.func, sinon.match.func).callsArg(5).returns(oCacheRequestPromise);
            this.mock(oBinding).expects("fireDataRequested").withExactArgs();
            this.mock(oBinding).expects("fireDataReceived").withExactArgs({ data: {} });
            oContextMock.expects("checkUpdate").exactly(bOnRemoveCalled ? 0 : 1).withExactArgs().returns(new SyncPromise(function (resolve) {
                setTimeout(function () {
                    bContextUpdated = true;
                    resolve();
                });
            }));
            return oBinding.refreshSingle(oContext, oGroupLock, true).then(function () {
                assert.strictEqual(bContextUpdated, !bOnRemoveCalled);
                assert.strictEqual(bDependentsRefreshed, !bOnRemoveCalled);
            });
        });
    });
});
[
    { index: undefined, stillAlive: false },
    { index: 1, stillAlive: false },
    { index: 1, stillAlive: true }
].forEach(function (oFixture) {
    var sTitle = "refreshSingle with allow remove on a kept-alive context, index = " + oFixture.index + ", stillAlive = " + oFixture.stillAlive;
    QUnit.test(sTitle, function (assert) {
        var oBinding = this.bindList("/EMPLOYEES"), oCache = {
            refreshSingleWithRemove: function () { }
        }, oCacheRequestPromise, oContext = {
            checkUpdate: function () { },
            created: function () { return false; },
            destroy: function () { },
            getModelIndex: function () { return oFixture.index; },
            getPath: function () { return "~context~path~"; },
            isKeepAlive: function () { return true; },
            refreshDependentBindings: function () { }
        }, oExpectation, oGroupLock = { getGroupId: function () { } }, oRootBinding = {
            assertSameCache: function () { },
            getGroupId: function () { }
        }, that = this;
        oBinding.oCache = oCache;
        oBinding.oCachePromise = SyncPromise.resolve(oCache);
        oBinding.aContexts = [{}];
        if (oFixture.index) {
            oBinding.aContexts[oFixture.index] = oContext;
        }
        else {
            oBinding.mPreviousContextsByPath = { "~context~path~": oContext };
        }
        oBinding.iMaxLength = 42;
        oCacheRequestPromise = SyncPromise.resolve(Promise.resolve()).then(function () {
            that.mock(oContext).expects("destroy").exactly(oFixture.stillAlive ? 0 : 1).withExactArgs();
            that.mock(oBinding).expects("_fireChange").exactly(oFixture.index ? 1 : 0).withExactArgs({ reason: ChangeReason.Remove });
            oExpectation.firstCall.args[6](oFixture.stillAlive);
            assert.strictEqual(oBinding.aContexts.length, 1);
            assert.notOk(1 in oBinding.aContexts);
            assert.strictEqual(oBinding.iMaxLength, oFixture.index ? 41 : 42);
            if (oFixture.stillAlive) {
                assert.strictEqual(oBinding.mPreviousContextsByPath["~context~path~"], oContext);
            }
            else {
                assert.notOk("~context~path~" in oBinding.mPreviousContextsByPath);
            }
        });
        this.mock(oBinding).expects("withCache").withExactArgs(sinon.match.func).callsArgWith(0, oCache, "path/in/cache", oRootBinding);
        this.mock(oBinding.oHeaderContext).expects("getPath").withExactArgs().returns("~header~context~path~");
        this.mock(_Helper).expects("getRelativePath").withExactArgs("~context~path~", "~header~context~path~").returns("~key~predicate~");
        oExpectation = this.mock(oCache).expects("refreshSingleWithRemove").withExactArgs(sinon.match.same(oGroupLock), "path/in/cache", oFixture.index, "~key~predicate~", true, sinon.match.func, sinon.match.func).callsArg(5).returns(oCacheRequestPromise);
        this.mock(oBinding).expects("fireDataRequested").withExactArgs();
        this.mock(oBinding).expects("fireDataReceived").withExactArgs({ data: {} });
        this.mock(oContext).expects("checkUpdate").exactly(oFixture.stillAlive ? 1 : 0).withExactArgs().resolves();
        this.mock(oGroupLock).expects("getGroupId").exactly(oFixture.stillAlive ? 1 : 0).withExactArgs().returns("groupId");
        this.mock(oContext).expects("refreshDependentBindings").exactly(oFixture.stillAlive ? 1 : 0).withExactArgs("context~path~", "groupId").resolves();
        return oBinding.refreshSingle(oContext, oGroupLock, true);
    });
});
QUnit.test("refreshSingle, no fireDataReceived if no fireDataRequested", function () {
    var oBinding = this.bindList("/EMPLOYEES"), oCache = {
        refreshSingle: function () { }
    }, oContext, oGroupLock = { getGroupId: function () { } };
    oBinding.createContexts(0, createData(3, 0, true, 3));
    oContext = oBinding.aContexts[2];
    oBinding.oCache = oCache;
    oBinding.oCachePromise = SyncPromise.resolve(oCache);
    this.mock(oBinding).expects("fireDataRequested").never();
    this.mock(oBinding).expects("fireDataReceived").never();
    this.mock(oContext).expects("getPath").withExactArgs().returns("/EMPLOYEES('2')");
    this.mock(oContext).expects("getModelIndex").withExactArgs().returns(42);
    this.mock(oContext).expects("isKeepAlive").withExactArgs().returns("~keep~alive~");
    this.mock(oBinding.oHeaderContext).expects("getPath").withExactArgs().returns("/EMPLOYEES");
    this.mock(_Helper).expects("getRelativePath").withExactArgs("/EMPLOYEES('2')", "/EMPLOYEES").returns("~key~predicate~");
    this.mock(oCache).expects("refreshSingle").withExactArgs(sinon.match.same(oGroupLock), "", 42, "~key~predicate~", "~keep~alive~", sinon.match.func).returns(SyncPromise.resolve({}));
    this.mock(oGroupLock).expects("getGroupId").withExactArgs().returns("groupId");
    oBinding.refreshSingle(oContext, oGroupLock);
});
[true, false].forEach(function (bDataRequested) {
    QUnit.test("refreshSingle, error handling: dataRequested already fired: " + bDataRequested, function (assert) {
        var oBinding = this.bindList("/EMPLOYEES"), oCache = { refreshSingle: function () { } }, oContext = {
            getModelIndex: function () { },
            getPath: function () { return "/EMPLOYEES('1')"; },
            isKeepAlive: function () { return "~keep~alive~"; },
            refreshDependentBindings: function () { },
            toString: function () { return "Foo"; }
        }, oError = new Error(), oExpectation, oGroupLock = {
            getGroupId: function () { },
            unlock: function () { }
        };
        oBinding.oCache = oCache;
        oBinding.oCachePromise = SyncPromise.resolve(oCache);
        this.mock(oBinding.oHeaderContext).expects("getPath").withExactArgs().returns("/EMPLOYEES");
        this.mock(_Helper).expects("getRelativePath").withExactArgs("/EMPLOYEES('1')", "/EMPLOYEES").returns("~key~predicate~");
        this.mock(oContext).expects("getModelIndex").withExactArgs().returns(42);
        oExpectation = this.mock(oCache).expects("refreshSingle").withExactArgs(sinon.match.same(oGroupLock), "", 42, "~key~predicate~", "~keep~alive~", sinon.match.func).returns(Promise.reject(oError));
        if (bDataRequested) {
            oExpectation.callsArg(5);
        }
        this.mock(oGroupLock).expects("getGroupId").withExactArgs().returns("groupId");
        this.mock(oContext).expects("refreshDependentBindings").withExactArgs("EMPLOYEES('1')", "groupId").resolves();
        this.mock(oBinding).expects("fireDataRequested").exactly(bDataRequested ? 1 : 0).withExactArgs();
        this.mock(oBinding).expects("fireDataReceived").exactly(bDataRequested ? 1 : 0).withExactArgs(bDataRequested ? { error: oError } : 0);
        this.mock(oGroupLock).expects("unlock").withExactArgs(true);
        this.mock(this.oModel).expects("reportError").withExactArgs("Failed to refresh entity: Foo", sClassName, sinon.match.same(oError));
        return oBinding.refreshSingle(oContext, oGroupLock).then(function () {
            assert.ok(false);
        }, function (oError0) {
            assert.strictEqual(oError0, oError);
        });
    });
});
QUnit.test("refreshSingle: forbidden header context", function (assert) {
    var oBinding = this.bindList("/EMPLOYEES"), oHeaderContext = oBinding.getHeaderContext();
    assert.throws(function () {
        oBinding.refreshSingle(oHeaderContext);
    }, new Error("Unsupported header context: " + oHeaderContext));
});
[false, true].forEach(function (bInitial) {
    QUnit.test("resumeInternal: initial=" + bInitial, function (assert) {
        var sChangeReason = {}, oContext = Context.create(this.oModel, oParentBinding, "/TEAMS"), oBinding = this.bindList("TEAM_2_EMPLOYEES", oContext), oBindingMock = this.mock(oBinding), oDependent0 = { resumeInternal: function () { } }, oDependent1 = { resumeInternal: function () { } }, oFetchCacheExpectation, oFireExpectation, oGetDependentBindingsExpectation, oHeaderContextCheckUpdateExpectation, oResetExpectation;
        oBinding.sChangeReason = bInitial ? "AddVirtualContext" : undefined;
        oBinding.sResumeChangeReason = sChangeReason;
        oBindingMock.expects("removeCachesAndMessages").withExactArgs("");
        oResetExpectation = oBindingMock.expects("reset").withExactArgs();
        oFetchCacheExpectation = oBindingMock.expects("fetchCache").withExactArgs(sinon.match.same(oContext), true);
        oGetDependentBindingsExpectation = oBindingMock.expects("getDependentBindings").withExactArgs().returns([oDependent0, oDependent1]);
        this.mock(oDependent0).expects("resumeInternal").withExactArgs(false, true);
        this.mock(oDependent1).expects("resumeInternal").withExactArgs(false, true);
        if (bInitial) {
            oFireExpectation = oBindingMock.expects("_fireChange").withExactArgs({
                detailedReason: "AddVirtualContext",
                reason: sinon.match.same(sChangeReason)
            });
        }
        else {
            oFireExpectation = oBindingMock.expects("_fireRefresh").withExactArgs({ reason: sinon.match.same(sChangeReason) });
        }
        oHeaderContextCheckUpdateExpectation = this.mock(oBinding.oHeaderContext).expects("checkUpdate").withExactArgs();
        oBinding.resumeInternal(true);
        assert.strictEqual(oBinding.sResumeChangeReason, undefined);
        assert.ok(oResetExpectation.calledAfter(oGetDependentBindingsExpectation));
        assert.ok(oFetchCacheExpectation.calledAfter(oResetExpectation));
        assert.ok(oFireExpectation.calledAfter(oFetchCacheExpectation));
        assert.ok(oHeaderContextCheckUpdateExpectation.calledAfter(oFireExpectation));
    });
});
[false, true].forEach(function (bAutoExpandSelect) {
    var sTitle = "resumeInternal: initial binding, bAutoExpandSelect = " + bAutoExpandSelect;
    QUnit.test(sTitle, function (assert) {
        var oBinding = this.bindList("/EMPLOYEES"), oBindingMock = this.mock(oBinding), sResumeChangeReason = {};
        oBinding.sResumeChangeReason = sResumeChangeReason;
        if (bAutoExpandSelect) {
            oBinding.sChangeReason = "AddVirtualContext";
            oBindingMock.expects("_fireChange").withExactArgs({
                detailedReason: "AddVirtualContext",
                reason: sResumeChangeReason
            });
        }
        else {
            oBindingMock.expects("_fireRefresh").withExactArgs({ reason: sResumeChangeReason });
        }
        oBinding.resumeInternal();
        assert.strictEqual(oBinding.sResumeChangeReason, undefined);
    });
});
QUnit.test("resumeInternal: no sResumeChangeReason", function () {
    var oBinding = this.bindList("/EMPLOYEES"), oDependent0 = { resumeInternal: function () { } }, oDependent1 = { resumeInternal: function () { } };
    oBinding.sResumeChangeReason = undefined;
    this.mock(oBinding).expects("removeCachesAndMessages").never();
    this.mock(oBinding).expects("reset").never();
    this.mock(oBinding).expects("fetchCache").never();
    this.mock(oBinding).expects("getDependentBindings").withExactArgs().returns([oDependent0, oDependent1]);
    this.mock(oDependent0).expects("resumeInternal").withExactArgs(true, false);
    this.mock(oDependent1).expects("resumeInternal").withExactArgs(true, false);
    this.mock(oBinding).expects("_fireRefresh").never();
    oBinding.resumeInternal(true);
});
QUnit.test("resumeInternal: no sResumeChangeReason but parent has", function () {
    var oContext = {}, oBinding = this.bindList("/EMPLOYEES", oContext);
    oBinding.sResumeChangeReason = undefined;
    this.mock(oBinding).expects("removeCachesAndMessages").withExactArgs("");
    this.mock(oBinding).expects("reset").withExactArgs();
    this.mock(oBinding).expects("fetchCache").withExactArgs(sinon.match.same(oContext), false);
    this.mock(oBinding).expects("_fireRefresh").never();
    oBinding.resumeInternal(true, true);
});
QUnit.test("resumeInternal: suspend in change event of resume", function (assert) {
    var oBinding = this.bindList("/EMPLOYEES");
    oBinding.sResumeChangeReason = ChangeReason.Filter;
    this.mock(oBinding).expects("_fireRefresh").withExactArgs({ reason: ChangeReason.Filter }).callsFake(function () {
        oBinding.sResumeChangeReason = ChangeReason.Sort;
    });
    oBinding.resumeInternal(true);
    assert.strictEqual(oBinding.sResumeChangeReason, ChangeReason.Sort);
});
QUnit.test("getDependentBindings", function (assert) {
    var oActiveBinding = {
        oContext: {
            getPath: function () { return "/FOO('1')/active"; },
            isKeepAlive: function () { return false; }
        }
    }, oBinding = this.oModel.bindList("/FOO"), oInactiveBinding = {
        oContext: {
            getPath: function () { return "/FOO('1')/inactive"; },
            isKeepAlive: function () { return false; }
        }
    }, oKeptBinding = {
        oContext: {
            getPath: function () { return "/kept"; },
            isKeepAlive: function () { return true; }
        }
    }, aDependentBindings = [oActiveBinding, oInactiveBinding, oKeptBinding];
    oBinding.mPreviousContextsByPath["/FOO('1')/inactive"] = {};
    oBinding.mPreviousContextsByPath["kept"] = {};
    this.mock(this.oModel).expects("getDependentBindings").withExactArgs(sinon.match.same(oBinding)).returns(aDependentBindings);
    assert.deepEqual(oBinding.getDependentBindings(), [oActiveBinding, oKeptBinding]);
});
[true, false].forEach(function (bWithStaticFilter) {
    QUnit.test("getFilterInfo with static filter: " + bWithStaticFilter, function (assert) {
        var aApplicationFilter = [new Filter("AmountIn%E2%82%AC", FilterOperator.GT, "1000")], oAST = {}, oBinding = this.bindList("/Set"), oCombinedFilter = {
            getAST: function () { }
        }, aControlFilter = [new Filter("AmountIn%E2%82%AC", FilterOperator.GT, "1000")], oExpectedFilterInfo = {
            left: {},
            op: "&&",
            right: {
                expression: "someFilterExpression",
                syntax: "OData 4.0",
                type: "Custom"
            },
            type: "Logical"
        }, bIncludeOrigin = {}, oResultAST;
        oBinding.aApplicationFilters = aApplicationFilter;
        oBinding.aFilters = aControlFilter;
        if (bWithStaticFilter) {
            oBinding.mQueryOptions.$filter = "someFilterExpression";
        }
        this.mock(FilterProcessor).expects("combineFilters").withExactArgs(sinon.match.same(aControlFilter), sinon.match.same(aApplicationFilter)).returns(oCombinedFilter);
        this.mock(oCombinedFilter).expects("getAST").withExactArgs(sinon.match.same(bIncludeOrigin)).returns(oAST);
        oResultAST = oBinding.getFilterInfo(bIncludeOrigin);
        if (bWithStaticFilter) {
            assert.deepEqual(oResultAST, oExpectedFilterInfo);
        }
        else {
            assert.strictEqual(oResultAST, oAST);
        }
    });
});
QUnit.test("getFilterInfo: no filters", function (assert) {
    var aApplicationFilter = [], oBinding = this.bindList("/Set"), aControlFilter = [], bIncludeOrigin = {};
    oBinding.aApplicationFilters = aApplicationFilter;
    oBinding.aFilters = aControlFilter;
    this.mock(FilterProcessor).expects("combineFilters").withExactArgs(sinon.match.same(aControlFilter), sinon.match.same(aApplicationFilter)).returns(undefined);
    assert.strictEqual(oBinding.getFilterInfo(bIncludeOrigin), null);
});
QUnit.test("getFilterInfo: with only static filter", function (assert) {
    var aApplicationFilter = [], oBinding = this.bindList("/Set"), aControlFilter = [], sODataVersion = "foo", oExpectedFilterInfo = {
        expression: "someFilterExpression",
        syntax: "OData " + sODataVersion,
        type: "Custom"
    }, bIncludeOrigin = {};
    oBinding.aApplicationFilters = aApplicationFilter;
    oBinding.aFilters = aControlFilter;
    oBinding.mQueryOptions.$filter = "someFilterExpression";
    this.mock(FilterProcessor).expects("combineFilters").withExactArgs(sinon.match.same(aControlFilter), sinon.match.same(aApplicationFilter)).returns(undefined);
    this.mock(this.oModel).expects("getODataVersion").returns(sODataVersion);
    assert.deepEqual(oBinding.getFilterInfo(bIncludeOrigin), oExpectedFilterInfo);
});
[false, true].forEach(function (bHeader) {
    QUnit.test("requestSideEffects: refresh needed, refresh fails, " + bHeader, function (assert) {
        var oCacheMock = this.getCacheMock(), oBinding = this.bindList("/Set"), oContext = bHeader ? oBinding.getHeaderContext() : undefined, oError = new Error(), sGroupId = "group";
        oBinding.iCurrentEnd = 42;
        this.mock(oBinding).expects("lockGroup").never();
        oCacheMock.expects("requestSideEffects").never();
        this.mock(oBinding).expects("refreshInternal").withExactArgs("", sGroupId, false, true).rejects(oError);
        return oBinding.requestSideEffects(sGroupId, ["n/a", ""], oContext).then(function () {
            assert.ok(false);
        }, function (oError0) {
            assert.strictEqual(oError0, oError);
        });
    });
});
QUnit.test("requestSideEffects: refreshSingle needed, refreshSingle fails", function (assert) {
    var oCacheMock = this.getCacheMock(), oContext = {}, oBinding = this.bindList("/Set"), oError = new Error(), sGroupId = "group", oGroupLock = {};
    this.mock(oBinding).expects("lockGroup").withExactArgs(sGroupId).returns(oGroupLock);
    oCacheMock.expects("requestSideEffects").never();
    this.mock(oBinding).expects("refreshSingle").withExactArgs(sinon.match.same(oContext), sinon.match.same(oGroupLock), false).rejects(oError);
    return oBinding.requestSideEffects(sGroupId, ["n/a", ""], oContext).then(function () {
        assert.ok(false);
    }, function (oError0) {
        assert.strictEqual(oError0, oError);
    });
});
QUnit.test("requestSideEffects: call refreshInternal for relative binding", function (assert) {
    var oBinding = this.bindList("relative", this.oModel.createBindingContext("/")), oContext = oBinding.getHeaderContext(), oResult = {};
    oBinding.iCurrentEnd = 42;
    this.mock(oBinding).expects("refreshSingle").never();
    this.mock(oBinding).expects("refreshInternal").withExactArgs("", "group", false, true).resolves(oResult);
    return oBinding.requestSideEffects("group", [""], oContext).then(function (oResult0) {
        assert.strictEqual(oResult0, oResult);
    });
});
QUnit.test("requestSideEffects: call refreshSingle for relative binding", function (assert) {
    var oBinding = this.bindList("relative", this.oModel.createBindingContext("/")), oContext = Context.create(this.oModel, {}, "/EMPLOYEES('42')"), oGroupLock = {}, oResult = {};
    this.mock(oBinding).expects("lockGroup").withExactArgs("group").returns(oGroupLock);
    this.mock(oBinding).expects("refreshSingle").withExactArgs(sinon.match.same(oContext), sinon.match.same(oGroupLock), false).resolves(oResult);
    this.mock(oBinding).expects("refreshInternal").never();
    return oBinding.requestSideEffects("group", [""], oContext).then(function (oResult0) {
        assert.strictEqual(oResult0, oResult);
    });
});
[false, true].forEach(function (bHeader) {
    [false, true].forEach(function (bRecursionRejects) {
        [false, true].forEach(function (bHasCache) {
            var sTitle = "requestSideEffects: efficient request possible, header=" + bHeader + ", reject=" + bRecursionRejects + ", has cache=" + bHasCache;
            QUnit.test(sTitle, function (assert) {
                var oCacheMock = this.getCacheMock(), oBinding = this.bindList("/Set"), oCanceledError = new Error(), oContext = bHeader ? oBinding.getHeaderContext() : { getPath: function () { return "/Set('foo')"; } }, oError = new Error(), sGroupId = "group", oGroupLock = {}, oModelMock = this.mock(this.oModel), oPreviousContext6, oPreviousContext7, oPreviousContext8, aPaths = ["A"], oPromise = SyncPromise.resolve(), oResult, that = this;
                function expectVisitAndRefresh(vNavigationPropertyPaths, aPromises) {
                    that.mock(oBinding).expects("visitSideEffects").withExactArgs(sGroupId, sinon.match.same(aPaths), bHeader ? undefined : sinon.match.same(oContext), vNavigationPropertyPaths, aPromises).callsFake(function (_sGroupId, _aPaths, _oContext, _mNavigationPropertyPaths, aPromises) {
                        aPromises.push(Promise.resolve());
                        aPromises.push(Promise.reject(oCanceledError));
                        if (bRecursionRejects) {
                            aPromises.push(Promise.reject(oError));
                        }
                    });
                    that.mock(oBinding).expects("refreshDependentListBindingsWithoutCache").exactly(bRecursionRejects ? 0 : 1).withExactArgs().resolves("~");
                }
                oCanceledError.canceled = true;
                oBinding.createContexts(3, createData(9, 3, true, 9, true));
                oBinding.iCurrentBegin = 3;
                oBinding.iCurrentEnd = 5;
                oBinding.mPreviousContextsByPath["('6')"] = oPreviousContext6 = oBinding.aContexts[6];
                oBinding.mPreviousContextsByPath["('7')"] = oPreviousContext7 = oBinding.aContexts[7];
                oBinding.mPreviousContextsByPath["('8')"] = oPreviousContext8 = oBinding.aContexts[8];
                oBinding.aContexts.length = 5;
                this.mock(oBinding).expects("lockGroup").exactly(bHasCache ? 1 : 0).withExactArgs(sGroupId).returns(oGroupLock);
                this.mock(oPreviousContext6).expects("isKeepAlive").exactly(bHeader ? 1 : 0).returns(true);
                this.mock(oPreviousContext7).expects("isKeepAlive").exactly(bHeader ? 1 : 0).returns(false);
                this.mock(oPreviousContext8).expects("isKeepAlive").exactly(bHeader ? 1 : 0).returns(true);
                oCacheMock.expects("requestSideEffects").exactly(bHasCache ? 1 : 0).withExactArgs(sinon.match.same(oGroupLock), sinon.match.same(aPaths), {}, bHeader ? ["('3')", "('4')", "('6')", "('8')"] : ["('foo')"], !bHeader).callsFake(function (_oGroupLock, _aPaths, mNavigationPropertyPaths) {
                    expectVisitAndRefresh(sinon.match.same(mNavigationPropertyPaths), [oPromise]);
                    return oPromise;
                });
                if (!bHasCache) {
                    oBinding.oCache = undefined;
                    expectVisitAndRefresh({}, []);
                }
                oModelMock.expects("reportError").withExactArgs("Failed to request side effects", sClassName, sinon.match.same(oCanceledError));
                oModelMock.expects("reportError").exactly(bRecursionRejects ? 1 : 0).withExactArgs("Failed to request side effects", sClassName, sinon.match.same(oError));
                this.mock(oBinding).expects("refreshInternal").never();
                oResult = oBinding.requestSideEffects(sGroupId, aPaths, oContext);
                assert.ok(oResult.isPending(), "instanceof SyncPromise");
                return oResult.then(function (vValue) {
                    assert.notOk(bRecursionRejects);
                    assert.strictEqual(vValue, "~", "refreshDependentListBindingsWithoutCache finished");
                }, function (oError0) {
                    assert.ok(bRecursionRejects);
                    assert.strictEqual(oError0, oError);
                });
            });
        });
    });
});
QUnit.test("requestSideEffects: transient context", function (assert) {
    var oCacheMock = this.getCacheMock(), oBinding = this.bindList("/Set"), sGroupId = "group", oGroupLock = {}, aPaths = ["A"], oPromise = SyncPromise.resolve(), that = this;
    oBinding.createContexts(0, createData(1, 0, true, 1, true));
    oBinding.aContexts.unshift({ isTransient: function () { } });
    oBinding.iCreatedContexts = 1;
    oBinding.iCurrentBegin = 0;
    oBinding.iCurrentEnd = 2;
    this.mock(oBinding).expects("lockGroup").withExactArgs(sGroupId).returns(oGroupLock);
    this.mock(oBinding.aContexts[0]).expects("isTransient").withExactArgs().returns(true);
    this.mock(oBinding.aContexts[1]).expects("isTransient").withExactArgs().returns(false);
    oCacheMock.expects("requestSideEffects").withExactArgs(sinon.match.same(oGroupLock), sinon.match.same(aPaths), {}, ["('0')"], undefined).callsFake(function (_oGroupLock, aPaths, mNavigationPropertyPaths) {
        that.mock(oBinding).expects("visitSideEffects").withExactArgs(sGroupId, sinon.match.same(aPaths), undefined, sinon.match.same(mNavigationPropertyPaths), [oPromise]);
        that.mock(oBinding).expects("refreshDependentListBindingsWithoutCache").withExactArgs().resolves("~");
        return oPromise;
    });
    this.mock(oBinding).expects("refreshInternal").never();
    return oBinding.requestSideEffects(sGroupId, aPaths).then(function (vValue) {
        assert.strictEqual(vValue, "~", "refreshDependentListBindingsWithoutCache finished");
    });
});
QUnit.test("requestSideEffects: fallback to refresh", function (assert) {
    var oCacheMock = this.getCacheMock(), oBinding = this.bindList("/Set"), oError = new Error(), sGroupId = "group", aPaths = ["A"];
    oBinding.createContexts(3, createData(8, 3, true));
    oBinding.iCurrentBegin = 3;
    oBinding.iCurrentEnd = 8;
    this.mock(oBinding).expects("lockGroup").never();
    oCacheMock.expects("requestSideEffects").never();
    this.mock(oBinding).expects("refreshInternal").withExactArgs("", sGroupId, false, true).rejects(oError);
    return oBinding.requestSideEffects(sGroupId, aPaths).then(function () {
        assert.ok(false);
    }, function (oError0) {
        assert.strictEqual(oError0, oError);
    });
});
QUnit.test("requestSideEffects: no data read => no refresh", function (assert) {
    var oCacheMock = this.getCacheMock(), oBinding = this.bindList("/Set");
    this.mock(oBinding).expects("lockGroup").never();
    oCacheMock.expects("requestSideEffects").never();
    this.mock(oBinding).expects("refreshInternal").never();
    assert.strictEqual(oBinding.requestSideEffects("group", ["n/a", ""]), SyncPromise.resolve());
});
[false, true].forEach(function (bRefresh) {
    [false, true].forEach(function (bHeaderContext) {
        var sTitle = "requestSideEffects: $$aggregation, refresh=" + bRefresh + ", headerContext=" + bHeaderContext;
        QUnit.test(sTitle, function (assert) {
            var oBinding = this.bindList("/Set", undefined, undefined, undefined, {
                $$aggregation: {}
            }), oContext = bHeaderContext ? oBinding.getHeaderContext() : undefined, aFilters = [], aPaths = [], oPromise, oRefreshPromise = {};
            this.mock(oBinding.oCache).expects("requestSideEffects").never();
            this.mock(oBinding.aFilters).expects("concat").withExactArgs(oBinding.aApplicationFilters).returns(aFilters);
            this.mock(_AggregationHelper).expects("isAffected").withExactArgs(sinon.match.same(oBinding.mParameters.$$aggregation), sinon.match.same(aFilters), sinon.match.same(aPaths)).returns(bRefresh);
            this.mock(oBinding).expects("refreshInternal").exactly(bRefresh ? 1 : 0).withExactArgs("", "group", false, true).returns(oRefreshPromise);
            oPromise = oBinding.requestSideEffects("group", aPaths, oContext);
            if (bRefresh) {
                assert.strictEqual(oPromise, oRefreshPromise);
            }
            else {
                assert.strictEqual(oPromise, SyncPromise.resolve());
            }
        });
    });
});
QUnit.test("requestSideEffects with $$aggregation and row context", function (assert) {
    var oBinding = this.bindList("/Set", undefined, undefined, undefined, {
        $$aggregation: {}
    });
    this.mock(oBinding.oCache).expects("requestSideEffects").never();
    this.mock(oBinding).expects("refreshInternal").never();
    this.mock(_AggregationHelper).expects("isAffected").never();
    assert.throws(function () {
        oBinding.requestSideEffects("group", [], {});
    }, new Error("Must not request side effects for a context of a binding with $$aggregation"));
});
QUnit.test("getQueryOptions: with system query options", function (assert) {
    var oBinding = this.bindList("/Set");
    assert.throws(function () {
        oBinding.getQueryOptions(true);
    }, new Error("Unsupported parameter value: bWithSystemQueryOptions: true"));
});
QUnit.test("getQueryOptions: without system query options", function (assert) {
    var oBinding = this.bindList("/Set", undefined, undefined, undefined, {
        $select: "a,b,c",
        custom: "query option"
    });
    assert.deepEqual(oBinding.getQueryOptions(), { custom: "query option" });
});
QUnit.test("getModelIndex", function (assert) {
    var oBinding = this.bindList("/Set"), oBindingMock = this.mock(oBinding);
    oBindingMock.expects("getLength").atLeast(0).withExactArgs().returns(10);
    assert.strictEqual(oBinding.getModelIndex(5), 5);
    assert.strictEqual(oBinding.getModelIndex(42), 42);
    oBinding.bLengthFinal = true;
    oBinding.iCreatedContexts = 1;
    assert.strictEqual(oBinding.getModelIndex(5), 5);
    assert.strictEqual(oBinding.getModelIndex(42), 42);
    oBinding.bCreatedAtEnd = true;
    assert.strictEqual(oBinding.getModelIndex(2), 3);
    assert.strictEqual(oBinding.getModelIndex(5), 6);
    assert.strictEqual(oBinding.getModelIndex(9), 0);
    oBinding.iCreatedContexts = 2;
    assert.strictEqual(oBinding.getModelIndex(2), 4);
    assert.strictEqual(oBinding.getModelIndex(5), 7);
    assert.strictEqual(oBinding.getModelIndex(8), 1);
    assert.strictEqual(oBinding.getModelIndex(9), 0);
    oBinding.iCreatedContexts = 0;
    assert.strictEqual(oBinding.getModelIndex(0), 0);
});
QUnit.test("attachCreateCompleted/detachCreateCompleted", function () {
    var oBinding = this.bindList("/Set"), oBindingMock = this.mock(oBinding), fnFunction = {}, oListener = {};
    oBindingMock.expects("attachEvent").withExactArgs("createCompleted", sinon.match.same(fnFunction), sinon.match.same(oListener));
    oBinding.attachCreateCompleted(fnFunction, oListener);
    oBindingMock.expects("detachEvent").withExactArgs("createCompleted", sinon.match.same(fnFunction), sinon.match.same(oListener));
    oBinding.detachCreateCompleted(fnFunction, oListener);
});
QUnit.test("attachCreateSent/detachCreateSent", function () {
    var oBinding = this.bindList("/Set"), oBindingMock = this.mock(oBinding), fnFunction = {}, oListener = {};
    oBindingMock.expects("attachEvent").withExactArgs("createSent", sinon.match.same(fnFunction), sinon.match.same(oListener));
    oBinding.attachCreateSent(fnFunction, oListener);
    oBindingMock.expects("detachEvent").withExactArgs("createSent", sinon.match.same(fnFunction), sinon.match.same(oListener));
    oBinding.detachCreateSent(fnFunction, oListener);
});
[false, true].forEach(function (bHasPath, i) {
    QUnit.test("adjustPredicate: single context #" + i, function (assert) {
        var oBinding = this.bindList("/SalesOrderList"), oContext = { adjustPredicate: function () { } }, oExpectation;
        oBinding.aPreviousData = bHasPath ? ["foo", "/SalesOrderList($uid=1)", "bar"] : ["foo", "bar"];
        oExpectation = this.mock(oContext).expects("adjustPredicate").withExactArgs("($uid=1)", "('42')", sinon.match.func);
        oBinding.adjustPredicate("($uid=1)", "('42')", oContext);
        oExpectation.args[0][2]("/SalesOrderList($uid=1)", "/SalesOrderList('42')");
        assert.deepEqual(oBinding.aPreviousData, bHasPath ? ["foo", "/SalesOrderList('42')", "bar"] : ["foo", "bar"]);
        assert.notOk(oBinding.aPreviousData.hasOwnProperty("-1"));
    });
});
[undefined, {}].forEach(function (mCacheQueryOptions, i) {
    QUnit.test("adjustPredicate # " + i, function (assert) {
        var oBinding = this.bindList("SO_2_SOITEM", Context.create({}, oParentBinding, "/SalesOrderList($uid=1)")), oContext1 = { adjustPredicate: function () { } }, oContext2 = { adjustPredicate: function () { } }, oExpectation1, oExpectation2;
        oBinding.aPreviousData = ["/SalesOrderList($uid=1)/SO_2_SOITEM($uid=2)"];
        oBinding.aContexts = [, , oContext1, oContext2];
        oBinding.mCacheQueryOptions = mCacheQueryOptions;
        this.mock(asODataParentBinding.prototype).expects("adjustPredicate").on(oBinding).withExactArgs("($uid=1)", "('42')");
        this.mock(oBinding).expects("fetchCache").exactly(mCacheQueryOptions ? 1 : 0).withExactArgs(sinon.match.same(oBinding.oContext), true);
        this.mock(oBinding.oHeaderContext).expects("adjustPredicate").withExactArgs("($uid=1)", "('42')");
        oExpectation1 = this.mock(oContext1).expects("adjustPredicate").withExactArgs("($uid=1)", "('42')", sinon.match.func);
        oExpectation2 = this.mock(oContext2).expects("adjustPredicate").withExactArgs("($uid=1)", "('42')", sinon.match.func);
        oBinding.adjustPredicate("($uid=1)", "('42')");
        oExpectation1.args[0][2]("/SalesOrderList($uid=1)/SO_2_SOITEM($uid=2)", "/SalesOrderList('42')/SO_2_SOITEM($uid=2)");
        oExpectation2.args[0][2]("/SalesOrderList($uid=1)/SO_2_SOITEM($uid=3)", "/SalesOrderList('42')/SO_2_SOITEM($uid=3)");
        assert.deepEqual(oBinding.aPreviousData, ["/SalesOrderList('42')/SO_2_SOITEM($uid=2)"]);
        assert.notOk(oBinding.aPreviousData.hasOwnProperty("-1"));
    });
});
[{}, null].forEach(function (oCache, i) {
    QUnit.test("hasPendingChangesForPath: calls super, #" + i, function (assert) {
        var oBinding = this.bindList("/EMPLOYEES"), sPath = {}, bResult = {};
        oBinding.oCache = oCache;
        this.mock(asODataParentBinding.prototype).expects("hasPendingChangesForPath").on(oBinding).withExactArgs(sinon.match.same(sPath)).returns(bResult);
        assert.strictEqual(oBinding.hasPendingChangesForPath(sPath), bResult);
    });
});
QUnit.test("hasPendingChangesForPath: iCreatedContexts", function (assert) {
    var oBinding = this.bindList("/EMPLOYEES");
    oBinding.oCache = undefined;
    oBinding.iCreatedContexts = 0;
    this.mock(asODataParentBinding.prototype).expects("hasPendingChangesForPath").never();
    assert.notOk(oBinding.hasPendingChangesForPath());
    oBinding.iCreatedContexts = 1;
    assert.ok(oBinding.hasPendingChangesForPath());
});
QUnit.test("doSetProperty: returns undefined", function (assert) {
    assert.strictEqual(this.bindList("/EMPLOYEES").doSetProperty(), undefined);
});
QUnit.test("fetchDownloadUrl", function (assert) {
    var oBinding = this.bindList("n/a"), oCache = {
        getDownloadUrl: function () { }
    }, oExpectation, oPromise = {};
    this.mock(oBinding).expects("isResolved").returns(true);
    oExpectation = this.mock(oBinding).expects("withCache").returns(oPromise);
    assert.strictEqual(oBinding.fetchDownloadUrl(), oPromise);
    this.mock(oCache).expects("getDownloadUrl").withExactArgs("~path~", sinon.match.same(this.oModel.mUriParameters)).returns("~url~");
    assert.strictEqual(oExpectation.args[0][0](oCache, "~path~"), "~url~");
});
QUnit.test("fetchDownloadUrl: unresolved", function (assert) {
    var oBinding = this.bindList("n/a");
    this.mock(oBinding).expects("isResolved").returns(false);
    assert.throws(function () {
        oBinding.fetchDownloadUrl();
    }, new Error("Binding is unresolved"));
});
[false, true].forEach(function (bSuccess) {
    QUnit.test("requestDownloadUrl: success=" + bSuccess, function (assert) {
        var oBinding = this.bindList("/EMPLOYEES"), oError = new Error(), oPromise;
        this.mock(oBinding).expects("fetchDownloadUrl").withExactArgs().returns(SyncPromise.resolve(bSuccess ? Promise.resolve("/service/resource?query") : Promise.reject(oError)));
        oPromise = oBinding.requestDownloadUrl();
        assert.ok(oPromise instanceof Promise);
        return oPromise.then(function (sResult) {
            assert.ok(bSuccess);
            assert.strictEqual(sResult, "/service/resource?query");
        }, function (oResult) {
            assert.notOk(bSuccess);
            assert.strictEqual(oResult, oError);
        });
    });
});
QUnit.test("getDownloadUrl: success", function (assert) {
    var oBinding = this.bindList("/EMPLOYEES");
    this.mock(oBinding).expects("fetchDownloadUrl").withExactArgs().returns(SyncPromise.resolve("/service/resource?query"));
    assert.strictEqual(oBinding.getDownloadUrl(), "/service/resource?query");
});
QUnit.test("getDownloadUrl: result pending", function (assert) {
    var oBinding = this.bindList("/EMPLOYEES"), oPromise = SyncPromise.resolve(Promise.resolve("/service/resource?query"));
    this.mock(oBinding).expects("fetchDownloadUrl").withExactArgs().returns(oPromise);
    assert.throws(function () {
        oBinding.getDownloadUrl();
    }, new Error("Result pending"));
    return oPromise;
});
QUnit.test("getDownloadUrl: error", function (assert) {
    var oBinding = this.bindList("/EMPLOYEES"), oError = new Error("Failure");
    this.mock(oBinding).expects("fetchDownloadUrl").withExactArgs().returns(SyncPromise.reject(oError));
    assert.throws(function () {
        oBinding.getDownloadUrl();
    }, oError);
});
QUnit.test("checkKeepAlive", function (assert) {
    var oBinding = this.bindList("/EMPLOYEES");
    oBinding.checkKeepAlive({});
    assert.throws(function () {
        oBinding.checkKeepAlive(oBinding.getHeaderContext());
    }, new Error("Unsupported header context " + oBinding.getHeaderContext()));
});
QUnit.test("checkKeepAlive: $$aggregation", function (assert) {
    var oBinding = this.bindList("/EMPLOYEES", undefined, undefined, undefined, { $$aggregation: {} });
    assert.throws(function () {
        oBinding.checkKeepAlive({});
    }, new Error("Unsupported $$aggregation at " + oBinding));
});
QUnit.test("checkKeepAlive: relative", function (assert) {
    var oBinding, oParentContext = Context.createNewContext({}, oParentBinding, "/TEAMS('1')");
    oBinding = this.bindList("TEAM_2_EMPLOYEES", oParentContext);
    assert.throws(function () {
        oBinding.checkKeepAlive({});
    }, new Error("Missing $$ownRequest at " + oBinding));
    oBinding = this.bindList("TEAM_2_EMPLOYEES", oParentContext, undefined, undefined, { $$ownRequest: true });
    oBinding.checkKeepAlive({});
});
[false, true].forEach(function (bSuccess) {
    [false, true].forEach(function (bDataRequested) {
        [0, 3].forEach(function (iCount) {
            var sTitle = "expand: success=" + bSuccess + ", data requested=" + bDataRequested + ", count=" + iCount;
            if (!bSuccess && !iCount) {
                return;
            }
            QUnit.test(sTitle, function (assert) {
                var oBinding = this.bindList("/EMPLOYEES"), oContext = {
                    getModelIndex: function () { },
                    getPath: function () { },
                    toString: function () { return "~context~"; }
                }, oChangeCall, aContextsBefore, oDataReceivedCall, oError = new Error(), oExpectation, oGroupLock = {}, oPromise, that = this;
                oBinding.oCache = {
                    expand: function () { }
                };
                oBinding.createContexts(0, createData(2, 0, true, 5));
                oBinding.createContexts(3, createData(2, 3, true, 5));
                aContextsBefore = oBinding.aContexts.slice();
                this.mock(oBinding).expects("checkSuspended").withExactArgs();
                this.mock(oBinding).expects("lockGroup").withExactArgs().returns(oGroupLock);
                this.mock(oContext).expects("getPath").withExactArgs().returns("~contextpath~");
                this.mock(oBinding.oHeaderContext).expects("getPath").withExactArgs().returns("~bindingpath~");
                this.mock(_Helper).expects("getRelativePath").withExactArgs("~contextpath~", "~bindingpath~").returns("~cachepath~");
                oExpectation = this.mock(oBinding.oCache).expects("expand").withExactArgs(sinon.match.same(oGroupLock), "~cachepath~", sinon.match.func).returns(Promise.resolve().then(function () {
                    if (bSuccess) {
                        that.mock(oContext).expects("getModelIndex").exactly(iCount ? 1 : 0).withExactArgs().returns(1);
                        oChangeCall = that.mock(oBinding).expects("_fireChange").exactly(iCount ? 1 : 0).withExactArgs({ reason: ChangeReason.Change });
                        oDataReceivedCall = that.mock(oBinding).expects("fireDataReceived").exactly(bDataRequested ? 1 : 0).withExactArgs({});
                        return iCount;
                    }
                    else {
                        that.mock(oBinding).expects("fireDataReceived").exactly(bDataRequested ? 1 : 0).withExactArgs({ error: sinon.match.same(oError) });
                        throw oError;
                    }
                }));
                oPromise = oBinding.expand(oContext).then(function () {
                    assert.ok(bSuccess);
                    assert.strictEqual(oBinding.getLength(), 5 + iCount);
                    assert.strictEqual(oBinding.aContexts.length, 5 + iCount);
                    assert.strictEqual(oBinding.aContexts[0], aContextsBefore[0], "0");
                    assert.strictEqual(oBinding.aContexts[0].iIndex, 0);
                    assert.strictEqual(oBinding.aContexts[1], aContextsBefore[1], "1");
                    assert.strictEqual(oBinding.aContexts[1].iIndex, 1);
                    assert.notOk(2 in oBinding.aContexts, "2");
                    if (iCount) {
                        assert.notOk(3 in oBinding.aContexts, "3");
                        assert.notOk(4 in oBinding.aContexts, "4");
                        assert.notOk(5 in oBinding.aContexts, "5");
                        assert.strictEqual(oBinding.aContexts[6], aContextsBefore[3], "6");
                        assert.strictEqual(oBinding.aContexts[6].iIndex, 6);
                        assert.strictEqual(oBinding.aContexts[7], aContextsBefore[4], "7");
                        assert.strictEqual(oBinding.aContexts[7].iIndex, 7);
                    }
                    else {
                        assert.strictEqual(oBinding.aContexts[3], aContextsBefore[3], "3");
                        assert.strictEqual(oBinding.aContexts[3].iIndex, 3);
                        assert.strictEqual(oBinding.aContexts[4], aContextsBefore[4], "4");
                        assert.strictEqual(oBinding.aContexts[4].iIndex, 4);
                    }
                    if (bDataRequested && iCount) {
                        sinon.assert.callOrder(oChangeCall, oDataReceivedCall);
                    }
                }, function (oResult) {
                    assert.notOk(bSuccess);
                    assert.strictEqual(oResult, oError);
                });
                that.mock(oBinding).expects("fireDataRequested").exactly(bDataRequested ? 1 : 0).withExactArgs();
                if (bDataRequested) {
                    oExpectation.args[0][2]();
                }
                return oPromise;
            });
        });
    });
});
[0, 3].forEach(function (iCount) {
    QUnit.test("collapse: iCount = " + iCount, function (assert) {
        var oBinding = this.bindList("/EMPLOYEES"), oCollapseExpectation, oContext = {
            getModelIndex: function () { },
            getPath: function () { }
        }, aContextsBefore, oFireChangeExpectation, i;
        function createContextDummy(i) {
            return {
                iIndex: i,
                getPath: function () {
                    return "/EMPLOYEES/" + i;
                }
            };
        }
        oBinding.oCache = {
            collapse: function () { }
        };
        for (i = 0; i < 8; i += 1) {
            oBinding.aContexts.push(i === 6 ? undefined : createContextDummy(i));
        }
        oBinding.iMaxLength = 8;
        aContextsBefore = oBinding.aContexts.slice();
        assert.deepEqual(oBinding.mPreviousContextsByPath, {});
        this.mock(oContext).expects("getModelIndex").withExactArgs().returns(1);
        this.mock(oContext).expects("getPath").withExactArgs().returns("~contextpath~");
        this.mock(oBinding.oHeaderContext).expects("getPath").withExactArgs().returns("~bindingpath~");
        this.mock(_Helper).expects("getRelativePath").withExactArgs("~contextpath~", "~bindingpath~").returns("~cachepath~");
        oCollapseExpectation = this.mock(oBinding.oCache).expects("collapse").withExactArgs("~cachepath~").returns(iCount);
        oFireChangeExpectation = this.mock(oBinding).expects("_fireChange").exactly(iCount ? 1 : 0).withExactArgs({ reason: ChangeReason.Change });
        oBinding.collapse(oContext);
        if (iCount) {
            sinon.assert.callOrder(oCollapseExpectation, oFireChangeExpectation);
            assert.strictEqual(oBinding.aContexts[0], aContextsBefore[0], "0");
            assert.strictEqual(oBinding.aContexts[1], aContextsBefore[1], "1");
            assert.strictEqual(oBinding.aContexts[2], aContextsBefore[5], "2");
            assert.strictEqual(oBinding.aContexts[4], aContextsBefore[7], "4");
            assert.strictEqual(oBinding.aContexts.length, 5);
            assert.strictEqual(oBinding.iMaxLength, 5);
            oBinding.aContexts.forEach(function (oContext, iIndex) {
                if (iIndex !== 3) {
                    assert.strictEqual(oContext.iIndex, iIndex);
                }
            });
            assert.deepEqual(oBinding.mPreviousContextsByPath, {
                "/EMPLOYEES/2": aContextsBefore[2],
                "/EMPLOYEES/3": aContextsBefore[3],
                "/EMPLOYEES/4": aContextsBefore[4]
            });
        }
        else {
            assert.strictEqual(oBinding.iMaxLength, 8);
            assert.strictEqual(oBinding.aContexts.length, 8);
            oBinding.aContexts.forEach(function (oContext, iIndex) {
                if (iIndex !== 6) {
                    assert.strictEqual(oContext.iIndex, iIndex);
                    assert.strictEqual(oContext.getPath(), "/EMPLOYEES/" + iIndex);
                }
            });
            assert.deepEqual(oBinding.mPreviousContextsByPath, {});
        }
    });
});
[false, true].forEach(function (bOldCache) {
    [false, true].forEach(function (bNewCache) {
        var sTitle = "fetchCache: no kept-alive contexts, old cache=" + bOldCache + ", new cache=" + bNewCache;
        QUnit.test(sTitle, function () {
            var oBinding = this.bindList("/EMPLOYEES"), oParentContext = {}, oNewCache = {
                hasChangeListeners: function () { }
            }, oNewCachePromise = SyncPromise.resolve(Promise.resolve(bNewCache ? oNewCache : null));
            oBinding.oCache = bOldCache ? {} : undefined;
            this.mock(asODataParentBinding.prototype).expects("fetchCache").on(oBinding).withExactArgs(sinon.match.same(oParentContext), "bIgnoreParentCache").callsFake(function () {
                oBinding.oCachePromise = oNewCachePromise;
            });
            oBinding.fetchCache(oParentContext, "bIgnoreParentCache");
            return oNewCachePromise;
        });
    });
});
QUnit.test("fetchCache: kept-alive contexts", function (assert) {
    var oAddKeptElementCall, oParentContext = Context.create({}, oParentBinding, "/TEAMS('1')"), oBinding = this.bindList("TEAM_2_EMPLOYEES", oParentContext), oCheckUpdateCall, oContext1 = {
        isKeepAlive: function () { }
    }, oContext2 = {
        checkUpdate: function () { },
        isKeepAlive: function () { }
    }, mLateQueryOptions = {}, oNewCache = {
        addKeptElement: function () { },
        hasChangeListeners: function () { },
        setLateQueryOptions: function () { }
    }, oNewCacheMock = this.mock(oNewCache), oOldCache = {
        getLateQueryOptions: function () { },
        getValue: function () { }
    }, oNewCachePromise = SyncPromise.resolve(Promise.resolve(oNewCache));
    oBinding.oCache = oOldCache;
    oBinding.mPreviousContextsByPath = {
        p1: oContext1,
        p2: oContext2
    };
    this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("/resolved/path");
    this.mock(oContext1).expects("isKeepAlive").withExactArgs().returns(false);
    this.mock(oContext2).expects("isKeepAlive").withExactArgs().returns(true);
    this.mock(asODataParentBinding.prototype).expects("fetchCache").on(oBinding).withExactArgs(sinon.match.same(oParentContext), "bIgnoreParentCache").callsFake(function () {
        oBinding.oCachePromise = oNewCachePromise;
    });
    this.mock(_Helper).expects("getRelativePath").withExactArgs("p2", "/resolved/path").returns("cache/path");
    this.mock(oOldCache).expects("getValue").withExactArgs("cache/path").returns("~1~");
    oAddKeptElementCall = oNewCacheMock.expects("addKeptElement").withExactArgs("~1~");
    oCheckUpdateCall = this.mock(oContext2).expects("checkUpdate").withExactArgs();
    this.mock(oBinding.oCache).expects("getLateQueryOptions").withExactArgs().returns(mLateQueryOptions);
    oNewCacheMock.expects("setLateQueryOptions").withExactArgs(sinon.match.same(mLateQueryOptions));
    oBinding.fetchCache(oParentContext, "bIgnoreParentCache");
    return oNewCachePromise.then(function () {
        assert.ok(oCheckUpdateCall.calledAfter(oAddKeptElementCall));
    });
});
QUnit.test("resetKeepAlive", function () {
    var oBinding = this.bindList("/EMPLOYEES"), oContext1 = {
        isKeepAlive: function () { }
    }, oContext2 = {
        isKeepAlive: function () { },
        resetKeepAlive: function () { }
    }, oContext3 = {
        isKeepAlive: function () { }
    }, oContext4 = {
        isKeepAlive: function () { },
        resetKeepAlive: function () { }
    };
    oBinding.aContexts = [oContext1, oContext2];
    oBinding.mPreviousContextsByPath = {
        foo: oContext3,
        bar: oContext4
    };
    this.mock(oContext1).expects("isKeepAlive").withExactArgs().returns(false);
    this.mock(oContext2).expects("isKeepAlive").withExactArgs().returns(true);
    this.mock(oContext2).expects("resetKeepAlive").withExactArgs();
    this.mock(oContext3).expects("isKeepAlive").withExactArgs().returns(false);
    this.mock(oContext4).expects("isKeepAlive").withExactArgs().returns(true);
    this.mock(oContext4).expects("resetKeepAlive").withExactArgs();
    oBinding.resetKeepAlive();
});
QUnit.test("_checkDataStateMessages", function () {
    var oBinding = this.bindList("/EMPLOYEES"), oDataState = {
        setModelMessages: function () { }
    };
    this.mock(this.oModel).expects("getMessagesByPath").withExactArgs("/resolved/path", true).returns("aMessages");
    this.mock(oDataState).expects("setModelMessages").withExactArgs("aMessages");
    oBinding._checkDataStateMessages(oDataState, "/resolved/path");
    oBinding._checkDataStateMessages(oDataState);
});
QUnit.test("requestFilterForMessages, (with unresolved binding)", function (assert) {
    var oBinding = this.bindList("TEAM_2_EMPLOYEES");
    return oBinding.requestFilterForMessages().then(function (oFilter) {
        assert.strictEqual(oFilter, null);
    });
});
[{
        messages: [],
        predicates: []
    }, {
        messages: [{
                getTargets: function () { return ["/TEAMS('1')/foo"]; }
            }, {
                getTargets: function () { return ["/TEAMS('1')/bar"]; }
            }],
        predicates: ["('1')"]
    }, {
        messages: [{
                getTargets: function () { return ["/TEAMS('1')/foo", "/TEAMS('1')/bar"]; }
            }, {
                getTargets: function () { return ["/TEAMS('2')/bar"]; }
            }, {
                getTargets: function () { return ["/TEAMS($uid='xyz')"]; }
            }],
        predicates: ["('1')", "('2')"]
    }, {
        callbackReturns: true,
        messages: [{
                getTargets: function () { return ["/TEAMS('1')/foo"]; }
            }, {
                getTargets: function () { return ["/TEAMS('2')/bar"]; }
            }],
        predicates: ["('1')", "('2')"]
    }, {
        callbackReturns: false,
        messages: [{
                getTargets: function () { return ["/TEAMS('1')/foo"]; }
            }, {
                getTargets: function () { return ["/TEAMS('2')/bar"]; }
            }],
        predicates: []
    }].forEach(function (oFixture) {
    var sTitle = "requestFilterForMessages; messages: " + oFixture.messages.length + " predicates: " + oFixture.predicates + " callbackReturns: " + oFixture.callbackReturns;
    QUnit.test(sTitle, function (assert) {
        var fnCallback, oBinding = this.bindList("/TEAMS"), aFilters = [], oListBindingMock = this.mock(ODataListBinding), that = this;
        aFilters = oFixture.predicates.map(function () {
            return new Filter("does", "NOT", "matter");
        });
        this.mock(oBinding.oHeaderContext).expects("getPath").withExactArgs().returns("/TEAMS");
        this.mock(_Helper).expects("getMetaPath").withExactArgs("/TEAMS").returns("~meta~path~");
        this.mock(this.oModel.oMetaModel).expects("requestObject").withExactArgs("~meta~path~/").callsFake(function () {
            that.mock(that.oModel).expects("getMessagesByPath").withExactArgs("/TEAMS", true).returns(oFixture.messages);
            if (oFixture.predicates.length === 0) {
                oListBindingMock.expects("getFilterForPredicate").never();
            }
            else {
                oFixture.predicates.map(function (sPredicate, i) {
                    oListBindingMock.expects("getFilterForPredicate").withExactArgs(sPredicate, "~entity~type~", sinon.match.same(that.oModel.oMetaModel), "~meta~path~").returns(aFilters[i]);
                });
            }
            return Promise.resolve("~entity~type~");
        });
        if (oFixture.callbackReturns !== undefined) {
            fnCallback = sinon.spy(function () { return oFixture.callbackReturns; });
        }
        return oBinding.requestFilterForMessages(fnCallback).then(function (oFilter) {
            if (oFixture.predicates.length === 0 || oFixture.callbackReturns === false) {
                assert.strictEqual(oFilter, null);
                return;
            }
            if (oFixture.predicates.length === 1) {
                assert.strictEqual(oFilter, aFilters[0]);
                return;
            }
            assert.strictEqual(oFilter.aFilters.length, oFixture.predicates.length);
            assert.notOk(oFilter.bAnd);
            oFixture.predicates.forEach(function (_sPredicate, i) {
                assert.strictEqual(oFilter.aFilters[i], aFilters[i]);
            });
            if (fnCallback) {
                oFixture.messages.forEach(function (oMessage) {
                    assert.ok(fnCallback.calledWithExactly(oMessage));
                });
            }
        });
    });
});
QUnit.test("getGeneration", function (assert) {
    var oBinding = this.bindList("/TEAMS"), oContext = Context.createNewContext(this.oModel, oParentBinding, "/TEAMS('42')");
    this.mock(oBinding.oHeaderContext).expects("getGeneration").withExactArgs(true).returns(42);
    assert.strictEqual(oBinding.getGeneration(), 42);
    oBinding = this.bindList("TEAM_2_EMPLOYEES", oContext);
    this.mock(asODataParentBinding.prototype).expects("getGeneration").on(oBinding).withExactArgs().returns(34);
    assert.strictEqual(oBinding.getGeneration(), 34);
});
QUnit.test("getFilterForPredicate (one key property)", function (assert) {
    var oEntityType = {
        $Key: ["key"]
    }, oFilter, oMetaModel = {
        getObject: function () { }
    };
    this.mock(_Parser).expects("parseKeyPredicate").withExactArgs("('value')").returns({ "": "'value'" });
    this.mock(oMetaModel).expects("getObject").withExactArgs("~meta~path~/key/$Type").returns("type");
    this.mock(window).expects("decodeURIComponent").withExactArgs("'value'").returns("decoded value");
    this.mock(_Helper).expects("parseLiteral").withExactArgs("decoded value", "type", "key").returns("parsed value");
    oFilter = ODataListBinding.getFilterForPredicate("('value')", oEntityType, oMetaModel, "~meta~path~");
    assert.ok(oFilter instanceof Filter);
    assert.deepEqual(oFilter, new Filter("key", FilterOperator.EQ, "parsed value"));
});
QUnit.test("getFilterForPredicate (more key properties, aliases)", function (assert) {
    var oEntityType = {
        $Key: ["key1", "key2", { alias: "key3/p" }]
    }, oFilter, oHelperMock = this.mock(_Helper), oMetaModel = {
        getObject: function () { }
    }, oMetaModelMock = this.mock(oMetaModel);
    this.mock(_Parser).expects("parseKeyPredicate").withExactArgs("(key1='42',key2=43,alias='44')").returns({ key1: "'42'", key2: "43", alias: "'44'" });
    oMetaModelMock.expects("getObject").withExactArgs("~meta~path~/key1/$Type").returns("type1");
    oMetaModelMock.expects("getObject").withExactArgs("~meta~path~/key2/$Type").returns("type2");
    oMetaModelMock.expects("getObject").withExactArgs("~meta~path~/key3/p/$Type").returns("type3");
    oHelperMock.expects("parseLiteral").withExactArgs("'42'", "type1", "key1").returns("42");
    oHelperMock.expects("parseLiteral").withExactArgs("43", "type2", "key2").returns(43);
    oHelperMock.expects("parseLiteral").withExactArgs("'44'", "type3", "key3/p").returns("44");
    oFilter = ODataListBinding.getFilterForPredicate("(key1='42',key2=43,alias='44')", oEntityType, oMetaModel, "~meta~path~");
    assert.ok(oFilter instanceof Filter);
    assert.deepEqual(oFilter, new Filter({
        and: true,
        filters: [
            new Filter("key1", FilterOperator.EQ, "42"),
            new Filter("key2", FilterOperator.EQ, 43),
            new Filter("key3/p", FilterOperator.EQ, "44")
        ]
    }));
});
QUnit.test("getCount", function (assert) {
    var oBinding = this.bindList("/EMPLOYEES"), oBindingMock = this.mock(oBinding);
    oBindingMock.expects("getHeaderContext").withExactArgs().returns(oBinding.oHeaderContext);
    this.mock(oBinding.oHeaderContext).expects("getProperty").withExactArgs("$count").returns(42);
    assert.strictEqual(oBinding.getCount(), 42);
    oBindingMock.expects("getHeaderContext").withExactArgs().returns(null);
    assert.strictEqual(oBinding.getCount(), undefined);
});
QUnit.test("moveEntityHere", function (assert) {
    var oBinding = this.bindList("/EMPLOYEES"), oCache = {
        addKeptElement: function () { }
    }, oEntityBinding = {
        getInheritableQueryOptions: function () { }
    }, oEntityContext = {
        checkUpdate: function () { },
        fetchValue: function () { },
        getBinding: function () {
            return oEntityBinding;
        },
        getPath: function () { },
        setKeepAlive: function () { throw new Error("must be mocked"); }
    }, oRootBinding = {
        isSuspended: function () { },
        resume: function () { }
    }, that = this;
    oBinding.oCachePromise = Promise.resolve().then(function () {
        that.mock(oEntityContext).expects("setKeepAlive").withExactArgs(true);
        return oCache;
    });
    this.mock(oEntityContext).expects("getPath").withExactArgs().returns("/EMPLOYEES('1')");
    this.mock(_Helper).expects("getRelativePath").withExactArgs("/EMPLOYEES('1')", "/EMPLOYEES").returns("('1')");
    this.mock(oBinding).expects("getRootBinding").twice().withExactArgs().returns(oRootBinding);
    this.mock(oRootBinding).expects("isSuspended").withExactArgs().returns(true);
    this.mock(oBinding).expects("checkKeepAlive").withExactArgs(sinon.match.same(oEntityContext));
    this.mock(oEntityBinding).expects("getInheritableQueryOptions").withExactArgs().returns("~queryOptions~");
    this.mock(oBinding).expects("aggregateQueryOptions").withExactArgs("~queryOptions~", "", true).returns(true);
    this.mock(oEntityContext).expects("fetchValue").withExactArgs(null, null, true).returns(SyncPromise.resolve("~entity~"));
    this.mock(_Helper).expects("getPrivateAnnotation").withExactArgs("~entity~", "predicate").returns("('1')");
    this.mock(oRootBinding).expects("resume").withExactArgs();
    this.mock(oCache).expects("addKeptElement").withExactArgs("~entity~");
    this.mock(oEntityContext).expects("checkUpdate").withExactArgs();
    oBinding.moveEntityHere(oEntityContext);
    assert.strictEqual(oEntityContext.oBinding, oBinding);
    assert.strictEqual(oBinding.mPreviousContextsByPath["/EMPLOYEES('1')"], oEntityContext);
    return oBinding.oCachePromise;
});
[undefined, "", "('1')/EMPLOYEE_2_TEAM"].forEach(function (sRelativePath) {
    QUnit.test("moveEntityHere: path mismatch: " + sRelativePath, function (assert) {
        var oBinding = this.bindList("/EMPLOYEES"), oEntityBinding = {
            getInheritableQueryOptions: function () { }
        }, oEntityContext = {
            getBinding: function () {
                return oEntityBinding;
            },
            getPath: function () { }
        };
        this.mock(oEntityContext).expects("getPath").withExactArgs().returns("/TEAMS('1')");
        this.mock(_Helper).expects("getRelativePath").withExactArgs("/TEAMS('1')", "/EMPLOYEES").returns(sRelativePath);
        assert.throws(function () {
            oBinding.moveEntityHere(oEntityContext);
        }, new Error(oBinding + ": /TEAMS('1') is not an entity of the collection"));
    });
});
QUnit.test("moveEntityHere: not suspended", function (assert) {
    var oBinding = this.bindList("/EMPLOYEES"), oEntityBinding = {
        getInheritableQueryOptions: function () { }
    }, oEntityContext = {
        getBinding: function () {
            return oEntityBinding;
        },
        getPath: function () { }
    }, oRootBinding = {
        isSuspended: function () { }
    };
    this.mock(oEntityContext).expects("getPath").withExactArgs().returns("/EMPLOYEES('1')");
    this.mock(_Helper).expects("getRelativePath").withExactArgs("/EMPLOYEES('1')", "/EMPLOYEES").returns("('1')");
    this.mock(oBinding).expects("getRootBinding").withExactArgs().returns(oRootBinding);
    this.mock(oRootBinding).expects("isSuspended").withExactArgs().returns(false);
    assert.throws(function () {
        oBinding.moveEntityHere(oEntityContext);
    }, new Error(oBinding + ": must be suspended"));
});
QUnit.test("moveEntityHere: $expand to collection in context binding", function (assert) {
    var oBinding = this.bindList("/EMPLOYEES"), oEntityBinding = {
        getInheritableQueryOptions: function () { }
    }, oEntityContext = {
        fetchValue: function () { },
        getBinding: function () {
            return oEntityBinding;
        },
        getPath: function () { },
        toString: function () { return "~entity~context~"; }
    }, oRootBinding = {
        isSuspended: function () { }
    };
    this.mock(oEntityContext).expects("getPath").withExactArgs().returns("/EMPLOYEES('1')");
    this.mock(_Helper).expects("getRelativePath").withExactArgs("/EMPLOYEES('1')", "/EMPLOYEES").returns("('1')");
    this.mock(oBinding).expects("getRootBinding").withExactArgs().returns(oRootBinding);
    this.mock(oRootBinding).expects("isSuspended").withExactArgs().returns(true);
    this.mock(oBinding).expects("checkKeepAlive").withExactArgs(sinon.match.same(oEntityContext));
    this.mock(oEntityBinding).expects("getInheritableQueryOptions").withExactArgs().returns("~queryOptions~");
    this.mock(oEntityContext).expects("fetchValue").withExactArgs(null, null, true).returns(SyncPromise.resolve("~entity~"));
    this.mock(_Helper).expects("getPrivateAnnotation").withExactArgs("~entity~", "predicate").returns("('1')");
    this.mock(oBinding).expects("aggregateQueryOptions").withExactArgs("~queryOptions~", "", true).returns(false);
    assert.throws(function () {
        oBinding.moveEntityHere(oEntityContext);
    }, new Error("~entity~context~: could not move the entity. Probably a list binding" + " w/o $$ownRequest depends on it"));
});
QUnit.test("moveEntityHere: context binding not ready yet", function (assert) {
    var oBinding = this.bindList("/EMPLOYEES"), oEntityBinding = {
        getInheritableQueryOptions: function () { },
        toString: function () { return "~entity~binding~"; }
    }, oEntityContext = {
        fetchValue: function () { },
        getBinding: function () {
            return oEntityBinding;
        },
        getPath: function () { }
    }, oRootBinding = {
        isSuspended: function () { }
    };
    this.mock(oEntityContext).expects("getPath").withExactArgs().returns("/EMPLOYEES('1')");
    this.mock(_Helper).expects("getRelativePath").withExactArgs("/EMPLOYEES('1')", "/EMPLOYEES").returns("('1')");
    this.mock(oBinding).expects("getRootBinding").withExactArgs().returns(oRootBinding);
    this.mock(oRootBinding).expects("isSuspended").withExactArgs().returns(true);
    this.mock(oBinding).expects("checkKeepAlive").withExactArgs(sinon.match.same(oEntityContext));
    this.mock(oEntityBinding).expects("getInheritableQueryOptions").withExactArgs().returns("~queryOptions~");
    this.mock(oEntityContext).expects("fetchValue").withExactArgs(null, null, true).returns(SyncPromise.resolve(Promise.resolve("~entity~")));
    this.mock(oBinding).expects("aggregateQueryOptions").never();
    assert.throws(function () {
        oBinding.moveEntityHere(oEntityContext);
    }, new Error("Cannot move the entity; the context binding has not finished loading: " + "~entity~binding~"));
});
QUnit.test("moveEntityHere: no key predicate", function (assert) {
    var oBinding = this.bindList("/EMPLOYEES"), oEntityBinding = {
        getInheritableQueryOptions: function () { }
    }, oEntityContext = {
        fetchValue: function () { },
        getBinding: function () {
            return oEntityBinding;
        },
        getPath: function () { }
    }, oRootBinding = {
        isSuspended: function () { }
    };
    this.mock(oEntityContext).expects("getPath").withExactArgs().returns("/EMPLOYEES('1')");
    this.mock(_Helper).expects("getRelativePath").withExactArgs("/EMPLOYEES('1')", "/EMPLOYEES").returns("('1')");
    this.mock(oBinding).expects("getRootBinding").withExactArgs().returns(oRootBinding);
    this.mock(oRootBinding).expects("isSuspended").withExactArgs().returns(true);
    this.mock(oBinding).expects("checkKeepAlive").withExactArgs(sinon.match.same(oEntityContext));
    this.mock(oEntityBinding).expects("getInheritableQueryOptions").withExactArgs().returns("~queryOptions~");
    this.mock(oEntityContext).expects("fetchValue").withExactArgs(null, null, true).returns(SyncPromise.resolve("~entity~"));
    this.mock(_Helper).expects("getPrivateAnnotation").withExactArgs("~entity~", "predicate").returns(undefined);
    this.mock(oBinding).expects("aggregateQueryOptions").never();
    assert.throws(function () {
        oBinding.moveEntityHere(oEntityContext);
    }, new Error("No key predicate known at /EMPLOYEES('1')"));
});