/*global QUnit */
sap.ui.define(function() {
	"use strict";

	/*
	sap.ui.loader._.logger = {
		/*eslint-disable no-console * /
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
		/*eslint-enable no-console * /
		isLoggable: function() { return true; }
	};*/

	// ========================================================================================
	// Mixed Async / Sync Calls
	// ========================================================================================

	QUnit.module("Mixed Async/Sync Calls");

	QUnit.test("Library Scenario", function(assert) {
		// Act:
		return sap.ui.getCore().loadLibraries(
			[
				"fixture/async-sync-conflict_legacyAPIs/library-using-AMD",
				"fixture/async-sync-conflict_legacyAPIs/library-using-require-declare"
			]
		).then(function() {
			assert.ok(true, "loading the libs succeeded");
		}, function(e) {
			assert.strictEqual(e, null, "loading the libs failed");
		});
	});



	//****************************************************
	// loadJSResourceAsync
	//****************************************************

	/**
	 * @deprecated since 1.58
	 */
	QUnit.module("loadJSResourceAsync");

	QUnit.test("legacy API", function(assert) {
		var done = assert.async();
		sap.ui.require(["jquery.sap.global"], function(jQuery) {
			assert.strictEqual(jQuery.sap._loadJSResourceAsync, sap.ui.loader._.loadJSResourceAsync,
				"Legacy API 'jQuery.sap._loadJSResourceAsync' just should be an alias for the new private loader API");
			done();
		}, function() {
			assert.ok(false, "failed to load jquery.sap.global");
			done();
		});
	});

});