import jQuery from "jquery.sap.global";
import JSONModel from "sap/ui/model/json/JSONModel";
import View from "sap/ui/core/mvc/View";
import UIArea from "sap/ui/core/UIArea";
import UIComponent from "sap/ui/core/UIComponent";
import Component from "sap/ui/core/Component";
import ComponentContainer from "sap/ui/core/ComponentContainer";
import Label from "sap/m/Label";
import Panel from "sap/m/Panel";
import HBox from "sap/m/HBox";
import MyGlobal from "sap/ui/core/qunit/mvc/viewprocessing/MyGlobal";
import SyncPromise from "sap/ui/base/SyncPromise";
import XMLView from "sap/ui/core/mvc/XMLView";
import XMLProcessingMode from "sap/ui/core/mvc/XMLProcessingMode";
import StashedControlSupport from "sap/ui/core/StashedControlSupport";
var oDIV = document.createElement("div");
oDIV.id = "content";
document.body.appendChild(oDIV);
function testComponentFactory(sComponentName, fnViewFactory, fnViewLoadedCallback) {
    jQuery.sap.declare(sComponentName + ".Component");
    UIComponent.extend(sComponentName + ".Component", {
        createContent: function () {
            var oView = fnViewFactory();
            oView.loaded().then(fnViewLoadedCallback.bind(null, oView, this));
            return oView;
        }
    });
    return sap.ui.component({
        name: sComponentName
    });
}
var iCounter = 0;
function testViewFactoryFn(bAsync, sProcessingMode) {
    return function (sViewId, sViewName, oController) {
        return sap.ui.xmlview(sViewId + (bAsync ? "async" : "sync") + (iCounter++), {
            async: bAsync,
            viewName: sViewName,
            controller: oController,
            processingMode: sProcessingMode
        });
    };
}
function testControllerImplFactory(assert, sControllerName) {
    var oControllerImpl = {
        onInit: function () {
            var oView = this.getView();
            assert.ok(oView, "View " + oView.getId() + " is present");
            assert.ok(oView.byId("Panel"), "Panel within the view is present");
        },
        onBeforeRendering: function () {
            var oView = this.getView();
            assert.ok(oView, "View " + oView.getId() + " is present");
            assert.ok(oView.byId("Panel"), "Panel within the view is present");
        }
    };
    sap.ui.controller(sControllerName, oControllerImpl);
    return oControllerImpl;
}
function viewProcessingTests(bAsyncView, sProcessingMode) {
    QUnit.module("XMLView " + (bAsyncView ? "async" : "sync") + (sProcessingMode ? " with " + sProcessingMode + " processing" : ""), {
        beforeEach: function () {
            var fnOldSyncPromiseAll = SyncPromise.all;
            MyGlobal.reset();
            this.SyncPromiseAllStub = sinon.stub(SyncPromise, "all").callsFake(function (args) {
                return fnOldSyncPromiseAll(args.reverse()).then(function (oRes) {
                    return oRes.reverse();
                });
            });
            this.viewFactory = testViewFactoryFn(bAsyncView, sProcessingMode);
            this._cleanup = [];
            this.renderSync = function (ctrl) {
                this._cleanup.push(ctrl);
                ctrl.placeAt("content");
                sap.ui.getCore().applyChanges();
            };
            this.oServer = sinon.fakeServer.create();
            this.oServer.xhr.supportCORS = true;
            this.oServer.xhr.useFilters = true;
            this.oServer.xhr.filters = [];
            this.oServer.autoRespond = true;
            this.oServer.xhr.addFilter(function (method, url) {
                return url.match(/ExtensionPoints\/Parent\/manifest.json/) == null && url.match(/StashedControl\/manifest.json/) == null;
            });
            StashedControlSupport.mixInto(Panel);
        },
        afterEach: function () {
            this._cleanup.forEach(function (ctrl) {
                ctrl.destroy();
            });
            this.SyncPromiseAllStub.restore();
            this.oServer.restore();
        }
    });
    QUnit.test("Simple Aggregation order with async view", function (assert) {
        var oView = this.viewFactory("myViewSimpleAggrs", "sap.ui.core.qunit.mvc.viewprocessing.ViewProcessingSimpleAggregations");
        var p = oView.loaded().then(function () {
            var mySimpleAggregationsControl = oView.byId("mySimpleAggregationsControl");
            assert.ok(mySimpleAggregationsControl, "'mySimpleAggregationsControl' is present");
            assert.deepEqual(mySimpleAggregationsControl.getAlternativeContent(), [], "alternative content is not used within view");
            var mySimpleAggregationsControl2 = oView.byId("mySimpleAggregationsControl2");
            assert.ok(mySimpleAggregationsControl2, "'mySimpleAggregationsControl2' is present");
            assert.deepEqual(mySimpleAggregationsControl2.getAlternativeContent(), [oView.byId("InnerButton122")], "alternative content contains 'InnerButton122'");
        });
        this.renderSync(new HBox({
            renderType: "Bare",
            items: oView
        }));
        return p;
    });
    QUnit.test("Aggregation order with async view", function (assert) {
        var oView = this.viewFactory("myViewAggrs", "sap.ui.core.qunit.mvc.viewprocessing.ViewProcessingManyAggregations");
        var p = oView.loaded().then(function () {
            var myManyAggregationsControl = oView.byId("myManyAggregationsControl");
            assert.deepEqual(myManyAggregationsControl.getAlternativeContent(), [oView.byId("myManyAggregationsControl2"), oView.byId("Button3"), oView.byId("Button4")], "alternativeContent aggregation contains 2 Buttons");
            assert.deepEqual(myManyAggregationsControl.getSecondaryContent(), [oView.byId("Button5"), oView.byId("Button6")], "secondaryContent aggregation contains 2 Buttons");
            assert.deepEqual(myManyAggregationsControl.getContent(), [oView.byId("Button1"), oView.byId("Button2")], "content aggregation contains 2 Buttons");
            assert.deepEqual(myManyAggregationsControl.getBottomControls(), [oView.byId("Button7")], "bottomControls aggregation contains 1 Button");
            assert.deepEqual(myManyAggregationsControl.getGroundControls(), [oView.byId("Button8")], "groundControls aggregation contains 1 Button");
            assert.deepEqual(myManyAggregationsControl.getCustomData(), [], "customData aggregation is empty");
            var oControl2 = oView.byId("myManyAggregationsControl2");
            var aBottomControls = oControl2.getBottomControls();
            var fnGetId = function (oElement) {
                return oElement.getId();
            };
            assert.deepEqual(aBottomControls.map(fnGetId), [oView.byId("InnerButton1"), oView.byId("InnerButton2"), oView.byId("InnerButton3"), oView.byId("InnerButton4")].map(fnGetId), "Ids of elements are in correct order within bottomControls aggregation");
            assert.deepEqual(aBottomControls, [oView.byId("InnerButton1"), oView.byId("InnerButton2"), oView.byId("InnerButton3"), oView.byId("InnerButton4")], "Elements are in correct order within bottomControls aggregation");
        });
        this.renderSync(new HBox({
            renderType: "Bare",
            items: oView
        }));
        return p;
    });
    QUnit.test("ExtensionPoint with async view tests", function (assert) {
        var oView = this.viewFactory("myViewEP", "sap.ui.core.qunit.mvc.viewprocessing.ViewProcessingExtensionPoint");
        var getText = function (oCtrl) {
            return oCtrl.getText();
        };
        var p = oView.loaded().then(function () {
            var mySimpleAggregationsControl = oView.byId("ep");
            assert.notOk(mySimpleAggregationsControl, "ExtensionPoint should not be present, only its controls");
            assert.deepEqual(oView.getContent().map(getText), [
                "test-ext-1",
                "test-ext-2",
                "test-ext-3",
                "test-ext-4",
                "test0"
            ], "there should be all 5 texts contained in the correct order");
            assert.deepEqual(MyGlobal.get().map(getText), [
                "test-ext-1",
                "test-ext-2",
                "test-ext-3",
                "test-ext-4"
            ], "there should be all 5 texts contained in the correct order");
        });
        this.renderSync(new HBox({
            renderType: "Bare",
            items: oView
        }));
        return p;
    });
    QUnit.test("controller event test", function (assert) {
        var oControllerImpl = testControllerImplFactory(assert, "sap.ui.core.qunit.mvc.viewprocessing.ViewProcessing");
        var pAfterRenderingController = new Promise(function (resolve) {
            oControllerImpl.onAfterRendering = function () {
                var oView = this.getView();
                assert.ok(oView, "oView is present in onAfterRendering");
                assert.ok(oView.byId("Panel"), "Panel is present within view");
                resolve();
            };
        });
        var fnOnInitSpy = this.spy(oControllerImpl, "onInit");
        var fnOnAfterRenderingSpy = this.spy(oControllerImpl, "onAfterRendering");
        sap.ui.controller("sap.ui.core.qunit.mvc.viewprocessing.ViewProcessing", oControllerImpl);
        var oController = sap.ui.controller("sap.ui.core.qunit.mvc.viewprocessing.ViewProcessing");
        assert.equal(fnOnAfterRenderingSpy.callCount, 0, "onAfterRendering is not called initially");
        assert.equal(fnOnInitSpy.callCount, 0, "onInit is not called initially");
        var oView = this.viewFactory("myViewWithController", "sap.ui.core.qunit.mvc.viewprocessing.ViewProcessing", oController);
        this.renderSync(new HBox({
            renderType: "Bare",
            items: oView
        }));
        return Promise.all([oView.loaded(), pAfterRenderingController]).then(function () {
            assert.equal(fnOnInitSpy.callCount, 1, "Init was called once");
            assert.equal(fnOnAfterRenderingSpy.callCount, 1, "onAfterRendering was called once");
        });
    });
    QUnit.test("Bad control processing", function (assert) {
        var oView = this.viewFactory("myViewBadControl", "sap.ui.core.qunit.mvc.viewprocessing.ViewProcessingBadControl");
        this.renderSync(oView);
        return oView.loaded().then(function () {
            var myBadControl = oView.byId("myBadControl");
            assert.ok(myBadControl, "BadControl is present within view");
        });
    });
    QUnit.test("Owner component setting for Controls with JSView", function (assert) {
        var iNumberOfComponents = 3;
        var iNumberOfSubViews = 2;
        var iCnt = 0;
        var done = assert.async();
        function fnCheckDone() {
            if (++iCnt === iNumberOfComponents * iNumberOfSubViews) {
                done();
            }
        }
        window._test_fnCallbackSubInit = function () {
            var oParent = this.getParent();
            while (oParent) {
                var newParent = oParent.getParent();
                if (newParent) {
                    assert.ok(oParent._sOwnerId, "OwnerId is set for parent control");
                    assert.equal(oParent._sOwnerId, this._sOwnerId, "OwnerId matches parent");
                }
                oParent = newParent;
            }
            fnCheckDone();
        };
        function fnAssertions(oView, oComponentContext) {
            var oPanel = oView.byId("Panel");
            assert.ok(oPanel, "panel is present within " + oView.getId());
            assert.equal(Component.getOwnerIdFor(oPanel), oComponentContext.getId(), "Propagation of owner component to view creation works!");
        }
        for (var i = 0; i < iNumberOfComponents; i++) {
            var fnViewFactory = this.viewFactory.bind(null, (bAsyncView ? "async" : "sync") + sProcessingMode + "view" + i, "sap.ui.core.qunit.mvc.viewprocessing.ViewProcessingRec");
            testComponentFactory("my.test." + (bAsyncView ? "async" : "sync") + sProcessingMode + "." + i, fnViewFactory, fnAssertions);
        }
    });
    QUnit.test("Owner component setting for Controls with Typed View", function (assert) {
        var iNumberOfComponents = 3;
        var iNumberOfSubViews = 2;
        var iCnt = 0;
        var done = assert.async();
        function fnCheckDone() {
            if (++iCnt === iNumberOfComponents * iNumberOfSubViews) {
                done();
            }
        }
        window._test_fnCallbackSubInit = function () {
            var oParent = this.getParent();
            while (oParent) {
                var newParent = oParent.getParent();
                if (newParent) {
                    assert.ok(oParent._sOwnerId, "OwnerId is set for parent control");
                    assert.equal(oParent._sOwnerId, this._sOwnerId, "OwnerId matches parent");
                }
                oParent = newParent;
            }
            fnCheckDone();
        };
        function fnAssertions(oView, oComponentContext) {
            var oPanel = oView.byId("Panel");
            assert.ok(oPanel, "panel is present within " + oView.getId());
            assert.equal(Component.getOwnerIdFor(oPanel), oComponentContext.getId(), "Propagation of owner component to view creation works!");
        }
        for (var i = 0; i < iNumberOfComponents; i++) {
            var fnViewFactory = this.viewFactory.bind(null, (bAsyncView ? "async" : "sync") + sProcessingMode + "view" + i, "sap.ui.core.qunit.mvc.viewprocessing.ViewProcessingRecWithTypedView");
            testComponentFactory("my.test.typedview." + (bAsyncView ? "async" : "sync") + sProcessingMode + "." + i, fnViewFactory, fnAssertions);
        }
    });
    QUnit.test("Owner component setting for nested Sync View in Async View", function (assert) {
        var done = assert.async();
        function fnAssertions(oView, oComponentContext) {
            assert.equal(Component.getOwnerIdFor(oView), oComponentContext.getId(), "Owner Component for Async View is correct.");
            assert.equal(Component.getOwnerIdFor(oView.byId("nestedView")), oComponentContext.getId(), "Owner Component for Sync View in Async View is correct.");
            done();
        }
        var fnViewFactory = this.viewFactory.bind(null, (bAsyncView ? "async" : "sync") + sProcessingMode + "view_x", "sap.ui.core.qunit.mvc.viewprocessing.NestingView");
        testComponentFactory("TheBest." + (bAsyncView ? "async" : "sync") + sProcessingMode, fnViewFactory, fnAssertions);
    });
    QUnit.test("Owner component setting for ExtensionPoints", function (assert) {
        var done = assert.async();
        var oManifest = {
            "_version": "0.0.1",
            "sap.app": {
                "id": "sap.ui.core.qunit.mvc.viewprocessing.ExtensionPoints.Parent"
            },
            "sap.ui5": {
                "rootView": {
                    "viewName": "sap.ui.core.qunit.mvc.viewprocessing.ExtensionPoints.Parent.Main",
                    "type": "XML",
                    "async": bAsyncView,
                    "processingMode": sProcessingMode,
                    "id": "app"
                }
            }
        };
        this.oServer.respondWith("GET", /ExtensionPoints\/Parent\/manifest\.json/, [
            200,
            {
                "Content-Type": "application/json"
            },
            JSON.stringify(oManifest)
        ]);
        var fnAssertions = function (oComponent, oView) {
            var aContent = oView.getContent();
            var oEPOne = aContent[0];
            assert.deepEqual(Component.getOwnerComponentFor(oEPOne), oComponent, "Owner Component correctly set");
            var aEPoneContent = aContent[0].getContent();
            assert.deepEqual(Component.getOwnerComponentFor(aEPoneContent[0]), oComponent, "Owner Component correctly set for controls in extension-point view: EPone");
            assert.deepEqual(Component.getOwnerComponentFor(aContent[1]), oComponent, "Owner Component correctly set");
            var oEPtwo = aContent[2];
            assert.deepEqual(Component.getOwnerComponentFor(oEPtwo), oComponent, "Owner Component correctly set");
            var aEPtwoContent = oEPtwo.getContent();
            assert.deepEqual(Component.getOwnerComponentFor(aEPtwoContent[0]), oComponent, "Owner Component correctly set for controls in extension-point view: EPtwo");
            var oEPnesting = aContent[3];
            assert.deepEqual(Component.getOwnerComponentFor(oEPnesting), oComponent, "Owner Component correctly set");
            var aEPnestingContent = oEPnesting.getContent();
            assert.deepEqual(Component.getOwnerComponentFor(aEPnestingContent[0]), oComponent, "Owner Component correctly set for controls in extension-point view: EPnesting (1)");
            assert.deepEqual(Component.getOwnerComponentFor(aEPnestingContent[1]), oComponent, "Owner Component correctly set for controls in extension-point view: EPnesting (2)");
            assert.deepEqual(Component.getOwnerComponentFor(aContent[4]), oComponent, "Owner Component correctly set");
            oComponent.destroy();
            oComponent.getMetadata().getParent()._oManifest.destroy();
            delete oComponent.getMetadata().getParent()._oManifest;
            done();
        };
        if (bAsyncView) {
            Component.create({
                name: "sap.ui.core.qunit.mvc.viewprocessing.ExtensionPoints.Child"
            }).then(function (oComponent) {
                oComponent.getRootControl().loaded().then(function (oView) {
                    fnAssertions(oComponent, oView);
                });
            });
        }
        else {
            var oComponent = sap.ui.component({
                name: "sap.ui.core.qunit.mvc.viewprocessing.ExtensionPoints.Child"
            });
            sap.ui.getCore().applyChanges();
            fnAssertions(oComponent, oComponent.getRootControl());
        }
    });
    QUnit.test("Owner component setting for stashed control", function (assert) {
        var done = assert.async();
        var sComponentName = "sap.ui.core.qunit.mvc.viewprocessing.StashedControl" + bAsyncView + sProcessingMode;
        sap.ui.predefine((sComponentName + ".Component").replace(/\./g, "/"), ["sap/ui/core/UIComponent"], function (UIComponent) {
            return UIComponent.extend(sComponentName + ".Component", {});
        });
        var oManifest = {
            "_version": "0.0.1",
            "sap.app": {
                "id": sComponentName
            },
            "sap.ui5": {
                "rootView": {
                    "viewName": "sap.ui.core.qunit.mvc.viewprocessing.StashedControl.Main",
                    "type": "XML",
                    "async": bAsyncView,
                    "processingMode": sProcessingMode,
                    "id": "app"
                }
            }
        };
        var fnAssertions = function (oComponent, oView) {
            var oPanel = oView.byId("panel");
            var oButton = oView.byId("stashedButton");
            assert.ok(oPanel, "Panel wrapper is available.");
            assert.notOk(oButton, "Stashed button inside stashed panel does not exist yet.");
            var oNormalButtonInStashedParent = oView.byId("normalButtonInStashedParent");
            assert.ok(!oNormalButtonInStashedParent, "Normal button in stashed area isn't created");
            var oStashedControlForButtonInPanel = oView.byId("sap-ui-stashed-stashedButton");
            assert.ok(!oStashedControlForButtonInPanel, "StashedControl for button in stashed area (Panel) isn't created");
            var oOwnerComponent = Component.getOwnerComponentFor(oPanel);
            assert.ok(oOwnerComponent, "Owner Component for StashedControl of panel can be found");
            if (oOwnerComponent) {
                assert.strictEqual(oOwnerComponent.getId(), oComponent.getId(), "Stashed Panel should have owner component");
            }
            var oStashedPanel = sap.ui.getCore().byId(oView.createId("panel"));
            oOwnerComponent = Component.getOwnerComponentFor(oStashedPanel);
            assert.ok(oOwnerComponent, "Owner Component for StashedControl of panel can be found");
            if (oOwnerComponent) {
                assert.strictEqual(oOwnerComponent.getId(), oComponent.getId(), "Stashed Panel should have owner component");
            }
            var oNormalButton = oView.byId("normalButton");
            oOwnerComponent = Component.getOwnerComponentFor(oNormalButton);
            assert.ok(oOwnerComponent, "Owner Component for normal button can be found");
            if (oOwnerComponent) {
                assert.strictEqual(oOwnerComponent.getId(), oComponent.getId(), "Normal button should have owner component");
            }
            var oPage = oView.byId("page");
            assert.equal(oPage.getContent().length, 2, "Two elements in page content aggregation.");
            assert.ok(oPage.getContent()[0].isA("sap.m.Panel"), "1st entry in content aggregation is a Panel.");
            assert.equal(oPage.getContent()[0].getContent().length, 0, "Wrapper for stashed Panel has no content in its content aggregation.");
            assert.ok(oPage.getContent()[1].isA("sap.m.Button"), "2nd entry in content aggregation is a Button.");
            var aStashedControlsInPage = StashedControlSupport.getStashedControls(oView.createId("page"));
            assert.equal(aStashedControlsInPage.length, 1, "Only one stashed control in Page.");
            assert.deepEqual(aStashedControlsInPage[0], oStashedPanel, "StashedControl in Page is the stashed panel");
            var oRealPanel = oStashedPanel.unstash();
            assert.ok(oRealPanel.isA("sap.m.Panel"), "The real panel instance is created after unstash");
            oStashedControlForButtonInPanel = sap.ui.getCore().byId(oView.createId("stashedButton"));
            oNormalButtonInStashedParent = oView.byId("normalButtonInStashedParent");
            assert.ok(oStashedControlForButtonInPanel, "Stashed button in stashed area is created");
            assert.ok(oNormalButtonInStashedParent, "Normal button in stashed area is created");
            oOwnerComponent = Component.getOwnerComponentFor(oStashedControlForButtonInPanel);
            assert.ok(oOwnerComponent, "Owner Component for stashed button can be found");
            if (oOwnerComponent) {
                assert.strictEqual(oOwnerComponent.getId(), oComponent.getId(), "Stashed button should have owner component");
            }
            oOwnerComponent = Component.getOwnerComponentFor(oNormalButtonInStashedParent);
            assert.ok(oOwnerComponent, "Owner Component for normal button in stashed area can be found");
            if (oOwnerComponent) {
                assert.strictEqual(oOwnerComponent.getId(), oComponent.getId(), "Normal button in stashed area should have owner component");
            }
            oComponent.destroy();
            done();
        };
        if (bAsyncView) {
            Component.create({
                name: sComponentName,
                manifest: oManifest
            }).then(function (oComponent) {
                oComponent.getRootControl().loaded().then(function (oView) {
                    fnAssertions(oComponent, oView);
                });
            });
        }
        else {
            var oComponent = sap.ui.component({
                name: sComponentName,
                manifest: oManifest,
                async: false
            });
            sap.ui.getCore().applyChanges();
            fnAssertions(oComponent, oComponent.getRootControl());
        }
    });
}
viewProcessingTests(true);
viewProcessingTests(true, XMLProcessingMode.Sequential);
viewProcessingTests(false);
viewProcessingTests(false, XMLProcessingMode.Sequential);
viewProcessingTests(false, XMLProcessingMode.SequentialLegacy);