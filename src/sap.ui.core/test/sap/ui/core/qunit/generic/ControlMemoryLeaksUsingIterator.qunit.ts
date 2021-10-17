import ControlIterator from "sap/ui/qunit/utils/ControlIterator";
import MemoryLeakCheck from "sap/ui/qunit/utils/MemoryLeakCheck";
import UriParameters from "sap/base/util/UriParameters";
import LoadingIndicator from "./helper/_LoadingIndicator";
import includeStylesheet from "sap/ui/dom/includeStylesheet";
import require from "require";
sap.ui.loader.config({
    map: {
        "*": {
            "sap/ui/thirdparty/require": "test-resources/sap/ui/core/qunit/generic/helper/_emptyModule"
        }
    }
});
var loadingIndicator = new LoadingIndicator("Discovering and loading all libraries and controls... this will take a while... ", "NOTE: you can select a specific library using the URL parameter 'library' (e.g. ...&library=sap.m) and/or a specific control using the URL parameter 'control' " + "with the full name of the control (e.g. ...&control=sap.m.Button). Giving both reduces the scanning time.");
var aExcludedControls = [
    "sap.m.internal.NumericInput",
    "sap.m.DateTimeInput",
    "sap.m.PlanningCalendar",
    "sap.f.PlanningCalendarInCard",
    "sap.ui.comp.odata.FieldSelector",
    "sap.ui.comp.valuehelpdialog.ValueHelpDialog",
    "sap.ui.core.util.Export",
    "sap.ui.mdc.chart.ChartTypeButton",
    "sap.ui.mdc.field.FieldBase",
    "sap.ui.mdc.Field",
    "sap.ui.mdc.FilterField",
    "sap.ui.mdc.filterbar.p13n.AdaptationFilterBar"
];
function createControlTests(aControls) {
    loadingIndicator.hide();
    aControls.forEach(function (oControlInfo) {
        MemoryLeakCheck.checkControl(oControlInfo.name, function () {
            return new oControlInfo.controlClass();
        }, !oControlInfo.info.canRender);
    });
}
function collectControls() {
    var aControls = [];
    var mOptions = {
        excludedControls: aExcludedControls,
        excludedLibraries: ["sap.viz"],
        done: function (oResultInfo) {
            createControlTests(aControls);
            QUnit.module("MemoryLeakCheck Summary");
            QUnit.test("Test summary (" + oResultInfo.testedControlCount + " controls in " + oResultInfo.testedLibraryCount + " libraries)", function (assert) {
                assert.ok(true, "Tested Controls: " + oResultInfo.testedControlCount);
                assert.ok(true, "Tested Libraries: " + oResultInfo.testedLibraryCount);
            });
            QUnit.start();
        }
    };
    var sLib = UriParameters.fromQuery(window.location.search).get("library");
    if (sLib) {
        mOptions.librariesToTest = [sLib];
    }
    var sControl = UriParameters.fromQuery(window.location.search).get("control");
    if (sControl) {
        mOptions.controlsToTest = [sControl];
    }
    ControlIterator.run(function (sControlName, oControlClass, oInfo) {
        loadingIndicator.update(sControlName);
        aControls.push({ name: sControlName, controlClass: oControlClass, info: oInfo });
    }, mOptions);
}