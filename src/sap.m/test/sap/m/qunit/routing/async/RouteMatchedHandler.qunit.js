/*global QUnit, sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */

sap.ui.define([
	"sap/m/routing/RouteMatchedHandler",
	"sap/m/NavContainer",
	"sap/m/SplitContainer",
	"sap/ui/core/routing/HashChanger",
	"sap/ui/core/routing/Router",
	"sap/ui/core/routing/History",
	"sap/m/routing/TargetHandler",
	"sap/m/InstanceManager",
	"./commonIntegrationTests",
	"sap/m/Page",
	"./helpers",
	"sap/ui/Device"
], function(
	RouteMatchedHandler,
	NavContainer,
	SplitContainer,
	HashChanger,
	Router,
	History,
	TargetHandler,
	InstanceManager,
	integrationTests,
	Page,
	helpers,
	Device
) {
	"use strict";

	HashChanger.getInstance().init();

	var fnCreateRouter = function() {
		var args = Array.prototype.slice.call(arguments);

		args.unshift(Router);

		if (args.length < 3) {
			args[2] = {};
		}
		args[2].async = true;

		return new (Function.prototype.bind.apply(Router, args))();
	};

	QUnit.module("initialization");

	function createViewAndController(sName) {
		sap.ui.controller(sName, {});
		sap.ui.jsview(sName, {
			createContent: function () {
			},
			getController: function () {
				return sap.ui.controller(sName);
			}
		});

		return sap.ui.jsview(sName);
	}

	QUnit.test("Should destroy correctly", function (assert) {
		//Arrange
		var oRouteMatchedSpy = this.spy(RouteMatchedHandler.prototype, "_onHandleRouteMatched"),
			oRoutePatternMatchedSpy = this.spy(RouteMatchedHandler.prototype, "_handleRoutePatternMatched"),
			oRouter = fnCreateRouter({
				myRoute : {}
			}),
			//System under Test
			oRouteMatchedHandler = new RouteMatchedHandler(oRouter, false);


		//Fire once to make sure we registered
		oRouter.fireRouteMatched({config: {}, name: "myRoute"});
		oRouter.fireRoutePatternMatched({config: {}});

		assert.strictEqual(oRouteMatchedSpy.callCount, 1, "did fire the event");
		assert.strictEqual(oRoutePatternMatchedSpy.callCount, 1, "did fire the pattern matched event");

		//Act
		oRouteMatchedHandler.destroy();

		//Fire the events again
		oRouter.fireRouteMatched({config: {}});
		oRouter.fireRoutePatternMatched({config: {}});

		//Assert
		assert.strictEqual(oRouteMatchedSpy.callCount, 1, "did not fire the event again");
		assert.strictEqual(oRoutePatternMatchedSpy.callCount, 1, "did not fire the pattern matched event again");

		assert.strictEqual(oRouteMatchedHandler.getCloseDialogs(), false, "close dialogs was set to false");
	});

	QUnit.module("Transition Directions");

	QUnit.test("Should forward the Direction info to the TargetHandler", function (assert) {
		//Arrange
		var view = createViewAndController("dummy"),
			oRouter = fnCreateRouter({
				myRoute : {}
			}),
			oNavContainer = new NavContainer(),
			oEvent = {
				config: {
					viewLevel: 1
				},
				name: "myRoute",
				view: "foo",
				targetControl: oNavContainer
			},
			oNavigateStub = this.stub(TargetHandler.prototype, "navigate");

		//System under Test
		var oRouteMatchedHandler = new RouteMatchedHandler(oRouter);

		//Act
		oRouter.fireRoutePatternMatched(oEvent);

		//Assert
		assert.strictEqual(oNavigateStub.callCount, 1, "did call navigate");
		var oDirectionInfo = oNavigateStub.firstCall.args[0];

		assert.strictEqual(oEvent.config.viewLevel, oDirectionInfo.viewLevel, "did have the correct viewlevel");
		assert.ok(oDirectionInfo.askHistory, "did ask the history");

		oRouter.destroy();
	});

	QUnit.module("Managing Containers", {
		beforeEach: function () {
			this.oRouter = fnCreateRouter({
				myRoute: {}
			});
		},
		afterEach: function () {
			this.oRouter.destroy();
		}
	});

	QUnit.test("Should do a forward navigation", function (assert) {
		//Arrange
		var view = createViewAndController("dummy"),
			oNavContainer = new NavContainer({
				pages: [ createViewAndController("initial"), view]
			}),
			oEvent = {
				targetControl: oNavContainer,
				arguments: { foo: "bar" },
				config: {
					transition: "flip",
					transitionParameters: { testie: "test"}
				},
				view: view,
				name: "myRoute"
			},
			oToSpy = this.spy(NavContainer.prototype, "to");

		//System under Test
		var oRouteMatchedHandler = new RouteMatchedHandler(this.oRouter);

		//Act
		this.oRouter.fireRouteMatched(oEvent);
		this.oRouter.fireRoutePatternMatched(oEvent);

		//Assert
		assert.strictEqual(oToSpy.callCount, 1, "did call the 'to' function on the oNavContainer instance");
		var oFirstCall = oToSpy.firstCall;

		assert.strictEqual(oFirstCall.args[0], oEvent.view.getId(), "did navigate to the correct view");
		assert.strictEqual(oFirstCall.args[1], oEvent.config.transition, "did show the correct transition");
		assert.strictEqual(oFirstCall.args[2], oEvent.arguments, "did pass the correct arguments");
		assert.strictEqual(oFirstCall.args[3], oEvent.config.transitionParameters, "did pass the transition parameters");
	});

	QUnit.test("Should do a backwards navigation", function (assert) {
		//Arrange
		var view = createViewAndController("dummy"),
			oRouter = fnCreateRouter(),
			oSplitContainer = new SplitContainer({
				masterPages: [ createViewAndController("initial"), view]
			}),
			oEvent = {
				targetControl: oSplitContainer,
				arguments: { foo: "bar" },
				config: {
					transition: "flip",
					transitionParameters: { testie: "test"}
				},
				view: view,
				name: "myRoute"
			},
			oInsertPreviousPageSpy = this.spy(NavContainer.prototype, "insertPreviousPage"),
			oBackToPageSpy = this.spy(NavContainer.prototype, "backToPage");

		//simulate backwards navigation
		this.stub(History.prototype, "getDirection").returns("Backwards");

		//System under Test
		var oRouteMatchedHandler = new RouteMatchedHandler(this.oRouter);

		//Act
		this.oRouter.fireRouteMatched(oEvent);
		this.oRouter.fireRoutePatternMatched(oEvent);

		//Assert
		assert.strictEqual(oInsertPreviousPageSpy.callCount, 1, "did insert the page in the navigation stack");
		assert.strictEqual(oBackToPageSpy.callCount, 1, "did a backwards navigation to the page");

		var oInsertCall = oInsertPreviousPageSpy.firstCall;
		var oBackCall = oBackToPageSpy.firstCall;

		assert.strictEqual(oInsertCall.args[0], oEvent.view.getId(), "did insert the correct view");
		assert.strictEqual(oInsertCall.args[1], oEvent.config.transition, "did show the correct transition");
		assert.strictEqual(oInsertCall.args[2], oEvent.arguments, "did pass the correct arguments");

		assert.strictEqual(oBackCall.args[0], oEvent.view.getId(), "did a back to the correct view");
		assert.strictEqual(oBackCall.args[1], oEvent.arguments, "did pass the correct arguments");
		assert.strictEqual(oBackCall.args[2], oEvent.config.transitionParameters, "did pass the transition parameters");
	});

	QUnit.test("Should not navigate if the currentPage is already displayed", function (assert) {
		//Arrange
		var view = createViewAndController("dummy"),
			oNavContainer = new NavContainer({
				pages: [ view]
			}),
			oEvent = {
				targetControl: oNavContainer,
				config: {},
				view: view,
				name: "myRoute"
			},
			oToSpy = this.spy(NavContainer.prototype, "to"),
			oNavigateSpy = this.spy(TargetHandler.prototype, "navigate");

		this.stub(oNavContainer, "getDomRef").returns(true);

		//System under Test
		var oRouteMatchedHandler = new RouteMatchedHandler(this.oRouter);

		//Act
		this.oRouter.fireRouteMatched(oEvent);
		this.oRouter.fireRoutePatternMatched(oEvent);

		//Assert
		assert.strictEqual(oToSpy.callCount, 0, "did not call the 'to' function on the oNavContainer instance");
		assert.strictEqual(oNavigateSpy.callCount, 1, "did call navigate");
	});

	QUnit.module("Dialog closing", {
		beforeEach: function () {
			var oPageToNavigateTo = new Page();
			this.oNavContainer = new NavContainer({
				pages: [ new Page(), oPageToNavigateTo ]
			});
			this.oEvent = {
				targetControl: this.oNavContainer,
				config: {},
				view: oPageToNavigateTo,
				name: "myRoute"
			};
			this.oRouter = fnCreateRouter({
				myRoute: {}
			});
		},
		afterEach: function () {
			this.oNavContainer.destroy();
			this.oRouter.destroy();
		}
	});

	function closeDialogsTestCase (assert, bCloseDialogs) {
		//Arrange
		var iExpectedCallCount = bCloseDialogs ? 1 : 0,
			oCloseAllPopoversSpy = this.spy(InstanceManager, "closeAllPopovers"),
			oCloseAllDialogsSpy = this.spy(InstanceManager, "closeAllDialogs"),

			//System under Test
			oRouteMatchedHandler = new RouteMatchedHandler(this.oRouter, bCloseDialogs);

		this.stub(InstanceManager, "hasOpenPopover").returns(true);
		this.stub(InstanceManager, "hasOpenDialog").returns(true);

		//Act
		this.oRouter.fireRouteMatched(this.oEvent);
		this.oRouter.fireRoutePatternMatched(this.oEvent);

		//Assert
		assert.strictEqual(oCloseAllPopoversSpy.callCount, iExpectedCallCount, "did close the popups");
		assert.strictEqual(oCloseAllDialogsSpy.callCount, iExpectedCallCount, "did close the dialogs");
	}

	QUnit.test("Should close all dialogs", function (assert) {
		closeDialogsTestCase.call(this, assert, true);
	});

	QUnit.test("Should not close all dialogs", function (assert) {
		closeDialogsTestCase.call(this, assert, false);
	});

	QUnit.test("Should get/set close all dialogs", function (assert) {
		// System under test
		var oRouteMatchedHandler = new RouteMatchedHandler(fnCreateRouter());

		// Assert + Act
		assert.ok(oRouteMatchedHandler.getCloseDialogs(), "By default the routematched handler closes dialogs");

		oRouteMatchedHandler.setCloseDialogs(false);

		assert.ok(!oRouteMatchedHandler.getCloseDialogs(), "The setter changed the getter");
		assert.ok(!oRouteMatchedHandler._oTargetHandler.getCloseDialogs(), "The setter changed the getter");
	});


	QUnit.module("Routing with targets", {
		beforeEach: function () {
			this.oDummyMaster = createViewAndController("DummyMaster");
			this.oDummyDetail = createViewAndController("DummyDetail");
			this.oSplitContainer = new SplitContainer({
				masterPages: [ this.oDummyMaster ],
				detailPages: [ this.oDummyDetail ]
			});
		},
		afterEach: function () {
			this.oSplitContainer.destroy();
			this.oDummyMaster.destroy();
			this.oDummyDetail.destroy();
		}
	});

	QUnit.test("Should also work for routes with targets", function (assert) {
		//Arrange
		var oMasterView = createViewAndController("Master"),
			oDetailView = createViewAndController("Detail"),
			sPattern = "anything",
			oRouter =  fnCreateRouter({
				detail: {
					pattern: sPattern,
					target: ["master", "detail"]
				}
			},
			{
				controlId: this.oSplitContainer.getId(),
				viewType: "JS"
			},
			null,
			{
				master: {
					viewName: "Master",
					controlAggregation: "masterPages"
				},
				detail: {
					viewName: "Detail",
					controlAggregation: "detailPages"
				}
			}),
			oRouteMatchedSpy = sinon.spy(oRouter.getRoute("detail"), "_routeMatched");

		this.stub(Device.system, "phone").value(false);

		// System under test
		var oRouteMatchedHandler = new RouteMatchedHandler(oRouter);

		//Act
		oRouter.parse(sPattern);
		return oRouteMatchedSpy.returnValues[0].then(function() {
			//Assert
			assert.strictEqual(this.oSplitContainer.getCurrentDetailPage().getViewName(), "Detail", "did navigate to the detail view");
			assert.strictEqual(this.oSplitContainer.getCurrentMasterPage().getViewName(), "Master", "did navigate to the master view");

			oMasterView.destroy();
			oDetailView.destroy();
			oRouter.destroy();
			oRouteMatchedHandler.destroy();

			oRouteMatchedSpy.restore();
		}.bind(this));
	});

	QUnit.test("Should work with routes without targets mixed with routes with targets", function (assert) {
		//Arrange
		var oMasterView = createViewAndController("Master"),
			oDetailView = createViewAndController("Detail"),
			sPattern = "anything",
			oRouter =  fnCreateRouter({
				master: {
					view: "Master",
					targetControl: this.oSplitContainer.getId(),
					targetAggregation: "masterPages",
					subroutes: {
						detail: {
							pattern: sPattern,
							target: ["detail"]
						}
					}
				}
			},
			{
				viewType: "JS"
			},
			null,
			{
				detail: {
					viewName: "Detail",
					controlAggregation: "detailPages",
					controlId: this.oSplitContainer.getId()
				}
			});

		this.stub(Device.system, "phone").value(false);

		// System under test
		var oRouteMatchedHandler = new RouteMatchedHandler(oRouter);
		var fnAddNavigationSpy = sinon.spy(oRouteMatchedHandler._oTargetHandler, "addNavigation");
		var oRouteMatchedSpy = sinon.spy(oRouter.getRoute("detail"), "_routeMatched");
		// Act
		oRouter.parse(sPattern);
		return oRouteMatchedSpy.returnValues[0].then(function() {
			//Assert
			assert.strictEqual(this.oSplitContainer.getCurrentDetailPage().getViewName(), "Detail", "did navigate to the detail view");
			assert.strictEqual(this.oSplitContainer.getCurrentMasterPage().getViewName(), "Master", "did navigate to the master view");
			assert.strictEqual(fnAddNavigationSpy.callCount, 2, "did add exactly 2 navigations");

			oMasterView.destroy();
			oDetailView.destroy();
			oRouter.destroy();
			oRouteMatchedHandler.destroy();
			oRouteMatchedSpy.restore();
			fnAddNavigationSpy.restore();
		}.bind(this));
	});

	///////////////////////////////////////////////////////
	/// Integation test
	///////////////////////////////////////////////////////
	QUnit.module("Integration tests");

	QUnit.test("Should pass some data to the navContainer", function (assert) {
		//Arrange
		var oSplitContainer = new SplitContainer({
				masterPages: [createViewAndController("InitialMaster")]
			}),
			oRouter = fnCreateRouter({
				"Master": {
					targetControl: oSplitContainer.getId(),
					pattern: "{id}",
					view: "Master",
					viewType: "JS",
					targetAggregation: "masterPages"
				}
			}),
			data = null;

		this.stub(Device.system, "phone").value(false);
		var oRouteMatchedSpy = sinon.spy(oRouter.getRoute("Master"), "_routeMatched");

		// System under test
		var oRouteMatchedHandler = new RouteMatchedHandler(oRouter);


		// views
		createViewAndController("Master");

		oRouter.getView("Master", "JS").addEventDelegate({
			onBeforeShow: function (oEvent) {
				data = oEvent.data.id;
			}
		});

		// Act
		oRouter.parse("5");
		return oRouteMatchedSpy.returnValues[0].then(function() {
			// Assert
			assert.strictEqual(data, "5", "should pass 5 to the page");

			// Cleanup
			oRouter.destroy();
			oRouteMatchedSpy.restore();
		});
	});

	integrationTests.start({
		beforeEach: function (oConfig) {
			var oRouter = fnCreateRouter(oConfig);
			this.oGetViewStub = sinon.stub(oRouter._oViews, "_getViewWithGlobalId").callsFake(helpers.createViewMock);

			this.oRouter = oRouter;
			this.oRouteMatchedHandler = new RouteMatchedHandler(oRouter);
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
			this.oRouter.destroy();
			this.oRouteMatchedHandler.destroy();
		}
	});
});
