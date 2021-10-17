import LoaderExtensions from "sap/base/util/LoaderExtensions";
QUnit.module("sap.base.util.LoaderExtensions");
QUnit.test("getAllRequiredModules", function (assert) {
    assert.expect(6);
    var done = assert.async();
    var aModules = LoaderExtensions.getAllRequiredModules();
    assert.ok(Array.isArray(aModules), "should return an array");
    assert.ok(aModules.every(function (s) { return typeof s == "string"; }), "should only contain strings");
    assert.notOk(sap.ui.require("my.required.module"), "module has not yet been loaded");
    assert.notOk(aModules.indexOf("my.required.module") != -1, "module is not contained");
    sap.ui.define("my.required.module", [], function () {
        return {};
    });
    sap.ui.require(["my.required.module"], function (module) {
        aModules = LoaderExtensions.getAllRequiredModules();
        assert.ok(module, "module has been loaded");
        assert.ok(aModules.indexOf("my.required.module") != -1, "module is contained");
        done();
    });
});
QUnit.test("toURL - resolve ui5:// pseudo protocol", function (assert) {
    sap.ui.loader.config({
        paths: {
            "my/path/to/ui5app": "test-resource/my/path/to/something",
            "my.path.to.dots.ui5app": "test-resource/my/path/to/something/with/dots",
            "my/cross/app": "http://somewhere.else/my/cross/app/deployment"
        }
    });
    var sResolvedURL = LoaderExtensions.resolveUI5Url("ui5://my/path/to/ui5app/file/some.xml");
    assert.equal(sResolvedURL, sap.ui.loader._.resolveURL("test-resource/my/path/to/something/file/some.xml"), "simple url resolution");
    var sResolvedURLDots = LoaderExtensions.resolveUI5Url("ui5://my.path.to.dots.ui5app/file/some.xml");
    assert.equal(sResolvedURLDots, sap.ui.loader._.resolveURL("test-resource/my/path/to/something/with/dots/file/some.xml"), "simple url resolution");
    var sResolvedURLWithUrlParams = LoaderExtensions.resolveUI5Url("ui5://my/path/to/ui5app/file/some.xml?param1=true&param2=5");
    assert.equal(sResolvedURLWithUrlParams, sap.ui.loader._.resolveURL("test-resource/my/path/to/something/file/some.xml?param1=true&param2=5"), "simple url resolution");
    var sResolvedURLDotsWithUrlParams = LoaderExtensions.resolveUI5Url("ui5://my.path.to.dots.ui5app/file/some.xml?param1=true&param2=5");
    assert.equal(sResolvedURLDotsWithUrlParams, sap.ui.loader._.resolveURL("test-resource/my/path/to/something/with/dots/file/some.xml?param1=true&param2=5"), "simple url resolution");
    var sResolvedCrossURL = LoaderExtensions.resolveUI5Url("ui5://my/cross/app/file/some.xml");
    assert.equal(sResolvedCrossURL, sap.ui.loader._.resolveURL("http://somewhere.else/my/cross/app/deployment/file/some.xml"), "cross origin url resolution");
    var sUnmappedCrossURL = LoaderExtensions.resolveUI5Url("ui5://my/cross/app/file/some.xml?param1=true&param2=5");
    assert.equal(sUnmappedCrossURL, sap.ui.loader._.resolveURL("http://somewhere.else/my/cross/app/deployment/file/some.xml?param1=true&param2=5"), "cross origin url resolution");
    var sUnmappedURLDots = LoaderExtensions.resolveUI5Url("ui5://dot.namespace.not.registered/file/some.xml");
    assert.equal(sUnmappedURLDots, sap.ui.loader._.resolveURL("resources/dot.namespace.not.registered/file/some.xml"), "unmapped paths");
    var sUnmappedURLSlashes = LoaderExtensions.resolveUI5Url("ui5://other/namespace/not/registered/file/some.xml");
    assert.equal(sUnmappedURLSlashes, sap.ui.loader._.resolveURL("resources/other/namespace/not/registered/file/some.xml"), "unmapped paths");
    var sUnmappedDotsWithUrlParams = LoaderExtensions.resolveUI5Url("ui5://other.namespace.not.registered/file/some.xml?param1=true&param2=5");
    assert.equal(sUnmappedDotsWithUrlParams, sap.ui.loader._.resolveURL("resources/other.namespace.not.registered/file/some.xml?param1=true&param2=5"), "unmapped paths with url params");
    var sUnmappedSlashesWithUrlParams = LoaderExtensions.resolveUI5Url("ui5://other/namespace/not/registered/file/some.xml?param1=true&param2=5");
    assert.equal(sUnmappedSlashesWithUrlParams, sap.ui.loader._.resolveURL("resources/other/namespace/not/registered/file/some.xml?param1=true&param2=5"), "unmapped paths with url params");
});