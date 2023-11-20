/*global QUnit*/
sap.ui.define([
	"test/routing/target/historyIframe/script",
	"sap/ui/Device",
	"./HistoryUtils",
	"sap/ui/core/routing/HashChanger"
], function(oApp, Device, HistoryUtils, HashChanger) {
	"use strict";

	var bWithinIFrame = window.self !== window.top;

	// Initialize the HistoryUtils
	QUnit.begin(HistoryUtils.init);

	// Resets the HistoryUtils
	QUnit.done(HistoryUtils.exit);

	QUnit.module("basic", {
		before: HistoryUtils.check,
		beforeEach: function() {
			HashChanger.getInstance().setHash("");
			return oApp.createIFrame();
		},
		afterEach: function() {
			oApp.removeIFrame();
		}
	});

	/*
	 * Firefox can't handle the back navigaiton correctly when this test runs in a testsuite. In a testsuite, each
	 * test is executed with an iframe. Because this test creates another embeded iframe, we have a situation that
	 * an iframe is embeded within another iframe. Everytime when the hash is changed in the deeper nested iframe,
	 * calling window.history.back() will reload the whole test page instead of having a back navigation in the
	 * deeper nested iframe. Therefore the tests that navigate back after a hash change in the deeper nested iframe
	 * have to be excluded in Firefox.
	 */

	if (!(Device.browser.firefox && bWithinIFrame)) {
		QUnit.test("Outer(Set)->Inner(Set)->Back->Outer(Set)->Back->Forward", function(assert) {
			var iframe = document.getElementById("iframe1");
			return oApp.setHash("outerHash1")
				.then(function() {
					assert.equal(oApp.getDirection(), "NewEntry", "Direction is correct in outer frame");
					assert.equal(iframe.contentWindow.getDirection(), "NewEntry", "Direction is correct in inner frame");
					return iframe.contentWindow.setHash("innerHash1");
				})
				.then(function() {
					assert.equal(oApp.getDirection(), "NewEntry", "Direction is correct in outer frame");
					assert.equal(iframe.contentWindow.getDirection(), "NewEntry", "Direction is correct in inner frame");


					var oBackPromise = Promise.race([oApp.waitForHashChange(), iframe.contentWindow.waitForHashChange()]);
					window.history.back();
					return oBackPromise;
				})
				.then(function() {
					assert.equal(oApp.getDirection(), "Backwards", "Direction is correct in outer frame");
					assert.equal(iframe.contentWindow.getDirection(), "Backwards", "Direction is correct in inner frame");
					return oApp.setHash("outerHash2");
				})
				.then(function() {
					assert.equal(oApp.getDirection(), "NewEntry", "Direction is correct in outer frame");
					assert.equal(iframe.contentWindow.getDirection(), "NewEntry", "Direction is correct in inner frame");
					var oBackPromise = Promise.race([oApp.waitForHashChange(), iframe.contentWindow.waitForHashChange()]);
					window.history.back();
					return oBackPromise;
				})
				.then(function() {
					assert.equal(oApp.getDirection(), "Backwards", "Direction is correct in outer frame");
					assert.equal(iframe.contentWindow.getDirection(), "Backwards", "Direction is correct in inner frame");
					var oForwardPromise = Promise.race([oApp.waitForHashChange(), iframe.contentWindow.waitForHashChange()]);
					window.history.forward();
					return oForwardPromise;
				})
				.then(function() {
					assert.equal(oApp.getDirection(), "Forwards", "Direction is correct in outer frame");
					assert.equal(iframe.contentWindow.getDirection(), "Forwards", "Direction is correct in inner frame");
				});
		});
	}

	QUnit.test("Inner(Set)->Outer(Set)->Back->Outer(Set)->Back->Forward", function(assert) {
		var iframe = document.getElementById("iframe1");
		return iframe.contentWindow.setHash("outerHash1")
			.then(function() {
				assert.equal(oApp.getDirection(), "NewEntry", "Direction is correct in outer frame");
				assert.equal(iframe.contentWindow.getDirection(), "NewEntry", "Direction is correct in inner frame");
				return oApp.setHash("innerHash1");
			})
			.then(function() {
				assert.equal(oApp.getDirection(), "NewEntry", "Direction is correct in outer frame");
				assert.equal(iframe.contentWindow.getDirection(), "NewEntry", "Direction is correct in inner frame");


				var oBackPromise = Promise.race([oApp.waitForHashChange(), iframe.contentWindow.waitForHashChange()]);
				window.history.back();
				return oBackPromise;
			})
			.then(function() {
				assert.equal(oApp.getDirection(), "Backwards", "Direction is correct in outer frame");
				assert.equal(iframe.contentWindow.getDirection(), "Backwards", "Direction is correct in inner frame");
				return oApp.setHash("outerHash2");
			})
			.then(function() {
				assert.equal(oApp.getDirection(), "NewEntry", "Direction is correct in outer frame");
				assert.equal(iframe.contentWindow.getDirection(), "NewEntry", "Direction is correct in inner frame");
				var oBackPromise = Promise.race([oApp.waitForHashChange(), iframe.contentWindow.waitForHashChange()]);
				window.history.back();
				return oBackPromise;
			})
			.then(function() {
				assert.equal(oApp.getDirection(), "Backwards", "Direction is correct in outer frame");
				assert.equal(iframe.contentWindow.getDirection(), "Backwards", "Direction is correct in inner frame");

				var oForwardPromise = Promise.race([oApp.waitForHashChange(), iframe.contentWindow.waitForHashChange()]);
				window.history.forward();
				return oForwardPromise;
			})
			.then(function() {
				assert.equal(oApp.getDirection(), "Forwards", "Direction is correct in outer frame");
				assert.equal(iframe.contentWindow.getDirection(), "Forwards", "Direction is correct in inner frame");
			});
	});

	if (!(Device.browser.firefox && bWithinIFrame)) {
		QUnit.test("Outer(Set)->Inner(Set)->Back->Inner(Set)->Back->Forward", function(assert) {
			var iframe = document.getElementById("iframe1");
			return oApp.setHash("outerHash1")
				.then(function() {
					assert.equal(oApp.getDirection(), "NewEntry", "Direction is correct in outer frame");
					assert.equal(iframe.contentWindow.getDirection(), "NewEntry", "Direction is correct in inner frame");
					return iframe.contentWindow.setHash("innerHash1");
				})
				.then(function() {
					assert.equal(oApp.getDirection(), "NewEntry", "Direction is correct in outer frame");
					assert.equal(iframe.contentWindow.getDirection(), "NewEntry", "Direction is correct in inner frame");


					var oBackPromise = Promise.race([oApp.waitForHashChange(), iframe.contentWindow.waitForHashChange()]);
					window.history.back();
					return oBackPromise;
				})
				.then(function() {
					assert.equal(oApp.getDirection(), "Backwards", "Direction is correct in outer frame");
					assert.equal(iframe.contentWindow.getDirection(), "Backwards", "Direction is correct in inner frame");
					return iframe.contentWindow.setHash("outerHash2");
				})
				.then(function() {
					assert.equal(oApp.getDirection(), "NewEntry", "Direction is correct in outer frame");
					assert.equal(iframe.contentWindow.getDirection(), "NewEntry", "Direction is correct in inner frame");
					var oBackPromise = Promise.race([oApp.waitForHashChange(), iframe.contentWindow.waitForHashChange()]);
					window.history.back();
					return oBackPromise;
				})
				.then(function() {
					assert.equal(oApp.getDirection(), "Backwards", "Direction is correct in outer frame");
					assert.equal(iframe.contentWindow.getDirection(), "Backwards", "Direction is correct in inner frame");
					var oForwardPromise = Promise.race([oApp.waitForHashChange(), iframe.contentWindow.waitForHashChange()]);
					window.history.forward();
					return oForwardPromise;
				})
				.then(function() {
					assert.equal(oApp.getDirection(), "Forwards", "Direction is correct in outer frame");
					assert.equal(iframe.contentWindow.getDirection(), "Forwards", "Direction is correct in inner frame");
				});
		});
	}

	if (!(Device.browser.firefox && bWithinIFrame)) {
		QUnit.test("Outer(Set)->Inner(Set)->Inner(Replace)->Back->Outer(Set)", function(assert) {
			var iframe = document.getElementById("iframe1");
			return oApp.setHash("outerHash1")
				.then(function() {
					assert.equal(oApp.getDirection(), "NewEntry", "Direction is correct in outer frame");
					assert.equal(iframe.contentWindow.getDirection(), "NewEntry", "Direction is correct in inner frame");
					return iframe.contentWindow.setHash("innerHash1");
				})
				.then(function() {
					assert.equal(oApp.getDirection(), "NewEntry", "Direction is correct in outer frame");
					assert.equal(iframe.contentWindow.getDirection(), "NewEntry", "Direction is correct in inner frame");
					return iframe.contentWindow.replaceHash("innerHash2");
				})
				.then(function() {
					assert.equal(oApp.getDirection(), "Unknown", "Direction is correct in outer frame");
					assert.equal(iframe.contentWindow.getDirection(), "Unknown", "Direction is correct in inner frame");
					var oBackPromise = Promise.race([oApp.waitForHashChange(), iframe.contentWindow.waitForHashChange()]);
					window.history.back();
					return oBackPromise;
				})
				.then(function() {
					assert.equal(oApp.getDirection(), "Backwards", "Direction is correct in outer frame");
					assert.equal(iframe.contentWindow.getDirection(), "Backwards", "Direction is correct in inner frame");
					return oApp.setHash("outerHash2");
				})
				.then(function() {
					assert.equal(oApp.getDirection(), "NewEntry", "Direction is correct in outer frame");
					assert.equal(iframe.contentWindow.getDirection(), "NewEntry", "Direction is correct in inner frame");
				});
		});
	}

	if (!(Device.browser.firefox && bWithinIFrame)) {
		QUnit.test("Outer(Set)->Inner(Set)->Outer(Replace)->Back->Outer(Set)", function(assert) {
			var iframe = document.getElementById("iframe1");
			return oApp.setHash("outerHash1")
				.then(function() {
					assert.equal(oApp.getDirection(), "NewEntry", "Direction is correct in outer frame");
					assert.equal(iframe.contentWindow.getDirection(), "NewEntry", "Direction is correct in inner frame");
					return iframe.contentWindow.setHash("innerHash1");
				})
				.then(function() {
					assert.equal(oApp.getDirection(), "NewEntry", "Direction is correct in outer frame");
					assert.equal(iframe.contentWindow.getDirection(), "NewEntry", "Direction is correct in inner frame");
					return oApp.replaceHash("innerHash2");
				})
				.then(function() {
					assert.equal(oApp.getDirection(), "Unknown", "Direction is correct in outer frame");
					assert.equal(iframe.contentWindow.getDirection(), "Unknown", "Direction is correct in inner frame");
					var oBackPromise = Promise.race([oApp.waitForHashChange(), iframe.contentWindow.waitForHashChange()]);
					window.history.back();
					return oBackPromise;
				})
				.then(function() {
					assert.equal(oApp.getDirection(), "Backwards", "Direction is correct in outer frame");
					assert.equal(iframe.contentWindow.getDirection(), "Backwards", "Direction is correct in inner frame");
					return oApp.setHash("outerHash2");
				})
				.then(function() {
					assert.equal(oApp.getDirection(), "NewEntry", "Direction is correct in outer frame");
					assert.equal(iframe.contentWindow.getDirection(), "NewEntry", "Direction is correct in inner frame");
				});
		});
	}

	if (!(Device.browser.firefox && bWithinIFrame)) {
		QUnit.test("Outer(Set)->Inner(Set)->Outer(Replace)->Back->Forward", function(assert) {
			var iframe = document.getElementById("iframe1");
			return oApp.setHash("outerHash1")
				.then(function() {
					assert.equal(oApp.getDirection(), "NewEntry", "Direction is correct in outer frame");
					assert.equal(iframe.contentWindow.getDirection(), "NewEntry", "Direction is correct in inner frame");
					return iframe.contentWindow.setHash("innerHash1");
				})
				.then(function() {
					assert.equal(oApp.getDirection(), "NewEntry", "Direction is correct in outer frame");
					assert.equal(iframe.contentWindow.getDirection(), "NewEntry", "Direction is correct in inner frame");
					return oApp.replaceHash("innerHash2");
				})
				.then(function() {
					assert.equal(oApp.getDirection(), "Unknown", "Direction is correct in outer frame");
					assert.equal(iframe.contentWindow.getDirection(), "Unknown", "Direction is correct in inner frame");
					var oBackPromise = Promise.race([oApp.waitForHashChange(), iframe.contentWindow.waitForHashChange()]);
					window.history.back();
					return oBackPromise;
				})
				.then(function() {
					assert.equal(oApp.getDirection(), "Backwards", "Direction is correct in outer frame");
					assert.equal(iframe.contentWindow.getDirection(), "Backwards", "Direction is correct in inner frame");
					var oForwardPromise = Promise.race([oApp.waitForHashChange(), iframe.contentWindow.waitForHashChange()]);
					window.history.forward();
					return oForwardPromise;
				})
				.then(function() {
					assert.equal(oApp.getDirection(), "Forwards", "Direction is correct in outer frame");
					assert.equal(iframe.contentWindow.getDirection(), "Forwards", "Direction is correct in inner frame");
				});
		});
	}

});
