/*global QUnit, sinon */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/UIComponent",
	"sap/ui/core/mvc/View",
	"sap/ui/core/routing/Views",
	"./AsyncViewModuleHook"
], function (Log, UIComponent, View, Views, ModuleHook) {
	"use strict";

	function createXmlView () {
		var sXmlViewContent = [
			'<View xmlns="sap.ui.core.mvc">',
			'</View>'
		].join('');

		var oViewOptions = {
			viewContent: sXmlViewContent,
			type: "XML"
		};

		return sap.ui.view(oViewOptions);
	}

	QUnit.module("views - creation and caching", {
		beforeEach: function () {
			// System under test + Arrange
			this.oViews = new Views({async: true});
			this.oViewOptions = {
				viewName : "foo.bar",
				type : "XML"
			};

			this.oView = createXmlView();
		},
		afterEach: function () {
			this.oViews.destroy();
		}
	});

	QUnit.test("Should create a view", function (assert) {
		var done = assert.async();
		var fnStub = this.stub(View, "_legacyCreate").callsFake(function () {
				return this.oView;
			}.bind(this));

		//Act
		var oReturnValue = this.oViews.getView(this.oViewOptions);

		//Assert
		oReturnValue.then(function (oView) {
			assert.strictEqual(oView, this.oView, "the view was created");
			assert.strictEqual(fnStub.callCount, 1, "the stub was invoked");

			var oCall = fnStub.getCall(0);
			assert.equal(oCall.args[0].processingMode, "sequential", "The default processing mode is set to sequential");

			fnStub.restore();
			done();
		}.bind(this));
	});

	QUnit.test("Should not change the processingMode if it's set", function (assert) {
		var done = assert.async();
		var fnStub = this.stub(View, "_legacyCreate").callsFake(function () {
				return this.oView;
			}.bind(this));

		this.oViewOptions.processingMode = "async";

		//Act
		var oReturnValue = this.oViews.getView(this.oViewOptions);

		//Assert
		oReturnValue.then(function (oView) {
			assert.strictEqual(oView, this.oView, "the view was created");
			assert.strictEqual(fnStub.callCount, 1, "the stub was invoked");

			var oCall = fnStub.getCall(0);
			assert.equal(oCall.args[0].processingMode, "async", "The provided processing mode isn't modified");

			fnStub.restore();
			done();
		}.bind(this));
	});

	QUnit.test("Should set a view to the cache", function (assert) {
		var done = assert.async();
		var oReturnValue,
			fnStub = this.stub(View, "_legacyCreate").callsFake(function () {
				return this.oView;
			}.bind(this));

		//Act
		oReturnValue = this.oViews.setView("foo.bar", this.oView);
		var oRetrievedView = this.oViews.getView(this.oViewOptions);

		//Assert
		oRetrievedView.then(function (oView) {
			assert.strictEqual(oView, this.oView, "the view was returned");
			assert.strictEqual(oReturnValue, this.oViews, "able to chain this function");
			assert.strictEqual(fnStub.callCount, 0, "the stub not invoked - view was loaded from the cache");
			fnStub.restore();
			done();
		}.bind(this));
	});

	QUnit.module("component", {
		beforeEach: function () {
			this.oUIComponent = new UIComponent({});
			// System under test
			this.oViews = new Views({ component: this.oUIComponent, async: true });
			this.oView = createXmlView();
		},
		afterEach: function () {
			this.oViews.destroy();
			this.oUIComponent.destroy();
		}
	});

	QUnit.test("Should create a view with an component", function (assert) {
		// Arrange
		var fnOwnerSpy = this.spy(this.oUIComponent, "runAsOwner"),
			fnViewStub = this.stub(View, "_legacyCreate").callsFake(function () {
				return this.oView;
			}.bind(this));

		// Act
		this.oViews.getView({
			type : "XML",
			viewName : "foo"
		});

		// Assert
		assert.strictEqual(fnOwnerSpy.callCount, 1, "Did run with owner");
		assert.ok(fnOwnerSpy.calledBefore(fnViewStub), "Did invoke the owner function before creating the view");

		fnViewStub.restore();
	});


	QUnit.test("Should prefix the id with the components id", function (assert) {
		// Arrange
		var sViewId = "ViewId",
			fnViewStub = this.stub(View, "_legacyCreate").callsFake(function () {
				return this.oView;
			}.bind(this)),
			oOptions = {
				id : sViewId,
				type : "XML",
				viewName : "foo"
			};

		// Act
		this.oViews.getView(oOptions);

		// Assert
		assert.strictEqual(fnViewStub.callCount, 1, "Did create the view");
		assert.strictEqual(fnViewStub.firstCall.args[0].id, this.oUIComponent.createId(sViewId), "Did prefix the id");
		assert.strictEqual(oOptions.id, sViewId, "Did not modify the options passed to the function");

		fnViewStub.restore();
	});

	QUnit.test("Should not prefix the id with the components id if the private getView is invoked (by the router)", function (assert) {
		// Arrange
		var sViewId = "ViewId",
			fnViewStub = this.stub(View, "_legacyCreate").callsFake(function () {
				return this.oView;
			}.bind(this));

		// Act
		this.oViews._getViewWithGlobalId({
			id : sViewId,
			type : "XML",
			viewName : "foo"
		});

		// Assert
		assert.strictEqual(fnViewStub.callCount, 1, "Did create the view");
		assert.strictEqual(fnViewStub.firstCall.args[0].id, sViewId, "Did not prefix the id");

		fnViewStub.restore();
	});

	QUnit.module("destruction");

	QUnit.test("Should destroy all views created by the Views object", function (assert) {
		var oViews = new Views({async: true}),
			oView1 = createXmlView(),
			oView2 = createXmlView();

		oViews.setView("foo", oView1);
		oViews.setView("bar", oView2);
		// test whether destroy checks the null case of the view cache
		oViews.setView("foo1", null);

		//Act
		oViews.destroy();

		//Assert
		assert.ok(oView1.bIsDestroyed, "the first view was destroyed");
		assert.ok(oView2.bIsDestroyed, "the second view was destroyed");
	});

	QUnit.module("error handling", {
		beforeEach: function () {
			this.oViews = new Views({async: true});
			this.fnView = function() {
				return {
					loaded : function() {
						return Promise.resolve();
					},
					destroy : function() {}
				};
			};
		},
		afterEach: function () {
			this.oViews.destroy();
		}
	});

	QUnit.test("Should log an error if the options are missing", function (assert) {
		// Arrange
		var fnStub = this.stub(View, "_legacyCreate").callsFake(this.fnView);
		var fnErrorSpy = this.spy(Log, "error");

		// Act
		// the getView() returns a rejected promise if no oOptions parameter is provided
		return this.oViews.getView().catch(function() {
			// Assert
			assert.strictEqual(fnErrorSpy.callCount, 1, "the error spy was called");
			sinon.assert.calledWith(fnErrorSpy, sinon.match(/oOptions/), sinon.match(this.oViews));
			fnErrorSpy.restore();
			fnStub.restore();
		}.bind(this));
	});

	QUnit.test("Should log an error if the viewName is missing", function (assert) {
		// Arrange
		var fnStub = this.stub(View, "_legacyCreate").callsFake(this.fnView);
		var fnErrorSpy = this.spy(Log, "error");

		// Act
		return this.oViews.getView({}).catch(function() {
			// Assert
			assert.strictEqual(fnErrorSpy.callCount, 1, "the error spy was called");
			sinon.assert.calledWith(fnErrorSpy, sinon.match(/name for the view has to be defined/), sinon.match(this.oViews));
			fnErrorSpy.restore();
			fnStub.restore();
		}.bind(this));
	});

	QUnit.module("events", {
		beforeEach: function () {
			// System under test + Arrange
			this.oViews = new Views({async: true});
		},
		afterEach: function () {
			this.oViews.destroy();
		}
	});

	QUnit.test("should be able to fire/attach/detach the created event", function(assert) {
		// Arrange
		var oParameters = { foo : "bar" },
			oListener = {},
			oData = { some : "data" },
			fnEventSpy = this.spy(function(oEvent, oActualData) {
				assert.strictEqual(oActualData, oData, "the data is correct");
				assert.strictEqual(oEvent.getParameters(), oParameters, "the parameters are correct");
				assert.strictEqual(this, oListener, "the this pointer is correct");
			}),
			oFireReturnValue,
			oDetachReturnValue,
			oAttachReturnValue = this.oViews.attachCreated(oData, fnEventSpy, oListener);

		// Act
		oFireReturnValue = this.oViews.fireCreated(oParameters);
		oDetachReturnValue = this.oViews.detachCreated(fnEventSpy, oListener);
		this.oViews.fireCreated();

		// Assert
		assert.strictEqual(fnEventSpy.callCount, 1, "did call the attach spy only once");
		assert.strictEqual(oAttachReturnValue, this.oViews, "did return this for chaining for attach");
		assert.strictEqual(oDetachReturnValue, this.oViews, "did return this for chaining for detach");
		assert.strictEqual(oFireReturnValue, this.oViews, "did return this for chaining for fire");
	});

	QUnit.test("Should fire the view created event if a view is created", function (assert) {
		// Arrange
		var oView = createXmlView(),
			fnStub = this.stub(View, "_legacyCreate").callsFake(function () {
				return oView;
			}),
			oViewOptions = {
				type: "XML",
				viewName: "foo"
			},
			oParameters,
			fnEventSpy = this.spy(function (oEvent) {
				oParameters = oEvent.getParameters();
			});

		this.oViews.attachCreated(fnEventSpy);

		// Act
		var oReturnValue = this.oViews.getView(oViewOptions);

		// Assert
		return oReturnValue.then(function (oView) {
			assert.strictEqual(fnEventSpy.callCount, 1, "The view created event was fired");
			assert.strictEqual(oParameters.view, oView, "Did pass the view to the event parameters");
			assert.strictEqual(oParameters.viewOptions, oViewOptions, "Did pass the name to the event parameters");

			fnStub.restore();
		});
	});

	QUnit.module("Try fake server Async", ModuleHook.create({
		beforeEach: function() {
			this.oViews = new Views({async: true});
		},
		afterEach: function() {
			this.oViews.destroy();
		}
	}));

	QUnit.test("Get view async", function(assert) {
		var oViewOption = {
				viewName: "qunit.view.Async1",
				type: "XML"
			},
			oParameters,
			fnEventSpy = this.spy(function (oEvent) {
				oParameters = oEvent.getParameters();
			});

		this.oViews.attachCreated(fnEventSpy);

		var oPromise = this.oViews.getView(oViewOption);

		assert.strictEqual(fnEventSpy.callCount, 0, "The created event isn't fired yet");
		new Promise(function(resolve){
			resolve();
		}).then(function() {
			assert.strictEqual(fnEventSpy.callCount, 0, "The created event isn't fired yet");
		});

		return oPromise.then(function(oView) {
			assert.strictEqual(fnEventSpy.callCount, 1, "The created event is fired");
			assert.ok(oView, "view should be created");
			assert.ok(oView.getContent().length > 0, "View content is loaded");
			assert.strictEqual(oParameters.view, oView, "Did pass the view to the event parameters");
			assert.strictEqual(oParameters.viewOptions, oViewOption, "Did pass the option to the event parameters");
		});
	});

	QUnit.test("Get view sync", function(assert) {
		var oViewOption = {
				viewName: "qunit.view.Async1",
				type: "XML",
				async: false
			},
			oParameters,
			fnEventSpy = this.spy(function (oEvent) {
				oParameters = oEvent.getParameters();
			});

		this.oViews.attachCreated(fnEventSpy);

		var oPromise = this.oViews.getView(oViewOption);

		new Promise(function(resolve) {
			resolve();
		}).then(function() {
			assert.strictEqual(fnEventSpy.callCount, 1, "The created event is fired");
		});

		return oPromise.then(function(oView) {
			assert.ok(oView, "view should be created");
			assert.ok(oView.getContent().length > 0, "View content is loaded");
			assert.strictEqual(oParameters.view, oView, "Did pass the view to the event parameters");
			assert.strictEqual(oParameters.viewOptions, oViewOption, "Did pass the option to the event parameters");
		});
	});

	QUnit.module("legacy behavior of set/get", {
		beforeEach: function () {
			// System under test + Arrange
			this.oViews = new Views({async: true});
			this.oViewOptions = {
				viewName : "foo.bar",
				viewType : "XML",
				// providing an id will let the view saved under both "undefined" and its id
				id: "myview"
			};

			this.oView = createXmlView();

			this.oSapUiViewStub = sinon.stub(View, "_legacyCreate").callsFake(function () {
				return this.oView;
			}.bind(this));
		},
		afterEach: function () {
			this.oViews.destroy();
			this.oSapUiViewStub.restore();
		}
	});

	QUnit.test("Create a view with given id and the view should be returned by calling getView only with viewName", function(assert) {
		// The oViews cache is empty, calling get the first time creates an instance and saves it in the cache
		var oPromise = this.oViews.getView(this.oViewOptions);

		assert.equal(this.oSapUiViewStub.callCount, 1, "The sap.ui.view factory is called");

		return oPromise.then(function(oView) {
			assert.strictEqual(oView, this.oView, "The correct view is returned");
			// The view is saved in the cache and should be returned directly
			var oPromise = this.oViews.getView({
				viewName: "foo.bar"
			});

			assert.equal(this.oSapUiViewStub.callCount, 1, "The sap.ui.view factory isn't called again");

			return oPromise;
		}.bind(this)).then(function(oFetchedView) {
			assert.strictEqual(oFetchedView, this.oView, "The correct view is returned from second get call");
		}.bind(this));
	});

});
