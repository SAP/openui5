/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/write/_internal/condenser/Utils"
], function(
	CondenserUtils
) {
	"use strict";

	return {
		/**
		 * Adds a destroy change to the UI Reconstruction Map by adding the element to the container.
		 *
		 * @param {Map} mUIReconstructions - Map of UI reconstructions
		 * @param {object} oCondenserInfo - Condenser specific information
 		 * @returns {Promise} resolves when a destroy change is added to UI Reconstruction Map
		 */
		addToReconstructionMap: function(mUIReconstructions, oCondenserInfo) {
			return CondenserUtils.getContainerElementIds(oCondenserInfo.targetContainer, oCondenserInfo.targetAggregation)
				.then(function (aTargetContainerElementIds) {
					var aContainerElementIds = CondenserUtils.getInitialUIContainerElementIds(mUIReconstructions, oCondenserInfo.targetContainer, oCondenserInfo.targetAggregation, aTargetContainerElementIds);
					if (aContainerElementIds.length - 1 < oCondenserInfo.sourceIndex) {
						while (aContainerElementIds.length - 1 < oCondenserInfo.sourceIndex) {
							var iIndex = aContainerElementIds.length;
							aContainerElementIds.splice(aContainerElementIds.length, 0, CondenserUtils.PLACEHOLDER + iIndex);
						}
						aContainerElementIds[oCondenserInfo.sourceIndex] = oCondenserInfo.affectedControl;
					} else {
						aContainerElementIds.splice(oCondenserInfo.sourceIndex, 0, oCondenserInfo.affectedControl);
					}
				});
		},

		/**
		 * Simulates the destroy change by removing the element from the container.
		 *
		 * @param {string[]} aContainerElements - Array with the Ids of the current elements in the container
		 * @param {object} oCondenserInfo - Condenser specific information
		 * @param {string[]} aInitialUIElementIds - Array with the Ids of the initial elements in the container
		 */
		simulate: function(aContainerElements, oCondenserInfo, aInitialUIElementIds) {
			var iIndex = aContainerElements.indexOf(oCondenserInfo.affectedControl);
			if (iIndex === -1) {
				var sUnknown = CondenserUtils.PLACEHOLDER + aInitialUIElementIds.indexOf(oCondenserInfo.affectedControl);
				iIndex = aContainerElements.indexOf(sUnknown);
			}

			if (iIndex > -1) {
				aContainerElements.splice(iIndex, 1);
			}
		}
	};
});