/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/UIComponent",
	'sap/ui/core/Component',
	"sap/ui/core/Element",
	"sap/m/Panel",
	"sap/m/HBox",
	'sap/ui/core/qunit/mvc/viewprocessing/MyGlobal',
	'sap/ui/base/SyncPromise',
	"sap/ui/core/mvc/XMLProcessingMode",
	"sap/ui/core/StashedControlSupport",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(UIComponent, Component, Element, Panel, HBox, MyGlobal, SyncPromise, XMLProcessingMode, StashedControlSupport, nextUIUpdate) {

	"use strict";

	// create content div
	var oDIV = document.createElement("div");
	oDIV.id = "content";
	document.body.appendChild(oDIV);


	/* factory shortcuts */

	function testComponentFactory(sComponentName, fnViewFactory, fnViewLoadedCallback) {
		var sClassName = sComponentName + ".Component";
		var sModuleName = sClassName.replace(/\./g, "/");

		sap.ui.predefine(sModuleName, function() {
			return UIComponent.extend(sClassName, {
				createContent: function() {

					var oView = fnViewFactory();

					oView.loaded().then(fnViewLoadedCallback.bind(null, oView, this));
					return oView; //do it like fiori elements and add it later
				}
			});
		});

		return sap.ui.component({
			name: sComponentName
		});
	}

	//use counter to avoid duplicate id issues
	var iCounter = 0;
	function testViewFactoryFn(bAsync, sProcessingMode) {
		return function(sViewId, sViewName, oController) {
			return sap.ui.xmlview(sViewId + (bAsync ? "async" : "sync") + (iCounter++), {
				async: bAsync,
				viewName: sViewName,
				controller: oController,
				processingMode: sProcessingMode
			});
		};
	}

	function testControllerImplFactory(assert, sControllerName) {
		// controller
		var oControllerImpl = {
			onInit: function() {
				var oView = this.getView();
				assert.ok(oView, "View " + oView.getId() + " is present");
				assert.ok(oView.byId("Panel"), "Panel within the view is present");
			},
			onBeforeRendering: function() {
				var oView = this.getView();
				assert.ok(oView, "View " + oView.getId() + " is present");
				assert.ok(oView.byId("Panel"), "Panel within the view is present");
			}
		};

		sap.ui.controller(sControllerName, oControllerImpl);

		return oControllerImpl;
	}

	function viewProcessingTests(bAsyncView, sProcessingMode) {

		QUnit.module("XMLView " + (bAsyncView ? "async" : "sync") + (sProcessingMode ? " with " + sProcessingMode + " processing" : ""), {
			beforeEach: function() {
				var fnOldSyncPromiseAll = SyncPromise.all;
				MyGlobal.reset();
				this.SyncPromiseAllStub = sinon.stub(SyncPromise, "all").callsFake(function(args) {
					 return fnOldSyncPromiseAll(args.reverse()).then(function(oRes) {
						 return oRes.reverse();
					 });
				});
				this.viewFactory = testViewFactoryFn(bAsyncView, sProcessingMode);
				this._cleanup = [];
				this.render = async function(ctrl) {
					this._cleanup.push(ctrl);
					ctrl.placeAt("content");
					await nextUIUpdate();
				};

				// create fake server for extension point manifests
				this.oServer = sinon.fakeServer.create();
				this.oServer.xhr.supportCORS = true;
				this.oServer.xhr.useFilters = true;
				this.oServer.xhr.filters = [];
				this.oServer.autoRespond = true;

				this.oServer.xhr.addFilter(function(method, url) {
					return url.match(/ExtensionPoints\/Parent\/manifest.json/) == null
							&& url.match(/StashedControl\/manifest.json/) == null;
				});

				StashedControlSupport.mixInto(Panel);
			},
			afterEach: function() {
				this._cleanup.forEach(function(ctrl) {
					ctrl.destroy();
				});
				this.SyncPromiseAllStub.restore();

				this.oServer.restore();
			}
		});

		/**
		 * check that all aggregations are created in the correct order
		 */
		QUnit.test("Simple Aggregation order with async view", async function(assert) {

			// view
			var oView = this.viewFactory("myViewSimpleAggrs", "sap.ui.core.qunit.mvc.viewprocessing.ViewProcessingSimpleAggregations");

			var p = oView.loaded().then(function() {

				// check if the order in which the aggregations are written to the respective map is stable
				// This is necessary because:
				// controls, flexibility and OPA rely on a stable iteration order of the aggregations itself (NOT its content!)
				var mySimpleAggregationsControl = oView.byId("mySimpleAggregationsControl");


				assert.ok(mySimpleAggregationsControl, "'mySimpleAggregationsControl' is present");
				assert.deepEqual(mySimpleAggregationsControl.getAlternativeContent(), [], "alternative content is not used within view");


				var mySimpleAggregationsControl2 = oView.byId("mySimpleAggregationsControl2");
				assert.ok(mySimpleAggregationsControl2, "'mySimpleAggregationsControl2' is present");

				assert.deepEqual(
					mySimpleAggregationsControl2.getAlternativeContent(),
					[oView.byId("InnerButton122")],
					"alternative content contains 'InnerButton122'");

			});

			await this.render(
				new HBox({
					renderType: "Bare",
					items: oView
				})
			);

			return p;
		});


		/**
		 * check that all aggregations are created in the correct order
		 */
		QUnit.test("Aggregation order with async view", async function(assert) {

			// view
			var oView = this.viewFactory("myViewAggrs", "sap.ui.core.qunit.mvc.viewprocessing.ViewProcessingManyAggregations");

			var p = oView.loaded().then(function() {

				// check if the order in which the aggregations are written to the respective map is stable
				// This is necessary because:
				// controls, flexibility and OPA rely on a stable iteration order of the aggregations itself (NOT its content!)
				var myManyAggregationsControl = oView.byId("myManyAggregationsControl");

				assert.deepEqual(myManyAggregationsControl.getAlternativeContent(),
					[oView.byId("myManyAggregationsControl2"), oView.byId("Button3"), oView.byId("Button4")],
					"alternativeContent aggregation contains 2 Buttons");
				assert.deepEqual(myManyAggregationsControl.getSecondaryContent(),
					[oView.byId("Button5"), oView.byId("Button6")],
					"secondaryContent aggregation contains 2 Buttons" );
				assert.deepEqual(myManyAggregationsControl.getContent(),
					[oView.byId("Button1"), oView.byId("Button2")],
					"content aggregation contains 2 Buttons");
				assert.deepEqual(myManyAggregationsControl.getBottomControls(),
					[oView.byId("Button7")],
					"bottomControls aggregation contains 1 Button");
				assert.deepEqual(myManyAggregationsControl.getGroundControls(),
					[oView.byId("Button8")],
					"groundControls aggregation contains 1 Button");
				assert.deepEqual(myManyAggregationsControl.getCustomData(), [], "customData aggregation is empty");



				// check the ordering inside a splitted default aggregation
				var oControl2 = oView.byId("myManyAggregationsControl2");
				var aBottomControls = oControl2.getBottomControls();

				var fnGetId = function(oElement) {
					return oElement.getId();
				};

				assert.deepEqual(aBottomControls.map(fnGetId),
					[oView.byId("InnerButton1"),oView.byId("InnerButton2"),oView.byId("InnerButton3"),oView.byId("InnerButton4")].map(fnGetId),
					"Ids of elements are in correct order within bottomControls aggregation");

				assert.deepEqual(aBottomControls,
					[oView.byId("InnerButton1"),oView.byId("InnerButton2"),oView.byId("InnerButton3"),oView.byId("InnerButton4")],
					"Elements are in correct order within bottomControls aggregation");

			});

			await this.render(
				new HBox({
					renderType: "Bare",
					items: oView
				})
			);

			return p;
		});


		/**
		 * check that all aggregations are created in the correct order
		 */
		QUnit.test("ExtensionPoint with async view tests", async function(assert) {

			// view
			var oView = this.viewFactory("myViewEP", "sap.ui.core.qunit.mvc.viewprocessing.ViewProcessingExtensionPoint");


			var getText = function(oCtrl) {
				return oCtrl.getText();
			};

			var p = oView.loaded().then(function() {

				var mySimpleAggregationsControl = oView.byId("ep");
				assert.notOk(mySimpleAggregationsControl, "ExtensionPoint should not be present, only its controls");


				assert.deepEqual(oView.getContent().map(getText), [
					"test-ext-1",
					"test-ext-2",
					"test-ext-3",
					"test-ext-4",
					"test0"],
					"there should be all 5 texts contained in the correct order");

				assert.deepEqual(MyGlobal.get().map(getText), [
					"test-ext-1",
					"test-ext-2",
					"test-ext-3",
					"test-ext-4"],
					"there should be all 5 texts contained in the correct order");

			});

			await this.render(
				new HBox({
					renderType: "Bare",
					items: oView
				})
			);

			return p;
		});


		/**
		 * check that all events are properly called within controller and that the view is correctly connected
		 */
		QUnit.test("controller event test", async function(assert) {

			// controller
			var oControllerImpl = testControllerImplFactory(assert, "sap.ui.core.qunit.mvc.viewprocessing.ViewProcessing");

			var pAfterRenderingController = new Promise(function(resolve){
				oControllerImpl.onAfterRendering = function() {
					var oView = this.getView();
					assert.ok(oView, "oView is present in onAfterRendering");
					assert.ok(oView.byId("Panel"), "Panel is present within view");
					resolve();
				};
			});

			var fnOnInitSpy = this.spy(oControllerImpl, "onInit");
			var fnOnAfterRenderingSpy = this.spy(oControllerImpl, "onAfterRendering");

			sap.ui.controller("sap.ui.core.qunit.mvc.viewprocessing.ViewProcessing", oControllerImpl);

			var oController = sap.ui.controller("sap.ui.core.qunit.mvc.viewprocessing.ViewProcessing");
			assert.equal(fnOnAfterRenderingSpy.callCount, 0, "onAfterRendering is not called initially");
			assert.equal(fnOnInitSpy.callCount, 0, "onInit is not called initially");


			// view
			var oView = this.viewFactory("myViewWithController", "sap.ui.core.qunit.mvc.viewprocessing.ViewProcessing", oController);

			await this.render(
				new HBox({
					renderType: "Bare",
					items: oView
				})
			);

			//check that respective functions were called
			return Promise.all([oView.loaded(), pAfterRenderingController]).then(function() {
				assert.equal(fnOnInitSpy.callCount, 1, "Init was called once");
				assert.equal(fnOnAfterRenderingSpy.callCount, 1, "onAfterRendering was called once");
			});

		});


		/**
		 * Tests parsing of a control which is not properly defined (does not return its class)
		 */
		QUnit.test("Bad control processing", async function(assert) {

			// view
			var oView = this.viewFactory("myViewBadControl", "sap.ui.core.qunit.mvc.viewprocessing.ViewProcessingBadControl");

			await this.render(oView);

			return oView.loaded().then(function() {
				var myBadControl = oView.byId("myBadControl");
				assert.ok(myBadControl, "BadControl is present within view");
			});
		});


		/**
		 * Test setting the ._sOwnerId for asynchronously loaded components within stacked views.
		 * Controls should have the correct owner ID.
		 * (Component which contains a JSView which contains XMLViews)
		 */
		QUnit.test("Owner component setting for Controls with JSView", function(assert) {

			var iNumberOfComponents = 3;

			//@see ViewProcessingRec_legacyAPIs.view.js
			var iNumberOfSubViews = 2;

			var iCnt = 0;
			// test processing will be completed in onExit of the view extension
			var done = assert.async();
			function fnCheckDone() {
				if (++iCnt === iNumberOfComponents * iNumberOfSubViews) {
					done();
				}
			}

			window._test_fnCallbackSubInit = function() {
				var oParent = this.getParent();
				while (oParent) {
					var newParent = oParent.getParent();
					// leave out UIArea as it gets always the first owner component id when #placeAt is called
					if (newParent) {
						assert.ok(oParent._sOwnerId, "OwnerId is set for parent control");
						assert.equal(oParent._sOwnerId, this._sOwnerId, "OwnerId matches parent");
					}
					oParent = newParent;
				}
				fnCheckDone();
			};

			function fnAssertions(oView, oComponentContext) {
				var oPanel = oView.byId("Panel");
				assert.ok(oPanel, "panel is present within " + oView.getId());
				assert.equal(Component.getOwnerIdFor(oPanel), oComponentContext.getId(), "Propagation of owner component to view creation works!");
			}

			//create async xml view
			for (var i = 0; i < iNumberOfComponents; i++) {

				var fnViewFactory = this.viewFactory.bind(null, (bAsyncView ? "async" : "sync") + sProcessingMode + "view" + i, "sap.ui.core.qunit.mvc.viewprocessing.ViewProcessingRec_legacyAPIs");

				testComponentFactory("my.test." + (bAsyncView ? "async" : "sync") + sProcessingMode + "." + i, fnViewFactory, fnAssertions);

			}

		});

		/**
		 * Test setting the ._sOwnerId for asynchronously loaded components within stacked views.
		 * Controls should have the correct owner ID.
		 * (Component which contains a Typed View which contains XMLViews)
		 */
		QUnit.test("Owner component setting for Controls with Typed View", function(assert) {

			var iNumberOfComponents = 3;

			//@see ViewProcessingRec_legacyAPIs.view.js
			var iNumberOfSubViews = 2;

			var iCnt = 0;
			// test processing will be completed in onExit of the view extension
			var done = assert.async();
			function fnCheckDone() {
				if (++iCnt === iNumberOfComponents * iNumberOfSubViews) {
					done();
				}
			}

			window._test_fnCallbackSubInit = function() {
				var oParent = this.getParent();
				while (oParent) {
					var newParent = oParent.getParent();
					// leave out UIArea as it gets always the first owner component id when #placeAt is called
					if (newParent) {
						assert.ok(oParent._sOwnerId, "OwnerId is set for parent control");
						assert.equal(oParent._sOwnerId, this._sOwnerId, "OwnerId matches parent");
					}
					oParent = newParent;
				}
				fnCheckDone();
			};

			function fnAssertions(oView, oComponentContext) {
				var oPanel = oView.byId("Panel");
				assert.ok(oPanel, "panel is present within " + oView.getId());
				assert.equal(Component.getOwnerIdFor(oPanel), oComponentContext.getId(), "Propagation of owner component to view creation works!");
			}

			//create async xml view
			for (var i = 0; i < iNumberOfComponents; i++) {

				var fnViewFactory = this.viewFactory.bind(null, (bAsyncView ? "async" : "sync") + sProcessingMode + "view" + i, "sap.ui.core.qunit.mvc.viewprocessing.ViewProcessingRecWithTypedView_legacyAPIs");

				testComponentFactory("my.test.typedview." + (bAsyncView ? "async" : "sync") + sProcessingMode + "." + i, fnViewFactory, fnAssertions);

			}

		});

		QUnit.test("Owner component setting for nested Sync View in Async View", function(assert) {
			var done = assert.async();

			function fnAssertions(oView, oComponentContext) {
				// Owner-Component for ASYNC View
				assert.equal(Component.getOwnerIdFor(oView), oComponentContext.getId(), "Owner Component for Async View is correct.");

				// Owner-Component for SYNC View
				assert.equal(Component.getOwnerIdFor(oView.byId("nestedView")), oComponentContext.getId(), "Owner Component for Sync View in Async View is correct.");

				done();
			}

			var fnViewFactory = this.viewFactory.bind(null, (bAsyncView ? "async" : "sync") + sProcessingMode + "view_x", "sap.ui.core.qunit.mvc.viewprocessing.NestingView");

			testComponentFactory("TheBest." + (bAsyncView ? "async" : "sync") + sProcessingMode, fnViewFactory, fnAssertions);

		});

		QUnit.test("Owner component setting for ExtensionPoints", async function(assert) {
			var done = assert.async();

			// responds changed parent manifest
			// async switch on root-view is switched based on test-execution
			var oManifest = {
				"_version": "0.0.1",
				"sap.app": {
					"id": "sap.ui.core.qunit.mvc.viewprocessing.ExtensionPoints.Parent"
				},
				"sap.ui5": {
					"rootView": {
						"viewName": "sap.ui.core.qunit.mvc.viewprocessing.ExtensionPoints.Parent.Main",
						"type": "XML",
						"async": bAsyncView,
						"processingMode": sProcessingMode,
						"id": "app"
					}
				}
			};

			this.oServer.respondWith("GET", /ExtensionPoints\/Parent\/manifest\.json/, [
				200,
				{
					"Content-Type": "application/json"
				},
				JSON.stringify(oManifest)
			]);

			var fnAssertions = function(oComponent, oView) {
				// resolved view content, extensionpoints are embedded
				var aContent = oView.getContent();

				// EPone (XMLView)
				var oEPOne = aContent[0];
				assert.deepEqual(Component.getOwnerComponentFor(oEPOne), oComponent, "Owner Component correctly set");
				// EPone -> sap.m.Button
				var aEPoneContent = aContent[0].getContent();
				assert.deepEqual(Component.getOwnerComponentFor(aEPoneContent[0]), oComponent, "Owner Component correctly set for controls in extension-point view: EPone");

				// sap.m.Text
				assert.deepEqual(Component.getOwnerComponentFor(aContent[1]), oComponent, "Owner Component correctly set");

				// EPtwo (XMLView)
				var oEPtwo = aContent[2];
				assert.deepEqual(Component.getOwnerComponentFor(oEPtwo), oComponent, "Owner Component correctly set");
				// EPtwo -> sap.m.Button
				var aEPtwoContent = oEPtwo.getContent();
				assert.deepEqual(Component.getOwnerComponentFor(aEPtwoContent[0]), oComponent, "Owner Component correctly set for controls in extension-point view: EPtwo");

				// EPnesting (XMLView)
				var oEPnesting = aContent[3];
				assert.deepEqual(Component.getOwnerComponentFor(oEPnesting), oComponent, "Owner Component correctly set");
				// EPtwo -> [sap.m.Button, sap.m.Button]
				var aEPnestingContent = oEPnesting.getContent();
				assert.deepEqual(Component.getOwnerComponentFor(aEPnestingContent[0]), oComponent, "Owner Component correctly set for controls in extension-point view: EPnesting (1)");
				assert.deepEqual(Component.getOwnerComponentFor(aEPnestingContent[1]), oComponent, "Owner Component correctly set for controls in extension-point view: EPnesting (2)");

				// |--> sap.m.Input nested in ExtensionPoint tag (EPnesting) - rendered after the extension
				assert.deepEqual(Component.getOwnerComponentFor(aContent[4]), oComponent, "Owner Component correctly set");

				// clean-up components
				oComponent.destroy();
				// Destroy and remove parent component manifest:
				// We need to do this because otherwise the parent UIComponent class will still have
				// the "old" manifest and the sync tests might end up with an async root-view.
				oComponent.getMetadata().getParent()._oManifest.destroy();
				delete oComponent.getMetadata().getParent()._oManifest;

				done();
			};

			if (bAsyncView) {
				Component.create({
					name:"sap.ui.core.qunit.mvc.viewprocessing.ExtensionPoints.Child"
				}).then(function(oComponent) {
					oComponent.getRootControl().loaded().then(function(oView) {
						return fnAssertions(oComponent, oView);
					});
				});
			} else {
				var oComponent = sap.ui.component({
					name:"sap.ui.core.qunit.mvc.viewprocessing.ExtensionPoints.Child"
				});
				await nextUIUpdate();
				fnAssertions(oComponent, oComponent.getRootControl());
			}

		});

		QUnit.test("Owner component setting for stashed control", async function(assert) {
			var done = assert.async();

			var sComponentName = "sap.ui.core.qunit.mvc.viewprocessing.StashedControl" + bAsyncView + sProcessingMode;

			sap.ui.predefine((sComponentName + ".Component").replace(/\./g, "/"), ["sap/ui/core/UIComponent"], function(UIComponent) {
				return UIComponent.extend(sComponentName + ".Component", { });
			});

			// responds changed parent manifest
			// async switch on root-view is switched based on test-execution
			var oManifest = {
				"_version": "0.0.1",
				"sap.app": {
					"id": sComponentName
				},
				"sap.ui5": {
					"rootView": {
						"viewName": "sap.ui.core.qunit.mvc.viewprocessing.StashedControl.Main",
						"type": "XML",
						"async": bAsyncView,
						"processingMode": sProcessingMode,
						"id": "app"
					}
				}
			};

			var fnAssertions = function(oComponent, oView) {
				// --------- control tree checks ---------
				var oPanel = oView.byId("panel");
				var oButton = oView.byId("stashedButton");

				assert.ok(oPanel, "Panel wrapper is available.");
				assert.notOk(oButton, "Stashed button inside stashed panel does not exist yet.");

				var oNormalButtonInStashedParent = oView.byId("normalButtonInStashedParent");
				assert.ok(!oNormalButtonInStashedParent, "Normal button in stashed area isn't created");

				// check the StashedControl instances
				var oStashedControlForButtonInPanel = oView.byId("sap-ui-stashed-stashedButton");
				assert.ok(!oStashedControlForButtonInPanel, "StashedControl for button in stashed area (Panel) isn't created");

				// Owner Component Checks
				var oOwnerComponent = Component.getOwnerComponentFor(oPanel);
				assert.ok(oOwnerComponent, "Owner Component for StashedControl of panel can be found");
				if (oOwnerComponent) {
					assert.strictEqual(oOwnerComponent.getId(), oComponent.getId(), "Stashed Panel should have owner component");
				}

				var oStashedPanel = Element.getElementById(oView.createId("panel"));
				oOwnerComponent = Component.getOwnerComponentFor(oStashedPanel);
				assert.ok(oOwnerComponent, "Owner Component for StashedControl of panel can be found");
				if (oOwnerComponent) {
					assert.strictEqual(oOwnerComponent.getId(), oComponent.getId(), "Stashed Panel should have owner component");
				}

				var oNormalButton = oView.byId("normalButton");
				oOwnerComponent = Component.getOwnerComponentFor(oNormalButton);
				assert.ok(oOwnerComponent, "Owner Component for normal button can be found");
				if (oOwnerComponent) {
					assert.strictEqual(oOwnerComponent.getId(), oComponent.getId(), "Normal button should have owner component");
				}


				// --------- aggregation checks ---------
				var oPage = oView.byId("page");

				assert.equal(oPage.getContent().length, 2, "Two elements in page content aggregation.");
				// stashed panel
				assert.ok(oPage.getContent()[0].isA("sap.m.Panel"), "1st entry in content aggregation is a Panel.");
				assert.equal(oPage.getContent()[0].getContent().length, 0, "Wrapper for stashed Panel has no content in its content aggregation.");
				// normal button
				assert.ok(oPage.getContent()[1].isA("sap.m.Button"), "2nd entry in content aggregation is a Button.");

				// Stashing API checks
				var aStashedControlsInPage = StashedControlSupport.getStashedControls(oView.createId("page"));
				assert.equal(aStashedControlsInPage.length, 1, "Only one stashed control in Page.");
				assert.deepEqual(aStashedControlsInPage[0], oStashedPanel, "StashedControl in Page is the stashed panel");


				// --------- unstash the stashed panel ---------
				// get the real panel again, since the wrapper should now be replaced
				var oRealPanel = oStashedPanel.unstash();
				assert.ok(oRealPanel.isA("sap.m.Panel"), "The real panel instance is created after unstash");

				// check for additional stashed control inside the now unstashed panel
				oStashedControlForButtonInPanel = Element.getElementById(oView.createId("stashedButton"));
				oNormalButtonInStashedParent = oView.byId("normalButtonInStashedParent");

				assert.ok(oStashedControlForButtonInPanel, "Stashed button in stashed area is created");
				assert.ok(oNormalButtonInStashedParent, "Normal button in stashed area is created");

				oOwnerComponent = Component.getOwnerComponentFor(oStashedControlForButtonInPanel);
				assert.ok(oOwnerComponent, "Owner Component for stashed button can be found");
				if (oOwnerComponent) {
					assert.strictEqual(oOwnerComponent.getId(), oComponent.getId(), "Stashed button should have owner component");
				}

				oOwnerComponent = Component.getOwnerComponentFor(oNormalButtonInStashedParent);
				assert.ok(oOwnerComponent, "Owner Component for normal button in stashed area can be found");
				if (oOwnerComponent) {
					assert.strictEqual(oOwnerComponent.getId(), oComponent.getId(), "Normal button in stashed area should have owner component");
				}

				// clean-up components
				oComponent.destroy();
				done();
			};

			if (bAsyncView) {
				Component.create({
					name: sComponentName,
					manifest: oManifest
				}).then(function(oComponent) {
					oComponent.getRootControl().loaded().then(function(oView) {
						fnAssertions(oComponent, oView);
					});
				});
			} else {
				var oComponent = sap.ui.component({
					name: sComponentName,
					manifest: oManifest,
					async: false
				});
				await nextUIUpdate();
				fnAssertions(oComponent, oComponent.getRootControl());
			}

		});
	}

	/**
	 * test execution
	 */
	// asynchronous -> processingMode is set to "SequentialLegacy"
	viewProcessingTests(true);
	// per default async=true leads to processingMode "SequentialLegacy".
	// Overriding the processingMode to "Sequential" leads to the same behaviour as using the new (XML)View.create factory
	viewProcessingTests(true, XMLProcessingMode.Sequential);

	// synchronous -> processingMode is set to <code>undefined</code>
	viewProcessingTests(false);
	// should not change behaviour as "Sequential" only works in conjunction with async true
	viewProcessingTests(false, XMLProcessingMode.Sequential);
	// should not change behaviour as "SequentialLegacy" only works in conjunction with async true
	viewProcessingTests(false, XMLProcessingMode.SequentialLegacy);

});
