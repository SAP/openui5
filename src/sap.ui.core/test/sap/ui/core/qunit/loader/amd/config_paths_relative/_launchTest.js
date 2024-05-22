/*global QUnit, require */
(function() {
	"use strict";

	// if ui5loader is present, make it expose AMD APIs
	globalThis.sap?.ui?.loader?.config({ amd: true });

	QUnit.config.autostart = false;

	require(["test.qunit"], function () {
		QUnit.start();
	});

}());