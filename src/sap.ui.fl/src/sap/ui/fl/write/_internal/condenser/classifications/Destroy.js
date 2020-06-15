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
			var aTargetContainerElementIds = CondenserUtils.getContainerElementIds(oCondenserInfo.targetContainer, oCondenserInfo.targetAggregation);
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
		},
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