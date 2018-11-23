/*global QUnit*/
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"test/model/formatter"
	], function () {
		QUnit.start();
	});

});