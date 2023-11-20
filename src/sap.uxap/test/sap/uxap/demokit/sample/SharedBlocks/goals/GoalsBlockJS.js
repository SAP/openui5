sap.ui.define(["sap/uxap/BlockBase"], function (BlockBase) {
	"use strict";

	var GoalsBlock = BlockBase.extend("sap.uxap.sample.SharedBlocks.goals.GoalsBlock", {
		metadata: {
			views: {
				Collapsed: {
					viewName: "module:sap/uxap/sample/SharedBlocks/goals/GoalsBlockView"
				},
				Expanded: {
					viewName: "module:sap/uxap/sample/SharedBlocks/goals/GoalsBlockView"
				}
			}
		}
	});
	return GoalsBlock;
});
