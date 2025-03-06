/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/descriptor/Applier",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory"
], function(
	Applier,
	FlexObjectFactory
) {
	"use strict";

	const CHANGES_NAMESPACE = "$sap.ui.fl.changes";
	/**
	 * Gets the <code>$sap.ui.fl.changes</code> section from the Manifest and returns it converted
	 * into <code>sap.ui.fl.apply._internal.flexObjects.FlexObject</code>
	 * @param {sap.ui.core.Manifest} oManifest - Manifest provided by sap.ui.core.Component
	 * @returns {sap.ui.fl.apply._internal.flexObjects.AppDescriptorChange[]} Array of <code>sap.ui.fl.apply._internal.flexObjects.AppDescriptorChange</code>
	 */
	function getDescriptorChanges(oManifest) {
		const aAppDescriptorChangesRaw = oManifest && oManifest.getEntry && oManifest.getEntry(CHANGES_NAMESPACE) && oManifest.getEntry(CHANGES_NAMESPACE).descriptor || [];
		return aAppDescriptorChangesRaw.map(function(oChange) {
			return FlexObjectFactory.createAppDescriptorChange(oChange);
		});
	}
	const InlineApplier = {
		/**
		 * Applies inline manifest changes found in the <code>$sap.ui.fl.changes</code> section in the LOAD version of the manifest.
		 * @param {sap.ui.core.Manifest} oManifest - The manifest provided by sap.ui.core.Component.
		 * @param {object} mStrategy - The strategy for runtime or buildtime merging.
		 * @param {object} mStrategy.registry - The change handler registry.
		 * @param {function} mStrategy.handleError - The error handling strategy.
		 * @param {function} mStrategy.processTexts - The text postprocessing strategy.
		 * @returns {Promise} Resolves as soon as the changes are applied.
		 */
		applyChanges(oManifest, mStrategy) {
			const aDescriptorChanges = getDescriptorChanges(oManifest);
			const oManifestJSON = oManifest.getJson();
			delete oManifestJSON[CHANGES_NAMESPACE];
			return aDescriptorChanges.length ? Applier.applyChanges(oManifestJSON, aDescriptorChanges, mStrategy) : Promise.resolve();
		}
	};
	return InlineApplier;
});