/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/fl/Utils"
], function(
	Core,
	Utils
) {
	"use strict";

	function getAssociatedControlId(aAssociatedControlIds, oControl) {
		if (!oControl) {
			return undefined;
		}

		if (aAssociatedControlIds.indexOf(oControl.getId()) > -1) {
			return oControl.getId();
		}
		return getAssociatedControlId(aAssociatedControlIds, oControl.getParent());
	}

	function getVariantManagementControlIds(oControl, bUseStaticArea) {
		var oAppComponent = Utils.getAppComponentForControl(oControl);
		var oRootControl = oAppComponent.getRootControl();
		var aVMControls = [];
		if (!bUseStaticArea && oRootControl.getDomRef()) {
			aVMControls = Array.from(oRootControl.getDomRef().querySelectorAll(".sapUiFlVarMngmt"));
		}
		if (bUseStaticArea || aVMControls.length === 0) {
			aVMControls = Array.from(Core.getStaticAreaRef().querySelectorAll(".sapUiFlVarMngmt"));
		}
		return aVMControls.map(function (oVariantManagementNode) {
			return oVariantManagementNode.id;
		});
	}

	var VariantsApplyUtil = {
		DEFAULT_AUTHOR: "SAP",

		VARIANT_TECHNICAL_PARAMETER: "sap-ui-fl-control-variant-id",

		compareVariants: function(oVariant1, oVariant2) {
			if (oVariant1.getName().toLowerCase() < oVariant2.getName().toLowerCase()) {
				return -1;
			} else if (oVariant1.getName().toLowerCase() > oVariant2.getName().toLowerCase()) {
				return 1;
			}
			return 0;
		},

		getIndexToSortVariant: function (aVariants, oVariantEntry) {
			var iSortedIndex = aVariants.length;
			aVariants.some(function (oExistingVariant, index) {
				if (VariantsApplyUtil.compareVariants(oVariantEntry.instance, oExistingVariant.instance) < 0) {
					iSortedIndex = index;
					return true;
				}
			});
			return iSortedIndex;
		},

		/**
		 * Finds the responsible variant management control for a given control.
		 * A prerequisite for this to work is that the variant management control is reachable via the <code>getParent</code> function.
		 *
		 * @param {sap.ui.core.Control} oControl - Control instance
		 * @param {string[]} [aVMControlIds] - Array of variant management control IDs. If not given the IDs are derived from the DOM structure.
		 * @param {boolean} [bUseStaticArea=false] - If flag is set to true then the static area is used to determine the variant management control
		 * @returns {string} The ID of the responsible variant management control
		 */
		getRelevantVariantManagementControlId: function(oControl, aVMControlIds, bUseStaticArea) {
			var oAssociatedControls = {};
			if (!aVMControlIds || !aVMControlIds.length) {
				aVMControlIds = getVariantManagementControlIds(oControl, bUseStaticArea);
			}
			var aAssociatedControlIds = aVMControlIds.reduce(function(aCurrentControlIds, sVMControlId) {
				var oVMControl = Core.byId(sVMControlId);
				// there could be additional VMControl Ids that are not yet available
				if (oVMControl) {
					var aForControls = oVMControl.getFor();
					aForControls.forEach(function(sControlId) {
						oAssociatedControls[sControlId] = sVMControlId;
					});
					aCurrentControlIds = aCurrentControlIds.concat(aForControls);
				}
				return aCurrentControlIds;
			}, []);

			var sAssociatedVMControlId = getAssociatedControlId(aAssociatedControlIds, oControl);
			return oAssociatedControls[sAssociatedVMControlId];
		},

		belongsToVariantManagement: function(oElement) {
			var aVMControlIds = getVariantManagementControlIds(oElement);
			return !!VariantsApplyUtil.getRelevantVariantManagementControlId(oElement, aVMControlIds);
		},

		getAllVariantManagementControlIds: function(oElement) {
			return getVariantManagementControlIds(oElement);
		}
	};

	return VariantsApplyUtil;
});