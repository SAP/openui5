/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/deepExtend",
	"sap/ui/support/supportRules/Constants",
	"sap/ui/support/supportRules/Storage",
	"sap/ui/support/supportRules/ui/models/SharedModel"
], function (deepExtend, Constants, Storage, SharedModel) {
	"use strict";

	var SelectionUtils = {
		model: SharedModel,

		/**
		 * Traverses the model and creates a rule descriptor for every selected rule
		 *
		 * @returns {Array} Rule selections array
		 */
		getRulesSelectionState: function () {

			var oModel = this.treeTable.getBinding().getModel(),
				oRuleSets = oModel.getData(),
				aSelectedRules = [];

			Object.keys(oRuleSets).forEach(function(iRuleSet) {
				oRuleSets[iRuleSet].nodes.forEach(function(oRule) {
					aSelectedRules.push({
						ruleId: oRule.id,
						selected: oRule.selected,
						libName: oRule.libName
					});

				});
			});

			return aSelectedRules;
		},

		getSelectedRules: function () {

			var oModel = this.treeTable.getBinding().getModel(),
				oRuleSets = oModel.getData(),
				aSelectedRules = [];

			if (!oRuleSets) {
				return;
			}

			Object.keys(oRuleSets).forEach(function(iRuleSet) {
				oRuleSets[iRuleSet].nodes.forEach(function(oRule) {
						if (oRule.selected) {
							aSelectedRules.push({
							ruleId: oRule.id,
							libName: oRule.libName
						});
					}

				});
			});

			this.model.setProperty("/selectedRulesCount", aSelectedRules.length);

			return aSelectedRules;
		},
		/**
		 * Traverses the model and updates the selection flag for the selected rules
		 *
		 * @returns {Array} Rule selections array
		 */
		updateSelectedRulesFromLocalStorage: function (oTreeViewModelRules) {
			var aSelectedRules = Storage.getSelectedRules();

			if (!aSelectedRules) {
				return null;
			}

			if (!oTreeViewModelRules) {
				return null;
			}


			aSelectedRules.forEach(function (oRuleDescriptor) {
				Object.keys(oTreeViewModelRules).forEach(function(iKey) {
					oTreeViewModelRules[iKey].nodes.forEach(function(oRule) {
						if (oRule.id === oRuleDescriptor.ruleId) {
							oRule.selected = oRuleDescriptor.selected;
							if (!oRule.selected) {
								oTreeViewModelRules[iKey].selected = false;
							}
						}
					});
				});
			});

			return oTreeViewModelRules;
		},

		/**
		 * Saves rule selections and selection presets to the local storage
		 */
		persistSelection: function () {
			var aSelectedRules = this.getRulesSelectionState();

			Storage.setSelectedRules(aSelectedRules);
		},

		/**
		 * Sets the selected rules in the same format in which they are imported
		 *
		 * @param {Array} aSelectedRules The selected rules - same as the result of getSelectedRulesPlain
		 */
		setSelectedRules: function (aSelectedRules) {
			var oRuleSetsData = deepExtend({}, this.treeTable.getModel("ruleSets").getData());

			// deselect all
			Object.keys(oRuleSetsData).forEach(function(iKey) {
				oRuleSetsData[iKey].nodes.forEach(function(oRule) {
					oRule.selected = false;
				});
			});

			// select those from aSelectedRules
			aSelectedRules.forEach(function (oRuleDescriptor) {
				Object.keys(oRuleSetsData).forEach(function(iKey) {
					oRuleSetsData[iKey].nodes.forEach(function(oRule) {
						if (oRule.id === oRuleDescriptor.ruleId) {
							oRule.selected = true;
						}
					});
				});
			});

			this.treeTable.getModel("ruleSets").setData(oRuleSetsData);
			// syncs the parent and child selected/deselected state
			this.treeTable.syncParentNodeSelectionWithChildren(this.treeTable.getModel("ruleSets"));

			// apply selection to ui
			this.treeTable.updateSelectionFromModel();

			// update the count in ui
			this.getSelectedRules();

			if (Storage.readPersistenceCookie(Constants.COOKIE_NAME)) {
				this.persistSelection();
			}
		},


		/**
		 * Applies selection after loading additional rulesets.
		 * @param {Object} oRuleSetsFresh Newly loaded rulesets, without selections
		 * @param {Object} oRuleSetsWithSelection The current data of the Rulesets model with selections
		 */
		_syncSelectionAdditionalRuleSetsMainModel: function (oRuleSetsFresh, oRuleSetsWithSelection) {
			Object.keys(oRuleSetsFresh).forEach(function(iKey) {
				Object.keys(oRuleSetsWithSelection).forEach(function(iKey) {
					if (oRuleSetsFresh[iKey].id === oRuleSetsWithSelection[iKey].id) {
						oRuleSetsFresh[iKey] = oRuleSetsWithSelection[iKey];
					}
				});
			});
		},

		/**
		 * Deselects additional rulesets
		 * @param {Object} oRuleSets Newly loaded rulesets, with selections
		 * @param {Array} aAdditionalRuleSetsNames Additional rulesets names
		 */
		_deselectAdditionalRuleSets: function (oRuleSets, aAdditionalRuleSetsNames) {
			if (!aAdditionalRuleSetsNames) {
				return;
			}

			aAdditionalRuleSetsNames.forEach(function (sRuleName) {
				Object.keys(oRuleSets).forEach(function(iKey) {
					if (oRuleSets[iKey].name === sRuleName) {
						oRuleSets[iKey].selected = false;
						oRuleSets[iKey].nodes.forEach(function(oRule){
							oRule.selected = false;
						});
					}
				});
			});
		}
	};

	return SelectionUtils;
});