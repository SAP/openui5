/*global QUnit */
sap.ui.define([
    "sap/ui/qunit/QUnitUtils",
    "sap/ui/qunit/utils/createAndAppendDiv",
    "sap/ui/ux3/OverlayDialog",
    "sap/ui/commons/Button"
], function(qutils, createAndAppendDiv, OverlayDialog, Button) {
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

	QUnit.module("Appearance", {
		beforeEach: function () {
			this.oOverlayDialog = new OverlayDialog({
				close: closeEventHandler,
				open: openEventHandler,
				openNew: openNewEventHandler
			});
			this.oOverlayDialog.addContent(new Button(this.oOverlayDialog.getId() + "Button", { text: "Button for Content" }));
			this.oOverlayDialog.placeAt("uiArea1");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oOverlayDialog.destroy();
		}
	});

	QUnit.test("OverlayDialog exists", function (assert) {
		var oDomRef = this.oOverlayDialog.getDomRef();
		assert.ok(oDomRef, "Rendered OverlayDialog should exist in the page");
		assert.ok(oDomRef.classList.contains("sapUiUx3OD"), "Rendered OverlayDialog should have the class 'sapUiUx3OD'");
		assert.ok(oDomRef.classList.contains("sapUiUx3Overlay"), "Rendered OverlayDialog should have the class 'sapUiUx3Overlay'");
		oDomRef = this.oOverlayDialog.getDomRef("close");
		assert.ok(oDomRef, "close button should be rendered");
		oDomRef = this.oOverlayDialog.getDomRef("openNew");
		assert.ok(!oDomRef, "open new button should not be rendered");
	});

	QUnit.module("Behaviour", {
		beforeEach: function () {
			this.oOverlayDialog = new OverlayDialog({
				close: closeEventHandler,
				open: openEventHandler,
				openNew: openNewEventHandler
			});
			this.oOverlayDialog.addContent(new Button(this.oOverlayDialog.getId() + "Button", { text: "Button for Content" }));
			this.oOverlayDialog.placeAt("uiArea1");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oOverlayDialog.destroy();
		}
	});

	QUnit.test("Open Method", function (assert) {
		var done = assert.async();
		assert.expect(4);
		assert.ok(!this.oOverlayDialog.isOpen(), "Rendered OverlayDialog is not open");
		this.oOverlayDialog.open();
		assert.ok(this.oOverlayDialog.isOpen(), "Rendered OverlayDialog is open");
		setTimeout(() => {
			assert.ok(this.oOverlayDialog.getId() + "Button" ? window.document.getElementById(this.oOverlayDialog.getId() + "Button") : null, "Rendered Content should exist in the page");
			done();
		}, 500);
	});

	// at the end close
	QUnit.test("Close Events", function (assert) {
		var done = assert.async();

		this.oOverlayDialog.attachClose((oEvent) => {
			assert.equal(this.oOverlayDialog.getId(), oEvent.getParameter("id"), "Close event fired");
		});
		this.oOverlayDialog.attachClosed((oEvent) => {
			assert.equal(this.oOverlayDialog.getId(), oEvent.getParameter("id"), "Closed event fired");
			assert.ok(!this.oOverlayDialog.isOpen(), "Rendered OverlayDialog is not open");
			done();
		});
		this.oOverlayDialog.open();
		assert.expect(6);
		assert.ok(this.oOverlayDialog.isOpen(), "Rendered OverlayDialog is open");
		qutils.triggerMouseEvent(this.oOverlayDialog.$("close"), "click", 1, 1, 1, 1);
	});

	QUnit.test("Destroy and remove control", function (assert) {
		this.oOverlayDialog.destroy();
		sap.ui.getCore().applyChanges();
		var oDomRef = this.oOverlayDialog.getDomRef();
		assert.ok(!oDomRef, "Rendered OverlayDialog should not exist in the page after destruction");
	});
});