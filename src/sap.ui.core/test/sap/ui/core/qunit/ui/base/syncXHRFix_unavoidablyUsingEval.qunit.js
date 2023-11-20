/*global QUnit */
sap.ui.define(['sap/ui/thirdparty/jquery', 'sap/ui/Device', 'sap/ui/base/syncXHRFix'], function(jQuery, Device, syncXHRFix) {
	'use strict';

	var baseURL = "test-resources/sap/ui/core/qunit/ui/base/";

	QUnit.module("sap/ui/base/syncXHRFix (window.XMLHttpRequest)", {
		before: function() {
			// Fix is only required in Firefox
			if (Device.browser.firefox && window.Proxy) {
				syncXHRFix();
			}
		}
	});

	QUnit.test("sync/async", function(assert) {
		var bSyncOngoing = false,
			done = assert.async();
		jQuery.ajax({
			url: baseURL + "small.txt",
			async: true,
			cache: false
		}).then(function() {
			assert.ok(!bSyncOngoing, "Sync request is no longer running, when callback is called.");
			done();
		});
		bSyncOngoing = true;
		jQuery.ajax({
			url: baseURL + "big.txt",
			async: false,
			cache: false
		});
		bSyncOngoing = false;
	});

	QUnit.test("events", function(assert) {
		var bSyncOngoing = false,
			done = assert.async();

		var asyncXHR = new XMLHttpRequest();

		function asyncListener1(oEvent) {
			assert.equal(bSyncOngoing, false, "Handler must not be called while synchronous request is ongoing");
			assert.equal(oEvent.type, "readystatechange", "Event object exists and has the expected type");
			assert.ok(this === asyncXHR, "this-reference points to XHR object");
		}

		function asyncListener2(oEvent) {
			assert.equal(bSyncOngoing, false, "Handler must not be called while synchronous request is ongoing");
			assert.equal(oEvent.type, "readystatechange", "Event object exists and has the expected type");
			assert.ok(this === asyncXHR, "this-reference points to XHR object");
			if (asyncXHR.readyState === 4) {
				done();
			}
		}
		asyncXHR.addEventListener("readystatechange", asyncListener1);
		asyncXHR.onreadystatechange = asyncListener2;
		asyncXHR.open("GET", baseURL + "small.txt", true);
		assert.equal(asyncXHR.readyState, 1, "After open, readyState should be 1");
		asyncXHR.send();
		assert.equal(asyncXHR.readyState, 1, "After send, readyState should still be 1");

		var syncXHR = new XMLHttpRequest();
		syncXHR.open("GET", baseURL + "small.txt", false);
		assert.equal(syncXHR.readyState, 1, "After open, readyState should be 1");
		bSyncOngoing = true;
		syncXHR.send();
		bSyncOngoing = false;
		assert.equal(syncXHR.readyState, 4, "After send for sync requests, readyState should be 4");
	});

	QUnit.test("events removed", function(assert) {
		var bSyncOngoing = false,
			done = assert.async();

		var asyncXHR = new XMLHttpRequest();

		function asyncListener1() {
			assert.equal(bSyncOngoing, false, "Handler must not be called while synchronous request is ongoing");
			assert.equal(asyncXHR.readyState, 1, "As events are removed synchronously, only readyState 1 should be fired");
		}

		function asyncListener2() {
			assert.equal(bSyncOngoing, false, "Handler must not be called while synchronous request is ongoing");
			assert.equal(asyncXHR.readyState, 1, "As events are removed synchronously, only readyState 1 should be fired");
		}
		asyncXHR.addEventListener("readystatechange", asyncListener1);
		asyncXHR.onreadystatechange = asyncListener2;
		asyncXHR.open("GET", baseURL + "small.txt", true);
		asyncXHR.send();

		var syncXHR = new XMLHttpRequest();
		syncXHR.open("GET", baseURL + "small.txt", false);
		bSyncOngoing = true;
		syncXHR.send();
		bSyncOngoing = false;

		asyncXHR.onreadystatechange = null;
		asyncXHR.removeEventListener("readystatechange", asyncListener1);

		setTimeout(function() {
			done();
		}, 0);
	});

	QUnit.test("async readyState without listener", function(assert) {
		var asyncXHR = new XMLHttpRequest(),
			done = assert.async();
		asyncXHR.open("GET", baseURL + "small.txt", true);
		asyncXHR.send();
		asyncXHR.onreadystatechange = function () {
			if (this.readyState == XMLHttpRequest.DONE) {
				assert.ok("ready state was set to done");
				done();
			}
		};
	});

	QUnit.test("setTimeout/setInterval with strings", function(assert) {
		var iInterval,
			done = assert.async();

		/* eslint-disable no-implied-eval */
		setTimeout("window.bTimeout = true", 0); // legacy-relevant
		iInterval = setInterval("window.bInterval = true", 0); // legacy-relevant
		/* eslint-enable no-implied-eval */

		setTimeout(function() {
			assert.ok(window.bTimeout, "String based timeout has been triggered");
			assert.ok(window.bInterval, "String based interval has been triggered");
			clearInterval(iInterval);
			delete window.bTimeout;
			delete window.bInterval;
			done();
		}, 100);
	});

	QUnit.test("setTimeout/setInterval with non-functions", function(assert) {
		assert.throws(function(){setTimeout();}, TypeError, "Empty setTimeout throws");
		assert.throws(function(){setInterval();}, TypeError, "Empty setInterval throws");
		/* eslint-disable no-implied-eval */
		clearTimeout(setTimeout(undefined));
		clearTimeout(setTimeout(123));
		clearTimeout(setTimeout(true));
		clearTimeout(setTimeout([]));
		clearTimeout(setTimeout({}));
		clearTimeout(setTimeout(/test/));
		clearInterval(setInterval(undefined));
		clearInterval(setInterval(123));
		clearInterval(setInterval(true));
		clearInterval(setInterval([]));
		clearInterval(setInterval({}));
		clearInterval(setInterval(/test/));
		assert.ok(true, "No runtime errors have been thrown");
		/* eslint-enable no-implied-eval */
	});

	QUnit.test("sync/Promise/setTimeout", function(assert) {
		var bSyncOngoing = false,
			bTimeoutTriggered = false,
			bIntervalTriggered = false,
			bPromiseTriggered = false,
			vInterval,
			done = assert.async(),
			oResolved = Promise.resolve(),
			oRejected = Promise.reject();

		setTimeout(function(bTest) {
			bTimeoutTriggered = true;
			assert.ok(bTest, "Timeout parameter is passed correctly");
		}, 0, true);

		vInterval = setInterval(function(bTest) {
			bIntervalTriggered = true;
			assert.ok(bTest, "Interval parameter is passed correctly");
			clearInterval(vInterval);
		}, 0, true);

		oResolved.then(function() {
			bSyncOngoing = true;
			jQuery.ajax({
				url: baseURL + "small.txt",
				async: false,
				cache: false
			});
			bSyncOngoing = false;
			oResolved.then(function() {
				bPromiseTriggered = true;
				assert.ok(!bTimeoutTriggered, "Resolved after request: Timeout must not have been triggered");
				assert.ok(!bIntervalTriggered, "Resolved after request: Interval must not have been triggered");
			});
		});

		oResolved.then(function() {
			assert.ok(!bSyncOngoing, "Resolved: Sync request is no longer running");
			assert.ok(!bTimeoutTriggered, "Resolved: Timeout must not have been triggered");
			assert.ok(!bIntervalTriggered, "Resolved: Interval must not have been triggered");
			assert.ok(!bPromiseTriggered, "Resolved: Promise must not have been triggered");
		});
		oRejected.catch(function() {
			assert.ok(!bSyncOngoing, "Rejected: Sync request is no longer running");
			assert.ok(!bTimeoutTriggered, "Rejected: Timeout must not have been triggered");
			assert.ok(!bIntervalTriggered, "Rejected: Interval must not have been triggered");
			assert.ok(!bPromiseTriggered, "Rejected: Promise must not have been triggered");
		});

		setTimeout(function() {
			done();
		}, 0);
	});

	QUnit.test("sync/Promise reject/resolve", function(assert) {
		assert.expect(4);
			var done = assert.async(),
			oError = new Error(),
			oResolved = Promise.resolve();

		oResolved.then(function() {
			jQuery.ajax({
				url: baseURL + "small.txt",
				async: false,
				cache: false
			});
		});

		oResolved.then(function() {
			return 123;
		}).then(function(oResult) {
			assert.equal(oResult, 123, "Promise resolves with returned value");
		});

		oResolved.then(function() {
			return Promise.resolve(123);
		}).then(function(oResult) {
			assert.equal(oResult, 123, "Promise resolves with resolved promise value");
		});

		oResolved.then(function() {
			return Promise.reject(oError);
		}).catch(function(oException) {
			assert.equal(oException, oError, "Promise rejects with rejected promise Error");
		});

		oResolved.then(function() {
			throw oError;
		}).catch(function(oException) {
			assert.equal(oException, oError, "Promise rejects with thrown Error");
		});

		setTimeout(function() {
			done();
		}, 0);

	});
});