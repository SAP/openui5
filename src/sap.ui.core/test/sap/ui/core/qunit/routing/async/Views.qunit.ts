import Log from "sap/base/Log";
import UIComponent from "sap/ui/core/UIComponent";
import View from "sap/ui/core/mvc/View";
import Views from "sap/ui/core/routing/Views";
import ModuleHook from "./AsyncViewModuleHook";
function createXmlView() {
    var sXmlViewContent = [
        "<View xmlns=\"sap.ui.core.mvc\">",
        "</View>"
    ].join("");
    var oViewOptions = {
        definition: sXmlViewContent,
        type: "XML"
    };
    return View.create(oViewOptions);
}
QUnit.module("views - creation and caching", {
    beforeEach: function () {
        this.oViews = new Views({ async: true });
        this.oViewOptions = {
            viewName: "virtual.view.Home",
            type: "XML"
        };
        return createXmlView().then(function (oView) {
            this.oView = oView;
            this.fnCreateViewStub = sinon.stub(View, "create").callsFake(function () {
                return Promise.resolve(oView);
            });
            this.fnGenericCreateViewSpy = sinon.stub(View, "_create").callsFake(function () {
                return oView;
            });
        }.bind(this));
    },
    afterEach: function () {
        this.fnCreateViewStub.restore();
        this.fnGenericCreateViewSpy.restore();
        this.oViews.destroy();
    }
});
QUnit.test("Should create a view asynchronously", function (assert) {
    var oReturnValue = this.oViews.getView(this.oViewOptions);
    return oReturnValue.then(function (oView) {
        assert.deepEqual(oView.getContent(), this.oView.getContent(), "the view was created");
        assert.strictEqual(this.fnCreateViewStub.callCount, 1, "The 'View.create' factory is called");
        assert.strictEqual(this.fnGenericCreateViewSpy.callCount, 0, "The 'View._create' factory is not called");
    }.bind(this));
});
QUnit.test("Should create a view synchronously", function (assert) {
    this.oViewOptions.async = false;
    var oReturnValue = this.oViews.getView(this.oViewOptions);
    return oReturnValue.then(function (oView) {
        assert.deepEqual(oView.getContent(), this.oView.getContent(), "the view was created");
        assert.strictEqual(this.fnCreateViewStub.callCount, 0, "The 'View.create' factory is not called");
        assert.strictEqual(this.fnGenericCreateViewSpy.callCount, 1, "The 'View._create' factory is called");
    }.bind(this));
});
QUnit.test("Should set a view to the cache", function (assert) {
    var oReturnValue = this.oViews.setView("virtual.view.Home", this.oView);
    var oRetrievedView = this.oViews.getView(this.oViewOptions);
    return oRetrievedView.then(function (oView) {
        assert.deepEqual(oView.getContent(), this.oView.getContent(), "the view was returned");
        assert.strictEqual(oReturnValue, this.oViews, "able to chain this function");
        assert.strictEqual(this.fnCreateViewStub.callCount, 0, "The 'View.create' factory is not called");
        assert.strictEqual(this.fnGenericCreateViewSpy.callCount, 0, "The 'View._create' factory is not called");
    }.bind(this));
});
QUnit.module("component", {
    beforeEach: function () {
        this.oUIComponent = new UIComponent({});
        this.oViews = new Views({ component: this.oUIComponent, async: true });
        return createXmlView().then(function (oView) {
            this.oView = oView;
            this.fnCreateViewStub = sinon.stub(View, "create").callsFake(function () {
                return Promise.resolve(oView);
            });
        }.bind(this));
    },
    afterEach: function () {
        this.oViews.destroy();
        this.oUIComponent.destroy();
        this.fnCreateViewStub.restore();
    }
});
QUnit.test("Should create a view with an component", function (assert) {
    var fnOwnerSpy = this.spy(this.oUIComponent, "runAsOwner");
    this.oViews.getView({
        type: "XML",
        viewName: "virtual.view.Home"
    });
    assert.strictEqual(fnOwnerSpy.callCount, 1, "Did run with owner");
    assert.ok(fnOwnerSpy.calledBefore(this.fnCreateViewStub), "Did invoke the owner function before creating the view");
});
QUnit.test("Should prefix the id with the components id", function (assert) {
    var sViewId = "ViewId", oOptions = {
        id: sViewId,
        type: "XML",
        viewName: "virtual.view.Home"
    };
    this.oViews.getView(oOptions);
    assert.strictEqual(this.fnCreateViewStub.callCount, 1, "Did create the view");
    assert.strictEqual(this.fnCreateViewStub.firstCall.args[0].id, this.oUIComponent.createId(sViewId), "Did prefix the id");
    assert.strictEqual(oOptions.id, sViewId, "Did not modify the options passed to the function");
});
QUnit.test("Should not prefix the id with the components id if the private getView is invoked (by the router)", function (assert) {
    var sViewId = "ViewId";
    this.oViews._getViewWithGlobalId({
        id: sViewId,
        type: "XML",
        viewName: "virtual.view.Home"
    });
    assert.strictEqual(this.fnCreateViewStub.callCount, 1, "Did create the view");
    assert.strictEqual(this.fnCreateViewStub.firstCall.args[0].id, sViewId, "Did not prefix the id");
});
QUnit.module("destruction");
QUnit.test("Should destroy all views created by the Views object", function (assert) {
    var oViews = new Views({ async: true }), oView1, oView2, pView1 = createXmlView().then(function (oView) {
        oView1 = oView;
    }), pView2 = createXmlView().then(function (oView) {
        oView2 = oView;
    });
    return Promise.all([pView1, pView2]).then(function () {
        oViews.setView("home1", oView1);
        oViews.setView("home2", oView2);
        oViews.setView("home3", null);
        oViews.destroy();
        assert.ok(oView1.bIsDestroyed, "the first view was destroyed");
        assert.ok(oView2.bIsDestroyed, "the second view was destroyed");
    });
});
QUnit.module("error handling", {
    beforeEach: function () {
        this.oViews = new Views({ async: true });
        this.fnView = function () {
            return {
                loaded: function () {
                    return Promise.resolve();
                },
                destroy: function () { }
            };
        };
    },
    afterEach: function () {
        this.oViews.destroy();
    }
});
QUnit.test("Should log an error if the options are missing", function (assert) {
    this.stub(View, "create").callsFake(this.fnView);
    var fnErrorSpy = this.spy(Log, "error");
    return this.oViews.getView().catch(function () {
        assert.strictEqual(fnErrorSpy.callCount, 1, "the error spy was called");
        sinon.assert.calledWith(fnErrorSpy, sinon.match(/oOptions/), sinon.match(this.oViews));
    }.bind(this));
});
QUnit.test("Should log an error if the viewName is missing", function (assert) {
    this.stub(View, "create").callsFake(this.fnView);
    var fnErrorSpy = this.spy(Log, "error");
    return this.oViews.getView({}).catch(function () {
        assert.strictEqual(fnErrorSpy.callCount, 1, "the error spy was called");
        sinon.assert.calledWith(fnErrorSpy, sinon.match(/name for the view has to be defined/), sinon.match(this.oViews));
    }.bind(this));
});
QUnit.module("events", {
    beforeEach: function () {
        this.oViews = new Views({ async: true });
    },
    afterEach: function () {
        this.oViews.destroy();
    }
});
QUnit.test("should be able to fire/attach/detach the created event", function (assert) {
    var oParameters = { foo: "bar" }, oListener = {}, oData = { some: "data" }, fnEventSpy = this.spy(function (oEvent, oActualData) {
        assert.strictEqual(oActualData, oData, "the data is correct");
        assert.strictEqual(oEvent.getParameters(), oParameters, "the parameters are correct");
        assert.strictEqual(this, oListener, "the this pointer is correct");
    }), oFireReturnValue, oDetachReturnValue, oAttachReturnValue = this.oViews.attachCreated(oData, fnEventSpy, oListener);
    oFireReturnValue = this.oViews.fireCreated(oParameters);
    oDetachReturnValue = this.oViews.detachCreated(fnEventSpy, oListener);
    this.oViews.fireCreated();
    assert.strictEqual(fnEventSpy.callCount, 1, "did call the attach spy only once");
    assert.strictEqual(oAttachReturnValue, this.oViews, "did return this for chaining for attach");
    assert.strictEqual(oDetachReturnValue, this.oViews, "did return this for chaining for detach");
    assert.strictEqual(oFireReturnValue, this.oViews, "did return this for chaining for fire");
});
QUnit.test("Should fire the view created event if a view is created", function (assert) {
    var oViewOptions = {
        type: "XML",
        viewName: "virtual.view.Home"
    }, oParameters, fnEventSpy = this.spy(function (oEvent) {
        oParameters = oEvent.getParameters();
    });
    return createXmlView().then(function (oView) {
        var fnCreateViewStub = sinon.stub(View, "create").callsFake(function () {
            return Promise.resolve(oView);
        });
        this.oViews.attachCreated(fnEventSpy);
        var oReturnValue = this.oViews.getView(oViewOptions);
        return oReturnValue.then(function (oView) {
            assert.strictEqual(fnEventSpy.callCount, 1, "The view created event was fired");
            assert.strictEqual(oParameters.view, oView, "Did pass the view to the event parameters");
            assert.strictEqual(oParameters.viewOptions, oViewOptions, "Did pass the name to the event parameters");
            fnCreateViewStub.restore();
        });
    }.bind(this));
});
QUnit.module("Try fake server Async", ModuleHook.create({
    beforeEach: function () {
        this.oViews = new Views({ async: true });
    },
    afterEach: function () {
        this.oViews.destroy();
    }
}));
QUnit.test("Get view async", function (assert) {
    var oViewOption = {
        viewName: "qunit.view.Async1",
        type: "XML"
    }, oParameters, fnEventSpy = this.spy(function (oEvent) {
        oParameters = oEvent.getParameters();
    }), fnCreateViewSpy = this.spy(View, "create"), fnGenericCreateViewSpy = this.spy(View, "_create");
    this.oViews.attachCreated(fnEventSpy);
    var oPromise = this.oViews.getView(oViewOption);
    assert.strictEqual(fnEventSpy.callCount, 0, "The created event isn't fired yet");
    new Promise(function (resolve) {
        resolve();
    }).then(function () {
        assert.strictEqual(fnEventSpy.callCount, 0, "The created event isn't fired yet");
    });
    return oPromise.then(function (oView) {
        assert.strictEqual(fnEventSpy.callCount, 1, "The created event is fired");
        assert.ok(oView, "view should be created");
        assert.ok(oView.getContent().length > 0, "View content is loaded");
        assert.strictEqual(oParameters.view, oView, "Did pass the view to the event parameters");
        assert.strictEqual(oParameters.viewOptions, oViewOption, "Did pass the option to the event parameters");
        assert.strictEqual(fnCreateViewSpy.callCount, 1, "The 'View.create' factory is called");
        assert.strictEqual(fnGenericCreateViewSpy.callCount, 0, "The 'View._create' factory is not called");
    });
});
QUnit.test("Get view sync", function (assert) {
    var oViewOption = {
        viewName: "qunit.view.Async1",
        type: "XML",
        async: false
    }, oParameters, fnEventSpy = this.spy(function (oEvent) {
        oParameters = oEvent.getParameters();
    }), fnCreateViewSpy = this.spy(View, "create"), fnGenericCreateViewSpy = this.spy(View, "_create");
    this.oViews.attachCreated(fnEventSpy);
    var oPromise = this.oViews.getView(oViewOption);
    new Promise(function (resolve) {
        resolve();
    }).then(function () {
        assert.strictEqual(fnEventSpy.callCount, 1, "The created event is fired");
    });
    return oPromise.then(function (oView) {
        assert.ok(oView, "view should be created");
        assert.ok(oView.getContent().length > 0, "View content is loaded");
        assert.strictEqual(oParameters.view, oView, "Did pass the view to the event parameters");
        assert.strictEqual(oParameters.viewOptions, oViewOption, "Did pass the option to the event parameters");
        assert.strictEqual(fnCreateViewSpy.callCount, 0, "The 'View.create' factory is not called");
        assert.strictEqual(fnGenericCreateViewSpy.callCount, 1, "The 'View._create' factory is called");
    });
});
QUnit.module("legacy behavior of set/get", {
    beforeEach: function () {
        this.oViews = new Views({ async: true });
        this.oViewOptions = {
            viewName: "virtual.view.Home",
            type: "XML",
            id: "myview"
        };
        return createXmlView().then(function (oView) {
            this.oView = oView;
            this.fnCreateViewStub = sinon.stub(View, "create").callsFake(function () {
                return Promise.resolve(oView);
            });
        }.bind(this));
    },
    afterEach: function () {
        this.oViews.destroy();
        this.fnCreateViewStub.restore();
    }
});
QUnit.test("Create a view with given id and the view should be returned by calling getView only with viewName", function (assert) {
    var oPromise = this.oViews.getView(this.oViewOptions);
    assert.equal(this.fnCreateViewStub.callCount, 1, "The 'View.create' factory is called");
    return oPromise.then(function (oView) {
        assert.deepEqual(oView.getContent(), this.oView.getContent(), "The correct view is returned");
        var oPromise = this.oViews.getView({
            viewName: "virtual.view.Home"
        });
        assert.equal(this.fnCreateViewStub.callCount, 1, "The 'View.create' factory is not called again");
        return oPromise;
    }.bind(this)).then(function (oFetchedView) {
        assert.deepEqual(oFetchedView.getContent(), this.oView.getContent(), "The correct view is returned from second get call");
    }.bind(this));
});