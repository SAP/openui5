/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/commons/library",
	"sap/ui/commons/Toolbar",
	"sap/ui/thirdparty/jquery",
	"sap/ui/commons/Button",
	"sap/ui/layout/HorizontalLayout",
	"sap/ui/commons/ToolbarSeparator"
], function(
	createAndAppendDiv,
	commonsLibrary,
	Toolbar,
	jQuery,
	Button,
	HorizontalLayout,
	ToolbarSeparator
) {
	"use strict";

	// shortcut for sap.ui.commons.ToolbarSeparatorDesign
	var ToolbarSeparatorDesign = commonsLibrary.ToolbarSeparatorDesign;

	// shortcut for sap.ui.commons.ToolbarDesign
	var ToolbarDesign = commonsLibrary.ToolbarDesign;


	// prepare DOM
	createAndAppendDiv("content");



	// ==================================================
	// test fixture for control properties and events
	// ==================================================
	var bVisible = true,
		iWidth = 300,
		sWidth = iWidth + "px",
		oDesign = ToolbarDesign.Flat,
		bStandalone = true;


	var oToolbar = new Toolbar("Toolbar", {
		visible:bVisible,
		width:sWidth,
		design:oDesign,
		standalone:bStandalone
	});

	oToolbar.placeAt("content");

	var oCtrl;
	function initToolbar() {
		oCtrl.setVisible(bVisible);
		oCtrl.setWidth(sWidth);
		oCtrl.setDesign(oDesign);
		oCtrl.setStandalone(bStandalone);
		oCtrl.destroyItems();// because the same control is used again instead of creating a new Toolbar for each test
		sap.ui.getCore().applyChanges();
	}

	QUnit.module("Basic", {
		beforeEach: function(assert) {
			oCtrl = sap.ui.getCore().getControl("Toolbar");
			assert.ok(oCtrl);
			assert.ok(document.getElementById("Toolbar"));
			initToolbar();
		},
		afterEach: function() {
			oCtrl = null;
		}
	});

	// ==================================================
	// test property accessor methods
	// ==================================================


	/**
	 * Tests accessor method for property visible of control Toolbar.
	 */
	QUnit.test("VisibleOk", function(assert) {
		assert.strictEqual(oCtrl.getVisible(), bVisible);
	});

	/**
	 * Tests accessor method for property width of control Toolbar.
	 */
	QUnit.test("WidthOk", function(assert) {
		assert.strictEqual(oCtrl.getWidth(), sWidth);
	});

	/**
	 * Tests accessor method for property design of control Toolbar.
	 */
	QUnit.test("DesignOk", function(assert) {
		assert.strictEqual(oCtrl.getDesign(), oDesign);
	});

	/**
	 * Tests accessor method for property standalone of control Toolbar.
	 */
	QUnit.test("StandaloneOk", function(assert) {
		assert.strictEqual(oCtrl.getStandalone(), bStandalone);
	});


	// ==================================================
	// better tests of properties
	// ==================================================

	/**
	 * Test actual visibility
	 */
	QUnit.test("Visibility", function(assert) {
		assert.ok(document.getElementById("Toolbar"), "Toolbar should exist in page");
		oCtrl.setVisible(false);
		sap.ui.getCore().applyChanges();
		assert.equal(document.getElementById("Toolbar"), null, "Toolbar should not be rendered when set to invisible");
		oCtrl.setVisible(true);
		sap.ui.getCore().applyChanges();
		assert.ok(document.getElementById("Toolbar"), "Toolbar should exist in page");
	});

	/**
	 * Test actual width
	 */
	QUnit.test("Width", function(assert) {
		assert.strictEqual(document.getElementById("Toolbar").offsetWidth, iWidth, "actual width is wrong");
		oCtrl.setWidth("401px");
		sap.ui.getCore().applyChanges();
		assert.strictEqual(document.getElementById("Toolbar").offsetWidth, 401, "actual width is wrong after change");
		oCtrl.setWidth(sWidth);
		sap.ui.getCore().applyChanges();
		assert.strictEqual(document.getElementById("Toolbar").offsetWidth, iWidth, "actual width is wrong after change");
	});

	/**
	 * Test Toolbar designs
	 */
	QUnit.test("ToolbarDesigns", function(assert) {
		var oRootDomRef = document.getElementById("Toolbar");

		// make sure the initial design is "Flat"
		assert.notStrictEqual(oRootDomRef.className.indexOf("sapUiTbDesignFlat"), -1, "Panel must have sapUiTbDesignFlat");
		assert.strictEqual(oRootDomRef.className.indexOf("sapUiTbDesignTransparent"), -1, "Panel must not have sapUiTbDesignTransparent");
		assert.strictEqual(oRootDomRef.className.indexOf("sapUiTbDesignStandard"), -1, "Panel must not have sapUiTbDesignStandard");

		// now switch to "Transparent" and do the same tests
		oCtrl.setDesign(ToolbarDesign.Transparent);
		sap.ui.getCore().applyChanges();
		var oRootDomRef2 = oCtrl.getDomRef();

		// make sure the change worked
		assert.notStrictEqual(oRootDomRef2.className.indexOf("sapUiTbDesignTransparent"), -1, "Panel must have sapUiTbDesignTransparent");
		assert.strictEqual(oRootDomRef2.className.indexOf("sapUiTbDesignFlat"), -1, "Panel must not have sapUiTbDesignFlat");
		assert.strictEqual(oRootDomRef2.className.indexOf("sapUiTbDesignStandard"), -1, "Panel must not have sapUiTbDesignStandard");

		// make sure it is actually transparent
		assert.strictEqual(normalizeColor(jQuery(oRootDomRef2).css("backgroundColor")), "rgba(0,0,0,0)", "Panel root must be transparent");
		assert.strictEqual(normalizeColor(jQuery(oRootDomRef2.firstChild).css("backgroundColor")), "rgba(0,0,0,0)", "Panel firstChild must be transparent");
		assert.strictEqual(normalizeColor(jQuery(oRootDomRef2.firstChild.firstChild).css("backgroundColor")), "rgba(0,0,0,0)", "Panel second-level child must be transparent");

		// now switch back to "Flat"
		oCtrl.setDesign(ToolbarDesign.Flat);
		sap.ui.getCore().applyChanges();
		var oRootDomRef3 = oCtrl.getDomRef();

		// make sure the design is "Flat" again
		assert.notStrictEqual(oRootDomRef3.className.indexOf("sapUiTbDesignFlat"), -1, "Panel must have sapUiTbDesignFlat");
		assert.strictEqual(oRootDomRef3.className.indexOf("sapUiTbDesignTransparent"), -1, "Panel must not have sapUiTbDesignTransparent");
		assert.strictEqual(oRootDomRef3.className.indexOf("sapUiTbDesignStandard"), -1, "Panel must not have sapUiTbDesignStandard");
	});

	/**
	 * Test standalone mode
	 */
	QUnit.test("StandaloneMode", function(assert) {
		// make sure the class sapUiTbStandalone is there
		assert.notStrictEqual(document.getElementById("Toolbar").className.indexOf("sapUiTbStandalone"), -1, "Panel must have sapUiTbStandalone");

		// now switch to not-standalone mode
		oCtrl.setStandalone(false);
		sap.ui.getCore().applyChanges();
		assert.strictEqual(document.getElementById("Toolbar").className.indexOf("sapUiTbStandalone"), -1, "Panel must not have sapUiTbStandalone");

		// ...and back again
		oCtrl.setStandalone(true);
		sap.ui.getCore().applyChanges();
		assert.notStrictEqual(document.getElementById("Toolbar").className.indexOf("sapUiTbStandalone"), -1, "Panel must have sapUiTbStandalone");
	});


	// ==================================================
	//		          test "Items" aggregation
	// ==================================================

	QUnit.test("InitialItems", function(assert) {
		assert.strictEqual(oCtrl.getItems().length, 0, "Toolbar may not have any items initially");
	});

	QUnit.test("AddOneItem", function(assert) {
		var oBtn = new Button("testButton", {"text":"Test"});
		oCtrl.addItem(oBtn);
		assert.strictEqual(oCtrl.getItems().length, 1, "Toolbar does not have the added item");
		assert.strictEqual(oCtrl.getItems()[0].getId(), "testButton", "Toolbar does not have the added item");
	});

	QUnit.test("TolerantTypeCheckForItems", function(assert) {
		var oItem = new HorizontalLayout();
		oCtrl.addItem(oItem);
		oCtrl.removeItem(oItem);
		// the above simply must not throw exceptions
		// assertions could be checked but optimizer might remove them
		assert.ok(true, "must not throw exception for aggregations with interface types");
		oItem.destroy();
		sap.ui.getCore().applyChanges();
	});

	/**
	 * Test how the toolbar adapts to its surroundings (width-wise)
	 */
	QUnit.test("ToolbarAssumesOuterWidth", function(assert) {
		var uiArea = document.getElementById("content");
		uiArea.style.width = "600px"; // make the parent div have a defined size

		// check whether the "auto"-mode toolbar adapts to the parent
		oCtrl.setWidth("auto");
		sap.ui.getCore().applyChanges();
		assert.strictEqual(oCtrl.getDomRef().offsetWidth, 600, "Toolbar width should be adapted to parent DOM element");

		// clean up
		uiArea.style.width = "auto";
		oCtrl.setWidth(sWidth);
		sap.ui.getCore().applyChanges();
	});

	QUnit.test("Inner toolbar container has id", function(assert) {
		var sExpectedId = oCtrl.getId() + "-inner";
		assert.ok(document.getElementById(sExpectedId), "The inner container must has an id [" + sExpectedId + "]");
	});

	// ==================================================
	// async1_addItems
	// ==================================================

	QUnit.module("Overflow by addItems", {
		beforeEach: function(assert) {
			oCtrl = sap.ui.getCore().getControl("Toolbar");
			assert.notStrictEqual(oCtrl, null, "oCtrl must exist");
			assert.notStrictEqual(document.getElementById("Toolbar"), null, "Toolbar DomRef must exist");
			initToolbar();
		},
		afterEach: function() {
			oCtrl = null;
		}
	});

	/**
	 * Toolbar is 300px(sWidth) wide; add one button of 100px width (which will not cause overflow for reasonable margins etc.)
	 */
	QUnit.test("AddItemsUntilOverflowButtonAppears", function(assert) {
		var done = assert.async();
		oCtrl = sap.ui.getCore().getControl("Toolbar");
		assert.notStrictEqual(oCtrl, null, "oCtrl must exist");

		assert.strictEqual(oCtrl.getDomRef().offsetWidth, iWidth, "Toolbar width is wrong");
		setTimeout(function() {
			verifyOverflowButtonIsNotVisible(assert, "none", "Overflow button may not be visible initially");

			// add a button that surely fits
			var oBtn = new Button("testButton", {"text":"Test","width":"100px"});
			oCtrl.addItem(oBtn);
			sap.ui.getCore().applyChanges();
			setTimeout(function() {
				verifyOverflowButtonIsNotVisible(assert, "Overflow button may not be visible with only one small item in the toolbar");
				done();
			}, 100);
		}, 400);
	});

	QUnit.test("AddItemsUntilOverflowButtonAppears2", function(assert) {
		var done = assert.async();
		var oBtn1 = new Button("testButton1", {"text":"Test","width":"100px"});
		// add a large button that surely causes overflow
		var oBtn2 = new Button("testButton2", {"text":"Test","width":"201px"});
		oCtrl.addItem(oBtn1);
		oCtrl.addItem(oBtn2);
		sap.ui.getCore().applyChanges();
		setTimeout(function() {
			verifyOverflowButtonIsVisible(assert, "block", "Overflow button must be visible when the items are larger than the toolbar width");
			done();
		}, 100);
	});

	QUnit.test("AddItemsUntilOverflowButtonAppears2_InvisibleItemsDontCount", function(assert) {
		var done = assert.async();
		var oBtn1 = new Button("testButton1", {"text":"Test","width":"100px"});
		// add a large button that would have caused overflow if not invisible
		var oBtn2 = new Button("testButton2", {"text":"Test","width":"201px", "visible" : false});
		oCtrl.addItem(oBtn1);
		oCtrl.addItem(oBtn2);
		sap.ui.getCore().applyChanges();
		setTimeout(function() {
			verifyOverflowButtonIsNotVisible(assert, "Overflow button must not be visible when adding invisible item(s)");
			done();
		}, 100);
	});

	QUnit.test("AddItemsUntilOverflowButtonAppears3", function(assert) {
		var done = assert.async();
		// remove last item again
		var oBtn1 = new Button("testButton1", {"text":"Test","width":"100px"});
		var oBtn2 = new Button("testButton2", {"text":"Test","width":"201px"});
		oCtrl.addItem(oBtn1);
		oCtrl.addItem(oBtn2);
		sap.ui.getCore().applyChanges();
		oCtrl.removeItem(1);
		sap.ui.getCore().applyChanges();
		setTimeout(function() {
			verifyOverflowButtonIsNotVisible(assert, "Overflow button may not be visible after removing the long button");
			oBtn2.destroy();
			sap.ui.getCore().applyChanges();
			setTimeout(function() {
				done();
			}, 100);
		}, 100);
	});

	// ==================================================
	// async2_resize
	// ==================================================

	QUnit.module("Overflow due to resizing", {
		beforeEach: function(assert) {
			oCtrl = sap.ui.getCore().getControl("Toolbar");
			assert.notStrictEqual(oCtrl, null, "oCtrl must exist");
			assert.notStrictEqual(document.getElementById("Toolbar"), null, "Toolbar DomRef must exist");
			initToolbar();
		},
		afterEach: function() {
			oCtrl = null;
		}
	});


	/**
	 * Toolbar is 300px (sWidth) wide; add two buttons of 75px width (which will not cause overflow for reasonable margins etc.)
	 * and then resize the toolbar to 199px width, which should trigger the overflow.
	 */
	QUnit.test("ResizeUntilOverflowButtonAppears", function(assert) {
		var done = assert.async();
		oCtrl = sap.ui.getCore().getControl("Toolbar");
		assert.ok(oCtrl);

		assert.strictEqual(oCtrl.getDomRef().offsetWidth, iWidth, "Toolbar width is wrong");
		verifyOverflowButtonIsNotVisible(assert, "Overflow button may not be visible initially");

		// add two buttons that surely fit
		var oBtn = new Button("testButton", {"text":"Test","width":"75px"});
		oCtrl.addItem(oBtn);
		oBtn = new Button("testButton2", {"text":"Test","width":"75px"});
		oCtrl.addItem(oBtn);
		sap.ui.getCore().applyChanges();

		setTimeout(function() {
			verifyOverflowButtonIsNotVisible(assert, "Overflow button must not be visible with only two small items in the toolbar");
			done();
		}, 10);
	});

	QUnit.test("ResizeUntilOverflowButtonAppears2", function(assert) {
		var done = assert.async();
		var oBtn1 = new Button("testButton1", {"text":"Test","width":"75px"});
		var oBtn2 = new Button("testButton2", {"text":"Test","width":"75px"});
		oCtrl.addItem(oBtn1);
		oCtrl.addItem(oBtn2);
		sap.ui.getCore().applyChanges();
		// resize toolbar to cause overflow
		oCtrl.setWidth("149px");
		sap.ui.getCore().applyChanges();
		setTimeout(function() {
			verifyOverflowButtonIsVisible(assert, "Overflow button must be visible when the toolbar is resized to a very small size");
			done();
		}, 10);
	});


	QUnit.test("ResizeUntilOverflowButtonAppears2_InvisibleItemsDontCount", function(assert) {
		var done = assert.async();
		var oBtn1 = new Button("testButton1", {"text":"Test","width":"75px"});
		var oBtn2 = new Button("testButton2", {"text":"Test","width":"75px", "visible" : false});
		oCtrl.addItem(oBtn1);
		oCtrl.addItem(oBtn2);
		sap.ui.getCore().applyChanges();
		// resize toolbar to cause overflow
		oCtrl.setWidth("149px");
		sap.ui.getCore().applyChanges();
		setTimeout(function() {
			verifyOverflowButtonIsNotVisible(assert, "Overflow button must not be visible when the toolbar is resized to a size less than total width of all buttons, but larger than total width of visible items only");
			done();
		}, 10);
	});

	QUnit.test("ResizeUntilOverflowButtonAppears3", function(assert) {
		var done = assert.async();
		var oBtn1 = new Button("testButton1", {"text":"Test","width":"75px"});
		var oBtn2 = new Button("testButton2", {"text":"Test","width":"75px"});
		oCtrl.setWidth("149px");
		oCtrl.addItem(oBtn1);
		oCtrl.addItem(oBtn2);
		sap.ui.getCore().applyChanges();
		// resize again to avoid overflow
		oCtrl.setWidth(sWidth);
		sap.ui.getCore().applyChanges();
		setTimeout(function() {
			verifyOverflowButtonIsNotVisible(assert, "Overflow button may not be visible with only two small items in the toolbar");
			setTimeout(function() {
				done();
			}, 100);
		}, 10);
	});

	QUnit.test("ResizeUntilOverflowButtonAppears3_ToolbarFullHeightSeparatorAtTheBeggining", function(assert) {
		var done = assert.async();
		oCtrl.setWidth("149px");
		var oToolbarSeparator = new ToolbarSeparator({design : ToolbarSeparatorDesign.FullHeight});
		var oBtn1 = new Button("testButton1", {"text":"Test","width":"75px"});
		var oBtn2 = new Button("testButton2", {"text":"Test","width":"75px", "visible" : false});
		oCtrl.addItem(oToolbarSeparator);
		oCtrl.addItem(oBtn1);
		oCtrl.addItem(oBtn2);
		sap.ui.getCore().applyChanges();
		// resize again to avoid overflow
		oCtrl.setWidth(sWidth);
		sap.ui.getCore().applyChanges();
		setTimeout(function() {
			verifyOverflowButtonIsNotVisible(assert, "Overflow button may not be visible with one full height separator and two small buttons in the toolbar");
			setTimeout(function() {
				done();
			}, 100);
		}, 450);
	});

	// ==================================================
	// async3_outerWidth
	// ==================================================

	QUnit.module("outerWidth", {
		beforeEach: function (assert) {
			oCtrl = sap.ui.getCore().getControl("Toolbar");
			assert.notStrictEqual(oCtrl, null, "oCtrl must exist");
			assert.notStrictEqual(document.getElementById("Toolbar"), null, "Toolbar DomRef must exist");
			initToolbar();
		},
		afterEach: function () {
			oCtrl = null;
		}
	});

	/**
	 * Test how the toolbar adapts to size changes of the surroundings (width-wise) and updates the overflow button
	 */
	QUnit.test("ToolbarAdaptsToOuterWidthAndUpdates", function(assert) {
		var done = assert.async();
		oCtrl = sap.ui.getCore().getControl("Toolbar");
		assert.ok(oCtrl);
		var uiArea = document.getElementById("content");

		uiArea.style.width = "600px"; // make the parent div have a defined size
		var oBtn = new Button("testButton", {"text":"Test","width":"100px"});
		oCtrl.addItem(oBtn);
		oBtn = new Button("testButton2", {"text":"Test","width":"100px"});
		oCtrl.addItem(oBtn);

		// check whether the "auto"-mode toolbar adapts to the parent and the overflow button is not visible
		oCtrl.setWidth("auto");
		sap.ui.getCore().applyChanges();
		setTimeout(function() {
			assert.strictEqual(oCtrl.getDomRef().offsetWidth, 600, "Toolbar width should be adapted to parent DOM element");
			assert.strictEqual(getOverflowDomRef().style.display, "none", "Overflow button may not be visible with only two small items in the toolbar");
			done();
		}, 350);
	});

	QUnit.test("ToolbarAdaptsToOuterWidthAndUpdates2", function(assert) {
		var done = assert.async();
		oCtrl.setWidth("auto");
		var uiArea = document.getElementById("content");
		var oBtn1 = new Button("testButton", {"text":"Test","width":"100px"});
		oCtrl.addItem(oBtn1);
		var oBtn2 = new Button("testButton2", {"text":"Test","width":"100px"});
		oCtrl.addItem(oBtn2);
		sap.ui.getCore().applyChanges();
		// make the parent smaller, check toolbar size and visibility of (then required) overflow button
		uiArea.style.width = "199px";

		setTimeout(function() {
				assert.strictEqual(oCtrl.getDomRef().offsetWidth, 199, "Toolbar width should be in sync with parent DOM element");
				assert.strictEqual(getOverflowDomRef().style.display, "block", "Overflow button must be visible once parent has become too small");
				done();
			}, 450);
	});

	// ==================================================
	// async5_overflowMenu
	// ==================================================

	QUnit.module("Overflow Menu", {
		beforeEach: function (assert) {
			oCtrl = sap.ui.getCore().getControl("Toolbar");
			assert.notStrictEqual(oCtrl, null, "oCtrl must exist");
			assert.notStrictEqual(document.getElementById("Toolbar"), null, "Toolbar DomRef must exist");
			initToolbar();
		},
		afterEach: function () {
			oCtrl = null;
		}
	});

	/**
	 * Tests the overflow menu for a toolbar with many buttons
	 */
	QUnit.test("existance of menu", function(assert) {
		var done = assert.async();
		oCtrl = sap.ui.getCore().getControl("Toolbar");
		assert.ok(oCtrl);

		// check initial visibility of the overflow popup
		assert.ok((getPopupDomRef() == null) || (getPopupDomRef().style.visibility == "hidden"), "the Popup must be either invisible or not existing at all");

		var aButtons = [];
		for (var i = 0; i < 10; i++) {
			aButtons[i] = new Button("testButton" + i, {"text":"Test","width":"101px"});
			oCtrl.addItem(aButtons[i]);
		}
		sap.ui.getCore().applyChanges();
		setTimeout(function() {
			verifyOverflowButtonIsVisible(assert, "Overflow button must be visible for 10 items");
			done();
		}, 10);
	});



	// ==================================================
	// helper functions
	// ==================================================

	function getDisplayStyle(element) {
		return jQuery(element).css("display");
	}

	/*
	 * Helper method using internal knowledge of the renderer to get the DomRef of oCtrl's overflow button
	 */
	function getOverflowDomRef() {
		return oCtrl.getDomRef("mn");
	}

	/*
	 * Returns the overflow popup DomRef for oCtrl or null if it does not exist
	 */
	function getPopupDomRef() {
		var child = oCtrl.getDomRef("pu");
		if (child) {
			return child.parentNode;
		} else {
			return null;
		}
	}

	function verifyOverflowButtonIsNotVisible(assert, sErrorMessage) {
		assert.strictEqual(getDisplayStyle(getOverflowDomRef()), "none", sErrorMessage);
	}

	function verifyOverflowButtonIsVisible(assert, sErrorMessage) {
		assert.strictEqual(getDisplayStyle(getOverflowDomRef()), "block", sErrorMessage);
	}

	var normalizeColor = (function() {

		var RX_HEX_COLOR = /#[0-9a-fA-F]+/;
		var CSS_COLORS = {
				maroon : 'rgb(128,0,0)',
				red : 'rgb(255,0,0)',
				orange : 'rgb(255,165,0)',
				yellow : 'rgb(255,255,0)',
				olive : 'rgb(128,128,0)',
				purple : 'rgb(128,0,128)',
				fuchsia : 'rgb(255,0,255)',
				white : 'rgb(255,255,255)',
				lime : 'rgb(0,255,0)',
				green : 'rgb(0,128,0)',
				navy : 'rgb(0,0,128)',
				blue : 'rgb(0,0,255)',
				aqua : 'rgb(0,255,255)',
				teal : 'rgb(0,128,128)',
				black : 'rgb(0,0,0)',
				silver : 'rgb(192,192,192)',
				gray : 'rgb(128,128,128)',
				transparent : 'rgba(0,0,0,0)'
		};

		return function(sColor) {

			if (CSS_COLORS[sColor]) {return CSS_COLORS[sColor];}

			if (sColor.match(RX_HEX_COLOR)) {
				return "rgb(" + parseInt(sColor.substring(1, 3), 16)
				+ "," + parseInt(sColor.substring(3, 5), 16)
				+ "," + parseInt(sColor.substring(5, 7), 16)
				+ ")";
			}

			return sColor.replace(/ /g, "");
		};

	})();
});