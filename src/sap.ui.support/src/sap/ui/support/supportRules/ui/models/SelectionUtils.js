/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/support/supportRules/Constants",
	"sap/ui/support/supportRules/Storage",
	"sap/ui/support/supportRules/ui/models/SharedModel",
	"sap/ui/core/util/File"
], function (jQuery, constants, storage, SharedModel, File) {
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
				return;
			}

			if (!oTreeViewModelRules) {
				return;
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
		 * Saves rule selections to the local storage
		 */
		persistSelection: function () {
			var aSelectedRules = this.getRulesSelectionState();

			storage.setSelectedRules(aSelectedRules);
		},

		exportSelectedRules: function (title, description) {
			var aSelectedRules = this.getSelectedRules();
			var oRulesToExport = {
				title: title,
				description: description,
				selections: aSelectedRules
			};

			var oExportObject = JSON.stringify(oRulesToExport);

			File.save(oExportObject, constants.RULE_SELECTION_EXPORT_FILE_NAME, 'json', 'text/plain');
		},

		isValidSelectionImport: function (oImport) {
			var bIsFileValid = true;

			if (!oImport.hasOwnProperty("title")) {
				bIsFileValid = false;
			}

			if (!oImport.hasOwnProperty("description")) {
				bIsFileValid = false;
			}

			if (!oImport.hasOwnProperty("selections")) {
				bIsFileValid = false;
			} else if (!Array.isArray(oImport.selections)) {
				bIsFileValid = false;
			} else {
				for (var i = 0; i < oImport.selections.length; i++) {
					var oRuleSelection = oImport.selections[i];
					if (!oRuleSelection.hasOwnProperty("ruleId") || !oRuleSelection.hasOwnProperty("libName")) {
						bIsFileValid = false;
						break;
					}
				}
			}

			return bIsFileValid;
		}
	};

	return SelectionUtils;
});