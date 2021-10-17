import Log from "sap/base/Log";
import ContextBinding from "sap/ui/model/ContextBinding";
import TestUtils from "sap/ui/test/TestUtils";
QUnit.module("sap.ui.model.ContextBinding", {
    beforeEach: function () {
        this.oLogMock = this.mock(Log);
        this.oLogMock.expects("error").never();
        this.oLogMock.expects("warning").never();
    },
    afterEach: function (assert) {
        return TestUtils.awaitRendering();
    }
});
QUnit.test("getInterface().getBoundContext()", function (assert) {
    var oContextBinding = new ContextBinding({}, "/"), oInterface = oContextBinding.getInterface();
    this.mock(oContextBinding).expects("getBoundContext").withExactArgs().returns("boundContext");
    assert.strictEqual(oInterface.getBoundContext(), "boundContext");
});