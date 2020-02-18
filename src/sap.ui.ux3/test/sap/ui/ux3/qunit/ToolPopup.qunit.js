/*global QUnit, sinon */
sap.ui.define([
    "sap/ui/qunit/QUnitUtils",
    "sap/ui/qunit/utils/createAndAppendDiv",
    "sap/ui/commons/Button",
    "sap/ui/ux3/ToolPopup",
    "sap/ui/thirdparty/jquery",
    "sap/ui/core/Popup",
    "sap/ui/commons/FormattedTextView",
    "sap/ui/commons/TextField",
    "sap/ui/commons/TextView",
    "sap/ui/commons/Link",
    "sap/ui/commons/Label",
    "sap/ui/commons/layout/MatrixLayoutCell",
    "sap/ui/commons/library",
    "sap/ui/commons/layout/MatrixLayoutRow",
    "sap/ui/commons/layout/MatrixLayout",
    "sap/ui/core/HTML",
    "sap/ui/events/KeyCodes",
    // jQuery Plugin "rect"
	"sap/ui/dom/jquery/rect"
], function(
    qutils,
	createAndAppendDiv,
	Button,
	ToolPopup,
	jQuery,
	Popup,
	FormattedTextView,
	TextField,
	TextView,
	Link,
	Label,
	MatrixLayoutCell,
	commonsLibrary,
	MatrixLayoutRow,
	MatrixLayout,
	HTML,
	KeyCodes
) {
	"use strict";

	// shortcut for sap.ui.commons.layout.VAlign
	var VAlign = commonsLibrary.layout.VAlign;

	// shortcut for sap.ui.commons.layout.HAlign
	var HAlign = commonsLibrary.layout.HAlign;

	// shortcut for sap.ui.core.Popup.Dock
	var Dock = Popup.Dock;


	// prepare DOM
	(function(){
		var elem = document.createElement("DIV");
		elem.setAttribute("id", "Placeholder");
		elem.setAttribute("style", "margin-top: 100px;");
		elem.setAttribute("tabindex", "0");
		document.body.insertBefore(elem, document.body.firstChild);
	}());
	document.body.insertBefore(createAndAppendDiv("uiArea2"), document.body.firstChild).setAttribute("style", "margin-top: 20px; margin-right: 100px; text-align: right;");
	document.body.insertBefore(createAndAppendDiv("uiArea1"), document.body.firstChild).setAttribute("style", "margin-top: 100px; margin-left: 200px;");
	var styleElement = document.createElement("style");
	styleElement.textContent =
		".widePopup {" +
		"	width: 800px;" +
		"}" +
		".widePopup2 {" +
		"	width: 200px;" +
		"}" +
		".highPopup {" +
		"	width: 120px;" +
		"}";
	document.head.appendChild(styleElement);



	var bTest = false;
	var sBorderWidth = "";
	var iBorderWidth = 0;

	var $Arrow;
	var oArrowRect = {};
	var oBtnRect = {};
	var oTPRect = {};

	var $Window = jQuery(window);
	// jQuery Plugin "rect"
	var oWindowRect = $Window.rect();

	var oPosition = {
		"my" : "",
		"at" : "",
		"of" : null,
		"offset" : "",
		"collision" : ""
	};

	var oBtn1 = new Button({
		text : "open here",
		width : "100px"
	}).placeAt("uiArea1");

	var oBtn2 = new Button({
		text : "open here",
		width : "100px"
	}).placeAt("uiArea2");

	var oBtnClose = new Button({
		text : "Press to close"
	});

	var oTP1 = new ToolPopup("tp1", {
		content : [ oBtnClose ],
		opener : oBtn1
	});

	QUnit.module("Open / Close with defaults");
	QUnit.test("Open default (right from button)", function(assert) {
		var done = assert.async();
		assert.expect(4);

		oBtn1.press = function() {
			oTP1.open();
		};

		oTP1.startTime = new Date();

		var fnOpened = function() {
			oTP1.detachOpened(fnOpened);

			// jQuery Plugin "rect"
			oBtnRect = oBtn1.$().rect();
			// jQuery Plugin "rect"
			oTPRect = oTP1.$().rect();
			$Arrow = jQuery(document.getElementById("tp1-arrow"));
			// jQuery Plugin "rect"
			oArrowRect = $Arrow.rect();

			// since this function is called - it is already open
			assert.ok(true, "ToolPopup was opened");

			bTest = oBtnRect.left < oTPRect.left;
			assert.ok(bTest, "ToolPopup opened right from button");

			bTest = (oBtnRect.left + oBtnRect.width - oTP1.iArrowWidth <= oArrowRect.left) && (oArrowRect.left + oArrowRect.width >= oTPRect.left);
			assert.ok(bTest, "Arrow opened between button and ToolPopup");

			oTP1.endTime = new Date();
			var iStart = oTP1.startTime.getTime();
			var iEnd = oTP1.endTime.getTime();
			// if just one second passed
			bTest = iStart + 1000 <= iEnd;
			assert.ok(bTest, "Open animation duration min 1 second (start: " + oTP1.startTime.toLocaleTimeString() + " end: " + oTP1.endTime.toLocaleTimeString() + ")");
			done();
		};

		oTP1.setOpenDuration(1000);
		oTP1.attachOpened(fnOpened);
		oBtn1.press();
		sap.ui.getCore().applyChanges();
	});

	QUnit.test("Close with close button", function(assert) {
		var done = assert.async();
		assert.expect(2);

		oTP1.setCloseDuration(1000);
		oBtnClose.press = function() {
			oTP1.close();
		};

		oTP1.startTime = new Date();

		var fnClosed = function() {
			oTP1.detachClosed(fnClosed);

			bTest = oTP1.isOpen();
			assert.ok(!bTest, "ToolPopup was closed over close button in ToolPopup");

			oTP1.endTime = new Date();
			var iStart = oTP1.startTime.getTime();
			var iEnd = oTP1.endTime.getTime();
			// if just one second passed
			bTest = iStart + 1000 <= iEnd;
			assert.ok(bTest, "Close animation duration min 1 second (start: " + oTP1.startTime.toLocaleTimeString() + " end: " + oTP1.endTime.toLocaleTimeString() + ")");
			done();
		};

		oTP1.attachClosed(fnClosed);
		oBtnClose.press();
		sap.ui.getCore().applyChanges();
	});

	QUnit.test("Open below", function(assert) {
		var done = assert.async();
		assert.expect(3);

		jQuery("#Placeholder")[0].focus();

		oBtn1.press = function() {
			oTP1.setCloseDuration(0);
			oTP1.setOpenDuration(0);

			oPosition.my = Dock.BeginTop;
			oPosition.at = Dock.BeginBottom;
			oTP1.open(oPosition.my, oPosition.at);
		};

		var fnOpened = function() {
			oTP1.detachOpened(fnOpened);

			// jQuery Plugin "rect"
			oBtnRect = oBtn1.$().rect();
			// jQuery Plugin "rect"
			oTPRect = oTP1.$().rect();
			$Arrow = jQuery(document.getElementById("tp1-arrow"));
			// jQuery Plugin "rect"
			oArrowRect = $Arrow.rect();

			bTest = oTP1.isOpen();
			assert.ok(bTest, "ToolPopup was opened");

			if (bTest) {
				bTest = oBtnRect.top + oBtnRect.height <= oTPRect.top;
			}
			assert.ok(bTest, "ToolPopup below button");

			if (bTest) {
				bTest = (oBtnRect.top + oBtnRect.height <= oArrowRect.top + oTP1.iArrowWidth)
						&& (oArrowRect.top + oArrowRect.height + oTP1.iArrowWidth >= oTPRect.top);
			}
			assert.ok(bTest, "Arrow opened between button and ToolPopup");
			done();
		};

		oTP1.attachOpened(fnOpened);
		oBtn1.press();
		sap.ui.getCore().applyChanges();
	});

	QUnit.test("Open left (default)", function(assert) {
		var done = assert.async();
		// jQuery Plugin "rect"
		oWindowRect = jQuery(window).rect();
		oWindowRect.width = $Window.width();
		oWindowRect.height = $Window.height();

		if (oWindowRect.width === 0) {
			assert.expect(1);
			done();
			assert.ok(true, "Test skipped since window is too small");
		}

		assert.expect(3);

		var fnClosed = function() {
			oTP1.detachClosed(fnClosed);

			oBtn1.press = function() {
				oPosition.my = Dock.EndTop;
				oPosition.at = Dock.BeginTop;
				oTP1.open(oPosition.my, oPosition.at);
			};

			oBtn1.press();
			sap.ui.getCore().applyChanges();

		};

		var fnOpened = function() {
			oTP1.detachOpened(fnOpened);

			// jQuery Plugin "rect"
			oBtnRect = oBtn1.$().rect();
			// jQuery Plugin "rect"
			oTPRect = oTP1.$().rect();
			$Arrow = jQuery(document.getElementById("tp1-arrow"));
			// jQuery Plugin "rect"
			oArrowRect = $Arrow.rect();

			sBorderWidth = oTP1.$().css("border-left-width");
			iBorderWidth = parseInt(sBorderWidth);

			bTest = oTP1.isOpen();
			assert.ok(bTest, "ToolPopup was opened");

			if (bTest) {
				bTest = oTPRect.left + oTPRect.width <= oBtnRect.left;
			}
			assert.ok(bTest, "ToolPopup opened left from button");

			if (bTest) {
				// -1 since arrow starts at next pixel
				bTest = (oTPRect.left + oTPRect.width - iBorderWidth - 1 <= oArrowRect.left) && (oArrowRect.left + oTP1.iArrowWidth <= oBtnRect.left);
			}
			assert.ok(bTest, "Arrow opened between button and ToolPopup");
			done();
		};

		oTP1.attachClosed(fnClosed);
		oTP1.attachOpened(fnOpened);
		oTP1.close();
		sap.ui.getCore().applyChanges();
	});

	QUnit.test("Open above (default)", function(assert) {
		var done = assert.async();
		assert.expect(3);
		oTP1.close();
		sap.ui.getCore().applyChanges();

		oBtn1.press = function() {
			oPosition.my = Dock.BeginBottom;
			oPosition.at = Dock.BeginTop;
			oTP1.open(oPosition.my, oPosition.at);
		};

		var fnOpened = function() {
			oTP1.detachOpened(fnOpened);

			// jQuery Plugin "rect"
			oBtnRect = oBtn1.$().rect();
			// jQuery Plugin "rect"
			oTPRect = oTP1.$().rect();
			$Arrow = jQuery(document.getElementById("tp1-arrow"));
			// jQuery Plugin "rect"
			oArrowRect = $Arrow.rect();

			sBorderWidth = oTP1.$().css("border-top-width");
			iBorderWidth = parseInt(sBorderWidth);

			bTest = oTP1.isOpen();
			assert.ok(bTest, "ToolPopup was opened");

			if (bTest) {
				bTest = oTPRect.top + oTPRect.height <= oBtnRect.top;
			}
			assert.ok(bTest, "ToolPopup opened above button");

			if (bTest) {
				bTest = (oTPRect.top + oTPRect.height - iBorderWidth <= oArrowRect.top + (oArrowRect.height - oTP1.iArrowWidth))
						&& (oArrowRect.top - oArrowRect.height + oTP1.iArrowWidth <= oBtnRect.top);
			}
			assert.ok(bTest, "Arrow opened between button and ToolPopup");
			done();
		};

		oTP1.attachOpened(fnOpened);
		oBtn1.press();
		sap.ui.getCore().applyChanges();

	});

	QUnit.module("Open with 'setPosition'");
	QUnit.test("Open above (set Position)", function(assert) {
		var done = assert.async();
		assert.expect(6);

		oTP1.close();
		sap.ui.getCore().applyChanges();

		oBtn1.press = function() {
			oPosition.my = Dock.BeginBottom;
			oPosition.at = Dock.BeginTop;
			oPosition.of = this;
			oPosition.offset = "-20 -27";
			oPosition.collision = "none";

			oTP1.setPosition(oPosition.my, oPosition.at, oPosition.of, oPosition.offset, oPosition.collision);
			oTP1.open();
		};

		var fnOpened = function() {
			oTP1.detachOpened(fnOpened);
			bTest = oTP1.isOpen();
			if (bTest) {
				// jQuery Plugin "rect"
				oBtnRect = oBtn1.$().rect();
				// jQuery Plugin "rect"
				oTPRect = oTP1.$().rect();
				$Arrow = jQuery(document.getElementById("tp1-arrow"));
				// jQuery Plugin "rect"
				oArrowRect = $Arrow.rect();

				bTest = oTPRect.top + oTPRect.height <= oBtnRect.top;
				assert.ok(bTest, "ToolPopup was opened above");

				bTest = ((oTP1.oPopup._oPosition.my === oPosition.my) || ((oTP1.oPopup._oPosition.my === "begin-20 bottom-27") && (!oTP1.oPopup._oPosition.offset))) ? true : false;
				assert.ok(bTest, "'my' is still the same");

				bTest = (oTP1.oPopup._oPosition.at === oPosition.at) ? true : false;
				assert.ok(bTest, "'at' is still the same");

				bTest = (oTP1.oPopup._oPosition.of === oPosition.of) ? true : false;
				assert.ok(bTest, "'of' is still the same");

				bTest = ((oTP1.oPopup._oPosition.offset === oPosition.offset) || ((oTP1.oPopup._oPosition.my === "begin-20 bottom-27") && (!oTP1.oPopup._oPosition.offset))) ? true : false;
				assert.ok(bTest, "'offset' is still the same");

				bTest = (oTP1.oPopup._oPosition.collision === oPosition.collision) ? true : false;
				assert.ok(bTest, "'collision' is still the same");

				oTP1.close();
				sap.ui.getCore().applyChanges();
			}
			done();
		};

		oTP1.attachOpened(fnOpened);
		oBtn1.press();
		sap.ui.getCore().applyChanges();

	});

	QUnit.module("Collision detection");
	QUnit.test("fit", function(assert) {
		var done = assert.async();
		// jQuery Plugin "rect"
		oWindowRect = jQuery(window).rect();
		oWindowRect.width = $Window.width();
		oWindowRect.height = $Window.height();

		if (oWindowRect.width > 1175) {
			assert.expect(1);
			assert.ok(true, "Fit-test not possible because window is too big");
			done();
			return;
		}
		assert.expect(2);

		var oTP2 = new ToolPopup("tp2", {
			content : [ oBtnClose ],
			opener : oBtn1,
			openDuration : 0,
			closeDuration : 0
		});
		oTP2.addStyleClass("widePopup");

		oBtn1.press = function() {
			oPosition.my = Dock.BeginTop;
			oPosition.at = Dock.EndTop;
			oPosition.of = this;
			oPosition.offset = "13 0";
			oPosition.collision = "fit";

			oTP2.setPosition(oPosition.my, oPosition.at, oPosition.of, oPosition.offset, oPosition.collision);
			oTP2.open();
		};

		var fnOpened = function() {
			oTP2.detachOpened(fnOpened);

			bTest = oTP2.isOpen();
			assert.ok(bTest, "ToolPopup opened");

			// jQuery Plugin "rect"
			oBtnRect = oBtn1.$().rect();
			// jQuery Plugin "rect"
			oTPRect = oTP2.$().rect();
			$Arrow = jQuery(document.getElementById("tp2-arrow"));
			// jQuery Plugin "rect"
			oArrowRect = $Arrow.rect();

			if (bTest) {
				jQuery.ajax({
					url : "../../../../../resources/dummy_log/fit_test/oBtnRect.left(" + oBtnRect.left + ") + oBtnRect.width(" + oBtnRect.width
							+ ") >= oTPRect.left(" + oTPRect.left + ")"
				});
				bTest = oBtnRect.left + oBtnRect.width >= oTPRect.left;
			}
			assert.ok(bTest, "ToolPopup overlaps button");

			oTP2.close();
			sap.ui.getCore().applyChanges();
			done();
		};

		oTP2.attachOpened(fnOpened);
		oBtn1.press();
		sap.ui.getCore().applyChanges();
	});

	QUnit.test("flip", function(assert) {
		var done = assert.async();
		// jQuery Plugin "rect"
		oWindowRect = jQuery(window).rect();
		oWindowRect.width = $Window.width();
		oWindowRect.height = $Window.height();

		jQuery.ajax({
			url : "../../../../../resources/dummy_log/window_size/height=" + oWindowRect.height + ",width=" + oWindowRect.width
		});
		if (oWindowRect.width < 350) {
			assert.expect(1);
			assert.ok(true, "Flip-test not possible because window is too small");
			done();
			return;
		}
		assert.expect(3);

		var oTP3 = new ToolPopup("tp3", {
			content : [ oBtnClose ],
			opener : oBtn2
		});
		oTP3.addStyleClass("widePopup2");

		oBtn2.press = function() {
			oPosition.my = Dock.BeginTop;
			oPosition.at = Dock.EndTop;
			oPosition.of = this;
			oPosition.offset = "13 0";
			oPosition.collision = "flip";

			oTP3.setPosition(oPosition.my, oPosition.at, oPosition.of, oPosition.offset, oPosition.collision);
			oTP3.open();
		};

		var fnOpened = function() {
			oTP3.detachOpened(fnOpened);

			bTest = oTP3.isOpen();
			assert.ok(bTest, "ToolPopup opened");

			// jQuery Plugin "rect"
			oBtnRect = oBtn2.$().rect();
			// jQuery Plugin "rect"
			oTPRect = oTP3.$().rect();
			$Arrow = jQuery(document.getElementById("tp3-arrow"));
			// jQuery Plugin "rect"
			oArrowRect = $Arrow.rect();

			sBorderWidth = oTP3.$().css("border-left-width");
			iBorderWidth = parseInt(sBorderWidth);

			if (bTest) {
				bTest = oTPRect.left + oTPRect.width <= oBtnRect.left;
			}
			assert.ok(bTest, "ToolPopup flipped to the opposite side");

			if (bTest) {
				// -1 since arrow starts at next pixel
				bTest = (oTPRect.left + oTPRect.width - iBorderWidth - 1 <= oArrowRect.left) && (oArrowRect.left + oTP3.iArrowWidth <= oBtnRect.left);
			}
			assert.ok(bTest, "Arrow positioned accordingly to flipped ToolPopup");

			oTP3.destroy();
			done();
		};

		oTP3.attachOpened(fnOpened);
		oBtn2.press();
		sap.ui.getCore().applyChanges();

	});

	var oTPFocus;
	QUnit.module("Focus handling", {
		beforeEach : function() {
			oTPFocus = new ToolPopup("focusPopup", {
				content : [ new FormattedTextView("FormattedTextView1",{
					htmlText : "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua."
				}), new Button("focusBtn1", {
					text : "focus_button1"
				}), new Button("focusBtn2", {
					text : "focus_button2"
				}), new Button("defaultBtn1", {
					text : "default_button1"
				}), new Button("focusBtn3", {
					text : "focus_button3"
				})],
				opener : oBtn1,
				openDuration : 0
			});

			oBtn1.press = function() {
				oTPFocus.open();
			};
		},
		afterEach : function() {
			oTPFocus.destroy();
		}
	});
	QUnit.test("Initial Focus (default)", function(assert) {
		var done = assert.async();
		assert.expect(1);

		var fnOpened = function() {
			oTPFocus.detachOpened(fnOpened);

			bTest = document.activeElement.id === "focusBtn1";

			assert.ok(bTest, "First button was focused per default");
			done();
		};

		oTPFocus.attachOpened(fnOpened);
		oBtn1.press();
		sap.ui.getCore().applyChanges();
	});
	QUnit.test("default button is focused by default", function(assert) {
		var done = assert.async();
		assert.expect(1);

		oTPFocus.setDefaultButton("defaultBtn1");

		var fnOpened = function() {
			oTPFocus.detachOpened(fnOpened);

			bTest = document.activeElement.id === "defaultBtn1";

			assert.ok(bTest, "Default button was focused by default");
			done();
		};
		oTPFocus.attachOpened(fnOpened);
		oBtn1.press();
		sap.ui.getCore().applyChanges();
	});
	QUnit.test("Determines the focus DOM reference", function(assert) {
		var done = assert.async();
		assert.expect(1);

		oTPFocus.setDefaultButton("defaultBtn1");

		var fnOpened = function() {
			oTPFocus.detachOpened(fnOpened);

			bTest = typeof oTPFocus.getFocusDomRef() === 'object';

			assert.ok(bTest, "getFocusDomRef returns object");
			done();
		};
		oTPFocus.attachOpened(fnOpened);
		oBtn1.press();
		sap.ui.getCore().applyChanges();
	});
	QUnit.test("default button is focused by pressEnter", function(assert) {
		var done = assert.async();
		assert.expect(1);

		oTPFocus.setInitialFocus("focusBtn2");
		oTPFocus.setDefaultButton("defaultBtn1");

		var fnOpened = function() {
			oTPFocus.detachOpened(fnOpened);

			var sKeyEnter = KeyCodes.ENTER;
			var oDomRef = sap.ui.getCore().byId("FormattedTextView1").getDomRef();
			qutils.triggerKeydown(oDomRef, sKeyEnter);

			bTest = document.activeElement.id === "defaultBtn1";

			assert.ok(bTest, "Default button was focused by pressEnter");
			done();
		};

		oTPFocus.attachOpened(fnOpened);
		oBtn1.press();
		sap.ui.getCore().applyChanges();
	});
	QUnit.test("Initial Focus (previsouly set)", function(assert) {
		var done = assert.async();
		assert.expect(1);

		oTPFocus.setInitialFocus("focusBtn2");

		var fnOpened = function() {
			oTPFocus.detachOpened(fnOpened);

			bTest = document.activeElement.id === "focusBtn2";

			assert.ok(bTest, "Second button was focused");
			done();
		};

		oTPFocus.attachOpened(fnOpened);
		oBtn1.press();
		sap.ui.getCore().applyChanges();
	});

	QUnit.test("Focusable area (type check)", function(assert) {
		assert.expect(4);

		var oTF = new TextField().placeAt("uiArea1");
		oTPFocus.setAutoClose(true);

		// since a wrong type is given 'oValue' should be null
		var oValue = oTPFocus.addFocusableArea(oTF);
		assert.ok(!oValue, "Wrong type is recognized while adding");
		oValue = null; // reset result for next test

		oValue = oTPFocus.addFocusableArea(oTF.getId());
		assert.ok(!!oValue, "Correct type is accepted while adding");
		oValue = null;

		oValue = oTPFocus.removeFocusableArea(oTF);
		// since a wrong type is given 'oValue' should be null
		assert.ok(!oValue, "Wrong type is recognized while removal");
		oValue = null;

		oValue = oTPFocus.removeFocusableArea(oTF.getId());
		assert.ok(!!oValue, "Correct type is accepted while removal");
		oValue = null;
	});

	QUnit.test("Autoclose on opener removal", function(assert) {
		var done = assert.async();
		assert.expect(2);

		oTPFocus.setCloseDuration(0).close();
		sap.ui.getCore().applyChanges();

		oTPFocus.setCloseDuration(100).setOpenDuration(100);
		oTPFocus.attachOpened(function() {
			// Yay, it opened...
			assert.ok(true, "ToolPopup opened");
			oTPFocus.attachClosed(function() {
				// Yay, it closed...
				assert.ok(true, "ToolPopup closed itself after opener removal");
				done();
			});


			oBtn1.$().remove();
			sap.ui.getCore().applyChanges();
		});


		oTPFocus.open(Dock.BeginBottom, Dock.BeginTop);
	});

	var oTPMaxHeight;
	QUnit.module("Size of the ToolPopup", {
		beforeEach : function() {
			oTPMaxHeight = new ToolPopup("focusPopup", {
				content : [ new Button({
					text : "button1"
				}), new Button({
					text : "button2"
				}), new Button({
					text : "button3"
				}), new Button({
					text : "button4"
				}), new Button({
					text : "button5"
				}), new Button({
					text : "button6"
				}), new Button({
					text : "button7"
				}), new Button({
					text : "button8"
				}), new Button({
					text : "button9"
				}), new Button({
					text : "button10"
				}) ],
				opener : oBtn1,
				openDuration : 0,
				closeDuration : 0
			}).addStyleClass("highPopup"); // setting the height to 400px

			oBtn1.press = function() {
				oTPMaxHeight.open();
			};

			oBtn1.placeAt("uiArea1");
		},
		afterEach : function() {
			oTPMaxHeight.destroy();
		}
	});

	QUnit.test("Max height of '200px'", function(assert) {
		var done = assert.async();
		assert.expect(1);

		var fnOpened = function() {
			oTPMaxHeight.detachOpened(fnOpened);

			// jQuery Plugin "rect"
			oTPRect = oTPMaxHeight.$().rect();

			bTest = Math.round(oTPRect.height) <= 200;
			assert.ok(bTest, "ToolPopup not higher than 200px");
			done();
		};

		oTPMaxHeight.setMaxHeight("200px");
		oTPMaxHeight.attachOpened(fnOpened);
		oBtn1.press();
		sap.ui.getCore().applyChanges();
	});

	QUnit.test("Max width of 120px", function(assert) {
		var done = assert.async();
		assert.expect(1);

		var fnOpened = function() {
			oTPMaxHeight.detachOpened(fnOpened);
			// jQuery Plugin "rect"
			oTPRect = oTPMaxHeight.$().rect();

			// IE10, 11 are adding some fractions to the calculation in some cases// TODO remove after the end of support for Internet Explorer
			bTest = Math.round(oTPRect.width) <= 120;
			assert.ok(bTest, "ToolPopup's width of 120px");
			done();
		};

		oTPMaxHeight.setMaxWidth("120px");
		oTPMaxHeight.attachOpened(fnOpened);
		oBtn1.press();
		sap.ui.getCore().applyChanges();
	});

	QUnit.test("Check Resize Handler Registration", function(assert) {
		var done = assert.async();
		assert.expect(3);

		var fnOpened = function() {
			oTPMaxHeight.detachOpened(fnOpened);

			assert.ok(!!oTPMaxHeight._sResizeID, "Resize handler attached after ToolPopup has been opened");

			oTPMaxHeight.close();
		};
		var fnClosed = function() {
			oTPMaxHeight.detachOpened(fnOpened);

			assert.ok(!oTPMaxHeight._sResizeID, "Resize handler deregistered again");

			done();
		};

		oTPMaxHeight.attachOpened(fnOpened);
		oTPMaxHeight.attachClosed(fnClosed);

		assert.ok(!oTPMaxHeight._sResizeID, "No resize handler attached if ToolPopup is closed");
		oBtn1.press();
		sap.ui.getCore().applyChanges();
	});

	QUnit.test("Check if ToolPopup exceeds window", function(assert) {
		var done = assert.async();
		var fnOpened = function() {
			oTPMaxHeight.detachOpened(fnOpened);

			var iWinHeight = jQuery(window).height();
			// jQuery Plugin "rect"
			var oRect = oTPMaxHeight.$().rect();

			assert.ok(oRect.top + oRect.height < iWinHeight, "ToolPopup isn't bigger than window");

			// jQuery Plugin "rect"
			oRect = oTPMaxHeight.$("content").rect();
			assert.ok(oRect.top + oRect.height < iWinHeight, "Content properly shrinked to ToolPopup size and not bigger than window");

			done();
		};

		oTPMaxHeight.setMaxHeight("0px");
		for (var i = 0; i < 100; i++) {
			oTPMaxHeight.addContent(new Button({
				text : "Blow it up"
			}));
		}

		oTPMaxHeight.attachOpened(fnOpened);
		oBtn1.press();
		sap.ui.getCore().applyChanges();
	});

	var oButtonContent;
	var oTPContent;
	QUnit.module("Changing content", {
		beforeEach : function() {
			oButtonContent = new Button({
				text : "Open"
			}).placeAt("uiArea1");
			oButtonContent.press = 	function() {
					oTPContent.open();
			};

			oTPContent = new ToolPopup({
				maxWidth : '200px',
				opener : oButtonContent
			});
		},

		afterEach : function() {
			oTPContent.destroy();
			oButtonContent.destroy();
		}
	});

	QUnit.test("Change Content", function(assert){
		var done = assert.async();
		assert.expect(2);

		function row(sLabel, sText, sUrl) {
			var oControl;
			if (!sUrl) {
				oControl = new TextView({
					text : sText,
					tooltip : sText
				});
			} else {
				oControl = new Link({
					text : sText,
					href : sUrl,
					tooltip : sText,
					target : "_blank"
				});
			}

			var oLabel = new Label({
				text : sLabel + ":",
				labelFor : oControl
			});

			var oMLCell1 = new MatrixLayoutCell({
				hAlign : HAlign.End,
				vAlign : VAlign.Top,
				content : [ oLabel ]
			});
			var oMLCell2 = new MatrixLayoutCell({
				hAlign : HAlign.Begin,
				vAlign : VAlign.Top,
				content : [ oControl ]
			});

			return new MatrixLayoutRow({
				cells : [ oMLCell1, oMLCell2 ]
			});
		}

		var fnOpened = function() {
			oTPContent.detachOpened(fnOpened);

			var fnApplyPosition = sinon.spy(oTPContent.oPopup, "_applyPosition");

			// jQuery Plugin "rect"
			var $Rect = oTPContent.$().rect();
			var iOldHeight = $Rect.height;

			var oLayout = new MatrixLayout({
				rows : [ row("Date of birth", "09/09/1999"), row("Gender", "male"),
					row("Nationality", "german"), row("VIP", "yes"),
					row("Address", "Hauptstraße 10, Musterstadt, Germany"),
					row("Phone", "06221/23428374"),
					row("Fax", "06221/23423432"),
					row("E-mail", "m.m@sap.com", "mailto:m.m@sap.com"),
					row("Web Site", "www.sap.com", "http://www.sap.com")
				]
			});

			oTPContent.addContent(oLayout);
			sap.ui.getCore().applyChanges();

			// jQuery Plugin "rect"
			$Rect = oTPContent.$().rect();
			var iNewHeight = $Rect.height;

			assert.ok(iNewHeight > iOldHeight, "Content was added when Popup was open");
			assert.ok(fnApplyPosition.calledOnce, "Position of Popup was updated");
			done();
		};

		oTPContent.attachOpened(fnOpened);
		oButtonContent.press();
	});

	QUnit.test("Preserve Dialog Content", function(assert) {
		var done = assert.async();
		var bRendered = false;
		var oHtml = new HTML({
			content: "<div id='htmlControl'>test</div>",
			preferDOM : true,
			afterRendering : function(oEvent) {
				if (!bRendered) {
					document.querySelector("#htmlControl").setAttribute("data-some-attribute", "some-value");
					bRendered = true;
				}
			}
		});
		oTPContent.addContent(oHtml);

		var fnOpened2 = function() {
			oTPContent.detachOpened(fnOpened2);

			assert.ok(!!document.querySelector("#htmlControl"), "HTML control rendered");
			assert.equal(document.querySelector("#htmlControl").getAttribute("data-some-attribute"), "some-value", "DOM attribute value set correctly");

			oTPContent.attachClosed(done);

			oTPContent.close();
		};

		var fnClosed1 = function() {
			oTPContent.detachClosed(fnClosed1);

			assert.equal(document.querySelector("#htmlControl").parentElement.id, "sap-ui-preserve", "HTML control rendered (preserved)");

			oTPContent.open();
			oTPContent.attachOpened(fnOpened2);
		};


		var fnOpened1 = function() {
			oTPContent.detachOpened(fnOpened1);

			assert.ok(!!document.querySelector("#htmlControl"), "HTML control rendered");
			assert.equal(document.querySelector("#htmlControl").getAttribute("data-some-attribute"), "some-value", "DOM attribute value set correctly");

			oTPContent.attachClosed(fnClosed1);
			oTPContent.close();
		};


		assert.equal(document.querySelector("#htmlControl"), null, "HTML control not rendered");

		oTPContent.attachOpened(fnOpened1);
		oTPContent.open();
	});
});