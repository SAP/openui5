/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/support/supportRules/Storage",
	"sap/ui/support/supportRules/Constants"
],
function (jQuery, storage, constants) {
	"use strict";

	var mRuleSets = {};

	var RuleSet = function (oSettings) {
		oSettings = oSettings || {};
		if (!oSettings.name) {
			jQuery.sap.log.error("Please provide a name for the RuleSet.");
		}

		if (mRuleSets[oSettings.name]) {
			return mRuleSets[oSettings.name];
		}
		this._oSettings = oSettings;
		this._mRules = {};
		mRuleSets[oSettings.name] = this;
	};

	RuleSet.clearAllRuleSets = function () {
		mRuleSets = {};
	};

	RuleSet.prototype.getRules = function () {
		return this._mRules;
	};

	RuleSet.prototype.updateRule = function (oldId, newSettings) {
		var verifyResult = this._verifySettingsObject(newSettings, true);

		if (verifyResult === "success") {
			delete this._mRules[oldId];
			this._mRules[newSettings.id] = newSettings;
		}

		return verifyResult;
	};

	RuleSet.prototype._verifySettingsObject = function (oSettings, update) {
		if (!oSettings.id) {
			jQuery.sap.log.error("Support rule needs an id.");
			return "Support rule needs an unique id.";
		}

		if (!update && this._mRules[oSettings.id]) {
			jQuery.sap.log.error("Support rule with the id " + oSettings.id + " already exists.");
			return "Support rule with the id " + oSettings.id + " already exists.";
		}

		if (!oSettings.check) {
			jQuery.sap.log.error("Support rule with the id " + oSettings.id + " needs a check function.");
			return "Support rule with the id " + oSettings.id + " needs a check function.";
		}

		if (!oSettings.title) {
			jQuery.sap.log.error("Support rule with the id " + oSettings.id + " needs a title.");
			return "Support rule with the id " + oSettings.id + " needs a title.";
		}

		if (!oSettings.description) {
			jQuery.sap.log.error("Support rule with the id " + oSettings.id + " needs a description.");
			return "Support rule with the id " + oSettings.id + " needs a description.";
		}

		if (!oSettings.resolution && (!oSettings.resolutionurls || !oSettings.resolutionurls.length > 0)) {
			jQuery.sap.log.error("Support rule with the id " + oSettings.id + " needs either a resolution or resolutionurls or should have a ticket handler function");
			return "Support rule with the id " + oSettings.id + " needs either a resolution or resolutionurls or should have a ticket handler function";
		}

		if (!oSettings.audiences || oSettings.audiences.length === 0) {
			jQuery.sap.log.error("Support rule with the id " + oSettings.id + " should have an audience. Applying audience ['Control']");
			oSettings.audiences = [sap.ui.support.Audiences.Control];
		}

		if (oSettings.audiences && oSettings.audiences.forEach) {
			var wrongAudience = false,
				audName = "";
			oSettings.audiences.forEach(function (aud) {
				if (!sap.ui.support.Audiences[aud]) {
					wrongAudience = true;
					audName = aud;
				}
			});

			if (wrongAudience) {
				jQuery.sap.log.error("Audience " + audName + " does not exist. Please use the audiences from sap.ui.support.Audiences");
				return "Audience " + audName + " does not exist. Please use the audiences from sap.ui.support.Audiences";
			}
		}

		if (!oSettings.categories || oSettings.categories.length === 0) {
			jQuery.sap.log.error("Support rule with the id " + oSettings.id + " should have a category. Applying category ['Performance']");
			oSettings.categories = ["Performance"];
		}

		if (oSettings.categories && oSettings.categories.forEach) {
			var wrongCategory = false,
				catName = "";
			oSettings.categories.forEach(function (cat) {
				if (!sap.ui.support.Categories[cat]) {
					wrongCategory = true;
					catName = cat;
				}
			});

			if (wrongCategory) {
				jQuery.sap.log.error("Category " + catName + " does not exist. Please use the categories from sap.ui.support.Categories");
				return "Category " + catName + " does not exist. Please use the categories from sap.ui.support.Categories";
			}
		}

		return "success";
	};

	RuleSet.prototype.addRule = function (oSettings) {
		var sCurrentVersion = RuleSet.versionInfo ? RuleSet.versionInfo.version : '';

		var sRuleVersion = oSettings.minversion ? oSettings.minversion : '';

		// Some rules use '-' instead of ''
		if (sRuleVersion === '-') {
			sRuleVersion = '';
		}

		// Do not add a rule that is for higher version of UI5
		// because APIs might not be in place
		if (sRuleVersion && jQuery.sap.Version(sCurrentVersion).compareTo(sRuleVersion) < 0) {
			return "Rule " + oSettings.id + " should be used with a version >= " + oSettings.minversion;
		}

		var verifyResult = this._verifySettingsObject(oSettings);

		if (verifyResult === "success") {
			this._mRules[oSettings.id] = oSettings;
			oSettings.libName = this._oSettings.name;
		}

		return verifyResult;
	};

	/**
	 * Adds all previously created temporary rules to the current library rules
	 * @param {Object} data The loaded libraries' and their rules
	 * @param {Array} tempRules The previously created user temporary rules
	 */
	RuleSet.addToTempRules = function (data, tempRules) {
		if (tempRules) {
			tempRules.forEach(function (tempRule) {
				var ruleName = tempRule.id;
				data[constants.TEMP_RuleSetS_NAME].RuleSet._mRules[ruleName] = tempRule;
			});
		}
	};

	/**
	 * Stores which rules are selected to be run by the analyzer on the next check
	 * @param {Array} libraries The data for the libraries and their rules
	 */
	RuleSet.storeSelectionOfRules = function (libraries) {
		var selectedRules = extractRulesSettingsToSave(libraries);
		storage.setSelectedRules(selectedRules);
	};

	/**
	 * Loads the previous selection of the user - which rules are selected to be run by the Rule Analyzer.
	 * The method applies the settings over the current loaded rules.
	 * @param {Array} libraries The current loaded libraries and their rules
	 */
	RuleSet.loadSelectionOfRules = function (libraries) {
		var savedPreferences = storage.getSelectedRules();

		if (!savedPreferences) {
			return;
		}

		for (var index = 0; index < libraries.length; index += 1) {
			var libraryRules = libraries[index].rules;
			var libraryName = libraries[index].title;

			for (var rulesIndex = 0; rulesIndex < libraryRules.length; rulesIndex += 1) {
				//If there is a saved preference for the loaded rule apply it over the default
				if (savedPreferences[libraryName] && savedPreferences[libraryName].hasOwnProperty(libraryRules[rulesIndex].id)) {
					libraryRules[rulesIndex].selected = savedPreferences[libraryName][libraryRules[rulesIndex].id].selected;
				}
			}
		}
	};

	/**
	 * Extracts all the settings needed to be save from the libraries' rules
	 * @param {Array} libraries The libraries and rules loaded from the model
	 * @returns {Object} The extracted settings the should be persisted
	 */
	function extractRulesSettingsToSave(libraries) {
		var librarySettings = Object.create(null);
		var libraryRules;
		var librariesCount = libraries.length;
		var rulesCount;
		var libraryName;
		var ruleSettings;

		for (var libraryIndex = 0; libraryIndex < librariesCount; libraryIndex += 1) {
			libraryName = libraries[libraryIndex].title;
			librarySettings[libraryName] = Object.create(null);
			libraryRules = libraries[libraryIndex].rules;

			rulesCount = libraryRules.length;
			for (var rulesIndex = 0; rulesIndex < rulesCount; rulesIndex += 1) {
				ruleSettings = Object.create(null);
				ruleSettings.id = libraryRules[rulesIndex].id;
				ruleSettings.selected = libraryRules[rulesIndex].selected;
				librarySettings[libraryName][ruleSettings.id] = ruleSettings;
			}
		}

		return librarySettings;
	}

	return RuleSet;
}, true);
