/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/mdc/Chart",
	"sap/ui/mdc/chart/Item",
	"sap/ui/core/UIComponent",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/library",
	"sap/chart/Chart",
	"sap/m/Button",
	"sap/ui/mdc/actiontoolbar/ActionToolbarAction",
	"sap/ui/mdc/enums/ActionToolbarActionAlignment",
	"sap/m/ToolbarSeparator",
	"sap/ui/fl/variants/VariantManagement",
	"sap/m/IllustratedMessage",
	"sap/ui/mdc/chart/DrillBreadcrumbs",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/core/Theming",
	"sap/base/util/Deferred"
],
	function (
		Chart,
		Item,
		UIComponent,
		ComponentContainer,
		CoreLibrary,
		InnerChart,
		Button,
		ActionToolbarAction,
		Alignment,
		ToolbarSeparator,
		VM,
		IllustratedMessage,
		Breadcrumbs,
		nextUIUpdate,
		Theming,
		Deferred
	) {
		"use strict";

		// shortcut for sap.ui.core.TitleLevel
		const TitleLevel = CoreLibrary.TitleLevel;

		const sDelegatePath = "test-resources/sap/ui/mdc/delegates/ChartDelegate";

		QUnit.module("sap.ui.mdc.Chart: Simple Properties with autobindOnInit false", {

			beforeEach: async function () {
				const TestComponent = UIComponent.extend("test", {
					metadata: {
						manifest: {
							"sap.app": {
								"id": "",
								"type": "application"
							}
						}
					},
					createContent: function () {
						return new Chart({
							autoBindOnInit: false,
							delegate: {
								name: sDelegatePath,
								payload: {
									collectionPath: "/testPath"
								}
							},
							propertyInfo: [{ name: "name1", label: "name1", dataType: "String" }, { name: "name2", label: "name2", dataType: "String" }]
						});
					}
				});
				this.oUiComponent = new TestComponent();
				this.oUiComponentContainer = new ComponentContainer({
					component: this.oUiComponent,
					async: false
				});
				this.oMDCChart = this.oUiComponent.getRootControl();

				this.oUiComponentContainer.placeAt("qunit-fixture");
				await nextUIUpdate();
			},
			afterEach: function () {
				this.oUiComponentContainer.destroy();
				this.oUiComponent.destroy();
			}

		});

		QUnit.test("_createContentFromPropertyInfos", function (assert) {
			const done = assert.async();
			const oMockDelegate = { checkAndUpdateMDCItems: function () { return Promise.resolve(); }, createInnerChartContent: function () { return Promise.resolve(); }, getDrillableItems: function () { return []; } };
			const _getControlDelegateStub = sinon.stub(this.oMDCChart, "getControlDelegate").returns(oMockDelegate);
			// this.oMDCChart.getControlDelegate = function() {return oMockDelegate;};
			this.oMDCChart._propagatePropertiesToInnerChart = function () { }; //Mock this as it requires an inner chart (which we don't want to test in this case)

			const oCreateCrumbsSpy = sinon.spy(this.oMDCChart, "_createBreadcrumbs");
			const oPropagateSpy = sinon.spy(this.oMDCChart, "_propagatePropertiesToInnerChart");

			this.oMDCChart._createContentfromPropertyInfos();

			setTimeout(function() { //as order of promise execution is not stable
				this.oMDCChart.innerChartBound().then(function () {
					assert.ok(oCreateCrumbsSpy.calledOnce, "Function was called");
					assert.ok(this.oMDCChart._oObserver, "Observer was created");
					assert.ok(oPropagateSpy.calledOnce, "Function was called");

					this.oMDCChart._createContentfromPropertyInfos();
					this.oMDCChart.innerChartBound().then(function () {

						assert.notOk(oCreateCrumbsSpy.calledTwice, "Function was nocht called twice");
						assert.ok(this.oMDCChart._oObserver, "Observer was created");
						assert.notOk(oPropagateSpy.calledTwice, "Function was not called twice");

						_getControlDelegateStub.restore();
						oPropagateSpy.restore();
						oCreateCrumbsSpy.restore();
						done();
					}.bind(this));
				}.bind(this));
			}.bind(this), 0);
		});


		QUnit.module("sap.ui.mdc.Chart: Simple Properties", {

			beforeEach: async function () {
				const TestComponent = UIComponent.extend("test", {
					metadata: {
						manifest: {
							"sap.app": {
								"id": "",
								"type": "application"
							}
						}
					},
					createContent: function () {
						return new Chart({
							delegate: {
								name: sDelegatePath,
								payload: {
									collectionPath: "/testPath"
								}
							},
							propertyInfo: [{ name: "name1", label: "name1", dataType: "String" }, { name: "name2", label: "name2", dataType: "String" }]
						});
					}
				});
				this.oUiComponent = new TestComponent();
				this.oUiComponentContainer = new ComponentContainer({
					component: this.oUiComponent,
					async: false
				});
				this.oMDCChart = this.oUiComponent.getRootControl();

				this.oUiComponentContainer.placeAt("qunit-fixture");
				await nextUIUpdate();
			},
			afterEach: function () {
				this.oUiComponentContainer.destroy();
				this.oUiComponent.destroy();
			}

		});

		QUnit.test("Test exists", function (assert) {
			assert.ok(true);
		});


		QUnit.test("Instantiate", function (assert) {
			assert.ok(this.oMDCChart);
			assert.ok(this.oMDCChart.isA("sap.ui.mdc.IxState"));

		});

		QUnit.test("PropertyHelperMixin relevant parts are part of MDC Chart", function (assert) {
			assert.ok(this.oMDCChart.isPropertyHelperFinal);
			assert.ok(this.oMDCChart._getPropertyByNameAsync);
		});

		QUnit.test("PropertyHelper not finalized on startup", function (assert) {
			assert.ok(this.oMDCChart.isPropertyHelperFinal() == false);
		});

		QUnit.test("Init", function (assert) {
			const done = assert.async();

			this.oMDCChart.initialized().then(function () {
				assert.ok(this.oMDCChart, "The chart is created");

				done();
			}.bind(this));

		});

		QUnit.test("_loadDelegate", function (assert) {
			const done = assert.async();

			this.oMDCChart._loadDelegate().then(function (oDelegate) {
				assert.ok(oDelegate, "Delegate loaded");
				done();
			});
		});

		QUnit.test("MDC Chart rebind", function (assert) {
			const done = assert.async();

			this.oMDCChart.initialized().then(function () {
				assert.ok(this.oMDCChart.getControlDelegate(), "Control delegate is initialized");
				this.oMDCChart.getControlDelegate().setInnerChartBoundTest(true); //Mock value for inner chart bound

				const getBindingInfoSpy = sinon.spy(this.oMDCChart.getControlDelegate(), "getBindingInfo");
				const updateBindingInfoSpy = sinon.spy(this.oMDCChart.getControlDelegate(), "updateBindingInfo");
				const rebindSpy = sinon.spy(this.oMDCChart.getControlDelegate(), "rebind");

				this.oMDCChart.rebind();

				assert.ok(this.oMDCChart.getBusy(), "MDC Chart is set busy");
				assert.ok(getBindingInfoSpy.calledOnce, "getBindingInfo called on delegate");
				assert.ok(updateBindingInfoSpy.calledOnce, "updateBindingInfo called on delegate");
				assert.ok(rebindSpy.calledOnce, "rebind called on delegate");

				done();
			}.bind(this));
		});

		QUnit.test("_getToolbar", function (assert) {
			const done = assert.async();

			this.oMDCChart.initialized().then(function () {
				this.oMDCChart.getAggregation("_toolbar").destroy();
				this.oMDCChart.setAggregation("_toolbar", undefined);
				assert.ok(this.oMDCChart.getAggregation("_toolbar") == undefined, "Toolbar aggregation is empty");

				this.oMDCChart._getToolbar();
				assert.ok(this.oMDCChart.getAggregation("_toolbar"), "Toolbar was created");
				assert.ok(this.oMDCChart.getAggregation("_toolbar").isA("sap.ui.mdc.ActionToolbar"), "Toolbar is instance of sap.ui.mdc.ActionToolbar");

				done();
			}.bind(this));
		});

		QUnit.test("_updateToolbar", function (assert) {
			const done = assert.async();

			this.oMDCChart.initialized().then(function () {
				const updateZoomButtonsSpy = sinon.spy(this.oMDCChart, "_updateZoomButtons");
				const initSelectionDetailsSpy = sinon.spy(this.oMDCChart, "_initSelectionDetails");

				this.oMDCChart._updateToolbar();
				assert.ok(updateZoomButtonsSpy.calledOnce, "_updateZoomButtons was called");
				assert.ok(initSelectionDetailsSpy.calledOnce, "_initSelectionDetails was called");

				done();
			}.bind(this));
		});

		QUnit.test("_getInnerChart", function (assert) {
			const done = assert.async();

			this.oMDCChart.initialized().then(function () {
				const delegateSpy = sinon.spy(this.oMDCChart.getControlDelegate(), "getInnerChart");

				this.oMDCChart._getInnerChart();
				assert.ok(delegateSpy.calledOnce, "getInnerChart was called on innerChart");

				done();
			}.bind(this));
		});

		QUnit.test("zoomIn", function (assert) {
			const done = assert.async();

			this.oMDCChart.initialized().then(function () {
				const zoomInSpy = sinon.spy(this.oMDCChart.getControlDelegate(), "zoomIn");

				this.oMDCChart.zoomIn();
				assert.ok(zoomInSpy.calledOnce, "Zoom in was called on delegate");
				done();
			}.bind(this));
		});

		QUnit.test("zoomOut", function (assert) {
			const done = assert.async();

			this.oMDCChart.initialized().then(function () {
				const zoomOutSpy = sinon.spy(this.oMDCChart.getControlDelegate(), "zoomOut");

				this.oMDCChart.zoomOut();
				assert.ok(zoomOutSpy.calledOnce, "Zoom out was called on delegate");
				done();
			}.bind(this));
		});

		QUnit.test("getZoomState", function (assert) {
			const done = assert.async();

			this.oMDCChart.initialized().then(function () {
				const zoomSpy = sinon.spy(this.oMDCChart.getControlDelegate(), "getZoomState");

				this.oMDCChart._updateZoomButtons();
				assert.ok(zoomSpy.calledOnce, "Zoom status was called on delegate");
				done();
			}.bind(this));
		});

		QUnit.test("setLegendVisible", function (assert) {
			const done = assert.async();

			this.oMDCChart.initialized().then(function () {
				const legendSpy = sinon.spy(this.oMDCChart.getControlDelegate(), "setLegendVisible");
				assert.ok(this.oMDCChart.getLegendVisible() == true, "Property is in initial state");

				this.oMDCChart.setLegendVisible(false);
				assert.ok(legendSpy.calledOnce, "setLegendVisible was called on delegate");
				assert.ok(this.oMDCChart.getLegendVisible() == false, "Property was updated");
				done();

			}.bind(this));
		});

		QUnit.test("setShowChartTooltip", function (assert) {
			const done = assert.async();

			this.oMDCChart.initialized().then(function () {
				assert.ok(this.oMDCChart.getShowChartTooltip(), "Initial value of property is true");
				const tooltipSpy = sinon.spy(this.oMDCChart.getControlDelegate(), "setChartTooltipVisibility");

				this.oMDCChart.setShowChartTooltip(false);
				assert.ok(tooltipSpy.calledOnce, "delegate function was called");
				assert.ok(!this.oMDCChart.getShowChartTooltip(), "Property was set");

				done();
			}.bind(this));
		});

		QUnit.test("MDC Chart _propagatePropertiesToInnerChart", function (assert) {
			const done = assert.async();

			this.oMDCChart.initialized().then(function () {
				const legendSpy = sinon.spy(this.oMDCChart, "setLegendVisible");
				const tooltipSpy = sinon.spy(this.oMDCChart, "setShowChartTooltip");
				const typeSpy = sinon.spy(this.oMDCChart, "setChartType");

				this.oMDCChart._propagatePropertiesToInnerChart();
				assert.ok(legendSpy.calledOnce, "setLegendVisible was called");
				assert.ok(tooltipSpy.calledOnce, "setShowChartTooltip was called");
				assert.ok(typeSpy.calledOnce, "setChartType was called");

				done();
			}.bind(this));
		});

		QUnit.test("getChartTypeInfo", function (assert) {
			const done = assert.async();

			this.oMDCChart.initialized().then(function () {
				const delegateSpy = sinon.spy(this.oMDCChart.getControlDelegate(), "getChartTypeInfo");

				const info = this.oMDCChart.getChartTypeInfo();
				assert.ok(delegateSpy.calledOnce, "getChartTypeInfo was called on delegate");
				assert.ok(info, "charttypeinfo is present");

				done();
			}.bind(this));
		});

		QUnit.test("getAvailableChartTypes", function (assert) {
			const done = assert.async();

			this.oMDCChart.initialized().then(function () {
				const delegateSpy = sinon.spy(this.oMDCChart.getControlDelegate(), "getAvailableChartTypes");

				this.oMDCChart.getAvailableChartTypes();
				assert.ok(delegateSpy.calledOnce, "getAvailableChartTypes was called on delegate");
				done();
			}.bind(this));
		});

		QUnit.test("setChartType", function (assert) {
			const done = assert.async();

			this.oMDCChart.initialized().then(function () {
				const delegateSpy = sinon.spy(this.oMDCChart.getControlDelegate(), "setChartType");

				this.oMDCChart.setChartType();
				assert.ok(delegateSpy.calledOnce, "setChartType was called on delegate");
				done();
			}.bind(this));
		});

		QUnit.test("getCurrentState", function (assert) {
			const done = assert.async();

			this.oMDCChart.initialized().then(function () {
				let oState = this.oMDCChart.getCurrentState();
				assert.ok(oState, "p13n state object was returned");
				assert.ok(!oState.items, "p13n state contains no items");
				assert.ok(!oState.sorters, "p13n state contains no sorters");

				this.oMDCChart.setP13nMode(["Sort"]);
				oState = this.oMDCChart.getCurrentState();
				assert.ok(oState.sorters, "p13n state contains sorters");

				this.oMDCChart.setP13nMode(["Item"]);
				oState = this.oMDCChart.getCurrentState();
				assert.ok(oState.items, "p13n state contains items");

				done();
			}.bind(this));
		});

		QUnit.test("_getVisibleProperties", function (assert) {
			const done = assert.async();

			this.oMDCChart.initialized().then(function () {
				const oMDCItem = new Item("testItem1", { propertyKey: "testName", role: "testRole" });
				this.oMDCChart.insertItem(oMDCItem, 0);

				const aVisibleItems = this.oMDCChart._getVisibleProperties();
				assert.ok(aVisibleItems.length === 1, "Visible Properties contain 1 item");
				assert.ok(aVisibleItems[0].name === "testName", "Item has correct name");
				assert.ok(aVisibleItems[0].role === "testRole", "Item has correct role");

				done();
			}.bind(this));
		});

		QUnit.test("_renderOverlay", function (assert) {
			const done = assert.async();

			this.oMDCChart.initialized().then(function () {

				this.oMDCChart._renderOverlay(true);
				let oOverlay = this.oMDCChart.getControlDelegate().getInnerChart().$().find(".sapUiMdcChartOverlay");
				assert.ok(oOverlay, "Overlay was added to inner chart");

				this.oMDCChart._renderOverlay(false);
				oOverlay = this.oMDCChart.getControlDelegate().getInnerChart().$().find(".sapUiMdcChartOverlay");
				assert.ok(oOverlay, "Overlay was removed from inner chart");
				done();
			}.bind(this));
		});


		QUnit.test("_propagateItemChangeToInnerChart", function (assert) {
			const done = assert.async();

			this.oMDCChart.initialized().then(function () {
				//Arrange
				const oMockItem = new Item({ propertyKey: "testName", label: "testLabel", type: "groupable", role: "category" });
				const oMockChange = { mutation: "insert", child: oMockItem };
				if (!this.oMDCChart.getAggregation("_breadcrumbs")) {
					this.oMDCChart.setAggregation("_breadcrumbs", new Breadcrumbs(this.oMDCChart.getId() + "--breadcrumbs"));
				}

				this.oMDCChart.addItem(new Item({ propertyKey: "testName1", label: "testLabel1", type: "groupable", role: "category" }));
				this.oMDCChart.addItem(new Item({ propertyKey: "testName2", label: "testLabel2", type: "aggregatable", role: "category" }));
				this.oMDCChart.addItem(oMockItem);

				const oInsertItemSpy = sinon.spy(this.oMDCChart.getControlDelegate(), "insertItemToInnerChart");

				//Act
				this.oMDCChart._propagateItemChangeToInnerChart(oMockChange);

				//Assert
				assert.ok(oInsertItemSpy.calledWithExactly(this.oMDCChart, oMockItem, 1), "Item was inserted with correct index");
				done();
			}.bind(this));

		});

		QUnit.test("setNoDataText", function (assert) {
			const done = assert.async();

			this.oMDCChart.initialized().then(function () {
				const delegateSpy = sinon.spy(this.oMDCChart.getControlDelegate(), "setNoDataText");

				this.oMDCChart.setNoDataText("Test Text 12345");
				assert.ok(delegateSpy.calledOnce, "setNoDataText was called on delegate");
				assert.equal(this.oMDCChart.getNoDataText(), "Test Text 12345", "No data text was updated");

				done();
			}.bind(this));
		});

		QUnit.test("setNoData", function (assert) {
			const done = assert.async();

			this.oMDCChart.initialized().then(function () {
				const delegateSpy = sinon.spy(this.oMDCChart.getControlDelegate(), "changedNoDataStruct");

				this.oMDCChart.setNoData(new IllustratedMessage({ title: "ABCDEFG" }));
				assert.ok(delegateSpy.calledOnce, "changedNoDataStruct was called on delegate");
				assert.equal(this.oMDCChart.getNoData().getTitle(), "ABCDEFG", "No data message was updated");

				done();
			}.bind(this));
		});

		/**
		 * Not implemented yet
		 */
		QUnit.test("setP13nMode", function (assert) {

			const done = assert.async();

			this.oMDCChart.initialized().then(function () {

				//1
				let aMode = ['Item', 'Sort', 'Type', 'Filter'];
				const _updateAdaptationStub = sinon.stub(this.oMDCChart, "_updateAdaptation");
				const aModeSorted = ['Item', 'Sort', 'Filter', 'Type'];
				const setPropertySpy = sinon.spy(this.oMDCChart, "setProperty");

				this.oMDCChart.setP13nMode(aMode);

				assert.ok(setPropertySpy.calledWith("p13nMode", aModeSorted, true), "P13nMode property correctly set");
				assert.ok(_updateAdaptationStub.calledWith(aModeSorted), "_updateAdaption called with P13nMode parameters correctly");

				//2
				aMode = ['Item'];

				this.oMDCChart.setP13nMode(aMode);

				assert.ok(setPropertySpy.calledWith("p13nMode", aMode, true), "P13nMode property correctly set");
				assert.ok(_updateAdaptationStub.calledWith(aMode), "_updateAdaption called with P13nMode parameters correctly");

				done();
			}.bind(this));
		});

		QUnit.test("_updateAdaption", function (assert) {
			const done = assert.async();

			this.oMDCChart.initialized().then(function () {

				const aMode = ['Item', 'Sort', 'Type', 'Filter'];
				sinon.spy(this.oMDCChart.getEngine(), "register");

				this.oMDCChart._updateAdaptation(aMode);

				assert.equal(this.oMDCChart.getEngine().register.getCall(0).args.length, 2, "register correctly called");

				done();
			}.bind(this));
		});

		QUnit.test("isFilteringEnabled", function (assert) {
			const done = assert.async();

			this.oMDCChart.initialized().then(function () {

				const aMode = ['Item', 'Sort', 'Type', 'Filter'];

				this.oMDCChart.setP13nMode(aMode);

				assert.equal(this.oMDCChart.isFilteringEnabled(), true, "filtering correctly enabled");

				aMode.pop(); //remove filters

				this.oMDCChart.setP13nMode(aMode);

				assert.equal(this.oMDCChart.isFilteringEnabled(), false, "filtering correctly disabled");

				done();
			}.bind(this));
		});

		QUnit.test("setFilterConditions", function (assert) {
			const done = assert.async();

			this.oMDCChart.initialized().then(function () {

				const mConditions = {};
				const setPropertySpy = sinon.spy(this.oMDCChart, "setProperty");
				const setFilterConditionsStub = sinon.stub();
				const getInbuiltFilterStub = sinon.stub(this.oMDCChart, "getInbuiltFilter").returns(
					{ setFilterConditions: setFilterConditionsStub }
				);
				const oUpdateInfoToolbarSpy = sinon.spy(this.oMDCChart, "_updateInfoToolbar");

				this.oMDCChart.setFilterConditions(mConditions);

				assert.ok(setPropertySpy.calledWith("filterConditions", mConditions, true), "filterConditions property correctly set");
				assert.ok(getInbuiltFilterStub.calledOnce, "getInbuiltFilter correctly called once");
				assert.ok(setFilterConditionsStub.calledWith(mConditions), "setFilterConditions correcly called with parameters");
				assert.ok(oUpdateInfoToolbarSpy.calledOnce, "_updateInfoToolbar function was called");

				done();
			}.bind(this));
		});

		QUnit.test("getConditions", function (assert) {
			const done = assert.async();

			this.oMDCChart.initialized().then(function () {
				const aConditions = [1, 2, 3];
				const getConditionsStub = sinon.stub().returns(aConditions);
				const getInbuiltFilterStub = sinon.stub(this.oMDCChart, "getInbuiltFilter").returns(
					{ getConditions: getConditionsStub }
				);

				let aCon = this.oMDCChart.getConditions();

				assert.equal(aCon, aConditions, "Conditions correctly returned");

				getInbuiltFilterStub.returns(undefined);

				aCon = this.oMDCChart.getConditions();

				assert.equal(aCon.length, 0, "No Conditions correctly returned");

				done();
			}.bind(this));
		});

		QUnit.test("_registerInnerFilter", function (assert) {
			const done = assert.async();

			this.oMDCChart.initialized().then(function () {

				const oFilter = { attachSearch: function () { } };
				const attachSearchSpy = sinon.spy(oFilter, "attachSearch");

				this.oMDCChart._registerInnerFilter(oFilter);


				assert.ok(attachSearchSpy.calledOnce, "attachSearch correctly called");
				done();
			}.bind(this));
		});

		QUnit.test("applySettings", function (assert) {
			const done = assert.async();

			this.oMDCChart.initialized().then(function () {

				const mSettings = {propertyInfo: [{ name: "name1", label: "name1", dataType: "String" }, { name: "name2", label: "name2", dataType: "String" }]};
				const oScope = {};

				function isPromise(p) {
					return p && Object.prototype.toString.call(p) === "[object Promise]";
				}

				// var _loadDelegateSpy = sinon.spy(this.oMDCChart, "_loadDelegate");
				const isFilteringEnabledStub = sinon.stub(this.oMDCChart, "isFilteringEnabled").returns(true);
				const retrieveInbuiltFilterSpy = sinon.spy(this.oMDCChart, "retrieveInbuiltFilter");

				this.oMDCChart.applySettings(mSettings, oScope);

				assert.ok(isPromise(this.oMDCChart.initializedPromise), "initializedPromise correctly created");
				assert.ok(isPromise(this.oMDCChart.innerChartBoundPromise), "innerChartBoundPromise correctly created");
				// assert.ok(_loadDelegateSpy.calledOnce, "_loadDelegat correctly called");
				assert.ok(isFilteringEnabledStub.calledOnce, "isFilteringEnabled correctly called");
				assert.ok(retrieveInbuiltFilterSpy.calledOnce, "retrieveInbuiltFilter correctly called");

				done();
			}.bind(this));
		});

		QUnit.test("_initInnerControls", function (assert) {
			assert.ok(true);
		});

		QUnit.test("_createBreadcrumbs", function (assert) {
			const oMockDelegate = { getDrillableItems: function () { return []; } };
			const _getControlDelegateStub = sinon.stub(this.oMDCChart, "getControlDelegate").returns(oMockDelegate);
			if (this.oMDCChart.getAggregation("_breadcrumbs")) {
				this.oMDCChart.getAggregation("_breadcrumbs").destroy();
				this.oMDCChart.setAggregation("_breadcrumbs", null);
			}

			this.oMDCChart._createBreadcrumbs();

			assert.ok(this.oMDCChart.getAggregation("_breadcrumbs"));
			_getControlDelegateStub.restore();
		});

		QUnit.test("getAdaptionUI", function (assert) {
			const oMockDelegate = { getAdaptionUI: function () { return "Test"; } };
			const _getControlDelegateStub = sinon.stub(this.oMDCChart, "getControlDelegate").returns(oMockDelegate);
			const oDelegateSpy = sinon.spy(oMockDelegate, "getAdaptionUI");

			const sResult = this.oMDCChart.getAdaptationUI();

			assert.equal(sResult, "Test", "Correct result returned");
			assert.ok(oDelegateSpy.calledOnce, "Function was called on delegate");

			_getControlDelegateStub.restore();
		});

		QUnit.test("_addItems", function (assert) {
			assert.ok(true);
		});

		QUnit.test("initialized", function (assert) {
			assert.ok(true);
		});

		QUnit.test("innerChartBound", function (assert) {
			const done = assert.async();
			const oMockDelegate = { checkAndUpdateMDCItems: function () { return Promise.resolve(); }, createInnerChartContent: function () { return Promise.resolve(); }, getDrillableItems: function () { return []; } };
			const _getControlDelegateStub = sinon.stub(this.oMDCChart, "getControlDelegate").returns(oMockDelegate);
			// this.oMDCChart.getControlDelegate = function () { return oMockDelegate; };
			this.oMDCChart._propagatePropertiesToInnerChart = function () { }; //Mock this as it requires an inner chart (which we don't want to test in this case)

			this.oMDCChart._createContentfromPropertyInfos();

			this.oMDCChart.innerChartBound().then(function () {
				assert.ok(true, "Promise was resolved during _createContentfromPropertyInfos");

				_getControlDelegateStub.restore();
				done();
			});
		});

		QUnit.test("getSelectionHandler", function (assert) {
			const done = assert.async();
			this.oMDCChart.initialized().then(function () {

				const getInnerChartSelectionHandlerSpy = sinon.spy(this.oMDCChart.getControlDelegate(), "getInnerChartSelectionHandler");

				this.oMDCChart.getSelectionHandler();


				assert.ok(getInnerChartSelectionHandlerSpy.calledOnce, "getInnerChartSelectionHandler correctly called");
				assert.ok(getInnerChartSelectionHandlerSpy.calledWith(this.oMDCChart), "getInnerChartSelectionHandler params correctly passed");
				done();
			}.bind(this));
		});

		QUnit.test("getChartTypeLayoutConfig", function (assert) {
			const oMockDelegate = { getChartTypeLayoutConfig: function () { return "Test"; } };
			const _getControlDelegateStub = sinon.stub(this.oMDCChart, "getControlDelegate").returns(oMockDelegate);
			// this.oMDCChart.getControlDelegate = function () { return oMockDelegate; };
			const oDelegateSpy = sinon.spy(oMockDelegate, "getChartTypeLayoutConfig");

			const sResult = this.oMDCChart.getChartTypeLayoutConfig();

			assert.equal(sResult, "Test", "Correct result returned");
			assert.ok(oDelegateSpy.calledOnce, "Function was called on delegate");

			_getControlDelegateStub.restore();
		});

		QUnit.test("getAllowedRolesForKinds", function (assert) {
			const oMockDelegate = { getAllowedRolesForKinds: function () { return "Test"; } };
			const _getControlDelegateStub = sinon.stub(this.oMDCChart, "getControlDelegate").returns(oMockDelegate);
			// this.oMDCChart.getControlDelegate = function () { return oMockDelegate; };
			const oDelegateSpy = sinon.spy(oMockDelegate, "getAllowedRolesForKinds");

			const sResult = this.oMDCChart.getAllowedRolesForKinds();

			assert.equal(sResult, "Test", "Correct result returned");
			assert.ok(oDelegateSpy.calledOnce, "Function was called on delegate");

			_getControlDelegateStub.restore();
		});

		// QUnit.test("destroy", function (assert) {
		// 	var done = assert.async();
		// 	this.oMDCChart.initialized().then(function () {

		// 		this.oMDCChart.destroy();

		// 		assert.ok(this.oMDCChart._bIsDestroyed, "isDestroyed flag correctly set");
		// 		done();
		// 	}.bind(this));
		// });

		QUnit.test("_showDrillDown", function (assert) {
			assert.ok(true);
		});

		QUnit.test("getManagedObjectModel", function (assert) {
			const done = assert.async();
			this.oMDCChart.initialized().then(function(){
				assert.equal(this.oMDCChart.getManagedObjectModel(), this.oMDCChart._oManagedObjectModel, "ManagedObjectModel of chart was returned");
				done();
			}.bind(this));
		});

		QUnit.test("_innerChartDataLoadComplete", function (assert) {
			const done = assert.async();
			this.oMDCChart.initialized().then(function(){

				//Arrange
				const oMockDelegate = { requestToolbarUpdate: function () { return; }, getInnerChart: function () { return; } };
				const _getControlDelegateStub = sinon.stub(this.oMDCChart, "getControlDelegate").returns(oMockDelegate);
				// this.oMDCChart.getControlDelegate = function () { return oMockDelegate; };
				const setBusySpy = sinon.spy(this.oMDCChart, "setBusy");
				const _checkStyleClassesForDimensionsSpy = sinon.spy(this.oMDCChart, "_checkStyleClassesForDimensions");
				const _renderOverlaySpy = sinon.spy(this.oMDCChart, "_renderOverlay");
				const requestToolbarUpdateSpy = sinon.spy(this.oMDCChart.getControlDelegate(), "requestToolbarUpdate");

				//Act
				this.oMDCChart._innerChartDataLoadComplete({});

				//Assert
				assert.ok(setBusySpy.calledOnceWith(false), "SetBusy called");
				assert.ok(_checkStyleClassesForDimensionsSpy.calledOnce, "_checkStyleClassesForDimensionsSpy called");
				assert.ok(_renderOverlaySpy.calledOnceWith(false), "_renderOverlaySpy called");
				assert.ok(requestToolbarUpdateSpy.calledOnce, "requestToolbarUpdateSpy called");

				_getControlDelegateStub.restore();
				done();
			}.bind(this));

		});

		QUnit.test("_checkStyleClassesForDimensions w/o dimension", function (assert) {
			//Arrange
			this.oMDCChart.removeAllItems([]);
			this.oMDCChart.addStyleClass("sapUiMDCChartGrid");

			const addStyleClassSpy = sinon.spy(this.oMDCChart, "addStyleClass");
			const removeStyleClassSpy = sinon.spy(this.oMDCChart, "removeStyleClass");

			//Act
			this.oMDCChart._checkStyleClassesForDimensions();

			//Assert
			assert.ok(addStyleClassSpy.calledOnceWith("sapUiMDCChartGridNoBreadcrumbs"), "sapUiMDCChartGridNoBreadcrumbs added");
			assert.ok(removeStyleClassSpy.calledOnceWith("sapUiMDCChartGrid"), "sapUiMDCChartGrid removed");
			assert.ok(this.oMDCChart.hasStyleClass("sapUiMDCChartGridNoBreadcrumbs"), "Styleclass in DOM");
			assert.ok(!this.oMDCChart.hasStyleClass("sapUiMDCChartGrid"), "Styleclass not in DOM");
		});

		QUnit.test("_checkStyleClassesForDimensions with dimension after removal", function (assert) {
			//Arrange
			if (!this.oMDCChart.getAggregation("_breadcrumbs")) {
				this.oMDCChart.setAggregation("_breadcrumbs", new Breadcrumbs(this.oMDCChart.getId() + "--breadcrumbs"));
			}

			this.oMDCChart.removeAllItems();
			this.oMDCChart.addStyleClass("sapUiMDCChartGrid");
			this.oMDCChart._checkStyleClassesForDimensions();
			this.oMDCChart.addItem(new Item({ propertyKey: "Test1", type: "groupable" }));
			if (!this.oMDCChart.getAggregation("_breadcrumbs").getVisible()) { // as on insert item it is reset
				this.oMDCChart.getAggregation("_breadcrumbs").setVisible(true);
			}

			const addStyleClassSpy = sinon.spy(this.oMDCChart, "addStyleClass");
			const removeStyleClassSpy = sinon.spy(this.oMDCChart, "removeStyleClass");

			//Act
			this.oMDCChart._checkStyleClassesForDimensions();

			//Assert
			assert.ok(addStyleClassSpy.calledOnceWith("sapUiMDCChartGrid"), "sapUiMDCChartGrid added");
			assert.ok(removeStyleClassSpy.calledOnceWith("sapUiMDCChartGridNoBreadcrumbs"), "sapUiMDCChartGridNoBreadcrumbs removed");
			assert.ok(this.oMDCChart.hasStyleClass("sapUiMDCChartGrid"), "Styleclass in DOM");
			assert.ok(!this.oMDCChart.hasStyleClass("sapUiMDCChartGridNoBreadcrumbs"), "Styleclass not in DOM");
		});

		QUnit.test("_getSortedProperties", function (assert) {
			this.oMDCChart.setSortConditions({ sorters: "ABC" });
			assert.equal(this.oMDCChart._getSortedProperties(), "ABC", "Should return sorters form sortConditions");

			this.oMDCChart.setSortConditions();
			assert.equal(this.oMDCChart._getSortedProperties().length, 0, "Should return empty array");
		});

		QUnit.test("_getTypeBtnActive", function (assert) {
			this.oMDCChart.setP13nMode(["Type"]);
			assert.ok(this.oMDCChart._getTypeBtnActive(), "Button is set active");

			this.oMDCChart.setP13nMode(["Item"]);
			assert.ok(!this.oMDCChart._getTypeBtnActive(), "Button is set inactive");
		});

		QUnit.test("_onFiltersChanged", function (assert) {
			const oMockDelegate = { getInnerChartBound: function () { return true; } };
			const _getControlDelegateStub = sinon.stub(this.oMDCChart, "getControlDelegate").returns(oMockDelegate);
			// this.oMDCChart.getControlDelegate = function () { return oMockDelegate; };
			this.oMDCChart._renderOverlay = function () { };
			const oOverlaySpy = sinon.spy(this.oMDCChart, "_renderOverlay");
			this.oMDCChart._bInnerChartReady = true;

			this.oMDCChart._onFiltersChanged({ getParameter: function () { return true; } });

			assert.ok(oOverlaySpy.calledOnce, "Overlay function was called");

			_getControlDelegateStub.restore();
		});

		QUnit.test("_onFiltersChanged with invalid event", function (assert) {
			const oMockDelegate = { getInnerChartBound: function () { return true; } };
			const _getControlDelegateStub = sinon.stub(this.oMDCChart, "getControlDelegate").returns(oMockDelegate);
			// this.oMDCChart.getControlDelegate = function () { return oMockDelegate; };
			this.oMDCChart._renderOverlay = function () { };
			const oOverlaySpy = sinon.spy(this.oMDCChart, "_renderOverlay");
			this.oMDCChart._bInnerChartReady = true;

			this.oMDCChart._onFiltersChanged({ getParameter: function () { return false; } });

			assert.ok(!oOverlaySpy.called, "Overlay function was not called");

			_getControlDelegateStub.restore();
		});

		QUnit.test("_onFiltersChanged with unbound chart", function (assert) {
			const oMockDelegate = { getInnerChartBound: function () { return false; } };
			const _getControlDelegateStub = sinon.stub(this.oMDCChart, "getControlDelegate").returns(oMockDelegate);
			// this.oMDCChart.getControlDelegate = function () { return oMockDelegate; };
			this.oMDCChart._renderOverlay = function () { };
			const oOverlaySpy = sinon.spy(this.oMDCChart, "_renderOverlay");
			this.oMDCChart._bInnerChartReady = true;

			this.oMDCChart._onFiltersChanged({ getParameter: function () { return true; } });

			assert.ok(!oOverlaySpy.called, "Overlay function was not called");

			_getControlDelegateStub.restore();
		});

		QUnit.test("_initInfoToolbar", function (assert) {
			const done = assert.async();

			this.oMDCChart.initialized().then(function () {
				this.oMDCChart.setAggregation("_infoToolbar", null);
				const oAttributeSpy = sinon.spy(this.oMDCChart.getDomRef(), "setAttribute");

				this.oMDCChart._initInfoToolbar();

				assert.ok(this.oMDCChart.getAggregation("_infoToolbar"), "Toolbar was created");
				assert.ok(oAttributeSpy.calledOnce, "Aria label setter was called on dom-ref");
				assert.equal(this.oMDCChart.getDomRef().getAttribute("aria-labelledby"), this.oMDCChart.getAggregation("_infoToolbar").getACCTextId(), "ACC text was corrected connected via aria-labelledby");
				done();
			}.bind(this));

		});

		QUnit.test("_updateInfoToolbar function", function (assert) {
			const done = assert.async();

			this.oMDCChart.initialized().then(function () {
				this.oMDCChart.setP13nMode(["Filter"]);
				this.oMDCChart._initInfoToolbar();
				const oToolbarSpy = sinon.spy(this.oMDCChart.getAggregation("_infoToolbar"), "setInfoText");
				const sMockLabel = "ABC";
				const oConditionsStub = sinon.stub(this.oMDCChart, "_getFilterInfoText").returns(sMockLabel);

				this.oMDCChart._updateInfoToolbar();

				assert.ok(oToolbarSpy.calledOnceWith(sMockLabel), "Toolbar text was updated");

				oConditionsStub.restore();

				done();
			}.bind(this));
		});

		QUnit.module("sap.ui.mdc.Chart: Toolbar Actions", {

			beforeEach: async function () {
				const TestComponent = UIComponent.extend("test", {
					metadata: {
						manifest: {
							"sap.app": {
								"id": "",
								"type": "application"
							}
						}
					},
					createContent: function () {

						return new Chart({
							delegate: {
								name: sDelegatePath,
								payload: {
									collectionPath: "/testPath"
								}
							},
							actions: [new ActionToolbarAction({
								action: new Button("testButton", { text: "testButtonText" }),
								layoutInformation: { aggregationName: "end", alignment: Alignment.End }
							})]
						});
					}
				});
				this.oUiComponent = new TestComponent();
				this.oUiComponentContainer = new ComponentContainer({
					component: this.oUiComponent,
					async: false
				});
				this.oMDCChart = this.oUiComponent.getRootControl();

				this.oUiComponentContainer.placeAt("qunit-fixture");
				await nextUIUpdate();
			},
			afterEach: function () {
				this.oUiComponentContainer.destroy();
				this.oUiComponent.destroy();
			}

		});

		QUnit.test("MDC Chart Initial Action is added to toolbar with the correct layout", function (assert) {
			const done = assert.async();

			this.oMDCChart.initialized().then(function () {

				assert.ok(this.oMDCChart.getAggregation("_toolbar"), "Toolbar exists");
				assert.equal(this.oMDCChart.getAggregation("_toolbar").getActions().length, 1, "Toolbar has correct amount of actions in actions aggregation");
				assert.equal(this.oMDCChart.getAggregation("_toolbar").getActions()[0].getAction().getText(), "testButtonText", "Action from constructor property is correctly aligned");

				done();
			}.bind(this));
		});

		QUnit.test("setHeaderStyle", function (assert) {
			const done = assert.async();

			this.oMDCChart.initialized().then(function () {

				const spy = sinon.spy(this.oMDCChart, "_updateVariantManagementStyle");

				assert.ok(this.oMDCChart.setHeaderStyle(TitleLevel.H3));

				assert.ok(spy.calledOnce, "_updateVariantManagementStyle called on toolbar");
				assert.equal(this.oMDCChart._oTitle.getTitleStyle(), TitleLevel.H3, "Style set on title");

				done();
			}.bind(this));
		});

		QUnit.test("setHeaderLevel", function (assert) {
			const done = assert.async();

			this.oMDCChart.initialized().then(function () {

				const spy = sinon.spy(this.oMDCChart, "_updateVariantManagementStyle");

				assert.ok(this.oMDCChart.setHeaderLevel(TitleLevel.H3));

				assert.ok(spy.calledOnce, "_updateVariantManagementStyle called on toolbar");
				assert.equal(this.oMDCChart._oTitle.getLevel(), TitleLevel.H3, "Level set on title");

				done();
			}.bind(this));
		});

		QUnit.test("setHeaderVisible", function (assert) {
			const done = assert.async();

			this.oMDCChart.initialized().then(function () {

				const spy = sinon.spy(this.oMDCChart, "_updateVariantManagementStyle");
				assert.ok(this.oMDCChart.getHeaderVisible(), "Header is set to visible initially");
				assert.ok(this.oMDCChart._oTitle.getVisible(), "Title is set to visible initially");

				this.oMDCChart.setHeaderVisible(false);
				assert.ok(spy.calledOnce, "Function _updateVariantManagementStyle was called");
				assert.notOk(this.oMDCChart._oTitle.getVisible(), "Title is set to not visible");

				this.oMDCChart.setHeaderVisible(true);
				assert.ok(spy.calledTwice, "Function _updateVariantManagementStyle was called");
				assert.ok(this.oMDCChart._oTitle.getVisible(), "Title is set to visible");

				done();

			}.bind(this));
		});

		QUnit.test("setVariant", function (assert) {
			const done = assert.async();

			this.oMDCChart.initialized().then(function () {
				const oToolbarSpy = sinon.spy(this.oMDCChart.getAggregation("_toolbar"), "addBetween");

				this.oMDCChart.setVariant(new VM());

				assert.ok(oToolbarSpy.called, "Function was called on toolbar");
				done();

			}.bind(this));
		});



		QUnit.module("Theming", {
			before: function() {
				this.sDefaultTheme = Theming.getTheme();
			},
			beforeEach: async function () {
				const TestComponent = UIComponent.extend("test", {
					metadata: {
						manifest: {
							"sap.app": {
								"id": "",
								"type": "application"
							}
						}
					},
					createContent: function () {
						return new Chart({
							autoBindOnInit: false,
							delegate: {
								name: sDelegatePath,
								payload: {
									collectionPath: "/testPath"
								}
							},
							propertyInfo: [{ name: "name1", label: "name1", dataType: "String" }, { name: "name2", label: "name2", dataType: "String" }]
						});
					}
				});
				this.oUiComponent = new TestComponent();
				this.oUiComponentContainer = new ComponentContainer({
					component: this.oUiComponent,
					async: false
				});
				this.oMDCChart = this.oUiComponent.getRootControl();

				this.oUiComponentContainer.placeAt("qunit-fixture");
				await nextUIUpdate();
			},
			afterEach: function () {
				this.oUiComponentContainer.destroy();
				this.oUiComponent.destroy();
			},
			after: async function() {
				await this.applyTheme(this.sDefaultTheme);
			},
			applyTheme: async function(sTheme) {
				const oThemeApplied = new Deferred();
				const fnThemeApplied = function() {
					Theming.detachApplied(fnThemeApplied);
					oThemeApplied.resolve();
				};
				Theming.setTheme(sTheme);
				Theming.attachApplied(fnThemeApplied);
				await oThemeApplied.promise;
			}
		});
		for (const sTheme of [
			"sap_horizon",
			"sap_horizon_dark",
			"sap_horizon_hcb",
			"sap_horizon_hcw",
			"sap_fiori_3"
		]) {

			QUnit.test(sTheme + "; Toolbar", async function(assert) {
				let sExpectedDesigntype;
				switch (sTheme) {
					case "sap_horizon":
					case "sap_horizon_dark":
					case "sap_horizon_hcw":
					case "sap_horizon_hcb":
						sExpectedDesigntype = "Solid";
						break;
					default:
						sExpectedDesigntype = "Transparent";
				}
				await this.applyTheme(sTheme);
				assert.deepEqual(this.oMDCChart._getToolbar().getDesign(), sExpectedDesigntype, "design property");
			});
		}
	});
