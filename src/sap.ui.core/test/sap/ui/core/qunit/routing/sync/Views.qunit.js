/*global QUnit, sinon */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/mvc/View",
	"sap/ui/core/routing/Views",
	"sap/ui/core/UIComponent"
], function (Log, View, Views, UIComponent) {
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
			this.oViews = new Views();
			this.oViewOptions = {
				viewName : "foo.bar",
				viewType : "XML"
			};

			this.oView = createXmlView();
		},
		afterEach: function () {
			this.oViews.destroy();
		}
	});

	QUnit.test("Should create a view", function (assert) {
		var fnStub = this.stub(View, "_create").callsFake(function () {
				return this.oView;
			}.bind(this));

		//Act
		var oReturnValue = this.oViews.getView(this.oViewOptions);

		//Assert
		return oReturnValue.then(function (oView) {
			assert.strictEqual(oView, this.oView, "the view was created");
			assert.strictEqual(fnStub.callCount, 1, "the stub was invoked");
		}.bind(this));
	});


	QUnit.test("Should set a view to the cache", function (assert) {
		var oReturnValue,
			fnStub = this.stub(View, "_create").callsFake(function () {
				return this.oView;
			});

		//Act
		oReturnValue = this.oViews.setView("foo.bar", this.oView);
		var oRetrievedView = this.oViews.getView(this.oViewOptions);

		//Assert
		return oRetrievedView.then(function (oView) {
			assert.strictEqual(oView, this.oView, "the view was returned");
			assert.strictEqual(oReturnValue, this.oViews, "able to chain this function");
			assert.strictEqual(fnStub.callCount, 0, "the stub not invoked - view was loaded from the cache");
		}.bind(this));
	});

	QUnit.module("component", {
		beforeEach: function () {
			this.oUIComponent = new UIComponent({});
			// System under test
			this.oViews = new Views({ component: this.oUIComponent });
		},
		afterEach: function () {
			this.oViews.destroy();
			this.oUIComponent.destroy();
		}
	});

	QUnit.test("Should create a view with an component", function (assert) {
		// Arrange
		var fnOwnerSpy = this.spy(this.oUIComponent, "runAsOwner"),
			oView = createXmlView(),
			fnViewStub = this.stub(View, "_create").callsFake(function () {
				return oView;
			});

		// Act
		this.oViews.getView({
			viewType : "XML",
			viewName : "foo"
		});

		// Assert
		assert.strictEqual(fnOwnerSpy.callCount, 1, "Did run with owner");
		assert.ok(fnOwnerSpy.calledBefore(fnViewStub), "Did invoke the owner function before creating the view");
	});


	QUnit.test("Should prefix the id with the components id", function (assert) {
		// Arrange
		var sViewId = "ViewId",
			oView = createXmlView(),
			fnViewStub = this.stub(View, "_create").callsFake(function () {
				return oView;
			}),
			oOptions = {
				id : sViewId,
				viewType : "XML",
				viewName : "foo"
			};

		// Act
		this.oViews.getView(oOptions);

		// Assert
		assert.strictEqual(fnViewStub.callCount, 1, "Did create the view");
		assert.strictEqual(fnViewStub.firstCall.args[0].id, this.oUIComponent.createId(sViewId), "Did prefix the id");
		assert.strictEqual(oOptions.id, sViewId, "Did not modify the options passed to the function");
	});

	QUnit.test("Should not prefix the id with the components id if the private getView is invoked (by the router)", function (assert) {
		// Arrange
		var sViewId = "ViewId",
			oView = createXmlView(),
			fnViewStub = this.stub(View, "_create").callsFake(function () {
				return oView;
			});

		// Act
		this.oViews._getViewWithGlobalId({
			id : sViewId,
			viewType : "XML",
			viewName : "foo"
		});

		// Assert
		assert.strictEqual(fnViewStub.callCount, 1, "Did create the view");
		assert.strictEqual(fnViewStub.firstCall.args[0].id, sViewId, "Did not prefix the id");
	});

	QUnit.module("destruction");

	QUnit.test("Should destroy all views created by the Views object", function (assert) {
		var oViews = new Views(),
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

	QUnit.module("error handling");

	QUnit.test("Should log an error if the options are missing", function (assert) {
		assert.expect(2);
		// Arrange
		var fnErrorSpy = this.spy(Log, "error");

		var oViews = new Views();

		var oViewPromise = oViews.getView();
		return oViewPromise.catch(function() {
			// Assert
			assert.strictEqual(fnErrorSpy.callCount, 1, "the error spy was called");
			sinon.assert.calledWith(fnErrorSpy, sinon.match(/oOptions/), sinon.match(oViews));
		});
	});

	QUnit.test("Should log an error if the viewName is missing", function (assert) {
		assert.expect(2);
		// Arrange
		var fnErrorSpy = this.spy(Log, "error");

		var oViews = new Views();

		// Act
		var oViewPromise = oViews.getView({});
		return oViewPromise.catch(function() {
			// Assert
			assert.strictEqual(fnErrorSpy.callCount, 1, "the error spy was called");
			sinon.assert.calledWith(fnErrorSpy, sinon.match(/name for the view has to be defined/), sinon.match(oViews));
		});
	});

	QUnit.module("events", {
		beforeEach: function () {
			// System under test + Arrange
			this.oViews = new Views();
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
			oViewOptions = {
				viewType: "XML",
				viewName: "foo"
			},
			oParameters,
			fnEventSpy = this.spy(function (oEvent) {
				oParameters = oEvent.getParameters();
			});

		this.stub(View, "_create").callsFake(function () {
			return oView;
		});

		this.oViews.attachCreated(fnEventSpy);

		// Act
		var oReturnValue = this.oViews.getView(oViewOptions);

		// Assert
		return oReturnValue.then(function (oView) {
			assert.strictEqual(fnEventSpy.callCount, 1, "The view created event was fired");
			assert.strictEqual(oParameters.view, oView, "Did pass the view to the event parameters");
			assert.strictEqual(oParameters.viewOptions, oViewOptions, "Did pass the name to the event parameters");
		});
	});

	QUnit.module("legacy behavior of set/get", {
		beforeEach: function () {
			// System under test + Arrange
			this.oViews = new Views({async: false});
			this.oViewOptions = {
				viewName : "foo.bar",
				viewType : "XML",
				// providing an id will let the view saved under both "undefined" and its id
				id: "myview"
			};

			this.oView = createXmlView();

			this.oSapUiViewStub = sinon.stub(View, "_create").callsFake(function () {
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
