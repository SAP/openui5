/*global QUnit, sinon */

sap.ui.define(
	[
		"sap/m/SplitContainer",
		"sap/m/NavContainer",
		"./helpers",
		"sap/ui/Device"
	],
	function(SplitContainer, NavContainer, helpers, Device) {
		"use strict";

		// Helper to abstract from Sinon 1 and Sinon 4
		// (this module is used with both versions)
		function stubWith(sandbox, object, property, value) {
			if ( sinon.log ) {// sinon has no version property, but 'log' was removed with 2.x
				return sandbox.stub(object, property, value);
			} else {
				return sandbox.stub(object, property).value(value);
			}
		}

		return {
			start : function (oOptions) {

				var fnSetup = oOptions.beforeEach;
				var fnAct = oOptions.act;

				///////////////////////////////////////////////////////
				/// Integation test
				///////////////////////////////////////////////////////
				QUnit.module("Common integration tests", {
					afterEach: function () {
						oOptions.afterEach.call(this);
					}
				});

				QUnit.test("Should add one Navigation per detail and master aggregation for split app in desktop", function (assert) {
					//Arrange
					var oSplitContainer = new SplitContainer(),
						oSplitContainerSpy = this.spy(oSplitContainer, "to"),
						fnDone = assert.async();

					fnSetup.call(this, {
						"dummyMaster": {
							targetControl: oSplitContainer.getId(),
							view: "m.test.views.MasterDummy",
							viewType: "XML",
							targetAggregation: "masterPages",
							subroutes: {
								"dummyDetail": {
									targetAggregation: "detailPages",
									view: "m.test.views.DetailDummy",
									viewType: "XML",
									subroutes: {
										"master": {
											targetAggregation: "masterPages",
											view: "m.test.views.Master",
											viewType: "XML",
											subroutes: {
												"detail": {
													pattern: "detail",
													view: "m.test.views.Detail",
													viewType: "XML",
													targetAggregation: "detailPages"
												}
											}
										}
									}
								}
							}
						}
					});

					stubWith(this, Device.system, "phone", false);

					//views
					Promise.all([
							helpers.createViewAndController("Detail"),
							helpers.createViewAndController("DetailDummy"),
							helpers.createViewAndController("Master"),
							helpers.createViewAndController("MasterDummy")
					]).then(function () {
						//Act
						fnAct.call(this, "detail", assert).then(function () {
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
							fnDone();
						});
					}.bind(this));

				});

				QUnit.test("Should preserve the view that is currently in the master or detail if configured (splitapp desktop)", function (assert) {
					//Arrange
					var oSplitContainer = new SplitContainer(),
					fnDone = assert.async();

					fnSetup.call(this, {
						"firstMaster": {
							targetControl: oSplitContainer.getId(),
							view: "m.test.views.FirstMaster",
							viewType: "XML",
							targetAggregation: "masterPages",
							preservePageInSplitContainer: true,
							subroutes: {
								"detail": {
									pattern: "detail",
									targetAggregation: "detailPages",
									view: "m.test.views.Detail",
									viewType: "XML"
								}
							}
						},
						"secondMaster": {
							targetControl: oSplitContainer.getId(),
							pattern: "secondMaster",
							view: "m.test.views.SecondMaster",
							viewType: "XML",
							targetAggregation: "masterPages"
						}
					});

					stubWith(this, Device.system, "phone", false);

					//views
					Promise.all([
						helpers.createViewAndController("Detail"),
						helpers.createViewAndController("FirstMaster"),
						helpers.createViewAndController("SecondMaster")
					]).then(function () {
						//Act
						fnAct.call(this, "secondMaster", assert).then(function() {
							assert.strictEqual(oSplitContainer.getCurrentMasterPage().getViewName(), "SecondMaster", "did load the secondMaster");

							fnAct.call(this, "detail", assert).then(function () {
								//Assert
								assert.strictEqual(oSplitContainer.getCurrentDetailPage().getViewName(), "Detail", "did navigate to the detail view");
								assert.strictEqual(oSplitContainer.getCurrentMasterPage().getViewName(), "SecondMaster", "did not switch the masterview");
								fnDone();
							});
						}.bind(this));
					}.bind(this));

				});

				QUnit.test("Should not preserve the view that is currently in the master or detail if it is matching the pattern", function (assert) {
					//Arrange
					var oSplitContainer = new SplitContainer(),
					fnDone = assert.async();

					fnSetup.call(this, {
						"firstMaster": {
							targetControl: oSplitContainer.getId(),
							pattern: "firstMaster",
							view: "m.test.views.FirstMaster",
							viewType: "XML",
							targetAggregation: "masterPages",
							preservePageInSplitContainer: true
						},
						"secondMaster": {
							targetControl: oSplitContainer.getId(),
							pattern: "secondMaster",
							view: "m.test.views.SecondMaster",
							viewType: "XML",
							targetAggregation: "masterPages"
						}
					});

					//views
					Promise.all([
						helpers.createViewAndController("FirstMaster"),
						helpers.createViewAndController("SecondMaster")
					]).then(function(){
						//Act
						fnAct.call(this, "secondMaster").then(function () {
							assert.strictEqual(oSplitContainer.getCurrentMasterPage().getViewName(), "SecondMaster", "did load the secondMaster");

							fnAct.call(this, "firstMaster").then(function () {
								//Assert
								assert.strictEqual(oSplitContainer.getCurrentMasterPage().getViewName(), "FirstMaster", "did switch the masterview");
								fnDone();
							});
						}.bind(this));
					}.bind(this));
				});

				QUnit.test("Should preserve the view that is currently in the master with multiple Masters", function (assert) {
					//Arrange
					var oSplitContainer = new SplitContainer(),
					fnDone = assert.async();

					fnSetup.call(this, {
						"firstMaster": {
							targetControl: oSplitContainer.getId(),
							view: "m.test.views.FirstMaster",
							targetAggregation: "masterPages",
							viewType: "XML",
							subroutes: {
								"secondMaster": {
									view: "m.test.views.SecondMaster",
									targetAggregation: "masterPages",
									viewType: "XML",
									subroutes: {
										"thirdMaster": {
											view: "m.test.views.ThirdMaster",
											targetAggregation: "masterPages",
											preservePageInSplitContainer: true,
											viewType: "XML",
											subroutes: {
												"detail": {
													pattern: "detail",
													targetAggregation: "detailPages",
													view: "m.test.views.Detail",
													viewType: "XML"
												}
											}
										}
									}
								}
							}
						}
					});

					stubWith(this, Device.system, "phone", false);

					//views
					Promise.all([
						helpers.createViewAndController("Detail"),
						helpers.createViewAndController("FirstMaster"),
						helpers.createViewAndController("SecondMaster"),
						helpers.createViewAndController("ThirdMaster")
					]).then(function () {
						//Act
						assert.strictEqual(oSplitContainer.getCurrentMasterPage(), undefined, "did not load a master yet");
						fnAct.call(this, "detail").then(function () {
							//Assert
							assert.strictEqual(oSplitContainer.getCurrentDetailPage().getViewName(), "Detail", "did navigate to the detail view");
							assert.strictEqual(oSplitContainer.getCurrentMasterPage().getViewName(), "SecondMaster", "did not switch the masterview");
							fnDone();
						});
					}.bind(this));

				});


				QUnit.test("Test multiple views to be diplayed in the same order as they are requested", function(assert) {
					//Arrange
					var oNavContainer = new NavContainer();
					fnSetup.call(this, {
						"first": {
							targetControl: oNavContainer.getId(),
							path: "m.test.views",
							pattern: "first",
							view: "first",
							viewType: "XML",
							targetAggregation: "pages"
						},
						"second": {
							targetControl: oNavContainer.getId(),
							path: "m.test.views",
							pattern: "second",
							view: "second",
							viewType: "XML",
							targetAggregation: "pages"
						},
						"third": {
							targetControl: oNavContainer.getId(),
							path: "m.test.views",
							pattern: "third",
							view: "third",
							viewType: "XML",
							targetAggregation: "pages"
						},
						"fourth": {
							targetControl: oNavContainer.getId(),
							path: "m.test.views",
							pattern: "fourth",
							view: "fourth",
							viewType: "XML",
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
						assert.equal(oNavContainer.getCurrentPage().getViewName(), "fourth", "Correct view displayed");
					});
				});

			}
		};
	}
);