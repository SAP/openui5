/*global QUnit, require, sap */
(function() {
	"use strict";

	// if ui5loader is present, make it expose AMD APIs
	if ( window.sap && sap.ui && sap.ui.loader ) {
		sap.ui.loader.config({ amd: true });
	}

	QUnit.config.autostart = false;

	require(["test.qunit"], function () {
		QUnit.start();
	});

}());