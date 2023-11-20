/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/commons/Splitter",
	"sap/ui/commons/library",
	"sap/ui/commons/Button",
	"sap/ui/thirdparty/jquery",
	"sap/ui/events/KeyCodes"
], function(qutils, createAndAppendDiv, Splitter, commonsLibrary, Button, jQuery, KeyCodes) {
	"use strict";

	// shortcut for sap.ui.commons.Orientation;
	var Orientation = commonsLibrary.Orientation;

	// prepare DOM
	document.body.insertBefore(createAndAppendDiv("uiArea1"), document.body.firstChild);
	var styleElement = document.createElement("style");
	styleElement.textContent =
		"/* Keep appearing scrollbar from messing up our tests... */" +
		"html {" +
		"    overflow: scroll;" +
		"}";
	document.head.appendChild(styleElement);


	var oSplitter = new Splitter("mySplitter");
	oSplitter.setHeight("300px");
	//oSplitter.setWidth("300px");
	oSplitter.setSplitterOrientation(Orientation.Vertical);
	oSplitter.setSplitterPosition("15%");

	var otBtn1 = new Button({text: "Top SP"});
	oSplitter.addFirstPaneContent(otBtn1);
	var otBtn2 = new Button({text: "Top SP"});
	oSplitter.addFirstPaneContent(otBtn2);
	var otBtn3 = new Button({text: "Top SP"});
	oSplitter.addFirstPaneContent(otBtn3);

	var otBtn19 = new Button({text: "Top SP"});
	oSplitter.addSecondPaneContent(otBtn19);
	var otBtn29 = new Button({text: "Top SP"});
	oSplitter.addSecondPaneContent(otBtn29);
	var otBtn39 = new Button({text: "Top SP"});
	oSplitter.addSecondPaneContent(otBtn39);


	var oSplitter1 = new Splitter("mySplitter2");
	oSplitter1.setSplitterOrientation(Orientation.Horizontal);
	oSplitter1.setHeight("300px");
	//oSplitter1.setWidth("300px");
	oSplitter1.setSplitterPosition("50%");
	oSplitter1.setMinSizeFirstPane("20%");
	oSplitter1.setMinSizeSecondPane("40%");

	var otBtn11 = new Button({text: "Top SP"});
	oSplitter1.addFirstPaneContent(otBtn11);
	var otBtn21 = new Button({text: "Top SP"});
	oSplitter1.addFirstPaneContent(otBtn21);
	var otBtn31 = new Button({text: "Top SP"});
	oSplitter.addFirstPaneContent(otBtn31);

	var otBtn191 = new Button({text: "Top SP"});
	oSplitter1.addSecondPaneContent(otBtn191);
	var otBtn291 = new Button({text: "Top SP"});
	oSplitter1.addSecondPaneContent(otBtn291);
	var otBtn391 = new Button({text: "Top SP"});
	oSplitter1.addSecondPaneContent(otBtn391);

	oSplitter.placeAt("uiArea1");
	oSplitter1.placeAt("uiArea1");



	QUnit.module("Splitter");
	oSplitter = sap.ui.getCore().getControl("mySplitter");
	oSplitter1 = sap.ui.getCore().getControl("mySplitter2");
	QUnit.test("basic splitter examples", function(assert) {
		assert.equal( oSplitter.getSplitterOrientation(), Orientation.Vertical, "We expect value to be vertical" );
		assert.equal( oSplitter.getSplitterPosition(), "15%", "We expect value to be 15%" );
		assert.equal( oSplitter.getMinSizeFirstPane(), "0%", "We expect value to be 0%" );
		assert.equal( oSplitter.getMinSizeSecondPane(), "0%", "We expect value to be 0%" );
		assert.equal( oSplitter.getWidth(), "100%", "We expect value to be 100%" );
		assert.equal( oSplitter.getHeight(), "300px", "We expect value to be 300px" );
		assert.equal( oSplitter1.getSplitterOrientation(), Orientation.Horizontal, "We expect value to be horizontal" );
		assert.equal( oSplitter1.getSplitterPosition(), "50%", "We expect value to be 50%" );
		assert.equal( oSplitter1.getMinSizeFirstPane(), "20%", "We expect value to be 20%" );
		assert.equal( oSplitter1.getMinSizeSecondPane(), "40%", "We expect value to be 40%" );
		assert.equal( oSplitter1.getWidth(), "100%", "We expect value to be 100%" );
		assert.equal( oSplitter1.getHeight(), "300px", "We expect value to be 300px" );
	});

	QUnit.test("resize splitter bar1", function(assert) {
		var oldPosPercent = oSplitter.sBarPosition;
		var oldWidthFP = jQuery(oSplitter.firstPane).width();
		var oldWidthSP = jQuery(oSplitter.secondPane).width();
		qutils.triggerMouseEvent(oSplitter.splitterBar, "mousedown");
		var pageX = oSplitter.splitterBar.offsetLeft + 30;
		var pageY = oSplitter.splitterBar.offsetTop;
		qutils.triggerMouseEvent(oSplitter.splitterBar, "mousemove", 1, 1, pageX, pageY );
		// check if ghost bar is there
		var ghost = document.getElementById(oSplitter.getId() + "_ghost");
		assert.ok(ghost, "Ghost bar check");
		assert.equal(ghost.offsetLeft, pageX, "Ghost bar X position");
		assert.equal(ghost.offsetTop, pageY, "Ghost bar Y position");
		qutils.triggerMouseEvent(oSplitter.splitterBar, "mouseup", 1, 1, pageX, pageY );
		// check if ghost bar is removed again
		ghost = document.getElementById(oSplitter.getId() + "_ghost");
		assert.equal(ghost, null, "Ghost bar check");
		// check splitter pos
		assert.equal( oSplitter.getSplitterOrientation(), Orientation.Vertical, "We expect value to be vertical" );
		assert.equal( oSplitter.getSplitterPosition(), oSplitter.sBarPosition + "%", "updated splitter pos " );
		assert.equal( oSplitter.getMinSizeFirstPane(), "0%", "We expect value to be 0%" );
		assert.equal( oSplitter.getMinSizeSecondPane(), "0%", "We expect value to be 0%" );
		assert.equal( oSplitter.getWidth(), "100%", "We expect value to be 100%" );
		assert.equal( oSplitter.getHeight(), "300px", "We expect value to be 300px" );
		assert.ok(oldPosPercent < oSplitter.sBarPosition, "bar position comparison");
		assert.ok(oldWidthFP < jQuery(oSplitter.firstPane).width(), "pane width comparison");
		assert.ok(oldWidthSP > jQuery(oSplitter.secondPane).width(), "pane width comparison");
	});

	QUnit.test("resize splitter bar2", function(assert) {
		var oldPosPercent = oSplitter1.sBarPosition;
		var oldHeightFP = jQuery(oSplitter1.firstPane).height();
		var oldHeightSP = jQuery(oSplitter1.secondPane).height();
		qutils.triggerMouseEvent(oSplitter1.splitterBar, "mousedown");
		var pageX = oSplitter1.splitterBar.offsetLeft;
		var pageY = oSplitter1.splitterBar.offsetTop - 20;
		qutils.triggerMouseEvent(oSplitter1.splitterBar, "mousemove", 1, 1, pageX, pageY );
		// check if ghost bar is there
		var ghost = document.getElementById(oSplitter1.getId() + "_ghost");
		assert.ok(ghost, "Ghost bar check");
		assert.equal(ghost.offsetLeft, pageX, "Ghost bar X position");
		assert.equal(ghost.offsetTop, pageY, "Ghost bar Y position");
		qutils.triggerMouseEvent(oSplitter1.splitterBar, "mouseup", 1, 1, pageX, pageY );
		// check if ghost bar is removed again
		ghost = document.getElementById(oSplitter1.getId() + "_ghost");
		assert.equal(ghost, null, "Ghost bar check");
		// check splitter pos
		assert.equal( oSplitter1.getSplitterPosition(), oSplitter1.sBarPosition + "%", "updated splitter pos " );
		assert.equal( oSplitter1.getSplitterOrientation(), Orientation.Horizontal, "We expect value to be horizontal" );
		assert.equal( oSplitter1.getMinSizeFirstPane(), "20%", "We expect value to be 20%" );
		assert.equal( oSplitter1.getMinSizeSecondPane(), "40%", "We expect value to be 40%" );
		assert.equal( oSplitter1.getWidth(), "100%", "We expect value to be 100%" );
		assert.equal( oSplitter1.getHeight(), "300px", "We expect value to be 300px" );
		assert.ok(oldPosPercent > oSplitter1.sBarPosition, "bar position comparison");
		assert.ok(oldHeightFP > jQuery(oSplitter1.firstPane).height(), "pane height comparison");
		assert.ok(oldHeightSP < jQuery(oSplitter1.secondPane).height(), "pane height comparison");
	});

	QUnit.test("resize splitter bar over max", function(assert) {
		qutils.triggerMouseEvent(oSplitter1.splitterBar, "mousedown");
		var pageX = oSplitter1.splitterBar.offsetLeft;
		var pageY = oSplitter1.splitterBar.offsetTop + 300;
		qutils.triggerMouseEvent(oSplitter1.splitterBar, "mousemove", 1, 1, pageX, pageY );
		// check if ghost bar is there
		var ghost = document.getElementById(oSplitter1.getId() + "_ghost");
		assert.ok(ghost, "Ghost bar check");
		assert.equal(ghost.offsetLeft, pageX, "Ghost bar X position");
		assert.equal(ghost.offsetTop, pageY - 300, "Ghost bar Y position");
		qutils.triggerMouseEvent(oSplitter1.splitterBar, "mouseup", 1, 1, pageX, pageY );
		// check if ghost bar is removed again
		ghost = document.getElementById(oSplitter1.getId() + "_ghost");
		assert.equal(ghost, null, "Ghost bar check");
		assert.equal( oSplitter1.getSplitterOrientation(), Orientation.Horizontal, "We expect value to be horizontal" );
		assert.equal( oSplitter1.getMinSizeFirstPane(), "20%", "We expect value to be 20%" );
		assert.equal( oSplitter1.getMinSizeSecondPane(), "40%", "We expect value to be 40%" );
		assert.equal( oSplitter1.getWidth(), "100%", "We expect value to be 100%" );
		assert.equal( oSplitter1.getHeight(), "300px", "We expect value to be 300px" );
		// check splitter pos should be 100 - min size second pane
		assert.equal( oSplitter1.getSplitterPosition(), "60%", "updated splitter pos" );
	});

	QUnit.test("hide splitter bar", function(assert) {
		var oldPosPercent = oSplitter.sBarPosition;
		var oldWidthFP = jQuery(oSplitter.firstPane).width();
		var oldWidthSP = jQuery(oSplitter.secondPane).width();
		assert.ok(oSplitter.getSplitterBarVisible(), "splitter bar visible");
		oSplitter.setSplitterBarVisible(false);
		assert.ok(!oSplitter.getSplitterBarVisible(), "splitter bar invisible");

		// check splitter pos
		assert.equal( oSplitter.getSplitterOrientation(), Orientation.Vertical, "We expect value to be vertical" );
		assert.equal( oSplitter.getSplitterPosition(), oSplitter.sBarPosition + "%", "updated splitter pos " );
		assert.equal( oSplitter.getMinSizeFirstPane(), "0%", "We expect value to be 0%" );
		assert.equal( oSplitter.getMinSizeSecondPane(), "0%", "We expect value to be 0%" );
		assert.equal( oSplitter.getWidth(), "100%", "We expect value to be 100%" );
		assert.equal( oSplitter.getHeight(), "300px", "We expect value to be 300px" );
		assert.ok(oldPosPercent == oSplitter.sBarPosition, "bar position comparison");
		assert.ok(oldWidthFP == jQuery(oSplitter.firstPane).width(), "pane width comparison");
		assert.ok(oldWidthSP == jQuery(oSplitter.secondPane).width(), "pane width comparison");

		oSplitter.setSplitterBarVisible(true);
		assert.ok(oSplitter.getSplitterBarVisible(), "splitter bar visible");

		// check splitter pos
		assert.equal( oSplitter.getSplitterOrientation(), Orientation.Vertical, "We expect value to be vertical" );
		assert.equal( oSplitter.getSplitterPosition(), oSplitter.sBarPosition + "%", "updated splitter pos " );
		assert.equal( oSplitter.getMinSizeFirstPane(), "0%", "We expect value to be 0%" );
		assert.equal( oSplitter.getMinSizeSecondPane(), "0%", "We expect value to be 0%" );
		assert.equal( oSplitter.getWidth(), "100%", "We expect value to be 100%" );
		assert.equal( oSplitter.getHeight(), "300px", "We expect value to be 300px" );
		assert.ok(oldPosPercent == oSplitter.sBarPosition, "bar position comparison");
		assert.ok(oldWidthFP == jQuery(oSplitter.firstPane).width(), "pane width comparison");
		assert.ok(oldWidthSP == jQuery(oSplitter.secondPane).width(), "pane width comparison");
	});

	QUnit.test("hide splitter bar2", function(assert) {
		var oldPosPercent = oSplitter1.sBarPosition;
		var oldHeightFP = jQuery(oSplitter1.firstPane).height();
		var oldHeightSP = jQuery(oSplitter1.secondPane).height();

		assert.ok(oSplitter.getSplitterBarVisible(), "splitter bar visible");
		oSplitter.setSplitterBarVisible(false);
		assert.ok(!oSplitter.getSplitterBarVisible(), "splitter bar invisible");

		// check splitter pos
		assert.equal( oSplitter1.getSplitterPosition(), oSplitter1.sBarPosition + "%", "updated splitter pos " );
		assert.equal( oSplitter1.getSplitterOrientation(), Orientation.Horizontal, "We expect value to be horizontal" );
		assert.equal( oSplitter1.getMinSizeFirstPane(), "20%", "We expect value to be 20%" );
		assert.equal( oSplitter1.getMinSizeSecondPane(), "40%", "We expect value to be 40%" );
		assert.equal( oSplitter1.getWidth(), "100%", "We expect value to be 100%" );
		assert.equal( oSplitter1.getHeight(), "300px", "We expect value to be 300px" );
		assert.ok(oldPosPercent == oSplitter1.sBarPosition, "bar position comparison");
		assert.ok(oldHeightFP == jQuery(oSplitter1.firstPane).height(), "pane height comparison");
		assert.ok(oldHeightSP == jQuery(oSplitter1.secondPane).height(), "pane height comparison");

		oSplitter.setSplitterBarVisible(true);
		assert.ok(oSplitter.getSplitterBarVisible(), "splitter bar visible");

		// check splitter pos
		assert.equal( oSplitter1.getSplitterPosition(), oSplitter1.sBarPosition + "%", "updated splitter pos " );
		assert.equal( oSplitter1.getSplitterOrientation(), Orientation.Horizontal, "We expect value to be horizontal" );
		assert.equal( oSplitter1.getMinSizeFirstPane(), "20%", "We expect value to be 20%" );
		assert.equal( oSplitter1.getMinSizeSecondPane(), "40%", "We expect value to be 40%" );
		assert.equal( oSplitter1.getWidth(), "100%", "We expect value to be 100%" );
		assert.equal( oSplitter1.getHeight(), "300px", "We expect value to be 300px" );
		assert.ok(oldPosPercent = oSplitter1.sBarPosition, "bar position comparison");
		assert.ok(oldHeightFP = jQuery(oSplitter1.firstPane).height(), "pane height comparison");
		assert.ok(oldHeightSP = jQuery(oSplitter1.secondPane).height(), "pane height comparison");
	});

	QUnit.test("keyboard Home check splitterBar", function(assert) {
		assert.equal( oSplitter1.getSplitterPosition(), "60%", "current splitter pos" );
		qutils.triggerKeyboardEvent(oSplitter1.splitterBar, KeyCodes.HOME, false, false, false);
		assert.equal( oSplitter1.getSplitterPosition(), "20%", "updated splitter pos" );
	});

	QUnit.test("keyboard End check splitterBar", function(assert) {
		assert.equal( oSplitter1.getSplitterPosition(), "20%", "current splitter pos" );
		qutils.triggerKeyboardEvent(oSplitter1.splitterBar, KeyCodes.END, false, false, false);
		assert.equal( oSplitter1.getSplitterPosition(), "60%", "updated splitter pos" );
	});

	QUnit.test("keyboard shift left right check splitterBar", function(assert) {
		var oldPos = jQuery(oSplitter.splitterBar).offset().left;
		var newPos;
		var oldPosPercent = oSplitter.sBarPosition;
		var oldWidthFP = jQuery(oSplitter.firstPane).width();
		var oldWidthSP = jQuery(oSplitter.secondPane).width();
		assert.equal( oSplitter.getSplitterPosition(), oSplitter.sBarPosition + "%", "current splitter pos" );
		qutils.triggerKeyboardEvent(oSplitter.splitterBar, KeyCodes.ARROW_LEFT, true, false, false);
		newPos = jQuery(oSplitter.splitterBar).offset().left;
		assert.equal( Math.round(oldPos - newPos), 10, "updated splitter pos" );
		qutils.triggerKeyboardEvent(oSplitter.splitterBar, KeyCodes.ARROW_LEFT, true, false, false);
		newPos = jQuery(oSplitter.splitterBar).offset().left;
		assert.equal( Math.round(oldPos - newPos), 20, "updated splitter pos" );
		assert.ok(oldPosPercent > oSplitter.sBarPosition, "bar position comparison");
		assert.ok(oldWidthFP > jQuery(oSplitter.firstPane).width(), "pane width comparison");
		assert.ok(oldWidthSP < jQuery(oSplitter.secondPane).width(), "pane width comparison");
		qutils.triggerKeyboardEvent(oSplitter.splitterBar, KeyCodes.ARROW_RIGHT, true, false, false);
		newPos = jQuery(oSplitter.splitterBar).offset().left;
		assert.equal( Math.round(oldPos - newPos), 10, "updated splitter pos" );
		qutils.triggerKeyboardEvent(oSplitter.splitterBar, KeyCodes.ARROW_RIGHT, true, false, false);
		newPos = jQuery(oSplitter.splitterBar).offset().left;
		assert.equal( Math.round(oldPos - newPos), 0, "updated splitter pos" );
	});

	QUnit.test("keyboard shift up down check splitterBar", function(assert) {
		var oldPos = jQuery(oSplitter1.splitterBar).offset().top;
		var newPos;
		var oldPosPercent = oSplitter1.sBarPosition;
		var oldHeightFP = jQuery(oSplitter1.firstPane).height();
		var oldHeightSP = jQuery(oSplitter1.secondPane).height();
		assert.equal( oSplitter1.getSplitterPosition(), oSplitter1.sBarPosition + "%", "current splitter pos" );
		qutils.triggerKeyboardEvent(oSplitter1.splitterBar, KeyCodes.ARROW_UP, true, false, false);
		newPos = jQuery(oSplitter1.splitterBar).offset().top;
		assert.equal( Math.round(oldPos - newPos), 10, "updated splitter pos" );
		qutils.triggerKeyboardEvent(oSplitter1.splitterBar, KeyCodes.ARROW_UP, true, false, false);
		newPos = jQuery(oSplitter1.splitterBar).offset().top;
		assert.equal( Math.round(oldPos - newPos), 20, "updated splitter pos" );
		assert.ok(oldPosPercent > oSplitter1.sBarPosition, "bar position comparison");
		assert.ok(oldHeightFP > jQuery(oSplitter1.firstPane).height(), "pane height comparison");
		assert.ok(oldHeightSP < jQuery(oSplitter1.secondPane).height(), "pane height comparison");
		qutils.triggerKeyboardEvent(oSplitter1.splitterBar, KeyCodes.ARROW_DOWN, true, false, false);
		newPos = jQuery(oSplitter1.splitterBar).offset().top;
		assert.equal( Math.round(oldPos - newPos), 10, "updated splitter pos" );
		qutils.triggerKeyboardEvent(oSplitter1.splitterBar, KeyCodes.ARROW_DOWN, true, false, false);
		newPos = jQuery(oSplitter1.splitterBar).offset().top;
		assert.equal( Math.round(oldPos - newPos), 0, "updated splitter pos" );
	});
});