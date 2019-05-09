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
		paths: {
			"test-resources": "../../../../../../test-resources/"
		}
	});

	sap.ui.require([
		"test-resources/sap/ui/core/qunit/loader/conflictWithRequire.qunit"
	], function() {
		QUnit.start();
	});

}());
