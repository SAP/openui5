/*global QUnit */
(function() {
	"use strict";

	QUnit.config.autostart = false;

	sap.ui.loader._.logger = {
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
		async: true,
		paths: {
			"test-resources": "../../../../../../test-resources/"
		}
	});


	QUnit.module("");

	QUnit.test("Intercepting changes to define/define.amd", function(assert) {
		this.spy(sap.ui.loader._.logger, "warning");
		assert.notEqual(globalThis.define, null, "global define exists");
		assert.ok(globalThis.define.amd, true, "global define is flagged as 'amd'");
		const isRequireJSActive = typeof window.require?.config === "function";
		if ( !isRequireJSActive ) {
			const definePropDesc = Object.getOwnPropertyDescriptor(globalThis, "define");
			assert.notEqual(definePropDesc.get, null, "global define property has a getter");
			assert.notEqual(definePropDesc.set, null, "global define property has a setter");
		}
		const amdPropDesc = Object.getOwnPropertyDescriptor(globalThis.define, "amd");
		assert.notEqual(amdPropDesc.get, null, "define.amd property has a getter");
		assert.notEqual(amdPropDesc.set, null, "define.amd property has a setter");
	});

	sap.ui.require([
		"test-resources/sap/ui/core/qunit/loader/conflictWithRequire.qunit"
	], function() {
		QUnit.start();
	});
}());
