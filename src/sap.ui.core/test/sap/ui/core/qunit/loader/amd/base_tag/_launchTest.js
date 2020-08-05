/*global QUnit, require, sap */
(function() {
	"use strict";

	// if ui5loader is present, make it expose AMD APIs
	if ( window.sap && sap.ui && sap.ui.loader ) {
		sap.ui.loader.config({ amd: true });
	}

	QUnit.config.autostart = false;

	require.config({
		paths: {
			"test.qunit": "test-resources/sap/ui/core/qunit/loader/amd/base_tag/test.qunit"
		}
	});

	require(["test.qunit"], function () {
		QUnit.start();
	});

}());