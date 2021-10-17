import QUtils from "sap/ui/qunit/QUnitUtils";
import ShortcutHelper from "sap/ui/core/util/ShortcutHelper";
import Component from "sap/ui/core/Component";
import CommandExecution from "sap/ui/core/CommandExecution";
import Control from "sap/ui/core/Control";
import Panel from "sap/m/Panel";
var oPanel, oControl, oCE, oStub, oFakeCommand, oOwnerComponentFake;
function fnInitControlTree() {
    oPanel = new Panel();
    oControl = new Control({});
    oCE = new CommandExecution({ command: "Save" });
    oPanel.addContent(oControl);
    oFakeCommand = { "Save": { shortcut: "Shift+s", fake: true } };
    oOwnerComponentFake = { getCommand: function (sCommand) { return oFakeCommand[sCommand]; } };
    oStub = sinon.stub(Component, "getOwnerComponentFor").callsFake(function () {
        return oOwnerComponentFake;
    });
}
function cleanup() {
    oCE.destroy();
    oPanel.destroy();
    oStub.restore();
}
QUnit.module("ShourtcutHelper API", {
    beforeEach: fnInitControlTree,
    afterEach: cleanup
});
QUnit.test("findShortcut", function (assert) {
    assert.expect(2);
    oPanel.addDependent(oCE);
    var oNormalizedShortcut = ShortcutHelper.getNormalizedShortcutSpec("Shift+s");
    var oShortcut = ShortcutHelper.findShortcut(oPanel, oNormalizedShortcut);
    assert.deepEqual(oShortcut.shortcutSpec, oNormalizedShortcut, "Shortcut found on scope control");
    assert.strictEqual(oShortcut.platformIndependentShortcutString, "shift+s", "Shjortcut string ok");
});
QUnit.test("getNormalizedShortcutSpec", function (assert) {
    assert.expect(3);
    var oExpectedSpec = {
        key: "s",
        ctrlKey: false,
        ctrlRequested: false,
        altKey: false,
        shiftKey: true,
        metaKey: false
    };
    var oShortcut = {
        key: "s",
        ctrl: false,
        alt: false,
        shift: true
    };
    var oInvalidShortcut = {
        key: "selsrjtakfgj",
        ctrl: false,
        alt: false,
        shift: ""
    };
    var oNormalizedShortcut = ShortcutHelper.getNormalizedShortcutSpec("Shift+s");
    assert.deepEqual(oNormalizedShortcut, oExpectedSpec, "Shortcut normalized sucessfully from string");
    oNormalizedShortcut = ShortcutHelper.getNormalizedShortcutSpec(oShortcut);
    assert.deepEqual(oNormalizedShortcut, oExpectedSpec, "Shortcut normalized sucessfully from object");
    assert.throws(ShortcutHelper.getNormalizedShortcutSpec.bind(ShortcutHelper, oInvalidShortcut), "shortcut object invalid");
});
QUnit.test("parseShortcut", function (assert) {
    assert.expect(3);
    var oExpectedSpec = {
        key: "s",
        ctrlKey: false,
        ctrlRequested: false,
        altKey: true,
        shiftKey: true,
        metaKey: false
    };
    var oParsedSpec = ShortcutHelper.parseShortcut("Shift+Alt+S");
    assert.deepEqual(oParsedSpec, oExpectedSpec, "Shortcut parsed sucessfully");
    var oExpectedSpecSpace = {
        key: " ",
        ctrlKey: false,
        ctrlRequested: false,
        altKey: false,
        shiftKey: true,
        metaKey: false
    };
    oParsedSpec = ShortcutHelper.parseShortcut("Shift+Space");
    assert.deepEqual(oParsedSpec, oExpectedSpecSpace, "Shortcut with 'Space' parsed sucessfully");
    var oExpectedSpecPlus = {
        key: "+",
        ctrlKey: false,
        ctrlRequested: false,
        altKey: false,
        shiftKey: true,
        metaKey: false
    };
    oParsedSpec = ShortcutHelper.parseShortcut("Shift+Plus");
    assert.deepEqual(oParsedSpec, oExpectedSpecPlus, "Shortcut with 'Plus' parsed sucessfully");
});
QUnit.test("translateRegisteredKeyToStandard", function (assert) {
    assert.expect(2);
    var sKey = ShortcutHelper.translateRegisteredKeyToStandard("space");
    assert.strictEqual(sKey, " ", "key translated correctly");
    sKey = ShortcutHelper.translateRegisteredKeyToStandard("plus");
    assert.strictEqual(sKey, "+", "key translated correctly");
});
QUnit.test("validateShortcutString", function (assert) {
    assert.expect(8);
    assert.throws(function () {
        ShortcutHelper.validateShortcutString("CTR+CTR+SLT+AA");
    }, "Shortcut not valid");
    assert.throws(function () {
        ShortcutHelper.validateShortcutString("CTRL++");
    }, "Shortcut not valid");
    assert.throws(function () {
        ShortcutHelper.validateShortcutString("CTRL+ ");
    }, "Shortcut not valid");
    assert.equal(undefined, ShortcutHelper.validateShortcutString("CTRL+SPACE"), "Shortcut valid");
    assert.equal(undefined, ShortcutHelper.validateShortcutString("CTRL+PLUS"), "Shortcut valid");
    assert.equal(undefined, ShortcutHelper.validateShortcutString("CTRL+s"), "Shortcut valid");
    assert.equal(undefined, ShortcutHelper.validateShortcutString("CTRL+ALT+s"), "Shortcut valid");
    assert.equal(undefined, ShortcutHelper.validateShortcutString("CTRL+ALT+SHIFT+s"), "Shortcut valid");
});
[".", ",", "-", "tab", "plus", "=", "*", "/"].forEach(function (sKey) {
    QUnit.test("validateKeyCombination for shift + '" + sKey + "'", function (assert) {
        assert.expect(1);
        var oSpec = ShortcutHelper.getNormalizedShortcutSpec("shift+" + sKey);
        assert.throws(function () {
            ShortcutHelper.validateKeyCombination(oSpec);
        }, "validation failed");
    });
});
["s", "space", "h", "e", "7", "q", "M"].forEach(function (sKey) {
    QUnit.test("validateKeyCombination for shift + '" + sKey + "'", function (assert) {
        assert.expect(1);
        var oSpec = ShortcutHelper.getNormalizedShortcutSpec("shift+" + sKey);
        assert.equal(undefined, ShortcutHelper.validateKeyCombination(oSpec), "Shortcut validation ok");
    });
});
["l", "n", "q", "t", "w"].forEach(function (sKey) {
    QUnit.test("validateKeyCombination for ctrl + '" + sKey + "'", function (assert) {
        assert.expect(1);
        var oSpec = ShortcutHelper.getNormalizedShortcutSpec("ctrl+" + sKey);
        assert.throws(function () {
            ShortcutHelper.validateKeyCombination(oSpec);
        }, "validation failed");
    });
});
["-", "plus", "tab", "0"].forEach(function (sKey) {
    QUnit.test("validateKeyCombination for ctrl + '" + sKey + "'", function (assert) {
        assert.expect(1);
        var oSpec = ShortcutHelper.getNormalizedShortcutSpec("ctrl+" + sKey);
        assert.throws(function () {
            ShortcutHelper.validateKeyCombination(oSpec);
        }, "validation failed");
    });
});
QUnit.test("getNormalizedShortcutString", function (assert) {
    assert.expect(1);
    var oSpec = ShortcutHelper.getNormalizedShortcutSpec("ctrl+shift+S");
    assert.strictEqual("ctrl+shift+s", ShortcutHelper.getNormalizedShortcutString(oSpec), "Spec successfully normalized to string");
});
["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp"].forEach(function (sKey) {
    QUnit.test("shortcutMayBeUsedHere for key '" + sKey + "'", function (assert) {
        assert.expect(2);
        var oSpec = ShortcutHelper.getNormalizedShortcutSpec("ctrl+shift+" + sKey);
        assert.ok(!ShortcutHelper.shortcutMayBeUsedHere(oSpec, document.createElement("input")));
        assert.ok(!ShortcutHelper.shortcutMayBeUsedHere(oSpec, document.createElement("textarea")));
    });
});
QUnit.test("handleKeydown", function (assert) {
    assert.expect(1);
    var e;
    var oSpec = ShortcutHelper.getNormalizedShortcutSpec("shift+S");
    e = jQuery.Event("keydown");
    e.key = "s";
    e.ctrlKey = false;
    e.altKey = false;
    e.shiftKey = true;
    e.metaKey = false;
    e.srcElement = document.createElement("input");
    ShortcutHelper.handleKeydown(oSpec, "shift+S", function () {
        assert.ok(true, "shortcut triggered");
    }, e);
});
["Control", "Shift", "Alt", "AltGraph", "Meta"].forEach(function (sKey) {
    QUnit.test("handleKeydown", function (assert) {
        assert.expect(1);
        var e;
        var oSpec = ShortcutHelper.getNormalizedShortcutSpec("shift+S");
        e = jQuery.Event("keydown");
        e.key = sKey;
        e.srcElement = document.createElement("input");
        assert.ok(!ShortcutHelper.handleKeydown(oSpec, "shift", function () {
            assert.ok(true, "shortcut should not be triggered");
        }, e), "Shortcut should not be triggered");
    });
});