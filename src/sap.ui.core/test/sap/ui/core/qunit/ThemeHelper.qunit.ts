import ThemeHelper from "sap/ui/core/theming/ThemeHelper";
QUnit.module("ThemeHelper");
QUnit.test("getMetadata from inline parameter", function (assert) {
    var done = assert.async();
    var oMetadata;
    sap.ui.getCore().loadLibrary("testlibs.themeParameters.lib12", { async: true }).then(function () {
        var fnAssertThemeChanged = function () {
            oMetadata = ThemeHelper.getMetadata("sap-ui-theme-testlibs-themeParameters-lib12");
            assert.deepEqual(oMetadata, {
                "Path": "UI5.sample/path",
                "PathPattern": "/%UI5%/sample/%pattern%.css",
                "Extends": ["sap_hcb", "base"],
                "Version": {
                    "Build": "1.0.0",
                    "Source": "1.0.0",
                    "Engine": "1.0.0"
                },
                "Scopes": [
                    "TestScope1"
                ]
            }, "Metadata correct");
            sap.ui.getCore().detachThemeChanged(fnAssertThemeChanged);
            done();
        };
        sap.ui.getCore().attachThemeChanged(fnAssertThemeChanged);
    });
    oMetadata = ThemeHelper.getMetadata("sap-ui-theme-testlibs-themeParameters-lib12");
    assert.notOk(oMetadata, "Metadata not available yet");
});
QUnit.test("getMetadata from CSS variable", function (assert) {
    var done = assert.async();
    var oMetadata;
    sap.ui.getCore().loadLibrary("testlibs.themeParameters.lib4variables", { async: true }).then(function () {
        var fnAssertThemeChanged = function () {
            oMetadata = ThemeHelper.getMetadata("sap-ui-theme-testlibs-themeParameters-lib4variables");
            assert.deepEqual(oMetadata, {
                "Path": "UI5.sample/path",
                "PathPattern": "/%UI5%/sample/%pattern%.css",
                "Extends": ["sap_hcb", "base"],
                "Version": {
                    "Build": "1.0.0",
                    "Source": "1.0.0",
                    "Engine": "1.0.0"
                },
                "Scopes": [
                    "TestScope1"
                ]
            }, "Metadata correct");
            sap.ui.getCore().detachThemeChanged(fnAssertThemeChanged);
            done();
        };
        sap.ui.getCore().attachThemeChanged(fnAssertThemeChanged);
    });
    oMetadata = ThemeHelper.getMetadata("sap-ui-theme-testlibs-themeParameters-lib4variables");
    assert.notOk(oMetadata, "Metadata not available yet");
});