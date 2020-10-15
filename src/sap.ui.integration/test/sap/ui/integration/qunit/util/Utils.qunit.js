/* global QUnit */

sap.ui.define([
		"sap/ui/integration/util/Utils"
	],
	function (
		Utils
	) {
		"use strict";

		QUnit.module("Utils.timeoutPromise()");

		QUnit.test("Fulfills normally before timeout", function (assert) {
			// Arrange
			var done = assert.async(),
				pPromise = new Promise(function (resolve, reject) {
					setTimeout(function () {
						resolve(true);
					}, 100);
				}),
				pWithTimeout = Utils.timeoutPromise(pPromise, 200);

			// Act
			this.clock.tick(300);

			// Assert
			pWithTimeout.then(function (bResovled) {
				assert.ok(bResovled, "The promise fulfilled without timeout to be reached.");
				done();
			});
		});

		QUnit.test("Rejects normally before timeout", function (assert) {
			// Arrange
			var done = assert.async(),
				pPromise = new Promise(function (resolve, reject) {
					setTimeout(function () {
						reject(true);
					}, 100);
				}),
				pWithTimeout = Utils.timeoutPromise(pPromise, 200);

			// Act
			this.clock.tick(300);

			// Assert
			pWithTimeout.catch(function (bRejected) {
				assert.ok(bRejected, "The promise rejects without timeout to be reached.");
				done();
			});
		});

		QUnit.test("Does not fulfill or reject before timeout", function (assert) {
			// Arrange
			var done = assert.async(),
				pPromise = new Promise(function () {}),
				pWithTimeout = Utils.timeoutPromise(pPromise, 200),
				bFulfilled = false;

			pWithTimeout.then(function () {
				bFulfilled = true;
			});

			// Act
			this.clock.tick(210);

			// should not fulfill even after timeout
			pWithTimeout.then(function () {
				bFulfilled = true;
			});

			// Assert
			pWithTimeout.catch(function (sMessage) {
				assert.notOk(bFulfilled, "The promise did not fulfill before the timeout.");
				assert.ok(sMessage, "The promise timed out with expected message.");
				done();
			});
		});

		QUnit.test("Default timeout period", function (assert) {
			// Arrange
			var done = assert.async(),
				pPromise = new Promise(function () {}),
				pWithTimeout = Utils.timeoutPromise(pPromise);

			// Act
			this.clock.tick(Utils.DEFAULT_PROMISE_TIMEOUT + 100);

			// Assert
			pWithTimeout.catch(function (sMessage) {
				assert.ok(sMessage, "Timeout after default period.");
				done();
			});
		});
	}
);
