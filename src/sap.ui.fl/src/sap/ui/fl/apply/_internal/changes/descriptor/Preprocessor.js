
/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/descriptor/Applier",
	"sap/ui/fl/apply/_internal/changes/descriptor/ApplyStrategyFactory",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/performance/Measurement",
	"sap/ui/fl/Utils"
], function(
	Applier,
	ApplyStrategyFactory,
	FlexState,
	ManifestUtils,
	Measurement,
	Utils
) {
	"use strict";

	/**
	 * Flex hook for preprocessing manifest early. Merges descriptor changes if needed.
	 *
	 * @namespace sap.ui.fl.apply._internal.changes.descriptor.Preprocessor
	 * @since 1.74
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.apply._internal
	 */
	var Preprocessor = {
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
		preprocessManifest(oManifest, oConfig) {
			// stop processing if the component is not of the type application or component ID is missing
			if (!Utils.isApplication(oManifest, true) || !oConfig.id) {
				return Promise.resolve(oManifest);
			}

			Measurement.start("flexStateInitialize", "Initialization of flex state", ["sap.ui.fl"]);

			const oComponentData = oConfig.componentData || {};
			const sReference = ManifestUtils.getFlexReference({
				manifest: oManifest,
				componentData: oComponentData
			});

			// in case the asyncHints already mention that there is no change for the manifest, just trigger the loading
			if (!ManifestUtils.getChangeManifestFromAsyncHints(oConfig.asyncHints)) {
				FlexState.initialize({
					componentData: oComponentData,
					asyncHints: oConfig.asyncHints,
					rawManifest: oManifest,
					componentId: oConfig.id,
					reference: sReference,
					partialFlexState: true
				}).then(Measurement.end.bind(undefined, "flexStateInitialize"));

				return Promise.resolve(oManifest);
			}

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
				const oUpdatedManifest = { ...oManifest };
				const aAppDescriptorChanges = FlexState.getAppDescriptorChanges(sReference);
				return Applier.applyChanges(oUpdatedManifest, aAppDescriptorChanges, ApplyStrategyFactory.getRuntimeStrategy());
			}).then(function(oManifest) {
				Measurement.end("flexAppDescriptorMerger");
				return oManifest;
			});
		}
	};

	return Preprocessor;
});