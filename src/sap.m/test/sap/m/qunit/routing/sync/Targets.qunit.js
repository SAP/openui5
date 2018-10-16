/*global QUnit, sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */

sap.ui.define([
	"sap/m/routing/Targets",
	"sap/m/NavContainer",
	"sap/m/Page",
	"sap/ui/core/routing/Views",
	"./commonIntegrationTests",
	"sap/ui/core/routing/Route",
	"./helpers"
], function (Targets, NavContainer, Page, Views, integrationTests, Route, helpers) {
	"use strict";

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
			this.oViews = new Views({async: false});
			// System under test
			this.oTargets = new Targets({
				targets: {
					myTarget: this.oTargetConfiguration
				},
				config: {
					controlAggregation: "pages",
					async: false
				},
				views: this.oViews
			});
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
				oToSpy = this.spy(this.oNavContainer, "to"),
				oNavigateSpy = this.spy(this.oTargets._oTargetHandler, "navigate"),
				oEventData = { eventData: "myData"};

		this.stub(Views.prototype, "_getView").callsFake(function () {
			return that.oToPage;
		});

		//Act
		this.oTargets.display("myTarget", oEventData);

		//Assert
		assert.strictEqual(oToSpy.callCount, 1, "did call the 'to' function on the oNavContainer instance");
		sinon.assert.calledWithExactly(oToSpy, this.oToPage.getId(), this.oTargetConfiguration.transition, oEventData, this.oTargetConfiguration.transitionParameters);

		assert.strictEqual(oNavigateSpy.callCount, 1, "did call the 'navigate' function on the TargetHandler instance");
		sinon.assert.calledWithExactly(oNavigateSpy, {
			navigationIdentifier: "myTarget",
			viewLevel: 5,
			askHistory: true
		});
	});

	///////////////////////////////////////////////////////
	/// Integation test
	///////////////////////////////////////////////////////
	QUnit.module("Integration tests");

	QUnit.test("Should respect the viewlevel with multiple navigations", function (assert) {
		//Arrange
		var oFirstNavContainer = new NavContainer(),
				oSecondNavContainer = new NavContainer(),
				fnFirstBackSpy = this.spy(oFirstNavContainer, "backToPage"),
				fnSecondBackSpy = this.spy(oSecondNavContainer, "backToPage"),
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
				oViews = new Views({async: false}),
				oTargets = new Targets({
					targets: oTargetConfig,
					config: {
						viewType: "JS",
						controlAggregation: "pages",
						async: false
					},
					views: oViews
				});

		//views
		helpers.createViewAndController("FirstView");
		helpers.createViewAndController("SecondView");
		helpers.createViewAndController("ThirdView");
		helpers.createViewAndController("FourthView");

		//Act
		oTargets.display("first");
		oTargets.display("fourth");

		//Assert
		assert.strictEqual(fnFirstBackSpy.callCount, 1, "did a back navigation on the first container since a navigation from 2 to 1 took place");
		assert.strictEqual(fnSecondBackSpy.callCount, 1, "did a back navigation on the second container since a navigation from 2 to 1 took place");

		oViews.destroy();
		oTargets.destroy();
		oFirstNavContainer.destroy();
		oSecondNavContainer.destroy();
	});

	QUnit.test("Should take the viewLevel from the first ancester which has a viewLevel if a target doesn't have viewLevel defined", function(assert) {
		//Arrange
		var oNavContainer = new NavContainer(),
			fnBackSpy = this.spy(oNavContainer, "backToPage"),
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
			oViews = new Views({async: false}),
			oTargets = new Targets({
				targets: oTargetConfig,
				config: {
					viewType: "JS",
					controlAggregation: "pages",
					async: false
				},
				views: oViews
			});

		//views
		helpers.createViewAndController("FirstView");
		helpers.createViewAndController("SecondView");
		helpers.createViewAndController("ThirdView");
		helpers.createViewAndController("FourthView");

		//Act
		oTargets.display("first");
		oTargets.display("fourth");

		//Assert
		assert.strictEqual(fnBackSpy.callCount, 1, "did a back navigation on the first container since a navigation from 2 to 1 took place");

		oViews.destroy();
		oTargets.destroy();
		oNavContainer.destroy();
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
			this.oViews = new Views({async: false});

			var oTargets = new Targets({ targets: oConfig, views : this.oViews, config: {async: false}});

			this.oTargets = oTargets;
			return oTargets;
		},
		act: function (sPatternOrName) {
			this.oTargets.display(sPatternOrName);
		},
		afterEach: function () {
			this.oTargets.destroy();
			this.oViews.destroy();
		}
	});


});