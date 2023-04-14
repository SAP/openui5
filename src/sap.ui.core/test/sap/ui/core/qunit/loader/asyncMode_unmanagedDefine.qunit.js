/*global QUnit, sinon */
(function() {
	"use strict";

	var privateLoaderAPI = sap.ui.loader._;

	QUnit.config.autostart = false;
	if ( QUnit.urlParams["rtf"] || QUnit.urlParams["repeat-to-failure"]) {
		QUnit.done(function(results) {
			if (results.failed === 0) {
				setTimeout(function() {
					location.reload();
				}, 100);
			}
		});
	}
	QUnit.config.urlConfig.push({
		id: "repeat-to-failure",
		label: "Repeat",
		value: false,
		tooltip: "Whether this test should auto-repeat until it fails"
	});

	privateLoaderAPI.logger = {
		/*eslint-disable no-console */
		debug: function() {
			console.log.apply(console, arguments);
		},
		info: function() {
			console.log.apply(console, arguments);
		},
		warning: function() {
			console.warn.apply(console, arguments);
		},
		error: function() {
			console.error.apply(console, arguments);
		},
		/*eslint-enable no-console */
		isLoggable: function() { return true; }
	};
	sap.ui.loader.config({
		paths: {
			'fixture': 'fixture/'
		}
	});

	// ========================================================================================
	// Unmanaged Module Definitions
	// ========================================================================================

	QUnit.module("Unmanaged Module Definitions");

	QUnit.test("Unnamed Definition", function(assert) {
		var done = assert.async();

		// for adhoc defines, there's no module that could report the error -> throws
		var origOnError = window.onerror;
		window.onerror = this.stub().callsFake(function() {
			assert.ok(window.onerror.calledOnce, "an error was thrown");
			assert.ok(window.onerror.calledWith(sinon.match(/anonymous/).and(sinon.match(/require.*call/))), "...with the expected message");
			window.onerror = origOnError;
			done();
			return true;
		});

		sap.ui.define(function() {
			assert.ok(false, "should not be executed");
			done(); // abort test early, not by timeout
		});
	});

	QUnit.test("Named Definition", function(assert) {
		var done = assert.async();

		// for adhoc defines, there's no module that could report the error -> throws
		var origOnError = window.onerror;
		window.onerror = this.stub().returns(true);

		function restoreAndDone() {
			window.onerror = origOnError;
			done();
		}

		sap.ui.define("fixture/unmanaged-defines/module01", [], function() {
			assert.ok(true, "named module definition should be executed");
			return {
				id: "fixture/unmanaged-defines/module01"
			};
		});

		sap.ui.require(["fixture/unmanaged-defines/module01"], function(mod) {
			var expected = {
				id: "fixture/unmanaged-defines/module01"
			};
			assert.deepEqual(mod, expected, "export should be the expected one");
			assert.strictEqual(window.onerror.callCount, 0, "no error was thrown");
			restoreAndDone();
		}, function(err) {
			assert.ok(false, "errback should not be called");
			restoreAndDone();
		});
	});

	QUnit.test("Repeated Named Definition", function(assert) {
		var done = assert.async();

		var origOnError = window.onerror;
		window.onerror = this.stub().returns(true);
		this.stub(privateLoaderAPI.logger, "warning");

		function restoreAndDone() {
			privateLoaderAPI.logger.warning.restore();
			window.onerror = origOnError;
			done();
		}

		sap.ui.define("fixture/unmanaged-defines/module02", [], function() {
			assert.ok(true, "named module definition should be executed");
			return {
				id: "fixture/unmanaged-defines/module02#def-1"
			};
		});

		sap.ui.define("fixture/unmanaged-defines/module02", [], function() {
			assert.ok(false, "2nd module definition must not be executed");
			return {
				id: "fixture/unmanaged-defines/module02#def-2"
			};
		});

		sap.ui.require(["fixture/unmanaged-defines/module02"], function(mod) {
			var expected = {
				id: "fixture/unmanaged-defines/module02#def-1"
			};
			assert.deepEqual(mod, expected, "export should be the expected one");
			assert.strictEqual(window.onerror.callCount, 0, "no error was thrown");
			assert.ok(
				privateLoaderAPI.logger.warning.calledWith(
					sinon.match(/fixture\/unmanaged-defines\/module02/)
					.and(sinon.match(/defined more than once/))
					.and(sinon.match(/will be ignored/))),
				"a warning has been logged");

			restoreAndDone();
		}, function(err) {
			assert.ok(false, "errback should not be called");

			restoreAndDone();
		});
	});

	QUnit.start();

}());