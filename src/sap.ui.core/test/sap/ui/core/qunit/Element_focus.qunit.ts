import BusyIndicator from "sap/ui/core/BusyIndicator";
import Button from "sap/m/Button";
import Dialog from "sap/m/Dialog";
import createAndAppendDiv from "sap/ui/qunit/utils/createAndAppendDiv";
import HTML from "sap/ui/core/HTML";
import Input from "sap/m/Input";
QUnit.module("Focus Issue");
QUnit.test("Focus a missing element (actual incident testcase)", function (assert) {
    var done = assert.async();
    assert.expect(1);
    var oDialog = new Dialog({
        title: "Some Title",
        buttons: [new Button({ text: "OK" })]
    });
    oDialog.open();
    setTimeout(function () {
        BusyIndicator.show(0);
        oDialog.close();
        setTimeout(function () {
            BusyIndicator.hide();
            assert.ok(true, "when this checkpoint is reached, the test is passed");
            done();
        }, 600);
    }, 600);
});
QUnit.module("Focus with preventScroll");
QUnit.test("Focus an element with preventScroll should NOT cause scrolling", function (assert) {
    createAndAppendDiv("content");
    var done = assert.async();
    var oHTMLControl = new HTML({
        content: "<div id='scroll_container' style='overflow:scroll; height: 400px'>\t\t\t\t\t\t<div id='input_uiarea'></div>\t\t\t\t\t\t<div style='height: 3000px'></div>\t\t\t\t\t\t<input id='input_at_end'>\t\t\t\t\t</div>"
    });
    oHTMLControl.placeAt("content");
    sap.ui.getCore().applyChanges();
    var oInput = new Input();
    oInput.placeAt("input_uiarea");
    sap.ui.getCore().applyChanges();
    var oDomElement = document.getElementById("scroll_container"), oInputAtEnd = document.getElementById("input_at_end");
    oInputAtEnd.scrollIntoView();
    var iScrollY = oDomElement.scrollTop;
    assert.ok(iScrollY > 0, "The focus to last input should already caused scrolling in the container");
    oInput.focus({
        preventScroll: true
    });
    setTimeout(function () {
        assert.equal(oDomElement.scrollTop, iScrollY, "The vertical scroll position of the container isn't changed");
        oInput.destroy();
        oHTMLControl.destroy();
        done();
    }, 0);
});