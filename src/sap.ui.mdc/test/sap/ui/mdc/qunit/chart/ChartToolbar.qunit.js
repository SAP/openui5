/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/mdc/Chart",
	"sap/ui/mdc/chart/Item",
	"sap/ui/core/UIComponent",
	"sap/ui/core/ComponentContainer",
    "sap/ui/core/library",
    "sap/chart/Chart",
    "sap/m/Button",
	"sap/ui/fl/variants/VariantManagement"
],
function(
	nextUIUpdate,
	Chart,
	Item,
	UIComponent,
	ComponentContainer,
    CoreLibrary,
    InnerChart,
    Button,
	VariantManagement
) {
    "use strict";

    const sDelegatePath = "test-resources/sap/ui/mdc/delegates/ChartDelegate";

	QUnit.module("sap.ui.mdc.chart.ChartToolbar: Simple Properties", {

		beforeEach: async function() {
			const TestComponent = UIComponent.extend("test", {
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
			await nextUIUpdate();
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

	QUnit.test("Toolbar is instantiated and visible", function(assert){
		const done = assert.async();

		this.oMDCChart.initialized().then(function(){
            const oToolbar = this.oMDCChart._getToolbar();

            assert.ok(oToolbar, "Toolbar ins instantiated");
            assert.ok(oToolbar.getVisible(), "Toolbar is visible");
			done();
		}.bind(this));
	});

    QUnit.test("Actions are forwarded to toolbar", function(assert){
		const done = assert.async();

		this.oMDCChart.initialized().then(function(){
            const oToolbar = this.oMDCChart._getToolbar();
            assert.ok(oToolbar.getActions().length === 0, "No action is in toolbar");

            this.oMDCChart.addAction(new Button("TestButton"));
            assert.ok(oToolbar.getActions().length === 1, "Action is added to toolbar");

            this.oMDCChart.removeAllActions();
            assert.ok(oToolbar.getActions().length === 0, "Action is removed from toolbar");
			done();
		}.bind(this));
	});

	QUnit.test("Details button should be created", function(assert){
		const done = assert.async();

		this.oMDCChart.initialized().then(function(){
            const oToolbar = this.oMDCChart._getToolbar();
            assert.ok(oToolbar._oChartSelectionDetails, "Details button was created");
			assert.equal(oToolbar.getEnd()[0].getMetadata().getName(), "sap.ui.mdc.chart.ChartSelectionDetails", "Selection Details button was added to toolbar");
            done();
		}.bind(this));
	});


    QUnit.test("updateToolbar function", function(assert){
		const done = assert.async();

		this.oMDCChart.initialized().then(function(){
            const oToolbar = this.oMDCChart._getToolbar();
            assert.ok(oToolbar.getEnabled(), "Toolbar is enabled intially");
			assert.ok(oToolbar.getContent().length === 9, "Correct amount of toolbar items were added");
			const zoomSpy = sinon.spy(oToolbar, "toggleZoomButtons");
			const updateDetailsSpy = sinon.spy(oToolbar._oChartSelectionDetails, "attachSelectionHandler");

            oToolbar.updateToolbar(this.oMDCChart);
			assert.ok(zoomSpy.calledOnce, "toggleZoomButtons was called");
            assert.ok(oToolbar.getEnabled(), "Toolbar is enabled");
			assert.ok(updateDetailsSpy.called, "attachSelectionHandler was called");
            done();
		}.bind(this));
	});

    QUnit.test("_getZoomEnablement function", function(assert){
		const done = assert.async();

		this.oMDCChart.initialized().then(function(){
            const oToolbar = this.oMDCChart._getToolbar();
            const stub = sinon.stub(this.oMDCChart, "getZoomState");
            stub.onCall(0).returns({currentZoomLevel: 0, enabled: true});

            let oZoomObj = oToolbar._getZoomEnablement(this.oMDCChart);

            assert.ok(oZoomObj.enabled, "Zoom is set to enabled");
            assert.ok(!oZoomObj.enabledZoomOut, "Zoom Out is disabled");
            assert.ok(oZoomObj.enabledZoomIn, "Zoom In is enabled");

            stub.onCall(1).returns({currentZoomLevel: 1, enabled: true});
            oZoomObj = oToolbar._getZoomEnablement(this.oMDCChart);
            assert.ok(oZoomObj.enabled, "Zoom is set to enabled");
            assert.ok(!oZoomObj.enabledZoomIn, "Zoom In is enabled");
            assert.ok(oZoomObj.enabledZoomOut, "Zoom Out is disabled");

            stub.onCall(2).returns({currentZoomLevel: 0.5, enabled: true});
            oZoomObj = oToolbar._getZoomEnablement(this.oMDCChart);
            assert.ok(oZoomObj.enabled, "Zoom is set to enabled");
            assert.ok(oZoomObj.enabledZoomIn, "Zoom In is enabled");
            assert.ok(oZoomObj.enabledZoomOut, "Zoom Out is enabled");

            stub.onCall(3).returns({});
            oZoomObj = oToolbar._getZoomEnablement(this.oMDCChart);
            assert.ok(!oZoomObj.enabled, "Zoom is set to disabled");
            assert.ok(!oZoomObj.enabledZoomIn, "Zoom In is disabled");
            assert.ok(!oZoomObj.enabledZoomOut, "Zoom Out is disabled");

            done();
		}.bind(this));
	});

    QUnit.test("addVariantManagement function", function(assert){
		const done = assert.async();

		this.oMDCChart.initialized().then(function(){
            const oToolbar = this.oMDCChart._getToolbar();

			assert.ok(!oToolbar._oVariantManagement, "There should be no VM set by after default init");
			assert.equal(oToolbar.getBetween().length, 0, "No between actions on the ActionToolbar");

			let oVM = new VariantManagement("mgmnt", {"for": "IDChart"});
			oToolbar.addVariantManagement(oVM);
			assert.ok(oToolbar._oVariantManagement, "Variant management exist in toolbar");
			assert.equal(oToolbar.getBetween().length, 1, "Between Actions of Toolbar have 1 entry");
			assert.equal(oToolbar.getBetween()[0], oVM, "Action in between is variant management");
			assert.equal(oToolbar._getVariantReference(), oVM, "Variant reference was set correctly");

			oVM = new VariantManagement("mgmnt-2", {"for": "IDChart"});
			oToolbar.addVariantManagement(oVM);
			assert.ok(oToolbar._oVariantManagement, "Variant management exist in toolbar");
			assert.equal(oToolbar.getBetween().length, 1, "Between Actions of Toolbar have 1 entry");
			assert.equal(oToolbar.getBetween()[0], oVM, "Action in between is the new variant management");
			assert.equal(oToolbar._getVariantReference(), oVM, "Variant reference was set correctly");

            done();
		}.bind(this));
	});

	QUnit.test("_updateSelectionDetailsActions when details button is active", function(assert){
		const done = assert.async();

		this.oMDCChart.initialized().then(function(){
            const oToolbar = this.oMDCChart._getToolbar();
            assert.ok(oToolbar.__oChartSelectionDetails === undefined, "Details button was not created");
			const oDetailsActionsSpy = sinon.spy(this.oMDCChart, "getSelectionDetailsActions");

			oToolbar._updateSelectionDetailsActions(this.oMDCChart);
			assert.ok(oDetailsActionsSpy.calledOnce, "Details actions spy should not be called");

            done();
		}.bind(this));
	});

	QUnit.test("Header visibility", function(assert) {
		const done = assert.async();

		this.oMDCChart.initialized().then(function(){
			const oToolbar = this.oMDCChart._getToolbar();

			//Check initial title visibility
			assert.ok(oToolbar._oTitle.getVisible(), "Title is visible");

			oToolbar._setHeaderVisible(false);
			assert.notOk(oToolbar._oTitle.getVisible(), "Title is not visible");

			oToolbar._setHeaderVisible(true);
			assert.ok(oToolbar._oTitle.getVisible(), "Title is visible");

			done();
		}.bind(this));
	});

	QUnit.module("sap.ui.mdc.chart.ChartToolbar: No Details button", {

		beforeEach: async function() {
			const TestComponent = UIComponent.extend("test", {
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
					}},
					showSelectionDetails: false
				});
				}
			});
			this.oUiComponent = new TestComponent("IDComponent");
			this.oUiComponentContainer = new ComponentContainer({
				component: this.oUiComponent,
				async: false
			});
            this.oMDCChart = this.oUiComponent.getRootControl();

			this.oUiComponentContainer.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oUiComponentContainer.destroy();
			this.oUiComponent.destroy();
		}
    });

	QUnit.test("No Details button should be created", function(assert){
		const done = assert.async();

		this.oMDCChart.initialized().then(function(){
            const oToolbar = this.oMDCChart._getToolbar();
            assert.ok(oToolbar.__oChartSelectionDetails === undefined, "Details button was not created");
            done();
		}.bind(this));
	});

	QUnit.test("updateToolbar function when no details btn is shown", function(assert){
		const done = assert.async();

		this.oMDCChart.initialized().then(function(){
            const oToolbar = this.oMDCChart._getToolbar();
            assert.ok(oToolbar.getEnabled(), "Toolbar is enabled intially");
			assert.ok(oToolbar.getContent().length === 8, "Correct amount of toolbar items were added");
			const zoomSpy = sinon.spy(oToolbar, "toggleZoomButtons");

            oToolbar.updateToolbar(this.oMDCChart);
			assert.ok(zoomSpy.calledOnce, "toggleZoomButtons was called");
            assert.ok(oToolbar.getEnabled(), "Toolbar is enabled");
			assert.ok(oToolbar._oChartSelectionDetails === undefined, "No _oChartSelectionDetails exists");
            done();
		}.bind(this));
	});

	QUnit.test("_updateSelectionDetailsActions when no details button is active", function(assert){
		const done = assert.async();

		this.oMDCChart.initialized().then(function(){
            const oToolbar = this.oMDCChart._getToolbar();
            assert.ok(oToolbar.__oChartSelectionDetails === undefined, "Details button was not created");
			const oDetailsActionsSpy = sinon.spy(this.oMDCChart, "getSelectionDetailsActions");

			oToolbar._updateSelectionDetailsActions(this.oMDCChart);
			assert.ok(!oDetailsActionsSpy.called, "Details actions spy should not be called");

            done();
		}.bind(this));
	});



});