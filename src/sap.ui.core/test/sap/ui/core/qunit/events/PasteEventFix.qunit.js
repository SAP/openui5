/* global QUnit, sinon */
sap.ui.define(["sap/ui/events/PasteEventFix"], function() {
	"use strict";
	// create an focusable input element
	var oInput = document.createElement("input");
	oInput.id = "pasteEventTestInput";
	document.body.appendChild(oInput);

	var oAnotherInput = document.createElement("input");
	oAnotherInput.id = "anotherInput";
	document.body.appendChild(oAnotherInput);

	QUnit.module("Paste Event Fix");

	// PasteEventFix is using Event#isTrusted which is a read-only property therefore we cannot test this with synthetic events
	// For more details, please see https://dom.spec.whatwg.org/#dom-event-istrusted
	QUnit.skip("Paste event which has wrong target should be caught and dispatched to the active element", function(assert) {
		oInput.focus();
		assert.equal(document.activeElement.id, oInput.id, "Input is the current active element");

		var oSpy = sinon.spy();
		oInput.addEventListener("paste", oSpy);

		var oPasteEvent = document.createEvent("Event");
		oPasteEvent.initEvent("paste", true, true);

		// let the wrong target dispatch the event
		document.body.dispatchEvent(oPasteEvent);

		assert.equal(oSpy.callCount, 1, "The paste event handler on the input is called");
		oInput.removeEventListener("paste", oSpy);
	});

	QUnit.test("Paste event shouldn't be affected by the active element switch in the other event listeners", function(assert) {
		oInput.focus();

		var fnSwitchFocus = function() {
			oAnotherInput.focus();
		};

		oInput.addEventListener("paste", fnSwitchFocus);

		var oSpy = sinon.spy();
		oAnotherInput.addEventListener("paste", oSpy);

		var oPasteEvent = document.createEvent("Event");
		oPasteEvent.initEvent("paste", true, true);

		oInput.dispatchEvent(oPasteEvent);

		assert.notOk(oPasteEvent.defaultPrevented, "The default behavior of the paste event shouldn't be prevented");
		assert.ok(oSpy.notCalled, "The other input shouldn't get any paste event");

		oInput.removeEventListener("paste", fnSwitchFocus);
		oAnotherInput.removeEventListener("paste", oSpy);
	});
});
