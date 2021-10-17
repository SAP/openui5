import jQuery from "jquery.sap.global";
var fnOldAjax = jQuery.ajax;
var aAjaxCalls = [];
var sRoot = jQuery.sap.getModulePath("", "/");
jQuery.ajax = function (settings) {
    if (settings && settings.url && /\.js$/.test(settings.url)) {
        var sUrl = settings.url;
        sUrl = sUrl.slice(sUrl.indexOf(sRoot) == 0 ? sRoot.length : 0);
        if (sUrl.indexOf("sap/ui/thirdparty/") < 0) {
            aAjaxCalls.push(sUrl);
        }
    }
    return fnOldAjax.apply(this, arguments);
};
function ajaxCallsReset() {
    aAjaxCalls = [];
}
function ajaxCalls() {
    return aAjaxCalls;
}
var _aExpectedAjaxCalls = {};
function checkLibrary(assert, sLibraryName, bExpectLazyStubs) {
    assert = assert || window;
    if (/[?&]sap-ui-skip(B|-b)ootstrap(T|-t)ests=(true|x|X)/.test(top.location.search)) {
        assert.ok(true, "Skipped checkLibrary(\"" + sLibraryName + "\", " + bExpectLazyStubs + ") due to availability of URL parameter!");
        return;
    }
    ajaxCallsReset();
    assert.ok(sap.ui.require(sLibraryName.replace(/\./g, "/") + "/library"), "module for library " + sLibraryName + " must have been declared");
    assert.ok(jQuery.sap.getObject(sLibraryName), "namespace " + sLibraryName + " must exists");
    var oLib = sap.ui.getCore().getLoadedLibraries()[sLibraryName];
    assert.ok(!!oLib, "library info object must exists");
    var aBuiltInTypes = ["any", "boolean", "float", "int", "object", "string", "void", "function"];
    if (Array.isArray(oLib.types)) {
        oLib.types.forEach(function (sType) {
            if (aBuiltInTypes.indexOf(sType) < 0) {
                var oClass = jQuery.sap.getObject(sType);
                assert.ok(typeof oClass === "object", "type " + sType + " must be an object");
            }
        });
    }
    var sMessage = bExpectLazyStubs ? "class must be a lazy loader only" : "class must not be a lazy loader";
    var aExcludes = ["sap.ui.core.Element", "sap.ui.core.Control", "sap.ui.core.Component", "sap.ui.table.Column", "sap.ui.core.CustomData"];
    if (Array.isArray(oLib.elements)) {
        oLib.elements.forEach(function (sElement) {
            if (aExcludes.indexOf(sElement) < 0) {
                assert.notEqual(sap.ui.require(sElement), bExpectLazyStubs, "module for element " + sElement + " must have been declared");
                assert.equal(sap.ui.lazyRequire._isStub(sElement), bExpectLazyStubs, sMessage + ":" + sElement);
                if (!bExpectLazyStubs) {
                    var oClass = jQuery.sap.getObject(sElement);
                    assert.equal(typeof oClass, "function", "Element constructor for " + sElement + " must exist and must be a function");
                }
            }
        });
    }
    if (Array.isArray(oLib.controls)) {
        oLib.controls.forEach(function (sControl) {
            if (aExcludes.indexOf(sControl) < 0) {
                assert.notEqual(sap.ui.require(sControl), bExpectLazyStubs, "module for element " + sControl + " must have been declared");
                assert.equal(sap.ui.lazyRequire._isStub(sControl), bExpectLazyStubs, sMessage + ":" + sControl);
                if (!bExpectLazyStubs) {
                    var oClass = jQuery.sap.getObject(sControl);
                    assert.equal(typeof oClass, "function", "Control constructor for " + sControl + " must exist and must be a function");
                }
            }
        });
    }
    if (Array.isArray(oLib.elements)) {
        oLib.elements.forEach(function (sElement) {
            var FNClass = jQuery.sap.getObject(sElement);
            if (bExpectLazyStubs) {
                try {
                    new FNClass();
                }
                catch (e) {
                    jQuery.sap.log.error(e.message || e);
                }
                FNClass = jQuery.sap.getObject(sElement);
            }
            assert.ok(typeof FNClass.prototype.getMetadata === "function", "Element class " + sElement + " should have been loaded and initialized");
        });
    }
    if (Array.isArray(oLib.controls)) {
        oLib.controls.forEach(function (sControl) {
            var FNClass = jQuery.sap.getObject(sControl);
            if (bExpectLazyStubs) {
                try {
                    new FNClass();
                }
                catch (e) {
                    jQuery.sap.log.error(e.message || e);
                }
                FNClass = jQuery.sap.getObject(sControl);
            }
            assert.ok(typeof FNClass.prototype.getMetadata === "function", "Control class " + sControl + " should have been loaded and initialized");
        });
    }
    var aExpectedCalls = bExpectLazyStubs ? (_aExpectedAjaxCalls[sLibraryName] || []) : [];
    assert.deepEqual(ajaxCalls(), aExpectedCalls, (aExpectedCalls.length === 0 ? "no" : "only some expected") + " additional ajax calls should have happened");
}
QUnit.test("Check Existance of Core", function (assert) {
    assert.ok(jQuery, "jQuery has been loaded");
    assert.ok(jQuery.sap, "jQuery.sap namespace exists");
    assert.ok(window.sap, "sap namespace exists");
    assert.ok(sap.ui, "sap.ui namespace exists");
    assert.ok(typeof sap.ui.getCore === "function", "sap.ui.getCore exists");
    assert.ok(sap.ui.getCore(), "sap.ui.getCore() returns a value");
    var id = jQuery("html").attr("data-sap-ui-browser");
    if (sap.ui.Device.browser.name) {
        assert.ok(typeof id === "string" && id, "browser is known: data-sap-ui-browser should have been set and must not be empty");
    }
    else {
        assert.ok(!id, "browser is unknown: data-sap-ui-browser should not have been set (or empty)");
    }
    var oCfg = new sap.ui.core.Configuration();
    assert.deepEqual(oCfg.modules, ["sap.ui.layout.library", "sap.m.library", "sap.ui.table.library"], "Libraries");
});
["sap.ui.core", "sap.ui.layout", "sap.m", "sap.ui.table"].forEach(function (sLib) {
    QUnit.test("Check that library " + sLib + " has been loaded", function (assert) {
        checkLibrary(assert, sLib, true);
    });
});