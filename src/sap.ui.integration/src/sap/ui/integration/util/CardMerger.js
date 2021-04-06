/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Core",
	"sap/base/util/deepClone"
], function (
	merge,
	JSONModel,
	Core,
	deepClone
) {
	"use strict";

	var CardMerger = {
		layers: { "admin": 0, "content": 5, "translation": 10, "all": 20 },
		mergeManifestPathChanges: function (oModel, oChange) {
			/* hide multi language function since there has a translation issue in Portal
			var sLanguage =  Core.getConfiguration().getLanguage().replaceAll('-', '_');
			*/
			Object.keys(oChange).forEach(function (s) {
				if (s.charAt(0) === "/") {
					var value = oChange[s];
					/* hide multi language function since there has a translation issue in Portal
					if (s.endsWith("/valueTranslations")) {
						//merge the valueTranslations with existing one
						var aValueTranslations = oModel.getProperty(s);
						if (aValueTranslations) {
							//clone the exist value translations list since sometimes it is readonly
							var aValueTranslationsUpdated = deepClone(aValueTranslations);
							value = merge(aValueTranslationsUpdated, value);
						}
						//update the value property via current language in Core
						if (sLanguage in value) {
							var sPath = s.substring(0, s.lastIndexOf("/")) + "/value";
							oModel.setProperty(sPath, value[sLanguage]);
						}
					}*/
					oModel.setProperty(s, value);
				}
			});
		},
		mergeCardDelta: function (oManifest, aChanges) {
			var oInitialManifest = merge({}, oManifest),
				sSection = "sap.card";
			if (Array.isArray(aChanges) && aChanges.length > 0) {
				var oModel;
				aChanges.forEach(function (oChange) {
					if (oChange.content) {
						//merge old changes
						merge(oInitialManifest[sSection], oChange.content);
					} else {
						//merge path based changes via model
						oModel = oModel || new JSONModel(oInitialManifest);
						CardMerger.mergeManifestPathChanges(oModel, oChange);
					}
				});

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
		}
	};

	return CardMerger;
});