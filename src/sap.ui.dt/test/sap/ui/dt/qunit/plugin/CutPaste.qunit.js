/* global QUnit */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/m/Button",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/plugin/CutPaste",
	"sap/ui/Device",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes",
	"sap/ui/thirdparty/sinon-4"
],
function(
	jQuery,
	Button,
	VerticalLayout,
	DesignTime,
	OverlayRegistry,
	CutPaste,
	Device,
	QUnitUtils,
	KeyCodes,
	sinon
) {
	"use strict";

	function triggerKeydown(oTargetDomRef, iKeyCode, bShiftKey, bAltKey, bCtrlKey, bMetaKey) {
		var oParams = {};
		oParams.keyCode = iKeyCode;
		oParams.which = oParams.keyCode;
		oParams.shiftKey = bShiftKey;
		oParams.altKey = bAltKey;
		oParams.metaKey = bMetaKey;
		oParams.ctrlKey = bCtrlKey;
		QUnitUtils.triggerEvent("keydown", oTargetDomRef, oParams);
	}

	QUnit.module("Given that a CutPaste is initialized", {
		beforeEach: function(assert) {
			// Test Setup:
			// VerticalLayout
			// 	 content
			//      Button

			this.oButton = new Button();
			this.oButton2 = new Button();
			this.oButton3 = new Button();
			this.oLayout = new VerticalLayout({
				content: [
					this.oButton,
					this.oButton2,
					this.oButton3
				]
			});
			this.oLayout.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			sap.ui.getCore().applyChanges();
			this.oCutPaste = new CutPaste({
				movableTypes: [
					"sap.m.Button"
				]
			});

			var done = assert.async();

			this.oDesignTime = new DesignTime({
				rootElements: [
					this.oLayout
				],
				plugins: [
					this.oCutPaste
				]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				sap.ui.getCore().applyChanges();
				this.oButtonOverlay = OverlayRegistry.getOverlay(this.oButton);
				this.oButton2Overlay = OverlayRegistry.getOverlay(this.oButton2);
				this.oButton3Overlay = OverlayRegistry.getOverlay(this.oButton3);
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oLayout);
				done();
			}.bind(this));
		},
		afterEach: function () {
			this.oDesignTime.destroy();
			this.oLayout.destroy();
			this.oCutPaste.destroy();
		}
	}, function () {
		QUnit.test("when CutPaste is initialized", function(assert) {
			var bElementMoverExist = !!this.oCutPaste.getElementMover();
			assert.ok(bElementMoverExist, "parameter elementMover exists");
		});

		QUnit.test("when cut is triggered on a button overlay, with macintosh device and metaKey is pushed", function(assert) {
			Device.os.macintosh = true;
			triggerKeydown(this.oButtonOverlay.getDomRef(), KeyCodes.X, false, false, false, true);
			assert.ok(this.oButtonOverlay.hasStyleClass("sapUiDtOverlayCutted"), "the button overlay is marked with the correct style");
			assert.equal(this.oCutPaste.getCuttedOverlay(), this.oButtonOverlay, "then the button overlay is remembered as to be cutted");
		});

		QUnit.test("when cut is triggered on a button overlay, with macintosh device and ctrlKey is pushed", function(assert) {
			Device.os.macintosh = true;
			triggerKeydown(this.oButtonOverlay.getDomRef(), KeyCodes.X, false, false, true, false);
			assert.notOk(this.oButtonOverlay.hasStyleClass("sapUiDtOverlayCutted"), "the button overlay is marked with the correct style");
			assert.equal(this.oCutPaste.getCuttedOverlay(), undefined, "then the button overlay is undefined");
		});

		QUnit.test("when cut is triggered on a button overlay, with no macintosh device and ctrlKey is pushed", function(assert) {
			Device.os.macintosh = false;
			triggerKeydown(this.oButtonOverlay.getDomRef(), KeyCodes.X, false, false, true, false);
			assert.ok(this.oButtonOverlay.hasStyleClass("sapUiDtOverlayCutted"), "the button overlay is marked with the correct style");
			assert.equal(this.oCutPaste.getCuttedOverlay(), this.oButtonOverlay, "then the button overlay is remembered as to be cutted");
		});

		QUnit.test("when cut is triggered on a button overlay, with no macintosh device and metaKey is pushed", function(assert) {
			Device.os.macintosh = false;
			triggerKeydown(this.oButtonOverlay.getDomRef(), KeyCodes.X, false, false, false, true);
			assert.notOk(this.oButtonOverlay.hasStyleClass("sapUiDtOverlayCutted"), "the button overlay is marked with the correct style");
			assert.equal(this.oCutPaste.getCuttedOverlay(), undefined, "then the button overlay is undefined");
		});

		QUnit.test("when cut is triggered on a button overlay and paste is triggered on the last button overlay", function(assert) {
			var done = assert.async();
			Device.os.macintosh = false;
			triggerKeydown(this.oButtonOverlay.getDomRef(), KeyCodes.X, false, false, true, false);

			this.oCutPaste.getElementMover().attachValidTargetZonesActivated(function() {
				triggerKeydown(this.oButton3Overlay.getDomRef(), KeyCodes.V, false, false, true, false);
				var aContent = this.oLayout.getContent();
				assert.equal(aContent.indexOf(this.oButton), 2, "the first Button is at position 2");
				assert.equal(aContent.indexOf(this.oButton2), 0, "the second Button is at position 0");
				assert.equal(aContent.indexOf(this.oButton3), 1, "the third Button is at position 1");
				done();
			}.bind(this));
		});

		QUnit.test("when cut is triggered on a button overlay and paste is triggered on the first button overlay", function(assert) {
			var done = assert.async();
			Device.os.macintosh = false;
			triggerKeydown(this.oButton3Overlay.getDomRef(), KeyCodes.X, false, false, true, false);

			this.oCutPaste.getElementMover().attachValidTargetZonesActivated(function() {
				triggerKeydown(this.oButtonOverlay.getDomRef(), KeyCodes.V, false, false, true, false);
				var aContent = this.oLayout.getContent();
				assert.equal(aContent.indexOf(this.oButton), 0, "the first Button is at position 0");
				assert.equal(aContent.indexOf(this.oButton2), 2, "the second Button is at position 2");
				assert.equal(aContent.indexOf(this.oButton3), 1, "the third Button is at position 1");
				done();
			}.bind(this));
		});

		QUnit.test("when cut is triggered on a button overlay and paste is triggered on layout overlay", function(assert) {
			Device.os.macintosh = false;
			triggerKeydown(this.oButtonOverlay.getDomRef(), KeyCodes.X, false, false, true, false);
			triggerKeydown(this.oLayoutOverlay.getDomRef(), KeyCodes.V, false, false, true, false);

			var aContent = this.oLayout.getContent();
			assert.equal(aContent.indexOf(this.oButton), 0, "the first Button is at position 0");
			assert.equal(aContent.indexOf(this.oButton2), 1, "the second Button is at position 1");
			assert.equal(aContent.indexOf(this.oButton3), 2, "the third Button is at position 2");
		});

		QUnit.test("when paste is triggered on a Layout overlay and cut was not triggered before", function(assert) {
			Device.os.macintosh = false;
			var oPasteSpy = sinon.spy(this.oCutPaste, "paste");

			triggerKeydown(this.oLayoutOverlay.getDomRef(), KeyCodes.V, false, false, true, false);

			var aContent = this.oLayout.getContent();
			assert.equal(aContent.indexOf(this.oButton), 0, "the first Button is at position 0");
			assert.equal(aContent.indexOf(this.oButton2), 1, "the second Button is at position 1");
			assert.equal(aContent.indexOf(this.oButton3), 2, "the third Button is at position 2");
			assert.equal(oPasteSpy.callCount, 0, "then the paste function was not called");
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});