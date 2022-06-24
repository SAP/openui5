/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/changeHandler/HideControl",
	"sap/ui/fl/changeHandler/UnhideControl",
    "sap/m/p13n/handler/xConfigHandler"
], function(HideControl, UnhideControl, xConfigHandler) {
	"use strict";

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
			property: "visible"
		}),
		removeItem: xConfigHandler.createHandler({
			aggregationBased: true,
			property: "visible"
		}),
		moveItem: xConfigHandler.createHandler({
			aggregationBased: true,
			property: "position"
		}),
        addSort: xConfigHandler.createHandler({
			property: "sortConditions"
		}),
        removeSort: xConfigHandler.createHandler({
			property: "sortConditions"
		}),
		addGroup: xConfigHandler.createHandler({
			property: "groupConditions"
		}),
        removeGroup: xConfigHandler.createHandler({
			property: "groupConditions"
		})
	};
}, /* bExport= */ true);