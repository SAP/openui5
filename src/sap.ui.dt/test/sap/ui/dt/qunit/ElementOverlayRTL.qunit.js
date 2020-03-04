/* global QUnit */

sap.ui.define([
	"sap/ui/dt/ElementOverlay",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/m/Button",
	"sap/m/Panel",
	"sap/ui/Device"
], function (
	ElementOverlay,
	DesignTime,
	OverlayRegistry,
	Button,
	Panel,
	Device
) {
	"use strict";

	QUnit.module("Given that an Overlay is created on RTL mode", {
		beforeEach : function(assert) {
			var fnDone = assert.async();
			this.oButton = new Button({
				text : "Button"
			});
			this.oButton.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oOverlay = new ElementOverlay({
				element : this.oButton,
				isRoot: true,
				designTimeMetadata : {}
			});
			this.oOverlay.attachEventOnce("init", function() {
				this.oOverlay.placeInOverlayContainer();
				fnDone();
			}.bind(this));
		},
		afterEach : function() {
			this.oButton.destroy();
		}
	}, function () {
		QUnit.test("then ", function(assert) {
			var done = assert.async();
			this.oOverlay.attachEventOnce("geometryChanged", function() {
				// Math.round is required for IE and Edge
				assert.equal(
					Math.ceil(this.oOverlay.$().offset().left),
					Math.ceil(this.oButton.$().offset().left),
					"overlay has same left position as the control"
				);
				assert.equal(
					Math.round(this.oOverlay.$().offset().top),
					Math.round(this.oButton.$().offset().top),
					"overlay has same top position as the control"
				);
				done();
			}.bind(this));

			this.oOverlay.applyStyles();
		});
	});

	QUnit.module("Given that an Overlay is created on RTL mode and scrolling is present", {
		beforeEach : function(assert) {
			var done = assert.async();
			this.oButton = new Button({
				text : "Button"
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
			sap.ui.getCore().applyChanges();
			var iScrollLeftValue = -20;
			// IE, Edge and Chrome use positive leftScroll
			if (Device.browser.msie || Device.browser.edge || Device.browser.blink) {
				iScrollLeftValue = -iScrollLeftValue;
			}
			this.oOuterPanel.$().find('>.sapMPanelContent').scrollLeft(iScrollLeftValue);
			this.oOuterPanel.$().find('>.sapMPanelContent').scrollTop(20);

			this.oDesignTime = new DesignTime({
				rootElements: [this.oOuterPanel]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oButtonOverlay = OverlayRegistry.getOverlay(this.oButton);
				// FIXME: when synced event is resolved including scrollbar synchronization
				if (this.oButtonOverlay.$().css("transform") === "none") {
					this.oButtonOverlay.attachEventOnce("geometryChanged", done);
				} else {
					done();
				}
			}.bind(this));
		},
		afterEach : function() {
			this.oDesignTime.destroy();
			this.oOuterPanel.destroy();
		}
	}, function () {
		QUnit.test("then", function(assert) {
			//Math.round is required for IE and Edge
			assert.equal(
				Math.ceil(this.oButtonOverlay.$().offset().top),
				Math.ceil(this.oButton.$().offset().top),
				"overlay has same top position as the control"
			);
			assert.equal(
				Math.ceil(this.oButtonOverlay.$().offset().left),
				Math.ceil(this.oButton.$().offset().left),
				"overlay has same left position as the control"
			);
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});