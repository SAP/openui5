import QUtils from "sap/ui/qunit/QUnitUtils";
import Shortcut from "sap/ui/core/Shortcut";
import Component from "sap/ui/core/Component";
import CommandExecution from "sap/ui/core/CommandExecution";
import Control from "sap/ui/core/Control";
import Panel from "sap/m/Panel";
import Input from "sap/m/Input";
var oPanel, oControl, oCE, oStub, oFakeCommand, oOwnerComponentFake;
function fnInitControlTree() {
    oPanel = new Panel();
    oControl = new Control({});
    oCE = new CommandExecution({ command: "Save", execute: function () { } });
    oPanel.addContent(oControl);
    oFakeCommand = { "Save": { shortcut: "Shift+S", fake: true } };
    oOwnerComponentFake = { getCommand: function (sCommand) { return oFakeCommand[sCommand]; } };
    oStub = sinon.stub(Component, "getOwnerComponentFor").callsFake(function () {
        return oOwnerComponentFake;
    });
}
function cleanup() {
    oPanel.destroy();
    oStub.restore();
}
QUnit.module("Shourtcut API", {
    beforeEach: fnInitControlTree,
    afterEach: cleanup
});
QUnit.test("register/unregister/isRegistered", function (assert) {
    assert.expect(2);
    Shortcut.register(oPanel, "Shift+S", function () { });
    assert.ok(Shortcut.isRegistered(oPanel, "Shift+S"), "Shortcut registered");
    Shortcut.unregister(oPanel, "Shift+S");
    assert.ok(!Shortcut.isRegistered(oPanel, "Shift+S"), "Shortcut unregistered");
});
QUnit.test("register twice", function (assert) {
    assert.expect(2);
    Shortcut.register(oPanel, "Shift+S", function () { });
    assert.ok(Shortcut.isRegistered(oPanel, "Shift+S"), "Shortcut registered");
    assert.throws(Shortcut.register.bind(null, oPanel, "Shift+S", function () { }), "Can't register the same shortcut twice");
});
QUnit.test("register w/o callback", function (assert) {
    assert.expect(1);
    assert.throws(Shortcut.register.bind(null, oPanel, "Shift+S"), "No callback function given");
});
QUnit.test("register w/o scopecontrol", function (assert) {
    assert.expect(1);
    assert.throws(Shortcut.register.bind(null, null, "Shift+S", function () { }), "No scope control given");
});
QUnit.test("unregister w/o scopecontrol", function (assert) {
    assert.expect(1);
    assert.throws(Shortcut.unregister.bind(null, null, "Shift+S"), "no scope control given");
});
QUnit.test("unregister a not registered shortcut", function (assert) {
    assert.expect(2);
    oPanel.addDependent(oCE);
    assert.ok(!Shortcut.unregister(oPanel, "Ctrl+R"), "Shortcut not unregistered");
    assert.ok(Shortcut.unregister(oPanel, "Shift+S"), "Shortcut unregistered");
});
QUnit.test("fnWrapper trigger", function (assert) {
    assert.expect(4);
    var done = assert.async();
    var oHTMLElementFocusSpy = sinon.spy(HTMLElement.prototype, "focus");
    var oInput = new Input();
    oInput.addDependent(new CommandExecution({ command: "Save", execute: function () {
            assert.ok(true, "triggered");
            assert.equal(oHTMLElementFocusSpy.callCount, 3, "HTMLElement.prototype.focus should be called thrice");
            assert.ok(oInput.getDomRef().contains(document.activeElement), "Focus should be restored correctly");
            assert.notOk(document.getElementById("sap-ui-shortcut-focus"), "span element should be removed again");
            oHTMLElementFocusSpy.restore();
            done();
        } }));
    oInput.placeAt("qunit-fixture");
    oInput.addEventDelegate({ "onAfterRendering": function () {
            oInput.focus();
            QUtils.triggerKeydown(oInput.getDomRef(), "s", true, false, false);
        } });
});