/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/changeHandler/HideControl",
	"sap/ui/fl/changeHandler/UnhideControl",
	"sap/m/p13n/handler/xConfigHandler",
	"sap/m/p13n/modules/xConfigAPI"
], function(HideControl, UnhideControl, xConfigHandler, xConfigAPI) {
	"use strict";


	function getCurrentItemState(oControl, oPriorAggregationConfig, sAffectedAggregation, oChange, mPropertyBag) {
		return xConfigAPI.getCurrentItemState(oControl, {propertyBag: mPropertyBag, changeType: oChange.getChangeType()}, oPriorAggregationConfig, sAffectedAggregation);
	}

	function getCurrentSortState(oControl, oPriorAggregationConfig, sAffectedAggregation, oChange, mPropertyBag) {
		const sProperty = "sortConditions";
		return xConfigAPI.getCurrentSortState(oControl, {propertyBag: mPropertyBag, changeType: oChange.getChangeType()}, oPriorAggregationConfig, sProperty);
	}

	return {
        "hideControl": "default",
		"unhideControl": "default",
        createItem: {
			layers: {
				USER: true
			},
			changeHandler: UnhideControl
		},
		addItem: xConfigHandler.createHandler({
			aggregationBased: true,
			property: "visible",
			getCurrentState: getCurrentItemState
		}),
		removeItem: xConfigHandler.createHandler({
			aggregationBased: true,
			property: "visible",
			getCurrentState: getCurrentItemState
		}),
		moveItem: xConfigHandler.createHandler({
			aggregationBased: true,
			property: "position",
			getCurrentState: getCurrentItemState
		}),
		addSort: xConfigHandler.createHandler({
			property: "sortConditions",
			additionalProperties: ["descending"],
			getCurrentState: getCurrentSortState
		}),
		removeSort: xConfigHandler.createHandler({
			property: "sortConditions",
			additionalProperties: ["descending"],
			getCurrentState: getCurrentSortState
		}),
		moveSort: xConfigHandler.createHandler({
			property: "sortConditions",
			additionalProperties: ["descending"],
			getCurrentState: getCurrentSortState
		}),
		addCondition: xConfigHandler.createHandler({
			property: "filterConditions"
		}),
		removeCondition: xConfigHandler.createHandler({
			property: "filterConditions"
		}),
		addGroup: xConfigHandler.createHandler({
			property: "groupConditions"
		}),
        removeGroup: xConfigHandler.createHandler({
			property: "groupConditions"
		}),
		moveGroup: xConfigHandler.createHandler({
			property: "groupConditions"
		}),
		setColumnWidth: xConfigHandler.createHandler({
			aggregationBased: true,
			aggregation: "columns",
			property: "width"
		})
	};
}, /* bExport= */ true);