/*global QUnit, sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/m/routing/Router",
	"sap/m/routing/TargetHandler",
	"sap/m/NavContainer",
	"sap/m/SplitContainer",
	"sap/m/Page",
	"sap/ui/core/routing/Views",
	"./commonIntegrationTests",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/Device"
], function(
	Router,
	TargetHandler,
	NavContainer,
	SplitContainer,
	Page,
	Views,
	integrationTests,
	qutils,
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
		args[2].async = false;

		return new (Function.prototype.bind.apply(Router, args))();
	};

	QUnit.module("Construction and destruction");

	QUnit.test("Should pass the targetHandler to the targets instance", function (assert) {
		// System under test
		var oRouter = fnCreateRouter(null, null, null, {});

		// Assert
		assert.strictEqual(oRouter._oTargets._oTargetHandler, oRouter._oTargetHandler, "Did pass the target handler");

		oRouter.destroy();
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
				oNavigateSpy = this.spy(this.oRouter._oTargetHandler, "navigate");

		this.stub(Views.prototype, "_getView").callsFake(function () {
			return that.oToPage;
		});

		//Act
		this.oRouter.parse("some/myData");

		//Assert
		assert.strictEqual(oToSpy.callCount, 1, "did call the 'to' function on the oNavContainer instance");
		sinon.assert.calledWithExactly(oToSpy, this.oToPage.getId(), this.oTargetConfiguration.transition, { eventData: "myData"}, this.oTargetConfiguration.transitionParameters);

		assert.strictEqual(oNavigateSpy.callCount, 1, "did call the 'navigate' function on the TargetHandler instance");
		sinon.assert.calledWithExactly(oNavigateSpy, {
			askHistory: true,
			navigationIdentifier: "myTarget",
			viewLevel: 5
		});
	});

	///////////////////////////////////////////////////////
	/// Integation test
	///////////////////////////////////////////////////////
	QUnit.module("Integration tests");

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
						viewType: "JS",
						controlAggregation:"pages",
						controlId: oNavContainer.getId()
					},
					null,
					{
						first: {
							viewName: "first"
						},
						second: {
							viewName: "second",
							viewLevel: 0
						},
						initial: {
							viewName: "initial",
							viewLevel: 1
						}
					}),
				fnBackSpy = this.spy(oNavContainer, "backToPage");

		// views
		createViewAndController("first");
		createViewAndController("second");
		createViewAndController("initial");

		oRouter.getTargets().display("initial");

		// Act
		oRouter.parse("anyPattern");

		// Assert
		assert.strictEqual(fnBackSpy.callCount, 1, "Did execute a back navigation");
		assert.strictEqual(fnBackSpy.firstCall.args[0], oRouter.getView("second").getId(), "The second page was target of the back navigation");

		// Cleanup
		oRouter.destroy();
	});

	QUnit.test("Should take the viewLevel from the first ancester which has a viewLevel if a target doesn't have viewLevel defined", function (assert) {
		//Arrange
		var oNavContainer = new NavContainer(),
			oRouter = fnCreateRouter(
				{
					"route": {
						pattern: "anyPattern",
						target: ["third"]
					}
				},
				{
					viewType: "JS",
					controlAggregation:"pages",
					controlId: oNavContainer.getId()
				},
				null,
				{
					first: {
						viewName: "first",
						viewLevel: 1
					},
					second: {
						parent: "first",
						viewName: "second"
					},
					third: {
						parent: "second",
						viewName: "third"
					},
					initial: {
						viewName: "initial",
						viewLevel: 2
					}
				}),
			fnBackSpy = this.spy(oNavContainer, "backToPage");

		// views
		createViewAndController("first");
		createViewAndController("second");
		createViewAndController("third");
		createViewAndController("initial");

		oRouter.getTargets().display("initial");

		// Act
		oRouter.parse("anyPattern");

		// Assert
		assert.strictEqual(fnBackSpy.callCount, 1, "Did execute a back navigation");
		assert.strictEqual(fnBackSpy.firstCall.args[0], oRouter.getView("third").getId(), "The second page was target of the back navigation");

		// Cleanup
		oRouter.destroy();
	});


	QUnit.test("Should pass some data to the SplitContainer", function (assert) {
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

		// views
		createViewAndController("Master");

		oRouter.getView("Master", "JS").addEventDelegate({
			onBeforeShow: function (oEvent) {
				data = oEvent.data.id;
			}
		});

		// Act
		oRouter.parse("5");

		// Assert
		assert.strictEqual(data, "5", "should pass 5 to the page");

		// Cleanup
		oRouter.destroy();
	});

	QUnit.test("Should pass some data to the initial page of NavContainer", function(assert) {
		assert.expect(1);

		var oNavContainer = new NavContainer(),
			oRouter = fnCreateRouter({
				route1: {
					targetControl: oNavContainer.getId(),
					pattern: "{id}",
					view: "view1",
					viewType: "JS",
					targetAggregation: "pages"
				}
			}),
			data = null,
			done = assert.async();

		// views
		createViewAndController("view1");
		oRouter.getView("view1", "JS").addEventDelegate({
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

	QUnit.test("Should pass some data to the initial pages of SplitContainer", function(assert) {
		assert.expect(2);

		var oSplitContainer = new SplitContainer(),
			oRouter = fnCreateRouter({
				route1: {
					pattern: "{id}",
					target: ["master", "detail"]
				}
			}, {
				viewType: "JS",
				controlId: oSplitContainer.getId()
			}, null, {
				master: {
					controlAggregation: "masterPages",
					viewName: "master"
				},
				detail: {
					controlAggregation: "detailPages",
					viewName: "detail"
				}
			}),
			oMasterData = null,
			oDetailData = null,
			done = assert.async();

		// views
		createViewAndController("master");
		createViewAndController("detail");
		oRouter.getView("master", "JS").addEventDelegate({
			onBeforeShow: function(oEvent) {
				oMasterData = oEvent.data.id;
			}
		});
		oRouter.getView("detail", "JS").addEventDelegate({
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

	QUnit.module("Routes using targets mixed with old routes", {
		beforeEach: function () {
			this.oMasterDummy = new Page();
			this.oDetailDummy = new Page();
			this.oSplitContainer = new SplitContainer({
				masterPages: this.oMasterDummy,
				detailPages: this.oDetailDummy
			});
			this.oMasterView = createViewAndController("Master");
			this.oDetailView = createViewAndController("Detail");
			this.sPattern = "somePattern";
			// System under test
			this.oRouter = fnCreateRouter({
						myMasterRoute: {
							targetAggregation: "masterPages",
							view: "Master",
							subroutes: [
								{
									name: "detailRoute",
									pattern: this.sPattern,
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
						targetControl: this.oSplitContainer.getId(),
						targetAggregation: "detailPages",
						controlAggregation: "detailPages",
						viewType: "JS"
					},
					null,
					{
						detailTarget: {
							viewName: "Detail"
						}
					});
			this.oRouter.getViews().setView("Detail", this.oDetailView);
			this.oRouter.getViews().setView("Master", this.oMasterView);
		},
		afterEach: function () {
			this.oSplitContainer.destroy();
			this.oRouter.destroy();
		}
	});

	QUnit.test("Should be able to handle the mixed case", function (assert) {
		this.oRouter.parse(this.sPattern);

		assert.strictEqual(this.oSplitContainer.getCurrentDetailPage(), this.oDetailView, "Did navigate to detail");
		assert.strictEqual(this.oSplitContainer.getCurrentMasterPage(), this.oMasterView, "Did navigate to master");
	});

	integrationTests.start({
		beforeEach: function (oConfig) {
			var oRouter = fnCreateRouter(oConfig);

			this.oRouter = oRouter;
			return oRouter;
		},
		act: function (sPatternOrName) {
			this.oRouter.parse(sPatternOrName);
		},
		afterEach: function () {
			this.oRouter.destroy();
		}
	});
});