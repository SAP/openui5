/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/support/supportRules/Storage",
	"sap/ui/support/supportRules/Constants",
	"sap/ui/support/supportRules/ui/models/SharedModel",
	"sap/ui/core/util/File"
], function (Storage, constants, SharedModel, File) {
	"use strict";

	var PresetsUtils = {
		model: SharedModel,

		/**
		 * Initializes the current selection preset
		 * @param {Array} aSelectedRulesPlain The plain list of selected rules (same format as in the presets json file)
		 */
		initializeSelectionPresets: function (aSelectedRulesPlain) {
			// if we persist settings - load any selection presets, else use the default ones
			if (this.model.getProperty("/persistingSettings")) {
				var aPersistedPresets = Storage.getSelectionPresets();
				if (aPersistedPresets) {
					this.model.setProperty("/selectionPresets", aPersistedPresets);
				}
			}

			// find the selected preset
			var aPresets = this.model.getProperty("/selectionPresets");
			var oSelectedPreset = null;
			aPresets.some(function (oCurrent) {
				if (oCurrent.selected) {
					oSelectedPreset = oCurrent;
					return true;
				}
			});

			// sync 'My Selections' with current selections
			if (oSelectedPreset.isMySelection) {
				oSelectedPreset.selections = aSelectedRulesPlain;
			}

			// need to init the current preset
			this.model.setProperty("/selectionPresetsCurrent", oSelectedPreset);
		},

		/**
		 * Synchronizes the current rules selection with the current selection preset
		 * @param {Array} aSelectedRulesPlain The plain list of selected rules (same format as in the presets json file)
		 */
		syncCurrentSelectionPreset: function (aSelectedRulesPlain) {
			var oPreset = this.model.getProperty("/selectionPresetsCurrent");

			oPreset.selections = aSelectedRulesPlain;

			if (!(oPreset.isModified || oPreset.isMySelection)) {
				oPreset.isModified = true;
				oPreset.title = oPreset.title + " (*)";
			}

			this.model.setProperty("/selectionPresetsCurrent", oPreset);

			if (PresetsUtils.isPersistingAllowed) {
				PresetsUtils.persistSelectionPresets();
			}
		},

		/**
		 * Exports the given selections to a file
		 * @param {string} sTitle The title of the export
		 * @param {string} sDescription Some description of what is exported
		 * @param {array} aSelections An array of rules IDs which are selected
		 */
		exportSelectionsToFile: function (sTitle, sDescription, aSelections) {
			var oRulesToExport = {
				title: sTitle,
				description: sDescription,
				dateExported: (new Date()).toISOString(),
				version: "1.0",
				selections: aSelections
			};

			var oExportObject = JSON.stringify(oRulesToExport);

			File.save(oExportObject, constants.RULE_SELECTION_EXPORT_FILE_NAME, 'json', 'text/plain');
		},

		/**
		 * Validates if the given import is in the correct format.
		 * @param {Object} oImport The preset object to import
		 */
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
		},

		/**
		 * Persists the current selection presets in the local storage
		 */
		persistSelectionPresets: function () {
			Storage.setSelectionPresets(this.model.getProperty("/selectionPresets"));
		},

		/**
		 * Checks if the user has allowed persistence.
		 * @return {boolean} If the persistence cookie is set
		 */
		isPersistingAllowed: function () {
			return !!Storage.readPersistenceCookie(constants.COOKIE_NAME);
		}
	};

	return PresetsUtils;
});