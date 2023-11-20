/*global QUnit */
sap.ui.define(['./non-existing-module'], function() {
	"use strict";
	QUnit.config.current.assert.ok(false, "factory never should be called");
});
