
/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/isEmptyObject",
	"sap/ui/fl/apply/_internal/changes/Utils"
], function(
	isEmptyObject,
	Utils
) {
	"use strict";

	const Applier = {
		/**
		 * Applies all descriptor changes to raw manifest.
		 *
		 * @param {object} oUpdatedManifest - Raw manifest provided by sap.ui.core.Component
		 * @param {Array<sap.ui.fl.apply._internal.flexObjects.AppDescriptorChange>} aAppDescriptorChanges - Array of descriptor changes
		 * @param {object} mStrategy - Strategy for runtime or for buildtime merging
		 * @param {object} mStrategy.registry - Change handler registry
		 * @param {function} mStrategy.handleError - Error handling strategy
		 * @param {function} mStrategy.processTexts - Text postprocessing strategy
		 * @returns {Promise<object>} - Processed manifest with descriptor changes
		 */
		async applyChanges(oUpdatedManifest, aAppDescriptorChanges, mStrategy) {
			const aChangeHandlers = [];
			for (const oAppDescriptorChange of aAppDescriptorChanges) {
				aChangeHandlers.push(await Utils.getChangeHandler({
					flexObject: oAppDescriptorChange,
					strategy: mStrategy
				}));
			}
			aChangeHandlers.forEach(function(oChangeHandler, iIndex) {
				try {
					const oChange = aAppDescriptorChanges[iIndex];
					oUpdatedManifest = oChangeHandler.applyChange(oUpdatedManifest, oChange);
					if (!oChangeHandler.skipPostprocessing && !isEmptyObject(oChange.getTexts())) {
						oUpdatedManifest = mStrategy.processTexts(oUpdatedManifest, oChange.getTexts());
					}
				} catch (oError) {
					mStrategy.handleError(oError);
				}
			});
			return oUpdatedManifest;
		}
	};

	return Applier;
});