/* global QUnit */

jQuery.sap.require("sap.ui.qunit.qunit-coverage");

jQuery.sap.require("sap.ui.thirdparty.sinon");
jQuery.sap.require("sap.ui.thirdparty.sinon-ie");
jQuery.sap.require("sap.ui.thirdparty.sinon-qunit");

jQuery.sap.require("sap.ui.dt.ElementOverlay");
jQuery.sap.require("sap.ui.dt.plugin.CutPaste");
jQuery.sap.require("sap.ui.dt.DesignTime");
jQuery.sap.require("sap.ui.Device");

(function() {
	"use strict";

	var fnTriggerKeydown = function(oTargetDomRef, iKeyCode, bShiftKey, bAltKey, bCtrlKey, bMetaKey) {
		var oParams = {};
		oParams.keyCode = iKeyCode;
		oParams.which = oParams.keyCode;
		oParams.shiftKey = bShiftKey;
		oParams.altKey = bAltKey;
		oParams.metaKey = bMetaKey;
		oParams.ctrlKey = bCtrlKey;
		sap.ui.test.qunit.triggerEvent("keydown", oTargetDomRef, oParams);
	};

	QUnit.module("Given that a CutPaste is initialized", {
		beforeEach : function(assert) {

			// Test Setup:
			// VerticalLayout
			// 	 content
			//      Button

			this.oButton = new sap.m.Button();
			this.oLayout = new sap.ui.layout.VerticalLayout({
				content : [
					this.oButton
				]
			});
			this.oLayout.placeAt("content");
			sap.ui.getCore().applyChanges();

			sap.ui.getCore().applyChanges();
			this.oCutPaste = new sap.ui.dt.plugin.CutPaste({
				movableTypes: [
					"sap.m.Button"
				]
			});

			var done = assert.async();

			this.oDesignTime = new sap.ui.dt.DesignTime({
				rootElements: [
					this.oLayout
				],
				plugins: [
					this.oCutPaste
				]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				sap.ui.getCore().applyChanges();
				this.oButtonOverlay = sap.ui.dt.OverlayRegistry.getOverlay(this.oButton);
				done();
			}.bind(this));


		},
		afterEach : function(assert) {
			this.oDesignTime.destroy();
			this.oLayout.destroy();
			this.oCutPaste.destroy();
		}
	});

	QUnit.test("when CutPaste is initialized", function(assert) {
		var bElementMoverExist = !!this.oCutPaste.getElementMover();
		assert.ok(bElementMoverExist, "parameter elementMover exists");
	});

	QUnit.test("when cut is triggered on a button overlay, with macintosh device and metaKey is pushed", function(assert) {
		sap.ui.Device.os.macintosh = true;
		fnTriggerKeydown(this.oButtonOverlay.getDomRef(), jQuery.sap.KeyCodes.X, false, false, false, true);
		assert.ok(this.oButtonOverlay.hasStyleClass("sapUiDtOverlayCutted"), "the button overlay is marked with the correct style");
		assert.equal(this.oCutPaste.getCuttedOverlay(), this.oButtonOverlay, "then the button overlay is remembered as to be cutted");
	});

	QUnit.test("when cut is triggered on a button overlay, with macintosh device and ctrlKey is pushed", function(assert) {
		sap.ui.Device.os.macintosh = true;
		fnTriggerKeydown(this.oButtonOverlay.getDomRef(), jQuery.sap.KeyCodes.X, false, false, true, false);
		assert.notOk(this.oButtonOverlay.hasStyleClass("sapUiDtOverlayCutted"), "the button overlay is marked with the correct style");
		assert.equal(this.oCutPaste.getCuttedOverlay(), undefined, "then the button overlay is undefined");
	});

	QUnit.test("when cut is triggered on a button overlay, with no macintosh device and ctrlKey is pushed", function(assert) {
		sap.ui.Device.os.macintosh = false;
		fnTriggerKeydown(this.oButtonOverlay.getDomRef(), jQuery.sap.KeyCodes.X, false, false, true, false);
		assert.ok(this.oButtonOverlay.hasStyleClass("sapUiDtOverlayCutted"), "the button overlay is marked with the correct style");
		assert.equal(this.oCutPaste.getCuttedOverlay(), this.oButtonOverlay, "then the button overlay is remembered as to be cutted");
	});

	QUnit.test("when cut is triggered on a button overlay, with no macintosh device and metaKey is pushed", function(assert) {
		sap.ui.Device.os.macintosh = false;
		fnTriggerKeydown(this.oButtonOverlay.getDomRef(), jQuery.sap.KeyCodes.X, false, false, false, true);
		assert.notOk(this.oButtonOverlay.hasStyleClass("sapUiDtOverlayCutted"), "the button overlay is marked with the correct style");
		assert.equal(this.oCutPaste.getCuttedOverlay(), undefined, "then the button overlay is undefined");
	});

})();