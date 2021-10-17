import Log from "sap/base/Log";
import View from "sap/ui/core/mvc/View";
import Targets from "sap/ui/core/routing/Targets";
import Router from "sap/ui/core/routing/Router";
import Views from "sap/ui/core/routing/Views";
import App from "sap/m/App";
import Panel from "sap/m/Panel";
import JSONModel from "sap/ui/model/json/JSONModel";
var ShellSubstitute = Panel;
function addClock() {
    if (this.clock == null && this._oSandbox) {
        this.clock = this._oSandbox.useFakeTimers();
    }
}
QUnit.module("Connect Targets with a router", {
    beforeEach: function () {
        this.oViews = new Views({ async: false });
        this.oTargets = new Targets({
            targets: {
                myTarget: {
                    viewName: "myView"
                },
                myParent: {
                    viewName: "myParentView"
                },
                myChild: {
                    parent: "myParent",
                    viewName: "myChildView"
                }
            },
            config: {
                async: false
            },
            views: this.oViews
        });
    },
    afterEach: function () {
        this.oTargets.destroy();
    }
});
QUnit.test("First call of setting router is accepted", function (assert) {
    var oRouter = new Router({}, { async: false }, null, {});
    this.oTargets._setRouter(oRouter);
    assert.strictEqual(this.oTargets._oRouter, oRouter, "The router is set into the Targets");
});
QUnit.test("Further call of setting router is ignored", function (assert) {
    var oRouter = new Router({}, { async: false }, null, {}), oRouter1 = new Router({}, { async: false }, null, {});
    this.oTargets._setRouter(oRouter);
    this.oTargets._setRouter(oRouter1);
    assert.strictEqual(this.oTargets._oRouter, oRouter, "The router is still the same one as before the second call");
});
QUnit.module("getTarget and target names", {
    beforeEach: function () {
        this.oViews = new Views();
        this.oTargets = new Targets({
            targets: {
                myTarget: {
                    viewName: "myView"
                },
                myParent: {
                    viewName: "myParentView"
                },
                myChild: {
                    parent: "myParent",
                    viewName: "myChildView"
                }
            },
            views: this.oViews
        });
    },
    afterEach: function () {
        this.oTargets.destroy();
    }
});
QUnit.test("Should be able to get an existing target by key", function (assert) {
    var oTarget = this.oTargets.getTarget("myTarget");
    assert.strictEqual(oTarget._oOptions.viewName, "myView", "Did retrieve the correct Target");
    assert.strictEqual(oTarget._oCache, this.oViews, "Did pass the views instance");
});
QUnit.test("Should be able to get an existing target by key which is set in an object", function (assert) {
    var oTarget = this.oTargets.getTarget({ name: "myTarget" });
    assert.strictEqual(oTarget._oOptions.viewName, "myView", "Did retrieve the correct Target");
    assert.strictEqual(oTarget._oCache, this.oViews, "Did pass the views instance");
});
QUnit.test("Should return undefined if a target does not exist", function (assert) {
    var oTarget = this.oTargets.getTarget("foo");
    assert.strictEqual(oTarget, undefined, "Did not find such a target");
});
QUnit.test("Should return undefined if the given target name is invalid (false, undefined)", function (assert) {
    var oTarget = this.oTargets.getTarget(undefined);
    assert.strictEqual(oTarget, undefined, "Did not find such a target");
    oTarget = this.oTargets.getTarget(false);
    assert.strictEqual(oTarget, undefined, "Did not find such a target");
});
QUnit.test("Should be able to get a child target", function (assert) {
    var oChild = this.oTargets.getTarget("myChild");
    assert.strictEqual(oChild._oOptions.viewName, "myChildView", "Did retrieve the correct Target");
    assert.strictEqual(oChild._oParent, this.oTargets.getTarget("myParent"), "The parent was correctly passed to the target");
});
QUnit.test("Should be able to get multiple targets", function (assert) {
    var oErrorSpy = this.spy(Log, "error");
    var aTargets = this.oTargets.getTarget(["myTarget", "foo", "myParent"]);
    assert.strictEqual(aTargets.length, 2, "Should return two targets");
    assert.strictEqual(aTargets[0], this.oTargets.getTarget("myTarget"), "The first target should be myTarget");
    assert.strictEqual(aTargets[1], this.oTargets.getTarget("myParent"), "The second target should be myParent");
    sinon.assert.calledWith(oErrorSpy, sinon.match(/"foo" does not exist/), sinon.match(this.oTargets));
    aTargets = this.oTargets.getTarget([undefined, "myTarget", false, { name: "myParent" }, "foo", { name: "myTarget" }]);
    assert.strictEqual(aTargets.length, 3, "Should return three targets");
    assert.strictEqual(aTargets[0], this.oTargets.getTarget("myTarget"), "The first target should be myTarget");
    assert.strictEqual(aTargets[1], this.oTargets.getTarget("myParent"), "The second target should be myParent");
    assert.strictEqual(aTargets[2], this.oTargets.getTarget("myTarget"), "The third target should be myTarget");
});
QUnit.test("Should be able to add a new target", function (assert) {
    var oErrorSpy = this.spy(Log, "error");
    this.oTargets.addTarget("newTarget", {
        viewName: "newView",
        parent: "myParent"
    });
    assert.ok(oErrorSpy.notCalled, "no error is logged");
    var oTarget = this.oTargets.getTarget("newTarget");
    assert.ok(oTarget, "new target object is created");
    assert.strictEqual(oTarget._oOptions._name, "newTarget", "target name should be correct");
    assert.strictEqual(oTarget._oParent, this.oTargets.getTarget("myParent"), "correct parent should be set");
});
QUnit.test("Should kept the existing target and log an error message if 'addTarget' is called with the same name", function (assert) {
    var oStub = this.stub(Log, "error").callsFake(jQuery.noop);
    this.oTargets.addTarget("myParent", {
        viewName: "myNewParentView"
    });
    var oParent = this.oTargets.getTarget("myParent");
    assert.strictEqual(oParent._oOptions.viewName, "myParentView", "options stay the same");
    sinon.assert.calledWith(oStub, sinon.match(/myParent/), sinon.match(this.oTargets));
});
QUnit.module("config - defaults and additional values", {
    beforeEach: function () {
        var oTargetConfig = {
            controlAggregation: "foo",
            someThingCustom: "bar",
            someThingToBeReplaced: "baz"
        };
        this.oTargets = new Targets({
            targets: {
                myView: {
                    someThingToBeReplaced: "replaced",
                    viewLevel: 5
                }
            },
            config: oTargetConfig
        });
    },
    afterEach: function () {
        this.oTargets.destroy();
    }
});
QUnit.test("Should be able to get an existing target if no key was specified - view should be the key", function (assert) {
    var oOptions = this.oTargets.getTarget("myView")._oOptions;
    assert.strictEqual(oOptions.viewLevel, 5, "Did use the view level");
    assert.strictEqual(oOptions.controlAggregation, "foo", "Did pass one of the routing api values from the config");
    assert.strictEqual(oOptions.someThingToBeReplaced, "replaced", "Did overwrite ");
});
QUnit.test("Should propergate changes in the rootView to the targets", function (assert) {
    this.oTargets._setRootViewId("changed");
    var oOptions = this.oTargets.getTarget("myView")._oOptions;
    assert.strictEqual(oOptions.rootView, "changed", "Did pass one of the routing api values from the config");
});
QUnit.module("config - invalid parent", {
    afterEach: function () {
        this.oTargets.destroy();
    }
});
QUnit.test("Should complain about an non existing parent", function (assert) {
    var oIncorrectConfig = {
        targets: {
            myChildWithoutParent: {
                parent: "foo"
            }
        }
    }, oErrorStub = this.stub(Log, "error").callsFake(jQuery.noop);
    this.oTargets = new Targets(oIncorrectConfig);
    sinon.assert.calledWith(oErrorStub, sinon.match(/was not found/), sinon.match(this.oTargets));
});
QUnit.module("display", {
    beforeEach: function () {
        this.oTargets = new Targets({
            targets: {
                firstTarget: {},
                secondTarget: {}
            }
        });
    },
    afterEach: function () {
        this.oTargets.destroy();
    }
});
QUnit.test("Should display one target", function (assert) {
    var fnFirstDisplayStub = this.stub(this.oTargets.getTarget("firstTarget"), "display").callsFake(jQuery.noop);
    var fnSecondDisplayStub = this.stub(this.oTargets.getTarget("secondTarget"), "display").callsFake(jQuery.noop);
    this.oTargets.display("firstTarget");
    assert.strictEqual(fnFirstDisplayStub.callCount, 1, "Did invoke display on the first target");
    assert.strictEqual(fnSecondDisplayStub.callCount, 0, "Did not invoke display on the second target");
});
QUnit.test("Should display multiple targets", function (assert) {
    var fnFirstDisplayStub = this.stub(this.oTargets.getTarget("firstTarget"), "display").callsFake(jQuery.noop);
    var fnSecondDisplayStub = this.stub(this.oTargets.getTarget("secondTarget"), "display").callsFake(jQuery.noop);
    this.oTargets.display(["firstTarget", "secondTarget"]);
    assert.strictEqual(fnFirstDisplayStub.callCount, 1, "Did invoke display on the first target");
    assert.strictEqual(fnSecondDisplayStub.callCount, 1, "Did invoke display on the second target");
});
QUnit.test("Should log an error if user tries to display a non existing Target", function (assert) {
    var oErrorStub = this.stub(Log, "error").callsFake(jQuery.noop);
    this.oTargets.display("foo");
    sinon.assert.calledWith(oErrorStub, sinon.match(/does not exist/), sinon.match(this.oTargets));
});
QUnit.test("Should log an error if user tries to display a non existing Target, but should display existing ones", function (assert) {
    var oErrorStub = this.stub(Log, "error").callsFake(jQuery.noop);
    var fnFirstDisplayStub = this.stub(this.oTargets.getTarget("firstTarget"), "display").callsFake(jQuery.noop);
    this.oTargets.display(["foo", "firstTarget"]);
    assert.strictEqual(fnFirstDisplayStub.callCount, 1, "Did invoke display on the first target");
    sinon.assert.calledWith(oErrorStub, sinon.match(/does not exist/), sinon.match(this.oTargets));
});
function createView(aContent, sId) {
    var sXmlViewContent = aContent.join(""), oViewOptions = {
        id: sId,
        viewContent: sXmlViewContent,
        type: "XML"
    };
    return sap.ui.view(oViewOptions);
}
QUnit.module("display event", {
    beforeEach: function () {
        addClock.call(this);
        this.oShell = new ShellSubstitute();
        this.oView = createView(["<View xmlns=\"sap.ui.core.mvc\">", "</View>"]);
        this.oDefaultConfig = {
            viewPath: "bar",
            viewName: "foo",
            controlAggregation: "content",
            viewType: "XML",
            controlId: this.oShell.getId()
        };
        this.oTargetsCofig = {
            myTarget: {},
            mySecondTarget: {},
            myChild: {
                parent: "myTarget"
            }
        };
        this.oViews = new Views();
        this.oTargets = new Targets({
            targets: this.oTargetsCofig,
            views: this.oViews,
            config: this.oDefaultConfig
        });
    },
    afterEach: function () {
        this.oShell.destroy();
        this.oTargets.destroy();
        this.oViews.destroy();
        this.oView.destroy();
    }
});
QUnit.test("should be able to fire/attach/detach the display event", function (assert) {
    var oParameters = { foo: "bar" }, oListener = {}, oData = { some: "data" }, fnEventSpy = this.spy(function (oEvent, oActualData) {
        assert.strictEqual(oActualData, oData, "the data is correct");
        assert.strictEqual(oEvent.getParameters(), oParameters, "the parameters are correct");
        assert.strictEqual(this, oListener, "the this pointer is correct");
    }), oFireReturnValue, oDetachReturnValue, oAttachReturnValue = this.oTargets.attachDisplay(oData, fnEventSpy, oListener);
    oFireReturnValue = this.oTargets.fireDisplay(oParameters);
    oDetachReturnValue = this.oTargets.detachDisplay(fnEventSpy, oListener);
    this.oTargets.fireDisplay();
    this.clock.tick(0);
    assert.strictEqual(fnEventSpy.callCount, 1, "did call the attach spy only once");
    assert.strictEqual(oAttachReturnValue, this.oTargets, "did return this for chaining for attach");
    assert.strictEqual(oDetachReturnValue, this.oTargets, "did return this for chaining for detach");
    assert.strictEqual(oFireReturnValue, this.oTargets, "did return this for chaining for fire");
});
function allPropertiesStrictEqual(object1, object2, assert) {
    var sPropertyName;
    for (sPropertyName in object1) {
        if (object1.hasOwnProperty(sPropertyName)) {
            if (object2.hasOwnProperty(sPropertyName)) {
                if (typeof object1[sPropertyName] === "object") {
                    allPropertiesStrictEqual(object1[sPropertyName], object2[sPropertyName], assert);
                }
                else {
                    assert.strictEqual(object1[sPropertyName], object2[sPropertyName], "the property " + sPropertyName + " is equal");
                }
            }
            else {
                assert.ok(false, JSON.stringify(object1) + " has a property " + sPropertyName + " the second object does not have " + JSON.stringify(object2));
            }
        }
    }
}
QUnit.test("Should fire the display event", function (assert) {
    var that = this, oParameters = null, fnEventSpy = this.spy(function (oEvent) {
        oParameters = oEvent.getParameters();
    }), oData = { some: "data" };
    this.stub(this.oViews, "_getView").callsFake(function () {
        return that.oView;
    });
    this.oTargets.attachDisplay(fnEventSpy);
    this.oTargets.display("myTarget", oData);
    this.clock.tick(0);
    assert.strictEqual(fnEventSpy.callCount, 1, "the event got fired");
    assert.strictEqual(oParameters.view, this.oView, "view got passed to the event");
    assert.strictEqual(oParameters.control, this.oShell, "control was the shell");
    assert.strictEqual(oParameters.data, oData, "data was passed");
    assert.strictEqual(oParameters.name, "myTarget", "name was passed");
    allPropertiesStrictEqual(jQuery.extend(true, { _name: "myTarget" }, this.oTargetsCofig.myTarget, this.oDefaultConfig), oParameters.config, assert);
});
QUnit.test("Should fire the display event for multiple targets and children", function (assert) {
    var aTargetNames = [], that = this, oParameters = null, oData = { some: "data" }, fnEventSpy = this.spy(function (oEvent) {
        oParameters = oEvent.getParameters();
        aTargetNames.push(oParameters.name);
        allPropertiesStrictEqual(oParameters.config, jQuery.extend(true, {}, that.oTargets.getTarget(oParameters.name)._oOptions, that.oDefaultConfig), assert);
        assert.strictEqual(oParameters.view, that.oView, "view got passed to the event");
        assert.strictEqual(oParameters.control, that.oShell, "control got passed to the event");
        assert.strictEqual(oParameters.data, oData, "data was passed");
    });
    this.stub(this.oViews, "_getView").callsFake(function () {
        return that.oView;
    });
    this.oTargets.attachDisplay(fnEventSpy);
    this.oTargets.display(["myChild", "mySecondTarget"], oData);
    this.clock.tick(0);
    assert.strictEqual(fnEventSpy.callCount, 3, "the event got fired");
    assert.strictEqual(aTargetNames.shift(), "myTarget", "the parent got fired first");
    assert.strictEqual(aTargetNames.shift(), "myChild", "the child got fired after the parent");
    assert.strictEqual(aTargetNames.shift(), "mySecondTarget", "the second target got fired last");
});
QUnit.module("suspend", {
    beforeEach: function () {
        this.oTargets = new Targets({
            targets: {
                firstTarget: {},
                secondTarget: {},
                thirdTarget: {}
            },
            config: {
                async: true
            }
        });
    },
    afterEach: function () {
        this.oTargets.destroy();
    }
});
QUnit.test("Should suspend the specified target", function (assert) {
    var oTarget = this.oTargets.getTarget("firstTarget");
    var oSpy = this.spy(oTarget, "suspend");
    var oUnrelatedTarget = this.oTargets.getTarget("secondTarget");
    var oUnrelatedTargetSpy = this.spy(oUnrelatedTarget, "suspend");
    this.oTargets.suspend("firstTarget");
    assert.equal(oSpy.callCount, 1, "suspend is called on the target");
    assert.ok(oUnrelatedTargetSpy.notCalled, "suspend isn't called on the other target");
});
QUnit.test("Should suspend the specified targets", function (assert) {
    var oTarget1 = this.oTargets.getTarget("firstTarget");
    var oTarget1Spy = this.spy(oTarget1, "suspend");
    var oTarget2 = this.oTargets.getTarget("secondTarget");
    var oTarget2Spy = this.spy(oTarget2, "suspend");
    var oTarget3 = this.oTargets.getTarget("thirdTarget");
    var oTarget3Spy = this.spy(oTarget3, "suspend");
    this.oTargets.suspend(["firstTarget", "secondTarget"]);
    assert.equal(oTarget1Spy.callCount, 1, "suspend is called on the target");
    assert.equal(oTarget2Spy.callCount, 1, "suspend is called on the target");
    assert.ok(oTarget3Spy.notCalled, "suspend isn't called on the other target");
});
QUnit.test("Should suspend the specified targets with different type of parameter", function (assert) {
    var oTarget1 = this.oTargets.getTarget("firstTarget");
    var oTarget1Spy = this.spy(oTarget1, "suspend");
    var oTarget2 = this.oTargets.getTarget("secondTarget");
    var oTarget2Spy = this.spy(oTarget2, "suspend");
    var oTarget3 = this.oTargets.getTarget("thirdTarget");
    var oTarget3Spy = this.spy(oTarget3, "suspend");
    this.oTargets.suspend(["firstTarget", { name: "secondTarget" }]);
    assert.equal(oTarget1Spy.callCount, 1, "suspend is called on the target");
    assert.equal(oTarget2Spy.callCount, 1, "suspend is called on the target");
    assert.ok(oTarget3Spy.notCalled, "suspend isn't called on the other target");
});
QUnit.module("titleChanged event", {
    beforeEach: function () {
        addClock.call(this);
        this.oApp = new App();
        this.oView = createView(["<View xmlns=\"sap.ui.core.mvc\">", "</View>"]);
        this.oDefaultConfig = {
            viewPath: "bar",
            viewName: "foo",
            controlAggregation: "pages",
            viewType: "XML",
            controlId: this.oApp.getId()
        };
        this.oTargetsConfig = {
            myTarget: {
                title: "myTitle"
            },
            mySecondTarget: {
                title: "mySecondTitle"
            },
            myNoTitleTarget: {},
            myChild: {
                parent: "myTarget",
                title: "myChildTarget"
            },
            myNoTitleGrandChild: {
                parent: "myChild"
            },
            myNoTitleChild: {
                parent: "myTarget"
            }
        };
        this.oViews = new Views();
        this.oTargets = new Targets({
            targets: this.oTargetsConfig,
            views: this.oViews,
            config: this.oDefaultConfig
        });
    },
    afterEach: function () {
        this.oApp.destroy();
        this.oTargets.destroy();
        this.oViews.destroy();
        this.oView.destroy();
    }
});
QUnit.test("fire/attach/detach", function (assert) {
    var oParameters = { title: "bar" }, oListener = {}, oData = { some: "data" }, fnEventSpy = this.spy(function (oEvent, oActualData) {
        assert.strictEqual(oActualData, oData, "the data is correct");
        assert.strictEqual(oEvent.getParameters(), oParameters, "the parameters are correct");
        assert.strictEqual(this, oListener, "the this pointer is correct");
    }), oFireReturnValue, oDetachReturnValue, oAttachReturnValue = this.oTargets.attachTitleChanged(oData, fnEventSpy, oListener);
    oFireReturnValue = this.oTargets.fireTitleChanged(oParameters);
    oDetachReturnValue = this.oTargets.detachTitleChanged(fnEventSpy, oListener);
    this.oTargets.fireTitleChanged(oParameters);
    assert.strictEqual(fnEventSpy.callCount, 1, "did call the attach spy only once");
    assert.strictEqual(oAttachReturnValue, this.oTargets, "did return this for chaining for attach");
    assert.strictEqual(oDetachReturnValue, this.oTargets, "did return this for chaining for detach");
    assert.strictEqual(oFireReturnValue, this.oTargets, "did return this for chaining for fire");
});
QUnit.test("single target", function (assert) {
    var that = this, oParameters = null, fnEventSpy = this.spy(function (oEvent) {
        oParameters = oEvent.getParameters();
    }), oData = { some: "data" };
    this.stub(this.oViews, "_getView").callsFake(function () {
        return that.oView;
    });
    this.oTargets.attachTitleChanged(fnEventSpy);
    this.oTargets.display("myTarget", oData);
    this.clock.tick(0);
    assert.strictEqual(fnEventSpy.callCount, 1, "the event got fired");
    assert.strictEqual(oParameters.name, "myTarget", "parameter 'name' is set");
    assert.strictEqual(oParameters.title, "myTitle", "parameter 'title' is set");
});
QUnit.test("multiple targets - default title", function (assert) {
    var that = this, oParameters = null, oData = { some: "data" }, fnEventSpy = this.spy(function (oEvent) {
        oParameters = oEvent.getParameters();
        assert.strictEqual(oParameters.name, "myTarget", "target got passed to the event");
        assert.strictEqual(oParameters.title, "myTitle", "title got passed to the event");
    });
    this.stub(this.oViews, "_getView").callsFake(function () {
        return that.oView;
    });
    this.oTargets.attachTitleChanged(fnEventSpy);
    this.oTargets.display(["myNoTitleTarget", "myTarget", "mySecondTarget"], oData);
    this.clock.tick(0);
    assert.strictEqual(fnEventSpy.callCount, 1, "the event got fired");
});
QUnit.test("multiple targets - provided TitleTarget", function (assert) {
    var that = this, oParameters = null, oData = { some: "data" }, fnEventSpy = this.spy(function (oEvent) {
        oParameters = oEvent.getParameters();
        assert.strictEqual(oParameters.name, "mySecondTarget", "target got passed to the event");
        assert.strictEqual(oParameters.title, "mySecondTitle", "title got passed to the event");
    });
    this.stub(this.oViews, "_getView").callsFake(function () {
        return that.oView;
    });
    this.oTargets.attachTitleChanged(fnEventSpy);
    this.oTargets.display(["myNoTitleTarget", "myTarget", "mySecondTarget"], oData, "mySecondTarget");
    this.clock.tick(0);
    assert.strictEqual(fnEventSpy.callCount, 1, "the event got fired");
});
QUnit.test("multiple targets - provided TitleTarget pointing to target without title", function (assert) {
    var that = this, oData = { some: "data" }, fnEventSpy = this.spy();
    this.stub(this.oViews, "_getView").callsFake(function () {
        return that.oView;
    });
    this.oTargets.attachTitleChanged(fnEventSpy);
    this.oTargets.display(["myNoTitleTarget", "myTarget", "mySecondTarget"], oData, "myNoTitleTarget");
    this.clock.tick(0);
    assert.ok(fnEventSpy.notCalled, "the event isn't fired");
});
QUnit.test("provided invalid TitleTarget", function (assert) {
    var that = this, oData = { some: "data" }, fnEventSpy = this.spy();
    this.stub(this.oViews, "_getView").callsFake(function () {
        return that.oView;
    });
    var oLogSpy = this.spy(Log, "error");
    this.oTargets.attachTitleChanged(fnEventSpy);
    this.oTargets.display(["myTarget"], oData, "foo");
    this.clock.tick(0);
    assert.ok(fnEventSpy.notCalled, "the event isn't fired");
    sinon.assert.calledWith(oLogSpy, "The target with the name \"foo\" where the titleChanged event should be fired does not exist!", this.oTargets);
});
QUnit.test("single target which has its own title with parent", function (assert) {
    var that = this, oParameters = null, oData = { some: "data" }, fnEventSpy = this.spy(function (oEvent) {
        oParameters = oEvent.getParameters();
        assert.strictEqual(oParameters.name, "myChild", "name from itself is taken");
        assert.strictEqual(oParameters.title, "myChildTarget", "title from itself is taken");
    });
    this.stub(this.oViews, "_getView").callsFake(function () {
        return that.oView;
    });
    this.oTargets.attachTitleChanged(fnEventSpy);
    this.oTargets.display(["myChild"], oData);
    this.clock.tick(0);
    assert.strictEqual(fnEventSpy.callCount, 1, "the event got fired");
});
QUnit.test("single target which doesn't have title with parent", function (assert) {
    var that = this, oParameters = null, oData = { some: "data" }, fnEventSpy = this.spy(function (oEvent) {
        oParameters = oEvent.getParameters();
        assert.strictEqual(oParameters.name, "myTarget", "name from parent target is taken");
        assert.strictEqual(oParameters.title, "myTitle", "title from parent target is taken");
    });
    this.stub(this.oViews, "_getView").callsFake(function () {
        return that.oView;
    });
    this.oTargets.attachTitleChanged(fnEventSpy);
    this.oTargets.display(["myNoTitleChild"], oData);
    this.clock.tick(0);
    assert.strictEqual(fnEventSpy.callCount, 1, "the event got fired");
});
QUnit.test("single target with multiple ancestors", function (assert) {
    var that = this, oParameters = null, oData = { some: "data" }, fnEventSpy = this.spy(function (oEvent) {
        oParameters = oEvent.getParameters();
        assert.strictEqual(oParameters.name, "myChild", "name from nearest parent target is taken");
        assert.strictEqual(oParameters.title, "myChildTarget", "title from nearest parent target is taken");
    });
    this.stub(this.oViews, "_getView").callsFake(function () {
        return that.oView;
    });
    this.oTargets.attachTitleChanged(fnEventSpy);
    this.oTargets.display(["myNoTitleGrandChild"], oData);
    this.clock.tick(0);
    assert.strictEqual(fnEventSpy.callCount, 1, "the event got fired");
});
QUnit.test("multiple targets with children", function (assert) {
    var aTargetNames = [], that = this, oParameters = null, oData = { some: "data" }, fnEventSpy = this.spy(function (oEvent) {
        oParameters = oEvent.getParameters();
        aTargetNames.push(oParameters.name);
        allPropertiesStrictEqual(oParameters.config, jQuery.extend(true, {}, that.oTargets.getTarget(oParameters.name)._oOptions, that.oDefaultConfig), assert);
        assert.strictEqual(oParameters.view, that.oView, "view got passed to the event");
        assert.strictEqual(oParameters.control, that.oApp, "control got passed to the event");
        assert.strictEqual(oParameters.data, oData, "data was passed");
    });
    this.stub(this.oViews, "_getView").callsFake(function () {
        return that.oView;
    });
    this.oTargets.attachDisplay(fnEventSpy);
    this.oTargets.display(["myChild", "mySecondTarget"], oData);
    this.clock.tick(0);
    assert.strictEqual(fnEventSpy.callCount, 3, "the event got fired");
    assert.strictEqual(aTargetNames.shift(), "myTarget", "the parent got fired first");
    assert.strictEqual(aTargetNames.shift(), "myChild", "the child got fired after the parent");
    assert.strictEqual(aTargetNames.shift(), "mySecondTarget", "the second target got fired last");
});
QUnit.module("titleChanged with binding and context change", {
    beforeEach: function () {
        this.oApp = new App();
        this.oView = createView(["<View xmlns=\"sap.ui.core.mvc\">", "</View>"]);
        this.oDefaultConfig = {
            viewPath: "bar",
            viewName: "foo",
            controlAggregation: "pages",
            viewType: "XML",
            controlId: this.oApp.getId(),
            async: false
        };
        this.oTargetsConfig = {
            target1: {
                title: "{name}"
            }
        };
        this.oViews = new Views({ async: false });
        this.stub(this.oViews, "_getView").callsFake(function () {
            return this.oView;
        }.bind(this));
        this.oTargets = new Targets({
            targets: this.oTargetsConfig,
            views: this.oViews,
            config: this.oDefaultConfig
        });
        this.oModel = new JSONModel({
            cheese: {
                name: "cheese"
            },
            joghurt: {
                name: "joghurt"
            }
        });
        this.oApp.setModel(this.oModel);
    },
    afterEach: function () {
        this.oApp.destroy();
        this.oTargets.destroy();
        this.oViews.destroy();
        this.oView.destroy();
        this.oModel.destroy();
    }
});
QUnit.test("titleChanged event should be fired once the binding context is available", function (assert) {
    var aEventParams = [];
    var fnEventSpy = this.spy(function (oEvent) {
        aEventParams.push(oEvent.getParameters());
    });
    this.oTargets.attachTitleChanged(fnEventSpy);
    this.oTargets.display("target1");
    assert.equal(fnEventSpy.callCount, 0, "titleChanged event isn't fired yet");
    this.oView.bindObject("/cheese");
    assert.equal(fnEventSpy.callCount, 1, "titleChanged event is fired after binding context is available");
    assert.equal(aEventParams[0].title, "cheese", "title property is correct");
});
QUnit.test("The same titleChanged event shouldn't be fired again when the target is displayed with the same binding context", function (assert) {
    var aEventParams = [];
    var fnEventSpy = this.spy(function (oEvent) {
        aEventParams.push(oEvent.getParameters());
    });
    this.oView.bindObject("/cheese");
    this.oTargets.attachTitleChanged(fnEventSpy);
    this.oTargets.display("target1");
    assert.equal(fnEventSpy.callCount, 1, "titleChanged event is fired after binding context is available");
    assert.equal(aEventParams[0].title, "cheese", "title property is correct");
    this.oTargets.display("target1");
    assert.equal(fnEventSpy.callCount, 1, "titleChanged event isn't fired again because the binding context isn't changed");
});
QUnit.test("titleChanged event is fired again when new binding context is set", function (assert) {
    var aEventParams = [];
    var fnEventSpy = this.spy(function (oEvent) {
        aEventParams.push(oEvent.getParameters());
    });
    this.oView.bindObject("/cheese");
    this.oTargets.attachTitleChanged(fnEventSpy);
    this.oTargets.display("target1");
    assert.equal(fnEventSpy.callCount, 1, "titleChanged event is fired after binding context is available");
    assert.equal(aEventParams[0].title, "cheese", "title property is correct");
    this.oTargets.display("target1");
    assert.equal(fnEventSpy.callCount, 1, "titleChanged event isn't fired again because the binding context isn't changed");
    this.oView.bindObject("/joghurt");
    assert.equal(fnEventSpy.callCount, 2, "titleChanged event is fired again because a new binding context is set");
    assert.equal(aEventParams[1].title, "joghurt", "title property is correct");
});
QUnit.module("destruction");
QUnit.test("Should destroy all dependencies", function (assert) {
    var oViews = new Views(), oFirstTarget, oSecondTarget;
    var oTargets = new Targets({
        targets: {
            foo: {},
            bar: {}
        },
        views: oViews
    });
    oFirstTarget = oTargets.getTarget("foo");
    oSecondTarget = oTargets.getTarget("bar");
    oTargets.destroy();
    assert.ok(oTargets.bIsDestroyed, "Did flag the targets as destroyed");
    assert.ok(oFirstTarget.bIsDestroyed, "Did destroy the first target");
    assert.ok(oSecondTarget.bIsDestroyed, "Did destroy the second target");
    assert.strictEqual(oTargets._oCache, null, "Did free the views reference");
    assert.strictEqual(oTargets._mTargets, null, "Did free the targets map reference");
    assert.strictEqual(oTargets._oConfig, null, "Did free the config reference");
    assert.ok(!oViews.bIsDestroyed, "Did not destroy the views instance");
    oViews.destroy();
});