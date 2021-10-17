import fakeService from "test-resources/sap/ui/core/qunit/odata/data/ODataModelFakeService";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import Text from "sap/m/Text";
var oModel;
var sURI = "http://services.odata.org/V3/Northwind/Northwind.svc/";
sURI = "/proxy/http/" + sURI.replace("http://", "");
function removeSharedMetadata() {
    var sServiceURI = sURI.replace(/\/$/, "");
    if (ODataModel.mServiceData && ODataModel.mServiceData[sServiceURI]) {
        delete ODataModel.mServiceData[sServiceURI].oMetadata;
    }
}
function initModel(bJSON) {
    return new ODataModel(sURI, {
        json: bJSON,
        useBatch: true
    });
}
initModel().refreshSecurityToken();
QUnit.module("v2.ODataPropertyBinding", {
    beforeEach: function () {
        oModel = initModel(false);
        this.oText = new Text();
    },
    afterEach: function () {
        oModel = undefined;
        this.oText.destroy();
        removeSharedMetadata();
    }
});
QUnit.test("PropertyBinding refresh model with forced flag", function (assert) {
    var done = assert.async();
    var that = this;
    var handlerSpy = sinon.spy(function () {
        if (handlerSpy.callCount === 4) {
            assert.equal(that.oText.getText(), "2");
            done();
        }
        else if (handlerSpy.callCount === 3) {
            assert.equal(that.oText.getText(), "changed");
        }
    });
    oModel.metadataLoaded().then(function () {
        var oBinding = oModel.bindProperty("/Products(2)/ProductID");
        oBinding.attachChange(handlerSpy);
        oBinding.initialize();
        that.oText.setModel(oModel);
        that.oText.bindElement("/Products(2)");
        that.oText.bindProperty("text", { path: "ProductID", mode: "OneWay" });
        oModel.refresh(true);
        that.oText.setText("changed");
        oModel.refresh(true);
    });
});
QUnit.test("PropertyBinding get value", function (assert) {
    var done = assert.async();
    var that = this;
    oModel.metadataLoaded().then(function () {
        var oBinding = oModel.bindProperty("/Products(2)/ProductID");
        oBinding.initialize();
        that.oText.setModel(oModel);
        that.oText.bindElement("/Products(2)");
        that.oText.bindProperty("text", { path: "ProductID", mode: "OneWay" });
        oBinding.attachChange(function () {
            assert.equal(oBinding.getValue(), 2);
            done();
        });
    });
});
QUnit.test("PropertyBinding set value", function (assert) {
    var done = assert.async();
    var that = this;
    oModel.metadataLoaded().then(function () {
        var oBinding = oModel.bindProperty("/Products(2)/ProductID");
        oBinding.initialize();
        that.oText.setModel(oModel);
        that.oText.bindElement("/Products(2)");
        that.oText.bindProperty("text", { path: "ProductID", mode: "OneWay" });
        oBinding.attachChange(function () {
            assert.equal(oBinding.getValue(), 2);
            oBinding.setValue(4711);
            assert.equal(oBinding.getValue(), 4711);
            done();
        });
    });
});