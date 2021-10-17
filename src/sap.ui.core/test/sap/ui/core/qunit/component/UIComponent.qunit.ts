import jQuery from "jquery.sap.global";
import Component from "sap/ui/core/Component";
import ManagedObject from "sap/ui/base/ManagedObject";
import ComponentContainer from "sap/ui/core/ComponentContainer";
import UIComponent from "sap/ui/core/UIComponent";
import UIComponentMetadata from "sap/ui/core/UIComponentMetadata";
import View from "sap/ui/core/mvc/View";
import Log from "sap/base/Log";
var oDIV = document.createElement("div");
oDIV.id = "content";
document.body.appendChild(oDIV);
QUnit.module("Basic UIComponent", {
    beforeEach: function () {
        sap.ui.predefine("my/test/Component", ["sap/ui/core/UIComponent", "sap/m/Button"], function (UIComponent, Button) {
            return UIComponent.extend("my.test.Component", {
                createContent: function () {
                    return new Button("theButton", {
                        "text": "The Button"
                    });
                }
            });
        });
        this.oManifest = {
            "sap.app": {
                "id": "my.test"
            },
            "sap.ui5": {}
        };
        var oServer = this.oServer = sinon.fakeServer.create();
        oServer.xhr.supportCORS = true;
        oServer.xhr.useFilters = true;
        oServer.xhr.filters = [];
        oServer.xhr.addFilter(function (method, url) {
            return url !== "/anylocation/manifest.json?sap-language=EN";
        });
        oServer.autoRespond = true;
        oServer.respondWithJSONContent = function (oContent) {
            this.respondWith("GET", "/anylocation/manifest.json?sap-language=EN", [
                200,
                {
                    "Content-Type": "application/json"
                },
                JSON.stringify(oContent)
            ]);
        };
    },
    afterEach: function () {
        this.oServer.restore();
    }
});
QUnit.test("UIComponent ID handling", function (assert) {
    this.oServer.respondWithJSONContent(this.oManifest);
    var oComponent = sap.ui.component({
        id: "dummy",
        manifestUrl: "/anylocation/manifest.json"
    });
    var sPrefixedId = oComponent.createId("anyid");
    var sLocalId = oComponent.getLocalId(sPrefixedId);
    var sOtherId = oComponent.getLocalId("anyview---anyid");
    assert.equal(sPrefixedId, "dummy---anyid");
    assert.equal(sLocalId, "anyid");
    assert.equal(sOtherId, null);
    assert.ok(oComponent.isPrefixedId(sPrefixedId));
    assert.notOk(oComponent.isPrefixedId(sLocalId));
    oComponent.destroy();
});
QUnit.test("UIComponent initialization callback hook", function (assert) {
    this.oServer.respondWithJSONContent(this.oManifest);
    UIComponent._fnOnInstanceInitialized = function (oComponent) {
        assert.equal(oComponent.getId(), "myComponent", "Initialization hook was called!");
    };
    var oComponent = sap.ui.component({
        id: "myComponent",
        manifestUrl: "/anylocation/manifest.json"
    });
    delete UIComponent._fnOnInstanceInitialized;
    oComponent.destroy();
});
QUnit.test("UIComponent destruction callback hook", function (assert) {
    this.oServer.respondWithJSONContent(this.oManifest);
    var oComponent = sap.ui.component({
        id: "myComponent",
        manifestUrl: "/anylocation/manifest.json"
    });
    UIComponent._fnOnInstanceDestroy = function (oComponent) {
        assert.equal(oComponent.getId(), "myComponent", "Destruction hook was called!");
    };
    oComponent.destroy();
    delete UIComponent._fnOnInstanceDestroy;
});
QUnit.test("UIComponent check for no autoPrefixId", function (assert) {
    this.oServer.respondWithJSONContent(this.oManifest);
    var oComponent = sap.ui.component({
        manifestUrl: "/anylocation/manifest.json"
    });
    var oComponentContainer = new ComponentContainer({
        component: oComponent
    }).placeAt("content");
    sap.ui.getCore().applyChanges();
    assert.equal(oComponent.getAutoPrefixId(), false, "AutoPrefixId is false!");
    var oButton = sap.ui.getCore().byId("theButton");
    assert.ok(!!oButton, "Button was prefixed with Component id!");
    oComponentContainer.destroy();
    oComponent.destroy();
});
QUnit.test("UIComponent check for autoPrefixId=true", function (assert) {
    this.oManifest["sap.ui5"]["autoPrefixId"] = true;
    this.oServer.respondWithJSONContent(this.oManifest);
    var oComponent = sap.ui.component({
        manifestUrl: "/anylocation/manifest.json"
    });
    var oComponentContainer = new ComponentContainer({
        component: oComponent
    }).placeAt("content");
    sap.ui.getCore().applyChanges();
    assert.equal(oComponent.getAutoPrefixId(), true, "AutoPrefixId is true!");
    var oButton = sap.ui.getCore().byId(oComponent.createId("theButton"));
    assert.ok(!!oButton, "Button was prefixed with Component id!");
    oComponentContainer.destroy();
    oComponent.destroy();
});
QUnit.test("UIComponent check for autoPrefixId=false", function (assert) {
    this.oManifest["sap.ui5"]["autoPrefixId"] = false;
    this.oServer.respondWithJSONContent(this.oManifest);
    var oComponent = sap.ui.component({
        manifestUrl: "/anylocation/manifest.json"
    });
    var oComponentContainer = new ComponentContainer({
        component: oComponent
    }).placeAt("content");
    sap.ui.getCore().applyChanges();
    assert.equal(oComponent.getAutoPrefixId(), false, "AutoPrefixId is false!");
    var oButton = sap.ui.getCore().byId("theButton");
    assert.ok(!!oButton, "Button was not prefixed with Component id!");
    oComponentContainer.destroy();
    oComponent.destroy();
});
QUnit.test("forwarding RouterHashChanger to the creation of Router", function (assert) {
    this.oManifest["sap.ui5"]["routing"] = {
        routes: {}
    };
    this.oServer.respondWithJSONContent(this.oManifest);
    var oComponentConstructorSpy = sinon.spy(ManagedObject.prototype, "applySettings");
    var oRouterHashChanger = {};
    var oComponent1 = sap.ui.component({
        manifestUrl: "/anylocation/manifest.json",
        settings: {
            _routerHashChanger: oRouterHashChanger
        }
    });
    var oRouter1 = oComponent1.getRouter();
    assert.strictEqual(oComponentConstructorSpy.callCount, 2, "The constructor was called");
    assert.deepEqual(oComponentConstructorSpy.getCall(1).args[0], {}, "The settings object of the constructor is empty");
    assert.strictEqual(oRouter1.getHashChanger(), oRouterHashChanger, "The RouterHashChanger is forwarded to the created Router");
    oComponent1.destroy();
    var oComponent2 = new UIComponent("component1", {
        _routerHashChanger: undefined
    });
    var oRouter2 = oComponent2.getRouter();
    assert.strictEqual(oComponentConstructorSpy.callCount, 3, "The constructor was called");
    assert.deepEqual(oComponentConstructorSpy.getCall(2).args[0], {}, "The settings object of the constructor is empty");
    assert.strictEqual(oRouter2, undefined, "The router is undefined");
    oComponent2.destroy();
    var oComponent3 = sap.ui.component({
        manifestUrl: "/anylocation/manifest.json",
        settings: {
            _routerHashChanger: undefined
        }
    });
    var oRouter3 = oComponent3.getRouter();
    assert.strictEqual(oComponentConstructorSpy.callCount, 5, "The constructor was called");
    assert.deepEqual(oComponentConstructorSpy.getCall(2).args[0], {}, "The settings object of the constructor is empty");
    assert.strictEqual(oRouter3.getHashChanger().getMetadata().getName(), "sap.ui.core.routing.RouterHashChanger", "The RouterHashChanger is created by the Router");
    oComponent3.destroy();
    oComponentConstructorSpy.restore();
});
QUnit.test("forwarding propagateTitle to the creation of Router", function (assert) {
    this.oManifest["sap.ui5"]["routing"] = {
        routes: {}
    };
    this.oServer.respondWithJSONContent(this.oManifest);
    var oComponentConstructorSpy = sinon.spy(ManagedObject.prototype, "applySettings");
    var oComponent1 = new UIComponent("component1", {
        _propagateTitle: true
    });
    var oComponent2 = new UIComponent("component2", {
        _propagateTitle: false
    });
    var oComponent3 = new UIComponent("component3", {
        _propagateTitle: undefined
    });
    assert.strictEqual(oComponentConstructorSpy.callCount, 3, "The constructor should be called three times");
    assert.strictEqual(oComponent1._bRoutingPropagateTitle, true, "The propagateTitle flag should be stored successfully in the component");
    assert.deepEqual(oComponentConstructorSpy.getCall(0).args[0], {}, "The settings object of the constructor should be empty");
    assert.strictEqual(oComponent2._bRoutingPropagateTitle, false, "The propagateTitle flag should be stored successfully in the component");
    assert.deepEqual(oComponentConstructorSpy.getCall(1).args[0], {}, "The settings object of the constructor should be empty");
    assert.strictEqual(oComponent3._bRoutingPropagateTitle, undefined, "The propagateTitle flag should be stored successfully in the component");
    assert.deepEqual(oComponentConstructorSpy.getCall(2).args[0], {}, "The settings object of the constructor should be empty");
    oComponent1.destroy();
    oComponent2.destroy();
    oComponent3.destroy();
    oComponentConstructorSpy.resetHistory();
    var done = assert.async();
    Component.create({
        id: "component1b",
        manifest: "/anylocation/manifest.json",
        settings: {
            _propagateTitle: true
        }
    }).then(function (oComponent) {
        assert.strictEqual(oComponentConstructorSpy.callCount, 2, "The component constructor and the button constructor should be called once");
        assert.strictEqual(oComponent._bRoutingPropagateTitle, true, "The propagateTitle flag should be stored successfully in the component");
        assert.deepEqual(oComponentConstructorSpy.getCall(1).args[0], { id: "component1b" }, "The settings object of the constructor should contains only the id, the propagateTitle flag should be removed from the settings");
        oComponent.destroy();
        oComponentConstructorSpy.resetHistory();
        Component.create({
            id: "component2b",
            manifest: "/anylocation/manifest.json",
            settings: {
                _propagateTitle: false
            }
        }).then(function (oComponent) {
            assert.strictEqual(oComponentConstructorSpy.callCount, 2, "The component constructor and the button constructor should be called once");
            assert.strictEqual(oComponent._bRoutingPropagateTitle, false, "The propagateTitle flag should be stored successfully in the component");
            assert.deepEqual(oComponentConstructorSpy.getCall(1).args[0], { id: "component2b" }, "The settings object of the constructor should contains only the id, the propagateTitle flag should be removed from the settings");
            oComponent.destroy();
            oComponentConstructorSpy.resetHistory();
            Component.create({
                id: "component3b",
                manifest: "/anylocation/manifest.json",
                settings: {
                    _propagateTitle: undefined
                }
            }).then(function (oComponent) {
                assert.strictEqual(oComponentConstructorSpy.callCount, 2, "The component constructor and the button constructor should be called once");
                assert.strictEqual(oComponent._bRoutingPropagateTitle, undefined, "The propagateTitle flag should be stored successfully in the component");
                assert.deepEqual(oComponentConstructorSpy.getCall(1).args[0], { id: "component3b" }, "The settings object of the constructor should contains only the id, the propagateTitle flag should be removed from the settings");
                oComponent.destroy();
                done();
                oComponentConstructorSpy.restore();
            });
        });
    });
});
QUnit.module("UIComponent with rootView from Manifest", {
    beforeEach: function () {
        var oManifestAutoId = {
            "sap.app": {
                "id": "my.own.autoid"
            },
            "sap.ui5": {
                "rootView": {
                    "viewName": "my.own.View",
                    "type": "XML"
                }
            }
        };
        var oManifestPrefixId = {
            "sap.app": {
                "id": "my.own.prefixId"
            },
            "sap.ui5": {
                "rootView": {
                    "viewName": "my.own.View",
                    "type": "XML",
                    "id": "theView"
                }
            }
        };
        var oManifestJSView = {
            "sap.ui5": {
                "rootView": {
                    "async": true,
                    "viewName": "error.test.JSView",
                    "type": "JS"
                }
            }
        };
        var oManifestMissingViewType = {
            "sap.app": {
                "id": "my.own.missingViewType"
            },
            "sap.ui5": {
                "rootView": {
                    "viewName": "my.own.View",
                    "id": "theView"
                }
            }
        };
        var oManifestMissingViewTypeForTypedView = {
            "sap.app": {
                "id": "my.own.missingViewType"
            },
            "sap.ui5": {
                "rootView": {
                    "viewName": "module:my/own/TypedView",
                    "id": "theView"
                }
            }
        };
        var sXMLView = "\t\t\t\t<mvc:View xmlns:core=\"sap.ui.core\" xmlns:mvc=\"sap.ui.core.mvc\" xmlns=\"sap.m\" \t\t\t\t\t\tcontrollerName=\"my.own.Controller\" xmlns:html=\"http://www.w3.org/1999/xhtml\"> \t\t\t\t\t<Button id=\"theButton\" text=\"Hello World\" press=\"doSomething\"></Button> \t\t\t\t</mvc:View> \t\t\t";
        var oServer = this.oServer = sinon.fakeServer.create();
        oServer.xhr.supportCORS = true;
        oServer.xhr.useFilters = true;
        oServer.xhr.filters = [];
        oServer.xhr.addFilter(function (method, url) {
            return (!/^\/anylocation\/autoid\/manifest\.json/.test(url) && !/^\/anylocation\/missingViewType\/manifest\.json/.test(url) && !/^\/anylocation\/missingViewTypeForTypedView\/manifest\.json/.test(url) && !/^\/anylocation\/prefixid\/manifest\.json/.test(url) && !/^\/anylocation\/mf1st\/autoid\/manifest\.json/.test(url) && !/^\/anylocation\/mf1st\/prefixid\/manifest\.json/.test(url) && !/^\/test-resources\/sap\/ui\/core\/qunit\/component\/testdata\/view\/manifest\.json/.test(url) && url !== "/anylocation/View.view.xml");
        });
        oServer.autoRespond = true;
        oServer.respondWith("GET", /^\/anylocation\/autoid\/manifest\.json/, [
            200,
            {
                "Content-Type": "application/json"
            },
            JSON.stringify(oManifestAutoId)
        ]);
        oServer.respondWith("GET", /^\/anylocation\/prefixid\/manifest\.json/, [
            200,
            {
                "Content-Type": "application/json"
            },
            JSON.stringify(oManifestPrefixId)
        ]);
        oServer.respondWith("GET", /^\/anylocation\/missingViewType\/manifest\.json/, [
            200,
            {
                "Content-Type": "application/json"
            },
            JSON.stringify(oManifestMissingViewType)
        ]);
        oServer.respondWith("GET", /^\/anylocation\/missingViewTypeForTypedView\/manifest\.json/, [
            200,
            {
                "Content-Type": "application/json"
            },
            JSON.stringify(oManifestMissingViewTypeForTypedView)
        ]);
        oManifestAutoId["sap.app"].id = "my.own";
        oServer.respondWith("GET", /^\/anylocation\/mf1st\/autoid\/manifest\.json/, [
            200,
            {
                "Content-Type": "application/json"
            },
            JSON.stringify(oManifestAutoId)
        ]);
        oManifestPrefixId["sap.app"].id = "my.own";
        oServer.respondWith("GET", /^\/anylocation\/mf1st\/prefixid\/manifest\.json/, [
            200,
            {
                "Content-Type": "application/json"
            },
            JSON.stringify(oManifestPrefixId)
        ]);
        oServer.respondWith("GET", "/anylocation/View.view.xml", [
            200,
            {
                "Content-Type": "application/xml"
            },
            sXMLView
        ]);
        oServer.respondWith("GET", /^\/test-resources\/sap\/ui\/core\/qunit\/component\/testdata\/view\/manifest\.json/, [
            200,
            {
                "Content-Type": "application/json"
            },
            JSON.stringify(oManifestJSView)
        ]);
        sap.ui.loader.config({
            paths: {
                "my/own": "/anylocation",
                "error/test": "/test-resources/sap/ui/core/qunit/component/testdata/view/"
            }
        });
        sap.ui.predefine("my/own/Component", ["sap/ui/core/UIComponent"], function (UIComponent) {
            return UIComponent.extend("my.own.Component", {});
        });
        sap.ui.predefine("my/own/autoid/Component", ["sap/ui/core/UIComponent"], function (UIComponent) {
            return UIComponent.extend("my.own.autoid.Component", {
                metadata: {
                    manifest: "json"
                }
            });
        });
        sap.ui.predefine("my/own/prefixid/Component", ["sap/ui/core/UIComponent"], function (UIComponent) {
            return UIComponent.extend("my.own.prefixid.Component", {
                metadata: {
                    manifest: "json"
                }
            });
        });
        sap.ui.predefine("my/own/missingViewType/Component", ["sap/ui/core/UIComponent"], function (UIComponent) {
            return UIComponent.extend("my.own.missingViewType.Component", {
                metadata: {
                    manifest: "json",
                    interfaces: [
                        "sap.ui.core.IAsyncContentCreation"
                    ]
                }
            });
        });
        sap.ui.predefine("error/test/Component", ["sap/ui/core/UIComponent"], function (UIComponent) {
            return UIComponent.extend("error.test.Component", {
                metadata: {
                    manifest: "json"
                }
            });
        });
        sap.ui.predefine("my/own/TypedView", ["sap/ui/core/mvc/View", "sap/ui/core/Icon"], function (View, Icon) {
            return View.extend("my.own.TypedView", {
                createContent: function () {
                    return [new Icon({ src: "sap-icon://accept" })];
                }
            });
        });
        sap.ui.predefine("my/own/Controller.controller", ["sap/ui/core/mvc/Controller"], function (Controller) {
            return Controller.extend("my.own.Controller", {
                doSomething: function () { }
            });
        });
    },
    afterEach: function () {
        this.oServer.restore();
    }
});
QUnit.test("UIComponent that no error is logged for View-Types other than XML when processingMode is set", function (assert) {
    var oSpy = sinon.spy(ManagedObject.prototype, "applySettings");
    var oComponent = sap.ui.component({
        name: "error.test"
    });
    var oComponentContainer = new ComponentContainer({
        component: oComponent
    }).placeAt("content");
    sap.ui.getCore().applyChanges();
    assert.ok(oSpy.calledWith({
        async: true,
        viewName: "error.test.JSView",
        type: "JS"
    }));
    oComponentContainer.destroy();
    oComponent.destroy();
    oSpy.restore();
});
QUnit.test("UIComponent check for not prefixing the views' auto id", function (assert) {
    var oComponent = sap.ui.component({
        name: "my.own.autoid"
    });
    var oComponentContainer = new ComponentContainer({
        component: oComponent
    }).placeAt("content");
    sap.ui.getCore().applyChanges();
    var oRootControl = oComponent.getRootControl();
    assert.equal(oRootControl.getViewName(), "my.own.View", "The correct view is displayed!");
    assert.ok(!jQuery.sap.startsWith(oRootControl.getId(), oComponent.getId()), "View id doesn't start with component id!");
    oComponentContainer.destroy();
    oComponent.destroy();
});
QUnit.test("UIComponent check for not prefixing the views' auto id (manifest first)", function (assert) {
    var oComponent = sap.ui.component({
        manifestUrl: "/anylocation/mf1st/autoid/manifest.json"
    });
    var oComponentContainer = new ComponentContainer({
        component: oComponent
    }).placeAt("content");
    sap.ui.getCore().applyChanges();
    var oRootControl = oComponent.getRootControl();
    assert.equal(oRootControl.getViewName(), "my.own.View", "The correct view is displayed!");
    assert.ok(!jQuery.sap.startsWith(oRootControl.getId(), oComponent.getId()), "View id doesn't start with component id!");
    oComponentContainer.destroy();
    oComponent.destroy();
});
QUnit.test("UIComponent check for prefixing view id", function (assert) {
    var oComponent = sap.ui.component({
        name: "my.own.prefixid"
    });
    var oComponentContainer = new ComponentContainer({
        component: oComponent
    }).placeAt("content");
    sap.ui.getCore().applyChanges();
    var oRootControl = oComponent.getRootControl();
    assert.equal(oRootControl.getViewName(), "my.own.View", "The correct view is displayed!");
    assert.ok(jQuery.sap.startsWith(oRootControl.getId(), oComponent.getId() + "---"), "View id starts with component id!");
    assert.ok(!!oComponent.byId("theView"), "View can be accessed with byId of Component!");
    assert.equal(oComponent.byId("theView").getId(), oComponent.createId("theView"), "View ID is prefixed with Component ID!");
    oComponentContainer.destroy();
    oComponent.destroy();
});
QUnit.test("UIComponent check for prefixing view id (manifest first)", function (assert) {
    var oComponent = sap.ui.component({
        manifestUrl: "/anylocation/mf1st/prefixid/manifest.json"
    });
    var oComponentContainer = new ComponentContainer({
        component: oComponent
    }).placeAt("content");
    sap.ui.getCore().applyChanges();
    var oRootControl = oComponent.getRootControl();
    assert.equal(oRootControl.getViewName(), "my.own.View", "The correct view is displayed!");
    assert.ok(jQuery.sap.startsWith(oRootControl.getId(), oComponent.getId() + "---"), "View id starts with component id!");
    assert.ok(!!oComponent.byId("theView"), "View can be accessed with byId of Component!");
    assert.equal(oComponent.byId("theView").getId(), oComponent.createId("theView"), "View ID is prefixed with Component ID!");
    oComponentContainer.destroy();
    oComponent.destroy();
});
QUnit.test("UIComponent - getRootControl returns the root view", function (assert) {
    var oComponent = sap.ui.component({
        manifestUrl: "/anylocation/mf1st/prefixid/manifest.json"
    });
    assert.strictEqual(oComponent.getRootControl(), oComponent.getAggregation("rootControl"));
    oComponent.destroy();
});
QUnit.test("UIComponent check for defaulting of root-view type", function (assert) {
    assert.expect(1);
    return Component.create({
        name: "my.own.missingViewType"
    }).then(function (oComponent) {
        assert.ok(oComponent.getRootControl().isA("sap.ui.core.mvc.XMLView"));
        oComponent.destroy();
    }, function () {
        assert.ok(false, "Error handler must not be called");
    });
});
QUnit.test("UIComponent check NO-defaulting of root-view type if root-view is a typed view", function (assert) {
    assert.expect(2);
    return Component.create({
        manifest: "/anylocation/missingViewTypeForTypedView/manifest.json"
    }).then(function (oComponent) {
        assert.notOk(oComponent.getRootControl().isA("sap.ui.core.mvc.XMLView"));
        assert.ok(oComponent.getRootControl().isA("my.own.TypedView"));
        oComponent.destroy();
    }, function () {
        assert.ok(false, "Error handler must not be called");
    });
});
sap.ui.require(["sap/ui/core/UIComponent", "sap/m/Button"], function (UIComponent, Button) {
    QUnit.test("UIComponent - getRootControl returns null before init", function (assert) {
        var oRootControlBeforeInit, oRootControlAfterInit, oCreatedContent;
        var MyExtension = UIComponent.extend("my.getRootControl.Component", {
            init: function () {
                oRootControlBeforeInit = this.getRootControl();
                UIComponent.prototype.init.apply(this, arguments);
                oRootControlAfterInit = this.getRootControl();
            },
            createContent: function () {
                oCreatedContent = new Button({
                    "text": "The Button"
                });
                return oCreatedContent;
            }
        });
        var oComponent = new MyExtension();
        var oComponent2 = new UIComponent();
        assert.strictEqual(oRootControlBeforeInit, null);
        assert.strictEqual(oRootControlAfterInit, oCreatedContent);
        assert.strictEqual(oComponent2.getRootControl(), null);
        oComponent.destroy();
        oComponent2.destroy();
    });
});
QUnit.module("Async loading of manifest modules before component instantiation", {
    before: function () {
        this.requireSpy = sinon.spy(sap.ui, "require");
        this.logWarningSpy = sinon.spy(Log, "warning");
        this.oViewCreateSpy = sinon.spy(View, "create");
    },
    beforeEach: function () {
        sap.ui.loader.config({ paths: { "manifestModules": "/manifestModules/" } });
        var sXMLView1 = "<mvc:View xmlns:core=\"sap.ui.core\" xmlns:mvc=\"sap.ui.core.mvc\"></mvc:View>";
        var oServer = this.oServer = sinon.sandbox.useFakeServer();
        oServer.xhr.useFilters = true;
        oServer.xhr.filters = [];
        oServer.xhr.addFilter(function (method, url) {
            return (!/^\/manifestModules\/scenario\d+[a-z]*\/manifest.json\?sap-language=EN$/.test(url) && url !== sap.ui.require.toUrl("someRootView.view.xml") && url !== sap.ui.require.toUrl("someRootView.view.json") && url !== sap.ui.require.toUrl("someRootViewNotExists.view.xml"));
        });
        oServer.autoRespond = true;
        oServer.respondWith("GET", sap.ui.require.toUrl("someRootView.view.xml"), [
            200,
            { "Content-Type": "application/xml" },
            sXMLView1
        ]);
        oServer.respondWith("GET", sap.ui.require.toUrl("someRootViewNotExists.view.xml"), [
            404,
            { "Content-Type": "text/html" },
            "not found"
        ]);
        oServer.respondWith("GET", sap.ui.require.toUrl("someRootView.view.json"), [
            200,
            { "Content-Type": "application/javascript" },
            "{}"
        ]);
    },
    setRespondedManifest: function (manifest, scenario) {
        this.oServer.respondWith("GET", "/manifestModules/" + scenario + "/manifest.json?sap-language=EN", [
            200,
            { "Content-Type": "application/json" },
            JSON.stringify(manifest)
        ]);
    },
    afterEach: function () {
        this.oServer.restore();
        this.requireSpy.reset();
        this.logWarningSpy.reset();
        this.oViewCreateSpy.reset();
    },
    after: function () {
        this.requireSpy.restore();
        this.logWarningSpy.restore();
        this.oViewCreateSpy.restore();
    }
});
QUnit.test("Check if all resources were loaded", function (assert) {
    var oManifest = {
        "sap.app": {
            "id": "app"
        },
        "sap.ui5": {
            "rootView": {
                "viewName": "someRootView",
                "type": "JSON",
                "id": "app"
            },
            "models": {
                "i18n": {
                    "type": "sap.ui.model.resource.ResourceModel",
                    "uri": "i18n/i18n.properties"
                },
                "odm1": {
                    "type": "sap.ui.model.odata.ODataModel",
                    "uri": "./some/odata/service"
                },
                "odm2": {
                    "type": "sap.ui.model.odata.v2.ODataModel",
                    "uri": "./some/odata/service"
                }
            },
            "routing": {
                "config": {
                    "viewType": "XML",
                    "controlId": "app"
                },
                "routes": [
                    {
                        "pattern": "",
                        "name": "overview",
                        "target": "overview"
                    }
                ]
            }
        }
    };
    this.setRespondedManifest(oManifest, "scenario1");
    var requireSpy = this.requireSpy;
    sap.ui.define("manifestModules/scenario1/Component", ["sap/ui/core/UIComponent"], function (UIComponent) {
        return UIComponent.extend("manifestModules.scenario1.Component", {
            metadata: {
                manifest: "json"
            },
            constructor: function () {
                assert.ok(requireSpy.calledWith(["sap/ui/core/mvc/JSONView"]), "JSONView type required");
                assert.ok(requireSpy.calledWith(["sap/ui/model/resource/ResourceModel"]), "ResourceModel required");
                assert.ok(requireSpy.calledWith(["sap/ui/core/routing/Router"]), "Router loaded");
                assert.ok(requireSpy.calledWith(["sap/ui/model/odata/ODataModel"]), "ODataModel required");
                assert.ok(requireSpy.calledWith(["sap/ui/model/odata/v2/ODataModel"]), "ODataModel v2 required");
                assert.ok(jQuery.sap.isResourceLoaded("sap/ui/core/mvc/JSONView.js"), "JSONView type loaded");
                assert.ok(jQuery.sap.isResourceLoaded("sap/ui/model/resource/ResourceModel.js"), "ResourceModel loaded");
                assert.ok(jQuery.sap.isResourceLoaded("sap/ui/core/routing/Router.js"), "Router loaded");
                assert.ok(jQuery.sap.isResourceLoaded("sap/ui/model/odata/ODataModel.js"), "ODataModel loaded");
                assert.ok(jQuery.sap.isResourceLoaded("sap/ui/model/odata/v2/ODataModel.js"), "ODataModel v2 loaded");
                UIComponent.apply(this, arguments);
            }
        });
    });
    return sap.ui.component({
        name: "manifestModules.scenario1",
        manifest: true
    }).then(function (oInstance) {
    });
});
QUnit.test("Check if custom router class was loaded", function (assert) {
    var oManifest = {
        "sap.app": {
            "id": "app"
        },
        "sap.ui5": {
            "routing": {
                "config": {
                    "routerClass": "someCustomRouter",
                    "viewType": "XML",
                    "controlId": "app"
                },
                "routes": [
                    {
                        "pattern": "",
                        "name": "overview",
                        "target": "overview"
                    }
                ]
            }
        }
    };
    this.setRespondedManifest(oManifest, "scenario2");
    var requireSpy = this.requireSpy;
    sap.ui.predefine("manifestModules/scenario2/Component", ["sap/ui/core/UIComponent"], function (UIComponent) {
        return UIComponent.extend("manifestModules.scenario2.Component", {
            metadata: {
                manifest: "json"
            },
            constructor: function () {
                assert.ok(requireSpy.calledWith(["someCustomRouter"]), "Custom Router required");
                assert.ok(jQuery.sap.isResourceLoaded("someCustomRouter.js"), "Custom Router loaded");
                UIComponent.apply(this, arguments);
            }
        });
    });
    sap.ui.predefine("someCustomRouter", ["sap/ui/core/routing/Router"], function (Router) {
        return Router.extend("someCustomRouter", {});
    });
    return sap.ui.component({
        name: "manifestModules.scenario2",
        manifest: true
    });
});
QUnit.test("Check if ViewType of root view (provided as string) was loaded", function (assert) {
    var oManifest = {
        "sap.app": {
            "id": "app"
        },
        "sap.ui5": {
            "rootView": "someRootView"
        }
    };
    this.setRespondedManifest(oManifest, "scenario3");
    var requireSpy = this.requireSpy;
    sap.ui.predefine("manifestModules/scenario3/Component", ["sap/ui/core/UIComponent"], function (UIComponent) {
        return UIComponent.extend("manifestModules.scenario3.Component", {
            metadata: {
                manifest: "json"
            },
            constructor: function () {
                assert.ok(requireSpy.calledWith(["sap/ui/core/mvc/XMLView"]), "XMLView type required");
                assert.ok(jQuery.sap.isResourceLoaded("sap/ui/core/mvc/XMLView.js"), "XMLView type loaded");
                UIComponent.apply(this, arguments);
            }
        });
    });
    return sap.ui.component({
        name: "manifestModules.scenario3",
        manifest: true
    });
});
QUnit.test("Check if modules could not be loaded and a warning was logged", function (assert) {
    assert.expect(3);
    var oManifest = {
        "sap.app": {
            "id": "app"
        },
        "sap.ui5": {
            "models": {
                "odm1": {
                    "type": "sap.ui.model.odata.ODataModelNotExists",
                    "uri": "./some/odata/service"
                }
            },
            "routing": {
                "config": {
                    "routerClass": "someRouterNotExists",
                    "viewType": "XML",
                    "controlId": "app"
                },
                "routes": [
                    {
                        "pattern": "",
                        "name": "overview",
                        "target": "overview"
                    }
                ]
            }
        }
    };
    this.setRespondedManifest(oManifest, "scenario4");
    var logWarningSpy = this.logWarningSpy;
    sap.ui.predefine("manifestModules/scenario4/Component", ["sap/ui/core/UIComponent"], function (UIComponent) {
        return UIComponent.extend("manifestModules.scenario4.Component", {
            metadata: {
                manifest: "json"
            },
            constructor: function () {
                assert.ok(logWarningSpy.calledWith("Can not preload module \"sap/ui/model/odata/ODataModelNotExists\". This will most probably cause an error once the module is used later on."), "Model not found");
                assert.ok(logWarningSpy.calledWith("Can not preload module \"someRouterNotExists\". This will most probably cause an error once the module is used later on."), "Router not found");
                UIComponent.apply(this, arguments);
            }
        });
    });
    return sap.ui.component({
        name: "manifestModules.scenario4",
        manifest: true
    }).catch(function () {
        assert.ok(true, "Modules could not be loaded and an error occured.");
    });
});
QUnit.test("Component with async rootView creation", function (assert) {
    assert.expect(8);
    var oManifest = {
        "sap.app": {
            "id": "app"
        },
        "sap.ui5": {
            "rootView": {
                "viewName": "testdata.view.MainAsync",
                "type": "XML"
            },
            "routing": {
                "config": {
                    "routerClass": "sap.m.routing.Router",
                    "viewType": "XML",
                    "controlId": "app"
                },
                "routes": [
                    {
                        "pattern": "",
                        "name": "home",
                        "target": "home"
                    }
                ],
                "targets": {
                    "home": {
                        "viewName": "testdata.view.MainAsync",
                        "controlAggregation": "content"
                    }
                }
            }
        }
    };
    this.setRespondedManifest(oManifest, "scenario5");
    sap.ui.predefine("manifestModules/scenario5/Component", ["sap/ui/core/UIComponent"], function (UIComponent) {
        return UIComponent.extend("manifestModules.scenario5.Component", {
            metadata: {
                manifest: "json",
                interfaces: [
                    "sap.ui.core.IAsyncContentCreation"
                ]
            },
            constructor: function () {
                UIComponent.apply(this, arguments);
            }
        });
    });
    return Component.create({
        name: "manifestModules.scenario5",
        manifest: true
    }).then(function (oComponent) {
        var oView = oComponent.getRootControl();
        assert.ok(oView, "root control created");
        assert.ok(oView, "view created");
        assert.ok(oView.getContent().length > 0, "view content created");
        assert.equal(this.oViewCreateSpy.callCount, 2, "async view factory called twice");
        assert.ok(oComponent.getRouter(), "Router created");
        assert.ok(oComponent.getRouter()._isAsync(), "Router is async");
    }.bind(this)).catch(function () {
        assert.ok(false, "Modules could not be loaded and an error occured.");
    });
});
QUnit.test("Component with async createContent", function (assert) {
    assert.expect(6);
    var oManifest = {
        "sap.app": {
            "id": "app"
        }
    };
    this.setRespondedManifest(oManifest, "scenario6");
    sap.ui.predefine("manifestModules/scenario6/Component", ["sap/ui/core/UIComponent", "sap/ui/core/mvc/View"], function (UIComponent, View) {
        return UIComponent.extend("manifestModules.scenario6.Component", {
            metadata: {
                manifest: "json",
                interfaces: [
                    "sap.ui.core.IAsyncContentCreation"
                ]
            },
            constructor: function () {
                UIComponent.apply(this, arguments);
            },
            createContent: function () {
                return View.create({
                    "viewName": "testdata.view.MainAsync",
                    "type": "XML"
                });
            }
        });
    });
    return Component.create({
        name: "manifestModules.scenario6",
        manifest: true
    }).then(function (oComponent) {
        var oView = oComponent.getRootControl();
        assert.ok(oComponent.getRootControl(), "root control created");
        assert.ok(oView, "view created");
        assert.ok(oView.getContent().length > 0, "view content created");
        assert.equal(this.oViewCreateSpy.callCount, 2, "async view factory called twice");
    }.bind(this)).catch(function () {
        assert.ok(false, "Modules could not be loaded and an error occured.");
    });
});
QUnit.test("Component with async rootView creation - legacy factory", function (assert) {
    assert.expect(1);
    var oManifest = {
        "sap.app": {
            "id": "app"
        },
        "sap.ui5": {
            "rootView": {
                "viewName": "testdata.view.MainAsync",
                "type": "XML"
            },
            "routing": {
                "config": {
                    "routerClass": "sap.ui.core.routing.Router",
                    "viewType": "XML",
                    "controlId": "app"
                },
                "routes": [
                    {
                        "pattern": "",
                        "name": "home",
                        "target": "home"
                    }
                ],
                "targets": {
                    "home": {
                        "viewName": "testdata.view.MainAsync",
                        "controlAggregation": "content"
                    }
                }
            }
        }
    };
    this.setRespondedManifest(oManifest, "scenario7");
    sap.ui.predefine("manifestModules/scenario7/Component", ["sap/ui/core/UIComponent"], function (UIComponent) {
        return UIComponent.extend("manifestModules.scenario7.Component", {
            metadata: {
                manifest: "json",
                interfaces: [
                    "sap.ui.core.IAsyncContentCreation"
                ]
            },
            constructor: function () {
                UIComponent.apply(this, arguments);
            }
        });
    });
    return sap.ui.component({
        name: "manifestModules.scenario7",
        manifest: true,
        async: true
    }).then(function (oComponent) {
        assert.ok(false, "Don't use legacy factory in combination with async content creation");
    }).catch(function (err) {
        assert.equal(err.message, "Do not use deprecated factory function 'sap.ui.component' in combination with IAsyncContentCreation (manifestModules.scenario7). Use 'Component.create' instead");
    });
});
QUnit.test("Component with async createContent and wrong nesting", function (assert) {
    assert.expect(1);
    var oManifest = {
        "sap.app": {
            "id": "app"
        },
        "sap.ui5": {
            "componentName": "manifestModules.Other.Name"
        }
    };
    this.setRespondedManifest(oManifest, "scenario8");
    sap.ui.predefine("manifestModules/scenario8/Component", ["sap/ui/core/UIComponent", "sap/ui/core/mvc/View"], function (UIComponent, View) {
        return UIComponent.extend("manifestModules.scenario8.Component", {
            metadata: {
                manifest: "json",
                interfaces: [
                    "sap.ui.core.IAsyncContentCreation"
                ]
            },
            constructor: function () {
                UIComponent.apply(this, arguments);
            },
            createContent: function () {
                return View.create({
                    "viewName": "testdata.view.MainAsyncWithWrongNesting",
                    "type": "XML"
                });
            }
        });
    });
    return Component.create({
        name: "manifestModules.scenario8",
        manifest: true
    }).then(function () {
        assert.ok(false, "Component creation must fail with error.");
    }).catch(function (oError) {
        assert.equal(oError.message, "A nested view contained in a Component implementing 'sap.ui.core.IAsyncContentCreation' is processed asynchronously by default and cannot be processed synchronously.\n" + "Affected Component 'manifestModules.scenario8' and View 'testdata.view.Nested'.");
    });
});
QUnit.test("Component with createContent returning view", function (assert) {
    assert.expect(6);
    var oManifest = {
        "sap.app": {
            "id": "app"
        }
    };
    this.setRespondedManifest(oManifest, "scenario9");
    sap.ui.predefine("manifestModules/scenario9/Component", ["sap/ui/core/UIComponent", "sap/ui/core/mvc/View"], function (UIComponent, View) {
        return UIComponent.extend("manifestModules.scenario9.Component", {
            metadata: {
                manifest: "json",
                interfaces: [
                    "sap.ui.core.IAsyncContentCreation"
                ]
            },
            constructor: function () {
                UIComponent.apply(this, arguments);
            },
            createContent: function () {
                return sap.ui.view({
                    "viewName": "testdata.view.MainAsync",
                    "type": "XML"
                });
            }
        });
    });
    return Component.create({
        name: "manifestModules.scenario9",
        manifest: true
    }).then(function (oComponent) {
        var oView = oComponent.getRootControl();
        assert.ok(oComponent.getRootControl(), "root control created");
        assert.ok(oView, "view created");
        assert.ok(oView.getContent().length > 0, "view content created");
        assert.equal(this.oViewCreateSpy.callCount, 0, "async view factory is not called");
    }.bind(this)).catch(function () {
        assert.ok(false, "Modules could not be loaded and an error occured.");
    });
});
QUnit.test("Component with createContent returning view created with asynchronous view processing", function (assert) {
    assert.expect(6);
    var oManifest = {
        "sap.app": {
            "id": "app"
        }
    };
    this.setRespondedManifest(oManifest, "scenario10");
    sap.ui.predefine("manifestModules/scenario10/Component", ["sap/ui/core/UIComponent", "sap/ui/core/mvc/View"], function (UIComponent, View) {
        return UIComponent.extend("manifestModules.scenario10.Component", {
            metadata: {
                manifest: "json",
                interfaces: [
                    "sap.ui.core.IAsyncContentCreation"
                ]
            },
            constructor: function () {
                UIComponent.apply(this, arguments);
            },
            createContent: function () {
                return sap.ui.view({
                    "viewName": "testdata.view.MainAsync",
                    "type": "XML",
                    "async": true
                });
            }
        });
    });
    return Component.create({
        name: "manifestModules.scenario10",
        manifest: true
    }).then(function (oComponent) {
        var oView = oComponent.getRootControl();
        assert.ok(oComponent.getRootControl(), "root control created");
        assert.ok(oView, "view created");
        assert.ok(oView.getContent().length > 0, "view content created");
        assert.equal(this.oViewCreateSpy.callCount, 1, "async view factory is called once");
    }.bind(this)).catch(function () {
        assert.ok(false, "Modules could not be loaded and an error occured.");
    });
});
QUnit.test("Component with missing Init super call", function (assert) {
    assert.expect(3);
    var oManifest = {
        "sap.app": {
            "id": "app"
        },
        "sap.ui5": {
            "rootView": {
                "viewName": "testdata.view.MainAsync",
                "type": "XML"
            }
        }
    };
    this.setRespondedManifest(oManifest, "scenario11");
    sap.ui.predefine("manifestModules/scenario11/Component", ["sap/ui/core/UIComponent", "sap/ui/core/mvc/View"], function (UIComponent, View) {
        return UIComponent.extend("manifestModules.scenario11.Component", {
            metadata: {
                manifest: "json"
            },
            constructor: function () {
                UIComponent.apply(this, arguments);
            },
            init: function () {
                assert.ok(true, "own init impl called");
            }
        });
    });
    var oErrorLogSpy = sinon.spy(Log, "error");
    return Component.create({
        name: "manifestModules.scenario11",
        manifest: true
    }).then(function (oComponent) {
        assert.equal(oErrorLogSpy.callCount, 1, "error logged");
        assert.equal(oErrorLogSpy.args[0][0], "Mandatory init() not called for UIComponent: 'manifestModules.scenario11'. This is likely caused by a missing super call in the component's init implementation.", "missing init super error logged");
    }).catch(function () {
        assert.ok(false, "Modules could not be loaded and an error occured.");
    });
});
QUnit.test("Component with async content creation and missing Interface", function (assert) {
    assert.expect(1);
    var oManifest = {
        "sap.app": {
            "id": "app"
        }
    };
    this.setRespondedManifest(oManifest, "scenario12");
    sap.ui.predefine("manifestModules/scenario12/Component", ["sap/ui/core/UIComponent", "sap/ui/core/mvc/View"], function (UIComponent, View) {
        return UIComponent.extend("manifestModules.scenario12.Component", {
            metadata: {
                manifest: "json"
            },
            constructor: function () {
                UIComponent.apply(this, arguments);
            },
            createContent: function () {
                return Promise.resolve();
            }
        });
    });
    return Component.create({
        name: "manifestModules.scenario12",
        manifest: true
    }).then(function (oComponent) {
        assert.ok(false, "Creation should rejected. Must not be ok!");
    }).catch(function (oErr) {
        assert.equal(oErr.message, "Interface 'sap.ui.core.IAsyncContentCreation' must be implemented for component 'manifestModules.scenario12' when 'createContent' is implemented asynchronously", "Creation rejected");
    });
});
QUnit.skip("Nested component - duplicate ID issue expected", function (assert) {
    assert.expect(1);
    var oManifest = {
        "sap.app": {
            "id": "app"
        },
        "sap.ui5": {}
    };
    this.setRespondedManifest(oManifest, "scenario13");
    sap.ui.predefine("manifestModules/scenario13/Component", ["sap/ui/core/UIComponent", "sap/ui/core/mvc/View", "sap/m/Panel"], function (UIComponent, View, Panel) {
        return UIComponent.extend("manifestModules.scenario13.Component", {
            metadata: {
                manifest: "json"
            },
            constructor: function () {
                UIComponent.apply(this, arguments);
            },
            createContent: function () {
                var oPanel = new Panel();
                this.pView = View.create({
                    viewName: "testdata.view.MainAsync",
                    type: "XML",
                    id: "testView"
                }).then(function (oView) {
                    oPanel.addContent(oView);
                }).catch(function () {
                    assert.ok(false, "duplicate ID issue");
                });
                return oPanel;
            }
        });
    });
    Component.create({
        name: "manifestModules.scenario13"
    }).then(function (oComponent) {
        oComponent.destroy();
    });
    return Component.create({
        name: "manifestModules.scenario13"
    }).then(function (oComponent) {
        return oComponent.pView.then(function () {
            oComponent.destroy();
        });
    });
});
QUnit.test("Nested component - no duplicate ID issue expected", function (assert) {
    assert.expect(4);
    var oManifest = {
        "sap.app": {
            "id": "app"
        },
        "sap.ui5": {}
    };
    this.setRespondedManifest(oManifest, "scenario13");
    sap.ui.predefine("manifestModules/scenario13/Component", ["sap/ui/core/UIComponent", "sap/ui/core/mvc/View", "sap/m/Panel"], function (UIComponent, View, Panel) {
        return UIComponent.extend("manifestModules.scenario13.Component", {
            metadata: {
                manifest: "json"
            },
            constructor: function () {
                UIComponent.apply(this, arguments);
            },
            createContent: function () {
                var oPanel = new Panel();
                this.pView = View.create({
                    viewName: "testdata.view.MainAsync",
                    type: "XML",
                    id: "testView"
                }).then(function (oView) {
                    oPanel.addContent(oView);
                    return oView;
                }).catch(function () {
                    assert.ok(false, "duplicate ID issue");
                });
                this.registerForDestroy(this.pView);
                return oPanel;
            }
        });
    });
    return Component.create({
        name: "manifestModules.scenario13"
    }).then(function (oComponent) {
        return oComponent.destroy().then(function () {
            return Component.create({
                name: "manifestModules.scenario13"
            }).then(function (oComponent) {
                return oComponent.pView.then(function () {
                    oComponent.destroy();
                });
            });
        });
    });
});
QUnit.module("catch up async rootView loaded promise", {
    before: function () {
        sap.ui.predefine("my/AsyncComponent/Component", ["sap/ui/core/UIComponent"], function (UIComponent) {
            return UIComponent.extend("my.AsyncComponent.Component", {
                metadata: {
                    manifest: {
                        "sap.ui5": {
                            "rootView": {
                                async: true,
                                viewName: "module:my/AsyncJSView"
                            }
                        }
                    }
                }
            });
        });
        sap.ui.predefine("my/AsyncJSView", ["sap/ui/core/mvc/View", "sap/m/Panel"], function (View, Panel) {
            return View.extend("my.AsyncJSView", {
                createContent: function () {
                    return Promise.resolve(new Panel({ id: this.createId("myPanel") }));
                }
            });
        });
    }
});
QUnit.test("Component should resolve with completed async rootView", function (assert) {
    assert.expect(2);
    return Component.create({
        name: "my.AsyncComponent",
        manifest: false
    }).then(function (oComponent) {
        assert.ok(oComponent.getRootControl().isA("sap.ui.core.mvc.View"), "root view created");
        assert.ok(oComponent.getRootControl().byId("myPanel"), "View content created on Component resolve");
    });
});