/*!
 * ${copyright}
 */

sap.ui.define([], function() {
	"use strict";

	// TODO: move to an api-folder for external consumption

	/**
	 * Available scenarios
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl
	 *
	 * @enum {string}
	 */
	return {
		AppVariant: "APP_VARIANT",
		VersionedAppVariant: "VERSIONED_APP_VARIANT",
		AdaptationProject: "ADAPTATION_PROJECT",
		FioriElementsFromScratch: "FE_FROM_SCRATCH",
		UiAdaptation: "UI_ADAPTATION"
	};
});
