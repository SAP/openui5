/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/mdc/Chart",
	"sap/ui/core/UIComponent",
	"sap/ui/core/ComponentContainer",
    "sap/m/Button",
	"sap/ui/fl/variants/VariantManagement"
],
function(
	nextUIUpdate,
	Chart,
	UIComponent,
	ComponentContainer,
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
            assert.ok(this.oMDCChart._oSelectionDetailsBtn, "Details button was created");
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
			const zoomSpy = sinon.spy(this.oMDCChart, "_updateToolbar");

            this.oMDCChart._updateToolbar();
			assert.ok(zoomSpy.calledOnce, "_updateToolbar was called");
            assert.ok(oToolbar.getEnabled(), "Toolbar is enabled");
            done();
		}.bind(this));
	});

    QUnit.test("_getZoomEnablement function", function(assert){
		const done = assert.async();

		this.oMDCChart.initialized().then(function(){
            // const oToolbar = this.oMDCChart._getToolbar();
            const stub = sinon.stub(this.oMDCChart.getControlDelegate(), "getZoomState");
            stub.onCall(0).returns({enabledZoomIn: true, enabledZoomOut: false, enabled: true});

            this.oMDCChart._updateZoomButtons();
            assert.notOk(this.oMDCChart._oZoomOutBtn.getEnabled(), "Zoom Out is disabled");
            assert.ok(this.oMDCChart._oZoomInBtn.getEnabled(), "Zoom In is enabled");

            stub.onCall(1).returns({enabledZoomIn: false, enabledZoomOut: true, enabled: true});
            this.oMDCChart._updateZoomButtons();
            assert.ok(this.oMDCChart._oZoomOutBtn.getEnabled(), "Zoom Out is enabled");
            assert.notOk(this.oMDCChart._oZoomInBtn.getEnabled(), "Zoom In is disabled");

            stub.onCall(2).returns({enabledZoomIn: true, enabledZoomOut: true, enabled: true});
            this.oMDCChart._updateZoomButtons();
            assert.ok(this.oMDCChart._oZoomOutBtn.getEnabled(), "Zoom Out is enabled");
            assert.ok(this.oMDCChart._oZoomInBtn.getEnabled(), "Zoom In is enabled");

            stub.onCall(3).returns({enabled: false});
            this.oMDCChart._updateZoomButtons();
            assert.notOk(this.oMDCChart._oZoomOutBtn.getEnabled(), "Zoom Out is disabled");
            assert.notOk(this.oMDCChart._oZoomInBtn.getEnabled(), "Zoom In is disabled");

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
			this.oMDCChart.setVariant(oVM);
			assert.equal(oToolbar.getBetween().length, 1, "Between Actions of Toolbar have 1 entry");
			assert.equal(oToolbar.getBetween()[0], oVM, "Action in between is variant management");
			assert.equal(this.oMDCChart.getVariant(), oVM, "Variant reference was set correctly");

			oVM = new VariantManagement("mgmnt-2", {"for": "IDChart"});
			this.oMDCChart.setVariant(oVM);
			assert.equal(oToolbar.getBetween().length, 1, "Between Actions of Toolbar have 1 entry");
			assert.equal(oToolbar.getBetween()[0], oVM, "Action in between is the new variant management");
			assert.equal(this.oMDCChart.getVariant(), oVM, "Variant reference was set correctly");

            done();
		}.bind(this));
	});

	QUnit.test("Header visibility", function(assert) {
		const done = assert.async();

		this.oMDCChart.initialized().then(function(){

			//Check initial title visibility
			assert.ok(this.oMDCChart._oTitle.getVisible(), "Title is visible");

			this.oMDCChart.setHeaderVisible(false);
			assert.notOk(this.oMDCChart._oTitle.getVisible(), "Title is not visible");

			this.oMDCChart.setHeaderVisible(true);
			assert.ok(this.oMDCChart._oTitle.getVisible(), "Title is visible");

			done();
		}.bind(this));
	});

	QUnit.module("sap.ui.mdc.chart.ChartToolbar: IgnoreDetailsActions", {

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
					showSelectionDetails: false,
					ignoreToolbarActions: ["ZoomInOut","DrillDownUp","Legend"]
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

	QUnit.test("ignoreToolbarActions", function(assert) {
		const done = assert.async();

		this.oMDCChart.initialized().then(function(){

			assert.equal(this.oMDCChart._oDrillDownBtn, null, "oDrillDownBtn is not created");
			assert.equal(this.oMDCChart._oLegendBtn, null, "oLegendBtn is not created");
			assert.equal(this.oMDCChart._oZoomInBtn, null, "oZoomInButton is not created");
			assert.equal(this.oMDCChart._oZoomOutBtn, null, "oZoomOutButton is not created");

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
            assert.ok(this.oMDCChart._oSelectionDetailsBtn === undefined, "Details button was not created");
            done();
		}.bind(this));
	});

	QUnit.test("updateToolbar function when no details btn is shown", function(assert){
		const done = assert.async();

		this.oMDCChart.initialized().then(function(){
            const oToolbar = this.oMDCChart._getToolbar();
            assert.ok(oToolbar.getEnabled(), "Toolbar is enabled intially");
			assert.ok(oToolbar.getContent().length === 8, "Correct amount of toolbar items were added");

			const zoomSpy = sinon.spy(this.oMDCChart, "_updateZoomButtons");

            this.oMDCChart._updateToolbar();
			assert.ok(zoomSpy.calledOnce, "_updateZoomButtons was called");
            assert.ok(oToolbar.getEnabled(), "Toolbar is enabled");
			assert.ok(this.oMDCChart._oSelectionDetailsBtn === undefined, "No _oSelectionDetailsBtn exists");
            done();
		}.bind(this));
	});




});