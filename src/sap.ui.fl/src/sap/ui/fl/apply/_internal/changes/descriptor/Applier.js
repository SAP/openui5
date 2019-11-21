
/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/descriptor/DescriptorChangeHandlerRegistration",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/Cache"
], function(
	DescriptorChangeHandlerRegistration,
	FlexState,
	Cache
) {
	"use strict";

	/**
	 * Flex hook for preprocessing manifest early. Merges descriptor changes if needed.
	 *
	 * @namespace sap.ui.fl.apply._internal.changes.descriptor.Applier
	 * @experimental
	 * @since 1.74
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.apply._internal
	 */
	var Applier = {

		/**
		 * Preprocesses the manifest by applying descriptor changes.
		 *
		 * @param {object} oManifest - Raw manifest provided by core Component
		 * @returns {Promise<object>} - Processed manifest
		 */
		preprocessManifest: function(oManifest) {
			var mComponent = { name: oManifest["sap.app"].id, appVersion: oManifest["sap.app"].applicationVersion.version };
			var sReference = mComponent.name;

			// TODO: Temporarily call Cache until FlexState.init method is moved to correct new place
			return Cache.getChangesFillingCache(mComponent)
				.then(function() {
					var aAppDescriptorChanges = FlexState.getAppDescriptorChanges(sReference);
					var oUpdatedManifest = Object.assign({}, oManifest);
					aAppDescriptorChanges.forEach(function (oChange) {
						var sChangeType = oChange.getChangeType();
						var oChangeHandler = DescriptorChangeHandlerRegistration[sChangeType];
						if (oChangeHandler) {
							oUpdatedManifest = oChangeHandler.applyChange(oUpdatedManifest, oChange);
						}
					});
					return oUpdatedManifest;
				});
		}
	};
	return Applier;
}, true);