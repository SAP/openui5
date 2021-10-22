/*!
 * ${copyright}
 */
/*global QUnit, sinon */
sap.ui.define(["sap/base/assert"], function(assert) {
	"use strict";

	/*eslint-disable no-console*/
	QUnit.module("sap.base.log.assert");

	QUnit.test("assert", function(QUnitAssert) {
		var assertSpy = this.spy(),
			sMessage = "foo",
			sRefMessage = sMessage,
			messageSpy = this.spy(function() {
				return sMessage;
			}),
			consoleAssert;

		// the fallback console.log is tested as well
		if (console.assert) {
			consoleAssert = console.assert;
			console.assert = assertSpy;
		} else {
			consoleAssert = console.log;
			console.log = assertSpy;
			sMessage = "[Assertions] " + sMessage;
		}

		assert(true, sMessage);
		QUnitAssert.notOk(assertSpy.called, "true, String");
		sinon.assert.neverCalledWith(assertSpy, true, sRefMessage);
		assertSpy.resetHistory();

		assert(false, sMessage);
		sinon.assert.calledOnce(assertSpy);
		sinon.assert.calledWith(assertSpy, false, sRefMessage);
		assertSpy.resetHistory();

		assert(true, messageSpy);
		QUnitAssert.notOk(messageSpy.called, "true, function");
		QUnitAssert.notOk(assertSpy.called);
		sinon.assert.neverCalledWith(assertSpy, true, sRefMessage);
		assertSpy.resetHistory();
		messageSpy.resetHistory();

		assert(false, messageSpy);
		sinon.assert.calledOnce(messageSpy);
		sinon.assert.calledOnce(assertSpy);
		sinon.assert.calledWith(assertSpy, false, sRefMessage);
		assertSpy.resetHistory();
		messageSpy.resetHistory();

		if (console.assert) {
			console.assert = consoleAssert;
		} else {
			console.log = consoleAssert;
		}
		/*eslint-enable no-console*/
	});
});