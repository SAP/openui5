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
		 * @returns {Promise} resolves when a create change is added to UI Reconstruction Map
		 */
		addToReconstructionMap: function(mUIReconstructions, oCondenserInfo) {
			var oAffectedControl = Core.byId(oCondenserInfo.affectedControl);
			var sAggregationName = oCondenserInfo.targetAggregation || oAffectedControl && oAffectedControl.sParentAggregationName;
			return CondenserUtils.getContainerElementIds(oCondenserInfo.targetContainer, sAggregationName)
				.then(function (aTargetContainerElementIds) {
					var aContainerElementIds = CondenserUtils.getInitialUIContainerElementIds(mUIReconstructions, oCondenserInfo.targetContainer, oCondenserInfo.targetAggregation, aTargetContainerElementIds);
					var iIndex = aContainerElementIds.indexOf(oCondenserInfo.affectedControl);
					// if the index is -1 the element was already removed by a different add change
					if (iIndex > -1) {
						aContainerElementIds.splice(iIndex, 1);
					}
				});
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