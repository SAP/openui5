import Log from "sap/base/Log";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage();
QUnit.module("sap.ui.model.resource.ResourcePropertyBinding", {
    before: function () {
        sap.ui.getCore().getConfiguration().setLanguage("en-US");
    },
    beforeEach: function () {
        this.oLogMock = this.mock(Log);
        this.oLogMock.expects("warning").never();
        this.oLogMock.expects("error").never();
        this.oModel = new ResourceModel({ bundleName: "testdata.messages" });
        sap.ui.getCore().setModel(this.oModel);
    },
    afterEach: function () {
        sap.ui.getCore().setModel(null);
    },
    after: function () {
        sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);
    }
});
QUnit.test("Binding getPath", function (assert) {
    var oBinding = this.oModel.bindProperty("TEST_TEXT");
    assert.ok(oBinding, "binding instantiated");
    assert.equal(oBinding.getPath(), "TEST_TEXT", "Binding Path set properly");
});
QUnit.test("Binding getModel", function (assert) {
    var oBinding = this.oModel.bindProperty("TEST_TEXT");
    assert.equal(oBinding.getModel(), this.oModel, "Binding model");
});
QUnit.test("Binding changeEvent", function (assert) {
    var attach = false, oBinding = this.oModel.bindProperty("TEST_TEXT"), detach = true, done = assert.async(), that = this;
    function callBackOnChange() {
        attach = true;
        detach = false;
    }
    oBinding.attachChange(callBackOnChange);
    assert.equal(this.oModel.getBindings().length, 1, "model bindings");
    oBinding._fireChange();
    assert.ok(attach, "call back method was attached");
    assert.ok(!detach, "call back method was not detached");
    oBinding.detachChange(callBackOnChange);
    attach = false;
    detach = true;
    oBinding._fireChange();
    assert.ok(!attach, "call back method was not attached");
    assert.ok(detach, "call back method was detached");
    attach = false;
    detach = true;
    setTimeout(function () {
        assert.equal(that.oModel.getBindings().length, 0, "model bindings");
        done();
    }, 0);
});
QUnit.test("PropertyBinding getValue", function (assert) {
    var oBinding = this.oModel.bindProperty("TEST_TEXT");
    assert.equal(oBinding.getValue(), "A text en", "Property binding value");
});