/*global QUnit, sinon */
sap.ui.define([
	"sap/m/routing/Router",
	"sap/m/NavContainer",
	"sap/m/SplitContainer",
	"sap/m/Page",
	"sap/ui/core/routing/Views",
	"./commonIntegrationTests",
	"sap/m/routing/Target",
	"sap/ui/core/routing/Target",
	"./helpers",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/Device"
], function(
	Router,
	NavContainer,
	SplitContainer,
	Page,
	Views,
	integrationTests,
	MobileTarget,
	Target,
	helpers,
	createAndAppendDiv,
	Device
) {
	"use strict";

	// prepare DOM
	createAndAppendDiv("content");


	var fnCreateRouter = function() {
		var args = Array.prototype.slice.call(arguments);

		args.unshift(Router);

		if (args.length < 3) {
			args[2] = {};
		}
		if (args[2] === null) {
			args[2] = {};
		}
		args[2].async = true;

		return new (Function.prototype.bind.apply(Router, args))();
	};

	var fnGetView = function(oRouter, options) {
		var oViews = oRouter.getViews();

		return oViews.getView(options);
	};

	QUnit.module("Construction and destruction");

	QUnit.test("Should pass the targetHandler to the targets instance", function (assert) {
		// System under test
		var oRouter = fnCreateRouter(null, null, null, {});

		// Assert
		assert.strictEqual(oRouter._oTargets._oTargetHandler, oRouter._oTargetHandler, "Did pass the target handler");

		oRouter.destroy();
	});

	QUnit.test("Should work for routes which don't have view info", function (assert) {
		// Arrange + System under test
		var sPattern = "product",
				oRouter = fnCreateRouter([
					{
						name: "first",
						pattern: sPattern
					}
				]);

		var oRoute = oRouter.getRoute("first"),
			oListenerSpy = sinon.spy(),
			oRouteMatchedSpy = sinon.spy(oRoute, "_routeMatched");

		oRoute.attachPatternMatched(oListenerSpy);

		// Act
		oRouter.parse(sPattern);

		// If no view info is provided for a route, the internal target instance should not be sap.m.routing.Target
		assert.ok(oRoute._oTarget instanceof Target && !(oRoute._oTarget instanceof MobileTarget), "The internal target instance for old syntax should be only a core target");

		assert.strictEqual(oRouteMatchedSpy.callCount, 1, "first route is matched");

		return oRouteMatchedSpy.returnValues[0].then(function() {
			assert.strictEqual(oListenerSpy.callCount, 1, "first route gets pattern matched");

			// Cleanup
			oRouteMatchedSpy.restore();

			oRouter.destroy();
		});
	});

	QUnit.module("add and execute navigations", {
		beforeEach: function () {
			this.oStartPage = new Page();
			this.oNavContainer = new NavContainer({
				pages: this.oStartPage
			});
			this.sPattern = "some/{eventData}";
			this.oToPage = new Page();
			this.oTargetConfiguration = {
				controlId: this.oNavContainer.getId(),
				transition: "flip",
				viewName: "anyThingToPassValidation",
				viewLevel: 5,
				transitionParameters: { some: "parameter"}
			};
			// System under test
			this.oRouter = fnCreateRouter({
				myRoute: {
						pattern: this.sPattern,
						target: "myTarget"
					}
				},
				{
					controlAggregation: "pages"
				},
				null,
				{
					myTarget: this.oTargetConfiguration
				});
		},
		afterEach: function () {
			this.oNavContainer.destroy();
			this.oToPage.destroy();
			this.oStartPage.destroy();
			this.oRouter.destroy();
		}
	});

	QUnit.test("Should do a forward navigation", function (assert) {
		//Arrange
		var that = this,
			oToSpy = this.spy(this.oNavContainer, "to"),
			oNavigateSpy = this.spy(this.oRouter._oTargetHandler, "navigate"),
			oRouteMatchedSpy = sinon.spy(this.oRouter.getRoute("myRoute"), "_routeMatched"),
			fnDone = assert.async();

		this.stub(Views.prototype, "_getView").callsFake(function () {
			return that.oToPage;
		});

		//Act
		this.oRouter.parse("some/myData");
		return oRouteMatchedSpy.returnValues[0].then(function () {
			//Assert
			assert.strictEqual(oToSpy.callCount, 1, "did call the 'to' function on the oNavContainer instance");
			sinon.assert.calledWithExactly(oToSpy, this.oToPage.getId(), this.oTargetConfiguration.transition, { eventData: "myData"}, this.oTargetConfiguration.transitionParameters);

			assert.strictEqual(oNavigateSpy.callCount, 1, "did call the 'navigate' function on the TargetHandler instance");
			sinon.assert.calledWithExactly(oNavigateSpy, {
				askHistory: true,
				navigationIdentifier: "myTarget",
				level: 5
			});
			fnDone();
		}.bind(this));
	});

	///////////////////////////////////////////////////////
	/// Integation test
	///////////////////////////////////////////////////////
	QUnit.module("Integration tests");

	QUnit.test("Should respect the viewLevel for multiple targets", function (assert) {
		//Arrange
		var oNavContainer = new NavContainer(),
				oRouter = fnCreateRouter(
					{
						"route": {
							pattern: "anyPattern",
							target: ["first", "second"]
						}
					},
					{
						viewType: "XML",
						controlAggregation:"pages",
						controlId: oNavContainer.getId()
					},
					null,
					{
						first: {
							path: "m.test.views",
							viewName: "first"
						},
						second: {
							path: "m.test.views",
							viewName: "second",
							viewLevel: 0
						},
						initial: {
							path: "m.test.views",
							viewName: "initial",
							viewLevel: 1
						}
					}),
			fnBackSpy = this.spy(oNavContainer, "backToPage"),
			oRouteMatchedSpy = sinon.spy(oRouter.getRoute("route"), "_routeMatched"),
			fnDone = assert.async();

		// views
		Promise.all([
			helpers.createViewAndController("first"),
			helpers.createViewAndController("second"),
			helpers.createViewAndController("initial")
		]).then(function () {
			return oRouter.getTargets().display("initial").then(async function () {
					// Act
					oRouter.parse("anyPattern");
					var oView = await fnGetView(oRouter, {viewName: "m.test.views.second", viewType: "XML"});

					return oRouteMatchedSpy.returnValues[0].then(function () {
						// Assert
						assert.strictEqual(fnBackSpy.callCount, 1, "Did execute a back navigation");
						assert.strictEqual(fnBackSpy.firstCall.args[0], oView.getId(), "The second page was target of the back navigation");

						// Cleanup
						oRouter.destroy();
						fnDone();
					});
				});
			});
	});

	QUnit.test("Should take the viewLevel from the first ancester which has a viewLevel if a target doesn't have viewLevel defined", function (assert) {
		//Arrange
		var fnDone = assert.async(),
			oNavContainer = new NavContainer(),
			oRouter = fnCreateRouter(
				{
					"route": {
						pattern: "anyPattern",
						path: "m.test.views",
						target: ["third"]
					}
				},
				{
					viewType: "XML",
					path: "m.test.views",
					controlAggregation:"pages",
					controlId: oNavContainer.getId()
				},
				null,
				{
					first: {
						path: "m.test.views",
						viewName: "first",
						viewLevel: 1
					},
					second: {
						path: "m.test.views",
						parent: "first",
						viewName: "second"
					},
					third: {
						path: "m.test.views",
						parent: "second",
						viewName: "third"
					},
					initial: {
						path: "m.test.views",
						viewName: "initial",
						viewLevel: 2
					}
				}),
			fnBackSpy = this.spy(oNavContainer, "backToPage"),
			oRouteMatchedSpy = sinon.spy(oRouter.getRoute("route"), "_routeMatched"),
			oView;

		// views
		Promise.all([
			helpers.createViewAndController("first"),
			helpers.createViewAndController("second"),
			helpers.createViewAndController("third"),
			helpers.createViewAndController("initial")
		]).then(async function() {
			oView = await fnGetView(oRouter, { viewName: "m.test.views.third", type: "XML" });
			oRouter.getTargets().display("initial").then(function () {
				// Act
				oRouter.parse("anyPattern");
				return oRouteMatchedSpy.returnValues[0].then(function () {
					// Assert
					assert.strictEqual(fnBackSpy.callCount, 1, "Did execute a back navigation");
					assert.strictEqual(fnBackSpy.firstCall.args[0], oView.getId(), "The second page was target of the back navigation");

					// Cleanup
					oRouter.destroy();
					fnDone();
				});
			});
		});
	});

	QUnit.test("Should pass some data to the SplitContainer", function (assert) {
		//Arrange
		var fnDone = assert.async(),
			oMasterView;

		helpers.createViewAndController("InitialMaster").then(function(oView) {
			var oSplitContainer = new SplitContainer({
				masterPages: [oView]
			}),
			oRouter = fnCreateRouter({
				"Master": {
					targetControl: oSplitContainer.getId(),
					pattern: "{id}",
					path: "m.test.views",
					view: "Master",
					viewType: "XML",
					targetAggregation: "masterPages"
				}
			}),
			data = null,
			oRouteMatchedSpy = sinon.spy(oRouter.getRoute("Master"), "_routeMatched");

			this.stub(Device.system, "phone").value(false);

			// views
			helpers.createViewAndController("Master").then(async function () {
				oMasterView = await fnGetView(oRouter, { viewName: "m.test.views.Master", type: "XML" });
				oMasterView.addEventDelegate({
					onBeforeShow: function (oEvent) {
						data = oEvent.data.id;
					}
				});

				// Act
				oRouter.parse("5");
				return oRouteMatchedSpy.returnValues[0].then(function () {
					// Assert
					assert.strictEqual(data, "5", "should pass 5 to the page");

					// Cleanup
					oRouter.destroy();
					fnDone();
				});
			});
		}.bind(this));
	});

	QUnit.test("Should pass some data to the initial page of NavContainer", function(assert) {
		assert.expect(1);

		var oNavContainer = new NavContainer(),
			oRouter = fnCreateRouter({
				route1: {
					targetControl: oNavContainer.getId(),
					pattern: "{id}",
					path: "m.test.views",
					view: "view1",
					viewType: "XML",
					targetAggregation: "pages"
				}
			}),
			data = null,
			done = assert.async(),
			oView;

		// views
		helpers.createViewAndController("view1").then(async function () {
			oView = await fnGetView(oRouter, { viewName: "m.test.views.view1", type: "XML" });
			oView.addEventDelegate({
				onBeforeShow: function(oEvent) {
					data = oEvent.data.id;
					// Assert
					assert.strictEqual(data, "5", "should pass 5 to the page");
				},
				onAfterShow: function(oEvent) {
					// Cleanup
					oRouter.destroy();
					oNavContainer.destroy();

					done();
				}
			});

			oRouter.getRoute("route1").attachMatched(function() {
				oNavContainer.placeAt("content");
			});

			// Act
			oRouter.parse("5");
		});
	});

	QUnit.test("Should pass some data to the initial pages of SplitContainer", function(assert) {
		assert.expect(2);

		var oSplitContainer = new SplitContainer(),
			oRouter = fnCreateRouter({
				route1: {
					pattern: "{id}",
					path: "m.test.views",
					target: ["master", "detail"]
				}
			}, {
				viewType: "XML",
				controlId: oSplitContainer.getId()
			}, null, {
				master: {
					controlAggregation: "masterPages",
					path: "m.test.views",
					viewName: "Master"
				},
				detail: {
					controlAggregation: "detailPages",
					path: "m.test.views",
					viewName: "Detail"
				}
			}),
			oMasterData = null,
			oDetailData = null,
			done = assert.async(),
			oMasterView,
			oDetailView;

		// views
		Promise.all([
			helpers.createViewAndController("Master"),
			helpers.createViewAndController("Detail")
		]).then(async function() {
			oMasterView = await fnGetView(oRouter, { viewName: "m.test.views.Master", type: "XML" });
			oDetailView = await fnGetView(oRouter, { viewName: "m.test.views.Detail", type: "XML" });
			oMasterView.addEventDelegate({
				onBeforeShow: function(oEvent) {
					oMasterData = oEvent.data.id;
				}
			});
			oDetailView.addEventDelegate({
				onBeforeShow: function(oEvent) {
					oDetailData = oEvent.data.id;
					// Assert
					assert.strictEqual(oMasterData, "5", "should pass 5 to the master page");
					assert.strictEqual(oDetailData, "5", "should pass 5 to the detail page");
				},
				onAfterShow: function(oEvent) {
					// Cleanup
					oRouter.destroy();
					oSplitContainer.destroy();
					done();
				}
			});

			oRouter.getRoute("route1").attachMatched(function() {
				oSplitContainer.placeAt("content");
			});

			// Act
			oRouter.parse("5");
		});
	});

	QUnit.module("Routes using targets mixed with old routes");

	QUnit.test("Should be able to handle the mixed case", function (assert) {
		this.oMasterDummy = new Page();
		this.oDetailDummy = new Page();
		this.oSplitContainer = new SplitContainer({
			masterPages: this.oMasterDummy,
			detailPages: this.oDetailDummy
		});
		var fnDone = assert.async();

		Promise.all([
			helpers.createViewAndController("Master"),
			helpers.createViewAndController("Detail")
		]).then(function (aViews) {
			this.oMasterView = aViews[0];
			this.oDetailView = aViews[1];
			this.sPattern = "somePattern";
			// System under test
			this.oRouter = fnCreateRouter({
						myMasterRoute: {
							targetAggregation: "masterPages",
							path: "m.test.views",
							view: "Master",
							subroutes: [
								{
									name: "detailRoute",
									pattern: this.sPattern,
									path: "m.test.views",
									target: "detailTarget"
								}
							]
						}
					},
					{
						transition: "flip",
						viewLevel: 5,
						transitionParameters: { some: "parameter"},
						controlId: this.oSplitContainer.getId(),
						path: "m.test.views",
						targetControl: this.oSplitContainer.getId(),
						targetAggregation: "detailPages",
						controlAggregation: "detailPages",
						viewType: "XML"
					},
					null,
					{
						detailTarget: {
							path: "m.test.views",
							viewName: "Detail"
						}
					});
				var oRouteMatchedSpy = sinon.spy(this.oRouter.getRoute("detailRoute"), "_routeMatched");

				this.oRouter.getViews().setView("m.test.views.Detail", this.oDetailView);
				this.oRouter.getViews().setView("m.test.views.Master", this.oMasterView);
				this.oRouter.parse(this.sPattern);

				return oRouteMatchedSpy.returnValues[0].then(function () {
					// Assert
					assert.strictEqual(this.oSplitContainer.getCurrentDetailPage(), this.oDetailView, "Did navigate to detail");
					assert.strictEqual(this.oSplitContainer.getCurrentMasterPage(), this.oMasterView, "Did navigate to master");

					// Clean-up
					this.oSplitContainer.destroy();
					this.oRouter.destroy();
					fnDone();
				}.bind(this));
		}.bind(this));
	});

	integrationTests.start({
		beforeEach: function (oConfig) {
			var oRouter = fnCreateRouter(oConfig);
			this.oGetViewStub = sinon.stub(oRouter._oViews, "_getViewWithGlobalId").callsFake(helpers.createViewMock);

			this.oRouter = oRouter;
			return oRouter;
		},
		act: function (sPatternOrName, assert) {
			var oRouteMatchedSpy = sinon.spy(this.oRouter.getRoute(sPatternOrName), "_routeMatched");
			this.oRouter.parse(sPatternOrName);
			if (assert) {
				assert.strictEqual(oRouteMatchedSpy.callCount, 1, "_routeMatched method is called once");
			}
			var oPromise = oRouteMatchedSpy.returnValues[0];
			oRouteMatchedSpy.restore();
			return oPromise;
		},
		afterEach: function () {
			this.oGetViewStub.restore();
			this.oRouter.destroy();
		}
	});


	QUnit.module("Order of navigation methods and events");

	QUnit.test("TargetHandler's addNavigation, navigate and routeMatched event should be called in the correct order", function(assert) {
		var oApp = new NavContainer("container");
		var oRouter = fnCreateRouter(
			{
				"route": {
					pattern: "anyPattern",
					target: ["first", "second"]
				}
			},
			{
				viewType: "XML",
				controlAggregation:"pages",
				controlId: "container"
			},
			null,
			{
				first: {
					path: "m.test.views",
					viewName: "first"
				},
				second: {
					path: "m.test.views",
					viewName: "second",
					viewLevel: 0
				}
			});

		var aCalledOrder = [];
		var oTargetHandler = oRouter.getTargetHandler();

		sinon.stub(oTargetHandler, "addNavigation").callsFake(function() {
			aCalledOrder.push("addNavigation");
		});

		sinon.stub(oTargetHandler, "navigate").callsFake(function() {
			aCalledOrder.push("navigate");
		});

		oRouter.attachRouteMatched(function() {
			aCalledOrder.push("routeMatched");
		});

		var oRoute = oRouter.getRoute("route");
		var oRouteMatchedSpy = sinon.spy(oRoute, "_routeMatched");

		oRouter.parse("anyPattern");

		assert.equal(oRouteMatchedSpy.callCount, 1, "Route is matched");
		var oPromise = oRouteMatchedSpy.getCall(0).returnValue;
		return oPromise.then(function() {
			assert.deepEqual(aCalledOrder, ["addNavigation", "addNavigation", "navigate", "routeMatched"]);
			oApp.destroy();
		});
	});
});