/* global QUnit */

sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/validator/ValidatorRegistry",
	"sap/ui/integration/designtime/baseEditor/validator/IsUniqueKey"
],
function (
	ValidatorRegistry,
	IsUniqueKey
) {
	"use strict";

	QUnit.module("Given an editor factory is configured", {
		beforeEach: function () {
			var mValidators = {
				"testValidator": "sap/ui/integration/designtime/baseEditor/validator/IsUniqueKey"
			};
			ValidatorRegistry.registerValidators(mValidators);
		},
		afterEach: function () {
			ValidatorRegistry.deregisterAllValidators();
		}
	}, function () {
		QUnit.test("When a validator is registered", function (assert) {
			assert.ok(
				ValidatorRegistry.isRegistered("testValidator"),
				"then it is added in the ValidatorRegistry"
			);

			assert.notOk(
				ValidatorRegistry.hasValidator("testValidator"),
				"then it is not available before it was loaded"
			);

			return ValidatorRegistry.ready().then(function () {
				assert.ok(
					ValidatorRegistry.hasValidator("testValidator"),
					"then it is available once the registry is ready"
				);

				assert.deepEqual(
					ValidatorRegistry.getValidator("testValidator"),
					IsUniqueKey,
					"then the registry returns the proper validator"
				);
			});
		});

		// deregister -> ready not called, cleanup

		// Adding validator -> ready reset

		// Get invalid -> error
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
