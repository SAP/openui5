/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/fl/write/_internal/condenser/Utils"
], function(
	Element,
	CondenserUtils
) {
	"use strict";

	return {
		/**
		 * Adds a create change to the UI Reconstruction Map by removing the element from the container.
		 *
		 * @param {Map} mUIReconstructions - Map of UI reconstructions
		 * @param {object} oCondenserInfo - Condenser specific information
		 * @returns {Promise} resolves when a create change is added to UI Reconstruction Map
		 */
		async addToReconstructionMap(mUIReconstructions, oCondenserInfo) {
			const oAffectedControl = Element.getElementById(oCondenserInfo.affectedControl);
			const sAggregationName = oCondenserInfo.targetAggregation || oAffectedControl && oAffectedControl.sParentAggregationName;
			const aTargetContainerElementIds = await CondenserUtils.getContainerElementIds(
				oCondenserInfo.targetContainer, sAggregationName,
				oCondenserInfo.customAggregation, oCondenserInfo.affectedControlIdProperty
			);
			const aContainerElementIds = CondenserUtils.getInitialUIContainerElementIds(
				mUIReconstructions, oCondenserInfo.targetContainer, oCondenserInfo.targetAggregation, aTargetContainerElementIds
			);
			const iIndex = aContainerElementIds.indexOf(oCondenserInfo.affectedControl);
			// if the index is -1 the element was already removed by a different add change
			if (iIndex > -1) {
				aContainerElementIds.splice(iIndex, 1);
			}
		},

		/**
		 * Simulates the create change by adding the element at the correct index.
		 *
		 * @param {string[]} aContainerElements - Array with the Ids of the current elements in the container
		 * @param {object} oCondenserInfo - Condenser specific information
		 */
		simulate(aContainerElements, oCondenserInfo) {
			aContainerElements.splice(oCondenserInfo.getTargetIndex(oCondenserInfo.change), 0, oCondenserInfo.affectedControl);
		}
	};
});