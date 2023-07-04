/*global QUnit */
QUnit.config.autostart = false;
QUnit.config.reorder = false;

sap.ui.require([
	'test-resources/sap/ui/core/qunit/bootstrap/Configuration.qunit' // real tests, using sap.ui.define
], function() {
	"use strict";

	QUnit.start();
});
