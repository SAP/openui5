/*!
 * ${copyright}
 */
sap.ui.define(["sap/base/util/merge", "sap/ui/model/json/JSONModel"], function (merge, JSONModel) {
	"use strict";

	var CardMerger = {
		layers: { "admin": 0, "content": 5, "translation": 10, "all": 20 },
		mergeManifestPathChanges: function (oModel, oChange) {
			Object.keys(oChange).forEach(function (s) {
				if (s.charAt(0) === "/") {
					oModel.setProperty(s, oChange[s]);
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