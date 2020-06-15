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
		addToReconstructionMap: function(mUIReconstructions, oCondenserInfo) {
			var aSourceContainerElementIds = CondenserUtils.getContainerElementIds(oCondenserInfo.sourceContainer, oCondenserInfo.sourceAggregation);
			var aTargetContainerElementIds = CondenserUtils.getContainerElementIds(oCondenserInfo.targetContainer, oCondenserInfo.targetAggregation);

			var aContainerElementIds;
			var iTargetIndex;
			if (
				oCondenserInfo.targetContainer === oCondenserInfo.sourceContainer
				&& oCondenserInfo.targetAggregation === oCondenserInfo.sourceAggregation
			) {
				aContainerElementIds = CondenserUtils.getInitialUIContainerElementIds(mUIReconstructions, oCondenserInfo.targetContainer, oCondenserInfo.targetAggregation, aTargetContainerElementIds);
				iTargetIndex = aContainerElementIds.indexOf(oCondenserInfo.affectedControl);
				CondenserUtils.shiftElement(aContainerElementIds, iTargetIndex, oCondenserInfo.sourceIndex);
			} else {
				aContainerElementIds = CondenserUtils.getInitialUIContainerElementIds(mUIReconstructions, oCondenserInfo.targetContainer, oCondenserInfo.targetAggregation, aTargetContainerElementIds);
				iTargetIndex = aContainerElementIds.indexOf(oCondenserInfo.affectedControl);
				aContainerElementIds.splice(iTargetIndex, 1);
				aContainerElementIds = CondenserUtils.getInitialUIContainerElementIds(mUIReconstructions, oCondenserInfo.sourceContainer, oCondenserInfo.sourceAggregation, aSourceContainerElementIds);
				aContainerElementIds.splice(oCondenserInfo.sourceIndex, 0, oCondenserInfo.affectedControl);
			}
		},
		simulate: function(aContainerElements, oCondenserInfo, aInitialUIElementIds) {
			var sAffectedControlId = oCondenserInfo.affectedControl;
			var iSourceIndex = aInitialUIElementIds.indexOf(sAffectedControlId);
			CondenserUtils.extendElementsArray(aContainerElements, iSourceIndex, undefined, sAffectedControlId);
		}
	};
});