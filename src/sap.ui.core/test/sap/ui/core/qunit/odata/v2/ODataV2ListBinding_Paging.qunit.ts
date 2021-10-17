import fakeService from "test-resources/sap/ui/core/qunit/odata/data/ODataModelFakeService";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import CountMode from "sap/ui/model/odata/CountMode";
import OperationMode from "sap/ui/model/odata/OperationMode";
import Sorter from "sap/ui/model/Sorter";
import Filter from "sap/ui/model/Filter";
import FilterProcessor from "sap/ui/model/FilterProcessor";
import FilterType from "sap/ui/model/FilterType";
import FilterOperator from "sap/ui/model/FilterOperator";
import ODataFilter from "sap/ui/model/odata/Filter";
import Device from "sap/ui/Device";
import Panel from "sap/m/Panel";
import List from "sap/m/List";
import DisplayListItem from "sap/m/DisplayListItem";
import StandardListItem from "sap/m/StandardListItem";
var oModel;
var sURI = "http://services.odata.org/V3/Northwind/Northwind.svc/";
sURI = "/proxy/http/" + sURI.replace("http://", "");
function initModel(bJSON) {
    return new ODataModel(sURI, {
        json: bJSON,
        useBatch: true
    });
}
initModel().refreshSecurityToken();
QUnit.module("Listbinding skip/top", {
    beforeEach: function () {
        this.aRegisteredControls = [];
    },
    afterEach: function () {
        oModel.destroy();
        oModel = undefined;
        this.aRegisteredControls.forEach(function (oControl) {
            if (oControl.destroy) {
                oControl.destroy();
            }
        });
    }
});
QUnit.test("Non-batch: server paging - start from 0 (initial empty)", function (assert) {
    var done = assert.async();
    oModel = initModel();
    oModel.setUseBatch(false);
    oModel.metadataLoaded().then(function () {
        var oBinding = oModel.bindList("/Customers", null, null, null, {});
        var fnHandler1 = function () {
            oBinding.detachChange(fnHandler1);
            assert.equal(oBinding.getPath(), "/Customers", "ListBinding path");
            assert.equal(oBinding.getLength(), 91, "length of items");
            assert.equal(oBinding.aKeys.length, 20);
            assert.ok(oBinding.aKeys[0]);
            assert.ok(oBinding.aKeys[19]);
            assert.notOk(oBinding.aKeys[20]);
            oBinding.attachChange(fnHandler2);
            oBinding.getContexts(0, 10, 50);
        };
        var fnHandler2 = function () {
            oBinding.detachChange(fnHandler2);
            assert.equal(oBinding.getLength(), 91, "length of items");
            assert.equal(oBinding.aKeys.length, 40);
            assert.ok(oBinding.aKeys[0]);
            assert.ok(oBinding.aKeys[39]);
            assert.notOk(oBinding.aKeys[40]);
            oBinding.getContexts(0, 10, 50);
            done();
        };
        oBinding.attachRefresh(function () {
            oBinding.attachChange(fnHandler1);
            oBinding.getContexts(0, 10, 50);
        });
        oBinding.initialize();
    });
});
QUnit.test("Non-batch: server paging - start in the middle of the list (initial empty)", function (assert) {
    var done = assert.async();
    oModel = initModel();
    oModel.setUseBatch(false);
    oModel.metadataLoaded().then(function () {
        var oBinding = oModel.bindList("/Customers", null, null, null, {});
        var fnHandler1 = function () {
            oBinding.detachChange(fnHandler1);
            assert.equal(oBinding.getPath(), "/Customers", "ListBinding path");
            assert.equal(oBinding.getLength(), 91, "length of items");
            assert.equal(Object.keys(oBinding.aKeys).length, 20);
            assert.notOk(oBinding.aKeys[20]);
            assert.ok(oBinding.aKeys[21]);
            assert.ok(oBinding.aKeys[40]);
            assert.notOk(oBinding.aKeys[41]);
            oBinding.attachChange(fnHandler2);
            oBinding.getContexts(37, 10, 16);
        };
        var fnHandler2 = function () {
            oBinding.detachChange(fnHandler2);
            assert.equal(oBinding.getLength(), 91, "length of items");
            assert.equal(Object.keys(oBinding.aKeys).length, 40);
            assert.notOk(oBinding.aKeys[20]);
            assert.ok(oBinding.aKeys[21]);
            assert.ok(oBinding.aKeys[60]);
            assert.notOk(oBinding.aKeys[61]);
            oBinding.getContexts(37, 10, 16);
            done();
        };
        oBinding.attachRefresh(function () {
            oBinding.attachChange(fnHandler1);
            oBinding.getContexts(37, 10, 16);
        });
        oBinding.initialize();
    });
});