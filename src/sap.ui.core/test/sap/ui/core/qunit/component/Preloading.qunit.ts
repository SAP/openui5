import jQuery from "jquery.sap.global";
import Log from "sap/base/Log";
import Component from "sap/ui/core/Component";
import UIComponent from "sap/ui/core/UIComponent";
import UIComponentMetadata from "sap/ui/core/UIComponentMetadata";
import Manifest from "sap/ui/core/Manifest";
import LoaderExtensions from "sap/base/util/LoaderExtensions";
function Deferred() {
    this.promise = new Promise(function (resolve, reject) {
        this.resolve = resolve;
        this.reject = reject;
    }.bind(this));
}
var oRealCore;
var TestCorePlugin = function () { };
TestCorePlugin.prototype.startPlugin = function (oCore, bOnInit) {
    oRealCore = oCore;
};
sap.ui.getCore().registerPlugin(new TestCorePlugin());
function unloadResources() {
    sap.ui.loader._.unloadResources("sap.test.lib2.library-preload", true, true, true);
    sap.ui.loader._.unloadResources("sap/test/lib2/library-preload.js", false, true, true);
    sap.ui.loader._.unloadResources("sap.test.lib3.library-preload", true, true, true);
    sap.ui.loader._.unloadResources("sap/test/lib3/library-preload.js", false, true, true);
    sap.ui.loader._.unloadResources("sap.test.lib4.library-preload", true, true, true);
    sap.ui.loader._.unloadResources("sap/test/lib4/library-preload.js", false, true, true);
    sap.ui.loader._.unloadResources("sap/test/mycomp/Component-preload", true, true, true);
    sap.ui.loader._.unloadResources("sap/test/mycomp/Component-preload.js", false, true, true);
    sap.ui.loader._.unloadResources("sap/test/mysubcomp/Component-preload", true, true, true);
    sap.ui.loader._.unloadResources("sap/test/mysubcomp/Component-preload.js", false, true, true);
    sap.ui.loader._.unloadResources("sap/test/manifestcomp/Component-preload", true, true, true);
    sap.ui.loader._.unloadResources("sap/test/manifestcomp/Component-preload.js", false, true, true);
    sap.ui.loader.config({
        paths: {
            "sap/test": null,
            "sap/test/lib2": null,
            "sap/test/lib3": null,
            "sap/test/lib4": null,
            "sap/test/lib5": null,
            "sap/test/mycomp": null,
            "sap/test/mysubcomp": null,
            "sap/test/my2ndsubcomp": null,
            "sap/test/manifestcomp": null
        }
    });
    jQuery("SCRIPT[data-sap-ui-module^='sap/test/']").remove();
}
QUnit.module("Async (Pre-)Loading", {
    beforeEach: function () {
        this.oRegisterResourcePathSpy = sinon.spy(LoaderExtensions, "registerResourcePath");
    },
    afterEach: function () {
        this.oRegisterResourcePathSpy.restore();
        unloadResources();
    }
});
QUnit.test("dependencies as simple strings", function (assert) {
    var done = assert.async();
    sap.ui.loader.config({ paths: { "sap/test": "test-resources/sap/ui/core/qunit/component/testdata/async" } });
    var oResult = sap.ui.component.load({
        name: "sap.test.mycomp",
        async: true,
        asyncHints: {
            libs: ["sap.test.lib2", "sap.test.lib3"],
            components: ["sap.test.mysubcomp"]
        }
    });
    assert.ok(oResult instanceof Promise, "load should return a promise");
    oResult.then(function () {
        sap.ui.component({ name: "sap.test.mycomp" });
        done();
    }, function () {
        assert.ok(false, "loading component failed");
        done();
    });
});
QUnit.test("dependencies with objects names", function (assert) {
    var done = assert.async();
    sap.ui.loader.config({ paths: { "sap/test": "test-resources/sap/ui/core/qunit/component/testdata/async" } });
    var oResult = sap.ui.component.load({
        name: "sap.test.mycomp",
        async: true,
        asyncHints: {
            libs: [
                {
                    name: "sap.test.lib2"
                },
                "sap.test.lib3"
            ],
            components: [{
                    name: "sap.test.mysubcomp"
                }]
        }
    });
    assert.ok(oResult instanceof Promise, "load should return a promise");
    oResult.then(function () {
        sap.ui.component({ name: "sap.test.mycomp" });
        done();
    }, function () {
        assert.ok(false, "loading component failed");
        done();
    });
});
QUnit.test("dependencies with names and some URLs", function (assert) {
    var done = assert.async();
    sap.ui.loader.config({ paths: { "sap/test/lib3": "test-resources/sap/ui/core/qunit/component/testdata/async/lib3" } });
    sap.ui.loader.config({ paths: { "sap/test/lib4": "test-resources/sap/ui/core/qunit/component/testdata/async/lib4" } });
    sap.ui.loader.config({ paths: { "sap/test/mycomp": "test-resources/sap/ui/core/qunit/component/testdata/async/mycomp" } });
    var oResult = sap.ui.component.load({
        name: "sap.test.mycomp",
        async: true,
        asyncHints: {
            libs: [
                {
                    name: "sap.test.lib2",
                    url: "test-resources/sap/ui/core/qunit/component/testdata/components/async/lib2"
                },
                "sap.test.lib3"
            ],
            components: [{
                    name: "sap.test.mysubcomp",
                    url: "test-resources/sap/ui/core/qunit/component/testdata/components/async/mysubcomp"
                }]
        }
    });
    assert.ok(oResult instanceof Promise, "load should return a promise");
    oResult.then(function () {
        sap.ui.component({ name: "sap.test.mycomp" });
        done();
    }, function () {
        assert.ok(false, "loading component failed");
        done();
    });
});
QUnit.test("dependencies with names, some URLs and lazy dependencies", function (assert) {
    var done = assert.async();
    sap.ui.loader.config({ paths: { "sap/test/lib3": "test-resources/sap/ui/core/qunit/component/testdata/async/lib3" } });
    sap.ui.loader.config({ paths: { "sap/test/lib4": "test-resources/sap/ui/core/qunit/component/testdata/async/lib4" } });
    sap.ui.loader.config({ paths: { "sap/test/mycomp": "test-resources/sap/ui/core/qunit/component/testdata/async/mycomp" } });
    var oResult = sap.ui.component.load({
        name: "sap.test.mycomp",
        async: true,
        asyncHints: {
            libs: [
                {
                    name: "sap.test.lib2",
                    url: "test-resources/sap/ui/core/qunit/component/testdata/async/lib2",
                    lazy: false
                },
                {
                    name: "sap.test.lib5",
                    url: "test-resources/sap/ui/core/qunit/component/testdata/async/lib5",
                    lazy: true
                },
                {
                    name: "sap.test.lib6",
                    lazy: true
                },
                {
                    name: "sap.test.lib7",
                    lazy: true,
                    url: {
                        url: "test-resources/sap/ui/core/qunit/component/testdata/async/lib7",
                        "final": true
                    }
                },
                "sap.test.lib3"
            ],
            components: [
                {
                    name: "sap.test.mysubcomp",
                    url: "test-resources/sap/ui/core/qunit/component/testdata/async/mysubcomp"
                },
                {
                    name: "sap.test.my2ndsubcomp",
                    url: "test-resources/sap/ui/core/qunit/component/testdata/async/my2ndsubcomp",
                    lazy: true
                },
                {
                    name: "sap.test.my3rdsubcomp",
                    lazy: true
                },
                {
                    name: "sap.test.my4thsubcomp",
                    lazy: true,
                    url: {
                        url: "test-resources/sap/ui/core/qunit/component/testdata/async/my4thsubcomp",
                        "final": true
                    }
                }
            ]
        }
    });
    assert.ok(oResult instanceof Promise, "load should return a promise");
    oResult.then(function () {
        sinon.assert.callCount(this.oRegisterResourcePathSpy, 6);
        sinon.assert.calledWithMatch(this.oRegisterResourcePathSpy, "sap/test/lib2", "test-resources/sap/ui/core/qunit/component/testdata/async/lib2");
        sinon.assert.calledWithMatch(this.oRegisterResourcePathSpy, "sap/test/lib5", "test-resources/sap/ui/core/qunit/component/testdata/async/lib5");
        sinon.assert.calledWithMatch(this.oRegisterResourcePathSpy, "sap/test/lib7", {
            url: "test-resources/sap/ui/core/qunit/component/testdata/async/lib7",
            "final": true
        });
        sinon.assert.calledWithMatch(this.oRegisterResourcePathSpy, "sap/test/mysubcomp", "test-resources/sap/ui/core/qunit/component/testdata/async/mysubcomp");
        sinon.assert.calledWithMatch(this.oRegisterResourcePathSpy, "sap/test/my2ndsubcomp", "test-resources/sap/ui/core/qunit/component/testdata/async/my2ndsubcomp");
        sinon.assert.calledWithMatch(this.oRegisterResourcePathSpy, "sap/test/my4thsubcomp", {
            url: "test-resources/sap/ui/core/qunit/component/testdata/async/my4thsubcomp",
            "final": true
        });
        sap.ui.component({ name: "sap.test.mycomp" });
        done();
    }.bind(this), function () {
        assert.ok(false, "loading component failed");
        done();
    });
});
QUnit.test("Manifest from component instance", function (assert) {
    var oManifest = {
        "sap.app": {
            "id": "samples.components.button"
        }
    };
    var oServer = this._oSandbox.useFakeServer();
    oServer.autoRespond = true;
    oServer.xhr.useFilters = true;
    oServer.xhr.addFilter(function (method, url) {
        return url !== "/anylocation/manifest.json?sap-language=EN";
    });
    oServer.respondWith("GET", "/anylocation/manifest.json?sap-language=EN", [
        200,
        {
            "Content-Type": "application/json"
        },
        JSON.stringify(oManifest)
    ]);
    var oCompPromise = sap.ui.component({
        manifestUrl: "/anylocation/manifest.json",
        async: true
    });
    var oDone = assert.async();
    oCompPromise.then(function (oComponent) {
        assert.ok(true, "Promise of Component has been resolved correctly");
        assert.ok(oComponent.getMetadata() instanceof UIComponentMetadata, "The metadata is instance of UIComponentMetadata");
        assert.ok(oComponent.getManifest(), "Manifest is available");
        assert.deepEqual(oComponent.getManifest(), oManifest, "Manifest matches the manifest behind manifestUrl");
        var sAcceptLanguage = oServer.requests && oServer.requests[0] && oServer.requests[0].requestHeaders && oServer.requests[0].requestHeaders["Accept-Language"];
        assert.equal(sAcceptLanguage, "en", "Manifest was requested with proper language");
        oDone();
    }, function (oError) {
        assert.ok(false, "Promise of Component hasn't been resolved correctly");
        oDone();
    });
});
QUnit.test("waitFor component", function (assert) {
    var done = assert.async();
    var bPromiseResolved = false;
    var p = new Promise(function (fnResolve, fnReject) {
        setTimeout(function () {
            bPromiseResolved = true;
            assert.ok(true, "Promise was resolved.");
            fnResolve();
        }, 1000);
    });
    sap.ui.loader.config({ paths: { "sap/test": "test-resources/sap/ui/core/qunit/component/testdata/async" } });
    sap.ui.component({
        name: "sap.test.mycomp",
        async: true,
        asyncHints: {
            waitFor: p
        }
    }).then(function (oComponent) {
        assert.ok(bPromiseResolved, "Promise was resolved before Component instantiation.");
        done();
    }, function (oError) {
        assert.ok(false, "Promise of Component hasn't been resolved correctly.");
        done();
    });
});
QUnit.test("sap.ui.component: 'asyncHints.preloadOnly' should be ignored", function (assert) {
    sap.ui.loader.config({ paths: { "sap/test": "test-resources/sap/ui/core/qunit/component/testdata/async" } });
    return sap.ui.component({
        name: "sap.test.mycomp",
        async: true,
        asyncHints: {
            preloadOnly: true
        }
    }).then(function (oComponent) {
        assert.ok(oComponent instanceof Component, "Component has been created.");
    });
});
QUnit.module("Synchronization of Preloads", {
    beforeEach: function (assert) {
        this.oldCfgPreload = oRealCore.oConfiguration.preload;
        this.loadScript = sinon.stub(sap.ui.loader._, "loadJSResourceAsync");
        this.requireSpy = sinon.stub(sap.ui, "require").callsArgWith(1);
    },
    afterEach: function (assert) {
        oRealCore.oConfiguration.preload = this.oldCfgPreload;
        this.requireSpy.restore();
        this.loadScript.restore();
    }
});
QUnit.test("preload only", function (assert) {
    oRealCore.oConfiguration.preload = "async";
    function contains(dep) {
        return sinon.match(function (value) {
            return Array.isArray(value) && value.indexOf(dep) >= 0;
        });
    }
    this.loadScript.withArgs("scenario1/comp/Component-preload.js").returns(Promise.resolve(true));
    this.loadScript.withArgs("scenario1/lib1/library-preload.js").returns(Promise.resolve(true));
    this.loadScript.withArgs("scenario1/lib2/library-preload.js").returns(Promise.resolve(true));
    this.requireSpy.withArgs(["scenario1/comp/Component"]).callsArgWith(1, Component);
    return sap.ui.component.load({
        name: "scenario1.comp",
        async: true,
        asyncHints: {
            libs: ["scenario1.lib1", "scenario1.lib2"],
            preloadOnly: true
        }
    }).then(function (ComponentClass) {
        assert.ok(this.loadScript.calledThrice, "loadJSResourceAsync has been called 3 times");
        assert.ok(this.requireSpy.neverCalledWith(contains("scenario1/lib1/library")), "lib1 never has been required");
        assert.ok(this.requireSpy.neverCalledWith(contains("scenario1/lib2/library")), "lib2 never has been required");
        assert.ok(this.requireSpy.neverCalledWith(contains("scenario1/comp/Component")), "component never has been required");
        return sap.ui.component.load({
            name: "scenario1.comp",
            async: true,
            asyncHints: {
                libs: ["scenario1.lib1", "scenario1.lib2"]
            }
        }).then(function () {
            assert.ok(this.requireSpy.calledWith(contains("scenario1/lib1/library")), "lib1 has been required");
            assert.ok(this.requireSpy.calledWith(contains("scenario1/lib2/library")), "lib2 has been required");
            assert.ok(this.requireSpy.calledWith(contains("scenario1/comp/Component")), "component has been required");
        }.bind(this));
    }.bind(this));
});
QUnit.test("preload bundles and libs", function (assert) {
    oRealCore.oConfiguration.preload = "async";
    function contains(dep) {
        return sinon.match(function (value) {
            return Array.isArray(value) && value.indexOf(dep) >= 0;
        });
    }
    var taskChecksDone = assert.async();
    var deferredBundle = new Deferred();
    var deferredLib1 = new Deferred();
    var deferredLib2 = new Deferred();
    this.loadScript.withArgs("scenario2/bundle.js").returns(deferredBundle.promise);
    this.loadScript.withArgs("scenario2/lib1/library-preload.js").returns(deferredLib1.promise);
    this.loadScript.withArgs("scenario2/lib2/library-preload.js").returns(deferredLib2.promise);
    this.loadScript.withArgs("scenario2/comp/Component-preload.js").returns(Promise.resolve(true));
    this.requireSpy.withArgs(["scenario2/comp/Component"]).callsArgWith(1, Component);
    var promise = sap.ui.component({
        name: "scenario2.comp",
        async: true,
        asyncHints: {
            preloadBundles: [
                "scenario2/bundle.js"
            ],
            libs: ["scenario2.lib1", "scenario2.lib2"]
        }
    });
    setTimeout(function () {
        assert.ok(this.requireSpy.neverCalledWith(contains("scenario2/lib1/library")), "lib1 never has been required");
        assert.ok(this.requireSpy.neverCalledWith(contains("scenario2/lib2/library")), "lib2 never has been required");
        assert.ok(this.requireSpy.neverCalledWith(contains("scenario2/comp/Component")), "component never has been required");
        deferredLib1.resolve(true);
        deferredLib2.resolve(true);
        setTimeout(function () {
            assert.ok(this.requireSpy.neverCalledWith(contains("scenario2/lib1/library")), "lib1 has not been required as long as loading the bundle did not resolve");
            assert.ok(this.requireSpy.neverCalledWith(contains("scenario2/lib2/library")), "lib2 has not been required as long as loading the bundle did not resolve");
            assert.ok(this.requireSpy.neverCalledWith(contains("scenario2/comp/Component")), "component never has been required");
            deferredBundle.resolve();
            setTimeout(function () {
                assert.ok(this.requireSpy.calledWith(contains("scenario2/lib1/library")), "lib1 has been required");
                assert.ok(this.requireSpy.calledWith(contains("scenario2/lib2/library")), "lib2 has been required");
                assert.ok(this.requireSpy.calledWith(contains("scenario2/comp/Component")), "component has been required");
                taskChecksDone();
            }.bind(this), 10);
        }.bind(this), 10);
    }.bind(this), 10);
    return promise;
});
QUnit.module("Async (Pre-)Loading (Manifest First)", {
    beforeEach: function () {
        this.oldCfgPreload = oRealCore.oConfiguration.preload;
        sap.ui.loader.config({ paths: { "sap/test": "test-resources/sap/ui/core/qunit/component/testdata/async" } });
        this.oLogWarningSpy = sinon.spy(Log, "warning");
        this.oLoadLibrariesSpy = sinon.spy(sap.ui.getCore(), "loadLibraries");
        this.oLoadLibrarySpy = sinon.spy(sap.ui.getCore(), "loadLibrary");
        this.oRegisterPreloadedModulesSpy = sinon.spy(jQuery.sap, "registerPreloadedModules");
        this.oManifestLoad = sinon.spy(Manifest, "load");
    },
    afterEach: function () {
        oRealCore.oConfiguration.preload = this.oldCfgPreload;
        unloadResources();
        this.oLogWarningSpy.restore();
        this.oLoadLibrariesSpy.restore();
        this.oLoadLibrarySpy.restore();
        this.oRegisterPreloadedModulesSpy.restore();
        this.oManifestLoad.restore();
        Component._fnLoadComponentCallback = undefined;
    }
});
QUnit.test("dependencies with manifest component", function (assert) {
    oRealCore.oConfiguration.preload = "async";
    var done = assert.async();
    sap.ui.component({
        manifestUrl: "test-resources/sap/ui/core/qunit/component/testdata/async/manifestcomp/manifest.json",
        async: true
    }).then(function (oComponent) {
        assert.ok(oComponent instanceof Component, "Component has been created.");
        sinon.assert.calledOnce(this.oManifestLoad);
        sinon.assert.calledWithExactly(this.oLoadLibrariesSpy, [
            "sap.test.lib2",
            "sap.test.lib4"
        ], {
            async: true
        });
        sinon.assert.calledWithMatch(this.oRegisterPreloadedModulesSpy, {
            name: "sap/test/manifestcomp/Component-preload"
        });
        sinon.assert.calledWithMatch(this.oRegisterPreloadedModulesSpy, {
            name: "sap/test/mycomp/Component-preload"
        });
        sinon.assert.neverCalledWithMatch(this.oRegisterPreloadedModulesSpy, {
            name: "sap/test/mysubcomp/Component-preload"
        });
        assert.ok(sap.ui.require("sap/test/mycomp/Component"), "mycomp Component class should be loaded");
        assert.ok(!sap.ui.require("sap/test/mysubcomp/Component"), "mysubcomp Component class should not be loaded");
        sinon.assert.neverCalledWithMatch(this.oLogWarningSpy, "Do not use deprecated function 'sap.ui.component.load'");
        done();
    }.bind(this), function (oError) {
        assert.ok(false, "Promise of Component hasn't been resolved correctly.");
        done();
    });
});
QUnit.test("dependencies with component (no manifest first)", function (assert) {
    oRealCore.oConfiguration.preload = "async";
    var done = assert.async();
    sap.ui.component({
        name: "sap.test.manifestcomp",
        async: true
    }).then(function (oComponent) {
        assert.ok(oComponent instanceof Component, "Component has been created.");
        sinon.assert.calledWithExactly(this.oLoadLibrarySpy, "sap.test.lib2", { async: true });
        sinon.assert.calledWithExactly(this.oLoadLibrarySpy, "sap.test.lib4", { async: true });
        sinon.assert.calledWithMatch(this.oRegisterPreloadedModulesSpy, {
            name: "sap/test/manifestcomp/Component-preload"
        });
        sinon.assert.calledWithMatch(this.oRegisterPreloadedModulesSpy, {
            name: "sap/test/mycomp/Component-preload"
        });
        sinon.assert.neverCalledWithMatch(this.oRegisterPreloadedModulesSpy, {
            name: "sap/test/mysubcomp/Component-preload"
        });
        assert.ok(sap.ui.require("sap/test/mycomp/Component"), "mycomp Component class should be loaded");
        assert.ok(!sap.ui.require("sap/test/mysubcomp/Component"), "mysubcomp Component class should not be loaded");
        sinon.assert.notCalled(this.oManifestLoad);
        done();
    }.bind(this), function (oError) {
        assert.ok(false, "Promise of Component hasn't been resolved correctly.");
        done();
    });
});
QUnit.test("load component callback", function (assert) {
    var done = assert.async();
    jQuery.getJSON("test-resources/sap/ui/core/qunit/component/testdata/async/manifestcomp/manifest.json", function (oLoadedManifest) {
        var oConfig = {
            manifestUrl: "test-resources/sap/ui/core/qunit/component/testdata/async/manifestcomp/manifest.json",
            async: true,
            asyncHints: {
                libs: ["sap.ui.core"],
                requests: [{ name: "sap.ui.fl.changes", reference: "componentName" }]
            }
        };
        var oStorage = {};
        var fnCheckForModification = function (oComponent) {
            var oOriginalManifest = oComponent.getManifest();
            assert.deepEqual(oOriginalManifest, this.manifestInCallback.getJson(), "the manifest was passed as a copy");
            done();
        };
        Component._fnLoadComponentCallback = function (oConfig, oManifest, oPassedConfig, oPassedManifest) {
            if (this.manifestInCallback) {
                return;
            }
            assert.ok(true, "Component._fnLoadComponentCallback called!");
            assert.deepEqual(oConfig, oPassedConfig, "the config was passed");
            assert.notEqual(oConfig, oPassedConfig, "the passed config is a copy");
            assert.deepEqual(oManifest, oPassedManifest.getRawJson(), "the manifest was passed");
            return Promise.resolve().then(function () {
                oPassedManifest.getJson().modification = "someModification";
                this.manifestInCallback = oPassedManifest;
            }.bind(this));
        }.bind(oStorage, oConfig, oLoadedManifest);
        var oComponentPromise = sap.ui.component(oConfig);
        oComponentPromise.then(fnCheckForModification.bind(oStorage));
    });
});
QUnit.module("Consume Transitive dependency information", {
    beforeEach: function () {
        sap.ui.loader.config({
            paths: {
                "testlibs": "test-resources/sap/ui/core/qunit/testdata/libraries"
            }
        });
    },
    afterEach: function () {
        sap.ui.loader.config({
            paths: {
                "testlibs": null
            }
        });
    }
});
QUnit.test("Load library-preload.js instead of Component-preload.js when the Component.js is included in a library preload", function (assert) {
    return LoaderExtensions.loadResource({
        dataType: "json",
        url: sap.ui.require.toUrl("testlibs/scenario15/sap-ui-version.json"),
        async: true
    }).then(function (versioninfo) {
        sap.ui.versioninfo = versioninfo;
        this.spy(sap.ui, "require");
        this.spy(sap.ui.loader._, "loadJSResourceAsync");
        var loadLibrariesSpy = this.spy(sap.ui.getCore(), "loadLibraries");
        this.spy(LoaderExtensions, "loadResource");
        var pLoad = Component.load({
            name: "testlibs.scenario15.lib1.comp"
        });
        assert.equal(LoaderExtensions.loadResource.callCount, 1, "The loadResource call is called once");
        var sURL = LoaderExtensions.loadResource.getCall(0).args[0].url;
        assert.ok(/\/scenario15\/lib1\/comp\/manifest\.json/.test(sURL), "The manifest.json load request is sent");
        return pLoad.then(function () {
            sinon.assert.calledWith(sap.ui.require, ["testlibs/scenario15/lib1/comp/Component"]);
            sinon.assert.neverCalledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/Component-preload\.js$/));
            var loadedLibraries = loadLibrariesSpy.getCall(0).args[0];
            assert.deepEqual(loadedLibraries, [
                "testlibs.scenario15.lib1",
                "testlibs.scenario15.lib3",
                "testlibs.scenario15.lib4",
                "testlibs.scenario15.lib6",
                "testlibs.scenario15.lib8",
                "testlibs.scenario15.lib9"
            ]);
            sinon.assert.calledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario15\/lib10\/library-preload\.js$/));
            sinon.assert.neverCalledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario15\/lib5\/library-preload\.js$/));
        });
    }.bind(this));
});
QUnit.module("Misc", {
    beforeEach: function () {
        sap.ui.loader.config({ paths: { "sap/test": "test-resources/sap/ui/core/qunit/component/testdata/async" } });
    },
    afterEach: function () {
        unloadResources();
    }
});
QUnit.test("delegate runAsOwner", function (assert) {
    var done = assert.async();
    var oOwnerComponent = new UIComponent("ownerId");
    oOwnerComponent.runAsOwner(function () {
        sap.ui.component({
            manifestUrl: "test-resources/sap/ui/core/qunit/component/testdata/async/manifestcomp/manifest.json",
            async: true
        }).then(function (oComponent) {
            assert.equal(Component.getOwnerIdFor(oComponent), "ownerId", "Owner Component delegated properly.");
            done();
        }, function (oError) {
            assert.ok(false, "Promise of Component hasn't been resolved correctly.");
            done();
        });
    });
});
QUnit.test("Load library-preload.js instead of Component-preload.js when the Component.js is included in a library preload (embeddedBy check)", function (assert) {
    this.spy(sap.ui.loader._, "loadJSResourceAsync");
    return Component.create({
        name: "sap.ui.test.embedded"
    }).then(function (oComponent) {
        sinon.assert.neverCalledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/Component-preload\.js$/));
    });
});