/*global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/thirdparty/jquery",
	"sap/ui/fl/RegistrationDelegator"
], function(
	sinon,
	jQuery,
	RegistrationDelegator
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("sap.ui.fl.library", {
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("triggers all its registrations", function (assert) {
			var oRegisterAllStub = sandbox.stub(RegistrationDelegator, "registerAll");
			var fnDone = assert.async();
			sap.ui.require(["sap/ui/fl/library"], function() {
				assert.ok(oRegisterAllStub.calledOnce, "the registration is done");
				fnDone();
			});
		});
	});


	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});