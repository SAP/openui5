/* global QUnit */

sap.ui.define([
	"sap/ui/fl/write/_internal/fieldExtensibility/Access",
	"sap/ui/fl/write/api/FieldExtensibility",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
], function(
	Access,
	FieldExtensibility,
	jQuery,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	var aFunctionNames = [
		"onControlSelected",
		"isExtensibilityEnabled",
		"isServiceOutdated",
		"setServiceValid",
		"getTexts",
		"getExtensionData",
		"onTriggerCreateExtensionData"
	];

	QUnit.module("Given FieldExtensibility with an Access.js", {
		beforeEach: function() {
			sandbox.stub(Access, "onControlSelected");
			sandbox.stub(Access, "isExtensibilityEnabled");
			sandbox.stub(Access, "isServiceOutdated");
			sandbox.stub(Access, "setServiceValid");
			sandbox.stub(Access, "getTexts");
			sandbox.stub(Access, "getExtensionData");
			sandbox.stub(Access, "onTriggerCreateExtensionData");
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		aFunctionNames.forEach(function(sFunctionName) {
			var sText = "when the function " + sFunctionName + " is called";
			QUnit.test(sText, function(assert) {
				return FieldExtensibility[sFunctionName]().then(function() {
					assert.ok(true, "the function returns a promise");
					assert.equal(Access[sFunctionName].callCount, 1, "the Implementation was called");
				});
			});
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
