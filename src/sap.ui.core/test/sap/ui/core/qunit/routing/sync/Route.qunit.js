/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/core/mvc/JSView",
	"sap/ui/core/routing/Route",
	"sap/ui/core/routing/Views",
	"sap/ui/core/routing/Targets",
	"sap/m/Panel"
], function (UIComponent, JSView, Route, Views, Targets, Panel) {
	"use strict";

	function addClock() {
		if ( this.clock == null && this._oSandbox ) {
			this.clock = this._oSandbox.useFakeTimers();
		}
	}

	var oRouterStub = {
		fireRouteMatched : function () {},
		fireRoutePatternMatched : function () {},
		fireBeforeRouteMatched : function() {},
		_isAsync: function() {
			return false;
		}
	};

	QUnit.module("Basics", {
		beforeEach: addClock
	});

	QUnit.test("Should fired beforeMatched before matched", function(assert) {
		var oRoute = new Route(oRouterStub, { name : "testRoute" });
		var fnMatchedSpy = this.spy(),
			fnBeforeMatchedSpy = this.spy(function() {
				assert.notOk(fnMatchedSpy.called, "the matched event shouldn't be fired yet");
			});

		oRoute.attachBeforeMatched(fnBeforeMatchedSpy);
		oRoute.attachMatched(fnMatchedSpy);

		// Act
		oRoute._routeMatched({});

		// Assert
		assert.strictEqual(fnBeforeMatchedSpy.callCount, 1, "did fire the beforeMatched event");
		assert.strictEqual(fnMatchedSpy.callCount, 1, "did fire the matched event");

		// Cleanup
		oRoute.destroy();
	});

	QUnit.test("Should not call pattern matched only matched", function (assert) {
		// Arrange
		var oRoute = new Route(oRouterStub, { name : "testRoute" }),
				fnMatchedSpy = this.spy(),
				fnPatternMatchedSpy = this.spy();

		oRoute.attachMatched(fnMatchedSpy);
		oRoute.attachPatternMatched(fnPatternMatchedSpy);

		// Act
		oRoute._routeMatched({});
		this.clock.tick(0);

		// Assert
		assert.strictEqual(fnMatchedSpy.callCount, 1, "did call the attachMatched spy");
		assert.strictEqual(fnPatternMatchedSpy.callCount, 0, "did not call the attachPatternMatched spy");

		// Cleanup
		oRoute.destroy();
	});

	QUnit.test("Should save the current route as last matched route in the router after _routeMatched is called", function(assert) {
		var oRoute = new Route(oRouterStub, { name : "testRoute" });
		oRoute._routeMatched({});
		assert.strictEqual(oRouterStub._oMatchedRoute, oRoute, "The matched route is saved as last matched route in the router");
	});

	QUnit.test("Should fire a switched event", function(assert) {
		var fnSwitchedSpy = this.spy();
		var oRoute = new Route(oRouterStub, { name : "testRoute" });

		oRoute.attachEvent("switched", fnSwitchedSpy);
		oRoute._routeSwitched();

		assert.equal(fnSwitchedSpy.callCount, 1, "The switched event handler is called");
	});

	QUnit.module("Events", {
		beforeEach: function() {
			addClock.apply(this);
			var oViews = new Views();
			this.oPanel = new Panel();
			this.oRouterStub = {
				fireRouteMatched : function () {},
				fireRoutePatternMatched : function () {},
				fireBeforeRouteMatched : function () {},
				_oTargets: new Targets({
					targets: {
						async1: {
							// key: "async1",
							viewName: "qunit.view.Async1",
							controlAggregation: "content",
							controlId: this.oPanel.getId(),
							viewType: "XML"
						},
						async2: {
							// key: "async2",
							viewName: "qunit.view.Async2",
							controlAggregation: "content",
							controlId: this.oPanel.getId(),
							viewType: "XML"
						},
						async3: {
							// key: "async3",
							viewName: "qunit.view.Async3",
							controlAggregation: "content",
							controlId: this.oPanel.getId(),
							viewType: "XML"
						}
					},
					views: oViews
				}),
				_oViews: oViews,
				_isAsync: function() {
					return false;
				}
			};

			this.oRoute = new Route(this.oRouterStub, {
				name: "testRoute",
				target: [
					"async1", "async2", "async3"
				]
			});
		},
		afterEach: function() {
			this.oRoute.destroy();
		}
	});

	function fnRouteEventsTestCase (sTestName, sEventName) {
		QUnit.test(sTestName, function(assert) {
			// Arrange
			var sName = "testRoute",
				oListener = {},
				oData = {some: "data"},
				fnEventSpy = this.spy(function(oEvent, oActualData) {
					assert.strictEqual(oActualData, oData, "the data is correct");
					assert.strictEqual(oEvent.getParameters().name, sName, "the name is correct");
					assert.strictEqual(this, oListener, "the this pointer is correct");

					if (sEventName === "Matched" || sEventName === "PatternMatched") {
						assert.ok(oEvent.getParameter("view").isA("sap.ui.core.mvc.View"), "view parameter is set");
						assert.ok(oEvent.getParameter("targetControl").isA("sap.ui.core.Control"), "targetControl parameter is set");

						assert.ok(Array.isArray(oEvent.getParameter("views")), "views parameter is set");
						oEvent.getParameter("views").forEach(function(oView) {
							assert.ok(oView.isA("sap.ui.core.mvc.View"), "Each element is a view instance");
						});

						assert.ok(Array.isArray(oEvent.getParameter("targetControls")), "targetControls parameter is set");
						oEvent.getParameter("targetControls").forEach(function(oControl) {
							assert.ok(oControl.isA("sap.ui.core.Control"), "Each element is a control instance");
						});
					}
				}),
				oAttachReturnValue = this.oRoute["attach" + sEventName](oData, fnEventSpy, oListener);

			// Act
			this.oRoute._routeMatched({},
					true);
			this.clock.tick(0);

			// Assert
			assert.strictEqual(fnEventSpy.callCount, 1, "did call the attach spy for the event " + sEventName);
			assert.strictEqual(oAttachReturnValue, this.oRoute, "did return this for chaining for the event " + sEventName);
		});
	}

	fnRouteEventsTestCase("Should attach to the beforeMatched event", "BeforeMatched");
	fnRouteEventsTestCase("Should attach to the matched event", "Matched");
	fnRouteEventsTestCase("Should attach to the patternMatched event", "PatternMatched");

	function fnDetachRouteEventTestCase(sTestName, sEventName) {
		QUnit.test(sTestName, function(assert) {
			// Arrange
			var fnEventSpy = this.spy(),
				oListener = {};

			this.oRoute["attach" + sEventName](fnEventSpy, oListener);
			this.oRoute["attach" + sEventName](fnEventSpy);

			// Act
			var oDetachedReturnValue = this.oRoute["detach" + sEventName](fnEventSpy, oListener);
			this.oRoute["detach" + sEventName](fnEventSpy);

			// FireEvent to make sure no spy is called
			this.oRoute._routeMatched(
					{},
					true);

			// Assert
			assert.strictEqual(fnEventSpy.callCount, 0, "did not call the spy since it was detached");
			assert.strictEqual(oDetachedReturnValue, this.oRoute, "did return this for chaining");
		});
	}

	fnDetachRouteEventTestCase("Should detach the beforeMatched event", "BeforeMatched");
	fnDetachRouteEventTestCase("Should detach the matched event", "Matched");
	fnDetachRouteEventTestCase("Should detach the patternMatched event", "PatternMatched");


	QUnit.module("nested routes",{
		beforeEach: function() {
			var that = this;
			this.oSpy = sinon.spy(function(sRoute) {
				return {
					matched: {
						add: function() {}
					},
					switched: {
						add: function() {}
					}
				};
			});
			this.oRouterStub = {
				_oRouter: {
					addRoute: this.oSpy
				},
				_isAsync: function() {
					return false;
				},
				getRoute: function() {
					return that.oParentRoute;
				}
			};

			this.oParentRoute = new Route(this.oRouterStub, {
				name: "parentRoute",
				pattern: "parent"
			});

			this.oChildRoute = new Route(this.oRouterStub, {
				name: "childRoute",
				pattern: "child",
				parent: ":parentRoute"
			});

			var ParentComponent,
				ChildComponent;

			ParentComponent = UIComponent.extend("parent.component", {
				metadata : {
					routing:  {
						routes: [
							{
								pattern: "category/{id}",
								name: "category"
							}
						]
					}
				},
				createContent: function() {
					that.oChildComponent = new ChildComponent("child");
					return sap.ui.jsview("view", {
						content: that.oChildComponent
					});
				}
			});

			ChildComponent = UIComponent.extend("child.component", {
				metadata : {
					routing:  {
						routes: [
							{
								pattern: "product/{id}",
								name: "product",
								parent: "parent.component:category"
							}
						]
					}
				}
			});

			this.oGetParentRouteSpy = sinon.spy(Route.prototype, "_getParentRoute");

			this.oParentComponent = new ParentComponent("parent");

		},
		afterEach: function() {
			this.oGetParentRouteSpy.restore();
			this.oParentRoute.destroy();
			this.oChildRoute.destroy();
			this.oParentComponent.destroy();
			this.oChildComponent.destroy();
		}
	});

	QUnit.test("Route with prefixed pattern is added to router", function(assert) {
		assert.strictEqual(this.oSpy.callCount, 2, "Two patterns are added to the router");
		assert.strictEqual(this.oSpy.args[0][0], "parent", "Pattern of parent route is added to router");
		assert.strictEqual(this.oSpy.args[1][0], "parent/child", "Pattern of child route is prefixed with the parent route and added to router");
	});

	QUnit.test("Route with prefixed pattern matches for nested components", function(assert) {
		var oParentRouter = this.oParentComponent.getRouter();
		assert.strictEqual(this.oGetParentRouteSpy.callCount, 1, "getParentRoute is called once on the child route");
		assert.strictEqual(this.oGetParentRouteSpy.args[0][0], "parent.component:category", "parameter is correctly given");
		assert.strictEqual(this.oGetParentRouteSpy.returnValues[0], oParentRouter.getRoute("category"), "The parent route instance is fetched from the component");
	});

	QUnit.module("_alignTargetsConfig", {
		beforeEach: function() {
			this.oRoute = new Route({
				_isAsync: function() {
					return false;
				}
			}, {
				name: "testRoute"
			});
		},
		afterEach: function() {
			this.oRoute.destroy();
		}
	});

	QUnit.test("Get target config with string", function(assert) {
		var aConfig = this.oRoute._alignTargetsConfig("target1");

		assert.ok(Array.isArray(aConfig), "The return value is an array");
		assert.deepEqual(aConfig, [{name: "target1"}], "Correct config is returned");
	});

	QUnit.test("Get targets config with array of strings", function(assert) {
		var aConfig = this.oRoute._alignTargetsConfig(["target1", "target2", "target3"]);

		assert.ok(Array.isArray(aConfig), "The return value is an array");
		assert.deepEqual(aConfig, [{name: "target1"}, {name: "target2"}, {name: "target3"}], "Correct config is returned");
	});

	QUnit.test("Get target config with object", function(assert) {
		var aConfig = this.oRoute._alignTargetsConfig({name: "target1"});

		assert.ok(Array.isArray(aConfig), "The return value is an array");
		assert.deepEqual(aConfig, [{name: "target1"}], "Correct config is returned");
	});

	QUnit.test("Get targets config with array of objects", function(assert) {
		var aConfig = this.oRoute._alignTargetsConfig([{name: "target1"}, {name: "target2"}, {name: "target3"}]);

		assert.ok(Array.isArray(aConfig), "The return value is an array");
		assert.deepEqual(aConfig, [{name: "target1"}, {name: "target2"}, {name: "target3"}], "Correct config is returned");
	});

	QUnit.test("Get target config with invalid arguments", function(assert) {
		var aConfig = this.oRoute._alignTargetsConfig();
		assert.deepEqual(aConfig, [], "Empty array is returned");

		aConfig = this.oRoute._alignTargetsConfig(false);
		assert.deepEqual(aConfig, [], "Empty array is returned");
	});

	QUnit.test("Get targets config with mixture of arguments", function(assert) {
		var aConfig = this.oRoute._alignTargetsConfig(["target1", {name: "target2"}, "target3"]);

		assert.ok(Array.isArray(aConfig), "The return value is an array");
		assert.deepEqual(aConfig, [{name: "target1"}, {name: "target2"}, {name: "target3"}], "Correct config is returned");
	});
});
