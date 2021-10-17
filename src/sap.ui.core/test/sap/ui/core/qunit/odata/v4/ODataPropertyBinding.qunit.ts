import Log from "sap/base/Log";
import ManagedObject from "sap/ui/base/ManagedObject";
import SyncPromise from "sap/ui/base/SyncPromise";
import BindingMode from "sap/ui/model/BindingMode";
import ChangeReason from "sap/ui/model/ChangeReason";
import BaseContext from "sap/ui/model/Context";
import PropertyBinding from "sap/ui/model/PropertyBinding";
import TypeString from "sap/ui/model/odata/type/String";
import Context from "sap/ui/model/odata/v4/Context";
import asODataBinding from "sap/ui/model/odata/v4/ODataBinding";
import ODataModel from "sap/ui/model/odata/v4/ODataModel";
import ODataPropertyBinding from "sap/ui/model/odata/v4/ODataPropertyBinding";
import _Cache from "sap/ui/model/odata/v4/lib/_Cache";
import _Helper from "sap/ui/model/odata/v4/lib/_Helper";
import TestUtils from "sap/ui/test/TestUtils";
var sClassName = "sap.ui.model.odata.v4.ODataPropertyBinding", sServiceUrl = "/sap/opu/odata4/sap/zui5_testv4/default/sap/zui5_epm_sample/0002/", TestControl = ManagedObject.extend("test.sap.ui.model.odata.v4.ODataPropertyBinding", {
    metadata: {
        properties: {
            text: "string"
        }
    },
    refreshDataState: function () { }
});
QUnit.module("sap.ui.model.odata.v4.ODataPropertyBinding", {
    beforeEach: function () {
        this.oLogMock = this.mock(Log);
        this.oLogMock.expects("warning").never();
        this.oLogMock.expects("error").never();
        this.oModel = new ODataModel({
            serviceUrl: "/service/?sap-client=111",
            synchronizationMode: "None"
        });
        this.mock(this.oModel.oRequestor).expects("request").never();
    },
    afterEach: function () {
        return TestUtils.awaitRendering();
    },
    getPropertyCache: function () {
        var oCache = {
            fetchValue: function () { },
            setActive: function () { },
            update: function () { }
        };
        this.mock(_Cache).expects("createProperty").returns(oCache);
        return oCache;
    },
    getPropertyCacheMock: function () {
        return this.mock(this.getPropertyCache());
    },
    createTextBinding: function (assert, iNoOfRequests, oError) {
        var oControl = new TestControl({ models: this.oModel }), that = this;
        return new Promise(function (fnResolve) {
            var oBinding, oContextBindingMock, fnFetchValue;
            function changeHandler(oEvent) {
                assert.strictEqual(oControl.getText(), "value", "initialized");
                assert.strictEqual(oBinding.vValue, "value", "vValue contains the value and can be used to mock a checkUpdateInternal");
                assert.strictEqual(oBinding.bInitial, false);
                assert.strictEqual(oEvent.getParameter("reason"), ChangeReason.Change);
                assert.strictEqual(fnFetchValue.args[0][1], oBinding, "The binding passed itself to fetchValue");
                oBinding.detachChange(changeHandler);
                fnResolve(oBinding);
            }
            oControl.bindObject("/EntitySet('foo')");
            oContextBindingMock = that.mock(oControl.getObjectBinding());
            fnFetchValue = oContextBindingMock.expects("fetchValue");
            fnFetchValue.exactly(iNoOfRequests || 1).withExactArgs("/EntitySet('foo')/property", sinon.match.object, undefined).returns(Promise.resolve("value"));
            if (oError) {
                oContextBindingMock.expects("fetchValue").withExactArgs("/EntitySet('foo')/property", sinon.match.object, undefined).returns(Promise.reject(oError));
            }
            oControl.bindProperty("text", {
                path: "property",
                type: new TypeString()
            });
            assert.strictEqual(oControl.getText(), undefined, "synchronous: no value yet");
            oBinding = oControl.getBinding("text");
            oBinding.attachChange(changeHandler);
        });
    }
});
QUnit.test("mixin", function (assert) {
    var oBinding = this.oModel.bindProperty("ID"), oMixin = {};
    asODataBinding(oMixin);
    assert.notStrictEqual(oBinding["destroy"], oMixin["destroy"], "override destroy");
    assert.notStrictEqual(oBinding["resetInvalidDataState"], oMixin["resetInvalidDataState"], "override resetInvalidDataState");
    Object.keys(oMixin).forEach(function (sKey) {
        if (sKey !== "destroy" && sKey !== "resetInvalidDataState") {
            assert.strictEqual(oBinding[sKey], oMixin[sKey], sKey);
        }
    });
});
["/EMPLOYEES(ID='1')/Name", "Name"].forEach(function (sPath) {
    QUnit.test("bindProperty, sPath = '" + sPath + "'", function (assert) {
        var bAbsolute = sPath[0] === "/", oBinding, oBindingSpy = this.spy(asODataBinding, "call"), oCache = {}, oContext = Context.create(this.oModel, null, "/EMPLOYEES(ID='42')"), oExpectation = this.mock(this.oModel).expects("bindingCreated");
        if (bAbsolute) {
            this.mock(_Cache).expects("createProperty").withExactArgs(sinon.match.same(this.oModel.oRequestor), sPath.slice(1), { "sap-client": "111" }).returns(oCache);
        }
        else {
            this.mock(_Cache).expects("createProperty").never();
        }
        this.mock(ODataPropertyBinding.prototype).expects("fetchCache").withExactArgs(sinon.match.same(oContext)).callThrough();
        oBinding = this.oModel.bindProperty(sPath, oContext);
        assert.ok(oBinding instanceof ODataPropertyBinding);
        sinon.assert.calledWithExactly(oExpectation, sinon.match.same(oBinding));
        assert.strictEqual(oBinding.getModel(), this.oModel);
        assert.strictEqual(oBinding.getContext(), oContext);
        assert.strictEqual(oBinding.getPath(), sPath);
        assert.strictEqual(oBinding.hasOwnProperty("oCachePromise"), true);
        assert.strictEqual(oBinding.oCachePromise.getResult(), bAbsolute ? oCache : null);
        assert.strictEqual(oBinding.hasOwnProperty("sGroupId"), true);
        assert.strictEqual(oBinding.sGroupId, undefined);
        assert.strictEqual(oBinding.hasOwnProperty("oCheckUpdateCallToken"), true);
        assert.strictEqual(oBinding.oCheckUpdateCallToken, undefined);
        assert.strictEqual(oBinding.hasOwnProperty("bHasDeclaredType"), true);
        assert.strictEqual(oBinding.bHasDeclaredType, undefined);
        assert.strictEqual(oBinding.hasOwnProperty("vValue"), true);
        assert.strictEqual(oBinding.vValue, undefined);
        assert.ok(oBindingSpy.calledOnceWithExactly(sinon.match.same(oBinding)));
    });
});
QUnit.test("bindProperty with relative path and !v4.Context", function (assert) {
    var oBinding, oContext = { getPath: function () { return "/EMPLOYEES(ID='1')"; } }, oExpectation = this.mock(this.oModel).expects("bindingCreated"), sPath = "Name";
    this.mock(ODataPropertyBinding.prototype).expects("fetchCache").withExactArgs(sinon.match.same(oContext)).callsFake(function () {
        assert.strictEqual(this.oContext, oContext);
    });
    oBinding = this.oModel.bindProperty(sPath, oContext);
    sinon.assert.calledWithExactly(oExpectation, sinon.match.same(oBinding));
    assert.strictEqual(oBinding.getModel(), this.oModel);
    assert.strictEqual(oBinding.getContext(), oContext);
    assert.strictEqual(oBinding.getPath(), sPath);
    assert.strictEqual(oBinding.hasOwnProperty("sGroupId"), true);
    assert.strictEqual(oBinding.sGroupId, undefined);
});
QUnit.test("bindProperty with parameters", function (assert) {
    var oBinding, mClonedParameters = { "custom": "foo" }, oError = new Error("Unsupported ..."), oModelMock = this.mock(this.oModel), mParameters = {}, mQueryOptions = {};
    this.mock(_Helper).expects("clone").twice().withExactArgs(sinon.match.same(mParameters)).returns(mClonedParameters);
    oModelMock.expects("buildQueryOptions").withExactArgs(sinon.match.same(mClonedParameters), false).returns(mQueryOptions);
    this.mock(ODataPropertyBinding.prototype).expects("fetchCache").withExactArgs(null);
    oBinding = this.oModel.bindProperty("/EMPLOYEES(ID='1')/Name", null, mParameters);
    assert.strictEqual(oBinding.mParameters, undefined, "do not propagate unchecked query options");
    oModelMock.expects("buildQueryOptions").throws(oError);
    assert.throws(function () {
        this.oModel.bindProperty("/EMPLOYEES(ID='1')/Name", null, mParameters);
    }, oError);
});
["$count", "/SalesOrderList/$count"].forEach(function (sPath) {
    QUnit.test("bindProperty with system query options: " + sPath, function (assert) {
        var oBinding, mClonedParameters = {}, oContext = {}, mParameters = {
            $apply: "A.P.P.L.E.",
            $filter: "GrossAmount gt 123",
            $search: "covfefe"
        }, mQueryOptions = {};
        this.mock(_Helper).expects("clone").withExactArgs(sinon.match.same(mParameters)).returns(mClonedParameters);
        this.mock(this.oModel).expects("buildQueryOptions").withExactArgs(sinon.match.same(mClonedParameters), true).returns(mQueryOptions);
        this.mock(ODataPropertyBinding.prototype).expects("fetchCache").withExactArgs(sinon.match.same(oContext));
        oBinding = this.oModel.bindProperty(sPath, oContext, mParameters);
        assert.strictEqual(oBinding.mQueryOptions, mQueryOptions);
    });
});
["/", "foo/"].forEach(function (sPath) {
    QUnit.test("bindProperty: invalid path: " + sPath, function (assert) {
        assert.throws(function () {
            this.oModel.bindProperty(sPath);
        }, new Error("Invalid path: " + sPath));
    });
});
QUnit.test("bindProperty: empty path is valid for base context", function () {
    var oBaseContext = this.oModel.createBindingContext("/ProductList('HT-1000')/Name");
    this.oModel.bindProperty("", oBaseContext);
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
        var oBinding, oModel = this.oModel, oCache = {
            oRequestor: oModel.oRequestor,
            setActive: function () { }
        }, oCacheMock = this.mock(_Cache), oInitialContext = createContext(oFixture.sInit, "/EMPLOYEES(ID='1')"), oTargetContext = createContext(oFixture.sTarget, "/EMPLOYEES(ID='2')");
        function createContext(sType, sPath) {
            if (sType === "base") {
                oCacheMock.expects("createProperty").withExactArgs(sinon.match.same(oModel.oRequestor), sPath.slice(1) + "/Name", { "sap-client": "111" }).returns(oCache);
                return oModel.createBindingContext(sPath);
            }
            if (sType === "v4") {
                return Context.create(oModel, null, sPath);
            }
            return undefined;
        }
        oBinding = oModel.bindProperty("Name", oInitialContext);
        if (oFixture.sInit === "base") {
            assert.strictEqual(oBinding.oCachePromise.getResult(), oCache);
            this.mock(oCache).expects("setActive").withExactArgs(false);
        }
        else {
            assert.strictEqual(oBinding.oCachePromise.getResult(), null);
        }
        if (oFixture.sTarget) {
            this.mock(oBinding).expects("checkUpdateInternal").withExactArgs(true, "context");
        }
        this.mock(oBinding).expects("deregisterChange").withExactArgs();
        this.mock(oBinding).expects("checkSuspended").withExactArgs(true);
        oBinding.setContext(oTargetContext);
        assert.strictEqual(oBinding.oCachePromise.getResult(), oFixture.sTarget === "base" ? oCache : null);
        oBinding.setContext(oTargetContext);
    });
});
[false, true].forEach(function (bHasMessages) {
    var sTitle = "checkUpdateInternal(undefined) consider data state control messages" + ", bHasMessages =" + bHasMessages;
    QUnit.test(sTitle, function () {
        var oContext = Context.create(this.oModel, {}, "/..."), oBinding = this.oModel.bindProperty("relative", oContext), oDataState = { getControlMessages: function () { } };
        oBinding.vValue = 42;
        this.mock(oBinding).expects("getResolvedPath").withExactArgs().callThrough();
        this.mock(oBinding).expects("getDataState").withExactArgs().returns(oDataState);
        this.mock(oDataState).expects("getControlMessages").withExactArgs().returns(bHasMessages ? ["invalid data state"] : []);
        this.mock(this.oModel.getMetaModel()).expects("fetchUI5Type").withExactArgs("/.../relative").returns(SyncPromise.resolve());
        this.mock(oContext).expects("fetchValue").withExactArgs("/.../relative", sinon.match.same(oBinding)).returns(SyncPromise.resolve(42));
        this.mock(oBinding).expects("_fireChange").exactly(bHasMessages ? 1 : 0).withExactArgs({ reason: ChangeReason.Change });
        this.mock(oBinding).expects("checkDataState").withExactArgs();
        return oBinding.checkUpdateInternal(undefined);
    });
});
[false, true].forEach(function (bForceUpdate) {
    QUnit.test("checkUpdateInternal(" + bForceUpdate + "): unchanged", function (assert) {
        var that = this;
        return this.createTextBinding(assert, 3).then(function (oBinding) {
            var bGotChangeEvent = false;
            oBinding.attachChange(function () {
                bGotChangeEvent = true;
            });
            that.mock(that.oModel.getMetaModel()).expects("getMetaContext").never();
            that.mock(oBinding).expects("checkDataState").withExactArgs();
            return Promise.all([
                oBinding.checkUpdateInternal(bForceUpdate),
                oBinding.checkUpdateInternal()
            ]).then(function () {
                assert.strictEqual(bGotChangeEvent, bForceUpdate, "got change event as expected");
            });
        });
    });
});
QUnit.test("checkUpdateInternal(true): no change event for virtual context", function (assert) {
    var oBinding, oVirtualContext = Context.create(this.oModel, {}, "/.../" + Context.VIRTUAL, Context.VIRTUAL);
    this.mock(ODataPropertyBinding.prototype).expects("fetchCache").withExactArgs(sinon.match.same(oVirtualContext)).callsFake(function () {
        this.sReducedPath = "~reduced~";
    });
    oBinding = this.oModel.bindProperty("relative", oVirtualContext);
    this.mock(this.oModel.getMetaModel()).expects("fetchUI5Type").withExactArgs("/.../" + Context.VIRTUAL + "/relative").returns(SyncPromise.resolve());
    oBinding.attachChange(function () {
        assert.ok(false, "no change event for virtual context");
    });
    return oBinding.checkUpdateInternal(true);
});
QUnit.test("checkUpdateInternal(true): no change event in virtual row", function (assert) {
    var oVirtualContext = Context.create(this.oModel, {}, "/EMPLOYEES/" + Context.VIRTUAL + "/EMPLOYEE_2_MANAGER"), oBinding = this.oModel.bindProperty("relative", oVirtualContext), sResolvedPath = "/EMPLOYEES/" + Context.VIRTUAL + "/EMPLOYEE_2_MANAGER/relative";
    this.mock(this.oModel.getMetaModel()).expects("fetchUI5Type").withExactArgs(sResolvedPath).returns(SyncPromise.resolve());
    this.mock(oVirtualContext).expects("fetchValue").withExactArgs(sResolvedPath, oBinding).returns(SyncPromise.resolve());
    oBinding.attachChange(function () {
        assert.ok(false, "no change event for virtual context");
    });
    return oBinding.checkUpdateInternal(true);
});
QUnit.test("checkUpdateInternal: deferred initialization", function () {
    var oBinding, oBindingMock = this.mock(ODataPropertyBinding.prototype), oContext = Context.create(this.oModel, {}, "/...", 0), oPromise = SyncPromise.resolve(Promise.resolve()), oType = { getName: function () { } };
    oBindingMock.expects("fetchCache").withExactArgs(undefined).returns(oPromise);
    this.mock(this.oModel.getMetaModel()).expects("fetchUI5Type").withExactArgs("/.../relative").returns(SyncPromise.resolve(oType));
    this.mock(oContext).expects("fetchValue").never();
    oBinding = this.oModel.bindProperty("relative");
    this.mock(oBinding).expects("deregisterChange");
    oBindingMock.expects("fetchCache").withExactArgs(sinon.match.same(oContext)).returns(oPromise);
    oBinding.setContext(oContext);
    return oPromise;
});
QUnit.test("checkUpdateInternal(true): provide value synchronously", function (assert) {
    var oContext = Context.create(this.oModel, {}, "/...", 0), oBinding = this.oModel.bindProperty("relative", oContext), oPromise, oType = {
        formatValue: function () { },
        getName: function () { }
    };
    this.mock(oContext).expects("fetchValue").withExactArgs("/.../relative", oBinding).returns(SyncPromise.resolve("foo"));
    this.mock(this.oModel.getMetaModel()).expects("fetchUI5Type").withExactArgs("/.../relative").returns(SyncPromise.resolve(oType));
    this.mock(oType).expects("formatValue").withExactArgs("foo", undefined).returns("*foo*");
    oPromise = oBinding.checkUpdateInternal(true);
    assert.strictEqual(oBinding.getValue(), "foo");
    assert.strictEqual(oBinding.getExternalValue(), "*foo*");
    assert.strictEqual(oBinding.getType(), oType);
    return oPromise;
});
QUnit.test("checkUpdateInternal(true): type not yet available", function (assert) {
    var oContext = Context.create(this.oModel, {}, "/...", 0), oBinding = this.oModel.bindProperty("relative", oContext);
    this.mock(oContext).expects("fetchValue").withExactArgs("/.../relative", oBinding).returns(SyncPromise.resolve("foo"));
    this.mock(this.oModel.getMetaModel()).expects("fetchUI5Type").withExactArgs("/.../relative").returns(new SyncPromise(function () { }));
    oBinding.checkUpdateInternal(true);
    assert.strictEqual(oBinding.getValue(), "foo");
    assert.strictEqual(oBinding.getType(), undefined);
});
QUnit.test("checkUpdateInternal with object value, success", function (assert) {
    var oContext = Context.create(this.oModel, {}, "/EntitySet('foo')"), sPath = "nonPrimitive", oBinding = this.oModel.bindProperty(sPath, oContext), vValue = {}, vValueClone = {};
    oBinding.setBindingMode(BindingMode.OneTime);
    oBinding.setType(null, "any");
    this.mock(oContext).expects("fetchValue").withExactArgs(oBinding.sReducedPath, sinon.match.same(oBinding)).returns(SyncPromise.resolve(vValue));
    this.mock(_Helper).expects("publicClone").withExactArgs(sinon.match.same(vValue)).returns(vValueClone);
    return oBinding.checkUpdateInternal().then(function () {
        assert.strictEqual(oBinding.getValue(), vValueClone);
    });
});
QUnit.test("checkUpdateInternal with action advertisement object value, success", function (assert) {
    var oContext = Context.create(this.oModel, {}, "/EntitySet('foo')"), sPath = "#name.space.Advertisement", oBinding = this.oModel.bindProperty(sPath, oContext), vValue = {}, vValueClone = {};
    oBinding.setType(null, "any");
    this.mock(oContext).expects("fetchValue").withExactArgs(oBinding.sReducedPath, sinon.match.same(oBinding)).returns(SyncPromise.resolve(vValue));
    this.mock(_Helper).expects("publicClone").withExactArgs(sinon.match.same(vValue)).returns(vValueClone);
    return oBinding.checkUpdateInternal().then(function () {
        assert.strictEqual(oBinding.getValue(), vValueClone);
    });
});
[{
        internalType: "int",
        mode: BindingMode.OneTime,
        path: "nonPrimitive"
    }, {
        internalType: "any",
        mode: BindingMode.OneTime,
        path: "/EntitySet('bar')/nonPrimitive"
    }, {
        internalType: "any",
        mode: BindingMode.OneWay,
        path: "nonPrimitive"
    }, {
        internalType: "any",
        mode: BindingMode.TwoWay,
        path: "nonPrimitive"
    }, {
        internalType: "any",
        mode: BindingMode.OneWay,
        path: "##@SAP_Common.Label"
    }].forEach(function (oFixture, i) {
    QUnit.test("checkUpdateInternal with object value, error, " + i, function (assert) {
        var bAbsolute = oFixture.path[0] === "/", oCache = bAbsolute && this.getPropertyCache(), oCacheMock = oCache && this.mock(oCache), oContext = Context.create(this.oModel, {}, "/EntitySet('foo')"), oBinding = this.oModel.bindProperty(oFixture.path, oContext), oGroupLock = {}, oMetaContext = {}, sResolvedPath = this.oModel.resolve(oFixture.path, oContext), vValue = {}, that = this;
        oBinding.setBindingMode(oFixture.mode);
        oBinding.setType(null, oFixture.internalType);
        if (bAbsolute) {
            this.mock(oBinding).expects("getGroupId").withExactArgs().returns("$auto");
            this.mock(oBinding).expects("lockGroup").withExactArgs("$auto").returns(oGroupLock);
            oCacheMock.expects("fetchValue").withExactArgs(sinon.match.same(oGroupLock), undefined, sinon.match.func, sinon.match.same(oBinding)).returns(SyncPromise.resolve(Promise.resolve().then(function () {
                that.mock(oBinding).expects("assertSameCache").withExactArgs(sinon.match.same(oCache));
                return vValue;
            })));
        }
        else if (oFixture.path.startsWith("##")) {
            this.mock(this.oModel.getMetaModel()).expects("getMetaContext").withExactArgs("/EntitySet('foo')").returns(oMetaContext);
            this.mock(this.oModel.getMetaModel()).expects("fetchObject").withExactArgs("@SAP_Common.Label", sinon.match.same(oMetaContext)).returns(SyncPromise.resolve(vValue));
        }
        else {
            this.mock(oContext).expects("fetchValue").withExactArgs(oBinding.sReducedPath, sinon.match.same(oBinding)).returns(SyncPromise.resolve(vValue));
        }
        this.mock(this.oModel.getMetaModel()).expects("fetchUI5Type").exactly(oFixture.internalType !== "any" ? 1 : 0).withExactArgs(sResolvedPath).returns(SyncPromise.resolve());
        this.oLogMock.expects("error").withExactArgs("Accessed value is not primitive", sResolvedPath, sClassName);
        return oBinding.checkUpdateInternal().then(function () {
            assert.strictEqual(oBinding.getValue(), undefined);
        });
    });
});
[false, undefined, null, 42, "foo"].forEach(function (vValue) {
    var sTitle = "checkUpdateInternal: no clone with primitive value: " + vValue;
    QUnit.test(sTitle, function (assert) {
        var oContext = Context.create(this.oModel, {}, "/EntitySet('foo')"), sPath = "primitive", oBinding = this.oModel.bindProperty(sPath, oContext);
        oBinding.setType(null, "any");
        this.mock(oContext).expects("fetchValue").withExactArgs(oBinding.sReducedPath, sinon.match.same(oBinding)).returns(SyncPromise.resolve(vValue));
        this.mock(_Helper).expects("publicClone").never();
        return oBinding.checkUpdateInternal().then(function () {
            assert.strictEqual(oBinding.getValue(), vValue);
        });
    });
});
QUnit.test("checkUpdateInternal(true): later call resets this.oContext", function () {
    var oParentBinding = {
        fetchIfChildCanUseCache: function () {
            return SyncPromise.resolve(Promise.resolve(true));
        }
    }, oModel = new ODataModel({
        autoExpandSelect: true,
        serviceUrl: "/service/?sap-client=111",
        synchronizationMode: "None"
    }), oContext = Context.create(oModel, oParentBinding, "/..."), oBinding = oModel.bindProperty("relative", oContext), oPromise0, oPromise1;
    this.mock(oModel.getMetaModel()).expects("fetchUI5Type").withExactArgs("/.../relative").returns(SyncPromise.resolve());
    this.mock(oBinding).expects("checkDataState").withExactArgs();
    oPromise0 = oBinding.checkUpdateInternal(true);
    oBinding.oContext = null;
    oPromise1 = oBinding.checkUpdateInternal(true);
    return Promise.all([oPromise0, oPromise1]);
});
QUnit.test("checkUpdateInternal(): unresolved path after setContext", function (assert) {
    var done = assert.async(), fnChangeHandler = function () {
        assert.strictEqual(this.getValue(), undefined, "value after context reset");
        done();
    }, that = this;
    this.createTextBinding(assert).then(function (oBinding) {
        that.mock(oBinding).expects("deregisterChange").withExactArgs();
        that.mock(oBinding).expects("checkUpdateInternal").withExactArgs(undefined, ChangeReason.Context).callThrough();
        assert.strictEqual(oBinding.getValue(), "value", "value before context reset");
        oBinding.attachChange(fnChangeHandler, oBinding);
        oBinding.setContext();
    });
});
QUnit.test("checkUpdateInternal(): read error", function (assert) {
    var oError = new Error("Expected failure");
    this.mock(this.oModel).expects("reportError").withExactArgs("Failed to read path /EntitySet('foo')/property", sClassName, sinon.match.same(oError));
    return this.createTextBinding(assert, 1, oError).then(function (oBinding) {
        var bChangeReceived = false;
        assert.strictEqual(oBinding.getValue(), "value", "value is set before failing read");
        oBinding.attachChange(function () {
            bChangeReceived = true;
        });
        return oBinding.checkUpdateInternal(false).then(function () {
            assert.strictEqual(oBinding.getValue(), undefined, "read error resets the value");
            assert.ok(bChangeReceived, "Value changed -> expecting change event");
        }, function () {
            assert.ok(false, "unexpected failure");
        });
    });
});
QUnit.test("checkUpdateInternal(): read error with force update", function (assert) {
    var done = assert.async(), oError = new Error("Expected failure");
    this.mock(this.oModel).expects("reportError").withExactArgs("Failed to read path /EntitySet('foo')/property", sClassName, sinon.match.same(oError));
    this.createTextBinding(assert, 1, oError).then(function (oBinding) {
        oBinding.attachChange(function () {
            done();
        });
        return oBinding.checkUpdateInternal(true);
    });
});
QUnit.test("checkUpdateInternal(): cancelled read", function (assert) {
    var oError = { canceled: true }, that = this;
    this.mock(this.oModel).expects("reportError").withExactArgs("Failed to read path /EntitySet('foo')/property", sClassName, sinon.match.same(oError));
    return this.createTextBinding(assert, 1, oError).then(function (oBinding) {
        oBinding.bInitial = "foo";
        that.mock(oBinding).expects("_fireChange").never();
        return oBinding.checkUpdateInternal(true).then(function () {
            assert.strictEqual(oBinding.bInitial, "foo", "bInitial unchanged");
        });
    });
});
QUnit.test("checkUpdateInternal(): absolute with sGroupId", function () {
    var oBinding, oCacheMock = this.getPropertyCacheMock(), oGroupLock = {};
    oBinding = this.oModel.bindProperty("/EntitySet('foo')/property");
    oBinding.setType(null, "any");
    this.mock(oBinding).expects("lockGroup").withExactArgs("group").returns(oGroupLock);
    oCacheMock.expects("fetchValue").withExactArgs(sinon.match.same(oGroupLock), undefined, sinon.match.func, oBinding).returns(SyncPromise.resolve());
    return oBinding.checkUpdateInternal(false, undefined, "group");
});
QUnit.test("checkUpdateInternal(): relative with sGroupId", function () {
    var oContext = Context.create(this.oModel, {}, "/Me"), oBinding = this.oModel.bindProperty("property", oContext);
    oBinding.setType(null, "any");
    this.mock(oContext).expects("fetchValue").withExactArgs(oBinding.sReducedPath, oBinding).returns(SyncPromise.resolve());
    return oBinding.checkUpdateInternal(false, undefined, "group");
});
["foo", false, undefined].forEach(function (vValue) {
    QUnit.test("checkUpdateInternal(): with vValue parameter: " + vValue, function (assert) {
        var oBinding = this.oModel.bindProperty("/absolute"), oPromise, oType = { getName: function () { } }, done = assert.async();
        this.mock(this.oModel.getMetaModel()).expects("fetchUI5Type").withExactArgs("/absolute").returns(SyncPromise.resolve(oType));
        oBinding.vValue = "";
        oBinding.attachChange(function () {
            assert.strictEqual(oBinding.getType(), oType);
            assert.strictEqual(oBinding.getValue(), vValue);
            done();
        });
        this.mock(oBinding.oCachePromise).expects("then").never();
        oPromise = oBinding.checkUpdateInternal(undefined, undefined, undefined, vValue);
        assert.ok(oPromise.isFulfilled());
        assert.strictEqual(oBinding.getValue(), vValue);
        return oPromise;
    });
});
[{
        contextPath: "/Artists('42')",
        path: "Name##@SAP_Common.Label"
    }, {
        contextPath: undefined,
        path: "/Artists('42')/Name##@SAP_Common.Label"
    }, {
        contextPath: "/Irrelevant",
        path: "/Artists('42')/Name##@SAP_Common.Label"
    }, {
        baseContext: true,
        contextPath: "/Artists('42')",
        path: "Name##@SAP_Common.Label"
    }, {
        contextPath: "/Artists('42')",
        path: "##/@SAP_Common.Label"
    }, {
        contextPath: "/Irrelevant",
        path: "/Artists('42')/Name##@SAP_Common.Label",
        virtualContext: true
    }].forEach(function (oFixture, i) {
    QUnit.test("checkUpdateInternal, meta path, resolved, " + i, function (assert) {
        var oBinding, bChangeFired, oContext, oMetaContext = {}, vValue = oFixture.virtualContext ? undefined : "Artist label";
        if (oFixture.contextPath) {
            oContext = oFixture.baseContext ? new BaseContext(this.oModel, oFixture.contextPath) : Context.create(this.oModel, {}, oFixture.contextPath, oFixture.virtualContext && Context.VIRTUAL);
        }
        this.mock(_Cache).expects("createProperty").never();
        oBinding = this.oModel.bindProperty(oFixture.path, oContext);
        this.mock(this.oModel.getMetaModel()).expects("getMetaContext").withExactArgs(oFixture.path.startsWith("##/") ? "/Artists('42')" : "/Artists('42')/Name").returns(oMetaContext);
        this.mock(this.oModel.getMetaModel()).expects("fetchObject").withExactArgs(oFixture.path.startsWith("##/") ? "./@SAP_Common.Label" : "@SAP_Common.Label", sinon.match.same(oMetaContext)).returns(SyncPromise.resolve(vValue));
        if (oContext && !oFixture.baseContext) {
            this.mock(oContext).expects("fetchValue").never();
        }
        this.mock(this.oModel.getMetaModel()).expects("fetchUI5Type").never();
        this.mock(oBinding).expects("fireDataRequested").never();
        this.mock(oBinding).expects("fireDataReceived").never();
        oBinding.attachChange(function () {
            bChangeFired = true;
        });
        return oBinding.checkUpdateInternal(oFixture.virtualContext).then(function () {
            assert.strictEqual(oBinding.getValue(), vValue);
            assert.ok(bChangeFired, "change event");
        });
    });
});
QUnit.test("checkUpdateInternal, meta path, unresolved", function (assert) {
    var oBinding = this.oModel.bindProperty("Name##@SAP_Common.Label", null);
    this.mock(this.oModel.getMetaModel()).expects("getMetaContext").never();
    this.mock(this.oModel.getMetaModel()).expects("fetchObject").never();
    this.mock(this.oModel.getMetaModel()).expects("fetchUI5Type").never();
    this.mock(oBinding).expects("fireDataRequested").never();
    this.mock(oBinding).expects("fireDataReceived").never();
    return oBinding.checkUpdateInternal().then(function () {
        assert.strictEqual(oBinding.getValue(), undefined);
    });
});
QUnit.test("checkUpdateInternal, meta path, targetType any", function (assert) {
    var oBinding, bChangeFired, oMetaContext = {}, oValue = {};
    this.mock(_Cache).expects("createProperty").never();
    oBinding = this.oModel.bindProperty("/Artists##@Capabilities.InsertRestrictions", null);
    oBinding.setBindingMode(BindingMode.OneTime);
    oBinding.setType(undefined, "any");
    this.mock(this.oModel.getMetaModel()).expects("getMetaContext").withExactArgs("/Artists").returns(oMetaContext);
    this.mock(this.oModel.getMetaModel()).expects("fetchObject").withExactArgs("@Capabilities.InsertRestrictions", sinon.match.same(oMetaContext)).returns(SyncPromise.resolve(oValue));
    this.mock(this.oModel.getMetaModel()).expects("fetchUI5Type").never();
    this.mock(oBinding).expects("fireDataRequested").never();
    this.mock(oBinding).expects("fireDataReceived").never();
    oBinding.attachChange(function () {
        assert.notOk(bChangeFired, "exactly one change event");
        bChangeFired = true;
    });
    return oBinding.checkUpdateInternal().then(function () {
        assert.strictEqual(oBinding.getValue(), oValue);
        assert.ok(bChangeFired, "change event");
    });
});
QUnit.test("isMeta", function (assert) {
    assert.strictEqual(this.oModel.bindProperty("foo", null).isMeta(), false);
    assert.strictEqual(this.oModel.bindProperty("foo#bar", null).isMeta(), false, "action advertisement");
    assert.strictEqual(this.oModel.bindProperty("foo##bar", null).isMeta(), true);
});
QUnit.test("ManagedObject.bindProperty w/ relative path, then bindObject", function (assert) {
    var oCacheMock = this.mock(_Cache), done = assert.async(), oControl = new TestControl({ models: this.oModel });
    oCacheMock.expects("createSingle").never();
    oControl.bindProperty("text", {
        path: "property",
        type: new TypeString()
    });
    oControl.getBinding("text").attachChange(function (oEvent) {
        assert.strictEqual(oEvent.getParameter("reason"), ChangeReason.Context);
        assert.strictEqual(oControl.getText(), "value");
        done();
    });
    oCacheMock.expects("createSingle").withExactArgs(sinon.match.object, "EntitySet('foo')", { "sap-client": "111" }, false, false, sinon.match.func).returns({
        fetchValue: function (_sGroupId, sPath) {
            assert.strictEqual(sPath, "property");
            return Promise.resolve("value");
        }
    });
    oControl.bindObject("/EntitySet('foo')");
});
QUnit.test("setContext on binding with absolute path", function (assert) {
    var oBinding = this.oModel.bindProperty("/EntitySet('foo')/property"), oContext = {};
    oBinding.sResumeChangeReason = ChangeReason.Change;
    this.mock(oBinding).expects("deregisterChange").never();
    this.mock(oBinding).expects("fetchCache").never();
    this.mock(oBinding).expects("checkUpdateInternal").never();
    oBinding.setContext(oContext);
    assert.strictEqual(oBinding.getContext(), oContext, "stored nevertheless");
    assert.strictEqual(oBinding.sResumeChangeReason, undefined);
});
["/EMPLOYEES(ID='1')/Name", "Name"].forEach(function (sPath) {
    QUnit.test("ManagedObject.bindProperty: type and value, path " + sPath, function (assert) {
        var that = this;
        return new Promise(function (finishTest) {
            var bAbsolute = sPath[0] === "/", oValue = "foo", oCache = {
                fetchValue: function (_oGroupLock, _sReadPath, fnDataRequested) {
                    return Promise.resolve().then(function () {
                        fnDataRequested();
                    }).then(function () {
                        return oValue;
                    });
                }
            }, oCacheMock = that.mock(_Cache), oContextBindingMock, sContextPath = "/EMPLOYEES(ID='42')", iDataReceivedCount = 0, iDataRequestedCount = 0, oControl = new TestControl({ models: that.oModel }), sResolvedPath, oType = new TypeString();
            oCacheMock.expects("createSingle").withExactArgs(sinon.match.same(that.oModel.oRequestor), sContextPath.slice(1), { "sap-client": "111" }, false, false, sinon.match.func);
            oControl.bindObject(sContextPath);
            oContextBindingMock = that.mock(oControl.getObjectBinding());
            if (bAbsolute) {
                sResolvedPath = sPath;
                oContextBindingMock.expects("fetchValue").never();
                oCacheMock.expects("createProperty").withExactArgs(sinon.match.same(that.oModel.oRequestor), sResolvedPath.slice(1), { "sap-client": "111" }).returns(oCache);
            }
            else {
                sResolvedPath = sContextPath + "/" + sPath;
                oContextBindingMock.expects("fetchValue").withExactArgs(sContextPath + "/" + sPath, sinon.match.object, undefined).returns(Promise.resolve(oValue));
            }
            that.mock(that.oModel.getMetaModel()).expects("fetchUI5Type").withExactArgs(sResolvedPath).returns(SyncPromise.resolve(oType));
            that.mock(oType).expects("formatValue").withExactArgs(oValue, "string");
            oControl.bindProperty("text", { path: sPath, events: {
                    change: function () {
                        var oBinding = oControl.getBinding("text");
                        assert.strictEqual(oBinding.getType(), oType);
                        assert.strictEqual(oBinding.getValue(), oValue);
                        if (!bAbsolute) {
                            assert.strictEqual(iDataRequestedCount, 0);
                            finishTest();
                        }
                    },
                    dataRequested: function (oEvent) {
                        assert.strictEqual(oEvent.getSource(), oControl.getBinding("text"), "dataRequested - correct source");
                        iDataRequestedCount += 1;
                    },
                    dataReceived: function (oEvent) {
                        var oBinding = oControl.getBinding("text");
                        assert.strictEqual(oEvent.getSource(), oControl.getBinding("text"), "dataReceived - correct source");
                        assert.deepEqual(oEvent.getParameter("data"), {});
                        assert.strictEqual(iDataRequestedCount, 1);
                        assert.strictEqual(oBinding.getType(), oType);
                        assert.strictEqual(oBinding.getValue(), oValue);
                        iDataReceivedCount += 1;
                        finishTest();
                    }
                } });
            assert.strictEqual(iDataRequestedCount, 0, "dataRequested not (yet) fired");
            assert.strictEqual(iDataReceivedCount, 0, "dataReceived not (yet) fired");
        });
    });
});
[
    {},
    []
].forEach(function (oValue) {
    QUnit.test("bindProperty with non-primitive " + JSON.stringify(oValue), function (assert) {
        var oBinding, oCache = {
            fetchValue: function (_sGroupId, _sPath, fnDataRequested) {
                fnDataRequested();
                return Promise.resolve(oValue);
            }
        }, oCacheMock = this.mock(_Cache), oControl = new TestControl({ models: this.oModel }), fnDone, oDataReceivedPromise = new Promise(function (resolve) {
            fnDone = resolve;
        }), sPath = "/path", oRawType = {
            formatValue: function (vValue) { return vValue; },
            getName: function () { return "foo"; }
        }, oSpy = this.spy(ODataPropertyBinding.prototype, "checkUpdateInternal");
        oCacheMock.expects("createProperty").returns(oCache);
        this.mock(ODataPropertyBinding.prototype).expects("isMeta").withExactArgs().returns(false);
        this.mock(this.oModel.getMetaModel()).expects("fetchUI5Type").withExactArgs(sPath).returns(SyncPromise.resolve(oRawType));
        this.oLogMock.expects("error").withExactArgs("Accessed value is not primitive", sPath, sClassName);
        oControl.bindProperty("text", { path: sPath, events: {
                dataReceived: function (oEvent) {
                    var oBinding = oControl.getBinding("text");
                    assert.strictEqual(oBinding.getType(), oRawType);
                    assert.strictEqual(oBinding.getValue(), undefined);
                    assert.deepEqual(oEvent.getParameter("data"), {});
                    assert.strictEqual(oEvent.getParameter("error"), undefined, "no read error");
                    fnDone();
                }
            } });
        oBinding = oControl.getBinding("text");
        return Promise.all([
            oDataReceivedPromise,
            oSpy.returnValues[0].then(function () {
                assert.strictEqual(oBinding.getType(), oRawType);
                assert.strictEqual(oBinding.getValue(), undefined);
            })
        ]);
    });
});
QUnit.test("dataReceived with error", function (assert) {
    var oError = new Error("Expected read failure"), oCache = {
        fetchValue: function (_sGroupId, _sPath, fnDataRequested) {
            fnDataRequested();
            return Promise.reject(oError);
        }
    }, done = assert.async(), oControl = new TestControl({ models: this.oModel });
    this.mock(_Cache).expects("createProperty").returns(oCache);
    this.mock(this.oModel).expects("reportError").withExactArgs("Failed to read path /path", sClassName, sinon.match.same(oError));
    oControl.bindProperty("text", { path: "/path", type: new TypeString(), events: {
            dataReceived: function (oEvent) {
                assert.strictEqual(oEvent.getParameter("error"), oError, "expected error");
                done();
            }
        } });
});
QUnit.test("bindProperty with non-primitive resets value", function (assert) {
    var oBinding, oCacheMock = this.getPropertyCacheMock(), bChangeReceived = false, done = assert.async(), sPath = "/EMPLOYEES(ID='1')/Name";
    oCacheMock.expects("fetchValue").withExactArgs(sinon.match.object, undefined, sinon.match.func, sinon.match.object).returns(SyncPromise.resolve("foo"));
    oCacheMock.expects("fetchValue").withExactArgs(sinon.match.object, undefined, sinon.match.func, sinon.match.object).returns(SyncPromise.resolve({}));
    this.oLogMock.expects("error").withExactArgs("Accessed value is not primitive", sPath, sClassName);
    oBinding = this.oModel.bindProperty(sPath);
    oBinding.attachChange(function () {
        bChangeReceived = true;
    });
    oBinding.setType(new TypeString());
    assert.ok(!bChangeReceived, "No Change event while initial");
    return oBinding.checkUpdateInternal(false).then(function () {
        assert.strictEqual(oBinding.getValue(), "foo");
        return oBinding.checkUpdateInternal(false).then(function () {
            assert.strictEqual(oBinding.getValue(), undefined, "Value reset");
            assert.ok(bChangeReceived, "Change event received");
            done();
        });
    });
});
QUnit.test("automaticTypes: type already set by app", function (assert) {
    var oControl = new TestControl({ models: this.oModel }), sPath = "/EMPLOYEES(ID='42')/Name", done = assert.async();
    this.getPropertyCacheMock().expects("fetchValue").withExactArgs(sinon.match.object, undefined, sinon.match.func, sinon.match.object).returns(SyncPromise.resolve("foo"));
    this.mock(this.oModel.getMetaModel()).expects("fetchUI5Type").never();
    oControl.bindProperty("text", {
        path: sPath,
        type: new TypeString()
    });
    oControl.getBinding("text").attachChange(function () {
        assert.strictEqual(oControl.getText(), "foo");
        done();
    });
});
QUnit.test("automaticTypes: targetType : 'any'", function (assert) {
    var oControl = new TestControl({ models: this.oModel }), sPath = "/EMPLOYEES(ID='42')/Name", done = assert.async();
    this.getPropertyCacheMock().expects("fetchValue").withExactArgs(sinon.match.object, undefined, sinon.match.func, sinon.match.object).returns(SyncPromise.resolve("foo"));
    this.mock(this.oModel.getMetaModel()).expects("fetchUI5Type").never();
    oControl.bindProperty("text", {
        path: sPath,
        targetType: "any"
    });
    oControl.getBinding("text").attachChange(function () {
        assert.strictEqual(oControl.getText(), "foo");
        done();
    });
});
QUnit.test("automaticTypes: formatter set by app", function (assert) {
    var oBinding, oControl = new TestControl({ models: this.oModel }), sPath = "/EMPLOYEES(ID='42')/Name", oType = new TypeString(), done = assert.async();
    this.getPropertyCacheMock().expects("fetchValue").withExactArgs(sinon.match.object, undefined, sinon.match.func, sinon.match.object).returns(SyncPromise.resolve("foo"));
    this.mock(this.oModel.getMetaModel()).expects("fetchUI5Type").withExactArgs(sPath).returns(SyncPromise.resolve(oType));
    this.mock(oType).expects("formatValue").withExactArgs("foo", "string").returns("*foo*");
    oControl.bindProperty("text", {
        path: sPath,
        formatter: function (sValue) {
            return "~" + sValue + "~";
        }
    });
    oBinding = oControl.getBinding("text");
    oBinding.attachChange(function () {
        assert.strictEqual(oBinding.getType(), oType);
        assert.strictEqual(oControl.getText(), "~*foo*~");
        done();
    });
});
[false, true].forEach(function (bForceUpdate) {
    QUnit.test("automaticTypes: failed type, bForceUpdate = " + bForceUpdate, function (assert) {
        var oBinding, done = assert.async(), oCacheMock = this.getPropertyCacheMock(), oControl = new TestControl({ models: this.oModel }), sPath = "/EMPLOYEES(ID='42')/Name", oRawType = {
            formatValue: function (vValue) { return vValue; },
            getName: function () { return "foo"; }
        };
        oCacheMock.expects("fetchValue").withExactArgs(sinon.match.object, undefined, sinon.match.func, sinon.match.object).returns(SyncPromise.resolve("foo"));
        oCacheMock.expects("fetchValue").withExactArgs(sinon.match.object, undefined, sinon.match.func, sinon.match.object).returns(SyncPromise.resolve("update"));
        this.mock(this.oModel.getMetaModel()).expects("fetchUI5Type").twice().withExactArgs(sPath).returns(SyncPromise.resolve(oRawType));
        function onChange() {
            oBinding.detachChange(onChange);
            oBinding.attachChange(done);
            setTimeout(function () {
                oBinding.checkUpdateInternal(bForceUpdate);
            }, 0);
        }
        oControl.bindProperty("text", sPath);
        oBinding = oControl.getBinding("text");
        oBinding.attachChange(onChange);
    });
});
QUnit.test("forbidden", function (assert) {
    var oBinding = this.oModel.bindProperty("Name");
    assert.throws(function () {
        oBinding.refresh();
    }, new Error("Refresh on this binding is not supported"));
    assert.throws(function () {
        oBinding.resume();
    }, new Error("Unsupported operation: resume"));
    assert.throws(function () {
        oBinding.suspend();
    }, new Error("Unsupported operation: suspend"));
});
QUnit.test("events", function (assert) {
    var oBinding, oBindingMock = this.mock(PropertyBinding.prototype), mEventParameters = {}, oReturn = {};
    oBinding = this.oModel.bindProperty("Name");
    ["AggregatedDataStateChange", "change", "dataReceived", "dataRequested", "DataStateChange"].forEach(function (sEvent) {
        oBindingMock.expects("attachEvent").withExactArgs(sEvent, sinon.match.same(mEventParameters)).returns(oReturn);
        assert.strictEqual(oBinding.attachEvent(sEvent, mEventParameters), oReturn);
    });
    assert.throws(function () {
        oBinding.attachEvent("unsupportedEvent");
    }, new Error("Unsupported event 'unsupportedEvent': v4.ODataPropertyBinding#attachEvent"));
});
QUnit.test("expression binding", function (assert) {
    var oCacheMock = this.mock(_Cache), oModel = new ODataModel({
        serviceUrl: "/service/",
        synchronizationMode: "None"
    }), oPromise = Promise.resolve("value"), oTestControl = new TestControl({
        text: "{= !${path:'@odata.etag',type:'sap.ui.model.odata.type.String'} }",
        models: oModel
    });
    oCacheMock.expects("createSingle").withExactArgs(sinon.match.object, "EntitySet('foo')", {}, false, false, sinon.match.func).returns({
        fetchValue: function () {
            return oPromise;
        }
    });
    oTestControl.bindObject("/EntitySet('foo')");
    assert.strictEqual(oTestControl.getText(), "true");
    return oPromise;
});
["/absolute", "relative"].forEach(function (sPath) {
    QUnit.test("$$groupId - sPath: " + sPath, function (assert) {
        var oBinding, oContext = this.oModel.createBindingContext("/absolute"), oModelMock = this.mock(this.oModel);
        oModelMock.expects("getGroupId").withExactArgs().returns("baz");
        oModelMock.expects("getUpdateGroupId").twice().withExactArgs().returns("fromModel");
        oBinding = this.oModel.bindProperty(sPath, oContext, { $$groupId: "foo" });
        assert.strictEqual(oBinding.getGroupId(), "foo");
        assert.strictEqual(oBinding.getUpdateGroupId(), "fromModel");
        oBinding = this.oModel.bindProperty(sPath, oContext, {});
        assert.strictEqual(oBinding.getGroupId(), "baz");
        assert.strictEqual(oBinding.getUpdateGroupId(), "fromModel");
    });
});
QUnit.test("$$ignoreMessages", function (assert) {
    var oPropertyBindingMock = this.mock(PropertyBinding.prototype), oBinding;
    oPropertyBindingMock.expects("setIgnoreMessages").never();
    oBinding = this.oModel.bindProperty("/foo");
    assert.strictEqual(oBinding.getIgnoreMessages(), undefined);
    oPropertyBindingMock.expects("setIgnoreMessages").withExactArgs(true).callThrough();
    oBinding = this.oModel.bindProperty("/foo", undefined, { $$ignoreMessages: true });
    assert.strictEqual(oBinding.getIgnoreMessages(), true);
    oPropertyBindingMock.expects("setIgnoreMessages").withExactArgs(false).callThrough();
    oBinding = this.oModel.bindProperty("/foo", undefined, { $$ignoreMessages: false });
    assert.strictEqual(oBinding.getIgnoreMessages(), false);
});
QUnit.test("supportsIgnoreMessages", function (assert) {
    assert.strictEqual(ODataPropertyBinding.prototype.supportsIgnoreMessages(), true);
});
QUnit.test("$$noPatch", function (assert) {
    var oBinding = this.oModel.bindProperty("/foo");
    assert.strictEqual(oBinding.bNoPatch, false);
    oBinding = this.oModel.bindProperty("/foo", undefined, { $$noPatch: true });
    assert.strictEqual(oBinding.bNoPatch, true);
});
[undefined, "$direct"].forEach(function (sGroupId) {
    QUnit.test("checkUpdateInternal, binding group ID " + sGroupId, function () {
        var oBinding = this.oModel.bindProperty("/absolute", undefined, { $$groupId: sGroupId }), sExpectedGroupId = sGroupId, oGroupLock = {}, oReadPromise = SyncPromise.resolve(), oTypePromise = SyncPromise.resolve(new TypeString());
        this.mock(this.oModel.getMetaModel()).expects("fetchUI5Type").returns(oTypePromise);
        if (!sGroupId) {
            this.mock(oBinding).expects("getGroupId").withExactArgs().returns("$auto");
            sExpectedGroupId = "$auto";
        }
        this.mock(oBinding).expects("lockGroup").withExactArgs(sExpectedGroupId).returns(oGroupLock);
        this.mock(oBinding.oCachePromise.getResult()).expects("fetchValue").withExactArgs(sinon.match.same(oGroupLock), undefined, sinon.match.func, sinon.match.object).callsArg(2).returns(oReadPromise);
        return oBinding.checkUpdateInternal();
    });
});
QUnit.test("initialize", function (assert) {
    var oBinding = this.oModel.bindProperty("/absolute");
    this.mock(oBinding).expects("getRootBinding").withExactArgs().returns(oBinding);
    this.mock(oBinding).expects("isSuspended").withExactArgs().returns(false);
    this.mock(oBinding).expects("checkUpdate").withExactArgs(true);
    oBinding.initialize();
    assert.strictEqual(oBinding.sResumeChangeReason, undefined);
});
QUnit.test("initialize: unresolved", function (assert) {
    var oBinding = this.oModel.bindProperty("relative");
    this.mock(oBinding).expects("getRootBinding").never();
    this.mock(oBinding).expects("checkUpdate").never();
    oBinding.initialize();
    assert.strictEqual(oBinding.sResumeChangeReason, undefined);
});
QUnit.test("initialize: suspended", function (assert) {
    var oContext = Context.create(this.oModel, {}, "/EntitySet('foo')"), oBinding = this.oModel.bindProperty("relative", oContext), oRootBinding = {
        isSuspended: function () { }
    };
    this.mock(oBinding).expects("getRootBinding").withExactArgs().returns(oRootBinding);
    this.mock(oRootBinding).expects("isSuspended").withExactArgs().returns(true);
    this.mock(oBinding).expects("checkUpdate").never();
    oBinding.initialize();
    assert.strictEqual(oBinding.sResumeChangeReason, ChangeReason.Change);
});
QUnit.test("onChange", function () {
    var oBinding = this.oModel.bindProperty("/absolute"), vValue = "foo";
    this.mock(oBinding).expects("checkUpdateInternal").withExactArgs(undefined, undefined, undefined, vValue);
    oBinding.onChange(vValue);
});
QUnit.test("setValue (absolute binding): forbidden", function (assert) {
    var oControl, done = assert.async(), that = this;
    this.getPropertyCacheMock().expects("fetchValue").withExactArgs(sinon.match.object, undefined, sinon.match.func, sinon.match.object).returns(SyncPromise.resolve("HT-1000's Name"));
    oControl = new TestControl({
        models: this.oModel,
        text: "{path : '/ProductList(\\'HT-1000\\')/Name'" + ", type : 'sap.ui.model.odata.type.String'}"
    });
    oControl.getBinding("text").attachChange(function () {
        that.mock(oControl.getBinding("text").oCachePromise.getResult()).expects("update").never();
        that.mock(oControl.getBinding("text")).expects("getResolvedPath").callThrough().twice();
        that.mock(that.oModel).expects("reportError").withExactArgs("Failed to update path /ProductList('HT-1000')/Name", sClassName, sinon.match({ message: "Cannot set value on this binding as it is not relative" + " to a sap.ui.model.odata.v4.Context" }));
        oControl.setText("foo");
        assert.strictEqual(oControl.getText(), "HT-1000's Name", "control change is rolled back");
        done();
    });
});
QUnit.test("setValue (binding with V2 context): forbidden", function (assert) {
    var oControl, done = assert.async(), that = this;
    this.getPropertyCacheMock().expects("fetchValue").withExactArgs(sinon.match.object, undefined, sinon.match.func, sinon.match.object).returns(SyncPromise.resolve("HT-1000's Name"));
    oControl = new TestControl({
        models: this.oModel,
        text: "{path : 'Name'" + ", type : 'sap.ui.model.odata.type.String'}"
    });
    oControl.setBindingContext(this.oModel.createBindingContext("/ProductList('HT-1000')"));
    oControl.getBinding("text").attachChange(function () {
        that.mock(oControl.getBinding("text").oCachePromise.getResult()).expects("update").never();
        that.mock(that.oModel).expects("reportError").withExactArgs("Failed to update path /ProductList('HT-1000')/Name", sClassName, sinon.match({ message: "Cannot set value on this binding as it is not relative" + " to a sap.ui.model.odata.v4.Context" }));
        oControl.setText("foo");
        assert.strictEqual(oControl.getText(), "HT-1000's Name", "control change is rolled back");
        done();
    });
});
QUnit.skip("setValue (absolute binding) via control or API", function (assert) {
    var oControl, oModel = new ODataModel({ serviceUrl: "/", synchronizationMode: "None" }), oPropertyBinding, oPropertyBindingCacheMock, fnRead = this.getPropertyCacheMock().expects("read");
    fnRead.withExactArgs("$auto", undefined, sinon.match.func, sinon.match.object).callsArg(2).returns(SyncPromise.resolve("HT-1000's Name"));
    oControl = new TestControl({
        models: oModel,
        text: "{parameters : {'$$groupId' : 'groupId', '$$updateGroupId' : 'updateGroupId'}" + ", path : '/ProductList(\\'HT-1000\\')/Name'" + ", type : 'sap.ui.model.odata.type.String'}"
    });
    oPropertyBinding = oControl.getBinding("text");
    oPropertyBindingCacheMock = this.mock(oPropertyBinding.oCachePromise.getResult());
    oPropertyBindingCacheMock.expects("update").withExactArgs("updateGroupId", "Name", "foo", "ProductList('HT-1000')").returns(Promise.resolve());
    assert.strictEqual(fnRead.args[0][3], oPropertyBinding, "binding passed itself as listener");
    oControl.setText("foo");
    assert.strictEqual(oPropertyBinding.getValue(), "foo");
    oPropertyBinding.setValue("foo");
    oPropertyBindingCacheMock.expects("update").withExactArgs("updateGroupId", "Name", "bar", "ProductList('HT-1000')").returns(Promise.resolve());
    oPropertyBinding.setValue("bar");
    assert.strictEqual(oControl.getText(), "bar");
});
[{}, Function].forEach(function (vValue) {
    QUnit.test("setValue: Not a primitive value: " + vValue, function (assert) {
        var oError = new Error("Not a primitive value"), oPropertyBinding = this.oModel.bindProperty("/absolute"), oModelMock = this.mock(this.oModel);
        oPropertyBinding.vValue = "fromServer";
        oModelMock.expects("reportError").withExactArgs("Failed to update path /absolute", sClassName, sinon.match({ message: oError.message }));
        this.mock(this.oModel.oMetaModel).expects("fetchUpdateData").never();
        this.mock(oPropertyBinding).expects("withCache").never();
        assert.throws(function () {
            oPropertyBinding.setValue(vValue);
        }, oError);
        assert.strictEqual(oPropertyBinding.getValue(), "fromServer");
    });
});
QUnit.skip("setValue (absolute binding): error handling", function (assert) {
    var sMessage = "This call intentionally failed", oError = new Error(sMessage), oModel = new ODataModel({
        groupId: "$direct",
        serviceUrl: "/service/?sap-client=111",
        synchronizationMode: "None"
    }), oPromise = Promise.reject(oError), oPropertyBinding = oModel.bindProperty("/ProductList('0')/Name");
    this.mock(oPropertyBinding.oCache).expects("update").withExactArgs("$direct", "Name", "foo", "ProductList('0')").returns(oPromise);
    this.oLogMock.expects("error").withExactArgs(sMessage, oError.stack, sClassName);
    oPropertyBinding.setValue("foo");
    assert.strictEqual(oPropertyBinding.getValue(), "foo", "keep user input");
    return oPromise.catch(function () { });
});
["foo", null].forEach(function (vValue) {
    var sTitle = "setValue (relative binding) via control, value : " + vValue;
    QUnit.test(sTitle, function () {
        var oParentBinding = this.oModel.bindContext("/BusinessPartnerList('0100000000')"), oContext = oParentBinding.getBoundContext(), oBinding = this.oModel.bindProperty("Address/City", oContext), oGroupLock = {};
        oBinding.vValue = "";
        this.mock(oBinding).expects("checkSuspended").withExactArgs();
        this.mock(this.oModel).expects("checkGroupId").withExactArgs("up");
        this.mock(oBinding).expects("lockGroup").withExactArgs("up", true, true).returns(oGroupLock);
        this.mock(oContext).expects("doSetProperty").withExactArgs("Address/City", sinon.match.same(vValue), sinon.match.same(oGroupLock)).returns(SyncPromise.resolve());
        oBinding.setValue(vValue, "up");
    });
});
QUnit.test("setValue with $$noPatch", function (assert) {
    var oParentBinding = this.oModel.bindContext("/ProductList('HT-1000')"), oContext = oParentBinding.getBoundContext(), oContextMock = this.mock(oContext), oBinding = this.oModel.bindProperty("Name", oContext, { $$noPatch: true }), oGroupIdNoPatchError = new Error("Must not specify a group ID (group) with $$noPatch"), oIntentionallyFailedError = new Error("This call intentionally failed"), oModelMock = this.mock(this.oModel), oUpdatePromise = SyncPromise.reject(oIntentionallyFailedError);
    oModelMock.expects("lockGroup").never();
    this.mock(oBinding).expects("checkSuspended").thrice().withExactArgs();
    oContextMock.expects("doSetProperty").withExactArgs("Name", "foo", null).returns(SyncPromise.resolve());
    oBinding.setValue("foo");
    oContextMock.expects("doSetProperty").withExactArgs("Name", "bar", null).returns(oUpdatePromise);
    oModelMock.expects("reportError").withExactArgs("Failed to update path /ProductList('HT-1000')/Name", sClassName, sinon.match.same(oIntentionallyFailedError));
    oBinding.setValue("bar");
    oModelMock.expects("reportError").withExactArgs("Failed to update path /ProductList('HT-1000')/Name", sClassName, sinon.match({ message: oGroupIdNoPatchError.message }));
    assert.throws(function () {
        oBinding.setValue("baz", "group");
    }, oGroupIdNoPatchError);
});
QUnit.test("setValue (relative binding): error handling", function () {
    var oContext = Context.create(this.oModel, {}, "/ProductList('HT-1000')"), oError = new Error("This call intentionally failed"), oGroupLock = { unlock: function () { } }, oPropertyBinding = this.oModel.bindProperty("Name", oContext), oUpdatePromise = Promise.reject(oError);
    oPropertyBinding.vValue = "fromServer";
    this.mock(oPropertyBinding).expects("checkSuspended").withExactArgs();
    this.mock(oPropertyBinding).expects("lockGroup").withExactArgs("up", true, true).returns(oGroupLock);
    this.mock(oContext).expects("doSetProperty").withExactArgs("Name", "foo", sinon.match.same(oGroupLock)).returns(oUpdatePromise);
    this.mock(oGroupLock).expects("unlock").withExactArgs(true);
    this.mock(this.oModel).expects("reportError").withExactArgs("Failed to update path /ProductList('HT-1000')/Name", sClassName, sinon.match.same(oError));
    oPropertyBinding.setValue("foo", "up");
    return oUpdatePromise.catch(function () { });
});
QUnit.test("setValue (relative binding): unset", function (assert) {
    var oContext = Context.create(this.oModel, {}, "/ProductList('HT-1000')"), oError = new Error("Must not change a property before it has been read"), oPropertyBinding = this.oModel.bindProperty("Name", oContext);
    this.mock(oPropertyBinding).expects("checkSuspended").withExactArgs();
    assert.strictEqual(oPropertyBinding.vValue, undefined);
    this.mock(oContext).expects("doSetProperty").never();
    this.mock(this.oModel).expects("reportError").withExactArgs("Failed to update path /ProductList('HT-1000')/Name", sClassName, sinon.match({ message: oError.message }));
    assert.throws(function () {
        oPropertyBinding.setValue("foo");
    }, oError);
    assert.strictEqual(oPropertyBinding.vValue, undefined);
});
QUnit.test("setValue (relative binding): unchanged", function () {
    var oContext = Context.create(this.oModel, {}, "/ProductList('HT-1000')"), oPropertyBinding = this.oModel.bindProperty("Name", oContext);
    oPropertyBinding.vValue = "foo";
    this.mock(oPropertyBinding).expects("checkSuspended").withExactArgs();
    this.mock(oContext).expects("doSetProperty").never();
    oPropertyBinding.setValue("foo");
});
QUnit.test("setType: calls setV4 automatically", function () {
    var oDateTimeOffset = {
        getName: function () { return "sap.ui.model.odata.type.DateTimeOffset"; },
        setV4: function () { }
    }, oSomeType = {
        getName: function () { return "it.s.not.me"; },
        setV4: function () { }
    }, oPropertyBinding = this.oModel.bindProperty("/absolute");
    this.mock(oDateTimeOffset).expects("setV4");
    this.mock(oSomeType).expects("setV4").never();
    oPropertyBinding.setType(null);
    oPropertyBinding.setType(oDateTimeOffset);
    oPropertyBinding.setType(oSomeType);
});
QUnit.test("setType: change events", function (assert) {
    return this.createTextBinding(assert).then(function (oBinding) {
        var sChangeReason, oSomeType = {
            getName: function () { return "foo"; },
            formatValue: function (vValue) { return vValue; }
        };
        oBinding.attachChange(function (oEvent) {
            sChangeReason = oEvent.getParameter("reason");
            assert.strictEqual(oBinding.getType(), oSomeType);
        });
        oBinding.setType(oSomeType);
        assert.strictEqual(sChangeReason, ChangeReason.Change);
        sChangeReason = undefined;
        oBinding.setType(oSomeType);
        assert.strictEqual(sChangeReason, undefined, "no event for same type");
    });
});
[false, true].forEach(function (bCheckUpdate) {
    QUnit.test("refreshInternal: bCheckUpdate = " + bCheckUpdate, function (assert) {
        var oBinding = this.oModel.bindProperty("NAME"), oCheckUpdatePromise = {}, oContext = Context.create(this.oModel, {}, "/EMPLOYEES/42"), that = this;
        oBinding.oContext = oContext;
        this.mock(oBinding).expects("isRootBindingSuspended").withExactArgs().returns(false);
        this.mock(oBinding.oCachePromise).expects("then").callsFake(function (fnThen) {
            that.mock(oBinding).expects("fetchCache").withExactArgs(oContext, false, true);
            that.mock(oBinding).expects("checkUpdateInternal").exactly(bCheckUpdate ? 1 : 0).withExactArgs(undefined, ChangeReason.Refresh, "myGroup").returns(oCheckUpdatePromise);
            return Promise.resolve().then(fnThen);
        });
        return oBinding.refreshInternal("", "myGroup", bCheckUpdate).then(function (vResult) {
            assert.strictEqual(vResult, bCheckUpdate ? oCheckUpdatePromise : undefined);
        });
    });
});
QUnit.test("refreshInternal: suspended", function (assert) {
    var oBinding = this.oModel.bindProperty("NAME"), oBindingMock = this.mock(oBinding);
    oBindingMock.expects("isRootBindingSuspended").withExactArgs().returns(true);
    oBindingMock.expects("fetchCache").never();
    oBindingMock.expects("checkUpdateInternal").never();
    assert.strictEqual(oBinding.refreshInternal("myGroup", true).isFulfilled(), true);
    assert.strictEqual(oBinding.sResumeChangeReason, ChangeReason.Refresh);
});
QUnit.test("destroy", function (assert) {
    var oPropertyBinding = this.oModel.bindProperty("Name");
    oPropertyBinding.oCheckUpdateCallToken = {};
    oPropertyBinding.vValue = "foo";
    this.mock(oPropertyBinding).expects("deregisterChange").withExactArgs();
    this.mock(this.oModel).expects("bindingDestroyed").withExactArgs(sinon.match.same(oPropertyBinding));
    this.mock(asODataBinding.prototype).expects("destroy").on(oPropertyBinding).withExactArgs();
    this.mock(PropertyBinding.prototype).expects("destroy").on(oPropertyBinding);
    oPropertyBinding.destroy();
    assert.strictEqual(oPropertyBinding.oCheckUpdateCallToken, undefined);
    assert.strictEqual(oPropertyBinding.vValue, undefined);
    assert.strictEqual(oPropertyBinding.mQueryOptions, undefined);
});
["getValueListType", "requestValueListType"].forEach(function (sFunctionName) {
    QUnit.test(sFunctionName + ": forward", function (assert) {
        var oContext = Context.create(this.oModel, {}, "/ProductList('42')"), oPropertyBinding = this.oModel.bindProperty("Category", oContext), vResult = {};
        this.mock(oPropertyBinding).expects("getResolvedPath").withExactArgs().returns("~");
        this.mock(this.oModel.getMetaModel()).expects(sFunctionName).withExactArgs("~").returns(vResult);
        assert.strictEqual(oPropertyBinding[sFunctionName](), vResult);
    });
});
QUnit.test("requestValueListInfo : forward", function (assert) {
    var bAutoExpandSelect = {}, oContext = Context.create(this.oModel, {}, "/ProductList('42')"), oPropertyBinding = this.oModel.bindProperty("Category", oContext), vResult = {};
    this.mock(oPropertyBinding).expects("getResolvedPath").withExactArgs().returns("~");
    this.mock(this.oModel.getMetaModel()).expects("requestValueListInfo").withExactArgs("~", sinon.match.same(bAutoExpandSelect), sinon.match.same(oContext)).returns(vResult);
    assert.strictEqual(oPropertyBinding.requestValueListInfo(bAutoExpandSelect), vResult);
});
[
    "getValueListType",
    "requestValueListType",
    "requestValueListInfo"
].forEach(function (sFunctionName) {
    QUnit.test(sFunctionName + ": unresolved", function (assert) {
        var oPropertyBinding = this.oModel.bindProperty("Category");
        this.mock(this.oModel).expects("resolve").withExactArgs(oPropertyBinding.sPath, undefined).returns(undefined);
        assert.throws(function () {
            oPropertyBinding[sFunctionName]();
        }, new Error(oPropertyBinding + " is unresolved"));
    });
});
QUnit.test("doFetchQueryOptions", function (assert) {
    var oBinding = this.oModel.bindProperty("path", undefined, { custom: "foo" }), oPromise;
    this.mock(oBinding).expects("isRoot").withExactArgs().returns(true);
    assert.deepEqual(oBinding.doFetchQueryOptions().getResult(), { custom: "foo" });
    oBinding = this.oModel.bindProperty("path", undefined, { custom: "foo" });
    this.mock(oBinding).expects("isRoot").withExactArgs().returns(false);
    oPromise = oBinding.doFetchQueryOptions();
    assert.deepEqual(oPromise.getResult(), {});
});
QUnit.test("doCreateCache", function (assert) {
    var oBinding = this.oModel.bindProperty("/EMPLOYEES('1')/Name"), oCache = {}, mCacheQueryOptions = {};
    this.mock(_Cache).expects("createProperty").withExactArgs(sinon.match.same(this.oModel.oRequestor), "EMPLOYEES('1')/Name", sinon.match.same(mCacheQueryOptions)).returns(oCache);
    assert.strictEqual(oBinding.doCreateCache("EMPLOYEES('1')/Name", mCacheQueryOptions), oCache);
});
QUnit.test("resetInvalidDataState", function () {
    var oBinding = this.oModel.bindProperty("/EMPLOYEES('1')/AGE"), oBindingMock = this.mock(oBinding);
    oBindingMock.expects("_fireChange").never();
    oBinding.resetInvalidDataState();
    oBinding.getDataState().setInvalidValue("foo");
    oBindingMock.expects("_fireChange").withExactArgs({ reason: ChangeReason.Change });
    oBinding.resetInvalidDataState();
});
QUnit.test("deregisterChange", function () {
    var oBinding = this.oModel.bindProperty("/EMPLOYEES('1')/AGE"), oMock, oOtherBinding = {
        doDeregisterChangeListener: function () { }
    }, sPath = "foo";
    oMock = this.mock(oBinding).expects("withCache").withExactArgs(sinon.match.func).returns(SyncPromise.resolve());
    oBinding.deregisterChange();
    this.mock(oOtherBinding).expects("doDeregisterChangeListener").withExactArgs(sPath, sinon.match.same(oBinding));
    oMock.firstCall.args[0](null, sPath, oOtherBinding);
});
QUnit.test("deregisterChange: withCache rejects sync", function () {
    var oBinding = this.oModel.bindProperty("/EMPLOYEES('1')/AGE"), oError = new Error("fail intentionally");
    this.mock(oBinding).expects("withCache").returns(SyncPromise.reject(oError));
    this.mock(this.oModel).expects("reportError").withExactArgs("Error in deregisterChange", sClassName, sinon.match.same(oError));
    oBinding.deregisterChange();
});
QUnit.test("visitSideEffects", function () {
    var oBinding = this.oModel.bindProperty("/EMPLOYEES('1')/AGE");
    oBinding.visitSideEffects();
});
[
    { checkUpdate: false, parentHasChanges: {} },
    { checkUpdate: true, parentHasChanges: false },
    { checkUpdate: true, parentHasChanges: true }
].forEach(function (oFixture) {
    var sTitle = "resumeInternal: bCheckUpdate=" + oFixture.checkUpdate + " parentHasChanges =" + oFixture.parentHasChanges;
    QUnit.test(sTitle, function (assert) {
        var oContext = Context.create(this.oModel, {}, "/ProductList('42')"), oBinding = this.oModel.bindProperty("Category", oContext), oBindingMock = this.mock(oBinding), bForceUpdate = oFixture.parentHasChanges ? undefined : false, sResumeChangeReason = {};
        oBinding.sResumeChangeReason = sResumeChangeReason;
        oBindingMock.expects("fetchCache").withExactArgs(sinon.match.same(oContext));
        oBindingMock.expects("checkUpdateInternal").exactly(oFixture.checkUpdate ? 1 : 0).withExactArgs(bForceUpdate, sinon.match.same(sResumeChangeReason)).callsFake(function () {
            assert.strictEqual(oBinding.sResumeChangeReason, undefined);
        });
        oBinding.resumeInternal(oFixture.checkUpdate, oFixture.parentHasChanges);
    });
});
QUnit.test("getDependentBindings", function (assert) {
    var oBinding = this.oModel.bindProperty("/EMPLOYEES('1')/AGE"), aDependentBindings;
    aDependentBindings = oBinding.getDependentBindings();
    assert.deepEqual(aDependentBindings, []);
    assert.strictEqual(oBinding.getDependentBindings(), aDependentBindings, "share empty array");
    assert.throws(function () {
        aDependentBindings.push("foo");
    });
});
QUnit.test("hasPendingChangesInDependents", function (assert) {
    var oBinding = this.oModel.bindProperty("/EMPLOYEES('1')/AGE");
    assert.strictEqual(oBinding.hasPendingChangesInDependents(), false);
});
QUnit.test("resetChangesInDependents", function () {
    var oBinding = this.oModel.bindProperty("/EMPLOYEES('1')/AGE");
    oBinding.resetChangesInDependents();
});
QUnit.test("getResumePromise", function (assert) {
    var oBinding = this.oModel.bindProperty("/EMPLOYEES('1')/AGE");
    assert.strictEqual(oBinding.getResumePromise(), undefined);
});
QUnit.test("requestValue", function (assert) {
    var oBinding = this.oModel.bindProperty("/EMPLOYEES('1')/AGE"), oPromise;
    this.mock(oBinding).expects("checkUpdateInternal").withExactArgs(false).returns(SyncPromise.resolve(Promise.resolve()));
    this.mock(oBinding).expects("getValue").returns("42");
    oPromise = oBinding.requestValue();
    assert.ok(oPromise instanceof Promise);
    return oPromise.then(function (vValue) {
        assert.strictEqual(vValue, "42");
    });
});
if (TestUtils.isRealOData()) {
    QUnit.test("PATCH an entity", function () {
        var oModel = new ODataModel({
            serviceUrl: sServiceUrl,
            synchronizationMode: "None"
        }), oControl = new TestControl({
            models: oModel,
            objectBindings: "/BusinessPartnerList('0100000000')",
            text: "{path : 'PhoneNumber', type : 'sap.ui.model.odata.type.String'}"
        }), oBinding = oControl.getBinding("text");
        return new Promise(function (resolve, reject) {
            oBinding.attachEventOnce("change", function () {
                var sPhoneNumber = !oControl.getText().includes("/") ? "06227/34567" : "0622734567";
                oControl.setText(sPhoneNumber);
                oBinding.getContext().getBinding().attachEventOnce("patchCompleted", function (oEvent) {
                    if (oEvent.getParameter("success")) {
                        resolve();
                    }
                    else {
                        reject(new Error("Unexpected error"));
                    }
                });
            });
        });
    });
}