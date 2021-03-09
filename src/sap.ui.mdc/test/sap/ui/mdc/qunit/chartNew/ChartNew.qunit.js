/* global QUnit */

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

    //var sDelegatePath = "test-resources/sap/ui/mdc/delegates/ChartDelegateNew";

	QUnit.module("sap.ui.mdc.Chart: Simple Properties", {
		/*
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
		*/
    });

	QUnit.test("Test exists", function(assert) {
		assert.ok(true);
	});

	/*
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

	QUnit.test("zoomIn", function(assert){
		var done = assert.async();

		this.oMDCChart.initialized().then(function(){
			var zoomInSpy = sinon.spy(this.oMDCChart.getControlDelegate(), "zoomIn");

			this.oMDCChart.zoomIn();
			assert.ok(zoomInSpy.calledOnce, "Zoom in was called on delegate");
			done();
		}.bind(this));
	});

	QUnit.test("zoomOut", function(assert){
		var done = assert.async();

		this.oMDCChart.initialized().then(function(){
			var zoomOutSpy = sinon.spy(this.oMDCChart.getControlDelegate(), "zoomOut");

			this.oMDCChart.zoomOut();
			assert.ok(zoomOutSpy.calledOnce, "Zoom out was called on delegate");
			done();
		}.bind(this));
	});

	QUnit.test("zoomStatus", function(assert){
		var done = assert.async();

		this.oMDCChart.initialized().then(function(){
			var zoomSpy = sinon.spy(this.oMDCChart.getControlDelegate(), "getZoomState");

			this.oMDCChart.getZoomState();
			assert.ok(zoomSpy.calledOnce, "Zoom status was called on delegate");
			done();
		}.bind(this));
	});

	QUnit.test("legend Visibility state", function(assert){
		var done = assert.async();

		this.oMDCChart.initialized().then(function(){
			var legendSpy = sinon.spy(this.oMDCChart.getControlDelegate(), "setLegendVisible");
			assert.ok(this.oMDCChart.getLegendVisible() == true, "Property is in iunitial state");

			this.oMDCChart.setLegendVisible(false);
			assert.ok(legendSpy.calledOnce, "setLegendVisible was called on delegate");
			assert.ok(this.oMDCChart.getLegendVisible() == false, "Property was updated");
			done();

		}.bind(this));
	});

	QUnit.test("showChartTooltip property", function(assert){
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
	*/

});