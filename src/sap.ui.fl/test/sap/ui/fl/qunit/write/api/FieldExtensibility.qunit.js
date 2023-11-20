/* global QUnit */

sap.ui.define([
	"sap/ui/fl/write/_internal/fieldExtensibility/ABAPAccess",
	"sap/ui/fl/write/_internal/fieldExtensibility/cap/CAPAccess",
	"sap/ui/fl/write/api/FieldExtensibility",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/base/ManagedObject"
], function(
	ABAPAccess,
	CAPAccess,
	FieldExtensibility,
	sinon,
	ManagedObject
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
		before() {
			// Determine scenario
			FieldExtensibility.onControlSelected(new ManagedObject());
		},
		beforeEach() {
			stubAccessFunctions(ABAPAccess);
			stubAccessFunctions(CAPAccess);
		},
		afterEach() {
			sandbox.restore();
		},
		after() {
			FieldExtensibility._resetCurrentScenario();
		}
	}, function() {
		aFunctionNames.forEach(function(sFunctionName) {
			var sText = `when the function ${sFunctionName} is called`;
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
		before() {
			sandbox.stub(URLSearchParams.prototype, "get")
			.callThrough()
			.withArgs("sap-ui-fl-xx-capScenario")
			.returns("true");
			// Determine scenario
			FieldExtensibility.onControlSelected(new ManagedObject());
		},
		beforeEach() {
			stubAccessFunctions(CAPAccess);
		},
		afterEach() {
			sandbox.restore();
		},
		after() {
			FieldExtensibility._resetCurrentScenario();
		}
	}, function() {
		aFunctionNames.forEach(function(sFunctionName) {
			var sText = `when the function ${sFunctionName} is called`;
			QUnit.test(sText, function(assert) {
				return FieldExtensibility[sFunctionName]().then(function() {
					assert.ok(true, "the function returns a promise");
					assert.equal(CAPAccess[sFunctionName].callCount, 1, "the Implementation was called");
				});
			});
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
