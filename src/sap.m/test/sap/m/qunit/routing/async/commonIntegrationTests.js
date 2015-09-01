sap.ui.define(
	[
		"sap/m/NavContainer",
		"sap/m/SplitContainer",
		"qunit/routing/async/helpers"
	],
	function (NavContainer, SplitContainer, helpers) {
		"use strict";

		return {
			start : function (oOptions) {

				var fnSetup = oOptions.setup;
				var fnAct = oOptions.act;

				///////////////////////////////////////////////////////
				/// Integation test
				///////////////////////////////////////////////////////
				QUnit.module("Common integration tests", {
					teardown: function () {
						oOptions.teardown.call(this);
					}
				});

				QUnit.test("Should add one Navigation per detail and master aggregation for split app in desktop", function (assert) {
					//Arrange
					var oSplitContainer = new SplitContainer(),
						oSplitContainerSpy = sinon.spy(oSplitContainer, "to");

					fnSetup.call(this, {
						"dummyMaster": {
							targetControl: oSplitContainer.getId(),
							view: "MasterDummy",
							viewType: "JS",
							targetAggregation: "masterPages",
							subroutes: {
								"dummyDetail": {
									targetAggregation: "detailPages",
									view: "DetailDummy",
									viewType: "JS",
									subroutes: {
										"master": {
											targetAggregation: "masterPages",
											view: "Master",
											viewType: "JS",
											subroutes: {
												"detail": {
													pattern: "detail",
													view: "Detail",
													viewType: "JS",
													targetAggregation: "detailPages"
												}
											}
										}
									}
								}
							}
						}
					});

					this.stub(sap.ui.Device.system, "phone", false);

					helpers.setViewDelays({
						MasterDummy: 100,
						DetailDummy: 70,
						Master: 40,
						Detail: 10
					});

					//Act
					var oPromise = fnAct.call(this, "detail", assert);

					return oPromise.then(function() {
						//Assert
						assert.strictEqual(oSplitContainerSpy.callCount, 2, "did invoke add two navigations");

						var oCurrentDetail = oSplitContainer.getCurrentDetailPage();
						var oCurrentMaster = oSplitContainer.getCurrentMasterPage();
						assert.strictEqual(oCurrentDetail.getViewName(), "Detail", "did navigate to the detail view");
						assert.strictEqual(oCurrentMaster.getViewName(), "Master", "did navigate to the master view");

						var oFirstCall = oSplitContainerSpy.getCall(0);
						var oSecondCall = oSplitContainerSpy.getCall(1);

						assert.strictEqual(oFirstCall.args[0], oCurrentMaster.getId(), "did invoke it with the master view");
						assert.strictEqual(oSecondCall.args[0], oCurrentDetail.getId(), "did invoke it with the detail view");

						oSplitContainerSpy.restore();
						oSplitContainer.destroy();
					});

				});

				QUnit.test("Should preserve the view that is currently in the master or detail if configured (splitapp desktop)", function (assert) {
					//Arrange
					var oSplitContainer = new SplitContainer();

					fnSetup.call(this, {
						"firstMaster": {
							targetControl: oSplitContainer.getId(),
							view: "FirstMaster",
							viewType: "JS",
							targetAggregation: "masterPages",
							preservePageInSplitContainer: true,
							subroutes: {
								"detail": {
									pattern: "detail",
									targetAggregation: "detailPages",
									view: "Detail",
									viewType: "JS"
								}
							}
						},
						"secondMaster": {
							targetControl: oSplitContainer.getId(),
							pattern: "secondMaster",
							view: "SecondMaster",
							viewType: "JS",
							targetAggregation: "masterPages"
						}
					});

					this.stub(sap.ui.Device.system, "phone", false);

					helpers.setViewDelays({
						SecondMaster: 70,
						Detail: 10,
						FirstMaster: 40
					});

					//Act
					var oMasterPromise = fnAct.call(this, "secondMaster", assert);
					oMasterPromise.then(function() {
						assert.strictEqual(oSplitContainer.getCurrentMasterPage().getViewName(), "SecondMaster", "did load the secondMaster");
					});

					var oDetailPromise = fnAct.call(this, "detail");
					return Promise.all([oMasterPromise, oDetailPromise]).then(function() {
						//Assert
						assert.strictEqual(oSplitContainer.getCurrentDetailPage().getViewName(), "Detail", "did navigate to the detail view");
						assert.strictEqual(oSplitContainer.getCurrentMasterPage().getViewName(), "SecondMaster", "did not switch the masterview");
						oSplitContainer.destroy();
					});
				});

				QUnit.test("Should not preserve the view that is currently in the master or detail if it is matching the pattern", function (assert) {
					//Arrange
					var oSplitContainer = new SplitContainer();

					fnSetup.call(this, {
						"firstMaster": {
							targetControl: oSplitContainer.getId(),
							pattern: "firstMaster",
							view: "FirstMaster",
							viewType: "JS",
							targetAggregation: "masterPages",
							preservePageInSplitContainer: true
						},
						"secondMaster": {
							targetControl: oSplitContainer.getId(),
							pattern: "secondMaster",
							view: "SecondMaster",
							viewType: "JS",
							targetAggregation: "masterPages"
						}
					});

					helpers.setViewDelays({
						SecondMaster: 40,
						FirstMaster: 10
					});

					//Act
					var oSecondMasterPromise = fnAct.call(this, "secondMaster", assert);
					return oSecondMasterPromise.then(function() {
						assert.strictEqual(oSplitContainer.getCurrentMasterPage().getViewName(), "SecondMaster", "did load the secondMaster");
						var oFirstMasterPromise = fnAct.call(this, "firstMaster");

						return oFirstMasterPromise.then(function() {
							//Assert
							assert.strictEqual(oSplitContainer.getCurrentMasterPage().getViewName(), "FirstMaster", "did switch the masterview");
							oSplitContainer.destroy();
						});
					}.bind(this));
				});

				QUnit.test("Should preserve the view that is currently in the master with multiple Masters", function (assert) {
					//Arrange
					var oSplitContainer = new SplitContainer();

					fnSetup.call(this, {
						"firstMaster": {
							targetControl: oSplitContainer.getId(),
							view: "FirstMaster",
							targetAggregation: "masterPages",
							viewType: "JS",
							subroutes: {
								"secondMaster": {
									view: "SecondMaster",
									targetAggregation: "masterPages",
									viewType: "JS",
									subroutes: {
										"thirdMaster": {
											view: "ThirdMaster",
											targetAggregation: "masterPages",
											preservePageInSplitContainer: true,
											viewType: "JS",
											subroutes: {
												"detail": {
													pattern: "detail",
													targetAggregation: "detailPages",
													view: "Detail",
													viewType: "JS"
												}
											}
										}
									}
								}
							}
						}
					});

					this.stub(sap.ui.Device.system, "phone", false);

					helpers.setViewDelays({
						SecondMaster: 70,
						FirstMaster: 100,
						Detail: 10,
						ThirdMaster: 40
					});

					//Act
					assert.strictEqual(oSplitContainer.getCurrentMasterPage(), undefined, "did not load a master yet");
					var oPromise = fnAct.call(this, "detail", assert);

					return oPromise.then(function() {
						//Assert
						assert.strictEqual(oSplitContainer.getCurrentDetailPage().getViewName(), "Detail", "did navigate to the detail view");
						assert.strictEqual(oSplitContainer.getCurrentMasterPage().getViewName(), "SecondMaster", "did not switch the masterview");
						oSplitContainer.destroy();
					});
				});

				QUnit.test("Test multiple views to be diplayed in the same order as they are requested", function() {
					//Arrange
					var oNavContainer = new NavContainer();
					fnSetup.call(this, {
						"first": {
							targetControl: oNavContainer.getId(),
							pattern: "first",
							view: "First",
							viewType: "JS",
							targetAggregation: "pages"
						},
						"second": {
							targetControl: oNavContainer.getId(),
							pattern: "second",
							view: "Second",
							viewType: "JS",
							targetAggregation: "pages"
						},
						"third": {
							targetControl: oNavContainer.getId(),
							pattern: "third",
							view: "Third",
							viewType: "JS",
							targetAggregation: "pages"
						},
						"fourth": {
							targetControl: oNavContainer.getId(),
							pattern: "fourth",
							view: "Fourth",
							viewType: "JS",
							targetAggregation: "pages"
						}
					});

					helpers.setViewDelays({
						First: 100,
						Second: 70,
						Third: 40,
						Fourth: 10
					});

					var aPromises = [
						fnAct.call(this, "first", assert),
						fnAct.call(this, "second", assert),
						fnAct.call(this, "third", assert),
						fnAct.call(this, "fourth", assert)
					];

					return Promise.all(aPromises).then(function() {
						assert.equal(oNavContainer.getCurrentPage().getViewName(), "Fourth", "Correct view displayed");
					});
				});

			}
		};

		});
