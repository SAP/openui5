/*global QUnit*/
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/core/Core",
	"test/model/formatter"
], function (Core) {
	"use strict";

	Core.ready().then(function () {
		QUnit.start();
	});
});