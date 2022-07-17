/*!
 * ${copyright}
 */

sap.ui.define(['./FilterItemFlex', './ConditionFlex', './PropertyInfoFlex'], function(FilterItemFlex, ConditionFlex, PropertyInfoFlex) {
	"use strict";

	/**
	 * FilterBar-control-specific change handler that enables the storing of changes in the layered repository of the flexibility services.
	 *
	 * @alias sap.ui.mdc.flexibility.FilterBar
	 * @author SAP SE
	 * @version ${version}
	 */

	return {
		"addFilter": FilterItemFlex.createAddChangeHandler(),
		"removeFilter": FilterItemFlex.createRemoveChangeHandler(),
		"moveFilter": FilterItemFlex.createMoveChangeHandler(),
		"addCondition": ConditionFlex.addCondition,
		"removeCondition": ConditionFlex.removeCondition,
		"addPropertyInfo": PropertyInfoFlex.addPropertyInfo
	};
}, /* bExport= */true);
