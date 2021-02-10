/* global QUnit*/

sap.ui.define([
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/m/Button",
	"sap/m/Page",
	"sap/m/SplitContainer"
], function (
	DesignTime,
	OverlayRegistry,
	Button,
	Page,
	SplitContainer
) {
	'use strict';

	QUnit.module("Given that a DesignTime is created for a SplitContainer with 2 pages, one is hidden and one is visible", {
		beforeEach: function(assert) {
			this.oButton1 = new Button("button1", {text: "button"});
			this.oButton2 = new Button("button2", {text: "button"});

			this.oPage1 = new Page("page1", {
				content: [
					this.oButton1
				],
				visible: false
			});
			this.oPage2 = new Page("page2", {
				content: [
					this.oButton2
				]
			});
			this.oSplitContainer = new SplitContainer({
				masterPages: [
					this.oPage1
				],
				detailPages: [
					this.oPage2
				]
			});

			this.oSplitContainer.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			var done = assert.async();

			this.oDesignTime = new DesignTime({
				rootElements: [
					this.oSplitContainer
				]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oSplitContainerOverlay = OverlayRegistry.getOverlay(this.oSplitContainer);
				this.oSplitContainerMasterPagesAggregationOverlay = this.oSplitContainerOverlay.getAggregationOverlay("masterPages");
				this.oSplitContainerDetailPagesAggregationOverlay = this.oSplitContainerOverlay.getAggregationOverlay("detailPages");

				this.oPage1Overlay = OverlayRegistry.getOverlay(this.oPage1);
				this.oPage2Overlay = OverlayRegistry.getOverlay(this.oPage2);

				done();
			}, this);
		},
		afterEach: function() {
			this.oDesignTime.destroy();
			this.oSplitContainer.destroy();
		}
	}, function () {
		QUnit.test("when the SplitContainer is rendered", function(assert) {
			assert.notOk(OverlayRegistry.getOverlay(this.oButton1).isVisible(), "no overlays for controls in hidden page are not visible");
			assert.ok(OverlayRegistry.getOverlay(this.oButton2).isVisible(), "overlays for controls in visible page are visible");
		});

		QUnit.test("when the visibility of hidden page is changed", function(assert) {
			this.oPage1.setVisible(true);
			sap.ui.getCore().applyChanges();

			assert.ok(OverlayRegistry.getOverlay(this.oButton1).isVisible(), "overlays for controls in this page are visible");
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});