
/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/descriptor/DescriptorChangeHandlerRegistration",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils"
], function(
	DescriptorChangeHandlerRegistration,
	FlexState,
	ManifestUtils
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
		 * @param {object} oConfig - Copy of the configuration of loaded component
		 * @param {object} oConfig.asyncHints - Async hints passed from the app index to the core Component processing
		 * @param {object} oConfig.asyncHints - Component Data from the Component processing
		 * @returns {Promise<object>} - Processed manifest
		 */
		preprocessManifest: function(oManifest, oConfig) {
			var sReference = ManifestUtils.getFlexReference({
				manifest: oManifest,
				componentData: oConfig.componentData || {}
			});

			return FlexState.initialize({
				componentData: oConfig.componentData,
				asyncHints: oConfig.asyncHints,
				rawManifest: oManifest,
				componentId: oConfig.id
			}).then(function() {
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