import Log from "sap/base/Log";
import AnalyticalTreeBindingAdapter from "sap/ui/model/analytics/AnalyticalTreeBindingAdapter";
import TestUtils from "sap/ui/test/TestUtils";
QUnit.module("sap.ui.model.analytics.AnalyticalTreeBindingAdapter", {
    beforeEach: function () {
        this.oLogMock = this.mock(Log);
        this.oLogMock.expects("error").never();
        this.oLogMock.expects("warning").never();
    },
    afterEach: function (assert) {
        return TestUtils.awaitRendering();
    }
});
QUnit.test("_getContextsOrNodes: unresolved binding", function (assert) {
    var oBinding = {
        isResolved: function () { }
    };
    this.mock(oBinding).expects("isResolved").withExactArgs().returns(false);
    assert.deepEqual(AnalyticalTreeBindingAdapter.prototype._getContextsOrNodes.call(oBinding), []);
});