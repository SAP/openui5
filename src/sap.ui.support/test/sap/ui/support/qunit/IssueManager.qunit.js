/*global QUnit*/

(function () {
	"use strict";

	jQuery.sap.require("sap/ui/support/supportRules/IssueManager");
	jQuery.sap.require("sap/ui/support/supportRules/RuleSet");

	var createValidIssue = function () {
		return {
			details: "detailsStr",
			severity: "Medium",
			context: {
				id: "testId"
			}
		};
	};

	QUnit.module("IssueManager API test", {
		setup: function () {
			this.im = sap.ui.support.supportRules.IssueManager;
			this.rs = new sap.ui.support.supportRules.RuleSet({name: "testRuleSet"});
			this.rs.addRule(window.saptest.createValidRule("id1"));
			this.imFacade = this.im.createIssueManagerFacade(this.rs.getRules().id1);
		},
		teardown: function () {
			sap.ui.support.supportRules.RuleSet.clearAllRuleSets();
			this.im.clearIssues();
			this.im.clearHistory();
		}
	});

	QUnit.test("IssueManagerFacade addIssue ", function (assert) {
		assert.ok(this.imFacade.addIssue != undefined
				&& typeof this.imFacade.addIssue == "function",
				"public API should not change");
	});

	QUnit.test("IssueManager addIssue ", function (assert) {
		var issue = createValidIssue(),
			that = this;

		delete issue.details;

		assert.throws(function () {
			that.imFacade.addIssue(issue);
		}, "should throw errror if no details is provided");
	});

	QUnit.test("IssueManager addIssue ", function (assert) {
		var issue = createValidIssue(),
			that = this;

		delete issue.severity;

		assert.throws(function () {
			that.imFacade.addIssue(issue);
		}, "should throw errror if no severity is provided");
	});

	QUnit.test("IssueManager addIssue ", function (assert) {
		var issue = createValidIssue(),
			that = this;

		issue.severity = "nonexistingseverity";

		assert.throws(function () {
			that.imFacade.addIssue(issue);
		}, "should throw errror severity is not in the sap.ui.support.Severity enum");
	});

	QUnit.test("IssueManager addIssue ", function (assert) {
		var issue = createValidIssue(),
			that = this;

		delete issue.context;

		assert.throws(function () {
			that.imFacade.addIssue(issue);
		}, "should throw errror if no context is provided");
	});

	QUnit.test("IssueManager addIssue ", function (assert) {
		var issue = createValidIssue(),
			that = this;

		delete issue.context.id;

		assert.throws(function () {
			that.imFacade.addIssue(issue);
		}, "should throw errror if no context ID is provided");
	});

	QUnit.test("IssueManager walkIssue ", function (assert) {
		var issueCount = 10,
			walkCounter = 0;

		for (var i = 0; i < issueCount; i++) {
			this.imFacade.addIssue(createValidIssue());
		}

		this.im.walkIssues(function () {
			walkCounter++;
		});

		assert.equal(issueCount, walkCounter, "should walk exactly as many issues as were added");
	});

	QUnit.test("IssueManager clearIssues ", function (assert) {
		var issueCount = 10,
			walkCounter = 0;
		for (var i = 0; i < issueCount; i++) {
			this.imFacade.addIssue(createValidIssue());
		}

		this.im.clearIssues();

		this.im.walkIssues(function () {
			walkCounter++;
		});

		assert.equal(walkCounter, 0, "No issues should be visited");
	});

	QUnit.test("IssueManager clearIssues ", function (assert) {
		var issueCount = 10;
		for (var i = 0; i < issueCount; i++) {
			this.imFacade.addIssue(createValidIssue());
		}

		this.im.clearIssues();

		assert.equal(this.im.getHistory()[0].issues.length, issueCount, "should dump them to history");
	});

	QUnit.test("IssueManager getHistory ", function (assert) {
		var issueCount = 10,
			issueCountSecond = 5;

		for (var i = 0; i < issueCount; i++) {
			this.imFacade.addIssue(createValidIssue());
		}

		var firstHistoryLength = this.im.getHistory()[0].issues.length;

		for (var j = 0; j < issueCountSecond; j++) {
			this.imFacade.addIssue(createValidIssue());
		}

		var secondHistoryLength = this.im.getHistory()[1].issues.length;

		assert.equal(firstHistoryLength, issueCount, "Should have the same amount of elements as added with addIssue()");
		assert.equal(secondHistoryLength, issueCountSecond, "Should have the same amount of elements as added with addIssue()");
		assert.equal(firstHistoryLength + secondHistoryLength, issueCount + issueCountSecond, "sum of 2 history gets should be equal to total added issues");
	});
}());
