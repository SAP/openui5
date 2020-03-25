/*!
 * ${copyright}
 */
sap.ui.define(["sap/base/util/merge"], function(merge) {
	"use strict";

	var CardMerger = {
		mergeCardDelta: function(oManifest, aChanges) {
			var oInitialManifest = merge({}, oManifest),
				sSection = oInitialManifest["sap.card"] ? "sap.card" : "sap.widget";

			aChanges.forEach(function(oChange) {
				merge(oInitialManifest[sSection], oChange.content);
			});
			return oInitialManifest;
		}
	};

	return CardMerger;
});