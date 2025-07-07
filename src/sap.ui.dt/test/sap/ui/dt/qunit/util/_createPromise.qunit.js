/* global QUnit */
/* eslint-disable max-nested-callbacks */

sap.ui.define([
	"sap/ui/dt/util/_createPromise"
], function(
	_createPromise
) {
	"use strict";

	QUnit.module("Base functionality", function() {
		QUnit.test("when the cancelable promise resolves before being canceled", async function(assert) {
			const fnDone = assert.async();
			const oTestPromise = _createPromise((resolve) => {
				resolve("resolved");
			});
			const sResult = await oTestPromise.promise;
			assert.strictEqual(sResult, "resolved", "then the promise resolves with the correct value");

			oTestPromise.cancel().then(() => {
				assert.ok(false, "then a later cancel should not do anything");
			});

			setTimeout(fnDone, 0);
		});

		QUnit.test("when the cancelable promise is canceled before resolving", async function(assert) {
			const fnDone = assert.async();
			const oTestPromise = _createPromise(async (resolve) => {
				await Promise.resolve();
				resolve("resolved");
			});
			oTestPromise.promise.then(() => {
				assert.ok(false, "then the promise should not resolve");
			});
			const sCancelResult = await oTestPromise.cancel();
			assert.strictEqual(sCancelResult, "resolved", "then the promise is cancelled and reports the original resolve value");

			setTimeout(fnDone, 0);
		});

		QUnit.test("when the cancelable promise is canceled before rejecting", function(assert) {
			const fnDone = assert.async();
			const oTestPromise = _createPromise(async (resolve, reject) => {
				await Promise.resolve();
				reject("rejected");
			});
			oTestPromise.promise.catch(() => {
				assert.ok(false, "then the promise should not reject");
			});
			oTestPromise.cancel().catch((sCancelResult) => {
				assert.strictEqual(sCancelResult, "rejected", "then the promise is cancelled and reports the original reject value");
			});

			setTimeout(fnDone, 0);
		});

		QUnit.test("when the cancelable promise is rejected before being canceled", async function(assert) {
			const fnDone = assert.async();
			const oTestPromise = _createPromise((resolve, reject) => {
				reject("rejected");
			});
			try {
				await oTestPromise.promise;
				assert.ok(false, "then the promise should not resolve");
			} catch (sError) {
				assert.strictEqual(sError, "rejected", "then the promise rejects with the correct value");
			}
			oTestPromise.cancel()
			.then(() => {
				assert.ok(false, "then a later cancel should not resolve anything");
			})
			.catch(() => {
				assert.ok(false, "then a later cancel should not reject anything");
			});
			setTimeout(fnDone, 0);
		});

		QUnit.test("when the cancelable promise is canceled twice", async function(assert) {
			const oTestPromise = _createPromise(async (resolve) => {
				await Promise.resolve();
				resolve("resolved");
			});
			oTestPromise.promise.then(() => {
				assert.ok(false, "then the promise should not resolve");
			});
			const oCancel1 = oTestPromise.cancel();
			const oCancel2 = oTestPromise.cancel();
			const sCancelResult1 = await oCancel1;
			assert.strictEqual(sCancelResult1, "resolved", "then the first cancel resolves with the original resolve value");
			const sCancelResult2 = await oCancel2;
			assert.strictEqual(sCancelResult2, "resolved", "then the second cancel resolves with the original resolve value");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});