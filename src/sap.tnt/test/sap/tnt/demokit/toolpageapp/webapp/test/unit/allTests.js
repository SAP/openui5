/*global QUnit */
sap.ui.define([
	"sap/ui/core/Core",
	"./model/formatter",
	"./model/models"
], function(Core) {
	"use strict";

	QUnit.config.autostart = false;

	Core.attachInit(function () {
		QUnit.start();
	});
});