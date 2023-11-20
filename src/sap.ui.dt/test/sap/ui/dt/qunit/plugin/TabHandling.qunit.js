/* global QUnit */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/plugin/TabHandling",
	"sap/m/Button",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/dom/jquery/Selectors"
], function(
	jQuery,
	DesignTime,
	TabHandling,
	Button,
	VerticalLayout,
	nextUIUpdate
) {
	"use strict";

	QUnit.module("Given that the design time is active ", {
		async beforeEach(assert) {
			this.oButton1 = new Button();
			this.oButton2 = new Button();
			this.oLayout = new VerticalLayout({
				content: [
					this.oButton1,
					this.oButton2
				]
			});
			this.oLayout.placeAt("qunit-fixture");
			await nextUIUpdate();

			this.oTabHandling = new TabHandling();

			var done = assert.async();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oLayout],
				plugins: [
					this.oTabHandling
				]
			});

			this.oDesignTime.attachEventOnce("synced", async function() {
				var oOverlay = this.oDesignTime.getElementOverlays()[1];
				oOverlay.setEditable(true);
				oOverlay.setMovable(true);
				oOverlay.setSelectable(true);
				await nextUIUpdate();
				this.OverlayRoot = jQuery("#overlay-container");
				done();
			}.bind(this));
		},
		afterEach() {
			this.oLayout.destroy();
			this.oDesignTime.destroy();
		}
	}, function() {
		QUnit.test("when the TabHandling plugin is loaded", function(assert) {
			assert.strictEqual(jQuery(this.oLayout.getDomRef()).find(":focusable:not([tabindex='-1'])").length, 0, "then no UI5 controls are tabable");
			assert.strictEqual(this.OverlayRoot.find("[tabindex]:not([tabindex='-1']").length, 1, "then one overlay is tabable");
		});

		QUnit.test("when the TabIndex of the overlay is disabled", function(assert) {
			this.oTabHandling.removeOverlayTabIndex();
			assert.strictEqual(this.OverlayRoot.find("[tabindex]:not([tabindex='-1']").length, 0, "then no overlay is tabable");
		});

		QUnit.test("when the TabIndex of the overlay is disabled and enabled again", function(assert) {
			this.oTabHandling.removeOverlayTabIndex();
			assert.strictEqual(this.OverlayRoot.find("[tabindex]:not([tabindex='-1']").length, 0, "first no overlay is tabable");
			this.oTabHandling.restoreOverlayTabIndex();
			assert.strictEqual(this.OverlayRoot.find("[tabindex]:not([tabindex='-1']").length, 1, "then one overlay is tabable again");
		});

		QUnit.test("when the TabHandling plugin is loaded and destroyed afterwards", function(assert) {
			this.oTabHandling.destroy();
			assert.strictEqual(jQuery(this.oLayout.getDomRef()).find(":focusable:not([tabindex='-1'])").length, 2, "then the UI5 controls are tabable");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
