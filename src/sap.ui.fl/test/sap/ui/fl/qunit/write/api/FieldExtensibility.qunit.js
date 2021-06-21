/* global QUnit */

sap.ui.define([
	"sap/ui/fl/write/_internal/fieldExtensibility/ABAPAccess",
	"sap/ui/fl/write/_internal/fieldExtensibility/cap/CAPAccess",
	"sap/ui/fl/write/api/FieldExtensibility",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4",
	"sap/base/util/UriParameters"
], function(
	ABAPAccess,
	CAPAccess,
	FieldExtensibility,
	jQuery,
	sinon,
	UriParameters
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

	function stubAccessFunctions(AccessClass) {
		aFunctionNames.forEach(function(sFunctionName) {
			sandbox.stub(AccessClass, sFunctionName);
		});
	}

	QUnit.module("Given FieldExtensibility with an ABAPAccess.js", {
		beforeEach: function() {
			FieldExtensibility._resetCurrentScenario();
			stubAccessFunctions(ABAPAccess);
			stubAccessFunctions(CAPAccess);
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
					assert.strictEqual(ABAPAccess[sFunctionName].callCount, 1, "the Implementation was called");
					assert.ok(CAPAccess[sFunctionName].notCalled, "then no other implementation is called");
				});
			});
		});
	});

	QUnit.module("Given a CAP system is identified", {
		beforeEach: function() {
			FieldExtensibility._resetCurrentScenario();
			stubAccessFunctions(CAPAccess);
			sandbox.stub(UriParameters.prototype, "get")
				.callThrough()
				.withArgs("sap-ui-fl-xx-capScenario")
				.returns("true");
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
					assert.equal(CAPAccess[sFunctionName].callCount, 1, "the Implementation was called");
				});
			});
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
