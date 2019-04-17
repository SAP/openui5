/*global QUnit */
sap.ui.define([
    "sap/ui/qunit/QUnitUtils",
    "sap/ui/qunit/utils/createAndAppendDiv",
    "sap/ui/ux3/OverlayContainer",
    "sap/ui/commons/Button",
    "sap/ui/events/KeyCodes"
], function(qutils, createAndAppendDiv, OverlayContainer, Button, KeyCodes) {
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


	var oOverlayContainer = new OverlayContainer("myOverlayContainer", {
		close: closeEventHandler,
		open: openEventHandler,
		openNew: openNewEventHandler
	});
	oOverlayContainer.addContent(new Button(oOverlayContainer.getId() + "Button", {text: "Button for Content"}));
	oOverlayContainer.placeAt("uiArea1");
	sap.ui.getCore().applyChanges();



	QUnit.module("Appearance");

	QUnit.test("OverlayContainer exists", function (assert) {
		var oDomRef = oOverlayContainer.getDomRef();
		assert.ok(oDomRef, "Rendered OverlayContainer should exist in the page");
		assert.ok(oDomRef.classList.contains("sapUiUx3OC"), "Rendered OverlayContainer should have the class 'sapUiUx3OC'");
		assert.ok(oDomRef.classList.contains("sapUiUx3Overlay"), "Rendered OverlayContainer should have the class 'sapUiUx3Overlay'");

	});

	QUnit.module("Behaviour");

	QUnit.test("OpenNew Event", function (assert) {
		assert.expect(1);
		qutils.triggerMouseEvent(oOverlayContainer.$("openNew"), "click", 1, 1, 1, 1);
	});

	QUnit.test("OpenNew via Keyboard Event", function (assert) {
		assert.expect(2);
		qutils.triggerKeyboardEvent(oOverlayContainer.getId() + "-openNew", KeyCodes.ENTER, false, false, false);
		qutils.triggerKeyboardEvent(oOverlayContainer.getId() + "-openNew", KeyCodes.SPACE, false, false, false);
	});

	QUnit.test("Open Method", function (assert) {
		var done = assert.async();
		assert.expect(4);
		assert.ok(!oOverlayContainer.isOpen(), "Rendered OverlayContainer is not open");
		oOverlayContainer.open();
		assert.ok(oOverlayContainer.isOpen(), "Rendered OverlayContainer is open");
		setTimeout(
				function () {
					assert.ok(oOverlayContainer.getId() + "Button" ? window.document.getElementById(oOverlayContainer.getId() + "Button") : null, "Rendered Content should exist in the page");
					done();
				}, 500);
	});

	// at the end close
	QUnit.test("Close Event", function (assert) {
		var done = assert.async();
		assert.expect(3);
		assert.ok(oOverlayContainer.isOpen(), "Rendered OverlayContainer is open");
		qutils.triggerMouseEvent(oOverlayContainer.$("close"), "click", 1, 1, 1, 1);
		setTimeout(function () {
			assert.ok(!oOverlayContainer.isOpen(), "Rendered OverlayContainer is not open");
			done();
		}, 500);
	});

	QUnit.test("Destroy and remove control", function (assert) {
		oOverlayContainer.destroy();
		sap.ui.getCore().applyChanges();
		var oDomRef = oOverlayContainer.getDomRef();
		assert.ok(!oDomRef, "Rendered OverlayContainer should not exist in the page after destruction");
	});
});