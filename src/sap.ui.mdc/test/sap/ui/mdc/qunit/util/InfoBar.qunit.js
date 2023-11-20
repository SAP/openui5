/* global QUnit */

sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/core/UIComponent",
	"sap/ui/core/ComponentContainer",
    "sap/ui/mdc/util/InfoBar"
],
function(
	Core,
	UIComponent,
	ComponentContainer,
    InfoBar
) {
    "use strict";

	QUnit.module("sap.ui.mdc.util.InfoBar", {

		beforeEach: function() {
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
					return new InfoBar();
				}
			});
			this.oUiComponent = new TestComponent("IDComponent");
			this.oUiComponentContainer = new ComponentContainer({
				component: this.oUiComponent,
				async: false
			});
            this.oMDCInfoBar = this.oUiComponent.getRootControl();

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

    QUnit.test("InfoBar is instantiated", function(assert) {
		assert.ok(this.oMDCInfoBar, "InfoBar is instantiated");

        assert.ok(this.oMDCInfoBar.oText, "Text is instantiated during InfoBar init");
        assert.ok(this.oMDCInfoBar.oInvisibleText, "InvisibleText is instantiated during InfoBar init");
        assert.ok(this.oMDCInfoBar.oRemoveAllFiltersBtn, "RemoveAllButton is instantiated during InfoBar init");
        assert.ok(this.oMDCInfoBar.getAggregation("_toolbar"), "Toolbar is instantiated during init");

        assert.equal(this.oMDCInfoBar.oText.getText(), "", "No default text should be set on the Text");
        assert.equal(this.oMDCInfoBar.oInvisibleText.getText(), "", "No default text should be set on the InvisibleText");

        assert.ok(!this.oMDCInfoBar.getVisible(), "InfoBar should not be visible");
	});

    QUnit.test("InfoBar init with default value", function(assert) {
        const oSampleText = "Test123";
        const oTestIB = new InfoBar("SomeSampleId" ,{infoText: oSampleText});

        assert.ok(oTestIB, "InfoBar is instantiated");

        assert.ok(oTestIB.oText, "Text is instantiated during InfoBar init");
        assert.ok(oTestIB.oInvisibleText, "InvisibleText is instantiated during InfoBar init");
        assert.ok(oTestIB.getAggregation("_toolbar"), "Toolbar is instantiated during init");

        assert.equal(oTestIB.oText.getText(), oSampleText, "Text should be set on the Text");
        assert.equal(oTestIB.oInvisibleText.getText(), oSampleText, "Text should be set on the InvisibleText");

        assert.ok(oTestIB.getVisible(), "InfoBar should be visible");

        oTestIB.destroy();
    });

    QUnit.test("setInfoText function", function(assert) {
        const oSampleText = "Test123";

        this.oMDCInfoBar.setInfoText(oSampleText);
        assert.ok(this.oMDCInfoBar.getVisible(), "InfoBar should be visible");
        assert.equal(this.oMDCInfoBar.oText.getText(), oSampleText, "Text should be set on the Text");
        assert.equal(this.oMDCInfoBar.oInvisibleText.getText(), oSampleText, "Text should be set on the InvisibleText");

        this.oMDCInfoBar.setInfoText("");
        assert.ok(!this.oMDCInfoBar.getVisible(), "InfoBar should not be visible");
        assert.equal(this.oMDCInfoBar.oText.getText(), "", "No text should be set on the Text");
        assert.equal(this.oMDCInfoBar.oInvisibleText.getText(), "", "No text should be set on the InvisibleText");

        this.oMDCInfoBar.setInfoText(oSampleText);
        assert.ok(this.oMDCInfoBar.getVisible(), "InfoBar should be visible");
        assert.equal(this.oMDCInfoBar.oText.getText(), oSampleText, "Text should be set on the Text");
        assert.equal(this.oMDCInfoBar.oInvisibleText.getText(), oSampleText, "Text should be set on the InvisibleText");

        this.oMDCInfoBar.setInfoText(undefined);
        assert.ok(!this.oMDCInfoBar.getVisible(), "InfoBar should not be visible");
        assert.equal(this.oMDCInfoBar.oText.getText(), "", "No text should be set on the Text");
        assert.equal(this.oMDCInfoBar.oInvisibleText.getText(), "", "No text should be set on the InvisibleText");
    });

    QUnit.test("getACCTextId function", function(assert) {
        assert.equal(this.oMDCInfoBar.getACCTextId(), this.oMDCInfoBar.oInvisibleText.getId(), "Correct Id returned");
    });

    QUnit.test("testing event handling", function(assert) {
        let iCalled = 0;
        function testOnFirePress(oEvent) {
            iCalled++;
        }

        this.oMDCInfoBar.attachEvent("press", testOnFirePress);
        this.oMDCInfoBar.firePress();
        assert.equal(iCalled, 1, "Event press was fired once");
        iCalled = 0;

        this.oMDCInfoBar.attachEvent("removeAllFilters", testOnFirePress);
        this.oMDCInfoBar.fireRemoveAllFilters();
        assert.equal(iCalled, 1, "Event removeAllFilters was fired once");
        iCalled = 0;

    });


});