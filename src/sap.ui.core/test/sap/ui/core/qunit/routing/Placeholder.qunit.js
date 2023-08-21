/*global QUnit, sinon, hasher*/
sap.ui.define([
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Placeholder",
	"sap/f/FlexibleColumnLayout",
	"sap/m/Button",
	"sap/m/NavContainer",
	"sap/m/Page",
	"sap/m/SplitApp",
	"sap/m/routing/TargetHandler",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/m/routing/Router", /* need to require this module to correctly resolve router class in manifest */
	"sap/f/routing/Router" /* need to require this module to correctly resolve router class in manifest */
	], function(
		ComponentContainer,
		Placeholder,
		FlexibleColumnLayout,
		Button,
		NavContainer,
		Page,
		SplitApp,
		MTargetHandler,
		nextUIUpdate
	) {

	"use strict";

	QUnit.module("Basics", {
		before: function() {
			// placeholder html file
			sap.ui.require.preload({
				"my/placeholder.fragment.html":"<div id='myPlaceholder'></div>"
			});
		}
	});

	QUnit.test("Placeholder - show / hide", function(assert) {
		var done = assert.async();
		var oButton,
			oButtonDelegate,
			oPlaceholder;

		oButton = new Button({
			id: "myButton"
		}).placeAt("qunit-fixture");

		oButtonDelegate = {
			"onAfterRendering": function() {
				oPlaceholder = new Placeholder({ html: "my/placeholder.fragment.html" });
				assert.ok(oPlaceholder, "Placeholder should be created successfully.");

				oPlaceholder.show(oButton).then(function() {
					assert.ok(document.getElementById("myButton")
						.contains(document.getElementById("myPlaceholder")), "Placeholder should be available.");

					oPlaceholder.hide();
					assert.notOk(document.getElementById("myButton")
						.contains(document.getElementById("myPlaceholder")), "Placeholder shouldn't be available anymore after hide().");

					// cleanup
					oButton.destroy();
					oPlaceholder.destroy();

					done();
				});
			}
		};

		oButton.addEventDelegate(oButtonDelegate);
	});

	QUnit.test("NavContainer - showPlaceholder / hidePlaceholder", async function(assert) {
		var oNavContainer = new NavContainer();
		var oPlaceholder = new Placeholder({
			html: "my/placeholder.fragment.html"
		});

		var oShowPlaceholderSpy = sinon.spy(oPlaceholder, "show");
		var oHidePlaceholderSpy = sinon.spy(oPlaceholder, "hide");

		// render NavContainer
		oNavContainer.placeAt("qunit-fixture");
		await nextUIUpdate();

		// show placeholder
		oNavContainer.showPlaceholder({
			placeholder: oPlaceholder
		});

		assert.equal(oShowPlaceholderSpy.callCount, 1, "Placeholder.show should be called");

		return oShowPlaceholderSpy.returnValues[0].then(function() {
			assert.ok(oNavContainer.getDomRef().contains(document.getElementById("myPlaceholder")), "NavContainer should contain the placeholder");

			return new Promise(function(resolve, reject) {
				// hide placeholder
				oNavContainer.hidePlaceholder();
				resolve();
			});
		}).then(function() {
			assert.equal(oHidePlaceholderSpy.callCount, 1, "Placeholder.hide should be called");
			assert.notOk(oNavContainer.getDomRef().contains(document.getElementById("myPlaceholder")), "NavContainer shouldn't contain the placeholder anymore");

			// cleanup
			oNavContainer.destroy();
			assert.notOk(oNavContainer._placeholder, "Placeholder reference should be removed from the NavContainer");
			oShowPlaceholderSpy.restore();
			oHidePlaceholderSpy.restore();
		});
	});

	QUnit.test("NavContainer - needPlaceholder", function(assert) {
		var oNavContainer = new NavContainer(),
			oPage1 = new Page(),
			oPage2 = new Page();

		oNavContainer.addPage(oPage1);

		assert.equal(oNavContainer.needPlaceholder("", oPage1), false, "Should return 'false' as oPage1 is already the current page.");
		assert.equal(oNavContainer.needPlaceholder("", oPage2), true, "Should return 'true' as oPage2 isn't the current page.");

		// cleanup
		oNavContainer.destroy();
		oPage2.destroy();
	});

	QUnit.test("sap/m/TargetHandler - showPlaceholder (sync)", function(assert) {
		var oTargetHandler = new MTargetHandler(),
			oNavContainer = new NavContainer(),
			oPage1 = new Page(),
			oPage2 = new Page();

		var oNavContainerNeedPlaceholderSpy = sinon.spy(oNavContainer, "needPlaceholder");
		var oNavContainerShowPlaceholderSpy = sinon.spy(oNavContainer, "showPlaceholder");

		oNavContainer.addPage(oPage1);

		oTargetHandler.showPlaceholder({
			container: oNavContainer,
			object: oPage1
		});

		assert.equal(oNavContainerNeedPlaceholderSpy.callCount, 1, "NavContainer.needPlaceholder should be called");
		assert.equal(oNavContainerShowPlaceholderSpy.callCount, 0, "NavContainer.showPlaceholder shouldn't be called");

		oTargetHandler.showPlaceholder({
			container: oNavContainer,
			object: oPage2
		});

		assert.equal(oNavContainerNeedPlaceholderSpy.callCount, 2, "NavContainer.needPlaceholder should be called a second time");
		assert.equal(oNavContainerShowPlaceholderSpy.callCount, 1, "NavContainer.showPlaceholder should be called");

		// cleanup
		oTargetHandler.destroy();
		oNavContainer.destroy();
		oPage2.destroy();
		oNavContainerNeedPlaceholderSpy.restore();
		oNavContainerShowPlaceholderSpy.restore();
	});

	QUnit.test("sap/m/TargetHandler - showPlaceholder (async)", function(assert) {
		var oTargetHandler = new MTargetHandler(),
			oNavContainer = new NavContainer(),
			oPage1 = new Page(),
			oPage2 = new Page();

		var oNavContainerNeedPlaceholderSpy = sinon.spy(oNavContainer, "needPlaceholder");
		var oNavContainerShowPlaceholderSpy = sinon.spy(oNavContainer, "showPlaceholder");

		oNavContainer.addPage(oPage1);

		var pObject = Promise.resolve(oPage1);

		oTargetHandler.showPlaceholder({
			container: oNavContainer,
			object: pObject
		});

		return pObject.then(function() {
			assert.equal(oNavContainerNeedPlaceholderSpy.callCount, 1, "NavContainer.needPlaceholder should be called");
			assert.equal(oNavContainerShowPlaceholderSpy.callCount, 1, "NavContainer.showPlaceholder should still be called when the page is still under loading");

			pObject = Promise.resolve(oPage2);

			oTargetHandler.showPlaceholder({
				container: oNavContainer,
				object: pObject
			});

			return pObject.then(function() {
				assert.equal(oNavContainerNeedPlaceholderSpy.callCount, 2, "NavContainer.needPlaceholder should be called");
				assert.equal(oNavContainerShowPlaceholderSpy.callCount, 2, "NavContainer.showPlaceholder should still be called before the page is finished with loading");

				// cleanup
				oTargetHandler.destroy();
				oNavContainer.destroy();
				oPage2.destroy();
				oNavContainerNeedPlaceholderSpy.restore();
				oNavContainerShowPlaceholderSpy.restore();
			});
		});
	});

	QUnit.module("Integration", {
		before: function() {
			// placeholder html file
			sap.ui.require.preload({
				"my/placeholder.fragment.html":"<div id='myPlaceholder'></div>"
			});

			sap.ui.require.preload({
				"my/placeholder1.fragment.html":"<div id='myPlaceholder1'></div>"
			});
		},
		beforeEach: function() {
			hasher.setHash("");
		}
	});

	QUnit.test("NavContainer", async function(assert) {
		var oNavConShowPlaceholderSpy = sinon.spy(NavContainer.prototype, "showPlaceholder"),
			oNavConHidePlaceholderSpy = sinon.spy(NavContainer.prototype, "hidePlaceholder");

		var oRouter;
		var oComponentContainer = new ComponentContainer({
			manifest: true,
			name: "qunit.placeholder.component.NavContainer"
		});

		oComponentContainer.placeAt("qunit-fixture");

		await nextUIUpdate();

		return new Promise(function(resolve, reject) {
			oComponentContainer.attachEvent("componentCreated", function(oEvent) {
				resolve(oEvent.getParameter("component"));
			});
		}).then(function(oComponent) {
			oRouter = oComponent.getRouter();
			oRouter.initialize();

			return new Promise(function(resolve, reject) {
				// Need to wait for routeMatched in order to get the content of the NavContainer created
				oRouter.attachEventOnce("routeMatched", function (oEvent) {
					var oNavContainer = oEvent.getParameter("targetControl");
					var oPage = oNavContainer.getPages()[0];

					if (oPage.getDomRef()) {
						assert.equal(oNavConShowPlaceholderSpy.callCount, 1, "NavContainer.showPlaceholder should be called");
						assert.equal(oNavConHidePlaceholderSpy.callCount, 1, "NavContainer.hidePlaceholder should be called");

						oNavConShowPlaceholderSpy.resetHistory();
						oNavConHidePlaceholderSpy.resetHistory();
						resolve(oNavContainer);
					} else {
						// Need to wait for the onAfterShow because of the rendering for the NavContainer
						oPage.addEventDelegate({
							"onAfterShow":  function(oEvent) {
								assert.equal(oNavConShowPlaceholderSpy.callCount, 1, "NavContainer.showPlaceholder should be called");
								assert.equal(oNavConHidePlaceholderSpy.callCount, 1, "NavContainer.hidePlaceholder should be called");

								oNavConShowPlaceholderSpy.resetHistory();
								oNavConHidePlaceholderSpy.resetHistory();
								resolve(oNavContainer);
							}
						});
					}
				});
			});
		}).then(function(oNavContainer) {
			oRouter.navTo("home", {
				"?query": {
					a: "b"
				}
			});

			return new Promise(function(resolve, reject) {
				oRouter.attachEventOnce("routeMatched", function(oEvent) {
					assert.equal(oNavConShowPlaceholderSpy.callCount, 0, "Placeholder shouldn't be shown when the same route is matched again");
					resolve(oEvent.getParameter("targetControl"));
				});
			});
		}).then(function(oNavContainer) {
			// Navigate to route1 which has autoClose config set to 'false'
			oRouter.navTo("route1");

			return new Promise(function(resolve, reject) {
				oRouter.attachEventOnce("routeMatched", function(oEvent) {
					assert.equal(oNavConShowPlaceholderSpy.callCount, 1, "NavContainer.showPlaceholder should be called for another time");
					resolve(oNavContainer);
				});
			});
		}).then(function(oNavContainer) {
			assert.ok(oNavContainer.getDomRef().contains(document.getElementById("myPlaceholder")), "Placeholder should be visible inside NavContainer");
			oNavContainer.hidePlaceholder();
			assert.notOk(oNavContainer.getDomRef().contains(document.getElementById("myPlaceholder")), "Placeholder shouldn't be visible inside NavContainer anymore");

			// cleanup
			oComponentContainer.destroy();
			oNavConShowPlaceholderSpy.restore();
			oNavConHidePlaceholderSpy.restore();
		});
	});

	QUnit.test("SplitContainer", async function(assert) {
		var oSplitApp;

		// spies creation
		var oSplitAppShowPlaceholderSpy = sinon.spy(SplitApp.prototype, "showPlaceholder");
		var oSplitAppNeedPlaceholderSpy = sinon.spy(SplitApp.prototype, "needPlaceholder");
		var oSplitAppHidePlaceholderSpy = sinon.spy(SplitApp.prototype, "hidePlaceholder");
		var oSplitAppMasterHidePlaceholderSpy;
		var oSplitAppDetailHidePlaceholderSpy;
		var oHomeDisplayed = sinon.spy();

		var oRouter;
		var oComponentContainer = new ComponentContainer({
			manifest: true,
			name: "qunit.placeholder.component.SplitContainer"
		});

		oComponentContainer.placeAt("qunit-fixture");

		await nextUIUpdate();

		return new Promise(function(resolve, reject) {
			oComponentContainer.attachEvent("componentCreated", function(oEvent) {
				resolve(oEvent.getParameter("component"));
			});
		}).then(function(oComponent) {
			oSplitApp = oComponent.getRootControl().byId("splitApp");

			// Create master and detail spy because as long as SplitApp is not renderer the hidePlaceholder is not called
			// on SplitApp but it's called on the NavContainer of the corresponding master and detail page
			oSplitAppMasterHidePlaceholderSpy = sinon.spy(oSplitApp.getAggregation("_navMaster"), "hidePlaceholder");
			oSplitAppDetailHidePlaceholderSpy = sinon.spy(oSplitApp.getAggregation("_navDetail"), "hidePlaceholder");
			oRouter = oComponent.getRouter();

			oRouter.getTarget("home").attachDisplay(oHomeDisplayed);

			// 1) home, target1
			oRouter.initialize();

			return new Promise(function(resolve, reject) {
				// Need to wait for routeMatched in order to get the content of the NavContainer created
				oRouter.attachEventOnce("routeMatched", function (oEvent) {
					var oDetailPage = oSplitApp.getDetailPages()[0];
					if (oDetailPage.getDomRef()) {
						resolve(oSplitApp);
					} else {
						// Need to wait for the onAfterShow because of the rendering for the NavContainer
						oDetailPage.addEventDelegate({
							"onAfterShow":  function(oEvent) {
								resolve(oSplitApp);
							}
						});
					}
				});
			});

		}).then(function(oSplitApp) {
			// showPlaceholder
			assert.equal(oSplitAppShowPlaceholderSpy.callCount, 2, "SplitApp.showPlaceholder should be called twice");
			assert.equal(oSplitAppShowPlaceholderSpy.getCall(0).args[0].aggregation, "masterPages", "SplitApp.showPlaceholder should be called on 'masterPages' aggregation");
			assert.equal(oSplitAppShowPlaceholderSpy.getCall(1).args[0].aggregation, "detailPages", "SplitApp.showPlaceholder should be called on 'detailPages' aggregation");

			// needPlaceholder
			assert.equal(oSplitAppNeedPlaceholderSpy.callCount, 2, "SplitApp.needPlaceholder should be called twice");
			assert.equal(oSplitAppNeedPlaceholderSpy.getCall(0).args[0], "masterPages", "SplitApp.needPlaceholder should be called only on 'masterPages' aggregation");
			assert.equal(oSplitAppNeedPlaceholderSpy.getCall(1).args[0], "detailPages", "SplitApp.needPlaceholder should be called only on 'detailPages' aggregation");

			// hidePlaceholder
			assert.equal(oSplitAppHidePlaceholderSpy.callCount, 2, "SplitApp.hidePlaceholder should be called twice");
			assert.equal(oSplitAppMasterHidePlaceholderSpy.callCount, 1, "Master SplitApp.hidePlaceholder should be called once");
			assert.equal(oSplitAppDetailHidePlaceholderSpy.callCount, 1, "Detail SplitApp.hidePlaceholder should be called once");

			assert.equal(oHomeDisplayed.callCount, 1, "Home target is displayed");
			assert.ok(oSplitAppShowPlaceholderSpy.getCall(1).calledBefore(oHomeDisplayed.getCall(0)), "showPlaceholder for the second target shouldn't wait for the display process of the first target");

			oSplitAppShowPlaceholderSpy.resetHistory();
			oSplitAppNeedPlaceholderSpy.resetHistory();
			oSplitAppHidePlaceholderSpy.resetHistory();
			oSplitAppMasterHidePlaceholderSpy.resetHistory();
			oSplitAppDetailHidePlaceholderSpy.resetHistory();
			oHomeDisplayed.resetHistory();

			return new Promise(function(resolve, reject) {
				oRouter.getRoute("route1").attachMatched(function(oEvent) {
					resolve(oSplitApp);
				});

				// 2) home, target2
				oRouter.navTo("route1");
			});
		}).then(function(oSplitApp) {
			// showPlaceholder
			assert.equal(oSplitAppShowPlaceholderSpy.callCount, 1, "SplitApp.showPlaceholder should be called once");
			assert.equal(oSplitAppShowPlaceholderSpy.getCall(0).args[0].aggregation, "detailPages",
				"SplitApp.showPlaceholder should be called only on 'detailPages' aggregation - 'masterPages' didn't change");

			// needPlaceholder
			assert.equal(oSplitAppNeedPlaceholderSpy.callCount, 2, "SplitApp.needPlaceholder should be called for another two times");
			assert.equal(oSplitAppNeedPlaceholderSpy.getCall(0).args[0], "masterPages", "SplitApp.needPlaceholder should be called on 'masterPages' aggregation");
			assert.equal(oSplitAppNeedPlaceholderSpy.getCall(1).args[0], "detailPages", "SplitApp.needPlaceholder should be called on 'detailPages' aggregation");

			// hidePlaceholder is called on SpitApp as it is rendered now
			assert.equal(oSplitAppHidePlaceholderSpy.callCount, 1, "SplitApp.hidePlaceholder should be called");
			assert.equal(oSplitAppHidePlaceholderSpy.getCall(0).args[0].aggregation, "masterPages", "SplitApp.hidePlaceholder should be called on 'masterPages' aggregation");

			assert.equal(oHomeDisplayed.callCount, 1, "Home target is displayed");
			assert.ok(oSplitAppShowPlaceholderSpy.getCall(0).calledBefore(oHomeDisplayed.getCall(0)), "showPlaceholder for the second target shouldn't wait for the display process of the first target");

			oSplitAppShowPlaceholderSpy.resetHistory();
			oSplitAppNeedPlaceholderSpy.resetHistory();
			oSplitAppHidePlaceholderSpy.resetHistory();
			oHomeDisplayed.resetHistory();

			return new Promise(function(resolve, reject) {
				oRouter.getRoute("route2").attachMatched(function(oEvent) {
					resolve(oSplitApp);
				});

				// 3) home, targetAutoCloseFalse
				oRouter.navTo("route2");
			});
		}).then(function(oSplitApp) {
			// showPlaceholder
			assert.equal(oSplitAppShowPlaceholderSpy.callCount, 1, "SplitApp.showPlaceholder should be called for another time");
			assert.equal(oSplitAppShowPlaceholderSpy.getCall(0).args[0].aggregation,
				"detailPages", "SplitApp.showPlaceholder should be called only on 'detailPages' aggregation - 'masterPages' didn't change");

			// needPlaceholder
			assert.equal(oSplitAppNeedPlaceholderSpy.callCount, 2, "SplitApp.needPlaceholder should be called for another 2 times");
			assert.equal(oSplitAppNeedPlaceholderSpy.getCall(0).args[0], "masterPages", "SplitApp.needPlaceholder should be called on 'masterPages' aggregation");
			assert.equal(oSplitAppNeedPlaceholderSpy.getCall(1).args[0], "detailPages", "SplitApp.needPlaceholder should be called on 'detailPages' aggregation");

			// hidePlaceholder is called on SpitApp as it is rendered now
			assert.equal(oSplitAppHidePlaceholderSpy.callCount, 1, "SplitApp.hidePlaceholder should be called");
			assert.equal(oSplitAppHidePlaceholderSpy.getCall(0).args[0].aggregation, "masterPages", "SplitApp.hidePlaceholder should be called on 'masterPages' aggregation");

			oSplitAppShowPlaceholderSpy.resetHistory();
			oSplitAppNeedPlaceholderSpy.resetHistory();
			oSplitAppHidePlaceholderSpy.resetHistory();

			var oDetailPageNavContainer = oSplitApp.getCurrentDetailPage().getParent();
			assert.ok(oDetailPageNavContainer.getDomRef()
				.contains(document.getElementById("myPlaceholder")), "DetailPage NavContainer should contain the placeholder");

			// manually call hidePlaceholder
			oDetailPageNavContainer.hidePlaceholder();
			assert.notOk(oDetailPageNavContainer.getDomRef()
				.contains(document.getElementById("myPlaceholder")), "DetailPage NavContainer shouldn't contain the placeholder anymore");

			// cleanup
			oComponentContainer.destroy();
			oSplitAppShowPlaceholderSpy.restore();
			oSplitAppNeedPlaceholderSpy.restore();
			oSplitAppHidePlaceholderSpy.restore();
			oSplitAppMasterHidePlaceholderSpy.restore();
			oSplitAppDetailHidePlaceholderSpy.restore();
		});
	});

	QUnit.test("FlexibleColumnLayout", async function(assert) {
		var oFlexColumnLayout;

		// spies creation
		var oFlexLayoutShowPlaceholderSpy = sinon.spy(FlexibleColumnLayout.prototype, "showPlaceholder");
		var oFlexLayoutNeedPlaceholderSpy = sinon.spy(FlexibleColumnLayout.prototype, "needPlaceholder");
		var oFlexLayoutHidePlaceholderSpy = sinon.spy(FlexibleColumnLayout.prototype, "hidePlaceholder");
		var oTargetDisplayed = sinon.spy();

		var oRouter;
		var oComponentContainer = new ComponentContainer({
			manifest: true,
			name: "qunit.placeholder.component.FlexibleColumnLayout"
		});

		oComponentContainer.placeAt("qunit-fixture");

		await nextUIUpdate();

		return new Promise(function(resolve, reject) {
			oComponentContainer.attachEvent("componentCreated", function(oEvent) {
				resolve(oEvent.getParameter("component"));
			});
		}).then(function(oComponent) {
			oRouter = oComponent.getRouter();
			oFlexColumnLayout = oComponent.getRootControl().byId("flexibleColumnLayout");

			var oTarget1 = oRouter.getTarget("target1");
			oTarget1.attachDisplay(oTargetDisplayed);

			// 1) target1, target2, target3
			oRouter.initialize();

			return new Promise(function(resolve, reject) {
				// Need to wait for routeMatched in order to get the content of the NavContainer created
				oRouter.attachEventOnce("routeMatched", function (oEvent) {
					var oPage = oFlexColumnLayout._getBeginColumn().getPages()[0];
					if (oPage.getDomRef()) {
						resolve(oFlexColumnLayout);
					} else {
						// Need to wait for the onAfterShow because of the rendering for the NavContainer
						oPage.addEventDelegate({
							"onAfterShow":  function(oEvent) {
								resolve(oFlexColumnLayout);
							}
						});
					}
				});
			});
		}).then(function(oFlexColumnLayout) {
			// showPlaceholder
			assert.equal(oFlexLayoutShowPlaceholderSpy.callCount, 3, "FlexibleColumnLayout.showPlaceholder should be called three times");
			assert.equal(oFlexLayoutShowPlaceholderSpy.getCall(0).args[0].aggregation, "beginColumnPages", "FlexibleColumnLayout.showPlaceholder should be called on 'beginColumnPages' aggregation");
			assert.equal(oFlexLayoutShowPlaceholderSpy.getCall(1).args[0].aggregation, "midColumnPages", "FlexibleColumnLayout.showPlaceholder should be called on 'midColumnPages' aggregation");
			assert.equal(oFlexLayoutShowPlaceholderSpy.getCall(2).args[0].aggregation, "endColumnPages", "FlexibleColumnLayout.showPlaceholder should be called on 'endColumnPages' aggregation");// showPlaceholder

			// needPlaceholder
			assert.equal(oFlexLayoutNeedPlaceholderSpy.callCount, 3, "FlexibleColumnLayout.needPlaceholder should be called three times");
			assert.equal(oFlexLayoutNeedPlaceholderSpy.getCall(0).args[0], "beginColumnPages", "FlexibleColumnLayout.needPlaceholder should be called on 'beginColumnPages' aggregation");
			assert.equal(oFlexLayoutNeedPlaceholderSpy.getCall(1).args[0], "midColumnPages", "FlexibleColumnLayout.needPlaceholder should be called on 'midColumnPages' aggregation");
			assert.equal(oFlexLayoutNeedPlaceholderSpy.getCall(2).args[0], "endColumnPages", "FlexibleColumnLayout.needPlaceholder should be called on 'endColumnPages' aggregation");

			// hidePlaceholder
			assert.equal(oFlexLayoutHidePlaceholderSpy.callCount, 2, "FlexibleColumnLayout.hidePlaceholder should be called two times");
			assert.equal(oFlexLayoutHidePlaceholderSpy.getCall(0).args[0].aggregation, "midColumnPages", "FlexibleColumnLayout.hidePlaceholder should be called on 'midColumnPages' aggregation");
			assert.equal(oFlexLayoutHidePlaceholderSpy.getCall(1).args[0].aggregation, "endColumnPages", "FlexibleColumnLayout.hidePlaceholder should be called on 'endColumnPages' aggregation");

			assert.equal(oTargetDisplayed.callCount, 1, "first target is displayed");
			assert.ok(oFlexLayoutShowPlaceholderSpy.getCall(1).calledBefore(oTargetDisplayed.getCall(0)), "showPlaceholder for the second target shouldn't wait for the display process of the first target");
			assert.ok(oFlexLayoutShowPlaceholderSpy.getCall(2).calledBefore(oTargetDisplayed.getCall(0)), "showPlaceholder for the third target shouldn't wait for the display process of the first target");

			oFlexLayoutShowPlaceholderSpy.resetHistory();
			oFlexLayoutNeedPlaceholderSpy.resetHistory();
			oFlexLayoutHidePlaceholderSpy.resetHistory();
			oTargetDisplayed.resetHistory();

			return new Promise(function(resolve, reject) {
				oRouter.getRoute("route1").attachMatched(function(oEvent) {
					resolve(oFlexColumnLayout);
				});

				// targetAutoCloseFalse, target4
				oRouter.navTo("route1");
			});
		}).then(function(oFlexColumnLayout) {
			// showPlaceholder
			assert.equal(oFlexLayoutShowPlaceholderSpy.callCount, 2, "FlexibleColumnLayout.showPlaceholder should be called for another two times");
			assert.equal(oFlexLayoutShowPlaceholderSpy.getCall(0).args[0].aggregation, "midColumnPages",
				"FlexibleColumnLayout.showPlaceholder should be called on 'midColumnPages' aggregation - 'beginColumnPages' didn't change");
			assert.equal(oFlexLayoutShowPlaceholderSpy.getCall(1).args[0].aggregation, "endColumnPages",
				"FlexibleColumnLayout.showPlaceholder should be called on 'endColumnPages' aggregation - 'beginColumnPages' didn't change");

			// needPlaceholder
			assert.equal(oFlexLayoutNeedPlaceholderSpy.callCount, 2, "FlexibleColumnLayout.needPlaceholder should be called for another two times");
			assert.equal(oFlexLayoutNeedPlaceholderSpy.getCall(0).args[0], "midColumnPages", "FlexibleColumnLayout.needPlaceholder should be called on 'midColumnPages' aggregation");
			assert.equal(oFlexLayoutNeedPlaceholderSpy.getCall(1).args[0], "endColumnPages", "FlexibleColumnLayout.needPlaceholder should be called on 'endColumnPages' aggregation");

			// hidePlaceholder
			assert.equal(oFlexLayoutHidePlaceholderSpy.callCount, 1, "FlexibleColumnLayout.hidePlaceholder should be called for another time");
			assert.equal(oFlexLayoutHidePlaceholderSpy.getCall(0).args[0].aggregation, "midColumnPages", "FlexibleColumnLayout.hidePlaceholder should be called on 'midColumnPages' aggregation");

			assert.ok(oFlexColumnLayout._getBeginColumn()
				.getDomRef().contains(document.getElementById("myPlaceholder")), "beginColumn should still contain the placeholder (autoClose: false)");
			assert.ok(oFlexColumnLayout._getEndColumn()
				.getDomRef().contains(document.getElementById("myPlaceholder1")), "endColumn should still contain the placeholder (autoClose: false)");

			oFlexColumnLayout.hidePlaceholder({ aggregation: "beginColumPages" });
			assert.notOk(oFlexColumnLayout._getEndColumn()
				.getDomRef().contains(document.getElementById("myPlaceholder")), "beginColumn shouldn't contain the placeholder anymore");

			oFlexColumnLayout.hidePlaceholder({ aggregation: "endColumnPages" });
			assert.notOk(oFlexColumnLayout._getEndColumn()
				.getDomRef().contains(document.getElementById("myPlaceholder1")), "endColumn shouldn't contain the placeholder anymore");

			// cleanup
			oComponentContainer.destroy();
			oFlexLayoutShowPlaceholderSpy.restore();
			oFlexLayoutNeedPlaceholderSpy.restore();
			oFlexLayoutHidePlaceholderSpy.restore();
		});
	});
});