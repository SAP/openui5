/* global QUnit */

sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/util/createPromise",
	"sap/ui/thirdparty/sinon-4"
],
function (
	createPromise,
	sinon
) {
	"use strict";

	QUnit.module("Base functionality", function () {
		QUnit.test("When Promise is resolved", function (assert) {
			assert.expect(3);

			var mPromise = createPromise(function (fnResolve) {
				assert.ok(true, "this must be called");
				setTimeout(function() {
					fnResolve("Resolved");
				});
			});
			var oPromise = mPromise.promise;

			return oPromise.then(
				function (vResult) {
					assert.ok(true, "this must be called");
					assert.strictEqual(vResult, "Resolved");
				},
				function () {
					assert.ok(false, "this must never be called");
				});
		});

		QUnit.test("When Promise is rejected", function (assert) {
			assert.expect(3);

			var mPromise = createPromise(function (fnResolve, fnReject) {
				assert.ok(true, "this must be called");
				setTimeout(function() {
					fnReject("Rejected");
				});
			});
			var oPromise = mPromise.promise;

			return oPromise.then(
				function () {
					assert.ok(false, "this must never be called");
				},
				function (vError) {
					assert.ok(true, "this must be called");
					assert.strictEqual(vError, "Rejected");
				});
		});

		QUnit.test("When Promise is cancelled", function (assert) {
			assert.expect(1);
			var fnDone = assert.async();

			var clock = sinon.useFakeTimers();

			var mPromise = createPromise(function (fnResolve) {
				assert.ok(true, "this must be called");
				setTimeout(function() {
					fnResolve("Resolved");
				});
			});

			var oPromise = mPromise.promise;
			var fnCancel = mPromise.cancel;

			fnCancel();
			clock.tick(50);

			oPromise.then(
				function () {
					assert.ok(false, "this must never be called");
				},
				function () {
					assert.ok(false, "this must never be called");
				});

			clock.restore();

			setTimeout(fnDone, 16);
		});
	});
});
