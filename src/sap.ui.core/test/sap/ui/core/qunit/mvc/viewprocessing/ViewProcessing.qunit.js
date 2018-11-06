/*global QUnit, sinon */
sap.ui.define([
	"jquery.sap.global",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/View",
	"sap/ui/core/UIArea",
	"sap/ui/core/UIComponent",
	'sap/ui/core/Component',
	'sap/ui/core/ComponentContainer',
	"sap/m/Label",
	"sap/m/HBox",
	'sap/ui/core/qunit/mvc/viewprocessing/MyGlobal',
	'sap/ui/base/SyncPromise',
	"sap/ui/core/mvc/XMLView"
], function(jQuery, JSONModel, View, UIArea, UIComponent, Component, ComponentContainer, Label, HBox, MyGlobal, SyncPromise, XMLView) {

	"use strict";

	// create content div
	var oDIV = document.createElement("div");
	oDIV.id = "content";
	document.body.appendChild(oDIV);


	/* factory shortcuts */

	function testComponentFactory(sComponentName, fnViewFactory, fnViewLoadedCallback) {
		jQuery.sap.declare(sComponentName + ".Component");

		UIComponent.extend(sComponentName + ".Component", {
			createContent: function() {

				var oView = fnViewFactory();

				oView.loaded().then(fnViewLoadedCallback.bind(null, oView, this));
				return oView; //do it like fiori elements and add it later
			}
		});

		return sap.ui.component({
			name: sComponentName
		});
	}

	//use counter to avoid duplicate id issues
	var iCounter = 0;
	function testViewFactoryFn(bAsync) {
		return function(sViewId, sViewName, oController) {
			return sap.ui.xmlview(sViewId + (bAsync ? "async" : "sync") + (iCounter++), {
				async: bAsync,
				viewName: sViewName,
				controller: oController
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


	function viewProcessingTests(bAsyncView, sSyncProcessingMode) {

		QUnit.module("XMLView " + (bAsyncView ? "async" : "sync") + (sSyncProcessingMode ? " with " + sSyncProcessingMode + " processing" : ""), {
			beforeEach: function() {
				this._sSyncProcessingModeBefore = sap.ui.getCore().getConfiguration().getXMLProcessingMode();
				sap.ui.getCore().getConfiguration().setXMLProcessingMode(sSyncProcessingMode);

				var fnOldSyncPromiseAll = SyncPromise.all;
				MyGlobal.reset();
				this.SyncPromiseAllStub = sinon.stub(SyncPromise, "all").callsFake(function(args) {
					 return fnOldSyncPromiseAll(args.reverse()).then(function(oRes) {
						 return oRes.reverse();
					 });
				});
				this.viewFactory = testViewFactoryFn(bAsyncView);
				this._cleanup = [];
				this.renderSync = function(ctrl) {
					this._cleanup.push(ctrl);
					ctrl.placeAt("content");
					sap.ui.getCore().applyChanges();
				};
			},
			afterEach: function() {
				this._cleanup.forEach(function(ctrl) {
					ctrl.destroy();
				});
				this.SyncPromiseAllStub.restore();
				sap.ui.getCore().getConfiguration().setXMLProcessingMode(this._sSyncProcessingModeBefore);
			}
		});

		/**
		 * check that all aggregations are created in the correct order
		 */
		QUnit.test("Simple Aggregation order with async view", function(assert) {

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

			this.renderSync(
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
		QUnit.test("Aggregation order with async view", function(assert) {

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

			this.renderSync(
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
		QUnit.test("ExtensionPoint with async view tests", function(assert) {

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

			this.renderSync(
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
		QUnit.test("controller event test", function(assert) {

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

			this.renderSync(
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
		QUnit.test("Bad control processing", function(assert) {

			// view
			var oView = this.viewFactory("myViewBadControl", "sap.ui.core.qunit.mvc.viewprocessing.ViewProcessingBadControl");

			this.renderSync(oView);

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
		QUnit.test("Owner component setting for Controls", function(assert) {

			var iNumberOfComponents = 3;

			//@see ViewProcessingRec.view.js
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

				var fnViewFactory = this.viewFactory.bind(null, (bAsyncView ? "async" : "sync") + sSyncProcessingMode + "view" + i, "sap.ui.core.qunit.mvc.viewprocessing.ViewProcessingRec");

				testComponentFactory("my.test." + (bAsyncView ? "async" : "sync") + sSyncProcessingMode + "." + i, fnViewFactory, fnAssertions);

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

			var fnViewFactory = this.viewFactory.bind(null, (bAsyncView ? "async" : "sync") + sSyncProcessingMode + "view_x", "sap.ui.core.qunit.mvc.viewprocessing.NestingView");

			testComponentFactory("TheBest." + (bAsyncView ? "async" : "sync") + sSyncProcessingMode, fnViewFactory, fnAssertions);

		});
	}

	/**
	 * test execution
	 */
	//asynchronous
	viewProcessingTests(true);
	viewProcessingTests(true, "sequential");

	//synchronous
	viewProcessingTests(false);
	//should not change behaviour as "sequential" only works in conjunction with async true
	viewProcessingTests(false, "sequential");

});
