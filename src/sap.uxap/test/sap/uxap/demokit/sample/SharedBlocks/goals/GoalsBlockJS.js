sap.ui.define(["sap/ui/core/library", 'sap/uxap/BlockBase'], function (coreLibrary, BlockBase) {
	"use strict";

	var ViewType = coreLibrary.mvc.ViewType;

	var GoalsBlock = BlockBase.extend("sap.uxap.sample.SharedBlocks.goals.GoalsBlock", {
		metadata: {
			views: {
				Collapsed: {
					viewName: "sap.uxap.sample.SharedBlocks.goals.GoalsBlock",
					type: ViewType.JS
				},
				Expanded: {
					viewName: "sap.uxap.sample.SharedBlocks.goals.GoalsBlock",
					type: ViewType.JS
				}
			}
		}
	});
	return GoalsBlock;
});
