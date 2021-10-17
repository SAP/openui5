import Global from "sap/ui/Global";
import Component from "sap/ui/core/Component";
function noop() { }
QUnit.module("When a Component is contained in a Library,", {
    before: function () {
        Global.versioninfo = {
            "name": "qunit",
            "version": "1.0.0",
            "buildTimestamp": "<TIMESTAMP>",
            "scmRevision": "<HASH>",
            "gav": "<GAV>",
            "libraries": [],
            "components": {
                "sap.ui.test.componentContainedInLibrary.Comp1": {
                    "library": "sap.ui.test.componentContainedInLibrary",
                    "manifestHints": {
                        "dependencies": {
                            "libs": {
                                "sap.m": {},
                                "sap.ui.core": {},
                                "sap.ui.layout": {}
                            }
                        }
                    }
                },
                "sap.ui.test.componentContainedInLibrary.Comp2": {
                    "hasOwnPreload": true,
                    "library": "sap.ui.test.componentContainedInLibrary",
                    "manifestHints": {
                        "dependencies": {
                            "libs": {
                                "sap.m": {},
                                "sap.ui.core": {},
                                "sap.ui.layout": {},
                                "sap.ui.unified": {}
                            }
                        }
                    }
                }
            }
        };
    }
});
QUnit.test("and bundled as part of the library-preload...", function (assert) {
    var success = Promise.resolve();
    var loadLibs = this.stub(sap.ui.getCore(), "loadLibraries").returns(success);
    var loadPreload = this.stub(sap.ui.loader._, "loadJSResourceAsync").returns(success);
    return Component.create({
        name: "sap.ui.test.componentContainedInLibrary.Comp1",
        manifest: false
    }).catch(noop).finally(function () {
        assert.ok(loadLibs.calledWith(sinon.match.array.contains(["sap.m", "sap.ui.core", "sap.ui.layout", "sap.ui.test.componentContainedInLibrary"])), "...then that library should be implicitly loaded");
        assert.ok(loadPreload.neverCalledWith(sinon.match(/sap\/ui\/test\/componentContainedInLibrary\/Comp1\/Component-preload\.js$/)), "...then no Component-preload file should be requested for the component");
    });
});
QUnit.test("and bundled separately...", function (assert) {
    var success = Promise.resolve();
    var loadLibs = this.stub(sap.ui.getCore(), "loadLibraries").returns(success);
    var loadPreload = this.stub(sap.ui.loader._, "loadJSResourceAsync").returns(success);
    return Component.create({
        name: "sap.ui.test.componentContainedInLibrary.Comp2",
        manifest: false
    }).catch(noop).finally(function () {
        assert.ok(loadLibs.neverCalledWith(sinon.match.array.contains(["sap.ui.test.componentContainedInLibrary"])), "...then the containing library should not be loaded");
        assert.ok(loadPreload.calledWith(sinon.match(/sap\/ui\/test\/componentContainedInLibrary\/Comp2\/Component-preload\.js$/)), "...then a Component-preload file should be requested for the component");
    });
});