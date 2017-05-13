/*global QUnit,sinon*/

(function () {
	"use strict";

	sinon.config.useFakeTimers = true;

	var oSwitch0 = new sap.m.Switch(),
		oSwitch1 = new sap.m.Switch({
			state: true
		}),
		oSwitch2 = new sap.m.Switch({
			state: false
		}),
		oSwitch3 = new sap.m.Switch({
			enabled: false
		}),
		oSwitch4 = new sap.m.Switch({
			enabled: true
		}),
		oSwitch5 = new sap.m.Switch({
			state: false
		}),
		oSwitch6 = new sap.m.Switch({
			enabled: false,
			name: "switch-1"
		}),
		oSwitch7 = new sap.m.Switch({
			state: true,
			name: "switch-7"
		}),
		oSwitch8 = new sap.m.Switch({
			state: false
		}),
		oSwitch9 = new sap.m.Switch({
			customTextOn: "I",
			customTextOff: "O"
		}),
		oSwitch10 = new sap.m.Switch({
			customTextOn: "Yes, it is",
			customTextOff: "No, it is not"
		}),
		oSwitch11 = new sap.m.Switch({
			customTextOn: "111",
			customTextOff: "000"
		}),
		oSwitch12 = new sap.m.Switch(),
		oSwitch13 = new sap.m.Switch();

	var oPage = new sap.m.Page("page1", {
		title: "Mobile Switch Control",
		content: [
			oSwitch0,
			oSwitch1,
			oSwitch2,
			oSwitch3,
			oSwitch4,
			oSwitch5,
			oSwitch6,
			oSwitch7,
			oSwitch8,
			oSwitch9,
			oSwitch10,
			oSwitch11,
			oSwitch12,
			oSwitch13
		]
	});

	oPage.placeAt("content");
	QUnit.config.autostart = false;
	sap.ui.test.qunit.delayTestStart();

	// helper functions
	var fnGetDomRefs = function (sId) {

		var oSwitch = sap.ui.getCore().byId(sId),
			$SwtCont = oSwitch.$(),
			$Swt = $SwtCont.children(".sapMSwt"),
			$SwtInner = $Swt.children(".sapMSwtInner"),
			$SwtTextOn = $SwtInner.children(".sapMSwtTextOn"),
			$SwtTextOff = $SwtInner.children(".sapMSwtTextOff"),
			$SwtSpanOn = $SwtTextOn.children(".sapMSwtLabelOn"),
			$SwtSpanOff = $SwtTextOff.children(".sapMSwtLabelOff"),
			$Checkbox = $SwtCont.children("input[type=checkbox]");

		return {
			oSwitch: oSwitch,
			$Swt: $Swt,
			$SwtInner: $SwtInner,
			$SwtTextOn: $SwtTextOn,
			$SwtTextOff: $SwtTextOff,
			$SwtSpanOn: $SwtSpanOn,
			$SwtSpanOff: $SwtSpanOff,
			$Checkbox: $Checkbox
		};
	};

	/* =========================================================== */
	/* API module                                                  */
	/* =========================================================== */

	QUnit.module("API");

	/* ------------------------------ */
	/* tests for default values       */
	/* ------------------------------ */

	QUnit.test("properties and default values", function (assert) {
		assert.strictEqual(oSwitch0.getState(), false, "The default state is false");
		assert.strictEqual(oSwitch0.getEnabled(), true, "By default the switch is disabled");
		assert.strictEqual(oSwitch0.getFocusDomRef().getAttribute("role"), "checkbox", "The role checkbox is set");
		assert.strictEqual(jQuery(oSwitch0.getFocusDomRef()).attr("aria-disabled"), undefined, 'The "aria-disabled" attribute is set not set by default');
	});

	QUnit.test("getter / setter", function (assert) {
		assert.strictEqual(oSwitch1.getState(), true, "Check constructor property state === true");
		assert.strictEqual(oSwitch2.getState(), false, "Check constructor property state === false");
		assert.strictEqual(oSwitch3.getEnabled(), false, "Check constructor property enabled === false");
		assert.strictEqual(oSwitch4.getEnabled(), true, "Check constructor property enabled === true");
		oSwitch5.setState(true);
		assert.strictEqual(oSwitch5.getState(), true, "Check setState() and getState()");
		oSwitch6.setEnabled(true);
		assert.strictEqual(oSwitch6.getEnabled(), true, "Check setEnabled() and getEnabled()");
		assert.strictEqual(oSwitch6.getName(), "switch-1", "Check setName() and getName()");
		assert.strictEqual(oSwitch6.getFocusDomRef(), oSwitch6.getDomRef());
		assert.strictEqual(sap.ui.getCore().byId("__switch9").getCustomTextOn(), "I", "");
		assert.strictEqual(sap.ui.getCore().byId("__switch9").getCustomTextOff(), "O", "");
		assert.strictEqual(sap.ui.getCore().byId("__switch11")._sOn, "111", "");
		assert.strictEqual(sap.ui.getCore().byId("__switch11")._sOff, "000", "");
	});

	/* ------------------------------ */
	/* setState()                     */
	/* ------------------------------ */

	QUnit.test("setState() test case 1 (initial rendering)", function (assert) {

		// system under test
		var oSwitch = new sap.m.Switch({
			state: false
		});

		// arrange
		oSwitch.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oSwitch.getFocusDomRef().getAttribute("aria-checked"), "false", 'The "aria-checked" attribute is set to "false"');

		// cleanup
		oSwitch.destroy();
	});

	QUnit.test("setState() test case 2 (initial rendering)", function (assert) {

		// system under test
		var oSwitch = new sap.m.Switch({
			state: true
		});

		// arrange
		oSwitch.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oSwitch.getFocusDomRef().getAttribute("aria-checked"), "true", 'The "aria-checked" attribute is set to "true"');

		// cleanup
		oSwitch.destroy();
	});

	QUnit.test("setState() test case 3", function (assert) {

		// system under test
		var oSwitch = new sap.m.Switch();

		// arrange
		oSwitch.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oSwitch.setState(true);

		// assert
		assert.strictEqual(oSwitch.getFocusDomRef().getAttribute("aria-checked"), "true", 'The "aria-checked" attribute is set to "true"');

		// cleanup
		oSwitch.destroy();
	});

	QUnit.test("setState() test case 4", function (assert) {

		// system under test
		var oSwitch = new sap.m.Switch();

		// arrange
		oSwitch.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oSwitch.setState(false);

		// assert
		assert.strictEqual(oSwitch.getFocusDomRef().getAttribute("aria-checked"), "false", 'The "aria-checked" attribute is set to "false"');

		// cleanup
		oSwitch.destroy();
	});

	/* ------------------------------ */
	/* ariaLabelledBy()               */
	/* ------------------------------ */

	QUnit.test("it should set the value of the aria-labelledby attribute to the id of the label concatenated with the id of the invisible element separated by a space (test case 1)", function (assert) {

		// system under test
		var oLabel = new sap.m.Label({
			id: "label"
		});

		var oSwitch = new sap.m.Switch({
			state: false,
			ariaLabelledBy: oLabel
		});

		// arrange
		oLabel.placeAt("content");
		oSwitch.placeAt("content");
		sap.ui.getCore().applyChanges();
		var sExpectedLabelledBy = "label " + oSwitch.getInvisibleElementId();

		// assert
		assert.strictEqual(oSwitch.getDomRef().getAttribute("aria-labelledby"), sExpectedLabelledBy);

		// cleanup
		oSwitch.destroy();
		oLabel.destroy();
	});

	QUnit.test("it should set the value of the aria-labelledby attribute to the id of the label concatenated with the id of the invisible element separated by a space (test case 2)", function (assert) {

		// system under test
		var oSwitch = new sap.m.Switch({
			state: true
		});

		var oLabel = new sap.m.Label({
			id: "label",
			labelFor: oSwitch
		});

		// arrange
		oLabel.placeAt("content");
		oSwitch.placeAt("content");
		sap.ui.getCore().applyChanges();
		var sExpectedLabelledBy = "label " + oSwitch.getInvisibleElementId();

		// assert
		assert.strictEqual(oSwitch.getDomRef().getAttribute("aria-labelledby"), sExpectedLabelledBy);

		// cleanup
		oSwitch.destroy();
		oLabel.destroy();
	});

	QUnit.test("it should set the value of the aria-labelledby attribute to the id of the label concatenated with the id of the invisible element separated by a space (test case 3)", function (assert) {

		// system under test
		var oLabel = new sap.m.Label({
			id: "label"
		});

		var oSwitch = new sap.m.Switch({
			type: sap.m.SwitchType.AcceptReject,
			ariaLabelledBy: oLabel
		});

		// arrange
		oSwitch.placeAt("content");
		sap.ui.getCore().applyChanges();
		var sExpectedLabelledBy = "label " + oSwitch.getInvisibleElementId();

		// assert
		assert.strictEqual(oSwitch.getDomRef().getAttribute("aria-labelledby"), sExpectedLabelledBy);

		// cleanup
		oSwitch.destroy();
	});

	QUnit.test("it should set the value of the invisible element for custom text", function (assert) {

		// system under test
		var oSwitch = new sap.m.Switch({
			id: "label1",
			state: true,
			customTextOn: "Yes",
			customTextOff: "No"
		});

		// arrange
		oSwitch.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oSwitch.getDomRef("invisible").textContent, "Yes");

		// cleanup
		oSwitch.destroy();
	});

	QUnit.test("getAccessibilityInfo", function (assert) {
		var oBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");
		var oSwitch = new sap.m.Switch({
			customTextOn: "CustomON",
			customTextOff: "CustomOff"
		});
		assert.ok(!!oSwitch.getAccessibilityInfo, "Switch has a getAccessibilityInfo function");
		var oInfo = oSwitch.getAccessibilityInfo(true);
		assert.ok(!!oInfo, "getAccessibilityInfo returns a info object");
		assert.strictEqual(oInfo.role, "checkbox", "AriaRole");
		assert.strictEqual(oInfo.type, oBundle.getText("ACC_CTR_TYPE_CHECKBOX"), "Type");
		assert.strictEqual(oInfo.description, "", "Description");
		assert.strictEqual(oInfo.focusable, true, "Focusable");
		assert.strictEqual(oInfo.enabled, true, "Enabled");
		assert.ok(oInfo.editable === undefined || oInfo.editable === null, "Editable");

		oSwitch.setState(true);
		oInfo = oSwitch.getAccessibilityInfo(true);
		assert.strictEqual(oInfo.description, oBundle.getText("ACC_CTR_STATE_CHECKED") + " CustomON", "Description");

		oSwitch.setCustomTextOn("");
		oInfo = oSwitch.getAccessibilityInfo(true);
		assert.strictEqual(oInfo.description, oBundle.getText("ACC_CTR_STATE_CHECKED") + " " + oBundle.getText("SWITCH_ON"), "Description");

		oSwitch.setType("AcceptReject");
		oInfo = oSwitch.getAccessibilityInfo(true);
		assert.strictEqual(oInfo.description, oBundle.getText("ACC_CTR_STATE_CHECKED") + " " + oBundle.getText("SWITCH_ARIA_ACCEPT"), "Description");

		oSwitch.setEnabled(false);
		oInfo = oSwitch.getAccessibilityInfo();
		assert.strictEqual(oInfo.focusable, false, "Focusable");
		assert.strictEqual(oInfo.enabled, false, "Enabled");
		oSwitch.destroy();
	});

	/* =========================================================== */
	/* HTML module                                                 */
	/* =========================================================== */

	QUnit.module("HTML");

	/* ------------------------------ */
	/* rendering                      */
	/* ------------------------------ */

	QUnit.test("rendering", function (assert) {
		oPage.getContent().forEach(function (oSwitch) {
			var mDomRefs = fnGetDomRefs(oSwitch.getId());

			// assert
			assert.ok(oSwitch.$().length, "The switch container html div element exists");
			assert.ok(mDomRefs.$Swt.length, "The switch first-child html div element exists");
			assert.ok(mDomRefs.$SwtInner.length, "The switch first-child html div inner element exists");
			assert.ok(mDomRefs.$SwtTextOn.length, "The switch html div text element exists");
			assert.ok(mDomRefs.$SwtTextOff.length, "The switch html div text element exists");
			assert.ok(mDomRefs.$SwtSpanOn.length, "The switch html span inner element exists");
			assert.ok(mDomRefs.$SwtSpanOff.length, "The switch html span inner element exists");
			assert.strictEqual(oSwitch.getDomRef("switch").getAttribute("aria-hidden"), "true");

			if (mDomRefs.oSwitch.getName()) {
				assert.ok(mDomRefs.$Checkbox.length, 'The checkbox html input element exists');
			}

			assert.ok(oSwitch.$("handle").length, "The switch handle html div element exists");
		});
	});

	QUnit.test("it should render the invisible element with the corresponding text nodes for screen reader announcement", function (assert) {

		// system under test
		var oSwitch = new sap.m.Switch({
			type: sap.m.SwitchType.AcceptReject
		});

		// arrange
		oSwitch.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oSwitch.getDomRef("invisible").textContent, sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("SWITCH_ARIA_ACCEPT"));
		assert.strictEqual(getComputedStyle(oSwitch.getDomRef("invisible")).getPropertyValue("display"), "none");
		assert.strictEqual(oSwitch.getDomRef("invisible").getAttribute("aria-hidden"), "true");

		// cleanup
		oSwitch.destroy();
	});

	/* =========================================================== */
	/* CSS and DOM module                                          */
	/* =========================================================== */

	QUnit.module("CSS and DOM");

	QUnit.test("class and attributes", function (assert) {
		testSwitchON(assert, oSwitch7);
		testSwitchOFF(assert, oSwitch8);
	});

	/**
	 * Test switch ON
	 * @param {object} assert the QUnit assert object
	 * @param {sap.m.Switch} oSwitch the switch control
	 */
	function testSwitchON(assert, oSwitch) {
		var mDomRefs = fnGetDomRefs(oSwitch.getId());
		var switchOnText = sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("SWITCH_ON");

		// assert
		assert.ok(oSwitch.$().hasClass("sapMSwtCont"), 'The switch container html element "must have" the css class "sapMSwtCont"');
		assert.ok(mDomRefs.$Swt.hasClass("sapMSwt"), 'The switch first-child html element "must have" the css class "sapMSwt"');
		assert.ok(mDomRefs.$Swt.hasClass("sapMSwtOn"), 'The switch first-child html element "must have" the css class "sapMSwtOn"');
		assert.ok(!mDomRefs.$Swt.hasClass("sapMSwtOff"), 'The switch first-child html element "must not have" the css class "sapMSwtOff"');

		if (oSwitch.getName()) {
			assert.strictEqual(mDomRefs.$Checkbox.attr("value"), switchOnText, 'The input checkbox is "On"');
			assert.strictEqual(mDomRefs.$Checkbox.attr("checked"), "checked", 'The input checkbox is "checked"');
		}

		assert.strictEqual(oSwitch.$("handle").attr("data-sap-ui-swt"), switchOnText, 'The switch handle "data-sap-ui-swt" attribute must have the value of "On"');
		assert.strictEqual(oSwitch.$("invisible").text(), switchOnText, 'The invisible switch label should be "On"');

		if (oSwitch.getEnabled()) {
			assert.equal(oSwitch.$().attr("tabindex"), 0, 'The switch "tabindext" attribute must have the value of "0"');
		} else {
			assert.ok(oSwitch.$().attr("tabindex"), 'The "tabindex" attribute of the switch is not rendered');
		}

		testSwitchEnabled(assert, oSwitch);
	}

	/**
	 * Test switch OFF
	 * @param {object} assert the QUnit assert object
	 * @param {sap.m.Switch} oSwitch the switch control
	 */
	function testSwitchOFF(assert, oSwitch) {

		// arrange
		var mDomRefs = fnGetDomRefs(oSwitch.getId());
		var switchOffText = sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("SWITCH_OFF");

		// assert
		assert.ok(oSwitch.$().hasClass("sapMSwtCont"), 'The switch container html element "must have" the css class "sapMSwtCont"');
		assert.ok(mDomRefs.$Swt.hasClass("sapMSwt"), 'The switch html element "must have" the css class "sapMSwt"');
		assert.ok(mDomRefs.$Swt.hasClass("sapMSwtOff"), 'The switch html element "must have" the css class "sapMSwtOff"');
		assert.ok(!mDomRefs.$Swt.hasClass("sapMSwtOn"), 'The switch first-child html element "must not have" the css class "sapMSwtOn"');

		if (oSwitch.getName()) {
			assert.strictEqual(mDomRefs.$Checkbox.attr("value"), switchOffText, 'The input checkbox is "Off"');
			assert.strictEqual(mDomRefs.$Checkbox.attr("checked"), undefined, 'The input checkbox is not "checked"');
		}

		assert.strictEqual(oSwitch.$("handle").attr("data-sap-ui-swt"), switchOffText, 'The switch handle "data-sap-ui-swt" attribute must have the value of "Off"');
		assert.strictEqual(oSwitch.$("invisible").text(), switchOffText, 'The invisible switch label should be "Off"');

		if (mDomRefs.oSwitch.getEnabled()) {
			assert.equal(oSwitch.$().attr("tabindex"), 0, 'The switch "tabindex" attribute must have the value of "0"');
		}
	}

	function testSwitchEnabled(assert, oSwitch) {

		// arrange
		var mDomRefs = fnGetDomRefs(oSwitch.getId());

		// assert
		if (oSwitch.getEnabled()) {
			assert.ok(!oSwitch.$().hasClass("sapMSwtContDisabled"), 'The switch container html element "must not have" the css class "sapMSwtContDisabled"');
			assert.ok(!mDomRefs.$Swt.hasClass("sapMSwtDisabled"), 'The switch first-child html element "must not have" the css class "sapMSwtDisabled"');
		} else {
			assert.ok(oSwitch.$().hasClass("sapMSwtContDisabled"), 'The switch container html element "must have" the css class "sapMSwtContDisabled"');
			assert.ok(mDomRefs.$Swt.hasClass("sapMSwtDisabled"), 'The switch first-child html element "must have" the css class "sapMSwtDisabled"');
		}
	}

	QUnit.module("Updating");

	// test switch disabled
	QUnit.test("When the method setEnabled is invoked with a boolean false argument", function (assert) {
		oSwitch7.setState(false);

		// act
		oSwitch7.setEnabled(false);

		// arrange
		sap.ui.getCore().applyChanges();

		// assert
		testSwitchOFF(assert, oSwitch7);
	});

	// test switch enabled
	QUnit.test("When the method setEnabled is invoked with a boolean true argument", function (assert) {

		// act
		oSwitch7.setEnabled(true);

		// arrange
		sap.ui.getCore().applyChanges();

		// assert
		testSwitchOFF(assert, oSwitch7);
		assert.strictEqual(jQuery(oSwitch7.getFocusDomRef()).attr("aria-disabled"), undefined, 'The "aria-disabled" attribute not set');
	});

	QUnit.test("Testing that setName() method add the html attribute name", function (assert) {
		var oSwitch7 = sap.ui.getCore().byId("__switch7");
		assert.strictEqual(oSwitch7.$().find("input[type=checkbox]").attr("name"), "switch-7", "The attribute name from the input type checkbox inside the switch must have the value " + oSwitch7.getName());
	});

	/* =========================================================== */
	/* Events module                                               */
	/* =========================================================== */

	QUnit.module("Event");

	QUnit.test("Firing events", function (assert) {
		var j,
			i,
			oTouchMove,
			oSwitch0 = sap.ui.getCore().byId("__switch0"),
			oSwitch8 = sap.ui.getCore().byId("__switch8");

		sap.ui.test.qunit.triggerTouchEvent("touchstart", oSwitch0.getDomRef(), {
			touches: {
				0: {
					pageX: 60,
					identifier: 0,
					target: oSwitch0.getDomRef()
				},

				length: 1
			},

			targetTouches: {
				0: {
					pageX: 60,
					identifier: 0,
					target: oSwitch0.getDomRef()
				},

				length: 1
			}
		});

		assert.ok(oSwitch0.$().children(".sapMSwt").hasClass("sapMSwtPressed"), 'On touchstart event the switch first-child html element muss have the css class “sapMSwtPressed”');

		sap.ui.test.qunit.triggerTouchEvent("touchend", oSwitch0.getDomRef(), {
			changedTouches: {
				0: {
					pageX: 60,
					identifier: 0,
					target: oSwitch0.getDomRef()
				},

				length: 1
			},

			touches: {
				length: 0
			}
		});

		this.clock.tick(200);
		assert.strictEqual(oSwitch0.getState(), true, "On tap the switch state is true");
		assert.ok(!oSwitch0.$().children(".sapMSwt").hasClass("sapMSwtPressed"), 'On touchend event the switch muss not have the css class “sapMSwtPressed”');

		/*	Only process single touches. If there is already a touch
		 happening or two simultaneous touches, then just ignore them. */

		sap.ui.test.qunit.triggerTouchEvent("touchstart", oSwitch0.getDomRef(), {
			touches: {
				0: {
					pageX: 60,
					identifier: 1,
					target: oSwitch0.getDomRef()
				},

				1: {
					pageX: 60,
					identifier: 2,
					target: oSwitch0.getDomRef()
				},

				length: 2
			},

			targetTouches: {
				0: {
					pageX: 60,
					identifier: 1,
					target: oSwitch0.getDomRef()
				},

				1: {
					pageX: 60,
					identifier: 2,
					target: oSwitch0.getDomRef()
				},

				length: 2
			}
		});

		assert.ok(!oSwitch0.$().children(".sapMSwt").hasClass("sapMSwtPressed"), 'If there is more than one touch related to the switch, event will be suppresed, the switch first-child html element muss not have the css class “sapMSwtPressed”');

		/*	testing touch move	*/

		sap.ui.test.qunit.triggerTouchEvent("touchstart", oSwitch8.getDomRef(), {
			touches: {
				0: {
					pageX: 636,
					identifier: 3,
					target: oSwitch8.getDomRef()
				},

				length: 1
			},

			targetTouches: {
				0: {
					pageX: 636,
					identifier: 3,
					target: oSwitch8.getDomRef()
				},

				length: 1
			}
		});

		assert.ok(oSwitch8.$().children(".sapMSwt").hasClass("sapMSwtPressed"), 'On touchstart event the switch first-child element muss have the css class “sapMSwtPressed”');

		oTouchMove = {
			touches: {
				0: {
					pageX: 636,
					identifier: 3,
					target: oSwitch8.$("handle")[0]
				},

				length: 1
			},

			changedTouches: {
				0: {
					pageX: 636,
					identifier: 3,
					target: oSwitch8.$("handle")[0]
				},

				length: 1
			}
		};

		j = 636;
		for (i = j + 1; i < j + 41; i++) {
			oTouchMove.changedTouches[0].pageX = i;
			sap.ui.test.qunit.triggerTouchEvent("touchmove", oSwitch8.$("handle")[0], oTouchMove);
		}

		sap.ui.test.qunit.triggerTouchEvent("touchend", oSwitch8.getDomRef(), {
			changedTouches: {
				0: {
					pageX: 60,
					identifier: 3,
					target: oSwitch8.getDomRef()
				},

				length: 1
			},

			touches: {
				length: 0
			}
		});
	});

	// github #234
	QUnit.test("double click/tap test case", function (assert) {

		// system under test
		var oSwitch = new sap.m.Switch({
			state: true
		});

		// arrange
		oSwitch.placeAt("content");
		sap.ui.getCore().applyChanges();

		var oTouchstart = {
			touches: {
				0: {
					pageX: 1,
					identifier: 1,
					target: oSwitch.getDomRef()
				},

				length: 1
			},

			targetTouches: {
				0: {
					pageX: 1,
					identifier: 1,
					target: oSwitch.getDomRef()
				},

				length: 1
			}
		};

		var oTouchend = {
			changedTouches: {
				0: {
					pageX: 1,
					identifier: 1,
					target: oSwitch.getDomRef()
				},

				length: 1
			},

			touches: {
				length: 0
			}
		};

		var iClickThreshold = 100;	// threshold between clicks

		// act
		sap.ui.test.qunit.triggerTouchEvent("touchstart", oSwitch.getDomRef(), oTouchstart);
		sap.ui.test.qunit.triggerTouchEvent("touchend", oSwitch.getDomRef(), oTouchend);
		this.clock.tick(iClickThreshold);
		sap.ui.test.qunit.triggerTouchEvent("touchstart", oSwitch.getDomRef(), oTouchstart);
		sap.ui.test.qunit.triggerTouchEvent("touchend", oSwitch.getDomRef(), oTouchend);
		this.clock.tick(sap.m.Switch._TRANSITIONTIME - iClickThreshold);

		// assert
		assert.strictEqual(oSwitch.getState(), false);
		this.clock.tick(iClickThreshold);
		assert.strictEqual(oSwitch.getState(), true);

		// cleanup
		oSwitch.destroy();
	});

	QUnit.test("The change event should be fired only when it's state changes", function (assert) {

		// system under test
		var oSwitch = new sap.m.Switch({
			state: true
		});

		// arrange
		oSwitch.placeAt("content");
		sap.ui.getCore().applyChanges();

		var oTouchstart = {
			touches: {
				0: {
					pageX: 1,
					identifier: 1,
					target: oSwitch.getDomRef()
				},

				length: 1
			},

			targetTouches: {
				0: {
					pageX: 1,
					identifier: 1,
					target: oSwitch.getDomRef()
				},

				length: 1
			}
		};

		var oTouchmove = {
			touches: {
				0: {
					pageX: 2,
					identifier: 1,
					target: oSwitch.getDomRef()
				},

				length: 1
			},

			changedTouches: {
				0: {
					pageX: 2,
					identifier: 1,
					target: oSwitch.getDomRef()
				},

				length: 1
			}
		};

		var oTouchend = {
			changedTouches: {
				0: {
					pageX: 2,
					identifier: 1,
					target: oSwitch.getDomRef()
				},

				length: 1
			},

			touches: {
				length: 0
			}
		};

		var fnFireChangeSpy = this.spy(oSwitch, "fireChange");

		// act
		sap.ui.test.qunit.triggerTouchEvent("touchstart", oSwitch.getDomRef(), oTouchstart);
		sap.ui.test.qunit.triggerTouchEvent("touchmove", oSwitch.getDomRef(), oTouchmove);	// drag the switch handle 1px to the right
		sap.ui.test.qunit.triggerTouchEvent("touchend", oSwitch.getDomRef(), oTouchend);
		this.clock.tick(sap.m.Switch._TRANSITIONTIME + 1);	// wait some ms after the CSS transition is completed

		// assert
		assert.strictEqual(fnFireChangeSpy.callCount, 0);

		// cleanup
		oSwitch.destroy();
	});

	/* ------------------------------ */
	/* onsapspace()                   */
	/* ------------------------------ */

	QUnit.test("onsapselect SPACE", function (assert) {

		// system under test
		var oSwitch = new sap.m.Switch({
			state: false
		});

		// arrange
		oSwitch.placeAt("content");
		sap.ui.getCore().applyChanges();
		var fnFireChangeSpy = this.spy(oSwitch, "fireChange");

		// act
		sap.ui.test.qunit.triggerKeydown(oSwitch.getDomRef(), jQuery.sap.KeyCodes.SPACE);
		this.clock.tick(1000);

		// assert
		assert.strictEqual(oSwitch.getState(), true, "After the space key is pressed, the switch state must change");
		assert.strictEqual(fnFireChangeSpy.callCount, 1, "The change event was fired");

		// cleanup
		oSwitch.destroy();
	});

	QUnit.test("onsapselect ENTER", function (assert) {

		// system under test
		var oSwitch = new sap.m.Switch({
			state: true
		});

		// arrange
		oSwitch.placeAt("content");
		sap.ui.getCore().applyChanges();
		var fnFireChangeSpy = this.spy(oSwitch, "fireChange");

		// act
		sap.ui.test.qunit.triggerKeydown(oSwitch.getDomRef(), jQuery.sap.KeyCodes.ENTER);
		this.clock.tick(1000);

		// assert
		assert.strictEqual(oSwitch.getState(), false, "After the enter key is pressed, the switch state must change");
		assert.strictEqual(fnFireChangeSpy.callCount, 1, "The change event was fired");

		// cleanup
		oSwitch.destroy();
	});

	// BCP 1570633670
	QUnit.test("extending the switch should not throw an error", function (assert) {

		// system under test
		sap.m.Switch.extend("sap.ui.test.CustomSwitch", {
			renderer: {}
		});

		var oCustomSwitch = new sap.ui.test.CustomSwitch();

		// arrange
		oCustomSwitch.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oCustomSwitch.isActive());

		// cleanup
		oCustomSwitch.destroy();
	});
}());