/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/ux3/NavigationBar",
	"sap/ui/ux3/NavigationItem",
	"sap/ui/events/jquery/EventSimulation"
], function(qutils, createAndAppendDiv, NavigationBar, NavigationItem, EventSimulation) {
	"use strict";

	// prepare DOM
	createAndAppendDiv("uiArea1").setAttribute("style", "margin-top:10px;");
	var styleElement = document.createElement("style");
	styleElement.textContent =
		".sapUiUx3NavBarArrow {" +
		"	/* Enable testing of the arrow, even though it is not used outside the shell in BC */" +
		"	display: inline-block !important;" +
		"}" +
		"#uiArea1 {" +
		"	width: 500px;" +
		"}";
	document.head.appendChild(styleElement);



	// to make NavigationBar believe the device supports touch
	var origTouchEventMode = EventSimulation.touchEventMode;
	if (origTouchEventMode !== "ON") {
		EventSimulation.touchEventMode = "ON";
	}

	var oCtrl = new NavigationBar("n1").placeAt("uiArea1");

	EventSimulation.touchEventMode = origTouchEventMode; //Set touch event mode back to original value

	for (var i = 0; i < 5; i++) {
		oCtrl.addItem(new NavigationItem({text:"Item with a long title, so we have something to scroll 1"}));
	}

	QUnit.test("Initial Check", function(assert) {
		assert.ok(oCtrl, "NavBar should exist after creating");
		assert.ok(oCtrl.getDomRef(), "NavBar root element should exist in the page");
	});

	QUnit.test("Swiping", function(assert) {
		var done = assert.async();
		var oList = oCtrl.getDomRef("list");
		var iTouchPosX = 400;

		assert.equal(oList.scrollLeft, 0, "list should not be scrolled initially");

		// touch the bar
		qutils.triggerTouchEvent("touchstart", oList, {originalEvent:{touches:[{pageX:iTouchPosX}]}, touches:[{pageX:iTouchPosX}]});

		setTimeout(function(){
			// move the finger
			qutils.triggerTouchEvent("touchmove", oList, {originalEvent:{touches:[{pageX:(iTouchPosX - 100)}]}, touches:[{pageX:(iTouchPosX - 100)}]});

			assert.ok(oCtrl.$("off").is(":visible"), "forward arrow should be visible");
			assert.ok(oCtrl.$("ofb").is(":visible"), false, "back arrow should be visible");
			assert.equal(oList.scrollLeft, 100, "list should be scrolled now by 100px");

			setTimeout(function(){
				// move the finger further
				qutils.triggerTouchEvent("touchmove", oList, {originalEvent:{touches:[{pageX:(iTouchPosX - 200)}]}, touches:[{pageX:(iTouchPosX - 200)}]});

				assert.equal(oList.scrollLeft, 200, "list should be scrolled now by 200px");

				// remove the finger
				qutils.triggerTouchEvent("touchend", oList);

				assert.equal(oList.scrollLeft, 200, "list should still be scrolled now by 200px");

				setTimeout(function(){

					// verify that inertia scrolling has done its job
					var finalScrollLeft = oList.scrollLeft;
					assert.ok(finalScrollLeft > 200, "list should be scrolled now a bit further by inertia scrolling");

					setTimeout(function(){
						// verify that inertia scrolling has stopped
						assert.equal(oList.scrollLeft, finalScrollLeft, "list should be scrolled no further than before (inertia scrolling must have ended)");

						done();
					}, 500);
				}, 1000);
			}, 200);
		}, 200);
	});

});