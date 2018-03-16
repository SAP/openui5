/*global QUnit*/

(function () {
	'use strict';

	jQuery.sap.require('sap.ui.qunit.qunit-css');
	jQuery.sap.require('sap.ui.thirdparty.qunit');
	jQuery.sap.require('sap.ui.qunit.qunit-junit');
	jQuery.sap.require('sap.ui.qunit.qunit-coverage');
	jQuery.sap.require('sap.ui.thirdparty.sinon');
	jQuery.sap.require('sap.ui.thirdparty.sinon-qunit');
	QUnit.config.autostart = false;

	sap.ui.require(
		['sap/ui/test/Opa5', 'sap/ui/test/opaQunit', 'sap/ui/test/actions/Press'],
		function (Opa5, opaTest, Press) {
			/**
			 * Returns an object to be used by the OPA plugin for the Support Assistant
			 * @param {string} controlId The control from which the check will start
			 * @param {boolean} failOnHighIssues Should the plugin search for "High" issues only
			 * @return {
			 *      {failOnHighIssues: boolean,
			 *      rules: [*,*,*,*],
			 *      executionScope: {type: string, selectors: string}}
			 * }
			 * The generated settings object
			 */
			function getConfiguration(controlId, failOnHighIssues) {
				return {
					'failOnHighIssues': failOnHighIssues,
					rules: [ //The rules array could be left empty so that
						// the Support Assistant will check against all rules present
						{
							libName: 'sap.ui.core',
							ruleId: 'preloadAsyncCheck'
						},
						{
							libName: 'sap.m',
							ruleId: 'onlyIconButtonNeedsTooltip'
						}
					],
					executionScope: {
						type: 'subtree', // This could also be 'global' or 'components'
						selectors: controlId
					}
				};
			}

			QUnit.module('Support Assistant');

			Opa5.extendConfig({
				viewNamespace: 'appUnderTest.view.',
				autoWait: true,
				extensions: ['sap/ui/core/support/RuleEngineOpaExtension'],
				appParams: {
					'sap-ui-support': 'true,silent'
				},
				assertions: new Opa5({
					iShouldSeeNoSupportErrors: function (controlId) {
						return this.waitFor({
							success: function () {
								Opa5.assert.noRuleFailures(getConfiguration(controlId, false));
							}
						});
					},
					iShouldGetACheckForAllSupportErrors: function (controlId) {
						return this.waitFor({
							success: function () {
								Opa5.assert.noRuleFailures({
									executionScope: {
										type: 'subtree', // This could also be 'global' or 'components'
										selectors: controlId
									}
								});
							}
						});
					},
					iShouldSeeNoHighSeverityErrors: function (controlId) {
						return this.waitFor({
							success: function () {
								Opa5.assert.noRuleFailures(getConfiguration(controlId, true));
							}
						});
					},
					iShouldGetSupportRuleReport: function () {
						return this.waitFor({
							success: function () {
								Opa5.assert.getFinalReport();
							}
						});
					}
				})
			});

			opaTest('Should fail on any severity issue checked globally with all rules', function (Given, When, Then) {
				var dialogId = 'dialogWithRuleErrors';
				var closeButtonId = 'dialogWithRuleErrorsCloseButton';

				Given.iStartMyAppInAFrame('applicationUnderTest/index.html');

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

				Then.waitFor({
					success: function () {
						Opa5.assert.noRuleFailures();
					}
				});

				Then.waitFor({
					id: closeButtonId,
					actions: new Press(),
					success: function () {
						Opa5.assert.ok(true, 'Dialog closed');
					}
				});
			});

			opaTest('Should fail only on "High" severity issues checked on specific scope with subset of rules', function (Given, When, Then) {
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

				//There is a medium and low issues raised by the support assistant
				// but the test passes because the plugin is set to fail on "High" issues only
				Then.iShouldSeeNoHighSeverityErrors(dialogId);

				Then.waitFor({
					id: closeButtonId,
					actions: new Press(),
					success: function () {
						Opa5.assert.ok(true, 'Dialog closed');
					}
				});
			});

			opaTest('Should pass without any issue, checked on specific scope with subset of rules', function (Given, When, Then) {
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
				Then.iShouldSeeNoSupportErrors(dialogId);

				Then.waitFor({
					id: closeButtonId,
					actions: new Press(),
					success: function () {
						Opa5.assert.ok(true, 'Dialog closed');
					}
				});
			});

			opaTest('Should get report after tests execution', function (Given, When, Then) {
				Then.iShouldGetSupportRuleReport();
				Then.iTeardownMyAppFrame();
			});

			QUnit.start();
		});
})();