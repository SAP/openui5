/*global QUnit */
sap.ui.define(['./failing-module1'], function() {
	"use strict";
	QUnit.config.current.assert.ok(false, "factory never should be called");
});
