import Parameters from "sap/ui/core/theming/Parameters";
var sBaseUri = new URI(sap.ui.require.toUrl("testdata/core"), document.baseURI).toString();
function checkLibraryParametersJsonRequestForLib(sLibNumber) {
    return window.performance.getEntriesByType("resource").filter(function (oResource) {
        return oResource.name.endsWith("themeParameters/lib" + sLibNumber + "/themes/sap_hcb/library-parameters.json");
    });
}
QUnit.module("CSS Variables - SYNC");
QUnit.test("Parameters.get() - get all access with CSS Variables (lib already loaded)", function (assert) {
    sap.ui.getCore().loadLibrary("testlibs.themeParameters.lib1variables");
    return new Promise(function (resolve) {
        var fnAssertThemeChanged = function () {
            sap.ui.getCore().detachThemeChanged(fnAssertThemeChanged);
            var mParams = Parameters.get();
            assert.strictEqual(checkLibraryParametersJsonRequestForLib("1variables").length, 1, "library-parameters.json requested once for testlibs.themeParameters.lib1variables");
            assert.equal(mParams["lib1_sample-variable"], "16px", "Parameter 'sample-variable' is correct.");
            assert.equal(mParams["lib1_with.dot:andcolon"], "24px", "Parameter 'with.dot:andcolon' is correct.");
            assert.equal(mParams["lib1_andcolon"], "14px", "Parameter 'andcolon' is correct.");
            assert.equal(mParams["lib1_foo"], "1rem", "Parameter 'foo' is correct.");
            assert.equal(mParams["lib1_paramWithRelativeUrlQuoted"], "url('" + sBaseUri + "/testdata/libraries/themeParameters/lib1variables/themes/sap_hcb/img/icons/relative_quoted.png')", "Parameter with URL is correctly resolved");
            assert.equal(mParams["lib1_paramWithRelativeUrlAutoEscaped"], "url('" + sBaseUri + "/testdata/libraries/themeParameters/lib1variables/themes/sap_hcb/img/icons/relative_auto-escaped.png')", "Parameter with URL is correctly resolved");
            assert.equal(mParams["lib1_paramWithAbsoluteUrlQuoted"], "url(\"http://somewhere.foo/img/icons/absolute_quoted.png\")", "Parameter with absolute URL is untouched.");
            assert.equal(mParams["lib1_paramWithAbsoluteUrlAutoEscaped"], "url(http://somewhere.foo/img/icons/absolute_auto-escaped.png)", "Parameter with absolute URL is untouched.");
            resolve();
        };
        sap.ui.getCore().attachThemeChanged(fnAssertThemeChanged);
    });
});
QUnit.test("Parameters.get() - get all access with CSS Variables (lib not loaded yet)", function (assert) {
    sap.ui.getCore().loadLibrary("testlibs.themeParameters.lib2variables");
    var mParams = Parameters.get();
    assert.strictEqual(checkLibraryParametersJsonRequestForLib("2variables").length, 1, "library-parameters.json requested once for testlibs.themeParameters.lib2variables");
    assert.equal(mParams["lib2_sample-variable"], "16px", "Parameter 'sample-variable' is correct.");
    assert.equal(mParams["lib2_with.dot:andcolon"], "24px", "Parameter 'with.dot:andcolon' is correct.");
    assert.equal(mParams["lib2_andcolon"], "14px", "Parameter 'andcolon' is correct.");
    assert.equal(mParams["lib2_foo"], "1rem", "Parameter 'foo' is correct.");
    assert.equal(mParams["lib2_paramWithRelativeUrlQuoted"], "url('" + sBaseUri + "/testdata/libraries/themeParameters/lib2variables/themes/sap_hcb/img/icons/relative_quoted.png')", "Parameter with URL is correctly resolved");
    assert.equal(mParams["lib2_paramWithRelativeUrlAutoEscaped"], "url('" + sBaseUri + "/testdata/libraries/themeParameters/lib2variables/themes/sap_hcb/img/icons/relative_auto-escaped.png')", "Parameter with URL is correctly resolved");
    assert.equal(mParams["lib2_paramWithAbsoluteUrlQuoted"], "url(\"http://somewhere.foo/img/icons/absolute_quoted.png\")", "Parameter with absolute URL is untouched.");
    assert.equal(mParams["lib2_paramWithAbsoluteUrlAutoEscaped"], "url(http://somewhere.foo/img/icons/absolute_auto-escaped.png)", "Parameter with absolute URL is untouched.");
});