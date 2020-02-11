
/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/descriptor/DescriptorChangeHandlerRegistration"
], function(
	DescriptorChangeHandlerRegistration
) {
	"use strict";

	var Applier = {
		/**
		 * Applies all descriptor changes to raw manifest.
		 *
		 * @param {object} oManifest - Raw manifest provided by sap.ui.core.Component
		 * @param {Array<sap.ui.fl.Change>} aAppDescriptorChanges - array of descriptor changes
		 * @returns {object} - Processed manifest with descriptor changes
		 */
		applyChanges: function(oManifest, aAppDescriptorChanges) {
			var oUpdatedManifest = Object.assign({}, oManifest);
			aAppDescriptorChanges.forEach(function (oChange) {
				var sChangeType = oChange.getChangeType();
				var oChangeHandler = DescriptorChangeHandlerRegistration[sChangeType];
				if (oChangeHandler) {
					oUpdatedManifest = oChangeHandler.applyChange(oUpdatedManifest, oChange);
				}
			});
			return oUpdatedManifest;
		}
	};

	return Applier;
}, true);