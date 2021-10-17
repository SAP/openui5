import ResourceBundle from "sap/base/i18n/ResourceBundle";
import View from "sap/ui/core/mvc/View";
import JSONView from "sap/ui/core/mvc/JSONView";
import ManagedObject from "sap/ui/base/ManagedObject";
import asyncTestsuite from "./AnyViewAsync.qunit";
import Log from "sap/base/Log";
var oConfig = {
    type: "JSON",
    factory: function (bAsync) {
        return sap.ui.view({
            type: "JSON",
            viewName: "testdata.mvc.Async",
            async: bAsync
        });
    },
    receiveSource: function (source) {
        return JSON.stringify(source);
    }
};
asyncTestsuite("Generic View Factory", oConfig);
oConfig.factory = function (bAsync) {
    return sap.ui.jsonview({
        viewName: "testdata.mvc.Async",
        async: bAsync
    });
};
asyncTestsuite("JSONView Factory", oConfig);
QUnit.test("Promise - loaded() for async view", function (assert) {
    assert.expect(3);
    var done = assert.async();
    var that = this;
    this.oLogMock = this.mock(Log);
    this.oLogMock.expects("warning").never();
    JSONView.create({
        viewName: "testdata.mvc.Async"
    }).then(function (oViewLoaded) {
        assert.equal(that.oAfterInitSpy.callCount, 1, "AfterInit event fired before resolving");
        assert.ok(oViewLoaded instanceof JSONView, "Views equal deeply");
        done();
    });
});
var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage();
QUnit.module("Apply settings", {
    beforeEach: function () {
        sap.ui.getCore().getConfiguration().setLanguage("en-US");
    },
    afterEach: function () {
        sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);
    }
});
QUnit.test("Promise - loaded() for async view with resource bundle", function (assert) {
    assert.expect(3);
    var oResourceBundleCreateSpy = sinon.spy(ResourceBundle, "create");
    return JSONView.create({
        viewName: "testdata.mvc.AsyncWithResourceBundle"
    }).then(function (oViewLoaded) {
        assert.ok(oViewLoaded instanceof JSONView, "Views equal deeply");
        var oCreateCall = oResourceBundleCreateSpy.getCall(0);
        assert.ok(oCreateCall, "async call");
        assert.ok(oCreateCall.args[0].async, "async call");
        oResourceBundleCreateSpy.restore();
    });
});
QUnit.test("Async JSONView: Aggregation Binding with value property", function (assert) {
    var done = assert.async();
    sap.ui.require(["sap/ui/table/Table"], function () {
        var oExtractBindingInfoSpy = sinon.spy(ManagedObject.prototype, "extractBindingInfo");
        var json = JSON.stringify({
            "Type": "sap.ui.core.mvc.JSONView",
            "content": [
                {
                    "Type": "sap.ui.table.Table",
                    "columns": [
                        {
                            "Type": "sap.ui.table.Column",
                            "template": {
                                "Type": "sap.m.DatePicker",
                                "value": {
                                    "path": "Date",
                                    "type": "sap.ui.model.type.String"
                                }
                            }
                        }
                    ]
                }
            ]
        });
        JSONView.create({
            definition: json
        }).then(function (oJsonView) {
            assert.equal(oExtractBindingInfoSpy.callCount, 7, "ManagedObject#extractBindingInfo called seven times");
            assert.equal(oExtractBindingInfoSpy.getCall(5).returnValue, undefined, "ManagedObject#extractBindingInfo should return undefined");
            done();
        });
    });
});