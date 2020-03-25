/* global QUnit */

QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function() {
	"use strict";

	sap.ui.require([
		"sap/ui/testrecorder/qunit/integration/AllJourneys"
	], function() {
		QUnit.start();
	});

});
