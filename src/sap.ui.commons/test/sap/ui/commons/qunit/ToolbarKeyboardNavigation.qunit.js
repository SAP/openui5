/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/commons/library",
	"sap/ui/commons/Toolbar",
	"sap/ui/thirdparty/jquery",
	"sap/ui/commons/Button",
	"sap/ui/events/KeyCodes"
], function(qutils, createAndAppendDiv, commonsLibrary, Toolbar, jQuery, Button, KeyCodes) {
	"use strict";

	// shortcut for sap.ui.commons.ToolbarDesign
	var ToolbarDesign = commonsLibrary.ToolbarDesign;


	// prepare DOM
	createAndAppendDiv("content").setAttribute("style", "width: 100%");



	// Please bare in mind that keyboard navigation MUST NOT be debuged via dev tool console, because once the focus goes into the debugger
	// it get lost from the app. Use console.log instead.
	// During text execution switching focus outside the browser may cause tests to fail.
	// ==================================================
	// test fixture for control properties and events
	// ==================================================
	var bVisible = true,
		iWidth = 300,
		sWidth = iWidth + "px",
		oDesign = ToolbarDesign.Flat,
		bStandalone = true;


	var sToolbarId = "Toolbar";
	var oToolbar = new Toolbar(sToolbarId, {
		visible: bVisible,
		width: sWidth,
		design: oDesign,
		standalone: bStandalone
	});

	oToolbar.placeAt("content");

	var oCtrl;
	function initToolbar() {
		oCtrl.setVisible(bVisible);
		oCtrl.setWidth(sWidth);
		oCtrl.setDesign(oDesign);
		oCtrl.setStandalone(bStandalone);
		oCtrl.destroyItems();
		oCtrl.destroyRightItems();// because the same control is used again instead of creating a new Toolbar for each test
		sap.ui.getCore().applyChanges();
	}

	// ==================================================
	// async4_itemNavigation
	// ==================================================

	QUnit.module("Item Navigation", {
		beforeEach: function (assert) {
			oCtrl = sap.ui.getCore().getControl(sToolbarId);
			assert.notStrictEqual(oCtrl, null, "oCtrl must exist");
			assert.notStrictEqual(oCtrl.getDomRef(), null, "Toolbar DomRef must exist");
			initToolbar();
		},
		afterEach: function () {
			oCtrl = null;
		}
	});

	QUnit.test("hidden buttons (visible=false) does not break the navigation", function (assert) {
		var done = assert.async();
		var oButtonA = new Button({text: "A", width: "50px"});
		var oButtonB = new Button({text: "B", width: "50px", enabled: false});
		var oButtonC = new Button({text: "C", width: "50px", visible: false, enabled: false});
		var oButtonD = new Button({text: "D", width: "50px"});
		var oButtonE = new Button({text: "E", width: "50px", enabled: false});
		var oButtonF = new Button({text: "F", width: "50px"});
		var oButtonG = new Button({text: "G", width: "50px", visible: false});

		var sOriginalWidth = jQuery("#content").css("width");

		oCtrl.setWidth("400px");
		oCtrl.addItem(oButtonA).addItem(oButtonB).addItem(oButtonC);
		oCtrl.addRightItem(oButtonD).addRightItem(oButtonE).addRightItem(oButtonF).addRightItem(oButtonG);
		sap.ui.getCore().applyChanges();

		// Iterating through A-F buttons forth and back and check:
		// - invisible buttons don't mess up the navigation chain
		// - disabled buttons are part of the navigation chain
		// - all other buttons gets focus (are part of hte navigation chain) in the expected order
		setTimeout(function () {
			jQuery(oCtrl.getDomRef()).trigger("focus");
			setTimeout(function () {
				clickRightArrow(oButtonA);
				setTimeout(function () {
					assertFocusedElement(assert, oButtonB, "The focus must be on button B although it is disabled");
					clickRightArrow(oButtonB);
					setTimeout(function () {
						assertFocusedElement(assert, oButtonD, "The focus must be on button D, because C is skipped (not visible)");
						clickRightArrow(oButtonD);
						setTimeout(function () {
							assertFocusedElement(assert, oButtonE, "The focus must be on button E although it is disabled");
							clickRightArrow(oButtonE);
							setTimeout(function () {
								assertFocusedElement(assert, oButtonF, "The focus must be on button F");
								// ---------- Going back --------
								clickLeftArrow(oButtonF);
								setTimeout(function () {
									assertFocusedElement(assert, oButtonE, "The focus must be on button E although it is disabled");
									clickLeftArrow(oButtonE);
									setTimeout(function () {
										assertFocusedElement(assert, oButtonD, "The focus must be on button D");
										clickLeftArrow(oButtonD);
										setTimeout(function () {
											assertFocusedElement(assert, oButtonB, "The focus must be on button B, because C is skipped (not visible)");
											clickLeftArrow(oButtonB);
											setTimeout(function () {
												assertFocusedElement(assert, oButtonA, "The focus must be on button A");
												jQuery("#content").css("width", sOriginalWidth);
												done();
											}, 100);
										}, 100);
									}, 100);
								}, 100);
							}, 100);
						}, 100);
					}, 100);
				}, 100);
			}, 100);
		}, 500);
	});

	QUnit.test("Down arrow on overflow button opens the overflow popup", function (assert) {
		var done = assert.async();
		var sOriginalWidth = jQuery("#content").css("width");
		oCtrl.setWidth("300px");

		oCtrl.addItem(new Button("testButton0", {"text": "Test", "width": "200px"}));
		oCtrl.addItem(new Button("testButton1", {
			"text": "Test button into the overflow",
			"width": "200px"
		}));

		var sOverflowButtonId = sToolbarId + "-mn";
		clickDownArrow(sOverflowButtonId);
		setTimeout(function () {
			assert.strictEqual(jQuery(getPopupDomRef()).css("visibility"), "visible", "Overflow popup should be visible");
			jQuery("#content").css("width", sOriginalWidth);
			done();
		}, 100);
	});

	// BCP: 1580009795
	QUnit.skip("Right item retain its tabindex attribute after visibility switch", function (assert) {
		var done = assert.async();
		var oButtonRightItem = new Button({text: 'Right Item'});
		oCtrl.addRightItem(oButtonRightItem);

		setTimeout(function () {
			oButtonRightItem.$().trigger("focus");
			assertFocusedElement(assert, oButtonRightItem, "As prerequisite for the test, the right item button must have a focus.");
			oCtrl.setVisible(false);
			setTimeout(function () {
				oCtrl.setVisible(true);
				setTimeout(function () {
					var iTabIndex = oCtrl.getRightItems()[0].$().attr("tabindex");
					assert.strictEqual(iTabIndex, '0', "After toggle toolbar visibility off->on, the right item must have tabindex='0'");
					done();
				}, 500);
			}, 500);
		}, 500);
	});

	//------------------------------------------
	// helper functions
	//------------------------------------------
	function clickRightArrow(target) {
		var oDomRef = typeof target == "string" ? document.getElementById(target) : target.getDomRef();
		qutils.triggerKeydown(oDomRef, KeyCodes.ARROW_RIGHT, false, false, false);
	}
	function clickLeftArrow(target) {
		var oDomRef = typeof target == "string" ? document.getElementById(target) : target.getDomRef();
		qutils.triggerKeydown(oDomRef, KeyCodes.ARROW_LEFT, false, false, false);
	}
	function clickDownArrow(target) {
		var oDomRef = typeof target == "string" ? document.getElementById(target) : target.getDomRef();
		qutils.triggerKeydown(oDomRef, KeyCodes.ARROW_DOWN, false, false, false);
	}
	function assertFocusedElement(assert, oExpectedFocusedControl, sMessage) {
		var oExpectedElement = oExpectedFocusedControl.getFocusDomRef();
		var oActiveElement = document.activeElement;

		assert.equal("id=" + oActiveElement.id + ", text=" + oActiveElement.innerText, "id=" + oExpectedElement.id + ", text=" + oExpectedElement.innerText, sMessage);
	}

	function getPopupDomRef() {
		var child = oToolbar.getDomRef("pu");
		if (child) {
			return child.parentNode;
		} else {
			return null;
		}
	}
});