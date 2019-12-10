
/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/descriptor/DescriptorChangeHandlerRegistration",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/performance/Measurement",
	"sap/base/util/UriParameters"
], function(
	DescriptorChangeHandlerRegistration,
	FlexState,
	ManifestUtils,
	Measurement,
	UriParameters
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
		 * @param {object} oConfig.componentData - Component Data from the Component processing
		 * @returns {Promise<object>} - Processed manifest
		 */
		preprocessManifest: function(oManifest, oConfig) {
			// Measurement for the whole flex processing until the VariantModel is attached to the component; this does not include actual CodeExt or UI change applying
			Measurement.start("flexProcessing", "Complete flex processing", ["sap.ui.fl"]);
			Measurement.start("flexStateInitialize", "Initialization of flex state", ["sap.ui.fl"]);

			var sReference = ManifestUtils.getFlexReference({
				manifest: oManifest,
				componentData: oConfig.componentData || {}
			});

			// toggle client side appdescriptor change merger with url parameter sap-ui-xx-appdescriptor-merger=true
			// TODO: remove after performance testing is done
			var oUriParameters = new UriParameters(window.location.href);
			var sClientSideMergerEnabled = oUriParameters.get("sap-ui-xx-appdescriptor-merger");
			if (!sClientSideMergerEnabled) {
				return Promise.resolve(oManifest);
			}

			return FlexState.initialize({
				componentData: oConfig.componentData,
				asyncHints: oConfig.asyncHints,
				rawManifest: oManifest,
				componentId: oConfig.id,
				reference: sReference
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