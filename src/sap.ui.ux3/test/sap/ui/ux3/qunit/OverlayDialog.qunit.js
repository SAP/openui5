/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/ux3/OverlayDialog",
	"sap/ui/commons/Button",
	"jquery.sap.global"
], function(qutils, createAndAppendDiv, OverlayDialog, Button, jQuery) {
	"use strict";

	// prepare DOM
	createAndAppendDiv("uiArea1");


	function closeEventHandler(oEvent) {
		QUnit.config.current.assert.ok(true, "close event handler has been executed."); // this test tests by just being counted in the respective test
	}
	function openEventHandler(oEvent) {
		QUnit.config.current.assert.ok(true, "open event handler has been executed."); // this test tests by just being counted in the respective test
	}
	function openNewEventHandler(oEvent) {
		QUnit.config.current.assert.ok(true, "open new event handler has been executed."); // this test tests by just being counted in the respective test
	}


	var oOverlayDialog = new OverlayDialog("myOverlayDialog", {
		close: closeEventHandler,
		open: openEventHandler,
		openNew: openNewEventHandler
	});
	oOverlayDialog.addContent(new Button(oOverlayDialog.getId() + "Button", {text: "Button for Content"}));
	oOverlayDialog.placeAt("uiArea1");
	sap.ui.getCore().applyChanges();



	QUnit.module("Appearance");

	QUnit.test("OverlayDialog exists", function (assert) {
		var oDomRef = oOverlayDialog.getDomRef();
		assert.ok(oDomRef, "Rendered OverlayDialog should exist in the page");
		assert.equal(oDomRef.className, "sapUiUx3OD sapUiUx3Overlay", "Rendered OverlayDialog should have the classes 'sapUiUx3OD' and 'sapUiUx3Overlay'");
		oDomRef = oOverlayDialog.getDomRef("close");
		assert.ok(oDomRef, "close button should be rendered");
		oDomRef = oOverlayDialog.getDomRef("openNew");
		assert.ok(!oDomRef, "close button should not be rendered");
	});

	QUnit.module("Behaviour");

	QUnit.test("Open Method", function (assert) {
		var done = assert.async();
		assert.expect(4);
		assert.ok(!oOverlayDialog.isOpen(), "Rendered OverlayDialog is not open");
		oOverlayDialog.open();
		assert.ok(oOverlayDialog.isOpen(), "Rendered OverlayDialog is open");
		setTimeout(
				function () {
					assert.ok(jQuery.sap.domById(oOverlayDialog.getId() + "Button"), "Rendered Content should exist in the page");
					done();
				}, 500);
	});

	// at the end close
	QUnit.test("Close Event", function (assert) {
		var done = assert.async();
		assert.expect(3);
		assert.ok(oOverlayDialog.isOpen(), "Rendered OverlayDialog is open");
		qutils.triggerMouseEvent(oOverlayDialog.$("close"), "click", 1, 1, 1, 1);
		setTimeout(function () {
			assert.ok(!oOverlayDialog.isOpen(), "Rendered OverlayDialog is not open");
			done();
		}, 500);
	});

	QUnit.test("Destroy and remove control", function (assert) {
		oOverlayDialog.destroy();
		sap.ui.getCore().applyChanges();
		var oDomRef = oOverlayDialog.getDomRef();
		assert.ok(!oDomRef, "Rendered OverlayDialog should not exist in the page after destruction");
	});
});