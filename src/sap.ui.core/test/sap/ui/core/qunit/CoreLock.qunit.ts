import Button from "sap/m/Button";
sap.ui.getCore().lock();
var oButton = new Button({
    id: "button",
    text: "Click",
    tooltip: "This SAPUI5 Button should be 'locked' until the Core is explicitly unlocked"
});
QUnit.module("Check for Unlocked Core");
QUnit.test("Control Events should be blocked depending on Core lock", function (assert) {
    var pressed = false;
    oButton.attachPress(function () {
        pressed = true;
    });
    assert.ok(!pressed, "Button must not have fired 'press' yet");
    jQuery("#button").trigger("focus").trigger("click");
    assert.ok(!pressed, "Button still must not have fired 'press'");
    sap.ui.getCore().unlock();
    assert.ok(!pressed, "Button still must not have fired 'press'");
    jQuery("#button").trigger("focus").trigger("tap");
    assert.ok(pressed, "Button should have fired 'press'");
});
sap.ui.getCore().attachInit(function () {
    var oDIV = document.createElement("div");
    oDIV.id = "content";
    document.body.appendChild(oDIV);
    oButton.placeAt("content");
    sap.ui.getCore().applyChanges();
});