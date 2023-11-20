/* global QUnit, sinon */

sap.ui.define([
    "sap/ui/core/Core",
    "sap/ui/core/UIComponent",
	"sap/ui/core/ComponentContainer",
	"sap/ui/mdc/chart/ChartImplementationContainer",
    "sap/ui/core/Control"
],
function(
    Core,
    UIComponent,
    ComponentContainer,
	ChartImplementationContainer,
    Control
) {
    "use strict";

	QUnit.module("sap.ui.mdc.chart.ChartImplementationContainer: API", {

		beforeEach: function() {

            this.oContA = new Control("ControlA");
            this.oContB = new Control("ControlB");

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
					return new ChartImplementationContainer({
                        content : this.oContA,
                        noDataContent : this.oContB
                    });
				}.bind(this)
			});
			this.oUiComponent = new TestComponent("IDComponent");
			this.oUiComponentContainer = new ComponentContainer({
				component: this.oUiComponent,
				async: false
			});
            this.oChartContainer = this.oUiComponent.getRootControl();

			this.oUiComponentContainer.placeAt("qunit-fixture");
			Core.applyChanges();
		},
		afterEach: function() {
            this.oContA.destroy();
            this.oContB.destroy();

			this.oUiComponentContainer.destroy();
			this.oUiComponent.destroy();
		}

    });

	QUnit.test("Test exists", function(assert) {
		assert.ok(true);
	});

	QUnit.test("Controls are existent", function(assert) {
		assert.equal(this.oChartContainer.getContent().getId(), "ControlA", "Content is set");
        assert.equal(this.oChartContainer.getNoDataContent().getId(), "ControlB", "No Data struct ist set");
	});

    QUnit.test("Initial visibility", function(assert) {
		assert.equal(this.oChartContainer.getContent().getVisible(), false, "Content is set invisible");
        assert.equal(this.oChartContainer.getNoDataContent().getVisible(), true, "No Data struct ist set visible");
	});

    QUnit.test("setShowNoDataStruct", function(assert) {
		assert.equal(this.oChartContainer.getContent().getVisible(), false, "Content is set invisible");
        assert.equal(this.oChartContainer.getNoDataContent().getVisible(), true, "No Data struct ist set visible");

        this.oChartContainer.setShowNoDataStruct(false);
		assert.equal(this.oChartContainer.getContent().getVisible(), true, "Content is set invisible");
        assert.equal(this.oChartContainer.getNoDataContent().getVisible(), false, "No Data struct ist set visible");

        this.oChartContainer.setShowNoDataStruct(true);
        assert.equal(this.oChartContainer.getContent().getVisible(), false, "Content is set invisible");
        assert.equal(this.oChartContainer.getNoDataContent().getVisible(), true, "No Data struct ist set visible");
	});

    QUnit.test("setContent", function(assert) {
		const oCont = new Control("ControlC");

        const oUpdateSpy = sinon.spy(this.oChartContainer, "_updateVisibilities");

        this.oChartContainer.setContent(oCont);
        assert.equal(oCont.getVisible(), false, "Content is set invisible");
        assert.ok(oUpdateSpy.calledOnce, "Update function was called");
	});

    QUnit.test("setNoDataContent", function(assert) {
		const oCont = new Control("ControlC");

        const oUpdateSpy = sinon.spy(this.oChartContainer, "_updateVisibilities");

        this.oChartContainer.setNoDataContent(oCont);
        assert.equal(oCont.getVisible(), true, "Content is set visible");
        assert.ok(oUpdateSpy.calledOnce, "Update function was called");
	});

	QUnit.test("setChartNoDataContent", function(assert) {
		const oCont = new Control("ControlC");

        const oUpdateSpy = sinon.spy(this.oChartContainer, "_updateVisibilities");

        this.oChartContainer.setChartNoDataContent(oCont);
        assert.equal(oCont.getVisible(), true, "Content is set visible");
		assert.equal(this.oChartContainer.getChartNoDataContent(), "ControlC", "Association is set");
        assert.ok(oUpdateSpy.calledOnce, "Update function was called");
	});

	QUnit.test("showOverlay", function(assert) {
		assert.equal(this.oChartContainer.$().find(".sapUiMdcChartOverlay").length, 0, "No overlay found");

		this.oChartContainer.showOverlay(false);
		assert.equal(this.oChartContainer.$().find(".sapUiMdcChartOverlay").length, 0, "No overlay found");

		this.oChartContainer.showOverlay(true);
		assert.equal(this.oChartContainer.$().find(".sapUiMdcChartOverlay").length, 1, "Overlay found");

		this.oChartContainer.showOverlay(false);
		assert.equal(this.oChartContainer.$().find(".sapUiMdcChartOverlay").length, 0, "No overlay found");
	});



});