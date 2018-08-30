/*global QUnit*/
(function() {
	"use strict";

	QUnit.module("Synchronous module definition");

	QUnit.test("Synchronous module definition+require during bootstrap", function(assert) {
		var done = assert.async();
		// Use non-probing require to ensure module content is evaluated
		sap.ui.require(["fixture/syncModuleDefinition/moduleDefinition"], function(oModule) {
			assert.strictEqual(oModule, "hello this is module fixture/syncModuleDefinition/moduleDefinition", "Module should be returned correctly");
			done();
		});
	});

}());
