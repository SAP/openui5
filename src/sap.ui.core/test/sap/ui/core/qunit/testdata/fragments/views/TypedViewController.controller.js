/* global QUnit */
sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";
	return Controller.extend("my.TypedViewController", {
		onInit: function() {},

		doSomething: function(oEvent) {
			QUnit.config.current.assert.ok(true, "Controller method 'doSomething' called");
		}
	});
});
