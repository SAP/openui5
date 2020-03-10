/*!
 * ${copyright}
 */
sap.ui.define(["sap/base/util/merge"], function(merge) {
	"use strict";

	var CardMerger = {
		mergeCardDelta: function(oManifest, aChanges) {
			var oInitialManifest = merge({}, oManifest);
			aChanges.forEach(function(oChange) {
				var oManifestDelta = {
					"sap.card": oChange.content
				};
				merge(oInitialManifest, oManifestDelta);
			});
			return oInitialManifest;
		}
	};

	return CardMerger;
});