/*global QUnit, sinon */
sap.ui.define([
	"jquery.sap.events",
	"sap/base/i18n/Localization",
	"sap/ui/Device",
	"sap/ui/core/Control",
	"sap/ui/events/F6Navigation",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/nextUIUpdate",
	// provides jQuery.sap.keyCodes
	"jquery.sap.keycodes"
], function(jQuery, Localization, Device, Control, F6Navigation, qutils, nextUIUpdate) {
	"use strict";

	// Initialization
	var MobileEventTest = Control.extend("test.MobileEventTest", {
		metadata: {
			library: "test",
			aggregations: {"child" : {name : "child", type : "sap.ui.core.Control", multiple : false}}
		},
		renderer: {
			apiVersion: 2,
			render: function(rm, ctrl){
				rm.openStart("div", ctrl);
				rm.class("testCtrl");
				rm.openEnd();
					rm.openStart("div", ctrl.getId() + "-Inner")
						.class("testCtrlInner")
						.openEnd();
					if (ctrl.getChild()) {
						rm.renderControl(ctrl.getChild());
					}
					rm.close("div");
				rm.close("div");
			}
		}
	});

	var oTestControl1 = new MobileEventTest("test1");
	var oTestControl2 = new MobileEventTest("test2");
	oTestControl1.setChild(oTestControl2);
	oTestControl1.placeAt("uiArea");

	var bRtl = Localization.getRTL();

	//see jQuery.sap.ControlEvents
	var aBasicBrowserEvents = ["click", "dblclick", "contextmenu", "focusin", "focusout", "keydown", "keypress", "keyup", "mousedown", "mouseout", "mouseover",
								"mouseup", "select", "selectstart", "dragstart", "dragenter", "dragover", "dragleave", "dragend", "drop", "paste", "cut", "input",
								"tap", "swipe", "swipeleft", "swiperight", "scrollstart", "scrollstop", "compositionstart", "compositionend", "change"];

	aBasicBrowserEvents.push("saptouchstart", "saptouchmove", "saptouchend");

	var aMobileBrowserEvents = ["touchstart", "touchend", "touchmove", "touchcancel"];

	if (Device.support.touch) {
		aMobileBrowserEvents.push("sapmousedown", "sapmousemove", "sapmouseup");
		if (Device.os.ios){
			aMobileBrowserEvents.push("sapcontextmenu");
		}
	}

	function keyEvent(sName, sAddText, iTrigger, sKeyCode, oKey, bShift, bAlt, bCtrl){
		return {
			sName: sName,
			sAddTxt: sAddText,
			iTrigger: iTrigger,
			oParams: {
				keyCode: jQuery.sap.KeyCodes[sKeyCode],
				key: oKey ? oKey.key : undefined,
				location: oKey ? oKey.location : undefined,
				shiftKey : bShift || false,
				altKey : bAlt || false,
				metaKey : bCtrl || false,
				ctrlKey : bCtrl || false
			}
		};
	}

	//see jQuery.sap.PseudoEvents
	var aPseudoKeyEvents = [
		keyEvent("sapdown", null, 2, "ARROW_DOWN", {key: "ArrowDown"}),
		keyEvent("sapdownmodifiers", null, 1, "ARROW_DOWN", {key: "ArrowDown"}, true, true, false),
		keyEvent("sapshow", "- Option 1", 1, "F4", {key: "F4"}),
		keyEvent("sapshow", "- Option 2", 1, "ARROW_DOWN", {key: "ArrowDown"}, false, true, false),
		keyEvent("sapup", null, 1, "ARROW_UP", {key: "ArrowUp"}),
		keyEvent("sapupmodifiers", null, 1, "ARROW_UP", {key: "ArrowUp"}, false, false, true),
		keyEvent("saphide", null, 1, "ARROW_UP", {key: "ArrowUp"}, false, true, false),
		keyEvent("sapleft", null, 1, "ARROW_LEFT", {key: "ArrowLeft"}),
		keyEvent("sapleftmodifiers", null, 1, "ARROW_LEFT", {key: "ArrowLeft"}, true, true, true),
		keyEvent("sapright", null, 1, "ARROW_RIGHT", {key: "ArrowRight"}),
		keyEvent("saprightmodifiers", null, 1, "ARROW_RIGHT", {key: "ArrowRight"}, false, true, true),
		keyEvent("saphome", null, 1, "HOME", {key: "Home"}),
		keyEvent("saphomemodifiers", null, 1, "HOME", {key: "Home"}, true, false, false),
		keyEvent("saptop", null, 1, "HOME", {key: "Home"}, false, false, true),
		keyEvent("sapend", null, 1, "END", {key: "End"}),
		keyEvent("sapendmodifiers", null, 1, "END", {key: "End"}, false, false, true),
		keyEvent("sapbottom", null, 1, "END", {key: "End"}, false, false, true),
		keyEvent("sappageup", null, 1, "PAGE_UP", {key: "PageUp"}),
		keyEvent("sappageupmodifiers", null, 1, "PAGE_UP", {key: "PageUp"}, true, true, true),
		keyEvent("sappagedown", null, 1, "PAGE_DOWN", {key: "PageDown"}),
		keyEvent("sappagedownmodifiers", null, 1, "PAGE_DOWN", {key: "PageDown"}, false, false, true),
		keyEvent("sapselect", "- Option 1", 1, "ENTER", {key: "Enter"}),
		keyEvent("sapselect", "- Option 2", 1, "SPACE", {key: " "}),
		keyEvent("sapselectmodifiers", "- Option 1", 1, "ENTER", {key: "Enter"}, false, false, true),
		keyEvent("sapselectmodifiers", "- Option 2", 1, "SPACE", {key: " "}, true, true, true),
		keyEvent("sapspace", null, 1, "SPACE", {key: " "}),
		keyEvent("sapspacemodifiers", null, 1, "SPACE", {key: " "}, false, true, false),
		keyEvent("sapenter", null, 1, "ENTER", {key: "Enter"}),
		keyEvent("sapentermodifiers", null, 1, "ENTER", {key: "Enter"}, false, true, true),
		keyEvent("sapexpand", null, 1, "NUMPAD_PLUS", {key: "+", location: "NUMPAD"}),
		keyEvent("sapexpandmodifiers", null, 1, "NUMPAD_PLUS", {key: "+", location: "NUMPAD"}, false, true, true),
		keyEvent("sapcollapse", null, 1, "NUMPAD_MINUS", {key: "-", location: "NUMPAD"}),
		keyEvent("sapcollapsemodifiers", null, 1, "NUMPAD_MINUS", {key: "-", location: "NUMPAD"}, false, true, false),
		keyEvent("sapcollapseall", null, 1, "NUMPAD_ASTERISK", {key: "*", location: "NUMPAD"}),
		keyEvent("saptabnext", null, 1, "TAB", {key: "Tab"}),
		keyEvent("saptabprevious", null, 1, "TAB", {key: "Tab"}, true, false, false),
		keyEvent("sapskipforward", null, 1, "F6", {key: "F6"}),
		keyEvent("sapskipback", null, 1, "F6", {key: "F6"}, true, false, false),
		keyEvent("sapprevious", "- Option 1", 1, bRtl ? "ARROW_RIGHT" : "ARROW_LEFT", bRtl ? {key: "ArrowRight"} : {key: "ArrowLeft"}),
		keyEvent("sapprevious", "- Option 2", 1, "ARROW_UP", {key: "ArrowUp"}),
		keyEvent("sappreviousmodifiers", "- Option 1", 1, bRtl ? "ARROW_RIGHT" : "ARROW_LEFT", bRtl ? {key: "ArrowRight"} : {key: "ArrowLeft"}, true, false, false),
		keyEvent("sappreviousmodifiers", "- Option 2", 1, "ARROW_UP", {key: "ArrowUp"}, false, true, false),
		keyEvent("sapnext", "- Option 1", 1, bRtl ? "ARROW_LEFT" : "ARROW_RIGHT", bRtl ? {key: "ArrowLeft"} : {key: "ArrowRight"}),
		keyEvent("sapnext", "- Option 2", 1, "ARROW_DOWN", {key: "ArrowDown"}),
		keyEvent("sapnextmodifiers", "- Option 1", 1, bRtl ? "ARROW_LEFT" : "ARROW_RIGHT", bRtl ? {key: "ArrowLeft"} : {key: "ArrowRight"}, false, false, true),
		keyEvent("sapnextmodifiers", "- Option 2", 1, "ARROW_DOWN", {key: "ArrowDown"}, false, false, true)
	];

	// JQuery Events do not necessarily have property key
	var aPseudoKeyJQueryEvents = [
		keyEvent("sapdown", null, 2, "ARROW_DOWN", null),
		keyEvent("sapdownmodifiers", null, 1, "ARROW_DOWN", null, true, true, false),
		keyEvent("sapshow", "- Option 1", 1, "F4", null),
		keyEvent("sapshow", "- Option 2", 1, "ARROW_DOWN", null, false, true, false),
		keyEvent("sapup", null, 1, "ARROW_UP", null),
		keyEvent("sapupmodifiers", null, 1, "ARROW_UP", null, false, false, true),
		keyEvent("saphide", null, 1, "ARROW_UP", null, false, true, false),
		keyEvent("sapleft", null, 1, "ARROW_LEFT", null),
		keyEvent("sapleftmodifiers", null, 1, "ARROW_LEFT", null, true, true, true),
		keyEvent("sapright", null, 1, "ARROW_RIGHT", null),
		keyEvent("saprightmodifiers", null, 1, "ARROW_RIGHT", null, false, true, true),
		keyEvent("saphome", null, 1, "HOME", null),
		keyEvent("saphomemodifiers", null, 1, "HOME", null, true, false, false),
		keyEvent("saptop", null, 1, "HOME", null, false, false, true),
		keyEvent("sapend", null, 1, "END", null),
		keyEvent("sapendmodifiers", null, 1, "END", null, false, false, true),
		keyEvent("sapbottom", null, 1, "END", null, false, false, true),
		keyEvent("sappageup", null, 1, "PAGE_UP", null),
		keyEvent("sappageupmodifiers", null, 1, "PAGE_UP", null, true, true, true),
		keyEvent("sappagedown", null, 1, "PAGE_DOWN", null),
		keyEvent("sappagedownmodifiers", null, 1, "PAGE_DOWN", null, false, false, true),
		keyEvent("sapselect", "- Option 1", 1, "ENTER", null),
		keyEvent("sapselect", "- Option 2", 1, "SPACE", null),
		keyEvent("sapselectmodifiers", "- Option 1", 1, "ENTER", null, false, false, true),
		keyEvent("sapselectmodifiers", "- Option 2", 1, "SPACE", null, true, true, true),
		keyEvent("sapspace", null, 1, "SPACE", null),
		keyEvent("sapspacemodifiers", null, 1, "SPACE", null, false, true, false),
		keyEvent("sapenter", null, 1, "ENTER", null),
		keyEvent("sapentermodifiers", null, 1, "ENTER", null, false, true, true),
		keyEvent("sapexpand", null, 1, "NUMPAD_PLUS", null),
		keyEvent("sapexpandmodifiers", null, 1, "NUMPAD_PLUS", null, false, true, true),
		keyEvent("sapcollapse", null, 1, "NUMPAD_MINUS", null),
		keyEvent("sapcollapsemodifiers", null, 1, "NUMPAD_MINUS", null, false, true, false),
		keyEvent("sapcollapseall", null, 1, "NUMPAD_ASTERISK", null),
		keyEvent("saptabnext", null, 1, "TAB", null),
		keyEvent("saptabprevious", null, 1, "TAB", null, true, false, false),
		keyEvent("sapskipforward", null, 1, "F6", null),
		keyEvent("sapskipback", null, 1, "F6", null, true, false, false),
		keyEvent("sapprevious", "- Option 1", 1, bRtl ? "ARROW_RIGHT" : "ARROW_LEFT", null),
		keyEvent("sapprevious", "- Option 2", 1, "ARROW_UP", null),
		keyEvent("sappreviousmodifiers", "- Option 1", 1, bRtl ? "ARROW_RIGHT" : "ARROW_LEFT", null, true, false, false),
		keyEvent("sappreviousmodifiers", "- Option 2", 1, "ARROW_UP", null, false, true, false),
		keyEvent("sapnext", "- Option 1", 1, bRtl ? "ARROW_LEFT" : "ARROW_RIGHT", null),
		keyEvent("sapnext", "- Option 2", 1, "ARROW_DOWN", null),
		keyEvent("sapnextmodifiers", "- Option 1", 1, bRtl ? "ARROW_LEFT" : "ARROW_RIGHT", null, false, false, true),
		keyEvent("sapnextmodifiers", "- Option 2", 1, "ARROW_DOWN", null, false, false, true)
	];


	// Test help functions


	function _testCtrlEvent(assert, sEventName, sOrigEventName, oEventParams, bStopPropagation, fnHandlerChecks, bExpectHandlersNotCalled) {
		var fnCheck = function(oEvent, bTestOuter) {
			if (bStopPropagation && !bTestOuter){
				oEvent.stopPropagation();
			}
			var oTestControl = bTestOuter ? oTestControl1 : oTestControl2;
			oTestControl._bEventHandlerCalled = true;
			assert.equal(oEvent.type, sEventName, "Event type correct");
			assert.ok(oEvent.srcControl, "Event attribute 'srcControl' available");
			if (oEvent.srcControl) {
				assert.equal(oEvent.srcControl.getId(), "test2", "Event attribute 'srcControl' correct");
			}
			if (fnHandlerChecks){
				fnHandlerChecks(oEvent, oTestControl);
			}
		};

		oTestControl1["on" + sEventName] = function(oEvent){fnCheck(oEvent, true);};
		oTestControl2["on" + sEventName] = function(oEvent){fnCheck(oEvent, false);};

		qutils.triggerEvent(sOrigEventName ? sOrigEventName : sEventName, "test2-Inner", oEventParams);

		if (!bExpectHandlersNotCalled){
			if (bStopPropagation){
				assert.ok(!oTestControl1._bEventHandlerCalled, "Event Handler not called on control 1");
			} else {
				assert.ok(oTestControl1._bEventHandlerCalled, "Event Handler called on control 1");
			}
			assert.ok(oTestControl2._bEventHandlerCalled, "Event Handler called on control 2");
		} else {
			assert.ok(!oTestControl1._bEventHandlerCalled, "Event Handler not called on control 1");
			assert.ok(!oTestControl2._bEventHandlerCalled, "Event Handler not called on control 2");
		}

		oTestControl1._bEventHandlerCalled = undefined;
		oTestControl2._bEventHandlerCalled = undefined;
		oTestControl1["on" + sEventName] = undefined;
		oTestControl2["on" + sEventName] = undefined;
	}


	function doTestCtrlEvent(sEventName, sOrigEventName, oEventParams, fnHandlerChecks, bExpectHandlersNotCalled){
		QUnit.test(sEventName + " Event", function(assert) {
			_testCtrlEvent(assert, sEventName, sOrigEventName, oEventParams, false, fnHandlerChecks, bExpectHandlersNotCalled);
		});

		QUnit.test(sEventName + " Event (bubbling cancelled)", function(assert) {
			_testCtrlEvent(assert, sEventName, sOrigEventName, oEventParams, true, fnHandlerChecks, bExpectHandlersNotCalled);
		});
	}


	function doTestPseudoEvent(sOriginalEventName, sEventName, iTriggerCount, oEventParams) {
		QUnit.test(sEventName + " Event - Basic", function(assert) {
			var iCount = 0;
			var fnCheck = function(oEvent) {
				iCount++;
				assert.ok(oEvent.isPseudoType(oEvent._sExpectedPseudoType), "Event has expected pseudo type " + oEvent._sExpectedPseudoType);
			};

			jQuery("#outer").on(sOriginalEventName, fnCheck);

			var oEvent = jQuery.Event(sOriginalEventName);
			oEvent._sExpectedPseudoType = sEventName;
			jQuery.extend(oEvent, oEventParams);

			for (var i = 0; i < iTriggerCount; i++){
				jQuery("#inner").trigger(oEvent);
			}

			assert.equal(iCount, iTriggerCount, "Event handler called " + iTriggerCount + " times");

			jQuery("#inner").off();
			jQuery("#outer").off();
		});

		doTestCtrlEvent(sEventName, sOriginalEventName, oEventParams);
	}


	function triggerDelayedDoubleClick(sTargetId, fnDoAfter) {
		jQuery("#" + sTargetId).trigger("click");
		// at least 500 ms should have passed trigger again to simulate dblclick
		setTimeout(function() {
			jQuery("#" + sTargetId).trigger("click");
			if (fnDoAfter){
				fnDoAfter();
			}
		},500);
	}


	// Test functions


	//***************************************
	QUnit.module("Initialization");

	QUnit.test("Control Events", function(assert) {
		var aBrowserEvents = [].concat(aBasicBrowserEvents);

		if (Device.support.touch){
			aBrowserEvents = aBrowserEvents.concat(aMobileBrowserEvents);
		}

		assert.equal(jQuery.sap.ControlEvents.length, aBrowserEvents.length, "Number of basic browser events correct");
		for (var i = 0; i < aBrowserEvents.length; i++){
			assert.ok(jQuery.sap.ControlEvents.indexOf(aBrowserEvents[i]) >= 0, "Event " + aBrowserEvents[i] + " contained in jQuery.sap.ControlEvents");
		}
	});

	QUnit.test("Pseudo Events", function(assert) {
		function fnCheck(sEventName, sOrigEventName){
			var evt = jQuery.sap.PseudoEvents[sEventName];
			assert.ok(!!evt, "Event " + sEventName + " contained in jQuery.sap.PseudoEvents");
			if (evt){
				assert.equal(evt.sName, sEventName, "Event " + sEventName + ": name correct");
				assert.ok(evt.aTypes.indexOf(sOrigEventName) >= 0, "Event " + sEventName + ": base type correct");
				for (var j = 0; j < evt.aTypes.length; j++){
					assert.ok(jQuery.sap.ControlEvents.indexOf(evt.aTypes[j]) >= 0, "Event " + sEventName + ": base type in jQuery.sap.ControlEvents");
				}
			}
		}

		aPseudoKeyEvents.forEach(function(oPseudoKeyEvent) {
			fnCheck(oPseudoKeyEvent.sName, "keydown");
		});

		aPseudoKeyJQueryEvents.forEach(function(oPseudoKeyJQueryEvent) {
			fnCheck(oPseudoKeyJQueryEvent.sName, "keydown");
		});

		fnCheck("sapdelayeddoubleclick", "click");

		if (Device.support.touch){
			//With mobile events
			fnCheck("swipebegin", bRtl ? "swiperight" : "swipeleft");
			fnCheck("swipeend", !bRtl ? "swiperight" : "swipeleft");
		}
	});




	//***************************************
	QUnit.module("Basic Browser Events");

	aBasicBrowserEvents.forEach(function(oBasicBrowserEvent) {
		doTestCtrlEvent(oBasicBrowserEvent);
	});


	//***************************************
	QUnit.module("Basic Browser Events - Negative check");

	doTestCtrlEvent("hurlipuu", null, null, null, true);


	//***************************************
	QUnit.module("Basic Pseudo Events", {
		before: function () {
			this.oF6NavStub = sinon.stub(F6Navigation, "handleF6GroupNavigation");
		},
		after: function () {
			this.oF6NavStub.restore();
			delete this.oF6NavStub;
		}
	});

	aPseudoKeyEvents.forEach(function(oPseudoKeyEvent) {
		doTestPseudoEvent("keydown", oPseudoKeyEvent.sName, oPseudoKeyEvent.iTrigger, oPseudoKeyEvent.oParams);
	});

	aPseudoKeyJQueryEvents.forEach(function(oPseudoKeyJQueryEvent) {
		doTestPseudoEvent("keydown", oPseudoKeyJQueryEvent.sName, oPseudoKeyJQueryEvent.iTrigger, oPseudoKeyJQueryEvent.oParams);
	});

	QUnit.test("sapdelayeddoubleclick Event - Basic", function(assert){
		var done = assert.async();
		var iCount = 0;
		var bFirst = true;

		var fnCheck = function(oEvent) {
			iCount++;
			if (!bFirst) {
				assert.ok(oEvent.isPseudoType("sapdelayeddoubleclick"), "Event has expected pseudo type sapdelayeddoubleclick");
			}
			oEvent.getPseudoTypes(); //Ensure that pseudo types check functions run
			bFirst = false;
		};

		jQuery("#outer").on("click", fnCheck);

		triggerDelayedDoubleClick("inner", function() {
			assert.equal(iCount, 2, "Event handler called 2 times");
			jQuery("#inner").off();
			jQuery("#outer").off();
			done();
		});

	});

	QUnit.test("sapdelayeddoubleclick Event", function(assert) {
		var done = assert.async();
		var fnCheck = function(oEvent, bTestOuter) {
			var oTestControl = bTestOuter ? oTestControl1 : oTestControl2;
			oTestControl._bEventHandlerCalled = true;
			assert.equal(oEvent.type, "sapdelayeddoubleclick", "Event type correct");
			assert.ok(oEvent.srcControl, "Event attribute 'srcControl' available");
			if (oEvent.srcControl) {
				assert.equal(oEvent.srcControl.getId(), "test2", "Event attribute 'srcControl' correct");
			}
		};

		oTestControl1["onsapdelayeddoubleclick"] = function(oEvent){fnCheck(oEvent, true);};
		oTestControl2["onsapdelayeddoubleclick"] = function(oEvent){fnCheck(oEvent, false);};

		triggerDelayedDoubleClick("test2-Inner", function(){
			assert.ok(oTestControl1._bEventHandlerCalled, "Event Handler called on control 1");
			assert.ok(oTestControl2._bEventHandlerCalled, "Event Handler called on control 2");

			oTestControl1._bEventHandlerCalled = undefined;
			oTestControl2._bEventHandlerCalled = undefined;
			oTestControl1["onsapdelayeddoubleclick"] = undefined;
			oTestControl2["onsapdelayeddoubleclick"] = undefined;
			done();
		});
	});

	QUnit.test("sapdelayeddoubleclick Event (bubbling cancelled)", function(assert){
		var done = assert.async();
		var fnCheck = function(oEvent, bTestOuter) {
			if (!bTestOuter) {
				oEvent.stopPropagation();
			}
			var oTestControl = bTestOuter ? oTestControl1 : oTestControl2;
			oTestControl._bEventHandlerCalled = true;
			assert.equal(oEvent.type, "sapdelayeddoubleclick", "Event type correct");
			assert.ok(oEvent.srcControl, "Event attribute 'srcControl' available");
			if (oEvent.srcControl) {
				assert.equal(oEvent.srcControl.getId(), "test2", "Event attribute 'srcControl' correct");
			}
		};

		oTestControl1["onsapdelayeddoubleclick"] = function(oEvent){fnCheck(oEvent, true);};
		oTestControl2["onsapdelayeddoubleclick"] = function(oEvent){fnCheck(oEvent, false);};

		triggerDelayedDoubleClick("test2-Inner", function(){
			assert.ok(!oTestControl1._bEventHandlerCalled, "Event Handler not called on control 1");
			assert.ok(oTestControl2._bEventHandlerCalled, "Event Handler called on control 2");

			oTestControl1._bEventHandlerCalled = undefined;
			oTestControl2._bEventHandlerCalled = undefined;
			oTestControl1["onsapdelayeddoubleclick"] = undefined;
			oTestControl2["onsapdelayeddoubleclick"] = undefined;
			done();
		});
	});


	//***************************************

	if (Device.support.touch){
		//***************************************
		QUnit.module("Mobile Browser Events");

		for (var i = 0; i < aMobileBrowserEvents.length; i++){
			doTestCtrlEvent(aMobileBrowserEvents[i], null, /*Satisfy jQuery Mobile*/{touches:[{pageX:0, pageY:0}], targetTouches: [{pageX:0, pageY:0}], changedTouches: [{pageX:0, pageY:0}]});
		}


		//***************************************
		QUnit.module("Mobile Pseudo Events");

		doTestPseudoEvent(bRtl ? "swiperight" : "swipeleft", "swipebegin", 1);
		doTestPseudoEvent(!bRtl ? "swiperight" : "swipeleft", "swipeend", 1);
	}

	QUnit.module("Private extensions of jQuery event object");

	/* ------------------------------ */
	/* setMarked() + isMarked         */
	/* ------------------------------ */

	var setMarkedTestCase = function(mOptions) {

		QUnit.test("setMarked()", function(assert) {

			// system under test + arrange
			var oEvent = mOptions.event;

			// act
			oEvent.setMarked(mOptions.mark);

			// assertions
			if (mOptions.mark) {
				assert.strictEqual(oEvent.isMarked(mOptions.mark), true);
			} else {
				assert.strictEqual(oEvent.isMarked(), true);
			}
		});
	};

	setMarkedTestCase({
		event: new jQuery.Event("click", {
			originalEvent: {}
		}),
		mark: "handledByControl"
	});

	setMarkedTestCase({
		event: new jQuery.Event("click"),
		mark: "handledByControl"
	});

	setMarkedTestCase({
		event: new jQuery.Event("mousedown")
	});

	setMarkedTestCase({
		event: new jQuery.Event("mousedown", {
			originalEvent: {}
		})
	});

	QUnit.test("setMarked() on an event which has originalEvent point to itself", function(assert) {
		var oEvent = new jQuery.Event("mousedown"),
			sMark = "mark";

		// system under test + arrange
		// make the oEvent self-contained in the originalEvent property
		oEvent.originalEvent = oEvent;

		// act
		oEvent.setMarked(sMark);

		// assertion
		assert.ok(oEvent.isMarked(sMark), "self-contained event is correctly marked");
	});

	/* ------------------------------ */
	/* setMark() + isMarked           */
	/* ------------------------------ */

	var setMarkTestCase = function(mOptions) {

		QUnit.test("setMark()", function(assert) {

			// system under test + arrange
			var oEvent = mOptions.event;

			// act
			if (mOptions.value) {
				oEvent.setMark(mOptions.mark, mOptions.value);
			} else {
				oEvent.setMark(mOptions.mark);
			}

			// assertions
			assert.strictEqual(oEvent.isMarked(mOptions.mark), true);
		});
	};

	setMarkTestCase({
		event: new jQuery.Event("click", {
			originalEvent: {}
		}),
		mark: "handledByComponent"
	});

	setMarkTestCase({
		event: new jQuery.Event("click"),
		mark: "handledByComponent"
	});

	setMarkTestCase({
		event: new jQuery.Event("mousedown", {
			originalEvent: {}
		}),
		mark: "handledByComponent",
		value: "some-value"
	});

	setMarkTestCase({
		event: new jQuery.Event("mousedown"),
		mark: "handledByComponent",
		value: "some-value"
	});

	QUnit.module("");

	/* ------------------------------ */
	/* jQuery.sap.isSpecialKey()      */
	/* ------------------------------ */

	var fnIsSpecialKeyTestCase = function(sEventName, mOptions, bOuput, sDescription, bIgnoreKeypress) {
		QUnit.test("jQuery.sap.isSpecialKey() " + sDescription, function(assert) {
			if (bIgnoreKeypress) {
				assert.ok(true, "Keypress ignored for (" + sDescription + ")");
			} else {
				// arrange
				var oEvent = new jQuery.Event(sEventName);
				jQuery.extend(oEvent, mOptions);

				// assertions
				assert.strictEqual(jQuery.sap.isSpecialKey(oEvent), bOuput);
			}
		});
	};

	// events without key property
	// The original coding, which checks for "which" handles keypresses differently based on the current browser.
	// So we ignore some of these events for the keypress checks.
	// keydown and keyup events are fired for all keys, keypress only for "characters" (incl. numbers & accents, etc.).
	// For modifiers/special keys a keypress is not fired.
	// Yet Firefox (especially) behave differently than Chrome for Keys like BREAK, PAGE_UP, etc.
	// See the jquery.sap.events module (see handling of keydown/keyup/keypress in jQuery.sap.isSpecialKey).
	["keydown", "keyup", "keypress"].forEach(function (sKeyType) {
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.BREAK }, true, "Event: " + sKeyType + ", Key: BREAK", true);
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.PAGE_UP }, true, "Event: " + sKeyType + ", Key: PAGE_UP", true);
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.PAGE_DOWN }, true, "Event: " + sKeyType + ", Key: PAGE_DOWN", true);
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.END }, true, "Event: " + sKeyType + ", Key: END", true);
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.HOME }, true, "Event: " + sKeyType + ", Key: HOME", true);
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.PRINT }, true, "Event: " + sKeyType + ", Key: PRINT", true);
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.INSERT }, true, "Event: " + sKeyType + ", Key: INSERT", true);
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.DELETE }, true, "Event: " + sKeyType + ", Key: DELETE", true);
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.F1 }, true, "Event: " + sKeyType + ", Key: F1", true);
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.F2 }, true, "Event: " + sKeyType + ", Key: F2", true);
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.F3 }, true, "Event: " + sKeyType + ", Key: F3", true);
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.F4 }, true, "Event: " + sKeyType + ", Key: F4", true);
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.F5 }, true, "Event: " + sKeyType + ", Key: F5", true);
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.F6 }, true, "Event: " + sKeyType + ", Key: F6", true);
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.F7 }, true, "Event: " + sKeyType + ", Key: F7", true);
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.F8 }, true, "Event: " + sKeyType + ", Key: F8", true);
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.F9 }, true, "Event: " + sKeyType + ", Key: F9", true);
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.F10 }, true, "Event: " + sKeyType + ", Key: F10", true);
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.F11 }, true, "Event: " + sKeyType + ", Key: F11", true);
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.F12 }, true, "Event: " + sKeyType + ", Key: F12", true);
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.BACKSPACE }, true, "Event: " + sKeyType + ", Key: BACKSPACE", true);
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.TAB }, true, "Event: " + sKeyType + ", Key: TAB", true);
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.ENTER }, true, "Event: " + sKeyType + ", Key: ENTER", true);
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.ESCAPE }, true, "Event: " + sKeyType + ", Key: ESCAPE", true);
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.SCROLL_LOCK }, true, "Event: " + sKeyType + ", Key: SCROLL_LOCK", true);
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.A }, false, "Event: " + sKeyType + ", Key: A");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.B }, false, "Event: " + sKeyType + ", Key: B");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.BACKSLASH }, false, "Event: " + sKeyType + ", Key: BACKSLASH");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.C }, false, "Event: " + sKeyType + ", Key: C");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.COMMA }, false, "Event: " + sKeyType + ", Key: COMMA");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.D }, false, "Event: " + sKeyType + ", Key: D");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.DIGIT_0 }, false, "Event: " + sKeyType + ", Key: DIGIT_0");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.DIGIT_1 }, false, "Event: " + sKeyType + ", Key: DIGIT_1");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.DIGIT_2 }, false, "Event: " + sKeyType + ", Key: DIGIT_2");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.DIGIT_3 }, false, "Event: " + sKeyType + ", Key: DIGIT_3");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.DIGIT_4 }, false, "Event: " + sKeyType + ", Key: DIGIT_4");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.DIGIT_5 }, false, "Event: " + sKeyType + ", Key: DIGIT_5");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.DIGIT_6 }, false, "Event: " + sKeyType + ", Key: DIGIT_6");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.DIGIT_7 }, false, "Event: " + sKeyType + ", Key: DIGIT_7");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.DIGIT_8 }, false, "Event: " + sKeyType + ", Key: DIGIT_8");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.DIGIT_9 }, false, "Event: " + sKeyType + ", Key: DIGIT_9");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.DOT }, false, "Event: " + sKeyType + ", Key: DOT");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.E }, false, "Event: " + sKeyType + ", Key: E");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.EQUALS }, false, "Event: " + sKeyType + ", Key: EQUALS");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.F }, false, "Event: " + sKeyType + ", Key: F");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.G }, false, "Event: " + sKeyType + ", Key: G");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.GREAT_ACCENT }, false, "Event: " + sKeyType + ", Key: GREAT_ACCENT");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.H }, false, "Event: " + sKeyType + ", Key: H");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.I }, false, "Event: " + sKeyType + ", Key: I");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.J }, false, "Event: " + sKeyType + ", Key: J");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.K }, false, "Event: " + sKeyType + ", Key: K");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.L }, false, "Event: " + sKeyType + ", Key: L");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.M }, false, "Event: " + sKeyType + ", Key: M");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.MINUS }, false, "Event: " + sKeyType + ", Key: MINUS");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.N }, false, "Event: " + sKeyType + ", Key: N");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.NUMPAD_0 }, false, "Event: " + sKeyType + ", Key: NUMPAD_0");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.NUMPAD_1 }, false, "Event: " + sKeyType + ", Key: NUMPAD_1");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.NUMPAD_2 }, false, "Event: " + sKeyType + ", Key: NUMPAD_2");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.NUMPAD_3 }, false, "Event: " + sKeyType + ", Key: NUMPAD_3");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.NUMPAD_4 }, false, "Event: " + sKeyType + ", Key: NUMPAD_4");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.NUMPAD_5 }, false, "Event: " + sKeyType + ", Key: NUMPAD_5");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.NUMPAD_6 }, false, "Event: " + sKeyType + ", Key: NUMPAD_6");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.NUMPAD_7 }, false, "Event: " + sKeyType + ", Key: NUMPAD_7");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.NUMPAD_8 }, false, "Event: " + sKeyType + ", Key: NUMPAD_8");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.NUMPAD_9 }, false, "Event: " + sKeyType + ", Key: NUMPAD_9");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.NUMPAD_ASTERISK }, false, "Event: " + sKeyType + ", Key: NUMPAD_ASTERISK");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.NUMPAD_COMMA }, false, "Event: " + sKeyType + ", Key: NUMPAD_COMMA");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.NUMPAD_MINUS }, false, "Event: " + sKeyType + ", Key: NUMPAD_MINUS");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.NUMPAD_PLUS }, false, "Event: " + sKeyType + ", Key: NUMPAD_PLUS");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.NUMPAD_SLASH }, false, "Event: " + sKeyType + ", Key: NUMPAD_SLASH");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.OPEN_BRACKET }, false, "Event: " + sKeyType + ", Key: OPEN_BRACKET");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.P }, false, "Event: " + sKeyType + ", Key: P");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.PIPE }, false, "Event: " + sKeyType + ", Key: PIPE");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.PLUS }, false, "Event: " + sKeyType + ", Key: PLUS");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.Q }, false, "Event: " + sKeyType + ", Key: Q");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.R }, false, "Event: " + sKeyType + ", Key: R");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.S }, false, "Event: " + sKeyType + ", Key: S");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.SEMICOLON }, false, "Event: " + sKeyType + ", Key: SEMICOLON");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.SINGLE_QUOTE }, false, "Event: " + sKeyType + ", Key: SINGLE_QUOTE");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.SLASH }, false, "Event: " + sKeyType + ", Key: SLASH");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.SPACE }, false, "Event: " + sKeyType + ", Key: SPACE");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.T }, false, "Event: " + sKeyType + ", Key: T");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.U }, false, "Event: " + sKeyType + ", Key: U");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.V }, false, "Event: " + sKeyType + ", Key: V");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.W }, false, "Event: " + sKeyType + ", Key: W");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.X }, false, "Event: " + sKeyType + ", Key: X");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.Y }, false, "Event: " + sKeyType + ", Key: Y");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.Z }, false, "Event: " + sKeyType + ", Key: Z");
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.SHIFT }, true, "Event: " + sKeyType + ", Key: SHIFT", true);
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.CONTROL }, true, "Event: " + sKeyType + ", Key: CONTROL", true);
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.ALT }, true, "Event: " + sKeyType + ", Key: ALT", true);
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.CAPS_LOCK }, true, "Event: " + sKeyType + ", Key: CAPS_LOCK", true);
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.NUM_LOCK }, true, "Event: " + sKeyType + ", Key: NUM_LOCK", true);
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.ARROW_LEFT }, true, "Event: " + sKeyType + ", Key: ARROW_LEFT", true);
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.ARROW_UP }, true, "Event: " + sKeyType + ", Key: ARROW_UP", true);
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.ARROW_RIGHT }, true, "Event: " + sKeyType + ", Key: ARROW_RIGHT", true);
		fnIsSpecialKeyTestCase(sKeyType, { which: jQuery.sap.KeyCodes.ARROW_DOWN }, true, "Event: " + sKeyType + ", Key: ARROW_DOWN", true);
	});

	["keydown", "keyup", "keypress"].forEach(function (sKeyType) {
		fnIsSpecialKeyTestCase(sKeyType, { key: "Pause" }, true, "Event: " + sKeyType + ", Key: Pause");
		fnIsSpecialKeyTestCase(sKeyType, { key: "PageUp" }, true, "Event: " + sKeyType + ", Key: Page_UP");
		fnIsSpecialKeyTestCase(sKeyType, { key: "PageDown" }, true, "Event: " + sKeyType + ", Key: Page_Down");
		fnIsSpecialKeyTestCase(sKeyType, { key: "End" }, true, "Event: " + sKeyType + ", Key: END");
		fnIsSpecialKeyTestCase(sKeyType, { key: "Home" }, true, "Event: " + sKeyType + ", Key: Home");
		fnIsSpecialKeyTestCase(sKeyType, { key: "PrintScreen" }, true, "Event: " + sKeyType + ", Key: Print");
		fnIsSpecialKeyTestCase(sKeyType, { key: "Insert" }, true, "Event: " + sKeyType + ", Key: Insert");
		fnIsSpecialKeyTestCase(sKeyType, { key: "Delete" }, true, "Event: " + sKeyType + ", Key: Delete");
		fnIsSpecialKeyTestCase(sKeyType, { key: "F1" }, true, "Event: " + sKeyType + ", Key: F1");
		fnIsSpecialKeyTestCase(sKeyType, { key: "F2" }, true, "Event: " + sKeyType + ", Key: F2");
		fnIsSpecialKeyTestCase(sKeyType, { key: "F3" }, true, "Event: " + sKeyType + ", Key: F3");
		fnIsSpecialKeyTestCase(sKeyType, { key: "F4" }, true, "Event: " + sKeyType + ", Key: F4");
		fnIsSpecialKeyTestCase(sKeyType, { key: "F5" }, true, "Event: " + sKeyType + ", Key: F5");
		fnIsSpecialKeyTestCase(sKeyType, { key: "F6" }, true, "Event: " + sKeyType + ", Key: F6");
		fnIsSpecialKeyTestCase(sKeyType, { key: "F7" }, true, "Event: " + sKeyType + ", Key: F7");
		fnIsSpecialKeyTestCase(sKeyType, { key: "F8" }, true, "Event: " + sKeyType + ", Key: F8");
		fnIsSpecialKeyTestCase(sKeyType, { key: "F9" }, true, "Event: " + sKeyType + ", Key: F9");
		fnIsSpecialKeyTestCase(sKeyType, { key: "F10" }, true, "Event: " + sKeyType + ", Key: F10");
		fnIsSpecialKeyTestCase(sKeyType, { key: "F11" }, true, "Event: " + sKeyType + ", Key: F11");
		fnIsSpecialKeyTestCase(sKeyType, { key: "F12" }, true, "Event: " + sKeyType + ", Key: F12");
		fnIsSpecialKeyTestCase(sKeyType, { key: "Backspace" }, true, "Event: " + sKeyType + ", Key: Backspace");
		fnIsSpecialKeyTestCase(sKeyType, { key: "Tab" }, true, "Event: " + sKeyType + ", Key: TAB");
		fnIsSpecialKeyTestCase(sKeyType, { key: "Enter" }, true, "Event: " + sKeyType + ", Key: Enter");
		fnIsSpecialKeyTestCase(sKeyType, { key: "Escape" }, true, "Event: " + sKeyType + ", Key: Escape");
		fnIsSpecialKeyTestCase(sKeyType, { key: "ScrollLock" }, true, "Event: " + sKeyType + ", Key: Scroll_Lock");
		fnIsSpecialKeyTestCase(sKeyType, { key: "A" }, false, "Event: " + sKeyType + ", Key: A");
		fnIsSpecialKeyTestCase(sKeyType, { key: "B" }, false, "Event: " + sKeyType + ", Key: B");
		fnIsSpecialKeyTestCase(sKeyType, { key: "\\" }, false, "Event: " + sKeyType + ", Key: Backslash");
		fnIsSpecialKeyTestCase(sKeyType, { key: "C" }, false, "Event: " + sKeyType + ", Key: C");
		fnIsSpecialKeyTestCase(sKeyType, { key: "," }, false, "Event: " + sKeyType + ", Key: Comma");
		fnIsSpecialKeyTestCase(sKeyType, { key: "D" }, false, "Event: " + sKeyType + ", Key: D");
		fnIsSpecialKeyTestCase(sKeyType, { key: "0" }, false, "Event: " + sKeyType + ", Key: 0");
		fnIsSpecialKeyTestCase(sKeyType, { key: "1" }, false, "Event: " + sKeyType + ", Key: 1");
		fnIsSpecialKeyTestCase(sKeyType, { key: "2" }, false, "Event: " + sKeyType + ", Key: 2");
		fnIsSpecialKeyTestCase(sKeyType, { key: "3" }, false, "Event: " + sKeyType + ", Key: 3");
		fnIsSpecialKeyTestCase(sKeyType, { key: "4" }, false, "Event: " + sKeyType + ", Key: 4");
		fnIsSpecialKeyTestCase(sKeyType, { key: "5" }, false, "Event: " + sKeyType + ", Key: 5");
		fnIsSpecialKeyTestCase(sKeyType, { key: "6" }, false, "Event: " + sKeyType + ", Key: 6");
		fnIsSpecialKeyTestCase(sKeyType, { key: "7" }, false, "Event: " + sKeyType + ", Key: 7");
		fnIsSpecialKeyTestCase(sKeyType, { key: "8" }, false, "Event: " + sKeyType + ", Key: 8");
		fnIsSpecialKeyTestCase(sKeyType, { key: "9" }, false, "Event: " + sKeyType + ", Key: 9");
		fnIsSpecialKeyTestCase(sKeyType, { key: "." }, false, "Event: " + sKeyType + ", Key: DOT");
		fnIsSpecialKeyTestCase(sKeyType, { key: "E" }, false, "Event: " + sKeyType + ", Key: E");
		fnIsSpecialKeyTestCase(sKeyType, { key: "=" }, false, "Event: " + sKeyType + ", Key: Equals");
		fnIsSpecialKeyTestCase(sKeyType, { key: "F" }, false, "Event: " + sKeyType + ", Key: F");
		fnIsSpecialKeyTestCase(sKeyType, { key: "G" }, false, "Event: " + sKeyType + ", Key: G");
		fnIsSpecialKeyTestCase(sKeyType, { key: "`" }, false, "Event: " + sKeyType + ", Key: Great_Accent");
		fnIsSpecialKeyTestCase(sKeyType, { key: "H" }, false, "Event: " + sKeyType + ", Key: H");
		fnIsSpecialKeyTestCase(sKeyType, { key: "I" }, false, "Event: " + sKeyType + ", Key: I");
		fnIsSpecialKeyTestCase(sKeyType, { key: "J" }, false, "Event: " + sKeyType + ", Key: J");
		fnIsSpecialKeyTestCase(sKeyType, { key: "K" }, false, "Event: " + sKeyType + ", Key: K");
		fnIsSpecialKeyTestCase(sKeyType, { key: "L" }, false, "Event: " + sKeyType + ", Key: L");
		fnIsSpecialKeyTestCase(sKeyType, { key: "M" }, false, "Event: " + sKeyType + ", Key: M");
		fnIsSpecialKeyTestCase(sKeyType, { key: "-" }, false, "Event: " + sKeyType + ", Key: Minus");
		fnIsSpecialKeyTestCase(sKeyType, { key: "N", location: "NUMPAD" }, false, "Event: " + sKeyType + ", Key: N");
		fnIsSpecialKeyTestCase(sKeyType, { key: "0", location: "NUMPAD" }, false, "Event: " + sKeyType + ", Key: Numpad_0");
		fnIsSpecialKeyTestCase(sKeyType, { key: "1", location: "NUMPAD" }, false, "Event: " + sKeyType + ", Key: Numpad_1");
		fnIsSpecialKeyTestCase(sKeyType, { key: "2", location: "NUMPAD" }, false, "Event: " + sKeyType + ", Key: Numpad_2");
		fnIsSpecialKeyTestCase(sKeyType, { key: "3", location: "NUMPAD" }, false, "Event: " + sKeyType + ", Key: Numpad_3");
		fnIsSpecialKeyTestCase(sKeyType, { key: "4", location: "NUMPAD" }, false, "Event: " + sKeyType + ", Key: Numpad_4");
		fnIsSpecialKeyTestCase(sKeyType, { key: "5", location: "NUMPAD" }, false, "Event: " + sKeyType + ", Key: Numpad_5");
		fnIsSpecialKeyTestCase(sKeyType, { key: "6", location: "NUMPAD" }, false, "Event: " + sKeyType + ", Key: Numpad_6");
		fnIsSpecialKeyTestCase(sKeyType, { key: "7", location: "NUMPAD" }, false, "Event: " + sKeyType + ", Key: Numpad_7");
		fnIsSpecialKeyTestCase(sKeyType, { key: "8", location: "NUMPAD" }, false, "Event: " + sKeyType + ", Key: Numpad_8");
		fnIsSpecialKeyTestCase(sKeyType, { key: "9", location: "NUMPAD" }, false, "Event: " + sKeyType + ", Key: Numpad_9");
		fnIsSpecialKeyTestCase(sKeyType, { key: "*", location: "NUMPAD" }, false, "Event: " + sKeyType + ", Key: Numpad_Asterisk");
		fnIsSpecialKeyTestCase(sKeyType, { key: ",", location: "NUMPAD" }, false, "Event: " + sKeyType + ", Key: Numpad_Comma");
		fnIsSpecialKeyTestCase(sKeyType, { key: "-", location: "NUMPAD" }, false, "Event: " + sKeyType + ", Key: Numpad_Minus");
		fnIsSpecialKeyTestCase(sKeyType, { key: "+", location: "NUMPAD" }, false, "Event: " + sKeyType + ", Key: Numpad_Plus");
		fnIsSpecialKeyTestCase(sKeyType, { key: "/", location: "NUMPAD" }, false, "Event: " + sKeyType + ", Key: Numpad_Slash");
		fnIsSpecialKeyTestCase(sKeyType, { key: "(" }, false, "Event: " + sKeyType + ", Key: Open_Bracket");
		fnIsSpecialKeyTestCase(sKeyType, { key: "P" }, false, "Event: " + sKeyType + ", Key: P");
		fnIsSpecialKeyTestCase(sKeyType, { key: "|" }, false, "Event: " + sKeyType + ", Key: Pipe");
		fnIsSpecialKeyTestCase(sKeyType, { key: "+" }, false, "Event: " + sKeyType + ", Key: Plus");
		fnIsSpecialKeyTestCase(sKeyType, { key: "Q" }, false, "Event: " + sKeyType + ", Key: Q");
		fnIsSpecialKeyTestCase(sKeyType, { key: "R" }, false, "Event: " + sKeyType + ", Key: R");
		fnIsSpecialKeyTestCase(sKeyType, { key: "S" }, false, "Event: " + sKeyType + ", Key: S");
		fnIsSpecialKeyTestCase(sKeyType, { key: ";" }, false, "Event: " + sKeyType + ", Key: Semicolon");
		fnIsSpecialKeyTestCase(sKeyType, { key: "'" }, false, "Event: " + sKeyType + ", Key: Single_Quote");
		fnIsSpecialKeyTestCase(sKeyType, { key: "/" }, false, "Event: " + sKeyType + ", Key: Slash");
		fnIsSpecialKeyTestCase(sKeyType, { key: " " }, false, "Event: " + sKeyType + ", Key: Space");
		fnIsSpecialKeyTestCase(sKeyType, { key: "T" }, false, "Event: " + sKeyType + ", Key: T");
		fnIsSpecialKeyTestCase(sKeyType, { key: "U" }, false, "Event: " + sKeyType + ", Key: U");
		fnIsSpecialKeyTestCase(sKeyType, { key: "V" }, false, "Event: " + sKeyType + ", Key: V");
		fnIsSpecialKeyTestCase(sKeyType, { key: "W" }, false, "Event: " + sKeyType + ", Key: W");
		fnIsSpecialKeyTestCase(sKeyType, { key: "X" }, false, "Event: " + sKeyType + ", Key: X");
		fnIsSpecialKeyTestCase(sKeyType, { key: "Y" }, false, "Event: " + sKeyType + ", Key: Y");
		fnIsSpecialKeyTestCase(sKeyType, { key: "Z" }, false, "Event: " + sKeyType + ", Key: Z");
		fnIsSpecialKeyTestCase(sKeyType, { key: "Shift" }, true, "Event: " + sKeyType + ", Key: Shift");
		fnIsSpecialKeyTestCase(sKeyType, { key: "Control" }, true, "Event: " + sKeyType + ", Key: Control");
		fnIsSpecialKeyTestCase(sKeyType, { key: "Alt" }, true, "Event: " + sKeyType + ", Key: ALT");
		fnIsSpecialKeyTestCase(sKeyType, { key: "CapsLock" }, true, "Event: " + sKeyType + ", Key: Caps_Lock");
		fnIsSpecialKeyTestCase(sKeyType, { key: "NumLock" }, true, "Event: " + sKeyType + ", Key: NUM_Lock");
		fnIsSpecialKeyTestCase(sKeyType, { key: "ArrowLeft" }, true, "Event: " + sKeyType + ", Key: Arrow_Left");
		fnIsSpecialKeyTestCase(sKeyType, { key: "ArrowUp" }, true, "Event: " + sKeyType + ", Key: Arrow_UP");
		fnIsSpecialKeyTestCase(sKeyType, { key: "ArrowRight" }, true, "Event: " + sKeyType + ", Key: Arrow_Right");
		fnIsSpecialKeyTestCase(sKeyType, { key: "ArrowDown" }, true, "Event: " + sKeyType + ", Key: Arrow_Down");
	});


	QUnit.module("jQuery.sap.isMouseEventDelayed");

	QUnit.test("isMouseEventDelayed is set", function(assert) {
		assert.equal(jQuery.sap.isMouseEventDelayed, false, "isMouseEventDelayed is set");
	});

	var cleanupDelegatesAndEventListener = function(assert) {
		//ensure all delegates are deregistered
		oTestControl1.aDelegates.slice().forEach(function(oDelegate) {
			oTestControl1.removeDelegate(oDelegate.oDelegate);
		});
		assert.equal(oTestControl1.aDelegates.length, 0);


		//cleanup taphold event listener
		var oElement = oTestControl1.$();
		oElement.off("taphold");
	};

	// test iOS specific behaviour
	if (Device.ios) {
		QUnit.module("jQuery.sap.events context menu simulation for iOS", {
			beforeEach: cleanupDelegatesAndEventListener,
			afterEach: cleanupDelegatesAndEventListener
		});

		QUnit.test("Simulated event for contextmenu under iOS", function(assert) {
			var done = assert.async();

			//reload events with simulated ios device to map "sapcontextmenu" event
			sap.ui.require(["jquery.sap.events"], function(jQUeryEvents) {
				var uiArea = sap.ui.getCore().getUIArea("uiArea");

				//trigger reload of events in order to have "sapcontextmenu" event as part of ControlEvents array
				var oldRootNode = uiArea.getRootNode();
				uiArea.setRootNode(null);
				uiArea.setRootNode(oldRootNode);

				// add event listener for contextmenu event
				oTestControl1.addEventDelegate({oncontextmenu: function(oEvent){
						assert.equal(oEvent.type, "contextmenu");
						done();
					}}, oTestControl1);

				//trigger sapcontextmenu custom event
				oTestControl1.$().trigger("taphold");
			});
		});

		QUnit.test("Simulated event for contextmenu under iOS with selected text", function(assert) {
			var done = assert.async();
			assert.expect(3);

			this.stub(window, "getSelection").callsFake(function () { return "someText"; });

			sap.ui.require(["jquery.sap.events"], function(jQUeryEvents) {
				var uiArea = sap.ui.getCore().getUIArea("uiArea");

				//trigger reload of events in order to have "sapcontextmenu" event as part of ControlEvents array
				var oldRootNode = uiArea.getRootNode();
				uiArea.setRootNode(null);
				uiArea.setRootNode(oldRootNode);

				oTestControl1.addEventDelegate({oncontextmenu: function(oEvent){
						assert.notOk(true, "oncontextmenu should not be fired");
					}}, oTestControl1);

				//trigger sapcontextmenu custom event
				var oElement = oTestControl1.$();
				oElement.on("taphold", function() {
					assert.ok(true);
					done();
				});

				//trigger sapcontextmenu custom event
				oElement.trigger("taphold");
			});
		});

		QUnit.test("Simulated event for contextmenu under iOS without selected text", function(assert) {
			var done = assert.async();

			this.stub(window, "getSelection").callsFake(function () { return ""; });

			sap.ui.require(["jquery.sap.events"], function(jQUeryEvents) {
				var uiArea = sap.ui.getCore().getUIArea("uiArea");

				//trigger reload of events in order to have "sapcontextmenu" event as part of ControlEvents array
				var oldRootNode = uiArea.getRootNode();
				uiArea.setRootNode(null);
				uiArea.setRootNode(oldRootNode);

				// add event listener for contextmenu event
				oTestControl1.addEventDelegate({oncontextmenu: function(oEvent){
						assert.equal(oEvent.type, "contextmenu");
						done();
					}}, oTestControl1);

				//trigger sapcontextmenu custom event
				oTestControl1.$().trigger("taphold");
			});
		});
	} else {
		QUnit.module("jQuery.sap.events context menu simulation", {
			beforeEach: cleanupDelegatesAndEventListener,
			afterEach: cleanupDelegatesAndEventListener
		});

		QUnit.test("Simulated event for contextmenu under non-iOS", function(assert) {
			var done = assert.async();

			sap.ui.require(["jquery.sap.events"], function(jQUeryEvents) {
				var uiArea = sap.ui.getCore().getUIArea("uiArea");

				//trigger reload of events in order to have "sapcontextmenu" event as part of ControlEvents array
				var oldRootNode = uiArea.getRootNode();
				uiArea.setRootNode(null);
				uiArea.setRootNode(oldRootNode);

				// add event listener for contextmenu event

				oTestControl1.addEventDelegate({oncontextmenu: function(oEvent){
						assert.notOk(true, "oncontextmenu should not be fired");
					}}, oTestControl1);

				var oElement = oTestControl1.$();
				oElement.on("taphold", function() {
					assert.ok(true);
					done();
				});

				oElement.trigger("taphold");
			});
		});
	}

	if (!Device.support.touch) {
		QUnit.module("mouse to touch event simluation", {
			beforeEach: function() {
				this.triggerEvent = function(sEventName, oDomRef) {
					return qutils.triggerEvent(sEventName, oDomRef, {
						target: oDomRef
					});
				};
				this.oControl = new MobileEventTest("mytest1");
				this.oChildControl = new MobileEventTest("mytest2");

				this.oControl.setChild(this.oChildControl);
				this.oControl.placeAt("uiArea");
				return nextUIUpdate();
			},
			afterEach: function() {
				this.oControl.destroy();
			}
		});

		QUnit.test("touchmove should be fired when touchstart is triggered on the same control", function(assert) {
			var oControlDelegate = sinon.stub({
				ontouchstart: function() {},
				ontouchmove: function() {}
			});

			this.oControl.addEventDelegate(oControlDelegate);

			this.triggerEvent("mousedown", this.oControl.getDomRef());
			assert.equal(oControlDelegate.ontouchstart.callCount, 1, "The simulated touchstart event is fired on the control");

			this.triggerEvent("mousemove", this.oControl.getDomRef());
			assert.equal(oControlDelegate.ontouchmove.callCount, 1, "The simulated touchmove event is fired on the control");
		});

		QUnit.test("touchmove shouldn't be fired when touchstart is triggered on another control", function(assert) {
			var oControlDelegate = sinon.stub({
				ontouchstart: function() {}
			});

			var oChildControlDelegate = sinon.stub({
				ontouchmove: function() {}
			});

			this.oControl.addEventDelegate(oControlDelegate);
			this.oChildControl.addEventDelegate(oChildControlDelegate);

			this.triggerEvent("mousedown", this.oControl.getDomRef());
			assert.equal(oControlDelegate.ontouchstart.callCount, 1, "The simulated touchstart event is fired on the control");

			this.triggerEvent("mousemove", this.oChildControl.getDomRef());
			assert.equal(oChildControlDelegate.ontouchmove.callCount, 0, "The simulated touchmove event isn't fired on the control");
		});
	}

});
