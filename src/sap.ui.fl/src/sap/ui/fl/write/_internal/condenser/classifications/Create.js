/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/fl/write/_internal/condenser/Utils"
], function(
	Core,
	CondenserUtils
) {
	"use strict";

	return {
		/**
		 * Adds a create change to the UI Reconstruction Map by removing the element from the container.
		 *
		 * @param {Map} mUIReconstructions - Map of UI reconstructions
		 * @param {object} oCondenserInfo - Condenser specific information
		 */
		addToReconstructionMap: function(mUIReconstructions, oCondenserInfo) {
			var oAffectedControl = Core.byId(oCondenserInfo.affectedControl);
			var sAggregationName = oAffectedControl && oAffectedControl.sParentAggregationName || oCondenserInfo.targetAggregation;
			var aTargetContainerElementIds = CondenserUtils.getContainerElementIds(oCondenserInfo.targetContainer, sAggregationName);
			var aContainerElementIds = CondenserUtils.getInitialUIContainerElementIds(mUIReconstructions, oCondenserInfo.targetContainer, oCondenserInfo.targetAggregation, aTargetContainerElementIds);
			var iIndex = aContainerElementIds.indexOf(oCondenserInfo.affectedControl);

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
		simulate: function(aContainerElements, oCondenserInfo) {
			aContainerElements.splice(oCondenserInfo.getTargetIndex(oCondenserInfo.change), 0, oCondenserInfo.affectedControl);
		}
	};
});