/*global QUnit */
sap.ui.define(['../ui5-legacy/failing-module1'], function() {
	"use strict";
	QUnit.config.current.assert.ok(false, "factory never should be called");
});
