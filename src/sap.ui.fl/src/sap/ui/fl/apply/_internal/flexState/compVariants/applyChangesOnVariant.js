/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log"
], function(
	Log
) {
	"use strict";

	var mChangeHandlers = {
		addFavorite(oVariant) {
			oVariant.setFavorite(true);
		},
		removeFavorite(oVariant) {
			oVariant.setFavorite(false);
		},
		updateVariant(oVariant, oChange) {
			var oChangeContent = oChange.getContent();
			if (oChangeContent.executeOnSelection !== undefined) {
				oVariant.setExecuteOnSelection(oChangeContent.executeOnSelection);
			}
			if (oChangeContent.favorite !== undefined) {
				oVariant.setFavorite(oChangeContent.favorite);
			}
			if (oChangeContent.contexts) {
				oVariant.setContexts(oChangeContent.contexts);
			}
			if (oChangeContent.visible !== undefined) {
				oVariant.setVisible(oChangeContent.visible);
			}

			if (oChangeContent.variantContent) {
				oVariant.setContent(oChangeContent.variantContent, /* bSkipStateChange = */ true);
			}
			var sVariantName = oChange.getText("variantName");
			if (sVariantName) {
				oVariant.setName(sVariantName, /* bSkipStateChange = */ true);
			}
		},
		standardVariant(oVariant, oChange) {
			// legacy change on standard variants
			oVariant.setExecuteOnSelection(oChange.getContent().executeOnSelect);
		}
	};

	function logNoChangeHandler(oVariant, oChange) {
		Log.error(`No change handler for change with the ID '${oChange.getId()}' and type '${oChange.getChangeType()}' defined.
			The variant '${oVariant.getId()}'was not modified'`);
	}

	return (oVariant, aChanges = []) => {
		aChanges.forEach(function(oChange) {
			var oChangeHandler = mChangeHandlers[oChange.getChangeType()] || logNoChangeHandler;
			oChangeHandler(oVariant, oChange);
		});
	};
});