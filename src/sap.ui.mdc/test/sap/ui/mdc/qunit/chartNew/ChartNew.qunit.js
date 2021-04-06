/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/mdc/ChartNew",
	"sap/ui/mdc/chartNew/ItemNew",
	"sap/ui/core/UIComponent",
	"sap/ui/core/ComponentContainer",
    "sap/ui/core/library",
    "sap/chart/Chart"
],
function(
	Core,
	Chart,
	Item,
	UIComponent,
	ComponentContainer,
    CoreLibrary,
    InnerChart
) {
    "use strict";

    var sDelegatePath = "test-resources/sap/ui/mdc/delegates/ChartDelegateNew";

	QUnit.module("sap.ui.mdc.Chart: Simple Properties", {

		beforeEach: function() {
			var TestComponent = UIComponent.extend("test", {
				metadata: {
					manifest: {
						"sap.app": {
							"id": "",
							"type": "application"
						}
					}
				},
				createContent: function() {
					return new Chart("IDChart", {delegate: {
                        name: sDelegatePath,
					    payload: {
						collectionPath: "/testPath"
					}
                    }});
				}
			});
			this.oUiComponent = new TestComponent("IDComponent");
			this.oUiComponentContainer = new ComponentContainer({
				component: this.oUiComponent,
				async: false
			});
            this.oMDCChart = this.oUiComponent.getRootControl();

			this.oUiComponentContainer.placeAt("qunit-fixture");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oUiComponentContainer.destroy();
			this.oUiComponent.destroy();
		}

    });

	QUnit.test("Test exists", function(assert) {
		assert.ok(true);
	});


	QUnit.test("Instantiate", function(assert) {
		assert.ok(this.oMDCChart);
		assert.ok(this.oMDCChart.isA("sap.ui.mdc.IxState"));

    });

	QUnit.test("MDC Chart init", function(assert) {
		var done = assert.async();

		this.oMDCChart.initialized().then(function() {
			assert.ok(this.oMDCChart, "The chart is created");

			done();
		}.bind(this));

	});

	QUnit.test("MDC Chart _loadDelegate", function(assert) {
		var done = assert.async();

		this.oMDCChart._loadDelegate().then(function(oDelegate){
			assert.ok(oDelegate, "Delegate loaded");
			done();
		});
	});

	QUnit.test("MDC Chart rebind", function(assert){
		var done = assert.async();

		this.oMDCChart.initialized().then(function(){
			assert.ok(this.oMDCChart.getControlDelegate(), "Control delegate is initialized");
			this.oMDCChart.getControlDelegate().setInnerChartBoundTest(true); //Mock value for inner chart bound

			var getBindingInfoSpy = sinon.spy(this.oMDCChart.getControlDelegate(), "_getBindingInfo");
			var updateBindingInfoSpy = sinon.spy(this.oMDCChart.getControlDelegate(), "updateBindingInfo");
			var rebindChartSpy = sinon.spy(this.oMDCChart.getControlDelegate(), "rebindChart");
			var updateToolbarSpy = sinon.spy(this.oMDCChart, "_updateToolbar");

			this.oMDCChart.rebind();

			assert.ok(this.oMDCChart.getBusy(), "MDC Chart is set busy");
			assert.ok(getBindingInfoSpy.calledOnce, "getBindingInfo called on delegate");
			assert.ok(updateBindingInfoSpy.calledOnce, "updateBindingInfo called on delegate");
			assert.ok(rebindChartSpy.calledOnce, "rebindChart called on delegate");
			assert.ok(updateToolbarSpy.calledOnce, "_updateToolbar called");

			done();
		}.bind(this));
	});

	QUnit.test("MDC Chart _createToolbar", function(assert){
		var done = assert.async();

		this.oMDCChart.initialized().then(function(){
			this.oMDCChart.getAggregation("_toolbar").destroy();
			this.oMDCChart.setAggregation("_toolbar", undefined);
			assert.ok(this.oMDCChart.getAggregation("_toolbar") == undefined, "Toolbar aggregation is empty");

			this.oMDCChart._createToolbar();
			assert.ok(this.oMDCChart.getAggregation("_toolbar"), "Toolbar was created");
			assert.ok(this.oMDCChart.getAggregation("_toolbar").getMetadata().getName() == "sap.ui.mdc.chartNew.ChartToolbarNew", "Toolbar is instance of sap.ui.mdc.chartNew.ChartToolbarNew");

			done();

		}.bind(this));
	});

	QUnit.test("MDC Chart _updateToolbar", function(assert){
		var done = assert.async();

		this.oMDCChart.initialized().then(function(){
			var toolbarSpy = sinon.spy(this.oMDCChart.getAggregation("_toolbar"), "updateToolbar");

			this.oMDCChart._updateToolbar();
			assert.ok(toolbarSpy.calledOnce, "_updateToolbar was called on toolbar");

			done();

		}.bind(this));
	});

	QUnit.test("MDC Chart _getInnerChart", function(assert){
		var done = assert.async();

		this.oMDCChart.initialized().then(function(){
			var delegateSpy = sinon.spy(this.oMDCChart.getControlDelegate(), "getInnerChart");

			this.oMDCChart._getInnerChart();
			assert.ok(delegateSpy.calledOnce, "getInnerChart was called on innerChart");

			done();

		}.bind(this));
	});

	QUnit.test("MDC Chart zoomIn", function(assert){
		var done = assert.async();

		this.oMDCChart.initialized().then(function(){
			var zoomInSpy = sinon.spy(this.oMDCChart.getControlDelegate(), "zoomIn");

			this.oMDCChart.zoomIn();
			assert.ok(zoomInSpy.calledOnce, "Zoom in was called on delegate");
			done();
		}.bind(this));
	});

	QUnit.test("MDC Chart zoomOut", function(assert){
		var done = assert.async();

		this.oMDCChart.initialized().then(function(){
			var zoomOutSpy = sinon.spy(this.oMDCChart.getControlDelegate(), "zoomOut");

			this.oMDCChart.zoomOut();
			assert.ok(zoomOutSpy.calledOnce, "Zoom out was called on delegate");
			done();
		}.bind(this));
	});

	QUnit.test("MDC Chart getZoomState", function(assert){
		var done = assert.async();

		this.oMDCChart.initialized().then(function(){
			var zoomSpy = sinon.spy(this.oMDCChart.getControlDelegate(), "getZoomState");

			this.oMDCChart.getZoomState();
			assert.ok(zoomSpy.calledOnce, "Zoom status was called on delegate");
			done();
		}.bind(this));
	});

	QUnit.test("MDC Chart setLegendVisible", function(assert){
		var done = assert.async();

		this.oMDCChart.initialized().then(function(){
			var legendSpy = sinon.spy(this.oMDCChart.getControlDelegate(), "setLegendVisible");
			assert.ok(this.oMDCChart.getLegendVisible() == true, "Property is in initial state");

			this.oMDCChart.setLegendVisible(false);
			assert.ok(legendSpy.calledOnce, "setLegendVisible was called on delegate");
			assert.ok(this.oMDCChart.getLegendVisible() == false, "Property was updated");
			done();

		}.bind(this));
	});

	QUnit.test("MDC Chart showChartTooltip", function(assert){
		var done = assert.async();

		this.oMDCChart.initialized().then(function(){
			assert.ok(this.oMDCChart.getShowChartTooltip(), "Initial value of property is true");
			var tooltipSpy = sinon.spy(this.oMDCChart.getControlDelegate(), "setChartTooltipVisibility");

			this.oMDCChart.setShowChartTooltip(false);
			assert.ok(tooltipSpy.calledOnce, "delegate function was called");
			assert.ok(!this.oMDCChart.getShowChartTooltip(), "Property was set");

			done();
		}.bind(this));
	});

	QUnit.test("MDC Chart _propagatePropertiesToInnerChart", function(assert){
		var done = assert.async();

		this.oMDCChart.initialized().then(function(){
			var legendSpy = sinon.spy(this.oMDCChart, "setLegendVisible");
			var tooltipSpy = sinon.spy(this.oMDCChart, "setShowChartTooltip");
			var typeSpy = sinon.spy(this.oMDCChart, "setChartType");

			this.oMDCChart._propagatePropertiesToInnerChart();
			assert.ok(legendSpy.calledOnce, "setLegendVisible was called");
			assert.ok(tooltipSpy.calledOnce, "setShowChartTooltip was called");
			assert.ok(typeSpy.calledOnce, "setChartType was called");

			done();
		}.bind(this));
	});

	QUnit.test("MDC Chart getChartTypeInfo", function(assert){
		var done = assert.async();

		this.oMDCChart.initialized().then(function(){
			var delegateSpy = sinon.spy(this.oMDCChart.getControlDelegate(), "getChartTypeInfo");

			var info = this.oMDCChart.getChartTypeInfo();
			assert.ok(delegateSpy.calledOnce, "getChartTypeInfo was called on delegate");
			assert.ok(info, "charttypeinfo is present");

			done();
		}.bind(this));
	});

	QUnit.test("MDC Chart getAvailableChartTypes", function(assert){
		var done = assert.async();

		this.oMDCChart.initialized().then(function(){
			var delegateSpy = sinon.spy(this.oMDCChart.getControlDelegate(), "getAvailableChartTypes");

			this.oMDCChart.getAvailableChartTypes();
			assert.ok(delegateSpy.calledOnce, "getAvailableChartTypes was called on delegate");
			done();
		}.bind(this));
	});

	QUnit.test("MDC Chart setChartType", function(assert){
		var done = assert.async();

		this.oMDCChart.initialized().then(function(){
			var delegateSpy = sinon.spy(this.oMDCChart.getControlDelegate(), "setChartType");

			this.oMDCChart.setChartType();
			assert.ok(delegateSpy.calledOnce, "setChartType was called on delegate");
			done();
		}.bind(this));
	});

	QUnit.test("MDC Chart getCurrentState", function(assert){
		var done = assert.async();

		this.oMDCChart.initialized().then(function(){
			var oState = this.oMDCChart.getCurrentState();
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

	QUnit.test("MDC Chart _getVisibleProperties", function(assert){
		var done = assert.async();

		this.oMDCChart.initialized().then(function(){
			var oMDCItem = new Item("testItem1", {name: "testName", role: "testRole"});
			this.oMDCChart.insertItem(oMDCItem, 0);

			var aVisibleItems = this.oMDCChart._getVisibleProperties();
			assert.ok(aVisibleItems.length === 1, "Visible Properties contain 1 item");
			assert.ok(aVisibleItems[0].name === "testName", "Item has correct name");
			assert.ok(aVisibleItems[0].role === "testRole", "Item has correct role");

			done();
		}.bind(this));
	});

	QUnit.test("MDC Chart _getPropertyData", function(assert){
		var done = assert.async();

		this.oMDCChart.initialized().then(function(){
			var delegateSpy = sinon.spy(this.oMDCChart.getControlDelegate(), "fetchProperties");

			this.oMDCChart._getPropertyData();
			assert.ok(delegateSpy.calledOnce, "fetchProperties was called on delegate");

			this.oMDCChart._getPropertyData();
			assert.ok(delegateSpy.calledOnce, "fetchProperties was not called again on delegate");
			done();
		}.bind(this));
	});

	QUnit.test("MDC Chart _renderOverlay", function(assert){
		var done = assert.async();

		this.oMDCChart.initialized().then(function(){

			this.oMDCChart._renderOverlay(true);
			var oOverlay = this.oMDCChart.getControlDelegate().getInnerChart().$().find(".sapUiMdcChartOverlay");
			assert.ok(oOverlay, "Overlay was added to inner chart");

			this.oMDCChart._renderOverlay(false);
			oOverlay = this.oMDCChart.getControlDelegate().getInnerChart().$().find(".sapUiMdcChartOverlay");
			assert.ok(oOverlay, "Overlay was removed from inner chart");
			done();
		}.bind(this));
	});

});