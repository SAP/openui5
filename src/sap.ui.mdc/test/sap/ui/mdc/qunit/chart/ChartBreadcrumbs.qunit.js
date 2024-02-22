/* global QUnit */

sap.ui.define([
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/core/UIComponent",
	"sap/ui/core/ComponentContainer",
    "sap/ui/mdc/chart/DrillBreadcrumbs",
    "sap/ui/mdc/chart/Item"
],
function(
	nextUIUpdate,
	UIComponent,
	ComponentContainer,
    DrillBreadcrumbs,
    ChartItem
) {
    "use strict";

	QUnit.module("sap.ui.mdc.DrillBreadcrumbs", {

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
					return new DrillBreadcrumbs();
				}
			});
			this.oUiComponent = new TestComponent("IDComponent");
			this.oUiComponentContainer = new ComponentContainer({
				component: this.oUiComponent,
				async: false
			});
            this.oMDCDrillBreadcrumbs = this.oUiComponent.getRootControl();

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

    QUnit.test("DrillBreadcrumbs instantiated", function(assert) {
		assert.ok(this.oMDCDrillBreadcrumbs, "DrillBreadcrumbs are instantiated");
	});

    QUnit.test("DrillBreadcrumbs _createCrumb", function(assert) {
        const oCrumb = this.oMDCDrillBreadcrumbs._createLink("testKey", "testText");

        assert.ok(oCrumb, "Crumb was created");
        assert.ok(oCrumb.data().hasOwnProperty("key"), "Custom data contains key field");
        assert.ok(oCrumb.data().key === "testKey", "Custom data contains correct key");
        assert.ok(oCrumb.getText() === "testText", "Crumbs has correct text");

	});

    QUnit.test("DrillBreadcrumbs updateDrillBreadcrumbs", function(assert) {
        let oDrillableItems = [{text: "label1", key: "name1"}, {text: "label2", key:"name2"}];

		assert.ok(this.oMDCDrillBreadcrumbs.getLinks().length === 0, "No links present initially");

        this.oMDCDrillBreadcrumbs.update(oDrillableItems);
        assert.ok(this.oMDCDrillBreadcrumbs.getLinks().length === 1, "One link present");
        assert.ok(this.oMDCDrillBreadcrumbs.getLinks()[0].getText() === "label1", "Link has correct text set");
		assert.equal(this.oMDCDrillBreadcrumbs.getCurrentLocationText(), "label2", "CurrentLocationText is correct");
		assert.ok(this.oMDCDrillBreadcrumbs.getVisible(), "Breadcrumbs is visible");

        oDrillableItems = [{text: "label1", key: "name1"}, {text: "label2", key:"name2"}, {text: "label3", key:"name3"}];

        this.oMDCDrillBreadcrumbs.update(oDrillableItems);
        assert.ok(this.oMDCDrillBreadcrumbs.getLinks().length === 2, "Two links present");
        assert.ok(this.oMDCDrillBreadcrumbs.getLinks()[1].getText() === "label2", "Link has correct text set");
        assert.ok(this.oMDCDrillBreadcrumbs.getLinks()[0].getText() === "label1", "Link has correct text set");
		assert.equal(this.oMDCDrillBreadcrumbs.getCurrentLocationText(), "label3", "CurrentLocationText is correct");
		assert.ok(this.oMDCDrillBreadcrumbs.getVisible(), "Breadcrumbs is visible");

        oDrillableItems = [];
        this.oMDCDrillBreadcrumbs.update(oDrillableItems);
        assert.ok(this.oMDCDrillBreadcrumbs.getLinks().length === 0, "No links present");
		assert.equal(this.oMDCDrillBreadcrumbs.getCurrentLocationText(), "", "CurrentLocationText is correct");
		assert.notOk(this.oMDCDrillBreadcrumbs.getVisible(), "Breadcrumbs is NOT visible");

	});

});