import Log from "sap/base/Log";
import ChangeReason from "sap/ui/model/ChangeReason";
import TreeAutoExpandMode from "sap/ui/model/TreeAutoExpandMode";
import TreeBinding from "sap/ui/model/TreeBinding";
import TreeBindingAdapter from "sap/ui/model/TreeBindingAdapter";
import TestUtils from "sap/ui/test/TestUtils";
QUnit.module("sap.ui.model.TreeBindingAdapter", {
    beforeEach: function () {
        this.oLogMock = this.mock(Log);
        this.oLogMock.expects("error").never();
        this.oLogMock.expects("warning").never();
    },
    afterEach: function (assert) {
        return TestUtils.awaitRendering();
    }
});
[{
        mParameters: undefined,
        sAutoExpandMode: TreeAutoExpandMode.Sequential,
        bCollapseRecursive: true
    }, {
        mParameters: { collapseRecursive: false },
        sAutoExpandMode: TreeAutoExpandMode.Sequential,
        bCollapseRecursive: false
    }, {
        mParameters: { collapseRecursive: null },
        sAutoExpandMode: TreeAutoExpandMode.Sequential,
        bCollapseRecursive: false
    }, {
        mParameters: { autoExpandMode: "~autoExpandMode", collapseRecursive: true },
        sAutoExpandMode: "~autoExpandMode",
        bCollapseRecursive: true
    }, {
        mParameters: { collapseRecursive: "truthy" },
        sAutoExpandMode: TreeAutoExpandMode.Sequential,
        bCollapseRecursive: true
    }].forEach(function (oFixture) {
    QUnit.test("initialization: applying on TreeBinding instance", function (assert) {
        var oBinding = new TreeBinding({}, "/path", undefined, undefined, oFixture.mParameters), aMethodNames = Object.keys(TreeBindingAdapter.prototype);
        aMethodNames.forEach(function (sMethodName) {
            oBinding[sMethodName] = function () { };
        });
        assert.strictEqual(oBinding._bIsAdapted, undefined);
        this.mock(TreeBindingAdapter.prototype).expects("_createTreeState").withExactArgs();
        this.mock(TreeBindingAdapter.prototype).expects("setAutoExpandMode").withExactArgs(oFixture.sAutoExpandMode);
        TreeBindingAdapter.apply(oBinding);
        aMethodNames.forEach(function (sMethodName) {
            assert.strictEqual(oBinding[sMethodName], TreeBindingAdapter.prototype[sMethodName]);
        });
        assert.strictEqual(oBinding.bCollapseRecursive, oFixture.bCollapseRecursive);
        assert.strictEqual(oBinding._bIsAdapted, true);
        assert.strictEqual(oBinding._iPageSize, 0);
        if (!oFixture.mParameters) {
            assert.deepEqual(oBinding.mParameters, {});
        }
        else {
            assert.strictEqual(oBinding.mParameters, oFixture.mParameters);
        }
        assert.deepEqual(oBinding._aRowIndexMap, []);
        assert.strictEqual(oBinding._iThreshold, 0);
    });
});
QUnit.test("initialization: skipped for non-TreeBinding", function (assert) {
    var oBinding = {}, aMethodNames = Object.keys(TreeBindingAdapter.prototype);
    aMethodNames.forEach(function (sMethodName) {
        oBinding[sMethodName] = function () { };
    });
    TreeBindingAdapter.apply(oBinding);
    aMethodNames.forEach(function (sMethodName) {
        assert.notStrictEqual(oBinding[sMethodName], TreeBindingAdapter.prototype[sMethodName]);
    });
});
QUnit.test("initialization: skip if already applied", function (assert) {
    var oBinding = new TreeBinding({}, "/path"), aMethodNames = Object.keys(TreeBindingAdapter.prototype);
    oBinding._bIsAdapted = true;
    oBinding._iThreshold = "~_iThreshold";
    TreeBindingAdapter.apply(oBinding);
    aMethodNames.forEach(function (sMethodName) {
        assert.notStrictEqual(oBinding[sMethodName], TreeBindingAdapter.prototype[sMethodName]);
    });
    assert.strictEqual(oBinding._iThreshold, "~_iThreshold");
});
QUnit.test("getContexts: delegates to _getContextsOrNodes", function (assert) {
    var oBinding = new TreeBinding({}, "/path");
    TreeBindingAdapter.apply(oBinding);
    this.mock(oBinding).expects("_getContextsOrNodes").withExactArgs(false, "~iStartIndex", "~iLength", "~iThreshold").returns("~result");
    assert.strictEqual(oBinding.getContexts("~iStartIndex", "~iLength", "~iThreshold"), "~result");
});
QUnit.test("getNodes: delegates to _getContextsOrNodes", function (assert) {
    var oBinding = new TreeBinding({}, "/path");
    TreeBindingAdapter.apply(oBinding);
    this.mock(oBinding).expects("_getContextsOrNodes").withExactArgs(true, "~iStartIndex", "~iLength", "~iThreshold").returns("~result");
    assert.strictEqual(oBinding.getNodes("~iStartIndex", "~iLength", "~iThreshold"), "~result");
});
QUnit.test("_getContextsOrNodes: unresolved binding", function (assert) {
    var oBinding = {
        isResolved: function () { }
    };
    this.mock(oBinding).expects("isResolved").withExactArgs().returns(false);
    assert.deepEqual(TreeBindingAdapter.prototype._getContextsOrNodes.call(oBinding), []);
});
[undefined, true].forEach(function (bCollapseRecursive, i) {
    QUnit.test("collapseToLevel: set number of expanded levels, " + i, function (assert) {
        var oBinding = {
            bCollapseRecursive: bCollapseRecursive,
            _fireChange: function () { },
            _mTreeState: {
                expanded: {}
            },
            setNumberOfExpandedLevels: function () { }
        };
        this.mock(oBinding).expects("setNumberOfExpandedLevels").exactly(bCollapseRecursive ? 1 : 0).withExactArgs(42);
        this.mock(oBinding).expects("_fireChange").withExactArgs({ reason: ChangeReason.Collapse });
        TreeBindingAdapter.prototype.collapseToLevel.call(oBinding, 42);
    });
});