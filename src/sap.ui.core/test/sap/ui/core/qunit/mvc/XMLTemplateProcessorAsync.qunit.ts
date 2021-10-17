import Button from "sap/m/Button";
import coreLibrary from "sap/ui/core/library";
import Component from "sap/ui/core/Component";
import UIComponent from "sap/ui/core/UIComponent";
import XMLTemplateProcessor from "sap/ui/core/XMLTemplateProcessor";
import XMLProcessingMode from "sap/ui/core/mvc/XMLProcessingMode";
import jQuery from "sap/ui/thirdparty/jquery";
var ViewType = coreLibrary.mvc.ViewType;
QUnit.module("enrichTemplateIdsPromise", {
    beforeEach: function (assert) {
        var done = assert.async();
        this.oRootView = sap.ui.xmlview({
            viewName: "testdata/view/XMLTemplateProcessorAsync_root",
            id: "root",
            async: true
        });
        this.oView = sap.ui.xmlview({
            viewName: "testdata/view/XMLTemplateProcessorAsync",
            id: "view",
            async: true
        });
        this.oRootView.loaded().then(function () {
            this.oView.loaded().then(function () {
                this.xView = this.oView._xContent;
                done();
            }.bind(this));
        }.bind(this));
    },
    afterEach: function () {
        this.oRootView.destroy();
        this.oView.destroy();
    }
});
QUnit.test("create IDs", function (assert) {
    assert.expect(6);
    var done = assert.async();
    assert.ok(jQuery.isXMLDoc(this.xView), "valid xml document as input");
    XMLTemplateProcessor.enrichTemplateIdsPromise(this.xView, this.oRootView, true).then(function (xml) {
        assert.ok(jQuery.isXMLDoc(xml), "valid xml document returned");
        assert.strictEqual(xml, this.xView, "no copying");
        var node = jQuery(this.xView).find("#root--button")[0];
        assert.ok(node, "control was found by full id");
        assert.equal(node.nodeName, "Button", "button is a button");
        assert.equal(node.getAttributeNS("http://schemas.sap.com/sapui5/extension/sap.ui.core.Internal/1", "id"), "true", "full id flag is set to true");
        done();
    }.bind(this));
});
QUnit.test("create Controls", function (assert) {
    assert.expect(2);
    var done = assert.async();
    XMLTemplateProcessor.enrichTemplateIdsPromise(this.xView, this.oRootView, true).then(function () {
        assert.ok(!this.oRootView.byId("button"), "no control has been created yet");
        XMLTemplateProcessor.parseTemplatePromise(this.xView, this.oRootView, true).then(function () {
            assert.ok(this.oRootView.byId("button"), "button control is created");
            done();
        }.bind(this));
    }.bind(this));
});
QUnit.test("do not create stashed Controls", function (assert) {
    assert.expect(2);
    var done = assert.async();
    XMLTemplateProcessor.enrichTemplateIdsPromise(this.xView, this.oRootView, true).then(function () {
        assert.ok(!this.oRootView.byId("stashedButton"), "no stashed control has been created yet");
        XMLTemplateProcessor.parseTemplatePromise(this.xView, this.oRootView, true).then(function () {
            assert.ok(this.oRootView.byId("stashedButton"), "stashed button control is created");
            done();
        }.bind(this));
    }.bind(this));
});
QUnit.test("do not process ExtensionPoints", function (assert) {
    assert.expect(2);
    var done = assert.async();
    var node = jQuery(this.xView).find("#extensionButton")[0];
    XMLTemplateProcessor.enrichTemplateIdsPromise(this.xView, this.oRootView, true).then(function () {
        assert.equal(node.getAttribute("id"), "extensionButton", "id was not enriched");
        XMLTemplateProcessor.parseTemplatePromise(this.xView, this.oRootView, true).then(function () {
            assert.ok(this.oRootView.byId("extensionButton"), "extension button is created");
            done();
        }.bind(this));
    }.bind(this));
});
QUnit.module("General");
QUnit.test("on design mode create Controls and fragment with correct declarativeSourceInfo", function (assert) {
    assert.expect(7);
    var done = assert.async();
    var fnOrigGetDesignMode = sap.ui.getCore().getConfiguration().getDesignMode;
    sap.ui.getCore().getConfiguration().getDesignMode = function () {
        return true;
    };
    var oView = sap.ui.view({
        viewName: "my.View",
        type: ViewType.XML
    });
    sap.ui.getCore().getConfiguration().getDesignMode = fnOrigGetDesignMode;
    oView.loaded().then(function () {
        var oButton = oView.byId("button");
        assert.ok(oButton, "button control is created");
        assert.equal(oButton._sapui_declarativeSourceInfo.xmlNode.getAttribute("text"), "Button");
        var xmlRootNode = oButton._sapui_declarativeSourceInfo.xmlRootNode;
        assert.equal(xmlRootNode.getAttribute("controllerName"), "my.View");
        var oLabel = oView.byId("namedName");
        assert.equal(oLabel._sapui_declarativeSourceInfo.xmlNode.getAttribute("text"), "{named>name}");
        assert.equal(oLabel.getParent()._sapui_declarativeSourceInfo.fragmentName, "my.Fragment");
        assert.equal(oLabel._sapui_declarativeSourceInfo.xmlRootNode, xmlRootNode);
        assert.equal(oLabel.getParent()._sapui_declarativeSourceInfo.xmlRootNode, xmlRootNode);
        oView.destroy();
        done();
    });
});
QUnit.test("on regular mode create Controls and fragment with no declarativeSourceInfo", function (assert) {
    assert.expect(3);
    var done = assert.async();
    sap.ui.view({
        viewName: "my.View",
        type: ViewType.XML
    }).loaded().then(function (oView) {
        var oButton = oView.byId("button");
        assert.ok(oButton, "button control is created");
        assert.notOk(oButton.hasOwnProperty("_sapui_declarativeSourceInfo"));
        var oLabel = oView.byId("namedName");
        assert.notOk(oLabel.hasOwnProperty("_sapui_declarativeSourceInfo"));
        oView.destroy();
        done();
    });
});
QUnit.module("Metadata Contexts");
QUnit.test("On regular controls with metadataContexts the XMLTemplateProcessorAsync._preprocessMetadataContexts is called", function (assert) {
    assert.expect(2);
    var done = assert.async();
    var mMetadataContexts = {};
    XMLTemplateProcessor._preprocessMetadataContexts = function (sClassName, mSettings, oContext) {
        mMetadataContexts = mSettings.metadataContexts;
    };
    sap.ui.view({
        viewName: "my.View",
        type: ViewType.XML
    }).loaded().then(function (oView) {
        var oButton = oView.byId("button");
        assert.ok(oButton instanceof Button, "Button found.");
        assert.ok(mMetadataContexts, "XMLTemplateProcessorAsync._preprocessMetadataContexts is called");
        XMLTemplateProcessor._preprocessMetadataContexts = null;
        oView.destroy();
        done();
    });
});
QUnit.test("The named model map is built correctly", function (assert) {
    var sError;
    var mMap = XMLTemplateProcessor._calculatedModelMapping("{/path}", null, true);
    assert.ok(mMap, "The map is build for {/path}");
    assert.ok(mMap[undefined], "The map contains an entry keyed by the undefined model");
    assert.equal(mMap[undefined].length, 1, "The keyed model is an array of length one");
    assert.equal(mMap[undefined][0].path, "/path", "The resulting path is '/path'");
    mMap = XMLTemplateProcessor._calculatedModelMapping("{model>/path}", null, true);
    assert.ok(mMap, "The map is build for {model>/path}");
    assert.ok(mMap["model"], "The map contains an entry keyed by the 'model' model");
    assert.equal(mMap["model"].length, 1, "The keyed model is an array of length one");
    assert.equal(mMap["model"][0].path, "/path", "The resulting path is '/path'");
    mMap = XMLTemplateProcessor._calculatedModelMapping("{model: 'model', path: '/path'},{path: '/path', name: 'context1'},{path: '/any', name: 'context2'}", null, true);
    assert.ok(mMap, "The map is build for {model: 'model', path: '/path'},{path: '/path', name: 'context1'},{path: '/any', name: 'context2'} allowing multiple contexts");
    assert.ok(mMap["model"], "The map contains an entry keyed by the 'model' model");
    assert.equal(mMap["model"].length, 1, "The keyed 'model' model is an array of length one");
    assert.equal(mMap["model"][0].path, "/path", "The 'model' resulting path is '/path'");
    assert.equal(mMap[undefined].length, 2, "The 'undefined' model entry is an array of length two");
    assert.equal(mMap[undefined][0].path, "/path", "The resulting path is '/path'");
    assert.equal(mMap[undefined][0].name, "context1", "The resulting context name is 'context1'");
    assert.equal(mMap[undefined][1].path, "/any", "The resulting path is '/any'");
    assert.equal(mMap[undefined][1].name, "context2", "The resulting context name is 'context2'");
    mMap = XMLTemplateProcessor._calculatedModelMapping("{model: 'model', path: '/path'},{path: '/path', name: 'context1'},{path: '/any', name: 'context2'}", null, false);
    assert.ok(mMap, "The map is build for {model: 'model', path: '/path'},{path: '/path', name: 'context1'},{path: '/any', name: 'context2'} not allowing multiple contexts");
    assert.ok(mMap["model"], "The map contains an entry keyed by the 'model' model");
    assert.equal(mMap["model"].path, "/path", "The 'model' resulting path is '/path'");
    assert.ok(mMap[undefined], "The 'undefined' model entry is an object");
    assert.equal(mMap[undefined].path, "/any", "The resulting path is '/any', i.e. the first binding gets overrulled");
    assert.equal(mMap[undefined].name, "context2", "The resulting context name is 'context2', i.e. the first binding gets overrulled");
    try {
        XMLTemplateProcessor._calculatedModelMapping("{model: 'model', path: '/path'}fcb{path: '/path', name: 'context1'},{path: '/any', name: 'context2'}", null, false);
    }
    catch (e) {
        sError = e.message;
    }
    assert.ok(sError, "Wrong delimiter in {model: 'model', path: '/path'}fcb{path: '/path', name: 'context1'},{path: '/any', name: 'context2'} is detected");
    sError = null;
    try {
        XMLTemplateProcessor._calculatedModelMapping("{model: 'model', path: '/path'}{path: '/path', name: 'context1'},{path: '/any', name: 'context2'}", null, false);
    }
    catch (e) {
        sError = e.message;
    }
    assert.ok(sError, "Missing , in {model: 'model', path: '/path'}{path: '/path', name: 'context1'},{path: '/any', name: 'context2'} is detected");
    sError = null;
    try {
        XMLTemplateProcessor._calculatedModelMapping("huhuhudfhudf{model: 'model', path: '/path'},{path: '/path', name: 'context1'},{path: '/any', name: 'context2'}", null, false);
    }
    catch (e) {
        sError = e.message;
    }
    assert.ok(sError, "Not starting with binding in huhuhudfhudf{model: 'model', path: '/path'},{path: '/path', name: 'context1'},{path: '/any', name: 'context2'} detected");
    sError = null;
    try {
        XMLTemplateProcessor._calculatedModelMapping("{model: 'model', path: '/path'}{path: '/path', name: 'context1'},{path: '/any', name: 'context2'}uhuhuh", null, false);
    }
    catch (e) {
        sError = e.message;
    }
    assert.ok(sError, "Not ending with binding in {model: 'model', path: '/path'}{path: '/path', name: 'context1'},{path: '/any', name: 'context2'}huhuhuh is detected");
});
QUnit.module("Propagation of processingMode: 'Sequential'", {
    beforeEach: function () {
        this.loadTemplatePromiseSpy = sinon.spy(XMLTemplateProcessor, "loadTemplatePromise");
    },
    afterEach: function () {
        this.loadTemplatePromiseSpy.restore();
    }
});
QUnit.test("Async rootView & childView", function (assert) {
    var done = assert.async();
    sap.ui.define("test/XMLTemplateProcessor/Component", function () {
        return UIComponent.extend("test.XMLTemplateProcessor", {
            metadata: {
                rootView: {
                    viewName: "testdata/view/XMLTemplateProcessorAsync_nested",
                    type: "XML",
                    async: true
                }
            }
        });
    });
    Component.create({
        name: "test.XMLTemplateProcessor",
        manifest: false
    }).then(function (oComponent) {
        var oRootView = oComponent.getRootControl();
        oRootView.loaded().then(function (oView) {
            assert.ok(oView, "View is loaded.");
            assert.equal(oView._sProcessingMode, XMLProcessingMode.Sequential, "ProcessingMode 'Sequential' is set on " + "View:" + oView.getViewName());
            oView.getContent()[0].loaded().then(function (oView) {
                assert.ok(oView, "View is loaded.");
                assert.equal(oView._sProcessingMode, XMLProcessingMode.Sequential, "ProcessingMode 'Sequential' is set on " + "View:" + oView.getViewName());
                done();
            });
        });
    });
});
QUnit.test("Async rootView & sync childView", function (assert) {
    var done = assert.async();
    sap.ui.define("test/XMLTemplateProcessor2/Component", function () {
        return UIComponent.extend("test.XMLTemplateProcessor2", {
            metadata: {
                rootView: {
                    viewName: "testdata/view/XMLTemplateProcessorAsync_nested_2",
                    type: "XML",
                    async: true
                }
            }
        });
    });
    Component.create({
        name: "test.XMLTemplateProcessor2",
        manifest: false
    }).then(function (oComponent) {
        var oRootView = oComponent.getRootControl();
        oRootView.loaded().then(function (oView) {
            assert.ok(oView, "View is loaded.");
            assert.ok(oView.oAsyncState, "View is an async view.");
            assert.equal(oView._sProcessingMode, XMLProcessingMode.Sequential, "ProcessingMode 'Sequential' is set on " + "View:" + oView.getViewName());
            oView.getContent()[0].loaded().then(function (oChildView1) {
                assert.ok(oChildView1, "View is loaded.");
                assert.notOk(oChildView1.oAsyncState, "View is a sync view.");
                assert.equal(oChildView1._sProcessingMode, XMLProcessingMode.Sequential, "ProcessingMode 'Sequential' is set on " + "View:" + oChildView1.getViewName());
                oChildView1.getContent()[0].loaded().then(function (oChildView2) {
                    assert.ok(oChildView2, "View is loaded.");
                    assert.ok(oChildView2.oAsyncState, "View is an async view.");
                    assert.equal(oChildView2._sProcessingMode, XMLProcessingMode.Sequential, "ProcessingMode 'Sequential' is set on " + "View:" + oChildView2.getViewName());
                    done();
                });
            });
        });
    });
});
QUnit.test("Async rootView & nested fragments", function (assert) {
    var done = assert.async();
    sap.ui.define("test/XMLTemplateProcessor3/Component", function () {
        return UIComponent.extend("test.XMLTemplateProcessor3", {
            metadata: {
                rootView: {
                    viewName: "testdata/fragments/XMLViewWithXMLFragment",
                    type: "XML",
                    async: true
                }
            }
        });
    });
    Component.create({
        name: "test.XMLTemplateProcessor3",
        manifest: false
    }).then(function (oComponent) {
        var oRootView = oComponent.getRootControl();
        oRootView.loaded().then(function (oView) {
            assert.ok(oView, "View is loaded.");
            assert.ok(oView.oAsyncState, "View is an async view.");
            assert.equal(oView._sProcessingMode, XMLProcessingMode.Sequential, "ProcessingMode 'Sequential' is set on " + "View:" + oView.getViewName());
            assert.equal(this.loadTemplatePromiseSpy.callCount, 1, "loadTemplatePromiseSpy should be called once");
            var oXMLView = oView.byId("xmlViewInsideFragment");
            assert.ok(oXMLView, "View is loaded.");
            assert.notOk(oXMLView.oAsyncState, "View is a sync view.");
            assert.equal(oXMLView._sProcessingMode, XMLProcessingMode.Sequential, "ProcessingMode 'Sequential' is set on " + "View:" + oXMLView.getViewName());
            assert.deepEqual(Component.getOwnerComponentFor(oXMLView), oComponent, "Should be the same owner component.");
            sap.ui.require(["sap/ui/core/Fragment"], function (Fragment) {
                Fragment.load({
                    name: "testdata/fragments/XMLFragment",
                    containingView: oView
                }).then(function (oFragment) {
                    assert.deepEqual(Component.getOwnerComponentFor(oFragment), oComponent, "Should be the same owner component.");
                    done();
                });
            });
        }.bind(this));
    }.bind(this));
});
QUnit.test("Async XML rootView with HTML tags with nested XML view", function (assert) {
    var done = assert.async();
    sap.ui.define("test/XMLTemplateProcessor4/Component", function () {
        return UIComponent.extend("test.XMLTemplateProcessor4", {
            metadata: {
                rootView: {
                    viewName: "testdata/fragments/XMLViewWithHTML",
                    type: "XML",
                    async: true
                }
            }
        });
    });
    Component.create({
        name: "test.XMLTemplateProcessor4",
        manifest: false
    }).then(function (oComponent) {
        var oRootView = oComponent.getRootControl();
        oRootView.loaded().then(function (oView) {
            assert.ok(oView, "View is loaded.");
            assert.ok(oView.oAsyncState, "View is an async view.");
            assert.equal(oView._sProcessingMode, XMLProcessingMode.Sequential, "ProcessingMode 'Sequential' is set on " + "View:" + oView.getViewName());
            var xmlViewInHtml = oView.byId("xmlViewInHTML");
            xmlViewInHtml.loaded().then(function (oView) {
                assert.ok(oView, "View is loaded.");
                assert.equal(oView._sProcessingMode, XMLProcessingMode.Sequential, "ProcessingMode 'Sequential' is set on " + "View:" + oView.getViewName());
                done();
            });
        });
    });
});
QUnit.test("Async XML rootView with HTML fragment with nested XML view", function (assert) {
    var done = assert.async();
    sap.ui.define("test/XMLTemplateProcessor5/Component", function () {
        return UIComponent.extend("test.XMLTemplateProcessor4", {
            metadata: {
                rootView: {
                    viewName: "testdata/fragments/XMLViewWithHTMLFragments",
                    type: "XML",
                    async: true
                }
            }
        });
    });
    Component.create({
        name: "test.XMLTemplateProcessor5",
        manifest: false
    }).then(function (oComponent) {
        var oRootView = oComponent.getRootControl();
        oRootView.loaded().then(function (oView) {
            assert.ok(oView, "View is loaded.");
            assert.ok(oView.oAsyncState, "View is an async view.");
            assert.equal(oView._sProcessingMode, XMLProcessingMode.Sequential, "ProcessingMode 'Sequential' is set on " + "View:" + oView.getViewName());
            var xmlView = oView.byId("XVwithFrags");
            xmlView.loaded().then(function (oView) {
                assert.ok(oView, "View is loaded.");
                assert.equal(oView._sProcessingMode, XMLProcessingMode.Sequential, "ProcessingMode 'Sequential' is set on " + "View:" + oView.getViewName());
                done();
            });
        });
    });
});