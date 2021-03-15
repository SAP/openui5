
/*!
 * ${copyright}
 */

sap.ui.define([

], function () {
	"use strict";
	var Applier = {
		/**
		 * Applies all descriptor changes to raw manifest.
		 *
		 * @param {object} oManifest - Raw manifest provided by sap.ui.core.Component
		 * @param {Array<sap.ui.fl.Change>} aAppDescriptorChanges - Array of descriptor changes
		 * @param {object} mStrategy - Strategy for runtime or for buildtime merging
		 * @param {object} mStrategy.registry - Change handler registry
		 * @param {function} mStrategy.handleError - Error handling strategy
		 * @param {function} mStrategy.processTexts - Text postprocessing strategy
		 * @returns {Promise<object>} - Processed manifest with descriptor changes
		 */
		applyChanges: function (oManifest, aAppDescriptorChanges, mStrategy) {
			var oUpdatedManifest = Object.assign({}, oManifest);
			return mStrategy.registry()
				.then(function (Registry) {
					var aChangeHandlerPromises = aAppDescriptorChanges.map(function (oChange) {
						return Registry[oChange.getChangeType()];
					});
					return Promise.all(aChangeHandlerPromises);
				})
				.then(function (aChangeHandlers) {
					aChangeHandlers.forEach(function (oChangeHandler, iIndex) {
						try {
							var oChange = aAppDescriptorChanges[iIndex];
							oUpdatedManifest = oChangeHandler.applyChange(oUpdatedManifest, oChange);
							if (!oChangeHandler.skipPostprocessing && oChange.getTexts()) {
								oUpdatedManifest = mStrategy.processTexts(oUpdatedManifest, oChange.getTexts());
							}
						} catch (oError) {
							mStrategy.handleError(oError);
						}
					});
					return oUpdatedManifest;
				});
		}
	};

	return Applier;
}, true);