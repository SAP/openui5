/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/thirdparty/jquery",
	"sap/ui/commons/Button",
	"sap/ui/commons/layout/MatrixLayout",
	"sap/ui/commons/Link",
	"sap/ui/commons/Callout",
	"sap/base/Log",
	"sap/ui/events/KeyCodes"
], function(
	qutils,
	createAndAppendDiv,
	jQuery,
	Button,
	MatrixLayout,
	Link,
	Callout,
	Log,
	KeyCodes
) {
	"use strict";

	// prepare DOM
	document.body.insertBefore(createAndAppendDiv("uiArea1"), document.body.firstChild);

	//Create controls

	var oButton,
		oLink,
		oLayout,
		oCallout;

	Log.setLevel(Log.Level.DEBUG);

	// the anchor
	oButton = new Button("CButton", {
		text: "Callout",
		lite: true,
		tooltip: "this tooltip should not appear"
	});

	// contents
	oLayout = new MatrixLayout({
		width: "200px",
		height: "200px"
	}).addStyleClass("center");

	for (var i = 1; i < 5; i++){
		oLink = new Link("clink_" + i, {
			text: "text" + i,
			href: ""
		}).addStyleClass("middle");
		oLayout.createRow(oLink);
	}

	// callout
	oCallout = new Callout("callout", {content: [oLayout]});

	// 3. Attach the Callout to a reference control
	oButton.setTooltip(oCallout);
	oButton.placeAt("uiArea1");

	// TEST functions

	QUnit.module("Appearance");

	QUnit.test("Assignment of elements", function(assert) {
		// Tooltip
		assert.equal(sap.ui.getCore().getControl("CButton").getTooltip().getId(),
				"callout", "Callou is assigned as a tooltip to a button");
	});

	function isCalloutVisible(){
		return jQuery("#callout").filter(":visible").size() > 0;
	}

	QUnit.module("Callout: open and close");
	QUnit.test("Open Callout", function(assert) {
		var done = assert.async();
		assert.ok(true, "A-sync OK start");
		qutils.triggerMouseEvent("CButton", "mouseover");
		setTimeout(function() {
			assert.ok(isCalloutVisible() == true, "Callout is visible after mouseover");
			qutils.triggerMouseEvent("callout", "mouseout");
			setTimeout(function() {
				assert.ok(isCalloutVisible() == false, "Callout is not visible after mouseout");
				done();
			}, 500);
		}, 900);
	});

	QUnit.test("Do not open Callout by fast mouse movement over the parent", function(assert) {
		var done = assert.async();
		assert.ok(true, "A-sync open/close start");
		qutils.triggerMouseEvent("CButton", "mouseover");
		setTimeout(function() {
			assert.ok(isCalloutVisible() == false, "Callout is not visible immediately after mouseover");
			qutils.triggerMouseEvent("CButton", "mouseout");
			setTimeout(function() {
				assert.ok(isCalloutVisible() == false, "Callout is not visible after mouseout");
				done();
			}, 500);
		}, 50);
	});

	QUnit.test("Close using close method", function(assert) {
		var done = assert.async();
		assert.ok(true, "A-sync close() start");
		qutils.triggerMouseEvent("CButton", "mouseover");
		setTimeout(function() {
			assert.ok(isCalloutVisible() == true, "Callout is visible after mouseover");
			oCallout.close();
			setTimeout(function() {
				assert.ok(isCalloutVisible() == false, "Callout is not visible after close()");
				done();
			}, 400);
		}, 900);
	});


	QUnit.test("Opened and closed events", function(assert) {
		var done = assert.async();
		// Randomize number of attempts
		var iRepetitions = 2;
		// Delay must be >= 700 (Tooltipbase open delay (500) + animation duration (200)).
		var iDelay = 700;

		// Count the number of times the open and close events should be triggered and
		// how often they were actually triggered.
		var mCounter = {
			open   : 0,
			opened : 0,
			close  : 0,
			closed : 0
		};

		// Count the number of times the opened-event was fired
		oCallout.attachOpened(function() {
			mCounter.opened++;
		});
		// Count the number of times the closed-event was fired
		oCallout.attachClosed(function() {
			mCounter.closed++;
		});

		var iChecked = 0;
		var bOpen = false;
		var fnCheck = function() {
			if (bOpen) {
				// Trigger Callout close by moving the mouse away from the button
				qutils.triggerMouseEvent("CButton", "mouseout");
				mCounter.close++;
			} else {
				// Trigger Callout open by moving the mouse onto the button
				qutils.triggerMouseEvent("CButton", "mouseover");
				mCounter.open++;
			}
			bOpen = !bOpen;


			iChecked++;
			if (iChecked < iRepetitions * 2) {
				// Number of repetitions not reached, call this function again.
				setTimeout(fnCheck, iDelay);
			} else {
				// Wait for the last events to be fired, then call the funtion that evaluates
				// whether the numbers are correct.
				setTimeout(function() {
					assert.ok(
						mCounter.open === iRepetitions,
						"Callout was opened " + mCounter.open + " times. (Should be " + iRepetitions + ")"
					);
					assert.ok(
						mCounter.close === iRepetitions,
						"Callout was closed " +  mCounter.close + " times. (Should be " + iRepetitions + ")"
					);

					assert.ok(
						mCounter.open === mCounter.opened,
						"Opened event fired as often as open occurred. (" + mCounter.open + "/" + mCounter.opened + ")"
					);
					assert.ok(
						mCounter.close === mCounter.closed,
						"Closed event fired as often as close occurred. (" + mCounter.close + "/" + mCounter.closed + ")"
					);
					done();
				}, iDelay + 50);
			}
		};

		fnCheck();
	});


	QUnit.module("Callout: keyboard navigation");
	QUnit.test("Initial Focus", function(assert) {
		var done = assert.async();
		oButton.focus();
		assert.ok(document.activeElement.id == "CButton", "Focus the button initially");
		qutils.triggerKeyboardEvent("CButton", KeyCodes.I, false, false, true);
		setTimeout(function(){
			assert.ok(isCalloutVisible() == true, "Callout is visible after Ctrl-I");
			assert.equal(document.activeElement.id, "clink_1", "The first link should be focused after the Callout is opened with keyboard");
			//close it
			qutils.triggerKeyboardEvent(document.activeElement.id, KeyCodes.ESCAPE, false, false, false);
			setTimeout(function(){
				assert.ok(isCalloutVisible() == false, "Callout is not visible after Esc");
				assert.equal(document.activeElement.id, "CButton", "The parent element should be focused after the focused Callout is closed");
				done();
			}, 500); // CLOSE
		}, 500); // OPEN
	});
});