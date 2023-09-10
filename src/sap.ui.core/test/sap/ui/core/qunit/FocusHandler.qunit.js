/*global QUnit */
sap.ui.define([
	"sap/ui/core/FocusHandler",
	"sap/ui/core/Element",
	"sap/m/Input",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(FocusHandler, Element, Input, nextUIUpdate) {
	"use strict";

	// Control initialization
	var oControls = {};

	function initControl(idx) {
		var oElem = document.createElement("div");
		oElem.id = "uiArea" + idx;
		document.body.appendChild(oElem);
		var sId = "oControl" + idx;
		oControls[sId] = new Input(sId).placeAt("uiArea" + idx);
	}

	initControl(1);
	initControl(2);
	initControl(3);
	var oElem = document.createElement("input");
	oElem.id = "customInput";
	oElem.type = "text";
	document.body.appendChild(oElem);

	// Test functions

	QUnit.module("Basic");

	QUnit.test("Check FocusHandler initialized", function(assert) {
		assert.ok(FocusHandler, "FocusHandler initialized");
	});

	QUnit.test("Check FocusHandler initial state", function(assert) {
		assert.equal(FocusHandler.oCurrent, null, "Initial Value 'Current':");
		assert.equal(FocusHandler.oLast, null, "Initial Value 'Last':");
	});

	QUnit.test("Check internal FocusHandler reference of currently focused control is correct", function(assert) {
		assert.equal(FocusHandler.oCurrent, Element.getActiveElement()?.getId(), "Current not available:");
		oControls["oControl1"].focus();
		assert.equal(FocusHandler.oCurrent, Element.getActiveElement()?.getId(), "Current available:");
		document.getElementById("customInput").focus(); //Reset for next test
	});

	QUnit.module("Focus Tracking");

	QUnit.test("Check Focus Tracking", function(assert) {
		assert.equal(FocusHandler.oCurrent, null, "Initial Value 'Current':");
		oControls["oControl1"].focus();
		assert.equal(FocusHandler.oCurrent, "oControl1", "Value 'Current' after control focus:");
		oControls["oControl2"].focus();
		assert.equal(FocusHandler.oCurrent, "oControl2", "Value 'Current' after control focus:");
		document.getElementById("customInput").focus();
		assert.equal(FocusHandler.oCurrent, null, "Value 'Current' after outer focus:");
		oControls["oControl3"].focus();
		assert.equal(FocusHandler.oCurrent, "oControl3", "Value 'Current' after control focus:");
	});

	QUnit.test("Check sapfocusleave Event - Focus to Control", function(assert) {
		oControls["oControl1"].focus();
		var bHandlerCalled = false;
		oControls["oControl1"].onsapfocusleave = function(oEvent){
			bHandlerCalled = true;
			assert.equal(oEvent.type, "sapfocusleave", "Type of sapfocusleave Event:");
			assert.equal(oEvent.relatedControlId, "oControl2", "Related Control ID of sapfocusleave Event");
			var oFocusInfo = oEvent.relatedControlFocusInfo;
			assert.ok(oFocusInfo, "Focus Info available");
			if (oFocusInfo) {
				assert.equal(oFocusInfo.id, "oControl2", "Related Control FocusInfo ID of sapfocusleave Event");
			}
		};
		oControls["oControl2"].focus();
		assert.ok(bHandlerCalled, "Sapfocusleave Handler 'oControl1' should be called");
		delete oControls["oControl1"].onsapfocusleave;
	});

	QUnit.test("Check sapfocusleave Event - Focus to outer HTML", function(assert) {
		oControls["oControl1"].focus();
		var bHandlerCalled = false;
		oControls["oControl1"].onsapfocusleave = function(oEvent) {
			bHandlerCalled = true;
			assert.equal(oEvent.type, "sapfocusleave", "Type of sapfocusleave Event:");
			assert.equal(oEvent.relatedControlId, null, "Related Control ID of sapfocusleave Event");
			assert.ok(!oEvent.relatedControlFocusInfo, "Focus Info not available");
		};
		document.getElementById("customInput").focus();
		assert.ok(bHandlerCalled, "Sapfocusleave Handler 'oControl1' should be called");
	});

	QUnit.test("Check sapfocusleave Event - Focus lost", function(assert) {
		var done = assert.async();
		oControls["oControl1"].focus();
		var bHandlerCalled = false;
		oControls["oControl1"].onsapfocusleave = function(oEvent){
			bHandlerCalled = true;
			assert.equal(oEvent.type, "sapfocusleave", "Type of sapfocusleave Event:");
			assert.equal(oEvent.relatedControlId, null, "Related Control ID of sapfocusleave Event");
			assert.ok(!oEvent.relatedControlFocusInfo, "Focus Info not available");
		};
		//Change the focus handler temporarily
		var onfocusEvent_ORIG = FocusHandler.onfocusEvent;
		FocusHandler.onfocusEvent = function(sControlId){
			//Do nothing to simulate a window blur
		};

		setTimeout(function check() {
			assert.ok(bHandlerCalled, "Sapfocusleave Handler 'oControl1' should be called");

			//Revert the temporary changes
			FocusHandler.onfocusEvent = onfocusEvent_ORIG;
			delete oControls["oControl1"].onsapfocusleave;

			document.getElementById("customInput").focus();
			done();
		}, 100);
		oControls["oControl2"].focus();
	});

	QUnit.test("Check Custom Changes Reverted", function(assert) {
		//This test should only check whether the changes in the focus handler in the last test
		//are successfully reverted.
		var bOk = true;
		bOk = bOk && FocusHandler.oCurrent == null;
		oControls["oControl2"].focus();
		bOk = bOk && FocusHandler.oCurrent == "oControl2";
		oControls["oControl3"].focus();
		bOk = bOk && FocusHandler.oCurrent == "oControl3";
		document.getElementById("customInput").focus();
		bOk = bOk && FocusHandler.oCurrent == null;
		assert.ok(bOk, "Changes successfully reverted");
	});

	QUnit.module("Extending Focus Info");

	QUnit.test("add/remove extender for focus info", async function(assert) {
		var oDomRef;
		var oSpy = this.spy(function(oEvent, oData) {
			oDomRef = oEvent.getParameter("domRef");
			// extend the focus info
			oData.info.abc = "true";
		});
		var oApplyFocusInfoSpy = this.spy(oControls.oControl1, "applyFocusInfo");

		FocusHandler.addFocusInfoExtender(oSpy);

		oControls.oControl1.focus();

		oControls.oControl1.invalidate();
		await nextUIUpdate();

		assert.ok(oSpy.calledOnce, "focus info extender is called");
		assert.equal(oDomRef, oControls.oControl1.getDomRef(), "DOM element is given to the registered focus info extender");

		assert.ok(oApplyFocusInfoSpy.calledOnce, "Control gets focused");
		assert.ok(oApplyFocusInfoSpy.getCall(0).args[0].hasOwnProperty("abc"), "The extended information can reach the focused control");

		// trigger the focus info extender again
		oControls.oControl1.invalidate();
		await nextUIUpdate();

		assert.equal(oSpy.callCount, 2, "focus info extender is called, again");
		assert.equal(oDomRef, oControls.oControl1.getDomRef(), "DOM element is given to the registered focus info extender");

		assert.equal(oApplyFocusInfoSpy.callCount, 2, "applyFocusInfo is called again");
		assert.ok(oApplyFocusInfoSpy.getCall(1).args[0].hasOwnProperty("abc"), "The extended information can reach the focused control");

		oSpy.resetHistory();
		FocusHandler.removeFocusInfoExtender(oSpy);

		oControls.oControl1.invalidate();
		await nextUIUpdate();

		assert.ok(oSpy.notCalled, "Focus info extender isn't called anymore after it's removed");
	});

});
