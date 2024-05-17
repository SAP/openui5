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
			definition: sXmlViewContent,
			type: "XML"
		};

		return View.create(oViewOptions);
	}

	QUnit.module("views - creation and caching", {
		beforeEach: function () {
			// System under test + Arrange
			this.oViews = new Views({async: true});
			this.oViewOptions = {
				viewName : "virtual.view.Home",
				type : "XML"
			};

			return createXmlView().then(function(oView){
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
		// Act
		var oReturnValue = this.oViews.getView(this.oViewOptions);

		// Assert
		return oReturnValue.then(function (oView) {
			assert.deepEqual(oView.getContent(), this.oView.getContent(), "the view was created");
			assert.strictEqual(this.fnCreateViewStub.callCount, 1, "The 'View.create' factory is called");
			assert.strictEqual(this.fnGenericCreateViewSpy.callCount, 0, "The 'View._create' factory is not called");
		}.bind(this));
	});

	/**
	 * @deprecated because it tests the legacy API
	 */
	QUnit.test("Should create a view synchronously", function (assert) {
		// Configure view as synchronous
		this.oViewOptions.async = false;

		// Act
		var oReturnValue = this.oViews.getView(this.oViewOptions);

		// Assert
		return oReturnValue.then(function (oView) {
			assert.deepEqual(oView.getContent(), this.oView.getContent(), "the view was created");
			assert.strictEqual(this.fnCreateViewStub.callCount, 0, "The 'View.create' factory is not called");
			assert.strictEqual(this.fnGenericCreateViewSpy.callCount, 1, "The 'View._create' factory is called");
		}.bind(this));
	});

	QUnit.test("Should set a view to the cache", function (assert) {
		// Act
		var oReturnValue = this.oViews.setView("virtual.view.Home", this.oView);
		var oRetrievedView = this.oViews.getView(this.oViewOptions);

		// Assert
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
			// System under test
			this.oViews = new Views({ component: this.oUIComponent, async: true });

			return createXmlView().then(function(oView){
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
		// Arrange
		var fnOwnerSpy = this.spy(this.oUIComponent, "runAsOwner");

		// Act
		this.oViews.getView({
			type : "XML",
			viewName : "virtual.view.Home"
		});

		// Assert
		assert.strictEqual(fnOwnerSpy.callCount, 1, "Did run with owner");
		assert.ok(fnOwnerSpy.calledBefore(this.fnCreateViewStub), "Did invoke the owner function before creating the view");
	});


	QUnit.test("Should prefix the id with the components id", function (assert) {
		// Arrange
		var sViewId = "ViewId",
			oOptions = {
				id : sViewId,
				type : "XML",
				viewName : "virtual.view.Home"
			};

		// Act
		this.oViews.getView(oOptions);

		// Assert
		assert.strictEqual(this.fnCreateViewStub.callCount, 1, "Did create the view");
		assert.strictEqual(this.fnCreateViewStub.firstCall.args[0].id, this.oUIComponent.createId(sViewId), "Did prefix the id");
		assert.strictEqual(oOptions.id, sViewId, "Did not modify the options passed to the function");
	});

	QUnit.test("Should not prefix the id with the components id if the private getView is invoked (by the router)", function (assert) {
		// Arrange
		var sViewId = "ViewId";

		// Act
		this.oViews._getViewWithGlobalId({
			id : sViewId,
			type : "XML",
			viewName : "virtual.view.Home"
		});

		// Assert
		assert.strictEqual(this.fnCreateViewStub.callCount, 1, "Did create the view");
		assert.strictEqual(this.fnCreateViewStub.firstCall.args[0].id, sViewId, "Did not prefix the id");
	});

	QUnit.module("destruction");

	QUnit.test("Should destroy all views created by the Views object", function (assert) {
		var oViews = new Views({async: true}),
			oView1,
			oView2,
			pView1 = createXmlView().then(function(oView){
				oView1 = oView;
			}),
			pView2 = createXmlView().then(function(oView){
				oView2 = oView;
			});

		return Promise.all([pView1, pView2]).then(function(){
			oViews.setView("home1", oView1);
			oViews.setView("home2", oView2);
			// test whether destroy checks the null case of the view cache
			oViews.setView("home3", null);

			//Act
			oViews.destroy();

			//Assert
			assert.ok(oView1.bIsDestroyed, "the first view was destroyed");
			assert.ok(oView2.bIsDestroyed, "the second view was destroyed");
		});

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
		this.stub(View, "create").callsFake(this.fnView);
		var fnErrorSpy = this.spy(Log, "error");

		// Act
		// the getView() returns a rejected promise if no oOptions parameter is provided
		return this.oViews.getView().catch(function() {
			// Assert
			assert.strictEqual(fnErrorSpy.callCount, 1, "the error spy was called");
			sinon.assert.calledWith(fnErrorSpy, sinon.match(/oOptions/), sinon.match(this.oViews));
		}.bind(this));
	});

	QUnit.test("Should log an error if the viewName is missing", function (assert) {
		// Arrange
		this.stub(View, "create").callsFake(this.fnView);
		var fnErrorSpy = this.spy(Log, "error");

		// Act
		return this.oViews.getView({}).catch(function() {
			// Assert
			assert.strictEqual(fnErrorSpy.callCount, 1, "the error spy was called");
			sinon.assert.calledWith(fnErrorSpy, sinon.match(/name for the view has to be defined/), sinon.match(this.oViews));
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
		var oViewOptions = {
			type: "XML",
			viewName: "virtual.view.Home"
		},
			oParameters,
			fnEventSpy = this.spy(function (oEvent) {
				oParameters = oEvent.getParameters();
			});

		return createXmlView().then(function (oView){
			var fnCreateViewStub = sinon.stub(View, "create").callsFake(function () {
				return Promise.resolve(oView);
			});

			this.oViews.attachCreated(fnEventSpy);

			// Act
			var oReturnValue = this.oViews.getView(oViewOptions);

			// Assert
			return oReturnValue.then(function (oView) {
				assert.strictEqual(fnEventSpy.callCount, 1, "The view created event was fired");
				assert.strictEqual(oParameters.view, oView, "Did pass the view to the event parameters");
				assert.strictEqual(oParameters.viewOptions, oViewOptions, "Did pass the name to the event parameters");
				fnCreateViewStub.restore();
			});
		}.bind(this));
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
			}),
			fnCreateViewSpy = this.spy(View, "create"),
			fnGenericCreateViewSpy = this.spy(View, "_create");

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
			assert.strictEqual(fnCreateViewSpy.callCount, 1, "The 'View.create' factory is called");
			assert.strictEqual(fnGenericCreateViewSpy.callCount, 0, "The 'View._create' factory is not called");
		});
	});

	/**
	 * @deprecated
	 */
	QUnit.test("Get view sync", function(assert) {
		var oViewOption = {
				viewName: "qunit.view.Async1",
				type: "XML",
				async: false
			},
			oParameters,
			fnEventSpy = this.spy(function (oEvent) {
				oParameters = oEvent.getParameters();
			}),
			fnCreateViewSpy = this.spy(View, "create"),
			fnGenericCreateViewSpy = this.spy(View, "_create");

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
			assert.strictEqual(fnCreateViewSpy.callCount, 0, "The 'View.create' factory is not called");
			assert.strictEqual(fnGenericCreateViewSpy.callCount, 1, "The 'View._create' factory is called");
		});
	});

	QUnit.module("legacy behavior of set/get", {
		beforeEach: function () {
			// System under test + Arrange
			this.oViews = new Views({async: true});
			this.oViewOptions = {
				viewName : "virtual.view.Home",
				type : "XML",
				// providing an id will let the view saved under both "undefined" and its id
				id: "myview"
			};

			return createXmlView().then(function(oView){
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

	QUnit.test("Create a view with given id and the view should be returned by calling getView only with viewName", function(assert) {
		// The oViews cache is empty, calling get the first time creates an instance and saves it in the cache
		var oPromise = this.oViews.getView(this.oViewOptions);

		assert.equal(this.fnCreateViewStub.callCount, 1, "The 'View.create' factory is called");

		return oPromise.then(function(oView) {
			assert.deepEqual(oView.getContent(), this.oView.getContent(), "The correct view is returned");
			// The view is saved in the cache and should be returned directly
			var oPromise = this.oViews.getView({
				viewName: "virtual.view.Home"
			});

			assert.equal(this.fnCreateViewStub.callCount, 1, "The 'View.create' factory is not called again");

			return oPromise;
		}.bind(this)).then(function(oFetchedView) {
			assert.deepEqual(oFetchedView.getContent(), this.oView.getContent(), "The correct view is returned from second get call");
		}.bind(this));
	});

});
