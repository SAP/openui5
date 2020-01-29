/*global QUnit, sinon, hasher */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/UIComponent",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/mvc/JSView",
	"sap/ui/core/mvc/View",
	"sap/ui/core/routing/HashChanger",
	"sap/ui/core/routing/Router",
	"sap/ui/core/routing/Views",
	"sap/ui/model/json/JSONModel",
	"sap/m/App",
	"sap/m/Button",
	"sap/m/NavContainer",
	"sap/m/Panel",
	"sap/m/SplitContainer",
	"./AsyncViewModuleHook",
	"sap/ui/base/EventProvider",
	"sap/ui/Device",
	"sap/ui/core/Component",
	"sap/ui/core/ComponentContainer"
], function(Log, UIComponent, Controller, JSView, View, HashChanger, Router, Views, JSONModel, App, Button, NavContainer, Panel, SplitContainer, ModuleHook, EventProvider, Device, Component, ComponentContainer) {
	"use strict";

	// This global namespace is used for creating custom component classes.
	// It is set early here so that QUnit doesn't report it when using its 'noglobals' option
	window.namespace = undefined;
	window.namespace1 = undefined;

	// use sap.m.Panel as a lightweight drop-in replacement for the ux3.Shell
	var ShellSubstitute = Panel;

	var fnCreateRouter = function() {
		var args = Array.prototype.slice.call(arguments);

		args.unshift(Router);

		if (args.length < 3) {
			args[2] = {};
		}
		args[2].async = true;

		return new (Function.prototype.bind.apply(Router, args))();
	};

	function createView (aContent, sId) {
		var sXmlViewContent = aContent.join(''),
				oViewOptions = {
					id : sId,
					viewContent: sXmlViewContent,
					type: "XML"
				};

		return sap.ui.view(oViewOptions);
	}

	QUnit.module("State: initial, initialized and stopped", {
		beforeEach: function(assert) {
			this.oRouter = new Router({}, {async: true}, null, {});
		},
		afterEach: function(assert) {
			this.oRouter.destroy();
		}
	});

	QUnit.test("The router is neither initialized nor stopped after construction", function(assert) {
		assert.equal(this.oRouter.isInitialized(), false, "The router isn't initialized");
		assert.equal(this.oRouter.isStopped(), false, "The router isn't stopped");
	});

	QUnit.test("The router is initialized after calling initialize", function(assert) {
		this.oRouter.initialize();

		assert.equal(this.oRouter.isInitialized(), true, "The router is initialized");
		assert.equal(this.oRouter.isStopped(), false, "The router isn't stopped");
	});

	QUnit.test("The router is stopped after calling stop", function(assert) {
		var oTargetsDetachTitleChangedSpy = sinon.spy(this.oRouter.getTargets(), "detachTitleChanged");
		this.oRouter.stop();

		assert.equal(this.oRouter.isInitialized(), false, "The router isn't initialized");
		assert.equal(this.oRouter.isStopped(), true, "The router is stopped");
		assert.equal(oTargetsDetachTitleChangedSpy.callCount, 1, "detachTitleChanged should be called");

		oTargetsDetachTitleChangedSpy.restore();
	});

	QUnit.test("The router is neither initialized nor stopped after destroyed", function(assert) {
		this.oRouter.destroy();
		assert.equal(this.oRouter.isInitialized(), false, "The router isn't initialized");
		assert.equal(this.oRouter.isStopped(), false, "The router isn't stopped");
	});

	QUnit.module("get/setHashChanger");

	QUnit.test("getHashChanger", function(assert) {
		var oRouter = new Router({}, {async: true}, null, {});

		assert.ok(oRouter.getHashChanger().isA("sap.ui.core.routing.RouterHashChanger"), "The router has default hashchanger created in the constructor");
		oRouter.destroy();
	});

	QUnit.test("setHashChanger", function(assert) {
		var oRouter = new Router({}, {async: true}, null, {});
		var oRouterHashChanger = oRouter.getHashChanger();

		var oWarningSpy = sinon.spy(Log, "warning");
		oRouter.setHashChanger({});
		assert.equal(oWarningSpy.callCount, 1, "A warning is written");
		assert.strictEqual(oRouter.getHashChanger(), oRouterHashChanger, "The RouterHashChanger is still the one which is set by the first setter call");

		oWarningSpy.restore();
		oRouter.destroy();
	});

	QUnit.module("construction");

	QUnit.test("constructor with RouterHashChanger", function(assert) {
		var oRouterHashChanger = HashChanger.getInstance().createRouterHashChanger();
		var oRouter = new Router({}, {async: true}, null, {}, oRouterHashChanger);

		assert.strictEqual(oRouter.getHashChanger(), oRouterHashChanger, "The hash changer is assigned to the router");
		oRouterHashChanger.destroy();
		oRouter.destroy();
	});

	QUnit.test("constructor without RouterHashChanger", function(assert) {
		var oRouter = new Router({}, {async: true}, null, {});

		assert.ok(oRouter.getHashChanger().isA("sap.ui.core.routing.RouterHashChanger"), "A hash changer is created by default");
		oRouter.destroy();
	});

	QUnit.module("initialization");

	QUnit.test("Should initialize the router instance", function(assert) {
		//Arrange
		var parseSpy,
		//System under Test
			router = fnCreateRouter();

		parseSpy = this.spy(router, "parse");

		hasher.setHash("");

		//Act
		router.initialize();

		//Assert
		assert.strictEqual(parseSpy.callCount, 1, "did notify for initial hash");

		hasher.setHash("foo");

		assert.strictEqual(parseSpy.callCount, 2, "did notify for hashChanged");

		//Cleanup
		router.destroy();
	});

	QUnit.test("Should stop the router instance", function(assert) {
		//Arrange
		var parseSpy,
		//System under Test
			router = fnCreateRouter();

		parseSpy = this.spy(router, "parse");

		hasher.setHash("");

		//Act
		router.initialize();

		//Assert
		assert.strictEqual(parseSpy.callCount, 1, "did notify for initial hash");

		router.stop();
		hasher.setHash("foo");

		assert.strictEqual(parseSpy.callCount, 1, "did not notify for hashChanged");

		router.initialize();
		assert.strictEqual(parseSpy.callCount, 2, "did notify again and parse the current hash");

		//Cleanup
		router.destroy();
	});

	QUnit.test("Should fire switched event on the last matched route when stopping the router instance", function(assert) {
		//Arrange
		var router = fnCreateRouter({
				home: {
					pattern: ""
				}
			}),
			oRoute = router.getRoute("home"),
			oSwitchedSpy = this.spy();

		oRoute.attachEvent("switched", oSwitchedSpy);

		hasher.setHash("");

		//Act
		router.initialize();
		router.stop();

		//Assert
		assert.equal(oSwitchedSpy.callCount, 1, "The switched event is fired on the last matched route");

		router.initialize();
		assert.equal(oSwitchedSpy.callCount, 1, "No further switched event is fired by initialize");

		//Cleanup
		router.destroy();
	});

	QUnit.test("Should not raise any exeception when stop is called before initialize", function(assert) {
		assert.expect(0);
		var router = fnCreateRouter();

		// call stop shouldn't raise any exception
		router.stop();

		//Cleanup
		router.destroy();
	});

	QUnit.test("Should parse the hash again when second initialize doesn't suppress hash parsing", function(assert) {
		var router = fnCreateRouter();
		var parseSpy = this.spy(router, "parse");

		hasher.setHash("");

		router.initialize();

		assert.equal(parseSpy.callCount, 1, "did notify for initial hash");
		router.stop();

		router.initialize();
		assert.equal(parseSpy.callCount, 2, "did notify when initialized with the same hash again");

		router.destroy();
	});

	QUnit.test("Shouldn't parse the hash again when second initialize does suppress hash parsing", function(assert) {
		var router = fnCreateRouter();
		var parseSpy = this.spy(router, "parse");

		hasher.setHash("");

		router.initialize();

		assert.equal(parseSpy.callCount, 1, "did notify for initial hash");
		router.stop();

		router.initialize(true /*suppress hash parsing*/);
		assert.equal(parseSpy.callCount, 1, "did not notify when initialized with the same hash again");

		router.destroy();
	});

	QUnit.test("Should destroy the router instance", function(assert) {
		//Arrange
		var parseSpy,
		//System under Test
			router = fnCreateRouter();

		parseSpy = this.spy(router, "parse");

		hasher.setHash("");

		//Act
		router.initialize();
		router.initialize();
		router.destroy();
		hasher.setHash("foo");

		//Assert
		assert.strictEqual(parseSpy.callCount, 1, "did notify for initial hash but did not dispatch change after destroy");

	});

	QUnit.test("Should destroy the routers dependencies", function(assert) {
		// System under test + Arrange
		var oRouter = fnCreateRouter([ { name : "myRoute", pattern : "foo" } ], {}, null, {myTarget : {}});

		var oTargets = oRouter.getTargets(),
			oViews = oRouter.getViews(),
			oRoute = oRouter.getRoute("myRoute");

		//Act
		oRouter.destroy();

		//Assert
		assert.ok(oRouter.bIsDestroyed, "did set the destroy flag");
		assert.ok(oTargets.bIsDestroyed, "did destroy the targets");
		assert.ok(oRoute.bIsDestroyed, "did destroy the route");
		assert.ok(oViews.bIsDestroyed, "did destroy the views");
		assert.strictEqual(oRouter._oRouter, null, "did free the crossroads router");
		assert.strictEqual(oRouter._oRoutes, null, "did free the UI5 routes");
		assert.strictEqual(oRouter._oTargets, null, "did free the UI5 targets");
		assert.strictEqual(oRouter._oConfig, null, "did free the config");
		assert.strictEqual(oRouter._oViews, null, "did free the view cache");

	});

	QUnit.test("Shouldn't cause error when router is destroyed before the triggered target is displayed", function(assert) {
		var oSandbox = sinon.createSandbox();

		oSandbox.stub(Device, "browser").value({
			edge: true
		});

		var oRouter = fnCreateRouter([{
			name: "myRoute",
			pattern : "foo",
			target: "home"
		}], {}, null, {
			myTarget : {
				home: {
				}
			}
		});

		var oTargets = oRouter.getTargets();
		var oRoute = oRouter.getRoute("myRoute");
		var oDisplayStub = oSandbox.stub(oTargets, "_display").callsFake(function() {});

		var oRouteMatchedSpy = oSandbox.spy(oRoute, "_routeMatched");
		oRouter.parse("foo");
		// destroy the router immediately after trigger the route matched logic
		oRouter.destroy();

		assert.equal(oRouteMatchedSpy.callCount, 1, "The route is matched");

		return oRouteMatchedSpy.returnValues[0].then(function() {
			assert.equal(oDisplayStub.callCount, 0, "The target isn't displayed because the router is already destroyed");
			oSandbox.restore();
		});
	});

	QUnit.test("Should log a warning if a router gets destroyed while the hash changes", function (assert) {

		// Arrange
		var oWarningSpy = this.stub(Log, "warning"),
			oFirstRouter = fnCreateRouter({
				"matchingRoute" : {
					pattern: "matches"
				}
			}),
			oRouterToBeDestroyed = fnCreateRouter({
				"matchingRoute" : {
					pattern: "matches"
				}
			});

		// first router has to init first it is the first registered router on the hashchanger
		oFirstRouter.initialize();
		oRouterToBeDestroyed.initialize();

		this.stub(oFirstRouter, "parse").callsFake(function() {
			Router.prototype.parse.apply(this, arguments);
			oRouterToBeDestroyed.destroy();
		});

		// Act - trigger both routers
		hasher.setHash("matches");

		// Assert
		assert.equal(oWarningSpy.callCount, 1, "");
		assert.ok(oWarningSpy.args[0][0].indexOf("destroyed") !== -1, "The message contains the correct keyword");
		assert.strictEqual(oWarningSpy.args[0][1], oRouterToBeDestroyed, "The second parameter to the warning call is correct");
		oFirstRouter.destroy();
	});

	QUnit.module("config", {
		beforeEach : function() {
			//make sure to start with an empty hash
			hasher.setHash("");
		}
	});

	QUnit.test("Should not match the undefined pattern", function(assert) {
		//Arrange
		var callCount = 0,
			matched = function(oEvent) {
				if (oEvent.getParameter("name") === "child") {
					callCount++;
				}
				if (oEvent.getParameter("name") === "parent") {
					assert.ok(false, "did hit the parent route");
				}
			},
			//System under Test
			router = fnCreateRouter({
				"parent" : {
					subroutes : {
						"child" : {
							pattern : "foo"
						}
					}
				}
			});

		this.stub(router._oViews, "_getViewWithGlobalId").callsFake(function() {
			return createView(
					['<View xmlns="sap.ui.core.mvc">',
						'</View>']);
		});

		var oParentRouteMatchedSpy = this.spy(router.getRoute("parent"), "_routeMatched");
		var oChildRouteMatchedSpy = this.spy(router.getRoute("child"), "_routeMatched");

		router.attachRoutePatternMatched(matched);
		hasher.setHash("");

		//Act
		router.initialize();
		hasher.setHash("foo");
		hasher.setHash("");

		assert.strictEqual(oParentRouteMatchedSpy.callCount, 1, "Parent _routeMatched is called");
		assert.ok(oParentRouteMatchedSpy.args[0][1] instanceof Promise, "Parent _routeMatched is called with second parameter Promise");
		assert.strictEqual(oChildRouteMatchedSpy.callCount, 1, "Child _routeMatched is called");
		assert.strictEqual(oChildRouteMatchedSpy.args[0][1], true, "Child _routeMatched is called with second parameter true");

		return oChildRouteMatchedSpy.returnValues[0].then(function() {
			//Assert
			assert.strictEqual(callCount, 1,"did notify the child");
			router.destroy();
		});
	});

	QUnit.test("Handle setting invalid option 'viewName' in route", function(assert) {
		var oLogSpy = this.spy(Log, "error");

		//Arrange System under Test
		fnCreateRouter({
			name: {
				// This is a wrong usage, the option "view" should be set
				// instead of "viewName"
				// We should still support the usage but log an error to
				// let the app be aware of the wrong usage
				viewName: "myView",
				viewType: "JS",
				pattern : "view1"
			}
		});


		assert.ok(oLogSpy.withArgs("The 'viewName' option shouldn't be used in Route. please use 'view' instead").calledOnce, "The error log is done and the log message is correct");
	});

	QUnit.test("subroute handling", function(assert) {

		//Arrange System under Test
		var router = fnCreateRouter({
			name: {
				view : "myView",
				viewType: "JS",
				pattern : "view1",
				subroutes: {
					subpage: {
						targetControl: "navContainer",
						targetAggregation: "pages",
						view : "subView",
						viewType: "JS",
						pattern: "view1/view2",
						subroutes: {
							subsubpage: {
								targetControl: "navContainer2",
								targetAggregation: "pages",
								view : "subView2",
								viewType: "JS",
								pattern: "foo"
							}
						}
					}
				}
			}
		});

		var aRoutes = router._oRoutes;

		assert.ok(aRoutes.name);
		assert.ok(aRoutes.subpage);
		assert.ok(aRoutes.subsubpage);

		var route1 = aRoutes.name;
		assert.strictEqual(route1._oConfig.name, "name", "Route has correct name");
		assert.strictEqual(route1._oParent, undefined, "Route has no parent");

		var route2 = aRoutes.subpage;
		assert.strictEqual(route2._oConfig.name, "subpage", "Route has correct name");
		assert.strictEqual(route2._oParent, route1, "Route has correct parent");

		var route3 = aRoutes.subsubpage;
		assert.strictEqual(route3._oConfig.name, "subsubpage", "Route has correct name");
		assert.strictEqual(route3._oParent, route2, "Route has correct parent");

		router = fnCreateRouter([
			{
				name : "name",
				view : "myView",
				viewType: "JS",
				pattern : "view1",
				subroutes: [
					{
						targetControl: "navContainer",
						targetAggregation: "pages",
						name: "subpage",
						view : "subView",
						viewType: "JS",
						pattern: "view1/view2",
						subroutes: [
							{
								targetControl: "navContainer2",
								targetAggregation: "pages",
								name: "subsubpage",
								view : "subView2",
								viewType: "JS",
								pattern: "foo"
							}
						]
					}
				]
			}
		]);

		aRoutes = router._oRoutes;

		assert.ok(aRoutes.name);
		assert.ok(aRoutes.subpage);
		assert.ok(aRoutes.subsubpage);

		route1 = aRoutes.name;
		assert.strictEqual(route1._oConfig.name, "name", "Route has correct name");
		assert.strictEqual(route1._oParent, undefined, "Route has no parent");

		route2 = aRoutes.subpage;
		assert.strictEqual(route2._oConfig.name, "subpage", "Route has correct name");
		assert.strictEqual(route2._oParent, route1, "Route has correct parent");

		route3 = aRoutes.subsubpage;
		assert.strictEqual(route3._oConfig.name, "subsubpage", "Route has correct name");
		assert.strictEqual(route3._oParent, route2, "Route has correct parent");

	});

	QUnit.test("Should not crash if viewName is not defined, but controlId and aggregation are defaulted but no view is given", function (assert) {
		var oNavContainer = new NavContainer();

		//Arrange System under Test
		var oRouter = fnCreateRouter({
			routeWithoutView: {
				pattern : "view1"
			}
		},
		{
			targetControl: oNavContainer.getId(),
			targetAggregation: "pages"
		});

		oRouter.parse("view1");

		assert.ok(true, "Did not crash");

		oNavContainer.destroy();
		oRouter.destroy();
	});

	QUnit.module("greedy");

	QUnit.test("Should create a greedy route", function (assert) {
		// Arrange + System under test
		var sPattern = "product",
			oRouter = fnCreateRouter([
			{
				name: "first",
				pattern: sPattern
			},
			{
				name : "parent",
				pattern : sPattern,
				greedy : true,
				subroutes: [
					{
						name : "child",
						pattern : sPattern
					}
				]
			}
		]);

		var aRoutes = [oRouter.getRoute("first"), oRouter.getRoute("parent"), oRouter.getRoute("child")],
			aListenerSpies = [this.spy(), this.spy(), this.spy()],
			aRouteMatchedSpies = [];

		aRoutes.forEach(function(oRoute, i) {
			oRoute.attachPatternMatched(aListenerSpies[i]);
			aRouteMatchedSpies.push(this.spy(oRoute, "_routeMatched"));
		}, this);

		// Act
		oRouter.parse(sPattern);

		assert.strictEqual(aRouteMatchedSpies[0].callCount, 1, "first route is matched");
		assert.strictEqual(aRouteMatchedSpies[1].callCount, 1, "parent route is matched");
		assert.strictEqual(aRouteMatchedSpies[2].callCount, 0, "child route is not matched");

		return Promise.all([aRouteMatchedSpies[0].returnValues[0], aRouteMatchedSpies[1].returnValues[0]]).then(function() {
			assert.strictEqual(aListenerSpies[0].callCount, 1, "first route gets pattern matched");
			assert.strictEqual(aListenerSpies[1].callCount, 1, "parent does also get pattern matched because of greedyness");
			assert.strictEqual(aListenerSpies[2].callCount, 0, "child gets not pattern matched");

			oRouter.destroy();
		});
	});

	QUnit.test("Should create a greedy route", function (assert) {
		// Arrange + System under test
		var sPattern = "product",
			oRouter = fnCreateRouter([
				{
					name: "first",
					pattern: sPattern
				},
				{
					name : "second",
					pattern : sPattern
				},
				{
					name: "last",
					pattern: sPattern,
					greedy : true
				}
			]);

		var aRoutes = [oRouter.getRoute("first"), oRouter.getRoute("second"), oRouter.getRoute("last")],
			aListenerSpies = [this.spy(), this.spy(), this.spy()],
			aRouteMatchedSpies = [];

		aRoutes.forEach(function(oRoute, i) {
			oRoute.attachPatternMatched(aListenerSpies[i]);
			aRouteMatchedSpies.push(this.spy(oRoute, "_routeMatched"));
		}, this);

		// Act
		oRouter.parse(sPattern);

		assert.strictEqual(aRouteMatchedSpies[0].callCount, 1, "first route is matched");
		assert.strictEqual(aRouteMatchedSpies[1].callCount, 0, "second route is not matched");
		assert.strictEqual(aRouteMatchedSpies[2].callCount, 1, "last route is matched");

		return Promise.all([aRouteMatchedSpies[0].returnValues[0], aRouteMatchedSpies[2].returnValues[0]]).then(function() {
			assert.strictEqual(aListenerSpies[0].callCount, 1, "first route gets pattern matched");
			assert.strictEqual(aListenerSpies[1].callCount, 0, "second doesn't get matched");
			assert.strictEqual(aListenerSpies[2].callCount, 1, "last gets pattern matched");

			oRouter.destroy();
		});
	});

	QUnit.module("routing", {
		beforeEach : function() {
			//make sure to start with an empty hash
			hasher.setHash("");
		}
	});

	QUnit.test("Should attach to a route", function(assert) {
		//Arrange
		var spy = this.spy(),
		//System under Test
			router = fnCreateRouter([ {
				name : "name",
				pattern : ""
			} ]);

		var oRoute = router.getRoute("name"),
			oSpy = sinon.spy(oRoute, "_routeMatched");

		//Act
		router.attachRouteMatched(spy);
		router.initialize();

		assert.strictEqual(oSpy.callCount, 1, "_routeMatched is called once");

		return oSpy.returnValues[0].then(function() {
			//Assert
			assert.strictEqual(spy.callCount, 1, "Did call the callback function once");

			//Cleanup
			oSpy.restore();
			router.destroy();
		});
	});

	QUnit.test("Should attach to a route using getRoute", function(assert) {
		//Arrange
		var spy = this.spy(),
			//System under Test
			oRouter = fnCreateRouter([ {
				name : "name",
				pattern : ""
			} ]),
			oRoute = oRouter.getRoute("name");

		var oSpy = sinon.spy(oRoute, "_routeMatched");

		//Act
		oRoute.attachMatched(spy);
		oRouter.initialize();

		assert.strictEqual(oSpy.callCount, 1, "_routeMatched is called once");

		return oSpy.returnValues[0].then(function() {
			//Assert
			assert.strictEqual(spy.callCount, 1, "Did call the callback function once");

			//Cleanup
			oSpy.restore();
			oRouter.destroy();
		});
	});

	QUnit.test("Should go to a route", function(assert) {
		//Arrange
		var callCount = 0,
			aArguments = [],
			matched = function(oEvent) {
				if (oEvent.getParameter("name") === "name") {
					callCount++;
					aArguments = oEvent.getParameter("arguments");
				}
			},
			//System under Test
			router = fnCreateRouter([ {
				name : "name",
				pattern : "{foo}/{bar}"
			} ]);

		this.stub(router._oViews, "_getViewWithGlobalId").callsFake(function() {
			return createView(
					['<View xmlns="sap.ui.core.mvc">',
						'</View>']);
		});

		var oRouteMatchedSpy = this.spy(router.getRoute("name"), "_routeMatched");

		router.initialize();
		router.attachRouteMatched(matched);

		//Act
		var url = router.getURL("name", {
			bar : "bar",
			foo : "foo"
		});
		HashChanger.getInstance().setHash(url);

		assert.strictEqual(oRouteMatchedSpy.callCount, 1, "_routeMatched is called");

		return oRouteMatchedSpy.returnValues[0].then(function() {
			//Assert
			assert.strictEqual(callCount, 1, "Did call the callback function once");
			assert.strictEqual(aArguments.foo, "foo", "parameter foo is passed");
			assert.strictEqual(aArguments.bar, "bar", "parameter bar is passed");

			//Cleanup
			router.destroy();
		});
	});

	QUnit.test("Should go to a route", function(assert) {
		//Arrange
		var beforeCallCount = 0,
			callCount = 0,
			patternCallCount = 0,
			aArguments = [],
			bParentCallFirst = false,
			beforeMatched = function(oEvent) {
				beforeCallCount++;
			},
			matched = function(oEvent) {
				callCount++;
				if (oEvent.getParameter("name") === "name") {
					if (callCount === 1) {
						bParentCallFirst = true;
					}
					aArguments = oEvent.getParameter("arguments");
				}
			},
			patternMatched = function(oEvent) {
				patternCallCount++;
				if (oEvent.getParameter("name") === "name") {
					assert.ok(false, "the parent route should not be hit");
				}
			},
			//System under Test
			router = fnCreateRouter([ {
				name : "name",
				pattern : "{foo}",
				subroutes: [
					{
						name: "subroute",
						pattern: "{foo}/{bar}"
					}
				]
			} ]);

		this.stub(router._oViews, "_getViewWithGlobalId").callsFake(function() {
			return createView(
					['<View xmlns="sap.ui.core.mvc">',
						'</View>']);
		});

		router.initialize();
		router.attachBeforeRouteMatched(beforeMatched);
		router.attachRouteMatched(matched);
		router.attachRoutePatternMatched(patternMatched);

		// var oParentRouteMatchedSpy = this.spy(router.getRoute("name"), "_routeMatched");
		var oChildRouteMatchedSpy = this.spy(router.getRoute("subroute"), "_routeMatched");

		//Act
		var url = router.getURL("subroute", {
			bar : "bar",
			foo : "foo"
		});
		HashChanger.getInstance().setHash(url);

		assert.strictEqual(oChildRouteMatchedSpy.callCount, 1, "Child _routeMatched is called once");

		return oChildRouteMatchedSpy.returnValues[0].then(function() {
			//Assert
			assert.strictEqual(beforeCallCount, 2, "Did call the callback function twice");
			assert.strictEqual(callCount, 2, "Did call the callback function twice");
			assert.strictEqual(patternCallCount, 1, "Did call the patternMatched function once");
			assert.deepEqual(aArguments.foo, "foo", "Did pass foo as parameter it was: " + aArguments.foo);
			assert.ok(bParentCallFirst, "Parent route was called first");

			//Cleanup
			router.destroy();
		});
	});

	//there was a bug that an empty route would catch all the requests
	QUnit.test("Should route to a route after an emptyHash", function(assert) {
		//Arrange
		var callCount = 0,
			matched = function(oEvent) {
				if (oEvent.getParameter("name") === "name") {
					callCount++;
				}
			},
			//System under Test
			router = fnCreateRouter([ {
				name : "emty",
				pattern : ""
			}, {
				name : "name",
				pattern : "foo/"
			} ]);

		router.initialize();
		router.attachRouteMatched(matched);

		var oRoute = router.getRoute("name"),
			oSpy = sinon.spy(oRoute, "_routeMatched");


		//Act
		HashChanger.getInstance().setHash("foo/");

		assert.strictEqual(oSpy.callCount, 1, "_routeMatched of name route is called");

		return oSpy.returnValues[0].then(function() {
			//Assert
			assert.strictEqual(callCount, 1, "Did call the callback function once");

			//Cleanup
			oSpy.restore();
			router.destroy();
		});
	});

	QUnit.module("hrefGeneration");

	QUnit.test("Should create an URL for a route", function(assert) {
		//Arrange
		var //System under Test
			router = fnCreateRouter([ {
				name : "name",
				pattern : "{foo}/{bar}"
			} ]);

		router.initialize();

		//Act
		var result = router.getURL("name", {
			bar : "bar",
			foo : "foo"
		});

		//Assert
		assert.strictEqual(result, "foo/bar", "Did pass foo bar as parameter");

		//Cleanup
		router.destroy();
	});

	QUnit.module("test a hash");

	QUnit.test("test whether a hash can be matched by the router", function(assert) {
		var oRouter = fnCreateRouter([{
			name: "fixedPattern",
			pattern: "foo/bar"
		}, {
			name: "withSingleParameter",
			pattern: "bar/{foo}"
		}, {
			name: "withMultipleParameter",
			pattern: "products/{productId}/{supplerId}"
		},{
			name: "withOptionalParameter",
			pattern: "people/{peopleId}/:year:"
		}, {
			name: "withQueryParameter",
			pattern: "employees/{employeeId}{?query}"
		}, {
			name: "withOptionalQueryParameter",
			pattern: "suppliers/{supplierId}:?query:"
		}, {
			name: "emptyPattern",
			pattern: ""
		}]);

		var aHashAndResults = [{
			hash: "foo/bar",
			match: true,
			name: "fixedPattern",
			info: {
				name: "fixedPattern",
				arguments: {}
			}
		}, {
			hash: "foo/bar1",
			match: false,
			name: undefined,
			info: undefined
		}, {
			hash: "foo",
			match: false,
			name: undefined,
			info: undefined

		}, {
			hash: "bar/foo",
			match: true,
			name: "withSingleParameter",
			info: {
				name: "withSingleParameter",
				arguments: {foo: "foo"}
			}
		}, {
			hash: "bar",
			match: false,
			name: undefined,
			info: undefined
		}, {
			hash: "bar/a",
			match: true,
			name: "withSingleParameter",
			info: {
				name: "withSingleParameter",
				arguments: {foo: "a"}
			}
		}, {
			hash: "bar/a/b",
			match: false,
			name: undefined,
			info: undefined
		}, {
			hash: "",
			match: true,
			name: "emptyPattern",
			info: {
				name: "emptyPattern",
				arguments: {}
			  }
		}, {
			hash: null,
			match: true,
			name: "emptyPattern",
			info: {
				name: "emptyPattern",
				arguments: {}
			  }
		}, {
			hash: undefined,
			match: true,
			name: "emptyPattern",
			info: {
				name: "emptyPattern",
				arguments: {}
			  }
		}, {
			hash: "products/P1/S1",
			match: true,
			name: "withMultipleParameter",
			info: {
				name: "withMultipleParameter",
				arguments: {productId: "P1", supplerId: "S1"}
			}
		}, {
			hash: "people/0",
			match: true,
			name: "withOptionalParameter",
			info: {
				name: "withOptionalParameter",
				arguments: {peopleId: "0", year: undefined}
			}
		}, {
			hash: "people/0/2019",
			match: true,
			name: "withOptionalParameter",
			info: {
				name: "withOptionalParameter",
				arguments: {peopleId: "0", year: "2019"}
			}
		}, {
			hash: "employees/123?company=sap",
			match: true,
			name: "withQueryParameter",
			info: {
				name: "withQueryParameter",
				arguments: {employeeId: "123", "?query": {company: "sap"}}
			}
		}, {
			hash: "suppliers/678?company=sap",
			match: true,
			name: "withOptionalQueryParameter",
			info: {
				name: "withOptionalQueryParameter",
				arguments: {supplierId: "678", "?query": {company: "sap"}}
			}
		}, {
			hash: "suppliers/678?company=sap&region=asia",
			match: true,
			name: "withOptionalQueryParameter",
			info: {
				name: "withOptionalQueryParameter",
				arguments: {supplierId: "678", "?query": {company: "sap", region: "asia"}}
			}
		}, {
			hash: "suppliers/678",
			match: true,
			name: "withOptionalQueryParameter",
			info: {
				name: "withOptionalQueryParameter",
				arguments: {supplierId: "678", "?query": undefined}
			}
		}];

		var oRouteByHash, oRouteInfo, sHash;
		aHashAndResults.forEach(function (oHashAndResult) {
			sHash = oHashAndResult.hash;
			oRouteByHash = oRouter.getRouteByHash(sHash);
			oRouteInfo = oRouter.getRouteInfoByHash(sHash);

			assert.strictEqual(oRouter.match(sHash), oHashAndResult.match, JSON.stringify(oHashAndResult, true) + " can" + (oHashAndResult.match ? "" : "'t") + " be matched by the router");
			assert.strictEqual(oRouteByHash ? oRouteByHash._oConfig.name : undefined, oHashAndResult.name, oHashAndResult.name + " can" + (oHashAndResult.hash ? "" : "'t") + " be matched by the hash");
			assert.deepEqual(oRouteInfo, oHashAndResult.info, "Route info object should be correct");
		});
	});

	QUnit.module("navTo", {
		beforeEach: function () {
			this.oRouter = fnCreateRouter();
			this.oRouter.oHashChanger = {
				setHash: jQuery.noop
			};
		},
		afterEach: function () {
			this.oRouter.destroy();
		}
	});

	QUnit.test("Should be able to chain NavTo", function (assert) {
		// Act
		var oReturnValue = this.oRouter.navTo();

		// Assert
		assert.strictEqual(oReturnValue, this.oRouter, "able to chain navTo");
	});

	QUnit.test("Should be able to use navTo with query parameters", function (assert) {
		// Prepare
		var done = assert.async();
		var iCounter = 0;
		HashChanger.getInstance().setHash("");
		var oApp = new App();

		var oRouter = fnCreateRouter([
			{
				name: "start",
				pattern:  "",
				targetControl: oApp.getId()
			},
			{
				name : "startWithQueryParameter",
				pattern : "start:?query:",
				targetControl: oApp.getId()
			}
		]);
		oRouter.getRoute("start").attachPatternMatched(function(oEvent){
			assert.strictEqual(oEvent.getParameter("name"), "start", "The 'start' route is matched correctly");
			oRouter.navTo("startWithQueryParameter");
		});
		oRouter.getRoute("startWithQueryParameter").attachPatternMatched(function(oEvent){
			var oParameters = oEvent.getParameters();
			var sRouteName = oParameters.name;
			var oRouteArguments = oParameters.arguments;
			assert.strictEqual(sRouteName, "startWithQueryParameter", "The 'startWithQueryParameter' route is matched correctly");
			if (iCounter === 0) {
				assert.deepEqual(oRouteArguments, {"?query": undefined}, "The route arguments are empty." );
				iCounter++;
				oRouter.navTo("startWithQueryParameter", {query: {region: "asia"}});
			} else if (iCounter === 1){
				assert.deepEqual(oRouteArguments, {"?query": {region: "asia"}}, "The route arguments correct." );
				iCounter++;
				oRouter.navTo("startWithQueryParameter", {"?query": {region: "europe"}});
			} else {
				assert.deepEqual(oRouteArguments, {"?query": {region: "europe"}}, "The route arguments correct." );
				done();
			}
		});
		oRouter.initialize();

		// Act
		oRouter.navTo("home");
	});

	QUnit.test("Should throw an exception if route placeholder are not unique", function(assert){
		assert.throws(function(){
			fnCreateRouter([
				{
					name: "notValid",
					pattern: "{products}{?products}"
				}]);
			}, new Error("The config of route 'notValid' contains standard parameter and query parameter with the same name: 'products'. The name of the routing parameters and query parameter have to differentiate."));
		assert.ok(
			fnCreateRouter([
				{
					name: "valid",
					pattern: "{products}/{products}"
				}]),
				"The router configuration is correct."
		);
		assert.ok(
			fnCreateRouter([
				{
					name: "valid",
					pattern: "products"
				}]),
				"The router configuration is correct."
		);
		assert.ok(
			fnCreateRouter([
				{
					name: "valid",
					pattern: "{products}/:products:"
				}]),
				"The router configuration is correct."
		);
		assert.throws(function(){
			fnCreateRouter([
				{
					name: "notValid",
					pattern: "{products}:?products:"
				}]);
		}, new Error("The config of route 'notValid' contains standard parameter and query parameter with the same name: 'products'. The name of the routing parameters and query parameter have to differentiate."));
		assert.throws(function(){
			fnCreateRouter([
				{
					name: "notValid",
					pattern: ":products::?products:"
				}
			]);
		}, new Error("The config of route 'notValid' contains standard parameter and query parameter with the same name: 'products'. The name of the routing parameters and query parameter have to differentiate."));
		assert.throws(function(){
			fnCreateRouter([
				{
					name: "notValid",
					pattern: "{id}/{products}/{id}{?products}"
				}
			]);
		}, new Error("The config of route 'notValid' contains standard parameter and query parameter with the same name: 'products'. The name of the routing parameters and query parameter have to differentiate."));
	});

	QUnit.module("View generation", ModuleHook.create());

	QUnit.test("View initialization", function(assert) {

		var oShell = new ShellSubstitute();

		//Arrange System under Test
		var router = fnCreateRouter([
			{
				targetControl: oShell.getId(),
				targetAggregation: "content",
				name: "name",
				view: "Async1",
				viewPath: "qunit.view",
				viewType: "XML",
				pattern : "view1",
				viewId: "view"
			}
		]);

		var oSpy = sinon.spy(View, "_legacyCreate");
		var oRouteMatchedSpy = sinon.spy(router.getRoute("name"), "_routeMatched");

		router.initialize();

		//Act
		HashChanger.getInstance().setHash("view1");

		assert.strictEqual(oRouteMatchedSpy.callCount, 1, "_routeMatched has been called");

		return oRouteMatchedSpy.returnValues[0].then(function(oResult) {
			//Assert
			assert.strictEqual(oShell.getContent()[0].getId(), oResult.view.getId(), "View is first content element");
			assert.strictEqual(oSpy.callCount, 1, "Only one view is created");

			//Cleanup
			oSpy.restore();
			oRouteMatchedSpy.restore();
			router.destroy();
			oShell.destroy();
		});

	});

	QUnit.test("Should set a view to the cache", function (assert) {
		var oShell = new ShellSubstitute();

		//Arrange System under Test
		var router = fnCreateRouter([
			{
				targetControl: oShell.getId(),
				targetAggregation: "content",
				name : "name",
				view : "myView",
				viewType: "XML",
				pattern : "view1"
			}
		]);

		var oRouteMatchedSpy = this.spy(router.getRoute("name"), "_routeMatched");

		var sXmlViewContent = [
			'<View xmlns="sap.ui.core.mvc">',
			'</View>'
		].join('');

		var oViewOptions = {
			viewContent: sXmlViewContent,
			type : "XML"
		};

		var oView = sap.ui.view(oViewOptions);

		HashChanger.getInstance().setHash("view1");
		oShell.placeAt("qunit-fixture");

		//Act
		router.setView("myView", oView);
		router.initialize();

		assert.strictEqual(oRouteMatchedSpy.callCount, 1, "_routeMatched has been called");

		return oRouteMatchedSpy.returnValues[0].then(function(oResult) {
			//Assert
			assert.strictEqual(oShell.getContent()[0].getId(), oResult.view.getId(), "a created view was placed");

			//Cleanup
			router.destroy();
			oShell.destroy();
		});
	});

	QUnit.test("Nested View initialization", function(assert) {

		HashChanger.getInstance().setHash("");

		var oApp = new App();

		//Arrange System under Test
		var router = fnCreateRouter([
			{
				targetControl: oApp.getId(),
				targetAggregation: "pages",
				name : "name",
				view : "myView",
				viewType: "JS",
				pattern : "view1",
				subroutes: [
					{
						targetControl: "navContainer",
						targetAggregation: "pages",
						name : "subpage",
						view : "subView",
						viewType: "JS",
						pattern: "view1/view2",
						subroutes: [
							{
								targetControl: "navContainer2",
								targetAggregation: "pages",
								name : "subsubpage",
								view : "subView2",
								viewType: "JS",
								pattern: "foo"
							}
						]
					}
				]
			}
		]);

		var oNavContainer = new NavContainer("navContainer");
		var oNavContainer2 = new NavContainer("navContainer2");
		var oNavContainer3 = new NavContainer("navContainer3");

		sap.ui.controller("myView", {});
		sap.ui.controller("subView", {});
		sap.ui.controller("subView2", {});
		sap.ui.jsview("myView", {
			createContent : function() {
				return oNavContainer;
			},
			getController : function() {
				return sap.ui.controller("myview");
			}
		});
		sap.ui.jsview("subView", {
			createContent : function() {
				return oNavContainer2;
			},
			getController : function() {
				return sap.ui.controller("subView");
			}
		});
		sap.ui.jsview("subView2", {
			createContent : function() {
				return oNavContainer3;
			},
			getController : function() {
				return sap.ui.controller("subView2");
			}
		});

		var oRouteMatchedSpy = this.spy(router.getRoute("subsubpage"), "_routeMatched");

		router.initialize();

		oApp.placeAt("qunit-fixture");

		//Act
		HashChanger.getInstance().setHash("foo");

		assert.strictEqual(oRouteMatchedSpy.callCount, 1, "_routeMatched has been called");

		return  oRouteMatchedSpy.returnValues[0].then(function() {
			//Assert
			assert.strictEqual(oApp.getPages()[0].getContent()[0].getId(), oNavContainer.getId(), "oNavContainer is first page element in app");
			assert.strictEqual(oNavContainer.getPages()[0].getContent()[0].getId(), oNavContainer2.getId(), "oNavContainer2 is first page element in oNavContainer");
			assert.strictEqual(oNavContainer2.getPages()[0].getContent()[0].getId(), oNavContainer3.getId(), "oNavContainer3 is first page element in oNavContainer2");

			//Cleanup
			router.destroy();
			oApp.destroy();
		});
	});

	QUnit.test("Nested target parents", function(assert) {

		HashChanger.getInstance().setHash("");

		var oApp = new App();

		//Arrange System under Test
		var router = fnCreateRouter([
			{
				targetControl: oApp.getId(),
				targetAggregation: "pages",
				name : "splitContainerView",
				view : "SplitContainerView",
				viewType: "JS",
				subroutes: [
					{
						targetControl: "splitContainer",
						targetAggregation: "masterPages",
						name : "master",
						view : "Master",
						viewType: "JS",
						pattern: "master",
						subroutes: [
							{
								targetControl: undefined,
								targetAggregation: "detailPages",
								name : "detail",
								view : "Detail",
								viewType: "JS",
								pattern: "detail"
							}
						]
					}
				]
			},
			{
				targetControl: oApp.getId(),
				targetAggregation: "pages",
				name : "navContainerView",
				view : "NavContainerView",
				viewType: "JS",
				subroutes: [
					{
						targetControl: "navContainer",
						targetAggregation: "pages",
						name : "fullScreenPage",
						view : "FullScreenPage",
						viewType: "JS",
						pattern: "fullScreen"
					}
				]
			}
		]);

		var oNavContainer;
		var oSplitContainer;
		var oMasterContent = new Button();
		var oDetailContent = new Button();
		var oFullScreenContent = new Button();

		sap.ui.controller("SplitContainerView", {});
		sap.ui.controller("Master", {});
		sap.ui.controller("Detail", {});
		sap.ui.controller("NavContainerView", {});
		sap.ui.controller("FullScreenPage", {});

		sap.ui.jsview("NavContainerView", {
			createContent : function() {
				//simulate created ids
				oNavContainer = new NavContainer(this.createId("navContainer"));
				return oNavContainer;
			},
			getController : function() {
				return sap.ui.controller("NavContainerView");
			}
		});
		sap.ui.jsview("SplitContainerView", {
			createContent : function() {
				//simulate created ids
				oSplitContainer =  new SplitContainer(this.createId("splitContainer"));
				return oSplitContainer;
			},
			getController : function() {
				return sap.ui.controller("SplitContainerView");
			}
		});
		sap.ui.jsview("Master", {
			createContent : function() {
				return oMasterContent;
			},
			getController : function() {
				return sap.ui.controller("Master");
			}
		});
		sap.ui.jsview("Detail", {
			createContent : function() {
				return oDetailContent;
			},
			getController : function() {
				return sap.ui.controller("Detail");
			}
		});
		sap.ui.jsview("FullScreenPage", {
			createContent : function() {
				return oFullScreenContent;
			},
			getController : function() {
				return sap.ui.controller("FullScreenPage");
			}
		});


		var oDetailRouteMatchedSpy = this.spy(router.getRoute("detail"), "_routeMatched");
		var oFullScreenRouteMatchedSpy = this.spy(router.getRoute("fullScreenPage"), "_routeMatched");

		router.initialize();

		//Act
		HashChanger.getInstance().setHash("detail");
		HashChanger.getInstance().setHash("fullScreen");

		assert.strictEqual(oDetailRouteMatchedSpy.callCount, 1, "_routeMatched has been called");
		assert.strictEqual(oFullScreenRouteMatchedSpy.callCount, 1, "_routeMatched has been called");

		return Promise.all([oDetailRouteMatchedSpy.returnValues[0], oFullScreenRouteMatchedSpy.returnValues[0]]).then(function() {
			//Assert
			assert.strictEqual(oApp.getPages().length, 2, "splitContainer and navContainer are added to App");
			assert.strictEqual(oNavContainer.getPages()[0].getContent()[0].getId(), oFullScreenContent.getId(), "FullScreenContent is first page element in oNavContainer");
			assert.strictEqual(oSplitContainer.getMasterPages()[0].getContent()[0].getId(), oMasterContent.getId(), "Master is first master-page element in oSplitContainer");
			assert.strictEqual(oSplitContainer.getDetailPages()[0].getContent()[0].getId(), oDetailContent.getId(), "Detail is first detail-page element in oSplitContainer");

			//Cleanup
			router.destroy();
			oApp.destroy();
		});
	});

	QUnit.test("Fixed id", function(assert) {

		var oShell = new ShellSubstitute();

		//Arrange System under Test
		var router = fnCreateRouter([
			{
				targetControl: oShell.getId(),
				targetAggregation: "content",
				name : "name",
				viewId: "test-view",
				view : "myView",
				pattern : "view1"
			}
		],{
			viewType: "JS"
		});

		sap.ui.controller("myView", {});
		sap.ui.jsview("myView", {
			createContent : function() {
				return new Button();
			},
			getController : function() {
				return sap.ui.controller("myView");
			}
		});

		var oRouteMatchedSpy = this.spy(router.getRoute("name"), "_routeMatched");

		router.initialize();

		oShell.placeAt("qunit-fixture");

		//Act
		HashChanger.getInstance().setHash("view1");

		assert.strictEqual(oRouteMatchedSpy.callCount, 1, "_routeMatched has been called");

		return oRouteMatchedSpy.returnValues[0].then(function() {
			//Assert
			assert.strictEqual(oShell.getContent()[0].getId(), "test-view", "View has correct id");

			//Cleanup
			router.destroy();
			oShell.destroy();
		});

	});

	QUnit.module("View events");

	function createXmlView () {
		var sXmlViewContent = [
			'<View xmlns="sap.ui.core">',
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
			this.oRouter = fnCreateRouter();

			this.oView = createXmlView();
		},
		afterEach: function () {
			this.oRouter.destroy();
		}
	});

	QUnit.test("Should create a view", function (assert) {
		var that = this,
			fnStub = this.stub(View, "_legacyCreate").callsFake(function (oViewOptions) {
				assert.strictEqual(oViewOptions.viewName, "foo", "DId pass the viewname");
				assert.strictEqual(oViewOptions.type, "bar", "DId pass the type");
				assert.strictEqual(oViewOptions.id, "baz", "DId pass the id");

				return that.oView;
			});

		//Act
		var oReturnValue = this.oRouter.getView("foo", "bar", "baz");

		//Assert
		assert.strictEqual(oReturnValue, this.oView, "the view was created");
		assert.strictEqual(fnStub.callCount, 1, "the stub was invoked");
	});


	QUnit.test("Should set a view to the cache", function (assert) {
		var oReturnValue,
			fnStub = this.stub(View, "_legacyCreate").callsFake(function () {
				return this.oView;
			});

		//Act
		oReturnValue = this.oRouter.setView("foo.bar", this.oView);
		var oRetrievedView = this.oRouter.getView("foo.bar", "bar");

		//Assert
		assert.strictEqual(oRetrievedView, this.oView, "the view was returned");
		assert.strictEqual(oReturnValue, this.oRouter, "able to chain this function");
		assert.strictEqual(fnStub.callCount, 0, "the stub not invoked - view was loaded from the cache");
	});


	QUnit.module("events", {
		beforeEach: function () {
			// System under test + Arrange
			this.oRouter = fnCreateRouter();
		},
		afterEach: function () {
			this.oRouter.destroy();
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
			oAttachReturnValue = this.oRouter.attachViewCreated(oData, fnEventSpy, oListener);

		// Act
		oFireReturnValue = this.oRouter.fireViewCreated(oParameters);
		oDetachReturnValue = this.oRouter.detachViewCreated(fnEventSpy, oListener);
		this.oRouter.fireViewCreated();

		// Assert
		assert.strictEqual(fnEventSpy.callCount, 1, "did call the attach spy only once");
		assert.strictEqual(oAttachReturnValue, this.oRouter, "did return this for chaining for attach");
		assert.strictEqual(oDetachReturnValue, this.oRouter, "did return this for chaining for detach");
		assert.strictEqual(oFireReturnValue, this.oRouter, "did return this for chaining for fire");
	});

	QUnit.test("Should fire the view created event if a view is created", function (assert) {
		// Arrange
		var oView = createXmlView(),
			sViewType = "XML",
			sViewName = "foo",
			oParameters,
			fnEventSpy = this.spy(function (oEvent) {
				oParameters = oEvent.getParameters();
			});

		this.stub(View, "_legacyCreate").callsFake(function () {
			return oView;
		});

		this.oRouter.attachViewCreated(fnEventSpy);

		// Act
		/*var oReturnValue = */ this.oRouter.getView(sViewName, sViewType);

		// Assert
		assert.strictEqual(fnEventSpy.callCount, 1, "The view created event was fired");
		assert.strictEqual(oParameters.view, oView, "Did pass the view to the event parameters");
		assert.strictEqual(oParameters.viewName, sViewName, "Did pass the viewName to the event parameters");
		assert.strictEqual(oParameters.type, sViewType, "Did pass the viewType to the event parameters");
	});

	QUnit.module("titleChanged event", {
		beforeEach: function() {
			HashChanger.getInstance().setHash("");
			this.oApp = new App();
			this.sPattern = "anything";
			this.sTitle = "myTitle";

			var oView = createXmlView();
			this.fnStub = sinon.stub(View, "_legacyCreate").callsFake(function () {
				return oView;
			});

			this.oDefaults = {
				// only shells will be used
				controlAggregation: "pages",
				viewName: "foo",
				controlId: this.oApp.getId(),
				async: true
			};

		},
		afterEach: function() {
			this.fnStub.restore();
			this.oRouter.destroy();
		}
	});

	QUnit.test("should be able to fire/attach/detach the titleChanged event", function(assert) {
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
			oAttachReturnValue;

		this.oRouterConfig = {
			routeName : {
				pattern : this.sPattern,
				target: "home"
			}
		};

		this.oTargetConfig = {
			home: {
				title: this.sTitle
			}
		};
		this.oRouter = new Router(this.oRouterConfig, this.oDefaults, null, this.oTargetConfig);
		this.oRouter.initialize();
		oAttachReturnValue = this.oRouter.attachTitleChanged(oData, fnEventSpy, oListener);

		// Act
		oFireReturnValue = this.oRouter.fireTitleChanged(oParameters);
		oDetachReturnValue = this.oRouter.detachTitleChanged(fnEventSpy, oListener);
		this.oRouter.fireTitleChanged(oParameters);

		// Assert
		assert.strictEqual(fnEventSpy.callCount, 1, "did call the attach spy only once");
		assert.strictEqual(oAttachReturnValue, this.oRouter, "did return this for chaining for attach");
		assert.strictEqual(oDetachReturnValue, this.oRouter, "did return this for chaining for detach");
		assert.strictEqual(oFireReturnValue, this.oRouter, "did return this for chaining for fire");
	});

	QUnit.test("Should fire the titleChanged event if the matched route has a target with title defined", function (assert) {
		// Arrange
		var oParameters,
			fnEventSpy = this.spy(function (oEvent) {
				oParameters = oEvent.getParameters();
			}),
			oRouteMatchedSpy;

		this.oRouterConfig = {
			routeName : {
				pattern : this.sPattern,
				target: "home"
			}
		};

		this.oTargetConfig = {
			home: {
				title: this.sTitle
			}
		};
		this.oRouter = new Router(this.oRouterConfig, this.oDefaults, null, this.oTargetConfig);

		oRouteMatchedSpy = this.spy(this.oRouter.getRoute("routeName"), "_routeMatched");

		this.oRouter.initialize();

		this.oRouter.attachTitleChanged(fnEventSpy);

		// Act
		this.oRouter.oHashChanger.setHash(this.sPattern);

		sinon.assert.called(oRouteMatchedSpy);
		return oRouteMatchedSpy.returnValues[0].then(function() {
			// Assert
			assert.strictEqual(fnEventSpy.callCount, 1, "The titleChanged event was fired");
			assert.strictEqual(oParameters.title, this.sTitle, "Did pass title value to the event parameters");
		}.bind(this));
	});

	QUnit.test("Should fire the titleChanged event if the matched route has a title defined", function (assert) {
		// Arrange
		var oParameters,
			fnEventSpy = this.spy(function (oEvent) {
				oParameters = oEvent.getParameters();
			}), oRouteMatchedSpy;

		this.oRouterConfig = {
			routeName : {
				pattern : this.sPattern,
				target: ["home", "titleTarget"],
				titleTarget: "titleTarget"
			}
		};

		this.oTargetConfig = {
			home: {
				title: "foo"
			},
			titleTarget: {
				title: this.sTitle
			}
		};
		this.oRouter = new Router(this.oRouterConfig, this.oDefaults, null, this.oTargetConfig);

		oRouteMatchedSpy = this.spy(this.oRouter.getRoute("routeName"), "_routeMatched");

		this.oRouter.initialize();

		this.oRouter.attachTitleChanged(fnEventSpy);

		// Act
		this.oRouter.oHashChanger.setHash(this.sPattern);

		sinon.assert.called(oRouteMatchedSpy);
		return oRouteMatchedSpy.returnValues[0].then(function() {
			// Assert
			assert.strictEqual(fnEventSpy.callCount, 1, "The titleChanged event was fired");
			assert.strictEqual(oParameters.title, this.sTitle, "Did pass title value to the event parameters");
		}.bind(this));
	});

	QUnit.test("Should fire the titleChanged only on the active route", function (assert) {
		// Arrange
		var oParameters,
			fnEventSpy = this.spy(function (oEvent) {
				oParameters = oEvent.getParameters();
			}),
			sTitle = "title",
			sTitle1 = "title1",
			sPattern = "pattern",
			sPattern1 = "pattern1",
			oTarget,
			oRouteMatchedSpy,
			oSequencePromise;

		this.oRouterConfig = {
			route1 : {
				pattern : sPattern,
				target: "target"
			},
			route2 : {
				pattern : sPattern1,
				target: "target1"
			}
		};

		this.oTargetConfig = {
			target: {
				title: sTitle
			},
			target1: {
				title: sTitle1
			}
		};
		this.oRouter = new Router(this.oRouterConfig, this.oDefaults, null, this.oTargetConfig);
		oRouteMatchedSpy = this.spy(this.oRouter.getRoute("route1"), "_routeMatched");
		this.oRouter.initialize();

		this.oRouter.attachTitleChanged(fnEventSpy);

		// Act
		this.oRouter.oHashChanger.setHash(sPattern);

		sinon.assert.called(oRouteMatchedSpy);
		oSequencePromise = oRouteMatchedSpy.returnValues[0].then(function() {
			// Assert
			assert.strictEqual(fnEventSpy.callCount, 1, "The titleChanged event was fired");
			assert.strictEqual(oParameters.title, sTitle, "Did pass title value to the event parameters");
		});

		return oSequencePromise.then(function() {
			oRouteMatchedSpy = this.spy(this.oRouter.getRoute("route2"), "_routeMatched");
			// Act
			this.oRouter.oHashChanger.setHash(sPattern1);
			sinon.assert.called(oRouteMatchedSpy);

			return oRouteMatchedSpy.returnValues[0].then(function() {
				// Assert
				assert.strictEqual(fnEventSpy.callCount, 2, "The titleChanged event was fired on the matched route");
				assert.strictEqual(oParameters.title, sTitle1, "Did pass title value to the event parameters");

				oTarget = this.oRouter.getTarget("target");
				oTarget.fireTitleChanged({title: "foo"});
				assert.strictEqual(fnEventSpy.callCount, 2, "The titleChanged event wasn't fired again");
			}.bind(this));
		}.bind(this));
	});

	QUnit.module("title history", {
		beforeEach: function() {
			// reset hash
			HashChanger.getInstance().setHash("");

			this.oApp = new App();

			var oView = createXmlView();
			this.fnStub = sinon.stub(View, "_legacyCreate").callsFake(function () {
				return oView;
			});

			this.getRouteMatchedSpy = function(oRouteMatchedSpies, sRouteName) {
				oRouteMatchedSpies[sRouteName] = sinon.spy(this.oRouter.getRoute(sRouteName), "_routeMatched");
				return oRouteMatchedSpies;
			}.bind(this);

			this.oDefaults = {
				// only shells will be used
				controlAggregation: "pages",
				viewName: "foo",
				controlId: this.oApp.getId(),
				async: true
			};

		},
		afterEach: function() {
			this.fnStub.restore();
			this.oRouter.destroy();
			for (var sKey in this.oRouteMatchedSpies) {
				this.oRouteMatchedSpies[sKey].restore();
			}
		}
	});

	QUnit.test("title history", function(assert) {
		// Arrange
		var done = assert.async(),
			oParameters,
			sHomeTitle = "HOME",
			sProductTitle = "PRODUCT",
			sProductDetailTitle = "PRODUCT_DETAIL",
			fnEventSpy = this.spy(function (oEvent) {
				oParameters = oEvent.getParameters();
			});

		this.oRouterConfig = {
			home: {
				pattern: "",
				target: "home"
			},
			product : {
				pattern : "product",
				target: "product"
			},
			productDetail : {
				pattern : "productDetail",
				target: "productDetail"
			}
		};

		this.oTargetConfig = {
			home: {
				title: sHomeTitle
			},
			product: {
				title: sProductTitle
			},
			productDetail: {
				title: sProductDetailTitle
			}
		};
		this.oRouter = new Router(this.oRouterConfig, this.oDefaults, null, this.oTargetConfig);

		this.oRouteMatchedSpies = Object.keys(this.oRouterConfig).reduce(this.getRouteMatchedSpy, {});

		this.oRouter.attachTitleChanged(fnEventSpy);

		// Act
		this.oRouter.initialize();

		var that = this;

		sinon.assert.calledOnce(that.oRouteMatchedSpies["home"]);
		that.oRouteMatchedSpies["home"].returnValues[0].then(function() {
			// Assert
			assert.strictEqual(fnEventSpy.callCount, 1, "titleChanged event is fired");
			assert.strictEqual(oParameters.title, sHomeTitle, "Did pass title value to the event parameters");
			assert.deepEqual(oParameters.history, [], "history state is currently empty");
			// Act
			that.oRouter.navTo("product");
			sinon.assert.calledOnce(that.oRouteMatchedSpies["product"]);
			that.oRouteMatchedSpies["product"].returnValues[0].then(function() {
				// Assert
				assert.strictEqual(fnEventSpy.callCount, 2, "titleChanged event is fired again");
				assert.strictEqual(oParameters.title, sProductTitle, "Did pass title value to the event parameters");
				assert.deepEqual(oParameters.history, [{
					hash: "",
					title: sHomeTitle
				}], "history state is currently empty");
				// Act
				that.oRouter.navTo("productDetail");
				sinon.assert.calledOnce(that.oRouteMatchedSpies["productDetail"]);
				that.oRouteMatchedSpies["productDetail"].returnValues[0].then(function() {
					// Assert
					assert.strictEqual(fnEventSpy.callCount, 3, "titleChanged event is fired again");
					assert.strictEqual(oParameters.title, sProductDetailTitle, "Did pass title value to the event parameters");
					assert.equal(oParameters.history.length, 2, "history was updated only once");
					assert.deepEqual(oParameters.history[oParameters.history.length - 1], {
						hash: "product",
						title: sProductTitle
					}, "history state is currently empty");
					// Act
					window.history.go(-1);
					that.oRouter.getRoute("product").attachMatched(function() {
						sinon.assert.calledTwice(that.oRouteMatchedSpies["product"]);
						that.oRouteMatchedSpies["product"].returnValues[1].then(function() {
							// Assert
							assert.strictEqual(fnEventSpy.callCount, 4, "titleChanged event is fired again");
							assert.strictEqual(oParameters.title, sProductTitle, "Did pass title value to the event parameters");
							assert.equal(oParameters.history.length, 1, "history was updated only once");
							assert.deepEqual(oParameters.history, [{
								hash: "",
								title: sHomeTitle
							}], "history state is currently empty");
							done();
						});
					});
				});
			});
		});
	});

	QUnit.test("avoid title history redundancy", function(assert) {
		// Arrange
		var that = this,
			oParameters,
			sHomeTitle = "HOME",
			sProductTitle = "PRODUCT",
			sProductDetailTitle = "PRODUCT_DETAIL",
			fnEventSpy = this.spy(function (oEvent) {
				oParameters = oEvent.getParameters();
			});

		this.oRouterConfig = {
			home: {
				pattern: "",
				target: "home"
			},
			product : {
				pattern : "product",
				target: "product"
			},
			productDetail : {
				pattern : "productDetail",
				target: "productDetail"
			}
		};

		this.oTargetConfig = {
			home: {
				title: sHomeTitle
			},
			product: {
				title: sProductTitle
			},
			productDetail: {
				title: sProductDetailTitle
			}
		};
		this.oRouter = new Router(this.oRouterConfig, this.oDefaults, null, this.oTargetConfig);

		this.oRouteMatchedSpies = Object.keys(this.oRouterConfig).reduce(this.getRouteMatchedSpy, {});

		this.oRouter.attachTitleChanged(fnEventSpy);

		return Promise.resolve().then(function() {

			// Act
			that.oRouter.initialize();

			sinon.assert.calledOnce(that.oRouteMatchedSpies["home"]);
			return that.oRouteMatchedSpies["home"].returnValues[0].then(function() {
				// Assert
				assert.strictEqual(fnEventSpy.callCount, 1, "titleChanged event is fired");
				assert.strictEqual(oParameters.title, sHomeTitle, "Did pass title value to the event parameters");
				assert.deepEqual(oParameters.history, [], "history state is currently empty");
			});

		}).then(function() {

			// Act
			that.oRouter.navTo("product");

			sinon.assert.calledOnce(that.oRouteMatchedSpies["product"]);
			return that.oRouteMatchedSpies["product"].returnValues[0].then(function() {
				// Assert
				assert.strictEqual(fnEventSpy.callCount, 2, "titleChanged event is fired again");
				assert.strictEqual(oParameters.title, sProductTitle, "Did pass title value to the event parameters");
				assert.deepEqual(oParameters.history, [{
					hash: "",
					title: sHomeTitle
				}], "history state is correctly updated");
			});

		}).then(function() {

			// Act
			that.oRouter.navTo("productDetail");

			sinon.assert.calledOnce(that.oRouteMatchedSpies["productDetail"]);
			return that.oRouteMatchedSpies["productDetail"].returnValues[0].then(function() {
				// Assert
				assert.strictEqual(fnEventSpy.callCount, 3, "titleChanged event is fired again");
				assert.strictEqual(oParameters.title, sProductDetailTitle, "Did pass title value to the event parameters");
				assert.equal(oParameters.history.length, 2, "history was updated only once");
				assert.deepEqual(oParameters.history[oParameters.history.length - 1], {
					hash: "product",
					title: sProductTitle
				}, "history state is correctly updated");
			});

		}).then(function() {

			// Act
			that.oRouter.navTo("home");

			sinon.assert.calledTwice(that.oRouteMatchedSpies["home"]);
			return that.oRouteMatchedSpies["home"].returnValues[1].then(function() {
				// Assert
				assert.strictEqual(fnEventSpy.callCount, 4, "titleChanged event is fired again");
				assert.strictEqual(oParameters.title, sHomeTitle, "Did pass title value to the event parameters");
				assert.equal(oParameters.history.length, 2, "history was updated only once");
				assert.deepEqual(oParameters.history[oParameters.history.length - 1], {
					hash: "productDetail",
					title: sProductDetailTitle
				}, "history state is correctly updated");
			});

		});
	});

	QUnit.test("Replace the last history instead of inserting new one when hash is replaced", function(assert) {
		// Arrange
		var oParameters,
			sHomeTitle = "HOME",
			sProductTitle = "PRODUCT",
			sProductDetailTitle = "PRODUCT_DETAIL",
			fnEventSpy = this.spy(function (oEvent) {
				oParameters = oEvent.getParameters();
			});

		this.oRouterConfig = {
			home: {
				pattern: "",
				target: "home"
			},
			product : {
				pattern : "product",
				target: "product"
			},
			productDetail : {
				pattern : "productDetail",
				target: "productDetail"
			}
		};

		this.oTargetConfig = {
			home: {
				title: sHomeTitle
			},
			product: {
				title: sProductTitle
			},
			productDetail: {
				title: sProductDetailTitle
			}
		};
		this.oRouter = new Router(this.oRouterConfig, this.oDefaults, null, this.oTargetConfig);

		this.oRouteMatchedSpies = Object.keys(this.oRouterConfig).reduce(this.getRouteMatchedSpy, {});

		this.oRouter.attachTitleChanged(fnEventSpy);

		// Act
		this.oRouter.initialize();

		var that = this;

		sinon.assert.calledOnce(that.oRouteMatchedSpies["home"]);
		return that.oRouteMatchedSpies["home"].returnValues[0].then(function() {
			// Assert
			assert.strictEqual(fnEventSpy.callCount, 1, "titleChanged event is fired");
			assert.strictEqual(oParameters.title, sHomeTitle, "Did pass title value to the event parameters");
			assert.deepEqual(oParameters.history, [], "history state is currently empty");

			// Act
			that.oRouter.navTo("product");
			sinon.assert.calledOnce(that.oRouteMatchedSpies["product"]);
			return that.oRouteMatchedSpies["product"].returnValues[0].then(function() {
				// Assert
				assert.strictEqual(fnEventSpy.callCount, 2, "titleChanged event is fired again");
				assert.strictEqual(oParameters.title, sProductTitle, "Did pass title value to the event parameters");
				assert.deepEqual(oParameters.history, [{
					hash: "",
					title: sHomeTitle
				}], "history state is correctly updated");

				// Act
				that.oRouter.navTo("productDetail", null, true);
				sinon.assert.calledOnce(that.oRouteMatchedSpies["productDetail"]);
				return that.oRouteMatchedSpies["productDetail"].returnValues[0].then(function() {
					// Assert
					assert.strictEqual(fnEventSpy.callCount, 3, "titleChanged event is fired again");
					assert.strictEqual(oParameters.title, sProductDetailTitle, "Did pass title value to the event parameters");
					assert.equal(oParameters.history.length, 1, "history was updated only once");
					assert.deepEqual(oParameters.history[oParameters.history.length - 1], {
						hash: "",
						title: sHomeTitle
					}, "history state is correctly updated");
				});
			});
		});
	});

	QUnit.test("titleChanged event is fired before next navigation shouldn't create new history entry", function(assert) {
		// Arrange
		var oParameters,
			sHomeTitle = "homeTitle",
			sNewTitle = "newTitle",
			fnEventSpy = this.spy(function (oEvent) {
				oParameters = oEvent.getParameters();
			}),
			oModel = new JSONModel({
				title: sHomeTitle
			});

		this.oApp.setModel(oModel);

		this.oRouterConfig = {
			home: {
				pattern: "",
				target: "home"
			}
		};

		this.oTargetConfig = {
			home: {
				title: "{/title}"
			}
		};

		this.oRouter = new Router(this.oRouterConfig, this.oDefaults, null, this.oTargetConfig);

		this.oRouteMatchedSpies = Object.keys(this.oRouterConfig).reduce(this.getRouteMatchedSpy, {});

		this.oRouter.attachTitleChanged(fnEventSpy);

		// Act
		this.oRouter.initialize();

		sinon.assert.calledOnce(this.oRouteMatchedSpies["home"]);
		return this.oRouteMatchedSpies["home"].returnValues[0].then(function() {
			assert.ok(fnEventSpy.calledOnce, "titleChanged event is fired");
			assert.equal(oParameters.title, sHomeTitle, "title parameter is set");
			assert.equal(oParameters.history.length, 0, "No new history entry is created");
			assert.equal(this.oRouter._aHistory[0].title, sHomeTitle, "title is updated in title history stack");

			oModel.setProperty("/title", sNewTitle);
			assert.ok(fnEventSpy.calledTwice, "titleChanged event is fired again");
			assert.equal(oParameters.title, sNewTitle, "title parameter is set");
			assert.equal(oParameters.history.length, 0, "No new history entry is created");
			assert.equal(this.oRouter._aHistory[0].title, sNewTitle, "title is updated in title history stack");
		}.bind(this));
	});

	QUnit.test("Back navigation from target w/o title should not remove history entry", function(assert) {
		// Arrange
		var done = assert.async(),
			oParameters,
			sHomeTitle = "HOME",
			sProductTitle = "PRODUCT",
			fnEventSpy = this.spy(function (oEvent) {
				oParameters = oEvent.getParameters();
			});

		this.oRouterConfig = {
			home: {
				pattern: "",
				target: "home"
			},
			product : {
				pattern : "product",
				target: "product"
			},
			productDetail : {
				pattern : "productDetail",
				target: "productDetailNoTitle"
			}
		};

		this.oTargetConfig = {
			home: {
				title: sHomeTitle
			},
			product: {
				title: sProductTitle
			},
			productDetailNoTitle: {
			}
		};
		this.oRouter = new Router(this.oRouterConfig, this.oDefaults, null, this.oTargetConfig);

		this.oRouteMatchedSpies = Object.keys(this.oRouterConfig).reduce(this.getRouteMatchedSpy, {});

		this.oRouter.attachTitleChanged(fnEventSpy);

		var that = this;

		// Act
		that.oRouter.initialize();
		sinon.assert.calledOnce(that.oRouteMatchedSpies["home"]);
		return that.oRouteMatchedSpies["home"].returnValues[0].then(function() {
			that.oRouter.navTo("product");
			sinon.assert.calledOnce(that.oRouteMatchedSpies["product"]);
			return that.oRouteMatchedSpies["product"].returnValues[0].then(function() {
				that.oRouter.navTo("productDetail");
				sinon.assert.calledOnce(that.oRouteMatchedSpies["productDetail"]);
				return that.oRouteMatchedSpies["productDetail"].returnValues[0].then(function() {
					assert.strictEqual(fnEventSpy.callCount, 2, "titleChanged event is fired twice");
					window.history.go(-1);

					// Assert
					that.oRouter.attachRouteMatched(function() {
						assert.strictEqual(fnEventSpy.callCount, 2, "titleChanged event isn't fired again");
						assert.strictEqual(oParameters.title, sProductTitle, "Did pass title value to the event parameters");
						assert.equal(oParameters.history.length, 1, "history entry was not removed");
						assert.deepEqual(oParameters.history[oParameters.history.length - 1], {
							hash: "",
							title: sHomeTitle
						}, "history state is correctly updated");
						done();
					});
				});
			});
		});
	});

	QUnit.test("getTitleHistory", function(assert) {
		// Arrange
		var sHomeTitle = "HOME";

		this.oRouterConfig = {
			home: {
				pattern: "",
				target: "home"
			}
		};

		this.oTargetConfig = {
			home: {
				title: sHomeTitle
			}
		};
		this.oRouter = new Router(this.oRouterConfig, this.oDefaults, null, this.oTargetConfig);
		this.oRouteMatchedSpies = Object.keys(this.oRouterConfig).reduce(this.getRouteMatchedSpy, {});

		// Act
		this.oRouter.initialize();
		sinon.assert.calledOnce(this.oRouteMatchedSpies["home"]);
		return this.oRouteMatchedSpies["home"].returnValues[0].then(function() {
			// Assert
			var aHistoryRef = {
				hash: "",
				title: "HOME"
			};
			assert.deepEqual(this.oRouter.getTitleHistory()[0], aHistoryRef);
		}.bind(this));

	});

	QUnit.test("home route declaration", function(assert) {
		// Arrange
		var sHomeTitle = "HOME",
			sProductTitle = "PRODUCT",
			done = assert.async(),
			oParameters,
			fnEventSpy = this.spy(function (oEvent) {
				oParameters = oEvent.getParameters();
			});

		this.oRouterConfig = {
			home : {
				pattern: "",
				target: "home"
			},
			product : {
				pattern : "product",
				target: "product"
			}
		};

		this.oTargetConfig = {
			home: {
				title: sHomeTitle
			},
			product: {
				title: sProductTitle
			}
		};

		this.oDefaults = {
			// only shells will be used
			controlAggregation: "pages",
			viewName: "foo",
			controlId: this.oApp.getId(),
			homeRoute: "home",
			async: true
		};

		this.oOwner = {
			getManifestEntry: function() {
				return "HOME";
			},
			getId: function() {
				return "component1";
			}
		};


		hasher.setHash(this.oRouterConfig.product.pattern);

		this.oRouter = new Router(this.oRouterConfig, this.oDefaults, null, this.oTargetConfig);
		this.oRouter._oOwner = this.oOwner;
		this.oRouteMatchedSpies = Object.keys(this.oRouterConfig).reduce(this.getRouteMatchedSpy, {});

		this.oRouter.attachTitleChanged(fnEventSpy);

		// Act
		this.oRouter.initialize();

		return this.oRouteMatchedSpies["product"].returnValues[0].then(function() {
			// Assert
			var aHistoryRef = {
				hash: "",
				isHome: true,
				title: "HOME"
			};

			assert.deepEqual(this.oRouter.getTitleHistory()[0], aHistoryRef, "Home route attached to history.");
			assert.strictEqual(this.oRouter.getTitleHistory().length, 2, "Product route attached to history");
			assert.strictEqual(fnEventSpy.callCount, 1, "titleChanged event is fired.");
			assert.strictEqual(oParameters.title, sProductTitle, "Did pass title value to the event parameters");
			assert.deepEqual(oParameters.history[oParameters.history.length - 1], aHistoryRef, "history state is correctly updated");
			done();

		}.bind(this));
	});

	QUnit.test("Home Route declaration with dynamic parts", function(assert) {
		// Arrange
		var sHomeTitle = "HOME",
			sProductTitle = "PRODUCT",
			oParameters,
			fnEventSpy = this.spy(function (oEvent) {
				oParameters = oEvent.getParameters();
			});

		this.oRouterConfig = {
			home : {
				pattern: "home/{testid}",
				target: "home"
			},
			product : {
				pattern : "/product",
				target: "product"
			}
		};

		this.oTargetConfig = {
			home: {
				title: sHomeTitle
			},
			product: {
				title: sProductTitle
			}
		};

		this.oDefaults = {
			// only shells will be used
			controlAggregation: "pages",
			viewName: "foo",
			controlId: this.oApp.getId(),
			homeRoute: "home",
			async: true
		};
		this.spy = sinon.spy(Log, "error");

		this.oRouter = new Router(this.oRouterConfig, this.oDefaults, null, this.oTargetConfig);

		this.oRouteMatchedSpies = Object.keys(this.oRouterConfig).reduce(this.getRouteMatchedSpy, {});

		this.oRouter.attachTitleChanged(fnEventSpy);

		hasher.setHash(this.oRouterConfig.product.pattern);

		// Act
		this.oRouter.initialize();

		return this.oRouteMatchedSpies["product"].returnValues[0].then(function() {
			// Assert
			sinon.assert.calledWith(this.spy, "Routes with dynamic parts cannot be resolved as home route.");
			assert.strictEqual(oParameters.history.length, 0, "Home route shouldn't be added to history.");
			assert.deepEqual(this.oRouter.getTitleHistory()[0], {
				hash: "/product",
				title: "PRODUCT"
			}, "Product route is added to history.");
			assert.strictEqual(fnEventSpy.callCount, 1, "titleChanged event is fired.");
			assert.strictEqual(oParameters.title, sProductTitle, "Did pass product title value to the event parameters");
			this.spy.restore();
		}.bind(this));
	});

	QUnit.test("App home indicator for later navigations", function(assert) {
		// Arrange
		var sHomeTitle = "HOME",
			sProductTitle = "PRODUCT",
			done = assert.async();

		this.oRouterConfig = {
			home : {
				pattern: "",
				target: "home"
			},
			product : {
				pattern : "/product",
				target: "product"
			}
		};

		this.oTargetConfig = {
			home: {
				title: sHomeTitle
			},
			product: {
				title: sProductTitle
			}
		};

		this.oDefaults = {
			// only shells will be used
			controlAggregation: "pages",
			viewName: "foo",
			controlId: this.oApp.getId(),
			homeRoute: "home",
			async: true
		};

		this.oRouter = new Router(this.oRouterConfig, this.oDefaults, null, this.oTargetConfig);

		hasher.setHash(this.oRouterConfig.product.pattern);

		this.oRouter.attachTitleChanged(function() {

			if (arguments[0].mParameters.name !== "home") {
				hasher.setHash(this.oRouterConfig.home.pattern);
			} else {
				// Assert
				assert.strictEqual(arguments[0].mParameters.history.length, 2, "Home and Product route should be added to history.");
				assert.strictEqual(arguments[0].mParameters.isHome, true);
				assert.strictEqual(arguments[0].mParameters.history[0].isHome, true);
				assert.strictEqual(this.oRouter.getTitleHistory()[0].isHome, true);
				done();
			}

		}.bind(this));

		// Act
		this.oRouter.initialize();
	});

	QUnit.test("App home indicator for later navigations with dynamic parts", function(assert) {
		// Arrange
		var sHomeTitle = "HOME",
			sProductTitle = "PRODUCT",
			done = assert.async();

		this.oRouterConfig = {
			home : {
				pattern: "home/{testId}",
				target: "home"
			},
			product : {
				pattern : "/product",
				target: "product"
			}
		};

		this.oTargetConfig = {
			home: {
				title: sHomeTitle
			},
			product: {
				title: sProductTitle
			}
		};

		this.oDefaults = {
			// only shells will be used
			controlAggregation: "pages",
			viewName: "foo",
			controlId: this.oApp.getId(),
			homeRoute: "home",
			async: true
		};

		this.oRouter = new Router(this.oRouterConfig, this.oDefaults, null, this.oTargetConfig);

		hasher.setHash(this.oRouterConfig.product.pattern);

		this.oRouter.attachTitleChanged(function() {

			var oRefProductRoute = {
				"hash": "/product",
				"title": "PRODUCT"
			};

			var oRefHomeRoute = {
				"hash": "home/{testId}",
				"title": "HOME"
			};

			if (arguments[0].mParameters.name !== "home") {
				hasher.setHash(this.oRouterConfig.home.pattern);
			} else {
				// Assert
				assert.strictEqual(arguments[0].mParameters.history.length, 1, "Product route should be added to history.");
				assert.deepEqual(this.oRouter.getTitleHistory()[0], oRefProductRoute);
				assert.deepEqual(this.oRouter.getTitleHistory()[1], oRefHomeRoute);
				assert.strictEqual(this.oRouter.getTitleHistory().length, 2, "Home route should be added to history.");
				done();
			}
		}.bind(this));

		// Act
		this.oRouter.initialize();
	});

	QUnit.module("component");

	QUnit.test("Should create a view with an component", function (assert) {
		// Arrange
		var oUIComponent = new UIComponent({}),
			fnOwnerSpy = this.spy(oUIComponent, "runAsOwner"),
			oView = createXmlView(),
			oRouter = fnCreateRouter({}, {}, oUIComponent),
			fnViewStub = this.stub(View, "_legacyCreate").callsFake(function () {
				return oView;
			});

		// Act
		oRouter.getView("XML", "foo");

		// Assert
		assert.strictEqual(fnOwnerSpy.callCount, 1, "Did run with owner");
		assert.ok(fnOwnerSpy.calledBefore(fnViewStub), "Did invoke the owner function before creating the view");

		// Cleanup
		oRouter.destroy();
	});

	QUnit.module("targets", {
		beforeEach: function () {
			this.oShell = new ShellSubstitute();
			this.oChildShell = new ShellSubstitute();
			this.oSecondShell = new ShellSubstitute();
			this.sPattern = "anything";

			this.oDefaults = {
				viewType: "XML",
				// we stub the view creation
				viewPath: "bar",
				viewName: "foo",
				// only shells will be used
				controlAggregation: "content"
			};

			this.oRouterConfig = {
				routeName : {
					pattern : this.sPattern
				}
			};
		},
		afterEach: function () {
			this.oRouter.destroy();
			this.oShell.destroy();
			this.oChildShell.destroy();
			this.oSecondShell.destroy();
		}
	});

	QUnit.test("Should display a target referenced by a route", function (assert) {
		// Arrange
		this.stub(Views.prototype, "_getView").callsFake(function () {
			return createXmlView();
		});

		var oTargetConfig = {
			myTarget : {
				controlId: this.oShell.getId()
			}
		};
		this.oRouterConfig.routeName.target = "myTarget";

		// System under test
		this.oRouter = fnCreateRouter(this.oRouterConfig, this.oDefaults, null, oTargetConfig);
		var oPlaceSpy = this.spy(this.oRouter.getTarget("myTarget"), "_place");
		var oRouteMatchedSpy = this.spy(this.oRouter.getRoute("routeName"), "_routeMatched");


		// Act
		this.oRouter.parse(this.sPattern);

		return oRouteMatchedSpy.returnValues[0].then(function() {
			// Assert
			assert.strictEqual(this.oRouter._oTargets._oCache, this.oRouter._oViews, "Targets are using the same view repository");
			assert.strictEqual(this.oRouter._oTargets._oConfig, this.oDefaults, "Targets are using the same defaults as the router");

			assert.strictEqual(oPlaceSpy.callCount, 1, "Did place myTarget");
			sinon.assert.calledOn(oPlaceSpy, this.oRouter.getTarget("myTarget"));

			assert.strictEqual(this.oShell.getContent().length, 1, "Did place the view in the shell");
		}.bind(this));

	});

	QUnit.test("Should display multiple targets referenced by a route", function (assert) {
		// Arrange
		this.stub(Views.prototype, "_getView").callsFake(function () {
			return createXmlView();
		});

		var oTargetConfig = {
			myTarget : {
				controlId: this.oShell.getId()
			},
			secondTarget: {
				controlId: this.oSecondShell.getId()
			}
		};
		this.oRouterConfig.routeName.target = ["myTarget", "secondTarget"];

		// System under test
		this.oRouter = fnCreateRouter(this.oRouterConfig, this.oDefaults, null, oTargetConfig);
		var oPlaceMyTargetSpy = this.spy(this.oRouter.getTarget("myTarget"), "_place");
		var oPlaceSecondTargetSpy = this.spy(this.oRouter.getTarget("secondTarget"), "_place");
		var oRouteMatchedSpy = this.spy(this.oRouter.getRoute("routeName"), "_routeMatched");

		// Act
		this.oRouter.parse(this.sPattern);

		return oRouteMatchedSpy.returnValues[0].then(function() {
			// Assert
			assert.strictEqual(oPlaceMyTargetSpy.callCount, 1, "Did place first target");
			assert.strictEqual(oPlaceSecondTargetSpy.callCount, 1, "Did place second target");

			sinon.assert.calledOn(oPlaceMyTargetSpy, this.oRouter.getTarget("myTarget"));
			sinon.assert.calledOn(oPlaceSecondTargetSpy, this.oRouter.getTarget("secondTarget"));

			assert.strictEqual(this.oShell.getContent().length, 1, "Did place the view in the shell");
			assert.strictEqual(this.oSecondShell.getContent().length, 1, "Did place the view in the second shell");
		}.bind(this));
	});

	QUnit.test("Should display child targets referenced by a route", function (assert) {
		// Arrange
		this.stub(Views.prototype, "_getView").callsFake(function () {
			return createXmlView();
		});

		var oTargetConfig = {
			myTarget : {
				controlId: this.oShell.getId()
			},
			myChild : {
				parent: "myTarget",
				controlId: this.oSecondShell.getId()
			}
		};
		this.oRouterConfig.routeName.target = ["myChild"];

		// System under test
		this.oRouter = fnCreateRouter(this.oRouterConfig, this.oDefaults, null, oTargetConfig);
		// need to use sinon.spy instead of this.spy because this.spy is restored synchronously but this test
		// has timeout in it.
		var oPlaceSpy = this.spy(this.oRouter.getTarget("myChild"), "_place");
		var oPlaceParentSpy = this.spy(this.oRouter.getTarget("myTarget"), "_place");
		var oRouteMatchedSpy = this.spy(this.oRouter.getRoute("routeName"), "_routeMatched");

		// Act
		this.oRouter.parse(this.sPattern);

		assert.strictEqual(oRouteMatchedSpy.callCount, 1, "route is matched");

		return oRouteMatchedSpy.returnValues[0].then(function() {
			// Assert
			assert.strictEqual(this.oRouter._oTargets._oCache, this.oRouter._oViews, "Targets are using the same view repository");
			assert.strictEqual(this.oRouter._oTargets._oConfig, this.oDefaults, "Targets are using the same defaults as the router");

			assert.strictEqual(oPlaceSpy.callCount, 1, "Did place myChild");
			assert.strictEqual(oPlaceParentSpy.callCount, 1, "Did place myTarget");

			oPlaceParentSpy.returnValues[0].then(function(oViewInfo) {
				assert.strictEqual(oViewInfo.name, "myTarget");
			});

			oPlaceSpy.returnValues[0].then(function(oViewInfo) {
				assert.strictEqual(oViewInfo.name, "myChild");
			});

			sinon.assert.calledOn(oPlaceParentSpy, this.oRouter.getTarget("myTarget"));
			sinon.assert.calledOn(oPlaceSpy, this.oRouter.getTarget("myChild"));

			assert.strictEqual(this.oShell.getContent().length, 1, "Did place the view in the shell");
			assert.strictEqual(this.oSecondShell.getContent().length, 1, "Did place the view in the shell");
		}.bind(this));

	});

	QUnit.module("getTargets");

	QUnit.test("Should get the created targets instance", function (assert) {
		// System under test + arrange
		var oRouter = fnCreateRouter({}, {}, null, {});

		assert.strictEqual(oRouter.getTargets(), oRouter._oTargets, "Did return the Targets instance");
	});

	QUnit.test("Should return undefined if no targets where defined", function (assert) {

		// System under test + arrange
		var oRouter = fnCreateRouter();

		assert.strictEqual(oRouter.getTargets(), undefined, "Did not create a Targets instance");
	});

	QUnit.module("bypassed", {
		beforeEach: function () {
			HashChanger.getInstance().replaceHash("test");
		},
		afterEach: function () {
			this.oRouter.destroy();
			HashChanger.getInstance().replaceHash("");
		}
	});

	QUnit.test("Should attach and detach the bypassed event", function (assert) {
		// Arrange + System under test
		var oListener = {},
			oData = {},
			fnBypassed = this.spy(function (oEvent, oDataInner) {
				var oParameters = oEvent.getParameters();

				assert.strictEqual(this, oListener, "this pointer is correct");
				assert.strictEqual(oData, oDataInner, "the data was passed");
				assert.strictEqual(oParameters.hash, "test","the hash was passed");
			});

		this.oRouter = fnCreateRouter([
			{
				name: "bar",
				pattern: "bar"
			}
		]);

		// Act router does not have a route that matches the pattern set in the setup
		var oReturnValue = this.oRouter.attachBypassed(oData, fnBypassed, oListener);
		this.oRouter.initialize();

		//Assert
		assert.strictEqual(fnBypassed.callCount, 1, "Did call the callback function once");
		assert.strictEqual(this.oRouter, oReturnValue, "Able to chain attach");

		// Act no bypass
		this.oRouter.parse("bar");
		assert.strictEqual(fnBypassed.callCount, 1, "Did not call the callback function for no bypass");

		// Act detach
		oReturnValue = this.oRouter.detachBypassed(fnBypassed, oListener);
		this.oRouter.parse("foo");

		// Assert detach
		assert.strictEqual(fnBypassed.callCount, 1, "The function is still invoked once");
		assert.strictEqual(this.oRouter, oReturnValue, "Able to chain detach");
	});

	QUnit.test("Should create targets in the bypassed event", function (assert) {
		// Arrange
		this.oRouter = fnCreateRouter([], {
				viewType: "JS",
				view : "nonExistingView",
				bypassed : {
					target: ["foo", "bar"]
				}
			},
			null,
			{
				foo: {
				},
				bar: {
				}
			});

		var done = assert.async(),
			fnBypassed = this.spy(function() {
				assert.ok(true, "bypass event is fired");
				done();
			});

		this.oRouter.attachBypassed(fnBypassed);

		var fnDisplayFooStub = this.stub(this.oRouter.getTarget("foo"), "_display").callsFake(function() {
				return Promise.resolve();
			}),
			fnDisplayBarStub = this.stub(this.oRouter.getTarget("bar"), "_display").callsFake(function() {
				return Promise.resolve().then(function() {
					assert.strictEqual(fnBypassed.callCount, 0, "bypass event isn't fired yet");
				});
			});

		// Act
		this.oRouter.initialize();

		// Assert
		assert.strictEqual(fnDisplayFooStub.callCount, 1, "The foo target is displayed");
		assert.strictEqual(fnDisplayBarStub.callCount, 1, "The bar target is displayed");
		sinon.assert.calledWith(fnDisplayFooStub, sinon.match({ hash: "test"}));
		sinon.assert.calledWith(fnDisplayBarStub, sinon.match({ hash: "test"}));
	});

	QUnit.module("Bug fix in Crossroads");

	QUnit.test("slash should be optional when it's between ')' and ':'", function (assert) {
		var callCount = 0,
			fnMatched = function (oEvent) {
				if (oEvent.getParameter("name") === "test") {
					callCount++;
				}
			};

		var oRouter = fnCreateRouter([{
			name: "test",
			pattern: "product({id1})/:id2:"
		}]);

		var oRoute = oRouter.getRoute("test");
		var oRouteMatchedSpy = this.spy(oRoute, "_routeMatched");

		oRouter.attachRoutePatternMatched(fnMatched);

		// Act
		oRouter.initialize();
		oRouter.parse("product(1)");

		assert.strictEqual(oRouteMatchedSpy.callCount, 1, "_routeMatched is called");
		return oRouteMatchedSpy.returnValues[0].then(function() {
			// Assert
			assert.strictEqual(callCount, 1, "The route pattern matched handler should be called once");
			oRouter.destroy();
		});
	});

	QUnit.test("Hash 'page12' shouldn't match pattern 'page1/:context:'", function(assert) {
		var oRouter = fnCreateRouter([{
				name: "page1",
				pattern: "page1/:context:"
			}, {
				name: "page12",
				pattern: "page12/:context:"
			}]);

		var oRoute = oRouter.getRoute("page12");
		var oRouteMatchedSpy = this.spy(oRoute, "_routeMatched");

		// Act
		oRouter.initialize();
		oRouter.parse("page12");

		// Assert
		assert.strictEqual(oRouteMatchedSpy.callCount, 1, "_routeMatched is called");

		return oRouteMatchedSpy.returnValues[0].then(function() {
			oRouter.destroy();
		});
	});

	QUnit.test("Interpolate on pattern with multiple optional params", function(assert) {
		var oRouter = new Router([{
				name: "page1",
				pattern: "page1/:context:/:context1:"
			}]),
			sUrl;

		//Act
		sUrl = oRouter.getURL("page1", {
			context1: "context1"
		});

		assert.equal(sUrl, "page1//context1", "the URL should be correctly calculated");
	});

	QUnit.test("Correctly parse the hash with skipped optional params", function(assert) {
		var oRouter = fnCreateRouter([{
			name: "testWithOptionalParams",
			pattern: "test/:a:/:b:/:c:/:d:"
		}]);

		var oRoute = oRouter.getRoute("testWithOptionalParams");
		var oRouteMatchedSpy = this.spy(oRoute, "_routeMatched");

		// Act
		oRouter.initialize();
		oRouter.parse("test/1//3"); // {a: "1", c: "3"}
		oRouter.parse("test//2//4"); // {b: "2", d: "4"}
		oRouter.parse("test///3"); // {c: "3"}
		oRouter.parse("test/1///4"); // {a: "1", d: "4"}
		oRouter.parse("test////4"); // {d: "4"}

		// Assert
		assert.strictEqual(oRouteMatchedSpy.callCount, 5, "_routeMatched is called");
		var aExpected = [
			{a: "1", c: "3"},
			{b: "2", d: "4"},
			{c: "3"},
			{a: "1", d: "4"},
			{d: "4"}
		];
		var aCalls = oRouteMatchedSpy.getCalls();
		aCalls.forEach(function(oCall, index) {
			var oParam = oCall.args[0];
			// remove properties which are set with undefined
			// to easily compare it with the value in aExpected
			Object.keys(oParam).forEach(function(sKey) {
				if (oParam[sKey] === undefined) {
					delete oParam[sKey];
				}
			});
			assert.deepEqual(oParam, aExpected[index], "results parsed correctly");
		});

		return oRouteMatchedSpy.returnValues[aCalls.length - 1].then(function() {
			oRouter.destroy();
		});
	});

	QUnit.module("nested components", {
		beforeEach: function() {
			hasher.setHash("");
			var that = this;
			this.fnInitRouter = function() {
				UIComponent.prototype.init.apply(this, arguments);
				this._router = this.getRouter();
				this._router.initialize();
			};

			var ParentComponent,
				ChildComponent;

			ParentComponent = UIComponent.extend("namespace.ParentComponent", {
				metadata : {
					routing:  {
						config: {
							async: true
						},
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
				},
				init : that.fnInitRouter
			});

			ChildComponent = UIComponent.extend("namespace.ChildComponent", {
				metadata : {
					routing:  {
						config: {
							async: true
						},
						routes: [
							{
								pattern: "product/{id}",
								name: "product",
								parent: "namespace.ParentComponent:category"
							}
						]
					}
				},
				init : that.fnInitRouter
			});

			this.oParentComponent = new ParentComponent("parent");
		},
		afterEach: function () {
			this.oParentComponent.destroy();
			this.oChildComponent.destroy();
		}
	});

	QUnit.test("fire events", function(assert) {
		// Arrange
		var oParentRouteMatchedEvent,
			oParentRouteMatchedEventSpy = sinon.spy(function(oEvent) {
				// save the oEvent because EventProvider will overwrite it otherwise
				oParentRouteMatchedEvent = jQuery.extend(true, {}, oEvent);
			}),
			oParentRoutePatternMatchedEventSpy = sinon.spy(),
			oChildRouteMatchedEvent,
			oChildRouteMatchedEventSpy = sinon.spy(function(oEvent) {
				oChildRouteMatchedEvent = jQuery.extend(true, {}, oEvent);
			}),
			oChildRoutePatternMatchedEventSpy = sinon.spy(),
			oParentRoute = this.oParentComponent.getRouter().getRoute("category"),
			oChildRoute = this.oChildComponent.getRouter().getRoute("product"),
			oParentRouteMatchedSpy = sinon.spy(oParentRoute, "_routeMatched"),
			oChildRouteMatchedSpy = sinon.spy(oChildRoute, "_routeMatched");

		oParentRoute.attachMatched(oParentRouteMatchedEventSpy);
		oParentRoute.attachPatternMatched(oParentRoutePatternMatchedEventSpy);
		oChildRoute.attachMatched(oChildRouteMatchedEventSpy);
		oChildRoute.attachPatternMatched(oChildRoutePatternMatchedEventSpy);

		// Act
		hasher.setHash("category/0/product/0");

		// Assert
		assert.strictEqual(oParentRouteMatchedSpy.callCount, 1, "Parent should be matched");
		assert.strictEqual(oChildRouteMatchedSpy.callCount, 1, "Child is matched");

		return Promise.all([oParentRouteMatchedSpy.returnValues[0], oChildRouteMatchedSpy.returnValues[0]]).then(function() {
			assert.strictEqual(oParentRouteMatchedEventSpy.callCount, 1, "routeMatched fired for parent route");
			assert.strictEqual(oParentRoutePatternMatchedEventSpy.callCount, 0, "routePatternMatched not fired for parent route");
			assert.strictEqual(oParentRouteMatchedEvent.getParameter("nestedRoute"), oChildRoute, "childRoute is passed to event listeners");
			assert.strictEqual(oChildRouteMatchedEventSpy.callCount, 1, "routeMatched fired for child route");
			assert.strictEqual(oChildRoutePatternMatchedEventSpy.callCount, 1, "routePatternMatched fired for child route");
			assert.strictEqual(oChildRouteMatchedEvent.getParameter("nestedRoute"), undefined, "no route is passed to event listeners");
		});
	});

	QUnit.test("nesting for multiple components", function(assert) {
		// This is a pretty extensive test to cover any number of components being nested.
		// It covers also the scope of the previous test, but on a more generic level.

		// Arrange
		var that = this,
			iNumberOfComponents = 3,
			aComponents = [],
			aComponentInstances = [],
			aRoutes = [],
			aRouteMatchedSpies = [],
			aRouteMatchedEvents = [],
			aRouteMatchedEventSpies = [],
			aRoutePatternMatchedSpies = [],
			// We declare components in a function to be able to cover any number
			fnDeclareComponent = function(i, iDepth) {
				var Component = UIComponent.extend("namespace.Component" + i, {
					metadata : {
						routing:  {
							config: {
								async: true
							},
							routes: [
								{
									pattern: "route" + i + "/{id}",
									name: "route" + i,
									// set no parent for the (root-) route
									parent: (i != 0) ? "namespace.Component" + (( i - 1 ) + ":route" + ( i - 1 )) : undefined
								}
							]
						}
					},
					createContent: function() {
						// instantiate "child-"routes for all routes except the directly matched one
						if (i < (iDepth - 1)) {
							// store pointers to the instances for later usage
							aComponentInstances[i + 1] = new aComponents[i + 1]("component" + (i + 1));
							return sap.ui.jsview("view", {
								content: aComponentInstances[i + 1]
							});
						}
					},
					init : that.fnInitRouter
				});
				aComponents.push(Component);
			},
			fnDeclareComponents = function(iDepth) {
				for (var i = 0; i < iDepth; i++) {
					fnDeclareComponent(i, iDepth);
				}
				return aComponents[0];
			};

		// start instantion
		var Component = fnDeclareComponents(iNumberOfComponents);
		aComponentInstances[0] = new Component("component0");

		// Create spies and attach events for all component instances
		aComponentInstances.forEach(function(oComponent, i) {
			aRoutes[i] = oComponent.getRouter().getRoute("route" + i);
			aRouteMatchedEventSpies[i] = sinon.spy(function(oEvent) {
				// save the oEvent because EventProvider will overwrite it otherwise
				aRouteMatchedEvents[i] = jQuery.extend(true, {}, oEvent);
			});
			aRouteMatchedSpies[i] = sinon.spy(aRoutes[i], "_routeMatched");
			aRoutePatternMatchedSpies[i] = sinon.spy();
			aRoutes[i].attachMatched(aRouteMatchedEventSpies[i]);
			aRoutes[i].attachPatternMatched(aRoutePatternMatchedSpies[i]);
		});

		var sHash = "";
		for (var i = 0; i < iNumberOfComponents; i++) {
			sHash += "/route" + i + "/0";
		}

		// Act
		// remove the first slash as it will be implicitly added
		hasher.setHash(sHash.substring(1));

		var aPromises = aRouteMatchedSpies.map(function(oRouteMatchSpy) {
			assert.strictEqual(oRouteMatchSpy.callCount, 1, "_routeMatched is called");
			return oRouteMatchSpy.returnValues[0];
		});

		return Promise.all(aPromises).then(function() {
			// Assert
			aRouteMatchedEvents.forEach(function(oEvent, i, a) {
				if (i === a.length - 1) {
					assert.strictEqual(oEvent.getParameter("nestedRoute"), undefined, "no nested route is passed to the directly matched " + oEvent.getParameter("name"));
					assert.strictEqual(aRoutePatternMatchedSpies[i].callCount, 1, "pattern matched has been fired for the directly matched " + oEvent.getParameter("name"));
				} else {
					assert.strictEqual(oEvent.getParameter("nestedRoute"), aRoutes[i + 1], aRoutes[i + 1] + " nested route is passed to " + oEvent.getParameter("name"));
					assert.strictEqual(aRoutePatternMatchedSpies[i].callCount, 0, "pattern matched has not been fired for " + oEvent.getParameter("name"));
				}
			});

			// CleanUp
			aComponentInstances.forEach(function(oComponent) {
				oComponent.destroy();
			});
		});
	});

	var count = 0;
	QUnit.module("Router in nested component", {
		beforeEach: function() {
			this.oEventProviderStub = sinon.stub(EventProvider.prototype.oEventPool, "returnObject");
			hasher.setHash("");
			var that = this;
			this.fnInitRouter = function() {
				UIComponent.prototype.init.apply(this, arguments);
				this._router = this.getRouter();
				this._router.initialize();
			};

			sap.ui.jsview("rootView1", {
				createContent : function() {
					return new ShellSubstitute(this.createId("shell"));
				}
			});

			var ParentComponent;

			ParentComponent = UIComponent.extend("namespace1.ParentComponent" + count, {
				metadata : {
					rootView: {
						viewName: "rootView1",
						type: "JS",
						async: true
					},
					routing:  {
						config: {
							async: true
						},
						routes: [
							{
								pattern: "",
								name: "home",
								target: {
									name: "home",
									prefix: "child"
								}
							},
							{
								pattern: "category",
								name: "category"
							}
						],
						targets: {
							home: {
								name: "namespace1.ChildComponent" + count,
								type: "Component",
								controlId: "shell",
								controlAggregation: "content",
								options: {
									manifest: false
								}
							}
						}
					}
				},
				init : that.fnInitRouter
			});

			this.oNestedRouteMatchedSpy = sinon.spy();

			sap.ui.predefine("namespace1/ChildComponent" + count + "/Component", ["sap/ui/core/UIComponent"], function(UIComponent) {
				return UIComponent.extend("namespace1.ChildComponent", {
					metadata : {
						routing:  {
							config: {
								async: true
							},
							routes: [
								{
									pattern: "product/{id}",
									name: "product"
								},
								{
									pattern: "",
									name: "nestedHome"
								}
							]
						}
					},
					init : function() {
						UIComponent.prototype.init.apply(this, arguments);
						var oRouter = this.getRouter();

						oRouter.attachRouteMatched(that.oNestedRouteMatchedSpy);
						oRouter.initialize();
					}
				});
			});

			this.oParentComponent = new ParentComponent("parent");
		},
		afterEach: function () {
			this.oParentComponent.destroy();
			this.oEventProviderStub.restore();
			count++;
		}
	});

	QUnit.test("Should load and instantiate the nested component when the home route is matched", function(assert) {
		var that = this,
			oRouter = this.oParentComponent.getRouter();

		return new Promise(function(resolve, reject) {
			oRouter.getRoute("home").attachMatched(function() {
				var oContainer = that.oParentComponent.getRootControl(),
					oShell = oContainer.byId("shell");
				assert.equal(oShell.getContent().length, 1, "The nested component is loaded and placed into the aggregation");
				assert.ok(oShell.getContent()[0].isA("sap.ui.core.ComponentContainer"), "A component container is added to the target aggregation");

				var oNestedComponent = oShell.getContent()[0].getComponentInstance();
				assert.equal(oNestedComponent.getMetadata().getName(), "namespace1.ChildComponent", "The correct component is loaded and instantiated");
				assert.equal(that.oNestedRouteMatchedSpy.callCount, 1, "Route is matched once inside the nested component");

				var oEvent = that.oNestedRouteMatchedSpy.args[0][0];
				assert.equal(oEvent.getParameter("name"), "nestedHome", "The route with empty string pattern is matched");
				oNestedComponent.destroy();
				resolve();
			});
		});
	});

	QUnit.test("Should stop the router in nested component when another route in the parent router is matched", function(assert) {
		var that = this,
			oRouter = this.oParentComponent.getRouter();

		return new Promise(function(resolve, reject) {
			oRouter.getRoute("home").attachMatched(function() {
				var oContainer = that.oParentComponent.getRootControl(),
					oShell = oContainer.byId("shell");

				var oNestedComponent = oShell.getContent()[0].getComponentInstance();

				resolve(oNestedComponent);
			});
		}).then(function(oNestedComponent) {
			var oNestedRouter = oNestedComponent.getRouter();
			var oNestedHomeRoute = oNestedRouter.getRoute("nestedHome");
			var oNestedRouteMatchedSpy = sinon.spy(oNestedHomeRoute, "_routeMatched");
			var oNestedRouterStopSpy = sinon.spy(oNestedRouter, "stop");
			var oPromise = new Promise(function(resolve, reject) {
				oRouter.getRoute("category").attachMatched(function() {
					assert.equal(oNestedRouteMatchedSpy.callCount, 0, "The home route in nested router shouldn't be matched again");
					assert.equal(oNestedRouterStopSpy.callCount, 1, "The Router in nested component is stopped");
					oNestedComponent.destroy();
					resolve();
				});
				oRouter.navTo("category");
			});
			return oPromise;
		});
	});

	QUnit.test("Should initialize the router in nested component again once the route is matched again which has loaded the nested component", function(assert) {
		var that = this,
			oRouter = this.oParentComponent.getRouter();

		return new Promise(function(resolve, reject) {
			var fnHomeMatched = function() {
				oRouter.getRoute("home").detachEvent("matched", fnHomeMatched);
				var oContainer = that.oParentComponent.getRootControl(),
					oShell = oContainer.byId("shell");

				var oNestedComponent = oShell.getContent()[0].getComponentInstance();

				resolve(oNestedComponent);
			};

			oRouter.getRoute("home").attachMatched(fnHomeMatched);
		}).then(function(oNestedComponent) {
			var oNestedRouter = oNestedComponent.getRouter();
			var oNestedRouterStopSpy = sinon.spy(oNestedRouter, "stop");
			var oPromise = new Promise(function(resolve, reject) {
				oRouter.getRoute("category").attachMatched(function() {
					assert.equal(oNestedRouterStopSpy.callCount, 1, "The Router in nested component is stopped");
					resolve(oNestedComponent);
				});
			});
			oRouter.navTo("category");
			return oPromise;
		}).then(function(oNestedComponent) {
			var iOldCountNestedRouteMatched = that.oNestedRouteMatchedSpy.callCount;
			var oNestedRouter = oNestedComponent.getRouter();
			var oNestedRouterInitSpy = sinon.spy(oNestedRouter, "initialize");
			var oPromise = new Promise(function(resolve, reject) {
				oRouter.getRoute("home").attachMatched(function() {
					assert.equal(oNestedRouterInitSpy.callCount, 1, "The Router in nested component is initialized again");
					assert.equal(that.oNestedRouteMatchedSpy.callCount - iOldCountNestedRouteMatched, 1, "Another routeMatched event is fired in the nested router");
					oNestedComponent.destroy();
					resolve();
				});
			});
			oRouter.navTo("home");
			return oPromise;
		});
	});

	QUnit.module("navTo with nested components", {
		beforeEach: function() {
			this.buildNestedComponentStructure = function(level, suffix) {
				this.oEventProviderStub = sinon.stub(EventProvider.prototype.oEventPool, "returnObject");
				hasher.setHash("");
				var that = this;
				this.fnInitRouter = function() {
					UIComponent.prototype.init.apply(this, arguments);
					this._router = this.getRouter();
					this._router.initialize();
				};

				sap.ui.jsview("rootView1", {
					createContent : function() {
						return new ShellSubstitute(this.createId("shell"));
					}
				});

				sap.ui.jsview("notFound", {
					createContent : function() {
						return new Button({
							text: "Not Found"
						});
					}
				});

				var ParentComponent;

				ParentComponent = UIComponent.extend("namespace." + suffix + ".ParentComponent", {
					metadata : {
						rootView: {
							viewName: "rootView1",
							type: "JS",
							async: true
						},
						routing:  {
							config: {
								async: true
							},
							routes: [
								{
									pattern: "",
									name: "home",
									target: {
										name: "home",
										prefix: "child"
									}
								},
								{
									pattern: "category",
									name: "category"
								}
							],
							targets: {
								home: {
									name: "namespace." + suffix + ".ChildComponent0",
									type: "Component",
									controlId: "shell",
									controlAggregation: "content",
									options: {
										manifest: false
									}
								},
								notFound: {
									name: "notFound",
									type: "View",
									viewType: "JS",
									controlId: "shell",
									controlAggregation: "content"
								}
							}
						}
					},
					init : that.fnInitRouter
				});

				this.aNestedRouteMatchedSpies = [];
				var aLoopBase = [];
				Array.prototype.push.apply(aLoopBase, Array(level - 1));

				aLoopBase.forEach(function(value, i) {
					var oSpy = sinon.spy();
					that.aNestedRouteMatchedSpies.push(oSpy);

					var oMetadata;

					if (i === level - 2) {
						oMetadata = {
							routing:  {
								config: {
									async: true
								},
								routes: [
									{
										pattern: "product/{id}",
										name: "product"
									},
									{
										pattern: "",
										name: "nestedHome"
									}
								]
							}
						};
					} else {
						oMetadata = {
							rootView: {
								viewName: "rootView1",
								type: "JS",
								async: true
							},
							routing:  {
								config: {
									async: true
								},
								routes: [
									{
										pattern: "product/{id}",
										name: "product",
										target: {
											name: "nestedComp",
											prefix: "nestedComp" + (i + 1)
										}
									},
									{
										pattern: "",
										name: "nestedHome"
									}
								],
								targets: {
									nestedComp: {
										name: "namespace." + suffix + ".ChildComponent" + (i + 1),
										type: "Component",
										controlId: "shell",
										controlAggregation: "content",
										options: {
											manifest: false
										}
									}
								}
							}
						};
					}

					sap.ui.predefine("namespace/" + suffix + "/ChildComponent" + i + "/Component", ["sap/ui/core/UIComponent"], function(UIComponent) {
						return UIComponent.extend("namespace." + suffix + ".ChildComponent" + i, {
							metadata : oMetadata,
							init : function() {
								UIComponent.prototype.init.apply(this, arguments);
								var oRouter = this.getRouter();

								oRouter.attachRouteMatched(oSpy);
								oRouter.initialize();
							}
						});
					});
				});

				this.oParentComponent = new ParentComponent("parent");
			};
		},
		afterEach: function() {
			this.oParentComponent.destroy();
			this.oEventProviderStub.restore();
		}
	});

	QUnit.test("Call navTo with specific route and parameter for nested component", function(assert) {
		this.buildNestedComponentStructure(2, "NavTo2Levels");

		var that = this,
			oRouter = this.oParentComponent.getRouter(),
			iHomeRouteMatchCount = 0;

		var pHomeRouteMatched = new Promise(function(resolve, reject) {
			var fnMatched = function() {
				this.detachMatched(fnMatched);

				iHomeRouteMatchCount++;
				var oContainer = that.oParentComponent.getRootControl(),
					oShell = oContainer.byId("shell"),
					oControl = oShell.getContent()[0];

				if (oControl.isA("sap.ui.core.ComponentContainer")) {
					resolve(oControl.getComponentInstance());
				}
			};
			oRouter.getRoute("home").attachMatched(fnMatched);
		});

		return pHomeRouteMatched.then(function(oNestedComponent) {
			assert.equal(iHomeRouteMatchCount, 1, "home route is matched once");
			var oNestedRouter = oNestedComponent.getRouter(),
				sId = "productA";

			oRouter.navTo("home", {}, {
				home: {
					route: "product",
					parameters: {
						id: sId
					}
				}
			});

			oRouter.getRoute("home").attachMatched(function() {
				assert.ok(false, "The home route shouldn't be matched again");
			});

			return new Promise(function(resolve, reject) {
				oNestedRouter.getRoute("product").attachMatched(function(oEvent) {
					assert.equal(iHomeRouteMatchCount, 1, "home route is still matched only once");

					var oParameters = oEvent.getParameter("arguments");
					assert.equal(oParameters.id, sId, "correct route is matched with parameter");

					// wait 100ms since the matched event from oRouter is fired after this call stack
					// to guarantee that no further matched event is fired on the home route in oRouter
					setTimeout(function() {
						resolve();
					}, 100);
				});
			});
		});
	});

	QUnit.test("Call navTo with specific route and parameter for deep nested component", function(assert) {
		this.buildNestedComponentStructure(3, "NavTo3Levels");

		var that = this,
			oRouter = this.oParentComponent.getRouter(),
			iHomeRouteMatchCount = 0;

		var pHomeRouteMatched = new Promise(function(resolve, reject) {
			oRouter.getRoute("home").attachMatched(function() {
				iHomeRouteMatchCount++;
				var oContainer = that.oParentComponent.getRootControl(),
					oShell = oContainer.byId("shell"),
					oNestedComponent = oShell.getContent()[0].getComponentInstance();

				resolve(oNestedComponent);
			});
		});

		return pHomeRouteMatched.then(function(oNestedComponent) {
			assert.equal(iHomeRouteMatchCount, 1, "home route is matched once");
			var oNestedRouter = oNestedComponent.getRouter(),
				sId = "productA";

			return new Promise(function(resolve, reject) {
				oNestedRouter.getRoute("product").attachMatched(function(oEvent) {
					assert.equal(iHomeRouteMatchCount, 1, "home route is still matched only once");
					var oParameters = oEvent.getParameter("arguments"),
						aViews = oEvent.getParameter("views");

					assert.equal(oParameters.id, sId, "correct route is matched with parameter");

					assert.equal(aViews.length, 1, "A target instance is created");
					assert.ok(aViews[0] instanceof sap.ui.core.ComponentContainer, "The target instance is an ComponentContainer");

					var oNestedComponent = aViews[0].getComponentInstance(),
						oRouter = oNestedComponent.getRouter();

					var oGrandChildRouteMatchedSpy = that.aNestedRouteMatchedSpies[1];

					assert.equal(oGrandChildRouteMatchedSpy.callCount, 1, "A Route is matched in the grand child router");
					var oCall = oGrandChildRouteMatchedSpy.getCall(0);
					assert.strictEqual(oCall.thisValue, oRouter, "The correct spy is taken");
					assert.equal(oCall.args[0].getParameter("name"), "product", "The correct route is matched");

					assert.ok(oRouter.isInitialized(), "The router in nested component is started");
					assert.equal(oRouter._getLastMatchedRouteName(), "product", "The correct route is matched");

					resolve();
				});
				oRouter.navTo("home", {}, {
					home: {
						route: "product",
						parameters: {
							id: sId
						},
						componentTargetInfo: {
							nestedComp: {
								route: "product",
								parameters: {
									id: sId + "-nested"
								}
							}
						}
					}
				});
			});
		});
	});

	QUnit.test("navTo the same route after a manual Targets.display with a component should triger routeMatched event", function(assert) {
		this.buildNestedComponentStructure(2, "NavTo2LevelsWithTargetDisplay");

		var that = this,
			oRouter = this.oParentComponent.getRouter(),
			iHomeRouteMatchCount = 0;

		var pHomeRouteMatched = new Promise(function(resolve, reject) {
			var fnMatched = function() {
				this.detachMatched(fnMatched);

				iHomeRouteMatchCount++;
				var oContainer = that.oParentComponent.getRootControl(),
					oShell = oContainer.byId("shell"),
					oControl = oShell.getContent()[0];

				if (oControl.isA("sap.ui.core.ComponentContainer")) {
					resolve(oControl.getComponentInstance());
				}
			};
			oRouter.getRoute("home").attachMatched(fnMatched);
		});

		return pHomeRouteMatched.then(function(oNestedComponent) {
			assert.equal(iHomeRouteMatchCount, 1, "home route is matched once");

			// display another target with in the top level router
			// this should reset the hash in its RouterHashChanger in order to allow
			// a navTo to the same route which is matched before displaying the notFound
			return oRouter.getTargets().display("notFound").then(function() {
				return oNestedComponent;
			});
		}).then(function(oNestedComponent) {
			var oNestedRouter = oNestedComponent.getRouter(),
				sId = "productA";

			var oNestedRouterMatched = new Promise(function(resolve, reject) {
				oNestedRouter.getRoute("product").attachMatched(function(oEvent) {
					var oParameters = oEvent.getParameter("arguments");
					assert.equal(oParameters.id, sId, "correct route is matched with parameter");

					resolve();
				});
			});

			var oRouterMatched = new Promise(function(resolve, reject) {
				oRouter.getRoute("home").attachMatched(function() {
					assert.ok(true, "home route is matched again");
					resolve();
				});
			});

			oRouter.navTo("home", {}, {
				home: {
					route: "product",
					parameters: {
						id: sId
					}
				}
			});

			return Promise.all([oRouterMatched, oNestedRouterMatched]);
		});
	});

	QUnit.test("Suspend nested routers after switch to other route", function(assert) {
		this.buildNestedComponentStructure(3, "NavTo3LevelsSwitch");

		var that = this,
			oRouter = this.oParentComponent.getRouter(),
			iHomeRouteMatchCount = 0;

		var pHomeRouteMatched = new Promise(function(resolve, reject) {
			oRouter.getRoute("home").attachMatched(function() {
				iHomeRouteMatchCount++;
				var oContainer = that.oParentComponent.getRootControl(),
					oShell = oContainer.byId("shell"),
					oNestedComponent = oShell.getContent()[0].getComponentInstance();

				resolve(oNestedComponent);
			});
		});

		return pHomeRouteMatched.then(function(oNestedComponent) {
			assert.equal(iHomeRouteMatchCount, 1, "home route is matched once");
			var oNestedRouter = oNestedComponent.getRouter(),
				sId = "productA";

			return new Promise(function(resolve, reject) {
				oNestedRouter.getRoute("product").attachMatched(function(oEvent) {
					assert.equal(iHomeRouteMatchCount, 1, "home route is still matched only once");
					var oParameters = oEvent.getParameter("arguments"),
						aViews = oEvent.getParameter("views");

					assert.equal(oParameters.id, sId, "correct route is matched with parameter");

					assert.equal(aViews.length, 1, "A target instance is created");
					assert.ok(aViews[0] instanceof sap.ui.core.ComponentContainer, "The target instance is an ComponentContainer");

					var oNestedComponent = aViews[0].getComponentInstance(),
						oRouter = oNestedComponent.getRouter();

					assert.ok(oRouter.isInitialized(), "The router in nested component is started");
					assert.equal(oRouter._getLastMatchedRouteName(), "product", "The correct route is matched");

					resolve();
				});
				oRouter.navTo("home", {}, {
					home: {
						route: "product",
						parameters: {
							id: sId
						},
						componentTargetInfo: {
							nestedComp: {
								route: "product",
								parameters: {
									id: sId + "-nested"
								}
							}
						}
					}
				});
			});
		}).then(function() {
			return new Promise(function(resolve, reject) {
				// switch to another route in the top level router
				oRouter.getRoute("category").attachMatched(function(oEvent) {
					that.aNestedRouteMatchedSpies.forEach(function(oSpy) {
						assert.equal(oSpy.callCount, 0, "The nested routers are not matched again");
					});
					resolve();
				});
				// reset the call history of the routeMatched spies on the nested Routers
				that.aNestedRouteMatchedSpies.forEach(function(oSpy) {
					oSpy.resetHistory();
				});
				oRouter.navTo("category");
			});
		});
	});

	QUnit.module("Loading nested components through routing's targets with componentUsage settings", {
		beforeEach: function() {
			hasher.setHash("");
			sap.ui.loader.config({
				paths: {
					"routing": "../testdata/routing"
				}
			});
		},
		afterEach: function() {
			sap.ui.loader.config({
				paths: {
					"routing": null
				}
			});
		}
	});

	// scenario1
	QUnit.test("Nested component is loaded when the corresponding route is matched", function(assert) {
		var pCreated = Component.create({
			name: "routing.scenario1"
		});


		return pCreated.then(function(oComponent) {
			assert.ok(oComponent, "Component instance is successfully created");

			var oRouter = oComponent.getRouter();

			assert.ok(oRouter, "Router in component is available");

			var oHomeRoute = oRouter.getRoute("home");
			var oRouteMatchedSpy = this.spy(oHomeRoute, "_routeMatched");
			var oCreateComponentSpy = this.spy(oComponent, "createComponent");

			oRouter.initialize();
			assert.equal(oRouteMatchedSpy.callCount, 1, "Home route should be matched");

			var oCall = oRouteMatchedSpy.getCall(0);
			return oCall.returnValue.then(function() {
				assert.equal(oCreateComponentSpy.callCount, 1, "createComponent is called once");

				var oArg = oCreateComponentSpy.getCall(0).args[0];
				assert.equal(oArg.usage, "child", "usage is given");
				assert.equal(oArg.id, oComponent.createId("childComponent"), "id option is given");
				assert.ok(oArg.settings._manifestModels, "settings is given");
				assert.ok(oArg.settings._routerHashChanger, "RouterHashChanger is given");
				assert.deepEqual(oArg.componentData, { foo: "bar" }, "componentData is given");

				var oRootView = oComponent.getRootControl();
				var aContent = oRootView.byId("page").getContent();
				assert.equal(aContent.length, 1, "The target is created and added to the aggregation");
				assert.ok(aContent[0] instanceof ComponentContainer, "The nested component is added to the aggregation");

				var oNestedComponent = aContent[0].getComponentInstance();
				var oNestedRouter = oNestedComponent.getRouter();
				assert.ok(oNestedRouter, "Router is created in nested component");
				assert.equal(oNestedRouter.isInitialized(), false, "The nested router isn't initialized yet");

				assert.equal(oNestedRouter.getHashChanger().parent, oRouter.getHashChanger(), "The hash changer is chained with the parent router's");
			});

		}.bind(this));
	});

	QUnit.module("Routing Nested Components", {
		beforeEach: function() {
			this.oEventProviderStub = sinon.stub(EventProvider.prototype.oEventPool, "returnObject");
			this.oTitleChangedSpy = sinon.spy();
			hasher.setHash("");
			// ===== parentComponent =====
			sap.ui.jsview("parentRootView", {
				createContent : function() {
					return new Panel(this.createId("shell"));
				}
			});
			sap.ui.jsview("parentView1", {
				createContent : function() {
					return new Button(this.createId("button"));
				}
			});
			// ===== nestedComponent1 =====
			sap.ui.jsview("nestedRootView1", {
				createContent : function() {
					return new Panel(this.createId("nestedShell1"));
				}
			});
			sap.ui.jsview("nestedView1", {
				createContent : function() {
					return new Button(this.createId("button1"));
				}
			});
			sap.ui.jsview("nestedView2", {
				createContent : function() {
					return new Button(this.createId("button2"));
				}
			});
			// ===== nestedComponent2 =====
			sap.ui.jsview("nestedRootView2", {
				createContent : function() {
					return new Panel(this.createId("nestedShell2"));
				}
			});
			sap.ui.jsview("nestedView3", {
				createContent : function() {
					return new Button(this.createId("button3"));
				}
			});
			sap.ui.jsview("nestedView4", {
				createContent : function() {
					return new Button(this.createId("button4"));
				}
			});

			var ParentComponent;
			ParentComponent = UIComponent.extend("namespace1.ParentComponent", {
				metadata : {
					rootView: {
						viewName: "parentRootView",
						type: "JS",
						async: true
					},
					routing:  {
						config: {
							async: true,
							controlId: "shell",
							controlAggregation: "content"
						},
						routes: [
							{
								pattern: "",
								name: "home",
								target: {
									name: "home",
									prefix: "child"
								}
							},
							{
								pattern: "second",
								name: "second",
								target: {
									name: "second",
									prefix: "child"
								}
							},
							{
								pattern: "view1",
								name: "parentView1",
								target: "parentView1"

							}
						],
						targets: {
							home: {
								name: "namespace1.ChildComponent",
								type: "Component",
								id: "component1",
								title: "{/titleComponent1}",
								options: {
									manifest: false
								}
							},
							second: {
								name: "namespace2.ChildComponent",
								type: "Component",
								id: "component2",
								title: "TitleComponent2",
								options: {
									manifest: false
								}
							},
							parentView1: {
								name: "parentView1",
								title: "TitleParentView1",
								type: "View",
								viewType: "JS"
							}
						}
					}
				}
			});

			sap.ui.predefine("namespace1/ChildComponent/Component", ["sap/ui/core/UIComponent"], function(UIComponent) {
				return UIComponent.extend("namespace1.ChildComponent", {
					metadata : {
						rootView: {
							viewName: "nestedRootView1",
							type: "JS",
							async: true
						},
						routing:  {
							config: {
								async: true,
								controlAggregation: "content",
								controlId: "nestedShell1",
								viewType : "JS",
								type: "View"
							},
							routes: [
								{
									pattern: "",
									name: "nestedView1",
									target: "nestedView1"
								},
								{
									pattern: "view2",
									name: "nestedView2",
									target: "nestedView2"
								}
							],
							targets: {
								nestedView1: {
									name: "nestedView1",
									title: "TitleNestedView1"
								},
								nestedView2: {
									name: "nestedView2",
									title: "TitleNestedView2"
								}
							}
						}
					},
					init : function() {
						UIComponent.prototype.init.apply(this, arguments);
						this.setModel(new JSONModel({
							titleComponent1: "Title defined in model"
						}));
						var oRouter = this.getRouter();
						oRouter.initialize();
					}
				});
			});
			sap.ui.predefine("namespace2/ChildComponent/Component", ["sap/ui/core/UIComponent"], function(UIComponent) {
				return UIComponent.extend("namespace2.ChildComponent", {
					metadata : {
						rootView: {
							viewName: "nestedRootView2",
							type: "JS",
							async: true
						},
						routing:  {
							config: {
								async: true,
								controlAggregation: "content",
								controlId: "nestedShell2",
								viewType : "JS",
								type: "View"
							},
							routes: [
								{
									pattern: "",
									name: "nestedView3",
									target: "nestedView3"
								},
								{
									pattern: "view2",
									name: "nestedView4",
									target: "nestedView4"
								}
							],
							targets: {
								nestedView3: {
									name: "nestedView3",
									title: "TitleNestedView3"
								},
								nestedView4: {
									name: "nestedView4",
									title: "TitleNestedView4"
								}
							}
						}
					},
					init : function() {
						UIComponent.prototype.init.apply(this, arguments);
						var oRouter = this.getRouter();
						oRouter.initialize();
					}
				});
			});
			this.oParentComponent = new ParentComponent("parent");
		},
		afterEach: function() {
			this.oParentComponent.destroy();
			this.oEventProviderStub.restore();
		}
	});

	QUnit.test("Order of routeMatched events in nested components", function(assert) {
		var done = assert.async(),
			oParentRouter = this.oParentComponent.getRouter();

		var oHomeRoute = oParentRouter.getRoute("home");
		var oHomeRouteMatchedSpy = sinon.spy(oHomeRoute, "_routeMatched");
		oParentRouter.initialize();

		var oRouterRouteMatchedSpy = sinon.spy(sap.ui.core.routing.Router.prototype, "fireRouteMatched");

		oHomeRouteMatchedSpy.getCall(0).returnValue.then(function() {
			assert.equal(oRouterRouteMatchedSpy.callCount, 2, "fireRouteMatched should be called twice");
			assert.strictEqual(oRouterRouteMatchedSpy.getCall(1).thisValue, oParentRouter, "Should be the correct ");
			done();
		});
	});

	QUnit.test("Propagate titleChange event from nested component", function(assert) {
		var done = assert.async(),
			that = this,
			oParentRouter = this.oParentComponent.getRouter();

		// Expected results
		var oExpected1 = {
			"history": [],
			"name": "home",
			"nestedHistory": [{
					"history": [{
						"hash": "",
						"title": "Title defined in model"
					}],
					"ownerComponentId": "parent"
				},
				{
					"history": [{
						"hash": "",
						"title": "TitleNestedView1"
					}],
					"ownerComponentId": "parent---component1"
				}
			],
			"title": "Title defined in model"
		},
		oExpected2 = {
			"history": [{
				"hash": "",
				"title": "TitleNestedView1"
			}],
			"name": "nestedView2",
			"nestedHistory": [{
					"history": [{
						"hash": "",
						"title": "Title defined in model"
					}],
					"ownerComponentId": "parent"
				},
				{
					"history": [{
							"hash": "",
							"title": "TitleNestedView1"
						},
						{
							"hash": "view2",
							"title": "TitleNestedView2"
						}
					],
					"ownerComponentId": "parent---component1"
				}
			],
			"propagated": true,
			"title": "TitleNestedView2"
		},
		oExpected3 = {
			"history": [{
				"hash": "",
				"title": "Title defined in model"
			}],
			"name": "second",
			"nestedHistory": [{
					"history": [{
							"hash": "",
							"title": "Title defined in model"
						},
						{
							"hash": "second",
							"title": "TitleComponent2"
						}
					],
					"ownerComponentId": "parent"
				},
				{
					"history": [{
						"hash": "",
						"title": "TitleNestedView3"
					}],
					"ownerComponentId": "parent---component2"
				}
			],
			"title": "TitleComponent2"
		};

		oParentRouter.attachTitleChanged(this.oTitleChangedSpy);

		var oHomeRoute = oParentRouter.getRoute("home");
		var oHomeRouteMatchedSpy = sinon.spy(oHomeRoute, "_routeMatched");

		oParentRouter.initialize();

		oHomeRouteMatchedSpy.getCall(0).returnValue.then(function(oObject) {
			assert.equal(that.oTitleChangedSpy.callCount, 1, "initialize(): fireTitleChange should be called the first time");
			assert.deepEqual(that.oTitleChangedSpy.getCall(0).args[0].getParameters(), oExpected1, "initialize(): titleChange event object should be correct");

			var oNestedComponent1 = oObject.view.getComponentInstance(),
				oNestedComponent1Router = oNestedComponent1.getRouter();

			var oNestedComponentRoute = oNestedComponent1Router.getRoute("nestedView2");
			var oNestedRouteMatchedSpy1 = sinon.spy(oNestedComponentRoute, "_routeMatched");

			oNestedComponent1.getRouter().navTo("nestedView2");
			return oNestedRouteMatchedSpy1.getCall(0).returnValue;
		}).then(function() {
			assert.equal(that.oTitleChangedSpy.callCount, 2, "navTo('nestedView2'): fireTitleChange should be called the two times");
			assert.ok(that.oTitleChangedSpy.getCall(1).args[0].getParameters().propagated, "Navigation triggered by nested component, marked as propagated");
			assert.deepEqual(that.oTitleChangedSpy.getCall(1).args[0].getParameters(), oExpected2, "navTo('nestedView2'): titleChange event object should be correct");

			var oSecondRoute = oParentRouter.getRoute("second");
			var oSecondRouteMatchedSpy = sinon.spy(oSecondRoute, "_routeMatched");

			oParentRouter.navTo("second");
			oSecondRouteMatchedSpy.getCall(0).returnValue.then(function() {
				assert.equal(that.oTitleChangedSpy.callCount, 3, "navTo('second'): fireTitleChange should be called the three times");
				assert.deepEqual(that.oTitleChangedSpy.getCall(2).args[0].getParameters(), oExpected3, "navTo('second'): titleChange event object should be correct");

				var oParentView1Route = oParentRouter.getRoute("parentView1");
				var oParentView1RouteMatchedSpy = sinon.spy(oParentView1Route, "_routeMatched");

				oParentRouter.navTo("parentView1");
				oParentView1RouteMatchedSpy.getCall(0).returnValue.then(function() {
					assert.equal(oParentRouter.getTitleHistory().length, 3, "The number of history entries should be correct");
					done();
				});
			});
		});
	});

});
