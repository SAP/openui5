import createAndAppendDiv from "sap/ui/qunit/utils/createAndAppendDiv";
import UIArea from "sap/ui/core/UIArea";
import Control from "sap/ui/core/Control";
import TestButton from "sap/ui/testlib/TestButton";
import HTML from "sap/ui/core/HTML";
import Log from "sap/base/Log";
createAndAppendDiv("uiArea1");
var innerSpan = document.createElement("span");
innerSpan.textContent = "Before";
createAndAppendDiv("uiArea2");
jQuery("#uiArea2")[0].appendChild(innerSpan);
var oCore = sap.ui.getCore();
QUnit.module("Rendering", {
    before: function () {
        this.oText1 = new TestButton("text1", {
            text: "Text 1"
        });
        this.oText2 = new TestButton("text2", {
            text: "Text 2"
        });
        this.oHtml3 = new HTML("html3", {
            content: "<div style='background-color:red; width:64px;height:64px;'></div>"
        });
    },
    after: function () {
        this.oText1.destroy();
        this.oText2.destroy();
        this.oHtml3.destroy();
    }
});
QUnit.test("basic rendering", function (assert) {
    this.oText1.placeAt("uiArea1");
    this.oText2.placeAt("uiArea1");
    oCore.applyChanges();
    assert.equal(jQuery("#uiArea1 > button").length, 2, "two spans have been rendered");
    assert.equal(jQuery(jQuery("#uiArea1 > button").get(0)).text(), "Text 1", "first span shows first text");
    assert.equal(jQuery(jQuery("#uiArea1 > button").get(1)).text(), "Text 2", "second span shows second text");
});
QUnit.test("removeAllContent", function (assert) {
    oCore.getUIArea("uiArea1").removeAllContent();
    oCore.applyChanges();
    assert.equal(jQuery("#uiArea1").children().length, 0, "no more content");
    assert.ok(oCore.byId("text1"), "remove must not destroy child 1");
    assert.ok(oCore.byId("text2"), "remove must not destroy child 2");
});
QUnit.test("initial DOM content", function (assert) {
    var $originalDom = jQuery("#uiArea2").children();
    assert.equal($originalDom.length, 1, "precondition: one span exists already in UIArea");
    assert.equal(jQuery($originalDom.get(0)).text(), "Before", "precondition: span contains correct text");
    this.oText1.placeAt("uiArea2");
    this.oText2.placeAt("uiArea2");
    oCore.applyChanges();
    var $currentDom = jQuery("#uiArea2").children();
    assert.equal($currentDom.length, 3, "two more spans have been rendered");
    assert.equal($currentDom.get(0), $originalDom.get(0), "initial DOM must still exist");
    assert.equal(jQuery($currentDom.get(0)).text(), "Before", "initial DOM must still exist");
    assert.equal(jQuery($currentDom.get(1)).text(), "Text 1", "first span shows first text");
    assert.equal(jQuery($currentDom.get(2)).text(), "Text 2", "second span shows second text");
    oCore.getUIArea("uiArea2").removeAllContent();
    oCore.applyChanges();
    $currentDom = jQuery("#uiArea2").children();
    assert.equal($currentDom.length, 1, "initial DOM still exists in UIArea");
    assert.equal(jQuery($currentDom.get(0)).text(), "Before", "initial span still contains correct text");
});
QUnit.test("additional DOM content", function (assert) {
    var $originalDom = jQuery("#uiArea2").children();
    assert.equal($originalDom.length, 1, "precondition: one span exists already in UIArea");
    assert.equal(jQuery($originalDom.get(0)).text(), "Before", "precondition: span contains correct text");
    assert.ok(oCore.byId("text1"), "precondition: control 1 still exists");
    assert.ok(!oCore.byId("text1").getParent(), "precondition: control 1 not bound");
    assert.ok(oCore.byId("text2"), "precondition: control 2 still exists");
    assert.ok(!oCore.byId("text2").getParent(), "precondition: control 2 not bound");
    this.oText1.placeAt("uiArea2");
    oCore.applyChanges();
    jQuery("#uiArea2").append("<span>In Between</span>");
    this.oText2.placeAt("uiArea2");
    oCore.applyChanges();
    jQuery("#uiArea2").append("<span>After</span>");
    var $currentDom = jQuery("#uiArea2").children();
    assert.equal($currentDom.length, 5, "3 spans by dom manip, 2 rendered");
    assert.equal($currentDom.get(0), $originalDom.get(0), "initial DOM must still exist");
    assert.equal(jQuery($currentDom.get(0)).text(), "Before", "initial DOM must still exist");
    assert.equal(jQuery($currentDom.get(1)).text(), "In Between", "3rd span shows dynamically added text");
    assert.equal(jQuery($currentDom.get(2)).text(), "Text 1", "next span shows first control text");
    assert.equal(jQuery($currentDom.get(3)).text(), "Text 2", "4th span shows second control text");
    assert.equal(jQuery($currentDom.get(4)).text(), "After", "last span shows dynamically added end");
    oCore.getUIArea("uiArea2").removeAllContent();
    oCore.applyChanges();
    $currentDom = jQuery("#uiArea2").children();
    assert.equal($currentDom.length, 3, "initial DOM still exists in UIArea");
    assert.equal(jQuery($currentDom.get(0)).text(), "Before", "initial span still contains correct text");
    assert.equal(jQuery($currentDom.get(1)).text(), "In Between", "second span shows second text");
    assert.equal(jQuery($currentDom.get(2)).text(), "After", "first span shows first text");
});
QUnit.test("preserved DOM content", function (assert) {
    assert.ok(oCore.byId("text1"), "precondition: control 1 still exists");
    assert.ok(!oCore.byId("text1").getParent(), "precondition: control 1 not bound");
    assert.ok(oCore.byId("text2"), "precondition: control 2 still exists");
    assert.ok(!oCore.byId("text2").getParent(), "precondition: control 2 not bound");
    var $originalDom = jQuery("#uiArea1").children();
    assert.equal($originalDom.length, 0, "precondition: UIArea1 is empty");
    this.oText1.placeAt("uiArea1");
    this.oText2.placeAt("uiArea1");
    this.oHtml3.placeAt("uiArea1");
    oCore.applyChanges();
    var $currentDom = jQuery("#uiArea1").children();
    assert.equal($currentDom.length, 3, "3 items rendered");
    assert.equal(jQuery($currentDom.get(0)).text(), "Text 1", "first control rendered");
    assert.equal(jQuery($currentDom.get(1)).text(), "Text 2", "second control rendered");
    assert.equal(jQuery($currentDom.get(2))[0].tagName, "DIV", "3rd control rendered");
    jQuery("#html3").css("background-color", "blue");
    jQuery("#html3").css("width", "128px");
    assert.equal(jQuery($currentDom.get(2)).css("width"), "128px", "width changed");
    this.oText1.getUIArea().invalidate();
    oCore.applyChanges();
    assert.equal(jQuery($currentDom.get(0)).text(), "Text 1", "first control rendered");
    assert.equal(jQuery($currentDom.get(1)).text(), "Text 2", "second control rendered");
    assert.equal(jQuery($currentDom.get(2))[0].tagName, "DIV", "3rd control rendered");
    assert.equal(jQuery($currentDom.get(2)).css("width"), "128px", "width changed");
    oCore.getUIArea("uiArea1").removeAllContent();
    oCore.applyChanges();
    $currentDom = jQuery("#uiArea1").children();
    assert.equal($currentDom.length, 0, "no more DOM in the UIArea");
    var $preserved = jQuery("#html3");
    assert.equal($preserved.length, 1, "preserved html still exists");
    assert.equal($preserved[0].parentNode.id, "sap-ui-preserve", "preserved DOM is in preserve area");
});
QUnit.module("Event Handling", {
    beforeEach: function () {
        this.oButton = new TestButton().placeAt("uiArea1");
        sap.ui.getCore().applyChanges();
        this.spy(Log, "debug");
        this.fakeEvent = function fakeEvent(type) {
            return new jQuery.Event(new jQuery.Event(type), { target: this.oButton.getDomRef() });
        };
        this.hasBeenLogged = function hasBeenLogged(oEvent, oElement) {
            return Log.debug.calledWith(sinon.match(/Event fired:/).and(sinon.match(oEvent.type).and(sinon.match(oElement.toString()))));
        };
    },
    afterEach: function () {
        this.oButton.destroy();
    }
});
QUnit.test("Logging (default config, normal event)", function (assert) {
    var oEvent = this.fakeEvent("click");
    this.oButton.getUIArea()._handleEvent(oEvent);
    assert.ok(this.hasBeenLogged(oEvent, this.oButton), "Event ''click'' should have been logged");
});
QUnit.test("Logging (default config, verbose event)", function (assert) {
    var oEvent = this.fakeEvent("mouseover");
    this.oButton.getUIArea()._handleEvent(oEvent);
    assert.notOk(this.hasBeenLogged(oEvent, this.oButton), "Event 'mouseover' should not have been logged");
});
QUnit.test("Logging (custom config, normal event)", function (assert) {
    var oEvent = this.fakeEvent("click");
    var oResultingConfig = UIArea.configureEventLogging({ click: 1 });
    this.oButton.getUIArea()._handleEvent(oEvent);
    assert.equal(oResultingConfig.click, true);
    assert.equal(oResultingConfig.mouseover, true);
    assert.notOk(this.hasBeenLogged(oEvent, this.oButton), "Event 'click' should not have been logged");
    UIArea.configureEventLogging({ click: 0 });
});
QUnit.test("Logging (custom config, verbose event)", function (assert) {
    var oEvent = this.fakeEvent("mouseover");
    var oResultingConfig = UIArea.configureEventLogging({ mouseover: 0 });
    this.oButton.getUIArea()._handleEvent(oEvent);
    assert.equal(oResultingConfig.click, false);
    assert.equal(oResultingConfig.mouseover, false);
    assert.ok(this.hasBeenLogged(oEvent, this.oButton), "Event 'mouseover' should have been logged");
    UIArea.configureEventLogging({ mouseover: 1 });
});
QUnit.module("Dependents", {
    beforeEach: function () {
        var oControl = new Control();
        oCore.createUIArea("uiArea1").addDependent(oControl);
        this.uiArea = oControl.getUIArea();
        this.uiArea.addDependent(new Control());
        this.spy(this.uiArea, "invalidate");
    },
    afterEach: function (assert) {
        assert.notOk(this.uiArea.invalidate.called, "...then the UIArea should not invalidate");
    }
});
QUnit.test("When an item is added...", function (assert) {
    this.uiArea.addDependent(new Control());
});
QUnit.test("When an item is inserted...", function (assert) {
    this.uiArea.insertDependent(new Control(), 0);
});
QUnit.test("When an item is removed...", function (assert) {
    this.uiArea.removeDependent(0);
});
QUnit.test("When all items are removed...", function (assert) {
    this.uiArea.removeAllDependents();
});
QUnit.test("When all items are destroyed...", function (assert) {
    this.uiArea.destroyDependents();
});
QUnit.test("When an item is added twice...", function (assert) {
    this.uiArea.addDependent(this.uiArea.getDependents()[0]);
});
QUnit.test("When an item is inserted twice...", function (assert) {
    this.uiArea.insertDependent(0, this.uiArea.getDependents()[1]);
});
QUnit.test("When an item is destroyed...", function (assert) {
    this.uiArea.getDependents()[0].destroy();
});
QUnit.test("When an item is moved to another parent...", function (assert) {
    var oOther = new Control();
    oOther.addDependent(this.uiArea.getDependents()[0]);
});