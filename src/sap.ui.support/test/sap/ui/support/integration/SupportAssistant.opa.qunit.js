/*global QUnit*/
sap.ui.define([
	'sap/ui/test/Opa5',
	'sap/ui/test/opaQunit',
	'sap/ui/test/actions/Press'
], function (Opa5, opaTest, Press) {
	"use strict";

	QUnit.module('Support Assistant');

	Opa5.extendConfig({
		viewNamespace: 'appUnderTest.view.',
		autoWait: true,
		extensions: ['sap/ui/core/support/RuleEngineOpaExtension'],
		appParams: {
			'sap-ui-support': 'true,silent'
		},
		assertions: new Opa5({
			iShouldSeeHighSupportErrorsButStillPassTheTest: function (controlId) {
				return this.waitFor({
					success: function () {
						Opa5.assert.noRuleFailures({
							'failOnHighIssues': false,
							rules: [
								{
									libName: 'sap.ui.core',
									ruleId: 'xmlViewUnusedNamespaces'
								},
								{
									libName: 'sap.m',
									ruleId: 'inputNeedsLabel'
								}
							],
							executionScope: {
								type: 'global',
								selectors: controlId
							}
						});
					}
				});
			},
			iShouldGetACheckForSupportErrorsOnSubtreeScope: function (controlId) {
				return this.waitFor({
					success: function () {
						Opa5.assert.noRuleFailures({
							'failOnHighIssues': true,
							rules: [
								{
									libName: 'sap.m',
									ruleId: 'onlyIconButtonNeedsTooltip'
								}
							],
							executionScope: {
								type: 'subtree',
								selectors: controlId
							}
						});
					}
				});
			},
			iShouldSeeNoSupportErrors: function (controlId) {
				return this.waitFor({
					success: function () {
						Opa5.assert.noRuleFailures({
							'failOnHighIssues': false,
							'failOnAnyIssues': true,
							rules: [
								{
									libName: 'sap.m',
									ruleId: 'inputNeedsLabel'
								}
							],
							executionScope: {
								type: 'subtree',
								selectors: controlId
							}
						});
					}
				});
			},
			iShouldSeeNoHighSeverityErrors: function (controlId) {
				return this.waitFor({
					success: function () {
						Opa5.assert.noRuleFailures({
							'failOnHighIssues': true,
							rules: [
								{
									libName: 'sap.m',
									ruleId: 'onlyIconButtonNeedsTooltip'
								}
							],
							executionScope: {
								type: 'global', // This could also be 'global' or 'components'
								selectors: controlId
							}
						});
					}
				});
			}
		})
	});

	opaTest('Should not fail on "High" severity issues checked on global execution scope', function (Given, When, Then) {
		var inputId = 'testInput';

		Given.iStartMyAppInAFrame('test-resources/sap/ui/support/integration/applicationUnderTest/index.html');

		When.waitFor({
			viewName: 'Main',
			id: 'testInput',
			success: function () {
				Opa5.assert.ok(true, 'Input Found');
			}
		});

		Then.iShouldSeeHighSupportErrorsButStillPassTheTest(inputId);
	});

	opaTest('Should fail only on "High" severity issues checked on subtree execution scope', function (Given, When, Then) {
		var dialogId = 'dialogWithRuleErrors';
		var closeButtonId = 'dialogWithRuleErrorsCloseButton';

		When.waitFor({
			viewName: 'Main',
			id: 'firstButton',
			actions: new Press(),
			errorMessage: 'Did not find button to open the first dialog'
		});

		Then.waitFor({
			id: dialogId,
			success: function () {
				Opa5.assert.ok(true, 'Dialog opened');
			}
		});

		Then.iShouldGetACheckForSupportErrorsOnSubtreeScope(dialogId);

		Then.waitFor({
			id: closeButtonId,
			actions: new Press(),
			success: function () {
				Opa5.assert.ok(true, 'Dialog closed');
			}
		});
	});

	opaTest('Should fail on any severity issue checked on subtree execution scope ', function (Given, When, Then) {
		var dialogId = 'dialogWithRuleErrors';
		var closeButtonId = 'dialogWithRuleErrorsCloseButton';
		var inputId2 = 'testInput2';

		When.waitFor({
			viewName: 'Main',
			id: 'firstButton',
			actions: new Press(),
			errorMessage: 'Did not find button to open the first dialog'
		});

		Then.waitFor({
			id: dialogId,
			success: function () {
				Opa5.assert.ok(true, 'Dialog opened');
			}
		});

		Then.iShouldSeeNoSupportErrors(inputId2);

		Then.waitFor({
			id: closeButtonId,
			actions: new Press(),
			success: function () {
				Opa5.assert.ok(true, 'Dialog closed');
			}
		});
	});

	opaTest('Should fail only on "High" severity issues checked on global execution scope', function (Given, When, Then) {
		var dialogId = 'dialogWithNoRuleErrors';
		var closeButtonId = 'dialogWithNoRuleErrorsCloseButton';

		When.waitFor({
			viewName: 'Main',
			id: 'secondButton',
			actions: new Press(),
			errorMessage: 'Did not find button to open the second dialog'
		});

		Then.waitFor({
			id: dialogId,
			success: function () {
				Opa5.assert.ok(true, 'Dialog opened');
			}
		});

		//There are no issues with the second dialog and no errors should appear
		Then.iShouldSeeNoHighSeverityErrors(dialogId);

		Then.waitFor({
			id: closeButtonId,
			actions: new Press(),
			success: function () {
				Opa5.assert.ok(true, 'Dialog closed');
			}
		});
		Then.iTeardownMyAppFrame();
	});

});