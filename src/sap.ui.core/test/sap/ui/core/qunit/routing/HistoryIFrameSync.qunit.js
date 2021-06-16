/*global QUnit*/
sap.ui.define([
	"test/routing/target/historyIframe/script"
], function(oApp) {
	"use strict";

	function test() {
		QUnit.start();

		QUnit.module("basic", {
			beforeEach: function() {
				return oApp.setHash("");
			}
		});

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

	oApp.ready.then(test);
});
