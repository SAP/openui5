/*global QUnit */
(function(){
	"use strict";

	QUnit.test("SyncBootstrap: Dependency to Core can be resolved", function(assert) {
		assert.notOk(sap.ui.require("sap/ui/core/Core"), "Precondition: Core module has not been loaded yet");
		assert.notOk(sap.ui.getCore, "Precondition: sap.ui.getcore does not exists yet");

		/*
		 * A module with a dependency to the Core. Will be required synchronously during a custom boot task
		 */
		sap.ui.predefine("TestModuleWithDependencyToCore", ["sap/ui/core/Core"], function(oCore) {
			assert.strictEqual(oCore, sap.ui.getCore(), "Dependency to sap/ui/core/Core should be resolved to sap.ui.getCore()");
		});

		/*
		 * Configure a custom boot task that triggers synchronous execution of the above module
		 */
		window["sap-ui-config"] = window["sap-ui-config"] || {};
		window["sap-ui-config"]["xx-bootTask"] = function(finished) {
			sap.ui.requireSync("TestModuleWithDependencyToCore");
			finished();
		};

		/*
		 * Trigger the standard synchronous bootstrap
		 */
		sap.ui.requireSync("sap/ui/core/Core").boot();
	});

}());