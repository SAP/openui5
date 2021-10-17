import CalendarType from "sap/ui/core/CalendarType";
QUnit.module("Basic");
QUnit.test("", function (assert) {
    var IslamicClass = sap.ui.require("sap/ui/core/date/Islamic");
    assert.ok(IslamicClass, "The default calendar class is loaded");
});