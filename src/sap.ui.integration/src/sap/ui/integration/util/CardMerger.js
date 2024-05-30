/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/model/json/JSONModel",
	"sap/base/util/deepClone",
	"sap/ui/integration/util/Utils"
], function (
	merge,
	JSONModel,
	deepClone,
	Utils
) {
	"use strict";

	var CardMerger = {
		layers: { "admin": 0, "content": 5, "translation": 10, "all": 20 },
		mergeManifestPathChanges: function (oModel, oChange) {
			Object.keys(oChange).forEach(function (s) {
				if (s.charAt(0) === "/") {
					var value = oChange[s];
					oModel.setProperty(s, value);
				}
			});
		},
		mergeTextsChanges: function (oModel, oTexts, oDesigntime) {
			var sLanguage =  Utils._language;
			if (oTexts && oTexts.hasOwnProperty(sLanguage)) {
				var oTranslation = oTexts[sLanguage];
				for (var sManifestPath in oTranslation) {
					var oTranslations = oTranslation[sManifestPath];
					// if the translation value type is object, translate it
					if (typeof oTranslations === "object") {
						CardMerger.translateObject(oModel, sManifestPath, oTranslations, oDesigntime);
					} else {
						var sCurrentValue = oModel.getProperty(sManifestPath);
						// only if the current value is a dynamic value string, do not translate it
						var bTranslate = true;
						if (sCurrentValue && typeof sCurrentValue === "string" && (sCurrentValue.indexOf("{context>") === 0 || sCurrentValue.indexOf("{{parameters") === 0)) {
							bTranslate = false;
						}
						if (bTranslate) {
							oModel.setProperty(sManifestPath, oTranslations);
						}
					}
				}
			}
		},
		mergeCardDelta: function (oManifest, aChanges, sSection) {
			var oInitialManifest = merge({}, oManifest);
			if (typeof sSection === "undefined") {
				sSection = "sap.card";
			}
			if (Array.isArray(aChanges) && aChanges.length > 0) {
				var oModel, oTexts, oDesigntime;
				//map translations of unmatch languages
				Utils.mapLanguagesInManifestChanges(aChanges);
				aChanges.forEach(function (oChange) {
					if (oChange.content) {
						//merge old changes
						merge(oInitialManifest[sSection], oChange.content);
					} else {
						var iLayer = oChange.hasOwnProperty(":layer") ? oChange[":layer"] : 1000;
						// for changes from translation layer, we use them as the translations of current languages
						if (iLayer === CardMerger.layers["translation"]) {
							var sLanguage = Utils._language;
							var oTranslationChange = {
								"texts": {}
							};
							oTranslationChange.texts[sLanguage] = {};
							delete oChange.texts;
							Object.keys(oChange).forEach(function (s) {
								if (s.charAt(0) === "/") {
									oTranslationChange.texts[sLanguage][s] = oChange[s];
								} else {
									oTranslationChange[s] = oChange[s];
								}
							});
							oChange = oTranslationChange;
						}
						oTexts = merge(oTexts, oChange.texts);
						oDesigntime = merge(oDesigntime, oChange[":designtime"]);
						//merge path based changes via model
						oModel = oModel || new JSONModel(oInitialManifest);
						CardMerger.mergeManifestPathChanges(oModel, oChange);
					}
				});
				CardMerger.mergeTextsChanges(oModel, oTexts, oDesigntime);
			}
			return oInitialManifest;
		},
		mergeCardDesigntimeMetadata: function (oDesigntimeMetadata, aChanges) {
			var oInitialDTMedatada = merge({}, oDesigntimeMetadata);

			aChanges.forEach(function (oChange) {
				var aInlineChanges = oChange.content.entityPropertyChange || [];

				aInlineChanges.forEach(function (oInlineChange) {
					var sPropertyPath = oInlineChange.propertyPath;
					switch (oInlineChange.operation) {
						case "UPDATE":
							if (oInitialDTMedatada.hasOwnProperty(sPropertyPath)) {
								oInitialDTMedatada[sPropertyPath] = oInlineChange.propertyValue;
							}
							break;
						case "DELETE":
							delete oInitialDTMedatada[sPropertyPath];
							break;
						case "INSERT":
							if (!oInitialDTMedatada.hasOwnProperty(sPropertyPath)) {
								oInitialDTMedatada[sPropertyPath] = oInlineChange.propertyValue;
							}
							break;
						default:
							break;
					}
				});
			});

			return oInitialDTMedatada;
		},
		translateObject: function (oModel, sManifestPath, oTranslations, oDesigntime) {
			var oValue = oModel.getProperty(sManifestPath);
			if (!oValue || typeof oValue !== "object") {
				return;
			}
			oValue = deepClone(oValue, 500);
			if (!Array.isArray(oValue)) {
				var sUUID = (oValue._dt || {})._uuid;
				if (sUUID && oTranslations[sUUID]) {
					// if the property is not translatable set in designtime, do not translation it by deleting the value in texts
					if (oDesigntime && oDesigntime[sManifestPath] && oDesigntime[sManifestPath][sUUID]) {
						for (var n in oDesigntime[sManifestPath][sUUID]) {
							if (oDesigntime[sManifestPath][sUUID][n].translatable === false) {
								delete oTranslations[sUUID][n];
							}
						}
					}
					merge(oValue, oTranslations[sUUID]);
					oModel.setProperty(sManifestPath, oValue);
				}
			} else {
				oValue.forEach(function (oOriginValue) {
					var sUUID = (oOriginValue._dt || {})._uuid;
					if (sUUID && oTranslations[sUUID]) {
						// if the property is not translatable set in designtime, do not translation it by deleting the value in texts
						if (oDesigntime && oDesigntime[sManifestPath] && oDesigntime[sManifestPath][sUUID]) {
							for (var n in oDesigntime[sManifestPath][sUUID]) {
								if (oDesigntime[sManifestPath][sUUID][n].translatable === false) {
									delete oTranslations[sUUID][n];
								}
							}
						}
						merge(oOriginValue, oTranslations[sUUID]);
					}
				});
				oModel.setProperty(sManifestPath, oValue);
				return;
			}
		}
	};

	return CardMerger;
});