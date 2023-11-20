/*!
 * ${copyright}
 */
/*global QUnit */
sap.ui.define(["sap/base/util/Deferred"], function(Deferred) {
	"use strict";

	QUnit.module("sap.base.util.Deferred");

	QUnit.test("resolve", function(assert) {
		var done = assert.async();

		var oDeferred = new Deferred();
		oDeferred.promise.then(function(value) {
			assert.equal(value, "a value", "Deferred is resolved");
			done();
		});

		setTimeout(function() {
			oDeferred.resolve("a value");
		}, 10);
	});

	QUnit.test("reject", function(assert) {
		var done = assert.async();

		var oDeferred = new Deferred();
		oDeferred.promise.catch(function(error) {
			assert.equal(error, "an error", "Deferred is rejected");
			done();
		});

		setTimeout(function() {
			oDeferred.reject("an error");
		}, 10);
	});

});