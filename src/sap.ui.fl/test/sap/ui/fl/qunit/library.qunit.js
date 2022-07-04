/*global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/apply/_internal/preprocessors/RegistrationDelegator"
], function(
	sinon,
	RegistrationDelegator
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.module("sap.ui.fl.library", {
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("triggers all its registrations", function (assert) {
			var oRegisterAllStub = sandbox.stub(RegistrationDelegator, "registerAll");

			return new Promise(function(resolve) {
				sap.ui.require(["sap/ui/fl/library"], function() {
					assert.equal(oRegisterAllStub.callCount, 1, "the registration is done");
					resolve();
				});
			});
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});