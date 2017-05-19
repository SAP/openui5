/*global QUnit,sinon*/


(function(QUnit) {
	"use strict";

	jQuery.sap.registerModulePath("testComponent", "./testComponent");
	jQuery.sap.registerModulePath("testComponentAsync", "./testComponentAsync");

	var sandbox = sinon.sandbox.create();

	QUnit.module("sap.ui.fl.library", {
		beforeEach: function() {
		},
		afterEach: function() {
			sandbox.restore();
		}
	});

	QUnit.test("triggers all its registrations", function (assert) {
		var done = assert.async();

		sap.ui.require(["sap/ui/fl/RegistrationDelegator"], function (RegistrationDelegator) {

			var oRegisterAllStub = sandbox.stub(RegistrationDelegator, "registerAll");

			sap.ui.getCore().loadLibrary("sap/ui/fl");

			assert.ok(oRegisterAllStub.calledOnce, "the registration is done");
			done();
		});
	});

}(QUnit));
