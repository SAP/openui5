/*!
 * ${copyright}
 *
 * This object runs all common tests for qUnitTestHarness and opa5TestHarness
 */

/* eslint-disable quotes */
/* global QUnit,sinon */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/test/gherkin/qUnitTestHarness",
	"sap/ui/test/gherkin/opa5TestHarness",
	"sap/ui/test/gherkin/simpleGherkinParser",
	"sap/ui/test/gherkin/StepDefinitions",
	"sap/ui/test/opaQunit",
	"sap/ui/test/Opa5",
	"require"
], function(Log, qUnitTestHarness, opa5TestHarness, simpleGherkinParser, StepDefinitions, opaTest, Opa5, require) {
	'use strict';

	var oOpa5 = opa5TestHarness._oOpa5;

	var testHarnessTests = {

		beforeEach: function(fnMockSetup, fnMockTeardown, oTestHarness) {

			// mocks the test harness's QUnit/Opa5 executions (use this carefully, only for a very limited scope)
			this.fnMockSetup = fnMockSetup;
			this.fnMockTeardown = fnMockTeardown;

			// Either qUnitTestHarness or opa5TestHarness
			this.oTestHarness = oTestHarness;
			this.sTestHarness = (oTestHarness === qUnitTestHarness) ? "qUnitTestHarness" : "opa5TestHarness";

			// capture logs in a local variable
			this.aLogs = [];
			this.oLogListener = {
				onLogEntry: function(oLog) {
					this.aLogs.push(oLog.message);
				}.bind(this)
			};
			Log.addLogListener(this.oLogListener);

			// mocks simpleGherkinParser to allow us to directly pass Gherkin text instead of needing a separate file
			this.oParseFileStub = sinon.stub(simpleGherkinParser, 'parseFile', function(sPath) {
				return simpleGherkinParser.parse(sPath);
			});
		},

		afterEach: function() {
			Log.removeLogListener(this.oLogListener);
			this.oParseFileStub.restore();
		},

		runTests: function() {

			// //////////////////////////////////////////////////////////////////////////////////////////////////////
			// TEST /////////////////////////////////////////////////////////////////////////////////////////////////
			// //////////////////////////////////////////////////////////////////////////////////////////////////////
			QUnit.test("Smoke test for regular logging", function(assert) {

				var sText = [
					"Feature: The meaning of life is hard to figure out, is it really 42?",
					"",
					"	Scenario: Determine the meaning of life",
					"		Given the pursuit of happiness is a good thing",
					"		Then I should at least try to be happy"
				].join("\n");

				var fnSteps = StepDefinitions.extend("sap.ui.test.gherkin.StepDefinitionsTest", {
					init: function() {
						this.register(/^the pursuit of happiness is a good thing$/i, function() {});
						this.register(/^I should at least try to be happy$/i, function() {});
					}
				});

				this.fnMockSetup();
				this.oTestHarness.test({
					featurePath: sText,
					steps: fnSteps
				});
				this.fnMockTeardown();

				assert.deepEqual(this.aLogs, [
					"[GHERKIN] Running feature: 'Feature: The meaning of life is hard to figure out, is it really 42?'",
					"[GHERKIN] Running scenario: 'Scenario: Determine the meaning of life'",
					"[GHERKIN] Running step: text='the pursuit of happiness is a good thing' regex='/^the pursuit of happiness is a good thing$/i'",
					"[GHERKIN] Running step: text='I should at least try to be happy' regex='/^I should at least try to be happy$/i'"
				], "Logs are correct");

			}.bind(this));

			// //////////////////////////////////////////////////////////////////////////////////////////////////////
			// TEST /////////////////////////////////////////////////////////////////////////////////////////////////
			// //////////////////////////////////////////////////////////////////////////////////////////////////////
			QUnit.test("Given an @wip scenario, then its test steps should not execute", function(assert) {

				var sText = [
					"Feature: The meaning of life is hard to figure out",
					"",
					"	Scenario: Determine the value of 3 times 3",
					"		Given 3 times 3 equals 9",
					"",
					" @wip",
					"	Scenario: Determine the true meaning of life",
					"		Given the meaning of life is 42",
					"		Then what is the ultimate question?"
				].join("\n");

				var fnSpy1 = sinon.spy();
				var fnSpy2 = sinon.spy();
				var fnSpy3 = sinon.spy();

				var fnSteps = StepDefinitions.extend("sap.ui.test.gherkin.StepDefinitionsTest", {
					init: function() {
						this.register(/^3 times 3 equals 9$/i, fnSpy1);
						this.register(/^the meaning of life is 42$/i, fnSpy2);
						this.register(/^what is the ultimate question\?$/i, fnSpy3);
					}
				});

				this.fnMockSetup();
				this.oTestHarness.test({
					featurePath: sText,
					steps: fnSteps
				});
				this.fnMockTeardown();

				assert.ok(fnSpy1.calledOnce, "First test step was executed normally");
				assert.notOk(fnSpy2.called, "Second test step was skipped because it was @wip");
				assert.notOk(fnSpy3.called, "Third test step was skipped because it was @wip");
			}.bind(this));



			// //////////////////////////////////////////////////////////////////////////////////////////////////////
			// TEST /////////////////////////////////////////////////////////////////////////////////////////////////
			// //////////////////////////////////////////////////////////////////////////////////////////////////////
			QUnit.test("Given a not found test step, then skipped tests don't execute", function(assert) {

				var sText = [
					"Feature: The meaning of life is hard to figure out",
					"",
					"	Scenario: Determine the value of 3 times 3",
					"		Given 3 times 3 equals 9",
					"",
					"	Scenario: Determine the true meaning of life",
					"		Given the meaning of life is 42",
					"		When I create a planet-sized calculator",
					"		Then I discover the ultimate question"
				].join("\n");

				var fnSpy1 = sinon.spy();
				var fnSpy2 = sinon.spy();
				var fnSpy4 = sinon.spy();

				var fnSteps = StepDefinitions.extend("sap.ui.test.gherkin.StepDefinitionsTest", {
					init: function() {
						this.register(/^3 times 3 equals 9$/i, fnSpy1);
						this.register(/^the meaning of life is 42$/i, fnSpy2);
						// specifically, we have not registered "I create a planet-sized calculator"
						this.register(/^I discover the ultimate question$/i, fnSpy4);
					}
				});

				this.fnMockSetup();
				this.oTestHarness.test({
					featurePath: sText,
					steps: fnSteps
				});
				this.fnMockTeardown();

				assert.ok(fnSpy1.calledOnce, "First test step was executed normally");
				assert.ok(fnSpy2.calledOnce, "Second test step was executed normally");
				assert.notOk(fnSpy4.called, "Fourth test step was skipped because previous step was not found");
			}.bind(this));


			// //////////////////////////////////////////////////////////////////////////////////////////////////////
			// TEST /////////////////////////////////////////////////////////////////////////////////////////////////
			// //////////////////////////////////////////////////////////////////////////////////////////////////////
			opaTest("Deep testing of duplicate step definition behaviour", function() {

				// Unfortunately, the duplicate error bubbles up out of the frame, so we must ask QUnit to ignore it.
				// Fortunately, setting ignoreGlobalErrors only affects the current test so no cleanup is required.
				QUnit.config.current.ignoreGlobalErrors = true;

				oOpa5.iStartMyAppInAFrame(require.toUrl("./fixture/testHarnessDuplicate.html") + "?harness=" + this.sTestHarness);

				oOpa5.waitFor({
					id: "testing-done",
					success: function() {

						var oFrame$ = Opa5.getJQuery();

						var sTestResult = oFrame$("#qunit-testresult").text();
						var rRegex = /\d+ assertions of (\d+) passed, (\d+) failed\./i;
						var sResults = rRegex.exec(sTestResult);
						var iFailedTests = parseInt(sResults[2]);
						var iTotalTests = parseInt(sResults[1]);
						Opa5.assert.strictEqual(iFailedTests, 1, "Verified failed tests");
						Opa5.assert.strictEqual(iTotalTests, 1, "Verified total tests");

						var oDupe = oFrame$('.test-message')
							.filter(':contains("StepDefinitions.register: Duplicate step definition \'/^duplicate regex$/i\'")');
						Opa5.assert.strictEqual(oDupe.length, 1, 'Verified found text "Duplicate step definition"');

						oOpa5.iTeardownMyApp();
					}
				});
			}.bind(this));


			// //////////////////////////////////////////////////////////////////////////////////////////////////////
			// TEST /////////////////////////////////////////////////////////////////////////////////////////////////
			// //////////////////////////////////////////////////////////////////////////////////////////////////////
			opaTest("Deep testing of ambiguous step definition behaviour", function() {

				// Unfortunately, the ambiguous error bubbles up out of the frame, so we must ask QUnit to ignore it.
				// Fortunately, setting ignoreGlobalErrors only affects the current test so no cleanup is required.
				QUnit.config.current.ignoreGlobalErrors = true;

				oOpa5.iStartMyAppInAFrame(require.toUrl("./fixture/testHarnessAmbiguous.html") + "?harness=" + this.sTestHarness);

				oOpa5.waitFor({
					id: "testing-done",
					success: function() {

						var oFrame$ = Opa5.getJQuery();

						var sTestResult = oFrame$("#qunit-testresult").text();
						var rRegex = /\d+ assertions of (\d+) passed, (\d+) failed\./i;
						var sResults = rRegex.exec(sTestResult);
						var iFailedTests = parseInt(sResults[2]);
						var iTotalTests = parseInt(sResults[1]);
						Opa5.assert.strictEqual(iFailedTests, 1, "Verified failed tests");
						Opa5.assert.strictEqual(iTotalTests, 1, "Verified total tests");

						var oAmbiguous = oFrame$('.test-message')
							.filter(':contains("Ambiguous step definition error: 2 step definitions \'/^I should be served a coffee$/i\' and \'/^I should be served a .*$/i\' match the feature file step \'I should be served a coffee\'")');
						Opa5.assert.strictEqual(oAmbiguous.length, 1, 'Verified found text "Ambiguous step definition"');

						oOpa5.iTeardownMyApp();
					}
				});
			}.bind(this));



			// //////////////////////////////////////////////////////////////////////////////////////////////////////
			// TEST /////////////////////////////////////////////////////////////////////////////////////////////////
			// //////////////////////////////////////////////////////////////////////////////////////////////////////
			opaTest("Deep testing of test harness behaviour", function() {

				oOpa5.iStartMyAppInAFrame(require.toUrl("./fixture/testHarnessFailing.html") + "?harness=" + this.sTestHarness);

				oOpa5.waitFor({
					id: "testing-done",
					success: function() {

						var oFrame$ = Opa5.getJQuery();

						var sTestResult = oFrame$("#qunit-testresult").text();
						var rRegex = /\d+ assertions of (\d+) passed, (\d+) failed\./i;
						var sResults = rRegex.exec(sTestResult);
						var iFailedTests = parseInt(sResults[2]);
						var iTotalTests = parseInt(sResults[1]);
						Opa5.assert.strictEqual(iFailedTests, 3, "Verified failed tests");
						Opa5.assert.strictEqual(iTotalTests, 13, "Verified total tests");

						var oCoffee = oFrame$('.test-message').filter(':contains("I should be served a coffee")');
						Opa5.assert.strictEqual(oCoffee.length, 1, 'Verified found text "I should be served a coffee"');

						var oWip = oFrame$('.test-name')
							.filter(':contains("(WIP) Scenario: Don\'t fail a test with no assertions, if it\'s @wip")');
						Opa5.assert.strictEqual(oWip.length, 1, 'Verified that @wip stops a test with no assertions from failing');

						var oActualError = oCoffee.parent().parent().find('span.test-message').last();
						Opa5.assert.strictEqual(
							oActualError.text(),
							'Expected at least one assertion, but none were run - call expect(0) to accept zero assertions.',
							'Verified that scenario with no assertions triggers expect(0) error message'
						);

						var oNoCoffee = oFrame$('.test-message').filter(':contains("It\'s too late to drink coffee")');
						Opa5.assert.strictEqual(oNoCoffee.length, 1, 'Verified that expect(0) stops an assertion-less test from failing');

						var oWipFeature = oFrame$('.module-name')
							.filter(':contains("(WIP) Feature: An @wip feature automatically sets all its scenarios as @wip too")');
						Opa5.assert.strictEqual(oWipFeature.length, 1, 'Verified that @wip feature does not run its scenarios"');

						var sNotFoundText = oFrame$('.test-message')
							.filter(':contains("this test step does not exist and should fail the build")')
							.parent().parent().find('.test-message').last().text();
						Opa5.assert.ok(sNotFoundText.indexOf("expect(0)") === -1,
							'Verified that a (NOT FOUND) test step doesn\'t trigger an expect(0) error"');

						fnScenarioOutlineVerification(oFrame$);

						var oNotFoundNotSkipped = oFrame$('.test-message')
							.filter(':contains("(NOT FOUND) this step has no step definition defined")');
						Opa5.assert.strictEqual(oNotFoundNotSkipped.length, 1, "Verified found oNotFoundNotSkipped text");

						var oAtWipSkipped = oFrame$('.module-name')
						.filter(':contains("Feature: a feature whose scenarios are all @wip will be skipped")');
						Opa5.assert.strictEqual(oAtWipSkipped.length, 1, "Verified found oAtWipSkipped text");

						oOpa5.iTeardownMyApp();
					}
				});
			}.bind(this));

		}

	};

	var fnScenarioOutlineVerification = function(local$) {

		var sOne = "Scenario Outline: A scenario outline with two Examples, one of which is @wip, will execute only the other one";
		var sTwo = "Scenario Outline: a scenario outline with two Examples will execute them all";
		var sJoin = ": ";

		[
			[sOne, "famous people #1"].join(sJoin),
			[sOne, "famous people #2"].join(sJoin),
			[sOne, "famous people #3"].join(sJoin),

			[sTwo, "ordinary people #1"].join(sJoin),
			[sTwo, "ordinary people #2"].join(sJoin),
			[sTwo, "ordinary people #3"].join(sJoin),
			[sTwo, "fictional people #1"].join(sJoin),
			[sTwo, "fictional people #2"].join(sJoin),
			[sTwo, "fictional people #3"].join(sJoin)

		].forEach(function(text) {
			Opa5.assert.strictEqual(local$('.test-name').filter(':contains("' + text + '")').length, 1, "Verified " + text);
		});
	};

	return testHarnessTests;

});
