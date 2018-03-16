/*!
 * ${copyright}
 */

/**
 * The RuleSet is an interface used to create, update and delete ruleset containing rules.
 */
sap.ui.define([
	"jquery.sap.global",
	"sap/ui/support/supportRules/Storage",
	"sap/ui/support/supportRules/Constants"
],
function (jQuery, storage, constants) {
	"use strict";

	/**
	 * Contains all rulesets inside the RuleSet.
	 *
	 * @readonly
	 * @name sap.ui.support.RuleSet.mRuleSets
	 * @memberof sap.ui.support
	 */
	var mRuleSets = {};

	/**
	 * Creates a RuleSet.
	 * The RuleSet can store multiple rules concerning namespaces.
	 * <h3>Usage</h3>
	 * The RuleSet is an interface used to create, update and delete rulesets.
	 *
	 * @class
	 * @public
	 * @constructor
	 * @namespace
	 * @name sap.ui.support.RuleSet
	 * @memberof sap.ui.support
	 * @author SAP SE
	 * @version ${version}
	 * @param {object} oSettings Name of the initiated
	 * @returns {void}
	 */
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

	/**
	 * Clears all rulesets inside the RuleSet.
	 * @public
	 * @static
	 * @method
	 * @name sap.ui.support.RuleSet.clearAllRuleSets
	 * @memberof sap.ui.support.RuleSet
	 * @returns {void}
	 */
	RuleSet.clearAllRuleSets = function () {
		mRuleSets = {};
	};

	/**
	 * Gets all rules from the RuleSet.
	 * @public
	 * @method
	 * @name sap.ui.support.RuleSet.getRules
	 * @memberof sap.ui.support.RuleSet
	 * @returns {object} All rules within the current RuleSet
	 */
	RuleSet.prototype.getRules = function () {
		return this._mRules;
	};

	/**
	 * Updates rules from the RuleSet.
	 * @public
	 * @method
	 * @name sap.ui.support.RuleSet.updateRule
	 * @memberof sap.ui.support.RuleSet
	 * @param {string} sRuleId Rule ID
	 * @param {object} ORuleSettings Rule settings
	 * @returns {string} sRuleVerification Rule Verification status
	 */
	RuleSet.prototype.updateRule = function (sRuleId, ORuleSettings) {
		var sRuleVerification = this._verifySettingsObject(ORuleSettings, true);

		if (sRuleVerification === "success") {
			delete this._mRules[sRuleId];
			this._mRules[ORuleSettings.id] = ORuleSettings;
		}

		return sRuleVerification;
	};

	/**
	 * Verifies the settings object of the current RuleSet.
	 * @private
	 * @method
	 * @name sap.ui.support.RuleSet._verifySettingsObject
	 * @memberof sap.ui.support.RuleSet
	 * @param {object} oSettings Settings object to be verified
	 * @param {boolean} bUpdate Triggers update of passed settings object
	 * @returns {string} Rule Verification status
	 */
	RuleSet.prototype._verifySettingsObject = function (oSettings, bUpdate) {

		if (!oSettings.id) {
			jQuery.sap.log.error("Support rule needs an id.");
			return "Support rule needs an unique id.";
		}

		if (!bUpdate && this._mRules[oSettings.id]) {
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
			var bIsWrongAudience = false,
				sAudienceName = "";
			oSettings.audiences.forEach(function (aud) {
				if (!sap.ui.support.Audiences[aud]) {
					bIsWrongAudience = true;
					sAudienceName = aud;
				}
			});

			if (bIsWrongAudience) {
				jQuery.sap.log.error("Audience " + sAudienceName + " does not exist. Please use the audiences from sap.ui.support.Audiences");
				return "Audience " + sAudienceName + " does not exist. Please use the audiences from sap.ui.support.Audiences";
			}
		}

		if (!oSettings.categories || oSettings.categories.length === 0) {
			jQuery.sap.log.error("Support rule with the id " + oSettings.id + " should have a category. Applying category ['Performance']");
			oSettings.categories = ["Performance"];
		}

		if (oSettings.categories && oSettings.categories.forEach) {
			var bIsWrongCategory = false,
				sCategoryName = "";
			oSettings.categories.forEach(function (cat) {
				if (!sap.ui.support.Categories[cat]) {
					bIsWrongCategory = true;
					sCategoryName = cat;
				}
			});

			if (bIsWrongCategory) {
				jQuery.sap.log.error("Category " + sCategoryName + " does not exist. Please use the categories from sap.ui.support.Categories");
				return "Category " + sCategoryName + " does not exist. Please use the categories from sap.ui.support.Categories";
			}
		}

		return "success";
	};

	/**
	 * Adds rules to RuleSet.
	 * @public
	 * @method
	 * @name sap.ui.support.RuleSet.addRule
	 * @memberof sap.ui.support.RuleSet
	 * @param {object} oSettings Settings object with rule information
	 * @returns {string} sRuleVerificationStatus Verification status
	 */
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

		var sRuleVerificationStatus = this._verifySettingsObject(oSettings);

		if (sRuleVerificationStatus === "success") {
			this._mRules[oSettings.id] = oSettings;
			oSettings.libName = this._oSettings.name;
		}

		return sRuleVerificationStatus;
	};

	/**
	 * Adds all previously created temporary rules to the current library rules.
	 * @public
	 * @static
	 * @method
	 * @name sap.ui.support.RuleSet.addToTempRules
	 * @memberof sap.ui.support.RuleSet
	 * @param {object} oLibraries The loaded libraries and their rules
	 * @param {string[]} aTempRules The temporary rules previously created by the user
	 */
	RuleSet.addToTempRules = function (oLibraries, aTempRules) {
		if (aTempRules) {
			aTempRules.forEach(function (tempRule) {
				var ruleName = tempRule.id;
				oLibraries[constants.TEMP_RULESETS_NAME].RuleSet._mRules[ruleName] = tempRule;
			});
		}
	};

	/**
	 * Stores which rules are selected to be run by the analyzer on the next check
	 * @public
	 * @static
	 * @method
	 * @name sap.ui.support.RuleSet.storeSelectionOfRules
	 * @memberof sap.ui.support.RuleSet
	 * @param {Object[]} aLibraries The data for the libraries and their rules
	 */
	RuleSet.storeSelectionOfRules = function (aLibraries) {
		var selectedRules = RuleSet._extractRulesSettingsToSave(aLibraries);
		storage.setSelectedRules(selectedRules);
	};

	/**
	 * Loads the previous selection of the user - which rules are selected to be run by the Rule Analyzer.
	 * The method applies the settings to the currently loaded rules.
	 * @public
	 * @static
	 * @method
	 * @name sap.ui.support.RuleSet.loadSelectionOfRules
	 * @memberof sap.ui.support.RuleSet
	 * @param {Object[]} aLibraries The current loaded libraries and their rules
	 */
	RuleSet.loadSelectionOfRules = function (aLibraries) {
		var savedPreferences = storage.getSelectedRules();

		if (!savedPreferences) {
			return;
		}

		for (var index = 0; index < aLibraries.length; index += 1) {
			var libraryRules = aLibraries[index].rules;
			var libraryName = aLibraries[index].title;

			for (var rulesIndex = 0; rulesIndex < libraryRules.length; rulesIndex += 1) {
				//If there is a saved preference for the loaded rule apply it over the default
				if (savedPreferences[libraryName] && savedPreferences[libraryName].hasOwnProperty(libraryRules[rulesIndex].id)) {
					libraryRules[rulesIndex].selected = savedPreferences[libraryName][libraryRules[rulesIndex].id].selected;
				}
			}
		}
	};

	/**
	 * Extracts all the settings needed to be saved from the libraries rules.
	 * @private
	 * @method
	 * @static
	 * @name sap.ui.support.RuleSet._extractRulesSettingsToSave
	 * @memberof sap.ui.support.RuleSet
	 * @param {Object[]} aLibraries The libraries and rules loaded from the model
	 */
	RuleSet._extractRulesSettingsToSave = function (aLibraries) {
		var oLibrarySettings = {};
		var libraryRules;
		var librariesCount = aLibraries.length;
		var rulesCount;
		var libraryName;
		var ruleSettings;

		for (var libraryIndex = 0; libraryIndex < librariesCount; libraryIndex += 1) {
			libraryName = aLibraries[libraryIndex].title;
			oLibrarySettings[libraryName] = {};
			libraryRules = aLibraries[libraryIndex].rules;

			rulesCount = libraryRules.length;
			for (var rulesIndex = 0; rulesIndex < rulesCount; rulesIndex += 1) {
				ruleSettings = {};
				ruleSettings.id = libraryRules[rulesIndex].id;
				ruleSettings.selected = libraryRules[rulesIndex].selected;
				oLibrarySettings[libraryName][ruleSettings.id] = ruleSettings;
			}
		}

		return oLibrarySettings;
	};

	return RuleSet;
}, true);
