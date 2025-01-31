sap.ui.define(["sap/ui/core/mvc/ViewType", 'sap/uxap/BlockBase'], function (ViewType, BlockBase) {
	"use strict";

	var GoalsBlock = BlockBase.extend("sap.uxap.sample.SharedBlocks.goals.GoalsBlock", {
		metadata: {
			views: {
				Collapsed: {
					viewName: "sap.uxap.sample.SharedBlocks.goals.GoalsBlock",
					type: ViewType.HTML
				},
				Expanded: {
					viewName: "sap.uxap.sample.SharedBlocks.goals.GoalsBlock",
					type: ViewType.HTML
				}
			}
		}
	});
	return GoalsBlock;
});
