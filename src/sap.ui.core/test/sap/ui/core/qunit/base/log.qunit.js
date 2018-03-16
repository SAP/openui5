/*!
 * ${copyright}
 */
/*global console, sinon, QUnit */
sap.ui.define(["sap/base/log"], function(log) {
	"use strict";
	/*eslint-disable no-console*/

	QUnit.module("sap.base.log.log", {
		beforeEach: function() {
			sinon.spy(console, "error");
			sinon.spy(console, "warn");
			sinon.spy(console, "info");
			sinon.spy(console, "debug");
			sinon.spy(console, "trace");
			log.setLevel(5);
		},
		afterEach: function() {
			console.error.restore();
			console.warn.restore();
			console.info.restore();
			console.debug.restore();
			console.trace.restore();
		}
	});

	/* as there could be other calls to console.xxx we need to reset the counter in each test */

	QUnit.test("getLogEntries", function(assert) {
		log.error("error");
		assert.ok(window.Array.isArray(log.getLog()), "Log entries array returned");
		assert.ok(log.getLog().length >= 1, "at least 1 log entry in array");
	});

	QUnit.test("log error", function(assert) {
		console.error.callCount = 0;
		log.error('error');
		assert.equal(console.error.callCount , 1, "error logged");
	});

	QUnit.test("log warning", function(assert) {
		console.warn.callCount = 0;
		log.warning('warning');
		assert.equal(console.warn.callCount, 1, "warning logged!");
	});

	QUnit.test("log information", function(assert) {
		console.info.callCount = 0;
		log.info('info');
		assert.equal(console.info.callCount, 1, "info logged!");
	});

	QUnit.test("log debug", function(assert) {
		console.debug.callCount = 0;
		log.debug('debug');
		assert.equal(console.debug.callCount, 1, "debug logged!");
	});

	QUnit.test("log trace", function(assert) {
		console.trace.callCount = 0;
		log.trace('trace');
		assert.equal(console.trace.callCount, 1, "trace logged!");
	});

	QUnit.test("log fatal", function(assert) {
		console.error.callCount = 0;
		log.fatal('fatal');
		assert.equal(console.error.callCount, 1, "fatal logged!");
	});

	QUnit.test("setLevel", function(assert) {
		console.error.callCount = 0;
		console.warn.callCount = 0;
		log.setLevel(1);
		log.error("test");
		assert.equal(console.error.callCount, 1, "error logged!");
		log.warning("test");
		assert.equal(console.warn.callCount, 0, "warning not logged!");
		log.setLevel(2);
		log.warning("test");
		assert.equal(console.warn.callCount, 1, "warning logged!");
	});

	QUnit.test("setLevel multiple components", function(assert) {
		console.warn.callCount = 0;
		console.error.callCount = 0;
		log.setLevel(1);
		log.setLevel(2, "comp");
		log.error("test");
		assert.equal(console.error.callCount, 1, "error logged!");
		log.error("test", "details", "comp");
		assert.equal(console.error.callCount, 2, "error for comp logged!");
		log.warning("test");
		assert.equal(console.warn.callCount, 0, "warning not logged!");
		log.warning("test", "details", "comp");
		assert.equal(console.warn.callCount, 1, "warning for comp logged!");
		log.setLevel(2);
		log.warning("test");
		assert.equal(console.warn.callCount, 2, "warning logged!");
	});

	QUnit.test("getLevel", function(assert) {
		assert.equal(log.getLevel(), 5, "Log level is set to 5");
		log.setLevel(2);
		assert.equal(log.getLevel(), 2, "Log level is set to 2");
	});

	QUnit.test("isLoggable", function(assert) {
		assert.ok(log.isLoggable(4), "Level 4 loggable - Log level is 5");
		log.setLevel(2);
		assert.notOk(log.isLoggable(4), "Level 4 not loggable - Log level is 2");
		log.setLevel(6);
		assert.ok(log.isLoggable(), "Default(Debug) Level loggable");
	});

	QUnit.test("logSupportInfo", function(assert) {
		var fnSupportInfo = sinon.spy(function() {return "support Info";});
		console.error.callCount = 0;
		console.warn.callCount = 0;
		log.setLevel(1);
		log.logSupportInfo(true);
		log.error("test", null, null, fnSupportInfo);
		assert.equal(console.error.callCount, 1, "error logged!");
		assert.equal(fnSupportInfo.callCount, 1, "supportInfo added!");
		log.warning("test", fnSupportInfo);
		assert.equal(console.warn.callCount, 0, "warning not logged!");
		assert.equal(fnSupportInfo.callCount, 1, "no additional supportInfo added!");
		log.setLevel(2);
		log.warning("test", "details", fnSupportInfo);
		assert.equal(console.warn.callCount, 1, "warning logged!");
		assert.equal(fnSupportInfo.callCount, 2, "supportInfo added!");
	});

	QUnit.test("Listener", function(assert) {
		var fnListener = sinon.spy(),
			fnAttachListener = sinon.spy(),
			fnDetachListener = sinon.spy(),
			oListener = {
				onLogEntry: fnListener,
				onAttachToLog: fnAttachListener,
				onDetachFromLog: fnDetachListener
			};

		log.addLogListener(oListener);
		log.error("test");
		assert.equal(fnListener.callCount, 1, "listener called");
		assert.equal(fnAttachListener.callCount, 1, "attached to log");
		assert.equal(fnDetachListener.callCount, 0, "not yet detached from log");
		log.warning("test");
		assert.equal(fnListener.callCount, 2, "listener called again");
		log.removeLogListener(oListener);
		log.warning("test");
		assert.equal(console.warn.callCount, 2, "listener not called: listener removed");
		assert.equal(fnAttachListener.callCount, 1, "attached to log");
		assert.equal(fnDetachListener.callCount, 1, "detached from log");
	});

	/*eslint-enable no-console*/
});