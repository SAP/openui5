
/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/descriptor/DescriptorChangeHandlerRegistration",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/performance/Measurement",
	"sap/ui/fl/Utils"
], function(
	DescriptorChangeHandlerRegistration,
	FlexState,
	ManifestUtils,
	Measurement,
	Utils
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
		 * The processing is only done for components of the type "application".
		 *
		 * @param {object} oManifest - Raw manifest provided by core Component
		 * @param {object} oConfig - Copy of the configuration of loaded component
		 * @param {object} oConfig.asyncHints - Async hints passed from the app index to the core Component processing
		 * @param {object} oConfig.componentData - Component Data from the Component processing
		 * @returns {Promise<object>} - Processed manifest
		 */
		preprocessManifest: function(oManifest, oConfig) {
			// Measurement for the whole flex processing until the VariantModel is attached to the component; this does not include actual CodeExt or UI change applying
			Measurement.start("flexProcessing", "Complete flex processing", ["sap.ui.fl"]);

			// stop processing if the component is not of the type application or component ID is missing
			if (!Utils.isApplication(oManifest, true) || !oConfig.id) {
				return Promise.resolve(oManifest);
			}

			Measurement.start("flexStateInitialize", "Initialization of flex state", ["sap.ui.fl"]);

			var oComponentData = oConfig.componentData || {};
			var sReference = ManifestUtils.getFlexReference({
				manifest: oManifest,
				componentData: oComponentData
			});

			return FlexState.initialize({
				componentData: oComponentData,
				asyncHints: oConfig.asyncHints,
				rawManifest: oManifest,
				componentId: oConfig.id,
				reference: sReference,
				partialFlexState: true
			}).then(function() {
				Measurement.end("flexStateInitialize");
				Measurement.start("flexAppDescriptorMerger", "Client side app descriptor merger", ["sap.ui.fl"]);

				var aAppDescriptorChanges = FlexState.getAppDescriptorChanges(sReference);
				var oUpdatedManifest = Object.assign({}, oManifest);
				aAppDescriptorChanges.forEach(function (oChange) {
					var sChangeType = oChange.getChangeType();
					var oChangeHandler = DescriptorChangeHandlerRegistration[sChangeType];
					if (oChangeHandler) {
						oUpdatedManifest = oChangeHandler.applyChange(oUpdatedManifest, oChange);
					}
				});
				Measurement.end("flexAppDescriptorMerger");
				return oUpdatedManifest;
			});
		}
	};

	return Applier;
}, true);