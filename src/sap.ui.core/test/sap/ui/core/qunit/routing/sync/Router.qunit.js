/*global QUnit, sinon, hasher */
sap.ui.define([
	"sap/base/Log",
	"sap/base/util/deepExtend",
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
	"../HistoryUtils",
	"sap/ui/thirdparty/signals",
	"sap/ui/thirdparty/crossroads",
	"sap/ui/thirdparty/hasher"
], function (Log, deepExtend, UIComponent, Controller, JSView, View, HashChanger, Router, Views, JSONModel, App, Button, NavContainer, Panel, SplitContainer, HistoryUtils) {
	"use strict";

	// This variable is used for creating custom component classes to avoid the
	// error "introducing global variables" when this test file is executed with
	// url-parameter noglobals=true
	window.namespace = undefined;

	// use sap.m.Panel as a lightweight drop-in replacement for the ux3.Shell
	var ShellSubstitute = Panel;

	function addClock() {
		if ( this.clock == null && this._oSandbox ) {
			this.clock = this._oSandbox.useFakeTimers();
		}
	}

	// Initialize the HistoryUtils
	QUnit.begin(HistoryUtils.init);

	// Resets the HistoryUtils
	QUnit.done(HistoryUtils.exit);

	QUnit.module("initialization", {
		before: HistoryUtils.check
	});

	QUnit.test("Should initialize the router instance", function(assert) {
		//Arrange
		var parseSpy,
		//System under Test
			router = new Router({}, {}, null, {});

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
				router = new Router();

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
		var router = new Router({
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
		var router = new Router();

		// call stop shouldn't raise any exception
		router.stop();

		//Cleanup
		router.destroy();
	});

	QUnit.test("Should parse the hash when initialize doesn't suppress the hash parsing", function(assert) {
		var router = new Router();
		var parseSpy = this.spy(router, "parse");

		hasher.setHash("");

		router.initialize();

		assert.equal(parseSpy.callCount, 1, "did notify for initial hash");
		router.stop();

		router.initialize();
		assert.equal(parseSpy.callCount, 2, "did notify when initialized with the same hash again");

		router.destroy();
	});

	QUnit.test("Should not parse the hash when initialize does suppress the hash parsing", function(assert) {
		var router = new Router();
		var parseSpy = this.spy(router, "parse");

		hasher.setHash("");

		router.initialize();

		assert.equal(parseSpy.callCount, 1, "did notify for initial hash");
		router.stop();

		router.initialize(true /* suppress hash parsing */);
		assert.equal(parseSpy.callCount, 1, "did not notify when initialized with the same hash again");

		router.destroy();
	});

	QUnit.test("Should destroy the router instance", function(assert) {
		//Arrange
		var parseSpy,
		//System under Test
			router = new Router();

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
		var oRouter = new Router([ { name : "myRoute", pattern : "foo" } ], {}, null, {myTarget : {}});

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

	QUnit.test("Should log a warning if a router gets destroyed while the hash changes", function (assert) {

		// Arrange
		var oWarningSpy = this.stub(Log, "warning"),
			oFirstRouter = new Router({
				"matchingRoute" : {
					pattern: "matches"
				}
			}),
			oRouterToBeDestroyed = new Router({
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
		before: HistoryUtils.check,
		beforeEach : function() {
			//make sure to start with an empty hash
			hasher.setHash("");
			addClock.call(this);
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
			router = new Router({
				"parent" : {
					subroutes : {
						"child" : {
							pattern : "foo"
						}
					}
				}
			});

		router.attachRoutePatternMatched(matched);
		hasher.setHash("");

		//Act
		router.initialize();
		hasher.setHash("foo");
		hasher.setHash("");
		this.clock.tick(0);
		router.destroy();

		//Assert
		assert.strictEqual(callCount, 1,"did notify the child");

	});

	QUnit.test("Handle setting invalid option 'viewName' in route", function(assert) {
		var oLogSpy = sinon.spy(Log, "error");

		//Arrange System under Test
		var router = new Router({
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

		var oViewCreateStub = sinon.stub(sap.ui, "view").callsFake(function() {
			var oView = {
				loaded: function() {
					return Promise.resolve(oView);
				},
				isA: function(sClassName) {
					return sClassName === "sap.ui.core.mvc.View";
				}
			};

			return oView;
		});

		var oRoute = router.getRoute("name");

		router.parse("view1");

		assert.strictEqual(oRoute._oConfig.name, "name", "Route has correct name");
		assert.ok(oLogSpy.calledWith(sinon.match(/The 'viewName' option shouldn't be used in Route. please use 'view' instead/)), "The error log is done and the log message is correct");

		oViewCreateStub.restore();
		oLogSpy.restore();
	});

	QUnit.test("subroute handling", function(assert) {

		//Arrange System under Test
		var router = new Router({
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

		router = new Router([
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
		var oRouter = new Router({
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

	QUnit.module("greedy", {
		before: HistoryUtils.check,
		beforeEach: addClock
	});

	QUnit.test("Should create a greedy route", function (assert) {
		// Arrange + System under test
		var sPattern = "product",
			oRouter = new Router([
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

		var fnFirstSpy = this.spy();
		var fnChildSpy = this.spy();
		var fnParentSpy = this.spy();

		oRouter.getRoute("first").attachPatternMatched(fnFirstSpy);
		oRouter.getRoute("parent").attachPatternMatched(fnParentSpy);
		oRouter.getRoute("child").attachPatternMatched(fnChildSpy);

		// Act
		oRouter.parse(sPattern);
		this.clock.tick(0);

		// Assert
		assert.strictEqual(fnFirstSpy.callCount, 1, "first route gets pattern matched");
		assert.strictEqual(fnChildSpy.callCount, 0, "child gets not pattern matched");
		assert.strictEqual(fnParentSpy.callCount, 1, "parent does also get pattern matched because of greedyness");

		// Cleanup
		oRouter.destroy();
	});


	QUnit.test("Should create a greedy route", function (assert) {
		// Arrange + System under test
		var sPattern = "product",
			oRouter = new Router([
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

		var fnFirstSpy = this.spy();
		var fnSecondSpy = this.spy();
		var fnLastSpy = this.spy();

		oRouter.getRoute("first").attachPatternMatched(fnFirstSpy);
		oRouter.getRoute("second").attachPatternMatched(fnSecondSpy);
		oRouter.getRoute("last").attachPatternMatched(fnLastSpy);

		// Act
		oRouter.parse(sPattern);
		this.clock.tick(0);

		// Assert
		assert.strictEqual(fnFirstSpy.callCount, 1, "First route gets the hashchange");
		assert.strictEqual(fnSecondSpy.callCount, 0, "Second one is not greedy");
		assert.strictEqual(fnLastSpy.callCount, 1, "The Third route is greedy!");

		// Cleanup
		oRouter.destroy();
	});

	QUnit.module("routing", {
		before: HistoryUtils.check,
		beforeEach : function() {
			addClock.call(this);
			//make sure to start with an empty hash
			hasher.setHash("");
		}
	});

	QUnit.test("Should attach to a route", function(assert) {
		//Arrange
		var spy = this.spy(),
		//System under Test
			router = new Router([ {
				name : "name",
				pattern : ""
			} ]);

		//Act
		router.attachRouteMatched(spy);
		router.initialize();
		this.clock.tick(0);

		//Assert
		assert.strictEqual(spy.callCount, 1, "Did call the callback function once");

		//Cleanup
		router.destroy();
	});

	QUnit.test("Should attach to a route using getRoute", function(assert) {
		//Arrange
		var spy = this.spy(),
		//System under Test
			oRouter = new Router([ {
				name : "name",
				pattern : ""
			} ]);

		//Act
		oRouter.getRoute("name").attachMatched(spy);
		oRouter.initialize();
		this.clock.tick(0);

		//Assert
		assert.strictEqual(spy.callCount, 1, "Did call the callback function once");

		//Cleanup
		oRouter.destroy();
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
			router = new Router([ {
				name : "name",
				pattern : "{foo}/{bar}"
			} ]);

		router.initialize();
		router.attachRouteMatched(matched);

		//Act
		var url = router.getURL("name", {
			bar : "bar",
			foo : "foo"
		});
		HashChanger.getInstance().setHash(url);
		this.clock.tick(0);

		//Assert
		assert.strictEqual(callCount, 1, "Did call the callback function once");
		assert.strictEqual(aArguments.foo, "foo", "parameter foo is passed");
		assert.strictEqual(aArguments.bar, "bar", "parameter bar is passed");

		//Cleanup
		router.destroy();
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
			router = new Router([ {
				name : "name",
				pattern : "{foo}",
				subroutes: [
					{
						name: "subroute",
						pattern: "{foo}/{bar}"
					}
				]
			} ]);

		router.initialize();
		router.attachBeforeRouteMatched(beforeMatched);
		router.attachRouteMatched(matched);
		router.attachRoutePatternMatched(patternMatched);

		//Act
		var url = router.getURL("subroute", {
			bar : "bar",
			foo : "foo"
		});
		HashChanger.getInstance().setHash(url);
		this.clock.tick(0);

		//Assert
		assert.strictEqual(beforeCallCount, 2, "Did call the callback function twice");
		assert.strictEqual(callCount, 2, "Did call the callback function twice");
		assert.strictEqual(patternCallCount, 1, "Did call the patternMatched function once");
		assert.deepEqual(aArguments.foo, "foo", "Did pass foo as parameter it was: " + aArguments.foo);
		assert.ok(bParentCallFirst, "Parent route was called first");

		//Cleanup
		router.destroy();
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
			router = new Router([ {
				name : "emty",
				pattern : ""
			}, {
				name : "name",
				pattern : "foo/"
			} ]);

		router.initialize();
		router.attachRouteMatched(matched);

		//Act
		HashChanger.getInstance().setHash("foo/");
		this.clock.tick(0);

		//Assert
		assert.strictEqual(callCount, 1, "Did call the callback function once");

		//Cleanup
		router.destroy();
	});

	QUnit.module("hrefGeneration", {
		before: HistoryUtils.check
	});

	QUnit.test("Should create an URL for a route", function(assert) {
		//Arrange
		var //System under Test
			router = new Router([ {
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

	QUnit.module("navTo", {
		before: HistoryUtils.check,
		beforeEach: function () {
			this.oRouter = new Router({
				home: {
					pattern: ""
				},
				product : {
					pattern : "product"
				}
			});
			this.oRouter.oHashChanger = {
				setHash: function() {}
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

	QUnit.test("Should log an error if navTo is called with component target info", function(assert) {
		var oLogErrorSpy = this.spy(Log, "error");
		this.oRouter.navTo("product", {}, {foo: {}});

		sinon.assert.callCount(oLogErrorSpy, 1);
		sinon.assert.calledWith(oLogErrorSpy, sinon.match(/navTo with component target info is only supported with async router/));
	});

	QUnit.module("View generation", {
		before: HistoryUtils.check
	});

	QUnit.test("View initialization", function(assert) {

		var oShell = new ShellSubstitute();

		//Arrange System under Test
		var router = new Router([
			{
				targetControl: oShell.getId(),
				targetAggregation: "content",
				name : "name",
				view : "myView",
				viewPath: "sample.application",
				viewType: "JS",
				pattern : "view1"
			}
		]);

		var oButton = new Button({
			text: "Test-Button"
		});

		var oStub = this.stub(View, "_create").callsFake(function() {
			return oButton;
		});

		router.initialize();

		//Act
		HashChanger.getInstance().setHash("view1");

		//Assert
		assert.strictEqual(oShell.getContent()[0].getId(), oButton.getId(), "Button is first content element");
		assert.strictEqual(oStub.callCount, 1, "Only one view is created");

		//Cleanup
		router.destroy();
		oShell.destroy();
	});


	QUnit.test("Should set a view to the cache", function (assert) {
		var oShell = new ShellSubstitute();

		//Arrange System under Test
		var router = new Router([
			{
				targetControl: oShell.getId(),
				targetAggregation: "content",
				name : "name",
				view : "myView",
				viewType: "XML",
				pattern : "view1"
			}
		]);


		var sXmlViewContent = [
			'<mvc:View xmlns:mvc="sap.ui.core.mvc">',
			'</mvc:View>'
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

		//Assert
		assert.strictEqual(oShell.getContent()[0].getId(), oView.getId(), "a created view was placed");

		//Cleanup
		router.destroy();
		oShell.destroy();
	});

	QUnit.test("Nested View initialization", function(assert) {

		HashChanger.getInstance().setHash("");

		var oApp = new App();

		//Arrange System under Test
		var router = new Router([
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

		router.initialize();

		oApp.placeAt("qunit-fixture");

		//Act
		HashChanger.getInstance().setHash("foo");

		//Assert
		assert.strictEqual(oApp.getPages()[0].getContent()[0].getId(), oNavContainer.getId(), "oNavContainer is first page element in app");
		assert.strictEqual(oNavContainer.getPages()[0].getContent()[0].getId(), oNavContainer2.getId(), "oNavContainer2 is first page element in oNavContainer");
		assert.strictEqual(oNavContainer2.getPages()[0].getContent()[0].getId(), oNavContainer3.getId(), "oNavContainer3 is first page element in oNavContainer2");

		//Cleanup
		router.destroy();
		oApp.destroy();
	});

	QUnit.test("Nested target parents", function(assert) {

		HashChanger.getInstance().setHash("");

		var oApp = new App();

		//Arrange System under Test
		var router = new Router([
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

		router.initialize();

		oApp.placeAt("qunit-fixture");

		//Act
		HashChanger.getInstance().setHash("detail");
		HashChanger.getInstance().setHash("fullScreen");

		//Assert
		assert.strictEqual(oApp.getPages().length, 2, "splitContainer and navContainer are added to App");
		assert.strictEqual(oNavContainer.getPages()[0].getContent()[0].getId(), oFullScreenContent.getId(), "FullScreenContent is first page element in oNavContainer");
		assert.strictEqual(oSplitContainer.getMasterPages()[0].getContent()[0].getId(), oMasterContent.getId(), "Master is first master-page element in oSplitContainer");
		assert.strictEqual(oSplitContainer.getDetailPages()[0].getContent()[0].getId(), oDetailContent.getId(), "Detail is first detail-page element in oSplitContainer");

		//Cleanup
		router.destroy();
		oApp.destroy();
	});

	QUnit.test("Fixed id", function(assert) {

		var oShell = new ShellSubstitute();

		//Arrange System under Test
		var router = new Router([
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

		router.initialize();

		oShell.placeAt("qunit-fixture");

		//Act
		HashChanger.getInstance().setHash("view1");

		//Assert
		assert.strictEqual(oShell.getContent()[0].getId(), "test-view", "View has correct id");

		//Cleanup
		router.destroy();
		oShell.destroy();
	});

	QUnit.module("View events", {
		before: HistoryUtils.check
	});

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
		before: HistoryUtils.check,
		beforeEach: function () {
			// System under test + Arrange
			this.oRouter = new Router();

			this.oView = createXmlView();
		},
		afterEach: function () {
			this.oRouter.destroy();
		}
	});

	QUnit.test("Should create a view", function (assert) {
		var that = this,
			fnStub = this.stub(View, "_create").callsFake(function (oViewOptions) {
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
		var that = this,
			oReturnValue,
			fnStub = this.stub(View, "_create").callsFake(function () {
				return that.oView;
			});

		//Act
		oReturnValue = this.oRouter.setView("foo.bar", this.oView);
		var oRetrievedView = this.oRouter.getView("foo.bar", "bar");

		//Assert
		assert.strictEqual(oRetrievedView, this.oView, "the view was returned");
		assert.strictEqual(oReturnValue, this.oRouter, "able to chain this function");
		assert.strictEqual(fnStub.callCount, 0, "the stub not invoked - view was loaded from the cache");
	});


	QUnit.module("created event", {
		before: HistoryUtils.check,
		beforeEach: function () {
			// System under test + Arrange
			this.oRouter = new Router();
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

		this.stub(View, "_create").callsFake(function () {
			return oView;
		});

		this.oRouter.attachViewCreated(fnEventSpy);

		// Act
		this.oRouter.getView(sViewName, sViewType);

		// Assert
		assert.strictEqual(fnEventSpy.callCount, 1, "The view created event was fired");
		assert.strictEqual(oParameters.view, oView, "Did pass the view to the event parameters");
		assert.strictEqual(oParameters.viewName, sViewName, "Did pass the viewName to the event parameters");
		assert.strictEqual(oParameters.type, sViewType, "Did pass the viewType to the event parameters");
	});

	QUnit.module("titleChanged event", {
		before: HistoryUtils.check,
		beforeEach: function() {
			HashChanger.getInstance().setHash("");
			this.oApp = new App();
			this.sPattern = "anything";
			this.sTitle = "myTitle";

			var oView = createXmlView();
			this.fnStub = sinon.stub(View, "_create").callsFake(function () {
				return oView;
			});

			this.oDefaults = {
				// only shells will be used
				controlAggregation: "pages",
				viewName: "foo",
				controlId: this.oApp.getId()
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
			});

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

		this.oRouter.attachTitleChanged(fnEventSpy);

		// Act
		this.oRouter.oHashChanger.setHash(this.sPattern);

		// Assert
		assert.strictEqual(fnEventSpy.callCount, 1, "The titleChanged event was fired");
		assert.strictEqual(oParameters.title, this.sTitle, "Did pass title value to the event parameters");
	});

	QUnit.test("Should fire the titleChanged event if the matched route has a title defined", function (assert) {
		// Arrange
		var oParameters,
			fnEventSpy = this.spy(function (oEvent) {
				oParameters = oEvent.getParameters();
			});

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
		this.oRouter.initialize();

		this.oRouter.attachTitleChanged(fnEventSpy);

		// Act
		this.oRouter.oHashChanger.setHash(this.sPattern);

		// Assert
		assert.strictEqual(fnEventSpy.callCount, 1, "The titleChanged event was fired");
		assert.strictEqual(oParameters.title, this.sTitle, "Did pass title value to the event parameters");
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
			oTarget;

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
		this.oRouter.initialize();

		this.oRouter.attachTitleChanged(fnEventSpy);

		// Act
		this.oRouter.oHashChanger.setHash(sPattern);

		// Assert
		assert.strictEqual(fnEventSpy.callCount, 1, "The titleChanged event was fired");
		assert.strictEqual(oParameters.title, sTitle, "Did pass title value to the event parameters");

		// Act
		this.oRouter.oHashChanger.setHash(sPattern1);
		assert.strictEqual(fnEventSpy.callCount, 2, "The titleChanged event was fired on the matched route");
		assert.strictEqual(oParameters.title, sTitle1, "Did pass title value to the event parameters");


		oTarget = this.oRouter.getTarget("target");
		oTarget.fireTitleChanged({title: "foo"});
		assert.strictEqual(fnEventSpy.callCount, 2, "The titleChanged event wasn't fired again");
	});

	QUnit.module("title history", {
		before: HistoryUtils.check,
		beforeEach: function() {
			// reset hash
			HashChanger.getInstance().setHash("");

			this.oApp = new App();

			var oView = createXmlView();
			this.fnStub = sinon.stub(View, "_create").callsFake(function () {
				return oView;
			});

			this.oDefaults = {
				// only shells will be used
				controlAggregation: "pages",
				viewName: "foo",
				controlId: this.oApp.getId()
			};

		},
		afterEach: function() {
			this.fnStub.restore();
			this.oRouter.destroy();
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

		this.oRouter.attachTitleChanged(fnEventSpy);

		// Act
		this.oRouter.initialize();

		// Assert
		assert.strictEqual(fnEventSpy.callCount, 1, "titleChanged event is fired");
		assert.strictEqual(oParameters.title, sHomeTitle, "Did pass title value to the event parameters");
		assert.deepEqual(oParameters.history, [], "history state is currently empty");

		// Act
		this.oRouter.navTo("product");
		// Assert
		assert.strictEqual(fnEventSpy.callCount, 2, "titleChanged event is fired again");
		assert.strictEqual(oParameters.title, sProductTitle, "Did pass title value to the event parameters");
		assert.deepEqual(oParameters.history, [{
			hash: "",
			title: sHomeTitle
		}], "history state is correctly updated");

		// Act
		this.oRouter.navTo("productDetail");
		// Assert
		assert.strictEqual(fnEventSpy.callCount, 3, "titleChanged event is fired again");
		assert.strictEqual(oParameters.title, sProductDetailTitle, "Did pass title value to the event parameters");
		assert.equal(oParameters.history.length, 2, "history was updated only once");
		assert.deepEqual(oParameters.history[oParameters.history.length - 1], {
			hash: "product",
			title: sProductTitle
		}, "history state is correctly updated");

		// Act
		window.history.go(-1);

		this.oRouter.attachRouteMatched(function() {
			// Assert
			assert.strictEqual(fnEventSpy.callCount, 4, "titleChanged event is fired again");
			assert.strictEqual(oParameters.title, sProductTitle, "Did pass title value to the event parameters");
			assert.equal(oParameters.history.length, 1, "history was updated only once");
			assert.deepEqual(oParameters.history, [{
				hash: "",
				title: sHomeTitle
			}], "history state is correctly updated");
			done();
		});

	});

	QUnit.test("avoid title history redundancy", function(assert) {
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

		this.oRouter.attachTitleChanged(fnEventSpy);

		// Act
		this.oRouter.initialize();

		// Assert
		assert.strictEqual(fnEventSpy.callCount, 1, "titleChanged event is fired");
		assert.strictEqual(oParameters.title, sHomeTitle, "Did pass title value to the event parameters");
		assert.deepEqual(oParameters.history, [], "history state is currently empty");

		// Act
		this.oRouter.navTo("product");
		// Assert
		assert.strictEqual(fnEventSpy.callCount, 2, "titleChanged event is fired again");
		assert.strictEqual(oParameters.title, sProductTitle, "Did pass title value to the event parameters");
		assert.deepEqual(oParameters.history, [{
			hash: "",
			title: sHomeTitle
		}], "history state is correctly updated");

		// Act
		this.oRouter.navTo("productDetail");
		// Assert
		assert.strictEqual(fnEventSpy.callCount, 3, "titleChanged event is fired again");
		assert.strictEqual(oParameters.title, sProductDetailTitle, "Did pass title value to the event parameters");
		assert.equal(oParameters.history.length, 2, "history was updated only once");
		assert.deepEqual(oParameters.history[oParameters.history.length - 1], {
			hash: "product",
			title: sProductTitle
		}, "history state is correctly updated");

		// Act
		this.oRouter.navTo("home");
		// Assert
		assert.strictEqual(fnEventSpy.callCount, 4, "titleChanged event is fired again");
		assert.strictEqual(oParameters.title, sHomeTitle, "Did pass title value to the event parameters");
		assert.equal(oParameters.history.length, 2, "history was updated only once");
		assert.deepEqual(oParameters.history[oParameters.history.length - 1], {
			hash: "productDetail",
			title: sProductDetailTitle
		}, "history state is correctly updated");
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

		this.oRouter.attachTitleChanged(fnEventSpy);

		// Act
		this.oRouter.initialize();

		// Assert
		assert.strictEqual(fnEventSpy.callCount, 1, "titleChanged event is fired");
		assert.strictEqual(oParameters.title, sHomeTitle, "Did pass title value to the event parameters");
		assert.deepEqual(oParameters.history, [], "history state is currently empty");

		// Act
		this.oRouter.navTo("product");
		// Assert
		assert.strictEqual(fnEventSpy.callCount, 2, "titleChanged event is fired again");
		assert.strictEqual(oParameters.title, sProductTitle, "Did pass title value to the event parameters");
		assert.deepEqual(oParameters.history, [{
			hash: "",
			title: sHomeTitle
		}], "history state is correctly updated");

		// Act
		this.oRouter.navTo("productDetail", null, true);
		// Assert
		assert.strictEqual(fnEventSpy.callCount, 3, "titleChanged event is fired again");
		assert.strictEqual(oParameters.title, sProductDetailTitle, "Did pass title value to the event parameters");
		assert.equal(oParameters.history.length, 1, "history was updated only once");
		assert.deepEqual(oParameters.history[oParameters.history.length - 1], {
			hash: "",
			title: sHomeTitle
		}, "history state is correctly updated");
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

		this.oRouter.attachTitleChanged(fnEventSpy);

		// Act
		this.oRouter.initialize();

		assert.ok(fnEventSpy.calledOnce, "titleChanged event is fired");
		assert.equal(oParameters.title, sHomeTitle, "title parameter is set");
		assert.equal(oParameters.history.length, 0, "No new history entry is created");
		assert.equal(this.oRouter._aHistory[0].title, sHomeTitle, "title is updated in title history stack");

		oModel.setProperty("/title", sNewTitle);
		assert.ok(fnEventSpy.calledTwice, "titleChanged event is fired again");
		assert.equal(oParameters.title, sNewTitle, "title parameter is set");
		assert.equal(oParameters.history.length, 0, "No new history entry is created");
		assert.equal(this.oRouter._aHistory[0].title, sNewTitle, "title is updated in title history stack");
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

		this.oRouter.attachTitleChanged(fnEventSpy);

		// Act
		this.oRouter.initialize();
		this.oRouter.navTo("product");
		this.oRouter.navTo("productDetail");
		assert.strictEqual(fnEventSpy.callCount, 2, "titleChanged event is fired twice");
		window.history.go(-1);

		// Assert
		this.oRouter.attachRouteMatched(function() {
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

		// Act
		this.oRouter.initialize();

		// Assert
		var aHistoryRef = {
			hash: "",
			title: "HOME"
		};
		assert.deepEqual(this.oRouter.getTitleHistory()[0], aHistoryRef);

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
			homeRoute: "home"
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

		this.oRouter.attachTitleChanged(fnEventSpy);

		this.oRouter.attachRouteMatched(function() {
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

		// Act
		this.oRouter.initialize();
	});

	QUnit.test("Home Route declaration with dynamic parts", function(assert) {
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
			homeRoute: "home"
		};
		this.spy = sinon.spy(Log, "error");

		this.oRouter = new Router(this.oRouterConfig, this.oDefaults, null, this.oTargetConfig);

		this.oRouter.attachTitleChanged(fnEventSpy);

		hasher.setHash(this.oRouterConfig.product.pattern);

		this.oRouter.attachRouteMatched(function() {
			// Assert
			assert.ok(this.spy.calledWith(sinon.match(/Routes with dynamic parts cannot be resolved as home route./)));
			assert.strictEqual(oParameters.history.length, 0, "Home route shouldn't be added to history.");
			assert.deepEqual(this.oRouter.getTitleHistory()[0], {
				hash: "/product",
				title: "PRODUCT"
			}, "Product route is added to history.");
			assert.strictEqual(fnEventSpy.callCount, 1, "titleChanged event is fired.");
			assert.strictEqual(oParameters.title, sProductTitle, "Did pass product title value to the event parameters");
			this.spy.restore();
			done();
		}.bind(this));

		// Act
		this.oRouter.initialize();
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
			homeRoute: "home"
		};

		this.oRouter = new Router(this.oRouterConfig, this.oDefaults, null, this.oTargetConfig);

		hasher.setHash(this.oRouterConfig.product.pattern);

		this.oRouter.attachTitleChanged(function() {

			if (hasher.getHash() !== this.oRouterConfig.home.pattern) {
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
			homeRoute: "home"
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

			if (hasher.getHash() !== this.oRouterConfig.home.pattern) {
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

	QUnit.module("component", {
		before: HistoryUtils.check
	});

	QUnit.test("Should create a view with an component", function (assert) {
		// Arrange
		var oUIComponent = new UIComponent({}),
			fnOwnerSpy = this.spy(oUIComponent, "runAsOwner"),
			oView = createXmlView(),
			oRouter = new Router({}, {}, oUIComponent),
				fnViewStub = this.stub(View, "_create").callsFake(function () {
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
		before: HistoryUtils.check,
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
		this.oRouter = new Router(this.oRouterConfig, this.oDefaults, null, oTargetConfig);
		var oPlaceSpy = this.spy(this.oRouter.getTarget("myTarget"), "_place");

		// Act
		this.oRouter.parse(this.sPattern);

		// Assert
		assert.strictEqual(this.oRouter._oTargets._oCache, this.oRouter._oViews, "Targets are using the same view repository");
		assert.strictEqual(this.oRouter._oTargets._oConfig, this.oDefaults, "Targets are using the same defaults as the router");

		assert.strictEqual(oPlaceSpy.callCount, 1, "Did place myTarget");
		sinon.assert.calledOn(oPlaceSpy, this.oRouter.getTarget("myTarget"));

		assert.strictEqual(this.oShell.getContent().length, 1, "Did place the view in the shell");
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
		this.oRouter = new Router(this.oRouterConfig, this.oDefaults, null, oTargetConfig);
		var oPlaceSpy = this.spy(this.oRouter.getTarget("myTarget"), "_place");
		var oPlaceSecondSpy = this.spy(this.oRouter.getTarget("secondTarget"), "_place");

		// Act
		this.oRouter.parse(this.sPattern);

		// Assert
		assert.strictEqual(oPlaceSpy.callCount, 1, "Did place the first target");
		assert.strictEqual(oPlaceSecondSpy.callCount, 1, "Didplace the second target");

		sinon.assert.calledOn(oPlaceSpy, this.oRouter.getTarget("myTarget"));
		sinon.assert.calledOn(oPlaceSecondSpy, this.oRouter.getTarget("secondTarget"));

		assert.strictEqual(this.oShell.getContent().length, 1, "Did place the view in the shell");
		assert.strictEqual(this.oSecondShell.getContent().length, 1, "Did place the view in the second shell");
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
		this.oRouter = new Router(this.oRouterConfig, this.oDefaults, null, oTargetConfig);
		var oPlaceSpy = this.spy(this.oRouter.getTarget("myTarget"), "_place");
		var oPlaceChildSpy = this.spy(this.oRouter.getTarget("myChild"), "_place");

		// Act
		this.oRouter.parse(this.sPattern);

		// Assert
		assert.strictEqual(oPlaceSpy.callCount, 1, "Did place myTarget");
		assert.strictEqual(oPlaceChildSpy.callCount, 1, "Did place myChild");
		sinon.assert.calledOn(oPlaceSpy, this.oRouter.getTarget("myTarget"));
		sinon.assert.calledOn(oPlaceChildSpy, this.oRouter.getTarget("myChild"));

		assert.strictEqual(this.oShell.getContent().length, 1, "Did place the view in the shell");
		assert.strictEqual(this.oSecondShell.getContent().length, 1, "Did place the view in the shell");
	});

	QUnit.module("getTargets", {
		before: HistoryUtils.check
	});

	QUnit.test("Should get the created targets instance", function (assert) {
		// System under test + arrange
		var oRouter = new Router({}, {}, null, {});

		assert.strictEqual(oRouter.getTargets(), oRouter._oTargets, "Did return the Targets instance");
	});

	QUnit.test("Should return undefined if no targets where defined", function (assert) {
			// TODO check this lines where to move
			// Assert
			// assert.strictEqual(this.oRouter._oTargets._oCache, this.oRouter._oViews, "Targets are using the same view repository");
			// assert.strictEqual(this.oRouter._oTargets._oConfig, this.oDefaults, "Targets are using the same defaults as the router");

		// System under test + arrange
		var oRouter = new Router();

		assert.strictEqual(oRouter.getTargets(), undefined, "Did not create a Targets instance");
	});

	QUnit.module("bypassed", {
		before: HistoryUtils.check,
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

		this.oRouter = new Router([
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
		this.oRouter = new Router([], {
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

		var fnDisplayFooStub = this.stub(this.oRouter.getTarget("foo"), "display"),
			fnDisplayBarStub = this.stub(this.oRouter.getTarget("bar"), "display");

		// Act
		this.oRouter.initialize();

		// Assert
		assert.strictEqual(fnDisplayFooStub.callCount, 1, "The foo target is displayed");
		assert.strictEqual(fnDisplayBarStub.callCount, 1, "The bar target is displayed");
		sinon.assert.calledWith(fnDisplayFooStub, sinon.match({ hash: "test"}));
		sinon.assert.calledWith(fnDisplayBarStub, sinon.match({ hash: "test"}));
	});

	QUnit.module("Bug fix in Crossroads", {
		before: HistoryUtils.check,
		beforeEach: addClock
	});

	QUnit.test("slash should be optional when it's between ')' and ':'", function (assert) {
		var callCount = 0,
			fnMatched = function (oEvent) {
				if (oEvent.getParameter("name") === "test") {
					callCount++;
				}
			};

		var oRouter = new Router([{
			name: "test",
			pattern: "product({id1})/:id2:"
		}]);

		oRouter.attachRoutePatternMatched(fnMatched);

		// Act
		oRouter.initialize();
		oRouter.parse("product(1)");

		this.clock.tick(0);

		// Assert
		assert.strictEqual(callCount, 1, "The route pattern matched handler should be called once");

		oRouter.destroy();
	});

	QUnit.test("Hash 'page12' shouldn't match pattern 'page1/:context:'", function(assert) {
		var oRouter = new Router([{
				name: "page1query",
				pattern: "page1/:context:/:?query:"
			}, {
				name: "page1",
				pattern: "page1/:context:"
			}, {
				name: "page12",
				pattern: "page12/:context:"
			}]),
			sMatchedRouteName,
			fnMatched = function (oEvent) {
				sMatchedRouteName = oEvent.getParameter("name");
			};

		oRouter.attachRouteMatched(fnMatched);

		// Act
		oRouter.initialize();
		oRouter.parse("page12");

		this.clock.tick(0);

		// Assert
		assert.strictEqual(sMatchedRouteName, "page12", "correct route is matched");

		oRouter.destroy();
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
		var oRouter = new Router([{
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
			//  to easily compare it with the value in aExpected
			Object.keys(oParam).forEach(function(sKey) {
				if (oParam[sKey] === undefined) {
					delete oParam[sKey];
				}
			});
			assert.deepEqual(oParam, aExpected[index], "results parsed correctly");
		});

		oRouter.destroy();
	});

	QUnit.test("Correctly parse the hash with optional params", function(assert) {
		var oRouter = new Router([{
			pattern: "{r1}/{r2}/:o1:/:o2:/:?q:", // pattern with two optional params
			name: "home"
		}]);

		var aExamples = [
			{
				hash: "v1/v2",
				working: true
			},
			{
				hash: "v1/v2/",
				working: true
			},
			{
				hash: "v1/v2//?a=b",
				working: true
			},
			{
				hash: "v1/v2///?a=b",
				working: true
			},
			{
				hash: "v1/v2/o1",
				working: true
			},
			{
				hash: "v1/v2/o1/",
				working: true
			},
			{
				hash: "v1/v2/o1/?a=b",
				working: true
			},
			{
				hash: "v1/v2/o1//?a=b",
				working: true
			},
							 {
				hash: "v1/v2/o1/o2",
				working: true
			},
			{
				hash: "v1/v2/o1/o2/",
				working: true
			},
			{
				hash: "v1/v2/o1/o2?a=b",
				working: true
			},
			{
				hash: "v1/v2/o1/o2/?a=b",
				working: true
			},
			{
				hash: "v1/v2/?a=b",
				working: true
			},
			{
				hash: "v1/v2/o1?a=b",
				working: true
			},
			{
				hash: "v1/v2?a=b",
				working: true
			}
		];

		var bMatched;
		aExamples.forEach(function(oExpected) {
			bMatched = oRouter.match(oExpected.hash);
			assert.equal(bMatched, oExpected.working, "Hash should match");
		});
	});

	QUnit.module("nested components", {
		before: HistoryUtils.check,
		beforeEach: function() {
			addClock.call(this);
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
				oParentRouteMatchedEvent = deepExtend({}, oEvent);
			}),
			oParentRoutePatternMatchedEventSpy = sinon.spy(),
			oChildRouteMatchedEvent,
			oChildRouteMatchedEventSpy = sinon.spy(function(oEvent) {
				oChildRouteMatchedEvent = deepExtend({}, oEvent);
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

		this.clock.tick(0);

		assert.strictEqual(oParentRouteMatchedEventSpy.callCount, 1, "routeMatched fired for parent route");
		assert.strictEqual(oParentRoutePatternMatchedEventSpy.callCount, 0, "routePatternMatched not fired for parent route");
		assert.strictEqual(oParentRouteMatchedEvent.getParameter("nestedRoute"), oChildRoute, "childRoute is passed to event listeners");
		assert.strictEqual(oChildRouteMatchedEventSpy.callCount, 1, "routeMatched fired for child route");
		assert.strictEqual(oChildRoutePatternMatchedEventSpy.callCount, 1, "routePatternMatched fired for child route");
		assert.strictEqual(oChildRouteMatchedEvent.getParameter("nestedRoute"), undefined, "no route is passed to event listeners");
	});

	QUnit.test("nesting for multiple components", function(assert) {
		// This is a pretty extensive test to cover any number of components beeing nested.
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
				aRouteMatchedEvents[i] = deepExtend({}, oEvent);
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

		this.clock.tick(0);

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
