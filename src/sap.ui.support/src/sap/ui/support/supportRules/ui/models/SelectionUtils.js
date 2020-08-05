/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/support/supportRules/Constants",
	"sap/ui/support/supportRules/Storage",
	"sap/ui/support/supportRules/ui/models/SharedModel"
], function (jQuery, constants, storage, SharedModel) {
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
			var aSelectedRules = storage.getSelectedRules();

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

			storage.setSelectedRules(aSelectedRules);
		},

		/**
		 * Sets the selected rules in the same format in which they are imported
		 *
		 * @param {Array} aSelectedRules The selected rules - same as the result of getSelectedRulesPlain
		 */
		setSelectedRules: function (aSelectedRules) {
			var oTreeViewModelRules = this.model.getProperty("/treeModel");

			// deselect all
			Object.keys(oTreeViewModelRules).forEach(function(iKey) {
				oTreeViewModelRules[iKey].nodes.forEach(function(oRule) {
					oRule.selected = false;
				});
			});

			// select those from aSelectedRules
			aSelectedRules.forEach(function (oRuleDescriptor) {
				Object.keys(oTreeViewModelRules).forEach(function(iKey) {
					oTreeViewModelRules[iKey].nodes.forEach(function(oRule) {
						if (oRule.id === oRuleDescriptor.ruleId) {
							oRule.selected = true;
						}
					});
				});
			});

			// syncs the parent and child selected/deselected state
			this.treeTable.syncParentNoteWithChildrenNotes(oTreeViewModelRules);

			// apply selection to ui
			this.treeTable.updateSelectionFromModel();

			// update the count in ui
			this.getSelectedRules();

			if (storage.readPersistenceCookie(constants.COOKIE_NAME)) {
				this.persistSelection();
			}
		},


		/**
		 * Applies selection to the tree model after reinitializing model with additional rulesets.
		 * @param {Object} tempTreeModelWithAdditionalRuleSets tree model with no selection
		 * @param {Object} oTreeModelWithSelection tree model with selection before loading additional rulesets
		 * @returns {Object} oTreeModelWhitAdditionalRuleSets updated selection model
		 */
		_syncSelectionAdditionalRuleSetsMainModel: function (tempTreeModelWithAdditionalRuleSets, oTreeModelWithSelection) {

			Object.keys(tempTreeModelWithAdditionalRuleSets).forEach(function(iKey) {
				Object.keys(oTreeModelWithSelection).forEach(function(iKey) {
					if (tempTreeModelWithAdditionalRuleSets[iKey].id === oTreeModelWithSelection[iKey].id) {
						tempTreeModelWithAdditionalRuleSets[iKey] =  oTreeModelWithSelection[iKey];
					}
				});
			});

			return tempTreeModelWithAdditionalRuleSets;
		},

		/**
		 * Deselect additional rulesets in model
		 * @param {Object} oTreeModel tree model with loaded additional ruleset(s)
		 * @param {Array} aAdditionalRuleSetsNames additional ruleset(s) name
		 * @returns {Object} oTreeModel updated selection model
		 */
		_deselectAdditionalRuleSets: function (oTreeModel, aAdditionalRuleSetsNames) {

			if (!aAdditionalRuleSetsNames) {
				return;
			}

			aAdditionalRuleSetsNames.forEach(function (sRuleName) {
				Object.keys(oTreeModel).forEach(function(iKey) {
					if (oTreeModel[iKey].name === sRuleName) {
						oTreeModel[iKey].selected = false;
						oTreeModel[iKey].nodes.forEach(function(oRule){
							oRule.selected = false;
						});
					}
				});
			});

			return oTreeModel;
		}
	};

	return SelectionUtils;
});