/*!
 * ${copyright}
 */

/* eslint-disable quotes */
/* global QUnit,sinon */

sap.ui.define([
	"sap/ui/test/gherkin/qUnitTestHarness",
	"sap/ui/test/gherkin/StepDefinitions",
	"sap/m/Label",
	"./testHarnessTests"
], function(qUnitTestHarness, StepDefinitions, Label, testHarnessTests) {
	'use strict';

	QUnit.module("QUnit Test Harness Tests", {

		beforeEach : function() {

			// mocks the test harness's QUnit executions (use this carefully, only for a very limited scope)
			var fnMockQUnitSetup = function() {
				this.oQUnitTestStub = sinon.stub(QUnit, 'test', function(scenarioName, callback) {
					callback(QUnit.assert);
				});
				this.oQUnitSkipStub = sinon.stub(QUnit, 'skip', function(scenarioName, callback) {
					callback(QUnit.assert);
				});
				this.oQUnitOkStub = sinon.stub(QUnit.assert, 'ok');
			};

			// restores QUnit to normal
			var fnMockQUnitTeardown = function() {
				this.oQUnitTestStub.restore();
				this.oQUnitSkipStub.restore();
				this.oQUnitOkStub.restore();
			};

			testHarnessTests.beforeEach(fnMockQUnitSetup, fnMockQUnitTeardown, qUnitTestHarness);
		},

		afterEach: function() {
			testHarnessTests.afterEach();
		}

	});



	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	// TEST /////////////////////////////////////////////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	QUnit.test("Given invalid parameters, when I call 'test', then I get an error", function(assert) {

		var sObjectError = "qUnitTestHarness.test: input all arguments via a single object";
		var sFeaturePathError = "qUnitTestHarness.test: parameter 'featurePath' must be a valid string";
		var sStepsError = "qUnitTestHarness.test: parameter 'steps' must be a valid StepDefinitions constructor";

		assert.throws( function() {
			qUnitTestHarness.test();
		}, function(oError) {
			return oError.message === sObjectError;
		},
			"call 'test' with no parameters at all"
		);

		assert.throws( function() {
			qUnitTestHarness.test(42);
		}, function(oError) {
			return oError.message === sObjectError;
		},
			"call 'test' with a non-object parameter"
		);

		assert.throws( function( ) {
			qUnitTestHarness.test({steps: new function(){}()});
		}, function(oError) {
			return oError.message === sFeaturePathError;
		},
			"'featurePath' parameter is omitted"
		);

		assert.throws( function() {
			qUnitTestHarness.test({featurePath: 12, steps: function(){}});
		}, function(oError) {
			return oError.message === sFeaturePathError;
		},
			"'featurePath' parameter is not a string"
		);

		assert.throws( function() {
			qUnitTestHarness.test({featurePath: 'hello world'});
		}, function(oError) {
			return oError.message === sStepsError;
		},
			"'steps' parameter is omitted"
		);

		assert.throws( function() {
			qUnitTestHarness.test({featurePath: 'hello world', steps: 12});
		}, function(oError) {
			return oError.message === sStepsError;
		},
			"'steps' parameter is not a function"
		);

		assert.throws( function() {
			qUnitTestHarness.test({featurePath: 'goodbye cruel world!', steps: Error});
		}, function(oError) {
			return oError.message === sStepsError;
		},
			"'steps' parameter is not a StepDefinitions constructor (also not a SAPUI5 object)"
		);

		assert.throws( function() {
			qUnitTestHarness.test({featurePath: 'goodbye cruel world!', steps: Label});
		}, function(oError) {
			return oError.message === sStepsError;
		},
			"'steps' parameter is not a StepDefinitions constructor (but is a SAPUI5 object)"
		);

		// Make sure it does not throw an exception to pass in the parent StepDefinitions class rather than the expected child
		qUnitTestHarness.test({featurePath: 'Feature: success', steps: StepDefinitions});
		assert.ok(true, "'steps' parameter can be a direct StepDefinitions constructor");
	});

	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	// TEST /////////////////////////////////////////////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////////////////////////////////////////////////
	testHarnessTests.runTests();

});
