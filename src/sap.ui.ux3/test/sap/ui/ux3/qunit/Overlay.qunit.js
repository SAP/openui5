/*global QUnit */
sap.ui.define([
    "sap/ui/qunit/QUnitUtils",
    "sap/ui/qunit/utils/createAndAppendDiv",
    "sap/ui/ux3/Overlay",
    "sap/ui/events/KeyCodes"
], function(qutils, createAndAppendDiv, Overlay, KeyCodes) {
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


	var oOverlay = new Overlay("myOverlay", {
		close: closeEventHandler,
		open: openEventHandler,
		openNew: openNewEventHandler
	});
	oOverlay.placeAt("uiArea1");
	sap.ui.getCore().applyChanges();



	QUnit.module("Appearance");

	QUnit.test("Overlay exists", function (assert) {
		assert.equal(true, true, "...");
		var oDomRef = oOverlay.getDomRef();
		assert.ok(oDomRef, "Rendered Overlay should exist in the page");
		assert.equal(oDomRef.className, "sapUiUx3Overlay", "Rendered Overlay should have the class 'sapUiUx3TI'");
	});

	QUnit.module("Behaviour");

	QUnit.test("OpenNew Event", function (assert) {
		assert.expect(1);
		qutils.triggerMouseEvent(oOverlay.$("openNew"), "click", 1, 1, 1, 1);
	});

	QUnit.test("OpenNew via Keyboard Event", function (assert) {
		assert.expect(2);
		qutils.triggerKeyboardEvent(oOverlay.getId() + "-openNew", KeyCodes.ENTER, false, false, false);
		qutils.triggerKeyboardEvent(oOverlay.getId() + "-openNew", KeyCodes.SPACE, false, false, false);
	});

	QUnit.test("Open Method", function (assert) {
		var done = assert.async();
		assert.expect(3);
		assert.ok(!oOverlay.isOpen(), "Rendered Overlay is not open");
		oOverlay.open();
		setTimeout(function () {
			assert.ok(oOverlay.isOpen(), "Rendered Overlay is open");
			done();
		}, 500);
	});

	// at the end close
	QUnit.test("Close Events", function (assert) {
		var done = assert.async();
		oOverlay.attachClose(function (oEvent) {
			assert.equal(oOverlay.getId(), oEvent.getParameter("id"), "Close event fired");
		});
		oOverlay.attachClosed(function (oEvent) {
			assert.equal(oOverlay.getId(), oEvent.getParameter("id"), "Closed event fired");
			assert.ok(!oOverlay.isOpen(), "Rendered Overlay is not open");
			done();
		});
		assert.expect(5);
		assert.ok(oOverlay.isOpen(), "Rendered Overlay is open");
		qutils.triggerMouseEvent(oOverlay.$("close"), "click", 1, 1, 1, 1);
	});


	QUnit.test("Destroy and remove control", function (assert) {
		oOverlay.destroy();
		sap.ui.getCore().applyChanges();
		var oDomRef = oOverlay.getDomRef();
		assert.ok(!oDomRef, "Rendered Overlay should not exist in the page after destruction");
	});
});