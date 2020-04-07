/*global QUnit */
sap.ui.define([
	"sap/m/Button"
], function(Button) {
	"use strict";

	// Lock the Core.
	// This can be done anywhen after the Core has been loaded and executed, potentially
	// before it has been initialized
	sap.ui.getCore().lock();

	// create some UI that shows whether lock/unlock works or not
	var oButton = new Button({
		id : "button",
		text : "Click",
		tooltip : "This SAPUI5 Button should be 'locked' until the Core is explicitly unlocked"
	});

	/*
	 * the following is a workaround that applications can implement

	sap.ui.getCore().attachInitEvent(function() {
		// we have to use setTimeout as the unanted unlock happens just after init events have been processed
		setTimeout(function() {
			sap.ui.getCore().lock();
		}, 10);
	} );

	/* */

	QUnit.module("Check for Unlocked Core");

	QUnit.test("Control Events should be blocked depending on Core lock", function(assert) {
		var pressed = false;
		oButton.attachPress(function() {
			pressed = true;
		});

		assert.ok(!pressed, "Button must not have fired 'press' yet");
		jQuery("#button").trigger("focus").trigger("click");
		assert.ok(!pressed, "Button still must not have fired 'press'");

		sap.ui.getCore().unlock();

		assert.ok(!pressed, "Button still must not have fired 'press'");
		jQuery("#button").trigger("focus").trigger("tap");
		assert.ok(pressed, "Button should have fired 'press'");
	});

	sap.ui.getCore().attachInit(function() {
		// create content div
		var oDIV = document.createElement("div");
		oDIV.id = "content";
		document.body.appendChild(oDIV);

		oButton.placeAt("content");
		sap.ui.getCore().applyChanges();
	});

});