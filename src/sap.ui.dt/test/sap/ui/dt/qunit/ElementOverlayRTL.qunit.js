/* global QUnit */

sap.ui.define([
	"sap/ui/dt/ElementDesignTimeMetadata",
	"sap/ui/dt/ElementOverlay",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/m/Button",
	"sap/m/Panel",
	"sap/ui/Device",
	"sap/ui/thirdparty/jquery",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/dom/jquery/scrollLeftRTL"
], function(
	ElementDesignTimeMetadata,
	ElementOverlay,
	DesignTime,
	OverlayRegistry,
	Button,
	Panel,
	Device,
	jQuery,
	nextUIUpdate
) {
	"use strict";

	QUnit.module("Given that an Overlay is created on RTL mode", {
		async beforeEach(assert) {
			var fnDone = assert.async();
			this.oButton = new Button({
				text: "Button"
			});
			this.oButton.placeAt("qunit-fixture");
			await nextUIUpdate();

			this.oOverlay = new ElementOverlay({
				element: this.oButton,
				isRoot: true,
				designTimeMetadata: new ElementDesignTimeMetadata({
					data: {}
				})
			});
			this.oOverlay.attachEventOnce("init", function() {
				this.oOverlay.placeInOverlayContainer();
				fnDone();
			}.bind(this));
		},
		afterEach() {
			this.oButton.destroy();
		}
	}, function() {
		QUnit.test("then ", function(assert) {
			var done = assert.async();
			this.oOverlay.attachEventOnce("geometryChanged", function() {
				// Math.round is required for IE and Edge
				assert.equal(
					Math.ceil(this.oOverlay.getDomRef().getBoundingClientRect().left),
					Math.ceil(this.oButton.getDomRef().getBoundingClientRect().left),
					"overlay has same left position as the control"
				);
				assert.equal(
					Math.round(this.oOverlay.getDomRef().getBoundingClientRect().top),
					Math.round(this.oButton.getDomRef().getBoundingClientRect().top),
					"overlay has same top position as the control"
				);
				done();
			}.bind(this));

			this.oOverlay.applyStyles();
		});
	});

	QUnit.module("Given that an Overlay is created on RTL mode and scrolling is present", {
		async beforeEach(assert) {
			var done = assert.async();
			this.oButton = new Button({
				text: "Button"
			});

			this.oInnerPanel = new Panel({
				id: "InnerPanel",
				content: [this.oButton, this.oButton2, this.oButton3],
				width: "550px",
				height: "1000px"
			});

			this.oOuterPanel = new Panel({
				id: "OuterPanel",
				content: [this.oInnerPanel],
				width: "500px",
				height: "500px"
			});

			this.oOuterPanel.placeAt("qunit-fixture");
			await nextUIUpdate();
			var iScrollLeftValue = -20;
			// Chrome uses positive leftScroll
			if (Device.browser.blink) {
				iScrollLeftValue = -iScrollLeftValue;
			}
			jQuery(this.oOuterPanel.getDomRef().querySelector(".sapMPanelContent")).scrollLeftRTL(iScrollLeftValue);
			this.oOuterPanel.getDomRef().querySelector(".sapMPanelContent").scrollTop = 20;

			this.oDesignTime = new DesignTime({
				rootElements: [this.oOuterPanel]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oButtonOverlay = OverlayRegistry.getOverlay(this.oButton);
				if (window.getComputedStyle(this.oButtonOverlay.getDomRef()).transform === "none") {
					this.oButtonOverlay.attachEventOnce("geometryChanged", done);
				} else {
					done();
				}
			}.bind(this));
		},
		afterEach() {
			this.oDesignTime.destroy();
			this.oOuterPanel.destroy();
		}
	}, function() {
		QUnit.test("then", function(assert) {
			// Math.round is required for IE and Edge
			assert.equal(
				Math.ceil(this.oButtonOverlay.getDomRef().getBoundingClientRect().top),
				Math.ceil(this.oButton.getDomRef().getBoundingClientRect().top),
				"overlay has same top position as the control"
			);
			assert.equal(
				Math.ceil(this.oButtonOverlay.getDomRef().getBoundingClientRect().left),
				Math.ceil(this.oButton.getDomRef().getBoundingClientRect().left),
				"overlay has same left position as the control"
			);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});