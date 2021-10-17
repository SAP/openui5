QUnit.test("Calendar Class Loading", function (assert) {
    var GregorianClass = sap.ui.require("sap/ui/core/date/Gregorian");
    var JapaneseClass = sap.ui.require("sap/ui/core/date/Japanese");
    assert.notOk(GregorianClass, "The calendar class shouldn't be loaded");
    assert.ok(JapaneseClass, "The calendar class is loaded");
    var bLibraryRequestExists = !!document.querySelector("head > script[src*='sap/ui/core/library.js']");
    var bCalendarClassRequestExists = !!document.querySelector("head > script[src*='sap/ui/core/date/Japanese.js']");
    assert.ok(bLibraryRequestExists ? bCalendarClassRequestExists : !bCalendarClassRequestExists, "calendar class is loaded within library-preload.js when it exists");
});