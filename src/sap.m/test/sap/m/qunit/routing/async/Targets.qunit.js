/*global QUnit, sinon */
sap.ui.define([
	"sap/m/routing/Targets",
	"sap/m/NavContainer",
	"sap/m/Page",
	"sap/ui/core/routing/Route",
	"sap/ui/core/routing/Views",
	"./commonIntegrationTests",
	"./helpers"
], function (Targets, NavContainer, Page, Route, Views, integrationTests, helpers) {
	"use strict";

	QUnit.module("add and execute navigations", {
		beforeEach: function () {
			var that = this;
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
			this.oViews = new Views({async: true});
			// System under test
			this.oTargets = new Targets({
				targets: {
					myTarget: this.oTargetConfiguration
				},
				config: {
					controlAggregation: "pages",
					async: true
				},
				views: this.oViews
			});
			this.oViewMock = {
				loaded: function() {
					return Promise.resolve(that.oToPage);
				},
				isA: function(sClass) {
					return sClass === "sap.ui.core.mvc.View";
				}
			};
		},
		afterEach: function () {
			this.oNavContainer.destroy();
			this.oToPage.destroy();
			this.oStartPage.destroy();
			this.oTargets.destroy();
			this.oViews.destroy();
		}
	});

	QUnit.test("Should do a forward navigation", function (assert) {
		//Arrange
		var that = this,
			oToSpy = sinon.spy(this.oNavContainer, "to"),
			oNavigateSpy = sinon.spy(this.oTargets._oTargetHandler, "navigate"),
			oEventData = { eventData: "myData"};

		this.stub(Views.prototype, "_getView").callsFake(function () {
			return that.oViewMock;
		});

		//Act
		return this.oTargets.display("myTarget", oEventData).then(function() {
			//Assert
			assert.strictEqual(oToSpy.callCount, 1, "did call the 'to' function on the oNavContainer instance");
			sinon.assert.calledWithExactly(oToSpy, this.oToPage.getId(), this.oTargetConfiguration.transition, oEventData, this.oTargetConfiguration.transitionParameters);

			assert.strictEqual(oNavigateSpy.callCount, 1, "did call the 'navigate' function on the TargetHandler instance");
			sinon.assert.calledWithExactly(oNavigateSpy, {
				navigationIdentifier: "myTarget",
				viewLevel: 5,
				askHistory: true
			});
			oToSpy.restore();
			oNavigateSpy.restore();
		}.bind(this));

	});

	///////////////////////////////////////////////////////
	/// Integation test
	///////////////////////////////////////////////////////
	QUnit.module("Integration tests");

	QUnit.test("Should respect the viewlevel with multiple navigations", function (assert) {
		//Arrange
		var oFirstNavContainer = new NavContainer(),
			oSecondNavContainer = new NavContainer(),
			fnFirstBackSpy = sinon.spy(oFirstNavContainer, "backToPage"),
			fnSecondBackSpy = sinon.spy(oSecondNavContainer, "backToPage"),
			oTargetConfig = {
				first: {
					controlId: oFirstNavContainer.getId(),
					viewName: "FirstView",
					viewLevel: 2
				},
				second: {
					controlId: oFirstNavContainer.getId(),
					viewName: "SecondView",
					parent: "first",
					viewLevel: 0
				},
				third: {
					controlId: oSecondNavContainer.getId(),
					viewName: "ThirdView",
					parent: "second",
					viewLevel: 2
				},
				fourth: {
					controlId: oSecondNavContainer.getId(),
					viewName: "FourthView",
					parent: "third",
					viewLevel: 1
				}
			},
			oViews = new Views({async: true}),
			oTargets = new Targets({
				targets: oTargetConfig,
				config: {
					viewType: "JS",
					controlAggregation: "pages",
					async: true
				},
				views: oViews
			});

		//views
		helpers.createViewAndController("FirstView");
		helpers.createViewAndController("SecondView");
		helpers.createViewAndController("ThirdView");
		helpers.createViewAndController("FourthView");

		//Act
		var oFirstPromise = oTargets.display("first");
		var oFourthPromise = oTargets.display("fourth");

		return Promise.all([oFirstPromise, oFourthPromise]).then(function() {
			//Assert
			assert.strictEqual(fnFirstBackSpy.callCount, 1, "did a back navigation on the first container since a navigation from 2 to 1 took place");
			assert.strictEqual(fnSecondBackSpy.callCount, 1, "did a back navigation on the second container since a navigation from 2 to 1 took place");

			fnFirstBackSpy.restore();
			fnSecondBackSpy.restore();
			oViews.destroy();
			oTargets.destroy();
			oFirstNavContainer.destroy();
			oSecondNavContainer.destroy();
		});
	});

	QUnit.test("Should take the viewLevel from the first ancester which has a viewLevel if a target doesn't have viewLevel defined", function (assert) {
		//Arrange
		var oNavContainer = new NavContainer(),
			fnBackSpy = sinon.spy(oNavContainer, "backToPage"),
			oTargetConfig = {
				first: {
					controlId: oNavContainer.getId(),
					viewName: "FirstView",
					viewLevel: 2
				},
				second: {
					controlId: oNavContainer.getId(),
					viewName: "SecondView",
					parent: "first",
					viewLevel: 1
				},
				third: {
					controlId: oNavContainer.getId(),
					viewName: "ThirdView",
					parent: "second"
				},
				fourth: {
					controlId: oNavContainer.getId(),
					viewName: "FourthView",
					parent: "third"
				}
			},
			oViews = new Views({async: true}),
			oTargets = new Targets({
				targets: oTargetConfig,
				config: {
					viewType: "JS",
					controlAggregation: "pages",
					async: true
				},
				views: oViews
			});

		//views
		helpers.createViewAndController("FirstView");
		helpers.createViewAndController("SecondView");
		helpers.createViewAndController("ThirdView");
		helpers.createViewAndController("FourthView");

		//Act
		var oFirstPromise = oTargets.display("first");
		var oFourthPromise = oTargets.display("fourth");

		return Promise.all([oFirstPromise, oFourthPromise]).then(function() {
			//Assert
			assert.strictEqual(fnBackSpy.callCount, 1, "did a back navigation on the first container since a navigation from 2 to 1 took place");

			fnBackSpy.restore();
			oViews.destroy();
			oTargets.destroy();
			oNavContainer.destroy();
		});
	});

	QUnit.test("Should keep order of display calls when displaying asyncly", function (assert) {
		//Arrange
		var oFirstNavContainer = new NavContainer({
				pages: new Page()
			}),
			fnFirstToSpy = sinon.spy(oFirstNavContainer, "to"),
			oTargetConfig = {
				first: {
					controlId: oFirstNavContainer.getId(),
					// the viewname here determines the order of loading, this one loads second
					viewName: "firstView"
				},
				second: {
					controlId: oFirstNavContainer.getId(),
					// the viewname here determines the order of loading, this one loads first
					viewName: "secondView"
				}
			},
			oViews = new Views({async: true}),
			oTargets = new Targets({
				targets: oTargetConfig,
				config: {
					viewType: "JS",
					controlAggregation: "pages",
					async: true
				},
				views: oViews
			});

		helpers.setViewDelays({
			"firstView": 100,
			"secondView": 0
		});

		this.stub(oViews, "_getView").callsFake(helpers.createViewMock);

		//Act
		var oFirstPromise = oTargets.display("first");
		var oSecondPromise = oTargets.display("second");

		return Promise.all([oFirstPromise, oSecondPromise]).then(function() {
			//Assert
			assert.strictEqual(fnFirstToSpy.callCount, 1, "did a back navigation on the first container since a navigation from 2 to 1 took place");
			assert.strictEqual(fnFirstToSpy.args[0][0], "secondView", "Only second view gets displayed");
			// assert.strictEqal(fnFirstToSpy.args[1][0], "2", "Second target displayed second");

			fnFirstToSpy.restore();
			oViews.destroy();
			oTargets.destroy();
			oFirstNavContainer.destroy();
		});
	});

	/**
	 * renames subroutes into parent
	 * and renames routes params to target params
	 *
	 * @private
	 * @param oConfig
	 * @param oOriginalConfig
	 */
	function modifyConfig (oConfig, oOriginalConfig) {
		var sRouteName,
			sSubrouteName,
			oRouteConfig;

		for (sRouteName in oConfig) {
			// only check own properties
			if (oConfig.hasOwnProperty(sRouteName)) {
				oRouteConfig = oConfig[sRouteName];

				oRouteConfig = Route.prototype._convertToTargetOptions(oRouteConfig);
				oOriginalConfig[sRouteName] = oRouteConfig;

				// end recursion
				if (!oRouteConfig.subroutes) {
					continue;
				}

				oRouteConfig.children = oRouteConfig.subroutes;
				for (sSubrouteName in oRouteConfig.subroutes) {
					if (oRouteConfig.subroutes.hasOwnProperty(sSubrouteName)) {
						oOriginalConfig[sSubrouteName] = oRouteConfig.subroutes[sSubrouteName];
						oOriginalConfig[sSubrouteName].parent = sRouteName;

						modifyConfig(oRouteConfig.subroutes, oOriginalConfig);
					}
				}

			}
		}
	}

	integrationTests.start({
		beforeEach: function (oConfig) {

			modifyConfig(oConfig, oConfig);
			this.oViews = new Views({async: true});
			this.oGetViewStub = sinon.stub(this.oViews, "_getView").callsFake(helpers.createViewMock);

			var oTargets = new Targets({ targets: oConfig, views : this.oViews, config: {async: true}});

			this.oTargets = oTargets;
			return oTargets;
		},
		act: function (sPatternOrName) {
			return this.oTargets.display(sPatternOrName);
		},
		afterEach: function () {
			this.oGetViewStub.restore();
			this.oTargets.destroy();
			this.oViews.destroy();
		}
	});


});