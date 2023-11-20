
/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/isEmptyObject",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory"
], function(
	isEmptyObject,
	FlexObjectFactory
) {
	"use strict";

	var CHANGES_NAMESPACE = "$sap.ui.fl.changes";

	/**
	 * Gets the <code>$sap.ui.fl.changes</code> section from the Manifest and returns it converted into <code>sap.ui.fl.apply._internal.flexObjects.FlexObject</code>
	 * @param {sap.ui.core.Manifest} oManifest - Manifest provided by sap.ui.core.Component
	 * @returns {sap.ui.fl.apply._internal.flexObjects.AppDescriptorChange[]} Array of <code>sap.ui.fl.apply._internal.flexObjects.AppDescriptorChange</code>
	 */
	function getDescriptorChanges(oManifest) {
		var aAppDescriptorChangesRaw = oManifest && oManifest.getEntry && oManifest.getEntry(CHANGES_NAMESPACE) && oManifest.getEntry(CHANGES_NAMESPACE).descriptor || [];
		return aAppDescriptorChangesRaw.map(function(oChange) {
			return FlexObjectFactory.createAppDescriptorChange(oChange);
		});
	}

	var Applier = {
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
		applyChanges(oUpdatedManifest, aAppDescriptorChanges, mStrategy) {
			return mStrategy.registry()
			.then(function(Registry) {
				var aChangeHandlerPromises = aAppDescriptorChanges.map(function(oChange) {
					return Registry[oChange.getChangeType()] && Registry[oChange.getChangeType()]();
				});
				return Promise.all(aChangeHandlerPromises);
			})
			.then(function(aChangeHandlers) {
				aChangeHandlers.forEach(function(oChangeHandler, iIndex) {
					try {
						var oChange = aAppDescriptorChanges[iIndex];
						oUpdatedManifest = oChangeHandler.applyChange(oUpdatedManifest, oChange);
						if (!oChangeHandler.skipPostprocessing && !isEmptyObject(oChange.getTexts())) {
							oUpdatedManifest = mStrategy.processTexts(oUpdatedManifest, oChange.getTexts());
						}
					} catch (oError) {
						mStrategy.handleError(oError);
					}
				});
				return oUpdatedManifest;
			});
		},

		/**
		 * Applies descriptor changes that can be found in the manifest under the section <code>$sap.ui.fl.changes</code>.
		 * @param {sap.ui.core.Manifest} oManifest - Manifest provided by sap.ui.core.Component
		 * @param {object} mStrategy - Strategy for runtime or for buildtime merging
		 * @param {object} mStrategy.registry - Change handler registry
		 * @param {function} mStrategy.handleError - Error handling strategy
		 * @param {function} mStrategy.processTexts - Text postprocessing strategy
		 * @returns {Promise} Resolves as soon as the changes are applied
		 */
		applyChangesIncludedInManifest(oManifest, mStrategy) {
			var aDescriptorChanges = getDescriptorChanges(oManifest);
			var oManifestJSON = oManifest.getJson();
			delete oManifestJSON[CHANGES_NAMESPACE];

			if (aDescriptorChanges.length > 0) {
				return this.applyChanges(oManifestJSON, aDescriptorChanges, mStrategy).then(function() {
					return;
				});
			}
			return Promise.resolve();
		}
	};

	return Applier;
});