/*global QUnit*/

sap.ui.define(
	[ 'sap/ui/support/supportRules/RuleSetLoader', 'sap/ui/support/supportRules/util/RuleValidator' ],
	function(RuleSetLoader, RuleValidator) {
		'use strict';
		// Constants
		var aLibrariesToLoad = [
				'sap.m',
				'sap.ui.table',
				'sap.ui.core',
				'sap.ui.layout',
				'sap.uxap',
				'sap.f',
				'sap.viz',
				'sap.ui.fl',
				'sap.ui.comp',
				'sap.ui.unified'
			],
			oLibraries = {};

		function test(sLibraryName) {
			QUnit.module(sLibraryName);

			Object.keys(oLibraries[sLibraryName]).forEach(function(sKey) {
				var oRule = oLibraries[sLibraryName][sKey];

				QUnit.test(oRule.id, function(assert) {
					assert.equal(oRule.hasOwnProperty('id'), true, 'Rule should have property : id');
					assert.equal(oRule.hasOwnProperty('title'), true, 'Rule should have property : title');
					assert.equal(oRule.hasOwnProperty('description'), true, 'Rule should have property : description');
					assert.equal(oRule.hasOwnProperty('audiences'), true, 'Rule should have property : audiences');
					assert.equal(oRule.hasOwnProperty('categories'), true, 'Rule should have property : categories');
					assert.equal(oRule.hasOwnProperty('resolution'), true, 'Rule should have property : resolution');
					assert.equal(oRule.hasOwnProperty('check'), true, 'Rule should have property : check');

					assert.equal(
						RuleValidator.validateId(oRule.id),
						true,
						'id should be a valid camelCase string, contain latin alphabetic characters only and has between 6 and 50 characters'
					);

					assert.equal(typeof oRule.title === 'string', true, 'title has to be of type string');

					assert.equal(
						RuleValidator.validateStringLength(oRule.title, 1, 400),
						true,
						'title property should have a minimum length of 1 character and a maximum length of 400 characters'
					);

					assert.equal(typeof oRule.description === 'string', true, 'description has to be of type string');
					//
					assert.equal(
						RuleValidator.validateStringLength(oRule.description, 1, 400),
						true,
						'description property should have a minimum length of 1 character and a maximum length of 400 characters'
					);

					assert.equal(
						RuleValidator.validateRuleCollection(oRule.audiences, sap.ui.support.Audiences),
						true,
						'audiences should be filled with data of type string'
					);

					assert.equal(
						RuleValidator.validateRuleCollection(oRule.categories, sap.ui.support.Categories),
						true,
						'categories should be filled with data of type string'
					);

					assert.equal(
						RuleValidator.validateVersion(oRule.minversion),
						true,
						'minversion is of type string and should contain only numeric characters'
					);

					assert.equal(typeof oRule.resolution === 'string', true, 'resolution has to be of type string');

					assert.equal(
						RuleValidator.validateStringLength(oRule.resolution, 1, 400),
						true,
						'resolution property description property should have a minimum length of 1 character and a maximum length of 400 characters'
					);

					if (oRule.hasOwnProperty('async')) {
						assert.equal(typeof oRule.async, 'boolean', 'Rule should have property : check');
					}

					assert.equal(typeof oRule.check, 'function', 'check property should be a function');
				});
			});
		}

		RuleSetLoader._fetchSupportRuleSets(aLibrariesToLoad).then(function() {
			Object.keys(RuleSetLoader._mRuleSets).map(function(sKey) {
				var oLibrary = RuleSetLoader._mRuleSets[sKey];

				oLibraries[oLibrary.lib.name] = Object.values(oLibrary.ruleset._mRules);
			});

			for (var sLibraryName in oLibraries) {
				if (!oLibraries[sLibraryName].length) {
					continue;
				}

				test(sLibraryName);
			}
		});
	}
);