/* global QUnit */
sap.ui.define([
	"sap/ui/support/Bootstrap",
	'sap/ui/support/supportRules/IssueManager',
	'sap/ui/support/supportRules/RuleSet',
	'sap/ui/support/supportRules/Storage',
	'sap/ui/support/supportRules/Main'],
	function (Bootstrap,
			  IssueManager,
			  RuleSet,
			  Storage,
			  Main) {
		"use strict";

		var createValidRule = function (id) {
			return {
				id: id,
				check: function () { },
				title: "title",
				description: "desc",
				resolution: "res",
				audiences: ["Control"],
				categories: ["Performance"],
				selected:true
			};
		};

		var createValidIssue = function () {
			return {
				details: 'detailsStr',
				severity: 'Medium',
				context: {
					id: 'testId'
				}
			};
		};

		QUnit.module('IssueManager API test', {
			beforeEach: function (assert) {
				var done = assert.async();


				Bootstrap.initSupportRules(["true", "silent"], {
					onReady: function() {

						this.IssueManager = IssueManager;
						this.ruleSet = new RuleSet({ name: 'testRuleSet' });
						this.ruleSet.addRule(createValidRule('id1'));
						this.IssueManagerFacade = this.IssueManager.createIssueManagerFacade(this.ruleSet.getRules().id1);
						this.issue = createValidIssue();


						done();
					}.bind(this)
				});
			},
			afterEach: function () {
				RuleSet.clearAllRuleSets();
				this.issue = null;
				this.IssueManager.clearIssues();
			}
		});

		QUnit.test('IssueManager createIssueManagerFacade', function (assert) {
			assert.ok(this.IssueManagerFacade, 'IssueManagerFacade has been created successfully !');
		});

		QUnit.test('IssueManager addIssue without severity', function (assert) {
			delete this.issue.severity;

			assert.throws(function () {
				this.IssueManagerFacade.addIssue(this.issue);
			}, 'Should throw errror if no severity is provided');
		});

		QUnit.test('IssueManager addIssue with non existing severity', function (assert) {
			this.issue.severity = 'nonexistingseverity';

			assert.throws(function () {
				this.IssueManagerFacade.addIssue(this.issue);
			}, 'Should throw errror severity is not in the sap.ui.support.Severity enum');
		});

		QUnit.test('IssueManager addIssue without context', function (assert) {
			delete this.issue.context;

			assert.throws(function () {
				this.IssueManagerFacade.addIssue(this.issue);
			}, 'Should throw errror if no context is provided');
		});

		QUnit.test('IssueManager addIssue without context id', function (assert) {
			delete this.issue.context.id;

			assert.throws(function () {
				this.IssueManagerFacade.addIssue(this.issue);
			}, 'Should throw errror if no context ID is provided');
		});

		QUnit.test('IssueManager walkIssue', function (assert) {
			var iIssues = 10,
				iCounter = 0;

			for (var i = 0; i < iIssues; i++) {
				this.IssueManagerFacade.addIssue(createValidIssue());
			}

			this.IssueManager.walkIssues(function () {
				iCounter++;
			});

			assert.equal(iIssues, iCounter, 'Should walk exactly as many issues as were added');
		});

		QUnit.test('IssueManager clearIssues', function (assert) {
			var iIssues = 10,
				iIssuesCount = 0;
			for (var i = 0; i < iIssues; i++) {
				this.IssueManager.addIssue(createValidIssue());
			}

			this.IssueManager.clearIssues();

			this.IssueManager.walkIssues(function () {
				iIssuesCount++;
			});

			assert.equal(iIssuesCount, 0, 'No issues should be visited');
		});

		QUnit.test('IssueManager getIssuesViewModel', function (assert) {
			var iIssues = 10;

			for (var i = 0; i < iIssues; i++) {
				this.IssueManagerFacade.addIssue(this.issue);
			}

			var issuesViewModel = this.IssueManager.getIssuesModel();

			assert.equal(typeof issuesViewModel[0], 'object', 'The retrieved model contains Issues !');

			assert.equal(issuesViewModel[0].ruleId, 'id1', 'The retrieved model has an id !');

			assert.equal(issuesViewModel[0].severity, 'Medium', 'The retrieved model has a severity !');
		});

		QUnit.test('IssueManager getRulesViewModel', function (assert) {
			var oIssues = this.IssueManager.groupIssues(this.IssueManager.getIssuesViewModel()),
				oRuleIds = {
					placeholderNoDots:true,
					preloadAsyncCheck :true,
					segmentedButtonMixedItems:true,
					selectUsage:true,
					selectionDetailsNumberOfActionGroups:true,
					stableId:true,
					texttooltip:true,
					tokenparent:true,
					bindingPathSyntaxValidation:true,
					wizardBranchingAssociations:true,
					wizardStepParent:true
				},
				oRuleSets = {
					temporary: {
						lib: {
							name: 'temporary'
						},
						ruleset: {
							_mRules: {},
							_oSettings: {
								name: 'temporary'
							}
						}
					}
				},
				rulesViewModel = this.IssueManager.getRulesViewModel(oRuleSets, oRuleIds, oIssues);

			assert.strictEqual((rulesViewModel instanceof Object), true, 'The rulesViewModel is returned successfully !');

			assert.ok(rulesViewModel.temporary, 'The view model contains the previous set ruleSet !');
		});

		QUnit.test('IssueManager groupIssues', function(assert) {
			var aIssues,
				oIssue = createValidIssue();

			oIssue.context.id = 'testId - 1';
			oIssue.ruleId = '1';

			this.IssueManagerFacade.addIssue(oIssue);

			aIssues = this.IssueManager.getIssuesModel();

			assert.strictEqual(aIssues[0] instanceof Object, true, 'The retrieved issues are of type Object !');
			assert.ok(aIssues[0].ruleId, 'The retrieved issues has a ruleId !');
			assert.strictEqual(aIssues[0].ruleId, 'id1', 'The retrieved issues have the correct id set !');

			assert.ok(aIssues[0].context, 'The retrieved issues have a context !');
			assert.ok(aIssues[0].context.id === 'testId - 1', 'The context within the issues has the correct id !');

			assert.ok(aIssues[0].audiences, 'The retrieved issues have audiences !');
			assert.ok(aIssues[0].categories, 'The retrieved issues have categories !');

			aIssues = this.IssueManager.groupIssues(aIssues);

			assert.strictEqual(aIssues.testRuleSet instanceof Object, true, 'The retrieved issues have been grouped in a single rule set !');
			assert.strictEqual(aIssues.testRuleSet.id1 instanceof Array, true, 'The rule within the rule set has issues !');
			assert.strictEqual(aIssues.testRuleSet.id1[0].ruleId, 'id1', 'The rule has the correct ruleId set to it !');
			assert.strictEqual(aIssues.testRuleSet.id1[0].ruleLibName, 'testRuleSet', 'The grouped issues have the correct ruleLibName set !');

			assert.ok(aIssues.testRuleSet.id1[0].context, 'The grouped issues have a context !');
			assert.strictEqual(aIssues.testRuleSet.id1[0].context.id, 'testId - 1', 'The context has a correct id !');

			assert.ok(aIssues.testRuleSet.id1[0].audiences, 'The grouped issues have audiences !');
			assert.ok(aIssues.testRuleSet.id1[0].categories, 'The grouped issues have categories !');
		});
	});