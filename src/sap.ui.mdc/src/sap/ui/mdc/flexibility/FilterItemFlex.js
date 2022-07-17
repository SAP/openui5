/*!
 * ${copyright}
 */

sap.ui.define(['./ItemBaseFlex'], function(ItemBaseFlex) {
	"use strict";

	/**
	 * FilterBar-control-specific change handler that enables the storing of changes in the layered repository of the flexibility services.
	 *
	 * @alias sap.ui.mdc.flexibility.FilterBar
	 * @author SAP SE
	 * @version ${version}
	 */

	var oFilterItemFlex = Object.assign({}, ItemBaseFlex);

	oFilterItemFlex.findItem = function(oModifier, aFilters, sName) {
		return aFilters.find(function(oFilter) {

			var sFieldPath;

			if (oModifier.targets === "jsControlTree") {
				sFieldPath = oFilter.getFieldPath();
			} else {

				//TODO: needs to be reworked. Expected a name like property on FilterItem
				sFieldPath = oFilter.getAttribute("conditions");
				if (sFieldPath) {
					var iEnd, iStart = sFieldPath.indexOf("/conditions/");
					if (iStart >= 0) {
						sFieldPath = sFieldPath.slice(iStart + 12);
						iEnd = sFieldPath.indexOf("}");
						if (iEnd >= 0) {
							sFieldPath = sFieldPath.slice(0, iEnd);
						}
					}
				}
			}

			return sFieldPath === sName;
		});
	};

	oFilterItemFlex.beforeApply = function(oControl) {
		if (oControl.applyConditionsAfterChangesApplied) {
			oControl.applyConditionsAfterChangesApplied();
		}
	};

	oFilterItemFlex.addFilter = oFilterItemFlex.createAddChangeHandler();
	oFilterItemFlex.removeFilter = oFilterItemFlex.createRemoveChangeHandler();
	oFilterItemFlex.moveFilter = oFilterItemFlex.createMoveChangeHandler();

	return oFilterItemFlex;
}, /* bExport= */true);
