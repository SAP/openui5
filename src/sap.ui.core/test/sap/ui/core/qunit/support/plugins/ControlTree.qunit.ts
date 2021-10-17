import Text from "sap/m/Text";
import Core from "sap/ui/core/Core";
import ControlTree from "sap/ui/core/support/plugins/ControlTree";
import JSONModel from "sap/ui/model/json/JSONModel";
QUnit.module("Binding Infos", {
    before: function () {
        this.oCT = new ControlTree({
            isToolStub: function () {
                return true;
            }
        });
        this.oCT.oCore = Core;
    },
    after: function () {
        this.oCT.destroy();
    }
});
QUnit.test("Invalid absolute path", function (assert) {
    var oTestStub = new Text({
        text: "{/invalidKey}"
    });
    oTestStub.setModel(new JSONModel({}));
    var bInvalid = this.oCT.getControlBindingInfos(oTestStub.getId()).bindings[0].bindings[0].invalidPath;
    assert.ok(bInvalid, "'invalidPath' flag should be true");
});
QUnit.test("Invalid relative path. With binding context.", function (assert) {
    var oTestStub = new Text({
        text: "{invalidKey}"
    });
    var oModel = new JSONModel({
        context: {
            key: "some value"
        }
    });
    oTestStub.setModel(oModel);
    oTestStub.setBindingContext(oModel.createBindingContext("/context"));
    var bInvalid = this.oCT.getControlBindingInfos(oTestStub.getId()).bindings[0].bindings[0].invalidPath;
    assert.ok(bInvalid, "'invalidPath' flag should be true");
});
QUnit.test("Invalid relative path. No binding context.", function (assert) {
    var oTestStub = new Text({
        text: "{invalidKey}"
    });
    var oModel = new JSONModel({
        context: {
            key: "some value"
        }
    });
    oTestStub.setModel(oModel);
    var bInvalid = this.oCT.getControlBindingInfos(oTestStub.getId()).bindings[0].bindings[0].invalidPath;
    assert.ok(bInvalid, "'invalidPath' flag should be true");
});
QUnit.test("Valid absolute path", function (assert) {
    var oTestStub = new Text({
        text: "{/validKey}"
    });
    oTestStub.setModel(new JSONModel({
        validKey: "some value"
    }));
    var bInvalid = this.oCT.getControlBindingInfos(oTestStub.getId()).bindings[0].bindings[0].invalidPath;
    assert.notOk(bInvalid, "'invalidPath' flag should be false");
});
QUnit.test("Valid relative path. With binding context.", function (assert) {
    var oTestStub = new Text({
        text: "{validKey}"
    });
    var oModel = new JSONModel({
        context: {
            validKey: "some value"
        }
    });
    oTestStub.setModel(oModel);
    oTestStub.setBindingContext(oModel.createBindingContext("/context"));
    var bInvalid = this.oCT.getControlBindingInfos(oTestStub.getId()).bindings[0].bindings[0].invalidPath;
    assert.notOk(bInvalid, "'invalidPath' flag should be false");
});