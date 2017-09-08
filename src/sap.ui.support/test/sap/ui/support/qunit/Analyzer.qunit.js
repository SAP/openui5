/*global QUnit,sinon*/

sap.ui.require([
	"sap/ui/support/supportRules/Analyzer",
	"sap/ui/support/supportRules/IssueManager"
], function (Analyzer, IssueManager) {
		"use strict";

		QUnit.module("Analyzer", {
			setup: function () {
				this.oAnalyzer = new Analyzer();
				this.clock = sinon.useFakeTimers();
			},
			teardown: function () {
				this.oAnalyzer.reset();
				this.oAnalyzer = null;
				this.clock.restore();
			}
		});

		QUnit.test("Initial state", function (assert) {
			assert.equal(this.oAnalyzer.dStartedAt, null, "dStartedAt should be null");
			assert.equal(this.oAnalyzer.dFinishedAt, null, "dFinishedAt should be null");
			assert.equal(this.oAnalyzer.iElapsedTime, 0, "iElapsedTime should be 0");
			assert.equal(this.oAnalyzer._iAllowedTimeout, 10000, "_iAllowedTimeout should be 10000");
			assert.equal(this.oAnalyzer._iTotalProgress, 0, "_iTotalProgress should be 0");
			assert.equal(this.oAnalyzer._iCompletedRules, 0, "_iCompletedRules should be 0");
			assert.equal(this.oAnalyzer._iTotalRules, 0, "_iTotalRules should be 0");
			assert.equal(this.oAnalyzer._bRunning, false, "_bRunning should be false");
			assert.equal(Array.isArray(this.oAnalyzer._aRulePromices), true, "_aRulePromices should be an array");
			assert.equal(this.oAnalyzer._aRulePromices.length, 0, "_aRulePromices should be empty");
		});

		QUnit.test("Reset state", function (assert) {
			// Arrange
			this.oAnalyzer.dStartedAt = new Date();
			this.oAnalyzer.dFinishedAt = new Date();
			this.oAnalyzer.iElapsedTime = 35;
			this.oAnalyzer._iAllowedTimeout = 5000;
			this.oAnalyzer._iTotalProgress = 200;
			this.oAnalyzer._iCompletedRules = 10;
			this.oAnalyzer._iTotalRules = 25;
			this.oAnalyzer._bRunning = true;
			this.oAnalyzer._aRulePromices = ["task1", "task2"];

			// Act
			this.oAnalyzer.reset();

			// Assert
			assert.ok(this.oAnalyzer.dStartedAt instanceof Date, "dStartedAt should keep state");
			assert.ok(this.oAnalyzer.dFinishedAt instanceof Date, "dFinishedAt should keep state");
			assert.equal(this.oAnalyzer.iElapsedTime, 35, "iElapsedTime should keep state");
			assert.equal(this.oAnalyzer._iAllowedTimeout, 5000, "_iAllowedTimeout should keep state");
			assert.equal(this.oAnalyzer._iTotalProgress, 0, "_iTotalProgress should be reset back to 0");
			assert.equal(this.oAnalyzer._iCompletedRules, 0, "_iCompletedRules should be reset back to 0");
			assert.equal(this.oAnalyzer._iTotalRules, 0, "_iTotalRules should be reset back to 0");
			assert.equal(this.oAnalyzer._bRunning, false, "_bRunning should be reset back to false");
			assert.equal(Array.isArray(this.oAnalyzer._aRulePromices), true, "_aRulePromices should be an array");
			assert.equal(this.oAnalyzer._aRulePromices.length, 0, "_aRulePromices should be cleared");
		});

		QUnit.test("running", function (assert) {
			assert.equal(this.oAnalyzer.running(), false, "running() should return false");

			this.oAnalyzer._bRunning = true;

			assert.equal(this.oAnalyzer.running(), true, "running() should return true");
		});

		QUnit.test("getElapsedTimeString with no iElapsedTime", function (assert) {
			assert.equal(this.oAnalyzer.getElapsedTimeString(), "", "Elapsed time should be an empty string");
		});

		QUnit.test("getElapsedTimeString with iElapsedTime", function (assert) {
			// Arrange
			this.oAnalyzer.iElapsedTime = 1504259434000; // Mock a difference between two dates

			// Act
			var sElapsedTime = this.oAnalyzer.getElapsedTimeString();

			// Assert
			assert.equal(sElapsedTime, "09:50:34:0", "Should retrieve correct time string");
		});

		QUnit.test("_updateProgress", function (assert) {
			// Arrange
			var iExpectedStep;
			this.oAnalyzer._iTotalRules = 10;
			this.oAnalyzer.onNotifyProgress = function (iStep) { };
			sinon.spy(this.oAnalyzer, "onNotifyProgress");

			for (var i = 0; i < 10; i++) {
				// Act
				iExpectedStep = (i + 1) * 10; // Calculate the expected step value
				this.oAnalyzer._updateProgress();

				// Assert
				assert.ok(this.oAnalyzer.onNotifyProgress.calledWith(iExpectedStep), "Should notify progress with step " + iExpectedStep);
			}

			// Assert
			assert.equal(this.oAnalyzer._iTotalRules, 10, "_iTotalRules should still be 10");
			assert.equal(this.oAnalyzer._iCompletedRules, 10, "_iCompletedRules should now be 10");
			assert.equal(this.oAnalyzer._iTotalProgress, 100, "_iTotalProgress should now be 100");
			assert.equal(this.oAnalyzer.onNotifyProgress.callCount, 10, "onNotifyProgress should be called 10 times");

			this.oAnalyzer.onNotifyProgress.restore();
		});

		QUnit.module("Analyzer start", {
			setup: function () {
				this.oAnalyzer = new Analyzer();
				this.oMockCoreFacade = {};
				this.oMockExecutionScope = {};

				sinon.stub(IssueManager, "createIssueManagerFacade", function (oRule) {
					return {};
				});
			},
			teardown: function () {
				this.oAnalyzer.reset();
				this.oAnalyzer = null;
				IssueManager.createIssueManagerFacade.restore();
			}
		});

		QUnit.test("start with synchronous rules and 2 errors thrown", function (assert) {
			// Arrange
			this.clock = sinon.useFakeTimers();

			var done = assert.async(),
				oSpy = sinon.spy(),
				that = this;

			sinon.spy(this.oAnalyzer, "_updateProgress");
			sinon.spy(this.oAnalyzer, "reset");
			sinon.spy(jQuery.sap.log, "error");

			var aRules = [
				{
					id: "rule1",
					check: function (oIssueManagerFacade, oCoreFacade, oExecutionScope) {
						oSpy();
					}
				},
				{
					id: "rule2",
					check: function (oIssueManagerFacade, oCoreFacade, oExecutionScope) {
						throw "Some error";
					}
				},
				{
					id: "rule3",
					check: function (oIssueManagerFacade, oCoreFacade, oExecutionScope) {
						oSpy();
					}
				},
				{
					id: "rule4",
					check: function (oIssueManagerFacade, oCoreFacade, oExecutionScope) {
						throw "Another error";
					}
				}
			];

			// Act
			this.oAnalyzer.start(aRules, this.oMockCoreFacade, this.oMockExecutionScope).then(function () {

				// Assert
				assert.equal(oSpy.callCount, 2, "Two check functions should be executed successfully");
				assert.equal(jQuery.sap.log.error.callCount, 2, "should have two errors logged");
				assert.equal(that.oAnalyzer._updateProgress.callCount, 4, "_updateProgress should be called 4 times");
				assert.equal(that.oAnalyzer.reset.callCount, 1, "reset should be called once");

				that.oAnalyzer._updateProgress.restore();
				that.oAnalyzer.reset.restore();
				jQuery.sap.log.error.restore();

				done();
			});

			this.clock.tick(500);
			this.clock.restore();
		});

		QUnit.test("start with asynchronous rules", function (assert) {
			// Arrange
			var done = assert.async(),
				that = this;

			sinon.spy(this.oAnalyzer, "_updateProgress");
			sinon.spy(this.oAnalyzer, "reset");
			sinon.spy(this.oAnalyzer, "_handleException");
			sinon.spy(jQuery.sap.log, "error");

			this.oAnalyzer._iAllowedTimeout = 1500;

			var aRules = [
				{
					// Mocks a standard case.
					async: true,
					id: "rule1",
					check: function (oIssueManagerFacade, oCoreFacade, oExecutionScope, resolve) {
						setTimeout(function () {
							resolve();
						}, 500);
					}
				},
				{
					// Mocks a case where the check function takes too long to resolve.
					async: true,
					id: "rule2",
					check: function (oIssueManagerFacade, oCoreFacade, oExecutionScope, resolve) {
						setTimeout(function () {
							resolve();
						}, 2000);
					}
				},
				{
					// Mocks a case where the check function doesn't call resolve.
					async: true,
					id: "rule3",
					check: function (oIssueManagerFacade, oCoreFacade, oExecutionScope, resolve) { }
				},
				{
					// Mocks a case where the check function throws an error before being resolved.
					async: true,
					id: "rule4",
					check: function (oIssueManagerFacade, oCoreFacade, oExecutionScope, resolve) {
						throw "An error occured";
					}
				}
			];

			// Act
			this.oAnalyzer.start(aRules, this.oMockCoreFacade, this.oMockExecutionScope).then(function () {

				// Assert
				assert.equal(jQuery.sap.log.error.callCount, 3, "should have 3 errors logged");
				assert.equal(that.oAnalyzer._handleException.callCount, 3, "should have 3 errors handled");
				assert.equal(that.oAnalyzer._updateProgress.callCount, 4, "_updateProgress should be called 4 times");
				assert.equal(that.oAnalyzer.reset.callCount, 1, "reset should be called once");

				that.oAnalyzer._updateProgress.restore();
				that.oAnalyzer.reset.restore();
				that.oAnalyzer._handleException.restore();
				jQuery.sap.log.error.restore();

				done();
			});
		});
});