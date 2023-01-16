/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/Component",
	"sap/ui/core/UIComponent",
	"sap/ui/core/routing/Route",
	"sap/ui/core/routing/Views",
	"sap/ui/core/routing/Targets",
	"sap/m/Panel"
], function(Component, UIComponent, Route, Views, Targets, Panel) {
	"use strict";

	// use sap.m.Panel as a lightweight drop-in replacement for the ux3.Shell
	var ShellSubstitute = Panel;

	QUnit.module("async view loading", {
		beforeEach: function() {
			var oViews = new Views({async: true});
			this.oShell = new ShellSubstitute();
			this.oRouterStub = {
				fireRouteMatched : function () {},
				fireRoutePatternMatched : function () {},
				fireBeforeRouteMatched : function () {},
				_stopWaitingTitleChangedFromChild : function () {},
				_oTargets: new Targets({
					targets: {
						async1: {
							// key: "async1",
							viewName: "qunit.view.Async1",
							controlAggregation: "content",
							controlId: this.oShell.getId(),
							viewType: "XML"
						},
						async2: {
							// key: "async2",
							viewName: "qunit.view.Async2",
							controlAggregation: "content",
							controlId: this.oShell.getId(),
							viewType: "XML"
						},
						async3: {
							// key: "async3",
							viewName: "qunit.view.Async3",
							controlAggregation: "content",
							controlId: this.oShell.getId(),
							viewType: "XML"
						}
					},
					views: oViews,
					config: {
						_async: true
					}
				}),
				_oViews: oViews,
				_isAsync: function() {
					return true;
				},
				getTargets: function() {
					return this._oTargets.targets;
				}
			};

			this.oRoute = new Route(this.oRouterStub, {
				name: "testRoute",
				target: [
					"async1", "async2", "async3"
				]
			});

			this.oRoute1 = new Route(this.oRouterStub, {
				name: "testRoute1",
				view: "qunit.view.Async3",
				targetAggregation: "content",
				targetControl: this.oShell.getId(),
				viewType: "XML"
			});
		},
		afterEach: function() {
			this.oRoute.destroy();
			this.oRoute1.destroy();
		}
	});

	QUnit.test("Should fired beforeMatched before matched", function(assert) {
		var fnBeforeMatchedSpy = this.spy(function() {
				assert.notOk(fnMatchedSpy.called, "the matched event shouldn't be fired yet");
			}),
			fnMatchedSpy = this.spy();

		this.oRoute.attachBeforeMatched(fnBeforeMatchedSpy);
		this.oRoute.attachMatched(fnMatchedSpy);

		// Act
		var oSequencePromise = this.oRoute._routeMatched({}, Promise.resolve());
		return oSequencePromise.then(function() {
			// Assert
			assert.strictEqual(fnBeforeMatchedSpy.callCount, 1, "did fire the beforeMatched event");
			assert.strictEqual(fnMatchedSpy.callCount, 1, "did fire the matched event");
		});
	});

	QUnit.test("Should not call pattern matched only matched", function(assert) {
		var fnMatchedSpy = this.spy(),
			fnPatternMatchedSpy = this.spy();

		this.oRoute.attachMatched(fnMatchedSpy);
		this.oRoute.attachPatternMatched(fnPatternMatchedSpy);

		// Act
		var oSequencePromise = this.oRoute._routeMatched({}, Promise.resolve());
		return oSequencePromise.then(function(aValues) {
			// Assert
			assert.strictEqual(fnMatchedSpy.callCount, 1, "did call the attachMatched spy");
			assert.strictEqual(fnPatternMatchedSpy.callCount, 0, "did not call the attachPatternMatched spy");
		});
	});

	QUnit.test("Should not call pattern matched only matched (legacy version; not setting target parameter)", function(assert) {
		var fnMatchedSpy = this.spy(),
			fnPatternMatchedSpy = this.spy();

		this.oRoute1.attachMatched(fnMatchedSpy);
		this.oRoute1.attachPatternMatched(fnPatternMatchedSpy);

		// Act
		var oSequencePromise = this.oRoute1._routeMatched({}, Promise.resolve());
		return oSequencePromise.then(function(aValues) {
			// Assert
			assert.strictEqual(fnMatchedSpy.callCount, 1, "did call the attachMatched spy");
			assert.strictEqual(fnPatternMatchedSpy.callCount, 0, "did not call the attachPatternMatched spy");
		});
	});

	QUnit.test("Should save the current route as last matched route in the router after _routeMatched is called", function(assert) {
		this.oRoute1._routeMatched({}, Promise.resolve());
		assert.strictEqual(this.oRouterStub._oMatchedRoute, this.oRoute1, "The matched route is saved as last matched route in the router");
	});

	QUnit.test("Should fire a switched event", function(assert) {
		var fnSwitchedSpy = this.spy();

		this.oRoute1.attachEvent("switched", fnSwitchedSpy);
		this.oRoute1._routeSwitched();

		assert.equal(fnSwitchedSpy.callCount, 1, "The switched event handler is called");
	});

	function fnRouteEventsTestCase (sTestName, sEventName) {
		QUnit.test(sTestName, function(assert) {
			// Arrange
			var sName = "testRoute",
				aTargetNames = ["async1", "async2", "async3"],
				oRoute = new Route(this.oRouterStub, { name : sName, target : aTargetNames }),
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
				oAttachReturnValue = oRoute["attach" + sEventName](oData, fnEventSpy, oListener);

			// Act
			var oSequencePromise = oRoute._routeMatched({});

			return oSequencePromise.then(function(aValues) {
				// Assert
				assert.strictEqual(fnEventSpy.callCount, 1, "did call the attach spy for the event " + sEventName);
				assert.strictEqual(oAttachReturnValue, oRoute, "did return this for chaining for the event " + sEventName);
			});
		});
	}

	fnRouteEventsTestCase("Should attach to the beforeMatched event", "BeforeMatched");
	fnRouteEventsTestCase("Should attach to the matched event", "Matched");
	fnRouteEventsTestCase("Should attach to the patternMatched event", "PatternMatched");

	function fnDetachRouteEventTestCase(sTestName, sEventName) {
		QUnit.test(sTestName, function(assert) {
			// Arrange
			var sName = "testRoute",
				aTargetNames = ["async1", "async2", "async3"],
				fnRouteMatchedSpy = this.spy(),
				fnEventSpy = this.spy(),
				oListener = {};

			this.oRouterStub.fireRouteMatched = fnRouteMatchedSpy;
			this.oRouterStub.fireRoutePatternMatched = fnRouteMatchedSpy;

			var oRoute = new Route(this.oRouterStub,
				{ name : sName, target : aTargetNames });

			oRoute["attach" + sEventName](fnEventSpy, oListener);
			oRoute["attach" + sEventName](fnEventSpy);

			// Act
			var oDetachedReturnValue = oRoute["detach" + sEventName](fnEventSpy, oListener);
			oRoute["detach" + sEventName](fnEventSpy);

			// FireEvent to make sure no spy is called
			var oSequencePromise = oRoute._routeMatched({});

			// Assert
			return oSequencePromise.then(function(aValues) {
				assert.strictEqual(fnEventSpy.callCount, 0, "did not call the spy since it was detached");
				assert.strictEqual(oDetachedReturnValue, oRoute, "did return this for chaining");
			});
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
					return true;
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

			this.oGetParentRouteSpy = sinon.spy(Route.prototype, "_getParentRoute");

			return Component.create({
				name: "qunit.router.component.parentRoute.Parent",
				id: "parent"
			}).then(function(oComponent) {
				var that = this;
				this.oParentComponent = oComponent;
				this.oParentComponent.getRouter().initialize();

				var oRootView = oComponent.getRootControl();
				var oComponentContainer = oRootView.byId("container");

				return new Promise(function(resolve, reject) {
					oRootView.placeAt("qunit-fixture");
					oComponentContainer.attachComponentCreated(function(oEvent) {
						that.oChildComponent = oEvent.getParameter("component");
						resolve();
					});
				});
			}.bind(this));
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
		assert.ok(this.oGetParentRouteSpy.called, "getParentRoute is called once on the child route");
		assert.strictEqual(this.oGetParentRouteSpy.args[0][0], "qunit.router.component.parentRoute.Parent.Component:category", "parameter is correctly given");
		assert.strictEqual(this.oGetParentRouteSpy.returnValues[0], oParentRouter.getRoute("category"), "The parent route instance is fetched from the component");
	});

	QUnit.module("_alignTargetsConfig", {
		beforeEach: function() {
			this.oRoute = new Route({
				_isAsync: function() {
					return true;
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
