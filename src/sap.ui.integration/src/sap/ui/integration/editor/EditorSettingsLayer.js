/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/base/util/deepClone",
	"sap/base/util/deepEqual",
	"sap/base/util/merge",
	"sap/ui/integration/Designtime",
	"./Merger",
	"./Constants"
], function (
	Localization,
	deepClone,
	deepEqual,
	merge,
	Designtime,
	Merger,
	Constants
) {
	"use strict";

	/**
	 * Settings-layer helper for the Editor control.
	 * Contains methods for filtering and merging manifest changes across layers,
	 * applying designtime defaults, and creating parameter-based designtime instances.
	 *
	 * @namespace
	 * @alias sap.ui.integration.editor.EditorSettingsLayer
	 * @static
	 * @private
	 */
	var EditorSettingsLayer = {};

	/**
	 * Filter out the manifestChanges of Child editors in the oManifestSettings
	 *
	 * @param {sap.ui.integration.editor.Editor} oEditor
	 * @param {object} oManifestSettings
	 */
	EditorSettingsLayer.filterChildManifestChanges = function (oEditor, oManifestSettings) {
		if (oEditor._bChildManifestChangesFiltered) {
			return;
		}
		oEditor._aMainEditorChanges = deepClone(oManifestSettings.manifestChanges, 500);
		oEditor._oChildEditorChanges = {};
		var processObject = function(obj, parentKey) {
			parentKey = parentKey ? (parentKey + "/") : "";
			Object.keys(obj).forEach(function(sKey) {
				if (sKey.startsWith(oEditor.getConfigurationPath() + "/childCards/") && sKey.endsWith("_manifestChanges")) {
					var sRest = sKey.substring("/sap.card/configuration/childCards/".length);
					var sChildEditorName = sRest.split("/")[0];
					if (sChildEditorName) {
						var sChildEditorPath = parentKey + sChildEditorName;
						oEditor._oChildEditorChanges[sChildEditorPath] = oEditor._oChildEditorChanges[sChildEditorPath] || [];
						oEditor._oChildEditorChanges[sChildEditorPath].push(obj[sKey]);
						if (obj[sKey] !== null) {
							processObject(obj[sKey], sChildEditorPath);
						}
					}
				}
			});
		};

		// first process child changes
		//   - move all the /sap.card/configuration/childCards/.../_manifestChanges to oChildChanges
		oEditor._aMainEditorChanges.forEach(function(oChange) {
			processObject(oChange);
		});

		// clean up child changes
		//  - remove all /sap.card/configuration/childCards/.../_manifestChanges
		Object.keys(oEditor._oChildEditorChanges).forEach(function(sKey) {
			oEditor._oChildEditorChanges[sKey].forEach(function(oChange) {
				Object.keys(oChange).forEach(function(sKey1) {
					if (sKey1.startsWith(oEditor.getConfigurationPath() + "/childCards/") && sKey1.endsWith("_manifestChanges")) {
						delete oChange[sKey1];
					}
				});
			});
		});

		// clean up main changes
		//  - remove all /sap.card/configuration/childCards/.../_manifestChanges
		oEditor._aMainEditorChanges.forEach(function(oChange) {
			Object.keys(oChange).forEach(function(sKey1) {
				if (sKey1.startsWith(oEditor.getConfigurationPath() + "/childCards/") && sKey1.endsWith("_manifestChanges")) {
					delete oChange[sKey1];
				}
			});
		});

		oEditor._bChildManifestChangesFiltered = true;
	};

	/**
	 * Filters the manifestChanges array in the oManifestSettings.
	 * All changes that are done for layers > than current layer are removed (see also layers).
	 * The changes of current layer will be stored in oEditor._oCurrentLayerChange to be applied later.
	 * All changes that are done for layers < the current layer are kept in oManifestSettings.manifestChanges.
	 *
	 * @param {sap.ui.integration.editor.Editor} oEditor
	 * @param {object} oManifestSettings
	 */
	EditorSettingsLayer.filterManifestChangesByLayer = function (oEditor, oManifestSettings, sLanguage) {
		var aChanges = [],
			oBeforeLayerChange = {},
			oCurrentLayerChange = { ":layer": Merger.layers[oEditor.getMode()] },
			iCurrentModeIndex = Merger.layers[oEditor.getMode()];
		oManifestSettings.manifestChanges.forEach(function (oChange) {
			//filter manifest changes. only the changes before the current layer are needed
			//editor will merge the last layer locally to allow "reset" or properties
			//also for translation layer, the "original" value is needed
			var iLayer = oChange.hasOwnProperty(":layer") ? oChange[":layer"] : 1000;
			if (iLayer === Merger.layers[Constants.EDITOR_MODE.TRANSLATION]) {
				if (sLanguage === "") {
					sLanguage = Localization.getLanguage().replaceAll('_', '-');
				}
				var oTranslationChange = {
					"texts": {}
				};
				// delete the error texts property
				delete oChange.texts;
				oTranslationChange.texts[sLanguage] = {};
				Object.keys(oChange).forEach(function (s) {
					if (s.charAt(0) === "/") {
						oTranslationChange.texts[sLanguage][s] = oChange[s];
					} else {
						oTranslationChange[s] = oChange[s];
					}
				});
				oChange = oTranslationChange;
			}
			if (iLayer < iCurrentModeIndex) {
				aChanges.push(oChange);
				oBeforeLayerChange = merge(oBeforeLayerChange, oChange);
			} else if (iLayer === iCurrentModeIndex) {
				//store the current layer changes locally for later processing
				oCurrentLayerChange = oChange;
			}
		});
		oManifestSettings.manifestChanges = aChanges;
		oEditor._oCurrentLayerChange = oCurrentLayerChange;
		oEditor._oBeforeLayerChange = oBeforeLayerChange;
	};

	/**
	 * Applies the defaults for the designtime settings
	 *
	 * @param {sap.ui.integration.editor.Editor} oEditor
	 * @param {object} oSettings
	 */
	EditorSettingsLayer.applyDesigntimeDefaults = function (oEditor, oSettings) {
		oSettings = oSettings || {};
		oSettings.form = oSettings.form || {};
		oSettings.form.items = oSettings.form.items || {};
		var mItems = oSettings.form.items;
		for (var n in mItems) {
			var oItem = mItems[n];
			// do not apply default values for destination
			if (oItem.type === "destination") {
				continue;
			}
			if (oItem.manifestpath) {
				oItem.value = oEditor._oManifestModel.getProperty(oItem.manifestpath);
			}
			if (oItem.visible === undefined || oItem.visible === null) {
				oItem.visible = true;
			}
			if (oItem.editable === undefined || oItem.editable === null) {
				oItem.editable = true;
			}
			if (oEditor.getMode() !== Constants.EDITOR_MODE.ADMIN) {
				if (oItem.visibleToUser !== undefined) {
					oItem.visible = oItem.visibleToUser;
				}
				if (oItem.editableToUser !== undefined) {
					oItem.editable = oItem.editableToUser;
				}
			}
			if (typeof oItem.translatable !== "boolean") {
				oItem.translatable = false;
			}
			if (!oItem.label) {
				oItem.label = n;
			}

			if (!oItem.type || oItem.type === "enum") {
				oItem.type = "string";
			}
			//only if the value is undefined from the oEditor._oManifestModel.getProperty(oItem.manifestpath)
			//false, "", 0... are valid values and should not apply the default
			if (oItem.value === undefined || oItem.value === null) {
				switch (oItem.type) {
					case "boolean": oItem.value = false; break;
					case "integer":
					case "number": oItem.value = 0; break;
					case "string[]": oItem.value = []; break;
					case "object": oItem.value = undefined; break;
					case "object[]": oItem.value = undefined; break;
					default: oItem.value = "";
				}
			}
			if (oItem.type === "group") {
				if (oItem.visible === undefined || oItem.value === null) {
					oItem.visible = true;
				}
			}
			oItem._settingspath = "/form/items/" + n;
		}
	};

	/**
	 * Applies previous layer designtime settings that were changed
	 *
	 * @param {sap.ui.integration.editor.Editor} oEditor
	 */
	EditorSettingsLayer.applyDesigntimeLayers = function (oEditor) {
		var oTexts = {};
		var oDesigntime = {};
		//pull current values
		if (oEditor._aAppliedLayerChanges && Array.isArray(oEditor._aAppliedLayerChanges)) {
			for (var i = 0; i < oEditor._aAppliedLayerChanges.length; i++) {
				var oChanges = oEditor._aAppliedLayerChanges[i][":designtime"];
				if (oChanges) {
					var aKeys = Object.keys(oChanges);
					for (var j = 0; j < aKeys.length; j++) {
						var sPath = aKeys[j],
							vValue = oChanges[sPath];
						if (!sPath.endsWith("/pageAdminValues") && typeof vValue === "object") {
							// if vValue is a object type and not from pageAdminValues
							if (vValue.configuration && vValue.configuration.parameterFromDestination) {
								//if it is a parameter transformed from destination, add it into form/items as new parameter for this layer
								var oNewParameterConfig = vValue.configuration;
								delete oNewParameterConfig.parameterFromDestination;
								oNewParameterConfig.value = oEditor._oManifestModel.getProperty(oNewParameterConfig.manifestpath);
								oNewParameterConfig._settingspath = "/form/items/" + vValue.parameter;
								oEditor._oSettingsModel.setProperty(oNewParameterConfig._settingspath, oNewParameterConfig);
							} else {
								// else it should for the object field/object list field
								// add it into designtime of settings
								oDesigntime[aKeys[j]] = merge(oDesigntime[aKeys[j]], vValue);
								continue;
							}
						} else {
							oEditor._oSettingsModel.setProperty(aKeys[j], vValue);
						}
					}
				}
				var oAppliedLayerManifestChangeTexts = oEditor._aAppliedLayerChanges[i]["texts"];
				if (oAppliedLayerManifestChangeTexts) {
					oTexts = merge(oTexts, oAppliedLayerManifestChangeTexts);
				}
			}
		}
		if (oEditor._oCurrentLayerChange) {
			var oChanges = oEditor._oCurrentLayerChange[":designtime"];
			if (oChanges) {
				var aKeys = Object.keys(oChanges);
				for (var j = 0; j < aKeys.length; j++) {
					//apply the values to a "_next/editable", "_next/visible" entry to the settings.
					//the current layer needs to be able to change those values
					var sPath = aKeys[j],
						vValue = oChanges[sPath],
						sNext = sPath.substring(0, sPath.lastIndexOf("/") + 1) + "_next",
						sProp = sPath.substring(sPath.lastIndexOf("/") + 1);
					if (!sPath.endsWith("/pageAdminValues") && typeof vValue === "object") {
						// if the value of design time is object type and not from pageAdminValues or a parameter transformed from destination, it should for the object field/object list field
						// add it into designtime of settings, else add it into _next property
						if (!vValue.configuration || !vValue.configuration.parameterFromDestination) {
							oDesigntime[sPath] = merge(oDesigntime[sPath], vValue);
							continue;
						}
					}
					if (!oEditor._oSettingsModel.getProperty(sNext)) {
						//create a _next entry if it does not exist
						oEditor._oSettingsModel.setProperty(sNext, {});
					}
					oEditor._oSettingsModel.setProperty(sNext + "/" + sProp, vValue);
				}
			}
			var ocurrentLayerManifestChangeTexts = oEditor._oCurrentLayerChange["texts"];
			if (ocurrentLayerManifestChangeTexts) {
				oTexts = merge(oTexts, ocurrentLayerManifestChangeTexts);
			}
		}
		if (!deepEqual(oTexts, {})) {
			oEditor._oSettingsModel.setProperty("/texts", oTexts);
		}
		if (!deepEqual(oDesigntime, {})) {
			oEditor._oSettingsModel.setProperty("/:designtime", oDesigntime);
		}
	};

	/**
	 * Creates a designtime instance based on a configuration section within the manifest.
	 * This is valid if there is no explicit sap.card/designtime module in the manifest itself.
	 *
	 * @param {sap.ui.integration.editor.Editor} oEditor
	 * @param {object} oConfiguration
	 * @returns {sap.ui.integration.Designtime}
	 */
	EditorSettingsLayer.createParameterDesigntime = function (oEditor, oConfiguration) {
		var oSettings = {},
			sBasePath = oEditor.getConfigurationPath() + "/parameters",
			sMode = oEditor.getMode();
		if (oConfiguration && oConfiguration.parameters) {
			oSettings.form = oSettings.form || {};
			oSettings.form.items = oSettings.form.items || {};
			var oItems = oSettings.form.items;
			Object.keys(oConfiguration.parameters).forEach(function (n) {
				oItems[n] = merge({
					manifestpath: sBasePath + "/" + n + "/value",
					editable: (sMode !== Constants.EDITOR_MODE.TRANSLATION),
					_settingspath: "/form/items/" + n
				}, oConfiguration.parameters[n]);
				var oItem = oItems[n];
				if (!oItem.type) {
					oItem.type = "string";
				}
				if (!oItem.hasOwnProperty("visible")) {
					oItem.visible = true;
				}
			});
		}
		return new Designtime(oSettings);
	};

	return EditorSettingsLayer;

});
