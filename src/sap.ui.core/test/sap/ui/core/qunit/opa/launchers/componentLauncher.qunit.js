/*global QUnit */
sap.ui.define([
	"sap/ui/test/launchers/componentLauncher",
	"samples/components/button/Component"
], function (componentLauncher) {
	"use strict";

	QUnit.module("Component-Launcher");

	QUnit.test("Should start and teardown the UIComponent", function (assert) {
		var done = assert.async();

		var  oPromise = componentLauncher.start({
			name: "samples.components.button"
		});

		oPromise.then(function() {
			QUnit.assert.ok(document.getElementsByClassName("sapUiOpaComponent").length, "Created UIComponent");

			componentLauncher.teardown();
			QUnit.assert.ok(!document.getElementsByClassName("sapUiOpaComponent").length, "Removed UIComponent");

			done();
		});

	});

	QUnit.test("Should throw an exception after the start was called twice", function (assert) {
		var done = assert.async();

		var  oPromise = componentLauncher.start({
			name: "samples.components.button"
		});

		assert.throws(
			function() {
				componentLauncher.start({
					name: "samples.components.button"
				});
			},
			function(oError) {
				return oError instanceof Error && oError.message === "sap.ui.test.launchers.componentLauncher: " +
					"Start was called twice without teardown. Only one component can be started at a time.";
			},
			"Exception was thrown"
		);

		oPromise.then(function() {
			componentLauncher.teardown();
			QUnit.assert.ok(!document.getElementsByClassName("sapUiOpaComponent").length, "Removed uiComponent");

			done();
		});

	});

	QUnit.test("Should throw an exception after the teardown was called without the start before", function (assert) {
		assert.throws(
			function() {
				componentLauncher.teardown();
			},
			function(oError) {
				return oError instanceof Error && oError.message === "sap.ui.test.launchers.componentLauncher: " +
					"Teardown was called before start. No component was started.";
			},
			"Exception was thrown"
		);

	});

});
