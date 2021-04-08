/* global QUnit */

sap.ui.define([
	"sap/ui/fl/write/_internal/fieldExtensibility/ABAPAccess",
	"sap/ui/fl/write/api/FieldExtensibility",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
], function(
	ABAPAccess,
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

	QUnit.module("Given FieldExtensibility with an ABAPAccess.js", {
		beforeEach: function() {
			sandbox.stub(ABAPAccess, "onControlSelected");
			sandbox.stub(ABAPAccess, "isExtensibilityEnabled");
			sandbox.stub(ABAPAccess, "isServiceOutdated");
			sandbox.stub(ABAPAccess, "setServiceValid");
			sandbox.stub(ABAPAccess, "getTexts");
			sandbox.stub(ABAPAccess, "getExtensionData");
			sandbox.stub(ABAPAccess, "onTriggerCreateExtensionData");
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
					assert.equal(ABAPAccess[sFunctionName].callCount, 1, "the Implementation was called");
				});
			});
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
