import Log from "sap/base/Log";
import ODataTreeBindingFlat from "sap/ui/model/odata/ODataTreeBindingFlat";
import TestUtils from "sap/ui/test/TestUtils";
QUnit.module("sap.ui.model.odata.ODataTreeBindingFlat (ODataTreeBindingFlatNoFakeService)", {
    beforeEach: function () {
        this.oLogMock = this.mock(Log);
        this.oLogMock.expects("error").never();
        this.oLogMock.expects("warning").never();
    },
    afterEach: function (assert) {
        return TestUtils.awaitRendering();
    }
});
[{ Foo: true }, {}].forEach(function (mChangedEntities, i) {
    QUnit.test("_hasChangedEntity: no changes detected, " + i, function (assert) {
        var oBinding = {
            _map: function () { }
        }, bResult;
        this.mock(oBinding).expects("_map").withExactArgs(sinon.match.func).callsFake(function (fnMap) {
            var oRecursionBreaker = { broken: false };
            fnMap({ key: "notMatched" }, oRecursionBreaker);
            assert.strictEqual(oRecursionBreaker.broken, false);
        });
        bResult = ODataTreeBindingFlat.prototype._hasChangedEntity.call(oBinding, mChangedEntities);
        assert.strictEqual(bResult, false);
    });
});
[{
        call0: { bBrokenValue: true, sKey: "~changedEntityKey" }
    }, {
        call0: { bBrokenValue: false, sKey: "foo" },
        call1: { bBrokenValue: true, sKey: "~changedEntityKey" }
    }].forEach(function (oFixture, i) {
    QUnit.test("_hasChangedEntity: changes detected, " + i, function (assert) {
        var oBinding = {
            _map: function () { }
        }, mChangedEntities = { "~changedEntityKey": true }, bResult;
        this.mock(oBinding).expects("_map").withExactArgs(sinon.match.func).callsFake(function (fnMap) {
            var oRecursionBreaker = { broken: false };
            fnMap({ key: oFixture.call0.sKey }, oRecursionBreaker);
            assert.strictEqual(oRecursionBreaker.broken, oFixture.call0.bBrokenValue, "key: " + oFixture.call0.sKey);
            if (!oRecursionBreaker.broken) {
                fnMap({ key: oFixture.call1.sKey }, oRecursionBreaker);
                assert.strictEqual(oRecursionBreaker.broken, oFixture.call1.bBrokenValue, "key: " + oFixture.call1.sKey);
            }
        });
        bResult = ODataTreeBindingFlat.prototype._hasChangedEntity.call(oBinding, mChangedEntities);
        assert.strictEqual(bResult, true);
    });
});
QUnit.test("getContexts: delegates to _getContextsOrNodes", function (assert) {
    this.mock(ODataTreeBindingFlat.prototype).expects("_getContextsOrNodes").withExactArgs(false, "~iStartIndex", "~iLength", "~iThreshold").returns("~result");
    assert.strictEqual(ODataTreeBindingFlat.prototype.getContexts.call(ODataTreeBindingFlat.prototype, "~iStartIndex", "~iLength", "~iThreshold"), "~result");
});
QUnit.test("getNodes: delegates to _getContextsOrNodes", function (assert) {
    this.mock(ODataTreeBindingFlat.prototype).expects("_getContextsOrNodes").withExactArgs(true, "~iStartIndex", "~iLength", "~iThreshold").returns("~result");
    assert.strictEqual(ODataTreeBindingFlat.prototype.getNodes.call(ODataTreeBindingFlat.prototype, "~iStartIndex", "~iLength", "~iThreshold"), "~result");
});
QUnit.test("_getContextsOrNodes: unresolved binding", function (assert) {
    var oBinding = {
        isResolved: function () { }
    };
    this.mock(oBinding).expects("isResolved").withExactArgs().returns(false);
    assert.deepEqual(ODataTreeBindingFlat.prototype._getContextsOrNodes.call(oBinding), []);
});
QUnit.test("_getCorrectChangeGroup: getResolvedPath is called", function (assert) {
    var oBinding = {
        oModel: { _resolveGroup: function () { } },
        getResolvedPath: function () { }
    };
    this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
    this.mock(oBinding.oModel).expects("_resolveGroup").withExactArgs("~resolvedPath").returns({ groupId: "~changeGroup" });
    assert.strictEqual(ODataTreeBindingFlat.prototype._getCorrectChangeGroup.call(oBinding), "~changeGroup");
});
QUnit.test("createEntry: getResolvedPath is called", function (assert) {
    var oBinding = {
        getResolvedPath: function () { }
    };
    this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns(undefined);
    this.oLogMock.expects("warning").withExactArgs("ODataTreeBindingFlat: createEntry failed, as the binding path could not" + " be resolved.");
    assert.strictEqual(ODataTreeBindingFlat.prototype.createEntry.call(oBinding), undefined);
});
QUnit.test("submitChanges: getResolvedPath is called", function (assert) {
    var oBinding = {
        _optimizeChanges: function () { },
        getResolvedPath: function () { }
    };
    this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns(undefined);
    this.mock(oBinding).expects("_optimizeChanges").withExactArgs().returns(undefined);
    this.oLogMock.expects("warning").withExactArgs("ODataTreeBindingFlat: submitChanges failed, because the binding-path" + " could not be resolved.");
    ODataTreeBindingFlat.prototype.submitChanges.call(oBinding);
});
["~sNewlyGeneratedId", undefined].forEach(function (sNewlyGeneratedId) {
    [true, false, undefined].forEach(function (bIsTransient) {
        var sTitle = "_ensureHierarchyNodeIDForContext: use isTransient, bIsTransient=" + bIsTransient + ", sNewlyGeneratedId=" + sNewlyGeneratedId;
        QUnit.test(sTitle, function (assert) {
            var oBinding = {
                oModel: { setProperty: function () { } },
                oTreeProperties: { "hierarchy-node-for": "foo" }
            }, oContext = {
                getProperty: function () { },
                isTransient: function () { }
            };
            this.mock(oContext).expects("getProperty").withExactArgs("foo").returns(sNewlyGeneratedId);
            this.mock(oContext).expects("isTransient").withExactArgs().returns(bIsTransient);
            this.mock(oBinding.oModel).expects("setProperty").withExactArgs("foo", sinon.match.string, sinon.match.same(oContext)).exactly(bIsTransient !== true || sNewlyGeneratedId ? 0 : 1);
            ODataTreeBindingFlat.prototype._ensureHierarchyNodeIDForContext.call(oBinding, oContext);
        });
    });
});